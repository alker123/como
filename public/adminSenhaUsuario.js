import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Banco principal
const firebaseConfig1 = {
  databaseURL: "https://dados-teste-8b85d-default-rtdb.firebaseio.com/"
};
const app5 = initializeApp(firebaseConfig1, "app5");
const db5 = getDatabase(app5);

// Mostrar senha
document.getElementById("mostrar-senha").addEventListener("change", e => {
  const senhaInput = document.getElementById("novo-user-senha");
  senhaInput.type = e.target.checked ? "text" : "password";
});

// Cadastrar usuário
document.getElementById("cadastrar-usuario-btn").onclick = () => {
  const user = document.getElementById("novo-user-nome").value.trim();
  const senha = document.getElementById("novo-user-senha").value.trim();
  
  // Verifica se o nome de usuário (e-mail) e senha foram preenchidos
  if (!user || !senha) return alert("Preencha usuário e senha.");

  // Verifica se o usuário contém o "@" (como um e-mail)
  if (!user.includes('@')) {
    return alert("O usuário deve ser um e-mail válido.");
  }

  // Extrai a parte antes do "@" para usar como chave e rota
  const usuarioSemArroba = user.split('@')[0];

  // Define a rota usando a parte do nome antes do "@"
  const rota = `${usuarioSemArroba}.html`;

  // Salva o usuário no Firebase com o nome completo (e-mail) como chave e define a rota
  set(ref(db5, 'usuarios/' + user), { senha, rota }).then(() => {
    alert("Usuário cadastrado com sucesso!");
    
    // Limpa os campos após o cadastro
    document.getElementById("novo-user-nome").value = "";
    document.getElementById("novo-user-senha").value = "";
    document.getElementById("mostrar-senha").checked = false;
    document.getElementById("novo-user-senha").type = "password";
  }).catch((error) => {
    // Exibe um erro caso ocorra
    alert("Erro ao cadastrar o usuário: " + error.message);
  });
};

// Função de login
document.getElementById("btnLogin").addEventListener("click", function () {
  const usuario = document.getElementById("usuario").value.trim();
  const senha = document.getElementById("senha").value.trim();
  const msg = document.getElementById("mensagem");

  if (!usuario || !senha) {
    msg.textContent = "Preencha todos os campos!";
    return;
  }

  // Verifica se o nome de usuário contém "@"
  if (!usuario.includes('@')) {
    msg.textContent = "Usuário deve ser um e-mail válido!";
    return;
  }

  // A chave no banco de dados será o e-mail completo
  get(ref(db5, "usuarios/" + usuario)).then((snapshot) => {
    if (snapshot.exists()) {
      const dados = snapshot.val();
      if (dados.senha === senha) {
        const rota = dados.rota || "pagina_padrao.html";  // Se não houver rota definida, redireciona para uma página padrão
        window.location.href = rota;  // Redireciona para a página baseada na rota
      } else {
        msg.textContent = "Senha incorreta!";
      }
    } else {
      msg.textContent = "Usuário não encontrado!";
    }
  }).catch((error) => {
    msg.textContent = "Erro ao acessar o banco de dados.";
    console.error(error);
  });
});
