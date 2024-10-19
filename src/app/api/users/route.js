import dbConnect from '../../lib/dbConnect';
import User from '../../models/User';
import { NextResponse } from 'next/server';

export async function GET(request) {
  await dbConnect();

  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  try {
    let users;
    if (email) {
      // Fetch user by email if provided
      users = await User.find({ email });
    } else {
      // Otherwise, fetch all users
      users = await User.find({});
    }
    
    return NextResponse.json({ success: true, data: users });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request) {
  await dbConnect();
  const { email, name } = await request.json();

  try {
    const newUser = await User.create({ email, name });
    return NextResponse.json({ success: true, data: newUser });
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to create user' }, { status: 500 });
  }
}
