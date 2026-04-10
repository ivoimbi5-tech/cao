import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

// 🔥 evita reinicializar várias vezes (IMPORTANTE no Vercel)
let app;

if (!global._firebaseApp) {
  global._firebaseApp = initializeApp({
    credential: cert({
      projectId: "gen-lang-client-0626746561",
      clientEmail: "firebase-adminsdk-fbsvc@gen-lang-client-0626746561.iam.gserviceaccount.com",
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
    })
  });
}

app = global._firebaseApp;
const db = getFirestore(app);

export default async function handler(req, res) {
  try {
    // 🔥 FORÇA parse do body
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;

    console.log("BODY RECEBIDO:", body);

    const { uid, amount, txId } = body;

    if (!uid || !amount) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const userRef = db.collection("users").doc(uid);

    await userRef.set({
      balance: FieldValue.increment(Number(amount)),
      ultimaTransacao: txId || "api",
      dataSincronizacao: new Date().toISOString()
    }, { merge: true });

    console.log("SALDO ATUALIZADO:", uid, amount);

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("ERRO API:", error);
    return res.status(500).json({ error: error.message });
  }
}
