// content/content_script.js

document.addEventListener('click', (event) => {
  // Check if Ctrl and Shift are held down
  if (event.ctrlKey && event.shiftKey) {
    const selection = window.getSelection().toString().trim();
    
    if (selection.length > 0) {
      // Prevent default behavior if needed, though we want to allow clicking
      // Note: event.preventDefault() might stop other things, 
      // but we'll just capture and move on.
      
      chrome.runtime.sendMessage({
        type: 'CAPTURE_WORD',
        word: selection
      }, (response) => {
        if (response && response.status === 'success') {
          showPopupFeedback(event.pageX, event.pageY, `Captured: ${selection}`);
        } else if (response && response.status === 'error') {
          showPopupFeedback(event.pageX, event.pageY, `Error: ${response.message}`, true);
        }
      });
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
  feedback.style.zIndex = '999999';
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
