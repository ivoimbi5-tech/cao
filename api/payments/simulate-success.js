
import admin from "firebase-admin";

// 🔥 Inicializa Firebase Admin (uma vez só)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT))
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  try {
    // ✅ Permitir só POST
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Método não permitido" });
    }

    const { userId, amount, transactionId } = req.body;

    console.log("📩 Dados recebidos:", { userId, amount, transactionId });

    // ✅ Validação forte
    if (!userId || !transactionId || typeof amount !== "number" || isNaN(amount)) {
      return res.status(400).json({ error: "Dados inválidos" });
    }

    if (amount <= 0) {
      return res.status(400).json({ error: "Valor inválido" });
    }

    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();

    // ❌ Usuário não existe
    if (!userDoc.exists) {
      return res.status(404).json({ error: "Usuário não encontrado" });
    }

    // ✅ Atualiza saldo
    await userRef.update({
      balance: admin.firestore.FieldValue.increment(amount),
      lastTransactionId: transactionId,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log("✅ Pagamento aplicado com sucesso");

    return res.status(200).json({ success: true });

  } catch (error) {
    console.error("❌ ERRO INTERNO:", error);
    return res.status(500).json({
      error: "Erro interno",
      details: error.message
    });
  }
}
