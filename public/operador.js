import { db4 as db } from "./firebase.js";
import { ref, onValue, push } from "https://www.gstatic.com/firebasejs/9.22.2/firebase-database.js";

// 📌 Elementos HTML
const atletaSelect = document.getElementById("atleta-operador");
const categoriaSelect = document.getElementById("categoria-operador");
const ritmoSelect = document.getElementById("ritmo-operador");
const btnEnviar = document.getElementById("enviar-dados");

let dadosAtletas = {}; // 🔹 Agora sim! Armazena info completa, inclusive foto

// 🔁 Carrega categorias ao abrir
onValue(ref(db, "enviosParaOperador"), snap => {
  categoriaSelect.innerHTML = "<option value=''>Selecione</option>";

  if (snap.exists()) {
    const data = snap.val();
    const categorias = Object.keys(data);

    categorias.forEach(categoria => {
      const opt = document.createElement("option");
      opt.value = categoria;
      opt.textContent = categoria;
      categoriaSelect.appendChild(opt);
    });
  }
});

// 📌 Quando categoria é selecionada, carrega os atletas daquela categoria
categoriaSelect.addEventListener("change", () => {
  const categoria = categoriaSelect.value;
  atletaSelect.innerHTML = "<option value=''>Selecione</option>";
  dadosAtletas = {}; // resetar ao trocar categoria

  if (!categoria) return;

  const categoriaRef = ref(db, `enviosParaOperador/${categoria}`);
  onValue(categoriaRef, snap => {
    atletaSelect.innerHTML = "<option value=''>Selecione</option>";

    if (snap.exists()) {
      const atletasObj = snap.val();
      for (const id in atletasObj) {
        const atleta = atletasObj[id];
        const nome = atleta.nome;

        if (nome) {
          // Salva todos os dados do atleta, inclusive foto
          dadosAtletas[nome] = {
            id,
            nome: atleta.nome,
            categoria: atleta.categoria || categoria,
            foto: atleta.foto || ""
          };

          const opt = document.createElement("option");
          opt.value = nome;
          opt.textContent = nome;
          atletaSelect.appendChild(opt);
        }
      }
    }
  }, { onlyOnce: true });
});

// 🚀 Enviar dados para jurados
btnEnviar.addEventListener("click", () => {
  const atletas = Array.from(atletaSelect.selectedOptions).map(opt => opt.value);
  const categoria = categoriaSelect.value;
  const ritmo = ritmoSelect.value;

  if (!atletas.length || !categoria || !ritmo) {
    alert("⚠️ Selecione um atleta, uma categoria e o ritmo.");
    return;
  }

  const jurados = [
    { raiz: "avaliacaodejuradoA", nome: "juradoA" },
    { raiz: "avaliacaodejuradoB", nome: "juradoB" },
    { raiz: "avaliacaodejuradoC", nome: "juradoC" }
  ];

  atletas.forEach(nomeAtleta => {
    const info = dadosAtletas[nomeAtleta];
    if (!info) {
      console.warn(`⚠️ Dados do atleta "${nomeAtleta}" não encontrados.`);
      return;
    }

    const dados = {
      nome: info.nome,
      categoria: info.categoria,
      ritmo: ritmo,
      foto: info.foto || ""
    };

    jurados.forEach(({ raiz, nome }) => {
      const caminho = `${raiz}/${ritmo}/${nome}`;
      push(ref(db, caminho), dados)
        .then(() => {
          console.log(`✅ Enviado para ${caminho}`, dados);
        })
        .catch(err => {
          console.error(`❌ Erro ao enviar para ${caminho}:`, err);
        });
    });
  });

  alert("✅ Dados enviados para os jurados!");

  atletaSelect.innerHTML = "<option value=''>Selecione</option>";
  categoriaSelect.value = "";
  ritmoSelect.value = "";
});
 

