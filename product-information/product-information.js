// ── FHILAR Product Information Logic ──

// ── Sidebar Navigation ──
// Dynamically resolve paths so navigation works via file://, Live Server, etc.
const navBtns = document.querySelectorAll('.nav-btn');

// Walk up from /product-information/product-information.html → root FHILAR folder
const _path    = window.location.pathname;
const _rootIdx = _path.lastIndexOf('/product-information/');
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

// ── Helpers ──
const feedbackMsg        = document.getElementById('feedbackMsg');
const productsTableWrap  = document.getElementById('productsTableWrap');
const productsTableBody  = document.getElementById('productsTableBody');

function getProductInfos() {
  return JSON.parse(localStorage.getItem('fhilar_product_infos') || '[]');
}

function saveProductInfos(infos) {
  localStorage.setItem('fhilar_product_infos', JSON.stringify(infos));
}

function showFeedback(msg, isSuccess = false) {
  feedbackMsg.textContent = msg;
  feedbackMsg.className   = 'feedback-msg' + (isSuccess ? ' success' : '');
  setTimeout(() => {
    feedbackMsg.textContent = '';
    feedbackMsg.className   = 'feedback-msg';
  }, 3000);
}

// ── VIEW PRODUCTS toggle ──
document.getElementById('viewBtn').addEventListener('click', () => {
  const productName = document.getElementById('productNameInput').value.trim();
  const size        = document.getElementById('sizeInput').value.trim();
  const color       = document.getElementById('colorInput').value.trim();

  if (productName || size || color) {
    if (!productName) { showFeedback('Please enter a product name.'); return; }

    const infos = getProductInfos();
    infos.push({
      id:          Date.now(),
      productName,
      size:        size  || '—',
      color:       color || '—',
    });
    saveProductInfos(infos);

    document.getElementById('productNameInput').value = '';
    document.getElementById('sizeInput').value        = '';
    document.getElementById('colorInput').value       = '';

    showFeedback(`"${productName}" saved successfully.`, true);
  }

  if (productsTableWrap.style.display === 'none') {
    productsTableWrap.style.display = 'block';
    renderTable();
  } else {
    productsTableWrap.style.display = 'none';
  }
});

// ── Render Table ──
function renderTable() {
  const infos = getProductInfos();
  productsTableBody.innerHTML = '';

  if (infos.length === 0) {
    productsTableBody.innerHTML =
      `<tr><td colspan="5" style="text-align:center;color:#c08090;padding:20px;">No product information found.</td></tr>`;
    return;
  }

  infos.forEach((item, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${item.productName}</td>
      <td>${item.size}</td>
      <td>${item.color}</td>
      <td><button class="tbl-delete-btn" data-id="${item.id}">DELETE</button></td>
    `;
    productsTableBody.appendChild(tr);
  });

  productsTableBody.querySelectorAll('.tbl-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id      = parseInt(btn.dataset.id);
      let infos     = getProductInfos();
      const removed = infos.find(p => p.id === id);
      infos         = infos.filter(p => p.id !== id);
      saveProductInfos(infos);
      showFeedback(removed ? `"${removed.productName}" deleted.` : 'Deleted.', true);
      renderTable();
    });
  });
}

// ── Enter key support ──
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    document.getElementById('viewBtn').click();
  }
});