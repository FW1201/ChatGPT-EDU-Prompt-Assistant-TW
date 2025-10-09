const texts = {
  zh: { title: 'Prompt 助手', button: '開啟提示詞面板', note: '已針對 ChatGPT 介面最佳化', toggle: 'EN' },
  en: { title: 'Prompt Assistant', button: 'Open Prompt Panel', note: 'Optimized for ChatGPT interface', toggle: '中' }
};

let currentLang = localStorage.getItem('chatgptPromptLanguage') || 'zh';

function updateUI(lang) {
  const t = texts[lang];
  document.getElementById('title').textContent = t.title;
  document.getElementById('toggleSidebar').textContent = t.button;
  document.getElementById('note').textContent = t.note;
  document.getElementById('langToggle').textContent = t.toggle;
}

// 主題切換
const applyTheme = () => document.body.className = matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
applyTheme();
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', applyTheme);

// 初始化
updateUI(currentLang);

// 事件監聽
document.getElementById('langToggle').onclick = () => {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  localStorage.setItem('chatgptPromptLanguage', currentLang);
  updateUI(currentLang);
};

document.getElementById('toggleSidebar').onclick = async () => {
  try {
    const [tab] = await chrome.tabs.query({active: true, currentWindow: true});
    tab?.id && await chrome.tabs.sendMessage(tab.id, {action: "toggleSidebar"});
  } catch {}
  window.close();
};