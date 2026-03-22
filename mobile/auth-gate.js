/**
 * Member (resident) app: require login. If no token, redirects to login.html with returnUrl.
 * Some API routes are resident-only (e.g. /app/my-flats, /app/directory, /app/activity).
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
