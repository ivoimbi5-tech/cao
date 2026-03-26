import axios from 'axios';
import express from "express";
import admin from "firebase-admin";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import crypto from "crypto";
import fs from "fs";
import path from "path";
import "dotenv/config";
import { GoogleAuth } from "google-auth-library";
import { serviceAccount as fallbackSa } from "./sa";

// Load Firebase Config
const firebaseConfigPath = path.resolve(process.cwd(), "firebase-applet-config.json");
const debugLogPath = "/firebase-debug.log";

function debugLog(msg: string, data?: any) {
  // Silent in production
  if (process.env.NODE_ENV === 'development') {
    console.log(`[FirebaseDebug] ${msg}`, data || '');
  }
}

let firebaseConfig: any = {};
try {
  if (fs.existsSync(firebaseConfigPath)) {
    const rawConfig = fs.readFileSync(firebaseConfigPath, "utf-8");
    firebaseConfig = JSON.parse(rawConfig);
    console.log("✅ Loaded firebase-applet-config.json. Project:", firebaseConfig.projectId);
    if (!firebaseConfig.projectId) {
      console.warn("⚠️ firebase-applet-config.json is missing projectId!");
    }
  } else {
    console.warn("⚠️ firebase-applet-config.json not found at", firebaseConfigPath);
    firebaseConfig = { projectId: process.env.FIREBASE_PROJECT_ID };
    console.log("Using fallback Firebase config with projectId:", firebaseConfig.projectId);
  }
} catch (err: any) {
  console.error("❌ Error loading firebase-applet-config.json:", err.message);
  firebaseConfig = { projectId: process.env.FIREBASE_PROJECT_ID };
}

let db: Firestore;
let initializedServiceAccountEmail: string = "não identificado";
let currentIdentity: string = "não identificado";
let detectedProjectId: string = "não identificado";

// Function to identify current identity and project
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | undefined;
      email: string | undefined;
      photoUrl: string | undefined;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: undefined,
      email: undefined,
      emailVerified: undefined,
      isAnonymous: undefined,
      tenantId: undefined,
      providerInfo: []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function identifyIdentity() {
  try {
    const auth = new GoogleAuth();
    const client = await auth.getClient();
    
    // Get Project ID
    try {
      detectedProjectId = await auth.getProjectId();
      console.log("Detected Project ID (from ADC):", detectedProjectId);
    } catch (pErr) {
      console.warn("Could not detect project ID from ADC:", pErr);
    }

    if ('email' in client && typeof client.email === 'string') {
      currentIdentity = client.email;
      debugLog("Current Identity (from ADC):", currentIdentity);
    } else {
      // Try to fetch from metadata server if on Cloud Run
      const metadataUrl = "http://metadata.google.internal/computeMetadata/v1/instance/service-accounts/default/email";
      try {
        const response = await fetch(metadataUrl, {
          headers: { "Metadata-Flavor": "Google" }
        });
        if (response.ok) {
          currentIdentity = await response.text();
          debugLog("Current Identity (from Metadata):", currentIdentity);
        }
      } catch (mErr) {
        debugLog("Metadata server not reachable (expected if not on Cloud Run)");
      }
    }
  } catch (err) {
    console.warn("Could not identify ADC identity:", err);
  }
}

// Initialize Firebase Admin and Firestore
const initializeFirebase = async () => {
  debugLog("Starting initializeFirebase...");
  try {
    if (!admin.apps.length) {
      const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT;
      const saPreview = serviceAccount ? `${serviceAccount.substring(0, 10)}...${serviceAccount.slice(-10)}` : "none";
      debugLog("Checking FIREBASE_SERVICE_ACCOUNT...", { 
        present: !!serviceAccount, 
        length: serviceAccount?.length || 0,
        preview: saPreview
      });
      
      // 1. Try Service Account if provided
      if (serviceAccount && serviceAccount.trim()) {
        const trimmedAccount = serviceAccount.trim();
        let parsedAccount: any = null;

        try {
          if (trimmedAccount.startsWith('{')) {
            parsedAccount = JSON.parse(trimmedAccount);
          } else if (!trimmedAccount.includes(' ') && trimmedAccount.length > 100) {
            const decoded = Buffer.from(trimmedAccount, 'base64').toString('utf8');
            parsedAccount = JSON.parse(decoded);
          }

          if (parsedAccount) {
            initializedServiceAccountEmail = parsedAccount.client_email || "desconhecido";
            debugLog("Parsed Service Account email:", initializedServiceAccountEmail);
            
            // Verificação de segurança: se o projeto da secret for diferente do projeto atual, ignoramos a secret
            if (parsedAccount.project_id && firebaseConfig.projectId && parsedAccount.project_id !== firebaseConfig.projectId) {
              debugLog("⚠️ Project mismatch in Service Account", {
                saProject: parsedAccount.project_id,
                configProject: firebaseConfig.projectId
              });
              parsedAccount = null;
            } else {
              admin.initializeApp({
                credential: admin.credential.cert(parsedAccount),
                projectId: firebaseConfig.projectId || parsedAccount.project_id,
              });
              debugLog("✅ Initialized with Service Account cert.");
            }
          }
        } catch (e: any) {
          debugLog("❌ Error parsing Service Account:", e.message);
        }
      }

      // 1.5 Try fallbackSa from sa.ts if still not initialized
      if (!admin.apps.length) {
        try {
          admin.initializeApp({
            credential: admin.credential.cert(fallbackSa as any),
            projectId: firebaseConfig.projectId || fallbackSa.project_id,
          });
          console.log("✅ Initialized with fallbackSa from sa.ts.");
        } catch (e: any) {
          console.error("❌ Error using fallbackSa from sa.ts:", e.message);
        }
      }
      
      // 2. Try ADC with explicit Project ID from config (Best for Cloud Run with specific project)
      if (!admin.apps.length && firebaseConfig.projectId) {
        try {
          debugLog("🚀 Trying ADC with explicit Project ID:", firebaseConfig.projectId);
          admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: firebaseConfig.projectId,
          });
          debugLog("✅ Initialized with ADC + Config Project ID.");
        } catch (initErr: any) {
          debugLog("⚠️ ADC + Config Project ID failed:", initErr.message);
        }
      }

      // 3. Try Default Initialization (No arguments) - Only if no config project ID
      if (!admin.apps.length) {
        try {
          debugLog("🚀 Trying Default Initialization (no args)...");
          admin.initializeApp();
          debugLog("✅ Initialized with Default (no args).");
        } catch (defaultErr: any) {
          debugLog("⚠️ Default initialization failed:", defaultErr.message);
        }
      }

      // 4. Fallback para ADC com detected Project ID
      if (!admin.apps.length && detectedProjectId !== "não identificado") {
        debugLog("🚀 Trying ADC with detected Project ID:", detectedProjectId);
        try {
          admin.initializeApp({
            credential: admin.credential.applicationDefault(),
            projectId: detectedProjectId,
          });
          debugLog("✅ Initialized with ADC + Detected Project ID.");
        } catch (initErr: any) {
          debugLog("❌ ADC + Detected Project ID failed:", initErr.message);
        }
      }
      
      if (!admin.apps.length) {
        debugLog("❌ Failed to initialize Firebase Admin by any method.");
        throw new Error("Não foi possível inicializar o Firebase Admin SDK por nenhum método.");
      }
    }
    
    // Initialize Firestore
    if (!db) {
      const app = admin.apps[0];
      const configDatabaseId = firebaseConfig.firestoreDatabaseId;
      debugLog("Initializing Firestore instance...", { 
        projectId: app.options.projectId, 
        configDatabaseId 
      });
      
      // Tentamos primeiro o banco do config
      if (configDatabaseId && configDatabaseId !== '(default)') {
        debugLog(`Attempting named database: ${configDatabaseId}`);
        try {
          db = getFirestore(app, configDatabaseId);
        } catch (err: any) {
          debugLog(`❌ Error creating named Firestore instance:`, err.message);
          db = getFirestore(app);
        }
      } else {
        debugLog("Using default database instance.");
        db = getFirestore(app);
      }
      
      db.settings({ ignoreUndefinedProperties: true });

      // Startup Test Write
      const testConnection = async () => {
        const app = admin.apps[0];
        const currentProjectId = (db as any).projectId || (db as any)._projectId || app.options.projectId || detectedProjectId;
        debugLog(`Running connection test on project: ${currentProjectId}`);
        
        try {
          const testDoc = db.collection('_system_test').doc('connection_check');
          await testDoc.set({
            lastChecked: new Date().toISOString(),
            projectId: currentProjectId,
            identity: currentIdentity,
            databaseId: configDatabaseId || '(default)'
          });
          
          const snapshot = await testDoc.get();
          if (snapshot.exists) {
            debugLog("✅ Firestore connection test SUCCESSFUL.");
          }
        } catch (testErr: any) {
          debugLog("❌ Firestore connection test FAILED:", {
            message: testErr.message,
            code: testErr.code
          });
          
          // Se falhou com PERMISSION_DENIED e estávamos usando um banco específico, tentamos o default
          if ((testErr.code === 7 || testErr.message.includes('PERMISSION_DENIED')) && configDatabaseId && configDatabaseId !== '(default)') {
            debugLog("🔄 PERMISSION_DENIED. Attempting fallback to (default) database...");
            try {
              const defaultDb = getFirestore(app);
              const testDocDefault = defaultDb.collection('_system_test').doc('connection_check');
              await testDocDefault.set({
                lastChecked: new Date().toISOString(),
                projectId: currentProjectId,
                identity: currentIdentity,
                fallback: true
              });
              db = defaultDb;
              debugLog("✅ Fallback to (default) database SUCCESSFUL.");
            } catch (fallbackErr: any) {
              debugLog("❌ Fallback to (default) database also FAILED:", fallbackErr.message);
            }
          }
        }
      };
      testConnection();
    }
  } catch (err: any) {
    debugLog("❌ Fatal error in initializeFirebase:", err.message);
  }
};

// Start initialization
const start = async () => {
  console.log("🚀 Starting Firebase initialization sequence...");
  try {
    await identifyIdentity();
    await initializeFirebase();
  } catch (err: any) {
    console.error("❌ Fatal error during startup:", err.message);
  }
};
start();

const getDb = () => {
  if (!db) {
    throw new Error("Firestore not initialized. Call initializeFirebase first.");
  }
  return db;
};

/**
 * Ensures no undefined values are sent to Firestore, including inside arrays and nested objects.
 */
const sanitizeForFirestore = (obj: any): any => {
  if (obj === undefined) return null;
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return obj;
  
  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeForFirestore(item));
  }

  const sanitized: any = {};
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      sanitized[key] = sanitizeForFirestore(obj[key]);
    }
  }
  return sanitized;
};

const app = express();
console.log("Backend Version: 1.0.5 - Firestore Sanitization Active");

console.log("Environment:", process.env.NODE_ENV);
console.log("Is Netlify:", !!process.env.NETLIFY);

app.use(express.json());

// API Routes

app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// SMM Panel Integration
const SMM_API_KEY = process.env.SMM_API_KEY;
const SMM_API_URL = process.env.SMM_API_URL;

// Create SMM Order
app.post("/api/orders/create", async (req, res) => {
  try {
    const { userId, serviceId, providerServiceId, targetUrl, quantity, totalPrice } = req.body;

    if (!userId || !serviceId || !providerServiceId || !targetUrl || !quantity || !totalPrice) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const firestore = getDb();
    const userRef = firestore.collection('users').doc(userId);
    let userDoc;
    try {
      userDoc = await userRef.get();
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, `users/${userId}`);
    }

    if (!userDoc.exists) {
      return res.status(404).json({ error: "User not found" });
    }

    const userData = userDoc.data();
    if ((userData?.balance || 0) < totalPrice) {
      return res.status(400).json({ error: "Saldo insuficiente" });
    }

    // 1. Create order on SMM Panel
    let providerOrderId = `SIM-${Math.floor(Math.random() * 1000000)}`;
    
    if (SMM_API_KEY && SMM_API_URL) {
      try {
        const params = new URLSearchParams();
        params.append('key', SMM_API_KEY);
        params.append('action', 'add');
        params.append('service', providerServiceId.toString());
        params.append('link', targetUrl);
        params.append('quantity', quantity.toString());

        const smmResponse = await fetch(SMM_API_URL, {
          method: 'POST',
          body: params
        });

        const smmData: any = await smmResponse.json();
        if (smmData.order) {
          providerOrderId = smmData.order;
        } else if (smmData.error) {
          console.error("SMM Panel Error:", smmData.error);
          return res.status(400).json({ error: `Erro do provedor: ${smmData.error}` });
        }
      } catch (err) {
        console.error("Failed to connect to SMM Panel:", err);
        // Fallback to simulation if requested or just fail
        return res.status(500).json({ error: "Falha ao conectar com o provedor de serviços" });
      }
    }

    // 2. Deduct balance and save order in Firestore
    const batch = firestore.batch();
    
    // Deduct balance
    batch.update(userRef, {
      balance: admin.firestore.FieldValue.increment(-totalPrice)
    });

    // Create order record
    const orderRef = firestore.collection('orders').doc();
    const orderData = {
      userId,
      serviceId,
      providerServiceId,
      providerOrderId: providerOrderId,
      targetUrl,
      quantity,
      totalPrice,
      status: 'processing',
      createdAt: new Date().toISOString()
    };
    batch.set(orderRef, orderData);

    try {
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'batch_commit');
    }

    res.json({ success: true, orderId: orderRef.id, providerOrderId: providerOrderId });
  } catch (error: any) {
    console.error("Error creating SMM order:", error);
    res.status(500).json({ error: "Erro interno ao processar pedido", details: error.message });
  }
});

// Webhook for external sales (e.g. from a payment gateway like Kuenha)
app.post("/api/webhook/sales", async (req, res) => {
  try {
    const payload = req.body;
    console.log("Sales Webhook received:", payload);

    // Common fields in payment webhooks
    const userId = payload.userId || payload.externalId || payload.client_id || payload.customer_id;
    const amount = Number(payload.amount || payload.value || payload.price);
    const status = (payload.status || payload.event || 'approved').toLowerCase();
    const orderId = payload.orderId || payload.id || payload.reference;

    if (!userId) {
      console.error("Invalid webhook payload: userId is required", payload);
      return res.status(400).json({ error: "Invalid payload: userId is required" });
    }

    const firestore = getDb();
    const userRef = firestore.collection('users').doc(userId);
    const userDoc = await userRef.get();

    if (!userDoc.exists) {
      console.error(`User ${userId} not found for webhook`);
      return res.status(404).json({ error: "User not found" });
    }

    // Handle different statuses
    if (status === 'abandoned' || status === 'checkout.abandoned' || status === 'cancelled') {
      console.log(`⚠️ Purchase abandoned by user ${userId} for amount ${amount} Kz`);
      
      // Log abandoned purchase notification
      await firestore.collection('notifications').add({
        userId,
        title: "Compra Abandonada",
        message: `Vimos que você não concluiu sua recarga de ${amount} Kz. Precisa de ajuda?`,
        type: 'abandoned_purchase',
        amount,
        orderId,
        createdAt: new Date().toISOString(),
        read: false
      });

      return res.json({ success: true, message: "Abandoned purchase logged" });
    }

    // Default to 'approved' if not abandoned
    if (status === 'approved' || status === 'completed' || status === 'paid' || status === 'sale.completed') {
      if (isNaN(amount) || amount <= 0) {
        return res.status(400).json({ error: "Invalid amount for approved sale" });
      }

      // Update user balance
      await userRef.update({
        balance: admin.firestore.FieldValue.increment(amount),
        lastDepositAt: new Date().toISOString()
      });

      // Log the transaction
      await firestore.collection('transactions').add({
        userId,
        amount,
        type: 'deposit',
        status: 'approved',
        provider: 'webhook_sales',
        orderId,
        createdAt: new Date().toISOString(),
        payload: payload
      });

      // Log success notification
      await firestore.collection('notifications').add({
        userId,
        title: "Recarga Concluída",
        message: `Seu saldo de ${amount} Kz foi adicionado com sucesso!`,
        type: 'deposit_success',
        amount,
        createdAt: new Date().toISOString(),
        read: false
      });

      console.log(`✅ Balance updated via webhook for user ${userId}: +${amount} Kz`);
      return res.json({ success: true, message: "Balance updated" });
    }

    res.json({ success: true, message: "Webhook received but no action taken for status: " + status });
  } catch (error: any) {
    console.error("Error processing sales webhook:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export { app };
