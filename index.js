const letterColors = [
  "#ff6b6b",
  "#4ecdc4",
  "#feca57",
  "#48dbfb",
  "#1dd1a1",
  "#ff9ff3",
  "#a29bfe",
  "#fd79a8",
];

function createStars() {
  for (let i = 0; i < 50; i++) {
    const star = document.createElement("div");
    star.className = "star";
    star.style.width = Math.random() * 3 + "px";
    star.style.height = star.style.width;
    star.style.left = Math.random() * 100 + "%";
    star.style.top = Math.random() * 100 + "%";
    star.style.animationDelay = Math.random() * 3 + "s";
    document.body.appendChild(star);
  }
}
createStars();

let lastCheckedWord = "";
let difficulty = "medium";
let originalWord = "";
let characters = [];
let startTime = null;
let timerInterval = null;
let attempts = 0;
let hintVisible = false;
let draggedElement = null;
let draggedClone = null;
let offsetX = 0;
let offsetY = 0;

document.getElementById("displayBtn").addEventListener("click", displayText);
document.getElementById("textInput").addEventListener("keypress", (e) => {
  if (e.key === "Enter") displayText();
});

function setDifficulty(level) {
  difficulty = level;

  document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  document.querySelector(`.difficulty-btn.${level}`).classList.add("active");

  const input = document.getElementById("textInput");
  if (level === "easy") {
    input.placeholder = "🟢 Введи коротке слово (3-5 букв)";
  } else if (level === "medium") {
    input.placeholder = "🟡 Введи середнє слово (6-8 букв)";
  } else {
    input.placeholder = "🔴 Введи довге слово (9+ букв)";
  }
}

// function displayText() {
//   const text = document.getElementById("textInput").value.trim().toUpperCase();
//   if (!text) return;

//   const length = text.length;

//   if (difficulty === "easy" && (length < 3 || length > 5)) {
//     alert("🟢 Легкий рівень: введи слово від 3 до 5 букв!");
//     return;
//   }
//   if (difficulty === "medium" && (length < 6 || length > 8)) {
//     alert("🟡 Середній рівень: введи слово від 6 до 8 букв!");
//     return;
//   }
//   if (difficulty === "hard" && length < 9) {
//     alert("🔴 Важкий рівень: введи слово від 9 букв!");
//     return;
//   }
function showError(message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.innerHTML = message;
  document.body.appendChild(errorDiv);

  setTimeout(() => errorDiv.remove(), 3000);
}

function displayText() {
  const text = document.getElementById("textInput").value.trim().toUpperCase();
  if (!text) return;

  const length = text.length;

  if (difficulty === "easy" && (length < 3 || length > 5)) {
    showError("🟢 Потрібно слово<br>від 3 до 5 букв!");
    return;
  }
  if (difficulty === "medium" && (length < 6 || length > 8)) {
    showError("🟡 Потрібно слово<br>від 6 до 8 букв!");
    return;
  }
  if (difficulty === "hard" && length < 9) {
    showError("🔴 Потрібно слово<br>від 9 букв!");
    return;
  }

  originalWord = text;
  attempts = 0;
  document.getElementById("attemptsDisplay").textContent = "0";
  updateStars();

  startTime = Date.now();
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = setInterval(updateTimer, 1000);

  const hintDisplay = document.getElementById("hintDisplay");
  const hintBtn = document.getElementById("hintBtn");

  hintDisplay.textContent = text;

  if (difficulty === "easy") {
    hintDisplay.classList.remove("hidden");
    hintBtn.textContent = "🙈 Підказка тут";
    hintBtn.disabled = true;
    hintVisible = true;
  } else if (difficulty === "hard") {
    hintDisplay.classList.add("hidden");
    hintBtn.textContent = "🚫 Без підказок";
    hintBtn.disabled = true;
    hintVisible = false;
  } else {
    hintDisplay.classList.add("hidden");
    hintBtn.textContent = "👀 Підказка";
    hintBtn.disabled = false;
    hintVisible = false;
  }

  document.getElementById("checkBtn").disabled = false;
  document.getElementById("shuffleBtn").disabled = false;

  let letters = shuffleArray([...text]);

  const textDisplay = document.getElementById("textDisplay");
  textDisplay.innerHTML = "";
  characters = [];

  letters.forEach((char, index) => {
    setTimeout(() => {
      createFallingLetter(char, index);
      setTimeout(() => {
        const charElement = document.createElement("span");
        charElement.className = "character";
        charElement.textContent = char;
        charElement.dataset.char = char;

        const color =
          letterColors[Math.floor(Math.random() * letterColors.length)];
        charElement.style.borderColor = color;
        charElement.style.color = color;
        charElement.style.animationDelay = index * 0.1 + "s";

        charElement.addEventListener("mousedown", onMouseDown);

        textDisplay.appendChild(charElement);
        characters.push(charElement);
      }, 1000);
    }, index * 200);
  });

  document.getElementById("textInput").value = "";
}

function createFallingLetter(char, index) {
  const falling = document.createElement("div");
  falling.className = "falling-letter";
  falling.textContent = char;
  falling.style.left = window.innerWidth / 2 - 200 + index * 60 + "px";
  const color = letterColors[Math.floor(Math.random() * letterColors.length)];
  falling.style.color = color;
  document.body.appendChild(falling);

  setTimeout(() => falling.remove(), 1200);
}

function shuffleArray(array) {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  if (newArray.join("") === array.join("") && array.length > 1) {
    return shuffleArray(array);
  }
  return newArray;
}

function onMouseDown(e) {
  e.preventDefault();

  draggedElement = e.target;
  const rect = draggedElement.getBoundingClientRect();
  const computedStyle = window.getComputedStyle(draggedElement);

  offsetX = rect.width / 2;
  offsetY = rect.height / 2;

  draggedClone = draggedElement.cloneNode(true);
  draggedClone.style.position = "fixed";
  draggedClone.style.left = e.clientX - offsetX + "px";
  draggedClone.style.top = e.clientY - offsetY + "px";
  draggedClone.style.width = rect.width + "px";
  draggedClone.style.height = rect.height + "px";
  draggedClone.style.margin = "0";
  draggedClone.style.padding = computedStyle.padding;
  draggedClone.style.fontSize = computedStyle.fontSize;
  draggedClone.style.fontWeight = computedStyle.fontWeight;
  draggedClone.style.border = computedStyle.border;
  draggedClone.style.borderRadius = computedStyle.borderRadius;
  draggedClone.style.backgroundColor = computedStyle.backgroundColor;
  draggedClone.style.zIndex = "1000";
  draggedClone.style.opacity = "0.95";
  draggedClone.style.cursor = "grabbing";
  draggedClone.style.pointerEvents = "none";
  draggedClone.style.transition = "none";
  draggedClone.style.transform = "none";
  draggedClone.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
  draggedClone.style.display = "flex";
  draggedClone.style.alignItems = "center";
  draggedClone.style.justifyContent = "center";
  document.body.appendChild(draggedClone);
  draggedElement.style.visibility = "hidden";

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(e) {
  if (!draggedClone) return;

  draggedClone.style.left = e.clientX - offsetX + "px";
  draggedClone.style.top = e.clientY - offsetY + "px";

  const elementBelow = document.elementFromPoint(e.clientX, e.clientY);

  document.querySelectorAll(".character").forEach((c) => {
    c.classList.remove("drop-target");
  });

  if (
    elementBelow &&
    elementBelow.classList.contains("character") &&
    elementBelow !== draggedElement
  ) {
    elementBelow.classList.add("drop-target");
  }
}

function onMouseUp(e) {
  if (!draggedElement) return;

  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);

  if (draggedClone) {
    draggedClone.remove();
    draggedClone = null;
  }

  draggedElement.style.visibility = "";

  const elementBelow = document.elementFromPoint(e.clientX, e.clientY);

  document.querySelectorAll(".character").forEach((c) => {
    c.classList.remove("drop-target");
  });

  if (
    elementBelow &&
    elementBelow.classList.contains("character") &&
    elementBelow !== draggedElement
  ) {
    swapCharacters(draggedElement, elementBelow);
  }

  draggedElement = null;
}

function swapCharacters(char1, char2) {
  const parent = char1.parentElement;
  const next1 = char1.nextSibling;
  const next2 = char2.nextSibling;

  if (next1 === char2) {
    parent.insertBefore(char2, char1);
  } else if (next2 === char1) {
    parent.insertBefore(char1, char2);
  } else {
    if (next1) {
      parent.insertBefore(char2, next1);
    } else {
      parent.appendChild(char2);
    }

    if (next2) {
      parent.insertBefore(char1, next2);
    } else {
      parent.appendChild(char1);
    }
  }

  characters = Array.from(parent.children);
  char1.classList.remove("correct", "incorrect");
  char2.classList.remove("correct", "incorrect");
}

function updateTimer() {
  const elapsed = Math.floor((Date.now() - startTime) / 1000);
  const minutes = Math.floor(elapsed / 60);
  const seconds = elapsed % 60;
  document.getElementById("timerDisplay").textContent =
    String(minutes).padStart(2, "0") + ":" + String(seconds).padStart(2, "0");
}

function updateStars() {
  const elapsed = startTime ? Math.floor((Date.now() - startTime) / 1000) : 0;
  let stars = "☆☆☆";

  if (attempts === 0) {
    stars = "⭐⭐⭐";
  } else if (elapsed < 30 && attempts === 1) {
    stars = "⭐⭐⭐";
  } else if (elapsed < 60 && attempts <= 2) {
    stars = "⭐⭐☆";
  } else if (attempts <= 3) {
    stars = "⭐☆☆";
  }

  document.getElementById("starsDisplay").textContent = stars;
}

function checkWord() {
  const currentWord = characters.map((char) => char.dataset.char).join("");

  if (lastCheckedWord === currentWord && lastCheckedWord !== "") {
    return;
  }

  lastCheckedWord = currentWord;

  attempts++;
  document.getElementById("attemptsDisplay").textContent = attempts;
  updateStars();

  const isCorrect = currentWord === originalWord;

  characters.forEach((char, index) => {
    char.classList.remove("correct", "incorrect");

    setTimeout(() => {
      if (char.dataset.char === originalWord[index]) {
        char.classList.add("correct");
      } else {
        char.classList.add("incorrect");
      }
    }, index * 150);
  });

  if (isCorrect) {
    const checkBtn = document.getElementById("checkBtn");
    const originalText = checkBtn.textContent;
    checkBtn.textContent = "🎉 Молодець!";
    checkBtn.disabled = true;

    setTimeout(() => {
      showSuccess();
      createConfetti();
      if (timerInterval) clearInterval(timerInterval);
    }, characters.length * 150 + 800);
  }
}

function toggleHint() {
  if (difficulty === "easy" || difficulty === "hard") return;

  hintVisible = !hintVisible;
  const hintDisplay = document.getElementById("hintDisplay");
  const hintBtn = document.getElementById("hintBtn");

  if (hintVisible) {
    hintDisplay.classList.remove("hidden");
    hintBtn.textContent = "🙈 Сховати";
  } else {
    hintDisplay.classList.add("hidden");
    hintBtn.textContent = "👀 Підказка";
  }
}

function showSuccess() {
  const message = document.createElement("div");
  message.className = "success-message";
  const stars = document.getElementById("starsDisplay").textContent;
  message.innerHTML = `🎉 Вітаємо! 🎉<br><div style="font-size: 48px; margin-top: 20px;">${stars}</div>`;
  document.body.appendChild(message);

  setTimeout(() => message.remove(), 4000);
}

function createConfetti() {
  const colors = letterColors;
  const shapes = ["🎉", "🎊", "⭐", "✨", "🌟", "💫"];

  for (let i = 0; i < 80; i++) {
    setTimeout(() => {
      const confetti = document.createElement("div");
      confetti.className = "confetti";
      confetti.style.left = Math.random() * 100 + "%";
      confetti.style.top = "-20px";

      if (Math.random() > 0.5) {
        confetti.style.width = Math.random() * 15 + 10 + "px";
        confetti.style.height = confetti.style.width;
        confetti.style.borderRadius = "50%";
        confetti.style.background =
          colors[Math.floor(Math.random() * colors.length)];
      } else {
        confetti.textContent =
          shapes[Math.floor(Math.random() * shapes.length)];
        confetti.style.fontSize = Math.random() * 20 + 20 + "px";
      }

      document.body.appendChild(confetti);
      setTimeout(() => confetti.remove(), 3000);
    }, i * 40);
  }
}

function shuffleLetters() {
  if (characters.length === 0) return;

  const parent = characters[0].parentElement;
  const shuffledIndices = shuffleArray([...Array(characters.length).keys()]);

  const fragment = document.createDocumentFragment();
  shuffledIndices.forEach((index) => {
    fragment.appendChild(characters[index]);
  });

  parent.innerHTML = "";
  parent.appendChild(fragment);

  characters = Array.from(parent.children);

  characters.forEach((char) => {
    const oldChar = char.cloneNode(true);
    char.replaceWith(oldChar);
    oldChar.addEventListener("mousedown", onMouseDown);
    characters[characters.indexOf(char)] = oldChar;
  });

  characters = Array.from(parent.children);

  lastCheckedWord = "";
  const checkBtn = document.getElementById("checkBtn");
  checkBtn.textContent = "Перевірити";
  checkBtn.disabled = false;

  characters.forEach((char) => {
    char.classList.remove("correct", "incorrect");
  });
}

function resetText() {
  const checkBtn = document.getElementById("checkBtn");
  checkBtn.textContent = "Перевірити";
  checkBtn.disabled = true;

  document.getElementById("textDisplay").innerHTML = "";
  document.getElementById("textInput").value = "";
  document.getElementById("hintDisplay").classList.add("hidden");
  document.getElementById("hintBtn").disabled = false;
  document.getElementById("shuffleBtn").disabled = true;
  document.getElementById("hintBtn").textContent = "👀 Підказка";
  document.getElementById("timerDisplay").textContent = "00:00";
  document.getElementById("attemptsDisplay").textContent = "0";
  document.getElementById("starsDisplay").textContent = "☆☆☆";

  if (timerInterval) clearInterval(timerInterval);

  characters = [];
  originalWord = "";
  hintVisible = false;
  attempts = 0;
  startTime = null;
  lastCheckedWord = "";
}

window.setDifficulty = setDifficulty;
window.toggleHint = toggleHint;
window.shuffleLetters = shuffleLetters;
window.resetText = resetText;
window.checkWord = checkWord;
