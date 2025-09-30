document.addEventListener("DOMContentLoaded", () => {
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
  let draggedElement = null;
  let draggedClone = null;
  let offsetX = 0;
  let offsetY = 0;
  let activePointerId = null;

  const displayBtn = document.getElementById("displayBtn");
  const textInput = document.getElementById("textInput");

  displayBtn && displayBtn.addEventListener("click", displayText);
  textInput &&
    textInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") displayText();
    });

  function setDifficulty(level) {
    difficulty = level;
    document.querySelectorAll(".difficulty-btn").forEach((btn) => {
      btn.classList.remove("active");
    });
    const btn = document.querySelector(`.difficulty-btn.${level}`);
    if (btn) btn.classList.add("active");
    const input = document.getElementById("textInput");
    if (!input) return;
    if (level === "easy") {
      input.placeholder = "🟢 Введи коротке слово (3-5 букв)";
    } else if (level === "medium") {
      input.placeholder = "🟡 Введи середнє слово (6-8 букв)";
    } else {
      input.placeholder = "🔴 Введи довге слово (9+ букв)";
    }
  }

  function showError(message) {
    const errorDiv = document.createElement("div");
    errorDiv.className = "error-message";
    errorDiv.innerHTML = message;
    document.body.appendChild(errorDiv);
    setTimeout(() => errorDiv.remove(), 3000);
  }

  function displayText() {
    const inputEl = document.getElementById("textInput");
    if (!inputEl) return;
    const text = inputEl.value.trim().toUpperCase();
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

    lastCheckedWord = "";
    originalWord = text;
    attempts = 0;
    const attemptsDisplay = document.getElementById("attemptsDisplay");
    if (attemptsDisplay) attemptsDisplay.textContent = "0";
    updateStars();

    startTime = Date.now();
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(updateTimer, 1000);

    const hintDisplay = document.getElementById("hintDisplay");
    const hintBtn = document.getElementById("hintBtn");
    if (hintDisplay && hintBtn) {
      hintDisplay.textContent = text;
      if (difficulty === "easy") {
        hintDisplay.classList.remove("hidden");
        hintBtn.textContent = "🙈 Підказка тут";
        hintBtn.disabled = true;
      } else if (difficulty === "hard") {
        hintDisplay.classList.add("hidden");
        hintBtn.textContent = "🚫 Без підказок";
        hintBtn.disabled = true;
      } else {
        hintDisplay.classList.add("hidden");
        hintBtn.textContent = "👀 Підказка";
        hintBtn.disabled = false;
      }
    }

    const checkBtn = document.getElementById("checkBtn");
    const shuffleBtn = document.getElementById("shuffleBtn");
    if (checkBtn) {
      checkBtn.textContent = "Перевірити";
      checkBtn.disabled = false;
    }
    if (shuffleBtn) shuffleBtn.disabled = false;

    const letters = shuffleArray([...text]);
    const textDisplay = document.getElementById("textDisplay");
    if (!textDisplay) return;
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

          attachDragHandlers(charElement);

          textDisplay.appendChild(charElement);
          characters.push(charElement);
        }, 300);
      }, index * 150);
    });

    inputEl.value = "";
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

  function attachDragHandlers(el) {
    el.style.touchAction = "none";
    el.addEventListener("pointerdown", onPointerDown);
    el.tabIndex = -1;
  }

  function onPointerDown(e) {
    if (e.isPrimary === false) return;
    e.preventDefault();

    draggedElement = e.currentTarget;
    activePointerId = e.pointerId;

    const rect = draggedElement.getBoundingClientRect();
    const computedStyle = window.getComputedStyle(draggedElement);

    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    draggedClone = draggedElement.cloneNode(true);
    draggedClone.classList.add("dragged-clone");
    draggedClone.style.position = "fixed";
    draggedClone.style.width = rect.width + "px";
    draggedClone.style.height = rect.height + "px";
    draggedClone.style.margin = "0";
    draggedClone.style.padding = computedStyle.padding;
    draggedClone.style.fontSize = computedStyle.fontSize;
    draggedClone.style.fontWeight = computedStyle.fontWeight;
    draggedClone.style.border = computedStyle.border;
    draggedClone.style.borderRadius = computedStyle.borderRadius;
    draggedClone.style.backgroundColor = computedStyle.backgroundColor;
    draggedClone.style.zIndex = "9999";
    draggedClone.style.opacity = "0.95";
    draggedClone.style.cursor = "grabbing";
    draggedClone.style.pointerEvents = "none";
    draggedClone.style.transition = "none";
    draggedClone.style.transform = "none";
    draggedClone.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
    draggedClone.style.display = "flex";
    draggedClone.style.alignItems = "center";
    draggedClone.style.justifyContent = "center";

    draggedClone.style.left = e.clientX - offsetX + "px";
    draggedClone.style.top = e.clientY - offsetY + "px";

    document.body.appendChild(draggedClone);
    draggedElement.style.visibility = "hidden";

    document.addEventListener("pointermove", onPointerMove);
    document.addEventListener("pointerup", onPointerUp);
    document.addEventListener("pointercancel", onPointerUp);

    draggedElement.setPointerCapture(activePointerId);
  }

  function onPointerMove(e) {
    if (!draggedClone) return;
    if (activePointerId && e.pointerId !== activePointerId) return;

    e.preventDefault();
    draggedClone.style.left = e.clientX - offsetX + "px";
    draggedClone.style.top = e.clientY - offsetY + "px";

    const elBelow = document.elementFromPoint(e.clientX, e.clientY);
    document.querySelectorAll(".character").forEach((c) => {
      c.classList.remove("drop-target");
    });
    if (
      elBelow &&
      elBelow.classList &&
      elBelow.classList.contains("character") &&
      elBelow !== draggedElement
    ) {
      elBelow.classList.add("drop-target");
    }
  }

  function onPointerUp(e) {
    if (activePointerId && e.pointerId !== activePointerId) return;

    document.removeEventListener("pointermove", onPointerMove);
    document.removeEventListener("pointerup", onPointerUp);
    document.removeEventListener("pointercancel", onPointerUp);

    if (draggedClone) {
      draggedClone.remove();
      draggedClone = null;
    }

    if (!draggedElement) {
      activePointerId = null;
      return;
    }

    try {
      draggedElement.releasePointerCapture(activePointerId);
    } catch (err) {}

    draggedElement.style.visibility = "";

    const elBelow = document.elementFromPoint(e.clientX, e.clientY);
    document.querySelectorAll(".character").forEach((c) => {
      c.classList.remove("drop-target");
    });

    if (
      elBelow &&
      elBelow.classList &&
      elBelow.classList.contains("character") &&
      elBelow !== draggedElement
    ) {
      swapCharacters(draggedElement, elBelow);
    }

    draggedElement = null;
    activePointerId = null;
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
    characters.forEach((ch) => {
      ch.removeEventListener("pointerdown", onPointerDown);
      attachDragHandlers(ch);
    });

    lastCheckedWord = "";
    const checkBtn = document.getElementById("checkBtn");
    if (checkBtn) {
      checkBtn.textContent = "Перевірити";
      checkBtn.disabled = false;
    }

    characters.forEach((char) => {
      char.classList.remove("correct", "incorrect");
    });
  }

  function swapCharacters(char1, char2) {
    const parent = char1.parentElement;
    const index1 = Array.from(parent.children).indexOf(char1);
    const index2 = Array.from(parent.children).indexOf(char2);

    if (index1 < index2) {
      parent.insertBefore(char2, char1);
      parent.insertBefore(char1, parent.children[index2]);
    } else {
      parent.insertBefore(char1, char2);
      parent.insertBefore(char2, parent.children[index1]);
    }

    characters = Array.from(parent.children);
    char1.classList.remove("correct", "incorrect");
    char2.classList.remove("correct", "incorrect");
  }

  function updateTimer() {
    if (!startTime) return;
    const elapsed = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;
    const el = document.getElementById("timerDisplay");
    if (el)
      el.textContent =
        String(minutes).padStart(2, "0") +
        ":" +
        String(seconds).padStart(2, "0");
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

    const el = document.getElementById("starsDisplay");
    if (el) el.textContent = stars;
  }

  function showEncouragement() {
    const messages = [
      "Майже вийшло! <br>Спробуй ще раз!",
      "Не здавайся! <br>У тебе все вийде!",
      "Так близько! <br>Ще одна спроба!",
      "Молодець, що стараєшся! <br>Продовжуй!",
      "Ти на правильному шляху! <br>Давай ще раз!",
    ];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    const messageDiv = document.createElement("div");
    messageDiv.className = "error-message";
    messageDiv.innerHTML = randomMessage;
    document.body.appendChild(messageDiv);
    setTimeout(() => messageDiv.remove(), 2500);
  }

  function checkWord() {
    if (characters.length === 0) return;
    const currentWord = characters.map((char) => char.dataset.char).join("");
    if (lastCheckedWord === currentWord && lastCheckedWord !== "") return;
    lastCheckedWord = currentWord;

    attempts++;
    const aEl = document.getElementById("attemptsDisplay");
    if (aEl) aEl.textContent = attempts;
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
      if (checkBtn) {
        checkBtn.textContent = "🎉 Молодець!";
        checkBtn.disabled = true;
      }
      setTimeout(() => {
        showSuccess();
        createConfetti();
        if (timerInterval) clearInterval(timerInterval);
      }, characters.length * 150 + 800);
    } else {
      setTimeout(() => {
        showEncouragement();
      }, characters.length * 150 + 300);
    }
  }

  function toggleHint() {
    if (difficulty === "easy" || difficulty === "hard") return;
    const hintDisplay = document.getElementById("hintDisplay");
    const hintBtn = document.getElementById("hintBtn");
    if (!hintDisplay || !hintBtn) return;
    hintDisplay.classList.toggle("hidden");
    hintBtn.textContent = hintDisplay.classList.contains("hidden")
      ? "👀 Підказка"
      : "🙈 Сховати";
  }

  function showSuccess() {
    const message = document.createElement("div");
    message.className = "success-message";
    const stars = document.getElementById("starsDisplay")
      ? document.getElementById("starsDisplay").textContent
      : "";
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

  function resetText() {
    const checkBtn = document.getElementById("checkBtn");
    if (checkBtn) {
      checkBtn.textContent = "Перевірити";
      checkBtn.disabled = true;
    }
    const td = document.getElementById("textDisplay");
    if (td) td.innerHTML = "";
    const input = document.getElementById("textInput");
    if (input) input.value = "";
    const hintDisplay = document.getElementById("hintDisplay");
    if (hintDisplay) hintDisplay.classList.add("hidden");
    const hintBtn = document.getElementById("hintBtn");
    if (hintBtn) hintBtn.disabled = true;
    const shuffleBtn = document.getElementById("shuffleBtn");
    if (shuffleBtn) shuffleBtn.disabled = true;
    const timerDisplay = document.getElementById("timerDisplay");
    if (timerDisplay) timerDisplay.textContent = "00:00";
    const attemptsDisplay = document.getElementById("attemptsDisplay");
    if (attemptsDisplay) attemptsDisplay.textContent = "0";
    const starsDisplay = document.getElementById("starsDisplay");
    if (starsDisplay) starsDisplay.textContent = "☆☆☆";
    if (timerInterval) clearInterval(timerInterval);
    characters = [];
    originalWord = "";
    attempts = 0;
    startTime = null;
    lastCheckedWord = "";
    if (input) {
      input.value = "";
      input.focus();
    }
  }

  window.setDifficulty = setDifficulty;
  window.toggleHint = toggleHint;
  window.shuffleLetters = shuffleLetters;
  window.resetText = resetText;
  window.checkWord = checkWord;

  if (textInput) {
    displayBtn.disabled = true;
    textInput.addEventListener("input", () => {
      displayBtn.disabled = !textInput.value.trim();
    });
  }
});
