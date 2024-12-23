import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const TRACKING_ID = 'G-Z60BC1QXD9';

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window.gtag !== 'undefined') {
      window.gtag('event', 'page_view', {
        page_title: document.title,
        page_location: window.location.href,
        page_path: location.pathname + location.search,
        send_to: TRACKING_ID
      });
    }
  }, [location]);

  return null;
};

export default GoogleAnalytics;
