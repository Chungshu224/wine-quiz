// 題庫來源設定（每國多分頁）
const SHEET_INDEX = {
  italy: { id: "1dFJJuIBfIF5mnzAAG2poQKMKQKTVhEUDHuS1YX9RilA", label: "義大利", flag: "🇮🇹" },
  portugal: { id: "18GCPNoDPXu9EcfPd0EmnpEJb0DsP7vQaoAdbGo9cMs4", label: "葡萄牙", flag: "🇵🇹" },
  austria: { id: "1qaxLc9-GMyHgPJCajU0Cs0-vrI4nRFsqn1Y3nvj_-m8", label: "奧地利", flag: "🇦🇹" },
  new_zealand: { id: "1O6TqxxB0YSitH9ySe3pncEx_Zl_kVtcJd2zslBDKw5Y", label: "紐西蘭", flag: "🇳🇿" },
  hungary: { id: "1Rcf_mH4p1F05MhitSEkcjMaIU2mKmiXi77ifbOjfC14", label: "匈牙利", flag: "🇭🇺" },
  usa: { id: "1ZsGBl0jHPhQu9nV3k5rJhJ4ZXkkrwSvA6qhY0RaTRxE", label: "美國", flag: "🇺🇸" },
  germany: { id: "1M0yjlT-bXXFhrV-snoGEPw6WhyMSwSEf4O6f7K_zo9o", label: "德國", flag: "🇩🇪" },
  france: { id: "1-8sav2Dl1pi4EfnqNQhpMR0I-TjZhbaIUE6mrC1QbpU", label: "法國", flag: "🇫🇷" },
  spain: { id: "1Zngq4LPi1E7edjopwvr7MS2dCRN1GW2rKuOetHPuhnY", label: "西班牙", flag: "🇪🇸" }
};
const API_KEY = "AIzaSyCn4cdaBpY2Fz4SXUMtpMhAN84YvOQACcQ";
const QUIZ_COUNT = 10;

function parseSelection(str) {
  const [country, sheet] = str.split('__');
  return { country, sheet };
}

async function fetchSheetData(sheetId, sheetName) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) return null;
  const data = await res.json();
  return data.values;
}

function convertSheetToQuestions(values) {
  if (!values || values.length < 2) return [];
  const [header, ...rows] = values;
  return rows.filter(row => row.length >= 12 && row[3]).map(row => ({
    country: row[0], region: row[1], sub_region: row[2],
    answer: row[3], classification: row[4],
    wine_type: row[5], sub_type: row[6],
    grape_1: row[7], grape_1_color: row[8],
    grape_2: row[9], grape_2_color: row[10],
    is_blend: row[11],
  }));
}

function getShuffledOptions(correct, pool, n = 4) {
  const options = [correct];
  const distractors = pool.filter(opt => opt !== correct);
  for (let i = distractors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
  }
  options.push(...distractors.slice(0, n - 1));
  for (let i = options.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [options[i], options[j]] = [options[j], options[i]];
  }
  return options;
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// 取得選擇
let selected = [];
try { selected = JSON.parse(localStorage.getItem('selectedRegions')) || []; } catch (e) {}
if (!selected.length) { alert("請回到上一頁選擇產區！"); throw new Error("未選擇產區"); }

(async function () {
  let allQuestions = [];
  for (const region of selected) {
    const { country, sheet } = parseSelection(region);
    const sheetId = SHEET_INDEX[country]?.id;
    if (!sheetId) continue;
    const values = await fetchSheetData(sheetId, sheet);
    allQuestions = allQuestions.concat(convertSheetToQuestions(values));
  }
  if (!allQuestions.length) { alert("題庫為空或抓取失敗！"); return; }

  shuffle(allQuestions);
  const quizQuestions = allQuestions.slice(0, QUIZ_COUNT);
  const allAnswers = Array.from(new Set(allQuestions.map(q => q.answer)));

  let score = 0;
  let qIdx = 0;

  function showQuiz() {
    const q = quizQuestions[qIdx];
    if (!q) {
      document.getElementById('quiz-container').classList.add('hidden');
      document.getElementById('result').classList.remove('hidden');
      document.getElementById('score').textContent = `你答對了 ${score} / ${QUIZ_COUNT} 題`;
      renderLeaderboard();
      return;
    }
    document.getElementById('quiz-container').classList.remove('hidden');
    document.getElementById('result').classList.add('hidden');
    document.getElementById('question').innerHTML =
      `這是款來自 <b>${q.country}</b> 的 <b>${q.classification}</b><br>
      酒的類型是：<b>${q.wine_type}</b>, <b>${q.sub_type}</b><br>
      主要葡萄品種為：<b>${q.grape_1}</b><br>
      是否混釀：<b>${q.is_blend}</b><br>
      次要葡萄品種為：<b>${q.grape_2}</b><br>
      次產區：<b>${q.sub_region}</b><br>
      <br><b>請問這是哪個法定產區？</b>`;
    document.getElementById('question-progress').textContent = `第 ${qIdx + 1} / ${QUIZ_COUNT} 題`;

    const options = getShuffledOptions(q.answer, allAnswers, 4);
    const optionsDiv = document.getElementById('options');
    optionsDiv.innerHTML = '';
    options.forEach((opt, i) => {
      const btn = document.createElement('button');
      btn.textContent = `${String.fromCharCode(65 + i)}. ${opt}`;
      btn.className = 'w-full text-left bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded';
      btn.onclick = () => {
        Array.from(optionsDiv.children).forEach(b => b.disabled = true);
        if (opt === q.answer) {
          score++;
          document.getElementById('feedback').innerHTML = '✅ 答對了！';
        } else {
          document.getElementById('feedback').innerHTML = `❌ 答錯，正確答案是 <b>${q.answer}</b>`;
        }
        setTimeout(() => {
          qIdx++;
          document.getElementById('feedback').innerHTML = '';
          showQuiz();
        }, 1200);
      };
      optionsDiv.appendChild(btn);
    });
  }

  document.getElementById('restart-button').onclick = () => {
    score = 0; qIdx = 0; shuffle(allQuestions);
    showQuiz();
  };

  document.getElementById('save-score').onclick = () => {
    const name = document.getElementById('player-name').value.trim() || '匿名';
    let board = [];
    try { board = JSON.parse(localStorage.getItem('wine_quiz_leaderboard')) || []; } catch (e) {}
    board.push({ name, score, date: new Date().toLocaleDateString(), regions: selected });
    board.sort((a, b) => b.score - a.score || a.date.localeCompare(b.date));
    localStorage.setItem('wine_quiz_leaderboard', JSON.stringify(board.slice(0, 10)));
    renderLeaderboard();
    document.getElementById('player-name').value = '';
  };

  function renderLeaderboard() {
    const list = document.getElementById('leaderboard');
    let board = [];
    try { board = JSON.parse(localStorage.getItem('wine_quiz_leaderboard')) || []; } catch (e) {}
    list.innerHTML = '';
    board.slice(0, 10).forEach(entry => {
      const li = document.createElement('li');
      li.textContent = `${entry.name} - ${entry.score} (${entry.date})`;
      list.appendChild(li);
    });
  }
  showQuiz();
})();
