import { MongoClient } from 'mongodb';
import 'dotenv/config';

const uri = process.env.MONGODB_URI || '';
if (!uri) console.warn('Advertencia: MONGODB_URI no definida.');
if (!uri.includes('eva-u3-express')) console.warn('Advertencia: el URI no parece apuntar a eva-u3-express.');

const client = new MongoClient(uri, { serverApi: { version: '1' } });
let connected = false;

export async function connectToMongo() {
  return client.connect()
    .then(() => {
      connected = true;
      console.log('Conexión a MongoDB Atlas establecida correctamente.');
    })
    .catch((err) => {
      console.error('No se pudo conectar a MongoDB Atlas:', err.message);
      throw err;
    });
}

export function getClient() {
  if (!connected) throw new Error('Cliente Mongo no conectado. Llamar connectToMongo() primero.');
  return client;
}

export function getDb(dbName = 'cine-db') {
  return getClient().db(dbName);
}
