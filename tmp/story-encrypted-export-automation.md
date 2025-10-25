As a power user, I want a one-click command to export my encrypted data so that I can easily archive my finances without navigating multiple menus.

Acceptance Criteria:
- [ ] Provide shortcut button (e.g., "Quick Encrypted Export") when encryption is enabled
- [ ] Use previously saved destination and encryption settings
- [ ] Confirm success with inline notification and offer "reveal in folder" link where supported
- [ ] Handle errors gracefully with retry guidance
- [ ] Work offline and sync queued exports when connection returns
- [ ] Ensure feature is disabled or hidden when encryption is disabled or configuration incomplete

Notes:
- Consider keyboard shortcut for desktop users
- Integrate with service worker for background processing when PWA installed
- Log export events in Settings audit history
