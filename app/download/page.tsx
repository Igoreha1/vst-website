'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Download() {
  const [os, setOs] = useState<'windows' | 'mac' | 'linux'>('windows')

  const downloadLinks = {
    windows: {
      url: '/downloads/sonic-vst-windows.zip',
      size: '45 MB',
      version: 'v1.0.0',
      requirements: 'Windows 10+ • 64-bit'
    },
    mac: {
      url: '/downloads/sonic-vst-mac.dmg',
      size: '52 MB',
      version: 'v1.0.0',
      requirements: 'macOS 11+ • Apple Silicon/Intel'
    },
    linux: {
      url: '/downloads/sonic-vst-linux.tar.gz',
      size: '48 MB',
      version: 'v1.0.0',
      requirements: 'Ubuntu 18.04+ • 64-bit'
    }
  }

  const features = [
    '🎛️ Полная версия с AI обработкой',
    '🎤 Умный вокальный процессор', 
    '🤖 Нейросетевая эквализация',
    '⚡ Работа в реальном времени',
    '💾 Без водяных знаков',
    '🔄 Пожизненные обновления'
  ]

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-white text-gray-900 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            На главную
          </Link>
          <div className="text-sm text-gray-500">Sonic VST {downloadLinks[os].version}</div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Download Info */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
              <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-600">
                Скачать Sonic VST
              </h1>
              <p className="text-lg text-gray-600 mb-8">
                Бесплатный VST плагин с искусственным интеллектом для профессионального звука
              </p>

              {/* OS Selection */}
              <div className="mb-8">
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Выберите вашу ОС:</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {(['windows', 'mac', 'linux'] as const).map((platform) => (
                    <button
                      key={platform}
                      onClick={() => setOs(platform)}
                      className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                        os === platform 
                          ? 'border-blue-500 bg-blue-50 shadow-md transform scale-105' 
                          : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="text-3xl mb-2">
                        {platform === 'windows' && '💻'}
                        {platform === 'mac' && '🍎'}
                        {platform === 'linux' && '🐧'}
                      </div>
                      <div className={`font-semibold ${
                        os === platform ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {platform === 'windows' && 'Windows'}
                        {platform === 'mac' && 'macOS'}
                        {platform === 'linux' && 'Linux'}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Download Card */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 mb-6 border border-blue-100">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                      Sonic VST {downloadLinks[os].version}
                    </h3>
                    <div className="space-y-1 text-gray-600">
                      <div className="flex items-center space-x-2">
                        <span>📦 Размер: {downloadLinks[os].size}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>⚙️ {downloadLinks[os].requirements}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span>🎵 Формат: VST3, AU</span>
                      </div>
                    </div>
                  </div>
                  
                  <a 
                    href={downloadLinks[os].url}
                    download
                    className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 px-8 py-4 rounded-lg text-lg font-semibold text-white transition-all shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center justify-center space-x-2 min-w-[200px]"
                  >
                    <span>📥</span>
                    <span>Скачать бесплатно</span>
                  </a>
                </div>
              </div>

              {/* Installation Instructions */}
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Инструкция по установке:
                </h3>
                <div className="space-y-3 text-gray-700">
                  {os === 'windows' && (
                    <>
                      <div className="flex items-start space-x-3">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mt-0.5">1</span>
                        <p>Скачайте архив и распакуйте его</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mt-0.5">2</span>
                        <p>Скопируйте файл <code className="bg-gray-200 px-1 rounded">SonicVST.dll</code> в папку VST плагинов вашей DAW</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mt-0.5">3</span>
                        <p>Перезапустите DAW и найдите Sonic VST в списке плагинов</p>
                      </div>
                    </>
                  )}
                  {os === 'mac' && (
                    <>
                      <div className="flex items-start space-x-3">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mt-0.5">1</span>
                        <p>Откройте файл <code className="bg-gray-200 px-1 rounded">SonicVST.dmg</code></p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mt-0.5">2</span>
                        <p>Перетащите плагин в папку VST или Components</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mt-0.5">3</span>
                        <p>Перезапустите DAW и найдите Sonic VST в списке плагинов</p>
                      </div>
                    </>
                  )}
                  {os === 'linux' && (
                    <>
                      <div className="flex items-start space-x-3">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mt-0.5">1</span>
                        <p>Распакуйте архив: <code className="bg-gray-200 px-1 rounded">tar -xzf sonic-vst-linux.tar.gz</code></p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mt-0.5">2</span>
                        <p>Скопируйте файл <code className="bg-gray-200 px-1 rounded">SonicVST.so</code> в папку VST</p>
                      </div>
                      <div className="flex items-start space-x-3">
                        <span className="bg-blue-100 text-blue-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold mt-0.5">3</span>
                        <p>Перезапустите DAW и найдите Sonic VST в списке плагинов</p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Features & Info */}
          <div className="space-y-6">
            {/* Features List */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Что включено:</h3>
              <div className="space-y-3">
                {features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3 text-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* System Requirements */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-xl font-semibold mb-4 text-gray-900">Системные требования:</h3>
              <div className="space-y-2 text-gray-600">
                <div className="flex justify-between">
                  <span>ОЗУ:</span>
                  <span className="font-semibold">4 GB минимум</span>
                </div>
                <div className="flex justify-between">
                  <span>Процессор:</span>
                  <span className="font-semibold">2+ ядра</span>
                </div>
                <div className="flex justify-between">
                  <span>Задержка:</span>
                  <span className="font-semibold">512 samples</span>
                </div>
                <div className="flex justify-between">
                  <span>DAW:</span>
                  <span className="font-semibold">VST3 совместимые</span>
                </div>
              </div>
            </div>

            {/* Support Card */}
            <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-2xl shadow-lg border border-green-200 p-6">
              <h3 className="text-xl font-semibold mb-3 text-gray-900">Нужна помощь?</h3>
              <p className="text-gray-600 mb-4">
                Наша команда поддержки всегда готова помочь с установкой и настройкой
              </p>
              <Link 
                href="/support" 
                className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white font-semibold transition-colors inline-flex items-center space-x-2"
              >
                <span>💬</span>
                <span>Написать в поддержку</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}