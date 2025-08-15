# Journal Tracking App

A complete offline journaling app built with React Native and Expo that stores all data locally on the device.

## Features

### ✅ Core Features
- **Rich Text Journaling**: Create entries with title and content
- **Media Attachments**: 
  - Attach images from gallery or camera
  - Record and attach audio notes
  - Record and attach short videos
- **Offline Storage**: All data stored locally in structured folders
- **Search**: Search through all journal entries by keywords
- **Dark Mode**: Automatic dark/light theme support
- **Export**: Export individual entries for manual backup

### 📁 Storage Structure
All journal data is stored in the app's local directory under `JournalApp/` with the following structure:

```
JournalApp/
├── 2025-08-14_10-30-00_abc12345/
│   ├── entry.json
│   ├── image_uuid1.jpg
│   ├── audio_uuid2.m4a
│   └── video_uuid3.mp4
├── 2025-08-13_15-45-30_def67890/
│   ├── entry.json
│   └── image_uuid4.jpg
```

Each entry folder is named with:
- Date: `YYYY-MM-DD`
- Time: `HH-MM-SS`
- Entry ID: First 8 characters of the entry UUID

### 🎨 UI/UX
- Clean, minimal design using React Native Paper
- Material Design 3 components
- Automatic dark/light mode support
- Intuitive navigation and user experience

## Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **UI Library**: React Native Paper (Material Design 3)
- **Navigation**: React Navigation v6
- **Storage**: Expo FileSystem (local storage)
- **Media**: 
  - `expo-image-picker` for images/videos
  - `expo-camera` for camera access
  - `expo-av` for audio recording and playback
  - `expo-media-library` for media permissions
- **File Sharing**: `expo-sharing` for export functionality

## Installation & Setup

### Prerequisites
- Node.js (v16 or later)
- npm or yarn
- Expo CLI: `npm install -g @expo/cli`
- For iOS: Xcode and iOS Simulator
- For Android: Android Studio and Android emulator

### Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd journaltracking
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on device/simulator**
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app for physical device

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Main app screens
│   ├── HomeScreen.tsx      # Entry list and navigation
│   ├── CreateEntryScreen.tsx # Create/edit entries
│   ├── ViewEntryScreen.tsx   # View individual entries
│   └── SearchScreen.tsx      # Search functionality
├── services/           # Business logic services
│   └── StorageService.ts   # File system operations
├── types/              # TypeScript type definitions
│   └── types.ts           # App-wide type definitions
├── utils/              # Utility functions
│   └── helpers.ts         # UUID generation, date formatting
└── theme/              # App theming
    └── theme.ts           # Light/dark theme definitions
```

## Key Components

### Storage Service (`StorageService.ts`)
Handles all file system operations:
- Creating entry directories
- Saving/loading JSON data
- Managing media attachments
- Search functionality
- Export operations

### Screen Components
- **HomeScreen**: Lists all entries, search navigation
- **CreateEntryScreen**: Create/edit entries with media
- **ViewEntryScreen**: Display entries with media playback
- **SearchScreen**: Real-time search through entries

### Media Handling
- **Images**: JPG format, gallery picker and camera
- **Audio**: M4A format, built-in recording
- **Video**: MP4 format, gallery picker

## Permissions Required

### iOS (Info.plist)
- `NSCameraUsageDescription`: Camera access for photos
- `NSMicrophoneUsageDescription`: Microphone for audio recording
- `NSPhotoLibraryUsageDescription`: Photo library access

### Android (app.json)
- `android.permission.CAMERA`: Camera access
- `android.permission.RECORD_AUDIO`: Audio recording
- `android.permission.READ_EXTERNAL_STORAGE`: Media access
- `android.permission.WRITE_EXTERNAL_STORAGE`: Media saving

## Usage Instructions

### Creating Entries
1. Tap the `+` button on the home screen
2. Add a title and content
3. Optionally attach media:
   - Tap attachment icon for images/videos
   - Tap microphone icon to record audio
4. Tap "Save Entry"

### Viewing Entries
1. Tap any entry from the home screen
2. View text content and attached media
3. Use the menu (⋮) to edit, export, or delete

### Searching
1. Tap the search bar or search icon
2. Type keywords to search titles and content
3. Results update in real-time

### Exporting
1. Open any entry
2. Tap the menu (⋮) and select "Export"
3. Share the entry folder via available apps

## Development Notes

### File Naming Convention
- Entry folders: `YYYY-MM-DD_HH-MM-SS_[8-char-uuid]`
- Media files: `[full-uuid].[extension]`
- Entry data: `entry.json`

### Error Handling
- All file operations include try/catch blocks
- User-friendly error messages via alerts
- Graceful degradation for missing files

### Performance Considerations
- Lazy loading of media content
- Efficient search through local storage
- Optimized image/video sizes

## Building for Production

### iOS
```bash
expo build:ios
```

### Android
```bash
expo build:android
```

### Using EAS Build (Recommended)
```bash
npm install -g @expo/eas-cli
eas build --platform ios
eas build --platform android
```

## Troubleshooting

### Common Issues

1. **Permission Errors**
   - Ensure all permissions are properly configured in app.json
   - Test on physical device for camera/microphone features

2. **Storage Issues**
   - Check device storage space
   - Verify file system permissions

3. **Media Playback Issues**
   - Ensure proper file formats (JPG, M4A, MP4)
   - Check file paths and existence

### Debug Mode
Run with debug logging:
```bash
expo start --dev-client
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both iOS and Android
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Future Enhancements

- [ ] Rich text formatting (bold, italic, lists)
- [ ] Entry categories and tags
- [ ] Backup to cloud storage
- [ ] Entry templates
- [ ] Mood tracking
- [ ] Data encryption
- [ ] Multiple journal support
- [ ] Entry statistics and insights
