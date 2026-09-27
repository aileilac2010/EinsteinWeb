const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use(express.static(path.join(__dirname, "public")));

app.get("/api/status", (req, res) => {
  res.json({
    success: true,
    name: "EinsteinWeb",
    version: "0.1.0",
    status: "online"
  });
});

app.post("/api/solve", (req, res) => {
  const { problem, subject } = req.body;

  if (!problem || !problem.trim()) {
    return res.status(400).json({
      success: false,
      error: "Nenhum problema foi fornecido."
    });
  }

  /*
   * O motor real de resolução será conectado aqui.
   *
   * Por enquanto enviamos uma resposta demonstrativa
   * para testar toda a interface.
   */

  res.json({
    success: true,
    subject: subject || "Matemática",
    problem: problem.trim(),
    solution: {
      title: "Análise do problema",
      steps: [
        {
          number: 1,
          title: "Identificar o problema",
          text: "O EinsteinWeb analisará a expressão, os dados fornecidos e o que precisa ser encontrado."
        },
        {
          number: 2,
          title: "Escolher o método",
          text: "O sistema procurará os métodos matemáticos ou científicos aplicáveis ao problema."
        },
        {
          number: 3,
          title: "Resolver passo a passo",
          text: "Cada transformação será apresentada de forma clara, incluindo fórmulas e substituição dos valores."
        },
        {
          number: 4,
          title: "Verificar o resultado",
          text: "O resultado será verificado utilizando métodos independentes sempre que possível."
        }
      ],
      methods: [
        "Método principal",
        "Método alternativo",
        "Método gráfico"
      ]
    }
  });
});

app.get("*splat", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`EinsteinWeb running on port ${PORT}`);
});
