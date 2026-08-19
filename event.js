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

const event =
    events[eventId];


// ============================================================
// REGISTER BUTTON
// ============================================================

const registerBtn =
    document.getElementById(
        "registerBtn"
    );


// ============================================================
// EVENT CAPACITY / REGISTRATION PROGRESS
// ============================================================

// IMPORTANT:
// Do NOT use the old Vercel URL here.
//
// The event page and API are on the same domain.
// Therefore we use:
// /api/event-capacity

const capacityContainer =
    document.getElementById(
        "eventCapacity"
    );


async function loadEventCapacity() {

    if (!capacityContainer) {

        return;

    }


    try {

        capacityContainer.innerHTML = `

            <div class="capacity-loading">

                Checking registration status...

            </div>

        `;


        // ----------------------------------------------------
        // GET CAPACITY FROM SAME DOMAIN
        // ----------------------------------------------------

        const response =
            await fetch(
                "/api/event-capacity",
                {
                    method:
                        "GET",

                    cache:
                        "no-store"
                }
            );


        // ----------------------------------------------------
        // CHECK HTTP RESPONSE
        // ----------------------------------------------------

        if (!response.ok) {

            throw new Error(
                `Capacity API returned HTTP ${response.status}`
            );

        }


        // ----------------------------------------------------
        // READ JSON
        // ----------------------------------------------------

        const data =
            await response.json();


        console.log(
            "Event capacity API response:",
            data
        );


        // ----------------------------------------------------
        // VALIDATE RESPONSE
        // ----------------------------------------------------

        if (
            !data.success ||
            !Array.isArray(data.events)
        ) {

            throw new Error(
                "Invalid capacity response."
            );

        }


        // ----------------------------------------------------
        // FIND CURRENT EVENT
        // ----------------------------------------------------

        const currentEvent =
            data.events.find(
                function (item) {

                    return (
                        item.eventId ===
                        eventId
                    );

                }
            );


        if (!currentEvent) {

            throw new Error(
                "Capacity information not found for " +
                eventId
            );

        }


        console.log(
            "Current event capacity:",
            currentEvent
        );


        // ====================================================
        // REGISTRATION FULL
        // ====================================================

        if (
            currentEvent.full
        ) {

            capacityContainer.innerHTML = `

                <div class="event-capacity full">

                    <div class="capacity-header">

                        <strong>
                            Registration Full
                        </strong>

                        <span>
                            100%
                        </span>

                    </div>


                    <div class="capacity-bar">

                        <div
                            class="capacity-progress"
                            style="
                                width:100%;
                            "
                        ></div>

                    </div>


                    <p class="capacity-text">

                        ${
                            currentEvent.type ===
                            "team"

                                ? `All ${currentEvent.maxTeams} team slots are filled.`

                                : `All ${currentEvent.maxParticipants} participant slots are filled.`

                        }

                    </p>

                </div>

            `;


            // Disable registration button

            if (registerBtn) {

                registerBtn.disabled =
                    true;

                registerBtn.innerText =
                    "Registration Full";

            }


            return;

        }


        // ====================================================
        // TEAM EVENT
        // ====================================================

        if (
            currentEvent.type ===
            "team"
        ) {

            capacityContainer.innerHTML = `

                <div class="event-capacity">

                    <div class="capacity-header">

                        <strong>
                            Registration Progress
                        </strong>

                        <span>

                            ${
                                currentEvent.registeredTeams
                            }

                            /

                            ${
                                currentEvent.maxTeams
                            }

                            Teams

                        </span>

                    </div>


                    <div class="capacity-bar">

                        <div
                            class="capacity-progress"
                            style="
                                width:${currentEvent.percentage}%;
                            "
                        ></div>

                    </div>


                    <p class="capacity-text">

                        ${
                            currentEvent.remainingTeams
                        }

                        ${
                            currentEvent.remainingTeams === 1
                                ? "team"
                                : "teams"
                        }

                        remaining

                        ·

                        ${
                            currentEvent.registeredParticipants
                        }

                        /

                        ${
                            currentEvent.maxParticipants
                        }

                        participants registered

                    </p>

                </div>

            `;


            return;

        }


        // ====================================================
        // INDIVIDUAL EVENT
        // ====================================================

        capacityContainer.innerHTML = `

            <div class="event-capacity">

                <div class="capacity-header">

                    <strong>
                        Registration Progress
                    </strong>

                    <span>

                        ${
                            currentEvent.registeredParticipants
                        }

                        /

                        ${
                            currentEvent.maxParticipants
                        }

                        Participants

                    </span>

                </div>


                <div class="capacity-bar">

                    <div
                        class="capacity-progress"
                        style="
                            width:${currentEvent.percentage}%;
                        "
                    ></div>

                </div>


                <p class="capacity-text">

                    ${
                        currentEvent.remainingParticipants
                    }

                    ${
                        currentEvent.remainingParticipants === 1
                            ? "participant"
                            : "participants"
                    }

                    remaining

                </p>

            </div>

        `;

    }


    catch (error) {

        console.error(
            "Capacity loading error:",
            error
        );


        capacityContainer.innerHTML = `

            <div class="capacity-error">

                Registration availability
                could not be loaded.

            </div>

        `;

    }

}


// ============================================================
// BASIC EVENT INFORMATION
// ============================================================

const eventTitle =
    document.getElementById(
        "eventTitle"
    );

if (eventTitle) {

    eventTitle.innerText =
        event.title;

}


const eventSubtitle =
    document.getElementById(
        "eventSubtitle"
    );

if (eventSubtitle) {

    eventSubtitle.innerText =
        event.subtitle;

}


const about =
    document.getElementById(
        "about"
    );

if (about) {

    about.innerText =
        event.about;

}


const teamSize =
    document.getElementById(
        "teamSize"
    );

if (teamSize) {

    teamSize.innerText =
        event.participation;

}


const fee =
    document.getElementById(
        "fee"
    );

if (fee) {

    fee.innerText =
        event.fee;

}


const venue =
    document.getElementById(
        "venue"
    );

if (venue) {

    venue.innerText =
        event.venue;

}


const date =
    document.getElementById(
        "date"
    );

if (date) {

    date.innerText =
        event.date;

}


const time =
    document.getElementById(
        "time"
    );

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

    facultyList.innerHTML =
        "";

    event.facultyCoordinators.forEach(
        function (name) {

            const li =
                document.createElement(
                    "li"
                );

            li.innerText =
                name;

            facultyList.appendChild(
                li
            );

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

    studentList.innerHTML =
        "";

    event.studentOrganisers.forEach(
        function (name) {

            const li =
                document.createElement(
                    "li"
                );

            li.innerText =
                name;

            studentList.appendChild(
                li
            );

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

    focusList.innerHTML =
        "";

    event.focusAreas.forEach(
        function (area) {

            const li =
                document.createElement(
                    "li"
                );

            li.innerText =
                area;

            focusList.appendChild(
                li
            );

        }
    );

}


// ============================================================
// RULES
// ============================================================

const ruleList =
    document.getElementById(
        "rules"
    );

if (ruleList) {

    ruleList.innerHTML =
        "";

    event.rules.forEach(
        function (rule) {

            const li =
                document.createElement(
                    "li"
                );

            li.innerText =
                rule;

            ruleList.appendChild(
                li
            );

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
// LOAD EVENT CAPACITY
// ============================================================

// Run after the page elements have been prepared.

loadEventCapacity();


// ============================================================
// REGISTER BUTTON
// ============================================================

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