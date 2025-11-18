// app/support/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import MainLayout from '../components/MainLayout'
import { apiClient } from '../../lib/api'

interface SupportChat {
  id: number
  subject: string
  status: string
  created_at: string
  updated_at: string
  user_name: string
  unread_count: number
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

export default function Support() {
  const [chats, setChats] = useState<SupportChat[]>([])
  const [activeChat, setActiveChat] = useState<SupportChat | null>(null)
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [isCreatingChat, setIsCreatingChat] = useState(false)
  const [newChatSubject, setNewChatSubject] = useState('')
  const [newChatMessage, setNewChatMessage] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
    loadChats()
  }, [])

  const checkAuth = async () => {
    if (!apiClient.isAuthenticated()) {
      router.push('/')
      return
    }
    
    // Убедимся что данные пользователя загружены
    if (!apiClient.userData) {
      try {
        const response = await fetch('http://localhost:8000/api/auth/me', {
          headers: {
            'Authorization': `Bearer ${apiClient.token}`
          }
        })
        
        if (response.ok) {
          const data = await response.json()
          apiClient.userData = data.user // сохраняем данные пользователя
        }
      } catch (error) {
        console.error('Failed to load user data:', error)
      }
    }
  }

  const loadChats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/support/chats', {
        headers: {
          'Authorization': `Bearer ${apiClient.token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setChats(data.chats)
      }
    } catch (error) {
      console.error('Failed to load chats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMessages = async (chatId: number) => {
    try {
      const response = await fetch(`http://localhost:8000/api/support/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${apiClient.token}`
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setMessages(data.messages)
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const createChat = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newChatSubject.trim() || !newChatMessage.trim()) return

    try {
      const response = await fetch('http://localhost:8000/api/support/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.token}`
        },
        body: JSON.stringify({
          subject: newChatSubject,
          message: newChatMessage
        })
      })

      if (response.ok) {
        setIsCreatingChat(false)
        setNewChatSubject('')
        setNewChatMessage('')
        loadChats()
      }
    } catch (error) {
      console.error('Failed to create chat:', error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !activeChat) return

    // Создаем временное сообщение для мгновенного отображения
    const tempMessage: SupportMessage = {
      id: Date.now(), // временный ID
      message: newMessage,
      user_id: apiClient.userData?.id || 0, // ID текущего пользователя
      username: apiClient.userData?.username || 'Вы',
      email: apiClient.userData?.email || '',
      created_at: new Date().toISOString(),
      is_read: false
    }

    // Сразу добавляем сообщение в список
    setMessages(prev => [...prev, tempMessage])
    setNewMessage('')

    try {
      const response = await fetch(`http://localhost:8000/api/support/chats/${activeChat.id}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiClient.token}`
        },
        body: JSON.stringify({
          message: newMessage
        })
      })

      if (response.ok) {
        // Перезагружаем сообщения чтобы получить правильные данные с сервера
        loadMessages(activeChat.id)
        loadChats() // Обновляем список чатов чтобы обновить unread_count и updated_at
      } else {
        // Если ошибка, убираем временное сообщение
        setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
        console.error('Failed to send message')
      }
    } catch (error) {
      // Если ошибка, убираем временное сообщение
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id))
      console.error('Failed to send message:', error)
    }
  }

  const selectChat = (chat: SupportChat) => {
    setActiveChat(chat)
    loadMessages(chat.id)
  }

  // Функция для определения, является ли сообщение от текущего пользователя
  const isCurrentUserMessage = (message: SupportMessage) => {
    return message.user_id === (apiClient.userData?.id || 0)
  }

  // Временно добавим отладочный вывод
  useEffect(() => {
    if (activeChat && messages.length > 0) {
      console.log('Current user ID:', apiClient.userData?.id)
      console.log('Messages:', messages.map(m => ({
        id: m.id,
        message: m.message.substring(0, 20) + '...',
        user_id: m.user_id,
        isCurrentUser: m.user_id === (apiClient.userData?.id || 0)
      })))
    }
  }, [messages, activeChat])

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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="p-6 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">Техническая поддержка</h1>
              <p className="text-gray-600 mt-2">Здесь вы можете задать вопросы нашей технической поддержке</p>
            </div>

            <div className="flex h-[600px]">
              {/* Список чатов */}
              <div className="w-1/3 border-r border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <button
                    onClick={() => setIsCreatingChat(true)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-semibold transition-colors"
                  >
                    + Новый запрос
                  </button>
                </div>

                <div className="overflow-y-auto h-full">
                  {chats.map(chat => (
                    <div
                      key={chat.id}
                      onClick={() => selectChat(chat)}
                      className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        activeChat?.id === chat.id ? 'bg-blue-50 border-blue-200' : ''
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
                  ))}
                  
                  {chats.length === 0 && (
                    <div className="p-8 text-center text-gray-500">
                      <div className="text-4xl mb-4">💬</div>
                      <p>У вас пока нет обращений в поддержку</p>
                      <button
                        onClick={() => setIsCreatingChat(true)}
                        className="mt-4 text-blue-600 hover:text-blue-700 font-semibold"
                      >
                        Создать первое обращение
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Область чата */}
              <div className="w-2/3 flex flex-col">
                {isCreatingChat ? (
                  <div className="p-6 flex-1">
                    <h2 className="text-xl font-semibold mb-4">Новое обращение в поддержку</h2>
                    <form onSubmit={createChat} className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Тема обращения
                        </label>
                        <input
                          type="text"
                          value={newChatSubject}
                          onChange={(e) => setNewChatSubject(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Опишите кратко вашу проблему"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Подробное описание
                        </label>
                        <textarea
                          value={newChatMessage}
                          onChange={(e) => setNewChatMessage(e.target.value)}
                          rows={6}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Опишите вашу проблему подробно..."
                          required
                        />
                      </div>
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Отправить
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsCreatingChat(false)}
                          className="border border-gray-300 hover:border-gray-400 text-gray-700 px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Отмена
                        </button>
                      </div>
                    </form>
                  </div>
                ) : activeChat ? (
                  <>
                    <div className="p-4 border-b border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-lg font-semibold">{activeChat.subject}</h2>
                          <p className="text-sm text-gray-500">
                            Создан {new Date(activeChat.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          activeChat.status === 'open' ? 'bg-green-100 text-green-800' :
                          activeChat.status === 'closed' ? 'bg-gray-100 text-gray-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {activeChat.status === 'open' ? 'Открыт' : activeChat.status === 'closed' ? 'Закрыт' : 'В ожидании'}
                        </span>
                      </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      {messages.map(message => (
                        <div
                          key={message.id}
                          className={`flex ${isCurrentUserMessage(message) ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              isCurrentUserMessage(message)
                                ? 'bg-blue-600 text-white' // Сообщение текущего пользователя - синее справа
                                : 'bg-gray-200 text-gray-900' // Сообщение от поддержки - серое слева
                            }`}
                          >
                            {isCurrentUserMessage(message) && (
                              <p className="text-xs font-semibold mb-1 text-blue-100">Вы</p>
                            )}
                            {!isCurrentUserMessage(message) && (
                              <p className="text-xs font-semibold mb-1 text-gray-600">Поддержка</p>
                            )}
                            <p className="text-sm">{message.message}</p>
                            <p className={`text-xs mt-1 ${
                              isCurrentUserMessage(message)
                                ? 'text-blue-100'
                                : 'text-gray-500'
                            }`}>
                              {new Date(message.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 border-t border-gray-200">
                      <form onSubmit={sendMessage} className="flex space-x-3">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Введите ваше сообщение..."
                        />
                        <button
                          type="submit"
                          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                        >
                          Отправить
                        </button>
                      </form>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <div className="text-4xl mb-4">👆</div>
                      <p>Выберите чат из списка или создайте новый</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}