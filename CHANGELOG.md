# Changelog

## [3.0.0] - 2026-01-13

### Added
- **Pause/Resume**: Jeda farming kapan saja tanpa kehilangan progress
- **Progress Bar**: Visualisasi progress di status section
- **Dark Mode**: Toggle tema gelap di settings
- **Mouse Trail Simulation**: Gerakan mouse dengan easing curves
- **Tab Focus Simulation**: Simulasi multitasking (20% chance per website)
- **Random Stay Time Variance**: ±5 detik variasi per website

### Fixed
- `popupController is not defined` error
- `Date.getTime is not a function` error (session start parsing)
- CSS lint warnings (appearance property)

### Changed
- Checkbox style untuk Auto-Start (mengganti toggle yang bug)
- UI state "Ready to Start" saat stopped (bukan URL)

---

## [2.1.0] - 2026-01-13

### Added
- RPA Safe Mode (tidak tutup tab lain)
- Anti-Suicide Browser (safe tab close)
- Instant Start (tanpa delay)
- Referrer Spoofing

### Removed
- Google.com dari target list (CAPTCHA issues)