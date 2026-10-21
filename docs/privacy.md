# ChatGPT EDU Prompt 隱私政策 / Privacy Policy

生效及更新日期：2026-10-22。開發者：數位敘事力期刊 吳奇（FW1201）。

聯絡：[數位敘事力期刊](https://www.facebook.com/Journal.of.Digital.Narrative/)；問題回報：[GitHub Issues](https://github.com/FW1201/ChatGPT-EDU-Prompt-Assistant-TW/issues)。本工具獨立開發，非 OpenAI 官方產品。

## 資料、用途與保存

本擴充功能處理使用者自訂提示詞、收藏、常用年級／科目／學校、語言／外觀、填寫內容及維護同步一致性的隨機裝置代碼。資料用於組裝提示詞、保存個人設定、備份與跨裝置同步。自訂文字或草稿可能包含個人資訊，請先去識別。

本機 chrome.storage.local 保存上述內容、填寫紀錄、版本及衝突資訊。按「複製提示詞」會在本機保存本則填寫值；填寫中的其他草稿僅留側邊欄記憶體。既有版本留下的元資料可能仍保存在本機，擴充功能不再執行舊版遷移或讀取網站 localStorage。

chrome.storage.sync 保存自訂提示詞、收藏、常用欄位、語言、外觀及合併所需版本／刪除標記；不包含填寫紀錄。是否跨裝置由 Chrome 登入、同步設定及管理政策決定，資料由 Chrome 的同步服務處理。沒有開發者自有伺服器、分析追蹤或廣告，也不販賣使用者資料。

## 網站及分享

只在 chatgpt.com 與 chat.openai.com 執行 content script。使用者要求原文插入或優化時，讀取當前聊天輸入框草稿以防未確認覆寫；文字暫存至插入確認完成或逾時，不傳給開發者、不保存為聊天歷史。不讀取對話歷史或 AI 回覆，不自動送出。

插入或手動貼上的文字由使用者自行確認並送出後，依 ChatGPT 與工作區政策處理。本工具不呼叫 AI API、不讀取登入憑證。點官方文件、Facebook 或 GitHub 連結會開啟對應網站，由對方政策處理該次瀏覽。

## 權限與控制

sidePanel 用於原生側邊欄；storage 用於保存與同步；兩個 ChatGPT 網域權限用於原文插入及草稿防覆寫。無全網站權限、歷史、廣告識別或追蹤權限。

資料保留至使用者刪除／清除或移除擴充功能；設定可清除填寫紀錄，自訂可逐則刪除、取消收藏。同步可能保留刪除標記以防舊裝置復活資料。停用 Chrome 同步及其雲端資料控制需在 Chrome 設定處理。

JSON 備份由使用者下載與保管，含自訂文字及設定／版本資料，不含填寫紀錄，未額外加密；可自行刪除備份。解除安裝不保證移除其他裝置、已匯出備份或網站原本資料。本工具不主動收集兒童個人資料，教育使用者應遵守學校政策並避免輸入可辨識學生資訊。

## English summary

We process user-authored prompts, favorites, defaults, preferences and locally saved form entries to provide this extension. Local data stays in chrome.storage.local; Chrome Sync handles prompts, favorites, defaults and preferences when enabled, excluding saved form entries. We operate no collection server, analytics or advertising and do not sell data.

Insertion reads only the current ChatGPT composer draft to prevent unconfirmed overwriting. We do not read chat history, capture AI responses, read credentials or automatically send messages. Content you send is governed separately by ChatGPT/workspace policies. You may delete prompts, clear entries, control Chrome Sync and export/delete your own unencrypted JSON backups. Contact the developer through the links above. The Traditional Chinese sections provide the complete processing details.
