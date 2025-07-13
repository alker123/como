import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-app.js";
import { getDatabase, ref, push, set, onValue, remove, get } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// Banco principal
const firebaseConfig1 = {
  databaseURL: "https://dados-teste-8b85d-default-rtdb.firebaseio.com/"
};
const app1 = initializeApp(firebaseConfig1, "app1");
const db1 = getDatabase(app1);

// Banco secundário
const firebaseConfig2 = {
  databaseURL: "https://testes2-69ead-default-rtdb.firebaseio.com/"
};
const app2 = initializeApp(firebaseConfig2, "app2");
const db2 = getDatabase(app2);

// Adicionar atleta e categoria
    const fotoPerfil = document.getElementById('fotoPerfil');
    const inputFoto = document.getElementById('inputFoto');
    const botaoFoto = document.getElementById('botaoFoto');
    const nomeAtleta = document.getElementById('nome-atleta');
    const categoriaAtleta = document.getElementById('nome-categoria');
    const cadastrarAtletaBtn = document.getElementById('add-categoria-btn');

 const apiKey = '475b0d11eb8eafceee5534305a71a9a5';

    botaoFoto.addEventListener('click', () => {
      inputFoto.click();
    });

    inputFoto.addEventListener('change', (event) => {
      const arquivo = event.target.files[0];
      if (arquivo) {
        const formData = new FormData();
        formData.append('image', arquivo);

        fetch(`https://api.imgbb.com/1/upload?key=${apiKey}`, {
          method: 'POST',
          body: formData
        })
        .then(response => response.json())
        .then(data => {
          if (data.success) {
            const urlFoto = data.data.url;
            fotoPerfil.src = urlFoto;
          } else {
            alert("Erro ao enviar a foto.");
          }
        })
        .catch(error => {
          alert("Erro ao enviar a foto.");
        });
      }
    });

    cadastrarAtletaBtn.addEventListener('click', () => {
      const nome = nomeAtleta.value.trim();
      const categoria = categoriaAtleta.value.trim();

      if (!nome || !categoria) {
        return alert("Preencha o nome e a categoria do atleta.");
      }

      // Se não alterou a imagem, salva em branco (sem URL de avatar padrão)
      const urlFoto = fotoPerfil.src.includes("foto.png") ? "" : fotoPerfil.src;

      const atletaRef = ref(db1, 'atletasPorCategoria/' + categoria);
      const newAtletaRef = push(atletaRef);

      set(newAtletaRef, {
        nome: nome,
        categoria: categoria,
        foto: urlFoto
      }).then(() => {
        alert("Atleta cadastrado com sucesso!");
        nomeAtleta.value = "";
        categoriaAtleta.value = "";
        fotoPerfil.src = "img/foto.png";
      }).catch((error) => {
        alert("Erro ao cadastrar o atleta: " + error.message);
      });
    });


// Referências DOM
const listaAtletas = document.getElementById("lista-atletas");
const atletaOperador = document.getElementById("atleta-operador");
const listaCategorias = document.getElementById("lista-categorias");
const listaCategorias2 = document.getElementById("lista-categorias-2");
const categoriaOperador = document.getElementById("categoria-operador");
const fotoAtletaContainer = document.getElementById("foto-atleta-container");
const fotoAtleta = document.getElementById("foto-atleta");

// Atualizar listas de categorias e atletas
function atualizarListas() {
  listaCategorias.innerHTML = '';
  listaCategorias2.innerHTML = '';
  categoriaOperador.innerHTML = '';
  listaAtletas.innerHTML = '';
  atletaOperador.innerHTML = '';

  // Placeholder
  const placeholder = new Option("Selecionar categoria", "");
  placeholder.disabled = true;

  listaCategorias.appendChild(placeholder.cloneNode(true));
  listaCategorias2.appendChild(placeholder.cloneNode(true));
  categoriaOperador.appendChild(placeholder.cloneNode(true));

  onValue(ref(db1, 'atletasPorCategoria'), (snapshot) => {
    if (!snapshot.exists()) return;
    const dados = snapshot.val();

    const categoriasOrdenadas = Object.keys(dados).sort((a, b) => {
      if (a === "adulto") return -1;
      if (b === "adulto") return 1;
      return a.localeCompare(b);
    });

    categoriasOrdenadas.forEach((categoria) => {
      listaCategorias.add(new Option(categoria, categoria));
      listaCategorias2.add(new Option(categoria, categoria));
      categoriaOperador.add(new Option(categoria, categoria));
    });
  }, { onlyOnce: true });
}

// Mostrar atletas por categoria
listaCategorias2.addEventListener("change", () => {
  const categoriaSelecionada = listaCategorias2.value;
  listaAtletas.innerHTML = '';

  if (!categoriaSelecionada) return;

  onValue(ref(db1, `atletasPorCategoria/${categoriaSelecionada}`), (snapshot) => {
    if (!snapshot.exists()) return;
    const atletas = snapshot.val();

    Object.entries(atletas).forEach(([id, atleta]) => {
      const value = JSON.stringify({ id, categoria: categoriaSelecionada, foto: atleta.foto });
      listaAtletas.add(new Option(atleta.nome, value));
    });
  }, { onlyOnce: true });
});

// Excluir atletas

// Carrega as categorias do Firebase e insere a opção inicial
onValue(ref(db1, "categorias"), snapshot => {
  listaCategorias2.innerHTML = "";

  // Opção inicial
  const opcaoInicial = document.createElement("option");
  opcaoInicial.value = "";
  opcaoInicial.textContent = "Selecionar categoria";
  opcaoInicial.disabled = true;
  opcaoInicial.selected = true;
  listaCategorias2.appendChild(opcaoInicial);

  // Adiciona as categorias reais
  snapshot.forEach(catSnap => {
    const categoria = catSnap.key;
    const option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    listaCategorias2.appendChild(option);
  });
});

// Carrega os atletas da categoria selecionada (sem duplicar)
listaCategorias2.addEventListener("change", () => {
  const categoriaSelecionada = listaCategorias2.value;
  if (!categoriaSelecionada) return;

  listaAtletas.innerHTML = "";

  const atletasRef = ref(db1, `atletasPorCategoria/${categoriaSelecionada}`);
  get(atletasRef).then(snapshot => {
    listaAtletas.innerHTML = ""; // limpa a lista sempre antes de adicionar

    if (!snapshot.exists()) return;

    snapshot.forEach(atletaSnap => {
      const atleta = atletaSnap.val();
      const option = document.createElement("option");

      option.value = JSON.stringify({
        id: atletaSnap.key,
        categoria: categoriaSelecionada
      });

      option.textContent = atleta.nome || "Sem nome";
      listaAtletas.appendChild(option);
    });
  });
});

document.getElementById("excluir-atleta-btn").onclick = () => {
  const selecionados = Array.from(listaAtletas.selectedOptions);
  if (selecionados.length === 0) return alert("Selecione atleta(s).");

  if (!confirm("Confirmar exclusão dos atletas?")) return;

  selecionados.forEach(opt => {
    const { id, categoria } = JSON.parse(opt.value);
    remove(ref(db1, `atletasPorCategoria/${categoria}/${id}`));
  });

  alert("Atletas excluídos!");
  listaCategorias2.dispatchEvent(new Event('change'));
};

// Excluir categorias
document.getElementById("excluir-categoria-btn").onclick = () => {
  const selecionadas = Array.from(listaCategorias.selectedOptions).map(opt => opt.value);
  if (selecionadas.length === 0) return alert("Selecione categoria(s).");
  if (!confirm("Confirmar exclusão das categorias?")) return;

  selecionadas.forEach(cat => {
    remove(ref(db1, `atletasPorCategoria/${cat}`));
  });

  alert("Categorias excluídas!");
  atualizarListas();
};

// Preencher atletas ao selecionar categoria para operador
onValue(ref(db1, "categorias"), snapshot => {
  categoriaOperador.innerHTML = "";

  const opcaoInicial = document.createElement("option");
  opcaoInicial.value = "";
  opcaoInicial.textContent = "Selecionar categoria";
  opcaoInicial.disabled = true;
  opcaoInicial.selected = true;
  categoriaOperador.appendChild(opcaoInicial);

  snapshot.forEach(catSnap => {
    const categoria = catSnap.key;
    const option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    categoriaOperador.appendChild(option);
  });
});

// Quando mudar a categoria no operador
categoriaOperador.addEventListener("change", () => {
  const categoria = categoriaOperador.value;
  atletaOperador.innerHTML = ''; // Limpa a lista anterior
  fotoAtletaContainer.style.display = 'none'; // Oculta a foto inicialmente

  if (!categoria) return;

  const atletasRef = ref(db1, `atletasPorCategoria/${categoria}`);
  get(atletasRef).then(snapshot => {
    if (!snapshot.exists()) {
      console.log(`Nenhum dado encontrado para a categoria ${categoria}.`);
      return;
    }

    const atletas = snapshot.val();
    console.log("Atletas carregados para a categoria:", atletas);

    Object.entries(atletas).forEach(([id, atleta]) => {
      const fotoSegura = atleta.foto && atleta.foto.trim() !== "" ? atleta.foto : "img/foto.png";
      const option = new Option(
        atleta.nome,
        JSON.stringify({ id, categoria, foto: fotoSegura })
      );
      atletaOperador.add(option);
    });
  });
});

// Exibir a foto do atleta ao selecionar
atletaOperador.addEventListener("change", () => {
  const atletaSelecionado = atletaOperador.value;
  if (!atletaSelecionado) return;

  const { foto } = JSON.parse(atletaSelecionado);

  // Exibir imagem padrão se estiver vazia
  fotoAtleta.src = foto && foto.trim() !== "" ? foto : "img/foto.png";
  fotoAtletaContainer.style.display = 'block';
});



// Enviar atletas ao operador
document.getElementById("enviar-operador-btn").onclick = () => {
  const atletasSelecionados = Array.from(atletaOperador.selectedOptions);
  if (atletasSelecionados.length === 0) {
    alert("Selecione atletas para enviar ao operador.");
    return;
  }

  const dadosParaEnviar = {};

  atletasSelecionados.forEach(opt => {
    try {
      const { id, categoria, foto } = JSON.parse(opt.value);
      if (!dadosParaEnviar[categoria]) dadosParaEnviar[categoria] = {};

      dadosParaEnviar[categoria][id] = {
        nome: opt.textContent,
        foto: foto && foto.trim() !== "" ? foto : "img/foto.png"
      };
    } catch (e) {
      console.warn("Erro ao interpretar atleta:", opt.value, e);
    }
  });

  // Buscar dados atuais do Firebase antes de atualizar
  get(ref(db2, "enviosParaOperador"))
    .then(snapshot => {
      const dadosExistentes = snapshot.val() || {};
      const novosDados = { ...dadosExistentes };

      Object.entries(dadosParaEnviar).forEach(([categoria, atletas]) => {
        if (!novosDados[categoria]) novosDados[categoria] = {};

        Object.entries(atletas).forEach(([id, atleta]) => {
          if (!novosDados[categoria][id]) {
            novosDados[categoria][id] = atleta;
          }
        });
      });

      const promessas = Object.entries(novosDados).map(([categoria, atletas]) =>
        set(ref(db2, `enviosParaOperador/${categoria}`), atletas)
      );

      return Promise.all(promessas);
    })
    .then(() => {
      alert("Dados enviados ao operador com sucesso!");
    })
    .catch(err => {
      console.error("Erro ao enviar:", err);
      alert("Erro ao enviar dados ao operador.");
    });
};

// Atualizar listas ao carregar
atualizarListas();



