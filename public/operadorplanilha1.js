
// Função para mostrar a tabela secundária (Média total)
// Função para mostrar a tabela secundária (Média total)
async function verMediaPorRitmo() {
  document.getElementById("tabela-principal-container").style.display = "none";
  document.getElementById("tabela-secundaria-container").style.display = "block";
  
  await exibirDadosSecundarios(); // sua função de preencher tabela secundária
}

// Função para voltar para a Tabela Principal
function voltarParaTabela() {
  document.getElementById("tabela-secundaria-container").style.display = "none";
  document.getElementById("tabela-principal-container").style.display = "block";
}

// Oitavas de Final
 function oitavas() {
    document.getElementById("tabela-principal-container").style.display = "none";
    document.getElementById("tabela-secundaria-container").style.display = "none"; 
    document.getElementById("tabela-oitavas-container").style.display = "block";
  }

  function voltarParaTabela1() {
    document.getElementById("tabela-oitavas-container").style.display = "none";
    document.getElementById("tabela-principal-container").style.display = "block";
  }
  
// Quartas de Final
function quartas() {
  document.getElementById("tabela-secundaria-container").style.display = "none";
  document.getElementById("tabela-principal-container").style.display = "none";
  document.getElementById("tabela-oitavas-container").style.display = "none";
  document.getElementById("quartas-container").style.display = "block";
}
function voltarParaTabela2() {
  document.getElementById("tabela-principal-container").style.display = "block";
  document.getElementById("quartas-container").style.display = "none";
}

// Semifinal
function semi_final() {
  document.getElementById("tabela-secundaria-container").style.display = "none";
  document.getElementById("tabela-principal-container").style.display = "none";
  document.getElementById("tabela-oitavas-container").style.display = "none";
  document.getElementById("quartas-container").style.display = "none";
  document.getElementById("semi-final-container").style.display = "block";
}
function voltarParaTabela3() {
  document.getElementById("tabela-principal-container").style.display = "block";
  document.getElementById("semi-final-container").style.display = "none";
}

// Final
function final() {
  document.getElementById("tabela-secundaria-container").style.display = "none";
  document.getElementById("tabela-principal-container").style.display = "none";
  document.getElementById("tabela-oitavas-container").style.display = "none";
  document.getElementById("quartas-container").style.display = "none";
  document.getElementById("semi-final-container").style.display = "none";
  document.getElementById("final-container").style.display = "block";
}
function voltarParaTabela4() {
  document.getElementById("tabela-principal-container").style.display = "block";
  document.getElementById("final-container").style.display = "none";
}

// Tornar visível no HTML
  window.verMediaPorRitmo = verMediaPorRitmo;
  window.oitavas = oitavas;
  window.quartas = quartas;
  window.semi_final = semi_final;
  window.final = final;
  window.voltarParaTabela = voltarParaTabela;
  window.voltarParaTabela1 = voltarParaTabela1;
  window.voltarParaTabela2 = voltarParaTabela2;
  window.voltarParaTabela3 = voltarParaTabela3;
  window.voltarParaTabela4 = voltarParaTabela4;
  

function mostrarSomente(id) {
  const containers = [
    "tabela-secundaria-container",
    "tabela-principal-container",
    "oitavas-container",
    "quartas-container",
    "semi-final-container",
    "final-container"
  ];

  // Esconde todos os containers
  containers.forEach(container => {
    document.getElementById(container).style.display = "none";
  });

  // Mostra o contêiner desejado
  document.getElementById(id).style.display = "block";
}
 
// Função para selecionar atletas de uma categoria específica
async function selecionarAtletasPorCategoria(categoria) {
  const atletasRef = ref(db3, 'classificacao');
  const snapshot = await get(atletasRef);

  if (!snapshot.exists()) {
    console.log("Nenhum dado encontrado na classificação.");
    return [];
  }

  // Filtra os atletas pela categoria selecionada
  const atletas = Object.values(snapshot.val()).filter(atleta => atleta.categoria === categoria);
  return atletas;
}

document.getElementById('enviar-oitavas').addEventListener('click', async () => {
  const categoriaSelecionada = document.getElementById('seletor-categoria').value;
  
  if (!categoriaSelecionada) {
    alert("Por favor, selecione uma categoria.");
    return;
  }

  const atletas = await selecionarAtletasPorCategoria(categoriaSelecionada);

  if (atletas.length < 16) {
    console.log("Não há 16 atletas suficientes para Oitavas, passando para Quartas...");
    enviarParaQuartas(categoriaSelecionada, atletas);
  } else {
    // Ordena pela nota final e seleciona os 16 melhores para Oitavas
    atletas.sort((a, b) => b.notaFinal - a.notaFinal);
    const atletasOitavas = atletas.slice(0, 16);

    // Envia para a fase Oitavas no Firebase
    for (const atleta of atletasOitavas) {
      const chave = `${atleta.atleta}||${atleta.categoria}`;
      const oitavasRef = ref(db3, `oitavas/${chave}`);
      await set(oitavasRef, {
        atleta: atleta.atleta,
        categoria: atleta.categoria,
        notaFinal: atleta.notaFinal,
        foto: atleta.foto || "",
      }).then(() => {
        console.log(`Atleta ${atleta.atleta} da categoria ${atleta.categoria} enviado para Oitavas`);
      }).catch((error) => {
        console.error("Erro ao salvar no Firebase: ", error);
      });
    }
    console.log('Oitavas enviadas com sucesso!');
  }
});

async function enviarParaQuartas(categoriaSelecionada, atletas) {
  if (atletas.length < 8) {
    console.log("Não há 8 atletas suficientes para Quartas, passando para Semifinal...");
    enviarParaSemifinal(categoriaSelecionada, atletas);
  } else {
    // Ordena os atletas por nota final e seleciona os 8 melhores para Quartas
    atletas.sort((a, b) => b.notaFinal - a.notaFinal);
    const atletasQuartas = atletas.slice(0, 8);

    // Envia para a fase Quartas no Firebase
    for (const atleta of atletasQuartas) {
      const chave = `${atleta.atleta}||${atleta.categoria}`;
      const quartasRef = ref(db3, `quartas/${chave}`);
      await set(quartasRef, {
        atleta: atleta.atleta,
        categoria: atleta.categoria,
        notaFinal: atleta.notaFinal,
        foto: atleta.foto || "",
      }).then(() => {
        console.log(`Atleta ${atleta.atleta} da categoria ${atleta.categoria} enviado para Quartas`);
      }).catch((error) => {
        console.error("Erro ao salvar no Firebase: ", error);
      });
    }
    console.log('Quartas enviadas com sucesso!');
  }
}

async function enviarParaSemifinal(categoriaSelecionada, atletas) {
  if (atletas.length < 4) {
    console.log("Não há 4 atletas suficientes para Semifinal, passando para Final...");
    enviarParaFinal(categoriaSelecionada, atletas);
  } else {
    // Ordena os atletas por nota final e seleciona os 4 melhores para Semifinal
    atletas.sort((a, b) => b.notaFinal - a.notaFinal);
    const atletasSemifinal = atletas.slice(0, 4);

    // Envia para a fase Semifinal no Firebase
    for (const atleta of atletasSemifinal) {
      const chave = `${atleta.atleta}||${atleta.categoria}`;
      const semifinalRef = ref(db3, `semifinal/${chave}`);
      await set(semifinalRef, {
        atleta: atleta.atleta,
        categoria: atleta.categoria,
        notaFinal: atleta.notaFinal,
        foto: atleta.foto || "",
      }).then(() => {
        console.log(`Atleta ${atleta.atleta} da categoria ${atleta.categoria} enviado para Semifinal`);
      }).catch((error) => {
        console.error("Erro ao salvar no Firebase: ", error);
      });
    }
    console.log('Semifinal enviada com sucesso!');
  }
}

async function enviarParaFinal(categoriaSelecionada, atletas) {
  if (atletas.length < 2) {
    console.log("Não há 2 atletas suficientes para Final.");
    return;
  }

  // Ordena os atletas por nota final e seleciona os 2 melhores para Final
  atletas.sort((a, b) => b.notaFinal - a.notaFinal);
  const atletasFinal = atletas.slice(0, 2);

  // Envia para a fase Final no Firebase
  for (const atleta of atletasFinal) {
    const chave = `${atleta.atleta}||${atleta.categoria}`;
    const finalRef = ref(db3, `final/${chave}`);
    await set(finalRef, {
      atleta: atleta.atleta,
      categoria: atleta.categoria,
      notaFinal: atleta.notaFinal,
      foto: atleta.foto || "",
    }).then(() => {
      console.log(`Atleta ${atleta.atleta} da categoria ${atleta.categoria} enviado para Final`);
    }).catch((error) => {
      console.error("Erro ao salvar no Firebase: ", error);
    });
  }
  console.log('Final enviada com sucesso!');
}



function baixarExcel() {
  // Obtém a tabela HTML
  const tabelaHTML = document.getElementById("tabela-principal"); // ID da sua tabela
  
  // Converte a tabela HTML para uma planilha Excel
  const wb = XLSX.utils.table_to_book(tabelaHTML, { sheet: "Tabela Principal" });
  
  // Cria o arquivo Excel e inicia o download
  XLSX.writeFile(wb, 'tabela-principal.xlsx');
  }

  // Excluir linha selecionada

 function excluirLinhasSelecionadas() {
  const linhas = document.querySelectorAll("#tabela-principal tbody tr"); // Pega todas as linhas da tabela
  let idsParaExcluir = []; // Armazenar os IDs dos dados a serem excluídos
  
  // Itera pelas linhas da tabela
  linhas.forEach(linha => {
    const checkbox = linha.querySelector("input[type='checkbox']"); // Encontra o checkbox de cada linha
    if (checkbox && checkbox.checked) { // Se o checkbox estiver selecionado
      const atleta = linha.querySelector("td:nth-child(2)").textContent; // Pega o nome do atleta (coluna 2)
      const categoria = linha.querySelector("td:nth-child(3)").textContent; // Pega a categoria (coluna 3)
      const id = atleta + "||" + categoria; // Cria o ID único baseado no atleta e na categoria
      
      // Adiciona o ID à lista de IDs para excluir
      idsParaExcluir.push(id);
      
      // Remove a linha da tabela
      linha.remove();
    }
  });

  // Exclui os dados correspondentes no Firebase
  idsParaExcluir.forEach(id => {
    excluirDoFirebase(id);
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

// Salvar em word

function extrairTabelaComoXML() {
    const tabela = document.querySelector("#tabela-secundaria"); // <== use o ID correto aqui
    const linhas = tabela.querySelectorAll("tr");

    let xml = "";

    linhas.forEach(tr => {
        xml += `<w:tr>`;
        tr.querySelectorAll("th, td").forEach(td => {
            const texto = td.innerText.trim();
            xml += `
                <w:tc>
                    <w:tcPr><w:tcW w:w="2400" w:type="dxa"/></w:tcPr>
                    <w:p><w:r><w:t>${texto}</w:t></w:r></w:p>
                </w:tc>`;
        });
        xml += `</w:tr>`;
    });

    return xml;
}



  function gerarDocx() {
    const zip = new JSZip();
    const tabelaXML = extrairTabelaComoXML();

    const ritmo = document.getElementById("nome-ritmo")?.innerText || "Avaliação";

    const docContent = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main"
            xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <w:body>

    <!-- TÍTULO -->
    <w:p>
      <w:pPr>
        <w:jc w:val="center"/>
        <w:rPr>
          <w:rFonts w:ascii="Calibri" w:hAnsi="Calibri"/>
          <w:b/>
          <w:sz w:val="32"/>
        </w:rPr>
      </w:pPr>
      <w:r>
        <w:t>${ritmo}</w:t>
      </w:r>
    </w:p>

    <!-- TABELA -->
    <w:tbl>
      <w:tblPr>
        <w:tblW w:w="5000" w:type="pct"/>
        <w:tblBorders>
          <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>
          <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>
        </w:tblBorders>
        <w:tblLook w:val="04A0"/>
      </w:tblPr>

      ${tabelaXML}

    </w:tbl>

    <w:sectPr>
      <w:pgSz w:w="11900" w:h="16840"/>
      <w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" w:header="720" w:footer="720" w:gutter="0"/>
    </w:sectPr>
  </w:body>
</w:document>`;

    // Word parts
    zip.folder("word").file("document.xml", docContent);

    zip.file("[Content_Types].xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

    zip.folder("_rels").file(".rels", `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

    zip.folder("word").folder("_rels").file("document.xml.rels", `<?xml version="1.0" encoding="UTF-8"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`);

    zip.file("mimetype", "application/vnd.openxmlformats-officedocument.wordprocessingml.document", { compression: "STORE" });

    zip.generateAsync({ type: "blob" }).then(function (content) {
        saveAs(content, "documento-avaliacao.docx");
    });
}



// Baixar PDF 

function gerarPDF() {
    const tabela = document.querySelector("#tabela-secundaria");
    const ritmo = document.getElementById("nome-ritmo")?.innerText || "Avaliação";

    // Criar container temporário para PDF
    const container = document.createElement("div");
    container.style.fontFamily = "Arial, sans-serif";
    container.style.textAlign = "center";

    const titulo = document.createElement("h2");
    titulo.textContent = ritmo;
    titulo.style.color = "#ff8c00";
    titulo.style.marginBottom = "20px";
    container.appendChild(titulo);

    // Clonar tabela e aplicar estilo
    const tabelaClonada = tabela.cloneNode(true);
    tabelaClonada.style.margin = "0 auto";
    tabelaClonada.style.borderCollapse = "collapse";
    tabelaClonada.style.border = "1px solid black";

    tabelaClonada.querySelectorAll("th, td").forEach((td, index) => {
        td.style.border = "1px solid black";
        td.style.padding = "6px";
        td.style.textAlign = "center";

        // Ajustar largura por coluna
        if (td.innerText.trim().toLowerCase() === "atleta" || td.cellIndex === 0) {
            td.style.width = "150px"; // mais larga
        } else if (td.innerText.trim().toLowerCase() === "categoria" || td.cellIndex === 1) {
            td.style.width = "80px"; // mais estreita
        }
    });

    container.appendChild(tabelaClonada);
    document.body.appendChild(container);

    html2pdf().from(container).set({
        margin: 10,
        filename: "documento-avaliacao.pdf",
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    }).save().then(() => {
        document.body.removeChild(container);
    });
}
