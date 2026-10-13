// vocabmaster/options/options.js

const STORAGE_KEY_SETTINGS = 'vocab_settings';
const DEFAULT_SETTINGS = {
  targetLanguage: 'en',
  isFeatureEnabled: true,
  reviewInterval: '7',
  notificationsEnabled: true
};

document.addEventListener('DOMContentLoaded', async () => {
  const targetLangSelect = document.getElementById('target-lang');
  const featureToggle = document.getElementById('feature-toggle');
  const reviewIntervalSelect = document.getElementById('review-interval');
  const notificationToggle = document.getElementById('notification-toggle');
  const btnSave = document.getElementById('btn-save');
  const statusMsg = document.getElementById('status-msg');

  // Load settings
  chrome.storage.local.get([STORAGE_KEY_SETTINGS], (result) => {
    const settings = result[STORAGE_KEY_SETTINGS] || DEFAULT_SETTINGS;
    
    targetLangSelect.value = settings.targetLanguage;
    featureToggle.checked = settings.isFeatureEnabled;
    reviewIntervalSelect.value = settings.reviewInterval;
    notificationToggle.checked = settings.notificationsEnabled;
  });

  // Save settings
  btnSave.addEventListener('click', () => {
    const newSettings = {
      targetLanguage: targetLangSelect.value,
      isFeatureEnabled: featureToggle.checked,
      reviewInterval: reviewIntervalSelect.value,
      notificationsEnabled: notificationToggle.checked
    };

    chrome.storage.local.set({ [STORAGE_KEY_SETTINGS]: newSettings }, () => {
      statusMsg.textContent = 'Settings saved!';
      setTimeout(() => {
        statusMsg.textContent = '';
      }, 2000);
    });
  });
});
