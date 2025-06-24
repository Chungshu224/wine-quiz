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
  germany: { // FIXED: Consistent ID with quiz.html
    id: "1M0yjlT-bXXFhrV-snoGEPw6WhyMSwSEf4O6f7K_zo9o", // Changed from MSbSE to MSwSE
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
  },
  chile: {
    id: "1Dv2jeGsefsuCCyuu8uvMKkHd9NgNa7tV0Woo9FrBNEY",
    label: "智利",
    flag: "🇨🇱"
  },
  south_africa: {
    id: "13K5yOvCJYZH6oiITdu5lyKH6a5az7octyuT3m7MzYEM",
    label: "南非",
    flag: "🇿🇦"
  },
  argentina: {
    id: "1qE_4coepB5_vevCF4KLDq7MMnrLtgU5foTN8e4nmLY", // Corrected potential typo if different
    label: "阿根廷",
    flag: "🇦🇷"
  }
};

const API_KEY = "AIzaSyCn4cdaBpY2Fz4SXUMtpMhAN84YvOQACcQ"; // 在生產環境中，請考慮更安全地管理此 API 金鑰。

// 快取 DOM 元素以提高效能
let DOMElements = {};

/**
 * 取得指定 Google Sheet 的所有分頁名稱（使用 Google Sheets API）
 * @param {string} sheetId - Google Sheet 的 ID
 * @returns {Promise<Array<string>>} - 包含所有分頁名稱的陣列
 */
async function fetchSheetNames(sheetId) {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}?fields=sheets(properties(title))&key=${API_KEY}`;
  try {
    const res = await fetch(url);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`HTTP 錯誤！狀態碼：${res.status}。詳情：${errorText || '無更多資訊'}`);
    }
    const data = await res.json();
    if (!data.sheets || !Array.isArray(data.sheets)) {
      throw new Error('資料格式錯誤：未找到 sheets 屬性或其非陣列。');
    }
    return data.sheets.map(s => s.properties.title);
  } catch (error) {
    console.error('fetchSheetNames 錯誤:', error);
    // Display error on page instead of alert for better UX
    DOMElements.regionCheckboxesContainer.innerHTML = `<p class="text-center text-red-500">載入資料時發生錯誤：${error.message}。請確認 Google Sheet 權限與 API Key 是否有效。</p>`;
    return [];
  }
}

/**
 * 建立產區勾選區塊
 * @param {string} countryKey - 國家的鍵值 (e.g., 'italy')
 * @param {object} countryData - 國家的資料 (label, flag, id)
 * @param {Array<string>} sheets - 該國家所有產區的分頁名稱
 * @returns {HTMLElement} - 包含國家標題和產區勾選框的區塊元素
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
    // 為了確保 ID 的唯一性及有效性，對 sheetName 進行處理
    const checkboxId = `cb_${countryKey}_${sheetName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = `${countryKey}__${sheetName}`;
    checkbox.checked = false;
    checkbox.id = checkboxId;
    checkbox.setAttribute('aria-label', sheetName);

    const label = document.createElement('label');
    label.className = 'flex items-center gap-2';
    label.htmlFor = checkboxId; // 將 label 與 checkbox 關聯
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
  if (!DOMElements.regionCheckboxesContainer) return;

  DOMElements.regionCheckboxesContainer.innerHTML = ''; // 清空現有內容
  DOMElements.regionLoading.classList.remove('hidden'); // Show loading indicator
  DOMElements.regionEmpty.classList.add('hidden'); // Hide empty message

  let hasRegions = false;
  for (const [countryKey, countryData] of Object.entries(SHEET_INDEX)) {
    const sheets = await fetchSheetNames(countryData.id);
    if (sheets.length > 0) {
      const section = createRegionSection(countryKey, countryData, sheets);
      DOMElements.regionCheckboxesContainer.appendChild(section);
      hasRegions = true;
    }
  }

  DOMElements.regionLoading.classList.add('hidden'); // Hide loading indicator after fetching

  if (!hasRegions) {
    DOMElements.regionEmpty.classList.remove('hidden'); // Show empty message if no regions
  }

  // Restore previous selections from localStorage
  const storedSelectedRegions = JSON.parse(localStorage.getItem("selectedRegions") || "[]");
  DOMElements.regionCheckboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      if (storedSelectedRegions.includes(cb.value)) {
          cb.checked = true;
      }
  });

  // Restore difficulty selection from localStorage
  const storedDifficulty = localStorage.getItem("difficulty") || "easy";
  const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
  difficultyRadios.forEach(radio => {
      if (radio.value === storedDifficulty) {
          radio.checked = true;
      } else {
          radio.checked = false; // Ensure others are unchecked
      }
  });


  // Render all checkboxes, then update button status
  updateStartButtonStatus();
}

/**
 * 全部選擇/全部取消所有產區勾選框
 * @param {boolean} checked - 是否勾選 (true) 或取消勾選 (false)
 */
function checkAll(checked) {
  if (!DOMElements.regionCheckboxesContainer) return;
  DOMElements.regionCheckboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = checked);
  updateStartButtonStatus(); // 在全選/全不選後更新按鈕狀態
}

/**
 * 處理開始按鈕點擊事件
 */
function handleStartButtonClick() {
  if (!DOMElements.regionCheckboxesContainer) return;

  const selectedCheckboxes = Array.from(DOMElements.regionCheckboxesContainer.querySelectorAll('input:checked'));
  const selectedRegions = selectedCheckboxes.map(cb => cb.value);

  if (selectedRegions.length === 0) {
    // Show hint instead of alert
    DOMElements.startHint.classList.remove('hidden');
    return;
  } else {
    DOMElements.startHint.classList.add('hidden'); // Hide hint if regions are selected
  }

  // 儲存選擇的產區到 localStorage
  localStorage.setItem("selectedRegions", JSON.stringify(selectedRegions));

  // 儲存難度設定到 localStorage
  const difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || 'easy';
  localStorage.setItem('difficulty', difficulty);

  // 導向測驗頁面
  window.location.href = 'quiz.html';
}

/**
 * 監控所有勾選框狀態，更新開始按鈕的可啟用狀態及選取數量顯示
 */
function updateStartButtonStatus() {
  if (!DOMElements.regionCheckboxesContainer || !DOMElements.startButton || !DOMElements.selectedCountText || !DOMElements.totalCountText || !DOMElements.startHint) return;

  const checkboxes = DOMElements.regionCheckboxesContainer.querySelectorAll('input[type="checkbox"]');
  const checkedCount = Array.from(checkboxes).filter(cb => cb.checked).length;
  const totalCount = checkboxes.length;

  DOMElements.startButton.disabled = checkedCount === 0;
  DOMElements.startButton.setAttribute('aria-disabled', checkedCount === 0 ? 'true' : 'false');

  DOMElements.selectedCountText.textContent = checkedCount;
  DOMElements.totalCountText.textContent = totalCount;

  // Automatically hide the hint if selection is made
  if (checkedCount > 0) {
      DOMElements.startHint.classList.add('hidden');
  }
}

// 綁定事件與初始化畫面
document.addEventListener('DOMContentLoaded', () => { // 使用 DOMContentLoaded 確保所有 DOM 元素都已載入
  // 快取所有需要操作的 DOM 元素
  DOMElements = {
    // countrySelect: document.getElementById("country-select"), // Removed as it's not in HTML and not used
    regionCheckboxesContainer: document.getElementById('region-checkboxes'),
    startButton: document.getElementById('start-button'),
    uncheckAllButton: document.getElementById('uncheck-all'),
    checkAllButton: document.getElementById('check-all'),
    selectedCountText: document.getElementById('selected-count'),
    totalCountText: document.getElementById('total-count'),
    regionEmpty: document.getElementById('region-empty'), // Added for loading/empty states
    regionLoading: document.getElementById('region-loading'), // Added for loading/empty states
    startHint: document.getElementById('start-hint') // Added for the hint message
  };

  // Removed renderCountrySelect() as it's not used in this HTML structure
  // renderCountrySelect();
  // 渲染所有國家與產區的 UI
  renderRegionUI();

  // 綁定按鈕事件監聽器
  if (DOMElements.startButton) {
    DOMElements.startButton.onclick = handleStartButtonClick;
  }
  if (DOMElements.uncheckAllButton) {
    DOMElements.uncheckAllButton.onclick = () => checkAll(false);
  }
  if (DOMElements.checkAllButton) {
    DOMElements.checkAllButton.onclick = () => checkAll(true);
  }

  // Use event delegation to listen for changes on the checkboxes container
  if (DOMElements.regionCheckboxesContainer) {
    DOMElements.regionCheckboxesContainer.addEventListener('change', (event) => {
      if (event.target.type === 'checkbox') {
        updateStartButtonStatus();
      }
    });
  }

  // Also listen to changes on difficulty radios
  const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
  difficultyRadios.forEach(radio => {
      radio.addEventListener('change', updateStartButtonStatus);
  });
});
