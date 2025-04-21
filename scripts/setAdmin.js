require("dotenv").config()
const { initializeApp, cert, getApps } = require("firebase-admin/app")
const { getAuth } = require("firebase-admin/auth")

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  })
}

// Replace with your own Firebase UID
const targetUid = "IrcT2q0G4Ba00gX8KZbDFoFMZx32"

async function makeAdmin(uid) {
  try {
    await getAuth().setCustomUserClaims(uid, { admin: true })
    console.log(`✅ User ${uid} is now an admin.`)
  } catch (err) {
    console.error("❌ Failed to set admin claim:", err)
  }
}

makeAdmin(targetUid)
