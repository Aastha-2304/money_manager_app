// js/ExportManager.js — CSV export utility

export class ExportManager {
  /**
   * Downloads all transactions as a CSV file.
   * @param {import('./TransactionStore.js').TransactionStore} store
   */
  static exportCSV(store) {
    try {
      const transactions = store.getAll();
      if (transactions.length === 0) {
        throw new Error('No transactions to export.');
      }

      const headers = ['ID','Date','Category','Sub-Category','Description','Amount'];
      const rows = transactions.map(t => [
        t.id,
        t.date,
        t.category,
        t.subcategory,
        `"${t.description.replace(/"/g, '""')}"`,
        t.amount.toFixed(2)
      ]);

      const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href     = url;
      a.download = `flowfunds_${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      throw err;
    }
  }
}
