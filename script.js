/* =========================================
   CONFIGURAÇÕES GERAIS
========================================= */

const TAMANHO_CELULA = 50;          // tamanho de cada célula em px
const METADE_CELULA = TAMANHO_CELULA / 2;
const ESPESSURA_FIO = 4;            // espessura do fio em px
const LINHAS_GRID = 100;
const COLUNAS_GRID = 100;

/* =========================================
   ELEMENTOS PRINCIPAIS
========================================= */

const grid = document.getElementById("grid");
const main = document.getElementById("main");
const btnCircuito = document.getElementById("btnCircuito");

/* =========================================
   MAPA DE FIOS (id do elemento -> cor)
   Substitui os 7 listeners repetidos por um só
========================================= */

const CORES_FIOS = {
    "fio-vermelho": "red",
    "fio-preto": "black",
    "fio-branco": "white",
    "fio-azul": "skyblue",
    "fio-terra": "green",
    "fio-amarelo": "yellow",
    "fio-cinza": "gray",
};

/* =========================================
   ESTADO DO MODO FIO
========================================= */

let modoFio = false;
let corAtual = "red";
let pontoAnterior = null;
let tracoAtual = null;
let simboloAtual = null;
let marcadorInicio = null; // destaque visual do ponto inicial

/* =========================================
   ESTADO DO DESAFIO
   (declarado antes do uso para evitar erros de ordem)
========================================= */

let desafioAtivo = false;
let conexoesOK = [false, false, false];
let missaoAtual = 0;

const tracos = [];             // traços desenhados pelo aluno
const elementosCircuito = [];  // fios/componentes criados (para limpar depois)

/* =========================================
   FUNÇÕES AUXILIARES
========================================= */

// Converte coordenada do grid para pixel (centro da célula)
function paraPixel(indice) {
    return indice * TAMANHO_CELULA + METADE_CELULA;
}

// Compara um ponto com uma lista de pontos {linha, coluna}
function pontoEm(linha, coluna, pontos) {
    return pontos.some((p) => p.linha === linha && p.coluna === coluna);
}

// Verifica se o ponto está sobre um barramento horizontal
function pontoNoBarramento(linha, coluna, barramento) {
    return linha === barramento.linha &&
        coluna >= barramento.colunaInicio &&
        coluna <= barramento.colunaFim;
}

// Remove o marcador visual do ponto inicial
function removerMarcador() {
    if (marcadorInicio) {
        marcadorInicio.remove();
        marcadorInicio = null;
    }
}

// Marca visualmente o ponto inicial do fio
function marcarInicio(linha, coluna) {
    removerMarcador();
    marcadorInicio = document.createElement("div");
    marcadorInicio.classList.add("start-point");
    marcadorInicio.style.left = (paraPixel(coluna) - 6) + "px";
    marcadorInicio.style.top = (paraPixel(linha) - 6) + "px";
    marcadorInicio.style.background = corAtual;
    main.appendChild(marcadorInicio);
}

/* =========================================
   ATIVAR / DESATIVAR MODO FIO
========================================= */

function ativarFio(cor, elemento) {
    modoFio = true;
    simboloAtual = null;
    corAtual = cor;
    pontoAnterior = null;
    tracoAtual = null;
    removerMarcador();
    main.style.cursor = "crosshair";

    // Destaca apenas o fio selecionado
    document.querySelectorAll(".draggable-wire").forEach((fio) => fio.classList.remove("selected"));
    if (elemento) elemento.classList.add("selected");
}

function desativarFio() {
    modoFio = false;
    pontoAnterior = null;
    tracoAtual = null;
    removerMarcador();
    main.style.cursor = "default";
    document.querySelectorAll(".draggable-wire").forEach((fio) => fio.classList.remove("selected"));
}

// Registra um único listener por fio a partir do mapa
Object.entries(CORES_FIOS).forEach(([id, cor]) => {
    const fio = document.getElementById(id);
    if (!fio) return;
    const botaoFio = fio.closest(".wire-button");
    if (!botaoFio) return;
    botaoFio.addEventListener("click", () => {
        // Clicar de novo no mesmo fio desliga o modo
        if (modoFio && corAtual === cor) {
            desativarFio();
        } else {
            ativarFio(cor, fio);
        }
    });
});

const componentDialog = document.getElementById("component-dialog");
document.querySelectorAll(".component-preview").forEach((button) => {
    button.addEventListener("click", () => {
        const image = document.getElementById("component-dialog-image");
        image.src = button.dataset.image;
        image.alt = button.dataset.title;
        document.getElementById("component-dialog-title").textContent = button.dataset.title;
        document.getElementById("component-dialog-description").textContent = button.dataset.description;
        componentDialog.showModal();
    });
});

document.getElementById("component-dismiss").addEventListener("click", () => componentDialog.close());
componentDialog.addEventListener("click", (event) => {
    if (event.target === componentDialog) componentDialog.close();
});

const tutorialDialog = document.getElementById("tutorial-dialog");
const tutorialVideo = document.getElementById("tutorial-video");
const tutorialStatus = document.getElementById("tutorial-status");

document.getElementById("btnTutorial").addEventListener("click", () => {
    tutorialDialog.showModal();
    tutorialVideo.load();
});

tutorialVideo.addEventListener("loadedmetadata", () => {
    tutorialStatus.hidden = true;
});

tutorialVideo.addEventListener("error", () => {
    tutorialStatus.textContent = "Vídeo indisponível. Coloque o arquivo video_instrucao.mp4 na pasta do projeto.";
    tutorialStatus.hidden = false;
});

document.getElementById("tutorial-dismiss").addEventListener("click", () => tutorialDialog.close());
tutorialDialog.addEventListener("click", (event) => {
    if (event.target === tutorialDialog) tutorialDialog.close();
});
tutorialDialog.addEventListener("close", () => tutorialVideo.pause());

// ESC termina o fio atual / sai do modo fio
document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (pontoAnterior) {
        pontoAnterior = null;
        tracoAtual = null;
        removerMarcador();
    } else {
        desativarFio();
    }
});

// Botão direito finaliza o traço atual sem sair do modo fio
main.addEventListener("contextmenu", (event) => {
    if (!modoFio) return;
    event.preventDefault();
    pontoAnterior = null;
    tracoAtual = null;
    removerMarcador();
});

/* =========================================
   CLIQUE NA CÉLULA
========================================= */

function aoClicarCelula(linhaAtual, colunaAtual) {
    if (!modoFio) return;

    /* PRIMEIRO PONTO */
    if (pontoAnterior === null) {
        pontoAnterior = { linha: linhaAtual, coluna: colunaAtual };
        tracoAtual = {
            cor: corAtual,
            linha1: linhaAtual, coluna1: colunaAtual,
            linha2: linhaAtual, coluna2: colunaAtual,
        };
        marcarInicio(linhaAtual, colunaAtual);
        return;
    }

    /* MESMO PONTO: ignora */
    if (pontoAnterior.linha === linhaAtual && pontoAnterior.coluna === colunaAtual) return;

    /* VALIDA DIREÇÃO */
    const mesmaLinha = pontoAnterior.linha === linhaAtual;
    const mesmaColuna = pontoAnterior.coluna === colunaAtual;

    if (!mesmaLinha && !mesmaColuna) {
        alert("Somente linhas horizontais ou verticais.");
        return;
    }

    desenharLinha(pontoAnterior.linha, pontoAnterior.coluna, linhaAtual, colunaAtual, corAtual);

    // Guarda cada segmento real; uma curva não pode virar uma ligação diagonal fictícia.
    tracos.push({
        cor: corAtual,
        linha1: pontoAnterior.linha, coluna1: pontoAnterior.coluna,
        linha2: linhaAtual, coluna2: colunaAtual,
    });

    pontoAnterior = { linha: linhaAtual, coluna: colunaAtual };
    marcarInicio(linhaAtual, colunaAtual);

    verificarDesafio();
}

/* =========================================
   CRIAÇÃO DO GRID
   Usa DocumentFragment (1 inserção no DOM) e
   delegação de eventos (3 listeners no total em vez de 30.000)
========================================= */

function criarGrid() {
    const fragmento = document.createDocumentFragment();

    for (let linha = 0; linha < LINHAS_GRID; linha++) {
        for (let coluna = 0; coluna < COLUNAS_GRID; coluna++) {
            const cell = document.createElement("div");
            cell.classList.add("cell");
            cell.dataset.linha = linha;
            cell.dataset.coluna = coluna;
            fragmento.appendChild(cell);
        }
    }

    grid.appendChild(fragmento);

    grid.addEventListener("click", (event) => {
        const cell = event.target.closest(".cell");
        if (!cell) return;
        aoClicarCelula(Number(cell.dataset.linha), Number(cell.dataset.coluna));
    });

    grid.addEventListener("dragover", (event) => {
        const cell = event.target.closest(".cell");
        if (!cell) return;
        event.preventDefault();
        cell.classList.add("drop-hover");
    });

    grid.addEventListener("dragleave", (event) => {
        const cell = event.target.closest(".cell");
        if (cell) cell.classList.remove("drop-hover");
    });

    grid.addEventListener("drop", (event) => {
        const cell = event.target.closest(".cell");
        if (cell) cell.classList.remove("drop-hover");
    });
}

criarGrid();

/* =========================================
   FUNÇÃO DESENHAR LINHA
========================================= */

function desenharLinha(linha1, coluna1, linha2, coluna2, cor) {
    const mesmaLinha = linha1 === linha2;
    const mesmaColuna = coluna1 === coluna2;

    if (!mesmaLinha && !mesmaColuna) return null;

    const x1 = paraPixel(coluna1);
    const y1 = paraPixel(linha1);
    const x2 = paraPixel(coluna2);
    const y2 = paraPixel(linha2);
    const meia = ESPESSURA_FIO / 2;

    const wire = document.createElement("div");
    wire.classList.add("wire-line");
    wire.style.background = cor;

    if (mesmaLinha) {
        // Horizontal (soma a espessura para as pontas se encontrarem nas curvas)
        wire.style.left = (Math.min(x1, x2) - meia) + "px";
        wire.style.top = (y1 - meia) + "px";
        wire.style.width = (Math.abs(x2 - x1) + ESPESSURA_FIO) + "px";
        wire.style.height = ESPESSURA_FIO + "px";
    } else {
        // Vertical
        wire.style.left = (x1 - meia) + "px";
        wire.style.top = (Math.min(y1, y2) - meia) + "px";
        wire.style.width = ESPESSURA_FIO + "px";
        wire.style.height = (Math.abs(y2 - y1) + ESPESSURA_FIO) + "px";
    }

    main.appendChild(wire);
    elementosCircuito.push(wire);
    return wire;
}

/* =========================================
   FUNÇÃO INSERIR COMPONENTE
========================================= */

function inserirComponente(imagem, linha, coluna, classe) {
    const elemento = document.createElement("img");
    elemento.src = imagem;
    elemento.alt = imagem.replace(".png", "").replace(/_/g, " ");
    elemento.classList.add(classe);
    elemento.style.left = (coluna * TAMANHO_CELULA) + "px";
    elemento.style.top = (linha * TAMANHO_CELULA) + "px";
    main.appendChild(elemento);
    elementosCircuito.push(elemento);
    return elemento;
}

/* =========================================
   LIMPAR CIRCUITO
   Evita duplicar fios/componentes ao clicar no botão de novo
========================================= */

function limparCircuito() {
    elementosCircuito.forEach((el) => el.remove());
    elementosCircuito.length = 0;
    tracos.length = 0;
    pontoAnterior = null;
    tracoAtual = null;
    removerMarcador();
    desativarFio();
}

/* =========================================
   DEFINIÇÃO DO DESAFIO (fácil de alterar)
========================================= */

const MISSOES = [
    {
        titulo: "Interruptor paralelo — lado esquerdo",
        componente: "interruptor_paralelo.png",
        descricao: "Monte o circuito usando o interruptor da esquerda e o fio amarelo no retorno.",
        cores: ["red", "skyblue", "yellow"],
        faseAlvo: "esquerda", retorno: "yellow", retornoAlvo: "esquerda",
        objetivos: [
            "Ligue o barramento superior ao interruptor da esquerda com o fio vermelho.",
            "Ligue o barramento inferior à lâmpada com o fio azul.",
            "Ligue a lâmpada ao interruptor da esquerda com o fio amarelo."
        ]
    },
    {
        titulo: "Interruptor paralelo — lado direito",
        componente: "interruptor_paralelo.png",
        descricao: "Agora leve a fase ao interruptor da direita e faça o retorno branco até ele.",
        cores: ["red", "skyblue", "white"],
        faseAlvo: "direita", retorno: "white", retornoAlvo: "direita",
        objetivos: [
            "Ligue o barramento superior ao interruptor da direita com o fio vermelho.",
            "Ligue o barramento inferior à lâmpada com o fio azul.",
            "Ligue a lâmpada ao interruptor da direita com o fio branco."
        ]
    },
    {
        titulo: "Retorno amarelo cruzado",
        componente: "interruptor_simples.png",
        descricao: "Ligue a fase ao interruptor esquerdo, mas leve o retorno amarelo até o interruptor direito.",
        cores: ["red", "skyblue", "yellow"],
        faseAlvo: "esquerda", retorno: "yellow", retornoAlvo: "direita",
        objetivos: [
            "Leve a fase vermelha até o interruptor da esquerda.",
            "Conecte o neutro azul do barramento inferior à lâmpada.",
            "Faça o retorno amarelo da lâmpada até o interruptor da direita."
        ]
    },
    {
        titulo: "Retorno branco cruzado",
        componente: "interruptor_simples.png",
        descricao: "Use o interruptor direito para a fase e o fio branco para retornar à esquerda.",
        cores: ["red", "skyblue", "white"],
        faseAlvo: "direita", retorno: "white", retornoAlvo: "esquerda",
        objetivos: [
            "Ligue a fase vermelha ao interruptor da direita.",
            "Ligue o neutro azul à lâmpada.",
            "Conecte a lâmpada ao interruptor da esquerda usando o fio branco."
        ]
    },
    {
        titulo: "Retorno cinza",
        componente: "interruptor_paralelo.png",
        descricao: "Monte o circuito com fase no interruptor esquerdo e retorno cinza no direito.",
        cores: ["red", "skyblue", "gray"],
        faseAlvo: "esquerda", retorno: "gray", retornoAlvo: "direita",
        objetivos: [
            "Leve a fase vermelha ao interruptor da esquerda.",
            "Ligue o neutro azul à lâmpada.",
            "Use o fio cinza para ligar a lâmpada ao interruptor da direita."
        ]
    },
    {
        titulo: "Desafio final — circuito completo",
        componente: "interruptor_paralelo.png",
        descricao: "Desafio final: fase no interruptor direito, neutro na lâmpada e retorno verde no interruptor esquerdo.",
        cores: ["red", "skyblue", "green"],
        faseAlvo: "direita", retorno: "green", retornoAlvo: "esquerda",
        objetivos: [
            "Conecte a fase vermelha ao interruptor da direita.",
            "Conecte o neutro azul à lâmpada.",
            "Conclua o circuito com o fio terra verde até o interruptor da esquerda."
        ]
    }
];

const DESAFIO = {
    fase: { linha: 2, colunaInicio: 2, colunaFim: 20 },
    neutro: { linha: 4, colunaInicio: 2, colunaFim: 20 },
    interruptores: [{ linha: 9, coluna: 6 }, { linha: 9, coluna: 14 }],
    lampada: [{ linha: 6, coluna: 12 }]
};

/* =========================================
   EVENTO BOTÃO
========================================= */

function prepararMissao() {
    const missao = MISSOES[missaoAtual];
    limparCircuito();
    desenharLinha(2, 2, 2, 20, "red");
    desenharLinha(4, 2, 4, 20, "skyblue");
    inserirComponente(missao.componente, 8, 6, "placed-image");
    inserirComponente(missao.componente, 8, 14, "placed-image");
    inserirComponente("lampada.png", 6, 12, "placed-symbol");

    desafioAtivo = true;
    conexoesOK = [false, false, false];
    document.querySelector(".mission-name").textContent = `Missão ${missaoAtual + 1}: ${missao.titulo}`;
    document.getElementById("mission-description").textContent = missao.descricao;
    document.querySelectorAll(".mission-step h3").forEach((el, i) => {
        el.textContent = missao.objetivos[i];
    });
    document.querySelectorAll(".mission-step p").forEach((el, i) => {
        el.textContent = "";
    });
    document.getElementById("mission-notice").querySelector("#notice-title").textContent = "Missão concluída!";
    document.getElementById("notice-description").textContent =
        missaoAtual === MISSOES.length - 1
            ? "Parabéns! Você concluiu todas as 6 missões."
            : `Parabéns! Você concluiu a missão ${missaoAtual + 1} de ${MISSOES.length}.`;
    const btnContinuar = document.getElementById("mission-dismiss");
    btnContinuar.textContent = missaoAtual === MISSOES.length - 1 ? "Finalizar" : "Prosseguir";
    btnContinuar.dataset.final = missaoAtual === MISSOES.length - 1 ? "true" : "false";
    fecharAvisoMissao();
    atualizarMissoes();
    btnCircuito.textContent = "Reiniciar missão";
}

btnCircuito.addEventListener("click", prepararMissao);

/* =========================================
   VERIFICA DESAFIO
========================================= */

// Verifica se um traço liga A -> B em qualquer direção
function conecta(traco, testeA, testeB) {
    const p1 = [traco.linha1, traco.coluna1];
    const p2 = [traco.linha2, traco.coluna2];
    return (testeA(...p1) && testeB(...p2)) || (testeA(...p2) && testeB(...p1));
}

// Detecta conexões entre segmentos reais da mesma rede, inclusive fios com curvas.
function pontoNoSegmento(linha, coluna, segmento) {
    return (segmento.linha1 === segmento.linha2 && linha === segmento.linha1 &&
        coluna >= Math.min(segmento.coluna1, segmento.coluna2) &&
        coluna <= Math.max(segmento.coluna1, segmento.coluna2)) ||
        (segmento.coluna1 === segmento.coluna2 && coluna === segmento.coluna1 &&
        linha >= Math.min(segmento.linha1, segmento.linha2) &&
        linha <= Math.max(segmento.linha1, segmento.linha2));
}

function segmentosTocam(a, b) {
    if (pontoNoSegmento(a.linha1, a.coluna1, b) || pontoNoSegmento(a.linha2, a.coluna2, b) ||
        pontoNoSegmento(b.linha1, b.coluna1, a) || pontoNoSegmento(b.linha2, b.coluna2, a)) return true;
    const horizontal = a.linha1 === a.linha2 ? a : b;
    const vertical = a.linha1 === a.linha2 ? b : a;
    return horizontal.linha1 === horizontal.linha2 && vertical.coluna1 === vertical.coluna2 &&
        pontoNoSegmento(horizontal.linha1, vertical.coluna1, horizontal) &&
        pontoNoSegmento(horizontal.linha1, vertical.coluna1, vertical);
}

// Considera o segmento inteiro, não apenas suas extremidades. Assim, um fio
// também conecta quando atravessa/toca um barramento ou o ponto de um componente.
function segmentoTocaPonto(segmento, testePonto) {
    if (testePonto(segmento.linha1, segmento.coluna1) ||
        testePonto(segmento.linha2, segmento.coluna2)) return true;

    // Barramentos são horizontais; componentes são pontos específicos da grade.
    if (segmento.linha1 === segmento.linha2) {
        for (let coluna = Math.min(segmento.coluna1, segmento.coluna2);
            coluna <= Math.max(segmento.coluna1, segmento.coluna2); coluna++) {
            if (testePonto(segmento.linha1, coluna)) return true;
        }
    } else if (segmento.coluna1 === segmento.coluna2) {
        for (let linha = Math.min(segmento.linha1, segmento.linha2);
            linha <= Math.max(segmento.linha1, segmento.linha2); linha++) {
            if (testePonto(linha, segmento.coluna1)) return true;
        }
    }
    return false;
}

function redeConecta(segmentos, testeA, testeB) {
    if (!segmentos.length) return false;

    const visitados = new Set();
    const fila = [];
    segmentos.forEach((segmento, indice) => {
        if (segmentoTocaPonto(segmento, testeA)) {
            visitados.add(indice);
            fila.push(indice);
        }
    });

    for (let cursor = 0; cursor < fila.length; cursor++) {
        const atual = segmentos[fila[cursor]];
        if (segmentoTocaPonto(atual, testeB)) return true;

        segmentos.forEach((segmento, indice) => {
            if (!visitados.has(indice) && segmentosTocam(atual, segmento)) {
                visitados.add(indice);
                fila.push(indice);
            }
        });
    }
    return false;
}

function atualizarMissoes() {
    const total = conexoesOK.filter(Boolean).length;
    document.querySelectorAll(".mission-step").forEach((item, indice) => {
        const concluida = Boolean(conexoesOK[indice]);
        item.classList.toggle("completed", concluida);
        item.querySelector(".mission-check").textContent = concluida ? "✓" : String(indice + 1);
        item.querySelector(".mission-state").textContent = concluida ? "Concluído" : "Pendente";
    });
    document.getElementById("mission-progress").value = total;
    document.getElementById("mission-count").textContent = `${total} de 3 objetivos`;
    document.getElementById("mission-status").textContent = total === 3 ? "Missão concluída" :
        desafioAtivo ? "Em andamento" : "Aguardando início";
}

let focoAntesDoAviso = null;

function fecharAvisoMissao() {
    const aviso = document.getElementById("mission-notice");
    if (aviso.open) aviso.close();
    if (focoAntesDoAviso) focoAntesDoAviso.focus();
}

document.getElementById("mission-dismiss").addEventListener("click", () => {
    const botao = document.getElementById("mission-dismiss");
    fecharAvisoMissao();
    if (botao.dataset.final === "true") {
        document.getElementById("mission-status").textContent = "Todas as missões concluídas!";
        btnCircuito.textContent = "Jogar novamente";
        missaoAtual = 0;
        botao.dataset.final = "false";
        return;
    }
    missaoAtual = Math.min(missaoAtual + 1, MISSOES.length - 1);
    prepararMissao();
});
document.getElementById("mission-notice").addEventListener("cancel", (event) => {
    event.preventDefault();
    fecharAvisoMissao();
});

function verificarDesafio() {
    if (!desafioAtivo) return;

    const naFase = (l, c) => pontoNoBarramento(l, c, DESAFIO.fase);
    const noNeutro = (l, c) => pontoNoBarramento(l, c, DESAFIO.neutro);
    // O desenho do interruptor ocupa três células verticais (linhas 8 a 10).
    // Aceita a ligação em qualquer célula ocupada pelo componente, não só na linha 9.
    const noInterruptor = (l, c) => DESAFIO.interruptores.some((p) =>
        c === p.coluna && l >= p.linha - 1 && l <= p.linha + 1
    );
    const naLampada = (l, c) => pontoEm(l, c, DESAFIO.lampada);
    const missao = MISSOES[missaoAtual];

    const alvoFase = missao.faseAlvo === "direita" ? DESAFIO.interruptores[1] : DESAFIO.interruptores[0];
    const alvoRetorno = missao.retornoAlvo === "direita" ? DESAFIO.interruptores[1] : DESAFIO.interruptores[0];
    const noAlvoFase = (l, c) => c === alvoFase.coluna && l >= alvoFase.linha - 1 && l <= alvoFase.linha + 1;
    const noAlvoRetorno = (l, c) => c === alvoRetorno.coluna && l >= alvoRetorno.linha - 1 && l <= alvoRetorno.linha + 1;

    conexoesOK[0] = redeConecta(tracos.filter((t) => t.cor === missao.cores[0]), naFase, noAlvoFase);
    conexoesOK[1] = redeConecta(tracos.filter((t) => t.cor === missao.cores[1]), noNeutro, naLampada);
    conexoesOK[2] = redeConecta(tracos.filter((t) => t.cor === missao.retorno), naLampada, noAlvoRetorno);

    atualizarMissoes();
    if (conexoesOK.every(Boolean)) {
        desafioAtivo = false;
        desativarFio();
        focoAntesDoAviso = document.activeElement;
        document.getElementById("mission-notice").showModal();
    }
}
atualizarMissoes();
