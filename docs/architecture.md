# 維護架構

更新：2026-10-22。

sidepanel.html/js/css 提供書庫、填空、預覽、自訂編輯、設定與說明對話框。表單不提交或自動送出；填妥內容透過複製交付，原文插入與優化指令仍可使用。錯誤顯示於主內容 feedback，頁腳僅署名；成功訊息保留 aria-live 供輔助工具讀取。

background.js 是 MV3 service worker，序列化 Store 操作並排程 Chrome sync。只有同 extension ID、完整 URL 等於 sidepanel.html 的訊息可操作資料或插入；不以 sender.tab 是否存在判定可信度。原文插入先記住目標 tab、URL 與 token，確認後僅轉送同一目標。

content.js 只接收同擴充功能訊息；準備時讀取輸入框草稿，提交時重新核對 URL、節點、草稿與有效期，寫入純文字並回讀確認。沒有讀聊天歷史、網頁 localStorage 或自動按送出。

lib/core.js 包含欄位、填空、選項、資料驗證、向量時鐘合併、備份與同步分塊；lib/store.js 負責本機交易回滾、同步、收藏與自訂 CRUD。失敗不清空使用者資料。舊 legacy: ID 格式仍允許驗證，保留已遷移／已匯出資料的相容性；遷移執行流程已移除。

prompts/categories.json 定義 14 類及官方連結；zh/en 各 196 則，共用任務 ID 與欄位 ID。移除錯誤欄位時不重新編號剩餘 ID，以維持填寫紀錄對應。方括號只用於可填寫欄位，不用於輸出表頭。

tests/core-store.test.mjs 驗證資料合併與失敗界線；browser-regression.cjs 使用真實側邊欄模組與模擬傳輸；extension-smoke.cjs 實際載入擴充功能，目標網頁使用合成測試文件。scripts/audit.mjs 檢查全部結構，scripts/package.py 用白名單打包。測試工具不進入商店執行 ZIP。

跨裝置同步的遠端 pointer 不保證所有裝置同時抵達；完整世代未到時保留本機、標示 incomplete 並重試。實際登入的兩裝置與教育管理政策仍需人工驗收，不能以模擬兩個 Store 取代。
