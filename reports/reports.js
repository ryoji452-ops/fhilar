// ── FHILAR Reports Logic ──

// ── Sidebar Navigation ──
const navBtns = document.querySelectorAll('.nav-btn');

const _path    = window.location.pathname;
const _rootIdx = _path.lastIndexOf('/reports/');
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

// ── Storage ──
function getStocks()   { return JSON.parse(localStorage.getItem('fhilar_stocks')   || '[]'); }
function getProducts() { return JSON.parse(localStorage.getItem('fhilar_products') || '[]'); }
function getSizes()    { return JSON.parse(localStorage.getItem('fhilar_sizes')    || '[]'); }

// ── Pagination state ──
const PAGE_SIZE = 10;
let currentPage = 1;
let filteredData = [];

// ── Summary Cards ──
function loadSummary() {
  const stocks   = getStocks();
  const products = getProducts();

  const totalUnits = stocks.reduce((sum, s) => sum + (parseInt(s.quantity) || 0), 0);
  const lowCount   = stocks.filter(s => (parseInt(s.quantity) || 0) <= 5).length;

  document.getElementById('sumProducts').textContent = products.length.toLocaleString();
  document.getElementById('sumStocks').textContent   = totalUnits.toLocaleString();
  document.getElementById('sumLow').textContent      = lowCount.toLocaleString();
}

// ── Populate filter dropdowns ──
function populateFilters() {
  const stocks   = getStocks();
  const filterProduct = document.getElementById('filterProduct');
  const filterSize    = document.getElementById('filterSize');

  // Unique product names from stock records
  const productNames = [...new Set(stocks.map(s => s.productName))].sort();
  filterProduct.innerHTML = '<option value="">All Products</option>';
  productNames.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    filterProduct.appendChild(opt);
  });

  // Unique sizes from stock records
  const sizeNames = [...new Set(stocks.map(s => s.size))].sort();
  filterSize.innerHTML = '<option value="">All Sizes</option>';
  sizeNames.forEach(name => {
    const opt = document.createElement('option');
    opt.value = name;
    opt.textContent = name;
    filterSize.appendChild(opt);
  });
}

// ── Apply Filters ──
function applyFilters() {
  const product = document.getElementById('filterProduct').value.toLowerCase();
  const size    = document.getElementById('filterSize').value.toLowerCase();
  const status  = document.getElementById('filterStatus').value;
  const search  = document.getElementById('filterSearch').value.trim().toLowerCase();

  let stocks = getStocks();

  if (product) stocks = stocks.filter(s => s.productName.toLowerCase() === product);
  if (size)    stocks = stocks.filter(s => s.size.toLowerCase() === size);
  if (status === 'low') stocks = stocks.filter(s => (parseInt(s.quantity) || 0) <= 5);
  if (status === 'ok')  stocks = stocks.filter(s => (parseInt(s.quantity) || 0) > 5);
  if (search)  stocks = stocks.filter(s =>
    s.productName.toLowerCase().includes(search) ||
    s.size.toLowerCase().includes(search) ||
    s.color.toLowerCase().includes(search)
  );

  filteredData = stocks;
  currentPage  = 1;
  renderTable();
  renderPagination();
}

// ── Reset Filters ──
document.getElementById('resetFilterBtn').addEventListener('click', () => {
  document.getElementById('filterProduct').value = '';
  document.getElementById('filterSize').value    = '';
  document.getElementById('filterStatus').value  = '';
  document.getElementById('filterSearch').value  = '';
  applyFilters();
});

document.getElementById('applyFilterBtn').addEventListener('click', applyFilters);

// Live search on keyup
document.getElementById('filterSearch').addEventListener('input', applyFilters);

// ── Render Table ──
function renderTable() {
  const tbody = document.getElementById('reportTableBody');
  tbody.innerHTML = '';

  if (filteredData.length === 0) {
    tbody.innerHTML = `<tr class="empty-row"><td colspan="6">No stock records match your filters.</td></tr>`;
    return;
  }

  const start = (currentPage - 1) * PAGE_SIZE;
  const slice = filteredData.slice(start, start + PAGE_SIZE);

  slice.forEach((s, i) => {
    const qty    = parseInt(s.quantity) || 0;
    const isLow  = qty <= 5;
    const badge  = isLow
      ? `<span class="badge-low">LOW</span>`
      : `<span class="badge-ok">OK</span>`;

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${start + i + 1}</td>
      <td>${s.productName}</td>
      <td>${s.size}</td>
      <td>${s.color}</td>
      <td>${qty.toLocaleString()}</td>
      <td>${badge}</td>
    `;
    tbody.appendChild(tr);
  });
}

// ── Pagination ──
function renderPagination() {
  const row        = document.getElementById('paginationRow');
  const totalPages = Math.ceil(filteredData.length / PAGE_SIZE);

  if (totalPages <= 1) { row.innerHTML = ''; return; }

  let html = `
    <button class="page-btn" id="prevBtn" ${currentPage === 1 ? 'disabled' : ''}>&#8592; PREV</button>
  `;

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
      renderTable();
      renderPagination();
    });
  });
}

// ── Export CSV ──
document.getElementById('exportCsvBtn').addEventListener('click', () => {
  if (filteredData.length === 0) { alert('No data to export.'); return; }

  const headers = ['#', 'Product Name', 'Size', 'Color', 'Quantity', 'Status'];
  const rows = filteredData.map((s, i) => {
    const qty   = parseInt(s.quantity) || 0;
    const status = qty <= 5 ? 'LOW' : 'OK';
    return [i + 1, `"${s.productName}"`, `"${s.size}"`, `"${s.color}"`, qty, status].join(',');
  });

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob       = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url        = URL.createObjectURL(blob);
  const link       = document.createElement('a');

  link.href     = url;
  link.download = `FHILAR_Stock_Report_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
});

// ── Init ──
function init() {
  loadSummary();
  populateFilters();
  filteredData = getStocks();
  renderTable();
  renderPagination();
}

init();