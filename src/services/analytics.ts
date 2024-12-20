import ReactGA from 'react-ga4';

export const initGA = () => {
  ReactGA.initialize('G-Z60BC1QXD9');
};

export const logPageView = (path: string) => {
  ReactGA.send({ hitType: 'pageview', page: path });
};
