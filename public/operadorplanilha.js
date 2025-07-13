import { db3 } from './firebase.js';
import { ref, get, set, remove } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// ELEMENTOS PRINCIPAIS
const tabelaPrincipal = document.querySelector("#tabela-principal tbody");
const seletorRitmo = document.getElementById("seletor-ritmo");
const seletorCategoria = document.getElementById("seletor-categoria");
const textoRitmo = document.getElementById("ritmo-atual");

let todosDados = [];
let categoriaSelecionada = "";
let mediasFinaisMap = new Map(); // Mapa com média final real

// ELEMENTOS TABELA SECUNDÁRIA
const tabelaSecundaria = document.querySelector("#tabela-secundaria tbody");
const seletorCategoriaSecundaria = document.getElementById("seletor-categoria-secundaria");
let dadosSecundarios = new Map();
let categoriaSelecionadaSecundaria = "";

// EVENTOS
seletorRitmo.addEventListener("change", () => {
  textoRitmo.textContent = seletorRitmo.value;
  carregarAvaliacoes(seletorRitmo.value);
});

seletorCategoria.addEventListener("change", () => {
  categoriaSelecionada = seletorCategoria.value;
  exibirLinhasFiltradas();
});

seletorCategoriaSecundaria.addEventListener("change", () => {
  categoriaSelecionadaSecundaria = seletorCategoriaSecundaria.value;
  exibirAgrupadoPorCategoria();
});

// Função para atualizar as categorias no seletor
function atualizarSeletorCategorias() {
  const categorias = [...new Set(todosDados.map(d => d.categoria))].sort();
  seletorCategoria.innerHTML = '<option value="">Todas</option>';
  categorias.forEach(cat => {
    const opt = document.createElement("option");
    opt.value = cat;
    opt.textContent = cat;
    seletorCategoria.appendChild(opt);
  });
  seletorCategoria.value = categoriaSelecionada || "";
}

// Função para exibir as linhas filtradas na tabela principal
function exibirLinhasFiltradas() {
  tabelaPrincipal.innerHTML = "";
  const mapaUnico = new Map();

  let filtrados = categoriaSelecionada
    ? todosDados.filter(d => d.categoria === categoriaSelecionada)
    : todosDados;

  filtrados.forEach(dado => {
    const id = dado.atleta + "||" + dado.categoria;
    if (!mapaUnico.has(id)) mapaUnico.set(id, dado);
  });

  const listaUnica = Array.from(mapaUnico.values()).sort((a, b) => b.media - a.media);

  listaUnica.forEach(dado => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td><input type="checkbox" /></td>
      <td contenteditable="true">${dado.atleta}</td>
      <td contenteditable="true">${dado.categoria}</td>
      <td contenteditable="true">${dado.notaA}</td>
      <td contenteditable="true">${dado.vantagemA || 0}</td>
      <td>${dado.notaFinalA.toFixed(1)}</td>
      <td contenteditable="true">${dado.notaB}</td>
      <td contenteditable="true">${dado.punicaoB || 0}</td>
      <td>${dado.notaFinalB.toFixed(1)}</td>
      <td contenteditable="true">${dado.notaC}</td>
      <td contenteditable="true">${dado.vantagemC || 0}</td>
      <td>${dado.notaFinalC.toFixed(1)}</td>
      <td>${(Math.floor(dado.media * 100) / 100).toFixed(2)}</td>
    `;
    tabelaPrincipal.appendChild(tr);
  });
}

// Função para salvar a média final no Firebase
function salvarMediaNoFirebase(dado) {
  // Arredonda a média para duas casas decimais
  const mediaComDuasCasas = (Math.floor(dado.media * 100) / 100).toFixed(2);

  // A URL da foto agora é extraída diretamente do dado
  const fotoUrl = dado.foto ? dado.foto : "";  // Caso não tenha foto, salva como string vazia

  // Ref para o caminho onde a média será salva no Firebase
  const mediaRef = ref(db3, `medias/${seletorRitmo.value}/${dado.atleta}||${dado.categoria}`);
  
  // Salva a média, atleta, categoria e foto no Firebase
  set(mediaRef, {
    media: mediaComDuasCasas, 
    atleta: dado.atleta,
    categoria: dado.categoria,
    foto: fotoUrl  // Agora a foto está sendo passada corretamente
  }).catch(error => {
    console.error("Erro ao salvar média no Firebase: ", error);
  });
}

// Função para carregar as avaliações a partir do Firebase
async function carregarAvaliacoes(ritmo) {
  const caminhos = {
    A: ref(db3, `avaliacoesA/${ritmo}`),
    B: ref(db3, `avaliacoesB/${ritmo}`),
    C: ref(db3, `avaliacoesC/${ritmo}`)
  };
  const dados = { A: {}, B: {}, C: {} };

  // Lê os dados de cada jurado
  await Promise.all(Object.entries(caminhos).map(async ([jurado, caminhoRef]) => {
    const snap = await get(caminhoRef);
    if (snap.exists()) {
      snap.forEach(child => {
        dados[jurado][child.key] = child.val();
      });
    }
  }));

  const chaves = new Set([...Object.keys(dados.A), ...Object.keys(dados.B), ...Object.keys(dados.C)]);
  todosDados = [];
  mediasFinaisMap = new Map(); // Zera mapa de médias

  // Calcula a média final e organiza os dados
  chaves.forEach(key => {
    const a = dados.A[key] ?? {};
    const b = dados.B[key] ?? {};
    const c = dados.C[key] ?? {};

    const atleta = a.atleta || b.atleta || c.atleta || "";
    const categoria = a.categoria || b.categoria || c.categoria || "";

    const notaA = parseFloat(a.nota || 0);
    const vantagemA = parseFloat(a.vantagem || 0);
    const notaFinalA = notaA + vantagemA;

    const notaB = parseFloat(b.nota || 0);
    const punicaoB = parseFloat(b.punicao || 0);
    const notaFinalB = notaB - punicaoB;

    const notaC = parseFloat(c.nota || 0);
    const vantagemC = parseFloat(c.vantagem || 0);
    const notaFinalC = notaC + vantagemC;

    const media = (notaFinalA + notaFinalB + notaFinalC) / 3;

    // Salva a média final real
    mediasFinaisMap.set(atleta + "||" + categoria, media);

    // Salva os dados, incluindo a foto
    todosDados.push({ 
      atleta, 
      categoria, 
      notaA, 
      vantagemA, 
      notaFinalA, 
      notaB, 
      punicaoB, 
      notaFinalB, 
      notaC, 
      vantagemC, 
      notaFinalC, 
      media, 
      foto: a.foto || b.foto || c.foto || ""  // A URL da foto
    });

    // Salva a média final no Firebase
    salvarMediaNoFirebase({
      atleta, 
      categoria, 
      media,
      foto: a.foto || b.foto || c.foto || ""  // Passa a foto do atleta ao salvar
    });
  });

  atualizarSeletorCategorias();
  exibirLinhasFiltradas();
}

// Função para excluir as linhas selecionadas da tabela principal
function excluirLinhasSelecionadas() {
  tabelaPrincipal.querySelectorAll("tr").forEach(linha => {
    const check = linha.querySelector("input[type='checkbox']");
    if (check?.checked) {
      const atleta = linha.querySelector("td:nth-child(2)").textContent;
      const categoria = linha.querySelector("td:nth-child(3)").textContent;
      const id = atleta + "||" + categoria;
      // Excluir do Firebase
      excluirDoFirebase(id);
      linha.remove();
    }
  });
}

// Função para excluir do Firebase
function excluirDoFirebase(id) {
  const mediaRef = ref(db3, `medias/${seletorRitmo.value}/${id}`);
  remove(mediaRef).then(() => {
    console.log("Dado excluído com sucesso do Firebase!");
  }).catch(error => {
    console.error("Erro ao excluir dado do Firebase: ", error);
  });
}

 

// Tabela segundaria 

// ELEMENTOS
//const tabelaSecundaria = document.querySelector("#tabela-secundaria tbody");
//const seletorCategoriaSecundaria = document.getElementById("seletor-categoria-secundaria");
// Função para carregar dados dos atletas

// Função principal
// Função para organizar e classificar os atletas por fase e categoria



// Função para organizar e classificar os atletas por fase e categoria
// Função para organizar e classificar os atletas por fase e categoria
// Função para organizar e classificar os atletas por fase e categoria
// Função para organizar e classificar os atletas por fase e categoria
// Função para classificar e salvar os atletas nas fases no Firebase
// Função para classificar e salvar os atletas nas fases no Firebase
// Função para classificar e salvar os atletas nas fases no Firebase
async function classificarAtletas() {
  // Pega os dados dos atletas no Firebase
  const atletas = await obterAtletasFirebase();

  // Ordena os atletas pela nota final em ordem decrescente
  atletas.sort((a, b) => b.notaFinal - a.notaFinal);

  // Salva a classificação inicial dos atletas
  await salvarClassificacao(atletas);

  // Classifica e salva nas fases (Oitavas, Quartas, Semifinal, Final)
  await classificarFases(atletas);
}

// Função para classificar as fases de Oitavas, Quartas, Semifinal e Final
async function classificarFases(atletas) {
  // Oitavas de final (16 atletas)
  let oitavas = [];
  if (atletas.length >= 16) {
    oitavas = atletas.slice(0, 16);
    await salvarFaseFirebase(oitavas, 'oitavas');
  } else {
    console.log(`Menos de 16 atletas, passando para Quartas de final.`);
    let quartas = atletas.slice(0, 8); // Passa para Quartas
    await salvarFaseFirebase(quartas, 'quartas');
    return;
  }

  // Quartas de final (8 atletas)
  let quartas = [];
  if (oitavas.length >= 8) {
    quartas = oitavas.slice(0, 8);
    await salvarFaseFirebase(quartas, 'quartas');
  } else {
    console.log(`Menos de 8 atletas, passando para Semifinal.`);
    let semifinal = oitavas.slice(0, 4); // Passa para Semifinal
    await salvarFaseFirebase(semifinal, 'semifinal');
    return;
  }

  // Semifinal (4 atletas)
  let semifinal = [];
  if (quartas.length >= 4) {
    semifinal = quartas.slice(0, 4);
    await salvarFaseFirebase(semifinal, 'semifinal');
  } else {
    console.log(`Menos de 4 atletas, passando para Final.`);
    let final = quartas.slice(0, 2); // Passa para Final
    await salvarFaseFirebase(final, 'final');
    return;
  }

  // Final (2 atletas)
  let final = [];
  if (semifinal.length >= 2) {
    final = semifinal.slice(0, 2);
    await salvarFaseFirebase(final, 'final');
  } else {
    console.log(`Menos de 2 atletas, armazenando o que restar na Final.`);
    final = semifinal; // Todos os disponíveis vão para a Final
    await salvarFaseFirebase(final, 'final');
  }
}

// Função para salvar a classificação inicial no Firebase
async function salvarClassificacao(atletas) {
  const classificacaoRef = ref(db3, `classificacao`);
  const classificacaoDados = {};

  atletas.forEach(atleta => {
    classificacaoDados[atleta.nome] = {
      nome: atleta.nome,
      categoria: atleta.categoria,
      notaFinal: atleta.notaFinal,
      foto: atleta.foto // Foto do atleta (URL)
    };
  });

  await set(classificacaoRef, classificacaoDados)
    .then(() => {
      console.log("Classificação salva com sucesso.");
    })
    .catch(error => {
      console.error("Erro ao salvar classificação no Firebase: ", error);
    });
}

// Função para obter os dados de atletas do Firebase
async function obterAtletasFirebase() {
  const ritmos = ['regional', 'angola', 'iuna'];
  const atletas = [];

  for (const ritmo of ritmos) {
    const refRitmo = ref(db3, `medias/${ritmo}`);
    const snapshot = await get(refRitmo);
    if (snapshot.exists()) {
      const dados = snapshot.val();

      // Percorre todos os atletas e coleta os dados
      Object.keys(dados).forEach(chave => {
        const [atleta, categoria] = chave.split("||");
        const media = dados[chave]?.media || 0;
        const foto = dados[chave]?.foto || ''; // Foto do atleta (URL)

        // Adiciona o atleta no array
        atletas.push({
          nome: atleta,
          categoria: categoria,
          notaFinal: media, // A nota final vem da média
          foto: foto // Foto do atleta
        });
      });
    }
  }

  return atletas;
}

// Função para salvar as fases (Oitavas, Quartas, Semifinal e Final) no Firebase
async function salvarFaseFirebase(atletas, fase) {
  const faseRef = ref(db3, `${fase}`);  // A chave é o nome da fase
  const faseDados = {};

  atletas.forEach(atleta => {
    faseDados[atleta.nome] = {
      nome: atleta.nome,
      categoria: atleta.categoria,
      notaFinal: atleta.notaFinal,
      foto: atleta.foto // Foto do atleta (URL)
    };
  });

  await set(faseRef, faseDados)
    .then(() => {
      console.log(`${fase.charAt(0).toUpperCase() + fase.slice(1)} salva com sucesso`);
    })
    .catch(error => {
      console.error("Erro ao salvar fase no Firebase: ", error);
    });
}

// Inicialização
classificarAtletas(); // Inicia o processo de classificação e armazenamento das fases


//
//
// Função chamada ao clicar no botão "Enviar para Oitavas"
document.addEventListener('DOMContentLoaded', function () {
  // Função chamada ao clicar no botão "Enviar para Oitavas"
  async function enviarParaOitavas() {
    const atletasRef = ref(db3, 'classificacao');
    const snapshot = await get(atletasRef);

    if (!snapshot.exists()) {
      console.log("Nenhum dado encontrado na classificação.");
      return;
    }

    const atletas = Object.values(snapshot.val());

    // Ordena os atletas pela Nota Final em ordem decrescente
    atletas.sort((a, b) => parseFloat(b.notaFinal) - parseFloat(a.notaFinal));

    // Verifica se há pelo menos 16 atletas para a fase de Oitavas
    if (atletas.length >= 16) {
      const atletasParaOitavas = atletas.slice(0, 16);

      // Salva os 16 melhores atletas na fase de Oitavas no Firebase
      for (let atleta of atletasParaOitavas) {
        const chave = atleta.atleta + '||' + atleta.categoria;
        const oitavasRef = ref(db3, `oitavas/${chave}`);

        await set(oitavasRef, {
          atleta: atleta.atleta,
          categoria: atleta.categoria,
          notaFinal: atleta.notaFinal,
          foto: atleta.foto || ""  // Caso não tenha foto, salva uma string vazia
        }).then(() => {
          console.log(`Atleta ${atleta.atleta} da categoria ${atleta.categoria} salvo em Oitavas`);
        }).catch((error) => {
          console.error("Erro ao salvar no Firebase: ", error);
        });
      }

      console.log('Oitavas enviadas com sucesso!');
    } else {
      // Se não houver 16 atletas, exibe mensagem de erro
      const erroMensagem = `Não há atletas suficientes para as Oitavas. Necessário pelo menos 16 atletas. Apenas ${atletas.length} encontrados.`;
      console.error(erroMensagem);
      alert(erroMensagem);  // Exibe uma mensagem de erro para o usuário
      await enviarParaQuartas();  // Envia para Quartas se não houver 16 atletas
    }
  }

  // Função para enviar os melhores para Quartas
  async function enviarParaQuartas() {
    const atletasRef = ref(db3, 'classificacao');
    const snapshot = await get(atletasRef);

    if (!snapshot.exists()) {
      console.log("Nenhum dado encontrado na classificação.");
      return;
    }

    const atletas = Object.values(snapshot.val());

    atletas.sort((a, b) => parseFloat(b.notaFinal) - parseFloat(a.notaFinal));

    if (atletas.length >= 8) {
      const atletasParaQuartas = atletas.slice(0, 8);

      for (let atleta of atletasParaQuartas) {
        const chave = atleta.atleta + '||' + atleta.categoria;
        const quartasRef = ref(db3, `quartas/${chave}`);

        await set(quartasRef, {
          atleta: atleta.atleta,
          categoria: atleta.categoria,
          notaFinal: atleta.notaFinal,
          foto: atleta.foto || ""
        }).then(() => {
          console.log(`Atleta ${atleta.atleta} da categoria ${atleta.categoria} salvo em Quartas`);
        }).catch((error) => {
          console.error("Erro ao salvar no Firebase: ", error);
        });
      }

      console.log('Quartas enviadas com sucesso!');
    } else {
      // Se não houver 8 atletas, exibe mensagem de erro
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
      // Se não houver 4 atletas, exibe mensagem de erro
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

  // Vincula o evento de clique no botão "Enviar para Oitavas"
  document.getElementById('enviar-oitavas').addEventListener('click', enviarParaOitavas);
});


// Função para carregar os dados secundários e calcular a nota final
// Função para carregar os dados secundários e calcular a nota final
// Função para carregar os dados secundários do Firebase
async function carregarDadosSecundariosFirebase() {
  const ritmos = ['regional', 'angola', 'iuna'];
  const categoriaSelecionada = seletorCategoriaSecundaria.value;

  const dadosPorRitmo = {};

  // Carrega as médias de cada ritmo
  for (const ritmo of ritmos) {
    const refRitmo = ref(db3, `medias/${ritmo}`);
    const snapshot = await get(refRitmo);
    if (snapshot.exists()) {
      dadosPorRitmo[ritmo] = snapshot.val();
    } else {
      dadosPorRitmo[ritmo] = {};
    }
  }

  // Unifica atletas + categorias encontrados nos três ritmos
  const atletasUnicos = new Set();
  ritmos.forEach(ritmo => {
    Object.keys(dadosPorRitmo[ritmo]).forEach(chave => atletasUnicos.add(chave));
  });

  const dadosTabela = [];

  atletasUnicos.forEach(chave => {
    const [atleta, categoria] = chave.split("||");

    // Filtra por categoria, se necessário
    if (
      categoriaSelecionada && categoriaSelecionada !== "Todas" &&
      categoria !== categoriaSelecionada
    ) return;

    const medias = {
      regional: parseFloat(dadosPorRitmo['regional'][chave]?.media || 0),
      angola: parseFloat(dadosPorRitmo['angola'][chave]?.media || 0),
      iuna: parseFloat(dadosPorRitmo['iuna'][chave]?.media || 0),
    };

    const soma = medias.regional + medias.angola + medias.iuna;
    const notaFinal = soma > 0 ? (soma / 3).toFixed(2) : '0.00';

    // Obter a foto do atleta (de qualquer jurado A, B ou C)
    const foto = dadosPorRitmo['regional'][chave]?.foto || 
                dadosPorRitmo['angola'][chave]?.foto || 
                dadosPorRitmo['iuna'][chave]?.foto || 
                "";  // Caso não tenha foto, salva uma string vazia

    dadosTabela.push({
      atleta,
      categoria,
      regional: medias.regional > 0 ? medias.regional.toFixed(2) : 'N/A',
      angola: medias.angola > 0 ? medias.angola.toFixed(2) : 'N/A',
      iuna: medias.iuna > 0 ? medias.iuna.toFixed(2) : 'N/A',
      notaFinal
    });

    // Chama a função para salvar a nota final e a foto no Firebase
    salvarClassificacaoNoFirebase(atleta, categoria, notaFinal, foto);
  });

  // 🔥 Ordena da maior para menor nota final
  dadosTabela.sort((a, b) => parseFloat(b.notaFinal) - parseFloat(a.notaFinal));

  preencherTabelaSecundaria(dadosTabela);
}

// Função para salvar a classificação no Firebase
function salvarClassificacaoNoFirebase(atleta, categoria, notaFinal, foto) {
  const classificacaoRef = ref(db3, `classificacao/${atleta}||${categoria}`);
  set(classificacaoRef, {
    atleta: atleta,
    categoria: categoria,
    notaFinal: notaFinal,  // A nota final calculada
    foto: foto  // Foto do atleta (caso não tenha, salva uma string vazia)
  })
  .then(() => {
    console.log(`Classificação salva com sucesso para ${atleta} - ${categoria}`);
  })
  .catch(error => {
    console.error("Erro ao salvar classificação no Firebase: ", error);
  });
}

// Função para preencher a tabela de dados na interface
function preencherTabelaSecundaria(dados) {
  tabelaSecundaria.innerHTML = "";

  if (dados.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = `<td colspan="6">Nenhum dado encontrado.</td>`;
    tabelaSecundaria.appendChild(tr);
    return;
  }

  dados.forEach(item => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.atleta}</td>
      <td>${item.categoria}</td>
      <td>${item.regional}</td>
      <td>${item.angola}</td>
      <td>${item.iuna}</td>
      <td>${item.notaFinal}</td>
    `;
    tabelaSecundaria.appendChild(tr);
  });
}

// Função para carregar categorias no select (gerenciamento do filtro)
async function carregarCategoriasSelect() {
  const ritmos = ['regional', 'angola', 'iuna'];
  const categoriasSet = new Set();

  for (const ritmo of ritmos) {
    const refRitmo = ref(db3, `medias/${ritmo}`);
    const snapshot = await get(refRitmo);
    if (snapshot.exists()) {
      const dados = snapshot.val();
      Object.keys(dados).forEach(chave => {
        const categoria = chave.split("||")[1];
        if (categoria) categoriasSet.add(categoria);
      });
    }
  }

  seletorCategoriaSecundaria.innerHTML = "";

  const opcaoTodas = document.createElement("option");
  opcaoTodas.value = "Todas";
  opcaoTodas.textContent = "Todas";
  seletorCategoriaSecundaria.appendChild(opcaoTodas);

  categoriasSet.forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = cat;
    seletorCategoriaSecundaria.appendChild(option);
  });
}

// Eventos
document.getElementById("seletor-ritmo").addEventListener("change", carregarDadosSecundariosFirebase);
seletorCategoriaSecundaria.addEventListener("change", carregarDadosSecundariosFirebase);

// Função que retorna os dados de médias do Firebase
export async function obterMediasDoFirebase() {
  const ritmos = ['regional', 'angola', 'iuna'];
  const dadosPorRitmo = {};

  for (const ritmo of ritmos) {
    const refRitmo = ref(db3, `medias/${ritmo}`);
    const snapshot = await get(refRitmo);
    dadosPorRitmo[ritmo] = snapshot.exists() ? snapshot.val() : {};
  }

  return dadosPorRitmo;
}

// Inicialização
carregarCategoriasSelect();
carregarDadosSecundariosFirebase();
