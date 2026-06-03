// ==========================================
// VELORA Shopping Cart Controller
// ==========================================

// Local Storage helpers
function getCart() {
  try {
    return JSON.parse(localStorage.getItem("velora_cart")) || [];
  } catch (e) {
    console.error("Failed to parse cart:", e);
    return [];
  }
}

function saveCart(cart) {
  localStorage.setItem("velora_cart", JSON.stringify(cart));
}

function updateCartHeaderBadge() {
  const cart = getCart();
  const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const badge = document.getElementById("cart-badge");
  if (badge) {
    badge.textContent = totalCount;
  }
}

// Render dynamic cart contents
function renderCart() {
  const cart = getCart();
  const container = document.getElementById("cart-items-container");
  const countHeader = document.getElementById("cart-count-header");
  
  const subtotalEl = document.getElementById("cart-summary-subtotal");
  const taxEl = document.getElementById("cart-summary-tax");
  const totalEl = document.getElementById("cart-summary-total");

  // Sync top nav badge
  updateCartHeaderBadge();

  if (!container) return;

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  if (countHeader) {
    countHeader.textContent = `You have ${totalItems} item${totalItems === 1 ? '' : 's'} in your cart`;
  }

  if (cart.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 50px 20px;">
        <i class="fa-solid fa-basket-shopping" style="font-size: 48px; color: #ccc; margin-bottom: 15px;"></i>
        <h3>Your cart is empty</h3>
        <p style="color: gray; margin: 10px 0 25px;">Browse our collections and add items to your cart.</p>
        <a href="index.html" style="
          display: inline-block;
          padding: 12px 30px;
          background: #000;
          color: #fff;
          text-decoration: none;
          font-weight: bold;
          border-radius: 8px;
          transition: background 0.2s;
        " onmouseover="this.style.background='#333'" onmouseout="this.style.background='#000'">Go Shopping</a>
      </div>
    `;

    if (subtotalEl) subtotalEl.textContent = "Subtotal : Rs 0";
    if (taxEl) taxEl.textContent = "Tax : Rs 0";
    if (totalEl) totalEl.textContent = "Total : Rs 0";
    return;
  }

  let htmlContent = "";
  let subtotal = 0;

  cart.forEach((item, index) => {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    htmlContent += `
      <div class="item" data-id="${item.id}">
        <img src="${item.image}" alt="${item.title}">
        
        <div class="details">
          <h3>${item.title}</h3>
          <p>${item.description ? item.description.substring(0, 80) + '...' : 'Premium fashion item'}</p>
          <span>Rs ${item.price.toLocaleString('en-IN')} each</span>
        </div>

        <div class="quantity">
          <span class="qty-btn dec-qty" data-id="${item.id}">-</span>
          <span>${item.quantity}</span>
          <span class="qty-btn inc-qty" data-id="${item.id}">+</span>
        </div>

        <div class="price">
          <h3>Rs ${itemSubtotal.toLocaleString('en-IN')}</h3>
          <p class="remove-item-btn" data-id="${item.id}" style="color: #ef4444; font-weight: bold;">Remove</p>
        </div>
      </div>
      ${index < cart.length - 1 ? '<hr>' : ''}
    `;
  });

  container.innerHTML = htmlContent;

  // Calculate order summary
  const tax = Math.round(subtotal * 0.05); // 5% tax
  const grandTotal = subtotal + tax;

  if (subtotalEl) subtotalEl.textContent = `Subtotal : Rs ${subtotal.toLocaleString('en-IN')}`;
  if (taxEl) taxEl.textContent = `Tax : Rs ${tax.toLocaleString('en-IN')}`;
  if (totalEl) totalEl.textContent = `Total : Rs ${grandTotal.toLocaleString('en-IN')}`;
}

// Set up event listeners
document.addEventListener("DOMContentLoaded", () => {
  renderCart();

  const container = document.getElementById("cart-items-container");
  const clearBtn = document.getElementById("cart-clear-btn");
  const checkoutBtn = document.getElementById("cart-checkout-btn");

  // Handle quantity changes and deletes via event delegation
  if (container) {
    container.addEventListener("click", (e) => {
      const target = e.target;
      const itemId = target.getAttribute("data-id");

      if (!itemId) return;

      let cart = getCart();
      const itemIndex = cart.findIndex(item => item.id == itemId);

      if (itemIndex === -1) return;

      if (target.classList.contains("inc-qty")) {
        // Increment (max limit 10 for sanity check)
        if (cart[itemIndex].quantity < 10) {
          cart[itemIndex].quantity += 1;
        }
      } else if (target.classList.contains("dec-qty")) {
        // Decrement (min 1)
        if (cart[itemIndex].quantity > 1) {
          cart[itemIndex].quantity -= 1;
        } else {
          // If decrementing at 1, remove item
          cart.splice(itemIndex, 1);
        }
      } else if (target.classList.contains("remove-item-btn")) {
        // Delete item
        cart.splice(itemIndex, 1);
      }

      saveCart(cart);
      renderCart();
    });
  }

  // Clear Cart handler
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear your shopping cart?")) {
        saveCart([]);
        renderCart();
      }
    });
  }

  // Checkout handler
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      const cart = getCart();
      if (cart.length === 0) {
        alert("Your cart is empty! Please add some products before checking out.");
        return;
      }
      
      const btnText = checkoutBtn.textContent;
      checkoutBtn.disabled = true;
      checkoutBtn.textContent = "Processing Checkout...";
      checkoutBtn.style.background = "#555";

      setTimeout(() => {
        alert("Secure checkout simulated successfully! Thank you for ordering from VELORA.");
        saveCart([]);
        renderCart();
        
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = btnText;
        checkoutBtn.style.background = "#000";
      }, 1500);
    });
  }
});
