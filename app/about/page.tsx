import Link from 'next/link'
import MainLayout from '../components/MainLayout'
export default function About() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/" className="text-blue-400 hover:text-blue-300 mb-8 inline-block">
          ← На главную
        </Link>

        <h1 className="text-4xl md:text-5xl font-bold mb-8">О плагине Sonic VST</h1>
        
        <div className="space-y-8">
          <section className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">🎵 Что это?</h2>
            <p className="text-gray-300 text-lg">
              Sonic VST — это профессиональный аудио плагин, созданный для музыкантов, 
              продюсеров и звукоинженеров. Мы предлагаем уникальные алгоритмы обработки 
              звука с минимальной нагрузкой на процессор.
            </p>
          </section>

          <section className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">🌟 Особенности</h2>
            <ul className="text-gray-300 space-y-2 list-disc list-inside">
              <li>Поддержка VST3 формата</li>
              <li>Низкая загрузка CPU</li>
              <li>Интуитивный пользовательский интерфейс</li>
              <li>Поддержка всех популярных DAW</li>
              <li>Регулярные обновления</li>
            </ul>
          </section>

          <section className="bg-gray-800 rounded-lg p-6">
            <h2 className="text-2xl font-semibold mb-4">📞 Контакты</h2>
            <p className="text-gray-300">
              По вопросам сотрудничества и поддержки: <br />
              Email: support@sonicvst.com
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}