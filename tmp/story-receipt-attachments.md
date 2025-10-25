As a meticulous budgeter, I want to attach receipt photos to my expenses so that I can reference original proof of purchase without leaving LifeSync or uploading documents to third-party services.

Acceptance Criteria:
- [ ] Allow adding one or more images to an expense using file picker or drag & drop
- [ ] Store images locally using IndexedDB (or other browser storage) with references in Redux state
- [ ] Display thumbnails within the expense detail view and allow full-size preview
- [ ] Support deletion of individual attachments without affecting the expense record
- [ ] Work fully offline and never upload images to remote services
- [ ] Respect storage limits and warn user if attachment exceeds safe size threshold

Notes:
- Consider using browser-friendly compression to keep storage footprint reasonable
- Ensure attachments sync correctly with export/import flow (e.g., base64 or zip bundle)
- Provide accessibility descriptions for images if possible
