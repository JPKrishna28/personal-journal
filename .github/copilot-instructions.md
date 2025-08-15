<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, visit https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->
- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements
	<!-- React Native Expo journaling app with TypeScript, offline storage, rich text input, media attachments, search, dark mode, and export features -->

- [x] Scaffold the Project
	<!-- Created React Native Expo project with TypeScript, all screen components, storage service, theme system, and navigation -->

- [x] Customize the Project
	<!-- Implemented all journaling features: HomeScreen, CreateEntryScreen, ViewEntryScreen, SearchScreen, StorageService, media handling, search, export -->

- [x] Install Required Extensions
	<!-- No specific extensions required for React Native development -->

- [x] Compile the Project
	<!-- Dependencies installed, project structure complete -->

- [x] Create and Run Task
	<!-- Create Expo development task -->

- [x] Launch the Project
	<!-- Start Expo development server -->

- [x] Ensure Documentation is Complete
	<!-- Comprehensive README.md created with full documentation -->

## Project: Offline Journaling App (React Native + Expo)

### ✅ COMPLETED - Full-Featured Offline Journaling App

**Features Implemented:**
- Rich text input (title + body) ✅
- Image attachments (gallery + camera) ✅
- Audio recording and playback ✅
- Video attachments ✅
- Local folder storage with structured organization ✅
- Search functionality ✅
- Dark mode support ✅
- Export functionality ✅
- Clean Material Design 3 UI ✅

**Tech Stack:**
- React Native + Expo + TypeScript
- React Native Paper (Material Design 3)
- expo-file-system for local storage
- expo-image-picker, expo-camera, expo-av, expo-media-library
- React Navigation v6

**Storage Structure:**
```
JournalApp/
├── 2025-08-14_10-30-00_abc12345/
│   ├── entry.json
│   ├── uuid1.jpg
│   ├── uuid2.m4a
│   └── uuid3.mp4
```

**Development Server Status:** ✅ RUNNING
- Expo server started on http://192.168.29.48:8081
- TypeScript compilation successful
- All dependencies installed
- Ready for testing on iOS/Android

**Next Steps:**
1. Scan QR code with Expo Go app to test on device
2. Press 'a' for Android emulator or 'i' for iOS simulator
3. Test all features: create entries, add media, search, export
