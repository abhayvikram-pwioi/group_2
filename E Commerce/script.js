// =========================
// VELORA - Main JS
// Features: hero slider, cart, global wishlist (localStorage), smooth scroll, header shadow
// Works across pages: index.html, dresses.html, etc.
// =========================

// ---------- Helper: DOM Ready ----------
function ready(fn) {
  if (document.readyState !== 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

ready(() => {

  // =========================
  // HERO SLIDER
  // =========================

  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const nextBtn = document.querySelector('.right-arrow');
  const prevBtn = document.querySelector('.left-arrow');
  let currentSlide = 0;
  let autoSlide;

  function showSlide(index) {
    if (!slides.length) return;
    slides.forEach(s => s.classList.remove('active'));
    dots.forEach(d => d.classList.remove('active'));
    slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
  }

  function nextSlide() {
    currentSlide++;
    if (currentSlide >= slides.length) currentSlide = 0;
    showSlide(currentSlide);
  }

  function prevSlide() {
    currentSlide--;
    if (currentSlide < 0) currentSlide = slides.length - 1;
    showSlide(currentSlide);
  }

  function startSlider() {
    if (!slides.length) return;
    autoSlide = setInterval(nextSlide, 5000);
  }

  function restartSlider() {
    clearInterval(autoSlide);
    startSlider();
  }

  startSlider();

  if (nextBtn) nextBtn.addEventListener('click', () => { nextSlide(); restartSlider(); });
  if (prevBtn) prevBtn.addEventListener('click', () => { prevSlide(); restartSlider(); });
  dots.forEach((dot, i) => dot.addEventListener('click', () => { currentSlide = i; showSlide(i); restartSlider(); }));

  // =========================
  // SEARCH OVERLAY (was broken after wishlist integration)
  // =========================

  const searchBtn = document.getElementById('searchBtn');
  const searchOverlay = document.getElementById('searchOverlay');
  const closeSearchBtn = document.getElementById('closeSearch');
  const searchInput = document.querySelector('.search-box input');
  const searchRight = document.querySelector('.search-right');

  function openSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.add('show');
    if (searchInput) searchInput.focus();
    document.body.style.overflow = 'hidden';
    // ensure recommended view by default
    showRecommended();
  }

  function closeSearch() {
    if (!searchOverlay) return;
    searchOverlay.classList.remove('show');
    document.body.style.overflow = 'auto';
    if (searchInput) searchInput.value = '';
    // remove any dynamic results container if present
    const results = document.querySelector('.search-results');
    if (results) results.remove();
  }

  if (searchBtn) searchBtn.addEventListener('click', (e) => { e.preventDefault(); openSearch(); });
  if (closeSearchBtn) closeSearchBtn.addEventListener('click', (e) => { e.preventDefault(); closeSearch(); });

  // Build and render search results based on product cards on the current page
  function renderSearchResults(query) {
    if (!searchRight) return;
    // remove prior results
    let results = document.querySelector('.search-results');
    if (results) results.remove();

    const q = (query || '').trim().toLowerCase();
    if (!q) return;

    const cards = Array.from(document.querySelectorAll('.product-card[data-id]'));
    const matches = cards.map(card => {
      const title = (card.querySelector('h3')?.textContent || '').trim();
      return { card, title };
    }).filter(item => item.title.toLowerCase().includes(q));

    results = document.createElement('div');
    results.className = 'search-results';
    results.style.padding = '20px 0';
    results.style.display = 'grid';
    results.style.gridTemplateColumns = 'repeat(auto-fit, minmax(220px, 1fr))';
    results.style.gap = '16px';

    if (!matches.length) {
      results.innerHTML = '<p>No results found.</p>';
    } else {
      results.innerHTML = matches.map(({ card }) => {
        const img = card.querySelector('.product-image img')?.src || '';
        const title = card.querySelector('h3')?.textContent || '';
        const price = card.querySelector('.price')?.textContent || '';
        const id = card.dataset.id || '';
        return `
          <div class="search-result-card" data-id="${id}" style="border:1px solid #eee;border-radius:12px;overflow:hidden;background:#fff;">
            <img src="${img}" style="width:100%;height:180px;object-fit:cover;display:block;" alt="${title}">
            <div style="padding:12px;">
              <h4 style="margin:0 0 8px;font-size:16px;">${title}</h4>
              <div style="font-weight:700;">${price}</div>
            </div>
          </div>
        `;
      }).join('');
    }

    // append results to searchRight (below categories)
    searchRight.appendChild(results);
  }

  // helpers to show/hide recommended vs dress results
  const searchCategories = document.querySelector('.search-categories');
  const recommendedTitle = document.querySelector('.recommended-title');
  const recommendedProducts = document.querySelector('.recommended-products');
  const dressResults = document.getElementById('dressResults');

  function showRecommended() {
    if (searchCategories) searchCategories.style.display = '';
    if (recommendedTitle) recommendedTitle.style.display = '';
    if (recommendedProducts) recommendedProducts.style.display = '';
    if (dressResults) {
      dressResults.classList.remove('active');
      dressResults.style.display = 'none';
      dressResults.setAttribute('aria-hidden', 'true');
    }
    const results = document.querySelector('.search-results');
    if (results) results.remove();
  }

  function showDressResults() {
    if (searchCategories) searchCategories.style.display = 'none';
    if (recommendedTitle) recommendedTitle.style.display = 'none';
    if (recommendedProducts) recommendedProducts.style.display = 'none';
    if (dressResults) {
      dressResults.classList.add('active');
      dressResults.style.display = 'block';
      dressResults.setAttribute('aria-hidden', 'false');
    }
    const results = document.querySelector('.search-results');
    if (results) results.remove();
  }

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const val = (e.target.value || '').trim().toLowerCase();
      if (!val) {
        showRecommended();
        return;
      }

      if (val === 'd' || val === 'dress' || val === 'dresses' || val.includes('dress')) {
        showDressResults();
        return;
      }

      renderSearchResults(val);
    });
  }
  // =========================
  // GLOBAL WISHLIST (localStorage)
  // =========================

  const WISHLIST_KEY = 'veloraWishlist_v1'; // versioned key for future migrations

  // Elements (may not exist on all pages)
  const wishlistOpenButtons = document.querySelectorAll('#wishlistBtn');
  const wishlistBadgeEls = document.querySelectorAll('.wishlist-count, #wishlistBadge');
  const wishlistOverlay = document.getElementById('wishlistOverlay');
  const wishlistModal = document.getElementById('wishlistModal');
  const wishlistGrid = document.getElementById('wishlistGrid');
  const wishlistCountText = document.getElementById('wishlistCount');
  const wishlistEmpty = document.getElementById('wishlistEmpty');

  // Utility: get/save
  function getWishlist() {
    try {
      return JSON.parse(localStorage.getItem(WISHLIST_KEY)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveWishlist(items) {
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));
    updateWishlistBadge(items.length);
  }

  function updateWishlistBadge(count) {
    wishlistBadgeEls.forEach(el => {
      if (el) el.textContent = count ?? (getWishlist().length);
    });
  }

  // Read product data from a product-card element. Must use data-id as unique id.
  function readProductFromCard(card) {
    if (!card) return null;
    const id = card.dataset.id;
    if (!id) return null; // require data-id
    const imgEl = card.querySelector('.product-image img');
    const titleEl = card.querySelector('h3');
    const priceEl = card.querySelector('.price');
    return {
      id: String(id),
      img: imgEl ? imgEl.src : '',
      title: titleEl ? titleEl.textContent.trim() : '',
      price: priceEl ? priceEl.textContent.trim() : ''
    };
  }

  function isInWishlist(id, list) {
    const arr = list || getWishlist();
    return arr.some(item => String(item.id) === String(id));
  }

  // Sync all hearts on the page to reflect wishlist state
  function syncHearts() {
    const cards = document.querySelectorAll('.product-card[data-id]');
    const list = getWishlist();
    cards.forEach(card => {
      const id = card.dataset.id;
      const btn = card.querySelector('.wishlist-btn');
      const icon = btn ? btn.querySelector('i') : null;
      if (!btn || !icon) return;
      if (isInWishlist(id, list)) {
        btn.classList.add('active');
        icon.classList.remove('fa-regular');
        icon.classList.add('fa-solid');
        icon.style.color = '#ff4b4b';
      } else {
        btn.classList.remove('active');
        icon.classList.remove('fa-solid');
        icon.classList.add('fa-regular');
        icon.style.color = '';
      }
    });
    updateWishlistBadge(list.length);
  }

  // Toggle wishlist state for a card
  function toggleWishlistForCard(card) {
    const product = readProductFromCard(card);
    if (!product) return;
    let list = getWishlist();
    if (isInWishlist(product.id, list)) {
      list = list.filter(i => String(i.id) !== String(product.id));
    } else {
      // Prevent duplicates
      if (!isInWishlist(product.id, list)) {
        list.push(product);
      }
    }
    saveWishlist(list);
    syncHearts();
    renderWishlist();
  }

  // Event delegation: listen for wishlist button clicks anywhere
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.wishlist-btn');
    if (btn) {
      e.preventDefault();
      const card = btn.closest('.product-card');
      toggleWishlistForCard(card);
    }
  });

  // Render wishlist modal dynamically from localStorage
  function renderWishlist() {
    const items = getWishlist();
    if (!wishlistGrid || !wishlistCountText || !wishlistEmpty) return;
    if (!items.length) {
      wishlistGrid.innerHTML = '';
      wishlistEmpty.style.display = 'block';
      wishlistCountText.textContent = '0 items';
      return;
    }
    wishlistEmpty.style.display = 'none';
    wishlistCountText.textContent = `${items.length} item${items.length !== 1 ? 's' : ''}`;
    wishlistGrid.innerHTML = items.map(item => {
      return `
        <article class="wishlist-card" data-id="${item.id}">
          <img src="${item.img}" alt="${item.title}">
          <div class="wishlist-card-body">
            <h3>${item.title}</h3>
            <span>${item.price}</span>
            <div class="wishlist-actions">
              <button class="wishlist-btn-action" data-id="${item.id}">ADD TO CART</button>
              <button class="wishlist-btn-remove" data-id="${item.id}">REMOVE</button>
            </div>
          </div>
        </article>
      `;
    }).join('');
  }

  // Open / close wishlist modal
  function openWishlistModal() {
    if (!wishlistOverlay || !wishlistModal) return;
    renderWishlist();
    wishlistOverlay.classList.add('show');
    wishlistModal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeWishlistModal() {
    if (!wishlistOverlay || !wishlistModal) return;
    wishlistOverlay.classList.remove('show');
    wishlistModal.classList.remove('show');
    document.body.style.overflow = 'auto';
  }

  // Wire open buttons (may be multiple)
  wishlistOpenButtons.forEach(btn => btn.addEventListener('click', (e) => { e.preventDefault(); openWishlistModal(); }));

  if (wishlistOverlay) wishlistOverlay.addEventListener('click', closeWishlistModal);
  const closeBtn = document.getElementById('closeWishlist');
  if (closeBtn) closeBtn.addEventListener('click', closeWishlistModal);

  // Delegate actions inside wishlist grid: remove / add to cart
  if (wishlistGrid) {
    wishlistGrid.addEventListener('click', (e) => {
      const rem = e.target.closest('.wishlist-btn-remove');
      if (rem) {
        const id = rem.dataset.id;
        let list = getWishlist();
        list = list.filter(i => String(i.id) !== String(id));
        saveWishlist(list);
        renderWishlist();
        syncHearts();
        return;
      }

      const add = e.target.closest('.wishlist-btn-action');
      if (add) {
        const id = add.dataset.id;
        // Reuse existing add-to-cart UX
        addWishlistItemToCart(add);
        return;
      }
    });
  }

  // Close wishlist on Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeWishlistModal();
    }
  });

  // Initialize hearts and badge on load
  syncHearts();
  updateWishlistBadge();

  // =========================
  // CART DRAWER + ADD TO CART
  // =========================

  const cartDrawer = document.querySelector('.cart-drawer');
  const cartOverlay = document.querySelector('.cart-overlay');
  const cartIcon = document.querySelector('.cart-icon');
  const closeCartBtn = document.querySelector('.close-cart');

  function openCart() {
    if (!cartDrawer || !cartOverlay) return;
    cartDrawer.classList.add('show');
    cartOverlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeCart() {
    if (!cartDrawer || !cartOverlay) return;
    cartDrawer.classList.remove('show');
    cartOverlay.classList.remove('show');
    document.body.style.overflow = 'auto';
  }

  if (cartIcon) cartIcon.addEventListener('click', openCart);
  if (closeCartBtn) closeCartBtn.addEventListener('click', closeCart);
  if (cartOverlay) cartOverlay.addEventListener('click', closeCart);

  // Simple cart count UX (non-persistent)
  let cartCount = document.querySelector('.cart-icon span');
  let cartNumber = Number(cartCount ? cartCount.textContent.trim() : 0) || 0;

  function addWishlistItemToCart(button) {
    // button is the element inside wishlist modal or product card
    cartNumber++;
    if (cartCount) cartCount.textContent = cartNumber;

    // show feedback on button
    const origText = button.textContent;
    button.textContent = '✓ ADDED';
    button.style.background = '#16a34a';
    button.style.color = '#fff';
    setTimeout(() => {
      button.textContent = origText || 'ADD TO CART';
      button.style.background = '';
      button.style.color = '';
    }, 1500);
  }

  // Wire add-to-cart buttons on product cards
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.cart-btn');
    if (btn) {
      addWishlistItemToCart(btn);
    }
  });

  // =========================
  // SMOOTH CATEGORY SCROLL
  // =========================
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  // =========================
  // HEADER SHADOW ON SCROLL
  // =========================
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (!header) return;
    if (window.scrollY > 20) header.style.boxShadow = '0 10px 25px rgba(0,0,0,0.08)';
    else header.style.boxShadow = '0 2px 10px rgba(0,0,0,0.05)';
  });

});
