// content/content_script.js

/**
 * Listens for click events. If Ctrl + Shift are held, it attempts to 
 * identify the word clicked and send it to the background script.
 */
document.addEventListener('click', (event) => {
  // Check if Ctrl and Shift are held down
  if (event.ctrlKey && event.shiftKey) {
    // Prevent default behavior (like moving the cursor or following a link)
    event.preventDefault();
    event.stopPropagation();

    let word = "";

    // Method 1: Check if the user has already highlighted/selected text
    const selection = window.getSelection().toString().trim();
    if (selection.length > 0) {
      word = selection;
    } else {
      // Method 2: Use the Caret Range API to detect the word at the specific click coordinate
      // This allows the user to just "click" the word without selecting it first.
      if (typeof document.caretRangeFromPoint === 'function') {
        const range = document.caretRangeFromPoint(event.clientX, event.clientY);
        
        if (range && range.startContainer) {
          const node = range.startContainer;
          
          // If we clicked on a text node
          if (node.nodeType === Node.TEXT_NODE) {
            const text = node.textContent;
            const offset = range.startOffset;

            // Use regex to find the word containing the character at the offset
            // This regex looks for word characters (\w) surrounding the offset
            const before = text.substring(0, offset);
            const after = text.substring(offset);

            // Find the end of the word before the offset
            const matchBefore = before.match(/(\w+)\s*$/);
            // Find the start of the word after the offset
            const matchAfter = after.match(/^\s*(\w+)/);

            if (matchBefore && matchAfter) {
              // The word is formed by the part before and the part after
              word = matchBefore[1] + matchAfter[1];
            } else if (matchBefore) {
              word = matchBefore[1];
            } else if (matchAfter) {
              word = matchAfter[1];
            } else {
              // If no clear word boundaries, try to grab the first word in the node
              word = text.trim().split(/\s+/)[0];
            }
          } else if (node.nodeType === Node.ELEMENT_NODE) {
            // If we clicked an element directly (like a span containing text), 
            // get its text content and grab the first word.
            word = node.innerText.trim().split(/\s+/)[0];
          }
        }
      }
    }

    // Fallback: If no word was found via caret, check if the element itself has content
    if (!word && event.target) {
       const text = event.target.innerText || event.target.textContent || "";
       const cleanText = text.trim();
       if (cleanText.length > 0) {
         // Try to grab the first word of the element's text
         word = cleanText.split(/\s+/)[0].replace(/[^\w]/g, '');
       }
    }

    // Log for debugging in DevTools
    console.log(`VocabMaster: Attempting to capture word: "${word}"`);

    // Final sanitation: remove any non-word characters and ensure it's not too long/short
    word = word.replace(/[^\w]/g, '');

    if (word && word.length >= 2) {
      chrome.runtime.sendMessage({
        type: 'CAPTURE_WORD',
        word: word
      }, (response) => {
        if (response && response.status === 'success') {
          showPopupFeedback(event.clientX, event.clientY, `Captured: ${word}`);
        } else {
          const errorMsg = response && response.message ? response.message : 'Unknown error';
          showPopupFeedback(event.clientX, event.clientY, `Error: ${errorMsg}`, true);
        }
      });
    } else {
      console.log('VocabMaster: No valid word detected at click position.');
    }
  }
}, true);

/**
 * Shows a small temporary floating feedback message near the click location
 */
function showPopupFeedback(x, y, message, isError = false) {
  const feedback = document.createElement('div');
  feedback.textContent = message;
  feedback.style.position = 'fixed';
  feedback.style.left = `${x}px`;
  feedback.style.top = `${y}px`;
  feedback.style.padding = '5px 10px';
  feedback.style.borderRadius = '4px';
  feedback.style.color = 'white';
  feedback.style.zIndex = '2147483647'; // Max z-index
  feedback.style.fontSize = '14px';
  feedback.style.pointerEvents = 'none';
  feedback.style.transform = 'translate(-50%, -100%)';
  feedback.style.transition = 'opacity 0.5s ease';
  feedback.style.backgroundColor = isError ? '#f44336' : '#4CAF50';
  
  document.body.appendChild(feedback);
  
  // Remove after 2 seconds and fade out
  setTimeout(() => {
    feedback.style.opacity = '0';
    setTimeout(() => {
      if (feedback.parentNode) {
        document.body.removeChild(feedback);
      }
    }, 500);
  }, 2000);
}
