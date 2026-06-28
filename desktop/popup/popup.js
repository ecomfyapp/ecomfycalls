let audioContext = null;
let ringInterval = null;
let timerInterval = null;
let startedAt = null;
let callState = "incoming";

function playRing() {
  const AudioContextClass = window.AudioContext || window.webkitAudioContext;
  if (!AudioContextClass) return;
  if (!audioContext) audioContext = new AudioContextClass();
  if (audioContext.state === "suspended") audioContext.resume();

  const now = audioContext.currentTime;
  [0, 0.62].forEach((offset) => {
    const gain = audioContext.createGain();
    gain.gain.setValueAtTime(0.0001, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.22, now + offset + 0.02);
    gain.gain.setValueAtTime(0.22, now + offset + 0.42);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.5);
    gain.connect(audioContext.destination);

    [440, 480].forEach((frequency) => {
      const oscillator = audioContext.createOscillator();
      oscillator.frequency.setValueAtTime(frequency, now + offset);
      oscillator.connect(gain);
      oscillator.start(now + offset);
      oscillator.stop(now + offset + 0.52);
    });
  });
}

function startRinging() {
  stopRinging();
  playRing();
  ringInterval = window.setInterval(playRing, 3000);
}

function stopRinging() {
  if (ringInterval) window.clearInterval(ringInterval);
  ringInterval = null;
}

function formatTime(seconds) {
  const minutes = Math.floor(seconds / 60).toString().padStart(2, "0");
  const remainder = (seconds % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

function setActive() {
  callState = "active";
  stopRinging();
  document.getElementById("eyebrow").textContent = "LLAMADA ACTIVA";
  document.getElementById("incoming-actions").hidden = true;
  document.getElementById("active-actions").hidden = false;
  const timer = document.getElementById("timer");
  timer.hidden = false;
  startedAt = Date.now();
  timerInterval = window.setInterval(() => {
    timer.textContent = formatTime(Math.floor((Date.now() - startedAt) / 1000));
  }, 1000);
}

window.ecomfyDesktop.onCallData((data) => {
  document.getElementById("caller").textContent =
    data.callerName || data.callerNumber || "Cliente interesado";
  document.getElementById("number").textContent =
    data.callerNumber || "EcomfyCalls";
  document.getElementById("vertical").textContent = data.vertical || "";
});

window.ecomfyDesktop.onCallState((state) => {
  if (state === "active") setActive();
});

document.getElementById("answer").addEventListener("click", () => {
  window.ecomfyDesktop.sendCallAction("answer");
});
document.getElementById("decline").addEventListener("click", () => {
  window.ecomfyDesktop.sendCallAction("decline");
});
document.getElementById("hangup").addEventListener("click", () => {
  window.ecomfyDesktop.sendCallAction("hangup");
});
document.getElementById("close").addEventListener("click", () => {
  window.ecomfyDesktop.sendCallAction(
    callState === "active" ? "hangup" : "decline",
  );
});

window.addEventListener("beforeunload", () => {
  stopRinging();
  if (timerInterval) window.clearInterval(timerInterval);
  audioContext?.close();
});

startRinging();
