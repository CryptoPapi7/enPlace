# enPlace Backlog

Issues and improvements to work on later.

## Android Compatibility

### Android 13+ Permission Handling for Image Picker
**Priority:** Medium
**Status:** Todo

Android 13+ (SDK 33+) changed photo permissions. Current implementation uses `expo-image-picker` which handles most cases, but we may need explicit permission handling for edge cases.

**Task:**
- Test on Android 13+ device
- Add explicit `READ_MEDIA_IMAGES` permission to `app.json` if needed
- Permission fallback for older Android versions

**Reference:**
- Current permission: Auto-handled by expo-image-picker
- May need: `android.permission.READ_MEDIA_IMAGES` for SDK 33+

## Future Features

### Recipe Reviews System
Replace "Save" buttons with star ratings and review counts.

### Push Notifications
- Meal reminders (30 min before cooking)
- Shopping reminders (day before grocery run)
- New recipe alerts

### Recipe Scaling Improvements
- Better fractional display (3/4 instead of 0.75)
- Baker's percentage mode
- Auto-scale on serving change with undo

### Voice Control (v0.2)
- Native speech recognition (requires custom dev client)
- Azure TTS improvements
