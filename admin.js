// ============================================================
// SPARK 2026 — ADMIN LOGIN
// ============================================================

const BACKEND_URL =
    "http://127.0.0.1:3000";


// ============================================================
// ELEMENTS
// ============================================================

const loginForm =
    document.getElementById("adminLoginForm");

const loginMessage =
    document.getElementById("loginMessage");

const loginButton =
    document.getElementById("loginButton");


// ============================================================
// LOGIN
// ============================================================

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        // --------------------------------------------------------
        // GET INPUT VALUES
        // --------------------------------------------------------

        const username =
            document
                .getElementById("adminUsername")
                .value
                .trim();

        const password =
            document
                .getElementById("adminPassword")
                .value;


        // --------------------------------------------------------
        // VALIDATION
        // --------------------------------------------------------

        if (!username || !password) {

            loginMessage.textContent =
                "Please enter username and password.";

            loginMessage.style.color =
                "#dc2626";

            return;
        }


        // --------------------------------------------------------
        // LOGIN STATE
        // --------------------------------------------------------

        loginMessage.textContent =
            "Logging in...";

        loginMessage.style.color =
            "#2563eb";

        loginButton.disabled =
            true;


        try {

            // ====================================================
            // SEND LOGIN REQUEST
            // ====================================================

            const response =
                await fetch(
                    `${BACKEND_URL}/api/admin/login`,
                    {
                        method: "POST",

                        credentials: "include",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify({
                                username: username,
                                password: password
                            })
                    }
                );


            // ====================================================
            // READ RESPONSE
            // ====================================================

            const data =
                await response.json();


            console.log(
                "Admin login response:",
                data
            );


            // ====================================================
            // LOGIN FAILED
            // ====================================================

            if (
                !response.ok ||
                !data.success
            ) {

                loginMessage.textContent =
                    data.message ||
                    "Invalid username or password.";

                loginMessage.style.color =
                    "#dc2626";

                loginButton.disabled =
                    false;

                return;
            }


            // ====================================================
            // LOGIN SUCCESS
            // ====================================================

            loginMessage.textContent =
                "Login successful! Opening dashboard...";

            loginMessage.style.color =
                "#16a34a";


            // ----------------------------------------------------
            // Give browser a moment to store the cookie
            // ----------------------------------------------------

            await new Promise(
                resolve =>
                    setTimeout(resolve, 300)
            );


            // ====================================================
            // OPEN ADMIN DASHBOARD
            // ====================================================

            window.location.replace(
                "admin-dashboard.html"
            );

        }


        // ========================================================
        // NETWORK / SERVER ERROR
        // ========================================================

        catch (error) {

            console.error(
                "Admin login error:",
                error
            );


            loginMessage.textContent =
                "Unable to connect to the server. Make sure server.js is running.";

            loginMessage.style.color =
                "#dc2626";


            loginButton.disabled =
                false;
        }

    }
);