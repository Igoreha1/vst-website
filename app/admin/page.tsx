// app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import EditUserModal from '../components/EditUserModal'

interface AdminStats {
  totalUsers: number
  totalLicenses: number
  activeSubscriptions: number
  recentRegistrations: number
}

interface User {
  id: number
  email: string
  username: string
  created_at: string
  status: string
  license_key: string | null
  subscription_status: string | null
}

interface SupportChat {
  id: number
  subject: string
  user_name: string
  user_email: string
  status: string
  unread_count: number
  updated_at: string
  user_id: number
}

interface SupportMessage {
  id: number
  message: string
  user_id: number
  username: string
  email: string
  created_at: string
  is_read: boolean
}

interface AdminInfo {
  id: number
  email: string
  username: string
}

export default function AdminPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [users, setUsers] = useState<User[]>([])
  const [supportChats, setSupportChats] = useState<SupportChat[]>([])
  const [activeSupportChat, setActiveSupportChat] = useState<SupportChat | null>(null)
  const [supportMessages, setSupportMessages] = useState<SupportMessage[]>([])
  const [supportMessage, setSupportMessage] = useState('')
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(false)
  const [supportLoading, setSupportLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [activeRightPanel, setActiveRightPanel] = useState<string | null>(null)
  const [editModalOpen, setEditModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('edit')
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
  }, [])

  useEffect(() => {
    if (activeTab === 'users') {
      loadUsers()
    } else if (activeTab === 'support') {
      loadSupportChats()
    }
  }, [activeTab])

  const checkAdminAuth = async () => {
    const adminToken = document.cookie.includes('admin_token')
    if (!adminToken) {
      router.push('/admin-auth')
      return
    }
    await loadAdminInfo()
    await loadStats()
  }

  const loadAdminInfo = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/me', {
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setAdminInfo(data.admin)
      } else {
        console.error('Failed to load admin info:', response.status)
        router.push('/admin-auth')
      }
    } catch (error) {
      console.error('Failed to load admin info:', error)
      router.push('/admin-auth')
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/stats', {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      }
    } catch (error) {
      console.error('Failed to load stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadUsers = async () => {
    setUsersLoading(true)
    try {
      const adminToken = getAdminToken()
      
      if (!adminToken) {
        router.push('/admin-auth')
        return
      }

      const response = await fetch('http://localhost:8000/api/admin/users', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setUsers(data.users || [])
      } else if (response.status === 401) {
        router.push('/admin-auth')
      }
    } catch (error) {
      console.error('Failed to load users:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  // Функция для загрузки чатов поддержки
  const loadSupportChats = async () => {
    setSupportLoading(true)
    try {
      const response = await fetch('http://localhost:8000/api/admin/support/chats', {
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Support chats loaded:', data.chats)
        setSupportChats(data.chats || [])
      } else {
        console.error('Failed to load support chats:', response.status)
      }
    } catch (error) {
      console.error('Failed to load support chats:', error)
    } finally {
      setSupportLoading(false)
    }
  }

  // Функция для загрузки сообщений - ИСПРАВЛЕННАЯ
  const loadSupportMessages = async (chatId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/admin/support/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${getAdminToken()}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('Support messages loaded:', data.messages)
        setSupportMessages(data.messages || [])
      } else {
        console.error('Failed to load support messages:', response.status)
      }
    } catch (error) {
      console.error('Failed to load support messages:', error)
    }
  }

  // Функция для отправки ответа
  const sendSupportResponse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supportMessage.trim() || !activeSupportChat) return

    try {
      const response = await fetch(`http://localhost:8000/api/admin/support/chats/${activeSupportChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          message: supportMessage
        })
      })

      if (response.ok) {
        setSupportMessage('')
        loadSupportMessages(activeSupportChat.id)
        loadSupportChats() // Обновляем список чатов для счетчика непрочитанных
      } else {
        console.error('Failed to send response:', response.status)
      }
    } catch (error) {
      console.error('Failed to send response:', error)
    }
  }

  // Функция изменения статуса чата
  const toggleChatStatus = async (chat: SupportChat) => {
    try {
      const newStatus = chat.status === 'open' ? 'closed' : 'open'
      const response = await fetch(`http://localhost:8000/api/admin/support/chats/${chat.id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAdminToken()}`
        },
        body: JSON.stringify({
          status: newStatus
        })
      })

      if (response.ok) {
        loadSupportChats()
        if (activeSupportChat?.id === chat.id) {
          setActiveSupportChat({ ...chat, status: newStatus })
        }
      }
    } catch (error) {
      console.error('Failed to update chat status:', error)
    }
  }

  const getAdminToken = () => {
    return document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_token='))
      ?.split('=')[1]
  }

  const handleLogout = () => {
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    router.push('/admin-auth')
  }

  const handleRightPanelClick = (panel: string) => {
    setActiveRightPanel(activeRightPanel === panel ? null : panel)
  }

  const handleTabClick = (tab: string) => {
    setActiveTab(tab)
    setActiveRightPanel(null)
  }

  // Функция открытия создания пользователя
  const handleCreateUser = () => {
    setModalMode('create')
    setSelectedUser(null)
    setEditModalOpen(true)
  }

  // Функция открытия редактирования пользователя
  const handleEditUser = (user: User) => {
    setModalMode('edit')
    setSelectedUser(user)
    setEditModalOpen(true)
  }

  // Универсальная функция сохранения
  const handleSaveUser = async (userData: any) => {
    try {
      const adminToken = getAdminToken()
      
      if (modalMode === 'create') {
        // Создание пользователя
        const response = await fetch('http://localhost:8000/api/admin/users', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to create user')
        }
      } else {
        // Редактирование пользователя
        const response = await fetch(`http://localhost:8000/api/admin/users/${userData.id}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(userData)
        })

        if (!response.ok) {
          throw new Error('Failed to update user')
        }
      }

      // Обновляем список пользователей
      await loadUsers()
      console.log(`Пользователь ${modalMode === 'create' ? 'создан' : 'обновлен'} успешно`)
      
    } catch (error) {
      console.error(`Error ${modalMode === 'create' ? 'creating' : 'updating'} user:`, error)
      throw error
    }
  }

  // Функция блокировки/разблокировки пользователя
  const handleToggleUserStatus = async (user: User) => {
    if (!confirm(`Вы уверены, что хотите ${user.status === 'active' ? 'заблокировать' : 'активировать'} пользователя ${user.username}?`)) {
      return
    }

    try {
      const adminToken = getAdminToken()
      const newStatus = user.status === 'active' ? 'inactive' : 'active'
      
      const response = await fetch(`http://localhost:8000/api/admin/users/${user.id}/status`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus })
      })

      if (response.ok) {
        await loadUsers() // Обновляем список
        console.log(`Статус пользователя изменен на: ${newStatus}`)
      }
    } catch (error) {
      console.error('Error toggling user status:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getStatusBadge = (status: string) => {
    const styles = {
      active: 'bg-green-100 text-green-800 border border-green-200',
      inactive: 'bg-red-100 text-red-800 border border-red-200'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
        styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border border-gray-200'
      }`}>
        {status === 'active' ? 'Активен' : 'Неактивен'}
      </span>
    )
  }

  const getSubscriptionBadge = (status: string | null) => {
    if (!status) return (
      <span className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200 whitespace-nowrap">
        Нет подписки
      </span>
    )
    
    const styles = {
      active: 'bg-green-100 text-green-800 border border-green-200',
      expired: 'bg-red-100 text-red-800 border border-red-200',
      canceled: 'bg-yellow-100 text-yellow-800 border border-yellow-200'
    }
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
        styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border border-gray-200'
      }`}>
        {status === 'active' ? 'Активна' : 
         status === 'expired' ? 'Истекла' : 
         status === 'canceled' ? 'Отменена' : status}
      </span>
    )
  }

  // Функция для определения типа сообщения
  const isAdminMessage = (message: SupportMessage) => {
    return adminInfo && message.user_id === adminInfo.id
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Загрузка админской панели...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Хедер админки */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg"></div>
                <span className="text-xl font-bold text-gray-900">NeoVoice Admin</span>
              </div>
              
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                <a
                  href="/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-white transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  <span>Сайт</span>
                </a>
                <button
                  onClick={() => handleTabClick('dashboard')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2 ${
                    activeTab === 'dashboard' 
                      ? 'bg-blue-600 text-white shadow-sm' 
                      : 'text-gray-700 hover:text-blue-600 hover:bg-white'
                  }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  <span>Администрирование</span>
                </button>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-600">Администратор: {adminInfo?.username}</span>
              <button
                onClick={handleLogout}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Выйти</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Основной контент с правой панелью */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="flex gap-6">
          {/* Основной контент */}
          <div className="flex-1">
            <div className="px-4 py-6 sm:px-0">
              
              {/* Контент для разных вкладок */}
              {activeTab === 'dashboard' && (
                <>
                  <h1 className="text-2xl font-bold text-gray-900 mb-8">Панель управления</h1>

                  {/* Статистика */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-2xl text-blue-600">👥</span>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</div>
                          <div className="text-sm text-gray-500">Пользователей</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-2xl text-green-600">🔑</span>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{stats?.totalLicenses || 0}</div>
                          <div className="text-sm text-gray-500">Лицензий</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-2xl text-purple-600">📊</span>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{stats?.activeSubscriptions || 0}</div>
                          <div className="text-sm text-gray-500">Активных подписок</div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
                          <span className="text-2xl text-orange-600">🆕</span>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-gray-900">{stats?.recentRegistrations || 0}</div>
                          <div className="text-sm text-gray-500">Новых регистраций</div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Быстрые действия */}
                  <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Быстрые действия</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <button 
                        onClick={() => handleTabClick('users')}
                        className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                      >
                        <div className="font-semibold text-gray-900">Добавить пользователя</div>
                        <div className="text-sm text-gray-500 mt-1">Создать нового пользователя</div>
                      </button>

                      <button 
                        onClick={() => handleTabClick('licenses')}
                        className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
                      >
                        <div className="font-semibold text-gray-900">Сгенерировать лицензии</div>
                        <div className="text-sm text-gray-500 mt-1">Создать пакет лицензий</div>
                      </button>

                      <button 
                        onClick={() => handleTabClick('support')}
                        className="p-4 border border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors text-left"
                      >
                        <div className="font-semibold text-gray-900">Поддержка</div>
                        <div className="text-sm text-gray-500 mt-1">Обращения пользователей</div>
                      </button>
                    </div>
                  </div>
                </>
              )}

              {activeTab === 'users' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <h1 className="text-2xl font-bold text-gray-900">Управление пользователями</h1>
                      <button 
                        onClick={handleCreateUser}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center space-x-2 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        <span>Добавить пользователя</span>
                      </button>
                    </div>
                  </div>

                  {usersLoading ? (
                    <div className="p-8 text-center">
                      <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <p className="mt-4 text-gray-600">Загрузка пользователей...</p>
                    </div>
                  ) : (
                    <div className="p-6">
                      {users.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="text-gray-400 text-6xl mb-4">👥</div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">Пользователи не найдены</h3>
                          <p className="text-gray-600">В системе еще нет зарегистрированных пользователей</p>
                          <button 
                            onClick={handleCreateUser}
                            className="mt-4 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                          >
                            Создать первого пользователя
                          </button>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
                          {users.map((user) => (
                            <div key={user.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                              <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3 flex-1 min-w-0">
                                  <div className="flex-shrink-0 h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <span className="text-blue-600 font-semibold text-lg">
                                      {user.username.charAt(0).toUpperCase()}
                                    </span>
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 truncate">{user.username}</h3>
                                    <p className="text-gray-500 text-sm truncate">{user.email}</p>
                                    <div className="flex items-center space-x-2 mt-2">
                                      {getStatusBadge(user.status)}
                                      {getSubscriptionBadge(user.subscription_status)}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex space-x-2 ml-4">
                                  <button 
                                    onClick={() => handleEditUser(user)}
                                    className="text-blue-600 hover:text-blue-900 p-1 transition-colors"
                                    title="Редактировать"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => handleToggleUserStatus(user)}
                                    className={user.status === 'active' ? 'text-red-600 hover:text-red-900 p-1 transition-colors' : 'text-green-600 hover:text-green-900 p-1 transition-colors'}
                                    title={user.status === 'active' ? 'Заблокировать' : 'Активировать'}
                                  >
                                    {user.status === 'active' ? (
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                      </svg>
                                    ) : (
                                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                                      </svg>
                                    )}
                                  </button>
                                </div>
                              </div>
                              <div className="mt-3 flex items-center justify-between text-sm text-gray-500">
                                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded truncate max-w-[200px]">
                                  {user.license_key || 'Нет лицензии'}
                                </span>
                                <span>{formatDate(user.created_at)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'licenses' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Управление лицензиями</h1>
                    <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold">
                      + Сгенерировать лицензии
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">🔑</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Система лицензий</h3>
                    <p className="text-gray-600">Управление лицензионными ключами и их распределением</p>
                  </div>
                </div>
              )}

              {activeTab === 'subscriptions' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Управление подписками</h1>
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold">
                      + Создать подписку
                    </button>
                  </div>
                  <div className="border border-gray-200 rounded-lg p-8 text-center">
                    <div className="text-gray-400 text-6xl mb-4">📊</div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Подписки и тарифы</h3>
                    <p className="text-gray-600">Управление подписками пользователей и тарифными планами</p>
                  </div>
                </div>
              )}

              {/* Вкладка поддержки - ИСПРАВЛЕННАЯ */}
              {activeTab === 'support' && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="p-6 border-b border-gray-200">
                    <h1 className="text-2xl font-bold text-gray-900">Поддержка пользователей</h1>
                    <p className="text-gray-600 mt-2">Управление обращениями в техническую поддержку</p>
                  </div>

                  <div className="flex h-[600px]">
                    {/* Список чатов */}
                    <div className="w-1/3 border-r border-gray-200">
                      <div className="overflow-y-auto h-full">
                        {supportLoading ? (
                          <div className="p-8 text-center">
                            <div className="w-6 h-6 border-2 border-orange-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="mt-4 text-gray-600">Загрузка чатов...</p>
                          </div>
                        ) : supportChats.length === 0 ? (
                          <div className="text-center py-12">
                            <div className="text-gray-400 text-4xl mb-4">💬</div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">Нет активных чатов</h3>
                            <p className="text-gray-600">Обращения в поддержку отсутствуют</p>
                          </div>
                        ) : (
                          supportChats.map(chat => (
                            <div
                              key={chat.id}
                              onClick={() => {
                                setActiveSupportChat(chat)
                                loadSupportMessages(chat.id)
                              }}
                              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                                activeSupportChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
                              }`}
                            >
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="font-semibold text-gray-900 truncate">{chat.subject}</h3>
                                {chat.unread_count > 0 && (
                                  <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                                    {chat.unread_count}
                                  </span>
                                )}
                              </div>
                              <div className="text-sm text-gray-500 mb-2">
                                От: {chat.user_name} ({chat.user_email})
                              </div>
                              <div className="flex justify-between text-sm text-gray-500">
                                <span className={`px-2 py-1 rounded-full text-xs ${
                                  chat.status === 'open' ? 'bg-green-100 text-green-800' :
                                  chat.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {chat.status === 'open' ? 'Открыт' : chat.status === 'closed' ? 'Закрыт' : 'В ожидании'}
                                </span>
                                <span>{new Date(chat.updated_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Область чата */}
                    <div className="w-2/3 flex flex-col">
                      {activeSupportChat ? (
                        <>
                          <div className="p-4 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                              <div>
                                <h2 className="text-lg font-semibold">{activeSupportChat.subject}</h2>
                                <p className="text-sm text-gray-500">
                                  От: {activeSupportChat.user_name} ({activeSupportChat.user_email})
                                </p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => toggleChatStatus(activeSupportChat)}
                                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    activeSupportChat.status === 'open' 
                                      ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                                  }`}
                                >
                                  {activeSupportChat.status === 'open' ? 'Закрыть' : 'Открыть'}
                                </button>
                                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  activeSupportChat.status === 'open' ? 'bg-green-100 text-green-800' :
                                  activeSupportChat.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {activeSupportChat.status === 'open' ? 'Открыт' : activeSupportChat.status === 'closed' ? 'Закрыт' : 'В ожидании'}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {supportMessages.length === 0 ? (
                              <div className="text-center py-12">
                                <div className="text-gray-400 text-4xl mb-4">💬</div>
                                <p className="text-gray-600">Нет сообщений в этом чате</p>
                              </div>
                            ) : (
                              supportMessages.map(message => (
                                <div
                                  key={message.id}
                                  // ИСПРАВЛЕННАЯ ЛОГИКА: используем функцию isAdminMessage
                                  className={`flex ${isAdminMessage(message) ? 'justify-start' : 'justify-end'}`}
                                >
                                  <div
                                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                                      isAdminMessage(message)
                                        ? 'bg-blue-600 text-white' // Сообщение от админа - синее слева
                                        : 'bg-gray-200 text-gray-900' // Сообщение от пользователя - серое справа
                                    }`}
                                  >
                                    <p className="text-sm">{message.message}</p>
                                    <p className={`text-xs mt-1 ${
                                      isAdminMessage(message)
                                        ? 'text-blue-100'
                                        : 'text-gray-500'
                                    }`}>
                                      {new Date(message.created_at).toLocaleString()}
                                      {isAdminMessage(message) && ' (Админ)'}
                                    </p>
                                  </div>
                                </div>
                              ))
                            )}
                          </div>

                          <div className="p-4 border-t border-gray-200">
                            <form onSubmit={sendSupportResponse} className="flex space-x-3">
                              <input
                                type="text"
                                value={supportMessage}
                                onChange={(e) => setSupportMessage(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Введите ответ..."
                              />
                              <button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                              >
                                Ответить
                              </button>
                            </form>
                          </div>
                        </>
                      ) : (
                        <div className="flex-1 flex items-center justify-center text-gray-500">
                          <div className="text-center">
                            <div className="text-4xl mb-4">💬</div>
                            <p>Выберите чат для просмотра</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Правая панель с кнопками */}
          <div className="w-80 flex-shrink-0">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Навигация</h3>
              
              <div className="space-y-2">
                {/* Дашборд */}
                <button
                  onClick={() => handleTabClick('dashboard')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    activeTab === 'dashboard'
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                      <span className="text-blue-600">📊</span>
                    </div>
                    <span className="font-medium">Дашборд</span>
                  </div>
                </button>

                {/* Пользователи */}
                <button
                  onClick={() => handleTabClick('users')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    activeTab === 'users'
                      ? 'border-green-500 bg-green-50 text-green-700'
                      : 'border-gray-200 hover:border-green-300 hover:bg-green-25'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                      <span className="text-green-600">👥</span>
                    </div>
                    <span className="font-medium">Пользователи</span>
                  </div>
                </button>

                {/* Лицензии */}
                <button
                  onClick={() => handleTabClick('licenses')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    activeTab === 'licenses'
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-200 hover:border-orange-300 hover:bg-orange-25'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                      <span className="text-orange-600">🔑</span>
                    </div>
                    <span className="font-medium">Лицензии</span>
                  </div>
                </button>

                {/* Подписки */}
                <button
                  onClick={() => handleTabClick('subscriptions')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    activeTab === 'subscriptions'
                      ? 'border-purple-500 bg-purple-50 text-purple-700'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-25'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                      <span className="text-purple-600">💎</span>
                    </div>
                    <span className="font-medium">Подписки</span>
                  </div>
                </button>

                {/* Поддержка */}
                <button
                  onClick={() => handleTabClick('support')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    activeTab === 'support'
                      ? 'border-red-500 bg-red-50 text-red-700'
                      : 'border-gray-200 hover:border-red-300 hover:bg-red-25'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
                      <span className="text-red-600">💬</span>
                    </div>
                    <span className="font-medium">Поддержка</span>
                    {supportChats.filter(chat => chat.unread_count > 0).length > 0 && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1 min-w-[20px] text-center">
                        {supportChats.filter(chat => chat.unread_count > 0).length}
                      </span>
                    )}
                  </div>
                </button>

                {/* Разделитель */}
                <div className="border-t border-gray-200 my-3"></div>

                {/* Кнопка Контент */}
                <button
                  onClick={() => handleRightPanelClick('content')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    activeRightPanel === 'content'
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                      : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-25'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                      <span className="text-indigo-600">📝</span>
                    </div>
                    <span className="font-medium">Контент</span>
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform ${
                      activeRightPanel === 'content' ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Кнопка Маркетинг */}
                <button
                  onClick={() => handleRightPanelClick('marketing')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    activeRightPanel === 'marketing'
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-gray-200 hover:border-pink-300 hover:bg-pink-25'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center">
                      <span className="text-pink-600">📢</span>
                    </div>
                    <span className="font-medium">Маркетинг</span>
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform ${
                      activeRightPanel === 'marketing' ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Кнопка Настройки */}
                <button
                  onClick={() => handleRightPanelClick('settings')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg border transition-colors ${
                    activeRightPanel === 'settings'
                      ? 'border-gray-500 bg-gray-50 text-gray-700'
                      : 'border-gray-200 hover:border-gray-300 hover:bg-gray-25'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <span className="text-gray-600">⚙️</span>
                    </div>
                    <span className="font-medium">Настройки</span>
                  </div>
                  <svg 
                    className={`w-4 h-4 transition-transform ${
                      activeRightPanel === 'settings' ? 'rotate-180' : ''
                    }`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Контент выпадающих панелей */}
              {activeRightPanel && (
                <div className="mt-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  {activeRightPanel === 'content' && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Управление контентом</h4>
                      <div className="space-y-2">
                        <button className="w-full text-left p-2 rounded hover:bg-white transition-colors">
                          📄 Статьи и блог
                        </button>
                        <button className="w-full text-left p-2 rounded hover:bg-white transition-colors">
                          🎵 Аудио демо
                        </button>
                        <button className="w-full text-left p-2 rounded hover:bg-white transition-colors">
                          📹 Видео уроки
                        </button>
                        <button className="w-full text-left p-2 rounded hover:bg-white transition-colors">
                          📚 Документация
                        </button>
                      </div>
                    </div>
                  )}

                  {activeRightPanel === 'marketing' && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Маркетинг</h4>
                      <div className="space-y-2">
                        <button className="w-full text-left p-2 rounded hover:bg-white transition-colors">
                          ✉️ Email рассылки
                        </button>
                        <button className="w-full text-left p-2 rounded hover:bg-white transition-colors">
                          📊 Аналитика
                        </button>
                        <button className="w-full text-left p-2 rounded hover:bg-white transition-colors">
                          🎯 Рекламные кампании
                        </button>
                        <button className="w-full text-left p-2 rounded hover:bg-white transition-colors">
                          📈 Отчеты по продажам
                        </button>
                      </div>
                    </div>
                  )}

                  {activeRightPanel === 'settings' && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Настройки системы</h4>
                      <div className="space-y-2">
                        <button className="w-full text-left p-2 rounded hover:bg-white transition-colors">
                          🔧 Общие настройки
                        </button>
                        <button className="w-full text-left p-2 rounded hover:bg-white transition-colors">
                          💳 Платежные системы
                        </button>
                        <button className="w-full text-left p-2 rounded hover:bg-white transition-colors">
                          🔐 Безопасность
                        </button>
                        <button className="w-full text-left p-2 rounded hover:bg-white transition-colors">
                          🌐 Интеграции API
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Модальное окно редактирования/создания пользователя */}
      <EditUserModal
        user={selectedUser}
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false)
          setSelectedUser(null)
        }}
        onSave={handleSaveUser}
        mode={modalMode}
      />
    </div>
  )
}