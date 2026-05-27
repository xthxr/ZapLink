/* Back-to-Top: Adds a reusable floating button that scrolls the appropriate root to top */
(function () {
  function createButton() {
    const btn = document.createElement("button");
    btn.className = "back-to-top";
    btn.setAttribute("aria-label", "Back to top");
    btn.setAttribute("title", "Back to top");
    btn.innerHTML = '<i class="fas fa-chevron-up icon" aria-hidden="true"></i>';
    document.body.appendChild(btn);
    return btn;
  }

  const btn = createButton();

  function getScrollRoot() {
    // Prefer bio container (scrollable element) when present
    const bio = document.querySelector(".bio-container");
    if (
      bio &&
      (getComputedStyle(bio).overflowY === "auto" ||
        getComputedStyle(bio).overflowY === "scroll")
    ) {
      return bio;
    }

    const main = document.querySelector(".main-content");
    if (
      main &&
      (getComputedStyle(main).overflowY === "auto" ||
        getComputedStyle(main).overflowY === "scroll")
    ) {
      return main;
    }

    return window;
  }

  const root = getScrollRoot();
  const threshold = 300;

  function getScrollTop() {
    if (root === window)
      return window.pageYOffset || document.documentElement.scrollTop || 0;
    return root.scrollTop || 0;
  }

  function onScroll() {
    const st = getScrollTop();
    if (st > threshold) btn.classList.add("show");
    else btn.classList.remove("show");
  }

  function scrollToTop() {
    if (root === window) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      root.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  // Attach listeners
  try {
    if (root === window)
      window.addEventListener("scroll", onScroll, { passive: true });
    else root.addEventListener("scroll", onScroll, { passive: true });
  } catch (e) {
    // Fallback: window
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  btn.addEventListener("click", scrollToTop);
  btn.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      scrollToTop();
    }
  });

  // Initialize visibility
  document.addEventListener("DOMContentLoaded", onScroll);
  // Also run once in case script is loaded after DOMContentLoaded
  onScroll();
})();
