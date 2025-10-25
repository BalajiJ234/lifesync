As a guided user, I want LifeSync to recommend realistic financial goals so that I can focus on achievable targets without manual calculations.

Acceptance Criteria:
- [ ] Analyze expense patterns and existing savings to suggest 2-3 relevant goals (e.g., emergency fund, vacation)
- [ ] Provide rationale for each suggestion (e.g., "average monthly surplus AED 400 → realistic saving target AED 300")
- [ ] Allow users to accept, modify, or dismiss suggestions
- [ ] Suggestions run entirely offline and do not contact external services
- [ ] Respect user privacy by performing calculations locally only
- [ ] Store accepted suggestions as regular goals and include in export/import

Notes:
- Reuse AI insights engine for spending analysis
- Ensure repeated suggestions do not appear once dismissed
- Display suggestions in Goals dashboard and Settings tips
