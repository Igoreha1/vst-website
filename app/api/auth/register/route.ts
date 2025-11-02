import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { email, username, password } = await request.json();

    // Проверка обязательных полей
    if (!email || !username || !password) {
      return NextResponse.json(
        { error: 'Все поля обязательны' },
        { status: 400 }
      );
    }

    // Хеширование пароля
    const hashedPassword = await bcrypt.hash(password, 10);

    const connection = await pool.getConnection();
    
    try {
      // Создание пользователя
      const [result] = await connection.execute(
        'INSERT INTO users (email, username, password) VALUES (?, ?, ?)',
        [email, username, hashedPassword]
      );

      // Создание бесплатной подписки
      const userId = (result as any).insertId;
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 30); // 30 дней

      await connection.execute(
        'INSERT INTO subscriptions (user_id, plan_type, expires_at) VALUES (?, ?, ?)',
        [userId, 'free', expiresAt]
      );

      // Создание лицензии
      const licenseKey = `SNC-VST-${new Date().getFullYear()}-${userId.toString().padStart(3, '0')}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
      
      await connection.execute(
        'INSERT INTO licenses (user_id, license_key) VALUES (?, ?)',
        [userId, licenseKey]
      );

      return NextResponse.json(
        { message: 'Пользователь создан успешно', userId, licenseKey },
        { status: 201 }
      );
    } finally {
      connection.release();
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { error: 'Пользователь с таким email или username уже существует' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    );
  }
}