import ReactGA from 'react-ga';

export function isGAEnabled() {
  return window.TRACKING_ID && window.TRACKING_ID !== '%REACT_APP_TRACKING_ID%'
}

export function init() {
  if (!isGAEnabled()) {
    return false
  }
  ReactGA.initialize(window.TRACKING_ID);
  ReactGA.pageview(window.location.pathname + window.location.search);
}

export function logGuess(word) {
  if (!isGAEnabled()) {
    return false
  }

  ReactGA.event({
    category: 'krizanka',
    action: 'guess',
    label: word,
    dimension1: word
  })
}