// ============================================================
// GET EVENT NAME FROM URL
// ============================================================

const params =
    new URLSearchParams(window.location.search);

const eventId =
    params.get("event");


// ============================================================
// ALL EVENT DATA
// ============================================================

const events = {

    // ========================================================
    // IDEA FORGE
    // ========================================================

    ideaforge: {

        title:
            "iDeaForge",

        subtitle:
            "National Idea Pitching Competition",

        about:
            "Participants are required to present an innovative idea based on a recent engineering or technology theme. The competition focuses on transforming creative ideas into impactful solutions through effective presentation.",

        participation:
            "Team — Exactly 2 participants per team",

        fee:
            "₹200 / Participant",

        totalFee:
            "₹400 / Team",

        venue:
            "Sathyabama Institute of Science & Technology",

        date:
            "22 September 2026",

        time:
            "10:00 AM – 12:30 PM",

        // ----------------------------------------------------
        // FACULTY COORDINATORS
        // ----------------------------------------------------

        facultyCoordinators: [
            "Dr. Bhuvaneswari A J",
            "Ms. Caroline Priyanka"
        ],

        // ----------------------------------------------------
        // STUDENT ORGANISERS
        // ----------------------------------------------------

        studentOrganisers: [
            "Ms. Nitheesha K",
            "Ms. Kanagadurga",
            "Ms. Akzhara B S",
            "Mr. Mothil D",
            "Ms. Suganya S"
        ],

        // ----------------------------------------------------
        // FOCUS AREAS
        // ----------------------------------------------------

        focusTitle:
            "Focus Areas",

        focusAreas: [
            "Semiconductor Technology & VLSI",
            "Artificial Intelligence & Generative AI",
            "Quantum Computing",
            "Signal & Image Processing",
            "Internet of Things (IoT)",
            "Cybersecurity",
            "Robotics & Automation",
            "Programming & Computational Technologies",
            "Data Science & Machine Learning",
            "Renewable & Sustainable Engineering"
        ],

        rules: [

            "Team size: Exactly 2 participants per team.",

            "Both team members must register for the event.",

            "Each participant must pay a registration fee of ₹200.",

            "Participants must present an innovative idea based on a recent engineering or technology theme.",

            "Original ideas only.",

            "Judges' decision is final."

        ]

    },


    // ========================================================
    // CIRCUIT CLASH
    // ========================================================

    circuitclash: {

        title:
            "Circuit Clash",

        subtitle:
            "Electronic Hardware Troubleshooting Challenge",

        about:
            "Participants will identify, analyze, and troubleshoot electronic circuit faults through practical problem-solving tasks.",

        participation:
            "Team — Exactly 2 participants per team",

        fee:
            "₹200 / Participant",

        totalFee:
            "₹400 / Team",

        venue:
            "Sathyabama Institute of Science & Technology",

        date:
            "22 September 2026",

        time:
            "1:00 PM – 3:00 PM",

        // ----------------------------------------------------
        // FACULTY COORDINATORS
        // ----------------------------------------------------

        facultyCoordinators: [
            "Mr. Arunbalaji S",
            "Ms. Jeba Nimsiya N"
        ],

        // ----------------------------------------------------
        // STUDENT ORGANISERS
        // ----------------------------------------------------

        studentOrganisers: [
            "Ms. Poojashri",
            "Ms. Panchami",
            "Ms. Nivedha",
            "Ms. Janani",
            "Mr. Thanigaivel.V"
        ],

        // ----------------------------------------------------
        // FOCUS AREAS
        // ----------------------------------------------------

        focusTitle:
            "Focus Areas",

        focusAreas: [
            "Basic Electronic Circuits",
            "Analog & Digital Electronics",
            "Semiconductor Devices",
            "Digital Logic & Combinational Circuits",
            "Sequential Circuits",
            "Sensors & Signal Conditioning",
            "Circuit Analysis",
            "Fault Detection & Troubleshooting"
        ],

        rules: [

            "Team size: Exactly 2 participants per team.",

            "Both team members must register for the event.",

            "Each participant must pay a registration fee of ₹200.",

            "Teams must work together throughout the challenge.",

            "Participants will identify, analyze, and troubleshoot electronic circuit faults.",

            "Fault detection and troubleshooting will be evaluated.",

            "Judges' decision is final."

        ]

    },


    // ========================================================
    // IQUEST
    // ========================================================

    iqquest: {

        title:
            "iQuest",

        subtitle:
            "National Technical Quiz Challenge",

        about:
            "A technical quiz challenge testing participants' knowledge of emerging technologies, engineering concepts, and current technological developments.",

        participation:
            "Team — Exactly 2 participants per team",

        fee:
            "₹200 / Participant",

        totalFee:
            "₹400 / Team",

        venue:
            "Sathyabama Institute of Science & Technology",

        date:
            "23 September 2026",

        // UPDATED TIME
        time:
            "1:00 PM – 3:00 PM",

        // ----------------------------------------------------
        // FACULTY COORDINATORS
        // ----------------------------------------------------

        facultyCoordinators: [
            "Ms. Imaya S",
            "Ms. Mohanapriya G"
        ],

        // ----------------------------------------------------
        // STUDENT ORGANISERS
        // ----------------------------------------------------

        studentOrganisers: [
            "Ms. Poojasri",
            "Ms. Panchami",
            "Ms. Sanjana",
            "Mr. Srinivas Hari",
            "Ms. Ransam Selshiya T"
        ],

        // ----------------------------------------------------
        // QUIZ FOCUS
        // ----------------------------------------------------

        focusTitle:
            "Quiz Focus",

        focusAreas: [
            "Semiconductor Technology & VLSI",
            "Artificial Intelligence & Generative AI",
            "Quantum Computing",
            "Signal & Image Processing",
            "Internet of Things (IoT)",
            "Cybersecurity",
            "Robotics & Automation",
            "Programming & Computational Technologies",
            "Data Science & Machine Learning",
            "Renewable & Sustainable Engineering"
        ],

        rules: [

            "Team size: Exactly 2 participants per team.",

            "Both team members must register for the event.",

            "Each participant must pay a registration fee of ₹200.",

            "Teams must participate together throughout all rounds.",

            "The quiz will cover emerging technologies and engineering concepts."

        ]

    },


    // ========================================================
    // CODESPRINT
    // ========================================================

    codesprint: {

        title:
            "CodeSprint",

        subtitle:
            "Programming Challenge",

        about:
            "Solve programming problems with speed, accuracy, and optimized logic.",

        participation:
            "Individual — One participant per registration",

        fee:
            "₹200 / Participant",

        totalFee:
            "₹200",

        venue:
            "Sathyabama Institute of Science & Technology",

        date:
            "23 September 2026",

        time:
            "10:00 AM – 12:30 PM",

        // ----------------------------------------------------
        // FACULTY COORDINATORS
        // ----------------------------------------------------

        facultyCoordinators: [
            "Ms. Bhuvaneswari S",
            "Dr. Soniya S"
        ],

        // ----------------------------------------------------
        // STUDENT ORGANISERS
        // ----------------------------------------------------

        studentOrganisers: [
            "Ms. Nanthana K T",
            "Ms. Reshma V",
            "Ms. Divyadarshini",
            "Mr. Mohan Kumar",
            "Ms. Shanana B"
        ],

        // ----------------------------------------------------
        // PROGRAMMING AREAS
        // ----------------------------------------------------

        focusTitle:
            "Programming Areas",

        focusAreas: [
            "C Programming",
            "Java",
            "Python",
            "Data Structures"
        ],

        rules: [

            "Individual participation only.",

            "One participant per registration.",

            "Registration fee is ₹200 per participant.",

            "Participants may be tested in C Programming.",

            "Participants may be tested in Java.",

            "Participants may be tested in Python.",

            "Participants may be tested in Data Structures."

        ]

    }

};


// ============================================================
// CHECK WHETHER EVENT EXISTS
// ============================================================

if (!eventId || !events[eventId]) {

    document.body.innerHTML = `

        <div
            style="
                text-align:center;
                margin-top:100px;
                font-family:Arial,sans-serif;
            "
        >

            <h1>
                Event Not Found
            </h1>

            <p>
                The requested event could not be found.
            </p>

            <a href="index.html">
                ← Back to TechFusion
            </a>

        </div>

    `;

    throw new Error(
        "Invalid event ID: " + eventId
    );

}


// ============================================================
// SELECTED EVENT
// ============================================================

const event =
    events[eventId];


// ============================================================
// FILL EVENT INFORMATION
// ============================================================

document.getElementById(
    "eventTitle"
).innerText =
    event.title;


document.getElementById(
    "eventSubtitle"
).innerText =
    event.subtitle;


document.getElementById(
    "about"
).innerText =
    event.about;


// ============================================================
// PARTICIPATION
// ============================================================

document.getElementById(
    "teamSize"
).innerText =
    event.participation;


// ============================================================
// FEE
// ============================================================

document.getElementById(
    "fee"
).innerText =
    event.fee;


// ============================================================
// VENUE
// ============================================================

document.getElementById(
    "venue"
).innerText =
    event.venue;


// ============================================================
// DATE
// ============================================================

document.getElementById(
    "date"
).innerText =
    event.date;


// ============================================================
// TIME
// ============================================================

const timeElement =
    document.getElementById("time");

if (timeElement) {

    timeElement.innerText =
        event.time;

}


// ============================================================
// FACULTY COORDINATORS
// ============================================================

const facultyList =
    document.getElementById(
        "facultyCoordinators"
    );

if (facultyList) {

    facultyList.innerHTML = "";

    event.facultyCoordinators.forEach(
        function (name) {

            const li =
                document.createElement("li");

            li.innerText =
                name;

            facultyList.appendChild(li);

        }
    );

}


// ============================================================
// STUDENT ORGANISERS
// ============================================================

const studentList =
    document.getElementById(
        "studentOrganisers"
    );

if (studentList) {

    studentList.innerHTML = "";

    event.studentOrganisers.forEach(
        function (name) {

            const li =
                document.createElement("li");

            li.innerText =
                name;

            studentList.appendChild(li);

        }
    );

}


// ============================================================
// FOCUS AREAS
// ============================================================

const focusTitleElement =
    document.getElementById(
        "focusTitle"
    );

const focusList =
    document.getElementById(
        "focusAreas"
    );

if (
    focusTitleElement &&
    focusList
) {

    focusTitleElement.innerText =
        event.focusTitle;

    focusList.innerHTML = "";

    event.focusAreas.forEach(
        function (area) {

            const li =
                document.createElement("li");

            li.innerText =
                area;

            focusList.appendChild(li);

        }
    );

}


// ============================================================
// RULES
// ============================================================

const ruleList =
    document.getElementById("rules");

if (ruleList) {

    ruleList.innerHTML = "";

    event.rules.forEach(
        function (rule) {

            const li =
                document.createElement("li");

            li.innerText =
                rule;

            ruleList.appendChild(li);

        }
    );

}


// ============================================================
// REMOVE OLD COORDINATOR DISPLAY
// ============================================================

// The old "To be Announced" coordinator field
// is no longer used because faculty coordinators
// are displayed separately.

const coordinatorElement =
    document.getElementById(
        "coordinator"
    );

if (coordinatorElement) {

    const coordinatorParent =
        coordinatorElement.closest(
            ".event-detail"
        );

    if (coordinatorParent) {

        coordinatorParent.remove();

    }

}


// ============================================================
// REGISTER BUTTON
// ============================================================

const registerBtn =
    document.getElementById(
        "registerBtn"
    );

if (registerBtn) {

    registerBtn.addEventListener(
        "click",
        function () {

            window.location.href =
                `register.html?event=${eventId}`;

        }
    );

}