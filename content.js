// 核心變數
let sidebar = null;
let currentLanguage = localStorage.getItem('chatgptPromptLanguage') || 'zh';
let currentCategory = currentLanguage === 'zh' ? '教師教學' : 'Teaching & Instruction';
let apiKey = localStorage.getItem('geminiApiKey') || '';
let outputMode = localStorage.getItem('chatgptPromptOutputMode') || 'chat';

// 常數
const CHATGPT_BUTTON_ID = 'custom-prompt-btn-chatgpt';
const SIDEBAR_STYLE_ID = 'chatgpt-prompt-style';

// 語言配置
const LANGUAGES = {
  zh: {
    title: 'GPT EDU Prompt',
    toggleSidebar: '開啟提示詞面板',
    toggleTheme: '切換主題',
    closePanel: '關閉面板',
    chatMode: '💬 對話模式',
    gptsMode: '🤖 GPTs 指令',
    insertBtn: '✨ 插入',
    addPrompt: '➕ 新增自定義提示詞',
    noPrompts: '此分類尚未提供提示詞。',
    noCustomPrompts: '尚未建立任何自定義提示詞。',
    apiKeyTitle: 'Gemini API Key 設定',
    apiKeyDesc: '輸入您的 Gemini API Key 以啟用 AI 提示詞優化功能（僅需設定一次，會自動記憶）：',
    apiKeyPlaceholder: '請輸入 Gemini API Key',
    cancel: '取消',
    save: '儲存',
    saved: 'API Key 已儲存並記憶！'
  },
  en: {
    title: 'GPT EDU Prompt',
    toggleSidebar: 'Open Prompt Panel',
    toggleTheme: 'Toggle Theme',
    closePanel: 'Close Panel',
    chatMode: '💬 Chat Mode',
    gptsMode: '🤖 GPTs Instructions',
    insertBtn: '✨ Insert',
    addPrompt: '➕ Add Custom Prompt',
    noPrompts: 'No prompts available in this category.',
    noCustomPrompts: 'No custom prompts created yet.',
    apiKeyTitle: 'Gemini API Key Setup',
    apiKeyDesc: 'Enter your Gemini API Key to enable AI prompt optimization (set once, remembered automatically):',
    apiKeyPlaceholder: 'Enter Gemini API Key',
    cancel: 'Cancel',
    save: 'Save',
    saved: 'API Key saved and remembered!'
  }
};

// 提示詞類別
const promptCategories = {
  zh: {
    '教師教學': [
      { name: '📊 年度課程藍圖', text: '請以108課綱素養導向精神協助我規劃[年級、科目]的年度課程藍圖。請依序完成：1) 分析該科目對應的核心素養（自主行動A、溝通互動B、社會參與C）及學習重點，2) 設計跨領域主題統整課程，3) 規劃每月學習表現指標與真實情境任務，4) 建構多元評量機制（包含學習歷程檔案），5) 融入議題教育（如性平、環境、人權等）。請特別說明如何透過探究與實作培養學生解決真實問題的能力。' },
      { name: '🎯 單元逆向設計', text: '請運用UbD逆向設計模式為[主題]規劃[週數]週單元，完全符合108課綱素養導向教學。步驟：1) 確立終極目標（核心素養+學習重點+真實情境應用），2) 設計真實性評量任務（表現任務+評量規準），3) 規劃學習體驗（探究歷程+鷹架支持）。請特別強調如何透過高層次思考技能（分析、評鑑、創造）培養學生批判思考與創新能力，並提供差異化教學策略。' },
      { name: '🌱 素養導向課堂導入', text: '請為[年級][主題]設計三種素養導向課堂導入策略，每種都要：1) 連結學生生活經驗與真實情境，2) 激發學習動機與好奇心，3) 預告學習目標與成功標準，4) 設計認知衝突或問題情境，5) 規劃小組討論與分享機制。請說明如何透過導入活動培養學生自主學習態度，並提醒可能的教學風險與因應策略。' },
      { name: '🔬 探究實作活動', text: '請為[課程主題]設計一個[時長]分鐘的探究實作活動，符合108課綱探究與實作精神。包含：1) 生活化問題情境設定，2) 探究步驟設計（觀察→提問→實驗→分析→結論），3) 小組合作學習安排，4) 簡易材料與工具運用，5) 安全注意事項，6) 反思討論問題。請說明如何培養學生觀察思考與解決問題的能力。' },
      { name: '🌈 適性差異化學習', text: '針對[主題]設計三層次差異化學習任務，落實108課綱適性學習理念。每層次包含：1) 明確學習目標與核心素養指標，2) 不同認知層次的學習任務（記憶理解→應用分析→評鑑創造），3) 多元智能取向的學習活動，4) 個別化支持策略與鷹架，5) 多元展現方式（口語、文字、視覺、表演等），6) 同儕互助機制。請提供具體的檢核工具與回饋策略，確保每位學生都能達成基本學力。' },
      { name: '📝 多元形成性評量', text: '請為[主題]設計完整的形成性評量系統，符合108課綱評量理念。包含：1) 學習目標與成功標準的具體化，2) 多元評量方式（觀察、實作、檔案、同儕互評等），3) 即時回饋機制與調整教學策略，4) 學生自我評量與反思工具，5) 數位評量平台運用。請特別說明如何透過評量促進學習，而非僅是學習結果的檢驗，並提供具體的評量規準與回饋語句範例。' },
      { name: '🧠 高層次思考提問', text: '請依據Bloom認知層次為[主題]設計六個層次遞進的提問，培養學生思考能力：1) 記憶層次（事實回憶），2) 理解層次（概念解釋），3) 應用層次（實際運用），4) 分析層次（要素分解），5) 評鑑層次（價值判斷），6) 創造層次（新想法產出）。每題請附上：預期學生回應、追問策略、思考提示，並說明如何引導學生深度思考。' },
      { name: '👥 學習社群經營', text: '請協助我撰寫給學生的課後學習社群訊息，回顧今天[主題]的學習成果。內容包含：1) 學習重點回顧與連結，2) 學生表現亮點肯定，3) 反思問題引導，4) 延伸學習資源推薦，5) 下次課程預告與準備事項，6) 同儕互助學習鼓勵。字數控制在250字內，語調溫暖鼓勵，體現師生學習夥伴關係。' },
      { name: '📊 數位化教學設計', text: '請為[主題]設計數位化教學方案，結合108課綱精神與現代科技。包含：1) 數位工具選擇與教學目標對應，2) 互動式學習活動設計（VR/AR、遊戲化學習、線上協作），3) 數位素養與資訊安全教育，4) 個人化學習路徑設計，5) 數位作品集與學習歷程記錄，6) 線上線下混合式教學模式。請特別說明如何培養學生數位公民素養與批判思考能力。' },
      { name: '🌱 跨領域統整課程', text: '請為[年級]設計[主題]跨領域統整課程，落實108課綱素養導向精神。課程架構：1) 核心素養與學習重點整合（至少三個領域），2) 真實情境問題設定與探究任務，3) 協作學習與分組專案實作，4) 多元評量與成果展示方式，5) 社區連結與實際應用機會，6) 反思與延伸學習活動。請特別強調如何透過跨領域學習培養學生系統思考與綜合解決問題的能力。' }
    ],
    '學生學習': [
      { name: '🎯 自主學習計畫', text: '請協助我制定[考試或學習目標]的自主學習計畫，時程[週數]週。請包含：1) 學習目標分解與優先順序，2) 每週具體學習任務與時間分配，3) 多元學習策略運用（視覺、聽覺、動覺），4) 自我監控與調整機制，5) 學習成效檢核方式，6) 同儕學習與資源運用，7) 壓力管理與動機維持策略。請特別說明如何培養後設認知能力，讓我成為自己學習的主人。' },
      { name: '🧠 心智圖筆記法', text: '請協助我為[科目或主題]建立心智圖式筆記架構，運用視覺化學習策略。包含：1) 核心概念與分支主題，2) 關鍵詞彙與概念連結，3) 圖像符號與色彩編碼，4) 實例與應用情境，5) 記憶口訣與聯想技巧，6) 自我測試問題設計，7) 跨章節概念統整。請說明如何透過心智圖促進深度理解與長期記憶。' },
      { name: '🎤 簡報表達技巧', text: '我要進行[主題]的[語言][分鐘]簡報。請協助我：1) 設計吸引人的開場與結尾，2) 建構清晰的論述架構（問題→分析→解決方案），3) 準備視覺輔助工具與互動元素，4) 練習肢體語言與聲音表情，5) 預備Q&A應對策略，6) 克服緊張情緒的技巧，7) 時間控制與節奏掌握。請特別強調如何透過故事化與情境化提升說服力。' },
      { name: '📝 學習反思日誌', text: '請為[學習活動]設計深度反思日誌模板，培養自主學習能力。反思架構：1) 學習事實記錄（做了什麼、學到什麼），2) 情感體驗分析（感受、困難、成就感），3) 認知歷程檢視（思考方式、策略運用、概念連結），4) 學習成效評估（目標達成度、能力提升），5) 問題解決反思（遇到的挑戰、解決方法、替代策略），6) 未來行動規劃（改進方向、新目標設定）。請提供具體的引導問句與反思提示。' },
      { name: '✅ 自我評量檢核', text: '請為[科目主題]設計自我評量檢核表，涵蓋不同認知層次。包含：1) 基礎知識檢核（概念定義、事實記憶），2) 理解程度測試（解釋說明、舉例應用），3) 應用能力評估（問題解決、情境轉移），4) 分析思考檢驗（要素分解、關係比較），5) 評鑑能力測試（價值判斷、證據評估），6) 創新思維展現（新穎想法、改進建議）。每項提供自評標準與改進建議。' },
      { name: '🤝 協作學習策略', text: '我們[人數]人要完成[專案項目]。請設計協作學習方案：1) 角色分工與責任分配（考量個人專長與學習需求），2) 協作流程與時程規劃，3) 溝通機制與會議安排，4) 衝突解決與共識建立，5) 同儕互評與回饋機制，6) 成果整合與品質控制，7) 團隊學習反思與慶祝。請強調如何透過協作提升每個人的學習成效。' },
      { name: '💪 學習困難突破', text: '我在[技能或概念]學習上遇到困難：[具體描述現況]。請協助我：1) 診斷學習困難的根本原因（先備知識、學習方法、動機態度等），2) 設計個人化突破策略，3) 規劃循序漸進的練習計畫，4) 尋找適合的學習資源與工具，5) 建立學習支持網絡，6) 設定階段性成功指標，7) 培養挫折容忍力與成長心態。請連結真實應用情境，讓學習更有意義。' },
      { name: '📊 資訊整合分析', text: '我收集了關於[主題]的多元資料：[來源A]、[來源B]、[來源C]。請協助我：1) 建立資訊可信度評估標準，2) 分析各來源的觀點與立場，3) 整理共同點與差異點，4) 識別資訊缺口與偏誤，5) 建構個人觀點與論述，6) 規劃進一步探究方向，7) 學習批判性思考技能。請教導我如何成為資訊時代的智慧學習者。' },
      { name: '🎨 創意思考訓練', text: '我想提升[領域]的創意思考能力。請設計創意訓練方案：1) 發散性思考練習（腦力激盪、心智圖、六頂思考帽），2) 收斂性思考技巧（概念整合、優先排序、可行性評估），3) 創意解決問題流程（問題重新定義、多元解決方案、創新實驗），4) 跨領域靈感啟發（類比思考、隱喻聯想、跨界學習），5) 創意作品產出與分享，6) 創意思維習慣養成，7) 創意評估與改進機制。請提供具體的練習活動與自我檢核工具。' },
      { name: '⏰ 時間管理優化', text: '我需要改善學習時間管理，目前狀況：[描述現況]。請協助我：1) 時間使用現況分析與問題診斷，2) 個人化時間管理系統建立（番茄工作法、時間區塊、優先矩陣），3) 學習任務分解與時程規劃，4) 專注力提升與干擾排除策略，5) 休息與恢復時間安排，6) 效率工具與數位助手運用，7) 時間管理習慣養成與持續改進。請特別說明如何在學習效率與身心健康間取得平衡。' }
    ],
    '研究學習指令（搭配「深入研究」功能）': [
      { name: '🔍 研究問題精煉', text: '我想探討[議題]。請協助我：1) 分析議題背景與相關利害關係人，2) 將主題拆解為3-5個具體子問題，3) 為關鍵概念提供清晰定義與可觀察指標，4) 評估研究可行性（資料取得難易度、時間成本、倫理考量），5) 形成1-2個聚焦的研究問題，6) 說明研究的實際價值與預期貢獻。請提供具體可操作的建議。' },
      { name: '🗺️ 文獻整理架構', text: '根據我提供的文獻資料[貼上資料]，請協助我建立系統性整理：1) 按主題、方法或時間分類文獻，2) 識別核心概念與其相互關係，3) 整理主要發現與證據強度，4) 指出研究空白與爭議點，5) 建議後續搜尋的關鍵詞組合，6) 提供簡潔的文獻綜述大綱。請確保分類邏輯清晰且實用。' },
      { name: '⚖️ 資訊可信度評估', text: '針對「[主張或資訊]」，請協助我評估其可信度：1) 檢查資訊來源的權威性與專業性，2) 分析證據的完整性與相關性，3) 識別可能的偏見或利益衝突，4) 比較不同來源的一致性，5) 評估邏輯推理的合理性，6) 給出整體可信度評級（高/中/低）並說明理由，7) 建議需要進一步查證的要點。' },
      { name: '⚔️ 多元觀點整理', text: '請整理[議題]的不同觀點：1) 列出主要立場及其核心論點，2) 分析各立場的支持證據與邏輯基礎，3) 整理常見的反駁與回應，4) 比較各觀點的優勢與局限性，5) 識別可能的共識點或妥協空間，6) 提供平衡客觀的綜合分析，避免偏向任何一方。' },
      { name: '📊 研究方法比較', text: '我要研究[主題]。請比較3種適合的研究方法：1) 說明各方法的適用情境與限制，2) 比較所需資源、時間與技能要求，3) 分析資料品質與結果可信度，4) 評估實施難度與潛在風險，5) 建議最適合的方法組合，6) 提供具體的實施步驟與時程規劃。' },
      { name: '📝 研究摘要撰寫', text: '根據我的研究內容[貼上重點]，請協助撰寫250字內的摘要：1) 簡述研究背景與目的，2) 概括研究方法與對象，3) 突出主要發現與數據，4) 說明結論與實際應用價值，5) 保持客觀準確的語調，6) 建議3-5個關鍵詞。請確保摘要能讓讀者快速掌握研究精髓。' },
      { name: '🎤 研究報告結構', text: '我要在[場合]報告研究成果。請提供：1) 清晰的報告架構（背景→方法→發現→意義→行動），2) 各部分的重點內容與時間分配，3) 有效的開場與結尾策略，4) 視覺輔助工具的使用建議，5) 預期問題的準備與回應策略，6) 提升聽眾參與度的互動技巧。' },
      { name: '🔬 研究假設形成', text: '針對[研究主題]，請協助我形成研究假設：1) 基於現有理論與證據提出合理假設，2) 確保假設具體可測且邏輯清晰，3) 識別需要控制的變項，4) 考慮可能的替代解釋，5) 建議適合的驗證方法，6) 評估假設的理論與實務意義。請確保假設符合科學研究標準。' },
      { name: '📊 資料視覺化規劃', text: '我有[資料類型]需要視覺化呈現。請建議：1) 分析目標受眾與溝通目的，2) 選擇適合的圖表類型，3) 設計清晰的視覺層次與色彩配置，4) 確保資料準確性與可讀性，5) 考慮無障礙設計原則，6) 推薦實用的製作工具。請提供簡單易懂的操作建議。' },
      { name: '📝 研究計畫設計', text: '我想規劃[研究主題]的完整研究。請協助我：1) 設定明確的研究目標與預期成果，2) 選擇適合的研究方法與工具，3) 規劃詳細的時程與里程碑，4) 評估所需資源與預算，5) 識別潛在風險與應對策略，6) 設計品質控制與評估機制，7) 考慮倫理與法律要求。請提供可執行的具體計畫。' }
    ],
    '創意設計指令（搭配「創作圖像」功能）': [
      { name: '🎨 角色設計描述', text: '請為[角色設定]創建詳細的視覺描述：1) 角色的性格特質與背景故事，2) 外觀特徵（體型、面部、髮型、服裝），3) 色彩配置與材質質感，4) 姿態與表情設定，5) 環境背景與氛圍燈光，6) 藝術風格選擇（卡通、寫實、插畫等），7) 需要避免的元素或特徵。請確保描述生動且具體。' },
      { name: '🏫 教育情境插畫', text: '我需要一張[教育主題]的教學情境插畫。請協助設計：1) 學習環境設定（教室、圖書館、戶外、線上），2) 師生互動情景與學習氛圍，3) 教學工具與學習材料的呈現，4) 多元學習者的包容性呈現，5) 溫馨正向的學習氛圍，6) 適合的色彩調性與光線設計，7) 圖像尺寸與用途建議。' },
      { name: '📜 海報設計概念', text: '請為[活動或主題]設計吸引人的海報：1) 主視覺元素與設計理念，2) 標題層級與資訊組織結構，3) 色彩搭配與視覺對比策略，4) 字體選擇與排版節奏，5) 圖像與文字的平衡配置，6) 行動呼籲的設計與位置，7) 不同媒體平台的適用性考量。請提供具體可執行的設計指引。' },
      { name: '🤖 吉祥物創作指引', text: '請為[機構或品牌]設計一個可愛的吉祥物：1) 品牌價值與目標受眾分析，2) 形象設計理念與象徵意義，3) 外觀特徵與色彩配置，4) 性格設定與情感連結，5) 多種表情與動作變化，6) 在不同應用場景下的適用性，7) 延伸商品與媒體應用可能性。請確保設計具有識別度與親和力。' },
      { name: '🔍 視覺隱喻設計', text: '我要將[抽象概念]轉化為視覺化表現。請提供3個創意方案：1) 核心隱喻符號與文化意義，2) 視覺元素的組合與層次關係，3) 色彩心理學與情感傳達，4) 文字與圖像的結合方式，5) 跨文化理解與溝通考量，6) 不同媒體平台的適用性，7) 延伸變化與應用可能性。' },
      { name: '📚 故事分鏡設計', text: '請為[故事主題]設計一個引人入勝的分鏡故事：1) 故事結構與情節發展設計，2) 主要角色設定與關係動態，3) 場景設定與視覺風格統一，4) 對話與旁白的語言風格，5) 節奏掌控與情緒起伏，6) 視覺特效與聲音元素建議，7) 目標受眾與傳達目的考量。' },
      { name: '🎨 視覺風格統一', text: '我需要為[專案或品牌]建立一致的視覺風格。請提供：1) 風格定位與設計理念闡述，2) 色彩系統與調性規範，3) 字體選擇與排版原則，4) 圖像處理與視覺元素風格，5) 版面配置與空間運用原則，6) 不同媒體平台的適配指引，7) 品質控制與一致性檢核標準。' },
      { name: '🎨 色彩搭配系統', text: '請為[主題或情境]設計完整的色彩系統：1) 主色調選擇與情感傳達目標，2) 輔助色與點綴色的配置策略，3) 色彩對比與和諧平衡原則，4) 不同媒體載體的色彩表現考量，5) 無障礙設計與色盲友善性，6) 文化背景與目標受眾適合性，7) 實際應用範例與使用指引。' },
      { name: '📱 數位介面設計', text: '我要設計[應用程式或網站]的使用者介面。請提供：1) 使用者需求分析與使用情境設定，2) 資訊架構與導航系統設計，3) 互動元件與狀態設計規範，4) 響應式設計與裝置適配，5) 可用性與無障礙設計考量，6) 視覺層次與資訊優先級，7) 使用者測試與改進建議。' },
      { name: '🎭 品牌視覺設計', text: '請為[品牌名稱]建立完整的視覺識別系統：1) 品牌定位與核心價值闡述，2) 標誌設計理念與視覺元素，3) 字體系統與排版規範，4) 色彩系統與視覺語言，5) 應用系統與媒體展現規範，6) 品牌守護指引與使用規範，7) 市場應用與競爭分析考量。請確保設計具有獨特性與識別度。' }
    ],
    '程式編寫指令（搭配「畫布」功能）': [
      { name: '🔄 演算法分析與設計', text: '請協助我分析[問題描述]所需的演算法解決方案：1) 明確定義輸入、輸出與特殊情況，2) 設計步驟化解決流程與偽程式碼，3) 選擇適合的資料結構與說明理由，4) 分析時間複雜度與空間需求，5) 比較不同方法的優缺點，6) 設計測試案例驗證正確性，7) 提供具體的實作建議與注意事項。' },
      { name: '🧪 測試策略設計', text: '針對[功能或模組]設計完整的測試策略：1) 正常情境與邊界值測試，2) 異常輸入與錯誤處理測試，3) 效能與壓力測試設計，4) 整合測試與系統測試，5) 自動化測試框架選擇，6) 測試資料管理與維護，7) 測試結果分析與改進建議。請提供具體的測試程式碼範例。' },
      { name: '🔧 程式碼品質改進', text: '請協助我改進這段程式碼的品質：[貼上程式碼]。請分析：1) 程式碼可讀性與結構問題，2) 命名規範與註解完整性，3) 函式設計與職責分離，4) 效能優化與資源使用，5) 錯誤處理與異常管理，6) 安全性考量與最佳實務，7) 重構後的改進版本與說明。請提供具體可執行的改進建議。' },
      { name: '📊 系統架構設計', text: '請為[系統或應用]設計整體架構：1) 系統需求分析與功能模組劃分，2) 技術架構選擇與組件設計，3) 資料流與互動模式設計，4) 安全性與效能考量，5) 可擴展性與維護性設計，6) 部署與監控策略，7) 技術文件與開發指引。請提供架構圖與實作路徑。' },
      { name: '🎨 互動式應用開發', text: '我要開發一個[應用類型]的互動式應用。請協助設計：1) 使用者介面與使用者體驗設計，2) 互動功能與動畫效果，3) 資料視覺化與圖表展示，4) 響應式設計與裝置適配，5) 效能優化與資源管理，6) 無障礙設計考量，7) 測試與部署策略。請提供技術選型與實作步驟。' },
      { name: '🔍 問題診斷與解決', text: '我遇到了[問題描述或錯誤訊息]。請協助我：1) 分析可能的原因與影響範圍，2) 提供系統性的診斷步驟，3) 建議需要收集的資訊與日誌，4) 提供可能的解決方案與步驟，5) 設計驗證解決方案的測試，6) 建立預防機制避免再發，7) 整理經驗教訓與知識分享。' },
      { name: '📚 技術學習計畫', text: '我想學習[技術或框架]。請為我設計學習計畫：1) 學習目標設定與成果預期，2) 先備知識評估與補強建議，3) 分階段學習路徑與里程碑，4) 實作練習與專案作品，5) 學習資源與參考材料，6) 學習成效評估與調整，7) 社群參與與經驗分享。請提供具體的時程安排與學習技巧。' },
      { name: '🔒 安全性評估與防護', text: '請為[系統或應用]進行安全性評估：1) 常見安全威脅識別與風險評估，2) 身份驗證與權限控制機制，3) 資料保護與加密策略，4) 輸入驗證與注入攻擊防護，5) 網路安全與通訊加密，6) 日誌記錄與安全監控，7) 事件回應與復原計畫。請提供具體的安全檢核清單。' },
      { name: '🚀 效能優化策略', text: '我的[應用類型]存在效能問題。請協助優化：1) 效能瓶頸識別與分析方法，2) 程式碼層面的優化策略，3) 資料庫查詢與索引優化，4) 快取策略與資料管理，5) 網路請求與資源加載優化，6) 系統架構與部署優化，7) 效能監控與持續改進。請提供具體的優化方案與測量指標。' },
      { name: '📱 現代應用開發', text: '我要開發一個現代化的[應用類型]。請提供：1) 技術栈選擇與架構設計，2) 開發環境與工具配置，3) 用戶介面與使用者體驗設計，4) 後端 API 與資料庫設計，5) 測試策略與品質保證，6) CI/CD 與部署自動化，7) 監控、日誌與維護策略。請提供完整的開發指引。' }
    ],
    '學習與研究指令（搭配「學習與研究」功能）': [
      { name: '🗺️ 知識結構圖', text: '請協助我為[主題]建立系統性的知識結構圖：1) 識別核心概念與其層級關係，2) 建立概念間的邏輯連結（因果、對比、依賴），3) 整合具體例證與應用情境，4) 標記常見誤解與混淆點，5) 設計學習路徑與延伸方向，6) 提供自我檢測問題與反思提示，7) 總結知識體系的核心洞見與實用價值。' },
      { name: '📊 案例深度分析', text: '請對[案例A]與[案例B]進行深度比較分析：1) 背景脈絡與關鍵利害關係人分析，2) 策略選擇與實施路徑比較，3) 成果評估與效益分析，4) 成功要素與失敗原因探討，5) 經驗教訓與可移轉的最佳實務，6) 未來應用與改進建議，7) 綜合結論與行動指引。請提供具體可操作的分析框架。' },
      { name: '🔍 研究策略設計', text: '我要深入研究[議題]。請設計系統性的研究策略：1) 核心研究問題與子問題分解，2) 多層次關鍵詞策略與搜尋組合，3) 資料來源評估與篩選標準，4) 研究方法選擇與組合應用，5) 資訊整理與分析框架，6) 品質控制與信度評估，7) 研究成果呈現與應用計畫。' },
      { name: '📚 精讀學習指引', text: '我要精讀[文獻或材料]。請提供系統性的學習指引：1) 閱讀前的目標設定與背景知識激活，2) 閱讀中的理解策略與筆記技巧，3) 批判性思考問題與分析框架，4) 知識連結與概念統整方法，5) 實際應用與案例分析，6) 學習成效評估與反思機制，7) 後續學習計畫與資源建議。' },
      { name: '🔄 知識應用轉化', text: '請協助我將[學習內容]應用到[新情境或問題]：1) 核心原理與概念的提取與整理，2) 新情境的特點分析與需求識別，3) 知識轉化的適用性評估，4) 應用策略與實施步驟設計，5) 潛在風險與限制識別，6) 成效評估與調整機制，7) 經驗總結與最佳實務建立。' },
      { name: '📊 學習成效評估', text: '請協助我分析學習成效與進步情況：[提供學習資料或表現數據]。請進行：1) 學習軌跡與進步趨勢分析，2) 強項能力與待改進領域識別，3) 學習障礙與困難點診斷，4) 個人化學習建議與策略，5) 學習目標設定與調整，6) 學習資源與工具推薦，7) 持續改進計畫與動機維持。' },
      { name: '💬 學術討論促進', text: '我要主持[主題]的學術討論。請提供促進策略：1) 討論環境設定與參與規範，2) 層次化提問設計與引導技巧，3) 多元觀點激發與整合方法，4) 批判性思考與深度對話促進，5) 衝突處理與共識建立，6) 討論成果總結與後續行動，7) 參與者反思與學習成效評估。' },
      { name: '📚 文獻研究方法', text: '我要進行[研究主題]的文獻研究。請指導：1) 研究問題設定與範圍界定，2) 文獻搜尋策略與資料庫選擇，3) 文獻篩選標準與品質評估，4) 文獻分析與主題組織方法，5) 批判性評估與理論整合，6) 研究空白識別與未來方向，7) 研究成果呈現與學術貢獻。' },
      { name: '🧠 批判思考應用', text: '請教我運用批判思考分析[議題或現象]：1) 問題定義與背景脈絡分析，2) 多元觀點識別與立場檢視，3) 論證結構與邏輯分析，4) 證據品質評估與來源查證，5) 假設與偏見識別，6) 結論合理性與替代解釋，7) 實際應用與影響評估。請提供具體的思考工具與分析步驟。' },
      { name: '🔍 研究方法選擇', text: '我要研究[研究問題]。請比較不同研究方法的適用性：1) 量化與質化研究的優勣與適用情境，2) 實驗設計與觀察研究的比較分析，3) 橫斷與縱斷研究的選擇考量，4) 案例研究與大樣本調查的比較，5) 資料收集方法與工具選擇，6) 樣本大小與抽樣策略，7) 研究倫理與限制考量。請提供具體的方法選擇建議與實施步驟。' }
    ],
    '資料彙整指令（搭配「網路搜尋」功能）': [
      { name: '📋 資訊來源評估', text: '請協助我針對[議題]建立可靠的資訊來源清單：1) 官方機構、學術研究、產業報告、媒體報導的分類與特點，2) 各類來源的優勢、局限性與可能偏見，3) 資訊可信度評估標準與查證方法，4) 資料更新頻率與時效性考量，5) 資訊取得的法律與倫理考量，6) 建立資訊品質監控機制，7) 推薦的資訊管理工具與方法。' },
      { name: '📁 多元資料綜合', text: '我收集了關於[主題]的多種資料：[列出資料來源]。請協助綜合分析：1) 資訊一致性與共同趨勢識別，2) 矛盾或爭議性觀點整理，3) 資訊空白與需進一步查證的內容，4) 資料品質與可信度評估，5) 初步結論與關鍵發現，6) 後續資料收集建議，7) 資訊應用與決策建議。' },
      { name: '📅 時序事件分析', text: '請為[主題]建立詳細的時序分析：1) 關鍵事件的時間點、地點與背景，2) 主要參與者與利害關係人分析，3) 事件間的因果關係與影響鏈，4) 轉折點與關鍵決策時刻，5) 事件發展的趨勢與模式，6) 可靠資料來源與證據連結，7) 未來發展預測與關注點。' },
      { name: '📊 政策效果比較', text: '請深入比較[政策A]與[政策B]的效果：1) 政策目標、範圍與實施時程，2) 實施機制、資源配置與管理架構，3) 成效評估指標與實際數據表現，4) 利害關係人影響與回饋分析，5) 成本效益與社會影響評估，6) 實施障礙與改進建議，7) 政策可持續性與未來發展方向。' },
      { name: '❓ 知識庫建立', text: '針對[議題]建立完整的知識庫與FAQ：1) 高頻問題識別與分類整理，2) 清晰準確的答案與資料來源標註，3) 相關資源連結與延伸閱讀，4) 定期更新機制與維護策略，5) 使用者反饋收集與改進，6) 搜尋功能與分類索引設計，7) 知識庫品質與實用性評估。' },
      { name: '📰 媒體論述分析', text: '請分析媒體對[事件或議題]的報導論述：1) 主要媒體平台與報導時間統計，2) 報導語調、用詞選擇與情感傾向，3) 論述框架與隱含假設分析，4) 不同立場與觀點的呈現比例，5) 事實查證與資訊源頭追蹤，6) 公眾討論與社群反應分析，7) 媒體影響力與論述形成效果評估。' },
      { name: '🔎 研究方向規劃', text: '根據現有資料分析，請提出未來研究方向：1) 識別關鍵研究空白與未解問題，2) 評估研究問題的重要性與緊迫性，3) 分析研究可行性與資源需求，4) 建議研究方法與合作夥伴，5) 預期研究成果與應用價值，6) 研究時程與里程碑設定，7) 研究影響與社會貢獻評估。' },
      { name: '📊 資料視覺化策略', text: '我有[資料類型與特徵]需要視覺化呈現。請提供：1) 目標受眾分析與溝通目的設定，2) 最適合的圖表類型與視覺化方式，3) 資料清理、轉換與前處理步驟，4) 視覺設計原則與美學考量，5) 互動性與使用者體驗設計，6) 無障礙與多平台適配考量，7) 工具選擇與實作指引。' },
      { name: '🔍 事實查證系統', text: '請協助建立[資訊或聲稱]的系統性查證流程：1) 資訊來源可信度與權威性評估，2) 聲稱內容拆解與關鍵要素識別，3) 獨立證據搜尋與交叉比對，4) 專家意見與權威機構查證，5) 時間軸與背景脈絡檢視，6) 偏見與利益衝突識別，7) 查證結果綜合與不確定性評估。' },
      { name: '📝 報告編寫指引', text: '我要撰寫[主題]的綜合報告。請提供：1) 報告結構與章節安排建議，2) 執行摘要與核心訊息提取，3) 資料分析與視覺化呈現策略，4) 結論與建議的邏輯組織，5) 參考資料與附錄整理方式，6) 報告品質與可讀性提升，7) 交付前的完整性檢核清單。' }
    ],
    '教育行政與溝通': [
      { name: '📧 策略性家長溝通', text: '請協助我撰寫一封關於[事件/政策]的家長溝通信件，運用教育溝通最佳實務。內容架構：1) 開場致意與感謝家長夥伴關係，2) 清楚說明事件背景與學校立場（基於教育專業與學生最佳利益），3) 具體行動方案與時程（包含短中長期措施），4) 家長可採取的支持行動與資源連結，5) 雙向溝通管道與意見回饋機制，6) 後續追蹤與更新承諾。請特別注意：語調溫暖專業、資訊透明完整、避免教育術語、提供具體可行的建議，並展現學校對學生福祉的承諾。' },
      { name: '📅 高效會議設計', text: '請為[會議名稱]設計一個結果導向的會議架構，運用現代會議管理原則。包含：1) 會議目標與成功指標設定（SMART原則），2) 參與者角色分析與前置準備任務，3) 議程時間配置與討論方法（腦力激盪、世界咖啡館、魚骨圖等），4) 決策流程與共識建立機制，5) 會議紀錄與行動方案追蹤系統，6) 會議效能評估與改進機制，7) 數位工具運用與混合式會議考量。請特別強調如何促進有效參與、避免會議冗長、確保決議落實。' },
      { name: '📢 多元公告策略', text: '請為[活動/政策]設計全方位公告傳播策略，確保訊息有效觸達目標受眾。策略包含：1) 受眾分析與訊息客製化（學生、家長、教師、社區），2) 多管道傳播規劃（官網、社群媒體、紙本通知、簡訊、電子報），3) 視覺設計與資訊層次安排，4) 關鍵訊息提煉與記憶點設計，5) 互動元素與回饋機制，6) 無障礙傳播與多語言考量，7) 成效追蹤與調整機制。請提供具體的文案範例、視覺建議，並考量不同世代的資訊接收習慣。' },
      { name: '🤝 策略聯盟提案', text: '請協助我向[合作單位]提出[合作項目]的策略聯盟提案，展現雙贏價值與專業規劃。提案結構：1) 合作願景與教育使命連結，2) 現況分析與合作機會識別（SWOT分析），3) 合作模式與分工架構設計，4) 資源整合與效益最大化策略，5) 風險評估與應對機制，6) 成效評估指標與里程碑設定，7) 永續發展與擴展可能性。請特別強調：創新教育價值、學生受益程度、社會影響力、可複製性，並提供具體的執行時程與預算規劃。' },
      { name: '🆘 危機溝通管理', text: '針對[危機情境]，請設計完整的危機溝通應對策略，展現教育領導專業與責任。應對架構：1) 危機評估與影響範圍分析，2) 核心訊息建構與事實查證，3) 利害關係人優先順序與客製化溝通，4) 媒體應對策略與發言人培訓，5) 內部溝通與團隊動員機制，6) 社群媒體監控與輿情管理，7) 復原計畫與信任重建策略。請提供：危機溝通時程表、關鍵訊息範本、常見問題Q&A、媒體訪談要點，並強調透明誠實、承擔責任、以學生為中心的溝通原則。' },
      { name: '🏠 教學團隊協作', text: '請協助我撰寫給教學團隊的專業協作訊息，促進有效的教育夥伴關係。訊息內容：1) 教學現況與學生學習數據分析，2) 成功教學實踐分享與亮點表揚，3) 挑戰識別與協作解決方案，4) 專業發展機會與資源提供，5) 跨領域合作與創新教學鼓勵，6) 家長溝通與社區連結支持，7) 下階段目標與團隊承諾。請特別注重：專業尊重、團隊凝聚、成長導向、學生中心，並提供具體的協作工具與平台建議。' },
      { name: '📜 政策轉譯溝通', text: '請將[政策內容]轉譯為清晰易懂的溝通文件，確保政策精神正確傳達。轉譯架構：1) 政策背景與目的說明（為什麼需要這個政策），2) 核心內容與關鍵變化解析，3) 對不同角色的具體影響與因應方式，4) 實施時程與階段性目標，5) 支持資源與協助管道，6) 常見疑慮與解答，7) 回饋機制與政策調整可能性。請使用：生活化語言、具體案例、視覺化圖表、分層資訊設計，避免官方術語，並提供不同版本（詳細版、摘要版、圖解版）以滿足不同需求。' },
      { name: '📊 數據驅動成果報告', text: '請協助我撰寫[時期]的教育成果報告，運用數據說故事的方式展現教育價值。報告架構：1) 執行摘要與關鍵成果亮點，2) 學生學習成效分析（量化與質化並重），3) 教學創新與專業發展成果，4) 家長滿意度與社區參與深度分析，5) 資源效益與永續發展指標，6) 挑戰因應與問題解決案例，7) 未來願景與策略規劃。請特別注重：數據視覺化呈現、成功故事敘述、問題誠實面對、改進方案具體、利害關係人價值體現，並提供不同受眾版本（董事會、家長、教師、學生）。' },
      { name: '📝 創新提案撰寫', text: '請協助我向[主管機關/董事會]撰寫[教育創新計畫]提案，展現前瞻思維與執行能力。提案架構：1) 教育趨勢分析與創新必要性論述，2) 計畫願景與預期教育影響，3) 創新策略與實施方法設計，4) 資源需求與投資報酬率分析，5) 風險管控與品質保證機制，6) 成效評估與持續改進計畫，7) 擴散推廣與永續發展策略。請強調：教育創新價值、學生能力提升、教師專業成長、社會影響力、國際競爭力，並提供詳細的執行時程、預算分配、人力配置、成功指標。' },
      { name: '🤝 多元利害關係人溝通', text: '請為[教育議題/政策]設計全方位的利害關係人溝通策略，建立教育共識與支持網絡。策略包含：1) 利害關係人地圖繪製與影響力分析，2) 差異化溝通策略與客製化訊息設計，3) 多元溝通管道整合與時機規劃，4) 雙向對話機制與意見整合流程，5) 衝突調解與共識建立技巧，6) 危機預防與負面輿情管理，7) 長期關係維護與信任建立。請提供：溝通時程表、訊息框架範本、對話引導技巧、衝突處理SOP、成效評估指標，並特別注重文化敏感度、世代差異、數位落差等因素。' },
      { name: '📋 教育品質管理', text: '請協助我建立[學校/機構]的教育品質管理系統，確保教育服務持續改進。系統包含：1) 教育品質指標建立與基準設定，2) 多元評估機制與數據收集系統，3) 持續改進循環與問題解決流程，4) 利害關係人回饋整合與應用，5) 教師專業發展與品質提升支持，6) 學生學習成效監控與輔導機制，7) 外部評鑑準備與自我評估能力。請特別強調：全面品質管理理念、數據驅動決策、持續改進文化、團隊參與機制，並提供具體的品質管理工具、檢核表單、改進計畫範本。' },
      { name: '🌐 數位轉型溝通', text: '請為學校數位轉型計畫設計溝通策略，協助全校社群適應教育科技變革。溝通策略：1) 數位轉型願景與教育價值連結，2) 變革管理與抗拒心理因應，3) 分階段推動與成功案例分享，4) 數位素養培訓與支持系統，5) 家長與社區的數位教育溝通，6) 資訊安全與隱私保護說明，7) 成效展示與持續優化機制。請提供：變革溝通時程、培訓計畫建議、常見問題解答、成功指標設定，並特別注重不同世代的接受度、數位落差問題、教育本質的堅持。' }
    ],
    '評量與反思支援': [
      { name: '📝 評分規準優化', text: '以下是現有評分規準：[貼上規準]。請協助：1) 核對評量目標、構面與描述是否對應，2) 為各層級改寫具體可觀察行為與證據，3) 調整語言的精準度與一致性（避免模糊詞），4) 建議量化或質性指標的紀錄方式，5) 提供教師共備與學生自評的使用說明，6) 舉例不同表現層級的回饋語句。' },
      { name: '💬 回饋語句生成', text: '請為[作品/任務名稱]建立回饋語句庫。請依三類整理：1) 優勢亮點肯定（行為證據＋正向語氣），2) 可改進建議（指出落差＋具體改善策略＋提問），3) 下一步行動（資源建議、練習方向、時間節點）。請提供口頭、書面、數位訊息三種語氣版本，並附上同儕互評與自我評量可用的簡短語句。' },
      { name: '📚 學習歷程摘要', text: '請協助彙整學生[姓名或代碼]的學習歷程，字數不超過200字。摘要需包含：1) 學習目標達成概況與量化證據，2) 突出的作品或表現亮點及對應素養，3) 成長歷程與努力策略（含導師觀察或學生自述），4) 待提升重點與具體建議，5) 下階段行動指引與所需資源。' },
      { name: '📊 測驗後診斷', text: '學生在[主題]測驗的統計資料如下：[數據]。請進行：1) 重要概念達成率與錯誤類型分析，2) 學生分層（高、中、低成就）與共通迷思診斷，3) 優先補救概念排序與關鍵迷思澄清，4) 建議的補救教學活動（小組、個別、線上資源），5) 後測或快速檢核設計，6) 與家長/導師溝通重點，7) 後續進度追蹤指標。' },
      { name: '🤝 同儕互評流程', text: '請為[任務/作品]設計可靠的同儕互評流程。需包含：1) 評量指引與示例作品，2) 評分規準或檢核表（含可觀察行為），3) 尊重與建設性回饋守則，4) 評前練習與教師示範，5) 實施流程（配對方式、時間安排、紀錄工具），6) 教師監控與介入時機，7) 評後反思與調整機制（自我評估、修訂任務）。' },
      { name: '🤔 課後反思題目', text: '請提供五題課後反思問題，協助學生回顧[主題]的策略與情緒。題目需涵蓋：1) 認知層面（我理解了什麼、還有哪些困惑）、2) 策略層面（我使用了哪些方法、效果如何）、3) 情意層面（我在學習過程中的情緒與動機）、4) 合作層面（我對團隊的貢獻與互動）、5) 前瞻層面（我下次要如何調整）。請附上簡短回覆引導語與延伸任務建議。' },
      { name: '🏆 表現等級說明', text: '我要為[任務]撰寫四段表現等級描述（卓越、熟練、基礎、待加強）。請為每一級提供：1) 可觀察行為與作品特徵，2) 語言、策略或態度指標，3) 常見錯誤與改善提醒，4) 推薦回饋語句。若適用，請加入與素養指標或檢核點的連結。' },
      { name: '📊 學習成效分析', text: '請協助我分析[班級或學生]在[主題]的學習成效。包含：1) 學習成果數據視覺化分析，2) 學習目標達成率評估，3) 學習困難點與錯誤類型識別，4) 個別學生進步軌跡追蹤，5) 教學策略效果評估，6) 學習動機與參與度分析，7) 改進建議與後續追蹤計劃。請提供具體的數據解讀與行動方案。' },
      { name: '🎨 多元評量設計', text: '請為[學習主題]設計多元評量方案。包含：1) 傳統筆試與實作評量結合，2) 口語報告與簡報展示，3) 小組協作與同儲互評，4) 學習歷程檔案與作品集，5) 數位工具與線上評量，6) 自我評量與反思日誌，7) 真實情境表現任務。請特別說明各種評量方式的權重分配與結合策略。' },
      { name: '🔄 持續改進循環', text: '請協助我建立[教學或評量]的持續改進循環。包含：1) 現況評估與基線資料建立，2) 改進目標設定與指標定義，3) 行動計劃與實施策略，4) 成效監控與數據收集，5) 結果分析與回饋整合，6) 調整方案與再實施，7) 經驗總結與知識分享。請提供具體的時程安排與檢核機制。' }
    ],
    '華語文教學': [
      { name: '📘 任務導向教案設計', text: '請為[CEFR等級]華語學習者設計[主題]任務導向教案，完整體現TBLT理念。教案結構：1) 真實任務情境與學習目標設定，2) 前置任務（Pre-task）：背景知識建構、詞彙語法預習、文化脈絡探討，3) 任務循環（Task Cycle）：主要任務、規劃階段、報告與分享機制，4) 語言聚焦（Language Focus）：語言分析、精練練習、重複輸出，5) 後續任務（Post-task）：真實應用、延伸活動、反思評量。請強調教師鷹架與學生自主學習策略。' },
      { name: '📖 整合技能學習單', text: '請為[CEFR等級]學習者設計[主題]整合技能學習單，融合聽說讀寫。內容請包含：1) 情境導入（真實語料、文化背景、任務說明），2) 詞彙建構（高頻詞彙、搭配用法、語境運用），3) 語法聚焦（功能分析、產出練習、正確性檢核），4) 聽力任務（策略訓練、記錄工具、理解檢核），5) 口語表達（角色扮演、資訊差距活動、回饋機制），6) 閱讀理解（文本分析、批判思考問題、跨文本連結），7) 寫作產出（過程寫作、同儕互評、修訂指引）。請確保活動真實、有挑戰且可累積語料庫。' },
      { name: '🗣️ 溝通任務活動設計', text: '請為[學習者程度]設計三個[主題]溝通任務。每個任務需包含：1) 真實溝通情境與需求、明確成果，2) 資訊差距與合作機制設計，3) 任務流程（前置建構→任務執行→成果分享），4) 語言支持（常用語塊、語用提醒、策略語句），5) 教師觀察與即時回饋行動，6) 成果評量與同儕回饋表，7) 延伸自學或數位延伸活動。請說明如何以任務完成驅動語言輸入與輸出。' },
      { name: '🧾 真實性評量設計', text: '請為[ACTFL等級]學習者設計評量[技能]的真實性任務。評量設計需包含：1) 模擬生活/學術/職場情境與任務說明，2) 效能標準與評量規準（流暢度、準確度、適切性、策略運用），3) 評量工具（口語面試流程、作業說明、檢核表、錄製指引），4) 資料蒐集與紀錄方式（作品集、錄音、拍攝），5) 回饋路徑（即時口頭、書面Rubric、同儕互評、自評表），6) 再學習建議與補救策略，7) 與課程成果或證照銜接方式。' },
      { name: '🎎 文化融入教材編寫', text: '請根據[TOCFL等級]標準編寫[主題]文化融入教材。內容需包含：1) 真實語料選用（新聞、社群平台、生活對話）並提供語料分析，2) 詞彙語法分級與語用說明，3) 文化知識與價值觀解析，4) 跨文化比較活動（母文化 vs. 華語文化），5) 高思辨提問與討論設計，6) 線上/線下延伸資源（影音、網站、書籍），7) 學習者產出任務與評量方式。請兼顧語言習得與跨文化能力。' },
      { name: '🗨️ 情境對話建構', text: '請為[程度]學習者設計[情境]對話練習，強調語用與溝通策略。包含：1) 情境背景、角色設定與交際目的，2) 溝通功能與語用規範（請求、建議、抱怨、道歉等），3) 關鍵句型、詞彙與語氣詞庫，4) 語用策略教學（直接/間接、禮貌策略、非語言訊號），5) 任務化角色扮演流程（準備→演練→錄影→分析），6) 延伸練習（情境變奏、角色互換、創意改編），7) 自評/同儕評量表與文化敏感度提醒。' },
      { name: '🎨 漢字教學設計', text: '請為[等級]華語學習者設計[漢字數量]個漢字的教學方案。包含：1) 漢字筆畫與結構分析，2) 部首與偏旁教學，3) 字義與詞彙擴展，4) 書寫練習與筆順指導，5) 記憶策略與聯想技巧，6) 文化內涵與故事背景，7) 數位工具與互動遊戲。請特別說明如何結合傳統書法與現代教學技術。' },
      { name: '🎭 文化體驗活動', text: '請為[等級]華語學習者設計[文化主題]體驗活動。包含：1) 文化知識導入與背景介紹，2) 實作體驗與動手操作（書法、紙切、太極、茶藝等），3) 語言與文化的結合學習，4) 跨文化比較與對話，5) 文化產品創作與分享，6) 反思討論與經驗交流，7) 延伸學習與生活應用。請特別說明如何透過文化體驗提升語言學習動機與文化理解。' },
      { name: '📱 數位華語教學', text: '請為[等級]華語學習者設計數位化教學方案。包含：1) 數位平台與工具選擇（APP、網站、VR/AR），2) 互動式學習活動設計，3) 個人化學習路徑與適性教學，4) 線上線下混合式教學模式，5) 數位作品集與學習歷程，6) AI輔助學習與智能回饋，7) 數位素養與網路安全教育。請特別說明如何在數位環境中保持人文關懷與文化傳承。' },
      { name: '🌍 國際中文教育', text: '請為國際學校[年級]設計中文教育課程。包含：1) 課程目標與核心素養設定，2) 跨文化教學與多元觀點融入，3) 中華文化與世界文化對話，4) 語言技能與文化素養並重，5) 專案學習與實際應用，6) 多媒體資源與科技整合，7) 評量與認證機制。請特別說明如何培養學生成為具有中華文化素養的世界公民。' }
    ],
    '自定義提示詞': []
  },
  en: {
    'Teaching & Instruction': [
      { name: '📊 Competency-Based Curriculum Design', text: 'Help me create a comprehensive annual curriculum blueprint for [grade, subject] using competency-based education principles. Please structure this as follows: 1) Identify core competencies and 21st-century skills alignment, 2) Design cross-curricular thematic units with real-world connections, 3) Map monthly learning progressions with authentic performance tasks, 4) Develop multi-modal assessment systems including learning portfolios, 5) Integrate global issues and social justice themes, 6) Plan for differentiated instruction and inclusive practices. Please emphasize how inquiry-based learning and project-based approaches will develop students\' critical thinking, creativity, collaboration, and communication skills.' },
      { name: '🎯 UbD Unit Planning', text: 'Design a [number]-week unit on [topic] using Understanding by Design (UbD) framework with competency-based approaches. Structure: 1) Stage 1 - Desired Results: Essential questions, enduring understandings, core competencies, and transfer goals, 2) Stage 2 - Assessment Evidence: Authentic performance tasks, evaluation criteria, and self-assessment tools, 3) Stage 3 - Learning Plan: Inquiry-driven experiences, scaffolding strategies, and differentiation approaches. Please emphasize how to develop higher-order thinking skills (analysis, evaluation, creation) and provide specific strategies for supporting diverse learners throughout the unit.' },
      { name: '🌱 Competency-Based Lesson Openings', text: 'Create three distinct opening strategies for teaching [topic] to [grade] students that embody competency-based principles. Each opening should: 1) Connect to students\' lived experiences and cultural backgrounds, 2) Present authentic problems or essential questions, 3) Activate prior knowledge and preview success criteria, 4) Incorporate collaborative elements and student voice, 5) Set up inquiry-based exploration. Please explain the pedagogical reasoning behind each approach, potential challenges, and how to adapt for different learning styles and cultural contexts.' },
      { name: '🔬 Inquiry-Based Learning Activities', text: 'Design a [duration]-minute inquiry-based learning activity for [course topic] that promotes understanding and skill development. Include: 1) Real-world problem or driving question setup, 2) Investigation process design (observe → question → test → analyze → conclude), 3) Collaborative learning structures and roles, 4) Simple tools and resource integration, 5) Safety protocols and guidelines, 6) Reflection questions connecting learning to real life. Please explain how this activity develops observation skills, critical thinking, and problem-solving abilities.' },
      { name: '🌈 Universal Design for Learning', text: 'Create three-tiered differentiated learning experiences for [topic] using Universal Design for Learning (UDL) principles. For each tier: 1) Clear competency targets and success criteria, 2) Multiple means of representation (visual, auditory, tactile), 3) Multiple means of engagement (choice, relevance, challenge), 4) Multiple means of expression (oral, written, creative, digital), 5) Scaffolding supports and extension opportunities, 6) Peer collaboration and feedback systems. Please provide specific assessment strategies and ensure all students can demonstrate mastery while honoring diverse strengths and learning preferences.' },
      { name: '📝 Assessment for Learning System', text: 'Develop a comprehensive formative assessment system for [topic] that promotes learning rather than just measuring it. Include: 1) Clear learning targets and student-friendly success criteria, 2) Multiple assessment methods (observations, conversations, products), 3) Real-time feedback strategies and student self-assessment tools, 4) Data collection systems for instructional adjustments, 5) Student reflection and goal-setting processes, 6) Digital portfolio integration. Please explain how this system empowers students as partners in their learning journey and supports teacher decision-making.' },
      { name: '🧠 Socratic Questioning Framework', text: 'Design a progressive questioning sequence for [topic] to develop critical thinking. Create questions across six categories: 1) Clarification (What do you mean by...?), 2) Assumptions (What assumptions are we making?), 3) Evidence (What evidence supports this?), 4) Perspectives (How might others view this?), 5) Implications (What are the consequences?), 6) Meta-questions (Why is this question important?). For each question, provide: expected student responses, follow-up questions, thinking supports, and connections to real-world examples.' },
      { name: '👥 Learning Community Building', text: 'Craft a post-lesson communication for students that builds learning community and promotes reflection on today\'s [topic] exploration. Include: 1) Celebration of learning achievements and growth mindset reinforcement, 2) Connection to big ideas and essential questions, 3) Reflection prompts for deeper thinking, 4) Extension resources and optional challenges, 5) Preview of upcoming learning adventures, 6) Encouragement for peer collaboration and support. Keep it within 250 words, maintaining an inspiring tone that positions students as capable scholars and collaborative learners.' },
      { name: '📊 Digital Learning Design', text: 'Design a comprehensive digital learning solution for [topic] that integrates modern technology with pedagogical best practices. Include: 1) Digital tool selection aligned with learning objectives, 2) Interactive learning activities (VR/AR, gamification, online collaboration), 3) Digital literacy and information security education, 4) Personalized learning pathways and adaptive instruction, 5) Digital portfolios and learning analytics, 6) Blended learning models and flexible delivery. Please explain how to develop students\' digital citizenship skills and critical thinking in digital environments.' },
      { name: '🌱 Interdisciplinary Integration', text: 'Create an interdisciplinary unit for [grade] on [theme] that embodies competency-based learning principles. Structure: 1) Core competencies integration across at least three subject areas, 2) Authentic problem-based scenarios and inquiry tasks, 3) Collaborative learning and project-based implementation, 4) Multiple assessment modes and showcase opportunities, 5) Community connections and real-world applications, 6) Reflection and extension learning activities. Please emphasize how interdisciplinary learning develops systems thinking and comprehensive problem-solving abilities.' }
    ],
    'Student Learning': [
      { name: '🎯 Learning Plan Optimization', text: 'I\'m preparing for [exam or goal] with [number] weeks available. Please design a mastery-oriented learning plan that: 1) Audits current strengths and gaps using recent evidence, 2) Maps weekly learning sprints with SMART targets and competency indicators, 3) Balances retrieval practice, deliberate practice, and spaced review, 4) Builds in rest, wellbeing, and buffer days, 5) Specifies daily focus routines (warm-up, core work, debrief), 6) Includes reflection checkpoints with guiding questions and data to track, 7) Provides contingency plans if milestones are missed. Explain the reasoning behind the pacing and study strategies chosen.' },
      { name: '🧠 Topic Note Framework', text: 'Create an expert note-taking framework for [subject or topic] that supports deep understanding. The template should include: 1) Concept map or hierarchy linking big ideas, sub-concepts, and prerequisite knowledge, 2) Dual-column synthesis (core idea vs. explanation/examples), 3) Formula/algorithm panels with step-by-step annotations, 4) Misconceptions watch-list and contrasting cases, 5) Quick-reference memory cues (mnemonics, visuals, stories), 6) Self-check questions escalating from recall to transfer, 7) Space for personal reflections and cross-topic connections. Provide formatting tips for both digital and analog use.' },
      { name: '🎤 Speaking Practice Script', text: 'Help me craft a [minutes]-minute presentation in [language] on [topic]. Deliver: 1) A three-act outline (hook → evidence → impact) tied to clear key messages, 2) Segment-by-segment talking points with rhetorical devices, stories, or data, 3) Pronunciation and intonation cues (stress marks, pacing notes), 4) Audience engagement prompts (questions, polls, interactive moments), 5) Visual support suggestions (slide titles, diagrams, media), 6) Transition sentences and recovery strategies for potential disruptions, 7) Rehearsal plan with timing checkpoints and feedback focus areas.' },
      { name: '📝 Reflection Journal Framework', text: 'Design a powerful reflection journal for [learning activity] that fosters metacognition and transfer. Structure each entry as: 1) Evidence Snapshot – concrete facts, artifacts, or data from the session, 2) Emotion Scan – feelings, triggers, regulation strategies, 3) Learning Moves – strategies attempted, what worked/failed, why, 4) Insight Mining – new understandings, questions, connections to prior knowledge, 5) Next Experiment – specific adjustments, resources needed, timeline, 6) Impact on Others – contribution to peers, collaboration notes, 7) Meta-Reflection – how today reshapes long-term goals. Include optional prompts for creative expression (sketches, hashtags, voice notes).' },
      { name: '✅ Pre-exam Key Questions', text: 'Generate ten self-check questions for [subject topic] spanning SOLO taxonomy levels: 1) Foundational recall, 2) Comprehension and explanation, 3) Procedural application, 4) Analysis and comparison, 5) Evaluation or justification, 6) Creation or transfer scenario. For each question provide: answer expectations, common pitfalls, and suggested follow-up practice if answered incorrectly.' },
      { name: '🤝 Collaborative Task Division', text: 'We are a team of three working on [project]. Please propose a collaboration blueprint: 1) Role assignments based on strengths and growth goals, 2) Deliverable map with interim checkpoints and shared templates, 3) Communication cadence (stand-ups, retros, decision logs), 4) Quality assurance process (peer review protocols, rubrics), 5) Conflict resolution steps and escalation pathways, 6) Documentation and knowledge management plan, 7) Celebration and reflection ritual after milestones. Keep guidance empowerment-focused and culturally responsive.' },
      { name: '💪 Learning Bottleneck Diagnosis', text: 'I\'m struggling with [skill]; current situation: [description]. Please facilitate a root-cause investigation and recovery roadmap: 1) Analyze prerequisite knowledge, cognitive load, mindset, and environmental factors, 2) Pinpoint specific error patterns or misconceptions using examples, 3) Recommend targeted micro-skills practice with scaffolds, 4) Suggest resource toolkit (videos, tutors, communities) and criteria for selection, 5) Design a progression of practice (I do→We do→You do) with mastery checks, 6) Integrate reflection prompts linking learning to authentic contexts, 7) Plan motivation strategies and celebration checkpoints.' },
      { name: '📊 Multi-source Data Organization', text: 'I collected three sources about [topic]: [source A], [source B], [source C]. Please synthesize them by: 1) Evaluating credibility (author, evidence, currency, bias), 2) Building a comparative matrix of claims, data, and perspectives, 3) Highlighting convergence, divergence, and unresolved questions, 4) Mapping causal relationships or timelines, 5) Suggesting additional sources or experts to consult, 6) Proposing potential thesis statements or inquiry directions, 7) Recommending how to communicate findings to different audiences (executive summary vs. detailed brief).' },
      { name: '🎨 Creative Thinking Training', text: 'I want to enhance my creative thinking skills in [domain]. Please design a creative training program: 1) Divergent thinking exercises (brainstorming, mind mapping, six thinking hats), 2) Convergent thinking techniques (concept integration, prioritization, feasibility assessment), 3) Creative problem-solving processes (problem reframing, multiple solutions, innovative experiments), 4) Cross-domain inspiration (analogical thinking, metaphorical associations, boundary crossing), 5) Creative output and sharing, 6) Creative mindset habit formation, 7) Creative evaluation and improvement mechanisms. Please provide specific practice activities and self-assessment tools.' },
      { name: '⏰ Time Management Optimization', text: 'I need to improve my learning time management. Current situation: [describe current state]. Please help me: 1) Analyze time usage patterns and diagnose problems, 2) Establish personalized time management systems (Pomodoro Technique, time blocking, priority matrix), 3) Break down learning tasks and schedule planning, 4) Focus enhancement and distraction elimination strategies, 5) Rest and recovery time arrangement, 6) Efficiency tools and digital assistants utilization, 7) Time management habit formation and continuous improvement. Please explain how to balance learning efficiency with physical and mental health.' }
    ],
    'Research & Study Instructions (with "Deep Research" feature)': [
      { name: '🔍 Research Question Refinement', text: 'I want to explore [issue]. Please coach me through: 1) Context scan and stakeholder impact analysis, 2) Breakdown of broad topic into sub-questions and theoretical lenses, 3) Operational definitions for key variables (with measurable indicators), 4) Feasibility matrix (data availability, ethics, scope, timeline), 5) Final research question wording (SMART + significant), 6) Rationale showing originality, contribution, and alignment with literature.' },
      { name: '🗺️ Literature Map Construction', text: 'Using these abstracts/sources [paste], create a structured knowledge map: 1) Categorize studies by theoretical frameworks, methodologies, and contexts, 2) Identify seminal works and citation clusters, 3) Chart converging findings vs. contested debates, 4) Highlight conceptual gaps, methodological limitations, and underrepresented populations, 5) Propose guiding questions for further review, 6) Suggest digital tools (e.g., VOSviewer) and next keywords to expand the search.' },
      { name: '⚖️ Evidence Weight Assessment', text: 'For the claim “[claim]”, critically evaluate each evidence source I provide: 1) Assess credibility (author expertise, publication venue, funding), 2) Evaluate methodological rigor and sample adequacy, 3) Check recency, relevance, and triangulation with other data, 4) Identify biases or conflicts of interest, 5) Assign qualitative confidence levels (high/medium/low) with justification, 6) Recommend additional evidence needed to strengthen or challenge the claim.' },
      { name: '⚔️ Opposing Viewpoints Compilation', text: 'Map the argumentative landscape for [issue]: 1) List primary positions and sub-positions, 2) Summarize core claims, supporting evidence, and underlying assumptions, 3) Trace logical reasoning chains, 4) Document common rebuttals and counter-evidence, 5) Identify blind spots or strawman arguments, 6) Suggest high-impact data or studies that would clarify the debate, 7) Provide a balanced synthesis highlighting opportunities for resolution or further inquiry.' },
      { name: '📊 Research Method Selection', text: 'I plan to study [topic]. Compare at least three methodological options by: 1) Matching research objectives and questions to method suitability, 2) Detailing data sources, sampling strategies, and instruments needed, 3) Discussing validity, reliability, and ethical considerations, 4) Estimating time, cost, and expertise requirements, 5) Highlighting triangulation opportunities, 6) Recommending the optimal approach or mixed-methods design with an implementation roadmap.' },
      { name: '📝 Abstract Writing Assistant', text: 'Given these highlights [paste], craft a polished abstract (≤250 words). Structure as: Background/problem framing, Purpose/objectives, Methods (design, participants, instruments, analysis), Key findings with quantitative or qualitative detail, Implications for theory/practice/future research. Ensure clarity, coherence, and adherence to journal conventions; suggest keywords afterward.' },
      { name: '🎤 Academic Presentation Structure', text: 'I will present my study at [venue]. Please produce: 1) Slide-by-slide outline (title → agenda → literature → methods → findings → implications), 2) Talking points emphasizing argument logic and storytelling, 3) Visual recommendations (charts, infographics, tables) with design tips, 4) Strategies for engaging diverse audiences (polls, reflective questions), 5) Anticipated Q&A themes with evidence-backed responses, 6) Accessibility considerations (fonts, contrasts, handouts).' },
      { name: '🔬 Hypothesis Construction', text: 'I am researching [topic]. Please help me construct testable research hypotheses. Include: 1) Clear and operational hypothesis statements, 2) Variable definitions and relationship settings, 3) Theoretical foundation and literature support, 4) Competing hypotheses and alternative explanations, 5) Testing methods and evidence collection strategies, 6) Expected results and significance assessment. Please explain how to ensure the scientific validity and practical applicability of hypotheses.' },
      { name: '📊 Data Visualization Design', text: 'I have [data type] data that needs visualization. Please suggest: 1) Most suitable chart types (bar charts, line graphs, pie charts, etc.), 2) Visual design principles (color, fonts, layout), 3) Data storytelling structure, 4) Accessibility and barrier-free design, 5) Mobile device adaptation considerations, 6) User-friendly tool recommendations. Please provide simple and practical implementation steps.' },
      { name: '📝 Research Reverse Design', text: 'I want to research [research question]. Please help me use reverse thinking to design a research plan. Steps: 1) Ideal results and impact setting, 2) Key outcome indicators identification, 3) Necessary evidence and data requirements analysis, 4) Research methods and tools selection, 5) Timeline planning and milestone setting, 6) Risk assessment and response strategies, 7) Quality control and review mechanisms. Please explain how to ensure research feasibility and practicality.' }
    ],
    'Creative Design Instructions (with "Create Images" feature)': [
      { name: '🎨 Character Design Blueprint', text: 'Craft an image prompt for [character concept] that covers: 1) Narrative backstory, personality anchors, and emotional state, 2) Pose, camera angle, and framing, 3) Wardrobe materials, accessories, and surface details, 4) Lighting mood and color palette, 5) Targeted art style (e.g., painterly, cel-shaded, photorealistic) and resolution hints, 6) Elements to avoid to keep the character on-brand.' },
      { name: '🏫 Instructional Scene Illustration', text: 'Design a teaching-scene illustration for [course topic]. Specify: 1) Setting and vantage point, 2) Learner and teacher actions with facial expressions, 3) Key instructional materials or tech tools, 4) Environmental storytelling details that reinforce the learning goal, 5) Lighting and tonal contrast guidance, 6) Optional layers or variants for later edits.' },
      { name: '📜 Poster Concept Framework', text: 'Outline a poster concept for [event name]: 1) Core visual metaphor and narrative hook, 2) Layout grid (title/info/CTA placement), 3) Typographic hierarchy and font mood, 4) Color story and contrast ratios, 5) Image or pattern elements that support the theme, 6) Print and digital size adaptation notes.' },
      { name: '🤖 Mascot Ideation Kit', text: 'Help develop a mascot for [institution/course]: 1) Brand personality traits and emotional tone, 2) Form factor and silhouette, 3) Signature colors, textures, or patterns, 4) Symbolic accessories or props, 5) Movement/pose variations for different contexts, 6) Guidelines for translating the design into merchandise, stickers, and digital avatars.' },
      { name: '🔍 Visual Metaphor Exploration', text: 'Translate the abstract concept “[concept]” into visuals. Provide three metaphor options, each detailing: 1) Central imagery and symbolism, 2) Composition and focal point, 3) Color/lighting treatment, 4) Suitable typography or caption style, 5) Cultural sensitivities or misinterpretations to avoid, 6) Ideas for scaling the metaphor across multiple touchpoints.' },
      { name: '📚 Comic Storyboard Prompts', text: 'Plan a four-panel comic for [story outline]. For each panel list: scene setup, perspective, character actions, dialogue caption length, and pacing purpose (setup, build, payoff). Recommend transitions, sound effects, and visual cues that guide readers smoothly.' },
      { name: '🎨 Cohesive Image Style Guide', text: 'I need a consistent visual style inspired by [reference]. Provide: 1) Descriptive adjectives and mood, 2) Line quality and texture guidance, 3) Color, lighting, and shading norms, 4) Composition patterns and depth cues, 5) Variation rules for different subject matters, 6) Watch-outs that would break stylistic coherence.' },
      { name: '🎨 Color System Playbook', text: 'Design a palette for [theme/context]: 1) Primary/secondary/accent colors with hex codes, 2) Emotional or cultural resonance, 3) Contrast and harmony ratios, 4) Media-specific adjustments (print vs. web), 5) Accessibility checks (contrast, color-blind simulation), 6) Application examples (backgrounds, buttons, data viz).' },
      { name: '📱 UI/UX Visual Brief', text: 'For [app/site], deliver a UI/UX brief: 1) Key user journeys and moments that matter, 2) Information architecture sketch, 3) Interaction states (default/hover/disabled) for core components, 4) Responsive breakpoints and prioritization rules, 5) Usability test scenarios and metrics, 6) Accessibility checklist (keyboard navigation, ARIA, contrast), 7) Recommended wireframing/prototyping tools.' },
      { name: '🎭 Brand Visual Identity System', text: 'Create a visual identity plan for [brand]. Include: 1) Brand story and design DNA, 2) Logo concept, clear space, and misuse rules, 3) Typography system and layout conventions, 4) Color and imagery libraries, 5) Application mockups (print, digital, environmental), 6) Governance guidelines for maintaining consistency across teams.' }
    ],
    'Programming Instructions (with "Canvas" feature)': [
      { name: '🔄 Algorithm Breakdown', text: 'Help me dissect the algorithm needed for [problem description]. Deliver: 1) Formal specification of inputs, outputs, constraints, and edge conditions, 2) Pseudocode with annotated steps and data structures used, 3) Analysis of time and space complexity by component, 4) Discussion of trade-offs versus alternative approaches, 5) Potential optimizations (e.g., pruning, memoization, parallelization), 6) Test scenarios that validate each branch of the algorithm.' },
      { name: '🧪 Test Case Generation', text: 'For [function description], design an exhaustive test suite covering: 1) Nominal cases, boundary values, and extreme inputs, 2) Invalid inputs and error-handling behaviour, 3) State-dependent cases (mutability, race conditions), 4) Performance/stress scenarios, 5) Property-based or randomized tests if appropriate, 6) Expected outputs or assertions for each case, 7) Suggested automation framework snippets (unit/integration).' },
      { name: '🔧 Code Refactoring Suggestions', text: 'Review this code snippet [paste code] and produce a refactoring roadmap: 1) Identify code smells (duplication, long functions, magic numbers, tight coupling), 2) Recommend structural improvements (modularization, design patterns, SOLID adherence), 3) Suggest readability enhancements (naming, comments, formatting, logging), 4) Highlight performance or memory concerns, 5) Provide before/after code examples for key sections, 6) Include regression testing considerations to safeguard behaviour.' },
      { name: '📊 Data Flow Design', text: 'Design a data flow architecture for [system/project]. Include: 1) Context diagram of external actors and integration points, 2) Detailed flow diagram showing sources, ingestion, processing stages, storage, and consumers, 3) Data classification (structured/unstructured, sensitivity levels), 4) Error-handling and retry strategies, 5) Scalability and resilience patterns (queueing, batching, CDC), 6) Observability plan (logs, metrics, tracing), 7) Key risks (latency, bottlenecks, compliance) with mitigation tactics.' },
      { name: '🎨 Canvas Experiment Draft', text: 'I want to prototype [idea] using the canvas feature. Please outline: 1) User stories and interaction goals, 2) Architectural composition (render loop, layers, state management), 3) Visual design specs (color palette, typography, motion), 4) Data ingestion and transformation pipeline, 5) Event handling and accessibility considerations, 6) Performance safeguards (throttling, memoization), 7) Testing plan (unit, snapshot, user testing) and deployment checklist.' },
      { name: '🔍 Error Diagnosis Questions', text: 'Given the runtime error “[error message]”, craft a diagnostic playbook: 1) Hypothesis list ranked by likelihood, 2) Required logs, metrics, or debugger inspections, 3) Reproduction strategy (minimal repro, environment parity), 4) Instrumentation or probes to add, 5) Decision tree for isolating root causes (configuration, dependency, code regression, infra), 6) Remediation steps once cause is found, 7) Preventive measures (tests, monitoring, documentation) to avoid recurrence.' },
      { name: '📚 Learning Path Planning', text: 'I want to learn [technology] in three weeks. Please plan sequential learning priorities, practice materials, and weekly outputs, explaining the reasoning.' },
      { name: '🔒 Security Audit Checklist', text: 'Please create an information security audit checklist for [system or application]. Include: 1) Authentication and authorization controls, 2) Data encryption and transmission security, 3) Input validation and SQL injection protection, 4) Cross-site scripting (XSS) protection, 5) API security and rate limiting, 6) Logging and monitoring mechanisms, 7) Security updates and backup strategies. Please provide specific checklist items and implementation recommendations.' },
      { name: '🚀 Performance Optimization Guide', text: 'My [program type] program has performance bottlenecks. Please provide optimization suggestions: 1) Performance bottleneck identification and analysis methods, 2) Code-level optimization (algorithms, data structures), 3) Database query optimization and index design, 4) Caching strategies and memory management, 5) Network request optimization and asynchronous processing, 6) Resource monitoring and performance testing tools, 7) Scalability design considerations. Please provide specific code examples and testing methods.' },
      { name: '📱 Cross-Platform Development', text: 'I want to develop [application type] that supports multiple platforms. Please suggest: 1) Cross-platform framework selection and comparison, 2) Unified codebase and shared component design, 3) Platform-specific feature handling strategies, 4) UI/UX consistency and adaptive design, 5) Testing and deployment strategies, 6) Performance optimization and resource management, 7) Maintenance and update mechanisms. Please provide technology selection and implementation steps.' }
    ],
    'Learning & Research Instructions (with "Learning & Research" feature)': [
      { name: '🗺️ Concept Map Construction', text: 'Build a high-impact concept map for [topic]: 1) Identify anchor concepts, sub-concepts, and prerequisite knowledge, 2) Illustrate directional relationships (cause-effect, hierarchy, part-whole) with labeled connectors, 3) Embed concrete examples or case snippets at each node, 4) Flag common misconceptions or boundary confusions, 5) Suggest digital tools/templates and color-coding schemes to maintain clarity, 6) Provide reflection prompts for learners to extend or revise the map after new learning.' },
      { name: '📊 Case Comparison Analysis', text: 'Compare [case A] and [case B] through a structured matrix: 1) Context overview (timeframe, stakeholders, constraints), 2) Strategic actions/interventions employed, 3) Resources leveraged and implementation timeline, 4) Quantitative and qualitative outcomes, 5) Success factors and failure points, 6) Transferable lessons and cautions, 7) Synthesis paragraph recommending how insights can inform future decisions.' },
      { name: '🔍 Keyword Expansion', text: 'Develop a tiered search strategy for [issue]: 1) Map core concepts and synonyms, 2) Generate Boolean strings for scholarly databases vs. open web, 3) Propose successive search “layers” (foundational theory → contemporary debates → applied cases → grey literature), 4) Suggest subject headings, citation chasing, and alert setups, 5) Indicate expected insights at each layer and criteria to evaluate relevance.' },
      { name: '📚 Reading Guide Questions', text: 'Design strategic reading questions for [article/chapter]: 1) Pre-reading (activate prior knowledge, predict structure, set purpose), 2) During reading (track argument flow, evidence quality, author bias), 3) Post-reading (synthesize, critique, apply). Provide three prompts per phase, plus extension tasks (discussion, annotation, synthesis writing) to deepen comprehension.' },
      { name: '🔄 Knowledge Transfer Practice', text: 'Help me adapt [learned concept] to [new context]. Deliver: 1) Core principles and constraints of the original concept, 2) Mapping of analogous elements in the new context, 3) Required adjustments or additional knowledge, 4) Step-by-step application scenario, 5) Risk assessment and mitigation strategies, 6) Metrics to evaluate transfer effectiveness, 7) Reflection prompts to capture lessons for future transfers.' },
      { name: '📊 Learning Diagnosis Report', text: 'Given the learning data [data], prepare a diagnostic report: 1) Visualize progress trends and variability, 2) Identify strengths, persistent gaps, and emerging patterns, 3) Associate gaps with possible root causes (content, strategies, mindset), 4) Recommend targeted interventions (resources, coaching, practice routines), 5) Set SMART follow-up goals and monitoring checkpoints, 6) Suggest reflection questions to promote learner agency.' },
      { name: '💬 Discussion Class Facilitation', text: 'Support my facilitation of a discussion on [topic] by providing: 1) Opening moves (community agreements, framing, provocative prompt), 2) Core questions sequenced from exploratory to analytical to transformative, 3) Probing follow-ups (evidence requests, counterfactuals, connection-making), 4) Strategies to balance voices and handle conflict, 5) Mid-course recap techniques, 6) Closing synthesis statement with calls to action and reflection prompts.' },
      { name: '📚 Literature Review Writing', text: 'I want to write a literature review for [research topic]. Please help me: 1) Literature search strategies and keyword setting, 2) Literature screening criteria and quality assessment, 3) Thematic classification and structural organization, 4) Critical analysis and theoretical integration, 5) Research gap identification and future directions, 6) Citation format and academic writing standards, 7) Review quality check and revision suggestions. Please provide specific structural outlines and writing techniques.' },
      { name: '🧠 Critical Thinking Framework', text: 'Please teach me to use critical thinking to analyze [issue or phenomenon]. Include: 1) Clear problem definition and background analysis, 2) Multiple perspective identification and position examination, 3) Argument structure and logical analysis, 4) Evidence quality assessment and source verification, 5) Assumption and bias identification, 6) Conclusion reasonableness and alternative explanations, 7) Practical application and impact assessment. Please provide specific thinking tools and analysis steps.' },
      { name: '🔍 Research Method Comparison', text: 'I want to research [research question]. Please compare the applicability of different research methods. Include: 1) Quantitative vs. qualitative research comparison, 2) Experimental design vs. observational study analysis, 3) Cross-sectional vs. longitudinal research selection, 4) Case study vs. survey research considerations, 5) Data collection methods and tool selection, 6) Sample size and sampling strategies, 7) Research ethics and limitation considerations. Please provide specific method selection recommendations and implementation steps.' }
    ],
    'Data Compilation Instructions (with "Web Search" feature)': [
      { name: '📊 Data Source Inventory', text: 'Help me catalog credible sources for [issue]: 1) Categorize official, academic, industry, and civic sources, 2) Outline strengths, limitations, and typical biases, 3) Suggest verification actions (cross-referencing, metadata checks), 4) Note update frequency and monitoring methods, 5) Flag legal or ethical considerations when using each source.' },
      { name: '📝 Multi-source Summary Organization', text: 'Given these highlights [highlight list], synthesize: 1) Converging themes, 2) Conflicting viewpoints with supporting evidence, 3) Facts that remain unverified, 4) Additional sources to consult, 5) Preliminary insights and cautionary notes for decision-makers.' },
      { name: '📅 Timeline Event Table', text: 'Build a timeline for [topic]: 1) List key events with dates and locations, 2) Identify relevant stakeholders and roles, 3) Summarize outcomes or ripple effects, 4) Attach citations for each entry, 5) Highlight future checkpoints or pending actions.' },
      { name: '📊 Policy Comparison Summary', text: 'Compare [policy A] and [policy B]: 1) Objectives and scope, 2) Implementation measures and governance structure, 3) Evaluation indicators and current evidence, 4) Stakeholder impact analysis, 5) Strengths, risks, and trade-offs, 6) Information gaps and recommended follow-up research.' },
      { name: '❓ FAQ Compilation', text: 'For [issue], compile an FAQ: 1) Gather high-frequency public questions, 2) Provide concise evidence-based answers with citations, 3) Link to official resources or deeper dives, 4) Flag questions requiring periodic updates or pending confirmation.' },
      { name: '📰 Media Narrative Analysis', text: 'Analyze media framing of [event]: 1) Identify outlets/platforms and publication dates, 2) Describe tone, keyword patterns, and imagery, 3) Surface implicit assumptions or agendas, 4) Map the balance of supportive vs. critical coverage, 5) Recommend verification tasks for contested claims.' },
      { name: '🔎 Follow-up Research Suggestions', text: 'Based on current evidence, propose three follow-up research questions: 1) Rationale and potential impact, 2) Data types/sources required, 3) Recommended methods or collaborators, 4) How findings could inform policy or practice.' },
      { name: '📊 Data Visualization Recommendations', text: 'I have [data type] data to visualize. Provide: 1) Suitable chart types and narrative flow, 2) Data cleaning and preprocessing checklist, 3) Visual design principles (color, typography, labeling), 4) Interaction/animation ideas, 5) Accessibility and responsive design tips, 6) Tool suggestions with implementation notes.' },
      { name: '🔍 Fact-Checking Process', text: 'Help me fact-check “[information/claim]”: 1) Evaluate source credibility, 2) Deconstruct main assertions, 3) Locate independent corroboration, 4) Consult experts or authoritative bodies, 5) Review timeline/context, 6) Identify bias or conflicts of interest, 7) Produce a conclusion with uncertainty qualifiers and next steps.' },
      { name: '📝 Report Structuring', text: 'I need to draft a report on [topic]. Provide: 1) Chapter outline aligned with stakeholder needs, 2) Executive summary blueprint, 3) Guidance for data analysis and visualization placement, 4) Logical progression for conclusions and recommendations, 5) Appendices/reference organization tips, 6) Layout/readability best practices, 7) Pre-publication quality checklist.' }
    ],
    'Educational Administration & Communication': [
      { name: '📬 Parent Communication Letters', text: 'Draft a parent communication about [event/update]. Include: 1) Brief context and acknowledgement of parental partnership, 2) Transparent status report (what we know, decisions made, evidence), 3) Impact on students and supports in place, 4) Clear action steps for families (timelines, contacts, resources), 5) FAQs or anticipated concerns, 6) Appreciation and invitation for dialogue. Maintain a warm, professional tone and provide bilingual options if applicable.' },
      { name: '📅 Meeting Agenda Planning', text: 'For the upcoming [meeting name], please produce: 1) Meeting objectives linked to strategic priorities, 2) Proposed agenda sequence with facilitators, time allotments, and desired outcomes, 3) Pre-read or preparation tasks with deadlines, 4) Decision-making protocols (consensus, voting, consultation), 5) Norms for engagement and accessibility accommodations, 6) Follow-up logistics (note-taking, action item tracking).' },
      { name: '📢 Announcement Writing Outline', text: 'Compose an announcement for [activity/policy]. Structure it as: 1) Headline and key message hook, 2) Purpose and alignment with school goals, 3) Critical details (who, what, when, where, cost, eligibility), 4) Registration or response procedures with deadlines, 5) Safety/data-protection reminders, 6) Contact information and FAQ link, 7) Positive closing statement motivating participation.' },
      { name: '🤝 Collaboration Proposal Summary', text: 'Summarize a partnership proposal for [organization] regarding [collaboration content]. Include: 1) Background problem/opportunity statement with data, 2) Strategic fit and mutual benefits, 3) Proposed activities/timeline, 4) Resource commitments (budget, staffing, facilities), 5) Governance and communication structure, 6) Evaluation metrics and reporting plan, 7) Sustainability and scaling considerations.' },
      { name: '🆘 Crisis Response Draft', text: 'Prepare an external statement for [crisis situation]. Components: 1) Compassionate acknowledgement of stakeholders affected, 2) Verified facts and what is under investigation, 3) Immediate actions taken and supporting agencies, 4) Ongoing mitigation plans and timelines, 5) Guidance for families/media (hotlines, updates), 6) Commitment to transparency and next update time, 7) Appreciation for community cooperation and call for calm vigilance.' },
      { name: '📝 Class Management Messages', text: 'Write a briefing note to homeroom teachers covering: 1) Current class climate and notable student trends (attendance, behaviour, achievement), 2) Support interventions in progress, 3) Resource needs (materials, professional learning, family outreach), 4) Upcoming events/tasks requiring coordination, 5) Celebrations and success stories to share, 6) Requests for feedback or data, 7) Next check-in schedule.' },
      { name: '📝 Policy Summary Translation', text: 'Translate the policy highlights [paste policy points] into plain language: 1) Key objectives and obligations, 2) Who is affected and timelines, 3) Step-by-step compliance checklist, 4) Benefits and potential challenges, 5) Support resources (contacts, templates, training), 6) Risks of non-compliance, 7) Suggested communication scripts for staff/students/families. Maintain accuracy and avoid overpromising outcomes.' },
      { name: '📊 Educational Achievement Report', text: 'Please help me write an educational achievement report for [period]. Include: 1) Student learning outcomes and competency performance analysis, 2) Teaching quality improvement and innovative practices, 3) Teacher professional development and training results, 4) Parent satisfaction and community participation, 5) Resource utilization efficiency and environmental improvements, 6) Challenges and coping strategies, 7) Future development directions and improvement plans. Please use data to support arguments with an objective and professional tone.' },
      { name: '📝 Educational Proposal Writing', text: 'I want to propose [educational plan] to [supervisory authority]. Please help me write a proposal: 1) Plan background and current situation analysis, 2) Goal setting and expected outcomes, 3) Implementation strategies and method design, 4) Timeline planning and milestone setting, 5) Budget allocation and resource requirements, 6) Benefit assessment and outcome indicators, 7) Risk assessment and response measures. Please emphasize innovation and feasibility.' },
      { name: '🤝 Stakeholder Communication', text: 'Please design a stakeholder communication strategy for [educational issue]. Include: 1) Stakeholder analysis and influence assessment, 2) Communication objectives and message design, 3) Multiple communication channels and media selection, 4) Timing and frequency arrangement, 5) Feedback collection and opinion integration, 6) Crisis communication and negative information handling, 7) Effectiveness assessment and continuous improvement. Please provide specific communication techniques and example phrases.' }
    ],
    'Assessment & Reflection Support': [
      { name: '📝 Rubric Optimization', text: 'Here is the current rubric: [paste rubric]. Please 1) verify alignment between standards, dimensions, and descriptors; 2) rewrite each performance level using observable behaviors and evidence; 3) standardize wording, avoiding vague qualifiers; 4) recommend quantitative/qualitative indicators and documentation tools; 5) supply usage guidance for teacher co-planning and student self-assessment; 6) include sample feedback statements for different proficiency bands.' },
      { name: '💬 Feedback Statement Generation', text: 'Please craft a feedback statement bank for [work/task]. Organize by: 1) Strength recognitions (evidence-based praise, growth mindset language), 2) Areas for refinement (gap identification + concrete strategy + reflective question), 3) Next-step commitments (resources, timeframe, success indicators). Provide variants for oral, written, and digital messaging, plus concise phrases suitable for peer- and self-assessment.' },
      { name: '📚 Learning Portfolio Summary', text: 'Compose a 200-word learning portfolio summary for student [name/code]. Include: 1) Goal attainment overview with quantitative evidence, 2) Highlight artifacts or performances linked to competencies, 3) Growth narrative explaining strategies and perseverance, 4) Priority focus areas with actionable suggestions, 5) Forward-looking plan (targets, checkpoints, needed support).' },
      { name: '📊 Post-test Diagnosis', text: 'Given the [topic] assessment data [paste data], please 1) analyze mastery rates and error patterns, 2) cluster learners by performance bands and identify common misconceptions, 3) prioritize concepts for reteaching, 4) recommend targeted interventions (group/individual/online resources), 5) design follow-up checks or mini-assessments, 6) outline communication points for families or advisors, 7) set monitoring indicators for subsequent lessons.' },
      { name: '🤝 Peer Assessment Process', text: 'Design a dependable peer assessment workflow for [task/product], covering: 1) Calibration materials and model exemplars, 2) Rubrics/checklists with observable criteria, 3) Respectful feedback norms and sentence stems, 4) Guided rehearsal or teacher modeling, 5) Implementation logistics (pairing, timing, documentation tools), 6) Teacher monitoring and intervention triggers, 7) Post-assessment reflection (self-evaluation, revision cycle).' },
      { name: '🤔 Post-class Reflection Questions', text: 'Provide five reflection prompts to help students review [topic] from multiple angles: 1) Cognitive (what was learned, remaining questions), 2) Strategy (which approaches worked or failed), 3) Affective (emotions, motivation), 4) Collaborative (team contribution, communication), 5) Future planning (next adjustments, resource needs). Offer short response stems and optional extension tasks.' },
      { name: '🏆 Performance Level Descriptions', text: 'Draft four performance level descriptors for [task]—exemplary, proficient, developing, emerging. For each level specify: 1) Observable behaviors and product qualities, 2) Language/strategy/attitude indicators, 3) Common misconceptions or pitfalls, 4) Suggested feedback phrases. Where relevant, link to competency indicators or check points.' },
      { name: '📊 Learning Effectiveness Analysis', text: 'Please help me analyze the learning effectiveness of [class or student] in [topic]. Include: 1) Learning outcome data visualization analysis, 2) Learning objective achievement rate assessment, 3) Learning difficulty points and error type identification, 4) Individual student progress trajectory tracking, 5) Teaching strategy effectiveness evaluation, 6) Learning motivation and participation analysis, 7) Improvement recommendations and follow-up tracking plans. Please provide specific data interpretation and action plans.' },
      { name: '🎨 Multiple Assessment Design', text: 'Please design a multiple assessment plan for [learning topic]. Include: 1) Traditional written tests and practical assessment combination, 2) Oral reports and presentation displays, 3) Group collaboration and peer evaluation, 4) Learning portfolio and work collection, 5) Digital tools and online assessment, 6) Self-assessment and reflection journals, 7) Authentic situation performance tasks. Please explain the weight distribution and integration strategies of various assessment methods.' },
      { name: '🔄 Continuous Improvement Cycle', text: 'Please help me establish a continuous improvement cycle for [teaching or assessment]. Include: 1) Current situation assessment and baseline data establishment, 2) Improvement goal setting and indicator definition, 3) Action plan and implementation strategies, 4) Effectiveness monitoring and data collection, 5) Result analysis and feedback integration, 6) Adjustment plans and re-implementation, 7) Experience summary and knowledge sharing. Please provide specific timeline arrangements and review mechanisms.' }
    ],
    'Chinese Language Teaching': [
      { name: '🎨 TBLT Lesson Architecture', text: 'Design a comprehensive Task-Based Language Teaching lesson for [CEFR level] Chinese learners on [topic], following Willis\' TBLT framework. Structure: 1) Pre-task Phase: Schema activation, cultural context introduction, essential vocabulary/grammar preview through meaningful exposure, 2) Task Cycle: Main communicative task with clear outcomes, planning phase for language preparation, report phase for public performance, 3) Language Focus: Consciousness-raising activities, controlled practice with immediate feedback, freer practice in new contexts, 4) Post-task Extension: Real-world application opportunities, reflective assessment, autonomous learning pathways. Please emphasize how meaning-focused communication drives language acquisition and provide specific scaffolding strategies for diverse proficiency levels.' },
      { name: '📚 Integrated Skills Workbook', text: 'Create a multi-skill integrated workbook for [CEFR level] Chinese learners exploring [topic]. Design should include: 1) Authentic Context Setup: Real-world scenarios, cultural background, multimedia resources, 2) Vocabulary Development: High-frequency words, collocations, contextual usage, visual associations, 3) Grammar in Context: Functional analysis, communicative patterns, inductive discovery activities, 4) Listening Comprehension: Authentic materials, strategy training, note-taking skills, 5) Speaking Production: Role-plays, information gaps, collaborative discussions, 6) Reading Strategies: Text analysis, critical thinking, cultural interpretation, 7) Writing Process: Guided composition, peer feedback, revision cycles. Ensure all activities promote meaningful communication and cultural understanding.' },
      { name: '💬 Communicative Task Design', text: 'Develop three progressive communicative tasks for [learner level] focusing on [topic], embodying TBLT principles. Each task should feature: 1) Authentic Communication Purpose: Real-world relevance, clear outcomes, genuine information exchange, 2) Information Gap Structure: Asymmetric knowledge distribution, negotiation of meaning, collaborative problem-solving, 3) Scaffolding Framework: Language support, cultural guidance, strategic instruction, 4) Interaction Patterns: Pair work, group dynamics, whole-class sharing, 5) Assessment Integration: Performance criteria, self-evaluation, peer feedback, 6) Extension Opportunities: Real-world application, digital integration, autonomous practice. Please provide detailed teacher facilitation strategies and common challenge solutions.' },
      { name: '🎤 Performance-Based Assessment', text: 'Create authentic performance assessments for [ACTFL level] Chinese learners targeting [skill area], integrating all four language skills. Assessment design: 1) Real-World Task Simulation: Workplace scenarios, academic contexts, social situations, 2) Holistic Evaluation Criteria: Communicative effectiveness, linguistic accuracy, cultural appropriateness, strategic competence, 3) Multiple Assessment Modes: Oral interviews, practical demonstrations, portfolio collections, peer evaluations, 4) Rubric Development: Performance descriptors, proficiency indicators, growth documentation, 5) Feedback Systems: Immediate response, reflective dialogue, goal-setting conferences, 6) Learning Portfolio Integration: Process documentation, self-reflection, progress tracking. Ensure assessments motivate learning and provide actionable feedback for improvement.' },
      { name: '🌏 Cultural-Linguistic Materials', text: 'Develop culturally-rich teaching materials for [TOCFL level] learners exploring [topic]. Material components: 1) Authentic Resource Selection: News articles, social media posts, advertisements, conversational exchanges, 2) Linguistic Scaffolding: Graded vocabulary, progressive grammar, contextual support, 3) Cultural Knowledge Integration: Traditional customs, contemporary values, social phenomena, generational perspectives, 4) Cross-Cultural Comparison: Learner heritage culture dialogue, global perspectives, critical analysis, 5) Critical Thinking Development: Cultural phenomenon analysis, value examination, open-ended discussions, 6) Extended Learning Resources: Video content, website recommendations, literature suggestions. Ensure materials promote both language proficiency and intercultural competence development.' },
      { name: '🎤 Pragmatic Competence Development', text: 'Design authentic dialogue practice for [situation] targeting [level] Chinese learners, emphasizing pragmatic competence and sociolinguistic awareness. Dialogue framework: 1) Contextual Variables: Participant relationships, social settings, communicative purposes, power dynamics, 2) Speech Act Analysis: Direct/indirect strategies, politeness conventions, cultural appropriateness, register variation, 3) Functional Language Focus: Request patterns, suggestion formulas, complaint strategies, apology sequences, 4) Pragmatic Strategy Instruction: Contextual adaptation, tone modulation, cultural sensitivity, nonverbal communication, 5) Interactive Practice: Role-play variations, improvisation exercises, video analysis, peer feedback, 6) Autonomous Development: Self-monitoring tools, cultural observation tasks, reflection journals, real-world application challenges. Provide comprehensive teacher guidance and learner self-assessment strategies.' },
      { name: '🎨 Chinese Character Teaching', text: 'Please design a Chinese character teaching plan for [level] Chinese learners with [number] characters. Include: 1) Character stroke and structure analysis, 2) Radical and component teaching, 3) Character meaning and vocabulary expansion, 4) Writing practice and stroke order guidance, 5) Memory strategies and association techniques, 6) Cultural connotations and story backgrounds, 7) Digital tools and interactive games. Please explain how to combine traditional calligraphy with modern teaching techniques.' },
      { name: '🎭 Cultural Experience Activities', text: 'Please design [cultural theme] experience activities for [level] Chinese learners. Include: 1) Cultural knowledge introduction and background presentation, 2) Hands-on experience and practical operations (calligraphy, paper cutting, tai chi, tea ceremony, etc.), 3) Language and culture integrated learning, 4) Cross-cultural comparison and dialogue, 5) Cultural product creation and sharing, 6) Reflection discussion and experience exchange, 7) Extended learning and life application. Please explain how cultural experience enhances language learning motivation and cultural understanding.' },
      { name: '📱 Digital Chinese Teaching', text: 'Please design a digital teaching plan for [level] Chinese learners. Include: 1) Digital platform and tool selection (apps, websites, VR/AR), 2) Interactive learning activity design, 3) Personalized learning paths and adaptive teaching, 4) Online-offline blended teaching models, 5) Digital portfolios and learning analytics, 6) AI-assisted learning and intelligent feedback, 7) Digital literacy and online safety education. Please explain how to maintain humanistic care and cultural heritage in digital environments.' },
      { name: '🌍 International Chinese Education', text: 'Please design a Chinese education curriculum for international schools [grade]. Include: 1) Curriculum objectives and core competency setting, 2) Cross-cultural teaching and multiple perspective integration, 3) Chinese culture and world culture dialogue, 4) Language skills and cultural literacy emphasis, 5) Project learning and practical application, 6) Multimedia resources and technology integration, 7) Assessment and certification mechanisms. Please explain how to cultivate students to become global citizens with Chinese cultural literacy.' }
    ],
    'Custom Prompts': []
  }
};

// 工具函數
const escapeHtml = str => str.replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[m]);
const trimText = (text, length = 120) => text.replace(/\s+/g, ' ').trim().slice(0, length) + (text.length > length ? '…' : '');
const getText = key => LANGUAGES[currentLanguage][key] || LANGUAGES.zh[key];



// 側邊欄樣式
function injectSidebarStyles() {
  if (document.getElementById(SIDEBAR_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = SIDEBAR_STYLE_ID;
  style.textContent = `#chatgpt-prompt-sidebar{position:fixed;top:0;right:0;width:350px;height:100vh;display:flex;flex-direction:column;background:#fff;color:#000;border-left:1px solid #e0e0e0;box-shadow:-2px 0 8px rgba(0,0,0,0.1);z-index:10000;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}.chatgpt-sidebar-header{display:flex;justify-content:space-between;align-items:center;padding:12px 16px;border-bottom:1px solid #e0e0e0;background:#000;color:#fff}.chatgpt-sidebar-title{font-weight:600;font-size:14px;flex:1;text-align:center;margin:0 8px}.chatgpt-header-actions{display:flex;gap:4px}.chatgpt-icon-btn,.chatgpt-lang-toggle{width:24px;height:24px;border-radius:8px;border:1px solid rgba(255,255,255,0.3);background:rgba(255,255,255,0.1);color:#fff;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all 0.2s;font-size:11px}.chatgpt-lang-toggle{padding:3px 6px;font-size:9px}.chatgpt-sidebar-controls{padding:16px;border-bottom:1px solid #e0e0e0;display:flex;flex-direction:column;gap:12px}.chatgpt-select{width:100%;padding:10px 12px;border-radius:8px;border:1px solid #e0e0e0;background:#fff;color:#000;outline:none;font-size:14px;appearance:none;background-image:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><path d="M6 9L2 5h8z" fill="%23666"/></svg>');background-repeat:no-repeat;background-position:right 8px center;padding-right:32px}.chatgpt-mode-toggle{display:flex;gap:4px}.chatgpt-mode-btn{flex:1;padding:8px 12px;border-radius:8px;border:1px solid #e0e0e0;background:#fff;color:#000;font-size:12px;cursor:pointer;transition:all 0.2s;text-align:center;display:flex;align-items:center;justify-content:center}.chatgpt-mode-btn.active{background:#000;color:#fff;border-color:#000}.chatgpt-mode-btn:hover:not(.active){background:#f0f0f0}.chatgpt-sidebar-body{flex:1;overflow-y:auto;padding:16px;display:flex;flex-direction:column;gap:8px}.chatgpt-prompt-item{background:#f8f8f8;border:1px solid #e0e0e0;border-radius:8px;padding:14px;cursor:pointer;transition:all 0.2s;font-size:14px;text-align:center;display:flex;align-items:center;justify-content:center}.chatgpt-prompt-item:hover{background:#f0f0f0;border-color:#000}.chatgpt-custom-prompt-card{background:#f8f8f8;border:1px solid #e0e0e0;border-radius:8px;padding:14px;display:flex;flex-direction:column;gap:8px}.chatgpt-custom-prompt-header{display:flex;justify-content:space-between;align-items:center}.chatgpt-prompt-actions{display:flex;gap:4px;align-items:center}.chatgpt-edit-btn,.chatgpt-delete-btn{width:24px;height:24px;border-radius:6px;border:1px solid #e0e0e0;background:#f8f8f8;color:#000;cursor:pointer;font-size:12px;display:flex;align-items:center;justify-content:center;transition:all 0.2s}.chatgpt-edit-btn:hover{background:#e3f2fd;border-color:#2196f3}.chatgpt-delete-btn:hover{background:#ffebee;border-color:#f44336}.chatgpt-custom-prompt-title{font-weight:500;font-size:13px}.chatgpt-custom-prompt-text{font-size:11px;color:#666;line-height:1.4;margin:0;max-height:60px;overflow:hidden}.chatgpt-prompt-btn{background:#888;color:#fff;border:none;border-radius:8px;padding:6px 10px;cursor:pointer;font-size:12px;font-weight:500;transition:all 0.2s;display:flex;align-items:center;justify-content:center}.chatgpt-prompt-btn:hover{opacity:0.8}.chatgpt-secondary-btn{border-radius:8px;border:1px solid #e0e0e0;background:#f8f8f8;color:#000;padding:12px 16px;cursor:pointer;font-size:14px;transition:all 0.2s;text-align:center}.chatgpt-secondary-btn:hover{background:#f0f0f0}.chatgpt-sidebar-footer{padding:16px;text-align:center;font-size:12px;font-weight:500;color:#fff;border-top:1px solid #e0e0e0;background:#000}`;
  document.head.appendChild(style);
}

// 側邊欄功能
function createSidebar() {
  if (sidebar) return;
  injectSidebarStyles();
  sidebar = document.createElement('div');
  sidebar.id = 'chatgpt-prompt-sidebar';
  document.body.appendChild(sidebar);
  updateSidebarContent();
}

function updateSidebarContent() {
  if (!sidebar) return;
  
  const categories = Object.keys(promptCategories[currentLanguage]);
  const currentPrompts = currentCategory === (currentLanguage === 'zh' ? '自定義提示詞' : 'Custom Prompts') 
    ? loadCustomPrompts() : (promptCategories[currentLanguage][currentCategory] || []);
  // 移除主題切換相關變數
  
  // 確保 currentCategory存在於類別中
  if (!categories.includes(currentCategory)) {
    currentCategory = categories[0];
  }
  
  const options = categories.map(cat => `<option value="${escapeHtml(cat)}" ${cat === currentCategory ? 'selected' : ''}>${escapeHtml(cat)}</option>`).join('');
  const promptList = renderPrompts(currentPrompts);
  
  const isCustomCategory = currentCategory === (currentLanguage === 'zh' ? '自定義提示詞' : 'Custom Prompts');
  const modeToggleHtml = isCustomCategory ? `
    <div class="chatgpt-mode-toggle">
      <button class="chatgpt-mode-btn ${outputMode === 'chat' ? 'active' : ''}" data-mode="chat">${getText('chatMode')}</button>
      <button class="chatgpt-mode-btn ${outputMode === 'gpts' ? 'active' : ''}" data-mode="gpts">${getText('gptsMode')}</button>
    </div>` : '';
  
  sidebar.innerHTML = `
    <div class="chatgpt-sidebar-header">
      <button class="chatgpt-lang-toggle" id="langToggle">${currentLanguage === 'zh' ? 'EN' : '中'}</button>
      <span class="chatgpt-sidebar-title">🎓 ${getText('title')}</span>
      <div class="chatgpt-header-actions">
        ${isCustomCategory ? `<button id="editPrompts" class="chatgpt-icon-btn" title="${apiKey ? (currentLanguage === 'zh' ? 'API Key 已設定' : 'API Key Set') : (currentLanguage === 'zh' ? '設定 API Key' : 'Set API Key')}">${apiKey ? '✅' : '📝'}</button>` : ''}
        <button id="closeSidebar" class="chatgpt-icon-btn" title="${getText('closePanel')}">✖️</button>
      </div>
    </div>
    <div class="chatgpt-sidebar-controls">
      <select id="categorySelect" class="chatgpt-select">${options}</select>
      ${modeToggleHtml}
    </div>
    <div class="chatgpt-sidebar-body">${promptList}</div>
    <div class="chatgpt-sidebar-footer">🚀 Developed by 數位敘事力期刊 吳奇</div>
  `;
  
  // 立即綁定事件監聽器
  bindSidebarEvents();
}

function bindSidebarEvents() {
  // 使用事件委託來確保事件正確綁定
  if (!sidebar) return;
  
  // 移除舊的事件監聽器
  sidebar.removeEventListener('click', handleSidebarClick);
  sidebar.removeEventListener('change', handleSidebarChange);
  
  // 添加新的事件監聽器
  sidebar.addEventListener('click', handleSidebarClick);
  sidebar.addEventListener('change', handleSidebarChange);
}

function handleSidebarChange(e) {
  const target = e.target;
  
  // 類別選擇器
  if (target.id === 'categorySelect') {
    currentCategory = target.value;
    updateSidebarContent();
  }
}

function handleSidebarClick(e) {
  const target = e.target;
  
  // 關閉按鈕
  if (target.id === 'closeSidebar') {
    e.preventDefault();
    closeSidebar();
    return;
  }
  
  // 移除主題切換功能
  
  // 語言切換按鈕
  if (target.id === 'langToggle') {
    e.preventDefault();
    toggleLanguage();
    return;
  }
  
  // API Key 設定按鈕
  if (target.id === 'editPrompts') {
    e.preventDefault();
    showApiKeyDialog();
    return;
  }
  
  // 類別選擇器 - 使用 change 事件
  if (target.id === 'categorySelect') {
    // 這裡不處理，由 change 事件處理
    return;
  }
  
  // 模式切換按鈕
  if (target.classList.contains('chatgpt-mode-btn')) {
    e.preventDefault();
    const mode = target.getAttribute('data-mode');
    setOutputMode(mode);
    return;
  }
  
  // 提示詞插入按鈕
  if (target.classList.contains('chatgpt-prompt-btn')) {
    e.preventDefault();
    e.stopPropagation();
    const prompt = decodeURIComponent(target.getAttribute('data-prompt'));
    const metadata = {
      promptName: target.getAttribute('data-prompt-name'),
      category: target.getAttribute('data-prompt-category') || currentCategory
    };
    insertPrompt(prompt, metadata);
    return;
  }
  
  // 新增自定義提示詞按鈕
  if (target.id === 'addCustomPrompt' || target.classList.contains('chatgpt-secondary-btn')) {
    e.preventDefault();
    showCustomPromptDialog();
    return;
  }
  
  // 編輯提示詞按鈕
  if (target.classList.contains('chatgpt-edit-btn')) {
    e.preventDefault();
    const index = parseInt(target.getAttribute('data-index'));
    editCustomPrompt(index);
    return;
  }
  
  // 刪除提示詞按鈕
  if (target.classList.contains('chatgpt-delete-btn')) {
    e.preventDefault();
    const index = parseInt(target.getAttribute('data-index'));
    deleteCustomPrompt(index);
    return;
  }
  
  // 提示詞項目點擊
  if (target.classList.contains('chatgpt-prompt-item')) {
    e.preventDefault();
    const prompt = decodeURIComponent(target.getAttribute('data-prompt'));
    const metadata = {
      promptName: target.getAttribute('data-prompt-name'),
      category: target.getAttribute('data-prompt-category') || currentCategory
    };
    insertPrompt(prompt, metadata);
    return;
  }
}

function renderPrompts(prompts) {
  const isCustomCategory = currentCategory === (currentLanguage === 'zh' ? '自定義提示詞' : 'Custom Prompts');
  
  if (isCustomCategory) {
    const addButton = `<button class="chatgpt-secondary-btn" id="addCustomPrompt">${getText('addPrompt')}</button>`;
    
    if (!prompts.length) {
      return `${addButton}<p style="color: var(--muted); font-size: 13px; text-align: center; margin-top: 16px;">${getText('noCustomPrompts')}</p>`;
    }
    
    // 自定義提示詞顯示完整內容和操作按鈕
    const promptCards = prompts.map((prompt, index) => `
      <div class="chatgpt-custom-prompt-card">
        <div class="chatgpt-custom-prompt-header">
          <span class="chatgpt-custom-prompt-title">${escapeHtml(prompt.name)}</span>
          <div class="chatgpt-prompt-actions">
            <button class="chatgpt-prompt-btn" data-prompt="${encodeURIComponent(prompt.text)}" data-prompt-name="${escapeHtml(prompt.name)}" data-prompt-category="${escapeHtml(currentCategory)}">${getText('insertBtn')}</button>
            <button class="chatgpt-edit-btn" data-index="${index}" title="${currentLanguage === 'zh' ? '編輯' : 'Edit'}">✏️</button>
            <button class="chatgpt-delete-btn" data-index="${index}" title="${currentLanguage === 'zh' ? '刪除' : 'Delete'}">🗑️</button>
          </div>
        </div>
        <p class="chatgpt-custom-prompt-text">${escapeHtml(trimText(prompt.text, 200))}</p>
      </div>
    `).join('');
    
    return `${addButton}${promptCards}`;
  } else {
    if (!prompts.length) {
      return `<p style="color: var(--muted); font-size: 13px; text-align: center;">${getText('noPrompts')}</p>`;
    }
    
    // 其他類別只顯示標題按鈕
    return prompts.map(prompt => `
      <div class="chatgpt-prompt-item" data-prompt="${encodeURIComponent(prompt.text)}" data-prompt-name="${escapeHtml(prompt.name)}" data-prompt-category="${escapeHtml(currentCategory)}">
        ${escapeHtml(prompt.name)}
      </div>
    `).join('');
  }
}

function closeSidebar() {
  if (sidebar) {
    sidebar.remove();
    sidebar = null;
  }
}

// 自定義提示詞管理
function loadCustomPrompts() {
  try {
    const stored = localStorage.getItem('customPrompts');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load custom prompts:', error);
    return [];
  }
}

function saveCustomPrompt(name, text, index = null) {
  const customPrompts = loadCustomPrompts();
  const promptData = { 
    name, 
    text, 
    mode: outputMode, 
    created: Date.now() 
  };
  
  if (index !== null) {
    customPrompts[index] = promptData;
  } else {
    customPrompts.push(promptData);
  }
  
  localStorage.setItem('customPrompts', JSON.stringify(customPrompts));
}

function editCustomPrompt(index) {
  const customPrompts = loadCustomPrompts();
  const prompt = customPrompts[index];
  if (!prompt) return;
  
  showCustomPromptDialog(prompt, index);
}

function deleteCustomPrompt(index) {
  const confirmText = currentLanguage === 'zh' ? '確定要刪除這個提示詞嗎？' : 'Are you sure you want to delete this prompt?';
  if (confirm(confirmText)) {
    const customPrompts = loadCustomPrompts();
    customPrompts.splice(index, 1);
    localStorage.setItem('customPrompts', JSON.stringify(customPrompts));
    updateSidebarContent();
  }
}

// 移除主題切換功能

function toggleLanguage() {
  currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
  localStorage.setItem('chatgptPromptLanguage', currentLanguage);
  
  // 更新當前類別到對應語言的第一個類別
  const categories = Object.keys(promptCategories[currentLanguage]);
  currentCategory = categories[0] || (currentLanguage === 'zh' ? '教師教學' : 'Teaching & Instruction');
  
  // 更新側邊欄內容
  updateSidebarContent();
  
  // 更新注入按鈕文字
  const injectBtn = document.getElementById(CHATGPT_BUTTON_ID);
  if (injectBtn) {
    injectBtn.textContent = currentLanguage === 'zh' ? '注入' : 'Inject';
    injectBtn.title = getText('toggleSidebar');
  }
}

function setOutputMode(mode) {
  outputMode = mode === 'gpts' ? 'gpts' : 'chat';
  localStorage.setItem('chatgptPromptOutputMode', outputMode);
  
  // 立即更新按鈕狀態
  document.querySelectorAll('.chatgpt-mode-btn').forEach(btn => {
    if (btn.getAttribute('data-mode') === outputMode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
}

// 提示詞插入
function getActiveEditor() {
  // 優先尋找 GPTs 指令區域的 textarea
  const textareas = document.querySelectorAll('textarea');
  for (const textarea of textareas) {
    if (textarea.offsetHeight > 100 && textarea.offsetWidth > 300 && 
        textarea.offsetParent !== null && !textarea.disabled && !textarea.readOnly) {
      return textarea;
    }
  }
  
  // 如果沒有找到 GPTs textarea，尋找一般對話輸入框
  const selectors = [
    'div[contenteditable="true"][data-testid="textbox"]',
    'textarea[placeholder*="Message"]',
    'div[contenteditable="true"]'
  ];
    
  for (const selector of selectors) {
    try {
      const elements = document.querySelectorAll(selector);
      for (const element of elements) {
        if (element && element.offsetParent !== null && 
            !element.disabled && !element.readOnly &&
            element.offsetWidth > 0 && element.offsetHeight > 0) {
          return element;
        }
      }
    } catch (error) {
      console.warn('Error selecting element:', selector, error);
    }
  }
  return null;
}

function insertPrompt(prompt, metadata = {}) {
  // 只有在自定義提示詞的GPTs模式才添加結構化格式
  const isCustomGPTs = currentCategory === (currentLanguage === 'zh' ? '自定義提示詞' : 'Custom Prompts') && outputMode === 'gpts';
  const preparedPrompt = isCustomGPTs ? buildGPTInstruction(prompt, metadata) : prompt;
  
  const editor = getActiveEditor();
  if (!editor) {
    alert(currentLanguage === 'zh' ? '找不到輸入框，請確認您在 ChatGPT 頁面上' : 'No input field found, please make sure you are on ChatGPT page');
    return;
  }
  
  try {
    // 清空並插入新內容
    if (editor.tagName === 'TEXTAREA') {
      editor.value = preparedPrompt;
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      editor.dispatchEvent(new Event('change', { bubbles: true }));
    } else {
      // 對於 contenteditable 元素，使用更可靠的方法
      editor.focus();
      
      // 清空現有內容
      if (document.execCommand) {
        document.execCommand('selectAll', false, null);
        document.execCommand('insertText', false, preparedPrompt);
      } else {
        // 現代瀏覽器的方法
        editor.textContent = preparedPrompt;
      }
      
      // 觸發事件
      editor.dispatchEvent(new Event('input', { bubbles: true }));
      editor.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // 關閉側邊欄
    setTimeout(() => {
      if (sidebar) closeSidebar();
    }, 100);
  } catch (error) {
    console.warn('Failed to insert prompt:', error);
    alert(currentLanguage === 'zh' ? '插入提示詞時發生錯誤' : 'Error inserting prompt');
  }
}

function buildGPTInstruction(promptText, metadata = {}) {
  const taskName = metadata.promptName || (currentLanguage === 'zh' ? '自訂任務' : 'Custom Task');
  const taskCategory = metadata.category || currentCategory || (currentLanguage === 'zh' ? '通用任務' : 'General Task');
  const trimmedPrompt = promptText.trim() || (currentLanguage === 'zh' ? '依使用者指示完成任務' : 'Complete task according to user instructions');
  
  const instructions = currentLanguage === 'zh' ? [
    '### System Instructions',
    `- Task Label: ${taskName}`,
    `- Persona: 專業教育與研究助理，擅長「${taskCategory}」，符合台灣108課綱素養導向精神。`,
    `- Action: 主要任務為「${trimmedPrompt}」，先釐清需求再執行，融入批判思考、創意思考與問題解決能力。`,
    '- Result: 產出可操作且可追溯的結果，必要時提供替代方案或限制，並連結真實情境。',
    '- Tone: 專業、親切並尊重使用者；明確標示假設與不確定性，鼓勵多元觀點。',
    '- Style: 遵循 PARTS（Persona、Action、Result、Tone、Style）並逐步呈現推理，促進深度學習。'
  ] : [
    '### System Instructions',
    `- Task Label: ${taskName}`,
    `- Persona: You are an expert educational consultant and research assistant specializing in "${taskCategory}", with deep knowledge of competency-based learning and modern pedagogical approaches.`,
    `- Action: Your primary task is to "${trimmedPrompt}". Always clarify user requirements first, then provide comprehensive solutions that integrate critical thinking, creativity, and problem-solving methodologies.`,
    '- Result: Deliver practical, actionable outcomes that users can immediately implement. When appropriate, offer alternative approaches or highlight potential limitations. Always connect theoretical concepts to real-world applications.',
    '- Tone: Maintain a professional yet approachable demeanor. Be transparent about assumptions and uncertainties. Encourage diverse perspectives and foster inclusive learning environments.',
    '- Style: Follow the PARTS framework (Persona, Action, Result, Tone, Style) while presenting clear, step-by-step reasoning. Promote deep learning through thoughtful questioning and scaffolded guidance.'
  ];
  
  return instructions.join('\n');
}

// AI 優化功能
async function optimizePromptWithAI(promptText, isGPTsMode) {
  if (!apiKey) {
    throw new Error('API Key not set');
  }
  
  const systemPrompt = isGPTsMode 
    ? (currentLanguage === 'zh' 
        ? '你是專業的 GPT 系統提示工程師。請使用「環境提示工程（Context Prompting）結合 Markdown」方法優化以下提示詞。輸出格式：使用 Markdown 結構化呈現，包含 ## 角色定位、## 核心任務、## 工作流程、## 輸出格式、## 限制條件等區塊，並融入豐富的上下文環境描述。請直接輸出優化結果。'
        : 'You are a professional GPT system prompt engineer. Please optimize the following prompt using "Context Prompting combined with Markdown" methodology. Output format: Use structured Markdown with sections like ## Role Definition, ## Core Tasks, ## Workflow, ## Output Format, ## Constraints, incorporating rich contextual environment descriptions. Output the optimized result directly.')
    : (currentLanguage === 'zh'
        ? '你是專業的提示詞優化師。請使用 PARTS 框架（Persona 角色、Action 行動、Result 結果、Tone 語調、Style 風格）優化以下提示詞，使其更清晰、具體和有效。請直接輸出優化後的結果。'
        : 'You are a professional prompt optimizer. Please optimize the following prompt using the PARTS framework (Persona, Action, Result, Tone, Style) to make it clearer, more specific and effective. Please output the optimized result directly.');
  
  const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{
        parts: [{
          text: systemPrompt + '\n\n原始提示詞：\n' + promptText
        }]
      }],
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 2048,
      }
    })
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    console.error('API Error:', errorText);
    throw new Error(`API request failed: ${response.status} - ${errorText}`);
  }
  
  const data = await response.json();
  
  if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts[0]) {
    return data.candidates[0].content.parts[0].text.trim();
  } else {
    console.error('Invalid API response:', data);
    throw new Error('Invalid API response format');
  }
}

// API Key 設定 - BYOK (Bring Your Own Key) 機制
// 注意：這是一個 BYOK 擴充功能，不會窪取開發者的 API Key
// 使用者必須輸入自己的 Gemini API Key，所有 API 調用都由使用者自行承擔
function showCustomPromptDialog(existingPrompt = null, editIndex = null) {
  const modal = document.createElement('div');
  const isGPTsMode = outputMode === 'gpts';
  const isEdit = existingPrompt !== null;
  const title = isEdit 
    ? (currentLanguage === 'zh' ? '📝 編輯提示詞' : '📝 Edit Prompt')
    : (currentLanguage === 'zh' ? '🎆 新增自定義提示詞' : '🎆 Add Custom Prompt');
  const optimizeText = isGPTsMode 
    ? (currentLanguage === 'zh' ? '⭐ AI優化（系統提示+Markdown）' : '⭐ AI Optimize (System Prompt + Markdown)')
    : (currentLanguage === 'zh' ? '⭐ AI優化（PARTS原則）' : '⭐ AI Optimize (PARTS Framework)');
  
  modal.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 20000; display: flex; justify-content: center; align-items: center;">
      <div style="background: white; color: black; width: 500px; padding: 20px; border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <h3 style="margin-top: 0;">${title}</h3>
        <input id="promptName" type="text" placeholder="${currentLanguage === 'zh' ? '🏷️ 提示詞名稱' : '🏷️ Prompt Name'}" value="${isEdit ? escapeHtml(existingPrompt.name) : ''}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px; box-sizing: border-box;">
        <textarea id="promptText" placeholder="${currentLanguage === 'zh' ? '📝 輸入提示詞內容...' : '📝 Enter prompt content...'}" style="width: 100%; height: 200px; padding: 10px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px; box-sizing: border-box; resize: vertical;">${isEdit ? escapeHtml(existingPrompt.text) : ''}</textarea>
        <div style="display: flex; gap: 10px; justify-content: space-between; align-items: center;">
          <button id="optimizePrompt" style="padding: 8px 12px; border-radius: 8px; border: 1px solid #f59e0b; background: #fef3c7; color: #92400e; cursor: pointer; font-size: 12px; ${!apiKey ? 'opacity: 0.5; cursor: not-allowed;' : ''}" ${!apiKey ? 'disabled' : ''}>${optimizeText}</button>
          <div style="display: flex; gap: 10px;">
            <button id="cancelPrompt" style="padding: 8px 14px; border-radius: 8px; border: 1px solid #ddd; background: #f5f5f5; cursor: pointer;">❌ ${currentLanguage === 'zh' ? '取消' : 'Cancel'}</button>
            <button id="savePrompt" style="padding: 8px 16px; border-radius: 8px; border: 1px solid #111; background: #111; color: white; cursor: pointer; font-weight: 600;">✅ ${currentLanguage === 'zh' ? '儲存' : 'Save'}</button>
          </div>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  document.getElementById('cancelPrompt').addEventListener('click', () => modal.remove());
  
  document.getElementById('optimizePrompt').addEventListener('click', async () => {
    if (!apiKey) {
      alert(currentLanguage === 'zh' ? '請先設定 Gemini API Key' : 'Please set Gemini API Key first');
      return;
    }
    
    const promptText = document.getElementById('promptText').value.trim();
    if (!promptText) {
      alert(currentLanguage === 'zh' ? '請先輸入提示詞內容' : 'Please enter prompt content first');
      return;
    }
    
    const optimizeBtn = document.getElementById('optimizePrompt');
    const originalText = optimizeBtn.textContent;
    optimizeBtn.textContent = currentLanguage === 'zh' ? '🔄 優化中...' : '🔄 Optimizing...';
    optimizeBtn.disabled = true;
    
    try {
      const optimizedPrompt = await optimizePromptWithAI(promptText, isGPTsMode);
      document.getElementById('promptText').value = optimizedPrompt;
      alert(currentLanguage === 'zh' ? '✅ 提示詞已優化！' : '✅ Prompt optimized!');
    } catch (error) {
      console.error('Optimization error:', error);
      alert(currentLanguage === 'zh' ? '❌ 優化失敗，請檢查 API Key 或網路連線' : '❌ Optimization failed, please check API Key or network');
    } finally {
      optimizeBtn.textContent = originalText;
      optimizeBtn.disabled = false;
    }
  });
  
  document.getElementById('savePrompt').addEventListener('click', () => {
    const name = document.getElementById('promptName').value.trim();
    const text = document.getElementById('promptText').value.trim();
    if (name && text) {
      saveCustomPrompt(name, text, editIndex);
      alert(currentLanguage === 'zh' ? '✅ 提示詞已儲存！' : '✅ Prompt saved!');
      modal.remove();
      updateSidebarContent();
    } else {
      alert(currentLanguage === 'zh' ? '請填寫完整資訊' : 'Please fill in all fields');
    }
  });
}

function showApiKeyDialog() {
  const modal = document.createElement('div');
  const hasExistingKey = !!apiKey;
  const privacyNote = currentLanguage === 'zh' 
    ? 'ℹ️ 隱私保護：您的 API Key 僅儲存在本地瀏覽器，不會傳送給開發者。'
    : 'ℹ️ Privacy: Your API Key is stored locally in your browser only and never sent to the developer.';
  
  const statusNote = hasExistingKey 
    ? (currentLanguage === 'zh' ? '✅ API Key 已設定並記憶' : '✅ API Key is set and remembered')
    : (currentLanguage === 'zh' ? '⚠️ 尚未設定 API Key' : '⚠️ API Key not set yet');
  
  const statusColor = hasExistingKey ? '#10b981' : '#f59e0b';
  
  modal.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(0,0,0,0.5); z-index: 20000; display: flex; justify-content: center; align-items: center;">
      <div style="background: white; color: black; width: 400px; padding: 20px; border-radius: 12px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
        <h3 style="margin-top: 0;">${getText('apiKeyTitle')}</h3>
        <div style="background: ${hasExistingKey ? '#f0fdf4' : '#fffbeb'}; border: 1px solid ${statusColor}; border-radius: 8px; padding: 12px; margin: 15px 0; font-size: 13px; color: ${hasExistingKey ? '#166534' : '#92400e'};">
          ${statusNote}
        </div>
        <p style="color: #666; font-size: 14px;">${getText('apiKeyDesc')}</p>
        <div style="background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 8px; padding: 12px; margin: 15px 0; font-size: 13px; color: #0c4a6e;">
          ${privacyNote}
        </div>
        <input id="apiKeyInput" type="password" placeholder="${hasExistingKey ? (currentLanguage === 'zh' ? '輸入新的 API Key 以更新' : 'Enter new API Key to update') : getText('apiKeyPlaceholder')}" value="${hasExistingKey ? '••••••••••••••••' : ''}" style="width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 15px; box-sizing: border-box;">
        <div style="display: flex; gap: 10px; justify-content: flex-end;">
          ${hasExistingKey ? `<button id="clearApiKey" style="padding: 8px 14px; border-radius: 8px; border: 1px solid #ef4444; background: #fef2f2; color: #dc2626; cursor: pointer;">${currentLanguage === 'zh' ? '🗑️ 清除' : '🗑️ Clear'}</button>` : ''}
          <button id="cancelApiKey" style="padding: 8px 14px; border-radius: 8px; border: 1px solid #ddd; background: #f5f5f5; cursor: pointer;">${getText('cancel')}</button>
          <button id="saveApiKey" style="padding: 8px 16px; border-radius: 8px; border: 1px solid #111; background: #111; color: white; cursor: pointer; font-weight: 600;">${hasExistingKey ? (currentLanguage === 'zh' ? '🔄 更新' : '🔄 Update') : getText('save')}</button>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
  
  // 清空輸入框當用戶點擊時
  const apiKeyInput = document.getElementById('apiKeyInput');
  if (hasExistingKey) {
    apiKeyInput.addEventListener('focus', () => {
      if (apiKeyInput.value === '••••••••••••••••') {
        apiKeyInput.value = '';
      }
    });
  }
  
  document.getElementById('cancelApiKey').addEventListener('click', () => modal.remove());
  
  if (hasExistingKey) {
    document.getElementById('clearApiKey').addEventListener('click', () => {
      if (confirm(currentLanguage === 'zh' ? '確定要清除已儲存的 API Key 嗎？' : 'Are you sure you want to clear the saved API Key?')) {
        apiKey = '';
        localStorage.removeItem('geminiApiKey');
        modal.remove();
        alert(currentLanguage === 'zh' ? '✅ API Key 已清除' : '✅ API Key cleared');
        updateSidebarContent();
      }
    });
  }
  
  document.getElementById('saveApiKey').addEventListener('click', () => {
    const key = document.getElementById('apiKeyInput').value.trim();
    if (key && key !== '••••••••••••••••') {
      apiKey = key;
      localStorage.setItem('geminiApiKey', key);
      modal.remove();
      alert(currentLanguage === 'zh' ? '✅ API Key 已儲存並記憶！' : '✅ API Key saved and remembered!');
      updateSidebarContent();
    } else if (hasExistingKey && (key === '••••••••••••••••' || key === '')) {
      modal.remove();
    } else {
      alert(currentLanguage === 'zh' ? '請輸入有效的 API Key' : 'Please enter a valid API Key');
    }
  });
}

// 消息監聽
chrome?.runtime?.onMessage?.addListener((request, sender, sendResponse) => {
  if (request.action === "toggleSidebar") {
    sidebar ? closeSidebar() : createSidebar();
    sendResponse({status: "success"});
  }
  return true;
});

// 初始化
function initializeExtension() {
  const observer = new MutationObserver(() => {
    try {
      if (!document.getElementById(CHATGPT_BUTTON_ID)) {
        // 嘗試多種按鈕注入位置
        let targetElement = null;
        let insertPosition = 'before';
        
        // 1. 一般對話頁面的發送按鈕
        const sendButton = document.querySelector('button[data-testid="send-button"]');
        if (sendButton && sendButton.parentElement) {
          targetElement = sendButton;
          insertPosition = 'before';
        }
        
        // 2. GPTs 指令區域的 textarea
        if (!targetElement) {
          const instructionTextareas = document.querySelectorAll('textarea');
          for (const textarea of instructionTextareas) {
            // 找到指令區域的 textarea（通常是最大的那個）
            if (textarea.offsetHeight > 100 && textarea.offsetWidth > 300) {
              const container = textarea.parentElement;
              if (container) {
                targetElement = container;
                insertPosition = 'append';
                break;
              }
            }
          }
        }
        
        // 3. 通用的輸入框區域
        if (!targetElement) {
          const inputContainer = document.querySelector('div[contenteditable="true"]');
          if (inputContainer) {
            let container = inputContainer.parentElement;
            let attempts = 0;
            while (container && attempts < 3) {
              if (container.classList.contains('flex') || container.tagName === 'FORM') {
                targetElement = container;
                insertPosition = 'append';
                break;
              }
              container = container.parentElement;
              attempts++;
            }
          }
        }
        
        if (targetElement) {
          const button = document.createElement('button');
          button.id = CHATGPT_BUTTON_ID;
          button.innerHTML = '📚';
          button.title = getText('toggleSidebar');
          button.type = 'button';
          
          Object.assign(button.style, {
            margin: '4px',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            border: '1px solid #d1d5db',
            background: '#ffffff',
            color: '#374151',
            cursor: 'pointer',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s',
            position: 'relative',
            zIndex: '1000',
            flexShrink: '0'
          });
          
          button.addEventListener('mouseenter', () => {
            button.style.background = '#f3f4f6';
            button.style.borderColor = '#10b981';
          });
          
          button.addEventListener('mouseleave', () => {
            button.style.background = '#ffffff';
            button.style.borderColor = '#d1d5db';
          });
          
          button.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            if (sidebar) {
              closeSidebar();
            } else {
              createSidebar();
            }
          });
          
          try {
            if (insertPosition === 'before' && targetElement.parentElement) {
              targetElement.parentElement.insertBefore(button, targetElement);
            } else {
              const wrapper = document.createElement('div');
              wrapper.style.cssText = 'display: flex; align-items: center; gap: 8px; margin-top: 8px;';
              wrapper.appendChild(button);
              targetElement.appendChild(wrapper);
            }
          } catch {}
        }
      }
    } catch {}
  });
  
  observer.observe(document.body, { childList: true, subtree: true });
  setTimeout(() => observer.disconnect(), 15000);
}

// 初始化
document.readyState === 'loading' ? document.addEventListener('DOMContentLoaded', initializeExtension) : initializeExtension();
