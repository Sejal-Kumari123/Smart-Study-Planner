// js/timer.js
const Timer = {
    duration: 25 * 60, // 25 mins in seconds
    timeLeft: 25 * 60,
    timerInterval: null,
    isRunning: false,

    start: function(onTick, onComplete) {
        if (this.isRunning) return;
        this.isRunning = true;
        
        // Request Notification permission if possible
        if (window.Notification && Notification.permission !== "granted" && Notification.permission !== "denied") {
            Notification.requestPermission();
        }

        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            onTick(this.timeLeft);

            if (this.timeLeft <= 0) {
                this.stop();
                this.timeLeft = this.duration; // Reset
                if (window.Notification && Notification.permission === "granted") {
                    new Notification("Pomodoro Complete!", { body: "Great job! Time for a 5-minute break." });
                }
                onComplete();
            }
        }, 1000);
    },

    stop: function() {
        clearInterval(this.timerInterval);
        this.isRunning = false;
    },
    
    reset: function(onTick) {
        this.stop();
        this.timeLeft = this.duration;
        if (onTick) onTick(this.timeLeft);
    },

    formatTime: function(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
};
