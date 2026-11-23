// ==================== DATA ====================
let programWeek = parseInt(localStorage.getItem('programWeek')) || 1;

let workouts = JSON.parse(localStorage.getItem('workouts')) || {
  1: { mon: 0, wed: 0, fri: 0 },
  2: { mon: 0, wed: 0, fri: 0 },
  3: { mon: 0, wed: 0, fri: 0 },
  4: { mon: 0, wed: 0, fri: 0 },
  5: { mon: 0, wed: 0, fri: 0 },
  6: { mon: 0, wed: 0, fri: 0 },
  7: { mon: 0, wed: 0, fri: 0 },
  8: { mon: 0, wed: 0, fri: 0 }
};

let weeklyExercises = {
  1: {
    mon: [
      { name: "Присед с гантелью", sets: 2, reps: 10, weight: 0 },
      { name: "Румынская тяга", sets: 2, reps: 10, weight: 0 },
      { name: "Ягодичный мост", sets: 3, reps: 12, weight: 0 },
      { name: "Сгибание ног в тренажёре", sets: 2, reps: 12, weight: 0 },
      { name: "Отведение ноги", sets: 2, reps: 12, weight: 0 },
      { name: "Планка", sets: 2, reps: 20, weight: 0, unit: "сек" }
    ],
    wed: [
      { name: "Интервалы на эллипсе", sets: 6, reps: 1, weight: 0, unit: "круг" },
      { name: "Спокойное кардио", sets: 1, reps: 15, weight: 0, unit: "мин" },
      { name: "Ягодичный мост", sets: 2, reps: 15, weight: 0 },
      { name: "Ракушка с резинкой", sets: 2, reps: 12, weight: 0 }
    ],
    fri: [
      { name: "Выпады назад", sets: 2, reps: 8, weight: 0 },
      { name: "Зашагивания на платформу", sets: 2, reps: 8, weight: 0 },
      { name: "Тяга TRX", sets: 2, reps: 10, weight: 0 },
      { name: "Жим гантелей лёжа", sets: 2, reps: 10, weight: 0 },
      { name: "Ягодичный мост с паузой", sets: 3, reps: 12, weight: 0 }
    ]
  }
};

let currentWorkout = [];
let currentDay = null;
let remindersEnabled = localStorage.getItem('reminders') !== 'false';

// ==================== SAVE DATA ====================
function saveData() {
  localStorage.setItem('workouts', JSON.stringify(workouts));
  localStorage.setItem('programWeek', programWeek);
  localStorage.setItem('reminders', remindersEnabled);
}

// ==================== RENDER HOME ====================
function renderHome() {
  const today = new Date();
  const dayName = today.toLocaleDateString('ru-RU', { weekday: 'long' });
  document.getElementById('today-exercise').textContent = `${dayName} — Ноги и ягодицы`;
  document.getElementById('current-date').textContent = today.toLocaleDateString('ru-RU');
  document.getElementById('home-week').textContent = programWeek;

  const totalCompleted = Object.values(workouts).reduce((sum, week) => 
    sum + Object.values(week).filter(v => v === 1).length, 0);
  const progress = Math.round((totalCompleted / 24) * 100);
  document.getElementById('home-progress').textContent = `${progress}%`;

  // Next day
  const dayOfWeek = today.getDay();
  let nextDay = 'Понедельник';
  if (dayOfWeek < 1) nextDay = 'Понедельник';
  else if (dayOfWeek < 3) nextDay = 'Среда';
  else if (dayOfWeek < 5) nextDay = 'Пятница';
  else nextDay = 'Понедельник';
  document.getElementById('next-day').textContent = nextDay;
}

// ==================== START WORKOUT ====================
function startWorkout() {
  const dayKey = getDayKey();
  const exercises = weeklyExercises[programWeek]?.[dayKey] || weeklyExercises[1][dayKey];
  
  currentWorkout = exercises.map(ex => ({...ex, completed: false}));
  currentDay = new Date().toLocaleDateString('ru-RU', { weekday: 'long' });
  
  hideAllScreens();
  document.getElementById('workout-screen').classList.remove('hidden');
  document.getElementById('workout-day').textContent = `Неделя ${programWeek} · ${currentDay}`;
  
  renderExercises();
}

function getDayKey() {
  const day = new Date().getDay();
  if (day === 1) return 'mon';
  if (day === 3) return 'wed';
  return 'fri';
}

function renderExercises() {
  const container = document.getElementById('exercises-list');
  container.innerHTML = '';

  currentWorkout.forEach((ex, index) => {
    const card = document.createElement('div');
    const unit = ex.unit || 'повт';
    card.className = `exercise-card bg-white p-4 rounded-3xl shadow ${ex.completed ? 'completed' : 'incomplete'}`;
    card.innerHTML = `
      <div class="flex items-center justify-between">
        <div class="flex-1">
          <div class="font-medium">${ex.name}</div>
          <div class="text-sm text-gray-500">${ex.sets} × ${ex.reps} ${unit}</div>
        </div>
        <div class="flex items-center gap-3">
          ${ex.weight !== undefined && !ex.unit ? `
            <input type="number" value="${ex.weight}" 
                   class="w-16 text-center border rounded-xl p-2 text-sm" 
                   onchange="updateWeight(${index}, this.value)">
            <span class="text-xs text-gray-400">кг</span>
          ` : ''}
          <button onclick="toggleComplete(${index})" 
                  class="w-10 h-10 rounded-2xl flex items-center justify-center text-2xl">
            ${ex.completed ? '✅' : '⬜'}
          </button>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

function toggleComplete(index) {
  currentWorkout[index].completed = !currentWorkout[index].completed;
  renderExercises();
}

function updateWeight(index, value) {
  currentWorkout[index].weight = parseFloat(value) || 0;
}

function cancelWorkout() {
  if (confirm('Отменить тренировку?')) {
    showHome();
  }
}

function endWorkout() {
  const completed = currentWorkout.filter(ex => ex.completed).length;
  if (completed < currentWorkout.length / 2) {
    if (!confirm('Не все упражнения отмечены. Всё равно завершить?')) return;
  }

  const dayKey = getDayKey();
  workouts[programWeek][dayKey] = 1;
  saveData();
  
  alert('Тренировка завершена! 💪');
  showHome();
}

// ==================== CALENDAR ====================
function showCalendar() {
  hideAllScreens();
  document.getElementById('calendar-screen').classList.remove('hidden');
  updateNavButtons('calendar');
  
  const grid = document.getElementById('calendar-grid');
  grid.innerHTML = '';

  for (let week = 1; week <= 8; week++) {
    const weekData = workouts[week];
    const completed = Object.values(weekData).filter(v => v === 1).length;
    
    const weekCard = document.createElement('div');
    weekCard.className = 'bg-white p-4 rounded-3xl shadow';
    weekCard.innerHTML = `
      <div class="flex justify-between items-center mb-2">
        <span class="font-bold">Неделя ${week}</span>
        <span class="text-2xl font-bold text-emerald-600">${completed}/3</span>
      </div>
      <div class="flex gap-2">
        <div class="flex-1 h-2 rounded ${weekData.mon ? 'bg-emerald-500' : 'bg-gray-200'}"></div>
        <div class="flex-1 h-2 rounded ${weekData.wed ? 'bg-emerald-500' : 'bg-gray-200'}"></div>
        <div class="flex-1 h-2 rounded ${weekData.fri ? 'bg-emerald-500' : 'bg-gray-200'}"></div>
      </div>
    `;
    grid.appendChild(weekCard);
  }
}

// ==================== PROGRESS ====================
function showProgress() {
  hideAllScreens();
  document.getElementById('progress-screen').classList.remove('hidden');
  updateNavButtons('progress');

  const totalCompleted = Object.values(workouts).reduce((sum, week) => 
    sum + Object.values(week).filter(v => v === 1).length, 0);
  const progress = Math.round((totalCompleted / 24) * 100);

  const chart = document.getElementById('progress-chart');
  chart.innerHTML = `
    <div class="text-center">
      <div class="text-6xl font-bold text-emerald-600">${progress}%</div>
      <div class="text-sm text-gray-500 mt-2">выполнено тренировок</div>
      <div class="text-3xl font-bold mt-4">${totalCompleted}/24</div>
    </div>
  `;
}

// ==================== SETTINGS ====================
function showSettings() {
  hideAllScreens();
  document.getElementById('settings-screen').classList.remove('hidden');
  document.getElementById('program-week').value = programWeek;
  document.getElementById('reminder-toggle').textContent = remindersEnabled ? 'Включены' : 'Выключены';
}

function toggleReminders() {
  remindersEnabled = !remindersEnabled;
  document.getElementById('reminder-toggle').textContent = remindersEnabled ? 'Включены' : 'Выключены';
  saveData();
}

function saveSettings() {
  programWeek = parseInt(document.getElementById('program-week').value) || 1;
  if (programWeek < 1) programWeek = 1;
  if (programWeek > 8) programWeek = 8;
  saveData();
  alert('Настройки сохранены');
  showHome();
}

function resetData() {
  if (confirm('Удалить все данные? Это действие нельзя отменить.')) {
    localStorage.clear();
    location.reload();
  }
}

// ==================== NAVIGATION ====================
function showHome() {
  hideAllScreens();
  document.getElementById('home-screen').classList.remove('hidden');
  updateNavButtons('home');
  renderHome();
}

function hideAllScreens() {
  document.querySelectorAll('#main-content > div').forEach(div => div.classList.add('hidden'));
}

function updateNavButtons(active) {
  document.querySelectorAll('nav button').forEach(btn => {
    btn.classList.remove('text-emerald-600');
    btn.classList.add('text-gray-400');
  });
  if (active) {
    document.getElementById(`nav-${active}`)?.classList.add('text-emerald-600');
    document.getElementById(`nav-${active}`)?.classList.remove('text-gray-400');
  }
}

// ==================== INIT ====================
function init() {
  renderHome();
  document.getElementById('home-screen').classList.remove('hidden');
}

window.onload = init;