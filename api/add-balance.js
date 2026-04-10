import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const app = initializeApp({
  credential: cert({
    projectId: "gen-lang-client-0485599362",
    clientEmail: "firebase-adminsdk-xxxxx@gen-lang-client-0485599362.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nTUA_KEY\n-----END PRIVATE KEY-----\n"
  })
});

const db = getFirestore(app);

export default async function handler(req, res) {
  try {
    const { uid, amount, txId } = req.body;

    if (!uid || !amount) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    const userRef = db.collection("users").doc(uid);

    await userRef.set({
      balance: FieldValue.increment(Number(amount)),
      ultimaTransacao: txId || "api",
      dataSincronizacao: new Date().toISOString()
    }, { merge: true });

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Erro interno" });
  }
}
