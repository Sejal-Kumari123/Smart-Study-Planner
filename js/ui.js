// js/ui.js
const UI = {
    renderSubjects: function() {
        const subjects = Storage.getSubjects();
        const list = document.getElementById('subjects-list');
        if (!list) return;
        
        list.innerHTML = '';
        
        let totalChapters = 0;
        let completedChapters = 0;

        if (subjects.length === 0) {
            list.innerHTML = `<p style="color: var(--text-muted); grid-column: 1 / -1;">No subjects added yet. Add one above!</p>`;
        }

        subjects.forEach((sub, index) => {
            const total = parseInt(sub.totalChapters);
            const completed = parseInt(sub.completed || 0);
            
            totalChapters += total;
            completedChapters += completed;

            const card = document.createElement('div');
            card.className = 'card';
            card.innerHTML = `
                <div class="flex justify-between items-center">
                    <h3 style="font-size: 1.1rem; font-weight: 600;">${sub.name}</h3>
                    <button class="btn btn-primary" style="padding: 0.25rem 0.5rem; font-size: 0.8rem;" onclick="UI.incrementChapter(${index})" ${completed >= total ? 'disabled' : ''}>+1 Chapter</button>
                </div>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin-top: 0.5rem;">Exam: ${sub.examDate}</p>
                <div style="margin-top: 1rem;">
                    <div class="flex justify-between" style="font-size: 0.8rem; margin-bottom: 0.25rem;">
                        <span>Progress</span>
                        <span>${completed}/${total}</span>
                    </div>
                    <div style="width: 100%; height: 6px; background: var(--bg-color); border-radius: 3px;">
                        <div style="width: ${(completed/total)*100}%; height: 100%; background: var(--primary-color); border-radius: 3px; transition: width 0.3s ease;"></div>
                    </div>
                </div>
            `;
            list.appendChild(card);
        });

        this.updateOverallProgress(totalChapters, completedChapters);
    },

    incrementChapter: function(index) {
        const subjects = Storage.getSubjects();
        if ((subjects[index].completed || 0) < subjects[index].totalChapters) {
            subjects[index].completed = (subjects[index].completed || 0) + 1;
            Storage.saveSubjects(subjects);
            this.renderSubjects(); // Re-render
        }
    },

    updateOverallProgress: function(total, completed) {
        const percentage = total === 0 ? 0 : Math.round((completed / total) * 100);
        
        const progressCard = document.querySelector('#dashboard-view .card:first-child');
        if(progressCard) {
             progressCard.innerHTML = `
                <h2>Overall Progress</h2>
                <div class="flex items-center justify-between">
                    <span style="font-size: 2rem; font-weight: 700; color: var(--primary-color);">${percentage}%</span>
                    <span>${completed}/${total} Chapters</span>
                </div>
                <div style="width: 100%; height: 8px; background: var(--bg-color); border-radius: 4px; margin-top: 1rem;">
                    <div style="width: ${percentage}%; height: 100%; background: var(--primary-color); border-radius: 4px; transition: width 0.3s ease;"></div>
                </div>
            `;
        }
    },

    renderTimetable: function() {
        const timetable = Storage.getTimetable();
        const containerToday = document.getElementById('today-schedule-container');
        const containerFull = document.getElementById('full-timetable-list');
        
        if (containerToday) containerToday.innerHTML = '';
        if (containerFull) containerFull.innerHTML = '';

        if (timetable.length === 0) {
            if(containerToday) containerToday.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">No revision blocks added for today. Go to the Timetable tab!</p>';
            if(containerFull) containerFull.innerHTML = '<p style="color: var(--text-muted);">No blocks added yet.</p>';
            return;
        }

        // Sort by time
        timetable.sort((a, b) => a.start.localeCompare(b.start));

        let hasToday = false;

        timetable.forEach((block, index) => {
            const cardHtml = `
                <div class="card" style="display: flex; justify-content: space-between; align-items: center; padding: 1rem 1.5rem; border-left: 4px solid var(--primary-color);">
                    <div>
                        <div style="font-size: 0.85rem; color: var(--primary-color); font-weight: 600; margin-bottom: 0.25rem;">
                            <i data-feather="clock" style="width: 12px; height: 12px; margin-right: 4px;"></i> ${block.start} - ${block.end}
                        </div>
                        <div style="font-weight: 500;">${block.task}</div>
                        ${block.day !== 'Today' ? `<div style="font-size: 0.8rem; color: var(--text-muted); margin-top: 0.25rem;">${block.day}</div>` : ''}
                    </div>
                    <button class="btn" style="background: rgba(236, 72, 153, 0.1); color: var(--accent-color); padding: 0.5rem;" onclick="UI.deleteTimetableBlock(${index})">
                        <i data-feather="trash-2" style="width: 16px; height: 16px;"></i>
                    </button>
                </div>
            `;

            if (containerFull) containerFull.innerHTML += cardHtml;

            if (block.day === 'Today' && containerToday) {
                containerToday.innerHTML += cardHtml;
                hasToday = true;
            }
        });

        if (!hasToday && containerToday) {
            containerToday.innerHTML = '<p style="color: var(--text-muted); grid-column: 1/-1;">No revision blocks added for today. Take a break!</p>';
        }

        if(window.feather) feather.replace();
    },

    deleteTimetableBlock: function(index) {
        const timetable = Storage.getTimetable();
        timetable.splice(index, 1);
        Storage.saveTimetable(timetable);
        this.renderTimetable();
    }
};
