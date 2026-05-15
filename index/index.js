// ── FHILAR Index / Splash Logic ──

const proceedBtn = document.getElementById('proceedBtn');

proceedBtn.addEventListener('click', () => {
  window.location.href = '../login/login.html';
});

// Allow Enter key to proceed
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') proceedBtn.click();
});