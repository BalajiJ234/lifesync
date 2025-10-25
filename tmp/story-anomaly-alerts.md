As a vigilant user, I want LifeSync to alert me about unusual expenses so that I can quickly investigate potential mistakes or fraud without exposing my data.

Acceptance Criteria:
- [ ] Analyze new expenses against historical averages to flag anomalies (amount or category outliers)
- [ ] Surface alerts in dashboard and NotificationBanner with dismiss/acknowledge option
- [ ] Allow configuring sensitivity (strict, moderate, relaxed)
- [ ] Store alert history locally and include in export/import
- [ ] Ensure analysis and alert generation happen offline with no external requests
- [ ] Provide guidance on why an expense was flagged

Notes:
- Use z-score or percentile based approach on local dataset
- Avoid alert fatigue by grouping similar alerts or setting cool-down period
- Integrate with spending pattern engine for shared computations
