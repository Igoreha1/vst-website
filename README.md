# Next.js + Backend Project

Это полноценный проект с Next.js фронтендом и PHP бэкендом.

## Структура проекта

├── frontend/ # Next.js приложение
│ ├── app/ # App Router директория
│ ├── components/ # React компоненты
│ ├── public/ # Статические файлы
│ ├── middleware.ts # Next.js middleware
│ └── ...
├── backend/ # PHP бэкенд
│ ├── config/ # Конфигурационные файлы
│ ├── lib/ # Библиотеки
│ ├── vendor/ # Composer зависимости
│ └── composer.json # PHP зависимости
└── ...


## Предварительные требования

### Для фронтенда (Windows/Linux/Mac):
- **Node.js**
- **npm** или **yarn** или **pnpm**

### Для бэкенда (Windows):
- **XAMPP** или **WAMP**
- **PHP** 8.0+
- **Composer**

### Для бэкенда (Linux):
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install php php-curl php-mysql composer

# CentOS/RHEL
sudo yum install php php-curl php-mysql composer

1. Клонирование репозитория

git clone <your-repo-url>
cd <project-folder>

2. Настройка фронтенда (Next.js)

# Переход в директорию фронтенда (если отдельная папка)
# cd frontend

# Установка зависимостей
npm install
# или
yarn install
# или
pnpm install

# Запуск в режиме разработки
npm run dev
# или
yarn dev
# или
pnpm dev

3. Настройка бэкенда (PHP)
На Windows:
Установите XAMPP или WAMP

Скопируйте папку backend в C:\xampp\htdocs\ (для XAMPP)

Запустите Apache через панель управления XAMPP

Откройте: http://localhost/backend

На Linux:

# Переход в директорию бэкенда
cd backend

# Установка PHP зависимостей через Composer
composer install

# Запуск встроенного PHP сервера
php -S localhost:8000

Бэкенд будет доступен по адресу: http://localhost:8000

4. Настройка переменных окружения

# База данных
DATABASE_URL="your_database_connection_string"

# API ключи
NEXT_PUBLIC_API_URL="http://localhost:8000/api"
API_SECRET_KEY="your_secret_key"

# Другие настройки
NODE_ENV="development"

Продакшен сборка

Фронтенд:

npm run build
npm start

Полезные команды:

# Разработка
npm run dev          # Запуск dev сервера
npm run build        # Сборка проекта
npm run start        # Запуск production сборки

# Анализ
npm run lint         # Проверка кода ESLint

# Бэкенд
composer install     # Установка PHP зависимостей
composer update      # Обновление зависимостей

~/Projects/preddiplom/vst-website/backend$ php -S localhost:8000 -t public

~/Projects/preddiplom/vst-website$ npm run dev