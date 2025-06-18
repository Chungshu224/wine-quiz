// === 基本設定 ===
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
const SHEET_META_API = "https://sheetdb.io/api/v1/"; // 用以模擬產區分類&子分類資料來源

// === 狀態 ===
let regionMeta = {}; // {country: [{category, regions:[{name, value}], ...}]}
let selectedRegions = []; // ["country__sheetName", ...]
let totalRegionCount = 0;

// === DOM ===
const $regionSection = document.getElementById("region-checkboxes");
const $selectedCount = document.getElementById("selected-count");
const $totalCount = document.getElementById("total-count");
const $regionStatus = document.getElementById("region-status");
const $regionLoading = document.getElementById("region-loading");
const $regionEmpty = document.getElementById("region-empty");
const $startButton = document.getElementById("start-button");
const $checkAll = document.getElementById("check-all");
const $uncheckAll = document.getElementById("uncheck-all");
const $startHint = document.getElementById("start-hint");

// === 載入指示 ===
function showLoading(show) {
  $regionLoading.style.display = show ? "" : "none";
}
showLoading(true);

// === 取得產區分類清單（假設從後端 API）===
async function fetchRegionMeta() {
  const meta = {};
  // 模擬: 取得每國的分頁/產區
  for (const [country, obj] of Object.entries(SHEET_INDEX)) {
    // 假設每國有數個分頁(sheetName)，每分頁屬於某分類
    // 實際應從 API 取，這裡用假資料
    meta[country] = [
      {
        category: "主要產區",
        regions: [
          { name: "A區", value: `${country}__A區` },
          { name: "B區", value: `${country}__B區` }
        ]
      },
      {
        category: "其他產區",
        regions: [
          { name: "C區", value: `${country}__C區` }
        ]
      }
    ];
  }
  return meta;
}

// === 渲染 Accordion/Checkbox ===
function renderRegions(meta) {
  $regionSection.innerHTML = "";
  let count = 0;
  // 每國一個 accordion
  Object.entries(SHEET_INDEX).forEach(([country, info], ci) => {
    const group = meta[country];
    if (!group || !group.length) return;

    // 產生國家 Accordion
    const accordionId = `accordion-${country}`;
    const countryBlock = document.createElement("div");
    countryBlock.className = "border rounded bg-gray-50";

    // Accordion 主標題
    const headerBtn = document.createElement("button");
    headerBtn.className = "w-full text-left px-4 py-2 font-bold flex items-center gap-2 focus:outline-none";
    headerBtn.setAttribute("aria-expanded", ci === 0 ? "true" : "false");
    headerBtn.setAttribute("aria-controls", accordionId);
    headerBtn.id = `accordion-header-${country}`;
    headerBtn.innerHTML = `${info.flag} ${info.label}`;
    headerBtn.tabIndex = 0;
    headerBtn.onclick = () => {
      const expanded = headerBtn.getAttribute("aria-expanded") === "true";
      headerBtn.setAttribute("aria-expanded", !expanded);
      regionList.style.display = expanded ? "none" : "block";
    };

    // Accordion 內容
    const regionList = document.createElement("div");
    regionList.id = accordionId;
    regionList.setAttribute("role", "region");
    regionList.setAttribute("aria-labelledby", headerBtn.id);
    regionList.style.display = ci === 0 ? "block" : "none";
    regionList.className = "px-4 pb-2";

    // 各分類下產區
    group.forEach(cat => {
      const catTitle = document.createElement("div");
      catTitle.className = "font-semibold mt-2";
      catTitle.textContent = cat.category;
      regionList.appendChild(catTitle);

      cat.regions.forEach(region => {
        count++;
        const label = document.createElement("label");
        label.className = "inline-flex items-center mr-4 mt-1";
        label.setAttribute("role", "checkbox");
        label.setAttribute("aria-checked", "false");
        label.tabIndex = 0;

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.value = region.value;
        checkbox.className = "mr-2 region-checkbox";
        checkbox.setAttribute("aria-label", region.name);

        // 回復選擇
        if (selectedRegions.includes(region.value)) {
          checkbox.checked = true;
          label.setAttribute("aria-checked", "true");
        }

        checkbox.onchange = () => {
          if (checkbox.checked) {
            if (!selectedRegions.includes(region.value)) selectedRegions.push(region.value);
            label.setAttribute("aria-checked", "true");
          } else {
            selectedRegions = selectedRegions.filter(v => v !== region.value);
            label.setAttribute("aria-checked", "false");
          }
          updateStatus();
        };

        label.appendChild(checkbox);
        label.append(region.name);
        regionList.appendChild(label);
      });
    });

    countryBlock.appendChild(headerBtn);
    countryBlock.appendChild(regionList);
    $regionSection.appendChild(countryBlock);
  });

  totalRegionCount = count;
  updateStatus();
}

function updateStatus() {
  // 更新已選/總數
  $selectedCount.textContent = selectedRegions.length;
  $totalCount.textContent = totalRegionCount;
  $regionStatus.setAttribute("data-total", totalRegionCount);
  $regionStatus.setAttribute("data-selected", selectedRegions.length);

  // 按鈕狀態提示
  if (selectedRegions.length === 0) {
    $startButton.disabled = true;
    $startButton.setAttribute("aria-disabled", "true");
    $startHint.classList.remove("hidden");
  } else {
    $startButton.disabled = false;
    $startButton.setAttribute("aria-disabled", "false");
    $startHint.classList.add("hidden");
  }

  // 無產區空狀態
  if (totalRegionCount === 0) {
    $regionEmpty.classList.remove("hidden");
  } else {
    $regionEmpty.classList.add("hidden");
  }
}

function checkAllRegions(check) {
  document.querySelectorAll('.region-checkbox').forEach(checkbox => {
    checkbox.checked = check;
    const label = checkbox.parentElement;
    if (check) {
      if (!selectedRegions.includes(checkbox.value)) selectedRegions.push(checkbox.value);
      label.setAttribute("aria-checked", "true");
    } else {
      selectedRegions = [];
      label.setAttribute("aria-checked", "false");
    }
  });
  // 移除重複值
  selectedRegions = [...new Set(selectedRegions)];
  updateStatus();
}

// === 事件繫結 ===
$checkAll.onclick = () => checkAllRegions(true);
$uncheckAll.onclick = () => checkAllRegions(false);
$startButton.onclick = () => {
  if (selectedRegions.length === 0) return;
  localStorage.setItem('selectedRegions', JSON.stringify(selectedRegions));
  window.location.href = "quiz.html";
};

// === 主程式 ===
(async function () {
  showLoading(true);
  // 從 localStorage 恢復已選
  try { selectedRegions = JSON.parse(localStorage.getItem('selectedRegions')) || []; } catch (e) { selectedRegions = []; }

  // 載入分類產區
  regionMeta = await fetchRegionMeta();

  showLoading(false);

  renderRegions(regionMeta);
})();
