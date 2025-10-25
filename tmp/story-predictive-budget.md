As a budget watcher, I want LifeSync to forecast my end-of-month spending so that I can adjust behavior before overspending while keeping everything offline.

Acceptance Criteria:
- [ ] Use historical expense patterns to project current month's total spend per category and overall
- [ ] Present forecast with confidence range and highlight categories likely to exceed budget
- [ ] Update predictions automatically as new expenses are logged
- [ ] Allow user to adjust forecast window (e.g., current month, next month)
- [ ] Works entirely offline using local data and caches results for performance
- [ ] Integrates with budget alerts to trigger warnings earlier when forecast exceeds limits

Notes:
- Consider exponential smoothing or regression using local data only
- Provide simple explanation for forecast methodology in UI
- Support export/import of forecast metadata to preserve state
