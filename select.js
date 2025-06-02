// 儲存各國的 Google Sheet ID 與國旗 emoji
const SHEET_INDEX = {
  italy: {
    id: "1dFJJuIBfIF5mnzAAG2poQKMKQKTVhEUDHuS1YX9RilA",
    label: "義大利",
    flag: "🇮🇹"
  },
  france: {
    id: "1-8sav2Dl1pi4EfnqNQhpMR0I-TjZhbaIUE6mrC1QbpU",
    label: "法國",
    flag: "🇫🇷"
  },
  spain: {
    id: "1Zngq4LPi1E7edjopwvr7MS2dCRN1GW2rKuOetHPuhnY",
    label: "西班牙",
    flag: "🇪🇸"
  }
};

// 你的 Google Sheets API 金鑰
const API_KEY = "AIzaSyCn4cdaBpY2Fz4SXUMtpMhAN84YvOQACcQ";

/**
 * 取得指定 Google Sheet 的所有分頁名稱（用 Google Sheets API）
 * @param {string} sheetId
 * @returns {Promise<Array<string>>}
 */
async function fetchSheetNames(sheetId) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets(properties(title))&key=${API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('資料請求失敗，請檢查 API 金鑰與 Google Sheet 權限');
    const data = await res.json();
    if (!data.sheets || !Array.isArray(data.sheets)) {
      throw new Error('資料格式錯誤');
    }
    return data.sheets.map(s => s.properties.title);
  } catch (error) {
    console.error('取得分頁名稱時發生錯誤:', error, url);
    alert('載入資料時發生錯誤，請確認 Google Sheet 權限與 API Key 是否有效。\n\n錯誤訊息：' + error.message);
    return [];
  }
}

/**
 * 建立國家標題按鈕
 */
function createHeader(country, flag, label, sheetCount, body) {
  const header = document.createElement('button');
  header.type = 'button';
  header.innerHTML = `<span class="mr-2">${flag}</span>${label}（${sheetCount} 產區）`;
  header.className = 'w-full text-left px-4 py-2 bg-gray-200 font-semibold';
  header.setAttribute('aria-expanded', 'false');
  header.onclick = () => {
    body.classList.toggle('hidden');
    header.setAttribute('aria-expanded', body.classList.contains('hidden') ? 'false' : 'true');
  };
  return header;
}

/**
 * 建立「全選/取消全選」控制按鈕
 */
function createControlButton(body) {
  const control = document.createElement('button');
  control.type = 'button';
  control.className = 'text-blue-600 text-sm ml-4 mb-2';
  control.textContent = '全選';
  control.onclick = () => {
    const checkboxes = body.querySelectorAll('input[type="checkbox"]');
    const allChecked = [...checkboxes].every(cb => cb.checked);
    checkboxes.forEach(cb => (cb.checked = !allChecked));
    control.textContent = allChecked ? '全選' : '取消全選';
  };
  return control;
}

/**
 * 建立產區勾選區塊（預設全部不選）
 */
function createRegionBody(country, sheets) {
  const body = document.createElement('div');
  body.className = 'grid grid-cols-2 gap-2 p-4 hidden';
  sheets.forEach(sheetName => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = `${country}__${sheetName}`;
    checkbox.checked = false; // 預設全部不勾選
    checkbox.id = `cb_${country}_${sheetName}`;
    checkbox.setAttribute('aria-label', sheetName);

    const label = document.createElement('label');
    label.className = 'flex items-center gap-1';
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(sheetName));
    body.appendChild(label);
  });
  return body;
}

/**
 * 建立「取消全部選擇」按鈕
 */
function createUncheckAllButton() {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'bg-red-100 text-red-700 px-3 py-1 rounded mb-4 mr-4';
  btn.textContent = '取消全部選擇';
  btn.onclick = () => {
    document.querySelectorAll('#region-checkboxes input[type="checkbox"]').forEach(cb => cb.checked = false);
  };
  return btn;
}

/**
 * 渲染所有國家與產區的 UI
 */
async function renderRegionUI() {
  const container = document.getElementById('region-checkboxes');
  if (!container) {
    console.error('找不到 region-checkboxes 區塊');
    return;
  }
  container.innerHTML = ''; // 清空現有內容

  // 先加上「取消全部選擇」按鈕
  const uncheckAllBtn = createUncheckAllButton();
  container.appendChild(uncheckAllBtn);

  for (const [countryKey, countryData] of Object.entries(SHEET_INDEX)) {
    const sheets = await fetchSheetNames(countryData.id);
    const section = document.createElement('div');
    section.className = 'border rounded mb-4';

    const body = createRegionBody(countryKey, sheets);
    const header = createHeader(countryKey, countryData.flag, countryData.label, sheets.length, body);
    const control = createControlButton(body);

    section.appendChild(header);
    section.appendChild(control);
    section.appendChild(body);
    container.appendChild(section);
  }
}

/**
 * 顯示題目（簡易 demo，僅顯示選擇的產區清單）
 * 你可依需求改成實際題目呈現
 */
function showQuiz(selected) {
  const quizContainer = document.getElementById('quiz-container');
  quizContainer.innerHTML = '';
  if (selected.length === 0) {
    quizContainer.innerHTML = '<p class="text-red-600">請至少選擇一個產區再開始作答。</p>';
    return;
  }
  // 這裡僅示範顯示選擇的產區
  const ul = document.createElement('ul');
  selected.forEach(val => {
    const li = document.createElement('li');
    li.textContent = val;
    ul.appendChild(li);
  });
  quizContainer.innerHTML = '<h2 class="text-lg font-bold mb-2">你選擇的產區：</h2>';
  quizContainer.appendChild(ul);
}

/**
 * 處理開始按鈕點擊
 */
function handleStartButtonClick() {
  const selected = Array.from(document.querySelectorAll('#region-checkboxes input:checked')).map(cb => cb.value);
  if (selected.length === 0) {
    alert('請至少選擇一個產區');
    return;
  }
  localStorage.setItem('selectedRegions', JSON.stringify(selected));
  window.location.href = 'quiz.html';
}

// 綁定事件與初始化畫面
document.getElementById('start-button').onclick = handleStartButtonClick;
renderRegionUI();
