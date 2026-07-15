(function () {
  "use strict";

  const STORAGE_KEY = "joeputer_state_v1";

  const MENTOR_TOKEN_INSTRUCTIONS = `
You are chatting inside "Joeputer", Joe's personal command-center app. Stay fully in character as this mentor. Keep replies short and punchy (2-5 sentences), like a text message, not an essay.

You control your own mission checklist. When it genuinely helps, include hidden control tokens anywhere in your reply — the app strips them before Joe sees the text:
[[ADD_MISSION: short mission text]] — add a mission
[[REMOVE_MISSION: text matching an existing mission]] — remove one
[[CLEAR_MISSIONS]] — wipe the whole list
Only emit a token when you intend to actually change the checklist right now. Never explain the token syntax to Joe.`.trim();

  const MENTOR_DEFS = [
    {
      id: "mj",
      name: "MJ",
      category: "Basketball",
      desc: "Ex-pro, ruthless competitor. Talks in short, sharp lines about reps, fundamentals, and killer instinct.",
      persona: "You are MJ, a legendary, ruthlessly competitive basketball mentor coaching Joe. Demand excellence, call out excuses, but back it with real fundamentals: footwork, reps, film study, conditioning.",
      missions: ["50 makes from 3 spots", "Watch one game-film clip", "Box out on every rebound rep"],
      offline: [
        "Winners are workers. Get your reps in and stop talking about it — MJ (offline)",
        "Nobody remembers the practice you skipped. Get on the court. — MJ (offline)",
        "Fundamentals win championships. Footwork first, then shoot. — MJ (offline)",
      ],
    },
    {
      id: "rachel",
      name: "Ms. Rachel",
      category: "Daycare",
      desc: "Warm, patient early-childhood expert. Gentle but firm about routines, prep, and connection time.",
      persona: "You are Ms. Rachel, a warm, patient early-childhood education expert mentoring Joe on daycare logistics and being present with his kid. Encourage routines, prep-ahead habits, and small moments of connection.",
      missions: ["Pack tomorrow's daycare bag tonight", "One learning song during pickup", "3 moments of positive reinforcement today"],
      offline: [
        "Little wins count — pack that bag tonight and tomorrow morning gets easier. — Ms. Rachel (offline)",
        "Even five minutes of real eye-contact play makes a difference today. — Ms. Rachel (offline)",
        "Consistency is the whole game with little ones. You've got this. — Ms. Rachel (offline)",
      ],
    },
    {
      id: "jeff",
      name: "Jeff Nippard",
      category: "Workout",
      desc: "Evidence-based strength coach. Precise, technical, no bro-science — just programming and progressive overload.",
      persona: "You are Jeff Nippard, an evidence-based strength and physique coach mentoring Joe. Be precise and technical about programming, progressive overload, and recovery. No bro-science, cite reasoning briefly.",
      missions: ["Hit today's programmed lift", "Log sets/reps/RPE", "Hit protein target"],
      offline: [
        "Progressive overload beats motivation. Add a rep or a plate today. — Jeff (offline)",
        "Log the session — data beats vibes for long-term gains. — Jeff (offline)",
        "Recovery is part of the program too. Sleep and protein, don't skip them. — Jeff (offline)",
      ],
    },
    {
      id: "trav",
      name: "Trav",
      category: "Aphantasia Brand",
      desc: "Sharp niche-brand strategist. Obsessed with clarity, positioning, and turning a weird niche into a real audience.",
      persona: "You are Trav, a sharp brand strategist mentoring Joe on building his Aphantasia-focused personal brand. Push for clarity of message, consistent posting, and turning a niche condition into a relatable, growing audience.",
      missions: ["Post one piece of aphantasia content", "DM 3 potential collaborators", "Write down today's brand insight"],
      offline: [
        "Niche is your moat. Post the thing you almost thought was too specific. — Trav (offline)",
        "One clear post beats five vague ones. Ship it. — Trav (offline)",
        "Reach out to one person in the space today — brand is a network game. — Trav (offline)",
      ],
    },
    {
      id: "gideon",
      name: "Gideon",
      category: "Content",
      desc: "High-output content producer. Obsessed with shipping daily, hooks, and editing fast.",
      persona: "You are Gideon, a high-output content producer mentoring Joe. Obsess over daily shipping, strong hooks in the first 2 seconds, and fast, decisive editing over perfectionism.",
      missions: ["Film one clip", "Edit + post one short", "Reply to comments for 10 minutes"],
      offline: [
        "Done beats perfect. Post the rough cut. — Gideon (offline)",
        "Your hook is the whole battle — nail the first 2 seconds. — Gideon (offline)",
        "Ship something today, even small. Momentum compounds. — Gideon (offline)",
      ],
    },
  ];

  function todayStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  }

  function uid() {
    return Math.random().toString(36).slice(2, 10);
  }

  function defaultSchedule() {
    return [
      { id: uid(), start: "06:30", end: "07:15", name: "Morning workout", points: 10, done: false },
      { id: uid(), start: "07:15", end: "08:00", name: "Daycare drop-off prep", points: 10, done: false },
      { id: uid(), start: "09:00", end: "10:30", name: "Content filming/editing", points: 15, done: false },
      { id: uid(), start: "13:00", end: "14:00", name: "Basketball reps", points: 10, done: false },
      { id: uid(), start: "17:00", end: "18:00", name: "Daycare pickup + play", points: 10, done: false },
      { id: uid(), start: "20:00", end: "20:30", name: "Aphantasia brand work", points: 10, done: false },
    ];
  }

  function defaultState() {
    const mentors = {};
    MENTOR_DEFS.forEach((m) => {
      mentors[m.id] = {
        missions: m.missions.map((text) => ({ id: uid(), text, done: false })),
        chat: [
          {
            role: "assistant",
            content: `Hey, it's ${m.name}. ${m.desc} What are we working on?`,
          },
        ],
      };
    });

    return {
      meta: { lastResetDate: todayStr() },
      schedule: defaultSchedule(),
      rules: {
        pointsPerBlock: 10,
        dailyMinimum: 40,
        punishmentText: "No phone scrolling tonight. Lights out by 9:30, and tomorrow you owe a double session.",
        model: "claude-haiku-4-5-20251001",
      },
      mentors,
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

    // backfill in case of partial/old state shape
    const fresh = defaultState();
    state.meta = state.meta || fresh.meta;
    state.schedule = Array.isArray(state.schedule) ? state.schedule : fresh.schedule;
    state.rules = Object.assign({}, fresh.rules, state.rules || {});
    state.mentors = state.mentors || {};
    MENTOR_DEFS.forEach((m) => {
      if (!state.mentors[m.id]) state.mentors[m.id] = fresh.mentors[m.id];
    });

    // daily reset: new day clears "done" flags so points restart
    if (state.meta.lastResetDate !== todayStr()) {
      state.schedule.forEach((b) => (b.done = false));
      state.meta.lastResetDate = todayStr();
    }

    return state;
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  let state = loadState();
  let activeTab = "today";
  let activeMentorId = MENTOR_DEFS[0].id;
  let backendOnline = true;

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

  function findCurrentBlock() {
    const now = currentMinutes();
    return state.schedule.find((b) => {
      const start = toMinutes(b.start);
      const end = toMinutes(b.end);
      return now >= start && now < end;
    });
  }

  function totalPoints() {
    return state.schedule.filter((b) => b.done).reduce((sum, b) => sum + Number(b.points || 0), 0);
  }

  function updateBanner() {
    const block = findCurrentBlock();
    bannerEl.innerHTML = block
      ? `<span class="banner-label">RIGHT NOW YOU SHOULD BE:</span>${escapeHtml(block.name)}`
      : `<span class="banner-label">RIGHT NOW:</span>Free time — nothing scheduled`;
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

  function render() {
    updateBanner();
    if (activeTab === "today") renderToday();
    else if (activeTab === "mentors") renderMentors();
    else renderRules();
  }

  // ---------- TODAY ----------

  function renderToday() {
    const pts = totalPoints();
    const min = Number(state.rules.dailyMinimum || 0);
    const pct = min > 0 ? Math.min(100, Math.round((pts / min) * 100)) : 100;
    const underMinimum = pts < min;

    let html = `<h2 class="section-title">Scorecard</h2>
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

    html += `<h2 class="section-title">Schedule</h2><div class="card" id="schedule-card">`;
    if (state.schedule.length === 0) {
      html += `<div class="mission-empty">No blocks yet — add one below.</div>`;
    } else {
      state.schedule
        .slice()
        .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
        .forEach((b) => {
          html += `
          <div class="block ${b.done ? "done" : ""}" data-id="${b.id}">
            <input type="checkbox" class="block-done" ${b.done ? "checked" : ""} />
            <div class="block-fields">
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

    document.getElementById("add-block-btn").addEventListener("click", () => {
      state.schedule.push({
        id: uid(),
        start: "09:00",
        end: "10:00",
        name: "New block",
        points: Number(state.rules.pointsPerBlock || 10),
        done: false,
      });
      saveState();
      renderToday();
    });

    document.querySelectorAll("#schedule-card .block").forEach((row) => {
      const id = row.dataset.id;
      const block = state.schedule.find((b) => b.id === id);
      if (!block) return;

      row.querySelector(".block-done").addEventListener("change", (e) => {
        block.done = e.target.checked;
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

  // ---------- MENTORS ----------

  function mentorDef(id) {
    return MENTOR_DEFS.find((m) => m.id === id);
  }

  function renderMentors() {
    let chipsHtml = `<div class="mentor-list">`;
    MENTOR_DEFS.forEach((m) => {
      chipsHtml += `<button class="mentor-chip ${m.id === activeMentorId ? "active" : ""}" data-id="${m.id}">${escapeHtml(m.name)}</button>`;
    });
    chipsHtml += `</div>`;

    const def = mentorDef(activeMentorId);
    const mstate = state.mentors[activeMentorId];

    let missionsHtml = "";
    if (mstate.missions.length === 0) {
      missionsHtml = `<div class="mission-empty">No missions right now.</div>`;
    } else {
      mstate.missions.forEach((ms) => {
        missionsHtml += `
        <div class="mission-item ${ms.done ? "done" : ""}" data-id="${ms.id}">
          <input type="checkbox" class="mission-check" ${ms.done ? "checked" : ""} />
          <span>${escapeHtml(ms.text)}</span>
        </div>`;
      });
    }

    let chatHtml = "";
    mstate.chat.forEach((msg) => {
      chatHtml += `<div class="msg ${msg.role}">${escapeHtml(msg.content)}${msg.offline ? '<span class="offline-tag">offline reply</span>' : ""}</div>`;
    });

    tabContent.innerHTML = `
      ${chipsHtml}
      <div class="card mentor-header">
        <div class="mname">${escapeHtml(def.name)}</div>
        <div class="mcat">${escapeHtml(def.category)}</div>
        <div class="mdesc">${escapeHtml(def.desc)}</div>
      </div>
      <h2 class="section-title">Missions</h2>
      <div class="card" id="mission-card">${missionsHtml}</div>
      <h2 class="section-title">Chat</h2>
      <div class="card">
        <div class="chat-log" id="chat-log">${chatHtml}</div>
        <div class="chat-input-row">
          <input type="text" id="chat-input" placeholder="Message ${escapeHtml(def.name)}…" />
          <button class="btn" id="chat-send">Send</button>
        </div>
        <div class="status-pill ${backendOnline ? "online" : "offline"}" id="status-pill">${backendOnline ? "backend online" : "backend unreachable — offline mode"}</div>
      </div>
    `;

    const chatLog = document.getElementById("chat-log");
    chatLog.scrollTop = chatLog.scrollHeight;

    document.querySelectorAll(".mentor-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        activeMentorId = chip.dataset.id;
        renderMentors();
      });
    });

    document.querySelectorAll("#mission-card .mission-check").forEach((cb) => {
      cb.addEventListener("change", (e) => {
        const id = e.target.closest(".mission-item").dataset.id;
        const ms = mstate.missions.find((x) => x.id === id);
        if (ms) ms.done = e.target.checked;
        saveState();
        renderMentors();
      });
    });

    const input = document.getElementById("chat-input");
    const send = document.getElementById("chat-send");
    const doSend = () => sendMentorMessage(activeMentorId, input.value.trim());
    send.addEventListener("click", doSend);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") doSend();
    });
  }

  function applyMissionTokens(mentorId, rawText) {
    const mstate = state.mentors[mentorId];
    let text = rawText;

    text = text.replace(/\[\[CLEAR_MISSIONS\]\]/gi, () => {
      mstate.missions = [];
      return "";
    });

    text = text.replace(/\[\[ADD_MISSION:\s*([^\]]+?)\s*\]\]/gi, (_, missionText) => {
      mstate.missions.push({ id: uid(), text: missionText.trim(), done: false });
      return "";
    });

    text = text.replace(/\[\[REMOVE_MISSION:\s*([^\]]+?)\s*\]\]/gi, (_, missionText) => {
      const needle = missionText.trim().toLowerCase();
      const idx = mstate.missions.findIndex((m) => m.text.toLowerCase().includes(needle));
      if (idx !== -1) mstate.missions.splice(idx, 1);
      return "";
    });

    return text.replace(/\s{2,}/g, " ").trim();
  }

  async function sendMentorMessage(mentorId, text) {
    if (!text) return;
    const def = mentorDef(mentorId);
    const mstate = state.mentors[mentorId];

    mstate.chat.push({ role: "user", content: text });
    saveState();
    renderMentors();

    const apiMessages = mstate.chat.map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          system: `${def.persona}\n\n${MENTOR_TOKEN_INSTRUCTIONS}`,
          messages: apiMessages,
          model: state.rules.model,
        }),
      });

      if (!res.ok) throw new Error("backend error");
      const data = await res.json();
      backendOnline = true;

      const cleaned = applyMissionTokens(mentorId, data.text || "");
      mstate.chat.push({ role: "assistant", content: cleaned || "…" });
    } catch (err) {
      backendOnline = false;
      const lines = def.offline;
      const line = lines[Math.floor(Math.random() * lines.length)];
      mstate.chat.push({ role: "assistant", content: line, offline: true });
    }

    saveState();
    renderMentors();
  }

  // ---------- RULES ----------

  function renderRules() {
    tabContent.innerHTML = `
      <h2 class="section-title">Rules</h2>
      <div class="card">
        <div class="field-group">
          <label>Points per new block</label>
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
    `;

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
        select.innerHTML = `<option value="${state.rules.model}">${state.rules.model} (backend unreachable)</option>`;
      });
  }

  // ---------- init ----------

  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", () => setTab(btn.dataset.tab));
  });

  setInterval(updateBanner, 15000);
  render();
})();
