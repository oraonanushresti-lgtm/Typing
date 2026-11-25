
// ======================================
// TYPEMASTER - JAVASCRIPT ENGINE
// ======================================


// 1. HTML ELEMENTS

const modeButtons = document.querySelectorAll(".mode");

const timeSettings = document.getElementById("time-settings");
const wordsSettings = document.getElementById("words-settings");

const typingArea = document.getElementById("typing-area");
const textDisplay = document.getElementById("text-display");
const typingInput = document.getElementById("typing-input");

const wpmDisplay = document.getElementById("wpm");
const accuracyDisplay = document.getElementById("accuracy");
const timerDisplay = document.getElementById("timer");
const timerLabel = document.getElementById("timer-label");

const startHint = document.getElementById("start-hint");
const progressDisplay = document.getElementById("progress");

const startButton = document.getElementById("start-btn");
const restartButton = document.getElementById("restart-btn");
const tryAgainButton = document.getElementById("try-again");

const results = document.getElementById("results");
const finalWpm = document.getElementById("final-wpm");
const finalAccuracy = document.getElementById("final-accuracy");
const finalErrors = document.getElementById("final-errors");


// 2. TEST VARIABLES

let currentMode = "time";

let selectedTime = 30;
let selectedWords = 25;

let originalText = "";

let timerInterval = null;

let startTime = null;
let endTime = null;

let testStarted = false;
let testFinished = false;


// 3. WORD BANK

const wordBank = [
    "about", "above", "across", "action", "always",
    "animal", "answer", "around", "beautiful", "because",
    "before", "believe", "between", "bright", "change",
    "choice", "city", "clear", "common", "create",
    "curious", "different", "dream", "early", "earth",
    "easy", "enjoy", "every", "example", "experience",
    "family", "fast", "feeling", "flower", "follow",
    "friend", "future", "garden", "gentle", "great",
    "happiness", "healthy", "help", "history", "honest",
    "important", "improve", "journey", "knowledge", "language",
    "learning", "light", "listen", "little", "moment",
    "morning", "nature", "never", "normal", "nothing",
    "people", "perfect", "practice", "problem", "question",
    "quiet", "reason", "remember", "simple", "something",
    "special", "strength", "success", "together", "travel",
    "understand", "useful", "value", "wonderful", "world"
];


// 4. QUOTE BANK

const quotes = [
    "The secret of getting ahead is getting started.",
    "Great things are done by a series of small things brought together.",
    "It always seems impossible until it is done.",
    "Believe you can and you are halfway there.",
    "The future depends on what you do today.",
    "Do something today that your future self will thank you for.",
    "Success is the sum of small efforts repeated day in and day out.",
    "Learning never exhausts the mind.",
    "Everything you can imagine is real.",
    "Little by little, one travels far."
];


// 5. GENERATE RANDOM WORDS

function generateWords(count) {

    let words = [];

    for (let i = 0; i < count; i++) {

        const randomIndex = Math.floor(
            Math.random() * wordBank.length
        );

        words.push(wordBank[randomIndex]);

    }

    return words.join(" ");

}


// 6. GENERATE TEST TEXT

function generateText() {

    if (currentMode === "quote") {

        let availableQuotes = quotes.filter(
            quote => quote !== originalText
        );

        const randomIndex = Math.floor(
            Math.random() * availableQuotes.length
        );

        return availableQuotes[randomIndex];

    }

    if (currentMode === "words") {

        return generateWords(selectedWords);

    }

    // Time mode gets a long passage so the timer
    // determines when the test finishes.

    return generateWords(350);

}


// 7. DISPLAY AND HIGHLIGHT TEXT

function renderText() {

    const typedText = typingInput.value;

    textDisplay.replaceChildren();

    let currentCharacter = null;

    for (let i = 0; i < originalText.length; i++) {

        const span = document.createElement("span");

        span.textContent = originalText[i];

        if (i < typedText.length) {

            if (typedText[i] === originalText[i]) {

                span.classList.add("correct");

            } else {

                span.classList.add("incorrect");

            }

        } else if (i === typedText.length && !testFinished) {

            span.classList.add("current");
            currentCharacter = span;

        }

        textDisplay.appendChild(span);

    }

    // Keep the current typing position visible.

    if (currentCharacter) {

        const displayTop = textDisplay.getBoundingClientRect().top;
        const characterTop = currentCharacter.getBoundingClientRect().top;

        if (
            characterTop < displayTop ||
            characterTop > displayTop + textDisplay.clientHeight
        ) {

            currentCharacter.scrollIntoView({
                block: "nearest"
            });

        }

    }

}


// 8. START TEST

function startTest() {

    if (testStarted || testFinished) {
        return;
    }

    testStarted = true;

    startTime = Date.now();
    endTime = null;

    typingInput.disabled = false;
    typingInput.focus();

    startButton.disabled = true;

    startHint.classList.add("hidden");

    progressDisplay.textContent = "Keep typing...";

    if (currentMode === "time") {

        timerInterval = setInterval(updateTimer, 100);

    } else {

        timerInterval = setInterval(updateElapsedTime, 100);

    }

}


// 9. UPDATE COUNTDOWN TIMER

function updateTimer() {

    const elapsedSeconds =
        (Date.now() - startTime) / 1000;

    const remaining = Math.max(
        0,
        selectedTime - elapsedSeconds
    );

    timerDisplay.textContent = Math.ceil(remaining);

    updateStats();

    if (remaining <= 0) {

        finishTest();

    }

}


// 10. UPDATE ELAPSED TIME

function updateElapsedTime() {

    const elapsedSeconds = Math.floor(
        (Date.now() - startTime) / 1000
    );

    timerDisplay.textContent = elapsedSeconds;

    updateStats();

}


// 11. CALCULATE WPM, ACCURACY AND ERRORS

function calculateStats() {

    const typedText = typingInput.value;

    let correctCharacters = 0;
    let errors = 0;

    for (let i = 0; i < typedText.length; i++) {

        if (
            i < originalText.length &&
            typedText[i] === originalText[i]
        ) {

            correctCharacters++;

        } else {

            errors++;

        }

    }

    // Accuracy calculation

    const accuracy = typedText.length > 0
        ? (correctCharacters / typedText.length) * 100
        : 100;


    // Calculate elapsed time

    let elapsedMinutes = 0;

    if (startTime !== null) {

        const effectiveEndTime =
            endTime !== null ? endTime : Date.now();

        elapsedMinutes =
            (effectiveEndTime - startTime) / 60000;

    }


    // WPM calculation:
    // Standard word = 5 characters

    const wpm = elapsedMinutes > 0
        ? (correctCharacters / 5) / elapsedMinutes
        : 0;


    return {
        wpm: Math.round(wpm),
        accuracy: accuracy.toFixed(1),
        errors: errors
    };

}


// 12. UPDATE LIVE STATISTICS

function updateStats() {

    const stats = calculateStats();

    wpmDisplay.textContent = stats.wpm;

    accuracyDisplay.textContent =
        stats.accuracy + "%";

}


// 13. HANDLE TYPING

typingInput.addEventListener("input", function () {

    if (!testStarted || testFinished) {
        return;
    }

    renderText();

    updateStats();

    const typedLength = typingInput.value.length;

    // Word and quote modes finish when the passage is completed.

    if (
        currentMode !== "time" &&
        typedLength >= originalText.length
    ) {

        finishTest();

    }

});


// 14. FINISH TEST

function finishTest() {

    if (testFinished) {
        return;
    }

    endTime = Date.now();

    clearInterval(timerInterval);

    testStarted = false;
    testFinished = true;

    typingInput.disabled = true;

    startButton.disabled = false;
    startButton.textContent = "Try Again";

    const stats = calculateStats();

    wpmDisplay.textContent = stats.wpm;
    accuracyDisplay.textContent = stats.accuracy + "%";

    finalWpm.textContent = stats.wpm;

    finalAccuracy.textContent =
        stats.accuracy + "%";

    finalErrors.textContent = stats.errors;

    progressDisplay.textContent = "Test completed!";

    renderText();

    results.classList.remove("hidden");

}


// 15. RESET TEST

function restartTest() {

    clearInterval(timerInterval);

    testStarted = false;
    testFinished = false;

    startTime = null;
    endTime = null;

    typingInput.value = "";
    typingInput.disabled = true;

    startButton.disabled = false;
    startButton.textContent = "Start Test";

    wpmDisplay.textContent = "0";
    accuracyDisplay.textContent = "100%";

    results.classList.add("hidden");

    startHint.classList.remove("hidden");

    progressDisplay.textContent = "Ready to start?";

    originalText = generateText();

    renderText();

    if (currentMode === "time") {

        timerLabel.textContent = "time";
        timerDisplay.textContent = selectedTime;

    } else {

        timerLabel.textContent = "elapsed";
        timerDisplay.textContent = "0";

    }

}


// 16. CHANGE TEST MODE

modeButtons.forEach(button => {

    button.addEventListener("click", function () {

        currentMode = this.dataset.mode;

        modeButtons.forEach(btn => {
            btn.classList.remove("active");
        });

        this.classList.add("active");

        timeSettings.classList.toggle(
            "hidden",
            currentMode !== "time"
        );

        wordsSettings.classList.toggle(
            "hidden",
            currentMode !== "words"
        );

        restartTest();

    });

});


// 17. SELECT TEST DURATION

document.querySelectorAll("#time-settings .setting")
    .forEach(button => {

        button.addEventListener("click", function () {

            selectedTime = Number(this.dataset.value);

            document.querySelectorAll(
                "#time-settings .setting"
            ).forEach(btn => {
                btn.classList.remove("active");
            });

            this.classList.add("active");

            restartTest();

        });

    });


// 18. SELECT WORD COUNT

document.querySelectorAll("#words-settings .setting")
    .forEach(button => {

        button.addEventListener("click", function () {

            selectedWords = Number(this.dataset.value);

            document.querySelectorAll(
                "#words-settings .setting"
            ).forEach(btn => {
                btn.classList.remove("active");
            });

            this.classList.add("active");

            restartTest();

        });

    });


// 19. START BUTTON

startButton.addEventListener("click", function () {

    if (testFinished) {

        restartTest();

    }

    startTest();

});


// 20. RESTART BUTTON

restartButton.addEventListener("click", function () {

    restartTest();

});


// 21. TRY AGAIN BUTTON

tryAgainButton.addEventListener("click", function () {

    restartTest();

    startTest();

});


// 22. CLICK TYPING AREA TO START

typingArea.addEventListener("click", function () {

    if (testFinished) {
        return;
    }

    if (!testStarted) {

        startTest();

    }

    typingInput.focus();

});


// 23. INITIALIZE APPLICATION

restartTest();

