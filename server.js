const express = require("express");
const path = require("path");
const math = require("mathjs");

const app = express();

const PORT = process.env.PORT || 3000;
const publicPath = path.join(__dirname, "public");

/* =========================================================
   CONFIGURAÇÃO
========================================================= */

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(express.static(publicPath));

/* =========================================================
   UTILIDADES
========================================================= */

function formatNumber(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return String(value);
  }

  if (Math.abs(value) < 1e-10) {
    return "0";
  }

  const rounded = Number(value.toFixed(8));

  return String(rounded);
}

function cleanProblem(problem) {
  return String(problem || "")
    .trim()
    .replace(/[−–—]/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/,/g, ".")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/\s+/g, " ");
}

function normalizeExpression(expression) {
  let result = String(expression || "");

  result = result
    .replace(/[−–—]/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/,/g, ".")
    .replace(/²/g, "^2")
    .replace(/³/g, "^3");

  /*
    Converte:

    2x      -> 2*x
    -5x     -> -5*x
    3(x+1)  -> 3*(x+1)
    (x+1)2  -> (x+1)*2
    x(x+1)  -> x*(x+1)
  */

  result = result.replace(
    /(\d|\))\s*(x|\()/gi,
    "$1*$2"
  );

  result = result.replace(
    /(x|\))\s*(\d|\()/gi,
    "$1*$2"
  );

  result = result.replace(
    /(\))\s*(x)/gi,
    "$1*$2"
  );

  result = result.replace(
    /\^/g,
    "^"
  );

  return result;
}

function safeEvaluate(expression, xValue = null) {
  try {
    let expr = normalizeExpression(expression);

    if (xValue !== null) {
      return math.evaluate(expr, { x: xValue });
    }

    return math.evaluate(expr);
  } catch (error) {
    return null;
  }
}

/* =========================================================
   PARSER DE EQUAÇÕES
========================================================= */

function splitEquation(problem) {
  const cleaned = cleanProblem(problem);

  if (!cleaned.includes("=")) {
    return {
      left: cleaned,
      right: "0"
    };
  }

  const parts = cleaned.split("=");

  return {
    left: parts[0].trim(),
    right: parts.slice(1).join("=").trim() || "0"
  };
}

/* =========================================================
   POLINÔMIO
========================================================= */

function polynomialValue(expression, x) {
  return safeEvaluate(expression, x);
}

function parsePolynomial(problem) {
  const equation = splitEquation(problem);

  const left = normalizeExpression(equation.left);
  const right = normalizeExpression(equation.right);

  const expression = `(${left})-(${right})`;

  const y0 = polynomialValue(expression, 0);
  const y1 = polynomialValue(expression, 1);
  const ym1 = polynomialValue(expression, -1);
  const y2 = polynomialValue(expression, 2);
  const ym2 = polynomialValue(expression, -2);

  if (
    y0 === null ||
    y1 === null ||
    ym1 === null ||
    y2 === null ||
    ym2 === null
  ) {
    return null;
  }

  /*
    Para:

    ax² + bx + c

    temos:

    f(0) = c

    f(1) = a + b + c

    f(-1) = a - b + c

    portanto:

    a = [f(1)+f(-1)-2f(0)]/2

    b = [f(1)-f(-1)]/2
  */

  const c = y0;

  const a =
    (y1 + ym1 - 2 * y0) / 2;

  const b =
    (y1 - ym1) / 2;

  /*
    Verificação para evitar classificar
    funções não quadráticas como quadráticas.
  */

  const predicted2 =
    a * 4 +
    b * 2 +
    c;

  const predictedM2 =
    a * 4 -
    b * 2 +
    c;

  const tolerance = 1e-7;

  if (
    Math.abs(predicted2 - y2) > tolerance ||
    Math.abs(predictedM2 - ym2) > tolerance
  ) {
    return null;
  }

  return {
    a,
    b,
    c,
    expression
  };
}

/* =========================================================
   EQUAÇÃO LINEAR
========================================================= */

function solveLinear(coefficients) {
  const { a, b, c } = coefficients;

  /*
    ax + b = 0
  */

  if (Math.abs(a) > 1e-10) {
    return null;
  }

  if (Math.abs(b) < 1e-10) {
    if (Math.abs(c) < 1e-10) {
      return {
        type: "identity",
        steps: [
          {
            title: "Analisar a equação",
            explanation:
              "Todos os termos se anulam, portanto a igualdade é verdadeira para qualquer valor de x.",
            formula: "0 = 0"
          }
        ],
        solutions: [],
        methods: [],
        learning: {
          concept:
            "Equações identicamente verdadeiras.",
          explanation:
            "Quando ambos os lados da equação são equivalentes para qualquer valor de x, existem infinitas soluções."
        }
      };
    }

    return {
      type: "impossible",
      steps: [
        {
          title: "Analisar a equação",
          explanation:
            "A variável desaparece, mas sobra uma igualdade impossível.",
          formula: `${formatNumber(c)} = 0`
        }
      ],
      solutions: [],
      methods: [],
      learning: {
        concept:
          "Equação sem solução.",
        explanation:
          "Uma igualdade falsa não pode ser satisfeita por nenhum valor de x."
      }
    };
  }

  const x = -c / b;

  return {
    type: "linear",

    steps: [
      {
        title: "Identificar a forma da equação",
        explanation:
          "A equação pode ser escrita na forma ax + b = 0.",
        formula:
          `${formatNumber(b)}x + ${formatNumber(c)} = 0`
      },

      {
        title: "Isolar o termo com x",
        explanation:
          "Passamos o termo independente para o outro lado.",
        formula:
          `${formatNumber(b)}x = ${formatNumber(-c)}`
      },

      {
        title: "Dividir pelo coeficiente de x",
        explanation:
          "Dividimos os dois lados pelo coeficiente de x.",
        formula:
          `x = ${formatNumber(-c)} / ${formatNumber(b)}`
      },

      {
        title: "Calcular",
        explanation:
          "Efetuando a divisão, encontramos o valor de x.",
        formula:
          `x = ${formatNumber(x)}`
      }
    ],

    solutions: [x],

    methods: [
      {
        name: "Isolamento da variável",
        description:
          "Método direto para equações lineares.",
        steps: [
          "Reunir os termos com x.",
          "Passar o termo independente para o outro lado.",
          "Dividir pelo coeficiente de x."
        ]
      }
    ],

    graph: {
      points: createLinearGraph(b, c),
      roots: [x]
    },

    learning: {
      concept:
        "Equação linear",
      explanation:
        "Uma equação linear possui a variável elevada à primeira potência. O objetivo é encontrar o valor que torna a igualdade verdadeira."
    }
  };
}

/* =========================================================
   EQUAÇÃO QUADRÁTICA
========================================================= */

function solveQuadratic(coefficients) {
  const { a, b, c } = coefficients;

  const discriminant =
    b * b - 4 * a * c;

  const steps = [];

  steps.push({
    title: "Identificar os coeficientes",
    explanation:
      "A equação está na forma ax² + bx + c = 0.",
    formula:
      `${formatNumber(a)}x² + ${formatNumber(b)}x + ${formatNumber(c)} = 0`
  });

  steps.push({
    title: "Calcular o discriminante",
    explanation:
      "O discriminante indica quantas raízes reais a equação possui.",
    formula:
      `Δ = b² - 4ac = ${formatNumber(discriminant)}`
  });

  if (discriminant < -1e-10) {
    steps.push({
      title: "Interpretar o discriminante",
      explanation:
        "Como Δ é negativo, a equação não possui raízes reais.",
      formula:
        `Δ < 0`
    });

    return {
      type: "quadratic",
      discriminant,
      steps,
      solutions: [],
      methods: [
        {
          name: "Fórmula quadrática",
          description:
            "A fórmula mostra que não existem soluções reais quando o discriminante é negativo.",
          steps: [
            "Calcular Δ.",
            "Verificar que Δ < 0.",
            "Concluir que não existem raízes reais."
          ]
        }
      ],
      graph: createQuadraticGraph(a, b, c, []),
      learning: {
        concept:
          "Discriminante",
        explanation:
          "O discriminante Δ = b² - 4ac determina a natureza das raízes de uma equação quadrática."
      }
    };
  }

  let sqrtDelta =
    Math.sqrt(Math.max(0, discriminant));

  let x1 =
    (-b + sqrtDelta) / (2 * a);

  let x2 =
    (-b - sqrtDelta) / (2 * a);

  if (Math.abs(x1) < 1e-10) {
    x1 = 0;
  }

  if (Math.abs(x2) < 1e-10) {
    x2 = 0;
  }

  steps.push({
    title: "Aplicar a fórmula quadrática",
    explanation:
      "Substituímos os coeficientes na fórmula x = (-b ± √Δ)/(2a).",
    formula:
      `x = (${-formatNumber(b)} ± √${formatNumber(discriminant)}) / ${formatNumber(2 * a)}`
  });

  steps.push({
    title: "Encontrar as raízes",
    explanation:
      "Calculamos os dois valores possíveis para x.",
    formula:
      `x₁ = ${formatNumber(x1)}   |   x₂ = ${formatNumber(x2)}`
  });

  const methods = [];

  /* =======================================================
     MÉTODO 1 — BHASKARA
  ======================================================= */

  methods.push({
    name: "Fórmula quadrática",
    description:
      "Método geral que funciona para qualquer equação quadrática.",
    steps: [
      "Identificar a, b e c.",
      "Calcular Δ = b² - 4ac.",
      "Calcular x₁ e x₂ usando a fórmula quadrática.",
      `Obter x₁ = ${formatNumber(x1)}.`,
      `Obter x₂ = ${formatNumber(x2)}.`
    ]
  });

  /* =======================================================
     MÉTODO 2 — FATORAÇÃO
  ======================================================= */

  const factorization =
    findFactorization(a, b, c);

  if (factorization) {
    methods.push({
      name: "Fatoração",
      description:
        "A equação pode ser transformada em um produto de fatores.",
      steps: [
        `Escrever a equação como ${factorization.form}.`,
        `Igualar cada fator a zero.`,
        `Obter x₁ = ${formatNumber(x1)}.`,
        `Obter x₂ = ${formatNumber(x2)}.`
      ]
    });
  }

  /* =======================================================
     MÉTODO 3 — COMPLETAR QUADRADOS
  ======================================================= */

  const vertexX =
    -b / (2 * a);

  const vertexY =
    a * vertexX * vertexX +
    b * vertexX +
    c;

  methods.push({
    name: "Completar o quadrado",
    description:
      "Transformamos a equação para a forma de vértice.",
    steps: [
      `Calcular o eixo de simetria: x = ${formatNumber(vertexX)}.`,
      `Encontrar o vértice: (${formatNumber(vertexX)}, ${formatNumber(vertexY)}).`,
      "Usar a forma de vértice para encontrar as raízes."
    ]
  });

  /* =======================================================
     GRÁFICO
  ======================================================= */

  const roots =
    Math.abs(x1 - x2) < 1e-10
      ? [x1]
      : [x1, x2];

  return {
    type: "quadratic",

    coefficients: {
      a,
      b,
      c
    },

    discriminant,

    steps,

    solutions: roots,

    methods,

    graph: createQuadraticGraph(
      a,
      b,
      c,
      roots
    ),

    learning: {
      concept:
        "Equação quadrática",
      explanation:
        "Uma equação quadrática possui a forma ax² + bx + c = 0, com a diferente de zero. O seu gráfico é uma parábola.",
      formulas: [
        "Δ = b² - 4ac",
        "x = (-b ± √Δ) / 2a",
        "xᵥ = -b / 2a"
      ]
    }
  };
}

/* =========================================================
   FATORAÇÃO
========================================================= */

function findFactorization(a, b, c) {
  if (Math.abs(a) < 1e-10) {
    return null;
  }

  /*
    Para coeficientes pequenos, procuramos
    raízes inteiras ou decimais simples.
  */

  const possibleRoots = [];

  for (let i = -100; i <= 100; i++) {
    possibleRoots.push(i);

    if (i !== 0) {
      possibleRoots.push(i / 2);
      possibleRoots.push(i / 4);
    }
  }

  for (const r1 of possibleRoots) {
    for (const r2 of possibleRoots) {
      if (Math.abs(r1 - r2) < 1e-10) {
        continue;
      }

      const calculatedB =
        -a * (r1 + r2);

      const calculatedC =
        a * r1 * r2;

      if (
        Math.abs(calculatedB - b) < 1e-8 &&
        Math.abs(calculatedC - c) < 1e-8
      ) {
        const factor1 =
          formatFactor(r1);

        const factor2 =
          formatFactor(r2);

        return {
          form:
            `${formatNumber(a)}(x ${factor1})(x ${factor2})`
        };
      }
    }
  }

  return null;
}

function formatFactor(root) {
  if (root < 0) {
    return `+ ${formatNumber(Math.abs(root))}`;
  }

  return `- ${formatNumber(root)}`;
}

/* =========================================================
   EXPRESSÃO NUMÉRICA
========================================================= */

function solveExpression(problem) {
  const expression =
    cleanProblem(problem);

  const result =
    safeEvaluate(expression);

  if (result === null) {
    return null;
  }

  if (
    typeof result !== "number" ||
    !Number.isFinite(result)
  ) {
    return null;
  }

  return {
    type: "expression",

    steps: [
      {
        title: "Interpretar a expressão",
        explanation:
          "A expressão foi identificada como uma operação matemática.",
        formula:
          expression
      },

      {
        title: "Calcular",
        explanation:
          "Efetuamos as operações matemáticas respeitando a ordem das operações.",
        formula:
          `= ${formatNumber(result)}`
      }
    ],

    solutions: [result],

    methods: [
      {
        name: "Cálculo direto",
        description:
          "Avaliação da expressão respeitando a ordem das operações.",
        steps: [
          "Identificar as operações.",
          "Aplicar a ordem das operações.",
          `Resultado = ${formatNumber(result)}.`
        ]
      }
    ],

    learning: {
      concept:
        "Ordem das operações",
      explanation:
        "Em expressões matemáticas, multiplicações e divisões são realizadas antes de adições e subtrações, salvo quando há parênteses."
    }
  };
}

/* =========================================================
   GRÁFICOS
========================================================= */

function createQuadraticGraph(
  a,
  b,
  c,
  roots
) {
  const vertexX =
    -b / (2 * a);

  const vertexY =
    a * vertexX * vertexX +
    b * vertexX +
    c;

  let minX;
  let maxX;

  if (roots.length >= 2) {
    minX =
      Math.min(...roots) - 4;

    maxX =
      Math.max(...roots) + 4;
  } else {
    minX =
      vertexX - 6;

    maxX =
      vertexX + 6;
  }

  const points = [];

  const count = 120;

  for (let i = 0; i <= count; i++) {
    const x =
      minX +
      ((maxX - minX) * i) /
        count;

    const y =
      a * x * x +
      b * x +
      c;

    points.push({
      x,
      y
    });
  }

  return {
    type: "quadratic",

    points,

    roots,

    vertex: {
      x: vertexX,
      y: vertexY
    },

    equation:
      `${formatNumber(a)}x² + ${formatNumber(b)}x + ${formatNumber(c)}`
  };
}

function createLinearGraph(
  a,
  b
) {
  const root =
    -b / a;

  const minX =
    root - 6;

  const maxX =
    root + 6;

  const points = [];

  const count = 80;

  for (let i = 0; i <= count; i++) {
    const x =
      minX +
      ((maxX - minX) * i) /
        count;

    const y =
      a * x + b;

    points.push({
      x,
      y
    });
  }

  return {
    type: "linear",

    points,

    roots: [root],

    equation:
      `${formatNumber(a)}x + ${formatNumber(b)}`
  };
}

/* =========================================================
   MOTOR MATEMÁTICO
========================================================= */

function solveMath(problem) {
  const cleaned =
    cleanProblem(problem);

  /*
    Primeiro tentamos encontrar
    uma equação polinomial.
  */

  if (
    cleaned.includes("=") ||
    /x/i.test(cleaned)
  ) {
    const polynomial =
      parsePolynomial(cleaned);

    if (polynomial) {
      const {
        a,
        b,
        c
      } = polynomial;

      if (Math.abs(a) > 1e-10) {
        return solveQuadratic({
          a,
          b,
          c
        });
      }

      if (Math.abs(b) > 1e-10) {
        return solveLinear({
          a,
          b,
          c
        });
      }
    }
  }

  /*
    Caso não seja equação,
    tentamos calcular como expressão.
  */

  const expressionResult =
    solveExpression(cleaned);

  if (expressionResult) {
    return expressionResult;
  }

  return null;
}

/* =========================================================
   API STATUS
========================================================= */

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    name: "EinsteinWeb",
    version: "0.3.0",
    status: "online",
    engine: "Mathematics Engine",
    features: [
      "Equações lineares",
      "Equações quadráticas",
      "Fórmula quadrática",
      "Fatoração",
      "Completar quadrados",
      "Gráficos",
      "Passo a passo",
      "Métodos alternativos"
    ]
  });
});

/* =========================================================
   API SOLVE
========================================================= */

app.post("/api/solve", (req, res) => {
  try {
    const {
      problem,
      subject
    } = req.body;

    if (
      !problem ||
      typeof problem !== "string"
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Nenhum problema foi enviado."
      });
    }

    console.log(
      `Problema recebido: ${problem}`
    );

    console.log(
      `Matéria: ${subject || "math"}`
    );

    /*
      V0.3 trabalha primeiro
      com Matemática.
    */

    if (
      subject &&
      subject !== "math"
    ) {
      return res.status(200).json({
        success: true,

        problem,

        subject,

        title:
          "Motor em desenvolvimento",

        steps: [
          {
            title:
              "Problema recebido",
            explanation:
              `O EinsteinWeb recebeu um problema de ${subject === "physics" ? "Física" : "Química"}.`,
            formula:
              problem
          },

          {
            title:
              "Módulo em desenvolvimento",
            explanation:
              "Nesta versão, o motor matemático está mais avançado. Os motores de Física e Química serão adicionados nas próximas versões.",
            formula:
              "EinsteinWeb V0.3"
          }
        ],

        solutions: [],

        methods: [],

        learning: {
          concept:
            subject === "physics"
              ? "Física"
              : "Química",

          explanation:
            "O módulo desta matéria está sendo preparado."
        }
      });
    }

    const result =
      solveMath(problem);

    if (!result) {
      return res.status(422).json({
        success: false,

        error:
          "Não consegui interpretar este problema. Tente escrever a equação de forma mais clara."
      });
    }

    return res.json({
      success: true,

      problem,

      subject:
        subject || "math",

      title:
        result.type === "quadratic"
          ? "Equação quadrática resolvida"
          : result.type === "linear"
            ? "Equação linear resolvida"
            : "Expressão calculada",

      ...result
    });

  } catch (error) {

    console.error(
      "Erro no /api/solve:",
      error
    );

    return res.status(500).json({
      success: false,

      error:
        "Ocorreu um erro interno ao resolver o problema."
    });
  }
});

/* =========================================================
   FRONTEND
========================================================= */

app.use((req, res) => {
  res.sendFile(
    path.join(
      publicPath,
      "index.html"
    )
  );
});

/* =========================================================
   START
========================================================= */

app.listen(PORT, () => {
  console.log(
    `EinsteinWeb V0.3 running on port ${PORT}`
  );
});
