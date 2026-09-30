```javascript
/* =========================================================
   EINSTEINWEB
   Einstein Brain V0.5
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

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(express.static(publicPath));

/* =========================================================
   UTILITIES
========================================================= */

function cleanProblem(problem) {
  if (typeof problem !== "string") return "";

  return problem
    .trim()
    .replace(/\s+/g, " ");
}

function formatNumber(value) {
  if (typeof value !== "number") return String(value);

  if (!Number.isFinite(value)) return String(value);

  if (Math.abs(value) < 1e-10) {
    return "0";
  }

  const rounded = Math.round(value * 1e10) / 1e10;

  return String(rounded);
}

function round(value, decimals = 4) {
  const factor = Math.pow(10, decimals);

  return Math.round(value * factor) / factor;
}

function normalizeExpression(expression) {
  return String(expression)
    .replace(/,/g, ".")
    .replace(/[×x]/g, "*")
    .replace(/÷/g, "/")
    .replace(/−/g, "-")
    .replace(/\s+/g, "");
}

function safeEvaluate(expression) {
  try {
    const result = math.evaluate(
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
  const match = text.match(regex);

  if (!match) return null;

  const value = Number(
    String(match[1]).replace(",", ".")
  );

  return Number.isFinite(value)
    ? value
    : null;
}

/* =========================================================
   MATHEMATICS
========================================================= */

function splitEquation(problem) {
  const match = problem.match(/(.+?)\s*=\s*(.+)/);

  if (!match) return null;

  return {
    left: match[1].trim(),
    right: match[2].trim()
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
              "A igualdade é verdadeira para qualquer valor de x."
          }
        ],

        methods: [
          {
            name: "Análise algébrica",
            description:
              "Os dois lados da equação são equivalentes.",
            result: "Infinitas soluções"
          }
        ],

        learning: {
          concept:
            "Uma equação pode possuir infinitas soluções quando os dois lados são equivalentes.",
          explanation:
            "Depois de simplificar a equação, não resta nenhuma condição sobre x.",
          tip:
            "Simplifica os dois lados antes de procurar o valor de x."
        }
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
      ],

      methods: [
        {
          name: "Análise algébrica",
          description:
            "A igualdade não pode ser satisfeita.",
          result: "Sem solução"
        }
      ],

      learning: {
        concept:
          "Uma equação sem solução é uma igualdade impossível.",
        explanation:
          "Depois da simplificação, obtém-se uma afirmação falsa.",
        tip:
          "Verifica se os termos constantes foram transpostos corretamente."
      }
    };
  }

  const x = -b / a;

  return {
    answer: `x = ${formatNumber(x)}`,

    steps: [
      {
        title: "Identificar a equação",
        description:
          `Temos uma equação linear: ${formatNumber(a)}x + ${formatNumber(b)} = 0.`,
        formula:
          `${formatNumber(a)}x + ${formatNumber(b)} = 0`
      },

      {
        title: "Isolar o termo com x",
        description:
          `Passamos ${formatNumber(b)} para o outro lado.`,
        formula:
          `${formatNumber(a)}x = ${formatNumber(-b)}`
      },

      {
        title: "Dividir pelo coeficiente de x",
        description:
          `Dividimos os dois lados por ${formatNumber(a)}.`,
        formula:
          `x = ${formatNumber(-b)} / ${formatNumber(a)}`
      },

      {
        title: "Resultado",
        description:
          "O valor de x é:",
        formula:
          `x = ${formatNumber(x)}`
      }
    ],

    methods: [
      {
        name: "Isolamento algébrico",
        description:
          "Isolamos x através de operações equivalentes.",
        result:
          `x = ${formatNumber(x)}`
      }
    ],

    learning: {
      concept:
        "Uma equação linear possui a variável no primeiro grau.",
      explanation:
        "O objetivo é deixar x sozinho num dos lados da igualdade.",
      tip:
        "Em ax + b = 0, podes usar x = -b/a quando a ≠ 0."
    }
  };
}

function solveQuadratic(a, b, c) {
  if (Math.abs(a) < 1e-12) {
    return solveLinear(b, c);
  }

  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    const realPart = -b / (2 * a);

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
            `A equação é ${formatNumber(a)}x² + ${formatNumber(b)}x + ${formatNumber(c)} = 0.`,
          formula:
            `${formatNumber(a)}x² + ${formatNumber(b)}x + ${formatNumber(c)} = 0`
        },

        {
          title: "Calcular o discriminante",
          description:
            "Usamos Δ = b² − 4ac.",
          formula:
            `Δ = ${formatNumber(discriminant)}`
        },

        {
          title: "Interpretar o discriminante",
          description:
            "Como Δ < 0, não existem raízes reais."
        },

        {
          title: "Resultado",
          description:
            "As raízes são complexas.",
          formula:
            `x = ${formatNumber(realPart)} ± ${formatNumber(imaginaryPart)}i`
        }
      ],

      methods: [
        {
          name: "Fórmula quadrática",
          description:
            "Usamos a fórmula de Bhaskara no conjunto dos números complexos.",
          result:
            `x = ${formatNumber(realPart)} ± ${formatNumber(imaginaryPart)}i`
        }
      ],

      learning: {
        concept:
          "O discriminante determina a natureza das raízes de uma equação quadrática.",
        explanation:
          "Quando Δ < 0, a equação não possui soluções reais.",
        tip:
          "Δ > 0: duas raízes reais; Δ = 0: uma raiz real dupla; Δ < 0: raízes complexas."
      }
    };
  }

  const sqrtD = Math.sqrt(discriminant);

  const x1 =
    (-b + sqrtD) /
    (2 * a);

  const x2 =
    (-b - sqrtD) /
    (2 * a);

  const equal =
    Math.abs(x1 - x2) < 1e-10;

  return {
    answer:
      equal
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
          `Δ = ${formatNumber(discriminant)}`
      },

      {
        title: "Calcular √Δ",
        description:
          "Como o discriminante é não negativo, calculamos a sua raiz quadrada.",
        formula:
          `√Δ = ${formatNumber(sqrtD)}`
      },

      {
        title: "Aplicar a fórmula quadrática",
        description:
          "Substituímos os valores na fórmula.",
        formula:
          `x = (-b ± √Δ) / 2a`
      },

      {
        title: "Resultado",
        description:
          equal
            ? "As duas raízes são iguais."
            : "Existem duas raízes reais.",
        formula:
          equal
            ? `x = ${formatNumber(x1)}`
            : `x₁ = ${formatNumber(x1)} ; x₂ = ${formatNumber(x2)}`
      }
    ],

    methods: [
      {
        name: "Fórmula quadrática",
        description:
          "Método geral para resolver equações do segundo grau.",
        result:
          equal
            ? `x = ${formatNumber(x1)}`
            : `x₁ = ${formatNumber(x1)}, x₂ = ${formatNumber(x2)}`
      }
    ],

    graph: createQuadraticGraph(a, b, c),

    learning: {
      concept:
        "Uma equação quadrática é uma equação de segundo grau.",
      explanation:
        "O discriminante ajuda a determinar a quantidade e o tipo das raízes.",
      tip:
        "Organiza sempre a equação na forma ax² + bx + c = 0."
    }
  };
}

function parsePolynomial(expression) {
  try {
    const normalized =
      normalizeExpression(expression);

    const node = math.parse(normalized);

    const compiled = node.compile();

    const values = [];

    [-2, -1, 0, 1, 2].forEach(x => {
      try {
        const y =
          Number(
            compiled.evaluate({ x })
          );

        values.push({ x, y });
      } catch {
        values.push({ x, y: NaN });
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
    x += 0.5
  ) {
    points.push({
      x,
      y: round(a * x + b, 4)
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
      const { a, b, c } = polynomial;

      if (Math.abs(a) > 1e-10) {
        return solveQuadratic(
          a,
          b,
          c
        );
      }

      if (Math.abs(b) > 1e-10) {
        const result =
          solveLinear(b, c);

        result.graph =
          createLinearGraph(
            b,
            c
          );

        return result;
      }

      return {
        answer:
          Math.abs(c) < 1e-10
            ? "Todos os valores de x são soluções."
            : "Sem solução",

        steps: [
          {
            title: "Simplificar a equação",
            description:
              `A expressão reduz-se a ${formatNumber(c)} = 0.`
          }
        ]
      };
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
              `A expressão é ${expression}.`
          },

          {
            title: "Efetuar os cálculos",
            description:
              "Aplicamos a ordem correta das operações.",
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
              "Parênteses, potências, multiplicações/divisões e depois adições/subtrações.",
            result:
              formatNumber(result)
          }
        ],

        learning: {
          concept:
            "A ordem das operações define a sequência correta de cálculo.",
          explanation:
            "Operações com maior prioridade devem ser realizadas primeiro.",
          tip:
            "Usa parênteses para tornar a ordem do cálculo clara."
        }
      };
    }
  }

  return null;
}

/* =========================================================
   PHYSICS
========================================================= */

function solvePhysics(problem) {
  const text =
    problem
      .toLowerCase()
      .replace(/,/g, ".");

  /* VELOCIDADE */

  if (
    text.includes("velocidade") &&
    (
      text.includes("distância") ||
      text.includes("distancia") ||
      text.includes("percorre") ||
      text.includes("percorreu")
    ) &&
    (
      text.includes("tempo") ||
      text.includes("hora") ||
      text.includes("segundo")
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

      const answer =
        distanceUnit === "km" &&
        (
          timeUnit === "h" ||
          timeUnit === "hora" ||
          timeUnit === "horas"
        )
          ? `${formatNumber(distance / time)} km/h (${formatNumber(velocitySI)} m/s)`
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
            title: "Usar a fórmula",
            description:
              "A velocidade média é a distância dividida pelo tempo.",
            formula:
              "v = d / t"
          },

          {
            title: "Substituir",
            description:
              "Colocamos os valores na fórmula.",
            formula:
              `v = ${distanceMeters} / ${timeSeconds}`
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
            name: "Velocidade média",
            description:
              "Divide a distância pelo intervalo de tempo.",
            result:
              answer
          }
        ],

        learning: {
          concept:
            "Velocidade média é a razão entre distância percorrida e tempo.",
          explanation:
            "Ela indica quanto espaço é percorrido por unidade de tempo.",
          tip:
            "Confirma sempre as unidades usadas."
        }
      };
    }
  }

  /* FORÇA */

  if (
    text.includes("força") &&
    text.includes("massa") &&
    (
      text.includes("aceleração") ||
      text.includes("aceleracao")
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
              `Massa = ${mass} kg; aceleração = ${acceleration} m/s².`
          },

          {
            title: "Usar a segunda lei de Newton",
            description:
              "F = m × a",
            formula:
              "F = m × a"
          },

          {
            title: "Substituir",
            description:
              "Colocamos os valores.",
            formula:
              `F = ${mass} × ${acceleration}`
          },

          {
            title: "Resultado",
            description:
              "A força resultante é:",
            formula:
              `F = ${formatNumber(force)} N`
          }
        ],

        methods: [
          {
            name: "Segunda lei de Newton",
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
            "A força resultante depende da massa e da aceleração.",
          tip:
            "A força no SI é medida em newtons (N)."
        }
      };
    }
  }

  /* DENSIDADE */

  if (
    text.includes("densidade") &&
    (
      text.includes("massa") ||
      text.includes("kg")
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

    if (massMatch && volumeMatch) {
      const mass =
        Number(massMatch[1]);

      const massUnit =
        massMatch[2];

      const volume =
        Number(volumeMatch[1]);

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
            title: "Identificar os dados",
            description:
              `Massa = ${mass} ${massUnit}; volume = ${volume} ${volumeUnit}.`
          },

          {
            title: "Usar a fórmula",
            description:
              "A densidade é massa dividida pelo volume.",
            formula:
              "ρ = m / V"
          },

          {
            title: "Converter para SI",
            description:
              `Massa = ${formatNumber(massKg)} kg; volume = ${formatNumber(volumeM3)} m³.`
          },

          {
            title: "Resultado",
            description:
              "A densidade é:",
            formula:
              `ρ = ${formatNumber(density)} kg/m³`
          }
        ],

        methods: [
          {
            name: "Densidade",
            description:
              "Relaciona massa e volume.",
            result:
              `${formatNumber(density)} kg/m³`
          }
        ],

        learning: {
          concept:
            "Densidade é a massa por unidade de volume.",
          explanation:
            "Divide-se a massa pelo volume.",
          tip:
            "No SI, a unidade é kg/m³."
        }
      };
    }
  }

  /* LEI DE OHM */

  if (
    text.includes("resistência") &&
    (
      text.includes("tensão") ||
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
            title: "Identificar os dados",
            description:
              `Tensão = ${voltage} V; corrente = ${current} A.`
          },

          {
            title: "Usar a lei de Ohm",
            description:
              "A resistência é tensão dividida pela corrente.",
            formula:
              "R = V / I"
          },

          {
            title: "Substituir",
            description:
              "Aplicamos os valores.",
            formula:
              `R = ${voltage} / ${current}`
          },

          {
            title: "Resultado",
            description:
              "A resistência é:",
            formula:
              `R = ${formatNumber(resistance)} Ω`
          }
        ],

        methods: [
          {
            name: "Lei de Ohm",
            description:
              "Relaciona tensão, corrente e resistência.",
            result:
              `${formatNumber(resistance)} Ω`
          }
        ],

        learning: {
          concept:
            "A lei de Ohm pode ser escrita como V = RI.",
          explanation:
            "Conhecendo tensão e corrente, podemos calcular resistência.",
          tip:
            "Mantém a tensão em volts e a corrente em ampères."
        }
      };
    }
  }

  /* POTÊNCIA */

  if (
    text.includes("potência") &&
    (
      text.includes("volts") ||
      /\d+\s*v\b/.test(text)
    ) &&
    (
      text.includes("ampere") ||
      /\d+\s*a\b/.test(text)
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
      current !== null
    ) {
      const power =
        voltage * current;

      return {
        answer:
          `${formatNumber(power)} W`,

        steps: [
          {
            title: "Identificar os dados",
            description:
              `Tensão = ${voltage} V; corrente = ${current} A.`
          },

          {
            title: "Usar a fórmula",
            description:
              "P = V × I",
            formula:
              "P = V × I"
          },

          {
            title: "Substituir",
            description:
              "Aplicamos os valores.",
            formula:
              `P = ${voltage} × ${current}`
          },

          {
            title: "Resultado",
            description:
              "A potência é:",
            formula:
              `P = ${formatNumber(power)} W`
          }
        ],

        methods: [
          {
            name: "Potência elétrica",
            description:
              "Calcula a potência através de tensão e corrente.",
            result:
              `${formatNumber(power)} W`
          }
        ],

        learning: {
          concept:
            "Potência elétrica é a taxa de transferência de energia elétrica.",
          explanation:
            "P = V × I relaciona potência, tensão e corrente.",
          tip:
            "A unidade SI da potência é o watt (W)."
        }
      };
    }
  }

  return null;
}

/* =========================================================
   CHEMISTRY
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

function parseFormula(formula) {
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
    if (match.index !== consumed) {
      return null;
    }

    const element =
      match[1];

    const count =
      match[2]
        ? Number(match[2])
        : 1;

    if (!ATOMIC_MASSES[element]) {
      return null;
    }

    atoms[element] =
      (atoms[element] || 0) +
      count;

    consumed =
      regex.lastIndex;
  }

  if (consumed !== clean.length) {
    return null;
  }

  return atoms;
}

function molarMass(formula) {
  const atoms =
    parseFormula(formula);

  if (!atoms) {
    return null;
  }

  let total = 0;

  for (
    const [element, count]
    of Object.entries(atoms)
  ) {
    total +=
      ATOMIC_MASSES[element] *
      count;
  }

  return {
    atoms,
    mass: round(total, 3)
  };
}

function solveChemistry(problem) {
  const text =
    problem.trim();

  const lower =
    text.toLowerCase();

  /* MASSA MOLAR */

  if (
    lower.includes("massa molar")
  ) {
    const formulaMatch =
      text.match(
        /\b([A-Z][A-Za-z]?(?:\d+)*)\b/
      );

    if (formulaMatch) {
      const formula =
        formulaMatch[1];

      const result =
        molarMass(formula);

      if (result) {
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
              title: "Identificar a fórmula",
              description:
                `Fórmula analisada: ${formula}.`
            },

            {
              title: "Contar os átomos",
              description:
                `Composição: ${breakdown}.`
            },

            {
              title: "Somar as massas atómicas",
              description:
                "Multiplicamos cada massa atómica pelo número de átomos."
            },

            {
              title: "Resultado",
              description:
                "A massa molar é:",
              formula:
                `M(${formula}) = ${formatNumber(result.mass)} g/mol`
            }
          ],

          methods: [
            {
              name: "Soma das massas atómicas",
              description:
                "Soma as contribuições dos elementos da fórmula.",
              result:
                `${formatNumber(result.mass)} g/mol`
            }
          ],

          learning: {
            concept:
              "Massa molar é a massa correspondente a um mol de uma substância.",
            explanation:
              "É obtida somando as massas atómicas dos átomos presentes na fórmula.",
            tip:
              "Os índices da fórmula indicam a quantidade de átomos."
          }
        };
      }
    }
  }

  /* MOL */

  if (
    (
      lower.includes("quantos mol") ||
      lower.includes("número de mol") ||
      lower.includes("numero de mol")
    ) &&
    lower.includes("g")
  ) {
    const mass =
      extractNumber(
        text,
        /(\d+(?:\.\d+)?)\s*g\b/i
      );

    const formulaMatch =
      text.match(
        /\b([A-Z][A-Za-z]?(?:\d+)*)\b/
      );

    if (
      mass !== null &&
      formulaMatch
    ) {
      const formula =
        formulaMatch[1];

      const molar =
        molarMass(formula);

      if (molar) {
        const moles =
          mass / molar.mass;

        return {
          answer:
            `${formatNumber(moles)} mol`,

          steps: [
            {
              title: "Identificar os dados",
              description:
                `Massa = ${mass} g; substância = ${formula}.`
            },

            {
              title: "Calcular a massa molar",
              description:
                `M(${formula}) = ${molar.mass} g/mol`,
              formula:
                `M = ${molar.mass} g/mol`
            },

            {
              title: "Usar a fórmula",
              description:
                "n = m / M",
              formula:
                "n = m / M"
            },

            {
              title: "Substituir",
              description:
                "Aplicamos os valores.",
              formula:
                `n = ${mass} / ${molar.mass}`
            },

            {
              title: "Resultado",
              description:
                "A quantidade de matéria é:",
              formula:
                `n = ${formatNumber(moles)} mol`
            }
          ],

          methods: [
            {
              name: "Relação massa–mol",
              description:
                "Usa n = m/M.",
              result:
                `${formatNumber(moles)} mol`
            }
          ],

          learning: {
            concept:
              "O mol representa quantidade de matéria.",
            explanation:
              "Dividimos a massa pela massa molar.",
            tip:
              "Usa g e g/mol para obter o resultado em mol."
          }
        };
      }
    }
  }

  /* CONCENTRAÇÃO COMUM */

  if (
    lower.includes("concentração") &&
    !lower.includes("molar") &&
    (
      lower.includes("g/l") ||
      lower.includes("soluto")
    )
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
            title: "Identificar os dados",
            description:
              `Massa = ${mass} g; volume = ${volume} L.`
          },

          {
            title: "Usar a fórmula",
            description:
              "C = m / V",
            formula:
              "C = m / V"
          },

          {
            title: "Substituir",
            description:
              "Aplicamos os valores.",
            formula:
              `C = ${mass} / ${volume}`
          },

          {
            title: "Resultado",
            description:
              "A concentração é:",
            formula:
              `C = ${formatNumber(concentration)} g/L`
          }
        ],

        methods: [
          {
            name: "Concentração comum",
            description:
              "Relaciona massa do soluto e volume da solução.",
            result:
              `${formatNumber(concentration)} g/L`
          }
        ],

        learning: {
          concept:
            "Concentração comum é a massa de soluto por volume de solução.",
          explanation:
            "Divide-se a massa do soluto pelo volume da solução.",
          tip:
            "Usa g e L para obter g/L."
        }
      };
    }
  }

  /* MOLARIDADE */

  if (
    lower.includes("concentração molar") ||
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
            title: "Identificar os dados",
            description:
              `Quantidade de matéria = ${moles} mol; volume = ${volume} L.`
          },

          {
            title: "Usar a fórmula",
            description:
              "C = n / V",
            formula:
              "C = n / V"
          },

          {
            title: "Substituir",
            description:
              "Aplicamos os valores.",
            formula:
              `C = ${moles} / ${volume}`
          },

          {
            title: "Resultado",
            description:
              "A concentração molar é:",
            formula:
              `C = ${formatNumber(concentration)} mol/L`
          }
        ],

        methods: [
          {
            name: "Molaridade",
            description:
              "Relaciona quantidade de matéria e volume.",
            result:
              `${formatNumber(concentration)} mol/L`
          }
        ],

        learning: {
          concept:
            "Molaridade é a quantidade de mols de soluto por litro.",
          explanation:
            "Divide-se o número de mols pelo volume em litros.",
          tip:
            "O volume deve estar em litros."
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
   STATUS
========================================================= */

app.get(
  "/api/status",
  (req, res) => {
    res.json({
      success: true,
      name: "EinsteinWeb",
      brain: "Einstein Brain V0.5",
      status: "online",

      engines: {
        mathematics: "active",
        physics: "active",
        chemistry: "active",
        artificialIntelligence: "not_connected"
      }
    });
  }
);

/* =========================================================
   SOLVE API
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
          success: false,
          error: "Digite um problema."
        });
      }

      const selectedSubject =
        ["math", "physics", "chemistry"]
          .includes(subject)
          ? subject
          : "math";

      const result =
        solveProblem(
          problem,
          selectedSubject
        );

      if (!result) {
        return res.status(422).json({
          success: false,
          error:
            "O Einstein Brain não conseguiu interpretar este problema. Tente escrever os dados, unidades e pergunta com mais detalhes."
        });
      }

      return res.json({
        success: true,
        subject: selectedSubject,
        result
      });

    } catch (error) {
      console.error(
        "SOLVE ERROR:",
        error
      );

      return res.status(500).json({
        success: false,
        error:
          "Erro interno ao resolver o problema."
      });
    }
  }
);

/* =========================================================
   FRONTEND
========================================================= */

/*
   IMPORTANTE:
   Não usamos app.get("*").
   Express 5 / path-to-regexp gera erro com "*".
*/

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
  "0.0.0.0",
  () => {
    console.log("");
    console.log(
      "========================================"
    );
    console.log(
      "          EINSTEINWEB"
    );
    console.log(
      "          Einstein Brain V0.5"
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
```
