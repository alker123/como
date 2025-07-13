import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import session from 'express-session';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import fs from 'fs';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Carregando as credenciais JSON via fs
const serviceAccount1 = JSON.parse(fs.readFileSync(path.join(__dirname, 'credenciais', 'serviceAccountKey-dados.json'), 'utf8'));
const serviceAccount2 = JSON.parse(fs.readFileSync(path.join(__dirname, 'credenciais', 'serviceAccountKey-testes.json'), 'utf8'));

// Inicializa Firebase App 1 (dados-teste)
const app1 = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount1),
  databaseURL: "https://dados-teste-8b85d-default-rtdb.firebaseio.com"
}, 'dadosApp');

// Inicializa Firebase App 2 (testes2)
const app2 = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount2),
  databaseURL: "https://testes2-69ead-default-rtdb.firebaseio.com"
}, 'testesApp');

// Banco principal (usuários)
const db1 = admin.database(app1);
// Banco auxiliar (dados extras, se quiser usar depois)
const db2 = admin.database(app2);

// Middleware
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: 'supersegredo',
  resave: false,
  saveUninitialized: true,
  cookie: { maxAge: 30 * 60 * 1000 } // 30 minutos
}));

// Página inicial
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Login
app.post('/login', async (req, res) => {
  const { usuario, senha } = req.body;

  try {
    const snapshot = await db1.ref('usuarios/' + usuario).get();
    if (snapshot.exists()) {
      const dados = snapshot.val();
      if (dados.senha === senha) {
        req.session.usuario = usuario;
        req.session.rota = dados.rota;

        const redirectTo = req.session.redirectTo || '/' + dados.rota.replace('.html', '');
        delete req.session.redirectTo;

        return res.json({ success: true, rota: redirectTo });
      } else {
        return res.status(401).json({ success: false, message: 'Senha incorreta' });
      }
    } else {
      return res.status(404).json({ success: false, message: 'Usuário não encontrado' });
    }
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Erro ao verificar login.' });
  }
});

// Middleware para proteger páginas
function protegerRota(req, res, next) {
  if (!req.session.usuario) {
    return res.redirect('/');
  }
  next();
}

// Rotas protegidas
app.get('/operador', protegerRota, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'operador.html'));
});

app.get('/admin', protegerRota, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'admin.html'));
});

app.get('/juradoA', protegerRota, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'juradoA.html'));
});

app.get('/juradoB', protegerRota, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'juradoB.html'));
});

app.get('/juradoC', protegerRota, (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'juradoC.html'));
});

// Salva a rota de destino se o usuário não estiver logado
app.get('*', (req, res, next) => {
  if (!req.session.usuario) {
    req.session.redirectTo = req.originalUrl;
  }
  next();
});

// Logout
app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// Bloqueia acesso direto ao .html
app.get('/*.html', (req, res) => {
  return res.redirect('/');
});

// Inicializa o servidor
app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
