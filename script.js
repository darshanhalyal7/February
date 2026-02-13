const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const response = document.getElementById("response");
const card = document.querySelector(".card");
const confettiEl = document.getElementById("confetti");

// Synthesized romantic music (Web Audio API)
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
let musicInterval = null;

// Romantic melody: C major scale, gentle notes (MIDI note numbers)
// C4=60, D4=62, E4=64, F4=65, G4=67, A4=69, B4=71, C5=72
const melody = [
  [64, 0.4], [67, 0.4], [69, 0.5], [67, 0.4], [64, 0.5], [62, 0.4],
  [64, 0.6], [67, 0.5], [64, 0.5], [62, 0.4], [60, 0.8],
  [64, 0.4], [67, 0.4], [69, 0.5], [71, 0.4], [72, 0.6],
  [71, 0.4], [69, 0.5], [67, 0.6], [64, 0.5], [62, 0.4], [60, 1.2],
];

function midiToFreq(n) {
  return 440 * Math.pow(2, (n - 69) / 12);
}

function playNote(midi, duration) {
  const osc = audioCtx.createOscillator();
  const osc2 = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = "sine";
  osc2.type = "triangle";
  osc2.frequency.value = midiToFreq(midi) * 1.005;
  osc.frequency.value = midiToFreq(midi);
  osc.connect(gain);
  osc2.connect(gain);
  gain.connect(audioCtx.destination);
  const t = audioCtx.currentTime;
  gain.gain.setValueAtTime(0, t);
  gain.gain.linearRampToValueAtTime(0.12, t + 0.05);
  gain.gain.exponentialRampToValueAtTime(0.01, t + duration);
  osc.start(t);
  osc2.start(t);
  osc.stop(t + duration);
  osc2.stop(t + duration);
}

function playMelody() {
  let t = 0;
  melody.forEach(([note, dur]) => {
    setTimeout(() => playNote(note, dur), t * 380);
    t += dur;
  });
  return t * 380;
}

function startMusic() {
  if (musicInterval) return;
  if (audioCtx.state === "suspended") audioCtx.resume();
  const cycleMs = playMelody();
  musicInterval = setInterval(() => playMelody(), cycleMs);
}

function stopMusic() {
  if (musicInterval) {
    clearInterval(musicInterval);
    musicInterval = null;
  }
}

const musicToggle = document.getElementById("musicToggle");

musicToggle.addEventListener("click", () => {
  if (musicInterval) {
    stopMusic();
    musicToggle.classList.remove("is-playing");
  } else {
    startMusic();
    musicToggle.classList.add("is-playing");
  }
});

// Day/Night toggle
const themeToggle = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("valentine-theme");
if (savedTheme === "day") document.body.classList.add("day-mode");

themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("day-mode");
  localStorage.setItem("valentine-theme", document.body.classList.contains("day-mode") ? "day" : "night");
});

// Floating heart cursor — single heart follows mouse
const cursorHeartsEl = document.getElementById("cursorHearts");
const heartEl = document.createElement("span");
heartEl.className = "cursor-heart";
heartEl.textContent = "❤️";
heartEl.style.fontSize = "1.5rem";
cursorHeartsEl.appendChild(heartEl);

let heartX = window.innerWidth / 2;
let heartY = window.innerHeight / 2;
let mouseX = heartX;
let mouseY = heartY;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function updateHeart() {
  heartX += (mouseX - heartX) * 0.2;
  heartY += (mouseY - heartY) * 0.2;
  heartEl.style.left = `${heartX}px`;
  heartEl.style.top = `${heartY}px`;
  heartEl.style.transform = `translate(-50%, -50%)`;
  requestAnimationFrame(updateHeart);
}
requestAnimationFrame(updateHeart);

// Yes — celebrate!
yesBtn.addEventListener("click", () => {
  response.innerHTML = "YAY!! 💕 I can't wait to celebrate with you 😘";
  card.classList.add("celebrating");
  triggerConfetti();
  startMusic();
  musicToggle.classList.add("is-playing");
});

// No — runs away & eventually gives in
let noHoverCount = 0;
const noMessages = [
  "Are you sure? 👀",
  "Really? Try again…",
  "The Yes button looks so lonely…",
  "Pretty please? 🥺",
  "I knew you'd come around 😏",
];

function handleNoHover() {
  if (!noBtn.classList.contains("given-in")) noBtn.textContent = "Laundpana Samajra";
  noHoverCount++;

  if (noHoverCount >= 5) {
    noBtn.textContent = "Okay fine, Yes 💖";
    noBtn.style.position = "static";
    noBtn.style.transform = "none";
    noBtn.style.background = "linear-gradient(135deg, #e11d48, #be123c)";
    noBtn.style.color = "white";
    noBtn.style.cursor = "pointer";
    response.innerHTML = noMessages[Math.min(noHoverCount - 5, noMessages.length - 1)];
    noBtn.classList.add("given-in");
    noBtn.onclick = () => {
      response.innerHTML = "YAY!! 💕 I can't wait to celebrate with you 😘";
      card.classList.add("celebrating");
      triggerConfetti();
      startMusic();
      musicToggle.classList.add("is-playing");
    };
    return;
  }

  const rect = noBtn.getBoundingClientRect();
  const maxX = window.innerWidth - rect.width - 40;
  const maxY = window.innerHeight - rect.height - 40;

  let x = Math.random() * maxX - rect.left;
  let y = Math.random() * maxY - rect.top;

  // Keep within viewport
  x = Math.max(-rect.left + 20, Math.min(maxX - rect.left - 20, x));
  y = Math.max(-rect.top + 20, Math.min(maxY - rect.top - 20, y));

  noBtn.style.transform = `translate(${x}px, ${y}px)`;
}

let revertTextTimeout;

noBtn.addEventListener("mouseover", handleNoHover);

noBtn.addEventListener("mouseenter", () => {
  if (!noBtn.classList.contains("given-in")) {
    clearTimeout(revertTextTimeout);
    noBtn.textContent = "Laundpana Samajra 🙃";
  }
});
noBtn.addEventListener("mouseleave", () => {
  if (!noBtn.classList.contains("given-in")) {
    clearTimeout(revertTextTimeout);
    revertTextTimeout = setTimeout(() => {
      noBtn.textContent = "No 🙃";
    }, 1200);
  }
});

function triggerConfetti() {
  const colors = ["#e11d48", "#fda4af", "#fbbf24", "#a78bfa", "#ffffff"];
  const shapes = ["●", "■", "★", "♥", "♦"];
  const count = 80;

  for (let i = 0; i < count; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.textContent = shapes[Math.floor(Math.random() * shapes.length)];
    piece.style.left = `${Math.random() * 100}vw`;
    piece.style.top = "-20px";
    piece.style.color = colors[Math.floor(Math.random() * colors.length)];
    piece.style.fontSize = `${12 + Math.random() * 16}px`;
    piece.style.animationDuration = `${2 + Math.random() * 2}s`;
    piece.style.animationDelay = `${Math.random() * 0.5}s`;
    piece.style.setProperty("--drift", `${(Math.random() - 0.5) * 300}px`);
    confettiEl.appendChild(piece);

    setTimeout(() => piece.remove(), 4000);
  }
}
