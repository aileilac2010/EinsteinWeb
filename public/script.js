/* =========================================================
   EINSTEINWEB V0.4
   Frontend
========================================================= */

const state = {
  subject: "math",
  currentResult: null,
  currentProblem: "",
  history: JSON.parse(localStorage.getItem("einsteinHistory") || "[]"),
  favorites: JSON.parse(localStorage.getItem("einsteinFavorites") || "[]")
};


/* =========================================================
   DOM
========================================================= */

const $ = (id) => document.getElementById(id);

const sidebar = $("sidebar");
const mobileMenu = $("mobileMenu");

const homePage = $("homePage");
const solutionPage = $("solutionPage");
const historyPage = $("historyPage");
const favoritesPage = $("favoritesPage");

const problemInput = $("problemInput");
const solveBtn = $("solveBtn");

const subjectSelector = $("subjectSelector");
const subjectSelectorText = $("subjectSelectorText");
const selectedSubject = $("selectedSubject");
const subjectMenu = $("subjectMenu");

const imageBtn = $("imageBtn");
const imageInput = $("imageInput");
const imagePreview = $("imagePreview");

const loadingOverlay = $("loadingOverlay");

const toast = $("toast");
const toastText = $("toastText");


/* =========================================================
   SUBJECTS
========================================================= */

const SUBJECTS = {
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

  if (!SUBJECTS[subject]) {
    subject = "math";
  }

  state.subject = subject;

  const data = SUBJECTS[subject];

  subjectSelectorText.innerHTML = `
    <span class="subject-symbol">${data.symbol}</span>
    <span>${data.name}</span>
    <span class="selector-arrow">⌄</span>
  `;

  selectedSubject.textContent = data.name;

  document.querySelectorAll(".subject-option").forEach(button => {
    button.classList.toggle(
      "active",
      button.dataset.subject === subject
    );
  });

  subjectSelector.classList.remove("open");
}


/* =========================================================
   PAGE NAVIGATION
========================================================= */

function showPage(pageName) {

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active-page");
  });

  const pageMap = {
    home: homePage,
    solution: solutionPage,
    history: historyPage,
    favorites: favoritesPage
  };

  if (pageMap[pageName]) {
    pageMap[pageName].classList.add("active-page");
  }

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle(
      "active",
      item.dataset.page === pageName
    );
  });

  sidebar?.classList.remove("open");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================================
   SIDEBAR
========================================================= */

mobileMenu?.addEventListener("click", () => {
  sidebar.classList.toggle("open");
});


document.querySelectorAll(".nav-item").forEach(item => {

  item.addEventListener("click", () => {

    const page = item.dataset.page;

    if (page === "home") {
      showPage("home");
    }

    if (page === "history") {
      renderHistory();
      showPage("history");
    }

    if (page === "favorites") {
      renderFavorites();
      showPage("favorites");
    }

  });

});


/* =========================================================
   NEW PROBLEM
========================================================= */

$("newProblemBtn")?.addEventListener("click", newProblem);
$("historyNewProblem")?.addEventListener("click", newProblem);


function newProblem() {

  state.currentResult = null;
  state.currentProblem = "";

  problemInput.value = "";

  imagePreview.innerHTML = "";
  imagePreview.classList.add("hidden");

  $("answerValue").textContent = "—";
  $("stepsContainer").innerHTML = "";
  $("methodsContainer").innerHTML = "";
  $("learningContainer").innerHTML = "";

  resetGraph();

  showPage("home");

  setTimeout(() => {
    problemInput.focus();
  }, 100);
}


/* =========================================================
   SUBJECT SELECTOR
========================================================= */

subjectSelectorText?.addEventListener("click", (event) => {

  event.stopPropagation();

  subjectSelector.classList.toggle("open");

});


document.querySelectorAll(".subject-option").forEach(button => {

  button.addEventListener("click", () => {

    setSubject(button.dataset.subject);

  });

});


document.querySelectorAll(".subject-card").forEach(button => {

  button.addEventListener("click", () => {

    setSubject(button.dataset.subject);

    problemInput.focus();

    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });

  });

});


document.addEventListener("click", (event) => {

  if (
    subjectSelector &&
    !subjectSelector.contains(event.target)
  ) {
    subjectSelector.classList.remove("open");
  }

});


/* =========================================================
   IMAGE INPUT
========================================================= */

imageBtn?.addEventListener("click", () => {
  imageInput.click();
});

$("scanCard")?.addEventListener("click", () => {
  imageInput.click();
});


imageInput?.addEventListener("change", () => {

  const file = imageInput.files?.[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    showToast("Escolhe uma imagem válida.");
    return;
  }

  const reader = new FileReader();

  reader.onload = () => {

    imagePreview.innerHTML = `
      <img src="${reader.result}" alt="Imagem do problema">
    `;

    imagePreview.classList.remove("hidden");

    showToast(
      "Imagem carregada. A leitura automática por OCR será adicionada numa próxima versão."
    );

  };

  reader.readAsDataURL(file);

});


/* =========================================================
   TYPE CARD
========================================================= */

$("typeCard")?.addEventListener("click", () => {

  problemInput.focus();

  problemInput.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

});


/* =========================================================
   SOLVE
========================================================= */

solveBtn?.addEventListener("click", solveProblem);


problemInput?.addEventListener("keydown", event => {

  if (
    event.key === "Enter" &&
    (event.ctrlKey || event.metaKey)
  ) {
    solveProblem();
  }

});


async function solveProblem() {

  const problem = problemInput.value.trim();

  if (!problem) {

    showToast("Escreve um problema primeiro.");

    problemInput.focus();

    return;
  }


  setLoading(true);


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


    if (!response.ok || !data.success) {

      throw new Error(
        data.error ||
        "Não foi possível encontrar o problema."
      );

    }


    state.currentProblem = problem;
    state.currentResult = data.result;


    addHistory({
      problem,
      subject: state.subject,
      result: data.result,
      timestamp: Date.now()
    });


    renderSolution(
      problem,
      state.subject,
      data.result
    );


    showPage("solution");

  } catch (error) {

    console.error("EinsteinWeb solve error:", error);

    showToast(
      error.message ||
      "Não foi possível resolver o problema."
    );

  } finally {

    setLoading(false);

  }

}


/* =========================================================
   RENDER SOLUTION
========================================================= */

function renderSolution(problem, subject, result) {

  $("solutionSubject").textContent =
    SUBJECTS[subject]?.name || subject;

  $("solutionProblem").textContent = problem;

  $("answerValue").textContent =
    result?.answer ?? "Sem resposta";

  renderSteps(result);
  renderMethods(result);
  renderGraph(result);
  renderLearning(result);

  updateFavoriteButton(problem);

  activateTab("solution");
}


/* =========================================================
   STEPS
========================================================= */

function renderSteps(result) {

  const container = $("stepsContainer");

  container.innerHTML = "";


  const steps = Array.isArray(result?.steps)
    ? result.steps
    : [];


  if (!steps.length) {

    container.innerHTML = `
      <div class="empty-state">
        <span>?</span>
        <p>
          O motor encontrou uma resposta,
          mas ainda não possui uma explicação detalhada
          para este tipo de problema.
        </p>
      </div>
    `;

    return;
  }


  steps.forEach((step, index) => {

    const card = document.createElement("div");

    card.className = "step-card";


    const number = document.createElement("div");

    number.className = "step-number";

    number.textContent = index + 1;


    const content = document.createElement("div");

    content.className = "step-content";


    const title = document.createElement("strong");

    title.textContent =
      step.title ||
      `Passo ${index + 1}`;


    const description = document.createElement("p");

    description.textContent =
      step.description ||
      step.text ||
      "";


    content.appendChild(title);

    content.appendChild(description);


    if (step.formula) {

      const formula = document.createElement("code");

      formula.className = "formula";

      formula.textContent = step.formula;

      content.appendChild(formula);

    }


    card.appendChild(number);
    card.appendChild(content);

    container.appendChild(card);

  });

}


/* =========================================================
   METHODS
========================================================= */

function renderMethods(result) {

  const container = $("methodsContainer");

  container.innerHTML = "";


  const methods = Array.isArray(result?.methods)
    ? result.methods
    : [];


  if (!methods.length) {

    container.innerHTML = `
      <div class="empty-state">
        <span>∑</span>
        <p>
          Ainda não existem métodos alternativos
          para este tipo de problema.
        </p>
      </div>
    `;

    return;
  }


  methods.forEach(method => {

    const card = document.createElement("div");

    card.className = "method-card";


    const title = document.createElement("h3");

    title.textContent =
      method.name ||
      "Método";


    const description = document.createElement("p");

    description.textContent =
      method.description ||
      "";


    card.appendChild(title);
    card.appendChild(description);


    if (method.result) {

      const result = document.createElement("div");

      result.className = "method-result";

      result.textContent =
        `Resultado: ${method.result}`;

      card.appendChild(result);

    }


    container.appendChild(card);

  });

}


/* =========================================================
   GRAPH
========================================================= */

function resetGraph() {

  $("graphContainer").innerHTML = `
    <div class="graph-empty">
      <div>📈</div>
      <p>
        O gráfico será mostrado aqui quando o problema
        tiver uma representação visual.
      </p>
    </div>
  `;

}


function renderGraph(result) {

  const container = $("graphContainer");

  container.innerHTML = "";


  if (
    !result?.graph ||
    !Array.isArray(result.graph.points) ||
    result.graph.points.length < 2
  ) {

    resetGraph();

    return;
  }


  const points = result.graph.points;

  const width = 760;
  const height = 400;

  const padding = 50;


  const xs = points.map(point => Number(point.x));
  const ys = points.map(point => Number(point.y));


  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);

  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);


  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;


  function mapX(x) {

    return padding +
      ((x - minX) / rangeX) *
      (width - padding * 2);

  }


  function mapY(y) {

    return height -
      padding -
      ((y - minY) / rangeY) *
      (height - padding * 2);

  }


  let path = "";

  points.forEach((point, index) => {

    const x = mapX(point.x);
    const y = mapY(point.y);

    path +=
      `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)} `;

  });


  const zeroX =
    minX <= 0 && maxX >= 0
      ? mapX(0)
      : padding;


  const zeroY =
    minY <= 0 && maxY >= 0
      ? mapY(0)
      : height - padding;


  const svg = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "svg"
  );


  svg.setAttribute("viewBox", `0 0 ${width} ${height}`);

  svg.classList.add("graph-svg");


  svg.innerHTML = `
    <rect
      x="0"
      y="0"
      width="${width}"
      height="${height}"
      rx="12"
      fill="#0c0c0c"
    />

    <line
      x1="${padding}"
      y1="${zeroY}"
      x2="${width - padding}"
      y2="${zeroY}"
      stroke="#303030"
      stroke-width="1"
    />

    <line
      x1="${zeroX}"
      y1="${padding}"
      x2="${zeroX}"
      y2="${height - padding}"
      stroke="#303030"
      stroke-width="1"
    />

    <path
      d="${path}"
      fill="none"
      stroke="#ffffff"
      stroke-width="3"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  `;


  container.appendChild(svg);

}


/* =========================================================
   LEARNING
========================================================= */

function renderLearning(result) {

  const container = $("learningContainer");

  container.innerHTML = "";


  const learning = result?.learning;


  if (!learning) {

    container.innerHTML = `
      <div class="empty-state">
        <span>?</span>
        <p>
          Ainda não existe conteúdo educativo adicional
          para este problema.
        </p>
      </div>
    `;

    return;
  }


  if (learning.concept) {

    addLearningCard(
      container,
      "Conceito",
      learning.concept
    );

  }


  if (learning.explanation) {

    addLearningCard(
      container,
      "Por que fazemos isto?",
      learning.explanation
    );

  }


  if (learning.tip) {

    addLearningCard(
      container,
      "Dica",
      learning.tip
    );

  }

}


function addLearningCard(container, title, text) {

  const card = document.createElement("div");

  card.className = "learning-card";


  const heading = document.createElement("h3");

  heading.textContent = title;


  const paragraph = document.createElement("p");

  paragraph.textContent = text;


  card.appendChild(heading);

  card.appendChild(paragraph);

  container.appendChild(card);

}


/* =========================================================
   TABS
========================================================= */

document.querySelectorAll(".solution-tab").forEach(button => {

  button.addEventListener("click", () => {

    activateTab(button.dataset.tab);

  });

});


function activateTab(tabName) {

  document.querySelectorAll(".solution-tab").forEach(button => {

    button.classList.toggle(
      "active",
      button.dataset.tab === tabName
    );

  });


  const tabMap = {
    solution: $("solutionTab"),
    methods: $("methodsTab"),
    graph: $("graphTab"),
    learn: $("learnTab")
  };


  Object.values(tabMap).forEach(tab => {

    tab?.classList.remove("active");

  });


  tabMap[tabName]?.classList.add("active");

}


/* =========================================================
   BACK
========================================================= */

$("backBtn")?.addEventListener("click", () => {
  showPage("home");
});


/* =========================================================
   HISTORY
========================================================= */

function saveHistory() {

  localStorage.setItem(
    "einsteinHistory",
    JSON.stringify(state.history)
  );

}


function addHistory(item) {

  state.history.unshift(item);

  state.history =
    state.history.slice(0, 50);

  saveHistory();

  renderRecent();

}


function renderRecent() {

  const container = $("recentList");

  if (!container) {
    return;
  }


  if (!state.history.length) {

    container.innerHTML = `
      <div class="empty-state">
        <span>◷</span>
        <p>
          Os seus problemas recentes aparecerão aqui.
        </p>
      </div>
    `;

    return;
  }


  container.innerHTML = "";


  state.history
    .slice(0, 5)
    .forEach((item, index) => {

      container.appendChild(
        createHistoryItem(item, index)
      );

    });

}


function renderHistory() {

  const container = $("historyContainer");

  if (!container) {
    return;
  }


  if (!state.history.length) {

    container.innerHTML = `
      <div class="empty-state large">
        <span>◷</span>
        <p>
          Ainda não resolveste nenhum problema.
        </p>
      </div>
    `;

    return;
  }


  container.innerHTML = "";


  state.history.forEach((item, index) => {

    container.appendChild(
      createHistoryItem(item, index)
    );

  });

}


function createHistoryItem(item) {

  const div = document.createElement("div");

  div.className = "history-item";


  const subject = SUBJECTS[item.subject] ||
    SUBJECTS.math;


  div.innerHTML = `
    <div class="history-subject">
      ${subject.symbol}
    </div>

    <div class="history-content">

      <strong></strong>

      <span>
        ${subject.name}
        •
        ${formatDate(item.timestamp)}
      </span>

    </div>

    <div class="history-arrow">
      →
    </div>
  `;


  div.querySelector("strong").textContent =
    item.problem;


  div.addEventListener("click", () => {

    state.currentProblem = item.problem;
    state.currentResult = item.result;
    state.subject = item.subject;

    renderSolution(
      item.problem,
      item.subject,
      item.result
    );

    showPage("solution");

  });


  return div;

}


$("viewHistory")?.addEventListener("click", () => {

  renderHistory();

  showPage("history");

});


function formatDate(timestamp) {

  if (!timestamp) {
    return "agora";
  }

  const date = new Date(timestamp);

  return date.toLocaleDateString(
    "pt-PT",
    {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    }
  );

}


/* =========================================================
   FAVORITES
========================================================= */

function saveFavorites() {

  localStorage.setItem(
    "einsteinFavorites",
    JSON.stringify(state.favorites)
  );

}


$("favoriteBtn")?.addEventListener("click", () => {

  if (!state.currentProblem) {
    return;
  }


  const existingIndex =
    state.favorites.findIndex(
      item =>
        item.problem === state.currentProblem
    );


  if (existingIndex >= 0) {

    state.favorites.splice(existingIndex, 1);

    showToast("Removido dos favoritos.");

  } else {

    state.favorites.unshift({

      problem: state.currentProblem,

      subject: state.subject,

      result: state.currentResult,

      timestamp: Date.now()

    });

    showToast("Adicionado aos favoritos.");

  }


  saveFavorites();

  updateFavoriteButton(
    state.currentProblem
  );

});


function updateFavoriteButton(problem) {

  const exists =
    state.favorites.some(
      item => item.problem === problem
    );


  const button = $("favoriteBtn");

  if (!button) {
    return;
  }


  button.textContent =
    exists ? "★" : "☆";


  button.classList.toggle(
    "saved",
    exists
  );

}


function renderFavorites() {

  const container =
    $("favoritesContainer");


  if (!container) {
    return;
  }


  if (!state.favorites.length) {

    container.innerHTML = `
      <div class="empty-state large">
        <span>☆</span>
        <p>
          Ainda não tens problemas favoritos.
        </p>
      </div>
    `;

    return;
  }


  container.innerHTML = "";


  state.favorites.forEach(item => {

    container.appendChild(
      createHistoryItem(item)
    );

  });

}


/* =========================================================
   LOADING
========================================================= */

function setLoading(value) {

  loadingOverlay.classList.toggle(
    "hidden",
    !value
  );

  solveBtn.disabled = value;

}


/* =========================================================
   TOAST
========================================================= */

let toastTimer = null;


function showToast(message) {

  toastText.textContent = message;

  toast.classList.add("show");


  clearTimeout(toastTimer);


  toastTimer = setTimeout(() => {

    toast.classList.remove("show");

  }, 3500);

}


/* =========================================================
   VOICE
========================================================= */

$("voiceBtn")?.addEventListener("click", () => {

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


  recognition.lang = "pt-PT";

  recognition.interimResults = false;

  recognition.maxAlternatives = 1;


  showToast("A ouvir...");


  recognition.start();


  recognition.onresult = event => {

    const text =
      event.results[0][0].transcript;


    problemInput.value =
      problemInput.value
        ? `${problemInput.value} ${text}`
        : text;

  };


  recognition.onerror = () => {

    showToast(
      "Não foi possível utilizar o microfone."
    );

  };

});


/* =========================================================
   INITIALIZATION
========================================================= */

setSubject("math");

renderRecent();

renderHistory();

renderFavorites();

showPage("home");


/* =========================================================
   STATUS CHECK
========================================================= */

async function checkServer() {

  try {

    const response =
      await fetch("/api/status");

    if (!response.ok) {
      throw new Error();
    }

    const data =
      await response.json();

    console.log(
      "EinsteinWeb:",
      data
    );

  } catch (error) {

    console.warn(
      "EinsteinWeb server status unavailable."
    );

  }

}


checkServer();
