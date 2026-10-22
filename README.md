# ChatGPT EDU Prompt

數位敘事力期刊的教育提示詞 Chrome 側邊欄。14 類、196 則任務，每則提供繁體中文與英文版本；採 Manifest V3，不需 API Key、後端或編譯。

## 使用

Chrome 116 以上：在 `chrome://extensions/` 開啟開發人員模式，載入解壓縮的擴充功能資料夾；正式安裝則由 Chrome Web Store 提供。

1. 點擴充功能圖示開啟側邊欄，選分類、收藏或自訂；搜尋會跨全部分類。
2. 點模板、填寫欄位、展開完整提示詞預覽。點右側「複製提示詞」圖示，將填妥內容自行貼到 ChatGPT。
3. 文件圖示為「插入原文」：填入未套用欄位的模板原文。原聊天框已有草稿時需確認取代。送出均由使用者自行完成。
4. 問號開啟使用說明與官方文件。設定可保存常用欄位、外觀、備份及清除全部填寫紀錄。

「插入 ChatGPT」主按鈕與逐則清除按鈕已移除。點複製時保存上次填寫至本機。錯誤與複製備援顯示在內容區；底部僅保留期刊署名。剪貼簿受限時顯示可手動選取的文字框。

## 功能與界線

- 自訂提示詞新增、編輯、刪除、收藏、跨分類搜尋與中英切換；重複佔位符只填一次。
- 自訂提示詞、收藏、常用欄位、語言與主題透過 Chrome 同步；填寫紀錄只存本機。
- JSON 匯出及合併匯入；保留既有內容，常用欄位只補空白；備份不含填寫紀錄。
- 自訂提示詞可產生優化指令並插入 ChatGPT，由使用者送出、讀取回覆並貼回編輯器。
- 不讀聊天歷史、不擷取 AI 回覆、不自動送出、不附檔、不切換模型或啟動工具。
- 原文插入支援 ChatGPT 對話頁；其他網站仍可瀏覽與複製。GPTs 編輯頁不支援。
- 既有 2.0 資料與已遷移提示詞仍可讀取；不再執行 1.x 自動遷移或存取網站 localStorage。舊版更新前先備份自訂內容，不先移除舊安裝。

## 提示詞與鷹架

分類涵蓋教學、親師、行政、學生學習、華語文、研究、程式、圖像、引導學習、互動視覺化、搜尋、資料分析、Projects 與文件協作。

學習對話採先備診斷、一次一問、依回答調整、線索至局部示範、獨立表現後提示退場、新情境與自我解釋。教材設計要求示範、引導練習與獨立實作；工作流程模板要求來源、專用交付及可檢核結果。缺漏資料不得補造，正式用途由人員覆核。

[提示詞檢查矩陣](docs/prompt-quality.json) 包含全部 392 份在地化模板。結構檢查不代表每次 AI 回應正確，也不代表已完成教學成效實驗。

## 驗證與打包

Node.js 20.11+、Python 3；執行期無第三方套件。測試工具由 package-lock.json 鎖定。

```sh
npm ci
npx playwright install chromium
npm test
npm run audit
npm run test:browser
node tests/extension-smoke.cjs
npm run package
```

測試預設使用 macOS Chrome；以 `CHROME_PATH` 指定其他路徑。擴充功能實載測試須使用支援 `--load-extension` 的 Chrome for Testing／Chromium，以 `EXTENSION_CHROME_PATH` 指定路徑。可用 `PLAYWRIGHT_PATH` 指定既有 Playwright 模組位置。`QUICK=1` 只跑操作流程；完整驗證不設此變數。

打包採固定白名單，19 個執行與授權檔案。`dist/chatgpt-edu-tw-2.0.0.zip` 上傳商店；`dist/chatgpt-edu-tw-2.0.0-submission-kit.zip` 是含說明與素材的提交資料包，不能當擴充功能 ZIP 上傳。雜湊在 dist/SHA256SUMS.txt。

品牌原圖保留於 icons/logo-source.png。`node scripts/store-assets.cjs` 可重建 16／32／48／128px PNG 與 440×280 商店宣傳圖；原圖不進入執行 ZIP。

## 發布與隱私

[完整上傳說明](docs/chrome-web-store.md) · [中文文案](docs/store-listing-zh.md) · [English listing](docs/store-listing-en.md) · [隱私政策](docs/privacy.md) · [最終 review](docs/final-review.md)

驗證分開記錄資料測試、瀏覽器模擬、MV3 實載與使用者帳號的證據。未完成項目見 [發布檢查](docs/release-checks.json)；可上傳檔案不等於已送審或已上架。

## 開發者與來源

Developed by [數位敘事力期刊](https://www.facebook.com/Journal.of.Digital.Narrative/)。MIT；來源見 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。本工具為獨立開發，非 OpenAI 官方產品，未與 OpenAI 隸屬或合作；相關商標屬其權利人。
