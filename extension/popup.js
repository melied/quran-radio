/* popup.js — واجهة الودجت: ترجمة، حالة حية من offscreen، مؤقّت النوم */
var T, LANG = 'ar';
var sleepCountdown = null;

function send(msg, cb) {
  try { chrome.runtime.sendMessage(msg, function (res) { if (cb) cb(res); }); } catch (e) {}
}
function setT(id, txt) {
  var e = document.getElementById(id);
  if (e) e.textContent = txt;
}
function setAria(id, txt) {
  var e = document.getElementById(id);
  if (e) e.setAttribute('aria-label', txt);
}

function applyLang() {
  var t = EXT_I18N[LANG] || EXT_I18N.ar;
  T = t;
  document.documentElement.setAttribute('lang', LANG);
  document.documentElement.setAttribute('dir', LANG === 'en' ? 'ltr' : 'rtl');
  document.title = t.title;
  setT('popupTitle', t.title);
  setT('stationLabel', t.chooseStation);
  setT('sleepTitle', t.sleep);
  setT('statusLabel', t.status.ready);
  setT('openFull', t.openFull);
  setT('langBtn', t.langBtn);
  setAria('playBtn', t.play);
  setAria('sleepRow', t.sleep);
  /* خيارات القائمة — إعادة بناء عند تغيّر اللغة */
  var sel = document.getElementById('stationSelect');
  var cur = sel.value;
  sel.innerHTML = '';
  STATIONS.forEach(function (s, i) {
    var o = document.createElement('option');
    o.value = String(i);
    o.textContent = s.name;
    sel.appendChild(o);
  });
  if (cur) sel.value = cur;
}

function applyState(s) {
  if (!s) return;
  var sel = document.getElementById('stationSelect');
  sel.value = String(s.index);
  setT('nowTitle', STATIONS[s.index] ? STATIONS[s.index].name : '—');
  setT('nowSub', STATIONS[s.index] ? STATIONS[s.index].sub : '—');
  var map = {
    ready: T.status.ready, connecting: T.status.connecting, playing: T.status.playing,
    loading: T.status.loading, stopped: T.status.stopped, error: T.status.error,
    switching: T.status.switching
  };
  setT('statusLabel', map[s.status] || s.status);
  var dot = document.getElementById('statusDot');
  dot.className = 'dot' + (s.status === 'playing' ? ' playing' : s.status === 'error' ? ' error' : '');
  /* أيقونة التشغيل/الإيقاف */
  document.getElementById('playIcon').hidden = !!s.playing;
  document.getElementById('pauseIcon').hidden = !s.playing;
  setAria('playBtn', s.playing ? T.pause : T.play);
  /* مستوى الصوت */
  var vr = document.getElementById('volumeRange');
  if (document.activeElement !== vr) vr.value = s.volume;
  /* المؤقّت */
  window.__sleepEndAt = s.sleepEndAt;
  renderCountdown();
}

function renderCountdown() {
  var end = window.__sleepEndAt || 0;
  var remain = end - Date.now();
  var off = document.getElementById('sleepOff');
  if (remain > 0) {
    var sec = Math.round(remain / 1000);
    var m = Math.floor(sec / 60); sec = sec % 60;
    off.textContent = T.cancel + ' (' + m + ':' + (sec < 10 ? '0' : '') + sec + ')';
    if (!sleepCountdown) sleepCountdown = setInterval(renderCountdown, 1000);
  } else {
    off.textContent = T.cancel;
    if (sleepCountdown) { clearInterval(sleepCountdown); sleepCountdown = null; }
  }
}

/* إقلاع: اللغة ← ضمان offscreen ← الحالة */
chrome.storage.local.get(['lang'], function (p) {
  LANG = (p.lang === 'en') ? 'en' : 'ar';
  applyLang();

  send({ type: 'ensure-offscreen' }, function () {
    var tries = 0;
    (function getState() {
      send({ type: 'get-state', target: 'offscreen' }, function (s) {
        if (s) applyState(s);
        else if (tries++ < 6) setTimeout(getState, 200);
      });
    })();
  });
});

/* التحديثات الحية من offscreen */
chrome.runtime.onMessage.addListener(function (msg) {
  if (msg && msg.type === 'state') applyState(msg);
});

/* الأزرار */
document.getElementById('playBtn').addEventListener('click', function () {
  send({ type: 'toggle', target: 'offscreen' }, function (s) { if (s) applyState(s); });
});
document.getElementById('stationSelect').addEventListener('change', function () {
  send({ type: 'set-station', target: 'offscreen', index: parseInt(this.value, 10) || 0 }, function (s) { if (s) applyState(s); });
});
document.getElementById('volumeRange').addEventListener('input', function () {
  var v = parseFloat(this.value);
  send({ type: 'set-volume', target: 'offscreen', value: v });
  var dot = document.getElementById('statusDot');
  dot.className = 'dot' + (window.__sleepEndAt > Date.now() ? ' playing' : dot.className.replace('dot ', '').trim() ? ' ' + dot.className.split(' ').filter(function (c) { return c !== 'dot'; }).join(' ') : '');
});
document.querySelectorAll('.sq').forEach(function (b) {
  b.addEventListener('click', function () {
    var min = parseInt(b.getAttribute('data-min'), 10) || 0;
    document.querySelectorAll('.sq').forEach(function (x) { x.classList.remove('active'); });
    if (min > 0) b.classList.add('active');
    send({ type: 'set-sleep', target: 'offscreen', minutes: min }, function (s) { if (s) applyState(s); });
  });
});
document.getElementById('langBtn').addEventListener('click', function () {
  chrome.storage.local.set({ lang: LANG === 'ar' ? 'en' : 'ar' }, function () { location.reload(); });
});
document.getElementById('openFull').addEventListener('click', function () {
  chrome.tabs.create({ url: 'https://quran-radio-ten.vercel.app' });
  window.close();
});
