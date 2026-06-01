// =========================
// HERO SLIDER
// =========================

const slides = document.querySelectorAll(".slide");
const dots = document.querySelectorAll(".dot");

const nextBtn = document.querySelector(".right-arrow");
const prevBtn = document.querySelector(".left-arrow");

let currentSlide = 0;
let autoSlide;

// Show Slide
function showSlide(index) {

  slides.forEach((slide) => {
    slide.classList.remove("active");
  });

  dots.forEach((dot) => {
    dot.classList.remove("active");
  });

  slides[index].classList.add("active");
  dots[index].classList.add("active");
}

// Next Slide
function nextSlide() {

  currentSlide++;

  if (currentSlide >= slides.length) {
    currentSlide = 0;
  }

  showSlide(currentSlide);
}

// Previous Slide
function prevSlide() {

  currentSlide--;

  if (currentSlide < 0) {
    currentSlide = slides.length - 1;
  }

  showSlide(currentSlide);
}

// Auto Slide
function startSlider() {

  autoSlide = setInterval(() => {
    nextSlide();
  }, 5000);

}

// Restart Slider
function restartSlider() {

  clearInterval(autoSlide);
  startSlider();

}

startSlider();

// Buttons

if (nextBtn) {

  nextBtn.addEventListener("click", () => {

    nextSlide();
    restartSlider();

  });

}

if (prevBtn) {

  prevBtn.addEventListener("click", () => {

    prevSlide();
    restartSlider();

  });

}

// Dots

dots.forEach((dot, index) => {

  dot.addEventListener("click", () => {

    currentSlide = index;

    showSlide(currentSlide);

    restartSlider();

  });

});

// =========================
// WISHLIST HEART
// =========================

const wishlistBtns =
  document.querySelectorAll(".wishlist-btn");

wishlistBtns.forEach((btn) => {

  btn.addEventListener("click", () => {

    const icon = btn.querySelector("i");

    btn.classList.toggle("active");

    if (icon.classList.contains("fa-regular")) {

      icon.classList.remove("fa-regular");
      icon.classList.add("fa-solid");

    } else {

      icon.classList.remove("fa-solid");
      icon.classList.add("fa-regular");

    }

  });

});

// =========================
// CART DRAWER
// =========================

const cartDrawer =
  document.querySelector(".cart-drawer");

const cartOverlay =
  document.querySelector(".cart-overlay");

const cartIcon =
  document.querySelector(".cart-icon");

const closeCartBtn =
  document.querySelector(".close-cart");

// Open Cart

if (cartIcon && cartDrawer && cartOverlay)  {

  cartIcon.addEventListener("click", () => {

    cartDrawer.classList.add("show");
    cartOverlay.classList.add("show");

    document.body.style.overflow = "hidden";

  });

}

// Close Cart Function

function closeCart() {

  cartDrawer.classList.remove("show");
  cartOverlay.classList.remove("show");

  document.body.style.overflow = "auto";

}

// Close Button

if (closeCartBtn) {

  closeCartBtn.addEventListener("click", () => {

    closeCart();

  });

}

// Overlay Click

if (cartOverlay) {

  cartOverlay.addEventListener("click", () => {

    closeCart();

  });

}

// ESC Key

document.addEventListener("keydown", (e) => {

  if (e.key === "Escape") {

    closeCart();

  }

});

// =========================
// ADD TO CART
// =========================

const addToCartBtns =
  document.querySelectorAll(".cart-btn");

let cartCount =
  document.querySelector(".cart-icon span");

let count = 2;

addToCartBtns.forEach((btn) => {

  btn.addEventListener("click", () => {

    count++;

    if (cartCount) {

      cartCount.textContent = count;

    }

    btn.innerHTML = "✓ ADDED";

    btn.style.background = "#16a34a";

    setTimeout(() => {

      btn.innerHTML = "ADD TO CART";

      btn.style.background = "#000";

    }, 1500);

  });

});

// =========================
// HEADER SHADOW ON SCROLL
// =========================

const header =
  document.querySelector(".header");

window.addEventListener("scroll", () => {

  if (window.scrollY > 20) {

    header.style.boxShadow =
      "0 10px 25px rgba(0,0,0,0.08)";

  } else {

    header.style.boxShadow =
      "0 2px 10px rgba(0,0,0,0.05)";

  }

});

// =========================
// SMOOTH CATEGORY SCROLL
// =========================

document.querySelectorAll('a[href^="#"]')
.forEach(anchor => {

  anchor.addEventListener("click", function (e) {

    const target =
      document.querySelector(
        this.getAttribute("href")
      );

    if (target) {

      e.preventDefault();

      target.scrollIntoView({
        behavior: "smooth"
      });

    }

  });

});

// =========================
// PAGE LOADED
// =========================

window.addEventListener("load", () => {

  showSlide(0);

  console.log(
    "VELORA Fashion Store Loaded Successfully 🚀"
  );

});

// SEARCH


const searchBtn =
document.getElementById("searchBtn");

const searchOverlay =
document.getElementById("searchOverlay");

const closeSearch =
document.getElementById("closeSearch");

const searchInput =
document.querySelector(".search-box input");

searchBtn.addEventListener("click", () => {

  searchOverlay.classList.add("show");

  setTimeout(() => {
    searchInput.focus();
  }, 200);

});

closeSearch.addEventListener("click", () => {

  searchOverlay.classList.remove("show");

});

searchInput.addEventListener("keypress",(e)=>{

  if(e.key === "Enter"){

    const value =
    searchInput.value.toLowerCase().trim();

    if(value === "dress" ||
       value === "dresses"){

      window.location.href =
      "dresses.html";

    }

  }

});