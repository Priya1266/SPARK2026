/* ============================================================
   SPARK 2026
   script.js

   Complete website controller

   Flow:

   index.html
        ↓
   Home
        ↓
   TechFusion
        ↓
   event.html?event=...
        ↓
   register.html?event=...
   ============================================================ */


/* ============================================================
   MODULE 1 — DOM READY
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {

    console.log("SPARK 2026 website initialized.");



    /* ========================================================
       MODULE 2 — HEADER + MOBILE NAVIGATION
       ======================================================== */

    const header =
        document.querySelector(".site-header");

    const navToggle =
        document.getElementById("navToggle");

    const mainNav =
        document.getElementById("mainNav");


    /* --------------------------------------------------------
       HEADER SCROLL EFFECT
       -------------------------------------------------------- */

    function updateHeader() {

        if (!header) {
            return;
        }


        if (window.scrollY > 30) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    }


    updateHeader();


    window.addEventListener(
        "scroll",
        updateHeader,
        {
            passive: true
        }
    );



    /* --------------------------------------------------------
       MOBILE NAVIGATION
       -------------------------------------------------------- */

    if (navToggle && mainNav) {

        navToggle.addEventListener(
            "click",
            function () {

                const isOpen =
                    mainNav.classList.toggle("open");


                navToggle.setAttribute(
                    "aria-expanded",
                    isOpen ? "true" : "false"
                );


                navToggle.classList.toggle(
                    "active",
                    isOpen
                );

            }
        );


        /* Close mobile menu after clicking a link */

        const navLinks =
            mainNav.querySelectorAll("a");


        navLinks.forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        mainNav.classList.remove(
                            "open"
                        );


                        navToggle.classList.remove(
                            "active"
                        );


                        navToggle.setAttribute(
                            "aria-expanded",
                            "false"
                        );

                    }
                );

            }
        );

    }



    /* ========================================================
       MODULE 3 — HOME / TECHFUSION VIEWS
       ======================================================== */

    const homeView =
        document.getElementById("homeView");

    const techFusionView =
        document.getElementById(
            "techfusionView"
        );


    const openTechFusion =
        document.getElementById(
            "openTechFusion"
        );


    const backToHome =
        document.getElementById(
            "backToHome"
        );


    const backToHomeFooter =
        document.getElementById(
            "backToHomeFooter"
        );



    /* --------------------------------------------------------
       SHOW HOME
       -------------------------------------------------------- */

    function showHome() {

        if (techFusionView) {

            techFusionView.hidden = true;

            techFusionView.style.display =
                "none";

        }


        if (homeView) {

            homeView.hidden = false;

            homeView.style.display =
                "block";

        }


        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });


        document.title =
            "SPARK 2026 | Technical Summit";

    }



    /* --------------------------------------------------------
       SHOW TECHFUSION
       -------------------------------------------------------- */

    function showTechFusion() {

        if (!homeView) {

            console.error(
                "ERROR: #homeView not found."
            );

            return;

        }


        if (!techFusionView) {

            console.error(
                "ERROR: #techfusionView not found."
            );

            return;

        }


        /* Hide home */

        homeView.hidden = true;

        homeView.style.display =
            "none";


        /* Show TechFusion */

        techFusionView.hidden = false;

        techFusionView.style.display =
            "block";


        /* Update page title */

        document.title =
            "TechFusion | SPARK 2026";


        /* Go to top */

        window.scrollTo({

            top: 0,

            behavior: "smooth"

        });


        /* Trigger reveal animation */

        setTimeout(
            function () {

                initialiseRevealElements(
                    techFusionView
                );

            },
            100
        );

    }



    /* --------------------------------------------------------
       OPEN TECHFUSION BUTTON
       -------------------------------------------------------- */

    if (openTechFusion) {

        openTechFusion.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showTechFusion();

            }
        );

    }



    /* --------------------------------------------------------
       BACK TO HOME
       -------------------------------------------------------- */

    if (backToHome) {

        backToHome.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showHome();

            }
        );

    }



    /* --------------------------------------------------------
       FOOTER BACK BUTTON
       -------------------------------------------------------- */

    if (backToHomeFooter) {

        backToHomeFooter.addEventListener(
            "click",
            function (event) {

                event.preventDefault();

                showHome();

            }
        );

    }



    /* ========================================================
       MODULE 4 — NORMAL SECTION NAVIGATION
       ======================================================== */

    const navigationLinks =
        document.querySelectorAll(
            "a[data-nav]"
        );


    navigationLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    const href =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !href ||
                        href === "#"
                    ) {

                        return;

                    }


                    if (
                        !href.startsWith("#")
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            href
                        );


                    if (!target) {

                        return;

                    }


                    event.preventDefault();


                    /* If user is on TechFusion
                       and clicks a home section,
                       return to home first. */

                    if (
                        homeView &&
                        techFusionView &&
                        !techFusionView.hidden
                    ) {

                        showHome();


                        setTimeout(
                            function () {

                                scrollToElement(
                                    target
                                );

                            },
                            250
                        );

                    } else {

                        scrollToElement(
                            target
                        );

                    }

                }
            );

        }
    );



    /* --------------------------------------------------------
       SMOOTH SCROLL FUNCTION
       -------------------------------------------------------- */

    function scrollToElement(element) {

        if (!element) {
            return;
        }


        const headerElement =
            document.querySelector(
                ".site-header"
            );


        const headerHeight =
            headerElement
                ? headerElement.offsetHeight
                : 0;


        const targetPosition =
            element.getBoundingClientRect().top +
            window.scrollY -
            headerHeight -
            15;


        window.scrollTo({

            top: targetPosition,

            behavior: "smooth"

        });

    }



    /* ========================================================
       MODULE 5 — TECHFUSION CHALLENGE NAVIGATION
       ======================================================== */

    const techFusionRegisterLinks =
        document.querySelectorAll(
            "[data-techfusion-register]"
        );


    techFusionRegisterLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function (event) {

                    const href =
                        link.getAttribute(
                            "href"
                        );


                    if (
                        !href ||
                        !href.startsWith("#")
                    ) {

                        return;

                    }


                    const target =
                        document.querySelector(
                            href
                        );


                    if (!target) {

                        return;

                    }


                    event.preventDefault();


                    scrollToElement(
                        target
                    );

                }
            );

        }
    );



    /* ========================================================
       MODULE 6 — EVENT DETAIL LINKS
       ======================================================== */

    /*
       IMPORTANT:

       We intentionally DO NOT preventDefault()
       on these links.

       The browser should naturally navigate to:

       event.html?event=ideaforge
       event.html?event=circuitclash
       event.html?event=iqquest
       event.html?event=codesprint

       This avoids the previous blank-page problem.
    */


    const eventLinks =
        document.querySelectorAll(
            'a[href*="event.html?event="]'
        );


    eventLinks.forEach(
        function (link) {

            link.addEventListener(
                "click",
                function () {

                    const destination =
                        link.getAttribute(
                            "href"
                        );


                    console.log(
                        "Opening event page:",
                        destination
                    );

                    /*
                       DO NOT call event.preventDefault()
                       here.
                    */

                }
            );

        }
    );



    /* ========================================================
       MODULE 7 — COUNTDOWN
       ======================================================== */

    const cdDays =
        document.getElementById(
            "cdDays"
        );

    const cdHours =
        document.getElementById(
            "cdHours"
        );

    const cdMins =
        document.getElementById(
            "cdMins"
        );

    const cdSecs =
        document.getElementById(
            "cdSecs"
        );

    const cdCaption =
        document.getElementById(
            "cdCaption"
        );


    /*
       SPARK 2026 starts on
       22 September 2026 at 09:00 AM.
    */

    const eventStart =
        new Date(
            "September 22, 2026 09:00:00"
        ).getTime();



    function updateCountdown() {

        if (
            !cdDays ||
            !cdHours ||
            !cdMins ||
            !cdSecs
        ) {

            return;

        }


        const now =
            Date.now();


        const difference =
            eventStart - now;



        /* ----------------------------------------------------
           EVENT STARTED
           ---------------------------------------------------- */

        if (difference <= 0) {

            cdDays.textContent =
                "00";

            cdHours.textContent =
                "00";

            cdMins.textContent =
                "00";

            cdSecs.textContent =
                "00";


            if (cdCaption) {

                cdCaption.innerHTML =
                    '<span class="line"></span>' +
                    'SPARK 2026 IS LIVE!' +
                    '<span class="line"></span>';

            }


            return;

        }



        /* ----------------------------------------------------
           CALCULATE TIME
           ---------------------------------------------------- */

        const days =
            Math.floor(
                difference /
                (1000 * 60 * 60 * 24)
            );


        const hours =
            Math.floor(
                (
                    difference %
                    (1000 * 60 * 60 * 24)
                ) /
                (1000 * 60 * 60)
            );


        const minutes =
            Math.floor(
                (
                    difference %
                    (1000 * 60 * 60)
                ) /
                (1000 * 60)
            );


        const seconds =
            Math.floor(
                (
                    difference %
                    (1000 * 60)
                ) /
                1000
            );



        /* ----------------------------------------------------
           DISPLAY
           ---------------------------------------------------- */

        cdDays.textContent =
            String(days).padStart(
                2,
                "0"
            );


        cdHours.textContent =
            String(hours).padStart(
                2,
                "0"
            );


        cdMins.textContent =
            String(minutes).padStart(
                2,
                "0"
            );


        cdSecs.textContent =
            String(seconds).padStart(
                2,
                "0"
            );

    }


    updateCountdown();


    setInterval(
        updateCountdown,
        1000
    );



    /* ========================================================
       MODULE 8 — SCROLL REVEAL
       ======================================================== */

    function initialiseRevealElements(
        container = document
    ) {

        const revealElements =
            container.querySelectorAll(
                ".reveal:not(.reveal-ready)"
            );


        if (!revealElements.length) {
            return;
        }


        revealElements.forEach(
            function (element) {

                element.classList.add(
                    "reveal-ready"
                );

            }
        );


        /* ----------------------------------------------------
           FALLBACK
           ---------------------------------------------------- */

        if (
            !("IntersectionObserver" in window)
        ) {

            revealElements.forEach(
                function (element) {

                    element.classList.add(
                        "is-visible"
                    );

                }
            );

            return;

        }



        /* ----------------------------------------------------
           OBSERVER
           ---------------------------------------------------- */

        const observer =
            new IntersectionObserver(

                function (entries) {

                    entries.forEach(
                        function (entry) {

                            if (
                                entry.isIntersecting
                            ) {

                                entry.target.classList.add(
                                    "is-visible"
                                );


                                observer.unobserve(
                                    entry.target
                                );

                            }

                        }
                    );

                },

                {
                    threshold: 0.12,

                    rootMargin:
                        "0px 0px -50px 0px"
                }

            );


        revealElements.forEach(
            function (element, index) {

                element.style.transitionDelay =
                    `${(index % 5) * 70}ms`;


                observer.observe(
                    element
                );

            }
        );

    }


    initialiseRevealElements();



    /* ========================================================
       MODULE 9 — CIRCUIT TRACE ANIMATION
       ======================================================== */

    const circuitTrace =
        document.getElementById(
            "circuitTrace"
        );


    if (circuitTrace) {

        if (
            "IntersectionObserver" in window
        ) {

            const traceObserver =
                new IntersectionObserver(

                    function (entries) {

                        entries.forEach(
                            function (entry) {

                                if (
                                    entry.isIntersecting
                                ) {

                                    circuitTrace.classList.add(
                                        "is-visible"
                                    );


                                    traceObserver.unobserve(
                                        entry.target
                                    );

                                }

                            }
                        );

                    },

                    {
                        threshold: 0.2
                    }

                );


            traceObserver.observe(
                circuitTrace
            );

        } else {

            circuitTrace.classList.add(
                "is-visible"
            );

        }

    }



    /* ========================================================
       MODULE 10 — HERO CANVAS
       ======================================================== */

    const heroCanvas =
        document.getElementById(
            "heroCanvas"
        );


    const heroSection =
        document.querySelector(
            ".hero"
        );


    if (
        heroCanvas &&
        heroSection
    ) {

        const ctx =
            heroCanvas.getContext(
                "2d"
            );


        let particles = [];


        let animationFrame;



        /* ----------------------------------------------------
           RESIZE CANVAS
           ---------------------------------------------------- */

        function resizeHeroCanvas() {

            const rect =
                heroSection.getBoundingClientRect();


            const devicePixelRatio =
                Math.min(
                    window.devicePixelRatio || 1,
                    2
                );


            heroCanvas.width =
                rect.width *
                devicePixelRatio;


            heroCanvas.height =
                rect.height *
                devicePixelRatio;


            heroCanvas.style.width =
                rect.width + "px";


            heroCanvas.style.height =
                rect.height + "px";


            ctx.setTransform(
                devicePixelRatio,
                0,
                0,
                devicePixelRatio,
                0,
                0
            );


            createParticles(
                rect.width,
                rect.height
            );

        }



        /* ----------------------------------------------------
           CREATE PARTICLES
           ---------------------------------------------------- */

        function createParticles(
            width,
            height
        ) {

            particles = [];


            const count =
                Math.min(
                    Math.floor(
                        width / 18
                    ),
                    70
                );


            for (
                let i = 0;
                i < count;
                i++
            ) {

                particles.push({

                    x:
                        Math.random() *
                        width,

                    y:
                        Math.random() *
                        height,

                    radius:
                        Math.random() *
                        1.7 +
                        0.5,

                    speed:
                        Math.random() *
                        0.25 +
                        0.05,

                    opacity:
                        Math.random() *
                        0.45 +
                        0.15

                });

            }

        }



        /* ----------------------------------------------------
           DRAW HERO CANVAS
           ---------------------------------------------------- */

        function drawHeroCanvas() {

            const width =
                heroCanvas.clientWidth;


            const height =
                heroCanvas.clientHeight;


            ctx.clearRect(
                0,
                0,
                width,
                height
            );


            particles.forEach(
                function (particle) {

                    particle.y -=
                        particle.speed;


                    if (
                        particle.y < -5
                    ) {

                        particle.y =
                            height + 5;

                    }


                    ctx.beginPath();


                    ctx.arc(
                        particle.x,
                        particle.y,
                        particle.radius,
                        0,
                        Math.PI * 2
                    );


                    ctx.fillStyle =
                        `rgba(255,255,255,${particle.opacity})`;


                    ctx.fill();

                }
            );


            animationFrame =
                requestAnimationFrame(
                    drawHeroCanvas
                );

        }



        /* ----------------------------------------------------
           INITIALIZE CANVAS
           ---------------------------------------------------- */

        resizeHeroCanvas();


        window.addEventListener(
            "resize",
            resizeHeroCanvas
        );


        drawHeroCanvas();



        /* ----------------------------------------------------
           REDUCE ANIMATION WHEN USER PREFERS REDUCED MOTION
           ---------------------------------------------------- */

        const reducedMotion =
            window.matchMedia(
                "(prefers-reduced-motion: reduce)"
            );


        if (
            reducedMotion.matches
        ) {

            cancelAnimationFrame(
                animationFrame
            );

            heroCanvas.style.display =
                "none";

        }

    }



    /* ========================================================
       MODULE 11 — BACK TO TOP
       ======================================================== */

    const backToTop =
        document.getElementById(
            "backToTop"
        );


    if (backToTop) {


        function updateBackToTop() {

            if (
                window.scrollY > 500
            ) {

                backToTop.classList.add(
                    "visible"
                );

            } else {

                backToTop.classList.remove(
                    "visible"
                );

            }

        }


        updateBackToTop();


        window.addEventListener(
            "scroll",
            updateBackToTop,
            {
                passive: true
            }
        );


        backToTop.addEventListener(
            "click",
            function () {

                window.scrollTo({

                    top: 0,

                    behavior: "smooth"

                });

            }
        );

    }



    /* ========================================================
       MODULE 12 — FOOTER YEAR
       ======================================================== */

    const yearElement =
        document.getElementById(
            "year"
        );


    if (yearElement) {

        yearElement.textContent =
            new Date().getFullYear();

    }


    const footerYears =
        document.querySelectorAll(
            ".footer-year"
        );


    footerYears.forEach(
        function (element) {

            element.textContent =
                new Date().getFullYear();

        }
    );



    /* ========================================================
       MODULE 13 — INITIAL VIEW STATE
       ======================================================== */

    /*
       IMPORTANT:

       On initial loading:

       HOME       = visible
       TECHFUSION = hidden

       This prevents the blank-page problem.
    */


    if (
        homeView &&
        techFusionView
    ) {

        homeView.hidden =
            false;

        homeView.style.display =
            "block";


        techFusionView.hidden =
            true;

        techFusionView.style.display =
            "none";

    }



    /* ========================================================
       MODULE 14 — KEYBOARD ACCESSIBILITY
       ======================================================== */

    document.addEventListener(
        "keydown",
        function (event) {

            /*
               Escape closes the mobile menu.
            */

            if (
                event.key === "Escape"
            ) {

                if (
                    mainNav &&
                    navToggle
                ) {

                    mainNav.classList.remove(
                        "open"
                    );


                    navToggle.classList.remove(
                        "active"
                    );


                    navToggle.setAttribute(
                        "aria-expanded",
                        "false"
                    );

                }

            }

        }
    );



    /* ========================================================
       MODULE 15 — FINAL DEBUG CHECK
       ======================================================== */

    console.log(
        "Home view:",
        homeView
            ? "FOUND"
            : "MISSING"
    );


    console.log(
        "TechFusion view:",
        techFusionView
            ? "FOUND"
            : "MISSING"
    );


    console.log(
        "TechFusion button:",
        openTechFusion
            ? "FOUND"
            : "MISSING"
    );


    console.log(
        "Event links:",
        eventLinks.length
    );


    console.log(
        "SPARK 2026 script loaded successfully."
    );

});