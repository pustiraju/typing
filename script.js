
  // Plain ASCII quotes to match keyboard input
  const sampleText =
    "I have a cure for insomnia. It's probably worth millions of dollars but I'm giving it to you free. It isn't warm milk or chamomile tea. It's list making. List stuff from your life like all your teachers or all the live music you've seen or all the Paul Newman movies you've watched..";

  const TEST_SECONDS = 60;

  const textDiv = document.getElementById("text");
  const timeSpan = document.getElementById("time");
  const wpmSpan = document.getElementById("wpm");
  const accSpan = document.getElementById("accuracy");
  const errSpan = document.getElementById("errors");
  const resetBtn = document.getElementById("reset");

  // state
  let currentChar = 0;
  let errors = 0;
  let correctChars = 0;
  let started = false;
  let finished = false;
  let startTime = null;
  let timerInterval = null;

  // normalize common typographic characters to keyboard equivalents
  function normalizeChar(ch) {
    if (!ch) return ch;
    const map = {
      "\u2018": "'", // left single quote
      "\u2019": "'", // right single quote
      "\u201C": '"',
      "\u201D": '"',
      "\u2013": "-",
      "\u2014": "-",
      "\u00A0": " ",
    };
    return map[ch] || ch;
  }

  function addText() {
    textDiv.innerHTML = "";
    sampleText.split("").forEach((char) => {
      const span = document.createElement("span");
      span.textContent = char;
     
      textDiv.appendChild(span);
    });
  }

  function highlightCurrent() {
    [...textDiv.children].forEach((s, i) => {
      // s.classList.remove("");  if not need background for typed letter
      if (i === currentChar) s.classList.add("current");
    });
  }

  function updateStats() {
    // use precise elapsed time while running
    let elapsedSeconds = 0.001; // avoid division by zero
    if (started && startTime) {
      elapsedSeconds = (Date.now() - startTime) / 1000;
      if (elapsedSeconds < 0.001) elapsedSeconds = 0.001;
    }
    const elapsedMinutes = elapsedSeconds / 60;

    // gross = all advanced characters, net = only correct characters
    const grossWPM = Math.round((currentChar / 5) / elapsedMinutes);
    const netWPM = Math.round((correctChars / 5) / elapsedMinutes);

    // show net WPM as primary (common expectation)
    wpmSpan.textContent = isFinite(netWPM) ? netWPM : 0;
    accSpan.textContent = currentChar > 0 ? Math.round((correctChars / currentChar) * 100) : 100;
    errSpan.textContent = errors;
  }

  function finishTest() {
    if (finished) return;
    finished = true;
    clearInterval(timerInterval);

    // ensure no more keystrokes counted
    document.removeEventListener("keydown", handleKeydown);

    // final stats — use actual elapsed time but cap to TEST_SECONDS
    const measuredSeconds = startTime ? Math.min(TEST_SECONDS, (Date.now() - startTime) / 1000) : 0;
    const minutes = measuredSeconds > 0 ? measuredSeconds / 60 : 1;

    const finalGrossWPM = Math.round((currentChar / 5) / minutes);
    const finalNetWPM = Math.round((correctChars / 5) / minutes);
    const finalAcc = currentChar > 0 ? Math.round((correctChars / currentChar) * 100) : 100;

    alert(
      `Time's up!\n` +
      `WPM (net, excludes wrong presses): ${finalNetWPM}\n` +
      `WPM (gross, includes wrong presses): ${finalGrossWPM}\n` +
      `Accuracy: ${finalAcc}%\n` +
      `Errors: ${errors}`
    );
  }

  function startTimerIfNeeded() {
    if (started) return;
    started = true;
    startTime = Date.now();

    timerInterval = setInterval(() => {
      const elapsedSec = Math.floor((Date.now() - startTime) / 1000);
      const timeLeft = Math.max(0, TEST_SECONDS - elapsedSec);
      timeSpan.textContent = timeLeft;
      updateStats();

      if (timeLeft <= 0) {
        finishTest();
      }
    }, 200); // smaller tick for snappier updates
  }

  function handleKeydown(e) {
    // block everything after finish
    if (finished) return;

    // If the test ran out of real time (precise check), finish and ignore this key
    if (started && startTime && (Date.now() - startTime) >= TEST_SECONDS * 1000) {
      finishTest();
      return;
    }

    // start timer on first key press
    if (!started) startTimerIfNeeded();

    const spans = textDiv.querySelectorAll("span");
    // guard if text ended
    if (currentChar >= spans.length) return;

    const currentSpan = spans[currentChar];
    const expectedRaw = currentSpan.textContent;
    const expected = normalizeChar(expectedRaw);

    // Backspace handling: let user correct previous char
    if (e.key === "Backspace") {
      if (currentChar > 0) {
        currentChar--;
        const prevSpan = spans[currentChar];
        if (prevSpan.classList.contains("incorrect")) errors = Math.max(0, errors - 1);
        if (prevSpan.classList.contains("correct")) correctChars = Math.max(0, correctChars - 1);
        prevSpan.classList.remove("correct", "incorrect");
        highlightCurrent();
        updateStats();
      }
      return;
    }

    // only printable characters
    if (e.key.length !== 1) return;

    // normalize typed key
    const typed = normalizeChar(e.key);

    if (typed.toLowerCase() === expected.toLowerCase()) {
      currentSpan.classList.add("correct");
      correctChars++;
    } else {
      currentSpan.classList.add("incorrect");
      errors++;
    }

    // advance either way (keeps existing UX)
    currentChar++;
    highlightCurrent();
    updateStats();
  }

  function reset() {
    // reset state
    currentChar = 0;
    errors = 0;
    correctChars = 0;
    started = false;
    finished = false;
    startTime = null;
    clearInterval(timerInterval);

    timeSpan.textContent = TEST_SECONDS;
    wpmSpan.textContent = 0;
    accSpan.textContent = 100;
    errSpan.textContent = 0;

    addText();
    highlightCurrent();

    // reattach handler in case it was removed at finish
    document.removeEventListener("keydown", handleKeydown);
    document.addEventListener("keydown", handleKeydown);
  }

  document.addEventListener("DOMContentLoaded", () => {
    addText();
    highlightCurrent();
    document.addEventListener("keydown", handleKeydown);
    resetBtn.addEventListener("click", reset);
  });
