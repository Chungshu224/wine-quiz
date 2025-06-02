# 🍷 世界葡萄酒產區選擇題遊戲（Wine Quiz）

這是一個互動式的葡萄酒學習小遊戲，使用者可從法國、義大利、西班牙三國的法定產區中選擇題庫進行測驗，題型根據葡萄品種、風味、法定等級等資訊推測出產區。

📍 線上遊戲網址：  
👉 https://chungshu224.github.io/wine-quiz/select.html

## 🎮 遊戲特色

- Accordion 折疊式地區分類（按國家分類產區）
- 每國產區支援「全選/取消全選」與兩欄排版
- 題庫來自 Google Sheets，每個工作表代表一個產區
- 自動抽選 10 題，多選擇題
- 提供作答正確與否回饋，並顯示正確答案
- 完成測驗後可儲存成績至本機排行榜
- 支援重新挑選題庫作答

## 🗂 題庫來源

- 🇮🇹 Italy：Veneto, Piedmont, Campania, Alto_Adige, Lambardy, Puglia  
- 🇫🇷 France：Loire, Bordeaux  
- 🇪🇸 Spain：Green_Spain  

## 🛠 技術使用

- HTML / CSS / JavaScript（Vanilla）
- TailwindCSS 美化排版
- Google Sheets + OpenSheet API 轉為 JSON
- GitHub Pages 網頁託管

## 📦 專案結構

wine-quiz/
├── select.html
├── select.js
├── quiz.html
├── quiz.js
└── README.md