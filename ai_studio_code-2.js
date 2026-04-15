let workoutHistory = JSON.parse(localStorage.getItem('workoutHistory')) || [];
let currentExercises = [];

// App State Management
function switchTab(tabId, event) {
    document.querySelectorAll('.screen').forEach(s => s.classList.add('hidden'));
    document.getElementById(`screen-${tabId}`).classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    if(event) event.currentTarget.classList.add('active');

    if(tabId === 'statistics') initStats();
    if(tabId === 'profile') updateProfile();
}

// Exercise/Set Logic
function addExerciseField() {
    const id = Date.now();
    const exerciseHtml = `
        <div class="exercise-card" id="ex-${id}">
            <input type="text" placeholder="שם התרגיל" class="ex-name">
            <input type="text" placeholder="קישור לוידאו (YouTube)" class="ex-video">
            <div class="superset-toggle">
                <label><input type="checkbox" class="is-superset"> סופר-סט עם התרגיל הבא (X)</label>
            </div>
            <div class="sets-container"></div>
            <button class="btn-secondary" style="font-size:0.8rem" onclick="addSetField('${id}')">+ סט</button>
        </div>
    `;
    document.getElementById('exercises-container').insertAdjacentHTML('beforeend', exerciseHtml);
}

function addSetField(exId) {
    const container = document.querySelector(`#ex-${exId} .sets-container`);
    const setHtml = `
        <div class="set-row">
            <input type="number" placeholder="משקל" class="set-w">
            <input type="number" placeholder="חזרות" class="set-r">
            <div class="difficulty-selector">
                <input type="radio" name="diff-${exId}-${Date.now()}" value="קל" id="e-${Date.now()}">
                <label for="e-${Date.now()}">קל</label>
                <input type="radio" name="diff-${exId}-${Date.now()}" value="בינוני" id="m-${Date.now()}" checked>
                <label for="m-${Date.now()}">בינוני</label>
                <input type="radio" name="diff-${exId}-${Date.now()}" value="קשה" id="h-${Date.now()}">
                <label for="h-${Date.now()}">קשה</label>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', setHtml);
}

// Saving
function saveCurrentWorkout() {
    const name = document.getElementById('workout-name-input').value || "אימון ללא שם";
    const exerciseElements = document.querySelectorAll('.exercise-card');
    const workoutData = {
        id: Date.now(),
        date: new Date().toLocaleDateString('he-IL'),
        timestamp: Date.now(),
        name: name,
        exercises: []
    };

    exerciseElements.forEach(el => {
        const sets = [];
        el.querySelectorAll('.set-row').forEach(row => {
            sets.push({
                weight: row.querySelector('.set-w').value,
                reps: row.querySelector('.set-r').value,
                difficulty: row.querySelector('input:checked').value
            });
        });

        workoutData.exercises.push({
            name: el.querySelector('.ex-name').value,
            video: el.querySelector('.ex-video').value,
            isSuperset: el.querySelector('.is-superset').checked,
            sets: sets
        });
    });

    workoutHistory.push(workoutData);
    localStorage.setItem('workoutHistory', JSON.stringify(workoutHistory));
    alert('האימון נשמר בהצלחה!');
    location.reload();
}

// History UI
function renderHistory() {
    const list = document.getElementById('history-list');
    list.innerHTML = workoutHistory.slice().reverse().map(w => `
        <div class="exercise-card" style="border-right-color: #333">
            <div style="display:flex; justify-content:space-between">
                <strong>${w.name}</strong>
                <small>${w.date}</small>
            </div>
            <div style="font-size: 0.8rem; margin-top:10px; color: var(--text-dim)">
                ${w.exercises.length} תרגילים
            </div>
        </div>
    `).join('');
}

// Statistics Logic
let myChart;
function initStats() {
    const select = document.getElementById('stats-exercise-select');
    const exercises = [...new Set(workoutHistory.flatMap(w => w.exercises.map(e => e.name)))];
    
    select.innerHTML = '<option value="">בחר תרגיל</option>' + 
        exercises.map(e => `<option value="${e}">${e}</option>`).join('');
}

function updateChart() {
    const exerciseName = document.getElementById('stats-exercise-select').value;
    if(!exerciseName) return;

    const dataPoints = [];
    workoutHistory.forEach(w => {
        const ex = w.exercises.find(e => e.name === exerciseName);
        if(ex && ex.sets.length > 0) {
            const maxWeight = Math.max(...ex.sets.map(s => parseFloat(s.weight || 0)));
            dataPoints.push({ date: w.date, weight: maxWeight });
        }
    });

    if(myChart) myChart.destroy();
    const ctx = document.getElementById('statsChart').getContext('2d');
    myChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: dataPoints.map(d => d.date),
            datasets: [{
                label: 'משקל מקסימלי (ק"ג)',
                data: dataPoints.map(d => d.weight),
                borderColor: '#ff0000',
                tension: 0.3,
                fill: true,
                backgroundColor: 'rgba(255, 0, 0, 0.1)'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: { y: { beginAtZero: false, grid: { color: '#222' } } }
        }
    });
}

function updateProfile() {
    document.getElementById('total-workouts').innerText = workoutHistory.length;
    const volume = workoutHistory.reduce((acc, w) => {
        return acc + w.exercises.reduce((exAcc, ex) => {
            return exAcc + ex.sets.reduce((sAcc, s) => sAcc + (parseFloat(s.weight||0) * parseFloat(s.reps||0)), 0);
        }, 0);
    }, 0);
    document.getElementById('total-volume').innerText = Math.round(volume).toLocaleString() + ' ק"ג';
}

document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
});