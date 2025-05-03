const admin = require('firebase-admin');
const serviceAccount = require('../secret/firebase-service-account.json');

admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
});

const uid = 'KwPLZ3CszhdlkCiEtGSKKhCtxuL2';

admin
  .auth()
  .getUser(uid)
  .then((userRecord: any) => {
    console.log('👤 Custom Claims:', userRecord.customClaims);
    process.exit(0);
  })
  .catch((error: any) => {
    console.error('❌ Error fetching user:', error);
    process.exit(1);
  });
