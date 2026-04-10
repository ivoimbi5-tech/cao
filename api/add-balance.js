import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

const app = initializeApp({
  credential: cert({
    projectId: "gen-lang-client-0626746561",
    clientEmail: "firebase-adminsdk-fbsvc@gen-lang-client-0626746561.iam.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCWEOf7ZaMZ6HAg\nhodVi2CoqC+wFYTiE9qIm3CqfIovtBHLUCocMUGNc+1HvzRAdPi7TT+X6cK9A6+R\nBkw+i0Rf5jIGaHKkDOi99uHMsm/1sZROe8woRnpiFMeoY9aqWIVHEXnOWE1HHSic\nYozPQtWuL3+oO7RL0m3zMJLnTLoXwoOO45MgVPcv3o7hIKw8UFDOehKWbDE8XINx\n0QnI8Q45a5beO3Z/U3PIBNtUC97o4fmNbgsRsS+iueGB9nuOSNNE4mDCMZYSAuYM\naBaoIqpNpw3fC57uCz5C0yPgXIAAvA0Gf8/fXz8IdwObNXPcVDSEOsXPeBKBXtn0\nyJ+Qp7/jAgMBAAECggEABK1YNzfbiOlh46s6hco6fZpoVuOeaNfXkTeb0yR4jIFF\npxsp6zqgLjZCKGDna87f5btdoD15g7lp4mpA1bFl5/TdWeFgsu4+eGIJqmVkiext\nkLI/eOd7CJpYzE3FGTmsrCKTGk3ncrApxBE3DeRDLRLVg4fNpPaIO/LBBJNNBYQb\nrDmIM7kzd+qEF8Ryrq05MSq9RHCCPR201rZCohb10YIiVp6119tFcEFyGTYZIR/O\nGYX72kcEJmVObT+MoGrRKo9N3GdPpWdI6AxSjlw+OSAQ/MMRNbSxXvrvJKOCfb+B\nv9RMgWtIuTPAsVldExKpbmeh820g7YXHxFaKgq3/wQKBgQDHHnq0A+R4xIN7izdJ\nYorTjjk/wRxBn3uypj7IokVaukrmT6pMRZEHbbazDXEAQtd3kHXbIrpqdTCLGTJJ\n9hPtVK61lFS/8yul1+jzRQJW5BQlF0EyRwqRu33lcwV0BxK4YYOK8CqKQbtqHMup\nE1rC2qlfuPg6E3w07yo/pKHYQwKBgQDA7zF/RsaSYeH66ShFTqQxYIwEfejnkEBy\ny4ipO1N0eMq7cPujRiC1wWQ/DcFnWzOwOBCayFQWfaQBSl08509Le+LnMu3zSHWN\n8YQzeCG7Sk4jjo7YikoB+ESCYnrTKxEkZnbtA0j96ImUsYQVYI6ZaKnxrG9OvBph\nYPiU2+RP4QKBgQCa/Pp9jFoWNsAxNde+41kz+oxNN78KxVy/Xe+Ys9ZQHJmYU4I3\nBB8zLQ78qAXBMkYM5wEVpR59JuK2ItKmB0jTfwrOg7rD/j+HQ1wrnxeHEtkrVcKF\npA5yCQKhyrn/6lGD+0MsrmwuWaPLoMZVwJ7w9MrJm2x7qBcSDOdRyo+/iQKBgQCX\nbaWdzgEg926UrteKvlSk5LBA/koFJfVPpGxY11WDPyNvxxfaaLpXrbhuvO8lnjGN\niBOQSNem52oIEUPo/2v/RPcsm46juiV6CSvH8ewXwhReWA/J6ZB4x1GOPJlGkLDd\nrwZ8tG1fzFnfuQyAcs65nap1IvAiDgVulNvGimhCQQKBgFMrBgKovTY7zrXvKMQJ\nb3RmVYFMo3VTzbzYyZ0Zq6czf5BOv1wNHxvODd0GId8ub6P4Q68dxB1RrR9EYG6o\ngxzT3xBNBMT6GOv3ySCf/gMHxE5+cPb8z7/MFm/J4KIlHRI5r7w4h1m276rRnGxg\nC2RjfaAd/zwpN2kqaBmPGhNR\n-----END PRIVATE KEY-----\n"
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
