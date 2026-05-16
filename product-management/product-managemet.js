// ── FHILAR Product Management Logic ──

// ── Sidebar Navigation ──
const navBtns = document.querySelectorAll('.nav-btn');
navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    navBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const page = btn.dataset.page;
    const pageMap = {
      'dashboard':           '../dashboard/dashboard.html',
      'product-management':  '../product-management/product-management.html',
      'product-information': '../product-information/product-information.html',
      'size-management':     '../size-management/size-management.html',
      'stocks':              '../stocks/stocks.html',
      'reports':             '../reports/reports.html',
      'transaction-history': '../transaction-history/transaction-history.html',
      'accounts':            '../accounts/accounts.html',
    };

    if (page !== 'product-management' && pageMap[page]) {
      window.location.href = pageMap[page];
    }
  });
});

// ── Helpers ──
const feedbackMsg       = document.getElementById('feedbackMsg');
const productsTableWrap = document.getElementById('productsTableWrap');
const productsTableBody = document.getElementById('productsTableBody');

function getProducts() {
  return JSON.parse(localStorage.getItem('fhilar_products') || '[]');
}

function saveProducts(products) {
  localStorage.setItem('fhilar_products', JSON.stringify(products));
}

function showFeedback(msg, isSuccess = false) {
  feedbackMsg.textContent = msg;
  feedbackMsg.className   = 'feedback-msg' + (isSuccess ? ' success' : '');
  setTimeout(() => { feedbackMsg.textContent = ''; feedbackMsg.className = 'feedback-msg'; }, 3000);
}

// ── ADD ──
document.getElementById('addBtn').addEventListener('click', () => {
  const input = document.getElementById('addInput');
  const name  = input.value.trim();

  if (!name) { showFeedback('Please enter a product name.'); return; }

  const products = getProducts();
  const exists   = products.find(p => p.name.toLowerCase() === name.toLowerCase());
  if (exists) { showFeedback('Product already exists.'); return; }

  products.push({ id: Date.now(), name });
  saveProducts(products);
  input.value = '';
  showFeedback(`"${name}" added successfully.`, true);

  if (productsTableWrap.style.display !== 'none') renderTable();
});

// ── EDIT ──
document.getElementById('editBtn').addEventListener('click', () => {
  const input = document.getElementById('editInput');
  const value = input.value.trim();

  const sep   = value.includes('→') ? '→' : '>';
  const parts = value.split(sep).map(s => s.trim());

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    showFeedback('Format: OldName > NewName');
    return;
  }

  const [oldName, newName] = parts;
  const products = getProducts();
  const idx = products.findIndex(p => p.name.toLowerCase() === oldName.toLowerCase());

  if (idx === -1) { showFeedback(`Product "${oldName}" not found.`); return; }

  products[idx].name = newName;
  saveProducts(products);
  input.value = '';
  showFeedback(`Renamed to "${newName}" successfully.`, true);

  if (productsTableWrap.style.display !== 'none') renderTable();
});

// ── DELETE ──
document.getElementById('deleteBtn').addEventListener('click', () => {
  const input = document.getElementById('deleteInput');
  const name  = input.value.trim();

  if (!name) { showFeedback('Please enter a product name to delete.'); return; }

  const products = getProducts();
  const idx = products.findIndex(p => p.name.toLowerCase() === name.toLowerCase());

  if (idx === -1) { showFeedback(`Product "${name}" not found.`); return; }

  products.splice(idx, 1);
  saveProducts(products);
  input.value = '';
  showFeedback(`"${name}" deleted successfully.`, true);

  if (productsTableWrap.style.display !== 'none') renderTable();
});

// ── VIEW PRODUCTS ──
document.getElementById('viewBtn').addEventListener('click', () => {
  const wrap = productsTableWrap;
  if (wrap.style.display === 'none') {
    wrap.style.display = 'block';
    renderTable();
  } else {
    wrap.style.display = 'none';
  }
});

function renderTable() {
  const products = getProducts();
  productsTableBody.innerHTML = '';

  if (products.length === 0) {
    productsTableBody.innerHTML =
      `<tr><td colspan="3" style="text-align:center;color:#c08090;padding:20px;">No products found.</td></tr>`;
    return;
  }

  products.forEach((p, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${p.name}</td>
      <td>
        <button class="tbl-delete-btn" data-id="${p.id}">DELETE</button>
      </td>
    `;
    productsTableBody.appendChild(tr);
  });

  productsTableBody.querySelectorAll('.tbl-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id      = parseInt(btn.dataset.id);
      let products  = getProducts();
      const removed = products.find(p => p.id === id);
      products      = products.filter(p => p.id !== id);
      saveProducts(products);
      showFeedback(removed ? `"${removed.name}" deleted.` : 'Deleted.', true);
      renderTable();
    });
  });
}

// Allow Enter key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const active = document.activeElement;
    if (active && active.id === 'addInput')    document.getElementById('addBtn').click();
    if (active && active.id === 'editInput')   document.getElementById('editBtn').click();
    if (active && active.id === 'deleteInput') document.getElementById('deleteBtn').click();
  }
});