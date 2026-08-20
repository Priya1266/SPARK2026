// ============================================================
// SPARK 2026 — REGISTRATION SERVER
// UPI PAYMENT + 16-DIGIT UTR + MONGODB
// ADMIN LOGIN + ADMIN VERIFICATION
// SEQUENTIAL REGISTRATION IDs
// EXCEL EXPORT + TRANSACTION ID SEARCH
// VERCEL COMPATIBLE
// ============================================================

require("dotenv").config();

const express = require("express");
const crypto = require("crypto");
const { MongoClient } = require("mongodb");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const app = express();

const PORT =
    Number(process.env.PORT) || 3000;


// ============================================================
// MODULE 1 — MIDDLEWARE
// ============================================================

app.use(
    express.json({
        limit: "1mb"
    })
);

app.use(
    express.urlencoded({
        extended: true,
        limit: "1mb"
    })
);

app.use(cookieParser());


// ============================================================
// MODULE 2 — CORS
// ============================================================

const allowedOrigins = [

    "http://127.0.0.1:5500",

    "http://localhost:5500",

    "https://spark-4004.vercel.app",

    "https://spark-2026-theta.vercel.app",

    "https://priya1266.github.io",

    "https://sistsparkece26.com",

    "https://www.sistsparkece26.com"

];


app.use(
    (req, res, next) => {

        const origin =
            req.headers.origin;


        if (
            origin &&
            allowedOrigins.includes(origin)
        ) {

            res.header(
                "Access-Control-Allow-Origin",
                origin
            );

            res.header(
                "Access-Control-Allow-Credentials",
                "true"
            );

        }


        res.header(
            "Access-Control-Allow-Methods",
            "GET,POST,PATCH,OPTIONS"
        );


        res.header(
            "Access-Control-Allow-Headers",
            "Content-Type, Authorization"
        );


        if (
            req.method === "OPTIONS"
        ) {

            return res.sendStatus(204);

        }


        next();

    }
);


// ============================================================
// MODULE 3 — MONGODB CONFIGURATION
// ============================================================

if (
    !process.env.MONGODB_URI
) {

    console.error(
        "❌ MONGODB_URI is missing in environment variables."
    );

}


if (
    !process.env.MONGODB_DB_NAME
) {

    console.error(
        "❌ MONGODB_DB_NAME is missing in environment variables."
    );

}


const mongoClient =
    new MongoClient(
        process.env.MONGODB_URI
    );


let database = null;

let registrationsCollection =
    null;

let countersCollection =
    null;

let databaseConnectionPromise =
    null;


// ============================================================
// MODULE 4 — MONGODB CONNECTION
// ============================================================

async function connectDatabase() {

    if (
        database &&
        registrationsCollection &&
        countersCollection
    ) {

        return;

    }


    if (
        databaseConnectionPromise
    ) {

        return databaseConnectionPromise;

    }


    databaseConnectionPromise =
        (async () => {

            try {

                console.log(
                    "=========================================="
                );

                console.log(
                    "Connecting to MongoDB..."
                );


                await mongoClient.connect();


                database =
                    mongoClient.db(
                        process.env.MONGODB_DB_NAME
                    );


                registrationsCollection =
                    database.collection(
                        "registrations"
                    );


                // ------------------------------------------------
                // REGISTRATION COUNTERS COLLECTION
                // ------------------------------------------------
                //
                // One counter is maintained separately for each
                // event.
                //
                // IdeaForge     -> IDF
                // Circuit Clash -> CC
                // iQuest        -> IQ
                // CodeSprint    -> CS
                //
                // This guarantees sequential IDs such as:
                //
                // SPK26-IDF-01
                // SPK26-IDF-02
                // SPK26-IDF-03
                //
                // and so on.
                // ------------------------------------------------

                countersCollection =
                    database.collection(
                        "registrationCounters"
                    );


                // ------------------------------------------------
                // REGISTRATION ID INDEX
                // ------------------------------------------------

                await registrationsCollection.createIndex(
                    {
                        registrationId: 1
                    },
                    {
                        unique: true
                    }
                );


                // ------------------------------------------------
                // UTR INDEX
                // ------------------------------------------------

                try {

                    await registrationsCollection.createIndex(
                        {
                            utr: 1
                        },
                        {
                            unique: true,
                            partialFilterExpression: {
                                utr: {
                                    $type: "string"
                                }
                            }
                        }
                    );

                }
                catch (indexError) {

                    console.log(
                        "⚠️ UTR index warning:"
                    );

                    console.log(
                        indexError.message
                    );

                }


                // ------------------------------------------------
                // OTHER INDEXES
                // ------------------------------------------------

                await registrationsCollection.createIndex(
                    {
                        verificationStatus: 1
                    }
                );


                await registrationsCollection.createIndex(
                    {
                        eventId: 1
                    }
                );


                await registrationsCollection.createIndex(
                    {
                        createdAt: -1
                    }
                );


                // ------------------------------------------------
                // TRANSACTION ID INDEX
                // ------------------------------------------------

                await registrationsCollection.createIndex(
                    {
                        transactionId: 1
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

                console.log(
                    "✅ Collection: registrationCounters"
                );

                console.log(
                    "=========================================="
                );

            }
            catch (error) {

                console.error(
                    "❌ MongoDB connection failed:"
                );

                console.error(
                    error.message
                );

                throw error;

            }
            finally {

                databaseConnectionPromise =
                    null;

            }

        })();


    return databaseConnectionPromise;

}


// ============================================================
// MODULE 5 — EVENT CONFIGURATION
// ============================================================

const events = {

    ideaforge: {

        name:
            "IdeaForge",

        participants:
            2,

        maxTeams:
            30,

        maxParticipants:
            60,

        feePerParticipant:
            200,

        code:
            "IDF"

    },


    circuitclash: {

        name:
            "Circuit Clash",

        participants:
            2,

        maxTeams:
            30,

        maxParticipants:
            60,

        feePerParticipant:
            200,

        code:
            "CC"

    },


    iqquest: {

        name:
            "iQuest",

        participants:
            2,

        maxTeams:
            30,

        maxParticipants:
            60,

        feePerParticipant:
            200,

        code:
            "IQ"

    },


    codesprint: {

        name:
            "CodeSprint",

        participants:
            1,

        maxTeams:
            null,

        maxParticipants:
            60,

        feePerParticipant:
            200,

        code:
            "CS"

    }

};


// ============================================================
// MODULE 6 — PAYMENT CONFIGURATION
// ============================================================

const PAYMENT_CONFIG = {

    upiId:
        "9940464883@ptaxis",

    method:
        "UPI"

};


// ============================================================
// MODULE 7 — GENERAL HELPERS
// ============================================================

function cleanText(value) {

    if (
        value === undefined ||
        value === null
    ) {

        return "";

    }


    return String(
        value
    ).trim();

}


// ============================================================
// MODULE 7A — EVENT CAPACITY HELPERS
// ============================================================

async function getEventCapacity(eventId) {

    const event =
        events[eventId];


    if (!event) {

        return null;

    }


    const totalRegistrations =
        await registrationsCollection.countDocuments({

            eventId:
                eventId,

            verificationStatus:
                {
                    $ne:
                        "REJECTED"
                }

        });


    const isTeamEvent =
        event.participants > 1;


    if (isTeamEvent) {

        const registeredTeams =
            totalRegistrations;


        const registeredParticipants =
            registeredTeams *
            event.participants;


        const remainingTeams =
            Math.max(
                0,
                event.maxTeams -
                registeredTeams
            );


        const remainingParticipants =
            Math.max(
                0,
                event.maxParticipants -
                registeredParticipants
            );


        return {

            eventId:
                eventId,

            eventName:
                event.name,

            type:
                "team",

            registeredTeams:
                registeredTeams,

            registeredParticipants:
                registeredParticipants,

            maxTeams:
                event.maxTeams,

            maxParticipants:
                event.maxParticipants,

            remainingTeams:
                remainingTeams,

            remainingParticipants:
                remainingParticipants,

            percentage:
                Math.min(
                    100,
                    Math.round(
                        (
                            registeredTeams /
                            event.maxTeams
                        ) * 100
                    )
                ),

            full:
                registeredTeams >=
                event.maxTeams

        };

    }


    const registeredParticipants =
        totalRegistrations;


    const remainingParticipants =
        Math.max(
            0,
            event.maxParticipants -
            registeredParticipants
        );


    return {

        eventId:
            eventId,

        eventName:
            event.name,

        type:
            "individual",

        registeredTeams:
            null,

        registeredParticipants:
            registeredParticipants,

        maxTeams:
            null,

        maxParticipants:
            event.maxParticipants,

        remainingTeams:
            null,

        remainingParticipants:
            remainingParticipants,

        percentage:
            Math.min(
                100,
                Math.round(
                    (
                        registeredParticipants /
                        event.maxParticipants
                    ) * 100
                )
            ),

        full:
            registeredParticipants >=
            event.maxParticipants

    };

}


// ============================================================
// MODULE 7B — SEQUENTIAL REGISTRATION ID
// ============================================================
//
// IMPORTANT:
//
// Registration IDs are NOT generated using timestamp/random
// values anymore.
//
// Instead:
//
// IdeaForge:
//     SPK26-IDF-01
//     SPK26-IDF-02
//     ...
//     SPK26-IDF-30
//
// Circuit Clash:
//     SPK26-CC-01
//     ...
//     SPK26-CC-30
//
// iQuest:
//     SPK26-IQ-01
//     ...
//     SPK26-IQ-30
//
// CodeSprint:
//     SPK26-CS-01
//     ...
//     SPK26-CS-60
//
// MongoDB's findOneAndUpdate with $inc guarantees that two
// registrations arriving at the same time receive different
// numbers.
// ============================================================

async function generateRegistrationCode(
    event
) {

    if (
        !event ||
        !event.code
    ) {

        throw new Error(
            "Invalid event configuration for registration ID."
        );

    }


    const counterKey =
        event.code;


    const counterResult =
        await countersCollection.findOneAndUpdate(

            {
                _id:
                    counterKey
            },

            {
                $inc:
                    {
                        sequence:
                            1
                    }
            },

            {
                upsert:
                    true,

                returnDocument:
                    "after"
            }

        );


const sequence =
    counterResult &&
    counterResult.sequence
        ? counterResult.sequence
        : 1;
    // --------------------------------------------------------
    // CHECK EVENT LIMIT
    // --------------------------------------------------------

    const maximum =
        event.participants > 1
            ? event.maxTeams
            : event.maxParticipants;


    if (
        sequence > maximum
    ) {

        // Roll back the counter because this registration
        // cannot be created beyond the configured limit.

        await countersCollection.updateOne(

            {
                _id:
                    counterKey
            },

            {
                $inc:
                    {
                        sequence:
                            -1
                    }
            }

        );


        throw new Error(
            `${event.name} registration limit has been reached.`
        );

    }


    const formattedNumber =
        String(
            sequence
        ).padStart(
            2,
            "0"
        );


    return (
        `SPK26-${event.code}-${formattedNumber}`
    );

}


// ============================================================
// MODULE 7C — NORMALIZE PARTICIPANT
// ============================================================

function normalizeParticipant(
    participant
) {

    if (
        !participant ||
        typeof participant !== "object"
    ) {

        return null;

    }


    const fullName =
        cleanText(
            participant.fullName ||
            participant.name
        );


    return {

        fullName:
            fullName,

        name:
            fullName,

        college:
            cleanText(
                participant.college
            ),

        department:
            cleanText(
                participant.department
            ),

        year:
            cleanText(
                participant.year
            ),

        phone:
            cleanText(
                participant.phone
            ),

        email:
            cleanText(
                participant.email
            )

    };

}


// ============================================================
// MODULE 7D — VALIDATE PARTICIPANT
// ============================================================

function validateParticipant(
    participant
) {

    if (
        !participant
    ) {

        return false;

    }


    const requiredFields = [

        "fullName",
        "college",
        "department",
        "year",
        "phone",
        "email"

    ];


    for (
        const field of requiredFields
    ) {

        if (
            !cleanText(
                participant[field]
            )
        ) {

            return false;

        }

    }


    if (
        !/^[6-9]\d{9}$/.test(
            participant.phone
        )
    ) {

        return false;

    }


    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
            participant.email
        )
    ) {

        return false;

    }


    return true;

}


// ============================================================
// MODULE 7E — GET PARTICIPANT COUNT
// ============================================================

function getParticipantCount(
    participation
) {

    if (
        participation === "team"
    ) {

        return 2;

    }


    if (
        participation === "individual"
    ) {

        return 1;

    }


    return 0;

}


// ============================================================
// MODULE 8 — ADMIN AUTHENTICATION
// ============================================================
//
// VERCEL ENVIRONMENT VARIABLES REQUIRED:
//
// ADMIN_USERNAME
// ADMIN_PASSWORD_HASH
// JWT_SECRET
//
// Example:
//
// ADMIN_USERNAME = admin
// ADMIN_PASSWORD_HASH = <bcrypt hash>
// JWT_SECRET = <long random secret>
//
// IMPORTANT:
// Never put the actual password inside this file.
// ============================================================

const ADMIN_USERNAME =
    cleanText(
        process.env.ADMIN_USERNAME
    );


const ADMIN_PASSWORD_HASH =
    cleanText(
        process.env.ADMIN_PASSWORD_HASH
    );


const JWT_SECRET =
    cleanText(
        process.env.JWT_SECRET
    );


const ADMIN_COOKIE_NAME =
    "spark_admin_token";


const isProduction =
    process.env.NODE_ENV === "production" ||
    Boolean(
        process.env.VERCEL
    );


// ============================================================
// CHECK ADMIN CONFIGURATION
// ============================================================

if (
    !ADMIN_USERNAME
) {

    console.error(
        "❌ ADMIN_USERNAME is missing."
    );

}


if (
    !ADMIN_PASSWORD_HASH
) {

    console.error(
        "❌ ADMIN_PASSWORD_HASH is missing."
    );

}


if (
    !JWT_SECRET
) {

    console.error(
        "❌ JWT_SECRET is missing."
    );

}


// ============================================================
// CREATE ADMIN JWT
// ============================================================

function createAdminToken(
    username
) {

    return jwt.sign(

        {

            username:
                username,

            role:
                "admin"

        },

        JWT_SECRET,

        {

            expiresIn:
                "8h"

        }

    );

}


// ============================================================
// READ ADMIN TOKEN
// ============================================================

function getAdminToken(
    req
) {

    if (
        req.cookies &&
        req.cookies[ADMIN_COOKIE_NAME]
    ) {

        return req.cookies[
            ADMIN_COOKIE_NAME
        ];

    }


    // Optional Authorization fallback

    const authorization =
        req.headers.authorization;


    if (
        authorization &&
        authorization.startsWith(
            "Bearer "
        )
    ) {

        return authorization.substring(
            7
        );

    }


    return null;

}


// ============================================================
// VERIFY ADMIN TOKEN
// ============================================================

function verifyAdminToken(
    token
) {

    if (
        !token ||
        !JWT_SECRET
    ) {

        return null;

    }


    try {

        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );


        if (
            decoded.role !==
            "admin"
        ) {

            return null;

        }


        return decoded;

    }

    catch (error) {

        return null;

    }

}


// ============================================================
// ADMIN AUTH MIDDLEWARE
// ============================================================

function requireAdmin(
    req,
    res,
    next
) {

    const token =
        getAdminToken(
            req
        );


    const decoded =
        verifyAdminToken(
            token
        );


    if (
        !decoded
    ) {

        return res.status(401).json({

            success:
                false,

            authenticated:
                false,

            message:
                "Admin authentication required."

        });

    }


    req.admin =
        decoded;


    next();

}


// ============================================================
// END OF PART 1
// ============================================================
//
// PART 2 WILL CONTINUE WITH:
//
// MODULE 8.5 — ACKNOWLEDGEMENT EMAIL
// MODULE 9   — ADMIN LOGIN
// MODULE 10  — ADMIN SESSION
// MODULE 11  — ADMIN LOGOUT
// MODULE 12  — HEALTH CHECK
// MODULE 13  — GET EVENTS
// MODULE 14  — PAYMENT DETAILS
// MODULE 15  — CREATE REGISTRATION
//
// IMPORTANT:
// Do NOT run the server yet if you have pasted only Part 1.
// ============================================================
// ============================================================
// MODULE 8.5 — ACKNOWLEDGEMENT EMAIL
// ============================================================

let mailTransporter =
    null;


function getMailTransporter() {

    if (
        mailTransporter
    ) {

        return mailTransporter;

    }


    if (
        !process.env.SMTP_HOST ||
        !process.env.SMTP_PORT ||
        !process.env.SMTP_USER ||
        !process.env.SMTP_PASS
    ) {

        console.warn(
            "⚠️ SMTP configuration is incomplete."
        );

        return null;

    }


    mailTransporter =
        nodemailer.createTransport({

            host:
                process.env.SMTP_HOST,

            port:
                Number(
                    process.env.SMTP_PORT
                ),

            secure:
                Number(
                    process.env.SMTP_PORT
                ) === 465,

            auth: {

                user:
                    process.env.SMTP_USER,

                pass:
                    process.env.SMTP_PASS

            }

        });


    return mailTransporter;

}


// ============================================================
// SEND ACKNOWLEDGEMENT EMAIL
// ============================================================

async function sendAcknowledgementEmail(
    registration
) {

    if (
        !registration
    ) {

        throw new Error(
            "Registration information is missing."
        );

    }


    const transporter =
        getMailTransporter();


    if (
        !transporter
    ) {

        throw new Error(
            "Email service is not configured."
        );

    }


    const recipient =
        cleanText(
            registration.payerEmail
        );


    if (
        !recipient
    ) {

        throw new Error(
            "Participant email is missing."
        );

    }


    const participantName =

        registration.participation ===
        "individual"

            ? (
                registration.participant &&
                registration.participant.fullName
                    ? registration.participant.fullName
                    : registration.payerName
            )

            : (
                registration.teamLeader &&
                registration.teamLeader.fullName
                    ? registration.teamLeader.fullName
                    : registration.payerName
            );


    const teamName =
        cleanText(
            registration.teamName
        );


    const subject =
        `SPARK 2026 Registration Confirmed — ${registration.registrationId}`;


    const text = `

SPARK 2026

Registration Confirmation

Dear ${participantName || "Participant"},

Your payment has been successfully verified.

Registration ID:
${registration.registrationId}

Event:
${registration.eventName}

Participation:
${registration.participation}

${teamName ? `Team Name:\n${teamName}\n` : ""}

Amount Paid:
₹${registration.amount}

UPI Transaction ID:
${registration.transactionId || registration.utr}

Payment Status:
VERIFIED

Verification Status:
VERIFIED

Thank you for registering for SPARK 2026.

Regards,
SPARK 2026 Organizing Team

`;


    await transporter.sendMail({

        from:
            process.env.SMTP_FROM ||
            process.env.SMTP_USER,

        to:
            recipient,

        subject:
            subject,

        text:
            text

    });

}


// ============================================================
// MODULE 9 — ADMIN LOGIN
// ============================================================

app.post(
    "/api/admin/login",
    async (req, res) => {

        try {

            const username =
                cleanText(
                    req.body.username
                );


            const password =
                typeof req.body.password ===
                "string"
                    ? req.body.password
                    : "";


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


            if (
                username !==
                ADMIN_USERNAME
            ) {

                return res.status(401).json({

                    success:
                        false,

                    message:
                        "Invalid admin credentials."

                });

            }


            if (
                !ADMIN_PASSWORD_HASH
            ) {

                console.error(
                    "❌ ADMIN_PASSWORD_HASH is not configured."
                );

                return res.status(500).json({

                    success:
                        false,

                    message:
                        "Admin authentication is not configured."

                });

            }


            const passwordValid =
                await bcrypt.compare(
                    password,
                    ADMIN_PASSWORD_HASH
                );


            if (
                !passwordValid
            ) {

                return res.status(401).json({

                    success:
                        false,

                    message:
                        "Invalid admin credentials."

                });

            }


            if (
                !JWT_SECRET
            ) {

                return res.status(500).json({

                    success:
                        false,

                    message:
                        "JWT authentication is not configured."

                });

            }


            const token =
                createAdminToken(
                    username
                );


            res.cookie(

                ADMIN_COOKIE_NAME,

                token,

                {

                    httpOnly:
                        true,

                    secure:
                        isProduction,

                    sameSite:
                        isProduction
                            ? "none"
                            : "lax",

                    maxAge:
                        8 * 60 * 60 * 1000,

                    path:
                        "/"

                }

            );


            return res.json({

                success:
                    true,

                authenticated:
                    true,

                username:
                    username,

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
// MODULE 10 — ADMIN SESSION
// ============================================================

app.get(
    "/api/admin/session",
    async (req, res) => {

        try {

            const token =
                getAdminToken(
                    req
                );


            const decoded =
                verifyAdminToken(
                    token
                );


            if (
                !decoded
            ) {

                return res.status(401).json({

                    success:
                        false,

                    authenticated:
                        false,

                    message:
                        "Admin session is not valid."

                });

            }


            return res.json({

                success:
                    true,

                authenticated:
                    true,

                username:
                    decoded.username,

                role:
                    decoded.role

            });

        }

        catch (error) {

            console.error(
                "Admin session error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                authenticated:
                    false,

                message:
                    "Unable to check admin session."

            });

        }

    }
);


// ============================================================
// MODULE 11 — ADMIN LOGOUT
// ============================================================

app.post(
    "/api/admin/logout",
    async (req, res) => {

        try {

            res.clearCookie(

                ADMIN_COOKIE_NAME,

                {

                    httpOnly:
                        true,

                    secure:
                        isProduction,

                    sameSite:
                        isProduction
                            ? "none"
                            : "lax",

                    path:
                        "/"

                }

            );


            return res.json({

                success:
                    true,

                message:
                    "Admin logout successful."

            });

        }

        catch (error) {

            console.error(
                "Admin logout error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to logout."

            });

        }

    }
);


// ============================================================
// MODULE 12 — HEALTH CHECK
// ============================================================

app.get(
    "/api/health",
    async (req, res) => {

        try {

            await connectDatabase();


            return res.json({

                success:
                    true,

                status:
                    "OK",

                database:
                    "CONNECTED",

                paymentMethod:
                    PAYMENT_CONFIG.method,

                timestamp:
                    new Date().toISOString()

            });

        }

        catch (error) {

            console.error(
                "Health check error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                status:
                    "ERROR",

                database:
                    "DISCONNECTED"

            });

        }

    }
);


// ============================================================
// MODULE 13 — GET EVENTS
// ============================================================

app.get(
    "/api/events",
    async (req, res) => {

        try {

            const eventList =
                Object.entries(
                    events
                )
                .map(
                    (
                        [
                            eventId,
                            event
                        ]
                    ) => ({

                        eventId:
                            eventId,

                        name:
                            event.name,

                        participants:
                            event.participants,

                        maxTeams:
                            event.maxTeams,

                        maxParticipants:
                            event.maxParticipants,

                        feePerParticipant:
                            event.feePerParticipant,

                        code:
                            event.code

                    })
                );


            return res.json({

                success:
                    true,

                events:
                    eventList

            });

        }

        catch (error) {

            console.error(
                "Events API error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load events."

            });

        }

    }
);


// ============================================================
// MODULE 13A — EVENT CAPACITY
// ============================================================

app.get(
    "/api/event-capacity",
    async (req, res) => {

        try {

            await connectDatabase();


            const capacities =
                await Promise.all(

                    Object.keys(
                        events
                    )
                    .map(
                        async (
                            eventId
                        ) => {

                            return await getEventCapacity(
                                eventId
                            );

                        }
                    )

                );


            return res.json({

                success:
                    true,

                events:
                    capacities

            });

        }

        catch (error) {

            console.error(
                "Event capacity error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load event capacity."

            });

        }

    }
);


// ============================================================
// MODULE 14 — PAYMENT DETAILS
// ============================================================

app.get(
    "/api/payment-details",
    async (req, res) => {

        try {

            return res.json({

                success:
                    true,

                paymentMethod:
                    PAYMENT_CONFIG.method,

                upiId:
                    PAYMENT_CONFIG.upiId

            });

        }

        catch (error) {

            console.error(
                "Payment details error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load payment details."

            });

        }

    }
);


// ============================================================
// END OF PART 2
// ============================================================
//
// PART 3 WILL CONTINUE WITH:
//
// MODULE 15 — CREATE REGISTRATION
// MODULE 16 — ADMIN: GET ALL REGISTRATIONS
// MODULE 17 — ADMIN: GET PENDING REGISTRATIONS
// MODULE 18 — ADMIN: VERIFY PAYMENT
//
// IMPORTANT:
//
// In MODULE 15, the registration ID generation will use:
//
//     await generateRegistrationCode(event)
//
// instead of the old random generator.
//
// ============================================================
// ============================================================
// MODULE 15 — CREATE REGISTRATION
// ============================================================

app.post(
    "/api/register",
    async (req, res) => {

        try {

            await connectDatabase();


            console.log(
                "=========================================="
            );

            console.log(
                "NEW REGISTRATION REQUEST"
            );

            console.log(
                "=========================================="
            );


            // ----------------------------------------------------
            // READ REQUEST
            // ----------------------------------------------------

            const {

                eventId,

                eventName,

                teamSize,

                amount,

                participant,

                teamLeader,

                teamMember,

                utr,

                transactionId,

                payerName,

                payerEmail,

                teamName

            } = req.body;


            // ----------------------------------------------------
            // EVENT VALIDATION
            // ----------------------------------------------------

            const cleanEventId =
                cleanText(
                    eventId
                );


            const event =
                events[
                    cleanEventId
                ];


            if (
                !event
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid event."

                });

            }


            // ----------------------------------------------------
            // PARTICIPATION VALIDATION
            // ----------------------------------------------------

            const cleanTeamSize =
                cleanText(
                    teamSize
                );


            if (
                cleanTeamSize !==
                    "individual" &&
                cleanTeamSize !==
                    "team"
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid participation type."

                });

            }


            // ----------------------------------------------------
            // VERIFY EVENT PARTICIPATION TYPE
            // ----------------------------------------------------

            const expectedTeamSize =
                event.participants > 1
                    ? "team"
                    : "individual";


            if (
                cleanTeamSize !==
                expectedTeamSize
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        `Invalid participation type for ${event.name}.`

                });

            }


            // ----------------------------------------------------
            // PARTICIPANT VALIDATION
            // ----------------------------------------------------

            let cleanParticipant =
                null;

            let cleanTeamLeader =
                null;

            let cleanTeamMember =
                null;


            if (
                cleanTeamSize ===
                "individual"
            ) {

                cleanParticipant =
                    normalizeParticipant(
                        participant
                    );


                if (
                    !validateParticipant(
                        cleanParticipant
                    )
                ) {

                    return res.status(400).json({

                        success:
                            false,

                        message:
                            "Invalid participant details."

                    });

                }

            }


            if (
                cleanTeamSize ===
                "team"
            ) {

                cleanTeamLeader =
                    normalizeParticipant(
                        teamLeader
                    );


                cleanTeamMember =
                    normalizeParticipant(
                        teamMember
                    );


                if (
                    !validateParticipant(
                        cleanTeamLeader
                    )
                ) {

                    return res.status(400).json({

                        success:
                            false,

                        message:
                            "Invalid team leader details."

                    });

                }


                if (
                    !validateParticipant(
                        cleanTeamMember
                    )
                ) {

                    return res.status(400).json({

                        success:
                            false,

                        message:
                            "Invalid team member details."

                    });

                }

            }


            // ----------------------------------------------------
            // TEAM NAME
            // ----------------------------------------------------

            const cleanTeamName =
                cleanText(
                    teamName
                );


            if (
                cleanTeamSize ===
                    "team" &&
                !cleanTeamName
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Team name is required."

                });

            }


            // ----------------------------------------------------
            // PAYER NAME
            // ----------------------------------------------------

            const cleanPayerName =
                cleanText(
                    payerName
                );


            if (
                !cleanPayerName
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Payer name is required."

                });

            }


            // ----------------------------------------------------
            // PAYER EMAIL
            // ----------------------------------------------------

            const cleanPayerEmail =
                cleanText(
                    payerEmail
                );


            if (
                !cleanPayerEmail ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                    cleanPayerEmail
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Valid payer email is required."

                });

            }


            // ----------------------------------------------------
            // UTR / TRANSACTION ID
            // ----------------------------------------------------

            const cleanUTR =
                cleanText(
                    utr ||
                    transactionId
                );


            if (
                !cleanUTR
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "UTR / Transaction ID is required."

                });

            }


            if (
                !/^\d{16}$/.test(
                    cleanUTR
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "UTR / Transaction ID must contain exactly 16 digits."

                });

            }


            // ----------------------------------------------------
            // AMOUNT VALIDATION
            // ----------------------------------------------------

            const cleanAmount =
                Number(
                    amount
                );


            const expectedAmount =
                event.feePerParticipant *
                event.participants;


            if (
                !Number.isFinite(
                    cleanAmount
                ) ||
                cleanAmount !==
                expectedAmount
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        `Invalid registration amount. Expected ₹${expectedAmount}.`

                });

            }


            // ----------------------------------------------------
            // DUPLICATE UTR CHECK
            // ----------------------------------------------------

            const existingUTR =
                await registrationsCollection.findOne({

                    $or: [

                        {
                            utr:
                                cleanUTR
                        },

                        {
                            transactionId:
                                cleanUTR
                        }

                    ]

                });


            if (
                existingUTR
            ) {

                return res.status(409).json({

                    success:
                        false,

                    message:
                        "This UTR / Transaction ID has already been used."

                });

            }


            // ----------------------------------------------------
            // EVENT CAPACITY CHECK
            // ----------------------------------------------------

            const currentCapacity =
                await getEventCapacity(
                    cleanEventId
                );


            if (
                currentCapacity &&
                currentCapacity.full
            ) {

                return res.status(409).json({

                    success:
                        false,

                    message:
                        currentCapacity.type ===
                        "team"

                            ? `${event.name} registration is full. Maximum ${event.maxTeams} teams are allowed.`

                            : `${event.name} registration is full. Maximum ${event.maxParticipants} participants are allowed.`

                });

            }


            // ----------------------------------------------------
            // GENERATE SEQUENTIAL REGISTRATION ID
            // ----------------------------------------------------
            //
            // IMPORTANT:
            //
            // This is now ASYNC because MongoDB generates the
            // sequence number safely.
            //
            // Example:
            //
            // SPK26-IDF-01
            // SPK26-IDF-02
            //
            // instead of the old random/timestamp ID.
            // ----------------------------------------------------

            let registrationId;


            try {

                registrationId =
                    await generateRegistrationCode(
                        event
                    );

            }

            catch (idError) {

                console.error(
                    "Registration ID generation error:",
                    idError
                );


                return res.status(409).json({

                    success:
                        false,

                    message:
                        idError.message ||
                        `${event.name} registration limit has been reached.`

                });

            }


            // ----------------------------------------------------
            // PAYMENT STATUS
            // ----------------------------------------------------

            const paymentStatus =
                "SUBMITTED";


            const verificationStatus =
                "PENDING";


            // ----------------------------------------------------
            // CREATE REGISTRATION DOCUMENT
            // ----------------------------------------------------

            const registrationDocument = {

                registrationId:
                    registrationId,

                eventId:
                    cleanEventId,

                eventName:
                    event.name,

                eventCode:
                    event.code,

                participation:
                    cleanTeamSize,

                teamSize:
                    cleanTeamSize,

                teamName:
                    cleanTeamName,

                participant:
                    cleanParticipant,

                teamLeader:
                    cleanTeamLeader,

                teamMember:
                    cleanTeamMember,

                payerName:
                    cleanPayerName,

                payerEmail:
                    cleanPayerEmail,

                amount:
                    cleanAmount,

                utr:
                    cleanUTR,

                transactionId:
                    cleanUTR,

                paymentStatus:
                    paymentStatus,

                verificationStatus:
                    verificationStatus,

                createdAt:
                    new Date(),

                verifiedAt:
                    null,

                verifiedBy:
                    null

            };


            // ----------------------------------------------------
            // INSERT REGISTRATION
            // ----------------------------------------------------

            try {

                await registrationsCollection.insertOne(
                    registrationDocument
                );

            }

            catch (insertError) {

                console.error(
                    "Registration insert error:",
                    insertError
                );


                // ------------------------------------------------
                // IF A DUPLICATE REGISTRATION ID OCCURS
                // ------------------------------------------------
                //
                // This should be extremely unlikely because the
                // MongoDB counter is atomic.
                //
                // Return a clean error rather than exposing
                // database internals.
                // ------------------------------------------------

                if (
                    insertError &&
                    insertError.code ===
                    11000
                ) {

                    return res.status(409).json({

                        success:
                            false,

                        message:
                            "Registration could not be created because a duplicate value was detected. Please try again."

                    });

                }


                throw insertError;

            }


            // ----------------------------------------------------
            // SUCCESS RESPONSE
            // ----------------------------------------------------

            console.log(
                "=========================================="
            );

            console.log(
                "REGISTRATION CREATED"
            );

            console.log(
                `Registration ID: ${registrationId}`
            );

            console.log(
                `Event: ${event.name}`
            );

            console.log(
                `UTR: ${cleanUTR}`
            );

            console.log(
                "=========================================="
            );


            return res.status(201).json({

                success:
                    true,

                message:
                    "Registration submitted successfully.",

                registrationId:
                    registrationId,

                eventId:
                    cleanEventId,

                eventName:
                    event.name,

                paymentStatus:
                    paymentStatus,

                verificationStatus:
                    verificationStatus

            });

        }

        catch (error) {

            console.error(
                "Registration error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to process registration."

            });

        }

    }
);


// ============================================================
// MODULE 16 — ADMIN: GET ALL REGISTRATIONS
// ============================================================

app.get(
    "/api/admin/registrations",
    requireAdmin,
    async (req, res) => {

        try {

            await connectDatabase();


            const registrations =
                await registrationsCollection
                    .find({})
                    .sort({
                        createdAt:
                            -1
                    })
                    .toArray();


            return res.json({

                success:
                    true,

                registrations:
                    registrations

            });

        }

        catch (error) {

            console.error(
                "Admin registrations error:",
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
// MODULE 17 — ADMIN: GET PENDING REGISTRATIONS
// ============================================================

app.get(
    "/api/admin/pending",
    requireAdmin,
    async (req, res) => {

        try {

            await connectDatabase();


            const registrations =
                await registrationsCollection
                    .find({

                        verificationStatus:
                            {
                                $in: [
                                    "PENDING",
                                    "SUBMITTED"
                                ]
                            }

                    })
                    .sort({
                        createdAt:
                            1
                    })
                    .toArray();


            return res.json({

                success:
                    true,

                registrations:
                    registrations,

                count:
                    registrations.length

            });

        }

        catch (error) {

            console.error(
                "Admin pending registrations error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load pending registrations."

            });

        }

    }
);


// ============================================================
// MODULE 18 — ADMIN: GET SINGLE REGISTRATION
// ============================================================

app.get(
    "/api/admin/registration/:registrationId",
    requireAdmin,
    async (req, res) => {

        try {

            await connectDatabase();


            const registrationId =
                cleanText(
                    req.params.registrationId
                );


            if (
                !registrationId
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Registration ID is required."

                });

            }


            const registration =
                await registrationsCollection.findOne({

                    registrationId:
                        registrationId

                });


            if (
                !registration
            ) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Registration not found."

                });

            }


            return res.json({

                success:
                    true,

                registration:
                    registration

            });

        }

        catch (error) {

            console.error(
                "Admin registration lookup error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load registration."

            });

        }

    }
);


// ============================================================
// END OF PART 3
// ============================================================
//
// PART 4 WILL ADD:
//
// MODULE 19 — ADMIN TRANSACTION ID SEARCH
// MODULE 20 — ADMIN EXCEL EXPORT
// MODULE 21 — ADMIN VERIFY REGISTRATION
// MODULE 22 — ADMIN REJECT REGISTRATION
// MODULE 23 — PUBLIC REGISTRATION LOOKUP
//
// IMPORTANT:
// Do NOT run the server yet.
// Wait until Parts 4 and 5 are pasted.
// ============================================================
// ============================================================
// MODULE 19 — ADMIN: SEARCH BY TRANSACTION ID / UTR
// ============================================================
//
// Admin enters the transaction ID from GPay.
//
// The server searches both:
//     transactionId
//     utr
//
// Only authenticated administrators can use this endpoint.
// ============================================================

app.get(
    "/api/admin/search-transaction",
    requireAdmin,
    async (req, res) => {

        try {

            await connectDatabase();


            const transactionId =
                cleanText(
                    req.query.transactionId ||
                    req.query.utr
                );


            // ----------------------------------------------------
            // VALIDATE TRANSACTION ID
            // ----------------------------------------------------

            if (
                !transactionId
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Transaction ID is required."

                });

            }


            if (
                !/^\d{16}$/.test(
                    transactionId
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Transaction ID must contain exactly 16 digits."

                });

            }


            // ----------------------------------------------------
            // SEARCH DATABASE
            // ----------------------------------------------------

            const registration =
                await registrationsCollection.findOne({

                    $or: [

                        {
                            transactionId:
                                transactionId
                        },

                        {
                            utr:
                                transactionId
                        }

                    ]

                });


            // ----------------------------------------------------
            // NOT FOUND
            // ----------------------------------------------------

            if (
                !registration
            ) {

                return res.status(404).json({

                    success:
                        false,

                    found:
                        false,

                    message:
                        "No registration found for this Transaction ID."

                });

            }


            // ----------------------------------------------------
            // FOUND
            // ----------------------------------------------------

            return res.json({

                success:
                    true,

                found:
                    true,

                registration:
                    registration

            });

        }

        catch (error) {

            console.error(
                "Transaction search error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to search transaction."

            });

        }

    }
);


// ============================================================
// MODULE 20 — ADMIN: EXPORT REGISTRATIONS TO EXCEL
// ============================================================
//
// This endpoint creates:
//
//     SPARK2026_Registrations.xlsx
//
// It exports all registration records currently stored in
// MongoDB.
//
// Only authenticated administrators can access it.
// ============================================================

app.get(
    "/api/admin/export",
    requireAdmin,
    async (req, res) => {

        try {

            await connectDatabase();


            // ----------------------------------------------------
            // LOAD ALL REGISTRATIONS
            // ----------------------------------------------------

            const registrations =
                await registrationsCollection
                    .find({})
                    .sort({
                        createdAt:
                            1
                    })
                    .toArray();


            // ----------------------------------------------------
            // REQUIRE XLSX PACKAGE
            // ----------------------------------------------------

            let XLSX;

            try {

                XLSX =
                    require("xlsx");

            }

            catch (xlsxError) {

                console.error(
                    "XLSX package error:",
                    xlsxError
                );


                return res.status(500).json({

                    success:
                        false,

                    message:
                        "Excel export package is not installed. Run npm install xlsx."

                });

            }


            // ----------------------------------------------------
            // CONVERT REGISTRATION DATA
            // INTO EXCEL-FRIENDLY ROWS
            // ----------------------------------------------------

            const rows =
                registrations.map(
                    (
                        registration
                    ) => {

                        const participant =
                            registration.participant ||
                            {};

                        const teamLeader =
                            registration.teamLeader ||
                            {};

                        const teamMember =
                            registration.teamMember ||
                            {};


                        return {

                            "Registration ID":
                                registration.registrationId ||
                                "",

                            "Event":
                                registration.eventName ||
                                "",

                            "Event Code":
                                registration.eventCode ||
                                "",

                            "Participation":
                                registration.participation ||
                                registration.teamSize ||
                                "",

                            "Team Name":
                                registration.teamName ||
                                "",


                            // ------------------------------------
                            // INDIVIDUAL PARTICIPANT
                            // ------------------------------------

                            "Participant Name":
                                participant.fullName ||
                                participant.name ||
                                "",

                            "Participant College":
                                participant.college ||
                                "",

                            "Participant Department":
                                participant.department ||
                                "",

                            "Participant Year":
                                participant.year ||
                                "",

                            "Participant Phone":
                                participant.phone ||
                                "",

                            "Participant Email":
                                participant.email ||
                                "",


                            // ------------------------------------
                            // TEAM LEADER
                            // ------------------------------------

                            "Team Leader Name":
                                teamLeader.fullName ||
                                teamLeader.name ||
                                "",

                            "Team Leader College":
                                teamLeader.college ||
                                "",

                            "Team Leader Department":
                                teamLeader.department ||
                                "",

                            "Team Leader Year":
                                teamLeader.year ||
                                "",

                            "Team Leader Phone":
                                teamLeader.phone ||
                                "",

                            "Team Leader Email":
                                teamLeader.email ||
                                "",


                            // ------------------------------------
                            // TEAM MEMBER
                            // ------------------------------------

                            "Team Member Name":
                                teamMember.fullName ||
                                teamMember.name ||
                                "",

                            "Team Member College":
                                teamMember.college ||
                                "",

                            "Team Member Department":
                                teamMember.department ||
                                "",

                            "Team Member Year":
                                teamMember.year ||
                                "",

                            "Team Member Phone":
                                teamMember.phone ||
                                "",

                            "Team Member Email":
                                teamMember.email ||
                                "",


                            // ------------------------------------
                            // PAYMENT
                            // ------------------------------------

                            "Payer Name":
                                registration.payerName ||
                                "",

                            "Payer Email":
                                registration.payerEmail ||
                                "",

                            "Amount":
                                registration.amount ||
                                "",

                            "Transaction ID":
                                registration.transactionId ||
                                registration.utr ||
                                "",

                            "UTR":
                                registration.utr ||
                                registration.transactionId ||
                                "",

                            "Payment Status":
                                registration.paymentStatus ||
                                "",

                            "Verification Status":
                                registration.verificationStatus ||
                                "",


                            // ------------------------------------
                            // VERIFICATION
                            // ------------------------------------

                            "Verified By":
                                registration.verifiedBy ||
                                "",

                            "Verified At":
                                registration.verifiedAt
                                    ? new Date(
                                        registration.verifiedAt
                                    ).toLocaleString(
                                        "en-IN"
                                    )
                                    : "",


                            // ------------------------------------
                            // REGISTRATION DATE
                            // ------------------------------------

                            "Registered At":
                                registration.createdAt
                                    ? new Date(
                                        registration.createdAt
                                    ).toLocaleString(
                                        "en-IN"
                                    )
                                    : ""

                        };

                    }
                );


            // ----------------------------------------------------
            // CREATE WORKSHEET
            // ----------------------------------------------------

            const worksheet =
                XLSX.utils.json_to_sheet(
                    rows
                );


            // ----------------------------------------------------
            // SET COLUMN WIDTHS
            // ----------------------------------------------------

            worksheet["!cols"] = [

                {
                    wch:
                        20
                },

                {
                    wch:
                        20
                },

                {
                    wch:
                        12
                },

                {
                    wch:
                        15
                },

                {
                    wch:
                        18
                },

                {
                    wch:
                        24
                },

                {
                    wch:
                        28
                },

                {
                    wch:
                        22
                },

                {
                    wch:
                        15
                },

                {
                    wch:
                        16
                },

                {
                    wch:
                        28
                },

                {
                    wch:
                        24
                },

                {
                    wch:
                        28
                },

                {
                    wch:
                        22
                },

                {
                    wch:
                        15
                },

                {
                    wch:
                        16
                },

                {
                    wch:
                        28
                },

                {
                    wch:
                        24
                },

                {
                    wch:
                        28
                },

                {
                    wch:
                        22
                },

                {
                    wch:
                        15
                },

                {
                    wch:
                        16
                },

                {
                    wch:
                        28
                },

                {
                    wch:
                        24
                },

                {
                    wch:
                        24
                },

                {
                    wch:
                        18
                },

                {
                    wch:
                        20
                },

                {
                    wch:
                        20
                },

                {
                    wch:
                        18
                },

                {
                    wch:
                        20
                },

                {
                    wch:
                        20
                },

                {
                    wch:
                        18
                },

                {
                    wch:
                        22
                },

                {
                    wch:
                        22
                }

            ];


            // ----------------------------------------------------
            // CREATE WORKBOOK
            // ----------------------------------------------------

            const workbook =
                XLSX.utils.book_new();


            XLSX.utils.book_append_sheet(

                workbook,

                worksheet,

                "Registrations"

            );


            // ----------------------------------------------------
            // GENERATE XLSX BUFFER
            // ----------------------------------------------------

            const excelBuffer =
                XLSX.write(

                    workbook,

                    {

                        type:
                            "buffer",

                        bookType:
                            "xlsx"

                    }

                );


            // ----------------------------------------------------
            // RESPONSE HEADERS
            // ----------------------------------------------------

            res.setHeader(

                "Content-Type",

                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

            );


            res.setHeader(

                "Content-Disposition",

                'attachment; filename="SPARK2026_Registrations.xlsx"'

            );


            res.setHeader(

                "Content-Length",

                excelBuffer.length

            );


            return res.send(
                excelBuffer
            );

        }

        catch (error) {

            console.error(
                "Excel export error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to export registrations."

            });

        }

    }
);


// ============================================================
// MODULE 21 — ADMIN: VERIFY REGISTRATION
// ============================================================

app.patch(
    "/api/admin/registration/:registrationId/verify",
    requireAdmin,
    async (req, res) => {

        try {

            await connectDatabase();


            const registrationId =
                cleanText(
                    req.params.registrationId
                );


            if (
                !registrationId
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Registration ID is required."

                });

            }


            const existingRegistration =
                await registrationsCollection.findOne({

                    registrationId:
                        registrationId

                });


            if (
                !existingRegistration
            ) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Registration not found."

                });

            }


            // ----------------------------------------------------
            // PREVENT DOUBLE VERIFICATION
            // ----------------------------------------------------

            if (
                existingRegistration.verificationStatus ===
                "VERIFIED"
            ) {

                return res.json({

                    success:
                        true,

                    message:
                        "Registration is already verified.",

                    registration:
                        existingRegistration

                });

            }


            const now =
                new Date();


            const updatedRegistration =
                await registrationsCollection.findOneAndUpdate(

                    {
                        registrationId:
                            registrationId
                    },

                    {

                        $set: {

                            paymentStatus:
                                "VERIFIED",

                            verificationStatus:
                                "VERIFIED",

                            verifiedAt:
                                now,

                            verifiedBy:
                                req.admin.username

                        }

                    },

                    {

                        returnDocument:
                            "after"

                    }

                );


const registration =
    updatedRegistration;
            if (
                !registration
            ) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Registration could not be updated."

                });

            }


            // ----------------------------------------------------
            // SEND CONFIRMATION EMAIL
            // ----------------------------------------------------

            let emailSent =
                false;


            try {

                await sendAcknowledgementEmail(
                    registration
                );


                emailSent =
                    true;

            }

            catch (emailError) {

                console.error(
                    "Confirmation email error:",
                    emailError
                );

            }


            return res.json({

                success:
                    true,

                message:
                    emailSent

                        ? "Registration verified successfully and confirmation email sent."

                        : "Registration verified successfully. Email could not be sent.",

                emailSent:
                    emailSent,

                registration:
                    registration

            });

        }

        catch (error) {

            console.error(
                "Verify registration error:",
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
// MODULE 22 — ADMIN: REJECT REGISTRATION
// ============================================================

app.patch(
    "/api/admin/registration/:registrationId/reject",
    requireAdmin,
    async (req, res) => {

        try {

            await connectDatabase();


            const registrationId =
                cleanText(
                    req.params.registrationId
                );


            if (
                !registrationId
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Registration ID is required."

                });

            }


            const existingRegistration =
                await registrationsCollection.findOne({

                    registrationId:
                        registrationId

                });


            if (
                !existingRegistration
            ) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Registration not found."

                });

            }


            const updatedRegistration =
                await registrationsCollection.findOneAndUpdate(

                    {
                        registrationId:
                            registrationId
                    },

                    {

                        $set: {

                            paymentStatus:
                                "REJECTED",

                            verificationStatus:
                                "REJECTED",

                            rejectedAt:
                                new Date(),

                            rejectedBy:
                                req.admin.username

                        }

                    },

                    {

                        returnDocument:
                            "after"

                    }

                );


const registration =
    updatedRegistration;

            return res.json({

                success:
                    true,

                message:
                    "Registration rejected successfully.",

                registration:
                    registration

            });

        }

        catch (error) {

            console.error(
                "Reject registration error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to reject registration."

            });

        }

    }
);


// ============================================================
// MODULE 23 — PUBLIC REGISTRATION LOOKUP
// ============================================================
//
// This endpoint is intended for a participant to check the
// status of their own registration using the registration ID.
//
// It does NOT expose the complete registration document.
// ============================================================

app.get(
    "/api/registration-status/:registrationId",
    async (req, res) => {

        try {

            await connectDatabase();


            const registrationId =
                cleanText(
                    req.params.registrationId
                );


            if (
                !registrationId
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Registration ID is required."

                });

            }


            const registration =
                await registrationsCollection.findOne(

                    {

                        registrationId:
                            registrationId

                    },

                    {

                        projection: {

                            _id:
                                0,

                            registrationId:
                                1,

                            eventName:
                                1,

                            participation:
                                1,

                            teamName:
                                1,

                            paymentStatus:
                                1,

                            verificationStatus:
                                1,

                            createdAt:
                                1,

                            verifiedAt:
                                1

                        }

                    }

                );


            if (
                !registration
            ) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "Registration not found."

                });

            }


            return res.json({

                success:
                    true,

                registration:
                    registration

            });

        }

        catch (error) {

            console.error(
                "Registration status error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to check registration status."

            });

        }

    }
);


// ============================================================
// END OF PART 4
// ============================================================
//
// PART 5 WILL CONTAIN:
//
// MODULE 24 — ERROR HANDLER
// MODULE 25 — 404 HANDLER
// MODULE 26 — VERCEL EXPORT
// MODULE 27 — LOCAL SERVER START
//
// After Part 5, we'll run:
//
//     node --check server/server.js
//
// Then we'll fix the dashboard HTML/JS and CSS for:
//
//     🔎 Transaction ID Search
//     📥 Export Excel
//     ↻ Refresh
//
// ============================================================
// ============================================================
// MODULE 24 — ADMIN: REGISTRATION STATISTICS
// ============================================================
//
// Provides the admin dashboard with a quick summary of:
//
//     Total registrations
//     Pending registrations
//     Verified registrations
//     Rejected registrations
//
// ============================================================

app.get(
    "/api/admin/statistics",
    requireAdmin,
    async (req, res) => {

        try {

            await connectDatabase();


            const total =
                await registrationsCollection.countDocuments({});


            const pending =
                await registrationsCollection.countDocuments({

                    verificationStatus:
                        {
                            $in: [
                                "PENDING",
                                "SUBMITTED"
                            ]
                        }

                });


            const verified =
                await registrationsCollection.countDocuments({

                    verificationStatus:
                        "VERIFIED"

                });


            const rejected =
                await registrationsCollection.countDocuments({

                    verificationStatus:
                        "REJECTED"

                });


            return res.json({

                success:
                    true,

                total:
                    total,

                pending:
                    pending,

                verified:
                    verified,

                rejected:
                    rejected

            });

        }

        catch (error) {

            console.error(
                "Admin statistics error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load registration statistics."

            });

        }

    }
);


// ============================================================
// MODULE 25 — ADMIN: EVENT STATISTICS
// ============================================================
//
// Gives the admin dashboard the current count for each event.
//
// ============================================================

app.get(
    "/api/admin/event-statistics",
    requireAdmin,
    async (req, res) => {

        try {

            await connectDatabase();


            const statistics =
                await Promise.all(

                    Object.keys(
                        events
                    )
                    .map(
                        async (
                            eventId
                        ) => {

                            const capacity =
                                await getEventCapacity(
                                    eventId
                                );


                            return capacity;

                        }
                    )

                );


            return res.json({

                success:
                    true,

                events:
                    statistics

            });

        }

        catch (error) {

            console.error(
                "Admin event statistics error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load event statistics."

            });

        }

    }
);


// ============================================================
// MODULE 26 — 404 API HANDLER
// ============================================================

app.use(
    "/api",
    (req, res) => {

        return res.status(404).json({

            success:
                false,

            message:
                "API endpoint not found."

        });

    }
);


// ============================================================
// MODULE 27 — GENERAL ERROR HANDLER
// ============================================================

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "Unhandled server error:",
            error
        );


        if (
            res.headersSent
        ) {

            return next(
                error
            );

        }


        return res.status(500).json({

            success:
                false,

            message:
                "Internal server error."

        });

    }
);


// ============================================================
// MODULE 28 — ROOT HEALTH RESPONSE
// ============================================================

app.get(
    "/",
    (req, res) => {

        return res.json({

            success:
                true,

            service:
                "SPARK 2026 Registration Server",

            status:
                "ONLINE",

            timestamp:
                new Date().toISOString()

        });

    }
);


// ============================================================
// MODULE 29 — VERCEL EXPORT
// ============================================================
//
// Vercel imports this Express application.
//
// ============================================================

module.exports =
    app;


// ============================================================
// MODULE 30 — LOCAL SERVER START
// ============================================================
//
// When running:
//
//     node server.js
//
// the local server starts normally.
//
// On Vercel, this block is not executed as Vercel imports
// the exported Express application.
// ============================================================

if (
    require.main ===
    module
) {

    app.listen(
        PORT,
        () => {

            console.log(
                "=========================================="
            );

            console.log(
                "SPARK 2026 SERVER"
            );

            console.log(
                "=========================================="
            );

            console.log(
                `Server running on port ${PORT}`
            );

            console.log(
                `http://localhost:${PORT}`
            );

            console.log(
                "=========================================="
            );

        }
    );

}
