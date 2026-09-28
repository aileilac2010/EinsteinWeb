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

const publicPath = path.join(__dirname, "public");


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

  return String(expression)
    .replace(/,/g, ".")
    .replace(/×/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
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


function parsePolynomial(equation) {

  try {

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

        const y =
          Number(
            fn.evaluate({ x })
          );


        values.push({
          x,
          y
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

  } catch {

    return null;

  }

}


/* =========================================================
   LINEAR EQUATION
========================================================= */

function solveLinear(a, b) {

  if (Math.abs(a) < 1e-12) {

    if (Math.abs(b) < 1e-12) {

      return {

        answer:
          "Infinitas soluções",

        steps: [

          {
            title: "Analisar a equação",

            description:
              "Os dois lados representam a mesma expressão."
          }

        ],

        methods: [],

        learning: {

          concept:
            "Uma identidade matemática é verdadeira para todos os valores permitidos da variável.",

          explanation:
            "Quando os coeficientes dos dois lados se anulam completamente, qualquer valor de x satisfaz a igualdade.",

          tip:
            "Simplifica os dois lados antes de procurar uma solução única."

        }

      };

    }


    return {

      answer:
        "Sem solução",

      steps: [

        {
          title: "Analisar a equação",

          description:
            "A equação resulta numa igualdade impossível."
        }

      ],

      methods: [],

      learning: {

        concept:
          "Uma equação sem solução não possui nenhum valor da variável que torne a igualdade verdadeira.",

        explanation:
          "Depois de simplificar a equação, obtemos uma contradição.",

        tip:
          "Verifica os sinais e os termos constantes."

      }

    };

  }


  const x =
    -b / a;


  return {

    answer:
      `x = ${formatNumber(x)}`,

    steps: [

      {
        title:
          "Identificar a equação",

        description:
          `Temos uma equação linear na forma ax + b = 0, com a = ${formatNumber(a)} e b = ${formatNumber(b)}.`,

        formula:
          `${formatNumber(a)}x + ${formatNumber(b)} = 0`
      },

      {
        title:
          "Isolar o termo com x",

        description:
          `Subtraímos ${formatNumber(b)} dos dois lados.`,

        formula:
          `${formatNumber(a)}x = ${formatNumber(-b)}`
      },

      {
        title:
          "Dividir pelo coeficiente de x",

        description:
          `Dividimos ambos os lados por ${formatNumber(a)}.`,

        formula:
          `x = ${formatNumber(-b)} / ${formatNumber(a)}`
      },

      {
        title:
          "Resultado",

        description:
          "O valor encontrado para x é:",

        formula:
          `x = ${formatNumber(x)}`
      }

    ],

    methods: [

      {
        name:
          "Isolamento algébrico",

        description:
          "Movemos os termos constantes para o outro lado e dividimos pelo coeficiente de x.",

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


/* =========================================================
   QUADRATIC EQUATION
========================================================= */

function solveQuadratic(a, b, c) {

  if (Math.abs(a) < 1e-12) {
    return solveLinear(b, c);
  }


  const discriminant =
    b * b - 4 * a * c;


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
          title:
            "Identificar a equação",

          description:
            `A equação é quadrática: ${formatNumber(a)}x² + ${formatNumber(b)}x + ${formatNumber(c)} = 0.`
        },

        {
          title:
            "Calcular o discriminante",

          description:
            "Usamos Δ = b² − 4ac.",

          formula:
            `Δ = (${formatNumber(b)})² − 4(${formatNumber(a)})(${formatNumber(c)}) = ${formatNumber(discriminant)}`
        },

        {
          title:
            "Interpretar o discriminante",

          description:
            "Como Δ < 0, a equação não possui raízes reais."
        },

        {
          title:
            "Escrever as raízes complexas",

          description:
            "Usamos a forma x = (-b ± √Δ) / 2a.",

          formula:
            `x = ${formatNumber(realPart)} ± ${formatNumber(imaginaryPart)}i`
        }

      ],

      methods: [

        {
          name:
            "Fórmula quadrática",

          description:
            "A fórmula quadrática permite encontrar as raízes complexas.",

          result:
            `x = ${formatNumber(realPart)} ± ${formatNumber(imaginaryPart)}i`
        }

      ],

      learning: {

        concept:
          "O discriminante determina a natureza das raízes de uma equação quadrática.",

        explanation:
          "Quando Δ é negativo, a raiz quadrada do discriminante envolve a unidade imaginária i.",

        tip:
          "Δ > 0 indica duas raízes reais; Δ = 0 indica uma raiz real dupla; Δ < 0 indica raízes complexas."

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
      name:
        "Fórmula quadrática",

      description:
        "Aplica diretamente a fórmula x = (-b ± √Δ) / 2a.",

      result:
        rootsEqual
          ? `x = ${formatNumber(x1)}`
          : `x₁ = ${formatNumber(x1)}, x₂ = ${formatNumber(x2)}`
    },

    {
      name:
        "Completamento do quadrado",

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

      name:
        "Fatorização",

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
        title:
          "Identificar a equação",

        description:
          "A equação está na forma ax² + bx + c = 0.",

        formula:
          `${formatNumber(a)}x² + ${formatNumber(b)}x + ${formatNumber(c)} = 0`
      },

      {
        title:
          "Calcular o discriminante",

        description:
          "Usamos Δ = b² − 4ac.",

        formula:
          `Δ = (${formatNumber(b)})² − 4(${formatNumber(a)})(${formatNumber(c)}) = ${formatNumber(discriminant)}`
      },

      {
        title:
          "Calcular a raiz do discriminante",

        description:
          "Como Δ ≥ 0, calculamos √Δ.",

        formula:
          `√Δ = ${formatNumber(sqrtD)}`
      },

      {
        title:
          "Aplicar a fórmula quadrática",

        description:
          "Substituímos os valores na fórmula.",

        formula:
          `x = (${formatNumber(-b)} ± ${formatNumber(sqrtD)}) / ${formatNumber(2 * a)}`
      },

      {
        title:
          "Encontrar as soluções",

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

    graph:
      createQuadraticGraph(
        a,
        b,
        c
      ),

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


/* =========================================================
   FACTORIZATION
========================================================= */

function findFactorization(a, b, c) {

  if (
    !Number.isInteger(a) ||
    !Number.isInteger(b) ||
    !Number.isInteger(c)
  ) {
    return null;
  }


  for (let m = -100; m <= 100; m++) {

    if (m === 0) {
      continue;
    }


    for (let n = -100; n <= 100; n++) {

      if (n === 0) {
        continue;
      }


      if (m * n !== a) {
        continue;
      }


      for (let p = -100; p <= 100; p++) {

        if (p === 0) {
          continue;
        }


        for (let q = -100; q <= 100; q++) {

          if (q === 0) {
            continue;
          }


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


/* =========================================================
   GRAPHS
========================================================= */

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

      x:
        round(x, 3),

      y:
        round(
          a * x * x +
          b * x +
          c,
          3
        )

    });

  }


  return {

    type:
      "quadratic",

    points

  };

}


function createLinearGraph(a, b) {

  const points = [];


  for (
    let x = -10;
    x <= 10;
    x += 0.5
  ) {

    points.push({

      x,

      y:
        round(
          a * x + b,
          4
        )

    });

  }


  return {

    type:
      "linear",

    points

  };

}


/* =========================================================
   MATH SOLVER
========================================================= */

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
          solveLinear(
            b,
            c
          );


        result.graph =
          createLinearGraph(
            b,
            c
          );


        return result;

      }


      if (
        Math.abs(c) < 1e-10
      ) {

        return {

          answer:
            "Infinitas soluções",

          steps: [

            {
              title:
                "Simplificar a equação",

              description:
                "Depois de simplificar os dois lados, obtemos 0 = 0."
            }

          ],

          methods: [],

          learning: {

            concept:
              "Quando uma equação se transforma em uma identidade, todos os valores permitidos da variável são soluções.",

            explanation:
              "A igualdade 0 = 0 é verdadeira independentemente do valor de x.",

            tip:
              "Simplifica ambos os lados antes de procurar uma solução única."

          }

        };

      }


      return {

        answer:
          "Sem solução",

        steps: [

          {
            title:
              "Simplificar a equação",

            description:
              `A equação transforma-se numa igualdade impossível: ${formatNumber(c)} = 0.`
          }

        ],

        methods: [],

        learning: {

          concept:
            "Uma equação sem solução não possui nenhum valor de x que satisfaça a igualdade.",

          explanation:
            "Depois de simplificar os termos, resta uma constante diferente de zero igual a zero.",

          tip:
            "Confirma os sinais e os termos constantes da equação."

        }

      };

    }

  }


  /* =====================================================
     BASIC CALCULATIONS
  ===================================================== */

  const expressionMatch =
    problem.match(
      /(?:calcule|calcular|calculate|quanto é|quanto e|resolva|resolve)?\s*([\d.,+\-*/^×÷() ]+)/i
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
            title:
              "Identificar a expressão",

            description:
              `A expressão a calcular é ${expression}.`
          },

          {
            title:
              "Efetuar os cálculos",

            description:
              "Resolvemos a expressão respeitando a ordem das operações.",

            formula:
              expression
          },

          {
            title:
              "Resultado",

            description:
              "O resultado final é:",

            formula:
              formatNumber(result)
          }

        ],

        methods: [

          {
            name:
              "Ordem das operações",

            description:
              "Multiplicações e divisões são realizadas antes de adições e subtrações.",

            result:
              formatNumber(result)
          }

        ],

        learning: {

          concept:
            "A ordem das operações determina a sequência correta dos cálculos.",

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


  /* =====================================================
     VELOCITY
  ===================================================== */

  if (
    text.includes("velocidade") &&
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


    if (
      distanceMatch &&
      timeMatch
    ) {

      const distance =
        Number(
          distanceMatch[1]
        );


      const distanceUnit =
        distanceMatch[2];


      const time =
        Number(
          timeMatch[1]
        );


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


      if (timeSeconds === 0) {
        return null;
      }


      const velocitySI =
        distanceMeters /
        timeSeconds;


      let originalVelocity =
        null;


      if (
        distanceUnit === "km" &&
        (
          timeUnit === "h" ||
          timeUnit === "hora" ||
          timeUnit === "horas"
        )
      ) {

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
            title:
              "Identificar os dados",

            description:
              `Distância = ${distance} ${distanceUnit}; tempo = ${time} ${timeUnit}.`
          },

          {
            title:
              "Usar a fórmula da velocidade",

            description:
              "A velocidade média é a distância dividida pelo tempo.",

            formula:
              "v = d / t"
          },

          {
            title:
              "Substituir os valores",

            description:
              "Mantemos também as unidades originais quando possível.",

            formula:
              originalVelocity !== null
                ? `v = ${distance} km / ${time} h`
                : `v = ${distanceMeters} m / ${timeSeconds} s`
          },

          {
            title:
              "Resultado",

            description:
              "A velocidade média é:",

            formula:
              answer
          }

        ],

        methods: [

          {
            name:
              "Fórmula da velocidade",

            description:
              "Divide a distância percorrida pelo intervalo de tempo.",

            result:
              answer
          },

          {
            name:
              "Sistema Internacional",

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
            "Dividimos a distância pelo tempo para descobrir quanto espaço é percorrido em cada unidade de tempo.",

          tip:
            "Confirma sempre as unidades. km/h e m/s representam a mesma grandeza."

        }

      };

    }

  }


  /* =====================================================
     FORCE
  ===================================================== */

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
            title:
              "Identificar os dados",

            description:
              `Massa = ${formatNumber(mass)} kg e aceleração = ${formatNumber(acceleration)} m/s².`
          },

          {
            title:
              "Usar a segunda lei de Newton",

            description:
              "A força resultante é o produto da massa pela aceleração.",

            formula:
              "F = m × a"
          },

          {
            title:
              "Substituir os valores",

            description:
              "Colocamos os valores conhecidos na fórmula.",

            formula:
              `F = ${formatNumber(mass)} × ${formatNumber(acceleration)}`
          },

          {
            title:
              "Resultado",

            description:
              "A força resultante é:",

            formula:
              `F = ${formatNumber(force)} N`
          }

        ],

        methods: [

          {
            name:
              "Segunda lei de Newton",

            description:
              "Relaciona força, massa e aceleração.",

            result:
              `${formatNumber(force)} N`
          }

        ],

        learning: {

          concept:
            "A segunda lei de Newton é F = ma.",

          explanation:
            "Para uma mesma massa, aumentar a aceleração aumenta proporcionalmente a força necessária.",

          tip:
            "A unidade da força no SI é o newton (N)."

        }

      };

    }

  }


  /* =====================================================
     DENSITY
  ===================================================== */

  if (
    text.includes("densidade") &&
    (
      text.includes("massa") ||
      text.includes("kg") ||
      text.includes("g")
    ) &&
    (
      text.includes("volume") ||
      text.includes("litro") ||
      text.includes("m³") ||
      text.includes("m3")
    )
  ) {

    const massMatch =
      text.match(
        /(\d+(?:\.\d+)?)\s*(kg|g)\b/
      );


    const volumeMatch =
      text.match(
        /(\d+(?:\.\d+)?)\s*(m3|m³|l|litro|litros)\b/
      );


    if (
      massMatch &&
      volumeMatch
    ) {

      const mass =
        Number(
          massMatch[1]
        );


      const massUnit =
        massMatch[2];


      const volume =
        Number(
          volumeMatch[1]
        );


      const volumeUnit =
        volumeMatch[2];


      const massKg =
        massUnit === "g"
          ? mass / 1000
          : mass;


      const volumeM3 =
        (
          volumeUnit === "l" ||
          volumeUnit === "litro" ||
          volumeUnit === "litros"
        )
          ? volume / 1000
          : volume;


      if (volumeM3 === 0) {
        return null;
      }


      const density =
        massKg / volumeM3;


      return {

        answer:
          `${formatNumber(density)} kg/m³`,

        steps: [

          {
            title:
              "Identificar os dados",

            description:
              `Massa = ${mass} ${massUnit}; volume = ${volume} ${volumeUnit}.`
          },

          {
            title:
              "Usar a fórmula da densidade",

            description:
              "A densidade é a massa dividida pelo volume.",

            formula:
              "ρ = m / V"
          },

          {
            title:
              "Converter para o SI",

            description:
              `Massa = ${formatNumber(massKg)} kg; volume = ${formatNumber(volumeM3)} m³.`
          },

          {
            title:
              "Resultado",

            description:
              "A densidade é:",

            formula:
              `ρ = ${formatNumber(density)} kg/m³`
          }

        ],

        methods: [

          {
            name:
              "Densidade",

            description:
              "Relaciona a quantidade de massa com o espaço ocupado.",

            result:
              `${formatNumber(density)} kg/m³`
          }

        ],

        learning: {

          concept:
            "Densidade é a quantidade de massa existente por unidade de volume.",

          explanation:
            "Dividir a massa pelo volume mostra quanta massa está concentrada em cada unidade de espaço.",

          tip:
            "No SI, a densidade é expressa em kg/m³."

        }

      };

    }

  }


  /* =====================================================
     OHM'S LAW
  ===================================================== */

  if (
    (
      text.includes("resistência") ||
      text.includes("resistencia")
    ) &&
    (
      text.includes("tensão") ||
      text.includes("tensao") ||
      text.includes("voltagem") ||
      text.includes("volts")
    ) &&
    (
      text.includes("corrente") ||
      text.includes("ampere") ||
      text.includes("ampères")
    )
  ) {

    const voltage =
      extractNumber(
        text,
        /(\d+(?:\.\d+)?)\s*v\b/
      );


    const current =
      extractNumber(
        text,
        /(\d+(?:\.\d+)?)\s*a\b/
      );


    if (
      voltage !== null &&
      current !== null &&
      current !== 0
    ) {

      const resistance =
        voltage / current;


      return {

        answer:
          `${formatNumber(resistance)} Ω`,

        steps: [

          {
            title:
              "Identificar os dados",

            description:
              `Tensão = ${formatNumber(voltage)} V; corrente = ${formatNumber(current)} A.`
          },

          {
            title:
              "Usar a lei de Ohm",

            description:
              "A resistência é a tensão dividida pela corrente.",

            formula:
              "R = V / I"
          },

          {
            title:
              "Substituir os valores",

            description:
              "Colocamos os valores na fórmula.",

            formula:
              `R = ${formatNumber(voltage)} / ${formatNumber(current)}`
          },

          {
            title:
              "Resultado",

            description:
              "A resistência é:",

            formula:
              `R = ${formatNumber(resistance)} Ω`
          }

        ],

        methods: [

          {
            name:
              "Lei de Ohm",

            description:
              "Relaciona tensão, corrente e resistência.",

            result:
              `${formatNumber(resistance)} Ω`
          }

        ],

        learning: {

          concept:
            "A lei de Ohm é V = RI.",

          explanation:
            "Se conhecemos a tensão e a corrente, podemos reorganizar a fórmula para obter R = V/I.",

          tip:
            "Mantém a tensão em volts e a corrente em ampères para obter a resistência em ohms."

        }

      };

    }

  }


  /* =====================================================
     ELECTRICAL POWER
  ===================================================== */

  if (
    text.includes("potência") ||
    text.includes("potencia")
  ) {

    const voltage =
      extractNumber(
        text,
        /(\d+(?:\.\d+)?)\s*v\b/
      );


    const current =
      extractNumber(
        text,
        /(\d+(?:\.\d+)?)\s*a\b/
      );


    if (
      voltage !== null &&
      current !== null
    ) {

      const power =
        voltage * current;


      return {

        answer:
          `${formatNumber(power)} W`,

        steps: [

          {
            title:
              "Identificar os dados",

            description:
              `Tensão = ${voltage} V; corrente = ${current} A.`
          },

          {
            title:
              "Usar a fórmula da potência elétrica",

            description:
              "A potência pode ser calculada multiplicando tensão e corrente.",

            formula:
              "P = V × I"
          },

          {
            title:
              "Substituir",

            description:
              "Aplicamos os valores fornecidos.",

            formula:
              `P = ${voltage} × ${current}`
          },

          {
            title:
              "Resultado",

            description:
              "A potência é:",

            formula:
              `P = ${formatNumber(power)} W`
          }

        ],

        methods: [

          {
            name:
              "Potência elétrica",

            description:
              "Calcula a potência usando tensão e corrente.",

            result:
              `${formatNumber(power)} W`
          }

        ],

        learning: {

          concept:
            "Potência elétrica mede a taxa de transferência de energia elétrica.",

          explanation:
            "Quanto maior a tensão ou a corrente, maior será a potência, mantendo a outra grandeza constante.",

          tip:
            "No SI, a potência é medida em watts (W)."

        }

      };

    }

  }


  return null;

}


/* =========================================================
   CHEMISTRY ENGINE
========================================================= */

const ATOMIC_MASSES = {

  H: 1.008,
  He: 4.003,

  Li: 6.94,
  Be: 9.012,
  B: 10.81,
  C: 12.011,
  N: 14.007,
  O: 15.999,
  F: 18.998,
  Ne: 20.180,

  Na: 22.990,
  Mg: 24.305,
  Al: 26.982,
  Si: 28.085,
  P: 30.974,
  S: 32.06,
  Cl: 35.45,
  Ar: 39.948,

  K: 39.098,
  Ca: 40.078,
  Sc: 44.956,
  Ti: 47.867,
  V: 50.942,
  Cr: 52.00,
  Mn: 54.938,
  Fe: 55.845,
  Co: 58.933,
  Ni: 58.693,
  Cu: 63.546,
  Zn: 65.38,

  Br: 79.904,
  Ag: 107.868,
  I: 126.904,
  Ba: 137.327,
  Au: 196.967,
  Hg: 200.592,
  Pb: 207.2

};


/* =========================================================
   CHEMICAL FORMULA PARSER
========================================================= */

function parseFormula(formula) {

  if (
    typeof formula !== "string" ||
    !formula.trim()
  ) {
    return null;
  }


  const clean =
    formula
      .replace(/\s+/g, "")
      .replace(
        /[₀₁₂₃₄₅₆₇₈₉]/g,
        char => {

          const map = {

            "₀": "0",
            "₁": "1",
            "₂": "2",
            "₃": "3",
            "₄": "4",
            "₅": "5",
            "₆": "6",
            "₇": "7",
            "₈": "8",
            "₉": "9"

          };

          return map[char];

        }
      );


  const regex =
    /([A-Z][a-z]?)(\d*)/g;


  const atoms = {};


  let match;

  let consumed = 0;


  while (
    (match = regex.exec(clean)) !== null
  ) {

    if (
      match.index !== consumed
    ) {
      return null;
    }


    const element =
      match[1];


    const count =
      match[2]
        ? Number(match[2])
        : 1;


    if (
      !ATOMIC_MASSES[element]
    ) {
      return null;
    }


    if (
      !Number.isFinite(count) ||
      count <= 0
    ) {
      return null;
    }


    atoms[element] =
      (atoms[element] || 0) +
      count;


    consumed =
      regex.lastIndex;

  }


  if (
    consumed !== clean.length
  ) {
    return null;
  }


  return atoms;

}


/* =========================================================
   MOLAR MASS
========================================================= */

function molarMass(formula) {

  const atoms =
    parseFormula(formula);


  if (!atoms) {
    return null;
  }


  let total = 0;


  for (
    const [
      element,
      count
    ]
    of Object.entries(atoms)
  ) {

    total +=
      ATOMIC_MASSES[element] *
      count;

  }


  return {

    atoms,

    mass:
      round(total, 3)

  };

}


/* =========================================================
   CHEMISTRY SOLVER
========================================================= */

function solveChemistry(problem) {

  const text =
    problem.trim();


  const lower =
    text.toLowerCase();


  /* =====================================================
     MOLAR MASS
  ===================================================== */

  if (
    lower.includes("massa molar")
  ) {

    const formulaMatches =
      text.match(
        /\b[A-Z][A-Za-z0-9₀₁₂₃₄₅₆₇₈₉]*\b/g
      );


    if (formulaMatches) {

      for (
        const formula
        of formulaMatches
      ) {

        const result =
          molarMass(formula);


        if (!result) {
          continue;
        }


        const breakdown =
          Object.entries(
            result.atoms
          )
            .map(
              ([element, count]) =>
                `${element}: ${count}`
            )
            .join(", ");


        return {

          answer:
            `${formatNumber(result.mass)} g/mol`,

          steps: [

            {
              title:
                "Identificar a fórmula",

              description:
                `A fórmula química analisada é ${formula}.`
            },

            {
              title:
                "Contar os átomos",

              description:
                `Composição: ${breakdown}.`
            },

            {
              title:
                "Somar as massas atómicas",

              description:
                "Multiplicamos a massa atómica de cada elemento pelo número de átomos presentes."
            },

            {
              title:
                "Resultado",

              description:
                "A massa molar é:",

              formula:
                `M(${formula}) = ${formatNumber(result.mass)} g/mol`
            }

          ],

          methods: [

            {
              name:
                "Soma das massas atómicas",

              description:
                "Calcula a massa molar somando as contribuições de todos os átomos da fórmula.",

              result:
                `${formatNumber(result.mass)} g/mol`
            }

          ],

          learning: {

            concept:
              "Massa molar é a massa correspondente a um mol de uma substância.",

            explanation:
              "Para encontrar a massa molar, somamos as massas atómicas de todos os átomos presentes na fórmula.",

            tip:
              "Os números pequenos depois dos símbolos químicos indicam quantos átomos daquele elemento existem."

          }

        };

      }

    }

  }


  /* =====================================================
     MOLES
  ===================================================== */

  if (
    (
      lower.includes("quantos mol") ||
      lower.includes("número de mol") ||
      lower.includes("numero de mol")
    ) &&
    (
      lower.includes(" g") ||
      lower.includes("gram")
    )
  ) {

    const mass =
      extractNumber(
        text,
        /(\d+(?:\.\d+)?)\s*g\b/i
      );


    const formulaMatches =
      text.match(
        /\b[A-Z][A-Za-z0-9₀₁₂₃₄₅₆₇₈₉]*\b/g
      );


    if (
      mass !== null &&
      formulaMatches
    ) {

      for (
        const formula
        of formulaMatches
      ) {

        const molar =
          molarMass(formula);


        if (!molar) {
          continue;
        }


        const moles =
          mass / molar.mass;


        return {

          answer:
            `${formatNumber(moles)} mol`,

          steps: [

            {
              title:
                "Identificar os dados",

              description:
                `Massa = ${formatNumber(mass)} g; substância = ${formula}.`
            },

            {
              title:
                "Calcular a massa molar",

              description:
                `A massa molar de ${formula} é ${formatNumber(molar.mass)} g/mol.`,

              formula:
                `M = ${formatNumber(molar.mass)} g/mol`
            },

            {
              title:
                "Usar a fórmula dos mols",

              description:
                "O número de mols é a massa dividida pela massa molar.",

              formula:
                "n = m / M"
            },

            {
              title:
                "Substituir",

              description:
                "Aplicamos os valores.",

              formula:
                `n = ${formatNumber(mass)} / ${formatNumber(molar.mass)}`
            },

            {
              title:
                "Resultado",

              description:
                "A quantidade de matéria é:",

              formula:
                `n = ${formatNumber(moles)} mol`
            }

          ],

          methods: [

            {
              name:
                "Relação massa–mol",

              description:
                "Usa n = m/M.",

              result:
                `${formatNumber(moles)} mol`
            }

          ],

          learning: {

            concept:
              "O mol é uma unidade usada para representar quantidade de matéria.",

            explanation:
              "Se conhecemos a massa de uma substância e a sua massa molar, podemos descobrir quantos mols ela representa.",

            tip:
              "Mantém a massa em gramas quando a massa molar estiver em g/mol."

          }

        };

      }

    }

  }


  /* =====================================================
     MASS CONCENTRATION
  ===================================================== */

  if (
    lower.includes("concentração") ||
    lower.includes("concentracao")
  ) {

    if (
      !lower.includes("molar") &&
      !lower.includes("molaridade")
    ) {

      const mass =
        extractNumber(
          text,
          /(\d+(?:\.\d+)?)\s*g\b/i
        );


      const volume =
        extractNumber(
          text,
          /(\d+(?:\.\d+)?)\s*l\b/i
        );


      if (
        mass !== null &&
        volume !== null &&
        volume !== 0
      ) {

        const concentration =
          mass / volume;


        return {

          answer:
            `${formatNumber(concentration)} g/L`,

          steps: [

            {
              title:
                "Identificar os dados",

              description:
                `Massa do soluto = ${mass} g; volume da solução = ${volume} L.`
            },

            {
              title:
                "Usar a fórmula da concentração",

              description:
                "A concentração comum é a massa do soluto dividida pelo volume da solução.",

              formula:
                "C = m / V"
            },

            {
              title:
                "Substituir",

              description:
                "Aplicamos os valores fornecidos.",

              formula:
                `C = ${mass} / ${volume}`
            },

            {
              title:
                "Resultado",

              description:
                "A concentração é:",

              formula:
                `C = ${formatNumber(concentration)} g/L`
            }

          ],

          methods: [

            {
              name:
                "Concentração comum",

              description:
                "Relaciona massa de soluto e volume de solução.",

              result:
                `${formatNumber(concentration)} g/L`
            }

          ],

          learning: {

            concept:
              "A concentração comum indica a massa de soluto existente por unidade de volume da solução.",

            explanation:
              "Dividimos a massa do soluto pelo volume da solução para saber quanta massa está presente em cada litro.",

            tip:
              "Quando usares C = m/V, confirma que a massa está em gramas e o volume em litros para obter g/L."

          }

        };

      }

    }

  }


  /* =====================================================
     MOLAR CONCENTRATION
  ===================================================== */

  if (
    lower.includes("concentração molar") ||
    lower.includes("concentracao molar") ||
    lower.includes("molaridade")
  ) {

    const moles =
      extractNumber(
        text,
        /(\d+(?:\.\d+)?)\s*mol\b/i
      );


    const volume =
      extractNumber(
        text,
        /(\d+(?:\.\d+)?)\s*l\b/i
      );


    if (
      moles !== null &&
      volume !== null &&
      volume !== 0
    ) {

      const concentration =
        moles / volume;


      return {

        answer:
          `${formatNumber(concentration)} mol/L`,

        steps: [

          {
            title:
              "Identificar os dados",

            description:
              `Quantidade de matéria = ${moles} mol; volume = ${volume} L.`
          },

          {
            title:
              "Usar a fórmula da molaridade",

            description:
              "A concentração molar é a quantidade de matéria dividida pelo volume.",

            formula:
              "C = n / V"
          },

          {
            title:
              "Substituir",

            description:
              "Aplicamos os valores.",

            formula:
              `C = ${moles} / ${volume}`
          },

          {
            title:
              "Resultado",

            description:
              "A concentração molar é:",

            formula:
              `C = ${formatNumber(concentration)} mol/L`
          }

        ],

        methods: [

          {
            name:
              "Molaridade",

            description:
              "Relaciona quantidade de matéria e volume da solução.",

            result:
              `${formatNumber(concentration)} mol/L`
          }

        ],

        learning: {

          concept:
            "Molaridade é a quantidade de mols de soluto por litro de solução.",

          explanation:
            "A fórmula C = n/V mostra quantos mols estão presentes em cada litro da solução.",

          tip:
            "O volume deve estar em litros para obter mol/L."

        }

      };

    }

  }


  return null;

}


/* =========================================================
   MAIN SOLVER
========================================================= */

function solveProblem(problem, subject) {

  const clean =
    cleanProblem(problem);


  if (!clean) {
    return null;
  }


  if (subject === "math") {

    return solveMath(clean);

  }


  if (subject === "physics") {

    return solvePhysics(clean);

  }


  if (subject === "chemistry") {

    return solveChemistry(clean);

  }


  return null;

}


/* =========================================================
   API STATUS
========================================================= */

app.get(
  "/api/status",
  (req, res) => {

    res.json({

      success:
        true,

      name:
        "EinsteinWeb",

      brain:
        "Einstein Brain V0.4",

      status:
        "online",

      engines: {

        mathematics:
          "active",

        physics:
          "active",

        chemistry:
          "active",

        artificialIntelligence:
          "not_connected"

      }

    });

  }
);


/* =========================================================
   API SOLVE
========================================================= */

app.post(
  "/api/solve",
  (req, res) => {

    try {

      const {
        problem,
        subject
      } = req.body || {};


      if (
        typeof problem !== "string" ||
        !problem.trim()
      ) {

        return res.status(400).json({

          success:
            false,

          error:
            "Digite um problema."

        });

      }


      const selectedSubject =
        [
          "math",
          "physics",
          "chemistry"
        ].includes(subject)
          ? subject
          : "math";


      const result =
        solveProblem(
          problem,
          selectedSubject
        );


      if (!result) {

        return res.status(422).json({

          success:
            false,

          error:
            "Não foi possível encontrar uma forma de resolver este problema com o Einstein Brain V0.4. Tente escrever o problema com mais detalhes."

        });

      }


      return res.json({

        success:
          true,

        subject:
          selectedSubject,

        result

      });

    } catch (error) {

      console.error(
        "Solve error:",
        error
      );


      return res.status(500).json({

        success:
          false,

        error:
          "Ocorreu um erro interno ao processar o problema."

      });

    }

  }
);


/* =========================================================
   FRONTEND FALLBACK
   Express 5 compatible
========================================================= */

app.use(
  (req, res) => {

    res.sendFile(
      path.join(
        publicPath,
        "index.html"
      )
    );

  }
);


/* =========================================================
   START
========================================================= */

app.listen(
  PORT,
  () => {

    console.log("");

    console.log(
      "========================================"
    );

    console.log(
      "       EINSTEINWEB"
    );

    console.log(
      "       Einstein Brain V0.4"
    );

    console.log(
      "========================================"
    );

    console.log(
      `Server running on port ${PORT}`
    );

    console.log(
      "Mathematics Engine: ACTIVE"
    );

    console.log(
      "Physics Engine: ACTIVE"
    );

    console.log(
      "Chemistry Engine: ACTIVE"
    );

    console.log(
      "AI Layer: NOT CONNECTED"
    );

    console.log(
      "========================================"
    );

  }
);
