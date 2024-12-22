import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: Function;
  }
}

const pageview = (url: string) => {
  if (window.gtag) {
    window.gtag('config', 'G-Z60BC1QXD9', {
      page_path: url,
    });
  }
};

const GoogleAnalytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Load GA script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-Z60BC1QXD9';
    document.head.appendChild(script);

    // Initialize GA
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(arguments);
    }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', 'G-Z60BC1QXD9', {
      send_page_view: true,
      cookie_flags: 'SameSite=None;Secure'
    });

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const path = location.pathname + location.search;
    pageview(path);
  }, [location]);

  return null;
};

export default GoogleAnalytics;
