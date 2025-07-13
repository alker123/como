import { db3 } from './firebase.js';
import { ref, get, set, remove } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Função para mostrar a tabela de Oitavas e esconder as outras
function oitavas() {
  // Exibe a tabela das oitavas
  document.getElementById("tabela-oitavas-container").style.display = "block";  // Exibe a tabela de oitavas
  
  // Esconde as outras tabelas
  document.getElementById("tabela-principal-container").style.display = "none";  // Esconde a tabela principal
  document.getElementById("tabela-secundaria-container").style.display = "none";  // Esconde a tabela secundária
}
// Função para voltar para a Tabela Principal
function voltarParaTabela1() {
  // Esconde a tabela de oitavas
  document.getElementById("tabela-oitavas-container").style.display = "none";
  
  // Exibe a tabela principal
  document.getElementById("tabela-principal-container").style.display = "block";
  
  // Se você quiser exibir a tabela secundária, descomente a linha abaixo:
  // document.getElementById("tabela-secundaria-container").style.display = "block";
}

document.addEventListener('DOMContentLoaded', function () {
  // Função chamada ao clicar no botão "Enviar para Quartas"
  async function enviarParaQuartas() {
    const atletasRef = ref(db3, 'classificacao');
    const snapshot = await get(atletasRef);

    if (!snapshot.exists()) {
      console.log("Nenhum dado encontrado na classificação.");
      return;
    }

    const atletas = Object.values(snapshot.val());

    // Ordena os atletas pela Nota Final em ordem decrescente
    atletas.sort((a, b) => parseFloat(b.notaFinal) - parseFloat(a.notaFinal));

    // Verifica se há pelo menos 8 atletas para a fase de Quartas
    if (atletas.length >= 8) {
      const atletasParaQuartas = atletas.slice(0, 8);

      // Salva os 8 melhores atletas na fase de Quartas no Firebase
      for (let atleta of atletasParaQuartas) {
        const chave = atleta.atleta + '||' + atleta.categoria;
        const quartasRef = ref(db3, `quartas/${chave}`);

        await set(quartasRef, {
          atleta: atleta.atleta,
          categoria: atleta.categoria,
          notaFinal: atleta.notaFinal,
          foto: atleta.foto || ""  // Caso não tenha foto, salva uma string vazia
        }).then(() => {
          console.log(`Atleta ${atleta.atleta} da categoria ${atleta.categoria} salvo em Quartas`);
        }).catch((error) => {
          console.error("Erro ao salvar no Firebase: ", error);
        });
      }

      console.log('Quartas enviadas com sucesso!');
    } else {
      // Se não houver 8 atletas, exibe mensagem de erro e envia para Semi-Final
      const erroMensagem = `Não há atletas suficientes para as Quartas. Necessário pelo menos 8 atletas. Apenas ${atletas.length} encontrados.`;
      console.error(erroMensagem);
      alert(erroMensagem);  // Exibe uma mensagem de erro para o usuário
      await enviarParaSemifinal();  // Envia para Semifinal se não houver 8 atletas
    }
  }

  // Função para enviar os melhores para Semifinal
  async function enviarParaSemifinal() {
    const atletasRef = ref(db3, 'classificacao');
    const snapshot = await get(atletasRef);

    if (!snapshot.exists()) {
      console.log("Nenhum dado encontrado na classificação.");
      return;
    }

    const atletas = Object.values(snapshot.val());

    atletas.sort((a, b) => parseFloat(b.notaFinal) - parseFloat(a.notaFinal));

    if (atletas.length >= 4) {
      const atletasParaSemifinal = atletas.slice(0, 4);

      for (let atleta of atletasParaSemifinal) {
        const chave = atleta.atleta + '||' + atleta.categoria;
        const semifinalRef = ref(db3, `semifinal/${chave}`);

        await set(semifinalRef, {
          atleta: atleta.atleta,
          categoria: atleta.categoria,
          notaFinal: atleta.notaFinal,
          foto: atleta.foto || ""
        }).then(() => {
          console.log(`Atleta ${atleta.atleta} da categoria ${atleta.categoria} salvo em Semifinal`);
        }).catch((error) => {
          console.error("Erro ao salvar no Firebase: ", error);
        });
      }

      console.log('Semifinal enviada com sucesso!');
    } else {
      // Se não houver 4 atletas, exibe mensagem de erro e envia para Final
      const erroMensagem = `Não há atletas suficientes para a Semifinal. Necessário pelo menos 4 atletas. Apenas ${atletas.length} encontrados.`;
      console.error(erroMensagem);
      alert(erroMensagem);  // Exibe uma mensagem de erro para o usuário
      await enviarParaFinal();  // Envia para Final se não houver 4 atletas
    }
  }

  // Função para enviar os melhores para Final
  async function enviarParaFinal() {
    const atletasRef = ref(db3, 'classificacao');
    const snapshot = await get(atletasRef);

    if (!snapshot.exists()) {
      console.log("Nenhum dado encontrado na classificação.");
      return;
    }

    const atletas = Object.values(snapshot.val());

    atletas.sort((a, b) => parseFloat(b.notaFinal) - parseFloat(a.notaFinal));

    if (atletas.length >= 2) {
      const atletasParaFinal = atletas.slice(0, 2);

      for (let atleta of atletasParaFinal) {
        const chave = atleta.atleta + '||' + atleta.categoria;
        const finalRef = ref(db3, `final/${chave}`);

        await set(finalRef, {
          atleta: atleta.atleta,
          categoria: atleta.categoria,
          notaFinal: atleta.notaFinal,
          foto: atleta.foto || ""
        }).then(() => {
          console.log(`Atleta ${atleta.atleta} da categoria ${atleta.categoria} salvo em Final`);
        }).catch((error) => {
          console.error("Erro ao salvar no Firebase: ", error);
        });
      }

      console.log('Final enviada com sucesso!');
    } else {
      // Se não houver 2 atletas, exibe mensagem de erro
      const erroMensagem = `Não há atletas suficientes para a Final. Necessário pelo menos 2 atletas. Apenas ${atletas.length} encontrados.`;
      console.error(erroMensagem);
      alert(erroMensagem);  // Exibe uma mensagem de erro para o usuário
    }
  }

  // Vincula o evento de clique no botão "Enviar para Quartas"
  document.getElementById('enviar-quartas').addEventListener('click', enviarParaQuartas);
});


// Função para exibir a seção das quartas de final
function quartas() {
  // Esconde todas as outras tabelas
  document.getElementById("tabela-secundaria-container").style.display = "none";
  document.getElementById("tabela-principal-container").style.display = "none";
  document.getElementById("tabela-oitavas-container").style.display = "none";
  
  // Exibe a tabela das quartas de final
  document.getElementById("quartas-container").style.display = "block";
}

// Função para voltar para a tabela principal
function voltarParaTabela2() {
  // Exibe a tabela principal novamente
  document.getElementById("tabela-principal-container").style.display = "block";
  
  // Esconde a seção das quartas de final
  document.getElementById("quartas-container").style.display = "none";
}

document.addEventListener('DOMContentLoaded', function () {
  // Função chamada ao clicar no botão "Enviar para Semifinal"
  async function enviarParaSemifinal() {
    const atletasRef = ref(db3, 'quartas');
    const snapshot = await get(atletasRef);

    if (!snapshot.exists()) {
      console.log("Nenhum dado encontrado nas Quartas.");
      return;
    }

    const atletas = Object.values(snapshot.val());

    // Ordena os atletas pela Nota Final em ordem decrescente
    atletas.sort((a, b) => parseFloat(b.notaFinal) - parseFloat(a.notaFinal));

    // Verifica se há pelo menos 4 atletas para a fase de Semifinal
    if (atletas.length >= 4) {
      const atletasParaSemifinal = atletas.slice(0, 4);

      // Salva os 4 melhores atletas na fase de Semifinal no Firebase
      for (let atleta of atletasParaSemifinal) {
        const chave = atleta.atleta + '||' + atleta.categoria;
        const semifinalRef = ref(db3, `semifinal/${chave}`);

        await set(semifinalRef, {
          atleta: atleta.atleta,
          categoria: atleta.categoria,
          notaFinal: atleta.notaFinal,
          foto: atleta.foto || ""  // Caso não tenha foto, salva uma string vazia
        }).then(() => {
          console.log(`Atleta ${atleta.atleta} da categoria ${atleta.categoria} salvo em Semifinal`);
        }).catch((error) => {
          console.error("Erro ao salvar no Firebase: ", error);
        });
      }

      console.log('Semifinal enviada com sucesso!');
    } else {
      // Se não houver 4 atletas, exibe mensagem de erro e envia para Final
      const erroMensagem = `Não há atletas suficientes para a Semifinal. Necessário pelo menos 4 atletas. Apenas ${atletas.length} encontrados.`;
      console.error(erroMensagem);
      alert(erroMensagem);  // Exibe uma mensagem de erro para o usuário
      await enviarParaFinal();  // Envia para Final se não houver 4 atletas
    }
  }

  // Função para enviar os melhores para Final
  async function enviarParaFinal() {
    const atletasRef = ref(db3, 'semifinal');
    const snapshot = await get(atletasRef);

    if (!snapshot.exists()) {
      console.log("Nenhum dado encontrado na Semifinal.");
      return;
    }

    const atletas = Object.values(snapshot.val());

    // Ordena os atletas pela Nota Final em ordem decrescente
    atletas.sort((a, b) => parseFloat(b.notaFinal) - parseFloat(a.notaFinal));

    // Verifica se há pelo menos 2 atletas para a fase de Final
    if (atletas.length >= 2) {
      const atletasParaFinal = atletas.slice(0, 2);

      // Salva os 2 melhores atletas na fase de Final no Firebase
      for (let atleta of atletasParaFinal) {
        const chave = atleta.atleta + '||' + atleta.categoria;
        const finalRef = ref(db3, `final/${chave}`);

        await set(finalRef, {
          atleta: atleta.atleta,
          categoria: atleta.categoria,
          notaFinal: atleta.notaFinal,
          foto: atleta.foto || ""  // Caso não tenha foto, salva uma string vazia
        }).then(() => {
          console.log(`Atleta ${atleta.atleta} da categoria ${atleta.categoria} salvo em Final`);
        }).catch((error) => {
          console.error("Erro ao salvar no Firebase: ", error);
        });
      }

      console.log('Final enviada com sucesso!');
    } else {
      // Se não houver 2 atletas, exibe mensagem de erro
      const erroMensagem = `Não há atletas suficientes para a Final. Necessário pelo menos 2 atletas. Apenas ${atletas.length} encontrados.`;
      console.error(erroMensagem);
      alert(erroMensagem);  // Exibe uma mensagem de erro para o usuário
    }
  }

  // Vincula o evento de clique no botão "Enviar para Semifinal"
  document.getElementById('enviar-semifinal').addEventListener('click', enviarParaSemifinal);
});


// Função para exibir a seção da semifinal
function semi_final() {
  // Esconde todas as outras tabelas
  document.getElementById("tabela-secundaria-container").style.display = "none";
  document.getElementById("tabela-principal-container").style.display = "none";
  document.getElementById("tabela-oitavas-container").style.display = "none";
  document.getElementById("quartas-container").style.display = "none";
  
  // Exibe a tabela da semifinal
  document.getElementById("semi-final-container").style.display = "block";
}

// Função para voltar para a tabela principal
function voltarParaTabela3() {
  // Exibe a tabela principal novamente
  document.getElementById("tabela-principal-container").style.display = "block";
  
  // Esconde a seção da semifinal
  document.getElementById("semi-final-container").style.display = "none";
}
 
document.addEventListener('DOMContentLoaded', function () {
  // Função chamada ao clicar no botão "Enviar para Final"
  async function enviarParaFinal() {
    const atletasRef = ref(db3, 'semifinal');
    const snapshot = await get(atletasRef);

    if (!snapshot.exists()) {
      console.log("Nenhum dado encontrado na Semifinal.");
      return;
    }

    const atletas = Object.values(snapshot.val());

    // Ordena os atletas pela Nota Final em ordem decrescente
    atletas.sort((a, b) => parseFloat(b.notaFinal) - parseFloat(a.notaFinal));

    // Verifica se há pelo menos 2 atletas para a fase de Final
    if (atletas.length >= 2) {
      const atletasParaFinal = atletas.slice(0, 2);

      // Salva os 2 melhores atletas na fase de Final no Firebase
      for (let atleta of atletasParaFinal) {
        const chave = atleta.atleta + '||' + atleta.categoria;
        const finalRef = ref(db3, `final/${chave}`);

        await set(finalRef, {
          atleta: atleta.atleta,
          categoria: atleta.categoria,
          notaFinal: atleta.notaFinal,
          foto: atleta.foto || ""  // Caso não tenha foto, salva uma string vazia
        }).then(() => {
          console.log(`Atleta ${atleta.atleta} da categoria ${atleta.categoria} salvo em Final`);
        }).catch((error) => {
          console.error("Erro ao salvar no Firebase: ", error);
        });
      }

      console.log('Final enviada com sucesso!');
    } else {
      // Se não houver 2 atletas, exibe mensagem de erro
      const erroMensagem = `Não há atletas suficientes para a Final. Necessário pelo menos 2 atletas. Apenas ${atletas.length} encontrados.`;
      console.error(erroMensagem);
      alert(erroMensagem);  // Exibe uma mensagem de erro para o usuário
    }
  }

  // Vincula o evento de clique no botão "Enviar para Final"
  document.getElementById('enviar-final').addEventListener('click', enviarParaFinal);
});


// Função para exibir a seção da semifinal
function final() {
  // Esconde todas as outras tabelas
  document.getElementById("tabela-secundaria-container").style.display = "none";  // Oculta a tabela secundária
  document.getElementById("tabela-principal-container").style.display = "none";  // Oculta a tabela principal
  document.getElementById("tabela-oitavas-container").style.display = "none";  // Oculta a tabela das oitavas
  document.getElementById("quartas-container").style.display = "none";  // Oculta a tabela das quartas
  document.getElementById("semi-final-container").style.display = "none"; // Oculta a tabela das semi-final

  // Exibe a tabela da semifinal
  document.getElementById("final-container").style.display = "block";  // Exibe a final
}
// Função para voltar para a tabela principal
function voltarParaTabela4() {
  // Exibe a tabela principal novamente
  document.getElementById("tabela-principal-container").style.display = "block";  // Exibe a tabela principal
  
  // Esconde a seção da semifinal
  document.getElementById("final-container").style.display = "none";  // Oculta a final
}



// Dados simulados para as fases com atletas
    const fases = {
      "oitavas": {
        "atleta1": {
          "atleta": "Atleta 1",
          "categoria": "Categoria A",
          "notaFinal": 85,
          "foto": "https://linkfoto.com/atleta1.jpg"
        },
        "atleta2": {
          "atleta": "Atleta 2",
          "categoria": "Categoria B",
          "notaFinal": 90,
          "foto": "https://linkfoto.com/atleta2.jpg"
        }
      },
      "quartas": {
        "atleta3": {
          "atleta": "Atleta 3",
          "categoria": "Categoria A",
          "notaFinal": 88,
          "foto": "https://linkfoto.com/atleta3.jpg"
        },
        "atleta4": {
          "atleta": "Atleta 4",
          "categoria": "Categoria B",
          "notaFinal": 92,
          "foto": "https://linkfoto.com/atleta4.jpg"
        }
      },
      "semifinal": {
        "atleta5": {
          "atleta": "Atleta 5",
          "categoria": "Categoria A",
          "notaFinal": 91,
          "foto": "https://linkfoto.com/atleta5.jpg"
        }
      },
      "final": {
        "atleta6": {
          "atleta": "Atleta 6",
          "categoria": "Categoria A",
          "notaFinal": 93,
          "foto": "https://linkfoto.com/atleta6.jpg"
        },
        "atleta7": {
          "atleta": "Atleta 7",
          "categoria": "Categoria B",
          "notaFinal": 95,
          "foto": "https://linkfoto.com/atleta7.jpg"
        }
      }
    };

    // Função para carregar as fases disponíveis no seletor
    function carregarFases() {
      const seletorFase = document.getElementById('seletor-fase');

      // Limpa o dropdown antes de adicionar novas opções
      seletorFase.innerHTML = '';

      // Adiciona a opção inicial vazia (ou instruções)
      const opcaoInicial = document.createElement('option');
      opcaoInicial.value = '';
      opcaoInicial.textContent = 'Selecione a Fase';
      seletorFase.appendChild(opcaoInicial);

      // Preenche o seletor com as fases disponíveis
      for (const fase in fases) {
        const option = document.createElement('option');
        option.value = fase;
        option.textContent = capitalizeFirstLetter(fase); // Capitaliza a primeira letra de cada fase
        seletorFase.appendChild(option);
      }
    }

    // Função para capitalizar a primeira letra de cada fase
    function capitalizeFirstLetter(fase) {
      return fase.charAt(0).toUpperCase() + fase.slice(1);
    }

    // Função para carregar os atletas da fase selecionada
    document.getElementById('carregar-atletas').addEventListener('click', () => {
      const faseSelecionada = document.getElementById('seletor-fase').value;

      // Verifica se uma fase foi selecionada
      if (faseSelecionada) {
        carregarAtletasPorFase(faseSelecionada);
      } else {
        alert("Selecione uma fase válida.");
      }
    });

    // Função para carregar os atletas de uma fase específica
    function carregarAtletasPorFase(fase) {
      const dados = fases[fase]; // Carrega os atletas da fase

      if (dados) {
        preencherTabela(dados);
      } else {
        alert(`Não há dados encontrados para a fase ${fase}`);
      }
    }

    // Função para preencher a tabela com os dados dos atletas
    function preencherTabela(dados) {
      const tabela = document.getElementById('tabela-atletas').getElementsByTagName('tbody')[0];
      tabela.innerHTML = '';  // Limpa a tabela antes de preencher com novos dados

      // Preenche a tabela com os atletas da fase selecionada
      for (const chave in dados) {
        const atleta = dados[chave];

        // Cria uma nova linha na tabela
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>${atleta.atleta}</td>
          <td>${atleta.categoria}</td>
          <td>${atleta.notaFinal}</td>
          <td><img src="${atleta.foto}" alt="Foto do Atleta" width="50" height="50"></td>
        `;
        tabela.appendChild(tr);
      }
    }

    // Chama a função para carregar as fases ao iniciar a página
    window.onload = carregarFases;