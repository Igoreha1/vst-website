'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

interface User {
  id: number
  email: string
  username: string
  license?: {
    license_key: string
    status: string
  }
}

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isAccountOpen, setIsAccountOpen] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login')
  const [authForm, setAuthForm] = useState({
    email: '',
    username: '',
    password: ''
  })
  const accountRef = useRef<HTMLDivElement>(null)
  const searchRef = useRef<HTMLDivElement>(null)

  // Проверка авторизации при загрузке
  useEffect(() => {
    checkAuth()
  }, [])

  // Закрытие модальных окон при клике вне их
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountOpen(false)
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Проверка авторизации
  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me')
      if (response.ok) {
        const userData = await response.json()
        setUser(userData.user)
      }
    } catch (error) {
      console.error('Auth check failed:', error)
    }
  }

  // Обработка входа
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: authForm.email,
          password: authForm.password
        })
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        setIsAccountOpen(false)
        setAuthForm({ email: '', username: '', password: '' })
      } else {
        alert(data.error || 'Ошибка входа')
      }
    } catch (error) {
      alert('Ошибка сети')
    } finally {
      setIsLoading(false)
    }
  }

  // Обработка регистрации
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(authForm)
      })

      const data = await response.json()

      if (response.ok) {
        // После успешной регистрации автоматически входим
        const loginResponse = await fetch('/api/auth/login', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: authForm.email,
            password: authForm.password
          })
        })

        if (loginResponse.ok) {
          const loginData = await loginResponse.json()
          setUser(loginData.user)
          setIsAccountOpen(false)
          setAuthForm({ email: '', username: '', password: '' })
          alert('Регистрация прошла успешно! Ваш лицензионный ключ: ' + data.licenseKey)
        }
      } else {
        alert(data.error || 'Ошибка регистрации')
      }
    } catch (error) {
      alert('Ошибка сети')
    } finally {
      setIsLoading(false)
    }
  }

  // Выход из системы
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
      setUser(null)
      setIsAccountOpen(false)
    } catch (error) {
      console.error('Logout failed:', error)
    }
  }

  // Обработка отправки поиска
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      console.log('Search query:', searchQuery)
      setIsSearchOpen(false)
      setSearchQuery('')
    }
  }

  // Сброс формы авторизации
  const resetAuthForm = () => {
    setAuthForm({ email: '', username: '', password: '' })
  }

  return (
    <header className="header">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="header-logo-container">
            <Link href="/" className="header-logo flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg"></div>
              <span className="text-xl font-bold text-gray-900">
                Sonic VST
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <ul className="top-navi flex items-center space-x-8">
              <li>
                <Link 
                  href="/products" 
                  className="sub text-gray-700 hover:text-blue-600 transition-colors font-medium relative group"
                >
                  Продукты
                  <span className="navborder absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/download" 
                  className="sub text-gray-700 hover:text-blue-600 transition-colors font-medium relative group"
                >
                  Скачать
                  <span className="navborder absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/support" 
                  className="sub text-gray-700 hover:text-blue-600 transition-colors font-medium relative group"
                >
                  Поддержка
                  <span className="navborder absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                </Link>
              </li>
              <li>
                <Link 
                  href="/pricing" 
                  className="sub text-gray-700 hover:text-blue-600 transition-colors font-medium relative group"
                >
                  Цены
                  <span className="navborder absolute bottom-0 left-0 w-0 h-0.5 bg-blue-600 transition-all group-hover:w-full"></span>
                </Link>
              </li>
            </ul>
          </nav>

          {/* Right Section - Login, Cart, Search */}
          <div className="login-cart-search flex items-center space-x-6">
            
            {/* Community Icon */}
            <Link href="/community" className="text-gray-600 hover:text-blue-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 32 32" className="rounded-full hover:bg-gray-100 p-1">
                <title>Сообщество</title>
                <path fill="currentColor" fillRule="evenodd" d="M21.333 14.666v-1.333h2.666v8h-2V24l-3.555-2.667h-5.11v-2.666h7.999v-4ZM20 17.334h-6.445L10 20v-2.666H8V8h12v9.334Z" clipRule="evenodd"></path>
              </svg>
            </Link>

            {/* Support Icon */}
            <Link href="/support" className="text-gray-600 hover:text-blue-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 32 32" className="rounded-full hover:bg-gray-100 p-1">
                <title>Поддержка</title>
                <path fill="currentColor" d="m23.513 21.162-7.964-7.963a1.803 1.803 0 0 1-.522-1.41 3.518 3.518 0 0 0-1.019-2.764A3.498 3.498 0 0 0 11.526 8c-.338 0-.677.048-1.003.144l2.113 2.113c.23 1.06-1.306 2.612-2.378 2.378l-2.113-2.113A3.558 3.558 0 0 0 8 11.528a3.512 3.512 0 0 0 3.79 3.5c.521-.04 1.037.151 1.408.523l7.964 7.962a1.662 1.662 0 1 0 2.35-2.351ZM22.333 23a.666.666 0 1 1 0-1.333.666.666 0 0 1 0 1.333Zm-5.29-10.193 3.552-3.545a1.984 1.984 0 0 1 2.817 0 1.994 1.994 0 0 1 .006 2.823l-3.55 3.546-2.825-2.824Zm-2.353 6.12-3.485 3.457a2.195 2.195 0 0 0-.382.516l-.201.387-1.4.713-.555-.556.683-1.43.387-.202c.19-.1.374-.22.526-.372l3.485-3.457.942.944Z"></path>
              </svg>
            </Link>

            {/* Login/Account */}
            <div className="relative" ref={accountRef}>
              <button 
                onClick={() => setIsAccountOpen(!isAccountOpen)}
                className="text-gray-600 hover:text-blue-600 transition-colors p-1 rounded-full hover:bg-gray-100 flex items-center space-x-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 13 13">
                  <path d="M11.3 9.75c-1.87-.41-3.58-.81-2.77-2.36C11.05 2.6 9.18 0 6.5 0S2 2.68 4.47 7.39c.9 1.61-.89 1.95-2.76 2.36S.12 11 0 13h13c-.14-2 .17-2.76-1.7-3.25z" fill="currentColor"></path>
                </svg>
                {user && (
                  <span className="text-xs text-green-600 font-medium">✓</span>
                )}
              </button>

              {/* Account Modal */}
              {isAccountOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  {user ? (
                    // Пользователь авторизован
                    <>
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{user.username}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                            {user.license && (
                              <div className="text-xs text-green-600 mt-1">
                                Лицензия: {user.license.license_key}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <ul className="account-snippet-menu py-2">
                        <li className="border-b border-gray-100">
                          <Link 
                            href="/account" 
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsAccountOpen(false)}
                          >
                            <span>Мой аккаунт</span>
                          </Link>
                        </li>
                        <li className="border-b border-gray-100">
                          <Link 
                            href="/products/my-offers" 
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsAccountOpen(false)}
                          >
                            <span>Мои предложения</span>
                          </Link>
                        </li>
                        <li className="border-b border-gray-100">
                          <Link 
                            href="/my-account/my-products" 
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsAccountOpen(false)}
                          >
                            <span>Мои продукты</span>
                          </Link>
                        </li>
                        <li className="border-b border-gray-100">
                          <Link 
                            href="/my-account/account-settings" 
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsAccountOpen(false)}
                          >
                            <span>Настройки аккаунта</span>
                          </Link>
                        </li>
                        <li className="border-b border-gray-100">
                          <Link 
                            href="/account/orders" 
                            className="flex items-center px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
                            onClick={() => setIsAccountOpen(false)}
                          >
                            <span>История заказов</span>
                          </Link>
                        </li>
                        <li>
                          <button
                            onClick={handleLogout}
                            className="flex items-center w-full px-4 py-3 text-red-600 hover:bg-red-50 transition-colors text-left"
                          >
                            <span>Выйти</span>
                          </button>
                        </li>
                      </ul>
                    </>
                  ) : (
                    // Пользователь не авторизован
                    <>
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex space-x-2 mb-4">
                          <button
                            onClick={() => { setAuthMode('login'); resetAuthForm(); }}
                            className={`flex-1 py-2 font-semibold rounded-lg transition-colors ${
                              authMode === 'login' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Войти
                          </button>
                          <button
                            onClick={() => { setAuthMode('register'); resetAuthForm(); }}
                            className={`flex-1 py-2 font-semibold rounded-lg transition-colors ${
                              authMode === 'register' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            Регистрация
                          </button>
                        </div>

                        <form onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
                          <div className="space-y-3">
                            <div>
                              <input
                                type="email"
                                placeholder="Email"
                                value={authForm.email}
                                onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            {authMode === 'register' && (
                              <div>
                                <input
                                  type="text"
                                  placeholder="Имя пользователя"
                                  value={authForm.username}
                                  onChange={(e) => setAuthForm({...authForm, username: e.target.value})}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                  required
                                />
                              </div>
                            )}
                            <div>
                              <input
                                type="password"
                                placeholder="Пароль"
                                value={authForm.password}
                                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                              />
                            </div>
                            <button
                              type="submit"
                              disabled={isLoading}
                              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 rounded-lg font-semibold transition-colors"
                            >
                              {isLoading ? 'Загрузка...' : (authMode === 'login' ? 'Войти' : 'Зарегистрироваться')}
                            </button>
                          </div>
                        </form>
                      </div>

                      <div className="p-4 bg-gray-50 rounded-b-lg">
                        <div className="text-center text-sm text-gray-600">
                          {authMode === 'login' ? 'Новый пользователь?' : 'Уже есть аккаунт?'}{' '}
                          <button
                            onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                            className="text-blue-600 hover:text-blue-700 font-semibold"
                          >
                            {authMode === 'login' ? 'Зарегистрироваться' : 'Войти'}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Cart */}
            <Link href="/cart" className="cart-link relative text-gray-600 hover:text-blue-600 transition-colors">
              <span className="cart-link-icon">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="16" viewBox="0 0 15 13">
                  <path fill="currentColor" d="M4.58 9L2.11 1.64H.59L0 0h3.31l1.58 4.09H15L12.68 9h-8.1z"></path>
                  <ellipse fill="currentColor" cx="10.45" cy="11.5" rx="1.45" ry="1.5"></ellipse>
                  <ellipse fill="currentColor" cx="6.45" cy="11.5" rx="1.45" ry="1.5"></ellipse>
                </svg>
                <span className="cart-link-amount absolute -top-2 -right-2 bg-blue-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  0
                </span>
              </span>
            </Link>

            {/* Search */}
            <div className="relative" ref={searchRef}>
              <button 
                onClick={() => setIsSearchOpen(!isSearchOpen)}
                className="search-link text-gray-600 hover:text-blue-600 transition-colors"
              >
                <span className="search-link-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 13 13">
                    <path fill="currentColor" d="M13 11.67L9.06 7.73A4.84 4.84 0 0 0 10 5a5 5 0 0 0-5-5 5 5 0 0 0-5 5 5 5 0 0 0 5 5 4.88 4.88 0 0 0 2.72-.94L11.67 13zM2 5a3 3 0 1 1 3 3 3 3 0 0 1-3-3z"></path>
                  </svg>
                </span>
                <span className="search-link-text"></span>
              </button>

              {/* Search Modal */}
              {isSearchOpen && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                  <div className="p-4">
                    <form onSubmit={handleSearchSubmit} className="search-dropdown">
                      <div className="form-group mb-0">
                        <div className="relative">
                          <input 
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Поиск продуктов..."
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-10"
                            autoFocus
                          />
                          <button 
                            type="submit"
                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 13 13" className="w-4 h-4">
                              <path fill="currentColor" d="M13 11.67L9.06 7.73A4.84 4.84 0 0 0 10 5a5 5 0 0 0-5-5 5 5 0 0 0-5 5 5 5 0 0 0 5 5 4.88 4.88 0 0 0 2.72-.94L11.67 13zM2 5a3 3 0 1 1 3 3 3 3 0 0 1-3-3z"></path>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </form>
                    
                    {/* Quick Search Suggestions */}
                    <div className="mt-4">
                      <div className="text-xs text-gray-500 font-semibold mb-2">Популярные запросы:</div>
                      <div className="flex flex-wrap gap-2">
                        {['VST плагины', 'Аудио эффекты', 'Вокальный процессор', 'AI обработка', 'Сведение'].map((tag) => (
                          <button
                            key={tag}
                            onClick={() => {
                              setSearchQuery(tag)
                              // Можно автоматически выполнить поиск или просто заполнить поле
                            }}
                            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                          >
                            {tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden btn btn-menu ml-4 flex items-center space-x-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="button-text text-gray-700 font-medium">MENU</span>
              <span className="hamburger" id="hamburgerIcon">
                <span className="hamburger-slices block w-4 h-0.5 bg-gray-700 mb-1"></span>
                <span className="hamburger-slices block w-4 h-0.5 bg-gray-700 mb-1"></span>
                <span className="hamburger-slices block w-4 h-0.5 bg-gray-700"></span>
              </span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200 bg-white">
            <nav className="flex flex-col space-y-4">
              <Link 
                href="/products" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Продукты
              </Link>
              <Link 
                href="/download" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Скачать
              </Link>
              <Link 
                href="/support" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Поддержка
              </Link>
              <Link 
                href="/pricing" 
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                Цены
              </Link>
              <div className="pt-4 border-t border-gray-200">
                {user ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Вы вошли как {user.username}</div>
                    <button
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-700 transition-colors font-medium"
                    >
                      Выйти
                    </button>
                  </div>
                ) : (
                  <Link 
                    href="/login" 
                    className="text-gray-700 hover:text-blue-600 transition-colors font-medium py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Войти
                  </Link>
                )}
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}