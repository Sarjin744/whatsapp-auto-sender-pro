// WhatsApp Auto-Sender Content Script

(function () {
  // Prevent duplicate injections
  if (document.getElementById('wa-sender-panel')) return;

  // 1. Create and Inject HTML UI
  const uiContainer = document.createElement('div');
  uiContainer.id = 'wa-sender-ui-wrapper';
  uiContainer.innerHTML = `
    <div class="wa-sender-panel collapsed" id="wa-sender-panel">
      <div class="wa-sender-header">
        <h3 class="wa-sender-title">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: middle;"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
          WA Auto-Sender Pro
        </h3>
        <button class="wa-sender-close-btn" id="wa-sender-close-btn">&times;</button>
      </div>

      <!-- Mode Selection Tabs -->
      <div class="wa-sender-tabs">
        <button class="wa-sender-tab active" id="wa-tab-single">Single Chat</button>
        <button class="wa-sender-tab" id="wa-tab-bulk">Bulk Send</button>
      </div>

      <div class="wa-sender-body">
        
        <!-- Tab 1 Content: Single Chat Mode -->
        <div class="wa-sender-tab-content active" id="wa-content-single">
          <div class="wa-sender-group">
            <label class="wa-sender-label">Message Template</label>
            <textarea class="wa-sender-textarea" id="wa-sender-msg-single" placeholder="Hello {friend|buddy|mate}! How is {your day|it going}?"></textarea>
            <div class="wa-sender-tip">Supports Spintax {A|B|C} for random variations.</div>
          </div>
          <div class="wa-sender-group">
            <label class="wa-sender-label">Send Count</label>
            <input class="wa-sender-input" type="number" id="wa-sender-count-single" value="100" min="1">
          </div>
        </div>

        <!-- Tab 2 Content: Bulk Send Mode -->
        <div class="wa-sender-tab-content" id="wa-content-bulk">
          <div class="wa-sender-group">
            <label class="wa-sender-label">Recipients List (CSV / Numbers)</label>
            <textarea class="wa-sender-textarea" id="wa-sender-numbers" style="min-height: 80px;" placeholder="919876543210, John&#10;919999888888, Sarah"></textarea>
            <div class="wa-sender-tip">Format: phone,name (one per line). Include country code.</div>
          </div>
          <div class="wa-sender-group">
            <label class="wa-sender-label">Bulk Message Template</label>
            <textarea class="wa-sender-textarea" id="wa-sender-msg-bulk" placeholder="Hello {name}! Here is your code: {1234|5678}."></textarea>
            <div class="wa-sender-tip">Use {name} to personalize, and Spintax {A|B} for variations.</div>
          </div>
        </div>

        <!-- General Speed / Delay Settings (Shared) -->
        <div class="wa-sender-input-row">
          <div class="wa-sender-group">
            <label class="wa-sender-label">Min Delay (s)</label>
            <input class="wa-sender-input" type="number" id="wa-sender-min-delay" value="0.5" min="0.05" step="0.1">
          </div>
          <div class="wa-sender-group">
            <label class="wa-sender-label">Max Delay (s)</label>
            <input class="wa-sender-input" type="number" id="wa-sender-max-delay" value="1.5" min="0.05" step="0.1">
          </div>
        </div>

        <!-- Cooldown / Anti-Ban Break settings -->
        <div class="wa-sender-checkbox-row" id="wa-cooldown-toggle-row">
          <input type="checkbox" id="wa-cooldown-enable">
          <label for="wa-cooldown-enable" style="user-select:none; font-weight:600; color:#e9edef;">Enable Cooldown Break</label>
        </div>
        <div class="wa-sender-cooldown-subrow" id="wa-cooldown-inputs" style="display:none;">
          <div class="wa-sender-group">
            <label class="wa-sender-label">Every (msgs)</label>
            <input class="wa-sender-input" type="number" id="wa-cooldown-after" value="10" min="1">
          </div>
          <div class="wa-sender-group">
            <label class="wa-sender-label">Break (sec)</label>
            <input class="wa-sender-input" type="number" id="wa-cooldown-duration" value="30" min="5">
          </div>
        </div>

        <div class="wa-sender-warning-box">
          ⚠️ Avoid sending too fast. Keep minimum delay above 0.5s and enable Cooldowns to minimize WhatsApp account bans.
        </div>

        <div class="wa-sender-actions">
          <button class="wa-sender-btn wa-sender-btn-start" id="wa-sender-start-btn">Start</button>
          <button class="wa-sender-btn wa-sender-btn-pause" id="wa-sender-pause-btn" disabled>Pause</button>
          <button class="wa-sender-btn wa-sender-btn-stop" id="wa-sender-stop-btn" disabled>Stop</button>
        </div>

        <!-- Progress Meter -->
        <div class="wa-sender-progress-container" id="wa-sender-progress-box">
          <div class="wa-sender-progress-header">
            <span id="wa-sender-progress-label">Progress</span>
            <span id="wa-sender-progress-percent">0%</span>
          </div>
          <div class="wa-sender-progress-bar-bg">
            <div class="wa-sender-progress-bar-fill" id="wa-sender-progress-fill"></div>
          </div>
          <div class="wa-sender-status-text" id="wa-sender-status-msg">Sent 0 of 100</div>
        </div>

        <!-- Live Console Terminal -->
        <div class="wa-sender-log-container">
          <div class="wa-sender-log-header">
            <label class="wa-sender-label">Activity Console</label>
            <button class="wa-sender-log-clear-btn" id="wa-sender-clear-logs">Clear</button>
          </div>
          <div class="wa-sender-terminal" id="wa-sender-console">
            <div class="wa-sender-log-entry info">Console initialized. Ready to send.</div>
          </div>
        </div>
      </div>
    </div>

    <button class="wa-sender-toggle-trigger" id="wa-sender-toggle-btn">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" style="vertical-align: middle;"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>
    </button>
  `;
  document.body.appendChild(uiContainer);

  // 2. Query UI Elements
  const panelEl = document.getElementById('wa-sender-panel');
  const toggleBtn = document.getElementById('wa-sender-toggle-btn');
  const closeBtn = document.getElementById('wa-sender-close-btn');
  const startBtn = document.getElementById('wa-sender-start-btn');
  const pauseBtn = document.getElementById('wa-sender-pause-btn');
  const stopBtn = document.getElementById('wa-sender-stop-btn');

  // Tabs
  const tabSingle = document.getElementById('wa-tab-single');
  const tabBulk = document.getElementById('wa-tab-bulk');
  const contentSingle = document.getElementById('wa-content-single');
  const contentBulk = document.getElementById('wa-content-bulk');

  // Inputs Single
  const msgSingleEl = document.getElementById('wa-sender-msg-single');
  const countSingleEl = document.getElementById('wa-sender-count-single');

  // Inputs Bulk
  const numbersEl = document.getElementById('wa-sender-numbers');
  const msgBulkEl = document.getElementById('wa-sender-msg-bulk');

  // Cooldown Inputs
  const cooldownEnableEl = document.getElementById('wa-cooldown-enable');
  const cooldownInputsDiv = document.getElementById('wa-cooldown-inputs');
  const cooldownAfterEl = document.getElementById('wa-cooldown-after');
  const cooldownDurationEl = document.getElementById('wa-cooldown-duration');

  // Shared Delay Inputs
  const minDelayEl = document.getElementById('wa-sender-min-delay');
  const maxDelayEl = document.getElementById('wa-sender-max-delay');
  
  // Progress Box
  const progressBox = document.getElementById('wa-sender-progress-box');
  const progressLabel = document.getElementById('wa-sender-progress-label');
  const progressFill = document.getElementById('wa-sender-progress-fill');
  const progressPercent = document.getElementById('wa-sender-progress-percent');
  const statusMsg = document.getElementById('wa-sender-status-msg');
  
  // Console
  const consoleEl = document.getElementById('wa-sender-console');
  const clearLogsBtn = document.getElementById('wa-sender-clear-logs');

  // 3. State Variables
  let currentMode = 'single'; // 'single' or 'bulk'
  let sending = false;
  let paused = false;
  let messageIndex = 0;
  let totalMessages = 0;
  let timerId = null;

  // Utility helper to wait
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  // 4. Tab Switching UI Logic
  tabSingle.addEventListener('click', () => {
    if (sending) return;
    currentMode = 'single';
    tabSingle.classList.add('active');
    tabBulk.classList.remove('active');
    contentSingle.classList.add('active');
    contentBulk.classList.remove('active');
  });

  tabBulk.addEventListener('click', () => {
    if (sending) return;
    currentMode = 'bulk';
    tabBulk.classList.add('active');
    tabSingle.classList.remove('active');
    contentBulk.classList.add('active');
    contentSingle.classList.remove('active');
  });

  // Toggle Cooldown sub-inputs
  cooldownEnableEl.addEventListener('change', () => {
    cooldownInputsDiv.style.display = cooldownEnableEl.checked ? 'grid' : 'none';
  });

  // Open/Close Panel
  toggleBtn.addEventListener('click', () => {
    panelEl.classList.remove('collapsed');
    toggleBtn.classList.add('hidden');
  });

  closeBtn.addEventListener('click', () => {
    panelEl.classList.add('collapsed');
    setTimeout(() => {
      toggleBtn.classList.remove('hidden');
    }, 200);
  });

  // 5. Console Log Helper
  function logToTerminal(text, type = 'default') {
    const timestamp = new Date().toLocaleTimeString();
    const entry = document.createElement('div');
    entry.className = `wa-sender-log-entry ${type}`;
    entry.textContent = `[${timestamp}] ${text}`;
    consoleEl.appendChild(entry);
    consoleEl.scrollTop = consoleEl.scrollHeight;
    
    // Cap logs at 100 entries to prevent memory leak
    if (consoleEl.children.length > 100) {
      consoleEl.removeChild(consoleEl.firstChild);
    }
  }

  clearLogsBtn.addEventListener('click', () => {
    consoleEl.innerHTML = '';
    logToTerminal('Console cleared.', 'info');
  });

  // 6. Spintax Parser
  function parseSpintax(text) {
    const spintaxPattern = /\{([^{}]+)\}/g;
    while (spintaxPattern.test(text)) {
      text = text.replace(spintaxPattern, (match, optionsString) => {
        const choices = optionsString.split('|');
        return choices[Math.floor(Math.random() * choices.length)];
      });
    }
    return text;
  }

  // Parses pasted numbers: number,name or just number (keeps only digits for WhatsApp URL compatibility)
  function parseNumbersList(text) {
    const lines = text.split('\n');
    const contacts = [];
    for (let line of lines) {
      line = line.trim();
      if (!line) continue;
      const parts = line.split(',');
      let phone = parts[0].replace(/[^\d]/g, ''); // keep only digits (removes spaces, dashes, +)
      let name = parts[1] ? parts[1].trim() : 'Friend';
      if (phone) {
        contacts.push({ phone, name });
      }
    }
    return contacts;
  }

  // 7. Find Chat Input & Send Button (Robust selectors for WhatsApp Web)
  function findChatInput() {
    const selectors = [
      '#main div[contenteditable="true"]',
      'div[contenteditable="true"][role="textbox"]',
      'div[contenteditable="true"][data-tab="10"]',
      'footer div[contenteditable="true"]',
      'div[contenteditable="true"]'
    ];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) return el;
    }
    return null;
  }

  function findSendButton() {
    const selectors = [
      'button[aria-label="Send"]',
      'button[title="Send"]',
      'span[data-icon="send"]',
      'button[data-testid="conversation-panel-send"]',
      'button span[data-icon="send"]',
      'div[role="button"] span[data-icon="send"]'
    ];
    for (const selector of selectors) {
      const el = document.querySelector(selector);
      if (el) {
        return el.tagName === 'SPAN' ? (el.closest('button') || el) : el;
      }
    }
    // Fallback: Find the last button/div[role="button"] in the footer ONLY if it's not a microphone button
    const footer = document.querySelector('footer');
    if (footer) {
      const buttons = footer.querySelectorAll('button, div[role="button"]');
      if (buttons.length > 0) {
        const lastBtn = buttons[buttons.length - 1];
        const isMic = lastBtn.querySelector('span[data-icon="ptt"]') || 
                      lastBtn.querySelector('span[data-icon="ptt-one-click"]') || 
                      lastBtn.querySelector('span[data-icon="audio"]') || 
                      lastBtn.getAttribute('aria-label')?.toLowerCase().includes('record') ||
                      lastBtn.getAttribute('aria-label')?.toLowerCase().includes('voice') ||
                      lastBtn.getAttribute('title')?.toLowerCase().includes('record') ||
                      lastBtn.getAttribute('title')?.toLowerCase().includes('voice');
        if (!isMic) {
          return lastBtn;
        }
      }
    }
    return null;
  }

  // Polls for the Send button to appear (e.g. while React finishes rendering)
  async function waitForSendButton(timeoutMs = 2500) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const btn = findSendButton();
      if (btn) return btn;
      await sleep(100);
    }
    return null;
  }

  // Types message into the chat input, focusing and dispatching all necessary events for React
  async function typeMessage(chatInput, text) {
    chatInput.focus();
    
    // Clear any existing text
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    
    // Dispatch focus event
    chatInput.dispatchEvent(new Event('focus', { bubbles: true }));
    
    // Insert text
    const success = document.execCommand('insertText', false, text);
    if (!success) {
      chatInput.innerHTML = '';
      const textNode = document.createTextNode(text);
      chatInput.appendChild(textNode);
    }
    
    // Dispatch input and change events so React captures it
    chatInput.dispatchEvent(new Event('input', { bubbles: true }));
    chatInput.dispatchEvent(new Event('change', { bubbles: true }));
    
    // Trigger keyboard events for final confirmation
    chatInput.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true, key: 'a' }));
    chatInput.dispatchEvent(new KeyboardEvent('keypress', { bubbles: true, key: 'a' }));
    chatInput.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true, key: 'a' }));
    
    // Wait a brief moment for React rendering cycles to complete
    await sleep(300);
  }

  function truncate(str, n) {
    return (str.length > n) ? str.substr(0, n - 1) + '...' : str;
  }

  // 8. Progress Bar Updates
  function updateProgressBar() {
    const percentage = Math.round((messageIndex / totalMessages) * 100);
    progressFill.style.width = `${percentage}%`;
    progressPercent.textContent = `${percentage}%`;
    statusMsg.textContent = `Sent ${messageIndex} of ${totalMessages}`;
  }

  // 9. Single Chat Mode Loop
  async function sendNextSingleMessage() {
    if (!sending) return;
    if (paused) return;

    if (messageIndex >= totalMessages) {
      finishSending();
      return;
    }

    const chatInput = findChatInput();
    if (!chatInput) {
      logToTerminal('Error: Chat input box not found. Please click inside a WhatsApp chat text box.', 'error');
      pauseSending();
      return;
    }

    try {
      const rawTemplate = msgSingleEl.value;
      if (!rawTemplate) {
        logToTerminal('Error: Message template is empty.', 'error');
        stopSending();
        return;
      }

      // Parse Spintax variables
      const finalMessage = parseSpintax(rawTemplate);

      // Type the message safely
      await typeMessage(chatInput, finalMessage);

      // Wait a short delay for DOM rendering to complete
      await sleep(500);

      // Wait up to 2.5 seconds for the send button to render
      const sendBtn = await waitForSendButton(2500);
      if (!sendBtn) {
        logToTerminal('Error: Send button not found. Please click inside the chat box manually and try again.', 'error');
        pauseSending();
        return;
      }

      // Click the Send button
      sendBtn.click();

      messageIndex++;
      updateProgressBar();
      logToTerminal(`[${messageIndex}/${totalMessages}] Sent: "${truncate(finalMessage, 20)}"`, 'success');

      if (messageIndex >= totalMessages) {
        finishSending();
        return;
      }

      // Check if Cooldown Break should trigger
      if (cooldownEnableEl.checked) {
        const cooldownAfter = parseInt(cooldownAfterEl.value, 10) || 10;
        const cooldownDuration = parseInt(cooldownDurationEl.value, 10) || 30;
        if (messageIndex % cooldownAfter === 0) {
          logToTerminal(`🛡️ Cooldown Break: Resting for ${cooldownDuration}s to bypass anti-spam filters...`, 'warning');
          timerId = setTimeout(sendNextSingleMessage, cooldownDuration * 1000);
          return;
        }
      }

      // Calculate next random delay
      const minD = Math.max(0.05, parseFloat(minDelayEl.value) || 0.5);
      const maxD = Math.max(minD, parseFloat(maxDelayEl.value) || 1.5);
      const delay = Math.random() * (maxD - minD) + minD;

      logToTerminal(`Waiting ${delay.toFixed(2)}s for next send...`, 'info');
      timerId = setTimeout(sendNextSingleMessage, delay * 1000);

    } catch (e) {
      logToTerminal(`System Error: ${e.message}`, 'error');
      pauseSending();
    }
  }

  // Helper to check if two URLs point to the same phone chat
  function isSamePhone(url1, url2) {
    const getPhone = (url) => {
      const match = url.match(/phone=(\d+)/);
      return match ? match[1] : '';
    };
    const p1 = getPhone(url1);
    const p2 = getPhone(url2);
    return p1 && p2 && p1 === p2;
  }

  // Checks if the open chat in WhatsApp Web matches the contact's name or phone
  function isActiveChat(contact) {
    const mainHeader = document.querySelector('#main header');
    if (!mainHeader) return false;
    
    const titleEl = mainHeader.querySelector('span[title], div[title]');
    if (!titleEl) return false;
    
    const activeTitle = titleEl.getAttribute('title')?.trim();
    if (!activeTitle) return false;
    
    const clean = (str) => str.replace(/[^\d\w]/g, '').toLowerCase();
    
    const activeClean = clean(activeTitle);
    const targetNameClean = clean(contact.name);
    const targetPhoneClean = clean(contact.phone);
    
    // Check if header title matches target name, target phone, or containing patterns
    return activeClean === targetNameClean || 
           activeClean === targetPhoneClean || 
           activeClean.includes(targetPhoneClean) || 
           targetPhoneClean.includes(activeClean);
  }

  // Navigates to a contact's chat, or directly triggers logic if already on the correct page
  function navigateToContact(contact) {
    const targetUrl = `https://web.whatsapp.com/send?phone=${contact.phone}`;
    
    // Avoid reloading if we are already in the correct chat or on the correct URL path
    if (isActiveChat(contact) || isSamePhone(window.location.href, targetUrl)) {
      logToTerminal(`Already on chat page for ${contact.name}. Executing send directly...`, 'info');
      setTimeout(checkActiveBulkJob, 1200);
    } else {
      logToTerminal(`Navigating to recipient: ${contact.phone} (${contact.name})...`, 'info');
      window.location.href = targetUrl;
    }
  }

  // 10. Start Automation Trigger
  function startSending() {
    if (currentMode === 'single') {
      const rawTemplate = msgSingleEl.value.trim();
      if (!rawTemplate) {
        logToTerminal('Error: Please enter a message template.', 'error');
        return;
      }

      const inputCount = parseInt(countSingleEl.value, 10);
      if (isNaN(inputCount) || inputCount < 1) {
        logToTerminal('Error: Invalid send count.', 'error');
        return;
      }

      if (!findChatInput()) {
        logToTerminal('Error: Chat input box not found. Make sure you are in a chat on WhatsApp Web.', 'error');
        return;
      }

      sending = true;
      paused = false;
      totalMessages = inputCount;
      
      if (messageIndex >= totalMessages || messageIndex === 0) {
        messageIndex = 0;
        consoleEl.innerHTML = '';
        logToTerminal(`Starting Single Chat job. Total: ${totalMessages} messages.`, 'info');
      } else {
        logToTerminal(`Resuming Single Chat job from ${messageIndex}/${totalMessages}.`, 'info');
      }

      toggleControlsDisabled(true);
      progressLabel.textContent = 'Single Chat Progress';
      progressBox.style.display = 'block';
      updateProgressBar();

      sendNextSingleMessage();
    } else {
      // Bulk Send Mode setup
      const rawTemplate = msgBulkEl.value.trim();
      if (!rawTemplate) {
        logToTerminal('Error: Please enter a bulk message template.', 'error');
        return;
      }

      const contacts = parseNumbersList(numbersEl.value);
      if (contacts.length === 0) {
        logToTerminal('Error: No recipients found in list.', 'error');
        return;
      }

      // Initialize/Save Bulk Job State to localStorage
      const bulkJobState = {
        active: true,
        mode: 'bulk',
        currentIndex: 0,
        contacts: contacts,
        template: rawTemplate,
        minDelay: parseFloat(minDelayEl.value) || 0.5,
        maxDelay: parseFloat(maxDelayEl.value) || 1.5,
        cooldownEnabled: cooldownEnableEl.checked,
        cooldownAfter: parseInt(cooldownAfterEl.value, 10) || 10,
        cooldownDuration: parseInt(cooldownDurationEl.value, 10) || 30,
        status: 'sending'
      };

      localStorage.setItem('wa_sender_bulk_job', JSON.stringify(bulkJobState));
      consoleEl.innerHTML = '';
      logToTerminal(`Starting Bulk Send job. Total recipients: ${contacts.length}.`, 'info');

      // Navigate to the first contact using the safe helper
      const firstContact = contacts[0];
      navigateToContact(firstContact);
    }
  }

  // Disable UI fields while sending
  function toggleControlsDisabled(disabled) {
    startBtn.disabled = disabled;
    pauseBtn.disabled = !disabled;
    stopBtn.disabled = !disabled;

    msgSingleEl.disabled = disabled;
    countSingleEl.disabled = disabled;
    numbersEl.disabled = disabled;
    msgBulkEl.disabled = disabled;
    minDelayEl.disabled = disabled;
    maxDelayEl.disabled = disabled;
    cooldownEnableEl.disabled = disabled;
    cooldownAfterEl.disabled = disabled;
    cooldownDurationEl.disabled = disabled;
    
    tabSingle.disabled = disabled;
    tabBulk.disabled = disabled;
  }

  // 11. Pause Automation
  function pauseSending() {
    sending = false;
    paused = true;
    clearTimeout(timerId);
    logToTerminal('Job paused.', 'warning');
    
    startBtn.disabled = false;
    startBtn.textContent = 'Resume';
    pauseBtn.disabled = true;

    if (currentMode === 'bulk') {
      const state = loadBulkJob();
      if (state) {
        state.status = 'paused';
        saveBulkJob(state);
      }
    }
  }

  // 12. Stop / Reset Automation
  function stopSending() {
    sending = false;
    paused = false;
    messageIndex = 0;
    clearTimeout(timerId);
    logToTerminal('Job stopped.', 'error');

    if (currentMode === 'bulk') {
      saveBulkJob(null); // Clear storage state
    }

    resetUI();
  }

  // 13. Finished Loop
  function finishSending() {
    sending = false;
    paused = false;
    messageIndex = 0;
    clearTimeout(timerId);
    logToTerminal('🎉 Completed! All messages sent successfully.', 'success');

    if (currentMode === 'bulk') {
      saveBulkJob(null); // Clear storage state
    }

    resetUI();
  }

  // 14. Reset UI to default idle state
  function resetUI() {
    startBtn.disabled = false;
    startBtn.textContent = 'Start';
    pauseBtn.disabled = true;
    stopBtn.disabled = true;

    toggleControlsDisabled(false);
    progressBox.style.display = 'none';
  }

  // 15. State Recovery for Bulk Mode across page reloads
  function loadBulkJob() {
    const data = localStorage.getItem('wa_sender_bulk_job');
    if (!data) return null;
    try { return JSON.parse(data); } catch (e) { return null; }
  }

  function saveBulkJob(state) {
    if (state) {
      localStorage.setItem('wa_sender_bulk_job', JSON.stringify(state));
    } else {
      localStorage.removeItem('wa_sender_bulk_job');
    }
  }

  // Check on load if a bulk job is active
  async function checkActiveBulkJob() {
    const state = loadBulkJob();
    if (!state || !state.active) return;

    // Restore UI Inputs
    currentMode = 'bulk';
    tabBulk.classList.add('active');
    tabSingle.classList.remove('active');
    contentBulk.classList.add('active');
    contentSingle.classList.remove('active');

    // Populate fields
    msgBulkEl.value = state.template;
    numbersEl.value = state.contacts.map(c => `${c.phone}, ${c.name}`).join('\n');
    minDelayEl.value = state.minDelay;
    maxDelayEl.value = state.maxDelay;
    cooldownEnableEl.value = state.cooldownEnabled;
    cooldownEnableEl.checked = state.cooldownEnabled;
    if (state.cooldownEnabled) {
      cooldownInputsDiv.style.display = 'grid';
      cooldownAfterEl.value = state.cooldownAfter;
      cooldownDurationEl.value = state.cooldownDuration;
    }

    // Set UI to running/disabled state
    toggleControlsDisabled(true);
    progressLabel.textContent = 'Bulk Progress';
    progressBox.style.display = 'block';

    // Open Panel
    panelEl.classList.remove('collapsed');
    toggleBtn.classList.add('hidden');

    messageIndex = state.currentIndex;
    totalMessages = state.contacts.length;
    updateProgressBar();

    if (messageIndex >= totalMessages) {
      finishSending();
      return;
    }

    if (state.status === 'paused') {
      paused = true;
      sending = false;
      startBtn.disabled = false;
      startBtn.textContent = 'Resume';
      pauseBtn.disabled = true;
      logToTerminal('Bulk job is currently paused. Press Resume to continue.', 'warning');
      return;
    }

    // Running state
    sending = true;
    paused = false;

    logToTerminal(`Resuming Bulk job: Recipient ${messageIndex + 1} of ${totalMessages}...`, 'info');

    // Wait for the input field to load (Polling)
    waitForChatInput(async (chatInput) => {
      try {
        const currentContact = state.contacts[messageIndex];
        const finalMessage = parseSpintax(state.template).replace(/{name}/gi, currentContact.name);

        logToTerminal(`Typing message for ${currentContact.name}...`, 'info');

        // Type the message safely
        await typeMessage(chatInput, finalMessage);

        // Wait a short delay for DOM rendering to complete
        await sleep(500);

        // Wait up to 2.5 seconds for the send button to render
        const sendBtn = await waitForSendButton(2500);
        if (!sendBtn) {
          logToTerminal(`Error: Send button not found for ${currentContact.name}. Make sure chat is open and loaded.`, 'error');
          pauseSending();
          return;
        }

        // Send
        sendBtn.click();
        
        state.currentIndex++;
        messageIndex = state.currentIndex;
        saveBulkJob(state);
        updateProgressBar();
        logToTerminal(`[${messageIndex}/${totalMessages}] Sent to ${currentContact.phone} (${currentContact.name})`, 'success');

        if (state.currentIndex >= totalMessages) {
          finishSending();
          return;
        }

        // Cooldown trigger check
        if (state.cooldownEnabled && (messageIndex % state.cooldownAfter === 0)) {
          logToTerminal(`🛡️ Cooldown Break: Resting for ${state.cooldownDuration}s before navigating next...`, 'warning');
          
          await sleep(state.cooldownDuration * 1000);
        } else {
          // Regular delay
          const delay = Math.random() * (state.maxDelay - state.minDelay) + state.minDelay;
          logToTerminal(`Waiting ${delay.toFixed(2)}s delay...`, 'info');
          await sleep(delay * 1000);
        }

        // Navigate to the next contact using the safe helper
        const nextContact = state.contacts[state.currentIndex];
        navigateToContact(nextContact);

      } catch (err) {
        logToTerminal(`Bulk Error: ${err.message}`, 'error');
        pauseSending();
      }
    });
  }

  // Polling helper that waits for chat text area to load
  function waitForChatInput(callback, attempts = 0) {
    const input = findChatInput();
    if (input) {
      callback(input);
      return;
    }
    
    const state = loadBulkJob();
    if (!state || state.status !== 'sending') return; // Cancel if stopped/paused

    if (attempts > 25) {
      logToTerminal('Error: Wait timeout! Chat took too long to load. If number is invalid, click next number manually or edit list.', 'error');
      pauseSending();
      return;
    }
    
    statusMsg.textContent = `Loading Chat... (${attempts}s)`;
    
    setTimeout(() => {
      waitForChatInput(callback, attempts + 1);
    }, 1000);
  }

  // Bind Buttons
  startBtn.addEventListener('click', startSending);
  pauseBtn.addEventListener('click', pauseSending);
  stopBtn.addEventListener('click', stopSending);

  // Initialize bulk recovery check
  // Wait a few seconds after WhatsApp Web fully loads to check for active recovery jobs
  setTimeout(checkActiveBulkJob, 3500);
})();
