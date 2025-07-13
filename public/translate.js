
const translations = {
  pt: {
    title: "Login",
    loginTitle: "Login",
    username: "Usuário",
    password: "Senha",
    btnLogin: "Entrar",
    fillFields: "Preencha todos os campos.",
    wrongPassword: "Senha incorreta.",
    userNotFound: "Usuário não encontrado.",
    dbError: "Erro ao acessar o banco de dados.",
  },
  en: {
    title: "Login",
    loginTitle: "Login",
    username: "Username",
    password: "Password",
    btnLogin: "Login",
    fillFields: "Please fill in all fields.",
    wrongPassword: "Incorrect password.",
    userNotFound: "User not found.",
    dbError: "Database access error.",
  }
};

function setLanguage(lang) {
  currentLang = lang;

  document.getElementById("title").textContent = translations[lang].title;
  document.getElementById("loginTitle").textContent = translations[lang].loginTitle;
  document.getElementById("btnLogin").textContent = translations[lang].btnLogin;

  // Placeholder dos inputs
  document.getElementById("usuario").placeholder = translations[lang].username;
  document.getElementById("senha").placeholder = translations[lang].password;
}
