// js/Transaction.js — OOP Model for a single transaction

export class Transaction {
  /**
   * @param {Object} data
   * @param {string} [data.id]
   * @param {number} data.amount
   * @param {string} data.date        – YYYY-MM-DD
   * @param {string} data.category    – 'Income' | 'Expense'
   * @param {string} data.subcategory
   * @param {string} [data.description]
   */
  constructor({ id, amount, date, category, subcategory, description = '' }) {
    this.id          = id ?? crypto.randomUUID();
    this.amount      = parseFloat(amount);
    this.date        = date;
    this.category    = category;
    this.subcategory = subcategory;
    this.description = description.trim().slice(0, 100);
    this.createdAt   = Date.now();
  }

  /** Returns amount as a formatted currency string */
  formattedAmount() {
    return `₹${this.amount.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  }

  /** Returns the date in DD MMM YYYY format */
  formattedDate() {
    const [y, m, d] = this.date.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun',
                    'Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d} ${months[parseInt(m) - 1]} ${y}`;
  }

  /** Plain object for JSON serialization */
  toJSON() {
    return {
      id:          this.id,
      amount:      this.amount,
      date:        this.date,
      category:    this.category,
      subcategory: this.subcategory,
      description: this.description,
      createdAt:   this.createdAt
    };
  }

  /** Reconstruct a Transaction from a plain JSON object */
  static fromJSON(obj) {
    const t = new Transaction(obj);
    t.createdAt = obj.createdAt ?? Date.now();
    return t;
  }
}
