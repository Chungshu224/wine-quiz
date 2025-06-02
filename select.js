// 儲存各國的試算表網址
const SHEET_INDEX = {
  italy: "https://opensheet.vercel.app/1dFJJuIBfIF5mnzAAG2poQKMKQKTVhEUDHuS1YX9RilA/",
  france: "https://opensheet.vercel.app/1-8sav2Dl1pi4EfnqNQhpMR0I-TjZhbaIUE6mrC1QbpU/",
  spain: "https://opensheet.vercel.app/1Zngq4LPi1E7edjopwvr7MS2dCRN1GW2rKuOetHPuhnY/"
};

/**
 * 取得指定 Google Sheet 的所有分頁名稱
 * @param {string} sheetId 
 * @returns {Promise<Array<string>>}
 */
async function fetchSheetNames(sheetId) {
  const url = `https://opensheet.vercel.app/${sheetId}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('資料請求失敗, 狀態碼: ' + res.status);
    const sheets = await res.json();
    if (Array.isArray(sheets)) {
      // 檢查陣列內容結構
      if (sheets.length === 0) {
        alert('Google Sheet 沒有任何分頁，請確認資料。');
        return [];
      }
      return sheets.map(item => item.sheetName || item.name);
    }
    alert('資料格式錯誤（非陣列）');
    return [];
  } catch (error) {
    console.error('取得分頁名稱時發生錯誤:', error, url);
    alert(
      '載入資料時發生錯誤，請確認 Google Sheet 分享設定、sheetId 是否正確，或稍後再試。\n\n錯誤訊息：' + error.message
    );
    return [];
  }
}

/**
 * 建立國家標題按鈕
 */
function createHeader(country, sheetCount, body) {
  const header = document.createElement('button');
  header.type = 'button';
  header.textContent = `🇺🇸 ${country.toUpperCase()}（${sheetCount} 產區）`;
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
 * 建立產區勾選區塊
 */
function createRegionBody(country, sheets) {
  const body = document.createElement('div');
  body.className = 'grid grid-cols-2 gap-2 p-4 hidden';
  sheets.forEach(sheetName => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = `${country}__${sheetName}`;
    checkbox.checked = true;
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
 * 渲染所有國家與產區的 UI
 */
async function renderRegionUI() {
  const container = document.getElementById('region-checkboxes');
  if (!container) {
    console.error('找不到 region-checkboxes 區塊');
    return;
  }
  container.innerHTML = ''; // 清空現有內容
  for (const [country, sheetId] of Object.entries(SHEET_INDEX)) {
    const sheets = await fetchSheetNames(sheetId);
    const section = document.createElement('div');
    section.className = 'border rounded mb-4';

    const body = createRegionBody(country, sheets);
    const header = createHeader(country, sheets.length, body);
    const control = createControlButton(body);

    section.appendChild(header);
    section.appendChild(control);
    section.appendChild(body);
    container.appendChild(section);
  }
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
