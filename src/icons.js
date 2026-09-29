/* ═══════════════════════════════════════════════════════════════
   Icons

   One small line-glyph set for the whole app, in place of emoji. Emoji
   draw differently on every phone, carry their own colours, and read as a
   chat message; a glyph in a tinted tile reads as a row of an app, and
   looks the same on every screen.

   Two ways to draw one:
     ic('flame')        a glyph in a rounded tile of its own colour — for
                        list rows and card titles, as Settings and Health do
     glyph('flame')     the bare glyph in the current text colour — for the
                        artwork cards, where the card is already the colour

   Both also take an emoji, so data written with emoji (a program's
   icon:'🔥') draws as a glyph without the data being rewritten. An emoji
   with no mapping falls back to a neutral mark rather than to itself.
   ═══════════════════════════════════════════════════════════════ */

var ICON_PATH={
  workout: '<path d="M6 7v10M18 7v10M3 10v4M21 10v4M6 12h12"/>',
  steps:   '<circle cx="13.5" cy="4.5" r="1.8"/><path d="M10.5 21l2-6-3-3 1.5-5 3.5 3 3.5 1M9 12l-3 2.5"/>',
  run:     '<circle cx="14" cy="4.5" r="1.8"/><path d="M5 20l4-4 2 1 2-4 3 2h3M9 11l2.5-3.5 3 1.5-2 4.5"/>',
  food:    '<path d="M7 3v7a2 2 0 0 0 2 2v9M11 3v7M7 7h4M17 21v-8c-1.8 0-2.6-2-2.6-4.6S15.5 3 17 3z"/>',
  water:   '<path d="M12 3.5s6 6.3 6 10.5a6 6 0 0 1-12 0c0-4.2 6-10.5 6-10.5z"/>',
  check:   '<path d="M5 12.5l4.5 4.5L19 7.5"/>',
  gym:     '<path d="M12 21s7-6.1 7-11.4a7 7 0 0 0-14 0C5 14.9 12 21 12 21z"/><circle cx="12" cy="9.6" r="2.5"/>',
  bolt:    '<path d="M13 2.5L4.5 13.5H11l-1 8 8.5-11H12l1-8z"/>',
  measure: '<path d="M3.5 16.5L16.5 3.5l4 4-13 13z"/><path d="M7.5 12.5l2 2M10.5 9.5l2 2M13.5 6.5l2 2"/>',
  flag:    '<path d="M6 21V4M6 4h10.5l-2 4 2 4H6"/>',
  photo:   '<path d="M4 8h3l2-2.5h6L17 8h3v11H4z"/><circle cx="12" cy="13" r="3.4"/>',
  clock:   '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
  person:  '<circle cx="12" cy="8" r="3.5"/><path d="M5 20c1.2-3.6 4-5 7-5s5.8 1.4 7 5"/>',
  people:  '<circle cx="9" cy="8.5" r="3"/><circle cx="16.5" cy="9.5" r="2.4"/><path d="M3.5 19c.9-3 3-4.3 5.5-4.3S13.6 16 14.5 19M14.5 15c2.3-.3 4.3.8 5.5 3.5"/>',
  flame:   '<path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.3 2.2-5.1 3.6-7.4.6 1.6 1.6 2.6 2.7 3.1C11.5 7.3 12.6 4.6 15 3c-.4 2.8.7 4.7 2 6.5 1.1 1.5 1.5 3.3 1.5 5.1C18.5 18.3 15.9 21 12 21z"/>',
  scale:   '<path d="M12 4v16M5 20h14M5 8h14M5 8l-2.5 6a2.5 2.5 0 0 0 5 0zM19 8l-2.5 6a2.5 2.5 0 0 0 5 0z"/>',
  bag:     '<path d="M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2"/>',
  palette: '<path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.3 0 1.8-1 1.3-2-.6-1.2.2-2.5 1.6-2.5H17a3.5 3.5 0 0 0 3.5-3.5c0-5-3.8-9-8.5-9z"/><circle cx="8" cy="10" r="1"/><circle cx="12" cy="7.5" r="1"/><circle cx="16" cy="10" r="1"/>',
  chart:   '<path d="M4 19h16M6 15l4-4 3 3 5-6"/><path d="M15 8h3v3"/>',
  building:'<path d="M4 20h16M5 20V10l7-5 7 5v10M9 20v-5h6v5"/>',
  doc:     '<path d="M7 3h7l4 4v14H7z"/><path d="M14 3v4h4M9.5 12h6M9.5 15.5h6"/>',
  warning: '<path d="M12 4l9 16H3z"/><path d="M12 10v4.5M12 17.5v.2"/>',
  calendar:'<path d="M4.5 6.5h15v13h-15zM4.5 10.5h15M8.5 4v4M15.5 4v4"/>',
  lock:    '<path d="M6 11h12v9.5H6z"/><path d="M8.5 11V8a3.5 3.5 0 0 1 7 0v3"/>',
  key:     '<circle cx="8" cy="15" r="3.8"/><path d="M10.8 12.2L19 4M15.5 7.5l2.5 2.5M17.3 5.7l2 2"/>',
  plus:    '<path d="M12 5v14M5 12h14"/>',
  trophy:  '<path d="M8 4h8v5a4 4 0 0 1-8 0zM8 6H5a3 3 0 0 0 3 4M16 6h3a3 3 0 0 1-3 4M12 13v4M8.5 20h7"/>',
  target:  '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="4.8"/><circle cx="12" cy="12" r="1.2"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
  lab:     '<path d="M9.5 3.5h5M10.5 3.5v6l-5 9a1.5 1.5 0 0 0 1.3 2.2h10.4a1.5 1.5 0 0 0 1.3-2.2l-5-9v-6M7.5 15h9"/>',
  moon:    '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
  clipboard:'<path d="M8 5H6v16h12V5h-2M9 3.5h6V7H9zM9 12h6M9 15.5h4"/>',
  repeat:  '<path d="M4 11V9a3 3 0 0 1 3-3h12l-3-3M20 13v2a3 3 0 0 1-3 3H5l3 3"/>',
  leaf:    '<path d="M5 19c0-8 5-13.5 14-14 .2 8.5-5 14-12 14zM5 19l7-7"/>',
  pencil:  '<path d="M4 20l1-4.5L15.5 5l3.5 3.5L8.5 19zM13.5 7l3.5 3.5"/>',
  star:    '<path d="M12 3.5l2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.8l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z"/>',
  spark:   '<path d="M12 3v5M12 16v5M3 12h5M16 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3"/>',
  heart:   '<path d="M12 20s-7.5-4.5-7.5-10A4.3 4.3 0 0 1 12 7.6 4.3 4.3 0 0 1 19.5 10c0 5.5-7.5 10-7.5 10z"/>',
  home:    '<path d="M4 11l8-6.5 8 6.5M6.5 9.5V20h11V9.5"/>',
  chair:   '<path d="M7 4v9h10V4M6 13h12M7 13v7M17 13v7M7 17h10"/>',
  laptop:  '<path d="M5 6h14v9H5zM3 18.5h18"/>',
  rocket:  '<path d="M12 3c3 2 4.5 5.5 4.5 9l-2 3h-5l-2-3c0-3.5 1.5-7 4.5-9zM9.5 15l-2 4 3-1M14.5 15l2 4-3-1"/><circle cx="12" cy="9" r="1.5"/>',
  sun:     '<circle cx="12" cy="12" r="4"/><path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M18.7 5.3l-1.4 1.4M6.7 17.3l-1.4 1.4"/>',
  bell:    '<path d="M7 10a5 5 0 0 1 10 0c0 5 2 6 2 6H5s2-1 2-6zM10 19.5a2 2 0 0 0 4 0"/>',
  mirror:  '<path d="M7 3.5h10v17H7z"/><path d="M10 7l4-2M10 11l5-3"/>',
  eyeoff:  '<path d="M3 3l18 18M10.6 5.5H15L17 8h3v11h-1.5M6.5 19H4V8h2.5"/><path d="M14.3 14.8a3.4 3.4 0 0 1-4.9-4.6"/>',
  share:   '<path d="M12 15V3.5M8 7.5l4-4 4 4M5.5 12v8.5h13V12"/>',
  dot:     '<circle cx="12" cy="12" r="3.2"/>',
  chevleft:'<path d="M15 5l-7 7 7 7"/>',
  medal:   '<circle cx="12" cy="15" r="5"/><path d="M8.5 3.5l2.5 7M15.5 3.5l-2.5 7M12 13v4"/>',
  play:    '<path d="M8 5.5v13l11-6.5z"/>',
  sunrise: '<path d="M3 18h18M6.5 18a5.5 5.5 0 0 1 11 0M12 4.5V8M5 9.5l2 2M19 9.5l-2 2M8.5 21h7"/>',
  card:    '<rect x="3" y="6" width="18" height="12" rx="2.5"/><path d="M3 10h18M7 14.5h4"/>'
};

/* A colour for each kind — Apple's system palette, so the tiles sit
   together the way the Settings list does. */
var ICON_TINT={
  workout:'#FF9500', steps:'#FF375F', run:'#FF9500', food:'#34C759', water:'#0A84FF', check:'#34C759',
  gym:'#BF5AF2', bolt:'#FFCC00', measure:'#64D2FF', flag:'#FF3B30', photo:'#5E5CE6', clock:'#FF9F0A',
  person:'#8E8E93', people:'#AF52DE', flame:'#FF6B00', scale:'#30B0C7', bag:'#FF2D55', palette:'#5E5CE6',
  chart:'#0A84FF', building:'#BF5AF2', doc:'#64D2FF', warning:'#FF9F0A', calendar:'#FF3B30', lock:'#8E8E93',
  key:'#FFCC00', plus:'#34C759', trophy:'#FFCC00', target:'#FF3B30', compass:'#0A84FF', lab:'#30B0C7',
  moon:'#5E5CE6', clipboard:'#8E8E93', repeat:'#34C759', leaf:'#34C759', pencil:'#8E8E93', star:'#FFCC00',
  spark:'#FF2D55', heart:'#FF375F', home:'#0A84FF', chair:'#A2845E', laptop:'#8E8E93', rocket:'#FF6B00',
  sun:'#FF9F0A', bell:'#FF9500', mirror:'#64D2FF', share:'#0A84FF', eyeoff:'#8E8E93', dot:'#8E8E93',
  chevleft:'#8E8E93', medal:'#FF9F0A', sunrise:'#FF9500', play:'#FF3B30', card:'#30B0C7'
};
/* Tiles light enough that a white glyph would vanish get a dark one. */
var ICON_DARK_GLYPH={bolt:1, trophy:1, key:1, star:1, measure:1};

/* Every emoji the app used as an icon, and what it means. */
var EMOJI_ICON={
  '🔥':'flame','✅':'check','⚖️':'scale','⚖':'scale','🛍️':'bag','🛍':'bag','🎨':'palette','📈':'chart',
  '🏃':'run','⚡':'bolt','🏛️':'building','🏛':'building','📄':'doc','⚠️':'warning','⚠':'warning',
  '🏁':'flag','👥':'people','🔒':'lock','🔐':'lock','🗓️':'calendar','🗓':'calendar','📏':'measure',
  '🏆':'trophy','🏅':'trophy','💯':'trophy','🧭':'compass','📸':'photo','🧪':'lab','🎯':'target',
  '😌':'moon','😴':'moon','🌙':'moon','💪':'workout','🏋️':'workout','🏋':'workout','🤜':'workout',
  '⚔️':'workout','📋':'clipboard','🔁':'repeat','➕':'plus','🔑':'key','🍽️':'food','🍽':'food',
  '🎽':'workout','🧘':'leaf','🌿':'leaf','🌱':'leaf','🌸':'leaf','✦':'spark','💎':'spark','✏️':'pencil',
  '⭐':'star','🦵':'steps','🦿':'steps','🤸':'run','🪑':'chair','🔔':'bell','🏠':'home','☀️':'sun',
  '⏱️':'clock','🫀':'heart','🧴':'water','💧':'water','💦':'water','🍶':'water','🧖':'leaf','🚀':'rocket',
  '💻':'laptop','💥':'bolt','🎓':'trophy','🎒':'workout','🍑':'workout','🌋':'flame','🌀':'repeat',
  '⚙️':'workout','🙋':'person','🤝':'people','⏳':'clock','📍':'gym','👟':'steps','🥗':'food',
  '🍎':'food','🍗':'food','🍚':'food',
  '✨':'spark','❄️':'water','⬇️':'scale','⬆️':'scale','🌅':'sunrise','🌤️':'sun','🌧️':'water',
  '📷':'photo','🕺':'run','🛒':'bag','🛠️':'clipboard','🦶':'steps','🧱':'building',
  '🪞':'mirror','👤':'person','📤':'share',
  '🚶':'steps','🚴':'run','🥚':'food','🍳':'food','🚫':'warning','📊':'chart','📱':'laptop',
  '🎥':'photo','📅':'calendar','🎖️':'trophy','🎖':'trophy','✏':'pencil'
};

function iconKind(k){
  if(!k) return 'dot';
  if(ICON_PATH[k]) return k;
  var s=String(k).trim();
  return EMOJI_ICON[s] || EMOJI_ICON[s.replace(/️/g,'')] || 'dot';
}

function ic(k){
  var kind=iconKind(k);
  return '<span class="uic" style="background:'+ICON_TINT[kind]+';color:'+
         (ICON_DARK_GLYPH[kind]?'#1C1C1E':'#FFFFFF')+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+
         ICON_PATH[kind]+'</svg></span>';
}

function glyph(k){
  return '<svg class="gly" viewBox="0 0 24 24" aria-hidden="true">'+ICON_PATH[iconKind(k)]+'</svg>';
}
