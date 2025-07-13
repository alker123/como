

// Teclado Virtual

const tecladoContainer = document.getElementById('teclado');
    const campoTexto = document.getElementById('campo-texto');
    const btnTeclado = document.getElementById('btn-teclado');

    let capsAtivo = false;
    let shiftAtivo = false;
    let ctrlAtivo = false;
    let campoSelecionado = campoTexto;
    const teclasAtivas = new Set();

    const linhas = [
      ['F1','F2','F3','F4','F5','F6','F7','F8','F9','F10','F11','F12','F13','Del'],
      ['Esc','!','@','#','$','%','^','&','*','(',')','_','-','+','=','Backspace'],
      ['1','2','3','4','5','6','7','8','9','0','¨',':','←','↑','→','↓'],
      ['Tab','Q','W','E','R','T','Y','U','I','O','P','[',']','{','}','\\'],
      ['Caps','A','S','D','F','G','H','J','K','L','ç',';','.','~','"','Enter'],
      ['Shift','Z','X','C','V','B','N','M',',','.','/','<','>','?','Shift'],
      ['Ctrl','⊞','Alt','Space','AltGr','Ctrl','\\']
    ];

    function criarTeclado() {
      tecladoContainer.innerHTML = '';
      linhas.forEach((linha) => {
        const linhaDiv = document.createElement('div');
        linhaDiv.className = 'linha-teclado';
        linha.forEach(tecla => {
          const btn = document.createElement('button');
          btn.className = 'tecla';
          btn.textContent = tecla;

          if (tecla === 'Space') btn.classList.add('space');
          else if (['Shift','Backspace','Caps','Enter','Tab','Alt','Ctrl','AltGr','Del','←','→','↑','↓','Esc','⊞'].includes(tecla)) {
            btn.classList.add('wide');
          }

          btn.onclick = () => handleTecla(tecla, btn);
          linhaDiv.appendChild(btn);
        });
        tecladoContainer.appendChild(linhaDiv);
      });
    }

    function handleTecla(tecla, botao) {
      if (!campoSelecionado) return;

      teclasAtivas.add(tecla);

      switch (tecla) {
        case 'Backspace':
        case 'Del':
          if (campoSelecionado.selectionStart !== campoSelecionado.selectionEnd) {
            const start = campoSelecionado.selectionStart;
            const end = campoSelecionado.selectionEnd;
            campoSelecionado.value = campoSelecionado.value.slice(0, start) + campoSelecionado.value.slice(end);
            campoSelecionado.setSelectionRange(start, start);
          } else {
            campoSelecionado.value = campoSelecionado.value.slice(0, -1);
          }
          break;

        case 'Space':
          campoSelecionado.value += ' ';
          break;

        case 'Enter':
          campoSelecionado.value += '\n';
          break;

        case 'Tab':
          campoSelecionado.value += '\t';
          break;

        case 'Caps':
          capsAtivo = !capsAtivo;
          botao.classList.toggle('ativa', capsAtivo);
          break;

        case 'Shift':
          shiftAtivo = !shiftAtivo;
          botao.classList.toggle('ativa', shiftAtivo);
          break;

        case 'Ctrl':
          ctrlAtivo = !ctrlAtivo;
          botao.classList.toggle('ativa', ctrlAtivo);
          break;

        case '⊞':
          botao.classList.toggle('ativa');
          const menu = document.getElementById('menu-win');
          if (menu) {
            menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
          }
          break;

        default: {
          let char = tecla;
          if (char.length === 1) {
            if ((capsAtivo && !shiftAtivo) || (!capsAtivo && shiftAtivo)) {
              char = char.toUpperCase();
            } else {
              char = char.toLowerCase();
            }
            campoSelecionado.value += char;
          }

          // Ctrl + C
          if (ctrlAtivo && tecla.toLowerCase() === 'c') {
            navigator.clipboard.writeText(campoSelecionado.value);
          }

          // Ctrl + V
          if (ctrlAtivo && tecla.toLowerCase() === 'v') {
            navigator.clipboard.readText().then(text => {
              campoSelecionado.value += text;
            });
          }

          break;
        }
      }

      // Comando personalizado: Shift + ⊞ + S
      if (teclasAtivas.has('Shift') && teclasAtivas.has('⊞') && tecla.toUpperCase() === 'S') {
        alert('🖼️ Captura de tela simulada!');
        teclasAtivas.clear();
        return;
      }

      // Comando personalizado: Ctrl + ⊞ + K
      if (teclasAtivas.has('⊞') && tecla.toLowerCase() === 'k') {
        alert('📺 Conectando com a TV...');
        teclasAtivas.clear();
        return;
      }

      // Limpa o conjunto se não for tecla de trava
      if (!['Caps', 'Shift', 'Ctrl', '⊞'].includes(tecla)) {
        teclasAtivas.clear();
      }
    }

    btnTeclado.onclick = () => {
      tecladoContainer.style.display = tecladoContainer.style.display === 'none' ? 'block' : 'none';
    };

    document.querySelectorAll('input, textarea').forEach(campo => {
      campo.addEventListener('focus', () => {
        campoSelecionado = campo;
      });
    });

    criarTeclado();

    // calculadora 
  
// Função para limpar o conteúdo do painel e atualizar com a seção correta
function atualizarConteudo(conteudo, htmlConteudo) {
  conteudo.innerHTML = ''; // Limpa conteúdo anterior
  conteudo.innerHTML = htmlConteudo;
}

// Mapeia ações com base na ordem dos <li> do #menu-win
const itensMenu = document.querySelectorAll('#menu-win li');
const conteudo = document.getElementById('conteudo-dinamico');

itensMenu.forEach((item, index) => {
  item.addEventListener('click', () => {
    switch (index) {
      case 0: // 🔎 Pesquisar
        atualizarConteudo(conteudo, '<div class="secao">🔍 Campo de pesquisa aqui</div>');
        break;
      case 1: // 🧮 Calculadora
        mostrarCalculadora();
        break;
      case 2: // 📁 Meus Arquivos
        atualizarConteudo(conteudo, '<div class="secao">📁 Seus arquivos aqui</div>');
        break;
      case 3: // ⚙️ Configurações
        atualizarConteudo(conteudo, '<div class="secao">⚙️ Configurações do sistema</div>');
        break;
      case 4: // ⏻ Desligar
        if (confirm('⚠️ Deseja mesmo desligar o sistema?')) {
          atualizarConteudo(conteudo, '<div class="secao">🛑 Sistema desligado</div>');
        }
     
        break;
    }

    // Oculta o menu após clicar
    document.getElementById('menu-win').style.display = 'none';
  });
});


// Função para alternar a visibilidade do menu
    function alternarMenu() {
      const menu = document.getElementById('menu-win');
      menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
    }



  // Calculadora 

  document.getElementById("calculadora").onclick = function() {
    // Ocultar o menu
    document.getElementById("menu-win").style.display = 'none';

    // Mostrar a calculadora
    document.getElementById("calculadora-container").style.display = 'block';
};

function appendNumber(number) {
    const display = document.getElementById("display");
    display.value += number;
}

function clearDisplay() {
    const display = document.getElementById("display");
    display.value = '';
}

function calculateResult() {
    const display = document.getElementById("display");
    try {
        display.value = eval(display.value); // Calcula a expressão matemática
    } catch (e) {
        display.value = 'Error';
    }
}

// Função para fechar a calculadora
function closeCalculator() {
    document.getElementById("calculadora-container").style.display = 'none';
}
 




// Inicializar
atualizarListas();
