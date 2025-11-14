import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const dbName = process.env.DB_NAME || 'Bill';
let client;
let clientPromise;

if (uri) {
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, {
      // options if needed
    });
    global._mongoClientPromise = client.connect();
  }
  clientPromise = global._mongoClientPromise;
}

export async function getDb() {
  if (!uri) {
    throw new Error('MONGO_URI is not set. Add it to .env.local');
  }
  const c = await clientPromise;
  return c.db(dbName);
}

export async function getUsersCollection() {
  const db = await getDb();
  return db.collection('users');
}

export async function getBillingDetailsCollection() {
  const db = await getDb();
  return db.collection('billingdetails');
}
