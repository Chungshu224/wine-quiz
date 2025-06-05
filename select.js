// 國家與 Google Sheets 設定
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
  Germany: {
    id: "1M0yjlT-bXXFhrV-snoGEPw6WhyMSwSEf4O6f7K_zo9o",
    label: "德國",
    flag: GR"
   }
  USA: {
    id: "1ZsGBl0jHPhQu9nV3k5rJhJ4ZXkkrwSvA6qhY0RaTRxE",
    label: "美國",
    flag: "🇪🇸"
     }
  Hungary: {
    id: "1Rcf_mH4p1F05MhitSEkcjMaIU2mKmiXi77ifbOjfC14",
    label: "匈牙利",
    flag: "HU"
     }
  New Zealand: {
    id: "1O6TqxxB0YSitH9ySe3pncEx_Zl_kVtcJd2zslBDKw5Y",
    label: "紐西蘭",
    flag: "NZ"
     }
  Austria: {
    id: "1qaxLc9-GMyHgPJCajU0Cs0-vrI4nRFsqn1Y3nvj_-m8",
    label: "奧地利",
    flag: "AUS"
     }
  Portugal: {
    id: "18GCPNoDPXu9EcfPd0EmnpEJb0DsP7vQaoAdbGo9cMs4",
    label: "葡萄牙",
    flag: "PT"
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
  localStorage.setItem('selectedRegions', JSON.stringify(selected));
  window.location.href = 'quiz.html';
}

// 綁定事件與初始化畫面
document.getElementById('start-button').onclick = handleStartButtonClick;
document.getElementById('uncheck-all').onclick = () => checkAll(false);
document.getElementById('check-all').onclick = () => checkAll(true);
renderRegionUI();
