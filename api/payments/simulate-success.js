import admin from "firebase-admin";

let db;

try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      }),
    });

    console.log("🔥 Firebase OK");
  }

  db = admin.firestore();

} catch (err) {
  console.error("❌ ERRO FIREBASE INIT:", err);
}

export default async function handler(req, res) {
  try {
    if (!db) {
      throw new Error("Firestore não inicializado");
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método inválido" });
    }

    const { userId, amount, transactionId } = req.body;

    console.log("📩 Dados:", { userId, amount, transactionId });

    if (!userId || typeof amount !== "number" || isNaN(amount)) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const ref = db.collection("users").doc(userId);
    const snap = await ref.get();

    if (!snap.exists) {
      return res.status(404).json({ error: "Usuário não existe" });
    }

    await ref.update({
      balance: admin.firestore.FieldValue.increment(amount),
      lastTransaction: transactionId,
    });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ ERRO:", error);

    return res.status(500).json({
      error: error.message
    });
  }
}
