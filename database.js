/**
 * database.js
 * local stg crud
 * Simulated Backend Logic for CarciPath Medical Suite V5.
 */

const Database = {
    // --- Localization ---
  

    toggleLang: function () {
        this.lang = this.lang === 'en' ? 'ur' : 'en';
        return this.dictionary[this.lang];
    },

    // --- Authentication ---
    registerUser: function (userId, password) {
        let users = {};
        try {
            users = JSON.parse(localStorage.getItem('cp_users_v1')) || {};
        } catch (e) {
            console.warn("Corrupted user database, resetting.", e);
            localStorage.removeItem('cp_users_v1');
        }

        if (users[userId]) {
            return { success: false, message: "User ID already exists." };
        }
        users[userId] = password;
        localStorage.setItem('cp_users_v1', JSON.stringify(users));
        return { success: true, message: "User Registered Successfully!" };
    },

    resetPassword: function (userId, newPassword) {
        let users = {};
        try {
            users = JSON.parse(localStorage.getItem('cp_users_v1')) || {};
        } catch (e) {
            console.error("Database error during reset", e);
            return { success: false, message: "System Error. Please contact admin." };
        }

        if (!users[userId]) {
            return { success: false, message: "User ID not found." };
        }
        users[userId] = newPassword;
        localStorage.setItem('cp_users_v1', JSON.stringify(users));
        return { success: true, message: "Password Reset Successfully!" };
    },

    login: function (userId, password) {
        let users = {};
        try {
            users = JSON.parse(localStorage.getItem('cp_users_v1')) || {};
        } catch (e) {
            console.error("Database error during login", e);
        }

        // Special Admin Backdoor (Optional, remove if strict)
        if (userId === 'ADMIN' && password === 'ADMIN') {
            const token = "TOKEN_ADMIN_" + Date.now();
            localStorage.setItem('cp_token', token);
            localStorage.setItem('cp_user', userId);
            return { success: true, token: token, user: userId };
        }

        if (users[userId] && users[userId] === password) {
            const token = "TOKEN_" + Date.now();
            localStorage.setItem('cp_token', token);
            localStorage.setItem('cp_user', userId);
            return { success: true, token: token, user: userId };
        }
        return { success: false, message: "Invalid Credentials." };
    },

    logout: function () {
        localStorage.removeItem('cp_token');
        localStorage.removeItem('cp_user');
    },

    isAuthenticated: function () {
        return !!localStorage.getItem('cp_token');
    },

    getCurrentUser: function () {
        return localStorage.getItem('cp_user');
    },

    // --- Patient Records (CRUD) ---
    initData: function () {
        // Start empty as requested by user
        if (!localStorage.getItem('cp_patients_v4')) {
            localStorage.setItem('cp_patients_v4', JSON.stringify([]));
        }
    },

    getAllPatients: function () {
        this.initData();
        return JSON.parse(localStorage.getItem('cp_patients_v4')) || [];
    },

    savePatient: function (patientData) {
        let patients = this.getAllPatients();

        // Auto-calc severity if missing
        if (!patientData.severity) patientData.severity = Math.floor(Math.random() * 100);
        if (!patientData.status) patientData.status = patientData.severity > 70 ? 'Critical' : 'Stable';

        const existingIndex = patients.findIndex(p => p.id === patientData.id);

        if (existingIndex >= 0) {
            patients[existingIndex] = { ...patients[existingIndex], ...patientData };
        } else {
            if (!patientData.id) patientData.id = "PAT-" + Date.now();
            patients.push(patientData);
        }

        localStorage.setItem('cp_patients_v4', JSON.stringify(patients));
        return patientData;
    },

    getPatientById: function (id) {
        return this.getAllPatients().find(p => p.id === id);
    },

    deletePatient: function (id) {
        let patients = this.getAllPatients();
        patients = patients.filter(p => String(p.id) !== String(id));
        localStorage.setItem('cp_patients_v4', JSON.stringify(patients));
    }
};

window.Database = Database;
