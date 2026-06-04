document.addEventListener('DOMContentLoaded', function () {
  const policyRows = document.querySelectorAll('.policy-row');
  const logoutBtn = document.getElementById('logoutBtn');
  const contactUsCard = document.getElementById('contactUsCard');
  const searchBtn = document.getElementById('searchBtn');
  const searchOverlay = document.getElementById('searchOverlay');
  const closeSearchBtn = document.getElementById('closeSearch');

  policyRows.forEach(function (row) {
    row.addEventListener('click', function () {
      row.classList.toggle('open');
    });
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      var confirmed = window.confirm('Are you sure you want to log out?');
      if (confirmed) {
        window.location.href = '../index.html';
      }
    });
  }

  if (contactUsCard) {
    contactUsCard.addEventListener('click', function () {
      window.open('https://wa.me/919999999999?text=Hello%20VELORA%20Support', '_blank');
    });
  }

  if (searchBtn && searchOverlay) {
    searchBtn.addEventListener('click', function () {
      searchOverlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    });
  }

  if (closeSearchBtn && searchOverlay) {
    closeSearchBtn.addEventListener('click', function () {
      searchOverlay.classList.remove('show');
      document.body.style.overflow = 'auto';
    });
  }

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && searchOverlay && searchOverlay.classList.contains('show')) {
      searchOverlay.classList.remove('show');
      document.body.style.overflow = 'auto';
    }
  });
});