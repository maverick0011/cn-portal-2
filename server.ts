import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import admin from "firebase-admin";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Lazy Firebase Admin Initialization
  let adminApp: admin.app.App | null = null;
  function getAdmin() {
    if (!adminApp) {
      const saKey = process.env.FIREBASE_SERVICE_ACCOUNT;
      if (!saKey) {
        throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is required for admin operations.");
      }
      try {
        const credentials = JSON.parse(saKey);
        adminApp = admin.initializeApp({
          credential: admin.credential.cert(credentials),
        });
      } catch (err) {
        throw new Error("Failed to parse FIREBASE_SERVICE_ACCOUNT. Ensure it is a valid JSON string.");
      }
    }
    return adminApp;
  }

  // API Routes
  app.post("/api/admin/delete-user", async (req, res) => {
    const { uid, adminToken } = req.body;

    if (!uid || !adminToken) {
      return res.status(400).json({ error: "Missing uid or adminToken" });
    }

    try {
      const firebaseAdmin = getAdmin();
      
      // Verify the requester is actually an admin
      const decodedToken = await firebaseAdmin.auth().verifyIdToken(adminToken);
      const requesterUid = decodedToken.uid;
      
      // Check in Firestore if requester is admin
      const db = firebaseAdmin.firestore();
      const adminDoc = await db.collection("users").doc(requesterUid).get();
      const adminData = adminDoc.data();

      if (!adminData || adminData.role !== "admin") {
        return res.status(403).json({ error: "Unauthorized: Requester is not an admin" });
      }

      // Proceed with deletion
      // 1. Delete from Auth
      await firebaseAdmin.auth().deleteUser(uid);
      
      // 2. Delete from Firestore
      await db.collection("users").doc(uid).delete();

      res.json({ success: true });
    } catch (error: any) {
      console.error("Deletion error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
