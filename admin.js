// ============================================================
// SPARK 2026 — ADMIN LOGIN
// ============================================================

// IMPORTANT:
// Use the SAME backend URL as admin-dashboard.js.
//
// Frontend:
// http://localhost:5500
//
// Backend:
// http://localhost:3000
// ============================================================

const BACKEND_URL =
    "";


// ============================================================
// GET LOGIN FORM
// ============================================================

// Supports either:
// id="adminLoginForm"
// or
// id="loginForm"

const loginForm =
    document.getElementById(
        "adminLoginForm"
    ) ||
    document.getElementById(
        "loginForm"
    );


// ============================================================
// GET USERNAME INPUT
// ============================================================

// Supports common IDs.

const usernameInput =
    document.getElementById(
        "username"
    ) ||
    document.getElementById(
        "adminUsername"
    ) ||
    document.getElementById(
        "adminUsernameInput"
    );


// ============================================================
// GET PASSWORD INPUT
// ============================================================

const passwordInput =
    document.getElementById(
        "password"
    ) ||
    document.getElementById(
        "adminPassword"
    ) ||
    document.getElementById(
        "adminPasswordInput"
    );


// ============================================================
// GET LOGIN BUTTON
// ============================================================

const loginButton =
    document.getElementById(
        "loginButton"
    ) ||
    document.getElementById(
        "adminLoginButton"
    );


// ============================================================
// GET MESSAGE ELEMENT
// ============================================================

const loginMessage =
    document.getElementById(
        "loginMessage"
    ) ||
    document.getElementById(
        "errorMessage"
    ) ||
    document.getElementById(
        "adminMessage"
    );


// ============================================================
// SHOW MESSAGE
// ============================================================

function showMessage(
    message,
    type = "error"
) {

    if (!loginMessage) {

        console.log(
            message
        );

        return;
    }


    loginMessage.textContent =
        message;


    loginMessage.style.display =
        "block";


    if (
        type === "success"
    ) {

        loginMessage.style.color =
            "#16a34a";

    }

    else {

        loginMessage.style.color =
            "#dc2626";
    }
}


// ============================================================
// CHECK EXISTING ADMIN SESSION
// ============================================================

async function checkExistingSession() {

    try {

        console.log(
            "Checking existing admin session..."
        );


        const response =
            await fetch(
                `${BACKEND_URL}/api/admin/session`,
                {
                    method: "GET",

                    // IMPORTANT
                    credentials: "include",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (
            response.ok
        ) {

            const data =
                await response.json();


            if (
                data.success
            ) {

                console.log(
                    "Existing admin session found."
                );


                // Already logged in.
                // Go directly to dashboard.

                window.location.href =
                    "admin-dashboard.html";

                return true;
            }
        }

    }

    catch (error) {

        console.log(
            "No existing admin session."
        );
    }


    return false;
}


// ============================================================
// ADMIN LOGIN
// ============================================================

async function loginAdmin(
    event
) {

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
    // VALIDATE
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

        loginButton.disabled =
            true;

        loginButton.textContent =
            "Logging in...";
    }


    showMessage(
        "Authenticating...",
        "success"
    );


    try {

        console.log(
            "Sending admin login request..."
        );


        // ====================================================
        // LOGIN REQUEST
        // ====================================================

        const response =
            await fetch(
                `${BACKEND_URL}/api/admin/login`,
                {
                    method: "POST",

                    // IMPORTANT
                    credentials: "include",

                    headers: {
                        "Content-Type":
                            "application/json",

                        "Accept":
                            "application/json"
                    },

                    body: JSON.stringify({
                        username:
                            username,

                        password:
                            password
                    })
                }
            );


        console.log(
            "Login HTTP status:",
            response.status
        );


        // ====================================================
        // READ SERVER RESPONSE
        // ====================================================

        const data =
            await response.json();


        console.log(
            "Login response:",
            data
        );


        // ====================================================
        // LOGIN FAILED
        // ====================================================

        if (
            !response.ok ||
            !data.success
        ) {

            showMessage(
                data.message ||
                "Invalid username or password."
            );


            if (loginButton) {

                loginButton.disabled =
                    false;

                loginButton.textContent =
                    "LOGIN";
            }


            return;
        }


        // ====================================================
        // LOGIN SUCCESS
        // ====================================================

        showMessage(
            "Login successful. Opening dashboard...",
            "success"
        );


        console.log(
            "Admin login successful."
        );


        // ====================================================
        // VERIFY THAT COOKIE SESSION WORKS
        // ====================================================
        //
        // This is an extra safety check.
        //
        // The backend creates the HTTP-only
        // spark_admin_token cookie during login.
        //
        // We immediately call /session to make
        // sure the browser is actually sending it.
        // ====================================================

        const sessionResponse =
            await fetch(
                `${BACKEND_URL}/api/admin/session`,
                {
                    method: "GET",

                    // VERY IMPORTANT
                    credentials: "include",

                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        console.log(
            "Session verification status:",
            sessionResponse.status
        );


        const sessionData =
            await sessionResponse.json();


        console.log(
            "Session verification response:",
            sessionData
        );


        // ====================================================
        // COOKIE / SESSION FAILED
        // ====================================================

        if (
            !sessionResponse.ok ||
            !sessionData.success
        ) {

            showMessage(
                "Login succeeded, but the admin session cookie was not accepted. Please use http://localhost:5500 and try again."
            );


            if (loginButton) {

                loginButton.disabled =
                    false;

                loginButton.textContent =
                    "LOGIN";
            }


            return;
        }


        // ====================================================
        // EVERYTHING IS GOOD
        // ====================================================

        console.log(
            "Admin session verified successfully."
        );


        window.location.href =
            "admin-dashboard.html";

    }

    catch (error) {

        console.error(
            "Admin login error:",
            error
        );


        showMessage(
            "Unable to connect to the backend server. Please make sure server.js is running on port 3000."
        );


        if (loginButton) {

            loginButton.disabled =
                false;

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

}

else {

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
        event => {

            if (
                event.key ===
                "Enter"
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
        "Backend:",
        BACKEND_URL
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