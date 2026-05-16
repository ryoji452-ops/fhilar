// ── FHILAR Transaction History Logic ──

// ── Sidebar Navigation ──
const navBtns = document.querySelectorAll('.nav-btn');

const _path    = window.location.pathname;
const _rootIdx = _path.lastIndexOf('/transaction-history/');
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
const TXN_KEY      = 'fhilar_transactions';
const PRODUCTS_KEY = 'fhilar_products';
const SIZES_KEY    = 'fhilar_sizes';
const SALES_KEY    = 'fhilar_sales';

// ── Helpers ──
const feedbackMsg = document.getElementById('feedbackMsg');

function getTransactions() { return JSON.parse(localStorage.getItem(TXN_KEY)      || '[]'); }
function getProducts()     { return JSON.parse(localStorage.getItem(PRODUCTS_KEY) || '[]'); }
function getSizes()        { return JSON.parse(localStorage.getItem(SIZES_KEY)    || '[]'); }

function saveTransactions(txns) {
  localStorage.setItem(TXN_KEY, JSON.stringify(txns));
}

function showFeedback(msg, isSuccess = false) {
  feedbackMsg.textContent = msg;
  feedbackMsg.className   = 'feedback-msg' + (isSuccess ? ' success' : '');
  setTimeout(() => {
    feedbackMsg.textContent = '';
    feedbackMsg.className   = 'feedback-msg';
  }, 3500);
}

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-PH', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatAmount(val) {
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  return '₱ ' + n.toLocaleString('en-PH', { minimumFractionDigits: 2 });
}

// ── Badge helper ──
function typeBadge(type) {
  const map = {
    'Sale':       'badge-sale',
    'Restock':    'badge-restock',
    'Adjustment': 'badge-adjust',
    'Return':     'badge-return',
  };
  const cls = map[type] || 'badge-sale';
  return `<span class="badge ${cls}">${type.toUpperCase()}</span>`;
}

// ── Pagination state ──
const PAGE_SIZE = 10;
let currentPage  = 1;
let filteredData = [];

// ── Populate dropdowns ──
function populateDropdowns() {
  const products = getProducts();
  const sizes    = getSizes();

  // Add transaction selects
  const txnProduct = document.getElementById('txnProduct');
  const txnSize    = document.getElementById('txnSize');
  const curP = txnProduct.value;
  const curS = txnSize.value;

  txnProduct.innerHTML = '<option value="">-- select product --</option>';
  products.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.name; opt.textContent = p.name;
    if (p.name === curP) opt.selected = true;
    txnProduct.appendChild(opt);
  });

  txnSize.innerHTML = '<option value="">-- select size --</option>';
  sizes.forEach(s => {
    const opt = document.createElement('option');
    opt.value = s.name; opt.textContent = s.name;
    if (s.name === curS) opt.selected = true;
    txnSize.appendChild(opt);
  });

  // Filter product dropdown
  const filterProduct = document.getElementById('filterProduct');
  const txns = getTransactions();
  const uniqueProducts = [...new Set(txns.map(t => t.productName))].sort();
  filterProduct.innerHTML = '<option value="">All Products</option>';
  uniqueProducts.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name; opt.textContent = name;
    filterProduct.appendChild(opt);
  });
}

// ── Set today's date as default ──
function setDefaultDate() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('txnDate').value = today;
}

// ── Summary Cards ──
function loadSummary() {
  const txns  = getTransactions();
  const total = txns.length;
  const sales = txns
    .filter(t => t.type === 'Sale')
    .reduce((sum, t) => sum + (parseFloat(t.amount) || 0), 0);
  const units = txns.reduce((sum, t) => sum + (parseInt(t.quantity) || 0), 0);

  document.getElementById('sumTotal').textContent = total.toLocaleString();
  document.getElementById('sumSales').textContent =
    '₱ ' + sales.toLocaleString('en-PH', { minimumFractionDigits: 2 });
  document.getElementById('sumUnits').textContent = units.toLocaleString();
}

// ── Sync sales to fhilar_sales for dashboard ──
function syncSalesData() {
  const txns = getTransactions();
  const salesTxns = txns.filter(t => t.type === 'Sale');

  // Build per-product sold count + total amount for dashboard
  const salesMap = {};
  salesTxns.forEach(t => {
    const key = t.productName;
    if (!salesMap[key]) salesMap[key] = { name: key, sold: 0, amount: 0 };
    salesMap[key].sold   += parseInt(t.quantity) || 0;
    salesMap[key].amount += parseFloat(t.amount) || 0;
  });

  localStorage.setItem(SALES_KEY, JSON.stringify(Object.values(salesMap)));
}

// ── ADD TRANSACTION ──
document.getElementById('addTxnBtn').addEventListener('click', () => {
  const productName = document.getElementById('txnProduct').value.trim();
  const size        = document.getElementById('txnSize').value.trim();
  const color       = document.getElementById('txnColor').value.trim();
  const type        = document.getElementById('txnType').value.trim();
  const quantity    = parseInt(document.getElementById('txnQty').value);
  const amount      = parseFloat(document.getElementById('txnAmount').value) || 0;
  const date        = document.getElementById('txnDate').value;
  const notes       = document.getElementById('txnNotes').value.trim();

  if (!productName) { showFeedback('Please select a product.'); return; }
  if (!size)        { showFeedback('Please select a size.'); return; }
  if (!color)       { showFeedback('Please enter a color.'); return; }
  if (!type)        { showFeedback('Please select a transaction type.'); return; }
  if (isNaN(quantity) || quantity < 1) { showFeedback('Please enter a valid quantity (min 1).'); return; }
  if (!date)        { showFeedback('Please select a date.'); return; }

  const txns = getTransactions();
  txns.unshift({
    id: Date.now(),
    date,
    productName,
    size,
    color,
    type,
    quantity,
    amount,
    notes: notes || '—',
  });

  saveTransactions(txns);
  syncSalesData();
  loadSummary();
  populateDropdowns();

  // Clear form
  document.getElementById('txnProduct').value = '';
  document.getElementById('txnSize').value    = '';
  document.getElementById('txnColor').value   = '';
  document.getElementById('txnType').value    = '';
  document.getElementById('txnQty').value     = '';
  document.getElementById('txnAmount').value  = '';
  document.getElementById('txnNotes').value   = '';
  setDefaultDate();

  showFeedback(`Transaction added: ${type} — ${productName} (${size}, ${color}) × ${quantity}.`, true);

  applyFilters();
});

// ── CLEAR form ──
document.getElementById('clearTxnBtn').addEventListener('click', () => {
  document.getElementById('txnProduct').value = '';
  document.getElementById('txnSize').value    = '';
  document.getElementById('txnColor').value   = '';
  document.getElementById('txnType').value    = '';
  document.getElementById('txnQty').value     = '';
  document.getElementById('txnAmount').value  = '';
  document.getElementById('txnNotes').value   = '';
  feedbackMsg.textContent = '';
  setDefaultDate();
});

// ── FILTER ──
function applyFilters() {
  const product = document.getElementById('filterProduct').value;
  const type    = document.getElementById('filterType').value;
  const from    = document.getElementById('filterFrom').value;
  const to      = document.getElementById('filterTo').value;
  const search  = document.getElementById('filterSearch').value.trim().toLowerCase();

  let txns = getTransactions();

  if (product) txns = txns.filter(t => t.productName === product);
  if (type)    txns = txns.filter(t => t.type === type);
  if (from)    txns = txns.filter(t => t.date >= from);
  if (to)      txns = txns.filter(t => t.date <= to);
  if (search)  txns = txns.filter(t =>
    t.productName.toLowerCase().includes(search) ||
    t.color.toLowerCase().includes(search) ||
    (t.notes && t.notes.toLowerCase().includes(search))
  );

  filteredData = txns;
  currentPage  = 1;
  renderTable();
  renderPagination();
}

document.getElementById('applyFilterBtn').addEventListener('click', applyFilters);
document.getElementById('filterSearch').addEventListener('input', applyFilters);

document.getElementById('resetFilterBtn').addEventListener('click', () => {
  document.getElementById('filterProduct').value = '';
  document.getElementById('filterType').value    = '';
  document.getElementById('filterFrom').value    = '';
  document.getElementById('filterTo').value      = '';
  document.getElementById('filterSearch').value  = '';
  applyFilters();
});

// ── RENDER TABLE ──
function renderTable() {
  const tbody = document.getElementById('historyTableBody');
  tbody.innerHTML = '';

  if (filteredData.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="10">No transactions found.</td></tr>`;
    return;
  }

  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = filteredData.slice(start, start + PAGE_SIZE);

  slice.forEach((t, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${start + i + 1}</td>
      <td>${formatDate(t.date)}</td>
      <td>${t.productName}</td>
      <td>${t.size}</td>
      <td>${t.color}</td>
      <td>${typeBadge(t.type)}</td>
      <td>${(parseInt(t.quantity) || 0).toLocaleString()}</td>
      <td>${formatAmount(t.amount)}</td>
      <td style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;" title="${t.notes}">${t.notes}</td>
      <td><button class="tbl-delete-btn" data-id="${t.id}">DELETE</button></td>
    `;
    tbody.appendChild(tr);
  });

  tbody.querySelectorAll('.tbl-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id  = parseInt(btn.dataset.id);
      let txns  = getTransactions();
      const rem = txns.find(t => t.id === id);
      txns      = txns.filter(t => t.id !== id);
      saveTransactions(txns);
      syncSalesData();
      loadSummary();
      populateDropdowns();
      showFeedback(rem ? `Transaction deleted: ${rem.type} — ${rem.productName}.` : 'Deleted.', true);
      applyFilters();
    });
  });
}

// ── PAGINATION ──
function renderPagination() {
  const row        = document.getElementById('paginationRow');
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  if (totalPages <= 1) { row.innerHTML = ''; return; }

  let html = `<button class="page-btn" id="prevBtn" ${currentPage === 1 ? 'disabled' : ''}>&#8592; PREV</button>`;

  for (let p = 1; p <= totalPages; p++) {
    html += `<button class="page-btn ${p === currentPage ? 'active' : ''}" data-page="${p}">${p}</button>`;
  }

  html += `
    <button class="page-btn" id="nextBtn" ${currentPage === totalPages ? 'disabled' : ''}>NEXT &#8594;</button>
    <span class="page-info">Page ${currentPage} of ${totalPages} &nbsp;(${filteredData.length} records)</span>
  `;

  row.innerHTML = html;

  row.querySelector('#prevBtn')?.addEventListener('click', () => {
    if (currentPage > 1) { currentPage--; renderTable(); renderPagination(); }
  });
  row.querySelector('#nextBtn')?.addEventListener('click', () => {
    if (currentPage < totalPages) { currentPage++; renderTable(); renderPagination(); }
  });
  row.querySelectorAll('.page-btn[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      currentPage = parseInt(btn.dataset.page);
      renderTable(); renderPagination();
    });
  });
}

// ── EXPORT CSV ──
document.getElementById('exportCsvBtn').addEventListener('click', () => {
  if (filteredData.length === 0) { alert('No data to export.'); return; }

  const headers = ['#', 'Date', 'Product Name', 'Size', 'Color', 'Type', 'Quantity', 'Amount (PHP)', 'Notes'];
  const rows = filteredData.map((t, i) => [
    i + 1,
    t.date,
    `"${t.productName}"`,
    `"${t.size}"`,
    `"${t.color}"`,
    t.type,
    parseInt(t.quantity) || 0,
    parseFloat(t.amount) || 0,
    `"${t.notes}"`,
  ].join(','));

  const csv  = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href     = url;
  link.download = `FHILAR_Transactions_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
});

// ── INIT ──
function init() {
  setDefaultDate();
  populateDropdowns();
  loadSummary();
  filteredData = getTransactions();
  renderTable();
  renderPagination();
}

init();
window.addEventListener('focus', populateDropdowns);