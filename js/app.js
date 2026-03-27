// js/app.js — Main application controller (ES6 Module)
// Wires together: TransactionStore, Validator, ChartManager, ExportManager

import { TransactionStore } from './TransactionStore.js';
import { Validator }        from './Validator.js';
import { ChartManager }     from './ChartManager.js';
import { ExportManager }    from './ExportManager.js';

// ── Sub-category data ───────────────────────────────────────────────────
const SUBCATEGORIES = {
  Income:  ['Salary', 'Allowances', 'Bonus', 'Petty Cash', 'Freelance', 'Investment', 'Other'],
  Expense: ['Rent', 'Food', 'Shopping', 'Entertainment', 'Transport',
            'Healthcare', 'Education', 'Utilities', 'Travel', 'Other']
};


const store   = new TransactionStore();
const charts  = new ChartManager('pieChart', 'barChart');

// ── DOM refs ────────────────────────────────────────────────────────────
const modalOverlay   = document.getElementById('modalOverlay');
const confirmOverlay = document.getElementById('confirmOverlay');
const txForm         = document.getElementById('txForm');
const modalTitle     = document.getElementById('modalTitle');

// Summary
const totalIncomeEl  = document.getElementById('totalIncome');
const totalExpenseEl = document.getElementById('totalExpenses');
const netBalanceEl   = document.getElementById('netBalance');
const balanceCard    = netBalanceEl?.closest('.summary-card');

// Table
const txBody     = document.getElementById('txBody');
const emptyState = document.getElementById('emptyState');
const txCount    = document.getElementById('txCount');

// Form fields
const editIdField   = document.getElementById('editId');
const amountField   = document.getElementById('amount');
const dateField     = document.getElementById('date');
const catIncomeRad  = document.getElementById('catIncome');
const catExpenseRad = document.getElementById('catExpense');
const subcatField   = document.getElementById('subcategory');
const descField     = document.getElementById('description');
const charCount     = document.getElementById('charCount');

// Filters
const filterCategory   = document.getElementById('filterCategory');
const filterSubcategory= document.getElementById('filterSubcategory');
const filterFrom       = document.getElementById('filterFrom');
const filterTo         = document.getElementById('filterTo');
const sortBy           = document.getElementById('sortBy');

// ── Toast ───────────────────────────────────────────────────────────────
let toastEl = null;
function showToast(msg, isError = false) {
  if (!toastEl) {
    toastEl = document.createElement('div');
    toastEl.className = 'toast';
    document.body.appendChild(toastEl);
  }
  toastEl.textContent = msg;
  toastEl.className = `toast${isError ? ' error' : ''}`;
  requestAnimationFrame(() => toastEl.classList.add('show'));
  clearTimeout(toastEl._timer);
  toastEl._timer = setTimeout(() => toastEl.classList.remove('show'), 3000);
}

// ── Modal helpers ────────────────────────────────────────────────────────
function openModal(editId = null) {
  clearFormErrors();
  txForm.reset();
  charCount.textContent = '0 / 100';
  populateSubcategories('');

  if (editId) {
    const tx = store.getById(editId);
    if (!tx) return;
    modalTitle.textContent = 'Edit Transaction';
    editIdField.value = tx.id;
    amountField.value = tx.amount;
    dateField.value   = tx.date;
    (tx.category === 'Income' ? catIncomeRad : catExpenseRad).checked = true;
    populateSubcategories(tx.category);
    subcatField.value = tx.subcategory;
    descField.value   = tx.description;
    charCount.textContent = `${tx.description.length} / 100`;
  } else {
    modalTitle.textContent = 'New Transaction';
    editIdField.value = '';
    dateField.value = todayISO();
  }

  modalOverlay.classList.add('open');
  amountField.focus();
}

function closeModal() { modalOverlay.classList.remove('open'); }

// ── Confirm dialog ──────────────────────────────────────────────────────
let _pendingDeleteId = null;
function openConfirm(id) {
  _pendingDeleteId = id;
  confirmOverlay.classList.add('open');
}
function closeConfirm() {
  _pendingDeleteId = null;
  confirmOverlay.classList.remove('open');
}

// ── Date utility ────────────────────────────────────────────────────────
function todayISO() {
  return new Date().toISOString().split('T')[0];
}

// ── Subcategory dropdown ─────────────────────────────────────────────────
function populateSubcategories(category) {
  const opts = SUBCATEGORIES[category] ?? [];
  subcatField.innerHTML = '<option value="">— Select —</option>' +
    opts.map(o => `<option value="${o}">${o}</option>`).join('');
}

function populateFilterSubcategories(category) {
  const opts = category ? (SUBCATEGORIES[category] ?? []) :
    [...new Set([...SUBCATEGORIES.Income, ...SUBCATEGORIES.Expense])].sort();
  filterSubcategory.innerHTML = '<option value="">All</option>' +
    opts.map(o => `<option value="${o}">${o}</option>`).join('');
}

// ── Form error helpers ───────────────────────────────────────────────────
function clearFormErrors() {
  ['amount','date','category','subcategory','description'].forEach(f => {
    const errEl = document.getElementById(`${f}Error`);
    if (errEl) errEl.textContent = '';
  });
  [amountField, dateField, subcatField, descField].forEach(el => {
    el?.classList.remove('invalid');
  });
}

function showFormErrors(errors) {
  if (errors.amount)      { document.getElementById('amountError').textContent = errors.amount;      amountField.classList.add('invalid'); }
  if (errors.date)        { document.getElementById('dateError').textContent = errors.date;          dateField.classList.add('invalid'); }
  if (errors.category)    { document.getElementById('categoryError').textContent = errors.category; }
  if (errors.subcategory) { document.getElementById('subcategoryError').textContent = errors.subcategory; subcatField.classList.add('invalid'); }
  if (errors.description) { document.getElementById('descriptionError').textContent = errors.description; descField.classList.add('invalid'); }
}

// ── Render summary ───────────────────────────────────────────────────────
function renderSummary() {
  const fmt = n => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  totalIncomeEl.textContent  = fmt(store.totalIncome());
  totalExpenseEl.textContent = fmt(store.totalExpenses());
  const bal = store.netBalance();
  netBalanceEl.textContent   = fmt(Math.abs(bal));
  if (bal < 0) {
    balanceCard?.classList.add('negative');
    netBalanceEl.textContent = `-${fmt(Math.abs(bal))}`;
  } else {
    balanceCard?.classList.remove('negative');
    netBalanceEl.textContent = fmt(bal);
  }
}

// ── Render table ─────────────────────────────────────────────────────────
function renderTable() {
  const filters = {
    category:    filterCategory.value,
    subcategory: filterSubcategory.value,
    from:        filterFrom.value,
    to:          filterTo.value,
    sort:        sortBy.value
  };

  try {
    const list = store.getFiltered(filters);
    txCount.textContent = `${list.length} transaction${list.length !== 1 ? 's' : ''}`;

    if (list.length === 0) {
      txBody.innerHTML = '';
      emptyState.classList.add('visible');
      return;
    }
    emptyState.classList.remove('visible');

    txBody.innerHTML = list.map(t => {
      const isIncome = t.category === 'Income';
      return `
        <tr>
          <td>${t.formattedDate()}</td>
          <td><span class="badge ${isIncome ? 'badge-income' : 'badge-expense'}">${t.category}</span></td>
          <td>${t.subcategory}</td>
          <td>${t.description || '<span style="color:var(--text-muted)">—</span>'}</td>
          <td class="${isIncome ? 'amount-income' : 'amount-expense'}">${isIncome ? '+' : '-'}${t.formattedAmount()}</td>
          <td>
            <button class="action-btn" onclick="window._editTx('${t.id}')">Edit</button>
            <button class="action-btn del" onclick="window._deleteTx('${t.id}')">Delete</button>
          </td>
        </tr>`;
    }).join('');
  } catch (err) {
    console.error('renderTable error:', err);
  }
}

// ── Full UI refresh ──────────────────────────────────────────────────────
function refreshUI() {
  renderSummary();
  renderTable();
  charts.update(store);
}

// ── Global button handlers (used in table HTML) ──────────────────────────
window._editTx   = id => openModal(id);
window._deleteTx = id => openConfirm(id);

// ── Event: Open / Close modal ────────────────────────────────────────────
document.getElementById('openModalBtn').addEventListener('click', () => openModal());
document.getElementById('closeModalBtn').addEventListener('click', closeModal);
document.getElementById('cancelBtn').addEventListener('click', closeModal);
modalOverlay.addEventListener('click', e => { if (e.target === modalOverlay) closeModal(); });

// ── Event: Category radio → update subcategories ─────────────────────────
document.querySelectorAll('input[name="category"]').forEach(r => {
  r.addEventListener('change', () => {
    populateSubcategories(r.value);
    document.getElementById('categoryError').textContent = '';
  });
});

// ── Event: Description char counter ─────────────────────────────────────
descField.addEventListener('input', () => {
  charCount.textContent = `${descField.value.length} / 100`;
});

// ── Event: Form submit ───────────────────────────────────────────────────
txForm.addEventListener('submit', e => {
  e.preventDefault();
  clearFormErrors();

  const category = document.querySelector('input[name="category"]:checked')?.value ?? '';
  const data = {
    amount:      amountField.value,
    date:        dateField.value,
    category,
    subcategory: subcatField.value,
    description: descField.value
  };

  const { valid, errors } = Validator.validate(data);
  if (!valid) { showFormErrors(errors); return; }

  try {
    const id = editIdField.value;
    if (id) {
      store.update(id, data);
      showToast('Transaction updated ✓');
    } else {
      store.add(data);
      showToast('Transaction added ✓');
    }
    closeModal();
    refreshUI();
  } catch (err) {
    console.error('Form submit error:', err);
    showToast('Something went wrong. Please try again.', true);
  }
});

// ── Event: Confirm delete ────────────────────────────────────────────────
document.getElementById('confirmYes').addEventListener('click', () => {
  try {
    if (_pendingDeleteId) {
      store.delete(_pendingDeleteId);
      showToast('Transaction deleted.');
      refreshUI();
    }
  } catch (err) {
    showToast('Delete failed.', true);
  } finally {
    closeConfirm();
  }
});
document.getElementById('confirmNo').addEventListener('click', closeConfirm);
confirmOverlay.addEventListener('click', e => { if (e.target === confirmOverlay) closeConfirm(); });

// ── Event: Filters ───────────────────────────────────────────────────────
[filterCategory, filterSubcategory, filterFrom, filterTo, sortBy].forEach(el => {
  el.addEventListener('change', renderTable);
});
filterCategory.addEventListener('change', () => {
  populateFilterSubcategories(filterCategory.value);
  renderTable();
});
document.getElementById('clearFiltersBtn').addEventListener('click', () => {
  filterCategory.value    = '';
  filterSubcategory.value = '';
  filterFrom.value        = '';
  filterTo.value          = '';
  sortBy.value            = 'date-desc';
  populateFilterSubcategories('');
  renderTable();
});

// ── Event: Export CSV ────────────────────────────────────────────────────
document.getElementById('exportCsvBtn').addEventListener('click', () => {
  try {
    ExportManager.exportCSV(store);
    showToast('CSV downloaded ✓');
  } catch (err) {
    showToast(err.message || 'Export failed.', true);
  }
});

// ── Init ─────────────────────────────────────────────────────────────────
populateFilterSubcategories('');
refreshUI();
