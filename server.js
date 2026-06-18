const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("./insondavel.db");

// Cria as duas tabelas: Usuários e Dados
db.serialize(() => {
  db.run(
    "CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT, role TEXT)",
  );
  db.run("CREATE TABLE IF NOT EXISTS store (key TEXT PRIMARY KEY, value TEXT)");
});

// Rota de Cadastro (Register)
app.post("/api/register", (req, res) => {
  const { username, password, role } = req.body;
  db.run(
    "INSERT INTO users (username, password, role) VALUES (?, ?, ?)",
    [username, password, role],
    function (err) {
      if (err)
        return res.status(400).json({
          error: "O Vazio já conhece este nome. Escolha outro usuário.",
        });
      res.json({ success: true, user: { username, role } });
    },
  );
});

// Rota de Login
app.post("/api/login", (req, res) => {
  const { username, password } = req.body;
  db.get(
    "SELECT username, role FROM users WHERE username = ? AND password = ?",
    [username, password],
    (err, row) => {
      if (err || !row)
        return res
          .status(401)
          .json({ error: "Credenciais rejeitadas pelo Oráculo." });
      res.json({ success: true, user: row });
    },
  );
});

// Rotas de Armazenamento (vinculadas ao usuário)
app.get("/api/store/:key", (req, res) => {
  db.get(
    "SELECT value FROM store WHERE key = ?",
    [req.params.key],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({
        value: row && row.value !== "null" ? JSON.parse(row.value) : null,
      });
    },
  );
});

app.post("/api/store/:key", (req, res) => {
  const value = JSON.stringify(req.body.value);
  db.run(
    "INSERT INTO store (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = ?",
    [req.params.key, value, value],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    },
  );
});

const PORT = 3030;
app.listen(PORT, () => console.log(`O Vazio escuta na porta ${PORT}...`));
