const SHEET_INDEX = {
  italy: "1dFJJuIBfIF5mnzAAG2poQKMKQKTVhEUDHuS1YX9RilA",
  france: "1-8sav2Dl1pi4EfnqNQhpMR0I-TjZhbaIUE6mrC1QbpU",
  spain: "1Zngq4LPi1E7edjopwvr7MS2dCRN1GW2rKuOetHPuhnY"
};

async function fetchSheetNames(sheetId) {
  const url = `https://opensheet.vercel.app/${sheetId}`;
  const res = await fetch(url);
  // 這裡根據 opensheet API 的回傳格式修正
  const sheets = await res.json();
  // 檢查 sheets 的資料型態
  if (Array.isArray(sheets)) {
    return sheets.map(item => item.sheetName || item.name);
  }
  return [];
}

async function renderRegionUI() {
  for (const [country, sheetId] of Object.entries(SHEET_INDEX)) {
    const sheets = await fetchSheetNames(sheetId);
    const section = document.createElement('div');
    section.className = 'border rounded';

    const header = document.createElement('button');
    header.textContent = `🇺🇳 ${country.toUpperCase()}（${sheets.length} 產區）`;
    header.className = 'w-full text-left px-4 py-2 bg-gray-200 font-semibold';
    const body = document.createElement('div');
    body.className = 'grid grid-cols-2 gap-2 p-4';
    body.classList.add('hidden');

    const control = document.createElement('button');
    control.className = 'text-blue-600 text-sm ml-4 mb-2';
    control.textContent = '全選';
    control.onclick = () => {
      const checkboxes = body.querySelectorAll('input[type="checkbox"]');
      const allChecked = [...checkboxes].every(cb => cb.checked);
      checkboxes.forEach(cb => (cb.checked = !allChecked));
      control.textContent = allChecked ? '全選' : '取消全選';
    };

    header.onclick = () => {
      body.classList.toggle('hidden');
    };

    sheets.forEach(sheetName => {
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.value = `${country}__${sheetName}`;
      checkbox.checked = true;

      const label = document.createElement('label');
      label.className = 'flex items-center gap-1';
      label.appendChild(checkbox);
      label.appendChild(document.createTextNode(sheetName));
      body.appendChild(label);
    });

    section.appendChild(header);
    section.appendChild(control);
    section.appendChild(body);
    container.appendChild(section);
  }
}

document.getElementById('start-button').onclick = () => {
  const selected = Array.from(document.querySelectorAll('#region-checkboxes input:checked')).map(cb => cb.value);
  if (selected.length === 0) {
    alert('請至少選擇一個產區');
    return;
  }
  localStorage.setItem('selectedRegions', JSON.stringify(selected));
  window.location.href = 'quiz.html';
};

renderRegionUI();
