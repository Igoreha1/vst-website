import Link from 'next/link'
import MainLayout from '../components/MainLayout'

export default function About() {
  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container mx-auto px-4 max-w-6xl">
          {/* Хлебные крошки */}
          <nav className="mb-8">
            <Link href="/" className="text-blue-600 hover:text-blue-700 transition-colors font-medium">
              ← На главную
            </Link>
          </nav>

          {/* Заголовок */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              О плагине NeoVoice
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Инновационный аудио плагин для современных музыкантов и продюсеров
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            {/* Что это */}
            <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900">🎵 Что это?</h2>
              </div>
              <p className="text-gray-700 text-lg leading-relaxed">
                NeoVoice — это профессиональный аудио плагин нового поколения, созданный для музыкантов, 
                продюсеров и звукоинженеров. Мы объединили передовые технологии обработки звука 
                с интуитивным интерфейсом для максимально творческого workflow.
              </p>
            </section>

            {/* Изображение */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <img 
                src="https://i.pinimg.com/originals/c9/4c/e4/c94ce46e3ab91678a204d5807a2a869d.jpg"
                alt="Музыкальная студия"
                className="w-full h-64 object-cover"
              />
            </div>
          </div>

          {/* Особенности */}
          <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">🌟 Ключевые особенности</h2>
              <p className="text-gray-600 text-lg">Все что нужно для профессиональной работы со звуком</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[
                {
                  icon: '🎛️',
                  title: 'VST3 поддержка',
                  description: 'Полная совместимость со всеми современными DAW'
                },
                {
                  icon: '⚡',
                  title: 'Низкая нагрузка',
                  description: 'Оптимизированные алгоритмы с минимальным потреблением CPU'
                },
                {
                  icon: '🎨',
                  title: 'Интуитивный интерфейс',
                  description: 'Красивый и понятный дизайн для быстрой работы'
                },
                {
                  icon: '🔧',
                  title: 'Гибкость настроек',
                  description: 'Множество параметров для тонкой настройки звука'
                },
                {
                  icon: '🔄',
                  title: 'Регулярные обновления',
                  description: 'Постоянное улучшение и добавление новых функций'
                },
                {
                  icon: '🌐',
                  title: 'Кроссплатформенность',
                  description: 'Работает на Windows, macOS и Linux'
                }
              ].map((feature, index) => (
                <div key={index} className="text-center p-6 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors">
                  <div className="text-3xl mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Технологии и Галерея */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">🔬 Технологии</h2>
              <div className="space-y-4">
                {[
                  'Искусственный интеллект для анализа звука',
                  'Продвинутые алгоритмы сведения',
                  'Реальное время обработки',
                  'Многопоточная архитектура',
                  'Поддержка высоких разрешений (до 192kHz)'
                ].map((tech, index) => (
                  <div key={index} className="flex items-center">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                    <span className="text-gray-700">{tech}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <img 
                src="https://i.pinimg.com/originals/21/ee/c9/21eec917256bb97e479f520fb5f303ba.jpg"
                alt="Аудио оборудование"
                className="rounded-2xl shadow-sm h-48 object-cover"
              />
              <img 
                src="https://avatars.mds.yandex.net/i?id=a1dd4ac0bea95d6df96269a632cf487d_l-5220575-images-thumbs&n=13"
                alt="Музыкальное производство"
                className="rounded-2xl shadow-sm h-48 object-cover"
              />
            </div>
          </div>

          {/* Контакты */}
          <section className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-lg text-white p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">📞 Свяжитесь с нами</h2>
            <p className="text-blue-100 text-lg mb-6 max-w-2xl mx-auto">
              Готовы начать работать с NeoVoice? Наша команда поддержки всегда готова помочь
            </p>
            <div className="space-y-3">
              <div className="text-xl font-semibold">📧 support@neovoice.com</div>
              <div className="text-xl font-semibold">🌐 neovoice.ru</div>
              <div className="text-xl font-semibold">💬 Онлайн поддержка 24/7</div>
            </div>
            <div className="mt-8 flex justify-center space-x-4">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors">
                Написать нам
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Документация
              </button>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  )
}