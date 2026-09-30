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

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(express.static(publicPath));


/* =========================================================
   UTILITIES
========================================================= */

function cleanProblem(problem) {
    if (typeof problem !== "string") return "";
    return problem.trim().replace(/\s+/g, " ");
}


function formatNumber(value) {
    if (typeof value !== "number") return String(value);
    if (!Number.isFinite(value)) return String(value);

    if (Math.abs(value) < 1e-10) {
        return "0";
    }

    const rounded = Math.round(value * 1e8) / 1e8;

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

    return Number.isFinite(value) ? value : null;
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
                concept: "Algumas equações não possuem solução.",
                explanation:
                    "Isso acontece quando a simplificação produz uma contradição.",
                tip:
                    "Verifica cuidadosamente os sinais e os termos constantes."
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
                    `A equação foi reduzida à forma ax + b = 0.`,
                formula:
                    `${formatNumber(a)}x + ${formatNumber(b)} = 0`
            },

            {
                title: "Isolar o termo com x",
                description:
                    `Passamos o termo constante para o outro lado.`,
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
                    "A solução da equação é:",
                formula:
                    `x = ${formatNumber(x)}`
            }
        ],

        methods: [
            {
                name: "Isolamento algébrico",
                description:
                    "Isolar x através de operações equivalentes nos dois lados.",
                result:
                    `x = ${formatNumber(x)}`
            }
        ],

        learning: {
            concept:
                "Uma equação linear possui a variável no primeiro grau.",
            explanation:
                "O objetivo é deixar a variável x sozinha num dos lados da igualdade.",
            tip:
                "Para ax + b = 0, usa x = -b/a quando a ≠ 0."
        }
    };
}


function solveQuadratic(a, b, c) {

    if (Math.abs(a) < 1e-12) {
        return solveLinear(b, c);
    }

    const delta = b * b - 4 * a * c;

    if (delta < 0) {

        const realPart = -b / (2 * a);

        const imaginaryPart =
            Math.sqrt(-delta) / Math.abs(2 * a);

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
                        `Δ = ${formatNumber(delta)}`
                },

                {
                    title: "Interpretar o discriminante",
                    description:
                        "Como Δ < 0, não existem raízes reais."
                },

                {
                    title: "Resultado",
                    description:
                        "As raízes complexas são:",
                    formula:
                        `x = ${formatNumber(realPart)} ± ${formatNumber(imaginaryPart)}i`
                }
            ],

            methods: [
                {
                    name: "Fórmula quadrática",
                    description:
                        "A fórmula de Bhaskara também pode ser usada para raízes complexas.",
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
                    "Δ > 0: duas raízes reais; Δ = 0: uma raiz dupla; Δ < 0: raízes complexas."
            }
        };
    }

    const sqrtDelta = Math.sqrt(delta);

    const x1 =
        (-b + sqrtDelta) / (2 * a);

    const x2 =
        (-b - sqrtDelta) / (2 * a);

    const equal =
        Math.abs(x1 - x2) < 1e-10;

    return {
        answer: equal
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
                    `Δ = (${formatNumber(b)})² − 4(${formatNumber(a)})(${formatNumber(c)}) = ${formatNumber(delta)}`
            },

            {
                title: "Calcular √Δ",
                description:
                    "Calculamos a raiz quadrada do discriminante.",
                formula:
                    `√Δ = ${formatNumber(sqrtDelta)}`
            },

            {
                title: "Aplicar a fórmula de Bhaskara",
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
                        : "As duas soluções são:",
                formula:
                    equal
                        ? `x = ${formatNumber(x1)}`
                        : `x₁ = ${formatNumber(x1)} ; x₂ = ${formatNumber(x2)}`
            }
        ],

        methods: [
            {
                name: "Fórmula de Bhaskara",
                description:
                    "Método geral para resolver equações quadráticas.",
                result:
                    equal
                        ? `x = ${formatNumber(x1)}`
                        : `x₁ = ${formatNumber(x1)}, x₂ = ${formatNumber(x2)}`
            }
        ],

        learning: {
            concept:
                "Uma equação quadrática possui a forma ax² + bx + c = 0, com a ≠ 0.",
            explanation:
                "O discriminante informa primeiro o tipo de raízes. Depois usamos a fórmula de Bhaskara.",
            tip:
                "Organiza sempre a equação antes de aplicar a fórmula."
        }
    };
}


function solveMath(problem) {

    const equation = splitEquation(problem);

    /* EQUAÇÕES */

    if (equation) {

        try {

            const left =
                normalizeExpression(equation.left);

            const right =
                normalizeExpression(equation.right);

            const expression =
                `${left}-(${right})`;

            const node =
                math.parse(expression);

            const fn =
                node.compile();

            const values = {};

            for (const x of [-2, -1, 0, 1, 2]) {
                values[x] = Number(
                    fn.evaluate({ x })
                );
            }

            if (
                Object.values(values)
                    .every(Number.isFinite)
            ) {

                const c = values[0];

                const b =
                    (values[1] - values[-1]) / 2;

                const a =
                    (
                        values[2] +
                        values[-2] -
                        2 * c
                    ) / 8;

                if (
                    Number.isFinite(a) &&
                    Number.isFinite(b) &&
                    Number.isFinite(c)
                ) {

                    if (Math.abs(a) > 1e-10) {
                        return solveQuadratic(
                            round(a, 10),
                            round(b, 10),
                            round(c, 10)
                        );
                    }

                    if (Math.abs(b) > 1e-10) {
                        return solveLinear(
                            round(b, 10),
                            round(c, 10)
                        );
                    }
                }
            }

        } catch {
            /* Continua para cálculo normal */
        }
    }


    /* EXPRESSÃO NUMÉRICA */

    const expressionMatch =
        problem.match(
            /(?:calcule|calculate|quanto\s*[ée]|resolva|resolve)?\s*([\d.,+\-*/^×÷() ]+)$/i
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
                        title: "Aplicar a ordem das operações",
                        description:
                            "Resolvemos a expressão respeitando a ordem matemática."
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
                            "Parênteses, potências, multiplicações/divisões e adições/subtrações.",
                        result:
                            formatNumber(result)
                    }
                ],

                learning: {
                    concept:
                        "A ordem das operações determina a sequência correta dos cálculos.",
                    explanation:
                        "As operações devem ser executadas seguindo uma prioridade matemática.",
                    tip:
                        "Usa parênteses para deixar a ordem desejada explícita."
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
            .replace(/,/g, ".")
            .replace(/²/g, "2");


    /* VELOCIDADE */

    if (
        text.includes("velocidade") &&
        (
            text.includes("distância") ||
            text.includes("distancia") ||
            text.includes("percorre") ||
            text.includes("percorreu")
        ) &&
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

            const meters =
                distanceUnit === "km"
                    ? distance * 1000
                    : distance;

            let seconds;

            if (
                timeUnit === "h" ||
                timeUnit === "hora" ||
                timeUnit === "horas"
            ) {
                seconds = time * 3600;
            } else if (
                timeUnit === "min" ||
                timeUnit === "minuto" ||
                timeUnit === "minutos"
            ) {
                seconds = time * 60;
            } else {
                seconds = time;
            }

            const velocity =
                meters / seconds;

            const kmh =
                velocity * 3.6;

            return {
                answer:
                    `${formatNumber(velocity)} m/s (${formatNumber(kmh)} km/h)`,

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
                        title: "Converter para o SI",
                        description:
                            `Distância = ${formatNumber(meters)} m; tempo = ${formatNumber(seconds)} s.`
                    },

                    {
                        title: "Resultado",
                        description:
                            "A velocidade média é:",
                        formula:
                            `${formatNumber(velocity)} m/s = ${formatNumber(kmh)} km/h`
                    }
                ],

                methods: [
                    {
                        name: "Velocidade média",
                        description:
                            "Divide a distância pelo intervalo de tempo.",
                        result:
                            `${formatNumber(velocity)} m/s`
                    }
                ],

                learning: {
                    concept:
                        "Velocidade média é a razão entre distância e tempo.",
                    explanation:
                        "Ela indica quanto espaço é percorrido por unidade de tempo.",
                    tip:
                        "Confirma sempre as unidades antes de fazer a divisão."
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
                /(\d+(?:\.\d+)?)\s*m\/s(?:2|\^2)/
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
                            `m = ${mass} kg e a = ${acceleration} m/s².`
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
                        formula:
                            `F = ${mass} × ${acceleration}`
                    },

                    {
                        title: "Resultado",
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
                        "A unidade da força no SI é o newton (N)."
                }
            };
        }
    }


    /* DENSIDADE */

    if (
        text.includes("densidade")
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
                        formula:
                            "ρ = m / V"
                    },

                    {
                        title: "Converter para o SI",
                        description:
                            `m = ${formatNumber(massKg)} kg; V = ${formatNumber(volumeM3)} m³.`
                    },

                    {
                        title: "Resultado",
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
                        "Calculamos dividindo a massa pelo volume.",
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
            text.includes("voltagem")
        ) &&
        text.includes("corrente")
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
                            `V = ${voltage} V; I = ${current} A.`
                    },

                    {
                        title: "Usar a lei de Ohm",
                        formula:
                            "R = V / I"
                    },

                    {
                        title: "Substituir",
                        formula:
                            `R = ${voltage} / ${current}`
                    },

                    {
                        title: "Resultado",
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
                        "A resistência pode ser encontrada dividindo tensão pela corrente.",
                    tip:
                        "Usa volts e ampères para obter ohms."
                }
            };
        }
    }


    /* POTÊNCIA */

    if (
        text.includes("potência")
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
                            `V = ${voltage} V; I = ${current} A.`
                    },

                    {
                        title: "Usar a fórmula",
                        formula:
                            "P = V × I"
                    },

                    {
                        title: "Substituir",
                        formula:
                            `P = ${voltage} × ${current}`
                    },

                    {
                        title: "Resultado",
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
                        "Multiplicamos a tensão pela corrente.",
                    tip:
                        "No SI, a potência é medida em watts."
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
        String(formula)
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

    for (const [element, count] of Object.entries(atoms)) {
        total +=
            ATOMIC_MASSES[element] * count;
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
        lower.includes("massa molar") ||
        lower.includes("massa molecular")
    ) {

        const formulas =
            text.match(
                /\b[A-Z][A-Za-z0-9₀₁₂₃₄₅₆₇₈₉]*\b/g
            ) || [];

        for (const formula of formulas) {

            const result =
                molarMass(formula);

            if (!result) continue;

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
                            "Multiplicamos cada massa atómica pelo número de átomos correspondente."
                    },

                    {
                        title: "Resultado",
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
                        "É calculada somando as massas atómicas dos elementos presentes.",
                    tip:
                        "Os índices da fórmula indicam quantos átomos de cada elemento estão presentes."
                }
            };
        }
    }


    /* MOL */

    if (
        lower.includes("quantos mol") ||
        lower.includes("número de mol") ||
        lower.includes("numero de mol")
    ) {

        const mass =
            extractNumber(
                text,
                /(\d+(?:\.\d+)?)\s*g\b/i
            );

        const formulas =
            text.match(
                /\b[A-Z][A-Za-z0-9₀₁₂₃₄₅₆₇₈₉]*\b/g
            ) || [];

        if (mass !== null) {

            for (const formula of formulas) {

                const molar =
                    molarMass(formula);

                if (!molar) continue;

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
                            formula:
                                `M = ${formatNumber(molar.mass)} g/mol`
                        },

                        {
                            title: "Usar a fórmula",
                            formula:
                                "n = m / M"
                        },

                        {
                            title: "Substituir",
                            formula:
                                `n = ${mass} / ${formatNumber(molar.mass)}`
                        },

                        {
                            title: "Resultado",
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
                            "A quantidade de mols pode ser obtida dividindo a massa pela massa molar.",
                        tip:
                            "Mantém massa em gramas quando M estiver em g/mol."
                    }
                };
            }
        }
    }


    /* CONCENTRAÇÃO */

    if (
        lower.includes("concentração") ||
        lower.includes("concentracao")
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
                        formula:
                            "C = m / V"
                    },

                    {
                        title: "Substituir",
                        formula:
                            `C = ${mass} / ${volume}`
                    },

                    {
                        title: "Resultado",
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
        lower.includes("molaridade") ||
        lower.includes("concentração molar") ||
        lower.includes("concentracao molar")
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
                            `n = ${moles} mol; V = ${volume} L.`
                    },

                    {
                        title: "Usar a fórmula",
                        formula:
                            "C = n / V"
                    },

                    {
                        title: "Substituir",
                        formula:
                            `C = ${moles} / ${volume}`
                    },

                    {
                        title: "Resultado",
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
                        "Molaridade é a quantidade de mols de soluto por litro de solução.",
                    explanation:
                        "Calculamos dividindo os mols pelo volume em litros.",
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
                    "O Einstein Brain V0.4 não conseguiu resolver este problema. Tente escrever o exercício com mais detalhes."
            });
        }

        return res.json({
            success: true,
            subject: selectedSubject,
            result
        });

    } catch (error) {

        console.error("Solve error:", error);

        return res.status(500).json({
            success: false,
            error:
                "Ocorreu um erro interno ao processar o problema."
        });
    }

});


/* =========================================================
   FRONTEND FALLBACK
========================================================= */

app.get("*", (req, res) => {

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
    console.log("           EINSTEINWEB");
    console.log("       Einstein Brain V0.4");
    console.log("========================================");
    console.log(`Server running on port ${PORT}`);
    console.log("Mathematics Engine: ACTIVE");
    console.log("Physics Engine: ACTIVE");
    console.log("Chemistry Engine: ACTIVE");
    console.log("AI Layer: NOT CONNECTED");
    console.log("========================================");

});
