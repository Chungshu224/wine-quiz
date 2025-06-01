// 題庫地區對應表（以國家分類）
const SHEET_MAP = {
  italy_alto_adige: "https://opensheet.vercel.app/.../Italy_Alto_Adige",
  italy_lombardy: "https://opensheet.vercel.app/.../Italy_Lombardy",
  italy_marche: "https://opensheet.vercel.app/.../Italy_Marche",
  france_bordeaux: "https://opensheet.vercel.app/.../France_Bordeaux",
  france_loire: "https://opensheet.vercel.app/.../France_Loire",
  spain_green: "https://opensheet.vercel.app/.../Spain_Green"
};

let data = [];
let quizData = [];
let currentQuestion = 0;
let correctAnswers = 0;
let lang = 'zh';
let selectedRegions = [];

function setupRegionCheckboxes() {
  const container = document.getElementById('region-checkboxes');
  container.innerHTML = '';
  Object.entries(SHEET_MAP).forEach(([key]) => {
    const label = document.createElement('label');
    label.className = 'flex items-center gap-1';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = key;
    checkbox.checked = true;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(key.replace(/_/g, ' ')));
    container.appendChild(label);
  });
}

document.getElementById('language-select').addEventListener('change', e => {
  lang = e.target.value;
  showQuestion();
});

document.getElementById('start-button').addEventListener('click', async () => {
  selectedRegions = Array.from(document.querySelectorAll('#region-checkboxes input:checked'))
    .map(cb => cb.value);
  if (selectedRegions.length === 0) {
    alert('請至少選擇一個地區');
    return;
  }
  await loadData();
});

async function loadData() {
  const promises = selectedRegions.map(region => fetch(SHEET_MAP[region]).then(res => res.json()));
  const results = await Promise.all(promises);
  data = results.flat().filter(entry => entry['法定產區']);
  startQuiz();
}

function startQuiz() {
  quizData = [...data].sort(() => 0.5 - Math.random()).slice(0, 10);
  currentQuestion = 0;
  correctAnswers = 0;
  document.getElementById('result').classList.add('hidden');
  document.getElementById('quiz-container')?.remove(); // 兼容舊結構
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

  const level = q['法定等級'];
  const grape = q['主要品種'];
  const flavor = q['風味特徵'];

  const questionText = lang === 'zh'
    ? `這是款 ${level}，主要使用 ${grape} 釀製，可以是 ${flavor}，請問來自哪個法定產區？`
    : `This is a ${level}, mainly made from ${grape}, showing ${flavor}. Which wine region is it from?`;

  document.getElementById('question').textContent = questionText;
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

function selectAnswer(correct, correctAnswer = '') {
  const feedback = document.getElementById('feedback');
  if (correct) {
    feedback.textContent = lang === 'zh' ? '✅ 答對了！' : '✅ Correct!';
    feedback.className = 'text-green-600 mt-4 font-semibold';
    correctAnswers++;
  } else {
    const text = lang === 'zh'
      ? `❌ 答錯了！正確答案是：${correctAnswer}`
      : `❌ Wrong! Correct answer: ${correctAnswer}`;
    feedback.textContent = text;
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
  document.getElementById('result').classList.remove('hidden');
  document.getElementById('score').textContent =
    lang === 'zh'
      ? `你答對了 ${correctAnswers} / ${quizData.length} 題`
      : `You got ${correctAnswers} out of ${quizData.length}`;
  renderLeaderboard();
}

document.getElementById('save-score').onclick = () => {
  const name = document.getElementById('player-name').value.trim();
  if (!name) {
    alert(lang === 'zh' ? '請輸入暱稱' : 'Please enter your name');
    return;
  }
  const key = 'leaderboard_mixed';
  const board = JSON.parse(localStorage.getItem(key) || '[]');
  board.push({ name, score: correctAnswers });
  board.sort((a, b) => b.score - a.score);
  localStorage.setItem(key, JSON.stringify(board.slice(0, 5)));
  renderLeaderboard();
  document.getElementById('player-name').value = '';
};

function renderLeaderboard() {
  const list = document.getElementById('leaderboard');
  const board = JSON.parse(localStorage.getItem('leaderboard_mixed') || '[]');
  list.innerHTML = '';
  board.forEach(entry => {
    const li = document.createElement('li');
    li.textContent = `${entry.name} - ${entry.score}`;
    list.appendChild(li);
  });
}

document.getElementById('restart-button').onclick = startQuiz;
window.onload = setupRegionCheckboxes;
