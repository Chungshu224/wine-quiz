const SHEET_MAP = {
  italy: {
    "Alto Adige": "https://opensheet.vercel.app/.../Italy_Alto_Adige",
    "Lombardy": "https://opensheet.vercel.app/.../Italy_Lombardy",
    "Marche": "https://opensheet.vercel.app/.../Italy_Marche"
  },
  france: {
    "Bordeaux": "https://opensheet.vercel.app/.../France_Bordeaux",
    "Loire": "https://opensheet.vercel.app/.../France_Loire"
  },
  spain: {
    "Green Spain": "https://opensheet.vercel.app/.../Spain_Green"
  }
};

let selectedRegions = [];
let regionURLMap = {};
let data = [];
let quizData = [];
let currentQuestion = 0;
let correctAnswers = 0;

function setupRegionCheckboxes() {
  const container = document.getElementById('region-checkboxes');
  container.innerHTML = '';

  for (const [country, regions] of Object.entries(SHEET_MAP)) {
    const section = document.createElement('div');
    section.className = 'border rounded';

    const header = document.createElement('button');
    header.textContent = country.toUpperCase();
    header.className = 'w-full text-left px-4 py-2 bg-gray-200 font-semibold';
    header.onclick = () => {
      content.classList.toggle('hidden');
    };

    const content = document.createElement('div');
    content.className = 'px-4 py-2 space-y-1';

    for (const [regionName, url] of Object.entries(regions)) {
      const label = document.createElement('label');
      label.className = 'flex items-center gap-1';
      const checkbox = document.createElement('input');
      const regionKey = `${country}_${regionName.replace(/\s+/g, '_')}`;
      checkbox.type = 'checkbox';
      checkbox.value = regionKey;
      checkbox.checked = true;
      regionURLMap[regionKey] = url;
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(regionName));
      content.appendChild(label);
    }

    section.appendChild(header);
    section.appendChild(content);
    container.appendChild(section);
  }
}

document.getElementById('start-button').onclick = async () => {
  selectedRegions = Array.from(document.querySelectorAll('#region-checkboxes input:checked')).map(cb => cb.value);
  if (selectedRegions.length === 0) {
    alert('請至少選擇一個地區');
    return;
  }

  const urls = selectedRegions.map(key => regionURLMap[key]);
  const results = await Promise.all(urls.map(url => fetch(url).then(r => r.json())));
  data = results.flat().filter(entry => entry['法定產區']);
  startQuiz();
};

function startQuiz() {
  quizData = [...data].sort(() => 0.5 - Math.random()).slice(0, 10);
  currentQuestion = 0;
  correctAnswers = 0;
  document.getElementById('result').classList.add('hidden');
  document.getElementById('quiz-container').classList.remove('hidden');
  showQuestion();
}

function showQuestion() {
  const q = quizData[currentQuestion];
  const options = [q['法定產區']];
  while (options.length < 4) {
    const candidate = data[Math.floor(Math.random() * data.length)]['法定產區'];
    if (candidate && !options.includes(candidate)) options.push(candidate);
  }
  options.sort(() => 0.5 - Math.random());

  document.getElementById('question').textContent = `這是款 ${q['法定等級']}，主要使用 ${q['主要品種']} 釀製，可以是 ${q['風味特徵']}，請問來自哪個法定產區？`;
  document.getElementById('question-progress').textContent = `第 ${currentQuestion + 1} / ${quizData.length} 題`;

  const optionsDiv = document.getElementById('options');
  optionsDiv.innerHTML = '';
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.textContent = opt;
    btn.className = 'w-full text-left bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded';
    btn.onclick = () => {
      Array.from(optionsDiv.children).forEach(b => b.disabled = true);
      selectAnswer(opt === q['法定產區'], q['法定產區']);
    };
    optionsDiv.appendChild(btn);
  });

  document.getElementById('feedback').textContent = '';
  document.getElementById('next-button').classList.add('hidden');
}

function selectAnswer(correct, correctAnswer) {
  const feedback = document.getElementById('feedback');
  if (correct) {
    feedback.textContent = '✅ 答對了！';
    feedback.className = 'text-green-600 mt-4 font-semibold';
    correctAnswers++;
  } else {
    feedback.textContent = `❌ 答錯了！正確答案是：${correctAnswer}`;
    feedback.className = 'text-red-600 mt-4 font-semibold';
  }
  document.getElementById('next-button').classList.remove('hidden');
}

document.getElementById('next-button').onclick = () => {
  currentQuestion++;
  if (currentQuestion < quizData.length) {
    showQuestion();
  } else {
    showResult();
  }
};

function showResult() {
  document.getElementById('quiz-container').classList.add('hidden');
  document.getElementById('result').classList.remove('hidden');
  document.getElementById('score').textContent = `你答對了 ${correctAnswers} / ${quizData.length} 題`;
  renderLeaderboard();
}

document.getElementById('save-score').onclick = () => {
  const name = document.getElementById('player-name').value.trim();
  if (!name) {
    alert('請輸入暱稱');
    return;
  }
  const board = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  board.push({ name, score: correctAnswers });
  board.sort((a, b) => b.score - a.score);
  localStorage.setItem('leaderboard', JSON.stringify(board.slice(0, 5)));
  renderLeaderboard();
  document.getElementById('player-name').value = '';
};

document.getElementById('restart-button').onclick = startQuiz;

function renderLeaderboard() {
  const list = document.getElementById('leaderboard');
  const board = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  list.innerHTML = '';
  board.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.name} - ${entry.score}`;
    list.appendChild(li);
  });
}

window.onload = setupRegionCheckboxes;
