// ── FHILAR Stocks Logic ──

// ── Sidebar Navigation ──
const navBtns = document.querySelectorAll('.nav-btn');

const _path    = window.location.pathname;
const _rootIdx = _path.lastIndexOf('/stocks/');
const _root    = _rootIdx !== -1
  ? window.location.origin + _path.substring(0, _rootIdx)
  : window.location.origin + _path.substring(0, _path.lastIndexOf('/'));

function goTo(folder, file) {
  window.location.href = _root + '/' + folder + '/' + file;
}

navBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const page = btn.dataset.page;
    switch (page) {
      case 'dashboard':           goTo('dashboard',           'dashboard.html');           break;
      case 'product-management':  goTo('product-management',  'product-management.html');  break;
      case 'product-information': goTo('product-information', 'product-information.html'); break;
      case 'size-management':     goTo('size-management',     'size-management.html');     break;
      case 'stocks':              goTo('stocks',              'stocks.html');              break;
      case 'reports':             goTo('reports',             'reports.html');             break;
      case 'transaction-history': goTo('transaction-history', 'transaction-history.html'); break;
      case 'accounts':            goTo('accounts',            'accounts.html');            break;
    }
  });
});

// ── Storage Keys ──
const STOCKS_KEY   = 'fhilar_stocks';
const PRODUCTS_KEY = 'fhilar_products';
const SIZES_KEY    = 'fhilar_sizes';

// ── Helpers ──
const feedbackMsg     = document.getElementById('feedbackMsg');
const stocksTableWrap = document.getElementById('stocksTableWrap');
const stocksTableBody = document.getElementById('stocksTableBody');
const productSelect   = document.getElementById('productSelect');
const sizeSelect      = document.getElementById('sizeSelect');
const colorInput      = document.getElementById('colorInput');
const quantityInput   = document.getElementById('quantityInput');

function getStocks()   { return JSON.parse(localStorage.getItem(STOCKS_KEY)   || '[]'); }
function getProducts() { return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]'); }
function getSizes()    { return JSON.parse(localStorage.getItem(SIZES_KEY)    || '[]'); }

function saveStocks(stocks) {
  localStorage.setItem(STOCKS_KEY, JSON.stringify(stocks));
}

function showFeedback(msg, isSuccess = false) {
  feedbackMsg.textContent = msg;
  feedbackMsg.className   = 'feedback-msg' + (isSuccess ? ' success' : '');
  setTimeout(() => {
    feedbackMsg.textContent = '';
    feedbackMsg.className   = 'feedback-msg';
  }, 3000);
}

// ── Populate dropdowns from saved data ──
function populateDropdowns() {
  // Products
  const products = getProducts();
  const currentProduct = productSelect.value;
  productSelect.innerHTML = '<option value="">-- select product --</option>';
  products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.name;
    opt.textContent = p.name;
    if (p.name === currentProduct) opt.selected = true;
    productSelect.appendChild(opt);
  });

  // Sizes
  const sizes = getSizes();
  const currentSize = sizeSelect.value;
  sizeSelect.innerHTML = '<option value="">-- select size --</option>';
  sizes.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name;
    opt.textContent = s.name;
    if (s.name === currentSize) opt.selected = true;
    sizeSelect.appendChild(opt);
  });
}

// ── ADD STOCK ──
document.getElementById('addStockBtn').addEventListener('click', () => {
  const productName = productSelect.value.trim();
  const size        = sizeSelect.value.trim();
  const color       = colorInput.value.trim();
  const quantity    = parseInt(quantityInput.value);

  if (!productName)        { showFeedback('Please select a product.'); return; }
  if (!size)               { showFeedback('Please select a size.'); return; }
  if (!color)              { showFeedback('Please enter a color.'); return; }
  if (isNaN(quantity) || quantity < 0) { showFeedback('Please enter a valid quantity.'); return; }

  const stocks = getStocks();

  // Check if exact combination already exists — if so, add to quantity
  const existing = stocks.find(s =>
    s.productName.toLowerCase() === productName.toLowerCase() &&
    s.size.toLowerCase()        === size.toLowerCase() &&
    s.color.toLowerCase()       === color.toLowerCase()
  );

  if (existing) {
    existing.quantity += quantity;
    saveStocks(stocks);
    showFeedback(`Stock updated: "${productName}" (${size}, ${color}) → ${existing.quantity} pcs.`, true);
  } else {
    stocks.push({
      id: Date.now(),
      productName,
      size,
      color,
      quantity,
    });
    saveStocks(stocks);
    showFeedback(`Stock added: "${productName}" (${size}, ${color}) — ${quantity} pcs.`, true);
  }

  // Clear fields
  productSelect.value  = '';
  sizeSelect.value     = '';
  colorInput.value     = '';
  quantityInput.value  = '';

  if (stocksTableWrap.style.display !== 'none') renderTable();
});

// ── CLEAR fields ──
document.getElementById('clearBtn').addEventListener('click', () => {
  productSelect.value = '';
  sizeSelect.value    = '';
  colorInput.value    = '';
  quantityInput.value = '';
  feedbackMsg.textContent = '';
});

// ── VIEW toggle ──
document.getElementById('viewBtn').addEventListener('click', () => {
  if (stocksTableWrap.style.display === 'none') {
    stocksTableWrap.style.display = 'block';
    renderTable();
  } else {
    stocksTableWrap.style.display = 'none';
  }
});

// ── Search ──
document.getElementById('tableSearch').addEventListener('input', () => {
  renderTable(document.getElementById('tableSearch').value.trim().toLowerCase());
});

// ── Render Table ──
function renderTable(filter = '') {
  let stocks = getStocks();

  if (filter) {
    stocks = stocks.filter(s =>
      s.productName.toLowerCase().includes(filter) ||
      s.size.toLowerCase().includes(filter) ||
      s.color.toLowerCase().includes(filter)
    );
  }

  stocksTableBody.innerHTML = '';

  if (stocks.length === 0) {
    stocksTableBody.innerHTML =
      `<tr><td colspan="7" style="text-align:center;color:#c08090;padding:20px;">No stock records found.</td></tr>`;
    return;
  }

  // Use the original unfiltered list to get real index for updates/deletes
  const allStocks = getStocks();

  stocks.forEach((s, i) => {
    const isLow   = s.quantity <= 5;
    const badge   = isLow
      ? `<span class="badge-low">LOW</span>`
      : `<span class="badge-ok">OK</span>`;

    const tr = document.createElement('tr');
    tr.dataset.id = s.id;
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${s.productName}</td>
      <td>${s.size}</td>
      <td>${s.color}</td>
      <td>
        <input type="number" class="qty-input" value="${s.quantity}" min="0" data-id="${s.id}" />
      </td>
      <td>${badge}</td>
      <td>
        <button class="tbl-action-btn tbl-update-btn" data-id="${s.id}">UPDATE</button>
        <button class="tbl-action-btn tbl-delete-btn"  data-id="${s.id}">DELETE</button>
      </td>
    `;
    stocksTableBody.appendChild(tr);
  });

  // UPDATE qty inline
  stocksTableBody.querySelectorAll('.tbl-update-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id      = parseInt(btn.dataset.id);
      const row     = btn.closest('tr');
      const qtyEl   = row.querySelector('.qty-input');
      const newQty  = parseInt(qtyEl.value);

      if (isNaN(newQty) || newQty < 0) { showFeedback('Enter a valid quantity.'); return; }

      const stocks = getStocks();
      const item   = stocks.find(s => s.id === id);
      if (!item) return;

      item.quantity = newQty;
      saveStocks(stocks);
      showFeedback(`"${item.productName}" quantity updated to ${newQty}.`, true);
      renderTable(document.getElementById('tableSearch').value.trim().toLowerCase());
    });
  });

  // DELETE
  stocksTableBody.querySelectorAll('.tbl-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id      = parseInt(btn.dataset.id);
      let stocks    = getStocks();
      const removed = stocks.find(s => s.id === id);
      stocks        = stocks.filter(s => s.id !== id);
      saveStocks(stocks);
      showFeedback(removed ? `"${removed.productName}" (${removed.size}, ${removed.color}) removed.` : 'Deleted.', true);
      renderTable(document.getElementById('tableSearch').value.trim().toLowerCase());
    });
  });
}

// ── Init ──
populateDropdowns();

// Re-populate dropdowns on focus in case products/sizes were added in another tab
window.addEventListener('focus', populateDropdowns);