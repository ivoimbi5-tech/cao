import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// 🔥 INIT FIREBASE (OBRIGATÓRIO)
if (!getApps().length) {
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    }),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  try {
    const { uid, amount, txId } = req.body;

    console.log("BODY:", req.body);

    if (!uid || !amount) {
      return res.status(400).json({ error: "Missing data" });
    }

    const userRef = db.collection("users").doc(uid);

    const doc = await userRef.get();

    if (!doc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    await userRef.update({
      balance: FieldValue.increment(Number(amount)),
      lastTx: txId || null,
      updatedAt: new Date().toISOString()
    });

    const updated = await userRef.get();

    return res.status(200).json({
      success: true,
      newBalance: updated.data().balance
    });

  } catch (err) {
    console.error("🔥 ERROR:", err);
    return res.status(500).json({ error: err.message });
  }
}
