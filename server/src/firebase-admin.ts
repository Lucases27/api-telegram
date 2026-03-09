import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

if (!admin.apps.length) {
  let serviceAccount: admin.ServiceAccount;

  if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON) as admin.ServiceAccount;
  } else {
    // server/src -> server -> project root
    const rootDir = path.resolve(__dirname, '..', '..');
    const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.json') && f.includes('firebase-adminsdk'));
    if (files.length === 0) throw new Error(`No Firebase service account JSON found in ${rootDir}`);
    const serviceAccountPath = path.join(rootDir, files[0]);
    serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf-8')) as admin.ServiceAccount;
  }

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;
