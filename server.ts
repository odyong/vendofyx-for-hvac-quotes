import express from "express";
import { createServer as createViteServer } from "vite";
import { Resend } from "resend";
import dotenv from "dotenv";
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc, 
  query, 
  where, 
  orderBy, 
  serverTimestamp, 
  getDoc,
  initializeFirestore
} from "firebase/firestore";

dotenv.config();

// Firebase config for backend (using same config as frontend)
const firebaseConfig = {
  apiKey: "AIzaSyA62y1mDaxyTNb43LhE9Zxcd8eLipp5Hu4",
  authDomain: "vendofyx-hvac.firebaseapp.com",
  projectId: "vendofyx-hvac",
  storageBucket: "vendofyx-hvac.firebasestorage.app",
  messagingSenderId: "196974476378",
  appId: "1:196974476378:web:13e958e3e364ccc321ac63"
};

const firebaseApp = initializeApp(firebaseConfig);

// Use initializeFirestore to force long-polling on the server as well
const db = initializeFirestore(firebaseApp, {
  experimentalForceLongPolling: true,
});

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for sending follow-ups
  app.post("/api/send-followup", async (req, res) => {
    const { email, customer, job, amount, company } = req.body;

    if (!resend) {
      return res.status(500).json({ error: "Resend API key not configured in environment variables." });
    }

    try {
      const { data, error } = await resend.emails.send({
        from: `${company || "Vendofyx"} <onboarding@resend.dev>`,
        to: [email],
        subject: `Following up on your ${job} quote`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
            <h2 style="color: #333;">Hi ${customer},</h2>
            <p>I'm just following up on the quote we sent for the <strong>${job}</strong> job ($${Number(amount).toLocaleString()}).</p>
            <p>Do you have any questions or would you like to get this scheduled?</p>
            <p>Best regards,<br><strong>${company || "The Team"}</strong></p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
            <p style="font-size: 12px; color: #999;">Sent via Vendofyx</p>
          </div>
        `,
      });

      if (error) {
        console.error("Resend Error:", error);
        return res.status(400).json({ error: error.message });
      }

      res.json({ success: true, id: data?.id });
    } catch (err: any) {
      console.error("Server Error:", err);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Get user profile
  app.get("/api/profile", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    try {
      const snap = await getDoc(doc(db, "users", userId as string));
      if (snap.exists()) {
        res.json(snap.data());
      } else {
        res.status(404).json({ error: "Profile not found" });
      }
    } catch (err: any) {
      console.error("Error fetching profile:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Update user profile
  app.patch("/api/profile", async (req, res) => {
    const { userId, ...updates } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    try {
      await updateDoc(doc(db, "users", userId), updates);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error updating profile:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get all quotes for a user
  app.get("/api/quotes", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    try {
      const q = query(collection(db, "quotes"), where("userId", "==", userId), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      const quotes = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      res.json(quotes);
    } catch (err: any) {
      console.error("Error fetching quotes:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Create a new quote
  app.post("/api/quotes", async (req, res) => {
    const { userId, ...quoteData } = req.body;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    try {
      const ref = await addDoc(collection(db, "quotes"), {
        ...quoteData,
        userId,
        createdAt: serverTimestamp(),
        status: quoteData.status || "pending",
        followUpsSent: 0
      });
      res.json({ id: ref.id });
    } catch (err: any) {
      console.error("Error creating quote:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Update quote fields
  app.patch("/api/quotes/:id", async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    try {
      if (updates.lastFollowUp) {
        updates.lastFollowUp = serverTimestamp();
      }
      
      await updateDoc(doc(db, "quotes", id), updates);
      res.json({ success: true });
    } catch (err: any) {
      console.error("Error updating quote:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // Get dashboard stats
  app.get("/api/stats", async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId is required" });

    try {
      const q = query(collection(db, "quotes"), where("userId", "==", userId));
      const snap = await getDocs(q);
      const quotes = snap.docs.map(d => d.data());

      const stats = {
        total: quotes.length,
        pending: quotes.filter(q => q.status === "pending").length,
        won: quotes.filter(q => q.status === "won").length,
        lost: quotes.filter(q => q.status === "lost").length,
        totalValue: quotes.reduce((acc, q) => acc + (q.amount || 0), 0),
        wonValue: quotes.filter(q => q.status === "won").reduce((acc, q) => acc + (q.amount || 0), 0),
      };

      res.json(stats);
    } catch (err: any) {
      console.error("Error fetching stats:", err);
      res.status(500).json({ error: err.message });
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
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
