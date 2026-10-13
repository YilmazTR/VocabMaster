// background/background.js

const STORAGE_KEY_WORDS = 'vocab_words';
const STORAGE_KEY_SETTINGS = 'vocab_settings';

const DEFAULT_SETTINGS = {
  targetLanguage: 'en',
  isFeatureEnabled: true,
  reviewInterval: '7', // '3' (days), '7' (week), '30' (month)
  notificationsEnabled: true,
  lastReviewDate: null
};

// -- Initialization --

chrome.runtime.onInstalled.addListener(() => {
  console.log('VocabMaster extension installed.');
  chrome.storage.local.get([STORAGE_KEY_SETTINGS], (result) => {
    if (!result[STORAGE_KEY_SETTINGS]) {
      chrome.storage.local.set({ [STORAGE_KEY_SETTINGS]: DEFAULT_SETTINGS });
    }
  });
  
  // Setup initial alarm if needed
  setupAlarms();
});

// -- Message Listener --

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'CAPTURE_WORD') {
    handleCaptureWord(message.word)
      .then(wordData => sendResponse({ status: 'success', data: wordData }))
      .catch(error => sendResponse({ status: 'error', message: error.message }));
    return true; // keep channel open for async response
  }
  
  if (message.type === 'GET_WORDS') {
    chrome.storage.local.get([STORAGE_KEY_WORDS], (result) => {
      sendResponse({ words: result[STORAGE_KEY_WORDS] || [] });
    });
    return true;
  }

  if (message.type === 'GET_SETTINGS') {
    chrome.storage.local.get([STORAGE_KEY_SETTINGS], (result) => {
      sendResponse({ settings: result[STORAGE_KEY_SETTINGS] || DEFAULT_SETTINGS });
    });
    return true;
  }
});

// -- Core Logic --

async function handleCaptureWord(word) {
  const { settings } = await getSettings();
  
  if (!settings.isFeatureEnabled) {
    throw new Error('Feature is disabled in settings.');
  }

  const definition = await translateWord(word, settings.targetLanguage);
  
  const newWord = {
    id: Date.now(),
    word: word,
    definition: definition,
    lang: settings.targetLanguage,
    dateAdded: new Date().toISOString(),
    nextReviewDate: calculateNextReviewDate(settings.reviewInterval),
    status: 'new'
  };

  const words = await getWords();
  words.push(newWord);
  await chrome.storage.local.set({ [STORAGE_KEY_WORDS]: words });

  // Check if we should schedule a notification
  checkAndScheduleReminder();

  return newWord;
}

/**
 * Uses Google Translate's public API (gtx) to get a definition/translation
 * @param {string} text The word to translate
 * @param {string} targetLang The target language code
 */
async function translateWord(text, targetLang) {
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url);
    const data = await response.json();
    
    // data[0][0][0] contains the translated text
    if (data && data[0] && data[0][0] && data[0][0][0]) {
      return data[0][0][0];
    }
    return "Definition not found.";
  } catch (error) {
    console.error('Translation error:', error);
    throw new Error('Failed to fetch translation.');
  }
}

async function getWords() {
  const result = await chrome.storage.local.get([STORAGE_KEY_WORDS]);
  return result[STORAGE_KEY_WORDS] || [];
}

async function getSettings() {
  const result = await chrome.storage.local.get([STORAGE_KEY_SETTINGS]);
  return { settings: result[STORAGE_KEY_SETTINGS] || DEFAULT_SETTINGS };
}

function calculateNextReviewDate(intervalDays) {
  const date = new Date();
  date.setDate(date.getDate() + parseInt(intervalDays));
  return date.toISOString();
}

// -- Reminders & Alarms --

async function setupAlarms() {
  // Alarm for checking words once a day
  chrome.alarms.create('daily_check', { periodInMinutes: 1440 });
}

async function checkAndScheduleReminder() {
  const { settings } = await getSettings();
  if (!settings.notificationsEnabled) return;

  // Check if it's time to review any word
  const words = await getWords();
  const now = new Date();
  
  const dueWords = words.filter(w => new Date(w.nextReviewDate) <= now);
  
  if (dueWords.length > 0) {
    showNotification('VocabMaster', `Time to review ${dueWords.length} new words!`);
  }
}

function showNotification(title, message) {
  chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon48.png',
    title: title,
    message: message
  });
}

// listen for alarm
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'daily_check') {
    checkAndScheduleReminder();
  }
});
