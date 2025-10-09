# ChatGPT EDU Prompt Assistant

為台灣教育場域設計的 ChatGPT 提示詞模板擴充功能，提供豐富的教育提示詞庫，支援中英文雙語介面。

## 🎯 功能特色

- **雙語支援**：完整的中英文介面切換
- **豐富提示詞庫**：涵蓋教師教學、學生學習、華語文教學等類別
- **一鍵插入**：點擊即可將提示詞直接插入 ChatGPT 輸入框
- **GPTs 指令生成**：支援生成結構化的 GPT 指令
- **自定義提示詞**：支援新增、編輯、刪除個人提示詞
- **Gemini API 優化**：內建提示詞優化功能
- **黑白雙主題**：支援亮色與暗色主題自動切換
- **側邊欄介面**：不干擾原有 ChatGPT 使用體驗

## 📦 安裝方式

### 手動安裝
1. 下載此專案檔案
2. 開啟 Chrome 瀏覽器，前往 `chrome://extensions/`
3. 開啟「開發人員模式」
4. 點擊「載入未封裝項目」
5. 選擇專案資料夾

## 🚀 使用方法

### 基本使用
1. 前往 [ChatGPT](https://chat.openai.com/)
2. 點擊瀏覽器工具列的擴充功能圖示
3. 選擇所需的提示詞類別
4. 點擊提示詞按鈕即可插入

### 語言切換
- 在彈出視窗或側邊欄右上角點擊語言切換按鈕
- 支援繁體中文和英文介面

### GPTs 指令模式
- 在側邊欄選擇「GPTs 指令」模式
- 插入的提示詞將自動轉換為結構化的 GPT 指令格式

### 自定義提示詞
1. 在側邊欄選擇「自定義提示詞」類別
2. 點擊「📝」按鈕設定 Gemini API Key
3. 即可使用提示詞優化功能

## 📚 提示詞類別

### 中文版
- **教師教學**：年度課程藍圖、單元逆向設計、差異化學習包
- **學生學習**：學習計畫微調、反思日誌引導
- **華語文教學**：教案撰寫、學習單製作、情境對話練習

### 英文版
- **Teaching & Instruction**：Annual Curriculum Blueprint, Unit Backward Design, Differentiated Learning Package
- **Student Learning**：Learning Plan Adjustment, Reflection Journal Guide
- **Chinese Language Teaching**：Lesson Plan Writing, Worksheet Creation, Situational Dialogue Practice

## 🔧 技術規格

- **Manifest Version**: 3
- **支援瀏覽器**: Chrome, Edge, 其他 Chromium 核心瀏覽器
- **權限需求**: `activeTab`, `storage`
- **適用網站**: `https://chat.openai.com/*`, `https://chatgpt.com/*`
- **API 整合**: Gemini API (用於提示詞優化)

## 🛡️ 隱私保護

- 不收集任何個人資料
- 不讀取瀏覽歷史或其他網站內容
- 自定義提示詞僅儲存在本地瀏覽器
- Gemini API Key 僅用於提示詞優化功能

## 📝 檔案結構

```
ChatGPT Extension/
├── 128.png              # 擴充功能圖示
├── manifest.json        # 擴充功能配置檔
├── popup.html           # 彈出視窗（雙語支援）
├── popup.js             # 彈出視窗邏輯
├── content.js           # 核心功能（雙語支援）
└── README.md            # 說明文件
```

## 👨💻 開發者

**數位敘事力期刊 吳奇**

## 📄 授權條款

MIT License

## 🤝 貢獻

歡迎提交 Issue 或 Pull Request 來改善此專案。

## 📞 聯絡方式

如有問題或建議，請透過 GitHub Issues 聯繫。