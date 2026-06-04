document.addEventListener('DOMContentLoaded', function () {
  const policyRows = document.querySelectorAll('.policy-row');
  const logoutBtn = document.getElementById('logoutBtn');
  const contactUsCard = document.getElementById('contactUsCard');

  policyRows.forEach(function (row) {
    row.addEventListener('click', function () {
      row.classList.toggle('open');
    });
  });

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function () {
      var confirmed = window.confirm('Are you sure you want to log out?');
      if (confirmed) {
        window.location.href = 'index.html';
      }
    });
  }

  if (contactUsCard) {
    contactUsCard.addEventListener('click', function () {
      window.open('https://wa.me/919999999999?text=Hello%20VELORA%20Support', '_blank');
    });
  }
});