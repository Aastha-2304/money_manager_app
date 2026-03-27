// js/ChartManager.js — Manages Chart.js pie and bar charts

export class ChartManager {
  constructor(pieCanvasId, barCanvasId) {
    this._pieCtx = document.getElementById(pieCanvasId)?.getContext('2d');
    this._barCtx = document.getElementById(barCanvasId)?.getContext('2d');
    this._pieChart = null;
    this._barChart = null;

    this._PALETTE = [
      '#c9a84c','#3ecf8e','#f26b6b','#5b8dee',
      '#e88c3e','#a78bfa','#38bdf8','#fb7185',
      '#34d399','#fbbf24'
    ];
  }

  /** Renders / updates both charts with the latest store data */
  update(store) {
    try {
      this._renderPie(store);
      this._renderBar(store);
    } catch (err) {
      console.error('ChartManager: render error', err);
    }
  }

  _renderPie(store) {
    if (!this._pieCtx) return;

    const expenseTotals = store.subcategoryTotals('Expense');
    const labels  = Object.keys(expenseTotals);
    const data    = Object.values(expenseTotals);

    if (this._pieChart) this._pieChart.destroy();

    if (labels.length === 0) {
      // Nothing to show
      this._pieChart = null;
      return;
    }

    this._pieChart = new Chart(this._pieCtx, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: this._PALETTE.slice(0, labels.length),
          borderColor: '#16181f',
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: '#7b7f90',
              font: { family: 'DM Sans', size: 12 },
              boxWidth: 12, padding: 14
            }
          },
          tooltip: {
            callbacks: {
              label: ctx => ` ₹${ctx.parsed.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            }
          }
        }
      }
    });
  }

  _renderBar(store) {
    if (!this._barCtx) return;

    const income   = store.totalIncome();
    const expenses = store.totalExpenses();

    if (this._barChart) this._barChart.destroy();

    this._barChart = new Chart(this._barCtx, {
      type: 'bar',
      data: {
        labels: ['Income', 'Expenses'],
        datasets: [{
          data: [income, expenses],
          backgroundColor: ['rgba(62,207,142,0.75)', 'rgba(242,107,107,0.75)'],
          borderColor:     ['#3ecf8e', '#f26b6b'],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: ctx => ` ₹${ctx.parsed.y.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`
            }
          }
        },
        scales: {
          x: {
            ticks: { color: '#7b7f90', font: { family: 'DM Sans', size: 12 } },
            grid:  { color: '#2a2d38' }
          },
          y: {
            ticks: {
              color: '#7b7f90',
              font: { family: 'DM Sans', size: 11 },
              callback: v => `₹${v.toLocaleString('en-IN')}`
            },
            grid: { color: '#2a2d38' },
            beginAtZero: true
          }
        }
      }
    });
  }
}
