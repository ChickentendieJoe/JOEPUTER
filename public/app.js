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
      schedules: { "Work 9:30-6:30": defaultSchedule() },
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
    let state;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      state = raw ? JSON.parse(raw) : defaultState();
    } catch (e) {
      state = defaultState();
    }

    const fresh = defaultState();
    state.meta = state.meta || fresh.meta;
    state.schedule = Array.isArray(state.schedule) ? state.schedule : fresh.schedule;
    state.schedules = state.schedules || fresh.schedules;
    state.worlds = state.worlds || fresh.worlds;
    state.history = state.history || {};
    state.rules = Object.assign({}, fresh.rules, state.rules || {});

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
  let activeWorldId = "basketball";
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
    html += `<h2 class="section-title">📋 Manage Schedules</h2>
    <div class="card" style="display:flex;gap:8px;flex-wrap:wrap;">
      ${scheduleNames.map((name, i) => `<button class="btn" data-schedule-load="${i}" style="flex:1;min-width:100px;">${escapeHtml(name)}</button>`).join("")}
      <button class="btn secondary" id="save-schedule-btn" style="flex:1;min-width:100px;">💾 Save</button>
    </div>`;

    html += `<h2 class="section-title">Schedule</h2><div class="card" id="schedule-card">`;
    if (state.schedule.length === 0) {
      html += `<div class="mission-empty">No blocks yet.</div>`;
    } else {
      state.schedule
        .slice()
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
        .forEach((b) => {
          const world = WORLD_DEFS.find((w) => w.id === b.worldId);
          const worldLabel = world ? `[${world.name}]` : "";
          html += `
          <div class="block ${b.done ? "done" : ""}" data-id="${b.id}">
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

    document.querySelectorAll("[data-schedule-load]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.dataset.scheduleLoad);
        const scheduleNames = Object.keys(state.schedules || {});
        if (scheduleNames[idx]) {
          state.schedule = JSON.parse(JSON.stringify(state.schedules[scheduleNames[idx]]));
          saveState();
          renderToday();
        }
      });
    });

    document.getElementById("save-schedule-btn").addEventListener("click", () => {
      const name = prompt("Schedule name:");
      if (name && name.trim()) {
        state.schedules[name.trim()] = JSON.parse(JSON.stringify(state.schedule));
        saveState();
        renderToday();
      }
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
      html += `<button class="world-btn ${w.id === activeWorldId ? "active" : ""}" data-id="${w.id}">${escapeHtml(w.name)}</button>`;
    });
    html += `</div>`;

    const def = worldDef(activeWorldId);
    const wstate = state.worlds[activeWorldId];

    html += `
    <div class="card world-goal">
      <label class="field-label">Main Goal</label>
      <input type="text" class="goal-input" value="${escapeHtml(wstate.goal)}" placeholder="e.g., Dunk by 2027" />
    </div>

    <h2 class="section-title">Missions (Edit Daily)</h2>
    <div class="card" id="missions-editor">`;

    if (wstate.missions.length === 0) {
      html += `<div class="mission-empty">No missions yet. Add one below.</div>`;
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

    const chatLog = document.getElementById("chat-log");
    if (chatLog) chatLog.scrollTop = chatLog.scrollHeight;

    document.querySelectorAll(".world-btn").forEach((btn) => {
      btn.addEventListener("click", () => {
        activeWorldId = btn.dataset.id;
        renderWorlds();
      });
    });

    document.querySelector(".goal-input").addEventListener("change", (e) => {
      wstate.goal = e.target.value;
      saveState();
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
})();
