// ============================================================
// SPARK 2026 — RAZORPAY TEST PAYMENT SERVER
// ============================================================

require("dotenv").config();

const express = require("express");
const Razorpay = require("razorpay");

const app = express();

const PORT = process.env.PORT || 3000;


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(express.json());


// Allow your local frontend
app.use((req, res, next) => {

    res.header(
        "Access-Control-Allow-Origin",
        "http://127.0.0.1:5500"
    );

    res.header(
        "Access-Control-Allow-Methods",
        "GET,POST,OPTIONS"
    );

    res.header(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(204);
    }

    next();

});


// ============================================================
// RAZORPAY
// ============================================================

const razorpay = new Razorpay({

    key_id: process.env.RAZORPAY_KEY_ID,

    key_secret: process.env.RAZORPAY_KEY_SECRET

});


// ============================================================
// EVENT CONFIGURATION
// ============================================================

const events = {

    ideaforge: {
        name: "iDeaForge",
        participants: 2,
        feePerParticipant: 200
    },

    circuitclash: {
        name: "Circuit Clash",
        participants: 2,
        feePerParticipant: 200
    },

    iqquest: {
        name: "iQuest",
        participants: 2,
        feePerParticipant: 200
    },

    codesprint: {
        name: "CodeSprint",
        participants: 1,
        feePerParticipant: 200
    }

};


// ============================================================
// HEALTH CHECK
// ============================================================

app.get("/", (req, res) => {

    res.json({

        success: true,

        message:
            "SPARK 2026 Payment Server is running!"

    });

});


// ============================================================
// CREATE RAZORPAY ORDER
// ============================================================

app.post("/api/create-order", async (req, res) => {

    try {

        const {
            eventId
        } = req.body;


        // ----------------------------------------------------
        // CHECK EVENT
        // ----------------------------------------------------

        const event = events[eventId];

        if (!event) {

            return res.status(400).json({

                success: false,

                message: "Invalid event."

            });

        }


        // ----------------------------------------------------
        // CALCULATE AMOUNT ON SERVER
        // ----------------------------------------------------
        //
        // IMPORTANT:
        // We do NOT trust the amount sent by the browser.
        //
        // Team events:
        // 2 × ₹200 = ₹400
        //
        // CodeSprint:
        // 1 × ₹200 = ₹200
        // ----------------------------------------------------

        const amountRupees =
            event.participants *
            event.feePerParticipant;


        const amountPaise =
            amountRupees * 100;


        // ----------------------------------------------------
        // UNIQUE RECEIPT
        // ----------------------------------------------------

        const receipt =
            `spark_${eventId}_${Date.now()}`;


        // ----------------------------------------------------
        // CREATE RAZORPAY ORDER
        // ----------------------------------------------------

        const order =
            await razorpay.orders.create({

                amount: amountPaise,

                currency: "INR",

                receipt: receipt,

                partial_payment: false,

                notes: {

                    event_id: eventId,

                    event_name: event.name,

                    participants:
                        String(event.participants)

                }

            });


        // ----------------------------------------------------
        // SEND ORDER TO FRONTEND
        // ----------------------------------------------------

        return res.json({

            success: true,

            keyId:
                process.env.RAZORPAY_KEY_ID,

            orderId:
                order.id,

            amount:
                order.amount,

            currency:
                order.currency,

            event:
                event.name,

            participants:
                event.participants,

            amountRupees:
                amountRupees

        });

    }

    catch (error) {

        console.error(
            "Razorpay order creation error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to create payment order."

        });

    }

});
// ============================================================
// VERIFY RAZORPAY PAYMENT
// ============================================================

const crypto = require("crypto");

app.post("/api/verify-payment", (req, res) => {

    try {

        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;


        // ----------------------------------------------------
        // CHECK REQUIRED PAYMENT DETAILS
        // ----------------------------------------------------

        if (
            !razorpay_order_id ||
            !razorpay_payment_id ||
            !razorpay_signature
        ) {

            return res.status(400).json({

                success: false,

                message:
                    "Payment verification details are missing."

            });

        }


        // ----------------------------------------------------
        // CREATE SIGNATURE
        // ----------------------------------------------------

        const generatedSignature =
            crypto
                .createHmac(
                    "sha256",
                    process.env.RAZORPAY_KEY_SECRET
                )
                .update(
                    razorpay_order_id +
                    "|" +
                    razorpay_payment_id
                )
                .digest("hex");


        // ----------------------------------------------------
        // COMPARE SIGNATURES
        // ----------------------------------------------------

        const isValid =
            generatedSignature ===
            razorpay_signature;


        if (!isValid) {

            console.error(
                "Invalid Razorpay payment signature."
            );

            return res.status(400).json({

                success: false,

                message:
                    "Payment verification failed."

            });

        }


        // ----------------------------------------------------
        // PAYMENT VERIFIED
        // ----------------------------------------------------

        console.log(
            "Payment verified successfully:",
            razorpay_payment_id
        );


        return res.json({

            success: true,

            message:
                "Payment verified successfully.",

            paymentId:
                razorpay_payment_id,

            orderId:
                razorpay_order_id

        });

    }

    catch (error) {

        console.error(
            "Payment verification error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Unable to verify payment."

        });

    }

});

// ============================================================
// START SERVER
// ============================================================

app.listen(PORT, () => {

    console.log(
        `SPARK 2026 server running on http://localhost:${PORT}`
    );

});