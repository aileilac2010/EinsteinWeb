```javascript
/* =========================================================
   EINSTEINWEB V0.4
   FRONTEND CONTROLLER
========================================================= */

"use strict";


/* =========================================================
   STATE
========================================================= */

const state = {
  subject: "math",
  currentResult: null,
  currentProblem: "",

  history: JSON.parse(
    localStorage.getItem("einsteinHistory") || "[]"
  ),

  favorites: JSON.parse(
    localStorage.getItem("einsteinFavorites") || "[]"
  )
};


/* =========================================================
   DOM
========================================================= */

const $ = (id) => document.getElementById(id);

const problemInput = $("problemInput");
const solveBtn = $("solveBtn");

const loadingOverlay = $("loadingOverlay");

const solutionPage = $("solutionPage");
const homePage = $("homePage");
const historyPage = $("historyPage");
const favoritesPage = $("favoritesPage");

const answerValue = $("answerValue");
const stepsContainer = $("stepsContainer");
const methodsContainer = $("methodsContainer");
const graphContainer = $("graphContainer");
const learningContainer = $("learningContainer");

const solutionProblem = $("solutionProblem");
const solutionSubject = $("solutionSubject");

const selectedSubject = $("selectedSubject");
const subjectSelectorText = $("subjectSelectorText");
const subjectMenu = $("subjectMenu");

const recentList = $("recentList");
const historyContainer = $("historyContainer");
const favoritesContainer = $("favoritesContainer");

const toast = $("toast");
const toastText = $("toastText");


/* =========================================================
   SAFE HELPERS
========================================================= */

function escapeHTML(value) {

  if (value === null || value === undefined) {
    return "";
  }

  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


function showToast(message) {

  if (!toast || !toastText) {
    console.log(message);
    return;
  }

  toastText.textContent = message;

  toast.classList.add("show");

  clearTimeout(window.__toastTimer);

  window.__toastTimer =
    setTimeout(() => {
      toast.classList.remove("show");
    }, 3500);
}


function showLoading(show) {

  if (!loadingOverlay) {
    return;
  }

  if (show) {
    loadingOverlay.classList.remove("hidden");
  } else {
    loadingOverlay.classList.add("hidden");
  }
}


function saveHistory() {

  localStorage.setItem(
    "einsteinHistory",
    JSON.stringify(state.history)
  );
}


function saveFavorites() {

  localStorage.setItem(
    "einsteinFavorites",
    JSON.stringify(state.favorites)
  );
}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(page) {

  document
    .querySelectorAll(".page")
    .forEach(section => {
      section.classList.remove("active-page");
    });


  if (page === "home" && homePage) {
    homePage.classList.add("active-page");
  }

  if (page === "history" && historyPage) {
    historyPage.classList.add("active-page");
    renderHistory();
  }

  if (page === "favorites" && favoritesPage) {
    favoritesPage.classList.add("active-page");
    renderFavorites();
  }

  if (page === "solution" && solutionPage) {
    solutionPage.classList.add("active-page");
  }


  document
    .querySelectorAll(".nav-item")
    .forEach(item => {

      item.classList.toggle(
        "active",
        item.dataset.page === page
      );

    });


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   SUBJECT
========================================================= */

const subjects = {

  math: {
    name: "Matemática",
    symbol: "∑"
  },

  physics: {
    name: "Física",
    symbol: "⚡"
  },

  chemistry: {
    name: "Química",
    symbol: "⚗"
  }

};


function setSubject(subject) {

  if (!subjects[subject]) {
    subject = "math";
  }

  state.subject = subject;

  const data = subjects[subject];


  if (selectedSubject) {
    selectedSubject.textContent =
      data.name;
  }


  if (subjectSelectorText) {

    subjectSelectorText.innerHTML = `
      <span class="subject-symbol">
        ${data.symbol}
      </span>

      <span>
        ${data.name}
      </span>

      <span class="selector-arrow">⌄</span>
    `;

  }


  document
    .querySelectorAll(".subject-option")
    .forEach(option => {

      option.classList.toggle(
        "active",
        option.dataset.subject === subject
      );

    });


  document
    .querySelectorAll(".subject-card")
    .forEach(card => {

      card.classList.toggle(
        "active",
        card.dataset.subject === subject
      );

    });


  if (subjectMenu) {
    subjectMenu.classList.remove("open");
  }

}


/* =========================================================
   SUBJECT MENU
========================================================= */

if (subjectSelectorText) {

  subjectSelectorText.addEventListener(
    "click",
    () => {

      if (subjectMenu) {
        subjectMenu.classList.toggle("open");
      }

    }
  );

}


document
  .querySelectorAll(".subject-option")
  .forEach(option => {

    option.addEventListener(
      "click",
      () => {

        setSubject(
          option.dataset.subject
        );

      }
    );

  });


document
  .querySelectorAll(".subject-card")
  .forEach(card => {

    card.addEventListener(
      "click",
      () => {

        setSubject(
          card.dataset.subject
        );

        if (problemInput) {
          problemInput.focus();
        }

      }
    );

  });


/* =========================================================
   CLOSE SUBJECT MENU
========================================================= */

document.addEventListener(
  "click",
  event => {

    if (
      subjectMenu &&
      subjectSelectorText &&
      !subjectMenu.contains(event.target) &&
      !subjectSelectorText.contains(event.target)
    ) {

      subjectMenu.classList.remove("open");

    }

  }
);


/* =========================================================
   API REQUEST
========================================================= */

async function solveProblem() {

  if (!problemInput || !solveBtn) {
    return;
  }


  const problem =
    problemInput.value.trim();


  if (!problem) {

    showToast(
      "Digite um problema primeiro."
    );

    problemInput.focus();

    return;
  }


  state.currentProblem =
    problem;


  showLoading(true);

  solveBtn.disabled = true;


  try {

    console.log(
      "EinsteinWeb → enviando problema:",
      problem
    );

    console.log(
      "EinsteinWeb → disciplina:",
      state.subject
    );


    const response =
      await fetch(
        "/api/solve",
        {

          method: "POST",

          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },

          body: JSON.stringify({

            problem,

            subject:
              state.subject

          })

        }
      );


    console.log(
      "EinsteinWeb → HTTP:",
      response.status
    );


    const rawText =
      await response.text();


    console.log(
      "EinsteinWeb → resposta:",
      rawText
    );


    let data;


    try {

      data =
        JSON.parse(rawText);

    } catch {

      throw new Error(
        "O servidor respondeu com um formato inválido."
      );

    }


    if (!response.ok || !data.success) {

      throw new Error(
        data.error ||
        `Erro do servidor (${response.status}).`
      );

    }


    if (
      !data.result ||
      typeof data.result !== "object"
    ) {

      throw new Error(
        "O servidor não devolveu uma solução válida."
      );

    }


    state.currentResult =
      data.result;


    addToHistory({

      problem,

      subject:
        state.subject,

      result:
        data.result

    });


    renderSolution(
      problem,
      state.subject,
      data.result
    );


    showPage("solution");


  } catch (error) {

    console.error(
      "EinsteinWeb solve error:",
      error
    );


    showToast(
      error.message ||
      "Não foi possível resolver o problema."
    );


  } finally {

    showLoading(false);

    solveBtn.disabled = false;

  }

}


/* =========================================================
   SOLVE BUTTON
========================================================= */

if (solveBtn) {

  solveBtn.addEventListener(
    "click",
    solveProblem
  );

}


/* =========================================================
   ENTER / CTRL+ENTER
========================================================= */

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


/* =========================================================
   RENDER SOLUTION
========================================================= */

function renderSolution(
  problem,
  subject,
  result
) {

  if (solutionProblem) {

    solutionProblem.textContent =
      problem;

  }


  if (solutionSubject) {

    solutionSubject.textContent =
      subjects[subject]?.name ||
      subject;

  }


  if (answerValue) {

    answerValue.textContent =
      result.answer ||
      "Resultado não disponível.";

  }


  renderSteps(
    result.steps || []
  );


  renderMethods(
    result.methods || []
  );


  renderGraph(
    result.graph
  );


  renderLearning(
    result.learning
  );


  resetTabs();

}


/* =========================================================
   STEPS
========================================================= */

function renderSteps(steps) {

  if (!stepsContainer) {
    return;
  }


  if (!Array.isArray(steps) || steps.length === 0) {

    stepsContainer.innerHTML = `
      <div class="empty-state">
        <p>Não foram fornecidos passos.</p>
      </div>
    `;

    return;
  }


  stepsContainer.innerHTML =
    steps
      .map((step, index) => {

        return `
          <div class="step-card">

            <div class="step-number">
              ${index + 1}
            </div>

            <div class="step-content">

              <h3>
                ${escapeHTML(
                  step.title ||
                  `Passo ${index + 1}`
                )}
              </h3>

              ${
                step.description
                  ? `
                    <p>
                      ${escapeHTML(
                        step.description
                      )}
                    </p>
                  `
                  : ""
              }

              ${
                step.formula
                  ? `
                    <div class="formula">
                      ${escapeHTML(
                        step.formula
                      )}
                    </div>
                  `
                  : ""
              }

            </div>

          </div>
        `;

      })
      .join("");

}


/* =========================================================
   METHODS
========================================================= */

function renderMethods(methods) {

  if (!methodsContainer) {
    return;
  }


  if (!Array.isArray(methods) || methods.length === 0) {

    methodsContainer.innerHTML = `
      <div class="empty-state">
        <p>Nenhum método adicional disponível.</p>
      </div>
    `;

    return;
  }


  methodsContainer.innerHTML =
    methods
      .map(method => {

        return `
          <div class="method-card">

            <div class="method-content">

              <h3>
                ${escapeHTML(
                  method.name ||
                  "Método"
                )}
              </h3>

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

              ${
                method.result
                  ? `
                    <div class="formula">
                      ${escapeHTML(
                        method.result
                      )}
                    </div>
                  `
                  : ""
              }

            </div>

          </div>
        `;

      })
      .join("");

}


/* =========================================================
   GRAPH
========================================================= */

function renderGraph(graph) {

  if (!graphContainer) {
    return;
  }


  if (
    !graph ||
    !Array.isArray(graph.points) ||
    graph.points.length === 0
  ) {

    graphContainer.innerHTML = `
      <div class="graph-empty">

        <div>📈</div>

        <p>
          O gráfico será mostrado aqui quando o problema
          tiver uma representação visual.
        </p>

      </div>
    `;

    return;
  }


  /*
    Não dependemos de nenhuma biblioteca externa.
    Criamos uma representação simples dos pontos.
  */

  const points =
    graph.points;


  const xs =
    points.map(p => Number(p.x));

  const ys =
    points.map(p => Number(p.y));


  const minX =
    Math.min(...xs);

  const maxX =
    Math.max(...xs);

  const minY =
    Math.min(...ys);

  const maxY =
    Math.max(...ys);


  const width = 700;
  const height = 350;

  const padding = 35;


  function mapX(x) {

    if (maxX === minX) {
      return width / 2;
    }

    return padding +
      ((x - minX) /
      (maxX - minX)) *
      (width - padding * 2);

  }


  function mapY(y) {

    if (maxY === minY) {
      return height / 2;
    }

    return height -
      padding -
      ((y - minY) /
      (maxY - minY)) *
      (height - padding * 2);

  }


  const pathData =
    points
      .map((point, index) => {

        const x =
          mapX(Number(point.x));

        const y =
          mapY(Number(point.y));

        return `${index === 0 ? "M" : "L"} ${x} ${y}`;

      })
      .join(" ");


  const zeroY =
    minY <= 0 && maxY >= 0
      ? mapY(0)
      : null;


  const zeroX =
    minX <= 0 && maxX >= 0
      ? mapX(0)
      : null;


  graphContainer.innerHTML = `

    <div class="graph-wrapper">

      <svg
        viewBox="0 0 ${width} ${height}"
        class="einstein-graph"
        preserveAspectRatio="none"
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

      </svg>

      <div class="graph-info">
        ${escapeHTML(
          graph.type ||
          "gráfico"
        )}
      </div>

    </div>

  `;

}


/* =========================================================
   LEARNING
========================================================= */

function renderLearning(learning) {

  if (!learningContainer) {
    return;
  }


  if (!learning) {

    learningContainer.innerHTML = `
      <div class="empty-state">
        <p>Não há explicação adicional.</p>
      </div>
    `;

    return;
  }


  learningContainer.innerHTML = `

    ${
      learning.concept
        ? `
          <div class="learning-card">

            <h3>Conceito</h3>

            <p>
              ${escapeHTML(
                learning.concept
              )}
            </p>

          </div>
        `
        : ""
    }


    ${
      learning.explanation
        ? `
          <div class="learning-card">

            <h3>Explicação</h3>

            <p>
              ${escapeHTML(
                learning.explanation
              )}
            </p>

          </div>
        `
        : ""
    }


    ${
      learning.tip
        ? `
          <div class="learning-card">

            <h3>Dica</h3>

            <p>
              ${escapeHTML(
                learning.tip
              )}
            </p>

          </div>
        `
        : ""
    }

  `;

}


/* =========================================================
   TABS
========================================================= */

function resetTabs() {

  document
    .querySelectorAll(".solution-tab")
    .forEach(tab => {

      tab.classList.toggle(
        "active",
        tab.dataset.tab === "solution"
      );

    });


  document
    .querySelectorAll(".solution-tab-content")
    .forEach(content => {

      content.classList.remove("active");

    });


  const solutionTab =
    $("solutionTab");

  if (solutionTab) {
    solutionTab.classList.add("active");
  }

}


document
  .querySelectorAll(".solution-tab")
  .forEach(tab => {

    tab.addEventListener(
      "click",
      () => {

        const target =
          tab.dataset.tab;


        document
          .querySelectorAll(".solution-tab")
          .forEach(item => {

            item.classList.toggle(
              "active",
              item === tab
            );

          });


        document
          .querySelectorAll(".solution-tab-content")
          .forEach(content => {

            content.classList.remove(
              "active"
            );

          });


        const targetElement =
          $(`${target}Tab`);

        if (targetElement) {

          targetElement.classList.add(
            "active"
          );

        }

      }
    );

  });


/* =========================================================
   HISTORY
========================================================= */

function addToHistory(item) {

  const entry = {

    id:
      Date.now(),

    problem:
      item.problem,

    subject:
      item.subject,

    result:
      item.result,

    createdAt:
      new Date().toISOString()

  };


  state.history =
    [
      entry,
      ...state.history
    ].slice(0, 50);


  saveHistory();

  renderRecent();

}


function renderRecent() {

  if (!recentList) {
    return;
  }


  if (state.history.length === 0) {

    recentList.innerHTML = `
      <div class="empty-state">

        <span>◷</span>

        <p>
          Os seus problemas recentes aparecerão aqui.
        </p>

      </div>
    `;

    return;
  }


  recentList.innerHTML =
    state.history
      .slice(0, 5)
      .map(item => {

        return `
          <button
            class="recent-item"
            type="button"
            data-history-id="${item.id}"
          >

            <div>

              <strong>
                ${escapeHTML(
                  item.problem
                )}
              </strong>

              <small>
                ${
                  subjects[item.subject]?.name ||
                  item.subject
                }
              </small>

            </div>

            <span>→</span>

          </button>
        `;

      })
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
              entry =>
                String(entry.id) ===
                button.dataset.historyId
            );


          if (!item) {
            return;
          }


          state.currentProblem =
            item.problem;

          state.currentResult =
            item.result;


          if (problemInput) {
            problemInput.value =
              item.problem;
          }


          setSubject(
            item.subject
          );


          renderSolution(
            item.problem,
            item.subject,
            item.result
          );


          showPage("solution");

        }
      );

    });

}


function renderHistory() {

  if (!historyContainer) {
    return;
  }


  if (state.history.length === 0) {

    historyContainer.innerHTML = `
      <div class="empty-state large">

        <span>◷</span>

        <p>
          Ainda não tens problemas no histórico.
        </p>

      </div>
    `;

    return;
  }


  historyContainer.innerHTML =
    state.history
      .map(item => {

        return `
          <div
            class="history-item"
            data-history-id="${item.id}"
          >

            <div>

              <span class="history-subject">
                ${
                  subjects[item.subject]?.name ||
                  item.subject
                }
              </span>

              <h3>
                ${escapeHTML(
                  item.problem
                )}
              </h3>

              <p>
                ${
                  escapeHTML(
                    item.result?.answer ||
                    ""
                  )
                }
              </p>

            </div>

            <button
              type="button"
              class="history-open-btn"
            >
              Abrir →
            </button>

          </div>
        `;

      })
      .join("");


  historyContainer
    .querySelectorAll(
      ".history-item"
    )
    .forEach(itemElement => {

      const id =
        Number(
          itemElement.dataset.historyId
        );


      const item =
        state.history.find(
          entry => entry.id === id
        );


      const button =
        itemElement.querySelector(
          ".history-open-btn"
        );


      if (button && item) {

        button.addEventListener(
          "click",
          () => {

            if (problemInput) {
              problemInput.value =
                item.problem;
            }


            setSubject(
              item.subject
            );


            renderSolution(
              item.problem,
              item.subject,
              item.result
            );


            showPage("solution");

          }
        );

      }

    });

}


/* =========================================================
   FAVORITES
========================================================= */

function isFavorite(problem) {

  return state.favorites.some(
    item =>
      item.problem === problem
  );

}


function toggleFavorite() {

  if (!state.currentProblem) {
    return;
  }


  const index =
    state.favorites.findIndex(
      item =>
        item.problem ===
        state.currentProblem
    );


  if (index >= 0) {

    state.favorites.splice(
      index,
      1
    );

    showToast(
      "Removido dos favoritos."
    );

  } else {

    state.favorites.unshift({

      id:
        Date.now(),

      problem:
        state.currentProblem,

      subject:
        state.subject,

      result:
        state.currentResult

    });

    showToast(
      "Adicionado aos favoritos."
    );

  }


  saveFavorites();

  updateFavoriteButton();

  renderFavorites();

}


function updateFavoriteButton() {

  const button =
    $("favoriteBtn");

  if (!button) {
    return;
  }


  if (
    isFavorite(
      state.currentProblem
    )
  ) {

    button.textContent = "★";

  } else {

    button.textContent = "☆";

  }

}


function renderFavorites() {

  if (!favoritesContainer) {
    return;
  }


  if (state.favorites.length === 0) {

    favoritesContainer.innerHTML = `
      <div class="empty-state large">

        <span>☆</span>

        <p>
          Ainda não tens problemas favoritos.
        </p>

      </div>
    `;

    return;
  }


  favoritesContainer.innerHTML =
    state.favorites
      .map(item => {

        return `
          <div class="history-item">

            <div>

              <span class="history-subject">
                ${
                  subjects[item.subject]?.name ||
                  item.subject
                }
              </span>

              <h3>
                ${escapeHTML(
                  item.problem
                )}
              </h3>

              <p>
                ${
                  escapeHTML(
                    item.result?.answer ||
                    ""
                  )
                }
              </p>

            </div>

            <button
              type="button"
              class="history-open-btn favorite-open"
              data-favorite-id="${item.id}"
            >
              Abrir →
            </button>

          </div>
        `;

      })
      .join("");


  favoritesContainer
    .querySelectorAll(
      ".favorite-open"
    )
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          const id =
            Number(
              button.dataset.favoriteId
            );


          const item =
            state.favorites.find(
              entry =>
                entry.id === id
            );


          if (!item) {
            return;
          }


          if (problemInput) {
            problemInput.value =
              item.problem;
          }


          setSubject(
            item.subject
          );


          state.currentProblem =
            item.problem;

          state.currentResult =
            item.result;


          renderSolution(
            item.problem,
            item.subject,
            item.result
          );


          showPage("solution");

        }
      );

    });

}


const favoriteBtn =
  $("favoriteBtn");


if (favoriteBtn) {

  favoriteBtn.addEventListener(
    "click",
    toggleFavorite
  );

}


/* =========================================================
   BACK BUTTON
========================================================= */

const backBtn =
  $("backBtn");


if (backBtn) {

  backBtn.addEventListener(
    "click",
    () => {

      showPage("home");

    }
  );

}


/* =========================================================
   NEW PROBLEM
========================================================= */

function newProblem() {

  if (problemInput) {
    problemInput.value = "";
  }


  state.currentProblem = "";
  state.currentResult = null;


  showPage("home");


  setTimeout(() => {

    if (problemInput) {
      problemInput.focus();
    }

  }, 100);

}


const newProblemBtn =
  $("newProblemBtn");


if (newProblemBtn) {

  newProblemBtn.addEventListener(
    "click",
    newProblem
  );

}


const historyNewProblem =
  $("historyNewProblem");


if (historyNewProblem) {

  historyNewProblem.addEventListener(
    "click",
    newProblem
  );

}


const typeCard =
  $("typeCard");


if (typeCard) {

  typeCard.addEventListener(
    "click",
    () => {

      if (problemInput) {
        problemInput.focus();
      }

    }
  );

}


/* =========================================================
   HISTORY NAVIGATION
========================================================= */

document
  .querySelectorAll(".nav-item")
  .forEach(item => {

    item.addEventListener(
      "click",
      () => {

        showPage(
          item.dataset.page
        );

      }
    );

  });


const viewHistory =
  $("viewHistory");


if (viewHistory) {

  viewHistory.addEventListener(
    "click",
    () => {

      showPage("history");

    }
  );

}


/* =========================================================
   IMAGE INPUT
========================================================= */

const imageBtn =
  $("imageBtn");

const imageInput =
  $("imageInput");

const imagePreview =
  $("imagePreview");

const scanCard =
  $("scanCard");


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
    () => {

      const file =
        imageInput.files?.[0];


      if (!file) {
        return;
      }


      if (!file.type.startsWith("image/")) {

        showToast(
          "Seleciona uma imagem válida."
        );

        return;
      }


      const reader =
        new FileReader();


      reader.onload =
        event => {

          if (!imagePreview) {
            return;
          }


          imagePreview.innerHTML = `

            <img
              src="${event.target.result}"
              alt="Imagem do problema"
            >

          `;


          imagePreview.classList.remove(
            "hidden"
          );

        };


      reader.readAsDataURL(file);

    }
  );

}


/* =========================================================
   VOICE INPUT
========================================================= */

const voiceBtn =
  $("voiceBtn");


if (voiceBtn) {

  voiceBtn.addEventListener(
    "click",
    () => {

      const SpeechRecognition =
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;


      if (!SpeechRecognition) {

        showToast(
          "O reconhecimento de voz não é suportado neste navegador."
        );

        return;

      }


      const recognition =
        new SpeechRecognition();


      recognition.lang =
        "pt-PT";


      recognition.interimResults =
        false;


      recognition.continuous =
        false;


      voiceBtn.classList.add(
        "recording"
      );


      recognition.start();


      recognition.onresult =
        event => {

          const transcript =
            event.results[0][0].transcript;


          if (problemInput) {

            problemInput.value =
              problemInput.value
                ? `${problemInput.value} ${transcript}`
                : transcript;

          }

        };


      recognition.onerror =
        error => {

          console.error(
            "Voice error:",
            error
          );

          showToast(
            "Não foi possível reconhecer a voz."
          );

        };


      recognition.onend =
        () => {

          voiceBtn.classList.remove(
            "recording"
          );

        };

    }
  );

}


/* =========================================================
   API STATUS
========================================================= */

async function checkAPI() {

  try {

    const response =
      await fetch(
        "/api/status"
      );


    if (!response.ok) {
      throw new Error("API offline");
    }


    const data =
      await response.json();


    console.log(
      "EinsteinWeb API:",
      data
    );


  } catch (error) {

    console.warn(
      "EinsteinWeb API status error:",
      error
    );

  }

}


/* =========================================================
   INITIALIZATION
========================================================= */

function initialize() {

  console.log(
    "========================================"
  );

  console.log(
    "EinsteinWeb Frontend V0.4"
  );

  console.log(
    "Frontend carregado."
  );

  console.log(
    "API:",
    "/api/solve"
  );

  console.log(
    "========================================"
  );


  setSubject("math");

  renderRecent();

  renderHistory();

  renderFavorites();

  checkAPI();

}


initialize();
```
