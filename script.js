// 題庫來源：一國一檔
const SHEET_MAP = {
  italy: "https://opensheet.elk.sh/1dFJJuIBfIF5mnzAAG2poQKMKQKTVhEUDHuS1YX9RilA/italy",
  portugal: "https://opensheet.elk.sh/18GCPNoDPXu9EcfPd0EmnpEJb0DsP7vQaoAdbGo9cMs4/portugal",
  austria: "https://opensheet.elk.sh/1qaxLc9-GMyHgPJCajU0Cs0-vrI4nRFsqn1Y3nvj_-m8/austria",
  new_zealand: "https://opensheet.elk.sh/1O6TqxxB0YSitH9ySe3pncEx_Zl_kVtcJd2zslBDKw5Y/new_zealand",
  hungary: "https://opensheet.elk.sh/1Rcf_mH4p1F05MhitSEkcjMaIU2mKmiXi77ifbOjfC14/hungary",
  usa: "https://opensheet.elk.sh/1ZsGBl0jHPhQu9nV3k5rJhJ4ZXkkrwSvA6qhY0RaTRxE/usa",
  germany: "https://opensheet.elk.sh/1M0yjlT-bXXFhrV-snoGEPw6WhyMSwSEf4O6f7K_zo9o/germany",
  france: "https://opensheet.elk.sh/1-8sav2Dl1pi4EfnqNQhpMR0I-TjZhbaIUE6mrC1QbpU/france",
  spain: "https://opensheet.elk.sh/1Zngq4LPi1E7edjopwvr7MS2dCRN1GW2rKuOetHPuhnY/spain"
};

let data = [];
let quizData = [];
let currentQuestion = 0;
let correctAnswers = 0;

document.getElementById('start-button').onclick = async () => {
  const selectedRegions = Array.from(document.querySelectorAll('#region-checkboxes input:checked'))
    .map(cb => cb.value);
  if (selectedRegions.length === 0) {
    alert('請至少選擇一個國家');
    return;
  }

  const urls = selectedRegions.map(region => SHEET_MAP[region]);
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

document.getElementById('restart-button').onclick = startQuiz;
