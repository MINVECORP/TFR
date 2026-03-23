import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import cors from "cors";
import Stripe from "stripe";
import axios from "axios";

const app = express();
const PORT = 3000;

// Initialize Stripe lazily
const getStripe = () => {
  const key = process.env.STRIPE_SECRET_KEY?.trim();
  if (!key) {
    console.error("[Stripe] STRIPE_SECRET_KEY is missing in environment variables.");
    return null;
  }
  
  console.log(`[Stripe] Initializing with key starting with: ${key.substring(0, 8)}...`);

  if (key.startsWith('mk_')) {
    console.error("[Stripe] STRIPE_SECRET_KEY starts with 'mk_', which is likely an incorrect key type. It should start with 'sk_'.");
    return null;
  }
  if (key.startsWith('pk_')) {
    console.error("[Stripe] STRIPE_SECRET_KEY starts with 'pk_', which is a Publishable Key. You must use a Secret Key (sk_).");
    return null;
  }

  try {
    return new Stripe(key);
  } catch (err) {
    console.error("[Stripe] Failed to initialize Stripe client:", err);
    return null;
  }
};

async function startServer() {
  app.use(cors());

  // Stripe Webhook - MUST be before express.json() to get raw body
  app.post("/api/webhook/stripe", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const stripeClient = getStripe();
    const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!stripeClient || !endpointSecret || !sig) {
      console.error("Webhook Error: Missing configuration or signature");
      return res.status(400).send("Webhook Error: Missing configuration or signature");
    }

    let event;

    try {
      event = stripeClient.webhooks.constructEvent(req.body, sig, endpointSecret);
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const storeId = session.metadata?.storeId;
      
      console.log(`¡Pago exitoso recibido vía Webhook para la tienda: ${storeId}!`);
      // Aquí es donde actualizarías tu base de datos real (Firestore)
    }

    res.json({ received: true });
  });

  app.use(express.json());

  // API Routes
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Stripe Checkout Session for Subscriptions
  app.post("/api/create-checkout-session", async (req, res) => {
    const { planId, email, storeId } = req.body;
    const stripeClient = getStripe();

    if (!stripeClient) {
      return res.status(500).json({ error: "Stripe is not configured" });
    }

    try {
      console.log(`[Stripe] Creating checkout session. Plan: ${planId}, Email: ${email}, Store: ${storeId}`);
      
      const origin = process.env.APP_URL?.trim() || "http://localhost:3000";
      console.log(`[Stripe] Using origin for redirect: ${origin}`);

      // Map plans to Stripe Price IDs
      const priceMap: Record<string, string | undefined> = {
        basic: process.env.STRIPE_PRICE_BASIC?.trim(),
        pro: process.env.STRIPE_PRICE_PRO?.trim(),
        enterprise: process.env.STRIPE_PRICE_ENTERPRISE?.trim(),
      };

      const priceId = priceMap[planId];
      
      if (!priceId || priceId === "" || priceId.includes("placeholder")) {
        const msg = `El ID de precio para el plan '${planId}' no está configurado (valor actual: '${priceId}').`;
        console.error(`[Stripe] ${msg}`);
        return res.status(400).json({ error: msg });
      }

      console.log(`[Stripe] Using Price ID: ${priceId}`);

      const session = await stripeClient.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        mode: "subscription",
        customer_email: email,
        success_url: `${origin}/?payment=success&storeId=${storeId}&planId=${planId}`,
        cancel_url: `${origin}/?payment=cancel`,
        metadata: {
          storeId,
          planId,
        },
      });

      console.log("[Stripe] Checkout session created successfully:", session.url);
      res.json({ url: session.url });
    } catch (error: any) {
      console.error("[Stripe] Error details:", error);
      res.status(500).json({ 
        error: error.message,
        type: error.type,
        code: error.code
      });
    }
  });

  // Wompi Integration (Skeleton)
  app.post("/api/wompi/create-transaction", async (req, res) => {
    const { planId, email, storeId } = req.body;
    // Wompi requires a more complex flow (acceptance token, etc.)
    // For now, we'll return a configuration for the Wompi widget or a hosted link
    res.json({ 
      message: "Wompi integration pending configuration",
      publicKey: process.env.WOMPI_PUBLIC_KEY,
      // In a real app, we'd generate an integrity signature here
    });
  });

  // Geolocation helper
  app.get("/api/geo", async (req, res) => {
    try {
      // Using a free IP geo API
      const response = await axios.get("https://ipapi.co/json/");
      res.json({ country: response.data.country_name, countryCode: response.data.country_code });
    } catch (error) {
      res.json({ country: "Unknown", countryCode: "XX" });
    }
  });

  // LabsMobile SMS Integration
  app.post("/api/sms/send", async (req, res) => {
    const { to, message, tpoa: customTpoa } = req.body;
    const user = process.env.LABSMOBILE_USER?.trim();
    const token = process.env.LABSMOBILE_TOKEN?.trim();
    const tpoa = customTpoa || process.env.LABSMOBILE_TPOA?.trim() || "tienda";

    if (!user || !token) {
      console.error("[LabsMobile] Missing credentials (USER or TOKEN).");
      return res.status(500).json({ error: "SMS service not configured" });
    }

    if (!to || !message) {
      return res.status(400).json({ error: "Missing 'to' or 'message' field" });
    }

    try {
      console.log(`[LabsMobile] Sending SMS to ${to}...`);
      
      // LabsMobile uses Basic Auth (username:token)
      const auth = Buffer.from(`${user}:${token}`).toString("base64");

      const response = await axios.post(
        "https://api.labsmobile.com/json/send",
        {
          message: message,
          tpoa: tpoa,
          recipient: [
            {
              msisdn: to.replace(/\+/g, ""), // LabsMobile expects digits only
            },
          ],
        },
        {
          headers: {
            Authorization: `Basic ${auth}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("[LabsMobile] Response:", response.data);
      
      if (response.data.submited) {
        res.json({ success: true, messageId: response.data.submited });
      } else {
        res.status(500).json({ error: "Failed to send SMS", details: response.data });
      }
    } catch (error: any) {
      console.error("[LabsMobile] Error sending SMS:", error.response?.data || error.message);
      res.status(500).json({ 
        error: "Error communicating with SMS provider", 
        details: error.response?.data || error.message 
      });
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
