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
// WISHLIST HEART & ADD TO CART (Event Delegation)
// =========================

let cartCountVal = 0;

function showFeedbackToast(message) {
  let toast = document.getElementById("velora-toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "velora-toast";
    toast.style.position = "fixed";
    toast.style.bottom = "30px";
    toast.style.right = "30px";
    toast.style.backgroundColor = "#000";
    toast.style.color = "#fff";
    toast.style.padding = "15px 30px";
    toast.style.borderRadius = "30px";
    toast.style.boxShadow = "0 10px 25px rgba(0,0,0,0.2)";
    toast.style.zIndex = "10000";
    toast.style.fontFamily = "inherit";
    toast.style.fontSize = "14px";
    toast.style.fontWeight = "bold";
    toast.style.transition = "all 0.3s ease";
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.style.opacity = "1";
  toast.style.transform = "translateY(0)";

  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transform = "translateY(20px)";
  }, 2500);
}

document.addEventListener("click", (e) => {
  // 1. Wishlist Heart Click
  const wishlistBtn = e.target.closest(".wishlist-btn");
  if (wishlistBtn) {
    const icon = wishlistBtn.querySelector("i");
    wishlistBtn.classList.toggle("active");

    // Check if we are inside the buy box on product.html
    const isBuyBox = wishlistBtn.closest(".product-buy-box");
    if (isBuyBox) {
      if (wishlistBtn.classList.contains("active")) {
        wishlistBtn.innerHTML = `<i class="fa-solid fa-heart" style="margin-right:8px;"></i> Added to Wish List`;
        showFeedbackToast("Item added to your Wishlist!");
      } else {
        wishlistBtn.innerHTML = `<i class="fa-regular fa-heart" style="margin-right:8px;"></i> Add to Wish List`;
        showFeedbackToast("Item removed from your Wishlist!");
      }
    } else {
      if (icon) {
        if (icon.classList.contains("fa-regular")) {
          icon.classList.remove("fa-regular");
          icon.classList.add("fa-solid");
          showFeedbackToast("Item added to your Wishlist!");
        } else {
          icon.classList.remove("fa-solid");
          icon.classList.add("fa-regular");
          showFeedbackToast("Item removed from your Wishlist!");
        }
      }
    }
    return;
  }

  // 2. Add to Cart Click
  const cartBtn = e.target.closest(".cart-btn");
  if (cartBtn) {
    let increment = 1;
    // Check if we are inside the buy box on product.html
    const isBuyBox = cartBtn.closest(".product-buy-box");
    if (isBuyBox) {
      const qtySelect = document.getElementById("buy-box-qty");
      if (qtySelect) {
        increment = parseInt(qtySelect.value, 10) || 1;
      }
    }

    cartCountVal += increment;
    const cartCountEl = document.querySelectorAll(".cart-icon span");
    cartCountEl.forEach(el => {
      el.textContent = cartCountVal;
    });

    const originalText = cartBtn.innerHTML;
    cartBtn.innerHTML = "✓ ADDED";
    cartBtn.style.background = "#16a34a";
    cartBtn.style.color = "#fff";

    showFeedbackToast(`Added ${increment} item(s) to Cart!`);

    setTimeout(() => {
      cartBtn.innerHTML = originalText;
      cartBtn.style.background = "#000";
      cartBtn.style.color = "#fff";
    }, 1500);
    return;
  }

  // 2.5 Buy Now Click
  const buyNowBtn = e.target.closest(".buy-now-btn");
  if (buyNowBtn) {
    let increment = 1;
    const qtySelect = document.getElementById("buy-box-qty");
    if (qtySelect) {
      increment = parseInt(qtySelect.value, 10) || 1;
    }

    cartCountVal += increment;
    const cartCountEl = document.querySelectorAll(".cart-icon span");
    cartCountEl.forEach(el => {
      el.textContent = cartCountVal;
    });

    const originalText = buyNowBtn.innerHTML;
    buyNowBtn.innerHTML = "✓ PROCESSING...";
    buyNowBtn.style.background = "#000";
    buyNowBtn.style.color = "#fff";

    showFeedbackToast(`Redirecting to Secure Checkout with ${increment} item(s)...`);

    setTimeout(() => {
      buyNowBtn.innerHTML = originalText;
      buyNowBtn.style.background = "#fff";
      buyNowBtn.style.color = "#000";
      alert("Checkout Simulation Successful! Thank you for shopping with VELORA.");
    }, 1500);
    return;
  }

  // 3. Thumbnail Click Image Swap
  const thumb = e.target.closest(".thumb-img");
  if (thumb) {
    const mainImg = document.getElementById("main-product-img");
    const newSrc = thumb.getAttribute("data-src");
    if (mainImg && newSrc) {
      mainImg.src = newSrc;
      document.querySelectorAll(".thumb-img").forEach(t => t.classList.remove("active"));
      thumb.classList.add("active");
    }
    return;
  }

  // 4. Product Card Click Redirection
  const productCard = e.target.closest(".product-card");
  if (productCard) {
    const id = productCard.getAttribute("data-id");
    if (id) {
      window.location.href = `product.html?id=${id}`;
    }
    return;
  }

  // 5. Recommended Card Click Redirection
  const recommendCard = e.target.closest(".recommend-card");
  if (recommendCard) {
    const id = recommendCard.getAttribute("data-id");
    if (id) {
      window.location.href = `product.html?id=${id}`;
    }
    return;
  }
});

// =========================
// CART DRAWER (Kept for compatibility)
// =========================

const cartDrawer = document.querySelector(".cart-drawer");
const cartOverlay = document.querySelector(".cart-overlay");
const cartIcon = document.querySelector(".cart-icon");
const closeCartBtn = document.querySelector(".close-cart");

if (cartIcon && cartDrawer && cartOverlay) {
  cartIcon.addEventListener("click", () => {
    cartDrawer.classList.add("show");
    cartOverlay.classList.add("show");
    document.body.style.overflow = "hidden";
  });
}

function closeCart() {
  if (cartDrawer && cartOverlay) {
    cartDrawer.classList.remove("show");
    cartOverlay.classList.remove("show");
    document.body.style.overflow = "auto";
  }
}

if (closeCartBtn) {
  closeCartBtn.addEventListener("click", closeCart);
}

if (cartOverlay) {
  cartOverlay.addEventListener("click", closeCart);
}

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCart();
  }
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

searchInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    const value = searchInput.value.toLowerCase().trim();
    if (value === "dress" || value === "dresses") {
      window.location.href = "dresses.html";
    }
  }
});

// ==========================================
// DYNAMIC PRODUCT API INTEGRATION (DUMMYJSON)
// ==========================================

const EXCHANGE_RATE = 83; // 1 USD to INR

// Helper to fetch from DummyJSON category
async function fetchCategoryProducts(category) {
  try {
    const response = await fetch(`https://dummyjson.com/products/category/${category}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.products || [];
  } catch (error) {
    console.error(`Failed to fetch category '${category}':`, error);
    return [];
  }
}

// Generate stars HTML based on rating
function getRatingStarsHTML(rating) {
  const roundedRating = Math.round(rating || 5);
  return '★'.repeat(roundedRating) + '☆'.repeat(5 - roundedRating);
}

// Create product card HTML
function createProductCardHTML(product) {
  const inrPrice = Math.round(product.price * EXCHANGE_RATE);
  const formattedPrice = `₹${inrPrice.toLocaleString('en-IN')}`;
  const starsHTML = getRatingStarsHTML(product.rating);

  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-image">
        <img src="${product.thumbnail || product.images[0]}" alt="${product.title}">
        <button class="wishlist-btn">
          <i class="fa-regular fa-heart"></i>
        </button>
      </div>
      <h3>${product.title}</h3>
      <p class="price">${formattedPrice}</p>
      <div class="rating">${starsHTML}</div>
      <button class="cart-btn">ADD TO CART</button>
    </div>
  `;
}

// Create recommended product card HTML for search overlay
function createRecommendCardHTML(product) {
  const inrPrice = Math.round(product.price * EXCHANGE_RATE);
  const formattedPrice = `₹${inrPrice.toLocaleString('en-IN')}`;

  return `
    <div class="recommend-card" data-id="${product.id}">
      <img src="${product.thumbnail || product.images[0]}" alt="${product.title}">
      <p>${product.title}</p>
      <span>${formattedPrice}</span>
    </div>
  `;
}

// Fetch single product details by ID
async function fetchProductDetails(id) {
  try {
    const response = await fetch(`https://dummyjson.com/products/${id}`);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`Failed to fetch product details for ID ${id}:`, error);
    return null;

  }
}

// Generate the full HTML for product details page
function renderProductDetails(product) {
  const inrPrice = Math.round(product.price * EXCHANGE_RATE);
  const discountPercent = Math.round(product.discountPercentage || 0);
  const mrpValue = Math.round(inrPrice / (1 - discountPercent / 100));

  const formattedPrice = `₹${inrPrice.toLocaleString('en-IN')}`;
  const formattedMRP = `₹${mrpValue.toLocaleString('en-IN')}`;
  const starsHTML = getRatingStarsHTML(product.rating);

  // Delivery dates calculation
  const deliveryDate = new Date();
  deliveryDate.setDate(deliveryDate.getDate() + 3);
  const formattedDelivery = deliveryDate.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

  const images = product.images && product.images.length > 0 ? product.images : [product.thumbnail];
  const thumbnailsHTML = images.map((img, idx) => `
    <div class="thumb-img ${idx === 0 ? 'active' : ''}" data-src="${img}">
      <img src="${img}" alt="${product.title} Thumbnail ${idx + 1}">
    </div>
  `).join("");

  return `
    <div class="product-gallery">
      <div class="main-image-wrapper">
        <img id="main-product-img" src="${images[0]}" alt="${product.title}">
      </div>
      <div class="thumbnail-strip">
        ${thumbnailsHTML}
      </div>
    </div>

    <div class="product-info">
      <h1 class="product-title">${product.title}</h1>
      <a href="#" class="product-brand">Visit the ${product.brand || 'VELORA'} Store</a>

      <div class="product-rating-stars">
        <span class="stars">${starsHTML}</span>
        <span class="rating-value">${product.rating || 5} out of 5</span>
        <a href="#" class="rating-link">(${product.reviews ? product.reviews.length : 12} customer reviews)</a>
      </div>

      <hr>

      <div class="price-box">
        <div class="price-row">
          <span class="discount-badge">-${discountPercent}%</span>
          <span class="current-price">${formattedPrice}</span>
        </div>
        <div class="mrp-price">
          M.R.P.: <span>${formattedMRP}</span>
        </div>
        <p style="font-size:12px; color:#565959; margin-top:5px;">Inclusive of all taxes</p>
      </div>

      <div class="coupon-box">
        <input type="checkbox" id="coupon-chk">
        <label for="coupon-chk">
          <span class="coupon-label">Coupon</span> Apply ${Math.round(discountPercent / 3 || 5)}% coupon. <a href="#" style="color:#007185; text-decoration:none;">Details</a>
        </label>
      </div>

      <hr>

      <div class="offers-section">
        <h4><i class="fa-solid fa-tags" style="color:#ffa41c; margin-right:8px;"></i> Offers</h4>
        <div class="offers-grid">
          <div class="offer-card">
            <strong>Cashback</strong>
            Upto ₹50 cashback as Velora Pay balance.
          </div>
          <div class="offer-card">
            <strong>Bank Offer</strong>
            Upto ₹750 discount on select Credit Cards.
          </div>
          <div class="offer-card">
            <strong>Partner Offers</strong>
            Buy 2 and get 10% off on qualifying items.
          </div>
        </div>
      </div>

      <div class="services-row">
        <div class="service-item">
          <i class="fa-solid fa-money-bill-wave"></i>
          <span>Pay on Delivery</span>
        </div>
        <div class="service-item">
          <i class="fa-solid fa-arrow-rotate-left"></i>
          <span>${product.returnPolicy || '30 Days Returnable'}</span>
        </div>
        <div class="service-item">
          <i class="fa-solid fa-truck-fast"></i>
          <span>${product.shippingInformation || 'Ships in 3-5 days'}</span>
        </div>
        <div class="service-item">
          <i class="fa-solid fa-lock"></i>
          <span>Secure Transaction</span>
        </div>
      </div>

      <hr>

      <div class="specs-table-container">
        <h4>Product Specifications</h4>
        <table class="specs-table">
          <tr>
            <td>Brand</td>
            <td>${product.brand || 'VELORA'}</td>
          </tr>
          <tr>
            <td>Category</td>
            <td>${product.category}</td>
          </tr>
          <tr>
            <td>SKU</td>
            <td>${product.sku || 'N/A'}</td>
          </tr>
          <tr>
            <td>Weight</td>
            <td>${product.weight ? product.weight + 'g' : 'N/A'}</td>
          </tr>
          <tr>
            <td>Dimensions</td>
            <td>${product.dimensions ? `${product.dimensions.width} x ${product.dimensions.height} x ${product.dimensions.depth} cm` : 'N/A'}</td>
          </tr>
          <tr>
            <td>Warranty</td>
            <td>${product.warrantyInformation || 'N/A'}</td>
          </tr>
        </table>
      </div>

      <hr>
      <div style="margin-top: 10px;">
        <h4 style="font-size:16px; margin-bottom:10px; color:#111;">About this item</h4>
        <p style="font-size:14px; line-height:1.6; color:#333;">${product.description}</p>
      </div>
    </div>

    <div class="product-buy-box">
      <div class="buy-box-price">${formattedPrice}</div>

      <p class="delivery-info">
        <strong>FREE delivery</strong> by <strong>${formattedDelivery}</strong>.
      </p>
      <p class="delivery-info" style="font-size:12px; color:#565959;">
        Or fastest delivery <strong>Tomorrow</strong>. Order within <strong>53 mins</strong>.
      </p>

      <p class="location-info">
        <i class="fa-solid fa-location-dot"></i> Delivering to Gurugram 122001 - Update location
      </p>

      <h3 class="stock-status ${product.stock > 0 ? 'in-stock' : 'low-stock'}">
        ${product.stock > 0 ? 'In stock' : 'Out of stock'}
      </h3>

      <div class="qty-selector">
        <span>Quantity:</span>
        <select id="buy-box-qty">
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
        </select>
      </div>

      <div class="buy-box-btns">
        <button class="cart-btn">ADD TO CART</button>
        <button class="buy-now-btn">BUY NOW</button>
      </div>

      <div class="buy-box-merchant">
        <table>
          <tr>
            <td>Ships from</td>
            <td style="color:#333;">Velora</td>
          </tr>
          <tr>
            <td>Sold by</td>
            <td style="color:#333;">${product.brand || 'VELORA'}</td>
          </tr>
        </table>
      </div>

      <button class="wishlist-btn">
        <i class="fa-regular fa-heart" style="margin-right:8px;"></i> Add to Wish List
      </button>
    </div>
  `;
}

function setupProductDetailsListeners(product) {
  const qtySelect = document.getElementById("buy-box-qty");
  const couponChk = document.getElementById("coupon-chk");

  const basePrice = Math.round(product.price * EXCHANGE_RATE);
  const discountPercent = Math.round(product.discountPercentage || 0);
  const couponDiscount = Math.round(basePrice * (Math.round(discountPercent / 3 || 5) / 100));

  function updatePrices() {
    const qty = parseInt(qtySelect ? qtySelect.value : 1, 10);
    const couponChecked = couponChk ? couponChk.checked : false;

    const currentPricePerUnit = basePrice - (couponChecked ? couponDiscount : 0);
    const totalPrice = currentPricePerUnit * qty;

    // Update central price element
    const currentPriceEl = document.querySelector(".price-box .current-price");
    if (currentPriceEl) {
      currentPriceEl.textContent = `₹${currentPricePerUnit.toLocaleString('en-IN')}`;
    }

    // Update buy box price element
    const buyBoxPriceEl = document.querySelector(".buy-box-price");
    if (buyBoxPriceEl) {
      buyBoxPriceEl.textContent = `₹${totalPrice.toLocaleString('en-IN')}`;
    }

    // If coupon checked, add a small indicator or styling
    const couponBox = document.querySelector(".coupon-box");
    if (couponBox) {
      if (couponChecked) {
        couponBox.style.borderColor = "#000";
        couponBox.style.backgroundColor = "#fafafa";
      } else {
        couponBox.style.borderColor = "#000";
        couponBox.style.backgroundColor = "#fafafa";
      }
    }
  }

  if (qtySelect) {
    qtySelect.addEventListener("change", updatePrices);
  }
  if (couponChk) {
    couponChk.addEventListener("change", updatePrices);
  }

  // Bind offer cards to toggle coupon checkbox
  const offerCards = document.querySelectorAll(".offer-card");
  offerCards.forEach(card => {
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      if (couponChk) {
        couponChk.checked = !couponChk.checked;
        updatePrices();
        showFeedbackToast(`Coupon ${couponChk.checked ? 'Applied' : 'Removed'}!`);
      }
    });
  });
}

// Main initializer
async function initDynamicProducts() {
  const dressesGrid = document.getElementById("dresses-grid-container");
  const recommendedGrid = document.getElementById("recommended-products-grid");
  const featuredGrid = document.getElementById("featured-products-grid");
  const moreGrid = document.getElementById("more-products-grid");
  const detailsContainer = document.getElementById("product-details-loader");

  // Check if we are on product.html
  if (detailsContainer) {
    console.log("Initializing Product Details Page...");
    const urlParams = new URLSearchParams(window.location.search);
    const id = urlParams.get("id");
    if (id) {
      const product = await fetchProductDetails(id);
      if (product) {
        document.title = `${product.title} - VELORA`;
        detailsContainer.innerHTML = renderProductDetails(product);
        setupProductDetailsListeners(product);
      } else {
        detailsContainer.innerHTML = `<div style="text-align:center; padding: 50px 0;"><p>Product not found.</p></div>`;
      }
    } else {
      detailsContainer.innerHTML = `<div style="text-align:center; padding: 50px 0;"><p>No product selected.</p></div>`;
    }
  }

  // Check if we are on dresses.html
  if (dressesGrid) {
    console.log("Initializing Dresses Page...");
    const products = await fetchCategoryProducts("womens-dresses");
    if (products.length > 0) {
      dressesGrid.innerHTML = products.map(createProductCardHTML).join("");
    }
  }

  // Check if we are on index.html or product.html (for search overlay recommended grid)
  if (recommendedGrid || featuredGrid || moreGrid) {
    console.log("Initializing Home/Search dynamic lists...");
    const [dresses, shirts] = await Promise.all([
      fetchCategoryProducts("womens-dresses"),
      fetchCategoryProducts("mens-shirts")
    ]);

    const allProducts = [...dresses, ...shirts];
    if (allProducts.length > 0) {
      // Distribute products:
      // 1. Featured Products: take 4 products (first 2 dresses, first 2 shirts)
      const featuredList = [
        ...dresses.slice(0, 2),
        ...shirts.slice(0, 2)
      ];

      // 2. More Products: take 4 products (next 2 dresses, next 2 shirts)
      const moreList = [
        ...dresses.slice(2, 4),
        ...shirts.slice(2, 4)
      ];

      // 3. Recommended: take 3 products (remaining or last items)
      const recommendedList = [
        ...dresses.slice(4, 5),
        ...shirts.slice(4, 5)
      ];
      if (dresses.length > 0 && shirts.length > 0) {
        recommendedList.push(dresses[0]); // add one more for design layout (3 cards)
      }

      if (featuredGrid && featuredList.length > 0) {
        featuredGrid.innerHTML = featuredList.map(createProductCardHTML).join("");
      }

      if (moreGrid && moreList.length > 0) {
        moreGrid.innerHTML = moreList.map(createProductCardHTML).join("");
      }

      if (recommendedGrid && recommendedList.length > 0) {
        recommendedGrid.innerHTML = recommendedList.map(createRecommendCardHTML).join("");
      }
    }
  }
}

// Bind initializing to DOMContentLoaded
document.addEventListener("DOMContentLoaded", initDynamicProducts);
