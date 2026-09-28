/* =========================================================
   EINSTEINWEB
   Einstein Keyboard V0.5
========================================================= */

let currentSubject = "math";

let expression = "";

let cursorPosition = 0;

let history = [];

let currentKeyboardCategory = "basic";


/* =========================================================
   DOM
========================================================= */

const problemDisplay =
  document.getElementById("problemDisplay");

const keyboard =
  document.getElementById("keyboard");

const keyboardTabs =
  document.getElementById("keyboardTabs");

const solveBtn =
  document.getElementById("solveBtn");

const clearAll =
  document.getElementById("clearAll");

const undoBtn =
  document.getElementById("undoBtn");

const cursorLeft =
  document.getElementById("cursorLeft");

const cursorRight =
  document.getElementById("cursorRight");

const backspaceBtn =
  document.getElementById("backspaceBtn");

const resultSection =
  document.getElementById("resultSection");

const resultAnswer =
  document.getElementById("resultAnswer");

const stepsContainer =
  document.getElementById("stepsContainer");

const methodsContainer =
  document.getElementById("methodsContainer");

const learningContainer =
  document.getElementById("learningContainer");

const graphContainer =
  document.getElementById("graphContainer");

const graphCanvas =
  document.getElementById("graphCanvas");

const errorBox =
  document.getElementById("errorBox");

const calculatorTitle =
  document.getElementById("calculatorTitle");

const calculatorSubtitle =
  document.getElementById("calculatorSubtitle");


/* =========================================================
   KEYBOARDS
========================================================= */

const keyboards = {

  math: {

    tabs: [
      ["basic", "123"],
      ["algebra", "f(x)"],
      ["functions", "sin"],
      ["advanced", "√ π"]
    ],

    basic: [

      ["(", "insert", "special"],
      [")", "insert", "special"],
      ["7", "insert"],
      ["8", "insert"],
      ["9", "insert"],
      ["÷", "insert", "operator"],

      ["⌫", "backspace", "special"],
      ["√(", "insert", "special"],
      ["4", "insert"],
      ["5", "insert"],
      ["6", "insert"],
      ["×", "insert", "operator"],

      ["x", "insert", "special"],
      ["x²", "insert", "special"],
      ["1", "insert"],
      ["2", "insert"],
      ["3", "insert"],
      ["−", "insert", "operator"],

      ["π", "insert", "special"],
      ["%", "insert", "special"],
      ["0", "insert"],
      [",", "insert"],
      ["=", "insert", "primary"],
      ["+", "insert", "operator"]

    ],

    algebra: [

      ["x", "insert", "special"],
      ["y", "insert", "special"],
      ["a", "insert", "special"],
      ["b", "insert", "special"],
      ["c", "insert", "special"],

      ["x²", "insert", "special"],
      ["x³", "insert", "special"],
      ["xⁿ", "insert", "special"],
      ["√(", "insert", "special"],
      ["|x|", "insert", "special"],

      ["(", "insert"],
      [")", "insert"],
      ["=", "insert", "primary"],
      ["+", "insert", "operator"],
      ["−", "insert", "operator"],

      ["×", "insert", "operator"],
      ["÷", "insert", "operator"],
      ["^", "insert", "operator"],
      ["%", "insert", "special"],
      ["π", "insert", "special"]

    ],

    functions: [

      ["sin(", "insert", "special"],
      ["cos(", "insert", "special"],
      ["tan(", "insert", "special"],
      ["log(", "insert", "special"],
      ["ln(", "insert", "special"],

      ["asin(", "insert", "small"],
      ["acos(", "insert", "small"],
      ["atan(", "insert", "small"],
      ["exp(", "insert", "small"],
      ["abs(", "insert", "small"],

      ["(", "insert"],
      [")", "insert"],
      ["π", "insert", "special"],
      ["e", "insert", "special"],
      ["=", "insert", "primary"]

    ],

    advanced: [

      ["√(", "insert", "special"],
      ["∛(", "insert", "special"],
      ["π", "insert", "special"],
      ["e", "insert", "special"],
      ["∞", "insert", "special"],

      ["^", "insert", "operator"],
      ["²", "insert", "special"],
      ["³", "insert", "special"],
      ["%", "insert", "special"],
      ["!", "insert", "special"],

      ["(", "insert"],
      [")", "insert"],
      ["+", "insert", "operator"],
      ["−", "insert", "operator"],
      ["×", "insert", "operator"],

      ["÷", "insert", "operator"],
      ["=", "insert", "primary"]
    ]

  },


  physics: {

    tabs: [
      ["basic", "123"],
      ["variables", "Grandezas"],
      ["units", "Unidades"],
      ["formulas", "Fórmulas"]
    ],

    basic: [

      ["(", "insert", "special"],
      [")", "insert", "special"],
      ["7", "insert"],
      ["8", "insert"],
      ["9", "insert"],
      ["÷", "insert", "operator"],

      ["⌫", "backspace", "special"],
      ["√", "insert", "special"],
      ["4", "insert"],
      ["5", "insert"],
      ["6", "insert"],
      ["×", "insert", "operator"],

      ["1", "insert"],
      ["2", "insert"],
      ["3", "insert"],
      ["−", "insert", "operator"],
      ["=", "insert", "primary"],

      ["0", "insert"],
      [",", "insert"],
      ["+", "insert", "operator"],
      ["%", "insert", "special"],
      ["^", "insert", "operator"]

    ],

    variables: [

      ["v", "insert", "special"],
      ["d", "insert", "special"],
      ["t", "insert", "special"],
      ["m", "insert", "special"],
      ["a", "insert", "special"],

      ["F", "insert", "special"],
      ["P", "insert", "special"],
      ["V", "insert", "special"],
      ["I", "insert", "special"],
      ["R", "insert", "special"],

      ["ρ", "insert", "special"],
      ["E", "insert", "special"],
      ["Q", "insert", "special"],
      ["W", "insert", "special"],
      ["g", "insert", "special"],

      ["θ", "insert", "special"],
      ["λ", "insert", "special"],
      ["f", "insert", "special"],
      ["T", "insert", "special"],
      ["η", "insert", "special"]

    ],

    units: [

      ["m", "insert", "special"],
      ["km", "insert", "special"],
      ["cm", "insert", "special"],
      ["mm", "insert", "special"],
      ["s", "insert", "special"],

      ["min", "insert", "special"],
      ["h", "insert", "special"],
      ["kg", "insert", "special"],
      ["g", "insert", "special"],
      ["N", "insert", "special"],

      ["J", "insert", "special"],
      ["W", "insert", "special"],
      ["Pa", "insert", "special"],
      ["V", "insert", "special"],
      ["A", "insert", "special"],

      ["Ω", "insert", "special"],
      ["Hz", "insert", "special"],
      ["m/s", "insert", "small"],
      ["m/s²", "insert", "small"],
      ["kg/m³", "insert", "small"]

    ],

    formulas: [

      ["v = d/t", "insert", "small"],
      ["F = ma", "insert", "small"],
      ["ρ = m/V", "insert", "small"],
      ["P = VI", "insert", "small"],
      ["V = RI", "insert", "small"],

      ["E = mc²", "insert", "small"],
      ["W = Fd", "insert", "small"],
      ["P = W/t", "insert", "small"],
      ["Q = mcΔT", "insert", "small"],
      ["p = mv", "insert", "small"],

      ["+", "insert", "operator"],
      ["−", "insert", "operator"],
      ["×", "insert", "operator"],
      ["÷", "insert", "operator"],
      ["=", "insert", "primary"]

    ]

  },


  chemistry: {

    tabs: [
      ["basic", "123"],
      ["elements1", "Elementos"],
      ["elements2", "Mais"],
      ["chemistry", "Química"]
    ],

    basic: [

      ["(", "insert", "special"],
      [")", "insert", "special"],
      ["7", "insert"],
      ["8", "insert"],
      ["9", "insert"],
      ["+", "insert", "operator"],

      ["⌫", "backspace", "special"],
      ["→", "insert", "special"],
      ["4", "insert"],
      ["5", "insert"],
      ["6", "insert"],
      ["−", "insert", "operator"],

      ["1", "insert"],
      ["2", "insert"],
      ["3", "insert"],
      ["×", "insert", "operator"],
      ["=", "insert", "primary"],

      ["0", "insert"],
      [".", "insert"],
      ["mol", "insert", "special"],
      ["g", "insert", "special"],
      ["L", "insert", "special"]

    ],

    elements1: [

      ["H", "insert", "special"],
      ["He", "insert", "special"],
      ["Li", "insert", "special"],
      ["Be", "insert", "special"],
      ["B", "insert", "special"],

      ["C", "insert", "special"],
      ["N", "insert", "special"],
      ["O", "insert", "special"],
      ["F", "insert", "special"],
      ["Ne", "insert", "special"],

      ["Na", "insert", "special"],
      ["Mg", "insert", "special"],
      ["Al", "insert", "special"],
      ["Si", "insert", "special"],
      ["P", "insert", "special"],

      ["S", "insert", "special"],
      ["Cl", "insert", "special"],
      ["Ar", "insert", "special"],
      ["K", "insert", "special"],
      ["Ca", "insert", "special"]

    ],

    elements2: [

      ["Sc", "insert", "special"],
      ["Ti", "insert", "special"],
      ["V", "insert", "special"],
      ["Cr", "insert", "special"],
      ["Mn", "insert", "special"],

      ["Fe", "insert", "special"],
      ["Co", "insert", "special"],
      ["Ni", "insert", "special"],
      ["Cu", "insert", "special"],
      ["Zn", "insert", "special"],

      ["Br", "insert", "special"],
      ["Ag", "insert", "special"],
      ["I", "insert", "special"],
      ["Ba", "insert", "special"],
      ["Au", "insert", "special"],

      ["Hg", "insert", "special"],
      ["Pb", "insert", "special"],
      ["Al", "insert", "special"],
      ["Si", "insert", "special"],
      ["Ca", "insert", "special"]

    ],

    chemistry: [

      ["H₂O", "insert", "small"],
      ["CO₂", "insert", "small"],
      ["O₂", "insert", "small"],
      ["H₂", "insert", "small"],
      ["N₂", "insert", "small"],

      ["NaCl", "insert", "small"],
      ["HCl", "insert", "small"],
      ["H₂SO₄", "insert", "small"],
      ["NaOH", "insert", "small"],
      ["NH₃", "insert", "small"],

      ["mol", "insert", "special"],
      ["g", "insert", "special"],
      ["kg", "insert", "special"],
      ["L", "insert", "special"],
      ["mL", "insert", "special"],

      ["→", "insert", "special"],
      ["⇌", "insert", "special"],
      ["+", "insert", "operator"],
      ["=", "insert", "primary"]
    ]

  }

};


/* =========================================================
   MODE INFORMATION
========================================================= */

const modeInfo = {

  math: {
    title: "Calculadora Matemática",
    subtitle: "Use o teclado Einstein para escrever"
  },

  physics: {
    title: "Calculadora de Física",
    subtitle: "Grandezas, unidades e fórmulas"
  },

  chemistry: {
    title: "Calculadora de Química",
    subtitle: "Elementos, fórmulas e cálculos químicos"
  }

};


/* =========================================================
   RENDER TABS
========================================================= */

function renderTabs() {

  keyboardTabs.innerHTML = "";

  const tabs =
    keyboards[currentSubject].tabs;

  tabs.forEach(tab => {

    const button =
      document.createElement("button");

    button.className =
      "keyboard-tab";

    if (
      tab[0] === currentKeyboardCategory
    ) {
      button.classList.add("active");
    }

    button.textContent =
      tab[1];

    button.addEventListener(
      "click",
      () => {

        currentKeyboardCategory =
          tab[0];

        renderTabs();
        renderKeyboard();

      }
    );

    keyboardTabs.appendChild(button);

  });

}


/* =========================================================
   RENDER KEYBOARD
========================================================= */

function renderKeyboard() {

  keyboard.innerHTML = "";

  const keys =
    keyboards[currentSubject]
      [currentKeyboardCategory];

  if (!keys) return;

  keys.forEach(keyData => {

    const [
      label,
      action,
      className
    ] = keyData;

    const button =
      document.createElement("button");

    button.className =
      "key";

    if (className) {

      className
        .split(" ")
        .forEach(cls => {

          button.classList.add(cls);

        });

    }

    button.textContent =
      label;

    button.addEventListener(
      "click",
      () => {

        handleKey(
          label,
          action
        );

      }
    );

    keyboard.appendChild(button);

  });

}


/* =========================================================
   KEY HANDLER
========================================================= */

function handleKey(label, action) {

  if (action === "backspace") {

    backspace();

    return;

  }

  if (action === "insert") {

    insertText(
      convertDisplayToExpression(label)
    );

  }

}


/* =========================================================
   CONVERT DISPLAY SYMBOLS
========================================================= */

function convertDisplayToExpression(value) {

  const replacements = {

    "×": "*",
    "÷": "/",
    "−": "-",
    "√(": "sqrt(",
    "√": "sqrt(",
    "π": "pi",
    "x²": "x^2",
    "x³": "x^3",
    "xⁿ": "x^n",
    "²": "^2",
    "³": "^3",
    "∞": "Infinity",

    "sin(": "sin(",
    "cos(": "cos(",
    "tan(": "tan(",
    "log(": "log10(",
    "ln(": "log(",

    "H₂O": "H2O",
    "CO₂": "CO2",
    "O₂": "O2",
    "H₂": "H2",
    "N₂": "N2",
    "H₂SO₄": "H2SO4",

    "⇌": "=",
    "→": " -> "

  };

  return (
    replacements[value] ??
    value
  );

}


/* =========================================================
   INSERT TEXT
========================================================= */

function saveHistory() {

  history.push({
    expression,
    cursorPosition
  });

  if (history.length > 50) {
    history.shift();
  }

}


function insertText(text) {

  saveHistory();

  expression =
    expression.slice(
      0,
      cursorPosition
    ) +
    text +
    expression.slice(
      cursorPosition
    );

  cursorPosition +=
    text.length;

  updateDisplay();

}


/* =========================================================
   BACKSPACE
========================================================= */

function backspace() {

  if (cursorPosition <= 0) {
    return;
  }

  saveHistory();

  expression =
    expression.slice(
      0,
      cursorPosition - 1
    ) +
    expression.slice(
      cursorPosition
    );

  cursorPosition--;

  updateDisplay();

}


/* =========================================================
   CURSOR
========================================================= */

function moveCursorLeft() {

  if (cursorPosition > 0) {

    cursorPosition--;

    updateDisplay();

  }

}


function moveCursorRight() {

  if (
    cursorPosition <
    expression.length
  ) {

    cursorPosition++;

    updateDisplay();

  }

}


/* =========================================================
   UNDO
========================================================= */

function undo() {

  if (!history.length) {
    return;
  }

  const previous =
    history.pop();

  expression =
    previous.expression;

  cursorPosition =
    previous.cursorPosition;

  updateDisplay();

}


/* =========================================================
   CLEAR
========================================================= */

function clearExpression() {

  saveHistory();

  expression = "";

  cursorPosition = 0;

  updateDisplay();

}


/* =========================================================
   DISPLAY
========================================================= */

function updateDisplay() {

  problemDisplay.innerHTML = "";

  if (!expression) {

    const placeholder =
      document.createElement("span");

    placeholder.className =
      "placeholder";

    placeholder.textContent =
      "Toque nas teclas abaixo...";

    problemDisplay.appendChild(
      placeholder
    );

    return;

  }


  const before =
    escapeHTML(
      expression.slice(
        0,
        cursorPosition
      )
    );

  const after =
    escapeHTML(
      expression.slice(
        cursorPosition
      )
    );


  problemDisplay.innerHTML =
    before +
    '<span class="cursor"></span>' +
    after;


  problemDisplay.scrollLeft =
    problemDisplay.scrollWidth;

}


/* =========================================================
   HTML ESCAPE
========================================================= */

function escapeHTML(text) {

  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

}


/* =========================================================
   SOLVE
========================================================= */

async function solve() {

  const problem =
    expression.trim();

  if (!problem) {

    showError(
      "Digite um problema usando o teclado Einstein."
    );

    return;

  }

  hideError();

  solveBtn.classList.add("loading");

  solveBtn.innerHTML =
    "<span>⏳</span> Resolvendo...";


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
              currentSubject
          })

        }
      );


    const data =
      await response.json();


    if (!response.ok || !data.success) {

      throw new Error(
        data.error ||
        "Não foi possível resolver."
      );

    }


    renderResult(
      data.result
    );


  } catch (error) {

    console.error(error);

    showError(
      error.message ||
      "Ocorreu um erro ao resolver."
    );

  } finally {

    solveBtn.classList.remove(
      "loading"
    );

    solveBtn.innerHTML =
      "<span>✦</span> Resolver";

  }

}


/* =========================================================
   RESULT
========================================================= */

function renderResult(result) {

  resultSection.classList.remove(
    "hidden"
  );

  resultAnswer.textContent =
    result.answer || "Sem resultado";


  renderSteps(
    result.steps || []
  );


  renderMethods(
    result.methods || []
  );


  renderLearning(
    result.learning
  );


  if (result.graph) {

    graphContainer.classList.remove(
      "hidden"
    );

    setTimeout(
      () => drawGraph(
        result.graph
      ),
      50
    );

  } else {

    graphContainer.classList.add(
      "hidden"
    );

  }


  resultSection.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });

}


/* =========================================================
   STEPS
========================================================= */

function renderSteps(steps) {

  stepsContainer.innerHTML = "";

  if (!steps.length) {
    return;
  }

  const title =
    document.createElement("div");

  title.className =
    "section-title";

  title.textContent =
    "Resolução passo a passo";

  stepsContainer.appendChild(
    title
  );


  steps.forEach(
    (step, index) => {

      const card =
        document.createElement("div");

      card.className =
        "step-card";


      card.innerHTML = `

        <div class="step-number">
          ${index + 1}
        </div>

        <div class="step-title">
          ${escapeHTML(
            step.title || ""
          )}
        </div>

        <div class="step-description">
          ${escapeHTML(
            step.description || ""
          )}
        </div>

        ${
          step.formula
            ? `
              <div class="step-formula">
                ${escapeHTML(
                  step.formula
                )}
              </div>
            `
            : ""
        }

      `;

      stepsContainer.appendChild(
        card
      );

    }
  );

}


/* =========================================================
   METHODS
========================================================= */

function renderMethods(methods) {

  methodsContainer.innerHTML = "";

  if (!methods.length) {
    return;
  }

  const title =
    document.createElement("div");

  title.className =
    "section-title";

  title.textContent =
    "Métodos";

  methodsContainer.appendChild(
    title
  );


  methods.forEach(method => {

    const card =
      document.createElement("div");

    card.className =
      "method-card";

    card.innerHTML = `

      <div class="method-name">
        ${escapeHTML(
          method.name || ""
        )}
      </div>

      <div class="method-description">
        ${escapeHTML(
          method.description || ""
        )}
      </div>

      ${
        method.result
          ? `
            <div class="method-result">
              ${escapeHTML(
                method.result
              )}
            </div>
          `
          : ""
      }

    `;

    methodsContainer.appendChild(
      card
    );

  });

}


/* =========================================================
   LEARNING
========================================================= */

function renderLearning(learning) {

  learningContainer.innerHTML = "";

  if (!learning) {
    return;
  }

  const title =
    document.createElement("div");

  title.className =
    "section-title";

  title.textContent =
    "Aprender";

  learningContainer.appendChild(
    title
  );


  const card =
    document.createElement("div");

  card.className =
    "learning-card";


  const rows = [

    ["Conceito", learning.concept],

    ["Explicação", learning.explanation],

    ["Dica", learning.tip]

  ];


  rows.forEach(
    ([label, value]) => {

      if (!value) return;

      const row =
        document.createElement("div");

      row.className =
        "learning-row";

      row.innerHTML = `

        <div class="learning-label">
          ${label}
        </div>

        <div class="learning-value">
          ${escapeHTML(value)}
        </div>

      `;

      card.appendChild(row);

    }
  );


  learningContainer.appendChild(
    card
  );

}


/* =========================================================
   GRAPH ENGINE
========================================================= */

function drawGraph(graph) {

  const canvas =
    graphCanvas;

  const container =
    canvas.parentElement;

  const width =
    container.clientWidth - 32;

  const height =
    300;

  const ratio =
    window.devicePixelRatio || 1;


  canvas.width =
    width * ratio;

  canvas.height =
    height * ratio;

  canvas.style.width =
    width + "px";

  canvas.style.height =
    height + "px";


  const ctx =
    canvas.getContext("2d");

  ctx.scale(
    ratio,
    ratio
  );


  const points =
    graph.points || [];


  if (!points.length) {
    return;
  }


  const xs =
    points.map(p => p.x);

  const ys =
    points.map(p => p.y);


  let minX =
    Math.min(...xs);

  let maxX =
    Math.max(...xs);

  let minY =
    Math.min(...ys);

  let maxY =
    Math.max(...ys);


  if (minY === maxY) {

    minY -= 1;
    maxY += 1;

  }


  if (minX === maxX) {

    minX -= 1;
    maxX += 1;

  }


  const padding =
    35;


  function mapX(x) {

    return padding +
      (
        (x - minX) /
        (maxX - minX)
      ) *
      (
        width -
        padding * 2
      );

  }


  function mapY(y) {

    return height -
      padding -
      (
        (y - minY) /
        (maxY - minY)
      ) *
      (
        height -
        padding * 2
      );

  }


  ctx.clearRect(
    0,
    0,
    width,
    height
  );


  /* GRID */

  ctx.strokeStyle =
    "#eeeeee";

  ctx.lineWidth = 1;


  for (
    let i = 0;
    i <= 10;
    i++
  ) {

    const x =
      padding +
      i *
      (
        width -
        padding * 2
      ) / 10;

    ctx.beginPath();

    ctx.moveTo(
      x,
      padding
    );

    ctx.lineTo(
      x,
      height - padding
    );

    ctx.stroke();

  }


  for (
    let i = 0;
    i <= 10;
    i++
  ) {

    const y =
      padding +
      i *
      (
        height -
        padding * 2
      ) / 10;

    ctx.beginPath();

    ctx.moveTo(
      padding,
      y
    );

    ctx.lineTo(
      width - padding,
      y
    );

    ctx.stroke();

  }


  /* AXES */

  ctx.strokeStyle =
    "#999";

  ctx.lineWidth = 1.5;


  if (
    minX <= 0 &&
    maxX >= 0
  ) {

    const axisX =
      mapX(0);

    ctx.beginPath();

    ctx.moveTo(
      axisX,
      padding
    );

    ctx.lineTo(
      axisX,
      height - padding
    );

    ctx.stroke();

  }


  if (
    minY <= 0 &&
    maxY >= 0
  ) {

    const axisY =
      mapY(0);

    ctx.beginPath();

    ctx.moveTo(
      padding,
      axisY
    );

    ctx.lineTo(
      width - padding,
      axisY
    );

    ctx.stroke();

  }


  /* CURVE */

  ctx.strokeStyle =
    "#111";

  ctx.lineWidth = 3;

  ctx.lineJoin = "round";

  ctx.beginPath();


  points.forEach(
    (point, index) => {

      const x =
        mapX(point.x);

      const y =
        mapY(point.y);


      if (index === 0) {

        ctx.moveTo(
          x,
          y
        );

      } else {

        ctx.lineTo(
          x,
          y
        );

      }

    }
  );


  ctx.stroke();


  /* LABELS */

  ctx.fillStyle =
    "#777";

  ctx.font =
    "11px Arial";


  ctx.fillText(
    `x: ${minX}`,
    padding,
    height - 8
  );


  ctx.fillText(
    `x: ${maxX}`,
    width - padding - 35,
    height - 8
  );

}


/* =========================================================
   ERRORS
========================================================= */

function showError(message) {

  errorBox.textContent =
    message;

  errorBox.classList.remove(
    "hidden"
  );

  resultSection.classList.add(
    "hidden"
  );

}


function hideError() {

  errorBox.classList.add(
    "hidden"
  );

}


/* =========================================================
   SUBJECT CHANGE
========================================================= */

function changeSubject(subject) {

  currentSubject =
    subject;

  currentKeyboardCategory =
    keyboards[subject].tabs[0][0];

  expression = "";

  cursorPosition = 0;

  history = [];


  const info =
    modeInfo[subject];

  calculatorTitle.textContent =
    info.title;

  calculatorSubtitle.textContent =
    info.subtitle;


  document
    .querySelectorAll(".mode-btn")
    .forEach(button => {

      button.classList.toggle(
        "active",
        button.dataset.subject === subject
      );

    });


  resultSection.classList.add(
    "hidden"
  );

  hideError();


  renderTabs();
  renderKeyboard();
  updateDisplay();

}


/* =========================================================
   EVENTS
========================================================= */

document
  .querySelectorAll(".mode-btn")
  .forEach(button => {

    button.addEventListener(
      "click",
      () => {

        changeSubject(
          button.dataset.subject
        );

      }
    );

  });


solveBtn.addEventListener(
  "click",
  solve
);


clearAll.addEventListener(
  "click",
  clearExpression
);


undoBtn.addEventListener(
  "click",
  undo
);


cursorLeft.addEventListener(
  "click",
  moveCursorLeft
);


cursorRight.addEventListener(
  "click",
  moveCursorRight
);


backspaceBtn.addEventListener(
  "click",
  backspace
);


/* =========================================================
   PREVENT PHONE KEYBOARD
========================================================= */

/*
   Importante:

   Não existe <input> editável nesta interface.
   Portanto o teclado virtual do Android/iOS não é aberto.

   Todas as entradas passam pelo teclado Einstein.
*/


document.addEventListener(
  "keydown",
  event => {

    /*
      Mantemos apenas atalhos físicos úteis
      no computador.

      No celular isto não interfere.
    */

    if (
      event.key === "Backspace"
    ) {

      event.preventDefault();

      backspace();

    }

    if (
      event.key === "ArrowLeft"
    ) {

      event.preventDefault();

      moveCursorLeft();

    }

    if (
      event.key === "ArrowRight"
    ) {

      event.preventDefault();

      moveCursorRight();

    }

    if (
      event.ctrlKey &&
      event.key.toLowerCase() === "z"
    ) {

      event.preventDefault();

      undo();

    }

  }
);


/* =========================================================
   INITIALIZE
========================================================= */

changeSubject(
  "math"
);
