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
  hungary: { // 匈牙利已存在
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
  },
  // --- 新增的國家 ---
  chile: {
    id: "1Dv2jeGsefsuCCyuu8uvMKkHd9NgNa7tV0Woo9FrBNEY",
    label: "智利", // 您可以根據需求修改此標籤
    flag: "🇨🇱" // 您可以根據需求修改此旗幟
  },
  south_africa: {
    id: "1qE_4coepB5_vevCF4KLzDq7MMnrLtgU5foTN8e4nmLY",
    label: "南非", // 您可以根據需求修改此標籤
    flag: "🇿🇦" // 您可以根據需求修改此旗幟
  },
  argentina: {
    id: "1qE_4coepB5_vevCF4KLzDq7MMnrLtgU5foTN8e4nmLY", // 請確認此 ID 是否正確，您提供了兩個。
    label: "阿根廷", // 您可以根據需求修改此標籤
    flag: "🇦🇷" // 您可以根據需求修改此旗幟
  }
};

const API_KEY = "AIzaSyCn4cdaBpY2Fz4SXUMtpMhAN84YvOQACcQ"; // 請替換成您的實際 Google Sheets API 金鑰

/**
 * 取得指定 Google Sheet 的所有分頁名稱（用 Google Sheets API）
 * @param {string} sheetId
 * @returns {Promise<Array<string>>}
 */
async function fetchSheetNames(sheetId) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets(properties(title))&key=${API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      // 捕獲並顯示更詳細的錯誤訊息
      const errorText = await res.text(); // 嘗試讀取錯誤響應的文字
      throw new Error(`HTTP 錯誤！狀態碼：${res.status}。詳情：${errorText || '無更多資訊'}`);
    }
    const data = await res.json();
    if (!data.sheets || !Array.isArray(data.sheets)) {
      throw new Error('資料格式錯誤：未找到 sheets 屬性或其非陣列。');
    }
    return data.sheets.map(s => s.properties.title);
  } catch (error) {
    console.error('fetchSheetNames 錯誤:', error); // 輸出到控制台以便調試
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

  // 將監聽器綁定移到這裡，確保 DOM 元素存在
  document.querySelectorAll('#region-checkboxes input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', updateStartButtonStatus);
  });
  updateStartButtonStatus(); // 初始化按鈕狀態
}


/**
 * 全部選擇/全部取消
 */
function checkAll(checked) {
  document.querySelectorAll('#region-checkboxes input[type="checkbox"]').forEach(cb => cb.checked = checked);
  updateStartButtonStatus(); // 在全選/全不選後更新按鈕狀態
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
  localStorage.setItem("selectedRegions", JSON.stringify(selected));

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


// 綁定事件與初始化畫面
document.addEventListener('DOMContentLoaded', () => { // 使用 DOMContentLoaded 確保所有 DOM 元素都已載入
  renderCountrySelect(); // 初始化國家下拉選單
  renderRegionUI(); // 渲染所有國家與產區的 UI

  // 確保這些按鈕在 DOM 中存在
  const startButton = document.getElementById('start-button');
  const uncheckAllButton = document.getElementById('uncheck-all');
  const checkAllButton = document.getElementById('check-all');

  if (startButton) startButton.onclick = handleStartButtonClick;
  if (uncheckAllButton) uncheckAllButton.onclick = () => checkAll(false);
  if (checkAllButton) checkAllButton.onclick = () => checkAll(true);
});
