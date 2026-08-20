// ============================================================
// SPARK 2026 — ADMIN DASHBOARD
// ============================================================

"use strict";


// ============================================================
// BACKEND URL
// ============================================================
//
// Leave empty when frontend and backend use the same domain.
//
// If your frontend and backend are hosted separately,
// change this to your backend URL.
//
// Example:
// const BACKEND_URL = "https://your-backend-domain.com";
//
// ============================================================

const BACKEND_URL = "";


// ============================================================
// DOM ELEMENTS
// ============================================================

const adminUsername =
    document.getElementById("adminUsername");

const logoutButton =
    document.getElementById("logoutButton");

const pendingCount =
    document.getElementById("pendingCount");

const dashboardMessage =
    document.getElementById("dashboardMessage");

const refreshButton =
    document.getElementById("refreshButton");

const transactionSearchInput =
    document.getElementById("transactionSearchInput");

const transactionSearchButton =
    document.getElementById("transactionSearchButton");

const exportExcelButton =
    document.getElementById("exportExcelButton");

const registrationsContainer =
    document.getElementById("registrationsContainer");

const detailsModal =
    document.getElementById("detailsModal");

const closeModal =
    document.getElementById("closeModal");

const modalContent =
    document.getElementById("modalContent");


// ============================================================
// STATE
// ============================================================

let registrations = [];

let currentRegistration = null;


// ============================================================
// HTML ESCAPE
// ============================================================

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {
        return "";
    }

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// ============================================================
// DISPLAY VALUE
// ============================================================

function displayValue(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "—";
    }

    return escapeHTML(value);
}


// ============================================================
// FORMAT CURRENCY
// ============================================================

function formatCurrency(value) {

    if (
        value === null ||
        value === undefined ||
        value === ""
    ) {
        return "₹0.00";
    }

    const amount = Number(value);

    if (Number.isNaN(amount)) {
        return escapeHTML(value);
    }

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }
    ).format(amount);
}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(value) {

    if (!value) {
        return "—";
    }

    try {

        const date = new Date(value);

        if (
            Number.isNaN(
                date.getTime()
            )
        ) {
            return displayValue(value);
        }

        return escapeHTML(
            date.toLocaleString(
                "en-IN",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            )
        );

    }
    catch (error) {

        return displayValue(value);

    }
}


// ============================================================
// DASHBOARD MESSAGE
// ============================================================

function showMessage(
    message,
    type = "info"
) {

    if (!dashboardMessage) {
        return;
    }

    dashboardMessage.textContent =
        message;

    dashboardMessage.className =
        "dashboard-message";

    if (type === "success") {

        dashboardMessage.classList.add(
            "success"
        );

    }
    else if (type === "error") {

        dashboardMessage.classList.add(
            "error"
        );

    }
    else if (type === "warning") {

        dashboardMessage.classList.add(
            "warning"
        );

    }
}


// ============================================================
// API REQUEST HELPER
// ============================================================

async function apiRequest(
    endpoint,
    options = {}
) {

    const requestOptions = {
        credentials: "include",
        ...options
    };

    requestOptions.headers = {
        ...(options.headers || {})
    };


    if (options.body) {

        requestOptions.headers[
            "Content-Type"
        ] = "application/json";

    }


    const response =
        await fetch(
            `${BACKEND_URL}${endpoint}`,
            requestOptions
        );


    let data = null;


    try {

        data =
            await response.json();

    }
    catch (error) {

        data = null;

    }


    if (
        response.status === 401 ||
        response.status === 403
    ) {

        window.location.href =
            "admin-login.html";

        throw new Error(
            "Administrator session expired."
        );

    }


    if (!response.ok) {

        throw new Error(
            data?.message ||
            `Request failed with status ${response.status}.`
        );

    }


    return data;
}


// ============================================================
// CHECK ADMIN SESSION
// ============================================================

async function checkAdminSession() {

    try {

        showMessage(
            "Checking administrator session..."
        );


        /*
         * IMPORTANT:
         * Your current server.js uses:
         *
         * GET /api/admin/session
         */

        const data =
            await apiRequest(
                "/api/admin/session"
            );


        const username =
            data?.username ||
            data?.admin?.username ||
            "Administrator";


        if (adminUsername) {

            adminUsername.textContent =
                username;

        }


        showMessage(
            "Administrator session verified.",
            "success"
        );


        return true;

    }
    catch (error) {

        console.error(
            "Administrator session error:",
            error
        );


        if (
            error.message !==
            "Administrator session expired."
        ) {

            showMessage(
                error.message ||
                "Unable to verify administrator session.",
                "error"
            );

        }


        return false;
    }
}


// ============================================================
// LOAD REGISTRATIONS
// ============================================================

async function loadRegistrations() {

    if (registrationsContainer) {

        registrationsContainer.innerHTML = `
            <div class="empty-state">

                <h3>
                    Loading Registrations
                </h3>

                <p>
                    Please wait while registrations are loaded.
                </p>

            </div>
        `;

    }


    try {

        /*
         * Current server endpoint:
         *
         * GET /api/admin/registrations
         */

        const data =
            await apiRequest(
                "/api/admin/registrations"
            );


        let list = [];


        if (
            Array.isArray(data)
        ) {

            list = data;

        }
        else if (
            Array.isArray(
                data?.registrations
            )
        ) {

            list =
                data.registrations;

        }
        else if (
            Array.isArray(
                data?.data
            )
        ) {

            list =
                data.data;

        }


        /*
         * Server already returns PENDING registrations.
         *
         * We keep this additional filter as protection
         * on the frontend.
         */

        registrations =
            list.filter(
                registration =>
                    String(
                        registration?.verificationStatus ||
                        "PENDING"
                    ).toUpperCase() ===
                    "PENDING"
            );


        updatePendingCount();

        renderRegistrations();


        showMessage(
            `Loaded ${registrations.length} pending registration${registrations.length === 1 ? "" : "s"}.`,
            "success"
        );

    }
    catch (error) {

        console.error(
            "Load registrations error:",
            error
        );


        registrations = [];

        updatePendingCount();


        if (registrationsContainer) {

            registrationsContainer.innerHTML = `
                <div class="empty-state">

                    <h3>
                        Unable to Load Registrations
                    </h3>

                    <p>
                        ${escapeHTML(
                            error.message ||
                            "Please try again."
                        )}
                    </p>

                </div>
            `;

        }


        showMessage(
            error.message ||
            "Unable to load registrations.",
            "error"
        );

    }
}


// ============================================================
// UPDATE PENDING COUNT
// ============================================================

function updatePendingCount() {

    if (pendingCount) {

        pendingCount.textContent =
            String(
                registrations.length
            );

    }
}


// ============================================================
// RENDER REGISTRATIONS
// ============================================================

function renderRegistrations() {

    if (!registrationsContainer) {
        return;
    }


    if (registrations.length === 0) {

        registrationsContainer.innerHTML = `
            <div class="empty-state">

                <div class="empty-icon">
                    ✓
                </div>

                <h3>
                    No Pending Registrations
                </h3>

                <p>
                    There are currently no registrations
                    waiting for verification.
                </p>

            </div>
        `;

        return;
    }


    registrationsContainer.innerHTML =
        registrations
            .map(
                registration =>
                    createRegistrationCard(
                        registration
                    )
            )
            .join("");


    attachRegistrationEvents();
}


// ============================================================
// CREATE REGISTRATION CARD
// ============================================================

function createRegistrationCard(
    registration
) {

    const registrationId =
        registration.registrationId ||
        registration._id ||
        "—";


    const eventName =
        registration.eventName ||
        registration.eventId ||
        "—";


    const teamName =
        registration.teamName ||
        "Individual";


    const payerName =
        registration.payerName ||
        registration.teamLeader?.name ||
        "—";


    const transactionId =
        registration.transactionId ||
        registration.utr ||
        "—";


    const amount =
        registration.amount ??
        registration.totalAmount ??
        0;


    let participants = [];


    if (
        Array.isArray(
            registration.participants
        )
    ) {

        participants =
            registration.participants;

    }
    else {

        /*
         * Your current server stores teamLeader,
         * teamMember and participant separately.
         *
         * Build the participant list for display.
         */

        if (
            registration.participation ===
            "team"
        ) {

            if (
                registration.teamLeader
            ) {

                participants.push(
                    registration.teamLeader
                );

            }

            if (
                registration.teamMember
            ) {

                participants.push(
                    registration.teamMember
                );

            }

        }
        else if (
            registration.participant
        ) {

            participants.push(
                registration.participant
            );

        }

    }


    const participantCount =
        participants.length ||
        Number(
            registration.teamSize
        ) ||
        0;


    const upiId =
        registration.upiId ||
        "9940464883@ptaxis";


    return `
        <article
            class="registration-card"
            data-registration-id="${escapeHTML(
                registrationId
            )}"
        >

            <!-- =========================================
                 CARD HEADER
                 ========================================= -->

            <div class="registration-header">

                <div>

                    <div class="registration-id">
                        ${displayValue(
                            registrationId
                        )}
                    </div>

                    <div class="event-name">
                        ${displayValue(
                            eventName
                        )}
                    </div>

                </div>


                <div class="pending-badge">
                    PENDING
                </div>

            </div>


            <!-- =========================================
                 REGISTRATION INFORMATION
                 ========================================= -->

            <div class="registration-info">


                <div class="info-item">

                    <span class="info-label">
                        Team Name
                    </span>

                    <span class="info-value">
                        ${displayValue(
                            teamName
                        )}
                    </span>

                </div>


                <div class="info-item">

                    <span class="info-label">
                        Payer Name
                    </span>

                    <span class="info-value">
                        ${displayValue(
                            payerName
                        )}
                    </span>

                </div>


                <div class="info-item">

                    <span class="info-label">
                        Participants
                    </span>

                    <span class="info-value">
                        ${escapeHTML(
                            participantCount
                        )}
                    </span>

                </div>


                <div class="info-item">

                    <span class="info-label">
                        Amount
                    </span>

                    <span class="info-value">
                        ${formatCurrency(
                            amount
                        )}
                    </span>

                </div>


                <div class="info-item">

                    <span class="info-label">
                        UPI
                    </span>

                    <span class="info-value upi-value">
                        ${displayValue(
                            upiId
                        )}
                    </span>

                </div>


                <div class="info-item">

                    <span class="info-label">
                        Transaction ID
                    </span>

                    <span class="info-value utr-value">
                        ${displayValue(
                            transactionId
                        )}
                    </span>

                </div>

            </div>


            <!-- =========================================
                 PARTICIPANTS
                 ========================================= -->

            <div class="participants-section">

                <h3>
                    Participants
                </h3>


                ${
                    participants.length === 0

                        ? `
                            <p>
                                No participant details available.
                            </p>
                        `

                        : participants
                            .map(
                                (
                                    participant,
                                    index
                                ) =>
                                    createParticipantItem(
                                        participant,
                                        index
                                    )
                            )
                            .join("")
                }

            </div>


            <!-- =========================================
                 ACTIONS
                 ========================================= -->

            <div class="registration-actions">


                <button
                    type="button"
                    class="view-button"
                    data-action="view"
                    data-registration-id="${escapeHTML(
                        registrationId
                    )}"
                >
                    View Full Details
                </button>


                <button
                    type="button"
                    class="verify-button"
                    data-action="verify"
                    data-registration-id="${escapeHTML(
                        registrationId
                    )}"
                >
                    ✓ Verify Payment
                </button>


                <button
                    type="button"
                    class="reject-button"
                    data-action="reject"
                    data-registration-id="${escapeHTML(
                        registrationId
                    )}"
                >
                    ✕ Reject Payment
                </button>

            </div>

        </article>
    `;
}


// ============================================================
// CREATE PARTICIPANT ITEM
// ============================================================

function createParticipantItem(
    participant,
    index
) {

    const name =
        participant?.name ||
        participant?.fullName ||
        participant?.participantName ||
        "—";


    const email =
        participant?.email ||
        "—";


    const phone =
        participant?.phone ||
        participant?.mobile ||
        participant?.phoneNumber ||
        "—";


    const college =
        participant?.college ||
        participant?.institution ||
        "—";


    return `
        <div class="participant-item">

            <strong>
                Participant ${index + 1}:
                ${displayValue(name)}
            </strong>

            <span>
                Email:
                ${displayValue(email)}
            </span>

            <span>
                Phone:
                ${displayValue(phone)}
            </span>

            <span>
                College:
                ${displayValue(college)}
            </span>

        </div>
    `;
}


// ============================================================
// ATTACH CARD EVENTS
// ============================================================

function attachRegistrationEvents() {

    const buttons =
        registrationsContainer.querySelectorAll(
            "[data-action]"
        );


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                async () => {

                    const action =
                        button.dataset.action;


                    const registrationId =
                        button.dataset.registrationId;


                    if (
                        action === "view"
                    ) {

                        const registration =
                            findRegistration(
                                registrationId
                            );


                        if (registration) {

                            openDetailsModal(
                                registration
                            );

                        }

                    }
                    else if (
                        action === "verify"
                    ) {

                        await verifyRegistration(
                            registrationId
                        );

                    }
                    else if (
                        action === "reject"
                    ) {

                        await rejectRegistration(
                            registrationId
                        );

                    }

                }
            );

        }
    );
}


// ============================================================
// FIND REGISTRATION
// ============================================================

function findRegistration(
    registrationId
) {

    return registrations.find(
        registration =>
            String(
                registration.registrationId ||
                registration._id
            ) ===
            String(
                registrationId
            )
    );
}


// ============================================================
// VERIFY REGISTRATION
// ============================================================

async function verifyRegistration(
    registrationId
) {

    const registration =
        findRegistration(
            registrationId
        );


    if (!registration) {

        showMessage(
            "Registration not found.",
            "error"
        );

        return;
    }


    const confirmed =
        window.confirm(
            `Verify registration ${registrationId}?\n\n` +
            `This will mark the registration as VERIFIED.`
        );


    if (!confirmed) {
        return;
    }


    showMessage(
        `Verifying ${registrationId}...`
    );


    try {

        /*
         * IMPORTANT:
         * Your current server.js uses:
         *
         * PATCH
         * /api/admin/registrations/:registrationId/verify
         */

        await apiRequest(
            `/api/admin/registrations/${encodeURIComponent(
                registrationId
            )}/verify`,
            {
                method: "PATCH",
                body: JSON.stringify({})
            }
        );


        showMessage(
            `${registrationId} verified successfully.`,
            "success"
        );


        closeDetailsModal();


        /*
         * The server only returns PENDING registrations.
         *
         * After verification, the registration disappears
         * from the pending list and the count decreases.
         */

        await loadRegistrations();

    }
    catch (error) {

        console.error(
            "Verify registration error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to verify registration.",
            "error"
        );

    }
}


// ============================================================
// REJECT REGISTRATION
// ============================================================

async function rejectRegistration(
    registrationId
) {

    const registration =
        findRegistration(
            registrationId
        );


    if (!registration) {

        showMessage(
            "Registration not found.",
            "error"
        );

        return;
    }


    const confirmed =
        window.confirm(
            `Reject registration ${registrationId}?\n\n` +
            `The registration will be marked as REJECTED ` +
            `and removed from pending verification.`
        );


    if (!confirmed) {
        return;
    }


    showMessage(
        `Rejecting ${registrationId}...`
    );


    try {

        /*
         * IMPORTANT:
         * Your current server.js uses:
         *
         * PATCH
         * /api/admin/registrations/:registrationId/reject
         */

        await apiRequest(
            `/api/admin/registrations/${encodeURIComponent(
                registrationId
            )}/reject`,
            {
                method: "PATCH",
                body: JSON.stringify({})
            }
        );


        showMessage(
            `${registrationId} rejected successfully.`,
            "success"
        );


        closeDetailsModal();


        /*
         * Reloading the pending registrations recalculates
         * the pending count.
         *
         * Example:
         *
         * Before reject: 1
         * After reject:  0
         *
         * IMPORTANT:
         * The registration ID itself is NOT reused.
         */

        await loadRegistrations();

    }
    catch (error) {

        console.error(
            "Reject registration error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to reject registration.",
            "error"
        );

    }
}


// ============================================================
// OPEN DETAILS MODAL
// ============================================================

function openDetailsModal(
    registration
) {

    if (
        !detailsModal ||
        !modalContent
    ) {
        return;
    }


    currentRegistration =
        registration;


    modalContent.innerHTML =
        createModalContent(
            registration
        );


    detailsModal.classList.remove(
        "hidden"
    );


    document.body.classList.add(
        "modal-open"
    );


    attachModalActionEvents();
}


// ============================================================
// CREATE MODAL CONTENT
// ============================================================

function createModalContent(
    registration
) {

    const registrationId =
        registration.registrationId ||
        registration._id ||
        "—";


    const eventName =
        registration.eventName ||
        registration.eventId ||
        "—";


    const eventDate =
        registration.eventDate ||
        "—";


    const eventTime =
        registration.eventTime ||
        "—";


    const eventVenue =
        registration.eventVenue ||
        registration.venue ||
        "—";


    const teamName =
        registration.teamName ||
        "—";


    const payerName =
        registration.payerName ||
        "—";


    /*
     * Payer email is intentionally NOT displayed.
     *
     * Payer phone is shown only if available.
     */

    const payerPhone =
        registration.payerPhone ||
        registration.teamLeader?.phone ||
        "—";


    const transactionId =
        registration.transactionId ||
        registration.utr ||
        "—";


    const amount =
        registration.amount ??
        registration.totalAmount ??
        0;


    const paymentStatus =
        registration.paymentStatus ||
        "PENDING";


    const verificationStatus =
        registration.verificationStatus ||
        "PENDING";


    const paymentMethod =
        registration.paymentMethod ||
        "UPI";


    const upiId =
        registration.upiId ||
        "9940464883@ptaxis";


    let participants = [];


    if (
        Array.isArray(
            registration.participants
        )
    ) {

        participants =
            registration.participants;

    }
    else {

        if (
            registration.participation ===
            "team"
        ) {

            if (
                registration.teamLeader
            ) {

                participants.push(
                    registration.teamLeader
                );

            }

            if (
                registration.teamMember
            ) {

                participants.push(
                    registration.teamMember
                );

            }

        }
        else if (
            registration.participant
        ) {

            participants.push(
                registration.participant
            );

        }

    }


    return `

        <!-- ================================================
             REGISTRATION INFORMATION
             ================================================ -->

        <div class="modal-section">

            <h3>
                Registration Information
            </h3>


            <div class="detail-row">

                <div class="detail-label">
                    Registration ID
                </div>

                <div class="detail-value">
                    ${displayValue(
                        registrationId
                    )}
                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Event
                </div>

                <div class="detail-value">
                    ${displayValue(
                        eventName
                    )}
                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Team Name
                </div>

                <div class="detail-value">
                    ${displayValue(
                        teamName
                    )}
                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Registration Date
                </div>

                <div class="detail-value">
                    ${formatDate(
                        registration.createdAt ||
                        registration.registrationDate
                    )}
                </div>

            </div>

        </div>


        <!-- ================================================
             EVENT DETAILS
             ================================================ -->

        <div class="modal-section">

            <h3>
                Event Details
            </h3>


            <div class="detail-row">

                <div class="detail-label">
                    Event Date
                </div>

                <div class="detail-value">
                    ${displayValue(
                        eventDate
                    )}
                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Event Time
                </div>

                <div class="detail-value">
                    ${displayValue(
                        eventTime
                    )}
                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Venue
                </div>

                <div class="detail-value">
                    ${displayValue(
                        eventVenue
                    )}
                </div>

            </div>

        </div>


        <!-- ================================================
             PAYER INFORMATION
             ================================================ -->

        <div class="modal-section">

            <h3>
                Payer Information
            </h3>


            <div class="detail-row">

                <div class="detail-label">
                    Payer Name
                </div>

                <div class="detail-value">
                    ${displayValue(
                        payerName
                    )}
                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Payer Phone
                </div>

                <div class="detail-value">
                    ${displayValue(
                        payerPhone
                    )}
                </div>

            </div>

        </div>


        <!-- ================================================
             PAYMENT INFORMATION
             ================================================ -->

        <div class="modal-section">

            <h3>
                Payment Information
            </h3>


            <div class="detail-row">

                <div class="detail-label">
                    Payment Method
                </div>

                <div class="detail-value">
                    ${displayValue(
                        paymentMethod
                    )}
                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    UPI ID
                </div>

                <div class="detail-value">
                    ${displayValue(
                        upiId
                    )}
                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Transaction ID
                </div>

                <div class="detail-value">
                    ${displayValue(
                        transactionId
                    )}
                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Amount
                </div>

                <div class="detail-value">
                    ${formatCurrency(
                        amount
                    )}
                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Payment Status
                </div>

                <div class="detail-value">
                    ${displayValue(
                        paymentStatus
                    )}
                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Verification Status
                </div>

                <div class="detail-value">
                    ${displayValue(
                        verificationStatus
                    )}
                </div>

            </div>

        </div>


        <!-- ================================================
             PARTICIPANTS
             ================================================ -->

        <div class="modal-section">

            <h3>
                Participants
            </h3>


            ${
                participants.length === 0

                    ? `
                        <p>
                            No participant details available.
                        </p>
                    `

                    : participants
                        .map(
                            (
                                participant,
                                index
                            ) =>
                                createModalParticipant(
                                    participant,
                                    index
                                )
                        )
                        .join("")
            }

        </div>


        <!-- ================================================
             ACTIONS
             ================================================ -->

        ${
            String(
                verificationStatus
            ).toUpperCase() ===
            "PENDING"

                ? `
                    <div class="registration-actions">

                        <button
                            type="button"
                            class="verify-button"
                            id="modalVerifyButton"
                        >
                            ✓ Verify Payment
                        </button>

                        <button
                            type="button"
                            class="reject-button"
                            id="modalRejectButton"
                        >
                            ✕ Reject Payment
                        </button>

                    </div>
                `

                : ""
        }

    `;
}


// ============================================================
// MODAL PARTICIPANT
// ============================================================

function createModalParticipant(
    participant,
    index
) {

    const name =
        participant?.name ||
        participant?.fullName ||
        participant?.participantName ||
        "—";


    const email =
        participant?.email ||
        "—";


    const phone =
        participant?.phone ||
        participant?.mobile ||
        participant?.phoneNumber ||
        "—";


    const college =
        participant?.college ||
        participant?.institution ||
        "—";


    const department =
        participant?.department ||
        "—";


    const year =
        participant?.year ||
        participant?.studyYear ||
        "—";


    return `
        <div class="participant-item">

            <strong>
                Participant ${index + 1}:
                ${displayValue(name)}
            </strong>

            <span>
                Email:
                ${displayValue(email)}
            </span>

            <span>
                Phone:
                ${displayValue(phone)}
            </span>

            <span>
                College:
                ${displayValue(college)}
            </span>

            <span>
                Department:
                ${displayValue(department)}
            </span>

            <span>
                Year:
                ${displayValue(year)}
            </span>

        </div>
    `;
}


// ============================================================
// MODAL ACTION EVENTS
// ============================================================

function attachModalActionEvents() {

    const modalVerifyButton =
        document.getElementById(
            "modalVerifyButton"
        );


    const modalRejectButton =
        document.getElementById(
            "modalRejectButton"
        );


    if (
        modalVerifyButton &&
        currentRegistration
    ) {

        modalVerifyButton.addEventListener(
            "click",
            async () => {

                await verifyRegistration(
                    currentRegistration.registrationId ||
                    currentRegistration._id
                );

            }
        );

    }


    if (
        modalRejectButton &&
        currentRegistration
    ) {

        modalRejectButton.addEventListener(
            "click",
            async () => {

                await rejectRegistration(
                    currentRegistration.registrationId ||
                    currentRegistration._id
                );

            }
        );

    }
}


// ============================================================
// CLOSE MODAL
// ============================================================

function closeDetailsModal() {

    if (detailsModal) {

        detailsModal.classList.add(
            "hidden"
        );

    }


    document.body.classList.remove(
        "modal-open"
    );


    currentRegistration =
        null;
}


// ============================================================
// TRANSACTION ID SEARCH
// ============================================================

async function searchTransaction() {

    if (
        !transactionSearchInput
    ) {
        return;
    }


    /*
     * Only numbers.
     * Maximum 12 digits.
     */

    const transactionId =
        transactionSearchInput.value
            .replace(
                /\D/g,
                ""
            )
            .slice(
                0,
                12
            );


    transactionSearchInput.value =
        transactionId;


    /*
     * EXACTLY 12 DIGITS
     */

    if (
        !/^\d{12}$/.test(
            transactionId
        )
    ) {

        showMessage(
            "Please enter a valid 12-digit Transaction ID.",
            "warning"
        );


        window.alert(
            "Please enter a valid 12-digit Transaction ID."
        );


        transactionSearchInput.focus();

        return;
    }


    showMessage(
        "Searching transaction..."
    );


    try {

        /*
         * Current server endpoint:
         *
         * GET /api/admin/search-transaction
         */

        const data =
            await apiRequest(
                `/api/admin/search-transaction?transactionId=${encodeURIComponent(
                    transactionId
                )}`
            );


        const registration =
            data?.registration ||
            data?.data ||
            null;


        if (!registration) {

            showMessage(
                "No registration found for this Transaction ID.",
                "warning"
            );


            window.alert(
                "No registration found for this Transaction ID."
            );

            return;
        }


        showMessage(
            "Transaction found.",
            "success"
        );


        openDetailsModal(
            registration
        );

    }
    catch (error) {

        console.error(
            "Transaction search error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to search transaction.",
            "error"
        );


        window.alert(
            error.message ||
            "Unable to search transaction."
        );

    }
}


// ============================================================
// EXCEL EXPORT
// ============================================================

async function exportExcel() {

    if (exportExcelButton) {

        exportExcelButton.disabled =
            true;

        exportExcelButton.textContent =
            "📥 Exporting...";

    }


    showMessage(
        "Preparing Excel export..."
    );


    try {

        /*
         * Current server endpoint:
         *
         * GET /api/admin/export-excel
         */

        const response =
            await fetch(
                `${BACKEND_URL}/api/admin/export-excel`,
                {
                    method: "GET",
                    credentials: "include"
                }
            );


        if (
            response.status === 401 ||
            response.status === 403
        ) {

            window.location.href =
                "admin-login.html";

            return;
        }


        if (!response.ok) {

            let message =
                "Unable to export registrations.";


            try {

                const data =
                    await response.json();


                message =
                    data?.message ||
                    message;

            }
            catch (error) {
                // Ignore invalid JSON.
            }


            throw new Error(
                message
            );
        }


        const blob =
            await response.blob();


        const contentDisposition =
            response.headers.get(
                "Content-Disposition"
            );


        let filename =
            "SPARK2026_Registrations.xlsx";


        if (contentDisposition) {

            const match =
                contentDisposition.match(
                    /filename="?([^"]+)"?/i
                );


            if (
                match &&
                match[1]
            ) {

                filename =
                    match[1];

            }
        }


        const url =
            window.URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            filename;


        document.body.appendChild(
            link
        );


        link.click();


        link.remove();


        window.URL.revokeObjectURL(
            url
        );


        showMessage(
            "Excel file exported successfully.",
            "success"
        );

    }
    catch (error) {

        console.error(
            "Excel export error:",
            error
        );


        showMessage(
            error.message ||
            "Unable to export Excel file.",
            "error"
        );


        window.alert(
            error.message ||
            "Unable to export Excel file."
        );

    }
    finally {

        if (exportExcelButton) {

            exportExcelButton.disabled =
                false;

            exportExcelButton.textContent =
                "📥 Export Excel";

        }

    }
}


// ============================================================
// LOGOUT
// ============================================================

async function logoutAdmin() {

    const confirmed =
        window.confirm(
            "Are you sure you want to logout?"
        );


    if (!confirmed) {
        return;
    }


    try {

        await apiRequest(
            "/api/admin/logout",
            {
                method: "POST",
                body: JSON.stringify({})
            }
        );

    }
    catch (error) {

        console.error(
            "Logout error:",
            error
        );

    }


    window.location.href =
        "admin-login.html";
}


// ============================================================
// REFRESH
// ============================================================

async function refreshDashboard() {

    if (refreshButton) {

        refreshButton.disabled =
            true;

        refreshButton.textContent =
            "↻ Refreshing...";

    }


    try {

        await loadRegistrations();

    }
    finally {

        if (refreshButton) {

            refreshButton.disabled =
                false;

            refreshButton.textContent =
                "↻ Refresh";

        }
    }
}


// ============================================================
// EVENT LISTENERS
// ============================================================

if (refreshButton) {

    refreshButton.addEventListener(
        "click",
        refreshDashboard
    );

}


if (logoutButton) {

    logoutButton.addEventListener(
        "click",
        logoutAdmin
    );

}


if (transactionSearchButton) {

    transactionSearchButton.addEventListener(
        "click",
        searchTransaction
    );

}


if (transactionSearchInput) {

    /*
     * Allow numbers only and maximum 12 digits.
     */

    transactionSearchInput.addEventListener(
        "input",
        () => {

            transactionSearchInput.value =
                transactionSearchInput.value
                    .replace(
                        /\D/g,
                        ""
                    )
                    .slice(
                        0,
                        12
                    );

        }
    );


    /*
     * Press Enter to search.
     */

    transactionSearchInput.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Enter"
            ) {

                event.preventDefault();

                searchTransaction();

            }

        }
    );

}


if (exportExcelButton) {

    exportExcelButton.addEventListener(
        "click",
        exportExcel
    );

}


if (closeModal) {

    closeModal.addEventListener(
        "click",
        closeDetailsModal
    );

}


if (detailsModal) {

    detailsModal.addEventListener(
        "click",
        event => {

            /*
             * Clicking outside the modal box
             * closes the modal.
             */

            if (
                event.target ===
                detailsModal
            ) {

                closeDetailsModal();

            }

        }
    );

}


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape" &&
            detailsModal &&
            !detailsModal.classList.contains(
                "hidden"
            )
        ) {

            closeDetailsModal();

        }

    }
);


// ============================================================
// INITIALIZE DASHBOARD
// ============================================================

async function initializeDashboard() {

    const authenticated =
        await checkAdminSession();


    if (!authenticated) {

        return;

    }


    await loadRegistrations();
}


// ============================================================
// START DASHBOARD
// ============================================================

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeDashboard
    );

}
else {

    initializeDashboard();

}