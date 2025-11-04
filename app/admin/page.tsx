// app/admin/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface AdminStats {
  totalUsers: number
  totalLicenses: number
  activeSubscriptions: number
  recentRegistrations: number
}

export default function AdminPanel() {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const router = useRouter()

  useEffect(() => {
    checkAdminAuth()
    loadStats()
  }, [])

  const checkAdminAuth = async () => {
    const adminToken = document.cookie.includes('admin_token')
    if (!adminToken) {
      router.push('/admin-auth')
    }
  }

  const loadStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/admin/stats', {
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
                <span className="text-xl font-bold text-gray-900">Sonic VST Admin</span>
              </div>
              
              {/* Навигация между сайтом и админкой */}
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
                  onClick={() => setActiveTab('dashboard')}
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
              <span className="text-sm text-gray-600">Администратор</span>
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

          {/* Вкладки админки */}
          <div className="border-t border-gray-200">
            <nav className="flex space-x-8">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'dashboard'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Дашборд
              </button>
              <button
                onClick={() => setActiveTab('users')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Пользователи
              </button>
              <button
                onClick={() => setActiveTab('licenses')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'licenses'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Лицензии
              </button>
              <button
                onClick={() => setActiveTab('subscriptions')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'subscriptions'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Подписки
              </button>
            </nav>
          </div>
        </div>
      </header>

      {/* Основной контент */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
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
                    onClick={() => setActiveTab('users')}
                    className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
                  >
                    <div className="font-semibold text-gray-900">Добавить пользователя</div>
                    <div className="text-sm text-gray-500 mt-1">Создать нового пользователя</div>
                  </button>

                  <button 
                    onClick={() => setActiveTab('licenses')}
                    className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
                  >
                    <div className="font-semibold text-gray-900">Сгенерировать лицензии</div>
                    <div className="text-sm text-gray-500 mt-1">Создать пакет лицензий</div>
                  </button>

                  <button className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left">
                    <div className="font-semibold text-gray-900">Настройки системы</div>
                    <div className="text-sm text-gray-500 mt-1">Общие настройки платформы</div>
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === 'users' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Управление пользователями</h1>
              <p className="text-gray-600">Здесь будет список пользователей и управление ими</p>
            </div>
          )}

          {activeTab === 'licenses' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Управление лицензиями</h1>
              <p className="text-gray-600">Здесь будет управление лицензиями</p>
            </div>
          )}

          {activeTab === 'subscriptions' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">Управление подписками</h1>
              <p className="text-gray-600">Здесь будет управление подписками</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}