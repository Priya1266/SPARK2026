// ============================================================
// SPARK 2026 — ADMIN DASHBOARD
// ============================================================


// ============================================================
// MODULE 1
// BACKEND + ELEMENTS + BASIC HELPERS
// ============================================================


// ============================================================
// BACKEND
// ============================================================
//
// IMPORTANT:
// Use 127.0.0.1 consistently.
//
// admin.js also uses:
// http://127.0.0.1:3000
//
// Do NOT change this to localhost while testing.
//

const BACKEND_URL =
    "http://127.0.0.1:3000";


// ============================================================
// ELEMENTS
// ============================================================

const registrationsContainer =
    document.getElementById(
        "registrationsContainer"
    );


const pendingCount =
    document.getElementById(
        "pendingCount"
    );


const dashboardMessage =
    document.getElementById(
        "dashboardMessage"
    );


const refreshButton =
    document.getElementById(
        "refreshButton"
    );


const logoutButton =
    document.getElementById(
        "logoutButton"
    );


const adminUsername =
    document.getElementById(
        "adminUsername"
    );


const detailsModal =
    document.getElementById(
        "detailsModal"
    );


const modalContent =
    document.getElementById(
        "modalContent"
    );


const closeModal =
    document.getElementById(
        "closeModal"
    );


// ============================================================
// ESCAPE HTML
// ============================================================
//
// Registration information comes from MongoDB/user input.
// Escape it before inserting it into HTML.
//

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );

}


// ============================================================
// FORMAT DATE
// ============================================================

function formatDate(value) {

    if (!value) {

        return "—";

    }


    try {

        return new Date(
            value
        ).toLocaleString(

            "en-IN",

            {

                dateStyle:
                    "medium",

                timeStyle:
                    "short"

            }

        );

    }


    catch {

        return String(
            value
        );

    }

}
// ============================================================
// MODULE 2
// ADMIN SESSION CHECK
// ============================================================


// ============================================================
// CHECK ADMIN SESSION
// ============================================================
//
// This verifies that the admin is still logged in.
//
// If the JWT cookie is missing/expired,
// the user is sent back to admin.html.
//

async function checkAdminSession() {

    try {

        const response =
            await fetch(

                `${BACKEND_URL}/api/admin/session`,

                {

                    method:
                        "GET",

                    credentials:
                        "include"

                }

            );


        // ====================================================
        // SESSION EXPIRED / NOT LOGGED IN
        // ====================================================

        if (
            response.status ===
            401
        ) {

            window.location.href =
                "admin.html";

            return false;

        }


        // ====================================================
        // READ RESPONSE
        // ====================================================

        const data =
            await response.json();


        // ====================================================
        // SESSION INVALID
        // ====================================================

        if (
            !response.ok ||
            !data.success
        ) {

            window.location.href =
                "admin.html";

            return false;

        }


        // ====================================================
        // DISPLAY ADMIN USERNAME
        // ====================================================

        adminUsername.textContent =
            data.username ||
            "Admin";


        return true;

    }


    catch (error) {

        console.error(
            "Session check error:",
            error
        );


        dashboardMessage.textContent =
            "Unable to connect to the backend server.";


        return false;

    }

}
// ============================================================
// MODULE 3
// LOAD PENDING REGISTRATIONS
// ============================================================


// ============================================================
// LOAD REGISTRATIONS
// ============================================================
//
// Gets registrations whose verificationStatus is PENDING.
//
// Backend endpoint:
//
// GET /api/admin/registrations
//
// ============================================================

async function loadRegistrations() {

    dashboardMessage.textContent =
        "Loading registrations...";


    registrationsContainer.innerHTML =
        "";


    try {

        const response =
            await fetch(

                `${BACKEND_URL}/api/admin/registrations`,

                {

                    method:
                        "GET",

                    credentials:
                        "include"

                }

            );


        // ====================================================
        // SESSION EXPIRED
        // ====================================================

        if (
            response.status ===
            401
        ) {

            window.location.href =
                "admin.html";

            return;

        }


        // ====================================================
        // READ RESPONSE
        // ====================================================

        const data =
            await response.json();


        // ====================================================
        // SERVER ERROR
        // ====================================================

        if (
            !response.ok ||
            !data.success
        ) {

            dashboardMessage.textContent =
                data.message ||
                "Unable to load registrations.";

            return;

        }


        // ====================================================
        // GET REGISTRATIONS
        // ====================================================

        const registrations =
            Array.isArray(
                data.registrations
            )
                ? data.registrations
                : [];


        // ====================================================
        // UPDATE PENDING COUNT
        // ====================================================

        pendingCount.textContent =
            registrations.length;


        // ====================================================
        // NO PENDING REGISTRATIONS
        // ====================================================

        if (
            registrations.length ===
            0
        ) {

            dashboardMessage.textContent =
                "No pending registrations.";


            registrationsContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        ✓
                    </div>

                    <h3>
                        All registrations are verified
                    </h3>

                    <p>
                        There are currently no registrations
                        waiting for manual verification.
                    </p>

                </div>

            `;

            return;

        }


        // ====================================================
        // STATUS MESSAGE
        // ====================================================

        dashboardMessage.textContent =

            `${registrations.length} registration(s) awaiting verification.`;


        // ====================================================
        // CREATE REGISTRATION CARDS
        // ====================================================

        registrations.forEach(

            registration => {

                const card =
                    createRegistrationCard(
                        registration
                    );


                registrationsContainer
                    .appendChild(
                        card
                    );

            }

        );

    }


    catch (error) {

        console.error(
            "Registration loading error:",
            error
        );


        dashboardMessage.textContent =
            "Unable to connect to the backend server.";

    }

}
// ============================================================
// MODULE 4
// CREATE REGISTRATION CARD
// ============================================================


// ============================================================
// CREATE REGISTRATION CARD
// ============================================================

function createRegistrationCard(
    registration
) {

    // ========================================================
    // CREATE CARD
    // ========================================================

    const card =
        document.createElement(
            "article"
        );


    card.className =
        "registration-card";


    // ========================================================
    // PARTICIPANTS
    // ========================================================

    const participants =

        Array.isArray(
            registration.participants
        )

            ? registration.participants

            : [];


    // ========================================================
    // BUILD PARTICIPANTS HTML
    // ========================================================

    let participantsHTML =
        "";


    participants.forEach(

        (
            participant,
            index
        ) => {


            participantsHTML += `

                <div class="participant-row">

                    <strong>

                        Participant ${index + 1}:

                        ${escapeHTML(
                            participant.name ||
                            "—"
                        )}

                    </strong>


                    <span>

                        Email:

                        ${escapeHTML(
                            participant.email ||
                            "—"
                        )}

                    </span>


                    <span>

                        Phone:

                        ${escapeHTML(
                            participant.phone ||
                            "—"
                        )}

                    </span>


                    ${
                        participant.college

                            ? `

                                <span>

                                    College:

                                    ${escapeHTML(
                                        participant.college
                                    )}

                                </span>

                              `

                            : ""
                    }

                </div>

            `;

        }

    );


    // ========================================================
    // CARD HTML
    // ========================================================

    card.innerHTML = `

        <!-- ================================================
             REGISTRATION HEADER
             ================================================ -->

        <div class="registration-header">


            <div>

                <div class="registration-id">

                    ${escapeHTML(
                        registration.registrationId
                    )}

                </div>


                <div class="event-name">

                    ${escapeHTML(
                        registration.eventName
                    )}

                </div>

            </div>


            <span class="pending-badge">

                PENDING

            </span>


        </div>



        <!-- ================================================
             REGISTRATION INFORMATION
             ================================================ -->

        <div class="registration-info">


            <div class="info-item">

                <span class="info-label">

                    Participation

                </span>


                <span class="info-value">

                    ${escapeHTML(
                        registration.participation ||
                        "—"
                    )}

                </span>

            </div>



            <div class="info-item">

                <span class="info-label">

                    Team Name

                </span>


                <span class="info-value">

                    ${escapeHTML(
                        registration.teamName ||
                        "—"
                    )}

                </span>

            </div>



            <div class="info-item">

                <span class="info-label">

                    Amount

                </span>


                <span class="info-value">

                    ₹${escapeHTML(
                        registration.amount ||
                        "0"
                    )}

                </span>

            </div>



            <div class="info-item">

                <span class="info-label">

                    Payment

                </span>


                <span class="info-value">

                    ${escapeHTML(
                        registration.paymentStatus ||
                        "—"
                    )}

                </span>

            </div>



            <div class="info-item">

                <span class="info-label">

                    Payer

                </span>


                <span class="info-value">

                    ${escapeHTML(
                        registration.payerName ||
                        "—"
                    )}

                </span>

            </div>



            <div class="info-item">

                <span class="info-label">

                    Email

                </span>


                <span class="info-value">

                    ${escapeHTML(
                        registration.payerEmail ||
                        "—"
                    )}

                </span>

            </div>



            <div class="info-item">

                <span class="info-label">

                    Phone

                </span>


                <span class="info-value">

                    ${escapeHTML(
                        registration.payerPhone ||
                        "—"
                    )}

                </span>

            </div>



            <div class="info-item">

                <span class="info-label">

                    Registered

                </span>


                <span class="info-value">

                    ${escapeHTML(
                        formatDate(
                            registration.createdAt
                        )
                    )}

                </span>

            </div>


        </div>



        <!-- ================================================
             PARTICIPANTS
             ================================================ -->

        <div class="participants-section">

            <h3>

                Participants

            </h3>


            ${participantsHTML}

        </div>



        <!-- ================================================
             ACTIONS
             ================================================ -->

        <div class="registration-actions">


            <button

                class="view-button"

                data-action="view"

                type="button"

            >

                View Full Details

            </button>



            <button

                class="verify-button"

                data-action="verify"

                type="button"

            >

                VERIFY REGISTRATION

            </button>


        </div>

    `;


    // ========================================================
    // VIEW FULL DETAILS BUTTON
    // ========================================================

    const viewButton =
        card.querySelector(
            '[data-action="view"]'
        );


    viewButton.addEventListener(

        "click",

        () => {

            showDetails(
                registration
            );

        }

    );


    // ========================================================
    // VERIFY BUTTON
    // ========================================================

    const verifyButton =
        card.querySelector(
            '[data-action="verify"]'
        );


    verifyButton.addEventListener(

        "click",

        () => {

            verifyRegistration(

                registration.registrationId,

                card

            );

        }

    );


    // ========================================================
    // RETURN CARD
    // ========================================================

    return card;

}
// ============================================================
// MODULE 5
// SHOW FULL REGISTRATION DETAILS
// ============================================================


function showDetails(
    registration
) {

    // ========================================================
    // PARTICIPANTS
    // ========================================================

    const participants =

        Array.isArray(
            registration.participants
        )

            ? registration.participants

            : [];


    // ========================================================
    // PARTICIPANT DETAILS HTML
    // ========================================================

    let participantDetails =
        "";


    participants.forEach(

        (
            participant,
            index
        ) => {


            participantDetails += `

                <div class="participant-row">

                    <strong>

                        Participant ${index + 1}

                    </strong>


                    <span>

                        Name:

                        ${escapeHTML(
                            participant.name ||
                            "—"
                        )}

                    </span>


                    <span>

                        Email:

                        ${escapeHTML(
                            participant.email ||
                            "—"
                        )}

                    </span>


                    <span>

                        Phone:

                        ${escapeHTML(
                            participant.phone ||
                            "—"
                        )}

                    </span>


                    <span>

                        College:

                        ${escapeHTML(
                            participant.college ||
                            "—"
                        )}

                    </span>

                </div>

            `;

        }

    );


    // ========================================================
    // MODAL CONTENT
    // ========================================================

    modalContent.innerHTML = `


        <!-- ================================================
             REGISTRATION
             ================================================ -->

        <div class="modal-section">

            <h3>
                Registration
            </h3>


            <div class="detail-row">

                <div class="detail-label">
                    Registration ID
                </div>

                <div class="detail-value">

                    ${escapeHTML(
                        registration.registrationId
                    )}

                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Event
                </div>

                <div class="detail-value">

                    ${escapeHTML(
                        registration.eventName
                    )}

                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Participation
                </div>

                <div class="detail-value">

                    ${escapeHTML(
                        registration.participation ||
                        "—"
                    )}

                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Team Name
                </div>

                <div class="detail-value">

                    ${escapeHTML(
                        registration.teamName ||
                        "—"
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
                    Date
                </div>

                <div class="detail-value">

                    ${escapeHTML(
                        registration.eventDate ||
                        "—"
                    )}

                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Time
                </div>

                <div class="detail-value">

                    ${escapeHTML(
                        registration.eventTime ||
                        "—"
                    )}

                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Venue
                </div>

                <div class="detail-value">

                    ${escapeHTML(
                        registration.eventVenue ||
                        "—"
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
                    Name
                </div>

                <div class="detail-value">

                    ${escapeHTML(
                        registration.payerName ||
                        "—"
                    )}

                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Email
                </div>

                <div class="detail-value">

                    ${escapeHTML(
                        registration.payerEmail ||
                        "—"
                    )}

                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Phone
                </div>

                <div class="detail-value">

                    ${escapeHTML(
                        registration.payerPhone ||
                        "—"
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
                participantDetails ||
                `<p>No participant details available.</p>`
            }

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
                    Amount
                </div>

                <div class="detail-value">

                    ₹${escapeHTML(
                        registration.amount ||
                        "0"
                    )}

                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Payment Status
                </div>

                <div class="detail-value">

                    ${escapeHTML(
                        registration.paymentStatus ||
                        "—"
                    )}

                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Razorpay Order ID
                </div>

                <div class="detail-value">

                    ${escapeHTML(
                        registration.razorpayOrderId ||
                        "—"
                    )}

                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Razorpay Payment ID
                </div>

                <div class="detail-value">

                    ${escapeHTML(
                        registration.razorpayPaymentId ||
                        "—"
                    )}

                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Registered At
                </div>

                <div class="detail-value">

                    ${escapeHTML(
                        formatDate(
                            registration.createdAt
                        )
                    )}

                </div>

            </div>

        </div>



        <!-- ================================================
             VERIFICATION
             ================================================ -->

        <div class="modal-section">

            <h3>
                Verification
            </h3>


            <div class="detail-row">

                <div class="detail-label">
                    Verification Status
                </div>

                <div class="detail-value">

                    ${escapeHTML(
                        registration.verificationStatus ||
                        "PENDING"
                    )}

                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Verified By
                </div>

                <div class="detail-value">

                    ${escapeHTML(
                        registration.verifiedBy ||
                        "—"
                    )}

                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Verified At
                </div>

                <div class="detail-value">

                    ${escapeHTML(
                        formatDate(
                            registration.verifiedAt
                        )
                    )}

                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Acknowledgement Email
                </div>

                <div class="detail-value">

                    ${
                        registration.acknowledgementSent
                            ? "Sent ✓"
                            : "Not Sent"
                    }

                </div>

            </div>


            <div class="detail-row">

                <div class="detail-label">
                    Email Sent At
                </div>

                <div class="detail-value">

                    ${escapeHTML(
                        formatDate(
                            registration.acknowledgementSentAt
                        )
                    )}

                </div>

            </div>

        </div>

    `;


    // ========================================================
    // OPEN MODAL
    // ========================================================

    detailsModal.classList.remove(
        "hidden"
    );

}
// ============================================================
// MODULE 6
// VERIFY REGISTRATION + ACKNOWLEDGEMENT EMAIL
// ============================================================


// ============================================================
// VERIFY REGISTRATION
// ============================================================
//
// Flow:
//
// Admin clicks VERIFY REGISTRATION
//          ↓
// Backend verifies registration
//          ↓
// Backend sends acknowledgement email
//          ↓
// Dashboard receives acknowledgementSent
//
// If email succeeds:
//
// acknowledgementSent = true
//
// If email fails:
//
// acknowledgementSent = false
//
// IMPORTANT:
// Even if the email fails, the registration remains VERIFIED.
// ============================================================

async function verifyRegistration(

    registrationId,

    card

) {

    // ========================================================
    // CONFIRMATION
    // ========================================================

    const confirmed =

        window.confirm(

            "Are you sure you want to verify this registration?\n\n" +

            "An acknowledgement email will be sent to the participant."

        );


    if (!confirmed) {

        return;

    }


    // ========================================================
    // FIND VERIFY BUTTON
    // ========================================================

    const verifyButton =

        card.querySelector(

            '[data-action="verify"]'

        );


    // ========================================================
    // DISABLE BUTTON
    // ========================================================

    if (verifyButton) {

        verifyButton.disabled =
            true;

        verifyButton.textContent =
            "VERIFYING...";

    }


    try {

        // ====================================================
        // SEND VERIFY REQUEST
        // ====================================================

        const response =

            await fetch(

                `${BACKEND_URL}/api/admin/registrations/${encodeURIComponent(
                    registrationId
                )}/verify`,

                {

                    method:
                        "POST",

                    credentials:
                        "include"

                }

            );


        // ====================================================
        // SESSION EXPIRED
        // ====================================================

        if (

            response.status ===
            401

        ) {

            window.location.href =
                "admin.html";

            return;

        }


        // ====================================================
        // READ SERVER RESPONSE
        // ====================================================

        const data =
            await response.json();


        console.log(
            "Verification response:",
            data
        );


        // ====================================================
        // SERVER ERROR
        // ====================================================

        if (

            !response.ok ||

            !data.success

        ) {

            alert(

                data.message ||

                "Unable to verify registration."

            );


            if (verifyButton) {

                verifyButton.disabled =
                    false;

                verifyButton.textContent =
                    "VERIFY REGISTRATION";

            }


            return;

        }


        // ====================================================
        // EMAIL SUCCESS
        // ====================================================

        if (

            data.acknowledgementSent ===
            true

        ) {

            alert(

                "Registration verified successfully!\n\n" +

                "Acknowledgement email has been sent to:\n" +

                (
                    data.email ||
                    "the participant"
                )

            );

        }


        // ====================================================
        // REGISTRATION VERIFIED BUT EMAIL FAILED
        // ====================================================

        else {

            alert(

                "Registration verified successfully.\n\n" +

                "However, the acknowledgement email could not be sent.\n\n" +

                "The registration remains VERIFIED."

            );

        }


        // ====================================================
        // REMOVE CARD
        // ====================================================
        //
        // The dashboard displays only PENDING registrations.
        //
        // Once verified, this registration should disappear
        // from the pending list.
        //

        card.remove();


        // ====================================================
        // UPDATE PENDING COUNT
        // ====================================================

        const currentCount =

            Number(
                pendingCount.textContent
            ) || 0;


        const newCount =

            Math.max(

                0,

                currentCount - 1

            );


        pendingCount.textContent =
            newCount;


        // ====================================================
        // UPDATE MESSAGE
        // ====================================================

        if (
            newCount === 0
        ) {

            dashboardMessage.textContent =
                "No pending registrations.";


            registrationsContainer.innerHTML = `

                <div class="empty-state">

                    <div class="empty-icon">
                        ✓
                    </div>

                    <h3>
                        All registrations are verified
                    </h3>

                    <p>
                        There are currently no registrations
                        waiting for manual verification.
                    </p>

                </div>

            `;

        }

        else {

            dashboardMessage.textContent =

                `${newCount} registration(s) awaiting verification.`;

        }

    }


    catch (error) {

        // ====================================================
        // NETWORK / SERVER CONNECTION ERROR
        // ====================================================

        console.error(

            "Verification error:",

            error

        );


        alert(

            "Unable to connect to the backend server.\n\n" +

            "Please make sure server.js is running."

        );


        // ====================================================
        // RESTORE BUTTON
        // ====================================================

        if (verifyButton) {

            verifyButton.disabled =
                false;

            verifyButton.textContent =
                "VERIFY REGISTRATION";

        }

    }

}
// ============================================================
// MODULE 7
// REFRESH + LOGOUT + MODAL + INITIALIZATION
// ============================================================


// ============================================================
// REFRESH BUTTON
// ============================================================

refreshButton.addEventListener(

    "click",

    async () => {

        refreshButton.disabled =
            true;

        refreshButton.textContent =
            "↻ Refreshing...";


        try {

            await loadRegistrations();

        }

        finally {

            refreshButton.disabled =
                false;

            refreshButton.textContent =
                "↻ Refresh";

        }

    }

);


// ============================================================
// LOGOUT
// ============================================================

logoutButton.addEventListener(

    "click",

    async () => {

        const confirmed =

            window.confirm(

                "Are you sure you want to logout?"

            );


        if (!confirmed) {

            return;

        }


        logoutButton.disabled =
            true;

        logoutButton.textContent =
            "Logging out...";


        try {

            const response =

                await fetch(

                    `${BACKEND_URL}/api/admin/logout`,

                    {

                        method:
                            "POST",

                        credentials:
                            "include"

                    }

                );


            // ==================================================
            // EVEN IF SERVER RETURNS AN ERROR,
            // RETURN TO LOGIN PAGE
            // ==================================================

            if (
                response.ok
            ) {

                console.log(
                    "Admin logout successful."
                );

            }

            else {

                console.warn(
                    "Logout request returned:",
                    response.status
                );

            }

        }


        catch (error) {

            console.error(
                "Logout error:",
                error
            );

        }


        finally {

            window.location.href =
                "admin.html";

        }

    }

);


// ============================================================
// CLOSE MODAL
// ============================================================

closeModal.addEventListener(

    "click",

    () => {

        detailsModal.classList.add(
            "hidden"
        );

    }

);


// ============================================================
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ============================================================

detailsModal.addEventListener(

    "click",

    (event) => {

        if (
            event.target ===
            detailsModal
        ) {

            detailsModal.classList.add(
                "hidden"
            );

        }

    }

);


// ============================================================
// CLOSE MODAL WITH ESCAPE KEY
// ============================================================

document.addEventListener(

    "keydown",

    (event) => {

        if (
            event.key ===
            "Escape"
        ) {

            detailsModal.classList.add(
                "hidden"
            );

        }

    }

);


// ============================================================
// INITIALIZE DASHBOARD
// ============================================================

async function initializeDashboard() {

    // ========================================================
    // CHECK ADMIN LOGIN
    // ========================================================

    const loggedIn =
        await checkAdminSession();


    if (!loggedIn) {

        return;

    }


    // ========================================================
    // LOAD PENDING REGISTRATIONS
    // ========================================================

    await loadRegistrations();

}


// ============================================================
// START DASHBOARD
// ============================================================

initializeDashboard();