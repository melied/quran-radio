/* sw-background.js — منسّق الخلفية: إنشاء وثيقة offscreen + شارة الحالة + اختصار لوحة المفاتيح */

var creatingOffscreen = null;

function ensureOffscreen() {
  if (creatingOffscreen) return creatingOffscreen;
  creatingOffscreen = chrome.offscreen.hasDocument().then(function (has) {
    if (has) return;
    return chrome.offscreen.createDocument({
      url: 'offscreen.html',
      reasons: ['AUDIO_PLAYBACK'],
      justification: 'تشغيل بث إذاعة القرآن الكريم بشكل مستمر في الخلفية'
    });
  }).catch(function (err) {
    /* "Single offscreen document" سبق إنشاؤه — آمن */
    if (!String(err).match(/single offscreen|only a single/i)) throw err;
  }).then(function () {
    creatingOffscreen = null;
  });
  return creatingOffscreen;
}

chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (!msg) return;

  /* حالة البث القادمة من offscreen → شارة الأيقونة */
  if (msg.type === 'state' && typeof msg.playing === 'boolean') {
    chrome.action.setBadgeText({ text: msg.playing ? 'ON' : '' });
    chrome.action.setBadgeBackgroundColor({ color: '#0f6b52' });
    return;
  }

  /* الودجت تطلب ضمان وجود وثيقة الصوت */
  if (msg.type === 'ensure-offscreen') {
    ensureOffscreen().then(function () { sendResponse({ ok: true }); });
    return true; /* استجابة غير متزامنة */
  }

  /* الرسائل الموجهة لoffscreen تصل أيضًا هنا — نتجاهلها (offscreen يعالجها) */
  if (msg.target === 'offscreen') return;
});

/* اختصار لوحة المفاتيح: تشغيل/إيقاف من أي صفحة */
chrome.commands.onCommand.addListener(function (command) {
  if (command !== 'toggle-play') return;
  ensureOffscreen().then(function () {
    chrome.runtime.sendMessage({ type: 'toggle', target: 'offscreen' });
  });
});
