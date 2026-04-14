let state = {
  activeWorkout: null,
  timer: null,
  startTime: null
};

function db() {
  return JSON.parse(localStorage.getItem("gym_pro") || "[]");
}

function save(data) {
  localStorage.setItem("gym_pro", JSON.stringify(data));
}

/* ---------------- HOME ---------------- */

function renderHome() {
  const app = document.getElementById("app");
  const data = db();

  app.innerHTML = `
    <div class="card">
      <h2>האימונים שלי</h2>
      <button onclick="createWorkout()">+ יצירת אימון</button>
    </div>

    ${data.map(w => {
      const last = w.history?.[w.history.length - 1];

      return `
        <div class="card">
          <h3>${w.name}</h3>

          <div class="small">
            ${w.history?.length || 0} אימונים בוצעו
          </div>

          <button onclick="startWorkout('${w.id}')">התחל אימון</button>
          <button class="secondary" onclick="openHistory('${w.id}')">היסטוריה</button>
        </div>
      `;
    }).join("")}
  `;
}

/* ---------------- CREATE ---------------- */

function createWorkout() {
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="card">
      <h3>אימון חדש</h3>

      <input id="name" placeholder="שם אימון">

      <div id="exList"></div>

      <button onclick="addEx()">+ תרגיל</button>
      <button onclick="saveWorkout()">שמור</button>
      <button class="secondary" onclick="renderHome()">חזור</button>
    </div>
  `;
}

function addEx() {
  const div = document.createElement("div");
  div.className = "card";

  div.innerHTML = `
    <input placeholder="שם תרגיל">
    <input type="number" placeholder="סטים">
  `;

  document.getElementById("exList").appendChild(div);
}

function saveWorkout() {
  const name = document.getElementById("name").value;
  const cards = document.querySelectorAll("#exList .card");

  const exercises = Array.from(cards).map(c => {
    const inputs = c.querySelectorAll("input");

    return {
      name: inputs[0].value,
      sets: +inputs[1].value,
      logs: []
    };
  });

  const data = db();

  data.push({
    id: Date.now().toString(),
    name,
    exercises,
    history: [],
    pr: {}
  });

  save(data);
  renderHome();
}

/* ---------------- WORKOUT ---------------- */

function startWorkout(id) {
  const data = db();
  state.activeWorkout = data.find(w => w.id === id);
  state.startTime = Date.now();

  startTimer();
  renderWorkout();
}

function renderWorkout() {
  const w = state.activeWorkout;
  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="card">
      <h2>${w.name}</h2>
      <div id="timer">00:00</div>
    </div>

    ${w.exercises.map((ex, exIndex) => `
      <div class="card">
        <h3>${ex.name}</h3>

        ${Array.from({length: ex.sets}).map((_, setIndex) => `
          <div class="set">
            <input type="number" placeholder="משקל"
              onchange="logSet(${exIndex},${setIndex},'weight',this.value)">

            <input type="number" placeholder="חזרות"
              onchange="logSet(${exIndex},${setIndex},'reps',this.value)">
          </div>
        `).join("")}
      </div>
    `).join("")}

    <button onclick="finishWorkout()">סיום אימון</button>
  `;
}

/* ---------------- AUTO SAVE + PR ---------------- */

function logSet(exIndex, setIndex, key, value) {
  const data = db();
  const w = data.find(x => x.id === state.activeWorkout.id);

  if (!w.exercises[exIndex].logs[setIndex]) {
    w.exercises[exIndex].logs[setIndex] = {};
  }

  w.exercises[exIndex].logs[setIndex][key] = +value;

  // PR CHECK
  const exName = w.exercises[exIndex].name;

  const weight = +value;

  if (!w.pr[exName] || weight > w.pr[exName]) {
    w.pr[exName] = weight;
  }

  save(data);
}

/* ---------------- HISTORY ---------------- */

function openHistory(id) {
  const data = db();
  const w = data.find(x => x.id === id);

  const app = document.getElementById("app");

  app.innerHTML = `
    <div class="card">
      <h2>היסטוריה - ${w.name}</h2>
    </div>

    ${w.history.map(h => `
      <div class="card">
        <div>${new Date(h.date).toLocaleDateString()}</div>
      </div>
    `).join("")}

    <button onclick="renderHome()">חזור</button>
  `;
}

/* ---------------- FINISH ---------------- */

function finishWorkout() {
  const data = db();
  const w = data.find(x => x.id === state.activeWorkout.id);

  w.history.push({
    date: new Date().toISOString(),
    exercises: JSON.parse(JSON.stringify(w.exercises))
  });

  save(data);
  renderHome();
}

/* ---------------- TIMER ---------------- */

function startTimer() {
  setInterval(() => {
    const diff = Date.now() - state.startTime;
    const m = Math.floor(diff / 60000);
    const s = Math.floor((diff % 60000) / 1000);

    const el = document.getElementById("timer");
    if (el) el.innerText = `${m}:${s.toString().padStart(2,'0')}`;
  }, 1000);
}

/* INIT */
renderHome();