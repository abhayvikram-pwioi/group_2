// ---- Navbar scroll effect ----
window.addEventListener("scroll", () => {
  document.getElementById("navbar").classList.toggle("scrolled", window.scrollY > 50);
});

// ---- Hamburger menu toggle ----
document.getElementById("hamburger").addEventListener("click", () => {
  document.getElementById("mobile-menu").classList.toggle("open");
});

// ---- Smooth scroll for anchor links ----
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener("click", e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute("href"));
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      document.getElementById("mobile-menu").classList.remove("open");
    }
  });
});

// ---- Counter animation ----
function animateCounters() {
  document.querySelectorAll(".counter").forEach(counter => {
    const target = +counter.dataset.target;
    const duration = 2000;
    const start = performance.now();

    function update(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      counter.textContent = Math.floor(eased * target).toLocaleString() + (target < 100 ? "%" : "+");
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  });
}

// Trigger counters when stats section enters viewport
const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounters();
      statsObserver.disconnect();
    }
  });
}, { threshold: 0.3 });

const statsSection = document.getElementById("stats");
if (statsSection) statsObserver.observe(statsSection);

// ---- Animate preview bars on load ----
window.addEventListener("load", () => {
  document.querySelectorAll(".preview-bar").forEach((bar, i) => {
    bar.style.transitionDelay = `${i * 0.1}s`;
  });
});
