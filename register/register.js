// ── FHILAR Register Logic ──

const enterBtn      = document.getElementById('enterBtn');
const clearBtn      = document.getElementById('clearBtn');
const returnBtn     = document.getElementById('returnBtn');
const nameInput     = document.getElementById('name');
const userTypeInput = document.getElementById('userType');
const passwordInput = document.getElementById('password');
const emailInput    = document.getElementById('email');
const errorMsg      = document.getElementById('errorMsg');
const successMsg    = document.getElementById('successMsg');

// ── Choice Buttons for User Type ──
const choiceBtns = document.querySelectorAll('.choice-btn');
choiceBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    choiceBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    userTypeInput.value = btn.dataset.value;
  });
});

// Return to Login
returnBtn.addEventListener('click', () => {
  window.location.href = '../login/login.html';
});

// Clear all fields
clearBtn.addEventListener('click', () => {
  nameInput.value      = '';
  userTypeInput.value  = '';
  passwordInput.value  = '';
  emailInput.value     = '';
  choiceBtns.forEach(b => b.classList.remove('active'));
  errorMsg.textContent   = '';
  successMsg.textContent = '';
});

// Register / Enter
enterBtn.addEventListener('click', () => {
  errorMsg.textContent   = '';
  successMsg.textContent = '';

  const name     = nameInput.value.trim();
  const userType = userTypeInput.value.trim();
  const password = passwordInput.value.trim();
  const email    = emailInput.value.trim();

  if (!name || !userType || !password || !email) {
    errorMsg.textContent = 'Please fill in all fields.';
    return;
  }

  if (!isValidEmail(email)) {
    errorMsg.textContent = 'Please enter a valid email address.';
    return;
  }

  if (password.length < 6) {
    errorMsg.textContent = 'Password must be at least 6 characters.';
    return;
  }

  const users = JSON.parse(localStorage.getItem('fhilar_users') || '[]');

  const exists = users.find(
    u => u.email.toLowerCase() === email.toLowerCase() && u.userType === userType
  );
  if (exists) {
    errorMsg.textContent = 'This account already exists.';
    return;
  }

  users.push({ name, userType, password, email });
  localStorage.setItem('fhilar_users', JSON.stringify(users));

  successMsg.textContent = 'Account registered successfully! Redirecting to login...';

  setTimeout(() => {
    window.location.href = '../login/login.html';
  }, 1800);
});

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') enterBtn.click();
});