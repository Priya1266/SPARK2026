// ============================================================
// SPARK 2026 — REGISTRATION SERVER
// UPI PAYMENT + 16-DIGIT UTR + MANUAL VERIFICATION + MONGODB
// ============================================================

require("dotenv").config();

const express = require("express");
const crypto = require("crypto");
const { MongoClient } = require("mongodb");
const cookieParser = require("cookie-parser");

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
// MODULE 4 — CONNECT TO MONGODB
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


                // --------------------------------------------------
                // UNIQUE REGISTRATION ID
                // --------------------------------------------------

                await registrationsCollection.createIndex(
                    {
                        registrationId: 1
                    },
                    {
                        unique: true
                    }
                );


                // --------------------------------------------------
                // UNIQUE UTR
                // --------------------------------------------------

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


                // --------------------------------------------------
                // VERIFICATION INDEX
                // --------------------------------------------------

                await registrationsCollection.createIndex(
                    {
                        verificationStatus: 1
                    }
                );


                // --------------------------------------------------
                // EVENT INDEX
                // --------------------------------------------------

                await registrationsCollection.createIndex(
                    {
                        eventId: 1
                    }
                );


                // --------------------------------------------------
                // DATE INDEX
                // --------------------------------------------------

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

                // IMPORTANT:
                // Do not process.exit() on Vercel.
                // Throw the error so the API request can
                // return a proper server error.

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
// MODULE 6 — PAYMENT CONFIGURATION
// ============================================================

const PAYMENT_CONFIG = {

    upiId:
        "9940464883@ptaxis",

    method:
        "UPI"

};


// ============================================================
// MODULE 7 — HELPER FUNCTIONS
// ============================================================


// ============================================================
// CLEAN TEXT
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


    // PHONE

    if (
        !/^[6-9]\d{9}$/.test(
            participant.phone
        )
    ) {

        return false;

    }


    // EMAIL

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
// MODULE 8 — HEALTH CHECK
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
// MODULE 9 — GET EVENTS
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
// MODULE 10 — PAYMENT DETAILS
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
// MODULE 11 — CREATE REGISTRATION
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

                teamLeader,

                teamMember,

                utr,

                transactionId,

                payerName

            } = req.body;


            // ==================================================
            // 1. EVENT VALIDATION
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
            // 2. PARTICIPATION VALIDATION
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
            // 3. PARTICIPANT COUNT
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
            // 4. SERVER-SIDE AMOUNT
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
            // 5. NORMALIZE PARTICIPANTS
            // ==================================================

            let normalizedParticipant =
                null;

            let normalizedTeamLeader =
                null;

            let normalizedTeamMember =
                null;


            // ==================================================
            // INDIVIDUAL EVENT
            // ==================================================

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


            // ==================================================
            // TEAM EVENT
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
            // 6. PAYER NAME
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
            // 7. UTR VALIDATION
            // EXACTLY 16 NUMERIC DIGITS
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
            // 8. CHECK DUPLICATE UTR
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
            // 9. GENERATE REGISTRATION ID
            // ==================================================

            const registrationId =
                generateRegistrationCode(
                    event
                );


            // ==================================================
            // 10. CREATE DATABASE RECORD
            // ==================================================

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


            // ==================================================
            // 11. INSERT INTO MONGODB
            // ==================================================

            await registrationsCollection.insertOne(
                databaseRecord
            );


            // ==================================================
            // 12. SERVER LOG
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
            // 13. RESPONSE
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


            // --------------------------------------------------
            // DUPLICATE INDEX ERROR
            // --------------------------------------------------

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
// MODULE 12 — ADMIN: GET ALL REGISTRATIONS
// ============================================================

app.get(
    "/api/admin/registrations",
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
// MODULE 13 — ADMIN: GET PENDING REGISTRATIONS
// ============================================================

app.get(
    "/api/admin/pending",
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
// MODULE 14 — ADMIN: VERIFY PAYMENT
// ============================================================

app.post(
    "/api/admin/verify",
    async (req, res) => {

        try {

            await connectDatabase();


            const registrationId =
                cleanText(
                    req.body.registrationId
                );


            const adminName =
                cleanText(
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
                        "VERIFIED"

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
                "=========================================="
            );


            return res.json({

                success:
                    true,

                message:
                    "Payment verified successfully.",

                registrationId:
                    registrationId,

                paymentStatus:
                    "VERIFIED",

                verificationStatus:
                    "VERIFIED",

                acknowledgementSent:
                    false

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
// MODULE 15 — ADMIN: REJECT PAYMENT
// ============================================================

app.post(
    "/api/admin/reject",
    async (req, res) => {

        try {

            await connectDatabase();


            const registrationId =
                cleanText(
                    req.body.registrationId
                );


            const adminName =
                cleanText(
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
// MODULE 16 — GET SINGLE REGISTRATION
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
// MODULE 17 — 404 HANDLER
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
// MODULE 18 — GLOBAL ERROR HANDLER
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
// MODULE 19 — GRACEFUL SHUTDOWN
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
// MODULE 20 — START LOCAL SERVER
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
// IMPORTANT — LOCAL VS VERCEL
// ============================================================
//
// LOCAL:
//
//     node server.js
//
//     require.main === module
//     → startServer()
//     → Express listens on PORT
//
// VERCEL:
//
//     api/index.js
//     → require("../server/server")
//     → require.main !== module
//     → startServer() is NOT called
//     → Vercel handles the HTTP server
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
