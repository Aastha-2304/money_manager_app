# FlowFunds — Money Manager App

A fully client-side personal finance tracker built with **HTML5, CSS3, and vanilla JavaScript (ES6 Modules)** using Object-Oriented Programming principles.

---

## 🚀 Features

| Feature | Details |
|---|---|
| **CRUD Transactions** | Add, edit, delete income & expense entries |
| **Form Validation** | Amount, date, category, sub-category validated; errors shown inline |
| **LocalStorage Persistence** | Data survives page reloads with JSON serialization |
| **Financial Summary** | Live totals for Income, Expenses, and Net Balance |
| **Filter & Sort** | Filter by category, sub-category, date range; sort by date/amount |
| **Charts** | Doughnut chart (expense distribution) + Bar chart (income vs expenses) via Chart.js |
| **CSV Export** | One-click download of all transactions as a `.csv` file |
| **Responsive Design** | Works on mobile, tablet, and desktop |
| **Toast Notifications** | Feedback messages for all user actions |

---

## 🗂 Project Structure

```
money-manager/
├── index.html            ← Semantic HTML structure
├── .gitignore
├── README.md
├── css/
│   └── style.css         ← All styles (CSS variables, responsive, animations)
└── js/
    ├── Transaction.js    ← OOP model for a transaction
    ├── TransactionStore.js ← Data store with localStorage CRUD
    ├── Validator.js      ← Form validation logic
    ├── ChartManager.js   ← Chart.js integration (pie + bar)
    ├── ExportManager.js  ← CSV export utility
    └── app.js            ← Main controller — wires UI events to store
```

---

## 🧱 OOP Design

### `Transaction` (Model)
Represents a single financial record. Contains:
- Properties: `id`, `amount`, `date`, `category`, `subcategory`, `description`, `createdAt`
- Methods: `formattedAmount()`, `formattedDate()`, `toJSON()`, `static fromJSON()`

### `TransactionStore` (Data Layer)
Manages the array of transactions and localStorage:
- `add(data)` → Creates a new `Transaction` and persists it
- `update(id, data)` → Mutates an existing record
- `delete(id)` → Removes by ID
- `getById(id)`, `getAll()`, `getFiltered(filters)` → Read operations
- `totalIncome()`, `totalExpenses()`, `netBalance()`, `subcategoryTotals()` → Aggregates

### `Validator` (Utility)
Pure static class. `validate(fields)` returns `{ valid, errors }`.

### `ChartManager` (Visualization)
Manages two Chart.js instances (doughnut + bar). Destroys and re-renders on every data change.

### `ExportManager` (Utility)
Static method `exportCSV(store)` serializes all transactions to CSV and triggers a download.

---

## ⚙️ Implementation Details

### Data Persistence
- Transactions are stored as a JSON array in `localStorage` under the key `flowfunds_transactions`.
- On page load, `TransactionStore._load()` parses stored JSON and reconstructs `Transaction` instances via `Transaction.fromJSON()`.

### Validation Rules
| Field | Rule |
|---|---|
| Amount | Required, numeric, > 0 |
| Date | Required, valid date, not in the future |
| Category | Must select Income or Expense (radio) |
| Sub-Category | Must select from dropdown |
| Description | Optional, max 100 characters |

### Error Handling
- All validation errors are displayed inline next to the offending field with a red border.
- All store operations and render functions are wrapped in `try…catch` to prevent unhandled crashes.
- Toast notifications show success or error feedback for every action.

---

## 🛠 How to Run

1. Clone the repository:
   ```bash
   git clone https://github.com/<your-username>/money-manager.git
   cd money-manager
   ```
2. Open `index.html` in any modern browser.
   - ⚠️ **ES6 modules require a server** (not `file://`). Use one of:
     - VS Code **Live Server** extension
     - `npx serve .`
     - `python3 -m http.server 8080`

---

## 🌿 Git Branch Strategy

| Branch | Purpose |
|---|---|
| `dev` | Active development, feature work |
| `stage` | Integration & testing before production |
| `main` | Stable, production-ready code |

Workflow: `dev` → `stage` → `main`

---

## 🧩 Challenges & Learnings

- **ES6 Modules in browser**: Learned that `type="module"` scripts require a proper HTTP server — `file://` protocol blocks CORS for modules.
- **Chart.js destroy/recreate**: Needed to call `chart.destroy()` before re-rendering to avoid canvas reuse warnings.
- **localStorage size limits**: Transactions serialized as compact JSON to stay within browser limits.
- **OOP separation of concerns**: Keeping UI logic in `app.js` separate from data logic in `TransactionStore` made debugging and testing much easier.

---

## 📦 Dependencies

- [Chart.js 4.4](https://www.chartjs.org/) — loaded via CDN
- [Syne + DM Sans](https://fonts.google.com/) — Google Fonts

---

## 👤 Author

Created as a Capstone Project for the Web Development course.
