// שליפה ושמירה של הנתונים
function getWorkouts() {
    return JSON.parse(localStorage.getItem("workouts") || "[]");
}

function saveWorkouts(workouts) {
    localStorage.setItem("workouts", JSON.stringify(workouts));
}

// מסך ראשי
function renderHome() {
    const app = document.getElementById("app");
    const workouts = getWorkouts();

    if (workouts.length === 0) {
        app.innerHTML = "<p style='text-align:center'>אין אימונים. לחץ על ➕ כדי להוסיף.</p>";
        return;
    }

    app.innerHTML = workouts.map(w => `
        <div class="workout-card">
            <h2>${w.name}</h2>
            <button onclick="openWorkout('${w.id}')">פתח</button>
            <button onclick="editWorkout('${w.id}')">ערוך</button>
            <button onclick="deleteWorkout('${w.id}')">מחק</button>
        </div>
    `).join("");
}

// יצירת אימון חדש
function showCreateWorkout() {
    const app = document.getElementById("app");
    app.innerHTML = `
        <h2>אימון חדש</h2>
        <input id="workoutName" placeholder="שם האימון">
        <div id="exercises"></div>
        <button onclick="addExercise()">➕ הוסף תרגיל</button>
        <br><br>
        <button onclick="saveWorkout()">💾 שמור</button>
        <button onclick="renderHome()">⬅ חזור</button>
    `;
}

function addExercise(name = "", sets = 3) {
    const container = document.getElementById("exercises");
    const div = document.createElement("div");
    div.className = "exercise-card";
    div.innerHTML = `
        <input placeholder="שם התרגיל" value="${name}">
        <input type="number" placeholder="מספר סטים" value="${sets}">
        <button onclick="this.parentElement.remove()">❌</button>
    `;
    container.appendChild(div);
}

function saveWorkout() {
    const name = document.getElementById("workoutName").value;
    if (!name) return alert("יש להזין שם לאימון");

    const exercises = Array.from(document.querySelectorAll("#exercises .exercise-card"))
        .map(div => {
            const inputs = div.querySelectorAll("input");
            return {
                name: inputs[0].value,
                sets: parseInt(inputs[1].value),
                logs: Array(parseInt(inputs[1].value)).fill({ weight: "", reps: "", rpe: "" })
            };
        });

    const workouts = getWorkouts();
    workouts.push({ id: Date.now().toString(), name, exercises });
    saveWorkouts(workouts);
    renderHome();
}

// פתיחת אימון והזנת נתונים
function openWorkout(id) {
    const workouts = getWorkouts();
    const workout = workouts.find(w => w.id === id);
    const app = document.getElementById("app");

    app.innerHTML = `
        <h2>${workout.name}</h2>
        ${workout.exercises.map((ex, exIndex) => `
            <div class="exercise-card">
                <h3>${ex.name}</h3>
                ${Array.from({ length: ex.sets }).map((_, setIndex) => `
                    <div class="set-row">
                        <input type="number" placeholder="משקל"
                            value="${ex.logs[setIndex]?.weight || ''}"
                            onchange="updateSet('${id}', ${exIndex}, ${setIndex}, 'weight', this.value)">
                        <input type="number" placeholder="חזרות"
                            value="${ex.logs[setIndex]?.reps || ''}"
                            onchange="updateSet('${id}', ${exIndex}, ${setIndex}, 'reps', this.value)">
                        <input type="number" placeholder="RPE"
                            value="${ex.logs[setIndex]?.rpe || ''}"
                            onchange="updateSet('${id}', ${exIndex}, ${setIndex}, 'rpe', this.value)">
                    </div>
                `).join("")}
            </div>
        `).join("")}
        <button onclick="renderHome()">⬅ חזור</button>
    `;
}

// עדכון סט
function updateSet(workoutId, exIndex, setIndex, field, value) {
    const workouts = getWorkouts();
    const workout = workouts.find(w => w.id === workoutId);
    workout.exercises[exIndex].logs[setIndex][field] = value;
    saveWorkouts(workouts);
}

// מחיקה
function deleteWorkout(id) {
    if (!confirm("למחוק את האימון?")) return;
    const workouts = getWorkouts().filter(w => w.id !== id);
    saveWorkouts(workouts);
    renderHome();
}

// עריכה (טעינת הנתונים למסך יצירה)
function editWorkout(id) {
    const workouts = getWorkouts();
    const workout = workouts.find(w => w.id === id);
    showCreateWorkout();
    document.getElementById("workoutName").value = workout.name;
    workout.exercises.forEach(ex => addExercise(ex.name, ex.sets));
}

// רישום Service Worker
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js');
}

// טעינה ראשונית
renderHome();