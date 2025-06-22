// 國家與 Google Sheets 設定
const SHEET_INDEX = {
  italy: {
    id: "1WLrMMYTPRjIxiWueFA1J3rfKzC34xbqver5tqCzP94s",
    label: "義大利",
    flag: "🇮🇹"
  },
  france: {
    id: "1-8sav2Dl1pi4EfnqNQhpMR0I-TjZhbaIUE6mrC1QbpU",
    label: "法國",
    flag: "🇫🇷"
  },
  spain: {
    id: "1EeU1B3AF64S12XOIj9fLi-86_aMNcbmuEdKSBhsCpC4",
    label: "西班牙",
    flag: "🇪🇸"
  },
  germany: {
    id: "1M0yjlT-bXXFhrV-snoGEPw6WhyMSwSEf4O6f7K_zo9o",
    label: "德國",
    flag: "🇩🇪"
  },
  usa: {
    id: "1ZsGBl0jHPhQu9nV3k5rJhJ4ZXkkrwSvA6qhY0RaTRxE",
    label: "美國",
    flag: "🇺🇸"
  },
  hungary: {
    id: "1Rcf_mH4p1F05MhitSEkcjMaIU2mKmiXi77ifbOjfC14",
    label: "匈牙利",
    flag: "🇭🇺"
  },
  new_zealand: {
    id: "1O6TqxxB0YSitH9ySe3pncEx_Zl_kVtcJd2zslBDKw5Y",
    label: "紐西蘭",
    flag: "🇳🇿"
  },
  austria: {
    id: "1qaxLc9-GMyHgPJCajU0Cs0-vrI4nRFsqn1Y3nvj_-m8",
    label: "奧地利",
    flag: "🇦🇹"
  },
  portugal: {
    id: "18GCPNoDPXu9EcfPd0EmnpEJb0DsP7vQaoAdbGo9cMs4",
    label: "葡萄牙",
    flag: "🇵🇹"
  }
};
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
    alert('載入資料時發生錯誤，請確認 Google Sheet 權限與 API Key 是否有效。\n錯誤訊息：' + error.message);
    return [];
  }
}

/**
 * 初始化國家選單
 */
function renderCountrySelect() {
  const countrySelect = document.getElementById("country-select");
  if (!countrySelect) return;
  countrySelect.innerHTML = ""; // 避免重複
  for (const [key, val] of Object.entries(SHEET_INDEX)) {
    const option = document.createElement("option");
    option.value = key;
    option.innerText = `${val.flag} ${val.label}`;
    countrySelect.appendChild(option);
  }
}

/**
 * 建立產區勾選區塊
 */
function createRegionSection(countryKey, countryData, sheets) {
  const section = document.createElement('div');
  section.className = 'border rounded mb-4 bg-gray-50';

  // 國家標題
  const header = document.createElement('div');
  header.className = 'px-4 py-2 bg-gray-200 font-semibold flex items-center';
  header.innerHTML = `<span class="mr-2">${countryData.flag}</span>${countryData.label} <span class="ml-2 text-sm text-gray-500">（${sheets.length} 產區）</span>`;
  section.appendChild(header);

  // 勾選區
  const body = document.createElement('div');
  body.className = 'grid grid-cols-2 gap-2 p-4';
  sheets.forEach(sheetName => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = `${countryKey}__${sheetName}`;
    checkbox.checked = false;
    checkbox.id = `cb_${countryKey}_${sheetName}`;
    checkbox.setAttribute('aria-label', sheetName);

    const label = document.createElement('label');
    label.className = 'flex items-center gap-2';
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(sheetName));
    body.appendChild(label);
  });
  section.appendChild(body);

  return section;
}

/**
 * 渲染所有國家與產區的 UI（全部展開）
 */
async function renderRegionUI() {
  const container = document.getElementById('region-checkboxes');
  if (!container) return;
  container.innerHTML = '';

  for (const [countryKey, countryData] of Object.entries(SHEET_INDEX)) {
    const sheets = await fetchSheetNames(countryData.id);
    const section = createRegionSection(countryKey, countryData, sheets);
    container.appendChild(section);
  }
}

/**
 * 全部選擇/全部取消
 */
function checkAll(checked) {
  document.querySelectorAll('#region-checkboxes input[type="checkbox"]').forEach(cb => cb.checked = checked);
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

  // 儲存選擇的產區
  localStorage.setItem("selectedRegions", JSON.stringify(chosenRegions)); // ✅ 正確！先轉換成 JSON 字串再儲存

  // 儲存難度設定
  const difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || 'easy';
  localStorage.setItem('difficulty', difficulty);

  window.location.href = 'quiz.html';
}
/**
 * 監控所有 checkbox 狀態，更新開始按鈕及選取數量
 */
function updateStartButtonStatus() {
  const checkboxes = document.querySelectorAll('#region-checkboxes input[type="checkbox"]');
  const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
  const totalCount = checkboxes.length;
  const startButton = document.getElementById('start-button');
  const selectedCountText = document.getElementById('selected-count');
  const totalCountText = document.getElementById('total-count');

  if (startButton) {
    startButton.disabled = checkedCount === 0;
    startButton.setAttribute('aria-disabled', checkedCount === 0 ? 'true' : 'false');
  }

  if (selectedCountText) selectedCountText.textContent = checkedCount;
  if (totalCountText) totalCountText.textContent = totalCount;
}

// 作區塊渲染後綁定監控
async function renderRegionUI() {
  const container = document.getElementById('region-checkboxes');
  if (!container) return;
  container.innerHTML = '';

  for (const [countryKey, countryData] of Object.entries(SHEET_INDEX)) {
    const sheets = await fetchSheetNames(countryData.id);
    const section = createRegionSection(countryKey, countryData, sheets);
    container.appendChild(section);
  }

  document.querySelectorAll('#region-checkboxes input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', updateStartButtonStatus);
  });
  updateStartButtonStatus();
}

// 全選/全不選後也要觸發檢查
function checkAll(checked) {
  document.querySelectorAll('#region-checkboxes input[type="checkbox"]').forEach(cb => cb.checked = checked);
  updateStartButtonStatus();
}

// 綁定事件與初始化畫面
renderCountrySelect(); // 初始化國家下拉選單
document.getElementById('start-button').onclick = handleStartButtonClick;
document.getElementById('uncheck-all').onclick = () => checkAll(false);
document.getElementById('check-all').onclick = () => checkAll(true);
renderRegionUI();
