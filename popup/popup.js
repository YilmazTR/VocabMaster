// vocabmaster/popup/popup.js

document.addEventListener('DOMContentLoaded', async () => {
  const wordCountElement = document.getElementById('word-count');
  const btnQuiz = document.getElementById('btn-quiz');
  const btnSettings = document.getElementById('btn-settings');

  console.log('VocabMaster Popup: Initialized');

  // Fetch and display word count
  try {
    const result = await chrome.storage.local.get(['vocab_words']);
    const words = result['vocab_words'] || [];
    if (wordCountElement) {
      wordCountElement.textContent = words.length;
    }
  } catch (err) {
    console.error('VocabMaster Popup: Error fetching words from storage', err);
  }

  // Handle Quiz Button Click
  if (btnQuiz) {
    btnQuiz.addEventListener('click', () => {
      console.log('VocabMaster Popup: Opening Quiz...');
      chrome.tabs.create({ url: chrome.runtime.getURL('quiz/quiz.html') });
    });
  } else {
    console.error('VocabMaster Popup: Element #btn-quiz not found');
  }

  // Handle Settings Button Click
  if (btnSettings) {
    btnSettings.addEventListener('click', () => {
      console.log('VocabMaster Popup: Opening Options Page...');
      chrome.runtime.openOptionsPage();
    });
  } else {
    console.error('VocabMaster Popup: Element #btn-settings not found');
  }
});
