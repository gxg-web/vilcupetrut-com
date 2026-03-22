(function () {
  "use strict";

  var video = document.getElementById("hero-video");
  var staticImg = document.getElementById("hero-static");
  var ticker = document.querySelector("[data-ticker]");
  var glitch = document.querySelector("[data-glitch]");
  var fileHint = document.getElementById("local-file-hint");
  var isFileProtocol = window.location.protocol === "file:";

  function showStaticFallback() {
    if (!staticImg) return;
    if (video) {
      video.classList.add("is-hidden");
      try {
        video.pause();
      } catch (e) {
        /* ignore */
      }
    }
    staticImg.classList.add("is-visible");
  }

  function freezeOnLastFrame() {
    if (!video) return;
    var d = video.duration;
    if (d && isFinite(d)) {
      try {
        video.currentTime = Math.max(0, d - 0.04);
      } catch (e) {
        /* ignore */
      }
    }
    try {
      video.pause();
    } catch (e2) {
      /* ignore */
    }
  }

  function tryPlay() {
    if (!video) return;
    var p = video.play();
    if (p && typeof p.then === "function") {
      p.catch(function () {
        if (!fileHint) return;
        fileHint.hidden = false;
        fileHint.textContent = isFileProtocol
          ? "Playback blocked for file:// pages. Run a local server in this folder (e.g. npx --yes serve) and open http://localhost — or tap anywhere to retry."
          : "Tap anywhere to start the video.";
      });
    }
  }

  function wireVideo() {
    if (!video) return;

    /* 1.5× playback speed (browser-supported; pitch may shift on some engines) */
    video.playbackRate = 1.5;

    video.addEventListener("ended", function () {
      freezeOnLastFrame();
    });

    video.addEventListener("error", function () {
      showStaticFallback();
      if (fileHint) {
        fileHint.hidden = false;
        fileHint.textContent =
          "Video missing or format not supported. Add assets/petrut.mp4 (H.264/AAC MP4). The static image is shown instead.";
      }
    });

    video.addEventListener("playing", function () {
      if (fileHint) fileHint.hidden = true;
    });

    function attemptPlay() {
      tryPlay();
    }

    if (video.readyState >= 2) {
      attemptPlay();
    } else {
      video.addEventListener(
        "canplay",
        function onCanPlay() {
          video.removeEventListener("canplay", onCanPlay);
          attemptPlay();
        },
        { once: true }
      );
    }

    video.addEventListener(
      "loadeddata",
      function () {
        attemptPlay();
      },
      { once: true }
    );

    /* Second attempt after first user gesture (autoplay policies / file:// quirks) */
    function onFirstInteraction() {
      attemptPlay();
      document.removeEventListener("click", onFirstInteraction);
      document.removeEventListener("touchstart", onFirstInteraction, {
        passive: true,
      });
    }
    document.addEventListener("click", onFirstInteraction);
    document.addEventListener("touchstart", onFirstInteraction, {
      passive: true,
    });
  }

  if (video) {
    wireVideo();
  } else if (staticImg) {
    staticImg.classList.add("is-visible");
  }

  /* Decorative ticker — short looping “data” line */
  var chars = "0123456789ABCDEF";
  function randomSegment(len) {
    var s = "";
    for (var i = 0; i < len; i++) {
      s += chars[Math.floor(Math.random() * chars.length)];
    }
    return s;
  }

  function tick() {
    if (!ticker) return;
    ticker.textContent =
      "HASH " +
      randomSegment(16) +
      " · SIG " +
      randomSegment(8) +
      " · NODE RSS-RO · ENCRYPTED";
  }

  if (ticker) {
    tick();
    setInterval(tick, 2200);
  }

  /* Subtle glitch on RSS tag */
  if (glitch) {
    var base = glitch.textContent;
    setInterval(function () {
      if (Math.random() > 0.92) {
        glitch.textContent = "R5S";
        setTimeout(function () {
          glitch.textContent = base;
        }, 80);
      }
    }, 400);
  }

  /* Decode text effect on load */
  var decodeEls = document.querySelectorAll("[data-decode]");
  decodeEls.forEach(function (el) {
    var originalText = el.textContent;
    var letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    var iterations = 0;
    var interval = setInterval(function () {
      el.textContent = originalText
        .split("")
        .map(function (letter, index) {
          if (index < iterations) {
            return originalText[index];
          }
          return letters[Math.floor(Math.random() * letters.length)];
        })
        .join("");
      if (iterations >= originalText.length) {
        clearInterval(interval);
      }
      iterations += 1 / 3;
    }, 30);
  });

  /* Video column height ≤ left panel (two-column layout only) */
  var panelEl = document.querySelector(".panel");
  var visualEl = document.querySelector(".visual");
  var mqDesktop = window.matchMedia("(min-width: 901px)");

  function syncVisualHeightToPanel() {
    if (!panelEl || !visualEl) return;
    if (!mqDesktop.matches) {
      visualEl.style.height = "";
      visualEl.style.maxHeight = "";
      return;
    }
    var h = panelEl.offsetHeight;
    if (h > 0) {
      visualEl.style.height = h + "px";
      visualEl.style.maxHeight = h + "px";
    }
  }

  if (panelEl && visualEl && typeof ResizeObserver !== "undefined") {
    new ResizeObserver(syncVisualHeightToPanel).observe(panelEl);
    window.addEventListener("resize", syncVisualHeightToPanel);
    if (mqDesktop.addEventListener) {
      mqDesktop.addEventListener("change", syncVisualHeightToPanel);
    } else if (mqDesktop.addListener) {
      mqDesktop.addListener(syncVisualHeightToPanel);
    }
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(syncVisualHeightToPanel);
    }
    syncVisualHeightToPanel();
  }
})();
