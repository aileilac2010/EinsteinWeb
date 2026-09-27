const express = require("express");
const path = require("path");
const {
  evaluate
} = require("mathjs");

const app = express();

const PORT =
  process.env.PORT || 3000;

const publicPath =
  path.join(
    __dirname,
    "public"
  );


/* =========================================================
   MIDDLEWARE
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
   STATUS
========================================================= */

app.get(
  "/api/status",
  (req, res) => {

    res.json({

      success: true,

      name: "EinsteinWeb",

      version: "0.3.0",

      engine: "Mathematics Engine",

      status: "online"

    });

  }
);


/* =========================================================
   NORMALIZAÇÃO
========================================================= */

function normalizeExpression(expression) {

  let result =
    String(expression || "")
      .trim();


  /*
    Símbolos matemáticos comuns
  */

  result =
    result
      .replace(/−/g, "-")
      .replace(/–/g, "-")
      .replace(/×/g, "*")
      .replace(/÷/g, "/")
      .replace(/π/g, "pi");


  /*
    Expoentes Unicode
  */

  result =
    result
      .replace(/²/g, "^2")
      .replace(/³/g, "^3");


  /*
    Remover espaços
  */

  result =
    result.replace(/\s+/g, "");


  /*
    Multiplicação implícita:

    2x → 2*x
    5x → 5*x
    2(x+1) → 2*(x+1)
    (x+1)2 → (x+1)*2
  */

  result =
    result.replace(
      /(\d)([a-zA-Z])/g,
      "$1*$2"
    );


  result =
    result.replace(
      /(\d)\(/g,
      "$1*("
    );


  result =
    result.replace(
      /\)(\d)/g,
      ")*$1"
    );


  result =
    result.replace(
      /\)([a-zA-Z])/g,
      ")*$1"
    );


  /*
    x(x+1) → x*(x+1)
  */

  result =
    result.replace(
      /([a-zA-Z])\(/g,
      "$1*("
    );


  /*
    )x → )*x
  */

  result =
    result.replace(
      /\)([a-zA-Z])/g,
      ")*$1"
    );


  return result;

}


/* =========================================================
   LIMPAR PROBLEMA
========================================================= */

function cleanProblem(problem) {

  let text =
    String(problem || "")
      .trim();


  text =
    text
      .replace(/[?？]/g, "")
      .replace(/²/g, "^2")
      .replace(/³/g, "^3");


  return text;

}


/* =========================================================
   PARSE POLINOMIAL
========================================================= */

function parsePolynomial(problem) {

  let text =
    cleanProblem(problem);


  /*
    Procuramos uma equação.

    Exemplo:

    x² - 5x + 6 = 0
  */

  if (!text.includes("=")) {
    return null;
  }


  let parts =
    text.split("=");


  if (parts.length !== 2) {
    return null;
  }


  const left =
    normalizeExpression(
      parts[0]
    );

  const right =
    normalizeExpression(
      parts[1]
    );


  try {

    /*
      Transformamos:

      esquerda = direita

      em:

      esquerda - direita = 0
    */

    const expression =
      `(${left})-(${right})`;


    /*
      Avaliação em vários pontos.

      Isso permite obter os coeficientes
      de polinômios de grau 2.
    */

    const values = [];


    for (
      const x of [-2, -1, 0, 1, 2]
    ) {

      const value =
        evaluate(
          expression,
          { x }
        );


      if (
        typeof value !== "number" ||
        !Number.isFinite(value)
      ) {

        return null;

      }


      values.push({
        x,
        y: value
      });

    }


    /*
      c = f(0)
    */

    const c =
      values.find(
        item => item.x === 0
      ).y;


    /*
      Para:

      f(x)=ax²+bx+c

      usamos:

      f(1)=a+b+c
      f(-1)=a-b+c

      então:

      a = (f(1)+f(-1)-2c)/2

      b = (f(1)-f(-1))/2
    */

    const f1 =
      values.find(
        item => item.x === 1
      ).y;


    const fm1 =
      values.find(
        item => item.x === -1
      ).y;


    const a =
      (
        f1 +
        fm1 -
        2 * c
      ) / 2;


    const b =
      (
        f1 -
        fm1
      ) / 2;


    if (
      !Number.isFinite(a) ||
      !Number.isFinite(b) ||
      !Number.isFinite(c)
    ) {

      return null;

    }


    /*
      Verificação adicional.
    */

    const checkX = 2;

    const expected =
      a * checkX * checkX +
      b * checkX +
      c;


    const actual =
      values.find(
        item => item.x === 2
      ).y;


    if (
      Math.abs(
        expected - actual
      ) > 0.000001
    ) {

      return null;

    }


    return {
      a,
      b,
      c
    };

  } catch (error) {

    return null;

  }

}


/* =========================================================
   LINEAR
========================================================= */

function solveLinear(
  coefficients
) {

  const {
    a,
    b,
    c
  } = coefficients;


  /*
    ax + b = 0

    Se a = 0:

    b = 0 → infinitas soluções
    b ≠ 0 → sem solução
  */

  if (
    Math.abs(a) <
    0.0000001
  ) {

    if (
      Math.abs(b) <
      0.0000001
    ) {

      if (
        Math.abs(c) <
        0.0000001
      ) {

        return {

          type: "infinite",

          steps: [

            {
              title:
                "Analisar a equação",

              explanation:
                "Todos os termos da equação são iguais a zero.",

              formula:
                "0 = 0"
            },

            {
              title:
                "Conclusão",

              explanation:
                "A igualdade é verdadeira para qualquer valor de x.",

              formula:
                "x ∈ ℝ"
            }

          ],

          solutions: [],

          methods: [],

          learning:
            "Quando uma equação se reduz a 0 = 0, qualquer número real satisfaz a equação."

        };

      }


      return {

        type: "none",

        steps: [

          {
            title:
              "Analisar a equação",

            explanation:
              "Não existe nenhum valor de x que torne esta igualdade verdadeira.",

            formula:
              `${formatNumber(c)} = 0`
          }

        ],

        solutions: [],

        methods: [],

        learning:
          "Uma igualdade falsa como c = 0, com c diferente de zero, não possui solução."

      };

    }


    const x =
      -c / b;


    return {

      type: "linear",

      steps: [

        {
          title:
            "Identificar os coeficientes",

          explanation:
            "A equação está na forma ax + b = 0.",

          formula:
            `a = ${formatNumber(b)}, b = ${formatNumber(c)}`
        },

        {
          title:
            "Isolar x",

          explanation:
            "Passamos o termo independente para o outro lado.",

          formula:
            `${formatNumber(b)}x = ${formatNumber(-c)}`
        },

        {
          title:
            "Dividir pelo coeficiente de x",

          explanation:
            "Dividimos ambos os lados pelo coeficiente de x.",

          formula:
            `x = ${formatNumber(-c)} / ${formatNumber(b)}`
        },

        {
          title:
            "Resultado",

          explanation:
            "O valor encontrado satisfaz a equação original.",

          formula:
            `x = ${formatNumber(x)}`
        }

      ],

      solutions: [x],

      methods: [

        {
          name:
            "Isolamento de x",

          description:
            "Método direto para equações lineares.",

          steps: [

            "Mover o termo independente.",
            "Dividir pelo coeficiente de x.",
            `Obter x = ${formatNumber(x)}.`

          ]

        }

      ],

      learning:
        "Uma equação linear possui x apenas no primeiro grau. O objetivo é deixar x sozinho em um dos lados da igualdade."

    };

  }


  return null;

}


/* =========================================================
   FATORIZAÇÃO
========================================================= */

function findFactorization(
  a,
  b,
  c
) {

  /*
    Procuramos raízes simples.

    Exemplo:

    x² - 5x + 6

    raízes 2 e 3

    → (x - 2)(x - 3)
  */

  for (
    let r1 = -100;
    r1 <= 100;
    r1++
  ) {

    for (
      let r2 = r1 + 1;
      r2 <= 100;
      r2++
    ) {

      const product =
        a * r1 * r2;


      const middle =
        -a * (
          r1 + r2
        );


      if (
        Math.abs(
          product - c
        ) < 0.000001 &&
        Math.abs(
          middle - b
        ) < 0.000001
      ) {

        return {
          r1,
          r2
        };

      }

    }

  }


  return null;

}


/* =========================================================
   QUADRÁTICA
========================================================= */

function solveQuadratic(
  coefficients
) {

  const {
    a,
    b,
    c
  } = coefficients;


  if (
    Math.abs(a) <
    0.0000001
  ) {

    return solveLinear(
      coefficients
    );

  }


  const delta =
    b * b -
    4 * a * c;


  const baseSteps = [

    {
      title:
        "Identificar os coeficientes",

      explanation:
        "Comparamos a equação com a forma ax² + bx + c = 0.",

      formula:
        `a = ${formatNumber(a)}, b = ${formatNumber(b)}, c = ${formatNumber(c)}`
    },

    {
      title:
        "Calcular o discriminante",

      explanation:
        "O discriminante indica a natureza das raízes.",

      formula:
        `Δ = b² - 4ac = ${formatNumber(delta)}`
    }

  ];


  if (
    delta < -0.0000001
  ) {

    return {

      type: "quadratic",

      steps: [

        ...baseSteps,

        {
          title:
            "Analisar o discriminante",

          explanation:
            "Como Δ é negativo, a equação não possui raízes reais.",

          formula:
            "Δ < 0"
        }

      ],

      solutions: [],

      methods: [

        {
          name:
            "Fórmula quadrática",

          description:
            "O discriminante determina se existem raízes reais.",

          steps: [

            "Calcular Δ.",
            "Como Δ < 0, não existem soluções reais."

          ]

        }

      ],

      graph:
        buildGraph(
          a,
          b,
          c,
          []
        ),

      learning:
        "Uma equação quadrática com discriminante negativo não cruza o eixo x. Por isso, não possui raízes reais."

    };

  }


  if (
    Math.abs(delta) <
    0.0000001
  ) {

    const x =
      -b /
      (2 * a);


    return {

      type: "quadratic",

      steps: [

        ...baseSteps,

        {
          title:
            "Aplicar a fórmula quadrática",

          explanation:
            "Como Δ = 0, existe uma única raiz real.",

          formula:
            "x = -b / 2a"
        },

        {
          title:
            "Calcular a raiz",

          explanation:
            "Substituindo os valores.",

          formula:
            `x = ${formatNumber(x)}`
        }

      ],

      solutions: [x],

      methods: [

        {
          name:
            "Fórmula quadrática",

          description:
            "Método geral para equações do segundo grau.",

          steps: [

            `Δ = ${formatNumber(delta)}.`,
            `x = ${formatNumber(x)}.`

          ]

        },

        {
          name:
            "Vértice",

          description:
            "Quando Δ = 0, o vértice toca o eixo x.",

          steps: [

            `O ponto de contacto ocorre em x = ${formatNumber(x)}.`

          ]

        }

      ],

      graph:
        buildGraph(
          a,
          b,
          c,
          [x]
        ),

      learning:
        "Quando o discriminante é zero, a parábola toca o eixo x em exatamente um ponto."

    };

  }


  const sqrtDelta =
    Math.sqrt(delta);


  const x1 =
    (-b + sqrtDelta) /
    (2 * a);


  const x2 =
    (-b - sqrtDelta) /
    (2 * a);


  const solutions =
    x1 > x2
      ? [x1, x2]
      : [x2, x1];


  const factorization =
    findFactorization(
      a,
      b,
      c
    );


  const steps = [

    ...baseSteps,

    {
      title:
        "Aplicar a fórmula quadrática",

      explanation:
        "Substituímos a, b, c e Δ na fórmula.",

      formula:
        "x = (-b ± √Δ) / 2a"
    },

    {
      title:
        "Calcular a primeira raiz",

      explanation:
        "Usamos o sinal positivo da raiz quadrada.",

      formula:
        `x₁ = ${formatNumber(x1)}`
    },

    {
      title:
        "Calcular a segunda raiz",

      explanation:
        "Usamos o sinal negativo da raiz quadrada.",

      formula:
        `x₂ = ${formatNumber(x2)}`
    }

  ];


  const methods = [

    {
      name:
        "Fórmula quadrática",

      description:
        "Método geral que funciona para qualquer equação quadrática com coeficientes reais.",

      steps: [

        `Δ = ${formatNumber(delta)}.`,

        `x₁ = ${formatNumber(x1)}.`,

        `x₂ = ${formatNumber(x2)}.`

      ]

    },

    {
      name:
        "Completar o quadrado",

      description:
        "Transforma a expressão quadrática em uma forma baseada num quadrado perfeito.",

      steps: [

        "Agrupar os termos quadráticos e lineares.",

        "Adicionar e subtrair o termo necessário.",

        "Transformar em um quadrado perfeito.",

        "Isolar x."

      ]

    }

  ];


  if (factorization) {

    methods.splice(
      1,
      0,
      {

        name:
          "Fatorização",

        description:
          "Quando existem raízes simples, podemos escrever a equação como produto de fatores.",

        steps: [

          `Raiz 1: ${formatNumber(factorization.r1)}.`,

          `Raiz 2: ${formatNumber(factorization.r2)}.`,

          `Fatores: (x - ${formatNumber(factorization.r1)})(x - ${formatNumber(factorization.r2)}).`

        ]

      }
    );

  }


  return {

    type: "quadratic",

    steps,

    solutions,

    methods,

    graph:
      buildGraph(
        a,
        b,
        c,
        solutions
      ),

    learning:
      "Uma equação quadrática tem a forma ax² + bx + c = 0. O discriminante permite determinar quantas raízes reais existem, enquanto a fórmula quadrática fornece os valores dessas raízes."

  };

}


/* =========================================================
   EXPRESSÃO NUMÉRICA
========================================================= */

function solveExpression(
  problem
) {

  const expression =
    normalizeExpression(
      problem
    );


  try {

    const result =
      evaluate(expression);


    if (
      typeof result !== "number" ||
      !Number.isFinite(result)
    ) {

      return null;

    }


    return {

      type: "expression",

      title:
        "Resolução da expressão",

      steps: [

        {
          title:
            "Identificar a expressão",

          explanation:
            "A expressão foi interpretada matematicamente.",

          formula:
            expression
        },

        {
          title:
            "Calcular",

          explanation:
            "Aplicamos as operações matemáticas na ordem correta.",

          formula:
            `${expression} = ${formatNumber(result)}`
        }

      ],

      solutions: [result],

      methods: [

        {
          name:
            "Cálculo direto",

          description:
            "Avaliação da expressão matemática.",

          steps: [

            `Resultado = ${formatNumber(result)}.`

          ]

        }

      ],

      graph: null,

      learning:
        "As expressões numéricas são resolvidas respeitando a ordem das operações: parênteses, potências, multiplicação e divisão, e depois adição e subtração."

    };

  } catch (error) {

    return null;

  }

}


/* =========================================================
   GRÁFICO
========================================================= */

function buildGraph(
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


  /*
    Escolher uma janela razoável
    em torno do vértice e das raízes.
  */

  const rootValues =
    Array.isArray(roots)
      ? roots.filter(
          value =>
            Number.isFinite(value)
        )
      : [];


  let minX =
    vertexX - 6;


  let maxX =
    vertexX + 6;


  if (rootValues.length) {

    minX =
      Math.min(
        minX,
        ...rootValues
      ) - 2;


    maxX =
      Math.max(
        maxX,
        ...rootValues
      ) + 2;

  }


  const count = 121;

  const points = [];


  for (
    let i = 0;
    i < count;
    i++
  ) {

    const x =
      minX +
      (
        (maxX - minX) *
        i /
        (count - 1)
      );


    const y =
      a * x * x +
      b * x +
      c;


    points.push({

      x: Number(
        x.toFixed(5)
      ),

      y: Number(
        y.toFixed(5)
      )

    });

  }


  return {

    title:
      "Função quadrática",

    points,

    roots:
      rootValues,

    vertex: {

      x: vertexX,

      y: vertexY

    }

  };

}


/* =========================================================
   API SOLVE
========================================================= */

app.post(
  "/api/solve",
  (req, res) => {

    try {

      const problem =
        String(
          req.body?.problem || ""
        ).trim();


      const subject =
        req.body?.subject ||
        "math";


      if (!problem) {

        return res.status(400).json({

          success: false,

          error:
            "Nenhum problema foi enviado."

        });

      }


      /*
        Atualmente o motor matemático
        está ativo para Matemática.
      */

      if (
        subject !== "math"
      ) {

        return res.json({

          success: true,

          version: "0.3.0",

          subject,

          problem,

          title:
            "Área em desenvolvimento",

          steps: [

            {
              title:
                "Matéria selecionada",

              explanation:
                "O EinsteinWeb recebeu o problema, mas o motor completo desta matéria ainda está em desenvolvimento.",

              formula:
                subject === "physics"
                  ? "Física"
                  : "Química"

            }

          ],

          solutions: [],

          methods: [],

          graph: null,

          learning:
            "O próximo passo do EinsteinWeb será adicionar os motores de Física e Química."

        });

      }


      /*
        1.
        Tentar interpretar como equação.
      */

      const polynomial =
        parsePolynomial(
          problem
        );


      if (polynomial) {

        let result;


        if (
          Math.abs(
            polynomial.a
          ) < 0.0000001
        ) {

          result =
            solveLinear(
              polynomial
            );

        } else {

          result =
            solveQuadratic(
              polynomial
            );

        }


        if (result) {

          return res.json({

            success: true,

            version: "0.3.0",

            subject,

            problem,

            title:
              result.title ||
              "Resolução passo a passo",

            ...result

          });

        }

      }


      /*
        2.
        Tentar expressão numérica.
      */

      const expressionResult =
        solveExpression(
          problem
        );


      if (expressionResult) {

        return res.json({

          success: true,

          version: "0.3.0",

          subject,

          problem,

          ...expressionResult

        });

      }


      /*
        3.
        Não conseguimos interpretar.
      */

      return res.status(422).json({

        success: false,

        error:
          "Não consegui interpretar este problema matematicamente.",

        hint:
          "Experimente escrever algo como x² - 5x + 6 = 0 ou 2x + 4 = 10."

      });

    } catch (error) {

      console.error(
        "Erro no /api/solve:",
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
   FALLBACK FRONTEND
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
   SERVER
========================================================= */

app.listen(
  PORT,
  () => {

    console.log(
      `EinsteinWeb V0.3 running on port ${PORT}`
    );

  }
);
