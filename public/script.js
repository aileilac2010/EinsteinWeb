const state = {
  subject: "math",
  subjectName: "Matemática",
  currentProblem: "",
  currentResult: null,
  history: JSON.parse(localStorage.getItem("einsteinHistory") || "[]")
};

/* =========================================================
   ELEMENTOS
========================================================= */

const problemInput = document.getElementById("problemInput");
const solveBtn = document.getElementById("solveBtn");

const homePage = document.getElementById("homePage");
const solutionPage = document.getElementById("solutionPage");
const historyPage = document.getElementById("historyPage");
const favoritesPage = document.getElementById("favoritesPage");

const stepsContainer = document.getElementById("stepsContainer");
const methodsContainer = document.getElementById("methodsContainer");

const solutionProblem = document.getElementById("solutionProblem");
const solutionSubject = document.getElementById("solutionSubject");

const loadingOverlay =
  document.getElementById("loadingOverlay");

const toast =
  document.getElementById("toast");

const toastText =
  document.getElementById("toastText");

const recentList =
  document.getElementById("recentList");

const historyContainer =
  document.getElementById("historyContainer");

const subjectSelector =
  document.getElementById("subjectSelector");

const subjectMenu =
  document.getElementById("subjectMenu");

const selectedSubject =
  document.getElementById("selectedSubject");

const subjectSelectorText =
  document.getElementById("subjectSelectorText");

const imageBtn =
  document.getElementById("imageBtn");

const imageInput =
  document.getElementById("imageInput");

const imagePreview =
  document.getElementById("imagePreview");

const scanCard =
  document.getElementById("scanCard");

const typeCard =
  document.getElementById("typeCard");

const newProblemBtn =
  document.getElementById("newProblemBtn");

const backBtn =
  document.getElementById("backBtn");

const viewHistory =
  document.getElementById("viewHistory");

const historyNewProblem =
  document.getElementById("historyNewProblem");

const mobileMenu =
  document.getElementById("mobileMenu");

/* =========================================================
   UTILIDADES
========================================================= */

function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function formatNumber(value) {
  if (typeof value !== "number") {
    return value;
  }

  if (Math.abs(value) < 0.0000001) {
    return "0";
  }

  return Number(value.toFixed(6)).toString();
}

function showToast(message) {
  if (!toast) return;

  if (toastText) {
    toastText.textContent = message;
  }

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

function showLoading(show) {
  if (!loadingOverlay) return;

  if (show) {
    loadingOverlay.classList.add("show");
  } else {
    loadingOverlay.classList.remove("show");
  }
}

/* =========================================================
   PÁGINAS
========================================================= */

function showPage(pageId) {

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active-page");
    page.classList.remove("active");
  });

  const page =
    document.getElementById(pageId);

  if (!page) return;

  page.classList.add("active-page");

  document.querySelectorAll(".nav-item[data-page]")
    .forEach(item => {

      item.classList.remove("active");

      if (item.dataset.page === pageId.replace("Page", "")) {
        item.classList.add("active");
      }

    });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

/* =========================================================
   NOVO PROBLEMA
========================================================= */

function newProblem() {

  state.currentProblem = "";
  state.currentResult = null;

  if (problemInput) {
    problemInput.value = "";
    problemInput.focus();
  }

  showPage("homePage");
}

if (newProblemBtn) {
  newProblemBtn.addEventListener(
    "click",
    newProblem
  );
}

if (historyNewProblem) {
  historyNewProblem.addEventListener(
    "click",
    newProblem
  );
}

/* =========================================================
   MENU MOBILE
========================================================= */

if (mobileMenu) {

  mobileMenu.addEventListener(
    "click",
    () => {

      const sidebar =
        document.getElementById("sidebar");

      if (sidebar) {
        sidebar.classList.toggle("open");
      }

    }
  );

}

/* =========================================================
   MATÉRIAS
========================================================= */

function setSubject(subject) {

  state.subject = subject;

  const names = {
    math: "Matemática",
    physics: "Física",
    chemistry: "Química"
  };

  state.subjectName =
    names[subject] || "Matemática";

  if (selectedSubject) {

    selectedSubject.innerHTML = `
      <span class="subject-dot ${
        subject === "math"
          ? "math-dot"
          : subject === "physics"
            ? "physics-dot"
            : "chemistry-dot"
      }"></span>

      ${escapeHTML(state.subjectName)}
    `;
  }

  if (subjectSelectorText) {
    subjectSelectorText.textContent =
      state.subjectName;
  }

  document
    .querySelectorAll("[data-subject]")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.subject === subject
      );

    });

  if (subjectMenu) {
    subjectMenu.classList.remove("open");
  }
}

/* =========================================================
   SELETOR DE MATÉRIA
========================================================= */

if (subjectSelector) {

  subjectSelector.addEventListener(
    "click",
    () => {

      if (subjectMenu) {
        subjectMenu.classList.toggle("open");
      }

    }
  );

}

document
  .querySelectorAll("[data-subject]")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        setSubject(
          button.dataset.subject
        );

      }
    );

  });

/* =========================================================
   IMAGEM
========================================================= */

if (imageBtn && imageInput) {

  imageBtn.addEventListener(
    "click",
    () => {
      imageInput.click();
    }
  );

}

if (imageInput) {

  imageInput.addEventListener(
    "change",
    event => {

      const file =
        event.target.files?.[0];

      if (!file) return;

      const reader =
        new FileReader();

      reader.onload = e => {

        if (!imagePreview) return;

        imagePreview.innerHTML = `
          <div class="preview-inner">

            <img
              src="${e.target.result}"
              alt="Problema"
            >

            <button
              type="button"
              id="removeImage"
            >
              ×
            </button>

          </div>
        `;

        const remove =
          document.getElementById(
            "removeImage"
          );

        if (remove) {

          remove.onclick = () => {

            imagePreview.innerHTML = "";

            imageInput.value = "";

          };

        }

      };

      reader.readAsDataURL(file);

    }
  );

}

/* =========================================================
   CARDS RÁPIDOS
========================================================= */

if (scanCard && imageInput) {

  scanCard.addEventListener(
    "click",
    () => {
      imageInput.click();
    }
  );

}

if (typeCard && problemInput) {

  typeCard.addEventListener(
    "click",
    () => {

      problemInput.focus();

      problemInput.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    }
  );

}

/* =========================================================
   SOLVER
========================================================= */

async function solveProblem() {

  const problem =
    problemInput?.value.trim();

  if (!problem) {

    showToast(
      "Digite um problema primeiro."
    );

    return;
  }

  state.currentProblem = problem;

  showLoading(true);

  try {

    const response =
      await fetch("/api/solve", {

        method: "POST",

        headers: {
          "Content-Type":
            "application/json"
        },

        body: JSON.stringify({

          problem: problem,

          subject: state.subject

        })

      });

    const data =
      await response.json();

    console.log(
      "Resposta do EinsteinWeb:",
      data
    );

    if (!response.ok) {

      throw new Error(
        data.error ||
        "Erro no servidor."
      );

    }

    if (!data.success) {

      throw new Error(
        data.error ||
        "Não foi possível resolver."
      );

    }

    state.currentResult = data;

    renderSolution(data);

    saveHistory(
      problem,
      data
    );

    showPage("solutionPage");

  } catch (error) {

    console.error(
      "Erro:",
      error
    );

    showToast(
      error.message ||
      "Erro ao resolver o problema."
    );

  } finally {

    showLoading(false);

  }

}

if (solveBtn) {

  solveBtn.addEventListener(
    "click",
    solveProblem
  );

}

/* =========================================================
   CTRL + ENTER
========================================================= */

if (problemInput) {

  problemInput.addEventListener(
    "keydown",
    event => {

      if (
        event.key === "Enter" &&
        event.ctrlKey
      ) {

        event.preventDefault();

        solveProblem();

      }

    }
  );

}

/* =========================================================
   RENDER SOLUÇÃO
========================================================= */

function renderSolution(data) {

  if (solutionProblem) {

    solutionProblem.textContent =
      data.problem ||
      state.currentProblem;

  }

  if (solutionSubject) {

    solutionSubject.textContent =
      state.subjectName;

  }

  renderSteps(data);

  renderMethods(data);

  renderGraphSection(data);

}

/* =========================================================
   PASSO A PASSO
========================================================= */

function renderSteps(data) {

  if (!stepsContainer) return;

  stepsContainer.innerHTML = "";

  if (
    !data.steps ||
    !data.steps.length
  ) {

    stepsContainer.innerHTML = `
      <div class="empty-state">
        Nenhum passo encontrado.
      </div>
    `;

    return;
  }

  data.steps.forEach(
    (step, index) => {

      const card =
        document.createElement("div");

      card.className =
        "solution-step";

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
              ? `
                <p>
                  ${escapeHTML(
                    explanation
                  )}
                </p>
              `
              : ""
          }

          ${
            formula
              ? `
                <div class="formula">
                  ${escapeHTML(formula)}
                </div>
              `
              : ""
          }

        </div>

      `;

      stepsContainer.appendChild(card);

    }
  );

  /* RESULTADO FINAL */

  if (
    data.solutions &&
    data.solutions.length
  ) {

    const result =
      document.createElement("div");

    result.className =
      "final-result";

    result.innerHTML = `

      <div class="result-label">
        RESULTADO
      </div>

      <div class="result-value">

        ${
          data.solutions
            .map(
              (value, index) => {

                const label =
                  data.solutions.length > 1
                    ? `x${index + 1}`
                    : "x";

                return `
                  ${label} =
                  ${formatNumber(value)}
                `;
              }
            )
            .join("<br>")
        }

      </div>

    `;

    stepsContainer.appendChild(
      result
    );

  }

}

/* =========================================================
   MÉTODOS
========================================================= */

function renderMethods(data) {

  if (!methodsContainer) return;

  methodsContainer.innerHTML = "";

  if (
    !data.methods ||
    !data.methods.length
  ) {

    methodsContainer.innerHTML = `
      <div class="empty-state">
        Nenhum método alternativo.
      </div>
    `;

    return;
  }

  data.methods.forEach(
    method => {

      const card =
        document.createElement("div");

      card.className =
        "method-item";

      card.innerHTML = `

        <div class="method-name">
          ${escapeHTML(
            method.name
          )}
        </div>

        ${
          method.description
            ? `
              <p>
                ${escapeHTML(
                  method.description
                )}
              </p>
            `
            : ""
        }

        <div class="method-steps">

          ${
            (method.steps || [])
              .map(
                (step, index) => `
                  <div class="method-step">

                    <span>
                      ${index + 1}
                    </span>

                    <p>
                      ${escapeHTML(step)}
                    </p>

                  </div>
                `
              )
              .join("")
          }

        </div>

      `;

      methodsContainer.appendChild(
        card
      );

    }
  );

}

/* =========================================================
   GRÁFICO
========================================================= */

function renderGraphSection(data) {

  /*
    O HTML atual ainda não possui uma
    área de gráfico dedicada.

    Criamos uma automaticamente.
  */

  let graphContainer =
    document.getElementById(
      "graphContainer"
    );

  if (!graphContainer) {

    graphContainer =
      document.createElement("div");

    graphContainer.id =
      "graphContainer";

    graphContainer.className =
      "graph-container";

    solutionPage.appendChild(
      graphContainer
    );

  }

  if (
    !data.graph ||
    !data.graph.points
  ) {

    graphContainer.innerHTML = "";

    return;
  }

  const points =
    data.graph.points;

  const width = 700;
  const height = 400;
  const padding = 45;

  const xs =
    points.map(point => point.x);

  const ys =
    points.map(point => point.y);

  const minX =
    Math.min(...xs);

  const maxX =
    Math.max(...xs);

  const minY =
    Math.min(...ys);

  const maxY =
    Math.max(...ys);

  const rangeX =
    maxX - minX || 1;

  const rangeY =
    maxY - minY || 1;

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

  let path = "";

  points.forEach(
    (point, index) => {

      const x =
        mapX(point.x);

      const y =
        mapY(point.y);

      path +=
        `${index === 0 ? "M" : "L"} ${x} ${y} `;

    }
  );

  const axisX =
    minX <= 0 && maxX >= 0
      ? mapX(0)
      : null;

  const axisY =
    minY <= 0 && maxY >= 0
      ? mapY(0)
      : null;

  graphContainer.innerHTML = `

    <div class="graph-title">
      Gráfico
    </div>

    <svg
      viewBox="0 0 ${width} ${height}"
      class="math-graph"
    >

      ${
        axisY !== null
          ? `
            <line
              x1="${padding}"
              y1="${axisY}"
              x2="${width - padding}"
              y2="${axisY}"
              class="graph-axis"
            />
          `
          : ""
      }

      ${
        axisX !== null
          ? `
            <line
              x1="${axisX}"
              y1="${padding}"
              x2="${axisX}"
              y2="${height - padding}"
              class="graph-axis"
            />
          `
          : ""
      }

      <path
        d="${path}"
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

    ${
      data.graph.vertex
        ? `
          <div class="graph-info">

            Vértice:
            (
            ${formatNumber(
              data.graph.vertex.x
            )},
            ${formatNumber(
              data.graph.vertex.y
            )}
            )

          </div>
        `
        : ""
    }

  `;

}

/* =========================================================
   HISTÓRICO
========================================================= */

function saveHistory(
  problem,
  result
) {

  const item = {

    id: Date.now(),

    problem,

    result,

    date:
      new Date().toLocaleString(
        "pt-PT"
      ),

    favorite: false

  };

  state.history.unshift(item);

  state.history =
    state.history.slice(0, 30);

  localStorage.setItem(
    "einsteinHistory",
    JSON.stringify(
      state.history
    )
  );

  renderRecent();

}

function renderRecent() {

  if (!recentList) return;

  if (!state.history.length) {

    recentList.innerHTML = `
      <div class="empty-state">

        <div>∑</div>

        <span>
          Os seus problemas resolvidos
          aparecerão aqui.
        </span>

      </div>
    `;

    return;
  }

  recentList.innerHTML =
    state.history
      .slice(0, 5)
      .map(
        item => `

          <button
            class="history-item"
            data-history-id="${item.id}"
          >

            <strong>
              ${escapeHTML(
                item.problem
              )}
            </strong>

            <small>
              ${escapeHTML(
                item.date
              )}
            </small>

          </button>

        `
      )
      .join("");

  document
    .querySelectorAll(
      "[data-history-id]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const item =
            state.history.find(
              historyItem =>
                historyItem.id ==
                button.dataset.historyId
            );

          if (!item) return;

          state.currentProblem =
            item.problem;

          state.currentResult =
            item.result;

          renderSolution(
            item.result
          );

          showPage(
            "solutionPage"
          );

        }
      );

    });

}

/* =========================================================
   HISTÓRICO COMPLETO
========================================================= */

function renderHistory() {

  if (!historyContainer) return;

  if (!state.history.length) {

    return;

  }

  historyContainer.innerHTML =
    state.history
      .map(
        item => `

          <button
            class="history-item"
            data-history-id="${item.id}"
          >

            <strong>
              ${escapeHTML(
                item.problem
              )}
            </strong>

            <small>
              ${escapeHTML(
                item.date
              )}
            </small>

          </button>

        `
      )
      .join("");

  historyContainer
    .querySelectorAll(
      "[data-history-id]"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const item =
            state.history.find(
              historyItem =>
                historyItem.id ==
                button.dataset.historyId
            );

          if (!item) return;

          state.currentProblem =
            item.problem;

          state.currentResult =
            item.result;

          renderSolution(
            item.result
          );

          showPage(
            "solutionPage"
          );

        }
      );

    });

}

/* =========================================================
   NAVEGAÇÃO
========================================================= */

if (backBtn) {

  backBtn.addEventListener(
    "click",
    () => {
      showPage("homePage");
    }
  );

}

if (viewHistory) {

  viewHistory.addEventListener(
    "click",
    () => {

      renderHistory();

      showPage(
        "historyPage"
      );

    }
  );

}

/* =========================================================
   INICIALIZAÇÃO
========================================================= */

setSubject("math");

renderRecent();

showPage("homePage");

console.log(
  "EinsteinWeb Mathematics Engine V0.2 carregado."
);
