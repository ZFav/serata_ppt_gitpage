/**
 * SERATA PPT — Landing interactions
 * Keyboard, fullscreen, screen transitions, light parallax
 */

(function () {
  "use strict";

  const landing = document.getElementById("landing");
  const calibration = document.getElementById("calibration");
  const startBtn = document.getElementById("startBtn");
  const fullscreenBtn = document.getElementById("fullscreenBtn");
  const collageItems = document.querySelectorAll(".collage-item");

  let currentScreen = "landing";
  let isTransitioning = false;

  /* ---------- Screen navigation ---------- */

  function goToCalibration() {
    if (currentScreen !== "landing" || isTransitioning) return;
    isTransitioning = true;
    document.body.classList.add("is-transitioning");

    landing.classList.add("is-leaving");
    landing.classList.remove("is-active");

    window.setTimeout(function () {
      landing.setAttribute("aria-hidden", "true");
      calibration.classList.add("is-active");
      calibration.setAttribute("aria-hidden", "false");
      currentScreen = "calibration";
      isTransitioning = false;

      window.setTimeout(function () {
        document.body.classList.remove("is-transitioning");
      }, 700);
    }, 450);
  }

  function goToLanding() {
    if (currentScreen !== "calibration" || isTransitioning) return;
    isTransitioning = true;

    calibration.classList.remove("is-active");
    calibration.setAttribute("aria-hidden", "true");

    window.setTimeout(function () {
      landing.classList.remove("is-leaving");
      landing.classList.add("is-active");
      landing.setAttribute("aria-hidden", "false");
      currentScreen = "landing";
      isTransitioning = false;
    }, 400);
  }

  startBtn.addEventListener("click", goToCalibration);

  /* ---------- Fullscreen ---------- */

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(function () {
        /* ignore — browser may block without gesture */
      });
    } else {
      document.exitFullscreen();
    }
  }

  fullscreenBtn.addEventListener("click", toggleFullscreen);

  /* ---------- Keyboard ---------- */

  document.addEventListener("keydown", function (event) {
    const key = event.key;

    if (key === "Enter" || key === " ") {
      event.preventDefault();
      if (currentScreen === "landing") {
        goToCalibration();
      }
      return;
    }

    if (key === "ArrowRight" || key === "ArrowDown") {
      event.preventDefault();
      if (currentScreen === "landing") {
        goToCalibration();
      }
      return;
    }

    if (key === "ArrowLeft" || key === "ArrowUp") {
      event.preventDefault();
      if (currentScreen === "calibration") {
        goToLanding();
      }
      return;
    }

    if (key === "Escape") {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else if (currentScreen === "calibration") {
        goToLanding();
      }
    }
  });

  /* ---------- Soft parallax on collage ---------- */

  let rafId = null;
  let targetX = 0;
  let targetY = 0;
  let currentX = 0;
  let currentY = 0;

  function onPointerMove(event) {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    targetX = (event.clientX - cx) / cx;
    targetY = (event.clientY - cy) / cy;

    if (rafId === null) {
      rafId = requestAnimationFrame(tickParallax);
    }
  }

  function tickParallax() {
    currentX += (targetX - currentX) * 0.06;
    currentY += (targetY - currentY) * 0.06;

    collageItems.forEach(function (item) {
      const depth = parseFloat(item.dataset.depth) || 0.03;
      const x = currentX * depth * -80;
      const y = currentY * depth * -50;
      const layer = item.querySelector(".collage-parallax") || item;
      layer.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";
    });

    if (
      Math.abs(targetX - currentX) > 0.001 ||
      Math.abs(targetY - currentY) > 0.001
    ) {
      rafId = requestAnimationFrame(tickParallax);
    } else {
      rafId = null;
    }
  }

  /* Enable parallax after entrance animations settle */
  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!prefersReduced) {
    window.setTimeout(function () {
      document.addEventListener("pointermove", onPointerMove, { passive: true });
    }, 2800);
  }

  /* ---------- Optional: keep waking SYSTEM READY ---------- */

  const statusLabel = document.querySelector(".status-label");
  const statusMessages = [
    "SYSTEM READY",
    "SENSORS ONLINE",
    "MATCHING IDLE",
    "SYSTEM READY",
  ];
  let statusIndex = 0;

  window.setInterval(function () {
    if (currentScreen !== "landing" || !statusLabel) return;
    statusIndex = (statusIndex + 1) % statusMessages.length;
    statusLabel.textContent = statusMessages[statusIndex];
  }, 4200);
})();
