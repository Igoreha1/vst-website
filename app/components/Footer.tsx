import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="footer bg-white border-t border-gray-200">
      {/* Primary Footer */}
      <div className="footer-primary container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Column 1 - Shop & Service */}
          <div className="column1">
            <span className="footer-column-headline block text-lg font-semibold text-gray-900 mb-4">
              Магазин &amp; Сервис
            </span>
            <ul className="space-y-3">
              <li>
                <Link href="/shop-info" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Информация о магазине &amp; FAQ
                </Link>
              </li>
              <li>
                <Link href="/account" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Мой аккаунт &amp; история заказов
                </Link>
              </li>
              <li>
                <Link href="/dealers" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Найти дилера
                </Link>
              </li>
              <li>
                <Link href="/download" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Sonic Access
                </Link>
              </li>
              <li>
                <Link href="/support" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Техподдержка
                </Link>
              </li>
            </ul>
            
            <div className="mt-6">
              <Link href="/shipping" className="freeshipping inline-flex items-center space-x-2 text-blue-600 hover:text-blue-700">
                <span className="freeshipping__text font-medium">
                  Бесплатная доставка*
                </span>
                <span className="freeshipping__logos">
                  <svg className="w-6 h-4" viewBox="0 0 24 16" fill="currentColor">
                    <path d="M8 0L0 8l8 8 8-8-8-8zm0 12l-4-4 4-4 4 4-4 4z"/>
                  </svg>
                </span>
              </Link>
            </div>
          </div>

          {/* Column 2 - Connect & Newsletter */}
          <div className="column2">
            <span className="footer-column-headline block text-lg font-semibold text-gray-900 mb-4">
              Свяжитесь с нами
            </span>
            
            {/* Social Links */}
            <ul className="connect-container flex space-x-4 mb-6">
              <li>
                <a href="#" className="connect-facebook text-gray-600 hover:text-blue-600 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </li>
              <li>
                <a href="#" className="connect-twitter text-gray-600 hover:text-blue-400 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </a>
              </li>
              <li>
                <a href="#" className="connect-youtube text-gray-600 hover:text-red-600 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                  </svg>
                </a>
              </li>
              <li>
                <a href="#" className="connect-instagram text-gray-600 hover:text-pink-600 transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C8.396 0 7.987.016 6.756.072 5.526.127 4.712.333 3.995.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.139C.333 4.856.127 5.67.072 6.9.016 8.13 0 8.54 0 12.017c0 3.476.016 3.887.072 5.117.055 1.23.261 2.044.558 2.761.306.789.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.717.297 1.531.503 2.761.558 1.23.056 1.641.072 5.117.072 3.476 0 3.887-.016 5.117-.072 1.23-.055 2.044-.261 2.761-.558.79-.306 1.459-.717 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.297-.717.503-1.531.558-2.761.056-1.23.072-1.641.072-5.117 0-3.476-.016-3.887-.072-5.117-.055-1.23-.261-2.044-.558-2.761-.306-.789-.717-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.717-.297-1.531-.503-2.761-.558C15.869.016 15.458 0 12.017 0zm0 2.158c3.413 0 3.808.012 5.026.067 1.155.052 1.78.243 2.197.403.547.213.937.467 1.347.877.41.41.664.8.877 1.347.16.417.351 1.042.403 2.197.055 1.218.067 1.613.067 5.026 0 3.413-.012 3.808-.067 5.026-.052 1.155-.243 1.78-.403 2.197-.213.547-.467.937-.877 1.347-.41.41-.8.664-1.347.877-.417.16-1.042.351-2.197.403-1.218.055-1.613.067-5.026.067-3.413 0-3.808-.012-5.026-.067-1.155-.052-1.78-.243-2.197-.403-.547-.213-.937-.467-1.347-.877-.41-.41-.664-.8-.877-1.347-.16-.417-.351-1.042-.403-2.197-.055-1.218-.067-1.613-.067-5.026 0-3.413.012-3.808.067-5.026.052-1.155.243-1.78.403-2.197.213-.547.467-.937.877-1.347.41-.41.8-.664 1.347-.877.417-.16 1.042-.351 2.197-.403 1.218-.055 1.613-.067 5.026-.067z"/>
                    <path d="M12.017 5.838a6.18 6.18 0 1 0 0 12.358 6.18 6.18 0 0 0 0-12.358zm0 10.177a3.997 3.997 0 1 1 0-7.994 3.997 3.997 0 0 1 0 7.994z"/>
                    <circle cx="18.406" cy="5.595" r="1.439"/>
                  </svg>
                </a>
              </li>
            </ul>

            <span className="footer-column-headline block text-lg font-semibold text-gray-900 mb-4 mt-8">
              Подписка на рассылку
            </span>
            
            {/* Newsletter Form */}
            <div className="newsletter-container">
              <form className="space-y-4">
                <div className="form-group">
                  <div className="flex space-x-2">
                    <input 
                      type="email" 
                      placeholder="Введите email адрес"
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      required
                    />
                    <button 
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      ПОДПИСАТЬСЯ
                    </button>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-gray-700">Темы для музыкантов</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="checkbox" defaultChecked className="rounded text-blue-600 focus:ring-blue-500" />
                    <span className="text-gray-700">Темы для продюсеров</span>
                  </label>
                </div>
              </form>
            </div>
          </div>

          {/* Column 3 - Company */}
          <div className="column3">
            <span className="footer-column-headline block text-lg font-semibold text-gray-900 mb-4">
              Компания
            </span>
            <ul className="space-y-3">
              <li>
                <Link href="/blog" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Блог
                </Link>
              </li>
              <li>
                <Link href="/company" className="text-gray-600 hover:text-blue-600 transition-colors">
                  О компании
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Контакты
                </Link>
              </li>
              <li>
                <Link href="/careers" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Карьера
                </Link>
              </li>
              <li>
                <Link href="/press" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Пресс-центр
                </Link>
              </li>
              <li>
                <Link href="/education" className="text-gray-600 hover:text-blue-600 transition-colors">
                  Образование
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Secondary Footer */}
      <div className="footer-secondary border-t border-gray-200 py-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="column1 text-gray-600 text-sm">
              © 2024 Sonic VST Company
            </div>
            
            <div className="column2 flex flex-wrap justify-center space-x-4 text-sm">
              <Link href="/legal" className="text-gray-600 hover:text-blue-600 transition-colors">
                Правовая информация
              </Link>
              <span className="text-gray-400">|</span>
              <Link href="/privacy" className="text-gray-600 hover:text-blue-600 transition-colors">
                Политика конфиденциальности
              </Link>
              <span className="text-gray-400">|</span>
              <button className="text-gray-600 hover:text-blue-600 transition-colors">
                Настройки приватности
              </button>
              <span className="text-gray-400">|</span>
              <Link href="/contact" className="text-gray-600 hover:text-blue-600 transition-colors">
                Контакты
              </Link>
            </div>
            
            <div className="column3 lang-switcher">
              <div className="flex space-x-2 text-sm">
                <span className="text-gray-600">Русский</span>
                <span className="text-gray-400">|</span>
                <Link href="/en" className="text-gray-600 hover:text-blue-600 transition-colors">
                  English
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}