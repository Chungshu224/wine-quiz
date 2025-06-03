// 設定（如需增減國家請於此調整）
const SHEET_INDEX = {
  italy: { id: "1dFJJuIBfIF5mnzAAG2poQKMKQKTVhEUDHuS1YX9RilA", label: "義大利", flag: "🇮🇹" },
  france: { id: "1-8sav2Dl1pi4EfnqNQhpMR0I-TjZhbaIUE6mrC1QbpU", label: "法國", flag: "🇫🇷" },
  spain: { id: "1Zngq4LPi1E7edjopwvr7MS2dCRN1GW2rKuOetHPuhnY", label: "西班牙", flag: "🇪🇸" }
};
const API_KEY = "AIzaSyCn4cdaBpY2Fz4SXUMtpMhAN84YvOQACcQ";
const QUIZ_COUNT = 10;

const debug = (msg) => { document.getElementById('debug-info').innerText = msg; };

// 取得選擇
let selected = [];
try { selected = JSON.parse(localStorage.getItem('selectedRegions')) || []; } catch (e) {}
if (!selected.length) { debug("請回到上一頁選擇產區！"); }

// region string: "italy__義大利北部" => {country: "italy", sheet: "義大利北部"}
function parseSelection(str) {
  const [country, sheet] = str.split('__');
  return {country, sheet};
}

async function fetchSheetData(sheetId, sheetName) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(sheetName)}?key=${API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) { debug(`API 請求失敗 (${res.status})。`); return null; }
    const data = await res.json();
    return data.values;
  } catch (e) { debug("資料抓取失敗：" + e.message); return null; }
}

// 轉換題庫資料（欄位順序：國家,產區,法定等級,法定產區,葡萄酒類型,主要品種）
function convertSheetToQuestions(values) {
  if (!values || values.length < 2) return [];
  const [header, ...rows] = values;
  return rows.filter(row => row.length >= 6).map(row => ({
    country: row[0],
    area: row[1],
    level: row[2],
    answer: row[3], // 法定產區
    type: row[4],
    grape: row[5]
  }));
}

// 抽取干擾選項
function getShuffledOptions(correct, pool, n=4) {
  const options = [correct];
  // pool: 所有可能的法定產區（去除正解後隨機抽 n-1 個）
  const distractors = pool.filter(opt => opt !== correct);
  for (let i = distractors.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [distractors[i], distractors[j]] = [distractors[j], distractors[i]];
  }
  options.push(...distractors.slice(0, n-1));
  // 最後再洗牌
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

function showLeaderboard() {
  const lbDiv = document.getElementById('leaderboard');
  let board = [];
  try { board = JSON.parse(localStorage.getItem('wine_quiz_leaderboard')) || []; } catch(e){}
  if (!board.length) {
    lbDiv.innerHTML = '';
    return;
  }
  const rows = board
    .sort((a, b) => b.score - a.score || a.date.localeCompare(b.date))
    .slice(0, 10)
    .map((item, idx) =>
      `<tr>
        <td class="px-2 py-1">${idx + 1}</td>
        <td class="px-2 py-1">${item.name}</td>
        <td class="px-2 py-1">${item.score}</td>
        <td class="px-2 py-1">${item.date}</td>
        <td class="px-2 py-1 text-xs">${item.regions.join(', ')}</td>
      </tr>`
    ).join('');
  lbDiv.innerHTML = `
    <h2 class="text-lg font-bold mb-2">排行榜（前 10 名）</h2>
    <table class="w-full border text-sm">
      <thead><tr>
        <th>#</th><th>暱稱</th><th>分數</th><th>日期</th><th>地區</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
}

// 主遊戲邏輯
(async function(){
  // 1. 抓全部題庫合併
  let allQuestions = [];
  for (const region of selected) {
    const {country, sheet} = parseSelection(region);
    const sheetId = SHEET_INDEX[country]?.id;
    if (!sheetId) continue;
    const values = await fetchSheetData(sheetId, sheet);
    allQuestions = allQuestions.concat(convertSheetToQuestions(values));
  }
  if (!allQuestions.length) { debug("題庫為空或抓取失敗！"); return; }
  // 2. 隨機排序＆抽出 10 題
  shuffle(allQuestions);
  const quizQuestions = allQuestions.slice(0, QUIZ_COUNT);

  // 取得全部法定產區選項
  const allAnswers = Array.from(new Set(allQuestions.map(q => q.answer)));

  // 3. 顯示題目
  let score = 0;

  function showQuiz(qIdx) {
    const q = quizQuestions[qIdx];
    if (!q) {
      // 完成測驗, 顯示分數與排行榜
      document.getElementById('quiz-content').innerHTML =
        `<div class="text-lg mb-4 text-green-700">遊戲結束！你的分數：${score} / ${QUIZ_COUNT}</div>
         <div class="mb-2">
           <label class="mr-2">輸入暱稱：</label>
           <input id="user-name" type="text" class="border px-2 py-1 rounded" maxlength="10" />
           <button id="save-score" class="ml-2 px-3 py-1 bg-blue-500 text-white rounded">儲存分數</button>
         </div>
         <button onclick="location.href='select.html'" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded">重新挑選題庫</button>
         <button onclick="location.reload()" class="mt-4 ml-2 px-4 py-2 bg-gray-300 rounded">再玩一次</button>`;
      document.getElementById('save-score').onclick = function() {
        const name = document.getElementById('user-name').value.trim() || '匿名';
        let board = [];
        try { board = JSON.parse(localStorage.getItem('wine_quiz_leaderboard')) || []; } catch(e){}
        board.push({
          name,
          score,
          date: new Date().toLocaleDateString(),
          regions: selected
        });
        localStorage.setItem('wine_quiz_leaderboard', JSON.stringify(board));
        showLeaderboard();
      };
      showLeaderboard();
      return;
    }
    // 選項
    const options = getShuffledOptions(q.answer, allAnswers, 4);
    // 題目內容
    document.getElementById('quiz-content').innerHTML = `
      <div class="mb-4 text-lg font-bold">第 ${qIdx+1} 題 / ${QUIZ_COUNT}</div>
      <div class="mb-2"><span class="font-semibold">產區：</span>${q.area}</div>
      <div class="mb-2"><span class="font-semibold">法定等級：</span>${q.level}</div>
      <div class="mb-2"><span class="font-semibold">葡萄酒類型：</span>${q.type}</div>
      <div class="mb-4"><span class="font-semibold">主要品種：</span>${q.grape}</div>
      <div id="options" class="mb-4 flex flex-col gap-2">
        ${options.map((opt, i) => `
          <button class="px-3 py-2 border rounded hover:bg-blue-100"
            onclick="window.submitAnswer('${opt}')">
            ${String.fromCharCode(65 + i)}. ${opt}
          </button>
        `).join('')}
      </div>
      <div id="feedback" class="mb-2"></div>
    `;
    window.submitAnswer = (ans) => {
      const isCorrect = ans === q.answer;
      document.getElementById('feedback').innerHTML =
        isCorrect
          ? '<span class="text-green-600">✔️ 答對了！</span>'
          : `<span class="text-red-600">❌ 答錯，正確答案是 <b>${q.answer}</b>`;
      score += isCorrect ? 1 : 0;
      // 鎖定按鈕
      Array.from(document.querySelectorAll("#options button")).forEach(btn => {
        btn.disabled = true;
        if (btn.textContent.includes(q.answer)) btn.classList.add('bg-green-200');
        if (!isCorrect && btn.textContent.includes(ans)) btn.classList.add('bg-red-200');
      });
      setTimeout(() => showQuiz(qIdx + 1), 1200);
    };
  }
  showQuiz(0);

})();
