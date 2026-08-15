require("dotenv").config({
    path: require("path").join(__dirname, ".env")
});
// ============================================================
// IMPORTS
// ============================================================

const express = require("express");

const Razorpay = require("razorpay");

const crypto = require("crypto");

const {
    MongoClient
} = require("mongodb");

const bcrypt = require("bcryptjs");

const jwt = require("jsonwebtoken");

const cookieParser =
    require("cookie-parser");

const nodemailer =
    require("nodemailer");


// ============================================================
// EXPRESS APP
// ============================================================

const app =
    express();


// ============================================================
// SERVER PORT
// ============================================================

const PORT =
    process.env.PORT || 3000;


// ============================================================
// MIDDLEWARE
// ============================================================

app.use(
    express.json()
);


app.use(
    cookieParser()
);


// ============================================================
// CORS
// ============================================================

const allowedOrigins = [

    // --------------------------------------------------------
    // LOCAL DEVELOPMENT
    // --------------------------------------------------------

    "http://127.0.0.1:5500",

    "http://localhost:5500",


    // --------------------------------------------------------
    // GITHUB PAGES
    // --------------------------------------------------------

    "https://priya1266.github.io",


    // --------------------------------------------------------
    // LIVE DOMAIN
    // --------------------------------------------------------
    // We will use this when the backend is deployed.
    // Keeping it here now is harmless.
    // --------------------------------------------------------

    "https://sistsparkece26.com"

];


app.use(
    (req, res, next) => {

        const origin =
            req.headers.origin;


        if (
            allowedOrigins.includes(
                origin
            )
        ) {

            res.header(
                "Access-Control-Allow-Origin",
                origin
            );

        }


        res.header(
            "Access-Control-Allow-Methods",
            "GET,POST,OPTIONS"
        );


        res.header(
            "Access-Control-Allow-Headers",
            "Content-Type"
        );


        // IMPORTANT:
        // Required for admin authentication
        // cookies.

        res.header(
            "Access-Control-Allow-Credentials",
            "true"
        );


        if (
            req.method === "OPTIONS"
        ) {

            return res.sendStatus(
                204
            );

        }


        next();

    }
);


// ============================================================
// RAZORPAY
// ============================================================

const razorpay =
    new Razorpay({

        key_id:
            process.env
                .RAZORPAY_KEY_ID,

        key_secret:
            process.env
                .RAZORPAY_KEY_SECRET

    });


// ============================================================
// MONGODB
// ============================================================

const mongoClient =
    new MongoClient(
        process.env.MONGODB_URI
    );


let database;
let registrationsCollection;
let databaseConnectionPromise = null;

// ============================================================
// ACKNOWLEDGEMENT EMAIL TRANSPORTER
// ============================================================
//
// This will be used only after an admin verifies
// a registration.
//
// IMPORTANT:
// SMTP_USER and SMTP_PASS must be present
// in server/.env
//
// We will add the actual email function in
// Module 8.
//

const emailTransporter =
    nodemailer.createTransport({

        host:
            process.env.SMTP_HOST,

        port:
            Number(
                process.env.SMTP_PORT ||
                465
            ),

        secure:
            process.env.SMTP_SECURE ===
            "true",

        auth: {

            user:
                process.env.SMTP_USER,

            pass:
                process.env.SMTP_PASS

        }

    });


// ============================================================
// EMAIL CONNECTION TEST
// ============================================================
//
// This does NOT send an email.
//
// It simply checks the SMTP configuration when
// the server starts.
//
// If SMTP credentials are missing, the server
// will still start because payment/admin
// functionality should continue to work.
//

async function verifyEmailTransporter() {

    if (
        !process.env.SMTP_USER ||
        !process.env.SMTP_PASS
    ) {

        console.log(
            "⚠️ Email: SMTP credentials not configured yet."
        );

        return;

    }


    try {

        await emailTransporter.verify();

        console.log(
            "✅ Email: SMTP connection READY"
        );

    }

    catch (error) {

        console.error(
            "⚠️ Email SMTP connection failed:"
        );

        console.error(
            error.message
        );

        console.log(
            "⚠️ Payment and admin functions will continue to work."
        );

    }

}
// ============================================================
// EVENT CONFIGURATION
// ============================================================

const events = {

    // ========================================================
    // IDEA FORGE
    // ========================================================

    ideaforge: {

        name:
            "iDeaForge",

        participants:
            2,

        feePerParticipant:
            200,

        code:
            "IDF"

    },


    // ========================================================
    // CIRCUIT CLASH
    // ========================================================

    circuitclash: {

        name:
            "Circuit Clash",

        participants:
            2,

        feePerParticipant:
            200,

        code:
            "CC"

    },


    // ========================================================
    // IQUEST
    // ========================================================

    iqquest: {

        name:
            "iQuest",

        participants:
            2,

        feePerParticipant:
            200,

        code:
            "IQ"

    },


    // ========================================================
    // CODESPRINT
    // ========================================================

    codesprint: {

        name:
            "CodeSprint",

        participants:
            1,

        feePerParticipant:
            200,

        code:
            "CS"

    }

};


// ============================================================
// GENERATE REGISTRATION CODE
// ============================================================
//
// Example:
//
// SPK26-CS-MSTX9UB0-9B9BC1
//
// The code contains:
// SPK26
// Event code
// Timestamp
// Random value
//
// This is generated on the SERVER.
// The frontend cannot choose the registration ID.
//

function generateRegistrationCode(
    event
) {

    const timestamp =
        Date.now()
            .toString(36)
            .toUpperCase();


    const random =
        crypto
            .randomBytes(3)
            .toString("hex")
            .toUpperCase();


    return (
        `SPK26-${event.code}-${timestamp}-${random}`
    );

}
async function connectDatabase() {

    // If already connected, do nothing
    if (database && registrationsCollection) {
        return;
    }

    // If connection is already in progress,
    // wait for the same connection
    if (databaseConnectionPromise) {
        return databaseConnectionPromise;
    }

    databaseConnectionPromise = (async () => {

        try {

            console.log("Connecting to MongoDB...");

            await mongoClient.connect();

            database = mongoClient.db(
                process.env.MONGODB_DB_NAME
            );

            registrationsCollection =
                database.collection("registrations");


            // ====================================================
            // DATABASE INDEXES
            // ====================================================

            await registrationsCollection.createIndex(
                {
                    registrationId: 1
                },
                {
                    unique: true
                }
            );


            await registrationsCollection.createIndex(
                {
                    razorpayOrderId: 1
                },
                {
                    unique: true
                }
            );


            await registrationsCollection.createIndex(
                {
                    razorpayPaymentId: 1
                },
                {
                    unique: true,
                    sparse: true
                }
            );


            await registrationsCollection.createIndex(
                {
                    verificationStatus: 1
                }
            );


            console.log(
                "✅ MongoDB connected successfully."
            );

            console.log(
                `✅ Database: ${process.env.MONGODB_DB_NAME}`
            );

            console.log(
                "✅ Collection: registrations"
            );

        }

        catch (error) {

            console.error(
                "❌ MongoDB connection failed:"
            );

            console.error(error);

            databaseConnectionPromise = null;

            throw error;
        }

    })();

    return databaseConnectionPromise;
}
// ============================================================
// ADMIN AUTHENTICATION
// ============================================================


// ============================================================
// CREATE ADMIN JWT
// ============================================================

function createAdminToken() {

    return jwt.sign(

        {

            role:
                "admin",

            username:
                process.env.ADMIN_USERNAME

        },

        process.env.JWT_SECRET,

        {

            expiresIn:
                "8h"

        }

    );

}


// ============================================================
// ADMIN LOGIN
// ============================================================

app.post(

    "/api/admin/login",

    async (req, res) => {

        try {

            const {
                username,
                password
            } = req.body;


            // ------------------------------------------------
            // CHECK INPUT
            // ------------------------------------------------

            if (
                !username ||
                !password
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Username and password are required."

                });

            }


            // ------------------------------------------------
            // CHECK USERNAME
            // ------------------------------------------------

            if (
                username !==
                process.env.ADMIN_USERNAME
            ) {

                return res.status(401).json({

                    success:
                        false,

                    message:
                        "Invalid username or password."

                });

            }


            // ------------------------------------------------
            // CHECK PASSWORD
            // ------------------------------------------------

            const passwordValid =
                await bcrypt.compare(

                    password,

                    process.env
                        .ADMIN_PASSWORD_HASH

                );


            if (!passwordValid) {

                return res.status(401).json({

                    success:
                        false,

                    message:
                        "Invalid username or password."

                });

            }


            // ------------------------------------------------
            // CREATE JWT
            // ------------------------------------------------

            const token =
                createAdminToken();


            // ------------------------------------------------
            // STORE JWT IN HTTP-ONLY COOKIE
            // ------------------------------------------------

            res.cookie(

                "spark_admin_token",

                token,

                {

                    httpOnly:
                        true,

                    secure:
                        process.env.NODE_ENV ===
                        "production",

                    sameSite:
                        "lax",

                    maxAge:
                        8 *
                        60 *
                        60 *
                        1000

                }

            );


            // ------------------------------------------------
            // SUCCESS
            // ------------------------------------------------

            return res.json({

                success:
                    true,

                message:
                    "Admin login successful."

            });

        }


        catch (error) {

            console.error(
                "Admin login error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to process admin login."

            });

        }

    }

);


// ============================================================
// ADMIN AUTHENTICATION MIDDLEWARE
// ============================================================

function requireAdmin(
    req,
    res,
    next
) {

    try {

        // ----------------------------------------------------
        // GET TOKEN FROM COOKIE
        // ----------------------------------------------------

        const token =
            req.cookies
                .spark_admin_token;


        if (!token) {

            return res.status(401).json({

                success:
                    false,

                message:
                    "Admin authentication required."

            });

        }


        // ----------------------------------------------------
        // VERIFY JWT
        // ----------------------------------------------------

        const decoded =
            jwt.verify(

                token,

                process.env.JWT_SECRET

            );


        // ----------------------------------------------------
        // CHECK ROLE
        // ----------------------------------------------------

        if (
            decoded.role !==
            "admin"
        ) {

            return res.status(403).json({

                success:
                    false,

                message:
                    "Administrator access required."

            });

        }


        // ----------------------------------------------------
        // STORE ADMIN INFORMATION
        // ----------------------------------------------------

        req.admin =
            decoded;


        next();

    }


    catch (error) {

        return res.status(401).json({

            success:
                false,

            message:
                "Admin session is invalid or expired."

        });

    }

}


// ============================================================
// ADMIN SESSION CHECK
// ============================================================

app.get(

    "/api/admin/session",

    requireAdmin,

    (req, res) => {

        return res.json({

            success:
                true,

            username:
                req.admin.username,

            role:
                req.admin.role

        });

    }

);


// ============================================================
// ADMIN LOGOUT
// ============================================================

app.post(

    "/api/admin/logout",

    requireAdmin,

    (req, res) => {

        res.clearCookie(

            "spark_admin_token",

            {

                httpOnly:
                    true,

                sameSite:
                    "lax",

                secure:
                    process.env.NODE_ENV ===
                    "production"

            }

        );


        return res.json({

            success:
                true,

            message:
                "Admin logged out successfully."

        });

    }

);
// ============================================================
// HEALTH CHECK
// ============================================================

app.get(

    "/",

    (req, res) => {

        res.json({

            success:
                true,

            message:
                "SPARK 2026 Payment + Registration Server is running!",

            database:
                database
                    ? "connected"
                    : "not connected"

        });

    }

);


// ============================================================
// CREATE RAZORPAY ORDER
// ============================================================

app.post(

    "/api/create-order",

    async (req, res) => {

        try {

            // ==================================================
            // ENSURE MONGODB IS READY
            // ==================================================

            await connectDatabase();


            // ==================================================
            // CHECK RAZORPAY CONFIGURATION
            // ==================================================

            if (
                !process.env.RAZORPAY_KEY_ID ||
                !process.env.RAZORPAY_KEY_SECRET
            ) {

                console.error(
                    "❌ Razorpay environment variables are missing."
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Payment configuration is missing."

                });

            }


            // ==================================================
            // GET EVENT ID
            // ==================================================

            const {
                eventId
            } = req.body;


            // ==================================================
            // CHECK EVENT ID
            // ==================================================

            if (!eventId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Event ID is required."

                });

            }


            // ==================================================
            // CHECK EVENT
            // ==================================================

            const event =
                events[eventId];


            if (!event) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid event."

                });

            }


            // ==================================================
            // CALCULATE AMOUNT SERVER-SIDE
            // ==================================================

            const amountRupees =

                Number(
                    event.participants
                ) *

                Number(
                    event.feePerParticipant
                );


            const amountPaise =

                amountRupees * 100;


            // ==================================================
            // VALIDATE AMOUNT
            // ==================================================

            if (
                !Number.isFinite(amountPaise) ||
                amountPaise <= 0
            ) {

                console.error(
                    "❌ Invalid payment amount:",
                    amountPaise
                );

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid payment amount."

                });

            }


            // ==================================================
            // UNIQUE RAZORPAY RECEIPT
            // ==================================================

            const receipt =

                `spark_${eventId}_${Date.now()}`;


            // ==================================================
            // CREATE RAZORPAY ORDER
            // ==================================================

            console.log(
                "=========================================="
            );

            console.log(
                "Creating Razorpay order..."
            );

            console.log(
                `Event ID: ${eventId}`
            );

            console.log(
                `Event: ${event.name}`
            );

            console.log(
                `Participants: ${event.participants}`
            );

            console.log(
                `Fee / Participant: ₹${event.feePerParticipant}`
            );

            console.log(
                `Total Amount: ₹${amountRupees}`
            );


            const order =

                await razorpay.orders.create({

                    amount:
                        amountPaise,

                    currency:
                        "INR",

                    receipt:
                        receipt,

                    partial_payment:
                        false,

                    notes: {

                        event_id:
                            eventId,

                        event_name:
                            event.name,

                        participants:
                            String(
                                event.participants
                            ),

                        amount_rupees:
                            String(
                                amountRupees
                            )

                    }

                });


            // ==================================================
            // CHECK ORDER RESPONSE
            // ==================================================

            if (
                !order ||
                !order.id
            ) {

                console.error(
                    "❌ Razorpay did not return a valid order."
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Unable to create payment order."

                });

            }


            // ==================================================
            // SUCCESS LOG
            // ==================================================

            console.log(
                `✅ Razorpay Order Created: ${order.id}`
            );

            console.log(
                "=========================================="
            );


            // ==================================================
            // SERVER RESPONSE
            // ==================================================

            return res.json({

                success:
                    true,

                keyId:
                    process.env
                        .RAZORPAY_KEY_ID,

                orderId:
                    order.id,

                amount:
                    order.amount,

                currency:
                    order.currency,

                event:
                    event.name,

                eventId:
                    eventId,

                participants:
                    event.participants,

                amountRupees:
                    amountRupees

            });

        }


        // ======================================================
        // ERROR
        // ======================================================

        catch (error) {

            console.error(
                "❌ Razorpay order creation error:"
            );

            console.error(
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to create payment order."

            });

        }

    }

);
// ============================================================
// VERIFY PAYMENT + SAVE REGISTRATION
// ============================================================

app.post(
    "/api/verify-payment",

    async (req, res) => {

        try {

            // ==================================================
            // ENSURE MONGODB IS READY
            // ==================================================

            await connectDatabase();


            if (!registrationsCollection) {

                console.error(
                    "❌ registrationsCollection is not initialized."
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Database is not ready. Please try again."
                });

            }


            // ==================================================
            // GET PAYMENT + REGISTRATION DATA
            // ==================================================

            const {

                razorpay_order_id,

                razorpay_payment_id,

                razorpay_signature,

                eventId,

                registration

            } = req.body;


            // ==================================================
            // CHECK PAYMENT DETAILS
            // ==================================================

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


            // ==================================================
            // CHECK EVENT ID
            // ==================================================

            if (!eventId) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Event ID is missing."

                });

            }


            // ==================================================
            // CHECK REGISTRATION DATA
            // ==================================================

            if (

                !registration ||

                !Array.isArray(
                    registration.participants
                ) ||

                registration.participants.length === 0

            ) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Registration information is missing."

                });

            }


            // ==================================================
            // CHECK EVENT
            // ==================================================

            const event =
                events[eventId];


            if (!event) {

                return res.status(400).json({

                    success: false,

                    message:
                        "Invalid event."

                });

            }


            // ==================================================
            // VERIFY RAZORPAY SIGNATURE
            // ==================================================

            const razorpaySecret =
                process.env.RAZORPAY_KEY_SECRET;


            if (!razorpaySecret) {

                console.error(
                    "❌ RAZORPAY_KEY_SECRET is not configured."
                );

                return res.status(500).json({

                    success: false,

                    message:
                        "Payment configuration error."

                });

            }


            const generatedSignature =

                crypto

                    .createHmac(
                        "sha256",
                        razorpaySecret
                    )

                    .update(

                        razorpay_order_id +
                        "|" +
                        razorpay_payment_id

                    )

                    .digest("hex");


            // ==================================================
            // SAFE SIGNATURE COMPARISON
            // ==================================================

            let isValid = false;


            if (

                generatedSignature.length ===
                razorpay_signature.length

            ) {

                isValid =

                    crypto.timingSafeEqual(

                        Buffer.from(
                            generatedSignature,
                            "utf8"
                        ),

                        Buffer.from(
                            razorpay_signature,
                            "utf8"
                        )

                    );

            }


            // ==================================================
            // INVALID SIGNATURE
            // ==================================================

            if (!isValid) {

                console.error(
                    "❌ Invalid Razorpay payment signature."
                );

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment verification failed."

                });

            }


            // ==================================================
            // FETCH ACTUAL RAZORPAY ORDER
            // ==================================================

            const razorpayOrder =

                await razorpay.orders.fetch(
                    razorpay_order_id
                );


            // ==================================================
            // VERIFY ORDER BELONGS TO EXPECTED EVENT
            // ==================================================

            if (

                razorpayOrder.notes &&

                razorpayOrder.notes.event_id &&

                razorpayOrder.notes.event_id !==
                    eventId

            ) {

                console.error(
                    "❌ Razorpay order event mismatch."
                );

                return res.status(400).json({

                    success: false,

                    message:
                        "Payment event verification failed."

                });

            }


            // ==================================================
            // VERIFY ACTUAL PAYMENT AMOUNT
            // ==================================================

            const expectedAmount =

                event.participants *

                event.feePerParticipant *

                100;


            if (

                Number(
                    razorpayOrder.amount
                ) !==

                Number(
                    expectedAmount
                )

            ) {

                console.error(
                    "❌ Razorpay amount mismatch."
                );

                console.error(
                    "Expected:",
                    expectedAmount
                );

                console.error(
                    "Received:",
                    razorpayOrder.amount
                );


                return res.status(400).json({

                    success: false,

                    message:
                        "Payment amount does not match the event fee."

                });

            }


            // ==================================================
            // VERIFY RAZORPAY ORDER PAYMENT STATUS
            // ==================================================

            if (
                razorpayOrder.status &&
                razorpayOrder.status !== "paid"
            ) {

                console.error(
                    "❌ Razorpay order is not marked as paid."
                );

                return res.status(400).json({

                    success: false,

                    message:
                        "Razorpay payment is not completed."

                });

            }


            // ==================================================
            // PREVENT DUPLICATE PAYMENT RECORD
            // ==================================================

            const existingPayment =

                await registrationsCollection.findOne({

                    razorpayPaymentId:
                        razorpay_payment_id

                });


            if (existingPayment) {

                console.log(
                    "⚠️ Payment already recorded."
                );


                return res.json({

                    success: true,

                    message:
                        "Payment was already recorded.",

                    registrationId:
                        existingPayment.registrationId,

                    paymentId:
                        existingPayment
                            .razorpayPaymentId,

                    orderId:
                        existingPayment
                            .razorpayOrderId,

                    paymentStatus:
                        existingPayment
                            .paymentStatus,

                    verificationStatus:
                        existingPayment
                            .verificationStatus,

                    acknowledgementSent:
                        existingPayment
                            .acknowledgementSent

                });

            }


            // ==================================================
            // VERIFY PARTICIPANT COUNT
            // ==================================================

            if (

                registration.participants.length !==
                Number(event.participants)

            ) {

                console.error(
                    "❌ Participant count mismatch."
                );

                return res.status(400).json({

                    success: false,

                    message:
                        "Participant count does not match the selected event."

                });

            }


            // ==================================================
            // GENERATE SERVER-SIDE REGISTRATION ID
            // ==================================================

            const registrationId =

                generateRegistrationCode(
                    event
                );


            // ==================================================
            // PRIMARY PARTICIPANT / PAYER
            // ==================================================

            const primaryParticipant =

                registration.participants[0] ||
                {};


            // ==================================================
            // BUILD DATABASE RECORD
            // ==================================================

            const databaseRecord = {

                // ==================================================
                // REGISTRATION
                // ==================================================

                registrationId:
                    registrationId,


                // ==================================================
                // EVENT
                // ==================================================

                eventId:
                    eventId,

                eventName:
                    event.name,

                eventDate:
                    registration.date ||
                    event.date ||
                    null,

                eventTime:
                    registration.time ||
                    event.time ||
                    null,

                eventVenue:
                    registration.venue ||
                    event.venue ||
                    null,


                // ==================================================
                // PARTICIPATION
                // ==================================================

                participation:
                    registration.participation ||
                    null,

                participantCount:
                    event.participants,

                teamName:
                    registration.teamName ||
                    "",


                // ==================================================
                // PARTICIPANTS
                // ==================================================

                participants:
                    registration.participants,


                // ==================================================
                // PRIMARY PARTICIPANT / PAYER
                // ==================================================

                payerName:
                    primaryParticipant.name ||
                    "",

                payerEmail:
                    primaryParticipant.email ||
                    "",

                payerPhone:
                    primaryParticipant.phone ||
                    "",


                // ==================================================
                // PAYMENT
                // ==================================================

                amount:

                    event.participants *
                    event.feePerParticipant,

                currency:
                    "INR",

                razorpayOrderId:
                    razorpay_order_id,

                razorpayPaymentId:
                    razorpay_payment_id,


                // ==================================================
                // PAYMENT STATUS
                // ==================================================

                paymentStatus:
                    "PAID",


                // ==================================================
                // MANUAL VERIFICATION
                // ==================================================

                verificationStatus:
                    "PENDING",

                verifiedAt:
                    null,

                verifiedBy:
                    null,


                // ==================================================
                // ACKNOWLEDGEMENT EMAIL
                // ==================================================

                acknowledgementSent:
                    false,

                acknowledgementSentAt:
                    null,


                // ==================================================
                // TIMESTAMPS
                // ==================================================

                createdAt:
                    new Date(),

                updatedAt:
                    new Date()

            };


            // ==================================================
            // SAVE REGISTRATION TO MONGODB
            // ==================================================

            await registrationsCollection.insertOne(
                databaseRecord
            );


            // ==================================================
            // SERVER CONSOLE
            // ==================================================

            console.log(
                "=========================================="
            );

            console.log(
                "✅ PAYMENT VERIFIED"
            );

            console.log(
                `Registration ID: ${registrationId}`
            );

            console.log(
                `Event: ${event.name}`
            );

            console.log(
                `Payment ID: ${razorpay_payment_id}`
            );

            console.log(
                "Payment Status: PAID"
            );

            console.log(
                "Verification Status: PENDING"
            );

            console.log(
                "Acknowledgement Email: NOT SENT"
            );

            console.log(
                "MongoDB Save: SUCCESS"
            );

            console.log(
                "=========================================="
            );


            // ==================================================
            // RESPONSE TO FRONTEND
            // ==================================================

            return res.json({

                success: true,

                message:
                    "Payment verified and registration submitted for manual verification.",

                registrationId:
                    registrationId,

                paymentId:
                    razorpay_payment_id,

                orderId:
                    razorpay_order_id,

                paymentStatus:
                    "PAID",

                verificationStatus:
                    "PENDING",

                acknowledgementSent:
                    false

            });

        }


        // ======================================================
        // ERROR
        // ======================================================

        catch (error) {

            console.error(
                "❌ Payment verification / registration error:"
            );

            console.error(
                error
            );


            return res.status(500).json({

                success: false,

                message:
                    "Payment was received, but the registration could not be saved. Please contact the event coordinator."

            });

        }

    }

);
// ============================================================
// ADMIN — GET PENDING REGISTRATIONS
// ============================================================
//
// This endpoint is protected.
// Only a logged-in administrator can access it.
//
// The Admin Dashboard calls this endpoint to display
// registrations waiting for manual verification.
//
// ============================================================

app.get(

    "/api/admin/registrations",

    requireAdmin,

    async (req, res) => {

        try {

            // ==================================================
            // FETCH PENDING REGISTRATIONS
            // ==================================================

            const registrations =

                await registrationsCollection

                    .find({

                        verificationStatus:
                            "PENDING"

                    })

                    .sort({

                        createdAt:
                            -1

                    })

                    .toArray();


            // ==================================================
            // SEND RESPONSE
            // ==================================================

            return res.json({

                success:
                    true,

                count:
                    registrations.length,

                registrations:
                    registrations

            });

        }


        // ======================================================
        // ERROR
        // ======================================================

        catch (error) {

            console.error(

                "Admin registration fetch error:",

                error

            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load registrations."

            });

        }

    }

);
// ============================================================
// ACKNOWLEDGEMENT EMAIL FUNCTION
// ============================================================
//
// This function sends the participant an email after the
// administrator verifies the registration.
//
// It does NOT send an email when payment is made.
// The email is sent ONLY after admin verification.
//
// ============================================================

async function sendAcknowledgementEmail(
    registration
) {

    // ========================================================
    // CHECK PARTICIPANT EMAIL
    // ========================================================

    if (
        !registration.payerEmail
    ) {

        throw new Error(
            "Participant email address is missing."
        );

    }


    // ========================================================
    // PARTICIPANT NAMES
    // ========================================================

    let participantNames =
        "Participant";


    if (
        Array.isArray(
            registration.participants
        ) &&
        registration.participants.length > 0
    ) {

        participantNames =

            registration.participants

                .map(
                    participant =>
                        participant.name ||
                        "Participant"
                )

                .join(", ");

    }


    // ========================================================
    // PAYMENT AMOUNT
    // ========================================================

    const amount =

        registration.amount !== undefined &&
        registration.amount !== null

            ? `₹${registration.amount}`

            : "—";


    // ========================================================
    // FROM NAME
    // ========================================================

    const fromName =

        process.env.EMAIL_FROM_NAME ||

        "SPARK 2026";


    // ========================================================
    // SENDER EMAIL
    // ========================================================

    const fromEmail =
        process.env.SMTP_USER;


    // ========================================================
    // EVENT INFORMATION
    // ========================================================

    const eventDate =

        registration.eventDate ||

        "As announced";


    const eventTime =

        registration.eventTime ||

        "As announced";


    const eventVenue =

        registration.eventVenue ||

        "Sathyabama Institute of Science and Technology";


    // ========================================================
    // SEND EMAIL
    // ========================================================

    await emailTransporter.sendMail({

        // ----------------------------------------------------
        // FROM
        // ----------------------------------------------------

        from:

            `"${fromName}" <${fromEmail}>`,


        // ----------------------------------------------------
        // TO
        // ----------------------------------------------------

        to:

            registration.payerEmail,


        // ----------------------------------------------------
        // SUBJECT
        // ----------------------------------------------------

        subject:

            `SPARK 2026 - Registration Confirmed | ${registration.eventName}`,


        // ====================================================
        // PLAIN TEXT VERSION
        // ====================================================

        text:

`Dear ${registration.payerName || "Participant"},

Your registration for SPARK 2026 has been successfully verified by the event administration team.

REGISTRATION DETAILS
------------------------------------------

Registration ID : ${registration.registrationId}

Event           : ${registration.eventName}

Participation   : ${registration.participation || "—"}

Team Name       : ${registration.teamName || "—"}

Participants    : ${participantNames}


EVENT INFORMATION
------------------------------------------

Date            : ${eventDate}

Time            : ${eventTime}

Venue           : ${eventVenue}


PAYMENT DETAILS
------------------------------------------

Amount          : ${amount}

Payment Status  : ${registration.paymentStatus || "PAID"}

Payment ID      : ${registration.razorpayPaymentId || "—"}


Your registration has now been officially verified.

Please keep your Registration ID safely for future reference.

We look forward to welcoming you to SPARK 2026.

Regards,

SPARK 2026 Organising Team

Department of Electronics and Communication Engineering

Sathyabama Institute of Science and Technology

Chennai
`,


        // ====================================================
        // HTML VERSION
        // ====================================================

        html: `

<!DOCTYPE html>

<html>

<head>

    <meta charset="UTF-8">

    <title>
        SPARK 2026 Registration Confirmation
    </title>

</head>


<body
    style="
        margin:0;
        padding:0;
        background:#f4f8ff;
        font-family:Arial,Helvetica,sans-serif;
        color:#16213e;
    "
>


    <div
        style="
            max-width:650px;
            margin:40px auto;
            background:#ffffff;
            border-radius:16px;
            overflow:hidden;
            box-shadow:0 10px 30px rgba(14,42,82,0.12);
        "
    >


        <!-- ============================================
             HEADER
             ============================================ -->

        <div
            style="
                background:linear-gradient(
                    135deg,
                    #081833,
                    #1565c0
                );
                padding:30px;
                text-align:center;
                color:#ffffff;
            "
        >

            <h1
                style="
                    margin:0;
                    font-size:32px;
                    letter-spacing:1px;
                "
            >
                SPARK 2026
            </h1>


            <p
                style="
                    margin:8px 0 0;
                    color:#dce8fa;
                    font-size:16px;
                "
            >
                Registration Confirmation
            </p>

        </div>



        <!-- ============================================
             CONTENT
             ============================================ -->

        <div
            style="
                padding:35px;
            "
        >


            <p>

                Dear

                <strong>
                    ${registration.payerName || "Participant"}
                </strong>,

            </p>


            <p>

                Your registration for

                <strong>
                    SPARK 2026
                </strong>

                has been successfully verified by
                the event administration team.

            </p>



            <!-- ========================================
                 REGISTRATION DETAILS
                 ======================================== -->

            <div
                style="
                    margin-top:25px;
                    padding:22px;
                    background:#f4f8ff;
                    border-radius:12px;
                "
            >

                <h2
                    style="
                        margin-top:0;
                        color:#1565c0;
                        font-size:20px;
                    "
                >
                    Registration Details
                </h2>


                <p>

                    <strong>
                        Registration ID:
                    </strong>

                    ${registration.registrationId}

                </p>


                <p>

                    <strong>
                        Event:
                    </strong>

                    ${registration.eventName}

                </p>


                <p>

                    <strong>
                        Participation:
                    </strong>

                    ${registration.participation || "—"}

                </p>


                <p>

                    <strong>
                        Team Name:
                    </strong>

                    ${registration.teamName || "—"}

                </p>


                <p>

                    <strong>
                        Participants:
                    </strong>

                    ${participantNames}

                </p>

            </div>



            <!-- ========================================
                 EVENT INFORMATION
                 ======================================== -->

            <div
                style="
                    margin-top:20px;
                    padding:22px;
                    border:1px solid #e1e7f2;
                    border-radius:12px;
                "
            >

                <h2
                    style="
                        margin-top:0;
                        color:#1565c0;
                        font-size:20px;
                    "
                >
                    Event Information
                </h2>


                <p>

                    <strong>
                        Date:
                    </strong>

                    ${eventDate}

                </p>


                <p>

                    <strong>
                        Time:
                    </strong>

                    ${eventTime}

                </p>


                <p>

                    <strong>
                        Venue:
                    </strong>

                    ${eventVenue}

                </p>

            </div>



            <!-- ========================================
                 PAYMENT INFORMATION
                 ======================================== -->

            <div
                style="
                    margin-top:20px;
                    padding:22px;
                    background:#f4f8ff;
                    border-radius:12px;
                "
            >

                <h2
                    style="
                        margin-top:0;
                        color:#1565c0;
                        font-size:20px;
                    "
                >
                    Payment Details
                </h2>


                <p>

                    <strong>
                        Amount:
                    </strong>

                    ${amount}

                </p>


                <p>

                    <strong>
                        Payment Status:
                    </strong>

                    ${registration.paymentStatus || "PAID"}

                </p>


                <p>

                    <strong>
                        Payment ID:
                    </strong>

                    ${registration.razorpayPaymentId || "—"}

                </p>

            </div>



            <!-- ========================================
                 VERIFIED MESSAGE
                 ======================================== -->

            <div
                style="
                    margin-top:25px;
                    padding:18px;
                    background:#ecfdf5;
                    border:1px solid #a7f3d0;
                    border-radius:10px;
                    color:#065f46;
                    text-align:center;
                "
            >

                <strong>

                    ✓ Registration Verified Successfully

                </strong>

            </div>



            <p
                style="
                    margin-top:28px;
                "
            >

                Please keep your

                <strong>
                    Registration ID
                </strong>

                safely for future reference.

            </p>


            <p>

                We look forward to welcoming you
                to <strong>SPARK 2026</strong>.

            </p>



            <!-- ========================================
                 SIGNATURE
                 ======================================== -->

            <p
                style="
                    margin-top:30px;
                    line-height:1.7;
                "
            >

                Regards,

                <br>

                <strong>
                    SPARK 2026 Organising Team
                </strong>

                <br>

                Department of Electronics and
                Communication Engineering

                <br>

                Sathyabama Institute of Science
                and Technology

                <br>

                Chennai

            </p>

        </div>



        <!-- ============================================
             FOOTER
             ============================================ -->

        <div
            style="
                padding:18px;
                text-align:center;
                background:#081833;
                color:#dce8fa;
                font-size:12px;
            "
        >

            SPARK 2026 · Department of ECE

        </div>


    </div>


</body>

</html>

`

    });

}
// ============================================================
// ADMIN — VERIFY REGISTRATION
// ============================================================
//
// Flow:
//
// Admin clicks VERIFY
//        ↓
// Registration → VERIFIED
//        ↓
// Acknowledgement email sent
//        ↓
// acknowledgementSent → true
//
// If email fails:
//
// Registration remains VERIFIED
// acknowledgementSent remains false
//
// This allows the email to be retried later.
//
// ============================================================

app.post(

    "/api/admin/registrations/:registrationId/verify",

    requireAdmin,

    async (req, res) => {

        try {

            // ==================================================
            // GET REGISTRATION ID
            // ==================================================

            const registrationId =

                req.params.registrationId;


            // ==================================================
            // FIND REGISTRATION
            // ==================================================

            const registration =

                await registrationsCollection.findOne({

                    registrationId:
                        registrationId

                });


            // ==================================================
            // REGISTRATION NOT FOUND
            // ==================================================

            if (!registration) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Registration not found."

                });

            }


            // ==================================================
            // ALREADY VERIFIED + EMAIL ALREADY SENT
            // ==================================================

            if (

                registration.verificationStatus ===
                    "VERIFIED"

                &&

                registration.acknowledgementSent ===
                    true

            ) {

                return res.json({

                    success:
                        true,

                    message:
                        "Registration is already verified and acknowledgement email has already been sent.",

                    registrationId:
                        registrationId,

                    verificationStatus:
                        "VERIFIED",

                    acknowledgementSent:
                        true

                });

            }


            // ==================================================
            // VERIFY REGISTRATION
            // ==================================================

            await registrationsCollection.updateOne(

                {

                    registrationId:
                        registrationId

                },

                {

                    $set: {

                        verificationStatus:
                            "VERIFIED",

                        verifiedAt:
                            new Date(),

                        verifiedBy:
                            req.admin.username,

                        updatedAt:
                            new Date()

                    }

                }

            );


            // ==================================================
            // GET UPDATED REGISTRATION
            // ==================================================

            const verifiedRegistration =

                await registrationsCollection.findOne({

                    registrationId:
                        registrationId

                });


            // ==================================================
            // SEND ACKNOWLEDGEMENT EMAIL
            // ==================================================

            try {

                await sendAcknowledgementEmail(

                    verifiedRegistration

                );


                // ==================================================
                // EMAIL SUCCESS
                // ==================================================

                await registrationsCollection.updateOne(

                    {

                        registrationId:
                            registrationId

                    },

                    {

                        $set: {

                            acknowledgementSent:
                                true,

                            acknowledgementSentAt:
                                new Date(),

                            updatedAt:
                                new Date()

                        }

                    }

                );


                // ==================================================
                // CONSOLE LOG
                // ==================================================

                console.log(
                    "=========================================="
                );


                console.log(
                    "✅ REGISTRATION VERIFIED BY ADMIN"
                );


                console.log(

                    `Registration ID: ${registrationId}`

                );


                console.log(

                    `Verified By: ${req.admin.username}`

                );


                console.log(
                    "Acknowledgement Email: SENT"
                );


                console.log(

                    `Email: ${verifiedRegistration.payerEmail}`

                );


                console.log(
                    "=========================================="
                );


                // ==================================================
                // RESPONSE
                // ==================================================

                return res.json({

                    success:
                        true,

                    message:
                        "Registration verified and acknowledgement email sent successfully.",

                    registrationId:
                        registrationId,

                    verificationStatus:
                        "VERIFIED",

                    acknowledgementSent:
                        true

                });

            }


            // ======================================================
            // EMAIL ERROR
            // ======================================================

            catch (emailError) {

                console.error(
                    "❌ Acknowledgement email failed:"
                );


                console.error(
                    emailError
                );


                // ==================================================
                // IMPORTANT
                // ==================================================
                //
                // The registration stays VERIFIED.
                //
                // We do NOT change it back to PENDING.
                //
                // acknowledgementSent remains false.
                //
                // This allows us to retry the email later.
                //

                console.log(
                    "⚠️ Registration remains VERIFIED."
                );


                console.log(
                    "⚠️ Acknowledgement email can be retried."
                );


                return res.json({

                    success:
                        true,

                    message:
                        "Registration verified successfully, but the acknowledgement email could not be sent.",

                    registrationId:
                        registrationId,

                    verificationStatus:
                        "VERIFIED",

                    acknowledgementSent:
                        false

                });

            }

        }


        // ======================================================
        // GENERAL ERROR
        // ======================================================

        catch (error) {

            console.error(
                "Admin verification error:"
            );


            console.error(
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to verify registration."

            });

        }

    }

);
// ============================================================
// START SERVER
// ============================================================

async function startServer() {

    try {

        // ========================================================
        // CONNECT TO MONGODB
        // ========================================================

        await connectDatabase();


        // ========================================================
        // VERIFY EMAIL CONFIGURATION
        // ========================================================
        //
        // This only checks whether the SMTP server can be
        // contacted.
        //
        // It DOES NOT send an email.
        //

        await verifyEmailTransporter();


        // ========================================================
        // START EXPRESS SERVER
        // ========================================================

        app.listen(

            PORT,

            () => {

                console.log(
                    "=========================================="
                );


                console.log(
                    `SPARK 2026 server running on http://localhost:${PORT}`
                );


                console.log(
                    "MongoDB: CONNECTED"
                );


                // ------------------------------------------------
                // RAZORPAY STATUS
                // ------------------------------------------------

                if (

                    process.env.RAZORPAY_KEY_ID &&

                    process.env.RAZORPAY_KEY_SECRET

                ) {

                    console.log(
                        "Razorpay: READY"
                    );

                }

                else {

                    console.log(
                        "Razorpay: NOT CONFIGURED"
                    );

                }


                // ------------------------------------------------
                // ADMIN STATUS
                // ------------------------------------------------

                if (

                    process.env.ADMIN_USERNAME &&

                    process.env.ADMIN_PASSWORD_HASH &&

                    process.env.JWT_SECRET

                ) {

                    console.log(
                        "Admin Authentication: READY"
                    );

                }

                else {

                    console.log(
                        "Admin Authentication: NOT CONFIGURED"
                    );

                }


                // ------------------------------------------------
                // EMAIL STATUS
                // ------------------------------------------------

                if (

                    process.env.SMTP_USER &&

                    process.env.SMTP_PASS

                ) {

                    console.log(
                        "Acknowledgement Email: CONFIGURED"
                    );

                }

                else {

                    console.log(
                        "Acknowledgement Email: NOT CONFIGURED"
                    );

                }


                console.log(
                    "=========================================="
                );

            }

        );

    }


    // ==========================================================
    // SERVER STARTUP ERROR
    // ==========================================================

    catch (error) {

        console.error(
            "❌ Server startup failed:"
        );


        console.error(
            error
        );


        process.exit(1);

    }

}


// ============================================================
// VERCEL DATABASE INITIALIZATION
// ============================================================

if (process.env.VERCEL) {

    connectDatabase()
        .then(() => {
            return verifyEmailTransporter();
        })
        .then(() => {
            console.log("✅ Vercel server initialized.");
            console.log("✅ MongoDB: CONNECTED");
            console.log("✅ Email: READY");
        })
        .catch((error) => {
            console.error(
                "❌ Vercel initialization failed:"
            );

            console.error(error);
        });

}


// ============================================================
// START APPLICATION
// ============================================================

// Vercel needs the Express app to be exported.
// Local development still uses app.listen().

if (process.env.VERCEL) {

    module.exports = app;

} else {

    startServer();

}