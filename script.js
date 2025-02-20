const questions = [
    { q: "I stand guard, allowing only a forward march, but in reverse, I shut the gates. Who am I?", a: "Diode", room: "Room 405" },
    { q: "I do not move, yet I shape the journey of all who pass through me. Their force weakens in my presence, yet without me, destruction looms. What am I?", a: "Resistor", room: "AEC Lab" },
    { q: "I dance with electromagnetism, changing power’s height without ever touching it. Who am I?", a: "Transformer", room: "Room 303" }
];

let attemptCounts = JSON.parse(localStorage.getItem("attemptCounts")) || Array(questions.length).fill(0);
let correctAnswersCount = JSON.parse(localStorage.getItem("correctAnswersCount")) || 0;
let answeredQuestions = JSON.parse(localStorage.getItem("answeredQuestions")) || Array(questions.length).fill(false);
let userAnswers = JSON.parse(localStorage.getItem("userAnswers")) || Array(questions.length).fill("");
let quizCompleted = JSON.parse(localStorage.getItem("quizCompleted")) || false;
let roomLocationStored = localStorage.getItem("roomLocation") || "";
let quizTimedOut = JSON.parse(localStorage.getItem("quizTimedOut")) || false;

let timeLeft = JSON.parse(localStorage.getItem("timeLeft"));
if (timeLeft === null) timeLeft = 180;

const timerElement = document.getElementById("timer");
const roomLocation = document.getElementById("roomLocation");
let timerInterval;

function startTimer() {
    if (quizCompleted) {
        timerElement.innerText = `Time Left: ${formatTime(timeLeft)}`;
        return;
    }

    if (quizTimedOut) {
        endQuizDueToTimeout();
        return;
    }

    timerInterval = setInterval(() => {
        if (correctAnswersCount === questions.length) {
            clearInterval(timerInterval);
            timerElement.style.display = "none";
        } else if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endQuizDueToTimeout();
        } else {
            timeLeft--;
            localStorage.setItem("timeLeft", JSON.stringify(timeLeft));
            timerElement.innerText = `Time Left: ${formatTime(timeLeft)}`;
        }
    }, 1000);

    localStorage.setItem("timerRunning", JSON.stringify(true));
}

function formatTime(seconds) {
    let minutes = Math.floor(seconds / 60);
    let secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
}

function endQuizDueToTimeout() {
    localStorage.setItem("quizTimedOut", JSON.stringify(true));
    timerElement.innerText = "Time's Up!";
    timerElement.style.backgroundColor = "red";
    document.querySelectorAll("input, button").forEach((el) => el.disabled = true);
}

const questionContainer = document.getElementById("questionContainer");
questions.forEach((q, index) => {
    questionContainer.innerHTML += `
        <div class="question">
            <p>${q.q}</p>
            <input type="text" id="answer${index}" value="${userAnswers[index]}" placeholder="Your Answer" ${answeredQuestions[index] ? 'disabled' : ''}>
            <button onclick="checkAnswer(${index})" ${answeredQuestions[index] ? 'disabled' : ''}>Submit</button>
            <p id="feedback${index}" class="feedback" style="color: ${answeredQuestions[index] ? 'green' : 'white'};">
                ${answeredQuestions[index] ? "Correct!" : ""}
            </p>
            <p id="attempts${index}" class="attempt-message">Attempts: ${attemptCounts[index]}</p>
        </div>
    `;
});

function checkAnswer(index) {
    if (quizTimedOut) return;

    let answerInput = document.getElementById(`answer${index}`);
    let feedbackMessage = document.getElementById(`feedback${index}`);
    let attemptMessage = document.getElementById(`attempts${index}`);
    let button = document.querySelector(`.question:nth-child(${index + 1}) button`);

    let userAnswer = answerInput.value.trim().toLowerCase();
    let correctAnswers = questions[index].a.toLowerCase().split(" || ");

    if (!userAnswer) return;

    button.disabled = true;
    button.innerText = "Checking...";
    
    setTimeout(() => {
        attemptCounts[index]++;
        localStorage.setItem("attemptCounts", JSON.stringify(attemptCounts));

        if (correctAnswers.includes(userAnswer)) { 
            feedbackMessage.innerText = "Correct!";
            feedbackMessage.style.color = "green";
            answeredQuestions[index] = true;
            userAnswers[index] = userAnswer;
            answerInput.disabled = true;
            button.disabled = true;
            button.innerText = "Submitted";

            correctAnswersCount++;
            localStorage.setItem("correctAnswersCount", correctAnswersCount);
            localStorage.setItem("answeredQuestions", JSON.stringify(answeredQuestions));
            localStorage.setItem("userAnswers", JSON.stringify(userAnswers));

            if (correctAnswersCount === questions.length) {
                showCompletionMessage();
            }
        } else {
            feedbackMessage.innerText = "Incorrect! Try again.";
            feedbackMessage.style.color = "red";
            button.disabled = false;
            button.innerText = "Submit";
        }

        attemptMessage.innerText = `Attempts: ${attemptCounts[index]}`;
    }, 1500);
}

function showCompletionMessage() {
    clearInterval(timerInterval);
    localStorage.setItem("timerRunning", JSON.stringify(false));

    let roomNumbers = questions.map((q, index) => 
        `<p><b>${q.room}</b> → ${userAnswers[index]}</p>` 
    ).join("");

    roomLocationStored = `<h3>🎉 Congratulations! You have successfully completed the quiz. 🎉</h3>
                          <p><b>Time Left: ${formatTime(timeLeft)}</b></p>
                          ${roomNumbers}`;
    
    localStorage.setItem("roomLocation", roomLocationStored);
    localStorage.setItem("quizCompleted", JSON.stringify(true));

    roomLocation.innerHTML = roomLocationStored;
    roomLocation.style.display = "block";

    timerElement.innerText = `Time Left: ${formatTime(timeLeft)}`;
    timerElement.style.color = "green";

    setTimeout(() => {
        document.getElementById("roomLocation").scrollIntoView({ behavior: "smooth", block: "start" });
    }, 1000);
}

if (quizCompleted) {
    roomLocation.innerHTML = roomLocationStored;
    roomLocation.style.display = "block";
    timerElement.innerText = `Time Left: ${formatTime(timeLeft)}`;
} else if (quizTimedOut) {
    endQuizDueToTimeout();
} else {
    startTimer();
}