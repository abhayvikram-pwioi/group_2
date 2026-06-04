document.addEventListener('DOMContentLoaded', () => {
    const $ = s => document.getElementById(s);
    const form = $('checkout-form'), successModal = $('success-modal'), continueShoppingBtn = $('btn-continue-shopping');
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
