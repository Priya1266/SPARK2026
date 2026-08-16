// ============================================================
// SPARK 2026 — ADMIN LOGIN
// Production-ready version
// ============================================================

// IMPORTANT:
// Keep this empty.
// The browser will automatically use the current domain.
//
// Local:
// http://localhost:5500/api/...
//
// Production:
// https://sistsparkece26.com/api/...
//
const BACKEND_URL = "";


// ============================================================
// GET LOGIN FORM
// ============================================================

const loginForm =
    document.getElementById("adminLoginForm") ||
    document.getElementById("loginForm");


// ============================================================
// GET USERNAME INPUT
// ============================================================

const usernameInput =
    document.getElementById("username") ||
    document.getElementById("adminUsername") ||
    document.getElementById("adminUsernameInput");


// ============================================================
// GET PASSWORD INPUT
// ============================================================

const passwordInput =
    document.getElementById("password") ||
    document.getElementById("adminPassword") ||
    document.getElementById("adminPasswordInput");


// ============================================================
// GET LOGIN BUTTON
// ============================================================

const loginButton =
    document.getElementById("loginButton") ||
    document.getElementById("adminLoginButton");


// ============================================================
// GET MESSAGE ELEMENT
// ============================================================

const loginMessage =
    document.getElementById("loginMessage") ||
    document.getElementById("errorMessage") ||
    document.getElementById("adminMessage");


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(message, type = "error") {

    if (!loginMessage) {
        console.log(message);
        return;
    }

    loginMessage.textContent = message;
    loginMessage.style.display = "block";

    if (type === "success") {
        loginMessage.style.color = "#16a34a";
    } else {
        loginMessage.style.color = "#dc2626";
    }
}


// ============================================================
// CHECK EXISTING ADMIN SESSION
// ============================================================

async function checkExistingSession() {

    try {

        console.log("Checking existing admin session...");

        const response = await fetch(
            `${BACKEND_URL}/api/admin/session`,
            {
                method: "GET",

                // Required for the admin HTTP-only cookie
                credentials: "include",

                headers: {
                    "Accept": "application/json"
                },

                cache: "no-store"
            }
        );


        console.log(
            "Existing session HTTP status:",
            response.status
        );


        if (!response.ok) {
            return false;
        }


        const data = await response.json();

        console.log(
            "Existing session response:",
            data
        );


        if (data.success) {

            console.log(
                "Existing admin session found."
            );

            window.location.href =
                "admin-dashboard.html";

            return true;
        }

    }

    catch (error) {

        console.log(
            "No existing admin session."
        );

        console.log(error);
    }


    return false;
}


// ============================================================
// ADMIN LOGIN
// ============================================================

async function loginAdmin(event) {

    event.preventDefault();


    // --------------------------------------------------------
    // GET VALUES
    // --------------------------------------------------------

    const username =
        usernameInput
            ? usernameInput.value.trim()
            : "";

    const password =
        passwordInput
            ? passwordInput.value
            : "";


    // --------------------------------------------------------
    // VALIDATE USERNAME
    // --------------------------------------------------------

    if (!username) {

        showMessage(
            "Please enter your username."
        );

        if (usernameInput) {
            usernameInput.focus();
        }

        return;
    }


    // --------------------------------------------------------
    // VALIDATE PASSWORD
    // --------------------------------------------------------

    if (!password) {

        showMessage(
            "Please enter your password."
        );

        if (passwordInput) {
            passwordInput.focus();
        }

        return;
    }


    // --------------------------------------------------------
    // DISABLE LOGIN BUTTON
    // --------------------------------------------------------

    if (loginButton) {

        loginButton.disabled = true;

        loginButton.textContent =
            "Logging in...";
    }


    showMessage(
        "Authenticating...",
        "success"
    );


    try {

        console.log(
            "========================================"
        );

        console.log(
            "Sending admin login request..."
        );

        console.log(
            "API:",
            `${BACKEND_URL}/api/admin/login`
        );


        // ====================================================
        // LOGIN REQUEST
        // ====================================================

        const response = await fetch(
            `${BACKEND_URL}/api/admin/login`,
            {
                method: "POST",

                // IMPORTANT:
                // Allows the browser to receive/send
                // the admin HTTP-only cookie.
                credentials: "include",

                headers: {
                    "Content-Type":
                        "application/json",

                    "Accept":
                        "application/json"
                },

                body: JSON.stringify({
                    username: username,
                    password: password
                })
            }
        );


        console.log(
            "Login HTTP status:",
            response.status
        );


        // ====================================================
        // READ RESPONSE SAFELY
        // ====================================================

        let data = {};

        try {

            data = await response.json();

        } catch (jsonError) {

            console.error(
                "Server returned non-JSON response:",
                jsonError
            );

            throw new Error(
                `Server returned HTTP ${response.status}`
            );
        }


        console.log(
            "Login response:",
            data
        );


        // ====================================================
        // LOGIN FAILED
        // ====================================================

        if (!response.ok || !data.success) {

            showMessage(
                data.message ||
                "Invalid username or password."
            );


            if (loginButton) {

                loginButton.disabled = false;

                loginButton.textContent =
                    "LOGIN";
            }

            return;
        }


        // ====================================================
        // LOGIN SUCCESS
        // ====================================================

        console.log(
            "Admin login successful."
        );


        showMessage(
            "Login successful. Verifying session...",
            "success"
        );


        // ====================================================
        // VERIFY ADMIN SESSION
        // ====================================================

        const sessionResponse = await fetch(
            `${BACKEND_URL}/api/admin/session`,
            {
                method: "GET",

                credentials: "include",

                headers: {
                    "Accept":
                        "application/json"
                },

                cache: "no-store"
            }
        );


        console.log(
            "Session verification status:",
            sessionResponse.status
        );


        let sessionData = {};

        try {

            sessionData =
                await sessionResponse.json();

        } catch (jsonError) {

            console.error(
                "Session endpoint returned invalid JSON:",
                jsonError
            );
        }


        console.log(
            "Session verification response:",
            sessionData
        );


        // ====================================================
        // SESSION VALID
        // ====================================================

        if (
            sessionResponse.ok &&
            sessionData.success
        ) {

            console.log(
                "Admin session verified successfully."
            );


            showMessage(
                "Login successful. Opening dashboard...",
                "success"
            );


            // Small delay so the success message
            // can be displayed.
            setTimeout(
                function () {

                    window.location.href =
                        "admin-dashboard.html";

                },
                300
            );


            return;
        }


        // ====================================================
        // SESSION NOT VALID
        // ====================================================

        console.error(
            "Admin login succeeded but session verification failed."
        );


        showMessage(
            "Login was successful, but the admin session could not be verified. Please refresh the page and try again."
        );


        if (loginButton) {

            loginButton.disabled = false;

            loginButton.textContent =
                "LOGIN";
        }


    }

    catch (error) {

        console.error(
            "Admin login error:",
            error
        );


        showMessage(
            "Unable to connect to the admin server. Please try again."
        );


        if (loginButton) {

            loginButton.disabled = false;

            loginButton.textContent =
                "LOGIN";
        }
    }
}


// ============================================================
// LOGIN FORM EVENT
// ============================================================

if (loginForm) {

    loginForm.addEventListener(
        "submit",
        loginAdmin
    );

} else {

    console.error(
        "Admin login form not found."
    );
}


// ============================================================
// ENTER KEY SUPPORT
// ============================================================

if (usernameInput) {

    usernameInput.addEventListener(
        "keydown",
        function (event) {

            if (
                event.key === "Enter"
            ) {

                if (passwordInput) {

                    passwordInput.focus();
                }
            }
        }
    );
}


// ============================================================
// INITIALIZATION
// ============================================================

async function initializeAdminLogin() {

    console.log(
        "========================================"
    );

    console.log(
        "SPARK 2026 ADMIN LOGIN"
    );

    console.log(
        "Production API:",
        `${BACKEND_URL}/api`
    );

    console.log(
        "Current website:",
        window.location.origin
    );

    console.log(
        "========================================"
    );


    await checkExistingSession();
}


// ============================================================
// START
// ============================================================

initializeAdminLogin();