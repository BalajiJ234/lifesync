As a privacy-first user, I want a spending analytics dashboard that runs locally so that I can understand trends and make better decisions without sharing my financial data.

Acceptance Criteria:
- [ ] Display monthly and weekly spending totals using local data only
- [ ] Provide category breakdown visualisations (e.g., bar/pie charts)
- [ ] Highlight month-over-month deltas with color-coded indicators
- [ ] Allow selecting custom date ranges (e.g., last 30 / 90 days)
- [ ] Works fully offline and uses localStorage/IndexedDB data
- [ ] Responsive layout for mobile and desktop

Notes:
- Use existing expenses slice selectors
- Consider lightweight charting library that can be bundled locally
- Ensure no network requests are made for analytics
