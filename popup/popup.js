// vocabmaster/popup/popup.js

document.addEventListener('DOMContentLoaded', async () => {
  const wordCountElement = document.getElementById('word-count');
  const btnQuiz = document.getElementById('btn-quiz');
  const btnSettings = document.getElementById('btn-settings');

  // Get word count
  chrome.runtime.getBackgroundUrl((url) => {
    // We need to communicate with the background script or storage
  });

  // Actually, it's easier to just read from storage directly in the popup
  chrome.storage.local.get(['vocab_words'], (result) => {
    const words = result['vocab_words'] || [];
    wordCountElement.textContent = words.length;
  });

  // Open Quiz
  btnQuiz.addEventListener('click', () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('quiz/quiz.html') });
  });

  // Open Settings
  btnSettings.addEventListener('click', () => {
    chrome.runtime.openOptionsPage();
  });
});
