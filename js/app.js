// js/app.js
document.addEventListener('DOMContentLoaded', () => {
    // Add simple spin animation CSS dynamically
    const style = document.createElement('style');
    style.textContent = `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
    `;
    document.head.appendChild(style);

    // --- Authentication Logic ---
    const loginOverlay = document.getElementById('login-overlay');
    const authForm = document.getElementById('auth-form');
    const authUsernameInput = document.getElementById('auth-username');
    const authPasswordInput = document.getElementById('auth-password');
    const btnAuthSubmit = document.getElementById('btn-auth-submit');
    const authError = document.getElementById('auth-error');
    
    const tabLogin = document.getElementById('tab-login');
    const tabSignup = document.getElementById('tab-signup');
    let isSignupMode = false;

    const showError = (msg) => {
        authError.textContent = msg;
        authError.style.display = 'block';
    };

    const hideError = () => {
        authError.style.display = 'none';
    };

    const toggleAuthMode = (signup) => {
        isSignupMode = signup;
        hideError();
        authForm.reset();
        if (signup) {
            tabSignup.classList.add('active');
            tabLogin.classList.remove('active');
            btnAuthSubmit.textContent = "Create Account";
        } else {
            tabLogin.classList.add('active');
            tabSignup.classList.remove('active');
            btnAuthSubmit.textContent = "Log In";
        }
    };

    if (tabLogin && tabSignup) {
        tabLogin.addEventListener('click', () => toggleAuthMode(false));
        tabSignup.addEventListener('click', () => toggleAuthMode(true));
    }

    const updateGreeting = () => {
        const greetingElem = document.getElementById('dashboard-greeting');
        const displayName = Storage.getDisplayName();
        if (greetingElem) {
            greetingElem.textContent = displayName ? `Welcome, ${displayName}! 👋` : 'Welcome back! 👋';
        }

        // Keep profile input in sync
        const profileUsernameInput = document.getElementById('profile-username');
        if (profileUsernameInput) {
            profileUsernameInput.value = displayName || '';
        }
    };

    const refreshUserUI = () => {
        updateGreeting();
        UI.renderSubjects();
        UI.renderTimetable();

        // Streak
        const streak = Storage.getStreak();
        const streakCardContent = document.querySelector('#dashboard-view .card:nth-child(3) p:first-of-type');
        if (streakCardContent) {
            streakCardContent.textContent = `${streak} Days`;
        }

        // Urgent revision
        const subjects = Storage.getSubjects();
        const hasUrgent = subjects.some(s => {
            const daysLeft = (new Date(s.examDate) - new Date()) / (1000 * 60 * 60 * 24);
            return daysLeft > 0 && daysLeft <= 7;
        });
        const revContainer = document.getElementById('revision-suggestions-container');
        if (revContainer) {
            revContainer.style.display = hasUrgent ? 'block' : 'none';
        }
    };

    const checkAuth = () => {
        if (!Storage.isLoggedIn()) {
            loginOverlay.classList.remove('hidden');
            const users = Storage.getAllUsers();
            // If no users exist at all, default to Sign Up
            if (Object.keys(users).length === 0) toggleAuthMode(true);
            else toggleAuthMode(false);
        } else {
            loginOverlay.classList.add('hidden');
            refreshUserUI();
        }
    };

    checkAuth();

    if (authForm) {
        authForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = authUsernameInput.value.trim();
            const pwd = authPasswordInput.value;

            if (!username || !pwd) {
                showError("Please fill in both fields.");
                return;
            }

            if (isSignupMode) {
                // Sign Up — create a NEW user
                const success = Storage.signup(username, pwd);
                if (success) {
                    loginOverlay.classList.add('hidden');
                    refreshUserUI();
                } else {
                    showError("Username already exists. Please log in or choose a different name.");
                }
            } else {
                // Log In — find existing user
                const result = Storage.login(username, pwd);
                if (result === 'success') {
                    loginOverlay.classList.add('hidden');
                    hideError();
                    refreshUserUI();
                } else if (result === 'not_found') {
                    showError("No account found with this username. Please sign up first.");
                } else if (result === 'wrong_password') {
                    showError("Incorrect password.");
                }
            }
        });
    }
    
    // --- Navigation Logic ---
    const navItems = document.querySelectorAll('.nav-item');
    const viewSections = document.querySelectorAll('.view-section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navItems.forEach(nav => nav.classList.remove('active'));
            viewSections.forEach(view => view.classList.remove('active'));
            
            item.classList.add('active');
            const targetId = item.getAttribute('data-target');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // --- Theme Switching ---
    const themeToggle = document.getElementById('theme-toggle');
    const isDark = localStorage.getItem('theme') === 'dark';
    
    if (isDark) {
        document.body.classList.replace('light-theme', 'dark-theme');
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', (e) => {
        if (e.target.checked) {
            document.body.classList.replace('light-theme', 'dark-theme');
            localStorage.setItem('theme', 'dark');
        } else {
            document.body.classList.replace('dark-theme', 'light-theme');
            localStorage.setItem('theme', 'light');
        }
    });

    // --- Timer Controls ---
    const timerDisplay = document.getElementById('timer-display');
    const btnStart = document.getElementById('timer-start');
    const btnReset = document.getElementById('timer-reset');

    btnStart.addEventListener('click', () => {
        if (Timer.isRunning) {
            Timer.stop();
            btnStart.textContent = 'Start';
        } else {
            Timer.start(
                (timeLeft) => { timerDisplay.textContent = Timer.formatTime(timeLeft); },
                () => { 
                    btnStart.textContent = 'Start'; 
                    timerDisplay.textContent = Timer.formatTime(Timer.duration); 
                }
            );
            btnStart.textContent = 'Pause';
        }
    });

    btnReset.addEventListener('click', () => {
        Timer.reset((timeLeft) => { timerDisplay.textContent = Timer.formatTime(timeLeft); });
        btnStart.textContent = 'Start';
    });

    // --- Subject Manager Form ---
    const addSubjectForm = document.getElementById('add-subject-form');
    if (addSubjectForm) {
        addSubjectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = document.getElementById('subject-name').value;
            const totalChapters = parseInt(document.getElementById('total-chapters').value);
            const examDate = document.getElementById('exam-date').value;

            const subjects = Storage.getSubjects();
            subjects.push({ name, totalChapters, examDate, completed: 0 });
            Storage.saveSubjects(subjects);
            
            UI.renderSubjects();
            addSubjectForm.reset();
        });
    }

    // --- Profile Settings ---
    
    // Profile: Update Account
    const updateProfileForm = document.getElementById('update-profile-form');
    
    if (updateProfileForm) {
        updateProfileForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const newUsername = document.getElementById('profile-username').value.trim();
            const newPwd = document.getElementById('new-password').value;
            
            if (newUsername) Storage.updateDisplayName(newUsername);
            if (newPwd) Storage.updatePassword(newPwd);
            
            updateGreeting();
            alert("Account settings updated successfully!");
            document.getElementById('new-password').value = '';
        });
    }

    // Profile: Logout
    const btnLogout = document.getElementById('btn-logout');
    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            Storage.logout();
            checkAuth(); // Show login screen
        });
    }

    // --- Offline Manual Features ---

    // Local Motivational Quotes
    const quotes = [
        "Success is the sum of small efforts, repeated day in and day out.",
        "Don't stop when you're tired. Stop when you're done.",
        "The secret of your future is hidden in your daily routine.",
        "Push yourself, because no one else is going to do it for you.",
        "Discipline is choosing between what you want now and what you want most."
    ];
    const quoteElem = document.getElementById('motivational-quote');
    if (quoteElem) {
        const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
        quoteElem.textContent = `"${randomQuote}"`;
    }

    // Timetable Form Submission
    const addTimetableForm = document.getElementById('add-timetable-form');
    if (addTimetableForm) {
        addTimetableForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const day = document.getElementById('time-day').value;
            const start = document.getElementById('time-start').value;
            const end = document.getElementById('time-end').value;
            const task = document.getElementById('time-task').value;

            const timetable = Storage.getTimetable();
            timetable.push({ day, start, end, task });
            Storage.saveTimetable(timetable);
            
            UI.renderTimetable();
            addTimetableForm.reset();
        });
    }

    // Initialize UI
    if (Storage.isLoggedIn()) {
        refreshUserUI();
    }

    // Feather icons
    if(window.feather) feather.replace();
});
