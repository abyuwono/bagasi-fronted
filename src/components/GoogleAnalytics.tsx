import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TRACKING_ID = 'G-Z60BC1QXD9';

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${TRACKING_ID}`;
    document.head.appendChild(script);

    const scriptContent = document.createElement('script');
    scriptContent.textContent = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${TRACKING_ID}', {
        page_location: window.location.href,
        page_path: window.location.pathname + window.location.search,
        cookie_flags: 'SameSite=None;Secure'
      });
    `;
    document.head.appendChild(scriptContent);

    return () => {
      document.head.removeChild(script);
      document.head.removeChild(scriptContent);
    };
  }, []);

  useEffect(() => {
    if (window.gtag) {
      window.gtag('config', TRACKING_ID, {
        page_location: window.location.href,
        page_path: location.pathname + location.search,
      });
    }
  }, [location]);

  return null;
};

export default GoogleAnalytics;
