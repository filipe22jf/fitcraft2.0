document.addEventListener("DOMContentLoaded", function() {
    try {
        const btnSalvarAluno = document.getElementById("btn-salvar-aluno");
        const nomeAlunoCadastro = document.getElementById("nome-aluno-cadastro");
        const dataCadastro = document.getElementById("data-cadastro");
        const valorConsultoria = document.getElementById("valor-consultoria");
        const listaAlunosCadastrados = document.getElementById("lista-alunos-cadastrados");

        let alunos = JSON.parse(localStorage.getItem("alunosFitCraft")) || [];

        function renderizarAlunos() {
            listaAlunosCadastrados.innerHTML = "";
            if (alunos.length === 0) {
                listaAlunosCadastrados.innerHTML = 
                    `<li class="empty-state-list">
                        Nenhum aluno cadastrado ainda.
                    </li>`;
                return;
            }
            alunos.forEach((aluno, index) => {
                const li = document.createElement("li");
                li.className = "client-item-list";
                li.innerHTML = `
                    <span>${aluno.nome}</span>
                    <span>Início: ${aluno.dataCadastro}</span>
                    <span>Valor: R$ ${parseFloat(aluno.valorConsultoria).toFixed(2).replace(".", ",")}</span>
                    <button class="remove-client-btn" data-index="${index}">Remover</button>
                `;
                listaAlunosCadastrados.appendChild(li);
            });
            adicionarEventosRemover();
        }

        function adicionarEventosRemover() {
            document.querySelectorAll(".remove-client-btn").forEach(button => {
                button.onclick = function() {
                    const index = this.dataset.index;
                    alunos.splice(index, 1);
                    localStorage.setItem("alunosFitCraft", JSON.stringify(alunos));
                    renderizarAlunos();
                };
            });
        }

        btnSalvarAluno.onclick = function() {
            const nome = nomeAlunoCadastro.value.trim();
            const data = dataCadastro.value;
            const valor = valorConsultoria.value;

            if (nome && data && valor) {
                alunos.push({ 
                    nome,
                    dataCadastro: new Date(data + 'T12:00:00').toLocaleDateString('pt-BR'),
                    valorConsultoria: parseFloat(valor)
                });
                localStorage.setItem("alunosFitCraft", JSON.stringify(alunos));
                nomeAlunoCadastro.value = "";
                dataCadastro.value = "";
                valorConsultoria.value = "";
                renderizarAlunos();
                showToast("Aluno cadastrado com sucesso!", "success");
            } else {
                showToast("Por favor, preencha todos os campos para cadastrar o aluno.", "error");
            }
        };

        renderizarAlunos();
    } catch (error) {
        console.error("Erro no script de cadastro de alunos:", error);
        alert("Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.");
    }
});

// Função para mostrar toast de notificação
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const toastMessage = toast.querySelector('.toast-message');
    const toastIcon = toast.querySelector('.toast-icon');
    
    toastMessage.textContent = message;
    
    if (type === 'success') {
        toastIcon.textContent = '✓';
        toast.style.background = 'linear-gradient(135deg, #4CAF50, #45a049)';
    } else if (type === 'error') {
        toastIcon.textContent = '✗';
        toast.style.background = 'linear-gradient(135deg, #f44336, #d32f2f)';
    }
    
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

