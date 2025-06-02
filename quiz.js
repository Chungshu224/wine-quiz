const SHEET_INDEX = {
  italy: "1dFJJuIBfIF5mnzAAG2poQKMKQKTVhEUDHuS1YX9RilA",
  france: "1-8sav2Dl1pi4EfnqNQhpMR0I-TjZhbaIUE6mrC1QbpU",
  spain: "1Zngq4LPi1E7edjopwvr7MS2dCRN1GW2rKuOetHPuhnY"
};

let quizData = [];
let currentQuestion = 0;
let correctAnswers = 0;

async function loadData() {
  const selected = JSON.parse(localStorage.getItem('selectedRegions') || '[]');
  const urls = selected.map(code => {
    const [country, sheet] = code.split('__');
    return `https://opensheet.vercel.app/${SHEET_INDEX[country]}/${sheet}`;
  });

  const results = await Promise.all(urls.map(url => fetch(url).then(r => r.json())));
  return results.flat().filter(entry => entry['法定產區']);
}

function startQuiz(data) {
  quizData = [...data].sort(() => 0.5 - Math.random()).slice(0, 10);
  currentQuestion = 0;
  correctAnswers = 0;
  showQuestion();
}

function showQuestion() {
  const q = quizData[currentQuestion];
  const options = [q['法定產區']];
  while (options.length < 4) {
    const candidate = quizData[Math.floor(Math.random() * quizData.length)]['法定產區'];
    if (candidate && !options.includes(candidate)) options.push(candidate);
  }
  options.sort(() => 0.5 - Math.random());

  document.getElementById('question').textContent =
    `這是款 ${q['法定等級']}，主要使用 ${q['主要品種']} 釀製，可以是 ${q['風味特徵']}，請問來自哪個法定產區？`;
  document.getElementById('question-progress').textContent =
    `第 ${currentQuestion + 1} / ${quizData.length} 題`;

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
  document.getElementById('score').textContent =
    `你答對了 ${correctAnswers} / ${quizData.length} 題`;
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

document.getElementById('restart-button').onclick = () => {
  window.location.href = 'select.html';
};

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

loadData().then(startQuiz);