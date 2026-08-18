/* ==========================================================================
   LMS Digital Learning — App Logic
   Language toggle, CNIC formatting, form validation, toast, notifications,
   loading states, mobile nav
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
  initQuizCourseContext();
  initLangToggle();
  initCnicFormat();
  initProfileValidation();
  initLoginValidation();
  initSignupValidation();
  initForgotPasswordValidation();
  initNotifDropdown();
  initAvatarUpload();
});

/* ---------- Pick the right quiz content based on ?course= in the URL (assessment.html) ---------- */
function initQuizCourseContext() {
  const introEl = document.getElementById("quizIntro");
  if (!introEl) return; // only relevant on assessment.html

  const params = new URLSearchParams(window.location.search);
  const courseKey = params.get("course") || "pm";
  const config = COURSE_QUIZZES[courseKey] || COURSE_QUIZZES.pm;

  QUIZ_QUESTIONS = config.questions;
  quizState = {
    current: 0,
    answers: new Array(QUIZ_QUESTIONS.length).fill(null),
    secondsLeft: 15 * 60,
    timerInterval: null,
    startedAt: null
  };

  const setText = (id, en, ur) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.setAttribute("data-en", en);
    el.setAttribute("data-ur", ur);
  };

  setText("quizTag", config.tag.en, config.tag.ur);
  setText("quizIntroTitle", config.title.en, config.title.ur);
  setText("quizIntroSub", config.sub.en, config.sub.ur);
  setText("resultSub", config.resultSub.en, config.resultSub.ur);

  const backLink = document.getElementById("backToCourseLink");
  if (backLink) backLink.setAttribute("href", config.backHref);

  const backBtn = document.getElementById("backToCourseBtn");
  if (backBtn) backBtn.setAttribute("href", config.backHref);
}

/* ---------- Language toggle (EN / اردو) ---------- */
function applyLang(lang) {
  document.body.setAttribute("dir", lang === "ur" ? "rtl" : "ltr");
  document.body.setAttribute("data-lang", lang);

  document.querySelectorAll("[data-en]").forEach((el) => {
    const text = lang === "ur" ? el.getAttribute("data-ur") : el.getAttribute("data-en");
    if (text !== null) {
      if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        el.setAttribute("placeholder", text);
      } else {
        el.textContent = text;
      }
    }
  });

  document.querySelectorAll(".lang-toggle button").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === lang);
  });

  localStorage.setItem("LMS-lang", lang);
}

function initLangToggle() {
  const buttons = document.querySelectorAll(".lang-toggle button");
  if (!buttons.length) return;

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => applyLang(btn.dataset.lang));
  });

  const savedLang = localStorage.getItem("LMS-lang") || "en";
  applyLang(savedLang);
}

/* ---------- CNIC auto-format: 12345-1234567-1 ---------- */
function formatCnic(value) {
  const digits = value.replace(/\D/g, "").slice(0, 13);
  let out = digits;
  if (digits.length > 5) {
    out = digits.slice(0, 5) + "-" + digits.slice(5);
  }
  if (digits.length > 12) {
    out = digits.slice(0, 5) + "-" + digits.slice(5, 12) + "-" + digits.slice(12);
  }
  return out;
}

function initCnicFormat() {
  const cnicField = document.getElementById("cnic");
  if (!cnicField) return;

  cnicField.addEventListener("input", (e) => {
    const cursorFromEnd = e.target.value.length - e.target.selectionStart;
    e.target.value = formatCnic(e.target.value);
    const newPos = e.target.value.length - cursorFromEnd;
    e.target.setSelectionRange(newPos, newPos);
  });
}

/* ---------- Required-field validation (shared helper) ---------- */
function validateRequired(form) {
  let isValid = true;
  const requiredFields = form.querySelectorAll("[required]");

  requiredFields.forEach((field) => {
    const wrapper = field.closest(".field");
    const isEmpty = !field.value || !field.value.trim();

    if (isEmpty) {
      isValid = false;
      wrapper?.classList.add("has-error");
      field.classList.add("invalid");
    } else {
      wrapper?.classList.remove("has-error");
      field.classList.remove("invalid");
    }
  });

  const cnicField = form.querySelector("#cnic");
  if (cnicField && cnicField.value) {
    const digits = cnicField.value.replace(/\D/g, "");
    const wrapper = cnicField.closest(".field");
    if (digits.length !== 13) {
      isValid = false;
      wrapper?.classList.add("has-error");
      cnicField.classList.add("invalid");
    }
  }

  form.querySelectorAll("[minlength]").forEach((field) => {
    if (!field.value) return; // already caught by the required check above
    const minLen = parseInt(field.getAttribute("minlength"), 10);
    if (field.value.length < minLen) {
      isValid = false;
      const wrapper = field.closest(".field");
      wrapper?.classList.add("has-error");
      field.classList.add("invalid");
    }
  });

  return isValid;
}

/* ---------- Helper: show a temporary loading spinner on a submit button ---------- */
function withButtonLoading(button, durationMs, callback) {
  if (!button) {
    callback();
    return;
  }
  button.classList.add("is-loading");
  setTimeout(() => {
    button.classList.remove("is-loading");
    callback();
  }, durationMs);
}

/* ---------- Profile form ---------- */
function initProfileValidation() {
  const form = document.getElementById("profileForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');

    withButtonLoading(submitBtn, 800, () => {
      if (validateRequired(form)) {
        showToast("Profile saved successfully");
      } else {
        showToast("Please fill in all required fields");
      }
    });
  });

  form.querySelectorAll("[required]").forEach((field) => {
    field.addEventListener("input", () => {
      const wrapper = field.closest(".field");
      if (field.value.trim()) {
        wrapper?.classList.remove("has-error");
        field.classList.remove("invalid");
      }
    });
  });
}

/* ---------- Login form (index.html) ---------- */
function initLoginValidation() {
  const form = document.getElementById("loginForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');

    withButtonLoading(submitBtn, 700, () => {
      if (validateRequired(form)) {
        // NOTE: replace with real auth call once backend is wired up
        window.location.href = "dashboard.html";
      } else {
        showToast("Please enter your Employee ID and Password");
      }
    });
  });
}

/* ---------- Sign-up form (signup.html) ---------- */
function initSignupValidation() {
  const form = document.getElementById("signupForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');

    const fieldsValid = validateRequired(form);
    const password = form.querySelector("#password");
    const confirmPassword = form.querySelector("#confirmPassword");
    let passwordsMatch = true;

    if (password && confirmPassword) {
      const wrapper = confirmPassword.closest(".field");
      passwordsMatch = password.value === confirmPassword.value;

      if (!passwordsMatch) {
        wrapper?.classList.add("has-error");
        confirmPassword.classList.add("invalid");
      } else if (confirmPassword.value.trim()) {
        wrapper?.classList.remove("has-error");
        confirmPassword.classList.remove("invalid");
      }
    }

    withButtonLoading(submitBtn, 900, () => {
      if (fieldsValid && passwordsMatch) {
        // NOTE: replace with real signup API call once backend is wired up
        showToast("Account created — redirecting to sign in…");
        setTimeout(() => {
          window.location.href = "index.html";
        }, 1200);
      } else if (!passwordsMatch) {
        showToast("Passwords do not match");
      } else {
        showToast("Please fill in all required fields");
      }
    });
  });

  form.querySelectorAll("[required]").forEach((field) => {
    field.addEventListener("input", () => {
      const wrapper = field.closest(".field");
      if (field.value.trim()) {
        wrapper?.classList.remove("has-error");
        field.classList.remove("invalid");
      }
    });
  });
}

/* ---------- Forgot password form (forgot-password.html) ---------- */
function initForgotPasswordValidation() {
  const form = document.getElementById("forgotPasswordForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const submitBtn = form.querySelector('button[type="submit"]');

    withButtonLoading(submitBtn, 900, () => {
      if (validateRequired(form)) {
        // NOTE: replace with real "send reset email" API call once backend is wired up
        showToast("If that Employee ID exists, a reset link has been sent");
        form.reset();
      } else {
        showToast("Please enter your Employee ID");
      }
    });
  });
}

/* ---------- Notifications dropdown ---------- */
function initNotifDropdown() {
  const btn = document.getElementById("notifBtn");
  const dropdown = document.getElementById("notifDropdown");
  if (!btn || !dropdown) return;

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const isOpen = dropdown.classList.toggle("open");
    btn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  });

  document.addEventListener("click", (e) => {
    if (!dropdown.contains(e.target) && e.target !== btn) {
      dropdown.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      dropdown.classList.remove("open");
      btn.setAttribute("aria-expanded", "false");
    }
  });

  const clearBtn = dropdown.querySelector(".notif-clear");
  clearBtn?.addEventListener("click", () => {
    dropdown.querySelectorAll(".notif-item").forEach((item) => item.classList.remove("unread"));
    dropdown.querySelectorAll(".notif-dot").forEach((dot) => dot.classList.add("read"));
    const badgeDot = btn.querySelector(".badge-dot");
    if (badgeDot) badgeDot.style.display = "none";
  });
}

/* ---------- Avatar upload preview (profile.html) ---------- */
function initAvatarUpload() {
  const input = document.getElementById("avatarInput");
  const preview = document.getElementById("avatarPreview");
  if (!input || !preview) return;

  input.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      preview.src = event.target.result;
    };
    reader.readAsDataURL(file);
    // NOTE: actual upload to server happens once backend endpoint is available
  });
}

/* ---------- Toast notification ---------- */
let toastTimeout;
function showToast(message) {
  let toast = document.querySelector(".toast");

  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }

  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}
/* ==========================================================================
   Assessment / Quiz engine (assessment.html)
   ========================================================================== */
const COURSE_QUIZZES = {
  pm: {
    tag: { en: "Module 6 Assessment", ur: "ماڈیول 6 جائزہ" },
    title: { en: "Final Assessment: Project Management Essentials", ur: "حتمی جائزہ: پراجیکٹ مینجمنٹ کے بنیادی اصول" },
    sub: {
      en: "Test your understanding of the concepts covered in this course. Read each question carefully before answering.",
      ur: "اس کورس میں شامل تصورات کی اپنی سمجھ کو جانچیں۔ جواب دینے سے پہلے ہر سوال کو غور سے پڑھیں۔"
    },
    resultSub: {
      en: "You've completed the Final Assessment for Project Management Essentials.",
      ur: "آپ نے پراجیکٹ مینجمنٹ کے بنیادی اصول کا حتمی جائزہ مکمل کر لیا ہے۔"
    },
    backHref: "course-detail.html",
    questions: [
      {
        q: "What is the primary purpose of defining a project's scope early on?",
        options: [
          "To prevent uncontrolled changes and keep the project on track",
          "To assign a project manager",
          "To choose the software the team will use",
          "To determine the office location for the team"
        ],
        correct: 0
      },
      {
        q: "Which of the following best describes a project budget?",
        options: [
          "A list of team members and their job titles",
          "An estimate of all costs required to complete the project",
          "The final report submitted after project closure",
          "A schedule of team meetings"
        ],
        correct: 1
      },
      {
        q: "In resource planning, what does 'over-allocation' mean?",
        options: [
          "A resource is assigned more work than their available capacity",
          "A resource has no assigned tasks",
          "The budget has been fully spent",
          "A task has been completed ahead of schedule"
        ],
        correct: 0
      },
      {
        q: "Which risk response strategy involves taking action to reduce the probability or impact of a risk?",
        options: ["Acceptance", "Transfer", "Mitigation", "Avoidance"],
        correct: 2
      },
      {
        q: "What is a key trait of an effective project team leader?",
        options: [
          "Avoiding all communication with stakeholders",
          "Making every decision without team input",
          "Clear communication and motivating the team toward shared goals",
          "Focusing only on individual tasks, not the team"
        ],
        correct: 2
      }
    ]
  },
  "data-science": {
    tag: { en: "Module 5 Assessment", ur: "ماڈیول 5 جائزہ" },
    title: { en: "Final Assessment: Data Analysis with Python", ur: "حتمی جائزہ: پائتھون کے ساتھ ڈیٹا تجزیہ" },
    sub: {
      en: "Test your understanding of the concepts covered in this course. Read each question carefully before answering.",
      ur: "اس کورس میں شامل تصورات کی اپنی سمجھ کو جانچیں۔ جواب دینے سے پہلے ہر سوال کو غور سے پڑھیں۔"
    },
    resultSub: {
      en: "You've completed the Final Assessment for Data Analysis with Python.",
      ur: "آپ نے پائتھون کے ساتھ ڈیٹا تجزیہ کا حتمی جائزہ مکمل کر لیا ہے۔"
    },
    backHref: "course-detail-data-science.html",
    questions: [
      {
        q: "What is a Pandas DataFrame primarily used for?",
        options: [
          "Storing and manipulating 2D labeled tabular data",
          "Rendering 3D charts",
          "Compiling Python into machine code",
          "Managing database connections only"
        ],
        correct: 0
      },
      {
        q: "Which method displays the first 5 rows of a DataFrame?",
        options: [".tail()", ".head()", ".sample()", ".describe()"],
        correct: 1
      },
      {
        q: "What does 'data cleaning' typically involve?",
        options: [
          "Deleting the entire dataset",
          "Handling missing values, duplicates, and inconsistent formatting",
          "Only renaming columns",
          "Compressing files for storage"
        ],
        correct: 1
      },
      {
        q: "Which library is most commonly paired with Pandas for data visualization?",
        options: ["Matplotlib", "Flask", "Django", "NumPy alone"],
        correct: 0
      },
      {
        q: "What is the purpose of the groupby() function?",
        options: [
          "To sort a DataFrame alphabetically",
          "To aggregate and summarize data by category",
          "To delete rows with missing values",
          "To merge two unrelated files"
        ],
        correct: 1
      }
    ]
  },
  design: {
    tag: { en: "Module 5 Assessment", ur: "ماڈیول 5 جائزہ" },
    title: { en: "Final Assessment: Advanced UX Principles", ur: "حتمی جائزہ: ایڈوانسڈ یو ایکس اصول" },
    sub: {
      en: "Test your understanding of the concepts covered in this course. Read each question carefully before answering.",
      ur: "اس کورس میں شامل تصورات کی اپنی سمجھ کو جانچیں۔ جواب دینے سے پہلے ہر سوال کو غور سے پڑھیں۔"
    },
    resultSub: {
      en: "You've completed the Final Assessment for Advanced UX Principles.",
      ur: "آپ نے ایڈوانسڈ یو ایکس اصول کا حتمی جائزہ مکمل کر لیا ہے۔"
    },
    backHref: "course-detail-design.html",
    questions: [
      {
        q: "What is the main goal of user research?",
        options: [
          "To validate the designer's personal preferences",
          "To understand real user needs, behaviors, and pain points",
          "To finalize the visual color palette",
          "To reduce the number of project meetings"
        ],
        correct: 1
      },
      {
        q: "What does 'information architecture' refer to?",
        options: [
          "The database schema behind an app",
          "The organization and structure of content for clear navigation",
          "The server infrastructure hosting the site",
          "The typography system used on a page"
        ],
        correct: 1
      },
      {
        q: "Which method is used to test usability with real users?",
        options: ["A/B testing only", "Usability testing", "Code review", "Load testing"],
        correct: 1
      },
      {
        q: "What is a wireframe?",
        options: [
          "A finished, fully-styled visual design",
          "A low-fidelity layout sketch showing structure and content placement",
          "A type of database index",
          "A marketing document"
        ],
        correct: 1
      },
      {
        q: "Why is card sorting used in UX design?",
        options: [
          "To test server response times",
          "To understand how users mentally group and categorize content",
          "To pick a font pairing",
          "To calculate development cost"
        ],
        correct: 1
      }
    ]
  },
  compliance: {
    tag: { en: "Module 5 Assessment", ur: "ماڈیول 5 جائزہ" },
    title: { en: "Final Assessment: Data Protection & Privacy", ur: "حتمی جائزہ: ڈیٹا کا تحفظ اور رازداری" },
    sub: {
      en: "Test your understanding of the concepts covered in this course. Read each question carefully before answering.",
      ur: "اس کورس میں شامل تصورات کی اپنی سمجھ کو جانچیں۔ جواب دینے سے پہلے ہر سوال کو غور سے پڑھیں۔"
    },
    resultSub: {
      en: "You've completed the Final Assessment for Data Protection & Privacy.",
      ur: "آپ نے ڈیٹا کا تحفظ اور رازداری کا حتمی جائزہ مکمل کر لیا ہے۔"
    },
    backHref: "course-detail-compliance.html",
    questions: [
      {
        q: "What is the primary goal of data protection policies?",
        options: [
          "To slow down internal processes",
          "To safeguard personal data from misuse, loss, or unauthorized access",
          "To increase storage costs",
          "To limit employee access to email"
        ],
        correct: 1
      },
      {
        q: "Which of these is considered personally identifiable information (PII)?",
        options: ["A CNIC number", "The office WiFi name", "A public holiday schedule", "A department's budget total"],
        correct: 0
      },
      {
        q: "What should you do if you discover a data breach?",
        options: [
          "Ignore it if it seems minor",
          "Report it immediately through the proper internal channel",
          "Fix it quietly without telling anyone",
          "Wait until the next scheduled review"
        ],
        correct: 1
      },
      {
        q: "Why is data encryption important?",
        options: [
          "It makes files smaller",
          "It protects data so it's unreadable without proper authorization",
          "It speeds up data entry",
          "It is only relevant for video files"
        ],
        correct: 1
      },
      {
        q: "Who is responsible for protecting citizen data at LMS?",
        options: [
          "Only the IT department",
          "Only senior management",
          "Every employee who handles that data",
          "No one — it's the citizen's own responsibility"
        ],
        correct: 2
      }
    ]
  }
};

let QUIZ_QUESTIONS = COURSE_QUIZZES.pm.questions;

let quizState = {
  current: 0,
  answers: new Array(QUIZ_QUESTIONS.length).fill(null),
  secondsLeft: 15 * 60,
  timerInterval: null,
  startedAt: null
};

function initQuizEngine() {
  const introEl = document.getElementById("quizIntro");
  const runningEl = document.getElementById("quizRunning");
  const resultsEl = document.getElementById("quizResults");
  const startBtn = document.getElementById("startQuizBtn");
  if (!introEl || !runningEl || !resultsEl || !startBtn) return;

  const qTotalEl = document.getElementById("qTotal");
  if (!qTotalEl) {
    console.error("Quiz init aborted: #qTotal element not found in assessment.html");
    return;
  }
  qTotalEl.textContent = QUIZ_QUESTIONS.length;
  buildQuizDots();

  startBtn.addEventListener("click", () => {
    introEl.style.display = "none";
    runningEl.style.display = "block";
    quizState.startedAt = Date.now();
    renderQuestion();
    startQuizTimer();
  });

  document.getElementById("prevQBtn").addEventListener("click", () => {
    if (quizState.current > 0) {
      quizState.current--;
      renderQuestion();
    }
  });

  document.getElementById("nextQBtn").addEventListener("click", () => {
    if (quizState.current < QUIZ_QUESTIONS.length - 1) {
      quizState.current++;
      renderQuestion();
    } else {
      finishQuiz();
    }
  });

  document.getElementById("reviewAnswersBtn")?.addEventListener("click", () => {
    showToast("Answer review is available once results are finalized by your administrator");
  });
}

function buildQuizDots() {
  const dotsWrap = document.getElementById("quizDots");
  if (!dotsWrap) return;
  dotsWrap.innerHTML = "";
  QUIZ_QUESTIONS.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.dataset.index = i;
    dotsWrap.appendChild(dot);
  });
}

function renderQuestion() {
  const panel = document.getElementById("quizQuestionPanel");
  const q = QUIZ_QUESTIONS[quizState.current];
  const lang = document.body.getAttribute("data-lang") || "en";

  panel.innerHTML = `
    <div class="q-kicker">${lang === "ur" ? "سوال" : "Question"} ${quizState.current + 1}</div>
    <h2>${q.q}</h2>
    <div class="q-options">
      ${q.options.map((opt, i) => `
        <div class="q-option ${quizState.answers[quizState.current] === i ? "selected" : ""}" data-opt="${i}">
          <span class="q-radio"></span>
          <span>${opt}</span>
        </div>
      `).join("")}
    </div>
  `;

  panel.querySelectorAll(".q-option").forEach((el) => {
    el.addEventListener("click", () => {
      quizState.answers[quizState.current] = parseInt(el.dataset.opt, 10);
      renderQuestion();
      updateQuizDots();
    });
  });

  document.getElementById("qCurrent").textContent = quizState.current + 1;
  document.getElementById("quizProgFill").style.width = `${((quizState.current + 1) / QUIZ_QUESTIONS.length) * 100}%`;

  const prevBtn = document.getElementById("prevQBtn");
  const nextBtn = document.getElementById("nextQBtn");
  prevBtn.style.visibility = quizState.current === 0 ? "hidden" : "visible";

  const isLast = quizState.current === QUIZ_QUESTIONS.length - 1;
  const lang2 = document.body.getAttribute("data-lang") || "en";
  nextBtn.textContent = isLast ? (lang2 === "ur" ? "جمع کرائیں" : "Submit Assessment") : (lang2 === "ur" ? "اگلا" : "Next");

  updateQuizDots();
}

function updateQuizDots() {
  const dotsWrap = document.getElementById("quizDots");
  if (!dotsWrap) return;
  dotsWrap.querySelectorAll("span").forEach((dot) => {
    const i = parseInt(dot.dataset.index, 10);
    dot.classList.toggle("answered", quizState.answers[i] !== null);
    dot.classList.toggle("current", i === quizState.current);
  });
}

function startQuizTimer() {
  const timerText = document.getElementById("timerText");
  const timerWrap = document.getElementById("quizTimer");
  if (!timerText) return;

  quizState.timerInterval = setInterval(() => {
    quizState.secondsLeft--;
    const m = Math.floor(quizState.secondsLeft / 60);
    const s = quizState.secondsLeft % 60;
    timerText.textContent = `${m}:${s.toString().padStart(2, "0")}`;

    if (quizState.secondsLeft <= 60) {
      timerWrap.classList.add("low-time");
    }
    if (quizState.secondsLeft <= 0) {
      clearInterval(quizState.timerInterval);
      finishQuiz();
    }
  }, 1000);
}

function finishQuiz() {
  clearInterval(quizState.timerInterval);

  const totalQ = QUIZ_QUESTIONS.length;
  let correctCount = 0;
  QUIZ_QUESTIONS.forEach((q, i) => {
    if (quizState.answers[i] === q.correct) correctCount++;
  });
  const scorePct = Math.round((correctCount / totalQ) * 100);
  const passed = scorePct >= 70;

  const elapsedSec = quizState.startedAt ? Math.round((Date.now() - quizState.startedAt) / 1000) : 0;
  const em = Math.floor(elapsedSec / 60);
  const es = elapsedSec % 60;

  document.getElementById("quizRunning").style.display = "none";
  document.getElementById("quizResults").style.display = "block";

  document.getElementById("resultScore").textContent = `${scorePct}%`;
  document.getElementById("resultCorrect").textContent = `${correctCount} of ${totalQ}`;
  document.getElementById("resultTime").textContent = `${em}m ${es}s`;

  const iconWrap = document.getElementById("resultIconWrap");
  const title = document.getElementById("resultTitle");
  const sub = document.getElementById("resultSub");

  if (passed) {
    iconWrap.classList.remove("fail");
    iconWrap.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2"><path d="M20 6 9 17l-5-5"/></svg>';
    title.textContent = "Great work — you passed!";
    sub.textContent = "You've completed the Final Assessment for Project Management Essentials.";
  } else {
    iconWrap.classList.add("fail");
    iconWrap.innerHTML = '<svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.2"><path d="M18 6 6 18M6 6l12 12"/></svg>';
    title.textContent = "Not quite there yet";
    sub.textContent = "You didn't reach the 70% passing score this time. Review the module and try again.";
  }
}

/* ==========================================================================
   Admin panel — modals, table filtering, wizard steps
   ========================================================================== */
function initModals() {
  document.querySelectorAll("[data-open-modal]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const modal = document.getElementById(trigger.dataset.openModal);
      modal?.classList.add("open");
    });
  });
  document.querySelectorAll("[data-close-modal]").forEach((trigger) => {
    trigger.addEventListener("click", () => {
      trigger.closest(".modal-overlay")?.classList.remove("open");
    });
  });
  document.querySelectorAll(".modal-overlay").forEach((overlay) => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) overlay.classList.remove("open");
    });
  });
}

function initTableSearch() {
  const searchInput = document.querySelector("[data-table-search]");
  const table = document.querySelector("[data-table-target]");
  if (!searchInput || !table) return;

  searchInput.addEventListener("input", () => {
    const term = searchInput.value.trim().toLowerCase();
    table.querySelectorAll("tbody tr").forEach((row) => {
      row.style.display = row.textContent.toLowerCase().includes(term) ? "" : "none";
    });
  });
}

function initWizardNav() {
  document.querySelectorAll("[data-wizard]").forEach((wizard) => {
    const steps = wizard.querySelectorAll(".wizard-panel");
    const nextBtns = wizard.querySelectorAll("[data-wizard-next]");
    const prevBtns = wizard.querySelectorAll("[data-wizard-prev]");
    let current = 0;

    function show(i) {
      steps.forEach((s, idx) => (s.style.display = idx === i ? "block" : "none"));
      wizard.querySelectorAll(".wizard-step").forEach((step, idx) => {
        step.classList.toggle("done", idx < i);
        step.classList.toggle("active", idx === i);
      });
    }
    show(0);

    nextBtns.forEach((btn) => btn.addEventListener("click", () => {
      if (current < steps.length - 1) { current++; show(current); }
      else { showToast("Course saved as draft"); }
    }));
    prevBtns.forEach((btn) => btn.addEventListener("click", () => {
      if (current > 0) { current--; show(current); }
    }));
  });
}

document.addEventListener("DOMContentLoaded", () => {
  initQuizEngine();
  initModals();
  initTableSearch();
  initWizardNav();
});