// js/Validator.js — Form validation logic

export class Validator {
  /**
   * Validates the transaction form fields.
   * @param {Object} fields
   * @returns {{ valid: boolean, errors: Object }}
   */
  static validate({ amount, date, category, subcategory, description }) {
    const errors = {};

    // Amount: must be numeric, non-empty, > 0
    const amt = parseFloat(amount);
    if (amount === '' || amount === null || amount === undefined) {
      errors.amount = 'Amount is required.';
    } else if (isNaN(amt) || amt <= 0) {
      errors.amount = 'Amount must be a positive number.';
    }

    // Date: must be valid and not in the future
    if (!date) {
      errors.date = 'Date is required.';
    } else {
      const d = new Date(date);
      const today = new Date();
      today.setHours(23, 59, 59, 999);
      if (isNaN(d.getTime())) {
        errors.date = 'Enter a valid date.';
      } else if (d > today) {
        errors.date = 'Date cannot be in the future.';
      }
    }

    // Category: must be selected
    if (!category) {
      errors.category = 'Please select Income or Expense.';
    }

    // Sub-category: must be selected
    if (!subcategory) {
      errors.subcategory = 'Please select a sub-category.';
    }

    // Description: optional, max 100 chars
    if (description && description.length > 100) {
      errors.description = 'Description must be 100 characters or less.';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }
}
