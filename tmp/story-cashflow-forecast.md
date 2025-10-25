As someone managing cashflow, I want LifeSync to forecast upcoming balances so that I can anticipate shortfalls or surpluses using only my local data.

Acceptance Criteria:
- [ ] Combine recurring income, expenses, and planned goals to project daily/weekly cash balance for next 90 days
- [ ] Highlight periods where balance dips below user-defined safety threshold
- [ ] Allow users to simulate adjustments (e.g., delay purchase) and see impact
- [ ] Forecast runs offline and avoids any external API calls
- [ ] Provide exportable data (CSV/JSON) for personal records
- [ ] Integrate with alerts to notify when forecasted balance is negative

Notes:
- Reuse recurring templates and goals data for projections
- Consider visual timeline chart with tooltips
- Ensure computations handle timezone and currency consistently
