# 🚀 VocabMaster

**VocabMaster** is a productivity-focused Chrome extension designed to turn casual web browsing into an active vocabulary-building session. By simply clicking on unknown words while holding a specific key combination, users can instantly save words, get definitions, and build a personalized learning library.

---

## 🌟 Overview

Learning new words is often interrupted by the friction of looking them up manually. **VocabMaster** removes this friction. It allows you to capture words "on the fly" and transforms your saved list into a structured study curriculum with automated reminders and interactive quizzes.

## ✨ Key Features

-   **One-Click Capture**: Detects words instantly when holding `Ctrl + Shift` and clicking.
-   **Instant Definitions**: Automatically fetches and displays translations/definitions.
-   **Personal Vocabulary List**: Maintains a local database of all words you have encountered.
-   **Smart Review System**: Reminds you to study your words based on a schedule you define.
-   **Interactive Learning**: A built-in multiple-choice quiz system to test your knowledge.
-   **Customizable Settings**: Choose your target language, review frequency, and notification preferences.

---

## 🛠 How to Install & Use

### Installation (Developer Mode)
1. Download or clone this repository.
2. Open **Google Chrome**.
3. Navigate to `chrome://extensions/`.
4. Enable **Developer mode** (toggle in the top right).
5. Click **Load unpacked**.
6. Select the `vocabmaster` folder from this repository.

### How to Capture Words
1. Navigate to any website.
2. Hold down the **`Ctrl`** and **`Shift`** keys.
3. **Click** on any word you don't recognize.
4. A small green notification will appear at your cursor confirming the word was saved!

### How to Study
1. Click the **VocabMaster icon** in your Chrome toolbar.
2. Click **Start Quiz** to begin a randomized testing session.
3. Alternatively, check the **Settings** to adjust your review schedule.

---

## ⚙️ Settings & Configuration

You can access the settings page by clicking the extension icon and selecting **Settings**, or via the `chrome://extensions` page.

-   **Target Language**: Choose which language you want definitions/translations to appear in (e.g., English, Spanish, French, etc.).
-   **Review Interval**: Set how often you want to be reminded to review your words:
    -   Every few days.
    -   Once a week.
    -   Once a month.
-   **Notifications**: Toggle browser notifications for when words are due for review.

---

## 🔧 Technical Implementation

This extension is built using **Manifest V3** and follows a modular architecture to ensure high performance and separation of concerns.

### 🏗 Architecture Overview

The extension is divided into several specialized modules:

#### 1. Content Script (`content/content_script.js`)
The "eyes" of the extension. 
- **Event Listener**: Implements a global `click` event listener. 
- **Input Detection**: Checks for the simultaneous presence of `event.ctrlKey` and `event.shiftKey`.
- **Communication**: Uses `window.getSelection()` to extract the text and transmits the word to the background service worker via `chrome.runtime.sendMessage`.

#### 2. Background Service Worker (`background/background.js`)
The "brain" of the extension. It acts as a singleton managing the application state.
- **State Management**: Handles all interaction with `chrome.storage.local`.
- **Translation Engine**: Asynchronously fetches translations using the `fetch` API on a Google Translate endpoint.
- **Lifecycle & Scheduling**:
    - Uses `chrome.alarms` to set up a daily recurring job.
    - On alarm trigger, it scans the vocabulary list to check if `nextReviewDate` is less than or equal to the current time.
    - Uses `chrome.notifications` to alert the user when review sessions are due.
- **Messaging Hub**: Listens for messages from the content script (for capture) and the popup (for data retrieval).

#### 3. Popup UI (`popup/`)
A lightweight interface for quick interactions.
- **Information Display**: Retrieves the total word count from storage in real-time.
- **Navigation**: Provides entry points for the Quiz and Settings pages.

#### 4. Quiz System (`quiz/`)
A dynamic testing engine.
- **Algorithm**: Implements a "Randomized Pick and Shuffle" logic. It selects a subset of words from the user's library and shuffles them to ensure variety.
- **Decoy Generation**: For each question, it picks the correct definition and then generates three "decoys" by selecting random definitions from other saved words to create a realistic multiple-choice experience.

#### 5. Options Page (`options/`)
A dedicated UI for persistent configuration.
- **Data Persistence**: Synchronizes user preferences (language, intervals, etc.) with `chrome.storage.local` to ensure settings persist across browser sessions.

### 📊 Data Schema (Storage)

The vocabulary is stored as an array of objects within the `vocab_words` key in `chrome.storage.local`. Each object follows this structure:

```json
{
  "id": 1723456789000,
  "word": "example",
  "definition": "A representative part of a whole.",
  "lang": "en",
  "dateAdded": "2023-10-13T10:00:00Z",
  "nextReviewDate": "2023-10-20T10:00:00Z",
  "status": "new"
}
```

### 🛠 Technologies Used
- **JavaScript (ES6+)**
- **Chrome Extension API (Manifest V3)**
- **CSS3 (Modern Flexbox & Variables)**
- **HTML5**
- **Google Translate API (unoffical endpoint)**

---
*Developed with ❤️ for lifelong learners.*
