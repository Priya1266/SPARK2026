// ============================================================
// SPARK 2026 — REGISTRATION SERVER
// UPI PAYMENT + 16-DIGIT UTR + MONGODB
// ADMIN LOGIN + ADMIN VERIFICATION
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

let databaseConnectionPromise =
    null;


// ============================================================
// MODULE 4 — MONGODB CONNECTION
// ============================================================

async function connectDatabase() {

    if (
        database &&
        registrationsCollection
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
// GENERATE REGISTRATION ID
// ============================================================

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


// ============================================================
// NORMALIZE PARTICIPANT
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
// VALIDATE PARTICIPANT
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
// GET PARTICIPANT COUNT
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
// MODULE 8.5 — ACKNOWLEDGEMENT EMAIL
// ============================================================
//
// Email is sent ONLY after an admin verifies payment.
//
// Vercel Environment Variables required:
//
// SMTP_HOST
// SMTP_PORT
// SMTP_SECURE
// SMTP_USER
// SMTP_PASS
// EMAIL_FROM_NAME
//
// For Gmail:
// SMTP_PASS must be a Gmail App Password.
// ============================================================


const emailTransporter =
    nodemailer.createTransport({

        host:
            process.env.SMTP_HOST ||
            "smtp.gmail.com",

        port:
            Number(
                process.env.SMTP_PORT ||
                465
            ),

        secure:
            process.env.SMTP_SECURE !==
            "false",

        auth: {

            user:
                process.env.SMTP_USER,

            pass:
                process.env.SMTP_PASS

        }

    });



async function sendAcknowledgementEmail(
    registration
) {

    // --------------------------------------------------------
    // CHECK EMAIL
    // --------------------------------------------------------

    if (
        !registration ||
        !registration.payerEmail
    ) {

        throw new Error(
            "Participant email address is missing."
        );

    }


    // --------------------------------------------------------
    // COLLECT PARTICIPANT NAMES
    // --------------------------------------------------------

    const names = [];


    if (
        registration.participant &&
        registration.participant.name
    ) {

        names.push(
            registration.participant.name
        );

    }


    if (
        registration.teamLeader &&
        registration.teamLeader.name
    ) {

        names.push(
            registration.teamLeader.name
        );

    }


    if (
        registration.teamMember &&
        registration.teamMember.name
    ) {

        names.push(
            registration.teamMember.name
        );

    }


    const participantNames =
        names.length > 0
            ? names.join(", ")
            : (
                registration.payerName ||
                "Participant"
            );


    // --------------------------------------------------------
    // AMOUNT
    // --------------------------------------------------------

    const amount =
        registration.amount !== undefined &&
        registration.amount !== null
            ? `₹${registration.amount}`
            : "—";


    // --------------------------------------------------------
    // EMAIL SENDER NAME
    // --------------------------------------------------------

    const fromName =
        process.env.EMAIL_FROM_NAME ||
        "SPARK 2026";


    // ========================================================
    // SEND EMAIL
    // ========================================================

    await emailTransporter.sendMail({

        from:
            `"${fromName}" <${process.env.SMTP_USER}>`,

        to:
            registration.payerEmail,

        replyTo:
            process.env.SMTP_USER,

        subject:
            `SPARK 2026 — Registration Confirmed | ${registration.eventName}`,


        // ====================================================
        // PLAIN TEXT VERSION
        // ====================================================

        text:

`Dear ${registration.payerName || "Participant"},

Your registration for SPARK 2026 has been successfully verified by the event administration team.


REGISTRATION DETAILS
--------------------------------

Registration ID : ${registration.registrationId}

Event           : ${registration.eventName}

Participation   : ${registration.participation || "—"}

Team Name       : ${registration.teamName || "—"}

Participants    : ${participantNames}


PAYMENT DETAILS
--------------------------------

Amount          : ${amount}

Payment Method  : ${registration.paymentMethod || "UPI"}

UTR             : ${registration.utr || "—"}

Payment Status  : VERIFIED


Your participation is now officially confirmed.

Please keep your Registration ID safely for future reference.


For any queries, contact:

sparkece2026@gmail.com


We look forward to welcoming you to SPARK 2026.


Regards,

SPARK 2026 Organising Team

Department of Electronics and Communication Engineering

Sathyabama Institute of Science and Technology

Chennai`,


        // ====================================================
        // HTML VERSION
        // ====================================================

        html:

`
<!DOCTYPE html>

<html>

<head>

<meta charset="UTF-8">

<title>
SPARK 2026 Registration Confirmation
</title>

</head>


<body style="
margin:0;
padding:0;
background:#f4f8ff;
font-family:Arial,Helvetica,sans-serif;
color:#16213e;
">


<div style="
max-width:650px;
margin:40px auto;
background:#ffffff;
border-radius:16px;
overflow:hidden;
box-shadow:0 10px 30px rgba(14,42,82,0.12);
">


<!-- HEADER -->

<div style="
padding:28px;
background:#1565c0;
color:#ffffff;
text-align:center;
">

<h1 style="
margin:0;
font-size:28px;
">

SPARK 2026

</h1>


<p style="
margin:8px 0 0;
">

Registration Confirmation

</p>

</div>



<!-- CONTENT -->

<div style="
padding:30px;
">


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

has been successfully verified by the event administration team.

</p>



<!-- REGISTRATION DETAILS -->

<div style="
margin-top:20px;
padding:20px;
background:#f4f8ff;
border-radius:12px;
">

<h2 style="
margin-top:0;
color:#1565c0;
">

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



<!-- PAYMENT DETAILS -->

<div style="
margin-top:20px;
padding:20px;
background:#f7fff8;
border-radius:12px;
">

<h2 style="
margin-top:0;
color:#15803d;
">

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
Payment Method:
</strong>

${registration.paymentMethod || "UPI"}

</p>


<p>

<strong>
UTR:
</strong>

${registration.utr || "—"}

</p>


<p>

<strong>
Payment Status:
</strong>

VERIFIED

</p>

</div>



<!-- SUCCESS -->

<div style="
margin-top:25px;
padding:18px;
background:#ecfdf5;
border:1px solid #a7f3d0;
border-radius:10px;
color:#065f46;
text-align:center;
">

<strong>

✓ Registration Verified Successfully

</strong>

</div>



<p style="
margin-top:28px;
">

Please keep your

<strong>
Registration ID
</strong>

safely for future reference.

</p>


<p>

For any queries, contact:

<strong>
sparkece2026@gmail.com
</strong>

</p>


<p>

We look forward to welcoming you to

<strong>
SPARK 2026
</strong>.

</p>



<!-- PROFESSIONAL FOOTER -->

<p style="
margin-top:30px;
line-height:1.7;
">

Regards,

<br>

<strong>
SPARK 2026 Organising Team
</strong>

<br>

Department of Electronics and Communication Engineering

<br>

Sathyabama Institute of Science and Technology

<br>

Chennai

</p>


</div>



<!-- FOOTER BAR -->

<div style="
padding:18px;
text-align:center;
background:#081833;
color:#dce8fa;
font-size:12px;
">

SPARK 2026 · Department of ECE

</div>


</div>

</body>

</html>
`

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
                String(
                    req.body.password ||
                    ""
                );


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
                !ADMIN_USERNAME ||
                !ADMIN_PASSWORD_HASH ||
                !JWT_SECRET
            ) {

                console.error(
                    "❌ Admin authentication environment variables are not configured."
                );


                return res.status(500).json({

                    success:
                        false,

                    message:
                        "Admin authentication is not configured on the server."

                });

            }


            // ----------------------------------------------------
            // USERNAME CHECK
            // ----------------------------------------------------

            if (
                username !==
                ADMIN_USERNAME
            ) {

                return res.status(401).json({

                    success:
                        false,

                    message:
                        "Invalid username or password."

                });

            }


            // ----------------------------------------------------
            // PASSWORD CHECK
            // ----------------------------------------------------

            const passwordMatches =
                await bcrypt.compare(
                    password,
                    ADMIN_PASSWORD_HASH
                );


            if (
                !passwordMatches
            ) {

                return res.status(401).json({

                    success:
                        false,

                    message:
                        "Invalid username or password."

                });

            }


            // ----------------------------------------------------
            // CREATE JWT
            // ----------------------------------------------------

            const token =
                createAdminToken(
                    username
                );


            // ----------------------------------------------------
            // SET SECURE HTTP-ONLY COOKIE
            // ----------------------------------------------------

            res.cookie(
                ADMIN_COOKIE_NAME,
                token,
                {

                    httpOnly:
                        true,

                    secure:
                        isProduction,

                    sameSite:
                        "lax",

                    maxAge:
                        8 * 60 * 60 * 1000,

                    path:
                        "/"

                }
            );


            console.log(
                "=========================================="
            );

            console.log(
                "✅ ADMIN LOGIN SUCCESS"
            );

            console.log(
                `Admin: ${username}`
            );

            console.log(
                "=========================================="
            );


            return res.json({

                success:
                    true,

                message:
                    "Admin login successful.",

                username:
                    username

            });

        }
        catch (error) {

            console.error(
                "❌ Admin login error:"
            );

            console.error(
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
    (req, res) => {

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
                    "No valid admin session."

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
                "admin"

        });

    }
);


// ============================================================
// MODULE 11 — ADMIN LOGOUT
// ============================================================

app.post(
    "/api/admin/logout",
    (req, res) => {

        res.clearCookie(
            ADMIN_COOKIE_NAME,
            {

                httpOnly:
                    true,

                secure:
                    isProduction,

                sameSite:
                    "lax",

                path:
                    "/"

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
// MODULE 12 — HEALTH CHECK
// ============================================================

app.get(
    "/",
    async (req, res) => {

        return res.json({

            success:
                true,

            message:
                "SPARK 2026 Registration Server is running.",

            database:
                database
                    ? "connected"
                    : "not connected",

            paymentMethod:
                PAYMENT_CONFIG.method,

            upiId:
                PAYMENT_CONFIG.upiId,

            manualVerification:
                true

        });

    }
);


// ============================================================
// MODULE 13 — GET EVENTS
// ============================================================

app.get(
    "/api/events",
    (req, res) => {

        const eventList =
            Object.entries(
                events
            )
            .map(
                (
                    [id, event]
                ) => ({

                    id:

                        id,

                    name:

                        event.name,

                    participants:

                        event.participants,

                    feePerParticipant:

                        event.feePerParticipant,

                    totalFee:

                        event.participants *
                        event.feePerParticipant

                })
            );


        return res.json({

            success:
                true,

            events:
                eventList

        });

    }
);


// ============================================================
// MODULE 14 — PAYMENT DETAILS
// ============================================================

app.post(
    "/api/payment-details",
    async (req, res) => {

        try {

            await connectDatabase();


            const eventId =
                cleanText(
                    req.body.eventId
                );


            const participation =
                cleanText(
                    req.body.teamSize
                );


            const event =
                events[eventId];


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


            const participantCount =
                getParticipantCount(
                    participation
                );


            if (
                participantCount === 0
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid participation type."

                });

            }


            if (
                participantCount !==
                event.participants
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Invalid participant count for this event."

                });

            }


            const amount =
                participantCount *
                event.feePerParticipant;


            return res.json({

                success:
                    true,

                eventId:
                    eventId,

                eventName:
                    event.name,

                participants:
                    participantCount,

                feePerParticipant:
                    event.feePerParticipant,

                amount:
                    amount,

                currency:
                    "INR",

                paymentMethod:
                    PAYMENT_CONFIG.method,

                upiId:
                    PAYMENT_CONFIG.upiId,

                paymentStatus:
                    "PENDING"

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

                payerName

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
            // PARTICIPANT COUNT
            // ----------------------------------------------------

            const participantCount =
                getParticipantCount(
                    cleanTeamSize
                );


            if (
                participantCount !==
                event.participants
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Participant count does not match this event."

                });

            }


            // ----------------------------------------------------
            // SERVER-SIDE AMOUNT
            // ----------------------------------------------------

            const serverAmount =
                participantCount *
                event.feePerParticipant;


            if (
                amount !== undefined &&
                Number(amount) !==
                    Number(serverAmount)
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Payment amount does not match the event fee."

                });

            }


            // ----------------------------------------------------
            // NORMALIZE PARTICIPANTS
            // ----------------------------------------------------

            let normalizedParticipant =
                null;

            let normalizedTeamLeader =
                null;

            let normalizedTeamMember =
                null;


            // ----------------------------------------------------
            // INDIVIDUAL
            // ----------------------------------------------------

            if (
                cleanTeamSize ===
                "individual"
            ) {

                normalizedParticipant =
                    normalizeParticipant(
                        participant ||
                        teamLeader
                    );


                if (
                    !validateParticipant(
                        normalizedParticipant
                    )
                ) {

                    return res.status(400).json({

                        success:
                            false,

                        message:
                            "Participant information is incomplete."

                    });

                }

            }


            // ----------------------------------------------------
            // TEAM
            // ----------------------------------------------------

            if (
                cleanTeamSize ===
                "team"
            ) {

                normalizedTeamLeader =
                    normalizeParticipant(
                        teamLeader
                    );


                if (
                    !validateParticipant(
                        normalizedTeamLeader
                    )
                ) {

                    return res.status(400).json({

                        success:
                            false,

                        message:
                            "Team leader information is incomplete."

                    });

                }


                normalizedTeamMember =
                    normalizeParticipant(
                        teamMember
                    );


                if (
                    !validateParticipant(
                        normalizedTeamMember
                    )
                ) {

                    return res.status(400).json({

                        success:
                            false,

                        message:
                            "Team member information is incomplete."

                    });

                }

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


            if (
                cleanPayerName.length <
                2
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Payer name is invalid."

                });

            }


            if (
                !/^[A-Za-z .'-]+$/.test(
                    cleanPayerName
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Payer name contains invalid characters."

                });

            }


// ==================================================
// 7. UPI TRANSACTION ID VALIDATION
// EXACTLY 12 NUMERIC DIGITS
// ==================================================

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
            "12-digit UPI Transaction ID is required."

    });

}


if (
    !/^\d{12}$/.test(
        cleanUTR
    )
) {

    return res.status(400).json({

        success:
            false,

        message:
            "UPI Transaction ID must contain exactly 12 digits."

    });

}

            // ----------------------------------------------------
            // DUPLICATE UTR
            // ----------------------------------------------------

            const existingUTR =
                await registrationsCollection.findOne({

                    utr:
                        cleanUTR

                });


            if (
                existingUTR
            ) {

                return res.status(409).json({

                    success:
                        false,

                    message:
                        "This UTR / Transaction ID has already been submitted.",

                    registrationId:
                        existingUTR.registrationId

                });

            }


            // ----------------------------------------------------
            // GENERATE REGISTRATION ID
            // ----------------------------------------------------

            const registrationId =
                generateRegistrationCode(
                    event
                );


            // ----------------------------------------------------
            // DATABASE RECORD
            // ----------------------------------------------------

            const databaseRecord = {

                registrationId:
                    registrationId,

                eventId:
                    cleanEventId,

                eventName:
                    event.name,

                participation:
                    cleanTeamSize,

                participantCount:
                    participantCount,

                participant:
                    cleanTeamSize ===
                    "individual"
                        ? normalizedParticipant
                        : null,

                teamLeader:
                    cleanTeamSize ===
                    "team"
                        ? normalizedTeamLeader
                        : null,

                teamMember:
                    cleanTeamSize ===
                    "team"
                        ? normalizedTeamMember
                        : null,

                teamName:
                    cleanText(
                        req.body.teamName
                    ),

                amount:
                    serverAmount,

                currency:
                    "INR",

                paymentMethod:
                    "UPI",

                upiId:
                    PAYMENT_CONFIG.upiId,

payerName:
    cleanPayerName,

payerEmail:
    cleanTeamSize === "individual"
        ? normalizedParticipant.email
        : normalizedTeamLeader.email,

utr:
    cleanUTR,

                transactionId:
                    cleanUTR,

                paymentStatus:
                    "SUBMITTED",

                verificationStatus:
                    "PENDING",

                verificationReason:
                    null,

                verifiedAt:
                    null,

                verifiedBy:
                    null,

                acknowledgementSent:
                    false,

                acknowledgementSentAt:
                    null,

                createdAt:
                    new Date(),

                updatedAt:
                    new Date()

            };


            // ----------------------------------------------------
            // INSERT
            // ----------------------------------------------------

            await registrationsCollection.insertOne(
                databaseRecord
            );


            console.log(
                "=========================================="
            );

            console.log(
                "✅ REGISTRATION SAVED"
            );

            console.log(
                `Registration ID: ${registrationId}`
            );

            console.log(
                `Event: ${event.name}`
            );

            console.log(
                `Participation: ${cleanTeamSize}`
            );

            console.log(
                `Participants: ${participantCount}`
            );

            console.log(
                `Amount: ₹${serverAmount}`
            );

            console.log(
                `Payer: ${cleanPayerName}`
            );

            console.log(
                `UTR: ${cleanUTR}`
            );

            console.log(
                "Payment Status: SUBMITTED"
            );

            console.log(
                "Verification Status: PENDING"
            );

            console.log(
                "=========================================="
            );


            return res.status(201).json({

                success:
                    true,

                message:
                    "Registration submitted successfully. Payment is pending manual verification.",

                registrationId:
                    registrationId,

                event:
                    event.name,

                amount:
                    serverAmount,

                currency:
                    "INR",

                paymentMethod:
                    "UPI",

                utr:
                    cleanUTR,

                paymentStatus:
                    "SUBMITTED",

                verificationStatus:
                    "PENDING",

                acknowledgementSent:
                    false

            });

        }
        catch (error) {

            console.error(
                "❌ Registration error:"
            );

            console.error(
                error
            );


            if (
                error &&
                error.code === 11000
            ) {

                return res.status(409).json({

                    success:
                        false,

                    message:
                        "This UTR / Registration ID already exists."

                });

            }


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to save registration. Please try again."

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

                count:
                    registrations.length,

                registrations:
                    registrations

            });

        }
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
                            "PENDING"

                    })
                    .sort({

                        createdAt:
                            -1

                    })
                    .toArray();


            return res.json({

                success:
                    true,

                count:
                    registrations.length,

                registrations:
                    registrations

            });

        }
        catch (error) {

            console.error(
                "Pending registration error:",
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
// MODULE 18 — ADMIN: VERIFY PAYMENT
// ============================================================


app.post(

    "/api/admin/verify",

    requireAdmin,

    async (req, res) => {

        try {

            await connectDatabase();


            // ----------------------------------------------------
            // REGISTRATION ID
            // ----------------------------------------------------

            const registrationId =
                cleanText(
                    req.body.registrationId
                );


            // ----------------------------------------------------
            // ADMIN NAME
            // ----------------------------------------------------

            const adminName =
                req.admin &&
                req.admin.username
                    ? req.admin.username
                    : "Admin";


            // ----------------------------------------------------
            // VALIDATE REGISTRATION ID
            // ----------------------------------------------------

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


            // ----------------------------------------------------
            // FIND REGISTRATION
            // ----------------------------------------------------

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


            // ====================================================
            // ALREADY VERIFIED
            // ====================================================

            if (
                registration.verificationStatus ===
                "VERIFIED"
            ) {

                return res.json({

                    success:
                        true,

                    message:
                        "Registration is already verified.",

                    registrationId:
                        registrationId,

                    paymentStatus:
                        "VERIFIED",

                    verificationStatus:
                        "VERIFIED",

                    acknowledgementSent:
                        registration.acknowledgementSent === true

                });

            }


            // ====================================================
            // STEP 1 — VERIFY PAYMENT
            // ====================================================

            await registrationsCollection.updateOne(

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
                            new Date(),

                        verifiedBy:
                            adminName,

                        updatedAt:
                            new Date()

                    }

                }

            );


            // ====================================================
            // STEP 2 — GET UPDATED REGISTRATION
            // ====================================================

            const verifiedRegistration =
                await registrationsCollection.findOne({

                    registrationId:
                        registrationId

                });


            // ====================================================
            // STEP 3 — SEND EMAIL
            // ====================================================

            let acknowledgementSent =
                false;


            let emailError =
                null;


            try {

                await sendAcknowledgementEmail(

                    verifiedRegistration

                );


                acknowledgementSent =
                    true;


                // ------------------------------------------------
                // SAVE EMAIL SENT STATUS
                // ------------------------------------------------

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


                console.log(
                    "=========================================="
                );


                console.log(
                    "📧 ACKNOWLEDGEMENT EMAIL SENT"
                );


                console.log(
                    `Registration: ${registrationId}`
                );


                console.log(
                    `Email: ${verifiedRegistration.payerEmail}`
                );


                console.log(
                    "=========================================="
                );

            }


            catch (
                emailSendError
            ) {

                emailError =
                    emailSendError.message;


                console.error(
                    "❌ ACKNOWLEDGEMENT EMAIL FAILED:"
                );


                console.error(
                    emailSendError
                );


                // IMPORTANT:
                //
                // Payment remains VERIFIED.
                //
                // Email failure does NOT
                // undo payment verification.

            }


            // ====================================================
            // LOG RESULT
            // ====================================================

            console.log(
                "=========================================="
            );


            console.log(
                "✅ PAYMENT VERIFIED"
            );


            console.log(
                `Registration: ${registrationId}`
            );


            console.log(
                `Verified By: ${adminName}`
            );


            console.log(

                `Acknowledgement Email: ${
                    acknowledgementSent
                        ? "SENT"
                        : "NOT SENT"
                }`

            );


            console.log(
                "=========================================="
            );


            // ====================================================
            // RESPONSE
            // ====================================================

            return res.json({

                success:
                    true,

                message:

                    acknowledgementSent

                        ? "Payment verified successfully. Acknowledgement email sent."

                        : "Payment verified successfully, but the acknowledgement email could not be sent.",


                registrationId:
                    registrationId,


                paymentStatus:
                    "VERIFIED",


                verificationStatus:
                    "VERIFIED",


                acknowledgementSent:
                    acknowledgementSent,


                emailError:

                    acknowledgementSent

                        ? null

                        : emailError

            });

        }


        catch (
            error
        ) {

            console.error(
                "❌ Admin verification error:"
            );


            console.error(
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to verify payment."

            });

        }

    }

);


// ============================================================
// MODULE 19 — ADMIN: REJECT PAYMENT
// ============================================================

app.post(
    "/api/admin/reject",
    requireAdmin,
    async (req, res) => {

        try {

            await connectDatabase();


            const registrationId =
                cleanText(
                    req.body.registrationId
                );


            const adminName =
                req.admin &&
                req.admin.username
                    ? req.admin.username
                    : "Admin";


            const reason =
                cleanText(
                    req.body.reason
                ) ||
                "Payment could not be verified.";


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


            await registrationsCollection.updateOne(

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

                        verificationReason:
                            reason,

                        verifiedAt:
                            new Date(),

                        verifiedBy:
                            adminName,

                        updatedAt:
                            new Date()

                    }

                }

            );


            console.log(
                "=========================================="
            );

            console.log(
                "❌ PAYMENT REJECTED"
            );

            console.log(
                `Registration: ${registrationId}`
            );

            console.log(
                `Reason: ${reason}`
            );

            console.log(
                `Rejected By: ${adminName}`
            );

            console.log(
                "=========================================="
            );


            return res.json({

                success:
                    true,

                message:
                    "Payment rejected.",

                registrationId:
                    registrationId,

                paymentStatus:
                    "REJECTED",

                verificationStatus:
                    "REJECTED"

            });

        }
        catch (error) {

            console.error(
                "Admin rejection error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to reject payment."

            });

        }

    }
);


// ============================================================
// MODULE 20 — GET SINGLE REGISTRATION
// ============================================================

app.get(
    "/api/registration/:registrationId",
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
                "Registration lookup error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to retrieve registration."

            });

        }

    }
);


// ============================================================
// MODULE 21 — 404 HANDLER
// ============================================================

app.use(
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
// MODULE 22 — GLOBAL ERROR HANDLER
// ============================================================

app.use(
    (
        error,
        req,
        res,
        next
    ) => {

        console.error(
            "Unhandled server error:"
        );

        console.error(
            error
        );


        return res.status(500).json({

            success:
                false,

            message:
                "Internal server error."

        });

    }
);


// ============================================================
// MODULE 23 — GRACEFUL SHUTDOWN
// ============================================================

async function shutdown(
    signal
) {

    console.log(
        `\n${signal} received. Shutting down...`
    );


    try {

        await mongoClient.close();


        console.log(
            "✅ MongoDB connection closed."
        );


        process.exit(0);

    }
    catch (error) {

        console.error(
            "❌ Shutdown error:",
            error
        );


        process.exit(1);

    }

}


process.on(
    "SIGINT",
    () => shutdown("SIGINT")
);


process.on(
    "SIGTERM",
    () => shutdown("SIGTERM")
);


// ============================================================
// MODULE 24 — LOCAL SERVER
// ============================================================

async function startServer() {

    try {

        await connectDatabase();


        app.listen(
            PORT,
            () => {

                console.log(
                    "=========================================="
                );

                console.log(
                    `🚀 SPARK 2026 server running on port ${PORT}`
                );

                console.log(
                    "✅ MongoDB: CONNECTED"
                );

                console.log(
                    "✅ Payment: UPI"
                );

                console.log(
                    "✅ UPI TRANSACTION ID: EXACTLY 12 DIGITS"
                );

                console.log(
                    `✅ UPI ID: ${PAYMENT_CONFIG.upiId}`
                );

                console.log(
                    "✅ Manual verification: ENABLED"
                );

                console.log(
                    "✅ Admin authentication: ENABLED"
                );

                console.log(
                    "=========================================="
                );

            }
        );

    }
    catch (error) {

        console.error(
            "❌ Failed to start server:"
        );

        console.error(
            error
        );


        process.exit(1);

    }

}


// ============================================================
// LOCAL VS VERCEL
// ============================================================
//
// LOCAL:
// node server.js
//
// VERCEL:
// api/index.js
// require("../server/server")
// Vercel handles the HTTP server.
//
// ============================================================

if (
    require.main === module
) {

    startServer();

}


// ============================================================
// EXPORT EXPRESS APP FOR VERCEL
// ============================================================

module.exports = app;