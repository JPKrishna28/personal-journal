import { Platform } from 'react-native';

// Configure React Native Paper icons for web
if (Platform.OS === 'web') {
  // Ensure Material Design Icons are available globally
  const configureMDIIcons = () => {
    // Add CSS for MDI icons if not already present
    if (!document.querySelector('link[href*="materialdesignicons"]')) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/@mdi/font@7.4.47/css/materialdesignicons.min.css';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    }
    
    // Ensure proper icon font CSS classes
    const style = document.createElement('style');
    style.textContent = `
      .mdi::before {
        font-family: 'Material Design Icons' !important;
        font-weight: normal !important;
        font-style: normal !important;
        font-variant: normal !important;
        text-transform: none !important;
        line-height: 1 !important;
        -webkit-font-smoothing: antialiased !important;
        -moz-osx-font-smoothing: grayscale !important;
      }
      
      /* Specific icons used in the app */
      .mdi-plus::before { content: "\\F0415"; }
      .mdi-magnify::before { content: "\\F049D"; }
      .mdi-attachment::before { content: "\\F0435"; }
      .mdi-microphone::before { content: "\\F036C"; }
      .mdi-stop::before { content: "\\F04DB"; }
      .mdi-play::before { content: "\\F040A"; }
      .mdi-pencil::before { content: "\\F03EB"; }
      .mdi-export::before { content: "\\F0207"; }
      .mdi-delete::before { content: "\\F01B4"; }
      .mdi-dots-vertical::before { content: "\\F01D9"; }
      .mdi-book-open-variant::before { content: "\\F0F9F"; }
    `;
    document.head.appendChild(style);
  };
  
  // Run configuration when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', configureMDIIcons);
  } else {
    configureMDIIcons();
  }
}

export {};
