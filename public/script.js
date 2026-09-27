const state = {
  subject: "math",
  subjectName: "Matemática",
  currentProblem: "",
  currentResult: null,
  history: JSON.parse(localStorage.getItem("einsteinHistory") || "[]")
};

/* =========================
   ELEMENTOS
========================= */

const problemInput = document.getElementById("problemInput");
const solveButton = document.getElementById("solveButton");
const subjectMenu = document.getElementById("subjectMenu");
const solutionPage = document.getElementById("solutionPage");
const homePage = document.getElementById("homePage");
const historyPage = document.getElementById("historyPage");
const favoritesPage = document.getElementById("favoritesPage");

const stepsContainer = document.getElementById("stepsContainer");
const methodsContainer = document.getElementById("methodsContainer");
const learningContent = document.getElementById("learningContent");
const problemDisplay = document.getElementById("problemDisplay");

const loadingOverlay = document.getElementById("loadingOverlay");
const toast = document.getElementById("toast");

/* =========================
   UTILIDADES
========================= */

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function showToast(message) {
  if (!toast) return;

  toast.textContent = message;
  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function showLoading(show) {
  if (!loadingOverlay) return;

  loadingOverlay.classList.toggle("show", show);
}

function formatNumber(value) {
  if (typeof value !== "number") return value;

  if (Math.abs(value) < 0.0000001) return "0";

  return Number(value.toFixed(6)).toString();
}

/* =========================
   NAVEGAÇÃO
========================= */

function hideAllPages() {
  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active");
  });
}

function showPage(pageId) {
  hideAllPages();

  const page = document.getElementById(pageId);

  if (page) {
    page.classList.add("active");
  }
}

function goHome() {
  showPage("homePage");
}

function goHistory() {
  renderHistory();
  showPage("historyPage");
}

function goFavorites() {
  renderFavorites();
  showPage("favoritesPage");
}

/* =========================
   SIDEBAR MOBILE
========================= */

function toggleSidebar() {
  const sidebar = document.querySelector(".sidebar");

  if (sidebar) {
    sidebar.classList.toggle("open");
  }
}

document.querySelectorAll("[data-menu-toggle]").forEach(button => {
  button.addEventListener("click", toggleSidebar);
});

/* =========================
   NOVO PROBLEMA
========================= */

function newProblem() {
  state.currentProblem = "";
  state.currentResult = null;

  if (problemInput) {
    problemInput.value = "";
    problemInput.focus();
  }

  goHome();
}

/* =========================
   DISCIPLINA
========================= */

function setSubject(subject, name) {
  state.subject = subject;
  state.subjectName = name;

  document.querySelectorAll(".subject-option").forEach(option => {
    option.classList.remove("active");
  });

  const selected = document.querySelector(
    `[data-subject="${subject}"]`
  );

  if (selected) {
    selected.classList.add("active");
  }

  const label = document.getElementById("selectedSubject");

  if (label) {
    label.textContent = name;
  }
}

document.querySelectorAll("[data-subject]").forEach(button => {
  button.addEventListener("click", () => {
    const subject = button.dataset.subject;

    const name =
      button.dataset.name ||
      button.textContent.trim();

    setSubject(subject, name);
  });
});

/* =========================
   SOLVER
========================= */

async function solveProblem() {
  const problem = problemInput?.value.trim();

  if (!problem) {
    showToast("Digite um problema primeiro.");
    return;
  }

  state.currentProblem = problem;

  showLoading(true);

  try {
    const response = await fetch("/api/solve", {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        problem,
        subject: state.subject
      })
    });

    const data = await response.json();

    console.log("EinsteinWeb response:", data);

    if (!response.ok || !data.success) {
      throw new Error(
        data.error || "Não foi possível resolver o problema."
      );
    }

    state.currentResult = data;

    renderSolution(data);

    saveHistory(problem, data);

    showPage("solutionPage");

  } catch (error) {
    console.error(error);

    showToast(
      error.message ||
      "Erro ao resolver o problema."
    );

  } finally {
    showLoading(false);
  }
}

/* =========================
   RENDER SOLUÇÃO
========================= */

function renderSolution(data) {

  if (problemDisplay) {
    problemDisplay.textContent = data.problem || state.currentProblem;
  }

  renderSteps(data);
  renderMethods(data);
  renderLearning(data);
  renderGraph(data);

  setupSolutionTabs();
}

/* =========================
   PASSOS
========================= */

function renderSteps(data) {

  if (!stepsContainer) return;

  stepsContainer.innerHTML = "";

  if (!data.steps || !data.steps.length) {
    stepsContainer.innerHTML = `
      <div class="empty-state">
        Nenhum passo disponível.
      </div>
    `;

    return;
  }

  data.steps.forEach((step, index) => {

    const card = document.createElement("div");

    card.className = "solution-step";

    const title =
      step.title ||
      `Passo ${index + 1}`;

    const explanation =
      step.explanation || "";

    const formula =
      step.formula || "";

    card.innerHTML = `
      <div class="step-number">
        ${index + 1}
      </div>

      <div class="step-content">

        <h3>
          ${escapeHTML(title)}
        </h3>

        ${
          explanation
            ? `<p>${escapeHTML(explanation)}</p>`
            : ""
        }

        ${
          formula
            ? `<div class="formula">
                ${escapeHTML(formula)}
               </div>`
            : ""
        }

      </div>
    `;

    stepsContainer.appendChild(card);
  });

  /* Resultado */

  if (data.solutions && data.solutions.length) {

    const resultCard = document.createElement("div");

    resultCard.className = "final-result";

    resultCard.innerHTML = `
      <div class="result-label">
        Resultado
      </div>

      <div class="result-value">
        ${
          data.solutions
            .map(
              (x, i) =>
                `x${data.solutions.length > 1 ? i + 1 : ""} = ${formatNumber(x)}`
            )
            .join("<br>")
        }
      </div>
    `;

    stepsContainer.appendChild(resultCard);
  }
}

/* =========================
   MÉTODOS
========================= */

function renderMethods(data) {

  if (!methodsContainer) return;

  methodsContainer.innerHTML = "";

  if (!data.methods || !data.methods.length) {

    methodsContainer.innerHTML = `
      <div class="empty-state">
        Nenhum método alternativo disponível.
      </div>
    `;

    return;
  }

  data.methods.forEach(method => {

    const card = document.createElement("div");

    card.className = "method-card";

    card.innerHTML = `
      <div class="method-header">

        <h3>
          ${escapeHTML(method.name)}
        </h3>

      </div>

      ${
        method.description
          ? `<p>${escapeHTML(method.description)}</p>`
          : ""
      }

      <div class="method-steps">

        ${
          (method.steps || [])
            .map(
              (step, index) => `
                <div class="method-step">
                  <span>${index + 1}</span>
                  <p>${escapeHTML(step)}</p>
                </div>
              `
            )
            .join("")
        }

      </div>
    `;

    methodsContainer.appendChild(card);
  });
}

/* =========================
   APRENDER
========================= */

function renderLearning(data) {

  if (!learningContent) return;

  if (!data.learning) {

    learningContent.innerHTML = `
      <p>
        Nenhuma explicação adicional disponível.
      </p>
    `;

    return;
  }

  learningContent.innerHTML = `
    <h3>
      ${escapeHTML(data.learning.title)}
    </h3>

    <p>
      ${escapeHTML(data.learning.content)}
    </p>
  `;
}

/* =========================
   GRÁFICO
========================= */

function renderGraph(data) {

  const graphContainer =
    document.getElementById("graphContainer");

  if (!graphContainer) return;

  if (!data.graph || !data.graph.points) {

    graphContainer.innerHTML = `
      <div class="empty-state">
        Este problema ainda não possui gráfico.
      </div>
    `;

    return;
  }

  const points = data.graph.points;

  const width = 700;
  const height = 400;

  const padding = 45;

  const xs = points.map(p => p.x);
  const ys = points.map(p => p.y);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);

  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  function mapX(x) {
    return (
      padding +
      ((x - minX) / rangeX) *
        (width - padding * 2)
    );
  }

  function mapY(y) {
    return (
      height -
      padding -
      ((y - minY) / rangeY) *
        (height - padding * 2)
    );
  }

  let pathData = "";

  points.forEach((point, index) => {

    const x = mapX(point.x);
    const y = mapY(point.y);

    pathData +=
      `${index === 0 ? "M" : "L"} ${x} ${y} `;
  });

  const zeroX =
    minX <= 0 && maxX >= 0
      ? mapX(0)
      : null;

  const zeroY =
    minY <= 0 && maxY >= 0
      ? mapY(0)
      : null;

  graphContainer.innerHTML = `
    <div class="graph-wrapper">

      <svg
        viewBox="0 0 ${width} ${height}"
        class="math-graph"
      >

        ${
          zeroY !== null
            ? `
              <line
                x1="${padding}"
                y1="${zeroY}"
                x2="${width - padding}"
                y2="${zeroY}"
                class="graph-axis"
              />
            `
            : ""
        }

        ${
          zeroX !== null
            ? `
              <line
                x1="${zeroX}"
                y1="${padding}"
                x2="${zeroX}"
                y2="${height - padding}"
                class="graph-axis"
              />
            `
            : ""
        }

        <path
          d="${pathData}"
          class="graph-line"
          fill="none"
        />

        ${
          data.graph.roots
            ? data.graph.roots
                .map(root => {

                  if (
                    root < minX ||
                    root > maxX
                  ) {
                    return "";
                  }

                  return `
                    <circle
                      cx="${mapX(root)}"
                      cy="${mapY(0)}"
                      r="6"
                      class="graph-root"
                    />
                  `;
                })
                .join("")
            : ""
        }

      </svg>

    </div>

    ${
      data.graph.vertex
        ? `
          <div class="graph-info">
            <strong>Vértice:</strong>
            (${formatNumber(data.graph.vertex.x)},
            ${formatNumber(data.graph.vertex.y)})
          </div>
        `
        : ""
    }
  `;
}

/* =========================
   TABS
========================= */

function setupSolutionTabs() {

  document.querySelectorAll(".solution-tab").forEach(tab => {

    tab.onclick = () => {

      document
        .querySelectorAll(".solution-tab")
        .forEach(t => t.classList.remove("active"));

      tab.classList.add("active");

      const target = tab.dataset.tab;

      document
        .querySelectorAll(".solution-panel")
        .forEach(panel => {
          panel.classList.remove("active");
        });

      const panel =
        document.getElementById(target);

      if (panel) {
        panel.classList.add("active");
      }
    };

  });
}

/* =========================
   HISTÓRICO
========================= */

function saveHistory(problem, result) {

  const item = {
    id: Date.now(),
    problem,
    result,
    date: new Date().toLocaleString("pt-PT"),
    favorite: false
  };

  state.history.unshift(item);

  state.history =
    state.history.slice(0, 30);

  localStorage.setItem(
    "einsteinHistory",
    JSON.stringify(state.history)
  );

  renderRecent();
}

function renderRecent() {

  const container =
    document.getElementById("recentHistory");

  if (!container) return;

  const recent =
    state.history.slice(0, 5);

  if (!recent.length) {

    container.innerHTML = `
      <div class="empty-state">
        Ainda não existem problemas recentes.
      </div>
    `;

    return;
  }

  container.innerHTML =
    recent
      .map(
        item => `
          <button
            class="history-item"
            data-history-id="${item.id}"
          >
            <span>
              ${escapeHTML(item.problem)}
            </span>

            <small>
              ${escapeHTML(item.date)}
            </small>
          </button>
        `
      )
      .join("");

  container
    .querySelectorAll("[data-history-id]")
    .forEach(button => {

      button.onclick = () => {

        const item =
          state.history.find(
            x =>
              x.id ==
              button.dataset.historyId
          );

        if (!item) return;

        state.currentProblem =
          item.problem;

        state.currentResult =
          item.result;

        renderSolution(item.result);

        showPage("solutionPage");
      };
    });
}

/* =========================
   HISTÓRICO COMPLETO
========================= */

function renderHistory() {

  const container =
    document.getElementById("historyList");

  if (!container) return;

  if (!state.history.length) {

    container.innerHTML = `
      <div class="empty-state">
        Ainda não há histórico.
      </div>
    `;

    return;
  }

  container.innerHTML =
    state.history
      .map(
        item => `
          <button
            class="history-item"
            data-history-id="${item.id}"
          >
            <div>
              <strong>
                ${escapeHTML(item.problem)}
              </strong>

              <small>
                ${escapeHTML(item.date)}
              </small>
            </div>
          </button>
        `
      )
      .join("");

  container
    .querySelectorAll("[data-history-id]")
    .forEach(button => {

      button.onclick = () => {

        const item =
          state.history.find(
            x =>
              x.id ==
              button.dataset.historyId
          );

        if (!item) return;

        renderSolution(item.result);

        showPage("solutionPage");
      };
    });
}

/* =========================
   FAVORITOS
========================= */

function renderFavorites() {

  const container =
    document.getElementById("favoritesList");

  if (!container) return;

  const favorites =
    state.history.filter(
      item => item.favorite
    );

  if (!favorites.length) {

    container.innerHTML = `
      <div class="empty-state">
        Nenhum problema favorito ainda.
      </div>
    `;

    return;
  }

  container.innerHTML =
    favorites
      .map(
        item => `
          <button
            class="history-item"
            data-history-id="${item.id}"
          >
            ${escapeHTML(item.problem)}
          </button>
        `
      )
      .join("");
}

/* =========================
   BOTÃO RESOLVER
========================= */

if (solveButton) {
  solveButton.addEventListener(
    "click",
    solveProblem
  );
}

/* Ctrl + Enter */

if (problemInput) {

  problemInput.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" &&
        (event.ctrlKey || event.metaKey)
      ) {
        event.preventDefault();
        solveProblem();
      }

    }
  );
}

/* =========================
   BOTÕES DE NAVEGAÇÃO
========================= */

document
  .querySelectorAll("[data-page]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {
        showPage(button.dataset.page);
      }
    );

  });

/* =========================
   INICIALIZAÇÃO
========================= */

document.addEventListener(
  "DOMContentLoaded",
  () => {

    renderRecent();

    showPage("homePage");

    console.log(
      "EinsteinWeb Mathematics Engine loaded."
    );

  }
);
