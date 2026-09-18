const SUPABASE_URL = "COLE_AQUI_SUA_URL";

const SUPABASE_KEY = "COLE_AQUI_SUA_CHAVE_PUBLICA";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);

const form = document.getElementById("surveyForm");
const submitButton = document.getElementById("submitButton");
const confirmation = document.getElementById("confirmation");
const errorMessage = document.getElementById("errorMessage");
const surveyContainer = document.getElementById("surveyContainer");
const closedMessage = document.getElementById("closedMessage");
const researchStatus = document.getElementById("researchStatus");

async function checkResearchStatus() {
    try {
        const { data, error } = await supabaseClient.rpc(
            "get_research_status"
        );

        if (error) {
            console.error("Erro ao verificar pesquisa:", error);
            return;
        }

        updateResearchInterface(data === true);

    } catch (error) {
        console.error(error);
    }
}

function updateResearchInterface(isOpen) {

    if (isOpen) {

        surveyContainer.classList.remove("hidden");
        closedMessage.classList.add("hidden");

        researchStatus.textContent = "● Pesquisa aberta";

        researchStatus.classList.remove("closed");

    } else {

        surveyContainer.classList.add("hidden");
        closedMessage.classList.remove("hidden");

        researchStatus.textContent = "● Pesquisa encerrada";

        researchStatus.classList.add("closed");
    }
}

form.addEventListener("submit", async function(event) {

    event.preventDefault();

    submitButton.disabled = true;
    submitButton.textContent = "Enviando...";

    confirmation.classList.add("hidden");
    errorMessage.classList.add("hidden");

    try {

        const formData = new FormData(form);

        const resposta = {
            q1: formData.get("q1"),
            q2: formData.get("q2"),
            q3: formData.get("q3"),
            q4: formData.get("q4"),
            q5: formData.get("q5")
        };

        if (
            !resposta.q1 ||
            !resposta.q2 ||
            !resposta.q3 ||
            !resposta.q4 ||
            !resposta.q5
        ) {
            throw new Error(
                "Responda todas as perguntas."
            );
        }

        const { data: isOpen, error: statusError } =
            await supabaseClient.rpc(
                "get_research_status"
            );

        if (statusError) {
            throw statusError;
        }

        if (isOpen !== true) {

            updateResearchInterface(false);

            throw new Error(
                "A pesquisa foi encerrada."
            );
        }

        const { error } = await supabaseClient
            .from("respostas")
            .insert({
                q1: resposta.q1,
                q2: resposta.q2,
                q3: resposta.q3,
                q4: resposta.q4,
                q5: resposta.q5
            });

        if (error) {
            console.error("Erro Supabase:", error);

            throw new Error(
                "Não foi possível enviar sua resposta."
            );
        }

        form.reset();

        confirmation.classList.remove("hidden");

        confirmation.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });

        setTimeout(function() {
            confirmation.classList.add("hidden");
        }, 6000);

    } catch (error) {

        console.error("Erro:", error);

        errorMessage.textContent =
            error.message ||
            "Ocorreu um erro ao enviar sua resposta.";

        errorMessage.classList.remove("hidden");

    } finally {

        submitButton.disabled = false;
        submitButton.textContent = "Enviar minha resposta";
    }
});

checkResearchStatus();
