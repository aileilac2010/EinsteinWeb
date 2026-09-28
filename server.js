/* =========================================================
   EINSTEINWEB
   Einstein Brain V0.4
   Mathematics + Physics + Chemistry
========================================================= */

const express = require("express");
const path = require("path");
const math = require("mathjs");

const app = express();

const PORT = process.env.PORT || 3000;

const publicPath = path.join(
  __dirname,
  "public"
);


/* =========================================================
   EXPRESS
========================================================= */

app.use(
  express.json({
    limit: "10mb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10mb"
  })
);

app.use(
  express.static(publicPath)
);


/* =========================================================
   GENERAL UTILITIES
========================================================= */

function cleanProblem(problem) {

  if (typeof problem !== "string") {
    return "";
  }

  return problem
    .trim()
    .replace(/\s+/g, " ");

}


function formatNumber(value) {

  if (typeof value !== "number") {
    return String(value);
  }

  if (!Number.isFinite(value)) {
    return String(value);
  }

  if (Math.abs(value) < 1e-10) {
    return "0";
  }

  const rounded =
    Math.round(value * 1e10) / 1e10;

  return String(rounded);

}


function normalizeExpression(expression) {

  return expression
    .replace(/,/g, ".")
    .replace(/[×x]/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/\^/g, "^")
    .replace(/\s+/g, "");

}


function safeEvaluate(expression) {

  try {

    const result =
      math.evaluate(
        normalizeExpression(expression)
      );

    if (
      typeof result === "number" &&
      Number.isFinite(result)
    ) {
      return result;
    }

    return null;

  } catch {

    return null;

  }

}


function extractNumber(text, regex) {

  const match =
    text.match(regex);

  if (!match) {
    return null;
  }

  const value =
    Number(
      String(match[1])
        .replace(",", ".")
    );

  return Number.isFinite(value)
    ? value
    : null;

}


function round(value, decimals = 4) {

  const factor =
    Math.pow(10, decimals);

  return Math.round(
    value * factor
  ) / factor;

}


/* =========================================================
   MATHEMATICS ENGINE
========================================================= */

function splitEquation(problem) {

  const match =
    problem.match(
      /(.+?)\s*=\s*(.+)/
    );

  if (!match) {
    return null;
  }

  return {
    left: match[1].trim(),
    right: match[2].trim()
  };

}


function polynomialValue(coefficients, x) {

  return (
    coefficients.a * x * x +
    coefficients.b * x +
    coefficients.c
  );

}


function parsePolynomial(equation) {

  const normalized =
    normalizeExpression(equation)
      .replace(/\*\*/g, "^");


  const expression =
    math.parse(normalized);


  const fn =
    expression.compile();


  const values = [];

  [-2, -1, 0, 1, 2].forEach(x => {

    try {

      values.push({
        x,
        y: Number(
          fn.evaluate({ x })
        )
      });

    } catch {

      values.push({
        x,
        y: NaN
      });

    }

  });


  if (
    values.some(
      item => !Number.isFinite(item.y)
    )
  ) {
    return null;
  }


  const c =
    values.find(
      item => item.x === 0
    ).y;


  const y1 =
    values.find(
      item => item.x === 1
    ).y;


  const ym1 =
    values.find(
      item => item.x === -1
    ).y;


  const y2 =
    values.find(
      item => item.x === 2
    ).y;


  const ym2 =
    values.find(
      item => item.x === -2
    ).y;


  const b =
    (y1 - ym1) / 2;


  const a =
    (y2 + ym2 - 2 * c) / 8;


  if (
    !Number.isFinite(a) ||
    !Number.isFinite(b) ||
    !Number.isFinite(c)
  ) {
    return null;
  }


  return {
    a: round(a),
    b: round(b),
    c: round(c)
  };

}


function solveLinear(a, b) {

  if (Math.abs(a) < 1e-12) {

    if (Math.abs(b) < 1e-12) {

      return {
        answer: "Infinitas soluções",
        steps: [
          {
            title: "Analisar a equação",
            description:
              "Os dois lados representam a mesma expressão."
          }
        ]
      };

    }

    return {
      answer: "Sem solução",
      steps: [
        {
          title: "Analisar a equação",
          description:
            "A equação resulta numa igualdade impossível."
        }
      ]
    };

  }


  const x =
    -b / a;


  return {

    answer: `x = ${formatNumber(x)}`,

    steps: [

      {
        title: "Identificar a equação",
        description:
          `Temos uma equação linear na forma ax + b = 0, com a = ${formatNumber(a)} e b = ${formatNumber(b)}.`,
        formula:
          `${formatNumber(a)}x + ${formatNumber(b)} = 0`
      },

      {
        title: "Isolar o termo com x",
        description:
          `Subtraímos ${formatNumber(b)} dos dois lados.`,
        formula:
          `${formatNumber(a)}x = ${formatNumber(-b)}`
      },

      {
        title: "Dividir pelo coeficiente de x",
        description:
          `Dividimos ambos os lados por ${formatNumber(a)}.`,
        formula:
          `x = ${formatNumber(-b)} / ${formatNumber(a)}`
      },

      {
        title: "Resultado",
        description:
          "O valor encontrado para x é:",
        formula:
          `x = ${formatNumber(x)}`
      }

    ],

    methods: [

      {
        name: "Isolamento algébrico",
        description:
          "Mover os termos constantes para o outro lado e dividir pelo coeficiente de x.",
        result:
          `x = ${formatNumber(x)}`
      }

    ],

    learning: {

      concept:
        "Uma equação linear é uma equação em que a variável aparece apenas no primeiro grau.",

      explanation:
        "O objetivo é deixar x sozinho. Qualquer operação feita num lado da igualdade também deve ser feita no outro.",

      tip:
        "Quando tens ax + b = 0, podes usar diretamente x = -b/a, desde que a seja diferente de zero."

    }

  };

}


function solveQuadratic(a, b, c) {

  const discriminant =
    b * b - 4 * a * c;


  if (Math.abs(a) < 1e-12) {
    return solveLinear(b, c);
  }


  if (discriminant < 0) {

    const realPart =
      -b / (2 * a);

    const imaginaryPart =
      Math.sqrt(-discriminant) /
      Math.abs(2 * a);


    return {

      answer:
        `x = ${formatNumber(realPart)} ± ${formatNumber(imaginaryPart)}i`,

      steps: [

        {
          title: "Identificar a equação",
          description:
            `A equação é quadrática: ${formatNumber(a)}x² + ${formatNumber(b)}x + ${formatNumber(c)} = 0.`
        },

        {
          title: "Calcular o discriminante",
          description:
            "Usamos Δ = b² − 4ac.",
          formula:
            `Δ = (${formatNumber(b)})² − 4(${formatNumber(a)})(${formatNumber(c)}) = ${formatNumber(discriminant)}`
        },

        {
          title: "Interpretar o discriminante",
          description:
            "Como Δ < 0, a equação não possui raízes reais."
        }

      ],

      methods: [

        {
          name: "Fórmula quadrática",
          description:
            "A fórmula quadrática também permite encontrar as raízes complexas.",
          result:
            `x = ${formatNumber(realPart)} ± ${formatNumber(imaginaryPart)}i`
        }

      ],

      learning: {

        concept:
          "O discriminante determina quantas raízes reais uma equação quadrática possui.",

        explanation:
          "Quando Δ é negativo, a raiz quadrada do discriminante envolve um número imaginário.",

        tip:
          "Δ > 0 indica duas raízes reais; Δ = 0 indica uma raiz real dupla; Δ < 0 indica ausência de raízes reais."

      }

    };

  }


  const sqrtD =
    Math.sqrt(discriminant);


  const x1 =
    (-b + sqrtD) /
    (2 * a);


  const x2 =
    (-b - sqrtD) /
    (2 * a);


  const rootsEqual =
    Math.abs(x1 - x2) < 1e-10;


  const factorization =
    findFactorization(a, b, c);


  const methods = [

    {
      name: "Fórmula quadrática",
      description:
        "Aplica diretamente a fórmula x = (-b ± √Δ) / 2a.",
      result:
        rootsEqual
          ? `x = ${formatNumber(x1)}`
          : `x₁ = ${formatNumber(x1)}, x₂ = ${formatNumber(x2)}`
    },

    {
      name: "Completamento do quadrado",
      description:
        "Reorganiza a equação até obter uma expressão do tipo (x − h)² = k.",
      result:
        rootsEqual
          ? `x = ${formatNumber(x1)}`
          : `x₁ = ${formatNumber(x1)}, x₂ = ${formatNumber(x2)}`
    }

  ];


  if (factorization) {

    methods.push({

      name: "Fatorização",
      description:
        "Procura fatores que reproduzam os coeficientes da equação.",
      result:
        formatFactorization(
          a,
          b,
          c,
          factorization
        )

    });

  }


  return {

    answer:
      rootsEqual
        ? `x = ${formatNumber(x1)}`
        : `x₁ = ${formatNumber(x1)}, x₂ = ${formatNumber(x2)}`,

    steps: [

      {
        title: "Identificar a equação",
        description:
          "A equação está na forma ax² + bx + c = 0.",
        formula:
          `${formatNumber(a)}x² + ${formatNumber(b)}x + ${formatNumber(c)} = 0`
      },

      {
        title: "Calcular o discriminante",
        description:
          "Usamos Δ = b² − 4ac.",
        formula:
          `Δ = (${formatNumber(b)})² − 4(${formatNumber(a)})(${formatNumber(c)}) = ${formatNumber(discriminant)}`
      },

      {
        title: "Calcular a raiz do discriminante",
        description:
          `Como Δ ≥ 0, calculamos √Δ.`,
        formula:
          `√Δ = ${formatNumber(sqrtD)}`
      },

      {
        title: "Aplicar a fórmula quadrática",
        description:
          "Substituímos os valores na fórmula.",
        formula:
          `x = (${formatNumber(-b)} ± ${formatNumber(sqrtD)}) / ${formatNumber(2 * a)}`
      },

      {
        title: "Encontrar as soluções",
        description:
          rootsEqual
            ? "As duas raízes são iguais."
            : "Calculamos as duas possibilidades do sinal ±.",
        formula:
          rootsEqual
            ? `x = ${formatNumber(x1)}`
            : `x₁ = ${formatNumber(x1)} ; x₂ = ${formatNumber(x2)}`
      }

    ],

    methods,

    graph: createQuadraticGraph(a, b, c),

    learning: {

      concept:
        "Uma equação quadrática é uma equação de segundo grau, normalmente escrita como ax² + bx + c = 0.",

      explanation:
        "O discriminante é calculado primeiro porque ele informa a natureza das raízes. Depois usamos essas informações para encontrar os valores de x.",

      tip:
        "Antes de aplicar a fórmula quadrática, confirma sempre se a equação está organizada com tudo de um lado e zero do outro."

    }

  };

}


function findFactorization(a, b, c) {

  if (
    !Number.isInteger(a) ||
    !Number.isInteger(b) ||
    !Number.isInteger(c)
  ) {
    return null;
  }


  for (let m = -100; m <= 100; m++) {

    if (m === 0) continue;

    for (let n = -100; n <= 100; n++) {

      if (n === 0) continue;

      if (m * n !== a) {
        continue;
      }


      for (let p = -100; p <= 100; p++) {

        if (p === 0) continue;

        for (let q = -100; q <= 100; q++) {

          if (q === 0) continue;

          if (p * q !== c) {
            continue;
          }


          if (m * q + n * p === b) {

            return {
              m,
              n,
              p,
              q
            };

          }

        }

      }

    }

  }


  return null;

}


function formatFactorization(a, b, c, f) {

  if (!f) {
    return null;
  }


  return (
    `(${f.m}x ${f.p >= 0 ? "+" : "-"} ${Math.abs(f.p)})` +
    `(${f.n}x ${f.q >= 0 ? "+" : "-"} ${Math.abs(f.q)})`
  );

}


function createQuadraticGraph(a, b, c) {

  const points = [];

  const vertex =
    -b / (2 * a);


  const start =
    Math.floor(vertex - 8);

  const end =
    Math.ceil(vertex + 8);


  for (
    let x = start;
    x <= end;
    x += 0.25
  ) {

    points.push({

      x: round(x, 3),

      y: round(
        a * x * x +
        b * x +
        c,
        3
      )

    });

  }


  return {
    type: "quadratic",
    points
  };

}


function createLinearGraph(a, b) {

  const points = [];


  for (
    let x = -10;
    x <= 10;
    x += .5
  ) {

    points.push({

      x,

      y:
        a * x + b

    });

  }


  return {
    type: "linear",
    points
  };

}


function solveMath(problem) {

  const equation =
    splitEquation(problem);


  if (equation) {

    const left =
      normalizeExpression(
        equation.left
      );

    const right =
      normalizeExpression(
        equation.right
      );


    const expression =
      `${left}-(${right})`;


    const polynomial =
      parsePolynomial(expression);


    if (polynomial) {

      const {
        a,
        b,
        c
      } = polynomial;


      if (
        Math.abs(a) > 1e-10
      ) {

        return solveQuadratic(
          a,
          b,
          c
        );

      }


      if (
        Math.abs(b) > 1e-10
      ) {

        const result =
          solveLinear(b, c);


        result.graph =
          createLinearGraph(
            b,
            c
          );


        return result;

      }

    }

  }


  const expressionMatch =
    problem.match(
      /(?:calcule|calculate|quanto é|quanto e|resolva|resolve)?\s*([\d.,+\-*/^×÷() ]+)/i
    );


  if (expressionMatch) {

    const expression =
      expressionMatch[1].trim();


    const result =
      safeEvaluate(expression);


    if (result !== null) {

      return {

        answer:
          formatNumber(result),

        steps: [

          {
            title: "Identificar a expressão",
            description:
              `A expressão a calcular é ${expression}.`
          },

          {
            title: "Efetuar os cálculos",
            description:
              "Resolvemos a expressão respeitando a ordem das operações.",
            formula:
              expression
          },

          {
            title: "Resultado",
            description:
              "O resultado final é:",
            formula:
              formatNumber(result)
          }

        ],

        methods: [

          {
            name: "Ordem das operações",
            description:
              "Multiplicações e divisões são realizadas antes de adições e subtrações.",
            result:
              formatNumber(result)
          }

        ],

        learning: {

          concept:
            "A ordem das operações ajuda a determinar a sequência correta dos cálculos.",

          explanation:
            "Parênteses têm prioridade, depois potências, multiplicações/divisões e finalmente adições/subtrações.",

          tip:
            "Usa parênteses quando quiseres deixar a ordem do cálculo explícita."

        }

      };

    }

  }


  return null;

}


/* =========================================================
   PHYSICS ENGINE
========================================================= */

function solvePhysics(problem) {

  const text =
    problem
      .toLowerCase()
      .replace(/,/g, ".");


  /* VELOCITY */

  if (
    (
      text.includes("velocidade") ||
      text.includes("velocidade média")
    ) &&
    (
      text.includes("distância") ||
      text.includes("percorre") ||
      text.includes("percorreu")
    ) &&
    (
      text.includes("tempo") ||
      text.includes("hora") ||
      text.includes("horas") ||
      text.includes("segundo") ||
      text.includes("segundos")
    )
  ) {

    const distanceMatch =
      text.match(
        /(\d+(?:\.\d+)?)\s*(km|m)\b/
      );

    const timeMatch =
      text.match(
        /(\d+(?:\.\d+)?)\s*(h|hora|horas|min|minuto|minutos|s|segundo|segundos)\b/
      );


    if (distanceMatch && timeMatch) {

      const distance =
        Number(distanceMatch[1]);

      const distanceUnit =
        distanceMatch[2];


      const time =
        Number(timeMatch[1]);

      const timeUnit =
        timeMatch[2];


      const distanceMeters =
        distanceUnit === "km"
          ? distance * 1000
          : distance;


      let timeSeconds;

      if (
        timeUnit === "h" ||
        timeUnit === "hora" ||
        timeUnit === "horas"
      ) {

        timeSeconds =
          time * 3600;

      } else if (
        timeUnit === "min" ||
        timeUnit === "minuto" ||
        timeUnit === "minutos"
      ) {

        timeSeconds =
          time * 60;

      } else {

        timeSeconds =
          time;

      }


      const velocitySI =
        distanceMeters /
        timeSeconds;


      let originalVelocity = null;


      if (distanceUnit === "km" &&
          (
            timeUnit === "h" ||
            timeUnit === "hora" ||
            timeUnit === "horas"
          )) {

        originalVelocity =
          distance / time;

      }


      const answer =
        originalVelocity !== null
          ? `${formatNumber(originalVelocity)} km/h (${formatNumber(velocitySI)} m/s)`
          : `${formatNumber(velocitySI)} m/s`;


      return {

        answer,

        steps: [

          {
            title: "Identificar os dados",
            description:
              `Distância = ${distance} ${distanceUnit}; tempo = ${time} ${timeUnit}.`
          },

          {
            title: "Usar a fórmula da velocidade",
            description:
              "A velocidade média é a distância dividida pelo tempo.",
            formula:
              "v = d / t"
          },

          {
            title: "Substituir os valores",
            description:
              "Mantemos também as unidades originais quando possível.",
            formula:
              originalVelocity !== null
                ? `v = ${distance} km / ${time} h`
                : `v = ${distanceMeters} m / ${timeSeconds} s`
          },

          {
            title: "Resultado",
            description:
              "A velocidade média é:",
            formula:
              answer
          }

        ],

        methods: [

          {
            name: "Fórmula da velocidade",
            description:
              "Divide a distância percorrida pelo intervalo de tempo.",
            result:
              answer
          },

          {
            name: "Sistema Internacional",
            description:
              "Converte a distância para metros e o tempo para segundos.",
            result:
              `${formatNumber(velocitySI)} m/s`
          }

        ],

        learning: {

          concept:
            "Velocidade média mede quanto espaço é percorrido por unidade de tempo.",

          explanation:
            "Dividimos a distância pelo tempo porque queremos saber quantos metros ou quilômetros são percorridos em cada unidade de tempo.",

          tip:
            "Confirma sempre as unidades. km/h e m/s representam a mesma grandeza, mas em escalas diferentes."

        }

      };

    }

  }


  /* FORCE */

  if (
    text.includes("força") &&
    (
      text.includes("massa") ||
      text.includes("kg")
    ) &&
    (
      text.includes("aceleração") ||
      text.includes("aceleracao") ||
      text.includes("m/s")
    )
  ) {

    const mass =
      extractNumber(
        text,
        /(\d+(?:\.\d+)?)\s*kg/
      );


    const acceleration =
      extractNumber(
        text,
        /(\d+(?:\.\d+)?)\s*m\/s(?:²|\^2|2)/
      );


    if (
      mass !== null &&
      acceleration !== null
    ) {

      const force =
        mass * acceleration;


      return {

        answer:
          `${formatNumber(force)} N`,

        steps: [

          {
            title: "Identificar os dados",
            description:
              `Massa = ${formatNumber(mass)} kg e aceleração = ${formatNumber(acceleration)} m/s².`
     }
