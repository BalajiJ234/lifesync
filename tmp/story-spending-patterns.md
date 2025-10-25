As an insight-seeking user, I want LifeSync to detect spending patterns so that I can understand habits like weekend splurges or weekday essentials without sending data to the cloud.

Acceptance Criteria:
- [ ] Analyze local expense history to surface at least three recurring patterns (e.g., "higher spending on weekends")
- [ ] Present findings in plain language with supporting metrics
- [ ] Allow users to drill into specific pattern and see related transactions
- [ ] Patterns update automatically as new expenses are added
- [ ] Provide toggle to dismiss/restore individual insights
- [ ] Feature works fully offline and respects privacy commitments

Notes:
- Consider running analysis on schedule (e.g., weekly) to avoid heavy computation on every render
- Use caching to store previously computed patterns locally
- Integrate with dashboard insights panel
