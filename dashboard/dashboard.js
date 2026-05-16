// ── FHILAR Dashboard Logic ──

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

    if (page !== 'dashboard' && pageMap[page]) {
      window.location.href = pageMap[page];
    }
  });
});

// ── Load Dashboard Stats from localStorage ──
function loadDashboard() {
  const products = JSON.parse(localStorage.getItem('fhilar_products') || '[]');
  const stocks   = JSON.parse(localStorage.getItem('fhilar_stocks')   || '[]');
  const sales    = JSON.parse(localStorage.getItem('fhilar_sales')    || '[]');

  // Total Products
  document.getElementById('totalProductsValue').textContent = products.length;

  // Total Stocks
  const totalStock = stocks.reduce((sum, s) => sum + (parseInt(s.quantity) || 0), 0);
  document.getElementById('totalStocksValue').textContent = totalStock.toLocaleString();

  // Total Sales
  const totalSales = sales.reduce((sum, s) => sum + (parseFloat(s.amount) || 0), 0);
  document.getElementById('totalSalesValue').textContent =
    '₱ ' + totalSales.toLocaleString('en-PH', { minimumFractionDigits: 2 });

  // Low Stocks (quantity <= 5)
  const lowStocksBody = document.getElementById('lowStocksBody');
  const lowItems = stocks.filter(s => (parseInt(s.quantity) || 0) <= 5);
  if (lowItems.length > 0) {
    lowStocksBody.innerHTML = lowItems.map(s =>
      `<div class="card-list-item">
        <span class="item-name">${s.name || 'Unknown'}</span>
        <span class="item-qty">${s.quantity} left</span>
      </div>`
    ).join('');
  } else {
    lowStocksBody.innerHTML = '<p class="card-empty">No low stock items.</p>';
  }

  // Top Selling Items (top 5 by sold count)
  const topSellingBody = document.getElementById('topSellingBody');
  const sorted = [...sales].sort((a, b) => (parseInt(b.sold) || 0) - (parseInt(a.sold) || 0)).slice(0, 5);
  if (sorted.length > 0) {
    topSellingBody.innerHTML = sorted.map(s =>
      `<div class="card-list-item">
        <span class="item-name">${s.name || 'Unknown'}</span>
        <span class="item-qty">${s.sold} sold</span>
      </div>`
    ).join('');
  } else {
    topSellingBody.innerHTML = '<p class="card-empty">No sales data yet.</p>';
  }
}

loadDashboard();