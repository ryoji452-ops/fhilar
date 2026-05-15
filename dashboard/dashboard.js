// ── FHILAR Dashboard Logic ──

// ── Smart Logo Crop: detect FHILAR text row via canvas pixel scan ──
(function autoLogoCrop() {
  const IMG_SRC = '../assets/images/fhilar.jpg';
  const CROP_W  = 210;
  const CROP_H  = 88;

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = function () {
    try {
      // Draw image onto offscreen canvas
      const canvas = document.createElement('canvas');
      canvas.width  = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
      const W = canvas.width, H = canvas.height;

      // Find the row with the most dark-pink/red pixels (the FHILAR text)
      // Target: R > 140, G < 80, B < 100  (deep pink / crimson range)
      let bestRow = 0, bestCount = 0;
      for (let y = 0; y < H; y++) {
        let count = 0;
        for (let x = 0; x < W; x++) {
          const i = (y * W + x) * 4;
          const r = data[i], g = data[i+1], b = data[i+2];
          if (r > 130 && g < 90 && b < 110) count++;
        }
        if (count > bestCount) { bestCount = count; bestRow = y; }
      }

      // Center the crop strip around bestRow, scaled to CROP_W width
      const scale      = CROP_W / W;
      const scaledH    = H * scale;
      const textY      = bestRow * scale;
      // Place text row at 55% height of the crop box
      const bgOffsetY  = Math.round((CROP_H * 0.55) - textY);
      const clampedY   = Math.min(0, Math.max(bgOffsetY, CROP_H - scaledH));

      const logoCrop = document.getElementById('logoCrop');
      if (logoCrop) {
        logoCrop.style.backgroundSize     = `${CROP_W}px auto`;
        logoCrop.style.backgroundPosition = `center ${clampedY}px`;
      }
    } catch (e) {
      // CORS or tainted canvas — fall back to CSS default (top)
    }
  };
  img.onerror = function () { /* image not found — leave CSS default */ };
  img.src = IMG_SRC;
})();

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