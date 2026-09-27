const express = require("express");
const path = require("path");
const math = require("mathjs");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));

const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

/* =========================================================
   EINSTEINWEB BRAIN V0.4
   Mathematics + Physics + Chemistry
   ========================================================= */

/* =========================================================
   GENERAL UTILITIES
   ========================================================= */

function formatNumber(value) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return value;
  }

  if (Math.abs(value) < 1e-12) {
    return 0;
  }

  return Number(Number(value).toFixed(10));
}

function cleanProblem(problem) {
  return String(problem || "")
    .trim()
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/,/g, ".")
    .replace(/\s+/g, " ");
}

function normalizeExpression(expression) {
  let s = String(expression || "").trim();

  s = s
    .replace(/²/g, "^2")
    .replace(/³/g, "^3")
    .replace(/⁴/g, "^4")
    .replace(/⁵/g, "^5")
    .replace(/−/g, "-")
    .replace(/×/g, "*")
    .replace(/÷/g, "/");

  // 2x -> 2*x
  s = s.replace(/(\d)\s*x\b/gi, "$1*x");

  // )x -> )*x
  s = s.replace(/\)\s*x\b/gi, ")*x");

  // 2(x+1) -> 2*(x+1)
  s = s.replace(/(\d)\s*\(/g, "$1*(");

  // x( ... ) -> x*(...)
  s = s.replace(/\bx\s*\(/gi, "x*(");

  return s;
}

function safeEvaluate(expression, scope = {}) {
  try {
    return math.evaluate(expression, scope);
  } catch {
    return null;
  }
}

function round(value) {
  return formatNumber(Number(value));
}

/* =========================================================
   MATHEMATICS ENGINE
   ========================================================= */

function splitEquation(problem) {
  const parts = problem.split("=");

  if (parts.length !== 2) {
    return null;
  }

  return {
    left: normalizeExpression(parts[0]),
    right: normalizeExpression(parts[1])
  };
}

function polynomialValue(coefficients, x) {
  let total = 0;

  for (let i = 0; i < coefficients.length; i++) {
    total += coefficients[i] * Math.pow(x, coefficients.length - 1 - i);
  }

  return total;
}

function parsePolynomial(problem) {
  const equation = splitEquation(problem);

  if (!equation) {
    return null;
  }

  const expression = `(${equation.left}) - (${equation.right})`;

  const values = [-2, -1, 0, 1, 2];

  const evaluated = values.map((x) => {
    const y = safeEvaluate(expression, { x });

    if (typeof y !== "number" || !Number.isFinite(y)) {
      return null;
    }

    return y;
  });

  if (evaluated.some((v) => v === null)) {
    return null;
  }

  // Try quadratic coefficients:
  // f(x) = ax² + bx + c

  const c = evaluated[2];

  const a =
    (evaluated[4] - 2 * evaluated[3] + 2 * evaluated[1] - evaluated[0]) /
    14;

  const b =
    (evaluated[3] - evaluated[1]) / 2;

  const possibleA = Math.abs(a) < 1e-9 ? 0 : a;
  const possibleB = Math.abs(b) < 1e-9 ? 0 : b;

  // Verify quadratic/linear model
  let valid = true;

  for (let i = 0; i < values.length; i++) {
    const predicted =
      possibleA * values[i] * values[i] +
      possibleB * values[i] +
      c;

    if (Math.abs(predicted - evaluated[i]) > 1e-6) {
      valid = false;
      break;
    }
  }

  if (!valid) {
    return null;
  }

  return {
    a: round(possibleA),
    b: round(possibleB),
    c: round(c)
  };
}

function solveLinear(a, b) {
  if (Math.abs(a) < 1e-12) {
    if (Math.abs(b) < 1e-12) {
      return {
        type: "identity",
        solutions: []
      };
    }

    return {
      type: "impossible",
      solutions: []
    };
  }

  return {
    type: "linear",
    solutions: [round(-b / a)]
  };
}

function findFactorization(a, b, c) {
  if (Math.abs(a) < 1e-12) {
    return null;
  }

  // Monic case: x² + bx + c
  if (Math.abs(a - 1) < 1e-12) {
    for (let p = -100; p <= 100; p++) {
      for (let q = -100; q <= 100; q++) {
        if (
          Math.abs(p + q - b) < 1e-12 &&
          Math.abs(p * q - c) < 1e-12
        ) {
          return { p, q };
        }
      }
    }
  }

  // Integer factorization for ax² + bx + c
  for (let m = -100; m <= 100; m++) {
    if (m === 0) continue;

    for (let n = -100; n <= 100; n++) {
      if (n === 0) continue;

      for (let p = -100; p <= 100; p++) {
        if (p === 0) continue;

        for (let q = -100; q <= 100; q++) {
          if (q === 0) continue;

          if (
            m * p === a &&
            n * q === c &&
            m * q + n * p === b
          ) {
            return { m, n, p, q };
          }
        }
      }
    }
  }

  return null;
}

function formatFactorization(a, b, c, factors) {
  if (!factors) return null;

  if (factors.p !== undefined) {
    const p = factors.p;
    const q = factors.q;

    const part1 = p >= 0 ? `x + ${p}` : `x - ${Math.abs(p)}`;
    const part2 = q >= 0 ? `x + ${q}` : `x - ${Math.abs(q)}`;

    return `(${part1})(${part2})`;
  }

  return null;
}

function solveQuadratic(a, b, c) {
  const discriminant = b * b - 4 * a * c;

  const steps = [];

  steps.push({
    title: "Identificar os coeficientes",
    explanation: `A equação está na forma ax² + bx + c = 0.`,
    formula: `a = ${a}, b = ${b}, c = ${c}`
  });

  steps.push({
    title: "Calcular o discriminante",
    explanation: "Usamos Δ = b² − 4ac.",
    formula: `Δ = (${b})² − 4(${a})(${c}) = ${round(discriminant)}`
  });

  if (Math.abs(discriminant) < 1e-12) {
    const x = -b / (2 * a);

    steps.push({
      title: "Aplicar Bhaskara",
      explanation: "Como Δ = 0, existe uma única solução real.",
      formula: `x = −b / 2a = ${round(x)}`
    });

    return {
      discriminant: round(discriminant),
      solutions: [round(x)],
      steps
    };
  }

  if (discriminant < 0) {
    const realPart = -b / (2 * a);
    const imaginaryPart = Math.sqrt(-discriminant) / Math.abs(2 * a);

    steps.push({
      title: "Interpretar o discriminante",
      explanation:
        "Como Δ < 0, a equação não possui soluções reais.",
      formula:
        `x = ${round(realPart)} ± ${round(imaginaryPart)}i`
    });

    return {
      discriminant: round(discriminant),
      solutions: [],
      complexSolutions: [
        {
          real: round(realPart),
          imaginary: round(imaginaryPart)
        },
        {
          real: round(realPart),
          imaginary: round(-imaginaryPart)
        }
      ],
      steps
    };
  }

  const sqrtDelta = Math.sqrt(discriminant);

  const x1 = (-b + sqrtDelta) / (2 * a);
  const x2 = (-b - sqrtDelta) / (2 * a);

  steps.push({
    title: "Aplicar Bhaskara",
    explanation:
      "Usamos x = (−b ± √Δ) / 2a.",
    formula:
      `x₁ = ${round(x1)}`
  });

  steps.push({
    title: "Segunda solução",
    explanation:
      "Usando o sinal negativo na fórmula:",
    formula:
      `x₂ = ${round(x2)}`
  });

  return {
    discriminant: round(discriminant),
    solutions: [round(x1), round(x2)],
    steps
  };
}

function createQuadraticGraph(a, b, c) {
  const vertexX = -b / (2 * a);
  const vertexY = a * vertexX * vertexX + b * vertexX + c;

  const roots = [];

  const delta = b * b - 4 * a * c;

  if (delta >= 0) {
    roots.push((-b + Math.sqrt(delta)) / (2 * a));

    if (Math.abs(delta) > 1e-12) {
      roots.push((-b - Math.sqrt(delta)) / (2 * a));
    }
  }

  let minX = vertexX - 5;
  let maxX = vertexX + 5;

  if (roots.length) {
    minX = Math.min(minX, ...roots) - 2;
    maxX = Math.max(maxX, ...roots) + 2;
  }

  const points = [];

  for (let i = 0; i <= 100; i++) {
    const x = minX + ((maxX - minX) * i) / 100;
    const y = a * x * x + b * x + c;

    points.push({
      x: round(x),
      y: round(y)
    });
  }

  return {
    type: "quadratic",
    equation: `y = ${a}x² + ${b}x + ${c}`,
    points,
    roots: roots.map(round),
    vertex: {
      x: round(vertexX),
      y: round(vertexY)
    }
  };
}

function createLinearGraph(a, b) {
  const points = [];

  for (let x = -10; x <= 10; x += 0.5) {
    points.push({
      x: round(x),
      y: round(a * x + b)
    });
  }

  return {
    type: "linear",
    equation: `y = ${a}x + ${b}`,
    points,
    roots:
      Math.abs(a) > 1e-12
        ? [round(-b / a)]
        : [],
    intercept: {
      x: 0,
      y: round(b)
    }
  };
}

function solveMath(problem) {
  const parsed = parsePolynomial(problem);

  if (!parsed) {
    return {
      success: false,
      subject: "math",
      message:
        "Ainda não consigo interpretar esse tipo de problema matemático."
    };
  }

  const { a, b, c } = parsed;

  // Linear
  if (Math.abs(a) < 1e-12) {
    const result = solveLinear(b, c);

    if (result.type === "linear") {
      return {
        success: true,
        subject: "math",
        title: "Equação linear",
        type: "linear",
        coefficients: { a: b, b: c },
        solutions: result.solutions,
        steps: [
          {
            title: "Identificar a equação",
            explanation: `A equação pode ser escrita como ${b}x + ${c} = 0.`
          },
          {
            title: "Isolar x",
            formula: `x = −${c} / ${b}`
          },
          {
            title: "Resultado",
            formula: `x = ${round(-c / b)}`
          }
        ],
        methods: [
          {
            name: "Isolamento da variável",
            description:
              "Colocamos o termo com x de um lado e os números do outro."
          }
        ],
        graph: createLinearGraph(b, c),
        learning: {
          concept: "Equação linear",
          explanation:
            "Uma equação linear possui a variável elevada à primeira potência."
        }
      };
    }
  }

  // Quadratic
  const quadratic = solveQuadratic(a, b, c);

  const factorData = findFactorization(a, b, c);
  const factorization = formatFactorization(
    a,
    b,
    c,
    factorData
  );

  const vertexX = -b / (2 * a);
  const vertexY =
    a * vertexX * vertexX +
    b * vertexX +
    c;

  const methods = [
    {
      name: "Bhaskara",
      description:
        "Utiliza o discriminante e a fórmula de Bhaskara para encontrar as raízes.",
      formula:
        "x = (−b ± √Δ) / 2a"
    },
    {
      name: "Completar quadrados",
      description:
        "Reorganiza a equação para formar um quadrado perfeito.",
      formula:
        `x = −${b / (2 * a)} ± √(...)`
    }
  ];

  if (factorization) {
    methods.push({
      name: "Fatorização",
      description:
        "Transforma a equação em um produto de fatores.",
      formula: factorization
    });
  }

  return {
    success: true,
    subject: "math",
    title: "Equação quadrática",
    type: "quadratic",
    coefficients: { a, b, c },
    discriminant: quadratic.discriminant,
    solutions: quadratic.solutions,
    complexSolutions: quadratic.complexSolutions || [],
    steps: quadratic.steps,
    methods,
    graph: createQuadraticGraph(a, b, c),
    learning: {
      concept: "Equação quadrática",
      explanation:
        "Uma equação quadrática é uma equação na forma ax² + bx + c = 0, com a diferente de zero.",
      vertex: {
        x: round(vertexX),
        y: round(vertexY)
      }
    }
  };
}

/* =========================================================
   PHYSICS ENGINE
   ========================================================= */

function extractNumber(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      const value = parseFloat(
        String(match[1]).replace(",", ".")
      );

      if (Number.isFinite(value)) {
        return value;
      }
    }
  }

  return null;
}

function convertToBase(value, unit) {
  const u = String(unit || "").toLowerCase();

  const conversions = {
    m: 1,
    km: 1000,
    cm: 0.01,
    mm: 0.001,

    s: 1,
    min: 60,
    h: 3600,

    kg: 1,
    g: 0.001,

    n: 1,
    j: 1,
    w: 1,

    pa: 1,
    kpa: 1000,

    a: 1,
    v: 1
  };

  if (conversions[u] === undefined) {
    return value;
  }

  return value * conversions[u];
}

function detectUnit(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);

    if (match) {
      return match[1].toLowerCase();
    }
  }

  return null;
}

function solvePhysics(problem) {
  const original = cleanProblem(problem);
  const text = original.toLowerCase();

  /* ---------------------------------------------------------
     VELOCITY
     --------------------------------------------------------- */

  const distance = extractNumber(text, [
    /(?:distância|distancia|distance)\s*(?:é|=|:)?\s*(-?\d+(?:[.,]\d+)?)\s*(km|m|cm|mm)\b/i,
    /(-?\d+(?:[.,]\d+)?)\s*(km|m|cm|mm)\b/i
  ]);

  const time = extractNumber(text, [
    /(?:tempo|time|duração|duracao)\s*(?:é|=|:)?\s*(-?\d+(?:[.,]\d+)?)\s*(h|min|s)\b/i,
    /(-?\d+(?:[.,]\d+)?)\s*(h|min|s)\b/i
  ]);

  if (
    distance !== null &&
    time !== null &&
    /(velocidade|velocidade média|velocidade media|speed)/i.test(text)
  ) {
    const distanceUnit = detectUnit(text, [
      /(?:distância|distancia|distance).*?(-?\d+(?:[.,]\d+)?)\s*(km|m|cm|mm)\b/i,
      /(-?\d+(?:[.,]\d+)?)\s*(km|m|cm|mm)\b/i
    ]) || "m";

    const timeUnit = detectUnit(text, [
      /(?:tempo|time|duração|duracao).*?(-?\d+(?:[.,]\d+)?)\s*(h|min|s)\b/i,
      /(-?\d+(?:[.,]\d+)?)\s*(h|min|s)\b/i
    ]) || "s";

    const dBase = convertToBase(distance, distanceUnit);
    const tBase = convertToBase(time, timeUnit);

    const velocity = dBase / tBase;

    return {
      success: true,
      subject: "physics",
      title: "Velocidade média",
      type: "velocity",
      given: {
        distance: {
          value: distance,
          unit: distanceUnit
        },
        time: {
          value: time,
          unit: timeUnit
        }
      },
      formula: "v = d / t",
      result: {
        value: round(velocity),
        unit: "m/s"
      },
      steps: [
        {
          title: "Dados",
          explanation:
            `Distância = ${distance} ${distanceUnit}; Tempo = ${time} ${timeUnit}.`
        },
        {
          title: "Fórmula",
          formula: "v = d / t"
        },
        {
          title: "Substituição",
          formula:
            `v = ${distance} ${distanceUnit} / ${time} ${timeUnit}`
        },
        {
          title: "Resultado",
          formula:
            `v = ${round(velocity)} m/s`
        }
      ],
      learning: {
        concept: "Velocidade média",
        explanation:
          "A velocidade média relaciona a distância percorrida com o intervalo de tempo."
      }
    };
  }

  /* ---------------------------------------------------------
     FORCE
     --------------------------------------------------------- */

  const mass = extractNumber(text, [
    /(?:massa|mass)\s*(?:é|=|:)?\s*(-?\d+(?:[.,]\d+)?)\s*(kg|g)\b/i,
    /(-?\d+(?:[.,]\d+)?)\s*(kg|g)\b/i
  ]);

  const acceleration = extractNumber(text, [
    /(?:aceleração|aceleracao|acceleration)\s*(?:é|=|:)?\s*(-?\d+(?:[.,]\d+)?)\s*(m\/s²|m\/s2)\b/i,
    /(-?\d+(?:[.,]\d+)?)\s*(m\/s²|m\/s2)\b/i
  ]);

  if (
    mass !== null &&
    acceleration !== null &&
    /(força|forca|force)/i.test(text)
  ) {
    const massUnit = detectUnit(text, [
      /(?:massa|mass).*?(-?\d+(?:[.,]\d+)?)\s*(kg|g)\b/i,
      /(-?\d+(?:[.,]\d+)?)\s*(kg|g)\b/i
    ]) || "kg";

    const mBase = convertToBase(mass, massUnit);
    const force = mBase * acceleration;

    return {
      success: true,
      subject: "physics",
      title: "Força resultante",
      type: "force",
      given: {
        mass: {
          value: mass,
          unit: massUnit
        },
        acceleration: {
          value: acceleration,
          unit: "m/s²"
        }
      },
      formula: "F = m × a",
      result: {
        value: round(force),
        unit: "N"
      },
      steps: [
        {
          title: "Dados",
          explanation:
            `m = ${mass} ${massUnit}; a = ${acceleration} m/s².`
        },
        {
          title: "Fórmula",
          formula: "F = m × a"
        },
        {
          title: "Substituição",
          formula:
            `F = ${mBase} × ${acceleration}`
        },
        {
          title: "Resultado",
          formula:
            `F = ${round(force)} N`
        }
      ],
      learning: {
        concept: "Segunda lei de Newton",
        explanation:
          "A força resultante de um corpo é igual à massa multiplicada pela aceleração."
      }
    };
  }

  /* ---------------------------------------------------------
     DENSITY
     --------------------------------------------------------- */

  const volume = extractNumber(text, [
    /(?:volume)\s*(?:é|=|:)?\s*(-?\d+(?:[.,]\d+)?)\s*(m³|m3|cm³|cm3|l|ml)\b/i,
    /(-?\d+(?:[.,]\d+)?)\s*(m³|m3|cm³|cm3|l|ml)\b/i
  ]);

  if (
    mass !== null &&
    volume !== null &&
    /(densidade|density)/i.test(text)
  ) {
    const massUnit = detectUnit(text, [
      /(?:massa|mass).*?(-?\d+(?:[.,]\d+)?)\s*(kg|g)\b/i
    ]) || "kg";

    const volumeUnit = detectUnit(text, [
      /(?:volume).*?(-?\d+(?:[.,]\d+)?)\s*(m³|m3|cm³|cm3|l|ml)\b/i
    ]) || "m3";

    const massBase = convertToBase(mass, massUnit);

    let volumeBase = volume;

    if (volumeUnit === "cm³" || volumeUnit === "cm3") {
      volumeBase = volume * 0.000001;
    } else if (volumeUnit === "l") {
      volumeBase = volume * 0.001;
    } else if (volumeUnit === "ml") {
      volumeBase = volume * 0.000001;
    }

    const density = massBase / volumeBase;

    return {
      success: true,
      subject: "physics",
      title: "Densidade",
      type: "density",
      given: {
        mass: {
          value: mass,
          unit: massUnit
        },
        volume: {
          value: volume,
          unit: volumeUnit
        }
      },
      formula: "ρ = m / V",
      result: {
        value: round(density),
        unit: "kg/m³"
      },
      steps: [
        {
          title: "Dados",
          formula:
            `m = ${mass} ${massUnit}; V = ${volume} ${volumeUnit}`
        },
        {
          title: "Fórmula",
          formula: "ρ = m / V"
        },
        {
          title: "Substituição",
          formula:
            `ρ = ${massBase} / ${volumeBase}`
        },
        {
          title: "Resultado",
          formula:
            `ρ = ${round(density)} kg/m³`
        }
      ],
      learning: {
        concept: "Densidade",
        explanation:
          "A densidade indica quanta massa existe por unidade de volume."
      }
    };
  }

  /* ---------------------------------------------------------
     OHM'S LAW
     --------------------------------------------------------- */

  const voltage = extractNumber(text, [
    /(?:tensão|tensao|voltagem|voltage)\s*(?:é|=|:)?\s*(-?\d+(?:[.,]\d+)?)\s*v\b/i,
    /(-?\d+(?:[.,]\d+)?)\s*v\b/i
  ]);

  const current = extractNumber(text, [
    /(?:corrente|current)\s*(?:é|=|:)?\s*(-?\d+(?:[.,]\d+)?)\s*a\b/i,
    /(-?\d+(?:[.,]\d+)?)\s*a\b/i
  ]);

  const resistance = extractNumber(text, [
    /(?:resistência|resistencia|resistance)\s*(?:é|=|:)?\s*(-?\d+(?:[.,]\d+)?)\s*(ohm|Ω)\b/i,
    /(-?\d+(?:[.,]\d+)?)\s*(ohm|Ω)\b/i
  ]);

  if (
    voltage !== null &&
    current !== null &&
    /(resistência|resistencia|resistance)/i.test(text)
  ) {
    const result = voltage / current;

    return {
      success: true,
      subject: "physics",
      title: "Lei de Ohm",
      type: "ohms-law",
      given: {
        voltage: {
          value: voltage,
          unit: "V"
        },
        current: {
          value: current,
          unit: "A"
        }
      },
      formula: "R = V / I",
      result: {
        value: round(result),
        unit: "Ω"
      },
      steps: [
        {
          title: "Dados",
          formula: `V = ${voltage} V; I = ${current} A`
        },
        {
          title: "Fórmula",
          formula: "R = V / I"
        },
        {
          title: "Substituição",
          formula: `R = ${voltage} / ${current}`
        },
        {
          title: "Resultado",
          formula: `R = ${round(result)} Ω`
        }
      ],
      learning: {
        concept: "Lei de Ohm",
        explanation:
          "A Lei de Ohm relaciona tensão, corrente e resistência através de V = IR."
      }
    };
  }

  /* ---------------------------------------------------------
     POWER
     --------------------------------------------------------- */

  if (
    voltage !== null &&
    current !== null &&
    /(potência|potencia|power)/i.test(text)
  ) {
    const power = voltage * current;

    return {
      success: true,
      subject: "physics",
      title: "Potência elétrica",
      type: "electric-power",
      given: {
        voltage: {
          value: voltage,
          unit: "V"
        },
        current: {
          value: current,
          unit: "A"
        }
      },
      formula: "P = V × I",
      result: {
        value: round(power),
        unit: "W"
      },
      steps: [
        {
          title: "Dados",
          formula: `V = ${voltage} V; I = ${current} A`
        },
        {
          title: "Fórmula",
          formula: "P = V × I"
        },
        {
          title: "Substituição",
          formula: `P = ${voltage} × ${current}`
        },
        {
          title: "Resultado",
          formula: `P = ${round(power)} W`
        }
      ],
      learning: {
        concept: "Potência elétrica",
        explanation:
          "A potência elétrica representa a taxa de transferência de energia elétrica."
      }
    };
  }

  /* ---------------------------------------------------------
     FALLBACK
     --------------------------------------------------------- */

  return {
    success: false,
    subject: "physics",
    title: "Problema de Física",
    message:
      "O Physics Engine ainda não reconhece este tipo de problema. Os módulos atualmente disponíveis incluem velocidade, força, densidade, Lei de Ohm e potência elétrica."
  };
}

/* =========================================================
   CHEMISTRY ENGINE
   ========================================================= */

const atomicMasses = {
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
  Cr: 51.996,
  Mn: 54.938,
  Fe: 55.845,
  Co: 58.933,
  Ni: 58.693,
  Cu: 63.546,
  Zn: 65.38,
  Ga: 69.723,
  Ge: 72.630,
  As: 74.922,
  Se: 78.971,
  Br: 79.904,
  Kr: 83.798,
  Ag: 107.868,
  Cd: 112.414,
  In: 114.818,
  Sn: 118.710,
  I: 126.904,
  Xe: 131.293,
  Cs: 132.905,
  Ba: 137.327,
  Pt: 195.084,
  Au: 196.967,
  Hg: 200.592,
  Pb: 207.2
};

function parseFormula(formula) {
  const clean = formula
    .replace(/\s+/g, "")
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (char) => {
      const map = {
        "⁰": "0",
        "¹": "1",
        "²": "2",
        "³": "3",
        "⁴": "4",
        "⁵": "5",
        "⁶": "6",
        "⁷": "7",
        "⁸": "8",
        "⁹": "9"
      };

      return map[char];
    });

  const elements = {};
  let i = 0;

  while (i < clean.length) {
    const match = clean.slice(i).match(/^([A-Z][a-z]?)(\d*)/);

    if (!match) {
      return null;
    }

    const element = match[1];
    const count = match[2] ? parseInt(match[2], 10) : 1;

    if (!atomicMasses[element]) {
      return null;
    }

    elements[element] =
      (elements[element] || 0) + count;

    i += match[0].length;
  }

  return elements;
}

function molarMass(formula) {
  const parsed = parseFormula(formula);

  if (!parsed) {
    return null;
  }

  let total = 0;

  for (const element of Object.keys(parsed)) {
    total +=
      atomicMasses[element] *
      parsed[element];
  }

  return total;
}

function solveChemistry(problem) {
  const original = cleanProblem(problem);
  const text = original.toLowerCase();

  /* ---------------------------------------------------------
     MOLAR MASS
     --------------------------------------------------------- */

  const formulaMatch = original.match(
    /\b([A-Z][a-z]?(?:\d+)?)+\b/
  );

  if (
    formulaMatch &&
    /(massa molar|molar mass|massa molecular|massa molecular relativa)/i.test(
      original
    )
  ) {
    const formula = formulaMatch[0];
    const mass = molarMass(formula);

    if (mass !== null) {
      const composition = parseFormula(formula);

      const parts = Object.entries(composition).map(
        ([element, count]) =>
          `${element}: ${count} × ${atomicMasses[element]}`
      );

      return {
        success: true,
        subject: "chemistry",
        title: "Massa molar",
        type: "molar-mass",
        formula,
        result: {
          value: round(mass),
          unit: "g/mol"
        },
        composition,
        steps: [
          {
            title: "Identificar a fórmula",
            formula: formula
          },
          {
            title: "Massas atómicas",
            formula: parts.join(" + ")
          },
          {
            title: "Somar as contribuições",
            formula:
              `${parts.join(" + ")} = ${round(mass)} g/mol`
          },
          {
            title: "Resultado",
            formula:
              `M(${formula}) = ${round(mass)} g/mol`
          }
        ],
        learning: {
          concept: "Massa molar",
          explanation:
            "A massa molar é a massa de um mol de uma substância, expressa normalmente em g/mol."
        }
      };
    }
  }

  /* ---------------------------------------------------------
     MOLES
     --------------------------------------------------------- */

  const massChem = extractNumber(text, [
    /(?:massa|mass)\s*(?:é|=|:)?\s*(-?\d+(?:[.,]\d+)?)\s*g\b/i,
    /(-?\d+(?:[.,]\d+)?)\s*g\b/i
  ]);

  const formulaChemMatch = original.match(
    /\b([A-Z][a-z]?(?:\d+)?)+\b/
  );

  if (
    massChem !== null &&
    formulaChemMatch &&
    /(mol|mols|número de mol|numero de mol|quantos mol)/i.test(text)
  ) {
    const formula = formulaChemMatch[0];
    const M = molarMass(formula);

    if (M !== null) {
      const n = massChem / M;

      return {
        success: true,
        subject: "chemistry",
        title: "Quantidade de matéria",
        type: "moles",
        given: {
          mass: {
            value: massChem,
            unit: "g"
          },
          substance: formula,
          molarMass: {
            value: round(M),
            unit: "g/mol"
          }
        },
        formula: "n = m / M",
        result: {
          value: round(n),
          unit: "mol"
        },
        steps: [
          {
            title: "Calcular a massa molar",
            formula:
              `M(${formula}) = ${round(M)} g/mol`
          },
          {
            title: "Usar a fórmula dos mols",
            formula: "n = m / M"
          },
          {
            title: "Substituir",
            formula:
              `n = ${massChem} / ${round(M)}`
          },
          {
            title: "Resultado",
            formula:
              `n = ${round(n)} mol`
          }
        ],
        learning: {
          concept: "Quantidade de matéria",
          explanation:
            "A quantidade de matéria pode ser calculada dividindo a massa da amostra pela massa molar."
        }
      };
    }
  }

  /* ---------------------------------------------------------
     CONCENTRATION
     --------------------------------------------------------- */

  const solutionMass = extractNumber(text, [
    /(?:massa do soluto|massa soluto|soluto)\s*(?:é|=|:)?\s*(-?\d+(?:[.,]\d+)?)\s*g\b/i
  ]);

  const solutionVolume = extractNumber(text, [
    /(?:volume|solução|solucao)\s*(?:é|=|:)?\s*(-?\d+(?:[.,]\d+)?)\s*(l|ml)\b/i,
    /(-?\d+(?:[.,]\d+)?)\s*(l|ml)\b/i
  ]);

  if (
    solutionMass !== null &&
    solutionVolume !== null &&
    /(concentração|concentracao|concentração comum|concentracao comum)/i.test(
      text
    )
  ) {
    let volumeLiters = solutionVolume;

    const volumeUnit = detectUnit(text, [
      /(?:volume|solução|solucao).*?(-?\d+(?:[.,]\d+)?)\s*(l|ml)\b/i,
      /(-?\d+(?:[.,]\d+)?)\s*(l|ml)\b/i
    ]) || "l";

    if (volumeUnit === "ml") {
      volumeLiters /= 1000;
    }

    const concentration = solutionMass / volumeLiters;

    return {
      success: true,
      subject: "chemistry",
      title: "Concentração comum",
      type: "concentration",
      given: {
        soluteMass: {
          value: solutionMass,
          unit: "g"
        },
        solutionVolume: {
          value: solutionVolume,
          unit: volumeUnit
        }
      },
      formula: "C = m / V",
      result: {
        value: round(concentration),
        unit: "g/L"
      },
      steps: [
        {
          title: "Dados",
          formula:
            `m = ${solutionMass} g; V = ${solutionVolume} ${volumeUnit}`
        },
        {
          title: "Converter o volume",
          formula:
            `V = ${round(volumeLiters)} L`
        },
        {
          title: "Fórmula",
          formula: "C = m / V"
        },
        {
          title: "Substituição",
          formula:
            `C = ${solutionMass} / ${volumeLiters}`
        },
        {
          title: "Resultado",
          formula:
            `C = ${round(concentration)} g/L`
        }
      ],
      learning: {
        concept: "Concentração comum",
        explanation:
          "A concentração comum indica a massa de soluto presente em cada litro de solução."
      }
    };
  }

  /* ---------------------------------------------------------
     MOLAR CONCENTRATION
     --------------------------------------------------------- */

  const molesChem = extractNumber(text, [
    /(?:quantidade de matéria|número de mol|numero de mol|mols?)\s*(?:é|=|:)?\s*(-?\d+(?:[.,]\d+)?)\s*mol\b/i,
    /(-?\d+(?:[.,]\d+)?)\s*mol\b/i
  ]);

  if (
    molesChem !== null &&
    solutionVolume !== null &&
    /(molaridade|concentração molar|concentracao molar)/i.test(text)
  ) {
    let volumeLiters = solutionVolume;

    const volumeUnit = detectUnit(text, [
      /(?:volume|solução|solucao).*?(-?\d+(?:[.,]\d+)?)\s*(l|ml)\b/i,
      /(-?\d+(?:[.,]\d+)?)\s*(l|ml)\b/i
    ]) || "l";

    if (volumeUnit === "ml") {
      volumeLiters /= 1000;
    }

    const concentration = molesChem / volumeLiters;

    return {
      success: true,
      subject: "chemistry",
      title: "Concentração molar",
      type: "molar-concentration",
      given: {
        moles: {
          value: molesChem,
          unit: "mol"
        },
        volume: {
          value: solutionVolume,
          unit: volumeUnit
        }
      },
      formula: "C = n / V",
      result: {
        value: round(concentration),
        unit: "mol/L"
      },
      steps: [
        {
          title: "Dados",
          formula:
            `n = ${molesChem} mol; V = ${solutionVolume} ${volumeUnit}`
        },
        {
          title: "Converter o volume",
          formula:
            `V = ${round(volumeLiters)} L`
        },
        {
          title: "Fórmula",
          formula: "C = n / V"
        },
        {
          title: "Substituição",
          formula:
            `C = ${molesChem} / ${volumeLiters}`
        },
        {
          title: "Resultado",
          formula:
            `C = ${round(concentration)} mol/L`
        }
      ],
      learning: {
        concept: "Molaridade",
        explanation:
          "A concentração molar indica quantos mols de soluto existem por litro de solução."
      }
    };
  }

  /* ---------------------------------------------------------
     FALLBACK
     --------------------------------------------------------- */

  return {
    success: false,
    subject: "chemistry",
    title: "Problema de Química",
    message:
      "O Chemistry Engine ainda não reconhece este tipo de problema. Os módulos atualmente disponíveis incluem massa molar, mols, concentração comum e concentração molar."
  };
}

/* =========================================================
   MAIN SOLVER
   ========================================================= */

function solveProblem(problem, subject) {
  const cleaned = cleanProblem(problem);

  if (!cleaned) {
    return {
      success: false,
      message: "Digite um problema para resolver."
    };
  }

  if (subject === "math") {
    return solveMath(cleaned);
  }

  if (subject === "physics") {
    return solvePhysics(cleaned);
  }

  if (subject === "chemistry") {
    return solveChemistry(cleaned);
  }

  return {
    success: false,
    message: "Disciplina não reconhecida."
  };
}

/* =========================================================
   API
   ========================================================= */

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    name: "EinsteinWeb",
    brain: "Einstein Brain V0.4",
    status: "online",
    engines: {
      mathematics: "active",
      physics: "active",
      chemistry: "active",
      artificialIntelligence: "not_connected"
    }
  });
});

app.post("/api/solve", (req, res) => {
  try {
    const { problem, subject } = req.body || {};

    const result = solveProblem(problem, subject);

    res.json(result);
  } catch (error) {
    console.error("Erro no /api/solve:", error);

    res.status(500).json({
      success: false,
      message:
        "Ocorreu um erro interno ao processar o problema."
    });
  }
});

/* =========================================================
   FRONTEND
   ========================================================= */

app.get("*", (req, res) => {
  res.sendFile(path.join(publicPath, "index.html"));
});

/* =========================================================
   SERVER
   ========================================================= */

app.listen(PORT, () => {
  console.log("======================================");
  console.log(" EinsteinWeb Brain V0.4");
  console.log(" Mathematics: ACTIVE");
  console.log(" Physics:     ACTIVE");
  console.log(" Chemistry:   ACTIVE");
  console.log(" AI:          NOT CONNECTED");
  console.log(` Server:      http://localhost:${PORT}`);
  console.log("======================================");
});
