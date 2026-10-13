// vocabmaster/quiz/quiz.js

let words = [];
let currentWordIndex = 0;
let score = 0;
let questionsAsked = 0;
let quizQuestions = [];

const setupEl = document.getElementById('quiz-setup');
const containerEl = document.getElementById('quiz-container');
const resultEl = document.getElementById('quiz-result');
const targetWordEl = document.getElementById('target-word');
const optionsAreaEl = document.getElementById('options-area');
const feedbackEl = document.getElementById('feedback-area');
const scoreEl = document.getElementById('current-score');
const totalEl = document.getElementById('total-asked');
const scoreTextEl = document.getElementById('final-score-text');

document.getElementById('btn-start').addEventListener('click', startQuiz);
document.getElementById('btn-restart').addEventListener('click', () => {
  resultEl.style.display = 'none';
  setupEl.style.display = 'block';
});

async function startQuiz() {
  // Load words
  chrome.storage.local.get(['vocab_words'], (result) => {
    words = result['vocab_words'] || [];
    if (words.length < 4) {
      alert('You need at least 4 saved words to start a quiz! Capture more words first.');
      return;
    }
    
    // Shuffle and pick 10 words for the quiz
    quizQuestions = [...words].sort(() => 0.5 - Math.random()).slice(0, 10);
    
    // Reset state
    score = 0;
    questionsAsked = 0;
    currentWordIndex = 0;
    
    setupEl.style.display = 'none';
    containerEl.style.display = 'block';
    resultEl.style.display = 'none';
    
    nextQuestion();
  });
}

function nextQuestion() {
  if (currentWordIndex >= quizQuestions.length) {
    finishQuiz();
    return;
  }

  feedbackEl.textContent = '';
  optionsAreaEl.innerHTML = '';
  
  const currentWordObj = quizQuestions[currentWordIndex];
  targetWordEl.textContent = currentWordObj.word;
  
  // Generate options
  const options = generateOptions(currentWordObj);
  
  options.forEach(opt => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.textContent = opt.text;
    btn.onclick = () => handleAnswer(opt.isCorrect);
    optionsAreaEl.appendChild(btn);
  });

  questionsAsked++;
  scoreEl.textContent = score;
  totalEl.textContent = questionsAsked;
}

function generateOptions(correctWordObj) {
  const options = [{ text: correctWordObj.definition, isCorrect: true }];
  
  // Get other words for decoys
  const decoys = words
    .filter(w => w.id !== correctWordObj.id)
    .map(w => w.definition)
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);
  
  decoys.forEach(d => {
    options.push({ text: d, isCorrect: false });
  });

  // Shuffle options
  return options.sort(() => 0.5 - Math.random());
}

function handleAnswer(isCorrect) {
  if (isCorrect) {
    score++;
    feedbackEl.style.color = 'green';
    feedbackEl.textContent = 'Correct!';
  } else {
    feedbackEl.style.color = 'red';
    feedbackEl.textContent = 'Wrong!';
  }

  // Disable all buttons to prevent double clicking
  const buttons = optionsAreaEl.querySelectorAll('button');
  buttons.forEach(b => b.disabled = true);

  currentWordIndex++;
  
  // Small delay before next question
  setTimeout(nextQuestion, 1200);
}

function finishQuiz() {
  containerEl.style.display = 'none';
  resultEl.style.display = 'block';
  scoreTextEl.textContent = `You got ${score} out of ${quizQuestions.length} correct!`;
}
