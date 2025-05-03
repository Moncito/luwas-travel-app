
const admin = require('firebase-admin');
const serviceAccount = require('../secret/firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

const uid = 'KwPLZ3CszhdlkCiEtGSKKhCtxuL2';

admin
  .auth()
  .setCustomUserClaims(uid, { admin: true })
  .then(() => {
    console.log(`✅ Successfully set admin claim for UID: ${uid}`);
    process.exit(0);
  })
  .catch((error: unknown) => {
    console.error('❌ Error setting admin claim:', error);
    process.exit(1);
  });
  