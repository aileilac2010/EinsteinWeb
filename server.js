const express = require("express");
const path = require("path");
const { evaluate } = require("mathjs");

const app = express();

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

const publicPath = path.join(__dirname, "public");

app.use(express.static(publicPath));

/* =========================
   STATUS
========================= */

app.get("/api/status", (req, res) => {
  res.json({
    ok: true,
    name: "EinsteinWeb",
    version: "0.2.0",
    engine: "Mathematics Engine"
  });
});

/* =========================
   UTILIDADES
========================= */

function cleanProblem(text) {
  return String(text || "")
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/\s+/g, "");
}

function formatNumber(value) {
  if (Math.abs(value) < 1e-10) return "0";

  if (Number.isInteger(value)) {
    return String(value);
  }

  return Number(value.toFixed(6)).toString();
}

function formatCoefficient(value, variable = "x") {
  if (value === 1) return variable;
  if (value === -1) return `-${variable}`;
  return `${formatNumber(value)}${variable}`;
}

function detectType(problem) {
  if (/=/.test(problem)) {
    if (/x\^2/.test(problem)) return "quadratic";
    if (/x/.test(problem)) return "linear";
  }

  return "expression";
}

/* =========================
   PARSER DE POLINÔMIO
========================= */

function parsePolynomial(problem) {
  let expression = problem.replace(/=/g, "-(") + ")";

  // Caso especial: transforma
  // ax² + bx + c = d
  // em ax² + bx + (c-d) = 0

  const parts = problem.split("=");

  if (parts.length !== 2) return null;

  const left = parts[0];
  const right = parts[1];

  try {
    const testValues = [-2, -1, 0, 1, 2];

    const values = testValues.map(x => {
      const leftValue = evaluate(left.replace(/x/g, `(${x})`));
      const rightValue = evaluate(right.replace(/x/g, `(${x})`));

      return {
        x,
        y: leftValue - rightValue
      };
    });

    const y0 = values.find(v => v.x === 0).y;

    const y1 = values.find(v => v.x === 1).y;
    const ym1 = values.find(v => v.x === -1).y;

    const c = y0;
    const a = (y1 + ym1 - 2 * c) / 2;
    const b = y1 - a - c;

    if (
      !Number.isFinite(a) ||
      !Number.isFinite(b) ||
      !Number.isFinite(c)
    ) {
      return null;
    }

    return { a, b, c };
  } catch {
    return null;
  }
}

/* =========================
   EQUAÇÃO LINEAR
========================= */

function solveLinear(problem) {
  const coefficients = parsePolynomial(problem);

  if (!coefficients) return null;

  const { a, b } = coefficients;

  if (Math.abs(a) > 1e-10) {
    return null;
  }

  if (Math.abs(b) < 1e-10) {
    return null;
  }

  const x = -coefficients.c / b;

  return {
    type: "linear",
    steps: [
      {
        title: "Identificar a equação",
        explanation: `A equação pode ser escrita na forma ${formatCoefficient(b)} + ${formatNumber(coefficients.c)} = 0.`
      },
      {
        title: "Isolar x",
        explanation: `Movemos o termo constante para o outro lado e dividimos pelo coeficiente de x.`
      },
      {
        title: "Calcular",
        formula: `x = -(${formatNumber(coefficients.c)}) / ${formatNumber(b)}`
      },
      {
        title: "Resultado",
        formula: `x = ${formatNumber(x)}`
      }
    ],
    solutions: [x]
  };
}

/* =========================
   EQUAÇÃO QUADRÁTICA
========================= */

function solveQuadratic(problem) {
  const coefficients = parsePolynomial(problem);

  if (!coefficients) return null;

  const { a, b, c } = coefficients;

  if (Math.abs(a) < 1e-10) {
    return null;
  }

  const discriminant = b * b - 4 * a * c;

  let solutions = [];

  if (discriminant > 0) {
    solutions = [
      (-b + Math.sqrt(discriminant)) / (2 * a),
      (-b - Math.sqrt(discriminant)) / (2 * a)
    ];
  } else if (Math.abs(discriminant) < 1e-10) {
    solutions = [-b / (2 * a)];
  }

  /* =========================
     FÓRMULA QUADRÁTICA
  ========================= */

  const bhaskara = {
    name: "Fórmula quadrática",
    description: "Usa o discriminante para encontrar diretamente as raízes.",
    steps: [
      `Identificamos a = ${formatNumber(a)}, b = ${formatNumber(b)} e c = ${formatNumber(c)}.`,
      `Calculamos o discriminante: Δ = b² − 4ac.`,
      `Δ = (${formatNumber(b)})² − 4(${formatNumber(a)})(${formatNumber(c)})`,
      `Δ = ${formatNumber(discriminant)}.`,
      `Aplicamos x = (−b ± √Δ) / 2a.`
    ]
  };

  if (solutions.length > 0) {
    bhaskara.steps.push(
      `x₁ = ${formatNumber(solutions[0])}`
    );

    if (solutions.length > 1) {
      bhaskara.steps.push(
        `x₂ = ${formatNumber(solutions[1])}`
      );
    }
  } else {
    bhaskara.steps.push(
      "Como Δ < 0, não existem raízes reais."
    );
  }

  /* =========================
     FATORAÇÃO
  ========================= */

  const factorization = findFactorization(a, b, c);

  let factorMethod = {
    name: "Fatoração",
    description: "Procura fatores que produzem as raízes da equação.",
    steps: []
  };

  if (factorization) {
    factorMethod.steps = [
      `Procuramos dois fatores que produzam a equação.`,
      `A equação pode ser fatorada como ${factorization.factorized}.`,
      `Cada fator é igualado a zero.`,
      `Logo, x₁ = ${formatNumber(factorization.roots[0])} e x₂ = ${formatNumber(factorization.roots[1])}.`
    ];
  } else {
    factorMethod.steps = [
      "Não foi encontrada uma fatoração simples com raízes inteiras.",
      "Neste caso, a fórmula quadrática é uma alternativa direta."
    ];
  }

  /* =========================
     COMPLETAR QUADRADO
  ========================= */

  const completingSquare = {
    name: "Completar quadrados",
    description: "Transforma a equação em uma expressão envolvendo um quadrado perfeito.",
    steps: [
      `Começamos com ${formatNumber(a)}x² + ${formatNumber(b)}x + ${formatNumber(c)} = 0.`,
      `Dividimos toda a equação pelo coeficiente de x².`,
      `Organizamos os termos de x e completamos o quadrado.`,
      `Extraímos a raiz quadrada dos dois lados.`,
      solutions.length
        ? `As soluções obtidas são ${solutions.map(formatNumber).join(" e ")}.`
        : "Não existem soluções reais."
    ]
  };

  /* =========================
     GRÁFICO
  ========================= */

  const graph = [];

  for (let x = -10; x <= 10; x += 0.5) {
    const y = a * x * x + b * x + c;

    graph.push({
      x,
      y: Number(y.toFixed(6))
    });
  }

  const vertexX = -b / (2 * a);
  const vertexY = a * vertexX * vertexX + b * vertexX + c;

  return {
    type: "quadratic",

    equation: `${formatNumber(a)}x² + ${formatNumber(b)}x + ${formatNumber(c)} = 0`,

    coefficients: {
      a,
      b,
      c
    },

    discriminant,

    solutions,

    steps: [
      {
        title: "Identificar a equação",
        explanation: `Temos uma equação quadrática na forma ax² + bx + c = 0.`
      },
      {
        title: "Identificar os coeficientes",
        formula: `a = ${formatNumber(a)}, b = ${formatNumber(b)}, c = ${formatNumber(c)}`
      },
      {
        title: "Calcular o discriminante",
        formula: `Δ = b² − 4ac = ${formatNumber(discriminant)}`
      },
      {
        title: "Encontrar as raízes",
        explanation:
          solutions.length > 0
            ? `Encontramos ${solutions.length} solução(ões) real(is).`
            : "Não existem soluções reais."
      }
    ],

    methods: [
      bhaskara,
      factorMethod,
      completingSquare
    ],

    graph: {
      points: graph,
      vertex: {
        x: Number(vertexX.toFixed(6)),
        y: Number(vertexY.toFixed(6))
      },
      roots: solutions
    },

    learning: {
      title: "O que aprendemos?",
      content:
        "Uma equação quadrática possui a forma ax² + bx + c = 0, com a diferente de zero. O discriminante ajuda a determinar quantas raízes reais existem."
    }
  };
}

/* =========================
   FATORAÇÃO
========================= */

function findFactorization(a, b, c) {
  if (!Number.isInteger(a) || !Number.isInteger(b) || !Number.isInteger(c)) {
    return null;
  }

  const roots = [];

  for (let r1 = -100; r1 <= 100; r1++) {
    for (let r2 = -100; r2 <= 100; r2++) {
      if (
        r1 !== r2 &&
        Math.abs(a * r1 * r2 - c) < 1e-10 &&
        Math.abs(-(a * r1 + a * r2) - b) < 1e-10
      ) {
        roots.push(r1, r2);

        const sign1 = r1 >= 0 ? "-" : "+";
        const sign2 = r2 >= 0 ? "-" : "+";

        return {
          roots: [r1, r2],
          factorized:
            `${formatNumber(a)}(x ${sign1} ${formatNumber(Math.abs(r1))})(x ${sign2} ${formatNumber(Math.abs(r2))})`
        };
      }
    }
  }

  return null;
}

/* =========================
   EXPRESSÕES
========================= */

function solveExpression(problem) {
  try {
    const result = evaluate(problem);

    if (typeof result !== "number") {
      return null;
    }

    return {
      type: "expression",

      steps: [
        {
          title: "Interpretar expressão",
          explanation: "A expressão foi interpretada matematicamente."
        },
        {
          title: "Calcular",
          formula: `${problem} = ${formatNumber(result)}`
        },
        {
          title: "Resultado",
          formula: formatNumber(result)
        }
      ],

      solutions: [],

      methods: [
        {
          name: "Cálculo direto",
          description: "A expressão foi avaliada diretamente.",
          steps: [
            `${problem}`,
            `= ${formatNumber(result)}`
          ]
        }
      ],

      learning: {
        title: "Resultado da expressão",
        content:
          "O EinsteinWeb avaliou a expressão e verificou o resultado numericamente."
      }
    };
  } catch {
    return null;
  }
}

/* =========================
   MOTOR PRINCIPAL
========================= */

function solveMath(problem) {
  const cleaned = cleanProblem(problem);

  if (!cleaned) {
    return {
      success: false,
      error: "Digite um problema matemático."
    };
  }

  const type = detectType(cleaned);

  if (type === "quadratic") {
    const result = solveQuadratic(cleaned);

    if (result) {
      return {
        success: true,
        subject: "math",
        problem: problem,
        ...result
      };
    }
  }

  if (type === "linear") {
    const result = solveLinear(cleaned);

    if (result) {
      return {
        success: true,
        subject: "math",
        problem: problem,
        ...result
      };
    }
  }

  const expression = solveExpression(cleaned);

  if (expression) {
    return {
      success: true,
      subject: "math",
      problem: problem,
      ...expression
    };
  }

  return {
    success: false,
    error:
      "Ainda não consegui interpretar este problema. Tente escrever uma equação ou expressão matemática mais clara."
  };
}

/* =========================
   API SOLVER
========================= */

app.post("/api/solve", (req, res) => {
  try {
    const { problem, subject } = req.body;

    if (!problem) {
      return res.status(400).json({
        success: false,
        error: "Nenhum problema foi enviado."
      });
    }

    if (subject && subject !== "math") {
      return res.json({
        success: false,
        error:
          "O motor matemático está ativo nesta versão. Física e Química serão adicionadas nas próximas versões."
      });
    }

    const result = solveMath(problem);

    return res.json(result);

  } catch (error) {
    console.error("Solver error:", error);

    return res.status(500).json({
      success: false,
      error: "Ocorreu um erro ao processar o problema."
    });
  }
});

/* =========================
   FALLBACK
========================= */

app.use((req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

/* =========================
   SERVER
========================= */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`EinsteinWeb running on port ${PORT}`);
});
