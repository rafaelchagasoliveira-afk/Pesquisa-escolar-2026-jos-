const SUPABASE_URL = "https://pkntkbnazykqehilggct.supabase.co/rest/v1/";
const SUPABASE_KEY = "COLE_AQUI_SUA_CHAVE_PUBLICA";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

let adminPassword = "";
let respostas = [];

// Elementos da página
const loginForm = document.getElementById("loginForm");
const loginSection = document.getElementById("loginSection");
const adminPanel = document.getElementById("adminPanel");
const adminPasswordInput = document.getElementById("adminPassword");
const loginError = document.getElementById("loginError");

const logoutButton = document.getElementById("logoutButton");
const closeResearchButton = document.getElementById("closeResearchButton");
const openResearchButton = document.getElementById("openResearchButton");
const refreshButton = document.getElementById("refreshButton");
const exportButton = document.getElementById("exportButton");

const totalResponses = document.getElementById("totalResponses");
const resultsContainer = document.getElementById("resultsContainer");

const adminStatus = document.getElementById("adminStatus");
const statusDescription = document.getElementById("statusDescription");

const adminMessage = document.getElementById("adminMessage");
const adminMessageTitle = document.getElementById("adminMessageTitle");
const adminMessageText = document.getElementById("adminMessageText");
const adminError = document.getElementById("adminError");


// ================================
// LOGIN
// ================================

loginForm.addEventListener("submit", async function(event) {

    event.preventDefault();

    const senha = adminPasswordInput.value.trim();

    loginError.classList.add("hidden");

    if (!senha) {
        loginError.textContent = "Digite a senha.";
        loginError.classList.remove("hidden");
        return;
    }

    try {

        const { data, error } = await supabaseClient.rpc(
            "admin_get_responses",
            {
                admin_password: senha
            }
        );

        if (error) {
            throw error;
        }

        adminPassword = senha;
        respostas = data || [];

        loginSection.classList.add("hidden");
        adminPanel.classList.remove("hidden");

        adminPasswordInput.value = "";

        await carregarPainel();

    } catch (error) {

        console.error(error);

        loginError.textContent =
            "Senha incorreta ou erro ao acessar o painel.";

        loginError.classList.remove("hidden");
    }
});


// ================================
// CARREGAR PAINEL
// ================================

async function carregarPainel() {

    esconderMensagens();

    await verificarStatus();
    await carregarRespostas();
}


// ================================
// VERIFICAR STATUS
// ================================

async function verificarStatus() {

    try {

        const { data, error } =
            await supabaseClient.rpc(
                "get_research_status"
            );

        if (error) {
            throw error;
        }

        atualizarStatus(data === true);

    } catch (error) {

        console.error(
            "Erro ao verificar status:",
            error
        );

        mostrarErro(
            "Não foi possível verificar o status da pesquisa."
        );
    }
}


function atualizarStatus(isOpen) {

    if (isOpen) {

        adminStatus.textContent =
            "● Pesquisa aberta";

        adminStatus.classList.remove("closed");

        statusDescription.textContent =
            "A pesquisa está recebendo novas respostas.";

        closeResearchButton.disabled = false;
        openResearchButton.disabled = true;

    } else {

        adminStatus.textContent =
            "● Pesquisa encerrada";

        adminStatus.classList.add("closed");

        statusDescription.textContent =
            "A pesquisa não está recebendo novas respostas.";

        closeResearchButton.disabled = true;
        openResearchButton.disabled = false;
    }
}


// ================================
// CARREGAR RESPOSTAS
// ================================

async function carregarRespostas() {

    try {

        const { data, error } =
            await supabaseClient.rpc(
                "admin_get_responses",
                {
                    admin_password: adminPassword
                }
            );

        if (error) {
            throw error;
        }

        respostas = data || [];

        totalResponses.textContent =
            respostas.length;

        mostrarResultados();

    } catch (error) {

        console.error(
            "Erro ao carregar respostas:",
            error
        );

        mostrarErro(
            "Não foi possível carregar os resultados."
        );
    }
}


// ================================
// RESULTADOS
// ================================

function mostrarResultados() {

    resultsContainer.innerHTML = "";

    if (respostas.length === 0) {

        resultsContainer.innerHTML = `
            <div class="admin-card">
                <h2>Ainda não há respostas</h2>
                <p>
                    Quando os alunos responderem à pesquisa,
                    os resultados aparecerão aqui.
                </p>
            </div>
        `;

        return;
    }

    const perguntas = [
        {
            titulo: "1. Com qual cor ou raça você se identifica?",
            campo: "q1",
            opcoes: [
                "Branca",
                "Preta",
                "Parda",
                "Amarela",
                "Indígena",
                "Prefiro não responder"
            ]
        },
        {
            titulo: "2. Qual é a sua origem familiar ou cultural?",
            campo: "q2",
            opcoes: [
                "Brasileira",
                "Indígena",
                "Africana",
                "Europeia",
                "Asiática",
                "Outra"
            ]
        },
        {
            titulo: "3. Você participa ou conhece alguma tradição cultural da sua família ou comunidade?",
            campo: "q3",
            opcoes: [
                "Sim",
                "Não"
            ]
        },
        {
            titulo: "4. Você costuma participar de festas ou eventos culturais da sua comunidade?",
            campo: "q4",
            opcoes: [
                "Sempre",
                "Às vezes",
                "Raramente",
                "Nunca"
            ]
        },
        {
            titulo: "5. Você considera importante preservar a cultura e as tradições da sua região?",
            campo: "q5",
            opcoes: [
                "Sim, muito importante",
                "Sim, importante",
                "Pouco importante",
                "Não considero importante"
            ]
        }
    ];

    perguntas.forEach(function(pergunta, indice) {

        const contagens = {};

        pergunta.opcoes.forEach(function(opcao) {
            contagens[opcao] = 0;
        });

        respostas.forEach(function(resposta) {

            const valor = resposta[pergunta.campo];

            if (contagens.hasOwnProperty(valor)) {
                contagens[valor]++;
            }
        });

        const card = document.createElement("div");

        card.className = "admin-card result-card";

        let html = `
            <div class="result-header">
                <span class="tag">
                    PERGUNTA ${indice + 1}
                </span>

                <h2>${pergunta.titulo}</h2>
            </div>
        `;

        pergunta.opcoes.forEach(function(opcao) {

            const quantidade = contagens[opcao];

            const porcentagem =
                respostas.length > 0
                    ? (quantidade / respostas.length) * 100
                    : 0;

            html += `
                <div class="result-item">

                    <div class="result-label">
                        <span>${opcao}</span>

                        <strong>
                            ${quantidade}
                            (${porcentagem.toFixed(1)}%)
                        </strong>
                    </div>

                    <div class="result-bar">
                        <div
                            class="result-bar-fill"
                            style="width: ${porcentagem}%"
                        ></div>
                    </div>

                </div>
            `;
        });

        card.innerHTML = html;

        resultsContainer.appendChild(card);
    });
}


// ================================
// ENCERRAR PESQUISA
// ================================

closeResearchButton.addEventListener(
    "click",
    async function() {

        const confirmar = confirm(
            "Tem certeza que deseja encerrar a pesquisa?"
        );

        if (!confirmar) {
            return;
        }

        try {

            const { error } =
                await supabaseClient.rpc(
                    "admin_set_research_status",
                    {
                        admin_password: adminPassword,
                        new_status: false
                    }
                );

            if (error) {
                throw error;
            }

            atualizarStatus(false);

            mostrarMensagem(
                "Pesquisa encerrada",
                "A coleta de novas respostas foi encerrada."
            );

        } catch (error) {

            console.error(error);

            mostrarErro(
                "Não foi possível encerrar a pesquisa."
            );
        }
    }
);


// ================================
// REABRIR PESQUISA
// ================================

openResearchButton.addEventListener(
    "click",
    async function() {

        try {

            const { error } =
                await supabaseClient.rpc(
                    "admin_set_research_status",
                    {
                        admin_password: adminPassword,
                        new_status: true
                    }
                );

            if (error) {
                throw error;
            }

            atualizarStatus(true);

            mostrarMensagem(
                "Pesquisa reaberta",
                "A pesquisa voltou a receber respostas."
            );

        } catch (error) {

            console.error(error);

            mostrarErro(
                "Não foi possível reabrir a pesquisa."
            );
        }
    }
);


// ================================
// ATUALIZAR RESULTADOS
// ================================

refreshButton.addEventListener(
    "click",
    async function() {

        refreshButton.disabled = true;
        refreshButton.textContent = "Atualizando...";

        await carregarPainel();

        refreshButton.disabled = false;
        refreshButton.textContent =
            "↻ Atualizar resultados";

        mostrarMensagem(
            "Resultados atualizados",
            "Os dados mais recentes foram carregados."
        );
    }
);


// ================================
// EXPORTAR CSV
// ================================

exportButton.addEventListener(
    "click",
    function() {

        if (respostas.length === 0) {

            mostrarErro(
                "Não há respostas para exportar."
            );

            return;
        }

        const cabecalho = [
            "ID",
            "Pergunta 1",
            "Pergunta 2",
            "Pergunta 3",
            "Pergunta 4",
            "Pergunta 5",
            "Data"
        ];

        const linhas = respostas.map(function(resposta) {

            return [
                resposta.id,
                resposta.q1,
                resposta.q2,
                resposta.q3,
                resposta.q4,
                resposta.q5,
                resposta.created_at
            ];
        });

        const csv = [
            cabecalho,
            ...linhas
        ]
            .map(function(linha) {

                return linha
                    .map(function(valor) {

                        return `"${String(valor ?? "")
                            .replace(/"/g, '""')}"`;

                    })
                    .join(",");
            })
            .join("\n");

        const blob = new Blob(
            ["\uFEFF" + csv],
            {
                type: "text/csv;charset=utf-8;"
            }
        );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.href = url;
        link.download =
            "resultados-pesquisa.csv";

        link.click();

        URL.revokeObjectURL(url);
    }
);


// ================================
// SAIR
// ================================

logoutButton.addEventListener(
    "click",
    function() {

        adminPassword = "";
        respostas = [];

        adminPanel.classList.add("hidden");
        loginSection.classList.remove("hidden");

        loginError.classList.add("hidden");

        resultsContainer.innerHTML = "";

        totalResponses.textContent = "0";
    }
);


// ================================
// MENSAGENS
// ================================

function mostrarMensagem(titulo, texto) {

    adminError.classList.add("hidden");

    adminMessageTitle.textContent =
        titulo;

    adminMessageText.textContent =
        texto;

    adminMessage.classList.remove("hidden");

    setTimeout(function() {
        adminMessage.classList.add("hidden");
    }, 5000);
}


function mostrarErro(texto) {

    adminMessage.classList.add("hidden");

    adminError.textContent = texto;

    adminError.classList.remove("hidden");
}


function esconderMensagens() {

    adminMessage.classList.add("hidden");
    adminError.classList.add("hidden");
}
