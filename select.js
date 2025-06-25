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
    id: "1qE_4coepB5_vevCF4KLDq7MMnrLtgU5foTN8e4nmLY",
    label: "阿根廷",
    flag: "🇦🇷"
  }
};

const API_KEY = "AIzaSyCn4cdaBpY2Fz4SXUMtpMhAN84YvOQACcQ"; // 請替換成您的 Google Sheets API Key

// 快取 DOM 元素以提高效能
let DOMElements = {};

// 追蹤每個國家是否已載入其產區
const loadedCountrySheets = {}; // Format: { countryKey: ['Sheet1', 'Sheet2'], ... }

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
    // 在產區載入失敗時，更新該國家的錯誤訊息
    return []; // 返回空陣列表示載入失敗
  }
}

/**
 * 創建國家標題（可展開收合）
 * @param {string} countryKey - 國家的鍵值 (e.g., 'italy')
 * @param {object} countryData - 國家的資料 (label, flag, id)
 * @returns {HTMLElement} - 包含國家標題和空的產區內容容器的區塊元素
 */
function createCountrySection(countryKey, countryData) {
  const section = document.createElement('div');
  section.className = 'border rounded bg-gray-50';

  // 國家標題 (可點擊)
  const header = document.createElement('button');
  header.className = 'w-full px-4 py-3 bg-gray-200 font-semibold flex items-center justify-between hover:bg-gray-300 focus:outline-none focus:ring focus:ring-blue-300 transition-colors duration-200';
  header.setAttribute('aria-expanded', 'false');
  header.setAttribute('aria-controls', `regions-for-${countryKey}`);
  header.innerHTML = `
    <span class="flex items-center">
      <span class="mr-2">${countryData.flag}</span>${countryData.label}
    </span>
    <svg class="w-5 h-5 transform transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
    </svg>
  `;
  header.onclick = () => toggleCountryDetails(countryKey, countryData, header);
  section.appendChild(header);

  // 產區內容容器 (初始隱藏)
  const content = document.createElement('div');
  content.id = `regions-for-${countryKey}`;
  content.className = 'hidden'; // 初始隱藏
  content.setAttribute('role', 'region');
  content.setAttribute('aria-labelledby', header.id || `country-header-${countryKey}`); // 確保可訪問性
  section.appendChild(content);

  return section;
}

/**
 * 動態渲染產區勾選框到指定容器
 * @param {HTMLElement} container - 插入產區的 DOM 容器
 * @param {string} countryKey - 國家的鍵值
 * @param {Array<string>} sheets - 該國家所有產區的分頁名稱
 */
function renderRegionCheckboxes(container, countryKey, sheets) {
  container.innerHTML = ''; // 清空現有內容

  if (sheets.length === 0) {
    container.innerHTML = `<p class="text-center text-red-500 p-4">載入失敗或該國家沒有產區資訊。</p>`;
    return;
  }

  const grid = document.createElement('div');
  grid.className = 'grid grid-cols-2 gap-2 p-4';
  sheets.forEach(sheetName => {
    const checkboxId = `cb_${countryKey}_${sheetName.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '')}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.value = `${countryKey}__${sheetName}`;
    checkbox.checked = false; // 默認不勾選
    checkbox.id = checkboxId;
    checkbox.setAttribute('aria-label', sheetName);

    const label = document.createElement('label');
    label.className = 'flex items-center gap-2';
    label.htmlFor = checkboxId;
    label.appendChild(checkbox);
    label.appendChild(document.createTextNode(sheetName));
    grid.appendChild(label);
  });
  container.appendChild(grid);

  // 恢復之前選中的狀態
  const storedSelectedRegions = JSON.parse(localStorage.getItem("selectedRegions") || "[]");
  container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      if (storedSelectedRegions.includes(cb.value)) {
          cb.checked = true;
      }
  });

  updateStartButtonStatus(); // 更新按鈕狀態
}

/**
 * 切換國家產區的顯示狀態，並在需要時載入產區資料
 * @param {string} countryKey - 國家的鍵值
 * @param {object} countryData - 國家的資料
 * @param {HTMLElement} headerButton - 點擊的國家標題按鈕
 */
async function toggleCountryDetails(countryKey, countryData, headerButton) {
  const contentDiv = document.getElementById(`regions-for-${countryKey}`);
  const arrowIcon = headerButton.querySelector('svg');

  if (!contentDiv) return;

  const isExpanded = headerButton.getAttribute('aria-expanded') === 'true';

  if (isExpanded) {
    // 摺疊內容
    contentDiv.classList.add('hidden');
    headerButton.setAttribute('aria-expanded', 'false');
    arrowIcon.classList.remove('rotate-180');
  } else {
    // 展開內容
    contentDiv.classList.remove('hidden');
    headerButton.setAttribute('aria-expanded', 'true');
    arrowIcon.classList.add('rotate-180');

    // 如果該國家的產區尚未載入，則載入
    if (!loadedCountrySheets[countryKey]) {
      contentDiv.innerHTML = `
        <div class="flex justify-center p-4">
          <svg class="animate-spin h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
          </svg>
          <span class="ml-2 text-gray-600">載入產區中...</span>
        </div>
      `;
      const sheets = await fetchSheetNames(countryData.id);
      loadedCountrySheets[countryKey] = sheets; // 儲存已載入的產區
      renderRegionCheckboxes(contentDiv, countryKey, sheets);
    }
  }
}


/**
 * 渲染所有國家標題的 UI
 */
async function renderAllCountriesUI() {
  if (!DOMElements.countriesList) return;

  DOMElements.countriesList.innerHTML = ''; // 清空現有內容
  DOMElements.overallLoading.classList.remove('hidden'); // 顯示整體載入指示
  DOMElements.overallEmpty.classList.add('hidden'); // 隱藏整體空狀態

  let hasCountries = false;
  for (const [countryKey, countryData] of Object.entries(SHEET_INDEX)) {
    // 先只創建國家標題，不載入產區
    const section = createCountrySection(countryKey, countryData);
    DOMElements.countriesList.appendChild(section);
    hasCountries = true;
  }

  DOMElements.overallLoading.classList.add('hidden'); // 隱藏整體載入指示

  if (!hasCountries) {
    DOMElements.overallEmpty.classList.remove('hidden'); // 顯示整體空狀態
  }

  // Restore difficulty selection from localStorage
  const storedDifficulty = localStorage.getItem("difficulty") || "easy";
  const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
  difficultyRadios.forEach(radio => {
      if (radio.value === storedDifficulty) {
          radio.checked = true;
      } else {
          radio.checked = false;
      }
  });

  updateStartButtonStatus(); // 更新按鈕狀態
}


/**
 * 全部選擇/全部取消所有產區勾選框
 * @param {boolean} checked - 是否勾選 (true) 或取消勾選 (false)
 */
function checkAll(checked) {
  // 遍歷所有已載入的產區容器
  for (const countryKey in loadedCountrySheets) {
    if (loadedCountrySheets.hasOwnProperty(countryKey)) {
        const contentDiv = document.getElementById(`regions-for-${countryKey}`);
        if (contentDiv) {
            contentDiv.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = checked);
        }
    }
  }
  updateStartButtonStatus();
}

/**
 * 處理開始按鈕點擊事件
 */
function handleStartButtonClick() {
  // 從所有已載入的產區容器中收集選中的勾選框
  let selectedRegions = [];
  for (const countryKey in loadedCountrySheets) {
    if (loadedCountrySheets.hasOwnProperty(countryKey)) {
        const contentDiv = document.getElementById(`regions-for-${countryKey}`);
        if (contentDiv) {
            Array.from(contentDiv.querySelectorAll('input[type="checkbox"]:checked')).forEach(cb => {
                selectedRegions.push(cb.value);
            });
        }
    }
  }


  if (selectedRegions.length === 0) {
    DOMElements.startHint.classList.remove('hidden');
    return;
  } else {
    DOMElements.startHint.classList.add('hidden');
  }

  localStorage.setItem("selectedRegions", JSON.stringify(selectedRegions));

  const difficulty = document.querySelector('input[name="difficulty"]:checked')?.value || 'easy';
  localStorage.setItem('difficulty', difficulty);

  window.location.href = 'quiz.html';
}

/**
 * 監控所有勾選框狀態，更新開始按鈕的可啟用狀態及選取數量顯示
 */
function updateStartButtonStatus() {
  if (!DOMElements.startButton || !DOMElements.selectedCountText || !DOMElements.totalCountText || !DOMElements.startHint) return;

  let totalCheckboxes = 0;
  let checkedCount = 0;

  // 遍歷所有國家，並在已載入的國家內部檢查勾選框
  for (const countryKey in loadedCountrySheets) {
      if (loadedCountrySheets.hasOwnProperty(countryKey)) {
          const contentDiv = document.getElementById(`regions-for-${countryKey}`);
          if (contentDiv) {
              const checkboxes = contentDiv.querySelectorAll('input[type="checkbox"]');
              totalCheckboxes += checkboxes.length;
              checkedCount += Array.from(checkboxes).filter(cb => cb.checked).length;
          }
      }
  }


  DOMElements.startButton.disabled = checkedCount === 0;
  DOMElements.startButton.setAttribute('aria-disabled', checkedCount === 0 ? 'true' : 'false');

  DOMElements.selectedCountText.textContent = checkedCount;
  DOMElements.totalCountText.textContent = totalCheckboxes; // 這裡顯示的是所有已載入產區的總數，而不是所有可能的產區總數。

  if (checkedCount > 0) {
      DOMElements.startHint.classList.add('hidden');
  }
}

// 綁定事件與初始化畫面
document.addEventListener('DOMContentLoaded', () => {
  DOMElements = {
    countriesList: document.getElementById('countries-list'),
    startButton: document.getElementById('start-button'),
    uncheckAllButton: document.getElementById('uncheck-all'),
    checkAllButton: document.getElementById('check-all'),
    selectedCountText: document.getElementById('selected-count'),
    totalCountText: document.getElementById('total-count'),
    overallLoading: document.getElementById('overall-loading'), // 新增整體載入指示
    overallEmpty: document.getElementById('overall-empty'),     // 新增整體空狀態
    startHint: document.getElementById('start-hint')
  };

  renderAllCountriesUI(); // 只渲染國家列表

  if (DOMElements.startButton) {
    DOMElements.startButton.onclick = handleStartButtonClick;
  }
  if (DOMElements.uncheckAllButton) {
    DOMElements.uncheckAllButton.onclick = () => checkAll(false);
  }
  if (DOMElements.checkAllButton) {
    DOMElements.checkAllButton.onclick = () => checkAll(true);
  }

  // 使用事件委派，監聽勾選框容器的變化事件
  // 現在監聽 `countriesList`，因為國家區塊和其內的勾選框都會被動態載入
  if (DOMElements.countriesList) {
    DOMElements.countriesList.addEventListener('change', (event) => {
      if (event.target.type === 'checkbox') {
        updateStartButtonStatus();
      }
    });
  }

  const difficultyRadios = document.querySelectorAll('input[name="difficulty"]');
  difficultyRadios.forEach(radio => {
      radio.addEventListener('change', updateStartButtonStatus);
  });
});
