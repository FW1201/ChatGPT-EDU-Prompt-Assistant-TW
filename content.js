(() => {
  if (!['chatgpt.com','chat.openai.com'].includes(location.hostname) || /^\/(?:gpts|g\/[^/]+\/(?:editor|configure))(?:\/|$)/.test(location.pathname)) return;
  const pending=new Map();
  const visible=element=>element && !element.disabled && !element.readOnly && !element.closest('[hidden],[aria-hidden="true"],[inert],[role="dialog"],[role="search"]') && getComputedStyle(element).visibility!=='hidden' && element.getClientRects().length>0;
  function editor() {
    // Never use arbitrary textareas: search/settings dialogs must not receive prompts.
    const selectors=['#prompt-textarea[contenteditable="true"]','textarea#prompt-textarea','form [contenteditable="true"][data-testid="textbox"]','form textarea[data-testid="prompt-textarea"]','[data-composer-input] [contenteditable="true"][role="textbox"][data-composer-markdown]','[data-composer-body] [contenteditable="true"][role="textbox"]'];
    for(const selector of selectors) {
      const candidate=[...document.querySelectorAll(selector)].find(visible);
      if(candidate) return candidate;
    }
    return null;
  }
  function read(el) {
    if(el.tagName==='TEXTAREA')return el.value.replace(/\r\n/g,'\n');
    // ProseMirror paragraphs represent single line breaks. innerText adds CSS-dependent
    // blank lines between paragraphs and can falsely report a successful write as failed.
    const block=node=>node.nodeType===1&&/^(P|DIV|LI|PRE|BLOCKQUOTE)$/.test(node.tagName);
    const text=node=>{
      if(node.nodeType===3)return node.textContent;
      if(node.nodeType!==1)return '';
      if(node.tagName==='BR')return node.classList.contains('ProseMirror-trailingBreak')?'':'\n';
      const children=[...node.childNodes];
      if(children.length===1&&children[0].nodeName==='BR')return '';
      return children.map((child,i)=>(i&&(block(child)||block(children[i-1]))?'\n':'')+text(child)).join('');
    };
    return text(el).replace(/\r\n/g,'\n');
  }
  function write(el,text) {
    el.focus();
    if(el.tagName==='TEXTAREA') {
      Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype,'value').set.call(el,text);
    } else {
      const selection=getSelection(),range=document.createRange();range.selectNodeContents(el);selection.removeAllRanges();selection.addRange(range);
      if(!document.execCommand('insertText',false,text)) {
        // Plain text DOM nodes only. Never interpret prompt content as markup.
        el.replaceChildren(document.createTextNode(text));
      }
    }
    el.dispatchEvent(new InputEvent('input',{bubbles:true,inputType:'insertText',data:text}));
    el.dispatchEvent(new Event('change',{bubbles:true}));
  }
  chrome.runtime.onMessage.addListener((request,sender,respond)=>{
    if(sender.id!==chrome.runtime.id) return false;
    if(request.type==='prepareInsert') {
      if(typeof request.text!=='string'||!request.text.trim()||request.text.length>150000) {respond({status:'invalid-prompt'});return false;}
      const target=editor();
      if(!target) {respond({status:'not-found'});return false;}
      for(const [key,value] of pending) if(value.expires<Date.now()) pending.delete(key);
      const token=crypto.randomUUID(),draft=read(target);
      pending.set(token,{target,draft,text:request.text,url:location.href,expires:Date.now()+120000});
      respond({status:'prepared',token,hasDraft:Boolean(draft.trim())});return false;
    }
    if(request.type==='cancelInsert') {pending.delete(request.token);respond({status:'cancelled'});return false;}
    if(request.type!=='commitInsert') return false;
    const entry=pending.get(request.token);pending.delete(request.token);
    if(!entry||entry.expires<Date.now()) {respond({status:'expired'});return false;}
    if(entry.url!==location.href||!entry.target.isConnected||entry.target!==editor()||read(entry.target)!==entry.draft) {respond({status:'changed'});return false;}
    try {
      write(entry.target,entry.text);
      // Let controlled editors reconcile before reporting success.
      setTimeout(()=>{
        if(!entry.target.isConnected||entry.url!==location.href) {respond({status:'changed'});return;}
        respond({status:read(entry.target).replace(/\r\n/g,'\n')===entry.text.replace(/\r\n/g,'\n')?'success':'failed'});
      },80);
    } catch {respond({status:'failed'});}
    return true;
  });
})();
