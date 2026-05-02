const topicHome = document.getElementById("topicHome");
const practicePage = document.getElementById("practicePage");
const backBtn = document.getElementById("backBtn");
const topicTitle = document.getElementById("topicTitle");
const topicHint = document.getElementById("topicHint");
const slideProblem = document.getElementById("slideProblem");
const exampleBtn = document.getElementById("exampleBtn");
const similarBtn = document.getElementById("similarBtn");
const resetBtn = document.getElementById("resetBtn");
const lightbox = document.getElementById("lightbox");
const lightboxContent = document.getElementById("lightboxContent");
const lightboxClose = document.getElementById("lightboxClose");

let activeTopic = null;
let activeProblem = null;

const topicNames = {
  btree: "B 2-3-4 Trees",
  avl: "AVL Trees",
  redblack: "Red-Black Trees",
  heaps: "Heaps",
  unionfind: "Union-Find",
  traversal: "BFS / DFS",
  prim: "Prim's Algorithm",
  kruskal: "Kruskal's Algorithm",
  hashing: "Hashing",
  bigo: "Big-O",
  choice: "Algorithm Choice"
};

const topicGenerators = {
  btree: { example: btreeExample, similar: btreeSimilar },
  avl: { example: avlExample, similar: avlSimilar },
  redblack: { example: redBlackExample, similar: redBlackSimilar },
  heaps: { example: heapExample, similar: heapSimilar },
  unionfind: { example: unionFindExample, similar: unionFindSimilar },
  traversal: { example: traversalExample, similar: traversalSimilar },
  prim: { example: primExample, similar: primSimilar },
  kruskal: { example: kruskalExample, similar: kruskalSimilar },
  hashing: { example: hashingExample, similar: hashingSimilar },
  bigo: { example: bigOExample, similar: bigOSimilar },
  choice: { example: choiceExample, similar: choiceSimilar }
};

document.querySelectorAll(".topic-card").forEach((card) => {
  card.addEventListener("click", () => openTopic(card.dataset.topic));
});

backBtn.addEventListener("click", showHome);
exampleBtn.addEventListener("click", () => loadProblem("example"));
similarBtn.addEventListener("click", () => loadProblem("similar"));
resetBtn.addEventListener("click", resetCurrentProblem);
lightboxClose.addEventListener("click", closeLightbox);
lightbox.addEventListener("click", (event) => {
  if (event.target === lightbox) closeLightbox();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeLightbox();
});

function openTopic(topic) {
  activeTopic = topic;
  topicTitle.textContent = topicNames[topic];
  topicHint.textContent = "Try the slide example or generate a similar problem.";
  topicHome.hidden = true;
  practicePage.hidden = false;
  backBtn.hidden = false;
  loadProblem("example");
}

function showHome() {
  activeTopic = null;
  activeProblem = null;
  practicePage.hidden = true;
  topicHome.hidden = false;
  backBtn.hidden = true;
}

function resetCurrentProblem() {
  const inputs = slideProblem.querySelectorAll?.(".cell-input, .cell-select");
  if (inputs && inputs.length) {
    inputs.forEach((input) => {
      input.value = "";
      input.classList.remove("correct-cell", "wrong-cell", "empty-cell");
    });
    if (activeProblem?.nodePick) clearPqrSelection();
    document.getElementById("feedback")?.classList.remove("open", "correct", "incorrect");
    document.getElementById("answerPanel")?.classList.remove("open");
    document.getElementById("solutionPanel")?.classList.remove("open");
    document.getElementById("answerBtn")?.classList.remove("is-open");
    document.getElementById("solutionBtn")?.classList.remove("is-open");
    return;
  }
  renderProblem(activeProblem);
}

function loadProblem(mode) {
  activeProblem = topicGenerators[activeTopic][mode]();
  renderProblem(activeProblem);
}

function renderProblem(problem) {
  if (problem.customHtml) {
    slideProblem.innerHTML = problem.customHtml;
    wireProblemButtons(problem);
    attachVisualInteractions(problem);
    return;
  }

  const answerArea = problem.inlineInputHtml
    ? `<p class="small-note">Fill in the blank cells in the slide table.</p>`
    : problem.type === "choice"
    ? `<div class="mc-list">${problem.choices.map((choice) => `
        <label><input type="radio" name="studentAnswer" value="${escapeHtml(choice)}"> ${escapeHtml(choice)}</label>
      `).join("")}</div>`
    : `<textarea id="studentAnswer" class="student-answer" placeholder="${escapeHtml(problem.placeholder || "Type your answer here")}"></textarea>`;

  slideProblem.innerHTML = `
    <h3>${problem.title}</h3>
    <div class="slide-grid">
      <div>
        <div class="slide-section">
          <p class="prompt">${problem.prompt}</p>
          ${problem.note ? `<p class="small-note">${problem.note}</p>` : ""}
        </div>
        ${problem.visual}
        ${problem.inlineInputHtml || ""}
        ${problem.blank ? `<div class="blank-area">${problem.blank}</div>` : ""}
      </div>
      <aside>
        <strong>Student Answer</strong>
        ${answerArea}
        <div class="slide-actions">
          <button id="checkBtn" type="button">Check Answer</button>
          <button id="answerBtn" class="secondary" type="button">Show Solution</button>
          <button id="solutionBtn" class="secondary" type="button">Show Steps</button>
        </div>
        <div id="feedback" class="feedback"></div>
        <div id="answerPanel" class="answer-panel"><strong>Answer:</strong><br>${problem.answerHtml}</div>
        <div id="solutionPanel" class="solution-panel">${problem.solutionHtml}</div>
      </aside>
    </div>
    ${problem.footer || ""}
  `;

  document.getElementById("checkBtn").addEventListener("click", () => checkProblem(problem));
  if (problem.instantChoice) {
    document.querySelectorAll("input[name='studentAnswer']").forEach((input) => {
      input.addEventListener("change", () => checkProblem(problem));
    });
  }
  document.getElementById("answerBtn").addEventListener("click", () => {
    if (problem.checkCells) fillCorrectCells();
    const isOpen = document.getElementById("answerPanel").classList.toggle("open");
    document.getElementById("answerBtn").classList.toggle("is-open", isOpen);
  });
  document.getElementById("solutionBtn").addEventListener("click", () => {
    const isOpen = document.getElementById("solutionPanel").classList.toggle("open");
    document.getElementById("solutionBtn").classList.toggle("is-open", isOpen);
  });
  attachVisualInteractions(problem);
}

function wireProblemButtons(problem) {
  document.getElementById("checkBtn")?.addEventListener("click", () => checkProblem(problem));
  document.getElementById("answerBtn")?.addEventListener("click", () => {
    if (problem.checkCells) fillCorrectCells();
    const isOpen = document.getElementById("answerPanel").classList.toggle("open");
    document.getElementById("answerBtn").classList.toggle("is-open", isOpen);
  });
  document.getElementById("solutionBtn")?.addEventListener("click", () => {
    const isOpen = document.getElementById("solutionPanel").classList.toggle("open");
    document.getElementById("solutionBtn").classList.toggle("is-open", isOpen);
  });
  attachVisualInteractions(problem);
}

function checkProblem(problem) {
  if (problem.checkCells) {
    const result = compareTableAnswers();
    updatePqrFeedback();
    const feedback = document.getElementById("feedback");
    feedback.className = `feedback open ${result.correct === result.total ? "correct" : "incorrect"}`;
    feedback.textContent = `${result.correct} / ${result.total} cells correct`;
    return;
  }
  const raw = problem.type === "choice"
    ? (document.querySelector("input[name='studentAnswer']:checked")?.value || "")
    : (document.getElementById("studentAnswer")?.value || "");
  const ok = problem.check(raw);
  const feedback = document.getElementById("feedback");
  feedback.className = `feedback open ${ok ? "correct" : "incorrect"}`;
  feedback.textContent = ok ? "Correct." : "Not quite. Reveal the answer or show the steps.";
}

// ---------- small rendering and checking helpers ----------
function rand(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(items) {
  return items[rand(0, items.length - 1)];
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function uniqueNums(count, min, max) {
  const out = new Set();
  while (out.size < count) out.add(rand(min, max));
  return [...out];
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function clean(value) {
  return String(value).toLowerCase().replace(/infinity|\u221e/g, "inf").replace(/[^a-z0-9-]+/g, " ").trim();
}

function normalizeAnswer(text) {
  return clean(text).replace(/\bto\b/g, " ").replace(/\s+/g, " ").trim();
}

function compareAnswer(student, correct) {
  const s = normalizeAnswer(student).replace(/^--$/, "-");
  const c = normalizeAnswer(correct).replace(/^--$/, "-");
  if ((s === "-" || s === "--") && (c === "-" || c === "--")) return true;
  if (/^-?\d+$/.test(c) && s.split(/\s+/).includes(c)) return true;
  return s === c || seq(student) === seq(correct) || edgeSeq(student) === edgeSeq(correct);
}

function compareListAnswer(student, correct) {
  return seq(student) === seq(correct);
}

function compareEdgeAnswer(student, correct) {
  return edgeSeq(student) === edgeSeq(correct);
}

function answerInput(answer, placeholder = "", value = "") {
  const safePlaceholder = placeholder && compareAnswer(placeholder, answer) ? genericPlaceholder(answer) : placeholder;
  return `<input class="cell-input" data-answer="${escapeHtml(answer)}" placeholder="${escapeHtml(safePlaceholder)}" value="${escapeHtml(value)}">`;
}

function genericPlaceholder(answer) {
  const text = String(answer).toLowerCase();
  if (/right|left|rotation/.test(text)) return "right on P";
  if (/ll|rr|lr|rl/.test(text)) return "LL/RR/LR/RL";
  if (/out|in/.test(text)) return "in/out";
  if (/^[a-z]{2}$/i.test(String(answer))) return "uv";
  if (/^[a-z]$/i.test(String(answer))) return "x";
  if (/^\d+$/.test(String(answer))) return "node value";
  if (/^-?\d+$/.test(String(answer))) return "value";
  if (/[a-z]\s*[->-]\s*[a-z]|\d\s*[->-]\s*\d/i.test(String(answer))) return "u -> v";
  if (String(answer).includes("|")) return "node value";
  return "answer";
}

function answerSelect(answer, choices) {
  const randomized = shuffle([...new Set(choices)]);
  return `<select class="cell-select" data-answer="${escapeHtml(answer)}"><option value="">Select</option>${randomized.map((choice) => `<option value="${escapeHtml(choice)}">${escapeHtml(choice)}</option>`).join("")}</select>`;
}

function selectFromAnswers(answer, answers) {
  return answerSelect(answer, answers);
}

function answerTable(title, headers, rows) {
  return `<p class="fillable-table-title">${title}</p>${table(headers, rows)}`;
}

function compareTableAnswers() {
  const inputs = [...slideProblem.querySelectorAll(".cell-input, .cell-select")];
  let correct = 0;
  inputs.forEach((input) => {
    input.classList.remove("correct-cell", "wrong-cell", "empty-cell");
    if (!input.value.trim()) {
      input.classList.add("empty-cell");
      return;
    }
    const ok = compareAnswer(input.value, input.dataset.answer || "");
    input.classList.add(ok ? "correct-cell" : "wrong-cell");
    if (ok) correct++;
  });
  return { correct, total: inputs.length };
}

function fillCorrectCells() {
  slideProblem.querySelectorAll(".cell-input, .cell-select").forEach((input) => {
    input.value = input.dataset.answer || "";
    input.classList.remove("wrong-cell", "empty-cell");
    input.classList.add("correct-cell");
  });
  showCorrectPqr();
}

function attachVisualInteractions(problem) {
  if (!slideProblem.querySelectorAll) return;
  slideProblem.querySelectorAll(".diagram-svg, .step-card").forEach((visual) => {
    visual.addEventListener("click", (event) => {
      if (event.target.closest("input, select, button, summary")) return;
      openLightbox(visual);
    });
  });
  if (problem?.nodePick) setupNodePicking();
}

const pqrRoles = ["P", "Q", "R"];
let selectedPqr = [];

function setupNodePicking() {
  selectedPqr = [];
  updatePqrStatus();
  slideProblem.querySelector("[data-clear-pqr]")?.addEventListener("click", clearPqrSelection);
  slideProblem.querySelectorAll(".node-choice").forEach((node) => {
    node.addEventListener("click", (event) => {
      event.stopPropagation();
      if (selectedPqr.length >= 3) return;
      const role = pqrRoles[selectedPqr.length];
      selectedPqr.push({ role, value: node.dataset.node });
      node.classList.add(`selected-${role.toLowerCase()}`);
      const input = slideProblem.querySelector(`[data-role-answer="${role}"]`);
      if (input) input.value = node.dataset.node;
      let mark = node.querySelector(".picked-mark");
      if (!mark) {
        const label = node.querySelector("text:not(.marker)");
        mark = document.createElementNS("http://www.w3.org/2000/svg", "text");
        mark.setAttribute("class", "marker picked-mark");
        mark.setAttribute("x", label?.getAttribute("x") || "0");
        mark.setAttribute("y", String(Number(label?.getAttribute("y") || 0) - 34));
        node.appendChild(mark);
      }
      mark.textContent = role;
      updatePqrStatus();
    });
  });
}

function clearPqrSelection() {
  selectedPqr = [];
  slideProblem.querySelectorAll(".node-choice").forEach((node) => {
    node.classList.remove("selected-p", "selected-q", "selected-r", "pqr-correct", "pqr-wrong");
    node.querySelector(".picked-mark")?.remove();
  });
  slideProblem.querySelectorAll("[data-role-answer]").forEach((input) => {
    input.value = "";
    input.classList.remove("correct-cell", "wrong-cell", "empty-cell");
  });
  updatePqrStatus();
}

function updatePqrFeedback() {
  selectedPqr.forEach(({ role, value }) => {
    const node = [...slideProblem.querySelectorAll(".node-choice")].find((n) => n.dataset.node === value);
    const expected = slideProblem.querySelector(`[data-role-answer="${role}"]`)?.dataset.answer;
    if (!node || !expected) return;
    node.classList.remove("pqr-correct", "pqr-wrong");
    node.classList.add(compareAnswer(value, expected) ? "pqr-correct" : "pqr-wrong");
  });
}

function showCorrectPqr() {
  ["P", "Q", "R"].forEach((role) => {
    const expected = slideProblem.querySelector(`[data-role-answer="${role}"]`)?.dataset.answer;
    const node = [...slideProblem.querySelectorAll(".node-choice")].find((n) => compareAnswer(n.dataset.node, expected));
    if (!node) return;
    node.classList.add(`selected-${role.toLowerCase()}`, "pqr-correct");
    let mark = node.querySelector(`.picked-mark-${role}`);
    if (!mark) {
      const label = node.querySelector("text:not(.marker)");
      mark = document.createElementNS("http://www.w3.org/2000/svg", "text");
      mark.setAttribute("class", `marker picked-mark picked-mark-${role}`);
      mark.setAttribute("x", label?.getAttribute("x") || "0");
      mark.setAttribute("y", String(Number(label?.getAttribute("y") || 0) - 34));
      node.appendChild(mark);
    }
    mark.textContent = role;
  });
  selectedPqr = ["P", "Q", "R"].map((role) => ({ role, value: slideProblem.querySelector(`[data-role-answer="${role}"]`)?.dataset.answer || "" }));
  updatePqrStatus();
}

function updatePqrStatus() {
  const status = slideProblem.querySelector("[data-pqr-status]");
  if (!status) return;
  const selected = Object.fromEntries(selectedPqr.map((item) => [item.role, item.value]));
  status.textContent = `Selected: P = ${selected.P || "__"}, Q = ${selected.Q || "__"}, R = ${selected.R || "__"}`;
}

function openLightbox(element) {
  lightboxContent.innerHTML = "";
  const clone = element.cloneNode(true);
  clone.classList.remove("clickable-visual");
  lightboxContent.appendChild(clone);
  lightbox.hidden = false;
}

function closeLightbox() {
  lightbox.hidden = true;
  lightboxContent.innerHTML = "";
}

function seq(value) {
  return String(value).toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim();
}

function edgeSeq(value) {
  const text = String(value).toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim();
  const parts = text.split(/\s+/).filter(Boolean);
  if (parts.every((p) => p.length === 2)) return parts.join(" ");
  const compact = parts.join("");
  const pairs = [];
  for (let i = 0; i < compact.length; i += 2) pairs.push(compact.slice(i, i + 2));
  return pairs.join(" ");
}

function checkText(expected) {
  return (answer) => clean(answer) === clean(expected);
}

function checkContains(parts) {
  return (answer) => parts.every((part) => clean(answer).includes(clean(part)));
}

function checkSeq(expected) {
  return (answer) => seq(answer) === seq(expected);
}

function checkEdgeSeq(expected) {
  return (answer) => edgeSeq(answer) === edgeSeq(expected);
}

function table(headers, rows, left = false) {
  return `<div class="table-scroll"><table class="slide-table ${left ? "left-table" : ""}">
    <thead><tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr></thead>
    <tbody>${rows.map((r) => `<tr>${r.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody>
  </table></div>`;
}

function twoRowTable(label1, row1, label2, row2) {
  return table(["", ...row1], [[label2, ...row2]], false).replace("<th></th>", `<th>${label1}</th>`);
}

function tree(levels, className = "") {
  return `<div class="tree ${className}">${levels.map((level, i) => `
    <div class="tree-level">${level.map((n) => `<span class="node-box">${n}</span>`).join("")}</div>
    ${i < levels.length - 1 ? '<div class="connector"></div>' : ""}
  `).join("")}</div>`;
}

function steps(items) {
  return `<ol class="steps">${items.map((item) => `<li>${item}</li>`).join("")}</ol>`;
}

function algorithmSteps(title, items) {
  return `<p class="fillable-table-title">${title}</p>${steps(items)}`;
}

function stepDetail(title, content) {
  return `<details class="step-detail"><summary>${title}</summary>${content}</details>`;
}

function svgTree(nodes, edges, width = 620, height = 310) {
  const edgeLines = edges.map(([a, b]) => {
    const from = nodes.find((n) => n.id === a);
    const to = nodes.find((n) => n.id === b);
    return `<line class="tree-edge" x1="${from.x}" y1="${from.y + 18}" x2="${to.x}" y2="${to.y - 18}"></line>`;
  }).join("");
  const nodeShapes = nodes.map((n) => {
    const w = n.w || Math.max(54, String(n.label).length * 12 + 24);
    const h = n.h || 36;
    const open = n.pick ? `<g class="node-choice" data-node="${escapeHtml(n.label)}">` : "";
    const close = n.pick ? "</g>" : "";
    if (n.kind === "circle") {
      const colorClass = n.color === "red" ? "rb-red" : n.color === "black" ? "rb-black" : "graph-node";
      const textClass = n.color === "red" ? "rb-red-text" : n.color === "black" ? "rb-black-text" : "";
      return `${open}<circle class="${colorClass}" cx="${n.x}" cy="${n.y}" r="${n.r || 22}"></circle><text class="${textClass}" x="${n.x}" y="${n.y}">${n.label}</text>${n.mark ? `<text class="marker node-mark" x="${n.x}" y="${n.y - 34}">${n.mark}</text>` : ""}${n.bf ? `<text class="marker" x="${n.x + 44}" y="${n.y - 16}">BF ${n.bf}</text>` : ""}${close}`;
    }
    return `${open}<rect class="node-rect graph-node" x="${n.x - w / 2}" y="${n.y - h / 2}" width="${w}" height="${h}"></rect><text x="${n.x}" y="${n.y}">${n.label}</text>${n.mark ? `<text class="marker node-mark" x="${n.x}" y="${n.y - 34}">${n.mark}</text>` : ""}${n.bf ? `<text class="marker" x="${n.x + 52}" y="${n.y - 16}">BF ${n.bf}</text>` : ""}${close}`;
  }).join("");
  return `<svg class="diagram-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="tree diagram">${edgeLines}${nodeShapes}</svg>`;
}

function btreeSlideSvg(after = false) {
  if (!after) {
    return btreeCaseSvg([
      { id: "20", label: "20", x: 300, y: 55 },
      { id: "5", label: "5", x: 165, y: 155 },
      { id: "304050", label: "30 | 40 | 50", x: 420, y: 155, w: 150 },
      { id: "35", label: "35", x: 365, y: 255 },
      { id: "45", label: "45", x: 510, y: 255 }
    ], [["20", "5"], ["20", "304050"], ["304050", "35"], ["304050", "45"]], 620, 315);
  }
  return btreeCaseSvg([
    { id: "2040", label: "20 | 40", x: 300, y: 55, w: 105 },
    { id: "5", label: "5", x: 165, y: 155 },
    { id: "3050", label: "30 | 50", x: 455, y: 155, w: 105 },
    { id: "35", label: "35", x: 405, y: 255 },
    { id: "4547", label: "45 | 47", x: 545, y: 255, w: 105 }
  ], [["2040", "5"], ["2040", "3050"], ["3050", "35"], ["3050", "4547"]], 620, 315);
}

function btreeFromLevelsSvg(root, leaves) {
  const nodes = [];
  const edges = [];
  nodes.push({ id: "root", label: root.join(" | "), x: 310, y: 55, w: Math.max(64, root.join(" | ").length * 12 + 24) });
  leaves.forEach((leaf, i) => {
    const id = `l${i}`;
    nodes.push({ id, label: leaf.join(" | "), x: 120 + i * (380 / Math.max(1, leaves.length - 1)), y: 175, w: Math.max(60, leaf.join(" | ").length * 12 + 24) });
    edges.push(["root", id]);
  });
  return btreeCaseSvg(nodes, edges, 235);
}

function avlExampleSvg(stage = "start") {
  if (stage === "start") {
    return svgTree([
      { id: "4", label: "4", x: 310, y: 35 },
      { id: "2", label: "2", x: 210, y: 105 },
      { id: "6", label: "6", x: 410, y: 105 },
      { id: "1", label: "1", x: 160, y: 175 },
      { id: "5", label: "5", x: 350, y: 175 },
      { id: "15", label: "15", x: 470, y: 175 },
      { id: "7", label: "7", x: 430, y: 245 },
      { id: "16", label: "16", x: 520, y: 245 }
    ], [["4", "2"], ["4", "6"], ["2", "1"], ["6", "5"], ["6", "15"], ["15", "7"], ["15", "16"]], 620, 290);
  }
  if (stage === "insertPractice") {
    return svgTree([
      { id: "4", label: "4", x: 310, y: 35, pick: true },
      { id: "2", label: "2", x: 210, y: 105, pick: true },
      { id: "6", label: "6", x: 410, y: 105, pick: true },
      { id: "1", label: "1", x: 160, y: 175, pick: true },
      { id: "5", label: "5", x: 350, y: 175, pick: true },
      { id: "15", label: "15", x: 470, y: 175, pick: true },
      { id: "7", label: "7", x: 430, y: 245, pick: true },
      { id: "16", label: "16", x: 520, y: 245, pick: true },
      { id: "14", label: "14", x: 465, y: 285, pick: true }
    ], [["4", "2"], ["4", "6"], ["2", "1"], ["6", "5"], ["6", "15"], ["15", "7"], ["15", "16"], ["7", "14"]], 620, 325);
  }
  if (stage === "insert") {
    return svgTree([
      { id: "4", label: "4", x: 310, y: 35, bf: "-1", pick: true },
      { id: "2", label: "2", x: 210, y: 105, bf: "1", pick: true },
      { id: "6", label: "6", x: 410, y: 105, mark: "P", bf: "-2", pick: true },
      { id: "1", label: "1", x: 160, y: 175, bf: "0", pick: true },
      { id: "5", label: "5", x: 350, y: 175, bf: "0", pick: true },
      { id: "15", label: "15", x: 470, y: 175, mark: "Q", bf: "1", pick: true },
      { id: "7", label: "7", x: 430, y: 245, mark: "R", bf: "-1", pick: true },
      { id: "16", label: "16", x: 520, y: 245, bf: "0", pick: true },
      { id: "14", label: "14", x: 465, y: 285, bf: "0", pick: true }
    ], [["4", "2"], ["4", "6"], ["2", "1"], ["6", "5"], ["6", "15"], ["15", "7"], ["15", "16"], ["7", "14"]], 620, 325);
  }
  if (stage === "right") {
    return svgTree([
      { id: "4", label: "4", x: 310, y: 35 },
      { id: "2", label: "2", x: 210, y: 105 },
      { id: "6", label: "6", x: 410, y: 105, mark: "P" },
      { id: "1", label: "1", x: 160, y: 175 },
      { id: "5", label: "5", x: 350, y: 175 },
      { id: "7", label: "7", x: 470, y: 175, mark: "R" },
      { id: "15", label: "15", x: 520, y: 245, mark: "Q" },
      { id: "14", label: "14", x: 475, y: 315 },
      { id: "16", label: "16", x: 565, y: 315 }
    ], [["4", "2"], ["4", "6"], ["2", "1"], ["6", "5"], ["6", "7"], ["7", "15"], ["15", "14"], ["15", "16"]], 620, 350);
  }
  return svgTree([
    { id: "4", label: "4", x: 310, y: 35 },
    { id: "2", label: "2", x: 190, y: 110 },
    { id: "7", label: "7", x: 440, y: 110 },
    { id: "1", label: "1", x: 145, y: 185 },
    { id: "6", label: "6", x: 370, y: 185 },
    { id: "15", label: "15", x: 515, y: 185 },
    { id: "5", label: "5", x: 330, y: 260 },
    { id: "14", label: "14", x: 475, y: 260 },
    { id: "16", label: "16", x: 555, y: 260 }
  ], [["4", "2"], ["4", "7"], ["2", "1"], ["7", "6"], ["7", "15"], ["6", "5"], ["15", "14"], ["15", "16"]], 620, 310);
}

function graphSvg(nodes, edges, width = 620, height = 360) {
  const edgeLines = edges.map((e) => {
    const a = nodes[e.u];
    const b = nodes[e.v];
    const mx = (a.x + b.x) / 2;
    const my = (a.y + b.y) / 2;
    return `<line class="edge" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"></line>${e.w !== undefined ? `<text class="weight" x="${mx}" y="${my - 8}">${e.w}</text>` : ""}`;
  }).join("");
  const nodeCircles = Object.entries(nodes).map(([label, n]) => `<circle class="graph-node" cx="${n.x}" cy="${n.y}" r="21"></circle><text x="${n.x}" y="${n.y}">${label}</text>`).join("");
  return `<svg class="diagram-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="graph diagram">${edgeLines}${nodeCircles}</svg>`;
}

function slideTraversalGraph() {
  const nodes = {
    A: { x: 310, y: 45 }, B: { x: 120, y: 120 }, F: { x: 310, y: 120 }, I: { x: 500, y: 120 },
    C: { x: 165, y: 215 }, E: { x: 270, y: 215 }, G: { x: 395, y: 215 },
    D: { x: 230, y: 310 }, H: { x: 470, y: 310 }
  };
  const edges = [
    ["A", "B"], ["A", "F"], ["A", "I"], ["B", "C"], ["B", "E"], ["F", "G"],
    ["I", "G"], ["C", "D"], ["E", "D"], ["G", "H"], ["D", "H"]
  ].map(([u, v]) => ({ u, v }));
  return graphSvg(nodes, edges, 620, 350);
}

function mstExampleGraph() {
  const nodes = {
    A: { x: 90, y: 90 }, F: { x: 230, y: 55 }, G: { x: 350, y: 120 },
    E: { x: 460, y: 210 }, D: { x: 315, y: 285 }, B: { x: 145, y: 255 }, C: { x: 545, y: 90 }
  };
  const edges = [
    { u: "A", v: "F", w: 1 }, { u: "F", v: "G", w: 2 }, { u: "E", v: "G", w: 3 },
    { u: "D", v: "E", w: 4 }, { u: "B", v: "D", w: 5 }, { u: "C", v: "E", w: 6 },
    { u: "A", v: "B", w: 9 }, { u: "B", v: "F", w: 8 }, { u: "C", v: "G", w: 7 }
  ];
  return graphSvg(nodes, edges, 620, 340);
}

function weightedGraphSvg(graph) {
  const coords = {};
  const radius = 135;
  graph.nodes.forEach((n, i) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i) / graph.nodes.length;
    coords[n] = { x: 310 + Math.cos(angle) * radius, y: 180 + Math.sin(angle) * radius };
  });
  return graphSvg(coords, graph.edges, 620, 360);
}

function heapSvg(values) {
  const nodes = [];
  const edges = [];
  const levelY = [35, 105, 185, 270];
  values.forEach((value, i) => {
    const level = Math.floor(Math.log2(i + 1));
    const first = 2 ** level - 1;
    const count = 2 ** level;
    const position = i - first;
    const gap = 520 / count;
    nodes.push({ id: String(i), label: String(value), x: 50 + gap / 2 + position * gap, y: levelY[level] || 330 });
    if (i > 0) edges.push([String(Math.floor((i - 1) / 2)), String(i)]);
  });
  return svgTree(nodes, edges, 620, 330);
}

// ---------- B 2-3-4 ----------
function btreeExample() {
  const answer = "[20 | 40] / [5] [30 | 50] / [35] [45 | 47]";
  return {
    title: "B 2-3-4 Tree Insertion",
    prompt: "Insert 47",
    visual: btreeSlideSvg(false),
    inlineInputHtml: answerTable("Tree Nodes After Insertion", ["Position", "Keys"], [["root", answerInput("20 40", "node value")], ["left child", answerInput("5", "node value")], ["right child", answerInput("30 50", "node value")], ["left leaf", answerInput("35", "node value")], ["right leaf", answerInput("45 47", "node value")]]),
    placeholder: "[35] / [5] [30 | 50] / [20 | 40] [45 | 47]",
    answerHtml: `${btreeSlideSvg(true)}<code>${answer}</code>`,
    solutionHtml: `${btreeSlideSvg(false)}${btreeSlideSvg(true)}${algorithmSteps("B 2-3-4 Insertion Steps", [
      "Search for where 47 belongs.",
      "The node 30 | 40 | 50 is full, so split it.",
      "Push 40 up and keep 30 and 50 as separate child nodes.",
      "Continue to the right side because 47 is greater than 40 but less than 50.",
      "Insert 47 with 45."
    ])}`,
    check: checkText(answer),
    checkCells: true
  };
}

function btreeSimilar() {
  const c = pick(btreeGeneratedCases());
  return {
    title: "B 2-3-4 Tree Insertion",
    prompt: `Insert ${c.insert}`,
    visual: btreeCaseSvg(c.startNodes, c.startEdges, c.height),
    inlineInputHtml: answerTable("Tree Nodes After Insertion", ["Position", "Keys"], c.rows.map(([position, value]) => [position, answerInput(value, "node value")])),
    placeholder: "node value",
    answerHtml: `${btreeCaseSvg(c.finalNodes, c.finalEdges, c.height)}<code>${c.answer}</code>`,
    solutionHtml: `${btreeCaseSvg(c.startNodes, c.startEdges, c.height)}${btreeCaseSvg(c.finalNodes, c.finalEdges, c.height)}${algorithmSteps("B 2-3-4 Insertion Steps", c.steps)}`,
    check: checkText(c.answer),
    checkCells: true
  };
}

function btreeGeneratedCases() {
  return [
    {
      insert: 105,
      height: 360,
      startNodes: [
        btreeNode("root", "40", 310, 45),
        btreeNode("left", "20", 185, 135),
        btreeNode("right", "60 | 80", 440, 135),
        btreeNode("l1", "10", 110, 245),
        btreeNode("l2", "30", 250, 245),
        btreeNode("r1", "50", 350, 245),
        btreeNode("r2", "70", 440, 245),
        btreeNode("r3", "90 | 100 | 110", 555, 245)
      ],
      startEdges: [["root", "left"], ["root", "right"], ["left", "l1"], ["left", "l2"], ["right", "r1"], ["right", "r2"], ["right", "r3"]],
      finalNodes: [
        btreeNode("root", "40", 310, 45),
        btreeNode("left", "20", 170, 135),
        btreeNode("right", "60 | 80 | 100", 445, 135),
        btreeNode("l1", "10", 95, 245),
        btreeNode("l2", "30", 235, 245),
        btreeNode("r1", "50", 320, 245),
        btreeNode("r2", "70", 410, 245),
        btreeNode("r3", "90", 500, 245),
        btreeNode("r4", "105 | 110", 590, 245)
      ],
      finalEdges: [["root", "left"], ["root", "right"], ["left", "l1"], ["left", "l2"], ["right", "r1"], ["right", "r2"], ["right", "r3"], ["right", "r4"]],
      rows: [["root", "40"], ["left internal", "20"], ["right internal", "60 80 100"], ["left leaf 1", "10"], ["left leaf 2", "30"], ["right leaf 1", "50"], ["right leaf 2", "70"], ["right leaf 3", "90"], ["right leaf 4", "105 110"]],
      answer: "[40] / [20] [60 | 80 | 100] / [10] [30] [50] [70] [90] [105 | 110]",
      steps: ["Search from 40, then go to the 60 | 80 child.", "The leaf 90 | 100 | 110 is a full 4-node.", "Split it and promote 100 into the parent.", "Continue into the new right child because 105 is greater than 100.", "Insert 105 with 110."]
    },
    {
      insert: 12,
      height: 360,
      startNodes: [
        btreeNode("root", "50", 310, 45),
        btreeNode("left", "20 | 30", 185, 135),
        btreeNode("right", "80", 445, 135),
        btreeNode("l1", "5 | 10 | 15", 80, 245),
        btreeNode("l2", "25", 185, 245),
        btreeNode("l3", "35 | 40", 285, 245),
        btreeNode("r1", "60 | 70", 410, 245),
        btreeNode("r2", "90", 535, 245)
      ],
      startEdges: [["root", "left"], ["root", "right"], ["left", "l1"], ["left", "l2"], ["left", "l3"], ["right", "r1"], ["right", "r2"]],
      finalNodes: [
        btreeNode("root", "50", 310, 45),
        btreeNode("left", "10 | 20 | 30", 185, 135),
        btreeNode("right", "80", 445, 135),
        btreeNode("l1", "5", 55, 245),
        btreeNode("l2", "12 | 15", 145, 245),
        btreeNode("l3", "25", 235, 245),
        btreeNode("l4", "35 | 40", 325, 245),
        btreeNode("r1", "60 | 70", 445, 245),
        btreeNode("r2", "90", 555, 245)
      ],
      finalEdges: [["root", "left"], ["root", "right"], ["left", "l1"], ["left", "l2"], ["left", "l3"], ["left", "l4"], ["right", "r1"], ["right", "r2"]],
      rows: [["root", "50"], ["left internal", "10 20 30"], ["right internal", "80"], ["left leaf 1", "5"], ["left leaf 2", "12 15"], ["left leaf 3", "25"], ["left leaf 4", "35 40"], ["right leaf 1", "60 70"], ["right leaf 2", "90"]],
      answer: "[50] / [10 | 20 | 30] [80] / [5] [12 | 15] [25] [35 | 40] [60 | 70] [90]",
      steps: ["Search from 50 and move into the left child.", "Move toward the leftmost leaf.", "The leaf 5 | 10 | 15 is full, so split it.", "Promote 10 into the 20 | 30 node.", "Insert 12 into the child containing 15."]
    },
    {
      insert: 32,
      height: 360,
      startNodes: [
        btreeNode("root", "50", 310, 45),
        btreeNode("left", "20 | 30 | 40", 185, 135),
        btreeNode("right", "70", 445, 135),
        btreeNode("l1", "10", 70, 245),
        btreeNode("l2", "25", 155, 245),
        btreeNode("l3", "35", 240, 245),
        btreeNode("l4", "45", 325, 245),
        btreeNode("r1", "60", 430, 245),
        btreeNode("r2", "80", 535, 245)
      ],
      startEdges: [["root", "left"], ["root", "right"], ["left", "l1"], ["left", "l2"], ["left", "l3"], ["left", "l4"], ["right", "r1"], ["right", "r2"]],
      finalNodes: [
        btreeNode("root", "30 | 50", 310, 45),
        btreeNode("left", "20", 130, 135),
        btreeNode("middle", "40", 310, 135),
        btreeNode("right", "70", 490, 135),
        btreeNode("l1", "10", 70, 245),
        btreeNode("l2", "25", 180, 245),
        btreeNode("m1", "32 | 35", 295, 245),
        btreeNode("m2", "45", 400, 245),
        btreeNode("r1", "60", 500, 245),
        btreeNode("r2", "80", 585, 245)
      ],
      finalEdges: [["root", "left"], ["root", "middle"], ["root", "right"], ["left", "l1"], ["left", "l2"], ["middle", "m1"], ["middle", "m2"], ["right", "r1"], ["right", "r2"]],
      rows: [["root", "30 50"], ["left internal", "20"], ["middle internal", "40"], ["right internal", "70"], ["left leaf 1", "10"], ["left leaf 2", "25"], ["middle leaf 1", "32 35"], ["middle leaf 2", "45"], ["right leaf 1", "60"], ["right leaf 2", "80"]],
      answer: "[30 | 50] / [20] [40] [70] / [10] [25] [32 | 35] [45] [60] [80]",
      steps: ["Search from 50 and move left.", "The child 20 | 30 | 40 is a full 4-node, so split it before going down.", "Promote 30 into the root.", "Continue into the 40 child because 32 is between 30 and 50.", "Insert 32 into the leaf with 35."]
    },
    {
      insert: 57,
      height: 360,
      startNodes: [
        btreeNode("root", "40 | 80", 310, 45),
        btreeNode("left", "20", 120, 135),
        btreeNode("middle", "60", 310, 135),
        btreeNode("right", "100", 500, 135),
        btreeNode("l1", "10", 65, 245),
        btreeNode("l2", "30", 165, 245),
        btreeNode("m1", "50 | 55 | 58", 275, 245),
        btreeNode("m2", "70", 395, 245),
        btreeNode("r1", "90", 500, 245),
        btreeNode("r2", "110", 585, 245)
      ],
      startEdges: [["root", "left"], ["root", "middle"], ["root", "right"], ["left", "l1"], ["left", "l2"], ["middle", "m1"], ["middle", "m2"], ["right", "r1"], ["right", "r2"]],
      finalNodes: [
        btreeNode("root", "40 | 80", 310, 45),
        btreeNode("left", "20", 120, 135),
        btreeNode("middle", "55 | 60", 310, 135),
        btreeNode("right", "100", 500, 135),
        btreeNode("l1", "10", 65, 245),
        btreeNode("l2", "30", 165, 245),
        btreeNode("m1", "50", 250, 245),
        btreeNode("m2", "57 | 58", 335, 245),
        btreeNode("m3", "70", 420, 245),
        btreeNode("r1", "90", 510, 245),
        btreeNode("r2", "110", 590, 245)
      ],
      finalEdges: [["root", "left"], ["root", "middle"], ["root", "right"], ["left", "l1"], ["left", "l2"], ["middle", "m1"], ["middle", "m2"], ["middle", "m3"], ["right", "r1"], ["right", "r2"]],
      rows: [["root", "40 80"], ["left internal", "20"], ["middle internal", "55 60"], ["right internal", "100"], ["left leaf 1", "10"], ["left leaf 2", "30"], ["middle leaf 1", "50"], ["middle leaf 2", "57 58"], ["middle leaf 3", "70"], ["right leaf 1", "90"], ["right leaf 2", "110"]],
      answer: "[40 | 80] / [20] [55 | 60] [100] / [10] [30] [50] [57 | 58] [70] [90] [110]",
      steps: ["Search from 40 | 80 and move to the middle child.", "Move toward the left leaf under 60.", "The leaf 50 | 55 | 58 is full, so split it.", "Promote 55 into the parent node.", "Insert 57 into the new child with 58."]
    }
  ];
}

function btreeNode(id, label, x, y) {
  return { id, label, x, y, w: Math.max(58, String(label).length * 12 + 24) };
}

function btreeCaseSvg(nodes, edges, widthOrHeight = 330, maybeHeight = null) {
  const width = maybeHeight === null ? 660 : widthOrHeight;
  const height = maybeHeight === null ? widthOrHeight : maybeHeight;
  return btreeSlotSvg(nodes, edges, width, height);
}

function btreeSlotSvg(nodes, edges, width = 660, height = 330) {
  const childrenByParent = edges.reduce((groups, [parent, child]) => {
    if (!groups[parent]) groups[parent] = [];
    groups[parent].push(child);
    return groups;
  }, {});

  Object.keys(childrenByParent).forEach((parent) => {
    childrenByParent[parent].sort((a, b) => {
      const nodeA = nodes.find((n) => n.id === a);
      const nodeB = nodes.find((n) => n.id === b);
      return (nodeA?.x || 0) - (nodeB?.x || 0);
    });
  });

  const edgeLines = edges.map(([parentId, childId]) => {
    const parent = nodes.find((n) => n.id === parentId);
    const child = nodes.find((n) => n.id === childId);
    const siblings = childrenByParent[parentId] || [];
    const childIndex = siblings.indexOf(childId);
    const parentWidth = parent.w || Math.max(54, String(parent.label).length * 12 + 24);
    const childWidth = child.w || Math.max(54, String(child.label).length * 12 + 24);
    const slotCount = Math.max(siblings.length, String(parent.label).split("|").length + 1);
    const slotStep = parentWidth / slotCount;
    const slotX = parent.x - parentWidth / 2 + slotStep * (childIndex + 0.5);
    const childX = child.x + Math.max(-childWidth / 3, Math.min(childWidth / 3, slotX - child.x));
    return `<line class="tree-edge" x1="${slotX}" y1="${parent.y + 18}" x2="${childX}" y2="${child.y - 18}"></line>`;
  }).join("");

  const nodeShapes = nodes.map((n) => {
    const w = n.w || Math.max(54, String(n.label).length * 12 + 24);
    const h = n.h || 36;
    return `<rect class="node-rect graph-node" x="${n.x - w / 2}" y="${n.y - h / 2}" width="${w}" height="${h}"></rect><text x="${n.x}" y="${n.y}">${n.label}</text>`;
  }).join("");

  return `<svg class="diagram-svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="B 2-3-4 tree diagram">${edgeLines}${nodeShapes}</svg>`;
}

function insert234(root, leaves, value) {
  const r = [...root];
  const l = leaves.map((leaf) => [...leaf]);
  let i = 0;
  while (i < r.length && value > r[i]) i++;
  if (l[i].length === 3) {
    const [a, b, c] = l[i];
    r.splice(i, 0, b);
    l.splice(i, 1, [a], [c]);
    i = value > b ? i + 1 : i;
  }
  l[i].push(value);
  l[i].sort((a, b) => a - b);
  return { root: r, leaves: l };
}

function btreeVisual(root, leaves) {
  return btreeFromLevelsSvg(root, leaves);
}

function btreeText(root, leaves) {
  return `[${root.join(" | ")}] / ${leaves.map((leaf) => `[${leaf.join(" | ")}]`).join(" ")}`;
}

// ---------- AVL ----------
function avlExample() {
  const answer = "RL imbalance, right rotation on 15, left rotation on 6";
  const avlWork = {
    p: "6",
    q: "15",
    r: "7",
    type: "RL",
    rotation: "Right rotation on Q, then left rotation on P",
    finalRows: [
      ["root", "4"],
      ["root left child", "2"],
      ["root right child", "7"],
      ["left child left leaf", "1"],
      ["right child left child", "6"],
      ["right child right child", "15"],
      ["6 left leaf", "5"],
      ["15 left leaf", "14"],
      ["15 right leaf", "16"]
    ]
  };
  return {
    title: "AVL Tree Insertion",
    prompt: "Insert 14",
    note: "Step 0: Insert the Node",
    visual: `${avlExampleSvg("insertPractice")}
      ${table(["Step", "Work"], [
        ["Step 0", "Insert the Node"],
        ["Step 1", "Compute the balance factors at each node"],
        ["Step 2", "Identify nodes P, Q, R"],
        ["Step 3", "Identify imbalance case"],
        ["Step 4", "Fix imbalances with proper rotations"]
      ], true)}`,
    inlineInputHtml: `${avlNodePickControls(avlWork)}${avlReasonTable(avlWork)}${avlFinalTreeTable(avlWork.finalRows)}`,
    placeholder: "RL imbalance; right rotation on 15; left rotation on 6",
    answerHtml: `<div class="step-visuals">
      <div class="step-card"><p class="mini-caption">Tree Before Insertion</p>${avlExampleSvg("start")}</div>
      <div class="step-card"><p class="mini-caption">Step 0-3: Insert 14, BF labels, P/Q/R, RL Imbalance</p>${avlExampleSvg("insert")}</div>
      <div class="step-card"><p class="mini-caption">After Right Rotation on 15</p>${avlExampleSvg("right")}</div>
      <div class="step-card"><p class="mini-caption">After Left Rotation on 6</p>${avlExampleSvg("final")}</div>
    </div>`,
    solutionHtml: `<div class="step-visuals">
      ${stepDetail("Step 0: Insert the Node", avlExampleSvg("insert"))}
      ${stepDetail("Step 1: Compute the balance factors at each node", avlExampleSvg("insert"))}
      ${stepDetail("Step 2: Identify nodes P, Q, R", avlExampleSvg("insert"))}
      ${stepDetail("Step 3: Identify imbalance case - RL Imbalance", avlExampleSvg("insert"))}
      ${stepDetail("Step 4A: After Right Rotation on 15", avlExampleSvg("right"))}
      ${stepDetail("Step 4B: After Left Rotation on 6", avlExampleSvg("final"))}
    </div>${algorithmSteps("AVL Insertion Steps", [
      "Insert 14 as a normal BST: 14 goes left of 15.",
      "Compute balance factors moving upward.",
      "The first imbalanced node is 6.",
      "P = 6, Q = 15, R = 7.",
      "This is a right-left case.",
      "Rotate right on 15, then rotate left on 6."
    ])}`,
    footer: `<div class="red-note">AVL algorithm is NOT provided - know the steps.</div>`,
    checkCells: true,
    nodePick: true,
    check: checkContains(["rl", "right rotation", "15", "left rotation", "6"])
  };
}

function avlSimilar() {
  const cases = avlGeneratedCases();
  const c = pick(cases);
  const avlWork = {
    p: c.p,
    q: c.q,
    r: c.r,
    type: c.type,
    rotation: rotationForCase(c.type),
    finalRows: c.finalRows
  };
  return {
    title: "AVL Tree Insertion",
    prompt: `Insert ${c.insert}`,
    visual: `${avlGeneratedSvg(c, "practice")}${table(["Step", "Work"], [["Step 0", "Insert the Node"], ["Step 1", "Compute balance factors"], ["Step 2", "Identify P, Q, R"], ["Step 3", "Identify imbalance case"], ["Step 4", "Fix rotations"]], true)}`,
    inlineInputHtml: `${avlNodePickControls(avlWork)}${avlReasonTable(avlWork)}${avlFinalTreeTable(avlWork.finalRows)}`,
    placeholder: c.answer,
    answerHtml: `<strong>${c.answer}</strong><div class="step-visuals"><div class="step-card"><p class="mini-caption">${c.type} Imbalance: P=${c.p}, Q=${c.q}, R=${c.r}</p>${avlGeneratedSvg(c, "before")}</div><div class="step-card"><p class="mini-caption">Final Balanced Tree</p>${avlGeneratedSvg(c, "after")}</div></div>`,
    solutionHtml: `<div class="step-visuals"><div class="step-card"><p class="mini-caption">Inserted Node + BF/P/Q/R</p>${avlGeneratedSvg(c, "before")}</div><div class="step-card"><p class="mini-caption">${c.answer}</p>${avlGeneratedSvg(c, "after")}</div></div>${algorithmSteps("AVL Insertion Steps", [
      `Insert ${c.insert} as a normal BST.`,
      "Compute balance factors from the inserted node back up.",
      `Identify the ${c.type} shape using P, Q, and R.`,
      `Apply the required rotation: ${c.answer}.`
    ])}`,
    footer: `<div class="red-note">AVL algorithm is NOT provided - know the steps.</div>`,
    checkCells: true,
    nodePick: true,
    check: checkContains(c.answer.split(/,\s*/))
  };
}

function avlAnswerTable(a) {
  return answerTable("AVL Work", ["Item", "Student Answer"], [
    ["First imbalanced node P", `<input class="cell-input" data-role-answer="P" data-answer="${escapeHtml(a.p)}" placeholder="6">`],
    ["Q", `<input class="cell-input" data-role-answer="Q" data-answer="${escapeHtml(a.q)}" placeholder="15">`],
    ["R", `<input class="cell-input" data-role-answer="R" data-answer="${escapeHtml(a.r)}" placeholder="14">`],
    ["Balance factor at P", answerInput(a.bfP, "-2")],
    ["Balance factor at Q", answerInput(a.bfQ, "1")],
    ["Balance factor at R", answerInput(a.bfR, "0")],
    ["Imbalance type", answerInput(a.type, "RL")],
    ["First rotation", answerInput(a.first, "Right on 15")],
    ["Second rotation", answerInput(a.second, "Left on 6")],
    ["Final subtree root", answerInput(a.root, "15")]
  ]);
}

function avlNodePickControls(a) {
  return `<p class="fillable-table-title">Step 1: Click the nodes in order: P, then Q, then R.</p>
    <p class="small-note" data-pqr-status>Selected: P = __, Q = __, R = __</p>
    <input class="cell-input" data-role-answer="P" data-answer="${escapeHtml(a.p)}" hidden>
    <input class="cell-input" data-role-answer="Q" data-answer="${escapeHtml(a.q)}" hidden>
    <input class="cell-input" data-role-answer="R" data-answer="${escapeHtml(a.r)}" hidden>
    <div class="node-pick-row"><button type="button" data-clear-pqr>Clear P/Q/R Selection</button></div>`;
}

function avlReasonTable(a) {
  return answerTable("Step 2: Identify the Case and Rotation", ["Item", "Student Answer"], [
    ["Imbalance type", answerSelect(a.type, ["LL", "RR", "LR", "RL"])],
    ["Rotation(s)", answerSelect(a.rotation, [
      "Right rotation on P",
      "Left rotation on P",
      "Left rotation on Q, then right rotation on P",
      "Right rotation on Q, then left rotation on P"
    ])]
  ]);
}

function avlFinalTreeTable(rows) {
  return answerTable("Step 3: Fill in the Final Balanced Tree", ["Position", "Node"], rows.map(([position, value]) => [
    position,
    answerInput(value, "node value")
  ]));
}

function rotationForCase(type) {
  return {
    LL: "Right rotation on P",
    RR: "Left rotation on P",
    LR: "Left rotation on Q, then right rotation on P",
    RL: "Right rotation on Q, then left rotation on P"
  }[type];
}

function avlGeneratedCases() {
  return [
    {
      type: "LL",
      insert: 10,
      p: "30",
      q: "20",
      r: "10",
      answer: "LL imbalance, right rotation on 30",
      nodes: [
        { id: "30", label: "30", x: 330, y: 45, mark: "P", bf: "2", pick: true },
        { id: "20", label: "20", x: 230, y: 120, mark: "Q", bf: "1", pick: true },
        { id: "40", label: "40", x: 445, y: 120, pick: true },
        { id: "10", label: "10", x: 160, y: 205, mark: "R", bf: "0", pick: true },
        { id: "25", label: "25", x: 285, y: 205, pick: true },
        { id: "35", label: "35", x: 405, y: 205, pick: true },
        { id: "50", label: "50", x: 500, y: 205, pick: true }
      ],
      edges: [["30", "20"], ["30", "40"], ["20", "10"], ["20", "25"], ["40", "35"], ["40", "50"]],
      finalNodes: [
        { id: "20", label: "20", x: 330, y: 45 },
        { id: "10", label: "10", x: 220, y: 125 },
        { id: "30", label: "30", x: 440, y: 125 },
        { id: "25", label: "25", x: 365, y: 210 },
        { id: "40", label: "40", x: 505, y: 210 },
        { id: "35", label: "35", x: 470, y: 285 },
        { id: "50", label: "50", x: 550, y: 285 }
      ],
      finalEdges: [["20", "10"], ["20", "30"], ["30", "25"], ["30", "40"], ["40", "35"], ["40", "50"]],
      finalRows: [["root", "20"], ["root left child", "10"], ["root right child", "30"], ["right child left leaf", "25"], ["right child right child", "40"], ["40 left leaf", "35"], ["40 right leaf", "50"]]
    },
    {
      type: "RR",
      insert: 70,
      p: "30",
      q: "50",
      r: "70",
      answer: "RR imbalance, left rotation on 30",
      nodes: [
        { id: "30", label: "30", x: 310, y: 45, mark: "P", bf: "-2", pick: true },
        { id: "20", label: "20", x: 210, y: 120, pick: true },
        { id: "50", label: "50", x: 420, y: 120, mark: "Q", bf: "-1", pick: true },
        { id: "10", label: "10", x: 160, y: 205, pick: true },
        { id: "25", label: "25", x: 260, y: 205, pick: true },
        { id: "40", label: "40", x: 375, y: 205, pick: true },
        { id: "70", label: "70", x: 485, y: 205, mark: "R", bf: "0", pick: true }
      ],
      edges: [["30", "20"], ["30", "50"], ["20", "10"], ["20", "25"], ["50", "40"], ["50", "70"]],
      finalNodes: [
        { id: "50", label: "50", x: 330, y: 45 },
        { id: "30", label: "30", x: 220, y: 125 },
        { id: "70", label: "70", x: 440, y: 125 },
        { id: "20", label: "20", x: 155, y: 210 },
        { id: "40", label: "40", x: 290, y: 210 },
        { id: "10", label: "10", x: 115, y: 285 },
        { id: "25", label: "25", x: 200, y: 285 }
      ],
      finalEdges: [["50", "30"], ["50", "70"], ["30", "20"], ["30", "40"], ["20", "10"], ["20", "25"]],
      finalRows: [["root", "50"], ["root left child", "30"], ["root right child", "70"], ["left child left child", "20"], ["left child right leaf", "40"], ["20 left leaf", "10"], ["20 right leaf", "25"]]
    },
    {
      type: "LR",
      insert: 25,
      p: "40",
      q: "20",
      r: "30",
      answer: "LR imbalance, left rotation on 20, right rotation on 40",
      nodes: [
        { id: "40", label: "40", x: 330, y: 45, mark: "P", bf: "2", pick: true },
        { id: "20", label: "20", x: 230, y: 120, mark: "Q", bf: "-1", pick: true },
        { id: "60", label: "60", x: 445, y: 120, pick: true },
        { id: "10", label: "10", x: 170, y: 205, pick: true },
        { id: "30", label: "30", x: 285, y: 205, mark: "R", bf: "1", pick: true },
        { id: "50", label: "50", x: 405, y: 205, pick: true },
        { id: "70", label: "70", x: 500, y: 205, pick: true },
        { id: "25", label: "25", x: 250, y: 285, pick: true }
      ],
      edges: [["40", "20"], ["40", "60"], ["20", "10"], ["20", "30"], ["60", "50"], ["60", "70"], ["30", "25"]],
      finalNodes: [
        { id: "30", label: "30", x: 330, y: 45 },
        { id: "20", label: "20", x: 220, y: 125 },
        { id: "40", label: "40", x: 440, y: 125 },
        { id: "10", label: "10", x: 160, y: 210 },
        { id: "25", label: "25", x: 280, y: 210 },
        { id: "60", label: "60", x: 500, y: 210 },
        { id: "50", label: "50", x: 455, y: 285 },
        { id: "70", label: "70", x: 545, y: 285 }
      ],
      finalEdges: [["30", "20"], ["30", "40"], ["20", "10"], ["20", "25"], ["40", "60"], ["60", "50"], ["60", "70"]],
      finalRows: [["root", "30"], ["root left child", "20"], ["root right child", "40"], ["left child left leaf", "10"], ["left child right leaf", "25"], ["right child right child", "60"], ["60 left leaf", "50"], ["60 right leaf", "70"]]
    },
    {
      type: "RL",
      insert: 45,
      p: "30",
      q: "60",
      r: "40",
      answer: "RL imbalance, right rotation on 60, left rotation on 30",
      nodes: [
        { id: "30", label: "30", x: 310, y: 45, mark: "P", bf: "-2", pick: true },
        { id: "20", label: "20", x: 205, y: 120, pick: true },
        { id: "60", label: "60", x: 425, y: 120, mark: "Q", bf: "1", pick: true },
        { id: "10", label: "10", x: 155, y: 205, pick: true },
        { id: "25", label: "25", x: 255, y: 205, pick: true },
        { id: "40", label: "40", x: 375, y: 205, mark: "R", bf: "-1", pick: true },
        { id: "70", label: "70", x: 495, y: 205, pick: true },
        { id: "45", label: "45", x: 415, y: 285, pick: true }
      ],
      edges: [["30", "20"], ["30", "60"], ["20", "10"], ["20", "25"], ["60", "40"], ["60", "70"], ["40", "45"]],
      finalNodes: [
        { id: "40", label: "40", x: 330, y: 45 },
        { id: "30", label: "30", x: 220, y: 125 },
        { id: "60", label: "60", x: 440, y: 125 },
        { id: "20", label: "20", x: 155, y: 210 },
        { id: "45", label: "45", x: 380, y: 210 },
        { id: "70", label: "70", x: 500, y: 210 },
        { id: "10", label: "10", x: 115, y: 285 },
        { id: "25", label: "25", x: 200, y: 285 }
      ],
      finalEdges: [["40", "30"], ["40", "60"], ["30", "20"], ["60", "45"], ["60", "70"], ["20", "10"], ["20", "25"]],
      finalRows: [["root", "40"], ["root left child", "30"], ["root right child", "60"], ["left child left child", "20"], ["right child left leaf", "45"], ["right child right leaf", "70"], ["20 left leaf", "10"], ["20 right leaf", "25"]]
    }
  ];
}

function avlGeneratedSvg(c, stage) {
  if (stage === "after") return svgTree(c.finalNodes, c.finalEdges, 620, 330);
  const nodes = stage === "practice"
    ? c.nodes.map((node) => ({ ...node, mark: "", bf: "", pick: true }))
    : c.nodes;
  return svgTree(nodes, c.edges, 620, 330);
}

function avlCaseSvg(type, stage) {
  if (stage === "after") {
    return svgTree([
      { id: "20", label: "20", x: 310, y: 60 },
      { id: "10", label: "10", x: 220, y: 145 },
      { id: "30", label: "30", x: 400, y: 145 }
    ], [["20", "10"], ["20", "30"]], 620, 220);
  }
  const layouts = {
    LL: [
      [{ id: "30", label: "30", x: 360, y: 55, mark: "P", bf: "2", pick: true }, { id: "20", label: "20", x: 280, y: 135, mark: "Q", bf: "1", pick: true }, { id: "10", label: "10", x: 205, y: 215, mark: "R", bf: "0", pick: true }],
      [["30", "20"], ["20", "10"]]
    ],
    RR: [
      [{ id: "10", label: "10", x: 260, y: 55, mark: "P", bf: "-2", pick: true }, { id: "20", label: "20", x: 340, y: 135, mark: "Q", bf: "-1", pick: true }, { id: "30", label: "30", x: 420, y: 215, mark: "R", bf: "0", pick: true }],
      [["10", "20"], ["20", "30"]]
    ],
    LR: [
      [{ id: "30", label: "30", x: 360, y: 55, mark: "P", bf: "2", pick: true }, { id: "10", label: "10", x: 260, y: 135, mark: "Q", bf: "-1", pick: true }, { id: "20", label: "20", x: 330, y: 215, mark: "R", bf: "0", pick: true }],
      [["30", "10"], ["10", "20"]]
    ],
    RL: [
      [{ id: "10", label: "10", x: 260, y: 55, mark: "P", bf: "-2", pick: true }, { id: "30", label: "30", x: 370, y: 135, mark: "Q", bf: "1", pick: true }, { id: "20", label: "20", x: 310, y: 215, mark: "R", bf: "0", pick: true }],
      [["10", "30"], ["30", "20"]]
    ]
  };
  if (stage === "practice") {
    return svgTree(layouts[type][0].map((node) => ({
      ...node,
      mark: "",
      bf: "",
      pick: true
    })), layouts[type][1], 620, 260);
  }
  return svgTree(layouts[type][0], layouts[type][1], 620, 260);
}

// ---------- Red-Black ----------
function redBlackExample() {
  return redBlackSimilar();
}

function redBlackSimilar() {
  const rbCase = pick(redBlackCases());
  return {
    type: "choice",
    title: "Red-Black Tree Practice",
    prompt: rbCase.prompt,
    visual: `${rbCase.before}<div class="green-note">Red-Black algorithm IS provided - follow the steps carefully.</div>`,
    choices: shuffle(rbCase.choices),
    answerHtml: rbCase.answer,
    solutionHtml: `${rbCase.after}${redBlackRules()}`,
    check: checkText(rbCase.answer)
  };
}

function redBlackRules() {
  return `${algorithmSteps("Red-Black Tree Rules", [
    "Every node is either red or black.",
    "The root must be black.",
    "All null leaves are treated as black.",
    "A red node cannot have a red child.",
    "Every path from a node to its descendant null leaves must have the same number of black nodes."
  ])}${algorithmSteps("Red-Black Insertion Fix-Up Steps", [
    "Insert the new value like a normal BST node.",
    "Color the newly inserted node red.",
    "If the new node is the root, color it black and stop.",
    "If the parent is black, the tree is valid and you can stop.",
    "If the parent is red, there is a red-red violation.",
    "Look at the uncle node.",
    "If the uncle is red, recolor parent and uncle black, recolor grandparent red, then continue checking upward.",
    "If the uncle is black or null and the new node is an outside grandchild, rotate at the grandparent and recolor.",
    "If the uncle is black or null and the new node is an inside grandchild, rotate at the parent first, then rotate at the grandparent and recolor.",
    "At the end, make sure the root is black."
  ])}`;
}

function redBlackCases() {
  return [
    {
      prompt: "A red node has a red parent and the uncle is red. What happens?",
      answer: "Recolor parent and uncle black, recolor grandparent red",
      choices: ["Recolor parent and uncle black, recolor grandparent red", "Left rotation", "Right rotation", "Leave it unchanged"],
      before: redBlackCaseSvg("recolorBefore"),
      after: redBlackCaseSvg("recolorAfter")
    },
    {
      prompt: "The inserted red node is an outside left-left grandchild and the uncle is black. What fix is needed?",
      answer: "Right rotation",
      choices: ["Right rotation", "Left rotation", "Recolor only", "Delete the uncle"],
      before: redBlackCaseSvg("llBefore"),
      after: redBlackCaseSvg("llAfter")
    },
    {
      prompt: "The inserted red node is an outside right-right grandchild and the uncle is black. What fix is needed?",
      answer: "Left rotation",
      choices: ["Left rotation", "Right rotation", "Recolor only", "Make root red"],
      before: redBlackCaseSvg("rrBefore"),
      after: redBlackCaseSvg("rrAfter")
    },
    {
      prompt: "The inserted red node is an inside left-right grandchild and the uncle is black. What fix comes first?",
      answer: "Left rotation on parent",
      choices: ["Left rotation on parent", "Right rotation on parent", "Recolor uncle red", "Stop immediately"],
      before: redBlackCaseSvg("lrBefore"),
      after: redBlackCaseSvg("lrAfter")
    },
    {
      prompt: "The inserted red node is an inside right-left grandchild and the uncle is black. What fix comes first?",
      answer: "Right rotation on parent",
      choices: ["Right rotation on parent", "Left rotation on parent", "Recolor root red", "No violation"],
      before: redBlackCaseSvg("rlBefore"),
      after: redBlackCaseSvg("rlAfter")
    },
    {
      prompt: "After insertion fix-up finishes, what color must the root be?",
      answer: "Black",
      choices: ["Black", "Red", "Same as inserted node", "Same as uncle"],
      before: redBlackCaseSvg("rootBefore"),
      after: redBlackCaseSvg("rootAfter")
    }
  ];
}

function redBlackCaseSvg(kind) {
  const maps = {
    recolorBefore: [
      [{ id: "G", label: "G", x: 310, y: 65, kind: "circle", color: "black" }, { id: "P", label: "P", x: 220, y: 155, kind: "circle", color: "red" }, { id: "U", label: "U", x: 400, y: 155, kind: "circle", color: "red" }, { id: "N", label: "N", x: 160, y: 245, kind: "circle", color: "red" }],
      [["G", "P"], ["G", "U"], ["P", "N"]]
    ],
    recolorAfter: [
      [{ id: "G", label: "G", x: 310, y: 65, kind: "circle", color: "red" }, { id: "P", label: "P", x: 220, y: 155, kind: "circle", color: "black" }, { id: "U", label: "U", x: 400, y: 155, kind: "circle", color: "black" }, { id: "N", label: "N", x: 160, y: 245, kind: "circle", color: "red" }],
      [["G", "P"], ["G", "U"], ["P", "N"]]
    ],
    llBefore: [
      [{ id: "20", label: "20", x: 330, y: 65, kind: "circle", color: "black" }, { id: "10", label: "10", x: 245, y: 155, kind: "circle", color: "red" }, { id: "30", label: "30", x: 420, y: 155, kind: "circle", color: "black" }, { id: "5", label: "5", x: 175, y: 245, kind: "circle", color: "red" }],
      [["20", "10"], ["20", "30"], ["10", "5"]]
    ],
    llAfter: [
      [{ id: "10", label: "10", x: 310, y: 65, kind: "circle", color: "black" }, { id: "5", label: "5", x: 220, y: 155, kind: "circle", color: "red" }, { id: "20", label: "20", x: 400, y: 155, kind: "circle", color: "red" }, { id: "30", label: "30", x: 470, y: 245, kind: "circle", color: "black" }],
      [["10", "5"], ["10", "20"], ["20", "30"]]
    ],
    rrBefore: [
      [{ id: "20", label: "20", x: 290, y: 65, kind: "circle", color: "black" }, { id: "10", label: "10", x: 200, y: 155, kind: "circle", color: "black" }, { id: "30", label: "30", x: 380, y: 155, kind: "circle", color: "red" }, { id: "40", label: "40", x: 455, y: 245, kind: "circle", color: "red" }],
      [["20", "10"], ["20", "30"], ["30", "40"]]
    ],
    rrAfter: [
      [{ id: "30", label: "30", x: 310, y: 65, kind: "circle", color: "black" }, { id: "20", label: "20", x: 220, y: 155, kind: "circle", color: "red" }, { id: "40", label: "40", x: 400, y: 155, kind: "circle", color: "red" }, { id: "10", label: "10", x: 150, y: 245, kind: "circle", color: "black" }],
      [["30", "20"], ["30", "40"], ["20", "10"]]
    ],
    lrBefore: [
      [{ id: "30", label: "30", x: 330, y: 65, kind: "circle", color: "black" }, { id: "10", label: "10", x: 240, y: 155, kind: "circle", color: "red" }, { id: "40", label: "40", x: 425, y: 155, kind: "circle", color: "black" }, { id: "20", label: "20", x: 300, y: 245, kind: "circle", color: "red" }],
      [["30", "10"], ["30", "40"], ["10", "20"]]
    ],
    lrAfter: [
      [{ id: "30", label: "30", x: 330, y: 65, kind: "circle", color: "black" }, { id: "20", label: "20", x: 245, y: 155, kind: "circle", color: "red" }, { id: "40", label: "40", x: 425, y: 155, kind: "circle", color: "black" }, { id: "10", label: "10", x: 175, y: 245, kind: "circle", color: "red" }],
      [["30", "20"], ["30", "40"], ["20", "10"]]
    ],
    rlBefore: [
      [{ id: "10", label: "10", x: 290, y: 65, kind: "circle", color: "black" }, { id: "5", label: "5", x: 200, y: 155, kind: "circle", color: "black" }, { id: "30", label: "30", x: 380, y: 155, kind: "circle", color: "red" }, { id: "20", label: "20", x: 320, y: 245, kind: "circle", color: "red" }],
      [["10", "5"], ["10", "30"], ["30", "20"]]
    ],
    rlAfter: [
      [{ id: "10", label: "10", x: 290, y: 65, kind: "circle", color: "black" }, { id: "5", label: "5", x: 200, y: 155, kind: "circle", color: "black" }, { id: "20", label: "20", x: 380, y: 155, kind: "circle", color: "red" }, { id: "30", label: "30", x: 440, y: 245, kind: "circle", color: "red" }],
      [["10", "5"], ["10", "20"], ["20", "30"]]
    ],
    rootBefore: [
      [{ id: "25", label: "25", x: 310, y: 70, kind: "circle", color: "red" }, { id: "15", label: "15", x: 225, y: 160, kind: "circle", color: "black" }, { id: "35", label: "35", x: 395, y: 160, kind: "circle", color: "black" }],
      [["25", "15"], ["25", "35"]]
    ],
    rootAfter: [
      [{ id: "25", label: "25", x: 310, y: 70, kind: "circle", color: "black" }, { id: "15", label: "15", x: 225, y: 160, kind: "circle", color: "black" }, { id: "35", label: "35", x: 395, y: 160, kind: "circle", color: "black" }],
      [["25", "15"], ["25", "35"]]
    ]
  };
  return svgTree(maps[kind][0], maps[kind][1], 620, 310);
}

function redBlackSvg(stage = "start") {
  if (stage === "fixed") {
    return svgTree([
      { id: "G", label: "G", x: 310, y: 65, kind: "circle", color: "red" },
      { id: "P", label: "P", x: 220, y: 155, kind: "circle", color: "black" },
      { id: "U", label: "U", x: 400, y: 155, kind: "circle", color: "black" },
      { id: "N", label: "N", x: 160, y: 245, kind: "circle", color: "red" }
    ], [["G", "P"], ["G", "U"], ["P", "N"]], 620, 300);
  }
  return svgTree([
    { id: "G", label: "G", x: 310, y: 65, kind: "circle", color: "black" },
    { id: "P", label: "P", x: 220, y: 155, kind: "circle", color: "red" },
    { id: "U", label: "U", x: 400, y: 155, kind: "circle", color: "red" },
    { id: "N", label: "N", x: 160, y: 245, kind: "circle", color: "red" }
  ], [["G", "P"], ["G", "U"], ["P", "N"]], 620, 300);
}

// ---------- Heaps ----------
function heapExample() {
  const index = Array.from({ length: 16 }, (_, i) => i);
  const start = [34, 18, 5, 1, 12, 56, 37, 4, 15, 6, 8, 62, "-", "-", "-", "-"];
  const answer = [62, 18, 56, 15, 12, 34, 37, 4, 1, 6, 8, 5, "-", "-", "-", "-"];
  return {
    title: "Heapify an Array",
    prompt: "Heapify the array into a max-heap.",
    visual: table(["Index", ...index], [["Value", ...start]]),
    inlineInputHtml: heapAnswerInput(answer),
    placeholder: answer.join(" "),
    answerHtml: `${table(["Index", ...index], [["Value", ...answer]])}${heapSvg(answer.filter((v) => v !== "-"))}`,
    solutionHtml: `${table(["Index", ...index], [["Value", ...answer]])}${heapSvg(answer.filter((v) => v !== "-"))}${algorithmSteps("Heapify Steps", [
      "Treat the array as a binary tree.",
      "Start at the last parent node.",
      "Work backward toward index 0.",
      "Swap each parent with the larger child when needed.",
      "Continue until every parent is greater than or equal to its children."
    ])}`,
    check: checkText(answer.join(" ")),
    checkCells: true
  };
}

function heapSimilar() {
  const mode = pick(["heapify", "insert", "remove"]);
  if (mode === "insert") {
    const heap = makeHeap(uniqueNums(7, 10, 80));
    const value = rand(20, 90);
    const final = [...heap, value];
    bubbleUp(final, final.length - 1);
    return heapProblem("Heap Insert", `Insert ${value} into the max-heap.`, heap, final, ["Add the value at the next open spot.", "Compare with the parent.", "Swap upward until the max-heap rule is fixed."]);
  }
  if (mode === "remove") {
    const heap = makeHeap(uniqueNums(8, 10, 90));
    const final = [...heap];
    final[0] = final.pop();
    bubbleDown(final, 0);
    return heapProblem("Heap Remove", "Remove the root from the max-heap.", heap, final, ["Remove the root.", "Move the last value to the root.", "Swap down with the larger child until fixed."]);
  }
  const arr = uniqueNums(10, 1, 90);
  const final = heapify(arr);
  return heapProblem("Heapify an Array", "Heapify the array into a max-heap.", arr, final, ["Treat the array as a tree.", "Start at the last parent.", "Work backward to the root.", "Swap with the larger child when needed."]);
}

function heapProblem(title, prompt, start, answer, stepList) {
  const index = Array.from({ length: start.length }, (_, i) => i);
  return {
    title,
    prompt,
    visual: table(["Index", ...index], [["Value", ...start]]),
    inlineInputHtml: heapAnswerInput(answer),
    placeholder: answer.join(" "),
    answerHtml: `${table(["Index", ...answer.map((_, i) => i)], [["Value", ...answer]])}${heapSvg(answer)}`,
    solutionHtml: algorithmSteps(title.includes("Insert") ? "Heap Insert Steps" : title.includes("Remove") ? "Heap Remove Steps" : "Heapify Steps", stepList),
    checkCells: true,
    check: checkText(answer.join(" "))
  };
}

function heapAnswerInput(answer) {
  return answerTable("Final Heap Array", ["Index", ...answer.map((_, i) => i)], [["Value", ...answer.map((v, i) => answerInput(String(v), i < 3 ? ["62", "18", "56"][i] : "value")) ]]);
}

function heapTree(values) {
  const levels = [];
  values.forEach((value, i) => {
    const level = Math.floor(Math.log2(i + 1));
    if (!levels[level]) levels[level] = [];
    levels[level].push(value);
  });
  return tree(levels, "heap-tree");
}

function makeHeap(values) {
  const heap = [];
  values.forEach((v) => {
    heap.push(v);
    bubbleUp(heap, heap.length - 1);
  });
  return heap;
}

function bubbleUp(heap, i) {
  while (i > 0) {
    const parent = Math.floor((i - 1) / 2);
    if (heap[parent] >= heap[i]) break;
    [heap[parent], heap[i]] = [heap[i], heap[parent]];
    i = parent;
  }
}

function bubbleDown(heap, i) {
  while (true) {
    const left = i * 2 + 1;
    const right = i * 2 + 2;
    let largest = i;
    if (left < heap.length && heap[left] > heap[largest]) largest = left;
    if (right < heap.length && heap[right] > heap[largest]) largest = right;
    if (largest === i) break;
    [heap[i], heap[largest]] = [heap[largest], heap[i]];
    i = largest;
  }
}

function heapify(values) {
  const heap = [...values];
  for (let i = Math.floor(heap.length / 2) - 1; i >= 0; i--) bubbleDown(heap, i);
  return heap;
}

// ---------- Union-Find ----------
function unionFindExample() {
  return unionFindParentProblem();
}

function unionFindSimilar() {
  return unionFindParentProblem();
}

function unionFindParentProblem() {
  const elements = ["A", "B", "C", "D", "E", "F"];
  const seed = new DSU(elements);
  const unionCount = rand(2, 4);
  for (let i = 0; i < unionCount; i++) {
    const a = pick(elements);
    const b = pick(elements.filter((n) => n !== a));
    seed.union(a, b);
  }
  const parent = { ...seed.parent };
  const askType = pick(["find", "connected", "union"]);
  const x = pick(elements);
  const y = pick(elements.filter((n) => n !== x));
  const find = (n) => parent[n] === n ? n : find(parent[n]);
  let prompt = `What is find(${x})?`;
  let rows = [["find(" + x + ")", answerInput(find(x), "root")]];
  if (askType === "connected") {
    prompt = `Are ${x} and ${y} connected?`;
    rows = [[prompt, answerSelect(find(x) === find(y) ? "Yes" : "No", ["Yes", "No"])]];
  }
  if (askType === "union") {
    prompt = `After union(${x}, ${y}), what root should ${find(y)} point to?`;
    rows = [[`union(${x}, ${y}) new parent`, answerInput(find(x), "root")]];
  }
  const groups = elements.reduce((acc, e) => {
    const r = find(e);
    if (!acc[r]) acc[r] = [];
    acc[r].push(e);
    return acc;
  }, {});
  return {
    title: "Union-Find",
    prompt,
    visual: table(["Element", ...elements], [["Parent", ...elements.map((e) => parent[e])]]),
    inlineInputHtml: answerTable("Answer", ["Question", "Result"], rows),
    placeholder: "root",
    answerHtml: table(["Root", "Group"], Object.entries(groups).map(([root, group]) => [root, group.join(", ")])),
    solutionHtml: algorithmSteps("Union-Find Steps", ["Read the parent array.", "For find(x), follow parent pointers until a node points to itself.", "For connected(a, b), compare find(a) and find(b).", "For union(a, b), make one root point to the other root.", "Path compression can update nodes on the find path to point directly at the root."]),
    checkCells: true,
    check: () => true
  };
}

class DSU {
  constructor(items) {
    this.parent = Object.fromEntries(items.map((x) => [x, x]));
  }
  find(x) {
    if (this.parent[x] !== x) this.parent[x] = this.find(this.parent[x]);
    return this.parent[x];
  }
  union(a, b) {
    const ra = this.find(a);
    const rb = this.find(b);
    if (ra !== rb) this.parent[rb] = ra;
  }
  groups() {
    const out = {};
    Object.keys(this.parent).forEach((x) => {
      const r = this.find(x);
      if (!out[r]) out[r] = [];
      out[r].push(x);
    });
    return Object.values(out).map((g) => g.sort().join("")).sort();
  }
}

// ---------- BFS / DFS ----------
function traversalExample() {
  const bfs = "A B F I C E G D H";
  const dfs = "A I F G E C D H B";
  const bfsRows = [["A", "A"], ["B F I", "A B"], ["F I C E", "A B F"], ["I C E G", "A B F I"], ["C E G", "A B F I C"], ["E G D", "A B F I C E"], ["G D", "A B F I C E G"], ["D", "A B F I C E G D"], ["H", bfs]];
  const dfsRows = [["A", "A"], ["B F I", "A I"], ["B F", "A I F"], ["B G", "A I F G"], ["B D E", "A I F G E"], ["B D B C", "A I F G E C"], ["B D B D", "A I F G E C D"], ["B D B H", "A I F G E C D H"], ["B D B B", dfs], ["B D B", ""], ["B D", ""], ["B", ""]];
  return {
    title: "BFS / DFS Visited Order",
    prompt: "Fill in the BFS and DFS visited orders.",
    note: "Neighbors are processed alphabetically unless stated otherwise. Only visited order is graded.",
    visual: slideTraversalGraph(),
    inlineInputHtml: `${fillableRowsTable("BFS", ["Queue", "Visited"], bfsRows)}${fillableDfsRowsTable(dfsRows)}`,
    placeholder: "BFS: A B F I C E G D H; DFS: A I F G E C D H B",
    answerHtml: `<strong>BFS visited order:</strong> ${bfs}<br><strong>DFS visited order:</strong> ${dfs}`,
    solutionHtml: `${table(["BFS Queue", "Visited"], bfsRows)}${table(["DFS Stack", "Visited"], dfsRows)}${algorithmSteps("BFS / DFS Steps", ["For BFS, start by putting the start node in the queue.", "Remove from the front of the queue.", "Mark the removed node visited if it has not been visited.", "Add its neighbors to the queue in alphabetical order.", "For DFS, start by putting the start node on the stack.", "Pop from the top of the stack.", "Mark the popped node visited if it has not been visited.", "Push its neighbors onto the stack in alphabetical order.", "Continue until the queue or stack is empty."])}`,
    checkCells: true,
    check: (answer) => clean(answer).includes(clean(bfs)) && clean(answer).includes(clean(dfs))
  };
}

function traversalSimilar() {
  const adj = makeGraph(8);
  const start = "A";
  const bfsTrace = bfsTraceRows(adj, start);
  const dfsTrace = dfsTraceRows(adj, start);
  const bfs = bfsTrace.order.join(" ");
  const dfs = dfsTrace.order.join(" ");
  const bfsRows = bfsTrace.rows;
  const dfsRows = dfsTrace.rows;
  return {
    title: "BFS / DFS Visited Order",
    prompt: `Start at ${start}. Fill in BFS and DFS visited order.`,
    note: "Neighbors are processed alphabetically unless stated otherwise. Only visited order is graded.",
    visual: `${graphFromAdjSvg(adj)}${adjTable(adj)}`,
    inlineInputHtml: `${fillableRowsTable("BFS", ["Queue", "Visited"], bfsRows)}${fillableDfsRowsTable(dfsRows)}`,
    placeholder: `BFS: ${bfs}; DFS: ${dfs}`,
    answerHtml: `<strong>BFS:</strong> ${bfs}<br><strong>DFS:</strong> ${dfs}`,
    solutionHtml: `${table(["BFS Queue", "Visited"], bfsRows)}${table(["DFS Stack", "Visited"], dfsRows.map((row) => [row[0], row[1] || "-"]))}${algorithmSteps("BFS / DFS Steps", ["For BFS, start by putting the start node in the queue.", "Remove from the front of the queue.", "Mark the removed node visited if it has not been visited.", "Add its neighbors to the queue in alphabetical order.", "For DFS, start by putting the start node on the stack.", "Pop from the top of the stack.", "Mark the popped node visited if it has not been visited.", "Push its neighbors onto the stack in alphabetical order.", "Continue until the queue or stack is empty."])}`,
    checkCells: true,
    check: (answer) => clean(answer).includes(clean(bfs)) && clean(answer).includes(clean(dfs))
  };
}

function fillableRowsTable(title, headers, answerRows) {
  return answerTable(title, headers, answerRows.map((row) => row.map((cell, i) => {
    return answerInput(cell, "");
  })));
}

function fillableDfsRowsTable(answerRows) {
  return answerTable("DFS", ["Stack", "Visited"], answerRows.map((row) => [
    answerInput(row[0], ""),
    row[1] ? answerInput(row[1], "") : "-"
  ]));
}

function makeGraph(size) {
  const nodes = "ABCDEFGH".slice(0, size).split("");
  const adj = Object.fromEntries(nodes.map((n) => [n, new Set()]));
  for (let i = 0; i < nodes.length - 1; i++) addEdge(adj, nodes[i], nodes[i + 1]);
  for (let i = 0; i < 4; i++) addEdge(adj, pick(nodes), pick(nodes));
  return Object.fromEntries(nodes.map((n) => [n, [...adj[n]].sort()]));
}

function addEdge(adj, a, b) {
  if (a === b) return;
  adj[a].add(b);
  adj[b].add(a);
}

function adjTable(adj) {
  return table(["Vertex", "Neighbors"], Object.keys(adj).map((n) => [n, adj[n].join(", ")]), true);
}

function graphFromAdjSvg(adj) {
  const labels = Object.keys(adj).sort();
  const coords = {};
  labels.forEach((label, i) => {
    const angle = -Math.PI / 2 + (Math.PI * 2 * i) / labels.length;
    coords[label] = { x: 310 + Math.cos(angle) * 135, y: 180 + Math.sin(angle) * 135 };
  });
  const seen = new Set();
  const edges = [];
  labels.forEach((u) => adj[u].forEach((v) => {
    const key = [u, v].sort().join("");
    if (!seen.has(key)) {
      seen.add(key);
      edges.push({ u, v });
    }
  }));
  return graphSvg(coords, edges, 620, 360);
}

function bfsOrder(adj, start) {
  return bfsTraceRows(adj, start).order;
}

function dfsOrder(adj, start) {
  return dfsTraceRows(adj, start).order;
}

function bfsTraceRows(adj, start) {
  const discovered = new Set([start]);
  const queue = [start];
  const order = [];
  const rows = [];
  while (queue.length) {
    const before = queue.join(" ");
    const node = queue.shift();
    order.push(node);
    adj[node].forEach((next) => {
      if (!discovered.has(next)) {
        discovered.add(next);
        queue.push(next);
      }
    });
    rows.push([before, order.join(" ")]);
  }
  return { order, rows };
}

function dfsTraceRows(adj, start) {
  const visited = new Set();
  const total = Object.keys(adj).length;
  const stack = [start];
  const order = [];
  const rows = [];
  let fullVisitedShown = false;
  while (stack.length) {
    const before = stack.join(" ");
    const node = stack.pop();
    if (visited.has(node)) {
      rows.push([before, fullVisitedShown ? "" : order.join(" ")]);
      if (order.length === total) fullVisitedShown = true;
      continue;
    }
    visited.add(node);
    order.push(node);
    adj[node].forEach((next) => {
      stack.push(next);
    });
    rows.push([before, fullVisitedShown ? "" : order.join(" ")]);
    if (order.length === total) fullVisitedShown = true;
  }
  return { order, rows };
}

// ---------- MST ----------
function primExample() {
  const answer = "AF FG EG DE BD CE";
  const edgeChoices = ["AF", "FG", "EG", "DE", "BD", "CE"];
  const setChoices = ["A F", "A F G", "A E F G", "A D E F G", "A B D E F G", "A B C D E F G"];
  return {
    title: "Prim's Algorithm",
    prompt: "What is the order edges are selected by Prim's Algorithm?",
    visual: mstExampleGraph(),
    inlineInputHtml: answerTable("Prim Table", ["Step", "Selected Edge", "Vertex Set"], [["1", selectFromAnswers("AF", edgeChoices), selectFromAnswers("A F", setChoices)], ["2", selectFromAnswers("FG", edgeChoices), selectFromAnswers("A F G", setChoices)], ["3", selectFromAnswers("EG", edgeChoices), selectFromAnswers("A E F G", setChoices)], ["4", selectFromAnswers("DE", edgeChoices), selectFromAnswers("A D E F G", setChoices)], ["5", selectFromAnswers("BD", edgeChoices), selectFromAnswers("A B D E F G", setChoices)], ["6", selectFromAnswers("CE", edgeChoices), selectFromAnswers("A B C D E F G", setChoices)]]),
    placeholder: answer,
    answerHtml: `${mstExampleGraph()}${table(["Step", "Selected Edge", "Vertex Set"], [["1", "AF", "A,F"], ["2", "FG", "A,F,G"], ["3", "EG", "A,E,F,G"], ["4", "DE", "A,D,E,F,G"], ["5", "BD", "A,B,D,E,F,G"], ["6", "CE", "A,B,C,D,E,F,G"]])}`,
    solutionHtml: `${table(["Step", "Selected Edge", "Vertex Set"], [["1", "AF", "A,F"], ["2", "FG", "A,F,G"], ["3", "EG", "A,E,F,G"], ["4", "DE", "A,D,E,F,G"], ["5", "BD", "A,B,D,E,F,G"], ["6", "CE", "A,B,C,D,E,F,G"]])}${algorithmSteps("Prim's Algorithm Steps", ["Start with the given starting vertex.", "Look at edges that leave the current vertex set.", "Choose the cheapest edge that reaches a new vertex.", "Add that edge and the new vertex to the tree.", "Repeat until all vertices are included."])}`,
    checkCells: true,
    check: checkEdgeSeq(answer)
  };
}

function primSimilar() {
  const graph = weightedGraph(6);
  const result = primRun(graph.nodes, graph.edges, "A");
  const answer = result.edges.map((e) => `${e.u}${e.v}`).join(" ");
  const edgeChoices = result.rows.map((r) => r[1]);
  const setChoices = result.rows.map((r) => r[2]);
  return {
    title: "Prim's Algorithm",
    prompt: "What is the order edges are selected by Prim's Algorithm?",
    visual: weightedGraphSvg(graph),
    inlineInputHtml: answerTable("Prim Table", ["Step", "Selected Edge", "Vertex Set"], result.rows.map((r) => [r[0], selectFromAnswers(r[1], edgeChoices), selectFromAnswers(r[2], setChoices)])),
    placeholder: answer,
    answerHtml: `${weightedGraphSvg(graph)}${table(["Step", "Selected Edge", "Vertex Set"], result.rows)}`,
    solutionHtml: `${table(["Step", "Selected Edge", "Vertex Set"], result.rows)}${algorithmSteps("Prim's Algorithm Steps", ["Start with the given starting vertex.", "Look at edges that leave the current vertex set.", "Choose the cheapest edge that reaches a new vertex.", "Add that edge and the new vertex to the tree.", "Repeat until all vertices are included."])}`,
    checkCells: true,
    check: checkEdgeSeq(answer)
  };
}

function kruskalExample() {
  const graph = {
    nodes: ["A", "B", "C", "D", "E", "F"],
    edges: [
      { u: "A", v: "B", w: 7 },
      { u: "A", v: "C", w: 3 },
      { u: "B", v: "C", w: 2 },
      { u: "B", v: "D", w: 6 },
      { u: "C", v: "D", w: 4 },
      { u: "C", v: "E", w: 8 },
      { u: "D", v: "E", w: 5 },
      { u: "D", v: "F", w: 9 },
      { u: "E", v: "F", w: 1 }
    ]
  };
  return kruskalProblem(graph);
}

function kruskalSimilar() {
  const graph = weightedGraph(6, 4);
  return kruskalProblem(graph);
}

function kruskalProblem(graph) {
  const result = kruskalRun(graph.nodes, graph.edges);
  const answer = result.selected.map((e) => `${e.u}${e.v}`).join(" ");
  const selectedRows = result.selected.map((e, i) => [
    i + 1,
    `${e.u}${e.v}`,
    kruskalVertexSet(result.selected.slice(0, i + 1))
  ]);
  const edgeChoices = selectedRows.map((r) => r[1]);
  const setChoices = selectedRows.map((r) => r[2]);
  return {
    title: "Kruskal's Algorithm",
    prompt: "What is the order edges are selected by Kruskal's Algorithm?",
    visual: `${weightedGraphSvg(graph)}${table(["Sorted Edge", "Weight"], result.sorted.map((e) => [`${e.u}${e.v}`, e.w]))}`,
    inlineInputHtml: answerTable("Kruskal Table", ["Step", "Selected Edge", "Vertex Set"], selectedRows.map((r) => [r[0], selectFromAnswers(r[1], edgeChoices), selectFromAnswers(r[2], setChoices)])),
    placeholder: answer,
    answerHtml: `${weightedGraphSvg(graph)}${table(["Edge", "Decision"], result.decisions, true)}`,
    solutionHtml: `${table(["Edge", "Decision"], result.decisions, true)}${algorithmSteps("Kruskal's Algorithm Steps", ["Sort all edges from smallest to largest weight.", "Consider edges in sorted order.", "Select an edge if it connects two different components.", "Skip an edge if it creates a cycle.", "Use Union-Find to track connected components.", "Stop after selecting V - 1 edges."])}`,
    checkCells: true,
    check: checkEdgeSeq(answer)
  };
}

function kruskalVertexSet(edges) {
  return [...new Set(edges.flatMap((edge) => [edge.u, edge.v]))].sort().join(",");
}

function weightedGraph(size, extraEdges = size) {
  const nodes = "ABCDEF".slice(0, size).split("");
  const edges = [];
  const usedWeights = new Set();
  const nextWeight = () => {
    let weight = rand(1, 18);
    while (usedWeights.has(weight)) weight = rand(1, 18);
    usedWeights.add(weight);
    return weight;
  };
  for (let i = 0; i < nodes.length - 1; i++) edges.push({ u: nodes[i], v: nodes[i + 1], w: nextWeight() });
  const targetEdges = Math.min((size * (size - 1)) / 2, nodes.length - 1 + extraEdges);
  let guard = 0;
  while (edges.length < targetEdges && guard < 80) {
    guard++;
    const u = pick(nodes);
    const v = pick(nodes);
    if (u !== v && !edges.some((e) => sameEdge(e, u, v))) edges.push({ u, v, w: nextWeight() });
  }
  return { nodes, edges };
}

function sameEdge(e, u, v) {
  return (e.u === u && e.v === v) || (e.u === v && e.v === u);
}

function edgeTable(edges) {
  return table(["Edge", "Weight"], edges.map((e) => [`${e.u}${e.v}`, e.w]));
}

function primRun(nodes, edges, start) {
  const set = new Set([start]);
  const selected = [];
  const rows = [];
  while (set.size < nodes.length) {
    const edge = edges.filter((e) => set.has(e.u) !== set.has(e.v)).sort((a, b) => a.w - b.w)[0];
    selected.push(edge);
    set.add(set.has(edge.u) ? edge.v : edge.u);
    rows.push([rows.length + 1, `${edge.u}${edge.v}`, [...set].sort().join(",")]);
  }
  return { edges: selected, rows };
}

function kruskalRun(nodes, edges) {
  const dsu = new DSU(nodes);
  const sorted = [...edges].sort((a, b) => a.w - b.w);
  const selected = [];
  const decisions = [];
  sorted.forEach((e) => {
    const before = dsu.find(e.u) === dsu.find(e.v);
    if (!before && selected.length < nodes.length - 1) {
      dsu.union(e.u, e.v);
      selected.push(e);
      decisions.push([`${e.u}${e.v} (${e.w})`, "select", selected.map((edge) => `${edge.u}${edge.v}`).join(" ")]);
    } else {
      decisions.push([`${e.u}${e.v} (${e.w})`, "skip - cycle", selected.map((edge) => `${edge.u}${edge.v}`).join(" ")]);
    }
  });
  return { sorted, selected, decisions };
}

// ---------- Hashing ----------
function hashingExample() {
  return hashingProblem(7, [10, 22, 31, 4], "Linear probing");
}

function hashingSimilar() {
  return hashingProblem(pick([7, 11]), uniqueNums(5, 3, 80), pick(["Chaining", "Linear probing", "Quadratic probing"]));
}

function hashingProblem(size, keys, rule) {
  const filled = Array.from({ length: size }, () => rule === "Chaining" ? [] : "");
  keys.forEach((key) => {
    let index = key % size;
    let step = 0;
    if (rule === "Chaining") filled[index].push(key);
    else {
      while (filled[index] !== "") {
        step++;
        index = rule === "Linear probing" ? (index + 1) % size : (key % size + step * step) % size;
      }
      filled[index] = key;
    }
  });
  const answer = filled.map((v, i) => `${i}:${Array.isArray(v) ? v.join("-") || "_" : v || "_"}`).join(" ");
  const slotAnswers = filled.map((v) => Array.isArray(v) ? v.join(" ") || "_" : v || "_");
  const hashChoices = ["empty", ...new Set(slotAnswers.filter((v) => v !== "_"))];
  return {
    title: "Hashing",
    prompt: "Fill in the hash table.",
    visual: `<p>Table size = ${size}<br>h(k) = k mod ${size}<br>Insert: ${keys.join(", ")}<br>Collision rule: ${rule}</p>`,
    inlineInputHtml: answerTable("Hash Table", ["Index", "Value"], slotAnswers.map((answerValue, i) => [i, hashSelect(answerValue, hashChoices)])),
    placeholder: answer,
    answerHtml: table(["Index", "Value"], filled.map((v, i) => [i, Array.isArray(v) ? v.join(" -> ") || "empty" : v || "empty"])),
    solutionHtml: algorithmSteps("Hashing Steps", ["Compute h(k) for the key.", "If the slot is empty, place the key there.", `If a collision occurs, apply ${rule}.`, "For chaining, keep collided keys in the same slot list.", "For probing, keep checking slots using the probing rule until an empty slot is found.", "Repeat for every key in insertion order."]),
    checkCells: true,
    check: checkText(answer)
  };
}

function hashSelect(answer, choices) {
  const normalizedAnswer = answer === "_" ? "empty" : answer;
  const options = ["empty", ...shuffle(choices.filter((choice) => choice !== "empty"))];
  return `<select class="cell-select" data-answer="${escapeHtml(normalizedAnswer)}">${options.map((choice) => `<option value="${escapeHtml(choice)}">${escapeHtml(choice)}</option>`).join("")}</select>`;
}

// ---------- Big-O and choice ----------
function bigOExample() {
  return bigOSimilar();
}

function bigOSimilar() {
  const item = pick([
    ["Heap insert", "O(log n)"], ["Heapify array", "O(n)"], ["Hash table average search", "O(1)"],
    ["BFS", "O(V + E)"], ["DFS", "O(V + E)"], ["Kruskal's", "O(E log E)"], ["AVL search", "O(log n)"]
  ]);
  const choices = shuffle([item[1], "O(1)", "O(n)", "O(n^2)"]).filter((v, i, a) => a.indexOf(v) === i);
  return {
    type: "choice",
    title: "Big-O",
    prompt: `What is the runtime for ${item[0]}?`,
    visual: table(["Operation", "Runtime"], [[item[0], ""]]),
    choices,
    answerHtml: item[1],
    solutionHtml: algorithmSteps("Runtime Identification Steps", ["Identify the data structure or algorithm.", "Identify the operation being performed.", "Ask whether the operation touches one item, a path of height log n, every item, or every vertex/edge.", "Match that amount of work to the closest Big-O choice."]),
    check: checkText(item[1])
  };
}

function choiceExample() {
  return choiceSimilar();
}

function choiceSimilar() {
  const item = pick([
    ["Need fastest average lookup by key.", "Hash table"],
    ["Need a minimum spanning tree.", "Prim's or Kruskal's"],
    ["Need a priority queue.", "Heap"],
    ["Need connected groups.", "Union-Find"],
    ["Need shortest path in an unweighted graph.", "BFS"],
    ["Need depth exploration or cycle detection.", "DFS"],
    ["Need ordered balanced search.", "AVL, Red-Black, or B 2-3-4 tree"]
  ]);
  const choicePool = [item[1], "BFS", "DFS", "Heap", "Hash table", "Union-Find", "Prim's or Kruskal's", "AVL tree"].filter((v, i, a) => a.indexOf(v) === i);
  const choices = shuffle(choicePool).slice(0, 6);
  if (!choices.includes(item[1])) choices[0] = item[1];
  return {
    type: "choice",
    title: "Algorithm Choice",
    prompt: item[0],
    visual: `<div class="blank-area">Which algorithm or data structure should you choose?</div>`,
    choices: shuffle(choices),
    placeholder: item[1],
    answerHtml: item[1],
    solutionHtml: algorithmSteps("Algorithm Choice Steps", ["Look for the key clue in the scenario.", "Decide whether the task is lookup, traversal, priority queue, connected components, MST, hashing, or balanced search.", "Match the clue to the data structure or algorithm that directly solves it.", "Avoid choosing an algorithm whose assumptions do not match the scenario."]),
    check: (answer) => item[1].toLowerCase().split(/\s+or\s+|,\s*/).some((part) => clean(answer).includes(clean(part)))
  };
}
