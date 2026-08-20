// ============================================================
// SPARK 2026 — ADMIN DASHBOARD
// ============================================================

(() => {

    "use strict";


    // ============================================================
    // BACKEND URL
    // ============================================================

    const BACKEND_URL = "";


    // ============================================================
    // ELEMENT HELPER
    // ============================================================

    const $ = (id) =>
        document.getElementById(id);


    // ============================================================
    // DOM ELEMENTS
    // ============================================================

    const registrationsContainer =
        $("registrationsContainer");

    const pendingCount =
        $("pendingCount");

    const dashboardMessage =
        $("dashboardMessage");

    const refreshButton =
        $("refreshButton");

    const logoutButton =
        $("logoutButton");

    const adminUsername =
        $("adminUsername");

    const detailsModal =
        $("detailsModal");

    const modalContent =
        $("modalContent");

    const closeModal =
        $("closeModal");


    // ============================================================
    // NEW — TRANSACTION SEARCH ELEMENTS
    // ============================================================

    const transactionSearchInput =
        $("transactionSearchInput");

    const transactionSearchButton =
        $("transactionSearchButton");

    const exportExcelButton =
        $("exportExcelButton");


    // ============================================================
    // ESCAPE HTML
    // ============================================================

    function escapeHTML(value) {

        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    // ============================================================
    // FORMAT DATE
    // ============================================================

    function formatDate(value) {

        if (!value) {

            return "—";

        }


        try {

            return new Date(value).toLocaleString(
                "en-IN",
                {
                    dateStyle: "medium",
                    timeStyle: "short"
                }
            );

        }

        catch (error) {

            return String(value);

        }

    }


    // ============================================================
    // GET UTR / TRANSACTION ID
    // ============================================================

    function getUTR(registration) {

        return (
            registration?.utr ||
            registration?.transactionId ||
            registration?.paymentUtr ||
            "—"
        );

    }


    // ============================================================
    // CHECK ADMIN SESSION
    // ============================================================

    async function checkAdminSession() {

        try {

            const response =
                await fetch(
                    `${BACKEND_URL}/api/admin/session`,
                    {
                        method: "GET",

                        credentials: "include"
                    }
                );


            // ----------------------------------------------------
            // NOT LOGGED IN
            // ----------------------------------------------------

            if (response.status === 401) {

                window.location.href =
                    "admin.html";

                return false;

            }


            // ----------------------------------------------------
            // API NOT FOUND
            // ----------------------------------------------------

            if (response.status === 404) {

                console.warn(
                    "Admin session API not found."
                );

                adminUsername.textContent =
                    "Administrator";

                return true;

            }


            const data =
                await response.json();


            // ----------------------------------------------------
            // SESSION FAILED
            // ----------------------------------------------------

            if (!data.success) {

                window.location.href =
                    "admin.html";

                return false;

            }


            // ----------------------------------------------------
            // SHOW ADMIN USERNAME
            // ----------------------------------------------------

            adminUsername.textContent =
                data.username ||
                data.adminUsername ||
                "Administrator";


            return true;

        }

        catch (error) {

            console.error(
                "Admin session error:",
                error
            );


            dashboardMessage.textContent =
                "Unable to connect to the server.";


            dashboardMessage.style.background =
                "#fff4f4";

            dashboardMessage.style.borderColor =
                "#f0c4c4";

            dashboardMessage.style.color =
                "#b42323";


            return false;

        }

    }


    // ============================================================
    // LOAD REGISTRATIONS
    // ============================================================

    async function loadRegistrations() {

        dashboardMessage.textContent =
            "Loading registrations...";


        dashboardMessage.style.background =
            "";

        dashboardMessage.style.borderColor =
            "";

        dashboardMessage.style.color =
            "";


        registrationsContainer.innerHTML =
            "";


        try {

            const response =
                await fetch(
                    `${BACKEND_URL}/api/admin/pending`,
                    {
                        method: "GET",

                        credentials: "include"
                    }
                );


            // ----------------------------------------------------
            // SESSION EXPIRED
            // ----------------------------------------------------

            if (response.status === 401) {

                window.location.href =
                    "admin.html";

                return;

            }


            const data =
                await response.json();


            console.log(
                "Pending registrations:",
                data
            );


            // ----------------------------------------------------
            // API ERROR
            // ----------------------------------------------------

            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to load registrations."
                );

            }


            const registrations =
                Array.isArray(
                    data.registrations
                )
                    ? data.registrations
                    : [];


            // ----------------------------------------------------
            // UPDATE COUNT
            // ----------------------------------------------------

            pendingCount.textContent =
                registrations.length;


            // ----------------------------------------------------
            // NO REGISTRATIONS
            // ----------------------------------------------------

            if (
                registrations.length === 0
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
                            waiting for payment verification.
                        </p>

                    </div>

                `;

                return;

            }


            // ----------------------------------------------------
            // STATUS MESSAGE
            // ----------------------------------------------------

            dashboardMessage.textContent =
                `${registrations.length} registration(s) awaiting payment verification.`;


            // ----------------------------------------------------
            // CREATE CARDS
            // ----------------------------------------------------

            registrations.forEach(
                registration => {

                    const card =
                        createRegistrationCard(
                            registration
                        );


                    registrationsContainer.appendChild(
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
                error.message ||
                "Unable to load registrations.";


            dashboardMessage.style.background =
                "#fff4f4";

            dashboardMessage.style.borderColor =
                "#f0c4c4";

            dashboardMessage.style.color =
                "#b42323";

        }

    }


    // ============================================================
    // PARTICIPANT HTML
    // ============================================================

    function participantHTML(
        participant,
        label
    ) {

        if (!participant) {

            return "";

        }


        return `

            <div class="participant-item">

                <strong>
                    ${escapeHTML(label)}
                </strong>


                <span>
                    ${escapeHTML(
                        participant.fullName ||
                        participant.name ||
                        "—"
                    )}
                </span>


                <span>
                    ${escapeHTML(
                        participant.college ||
                        "—"
                    )}
                </span>


                <span>
                    ${escapeHTML(
                        participant.department ||
                        "—"
                    )}
                </span>


                <span>
                    ${escapeHTML(
                        participant.year ||
                        "—"
                    )}
                </span>


                <span>
                    ${escapeHTML(
                        participant.phone ||
                        "—"
                    )}
                </span>


                <span>
                    ${escapeHTML(
                        participant.email ||
                        "—"
                    )}
                </span>

            </div>

        `;

    }


    // ============================================================
    // CREATE REGISTRATION CARD
    // ============================================================

    function createRegistrationCard(
        registration
    ) {

        const card =
            document.createElement("article");


        card.className =
            "registration-card";


        // --------------------------------------------------------
        // UTR
        // --------------------------------------------------------

        const utr =
            getUTR(registration);


        // --------------------------------------------------------
        // PARTICIPANTS
        // --------------------------------------------------------

        const participants =

            participantHTML(
                registration.teamLeader,
                "Team Leader"
            )

            +

            participantHTML(
                registration.teamMember,
                "Team Member"
            );


        // --------------------------------------------------------
        // CARD HTML
        // --------------------------------------------------------

        card.innerHTML = `

            <!-- ================================================
                 CARD HEADER
                 ================================================ -->

            <div class="registration-header">

                <div>

                    <div class="registration-id">

                        ${escapeHTML(
                            registration.registrationId ||
                            "—"
                        )}

                    </div>


                    <div class="event-name">

                        ${escapeHTML(
                            registration.eventName ||
                            "—"
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


                <!-- PARTICIPATION -->

                <div class="info-item">

                    <span class="info-label">
                        Participation
                    </span>

                    <span class="info-value">

                        ${escapeHTML(
                            registration.participation ||
                            registration.teamSize ||
                            "—"
                        )}

                    </span>

                </div>


                <!-- TEAM NAME -->

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


                <!-- AMOUNT -->

                <div class="info-item">

                    <span class="info-label">
                        Amount
                    </span>

                    <span class="info-value">

                        ₹${escapeHTML(
                            registration.amount ||
                            0
                        )}

                    </span>

                </div>


                <!-- UPI -->

                <div class="info-item">

                    <span class="info-label">
                        UPI
                    </span>

                    <span class="info-value upi-value">

                        ${escapeHTML(
                            registration.upiId ||
                            "9940464883@ptaxis"
                        )}

                    </span>

                </div>


                <!-- PAYER -->

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


                <!-- UTR -->

                <div class="info-item">

                    <span class="info-label">
                        UTR
                    </span>

                    <span class="info-value utr-value">

                        ${escapeHTML(
                            utr
                        )}

                    </span>

                </div>


                <!-- PAYMENT STATUS -->

                <div class="info-item">

                    <span class="info-label">
                        Payment
                    </span>

                    <span class="info-value">

                        ${escapeHTML(
                            registration.paymentStatus ||
                            "SUBMITTED"
                        )}

                    </span>

                </div>


                <!-- REGISTERED -->

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


                ${
                    participants ||

                    `
                        <p>
                            No participant details available.
                        </p>
                    `
                }

            </div>


            <!-- ================================================
                 ACTION BUTTONS
                 ================================================ -->

            <div class="registration-actions">


                <button
                    type="button"
                    class="view-button"
                    data-action="view"
                >
                    View Full Details
                </button>


                <button
                    type="button"
                    class="verify-button"
                    data-action="verify"
                >
                    VERIFY PAYMENT
                </button>


                <button
                    type="button"
                    class="reject-button"
                    data-action="reject"
                >
                    REJECT
                </button>


            </div>

        `;


        // ========================================================
        // VIEW DETAILS
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
        // VERIFY
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
        // REJECT
        // ========================================================

        const rejectButton =
            card.querySelector(
                '[data-action="reject"]'
            );


        rejectButton.addEventListener(
            "click",
            () => {

                rejectRegistration(
                    registration.registrationId,
                    card
                );

            }
        );


        return card;

    }


    // ============================================================
    // SHOW FULL DETAILS
    // ============================================================

    function showDetails(
        registration
    ) {

        const utr =
            getUTR(registration);


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
                            registration.registrationId ||
                            "—"
                        )}
                    </div>

                </div>


                <div class="detail-row">

                    <div class="detail-label">
                        Event
                    </div>

                    <div class="detail-value">
                        ${escapeHTML(
                            registration.eventName ||
                            "—"
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
                            registration.teamSize ||
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
                        Event Date
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
                        Event Time
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
                        Payer Name
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
                        Payer Email
                    </div>

                    <div class="detail-value">
                        ${escapeHTML(
                            registration.payerEmail ||
                            registration.teamLeader?.email ||
                            "—"
                        )}
                    </div>

                </div>


                <div class="detail-row">

                    <div class="detail-label">
                        Payer Phone
                    </div>

                    <div class="detail-value">
                        ${escapeHTML(
                            registration.payerPhone ||
                            registration.teamLeader?.phone ||
                            "—"
                        )}
                    </div>

                </div>

            </div>


            <!-- ================================================
                 PAYMENT INFORMATION
                 ================================================ -->

            <div class="modal-section">

                <h3>
                    Payment Verification
                </h3>


                <!-- AMOUNT -->

                <div class="detail-row">

                    <div class="detail-label">
                        Amount
                    </div>

                    <div class="detail-value">
                        ₹${escapeHTML(
                            registration.amount ||
                            0
                        )}
                    </div>

                </div>


                <!-- UPI -->

                <div class="detail-row">

                    <div class="detail-label">
                        UPI ID
                    </div>

                    <div class="detail-value">
                        ${escapeHTML(
                            registration.upiId ||
                            "9940464883@ptaxis"
                        )}
                    </div>

                </div>


                <!-- UTR -->

                <div
                    class="detail-row"
                    style="
                        background:#f0f7ff;
                        padding:14px;
                        border-radius:10px;
                        margin-top:10px;
                    "
                >

                    <div
                        class="detail-label"
                        style="font-weight:800;"
                    >
                        UTR / Transaction ID
                    </div>


                    <div
                        class="detail-value"
                        style="
                            color:#075fc3;
                            font-family:monospace;
                            font-weight:800;
                            word-break:break-all;
                        "
                    >
                        ${escapeHTML(
                            utr
                        )}
                    </div>

                </div>


                <!-- PAYMENT STATUS -->

                <div class="detail-row">

                    <div class="detail-label">
                        Payment Status
                    </div>

                    <div class="detail-value">
                        ${escapeHTML(
                            registration.paymentStatus ||
                            "SUBMITTED"
                        )}
                    </div>

                </div>


                <!-- VERIFICATION STATUS -->

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


                <!-- RAZORPAY ORDER -->

                ${
                    registration.razorpayOrderId
                        ? `

                            <div class="detail-row">

                                <div class="detail-label">
                                    Razorpay Order ID
                                </div>

                                <div class="detail-value">
                                    ${escapeHTML(
                                        registration.razorpayOrderId
                                    )}
                                </div>

                            </div>

                        `
                        : ""
                }


                <!-- RAZORPAY PAYMENT -->

                ${
                    registration.razorpayPaymentId
                        ? `

                            <div class="detail-row">

                                <div class="detail-label">
                                    Razorpay Payment ID
                                </div>

                                <div class="detail-value">
                                    ${escapeHTML(
                                        registration.razorpayPaymentId
                                    )}
                                </div>

                            </div>

                        `
                        : ""
                }

            </div>


            <!-- ================================================
                 PARTICIPANTS
                 ================================================ -->

            <div class="modal-section">

                <h3>
                    Participants
                </h3>


                ${
                    participantHTML(
                        registration.teamLeader,
                        "Team Leader"
                    )
                }


                ${
                    participantHTML(
                        registration.teamMember,
                        "Team Member"
                    )
                }


                ${
                    !registration.teamLeader &&
                    !registration.teamMember

                        ? `
                            <p>
                                No participant details available.
                            </p>
                        `

                        : ""
                }

            </div>

        `;


        // --------------------------------------------------------
        // OPEN MODAL
        // --------------------------------------------------------

        detailsModal.classList.remove(
            "hidden"
        );


        document.body.style.overflow =
            "hidden";

    }


    // ============================================================
    // CLOSE MODAL
    // ============================================================

    function closeDetailsModal() {

        detailsModal.classList.add(
            "hidden"
        );


        document.body.style.overflow =
            "";

    }


    // ============================================================
    // VERIFY PAYMENT
    // ============================================================

    async function verifyRegistration(
        registrationId,
        card
    ) {

        const confirmed =
            window.confirm(
                "Have you checked the UTR against the bank statement and confirmed that the payment is valid?"
            );


        if (!confirmed) {

            return;

        }


        const button =
            card.querySelector(
                '[data-action="verify"]'
            );


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "VERIFYING...";

        }


        try {

            const response =
                await fetch(
                    `${BACKEND_URL}/api/admin/registration/${encodeURIComponent(registrationId)}/verify`,
                    {
                        method: "PATCH",

                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        }
                    }
                );


            if (response.status === 401) {

                window.location.href =
                    "admin.html";

                return;

            }


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to verify payment."
                );

            }


            window.alert(
                "Payment verified successfully."
            );


            closeDetailsModal();


            await loadRegistrations();

        }

        catch (error) {

            console.error(
                "Verification error:",
                error
            );


            window.alert(
                error.message ||
                "Unable to verify payment."
            );


            if (button) {

                button.disabled =
                    false;

                button.textContent =
                    "VERIFY PAYMENT";

            }

        }

    }


    // ============================================================
    // REJECT PAYMENT
    // ============================================================

    async function rejectRegistration(
        registrationId,
        card
    ) {

        const reason =
            window.prompt(
                "Enter the reason for rejecting this payment:"
            );


        if (reason === null) {

            return;

        }


        const trimmedReason =
            reason.trim();


        if (!trimmedReason) {

            window.alert(
                "Please enter a rejection reason."
            );

            return;

        }


        const button =
            card.querySelector(
                '[data-action="reject"]'
            );


        if (button) {

            button.disabled =
                true;

            button.textContent =
                "REJECTING...";

        }


        try {

            const response =
                await fetch(
                    `${BACKEND_URL}/api/admin/registration/${encodeURIComponent(registrationId)}/reject`,
                    {
                        method: "PATCH",

                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({

                                reason:
                                    trimmedReason

                            })
                    }
                );


            if (response.status === 401) {

                window.location.href =
                    "admin.html";

                return;

            }


            const data =
                await response.json();


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to reject payment."
                );

            }


            window.alert(
                "Payment rejected successfully."
            );


            closeDetailsModal();


            await loadRegistrations();

        }

        catch (error) {

            console.error(
                "Rejection error:",
                error
            );


            window.alert(
                error.message ||
                "Unable to reject payment."
            );


            if (button) {

                button.disabled =
                    false;

                button.textContent =
                    "REJECT";

            }

        }

    }


    // ============================================================
    // SEARCH BY TRANSACTION ID
    // ============================================================

    async function searchTransaction() {

        if (!transactionSearchInput) {

            return;

        }


        const transactionId =
            transactionSearchInput.value.trim();


        // --------------------------------------------------------
        // VALIDATION
        // --------------------------------------------------------

        if (!transactionId) {

            window.alert(
                "Please enter the Transaction ID."
            );

            transactionSearchInput.focus();

            return;

        }


        if (
            !/^\d{16}$/.test(
                transactionId
            )
        ) {

            window.alert(
                "Please enter a valid 16-digit Transaction ID."
            );

            transactionSearchInput.focus();

            return;

        }


        if (transactionSearchButton) {

            transactionSearchButton.disabled =
                true;

            transactionSearchButton.textContent =
                "SEARCHING...";

        }


        dashboardMessage.textContent =
            "Searching Transaction ID...";


        try {

            const response =
                await fetch(
                    `${BACKEND_URL}/api/admin/search-transaction?transactionId=${encodeURIComponent(transactionId)}`,
                    {
                        method: "GET",

                        credentials: "include"
                    }
                );


            // ----------------------------------------------------
            // SESSION EXPIRED
            // ----------------------------------------------------

            if (
                response.status === 401
            ) {

                window.location.href =
                    "admin.html";

                return;

            }


            const data =
                await response.json();


            // ----------------------------------------------------
            // NOT FOUND
            // ----------------------------------------------------

            if (
                response.status === 404
            ) {

                dashboardMessage.textContent =
                    "No registration found for this Transaction ID.";


                dashboardMessage.style.background =
                    "#fff4f4";

                dashboardMessage.style.borderColor =
                    "#f0c4c4";

                dashboardMessage.style.color =
                    "#b42323";


                window.alert(
                    "No registration found for this Transaction ID."
                );


                return;

            }


            if (
                !response.ok ||
                !data.success
            ) {

                throw new Error(
                    data.message ||
                    "Unable to search Transaction ID."
                );

            }


            // ----------------------------------------------------
            // SHOW RESULT
            // ----------------------------------------------------

            dashboardMessage.textContent =
                "Transaction found successfully.";


            dashboardMessage.style.background =
                "#eefbf3";

            dashboardMessage.style.borderColor =
                "#b7e4c7";

            dashboardMessage.style.color =
                "#16734a";


            registrationsContainer.innerHTML =
                "";


            const registration =
                data.registration;


            const card =
                createSearchResultCard(
                    registration
                );


            registrationsContainer.appendChild(
                card
            );


        }

        catch (error) {

            console.error(
                "Transaction search error:",
                error
            );


            dashboardMessage.textContent =
                error.message ||
                "Unable to search Transaction ID.";


            dashboardMessage.style.background =
                "#fff4f4";

            dashboardMessage.style.borderColor =
                "#f0c4c4";

            dashboardMessage.style.color =
                "#b42323";


        }

        finally {

            if (transactionSearchButton) {

                transactionSearchButton.disabled =
                    false;

                transactionSearchButton.textContent =
                    "🔎 Search";

            }

        }

    }


    // ============================================================
    // CREATE SEARCH RESULT CARD
    // ============================================================

    function createSearchResultCard(
        registration
    ) {

        const card =
            document.createElement("article");


        card.className =
            "registration-card";


        const utr =
            getUTR(registration);


        const verificationStatus =
            registration.verificationStatus ||
            "PENDING";


        let statusClass =
            "pending-badge";


        if (
            verificationStatus ===
            "VERIFIED"
        ) {

            statusClass =
                "verified-badge";

        }

        else if (
            verificationStatus ===
            "REJECTED"
        ) {

            statusClass =
                "rejected-badge";

        }


        const participants =

            participantHTML(
                registration.teamLeader,
                "Team Leader"
            )

            +

            participantHTML(
                registration.teamMember,
                "Team Member"
            );


        card.innerHTML = `

            <div class="registration-header">

                <div>

                    <div class="registration-id">

                        ${escapeHTML(
                            registration.registrationId ||
                            "—"
                        )}

                    </div>


                    <div class="event-name">

                        ${escapeHTML(
                            registration.eventName ||
                            "—"
                        )}

                    </div>

                </div>


                <span class="${statusClass}">

                    ${escapeHTML(
                        verificationStatus
                    )}

                </span>

            </div>


            <div class="registration-info">


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
                        Amount
                    </span>

                    <span class="info-value">

                        ₹${escapeHTML(
                            registration.amount ||
                            0
                        )}

                    </span>

                </div>


                <div class="info-item">

                    <span class="info-label">
                        Transaction ID
                    </span>

                    <span class="info-value utr-value">

                        ${escapeHTML(
                            utr
                        )}

                    </span>

                </div>


                <div class="info-item">

                    <span class="info-label">
                        Payment Status
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


            <div class="participants-section">

                <h3>
                    Participants
                </h3>

                ${
                    participants ||

                    `
                        <p>
                            No participant details available.
                        </p>
                    `
                }

            </div>


            <div class="registration-actions">

                <button
                    type="button"
                    class="view-button"
                    data-action="view-search"
                >
                    View Full Details
                </button>

            </div>

        `;


        const viewButton =
            card.querySelector(
                '[data-action="view-search"]'
            );


        viewButton.addEventListener(
            "click",
            () => {

                showDetails(
                    registration
                );

            }
        );


        return card;

    }


    // ============================================================
    // CLEAR SEARCH
    // ============================================================

    function clearTransactionSearch() {

        if (
            transactionSearchInput
        ) {

            transactionSearchInput.value =
                "";

        }


        loadRegistrations();

    }


    // ============================================================
    // EXPORT ALL REGISTRATIONS TO EXCEL
    // ============================================================

    async function exportRegistrations() {

        if (exportExcelButton) {

            exportExcelButton.disabled =
                true;

            exportExcelButton.textContent =
                "📥 Exporting...";

        }


        dashboardMessage.textContent =
            "Preparing Excel file...";


        try {

            const response =
                await fetch(
                    `${BACKEND_URL}/api/admin/export`,
                    {
                        method: "GET",

                        credentials: "include"
                    }
                );


            // ----------------------------------------------------
            // SESSION EXPIRED
            // ----------------------------------------------------

            if (
                response.status === 401
            ) {

                window.location.href =
                    "admin.html";

                return;

            }


            // ----------------------------------------------------
            // API ERROR
            // ----------------------------------------------------

            if (!response.ok) {

                let errorMessage =
                    "Unable to export registrations.";


                try {

                    const data =
                        await response.json();


                    errorMessage =
                        data.message ||
                        errorMessage;

                }

                catch (error) {

                    // Response was not JSON.

                }


                throw new Error(
                    errorMessage
                );

            }


            // ----------------------------------------------------
            // DOWNLOAD XLSX
            // ----------------------------------------------------

            const blob =
                await response.blob();


            const downloadURL =
                window.URL.createObjectURL(
                    blob
                );


            const link =
                document.createElement(
                    "a"
                );


            link.href =
                downloadURL;


            link.download =
                "SPARK2026_Registrations.xlsx";


            document.body.appendChild(
                link
            );


            link.click();


            link.remove();


            window.URL.revokeObjectURL(
                downloadURL
            );


            dashboardMessage.textContent =
                "Excel export completed successfully.";


            dashboardMessage.style.background =
                "#eefbf3";

            dashboardMessage.style.borderColor =
                "#b7e4c7";

            dashboardMessage.style.color =
                "#16734a";


        }

        catch (error) {

            console.error(
                "Excel export error:",
                error
            );


            dashboardMessage.textContent =
                error.message ||
                "Unable to export registrations.";


            dashboardMessage.style.background =
                "#fff4f4";

            dashboardMessage.style.borderColor =
                "#f0c4c4";

            dashboardMessage.style.color =
                "#b42323";


            window.alert(
                error.message ||
                "Unable to export registrations."
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

    async function logout() {

        try {

            await fetch(
                `${BACKEND_URL}/api/admin/logout`,
                {
                    method: "POST",

                    credentials: "include"
                }
            );

        }

        catch (error) {

            console.warn(
                "Logout request failed:",
                error
            );

        }


        window.location.href =
            "admin.html";

    }


    // ============================================================
    // KEYBOARD — ESC CLOSES MODAL
    // ============================================================

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key === "Escape" &&
                !detailsModal.classList.contains(
                    "hidden"
                )
            ) {

                closeDetailsModal();

            }

        }
    );


    // ============================================================
    // MODAL BACKGROUND CLICK
    // ============================================================

    detailsModal.addEventListener(
        "click",
        event => {

            if (
                event.target === detailsModal
            ) {

                closeDetailsModal();

            }

        }
    );


    // ============================================================
    // EVENT LISTENERS
    // ============================================================

    refreshButton.addEventListener(
        "click",
        loadRegistrations
    );


    logoutButton.addEventListener(
        "click",
        logout
    );


    closeModal.addEventListener(
        "click",
        closeDetailsModal
    );


    // ------------------------------------------------------------
    // TRANSACTION SEARCH
    // ------------------------------------------------------------

    if (
        transactionSearchButton
    ) {

        transactionSearchButton.addEventListener(
            "click",
            searchTransaction
        );

    }


    // ------------------------------------------------------------
    // TRANSACTION SEARCH — ENTER KEY
    // ------------------------------------------------------------

    if (
        transactionSearchInput
    ) {

        transactionSearchInput.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    event.preventDefault();

                    searchTransaction();

                }

            }
        );

    }


    // ------------------------------------------------------------
    // EXPORT EXCEL
    // ------------------------------------------------------------

    if (
        exportExcelButton
    ) {

        exportExcelButton.addEventListener(
            "click",
            exportRegistrations
        );

    }


    // ------------------------------------------------------------
    // DOUBLE-CLICK SEARCH INPUT TO CLEAR
    // ------------------------------------------------------------

    if (
        transactionSearchInput
    ) {

        transactionSearchInput.addEventListener(
            "dblclick",
            clearTransactionSearch
        );

    }


    // ============================================================
    // INITIALIZATION
    // ============================================================

    async function init() {

        const loggedIn =
            await checkAdminSession();


        if (!loggedIn) {

            return;

        }


        await loadRegistrations();

    }


    // ============================================================
    // START
    // ============================================================

    if (
        document.readyState ===
        "loading"
    ) {

        document.addEventListener(
            "DOMContentLoaded",
            init
        );

    }

    else {

        init();

    }

})();