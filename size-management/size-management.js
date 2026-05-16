// ── FHILAR Size Management Logic ──

// ── Sidebar Navigation ──
const navBtns = document.querySelectorAll('.nav-btn');

// Resolve root path dynamically (works with file://, Live Server, etc.)
const _path    = window.location.pathname;
const _rootIdx = _path.lastIndexOf('/size-management/');
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
const feedbackMsg    = document.getElementById('feedbackMsg');
const sizesTableWrap = document.getElementById('sizesTableWrap');
const sizesTableBody = document.getElementById('sizesTableBody');

function getSizes() {
  return JSON.parse(localStorage.getItem('fhilar_sizes') || '[]');
}

function saveSizes(sizes) {
  localStorage.setItem('fhilar_sizes', JSON.stringify(sizes));
}

function showFeedback(msg, isSuccess = false) {
  feedbackMsg.textContent = msg;
  feedbackMsg.className   = 'feedback-msg' + (isSuccess ? ' success' : '');
  setTimeout(() => {
    feedbackMsg.textContent = '';
    feedbackMsg.className   = 'feedback-msg';
  }, 3000);
}

// ── ADD ──
document.getElementById('addBtn').addEventListener('click', () => {
  const input = document.getElementById('addInput');
  const name  = input.value.trim();

  if (!name) { showFeedback('Please enter a size.'); return; }

  const sizes  = getSizes();
  const exists = sizes.find(s => s.name.toLowerCase() === name.toLowerCase());
  if (exists) { showFeedback('Size already exists.'); return; }

  sizes.push({ id: Date.now(), name });
  saveSizes(sizes);
  input.value = '';
  showFeedback(`"${name}" added successfully.`, true);

  if (sizesTableWrap.style.display !== 'none') renderTable();
});

// ── EDIT ──
document.getElementById('editBtn').addEventListener('click', () => {
  const input = document.getElementById('editInput');
  const value = input.value.trim();

  const sep   = value.includes('→') ? '→' : '>';
  const parts = value.split(sep).map(s => s.trim());

  if (parts.length !== 2 || !parts[0] || !parts[1]) {
    showFeedback('Format: OldSize > NewSize');
    return;
  }

  const [oldName, newName] = parts;
  const sizes = getSizes();
  const idx   = sizes.findIndex(s => s.name.toLowerCase() === oldName.toLowerCase());

  if (idx === -1) { showFeedback(`Size "${oldName}" not found.`); return; }

  sizes[idx].name = newName;
  saveSizes(sizes);
  input.value = '';
  showFeedback(`Renamed to "${newName}" successfully.`, true);

  if (sizesTableWrap.style.display !== 'none') renderTable();
});

// ── DELETE ──
document.getElementById('deleteBtn').addEventListener('click', () => {
  const input = document.getElementById('deleteInput');
  const name  = input.value.trim();

  if (!name) { showFeedback('Please enter a size to delete.'); return; }

  const sizes = getSizes();
  const idx   = sizes.findIndex(s => s.name.toLowerCase() === name.toLowerCase());

  if (idx === -1) { showFeedback(`Size "${name}" not found.`); return; }

  sizes.splice(idx, 1);
  saveSizes(sizes);
  input.value = '';
  showFeedback(`"${name}" deleted successfully.`, true);

  if (sizesTableWrap.style.display !== 'none') renderTable();
});

// ── VIEW SIZES ──
document.getElementById('viewBtn').addEventListener('click', () => {
  if (sizesTableWrap.style.display === 'none') {
    sizesTableWrap.style.display = 'block';
    renderTable();
  } else {
    sizesTableWrap.style.display = 'none';
  }
});

// ── Render Table ──
function renderTable() {
  const sizes = getSizes();
  sizesTableBody.innerHTML = '';

  if (sizes.length === 0) {
    sizesTableBody.innerHTML =
      `<tr><td colspan="3" style="text-align:center;color:#c08090;padding:20px;">No sizes found.</td></tr>`;
    return;
  }

  sizes.forEach((s, i) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${i + 1}</td>
      <td>${s.name}</td>
      <td><button class="tbl-delete-btn" data-id="${s.id}">DELETE</button></td>
    `;
    sizesTableBody.appendChild(tr);
  });

  sizesTableBody.querySelectorAll('.tbl-delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id      = parseInt(btn.dataset.id);
      let sizes     = getSizes();
      const removed = sizes.find(s => s.id === id);
      sizes         = sizes.filter(s => s.id !== id);
      saveSizes(sizes);
      showFeedback(removed ? `"${removed.name}" deleted.` : 'Deleted.', true);
      renderTable();
    });
  });
}

// ── Enter key support ──
document.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const active = document.activeElement;
    if (active && active.id === 'addInput')    document.getElementById('addBtn').click();
    if (active && active.id === 'editInput')   document.getElementById('editBtn').click();
    if (active && active.id === 'deleteInput') document.getElementById('deleteBtn').click();
  }
});