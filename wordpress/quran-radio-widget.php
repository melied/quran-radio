<?php
/**
 * Plugin Name: Quran Radio Widget
 * Description: إذاعة القرآن الكريم بث مباشر داخل موقعك — شورت كود [quran_radio] يعرض مشغل الإذاعة (عبر التضمين الآمن). متوافق مع أي قالب.
 * Version: 1.0.0
 * Author: melied
 * License: MIT
 * Text Domain: quran-radio
 */

if (!defined('ABSPATH')) exit; // لا تشغيل مباشر

function quran_radio_widget_shortcode($atts) {
    $a = shortcode_atts(array(
        'station' => 0,        // رقم الإذاعة حسب الترتيب: 0=السعودية، 1=الجزائر، 2=مصر، 3=التراتيل، 4=العفاسي، 5=عبدالباسط
        'height'  => 430,      // ارتفاع المشغل بالبكسل
        'lang'    => 'ar',     // لغة الواجهة داخل الودجت (ملاحظة: اللغة تُدار أيضًا من زر التبديل داخل المشغل)
    ), $atts, 'quran_radio');

    $src = 'https://quran-radio-ten.vercel.app/preview.html?embed=1&lang=' . rawurlencode(sanitize_text_field($a['lang'])) . '&station=' . intval($a['station']);

    return '<iframe src="' . esc_url($src) . '" width="100%" height="' . intval($a['height']) . '" style="border:0;border-radius:14px" loading="lazy" title="' . esc_attr__('Holy Quran Radio - Live', 'quran-radio') . '" allow="autoplay; encrypted-media"></iframe>';
}
add_shortcode('quran_radio', 'quran_radio_widget_shortcode');
