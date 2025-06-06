# 世界葡萄酒產區選擇題遊戲（Quiz Game for Global Wine Regions）

這是一款以 Google Sheets 題庫為基礎的互動選擇題遊戲，幫助使用者學習世界各地的葡萄酒產區與品種知識。支援題庫選擇、難易度切換、音效提示與排行榜功能。


📍 線上遊戲網址：  
👉 https://chungshu224.github.io/wine-quiz/select.html

## 🔧 功能說明

| 功能 | 說明 |
|------|------|
| ✅ 題庫選擇 | 從多國題庫（Google Sheets）選擇要練習的產區 |
| 🎚️ 難度切換 | 提供「容易模式」與「困難模式」選擇 |
| 🔊 音效提示 | 答對／答錯／點擊皆有音效反饋 |
| 🏆 排行榜 | 儲存玩家暱稱、分數、耗時與難度，保留前10名 |
| 🔄 返回選擇頁 | 可隨時返回重新選擇題庫與難度設定 |

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
