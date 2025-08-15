# Web Platform Notes

## Features Available on Web
✅ **Text Journaling**: Full rich text support
✅ **Image Upload**: File picker for images
✅ **Search**: Full search functionality  
✅ **Dark Mode**: Automatic theme switching
✅ **Export**: Download JSON files
✅ **Local Storage**: Data persisted in browser

## Web Limitations
❌ **Camera Access**: Camera API not available
❌ **Audio Recording**: Microphone API not supported
❌ **Video Selection**: Video picker limited
❌ **Native File System**: Uses localStorage instead

## Development Notes
- Web version uses localStorage for data persistence
- Native mobile version uses expo-file-system
- Platform-specific features are automatically disabled on web
- All core journaling functionality works across platforms

## Testing
1. **Web**: http://localhost:8081
2. **Mobile**: Scan QR code with Expo Go
3. **Emulator**: Press 'a' (Android) or 'i' (iOS)

The app gracefully handles platform differences and provides a good user experience on all supported platforms.
