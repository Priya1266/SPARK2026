/* ============================================================
   SPARK 2026 — REGISTRATION JAVASCRIPT
   ============================================================

   FLOW:

   Event
      ↓
   Participation
      ↓
   Participant Details
      ↓
   Review
      ↓
   Payment
      ↓
   QR + UPI ID
      ↓
   Payer Name + 12 Digit UTR
      ↓
   Submit Payment Details
      ↓
   MongoDB
      ↓
   Registration Completed
      ↓
   Registration ID

   Admin later verifies payment
      ↓
   Acknowledgement email

   ============================================================ */


document.addEventListener("DOMContentLoaded", function () {

    /* ============================================================
       MODULE 1 — CONFIGURATION
       ============================================================ */

    const API_BASE_URL = "";

    const UPI_ID = "9940464883@ptaxis";

// ============================================================
// REGISTRATION CLOSURE
// ============================================================

const CLOSED_PARTICIPATION = {
    ideaforge: {
        internal: true,
        external: false
    },

    circuitclash: {
        internal: true
    },

    iqquest: {
        internal: true,
        external: false
    }
};
    /* ============================================================
       MODULE 2 — GET EVENT FROM URL
       ============================================================ */

    const params =
        new URLSearchParams(window.location.search);

    const selectedEventId =
        params.get("event");


    const registrationEvents = {
    ideaforge: {
        name: "iDeaForge",
        participation: "internal-external",
        participantCount: 2,
        internalFeePerPerson: 150,
        externalFeePerPerson: 250,
        internalTotalFee: 300,
        externalTotalFee: 500,
        internalDate: "24 September 2026",
        externalDate: "25 September 2026",
        time: "9:30 AM – 12:15 PM",
        venue: "Sathyabama Institute of Science and Technology"
    },

    circuitclash: {
        name: "Circuit Clash",
        participation: "internal",
        participantCount: 2,
        internalFeePerPerson: 150,
        internalTotalFee: 300,
        date: "24 September 2026",
        time: "1:00 PM – 3:15 PM",
        venue: "Sathyabama Institute of Science and Technology"
    },

    iqquest: {
        name: "iQuest",
        participation: "internal-external",
        participantCount: 2,
        internalFeePerPerson: 150,
        externalFeePerPerson: 250,
        internalTotalFee: 300,
        externalTotalFee: 500,
        internalDate: "24 September 2026",
        externalDate: "25 September 2026",
        time: "9:30 AM – 12:15 PM",
        venue: "Sathyabama Institute of Science and Technology"
    }
};

    /* ============================================================
       MODULE 4 — CHECK EVENT
       ============================================================ */

    const currentEvent =
        registrationEvents[selectedEventId];


    if (!currentEvent) {

        alert(
            "Invalid event. Please select an event first."
        );

        window.location.href =
            "index.html";

        return;

    }


    /* ============================================================
       MODULE 5 — ELEMENT REFERENCES
       ============================================================ */


    // ------------------------------------------------------------
    // EVENT HEADER
    // ------------------------------------------------------------

    const eventTitle =
        document.getElementById("eventTitle");

    const eventSubtitle =
        document.getElementById("eventSubtitle");

    const eventDate =
        document.getElementById("eventDate");

    const eventTime =
        document.getElementById("eventTime");

    const eventVenue =
        document.getElementById("eventVenue");

    const eventFee =
        document.getElementById("eventFee");


    // ------------------------------------------------------------
    // PARTICIPATION
    // ------------------------------------------------------------

    const participationSection =
        document.getElementById("participationSection");

    const participationCards =
        document.querySelectorAll(
            ".participation-card"
        );

    const participationMessage =
        document.getElementById(
            "participationMessage"
        );

    const continueParticipation =
        document.getElementById(
            "continueParticipation"
        );



    // ------------------------------------------------------------
    // PARTICIPANTS
    // ------------------------------------------------------------

    const participantSection =
        document.getElementById(
            "participantSection"
        );

    const participantForms =
        document.getElementById(
            "participantForms"
        );

    const selectedType =
        document.getElementById(
            "selectedType"
        );

    const selectedCount =
        document.getElementById(
            "selectedCount"
        );

    const selectedTotal =
        document.getElementById(
            "selectedTotal"
        );

    const backToParticipation =
        document.getElementById(
            "backToParticipation"
        );

    const continueToReview =
        document.getElementById(
            "continueToReview"
        );


    // ------------------------------------------------------------
    // TEAM NAME
    // ------------------------------------------------------------

    const teamNameBox =
        document.getElementById(
            "teamNameBox"
        );

    const teamNameInput =
        document.getElementById(
            "teamName"
        );

    const teamNameError =
        document.getElementById(
            "teamNameError"
        );


    // ------------------------------------------------------------
    // REVIEW
    // ------------------------------------------------------------

    const reviewSection =
        document.getElementById(
            "reviewSection"
        );

    const reviewEventName =
        document.getElementById(
            "reviewEventName"
        );

    const reviewEventDate =
        document.getElementById(
            "reviewEventDate"
        );

    const reviewEventTime =
        document.getElementById(
            "reviewEventTime"
        );

    const reviewEventVenue =
        document.getElementById(
            "reviewEventVenue"
        );

    const reviewTeamNameBox =
        document.getElementById(
            "reviewTeamNameBox"
        );

    const reviewTeamName =
        document.getElementById(
            "reviewTeamName"
        );

    const reviewParticipation =
        document.getElementById(
            "reviewParticipation"
        );

    const reviewParticipantCount =
        document.getElementById(
            "reviewParticipantCount"
        );

    const reviewFeePerParticipant =
        document.getElementById(
            "reviewFeePerParticipant"
        );

    const reviewTotalAmount =
        document.getElementById(
            "reviewTotalAmount"
        );

    const reviewGrandTotal =
        document.getElementById(
            "reviewGrandTotal"
        );

    const reviewTotalPeople =
        document.getElementById(
            "reviewTotalPeople"
        );

    const reviewParticipants =
        document.getElementById(
            "reviewParticipants"
        );

    const editDetails =
        document.getElementById(
            "editDetails"
        );

    const continueToPayment =
        document.getElementById(
            "continueToPayment"
        );


    // ------------------------------------------------------------
    // PAYMENT
    // ------------------------------------------------------------

    const paymentSection =
        document.getElementById(
            "paymentSection"
        );

    const paymentEventName =
        document.getElementById(
            "paymentEventName"
        );

    const paymentParticipation =
        document.getElementById(
            "paymentParticipation"
        );

    const paymentParticipantCount =
        document.getElementById(
            "paymentParticipantCount"
        );

    const paymentTeamRow =
        document.getElementById(
            "paymentTeamRow"
        );

    const paymentTeamName =
        document.getElementById(
            "paymentTeamName"
        );

    const paymentAmount =
        document.getElementById(
            "paymentAmount"
        );

    const paymentTotal =
        document.getElementById(
            "paymentTotal"
        );

    const paymentUpiId =
        document.getElementById(
            "paymentUpiId"
        );

    const payerName =
        document.getElementById(
            "payerName"
        );

    const payerNameError =
        document.getElementById(
            "payerNameError"
        );

    const utr =
        document.getElementById(
            "utr"
        );

    const utrError =
        document.getElementById(
            "utrError"
        );

    const backToReview =
        document.getElementById(
            "backToReview"
        );

    const completePayment =
        document.getElementById(
            "completePayment"
        );

    const paymentPendingMessage =
        document.getElementById(
            "paymentPendingMessage"
        );


    // ------------------------------------------------------------
    // SUCCESS
    // ------------------------------------------------------------

    const successSection =
        document.getElementById(
            "successSection"
        );

    const successRegistrationId =
        document.getElementById(
            "successRegistrationId"
        );

    const successEventName =
        document.getElementById(
            "successEventName"
        );

    const successParticipantCount =
        document.getElementById(
            "successParticipantCount"
        );

    const successTeamRow =
        document.getElementById(
            "successTeamRow"
        );

    const successTeamName =
        document.getElementById(
            "successTeamName"
        );

    const successAmount =
        document.getElementById(
            "successAmount"
        );

    const successPayerName =
        document.getElementById(
            "successPayerName"
        );

    const successUtr =
        document.getElementById(
            "successUtr"
        );


    /* ============================================================
       MODULE 6 — STATE
       ============================================================ */

let selectedParticipation = null;

let participantCount = 2;

let selectedFeePerPerson = 0;

let selectedTotalAmount = 0;

    let registrationData =
        null;


 /* ============================================================
   MODULE 7 — EVENT INFORMATION
   ============================================================ */

if (eventTitle) {

    eventTitle.textContent =
        currentEvent.name;
}


if (eventSubtitle) {

    eventSubtitle.textContent =
        "Complete your registration below";
}


if (eventDate) {

    if (
        currentEvent.participation ===
        "internal-external"
    ) {

        eventDate.textContent =
            "24 September 2026 (Internal) | 25 September 2026 (External)";

    } else {

        eventDate.textContent =
            currentEvent.date;
    }
}


if (eventTime) {

    eventTime.textContent =
        currentEvent.time;
}


if (eventVenue) {

    eventVenue.textContent =
        currentEvent.venue;
}


if (eventFee) {

    if (
        currentEvent.participation ===
        "internal-external"
    ) {

        eventFee.textContent =
            "Internal ₹150 / Participant | External ₹250 / Participant";

    } else {

        eventFee.textContent =
            "Internal ₹150 / Participant";
    }
}


if (paymentUpiId) {

    paymentUpiId.textContent =
        UPI_ID;
}

/* ============================================================
   MODULE 8 — PARTICIPATION UI
   ============================================================ */

function getClosedParticipationTypes() {

    return CLOSED_PARTICIPATION[
        selectedEventId
    ] || {};

}


function getAllowedParticipationTypes() {

    const closedTypes =
        getClosedParticipationTypes();

    let allowedTypes = [];

    if (
        currentEvent.participation ===
        "internal-external"
    ) {

        allowedTypes = [
            "internal",
            "external"
        ];

    } else {

        allowedTypes = [
            "internal"
        ];

    }

    return allowedTypes.filter(
        function (type) {

            return closedTypes[type] !== true;

        }
    );

}


function getSelectedFeePerPerson() {

    if (
        selectedParticipation ===
        "external"
    ) {

        return currentEvent.externalFeePerPerson;

    }

    return currentEvent.internalFeePerPerson;

}


function getSelectedDate() {

    if (
        selectedParticipation ===
        "external"
    ) {

        return currentEvent.externalDate;

    }

    return currentEvent.internalDate ||
        currentEvent.date;

}


function updateParticipationUI() {

    const allowedTypes =
        getAllowedParticipationTypes();

    const closedTypes =
        getClosedParticipationTypes();

    // Exactly 2 participants
    participantCount = 2;


    // --------------------------------------------------------
    // NO PARTICIPATION TYPE AVAILABLE
    // --------------------------------------------------------

    if (allowedTypes.length === 0) {

        selectedParticipation = null;

        selectedFeePerPerson = 0;

        selectedTotalAmount = 0;

        if (selectedType) {

            selectedType.textContent =
                "Registrations Closed";

        }

        if (selectedCount) {

            selectedCount.textContent =
                "—";

        }

        if (selectedTotal) {

            selectedTotal.textContent =
                "—";

        }

        if (participationMessage) {

            participationMessage.textContent =
                "Registrations are currently closed for this event.";

        }

        if (continueParticipation) {

            continueParticipation.disabled =
                true;

            continueParticipation.textContent =
                "Registrations Closed";

        }

        if (teamNameBox) {

            teamNameBox.hidden =
                true;

        }

    }

    else {

        // ----------------------------------------------------
        // SELECT FIRST AVAILABLE TYPE
        // ----------------------------------------------------

        if (
            !selectedParticipation ||
            !allowedTypes.includes(
                selectedParticipation
            )
        ) {

            selectedParticipation =
                allowedTypes[0];

        }


        // ----------------------------------------------------
        // CALCULATE FEE
        // ----------------------------------------------------

        selectedFeePerPerson =
            getSelectedFeePerPerson();

        selectedTotalAmount =
            selectedFeePerPerson *
            participantCount;


        // ----------------------------------------------------
        // TEAM NAME
        // ----------------------------------------------------

        if (teamNameBox) {

            teamNameBox.hidden =
                false;

        }


        // ----------------------------------------------------
        // SELECTED SUMMARY
        // ----------------------------------------------------

        if (selectedType) {

            selectedType.textContent =
                selectedParticipation === "external"
                    ? "External Team"
                    : "Internal Team";

        }

        if (selectedCount) {

            selectedCount.textContent =
                "2";

        }

        if (selectedTotal) {

            selectedTotal.textContent =
                `₹${selectedTotalAmount}`;

        }


        // ----------------------------------------------------
        // PARTICIPATION MESSAGE
        // ----------------------------------------------------

        if (participationMessage) {

            if (
                currentEvent.participation ===
                "internal-external"
            ) {

                participationMessage.textContent =
                    "External registration is currently open. " +
                    "Internal registration is closed. " +
                    "External teams require exactly 2 participants " +
                    "and pay ₹500 per team (₹250/person). " +
                    "Internal and External participants cannot be mixed.";

            }

            else {

                participationMessage.textContent =
                    "Internal registration is currently closed " +
                    "for Circuit Clash.";

            }

        }


        // ----------------------------------------------------
        // CONTINUE BUTTON
        // ----------------------------------------------------

        if (continueParticipation) {

            continueParticipation.disabled =
                false;

            continueParticipation.textContent =
                "Continue →";

        }

    }


    // --------------------------------------------------------
    // SHOW / HIDE PARTICIPATION CARDS
    // --------------------------------------------------------

    if (
        participationCards &&
        participationCards.length
    ) {

        participationCards.forEach(
            function (card) {

                const type =
                    card.dataset.participation;

                const isClosed =
                    closedTypes[type] === true;

                const isAllowed =
                    allowedTypes.includes(type);


                // Closed participation is hidden
                if (
                    isClosed ||
                    !isAllowed
                ) {

                    card.hidden =
                        true;

                }

                else {

                    card.hidden =
                        false;

                }


                card.classList.toggle(
                    "selected",
                    type === selectedParticipation
                );

            }
        );

    }


    // --------------------------------------------------------
    // EVENT DATE / FEE
    // --------------------------------------------------------

    if (eventDate) {

        if (
            selectedParticipation ===
            "external"
        ) {

            eventDate.textContent =
                currentEvent.externalDate;

        }

        else if (
            currentEvent.participation ===
            "internal-external"
        ) {

            eventDate.textContent =
                "External registration open | Internal registration closed";

        }

        else {

            eventDate.textContent =
                "Registrations Closed";

        }

    }


    if (eventFee) {

        if (
            selectedParticipation ===
            "external"
        ) {

            eventFee.textContent =
                "External ₹250 / Participant";

        }

        else if (
            currentEvent.participation ===
            "internal-external"
        ) {

            eventFee.textContent =
                "External ₹250 / Participant | Internal Closed";

        }

        else {

            eventFee.textContent =
                "Internal registration closed";

        }

    }

}


// ------------------------------------------------------------
// PARTICIPATION CARD CLICK
// ------------------------------------------------------------

if (
    participationCards &&
    participationCards.length
) {

    participationCards.forEach(
        function (card) {

            card.addEventListener(
                "click",
                function () {

                    const type =
                        card.dataset.participation;

                    const allowedTypes =
                        getAllowedParticipationTypes();

                    if (
                        !allowedTypes.includes(type)
                    ) {

                        return;

                    }

                    selectedParticipation =
                        type;

                    updateParticipationUI();

                }
            );

        }
    );

}


// ------------------------------------------------------------
// INITIALIZE PARTICIPATION UI
// ------------------------------------------------------------

updateParticipationUI();
  /* ============================================================
   MODULE 9 — PARTICIPANT FORMS
   ============================================================ */

function generateParticipantForms() {

    if (!participantForms) {
        return;
    }

    participantForms.innerHTML = "";

    participantCount = 2;

    for (
        let i = 1;
        i <= participantCount;
        i++
    ) {
        createParticipantForm(i);
    }
}


function createParticipantForm(number) {

    const wrapper =
        document.createElement("div");

    wrapper.className =
        "participant-card";

    wrapper.dataset.participant =
        number;

    const roleTitle =
        number === 1
            ? "Team Leader"
            : "Team Member";

    const roleBadge =
        number === 1
            ? "TEAM LEADER"
            : "TEAM MEMBER";

    const roleDescription =
        number === 1
            ? "Enter the details of the team leader."
            : "Enter the details of the team member.";

    wrapper.innerHTML = `

        <div class="participant-card-header">

            <div class="participant-number">
                ${String(number).padStart(2, "0")}
            </div>

            <div class="participant-role">

                <span class="role-badge">
                    ${roleBadge}
                </span>

                <h3>
                    ${roleTitle}
                </h3>

                <p>
                    ${roleDescription}
                </p>

            </div>

        </div>


        <div class="participant-form-grid">

            <div class="participant-field full">

                <label for="participantName${number}">
                    Full Name
                    <span>*</span>
                </label>

                <input
                    type="text"
                    id="participantName${number}"
                    placeholder="Enter full name"
                    autocomplete="name"
                >

                <small
                    class="field-error"
                    id="participantName${number}Error"
                ></small>

            </div>


            <div class="participant-field full">

                <label for="participantCollege${number}">
                    College / Institution
                    <span>*</span>
                </label>

                <input
                    type="text"
                    id="participantCollege${number}"
                    placeholder="Enter college / institution"
                >

                <small
                    class="field-error"
                    id="participantCollege${number}Error"
                ></small>

            </div>


            <div class="participant-field">

                <label for="participantDepartment${number}">
                    Department
                    <span>*</span>
                </label>

                <input
                    type="text"
                    id="participantDepartment${number}"
                    placeholder="e.g. ECE"
                >

                <small
                    class="field-error"
                    id="participantDepartment${number}Error"
                ></small>

            </div>


            <div class="participant-field">

                <label for="participantYear${number}">
                    Year
                    <span>*</span>
                </label>

                <select id="participantYear${number}">

                    <option value="">
                        Select year
                    </option>

                    <option value="1st Year">
                        1st Year
                    </option>

                    <option value="2nd Year">
                        2nd Year
                    </option>

                    <option value="3rd Year">
                        3rd Year
                    </option>

                    <option value="4th Year">
                        4th Year
                    </option>

                </select>

                <small
                    class="field-error"
                    id="participantYear${number}Error"
                ></small>

            </div>


            <div class="participant-field">

                <label for="participantPhone${number}">
                    Phone Number
                    <span>*</span>
                </label>

                <input
                    type="tel"
                    id="participantPhone${number}"
                    placeholder="10-digit mobile number"
                    inputmode="numeric"
                    maxlength="10"
                >

                <small
                    class="field-error"
                    id="participantPhone${number}Error"
                ></small>

            </div>


            <div class="participant-field">

                <label for="participantEmail${number}">
                    Email Address
                    <span>*</span>
                </label>

                <input
                    type="email"
                    id="participantEmail${number}"
                    placeholder="Enter email address"
                    autocomplete="email"
                >

                <small
                    class="field-error"
                    id="participantEmail${number}Error"
                ></small>

            </div>

        </div>
    `;

    participantForms.appendChild(wrapper);
}


    /* ============================================================
       MODULE 10 — COLLECT PARTICIPANTS
       ============================================================ */

    function collectParticipants() {

        const participants =
            [];


        for (
            let i = 1;
            i <= participantCount;
            i++
        ) {

            const name =
                document.getElementById(
                    `participantName${i}`
                );

            const college =
                document.getElementById(
                    `participantCollege${i}`
                );

            const department =
                document.getElementById(
                    `participantDepartment${i}`
                );

            const year =
                document.getElementById(
                    `participantYear${i}`
                );

            const phone =
                document.getElementById(
                    `participantPhone${i}`
                );

            const email =
                document.getElementById(
                    `participantEmail${i}`
                );


            participants.push({

                name:
                    name
                        ? name.value.trim()
                        : "",

                college:
                    college
                        ? college.value.trim()
                        : "",

                department:
                    department
                        ? department.value.trim()
                        : "",

                year:
                    year
                        ? year.value.trim()
                        : "",

                phone:
                    phone
                        ? phone.value.trim()
                        : "",

                email:
                    email
                        ? email.value.trim()
                        : ""

            });

        }


        return participants;

    }


    /* ============================================================
       MODULE 11 — VALIDATE PARTICIPANTS
       ============================================================ */

    function validateParticipants(
        participants
    ) {

        let valid =
            true;


        participants.forEach(
            function (
                participant,
                index
            ) {

                const n =
                    index + 1;


                const fields = [

                    {
                        value:
                            participant.name,

                        id:
                            `participantName${n}`,

                        message:
                            "Full name is required."

                    },

                    {
                        value:
                            participant.college,

                        id:
                            `participantCollege${n}`,

                        message:
                            "College / Institution is required."

                    },

                    {
                        value:
                            participant.department,

                        id:
                            `participantDepartment${n}`,

                        message:
                            "Department is required."

                    },

                    {
                        value:
                            participant.year,

                        id:
                            `participantYear${n}`,

                        message:
                            "Please select the year."

                    },

                    {
                        value:
                            participant.phone,

                        id:
                            `participantPhone${n}`,

                        message:
                            "Enter a valid 10-digit phone number."

                    },

                    {
                        value:
                            participant.email,

                        id:
                            `participantEmail${n}`,

                        message:
                            "Enter a valid email address."

                    }

                ];


                fields.forEach(
                    function (field) {

                        const error =
                            document.getElementById(
                                `${field.id}Error`
                            );


                        if (error) {

                            error.textContent =
                                "";

                        }


                        if (
                            !field.value
                        ) {

                            valid =
                                false;


                            if (error) {

                                error.textContent =
                                    field.message;

                            }

                            return;

                        }


                        if (
                            field.id.includes(
                                "Phone"
                            ) &&
                            !/^[6-9]\d{9}$/.test(
                                field.value
                            )
                        ) {

                            valid =
                                false;


                            if (error) {

                                error.textContent =
                                    "Enter a valid 10-digit Indian mobile number.";

                            }

                        }


                        if (
                            field.id.includes(
                                "Email"
                            ) &&
                            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
                                field.value
                            )
                        ) {

                            valid =
                                false;


                            if (error) {

                                error.textContent =
                                    "Enter a valid email address.";

                            }

                        }

                    }
                );

            }
        );


        return valid;

    }


   /* ============================================================
   MODULE 12 — CONTINUE TO PARTICIPANTS
   ============================================================ */

if (continueParticipation) {

    continueParticipation.addEventListener(
        "click",
        function (event) {

            event.preventDefault();

const allowedTypes =
    getAllowedParticipationTypes();


// ------------------------------------------------
// BLOCK CLOSED REGISTRATION
// ------------------------------------------------

if (allowedTypes.length === 0) {

    alert(
        "Registrations are currently closed for this event."
    );

    updateParticipationUI();

    return;

}


// ------------------------------------------------
// ENSURE VALID PARTICIPATION TYPE
// ------------------------------------------------

if (
    !selectedParticipation ||
    !allowedTypes.includes(
        selectedParticipation
    )
) {

    selectedParticipation =
        allowedTypes[0];

}

participantCount = 2;
            selectedFeePerPerson =
                getSelectedFeePerPerson();

            selectedTotalAmount =
                selectedFeePerPerson *
                participantCount;

            updateParticipationUI();


            if (participationSection) {
                participationSection.hidden =
                    true;
            }


            if (participantSection) {
                participantSection.hidden =
                    false;
            }


            generateParticipantForms();


            participantSection?.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }
    );

}

    /* ============================================================
       MODULE 13 — BACK TO PARTICIPATION
       ============================================================ */

    if (backToParticipation) {

        backToParticipation.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                participantSection.hidden =
                    true;


                participationSection.hidden =
                    false;


                participationSection.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "start"

                });

            }
        );

    }


    /* ============================================================
       MODULE 14 — LOCAL STORAGE
       ============================================================ */

    function saveRegistration() {

        try {

            localStorage.setItem(

                "sparkRegistration",

                JSON.stringify(
                    registrationData
                )

            );

        }

        catch (error) {

            console.error(
                "Unable to save registration:",
                error
            );

        }

    }


    function loadRegistration() {

        try {

            const saved =
                localStorage.getItem(
                    "sparkRegistration"
                );


            if (!saved) {

                return null;

            }


            return JSON.parse(
                saved
            );

        }

        catch (error) {

            console.error(
                "Unable to load registration:",
                error
            );


            return null;

        }

    }


    /* ============================================================
       MODULE 15 — ESCAPE HTML
       ============================================================ */

    function escapeHTML(
        value
    ) {

        const div =
            document.createElement(
                "div"
            );


        div.textContent =
            value || "";


        return div.innerHTML;

    }

/* ============================================================
   MODULE 16 — SHOW REVIEW
   ============================================================ */

function showReview(data) {

    if (reviewEventName) {

        reviewEventName.textContent =
            data.eventName;
    }


    if (reviewEventDate) {

        reviewEventDate.textContent =
            data.date;
    }


    if (reviewEventTime) {

        reviewEventTime.textContent =
            data.time;
    }


    if (reviewEventVenue) {

        reviewEventVenue.textContent =
            data.venue;
    }


    if (reviewParticipation) {

        reviewParticipation.textContent =
            data.participationLabel;
    }


    if (reviewParticipantCount) {

        reviewParticipantCount.textContent =
            data.participantCount;
    }


    if (reviewFeePerParticipant) {

        reviewFeePerParticipant.textContent =
            `₹${data.feePerPerson}`;
    }


    if (reviewTotalPeople) {

        reviewTotalPeople.textContent =
            data.participantCount;
    }


    if (reviewTotalAmount) {

        reviewTotalAmount.textContent =
            `₹${data.totalAmount}`;
    }


    if (reviewGrandTotal) {

        reviewGrandTotal.textContent =
            `₹${data.totalAmount}`;
    }


    /* --------------------------------------------------------
       TEAM NAME
       -------------------------------------------------------- */

    if (reviewTeamNameBox) {

        reviewTeamNameBox.hidden =
            false;
    }


    if (reviewTeamName) {

        reviewTeamName.textContent =
            data.teamName;
    }


    /* --------------------------------------------------------
       PARTICIPANTS
       -------------------------------------------------------- */

    if (reviewParticipants) {

        reviewParticipants.innerHTML =
            "";

        data.participants.forEach(
            function (participant, index) {

                const card =
                    document.createElement("div");

                card.className =
                    "review-participant-card";


                const role =
                    index === 0
                        ? "Team Leader"
                        : "Team Member";


                card.innerHTML = `

                    <div>

                        <span>
                            ${role}
                        </span>

                        <h4>
                            ${escapeHTML(
                                participant.name
                            )}
                        </h4>

                    </div>


                    <div>

                        <p>
                            ${escapeHTML(
                                participant.college
                            )}
                        </p>

                        <p>
                            ${escapeHTML(
                                participant.department
                            )}
                        </p>

                        <p>
                            ${escapeHTML(
                                participant.year
                            )}
                        </p>

                        <p>
                            ${escapeHTML(
                                participant.phone
                            )}
                        </p>

                        <p>
                            ${escapeHTML(
                                participant.email
                            )}
                        </p>

                    </div>

                `;


                reviewParticipants.appendChild(
                    card
                );

            }
        );

    }

}

 /* ============================================================
   MODULE 17 — CONTINUE TO REVIEW
   ============================================================ */

if (continueToReview) {

    continueToReview.addEventListener(
        "click",
        function (event) {

            event.preventDefault();


            const participants =
                collectParticipants();


            if (
                !validateParticipants(
                    participants
                )
            ) {

                alert(
                    "Please complete all participant details correctly."
                );

                return;
            }


            const teamName =
                teamNameInput
                    ? teamNameInput.value.trim()
                    : "";


            if (!teamName) {

                if (teamNameError) {

                    teamNameError.textContent =
                        "Team name is required.";
                }


                alert(
                    "Please enter your team name."
                );


                teamNameInput?.focus();

                return;
            }


            if (teamNameError) {

                teamNameError.textContent =
                    "";
            }


            selectedFeePerPerson =
                getSelectedFeePerPerson();


            selectedTotalAmount =
                selectedFeePerPerson *
                participantCount;


            registrationData = {

                eventId:
                    selectedEventId,

                eventName:
                    currentEvent.name,

                participation:
                    selectedParticipation,

                participationLabel:
                    selectedParticipation === "external"
                        ? "External"
                        : "Internal",

                participantCount:
                    2,

                participants:
                    participants,

                teamName:
                    teamName,

                feePerPerson:
                    selectedFeePerPerson,

                totalAmount:
                    selectedTotalAmount,

                date:
                    getSelectedDate(),

                time:
                    currentEvent.time,

                venue:
                    currentEvent.venue

            };


            saveRegistration();


            showReview(
                registrationData
            );


            participantSection.hidden =
                true;


            reviewSection.hidden =
                false;


            reviewSection.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });

        }
    );

}


    /* ============================================================
       MODULE 18 — EDIT DETAILS
       ============================================================ */

    if (editDetails) {

        editDetails.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                reviewSection.hidden =
                    true;


                participantSection.hidden =
                    false;


                participantSection.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "start"

                });

            }
        );

    }


    /* ============================================================
   MODULE 19 — UPDATE PAYMENT SUMMARY

   Updates the existing payment section.
   ============================================================ */

function updatePaymentInformation(data) {

    if (paymentEventName) {

        paymentEventName.textContent =
            data.eventName;
    }


    if (paymentParticipation) {

        paymentParticipation.textContent =
            `${data.participationLabel} — Team of 2`;
    }


    if (paymentParticipantCount) {

        paymentParticipantCount.textContent =
            data.participantCount;
    }


    if (paymentAmount) {

        paymentAmount.textContent =
            `₹${data.feePerPerson}`;
    }


    if (paymentTotal) {

        paymentTotal.textContent =
            `₹${data.totalAmount}`;
    }


    if (paymentUpiId) {

        paymentUpiId.textContent =
            UPI_ID;
    }


    /* --------------------------------------------------------
       TEAM NAME
       -------------------------------------------------------- */

    if (paymentTeamRow) {

        paymentTeamRow.hidden =
            false;
    }


    if (paymentTeamName) {

        paymentTeamName.textContent =
            data.teamName;
    }

}
    /* ============================================================
       MODULE 20 — CONTINUE TO PAYMENT
       ============================================================ */

    if (continueToPayment) {

        continueToPayment.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                const saved =
                    loadRegistration();


                if (!saved) {

                    alert(
                        "Registration information is missing. Please complete the participant details again."
                    );

                    return;

                }


                registrationData =
                    saved;


                updatePaymentInformation(
                    registrationData
                );


                reviewSection.hidden =
                    true;


                paymentSection.hidden =
                    false;


                paymentSection.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "start"

                });

            }
        );

    }


    /* ============================================================
       MODULE 21 — UPI TRANSACTION ID INPUT
       ============================================================ */

    if (utr) {

        utr.addEventListener(
            "input",
            function () {

                utr.value =
                    utr.value
                        .replace(/\D/g, "")
                        .slice(0, 12);

            }
        );

    }


    /* ============================================================
       MODULE 22 — VALIDATE PAYMENT DETAILS
       ============================================================ */

    function validatePaymentDetails() {

        let valid = true;

        const payer =
            payerName
                ? payerName.value.trim()
                : "";

        const transactionId =
            utr
                ? utr.value.trim()
                : "";


        /* --------------------------------------------------------
           CLEAR PREVIOUS ERRORS
           -------------------------------------------------------- */

        if (payerNameError) {

            payerNameError.textContent =
                "";

        }


        if (utrError) {

            utrError.textContent =
                "";

        }


        /* --------------------------------------------------------
           PAYER NAME
           -------------------------------------------------------- */

        if (!payer) {

            valid = false;

            if (payerNameError) {

                payerNameError.textContent =
                    "Payer name is required.";

            }

        }

        else if (
            !/^[A-Za-z .'-]+$/.test(
                payer
            )
        ) {

            valid = false;

            if (payerNameError) {

                payerNameError.textContent =
                    "Enter a valid payer name.";

            }

        }


        /* --------------------------------------------------------
           UPI TRANSACTION ID
           -------------------------------------------------------- */

        if (!transactionId) {

            valid = false;

            if (utrError) {

                utrError.textContent =
                    "UPI Transaction ID is required.";

            }

        }

        else if (
            !/^\d{12}$/.test(
                transactionId
            )
        ) {

            valid = false;

            if (utrError) {

                utrError.textContent =
                    "UPI Transaction ID must contain exactly 12 digits.";

            }

        }


        return {

            valid:
                valid,

            payerName:
                payer,

            utr:
                transactionId

        };

    }


    /* ============================================================
       MODULE 23 — BACK TO REVIEW
       ============================================================ */

    if (backToReview) {

        backToReview.addEventListener(
            "click",
            function (event) {

                event.preventDefault();


                paymentSection.hidden =
                    true;


                reviewSection.hidden =
                    false;


                reviewSection.scrollIntoView({

                    behavior:
                        "smooth",

                    block:
                        "start"

                });

            }
        );

    }


    /* ============================================================
       MODULE 24 — SUBMIT PAYMENT DETAILS
       ============================================================ */

    if (completePayment) {

        completePayment.addEventListener(
            "click",
            async function (event) {

                event.preventDefault();


                /* ------------------------------------------------
                   LOAD REGISTRATION
                   ------------------------------------------------ */

                const saved =
                    loadRegistration();


                if (!saved) {

                    alert(
                        "Registration information is missing. Please complete the registration again."
                    );

                    return;

                }


                registrationData =
                    saved;


                /* ------------------------------------------------
                   VALIDATE PAYMENT
                   ------------------------------------------------ */

                const paymentValidation =
                    validatePaymentDetails();


                if (
                    !paymentValidation.valid
                ) {

                    alert(
                        "Please enter the payer name and a valid 12-digit UPI Transaction ID."
                    );

                    return;

                }


                /* ------------------------------------------------
                   DISABLE BUTTON
                   ------------------------------------------------ */

                completePayment.disabled =
                    true;


                const originalButtonText =
                    completePayment.innerHTML;


                completePayment.innerHTML =
                    "Submitting...";


let participant = null;

let teamLeader =
    registrationData.participants[0];

let teamMember =
    registrationData.participants[1];


                /* ------------------------------------------------
                   REQUEST DATA
                   ------------------------------------------------ */

const requestData = {

    eventId:
        registrationData.eventId,

    eventName:
        registrationData.eventName,

    participationType:
        registrationData.participation,

    participationLabel:
        registrationData.participationLabel,

    teamSize:
        2,

    participantCount:
        2,

    amount:
        registrationData.totalAmount,

    feePerPerson:
        registrationData.feePerPerson,

    teamName:
        registrationData.teamName || "",

    participant:
        null,

    teamLeader:
        teamLeader,

    teamMember:
        teamMember,

    payerName:
        paymentValidation.payerName,

    utr:
        paymentValidation.utr,

    transactionId:
        paymentValidation.utr,

    paymentMethod:
        "UPI"

};

                console.log(
                    "=========================================="
                );

                console.log(
                    "Submitting payment details..."
                );

                console.log(
                    "REQUEST DATA:",
                    requestData
                );

                console.log(
                    "Team Size:",
                    requestData.teamSize,
                    typeof requestData.teamSize
                );

                console.log(
                    "=========================================="
                );


                /* ------------------------------------------------
                   SEND TO SERVER
                   ------------------------------------------------ */

                try {

                    const response =
                        await fetch(

                            `${API_BASE_URL}/api/register`,

                            {

                                method:
                                    "POST",

                                headers: {

                                    "Content-Type":
                                        "application/json"

                                },

                                body:
                                    JSON.stringify(
                                        requestData
                                    )

                            }

                        );


                    let data = null;

                    const responseText =
                        await response.text();

                    console.log(
                        "HTTP STATUS:",
                        response.status
                    );

                    console.log(
                        "RAW SERVER RESPONSE:",
                        responseText
                    );


                    if (
                        !responseText ||
                        !responseText.trim()
                    ) {

                        throw new Error(
                            `Server returned an empty response. HTTP ${response.status}.`
                        );

                    }


                    try {

                        data =
                            JSON.parse(
                                responseText
                            );

                    }

                    catch (jsonError) {

                        console.error(
                            "Server did not return JSON:",
                            responseText
                        );

                        throw new Error(
                            `Server returned non-JSON response. HTTP ${response.status}. Check Vercel API deployment.`
                        );

                    }


                    console.log(
                        "Server response:",
                        data
                    );


                    /* ------------------------------------------------
                       SERVER ERROR
                       ------------------------------------------------ */

                    if (
                        !response.ok ||
                        !data.success
                    ) {

                        throw new Error(

                            data.message ||

                            "Registration submission failed."

                        );

                    }


                    /* ------------------------------------------------
                       SAVE REGISTRATION RESPONSE
                       ------------------------------------------------ */

                    registrationData.registrationId =
                        data.registrationId;


                    registrationData.payerName =
                        paymentValidation.payerName;


                    registrationData.utr =
                        paymentValidation.utr;


                    registrationData.transactionId =
                        paymentValidation.utr;


                    registrationData.paymentStatus =
                        data.paymentStatus ||
                        "SUBMITTED";


                    registrationData.verificationStatus =
                        data.verificationStatus ||
                        "PENDING";


                    registrationData.submittedAt =
                        new Date()
                            .toISOString();


                    saveRegistration();


                    /* ------------------------------------------------
                       SHOW SUCCESS
                       ------------------------------------------------ */

                    showRegistrationSuccess(
                        registrationData
                    );


                }

                catch (error) {

                    console.error(
                        "=========================================="
                    );

                    console.error(
                        "REGISTRATION SUBMISSION FAILED"
                    );

                    console.error(
                        error
                    );

                    console.error(
                        "=========================================="
                    );


                    alert(
                        error.message ||
                        "Failed to submit payment details."
                    );


                    completePayment.disabled =
                        false;


                    completePayment.innerHTML =
                        originalButtonText;

                }

            }
        );

    }


    /* ============================================================
       MODULE 25 — SHOW SUCCESS
       ============================================================ */

    function showRegistrationSuccess(
        data
    ) {

        /* --------------------------------------------------------
           HIDE PREVIOUS SECTIONS
           -------------------------------------------------------- */

        if (participationSection) {

            participationSection.hidden =
                true;

        }


        if (participantSection) {

            participantSection.hidden =
                true;

        }


        if (reviewSection) {

            reviewSection.hidden =
                true;

        }


        if (paymentSection) {

            paymentSection.hidden =
                true;

        }


        /* --------------------------------------------------------
           REGISTRATION ID
           -------------------------------------------------------- */

        if (successRegistrationId) {

            successRegistrationId.textContent =
                data.registrationId;

        }


        /* --------------------------------------------------------
           EVENT
           -------------------------------------------------------- */

        if (successEventName) {

            successEventName.textContent =
                data.eventName;

        }


        /* --------------------------------------------------------
           PARTICIPANTS
           -------------------------------------------------------- */

        if (successParticipantCount) {

            successParticipantCount.textContent =
                data.participantCount;

        }


        /* --------------------------------------------------------
           TEAM
           -------------------------------------------------------- */
/* --------------------------------------------------------
   TEAM
   -------------------------------------------------------- */

if (successTeamRow) {

    successTeamRow.hidden =
        false;
}


if (successTeamName) {

    successTeamName.textContent =
        data.teamName || "—";
}


        /* --------------------------------------------------------
           AMOUNT
           -------------------------------------------------------- */

        if (successAmount) {

            successAmount.textContent =
                `₹${data.totalAmount}`;

        }


        /* --------------------------------------------------------
           PAYER
           -------------------------------------------------------- */

        if (successPayerName) {

            successPayerName.textContent =
                data.payerName || "—";

        }


        /* --------------------------------------------------------
           UTR
           -------------------------------------------------------- */

        if (successUtr) {

            successUtr.textContent =
                data.utr || "—";

        }


        /* --------------------------------------------------------
           SUCCESS SECTION
           -------------------------------------------------------- */

        if (successSection) {

            successSection.hidden =
                false;


            successSection.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });

        }


        /* --------------------------------------------------------
           CONSOLE
           -------------------------------------------------------- */

        console.log(
            "=========================================="
        );

        console.log(
            "REGISTRATION COMPLETED"
        );

        console.log(
            `Registration ID: ${data.registrationId}`
        );

        console.log(
            `Event: ${data.eventName}`
        );

        console.log(
            `Payment Status: ${data.paymentStatus}`
        );

        console.log(
            `Verification Status: ${data.verificationStatus}`
        );

        console.log(
            "IMPORTANT: Keep the Registration ID safe."
        );

        console.log(
            "=========================================="
        );

    }


    /* ============================================================
       MODULE 26 — INITIAL STATE
       ============================================================ */

    if (successSection) {

        successSection.hidden =
            true;

    }


    /* ============================================================
       MODULE 27 — FINAL LOG
       ============================================================ */

    console.log(
        "=========================================="
    );

    console.log(
        "SPARK 2026 Registration loaded successfully."
    );

    console.log(
        `Event: ${currentEvent.name}`
    );

    console.log(
        `Participation: ${currentEvent.participation}`
    );

    console.log(
        `Participants: ${currentEvent.participantCount}`
    );

    console.log(
        "Payment: UPI + Manual 12-Digit UPI Transaction ID"
    );

    console.log(
        `UPI ID: ${UPI_ID}`
    );

    console.log(
        "=========================================="
    );

});