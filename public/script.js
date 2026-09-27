const state = {
  subject: "math",
  subjectName: "Matemática",
  currentProblem: "",
  currentResult: null,

  history: JSON.parse(
    localStorage.getItem("einsteinHistory") || "[]"
  )
};


/* =========================================================
   ELEMENTOS
========================================================= */

const problemInput =
  document.getElementById("problemInput");

const solveBtn =
  document.getElementById("solveBtn");

const homePage =
  document.getElementById("homePage");

const solutionPage =
  document.getElementById("solutionPage");

const historyPage =
  document.getElementById("historyPage");

const favoritesPage =
  document.getElementById("favoritesPage");

const stepsContainer =
  document.getElementById("stepsContainer");

const methodsContainer =
  document.getElementById("methodsContainer");

const methodsPreview =
  document.getElementById("methodsPreview");

const solutionProblem =
  document.getElementById("solutionProblem");

const solutionSubject =
  document.getElementById("solutionSubject");

const solutionTitle =
  document.getElementById("solutionTitle");

const graphContainer =
  document.getElementById("graphContainer");

const learningContent =
  document.getElementById("learningContent");

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

const favoritesList =
  document.getElementById("favoritesList");

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

const fileCard =
  document.getElementById("fileCard");

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

const sidebar =
  document.getElementById("sidebar");


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

  return Number(
    value.toFixed(6)
  ).toString();

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

  loadingOverlay.classList.toggle(
    "show",
    show
  );

}


/* =========================================================
   NAVEGAÇÃO
========================================================= */

function showPage(pageId) {

  document
    .querySelectorAll(".page")
    .forEach(page => {
      page.classList.remove("active-page");
    });

  const page =
    document.getElementById(pageId);

  if (!page) return;

  page.classList.add("active-page");

  document
    .querySelectorAll(".nav-item[data-page]")
    .forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.page ===
        pageId.replace("Page", "")
      );

    });

  if (sidebar) {
    sidebar.classList.remove("open");
  }

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

  if (imagePreview) {
    imagePreview.innerHTML = "";
  }

  if (imageInput) {
    imageInput.value = "";
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
    event => {

      event.stopPropagation();

      if (sidebar) {
        sidebar.classList.toggle("open");
      }

    }
  );

}


document.addEventListener(
  "click",
  event => {

    if (
      sidebar &&
      sidebar.classList.contains("open") &&
      !sidebar.contains(event.target) &&
      event.target !== mobileMenu
    ) {

      sidebar.classList.remove("open");

    }

  }
);


/* =========================================================
   MATÉRIAS
========================================================= */

function setSubject(subject) {

  const names = {

    math: "Matemática",

    physics: "Física",

    chemistry: "Química"

  };

  state.subject =
    names[subject]
      ? subject
      : "math";

  state.subjectName =
    names[state.subject];


  let dotClass = "math-dot";

  if (state.subject === "physics") {
    dotClass = "physics-dot";
  }

  if (state.subject === "chemistry") {
    dotClass = "chemistry-dot";
  }


  if (selectedSubject) {

    selectedSubject.innerHTML = `

      <span class="subject-dot ${dotClass}"></span>

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
        button.dataset.subject ===
        state.subject
      );

    });


  if (subjectMenu) {
    subjectMenu.classList.remove("open");
  }

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


if (subjectSelector) {

  subjectSelector.addEventListener(
    "click",
    event => {

      event.stopPropagation();

      if (subjectMenu) {
        subjectMenu.classList.toggle("open");
      }

    }
  );

}


/* =========================================================
   IMAGEM
========================================================= */

function openImagePicker() {

  if (imageInput) {
    imageInput.click();
  }

}


if (imageBtn) {

  imageBtn.addEventListener(
    "click",
    openImagePicker
  );

}


if (scanCard) {

  scanCard.addEventListener(
    "click",
    openImagePicker
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
   CARDS
========================================================= */

if (typeCard) {

  typeCard.addEventListener(
    "click",
    () => {

      if (!problemInput) return;

      problemInput.focus();

      problemInput.scrollIntoView({
        behavior: "smooth",
        block: "center"
      });

    }
  );

}


if (fileCard) {

  fileCard.addEventListener(
    "click",
    () => {

      showToast(
        "Envio de arquivos será adicionado em breve."
      );

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


  state.currentProblem =
    problem;


  showLoading(true);


  try {

    const response =
      await fetch(
        "/api/solve",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({

            problem,

            subject:
              state.subject

          })

        }
      );


    let data;

    try {

      data =
        await response.json();

    } catch {

      throw new Error(
        "O servidor enviou uma resposta inválida."
      );

    }


    console.log(
      "EinsteinWeb:",
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
        "Não foi possível resolver o problema."
      );

    }


    state.currentResult =
      data;


    renderSolution(data);

    saveHistory(
      problem,
      data
    );


    showPage(
      "solutionPage"
    );


    switchSolutionTab(
      "solution"
    );


  } catch (error) {

    console.error(
      "Erro:",
      error
    );

    showToast(
      error.message ||
      "Erro ao resolver."
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
   SOLUÇÃO
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


  if (solutionTitle) {

    solutionTitle.textContent =
      data.title ||
      "Resolução passo a passo";

  }


  renderSteps(data);

  renderMethods(data);

  renderMethodsPreview(data);

  renderGraph(data);

  renderLearning(data);

}


/* =========================================================
   PASSOS
========================================================= */

function renderSteps(data) {

  if (!stepsContainer) return;

  stepsContainer.innerHTML = "";


  if (
    !Array.isArray(data.steps) ||
    data.steps.length === 0
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


  if (
    Array.isArray(data.solutions) &&
    data.solutions.length > 0
  ) {

    const result =
      document.createElement("div");


    result.className =
      "final-result";


    const values =
      data.solutions
        .map(
          (value, index) => {

            const label =
              data.solutions.length > 1
                ? `x${index + 1}`
                : "x";

            return `
              ${label} = ${formatNumber(value)}
            `;

          }
        )
        .join("<br>");


    result.innerHTML = `

      <div class="result-label">
        RESULTADO
      </div>

      <div class="result-value">
        ${values}
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
    !Array.isArray(data.methods) ||
    data.methods.length === 0
  ) {

    methodsContainer.innerHTML = `

      <div class="empty-state">
        Nenhum método alternativo encontrado.
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
            method.name ||
            "Método"
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
            Array.isArray(method.steps)
              ? method.steps
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
              : ""
          }

        </div>

      `;


      methodsContainer.appendChild(
        card
      );

    }
  );

}


function renderMethodsPreview(data) {

  if (!methodsPreview) return;

  methodsPreview.innerHTML = "";


  if (
    !Array.isArray(data.methods) ||
    data.methods.length === 0
  ) {

    methodsPreview.innerHTML = `

      <div class="empty-state">
        Nenhum método encontrado.
      </div>

    `;

    return;

  }


  data.methods.forEach(
    method => {

      const item =
        document.createElement("div");


      item.className =
        "method-item";


      item.innerHTML = `

        <div class="method-name">
          ${escapeHTML(
            method.name ||
            "Método"
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

      `;


      methodsPreview.appendChild(
        item
      );

    }
  );

}


/* =========================================================
   GRÁFICO
========================================================= */

function renderGraph(data) {

  if (!graphContainer) return;


  if (
    !data.graph ||
    !Array.isArray(data.graph.points) ||
    data.graph.points.length < 2
  ) {

    graphContainer.innerHTML = `

      <div class="graph-empty">

        Não há dados suficientes
        para gerar um gráfico deste problema.

      </div>

    `;

    return;

  }


  const points =
    data.graph.points;


  const width = 800;

  const height = 450;

  const padding = 55;


  const xs =
    points.map(
      point => Number(point.x)
    );

  const ys =
    points.map(
      point => Number(point.y)
    );


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
      (
        (x - minX) /
        rangeX
      ) *
      (width - padding * 2)
    );

  }


  function mapY(y) {

    return (
      height -
      padding -
      (
        (y - minY) /
        rangeY
      ) *
      (height - padding * 2)
    );

  }


  let path = "";


  points.forEach(
    (point, index) => {

      const x =
        mapX(Number(point.x));

      const y =
        mapY(Number(point.y));


      path +=
        `${index === 0 ? "M" : "L"} ${x} ${y} `;

    }
  );


  const axisX =
    minX <= 0 &&
    maxX >= 0
      ? mapX(0)
      : null;


  const axisY =
    minY <= 0 &&
    maxY >= 0
      ? mapY(0)
      : null;


  let rootsHTML = "";


  if (
    Array.isArray(data.graph.roots)
  ) {

    rootsHTML =
      data.graph.roots
        .map(root => {

          const numericRoot =
            Number(root);


          if (
            numericRoot < minX ||
            numericRoot > maxX
          ) {

            return "";

          }


          return `

            <circle
              cx="${mapX(numericRoot)}"
              cy="${mapY(0)}"
              r="7"
              class="graph-root"
            />

          `;

        })
        .join("");

  }


  graphContainer.innerHTML = `

    <div class="graph-title">
      ${escapeHTML(
        data.graph.title ||
        "Representação gráfica"
      )}
    </div>


    <svg
      viewBox="0 0 ${width} ${height}"
      class="math-graph"
      role="img"
      aria-label="Gráfico da função"
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


      ${rootsHTML}

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
   APRENDER
========================================================= */

function renderLearning(data) {

  if (!learningContent) return;


  const text =
    data.learning ||
    data.explanation ||
    "Nenhuma explicação adicional disponível.";


  learningContent.innerHTML = `

    <p>
      ${escapeHTML(text)}
    </p>

  `;

}


/* =========================================================
   TABS
========================================================= */

function switchSolutionTab(tabName) {

  document
    .querySelectorAll(".solution-tab")
    .forEach(tab => {

      tab.classList.toggle(
        "active",
        tab.dataset.tab === tabName
      );

    });


  document
    .querySelectorAll(".solution-tab-content")
    .forEach(content => {

      content.classList.remove("active");

    });


  const target =
    document.getElementById(
      `${tabName}Tab`
    );


  if (target) {
    target.classList.add("active");
  }

}


document
  .querySelectorAll(".solution-tab")
  .forEach(tab => {

    tab.addEventListener(
      "click",
      () => {

        switchSolutionTab(
          tab.dataset.tab
        );

      }
    );

  });


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
    state.history.slice(
      0,
      30
    );


  localStorage.setItem(
    "einsteinHistory",
    JSON.stringify(
      state.history
    )
  );


  renderRecent();

}


function openHistoryItem(item) {

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


  switchSolutionTab(
    "solution"
  );

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


  recentList
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
                String(
                  historyItem.id
                ) ===
                String(
                  button.dataset.historyId
                )
            );


          openHistoryItem(item);

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

    historyContainer.innerHTML = `

      <div class="empty-large">

        <div class="empty-large-icon">
          ◷
        </div>

        <h2>
          Nenhum problema ainda
        </h2>

        <p>
          Resolva o seu primeiro problema
          para começar o histórico.
        </p>

        <button
          class="primary-btn"
          id="historyNewProblem"
        >
          Resolver problema
        </button>

      </div>

    `;


    const button =
      document.getElementById(
        "historyNewProblem"
      );


    if (button) {
      button.addEventListener(
        "click",
        newProblem
      );
    }


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
                String(
                  historyItem.id
                ) ===
                String(
                  button.dataset.historyId
                )
            );


          openHistoryItem(item);

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

      showPage(
        "homePage"
      );

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


document
  .querySelectorAll(
    ".nav-item[data-page]"
  )
  .forEach(item => {

    item.addEventListener(
      "click",
      () => {

        const page =
          item.dataset.page;

        if (page === "history") {

          renderHistory();

        }

        showPage(
          `${page}Page`
        );

      }
    );

  });


/* =========================================================
   INICIALIZAÇÃO
========================================================= */

setSubject("math");

renderRecent();

showPage("homePage");

switchSolutionTab("solution");


console.log(
  "EinsteinWeb V0.3 carregado."
);
