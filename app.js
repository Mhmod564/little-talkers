/* ============================================================
   Little Talkers — Speech & Language Therapy Clinic (MVP)
   Vanilla JS SPA. localStorage persistence. Trilingual: he / ar / en.
   Roles: therapist (main | doctor + permissions) | parent (read-only + chat)
   ============================================================ */
(function () {
  "use strict";

  const $ = (sel, root) => (root || document).querySelector(sel);
  function $$(sel, root) { return Array.from((root || document).querySelectorAll(sel)); }

  /* ---------------- SVG icon set ---------------- */
  const I = {
    logo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M20 2H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3v4l5-4h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z"/><circle cx="9" cy="9.2" r=".7" fill="currentColor" stroke="none"/><circle cx="15" cy="9.2" r=".7" fill="currentColor" stroke="none"/><path d="M9 12c.8.9 1.9 1.3 3 1.3s2.2-.4 3-1.3"/></svg>',
    home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1V9.5z"/></svg>',
    users: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    userPlus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>',
    report: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>',
    logout: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>',
    bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>',
    check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>',
    chevDown: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>',
    arrowBack: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    edit: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.12 2.12 0 0 1 3 3L12 15l-4 1 1-4z"/></svg>',
    trash: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>',
    plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
    x: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
    user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z"/><circle cx="12" cy="12" r="3"/></svg>',
    eyeOff: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>',
    upload: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    download: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    file: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>',
    cake: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M2 21h20M3 21V10a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v11M3 14c1.5 0 1.5 1 3 1s1.5-1 3-1 1.5 1 3 1 1.5-1 3-1 1.5 1 3 1M12 8V4M12 4l1-1M12 4l-1-1"/></svg>',
    activity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
    clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
    bulb: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6M10 22h4M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.3h6c0-1 .4-1.8 1-2.3A7 7 0 0 0 12 2z"/></svg>',
    menu: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>',
    history: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v5h5"/><path d="M3.05 13A9 9 0 1 0 6 5.3L3 8"/><path d="M12 7v5l4 2"/></svg>',
    message: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
    send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
    filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>',
    stetho: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M4.8 2.3A.3.3 0 1 0 5 2a.3.3 0 0 0-.2.3"/><path d="M8 2v4a4 4 0 0 0 8 0V2"/><path d="M12 14v2a6 6 0 0 0 6 6 4 4 0 0 0 4-4v-1"/><circle cx="20" cy="10" r="2"/></svg>',
    shield: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>',
    chat: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8z"/></svg>',
    sort: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5h10M11 9h7M11 13h4M3 17l3 3 3-3M6 18V4"/></svg>',
    video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>',
    play: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor"/></svg>',
    key: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>',
    phone2: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>',
    arrowUp: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/></svg>',
  };

  /* ============================================================
     i18n
     ============================================================ */
  const LANGS = [
    { code: "he", native: "עברית", short: "עב" },
    { code: "ar", native: "العربية", short: "ع" },
    { code: "en", native: "English", short: "EN" },
  ];
  const LANG_KEY = "littletalkers.lang";
  let L = 0;

  /* dictionary: key -> [he, ar, en] */
  const S = {
    subLogin: ["מדברים קטנים", "متحدثون صغار", "Little Talkers"],
    subTher: ["לוח המטפל", "لوحة الأخصائي", "Therapist Panel"],
    subParent: ["פורטל ההורים", "بوابة أولياء الأمور", "Parents Portal"],

    heroTitle: ["טיפול מקצועי בשפה ובדיבור לילדים שלכם", "رعاية متخصّصة لنطق وتخاطب أطفالكم", "Professional speech & language care for your children"],
    heroDesc: ["פלטפורמה פשוטה שמחברת בין המטפל וההורים במקום אחד, למעקב נוח אחר התקדמות הטיפול ובשקט נפשי.", "منصة بسيطة تجمع الأخصائي وأولياء الأمور في مكان واحد لمتابعة تقدم الجلسات العلاجية بسهولة وطمأنينة.", "A simple platform that brings the therapist and parents together in one place to follow therapy progress with ease and peace of mind."],
    welcomeBack: ["ברוך שובך", "أهلاً بعودتك", "Welcome back"],
    loginSub: ["התחבר כדי להמשיך לחשבון שלך", "سجّل الدخول للمتابعة إلى حسابك", "Sign in to continue to your account"],
    roleTher: ["מטפל", "الأخصائي", "Therapist"],
    roleParent: ["הורה", "ولي الأمر", "Parent"],
    username: ["שם משתמש", "اسم المستخدم", "Username"],
    password: ["סיסמה", "كلمة المرور", "Password"],
    phUsername: ["הזן שם משתמש", "أدخل اسم المستخدم", "Enter username"],
    btnLogin: ["התחברות", "تسجيل الدخول", "Sign in"],
    demoTher: ["<b>חשבון לדוגמה למטפל:</b><br>משתמש: <b>doctor</b> — סיסמה: <b>1234</b>", "<b>حساب تجريبي للأخصائي:</b><br>المستخدم: <b>doctor</b> — كلمة المرور: <b>1234</b>", "<b>Demo therapist account:</b><br>User: <b>doctor</b> — Password: <b>1234</b>"],
    demoParent: ["<b>חשבון לדוגמה להורה:</b><br>משתמש: <b>ahmad</b> — סיסמה: <b>1234</b>", "<b>حساب تجريبي لولي الأمر:</b><br>المستخدم: <b>ahmad</b> — كلمة المرور: <b>1234</b>", "<b>Demo parent account:</b><br>User: <b>ahmad</b> — Password: <b>1234</b>"],
    errLogin: ["פרטי ההתחברות שגויים. ודא את שם המשתמש והסיסמה.", "بيانات الدخول غير صحيحة. تأكد من اسم المستخدم وكلمة المرور.", "Invalid credentials. Check your username and password."],

    nDash: ["לוח בקרה", "لوحة التحكم", "Dashboard"],
    nPatients: ["מטופלים", "المتعالجين", "Patients"],
    nSessions: ["פגישות קרובות", "الجلسات القادمة", "Upcoming Sessions"],
    nRecordings: ["הקלטות", "التسجيلات", "Recordings"],
    nReports: ["דוחות וקבצים", "التقارير والملفات", "Reports & Files"],
    nLog: ["יומן פעילות", "سجل النشاط", "Activity Log"],
    nDoctors: ["צוות מטפלים", "فريق الأطباء", "Therapists"],
    nAdd: ["הוספת מטופל", "إضافة متعالج", "Add Patient"],
    nLogout: ["התנתקות", "تسجيل الخروج", "Log out"],
    nMyChild: ["תיק הילד שלי", "ملف طفلي", "My Child"],
    nChat: ["צ׳אט עם המטפל", "محادثة المعالج", "Chat with Therapist"],

    hello: ["שלום", "مرحباً", "Hello"],
    titleProfile: ["תיק המטופל", "ملف المتعالج", "Patient File"],

    stTotal: ["סה״כ מטופלים", "إجمالي المتعالجين", "Total Patients"],
    stTotalFoot: ["כל המטופלים", "جميع المتعالجين", "All patients"],
    stUpcomingFoot: ["פגישות מתוזמנות", "جلسات مجدولة", "Scheduled"],
    stRecFoot: ["הקלטות וידאו", "تسجيلات فيديو", "Video recordings"],
    stRecEmpty: ["אין הקלטות עדיין", "لا توجد تسجيلات بعد", "No recordings yet"],
    stReportsFoot: ["קבצים שהועלו", "ملفات مرفوعة", "Uploaded files"],
    tipTitle: ["טיפ", "ملاحظة", "Tip"],
    tipText: ["אל תשכח להוסיף הערות אחרי כל פגישה כדי לעקוב אחר התקדמות המטופל.", "لا تنسَ إضافة ملاحظات بعد كل جلسة لمتابعة تقدّم المتعالج.", "Remember to add notes after each session to track the patient's progress."],

    phSearchPatient: ["חיפוש מטופל...", "ابحث عن متعالج...", "Search patient..."],
    phSearchNameDiag: ["חיפוש לפי שם או אבחנה...", "ابحث بالاسم أو التشخيص...", "Search by name or diagnosis..."],
    cName: ["שם", "الاسم", "Name"],
    cAge: ["גיל", "العمر", "Age"],
    cDiagnosis: ["אבחנה", "التشخيص", "Diagnosis"],
    cDoctor: ["מטפל אחראי", "الطبيب المعالج", "Therapist"],
    cLast: ["פגישה אחרונה", "آخر جلسة", "Last Session"],
    cProgress: ["התקדמות", "التقدم", "Progress"],
    cActions: ["פעולות", "الإجراءات", "Actions"],
    years: ["שנים", "سنوات", "yrs"],
    allDoctors: ["כל המטפלים", "كل الأطباء", "All therapists"],
    allDiag: ["כל האבחנות", "كل التشخيصات", "All diagnoses"],
    allPatients: ["כל המטופלים", "كل المتعالجين", "All patients"],
    allKinds: ["כל הסוגים", "كل الأنواع", "All types"],
    sortRecent: ["הפגישה האחרונה", "الأحدث جلسة", "Most recent"],
    sortHigh: ["התקדמות גבוהה", "الأعلى تقدماً", "Highest progress"],
    sortLow: ["התקדמות נמוכה", "الأقل تقدماً", "Lowest progress"],
    sortName: ["שם (א-ת)", "الاسم", "Name (A-Z)"],
    clear: ["ניקוי", "مسح", "Clear"],
    emptyNoPatients: ["אין מטופלים עדיין. התחל בהוספת מטופל חדש.", "لا يوجد متعالجون بعد. ابدأ بإضافة متعالج جديد.", "No patients yet. Add your first patient."],
    emptyNoMatch: ["אין תוצאות תואמות לסינון.", "لا توجد نتائج مطابقة للفلاتر.", "No results match your filters."],
    showMore: ["הצג עוד", "عرض المزيد", "Show more"],
    ttOpen: ["פתיחת תיק", "فتح الملف", "Open file"],
    ttEdit: ["עריכה", "تعديل", "Edit"],
    ttDelete: ["מחיקה", "حذف", "Delete"],
    ttDownload: ["הורדה", "تنزيل", "Download"],

    btnSchedule: ["תזמון פגישה", "جدولة جلسة", "Schedule Session"],
    emptyNoUpcoming: ["אין פגישות קרובות מתוזמנות.", "لا توجد جلسات قادمة مجدولة.", "No upcoming sessions scheduled."],
    sesPast: ["פגישות קודמות", "جلسات سابقة", "Past Sessions"],
    sesDefault: ["פגישת טיפול", "جلسة علاجية", "Therapy session"],
    phSearchSession: ["חיפוש פגישה...", "ابحث عن جلسة...", "Search session..."],

    recTitle: ["הקלטות פגישות", "تسجيلات الجلسات", "Session Recordings"],
    btnAddRec: ["הוספת הקלטה", "إضافة تسجيل", "Add Recording"],
    emptyNoRec: ["אין הקלטות עדיין. הוסף קישור לוידאו של פגישה מוקלטת.", "لا توجد تسجيلات بعد. أضف رابط فيديو لجلسة مسجلة.", "No recordings yet. Add a video link for a recorded session."],
    emptyRecMatch: ["אין הקלטות תואמות לסינון.", "لا توجد تسجيلات مطابقة.", "No recordings match your filters."],
    phSearchRec: ["חיפוש הקלטה...", "ابحث عن تسجيل...", "Search recording..."],
    recDefault: ["פגישה מוקלטת", "جلسة مسجلة", "Recorded session"],
    btnWatch: ["צפייה", "مشاهدة", "Watch"],
    recCount: ["{0} הקלטות", "{0} تسجيلات", "{0} recordings"],

    emptyNoFiles: ["אין קבצים שהועלו עדיין.", "لا توجد ملفات مرفوعة بعد.", "No files uploaded yet."],
    emptyFileMatch: ["אין קבצים תואמים לסינון.", "لا توجد ملفات مطابقة.", "No files match your filters."],
    phSearchFile: ["חיפוש קובץ...", "ابحث عن ملف...", "Search file..."],
    filesCount: ["{0} קבצים", "{0} ملفات", "{0} files"],

    emptyNoEvents: ["אין אירועים תואמים.", "لا توجد أحداث مطابقة.", "No matching events."],
    phSearchLog: ["חיפוש ביומן...", "ابحث في السجل...", "Search log..."],
    kNote: ["הערות", "ملاحظات", "Notes"],
    kProgress: ["התקדמות", "التقدم", "Progress"],
    kPlan: ["תוכניות", "الخطط", "Plans"],
    kFile: ["קבצים", "ملفات", "Files"],
    kPatient: ["מטופלים", "المتعالجين", "Patients"],
    kRemove: ["מחיקות", "حذف", "Deletions"],
    kSession: ["פגישות", "الجلسات", "Sessions"],
    kDoctor: ["מטפלים", "الأطباء", "Therapists"],
    kPerms: ["הרשאות", "الصلاحيات", "Permissions"],
    kRecording: ["הקלטות", "التسجيلات", "Recordings"],
    kMessage: ["הודעות", "الرسائل", "Messages"],

    btnAddDoctor: ["הוספת מטפל", "إضافة طبيب", "Add Therapist"],
    phSearchDoctor: ["חיפוש מטפל...", "ابحث عن طبيب...", "Search therapist..."],
    roleMain: ["ראשי", "رئيسي", "Main"],
    roleDoc: ["מטפל", "طبيب", "Therapist"],
    lblUser: ["משתמש", "المستخدم", "User"],
    unitPatients: ["מטופלים", "متعالجين", "patients"],
    permNone: ["ללא הרשאות", "بدون صلاحيات", "No permissions"],
    onlyMain: ["עמוד זה זמין למטפל הראשי בלבד.", "هذه الصفحة متاحة للطبيب الرئيسي فقط.", "This page is available to the main therapist only."],
    permViewAll: ["צפייה בכל המטופלים", "عرض جميع المتعالجين", "View all patients"],
    permManage: ["ניהול מטופלים, הערות וקבצים", "إدارة المتعالجين والملاحظات والملفات", "Manage patients, notes & files"],
    permRec: ["ניהול הקלטות", "إدارة التسجيلات", "Manage recordings"],
    permChat: ["צ׳אט עם הורים", "محادثة أولياء الأمور", "Chat with parents"],

    back: ["חזרה לרשימה", "رجوع إلى القائمة", "Back to list"],
    actChatTher: ["צ׳אט עם המטפל", "محادثة المعالج", "Chat with therapist"],
    actChat: ["צ׳אט", "محادثة", "Chat"],
    actNote: ["הערה", "ملاحظة", "Note"],
    actEditDetails: ["עריכת פרטים", "تعديل البيانات", "Edit details"],
    badgeReadonly: ["צפייה בלבד", "عرض فقط", "Read-only"],
    secInfo: ["פרטי המטופל", "بيانات المتعالج", "Patient details"],
    lblParent: ["הורה", "ولي الأمر", "Parent"],
    lblPhone: ["טלפון", "الهاتف", "Phone"],
    lblBirth: ["תאריך לידה", "تاريخ الميلاد", "Birth date"],
    lblGender: ["מין", "الجنس", "Gender"],
    secUpcoming: ["פגישות קרובות", "الجلسات القادمة", "Upcoming sessions"],
    btnScheduleShort: ["תזמון", "جدولة", "Schedule"],
    emptyUpcomingP: ["אין פגישות קרובות.", "لا توجد جلسات قادمة.", "No upcoming sessions."],
    emptyPast: ["אין פגישות קודמות.", "لا توجد جلسات سابقة.", "No past sessions."],
    secRecordings: ["הקלטות פגישות", "تسجيلات الجلسات", "Session recordings"],
    btnAdd: ["הוספה", "إضافة", "Add"],
    emptyRecP: ["אין הקלטות עדיין.", "لا توجد تسجيلات بعد.", "No recordings yet."],
    secNotes: ["הערות פגישות", "ملاحظات الجلسات", "Session notes"],
    emptyNotes: ["אין הערות עדיין.", "لا توجد ملاحظات بعد.", "No notes yet."],
    secProgress: ["אחוז התקדמות", "نسبة التقدم", "Progress"],
    progressLbl: ["מתוך יעד הטיפול", "من خطة العلاج المستهدفة", "of the therapy goal"],
    secPlan: ["תוכנית הטיפול הבאה", "خطة العلاج القادمة", "Next therapy plan"],
    emptyPlan: ["טרם נוספה תוכנית טיפול.", "لم تتم إضافة خطة علاجية بعد.", "No therapy plan added yet."],
    secFiles: ["קבצים ודוחות", "الملفات والتقارير", "Files & reports"],
    btnUpload: ["העלאה", "رفع", "Upload"],
    emptyFilesP: ["אין קבצים שהועלו.", "لا توجد ملفات مرفوعة.", "No files uploaded."],
    secParentAcc: ["חשבון ההורה", "حساب ولي الأمر", "Parent account"],
    lastSessionLbl: ["פגישה אחרונה", "آخر جلسة", "Last session"],

    gMale: ["זכר", "ذكر", "Male"],
    gFemale: ["נקבה", "أنثى", "Female"],

    mEditPatient: ["עריכת פרטי מטופל", "تعديل بيانات المتعالج", "Edit patient"],
    mAddPatient: ["הוספת מטופל חדש", "إضافة متعالج جديد", "Add new patient"],
    fFullName: ["שם מלא", "الاسم الكامل", "Full name"],
    phName: ["לדוגמה: אחמד ח׳אלד", "مثال: أحمد خالد", "e.g. Ahmad Khaled"],
    fGuardian: ["שם ההורה", "اسم ولي الأمر", "Parent name"],
    fBirth: ["תאריך לידה", "تاريخ الميلاد", "Birth date"],
    phDiagnosis: ["לדוגמה: עיכוב בדיבור", "مثال: تأخر في النطق", "e.g. Speech delay"],
    secParentLogin: ["פרטי התחברות להורה", "بيانات دخول ولي الأمر", "Parent login details"],
    btnSaveChanges: ["שמירת שינויים", "حفظ التعديلات", "Save changes"],
    btnAddPatient2: ["הוספת מטופל", "إضافة المتعالج", "Add patient"],
    cancel: ["ביטול", "إلغاء", "Cancel"],
    errParentUserExists: ["שם המשתמש של ההורה כבר קיים", "اسم مستخدم ولي الأمر مستخدم مسبقاً", "Parent username already exists"],

    mNote: ["הערת פגישה חדשה", "ملاحظة جلسة جديدة", "New session note"],
    fSessionDate: ["תאריך הפגישה", "تاريخ الجلسة", "Session date"],
    fNote: ["הערה", "الملاحظة", "Note"],
    phNote: ["כתוב את הערות הפגישה והתקדמות המטופל...", "اكتب ملاحظات الجلسة وتقدّم المتعالج...", "Write session notes and the patient's progress..."],
    btnSaveNote: ["שמירת הערה", "حفظ الملاحظة", "Save note"],

    mProgress: ["עדכון אחוז התקדמות", "تحديث نسبة التقدم", "Update progress"],
    fProgressPct: ["אחוז התקדמות", "نسبة التقدم", "Progress percentage"],
    save: ["שמירה", "حفظ", "Save"],

    mPlan: ["תוכנית הטיפול הבאה", "خطة العلاج القادمة", "Next therapy plan"],
    fPlanLabel: ["כתוב את תוכנית הטיפול לשלב הבא", "اكتب الخطة العلاجية للمرحلة القادمة", "Write the next-stage therapy plan"],
    phPlan: ["מטרות הפגישות הבאות ותרגילי בית...", "أهداف الجلسات القادمة والتمارين المنزلية...", "Goals for upcoming sessions and home exercises..."],
    btnSavePlan: ["שמירת התוכנית", "حفظ الخطة", "Save plan"],

    mEditSession: ["עריכת פגישה", "تعديل الجلسة", "Edit session"],
    mAddSession: ["תזמון פגישה קרובה", "جدولة جلسة قادمة", "Schedule session"],
    fPatient: ["מטופל", "المتعالج", "Patient"],
    fDate: ["תאריך", "التاريخ", "Date"],
    fTime: ["שעה", "الوقت", "Time"],
    fSessionTitle: ["כותרת / מטרת הפגישה", "عنوان / هدف الجلسة", "Session title / goal"],
    phSessionTitle: ["לדוגמה: תרגול העיצור ר׳", "مثال: تمرين حرف الراء", "e.g. Practice the R sound"],

    mAddRec: ["הוספת הקלטה", "إضافة تسجيل", "Add recording"],
    fTitle: ["כותרת", "العنوان", "Title"],
    phRecTitle: ["לדוגמה: פגישה 12", "مثال: الجلسة 12", "e.g. Session 12"],
    fVideoLink: ["קישור לוידאו", "رابط الفيديو", "Video link"],
    recHint: ["הדבק קישור לוידאו (YouTube, Drive, Vimeo וכו׳). ההורה יוכל לצפות בהקלטה מתוך התיק.", "الصق رابط فيديو (YouTube, Drive, Vimeo). يمكن لولي الأمر مشاهدة التسجيل من الملف.", "Paste a video link (YouTube, Drive, Vimeo). The parent can watch it from the file."],

    mUpload: ["העלאת קובץ או דוח", "رفع ملف أو تقرير", "Upload file or report"],
    dzTitle: ["בחר קובץ להעלאה", "اختر ملفاً للرفع", "Choose a file to upload"],
    dzSub: ["PDF, תמונה או מסמך — עד 5MB", "PDF أو صورة أو مستند — حتى 5 ميجابايت", "PDF, image or document — up to 5MB"],
    btnUploadFile: ["העלאת קובץ", "رفع الملف", "Upload file"],
    fileTooBig: ["הקובץ גדול מדי, נשמר השם בלבד", "الملف كبير جداً، تم حفظ الاسم فقط", "File too large; only the name was saved"],

    mEditDoctor: ["עריכת מטפל", "تعديل الطبيب", "Edit therapist"],
    mAddDoctor: ["הוספת מטפל חדש", "إضافة طبيب جديد", "Add new therapist"],
    fDocName: ["שם", "الاسم", "Name"],
    phDocName: ["לדוגמה: ד״ר מאיה לוי", "مثال: د. منى أحمد", "e.g. Dr. Maya Levi"],
    fTitleRole: ["תפקיד / התמחות", "التخصص / اللقب", "Role / specialty"],
    phTitleRole: ["קלינאי תקשורת", "أخصائي تخاطب", "Speech therapist"],
    secPerms: ["הרשאות", "الصلاحيات", "Permissions"],
    mainAllPerms: ["למטפל הראשי יש את כל ההרשאות.", "الطبيب الرئيسي يملك كل الصلاحيات.", "The main therapist has all permissions."],
    btnCreateAcc: ["יצירת חשבון", "إنشاء الحساب", "Create account"],
    errUserExists: ["שם המשתמש כבר קיים", "اسم المستخدم مستخدم مسبقاً", "Username already exists"],

    mEditBasic: ["עריכת פרטים בסיסיים", "تعديل البيانات الأساسية", "Edit basic details"],
    fChildName: ["שם הילד", "اسم الطفل", "Child's name"],
    fPhoneNum: ["מספר טלפון", "رقم الهاتف", "Phone number"],
    parentEditHint: ["ניתן לעדכן כאן את הפרטים הבסיסיים בלבד. שאר המידע הטיפולי מנוהל על ידי המטפל.", "يمكنك تحديث البيانات الأساسية فقط. باقي المعلومات العلاجية يديرها المعالج.", "You can update basic details only. Therapeutic information is managed by the therapist."],

    confirmYes: ["כן, מחק", "نعم، احذف", "Yes, delete"],
    confirm: ["אישור", "تأكيد", "Confirm"],
    delPatientTitle: ["מחיקת מטופל", "حذف المتعالج", "Delete patient"],
    delPatientMsg: ['התיק של "{0}" יימחק לצמיתות יחד עם כל ההערות והקבצים. לא ניתן לבטל.', 'سيتم حذف ملف "{0}" نهائياً مع جميع الملاحظات والملفات. لا يمكن التراجع.', '"{0}"\'s file will be permanently deleted with all notes and files. This cannot be undone.'],
    delDoctorTitle: ["מחיקת מטפל", "حذف الطبيب", "Delete therapist"],
    delDoctorMsgCount: ["למטפל זה {0} מטופלים, והם יועברו למטפל הראשי.", "لدى هذا الطبيب {0} متعالجين وسيتم نقلهم للطبيب الرئيسي.", "This therapist has {0} patients; they'll be moved to the main therapist."],
    delDoctorMsg: ['חשבון "{0}" יימחק.', 'سيتم حذف حساب "{0}".', 'Account "{0}" will be deleted.'],

    chSubDoctor: ["הורה של {0}", "ولي أمر {0}", "Parent of {0}"],
    chSubParent: ["המטפל שלך", "المعالج", "Your therapist"],
    chPlaceholder: ["כתוב הודעה...", "اكتب رسالة...", "Type a message..."],
    chEmpty: ["אין הודעות עדיין. שלח את ההודעה הראשונה.", "لا توجد رسائل بعد. أرسل أول رسالة.", "No messages yet. Send the first message."],
    inboxTitle: ["הודעות מהורים", "رسائل أولياء الأمور", "Messages from parents"],
    inboxEmpty: ["אין עדיין שיחות עם הורים.", "لا توجد محادثات بعد.", "No conversations with parents yet."],
    close: ["סגירה", "إغلاق", "Close"],

    tSaved: ["השינויים נשמרו", "تم حفظ التعديلات", "Changes saved"],
    tPatientAdded: ["המטופל נוסף בהצלחה", "تمت إضافة المتعالج بنجاح", "Patient added"],
    tNoteAdded: ["ההערה נוספה", "تمت إضافة الملاحظة", "Note added"],
    tNoteDeleted: ["ההערה נמחקה", "تم حذف الملاحظة", "Note deleted"],
    tProgressUpdated: ["ההתקדמות עודכנה", "تم تحديث التقدم", "Progress updated"],
    tPlanSaved: ["התוכנית נשמרה", "تم حفظ الخطة", "Plan saved"],
    tSessionSaved: ["הפגישה נשמרה", "تم حفظ الجلسة", "Session saved"],
    tSessionDeleted: ["הפגישה נמחקה", "تم حذف الجلسة", "Session deleted"],
    tRecAdded: ["ההקלטה נוספה", "تمت إضافة التسجيل", "Recording added"],
    tRecDeleted: ["ההקלטה נמחקה", "تم حذف التسجيل", "Recording deleted"],
    tFileUploaded: ["הקובץ הועלה", "تم رفع الملف", "File uploaded"],
    tFileDeleted: ["הקובץ נמחק", "تم حذف الملف", "File deleted"],
    tPatientDeleted: ["המטופל נמחק", "تم حذف المتعالج", "Patient deleted"],
    tDoctorCreated: ["חשבון המטפל נוצר", "تم إنشاء حساب الطبيب", "Therapist account created"],
    tDoctorUpdated: ["פרטי המטפל עודכנו", "تم تحديث بيانات الطبيب", "Therapist updated"],
    tDoctorDeleted: ["המטפל נמחק", "تم حذف الطبيب", "Therapist deleted"],
    tDetailsUpdated: ["הפרטים עודכנו", "تم تحديث البيانات", "Details updated"],
    tDownloading: ["מוריד את {0}", "جارٍ تنزيل {0}", "Downloading {0}"],

    aAddPatient: ["הוסיף מטופל חדש", "أضاف متعالجاً جديداً", "added a new patient"],
    aEditPatient: ["עדכן פרטי מטופל", "عدّل بيانات المتعالج", "updated patient details"],
    aDelPatient: ["מחק את תיק המטופל", "حذف ملف المتعالج", "deleted the patient file"],
    aAddNote: ["הוסיף הערת פגישה", "أضاف ملاحظة جلسة", "added a session note"],
    aDelNote: ["מחק הערת פגישה", "حذف ملاحظة جلسة", "deleted a session note"],
    aProgress: ["עדכן את ההתקדמות ל-{0}%", "حدّث التقدم إلى {0}%", "updated progress to {0}%"],
    aPlan: ["עדכן את תוכנית הטיפול", "حدّث خطة العلاج", "updated the therapy plan"],
    aUpload: ["העלה קובץ", "رفع ملفاً", "uploaded a file"],
    aDelFile: ["מחק קובץ", "حذف ملفاً", "deleted a file"],
    aSchedule: ["תזמן פגישה קרובה", "جدول جلسة قادمة", "scheduled an upcoming session"],
    aEditSession: ["עדכן פגישה קרובה", "عدّل جلسة قادمة", "updated an upcoming session"],
    aDelSession: ["ביטל פגישה קרובה", "ألغى جلسة قادمة", "canceled an upcoming session"],
    aAddRec: ["הוסיף הקלטה", "أضاف تسجيلاً", "added a recording"],
    aDelRec: ["מחק הקלטה", "حذف تسجيلاً", "deleted a recording"],
    aCreateDoc: ["יצר חשבון מטפל: {0}", "أنشأ حساب طبيب: {0}", "created therapist account: {0}"],
    aEditDoc: ["עדכן פרטי/הרשאות מטפל: {0}", "عدّل بيانات/صلاحيات طبيب: {0}", "updated therapist/permissions: {0}"],
    aDelDoc: ["מחק חשבון מטפל: {0}", "حذف حساب طبيب: {0}", "deleted therapist account: {0}"],
    aParentEdit: ["עדכן פרטי פרופיל בסיסיים", "عدّل البيانات الأساسية", "updated basic profile details"],
    aChatMsg: ["שלח הודעה בצ׳אט", "أرسل رسالة في المحادثة", "sent a chat message"],
    parentOf: ["הורה של {0}", "ولي أمر {0}", "parent of {0}"],
    sysName: ["המערכת", "النظام", "System"],

    changePhoto: ["שינוי תמונה", "تغيير الصورة", "Change photo"],
    imgTooBig: ["התמונה גדולה מדי (עד 2MB)", "الصورة كبيرة جداً (حتى 2MB)", "Image too large (max 2MB)"],
    photoUpdated: ["התמונה עודכנה", "تم تحديث الصورة", "Photo updated"],
    nMyProfile: ["הפרופיל שלי", "ملفي الشخصي", "My Profile"],
    nRemoved: ["מטופלים שהוסרו", "المتعالجون المحذوفون", "Removed Patients"],
    badgeParent: ["אזור ההורה", "منطقة ولي الأمر", "Parent area"],
    meetTherapist: ["הכרת המטפל", "تعرّف على المعالج", "Meet your therapist"],
    docProfileTitle: ["פרופיל המטפל", "ملف المعالج", "Therapist Profile"],
    bioLabel: ["קצת עליי / המסע המקצועי שלי", "نبذة عني / مسيرتي المهنية", "About me / my journey"],
    phBio: ["ספר על ההכשרה, הניסיון והגישה הטיפולית שלך...", "اكتب عن تدريبك وخبرتك ونهجك العلاجي...", "Share your training, experience and approach..."],
    noBio: ["טרם נוספו פרטים על המטפל.", "لم تتم إضافة تفاصيل عن المعالج بعد.", "No therapist details added yet."],
    myProfileEdit: ["עריכת הפרופיל שלי", "تعديل ملفي", "Edit my profile"],
    saveProfile: ["שמירת פרופיל", "حفظ الملف", "Save profile"],
    tProfileSaved: ["הפרופיל נשמר", "تم حفظ الملف", "Profile saved"],
    restore: ["שחזור", "استعادة", "Restore"],
    deleteForever: ["מחיקה לצמיתות", "حذف نهائي", "Delete forever"],
    emptyRemoved: ["אין מטופלים שהוסרו.", "لا يوجد متعالجون محذوفون.", "No removed patients."],
    tRestored: ["המטופל שוחזר", "تمت استعادة المتعالج", "Patient restored"],
    tArchived: ["המטופל הועבר לרשימת המוסרים", "تم نقل المتعالج للمحذوفين", "Patient moved to removed list"],
    archiveTitle: ["הסרת מטופל", "إزالة المتعالج", "Remove patient"],
    archiveMsg: ['המטופל "{0}" יועבר לרשימת המוסרים. ניתן לשחזר אותו בכל עת.', 'سيتم نقل المتعالج "{0}" إلى قائمة المحذوفين. يمكن استعادته في أي وقت.', '"{0}" will be moved to the removed list. You can restore it anytime.'],
    delForeverTitle: ["מחיקה לצמיתות", "حذف نهائي", "Delete permanently"],
    delForeverMsg: ['התיק של "{0}" יימחק לצמיתות. לא ניתן לשחזר.', 'سيتم حذف ملف "{0}" نهائياً. لا يمكن استعادته.', '"{0}"\'s file will be permanently deleted and cannot be restored.'],
    removedOn: ["הוסר בתאריך", "أُزيل بتاريخ", "Removed on"],
    chatLogLabel: ["צ׳אט", "محادثة", "Chat"],

    permNotes: ["ניהול הערות", "إدارة الملاحظات", "Manage notes"],
    permSessions: ["ניהול פגישות", "إدارة الجلسات", "Manage sessions"],
    permFiles: ["ניהול קבצים", "إدارة الملفات", "Manage files"],
    permReports: ["צפייה בדוחות", "عرض التقارير", "View reports"],
    permLog: ["צפייה ביומן", "عرض السجل", "View log"],

    aLogin: ["התחבר/ה למערכת", "سجّل الدخول", "logged in"],
    aPhoto: ["עדכן/ה תמונת פרופיל", "حدّث صورة الملف", "updated profile photo"],
    aWatchRec: ["צפה/תה בהקלטה", "شاهد التسجيل", "watched a recording"],

    darkOn: ["מצב כהה", "الوضع الليلي", "Dark mode"],
    darkOff: ["מצב בהיר", "الوضع النهاري", "Light mode"],
    toTop: ["חזרה למעלה", "العودة للأعلى", "Back to top"],
    goHome: ["לדף הבית", "للصفحة الرئيسية", "Home"],

    removedDoctors: ["מטפלים שהוסרו", "الأطباء المحذوفون", "Removed therapists"],
    tDoctorRestored: ["המטפל שוחזר", "تمت استعادة الطبيب", "Therapist restored"],
    aRestoreDoc: ["שחזר חשבון מטפל: {0}", "استعاد حساب طبيب: {0}", "restored therapist account: {0}"],
    idleLogout: ["נותקת אוטומטית עקב חוסר פעילות (5 דקות). אנא התחבר/י שוב.", "تم تسجيل خروجك تلقائياً بسبب عدم النشاط (5 دقائق). يرجى تسجيل الدخول مجدداً.", "You were signed out due to inactivity (5 minutes). Please sign in again."],

    sessionDetails: ["פרטי הפגישה", "تفاصيل الجلسة", "Session details"],
    sessionSummary: ["סיכום הפגישה", "ملخص الجلسة", "Session summary"],
    writeSummaryTitle: ["הפגישה הסתיימה — כתיבת סיכום", "انتهت الجلسة — كتابة الملخص", "Session ended — write a summary"],
    writeSummaryHint: ["הפגישה הסתיימה. כתוב מה בוצע בפגישה והערות למעקב.", "انتهت الجلسة. اكتب ما تم في الجلسة وملاحظات للمتابعة.", "The session has ended. Note what was covered and any follow-up."],
    phSummary: ["מה בוצע בפגישה, התקדמות, והמלצות להמשך...", "ما تم في الجلسة، التقدم، وتوصيات للمتابعة...", "What was covered, progress, and recommendations..."],
    btnOk: ["אישור", "موافق", "OK"],
    later: ["מאוחר יותר", "لاحقاً", "Later"],
    statusUpcoming: ["מתוכננת", "مجدولة", "Scheduled"],
    statusDone: ["הושלמה", "مكتملة", "Completed"],
    statusPending: ["ממתינה לסיכום", "بانتظار الملخص", "Awaiting summary"],
    needsSummary: ["נדרש סיכום", "يتطلب ملخصاً", "Needs summary"],
    noSummary: ["לא נכתב סיכום לפגישה זו.", "لم يُكتب ملخص لهذه الجلسة.", "No summary written for this session yet."],
    goToPatient: ["מעבר לתיק המטופל", "الانتقال لملف المتعالج", "Go to patient file"],
    writeSummaryBtn: ["כתיבת סיכום", "كتابة ملخص", "Write summary"],
    aSummary: ["כתב/ה סיכום פגישה", "كتب ملخص جلسة", "wrote a session summary"],
    tSummarySaved: ["הסיכום נשמר", "تم حفظ الملخص", "Summary saved"],
  };

  const t = (k) => { const e = S[k]; return e ? e[L] : k; };
  const ti = (k, v) => t(k).replace("{0}", v);
  const loc = () => ["he-IL", "ar-EG", "en-US"][L];

  function applyLangAttrs() {
    const code = LANGS[L].code;
    document.documentElement.lang = code;
    document.documentElement.dir = code === "en" ? "ltr" : "rtl";
  }
  function setLang(i) { L = i; try { localStorage.setItem(LANG_KEY, String(i)); } catch (e) {} render(); }

  function LangSwitcher() {
    return `<div class="lang-switch">
      <button class="lang-btn" data-lang-toggle>${I.globe}<span>${LANGS[L].short}</span></button>
      <div class="lang-menu" data-lang-menu hidden>
        ${LANGS.map((lg, i) => `<button data-setlang="${i}" class="${i === L ? "on" : ""}">${lg.native}</button>`).join("")}
      </div>
    </div>`;
  }
  function bindLangSwitch() {
    $$("[data-lang-toggle]").forEach((btn) => btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const menu = btn.parentElement.querySelector("[data-lang-menu]");
      const isOpen = !menu.hasAttribute("hidden");
      $$("[data-lang-menu]").forEach((m) => m.setAttribute("hidden", ""));
      if (isOpen) return;
      menu.removeAttribute("hidden");
      const onDoc = (ev) => { if (!btn.parentElement.contains(ev.target)) { menu.setAttribute("hidden", ""); document.removeEventListener("click", onDoc); } };
      setTimeout(() => document.addEventListener("click", onDoc), 0);
    }));
    $$("[data-setlang]").forEach((b) => b.addEventListener("click", () => setLang(+b.dataset.setlang)));
    $$("[data-theme-toggle]").forEach((b) => b.addEventListener("click", toggleTheme));
    $$("[data-home]").forEach((b) => b.addEventListener("click", goHome));
  }

  /* ---- dark mode ---- */
  const THEME_KEY = "littletalkers.theme";
  let dark = false;
  function applyTheme() { document.documentElement.classList.toggle("dark", dark); }
  function toggleTheme() { dark = !dark; try { localStorage.setItem(THEME_KEY, dark ? "1" : "0"); } catch (e) {} applyTheme(); render(); }
  function ThemeBtn() { return `<button class="icon-btn" data-theme-toggle title="${dark ? t("darkOff") : t("darkOn")}">${dark ? I.sun : I.moon}</button>`; }
  function ThemeNavItem() { return `<button class="nav-item" data-theme-toggle>${dark ? I.sun : I.moon}<span>${dark ? t("darkOff") : t("darkOn")}</span></button>`; }

  function goHome() {
    const s = getSession(); state.navOpen = false;
    if (s && s.role === "therapist") { state.route = "dashboard"; state.patientId = null; }
    render();
  }

  /* ---------------- Utilities ---------------- */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const initials = (name) => {
    const p = String(name).replace(/^(ד[״"'.]?ר[׳'.]?|د\.?|dr\.?)\s+/i, "").trim().split(/\s+/);
    return ((p[0] || "")[0] || "") + ((p[1] || "")[0] || "");
  };
  const avaClass = (id) => "ava-c" + (Math.abs(hashStr(id)) % 5);
  function hashStr(s) { let h = 0; for (let i = 0; i < String(s).length; i++) h = (h << 5) - h + s.charCodeAt(i); return h; }
  const today = () => new Date().toISOString().slice(0, 10);
  const isUpcoming = (d) => d >= today();
  /* session timing (date + time aware) */
  const sessionDT = (s) => new Date((s.date || "1970-01-01") + "T" + (/^\d{1,2}:\d{2}/.test(s.time || "") ? s.time : "23:59"));
  const sessionUpcoming = (s) => sessionDT(s).getTime() >= Date.now();
  const sessionPending = (s) => !sessionUpcoming(s) && !s.summary; // ended but not summarized
  const genderText = (v) => v === "זכר" ? t("gMale") : v === "נקבה" ? t("gFemale") : (v || "—");
  /* avatar markup: photo if uploaded, else colored initials */
  function ava(entity, size) {
    if (!entity) return `<div class="ava ${size}"></div>`;
    if (entity.avatar) return `<div class="ava ${size} has-img" style="background-image:url('${entity.avatar}')"></div>`;
    return `<div class="ava ${size} ${avaClass(entity.id)}">${esc(initials(entity.name))}</div>`;
  }
  function avaEditable(entity, size, type) {
    return `<div class="ava-wrap">${ava(entity, size)}<button class="ava-cam" data-avatar-upload="${type}|${entity.id}" title="${t("changePhoto")}">${I.camera}</button></div>`;
  }
  const req = (label) => `${label} <span class="req">*</span>`;
  function fmtDate(d) { if (!d) return "—"; try { return new Intl.DateTimeFormat(loc(), { year: "numeric", month: "long", day: "numeric" }).format(new Date(d)); } catch (e) { return d; } }
  function fmtDateTime(ts) { if (!ts) return "—"; try { return new Intl.DateTimeFormat(loc(), { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(ts)); } catch (e) { return ts; } }
  function fmtTime(ts) { try { return new Intl.DateTimeFormat(loc(), { hour: "2-digit", minute: "2-digit" }).format(new Date(ts)); } catch (e) { return ""; } }
  const monthShort = (d) => { try { return new Intl.DateTimeFormat(loc(), { month: "short" }).format(new Date(d)); } catch (e) { return ""; } };
  function fmtSize(b) { if (b == null) return ""; if (b < 1024) return b + " B"; if (b < 1048576) return (b / 1024).toFixed(1) + " KB"; return (b / 1048576).toFixed(1) + " MB"; }

  /* ============================================================
     Data store (localStorage)  — schema v3
     ============================================================ */
  const DB_KEY = "littletalkers.db.v3";
  const SESSION_KEY = "littletalkers.session.v3";
  const ALL_PERMS = ["viewAll", "managePatients", "manageNotes", "manageSessions", "manageFiles", "manageRecordings", "chat", "viewReports", "viewLog"];
  const fullPerms = () => { const o = {}; ALL_PERMS.forEach((k) => o[k] = true); return o; };
  const PERM_KEY = { viewAll: "permViewAll", managePatients: "permManage", manageNotes: "permNotes", manageSessions: "permSessions", manageFiles: "permFiles", manageRecordings: "permRec", chat: "permChat", viewReports: "permReports", viewLog: "permLog" };

  function seed() {
    const doctors = [
      { id: "d-main", username: "doctor", password: "1234", name: "ד״ר שרה מזרחי", title: "קלינאית תקשורת", role: "main", permissions: fullPerms() },
      { id: "d-2", username: "khaled", password: "1234", name: "ד״ר דוד כהן", title: "קלינאי תקשורת", role: "doctor", permissions: fullPerms() },
    ];
    const patients = [
      mkPatient({
        name: "אחמד ח׳אלד", age: 7, gender: "זכר", birthDate: "2018-09-12", guardian: "ח׳אלד עבדאללה", phone: "0501234567",
        diagnosis: "עיכוב בדיבור", progress: 65, lastSession: "2024-05-20", doctorId: "d-main",
        parentUsername: "ahmad", parentPassword: "1234",
        plan: "התמקדות בהגיית העיצור ר׳ דרך תרגול מול המראה, וחזרה על כרטיסיות מילים בבית שלוש פעמים בשבוע.",
        notes: [
          { id: uid(), date: "2024-05-20", text: "שיפור ניכר בהגיית מילים קצרות. תגובה טובה לתרגילים החדשים ומעורבות חיובית בפגישה." },
          { id: uid(), date: "2024-05-13", text: "התחלנו תרגול מוצא העיצור ר׳. נדרשת חזרה נוספת בבית." },
        ],
        sessions: [
          { id: uid(), date: "2026-06-28", time: "10:00", title: "תרגול העיצור ר׳ מול המראה" },
          { id: uid(), date: "2026-07-05", time: "10:00", title: "חזרה על כרטיסיות מילים" },
        ],
        files: [{ id: uid(), name: "דוח_הערכה_ראשוני.pdf", size: 248000, date: "2024-05-06" }],
        recordings: [],
        chat: [{ id: uid(), ts: new Date(Date.now() - 3 * 3600 * 1000).toISOString(), from: "parent", senderName: "ח׳אלד עבדאללה", text: "שלום ד״ר, אחמד תרגל היטב בבית השבוע.", read: false }],
      }),
      mkPatient({
        name: "ליאן מוחמד", age: 5, gender: "נקבה", birthDate: "2020-11-03", guardian: "מוחמד סעיד", phone: "0559876543",
        diagnosis: "הפרעה במוצא עיצורים", progress: 40, lastSession: "2024-05-18", doctorId: "d-2",
        parentUsername: "layan", parentPassword: "1234",
        plan: "תרגילי חיזוק שרירי הפה, וחזרה על צלילי העיצורים (ס, שׁ, ת) עם ההורים כל יום עשר דקות.",
        notes: [{ id: uid(), date: "2024-05-18", text: "שולטת טוב יותר בהגיית העיצור ס. עדיין מבלבלת לעיתים בין ס ל-שׁ." }],
        sessions: [{ id: uid(), date: "2026-06-27", time: "11:30", title: "חיזוק שרירי הפה" }],
        files: [], recordings: [], chat: [],
      }),
      mkPatient({
        name: "סלים מחמוד", age: 6, gender: "זכר", birthDate: "2019-07-21", guardian: "מחמוד פהד", phone: "0533219876",
        diagnosis: "גמגום", progress: 30, lastSession: "2024-05-17", doctorId: "d-main",
        parentUsername: "saleem", parentPassword: "1234",
        plan: "יישום טכניקת דיבור איטי, תרגילי נשימה לפני תחילת הדיבור, והפחתת לחץ בזמן תקשורת בבית.",
        notes: [{ id: uid(), date: "2024-05-17", text: "שיפור קל בשטף הדיבור בעת שימוש בטכניקת הנשימה. זקוק לסביבה שקטה לתרגול." }],
        sessions: [{ id: uid(), date: "2026-06-30", time: "09:00", title: "תרגילי נשימה וטכניקת דיבור איטי" }],
        files: [], recordings: [], chat: [],
      }),
      mkPatient({
        name: "נור עלי", age: 4, gender: "נקבה", birthDate: "2021-04-15", guardian: "עלי חסן", phone: "0567452310",
        diagnosis: "קושי בתקשורת", progress: 50, lastSession: "2024-05-15", doctorId: "d-2",
        parentUsername: "noor", parentPassword: "1234",
        plan: "עידוד קשר עין ומשחק אינטראקטיבי, ושימוש בכרטיסיות מצוירות להרחבת אוצר המילים.",
        notes: [{ id: uid(), date: "2024-05-15", text: "מעורבות טובה יותר עם הכרטיסיות המצוירות והתחילה להצביע על צרכיה. קשר עין הולך וגובר." }],
        sessions: [{ id: uid(), date: "2026-07-02", time: "12:00", title: "פגישת כרטיסיות מצוירות אינטראקטיבית" }],
        files: [], recordings: [], chat: [],
      }),
    ];
    const logs = [
      { id: uid(), ts: "2024-05-20T10:30:00", doctorId: "d-main", doctorName: "ד״ר שרה מזרחי", action: "הוסיפה הערת פגישה", patientName: "אחמד ח׳אלד", patientId: patients[0].id, kind: "note" },
      { id: uid(), ts: "2024-05-18T09:15:00", doctorId: "d-2", doctorName: "ד״ר דוד כהן", action: "עדכן את אחוז ההתקדמות", patientName: "ליאן מוחמד", patientId: patients[1].id, kind: "progress" },
    ];
    return { doctors, patients, logs };
  }

  function mkPatient(p) {
    return Object.assign({ id: uid(), notes: [], files: [], sessions: [], recordings: [], chat: [], plan: "", birthDate: "", doctorId: "d-main" }, p);
  }

  let DB;
  function loadDB() {
    try { const raw = localStorage.getItem(DB_KEY); if (raw) { DB = JSON.parse(raw); normalize(); return; } } catch (e) {}
    DB = seed(); saveDB();
  }
  function normalize() {
    DB.doctors = DB.doctors || []; DB.patients = DB.patients || []; DB.logs = DB.logs || [];
    DB.doctors.forEach((d) => { if (!d.permissions) d.permissions = fullPerms(); ALL_PERMS.forEach((k) => { if (d.permissions[k] == null) d.permissions[k] = true; }); if (d.avatar == null) d.avatar = ""; if (d.bio == null) d.bio = ""; if (d.phone == null) d.phone = ""; if (d.age == null) d.age = ""; if (d.removed == null) d.removed = false; });
    DB.patients.forEach((p) => { p.recordings = p.recordings || []; p.chat = p.chat || []; p.sessions = p.sessions || []; p.files = p.files || []; p.notes = p.notes || []; if (p.avatar == null) p.avatar = ""; if (p.removed == null) p.removed = false; });
  }
  /* chat resets every 24h — older messages already live in the activity log */
  function pruneChats() {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    let changed = false;
    DB.patients.forEach((p) => {
      const before = p.chat.length;
      p.chat = p.chat.filter((m) => { const ts = Date.parse(m.ts); return isNaN(ts) || ts >= cutoff; });
      if (p.chat.length !== before) changed = true;
    });
    if (changed) saveDB();
  }
  function saveDB() { try { localStorage.setItem(DB_KEY, JSON.stringify(DB)); } catch (e) {} }
  function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; } }
  function setSession(s) { if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s)); else localStorage.removeItem(SESSION_KEY); }

  const getPatient = (id) => DB.patients.find((p) => p.id === id);
  const getDoctor = (id) => DB.doctors.find((d) => d.id === id);
  const activeDoctors = () => DB.doctors.filter((d) => !d.removed);
  const currentDoctor = () => { const s = getSession(); return s && s.role === "therapist" ? getDoctor(s.doctorId) : null; };
  const doctorName = (id) => { const d = getDoctor(id); return d ? d.name : "—"; };

  function can(perm) { const d = currentDoctor(); if (!d) return false; if (d.role === "main") return true; return !!(d.permissions && d.permissions[perm]); }
  const activePatients = () => DB.patients.filter((p) => !p.removed);
  function visiblePatients() { const d = currentDoctor(); const base = activePatients(); if (!d) return base; if (d.role === "main" || (d.permissions && d.permissions.viewAll)) return base; return base.filter((p) => p.doctorId === d.id); }
  function removedPatients() { const d = currentDoctor(); const base = DB.patients.filter((p) => p.removed); if (!d || d.role === "main" || (d.permissions && d.permissions.viewAll)) return base; return base.filter((p) => p.doctorId === d.id); }

  function logEvent(action, opts) {
    opts = opts || {};
    const doc = opts.doctor || currentDoctor();
    DB.logs.unshift({ id: uid(), ts: new Date().toISOString(), doctorId: doc ? doc.id : null,
      doctorName: opts.actorName || (doc ? doc.name : t("sysName")), action: action,
      patientName: opts.patientName || "", patientId: opts.patientId || null, kind: opts.kind || "info" });
    if (DB.logs.length > 500) DB.logs.length = 500;
  }

  const myChatPatients = () => { const d = currentDoctor(); if (!d) return []; return DB.patients.filter((p) => !p.removed && p.doctorId === d.id); };
  const doctorUnread = () => myChatPatients().reduce((n, p) => n + p.chat.filter((m) => m.from === "parent" && !m.read).length, 0);
  const parentUnread = (p) => p.chat.filter((m) => m.from === "doctor" && !m.read).length;

  /* ---------------- App state ---------------- */
  const freshState = () => ({ route: "login", loginRole: "therapist", patientId: null, showAll: false, navOpen: false,
    filters: { search: "", doctor: "", diagnosis: "", sort: "recent" },
    logF: { doctor: "", kind: "", search: "" }, sesF: { doctor: "", patient: "", search: "" },
    repF: { patient: "", doctor: "", search: "" }, recF: { patient: "", doctor: "", search: "" }, docSearch: "" });
  let state = freshState();
  let idleTimer = null, idleLoggedOut = false;
  const IDLE_MS = 5 * 60 * 1000;
  function resetIdle() {
    if (idleTimer) clearTimeout(idleTimer);
    if (!getSession()) return;
    idleTimer = setTimeout(() => { if (getSession()) { setSession(null); idleLoggedOut = true; state = freshState(); render(); } }, IDLE_MS);
  }

  function toast(msg, type) {
    const root = $("#toast-root");
    const el = document.createElement("div");
    el.className = "toast " + (type || "ok");
    el.innerHTML = (type === "err" ? I.x : I.check) + "<span>" + esc(msg) + "</span>";
    root.appendChild(el);
    setTimeout(() => { el.style.opacity = "0"; el.style.transform = "translateY(10px)"; el.style.transition = "all .3s"; }, 2400);
    setTimeout(() => el.remove(), 2750);
  }

  /* ============================================================
     RENDER ROOT
     ============================================================ */
  function render() {
    applyLangAttrs();
    pruneChats();
    document.body.classList.toggle("nav-open-lock", !!state.navOpen);
    const app = $("#app");
    const session = getSession();
    if (!session) { app.innerHTML = LoginView(); afterLogin(); }
    else if (session.role === "therapist") {
      if (!getDoctor(session.doctorId)) { setSession(null); render(); return; }
      app.innerHTML = TherapistShell(); afterTherapist();
    } else { app.innerHTML = ParentShell(session); afterParent(); }
    bindLangSwitch();
    resetIdle();
  }

  /* ============================================================
     LOGIN
     ============================================================ */
  function LoginView() {
    const r = state.loginRole;
    return `
    <div class="login-wrap">
      <aside class="login-aside">
        <span class="bubble b1"></span><span class="bubble b2"></span><span class="bubble b3"></span>
        <div class="aside-content">
          ${Brand("subLogin")}
          <h1>${t("heroTitle")}</h1>
          <p>${t("heroDesc")}</p>
        </div>
        <svg class="brain-art" viewBox="0 0 200 200" fill="#c9bdf0" opacity=".6"><path d="M100 30c30 0 50 20 55 45 8 5 12 14 8 24-3 8-10 12-18 12-6 14-22 22-45 22s-39-8-45-22c-8 0-15-4-18-12-4-10 0-19 8-24 5-25 25-45 55-45z"/></svg>
      </aside>
      <div class="login-panel">
        <div class="login-topbar">${ThemeBtn()}${LangSwitcher()}</div>
        <div class="login-card">
          <div style="margin-bottom:30px">${Brand("subLogin")}</div>
          <h2>${t("welcomeBack")}</h2>
          <p class="sub">${t("loginSub")}</p>
          ${idleLoggedOut ? `<div class="idle-banner">${I.clock} ${t("idleLogout")}</div>` : ""}
          <div class="seg">
            <button data-role="therapist" class="${r === "therapist" ? "on" : ""}">${I.stetho} ${t("roleTher")}</button>
            <button data-role="parent" class="${r === "parent" ? "on" : ""}">${I.users} ${t("roleParent")}</button>
          </div>
          <form id="login-form">
            <div id="login-error"></div>
            <div class="field"><label>${t("username")}</label>
              <div class="control">${I.user}<input name="username" autocomplete="username" placeholder="${t("phUsername")}" /></div></div>
            <div class="field"><label>${t("password")}</label>
              <div class="control">${I.lock}<input name="password" type="password" autocomplete="current-password" placeholder="••••••••" />
                <button type="button" class="toggle-eye" data-eye>${I.eye}</button></div></div>
            <button class="btn btn-primary btn-block" type="submit" style="margin-top:6px">${t("btnLogin")}</button>
          </form>
          <div class="login-hint">${r === "therapist" ? t("demoTher") : t("demoParent")}</div>
        </div>
      </div>
    </div>`;
  }

  function Brand(subKey, home) {
    return `<div class="logo${home ? " logo-link" : ""}"${home ? ` data-home title="${t("goHome")}"` : ""}>
      <div class="logo-mark">${I.logo}</div>
      <div class="logo-text"><strong>Little Talkers</strong><span>${t(subKey)}</span></div>
    </div>`;
  }

  function afterLogin() {
    idleLoggedOut = false;
    $$("[data-role]").forEach((b) => b.addEventListener("click", () => { state.loginRole = b.dataset.role; render(); }));
    const eye = $("[data-eye]");
    if (eye) eye.addEventListener("click", () => { const inp = eye.previousElementSibling; const show = inp.type === "password"; inp.type = show ? "text" : "password"; eye.innerHTML = show ? I.eyeOff : I.eye; });
    const form = $("#login-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const u = form.username.value.trim(); const p = form.password.value;
      if (state.loginRole === "therapist") {
        const doc = DB.doctors.find((d) => d.username === u && d.password === p && !d.removed);
        if (doc) { setSession({ role: "therapist", doctorId: doc.id }); state.route = "dashboard"; render(); return; }
      } else {
        const pt = DB.patients.find((x) => x.parentUsername === u && x.parentPassword === p);
        if (pt) { setSession({ role: "parent", patientId: pt.id }); logEvent(t("aLogin"), { actorName: (pt.guardian || t("lblParent")) + " (" + ti("parentOf", pt.name) + ")", patientName: pt.name, patientId: pt.id, kind: "info" }); saveDB(); render(); return; }
      }
      $("#login-error").innerHTML = `<div class="form-error">${t("errLogin")}</div>`;
    });
  }

  /* ============================================================
     THERAPIST SHELL
     ============================================================ */
  function TherapistShell() {
    return `<div class="shell ${state.navOpen ? "nav-open" : ""}"><div class="scrim" data-close-nav></div>${Sidebar()}<div class="main">${Topbar()}<div class="content" id="content"></div></div></div>`;
  }

  function Sidebar() {
    const doc = currentDoctor(); const route = state.route;
    // important first, less-used admin items at the bottom
    const items = [["dashboard", I.home, "nDash"], ["myprofile", I.user, "nMyProfile"]];
    if (can("managePatients")) items.push(["add", I.userPlus, "nAdd"]);
    items.push(["patients", I.users, "nPatients"]);
    items.push(["sessions", I.calendar, "nSessions"]);
    items.push(["recordings", I.video, "nRecordings"]);
    if (can("viewReports")) items.push(["reports", I.report, "nReports"]);
    if (can("viewLog")) items.push(["log", I.history, "nLog"]);
    if (doc && doc.role === "main") items.push(["doctors", I.stetho, "nDoctors"]);
    if (can("managePatients")) items.push(["removed", I.trash, "nRemoved"]);
    const active = (key) => route === key || (key === "patients" && route === "profile");
    return `
    <aside class="sidebar">
      <button class="icon-btn nav-close" data-close-nav title="${t("close")}">${I.x}</button>
      ${Brand("subTher", true)}
      <div class="sidebar-user">
        ${ava(doc, "md")}
        <div class="meta"><strong>${esc(doc.name)}</strong><span>${esc(doc.title)}${doc.role === "main" ? " · " + t("roleMain") : ""}</span></div>
      </div>
      <nav class="nav">
        ${items.map(([k, ic, label]) => (k === "add" && !can("managePatients")) ? "" : `<button class="nav-item ${active(k) ? "active" : ""}" data-nav="${k}">${ic}<span>${t(label)}</span></button>`).join("")}
        <div class="nav-spacer"></div>
        ${ThemeNavItem()}
        <button class="nav-item logout" data-logout>${I.logout}<span>${t("nLogout")}</span></button>
      </nav>
    </aside>`;
  }

  function Topbar() {
    const doc = currentDoctor();
    const unread = can("chat") ? doctorUnread() : 0;
    const titles = { dashboard: "nDash", patients: "nPatients", sessions: "nSessions", recordings: "nRecordings", reports: "nReports", log: "nLog", doctors: "nDoctors", removed: "nRemoved", myprofile: "nMyProfile", profile: "titleProfile" };
    return `
    <div class="topbar">
      <div style="display:flex;align-items:center;gap:12px">
        <button class="icon-btn hamburger" data-toggle-nav>${I.menu}</button>
        <div class="page-title">${t(titles[state.route] || "nDash")}</div>
      </div>
      <div class="right">
        <span class="greet">${t("hello")} <b>${esc(doc.name)}</b></span>
        ${LangSwitcher()}
        ${can("chat") ? `<button class="icon-btn bell" data-inbox>${I.bell}${unread ? `<span class="count">${unread}</span>` : `<span class="dot"></span>`}</button>` : ""}
        ${ava(doc, "md")}
      </div>
    </div>`;
  }

  function afterTherapist() {
    bindShell();
    $$("[data-inbox]").forEach((b) => b.addEventListener("click", openInboxModal));
    renderTherapistContent();
    maybePromptSessionSummary();
  }

  function renderTherapistContent() {
    const c = $("#content"); if (!c) return;
    switch (state.route) {
      case "dashboard": c.innerHTML = DashboardView(); break;
      case "patients": c.innerHTML = PatientsView(); break;
      case "sessions": c.innerHTML = SessionsView(); break;
      case "recordings": c.innerHTML = RecordingsView(); break;
      case "reports": c.innerHTML = ReportsView(); break;
      case "log": c.innerHTML = LogView(); break;
      case "doctors": c.innerHTML = DoctorsView(); break;
      case "removed": c.innerHTML = RemovedView(); break;
      case "myprofile": c.innerHTML = MyProfileView(); break;
      case "profile": c.innerHTML = ProfileView(getPatient(state.patientId), false); break;
      default: c.innerHTML = DashboardView();
    }
    bindContent();
  }

  function bindShell() {
    $$("[data-nav]").forEach((b) => b.addEventListener("click", () => {
      const key = b.dataset.nav; state.navOpen = false;
      if (key === "add") { openPatientModal(null); return; }
      state.route = key; state.patientId = null; state.showAll = false; render();
    }));
    const lo = $("[data-logout]"); if (lo) lo.addEventListener("click", () => { setSession(null); state = freshState(); render(); });
    const tg = $("[data-toggle-nav]"); if (tg) tg.addEventListener("click", () => { state.navOpen = !state.navOpen; render(); });
    $$("[data-close-nav]").forEach((sc) => sc.addEventListener("click", () => { state.navOpen = false; render(); }));
  }

  /* ============================================================
     DASHBOARD
     ============================================================ */
  function DashboardView() {
    const ps = visiblePatients();
    const total = ps.length;
    const upcoming = ps.reduce((n, p) => n + p.sessions.filter((s) => sessionUpcoming(s)).length, 0);
    const recordings = ps.reduce((n, p) => n + p.recordings.length, 0);
    const reports = ps.reduce((n, p) => n + p.files.length, 0);
    const stats = [
      ["purple", I.users, t("stTotal"), total, t("stTotalFoot"), "patients"],
      ["amber", I.calendar, t("nSessions"), upcoming, t("stUpcomingFoot"), "sessions"],
      ["green", I.video, t("nRecordings"), recordings, recordings ? t("stRecFoot") : t("stRecEmpty"), "recordings"],
      ["blue", I.report, t("nReports"), reports, t("stReportsFoot"), "reports"],
    ];
    return `
      <div class="stat-grid">
        ${stats.map(([cl, ic, label, val, foot, nav]) => `
          <button class="stat-card" data-gonav="${nav}">
            <div class="stat-ico ${cl}">${ic}</div>
            <div class="stat-meta"><div class="label">${label}</div><div class="value">${val}</div><div class="foot">${foot}</div></div>
          </button>`).join("")}
      </div>
      ${PatientsView(true)}
      <div class="note-banner"><div class="ico">${I.bulb}</div><div><h4>${t("tipTitle")}</h4><p>${t("tipText")}</p></div></div>`;
  }

  /* ============================================================
     PATIENTS LIST + FILTERS
     ============================================================ */
  function applyFilters() {
    const f = state.filters;
    let list = visiblePatients().slice();
    const q = f.search.trim();
    if (q) list = list.filter((p) => p.name.includes(q) || (p.diagnosis || "").includes(q) || (p.guardian || "").includes(q));
    if (f.doctor) list = list.filter((p) => p.doctorId === f.doctor);
    if (f.diagnosis) list = list.filter((p) => p.diagnosis === f.diagnosis);
    if (f.sort === "recent") list.sort((a, b) => (b.lastSession || "").localeCompare(a.lastSession || ""));
    else if (f.sort === "progress-high") list.sort((a, b) => b.progress - a.progress);
    else if (f.sort === "progress-low") list.sort((a, b) => a.progress - b.progress);
    else if (f.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }

  function PatientsView(compact) {
    const f = state.filters;
    const editable = can("managePatients");
    let list = applyFilters();
    const limit = compact && !state.showAll ? 4 : list.length;
    const shown = list.slice(0, limit);
    const hasMore = list.length > limit;
    const diagnoses = Array.from(new Set(visiblePatients().map((p) => p.diagnosis))).filter(Boolean);

    const rows = shown.map((p) => `
      <tr data-row="${p.id}">
        <td><div class="cell-name">${ava(p, "md")}
          <div><div class="nm">${esc(p.name)}</div><div class="sb">${esc(p.guardian || "")}</div></div></div></td>
        <td>${esc(p.age)} ${t("years")}</td>
        <td><span class="tag">${esc(p.diagnosis)}</span></td>
        <td><span class="doc-pill">${I.stetho}${esc((getDoctor(p.doctorId) || {}).name || "—")}</span></td>
        <td>${fmtDate(p.lastSession)}</td>
        <td><div class="progress"><span class="pct">${p.progress}%</span><div class="bar"><i style="width:${p.progress}%"></i></div></div></td>
        <td><div class="row-actions">
          <button class="icon-btn" data-open="${p.id}" title="${t("ttOpen")}">${I.folder}</button>
          ${editable ? `<button class="icon-btn" data-edit="${p.id}" title="${t("ttEdit")}">${I.edit}</button>
          <button class="icon-btn danger" data-remove="${p.id}" title="${t("ttDelete")}">${I.trash}</button>` : ""}
        </div></td>
      </tr>`).join("");

    const body = list.length === 0
      ? `<tr><td colspan="7"><div class="empty">${I.users}<p>${(f.search || f.doctor || f.diagnosis) ? t("emptyNoMatch") : t("emptyNoPatients")}</p></div></td></tr>`
      : rows;

    const filterBar = compact ? "" : `
      <div class="filterbar">
        <div class="search">${I.search}<input id="patient-search" placeholder="${t("phSearchNameDiag")}" value="${esc(f.search)}" /></div>
        <label class="fsel">${I.stetho}<select data-filter="doctor"><option value="">${t("allDoctors")}</option>
          ${DB.doctors.map((d) => `<option value="${d.id}" ${f.doctor === d.id ? "selected" : ""}>${esc(d.name)}</option>`).join("")}</select></label>
        <label class="fsel">${I.filter}<select data-filter="diagnosis"><option value="">${t("allDiag")}</option>
          ${diagnoses.map((d) => `<option ${f.diagnosis === d ? "selected" : ""}>${esc(d)}</option>`).join("")}</select></label>
        <label class="fsel">${I.sort}<select data-filter="sort">
          <option value="recent" ${f.sort === "recent" ? "selected" : ""}>${t("sortRecent")}</option>
          <option value="progress-high" ${f.sort === "progress-high" ? "selected" : ""}>${t("sortHigh")}</option>
          <option value="progress-low" ${f.sort === "progress-low" ? "selected" : ""}>${t("sortLow")}</option>
          <option value="name" ${f.sort === "name" ? "selected" : ""}>${t("sortName")}</option></select></label>
        ${(f.search || f.doctor || f.diagnosis || f.sort !== "recent") ? `<button class="btn btn-ghost btn-sm" data-clear-filters>${I.x} ${t("clear")}</button>` : ""}
      </div>`;

    const inner = `
      <div class="card-head">
        <h3>${t("nPatients")} ${compact ? "" : `<span class="count">${list.length}</span>`}</h3>
        <div class="tools">
          ${compact ? `<div class="search">${I.search}<input id="patient-search" placeholder="${t("phSearchPatient")}" value="${esc(f.search)}" /></div>` : ""}
          ${editable ? `<button class="btn btn-primary" data-add>${I.plus} ${t("nAdd")}</button>` : ""}
        </div>
      </div>
      ${filterBar}
      <div class="table-wrap"><table class="patients">
        <thead><tr><th>${t("cName")}</th><th>${t("cAge")}</th><th>${t("cDiagnosis")}</th><th>${t("cDoctor")}</th><th>${t("cLast")}</th><th>${t("cProgress")}</th><th>${t("cActions")}</th></tr></thead>
        <tbody>${body}</tbody>
      </table></div>
      ${hasMore ? `<div class="show-more"><button data-showall>${t("showMore")} ${I.chevDown}</button></div>` : ""}`;
    return `<div class="card">${inner}</div>`;
  }

  /* ============================================================
     SECTION FILTER BAR (generic)
     ============================================================ */
  function sectionFilterBar(prefix, fields, searchPlaceholder) {
    const f = state[prefix + "F"];
    const active = fields.some(([k]) => f[k]) || (f.search && f.search.trim());
    return `<div class="filterbar">
      <div class="search">${I.search}<input data-secsearch="${prefix}" placeholder="${esc(searchPlaceholder)}" value="${esc(f.search || "")}" /></div>
      ${fields.map(([key, allLabel, opts]) => `<label class="fsel">${I.filter}<select data-secfilter="${prefix}|${key}">
        <option value="">${esc(allLabel)}</option>
        ${opts.map(([v, l]) => `<option value="${esc(v)}" ${f[key] === v ? "selected" : ""}>${esc(l)}</option>`).join("")}
      </select></label>`).join("")}
      ${active ? `<button class="btn btn-ghost btn-sm" data-secclear="${prefix}">${I.x} ${t("clear")}</button>` : ""}
    </div>`;
  }

  /* ============================================================
     UPCOMING SESSIONS
     ============================================================ */
  function allSessions() {
    const out = [];
    visiblePatients().forEach((p) => p.sessions.forEach((s) => out.push(Object.assign({ patientId: p.id, patientName: p.name, doctorId: p.doctorId }, s))));
    out.sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
    return out;
  }

  function SessionsView() {
    const f = state.sesF;
    const editable = can("manageSessions");
    let list = allSessions();
    if (f.doctor) list = list.filter((s) => s.doctorId === f.doctor);
    if (f.patient) list = list.filter((s) => s.patientId === f.patient);
    if (f.search.trim()) list = list.filter((s) => (s.title || "").includes(f.search.trim()) || s.patientName.includes(f.search.trim()));
    const upcoming = list.filter((s) => sessionUpcoming(s));
    const past = list.filter((s) => !sessionUpcoming(s)).reverse();

    const item = (s) => `
      <div class="session-item clickable" data-session="${s.patientId}|${s.id}">
        <div class="date-chip ${sessionUpcoming(s) ? "" : "past"}"><b>${new Date(s.date).getDate()}</b><span>${monthShort(s.date)}</span></div>
        <div class="session-main"><div class="st">${esc(s.title || t("sesDefault"))}${sessionPending(s) ? ` <span class="need-sum">${t("needsSummary")}</span>` : ""}</div>
          <div class="ss">${I.user} ${esc(s.patientName)} · ${I.clock} ${esc(s.time || "—")} · ${esc(doctorName(s.doctorId))}</div></div>
        ${editable ? `<div class="row-actions">
          <button class="icon-btn" data-edit-session="${s.patientId}|${s.id}" title="${t("ttEdit")}">${I.edit}</button>
          <button class="icon-btn danger" data-del-session="${s.patientId}|${s.id}" title="${t("ttDelete")}">${I.trash}</button></div>` : ""}
      </div>`;

    return `
      <div class="card">
        <div class="card-head"><h3>${t("nSessions")} <span class="count">${upcoming.length}</span></h3>
          <div class="tools">${editable ? `<button class="btn btn-primary" data-add-session>${I.plus} ${t("btnSchedule")}</button>` : ""}</div></div>
        ${sectionFilterBar("ses", [["patient", t("allPatients"), visiblePatients().map((p) => [p.id, p.name])], ["doctor", t("allDoctors"), DB.doctors.map((d) => [d.id, d.name])]], t("phSearchSession"))}
        ${upcoming.length === 0 ? `<div class="empty">${I.calendar}<p>${t("emptyNoUpcoming")}</p></div>` : `<div class="session-list">${upcoming.map(item).join("")}</div>`}
      </div>
      ${past.length ? `<div class="card" style="margin-top:20px"><div class="subhead"><h3>${t("sesPast")}</h3><span class="count">${past.length}</span></div>
        <div class="session-list muted">${past.map(item).join("")}</div></div>` : ""}`;
  }

  /* ============================================================
     RECORDINGS (overview)
     ============================================================ */
  function RecordingsView() {
    const f = state.recF;
    const editable = can("manageRecordings");
    let ps = visiblePatients().slice();
    if (f.patient) ps = ps.filter((p) => p.id === f.patient);
    if (f.doctor) ps = ps.filter((p) => p.doctorId === f.doctor);
    const q = f.search.trim();
    const groups = ps.map((p) => { let recs = p.recordings.slice().sort((a, b) => (b.date || "").localeCompare(a.date || "")); if (q) recs = recs.filter((r) => (r.title || "").includes(q)); return { p, recs }; }).filter((g) => g.recs.length);
    const totalRecs = groups.reduce((n, g) => n + g.recs.length, 0);
    return `
      <div class="card">
        <div class="card-head"><h3>${t("recTitle")} <span class="count">${totalRecs}</span></h3>
          <div class="tools">${editable ? `<button class="btn btn-primary" data-add-recording>${I.plus} ${t("btnAddRec")}</button>` : ""}</div></div>
        ${sectionFilterBar("rec", [["patient", t("allPatients"), visiblePatients().map((p) => [p.id, p.name])], ["doctor", t("allDoctors"), DB.doctors.map((d) => [d.id, d.name])]], t("phSearchRec"))}
        ${totalRecs === 0
          ? `<div class="empty">${I.video}<p>${q || f.patient || f.doctor ? t("emptyRecMatch") : t("emptyNoRec")}</p></div>`
          : groups.map((g) => `<div class="group">
              <div class="group-head" data-go-patient="${g.p.id}">${ava(g.p, "md")}
                <div><div class="gn">${esc(g.p.name)}</div><div class="gs">${ti("recCount", g.recs.length)}</div></div></div>
              <div class="rec-list">${g.recs.map((r) => recordingItem(g.p, r, editable)).join("")}</div></div>`).join("")}
      </div>`;
  }

  function recordingItem(p, r, editable) {
    return `<div class="rec-item">
      <div class="rec-ico">${I.video}</div>
      <div class="rec-main"><div class="rn">${esc(r.title || t("recDefault"))}</div><div class="rs">${I.calendar} ${fmtDate(r.date)}</div></div>
      ${r.url ? `<a class="btn btn-soft btn-sm" href="${esc(r.url)}" target="_blank" rel="noopener" data-watchlog="${p.id}|${esc(r.id)}">${I.play} ${t("btnWatch")}</a>` : ""}
      ${editable ? `<button class="icon-btn danger" data-del-rec="${p.id}|${r.id}" title="${t("ttDelete")}">${I.trash}</button>` : ""}
    </div>`;
  }

  /* ============================================================
     REPORTS / FILES (overview)
     ============================================================ */
  function ReportsView() {
    const f = state.repF;
    let ps = visiblePatients().slice();
    if (f.patient) ps = ps.filter((p) => p.id === f.patient);
    if (f.doctor) ps = ps.filter((p) => p.doctorId === f.doctor);
    const q = f.search.trim();
    const groups = ps.map((p) => { let files = p.files.slice().sort((a, b) => (b.date || "").localeCompare(a.date || "")); if (q) files = files.filter((x) => (x.name || "").includes(q)); return { p, files }; }).filter((g) => g.files.length);
    const total = groups.reduce((n, g) => n + g.files.length, 0);
    return `
      <div class="card">
        <div class="card-head"><h3>${t("nReports")} <span class="count">${total}</span></h3></div>
        ${sectionFilterBar("rep", [["patient", t("allPatients"), visiblePatients().map((p) => [p.id, p.name])], ["doctor", t("allDoctors"), DB.doctors.map((d) => [d.id, d.name])]], t("phSearchFile"))}
        ${total === 0
          ? `<div class="empty">${I.file}<p>${q || f.patient || f.doctor ? t("emptyFileMatch") : t("emptyNoFiles")}</p></div>`
          : groups.map((g) => `<div class="group">
              <div class="group-head" data-go-patient="${g.p.id}">${ava(g.p, "md")}
                <div><div class="gn">${esc(g.p.name)}</div><div class="gs">${ti("filesCount", g.files.length)} · ${esc(doctorName(g.p.doctorId))}</div></div></div>
              <div class="file-list">${g.files.map((x) => `
                <div class="file-item"><div class="file-ico">${I.file}</div>
                  <div class="file-meta"><div class="fn">${esc(x.name)}</div><div class="fs">${fmtSize(x.size)} · ${fmtDate(x.date)}</div></div>
                  <button class="icon-btn" data-dl="${g.p.id}|${x.id}" title="${t("ttDownload")}">${I.download}</button>
                </div>`).join("")}</div></div>`).join("")}
      </div>`;
  }

  /* ============================================================
     ACTIVITY LOG
     ============================================================ */
  function LogView() {
    const f = state.logF;
    let logs = DB.logs.slice();
    if (f.doctor) logs = logs.filter((l) => l.doctorId === f.doctor);
    if (f.kind) logs = logs.filter((l) => l.kind === f.kind);
    if (f.search.trim()) logs = logs.filter((l) => (l.action || "").includes(f.search.trim()) || (l.patientName || "").includes(f.search.trim()) || (l.doctorName || "").includes(f.search.trim()));
    const kindIco = { note: I.edit, progress: I.activity, plan: I.bulb, file: I.file, patient: I.userPlus, remove: I.trash, session: I.calendar, doctor: I.stetho, perms: I.key, recording: I.video, message: I.message, info: I.history };
    const kindKeys = { note: "kNote", progress: "kProgress", plan: "kPlan", file: "kFile", patient: "kPatient", remove: "kRemove", session: "kSession", doctor: "kDoctor", perms: "kPerms", recording: "kRecording", message: "kMessage" };
    return `
      <div class="card">
        <div class="card-head"><h3>${t("nLog")} <span class="count">${logs.length}</span></h3></div>
        ${sectionFilterBar("log", [["doctor", t("allDoctors"), DB.doctors.map((d) => [d.id, d.name])], ["kind", t("allKinds"), Object.keys(kindKeys).map((k) => [k, t(kindKeys[k])])]], t("phSearchLog"))}
        ${logs.length === 0 ? `<div class="empty">${I.history}<p>${t("emptyNoEvents")}</p></div>`
          : `<div class="log-list">${logs.map((l) => `
              <div class="log-item ${l.patientId ? "clickable" : ""}" ${l.patientId ? `data-go-patient="${l.patientId}"` : ""}>
                <div class="log-ico">${kindIco[l.kind] || I.history}</div>
                <div class="log-main"><div class="lt"><b>${esc(l.doctorName)}</b> ${esc(l.action)}${l.patientName ? ` — <span class="lp">${esc(l.patientName)}</span>` : ""}</div>
                  <div class="ls">${I.clock} ${fmtDateTime(l.ts)}</div></div></div>`).join("")}</div>`}
      </div>`;
  }

  /* ============================================================
     DOCTORS (main only)
     ============================================================ */
  function DoctorsView() {
    const me = currentDoctor();
    if (!me || me.role !== "main") return `<div class="card"><div class="empty">${I.shield}<p>${t("onlyMain")}</p></div></div>`;
    const counts = {};
    DB.patients.forEach((p) => counts[p.doctorId] = (counts[p.doctorId] || 0) + 1);
    const q = state.docSearch.trim();
    let docs = activeDoctors();
    let removed = DB.doctors.filter((d) => d.removed);
    if (q) { docs = docs.filter((d) => d.name.includes(q) || d.username.includes(q)); removed = removed.filter((d) => d.name.includes(q) || d.username.includes(q)); }
    return `
      <div class="card">
        <div class="card-head"><h3>${t("nDoctors")} <span class="count">${docs.length}</span></h3>
          <div class="tools"><div class="search">${I.search}<input data-docsearch placeholder="${t("phSearchDoctor")}" value="${esc(state.docSearch)}" /></div>
            <button class="btn btn-primary" data-add-doctor>${I.plus} ${t("btnAddDoctor")}</button></div></div>
        <div class="doctor-list">
          ${docs.map((d) => {
            const perms = d.role === "main" ? ALL_PERMS : ALL_PERMS.filter((k) => d.permissions && d.permissions[k]);
            return `<div class="doctor-item">
              ${ava(d, "md")}
              <div class="doctor-main">
                <div class="dn">${esc(d.name)} ${d.role === "main" ? `<span class="role-tag main">${I.shield} ${t("roleMain")}</span>` : `<span class="role-tag">${t("roleDoc")}</span>`}</div>
                <div class="ds">${esc(d.title)} · ${t("lblUser")}: <b>${esc(d.username)}</b> · ${counts[d.id] || 0} ${t("unitPatients")}</div>
                <div class="perm-chips">${perms.length ? perms.map((k) => `<span class="perm-chip">${t(PERM_KEY[k])}</span>`).join("") : `<span class="perm-chip none">${t("permNone")}</span>`}</div>
              </div>
              <div class="row-actions"><button class="icon-btn" data-edit-doctor="${d.id}" title="${t("ttEdit")}">${I.edit}</button>
                ${d.role === "main" ? "" : `<button class="icon-btn danger" data-del-doctor="${d.id}" title="${t("ttDelete")}">${I.trash}</button>`}</div>
            </div>`;
          }).join("")}
        </div>
      </div>
      ${removed.length ? `<div class="card" style="margin-top:20px">
        <div class="subhead"><h3>${t("removedDoctors")}</h3><span class="count">${removed.length}</span></div>
        <div class="doctor-list">${removed.map((d) => `
          <div class="doctor-item" style="opacity:.75">
            ${ava(d, "md")}
            <div class="doctor-main"><div class="dn">${esc(d.name)}</div>
              <div class="ds">${esc(d.title)} · ${t("lblUser")}: <b>${esc(d.username)}</b>${d.removedAt ? ` · ${t("removedOn")} ${fmtDate(d.removedAt)}` : ""}</div></div>
            <div class="row-actions">
              <button class="btn btn-soft btn-sm" data-restore-doc="${d.id}">${I.history} ${t("restore")}</button>
              <button class="icon-btn danger" data-perma-doc="${d.id}" title="${t("deleteForever")}">${I.trash}</button>
            </div>
          </div>`).join("")}</div>
      </div>` : ""}`;
  }

  /* ============================================================
     REMOVED PATIENTS (soft delete / restore)
     ============================================================ */
  function RemovedView() {
    if (!can("managePatients")) return `<div class="card"><div class="empty">${I.shield}<p>${t("onlyMain")}</p></div></div>`;
    const list = removedPatients().slice().sort((a, b) => (b.removedAt || "").localeCompare(a.removedAt || ""));
    return `
      <div class="card">
        <div class="card-head"><h3>${t("nRemoved")} <span class="count">${list.length}</span></h3></div>
        ${list.length === 0 ? `<div class="empty">${I.trash}<p>${t("emptyRemoved")}</p></div>`
          : `<div class="doctor-list">${list.map((p) => `
            <div class="doctor-item">
              ${ava(p, "md")}
              <div class="doctor-main"><div class="dn">${esc(p.name)}</div>
                <div class="ds">${esc(p.diagnosis)} · ${esc(doctorName(p.doctorId))}${p.removedAt ? ` · ${t("removedOn")} ${fmtDate(p.removedAt)}` : ""}</div></div>
              <div class="row-actions">
                <button class="btn btn-soft btn-sm" data-restore="${p.id}">${I.history} ${t("restore")}</button>
                <button class="icon-btn danger" data-perma="${p.id}" title="${t("deleteForever")}">${I.trash}</button>
              </div>
            </div>`).join("")}</div>`}
      </div>`;
  }

  /* ============================================================
     DOCTOR SELF-PROFILE (journey, info, photo)
     ============================================================ */
  function MyProfileView() {
    const d = currentDoctor(); if (!d) return "";
    return `
      <div class="card">
        <div class="profile-hero">
          ${avaEditable(d, "lg", "doctor")}
          <div class="info"><h2>${esc(d.name)}</h2>
            <div class="meta-row">
              <span>${I.stetho} ${esc(d.title)}</span>
              <span>${I.phone2} ${esc(d.phone || "—")}</span>
              ${d.age ? `<span>${I.cake} ${esc(d.age)} ${t("years")}</span>` : ""}
              <span>${I.user} ${t("lblUser")}: ${esc(d.username)}</span>
              ${d.role === "main" ? `<span>${I.shield} ${t("roleMain")}</span>` : ""}
            </div></div>
          <div class="profile-actions"><button class="btn btn-primary" data-edit-myprofile>${I.edit} ${t("myProfileEdit")}</button></div>
        </div>
      </div>
      <div class="card" style="margin-top:20px">
        <div class="subhead"><h3>${t("bioLabel")}</h3></div>
        ${d.bio ? `<div class="plan-box bio-box">${esc(d.bio)}</div>` : `<div class="plan-box empty-plan">${t("noBio")}</div>`}
      </div>`;
  }

  function openMyProfileModal() {
    const d = currentDoctor(); if (!d) return;
    const html = `<div class="modal"><div class="modal-head"><h3>${t("myProfileEdit")}</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
      <form id="mp-form"><div class="modal-body" style="text-align:center">
        <div style="display:flex;justify-content:center;margin-bottom:14px">${avaEditable(d, "lg", "doctor")}</div>
        <div style="text-align:start">
          ${ctl(t("fDocName"), `<input name="name" required value="${esc(d.name || "")}" placeholder="${t("phDocName")}" />`)}
          <div class="grid-2">${ctl(t("lblPhone"), `<input name="phone" value="${esc(d.phone || "")}" placeholder="05xxxxxxxx" />`)}${ctl(t("cAge"), `<input name="age" type="number" min="18" max="100" value="${esc(d.age || "")}" />`)}</div>
          ${ctl(t("fTitleRole"), `<input name="title" value="${esc(d.title || "")}" placeholder="${t("phTitleRole")}" />`)}
          <div class="field"><label>${t("bioLabel")}</label><div class="control"><textarea name="bio" style="min-height:130px" placeholder="${t("phBio")}">${esc(d.bio || "")}</textarea></div></div>
        </div>
      </div><div class="modal-foot"><button type="submit" class="btn btn-primary">${t("saveProfile")}</button><button type="button" class="btn btn-ghost" data-modal-close>${t("cancel")}</button></div></form></div>`;
    const close = openModal(html);
    bindAvatarUploads($("#modal-root"));
    $("#mp-form").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; d.name = f.name.value.trim() || d.name; d.phone = f.phone.value.trim(); if (f.age.value) d.age = +f.age.value; d.title = f.title.value.trim() || d.title; d.bio = f.bio.value.trim(); logEvent(ti("aEditDoc", d.name), { kind: "perms" }); saveDB(); close(); render(); toast(t("tProfileSaved")); });
  }

  function openDoctorProfileModal(docId) {
    const d = getDoctor(docId); if (!d) return;
    const html = `<div class="modal"><div class="modal-head"><h3>${t("docProfileTitle")}</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
      <div class="modal-body" style="text-align:center">
        <div style="display:flex;justify-content:center;margin-bottom:10px">${ava(d, "lg")}</div>
        <h3 style="margin:6px 0 2px">${esc(d.name)}</h3>
        <p style="color:var(--text-soft);margin:0 0 12px">${esc(d.title)}</p>
        <div class="meta-row" style="justify-content:center;margin-bottom:16px">
          ${d.phone ? `<span>${I.phone2} ${esc(d.phone)}</span>` : ""}
          ${d.age ? `<span>${I.cake} ${esc(d.age)} ${t("years")}</span>` : ""}
          <span>${I.user} ${t("lblUser")}: ${esc(d.username)}</span>
        </div>
        <div style="text-align:start">${d.bio ? `<div class="plan-box bio-box">${esc(d.bio)}</div>` : `<div class="plan-box empty-plan">${t("noBio")}</div>`}</div>
      </div>
      <div class="modal-foot"><button class="btn btn-ghost" data-modal-close>${t("close")}</button></div></div>`;
    openModal(html);
  }

  function bindAvatarUploads(root) {
    $$("[data-avatar-upload]", root).forEach((btn) => btn.addEventListener("click", () => {
      const [type, id] = btn.dataset.avatarUpload.split("|");
      const input = document.createElement("input"); input.type = "file"; input.accept = "image/*";
      input.onchange = () => {
        const file = input.files && input.files[0]; if (!file) return;
        if (file.size > 2 * 1024 * 1024) { toast(t("imgTooBig"), "err"); return; }
        const r = new FileReader();
        r.onload = () => {
          const ent = type === "doctor" ? getDoctor(id) : getPatient(id); if (!ent) return;
          ent.avatar = r.result;
          const sess = getSession();
          if (type === "patient") {
            if (sess && sess.role === "parent") logEvent(t("aPhoto"), { actorName: (ent.guardian || t("lblParent")) + " (" + ti("parentOf", ent.name) + ")", patientName: ent.name, patientId: ent.id, kind: "patient" });
            else logEvent(t("aPhoto"), { patientName: ent.name, patientId: ent.id, kind: "patient" });
          } else logEvent(t("aPhoto"), { kind: "perms" });
          saveDB(); render(); toast(t("photoUpdated"));
        };
        r.readAsDataURL(file);
      };
      input.click();
    }));
  }

  /* ============================================================
     PROFILE
     ============================================================ */
  function ProfileView(p, readonly) {
    if (!p) return `<div class="card"><div class="empty">${I.user}<p>—</p></div></div>`;
    const canEdit = !readonly && can("managePatients");
    const canNotes = !readonly && can("manageNotes");
    const canSessions = !readonly && can("manageSessions");
    const canFiles = !readonly && can("manageFiles");
    const canRec = readonly ? false : can("manageRecordings");
    const canChat = readonly ? true : (can("chat") && !!currentDoctor() && p.doctorId === currentDoctor().id);
    const notes = p.notes.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const sessions = p.sessions.slice().sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
    const upcoming = sessions.filter((s) => sessionUpcoming(s));
    const past = sessions.filter((s) => !sessionUpcoming(s)).reverse();
    const recordings = p.recordings.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const unreadFromParent = p.chat.filter((m) => m.from === "parent" && !m.read).length;
    const ringC = 2 * Math.PI * 54;
    const dash = ringC * (1 - p.progress / 100);
    const doc = getDoctor(p.doctorId);

    const heroActions = readonly
      ? `<div class="profile-actions">
           ${canChat ? `<button class="btn btn-primary" data-chat="${p.id}">${I.chat} ${t("actChatTher")}${parentUnread(p) ? ` <span class="ibadge">${parentUnread(p)}</span>` : ""}</button>` : ""}
           <button class="btn btn-soft" data-doc-profile="${p.doctorId}">${I.stetho} ${t("meetTherapist")}</button>
           <button class="btn btn-soft" data-edit-parent="${p.id}">${I.edit} ${t("actEditDetails")}</button>
           <span class="ro-badge editable">${I.user} ${t("badgeParent")}</span></div>`
      : `<div class="profile-actions">
           ${canChat ? `<button class="btn btn-soft" data-chat="${p.id}">${I.chat} ${t("actChat")}${unreadFromParent ? ` <span class="ibadge">${unreadFromParent}</span>` : ""}</button>` : ""}
           ${canEdit ? `<button class="btn btn-soft" data-edit="${p.id}">${I.edit} ${t("ttEdit")}</button>` : ""}
           ${canNotes ? `<button class="btn btn-primary" data-add-note="${p.id}">${I.plus} ${t("actNote")}</button>` : ""}
           ${canEdit ? `<button class="btn btn-danger" data-remove="${p.id}">${I.trash} ${t("ttDelete")}</button>` : ""}
         </div>`;

    const heroAva = (readonly || canEdit) ? avaEditable(p, "lg", "patient") : ava(p, "lg");
    const heroHTML = `<div class="card"><div class="profile-hero">
        ${heroAva}
        <div class="info"><h2>${esc(p.name)}</h2>
          <div class="meta-row">
            <span>${I.cake} ${esc(p.age)} ${t("years")}</span>
            <span>${I.user} ${genderText(p.gender)}</span>
            <span>${I.activity} ${esc(p.diagnosis)}</span>
            <span>${I.stetho} ${esc(doc ? doc.name : "—")}</span>
            <span>${I.clock} ${t("lastSessionLbl")}: ${fmtDate(p.lastSession)}</span>
          </div></div>
        ${heroActions}
      </div></div>`;

    const pastCard = `
          <div class="card">
            <div class="subhead"><h3>${t("sesPast")}</h3><span class="count">${past.length}</span></div>
            ${past.length === 0 ? `<div class="empty">${I.clock}<p>${t("emptyPast")}</p></div>`
              : `<div class="session-list muted">${past.map((s) => `
                  <div class="session-item clickable" data-session="${p.id}|${s.id}"><div class="date-chip past"><b>${new Date(s.date).getDate()}</b><span>${monthShort(s.date)}</span></div>
                    <div class="session-main"><div class="st">${esc(s.title || t("sesDefault"))}${sessionPending(s) ? ` <span class="need-sum">${t("needsSummary")}</span>` : s.summary ? ` <span class="done-tag">${I.check}</span>` : ""}</div><div class="ss">${I.clock} ${esc(s.time || "—")} · ${fmtDate(s.date)}</div></div>
                  </div>`).join("")}</div>`}
          </div>`;

    return `
      ${readonly ? "" : `<button class="back-link" data-back>${I.arrowBack} ${t("back")}</button>`}
      ${heroHTML}
      <div class="profile-grid">
        <div class="stack">
          <div class="card">
            <div class="subhead"><h3>${t("secInfo")}</h3></div>
            <div class="info-grid">
              ${[
                [I.user, t("lblParent"), esc(p.guardian || "—")],
                [I.phone2, t("lblPhone"), esc(p.phone || "—")],
                [I.cake, t("cAge"), esc(p.age) + " " + t("years")],
                [I.calendar, t("lblBirth"), p.birthDate ? fmtDate(p.birthDate) : "—"],
                [I.user, t("lblGender"), genderText(p.gender)],
                [I.activity, t("cDiagnosis"), esc(p.diagnosis)],
                [I.stetho, t("cDoctor"), esc(doc ? doc.name : "—")],
                [I.clock, t("lastSessionLbl"), fmtDate(p.lastSession)],
              ].map(([ic, k, v]) => `<div class="info-row"><div class="info-ic">${ic}</div><div class="info-txt"><div class="k">${k}</div><div class="v">${v}</div></div></div>`).join("")}
            </div>
          </div>

          <div class="card">
            <div class="subhead"><h3>${t("secUpcoming")}</h3><span class="count">${upcoming.length}</span><span class="grow"></span>
              ${canSessions ? `<button class="btn btn-soft btn-sm" data-add-session-for="${p.id}">${I.plus} ${t("btnScheduleShort")}</button>` : ""}</div>
            ${upcoming.length === 0 ? `<div class="empty">${I.calendar}<p>${t("emptyUpcomingP")}</p></div>`
              : `<div class="session-list">${upcoming.map((s) => `
                  <div class="session-item clickable" data-session="${p.id}|${s.id}"><div class="date-chip"><b>${new Date(s.date).getDate()}</b><span>${monthShort(s.date)}</span></div>
                    <div class="session-main"><div class="st">${esc(s.title || t("sesDefault"))}</div><div class="ss">${I.clock} ${esc(s.time || "—")} · ${fmtDate(s.date)}</div></div>
                    ${canSessions ? `<div class="row-actions">
                      <button class="icon-btn" data-edit-session="${p.id}|${s.id}" title="${t("ttEdit")}">${I.edit}</button>
                      <button class="icon-btn danger" data-del-session="${p.id}|${s.id}" title="${t("ttDelete")}">${I.trash}</button></div>` : ""}
                  </div>`).join("")}</div>`}
          </div>
${pastCard}
          <div class="card">
            <div class="subhead"><h3>${t("secRecordings")}</h3><span class="count">${recordings.length}</span><span class="grow"></span>
              ${canRec ? `<button class="btn btn-soft btn-sm" data-add-recording-for="${p.id}">${I.plus} ${t("btnAdd")}</button>` : ""}</div>
            ${recordings.length === 0 ? `<div class="empty">${I.video}<p>${t("emptyRecP")}</p></div>`
              : `<div class="rec-list">${recordings.map((r) => recordingItem(p, r, canRec)).join("")}</div>`}
          </div>

          <div class="card">
            <div class="subhead"><h3>${t("secNotes")}</h3><span class="count">${p.notes.length}</span><span class="grow"></span>
              ${canNotes ? `<button class="btn btn-soft btn-sm" data-add-note="${p.id}">${I.plus} ${t("btnAdd")}</button>` : ""}</div>
            ${notes.length === 0 ? `<div class="empty">${I.edit}<p>${t("emptyNotes")}</p></div>`
              : `<div class="timeline">${notes.map((n) => `
                  <div class="note-item"><div class="nh"><span class="date">${I.calendar} ${fmtDate(n.date)}</span>
                    ${canNotes ? `<button class="icon-btn btn-sm del" data-del-note="${p.id}|${n.id}" title="${t("ttDelete")}">${I.trash}</button>` : ""}
                  </div><p>${esc(n.text)}</p></div>`).join("")}</div>`}
          </div>
        </div>

        <div class="stack">
          <div class="card">
            <div class="subhead"><h3>${t("secProgress")}</h3><span class="grow"></span>
              ${canEdit ? `<button class="icon-btn btn-sm" data-edit-progress="${p.id}" title="${t("ttEdit")}">${I.edit}</button>` : ""}</div>
            <div class="progress-big"><div class="ring"><svg width="132" height="132">
                <circle cx="66" cy="66" r="54" fill="none" stroke="#eceef5" stroke-width="12"/>
                <circle cx="66" cy="66" r="54" fill="none" stroke="#7c6fd6" stroke-width="12" stroke-linecap="round" stroke-dasharray="${ringC.toFixed(1)}" stroke-dashoffset="${dash.toFixed(1)}"/>
              </svg><div class="num">${p.progress}%</div></div><div class="lbl">${t("progressLbl")}</div></div>
          </div>

          <div class="card">
            <div class="subhead"><h3>${t("secPlan")}</h3><span class="grow"></span>
              ${canEdit ? `<button class="icon-btn btn-sm" data-edit-plan="${p.id}" title="${t("ttEdit")}">${I.edit}</button>` : ""}</div>
            ${p.plan ? `<div class="plan-box">${esc(p.plan)}</div>` : `<div class="plan-box empty-plan">${t("emptyPlan")}</div>`}
          </div>

          <div class="card">
            <div class="subhead"><h3>${t("secFiles")}</h3><span class="count">${p.files.length}</span><span class="grow"></span>
              ${canFiles ? `<button class="btn btn-soft btn-sm" data-upload="${p.id}">${I.upload} ${t("btnUpload")}</button>` : ""}</div>
            ${p.files.length === 0 ? `<div class="empty">${I.file}<p>${t("emptyFilesP")}</p></div>`
              : `<div class="file-list">${p.files.map((f) => `
                  <div class="file-item"><div class="file-ico">${I.file}</div>
                    <div class="file-meta"><div class="fn">${esc(f.name)}</div><div class="fs">${fmtSize(f.size)} · ${fmtDate(f.date)}</div></div>
                    <button class="icon-btn" data-dl="${p.id}|${f.id}" title="${t("ttDownload")}">${I.download}</button>
                    ${canFiles ? `<button class="icon-btn danger" data-del-file="${p.id}|${f.id}" title="${t("ttDelete")}">${I.trash}</button>` : ""}
                  </div>`).join("")}</div>`}
          </div>

          ${canEdit ? `<div class="card"><div class="subhead"><h3>${t("secParentAcc")}</h3></div>
            <div class="credentials">
              <div class="crow"><span class="k">${t("username")}</span><span class="v">${esc(p.parentUsername || "—")}</span></div>
              <div class="crow"><span class="k">${t("password")}</span><span class="v">${esc(p.parentPassword || "—")}</span></div>
            </div></div>` : ""}
        </div>
      </div>`;
  }

  /* ============================================================
     Bind content events (therapist)
     ============================================================ */
  function bindContent() {
    $$("[data-gonav]").forEach((b) => b.addEventListener("click", () => { state.route = b.dataset.gonav; state.showAll = false; render(); }));
    const s = $("#patient-search");
    if (s) s.addEventListener("input", () => { state.filters.search = s.value; renderTherapistContent(); const ns = $("#patient-search"); if (ns) { ns.focus(); ns.setSelectionRange(ns.value.length, ns.value.length); } });
    $$("[data-filter]").forEach((sel) => sel.addEventListener("change", () => { state.filters[sel.dataset.filter] = sel.value; renderTherapistContent(); }));
    const cf = $("[data-clear-filters]"); if (cf) cf.addEventListener("click", () => { state.filters = { search: "", doctor: "", diagnosis: "", sort: "recent" }; renderTherapistContent(); });
    $$("[data-secsearch]").forEach((inp) => inp.addEventListener("input", () => { state[inp.dataset.secsearch + "F"].search = inp.value; renderTherapistContent(); const ni = $(`[data-secsearch="${inp.dataset.secsearch}"]`); if (ni) { ni.focus(); ni.setSelectionRange(ni.value.length, ni.value.length); } }));
    $$("[data-secfilter]").forEach((sel) => sel.addEventListener("change", () => { const [pre, key] = sel.dataset.secfilter.split("|"); state[pre + "F"][key] = sel.value; renderTherapistContent(); }));
    $$("[data-secclear]").forEach((b) => b.addEventListener("click", () => { const pre = b.dataset.secclear; Object.keys(state[pre + "F"]).forEach((k) => state[pre + "F"][k] = ""); renderTherapistContent(); }));
    const ds = $("[data-docsearch]"); if (ds) ds.addEventListener("input", () => { state.docSearch = ds.value; renderTherapistContent(); const n = $("[data-docsearch]"); if (n) { n.focus(); n.setSelectionRange(n.value.length, n.value.length); } });

    $$("[data-add]").forEach((b) => b.addEventListener("click", () => openPatientModal(null)));
    $$("[data-showall]").forEach((b) => b.addEventListener("click", () => { state.showAll = true; renderTherapistContent(); }));
    $$("[data-open]").forEach((b) => b.addEventListener("click", () => { state.patientId = b.dataset.open; state.route = "profile"; render(); }));
    $$("[data-row]").forEach((tr) => tr.addEventListener("click", (e) => { if (e.target.closest("button")) return; state.patientId = tr.dataset.row; state.route = "profile"; render(); }));
    $$("[data-go-patient]").forEach((el) => el.addEventListener("click", (e) => { if (e.target.closest("button,a")) return; state.patientId = el.dataset.goPatient; state.route = "profile"; render(); }));
    $$("[data-edit]").forEach((b) => b.addEventListener("click", () => openPatientModal(getPatient(b.dataset.edit))));
    $$("[data-remove]").forEach((b) => b.addEventListener("click", () => removePatient(b.dataset.remove)));
    $$("[data-back]").forEach((b) => b.addEventListener("click", () => { state.route = "patients"; state.patientId = null; render(); }));
    $$("[data-chat]").forEach((b) => b.addEventListener("click", () => openChatModal(b.dataset.chat)));

    $$("[data-add-note]").forEach((b) => b.addEventListener("click", () => openNoteModal(b.dataset.addNote)));
    $$("[data-del-note]").forEach((b) => b.addEventListener("click", () => { const [pid, nid] = b.dataset.delNote.split("|"); const p = getPatient(pid); p.notes = p.notes.filter((n) => n.id !== nid); logEvent(t("aDelNote"), { patientName: p.name, patientId: p.id, kind: "note" }); saveDB(); renderTherapistContent(); toast(t("tNoteDeleted")); }));
    $$("[data-edit-progress]").forEach((b) => b.addEventListener("click", () => openProgressModal(b.dataset.editProgress)));
    $$("[data-edit-plan]").forEach((b) => b.addEventListener("click", () => openPlanModal(b.dataset.editPlan)));
    $$("[data-upload]").forEach((b) => b.addEventListener("click", () => openUploadModal(b.dataset.upload)));
    $$("[data-del-file]").forEach((b) => b.addEventListener("click", () => { const [pid, fid] = b.dataset.delFile.split("|"); const p = getPatient(pid); p.files = p.files.filter((f) => f.id !== fid); logEvent(t("aDelFile"), { patientName: p.name, patientId: p.id, kind: "file" }); saveDB(); renderTherapistContent(); toast(t("tFileDeleted")); }));

    $$("[data-session]").forEach((el) => el.addEventListener("click", (e) => { if (e.target.closest("button")) return; const [pid, sid] = el.dataset.session.split("|"); openSessionDetailsModal(pid, sid); }));
    $$("[data-add-session]").forEach((b) => b.addEventListener("click", () => openSessionModal(null, null)));
    $$("[data-add-session-for]").forEach((b) => b.addEventListener("click", () => openSessionModal(b.dataset.addSessionFor, null)));
    $$("[data-edit-session]").forEach((b) => b.addEventListener("click", () => { const [pid, sid] = b.dataset.editSession.split("|"); openSessionModal(pid, sid); }));
    $$("[data-del-session]").forEach((b) => b.addEventListener("click", () => { const [pid, sid] = b.dataset.delSession.split("|"); const p = getPatient(pid); p.sessions = p.sessions.filter((x) => x.id !== sid); logEvent(t("aDelSession"), { patientName: p.name, patientId: p.id, kind: "session" }); saveDB(); renderTherapistContent(); toast(t("tSessionDeleted")); }));

    $$("[data-add-recording]").forEach((b) => b.addEventListener("click", () => openRecordingModal(null)));
    $$("[data-add-recording-for]").forEach((b) => b.addEventListener("click", () => openRecordingModal(b.dataset.addRecordingFor)));
    $$("[data-del-rec]").forEach((b) => b.addEventListener("click", () => { const [pid, rid] = b.dataset.delRec.split("|"); const p = getPatient(pid); p.recordings = p.recordings.filter((x) => x.id !== rid); logEvent(t("aDelRec"), { patientName: p.name, patientId: p.id, kind: "recording" }); saveDB(); renderTherapistContent(); toast(t("tRecDeleted")); }));

    $$("[data-add-doctor]").forEach((b) => b.addEventListener("click", () => openDoctorModal(null)));
    $$("[data-edit-doctor]").forEach((b) => b.addEventListener("click", () => openDoctorModal(b.dataset.editDoctor)));
    $$("[data-del-doctor]").forEach((b) => b.addEventListener("click", () => removeDoctor(b.dataset.delDoctor)));
    $$("[data-restore-doc]").forEach((b) => b.addEventListener("click", () => restoreDoctor(b.dataset.restoreDoc)));
    $$("[data-perma-doc]").forEach((b) => b.addEventListener("click", () => deleteDoctorForever(b.dataset.permaDoc)));
    $$("[data-restore]").forEach((b) => b.addEventListener("click", () => restorePatient(b.dataset.restore)));
    $$("[data-perma]").forEach((b) => b.addEventListener("click", () => deletePatientForever(b.dataset.perma)));
    $$("[data-edit-myprofile]").forEach((b) => b.addEventListener("click", openMyProfileModal));
    $$("[data-doc-profile]").forEach((b) => b.addEventListener("click", () => openDoctorProfileModal(b.dataset.docProfile)));
    bindDownloads();
    bindAvatarUploads();
  }

  function bindDownloads() {
    $$("[data-dl]").forEach((b) => b.addEventListener("click", () => { const [pid, fid] = b.dataset.dl.split("|"); downloadFile(pid, fid); }));
    $$("[data-watchlog]").forEach((a) => a.addEventListener("click", () => {
      const sess = getSession(); if (!sess || sess.role !== "parent") return;
      const [pid] = a.dataset.watchlog.split("|"); const p = getPatient(pid); if (!p) return;
      logEvent(t("aWatchRec"), { actorName: (p.guardian || t("lblParent")) + " (" + ti("parentOf", p.name) + ")", patientName: p.name, patientId: p.id, kind: "recording" }); saveDB();
    }));
  }
  function downloadFile(pid, fid) {
    const p = getPatient(pid); if (!p) return;
    const f = p.files.find((x) => x.id === fid); if (!f) return;
    const a = document.createElement("a");
    if (f.data) { a.href = f.data; a.download = f.name; }
    else { const blob = new Blob([f.name + "\n\n(demo file — original content was not stored)"], { type: "text/plain;charset=utf-8" }); a.href = URL.createObjectURL(blob); a.download = f.name.replace(/\.[^.]+$/, "") + ".txt"; setTimeout(() => URL.revokeObjectURL(a.href), 5000); }
    document.body.appendChild(a); a.click(); a.remove();
    toast(ti("tDownloading", f.name));
  }

  /* ============================================================
     MODALS / DIALOGS
     ============================================================ */
  function openModal(html, onClose) {
    const root = $("#modal-root");
    root.innerHTML = `<div class="modal-scrim" data-scrim>${html}</div>`;
    const close = () => { root.innerHTML = ""; document.removeEventListener("keydown", onKey); if (onClose) onClose(); };
    function onKey(e) { if (e.key === "Escape") close(); }
    $("[data-scrim]").addEventListener("mousedown", (e) => { if (e.target === e.currentTarget) close(); });
    $$("[data-modal-close]").forEach((b) => b.addEventListener("click", close));
    document.addEventListener("keydown", onKey);
    return close;
  }
  const ctl = (label, inner) => `<div class="field"><label>${label}</label><div class="control">${inner}</div></div>`;

  function confirmDialog(opts, onYes) {
    const html = `<div class="modal sm">
        <div class="modal-body" style="text-align:center;padding-top:26px">
          <div class="confirm-ico ${opts.danger ? "danger" : ""}">${opts.danger ? I.trash : I.check}</div>
          <h3 style="margin:14px 0 6px">${esc(opts.title)}</h3>
          <p style="color:var(--text-soft);margin:0;line-height:1.8">${esc(opts.message)}</p></div>
        <div class="modal-foot" style="justify-content:center">
          <button class="btn ${opts.danger ? "btn-danger" : "btn-primary"}" data-yes>${esc(opts.confirm || t("confirm"))}</button>
          <button class="btn btn-ghost" data-modal-close>${t("cancel")}</button></div>
      </div>`;
    const close = openModal(html);
    $("[data-yes]").addEventListener("click", () => { close(); onYes(); });
  }

  function removePatient(pid) {
    const p = getPatient(pid); if (!p) return;
    confirmDialog({ danger: true, title: t("archiveTitle"), confirm: t("confirmYes"), message: ti("archiveMsg", p.name) }, () => {
      p.removed = true; p.removedAt = new Date().toISOString();
      logEvent(t("aDelPatient"), { patientName: p.name, patientId: p.id, kind: "remove" });
      saveDB(); state.route = "patients"; state.patientId = null; render(); toast(t("tArchived"));
    });
  }
  function restorePatient(pid) {
    const p = getPatient(pid); if (!p) return;
    p.removed = false; logEvent(t("tRestored"), { patientName: p.name, patientId: p.id, kind: "patient" });
    saveDB(); renderTherapistContent(); toast(t("tRestored"));
  }
  function deletePatientForever(pid) {
    const p = getPatient(pid); if (!p) return;
    confirmDialog({ danger: true, title: t("delForeverTitle"), confirm: t("deleteForever"), message: ti("delForeverMsg", p.name) }, () => {
      DB.patients = DB.patients.filter((x) => x.id !== pid);
      logEvent(t("aDelPatient"), { patientName: p.name, kind: "remove" });
      saveDB(); renderTherapistContent(); toast(t("tPatientDeleted"));
    });
  }

  function openPatientModal(p) {
    if (!can("managePatients")) return;
    const editing = !!p; p = p || {};
    const docOpts = activeDoctors().map((d) => `<option value="${d.id}" ${p.doctorId === d.id ? "selected" : ""}>${esc(d.name)}</option>`).join("");
    const html = `<div class="modal">
        <div class="modal-head"><h3>${editing ? t("mEditPatient") : t("mAddPatient")}</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <form id="patient-form"><div class="modal-body">
            ${editing ? `<div style="display:flex;justify-content:center;margin-bottom:16px">${avaEditable(p, "lg", "patient")}</div>` : ""}
            <div class="grid-2">
              ${ctl(req(t("fFullName")), `<input name="name" required value="${esc(p.name || "")}" placeholder="${t("phName")}" />`)}
              ${ctl(req(t("cAge")), `<input name="age" type="number" min="1" max="18" required value="${esc(p.age || "")}" placeholder="7" />`)}
              ${ctl(req(t("lblGender")), `<select name="gender"><option value="זכר" ${p.gender === "זכר" ? "selected" : ""}>${t("gMale")}</option><option value="נקבה" ${p.gender === "נקבה" ? "selected" : ""}>${t("gFemale")}</option></select>`)}
              ${ctl(req(t("cDoctor")), `<select name="doctorId">${docOpts}</select>`)}
              ${ctl(req(t("fBirth")), `<input name="birthDate" type="date" required value="${esc(p.birthDate || "")}" />`)}
              ${ctl(req(t("fGuardian")), `<input name="guardian" required value="${esc(p.guardian || "")}" placeholder="${t("fGuardian")}" />`)}
              ${ctl(req(t("lblPhone")), `<input name="phone" required value="${esc(p.phone || "")}" placeholder="05xxxxxxxx" />`)}
              ${ctl(req(t("cDiagnosis")), `<input name="diagnosis" required value="${esc(p.diagnosis || "")}" placeholder="${t("phDiagnosis")}" />`)}
            </div>
            <div style="height:8px"></div>
            <div class="subhead"><h3 style="font-size:15px">${t("secParentLogin")}</h3></div>
            <div class="grid-2">
              ${ctl(req(t("username")), `${I.user}<input name="parentUsername" required value="${esc(p.parentUsername || "")}" placeholder="username" />`)}
              ${ctl(req(t("password")), `${I.lock}<input name="parentPassword" required value="${esc(p.parentPassword || "")}" placeholder="••••" />`)}
            </div>
          </div>
          <div class="modal-foot"><button type="submit" class="btn btn-primary">${editing ? t("btnSaveChanges") : t("btnAddPatient2")}</button><button type="button" class="btn btn-ghost" data-modal-close>${t("cancel")}</button></div>
        </form></div>`;
    const close = openModal(html);
    bindAvatarUploads($("#modal-root"));
    $("#patient-form").addEventListener("submit", (e) => {
      e.preventDefault(); const f = e.target; const uname = f.parentUsername.value.trim();
      if (DB.patients.find((x) => x.parentUsername === uname && x.id !== p.id)) { toast(t("errParentUserExists"), "err"); return; }
      const data = { name: f.name.value.trim(), age: +f.age.value, gender: f.gender.value, birthDate: f.birthDate.value, doctorId: f.doctorId.value, guardian: f.guardian.value.trim(), phone: f.phone.value.trim(), diagnosis: f.diagnosis.value.trim(), parentUsername: uname, parentPassword: f.parentPassword.value.trim() };
      if (editing) { Object.assign(getPatient(p.id), data); logEvent(t("aEditPatient"), { patientName: data.name, patientId: p.id, kind: "patient" }); toast(t("tSaved")); }
      else { const np = mkPatient(Object.assign({ progress: 0, plan: "", notes: [], files: [], sessions: [], recordings: [], chat: [], lastSession: today() }, data)); DB.patients.unshift(np); state.patientId = np.id; logEvent(t("aAddPatient"), { patientName: np.name, patientId: np.id, kind: "patient" }); toast(t("tPatientAdded")); }
      saveDB(); close(); render();
    });
  }

  function openNoteModal(pid) {
    const html = `<div class="modal"><div class="modal-head"><h3>${t("mNote")}</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <form id="note-form"><div class="modal-body">${ctl(t("fSessionDate"), `<input name="date" type="date" value="${today()}" required />`)}
          <div class="field"><label>${t("fNote")}</label><div class="control"><textarea name="text" required placeholder="${t("phNote")}"></textarea></div></div></div>
          <div class="modal-foot"><button type="submit" class="btn btn-primary">${t("btnSaveNote")}</button><button type="button" class="btn btn-ghost" data-modal-close>${t("cancel")}</button></div></form></div>`;
    const close = openModal(html);
    $("#note-form").addEventListener("submit", (e) => { e.preventDefault(); const p = getPatient(pid); p.notes.push({ id: uid(), date: e.target.date.value, text: e.target.text.value.trim() }); if (e.target.date.value > (p.lastSession || "")) p.lastSession = e.target.date.value; logEvent(t("aAddNote"), { patientName: p.name, patientId: p.id, kind: "note" }); saveDB(); close(); render(); toast(t("tNoteAdded")); });
  }

  function openProgressModal(pid) {
    const p = getPatient(pid);
    const html = `<div class="modal"><div class="modal-head"><h3>${t("mProgress")}</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <form id="prog-form"><div class="modal-body"><div class="field"><label>${t("fProgressPct")}</label>
          <div class="range-row"><input name="progress" type="range" min="0" max="100" value="${p.progress}" /><span class="rv" id="rv">${p.progress}%</span></div></div></div>
          <div class="modal-foot"><button type="submit" class="btn btn-primary">${t("save")}</button><button type="button" class="btn btn-ghost" data-modal-close>${t("cancel")}</button></div></form></div>`;
    const close = openModal(html);
    const range = $("[name=progress]");
    range.addEventListener("input", () => $("#rv").textContent = range.value + "%");
    $("#prog-form").addEventListener("submit", (e) => { e.preventDefault(); const p2 = getPatient(pid); p2.progress = +range.value; logEvent(ti("aProgress", p2.progress), { patientName: p2.name, patientId: p2.id, kind: "progress" }); saveDB(); close(); render(); toast(t("tProgressUpdated")); });
  }

  function openPlanModal(pid) {
    const p = getPatient(pid);
    const html = `<div class="modal"><div class="modal-head"><h3>${t("mPlan")}</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <form id="plan-form"><div class="modal-body"><div class="field"><label>${t("fPlanLabel")}</label>
          <div class="control"><textarea name="plan" style="min-height:130px" placeholder="${t("phPlan")}">${esc(p.plan || "")}</textarea></div></div></div>
          <div class="modal-foot"><button type="submit" class="btn btn-primary">${t("btnSavePlan")}</button><button type="button" class="btn btn-ghost" data-modal-close>${t("cancel")}</button></div></form></div>`;
    const close = openModal(html);
    $("#plan-form").addEventListener("submit", (e) => { e.preventDefault(); const p2 = getPatient(pid); p2.plan = e.target.plan.value.trim(); logEvent(t("aPlan"), { patientName: p2.name, patientId: p2.id, kind: "plan" }); saveDB(); close(); render(); toast(t("tPlanSaved")); });
  }

  function openSessionModal(pid, sid) {
    let session = null;
    if (pid && sid) session = (getPatient(pid).sessions || []).find((s) => s.id === sid);
    session = session || {};
    const needPatient = !pid;
    const patientOpts = visiblePatients().map((p) => `<option value="${p.id}" ${pid === p.id ? "selected" : ""}>${esc(p.name)}</option>`).join("");
    const html = `<div class="modal"><div class="modal-head"><h3>${sid ? t("mEditSession") : t("mAddSession")}</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <form id="session-form"><div class="modal-body">
          ${needPatient ? ctl(t("fPatient"), `<select name="patientId" required>${patientOpts}</select>`) : ""}
          <div class="grid-2">${ctl(t("fDate"), `<input name="date" type="date" required value="${esc(session.date || today())}" />`)}${ctl(t("fTime"), `<input name="time" type="time" value="${esc(session.time || "10:00")}" />`)}</div>
          ${ctl(t("fSessionTitle"), `<input name="title" placeholder="${t("phSessionTitle")}" value="${esc(session.title || "")}" />`)}
        </div><div class="modal-foot"><button type="submit" class="btn btn-primary">${t("save")}</button><button type="button" class="btn btn-ghost" data-modal-close>${t("cancel")}</button></div></form></div>`;
    const close = openModal(html);
    $("#session-form").addEventListener("submit", (e) => {
      e.preventDefault(); const f = e.target; const targetId = pid || f.patientId.value; const p = getPatient(targetId); if (!p) return;
      const data = { date: f.date.value, time: f.time.value, title: f.title.value.trim() };
      if (sid) { Object.assign(session, data); logEvent(t("aEditSession"), { patientName: p.name, patientId: p.id, kind: "session" }); }
      else { p.sessions.push(Object.assign({ id: uid() }, data)); logEvent(t("aSchedule"), { patientName: p.name, patientId: p.id, kind: "session" }); }
      saveDB(); close(); render(); toast(t("tSessionSaved"));
    });
  }

  /* ---- session details + end-of-session summary ---- */
  const sdHead = (p, s) => `<div class="sd-head">
      <div class="date-chip ${sessionUpcoming(s) ? "" : "past"}"><b>${new Date(s.date).getDate()}</b><span>${monthShort(s.date)}</span></div>
      <div><div class="sd-title">${esc(s.title || t("sesDefault"))}</div>
        <div class="sd-sub">${I.user} ${esc(p.name)} · ${I.clock} ${esc(s.time || "—")} · ${fmtDate(s.date)}</div></div>
    </div>`;

  function openSessionDetailsModal(pid, sid) {
    const p = getPatient(pid); if (!p) return;
    const s = p.sessions.find((x) => x.id === sid); if (!s) return;
    const upcoming = sessionUpcoming(s);
    const status = upcoming ? "statusUpcoming" : (s.summary ? "statusDone" : "statusPending");
    const statusCls = upcoming ? "up" : (s.summary ? "done" : "pend");
    const role = getSession().role;
    const canWrite = role === "therapist" && can("manageSessions") && !upcoming;
    const html = `<div class="modal"><div class="modal-head"><h3>${t("sessionDetails")}</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
      <div class="modal-body">
        ${sdHead(p, s)}
        <div style="margin-top:12px"><span class="status-tag ${statusCls}">${t(status)}</span></div>
        <div class="subhead" style="margin-top:18px"><h3 style="font-size:15px">${t("sessionSummary")}</h3></div>
        ${s.summary ? `<div class="plan-box">${esc(s.summary)}</div>` : `<div class="plan-box empty-plan">${t("noSummary")}</div>`}
      </div>
      <div class="modal-foot">
        ${canWrite ? `<button class="btn btn-primary" data-write-summary="${pid}|${sid}">${I.edit} ${t("writeSummaryBtn")}</button>` : ""}
        ${role === "therapist" ? `<button class="btn btn-soft" data-go-patient-modal="${pid}">${t("goToPatient")}</button>` : ""}
        <button class="btn btn-ghost" data-modal-close>${t("close")}</button>
      </div></div>`;
    const close = openModal(html);
    $$("[data-write-summary]").forEach((b) => b.addEventListener("click", () => { close(); const [pp, ss] = b.dataset.writeSummary.split("|"); openSessionSummaryModal(pp, ss); }));
    $$("[data-go-patient-modal]").forEach((b) => b.addEventListener("click", () => { close(); state.patientId = b.dataset.goPatientModal; state.route = "profile"; render(); }));
  }

  function openSessionSummaryModal(pid, sid) {
    const p = getPatient(pid); if (!p) return;
    const s = p.sessions.find((x) => x.id === sid); if (!s) return;
    const html = `<div class="modal"><div class="modal-head"><h3>${t("writeSummaryTitle")}</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
      <form id="sum-form"><div class="modal-body">
        ${sdHead(p, s)}
        <div class="login-hint" style="margin:14px 0">${I.bulb} ${t("writeSummaryHint")}</div>
        <div class="field"><label>${t("sessionSummary")}</label><div class="control"><textarea name="summary" required style="min-height:120px" placeholder="${t("phSummary")}">${esc(s.summary || "")}</textarea></div></div>
      </div><div class="modal-foot">
        <button type="submit" class="btn btn-primary">${t("btnOk")}</button>
        <button type="button" class="btn btn-ghost" data-later>${t("later")}</button>
      </div></form></div>`;
    const close = openModal(html);
    $("[data-later]").addEventListener("click", () => { dismissedPrompts.add(sid); close(); });
    $("#sum-form").addEventListener("submit", (e) => {
      e.preventDefault(); s.summary = e.target.summary.value.trim();
      logEvent(t("aSummary"), { patientName: p.name, patientId: p.id, kind: "session" });
      saveDB(); close(); render(); toast(t("tSummarySaved"));
    });
  }

  const dismissedPrompts = new Set();
  function maybePromptSessionSummary() {
    if (!can("manageSessions")) return;
    if ($("#modal-root").children.length) return;
    let target = null;
    myChatPatients().forEach((p) => p.sessions.forEach((s) => { if (!target && sessionPending(s) && !dismissedPrompts.has(s.id)) target = { pid: p.id, sid: s.id }; }));
    if (target) openSessionSummaryModal(target.pid, target.sid);
  }

  function openRecordingModal(pid) {
    if (!can("manageRecordings")) return;
    const needPatient = !pid;
    const patientOpts = visiblePatients().map((p) => `<option value="${p.id}" ${pid === p.id ? "selected" : ""}>${esc(p.name)}</option>`).join("");
    const html = `<div class="modal"><div class="modal-head"><h3>${t("mAddRec")}</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <form id="rec-form"><div class="modal-body">
          ${needPatient ? ctl(t("fPatient"), `<select name="patientId" required>${patientOpts}</select>`) : ""}
          <div class="grid-2">${ctl(t("fTitle"), `<input name="title" placeholder="${t("phRecTitle")}" />`)}${ctl(t("fDate"), `<input name="date" type="date" value="${today()}" required />`)}</div>
          ${ctl(t("fVideoLink"), `${I.video}<input name="url" type="url" required placeholder="https://..." />`)}
          <div class="login-hint">${I.bulb} ${t("recHint")}</div>
        </div><div class="modal-foot"><button type="submit" class="btn btn-primary">${t("save")}</button><button type="button" class="btn btn-ghost" data-modal-close>${t("cancel")}</button></div></form></div>`;
    const close = openModal(html);
    $("#rec-form").addEventListener("submit", (e) => { e.preventDefault(); const f = e.target; const targetId = pid || f.patientId.value; const p = getPatient(targetId); if (!p) return; p.recordings.push({ id: uid(), title: f.title.value.trim(), date: f.date.value, url: f.url.value.trim() }); logEvent(t("aAddRec"), { patientName: p.name, patientId: p.id, kind: "recording" }); saveDB(); close(); render(); toast(t("tRecAdded")); });
  }

  function openUploadModal(pid) {
    const html = `<div class="modal"><div class="modal-head"><h3>${t("mUpload")}</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <div class="modal-body"><label class="dropzone" id="dz">${I.upload}<div><b>${t("dzTitle")}</b></div><div style="font-size:13px;margin-top:4px">${t("dzSub")}</div><input type="file" id="file-input" hidden /></label>
          <div id="dz-name" style="margin-top:12px;font-weight:700;color:var(--primary)"></div></div>
        <div class="modal-foot"><button class="btn btn-primary" id="do-upload" disabled>${t("btnUploadFile")}</button><button class="btn btn-ghost" data-modal-close>${t("cancel")}</button></div></div>`;
    const close = openModal(html);
    const input = $("#file-input"); const nameEl = $("#dz-name"); const btn = $("#do-upload"); let chosen = null;
    input.addEventListener("change", () => { chosen = input.files[0] || null; if (chosen) { nameEl.textContent = chosen.name + " (" + fmtSize(chosen.size) + ")"; btn.disabled = false; } });
    btn.addEventListener("click", () => {
      if (!chosen) return; const p = getPatient(pid);
      const meta = { id: uid(), name: chosen.name, size: chosen.size, date: today() };
      const finish = () => { p.files.push(meta); logEvent(t("aUpload"), { patientName: p.name, patientId: p.id, kind: "file" }); saveDB(); close(); render(); toast(t("tFileUploaded")); };
      if (chosen.size <= 5 * 1024 * 1024) { const r = new FileReader(); r.onload = () => { meta.data = r.result; finish(); }; r.onerror = finish; r.readAsDataURL(chosen); }
      else { toast(t("fileTooBig"), "err"); finish(); }
    });
  }

  function openDoctorModal(id) {
    const me = currentDoctor(); if (!me || me.role !== "main") return;
    const editing = !!id; const d = editing ? getDoctor(id) : {};
    const perms = d.permissions || fullPerms();
    const isMain = d.role === "main";
    const permBlock = isMain ? `<div class="login-hint">${I.shield} ${t("mainAllPerms")}</div>` : `
      <div class="subhead" style="margin-top:6px"><h3 style="font-size:15px">${t("secPerms")}</h3></div>
      <div class="perm-grid">${ALL_PERMS.map((k) => `<label class="perm-row"><input type="checkbox" name="perm_${k}" ${(!editing || perms[k]) ? "checked" : ""}/><span>${t(PERM_KEY[k])}</span></label>`).join("")}</div>`;
    const html = `<div class="modal"><div class="modal-head"><h3>${editing ? t("mEditDoctor") : t("mAddDoctor")}</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <form id="doctor-form"><div class="modal-body"><div class="grid-2">
            ${ctl(t("fDocName"), `<input name="name" required value="${esc(d.name || "")}" placeholder="${t("phDocName")}" />`)}
            ${ctl(t("fTitleRole"), `<input name="title" value="${esc(d.title || "")}" placeholder="${t("phTitleRole")}" />`)}
            ${ctl(t("username"), `${I.user}<input name="username" required value="${esc(d.username || "")}" placeholder="username" />`)}
            ${ctl(t("password"), `${I.lock}<input name="password" required value="${esc(d.password || "")}" placeholder="••••" />`)}
          </div>${permBlock}</div>
          <div class="modal-foot"><button type="submit" class="btn btn-primary">${editing ? t("btnSaveChanges") : t("btnCreateAcc")}</button><button type="button" class="btn btn-ghost" data-modal-close>${t("cancel")}</button></div></form></div>`;
    const close = openModal(html);
    $("#doctor-form").addEventListener("submit", (e) => {
      e.preventDefault(); const f = e.target; const uname = f.username.value.trim();
      if (DB.doctors.find((x) => x.username === uname && x.id !== id) || DB.patients.find((p) => p.parentUsername === uname)) { toast(t("errUserExists"), "err"); return; }
      const base = { name: f.name.value.trim(), title: f.title.value.trim() || t("phTitleRole"), username: uname, password: f.password.value.trim() };
      if (editing) { Object.assign(d, base); if (!isMain) { d.permissions = {}; ALL_PERMS.forEach((k) => d.permissions[k] = !!f["perm_" + k].checked); } logEvent(ti("aEditDoc", d.name), { kind: "perms" }); toast(t("tDoctorUpdated")); }
      else { const perms2 = {}; ALL_PERMS.forEach((k) => perms2[k] = !!f["perm_" + k].checked); const nd = Object.assign({ id: uid(), role: "doctor", permissions: perms2 }, base); DB.doctors.push(nd); logEvent(ti("aCreateDoc", nd.name), { kind: "doctor" }); toast(t("tDoctorCreated")); }
      saveDB(); close(); renderTherapistContent();
    });
  }

  function removeDoctor(id) {
    const d = getDoctor(id); if (!d || d.role === "main") return;
    const count = DB.patients.filter((p) => p.doctorId === id && !p.removed).length;
    confirmDialog({ danger: true, title: t("delDoctorTitle"), confirm: t("confirmYes"), message: count ? ti("delDoctorMsgCount", count) : ti("delDoctorMsg", d.name) }, () => {
      const main = DB.doctors.find((x) => x.role === "main");
      DB.patients.forEach((p) => { if (p.doctorId === id) p.doctorId = main ? main.id : p.doctorId; });
      d.removed = true; d.removedAt = new Date().toISOString();
      logEvent(ti("aDelDoc", d.name), { kind: "doctor" });
      saveDB(); renderTherapistContent(); toast(t("tDoctorDeleted"));
    });
  }
  function restoreDoctor(id) {
    const d = getDoctor(id); if (!d) return;
    d.removed = false; logEvent(ti("aRestoreDoc", d.name), { kind: "doctor" });
    saveDB(); renderTherapistContent(); toast(t("tDoctorRestored"));
  }
  function deleteDoctorForever(id) {
    const d = getDoctor(id); if (!d || d.role === "main") return;
    confirmDialog({ danger: true, title: t("delForeverTitle"), confirm: t("deleteForever"), message: ti("delDoctorMsg", d.name) }, () => {
      DB.doctors = DB.doctors.filter((x) => x.id !== id);
      logEvent(ti("aDelDoc", d.name), { kind: "doctor" });
      saveDB(); renderTherapistContent(); toast(t("tDoctorDeleted"));
    });
  }

  /* ============================================================
     CHAT (two-way)
     ============================================================ */
  function openInboxModal() {
    const list = myChatPatients().filter((p) => p.chat.length)
      .map((p) => ({ p, last: p.chat[p.chat.length - 1], unread: p.chat.filter((m) => m.from === "parent" && !m.read).length }))
      .sort((a, b) => (b.last.ts || "").localeCompare(a.last.ts || ""));
    const html = `<div class="modal"><div class="modal-head"><h3>${t("inboxTitle")} <span class="count">${list.length}</span></h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <div class="modal-body">${list.length === 0 ? `<div class="empty">${I.message}<p>${t("inboxEmpty")}</p></div>`
            : `<div class="inbox-list">${list.map((it) => `<button class="inbox-item" data-open-chat="${it.p.id}">
                  ${ava(it.p, "md")}
                  <div class="inbox-main"><div class="it-top"><b>${esc(it.p.guardian || t("lblParent"))}</b><span class="it-time">${fmtDateTime(it.last.ts)}</span></div>
                    <div class="it-prev">${esc(it.p.name)} · ${esc(it.last.text)}</div></div>
                  ${it.unread ? `<span class="ibadge">${it.unread}</span>` : ""}</button>`).join("")}</div>`}</div>
        <div class="modal-foot"><button class="btn btn-ghost" data-modal-close>${t("close")}</button></div></div>`;
    const close = openModal(html, render);
    $$("[data-open-chat]").forEach((b) => b.addEventListener("click", () => { close(); openChatModal(b.dataset.openChat); }));
  }

  function openChatModal(pid) {
    const role = getSession().role;
    const me = role === "therapist" ? "doctor" : "parent";
    const other = me === "doctor" ? "parent" : "doctor";
    const p = getPatient(pid);
    const headName = me === "doctor" ? (p.guardian || t("lblParent")) : doctorName(p.doctorId);
    const headSub = me === "doctor" ? ti("chSubDoctor", p.name) : t("chSubParent");
    const html = `<div class="modal chat-modal">
        <div class="modal-head chat-head"><div class="ch-id"><div class="ava md ${avaClass(pid)}">${esc(initials(headName))}</div>
            <div><div class="chn">${esc(headName)}</div><div class="chs">${esc(headSub)}</div></div></div>
          <button class="icon-btn" data-modal-close>${I.x}</button></div>
        <div class="chat-body" id="chat-body"></div>
        <form id="chat-form" class="chat-form"><input id="chat-input" autocomplete="off" placeholder="${t("chPlaceholder")}" /><button class="btn btn-primary" type="submit">${I.send}</button></form></div>`;
    const close = openModal(html, render);
    function paint() {
      const pp = getPatient(pid);
      let changed = false; pp.chat.forEach((m) => { if (m.from === other && !m.read) { m.read = true; changed = true; } }); if (changed) saveDB();
      const msgs = pp.chat.slice().sort((a, b) => (a.ts || "").localeCompare(b.ts || ""));
      const body = $("#chat-body");
      body.innerHTML = msgs.length ? msgs.map((m) => `<div class="chat-bubble ${m.from === me ? "mine" : "theirs"}"><p>${esc(m.text)}</p><span class="cb-time">${esc(m.senderName)} · ${fmtTime(m.ts)}</span></div>`).join("")
        : `<div class="chat-empty">${I.chat}<p>${t("chEmpty")}</p></div>`;
      body.scrollTop = body.scrollHeight;
    }
    paint();
    $("#chat-form").addEventListener("submit", (e) => {
      e.preventDefault(); const inp = $("#chat-input"); const text = inp.value.trim(); if (!text) return;
      const pp = getPatient(pid);
      const senderName = me === "doctor" ? currentDoctor().name : (pp.guardian || t("lblParent"));
      pp.chat.push({ id: uid(), ts: new Date().toISOString(), from: me, senderName, text, read: false });
      logEvent(t("chatLogLabel") + " — " + senderName + ": " + text, { doctor: getDoctor(pp.doctorId), patientName: pp.name, patientId: pp.id, kind: "message" });
      saveDB(); inp.value = ""; paint();
    });
    setTimeout(() => { const ci = $("#chat-input"); if (ci) ci.focus(); }, 50);
  }

  /* ============================================================
     PARENT SHELL
     ============================================================ */
  function ParentShell(session) {
    const p = getPatient(session.patientId);
    if (!p) return `<div class="shell"><div class="main"><div class="content"><div class="card"><div class="empty">${I.user}<p>—</p></div></div></div></div></div>`;
    const unread = parentUnread(p);
    return `
    <div class="shell ${state.navOpen ? "nav-open" : ""}"><div class="scrim" data-close-nav></div>
      <aside class="sidebar"><button class="icon-btn nav-close" data-close-nav title="${t("close")}">${I.x}</button>${Brand("subParent", true)}
        <div class="sidebar-user">${ava(p, "md")}
          <div class="meta"><strong>${esc(p.guardian || t("lblParent"))}</strong><span>${ti("chSubDoctor", p.name)}</span></div></div>
        <nav class="nav">
          <button class="nav-item active">${I.home}<span>${t("nMyChild")}</span></button>
          <button class="nav-item" data-chat="${p.id}">${I.chat}<span>${t("nChat")}</span>${unread ? `<span class="nav-badge">${unread}</span>` : ""}</button>
          <div class="nav-spacer"></div>
          ${ThemeNavItem()}
          <button class="nav-item logout" data-logout>${I.logout}<span>${t("nLogout")}</span></button>
        </nav>
      </aside>
      <div class="main">
        <div class="topbar"><div style="display:flex;align-items:center;gap:12px">
            <button class="icon-btn hamburger" data-toggle-nav>${I.menu}</button>
            <div class="page-title">${t("nMyChild")}</div></div>
          <div class="right">${LangSwitcher()}
            <span class="ro-badge">${I.eye} ${t("badgeReadonly")}</span></div></div>
        <div class="content" id="content">${ProfileView(p, true)}</div>
      </div>
    </div>`;
  }

  function afterParent() {
    bindShell();
    $$("[data-chat]").forEach((b) => b.addEventListener("click", () => openChatModal(b.dataset.chat)));
    $$("[data-edit-parent]").forEach((b) => b.addEventListener("click", () => openParentEditModal(b.dataset.editParent)));
    $$("[data-doc-profile]").forEach((b) => b.addEventListener("click", () => openDoctorProfileModal(b.dataset.docProfile)));
    $$("[data-session]").forEach((el) => el.addEventListener("click", (e) => { if (e.target.closest("button")) return; const [pid, sid] = el.dataset.session.split("|"); openSessionDetailsModal(pid, sid); }));
    bindDownloads();
    bindAvatarUploads();
  }

  function openParentEditModal(pid) {
    const p = getPatient(pid); if (!p) return;
    const html = `<div class="modal"><div class="modal-head"><h3>${t("mEditBasic")}</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <form id="pe-form"><div class="modal-body">
          <div style="display:flex;justify-content:center;margin-bottom:16px">${avaEditable(p, "lg", "patient")}</div>
          ${ctl(t("fChildName"), `<input name="name" required value="${esc(p.name || "")}" placeholder="${t("fFullName")}" />`)}
          <div class="grid-2">${ctl(t("fPhoneNum"), `<input name="phone" value="${esc(p.phone || "")}" placeholder="05xxxxxxxx" />`)}${ctl(t("cAge"), `<input name="age" type="number" min="1" max="18" value="${esc(p.age || "")}" />`)}</div>
          ${ctl(t("fBirth"), `<input name="birthDate" type="date" value="${esc(p.birthDate || "")}" />`)}
          <div class="login-hint">${I.bulb} ${t("parentEditHint")}</div>
        </div><div class="modal-foot"><button type="submit" class="btn btn-primary">${t("save")}</button><button type="button" class="btn btn-ghost" data-modal-close>${t("cancel")}</button></div></form></div>`;
    const close = openModal(html);
    bindAvatarUploads($("#modal-root"));
    $("#pe-form").addEventListener("submit", (e) => {
      e.preventDefault(); const f = e.target;
      p.name = f.name.value.trim(); p.phone = f.phone.value.trim();
      if (f.birthDate.value) p.birthDate = f.birthDate.value;
      if (f.age.value) p.age = +f.age.value;
      logEvent(t("aParentEdit"), { actorName: (p.guardian || t("lblParent")) + " (" + ti("parentOf", p.name) + ")", patientName: p.name, patientId: p.id, kind: "patient" });
      saveDB(); close(); render(); toast(t("tDetailsUpdated"));
    });
  }

  /* ============================================================
     Boot
     ============================================================ */
  loadDB();
  try { const sl = parseInt(localStorage.getItem(LANG_KEY)); if (!isNaN(sl) && sl >= 0 && sl < LANGS.length) L = sl; } catch (e) {}
  try { dark = localStorage.getItem(THEME_KEY) === "1"; } catch (e) {}
  applyTheme();
  const sess = getSession();
  if (sess && sess.role === "therapist") state.route = "dashboard";
  render();

  // back-to-top button
  const topBtn = document.createElement("button");
  topBtn.id = "to-top"; topBtn.innerHTML = I.arrowUp; topBtn.title = t("toTop");
  topBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
  document.body.appendChild(topBtn);
  const onScroll = () => topBtn.classList.toggle("show", window.scrollY > 300);
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // idle auto-logout (5 min)
  ["mousemove", "mousedown", "keydown", "scroll", "touchstart", "click"].forEach((ev) => document.addEventListener(ev, resetIdle, { passive: true }));
  resetIdle();

  window.LittleTalkersReset = function () { localStorage.removeItem(DB_KEY); localStorage.removeItem(SESSION_KEY); location.reload(); };
})();
