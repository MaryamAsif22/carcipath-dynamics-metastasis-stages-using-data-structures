console.log("Auth Logic Loaded");

window.switchAuthTab = function (tab) {
    console.log("switchAuthTab called", tab);
    if (!tab) return;

    // Remove active classes
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => {
        f.classList.remove('active');
        f.style.display = 'none'; // Force hide
    });

    // Activate clicked tab
    tab.classList.add('active');
    const targetId = tab.getAttribute('data-target');
    const targetForm = document.getElementById(targetId);
    if (targetForm) {
        targetForm.classList.add('active');
        targetForm.style.display = 'flex'; // Force show
        console.log(`Switched to ${targetId}`);
    } else {
        console.error("Target form not found:", targetId);
    }
};

// Auto-bind if inline onclicks fail for some reason (backup)
document.addEventListener('DOMContentLoaded', () => {
    console.log("Auth Logic DOMContentLoaded");
    const tabs = document.querySelectorAll('.auth-tab');
    tabs.forEach(tab => {
        // Re-attach if needed, but inline should work.
        // This is just a debug verification log.
        console.log("Tab found:", tab.innerText);
    });
});

// --- GLOBAL FORM HANDLERS ---
window.handleLogin = function (e) {
    if (e) e.preventDefault();

    const id = document.getElementById('login-id').value.trim().toUpperCase();
    const pass = document.getElementById('login-pass').value;
    const msg = document.getElementById('login-msg');

    if (!id || !pass) {
        if (msg) msg.innerText = "Please enter valid credentials.";
        return;
    }

    // Ensure Database is available
    if (typeof Database === 'undefined') {
        console.error("Database not loaded");
        if (msg) msg.innerText = "Error: Database not loaded.";
        return;
    }

    const res = Database.login(id, pass);
    if (res.success) {
        console.log("Login Success:", res);
        if (window.App && window.App.checkAuth) {
            window.App.checkAuth();
        } else {
            console.warn("App.checkAuth not found, manual override");
            // Fallback manual transition
            const overlay = document.getElementById('view-login');
            const layout = document.getElementById('app-layout');
            if (overlay) overlay.classList.add('hidden');
            if (layout) layout.classList.remove('hidden');
        }
    } else {
        if (msg) msg.innerText = res.message;
    }
};

window.handleRegister = function (e) {
    if (e) e.preventDefault();

    const id = document.getElementById('reg-id').value.trim().toUpperCase();
    const pass = document.getElementById('reg-pass').value;
    const confirm = document.getElementById('reg-confirm').value;
    const msg = document.getElementById('reg-msg');

    if (!id || !pass) {
        if (msg) msg.innerText = "All fields required.";
        return;
    }
    if (pass !== confirm) {
        if (msg) msg.innerText = "Passwords do not match.";
        return;
    }

    const res = Database.registerUser(id, pass);
    if (res.success) {
        alert("Account Created! Please Login.");
        // Switch to login tab
        const loginTab = document.querySelector('[data-target="form-login"]');
        if (loginTab && window.switchAuthTab) {
            window.switchAuthTab(loginTab);
        }
    } else {
        if (msg) msg.innerText = res.message;
    }
};
