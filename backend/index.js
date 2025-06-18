const express = require("express");
const stripe = require("stripe")(
  process.env.STRIPE_SK
);
const bodyparser = require("body-parser");
const Cart = require("./models/Cart");
const cors = require("cors");
const connectDB = require("./utils/db");
const YOUR_DOMAIN = "http://localhost:5173"; // Replace with your frontend URL
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({
  path: ".env",
});

const app = express();

corsOptions = {
  origin: "http://localhost:5173", // Replace with your frontend URL
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
};

app.use(cors(corsOptions));

// Connect to the database
connectDB();

// Webhook handler for asynchronous events.
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    let data;
    let eventType;
    // Check if webhook signing is configured.
    if (process.env.STRIPE_WEBHOOK_SECRET) {
      // Retrieve the event by verifying the signature using the raw body and secret.
      let event;
      let signature = req.headers["stripe-signature"];

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          signature,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.log(`⚠️  Webhook signature verification failed.`);
        return res.sendStatus(400);
      }
      // Extract the object from the event.
      data = event.data;
      eventType = event.type;
    } else {
      // Webhook signing is recommended, but if the secret is not configured in `config.js`,
      // retrieve the event data directly from the request body.
      data = req.body.data;
      eventType = req.body.type;
    }

    if (eventType === "checkout.session.completed") {
      const session = data.object;

      // Update the cart in the database
      try {
        const cart = await Cart.findOne({ sessionId: session.id });
        if (cart) {
          cart.transaction.status = true;
          cart.transactionId = session.payment_intent;
          cart.transaction.amount = session.amount_total / 100; // Convert cents to dollars
          await cart.save();
          console.log(
            `Cart updated successfully for session ID: ${session.id}`
          );
        } else {
          console.log(`No cart found for session ID: ${session.id}`);
        }
      } catch (error) {
        console.error("Error updating cart:", error);
        return res.status(500).send("Internal Server Error");
      }

      console.log(`🔔  Payment received!`);
    }

    res.sendStatus(200);
  }
);

app.use(express.json());

app.get("/return", (req, res) => {
  res.sendFile(path.join(__dirname, "success.html"));
});

app.post("/create-checkout-session", async (req, res) => {
  console.log("Request body:", req.body); // log the incoming data
  const { products } = req.body;

  try {
    if (!products || !Array.isArray(products)) {
      return res
        .status(400)
        .json({ error: "Invalid or missing products array" });
    }
    const lineItems = products.map((product) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: product.name,
        },
        unit_amount: Math.round(product.price * 100),
      },
      quantity: product.quantity,
    }));

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      return_url: `http://localhost:8080/return`,
    });

    // Save the cart to the database
    const cart = new Cart({
      sessionId: session.id,
      productId: products.map((product) => product.id).join(","),
      transaction: {
        status: false,
      },
      transactionId: "",
    });

    await cart.save();
    console.log(`Cart saved successfully for session ID: ${session.id}`);

    res.json({ id: session.id });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    return res.status(500).send("Internal Server Error");
  }
});

app.get("/session-status", async (req, res) => {
  const session = await stripe.checkout.sessions.retrieve(req.query.session_id);

  res.send({
    status: session.status,
    customer_email: session.customer_details.email,
  });
});

app.listen(8080, () => {
  console.log(`Server is listening at port 8080`);
});
