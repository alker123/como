const traducoes = {
  pt: {
    title: "Painel do Operador",
    selectRitmo: "Selecionar Ritmo",
    selectAtletas: "Selecionar Atletas",
    selectCategorias: "Selecionar Categorias",
    btnEnviar: "Enviar para Jurado",
    tituloPlanilha: "Avaliação",
    ritmoRegional: "Regional",
    ritmoAngola: "Angola",
    ritmoIuna: "Iuna",
    selecionar: "Selecionar",
    atleta: "ATLETA",
    categoria: "CATEGORIA",
    notaA: "NOTA A",
    notaB: "NOTA B",
    notaC: "NOTA C",
    media: "MÉDIA",
    btnEnviarBanco: "Enviar para Banco de Dados",
    btnExcluir: "Excluir Selecionados",
    btnTrocar: "Trocar de Planilha",
    btnCategoria: "Trocar de Categoria",
    btnEnviar1: "Enviar Planilha",
    btnBaixarPlanilha: "Baixar Planilha",
    btnVerNotaTotal: "Ver Nota Total",
    btnVerCategoria: "Ver Categoria",
    btnVoltar: "Voltar",
    btnDownloadExcel: "Download Excel"
  },
  en: {
    title: "Operator Panel",
    selectRitmo: "Select Rhythm",
    selectAtletas: "Select Athletes",
    selectCategorias: "Select Categories",
    btnEnviar: "Send to Judge",
    tituloPlanilha: "Evaluation",
    ritmoRegional: "Regional",
    ritmoAngola: "Angola",
    ritmoIuna: "Iuna",
    selecionar: "Select",
    atleta: "ATHLETE",
    categoria: "CATEGORY",
    notaA: "SCORE A",
    notaB: "SCORE B",
    notaC: "SCORE C",
    media: "AVERAGE",
    btnEnviarBanco: "Send to Database",
    btnExcluir: "Delete Selected",
    btnTrocar: "Switch Sheet",
    btnCategoria: "Change Category",
    btnEnviar1: "Send Spreadsheet",
    btnBaixarPlanilha: "Download Spreadsheet",
    btnVerNotaTotal: "View Total Score",
    btnVerCategoria: "View Category",
    btnVoltar: "Back",
    btnDownloadExcel: "Download Excel"
  }
};

let idiomaAtual = "pt";

// Aplica as traduções para todos os elementos com data-i18n
function aplicarIdioma(idioma) {
  idiomaAtual = idioma;

  // Elementos normais
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const chave = el.getAttribute("data-i18n");
    if (traducoes[idioma][chave]) {
      el.textContent = traducoes[idioma][chave];
    }
  });

  // Opções dos selects
  document.querySelectorAll("option[data-i18n]").forEach(option => {
    const chave = option.getAttribute("data-i18n");
    if (traducoes[idioma][chave]) {
      option.textContent = traducoes[idioma][chave];
    }
  });

  atualizarNomeRitmo();
}

// Atualiza o nome do ritmo exibido no título
function atualizarNomeRitmo() {
  const ritmo = document.getElementById("ritmo-operador").value;
  const nomeRitmoSpan = document.getElementById("nome-ritmo");

  let key = "ritmo" + ritmo.charAt(0).toUpperCase() + ritmo.slice(1);
  nomeRitmoSpan.textContent = traducoes[idiomaAtual][key] || ritmo;
}

// Eventos de idioma
document.getElementById("pt").addEventListener("click", () => aplicarIdioma("pt"));
document.getElementById("en").addEventListener("click", () => aplicarIdioma("en"));

// Quando muda o ritmo no select
document.getElementById("ritmo-operador").addEventListener("change", atualizarNomeRitmo);

// Aplica idioma padrão ao carregar
document.addEventListener("DOMContentLoaded", () => {
  aplicarIdioma(idiomaAtual);
});

