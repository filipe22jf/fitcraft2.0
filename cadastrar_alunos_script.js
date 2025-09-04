document.addEventListener('DOMContentLoaded', () => {
    const btnSalvarAluno = document.getElementById('btn-salvar-aluno');
    const listaAlunosCadastrados = document.getElementById('lista-alunos-cadastrados');
    const nomeAlunoInput = document.getElementById('nome-aluno-cadastro');
    const dataCadastroInput = document.getElementById('data-cadastro');
    const valorConsultoriaInput = document.getElementById('valor-consultoria');

    // Modal da credencial
    const modal = document.getElementById('credential-modal');
    const spanClose = document.getElementsByClassName('close-button')[0];
    const credencialSpan = document.getElementById('aluno-credencial');
    const copyBtn = document.getElementById('copy-credential-btn');

    // --- FUNÇÕES ---

    function gerarCredencial() {
        const letras = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const numeros = '0123456789';
        let parteLetras = '';
        for (let i = 0; i < 3; i++) {
            parteLetras += letras.charAt(Math.floor(Math.random() * letras.length));
        }
        let parteNumeros = '';
        for (let i = 0; i < 3; i++) {
            parteNumeros += numeros.charAt(Math.floor(Math.random() * numeros.length));
        }
        return `${parteLetras}-${parteNumeros}`;
    }

    // Função para exibir toast messages
    function showToast(message, isSuccess = true) {
        const toast = document.getElementById('toast');
        const toastMessage = toast.querySelector('.toast-message');
        const toastIcon = toast.querySelector('.toast-icon');

        toastMessage.textContent = message;
        if (isSuccess) {
            toast.classList.remove('error');
            toast.classList.add('success');
            toastIcon.textContent = '✓';
        } else {
            toast.classList.remove('success');
            toast.classList.add('error');
            toastIcon.textContent = '✗';
        }
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    /**
     * Carrega alunos do Local Storage e os renderiza na lista.
     */
    async function renderizarAlunos() {
        const { data: alunos, error } = await supabase
            .from(\'clients\')
            .select(\'id, nome, credencial\');

        if (error) {
            console.error(\'Erro ao carregar alunos:\', error.message);
            showToast(\'Erro ao carregar alunos.\', false);
            return;
        }

        listaAlunosCadastrados.innerHTML = \'\'; // Limpa a lista antes de renderizar

        if (alunos.length === 0) {
            listaAlunosCadastrados.innerHTML = \'<li>Nenhum aluno cadastrado ainda.</li>\';
            return;
        }

        alunos.forEach(aluno => {
            const li = document.createElement(\'li\');
            li.innerHTML = `
                <span>${aluno.nome}</span>
                <small>Credencial: ${aluno.credencial}</small>
            `;
            li.dataset.alunoId = aluno.id;
            listaAlunosCadastrados.appendChild(li);
        });
    }

    /**
     * Limpa os campos do formulário de cadastro.
     */
    function limparFormulario() {
        nomeAlunoInput.value = '';
        dataCadastroInput.value = '';
        valorConsultoriaInput.value = '';
    }

    /**
     * Mostra o modal com a credencial gerada.
     * @param {string} credencial - A credencial a ser exibida.
     */
    function mostrarModalCredencial(credencial) {
        credencialSpan.textContent = credencial;
        modal.style.display = 'block';
    }

    // --- EVENT LISTENERS ---
    btnSalvarAluno.addEventListener(\'click\', async () => {
        const nome = nomeAlunoInput.value.trim();
        const dataInicio = dataCadastroInput.value;
        const valor = valorConsultoriaInput.value;

        if (!nome) {
            showToast(\'Por favor, preencha o nome do aluno.\', false);
            return;
        }

        let novaCredencial;
        let isUnique = false;
        while (!isUnique) {
            novaCredencial = gerarCredencial();
            const { data, error } = await supabase
                .from(\'clients\')
                .select(\'credencial\')
                .eq(\'credencial\', novaCredencial);

            if (error) {
                console.error(\'Erro ao verificar credencial:\', error.message);
                showToast(\'Erro ao verificar credencial.\', false);
                return;
            }
            if (data.length === 0) {
                isUnique = true;
            }
        }

        const { data, error } = await supabase
            .from(\'clients\')
            .insert([
                { nome: nome, data_inicio: dataInicio, valor_consultoria: valor, credencial: novaCredencial }
            ]);

        if (error) {
            console.error(\'Erro ao salvar aluno:\', error.message);
            showToast(\'Erro ao salvar aluno.\', false);
            return;
        }

        showToast(\'Aluno salvo com sucesso!\', true);
        limparFormulario();
        renderizarAlunos();
        mostrarModalCredencial(novaCredencial);
    });

    // Fecha o modal ao clicar no 'X'
    spanClose.onclick = () => {
        modal.style.display = 'none';
    }

    // Fecha o modal ao clicar fora dele
    window.onclick = (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    }

    // Copia a credencial para a área de transferência
    copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(credencialSpan.textContent).then(() => {
            copyBtn.textContent = 'Copiado!';
            setTimeout(() => {
                copyBtn.textContent = 'Copiar';
            }, 2000);
        }).catch(err => {
            console.error('Erro ao copiar credencial: ', err);
            alert('Não foi possível copiar a credencial.');
        });
    });

    // --- INICIALIZAÇÃO ---
    renderizarAlunos();
});
