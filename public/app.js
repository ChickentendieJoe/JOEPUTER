(function () {
  "use strict";

  const STORAGE_KEY = "joeputer_state_v3";

  const PUNISHMENTS = [
    "No phone scrolling tonight. Lights out by 9:30, and tomorrow you owe a double session.",
    "No TikTok for 48 hours. Use that time for a world instead.",
    "Cold shower tomorrow morning. No excuses.",
    "No Netflix tonight. Read or work on a world mission instead.",
    "Extra 30-min session tomorrow on your worst world.",
    "No sugar for 24 hours. Discipline compounds.",
    "Early bed tonight (9 PM). Your body needs it.",
    "Skip one meal and donate the money. Hunger teaches.",
    "10 push-ups every hour until bedtime. Earn back your focus.",
    "Write down why you failed today. No phone until you do.",
  ];

  const WORLD_DEFS = [
    {
      id: "basketball",
      name: "Basketball",
      mentor: "MJ",
      persona: "You are MJ, a legendary, ruthlessly competitive basketball mentor coaching Joe. Demand excellence, call out excuses, but back it with real fundamentals: footwork, reps, film study, conditioning.",
      timeStart: "13:00",
      timeEnd: "14:00",
      offline: [
        "Winners are workers. Get your reps in and stop talking about it — MJ (offline)",
        "Nobody remembers the practice you skipped. Get on the court. — MJ (offline)",
        "Fundamentals win championships. Footwork first, then shoot. — MJ (offline)",
      ],
      feedSentences: [
        "MJ practiced free throws 500+ times a day—mastery through repetition.",
        "Footwork beats athleticism. Build a foundation before you fly.",
        "Record every session: film study catches what feel misses.",
        "The best shooters in the world miss 40% of their shots.",
        "Conditioning isn't punishment—it's your edge when others fade.",
      ],
    },
    {
      id: "daycare",
      name: "Daycare",
      mentor: "Ms. Rachel",
      persona: "You are Ms. Rachel, a warm, patient early-childhood education expert mentoring Joe on daycare logistics and being present with his kid. Encourage routines, prep-ahead habits, and small moments of connection.",
      timeStart: "09:30",
      timeEnd: "18:30",
      offline: [
        "Little wins count — pack that bag tonight and tomorrow morning gets easier. — Ms. Rachel (offline)",
        "Even five minutes of real eye-contact play makes a difference today. — Ms. Rachel (offline)",
        "Consistency is the whole game with little ones. You've got this. — Ms. Rachel (offline)",
      ],
      feedSentences: [
        "Kids remember a parent's full attention more than perfect activities.",
        "Prep the bag the night before—mornings are sacred.",
        "One learning song beats screens. Pick one, sing it daily.",
        "Routines feel boring to you but give kids security.",
        "Connection happens in 5-minute pockets, not perfect afternoons.",
      ],
    },
    {
      id: "workout",
      name: "Workout",
      mentor: "Jeff Nippard",
      persona: "You are Jeff Nippard, an evidence-based strength and physique coach mentoring Joe. Be precise and technical about programming, progressive overload, and recovery. No bro-science, cite reasoning briefly.",
      timeStart: "06:30",
      timeEnd: "07:15",
      offline: [
        "Progressive overload beats motivation. Add a rep or a plate today. — Jeff (offline)",
        "Log the session — data beats vibes for long-term gains. — Jeff (offline)",
        "Recovery is part of the program too. Sleep and protein, don't skip them. — Jeff (offline)",
      ],
      feedSentences: [
        "Progressive overload over time beats heroic single workouts.",
        "Logging sessions tells you what works—feelings lie.",
        "Muscles grow during rest, not in the gym. Sleep matters.",
        "90% of gains come from consistent programming, not exercise selection.",
        "Protein intake matters; aim for 0.8-1g per lb bodyweight.",
      ],
    },
    {
      id: "aphantasia",
      name: "Aphantasia Brand",
      mentor: "Trav",
      persona: "You are Trav, a sharp brand strategist mentoring Joe on building his Aphantasia-focused personal brand. Push for clarity of message, consistent posting, and turning a niche condition into a relatable, growing audience.",
      timeStart: "20:00",
      timeEnd: "20:30",
      offline: [
        "Niche is your moat. Post the thing you almost thought was too specific. — Trav (offline)",
        "One clear post beats five vague ones. Ship it. — Trav (offline)",
        "Reach out to one person in the space today — brand is a network game. — Trav (offline)",
      ],
      feedSentences: [
        "Aphantasia is weird—that's your edge, not your weakness.",
        "Your niche audience is 10x more loyal than a generic crowd.",
        "Clarity of message beats fancy production every time.",
        "One DM a day to someone in the space compounds fast.",
        "The smallest 1% of the internet still has millions of people.",
      ],
    },
    {
      id: "content",
      name: "Content",
      mentor: "Gideon",
      persona: "You are Gideon, a high-output content producer mentoring Joe. Obsess over daily shipping, strong hooks in the first 2 seconds, and fast, decisive editing over perfectionism.",
      timeStart: "09:00",
      timeEnd: "10:30",
      offline: [
        "Done beats perfect. Post the rough cut. — Gideon (offline)",
        "Your hook is the whole battle — nail the first 2 seconds. — Gideon (offline)",
        "Ship something today, even small. Momentum compounds. — Gideon (offline)",
      ],
      feedSentences: [
        "The first 2 seconds determine if 100k people watch or 100.",
        "Post rough cuts, not polished videos. Speed wins.",
        "Your 10th video will be 10x better than your 1st.",
        "Momentum beats perfection—ship something today.",
        "Thumbnails and hooks are 80% of your success.",
      ],
    },
  ];

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function formatDate() {
    const d = new Date();
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    return `${days[d.getDay()]} ${months[d.getMonth()]} ${d.getDate()}, ${d.getFullYear()}`;
  }

  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }

  function defaultSchedule() {
    return [
      { id: uid(), start: "06:30", end: "07:15", name: "Morning workout", points: 10, done: false, worldId: "workout" },
      { id: uid(), start: "07:15", end: "08:00", name: "Daycare drop-off", points: 10, done: false, worldId: "daycare" },
      { id: uid(), start: "08:00", end: "09:30", name: "Content prep", points: 10, done: false, worldId: "content" },
      { id: uid(), start: "09:30", end: "18:30", name: "Work", points: 30, done: false, worldId: "workout" },
      { id: uid(), start: "18:30", end: "19:30", name: "Daycare pickup + play", points: 10, done: false, worldId: "daycare" },
      { id: uid(), start: "19:30", end: "20:00", name: "Basketball reps", points: 10, done: false, worldId: "basketball" },
      { id: uid(), start: "20:00", end: "21:00", name: "Aphantasia brand", points: 15, done: false, worldId: "aphantasia" },
    ];
  }

  function defaultState() {
    const worlds = {};
    WORLD_DEFS.forEach((w) => {
      worlds[w.id] = {
        goal: w.id === "basketball" ? "Dunk by 2027 & get good at basketball" : `Master ${w.name}`,
        goalLocked: false,
        missions: [],
        notes: [],
        chat: [
          {
            role: "assistant",
            content: `Hey, it's ${w.mentor}. I'm here to coach you through ${w.name}. What are we working on today?`,
          },
        ],
        feed: [],
        lastFeedGen: null,
      };
    });

    const today = todayStr();
    return {
      meta: { lastResetDate: today, lastFeedResetDate: today },
      schedule: defaultSchedule(),
      schedules: {},
      worlds,
      history: {},
      rules: {
        pointsPerBlock: 10,
        dailyMinimum: 40,
        punishmentText: PUNISHMENTS[Math.floor(Math.random() * PUNISHMENTS.length)],
        model: "claude-haiku-4-5-20251001",
      },
    };
  }

  function loadState() {
    let state = defaultState();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        state = {
          meta: parsed.meta || state.meta,
          schedule: [],
          schedules: parsed.schedules || {},
          worlds: parsed.worlds || state.worlds,
          history: parsed.history || {},
          rules: Object.assign({}, state.rules, parsed.rules || {}),
        };
      }
    } catch (e) {
      state = defaultState();
      state.schedule = [];
    }

    state.schedule = state.schedule || [];
    state.schedules = state.schedules || {};
    state.worlds = state.worlds || defaultState().worlds;
    state.history = state.history || {};
    state.rules = state.rules || defaultState().rules;

    WORLD_DEFS.forEach((w) => {
      if (!state.worlds[w.id]) state.worlds[w.id] = fresh.worlds[w.id];
    });

    const today = todayStr();
    if (state.meta.lastResetDate !== today) {
      state.schedule.forEach((b) => (b.done = false));
      state.history[today] = { blocks: [], totalPoints: 0 };
      state.meta.lastResetDate = today;
      state.rules.punishmentText = PUNISHMENTS[Math.floor(Math.random() * PUNISHMENTS.length)];
    }

    if (state.meta.lastFeedResetDate !== today) {
      state.meta.lastFeedResetDate = today;
    }

    if (!state.history[today]) {
      state.history[today] = { blocks: [], totalPoints: 0 };
    }

    return state;
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let state = loadState();
  let activeTab = "today";
  let activeWorldId = null;
  let worldExpanded = false;
  let backendOnline = true;
  let feedSentences = [];
  let feedIndex = 0;

  // ---------- rendering ----------

  const tabContent = document.getElementById("tab-content");
  const bannerEl = document.getElementById("right-now-banner");

  function currentMinutes() {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }

  function toMinutes(hhmm) {
    const [h, m] = hhmm.split(":").map(Number);
    return h * 60 + m;
  }

  function escapeHtml(str) {
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function setTab(tab) {
    activeTab = tab;
    document.querySelectorAll(".tab-btn").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });
    render();
  }

  function findCurrentWorld() {
    const now = currentMinutes();
    for (let wid of Object.keys(state.worlds)) {
      const def = WORLD_DEFS.find((w) => w.id === wid);
      const start = toMinutes(def.timeStart);
      const end = toMinutes(def.timeEnd);
      if (now >= start && now < end) return def;
    }
    return null;
  }

  function updateBanner() {
    const w = findCurrentWorld();
    bannerEl.innerHTML = w
      ? `<span class="banner-label">RIGHT NOW YOU SHOULD BE:</span>${escapeHtml(w.name)}`
      : `<span class="banner-label">RIGHT NOW:</span>Free time — nothing scheduled`;
  }

  function render() {
    updateBanner();
    if (activeTab === "today") renderToday();
    else if (activeTab === "worlds") renderWorlds();
    else if (activeTab === "feed") renderFeed();
    else if (activeTab === "rules") renderRules();
  }

  // ---------- TODAY ----------

  function showInputModal(title, placeholder, callback) {
    const modal = document.createElement("div");
    modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:2000;";
    modal.innerHTML = `<div style="background:var(--card);padding:20px;border-radius:8px;min-width:280px;border:2px solid var(--gold);">
      <div style="margin-bottom:12px;font-weight:700;color:var(--gold);">${title}</div>
      <input type="text" placeholder="${placeholder}" style="width:100%;padding:8px;background:var(--card-alt);border:1px solid var(--border);color:var(--text);border-radius:4px;box-sizing:border-box;font-size:14px;" />
      <div style="display:flex;gap:8px;margin-top:12px;">
        <button style="flex:1;padding:8px;background:var(--gold);color:#000;border:none;border-radius:4px;cursor:pointer;font-weight:700;">OK</button>
        <button style="flex:1;padding:8px;background:var(--border);color:var(--text);border:none;border-radius:4px;cursor:pointer;">Cancel</button>
      </div>
    </div>`;

    document.body.appendChild(modal);
    const input = modal.querySelector("input");
    const [okBtn, cancelBtn] = modal.querySelectorAll("button");

    const cleanup = () => {
      if (document.body.contains(modal)) document.body.removeChild(modal);
    };

    okBtn.addEventListener("click", () => {
      const value = input.value.trim();
      cleanup();
      if (value) callback(value);
    });

    cancelBtn.addEventListener("click", cleanup);
    input.addEventListener("keypress", (e) => {
      if (e.key === "Enter") okBtn.click();
    });

    input.focus();
  }

  function showConfirmModal(message, onConfirm) {
    const modal = document.createElement("div");
    modal.style.cssText = "position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:2000;";
    modal.innerHTML = `<div style="background:var(--card);padding:20px;border-radius:8px;min-width:280px;border:2px solid var(--danger);">
      <div style="margin-bottom:16px;color:var(--text);font-size:14px;">${message}</div>
      <div style="display:flex;gap:8px;">
        <button style="flex:1;padding:8px;background:var(--danger);color:white;border:none;border-radius:4px;cursor:pointer;font-weight:700;">Delete</button>
        <button style="flex:1;padding:8px;background:var(--border);color:var(--text);border:none;border-radius:4px;cursor:pointer;">Cancel</button>
      </div>
    </div>`;

    document.body.appendChild(modal);
    const [confirmBtn, cancelBtn] = modal.querySelectorAll("button");

    const cleanup = () => {
      if (document.body.contains(modal)) document.body.removeChild(modal);
    };

    confirmBtn.addEventListener("click", () => {
      cleanup();
      onConfirm();
    });

    cancelBtn.addEventListener("click", cleanup);
  }

  function showWorldPicker(block, row, el) {
    const popup = document.createElement("div");
    popup.style.cssText = "position:absolute;background:var(--card-alt);border:1px solid var(--gold);border-radius:8px;z-index:1000;min-width:150px;box-shadow:0 4px 12px rgba(0,0,0,0.5);";

    popup.innerHTML = WORLD_DEFS.map((w) => `<div data-id="${w.id}" style="padding:10px 12px;cursor:pointer;font-size:13px;border-bottom:1px solid var(--border);${w.id === block.worldId ? "background:var(--card);color:var(--gold);font-weight:700;" : "color:var(--text-dim);hover:color:var(--text);"}}">${w.name}</div>`).join("");

    document.body.appendChild(popup);
    const rect = el.getBoundingClientRect();
    popup.style.top = rect.bottom + 5 + "px";
    popup.style.left = rect.left + "px";

    popup.querySelectorAll("[data-id]").forEach((option) => {
      option.addEventListener("click", (e) => {
        e.stopPropagation();
        block.worldId = option.dataset.id;
        saveState();
        document.body.removeChild(popup);
        renderToday();
      });
    });

    document.addEventListener("click", () => {
      if (document.body.contains(popup)) document.body.removeChild(popup);
    }, { once: true });
  }

  const WEEK_STRUCTURE = {
    0: { name: "Sunday", workout: "LOWER Body Day" },
    1: { name: "Monday", workout: "PUSH Day" },
    2: { name: "Tuesday", workout: "PULL Day" },
    3: { name: "Wednesday", workout: "LEG Day" },
    4: { name: "Thursday", workout: "OFF" },
    5: { name: "Friday", workout: "OFF" },
    6: { name: "Saturday", workout: "UPPER Body Day" },
  };

  function renderWeeklyLayout() {
    let html = `<div class="date-header">${escapeHtml(formatDate())}</div>
    <h2 class="section-title">Weekly Schedule</h2>
    <div style="display:flex;gap:8px;margin-bottom:8px;">
      <button class="btn secondary" id="back-to-daily-btn" style="flex:1;">← Back to Daily</button>
    </div>`;

    html += `<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:12px;">`;

    for (let dayNum = 1; dayNum <= 7; dayNum++) {
      const dayOfWeek = dayNum % 7;
      const dayInfo = WEEK_STRUCTURE[dayOfWeek];
      const dayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][dayOfWeek];

      html += `<div class="card" style="padding:12px;">
        <div style="font-weight:700;color:var(--gold);margin-bottom:8px;text-align:center;">${dayName}</div>`;

      if (dayInfo.workout !== "OFF") {
        html += `<div style="font-size:12px;background:var(--card-alt);padding:6px;border-radius:4px;margin-bottom:6px;border-left:3px solid var(--gold);">
          <div style="font-weight:600;color:var(--gold);">${escapeHtml(dayInfo.workout)}</div>
          <div style="color:var(--text-dim);font-size:11px;">7:00 - 9:00</div>
        </div>`;
      } else {
        html += `<div style="font-size:12px;color:var(--text-dim);padding:6px;margin-bottom:6px;text-align:center;">Rest Day</div>`;
      }

      html += `<div style="font-size:12px;background:var(--card-alt);padding:6px;border-radius:4px;margin-bottom:6px;border-left:3px solid var(--blue);">
        <div style="font-weight:600;color:var(--blue);">Work Shift</div>
        <div style="color:var(--text-dim);font-size:11px;">9:30 - 6:30</div>
      </div>
      <div style="font-size:12px;background:var(--card-alt);padding:6px;border-radius:4px;border-left:3px solid var(--purple);">
        <div style="font-weight:600;color:var(--purple);">Aphantasia Grind</div>
        <div style="color:var(--text-dim);font-size:11px;">7:00 - 11:00</div>
      </div>`;

      html += `</div>`;
    }

    html += `</div>`;

    tabContent.innerHTML = html;

    const backBtn = document.getElementById("back-to-daily-btn");
    if (backBtn) {
      backBtn.addEventListener("click", () => {
        render();
      });
    }
  }

  function renderToday() {
    const pts = state.schedule.filter((b) => b.done).reduce((sum, b) => sum + Number(b.points || 0), 0);
    const min = Number(state.rules.dailyMinimum || 0);
    const pct = min > 0 ? Math.min(100, Math.round((pts / min) * 100)) : 100;
    const underMinimum = pts < min;

    let html = `<div class="date-header">${escapeHtml(formatDate())}</div>
    <h2 class="section-title">Scorecard</h2>
    <div class="card scorecard">
      <div>
        <div class="points-num">${pts}</div>
        <div class="points-sub">of ${min} pts today</div>
      </div>
      <div class="progress-track"><div class="progress-fill" style="width:${pct}%"></div></div>
    </div>`;

    if (underMinimum) {
      html += `<div class="punishment"><b>Below minimum:</b> ${escapeHtml(state.rules.punishmentText)}</div>`;
    }

    const scheduleNames = Object.keys(state.schedules || {});
    html += `<h2 class="section-title">📋 Schedules</h2>
    <div class="card" style="display:flex;gap:8px;margin-bottom:8px;">
      <button class="btn" id="new-schedule-btn" style="flex:1;">➕ New</button>
      <button class="btn" id="save-schedule-btn" style="flex:1;">💾 Save</button>
    </div>
    ${scheduleNames.length > 0 ? `<div class="card" style="display:flex;gap:6px;flex-wrap:wrap;">
      ${scheduleNames.map(name => `<div style="position:relative;flex:1;min-width:80px;">
        <button class="btn secondary" data-load-schedule="${name}" style="width:100%;font-size:12px;">📂 ${escapeHtml(name)}</button>
        <button class="icon-btn" data-delete-schedule="${name}" style="position:absolute;top:-8px;right:-8px;width:24px;height:24px;padding:0;font-size:12px;background:var(--danger);color:white;border-radius:50%;display:flex;align-items:center;justify-content:center;">✕</button>
      </div>`).join("")}
    </div>` : ""}`;

    html += `<h2 class="section-title">Schedule</h2>
    <div style="display:flex;gap:8px;margin-bottom:8px;">
      <button class="btn secondary" id="weekly-view-toggle" style="flex:1;">📅 Weekly View</button>
      <button class="btn secondary" id="weekly-preset-btn" style="flex:1;">⚡ Load Preset</button>
    </div>
    <div class="card" id="schedule-card">`;
    if (state.schedule.length === 0) {
      html += `<div class="mission-empty">No blocks yet.</div>`;
    } else {
      state.schedule
        .slice()
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
        .forEach((b, idx) => {
          const world = WORLD_DEFS.find((w) => w.id === b.worldId);
          const worldLabel = world ? `[${world.name}]` : "";
          html += `
          <div class="block ${b.done ? "done" : ""}" data-id="${b.id}" draggable="true" style="cursor:grab;">
            <input type="checkbox" class="block-done" ${b.done ? "checked" : ""} />
            <div class="block-fields">
              <span style="font-size:11px; color:var(--gold); font-weight:700; flex-shrink:0;">${escapeHtml(worldLabel)}</span>
              <input type="time" class="block-start" value="${b.start}" />
              <input type="time" class="block-end" value="${b.end}" />
              <input type="text" class="block-name" value="${escapeHtml(b.name)}" placeholder="Block name" />
              <input type="number" class="block-points" value="${b.points}" min="0" />
            </div>
            <button class="icon-btn block-delete" title="Delete">✕</button>
          </div>`;
        });
    }
    html += `</div>
    <button class="btn full" id="add-block-btn">+ Add block</button>`;

    tabContent.innerHTML = html;

    const newBtn = document.getElementById("new-schedule-btn");
    const saveBtn = document.getElementById("save-schedule-btn");

    if (newBtn) {
      newBtn.addEventListener("click", () => {
        showInputModal("New Schedule", "e.g., Chill Day, Grind Day", (name) => {
          state.schedules[name] = [];
          state.schedule = [];
          saveState();
          renderToday();
        });
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        showInputModal("Save Schedule", "Enter schedule name", (name) => {
          state.schedules[name] = JSON.parse(JSON.stringify(state.schedule));
          saveState();
          renderToday();
        });
      });
    }

    document.querySelectorAll("[data-load-schedule]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const name = btn.dataset.loadSchedule;
        if (state.schedules[name]) {
          state.schedule = JSON.parse(JSON.stringify(state.schedules[name]));
          saveState();
          renderToday();
        }
      });
    });

    document.querySelectorAll("[data-delete-schedule]").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        e.stopPropagation();
        const name = btn.dataset.deleteSchedule;
        showConfirmModal(`Delete schedule "${escapeHtml(name)}"?`, () => {
          delete state.schedules[name];
          saveState();
          renderToday();
        });
      });
    });

    document.getElementById("add-block-btn").addEventListener("click", () => {
      const newBlock = {
        id: uid(),
        start: "09:00",
        end: "10:00",
        name: "Click to edit",
        points: 10,
        done: false,
        worldId: "workout",
        _isNew: true,
      };
      state.schedule.push(newBlock);
      saveState();
      renderToday();
      setTimeout(() => {
        const el = document.querySelector(`[data-id="${newBlock.id}"]`);
        if (el) el.querySelector(".block-name").click();
      }, 100);
    });

    const weeklyViewToggle = document.getElementById("weekly-view-toggle");
    if (weeklyViewToggle) {
      weeklyViewToggle.addEventListener("click", () => {
        renderWeeklyLayout();
      });
    }

    const weeklyPresetBtn = document.getElementById("weekly-preset-btn");
    if (weeklyPresetBtn) {
      weeklyPresetBtn.addEventListener("click", () => {
        showConfirmModal("Load Push/Pull/Legs + Work + Aphantasia weekly schedule?", () => {
          state.schedule = [
            { id: uid(), start: "07:00", end: "09:00", name: "PUSH Day", points: 30, done: false, worldId: "workout" },
            { id: uid(), start: "09:30", end: "18:30", name: "Work Shift", points: 50, done: false, worldId: "daycare" },
            { id: uid(), start: "19:00", end: "23:00", name: "Aphantasia Grind", points: 40, done: false, worldId: "aphantasia" },
            { id: uid(), start: "07:00", end: "09:00", name: "PULL Day", points: 30, done: false, worldId: "workout" },
            { id: uid(), start: "09:30", end: "18:30", name: "Work Shift", points: 50, done: false, worldId: "daycare" },
            { id: uid(), start: "19:00", end: "23:00", name: "Aphantasia Grind", points: 40, done: false, worldId: "aphantasia" },
            { id: uid(), start: "07:00", end: "09:00", name: "LEG Day", points: 30, done: false, worldId: "workout" },
            { id: uid(), start: "09:30", end: "18:30", name: "Work Shift", points: 50, done: false, worldId: "daycare" },
            { id: uid(), start: "19:00", end: "23:00", name: "Aphantasia Grind", points: 40, done: false, worldId: "aphantasia" },
            { id: uid(), start: "09:30", end: "18:30", name: "Work Shift", points: 50, done: false, worldId: "daycare" },
            { id: uid(), start: "19:00", end: "23:00", name: "Aphantasia Grind", points: 40, done: false, worldId: "aphantasia" },
            { id: uid(), start: "07:00", end: "09:00", name: "UPPER Body Day", points: 30, done: false, worldId: "workout" },
            { id: uid(), start: "09:30", end: "18:30", name: "Work Shift", points: 50, done: false, worldId: "daycare" },
            { id: uid(), start: "19:00", end: "23:00", name: "Aphantasia Grind", points: 40, done: false, worldId: "aphantasia" },
            { id: uid(), start: "07:00", end: "09:00", name: "LOWER Body Day", points: 30, done: false, worldId: "workout" },
            { id: uid(), start: "09:30", end: "18:30", name: "Work Shift", points: 50, done: false, worldId: "daycare" },
            { id: uid(), start: "19:00", end: "23:00", name: "Aphantasia Grind", points: 40, done: false, worldId: "aphantasia" },
          ];
          saveState();
          renderToday();
        });
      });
    }

    let draggedBlock = null;
    document.querySelectorAll("#schedule-card .block").forEach((el) => {
      el.addEventListener("dragstart", () => {
        draggedBlock = el;
        el.style.opacity = "0.5";
      });
      el.addEventListener("dragend", () => {
        el.style.opacity = "1";
        draggedBlock = null;
      });
      el.addEventListener("dragover", (e) => {
        e.preventDefault();
        if (draggedBlock && draggedBlock !== el) {
          const rect = el.getBoundingClientRect();
          const middle = rect.top + rect.height / 2;
          if (e.clientY < middle) {
            el.parentNode.insertBefore(draggedBlock, el);
          } else {
            el.parentNode.insertBefore(draggedBlock, el.nextSibling);
          }
        }
      });
    });
    document.getElementById("schedule-card").addEventListener("drop", () => {
      const blockOrder = Array.from(document.querySelectorAll("#schedule-card .block")).map(el => {
        const id = el.dataset.id;
        return state.schedule.find(b => b.id === id);
      });
      state.schedule = blockOrder.filter(b => b);
      saveState();
    });

    document.querySelectorAll("#schedule-card .block").forEach((row) => {
      const id = row.dataset.id;
      const block = state.schedule.find((b) => b.id === id);
      if (!block) return;

      const worldSpan = row.querySelector("span");
      if (worldSpan) {
        worldSpan.style.cursor = "pointer";
        worldSpan.addEventListener("click", (e) => {
          e.stopPropagation();
          showWorldPicker(block, row, worldSpan);
        });
      }

      row.querySelector(".block-done").addEventListener("change", (e) => {
        block.done = e.target.checked;
        const today = todayStr();
        if (!state.history[today]) state.history[today] = { blocks: [], totalPoints: 0 };
        if (e.target.checked) {
          state.history[today].blocks.push({ name: block.name, points: block.points, time: new Date().toLocaleTimeString() });
          state.history[today].totalPoints = (state.history[today].totalPoints || 0) + Number(block.points || 0);
        }
        saveState();
        renderToday();
      });
      row.querySelector(".block-start").addEventListener("change", (e) => {
        block.start = e.target.value;
        saveState();
        updateBanner();
      });
      row.querySelector(".block-end").addEventListener("change", (e) => {
        block.end = e.target.value;
        saveState();
        updateBanner();
      });
      row.querySelector(".block-name").addEventListener("change", (e) => {
        block.name = e.target.value;
        saveState();
        updateBanner();
      });
      row.querySelector(".block-points").addEventListener("change", (e) => {
        block.points = Number(e.target.value || 0);
        saveState();
        renderToday();
      });
      row.querySelector(".block-delete").addEventListener("click", () => {
        state.schedule = state.schedule.filter((b) => b.id !== id);
        saveState();
        renderToday();
      });
    });
  }

  // ---------- WORLDS ----------

  function worldDef(id) {
    return WORLD_DEFS.find((w) => w.id === id);
  }

  function renderWorlds() {
    let html = `<div class="world-selector">`;
    WORLD_DEFS.forEach((w) => {
      html += `<button class="world-btn ${w.id === activeWorldId && worldExpanded ? "active" : ""}" data-id="${w.id}">${escapeHtml(w.name)}</button>`;
    });
    html += `</div>`;

    if (!activeWorldId || !worldExpanded) {
      tabContent.innerHTML = html;
      document.querySelectorAll(".world-btn").forEach((btn) => {
        btn.addEventListener("click", () => {
          activeWorldId = btn.dataset.id;
          worldExpanded = true;
          renderWorlds();
        });
      });
      return;
    }

    const def = worldDef(activeWorldId);
    const wstate = state.worlds[activeWorldId];

    html += `<button class="btn secondary" id="close-world-btn" style="width:100%;margin-bottom:12px;">← Back to Worlds</button>`;

    html += `
    <div class="card world-goal">
      <div style="display:flex;gap:8px;align-items:center;">
        <label class="field-label" style="flex:1;margin:0;">Main Goal</label>
        <button class="icon-btn" id="goal-lock-btn" style="font-size:18px;">${wstate.goalLocked ? "🔒" : "🔓"}</button>
      </div>
      <input type="text" class="goal-input" value="${escapeHtml(wstate.goal)}" placeholder="e.g., Dunk by 2027" ${wstate.goalLocked ? "disabled" : ""} />
    </div>

    <h2 class="section-title">📝 Missions</h2>
    <h3 style="font-size:12px;color:var(--text-dim);margin:0 0 8px 0;text-transform:uppercase;letter-spacing:1px;">Today's blocks in this world:</h3>
    <div class="card" id="block-missions" style="background:rgba(212,175,55,0.05);border:1px solid var(--gold-dim);margin-bottom:12px;">`;

    const blocksForWorld = state.schedule.filter(b => b.worldId === activeWorldId);
    if (blocksForWorld.length === 0) {
      html += `<div class="mission-empty" style="font-size:12px;">No blocks scheduled for this world today</div>`;
    } else {
      blocksForWorld.forEach((b) => {
        const alreadyExists = wstate.missions.some(m => m.blockId === b.id);
        html += `<div class="mission-item" style="justify-content:space-between;"><div style="display:flex;gap:8px;align-items:center;flex:1;"><input type="checkbox" ${b.done ? "checked" : ""} disabled /> <span>${escapeHtml(b.name)} (${b.start}–${b.end})</span></div><button class="icon-btn" data-add-block-mission="${b.id}" style="font-size:12px;">${alreadyExists ? "✓" : "➕"}</button></div>`;
      });
    }

    html += `</div>
    <h3 style="font-size:12px;color:var(--text-dim);margin:0 0 8px 0;text-transform:uppercase;letter-spacing:1px;">Custom missions:</h3>
    <div class="card" id="missions-editor">`;

    if (wstate.missions.length === 0) {
      html += `<div class="mission-empty">Add custom missions below</div>`;
    } else {
      wstate.missions.forEach((m) => {
        html += `
        <div class="mission-edit" data-id="${m.id}">
          <input type="checkbox" class="mission-check" ${m.done ? "checked" : ""} />
          <input type="text" class="mission-text" value="${escapeHtml(m.text)}" placeholder="Mission" />
          <button class="icon-btn mission-delete">✕</button>
        </div>`;
      });
    }

    html += `</div>
    <button class="btn full" id="add-mission-btn">+ Add mission</button>

    <h2 class="section-title">Chat with ${escapeHtml(def.mentor)}</h2>
    <div class="card">
      <div class="chat-log" id="chat-log">`;

    wstate.chat.forEach((msg) => {
      html += `<div class="msg ${msg.role}">${escapeHtml(msg.content)}${msg.offline ? '<span class="offline-tag">offline reply</span>' : ""}</div>`;
    });

    html += `</div>
      <div class="chat-input-row">
        <input type="text" id="chat-input" placeholder="Ask ${escapeHtml(def.mentor)}…" />
        <button class="btn" id="chat-send">Send</button>
      </div>
      <div class="status-pill ${backendOnline ? "online" : "offline"}">${backendOnline ? "backend online" : "backend unreachable"}</div>
    </div>

    <h2 class="section-title">Important Points (delete if redundant)</h2>
    <div class="card" id="notes-card">`;

    if (wstate.notes.length === 0) {
      html += `<div class="mission-empty">No notes yet. AI will add important points here.</div>`;
    } else {
      wstate.notes.forEach((n) => {
        html += `
        <div class="note-item" data-id="${n.id}">
          <span>${escapeHtml(n.text)}</span>
          <button class="icon-btn note-delete">✕</button>
        </div>`;
      });
    }

    html += `</div>`;

    tabContent.innerHTML = html;

    const closeBtn = document.getElementById("close-world-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        worldExpanded = false;
        renderWorlds();
      });
    }

    const chatLog = document.getElementById("chat-log");
    if (chatLog) chatLog.scrollTop = chatLog.scrollHeight;

    document.querySelector(".goal-input").addEventListener("change", (e) => {
      wstate.goal = e.target.value;
      saveState();
    });

    document.getElementById("goal-lock-btn").addEventListener("click", () => {
      wstate.goalLocked = !wstate.goalLocked;
      saveState();
      renderWorlds();
    });

    document.querySelectorAll("[data-add-block-mission]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const blockId = btn.dataset.addBlockMission;
        const block = state.schedule.find(b => b.id === blockId);
        if (block && !wstate.missions.some(m => m.blockId === blockId)) {
          wstate.missions.push({
            id: uid(),
            blockId: blockId,
            text: block.name,
            done: false,
          });
          saveState();
          renderWorlds();
        }
      });
    });

    document.getElementById("add-mission-btn").addEventListener("click", () => {
      wstate.missions.push({ id: uid(), text: "", done: false });
      saveState();
      renderWorlds();
    });

    document.querySelectorAll("#missions-editor .mission-edit").forEach((row) => {
      const id = row.dataset.id;
      const m = wstate.missions.find((x) => x.id === id);
      if (!m) return;

      row.querySelector(".mission-check").addEventListener("change", (e) => {
        m.done = e.target.checked;
        saveState();
        renderWorlds();
      });

      row.querySelector(".mission-text").addEventListener("change", (e) => {
        m.text = e.target.value;
        saveState();
      });

      row.querySelector(".mission-delete").addEventListener("click", () => {
        wstate.missions = wstate.missions.filter((x) => x.id !== id);
        saveState();
        renderWorlds();
      });
    });

    document.querySelectorAll("#notes-card .note-delete").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = e.target.closest(".note-item").dataset.id;
        wstate.notes = wstate.notes.filter((n) => n.id !== id);
        saveState();
        renderWorlds();
      });
    });

    const input = document.getElementById("chat-input");
    const send = document.getElementById("chat-send");
    const doSend = () => sendWorldChat(activeWorldId, input.value.trim());
    send.addEventListener("click", doSend);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doSend();
    });
  }

  async function sendWorldChat(worldId, text) {
    if (!text) return;
    const def = worldDef(worldId);
    const wstate = state.worlds[worldId];

    wstate.chat.push({ role: "user", content: text });
    saveState();
    renderWorlds();

    const apiMessages = wstate.chat.map((m) => ({ role: m.role, content: m.content }));
    const context = `World: ${def.name}\nGoal: ${wstate.goal}\nMissions: ${wstate.missions.map((m) => m.text).join(", ") || "none yet"}`;

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          system: `${def.persona}\n\nContext:\n${context}\n\nUser manages missions themselves. Your job is to coach and remember important points. Keep replies conversational and engaging (2-4 sentences). If you need to save something important, start the line with [NOTE: ...].`,
          messages: apiMessages,
          model: state.rules.model,
        }),
      });

      if (!res.ok) throw new Error("backend error");
      const data = await res.json();
      backendOnline = true;

      const reply = data.text || "…";
      const notes = [];
      const cleaned = reply
        .split("\n")
        .filter((line) => {
          if (line.startsWith("[NOTE:")) {
            notes.push({ id: uid(), text: line.replace(/^\[NOTE:\s*/, "").replace(/\]$/, "") });
            return false;
          }
          return true;
        })
        .join("\n")
        .trim();

      wstate.chat.push({ role: "assistant", content: cleaned || "…" });
      notes.forEach((n) => {
        if (!wstate.notes.find((x) => x.text === n.text)) wstate.notes.push(n);
      });
    } catch (err) {
      backendOnline = false;
      const lines = def.offline;
      const line = lines[Math.floor(Math.random() * lines.length)];
      wstate.chat.push({ role: "assistant", content: line, offline: true });
    }

    saveState();
    renderWorlds();
  }

  // ---------- FEED (TikTok-style, shuffled) ----------

  function getAllFeedSentences() {
    const all = [];
    WORLD_DEFS.forEach((def) => {
      def.feedSentences.forEach((sent) => {
        all.push({ world: def.name, worldId: def.id, text: sent });
      });
    });
    // Shuffle array
    for (let i = all.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [all[i], all[j]] = [all[j], all[i]];
    }
    return all;
  }

  function renderFeed() {
    if (state.meta.lastFeedResetDate !== todayStr()) {
      feedSentences = [];
      feedIndex = 0;
      state.meta.lastFeedResetDate = todayStr();
      saveState();
    }

    if (feedSentences.length === 0) {
      feedSentences = getAllFeedSentences();
    }
    if (feedSentences.length === 0) {
      tabContent.innerHTML = `<div class="feed-empty">No ideas yet.</div>`;
      return;
    }

    feedIndex = feedIndex % feedSentences.length;
    const current = feedSentences[feedIndex];

    let html = `<div class="feed-tiktok">
      <div class="feed-slide">
        <div class="feed-world-tag">${escapeHtml(current.world)}</div>
        <div class="feed-sentence">${escapeHtml(current.text)}</div>
      </div>
      <div class="feed-nav">
        <button id="feed-prev" class="feed-btn">← Prev</button>
        <span class="feed-counter">${feedIndex + 1} / ${feedSentences.length}</span>
        <button id="feed-next" class="feed-btn">Next →</button>
      </div>
    </div>`;

    tabContent.innerHTML = html;

    document.getElementById("feed-prev").addEventListener("click", () => {
      feedIndex = (feedIndex - 1 + feedSentences.length) % feedSentences.length;
      renderFeed();
    });

    document.getElementById("feed-next").addEventListener("click", () => {
      feedIndex = (feedIndex + 1) % feedSentences.length;
      renderFeed();
    });
  }

  // ---------- RULES ----------

  function renderRules() {
    const historyEntries = Object.entries(state.history).reverse().slice(0, 30);

    let html = `
      <h2 class="section-title">Configuration</h2>
      <div class="card">
        <div class="field-group">
          <label>Points per block</label>
          <input type="number" id="rule-points" min="0" value="${state.rules.pointsPerBlock}" />
        </div>
        <div class="field-group">
          <label>Daily minimum (points)</label>
          <input type="number" id="rule-min" min="0" value="${state.rules.dailyMinimum}" />
        </div>
        <div class="field-group">
          <label>Punishment text</label>
          <textarea id="rule-punish">${escapeHtml(state.rules.punishmentText)}</textarea>
        </div>
        <div class="field-group">
          <label>Mentor chat model</label>
          <select id="rule-model"><option>Loading…</option></select>
        </div>
      </div>

      <h2 class="section-title">History</h2>
      <div class="card" id="history-card">`;

    if (historyEntries.length === 0) {
      html += `<div class="mission-empty">No history yet.</div>`;
    } else {
      historyEntries.forEach(([date, entry]) => {
        html += `
        <div class="history-day">
          <div class="history-date">${escapeHtml(date)}</div>
          <div class="history-points">${entry.totalPoints || 0} pts</div>
          <div class="history-blocks">`;
        if (entry.blocks && entry.blocks.length > 0) {
          entry.blocks.forEach((b) => {
            html += `<div class="history-block">• ${escapeHtml(b.name)} (+${b.points})</div>`;
          });
        }
        html += `</div></div>`;
      });
    }

    html += `</div>`;

    tabContent.innerHTML = html;

    document.getElementById("rule-points").addEventListener("change", (e) => {
      state.rules.pointsPerBlock = Number(e.target.value || 0);
      saveState();
    });
    document.getElementById("rule-min").addEventListener("change", (e) => {
      state.rules.dailyMinimum = Number(e.target.value || 0);
      saveState();
      if (activeTab === "today") renderToday();
    });
    document.getElementById("rule-punish").addEventListener("change", (e) => {
      state.rules.punishmentText = e.target.value;
      saveState();
    });

    const select = document.getElementById("rule-model");
    fetch("/api/models")
      .then((r) => r.json())
      .then((data) => {
        select.innerHTML = "";
        (data.models || []).forEach((m) => {
          const opt = document.createElement("option");
          opt.value = m.id;
          opt.textContent = m.label;
          if (m.id === state.rules.model) opt.selected = true;
          select.appendChild(opt);
        });
        select.addEventListener("change", (e) => {
          state.rules.model = e.target.value;
          saveState();
        });
      })
      .catch(() => {
        select.innerHTML = `<option value="${state.rules.model}">${state.rules.model}</option>`;
      });
  }

  // ---------- init ----------

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => setTab(btn.dataset.tab));
  });

  setInterval(updateBanner, 15000);
  render();

  // Hide loading, show app
  setTimeout(() => {
    const loading = document.getElementById("loading");
    const app = document.getElementById("app");
    if (loading) loading.style.display = "none";
    if (app) app.style.display = "flex";
  }, 300);
})();
