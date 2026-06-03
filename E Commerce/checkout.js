/**
 * Optimized Checkout JS
 * Simplified: Removed Credit/Debit Card and UPI ID sub-form validation and formatting.
 * Only Cash on Delivery info panel remains active.
 */
document.addEventListener('DOMContentLoaded', () => {
    const $ = id => document.getElementById(id);
    const form = $('checkout-form');
    const nameInput = $('full-name');
    const emailInput = $('email');
    const phoneInput = $('phone');
    const addressInput = $('shipping-address');
    const cityInput = $('city');
    const pincodeInput = $('pincode');
    const successModal = $('success-modal');
    const continueShoppingBtn = $('btn-continue-shopping');

    // UI state toggler for error/success alerts
    const toggleState = (input, isValid, errorMsg) => {
        const group = input.closest('.form-group');
        if (!group) return;
        group.classList.toggle('has-error', !isValid);
        group.classList.toggle('has-success', isValid);
        const errSpan = group.querySelector('.error-message');
        if (errSpan) {
            errSpan.textContent = errorMsg || '';
            errSpan.style.display = isValid ? 'none' : 'block';
        }
        if (isValid) {
            input.removeAttribute('aria-invalid');
            input.removeAttribute('aria-describedby');
        } else {
            input.setAttribute('aria-invalid', 'true');
            if (errSpan) input.setAttribute('aria-describedby', errSpan.id);
        }
    };

    // Generic rule-based validator engine
    const validateField = (input, rules) => {
        const val = input.value.trim();
        for (const r of rules) {
            if (!r.test(val)) {
                toggleState(input, false, r.msg);
                return false;
            }
        }
        toggleState(input, true);
        return true;
    };

    // Required global/window scope validators
    window.validateName = () => validateField(nameInput, [
        { test: v => v !== "", msg: "Full Name is required." },
        { test: v => v.length >= 3, msg: "Full Name must be at least 3 characters long." }
    ]);

    window.validateEmail = () => validateField(emailInput, [
        { test: v => v !== "", msg: "Email Address is required." },
        { test: v => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v), msg: "Please enter a valid email address (e.g. name@domain.com)." }
    ]);

    window.validatePhone = () => validateField(phoneInput, [
        { test: v => v !== "", msg: "Phone Number is required." },
        { test: v => /^[6-9]\d{9}$/.test(v.replace(/\D/g, "")), msg: "Enter a valid 10-digit Indian phone number (starts with 6-9)." }
    ]);

    window.validateAddress = () => validateField(addressInput, [
        { test: v => v !== "", msg: "Shipping Address is required." },
        { test: v => v.length >= 10, msg: "Please write a complete shipping address (min 10 characters)." }
    ]);

    window.validateCity = () => validateField(cityInput, [
        { test: v => v !== "", msg: "City is required." }
    ]);

    window.validatePincode = () => validateField(pincodeInput, [
        { test: v => v !== "", msg: "Pincode is required." },
        { test: v => /^\d{6}$/.test(v.replace(/\D/g, "")), msg: "Pincode must be exactly 6 digits." }
    ]);

    window.validateForm = () => {
        // Runs all validators to draw visual error markers for all fields concurrently
        return [
            window.validateName, window.validateEmail, window.validatePhone,
            window.validateAddress, window.validateCity, window.validatePincode
        ].map(fn => fn()).every(Boolean);
    };

    window.showSuccessModal = () => {
        $('modal-customer-name').textContent = nameInput.value.trim();
        $('modal-email').textContent = emailInput.value.trim();
        $('modal-payment-method').textContent = form.querySelector('input[name="payment-method"]:checked').value;
        $('modal-order-number').textContent = `TC-${Math.floor(100000 + Math.random() * 900000)}-IND`;
        successModal.classList.remove('hidden');
        setTimeout(() => continueShoppingBtn.focus(), 100);
        document.addEventListener('keydown', trapModalFocus);
    };

    // Modal accessibility focus trap
    const trapModalFocus = e => {
        if (e.key === 'Tab') {
            e.preventDefault();
            continueShoppingBtn.focus();
        }
        if (e.key === 'Escape') {
            e.preventDefault();
            successModal.classList.add('hidden');
            window.location.href = 'cart.html';
        }
    };

    // Iteratively attach live listeners
    const bindings = [
        [nameInput, window.validateName], [emailInput, window.validateEmail],
        [phoneInput, window.validatePhone], [addressInput, window.validateAddress],
        [cityInput, window.validateCity], [pincodeInput, window.validatePincode]
    ];
    bindings.forEach(([input, fn]) => {
        input.addEventListener('input', fn);
        input.addEventListener('blur', fn);
    });

    // Formatting utilities
    const filterDigits = input => input.value = input.value.replace(/\D/g, "");
    
    phoneInput.addEventListener('input', e => {
        filterDigits(e.target);
        window.validatePhone();
    });
    
    pincodeInput.addEventListener('input', e => {
        filterDigits(e.target);
        window.validatePincode();
    });

    // Payment sub-forms toggle visibility (Only COD info box remains)
    document.querySelectorAll('input[name="payment-method"]').forEach(radio => {
        radio.addEventListener('change', e => {
            const codPanel = $('cod-details-panel');
            if (e.target.value === "Cash on Delivery") {
                codPanel?.classList.add('active');
            } else {
                codPanel?.classList.remove('active');
            }
        });
    });

    // Submit handler
    form.addEventListener('submit', e => {
        e.preventDefault();
        if (window.validateForm()) {
            window.showSuccessModal();
        } else {
            const firstErr = form.querySelector('.has-error :is(input, textarea)');
            if (firstErr) {
                firstErr.focus();
                firstErr.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    });
});
