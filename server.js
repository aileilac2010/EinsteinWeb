const express = require("express");
const path = require("path");
const math = require("mathjs");

const app = express();
const PORT = process.env.PORT || 3000;

const publicPath = path.join(__dirname, "public");

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static(publicPath));

/* =========================================================
   UTILITIES
========================================================= */

function cleanProblem(value) {
    if (typeof value !== "string") return "";
    return value.trim().replace(/\s+/g, " ");
}

function formatNumber(value) {
    if (typeof value !== "number") return String(value);
    if (!Number.isFinite(value)) return String(value);

    if (Math.abs(value) < 1e-10) {
        return "0";
    }

    return String(
        Math.round(value * 1e10) / 1e10
    );
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
    } catch (error) {
        return null;
    }
}

function extractNumber(text, regex) {
    const match = text.match(regex);

    if (!match) return null;

    const value = Number(
        String(match[1]).replace(",", ".")
    );

    return Number.isFinite(value) ? value : null;
}

function round(value, decimals = 4) {
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
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
                methods: [],
                learning: {
                    concept: "Uma equação pode possuir infinitas soluções.",
                    explanation:
                        "Isso acontece quando os dois lados da equação são equivalentes.",
                    tip:
                        "Simplifica os dois lados antes de procurar x."
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
            methods: [],
            learning: {
                concept: "Uma equação também pode não possuir solução.",
                explanation:
                    "Isso acontece quando se obtém uma contradição.",
                tip:
                    "Verifica os termos constantes depois de simplificar."
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
                    `A equação linear tem a forma ax + b = 0.`,
                formula:
                    `${formatNumber(a)}x + ${formatNumber(b)} = 0`
            },

            {
                title: "Isolar x",
                description:
                    `Movemos o termo constante para o outro lado.`,
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
                    "O valor de x é:",
                formula:
                    `x = ${formatNumber(x)}`
            }
        ],

        methods: [
            {
                name: "Isolamento algébrico",
                description:
                    "Isola a variável x através de operações equivalentes.",
                result:
                    `x = ${formatNumber(x)}`
            }
        ],

        learning: {
            concept:
                "Uma equação linear possui a variável no primeiro grau.",
            explanation:
                "O objetivo é deixar x sozinho em um dos lados da igualdade.",
            tip:
                "Quando ax + b = 0, podes usar x = -b/a se a for diferente de zero."
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
            Math.sqrt(-discriminant) / Math.abs(2 * a);

        return {
            answer:
                `x = ${formatNumber(realPart)} ± ${formatNumber(imaginaryPart)}i`,

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
                    title: "Interpretar",
                    description:
                        "Como Δ < 0, não existem raízes reais."
                }
            ],

            methods: [
                {
                    name: "Fórmula quadrática",
                    description:
                        "Permite obter as raízes complexas.",
                    result:
                        `x = ${formatNumber(realPart)} ± ${formatNumber(imaginaryPart)}i`
                }
            ],

            learning: {
                concept:
                    "O discriminante determina a natureza das raízes.",
                explanation:
                    "Quando Δ é negativo, as raízes são complexas.",
                tip:
                    "Δ > 0: duas raízes reais; Δ = 0: uma raiz real dupla; Δ < 0: raízes complexas."
            }
        };
    }

    const sqrtD = Math.sqrt(discriminant);

    const x1 = (-b + sqrtD) / (2 * a);
    const x2 = (-b - sqrtD) / (2 * a);

    const sameRoot = Math.abs(x1 - x2) < 1e-10;

    return {
        answer: sameRoot
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
                title: "Calcular √Δ",
                description:
                    "Calculamos a raiz quadrada do discriminante.",
                formula:
                    `√Δ = ${formatNumber(sqrtD)}`
            },

            {
                title: "Aplicar a fórmula",
                description:
                    "Usamos x = (-b ± √Δ) / 2a.",
                formula:
                    `x = (${formatNumber(-b)} ± ${formatNumber(sqrtD)}) / ${formatNumber(2 * a)}`
            },

            {
                title: "Resultado",
                description:
                    "As soluções são:",
                formula:
                    sameRoot
                        ? `x = ${formatNumber(x1)}`
                        : `x₁ = ${formatNumber(x1)} ; x₂ = ${formatNumber(x2)}`
            }
        ],

        methods: [
            {
                name: "Fórmula quadrática",
                description:
                    "Aplica diretamente a fórmula de Bhaskara.",
                result:
                    sameRoot
                        ? `x = ${formatNumber(x1)}`
                        : `x₁ = ${formatNumber(x1)}, x₂ = ${formatNumber(x2)}`
            }
        ],

        learning: {
            concept:
                "Uma equação quadrática é uma equação de segundo grau.",
            explanation:
                "A fórmula quadrática permite encontrar as raízes usando os coeficientes a, b e c.",
            tip:
                "Organiza sempre a equação na forma ax² + bx + c = 0."
        }
    };
}

/*
   Tenta obter os coeficientes de uma expressão
   usando avaliação numérica.
*/
function parsePolynomial(expression) {
    try {
        const node = math.parse(expression);
        const compiled = node.compile();

        const values = [];

        for (const x of [-2, -1, 0, 1, 2]) {
            const y = Number(
                compiled.evaluate({ x })
            );

            if (!Number.isFinite(y)) {
                return null;
            }

            values.push({ x, y });
        }

        const c = values.find(v => v.x === 0).y;
        const y1 = values.find(v => v.x === 1).y;
        const ym1 = values.find(v => v.x === -1).y;
        const y2 = values.find(v => v.x === 2).y;
        const ym2 = values.find(v => v.x === -2).y;

        const b = (y1 - ym1) / 2;
        const a = (y2 + ym2 - 2 * c) / 8;

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
    } catch (error) {
        return null;
    }
}

function createQuadraticGraph(a, b, c) {
    const points = [];

    const vertex = -b / (2 * a);

    const start = Math.floor(vertex - 8);
    const end = Math.ceil(vertex + 8);

    for (let x = start; x <= end; x += 0.25) {
        points.push({
            x: round(x, 3),
            y: round(
                a * x * x + b * x + c,
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

    for (let x = -10; x <= 10; x += 0.5) {
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
    const equation = splitEquation(problem);

    if (equation) {
        try {
            const left =
                normalizeExpression(equation.left);

            const right =
                normalizeExpression(equation.right);

            const expression =
                `${left}-(${right})`;

            const polynomial =
                parsePolynomial(expression);

            if (polynomial) {
                const { a, b, c } = polynomial;

                if (Math.abs(a) > 1e-10) {
                    const result =
                        solveQuadratic(a, b, c);

                    result.graph =
                        createQuadraticGraph(a, b, c);

                    return result;
                }

                if (Math.abs(b) > 1e-10) {
                    const result =
                        solveLinear(b, c);

                    result.graph =
                        createLinearGraph(b, c);

                    return result;
                }
            }
        } catch (error) {
            console.error(
                "Math equation error:",
                error
            );
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
                answer: formatNumber(result),

                steps: [
                    {
                        title: "Identificar a expressão",
                        description:
                            `A expressão é ${expression}.`
                    },

                    {
                        title: "Calcular",
                        description:
                            "Aplicamos a ordem das operações.",
                        formula:
                            expression
                    },

                    {
                        title: "Resultado",
                        description:
                            "O resultado é:",
                        formula:
                            formatNumber(result)
                    }
                ],

                methods: [
                    {
                        name: "Ordem das operações",
                        description:
                            "Respeita a prioridade matemática das operações.",
                        result:
                            formatNumber(result)
                    }
                ],

                learning: {
                    concept:
                        "A ordem das operações determina a sequência dos cálculos.",
                    explanation:
                        "Parênteses e potências possuem prioridade sobre multiplicações, divisões, somas e subtrações.",
                    tip:
                        "Usa parênteses para deixar a prioridade explícita."
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
        problem.toLowerCase().replace(/,/g, ".");

    /* VELOCIDADE */

    if (
        text.includes("velocidade") &&
        text.includes("distância") &&
        text.includes("tempo")
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
                timeSeconds = time * 3600;
            } else if (
                timeUnit === "min" ||
                timeUnit === "minuto" ||
                timeUnit === "minutos"
            ) {
                timeSeconds = time * 60;
            } else {
                timeSeconds = time;
            }

            const velocitySI =
                distanceMeters / timeSeconds;

            const answer =
                `${formatNumber(velocitySI)} m/s`;

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
                            "A velocidade média é distância dividida pelo tempo.",
                        formula:
                            "v = d / t"
                    },

                    {
                        title: "Substituir",
                        description:
                            "Convertendo para o Sistema Internacional:",
                        formula:
                            `v = ${distanceMeters} m / ${timeSeconds} s`
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
                        "Velocidade média é a razão entre distância e tempo.",
                    explanation:
                        "Ela indica quanto espaço é percorrido por unidade de tempo.",
                    tip:
                        "Verifica sempre as unidades antes de calcular."
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
                            "A força é o produto da massa pela aceleração.",
                        formula:
                            "F = m × a"
                    },

                    {
                        title: "Substituir",
                        description:
                            "Aplicamos os valores.",
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
                        "No SI, a força é medida em newtons (N)."
                }
            };
        }
    }

    /* DENSIDADE */

    if (text.includes("densidade")) {
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
                        "Densidade é massa por unidade de volume.",
                    explanation:
                        "Divide-se a massa pelo volume.",
                    tip:
                        "No SI, usa kg/m³."
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
            text.includes("ampere")
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
                        "A lei de Ohm é V = RI.",
                    explanation:
                        "Podemos reorganizar a fórmula para obter R = V/I.",
                    tip:
                        "Usa volts e ampères para obter ohms."
                }
            };
        }
    }

    /* POTÊNCIA ELÉTRICA */

    if (text.includes("potência")) {
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
                            "A potência elétrica é tensão multiplicada pela corrente.",
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
                            "Calcula a potência a partir da tensão e corrente.",
                        result:
                            `${formatNumber(power)} W`
                    }
                ],

                learning: {
                    concept:
                        "Potência elétrica mede a taxa de transferência de energia.",
                    explanation:
                        "É calculada pelo produto da tensão e da corrente.",
                    tip:
                        "No SI, a unidade é o watt (W)."
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
            .replace(/[₀₁₂₃₄₅₆₇₈₉]/g, char => {
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
            });

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

        const element = match[1];

        const count =
            match[2]
                ? Number(match[2])
                : 1;

        if (!ATOMIC_MASSES[element]) {
            return null;
        }

        atoms[element] =
            (atoms[element] || 0) + count;

        consumed = regex.lastIndex;
    }

    if (consumed !== clean.length) {
        return null;
    }

    return atoms;
}

function molarMass(formula) {
    const atoms =
        parseFormula(formula);

    if (!atoms) return null;

    let total = 0;

    for (const [element, count] of Object.entries(atoms)) {
        total +=
            ATOMIC_MASSES[element] * count;
    }

    return {
        atoms,
        mass: round(total, 3)
    };
}

function findChemicalFormula(text) {
    const matches =
        text.match(
            /\b[A-Z][A-Za-z]?\d*(?:[A-Z][a-z]?\d*)*\b/g
        );

    if (!matches) return null;

    for (const candidate of matches) {
        if (molarMass(candidate)) {
            return candidate;
        }
    }

    return null;
}

function solveChemistry(problem) {
    const text =
        problem.trim();

    const lower =
        text.toLowerCase();

    /* MASSA MOLAR */

    if (lower.includes("massa molar")) {
        const formula =
            findChemicalFormula(text);

        if (formula) {
            const result =
                molarMass(formula);

            const breakdown =
                Object.entries(result.atoms)
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
                            `A fórmula analisada é ${formula}.`
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
                            "Soma as contribuições de todos os elementos.",
                        result:
                            `${formatNumber(result.mass)} g/mol`
                    }
                ],

                learning: {
                    concept:
                        "Massa molar é a massa correspondente a um mol de uma substância.",
                    explanation:
                        "Somamos as massas atómicas dos átomos presentes na fórmula.",
                    tip:
                        "Os índices da fórmula indicam quantos átomos existem."
                }
            };
        }
    }

    /* MOL */

    if (
        (
            lower.includes("quantos mol") ||
            lower.includes("número de mol")
        )
    ) {
        const mass =
            extractNumber(
                text,
                /(\d+(?:\.\d+)?)\s*g\b/i
            );

        const formula =
            findChemicalFormula(text);

        if (
            mass !== null &&
            formula
        ) {
            const molar =
                molarMass(formula);

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
                            `M(${formula}) = ${molar.mass} g/mol.`,
                        formula:
                            `M = ${molar.mass} g/mol`
                    },

                    {
                        title: "Usar a fórmula",
                        description:
                            "O número de mols é massa dividida pela massa molar.",
                        formula:
                            "n = m / M"
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
                        "O mol representa uma quantidade de matéria.",
                    explanation:
                        "A massa dividida pela massa molar fornece o número de mols.",
                    tip:
                        "Mantém a massa em gramas quando M estiver em g/mol."
                }
            };
        }
    }

    /* CONCENTRAÇÃO */

    if (
        lower.includes("concentração") &&
        !lower.includes("molar")
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
                            "A concentração comum é massa dividida pelo volume.",
                        formula:
                            "C = m / V"
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
                            "Relaciona massa de soluto e volume de solução.",
                        result:
                            `${formatNumber(concentration)} g/L`
                    }
                ],

                learning: {
                    concept:
                        "Concentração comum indica massa de soluto por volume.",
                    explanation:
                        "Divide-se a massa pelo volume.",
                    tip:
                        "Para g/L, usa gramas e litros."
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
                            "A molaridade é quantidade de matéria dividida pelo volume.",
                        formula:
                            "C = n / V"
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
                        "Molaridade é a quantidade de mols por litro de solução.",
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

/* =========================================================
   SOLVE API
========================================================= */

app.post("/api/solve", (req, res) => {
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
            ["math", "physics", "chemistry"].includes(subject)
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
                    "O Einstein Brain V0.4 não conseguiu resolver este problema. Tente escrever o enunciado com mais detalhes."
            });
        }

        return res.json({
            success: true,
            subject: selectedSubject,
            result
        });

    } catch (error) {
        console.error(
            "Solve error:",
            error
        );

        return res.status(500).json({
            success: false,
            error:
                "Ocorreu um erro interno ao processar o problema."
        });
    }
});

/* =========================================================
   FRONTEND
========================================================= */

/*
   Não usamos app.get("*") porque o Express 5
   gera PathError com essa rota.
*/

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
    console.log("");
    console.log("========================================");
    console.log("          EINSTEINWEB");
    console.log("          Einstein Brain V0.4");
    console.log("========================================");
    console.log(`Server running on port ${PORT}`);
    console.log("Mathematics Engine: ACTIVE");
    console.log("Physics Engine: ACTIVE");
    console.log("Chemistry Engine: ACTIVE");
    console.log("AI Layer: NOT CONNECTED");
    console.log("========================================");
});
