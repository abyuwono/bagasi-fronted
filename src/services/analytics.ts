declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
  }
}

export const initGA = () => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('config', 'G-Z60BC1QXD9');
  }
};

export const logPageView = (path: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', 'page_view', {
      page_path: path,
    });
  }
};

export const logEvent = (category: string, action: string, label?: string) => {
  if (typeof window.gtag !== 'undefined') {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
    });
  }
};
