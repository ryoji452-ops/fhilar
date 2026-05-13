// ── FHILAR Login Logic ──

const loginBtn    = document.getElementById('loginBtn');
const registerBtn = document.getElementById('registerBtn');
const userTypeInput = document.getElementById('userType');
const emailInput  = document.getElementById('email');
const passwordInput = document.getElementById('password');
const errorMsg    = document.getElementById('errorMsg');

// ── Choice Buttons for User Type ──
const choiceBtns = document.querySelectorAll('.choice-btn');
choiceBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    choiceBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    userTypeInput.value = btn.dataset.value;
  });
});

// Navigate to Register page
registerBtn.addEventListener('click', () => {
  window.location.href = '../register/register.html';
});

// Login validation
loginBtn.addEventListener('click', () => {
  const userType = userTypeInput.value.trim();
  const email    = emailInput.value.trim();
  const password = passwordInput.value.trim();

  errorMsg.textContent = '';

  if (!userType || !email || !password) {
    errorMsg.textContent = 'Please fill in all fields.';
    return;
  }

  // Retrieve registered users from localStorage
  const users = JSON.parse(localStorage.getItem('fhilar_users') || '[]');

  const match = users.find(
    u => u.userType.toLowerCase() === userType.toLowerCase()
      && u.email.toLowerCase() === email.toLowerCase()
      && u.password === password
  );

  if (match) {
    localStorage.setItem('fhilar_current_user', JSON.stringify(match));
    window.location.href = '../dashboard/dashboard.html';
  } else {
    errorMsg.textContent = 'Invalid user type, email, or password.';
    passwordInput.value = '';
  }
});

// Allow Enter key to submit
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') loginBtn.click();
});