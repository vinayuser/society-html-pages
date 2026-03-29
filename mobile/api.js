/**
 * Member app API client (society residents). Set window.API_BASE before this script if the API is on another host.
 */
(function () {
  const STORAGE_TOKEN = 'mobile_access_token';
  const STORAGE_USER = 'mobile_user';

  function defaultApiBase() {
    try {
      var h = window.location.hostname;
      if (h === 'localhost' || h === '127.0.0.1') return 'http://localhost:3000';
    } catch (e) {}
    return '';
  }
  if (typeof window.API_BASE === 'undefined' || window.API_BASE === null || window.API_BASE === '') {
    window.API_BASE = 'http://13.203.227.4:5000';
    // window.API_BASE = 'http://localhost:3000';
  }

  function getToken() {
    return localStorage.getItem(STORAGE_TOKEN) || '';
  }

  function setToken(token) {
    if (token) localStorage.setItem(STORAGE_TOKEN, token);
    else localStorage.removeItem(STORAGE_TOKEN);
  }

  function getUser() {
    try {
      var s = localStorage.getItem(STORAGE_USER);
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
    var returnUrl = encodeURIComponent(window.location.href);
    window.location.replace('login.html' + (returnUrl ? '?returnUrl=' + returnUrl : ''));
  }

  function url(path) {
    var base = (window.API_BASE || '').replace(/\/$/, '');
    var p = (path || '').replace(/^\//, '');
    return base ? base + '/' + p : path;
  }

  /** Build absolute URL for API-hosted media paths (e.g. /uploads/ads/platform/file.jpg). */
  function mediaUrl(u) {
    if (!u) return '';
    if (/^https?:\/\//i.test(u)) return u;
    return url(u.replace(/^\//, ''));
  }

  /** Use <video> when type is video or URL looks like a video file (handles wrong/missing type). */
  function isVideoAd(ad) {
    if (!ad) return false;
    if (String(ad.type || '').toLowerCase() === 'video') return true;
    var path = String(ad.contentUrl || '').split(/[?#]/)[0].toLowerCase();
    return /\.(mp4|webm|ogg|ogv|mov)(\?|#|$)/i.test(path);
  }

  /** Human label for UI: "Video" or "Image". */
  function mediaKindLabel(ad) {
    return isVideoAd(ad) ? 'Video' : 'Image';
  }

  /** List endpoints return { Collection: { data: [] }, Pagination } */
  function listFrom(json) {
    if (!json || typeof json !== 'object') return [];
    if (json.Collection && Array.isArray(json.Collection.data)) return json.Collection.data;
    if (Array.isArray(json.data)) return json.data;
    return [];
  }

  /** Single resource: { success, data: { ... } } */
  function dataFrom(json) {
    if (!json || typeof json !== 'object') return null;
    return json.data !== undefined ? json.data : null;
  }

  function request(method, path, body) {
    var token = getToken();
    var opts = {
      method: method,
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
      var ct = res.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        if (!res.ok) return Promise.reject(new Error('Request failed'));
        return Promise.resolve({});
      }
      return res.json().then(function (data) {
        if (!res.ok) return Promise.reject(new Error((data && data.message) || 'Request failed'));
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
    isLoggedIn: function () {
      return !!getToken();
    },
    listFrom: listFrom,
    dataFrom: dataFrom,
    apiGet: function (path) {
      return request('GET', path);
    },
    apiPost: function (path, body) {
      return request('POST', path, body);
    },
    apiPatch: function (path, body) {
      return request('PATCH', path, body);
    },
    apiPut: function (path, body) {
      return request('PUT', path, body);
    },
    apiDelete: function (path) {
      return request('DELETE', path);
    },
    mediaUrl: mediaUrl,
    isVideoAd: isVideoAd,
    mediaKindLabel: mediaKindLabel,
  };
})();
