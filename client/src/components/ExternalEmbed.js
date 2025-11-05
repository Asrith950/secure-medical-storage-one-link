import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

// External embed temporarily disabled to prevent script errors
// You can re-enable this by uncommenting the code below
// const EMBED_SRC = 'https://www.noupe.com/embed/019a3970f83970d4b9df03430fe420d4faaf.js';
// const SCRIPT_ID = 'noupe-embed-script';

export default function ExternalEmbed() {
  const location = useLocation();

  useEffect(() => {
    // External embed disabled - no action needed
    // This prevents third-party script errors
    
    /* ORIGINAL CODE - Uncomment to re-enable external embed:
    
    const isChatbot = location.pathname.startsWith('/chatbot');

    const hideNoupeIframes = () => {
      const iframes = Array.from(document.querySelectorAll('iframe'));
      iframes.forEach((iframe) => {
        const src = iframe.getAttribute('src') || '';
        if (src.includes('noupe.com')) {
          iframe.style.display = 'none';
        }
      });
    };

    const unhideNoupeIframes = () => {
      const iframes = Array.from(document.querySelectorAll('iframe'));
      iframes.forEach((iframe) => {
        const src = iframe.getAttribute('src') || '';
        if (src.includes('noupe.com')) {
          iframe.style.display = '';
        }
      });
    };

    if (isChatbot) {
      // On Chatbot page: hide if the widget is present
      hideNoupeIframes();
    } else {
      // On other pages: ensure the script is loaded and show the widget
      if (!document.getElementById(SCRIPT_ID)) {
        const s = document.createElement('script');
        s.id = SCRIPT_ID;
        s.src = EMBED_SRC;
        s.async = true;
        document.body.appendChild(s);
      }
      unhideNoupeIframes();
    }
    
    */

    // External embed disabled - component returns null
  }, [location]);

  return null;
}
