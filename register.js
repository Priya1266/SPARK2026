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
   Payer Name + 16 Digit UTR
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

    const PRICE_PER_PERSON = 200;

    const UPI_ID = "9940464883@ptaxis";


    /* ============================================================
       MODULE 2 — GET EVENT FROM URL
       ============================================================ */

    const params =
        new URLSearchParams(window.location.search);

    const selectedEventId =
        params.get("event");


    /* ============================================================
       MODULE 3 — EVENT CONFIGURATION
       ============================================================ */

    const registrationEvents = {

        ideaforge: {

            name: "iDeaForge",

            participation: "team",

            participantCount: 2,

            date: "22 September 2026",

            time: "10:00 AM – 12:30 PM",

            venue:
                "Sathyabama Institute of Science and Technology",

            feePerPerson: 200,

            totalFee: 400

        },


        circuitclash: {

            name: "Circuit Clash",

            participation: "team",

            participantCount: 2,

            date: "22 September 2026",

            time: "1:00 PM – 3:00 PM",

            venue:
                "Sathyabama Institute of Science and Technology",

            feePerPerson: 200,

            totalFee: 400

        },


        iqquest: {

            name: "iQuest",

            participation: "team",

            participantCount: 2,

            date: "23 September 2026",

            time: "1:00 PM – 3:00 PM",

            venue:
                "Sathyabama Institute of Science and Technology",

            feePerPerson: 200,

            totalFee: 400

        },


        codesprint: {

            name: "CodeSprint",

            participation: "individual",

            participantCount: 1,

            date: "23 September 2026",

            time: "10:00 AM – 12:30 PM",

            venue:
                "Sathyabama Institute of Science and Technology",

            feePerPerson: 200,

            totalFee: 200

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

    const teamSizeBox =
        document.getElementById("teamSizeBox");

    const teamCount =
        document.getElementById("teamCount");

    const teamTotal =
        document.getElementById("teamTotal");

    const decreaseTeam =
        document.getElementById("decreaseTeam");

    const increaseTeam =
        document.getElementById("increaseTeam");


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

    let selectedParticipation =
        currentEvent.participation;

    let participantCount =
        currentEvent.participantCount;

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

        eventDate.textContent =
            currentEvent.date;

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

        eventFee.textContent =
            `₹${currentEvent.feePerPerson} / Participant`;

    }


    if (paymentUpiId) {

        paymentUpiId.textContent =
            UPI_ID;

    }


    /* ============================================================
       MODULE 8 — PARTICIPATION UI
       ============================================================ */

    function updateParticipationUI() {

        const isTeam =
            selectedParticipation ===
            "team";


        participantCount =
            Number(
                currentEvent.participantCount
            );


        if (teamSizeBox) {

            teamSizeBox.hidden =
                !isTeam;

        }


        if (teamCount) {

            teamCount.textContent =
                participantCount;

        }


        if (teamTotal) {

            teamTotal.textContent =
                `₹${participantCount * PRICE_PER_PERSON}`;

        }


        if (teamNameBox) {

            teamNameBox.hidden =
                !isTeam;

        }


        if (!isTeam && teamNameInput) {

            teamNameInput.value =
                "";

        }


        if (selectedType) {

            selectedType.textContent =
                isTeam
                    ? "Team"
                    : "Individual";

        }


        if (selectedCount) {

            selectedCount.textContent =
                participantCount;

        }


        if (selectedTotal) {

            selectedTotal.textContent =
                `₹${participantCount * PRICE_PER_PERSON}`;

        }


        if (participationMessage) {

            const message =
                participationMessage.querySelector(
                    "p"
                );


            if (message) {

                message.textContent =
                    isTeam

                        ? "This event requires exactly 2 participants per team."

                        : "This event allows individual participation only.";

            }

        }


        participationCards.forEach(
            function (card) {

                const type =
                    String(
                        card.dataset.participation || ""
                    )
                    .trim()
                    .toLowerCase();


                card.classList.remove(
                    "selected",
                    "active"
                );


                if (
                    type ===
                    selectedParticipation
                ) {

                    card.classList.add(
                        "selected",
                        "active"
                    );

                    card.hidden =
                        false;

                }
                else {

                    card.hidden =
                        true;

                }

            }
        );

    }


    /* ============================================================
       PARTICIPATION CARD CLICK
       ============================================================ */

    participationCards.forEach(
        function (card) {

            card.addEventListener(
                "click",
                function () {

                    const type =
                        String(
                            card.dataset.participation || ""
                        )
                        .trim()
                        .toLowerCase();


                    if (
                        type !==
                        currentEvent.participation
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


    /* ============================================================
       TEAM +/- BUTTONS
       ============================================================ */

    if (decreaseTeam) {

        decreaseTeam.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                updateParticipationUI();

            }
        );

    }


    if (increaseTeam) {

        increaseTeam.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                updateParticipationUI();

            }
        );

    }


    updateParticipationUI();


    /* ============================================================
       MODULE 9 — PARTICIPANT FORMS
       ============================================================ */

    function generateParticipantForms() {

        if (!participantForms) {

            return;

        }


        participantForms.innerHTML =
            "";


        for (
            let i = 1;
            i <= participantCount;
            i++
        ) {

            createParticipantForm(i);

        }

    }


    function createParticipantForm(
        number
    ) {

        const wrapper =
            document.createElement(
                "div"
            );


        wrapper.className =
            "participant-card";


        wrapper.dataset.participant =
            number;


        let roleTitle;
        let roleBadge;
        let roleDescription;


        if (
            selectedParticipation ===
            "team"
        ) {

            if (
                number === 1
            ) {

                roleTitle =
                    "Team Leader";

                roleBadge =
                    "TEAM LEADER";

                roleDescription =
                    "Enter the details of the team leader.";

            }
            else {

                roleTitle =
                    "Team Member";

                roleBadge =
                    "TEAM MEMBER";

                roleDescription =
                    "Enter the details of the team member.";

            }

        }
        else {

            roleTitle =
                "Participant";

            roleBadge =
                "PARTICIPANT";

            roleDescription =
                "Enter your participant information.";

        }


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

                    <label
                        for="participantName${number}"
                    >
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

                    <label
                        for="participantCollege${number}"
                    >
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

                    <label
                        for="participantDepartment${number}"
                    >
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

                    <label
                        for="participantYear${number}"
                    >
                        Year
                        <span>*</span>
                    </label>

                    <select
                        id="participantYear${number}"
                    >

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

                        <option value="5th Year">
                            5th Year
                        </option>

                    </select>

                    <small
                        class="field-error"
                        id="participantYear${number}Error"
                    ></small>

                </div>


                <div class="participant-field">

                    <label
                        for="participantPhone${number}"
                    >
                        Phone Number
                        <span>*</span>
                    </label>

                    <input
                        type="tel"
                        id="participantPhone${number}"
                        placeholder="10-digit mobile number"
                        maxlength="10"
                        inputmode="numeric"
                    >

                    <small
                        class="field-error"
                        id="participantPhone${number}Error"
                    ></small>

                </div>


                <div class="participant-field">

                    <label
                        for="participantEmail${number}"
                    >
                        Email
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


        participantForms.appendChild(
            wrapper
        );

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


                selectedParticipation =
                    currentEvent.participation;


                participantCount =
                    currentEvent.participantCount;


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

                    behavior:
                        "smooth",

                    block:
                        "start"

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

    function showReview(
        data
    ) {

        if (reviewEventName) {

            reviewEventName.textContent =
                data.eventName;

        }


        if (reviewEventDate) {

            reviewEventDate.textContent =
                currentEvent.date;

        }


        if (reviewEventTime) {

            reviewEventTime.textContent =
                currentEvent.time;

        }


        if (reviewEventVenue) {

            reviewEventVenue.textContent =
                currentEvent.venue;

        }


        if (reviewParticipation) {

            reviewParticipation.textContent =
                data.participation ===
                "team"

                    ? "Team"

                    : "Individual";

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

        if (
            data.participation ===
            "team"
        ) {

            if (reviewTeamNameBox) {

                reviewTeamNameBox.hidden =
                    false;

            }


            if (reviewTeamName) {

                reviewTeamName.textContent =
                    data.teamName;

            }

        }
        else {

            if (reviewTeamNameBox) {

                reviewTeamNameBox.hidden =
                    true;

            }

        }


        /* --------------------------------------------------------
           PARTICIPANTS
           -------------------------------------------------------- */

        if (reviewParticipants) {

            reviewParticipants.innerHTML =
                "";


            data.participants.forEach(
                function (
                    participant,
                    index
                ) {

                    const card =
                        document.createElement(
                            "div"
                        );


                    card.className =
                        "review-participant-card";


                    let role;


                    if (
                        data.participation ===
                        "team"
                    ) {

                        role =
                            index === 0
                                ? "Team Leader"
                                : "Team Member";

                    }
                    else {

                        role =
                            "Participant";

                    }


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


                let teamName =
                    "";


                if (
                    selectedParticipation ===
                    "team"
                ) {

                    teamName =
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

                }


                registrationData = {

                    eventId:
                        selectedEventId,

                    eventName:
                        currentEvent.name,

                    participation:
                        selectedParticipation,

                    participantCount:
                        participantCount,

                    participants:
                        participants,

                    teamName:
                        teamName,

                    feePerPerson:
                        PRICE_PER_PERSON,

                    totalAmount:
                        participantCount *
                        PRICE_PER_PERSON

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
       
       IMPORTANT:
       This ONLY updates the EXISTING HTML.

       It does NOT create another Scan & Pay section.
       ============================================================ */

    function updatePaymentInformation(
        data
    ) {

        if (paymentEventName) {

            paymentEventName.textContent =
                data.eventName;

        }


        if (paymentParticipation) {

            paymentParticipation.textContent =
                data.participation ===
                "team"

                    ? "Team — 2 Participants"

                    : "Individual — 1 Participant";

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


        if (
            data.participation ===
            "team"
        ) {

            if (paymentTeamRow) {

                paymentTeamRow.hidden =
                    false;

            }


            if (paymentTeamName) {

                paymentTeamName.textContent =
                    data.teamName;

            }

        }
        else {

            if (paymentTeamRow) {

                paymentTeamRow.hidden =
                    true;

            }

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


                /* ------------------------------------------------
                   PARTICIPANT DATA
                   ------------------------------------------------ */

                let participant =
                    null;

                let teamLeader =
                    null;

                let teamMember =
                    null;


                if (
                    registrationData.participation ===
                    "individual"
                ) {

                    participant =
                        registrationData
                            .participants[0];

                }
                else {

                    teamLeader =
                        registrationData
                            .participants[0];

                    teamMember =
                        registrationData
                            .participants[1];

                }


                /* ------------------------------------------------
                   REQUEST DATA
                   ------------------------------------------------ */

                const requestData = {

                    eventId:
                        registrationData.eventId,

                    eventName:
                        registrationData.eventName,

                    teamSize:
                        registrationData.participation,

                    amount:
                        registrationData.totalAmount,

                    teamName:
                        registrationData.teamName || "",

                    participant:
                        participant,

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
                    requestData
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

const responseText = await response.text();

console.log("HTTP STATUS:", response.status);
console.log("RAW SERVER RESPONSE:", responseText);

if (!responseText || !responseText.trim()) {
    throw new Error(
        `Server returned an empty response. HTTP ${response.status}.`
    );
}

try {
    data = JSON.parse(responseText);
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

        if (
            data.participation ===
            "team"
        ) {

            if (successTeamRow) {

                successTeamRow.hidden =
                    false;

            }


            if (successTeamName) {

                successTeamName.textContent =
                    data.teamName;

            }

        }
        else {

            if (successTeamRow) {

                successTeamRow.hidden =
                    true;

            }

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