// select.js
document.addEventListener('DOMContentLoaded', () => {
    // 獲取所有相關的 DOM 元素
    const startButton = document.getElementById('start-button');
    const startHint = document.getElementById('start-hint');
    const regionCheckboxesContainer = document.getElementById('region-checkboxes');
    const selectedCountSpan = document.getElementById('selected-count');
    const totalCountSpan = document.getElementById('total-count');
    const checkAllButton = document.getElementById('check-all');
    const uncheckAllButton = document.getElementById('uncheck-all');
    const regionLoading = document.getElementById('region-loading');
    const regionEmpty = document.getElementById('region-empty');

    /**
     * 模擬從 API 載入產區資料。
     * 在實際應用中，這裡會是 AJAX 請求。
     */
    async function loadRegions() {
        regionLoading.classList.remove('hidden'); // 顯示載入指示
        regionEmpty.classList.add('hidden');    // 隱藏空狀態提示
        regionCheckboxesContainer.innerHTML = ''; // 清空現有內容

        try {
            // 模擬網路延遲
            await new Promise(resolve => setTimeout(resolve, 500));

            // 這裡可以替換為您的真實資料來源 (例如：fetch('your-api-endpoint.json'))
            const regionsData = [
                { id: 'france', name: '法國', subRegions: ['波爾多', '勃艮第', '香檳'] },
                { id: 'italy', name: '義大利', subRegions: ['托斯卡尼', '皮埃蒙特', '西西里'] },
                { id: 'usa', name: '美國', subRegions: ['加州', '奧勒岡', '華盛頓'] },
                { id: 'australia', name: '澳洲', subRegions: ['南澳', '維多利亞'] }
            ];

            if (regionsData.length === 0) {
                regionEmpty.classList.remove('hidden');
                totalCountSpan.textContent = 0; // 更新總數為0
                updateUI(); // 更新UI以反映沒有區域
                return;
            }

            const fragment = document.createDocumentFragment();
            let totalRegions = 0;

            regionsData.forEach(country => {
                const countryAccordion = document.createElement('div');
                countryAccordion.className = 'border rounded-lg shadow-sm mb-4 overflow-hidden';

                const headerId = `accordion-header-${country.id}`;
                const panelId = `accordion-panel-${country.id}`;

                countryAccordion.innerHTML = `
                    <h2 class="text-lg font-semibold bg-gray-50 p-3 cursor-pointer flex justify-between items-center"
                        id="${headerId}"
                        aria-expanded="false"
                        aria-controls="${panelId}"
                        tabindex="0"
                        role="button">
                        ${country.name}
                        <span class="transform transition-transform duration-200">▶</span>
                    </h2>
                    <div id="${panelId}" role="region" aria-labelledby="${headerId}" class="p-3 space-y-2 hidden">
                        </div>
                `;

                const subRegionsPanel = countryAccordion.querySelector(`#${panelId}`);
                country.subRegions.forEach(subRegion => {
                    totalRegions++;
                    const uniqueId = `${country.id}-${subRegion.replace(/\s/g, '')}`;
                    const checkboxDiv = document.createElement('div');
                    checkboxDiv.className = 'flex items-center';
                    checkboxDiv.innerHTML = `
                        <input type="checkbox" id="${uniqueId}" name="region" value="${uniqueId}" class="mr-2 focus:ring-blue-400">
                        <label for="${uniqueId}" class="text-gray-700">${subRegion}</label>
                    `;
                    subRegionsPanel.appendChild(checkboxDiv);
                });
                fragment.appendChild(countryAccordion);
            });

            regionCheckboxesContainer.appendChild(fragment);
            totalCountSpan.textContent = totalRegions; // 設定總產區數量
            regionLoading.classList.add('hidden'); // 隱藏載入指示
            updateUI(); // 初始更新 UI 狀態

            // 處理手風琴開合邏輯
            regionCheckboxesContainer.querySelectorAll('[role="button"]').forEach(header => {
                header.addEventListener('click', () => {
                    const panel = document.getElementById(header.getAttribute('aria-controls'));
                    const isExpanded = header.getAttribute('aria-expanded') === 'true';

                    header.setAttribute('aria-expanded', !isExpanded);
                    panel.classList.toggle('hidden', isExpanded);
                    // 切換箭頭方向
                    header.querySelector('span').style.transform = isExpanded ? 'rotate(0deg)' : 'rotate(90deg)';
                });
                // 初始化箭頭方向
                const panel = document.getElementById(header.getAttribute('aria-controls'));
                if (panel.classList.contains('hidden')) {
                    header.querySelector('span').style.transform = 'rotate(0deg)';
                } else {
                    header.querySelector('span').style.transform = 'rotate(90deg)';
                }
            });

        } catch (error) {
            console.error('載入產區失敗:', error);
            regionLoading.classList.add('hidden');
            regionCheckboxesContainer.innerHTML = '<p class="text-red-500">載入產區時發生錯誤。請稍後再試。</p>';
            regionEmpty.classList.add('hidden');
            totalCountSpan.textContent = 0;
            updateUI();
        }
    }

    /**
     * 更新 UI 狀態：選取數量、開始按鈕啟用/禁用、提示訊息顯示/隱藏。
     */
    function updateUI() {
        const selectedCheckboxes = regionCheckboxesContainer.querySelectorAll('input[type="checkbox"]:checked');
        const selectedCount = selectedCheckboxes.length;
        const totalCount = parseInt(totalCountSpan.textContent, 10); // 從 DOM 讀取總數

        selectedCountSpan.textContent = selectedCount;

        if (selectedCount > 0) {
            startButton.disabled = false;
            startButton.setAttribute('aria-disabled', 'false');
            startHint.classList.add('hidden'); // 隱藏提示訊息
        } else {
            startButton.disabled = true;
            startButton.setAttribute('aria-disabled', 'true');
            startHint.classList.remove('hidden'); // 顯示提示訊息
        }
    }

    // --- 事件監聽器 ---

    // 監聽 regionCheckboxesContainer 內的變化（使用事件委派）
    regionCheckboxesContainer.addEventListener('change', (event) => {
        if (event.target.type === 'checkbox') {
            updateUI();
        }
    });

    // 「全選」按鈕
    checkAllButton.addEventListener('click', () => {
        regionCheckboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = true;
        });
        updateUI();
    });

    // 「取消全部選擇」按鈕
    uncheckAllButton.addEventListener('click', () => {
        regionCheckboxesContainer.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        updateUI();
    });

    // 「開始作答」按鈕 (目前僅為佔位符)
    startButton.addEventListener('click', () => {
        const selectedRegions = Array.from(regionCheckboxesContainer.querySelectorAll('input[type="checkbox"]:checked'))
                                     .map(cb => cb.value);
        const difficulty = document.querySelector('input[name="difficulty"]:checked').value;
        console.log('選取的產區:', selectedRegions);
        console.log('難易度:', difficulty);
        alert(`您選擇了 ${selectedRegions.length} 個產區，難易度為 ${difficulty}。準備開始作答！`);
        // 在這裡可以導航到測驗頁面或啟動測驗邏輯
    });

    // --- 初始化 ---
    loadRegions(); // 載入產區資料並初始設定 UI
});
