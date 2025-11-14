import { NextResponse } from 'next/server';
import { getBillingDetailsCollection } from '../../lib/db';
import { verifyToken } from '../../lib/auth';

function unauthorized() {
  return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
}

export async function GET(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return unauthorized();
    const decoded = verifyToken(token);
    if (!decoded?.username) return unauthorized();

    const billingCol = await getBillingDetailsCollection();
    const doc = await billingCol.findOne({ username: decoded.username }, { projection: { _id: 0 } });
    if (!doc) return NextResponse.json({ message: 'Not found' }, { status: 404 });
    return NextResponse.json(doc, { status: 200 });
  } catch (err) {
    const msg = err?.message?.includes('MONGO_URI') ? 'Server DB not configured. Set MONGO_URI and DB_NAME in .env.local and restart.' : 'Internal server error';
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const token = request.cookies.get('token')?.value;
    if (!token) return unauthorized();
    const decoded = verifyToken(token);
    if (!decoded?.username) return unauthorized();

    const body = await request.json().catch(() => ({}));
    const allowed = ['addedItems', 'cardInfo', 'menuItems', 'report', 'mobile', 'email', 'restaurantName', 'address'];
    const set = {};
    for (const key of allowed) {
      if (key in body) set[key] = body[key];
    }
    if (Object.keys(set).length === 0) {
      return NextResponse.json({ message: 'No valid fields to update' }, { status: 400 });
    }

    const billingCol = await getBillingDetailsCollection();
    const { value } = await billingCol.findOneAndUpdate(
      { username: decoded.username },
      { $set: set },
      { returnDocument: 'after', upsert: true }
    );

    // Hide _id in response for cleanliness
    if (value && value._id) delete value._id;
    return NextResponse.json(value || { username: decoded.username, ...set }, { status: 200 });
  } catch (err) {
    const msg = err?.message?.includes('MONGO_URI') ? 'Server DB not configured. Set MONGO_URI and DB_NAME in .env.local and restart.' : 'Internal server error';
    return NextResponse.json({ message: msg }, { status: 500 });
  }
}
