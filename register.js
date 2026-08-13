/* =========================================================
   SPARK 2026 REGISTRATION
   MODULE 1 — EVENT CONFIGURATION + ELEMENTS
   ========================================================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {
    

        /* =====================================================
           CONSTANTS
           ===================================================== */

        const PRICE_PER_PERSON = 200;



        /* =====================================================
           GET EVENT FROM URL
           ===================================================== */

        const registerParams =
            new URLSearchParams(
                window.location.search
            );


        const selectedEventId =
            registerParams.get("event");



        /* =====================================================
           EVENT CONFIGURATION
           ===================================================== */

        const registrationEvents = {


            /* =================================================
               IDEA FORGE
               ================================================= */

ideaforge: {

    name:
        "iDeaForge",

    participation:
        "team",

    participantCount:
        2,

    date:
        "22 September 2026",

    time:
        "10:00 AM – 12:30 PM",

    venue:
        "Sathyabama Institute of Science and Technology",

    feePerPerson:
        200,

    totalFee:
        400

},


            /* =================================================
               CIRCUIT CLASH
               ================================================= */

          circuitclash: {

    name:
        "Circuit Clash",

    participation:
        "team",

    participantCount:
        2,

    date:
        "22 September 2026",

    time:
        "1:00 PM – 3:00 PM",

    venue:
        "Sathyabama Institute of Science and Technology",

    feePerPerson:
        200,

    totalFee:
        400

},


            /* =================================================
               IQUEST
            /* =================================================
               IQUEST
               ================================================= */

            iqquest: {

                name:
                    "iQuest",

                participation:
                    "team",

                participantCount:
                    2,

                date:
                    "23 September 2026",

                time:
                    "1:00 PM – 3:00 PM",

                venue:
                    "Sathyabama Institute of Science and Technology",

                feePerPerson:
                    200,

                totalFee:
                    400

            },


            /* =================================================
               CODESPRINT
               ================================================= */

            codesprint: {

                name:
                    "CodeSprint",

                participation:
                    "individual",

                participantCount:
                    1,

                date:
                    "23 September 2026",

                time:
                    "10:00 AM – 12:30 PM",

                venue:
                    "Sathyabama Institute of Science and Technology",

                feePerPerson:
                    200,

                totalFee:
                    200

            }

        };

        /* =====================================================
           CHECK EVENT
           ===================================================== */

        const currentEvent =
            registrationEvents[
                selectedEventId
            ];



        /*
         * If someone opens register.html
         * without selecting an event,
         * stop the registration process.
         */

        if (!currentEvent) {

            document.body.innerHTML = `

                <div
                    style="
                        min-height:100vh;
                        display:flex;
                        align-items:center;
                        justify-content:center;
                        text-align:center;
                        padding:30px;
                        font-family:Arial,sans-serif;
                    "
                >

                    <div>

                        <h1>
                            Event Not Selected
                        </h1>

                        <p>
                            Please select an event
                            before registering.
                        </p>

                        <a
                            href="index.html"
                        >
                            ← Back to SPARK 2026
                        </a>

                    </div>

                </div>

            `;

            return;

        }



        /* =====================================================
           PARTICIPATION ELEMENTS
           ===================================================== */

        const participationCards =
            document.querySelectorAll(
                ".participation-card"
            );


        const teamSizeBox =
            document.getElementById(
                "teamSizeBox"
            );


        const participationMessage =
            document.getElementById(
                "participationMessage"
            );


        const continueParticipation =
            document.getElementById(
                "continueParticipation"
            );



        /* =====================================================
           TEAM SIZE ELEMENTS
           ===================================================== */

        const decreaseTeam =
            document.getElementById(
                "decreaseTeam"
            );


        const increaseTeam =
            document.getElementById(
                "increaseTeam"
            );


        const teamCount =
            document.getElementById(
                "teamCount"
            );


        const teamTotal =
            document.getElementById(
                "teamTotal"
            );



        /* =====================================================
           PARTICIPANT ELEMENTS
           ===================================================== */

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



        /* =====================================================
           TEAM NAME ELEMENTS
           ===================================================== */

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



        /* =====================================================
           REVIEW ELEMENTS
           ===================================================== */

        const reviewSection =
            document.getElementById(
                "reviewSection"
            );


        const backToParticipants =
            document.getElementById(
                "backToParticipants"
            );


        const continueToPayment =
            document.getElementById(
                "continueToPayment"
            );



        /* =====================================================
           PAYMENT ELEMENTS
           ===================================================== */

        const paymentSection =
            document.getElementById(
                "paymentSection"
            );


        const backToReview =
            document.getElementById(
                "backToReview"
            );


        const completePayment =
            document.getElementById(
                "completePayment"
            );



        /* =====================================================
           VARIABLES
           ===================================================== */

        /*
         * These are automatically determined
         * from the selected event.
         *
         * Team events:
         * iDeaForge     → 2
         * Circuit Clash → 2
         * iQuest        → 2
         *
         * Individual:
         * CodeSprint    → 1
         */

        let selectedParticipation =
            currentEvent.participation;


        let participantCount =
            currentEvent.participantCount;



        /* =====================================================
           EVENT INFORMATION HELPER
           ===================================================== */

        function getCurrentEvent() {

            return currentEvent;

        }



        /* =====================================================
           SHOW EVENT INFORMATION IF ELEMENTS EXIST
 /* =====================================================
   SHOW EVENT INFORMATION
   ===================================================== */

const eventDate =
    document.getElementById(
        "eventDate"
    );

const eventTime =
    document.getElementById(
        "eventTime"
    );

const eventVenue =
    document.getElementById(
        "eventVenue"
    );


/* DATE */

if (eventDate) {

    eventDate.textContent =
        currentEvent.date;

}


/* TIME */

if (eventTime) {

    eventTime.textContent =
        currentEvent.time;

}


/* VENUE */

if (eventVenue) {

    eventVenue.textContent =
        currentEvent.venue;

}


        /* =====================================================
           EXPORT EVENT DATA TO GLOBAL WINDOW
           ===================================================== */

        /*
         * This allows other parts of the page
         * or future code to access the selected
         * event if necessary.
         */

        window.sparkRegistrationEvent =
            currentEvent;



        /*
         * MODULE 2 will continue here.
         *
         * Do NOT add the old
         * "let selectedParticipation = null"
         * or
         * "let participantCount = 1"
         * declarations.
         */
        /* =========================================================
           MODULE 2 — PARTICIPATION SELECTION
           ========================================================= */
/* =========================================================
   MODULE 2 — PARTICIPATION SELECTION
   ========================================================= */

function setupParticipationCards() {

    if (!participationCards || participationCards.length === 0) {

        console.error(
            "Participation cards not found."
        );

        return;
    }


    /*
     * Get participation type from event.
     *
     * Team events:
     * iDeaForge
     * Circuit Clash
     * iQuest
     *
     * Individual:
     * CodeSprint
     */
/* =========================================================
   MODULE 4 — PARTICIPATION
   ========================================================= */

const allowedParticipation =
    String(
        currentEvent.participation
    )
    .trim()
    .toLowerCase();


/*
 * Set the initial participation.
 */

selectedParticipation =
    allowedParticipation;

participantCount =
    Number(
        currentEvent.participantCount
    );


/*
 * Configure Team / Individual cards.
 */

participationCards.forEach(
    function (card) {

        const cardType =
            String(
                card.dataset.participation
            )
            .trim()
            .toLowerCase();


        /*
         * Reset card.
         */

        card.classList.remove(
            "selected",
            "active",
            "disabled"
        );

        card.removeAttribute(
            "aria-disabled"
        );

        card.disabled = false;

        card.hidden = false;

        card.style.removeProperty(
            "display"
        );


        /*
         * If this card is NOT allowed
         * for the current event,
         * completely hide it.
         */

        if (
            cardType !==
            allowedParticipation
        ) {

            card.hidden = true;

            card.disabled = true;

            card.setAttribute(
                "aria-disabled",
                "true"
            );

            return;

        }


        /*
         * This is the allowed card.
         */

        card.hidden = false;

        card.disabled = false;

        card.classList.add(
            "selected",
            "active"
        );


        /*
         * Make the allowed card clickable.
         */

        card.addEventListener(
            "click",
            function () {

                selectedParticipation =
                    cardType;

                participantCount =
                    Number(
                        currentEvent
                            .participantCount
                    );


                /*
                 * Update selected appearance.
                 */

                participationCards.forEach(
                    function (item) {

                        item.classList.remove(
                            "selected",
                            "active"
                        );

                    }
                );


                card.classList.add(
                    "selected",
                    "active"
                );


                /*
                 * Update the rest of
                 * the registration page.
                 */

                updateParticipationUI();

            }
        );

    }
);


/*
 * Update participation message.
 */

updateParticipationUI();}

        /* =====================================================
           UPDATE PARTICIPATION UI
           ===================================================== */

        function updateParticipationUI() {


            const isTeam =
                selectedParticipation ===
                "team";


            const isIndividual =
                selectedParticipation ===
                "individual";



            /* =================================================
               TEAM SIZE BOX
               ================================================= */

            if (teamSizeBox) {


                if (isTeam) {

                    teamSizeBox.hidden =
                        false;

                }
                else {

                    teamSizeBox.hidden =
                        true;

                }

            }



            /* =================================================
               TEAM NAME
               ================================================= */

            if (teamNameBox) {


                if (isTeam) {

                    teamNameBox.hidden =
                        false;

                }
                else {

                    teamNameBox.hidden =
                        true;


                    /*
                     * Clear team name when
                     * individual event.
                     */

                    if (teamNameInput) {

                        teamNameInput.value =
                            "";

                    }

                }

            }



            /* =================================================
               FORCE PARTICIPANT COUNT
               ================================================= */

            if (isTeam) {

                /*
                 * All team events have EXACTLY
                 * two participants.
                 */

                participantCount = 2;

            }
            else if (isIndividual) {

                /*
                 * CodeSprint has exactly
                 * one participant.
                 */

                participantCount = 1;

            }



            /* =================================================
               UPDATE TEAM COUNT DISPLAY
               ================================================= */

            if (teamCount) {

                teamCount.textContent =
                    participantCount;

            }



            /* =================================================
               UPDATE TOTAL
               ================================================= */

            updateTotalFee();



            /* =================================================
               UPDATE SUMMARY
               ================================================= */

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
                    "₹" +
                    (
                        participantCount *
                        PRICE_PER_PERSON
                    );

            }



            /* =================================================
               PARTICIPATION MESSAGE
               ================================================= */

            if (participationMessage) {


                if (isTeam) {

                    participationMessage.textContent =
                        "This event requires exactly 2 participants per team.";

                }
                else {

                    participationMessage.textContent =
                        "This event allows individual participation only.";

                }

            }



            /* =================================================
               DISABLE TEAM SIZE CONTROLS
               ================================================= */

            if (decreaseTeam) {

                decreaseTeam.disabled =
                    true;

            }


            if (increaseTeam) {

                increaseTeam.disabled =
                    true;

            }



            /*
             * Team size is fixed by the event.
             * Therefore + / - should never change it.
             */

            if (isTeam && teamCount) {

                teamCount.textContent =
                    "2";

            }


            if (isIndividual && teamCount) {

                teamCount.textContent =
                    "1";

            }

        }



        /* =====================================================
           UPDATE TOTAL FEE
           ===================================================== */

        function updateTotalFee() {


            const total =
                participantCount *
                PRICE_PER_PERSON;


            /*
             * Team total element
             */

            if (teamTotal) {

                teamTotal.textContent =
                    "₹" + total;

            }


            /*
             * General selected total
             */

            if (selectedTotal) {

                selectedTotal.textContent =
                    "₹" + total;

            }

        }



        /* =====================================================
           PREVENT TEAM SIZE MANUAL CHANGES
           ===================================================== */

        if (decreaseTeam) {

            decreaseTeam.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    /*
                     * Do nothing because team size
                     * is fixed for every event.
                     */

                    updateParticipationUI();

                }
            );

        }



        if (increaseTeam) {

            increaseTeam.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    /*
                     * Do nothing because team size
                     * is fixed for every event.
                     */

                    updateParticipationUI();

                }
            );

        }



        /* =====================================================
           CONTINUE FROM PARTICIPATION
           ===================================================== */

        if (continueParticipation) {

            continueParticipation.addEventListener(
                "click",
                function (event) {


                    event.preventDefault();


                    /*
                     * Make absolutely sure the participant
                     * count matches the event rules.
                     */

                    if (
                        currentEvent.participation ===
                        "team"
                    ) {

                        selectedParticipation =
                            "team";

                        participantCount =
                            2;

                    }
                    else {

                        selectedParticipation =
                            "individual";

                        participantCount =
                            1;

                    }


                    /*
                     * Update the UI before moving forward.
                     */

                    updateParticipationUI();


                    /*
                     * Hide participation section.
                     */

                    const participationSection =
                        document.getElementById(
                            "participationSection"
                        );


                    if (participationSection) {

                        participationSection.hidden =
                            true;

                    }


                    /*
                     * Show participant section.
                     */

                    if (participantSection) {

                        participantSection.hidden =
                            false;

                    }


                    /*
                     * Move to participant details.
                     */

                    setProgressStep(2);


                    /*
                     * Generate the correct forms.
                     * This function will be created
                     * in MODULE 3.
                     */

                    if (
                        typeof generateParticipantForms ===
                        "function"
                    ) {

                        generateParticipantForms();

                    }


                    /*
                     * Scroll to participant section.
                     */

                    if (participantSection) {

                        participantSection.scrollIntoView({

                            behavior: "smooth",

                            block: "start"

                        });

                    }

                }
            );

        }



        /* =====================================================
           START MODULE 2
           ===================================================== */

        setupParticipationCards();
                /* =========================================================
           MODULE 3 — PARTICIPANT FORMS
           ========================================================= */


function generateParticipantForms() {

    if (!participantForms) {
        console.error(
            "Participant forms container not found."
        );

        return;
    }

    /*
     * Clear ONLY the dynamically generated
     * participant forms.
     *
     * The Team Name box already exists
     * in register.html, so we DO NOT create
     * another Team Name section here.
     */

    participantForms.innerHTML = "";

    /*
     * Generate participant forms.
     */

    for (
        let i = 1;
        i <= participantCount;
        i++
    ) {

        createParticipantForm(i);

    }

    /*
     * Update participant summary.
     */

    updateParticipantSummary();

}




        /* =====================================================
           CREATE PARTICIPANT FORM
           ===================================================== */

        function createParticipantForm(
            number
        ) {


            const wrapper =
                document.createElement("div");


            wrapper.className =
                "participant-card";


            wrapper.dataset.participant =
                number;



            /* =================================================
               ROLE INFORMATION
               ================================================= */

            let roleTitle;

            let roleDescription;

            let roleBadge;


            if (
                selectedParticipation ===
                "team"
            ) {


                if (number === 1) {

                    roleTitle =
                        "Team Leader";

                    roleDescription =
                        "Enter the details of the team leader.";

                    roleBadge =
                        "TEAM LEADER";

                }
                else {

                    roleTitle =
                        "Team Member";

                    roleDescription =
                        "Enter the details of the team member.";

                    roleBadge =
                        "TEAM MEMBER";

                }

            }
            else {

                roleTitle =
                    "Participant";

                roleDescription =
                    "Enter your participant information.";

                roleBadge =
                    "PARTICIPANT";

            }



            /* =================================================
               FORM HTML
               ================================================= */

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


                    <!-- NAME -->

                    <div
                        class="participant-field full"
                    >

                        <label
                            for="participantName${number}"
                        >
                            Full Name
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            id="participantName${number}"
                            name="participantName${number}"
                            placeholder="Enter full name"
                            autocomplete="name"
                        >

                        <small
                            class="field-error"
                            id="participantName${number}Error"
                        ></small>

                    </div>



                    <!-- COLLEGE -->

                    <div
                        class="participant-field full"
                    >

                        <label
                            for="participantCollege${number}"
                        >
                            College / Institution
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            id="participantCollege${number}"
                            name="participantCollege${number}"
                            placeholder="Enter college / institution"
                        >

                        <small
                            class="field-error"
                            id="participantCollege${number}Error"
                        ></small>

                    </div>



                    <!-- DEPARTMENT -->

                    <div
                        class="participant-field"
                    >

                        <label
                            for="participantDepartment${number}"
                        >
                            Department
                            <span>*</span>
                        </label>

                        <input
                            type="text"
                            id="participantDepartment${number}"
                            name="participantDepartment${number}"
                            placeholder="e.g. ECE"
                        >

                        <small
                            class="field-error"
                            id="participantDepartment${number}Error"
                        ></small>

                    </div>



                    <!-- YEAR -->

                    <div
                        class="participant-field"
                    >

                        <label
                            for="participantYear${number}"
                        >
                            Year
                            <span>*</span>
                        </label>

                        <select
                            id="participantYear${number}"
                            name="participantYear${number}"
                        >

                            <option value="">
                                Select Year
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



                    <!-- PHONE -->

                    <div
                        class="participant-field"
                    >

                        <label
                            for="participantPhone${number}"
                        >
                            Phone Number
                            <span>*</span>
                        </label>

                        <input
                            type="tel"
                            id="participantPhone${number}"
                            name="participantPhone${number}"
                            placeholder="10-digit mobile number"
                            maxlength="10"
                            inputmode="numeric"
                            autocomplete="tel"
                        >

                        <small
                            class="field-error"
                            id="participantPhone${number}Error"
                        ></small>

                    </div>



                    <!-- EMAIL -->

                    <div
                        class="participant-field"
                    >

                        <label
                            for="participantEmail${number}"
                        >
                            Email Address
                            <span>*</span>
                        </label>

                        <input
                            type="email"
                            id="participantEmail${number}"
                            name="participantEmail${number}"
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



            /* =================================================
               INPUT LISTENERS
               ================================================= */

            const fields =
                wrapper.querySelectorAll(
                    "input, select"
                );


            fields.forEach(
                function (field) {

                    field.addEventListener(
                        "input",
                        function () {

                            clearFieldError(
                                field
                            );

                        }
                    );


                    field.addEventListener(
                        "change",
                        function () {

                            clearFieldError(
                                field
                            );

                        }
                    );

                }
            );



            /* =================================================
               PHONE — NUMBERS ONLY
               ================================================= */

            const phoneInput =
                document.getElementById(
                    `participantPhone${number}`
                );


            if (phoneInput) {

                phoneInput.addEventListener(
                    "input",
                    function () {

                        phoneInput.value =
                            phoneInput.value
                                .replace(
                                    /\D/g,
                                    ""
                                )
                                .slice(
                                    0,
                                    10
                                );

                    }
                );

            }

        }



        /* =====================================================
           CLEAR FIELD ERROR
           ===================================================== */

        function clearFieldError(
            field
        ) {


            field.classList.remove(
                "error"
            );


            const errorElement =
                document.getElementById(
                    field.id + "Error"
                );


            if (errorElement) {

                errorElement.textContent =
                    "";

            }

        }



        /* =====================================================
           UPDATE PARTICIPANT SUMMARY
           ===================================================== */

        function updateParticipantSummary() {


            if (selectedType) {

                selectedType.textContent =
                    selectedParticipation ===
                    "team"
                        ? "Team"
                        : "Individual";

            }


            if (selectedCount) {

                selectedCount.textContent =
                    participantCount;

            }


            if (selectedTotal) {

                selectedTotal.textContent =
                    "₹" +
                    (
                        participantCount *
                        PRICE_PER_PERSON
                    );

            }

        }
                /* =========================================================
           MODULE 4 — VALIDATION
           ========================================================= */

function validateTeamName() {

    /*
     * CodeSprint is an individual event.
     * No team name is required.
     */

    if (
        selectedParticipation !==
        "team"
    ) {

        return true;

    }


    /*
     * Use the Team Name input
     * already present in register.html.
     */

    const teamNameField =
        document.getElementById(
            "teamName"
        );


    if (!teamNameField) {

        console.error(
            "Team Name field not found."
        );

        return false;

    }


    const teamName =
        teamNameField.value.trim();


    const errorElement =
        document.getElementById(
            "teamNameError"
        );


    /*
     * Empty team name
     */

    if (!teamName) {

        teamNameField.classList.add(
            "error"
        );

        if (errorElement) {

            errorElement.textContent =
                "Please enter a team name.";

        }

        return false;

    }


    /*
     * Minimum length
     */

    if (
        teamName.length < 2
    ) {

        teamNameField.classList.add(
            "error"
        );

        if (errorElement) {

            errorElement.textContent =
                "Team name must contain at least 2 characters.";

        }

        return false;

    }


    /*
     * Valid team name
     */

    teamNameField.classList.remove(
        "error"
    );

    if (errorElement) {

        errorElement.textContent =
            "";

    }


    return true;

}


        /* =====================================================
           VALIDATE EMAIL
           ===================================================== */

        function isValidEmail(
            email
        ) {


            const emailPattern =
                /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


            return emailPattern.test(
                email
            );

        }



        /* =====================================================
           VALIDATE PHONE
           ===================================================== */

        function isValidPhone(
            phone
        ) {


            /*
             * Indian 10-digit mobile number.
             */

            return /^[6-9]\d{9}$/.test(
                phone
            );

        }



        /* =====================================================
           VALIDATE SINGLE PARTICIPANT
           ===================================================== */

        function validateParticipant(
            number
        ) {


            let valid =
                true;



            /* =================================================
               NAME
               ================================================= */

            const name =
                document.getElementById(
                    `participantName${number}`
                );


            if (name) {

                const value =
                    name.value.trim();


                if (!value) {

                    showFieldError(
                        name,
                        "Please enter the participant's full name."
                    );

                    valid = false;

                }
                else if (
                    value.length < 2
                ) {

                    showFieldError(
                        name,
                        "Please enter a valid name."
                    );

                    valid = false;

                }

            }



            /* =================================================
               COLLEGE
               ================================================= */

            const college =
                document.getElementById(
                    `participantCollege${number}`
                );


            if (college) {

                const value =
                    college.value.trim();


                if (!value) {

                    showFieldError(
                        college,
                        "Please enter the college / institution name."
                    );

                    valid = false;

                }

            }



            /* =================================================
               DEPARTMENT
               ================================================= */

            const department =
                document.getElementById(
                    `participantDepartment${number}`
                );


            if (department) {

                const value =
                    department.value.trim();


                if (!value) {

                    showFieldError(
                        department,
                        "Please enter the department."
                    );

                    valid = false;

                }

            }



            /* =================================================
               YEAR
               ================================================= */

            const year =
                document.getElementById(
                    `participantYear${number}`
                );


            if (year) {

                const value =
                    year.value.trim();


                if (!value) {

                    showFieldError(
                        year,
                        "Please select the participant's year."
                    );

                    valid = false;

                }

            }



            /* =================================================
               PHONE
               ================================================= */

            const phone =
                document.getElementById(
                    `participantPhone${number}`
                );


            if (phone) {

                const value =
                    phone.value.trim();


                if (!value) {

                    showFieldError(
                        phone,
                        "Please enter a phone number."
                    );

                    valid = false;

                }
                else if (
                    !isValidPhone(value)
                ) {

                    showFieldError(
                        phone,
                        "Please enter a valid 10-digit mobile number."
                    );

                    valid = false;

                }

            }



            /* =================================================
               EMAIL
               ================================================= */

            const email =
                document.getElementById(
                    `participantEmail${number}`
                );


            if (email) {

                const value =
                    email.value.trim();


                if (!value) {

                    showFieldError(
                        email,
                        "Please enter an email address."
                    );

                    valid = false;

                }
                else if (
                    !isValidEmail(value)
                ) {

                    showFieldError(
                        email,
                        "Please enter a valid email address."
                    );

                    valid = false;

                }

            }



            return valid;

        }



        /* =====================================================
           SHOW FIELD ERROR
           ===================================================== */

        function showFieldError(
            field,
            message
        ) {


            if (!field) {
                return;
            }


            field.classList.add(
                "error"
            );


            const errorElement =
                document.getElementById(
                    field.id + "Error"
                );


            if (errorElement) {

                errorElement.textContent =
                    message;

            }

        }



        /* =====================================================
           VALIDATE ALL PARTICIPANTS
           ===================================================== */

        function validateAllParticipants() {


            let valid =
                true;



            /* =================================================
               CHECK PARTICIPANT COUNT
               ================================================= */

            if (
                selectedParticipation ===
                "team"
            ) {

                if (
                    participantCount !==
                    2
                ) {

                    alert(
                        "This event requires exactly 2 participants per team."
                    );

                    return false;

                }

            }
            else {

                if (
                    participantCount !==
                    1
                ) {

                    alert(
                        "This event allows only one participant."
                    );

                    return false;

                }

            }



            /* =================================================
               TEAM NAME
               ================================================= */

            if (
                selectedParticipation ===
                "team"
            ) {

                if (
                    !validateTeamName()
                ) {

                    valid = false;

                }

            }



            /* =================================================
               PARTICIPANT DETAILS
               ================================================= */

            for (
                let number = 1;
                number <= participantCount;
                number++
            ) {

                const participantValid =
                    validateParticipant(
                        number
                    );


                if (!participantValid) {

                    valid = false;

                }

            }



            return valid;

        }



        /* =====================================================
           CONTINUE TO REVIEW
           ===================================================== */

        if (continueToReview) {

            continueToReview.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    /*
                     * Validate everything before
                     * moving to the review page.
                     */

                    const valid =
                        validateAllParticipants();


                    if (!valid) {

                        alert(
                            "Please complete all participant details correctly."
                        );


                        /*
                         * Find the first invalid field.
                         */

                        const firstError =
                            participantForms
                                ? participantForms.querySelector(
                                    ".error"
                                )
                                : null;


                        if (firstError) {

                            firstError.scrollIntoView({

                                behavior:
                                    "smooth",

                                block:
                                    "center"

                            });

                        }


                        return;

                    }


                    /*
                     * All details are valid.
                     */

                    saveRegistrationData();


                    /*
                     * Hide participant section.
                     */

                    if (
                        participantSection
                    ) {

                        participantSection.hidden =
                            true;

                    }


                    /*
                     * Show review section.
                     */

                    if (
                        reviewSection
                    ) {

                        reviewSection.hidden =
                            false;

                    }


                    /*
                     * Move progress indicator
                     * to Step 3.
                     */

                    setProgressStep(3);


                    /*
                     * Generate review.
                     */

                    const registrationData =
                        buildRegistrationData();


                    showReview(
                        registrationData
                    );


                    /*
                     * Scroll to review.
                     */

                    if (
                        reviewSection
                    ) {

                        reviewSection.scrollIntoView({

                            behavior:
                                "smooth",

                            block:
                                "start"

                        });

                    }

                }
            );

        }
                /* =========================================================
           MODULE 5 — BUILD + SAVE REGISTRATION DATA
           ========================================================= */

function getTeamName() {

    /*
     * CodeSprint is individual.
     */

    if (
        selectedParticipation !==
        "team"
    ) {

        return "";

    }


    /*
     * Use the single Team Name
     * input from register.html.
     */

    const teamNameField =
        document.getElementById(
            "teamName"
        );


    if (teamNameField) {

        return teamNameField.value.trim();

    }


    return "";

}



        /* =====================================================
           GET PARTICIPANT DATA
           ===================================================== */

        function getParticipantData(
            number
        ) {


            const nameField =
                document.getElementById(
                    `participantName${number}`
                );


            const collegeField =
                document.getElementById(
                    `participantCollege${number}`
                );


            const departmentField =
                document.getElementById(
                    `participantDepartment${number}`
                );


            const yearField =
                document.getElementById(
                    `participantYear${number}`
                );


            const phoneField =
                document.getElementById(
                    `participantPhone${number}`
                );


            const emailField =
                document.getElementById(
                    `participantEmail${number}`
                );


            /*
             * Determine participant role.
             */

            let role =
                "Participant";


            if (
                selectedParticipation ===
                "team"
            ) {

                if (number === 1) {

                    role =
                        "Team Leader";

                }
                else {

                    role =
                        "Team Member";

                }

            }



            return {

                participantNumber:
                    number,

                role:
                    role,

                name:
                    nameField
                        ? nameField.value.trim()
                        : "",

                college:
                    collegeField
                        ? collegeField.value.trim()
                        : "",

                department:
                    departmentField
                        ? departmentField.value.trim()
                        : "",

                year:
                    yearField
                        ? yearField.value.trim()
                        : "",

                phone:
                    phoneField
                        ? phoneField.value.trim()
                        : "",

                email:
                    emailField
                        ? emailField.value.trim()
                        : ""

            };

        }



        /* =====================================================
           BUILD COMPLETE REGISTRATION DATA
           ===================================================== */

        function buildRegistrationData() {


            /*
             * Make sure the participant count
             * is correct before collecting data.
             */

            if (
                selectedParticipation ===
                "team"
            ) {

                participantCount =
                    2;

            }
            else {

                participantCount =
                    1;

            }



            /* =================================================
               COLLECT PARTICIPANTS
               ================================================= */

            const participants =
                [];


            for (
                let number = 1;
                number <= participantCount;
                number++
            ) {

                participants.push(
                    getParticipantData(
                        number
                    )
                );

            }



            /* =================================================
               CALCULATE TOTAL
               ================================================= */

            const totalAmount =
                participantCount *
                PRICE_PER_PERSON;



            /* =================================================
               COMPLETE DATA OBJECT
               ================================================= */

            const registrationData = {

                /* Event */

                eventId:
                    selectedEventId,
eventName:
    currentEvent.name,

eventDate:
    currentEvent.date,

eventTime:
    currentEvent.time,

eventVenue:
    currentEvent.venue,

                /* Participation */

                participation:
                    selectedParticipation,

                participantCount:
                    participantCount,


                /* Team */

                teamName:
                    getTeamName(),


                /* Participants */

                participants:
                    participants,


                /* Fee */

                feePerParticipant:
                    PRICE_PER_PERSON,

                totalAmount:
                    totalAmount,


                /* Registration time */

                createdAt:
                    new Date().toISOString()

            };


            return registrationData;

        }



        /* =====================================================
           SAVE REGISTRATION DATA
           ===================================================== */

        function saveRegistrationData() {


            /*
             * Build the latest data.
             */

            const registrationData =
                buildRegistrationData();


            /*
             * Save to localStorage.
             */

            localStorage.setItem(

                "sparkRegistration",

                JSON.stringify(
                    registrationData
                )

            );


            /*
             * Also keep the selected event
             * separately for easy access.
             */

            localStorage.setItem(

                "sparkEvent",

                selectedEventId

            );


            /*
             * Useful during development.
             */

            console.log(
                "Registration data saved:",
                registrationData
            );


            return registrationData;

        }



        /* =====================================================
           GET SAVED REGISTRATION
           ===================================================== */

        function getSavedRegistration() {


            const savedData =
                localStorage.getItem(
                    "sparkRegistration"
                );


            if (!savedData) {

                return null;

            }


            try {

                return JSON.parse(
                    savedData
                );

            }
            catch (error) {

                console.error(
                    "Unable to parse saved registration:",
                    error
                );


                return null;

            }

        }



        /* =====================================================
           UPDATE REGISTRATION SUMMARY
           ===================================================== */

        function updateRegistrationSummary() {


            const totalAmount =
                participantCount *
                PRICE_PER_PERSON;


            if (selectedType) {

                selectedType.textContent =
                    selectedParticipation ===
                    "team"
                        ? "Team"
                        : "Individual";

            }


            if (selectedCount) {

                selectedCount.textContent =
                    participantCount;

            }


            if (selectedTotal) {

                selectedTotal.textContent =
                    "₹" +
                    totalAmount;

            }

        }



        /* =====================================================
           UPDATE SUMMARY WHEN FORMS ARE GENERATED
           ===================================================== */

        updateRegistrationSummary();
                /* =========================================================
           MODULE 6 — REVIEW SECTION
           ========================================================= */


        /* =====================================================
           SHOW REVIEW
           ===================================================== */

        function showReview(data) {


            /* =================================================
               REVIEW OVERVIEW ELEMENTS
               ================================================= */

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


            const reviewTotalAmount =
                document.getElementById(
                    "reviewTotalAmount"
                );


            const reviewTotalPeople =
                document.getElementById(
                    "reviewTotalPeople"
                );


            const reviewGrandTotal =
                document.getElementById(
                    "reviewGrandTotal"
                );



            /* =================================================
               EVENT NAME
               ================================================= */

            if (reviewEventName) {

                reviewEventName.textContent =
                    data.eventName || "—";

            }



            /* =================================================
               EVENT DATE
               ================================================= */

            if (reviewEventDate) {

                reviewEventDate.textContent =
                    data.eventDate || "—";

            }



            /* =================================================
               EVENT TIME
               ================================================= */

            if (reviewEventTime) {

                reviewEventTime.textContent =
                    data.eventTime || "—";

            }
            if (reviewEventVenue) {

    reviewEventVenue.textContent =
        data.eventVenue ||
        "Sathyabama Institute of Science and Technology";

}



            /* =================================================
               PARTICIPATION TYPE
               ================================================= */

            if (reviewParticipation) {

                reviewParticipation.textContent =

                    data.participation === "team"

                        ? "Team"

                        : "Individual";

            }



            /* =================================================
               PARTICIPANT COUNT
               ================================================= */

            if (reviewParticipantCount) {

                reviewParticipantCount.textContent =
                    data.participantCount;

            }



            /* =================================================
               TEAM NAME
               ================================================= */

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
                        data.teamName || "—";

                }

            }

            else {


                /*
                 * CodeSprint:
                 * no team name.
                 */

                if (reviewTeamNameBox) {

                    reviewTeamNameBox.hidden =
                        true;

                }

            }



            /* =================================================
               TOTAL AMOUNT
               ================================================= */

            if (reviewTotalAmount) {

                reviewTotalAmount.textContent =
                    "₹" +
                    data.totalAmount;

            }


            if (reviewTotalPeople) {

                reviewTotalPeople.textContent =
                    data.participantCount;

            }


            if (reviewGrandTotal) {

                reviewGrandTotal.textContent =
                    "₹" +
                    data.totalAmount;

            }



            /* =================================================
               PARTICIPANT REVIEW CARDS
               ================================================= */

            const reviewParticipants =
                document.getElementById(
                    "reviewParticipants"
                );


            if (!reviewParticipants) {

                return;

            }


            /*
             * Remove old cards.
             */

            reviewParticipants.innerHTML = "";



            /* =================================================
               CREATE REVIEW CARD FOR EACH PARTICIPANT
               ================================================= */

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



                    /* =========================================
                       ROLE
                       ========================================= */

                    let roleText =
                        "PARTICIPANT";


                    if (
                        data.participation ===
                        "team"
                    ) {

                        if (
                            index === 0
                        ) {

                            roleText =
                                "TEAM LEADER";

                        }
                        else {

                            roleText =
                                "TEAM MEMBER";

                        }

                    }



                    /* =========================================
                       CARD HTML
                       ========================================= */

                    card.innerHTML = `

                        <!-- NUMBER -->

                        <div class="review-number">

                            ${String(
                                index + 1
                            ).padStart(2, "0")}

                        </div>



                        <!-- INFORMATION -->

                        <div class="review-info">


                            <div
                                class="review-info-header"
                            >

                                <div>

                                    <span
                                        class="review-role"
                                    >
                                        ${roleText}
                                    </span>

                                    <h4>
                                        ${escapeHTML(
                                            participant.name
                                        )}
                                    </h4>

                                </div>


                                <span
                                    class="review-status"
                                >
                                    ✓ Details Added
                                </span>

                            </div>



                            <div
                                class="review-details"
                            >


                                <!-- COLLEGE -->

                                <div
                                    class="review-detail full"
                                >

                                    <label>
                                        College / Institution
                                    </label>

                                    <strong>
                                        ${escapeHTML(
                                            participant.college
                                        )}
                                    </strong>

                                </div>



                                <!-- DEPARTMENT -->

                                <div
                                    class="review-detail"
                                >

                                    <label>
                                        Department
                                    </label>

                                    <strong>
                                        ${escapeHTML(
                                            participant.department
                                        )}
                                    </strong>

                                </div>



                                <!-- YEAR -->

                                <div
                                    class="review-detail"
                                >

                                    <label>
                                        Year
                                    </label>

                                    <strong>
                                        ${escapeHTML(
                                            participant.year
                                        )}
                                    </strong>

                                </div>



                                <!-- PHONE -->

                                <div
                                    class="review-detail"
                                >

                                    <label>
                                        Phone
                                    </label>

                                    <strong>
                                        ${escapeHTML(
                                            participant.phone
                                        )}
                                    </strong>

                                </div>



                                <!-- EMAIL -->

                                <div
                                    class="review-detail"
                                >

                                    <label>
                                        Email
                                    </label>

                                    <strong>
                                        ${escapeHTML(
                                            participant.email
                                        )}
                                    </strong>

                                </div>


                            </div>

                        </div>

                    `;


                    reviewParticipants.appendChild(
                        card
                    );

                }
            );

        }



        /* =====================================================
           ESCAPE HTML
           ===================================================== */

        function escapeHTML(
            value
        ) {


            const div =
                document.createElement(
                    "div"
                );


            div.textContent =
                value ?? "";


            return div.innerHTML;

        }



        /* =====================================================
           EDIT PARTICIPANT DETAILS
           ===================================================== */

        const editDetails =
            document.getElementById(
                "editDetails"
            );


        const editParticipantDetails =
            document.getElementById(
                "editParticipantDetails"
            );


        /*
         * Support either ID in case your HTML
         * uses one of these names.
         */

        const editButton =
            editDetails ||
            editParticipantDetails;



        if (editButton) {

            editButton.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    /* =========================================
                       HIDE REVIEW
                       ========================================= */

                    if (reviewSection) {

                        reviewSection.hidden =
                            true;

                    }


                    /* =========================================
                       SHOW PARTICIPANTS
                       ========================================= */

                    if (
                        participantSection
                    ) {

                        participantSection.hidden =
                            false;

                    }


                    /* =========================================
                       REBUILD PARTICIPANT FORMS
                       ========================================= */

                    generateParticipantForms();


                    /*
                     * The form is regenerated above.
                     * Existing saved values are restored below.
                     */

                    restoreParticipantData();



                    /* =========================================
                       PROGRESS → STEP 2
                       ========================================= */

                    setProgressStep(2);



                    /* =========================================
                       SCROLL
                       ========================================= */

                    if (
                        participantSection
                    ) {

                        participantSection.scrollIntoView({

                            behavior:
                                "smooth",

                            block:
                                "start"

                        });

                    }

                }
            );

        }



        /* =====================================================
           RESTORE PARTICIPANT DATA
           ===================================================== */

        function restoreParticipantData() {


            const savedData =
                getSavedRegistration();


            if (!savedData) {

                return;

            }



            /* =================================================
               RESTORE TEAM NAME
               ================================================= */

            if (
                savedData.participation ===
                "team"
            ) {

const teamNameField =
    document.getElementById(
        "teamName"
    );

                if (
                    teamNameField &&
                    savedData.teamName
                ) {

                    teamNameField.value =
                        savedData.teamName;

                }

            }



            /* =================================================
               RESTORE PARTICIPANTS
               ================================================= */

            if (
                !Array.isArray(
                    savedData.participants
                )
            ) {

                return;

            }


            savedData.participants.forEach(
                function (
                    participant,
                    index
                ) {


                    const number =
                        index + 1;


                    const name =
                        document.getElementById(
                            `participantName${number}`
                        );


                    const college =
                        document.getElementById(
                            `participantCollege${number}`
                        );


                    const department =
                        document.getElementById(
                            `participantDepartment${number}`
                        );


                    const year =
                        document.getElementById(
                            `participantYear${number}`
                        );


                    const phone =
                        document.getElementById(
                            `participantPhone${number}`
                        );


                    const email =
                        document.getElementById(
                            `participantEmail${number}`
                        );



                    if (name) {

                        name.value =
                            participant.name || "";

                    }


                    if (college) {

                        college.value =
                            participant.college || "";

                    }


                    if (department) {

                        department.value =
                            participant.department || "";

                    }


                    if (year) {

                        year.value =
                            participant.year || "";

                    }


                    if (phone) {

                        phone.value =
                            participant.phone || "";

                    }


                    if (email) {

                        email.value =
                            participant.email || "";

                    }

                }
            );

        }



        /* =====================================================
           BACK TO PARTICIPANT DETAILS
           ===================================================== */

        if (backToParticipants) {

            backToParticipants.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    if (reviewSection) {

                        reviewSection.hidden =
                            true;

                    }


                    if (
                        participantSection
                    ) {

                        participantSection.hidden =
                            false;

                    }


                    generateParticipantForms();


                    restoreParticipantData();


                    setProgressStep(2);


                    if (
                        participantSection
                    ) {

                        participantSection.scrollIntoView({

                            behavior:
                                "smooth",

                            block:
                                "start"

                        });

                    }

                }
            );

        }



        /* =====================================================
           SAVE + SHOW REVIEW HELPER
           ===================================================== */

        function saveAndShowReview() {


            const registrationData =
                saveRegistrationData();


            showReview(
                registrationData
            );


            return registrationData;

        }
                /* =========================================================
           MODULE 7 — CONTINUE TO PAYMENT
           ========================================================= */


        /* =====================================================
           CONTINUE TO PAYMENT BUTTON
           ===================================================== */

        if (continueToPayment) {

            continueToPayment.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();

                    event.stopPropagation();



                    /* =========================================
                       GET SAVED REGISTRATION
                       ========================================= */

                    const savedData =
                        localStorage.getItem(
                            "sparkRegistration"
                        );


                    /*
                     * Registration must exist.
                     */

                    if (!savedData) {

                        alert(
                            "Registration details are missing. Please complete the participant details first."
                        );

                        return;

                    }



                    /* =========================================
                       PARSE REGISTRATION
                       ========================================= */

                    let registrationData;


                    try {

                        registrationData =
                            JSON.parse(
                                savedData
                            );

                    }
                    catch (error) {

                        console.error(
                            "Registration data error:",
                            error
                        );


                        alert(
                            "Unable to load registration details. Please try again."
                        );

                        return;

                    }



                    /* =========================================
                       VERIFY EVENT
                       ========================================= */

                    if (
                        !registrationData.eventId ||
                        !registrationData.eventName
                    ) {

                        alert(
                            "Event information is missing. Please restart the registration."
                        );

                        return;

                    }



                    /* =========================================
                       VERIFY PARTICIPATION TYPE
                       ========================================= */

                    const expectedParticipation =
                        currentEvent.participation;


                    if (
                        registrationData.participation !==
                        expectedParticipation
                    ) {

                        alert(
                            "Registration type does not match this event. Please check your registration."
                        );

                        return;

                    }



                    /* =========================================
                       VERIFY PARTICIPANT COUNT
                       ========================================= */

                    const expectedCount =
                        currentEvent.participantCount;


                    if (
                        registrationData.participantCount !==
                        expectedCount
                    ) {

                        alert(

                            expectedParticipation ===
                            "team"

                                ? "This event requires exactly 2 participants."

                                : "This event allows only 1 participant."

                        );

                        return;

                    }



                    /* =========================================
                       VERIFY TOTAL AMOUNT
                       ========================================= */

                    const expectedAmount =
                        expectedCount *
                        PRICE_PER_PERSON;


                    if (
                        registrationData.totalAmount !==
                        expectedAmount
                    ) {

                        alert(
                            "The registration amount is incorrect. Please return to the participant details."
                        );

                        return;

                    }



                    /* =========================================
                       VERIFY PARTICIPANTS
                       ========================================= */

                    if (
                        !Array.isArray(
                            registrationData.participants
                        ) ||
                        registrationData.participants.length !==
                            expectedCount
                    ) {

                        alert(
                            "Participant information is incomplete. Please check the participant details."
                        );

                        return;

                    }



                    /* =========================================
                       VERIFY TEAM NAME
                       ========================================= */

                    if (
                        expectedParticipation ===
                        "team"
                    ) {

                        if (
                            !registrationData.teamName ||
                            !registrationData.teamName.trim()
                        ) {

                            alert(
                                "Please enter your team name before continuing to payment."
                            );

                            return;

                        }

                    }



                    /* =========================================
                       LOG DATA
                       ========================================= */

                    console.log(
                        "Proceeding to payment:",
                        registrationData
                    );



                    /* =========================================
                       SAVE AGAIN
                       ========================================= */

                    localStorage.setItem(

                        "sparkRegistration",

                        JSON.stringify(
                            registrationData
                        )

                    );



                    /* =========================================
                       HIDE REVIEW
                       ========================================= */

                    if (reviewSection) {

                        reviewSection.hidden =
                            true;

                    }



                    /* =========================================
                       SHOW PAYMENT
                       ========================================= */

                    if (paymentSection) {

                        paymentSection.hidden =
                            false;

                    }
                    else {

                        /*
                         * Payment section is not available.
                         */

                        alert(
                            "Payment section is not added yet."
                        );


                        if (reviewSection) {

                            reviewSection.hidden =
                                false;

                        }


                        return;

                    }



                    /* =========================================
                       UPDATE PAYMENT INFORMATION
                       ========================================= */

                    updatePaymentInformation(
                        registrationData
                    );



                    /* =========================================
                       PROGRESS → STEP 4
                       ========================================= */

                    setProgressStep(4);



                    /* =========================================
                       SCROLL TO PAYMENT
                       ========================================= */

                    paymentSection.scrollIntoView({

                        behavior:
                            "smooth",

                        block:
                            "start"

                    });

                }
            );

        }



        /* =====================================================
           UPDATE PAYMENT INFORMATION
           ===================================================== */

        function updatePaymentInformation(
            data
        ) {


            const paymentEventName =
                document.getElementById(
                    "paymentEventName"
                );


            const paymentParticipantCount =
                document.getElementById(
                    "paymentParticipantCount"
                );


            const paymentAmount =
                document.getElementById(
                    "paymentAmount"
                );


            const paymentTotal =
                document.getElementById(
                    "paymentTotal"
                );


            const paymentTeamName =
                document.getElementById(
                    "paymentTeamName"
                );


            const paymentParticipation =
                document.getElementById(
                    "paymentParticipation"
                );



            /* =========================================
               EVENT
               ========================================= */

            if (paymentEventName) {

                paymentEventName.textContent =
                    data.eventName;

            }



            /* =========================================
               PARTICIPATION
               ========================================= */

            if (paymentParticipation) {

                paymentParticipation.textContent =

                    data.participation ===
                    "team"

                        ? "Team — 2 Participants"

                        : "Individual — 1 Participant";

            }



            /* =========================================
               PARTICIPANT COUNT
               ========================================= */

            if (paymentParticipantCount) {

                paymentParticipantCount.textContent =
                    data.participantCount;

            }



            /* =========================================
               TEAM NAME
               ========================================= */

            if (paymentTeamName) {

                if (
                    data.participation ===
                    "team"
                ) {

                    paymentTeamName.textContent =
                        data.teamName;

                    paymentTeamName.parentElement.hidden =
                        false;

                }
                else {

                    paymentTeamName.textContent =
                        "";

                    paymentTeamName.parentElement.hidden =
                        true;

                }

            }



            /* =========================================
               AMOUNT PER PERSON
               ========================================= */

            if (paymentAmount) {

                paymentAmount.textContent =
                    "₹" +
                    data.feePerParticipant;

            }



            /* =========================================
               TOTAL
               ========================================= */

            if (paymentTotal) {

                paymentTotal.textContent =
                    "₹" +
                    data.totalAmount;

            }

        }



        /* =====================================================
           BACK TO REVIEW FROM PAYMENT
           ===================================================== */

        if (backToReview) {

            backToReview.addEventListener(
                "click",
                function (event) {

                    event.preventDefault();


                    /*
                     * Hide payment.
                     */

                    if (paymentSection) {

                        paymentSection.hidden =
                            true;

                    }


                    /*
                     * Show review.
                     */

                    if (reviewSection) {

                        reviewSection.hidden =
                            false;

                    }


                    /*
                     * Reload saved registration.
                     */

                    const savedData =
                        getSavedRegistration();


                    if (savedData) {

                        showReview(
                            savedData
                        );

                    }


                    /*
                     * Progress → Step 3.
                     */

                    setProgressStep(3);


                    /*
                     * Scroll.
                     */

                    if (reviewSection) {

                        reviewSection.scrollIntoView({

                            behavior:
                                "smooth",

                            block:
                                "start"

                        });

                    }

                }
            );

        }
 /* =========================================================
   MODULE 8 — RAZORPAY PAYMENT + SUCCESS
   ========================================================= */


/* =====================================================
   COMPLETE PAYMENT BUTTON
   ===================================================== */

if (completePayment) {

    completePayment.addEventListener(
        "click",
        async function (event) {

            event.preventDefault();


            /* =================================================
               1. GET SAVED REGISTRATION
               ================================================= */

            const registration =
                getSavedRegistration();


            if (!registration) {

                alert(
                    "Registration details are missing. Please complete the registration again."
                );

                return;
            }


            /* =================================================
               2. VERIFY REGISTRATION DATA
               ================================================= */

            if (
                !registration.eventId ||
                !registration.eventName ||
                !registration.participants ||
                !registration.participants.length
            ) {

                alert(
                    "Registration information is incomplete."
                );

                return;
            }


            /* =================================================
               3. VERIFY EVENT
               ================================================= */

            if (
                registration.eventId !==
                selectedEventId
            ) {

                alert(
                    "Event verification failed."
                );

                return;
            }


            /* =================================================
               4. VERIFY PARTICIPATION TYPE
               ================================================= */

            if (
                registration.participation !==
                currentEvent.participation
            ) {

                alert(
                    "The participation type does not match this event."
                );

                return;
            }


            /* =================================================
               5. VERIFY PARTICIPANT COUNT
               ================================================= */

            if (
                registration.participantCount !==
                currentEvent.participantCount
            ) {

                alert(
                    "The number of participants does not match the event requirements."
                );

                return;
            }


            /* =================================================
               6. CALCULATE EXPECTED PAYMENT
               ================================================= */

            const expectedPayment =
                currentEvent.participantCount *
                PRICE_PER_PERSON;


            /* =================================================
               7. VERIFY PAYMENT AMOUNT
               ================================================= */

            if (
                Number(registration.totalAmount) !==
                Number(expectedPayment)
            ) {

                alert(
                    "The payment amount is incorrect."
                );

                return;
            }


            /* =================================================
               8. CHECK RAZORPAY SDK
               ================================================= */

            if (
                typeof Razorpay ===
                "undefined"
            ) {

                alert(
                    "Razorpay Checkout could not be loaded. Please check your internet connection and refresh the page."
                );

                return;
            }


            /* =================================================
               9. DISABLE BUTTON
               ================================================= */

            completePayment.disabled =
                true;


            const originalButtonText =
                completePayment.innerHTML;


            completePayment.innerHTML =
                "Opening Payment...";


            try {


                /* =================================================
                   10. CREATE RAZORPAY ORDER
                   ================================================= */

                const orderResponse =
                    await fetch(
                        "http://localhost:3000/api/create-order",
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json"
                            },

                            body:
                                JSON.stringify({
                                    eventId:
                                        registration.eventId
                                })
                        }
                    );


                /* =================================================
                   11. READ SERVER RESPONSE
                   ================================================= */

                const orderData =
                    await orderResponse.json();


                console.log(
                    "Razorpay order response:",
                    orderData
                );


                /* =================================================
                   12. CHECK ORDER CREATION
                   ================================================= */

                if (
                    !orderResponse.ok ||
                    !orderData.success
                ) {

                    throw new Error(
                        orderData.message ||
                        "Unable to create Razorpay order."
                    );
                }


                /* =================================================
                   13. RAZORPAY CHECKOUT OPTIONS
                   ================================================= */

                const options = {

                    key:
                        orderData.keyId,


                    amount:
                        orderData.amount,


                    currency:
                        orderData.currency,


                    name:
                        "SPARK 2026",


                    description:
                        `${orderData.event} Registration`,


                    order_id:
                        orderData.orderId,


                    prefill: {

                        name:
                            registration
                                .participants[0]
                                ?.name || "",


                        email:
                            registration
                                .participants[0]
                                ?.email || "",


                        contact:
                            registration
                                .participants[0]
                                ?.phone || ""

                    },


                    theme: {

                        color:
                            "#1565C0"

                    },


                    /* =================================================
                       14. PAYMENT SUCCESS HANDLER
                       ================================================= */

                    handler:
                        async function (response) {

                            try {

                                console.log(
                                    "Razorpay payment response:",
                                    response
                                );


                                completePayment.innerHTML =
                                    "Verifying Payment...";


                                /* =========================================
                                   VERIFY PAYMENT ON SERVER
                                   ========================================= */

                                const verifyResponse =
                                    await fetch(
                                        "http://localhost:3000/api/verify-payment",
                                        {
                                            method: "POST",

                                            headers: {
                                                "Content-Type":
                                                    "application/json"
                                            },

                                            body:
                                                JSON.stringify({

                                                    razorpay_order_id:
                                                        response
                                                            .razorpay_order_id,


                                                    razorpay_payment_id:
                                                        response
                                                            .razorpay_payment_id,


                                                    razorpay_signature:
                                                        response
                                                            .razorpay_signature,


                                                    eventId:
                                                        registration.eventId,


                                                    registration:
                                                        registration

                                                })
                                        }
                                    );


                                /* =========================================
                                   READ VERIFICATION RESPONSE
                                   ========================================= */

                                const verifyData =
                                    await verifyResponse.json();


                                console.log(
                                    "Payment verification response:",
                                    verifyData
                                );


                                /* =========================================
                                   CHECK VERIFICATION
                                   ========================================= */

                                if (
                                    !verifyResponse.ok ||
                                    !verifyData.success
                                ) {

                                    throw new Error(
                                        verifyData.message ||
                                        "Payment verification failed."
                                    );
                                }


                                /* =========================================
                                   PAYMENT VERIFIED
                                   ========================================= */

                                registration.paymentStatus =
                                    "completed";


                                registration.paymentAmount =
                                    expectedPayment;


                                registration.paymentDate =
                                    new Date().toISOString();


                                registration.paymentId =
                                    response
                                        .razorpay_payment_id;


                                registration.orderId =
                                    response
                                        .razorpay_order_id;


                                /* =========================================
                                   GENERATE REGISTRATION ID
                                   ========================================= */

                                registration.registrationId =
                                    generateRegistrationId();


                                /* =========================================
                                   SAVE FINAL REGISTRATION
                                   ========================================= */

                                localStorage.setItem(
                                    "sparkRegistration",
                                    JSON.stringify(
                                        registration
                                    )
                                );


                                /* =========================================
                                   SHOW SUCCESS
                                   ========================================= */

                                showRegistrationSuccess(
                                    registration
                                );

                            }


                            catch (error) {

                                console.error(
                                    "Payment verification error:",
                                    error
                                );


                                alert(
                                    error.message ||
                                    "Payment verification failed. Please contact the event coordinator."
                                );


                                completePayment.disabled =
                                    false;


                                completePayment.innerHTML =
                                    originalButtonText;

                            }

                        },


                    /* =================================================
                       15. USER CLOSES RAZORPAY
                       ================================================= */

                    modal: {

                        ondismiss:
                            function () {

                                completePayment.disabled =
                                    false;


                                completePayment.innerHTML =
                                    originalButtonText;

                            }

                    }

                };


                /* =================================================
                   16. CREATE RAZORPAY INSTANCE
                   ================================================= */

                const razorpayCheckout =
                    new Razorpay(
                        options
                    );


                /* =================================================
                   17. PAYMENT FAILED
                   ================================================= */

                razorpayCheckout.on(
                    "payment.failed",
                    function (response) {

                        console.error(
                            "Razorpay payment failed:",
                            response.error
                        );


                        alert(
                            "Payment failed. Please try again."
                        );


                        completePayment.disabled =
                            false;


                        completePayment.innerHTML =
                            originalButtonText;

                    }
                );


                /* =================================================
                   18. OPEN RAZORPAY
                   ================================================= */

                console.log(
                    "Opening Razorpay Checkout..."
                );


                razorpayCheckout.open();

            }


            catch (error) {

                console.error(
                    "Razorpay error:",
                    error
                );


                alert(
                    error.message ||
                    "Unable to start payment. Please try again."
                );


                completePayment.disabled =
                    false;


                completePayment.innerHTML =
                    originalButtonText;

            }

        }

    );

}



        /* =====================================================
           GENERATE REGISTRATION ID
           ===================================================== */

        function generateRegistrationId() {


            const eventPrefix =

                currentEvent.name
                    .replace(
                        /[^A-Za-z]/g,
                        ""
                    )
                    .substring(
                        0,
                        4
                    )
                    .toUpperCase();


            const randomNumber =
                Math.floor(
                    100000 +
                    Math.random() * 900000
                );


            return (
                "SPARK-" +
                eventPrefix +
                "-" +
                randomNumber
            );

        }



        /* =====================================================
           SHOW REGISTRATION SUCCESS
           ===================================================== */

        function showRegistrationSuccess(
            registration
        ) {


            /*
             * Hide payment.
             */

            if (paymentSection) {

                paymentSection.hidden =
                    true;

            }



            /*
             * Find success section.
             */

            const successSection =
                document.getElementById(
                    "successSection"
                );


            if (!successSection) {

                /*
                 * If your HTML doesn't have a
                 * success section yet, show a
                 * simple success message.
                 */

                alert(
                    "Registration completed successfully!\n\nRegistration ID: " +
                    registration.registrationId
                );


                return;

            }



            /*
             * Show success section.
             */

            successSection.hidden =
                false;



            /* =================================================
               SUCCESS INFORMATION
               ================================================= */

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


            const successAmount =
                document.getElementById(
                    "successAmount"
                );


            const successTeamName =
                document.getElementById(
                    "successTeamName"
                );



            if (successRegistrationId) {

                successRegistrationId.textContent =
                    registration.registrationId;

            }


            if (successEventName) {

                successEventName.textContent =
                    registration.eventName;

            }


            if (successParticipantCount) {

                successParticipantCount.textContent =
                    registration.participantCount;

            }


            if (successAmount) {

                successAmount.textContent =
                    "₹" +
                    registration.totalAmount;

            }


            if (successTeamName) {

                if (
                    registration.participation ===
                    "team"
                ) {

                    successTeamName.textContent =
                        registration.teamName;

                    successTeamName.parentElement.hidden =
                        false;

                }
                else {

                    successTeamName.textContent =
                        "";

                    successTeamName.parentElement.hidden =
                        true;

                }

            }



            /* =================================================
               PROGRESS
               ================================================= */

            setProgressStep(5);



            /* =================================================
               SCROLL
               ================================================= */

            successSection.scrollIntoView({

                behavior:
                    "smooth",

                block:
                    "start"

            });

        }



        /* =====================================================
           PROGRESS STEP HANDLER
           ===================================================== */

        function setProgressStep(
            step
        ) {


            /*
             * Find all progress steps.
             *
             * This supports common class names:
             * .progress-step
             * .step
             */

            const progressSteps =
                document.querySelectorAll(
                    ".progress-step, .step"
                );


            progressSteps.forEach(
                function (
                    progressStep,
                    index
                ) {


                    const stepNumber =
                        index + 1;


                    progressStep.classList
                        .remove(
                            "active",
                            "completed"
                        );


                    /*
                     * Current step
                     */

                    if (
                        stepNumber ===
                        step
                    ) {

                        progressStep.classList
                            .add(
                                "active"
                            );

                    }


                    /*
                     * Completed steps
                     */

                    if (
                        stepNumber <
                        step
                    ) {

                        progressStep.classList
                            .add(
                                "completed"
                            );

                    }

                }
            );



            /*
             * Also support elements that have
             * data-step attributes.
             */

            const dataSteps =
                document.querySelectorAll(
                    "[data-step]"
                );


            dataSteps.forEach(
                function (
                    element
                ) {


                    const elementStep =
                        Number(
                            element.dataset.step
                        );


                    element.classList
                        .remove(
                            "active",
                            "completed"
                        );


                    if (
                        elementStep ===
                        step
                    ) {

                        element.classList
                            .add(
                                "active"
                            );

                    }


                    if (
                        elementStep <
                        step
                    ) {

                        element.classList
                            .add(
                                "completed"
                            );

                    }

                }
            );

        }



        /* =====================================================
           INITIALIZE PAGE
           ===================================================== */

        function initializeRegistration() {


            /*
             * Make sure the correct participation
             * type is selected.
             */

            selectedParticipation =
                currentEvent.participation;


            /*
             * Make sure the correct number
             * of participants is selected.
             */

            participantCount =
                currentEvent.participantCount;



            /*
             * Update participation UI.
             */

            updateParticipationUI();



            /*
             * Update summary.
             */

            updateRegistrationSummary();



            /*
             * Start at Step 1.
             */

            setProgressStep(1);



            /*
             * Hide later sections.
             */

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


            const successSection =
                document.getElementById(
                    "successSection"
                );


            if (successSection) {

                successSection.hidden =
                    true;

            }



            /*
             * Show participation section.
             */

            const participationSection =
                document.getElementById(
                    "participationSection"
                );


            if (participationSection) {

                participationSection.hidden =
                    false;

            }


            /*
             * Log configuration during development.
             */

            console.log(
                "SPARK 2026 Registration initialized:",
                {
                    event:
                        currentEvent.name,

                    eventId:
                        selectedEventId,

                    participation:
                        selectedParticipation,

                    participantCount:
                        participantCount,

                    totalFee:
                        participantCount *
                        PRICE_PER_PERSON
                }
            );

        }



        /* =====================================================
           START REGISTRATION
           ===================================================== */

        initializeRegistration();


    }
);
