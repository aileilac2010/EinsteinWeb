const state = {
  subject: "math",
  subjectName: "Matemática",
  currentProblem: "",
  history: JSON.parse(localStorage.getItem("einsteinweb_history") || "[]")
};


// ELEMENTS

const problemInput = document.getElementById("problemInput");
const solveBtn = document.getElementById("solveBtn");
const loadingOverlay = document.getElementById("loadingOverlay");

const subjectSelector = document.getElementById("subjectSelector");
const subjectMenu = document.getElementById("subjectMenu");
const subjectSelectorText = document.getElementById("subjectSelectorText");

const selectedSubject = document.getElementById("selectedSubject");

const imageBtn = document.getElementById("imageBtn");
const imageInput = document.getElementById("imageInput");
const imagePreview = document.getElementById("imagePreview");

const sidebar = document.getElementById("sidebar");
const mobileMenu = document.getElementById("mobileMenu");

const solutionProblem = document.getElementById("solutionProblem");
const solutionSubject = document.getElementById("solutionSubject");
const stepsContainer = document.getElementById("stepsContainer");
const methodsContainer = document.getElementById("methodsContainer");

const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");


// SUBJECT DATA

const subjects = {
  math: {
    name: "Matemática",
    colorClass: "math-dot"
  },

  physics: {
    name: "Física",
    colorClass: "physics-dot"
  },

  chemistry: {
    name: "Química",
    colorClass: "chemistry-dot"
  }
};


// PAGE NAVIGATION

function showPage(pageName) {

  document.querySelectorAll(".page").forEach(page => {
    page.classList.remove("active-page");
  });

  const page = document.getElementById(`${pageName}Page`);

  if (page) {
    page.classList.add("active-page");
  }

  document.querySelectorAll(".nav-item[data-page]").forEach(item => {
    item.classList.remove("active");

    if (item.dataset.page === pageName) {
      item.classList.add("active");
    }
  });

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  sidebar.classList.remove("open");
}


// NAV BUTTONS

document.querySelectorAll(".nav-item[data-page]").forEach(button => {

  button.addEventListener("click", () => {

    showPage(button.dataset.page);

  });

});


// MOBILE MENU

mobileMenu.addEventListener("click", () => {

  sidebar.classList.toggle("open");

});


// NEW PROBLEM

document.getElementById("newProblemBtn").addEventListener("click", () => {

  showPage("home");

  problemInput.value = "";

  problemInput.focus();

});


// HISTORY NEW PROBLEM

document.getElementById("historyNewProblem").addEventListener("click", () => {

  showPage("home");

  setTimeout(() => {
    problemInput.focus();
  }, 200);

});


// SUBJECT SELECTOR

subjectSelector.addEventListener("click", event => {

  event.stopPropagation();

  subjectMenu.classList.toggle("open");

});


document.addEventListener("click", event => {

  if (
    !subjectMenu.contains(event.target) &&
    !subjectSelector.contains(event.target)
  ) {
    subjectMenu.classList.remove("open");
  }

});


// SELECT SUBJECT

function setSubject(subject) {

  if (!subjects[subject]) {
    return;
  }

  state.subject = subject;
  state.subjectName = subjects[subject].name;

  subjectSelectorText.textContent = state.subjectName;

  selectedSubject.innerHTML = `
    <span class="subject-dot ${subjects[subject].colorClass}"></span>
    ${state.subjectName}
  `;

  subjectMenu.classList.remove("open");

  showToast(`${state.subjectName} selecionada`);

}


document.querySelectorAll("[data-subject]").forEach(button => {

  button.addEventListener("click", () => {

    const subject = button.dataset.subject;

    setSubject(subject);

  });

});


// IMAGE UPLOAD

imageBtn.addEventListener("click", () => {

  imageInput.click();

});


document.getElementById("scanCard").addEventListener("click", () => {

  imageInput.click();

});


imageInput.addEventListener("change", event => {

  const file = event.target.files[0];

  if (!file) {
    return;
  }

  if (!file.type.startsWith("image/")) {
    showToast("Escolha uma imagem válida.");
    return;
  }

  const reader = new FileReader();

  reader.onload = e => {

    imagePreview.innerHTML = `
      <img src="${e.target.result}" alt="Imagem do problema">
    `;

    imagePreview.classList.add("visible");

    showToast("Imagem carregada. OCR será conectado em breve.");

  };

  reader.readAsDataURL(file);

});


// TYPE CARD

document.getElementById("typeCard").addEventListener("click", () => {

  problemInput.focus();

  problemInput.scrollIntoView({
    behavior: "smooth",
    block: "center"
  });

});


// SOLVE

solveBtn.addEventListener("click", solveProblem);


problemInput.addEventListener("keydown", event => {

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

    showToast("Digite um problema primeiro.");

    problemInput.focus();

    return;
  }

  state.currentProblem = problem;

  loadingOverlay.classList.add("show");

  try {

    const response = await fetch("/api/solve", {

      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        problem,
        subject: state.subjectName
      })

    });


    const data = await response.json();


    if (!response.ok || !data.success) {

      throw new Error(
        data.error || "Não foi possível resolver o problema."
      );

    }


    displaySolution(data);

    saveHistory(data);

    showPage("solution");

  } catch (error) {

    console.error(error);

    showToast(
      error.message ||
      "Ocorreu um erro ao processar o problema."
    );

  } finally {

    loadingOverlay.classList.remove("show");

  }

}


// DISPLAY SOLUTION

function displaySolution(data) {

  solutionSubject.textContent = data.subject;

  solutionProblem.textContent = data.problem;

  document.getElementById("solutionTitle").textContent =
    data.solution.title;

  stepsContainer.innerHTML = "";

  data.solution.steps.forEach(step => {

    const card = document.createElement("div");

    card.className = "step-card";

    card.innerHTML = `
      <div class="step-number">
        ${step.number}
      </div>

      <div class="step-title">
        ${escapeHTML(step.title)}
      </div>

      <div class="step-text">
        ${escapeHTML(step.text)}
      </div>
    `;

    stepsContainer.appendChild(card);

  });


  methodsContainer.innerHTML = "";

  data.solution.methods.forEach(method => {

    const item = document.createElement("div");

    item.className = "method-item";

    item.innerHTML = `
      <span class="method-check">✓</span>
      <span>${escapeHTML(method)}</span>
    `;

    methodsContainer.appendChild(item);

  });

}


// HISTORY

function saveHistory(data) {

  const item = {
    id: Date.now(),
    problem: data.problem,
    subject: data.subject,
    date: new Date().toISOString()
  };

  state.history.unshift(item);

  state.history = state.history.slice(0, 50);

  localStorage.setItem(
    "einsteinweb_history",
    JSON.stringify(state.history)
  );

  renderRecent();

  renderHistory();

}


function renderRecent() {

  const container = document.getElementById("recentList");

  if (!state.history.length) {

    container.innerHTML = `
      <div class="empty-state">
        <div>∑</div>
        <span>
          Os seus problemas resolvidos aparecerão aqui.
        </span>
      </div>
    `;

    return;
  }


  container.innerHTML = "";

  state.history.slice(0, 4).forEach(item => {

    const element = createHistoryElement(item);

    container.appendChild(element);

  });

}


function renderHistory() {

  const container = document.getElementById("historyContainer");

  if (!state.history.length) {

    container.innerHTML = `
      <div class="empty-large">
        <div class="empty-large-icon">◷</div>

        <h2>Nenhum problema ainda</h2>

        <p>
          Resolva o seu primeiro problema para começar o histórico.
        </p>

        <button class="primary-btn" id="historyNewProblem2">
          Resolver problema
        </button>
      </div>
    `;

    document
      .getElementById("historyNewProblem2")
      .addEventListener("click", () => {

        showPage("home");

        setTimeout(() => {
          problemInput.focus();
        }, 200);

      });

    return;
  }


  container.innerHTML = "";

  state.history.forEach(item => {

    container.appendChild(
      createHistoryElement(item)
    );

  });

}


function createHistoryElement(item) {

  const element = document.createElement("div");

  element.className = "history-item";

  element.innerHTML = `
    <div class="history-item-icon">
      ∑
    </div>

    <div class="history-item-content">

      <strong>
        ${escapeHTML(item.problem)}
      </strong>

      <span>
        ${escapeHTML(item.subject)}
        ·
        ${formatDate(item.date)}
      </span>

    </div>

    <div class="history-item-arrow">
      →
    </div>
  `;


  element.addEventListener("click", () => {

    problemInput.value = item.problem;

    const subjectKey = Object.keys(subjects).find(
      key => subjects[key].name === item.subject
    );

    if (subjectKey) {
      setSubject(subjectKey);
    }

    solveProblem();

  });


  return element;

}


// VIEW HISTORY

document.getElementById("viewHistory").addEventListener("click", () => {

  showPage("history");

});


// BACK

document.getElementById("backBtn").addEventListener("click", () => {

  showPage("home");

});


// TOAST

function showToast(message) {

  toastText.textContent = message;

  toast.classList.add("show");

  clearTimeout(window.toastTimer);

  window.toastTimer = setTimeout(() => {

    toast.classList.remove("show");

  }, 2600);

}


// DATE

function formatDate(dateString) {

  const date = new Date(dateString);

  return date.toLocaleDateString("pt-PT", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });

}


// SECURITY

function escapeHTML(value) {

  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

}


// INITIALIZE

renderRecent();
renderHistory();


// DEMO PLACEHOLDER

console.log(
  "EinsteinWeb V0.1 carregado. Motor matemático ainda será conectado."
);
