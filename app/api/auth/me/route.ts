import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import pool from '@/lib/db';

const JWT_SECRET = process.env.JWT_SECRET || 'WZzfRPXHmbv8COqfJCINS1MxvDsoF2245nFLV0UGF/E=';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    
    const connection = await pool.getConnection();
    
    try {
      const [users] = await connection.execute(
        'SELECT id, email, username FROM users WHERE id = ?',
        [decoded.userId]
      );

      const user = (users as any[])[0];
      
      if (!user) {
        return NextResponse.json({ user: null }, { status: 200 });
      }

      const [licenses] = await connection.execute(
        'SELECT license_key, status FROM licenses WHERE user_id = ?',
        [user.id]
      );

      return NextResponse.json({
        user: {
          ...user,
          license: (licenses as any[])[0] || null
        }
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    return NextResponse.json({ user: null }, { status: 200 });
  }
}