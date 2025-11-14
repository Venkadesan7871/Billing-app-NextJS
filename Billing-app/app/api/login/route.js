import { NextResponse } from 'next/server';
import { signToken } from '../../lib/auth';
import { getUsersCollection } from '../../lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  const body = await request.json().catch(() => null);
  const username = body?.username?.trim();
  const password = body?.password?.trim();

  if (!username || !password) {
    return NextResponse.json({ message: 'Username and password are required' }, { status: 400 });
  }

  const usersCol = await getUsersCollection();
  const user = await usersCol.findOne({ username });
  if (!user) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }
  const ok = await bcrypt.compare(password, user.password);
  if (!ok) {
    return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
  }

  const token = signToken({ username });

  const res = NextResponse.json({ message: 'Logged in' }, { status: 200 });
  res.cookies.set('token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60, // 1 hour
  });
  return res;
}
