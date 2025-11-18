import Link from 'next/link'
import Image from 'next/image'
import MainLayout from './components/MainLayout'

export default function Home() {
  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-gray-50 to-white text-gray-900 py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
            NeoVoice
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-gray-600 max-w-2xl mx-auto">
            Искусственный интеллект для профессионального звука
          </p>
          <p className="text-lg md:text-xl mb-8 text-gray-500 max-w-3xl mx-auto">
            Первый VST плагин с нейросетевыми алгоритмами, который автоматически улучшает 
            вокал и инструменты в реальном времени
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/download" 
              className="bg-blue-600 hover:bg-blue-700 px-8 py-4 rounded-lg text-lg font-semibold text-white transition-colors shadow-lg hover:shadow-xl"
            >
              Скачать бесплатно
            </Link>
            <Link 
              href="/about" 
              className="border border-gray-300 hover:border-blue-400 px-8 py-4 rounded-lg text-lg font-semibold text-gray-700 hover:text-blue-600 transition-colors"
            >
              Узнать больше
            </Link>
          </div>
        </div>
      </section>

      {/* AI Features Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Мощь искусственного интеллекта
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Нейросеть анализирует и улучшает звук автоматически
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* AI Demo Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-8 shadow-lg">
                <div className="flex justify-between items-center mb-6">
                  <div className="text-sm text-gray-500">ДО</div>
                  <div className="text-sm font-semibold text-green-600">ПОСЛЕ</div>
                </div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-300 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400 animate-pulse" style={{width: '70%'}}></div>
                  </div>
                  <div className="h-4 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" style={{width: '95%'}}></div>
                  <div className="h-3 bg-gray-300 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400 animate-pulse" style={{width: '60%'}}></div>
                  </div>
                  <div className="h-3 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full" style={{width: '90%'}}></div>
                </div>
                <div className="mt-6 text-center text-sm text-gray-500">
                  AI автоматически выравнивает волновые формы
                </div>
              </div>
            </div>

            {/* AI Features List */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <span className="text-2xl">🎤</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Умный вокальный процессор</h3>
                  <p className="text-gray-600">
                    Автоматически убирает шумы, выравнивает громкость и добавляет 
                    профессиональную компрессию к вокалу
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-purple-100 p-3 rounded-lg">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Нейросетевая эквализация</h3>
                  <p className="text-gray-600">
                    AI анализирует спектр и автоматически настраивает EQ для 
                    идеального звучания в миксе
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <span className="text-2xl">⚡</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">Реальное время</h3>
                  <p className="text-gray-600">
                    Работает с задержкой - идеально для живого вокала 
                    и стриминга
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voice Processing Demo */}
      <section className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4 text-gray-900">
            Профессиональный вокальный процессор
          </h2>
          <p className="text-xl text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Превратите обычный вокал в студийный звук за один клик
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="text-4xl mb-4">🎚️</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Авто-компрессия</h3>
                <p className="text-gray-600">
                  Интеллектуальная компрессия подстраивается под динамику вашего голоса
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="text-4xl mb-4">🎛️</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Шумоподавление</h3>
                <p className="text-gray-600">
                  Убирает фоновые шумы, вентиляцию и артефакты записи
                </p>
              </div>
            </div>

            <div className="text-center">
              <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
                <div className="text-4xl mb-4">🎵</div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">Тональная коррекция</h3>
                <p className="text-gray-600">
                  Легкая коррекция интонации без эффекта авто-тюна
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* DAW Integration */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
              Работает во всех популярных DAW
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Совместимость с более чем 30 цифровыми аудио рабочими станциями
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-6 items-center justify-items-center opacity-60">
            <div className="text-2xl font-bold text-gray-700">FL Studio</div>
            <div className="text-2xl font-bold text-gray-700">Ableton</div>
            <div className="text-2xl font-bold text-gray-700">Cubase</div>
            <div className="text-2xl font-bold text-gray-700">Logic Pro</div>
            <div className="text-2xl font-bold text-gray-700">Pro Tools</div>
            <div className="text-2xl font-bold text-gray-700">Reaper</div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-gradient-to-br from-blue-50 to-purple-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900">
            Отзывы музыкантов
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-600 mb-4">
                "Этот плагин изменил мой подход к сведению вокала. 
                Теперь я трачу на 80% меньше времени!"
              </p>
              <div className="font-semibold text-gray-900">- Алексей, продюсер</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-600 mb-4">
                "Идеально для живых стримов. AI реально убирает все шумы 
                без потери качества голоса."
              </p>
              <div className="font-semibold text-gray-900">- Мария, вокалистка</div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="text-yellow-400 text-2xl mb-4">★★★★★</div>
              <p className="text-gray-600 mb-4">
                "Как начинающий, я не разбираюсь в сложных настройках. 
                NeoVoice делает всю работу за меня."
              </p>
              <div className="font-semibold text-gray-900">- Дмитрий, музыкант</div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-gray-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
            Начните создавать профессиональный звук сегодня
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Присоединяйтесь к 50,000+ музыкантов, которые уже используют NeoVoice
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/download" 
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-4 rounded-lg text-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Скачать бесплатно
            </Link>
            <Link 
              href="/features" 
              className="border border-gray-600 hover:border-gray-400 px-8 py-4 rounded-lg text-lg font-semibold text-gray-300 hover:text-white transition-colors"
            >
              Все возможности
            </Link>
          </div>
          
          <p className="text-gray-400 text-sm mt-6">
            Бесплатная версия включает все основные функции • Без водяных знаков
          </p>
        </div>
      </section>
    </MainLayout>
  )
}