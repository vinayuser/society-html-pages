/**
 * Mobile API client. Set window.API_BASE (e.g. 'https://api.example.com') if backend is on another origin; leave empty for same-origin.
 */
(function () {
  const STORAGE_TOKEN = 'mobile_access_token';
  const STORAGE_USER = 'mobile_user';

  window.API_BASE = 'http://13.203.227.4:5000' || '';

  function getToken() {
    return localStorage.getItem(STORAGE_TOKEN) || '';
  }

  function setToken(token) {
    if (token) localStorage.setItem(STORAGE_TOKEN, token);
    else localStorage.removeItem(STORAGE_TOKEN);
  }

  function getUser() {
    try {
      const s = localStorage.getItem(STORAGE_USER);
      return s ? JSON.parse(s) : null;
    } catch (_) {
      return null;
    }
  }

  function setUser(user) {
    if (user) localStorage.setItem(STORAGE_USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_USER);
  }

  function redirectToLogin() {
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.replace('login.html' + (returnUrl ? '?returnUrl=' + returnUrl : ''));
  }

  function url(path) {
    const base = (window.API_BASE || '').replace(/\/$/, '');
    const p = (path || '').replace(/^\//, '');
    return base ? base + '/' + p : path;
  }

  function request(method, path, body) {
    const token = getToken();
    const opts = {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
    };
    if (token) opts.headers['Authorization'] = 'Bearer ' + token;
    if (body && (method === 'POST' || method === 'PATCH' || method === 'PUT')) opts.body = JSON.stringify(body);

    return fetch(url(path), opts).then(function (res) {
      if (res.status === 401) {
        setToken('');
        setUser(null);
        redirectToLogin();
        return Promise.reject(new Error('Unauthorized'));
      }
      return res.json().then(function (data) {
        if (!res.ok) return Promise.reject(new Error(data.message || 'Request failed'));
        return data;
      });
    });
  }

  window.MobileAPI = {
    getToken: getToken,
    setToken: setToken,
    getUser: getUser,
    setUser: setUser,
    logout: function () {
      setToken('');
      setUser(null);
      window.location.replace('login.html');
    },
    redirectToLogin: redirectToLogin,
    isLoggedIn: function () { return !!getToken(); },
    apiGet: function (path) { return request('GET', path); },
    apiPost: function (path, body) { return request('POST', path, body); },
    apiPatch: function (path, body) { return request('PATCH', path, body); },
  };
})();
