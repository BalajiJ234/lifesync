As a family organizer, I want to set different permissions for household members so that sensitive data stays under my control while still collaborating locally.

Acceptance Criteria:
- [ ] Introduce roles (owner, editor, viewer) configurable per household member
- [ ] Enforce permissions locally: viewers can read but not modify, editors can add expenses, owner controls settings
- [ ] Provide pin/biometric requirement for switching roles or approving changes
- [ ] Maintain audit log of changes tagged by member name (local only)
- [ ] Include permissions data in encrypted export/import flows
- [ ] Work fully offline without contacting servers

Notes:
- Integrate with Settings and household shared budget mode (#34)
- Provide simple UI to manage members and their roles
- Consider optional signature/approval flow for larger expenses
