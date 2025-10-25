As a saver, I want AI-powered forecasts for my goals so that I know when I will reach them based on my current spending and saving patterns.

Acceptance Criteria:
- [ ] Calculate projected completion date using historic savings rate stored locally
- [ ] Display best/worst case scenarios based on recent trends
- [ ] Update forecasts automatically when expenses or contributions change
- [ ] Provide clear messaging when a goal is not achievable at current pace
- [ ] Works fully offline using existing expense and goal data
- [ ] Include export/import compatibility for forecast metadata

Notes:
- Reuse goal feasibility logic and extend with rolling averages
- Consider using smoothing to avoid over-reacting to one-off expenses
- Present forecast visuals in goal detail view
