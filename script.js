document.addEventListener("DOMContentLoaded", () => {
  /* BACKGROUND MUSIC (best we can do with browser rules) */
  const bgMusic = document.getElementById("bgMusic");
  const musicToggle = document.getElementById("musicToggle");

  let musicInitialized = false; // we tried to start/unmute at least once
  let musicPlaying = false;

  function updateMusicIcon() {
    if (!musicToggle) return;
    musicToggle.textContent = musicPlaying ? "🎵" : "♪";
    musicToggle.classList.toggle("paused", !musicPlaying);
  }

  function initMusic() {
    if (!bgMusic || musicInitialized) return;
    musicInitialized = true;

    // unmute and try to play
    bgMusic.muted = false;
    bgMusic
      .play()
      .then(() => {
        musicPlaying = true;
        updateMusicIcon();
      })
      .catch((err) => {
        // if this fails, user still has the toggle button
        console.warn("Autoplay/unmute blocked until more interaction:", err);
      });
  }

  if (musicToggle) {
    musicToggle.addEventListener("click", () => {
      if (!bgMusic) return;

      // first click on toggle should also init music if not done
      if (!musicInitialized) {
        initMusic();
        return;
      }

      if (musicPlaying) {
        bgMusic.pause();
        musicPlaying = false;
      } else {
        bgMusic
          .play()
          .then(() => {
            musicPlaying = true;
          })
          .catch((err) => console.warn(err));
      }
      updateMusicIcon();
    });
  }

  // 🔥 Try to start music on FIRST interaction anywhere
  ["click", "scroll", "keydown"].forEach((evt) => {
    window.addEventListener(
      evt,
      () => {
        initMusic();
      },
      { once: true }
    );
  });

  /* Smooth scroll for nav links */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const targetId = link.getAttribute("href");
      const section = document.querySelector(targetId);
      if (section) {
        section.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* Hero button scroll + also trigger music */
  const startJourneyBtn = document.getElementById("startJourney");
  if (startJourneyBtn) {
    startJourneyBtn.addEventListener("click", () => {
      const reasonsSection = document.getElementById("reasons");
      if (reasonsSection) {
        reasonsSection.scrollIntoView({ behavior: "smooth" });
      }
      // also count this as "user interaction" to start music
      initMusic();
    });
  }

    /* Flip cards for reasons */
  const reasonCards = document.querySelectorAll(".reason-card .card-inner");
  reasonCards.forEach((inner) => {
    inner.addEventListener("click", () => {
      inner.classList.toggle("flipped");
    });
  });

  /* QUIZ LOGIC */
  const checkQuizBtn = document.getElementById("checkQuiz");
  const quizResult = document.getElementById("quizResult");

  if (checkQuizBtn && quizResult) {
    checkQuizBtn.addEventListener("click", () => {
      const questions = document.querySelectorAll(".quiz-question");
      let score = 0;
      let total = questions.length;

      questions.forEach((q) => {
        const correct = q.getAttribute("data-answer");
        const selected = q.querySelector("input[type='radio']:checked");
        if (selected && selected.value === correct) {
          score++;
        }
      });

      let message = `You got ${score} / ${total} the way I see you 💗 — `;

      const ratio = score / total;
      if (ratio === 1) {
        message += "we share the same braincell actually.";
      } else if (ratio >= 0.66) {
        message += "pretty accurate tbh, I approve 👑.";
      } else if (ratio >= 0.33) {
        message += "you are you, but I know you slightly better 😌.";
      } else {
        message += "wow okay, we need a rebranding talk.";
      }

      quizResult.textContent = message;
    });
  }

  /* SECRET MESSAGE LOGIC */
  const unlockBtn = document.getElementById("unlockSecret");
  const passwordInput = document.getElementById("secret-password");
  const secretMessage = document.getElementById("secretMessage");
  const secretError = document.getElementById("secretError");

  if (unlockBtn && passwordInput && secretMessage && secretError) {
    unlockBtn.addEventListener("click", () => {
      const value = passwordInput.value.trim().toLowerCase();
      const correctPassword = "jaan";

      if (value === correctPassword) {
        secretMessage.classList.remove("hidden");
        secretError.textContent = "";
      } else {
        secretMessage.classList.add("hidden");
        secretError.textContent =
          "Nope, that’s not it. Think again 👀";
        passwordInput.classList.remove("shake");
        void passwordInput.offsetWidth; // restart animation
        passwordInput.classList.add("shake");
      }
    });

    // Allow pressing Enter inside password field
    passwordInput.addEventListener("keyup", (e) => {
      if (e.key === "Enter") {
        unlockBtn.click();
      }
    });
  }

  /* GAME LOGIC: Catch the hearts */
  const startGameBtn = document.getElementById("startGame");
  const gameArea = document.getElementById("gameArea");
  const gameScoreEl = document.getElementById("gameScore");
  const gameTimerEl = document.getElementById("gameTimer");
  const gameMessageEl = document.getElementById("gameMessage");

  let gameScore = 0;
  let timeLeft = 20;
  let gameInterval = null;
  let timerInterval = null;
  let gameRunning = false;

  function clearHearts() {
    if (!gameArea) return;
    const hearts = gameArea.querySelectorAll(".heart");
    hearts.forEach((heart) => heart.remove());
  }

  function updateGameText() {
    if (gameScoreEl) gameScoreEl.textContent = gameScore.toString();
    if (gameTimerEl) gameTimerEl.textContent = timeLeft.toString();
  }

  function spawnHeart() {
    if (!gameArea) return;

    const rect = gameArea.getBoundingClientRect();
    const heart = document.createElement("div");
    heart.classList.add("heart");
    heart.textContent = "💗";

    const size = 40;
    const x = Math.random() * (rect.width - size);
    const y = Math.random() * (rect.height - size);

    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;

    heart.addEventListener("click", () => {
      gameScore++;
      updateGameText();
      heart.remove();
    });

    gameArea.appendChild(heart);

    // Remove heart after 1.5s if not caught
    setTimeout(() => {
      if (heart.parentNode) {
        heart.remove();
      }
    }, 2500);
  }

  function endGame() {
    gameRunning = false;
    clearInterval(gameInterval);
    clearInterval(timerInterval);
    gameInterval = null;
    timerInterval = null;
    clearHearts();

    let message = "";
    if (gameScore >= 20) {
      message = "Okay overachiever 👑 You collected ALL the love.";
    } else if (gameScore >= 12) {
      message = "You’re definitely loved, no doubts about it 🫶";
    } else if (gameScore >= 5) {
      message =
        "You got some hearts! But don’t worry, you have mine by default 💗";
    } else {
      message =
        "Terrible at catching hearts, amazing at catching my vibes though 😌";
    }

    if (gameMessageEl) {
      gameMessageEl.textContent = message;
    }
  }

  function startGame() {
    if (!gameArea || !startGameBtn || gameRunning) return;

    // Reset
    gameRunning = true;
    gameScore = 0;
    timeLeft = 20;
    if (gameMessageEl) gameMessageEl.textContent = "";
    clearHearts();
    updateGameText();

    // Remove placeholder text
    const placeholder = gameArea.querySelector(".game-placeholder");
    if (placeholder) placeholder.remove();

    // Start spawning hearts
    gameInterval = setInterval(spawnHeart, 650);

    // Timer countdown
    timerInterval = setInterval(() => {
      timeLeft--;
      updateGameText();
      if (timeLeft <= 0) {
        clearInterval(timerInterval);
        clearInterval(gameInterval);
        endGame();
      }
    }, 1000);
  }

  if (startGameBtn) {
    startGameBtn.addEventListener("click", startGame);
  }

    /* BABY PANDA INTERACTION 🐼 */
  const panda = document.getElementById("panda");
  const pandaBubble = document.getElementById("pandaBubble");
  const pandaEyes = document.querySelectorAll(".panda-eye");

  if (panda && pandaBubble && pandaEyes.length) {
    const messages = [
      "Happy birthday, my favourite human 🐼💖",
      "You’re so cute, I can’t. ✨",
      "Hydrate and be legendary today 😌",
      "I’ll sit here and protect your vibes.",
      "You are very, VERY loved, okay? 🫶",
      "Cake first, responsibilities later 🎂"
    ];

    let bubbleTimeout = null;
    let moodTimeout = null;

    function showRandomMessage() {
      const random = messages[Math.floor(Math.random() * messages.length)];
      pandaBubble.textContent = random;

      pandaBubble.classList.add("show");
      if (bubbleTimeout) clearTimeout(bubbleTimeout);
      bubbleTimeout = setTimeout(() => {
        pandaBubble.classList.remove("show");
      }, 2800);
    }

    function setHappyMood() {
      panda.classList.add("happy", "wave");
      if (moodTimeout) clearTimeout(moodTimeout);
      moodTimeout = setTimeout(() => {
        panda.classList.remove("happy", "wave");
      }, 2800);
    }

    // click → wave + bubble
    panda.addEventListener("click", () => {
      showRandomMessage();
      setHappyMood();
    });

    // hover → wave (but don't force bubble)
    panda.addEventListener("mouseenter", () => {
      panda.classList.add("wave");
    });

    panda.addEventListener("mouseleave", () => {
      panda.classList.remove("wave");
    });

    // greet once after load
    setTimeout(() => {
      showRandomMessage();
      setHappyMood();
    }, 2200);

    /* EYE TRACKING – pupils follow cursor */
    document.addEventListener("mousemove", (e) => {
      pandaEyes.forEach((eye) => {
        const pupil = eye.querySelector(".panda-pupil");
        if (!pupil) return;

        const rect = eye.getBoundingClientRect();
        const eyeCenterX = rect.left + rect.width / 2;
        const eyeCenterY = rect.top + rect.height / 2;

        let dx = e.clientX - eyeCenterX;
        let dy = e.clientY - eyeCenterY;

        const maxDist = 4; // max pixels pupil can move
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > maxDist && dist !== 0) {
          dx = (dx / dist) * maxDist;
          dy = (dy / dist) * maxDist;
        }

        pupil.style.transform = `translate(${dx}px, ${dy}px)`;
      });
    });
  }

  const isMobile = window.matchMedia("(pointer: coarse)").matches;
    /* ===== HEART INTRO LOGIC 💗 ===== */
  const heartIntro = document.getElementById("heartIntro");

  if (heartIntro) {
    document.body.classList.add("no-scroll");

    const totalHearts = 500; // many hearts to really fill the screen

    // 1) Create all normal hearts
    for (let i = 0; i < totalHearts; i++) {
      const span = document.createElement("span");
      span.classList.add("intro-heart");

      // random horizontal position
      const x = Math.random() * 100; // 0–100vw
      span.style.left = `${x}vw`;

      // random fall distance to cover full screen
      const fall = 15 + Math.random() * 95; // 15–110vh
      span.style.setProperty("--fall-distance", `${fall}vh`);

      // random rotation
      const rot = (Math.random() * 40 - 20).toFixed(1) + "deg";
      span.style.setProperty("--rot", rot);

      const delay = (Math.random() * 1.6).toFixed(2);
      span.style.animationDelay = `${delay}s`;

      span.textContent = "💗";
      heartIntro.appendChild(span);
    }

    // 2) Create the special heart LAST so it sits on top
    const special = document.createElement("span");
    special.classList.add("intro-heart", "intro-heart--special");

    // choose a nice position somewhere in the central area
    const specialX = 10 + Math.random() * 80; // 10–90vw
    const specialFall = 25 + Math.random() * 75; // 25–100vh
    special.style.left = `${specialX}vw`;
    special.style.setProperty("--fall-distance", `${specialFall}vh`);

    const specialRot = (Math.random() * 40 - 20).toFixed(1) + "deg";
    special.style.setProperty("--rot", specialRot);

    const specialDelay = (Math.random() * 1.6).toFixed(2);
    special.style.animationDelay = `${specialDelay}s`;

    special.textContent = isMobile ? "💜" : "💓";
    heartIntro.appendChild(special);

    // 3) Click handling – only unlock when special heart is clicked
    const heartHint = document.getElementById("heartHint");

    heartIntro.addEventListener("click", (e) => {
      const clickedSpecial = e.target.closest(".intro-heart--special");
      if (!clickedSpecial || heartIntro.classList.contains("intro-done")) return;

      heartIntro.classList.add("intro-exit");
      heartIntro.classList.add("intro-done");

      if (heartHint) {
        heartHint.style.opacity = "0";
        setTimeout(() => heartHint.remove(), 400);
      }

      setTimeout(() => {
        heartIntro.style.display = "none";
        document.body.classList.remove("no-scroll");
      }, 950);
    });
  }

});

