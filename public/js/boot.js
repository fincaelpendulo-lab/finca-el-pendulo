// Runs first, in <head>: marks JavaScript as available, sets Google Consent
// Mode v2 defaults to denied, and configures the Google tag (gtag.js), which
// loads right after this file. Keep CONSENT_KEY equal to the one in site.js.
document.documentElement.classList.replace('no-js', 'js');
window.dataLayer = window.dataLayer || [];
window.gtag = function () { window.dataLayer.push(arguments); };
window.gtag('consent', 'default', {
  ad_storage: 'denied',
  ad_user_data: 'denied',
  ad_personalization: 'denied',
  analytics_storage: 'denied',
  functionality_storage: 'denied',
  personalization_storage: 'denied',
  security_storage: 'granted',
  wait_for_update: 500,
});
// A visitor who already accepted analytics keeps it from the first hit.
try {
  var saved = JSON.parse(localStorage.getItem('finca-el-pendulo-consent-v1') || 'null');
  if (saved && saved.analytics) window.gtag('consent', 'update', { analytics_storage: 'granted' });
  if (saved && saved.ads) window.gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted' });
} catch (e) { /* storage blocked */ }
var gaId = document.currentScript && document.currentScript.getAttribute('data-ga');
var adsId = document.currentScript && document.currentScript.getAttribute('data-ads');
if (gaId || adsId) window.gtag('js', new Date());
if (gaId) window.gtag('config', gaId);
// Google Ads: the conversion is the visit to /gracias, counted from this config alone.
if (adsId) window.gtag('config', adsId);
