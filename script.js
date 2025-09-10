// DOM elements
const wpm = document.getElementById("wpm");
const accuracy = document.getElementById("accuracy");
const timer = document.getElementById("timer");
const errors = document.getElementById("errors");
const typingText = document.getElementById("typing-text");
const resetBtn = document.getElementById("reset-btn");
const body = document.getElementsByTagName("body")[0];

// Text to type
const text = "To create a custom offline error using JavaScript, first check the user’s internet connection with navigator.onLine. When offline, dynamically display a styled warning message. Add event listeners for network changes, so the message appears automatically when disconnected and disappears once reconnected, ensuring smooth user experience without extra HTML";

// State variables
let letters = text.split(""); // Convert string to array
let currentPosition = 0; // Track current character index
let errorCount = 0; // Track errors
let startTime = null; // Track when typing starts
let timerInterval = null; // Timer interval ID
let timeLimit = 60; // 60 seconds timer

// Initialize text display
document.addEventListener("DOMContentLoaded", () => {
  addText();
  reset(); // Set initial state
});

// Display text with spans for each character
function addText() {
  typingText.innerHTML = letters
    .map((char, index) => `<span id="char-${index}">${char}</span>`)
    .join("");
}

// Count words for WPM calculation
function countWords(text) {
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .length;
}

// Start or reset timer
function startTimer() {
  if (timerInterval) clearInterval(timerInterval); // Clear existing timer
  startTime = new Date();
  timer.textContent = timeLimit;
  timerInterval = setInterval(() => {
    const elapsed = Math.floor((new Date() - startTime) / 1000);
    const timeLeft = timeLimit - elapsed;
    timer.textContent = timeLeft > 0 ? timeLeft : 0;
    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      body.removeEventListener("keydown", handleKeydown); // Stop typing
    }
    updateWPM();
  }, 1000);
}

// Update WPM
function updateWPM() {
  const elapsedMinutes = (new Date() - startTime) / 1000 / 60;
  if (elapsedMinutes > 0) {
    const wordsTyped = countWords(text.slice(0, currentPosition));
    const wpmValue = Math.round(wordsTyped / elapsedMinutes);
    wpm.textContent = wpmValue;
  } else {
    wpm.textContent = 0;
  }
}

// Update accuracy
function updateAccuracy() {
  const totalTyped = currentPosition + errorCount;
  if (totalTyped > 0) {
    const accuracyValue = Math.round(((currentPosition) / totalTyped) * 100);
    accuracy.textContent = `${accuracyValue}%`;
  } else {
    accuracy.textContent = "100%";
  }
}

// Reset the practice
function reset() {
  currentPosition = 0;
  errorCount = 0;
  startTime = null;
  if (timerInterval) clearInterval(timerInterval);
  timer.textContent = timeLimit;
  errors.textContent = 0;
  wpm.textContent = 0;
  accuracy.textContent = "100%";
  addText();
  body.removeEventListener("keydown", handleKeydown); // Remove old listener
  body.addEventListener("keydown", handleKeydown); // Add new listener
}

// Handle keydown events
function handleKeydown(event) {
  if (!startTime) startTimer(); // Start timer on first keypress

  if (currentPosition >= letters.length || timer.textContent == "0") return; // Stop if done or time's up

  const currentChar = letters[currentPosition];
  const currentSpan = document.getElementById(`char-${currentPosition}`);

  if (event.key === currentChar) {
    // Correct key
    currentSpan.style.color = "green";
    currentPosition++;
    if (currentPosition < letters.length) {
      document.getElementById(`char-${currentPosition}`).style.backgroundColor = "yellow"; // Highlight next char
    }
  } else if (event.key.length === 1) { // Ignore special keys
    // Incorrect key
    currentSpan.style.color = "red";
    errorCount++;
    errors.textContent = errorCount;
  }

  updateAccuracy();
  updateWPM();

  // End practice if all characters typed
  if (currentPosition >= letters.length) {
    clearInterval(timerInterval);
    body.removeEventListener("keydown", handleKeydown);
  }
}

// Reset button
resetBtn.addEventListener("click", reset);

// Initial setup
body.addEventListener("keydown", handleKeydown);