// ============================================================
// SPARK 2026 — REGISTRATION SERVER
// UPI PAYMENT + 12-DIGIT UTR + MONGODB
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
            "iDeaForge",

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
// MODULE 8 — SEQUENTIAL REGISTRATION ID
// ============================================================

async function generateRegistrationCode(
    event
) {

    if (
        !event ||
        !event.code
    ) {

        throw new Error(
            "Invalid event configuration."
        );

    }


    const counterKey =
        event.code;


    let result;

    try {

        result =
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

    }

    catch (error) {

        console.error(
            "COUNTER UPDATE ERROR:",
            error
        );

        throw new Error(
            "Unable to update registration counter."
        );

    }


    // ============================================================
    // HANDLE BOTH MONGODB RESULT FORMATS
    // ============================================================

    const counterDocument =
        result &&
        result.value
            ? result.value
            : result;


    const sequence =
        counterDocument &&
        Number.isInteger(
            counterDocument.sequence
        )
            ? counterDocument.sequence
            : null;


    if (
        sequence === null
    ) {

        console.error(
            "INVALID COUNTER RESULT:",
            result
        );

        throw new Error(
            "Unable to generate registration ID."
        );

    }


    // ============================================================
    // CHECK EVENT CAPACITY
    // ============================================================

    const maximum =
        event.participants > 1
            ? event.maxTeams
            : event.maxParticipants;


    if (
        sequence >
        maximum
    ) {

        // Roll back counter

        await countersCollection.findOneAndUpdate(

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
            `${event.name} registration capacity has been reached.`
        );

    }


    // ============================================================
    // FORMAT REGISTRATION NUMBER
    // ============================================================

    const paddedSequence =
        String(
            sequence
        ).padStart(
            2,
            "0"
        );


    const registrationId =
        `SPK26-${event.code}-${paddedSequence}`;


    console.log(
        "REGISTRATION ID GENERATED:",
        registrationId
    );


    return registrationId;

}
// ============================================================
// MODULE 8A — DECREMENT REGISTRATION COUNTER
// ============================================================

async function decrementRegistrationCounter(
    registration
) {

    if (
        !registration ||
        !registration.registrationId
    ) {

        return;

    }


    const registrationId =
        cleanText(
            registration.registrationId
        );


    const parts =
        registrationId.split(
            "-"
        );


    if (
        parts.length !== 3
    ) {

        return;

    }


    const eventCode =
        parts[1];


    if (
        !eventCode
    ) {

        return;

    }


    await countersCollection.findOneAndUpdate(

        {
            _id:
                eventCode
        },

        {
            $inc:
                {
                    sequence:
                        -1
                }
        }

    );

}


// ============================================================
// MODULE 9 — PARTICIPANT NORMALIZATION
// ============================================================

function normalizeParticipant(
    participant
) {

    if (
        !participant ||
        typeof participant !==
        "object"
    ) {

        return null;

    }


    return {

        name:
            cleanText(
                participant.name
            ),

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
// MODULE 10 — JWT / ADMIN CONFIGURATION
// ============================================================

const JWT_SECRET =
    process.env.JWT_SECRET ||
    "spark-2026-change-this-secret";


const ADMIN_USERNAME =
    process.env.ADMIN_USERNAME ||
    "admin";


const ADMIN_PASSWORD_HASH =
    process.env.ADMIN_PASSWORD_HASH ||
    "";


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
// MODULE 11 — ADMIN AUTHENTICATION
// ============================================================

function adminAuth(
    req,
    res,
    next
) {

    try {

        const token =
            req.cookies &&
            req.cookies.adminToken;


        if (
            !token
        ) {

            return res.status(401).json({

                success:
                    false,

                message:
                    "Administrator login required."

            });

        }


        const decoded =
            jwt.verify(
                token,
                JWT_SECRET
            );


        if (
            !decoded ||
            decoded.role !==
            "admin"
        ) {

            return res.status(401).json({

                success:
                    false,

                message:
                    "Invalid administrator session."

            });

        }


        req.admin =
            decoded;


        next();

    }
    catch (error) {

        return res.status(401).json({

            success:
                false,

            message:
                "Administrator session expired."

        });

    }

}


// ============================================================
// MODULE 12 — EMAIL CONFIGURATION
// ============================================================

let transporter = null;


function initializeTransporter() {

    if (
        transporter
    ) {

        return transporter;

    }


    if (
        !process.env.EMAIL_USER ||
        !process.env.EMAIL_PASS
    ) {

        console.warn(
            "⚠️ EMAIL_USER or EMAIL_PASS is missing."
        );

        return null;

    }


    transporter =
        nodemailer.createTransport({

            service:
                "gmail",

            auth:
                {
                    user:
                        process.env.EMAIL_USER,

                    pass:
                        process.env.EMAIL_PASS
                }

        });


    return transporter;

}


// ============================================================
// MODULE 13 — SEND REGISTRATION ACKNOWLEDGEMENT
// ============================================================

async function sendRegistrationAcknowledgement(
    registration
) {

    const mailTransporter =
        initializeTransporter();


    if (
        !mailTransporter
    ) {

        console.log(
            "⚠️ Email transporter unavailable. Skipping acknowledgement email."
        );

        return;

    }


    const recipient =
        registration.participation ===
        "individual"

            ? cleanText(
                registration.participant &&
                registration.participant.email
            )

            : cleanText(
                registration.teamLeader &&
                registration.teamLeader.email
            );


    if (
        !recipient
    ) {

        throw new Error(
            "Participant email is missing."
        );

    }


    const registrationId =
        cleanText(
            registration.registrationId
        );


    const eventName =
        cleanText(
            registration.eventName
        );


    const subject =
        `SPARK 2026 Registration Received - ${registrationId}`;


    const text =
        [
            "SPARK 2026",
            "",
            "Your registration has been received successfully.",
            "",
            `Registration ID: ${registrationId}`,
            `Event: ${eventName}`,
            "",
            "Payment status: Pending verification.",
            "",
            "Your registration will be confirmed after the submitted UPI transaction is verified by the event coordinator.",
            "",
            "Please keep your Registration ID and transaction details safely.",
            "",
            "SPARK 2026 Organizing Team"
        ].join(
            "\n"
        );


    await mailTransporter.sendMail({

        from:
            process.env.EMAIL_USER,

        to:
            recipient,

        subject:
            subject,

        text:
            text

    });

}


// ============================================================
// MODULE 14 — SEND VERIFICATION EMAIL
// ============================================================

async function sendVerificationEmail(
    registration
) {

    const mailTransporter =
        initializeTransporter();


    if (
        !mailTransporter
    ) {

        console.log(
            "⚠️ Email transporter unavailable. Skipping verification email."
        );

        return;

    }


    const recipient =
        registration.participation ===
        "individual"

            ? cleanText(
                registration.participant &&
                registration.participant.email
            )

            : cleanText(
                registration.teamLeader &&
                registration.teamLeader.email
            );


    if (
        !recipient
    ) {

        throw new Error(
            "Participant email is missing."
        );

    }


    const registrationId =
        cleanText(
            registration.registrationId
        );


    const eventName =
        cleanText(
            registration.eventName
        );


    const subject =
        `SPARK 2026 Payment Verified - ${registrationId}`;


    const text =
        [
            "SPARK 2026",
            "",
            "Your payment has been verified successfully.",
            "",
            `Registration ID: ${registrationId}`,
            `Event: ${eventName}`,
            "",
            "Payment status: VERIFIED",
            "",
            "Your registration is now confirmed.",
            "",
            "Please keep this Registration ID for future communication.",
            "",
            "SPARK 2026 Organizing Team"
        ].join(
            "\n"
        );


    await mailTransporter.sendMail({

        from:
            process.env.EMAIL_USER,

        to:
            recipient,

        subject:
            subject,

        text:
            text

    });

}
// ============================================================
// MODULE 15 — ADMIN LOGIN
// ============================================================

app.post(
    "/api/admin/login",
    async (req, res) => {

        try {

            const username =
                cleanText(
                    req.body &&
                    req.body.username
                );

            const password =
                cleanText(
                    req.body &&
                    req.body.password
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
                username !==
                ADMIN_USERNAME
            ) {

                return res.status(401).json({

                    success:
                        false,

                    message:
                        "Invalid administrator credentials."

                });

            }


            let passwordValid =
                false;


            if (
                ADMIN_PASSWORD_HASH
            ) {

                passwordValid =
                    await bcrypt.compare(
                        password,
                        ADMIN_PASSWORD_HASH
                    );

            }
            else {

                const configuredPassword =
                    process.env.ADMIN_PASSWORD ||
                    "";

                passwordValid =
                    password ===
                    configuredPassword;

            }


            if (
                !passwordValid
            ) {

                return res.status(401).json({

                    success:
                        false,

                    message:
                        "Invalid administrator credentials."

                });

            }


            const token =
                createAdminToken(
                    username
                );


            res.cookie(
                "adminToken",
                token,
                {

                    httpOnly:
                        true,

                    secure:
                        process.env.NODE_ENV ===
                        "production",

                    sameSite:
                        process.env.NODE_ENV ===
                        "production"
                            ? "none"
                            : "lax",

                    maxAge:
                        8 *
                        60 *
                        60 *
                        1000

                }
            );


            return res.json({

                success:
                    true,

                message:
                    "Administrator login successful.",

                username:
                    username

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
                    "Unable to process administrator login."

            });

        }

    }
);


// ============================================================
// MODULE 16 — ADMIN SESSION CHECK
// ============================================================

app.get(
    "/api/admin/session",
    adminAuth,
    (req, res) => {

        return res.json({

            success:
                true,

            authenticated:
                true,

            username:
                req.admin &&
                req.admin.username

        });

    }
);


// ============================================================
// MODULE 17 — ADMIN LOGOUT
// ============================================================

app.post(
    "/api/admin/logout",
    (req, res) => {

        res.clearCookie(
            "adminToken",
            {

                httpOnly:
                    true,

                secure:
                    process.env.NODE_ENV ===
                    "production",

                sameSite:
                    process.env.NODE_ENV ===
                    "production"
                        ? "none"
                        : "lax"

            }
        );


        return res.json({

            success:
                true,

            message:
                "Administrator logged out successfully."

        });

    }
);


// ============================================================
// MODULE 18 — PAYMENT CONFIGURATION API
// ============================================================

app.get(
    "/api/payment-config",
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
                "Payment configuration error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load payment configuration."

            });

        }

    }
);


// ============================================================
// MODULE 19 — EVENT CAPACITY API
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
                    ).map(
                        async function (
                            eventId
                        ) {

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
// MODULE 20 — REGISTRATION STATUS
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
                        projection:
                            {
                                _id:
                                    0,

                                registrationId:
                                    1,

                                eventId:
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
// MODULE 21 — CREATE REGISTRATION
// ============================================================

app.post(
    "/api/register",
    async (req, res) => {

        try {

            await connectDatabase();


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

                teamName

            } =
                req.body || {};


            // ------------------------------------------------
            // EVENT VALIDATION
            // ------------------------------------------------

            const cleanEventId =
                cleanText(
                    eventId
                ).toLowerCase();


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
                        "Invalid event selected."

                });

            }


            // ------------------------------------------------
            // EVENT NAME VALIDATION
            // ------------------------------------------------

            const cleanEventName =
                cleanText(
                    eventName
                );


            if (
                cleanEventName &&
                cleanEventName !==
                    event.name
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Event information does not match."

                });

            }


            // ------------------------------------------------
            // TEAM SIZE
            // ------------------------------------------------

            const cleanTeamSize =
                Number(
                    teamSize
                );


            if (
                !Number.isInteger(
                    cleanTeamSize
                ) ||
                cleanTeamSize !==
                    event.participants
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        `${event.name} requires exactly ${event.participants} participant(s).`

                });

            }


            // ------------------------------------------------
            // AMOUNT
            // ------------------------------------------------

            const cleanAmount =
                Number(
                    amount
                );


            const expectedAmount =
                event.participants *
                event.feePerParticipant;


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
                        `Registration amount must be ₹${expectedAmount}.`

                });

            }


            // ------------------------------------------------
            // PAYER NAME
            // ------------------------------------------------

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


            // ------------------------------------------------
            // UTR / TRANSACTION ID
            // EXACTLY 12 DIGITS
            // ------------------------------------------------

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
                        "12-digit UTR / Transaction ID is required."

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
                        "UTR / Transaction ID must contain exactly 12 digits."

                });

            }


            // ------------------------------------------------
            // DUPLICATE TRANSACTION CHECK
            // ------------------------------------------------

            const existingTransaction =
                await registrationsCollection.findOne({

                    $or:
                        [

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
                existingTransaction
            ) {

                return res.status(409).json({

                    success:
                        false,

                    message:
                        "This UPI Transaction ID has already been submitted."

                });

            }


            // ------------------------------------------------
            // EVENT CAPACITY CHECK
            // ------------------------------------------------

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


// ------------------------------------------------
// PARTICIPANT DATA
// ------------------------------------------------

// Team events use teamLeader/teamMember data.
// Individual events use participant data.

const isTeamEvent =
    event.participants > 1;


// ============================================================
// INDIVIDUAL EVENT
// ============================================================

if (
    !isTeamEvent
) {

    const cleanParticipant =
        normalizeParticipant(
            participant
        );


    if (
        !cleanParticipant
    ) {

        return res.status(400).json({

            success:
                false,

            message:
                "Participant details are required."

        });

    }


    if (
        !cleanParticipant.name ||
        !cleanParticipant.college ||
        !cleanParticipant.department ||
        !cleanParticipant.year ||
        !cleanParticipant.phone ||
        !cleanParticipant.email
    ) {

        return res.status(400).json({

            success:
                false,

            message:
                "Complete participant details are required."

        });

    }

}

            // ------------------------------------------------
            // TEAM LEADER
            // ------------------------------------------------

            let cleanTeamLeader =
                null;


            let cleanTeamMember =
                null;


            if (
                event.participants >
                1
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
                    !cleanTeamLeader ||
                    !cleanTeamMember
                ) {

                    return res.status(400).json({

                        success:
                            false,

                        message:
                            "Complete team member details are required."

                    });

                }


                if (
                    !cleanTeamLeader.name ||
                    !cleanTeamLeader.college ||
                    !cleanTeamLeader.department ||
                    !cleanTeamLeader.year ||
                    !cleanTeamLeader.phone ||
                    !cleanTeamLeader.email
                ) {

                    return res.status(400).json({

                        success:
                            false,

                        message:
                            "Complete team leader details are required."

                    });

                }


                if (
                    !cleanTeamMember.name ||
                    !cleanTeamMember.college ||
                    !cleanTeamMember.department ||
                    !cleanTeamMember.year ||
                    !cleanTeamMember.phone ||
                    !cleanTeamMember.email
                ) {

                    return res.status(400).json({

                        success:
                            false,

                        message:
                            "Complete team member details are required."

                    });

                }

            }


            // ------------------------------------------------
            // TEAM NAME
            // ------------------------------------------------

            const cleanTeamName =
                event.participants >
                1
                    ? cleanText(
                        teamName
                    )
                    : "";


            if (
                event.participants >
                    1 &&
                !cleanTeamName
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Team name is required."

                });

            }


            // ------------------------------------------------
            // GENERATE SEQUENTIAL REGISTRATION ID
            // ------------------------------------------------

            let registrationId;


            try {

                registrationId =
                    await generateRegistrationCode(
                        event
                    );

            }
            catch (capacityError) {

                return res.status(409).json({

                    success:
                        false,

                    message:
                        capacityError.message

                });

            }


            // ------------------------------------------------
            // CREATE REGISTRATION DOCUMENT
            // ------------------------------------------------

            const registration =
                {

                    registrationId:

                        registrationId,

                    eventId:

                        cleanEventId,

                    eventName:

                        event.name,

                    eventCode:

                        event.code,

                    participation:

                        event.participants >
                        1
                            ? "team"
                            : "individual",

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

                    amount:

                        cleanAmount,

                    utr:

                        cleanUTR,

                    transactionId:

                        cleanUTR,

                    paymentMethod:

                        "UPI",

                    paymentStatus:

                        "PENDING",

                    verificationStatus:

                        "PENDING",

                    verifiedBy:

                        null,

                    verifiedAt:

                        null,

                    createdAt:

                        new Date()

                };


            // ------------------------------------------------
            // INSERT REGISTRATION
            // ------------------------------------------------

            await registrationsCollection.insertOne(
                registration
            );


            // ------------------------------------------------
            // SEND ACKNOWLEDGEMENT EMAIL
            // ------------------------------------------------

            try {

                await sendRegistrationAcknowledgement(
                    registration
                );

            }
            catch (emailError) {

                console.error(
                    "Acknowledgement email error:",
                    emailError
                );

            }


            return res.status(201).json({

                success:
                    true,

                message:
                    "Registration submitted successfully.",

                registrationId:
                    registrationId,

                eventName:
                    event.name,

                paymentStatus:
                    "PENDING",

                verificationStatus:
                    "PENDING"

            });

        }
        catch (error) {

            console.error(
                "Registration error:",
                error
            );


            // ------------------------------------------------
            // DUPLICATE KEY ERROR
            // ------------------------------------------------

            if (
                error &&
                error.code ===
                    11000
            ) {

                return res.status(409).json({

                    success:
                        false,

                    message:
                        "This registration or transaction already exists."

                });

            }


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to complete registration."

            });

        }

    }
);
// ============================================================
// MODULE 22 — ADMIN: GET PENDING REGISTRATIONS
// ============================================================

app.get(
    "/api/admin/registrations",
    adminAuth,
    async (req, res) => {

        try {

            await connectDatabase();


            const registrations =
                await registrationsCollection
                    .find(
                        {
                            verificationStatus:
                                "PENDING"
                        }
                    )
                    .sort(
                        {
                            createdAt:
                                -1
                        }
                    )
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
// MODULE 23 — ADMIN: GET REGISTRATION DETAILS
// ============================================================

app.get(
    "/api/admin/registrations/:registrationId",
    adminAuth,
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
                "Admin registration details error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load registration details."

            });

        }

    }
);


// ============================================================
// MODULE 24 — ADMIN: VERIFY REGISTRATION
// ============================================================

app.patch(
    "/api/admin/registrations/:registrationId/verify",
    adminAuth,
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


            // ------------------------------------------------
            // GET CURRENT REGISTRATION
            // ------------------------------------------------

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


            // ------------------------------------------------
            // PREVENT DOUBLE VERIFICATION
            // ------------------------------------------------

            if (
                registration.verificationStatus ===
                "VERIFIED"
            ) {

                return res.status(409).json({

                    success:
                        false,

                    message:
                        "This registration has already been verified."

                });

            }


            // ------------------------------------------------
            // PREVENT VERIFYING REJECTED REGISTRATION
            // ------------------------------------------------

            if (
                registration.verificationStatus ===
                "REJECTED"
            ) {

                return res.status(409).json({

                    success:
                        false,

                    message:
                        "A rejected registration cannot be verified."

                });

            }


            const verifiedAt =
                new Date();


            const verifiedBy =
                cleanText(
                    req.admin &&
                    req.admin.username
                );


            // ------------------------------------------------
            // UPDATE PAYMENT + VERIFICATION STATUS
            // ------------------------------------------------

            const updateResult =
                await registrationsCollection.updateOne(

                    {
                        registrationId:
                            registrationId,

                        verificationStatus:
                            "PENDING"

                    },

                    {
                        $set:
                            {

                                paymentStatus:
                                    "VERIFIED",

                                verificationStatus:
                                    "VERIFIED",

                                verifiedBy:
                                    verifiedBy,

                                verifiedAt:
                                    verifiedAt

                            }

                    }

                );


            if (
                updateResult.modifiedCount !==
                1
            ) {

                return res.status(409).json({

                    success:
                        false,

                    message:
                        "Registration status could not be updated. Please refresh and try again."

                });

            }


            // ------------------------------------------------
            // FETCH UPDATED REGISTRATION
            // ------------------------------------------------

            const updatedRegistration =
                await registrationsCollection.findOne({

                    registrationId:
                        registrationId

                });


            // ------------------------------------------------
            // SEND VERIFICATION EMAIL
            // ------------------------------------------------

            let emailSent =
                false;


            try {

                await sendVerificationEmail(
                    updatedRegistration
                );

                emailSent =
                    true;

            }
            catch (emailError) {

                console.error(
                    "Verification email error:",
                    emailError
                );

            }


            return res.json({

                success:
                    true,

                message:
                    emailSent

                        ? "Registration verified successfully and confirmation email sent."

                        : "Registration verified successfully. Confirmation email could not be sent.",

                registration:
                    updatedRegistration,

                emailSent:
                    emailSent

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
// MODULE 25 — ADMIN: REJECT REGISTRATION
// ============================================================

app.patch(
    "/api/admin/registrations/:registrationId/reject",
    adminAuth,
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


            // ------------------------------------------------
            // GET CURRENT REGISTRATION
            // ------------------------------------------------

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


            // ------------------------------------------------
            // PREVENT DOUBLE REJECTION
            // ------------------------------------------------

            if (
                registration.verificationStatus ===
                "REJECTED"
            ) {

                return res.status(409).json({

                    success:
                        false,

                    message:
                        "This registration has already been rejected."

                });

            }


            // ------------------------------------------------
            // PREVENT REJECTING VERIFIED REGISTRATION
            // ------------------------------------------------

            if (
                registration.verificationStatus ===
                "VERIFIED"
            ) {

                return res.status(409).json({

                    success:
                        false,

                    message:
                        "A verified registration cannot be rejected."

                });

            }


            // ------------------------------------------------
            // UPDATE REGISTRATION
            // ------------------------------------------------

            const updateResult =
                await registrationsCollection.updateOne(

                    {
                        registrationId:
                            registrationId,

                        verificationStatus:
                            "PENDING"

                    },

                    {
                        $set:
                            {

                                paymentStatus:
                                    "REJECTED",

                                verificationStatus:
                                    "REJECTED",

                                verifiedBy:
                                    cleanText(
                                        req.admin &&
                                        req.admin.username
                                    ),

                                verifiedAt:
                                    new Date()

                            }

                    }

                );


            if (
                updateResult.modifiedCount !==
                1
            ) {

                return res.status(409).json({

                    success:
                        false,

                    message:
                        "Registration status could not be updated. Please refresh and try again."

                });

            }


            // ------------------------------------------------
            // IMPORTANT:
            // CAPACITY IS CALCULATED DYNAMICALLY.
            //
            // getEventCapacity() excludes REJECTED
            // registrations, so the rejected registration
            // automatically stops occupying a slot.
            //
            // DO NOT decrement the sequential registration
            // ID counter here.
            //
            // Example:
            //
            // SPK26-IDF-01
            // SPK26-IDF-02  ← rejected
            // SPK26-IDF-03
            //
            // The next real registration remains:
            //
            // SPK26-IDF-04
            //
            // The registration ID sequence must never be
            // reused.
            // ------------------------------------------------


            const updatedRegistration =
                await registrationsCollection.findOne({

                    registrationId:
                        registrationId

                });


            return res.json({

                success:
                    true,

                message:
                    "Registration rejected successfully.",

                registration:
                    updatedRegistration

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
// MODULE 26 — ADMIN: PENDING COUNT
// ============================================================

app.get(
    "/api/admin/pending-count",
    adminAuth,
    async (req, res) => {

        try {

            await connectDatabase();


            const count =
                await registrationsCollection.countDocuments({

                    verificationStatus:
                        "PENDING"

                });


            return res.json({

                success:
                    true,

                count:
                    count

            });

        }
        catch (error) {

            console.error(
                "Pending count error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load pending count."

            });

        }

    }
);


// ============================================================
// MODULE 27 — ADMIN: SEARCH BY TRANSACTION ID / UTR
// ============================================================

app.get(
    "/api/admin/search-transaction",
    adminAuth,
    async (req, res) => {

        try {

            await connectDatabase();


            const transactionId =
                cleanText(
                    req.query &&
                    req.query.transactionId
                );


            // ------------------------------------------------
            // EXACTLY 12 DIGITS
            // ------------------------------------------------

            if (
                !/^\d{12}$/.test(
                    transactionId
                )
            ) {

                return res.status(400).json({

                    success:
                        false,

                    message:
                        "Transaction ID must contain exactly 12 digits."

                });

            }


            // ------------------------------------------------
            // SEARCH UTR / TRANSACTION ID
            // ------------------------------------------------

            const registration =
                await registrationsCollection.findOne(

                    {

                        $or:
                            [

                                {
                                    utr:
                                        transactionId
                                },

                                {
                                    transactionId:
                                        transactionId
                                }

                            ]

                    }

                );


            if (
                !registration
            ) {

                return res.status(404).json({

                    success:
                        false,

                    message:
                        "No registration found for this Transaction ID."

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
                "Transaction search error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to search Transaction ID."

            });

        }

    }
);


// ============================================================
// MODULE 28 — ADMIN: EVENT REGISTRATION STATISTICS
// ============================================================

app.get(
    "/api/admin/event-statistics",
    adminAuth,
    async (req, res) => {

        try {

            await connectDatabase();


            const statistics =
                await Promise.all(

                    Object.keys(
                        events
                    ).map(
                        async function (
                            eventId
                        ) {

                            const event =
                                events[
                                    eventId
                                ];


                            const verifiedCount =
                                await registrationsCollection.countDocuments({

                                    eventId:
                                        eventId,

                                    verificationStatus:
                                        "VERIFIED"

                                });


                            const pendingCount =
                                await registrationsCollection.countDocuments({

                                    eventId:
                                        eventId,

                                    verificationStatus:
                                        "PENDING"

                                });


                            const rejectedCount =
                                await registrationsCollection.countDocuments({

                                    eventId:
                                        eventId,

                                    verificationStatus:
                                        "REJECTED"

                                });


                            const capacity =
                                await getEventCapacity(
                                    eventId
                                );


                            return {

                                eventId:
                                    eventId,

                                eventName:
                                    event.name,

                                code:
                                    event.code,

                                type:
                                    capacity.type,

                                verifiedCount:
                                    verifiedCount,

                                pendingCount:
                                    pendingCount,

                                rejectedCount:
                                    rejectedCount,

                                registeredTeams:
                                    capacity.registeredTeams,

                                registeredParticipants:
                                    capacity.registeredParticipants,

                                maxTeams:
                                    capacity.maxTeams,

                                maxParticipants:
                                    capacity.maxParticipants,

                                remainingTeams:
                                    capacity.remainingTeams,

                                remainingParticipants:
                                    capacity.remainingParticipants,

                                percentage:
                                    capacity.percentage,

                                full:
                                    capacity.full

                            };

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
                "Event statistics error:",
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
// MODULE 29 — ADMIN: EXPORT REGISTRATIONS TO EXCEL
// ============================================================

app.get(
    "/api/admin/export-excel",
    adminAuth,
    async (req, res) => {

        try {

            await connectDatabase();


            // ------------------------------------------------
            // LOAD ALL REGISTRATIONS
            // ------------------------------------------------

            const registrations =
                await registrationsCollection
                    .find({})
                    .sort(
                        {
                            createdAt:
                                1
                        }
                    )
                    .toArray();


            // ------------------------------------------------
            // XLSX LIBRARY
            // ------------------------------------------------

            let XLSX;


            try {

                XLSX =
                    require(
                        "xlsx"
                    );

            }
            catch (xlsxError) {

                console.error(
                    "Excel library is not installed:",
                    xlsxError
                );


                return res.status(500).json({

                    success:
                        false,

                    message:
                        "Excel export is not available. Please install the xlsx package."

                });

            }


            // ------------------------------------------------
            // CONVERT REGISTRATIONS TO EXCEL ROWS
            // ------------------------------------------------

            const rows =
                registrations.map(
                    function (
                        registration
                    ) {

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
                                "",

                            "Team Size":
                                registration.teamSize ||
                                "",

                            "Team Name":
                                registration.teamName ||
                                "",


                            // ------------------------------------------------
                            // PARTICIPANT
                            // ------------------------------------------------

                            "Participant Name":
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


                            // ------------------------------------------------
                            // TEAM LEADER
                            // ------------------------------------------------

                            "Team Leader Name":
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


                            // ------------------------------------------------
                            // TEAM MEMBER
                            // ------------------------------------------------

                            "Team Member Name":
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


                            // ------------------------------------------------
                            // PAYMENT
                            // ------------------------------------------------

                            "Payer Name":
                                registration.payerName ||
                                "",

                            "Amount":
                                registration.amount ||
                                "",

                            "UPI Transaction ID":
                                registration.transactionId ||
                                registration.utr ||
                                "",

                            "Payment Method":
                                registration.paymentMethod ||
                                "",

                            "Payment Status":
                                registration.paymentStatus ||
                                "",

                            "Verification Status":
                                registration.verificationStatus ||
                                "",


                            // ------------------------------------------------
                            // VERIFICATION
                            // ------------------------------------------------

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


                            // ------------------------------------------------
                            // REGISTRATION TIME
                            // ------------------------------------------------

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


            // ------------------------------------------------
            // CREATE WORKSHEET
            // ------------------------------------------------

            const worksheet =
                XLSX.utils.json_to_sheet(
                    rows
                );


            // ------------------------------------------------
            // COLUMN WIDTHS
            // ------------------------------------------------

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
                        10
                },

                {
                    wch:
                        25
                },

                {
                    wch:
                        25
                },

                {
                    wch:
                        30
                },

                {
                    wch:
                        25
                },

                {
                    wch:
                        18
                },

                {
                    wch:
                        18
                },

                {
                    wch:
                        30
                },

                {
                    wch:
                        25
                },

                {
                    wch:
                        30
                },

                {
                    wch:
                        25
                },

                {
                    wch:
                        18
                },

                {
                    wch:
                        18
                },

                {
                    wch:
                        30
                },

                {
                    wch:
                        25
                },

                {
                    wch:
                        30
                },

                {
                    wch:
                        25
                },

                {
                    wch:
                        18
                },

                {
                    wch:
                        18
                },

                {
                    wch:
                        30
                },

                {
                    wch:
                        25
                },

                {
                    wch:
                        25
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
                        20
                },

                {
                    wch:
                        22
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


            // ------------------------------------------------
            // CREATE WORKBOOK
            // ------------------------------------------------

            const workbook =
                XLSX.utils.book_new();


            XLSX.utils.book_append_sheet(
                workbook,
                worksheet,
                "Registrations"
            );


            // ------------------------------------------------
            // WRITE EXCEL FILE TO BUFFER
            // ------------------------------------------------

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


            // ------------------------------------------------
            // RESPONSE HEADERS
            // ------------------------------------------------

            const filename =
                `SPARK2026-Registrations-${new Date()
                    .toISOString()
                    .slice(
                        0,
                        10
                    )}.xlsx`;


            res.setHeader(
                "Content-Type",
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            );


            res.setHeader(
                "Content-Disposition",
                `attachment; filename="${filename}"`
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
// MODULE 30 — ADMIN: GET ALL REGISTRATIONS
// ============================================================

app.get(
    "/api/admin/all-registrations",
    adminAuth,
    async (req, res) => {

        try {

            await connectDatabase();


            const registrations =
                await registrationsCollection
                    .find({})
                    .sort(
                        {
                            createdAt:
                                -1
                        }
                    )
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
                "All registrations error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load all registrations."

            });

        }

    }
);


// ============================================================
// MODULE 31 — ADMIN: DASHBOARD SUMMARY
// ============================================================

app.get(
    "/api/admin/summary",
    adminAuth,
    async (req, res) => {

        try {

            await connectDatabase();


            const total =
                await registrationsCollection.countDocuments({});


            const pending =
                await registrationsCollection.countDocuments({

                    verificationStatus:
                        "PENDING"

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
                "Admin summary error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load dashboard summary."

            });

        }

    }
);


// ============================================================
// MODULE 32 — HEALTH CHECK
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

                timestamp:
                    new Date().toISOString()

            });

        }
        catch (error) {

            return res.status(503).json({

                success:
                    false,

                status:
                    "ERROR",

                database:
                    "DISCONNECTED",

                message:
                    "Database connection unavailable."

            });

        }

    }
);


// ============================================================
// MODULE 33 — ROOT API
// ============================================================

app.get(
    "/",
    (req, res) => {

        return res.json({

            success:
                true,

            application:
                "SPARK 2026 Registration Server",

            status:
                "Running",

            version:
                "1.0.0",

            endpoints:
                {

                    registration:
                        "/api/register",

                    eventCapacity:
                        "/api/event-capacity",

                    registrationStatus:
                        "/api/registration-status/:registrationId",

                    adminLogin:
                        "/api/admin/login",

                    adminSession:
                        "/api/admin/session",

                    adminRegistrations:
                        "/api/admin/registrations",

                    adminSearch:
                        "/api/admin/search-transaction",

                    adminExport:
                        "/api/admin/export-excel",

                    health:
                        "/api/health"

                }

        });

    }
);
// ============================================================
// MODULE 34 — ADMIN: SEARCH REGISTRATION BY ID
// ============================================================

app.get(
    "/api/admin/search-registration",
    adminAuth,
    async (req, res) => {

        try {

            await connectDatabase();


            const registrationId =
                cleanText(
                    req.query &&
                    req.query.registrationId
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
                "Registration ID search error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to search registration."

            });

        }

    }
);


// ============================================================
// MODULE 35 — ADMIN: DELETE TEST REGISTRATION
// ============================================================
//
// This endpoint is intentionally protected by adminAuth.
//
// It should only be used when cleaning up test registrations.
// It does NOT automatically alter the sequential counter.
//
// Therefore, deleting:
//
// SPK26-IDF-01
//
// does NOT cause the next registration to reuse IDF-01.
//
// This preserves orderly, non-repeating registration IDs.
// ============================================================

app.delete(
    "/api/admin/registrations/:registrationId",
    adminAuth,
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


            const deleteResult =
                await registrationsCollection.deleteOne({

                    registrationId:
                        registrationId

                });


            if (
                deleteResult.deletedCount !==
                1
            ) {

                return res.status(500).json({

                    success:
                        false,

                    message:
                        "Registration could not be deleted."

                });

            }


            return res.json({

                success:
                    true,

                message:
                    "Registration deleted successfully.",

                registrationId:
                    registrationId

            });

        }
        catch (error) {

            console.error(
                "Delete registration error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to delete registration."

            });

        }

    }
);


// ============================================================
// MODULE 36 — ADMIN: RESET REGISTRATION COUNTERS
// ============================================================
//
// IMPORTANT:
//
// This endpoint should only be used AFTER testing and BEFORE
// opening the event for real registrations.
//
// It resets the four event counters:
//
// IDF
// CC
// IQ
// CS
//
// After reset, the next real registrations will start from:
//
// SPK26-IDF-01
// SPK26-CC-01
// SPK26-IQ-01
// SPK26-CS-01
//
// This endpoint is protected by adminAuth.
// ============================================================

app.post(
    "/api/admin/reset-registration-counters",
    adminAuth,
    async (req, res) => {

        try {

            await connectDatabase();


            const eventCodes =
                [
                    "IDF",
                    "CC",
                    "IQ",
                    "CS"
                ];


            await countersCollection.deleteMany({

                _id:
                    {
                        $in:
                            eventCodes
                    }

            });


            return res.json({

                success:
                    true,

                message:
                    "All registration counters have been reset successfully.",

                counters:
                    eventCodes

            });

        }
        catch (error) {

            console.error(
                "Reset registration counters error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to reset registration counters."

            });

        }

    }
);


// ============================================================
// MODULE 37 — ADMIN: RESET ALL TEST DATA
// ============================================================
//
// DANGER:
//
// This endpoint deletes ALL registrations.
//
// Use ONLY during testing.
// Never use this endpoint after real registrations begin.
//
// It also resets all four sequential registration counters.
// ============================================================

app.post(
    "/api/admin/reset-test-data",
    adminAuth,
    async (req, res) => {

        try {

            await connectDatabase();


            // ------------------------------------------------
            // DELETE ALL REGISTRATIONS
            // ------------------------------------------------

            const deleteResult =
                await registrationsCollection.deleteMany(
                    {}
                );


            // ------------------------------------------------
            // RESET ALL COUNTERS
            // ------------------------------------------------

            const eventCodes =
                [
                    "IDF",
                    "CC",
                    "IQ",
                    "CS"
                ];


            await countersCollection.deleteMany({

                _id:
                    {
                        $in:
                            eventCodes
                    }

            });


            return res.json({

                success:
                    true,

                message:
                    "All test registrations and registration counters have been reset.",

                deletedRegistrations:
                    deleteResult.deletedCount,

                countersReset:
                    eventCodes

            });

        }
        catch (error) {

            console.error(
                "Reset test data error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to reset test data."

            });

        }

    }
);


// ============================================================
// MODULE 38 — ADMIN: GET REGISTRATION COUNTERS
// ============================================================

app.get(
    "/api/admin/registration-counters",
    adminAuth,
    async (req, res) => {

        try {

            await connectDatabase();


            const eventCodes =
                [
                    "IDF",
                    "CC",
                    "IQ",
                    "CS"
                ];


            const counters =
                {};


            for (
                const code
                of eventCodes
            ) {

                const counter =
                    await countersCollection.findOne({

                        _id:
                            code

                    });


                counters[
                    code
                ] =
                    counter &&
                    Number.isInteger(
                        counter.sequence
                    )

                        ? counter.sequence

                        : 0;

            }


            return res.json({

                success:
                    true,

                counters:
                    counters

            });

        }
        catch (error) {

            console.error(
                "Registration counters error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load registration counters."

            });

        }

    }
);


// ============================================================
// MODULE 39 — ADMIN: GET VERIFIED REGISTRATIONS
// ============================================================

app.get(
    "/api/admin/verified-registrations",
    adminAuth,
    async (req, res) => {

        try {

            await connectDatabase();


            const registrations =
                await registrationsCollection
                    .find(
                        {
                            verificationStatus:
                                "VERIFIED"
                        }
                    )
                    .sort(
                        {
                            createdAt:
                                -1
                        }
                    )
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
                "Verified registrations error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load verified registrations."

            });

        }

    }
);


// ============================================================
// MODULE 40 — ADMIN: GET REJECTED REGISTRATIONS
// ============================================================

app.get(
    "/api/admin/rejected-registrations",
    adminAuth,
    async (req, res) => {

        try {

            await connectDatabase();


            const registrations =
                await registrationsCollection
                    .find(
                        {
                            verificationStatus:
                                "REJECTED"
                        }
                    )
                    .sort(
                        {
                            createdAt:
                                -1
                        }
                    )
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
                "Rejected registrations error:",
                error
            );


            return res.status(500).json({

                success:
                    false,

                message:
                    "Unable to load rejected registrations."

            });

        }

    }
);


// ============================================================
// MODULE 41 — 404 API HANDLER
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
// MODULE 42 — GLOBAL ERROR HANDLER
// ============================================================

app.use(
    (error, req, res, next) => {

        console.error(
            "Unhandled server error:",
            error
        );


        // ----------------------------------------------------
        // If Express has already started sending the response,
        // let Express handle the error.
        // ----------------------------------------------------

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
                "An unexpected server error occurred."

        });

    }
);


// ============================================================
// MODULE 43 — START SERVER
// ============================================================
//
// The server starts only when this file is executed directly:
//
//     npm start
//
// or:
//
//     node server/server.js
//
// When the file is imported by another module/platform,
// app.listen() will not be called.
// ============================================================

if (
    require.main === module
) {

    connectDatabase()
        .then(
            () => {

                app.listen(
                    PORT,
                    () => {

                        console.log(
                            "=========================================="
                        );

                        console.log(
                            "🚀 SPARK 2026 REGISTRATION SERVER"
                        );

                        console.log(
                            "=========================================="
                        );


                        console.log(
                            `Server running on port: ${PORT}`
                        );


                        console.log(
                            "Database: CONNECTED"
                        );


                        console.log(
                            "Payment: UPI"
                        );


                        console.log(
                            "UTR: EXACTLY 12 DIGITS"
                        );


                        console.log(
                            "Registration IDs: SEQUENTIAL"
                        );


                        console.log(
                            "IdeaForge: SPK26-IDF-01 → SPK26-IDF-30"
                        );


                        console.log(
                            "Circuit Clash: SPK26-CC-01 → SPK26-CC-30"
                        );


                        console.log(
                            "iQuest: SPK26-IQ-01 → SPK26-IQ-30"
                        );


                        console.log(
                            "CodeSprint: SPK26-CS-01 → SPK26-CS-60"
                        );


                        console.log(
                            "Admin verification: ENABLED"
                        );


                        console.log(
                            "Excel export: ENABLED"
                        );


                        console.log(
                            "Transaction search: ENABLED"
                        );


                        console.log(
                            "Payer email: NOT REQUIRED"
                        );


                        console.log(
                            "=========================================="
                        );

                    }
                );

            }
        )
        .catch(
            (error) => {

                console.error(
                    "❌ Server startup failed:"
                );

                console.error(
                    error
                );


                process.exit(
                    1
                );

            }
        );

}


// ============================================================
// MODULE 44 — EXPORT EXPRESS APP
// ============================================================
//
// Keep this as the VERY LAST line of server.js.
//
// Do NOT create another app.listen() or startFinalServer()
// after this.
// ============================================================

module.exports =
    app;