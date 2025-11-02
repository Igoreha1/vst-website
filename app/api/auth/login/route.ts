import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'WZzfRPXHmbv8COqfJCINS1MxvDsoF2245nFLV0UGF/E=';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email и пароль обязательны' },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    
    try {
      // Поиск пользователя
      const [users] = await connection.execute(
        'SELECT * FROM users WHERE email = ?',
        [email]
      );

      const user = (users as any[])[0];
      
      if (!user) {
        return NextResponse.json(
          { error: 'Пользователь не найден' },
          { status: 401 }
        );
      }

      // Проверка пароля
      const isPasswordValid = await bcrypt.compare(password, user.password);
      
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Неверный пароль' },
          { status: 401 }
        );
      }

      // Создание JWT токена
      const token = jwt.sign(
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Сохранение сессии в БД
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 дней

      await connection.execute(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, token, expiresAt]
      );

      // Получение информации о лицензии
      const [licenses] = await connection.execute(
        'SELECT license_key, status FROM licenses WHERE user_id = ?',
        [user.id]
      );

      const userData = {
        id: user.id,
        email: user.email,
        username: user.username,
        license: (licenses as any[])[0]
      };

      const response = NextResponse.json(
        { message: 'Вход выполнен успешно', user: userData },
        { status: 200 }
      );

      // Установка cookie с токеном
      response.cookies.set('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 // 7 дней
      });

      return response;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}