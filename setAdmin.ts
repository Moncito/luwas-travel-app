import admin from 'firebase-admin';
import { readFileSync } from 'fs';
import path from 'path';

// Load service account JSON using readFileSync (TypeScript-safe)
const serviceAccountPath = path.resolve(__dirname, './serviceAccountKey.json');
const serviceAccount = JSON.parse(readFileSync(serviceAccountPath, 'utf-8'));

// Initialize Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Replace with the actual UID of the user you want to make admin
const uid = 'KwPLZ3CszhdlkCiEtGSKKhCtxuL2';

admin
  .auth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✅ Admin claim set for ${uid}`);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Failed to set admin claim:', err);
    process.exit(1);
  });
