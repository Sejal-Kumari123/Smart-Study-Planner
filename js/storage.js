// js/storage.js — Multi-User Local Storage System
const Storage = {

    // --- User Management ---
    getAllUsers: () => JSON.parse(localStorage.getItem('all_users')) || {},
    saveAllUsers: (users) => localStorage.setItem('all_users', JSON.stringify(users)),

    getCurrentUser: () => localStorage.getItem('current_user') || null,
    setCurrentUser: (username) => localStorage.setItem('current_user', username),

    signup: (username, password) => {
        const users = Storage.getAllUsers();
        if (users[username.toLowerCase()]) return false; // User already exists
        users[username.toLowerCase()] = {
            displayName: username,
            password: password,
            subjects: [],
            streak: 0,
            timetable: []
        };
        Storage.saveAllUsers(users);
        Storage.setCurrentUser(username.toLowerCase());
        return true;
    },

    login: (username, password) => {
        const users = Storage.getAllUsers();
        const user = users[username.toLowerCase()];
        if (!user) return 'not_found';
        if (user.password !== password) return 'wrong_password';
        Storage.setCurrentUser(username.toLowerCase());
        return 'success';
    },

    logout: () => localStorage.removeItem('current_user'),

    isLoggedIn: () => !!localStorage.getItem('current_user'),

    getDisplayName: () => {
        const users = Storage.getAllUsers();
        const current = Storage.getCurrentUser();
        return current && users[current] ? users[current].displayName : '';
    },

    // --- User-Scoped Data Helpers ---
    _getUserData: () => {
        const users = Storage.getAllUsers();
        const current = Storage.getCurrentUser();
        return current && users[current] ? users[current] : null;
    },

    _setUserField: (field, value) => {
        const users = Storage.getAllUsers();
        const current = Storage.getCurrentUser();
        if (current && users[current]) {
            users[current][field] = value;
            Storage.saveAllUsers(users);
        }
    },

    // --- Subjects (Scoped to current user) ---
    getSubjects: () => {
        const data = Storage._getUserData();
        return data ? data.subjects || [] : [];
    },
    saveSubjects: (subjects) => Storage._setUserField('subjects', subjects),

    // --- Streak (Scoped to current user) ---
    getStreak: () => {
        const data = Storage._getUserData();
        return data ? parseInt(data.streak) || 0 : 0;
    },
    setStreak: (streak) => Storage._setUserField('streak', streak),

    // --- Timetable (Scoped to current user) ---
    getTimetable: () => {
        const data = Storage._getUserData();
        return data ? data.timetable || [] : [];
    },
    saveTimetable: (timetable) => Storage._setUserField('timetable', timetable),

    // --- Profile: Update Password ---
    updatePassword: (newPwd) => {
        const users = Storage.getAllUsers();
        const current = Storage.getCurrentUser();
        if (current && users[current]) {
            users[current].password = newPwd;
            Storage.saveAllUsers(users);
        }
    },

    // --- Profile: Update Display Name ---
    updateDisplayName: (newName) => {
        const users = Storage.getAllUsers();
        const current = Storage.getCurrentUser();
        if (current && users[current]) {
            users[current].displayName = newName;
            Storage.saveAllUsers(users);
        }
    }
};
