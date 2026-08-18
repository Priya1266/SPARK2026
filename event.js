// ============================================================
// SPARK 2026 — EVENT PAGE
// ============================================================

"use strict";


// ============================================================
// GET EVENT ID FROM URL
// ============================================================

const params = new URLSearchParams(
    window.location.search
);

// Supports:
// ?event=circuitclash
// ?event=circuit-clash
// ?event=Circuit-Clash

const eventId = (params.get("event") || "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "");


// ============================================================
// ALL EVENT DATA
// ============================================================

const events = {

    // ========================================================
    // IDEA FORGE
    // ========================================================

    ideaforge: {

        title: "iDeaForge",

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

        facultyCoordinators: [

            "Dr. Bhuvaneswari A J",

            "Ms. Caroline Priyanka"

        ],

        studentOrganisers: [

            "Ms. Nitheesha Kommireddy",

            "Ms. Kanaga durga P",

            "Ms. Akzhara B S",

            "Mr. Mothil D",

            "Ms. Suganya S"

        ],

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

        facultyCoordinators: [

            "Mr. Arunbalaji S",

            "Ms. Jeba Nimsiya N"

        ],

        studentOrganisers: [

            "Ms. Poojasri P",

            "Ms. Panchami P",

            "Ms. Nivedha Gnanodharan",

            "Ms. Janani",

            "Mr. Thanigaivel.V"

        ],

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

        time:
            "1:00 PM – 3:00 PM",

        facultyCoordinators: [

            "Ms. Imaya S",

            "Ms. Mohanapriya G",

            "Ms. Revathy"

        ],

        studentOrganisers: [

            "Ms. Poojasri",

            "Ms. Panchami",

            "Ms. Sanjana",

            "Mr. Srinivas Hari",

            "Ms. Ransam Selshiya T"

        ],

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

        facultyCoordinators: [

            "Ms. Bhuvaneswari S",

            "Dr. Soniya S"

        ],

        studentOrganisers: [

            "Ms. Nanthana K T",

            "Ms. Reshma V",

            "Ms. Divyadarshini",

            "Mr. Mohan Kumar",

            "Ms. Shanana B"

        ],

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
// CHECK EVENT
// ============================================================

if (
    !eventId ||
    !Object.prototype.hasOwnProperty.call(
        events,
        eventId
    )
) {

    document.body.innerHTML = `

        <main
            style="
                min-height:100vh;
                display:flex;
                align-items:center;
                justify-content:center;
                text-align:center;
                font-family:Arial,sans-serif;
                padding:30px;
            "
        >

            <div>

                <h1>
                    Event Not Found
                </h1>

                <p>
                    The requested event could not be found.
                </p>

                <p>
                    Event ID:
                    <strong>
                        ${eventId || "missing"}
                    </strong>
                </p>

                <br>

                <a href="index.html">
                    ← Back to SPARK 2026
                </a>

            </div>

        </main>

    `;

    throw new Error(
        "Invalid event ID: " + eventId
    );
}


// ============================================================
// SELECT EVENT
// ============================================================

const event = events[eventId];


// ============================================================
// BASIC EVENT INFORMATION
// ============================================================

const eventTitle =
    document.getElementById("eventTitle");

if (eventTitle) {

    eventTitle.innerText =
        event.title;
}


const eventSubtitle =
    document.getElementById("eventSubtitle");

if (eventSubtitle) {

    eventSubtitle.innerText =
        event.subtitle;
}


const about =
    document.getElementById("about");

if (about) {

    about.innerText =
        event.about;
}


const teamSize =
    document.getElementById("teamSize");

if (teamSize) {

    teamSize.innerText =
        event.participation;
}


const fee =
    document.getElementById("fee");

if (fee) {

    fee.innerText =
        event.fee;
}


const venue =
    document.getElementById("venue");

if (venue) {

    venue.innerText =
        event.venue;
}


const date =
    document.getElementById("date");

if (date) {

    date.innerText =
        event.date;
}


const time =
    document.getElementById("time");

if (time) {

    time.innerText =
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
// REMOVE OLD COORDINATOR DISPLAY IF PRESENT
// ============================================================

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
                `register.html?event=${encodeURIComponent(eventId)}`;

        }
    );
}


// ============================================================
// DEBUG
// ============================================================

console.log(
    "SPARK 2026 Event Page"
);

console.log(
    "Event ID:",
    eventId
);

console.log(
    "Event:",
    event.title
);