/**
 * Include on any mobile page that requires login. If no token, redirects to login.html with returnUrl.
 */
(function () {
  if (typeof window.MobileAPI === 'undefined') {
    console.error('auth-gate.js requires api.js to be loaded first');
    return;
  }
  if (!window.MobileAPI.isLoggedIn()) {
    window.MobileAPI.redirectToLogin();
  }
})();
