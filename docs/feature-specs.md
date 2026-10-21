# 官方功能核對與模板邊界

查閱日：2026-10-22，Asia/Taipei。下列是文件核對，不表示已對每個帳號方案實測；不在模板寫死模型、價格、方案、額度或入口。舊圖像文件失效，已改用現行官方頁。

| 類型 | 文件及核對重點 | 模板限制 |
|---|---|---|
| 一般 | [能力總覽](https://help.openai.com/en/articles/9260256-chatgpt-capabilities-overview)：文字、圖像、檔案及工具依設定提供 | 使用者自行附素材，缺資料不編造 |
| 研究 | [Deep research](https://help.openai.com/en/articles/10500283-deep-research-in-chatgpt)：計畫、可用來源與帶來源報告 | 先確認計畫，使用者自行開工具 |
| Canvas | [Canvas](https://help.openai.com/en/articles/9930697-what-is-the-canvas-feature-in-chatgpt-and-how-do-i-use-it)：文件與程式協作 | HTML 示範不等於多人後端、部署或共用儲存 |
| 圖像 | [Images](https://help.openai.com/en/articles/11084440-images-in-chatgpt)：可要求生成與編輯，也可提供原圖 | 使用者附圖，產物文字及細節須校對 |
| 引導 | [Study mode](https://openai.com/index/chatgpt-study-mode/)：互動提問、分階段學習及理解檢查 | 診斷、一次一問、等待回答、提示退場與遷移 |
| 搜尋 | [Search](https://help.openai.com/en/articles/9237897-searching-the-web-with-chatgpt)：查找網頁並提供可追溯資料 | 發布／事件日期分開，來源不足明說 |
| 資料 | [Data analysis](https://help.openai.com/en/articles/8437071-data-analysis-with-chatgpt)／[Uploads](https://help.openai.com/en/articles/8555545-uploading-files-and-audio-to-chatgpt)：檔案種類與分析能力依環境而異 | 先核對可讀性、欄位、單位與分母，不捏造數據 |
| 專案 | [Projects](https://help.openai.com/en/articles/10169521-using-projects-in-chatgpt)：彙整對話、素材與專案工作 | 只使用實際可取得材料，不假設讀到全部過往對話 |

研究／行政模板是整理與草稿，不作法規或醫療定論。程式模板清楚區分本機示範、Apps Script 與公開 API；Apps Script 須另外授權部署，API 示範優先免金鑰端點，不能把私密金鑰放前端。圖像生成不是可編輯文件保證。

全部模板加入來源資料與指令的界線、缺資料先問／標待提供、去識別及人員覆核。這是提示詞層的引導，不能保證模型抵抗所有注入。結構測試與逐項檢查見 prompt-quality.json；模型實際輸出及課堂成效尚未逐則驗證。
