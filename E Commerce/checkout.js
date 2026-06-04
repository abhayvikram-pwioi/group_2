document.addEventListener('DOMContentLoaded', () => {
    const $ = s => document.getElementById(s);
    const form = $('checkout-form'), successModal = $('success-modal'), continueShoppingBtn = $('btn-continue-shopping');

    function getCart() {
        try {
            return JSON.parse(localStorage.getItem("velora_cart")) || [];
        } catch (e) {
            return [];
        }
    }

    const cart = getCart();
    if (cart.length === 0) {
        alert("Your cart is empty! Redirecting to Cart page...");
        window.location.href = "cart.html";
        return;
    }

    // Dynamic Summary Loading
    const itemsCountEl = $('checkout-items-count');
    const itemsContainerEl = $('checkout-items-container');
    const subtotalEl = $('checkout-subtotal');
    const taxEl = $('checkout-tax');
    const totalEl = $('checkout-total');

    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (itemsCountEl) {
        itemsCountEl.textContent = `${totalItems} Item${totalItems === 1 ? '' : 's'}`;
    }

    let itemsHtml = "";
    let subtotal = 0;
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        subtotal += itemTotal;
        itemsHtml += `
        <div class="summary-item-row">
            <div class="item-img-wrapper">
                <img src="${item.image}" alt="${item.title}">
            </div>
            <div class="item-meta">
                <h3 class="item-title">${item.title}</h3>
                <p class="item-qty">Qty: ${item.quantity}</p>
            </div>
            <span class="item-price">Rs ${itemTotal.toLocaleString('en-IN')}</span>
        </div>
        `;
    });

    if (itemsContainerEl) {
        itemsContainerEl.innerHTML = itemsHtml;
    }

    // Retrieve discount and giftwrap states
    const discountPercent = parseInt(localStorage.getItem("velora_discount_percent") || "0", 10);
    const isGiftWrap = localStorage.getItem("velora_gift_wrap") === "true";

    const discount = Math.round(subtotal * (discountPercent / 100));
    const discountRow = $('checkout-discount-row');
    const discountVal = $('checkout-discount');
    if (discountPercent > 0 && discountRow && discountVal) {
        discountVal.textContent = `-Rs ${discount.toLocaleString('en-IN')}`;
        discountRow.style.display = 'flex';
    } else if (discountRow) {
        discountRow.style.display = 'none';
    }

    const giftwrapCost = isGiftWrap ? 50 : 0;
    const giftwrapRow = $('checkout-giftwrap-row');
    const giftwrapVal = $('checkout-giftwrap');
    if (isGiftWrap && giftwrapRow && giftwrapVal) {
        giftwrapVal.textContent = `Rs ${giftwrapCost}`;
        giftwrapRow.style.display = 'flex';
    } else if (giftwrapRow) {
        giftwrapRow.style.display = 'none';
    }

    const taxableAmount = Math.max(0, subtotal - discount + giftwrapCost);
    const tax = Math.round(taxableAmount * 0.05);
    const grandTotal = taxableAmount + tax;

    if (subtotalEl) {
        subtotalEl.textContent = `Rs ${subtotal.toLocaleString('en-IN')}`;
    }
    if (taxEl) {
        taxEl.textContent = `Rs ${tax.toLocaleString('en-IN')}`;
    }
    if (totalEl) {
        totalEl.textContent = `Rs ${grandTotal.toLocaleString('en-IN')}`;
    }

    const fields = {
        'full-name': [v => v.length >= 3, "Full Name must be at least 3 characters."],
        'email': [v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), "Enter a valid email address."],
        'phone': [v => /^[6-9]\d{9}$/.test(v.replace(/\D/g, "")), "Enter a valid 10-digit Indian phone number."],
        'shipping-address': [v => v.length >= 10, "Address must be at least 10 characters."],
        'city': [v => v.trim() !== "", "City is required."],
        'pincode': [v => /^\d{6}$/.test(v.replace(/\D/g, "")), "Pincode must be exactly 6 digits."]
    };

    const validate = (id) => {
        const el = $(id); if (!el) return true;
        const val = el.value.trim(), [testFn, msg] = fields[id];
        const isValid = testFn(val), group = el.closest('.form-group'), err = group?.querySelector('.error-message');
        group?.classList.toggle('has-error', !isValid);
        group?.classList.toggle('has-success', isValid);
        if (err) { err.textContent = isValid ? '' : msg; err.style.display = isValid ? 'none' : 'block'; }
        return isValid;
    };

    Object.keys(fields).forEach(id => {
        const el = $(id);
        if (el) {
            el.addEventListener('input', () => {
                if (id === 'phone' || id === 'pincode') el.value = el.value.replace(/\D/g, "");
                validate(id);
            });
            el.addEventListener('blur', () => validate(id));
        }
    });

    document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
        radio.addEventListener('change', e => $('cod-details-panel')?.classList.toggle('active', e.target.value === "Cash on Delivery"));
    });

    form?.addEventListener('submit', e => {
        e.preventDefault();
        const isValid = Object.keys(fields).map(validate).every(Boolean);
        if (isValid) {
            $('modal-customer-name').textContent = $('full-name').value;
            $('modal-email').textContent = $('email').value;
            $('modal-payment-method').textContent = form.querySelector('input[name="payment-method"]:checked').value;
            $('modal-order-number').textContent = `TC-${Math.floor(100000 + Math.random() * 900000)}-IND`;
            
            // Clear cart on successful order placement
            localStorage.setItem("velora_cart", JSON.stringify([]));
            localStorage.removeItem("velora_discount_percent");
            localStorage.removeItem("velora_gift_wrap");

            successModal.classList.remove('hidden');
            setTimeout(() => continueShoppingBtn?.focus(), 100);
            document.addEventListener('keydown', trapFocus);
        } else {
            const first = form.querySelector('.has-error input, .has-error textarea');
            if (first) { first.focus(); first.scrollIntoView({ behavior: 'smooth', block: 'center' }); }
        }
    });

    const trapFocus = e => {
        if (e.key === 'Tab') { e.preventDefault(); continueShoppingBtn?.focus(); }
        if (e.key === 'Escape') { e.preventDefault(); successModal.classList.add('hidden'); window.location.href = 'cart.html'; }
    };
});
