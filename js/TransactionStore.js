// js/TransactionStore.js — OOP Data Store with localStorage persistence

import { Transaction } from './Transaction.js';

const STORAGE_KEY = 'flowfunds_transactions';

export class TransactionStore {
  constructor() {
    /** @type {Transaction[]} */
    this._transactions = [];
    this._load();
  }

  // ── Private: Persist to localStorage ──────────────────────────────────
  _save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(
        this._transactions.map(t => t.toJSON())
      ));
    } catch (err) {
      console.error('FlowFunds: failed to save to localStorage', err);
    }
  }

  // ── Private: Load from localStorage ───────────────────────────────────
  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        this._transactions = parsed.map(obj => Transaction.fromJSON(obj));
      }
    } catch (err) {
      console.error('FlowFunds: failed to load from localStorage', err);
      this._transactions = [];
    }
  }

  // ── CRUD ───────────────────────────────────────────────────────────────
  /** Add a new transaction */
  add(data) {
    const tx = new Transaction(data);
    this._transactions.push(tx);
    this._save();
    return tx;
  }

  /** Update an existing transaction by id */
  update(id, data) {
    const idx = this._transactions.findIndex(t => t.id === id);
    if (idx === -1) throw new Error(`Transaction ${id} not found`);
    const updated = new Transaction({ ...data, id });
    updated.createdAt = this._transactions[idx].createdAt;
    this._transactions[idx] = updated;
    this._save();
    return updated;
  }

  /** Delete a transaction by id */
  delete(id) {
    const before = this._transactions.length;
    this._transactions = this._transactions.filter(t => t.id !== id);
    if (this._transactions.length === before) throw new Error(`Transaction ${id} not found`);
    this._save();
  }

  /** Get a single transaction by id */
  getById(id) {
    return this._transactions.find(t => t.id === id) ?? null;
  }

  /** Return all transactions (raw copy) */
  getAll() {
    return [...this._transactions];
  }

  // ── Filtering & Sorting ────────────────────────────────────────────────
  /**
   * @param {Object} filters
   * @param {string} [filters.category]
   * @param {string} [filters.subcategory]
   * @param {string} [filters.from]   – YYYY-MM-DD
   * @param {string} [filters.to]     – YYYY-MM-DD
   * @param {string} [filters.sort]   – 'date-desc'|'date-asc'|'amount-desc'|'amount-asc'
   */
  getFiltered({ category = '', subcategory = '', from = '', to = '', sort = 'date-desc' } = {}) {
    let list = this.getAll();

    if (category)    list = list.filter(t => t.category    === category);
    if (subcategory) list = list.filter(t => t.subcategory === subcategory);
    if (from)        list = list.filter(t => t.date >= from);
    if (to)          list = list.filter(t => t.date <= to);

    list.sort((a, b) => {
      switch (sort) {
        case 'date-asc':    return a.date.localeCompare(b.date);
        case 'amount-desc': return b.amount - a.amount;
        case 'amount-asc':  return a.amount - b.amount;
        default:            return b.date.localeCompare(a.date); // date-desc
      }
    });

    return list;
  }

  // ── Aggregates ─────────────────────────────────────────────────────────
  totalIncome() {
    return this._transactions
      .filter(t => t.category === 'Income')
      .reduce((s, t) => s + t.amount, 0);
  }

  totalExpenses() {
    return this._transactions
      .filter(t => t.category === 'Expense')
      .reduce((s, t) => s + t.amount, 0);
  }

  netBalance() {
    return this.totalIncome() - this.totalExpenses();
  }

  /** Returns { subcategory: totalAmount } for a given category */
  subcategoryTotals(category) {
    const map = {};
    this._transactions
      .filter(t => t.category === category)
      .forEach(t => {
        map[t.subcategory] = (map[t.subcategory] ?? 0) + t.amount;
      });
    return map;
  }
}
