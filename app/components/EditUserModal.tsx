// components/EditUserModal.tsx
'use client'

import { useState, useEffect } from 'react'

interface User {
  id: number
  email: string
  username: string
  created_at: string
  status: string
  license_key: string | null
  subscription_status: string | null
}

interface EditUserModalProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
  onSave: (userData: any) => Promise<void>
  mode: 'create' | 'edit'
}

export default function EditUserModal({ user, isOpen, onClose, onSave, mode }: EditUserModalProps) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    status: 'active',
    subscription_status: 'active'
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [isVisible, setIsVisible] = useState(false)

  // Анимация открытия/закрытия
  useEffect(() => {
    if (isOpen) {
      requestAnimationFrame(() => {
        setIsVisible(true)
      })
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  // Сброс формы при открытии/закрытии
  useEffect(() => {
    if (isOpen && mode === 'create') {
      // Сброс формы для создания
      setFormData({
        email: '',
        username: '',
        password: '',
        status: 'active',
        subscription_status: 'active'
      })
      setError('')
    } else if (isOpen && mode === 'edit' && user) {
      // Заполнение формы для редактирования
      setFormData({
        email: user.email,
        username: user.username,
        password: '', // Пароль не показываем при редактировании
        status: user.status,
        subscription_status: user.subscription_status || 'active'
      })
      setError('')
    }
  }, [isOpen, mode, user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (mode === 'create' && !formData.password) {
      setError('Пароль обязателен для нового пользователя')
      return
    }

    setIsLoading(true)
    setError('')

    try {
      const userData = mode === 'edit' 
        ? { id: user!.id, ...formData }
        : formData

      await onSave(userData)
      onClose()
    } catch (err) {
      setError('Ошибка при сохранении')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  if (!isOpen && !isVisible) return null

  return (
    <>
      {/* Затемненный размытый задний фон с анимацией */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 z-40 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleBackdropClick}
      />
      
      {/* Модальное окно с анимацией */}
      <div 
        className={`fixed inset-0 flex items-center justify-center p-4 z-50 transition-all duration-300 ${
          isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}
        onClick={handleBackdropClick}
      >
        <div 
          className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto border border-gray-200 transform transition-all duration-300"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-6 py-5 border-b border-gray-200 bg-white rounded-t-xl">
            <h2 className="text-xl font-semibold text-gray-900">
              {mode === 'create' ? 'Добавить пользователя' : 'Редактировать пользователя'}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-5 bg-white">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-pulse">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200"
                placeholder="user@example.com"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Имя пользователя *
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200"
                placeholder="username"
              />
            </div>

            {mode === 'create' && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Пароль *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200"
                  placeholder="Минимум 6 символов"
                  minLength={6}
                />
                <p className="text-xs text-gray-500">Пароль должен содержать минимум 6 символов</p>
              </div>
            )}

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Статус
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200"
              >
                <option value="active">Активен</option>
                <option value="inactive">Неактивен</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Статус подписки
              </label>
              <select
                name="subscription_status"
                value={formData.subscription_status}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-colors duration-200"
              >
                <option value="active">Активна</option>
                <option value="expired">Истекла</option>
                <option value="canceled">Отменена</option>
              </select>
            </div>

            {mode === 'edit' && user && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 transition-colors duration-200">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Информация о пользователе</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <p>
                    <strong>ID:</strong> {user.id}
                  </p>
                  <p>
                    <strong>Дата регистрации:</strong> {new Date(user.created_at).toLocaleDateString('ru-RU')}
                  </p>
                  <p>
                    <strong>Лицензия:</strong> {user.license_key || 'Нет лицензии'}
                  </p>
                </div>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
              >
                Отмена
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 transition-all duration-200 transform hover:scale-105"
              >
                {isLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {mode === 'create' ? 'Создание...' : 'Сохранение...'}
                  </span>
                ) : (
                  mode === 'create' ? 'Создать' : 'Сохранить'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}