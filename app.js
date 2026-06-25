/* ============================================================
   Little Talkers — MVP for a Speech & Language Therapy Clinic
   Vanilla JS SPA. Data persisted in localStorage.
   Roles: therapist (main | doctor) | parent (read-only)
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
    arrowR: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>',
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
  };

  /* ---------------- Utilities ---------------- */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  const initials = (name) => {
    const p = String(name).replace(/^د\.\s*/, "").trim().split(/\s+/);
    return ((p[0] || "")[0] || "") + ((p[1] || "")[0] || "");
  };
  const avaClass = (id) => "ava-c" + (Math.abs(hashStr(id)) % 5);
  function hashStr(s) { let h = 0; for (let i = 0; i < String(s).length; i++) h = (h << 5) - h + s.charCodeAt(i); return h; }
  const today = () => new Date().toISOString().slice(0, 10);
  const isUpcoming = (d) => d >= today();
  function fmtDate(d) {
    if (!d) return "—";
    try { return new Intl.DateTimeFormat("ar-EG", { year: "numeric", month: "long", day: "numeric" }).format(new Date(d)); }
    catch (e) { return d; }
  }
  function fmtDateTime(ts) {
    if (!ts) return "—";
    try {
      return new Intl.DateTimeFormat("ar-EG", { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(ts));
    } catch (e) { return ts; }
  }
  function fmtSize(b) {
    if (b == null) return "";
    if (b < 1024) return b + " B";
    if (b < 1048576) return (b / 1024).toFixed(1) + " KB";
    return (b / 1048576).toFixed(1) + " MB";
  }

  /* ============================================================
     Data store (localStorage)  — schema v2
     ============================================================ */
  const DB_KEY = "littletalkers.db.v2";
  const SESSION_KEY = "littletalkers.session.v2";

  function seed() {
    const doctors = [
      { id: "d-main", username: "doctor", password: "1234", name: "د. سارة محمد", title: "أخصائية نطق وتخاطب", role: "main" },
      { id: "d-2", username: "khaled", password: "1234", name: "د. خالد إبراهيم", title: "أخصائي تخاطب", role: "doctor" },
    ];
    const patients = [
      mkPatient({
        name: "أحمد خالد", age: 7, gender: "ذكر", guardian: "خالد عبدالله", phone: "0501234567",
        diagnosis: "تأخر في النطق", progress: 65, lastSession: "2024-05-20", doctorId: "d-main",
        parentUsername: "ahmad", parentPassword: "1234",
        plan: "التركيز على نطق حرف الراء من خلال تمارين أمام المرآة، ومراجعة بطاقات الكلمات المنزلية ثلاث مرات أسبوعياً.",
        notes: [
          { id: uid(), date: "2024-05-20", text: "تحسن ملحوظ في نطق الكلمات القصيرة. استجابة جيدة للتمارين الجديدة وتفاعل إيجابي خلال الجلسة." },
          { id: uid(), date: "2024-05-13", text: "بدأنا تمارين مخارج حرف الراء. يحتاج إلى مزيد من التكرار المنزلي." },
        ],
        sessions: [
          { id: uid(), date: "2026-06-28", time: "10:00", title: "تمارين حرف الراء أمام المرآة" },
          { id: uid(), date: "2026-07-05", time: "10:00", title: "مراجعة بطاقات الكلمات" },
        ],
        files: [{ id: uid(), name: "تقرير_التقييم_الأولي.pdf", size: 248000, date: "2024-05-06" }],
      }),
      mkPatient({
        name: "ليان محمد", age: 5, gender: "أنثى", guardian: "محمد سعيد", phone: "0559876543",
        diagnosis: "اضطراب في مخارج الحروف", progress: 40, lastSession: "2024-05-18", doctorId: "d-2",
        parentUsername: "layan", parentPassword: "1234",
        plan: "تمارين تقوية عضلات الفم، وتكرار أصوات الحروف (س، ش، ث) مع الأهل يومياً لمدة عشر دقائق.",
        notes: [{ id: uid(), date: "2024-05-18", text: "تتقن نطق حرف السين بشكل أفضل. ما زالت تخلط بين السين والشين أحياناً." }],
        sessions: [{ id: uid(), date: "2026-06-27", time: "11:30", title: "تقوية عضلات الفم" }],
        files: [],
      }),
      mkPatient({
        name: "سليم محمود", age: 6, gender: "ذكر", guardian: "محمود فهد", phone: "0533219876",
        diagnosis: "التلعثم", progress: 30, lastSession: "2024-05-17", doctorId: "d-main",
        parentUsername: "saleem", parentPassword: "1234",
        plan: "تطبيق تقنية الكلام البطيء، وتمارين التنفس قبل بدء الحديث، وتقليل الضغط أثناء التواصل في المنزل.",
        notes: [{ id: uid(), date: "2024-05-17", text: "تحسن بسيط في طلاقة الكلام عند استخدام تقنية التنفس. يحتاج بيئة هادئة للتدرب." }],
        sessions: [{ id: uid(), date: "2026-06-30", time: "09:00", title: "تمارين التنفس وتقنية الكلام البطيء" }],
        files: [],
      }),
      mkPatient({
        name: "نور علي", age: 4, gender: "أنثى", guardian: "علي حسن", phone: "0567452310",
        diagnosis: "ضعف في التواصل", progress: 50, lastSession: "2024-05-15", doctorId: "d-2",
        parentUsername: "noor", parentPassword: "1234",
        plan: "تشجيع التواصل البصري واللعب التفاعلي، واستخدام البطاقات المصورة لتوسيع الحصيلة اللغوية.",
        notes: [{ id: uid(), date: "2024-05-15", text: "تفاعل أفضل مع البطاقات المصورة وبدأت تشير إلى احتياجاتها. تواصل بصري متزايد." }],
        sessions: [{ id: uid(), date: "2026-07-02", time: "12:00", title: "جلسة بطاقات مصورة تفاعلية" }],
        files: [],
      }),
    ];
    const logs = [
      { id: uid(), ts: "2024-05-20T10:30:00", doctorId: "d-main", doctorName: "د. سارة محمد", action: "أضافت ملاحظة جلسة", patientName: "أحمد خالد", patientId: patients[0].id, kind: "note" },
      { id: uid(), ts: "2024-05-18T09:15:00", doctorId: "d-2", doctorName: "د. خالد إبراهيم", action: "حدّث نسبة التقدم", patientName: "ليان محمد", patientId: patients[1].id, kind: "progress" },
    ];
    return { doctors, patients, logs, messages: [] };
  }

  function mkPatient(p) {
    return Object.assign({ id: uid(), notes: [], files: [], sessions: [], plan: "", doctorId: "d-main" }, p);
  }

  let DB;
  function loadDB() {
    try { const raw = localStorage.getItem(DB_KEY); if (raw) { DB = JSON.parse(raw); return; } } catch (e) {}
    DB = seed(); saveDB();
  }
  function saveDB() { try { localStorage.setItem(DB_KEY, JSON.stringify(DB)); } catch (e) {} }
  function getSession() { try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; } }
  function setSession(s) { if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s)); else localStorage.removeItem(SESSION_KEY); }

  const getPatient = (id) => DB.patients.find((p) => p.id === id);
  const getDoctor = (id) => DB.doctors.find((d) => d.id === id);
  const currentDoctor = () => { const s = getSession(); return s && s.role === "therapist" ? getDoctor(s.doctorId) : null; };
  const doctorName = (id) => { const d = getDoctor(id); return d ? d.name : "—"; };

  /* activity log */
  function logEvent(action, opts) {
    opts = opts || {};
    const doc = opts.doctor || currentDoctor();
    DB.logs.unshift({
      id: uid(), ts: new Date().toISOString(),
      doctorId: doc ? doc.id : null,
      doctorName: opts.actorName || (doc ? doc.name : "النظام"),
      action: action, patientName: opts.patientName || "", patientId: opts.patientId || null,
      kind: opts.kind || "info",
    });
    if (DB.logs.length > 500) DB.logs.length = 500;
  }

  /* messages addressed to a doctor (main sees all) */
  function inboxFor(doc) {
    if (!doc) return [];
    return DB.messages.filter((m) => doc.role === "main" || m.doctorId === doc.id);
  }
  const unreadCount = (doc) => inboxFor(doc).filter((m) => !m.read).length;

  /* ---------------- App state ---------------- */
  const freshState = () => ({ route: "login", loginRole: "therapist", patientId: null, showAll: false, navOpen: false,
    filters: { search: "", doctor: "", diagnosis: "", sort: "recent" }, logDoctor: "" });
  let state = freshState();

  /* ---------------- Toast ---------------- */
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
    const app = $("#app");
    const session = getSession();
    if (!session) { app.innerHTML = LoginView(); afterLogin(); return; }
    if (session.role === "therapist") {
      if (!getDoctor(session.doctorId)) { setSession(null); render(); return; }
      app.innerHTML = TherapistShell(); afterTherapist();
    } else {
      app.innerHTML = ParentShell(session); afterParent();
    }
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
          ${Brand("متحدثون صغار")}
          <h1>رعاية متخصّصة لنطق وتخاطب أطفالكم</h1>
          <p>منصة بسيطة تجمع الأخصائي وأولياء الأمور في مكان واحد لمتابعة تقدم الجلسات العلاجية بكل سهولة وطمأنينة.</p>
        </div>
        <svg class="brain-art" viewBox="0 0 200 200" fill="#c9bdf0" opacity=".6"><path d="M100 30c30 0 50 20 55 45 8 5 12 14 8 24-3 8-10 12-18 12-6 14-22 22-45 22s-39-8-45-22c-8 0-15-4-18-12-4-10 0-19 8-24 5-25 25-45 55-45z"/></svg>
      </aside>
      <div class="login-panel">
        <div class="login-card">
          <div style="margin-bottom:30px">${Brand("متحدثون صغار")}</div>
          <h2>أهلاً بعودتك 👋</h2>
          <p class="sub">سجّل الدخول للمتابعة إلى حسابك</p>
          <div class="seg">
            <button data-role="therapist" class="${r === "therapist" ? "on" : ""}">${I.stetho} الأخصائي</button>
            <button data-role="parent" class="${r === "parent" ? "on" : ""}">${I.users} ولي الأمر</button>
          </div>
          <form id="login-form">
            <div id="login-error"></div>
            <div class="field"><label>اسم المستخدم</label>
              <div class="control">${I.user}<input name="username" autocomplete="username" placeholder="أدخل اسم المستخدم" /></div></div>
            <div class="field"><label>كلمة المرور</label>
              <div class="control">${I.lock}<input name="password" type="password" autocomplete="current-password" placeholder="••••••••" />
                <button type="button" class="toggle-eye" data-eye>${I.eye}</button></div></div>
            <button class="btn btn-primary btn-block" type="submit" style="margin-top:6px">تسجيل الدخول</button>
          </form>
          <div class="login-hint">
            ${r === "therapist"
              ? `<b>حساب تجريبي للأخصائي:</b><br>المستخدم: <b>doctor</b> — كلمة المرور: <b>1234</b>`
              : `<b>حساب تجريبي لولي الأمر:</b><br>المستخدم: <b>ahmad</b> — كلمة المرور: <b>1234</b>`}
          </div>
        </div>
      </div>
    </div>`;
  }

  function Brand(subtitle) {
    return `<div class="logo">
      <div class="logo-mark">${I.logo}</div>
      <div class="logo-text"><strong>Little Talkers</strong><span>${esc(subtitle)}</span></div>
    </div>`;
  }

  function afterLogin() {
    $$("[data-role]").forEach((b) => b.addEventListener("click", () => { state.loginRole = b.dataset.role; render(); }));
    const eye = $("[data-eye]");
    if (eye) eye.addEventListener("click", () => {
      const inp = eye.previousElementSibling;
      const show = inp.type === "password";
      inp.type = show ? "text" : "password";
      eye.innerHTML = show ? I.eyeOff : I.eye;
    });
    const form = $("#login-form");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const u = form.username.value.trim(); const p = form.password.value;
      if (state.loginRole === "therapist") {
        const doc = DB.doctors.find((d) => d.username === u && d.password === p);
        if (doc) { setSession({ role: "therapist", doctorId: doc.id }); state.route = "dashboard"; render(); return; }
      } else {
        const pt = DB.patients.find((x) => x.parentUsername === u && x.parentPassword === p);
        if (pt) { setSession({ role: "parent", patientId: pt.id }); render(); return; }
      }
      $("#login-error").innerHTML = `<div class="form-error">بيانات الدخول غير صحيحة. تأكد من اسم المستخدم وكلمة المرور.</div>`;
    });
  }

  /* ============================================================
     THERAPIST SHELL
     ============================================================ */
  function TherapistShell() {
    return `
    <div class="shell ${state.navOpen ? "nav-open" : ""}">
      <div class="scrim" data-close-nav></div>
      ${Sidebar()}
      <div class="main">
        ${Topbar()}
        <div class="content" id="content"></div>
      </div>
    </div>`;
  }

  function Sidebar() {
    const doc = currentDoctor();
    const route = state.route;
    const items = [
      ["dashboard", I.home, "لوحة التحكم"],
      ["patients", I.users, "المتعالجين"],
      ["sessions", I.calendar, "الجلسات القادمة"],
      ["log", I.history, "سجل النشاط"],
    ];
    if (doc && doc.role === "main") items.push(["doctors", I.stetho, "الأطباء"]);
    items.push(["add", I.userPlus, "إضافة متعالج"]);

    const active = (key) => route === key || (key === "patients" && route === "profile");
    return `
    <aside class="sidebar">
      ${Brand("لوحة الأخصائي")}
      <div class="sidebar-user">
        <div class="ava md ${avaClass(doc.id)}">${esc(initials(doc.name))}</div>
        <div class="meta"><strong>${esc(doc.name)}</strong><span>${esc(doc.title)}${doc.role === "main" ? " · رئيسي" : ""}</span></div>
      </div>
      <nav class="nav">
        ${items.map(([k, ic, label]) =>
          `<button class="nav-item ${active(k) ? "active" : ""}" data-nav="${k}">${ic}<span>${label}</span></button>`).join("")}
        <div class="nav-spacer"></div>
        <button class="nav-item logout" data-logout>${I.logout}<span>تسجيل الخروج</span></button>
      </nav>
    </aside>`;
  }

  function Topbar() {
    const doc = currentDoctor();
    const unread = unreadCount(doc);
    const titles = { dashboard: "لوحة التحكم", patients: "المتعالجين", sessions: "الجلسات القادمة", log: "سجل النشاط", doctors: "الأطباء", profile: "ملف المتعالج" };
    return `
    <div class="topbar">
      <div style="display:flex;align-items:center;gap:12px">
        <button class="icon-btn hamburger" data-toggle-nav>${I.menu}</button>
        <div class="page-title">${titles[state.route] || "لوحة التحكم"}</div>
      </div>
      <div class="right">
        <span class="greet">مرحباً <b>${esc(doc.name)}</b></span>
        <button class="icon-btn bell" data-inbox title="الرسائل">${I.bell}${unread ? `<span class="count">${unread}</span>` : `<span class="dot"></span>`}</button>
        <div class="ava md ${avaClass(doc.id)}">${esc(initials(doc.name))}</div>
      </div>
    </div>`;
  }

  function afterTherapist() {
    bindShell();
    $$("[data-inbox]").forEach((b) => b.addEventListener("click", openInboxModal));
    renderTherapistContent();
  }

  function renderTherapistContent() {
    const c = $("#content");
    if (!c) return;
    switch (state.route) {
      case "dashboard": c.innerHTML = DashboardView(); break;
      case "patients": c.innerHTML = PatientsView(); break;
      case "sessions": c.innerHTML = SessionsView(); break;
      case "log": c.innerHTML = LogView(); break;
      case "doctors": c.innerHTML = DoctorsView(); break;
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
    const lo = $("[data-logout]");
    if (lo) lo.addEventListener("click", () => { setSession(null); state = freshState(); render(); });
    const tg = $("[data-toggle-nav]"); if (tg) tg.addEventListener("click", () => { state.navOpen = !state.navOpen; render(); });
    const sc = $("[data-close-nav]"); if (sc) sc.addEventListener("click", () => { state.navOpen = false; render(); });
  }

  /* ============================================================
     DASHBOARD
     ============================================================ */
  function DashboardView() {
    const ps = DB.patients;
    const total = ps.length;
    const sessionsLogged = ps.reduce((n, p) => n + p.notes.length, 0);
    const reports = ps.reduce((n, p) => n + p.files.length, 0);
    const upcoming = ps.reduce((n, p) => n + p.sessions.filter((s) => isUpcoming(s.date)).length, 0);

    const stats = [
      ["purple", I.users, "إجمالي المتعالجين", total, "جميع المتعالجين", "patients"],
      ["amber", I.calendar, "الجلسات القادمة", upcoming, "جلسات مجدولة", "sessions"],
      ["green", I.check, "الجلسات المسجّلة", sessionsLogged, "ملاحظات مكتملة", "log"],
      ["blue", I.report, "التقارير", reports, "ملفات مرفوعة", "patients"],
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
      <div class="note-banner">
        <div class="ico">${I.bulb}</div>
        <div><h4>ملاحظة</h4><p>لا تنسَ إضافة ملاحظات الجلسة بعد كل جلسة لمتابعة تقدّم المتعالج.</p></div>
      </div>`;
  }

  /* ============================================================
     PATIENTS LIST + FILTERS
     ============================================================ */
  function applyFilters() {
    const f = state.filters;
    let list = DB.patients.slice();
    const q = f.search.trim();
    if (q) list = list.filter((p) => p.name.includes(q) || (p.diagnosis || "").includes(q) || (p.guardian || "").includes(q));
    if (f.doctor) list = list.filter((p) => p.doctorId === f.doctor);
    if (f.diagnosis) list = list.filter((p) => p.diagnosis === f.diagnosis);
    if (f.sort === "recent") list.sort((a, b) => (b.lastSession || "").localeCompare(a.lastSession || ""));
    else if (f.sort === "progress-high") list.sort((a, b) => b.progress - a.progress);
    else if (f.sort === "progress-low") list.sort((a, b) => a.progress - b.progress);
    else if (f.sort === "name") list.sort((a, b) => a.name.localeCompare(b.name, "ar"));
    return list;
  }

  function PatientsView(compact) {
    const f = state.filters;
    let list = applyFilters();
    const limit = compact && !state.showAll ? 4 : list.length;
    const shown = list.slice(0, limit);
    const hasMore = list.length > limit;
    const diagnoses = Array.from(new Set(DB.patients.map((p) => p.diagnosis))).filter(Boolean);

    const rows = shown.map((p) => `
      <tr data-row="${p.id}">
        <td><div class="cell-name">
          <div class="ava md ${avaClass(p.id)}">${esc(initials(p.name))}</div>
          <div><div class="nm">${esc(p.name)}</div><div class="sb">${esc(p.guardian || "")}</div></div>
        </div></td>
        <td>${esc(p.age)} سنوات</td>
        <td><span class="tag">${esc(p.diagnosis)}</span></td>
        <td><span class="doc-pill">${I.stetho}${esc((getDoctor(p.doctorId) || {}).name || "—")}</span></td>
        <td>${fmtDate(p.lastSession)}</td>
        <td><div class="progress"><span class="pct">${p.progress}%</span><div class="bar"><i style="width:${p.progress}%"></i></div></div></td>
        <td><div class="row-actions">
          <button class="icon-btn" data-open="${p.id}" title="فتح الملف">${I.folder}</button>
          <button class="icon-btn" data-edit="${p.id}" title="تعديل">${I.edit}</button>
          <button class="icon-btn danger" data-remove="${p.id}" title="حذف">${I.trash}</button>
        </div></td>
      </tr>`).join("");

    const body = list.length === 0
      ? `<tr><td colspan="7"><div class="empty">${I.users}<p>${(f.search || f.doctor || f.diagnosis) ? "لا توجد نتائج مطابقة للفلاتر." : "لا يوجد متعالجون بعد. ابدأ بإضافة متعالج جديد."}</p></div></td></tr>`
      : rows;

    const filterBar = compact ? "" : `
      <div class="filterbar">
        <div class="search">${I.search}<input id="patient-search" placeholder="ابحث بالاسم أو التشخيص..." value="${esc(f.search)}" /></div>
        <label class="fsel">${I.stetho}<select data-filter="doctor">
          <option value="">كل الأطباء</option>
          ${DB.doctors.map((d) => `<option value="${d.id}" ${f.doctor === d.id ? "selected" : ""}>${esc(d.name)}</option>`).join("")}
        </select></label>
        <label class="fsel">${I.filter}<select data-filter="diagnosis">
          <option value="">كل التشخيصات</option>
          ${diagnoses.map((d) => `<option ${f.diagnosis === d ? "selected" : ""}>${esc(d)}</option>`).join("")}
        </select></label>
        <label class="fsel">${I.sort}<select data-filter="sort">
          <option value="recent" ${f.sort === "recent" ? "selected" : ""}>الأحدث جلسة</option>
          <option value="progress-high" ${f.sort === "progress-high" ? "selected" : ""}>الأعلى تقدماً</option>
          <option value="progress-low" ${f.sort === "progress-low" ? "selected" : ""}>الأقل تقدماً</option>
          <option value="name" ${f.sort === "name" ? "selected" : ""}>الاسم (أ-ي)</option>
        </select></label>
        ${(f.search || f.doctor || f.diagnosis || f.sort !== "recent") ? `<button class="btn btn-ghost btn-sm" data-clear-filters>${I.x} مسح</button>` : ""}
      </div>`;

    const inner = `
      <div class="card-head">
        <h3>المتعالجين ${compact ? "" : `<span class="count">${list.length}</span>`}</h3>
        <div class="tools">
          ${compact ? `<div class="search">${I.search}<input id="patient-search" placeholder="ابحث عن متعالج..." value="${esc(f.search)}" /></div>` : ""}
          <button class="btn btn-primary" data-add>${I.plus} إضافة متعالج</button>
        </div>
      </div>
      ${filterBar}
      <div class="table-wrap"><table class="patients">
        <thead><tr><th>الاسم</th><th>العمر</th><th>التشخيص</th><th>الطبيب المعالج</th><th>آخر جلسة</th><th>التقدم</th><th>الإجراءات</th></tr></thead>
        <tbody>${body}</tbody>
      </table></div>
      ${hasMore ? `<div class="show-more"><button data-showall>عرض المزيد ${I.chevDown}</button></div>` : ""}`;

    return compact ? `<div class="card">${inner}</div>` : `<div class="card">${inner}</div>`;
  }

  /* ============================================================
     UPCOMING SESSIONS (all patients)
     ============================================================ */
  function allSessions(onlyUpcoming) {
    const out = [];
    DB.patients.forEach((p) => p.sessions.forEach((s) =>
      out.push(Object.assign({ patientId: p.id, patientName: p.name, doctorId: p.doctorId }, s))));
    let list = out;
    if (onlyUpcoming) list = list.filter((s) => isUpcoming(s.date));
    list.sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
    return list;
  }

  function SessionsView() {
    const list = allSessions(false);
    const upcoming = list.filter((s) => isUpcoming(s.date));
    const past = list.filter((s) => !isUpcoming(s.date)).reverse();

    const item = (s) => `
      <div class="session-item" data-go-patient="${s.patientId}">
        <div class="date-chip"><b>${new Date(s.date).getDate()}</b><span>${new Intl.DateTimeFormat("ar-EG", { month: "short" }).format(new Date(s.date))}</span></div>
        <div class="session-main">
          <div class="st">${esc(s.title || "جلسة علاجية")}</div>
          <div class="ss">${I.user} ${esc(s.patientName)} · ${I.clock} ${esc(s.time || "—")} · ${esc(doctorName(s.doctorId))}</div>
        </div>
        <div class="row-actions">
          <button class="icon-btn" data-edit-session="${s.patientId}|${s.id}" title="تعديل">${I.edit}</button>
          <button class="icon-btn danger" data-del-session="${s.patientId}|${s.id}" title="حذف">${I.trash}</button>
        </div>
      </div>`;

    return `
      <div class="card">
        <div class="card-head"><h3>الجلسات القادمة <span class="count">${upcoming.length}</span></h3>
          <div class="tools"><button class="btn btn-primary" data-add-session>${I.plus} جدولة جلسة</button></div></div>
        ${upcoming.length === 0
          ? `<div class="empty">${I.calendar}<p>لا توجد جلسات قادمة مجدولة.</p></div>`
          : `<div class="session-list">${upcoming.map(item).join("")}</div>`}
      </div>
      ${past.length ? `<div class="card" style="margin-top:20px">
        <div class="subhead"><h3>جلسات سابقة</h3><span class="count">${past.length}</span></div>
        <div class="session-list muted">${past.map(item).join("")}</div></div>` : ""}`;
  }

  /* ============================================================
     ACTIVITY LOG
     ============================================================ */
  function LogView() {
    let logs = DB.logs.slice();
    if (state.logDoctor) logs = logs.filter((l) => l.doctorId === state.logDoctor);
    const kindIco = { note: I.edit, progress: I.activity, plan: I.bulb, file: I.file, patient: I.userPlus, remove: I.trash, session: I.calendar, doctor: I.stetho, message: I.message, info: I.history };

    return `
      <div class="card">
        <div class="card-head"><h3>سجل النشاط <span class="count">${logs.length}</span></h3>
          <div class="tools"><label class="fsel">${I.stetho}<select data-log-doctor>
            <option value="">كل الأطباء</option>
            ${DB.doctors.map((d) => `<option value="${d.id}" ${state.logDoctor === d.id ? "selected" : ""}>${esc(d.name)}</option>`).join("")}
          </select></label></div></div>
        ${logs.length === 0
          ? `<div class="empty">${I.history}<p>لا توجد أحداث مسجّلة بعد.</p></div>`
          : `<div class="log-list">${logs.map((l) => `
              <div class="log-item ${l.patientId ? "clickable" : ""}" ${l.patientId ? `data-go-patient="${l.patientId}"` : ""}>
                <div class="log-ico">${kindIco[l.kind] || I.history}</div>
                <div class="log-main">
                  <div class="lt"><b>${esc(l.doctorName)}</b> ${esc(l.action)}${l.patientName ? ` — <span class="lp">${esc(l.patientName)}</span>` : ""}</div>
                  <div class="ls">${I.clock} ${fmtDateTime(l.ts)}</div>
                </div>
              </div>`).join("")}</div>`}
      </div>`;
  }

  /* ============================================================
     DOCTORS (main only)
     ============================================================ */
  function DoctorsView() {
    const me = currentDoctor();
    if (!me || me.role !== "main") return `<div class="card"><div class="empty">${I.shield}<p>هذه الصفحة متاحة للطبيب الرئيسي فقط.</p></div></div>`;
    const counts = {};
    DB.patients.forEach((p) => counts[p.doctorId] = (counts[p.doctorId] || 0) + 1);
    return `
      <div class="card">
        <div class="card-head"><h3>الأطباء <span class="count">${DB.doctors.length}</span></h3>
          <div class="tools"><button class="btn btn-primary" data-add-doctor>${I.plus} إضافة طبيب</button></div></div>
        <div class="doctor-list">
          ${DB.doctors.map((d) => `
            <div class="doctor-item">
              <div class="ava md ${avaClass(d.id)}">${esc(initials(d.name))}</div>
              <div class="doctor-main">
                <div class="dn">${esc(d.name)} ${d.role === "main" ? `<span class="role-tag main">${I.shield} رئيسي</span>` : `<span class="role-tag">طبيب</span>`}</div>
                <div class="ds">${esc(d.title)} · المستخدم: <b>${esc(d.username)}</b> · ${counts[d.id] || 0} متعالج</div>
              </div>
              ${d.role === "main" ? "" : `<button class="icon-btn danger" data-del-doctor="${d.id}" title="حذف">${I.trash}</button>`}
            </div>`).join("")}
        </div>
        <div class="login-hint" style="margin-top:18px">${I.shield} <b>الطبيب الرئيسي فقط</b> يمكنه إنشاء حسابات أطباء جدد.</div>
      </div>`;
  }

  /* ============================================================
     PROFILE
     ============================================================ */
  function ProfileView(p, readonly) {
    if (!p) return `<div class="card"><div class="empty">${I.user}<p>المتعالج غير موجود.</p></div></div>`;
    const notes = p.notes.slice().sort((a, b) => (b.date || "").localeCompare(a.date || ""));
    const sessions = p.sessions.slice().sort((a, b) => (a.date + (a.time || "")).localeCompare(b.date + (b.time || "")));
    const upcoming = sessions.filter((s) => isUpcoming(s.date));
    const ringC = 2 * Math.PI * 54;
    const dash = ringC * (1 - p.progress / 100);
    const doc = getDoctor(p.doctorId);

    return `
      ${readonly ? "" : `<button class="back-link" data-back>${I.arrowR} رجوع إلى القائمة</button>`}
      <div class="card">
        <div class="profile-hero">
          <div class="ava lg ${avaClass(p.id)}">${esc(initials(p.name))}</div>
          <div class="info">
            <h2>${esc(p.name)}</h2>
            <div class="meta-row">
              <span>${I.cake} ${esc(p.age)} سنوات</span>
              <span>${I.user} ${esc(p.gender || "—")}</span>
              <span>${I.activity} ${esc(p.diagnosis)}</span>
              <span>${I.stetho} ${esc(doc ? doc.name : "—")}</span>
              <span>${I.clock} آخر جلسة: ${fmtDate(p.lastSession)}</span>
            </div>
          </div>
          ${readonly
            ? `<span class="ro-badge">${I.eye} عرض فقط</span>`
            : `<div class="profile-actions">
                 <button class="btn btn-soft" data-edit="${p.id}">${I.edit} تعديل</button>
                 <button class="btn btn-primary" data-add-note="${p.id}">${I.plus} ملاحظة</button>
                 <button class="btn btn-danger" data-remove="${p.id}">${I.trash} حذف</button>
               </div>`}
        </div>
      </div>

      <div class="profile-grid">
        <div class="stack">
          <div class="card">
            <div class="subhead"><h3>بيانات المتعالج</h3></div>
            <div class="info-list">
              <div class="it"><div class="k">ولي الأمر</div><div class="v">${esc(p.guardian || "—")}</div></div>
              <div class="it"><div class="k">رقم التواصل</div><div class="v">${esc(p.phone || "—")}</div></div>
              <div class="it"><div class="k">العمر</div><div class="v">${esc(p.age)} سنوات</div></div>
              <div class="it"><div class="k">الجنس</div><div class="v">${esc(p.gender || "—")}</div></div>
              <div class="it"><div class="k">التشخيص</div><div class="v">${esc(p.diagnosis)}</div></div>
              <div class="it"><div class="k">الطبيب المعالج</div><div class="v">${esc(doc ? doc.name : "—")}</div></div>
            </div>
          </div>

          <!-- Upcoming sessions -->
          <div class="card">
            <div class="subhead"><h3>الجلسات القادمة</h3><span class="count">${upcoming.length}</span><span class="grow"></span>
              ${readonly ? "" : `<button class="btn btn-soft btn-sm" data-add-session-for="${p.id}">${I.plus} جدولة</button>`}
            </div>
            ${upcoming.length === 0
              ? `<div class="empty">${I.calendar}<p>لا توجد جلسات قادمة.</p></div>`
              : `<div class="session-list">${upcoming.map((s) => `
                  <div class="session-item">
                    <div class="date-chip"><b>${new Date(s.date).getDate()}</b><span>${new Intl.DateTimeFormat("ar-EG", { month: "short" }).format(new Date(s.date))}</span></div>
                    <div class="session-main"><div class="st">${esc(s.title || "جلسة علاجية")}</div><div class="ss">${I.clock} ${esc(s.time || "—")} · ${fmtDate(s.date)}</div></div>
                    ${readonly ? "" : `<div class="row-actions">
                      <button class="icon-btn" data-edit-session="${p.id}|${s.id}" title="تعديل">${I.edit}</button>
                      <button class="icon-btn danger" data-del-session="${p.id}|${s.id}" title="حذف">${I.trash}</button></div>`}
                  </div>`).join("")}</div>`}
          </div>

          <div class="card">
            <div class="subhead"><h3>ملاحظات الجلسات</h3><span class="count">${p.notes.length}</span><span class="grow"></span>
              ${readonly ? "" : `<button class="btn btn-soft btn-sm" data-add-note="${p.id}">${I.plus} إضافة</button>`}</div>
            ${notes.length === 0
              ? `<div class="empty">${I.edit}<p>لا توجد ملاحظات بعد.</p></div>`
              : `<div class="timeline">${notes.map((n) => `
                  <div class="note-item"><div class="nh">
                    <span class="date">${I.calendar} ${fmtDate(n.date)}</span>
                    ${readonly ? "" : `<button class="icon-btn btn-sm del" data-del-note="${p.id}|${n.id}" title="حذف">${I.trash}</button>`}
                  </div><p>${esc(n.text)}</p></div>`).join("")}</div>`}
          </div>
        </div>

        <div class="stack">
          <div class="card">
            <div class="subhead"><h3>نسبة التقدم</h3><span class="grow"></span>
              ${readonly ? "" : `<button class="icon-btn btn-sm" data-edit-progress="${p.id}" title="تحديث">${I.edit}</button>`}</div>
            <div class="progress-big">
              <div class="ring"><svg width="132" height="132">
                <circle cx="66" cy="66" r="54" fill="none" stroke="#eceef5" stroke-width="12"/>
                <circle cx="66" cy="66" r="54" fill="none" stroke="#7c6fd6" stroke-width="12" stroke-linecap="round" stroke-dasharray="${ringC.toFixed(1)}" stroke-dashoffset="${dash.toFixed(1)}"/>
              </svg><div class="num">${p.progress}%</div></div>
              <div class="lbl">من خطة العلاج المستهدفة</div>
            </div>
          </div>

          <div class="card">
            <div class="subhead"><h3>خطة العلاج القادمة</h3><span class="grow"></span>
              ${readonly ? "" : `<button class="icon-btn btn-sm" data-edit-plan="${p.id}" title="تعديل">${I.edit}</button>`}</div>
            ${p.plan ? `<div class="plan-box">${esc(p.plan)}</div>` : `<div class="plan-box empty-plan">لم تتم إضافة خطة علاجية قادمة بعد.</div>`}
          </div>

          <div class="card">
            <div class="subhead"><h3>الملفات والتقارير</h3><span class="count">${p.files.length}</span><span class="grow"></span>
              ${readonly ? "" : `<button class="btn btn-soft btn-sm" data-upload="${p.id}">${I.upload} رفع</button>`}</div>
            ${p.files.length === 0
              ? `<div class="empty">${I.file}<p>لا توجد ملفات مرفوعة.</p></div>`
              : `<div class="file-list">${p.files.map((f) => `
                  <div class="file-item"><div class="file-ico">${I.file}</div>
                    <div class="file-meta"><div class="fn">${esc(f.name)}</div><div class="fs">${fmtSize(f.size)} · ${fmtDate(f.date)}</div></div>
                    ${f.data ? `<a class="icon-btn" href="${f.data}" download="${esc(f.name)}" title="تنزيل">${I.download}</a>` : ""}
                    ${readonly ? "" : `<button class="icon-btn danger" data-del-file="${p.id}|${f.id}" title="حذف">${I.trash}</button>`}
                  </div>`).join("")}</div>`}
          </div>

          ${readonly ? "" : `
          <div class="card">
            <div class="subhead"><h3>حساب ولي الأمر</h3></div>
            <div class="credentials">
              <div class="crow"><span class="k">اسم المستخدم</span><span class="v">${esc(p.parentUsername || "—")}</span></div>
              <div class="crow"><span class="k">كلمة المرور</span><span class="v">${esc(p.parentPassword || "—")}</span></div>
            </div>
          </div>`}
        </div>
      </div>`;
  }

  /* ============================================================
     Bind content events (therapist)
     ============================================================ */
  function bindContent() {
    // stat cards
    $$("[data-gonav]").forEach((b) => b.addEventListener("click", () => { state.route = b.dataset.gonav; state.showAll = false; render(); }));
    // search (compact + filter bar)
    const s = $("#patient-search");
    if (s) s.addEventListener("input", () => {
      state.filters.search = s.value; renderTherapistContent();
      const ns = $("#patient-search"); if (ns) { ns.focus(); ns.setSelectionRange(ns.value.length, ns.value.length); }
    });
    $$("[data-filter]").forEach((sel) => sel.addEventListener("change", () => { state.filters[sel.dataset.filter] = sel.value; renderTherapistContent(); }));
    const cf = $("[data-clear-filters]"); if (cf) cf.addEventListener("click", () => { state.filters = { search: "", doctor: "", diagnosis: "", sort: "recent" }; renderTherapistContent(); });
    const ld = $("[data-log-doctor]"); if (ld) ld.addEventListener("change", () => { state.logDoctor = ld.value; renderTherapistContent(); });

    $$("[data-add]").forEach((b) => b.addEventListener("click", () => openPatientModal(null)));
    $$("[data-showall]").forEach((b) => b.addEventListener("click", () => { state.showAll = true; renderTherapistContent(); }));
    $$("[data-open]").forEach((b) => b.addEventListener("click", () => { state.patientId = b.dataset.open; state.route = "profile"; render(); }));
    $$("[data-row]").forEach((tr) => tr.addEventListener("click", (e) => { if (e.target.closest("button")) return; state.patientId = tr.dataset.row; state.route = "profile"; render(); }));
    $$("[data-go-patient]").forEach((el) => el.addEventListener("click", (e) => { if (e.target.closest("button")) return; state.patientId = el.dataset.goPatient; state.route = "profile"; render(); }));
    $$("[data-edit]").forEach((b) => b.addEventListener("click", () => openPatientModal(getPatient(b.dataset.edit))));
    $$("[data-remove]").forEach((b) => b.addEventListener("click", () => removePatient(b.dataset.remove)));
    $$("[data-back]").forEach((b) => b.addEventListener("click", () => { state.route = "patients"; state.patientId = null; render(); }));

    $$("[data-add-note]").forEach((b) => b.addEventListener("click", () => openNoteModal(b.dataset.addNote)));
    $$("[data-del-note]").forEach((b) => b.addEventListener("click", () => {
      const [pid, nid] = b.dataset.delNote.split("|"); const p = getPatient(pid);
      p.notes = p.notes.filter((n) => n.id !== nid); logEvent("حذف ملاحظة جلسة", { patientName: p.name, patientId: p.id, kind: "note" });
      saveDB(); renderTherapistContent(); toast("تم حذف الملاحظة");
    }));
    $$("[data-edit-progress]").forEach((b) => b.addEventListener("click", () => openProgressModal(b.dataset.editProgress)));
    $$("[data-edit-plan]").forEach((b) => b.addEventListener("click", () => openPlanModal(b.dataset.editPlan)));
    $$("[data-upload]").forEach((b) => b.addEventListener("click", () => openUploadModal(b.dataset.upload)));
    $$("[data-del-file]").forEach((b) => b.addEventListener("click", () => {
      const [pid, fid] = b.dataset.delFile.split("|"); const p = getPatient(pid);
      p.files = p.files.filter((f) => f.id !== fid); logEvent("حذف ملفاً", { patientName: p.name, patientId: p.id, kind: "file" });
      saveDB(); renderTherapistContent(); toast("تم حذف الملف");
    }));

    // sessions
    $$("[data-add-session]").forEach((b) => b.addEventListener("click", () => openSessionModal(null, null)));
    $$("[data-add-session-for]").forEach((b) => b.addEventListener("click", () => openSessionModal(b.dataset.addSessionFor, null)));
    $$("[data-edit-session]").forEach((b) => b.addEventListener("click", () => { const [pid, sid] = b.dataset.editSession.split("|"); openSessionModal(pid, sid); }));
    $$("[data-del-session]").forEach((b) => b.addEventListener("click", () => {
      const [pid, sid] = b.dataset.delSession.split("|"); const p = getPatient(pid);
      p.sessions = p.sessions.filter((x) => x.id !== sid); logEvent("ألغى جلسة قادمة", { patientName: p.name, patientId: p.id, kind: "session" });
      saveDB(); renderTherapistContent(); toast("تم حذف الجلسة");
    }));

    // doctors
    $$("[data-add-doctor]").forEach((b) => b.addEventListener("click", openDoctorModal));
    $$("[data-del-doctor]").forEach((b) => b.addEventListener("click", () => removeDoctor(b.dataset.delDoctor)));
  }

  /* ============================================================
     MODALS / DIALOGS
     ============================================================ */
  function openModal(html) {
    const root = $("#modal-root");
    root.innerHTML = `<div class="modal-scrim" data-scrim>${html}</div>`;
    const close = () => { root.innerHTML = ""; document.removeEventListener("keydown", onKey); };
    function onKey(e) { if (e.key === "Escape") close(); }
    $("[data-scrim]").addEventListener("mousedown", (e) => { if (e.target === e.currentTarget) close(); });
    $$("[data-modal-close]").forEach((b) => b.addEventListener("click", close));
    document.addEventListener("keydown", onKey);
    return close;
  }
  const ctl = (label, inner) => `<div class="field"><label>${label}</label><div class="control">${inner}</div></div>`;

  function confirmDialog(opts, onYes) {
    const html = `
      <div class="modal sm">
        <div class="modal-body" style="text-align:center;padding-top:26px">
          <div class="confirm-ico ${opts.danger ? "danger" : ""}">${opts.danger ? I.trash : I.check}</div>
          <h3 style="margin:14px 0 6px">${esc(opts.title)}</h3>
          <p style="color:var(--text-soft);margin:0;line-height:1.8">${esc(opts.message)}</p>
        </div>
        <div class="modal-foot" style="justify-content:center">
          <button class="btn ${opts.danger ? "btn-danger" : "btn-primary"}" data-yes>${esc(opts.confirm || "تأكيد")}</button>
          <button class="btn btn-ghost" data-modal-close>إلغاء</button>
        </div>
      </div>`;
    const close = openModal(html);
    $("[data-yes]").addEventListener("click", () => { close(); onYes(); });
  }

  function removePatient(pid) {
    const p = getPatient(pid); if (!p) return;
    confirmDialog({ danger: true, title: "حذف المتعالج", confirm: "نعم، احذف",
      message: `سيتم حذف ملف "${p.name}" نهائياً مع جميع الملاحظات والملفات. لا يمكن التراجع.` }, () => {
      DB.patients = DB.patients.filter((x) => x.id !== pid);
      logEvent("حذف ملف المتعالج", { patientName: p.name, kind: "remove" });
      saveDB(); state.route = "patients"; state.patientId = null; render(); toast("تم حذف المتعالج");
    });
  }

  function openPatientModal(p) {
    const editing = !!p; p = p || {};
    const docOpts = DB.doctors.map((d) => `<option value="${d.id}" ${p.doctorId === d.id ? "selected" : ""}>${esc(d.name)}</option>`).join("");
    const html = `
      <div class="modal">
        <div class="modal-head"><h3>${editing ? "تعديل بيانات المتعالج" : "إضافة متعالج جديد"}</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <form id="patient-form">
          <div class="modal-body">
            <div class="grid-2">
              ${ctl("الاسم الكامل", `<input name="name" required value="${esc(p.name || "")}" placeholder="مثال: أحمد خالد" />`)}
              ${ctl("العمر", `<input name="age" type="number" min="1" max="18" required value="${esc(p.age || "")}" placeholder="7" />`)}
              ${ctl("الجنس", `<select name="gender"><option ${p.gender === "ذكر" ? "selected" : ""}>ذكر</option><option ${p.gender === "أنثى" ? "selected" : ""}>أنثى</option></select>`)}
              ${ctl("الطبيب المعالج", `<select name="doctorId">${docOpts}</select>`)}
              ${ctl("اسم ولي الأمر", `<input name="guardian" value="${esc(p.guardian || "")}" placeholder="اسم ولي الأمر" />`)}
              ${ctl("رقم التواصل", `<input name="phone" value="${esc(p.phone || "")}" placeholder="05xxxxxxxx" />`)}
            </div>
            ${ctl("التشخيص", `<input name="diagnosis" required value="${esc(p.diagnosis || "")}" placeholder="مثال: تأخر في النطق" />`)}
            <div style="height:8px"></div>
            <div class="subhead"><h3 style="font-size:15px">بيانات دخول ولي الأمر</h3></div>
            <div class="grid-2">
              ${ctl("اسم المستخدم", `${I.user}<input name="parentUsername" required value="${esc(p.parentUsername || "")}" placeholder="username" />`)}
              ${ctl("كلمة المرور", `${I.lock}<input name="parentPassword" required value="${esc(p.parentPassword || "")}" placeholder="••••" />`)}
            </div>
          </div>
          <div class="modal-foot">
            <button type="submit" class="btn btn-primary">${editing ? "حفظ التعديلات" : "إضافة المتعالج"}</button>
            <button type="button" class="btn btn-ghost" data-modal-close>إلغاء</button>
          </div>
        </form>
      </div>`;
    const close = openModal(html);
    $("#patient-form").addEventListener("submit", (e) => {
      e.preventDefault(); const f = e.target;
      const uname = f.parentUsername.value.trim();
      if (DB.patients.find((x) => x.parentUsername === uname && x.id !== p.id)) { toast("اسم مستخدم ولي الأمر مستخدم مسبقاً", "err"); return; }
      const data = { name: f.name.value.trim(), age: +f.age.value, gender: f.gender.value, doctorId: f.doctorId.value,
        guardian: f.guardian.value.trim(), phone: f.phone.value.trim(), diagnosis: f.diagnosis.value.trim(),
        parentUsername: uname, parentPassword: f.parentPassword.value.trim() };
      if (editing) {
        Object.assign(getPatient(p.id), data); logEvent("عدّل بيانات المتعالج", { patientName: data.name, patientId: p.id, kind: "patient" });
        toast("تم حفظ التعديلات");
      } else {
        const np = mkPatient(Object.assign({ progress: 0, plan: "", notes: [], files: [], sessions: [], lastSession: today() }, data));
        DB.patients.unshift(np); state.patientId = np.id; logEvent("أضاف متعالجاً جديداً", { patientName: np.name, patientId: np.id, kind: "patient" });
        toast("تمت إضافة المتعالج بنجاح");
      }
      saveDB(); close(); render();
    });
  }

  function openNoteModal(pid) {
    const html = `
      <div class="modal"><div class="modal-head"><h3>ملاحظة جلسة جديدة</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <form id="note-form"><div class="modal-body">
          ${ctl("تاريخ الجلسة", `<input name="date" type="date" value="${today()}" required />`)}
          <div class="field"><label>الملاحظة</label><div class="control"><textarea name="text" required placeholder="اكتب ملاحظات الجلسة وتقدّم المتعالج..."></textarea></div></div>
        </div><div class="modal-foot"><button type="submit" class="btn btn-primary">حفظ الملاحظة</button><button type="button" class="btn btn-ghost" data-modal-close>إلغاء</button></div></form>
      </div>`;
    const close = openModal(html);
    $("#note-form").addEventListener("submit", (e) => {
      e.preventDefault(); const p = getPatient(pid);
      p.notes.push({ id: uid(), date: e.target.date.value, text: e.target.text.value.trim() });
      if (e.target.date.value > (p.lastSession || "")) p.lastSession = e.target.date.value;
      logEvent("أضاف ملاحظة جلسة", { patientName: p.name, patientId: p.id, kind: "note" });
      saveDB(); close(); render(); toast("تمت إضافة الملاحظة");
    });
  }

  function openProgressModal(pid) {
    const p = getPatient(pid);
    const html = `
      <div class="modal"><div class="modal-head"><h3>تحديث نسبة التقدم</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <form id="prog-form"><div class="modal-body"><div class="field"><label>النسبة المئوية للتقدم</label>
          <div class="range-row"><input name="progress" type="range" min="0" max="100" value="${p.progress}" /><span class="rv" id="rv">${p.progress}%</span></div></div></div>
          <div class="modal-foot"><button type="submit" class="btn btn-primary">حفظ</button><button type="button" class="btn btn-ghost" data-modal-close>إلغاء</button></div></form>
      </div>`;
    const close = openModal(html);
    const range = $("[name=progress]"); $("#rv");
    range.addEventListener("input", () => $("#rv").textContent = range.value + "%");
    $("#prog-form").addEventListener("submit", (e) => {
      e.preventDefault(); const p2 = getPatient(pid); p2.progress = +range.value;
      logEvent("حدّث نسبة التقدم إلى " + p2.progress + "%", { patientName: p2.name, patientId: p2.id, kind: "progress" });
      saveDB(); close(); render(); toast("تم تحديث التقدم");
    });
  }

  function openPlanModal(pid) {
    const p = getPatient(pid);
    const html = `
      <div class="modal"><div class="modal-head"><h3>خطة العلاج القادمة</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <form id="plan-form"><div class="modal-body"><div class="field"><label>اكتب الخطة العلاجية للمرحلة القادمة</label>
          <div class="control"><textarea name="plan" style="min-height:130px" placeholder="أهداف الجلسات القادمة والتمارين المنزلية...">${esc(p.plan || "")}</textarea></div></div></div>
          <div class="modal-foot"><button type="submit" class="btn btn-primary">حفظ الخطة</button><button type="button" class="btn btn-ghost" data-modal-close>إلغاء</button></div></form>
      </div>`;
    const close = openModal(html);
    $("#plan-form").addEventListener("submit", (e) => {
      e.preventDefault(); const p2 = getPatient(pid); p2.plan = e.target.plan.value.trim();
      logEvent("حدّث خطة العلاج القادمة", { patientName: p2.name, patientId: p2.id, kind: "plan" });
      saveDB(); close(); render(); toast("تم حفظ الخطة");
    });
  }

  function openSessionModal(pid, sid) {
    let session = null;
    if (pid && sid) session = (getPatient(pid).sessions || []).find((s) => s.id === sid);
    session = session || {};
    const needPatient = !pid;
    const patientOpts = DB.patients.map((p) => `<option value="${p.id}" ${pid === p.id ? "selected" : ""}>${esc(p.name)}</option>`).join("");
    const html = `
      <div class="modal"><div class="modal-head"><h3>${sid ? "تعديل الجلسة" : "جدولة جلسة قادمة"}</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <form id="session-form"><div class="modal-body">
          ${needPatient ? ctl("المتعالج", `<select name="patientId" required>${patientOpts}</select>`) : ""}
          <div class="grid-2">
            ${ctl("التاريخ", `<input name="date" type="date" required value="${esc(session.date || today())}" />`)}
            ${ctl("الوقت", `<input name="time" type="time" value="${esc(session.time || "10:00")}" />`)}
          </div>
          ${ctl("عنوان / هدف الجلسة", `<input name="title" placeholder="مثال: تمارين حرف الراء" value="${esc(session.title || "")}" />`)}
        </div><div class="modal-foot"><button type="submit" class="btn btn-primary">حفظ</button><button type="button" class="btn btn-ghost" data-modal-close>إلغاء</button></div></form>
      </div>`;
    const close = openModal(html);
    $("#session-form").addEventListener("submit", (e) => {
      e.preventDefault(); const f = e.target;
      const targetId = pid || f.patientId.value; const p = getPatient(targetId); if (!p) return;
      const data = { date: f.date.value, time: f.time.value, title: f.title.value.trim() };
      if (sid) { Object.assign(session, data); logEvent("عدّل جلسة قادمة", { patientName: p.name, patientId: p.id, kind: "session" }); }
      else { p.sessions.push(Object.assign({ id: uid() }, data)); logEvent("جدول جلسة قادمة", { patientName: p.name, patientId: p.id, kind: "session" }); }
      saveDB(); close(); render(); toast("تم حفظ الجلسة");
    });
  }

  function openUploadModal(pid) {
    const html = `
      <div class="modal"><div class="modal-head"><h3>رفع ملف أو تقرير</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <div class="modal-body">
          <label class="dropzone" id="dz">${I.upload}<div><b>اختر ملفاً للرفع</b></div><div style="font-size:13px;margin-top:4px">PDF أو صورة أو مستند — حتى 5 ميجابايت</div><input type="file" id="file-input" hidden /></label>
          <div id="dz-name" style="margin-top:12px;font-weight:700;color:var(--primary)"></div>
        </div>
        <div class="modal-foot"><button class="btn btn-primary" id="do-upload" disabled>رفع الملف</button><button class="btn btn-ghost" data-modal-close>إلغاء</button></div>
      </div>`;
    const close = openModal(html);
    const input = $("#file-input"); const nameEl = $("#dz-name"); const btn = $("#do-upload"); let chosen = null;
    input.addEventListener("change", () => { chosen = input.files[0] || null; if (chosen) { nameEl.textContent = chosen.name + " (" + fmtSize(chosen.size) + ")"; btn.disabled = false; } });
    btn.addEventListener("click", () => {
      if (!chosen) return; const p = getPatient(pid);
      const meta = { id: uid(), name: chosen.name, size: chosen.size, date: today() };
      const finish = () => { p.files.push(meta); logEvent("رفع ملفاً", { patientName: p.name, patientId: p.id, kind: "file" }); saveDB(); close(); render(); toast("تم رفع الملف"); };
      if (chosen.size <= 5 * 1024 * 1024) { const r = new FileReader(); r.onload = () => { meta.data = r.result; finish(); }; r.onerror = finish; r.readAsDataURL(chosen); }
      else { toast("الملف كبير، تم حفظ الاسم فقط", "err"); finish(); }
    });
  }

  function openDoctorModal() {
    const html = `
      <div class="modal"><div class="modal-head"><h3>إضافة طبيب جديد</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <form id="doctor-form"><div class="modal-body">
          <div class="grid-2">
            ${ctl("الاسم", `<input name="name" required placeholder="مثال: د. منى أحمد" />`)}
            ${ctl("التخصص / اللقب", `<input name="title" placeholder="أخصائي تخاطب" />`)}
            ${ctl("اسم المستخدم", `${I.user}<input name="username" required placeholder="username" />`)}
            ${ctl("كلمة المرور", `${I.lock}<input name="password" required placeholder="••••" />`)}
          </div>
        </div><div class="modal-foot"><button type="submit" class="btn btn-primary">إنشاء الحساب</button><button type="button" class="btn btn-ghost" data-modal-close>إلغاء</button></div></form>
      </div>`;
    const close = openModal(html);
    $("#doctor-form").addEventListener("submit", (e) => {
      e.preventDefault(); const f = e.target; const uname = f.username.value.trim();
      if (DB.doctors.find((d) => d.username === uname) || DB.patients.find((p) => p.parentUsername === uname)) { toast("اسم المستخدم مستخدم مسبقاً", "err"); return; }
      const nd = { id: uid(), username: uname, password: f.password.value.trim(), name: f.name.value.trim(), title: f.title.value.trim() || "أخصائي تخاطب", role: "doctor" };
      DB.doctors.push(nd); logEvent("أنشأ حساب طبيب: " + nd.name, { kind: "doctor" });
      saveDB(); close(); renderTherapistContent(); toast("تم إنشاء حساب الطبيب");
    });
  }

  function removeDoctor(id) {
    const d = getDoctor(id); if (!d || d.role === "main") return;
    const count = DB.patients.filter((p) => p.doctorId === id).length;
    confirmDialog({ danger: true, title: "حذف الطبيب", confirm: "نعم، احذف",
      message: count ? `هذا الطبيب لديه ${count} متعالج وسيتم نقلهم للطبيب الرئيسي.` : `سيتم حذف حساب "${d.name}".` }, () => {
      const main = DB.doctors.find((x) => x.role === "main");
      DB.patients.forEach((p) => { if (p.doctorId === id) p.doctorId = main ? main.id : p.doctorId; });
      DB.doctors = DB.doctors.filter((x) => x.id !== id);
      logEvent("حذف حساب طبيب: " + d.name, { kind: "doctor" });
      saveDB(); renderTherapistContent(); toast("تم حذف الطبيب");
    });
  }

  /* ---------------- Inbox (doctor reads parent messages) ---------------- */
  function openInboxModal() {
    const doc = currentDoctor();
    const msgs = inboxFor(doc).slice().sort((a, b) => (b.ts || "").localeCompare(a.ts || ""));
    const html = `
      <div class="modal"><div class="modal-head"><h3>الرسائل الواردة <span class="count">${msgs.length}</span></h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <div class="modal-body">
          ${msgs.length === 0
            ? `<div class="empty">${I.message}<p>لا توجد رسائل من أولياء الأمور.</p></div>`
            : `<div class="msg-list">${msgs.map((m) => `
                <div class="msg-item ${m.read ? "" : "unread"} ${m.patientId ? "clickable" : ""}" ${m.patientId ? `data-go-msg="${m.patientId}"` : ""}>
                  <div class="msg-top"><b>${esc(m.fromName || "ولي الأمر")}</b><span class="msg-time">${fmtDateTime(m.ts)}</span></div>
                  <div class="msg-topic">${I.chat} ${esc(m.topic)} <span class="msg-to">إلى ${esc(m.doctorName)}</span></div>
                  <p>${esc(m.text)}</p>
                </div>`).join("")}</div>`}
        </div>
        <div class="modal-foot"><button class="btn btn-ghost" data-modal-close>إغلاق</button></div>
      </div>`;
    const close = openModal(html);
    // mark read
    let changed = false;
    inboxFor(doc).forEach((m) => { if (!m.read) { m.read = true; changed = true; } });
    if (changed) saveDB();
    $$("[data-go-msg]").forEach((el) => el.addEventListener("click", () => { close(); state.patientId = el.dataset.goMsg; state.route = "profile"; render(); }));
    // update topbar badge after closing handled by next render; refresh bell now:
    const bell = $(".bell .count"); if (bell) bell.remove();
    const bellBtn = $(".bell"); if (bellBtn && !$(".bell .dot")) bellBtn.insertAdjacentHTML("beforeend", '<span class="dot"></span>');
  }

  /* ============================================================
     PARENT SHELL
     ============================================================ */
  function ParentShell(session) {
    const p = getPatient(session.patientId);
    if (!p) return `<div class="shell"><div class="main"><div class="content"><div class="card"><div class="empty">${I.user}<p>تعذّر العثور على ملف الطفل.</p></div></div></div></div></div>`;
    const myMsgs = DB.messages.filter((m) => m.patientId === p.id).slice().sort((a, b) => (b.ts || "").localeCompare(a.ts || ""));
    return `
    <div class="shell ${state.navOpen ? "nav-open" : ""}">
      <div class="scrim" data-close-nav></div>
      <aside class="sidebar">
        ${Brand("بوابة أولياء الأمور")}
        <div class="sidebar-user">
          <div class="ava md ${avaClass(p.id)}">${esc(initials(p.name))}</div>
          <div class="meta"><strong>${esc(p.guardian || "ولي الأمر")}</strong><span>ولي أمر ${esc(p.name)}</span></div>
        </div>
        <nav class="nav">
          <button class="nav-item active">${I.home}<span>ملف طفلي</span></button>
          <button class="nav-item" data-send-msg>${I.message}<span>مراسلة الأخصائي</span></button>
          <div class="nav-spacer"></div>
          <button class="nav-item logout" data-logout>${I.logout}<span>تسجيل الخروج</span></button>
        </nav>
      </aside>
      <div class="main">
        <div class="topbar">
          <div style="display:flex;align-items:center;gap:12px">
            <button class="icon-btn hamburger" data-toggle-nav>${I.menu}</button>
            <div class="page-title">ملف طفلي</div>
          </div>
          <div class="right">
            <button class="btn btn-soft btn-sm" data-send-msg>${I.send} مراسلة الأخصائي</button>
            <span class="ro-badge">${I.eye} عرض فقط</span>
          </div>
        </div>
        <div class="content" id="content">
          <div class="welcome">
            <div class="ava lg ${avaClass(p.id)}">${esc(initials(p.name))}</div>
            <div class="info"><h2>أهلاً بك في ملف ${esc(p.name)}</h2><p>هنا تتابع تقدّم طفلك، ملاحظات الأخصائي، الجلسات القادمة، الملفات، والخطة العلاجية.</p></div>
            <button class="btn btn-primary" data-send-msg>${I.send} أرسل رسالة</button>
          </div>
          ${myMsgs.length ? `
            <div class="card" style="margin-bottom:20px">
              <div class="subhead"><h3>رسائلي للأخصائي</h3><span class="count">${myMsgs.length}</span></div>
              <div class="msg-list">${myMsgs.map((m) => `
                <div class="msg-item">
                  <div class="msg-top"><b>${esc(m.topic)}</b><span class="msg-time">${fmtDateTime(m.ts)}</span></div>
                  <div class="msg-topic"><span class="msg-to">إلى ${esc(m.doctorName)}</span> ${m.read ? `<span class="seen">${I.check} تمت القراءة</span>` : `<span class="sent-tag">أُرسلت</span>`}</div>
                  <p>${esc(m.text)}</p>
                </div>`).join("")}</div>
            </div>` : ""}
          ${ProfileView(p, true)}
        </div>
      </div>
    </div>`;
  }

  function afterParent() {
    bindShell();
    $$("[data-send-msg]").forEach((b) => b.addEventListener("click", openSendMessageModal));
  }

  function openSendMessageModal() {
    const session = getSession(); const p = getPatient(session.patientId);
    const preferred = p.doctorId;
    const docOpts = DB.doctors.map((d) => `<option value="${d.id}" ${preferred === d.id ? "selected" : ""}>${esc(d.name)}${d.id === preferred ? " (الطبيب المعالج)" : ""}</option>`).join("");
    const html = `
      <div class="modal"><div class="modal-head"><h3>مراسلة الأخصائي</h3><button class="icon-btn" data-modal-close>${I.x}</button></div>
        <form id="msg-form"><div class="modal-body">
          ${ctl("الطبيب", `${I.stetho}<select name="doctorId" required>${docOpts}</select>`)}
          ${ctl("الموضوع", `<input name="topic" required placeholder="مثال: استفسار عن الواجب المنزلي" />`)}
          <div class="field"><label>رسالتك / مشكلتك أو سؤالك</label><div class="control"><textarea name="text" required style="min-height:110px" placeholder="اكتب رسالتك للأخصائي..."></textarea></div></div>
        </div><div class="modal-foot"><button type="submit" class="btn btn-primary">${I.send} إرسال</button><button type="button" class="btn btn-ghost" data-modal-close>إلغاء</button></div></form>
      </div>`;
    const close = openModal(html);
    $("#msg-form").addEventListener("submit", (e) => {
      e.preventDefault(); const f = e.target; const did = f.doctorId.value;
      DB.messages.unshift({ id: uid(), ts: new Date().toISOString(), patientId: p.id, patientName: p.name,
        fromName: p.guardian || "ولي الأمر", doctorId: did, doctorName: doctorName(did),
        topic: f.topic.value.trim(), text: f.text.value.trim(), read: false });
      logEvent("أرسل رسالة: " + f.topic.value.trim(), { actorName: (p.guardian || "ولي الأمر") + " (ولي أمر " + p.name + ")", patientName: p.name, patientId: p.id, kind: "message" });
      saveDB(); close(); render(); toast("تم إرسال رسالتك للأخصائي");
    });
  }

  /* ============================================================
     Boot
     ============================================================ */
  loadDB();
  const sess = getSession();
  if (sess && sess.role === "therapist") state.route = "dashboard";
  render();

  window.LittleTalkersReset = function () { localStorage.removeItem(DB_KEY); localStorage.removeItem(SESSION_KEY); location.reload(); };
})();
