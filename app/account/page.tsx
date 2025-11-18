// app/account/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '../components/MainLayout'
import { apiClient } from '../../lib/api'

interface UserData {
  id: number
  email: string
  username: string
  created_at: string
  status: string
  avatar_url?: string
  license: {
    license_key: string
    status: string
  }
  subscription: {
    plan_type: string
    status: string
    expires_at: string
  }
}

export default function Account() {
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>('')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState<'success' | 'error'>('success')
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadUserData()
  }, [])

  const checkAuth = async () => {
    if (!apiClient.isAuthenticated()) {
      router.push('/')
      return
    }
  }

  const loadUserData = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${apiClient.token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        console.log('User data loaded:', data.user) // Для отладки
        setUserData(data.user)
        setFormData({
          username: data.user.username,
          email: data.user.email,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
        // Устанавливаем аватар если он есть
        if (data.user.avatar_url) {
          setAvatarPreview(`http://localhost:8000${data.user.avatar_url}`)
        }
      }
    } catch (error) {
      console.error('Failed to load user data:', error)
      showMessage('Ошибка загрузки данных', 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.type.startsWith('image/')) {
        showMessage('Пожалуйста, выберите изображение', 'error')
        return
      }

      if (file.size > 5 * 1024 * 1024) {
        showMessage('Размер файла не должен превышать 5MB', 'error')
        return
      }

      setAvatarFile(file)
      
      // Создаем превью
      const reader = new FileReader()
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadAvatar = async (file: File): Promise<string> => {
    const formData = new FormData()
    formData.append('avatar', file)

    const response = await fetch('http://localhost:8000/api/user/avatar', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiClient.token}`
      },
      body: formData
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || 'Failed to upload avatar')
    }

    const data = await response.json()
    return `http://localhost:8000${data.avatar_url}`
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      let finalAvatarUrl = avatarPreview

      // Если выбран новый файл, загружаем его
      if (avatarFile) {
        finalAvatarUrl = await uploadAvatar(avatarFile)
      }

      // Подготавливаем данные для обновления профиля
      const updateData: any = {
        username: formData.username,
        email: formData.email
      }

      // Добавляем аватар если он был загружен
      if (finalAvatarUrl && finalAvatarUrl.startsWith('http://localhost:8000')) {
        const url = new URL(finalAvatarUrl)
        updateData.avatar_url = url.pathname
      }

      // Добавляем пароль если он указан
      if (formData.newPassword) {
        if (formData.newPassword !== formData.confirmPassword) {
          showMessage('Новые пароли не совпадают', 'error')
          setIsSaving(false)
          return
        }
        if (!formData.currentPassword) {
          showMessage('Введите текущий пароль для изменения', 'error')
          setIsSaving(false)
          return
        }
        updateData.current_password = formData.currentPassword
        updateData.new_password = formData.newPassword
      }

      const response = await fetch('http://localhost:8000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.token}`
        },
        body: JSON.stringify(updateData)
      })

      if (response.ok) {
        const data = await response.json()
        setUserData(data.user)
        apiClient.userData = data.user
        setIsEditing(false)
        setAvatarFile(null)
        showMessage('Данные успешно обновлены', 'success')
        
        // Сбрасываем поля паролей
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }))
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to update profile')
      }
    } catch (error: any) {
      console.error('Failed to update profile:', error)
      showMessage(error.message || 'Ошибка обновления данных', 'error')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setAvatarFile(null)
    // Восстанавливаем оригинальный аватар
    if (userData?.avatar_url) {
      setAvatarPreview(`http://localhost:8000${userData.avatar_url}`)
    } else {
      setAvatarPreview('')
    }
    setFormData({
      username: userData?.username || '',
      email: userData?.email || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const showMessage = (text: string, type: 'success' | 'error') => {
    setMessage(text)
    setMessageType(type)
    setTimeout(() => setMessage(''), 5000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getInitials = (username: string) => {
    return username.charAt(0).toUpperCase()
  }

  const removeAvatar = () => {
    setAvatarPreview('')
    setAvatarFile(null)
  }

  if (isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-gray-600">Загрузка...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Мой аккаунт</h1>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                  >
                    Редактировать
                  </button>
                )}
              </div>
            </div>

            {message && (
              <div className={`mx-6 mt-4 p-4 rounded-lg ${
                messageType === 'success' 
                  ? 'bg-green-50 border border-green-200 text-green-800' 
                  : 'bg-red-50 border border-red-200 text-red-800'
              }`}>
                {message}
              </div>
            )}

            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Левая колонка - Аватар и основная информация */}
                <div className="lg:w-1/3">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="w-32 h-32 rounded-full bg-blue-100 flex items-center justify-center text-4xl font-bold text-blue-600 border-4 border-white shadow-lg overflow-hidden">
                          {avatarPreview ? (
                            <img 
                              src={avatarPreview} 
                              alt="Avatar" 
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                // Если изображение не загружается, показываем инициалы
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <span>{getInitials(userData?.username || '')}</span>
                          )}
                        </div>
                        {isEditing && (
                          <>
                            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleAvatarChange}
                              />
                            </label>
                            {avatarPreview && (
                              <button
                                onClick={removeAvatar}
                                className="absolute bottom-0 left-0 bg-red-600 text-white p-2 rounded-full cursor-pointer hover:bg-red-700 transition-colors shadow-lg"
                                title="Удалить аватар"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                      
                      <h2 className="mt-4 text-xl font-semibold text-gray-900">
                        {userData?.username}
                      </h2>
                      <p className="text-gray-600">{userData?.email}</p>
                      
                      <div className="mt-4 text-sm text-gray-500">
                        <p>Участник с {formatDate(userData?.created_at || '')}</p>
                      </div>
                    </div>

                    {/* Информация о лицензии */}
                    <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-2">Лицензия</h3>
                      <div className="flex items-center justify-between">
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono truncate flex-1 mr-2">
                          {userData?.license.license_key}
                        </code>
                        <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${
                          userData?.license.status === 'active' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userData?.license.status === 'active' ? 'Активна' : 'Неактивна'}
                        </span>
                      </div>
                    </div>

                    {/* Информация о подписке */}
                    <div className="mt-4 p-4 bg-white rounded-lg border border-gray-200">
                      <h3 className="font-semibold text-gray-900 mb-2">Подписка</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Тариф:</span>
                          <span className="font-semibold capitalize">
                            {userData?.subscription.plan_type || 'Free'}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Статус:</span>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            userData?.subscription.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {userData?.subscription.status === 'active' ? 'Активна' : 'Неактивна'}
                          </span>
                        </div>
                        {userData?.subscription.expires_at && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Истекает:</span>
                            <span className="text-sm">
                              {formatDate(userData.subscription.expires_at)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Правая колонка - Форма редактирования */}
                <div className="lg:w-2/3">
                  <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Имя пользователя
                        </label>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:text-gray-500"
                          required
                        />
                      </div>
                    </div>

                    {/* Поля для смены пароля */}
                    {isEditing && (
                      <div className="border-t border-gray-200 pt-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Смена пароля</h3>
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Текущий пароль
                            </label>
                            <input
                              type="password"
                              name="currentPassword"
                              value={formData.currentPassword}
                              onChange={handleInputChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="Введите текущий пароль"
                            />
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Новый пароль
                              </label>
                              <input
                                type="password"
                                name="newPassword"
                                value={formData.newPassword}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Введите новый пароль"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Подтвердите пароль
                              </label>
                              <input
                                type="password"
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Повторите новый пароль"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Кнопки действий */}
                    {isEditing && (
                      <div className="flex space-x-3 pt-6 border-t border-gray-200">
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-semibold transition-colors flex items-center space-x-2"
                        >
                          {isSaving && (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          )}
                          <span>{isSaving ? 'Сохранение...' : 'Сохранить'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleCancel}
                          className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Отмена
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}