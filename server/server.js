// ============================================================
// SPARK 2026 — REGISTRATION SERVER
// UPI PAYMENT + 16-DIGIT UTR + ADMIN VERIFICATION + MONGODB
// + ACKNOWLEDGEMENT EMAIL
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
    "https://priya1266.github.io",
    "https://sistsparkece26.com"
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
            "Content-Type"
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
// MODULE 3 — REQUIRED ENVIRONMENT VARIABLES
// ============================================================

if (
    !process.env.MONGODB_URI
) {

    console.error(
        "❌ MONGODB_URI is missing in .env"
    );

    process.exit(1);
}


if (
    !process.env.MONGODB_DB_NAME
) {

    console.error(
        "❌ MONGODB_DB_NAME is missing in .env"
    );

    process.exit(1);
}


if (
    !process.env.ADMIN_USERNAME
) {

    console.error(
        "❌ ADMIN_USERNAME is missing in .env"
    );

    process.exit(1);
}


if (
    !process.env.ADMIN_PASSWORD_HASH
) {

    console.error(
        "❌ ADMIN_PASSWORD_HASH is missing in .env"
    );

    process.exit(1);
}


if (
    !process.env.JWT_SECRET
) {

    console.error(
        "❌ JWT_SECRET is missing in .env"
    );

    process.exit(1);
}


// ============================================================
// MODULE 4 — MONGODB
// ============================================================

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
// MODULE 5 — CONNECT TO MONGODB
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
                // UNIQUE REGISTRATION ID
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
                // UNIQUE UTR
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
                // VERIFICATION INDEX
                // ------------------------------------------------

                await registrationsCollection.createIndex(
                    {
                        verificationStatus: 1
                    }
                );


                // ------------------------------------------------
                // EVENT INDEX
                // ------------------------------------------------

                await registrationsCollection.createIndex(
                    {
                        eventId: 1
                    }
                );


                // ------------------------------------------------
                // DATE INDEX
                // ------------------------------------------------

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
                    error
                );

                process.exit(1);

            }
            finally {

                databaseConnectionPromise =
                    null;
            }

        })();


    return databaseConnectionPromise;
}


// ============================================================
// MODULE 6 — EVENT CONFIGURATION
// ============================================================

const events = {

    // ==========================================================
    // IDEA FORGE
    // ==========================================================

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


    // ==========================================================
    // CIRCUIT CLASH
    // ==========================================================

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


    // ==========================================================
    // iQUEST
    // ==========================================================

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


    // ==========================================================
    // CODESPRINT
    // ==========================================================

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
// MODULE 7 — PAYMENT CONFIGURATION
// ============================================================

const PAYMENT_CONFIG = {

    upiId:
        "9940464883@ptaxis",

    method:
        "UPI"
};


// ============================================================
// MODULE 8 — HELPER FUNCTIONS
// ============================================================

function cleanText(value) {

    if (
        value === undefined ||
        value === null
    ) {
        return "";
    }

    return String(value).trim();
}


// ============================================================
// GENERATE REGISTRATION CODE
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


    // ----------------------------------------------------------
    // PHONE
    // ----------------------------------------------------------

    if (
        !/^[6-9]\d{9}$/.test(
            participant.phone
        )
    ) {

        return false;
    }


    // ----------------------------------------------------------
    // EMAIL
    // ----------------------------------------------------------

    if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/
            .test(
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
        participation ===
        "team"
    ) {

        return 2;
    }


    if (
        participation ===
        "individual"
    ) {

        return 1;
    }


    return 0;
}


// ============================================================
// MODULE 9 — ADMIN JWT
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
// MODULE 10 — ADMIN LOGIN
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
            // INPUT VALIDATION
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
            // USERNAME CHECK
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
            // PASSWORD CHECK
            // ------------------------------------------------

            const passwordValid =
                await bcrypt.compare(

                    password,

                    process.env
                        .ADMIN_PASSWORD_HASH
                );


            if (
                !passwordValid
            ) {

                return res.status(401).json({

                    success:
                        false,

                    message:
                        "Invalid username or password."
                });
            }


            // ------------------------------------------------
            // CREATE TOKEN
            // ------------------------------------------------

            const token =
                createAdminToken();


            // ------------------------------------------------
            // HTTP-ONLY COOKIE
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
// MODULE 11 — ADMIN AUTHENTICATION
// ============================================================

function requireAdmin(
    req,
    res,
    next
) {

    try {

        const token =
            req.cookies
                .spark_admin_token;


        if (
            !token
        ) {

            return res.status(401).json({

                success:
                    false,

                message:
                    "Admin authentication required."
            });
        }


        const decoded =
            jwt.verify(

                token,

                process.env.JWT_SECRET
            );


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
// MODULE 12 — ADMIN SESSION CHECK
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
// MODULE 13 — ADMIN LOGOUT
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

                secure:
                    process.env.NODE_ENV ===
                    "production",

                sameSite:
                    "lax"
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
// MODULE 14 — HEALTH CHECK
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
// MODULE 15 — GET EVENTS
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
// MODULE 16 — PAYMENT DETAILS
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
// MODULE 17 — CREATE REGISTRATION
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


            // ==================================================
            // READ REQUEST
            // ==================================================

            const {

                eventId,
                eventName,
                teamSize,
                amount,

                participant,
                participants,

                teamLeader,
                teamMember,

                teamName,

                utr,
                transactionId,

                payerName

            } = req.body;


            // ==================================================
            // EVENT VALIDATION
            // ==================================================

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


            // ==================================================
            // PARTICIPATION VALIDATION
            // ==================================================

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


            // ==================================================
            // PARTICIPANT COUNT
            // ==================================================

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


            // ==================================================
            // SERVER-SIDE AMOUNT
            // ==================================================

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


            // ==================================================
            // NORMALIZE PARTICIPANTS
            // ==================================================

            let normalizedParticipant =
                null;

            let normalizedTeamLeader =
                null;

            let normalizedTeamMember =
                null;


            // ==================================================
            // INDIVIDUAL
            // ==================================================

            if (
                cleanTeamSize ===
                "individual"
            ) {

                normalizedParticipant =
                    normalizeParticipant(

                        participant ||

                        (
                            Array.isArray(
                                participants
                            )
                                ? participants[0]
                                : null
                        ) ||

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


            // ==================================================
            // TEAM
            // ==================================================

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


            // ==================================================
            // PAYER NAME
            // ==================================================

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
            // UTR
            // EXACTLY 16 DIGITS
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
                        "16-digit UTR / Transaction ID is required."
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


            // ==================================================
            // DUPLICATE UTR CHECK
            // ==================================================

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


            // ==================================================
            // GENERATE REGISTRATION ID
            // ==================================================

            const registrationId =
                generateRegistrationCode(
                    event
                );


            // ==================================================
            // PARTICIPANT EMAIL
            // ==================================================

            const payerEmail =

                cleanTeamSize ===
                "individual"

                    ? (
                        normalizedParticipant &&
                        normalizedParticipant.email
                    )

                    : (
                        normalizedTeamLeader &&
                        normalizedTeamLeader.email
                    );


            const payerPhone =

                cleanTeamSize ===
                "individual"

                    ? (
                        normalizedParticipant &&
                        normalizedParticipant.phone
                    )

                    : (
                        normalizedTeamLeader &&
                        normalizedTeamLeader.phone
                    );


            // ==================================================
            // DATABASE RECORD
            // ==================================================

            const databaseRecord = {

                registrationId:


                    registrationId,


                // ------------------------------------------------
                // EVENT
                // ------------------------------------------------

                eventId:

                    cleanEventId,

                eventName:

                    event.name,


                // ------------------------------------------------
                // PARTICIPATION
                // ------------------------------------------------

                participation:

                    cleanTeamSize,

                participantCount:

                    participantCount,


                // ------------------------------------------------
                // INDIVIDUAL
                // ------------------------------------------------

                participant:

                    cleanTeamSize ===
                    "individual"

                        ? normalizedParticipant

                        : null,


                // ------------------------------------------------
                // TEAM
                // ------------------------------------------------

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
                        teamName
                    ),


                // ------------------------------------------------
                // PAYER
                // ------------------------------------------------

                payerName:

                    cleanPayerName,

                payerEmail:

                    payerEmail ||
                    null,

                payerPhone:

                    payerPhone ||
                    null,


                // ------------------------------------------------
                // PAYMENT
                // ------------------------------------------------

                amount:

                    serverAmount,

                currency:

                    "INR",

                paymentMethod:

                    PAYMENT_CONFIG.method,

                upiId:

                    PAYMENT_CONFIG.upiId,

                utr:

                    cleanUTR,

                transactionId:

                    cleanUTR,


                // ------------------------------------------------
                // PAYMENT STATUS
                // ------------------------------------------------

                paymentStatus:

                    "SUBMITTED",


                // ------------------------------------------------
                // VERIFICATION
                // ------------------------------------------------

                verificationStatus:

                    "PENDING",

                verificationReason:

                    null,

                verifiedAt:

                    null,

                verifiedBy:

                    null,


                // ------------------------------------------------
                // ACKNOWLEDGEMENT
                // ------------------------------------------------

                acknowledgementSent:

                    false,

                acknowledgementSentAt:

                    null,


                // ------------------------------------------------
                // TIMESTAMPS
                // ------------------------------------------------

                createdAt:

                    new Date(),

                updatedAt:

                    new Date()
            };


            // ==================================================
            // INSERT INTO MONGODB
            // ==================================================

            await registrationsCollection.insertOne(
                databaseRecord
            );


            // ==================================================
            // SERVER LOG
            // ==================================================

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


            // ==================================================
            // RESPONSE
            // ==================================================

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
// MODULE 18 — ADMIN: GET ALL REGISTRATIONS
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
                        createdAt: -1
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
// MODULE 19 — ADMIN: GET PENDING REGISTRATIONS
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
// MODULE 20 — EMAIL TRANSPORTER
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


// ============================================================
// MODULE 21 — ACKNOWLEDGEMENT EMAIL
// ============================================================

async function sendAcknowledgementEmail(
    registration
) {

    const recipient =
        registration.payerEmail;


    if (
        !recipient
    ) {

        throw new Error(
            "Participant email address is missing."
        );
    }


    // ----------------------------------------------------------
    // GET PARTICIPANTS
    // ----------------------------------------------------------

    const participantList = [];


    if (
        registration.participant
    ) {

        participantList.push(
            registration.participant
        );
    }


    if (
        registration.teamLeader
    ) {

        participantList.push(
            registration.teamLeader
        );
    }


    if (
        registration.teamMember
    ) {

        participantList.push(
            registration.teamMember
        );
    }


    const participantNames =

        participantList.length > 0

            ? participantList
                .map(
                    participant =>
                        participant.fullName ||
                        participant.name ||
                        "Participant"
                )
                .join(", ")

            : "Participant";


    const amount =
        registration.amount != null

            ? `₹${registration.amount}`

            : "—";


    const fromName =
        process.env.EMAIL_FROM_NAME ||
        "SPARK 2026";


    // ----------------------------------------------------------
    // SEND EMAIL
    // ----------------------------------------------------------

    await emailTransporter.sendMail({

        from:
            `"${fromName}" <${process.env.SMTP_USER}>`,

        to:
            recipient,

        subject:
            `SPARK 2026 — Registration Confirmed | ${registration.eventName}`,

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
UPI ID          : ${registration.upiId || PAYMENT_CONFIG.upiId}
UTR             : ${registration.utr || "—"}
Payment Status  : VERIFIED

Your participation is now officially confirmed.

Please keep your Registration ID safely for future reference.

We look forward to welcoming you to SPARK 2026.

Regards,
SPARK 2026 Organising Team
Department of Electronics and Communication Engineering
Sathyabama Institute of Science and Technology
Chennai`,

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


<!-- HEADER -->

<div
style="
background:#081833;
padding:30px;
text-align:center;
color:#ffffff;
"
>

<h1
style="
margin:0;
font-size:32px;
"
>
SPARK 2026
</h1>


<p
style="
margin:8px 0 0;
color:#dce8fa;
"
>
Registration Confirmation
</p>

</div>


<!-- BODY -->

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


<!-- REGISTRATION DETAILS -->

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
color:#1565c0;
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


<!-- PAYMENT DETAILS -->

<div
style="
margin-top:20px;
padding:22px;
background:#f7fff8;
border-radius:12px;
"
>

<h2
style="
color:#15803d;
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


<p
style="
margin-top:25px;
"
>

Your participation is now
<strong>
officially confirmed.
</strong>

</p>


<p>

Please keep your
<strong>
Registration ID
</strong>
safe for future reference.

</p>


<p>

We look forward to welcoming you
to SPARK 2026.

</p>


<p>

Regards,<br>

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

</div>

</body>

</html>
`
    });
}


// ============================================================
// MODULE 22 — ADMIN: VERIFY PAYMENT
// ============================================================

app.post(
    "/api/admin/verify",
    requireAdmin,
    async (req, res) => {

        try {

            await connectDatabase();


            const registrationId =
                cleanText(
                    req.body.registrationId
                );


            const adminName =
                cleanText(
                    req.admin.username ||
                    req.body.adminName
                ) ||
                "Admin";


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
            // FIND REGISTRATION
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
            // ALREADY VERIFIED
            // ------------------------------------------------

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


            // ------------------------------------------------
            // UPDATE PAYMENT STATUS FIRST
            // ------------------------------------------------

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


            // ------------------------------------------------
            // GET UPDATED REGISTRATION
            // ------------------------------------------------

            const verifiedRegistration =
                await registrationsCollection.findOne({

                    registrationId:
                        registrationId
                });


            // ------------------------------------------------
            // SEND ACKNOWLEDGEMENT EMAIL
            // ------------------------------------------------

            let acknowledgementSent =
                false;


            let emailMessage =
                "Acknowledgement email not sent.";


            try {

                await sendAcknowledgementEmail(
                    verifiedRegistration
                );


                acknowledgementSent =
                    true;


                emailMessage =
                    "Acknowledgement email sent successfully.";


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

            }

            catch (emailError) {

                console.error(
                    "⚠️ Acknowledgement email error:",
                    emailError
                );


                emailMessage =
                    "Payment verified, but acknowledgement email could not be sent.";
            }


            // ------------------------------------------------
            // LOG
            // ------------------------------------------------

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


            return res.json({

                success:
                    true,

                message:
                    "Payment verified successfully.",

                emailMessage:
                    emailMessage,

                registrationId:
                    registrationId,

                paymentStatus:
                    "VERIFIED",

                verificationStatus:
                    "VERIFIED",

                acknowledgementSent:
                    acknowledgementSent
            });

        }

        catch (error) {

            console.error(
                "Admin verification error:",
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
// MODULE 23 — ADMIN: REJECT PAYMENT
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
                cleanText(
                    req.admin.username ||
                    req.body.adminName
                ) ||
                "Admin";


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


            // ------------------------------------------------
            // UPDATE
            // ------------------------------------------------

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

                        acknowledgementSent:
                            false,

                        acknowledgementSentAt:
                            null,

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
// MODULE 24 — GET SINGLE REGISTRATION
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
// MODULE 25 — 404 HANDLER
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
// MODULE 26 — GLOBAL ERROR HANDLER
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
// MODULE 27 — GRACEFUL SHUTDOWN
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
// MODULE 28 — START SERVER
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
                    "✅ UTR: EXACTLY 16 DIGITS"
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
// START SERVER
// ============================================================

startServer();