/* offscreen.js — صاحب الصوت: تشغيل مستمر + MediaSession + مؤقّت النوم + failover */
var STATIONS = window.STATIONS || [];
var audio = document.getElementById('player');
var state = { playing: false, index: 0, volume: 1, status: 'ready', sleepEndAt: 0 };
var failed = [];
var failoverRetries = 0;
var sleepTick = null, sleepBase = null;

function snap() {
  return {
    type: 'state', target: 'broadcast',
    playing: state.playing, index: state.index, volume: state.volume,
    status: state.status, sleepEndAt: state.sleepEndAt,
    stationName: STATIONS[state.index] ? STATIONS[state.index].name : ''
  };
}
function broadcast() { try { chrome.runtime.sendMessage(snap()); } catch (e) {} }
function save() { try { chrome.storage.local.set({ volume: state.volume, station: state.index }); } catch (e) {} }

/* تحميل التفضيلات ثم الإعلان عن الجاهزية */
chrome.storage.local.get(['volume', 'station'], function (p) {
  if (typeof p.volume === 'number') { state.volume = p.volume; }
  if (typeof p.station === 'number' && p.station >= 0 && p.station < STATIONS.length) { state.index = p.station; }
  audio.volume = state.volume;
  broadcast();
});

function start() {
  state.playing = true; state.status = 'connecting'; failed = []; failoverRetries = 0;
  if (!audio.src || audio.src.indexOf(STATIONS[state.index].url) === -1) {
    audio.src = STATIONS[state.index].url;
    audio.load();
  }
  var p = audio.play();
  if (p && p.catch) p.catch(function () { /* بانتظار تفاعل المستخدم عند الحاجة */ });
  updateMeta(); broadcast(); save();
}
function stop() {
  state.playing = false; state.status = 'stopped'; failed = []; failoverRetries = 0;
  audio.pause();
  try { audio.load(); } catch (e) {}
  updateMeta(); broadcast(); save();
}
function setStation(i) {
  if (i < 0 || i >= STATIONS.length) return;
  state.index = i; failed = []; failoverRetries = 0;
  if (state.playing) { state.status = 'connecting'; audio.src = STATIONS[i].url; audio.load(); audio.play().catch(function () {}); }
  updateMeta(); broadcast(); save();
}
function setVolume(v) {
  state.volume = Math.max(0, Math.min(1, Number(v) || 0));
  audio.volume = state.volume;
  broadcast(); save();
}

/* أحداث الصوت */
audio.addEventListener('playing', function () {
  failed = []; failoverRetries = 0;
  state.playing = true; state.status = 'playing';
  updateMeta(); broadcast();
});
audio.addEventListener('waiting', function () {
  if (state.playing) { state.status = 'loading'; broadcast(); }
});
['error', 'stalled', 'ended'].forEach(function (ev) {
  audio.addEventListener(ev, function () {
    if (!state.playing) return;
    failoverRetries++;
    if (failoverRetries <= 2) {
      /* محاولتان سريعتان لنفس الإذاعة قبل الانتقال */
      setTimeout(function () {
        if (state.playing) { audio.src = STATIONS[state.index].url; audio.play().catch(function () {}); }
      }, 1500 * failoverRetries);
      return;
    }
    var candidates = [];
    for (var i = 0; i < STATIONS.length; i++) {
      if (i !== state.index && failed.indexOf(i) === -1) candidates.push(i);
    }
    if (candidates.length) {
      var next = candidates[0];
      failed.push(state.index); failoverRetries = 0;
      state.index = next; state.status = 'connecting';
      audio.src = STATIONS[next].url; audio.load(); audio.play().catch(function () {});
      broadcast();
    } else {
      state.playing = false; state.status = 'error'; failed = []; failoverRetries = 0;
      broadcast();
    }
  });
});

/* مؤقّت النوم — يعيش هنا فيكمل حتى بعد إغلاق النافذة المنبثقة */
function setSleep(min) {
  clearInterval(sleepTick); sleepTick = null;
  if (!min) { state.sleepEndAt = 0; sleepBase = null; broadcast(); return; }
  sleepBase = state.volume;
  state.sleepEndAt = Date.now() + min * 60000;
  sleepTick = setInterval(function () {
    var remain = state.sleepEndAt - Date.now();
    if (remain <= 0) {
      clearInterval(sleepTick); sleepTick = null; state.sleepEndAt = 0;
      audio.pause();
      state.playing = false; state.status = 'stopped';
      if (sleepBase !== null) { state.volume = sleepBase; audio.volume = sleepBase; sleepBase = null; save(); }
      broadcast();
      return;
    }
    if (remain <= 15000 && sleepBase !== null) {
      audio.volume = Math.max(0, sleepBase * (remain / 15000));
    }
  }, 500);
  broadcast();
}

/* MediaSession — التحكم من شاشة القفل ولوحة مفاتيح الوسائط */
function updateMeta() {
  if (!('mediaSession' in navigator)) return;
  try {
    navigator.mediaSession.metadata = new MediaMetadata({
      title: STATIONS[state.index].name,
      artist: STATIONS[state.index].sub,
      album: 'Holy Quran Radio'
    });
    navigator.mediaSession.playbackState = state.playing ? 'playing' : 'paused';
  } catch (e) {}
}
if ('mediaSession' in navigator) {
  try {
    navigator.mediaSession.setActionHandler('play', function () { start(); });
    navigator.mediaSession.setActionHandler('pause', function () { stop(); });
    navigator.mediaSession.setActionHandler('stop', function () { stop(); });
    navigator.mediaSession.setActionHandler('nexttrack', function () { setStation((state.index + 1) % STATIONS.length); if (!state.playing) start(); });
    navigator.mediaSession.setActionHandler('previoustrack', function () { setStation((state.index - 1 + STATIONS.length) % STATIONS.length); if (!state.playing) start(); });
  } catch (e) {}
}

/* بوابة الأوامر — تستقبل رسائل الهدف offscreen فقط */
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (!msg || msg.target !== 'offscreen') return;
  switch (msg.type) {
    case 'get-state': break;
    case 'play': start(); break;
    case 'pause': stop(); break;
    case 'toggle': state.playing ? stop() : start(); break;
    case 'set-station': setStation(msg.index | 0); break;
    case 'set-volume': setVolume(msg.value); break;
    case 'set-sleep': setSleep(msg.minutes | 0); break;
  }
  sendResponse(snap());
});
