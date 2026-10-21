# Chrome Web Store 上傳與送審說明

準備日期：2026-10-22。適用 2.0.0；本次準備檔案與 GitHub 備份，不代為送審或發布。

## 1. 檔案選擇

| 檔案 | 用途 |
|---|---|
| dist/chatgpt-edu-tw-2.0.0.zip | 上傳 Developer Dashboard 的擴充功能 ZIP；manifest.json 在根目錄 |
| dist/chatgpt-edu-tw-2.0.0-submission-kit.zip | 本說明、文案、隱私、檢查矩陣、圖片及內嵌執行 ZIP；不要把整包當擴充功能上傳 |
| dist/SHA256SUMS.txt | 兩個 ZIP 的 SHA-256 |
| docs/store-listing-zh.md、store-listing-en.md | 可貼上的商店名稱、簡短與詳細說明 |
| docs/store-assets/promo-440x280.png | 440×280 宣傳小圖 |
| docs/store-assets/screenshot-*.png | 1280×800 或 640×400 的實際介面截圖 |
| 128.png | 原創教育圖示，128×128 PNG |

執行 ZIP 僅含 16 個白名單檔案。測試、開發相依、個人操作截圖、舊版 popup、文件歷史與 Git 資料不進入執行套件。

## 2. 上傳前

1. 用解壓縮的執行 ZIP 在測試設定檔載入未封裝項目；確認側邊欄、搜尋、填寫、複製、原文插入、現有草稿確認與備份。
2. 在既有商店項目更新時保留原 extension ID；先由舊版匯出或另存自訂資料。2.0 不再自動遷移 1.x 網站或 popup 資料。
3. 確認版本比商店已發布版本高。套件目前為 2.0.0；若商店已使用 2.0.0，先調高 manifest 與 package.json 版本、跑驗證並重新打包，不能只改 ZIP 名稱。
4. 確認發布者帳號、聯絡信箱與適用地區。商店開發者帳號及費用由發布者處理。
5. 隱私政策使用本次備份分支的公開 HTTPS 網址：`https://github.com/FW1201/ChatGPT-EDU-Prompt-Assistant-TW/blob/backup%2Fedu-prompt-2.0.0-20261022/docs/privacy.md`。提交前以未登入狀態開啟確認可讀。日後若合併至主分支，可改填正式主分支政策網址。

## 3. Developer Dashboard

開啟 [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)。現有項目選 Package／Upload new package；首次則 Add new item。依 [Google 上傳說明](https://developer.chrome.com/docs/webstore/publish) 上傳執行 ZIP，等待 manifest 檢查完成，再處理 Store listing、Privacy、Distribution 與 Test instructions。

Store listing 建議主要語言繁體中文、分類 Education（若目前控制台提供；否則選最接近的教育／工作效率分類）。名稱、簡短說明和詳細說明貼入對應文案；英文版本透過本地化列表另填。支援網址可填 GitHub Issues，首頁可填 GitHub 專案；不要填不存在的支援信箱。明確保留獨立開發、非 OpenAI 官方產品的說明。

依 [Google 圖片規格](https://developer.chrome.com/docs/webstore/images)，提供 128px PNG 圖示、440×280 小宣傳圖及至少一張 1280×800／640×400 截圖。本包使用真實介面及匿名示範資料，沒有個人聊天內容；不要使用 local-only 目錄的截圖。圖片數量、格式與要求仍以當次控制台校驗為準。

## 4. Privacy 欄位可貼內容

### Single purpose

提供教育提示詞的瀏覽、填空、收藏、自訂、備份與同步，並在使用者要求時複製內容或將原文／優化指令填入 ChatGPT，協助整理教育任務。

### sidePanel justification

在 Chrome 原生側邊欄顯示提示詞書庫、填寫表單、預覽、自訂編輯及設定，讓使用者於目前網頁旁操作。

### storage justification

使用 chrome.storage.local 保存自訂提示詞、收藏、設定、填寫紀錄與同步版本資訊；使用 chrome.storage.sync 同步自訂提示詞、收藏及設定。填寫紀錄不進入同步或備份。

### Host permissions justification

僅要求 https://chatgpt.com/* 與 https://chat.openai.com/*。使用者要求插入時，辨識聊天輸入框、檢查未送出草稿、取得取代確認並填入純文字；不讀聊天歷史或 AI 回覆，不自動送出，不需要其他網站權限。

### Remote code

No. All executable JavaScript and SVG assets are packaged locally. No remote scripts, eval, external libraries or remotely supplied executable code are used by the extension. External documentation opens only after user action. Prompt text is data, not extension code.

### 資料處理申報

不要填「完全不處理任何資料」。依 [Google 使用者資料 FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)，僅在本機處理也需揭露。擴充功能會處理網站內容（目前 composer 草稿）及使用者輸入內容；自訂文字／草稿可能含個人通訊。依控制台當次定義對應網站內容與個人通訊等實際適用欄位，與本包隱私政策一致；沒有認證資訊、金融交易、廣告追蹤或瀏覽歷史收集。

說明 Chrome Sync 是平台同步服務，開發者沒有接收伺服器。不能把「不傳給開發者」寫成「不使用任何網路服務」。使用者自行將提示詞送至 ChatGPT 的行為也與 Chrome Sync 分開說明。

Data use certifications：可依實作確認不販賣資料、不將資料用於與單一用途無關的活動、不用於信用評分或借貸判定。將隱私政策網址貼入 Privacy policy URL。

## 5. Test instructions（英文可貼）

No extension-specific account or API key is required. Open the toolbar action to show the native side panel. Browse a category, search a term, open a prompt and fill fields. Expand the preview and use the Copy prompt icon; if clipboard access is denied, a selectable text box appears in the main area. The document icon inserts the unfilled original template on a supported ChatGPT conversation. A ChatGPT account may be required by that website; no credentials are provided by the extension. Start with an empty draft, then repeat with an existing draft and confirm/cancel replacement. The extension never sends the message. Add/edit/delete a custom prompt, favorite it, change language/theme, export/import a JSON backup and clear saved form entries in Settings. Chrome Sync requires the reviewer's own enabled Chrome Sync. No payment or paid ChatGPT feature is required to browse, edit or copy prompts. Specialized ChatGPT tools may require separate availability.

## 6. Review 前確認與發布

確認 preview、圖片、隱私申報及資料處理條款，再由發布者選擇提交。建議先用可控測試發行對象驗證既有使用者更新；不要宣稱已完成尚未執行的雙實體裝置同步或所有模型回應測試。Chrome 審查是否接受產品名稱、商標聲明與素材由商店及權利人規範判定，套件有效不代表保證通過。

送審與發布是不同狀態，記錄控制台回覆及實際公開頁。上線後，從商店安裝版本再核對版本號、側邊欄與既有資料；如需撤回，使用控制台的停止分發功能，勿先刪除使用者本機資料。
