// criar_ficha_script.js

// --- VARIÁVEIS GLOBAIS ---
let exerciciosAdicionados = [];
let contadorExercicios = 0;
let exerciciosPorGrupo = {};
let currentWorkoutPlanId = null; // Novo: ID da ficha de treino atualmente carregada/criada

// --- FUNÇÕES DE LÓGICA DE EXERCÍCIOS (Seu código original, sem alterações) ---
function uniqueSorted(arr) { return Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b, 'pt-BR')); }
function classificarPernas(nome) { const n = nome.toLowerCase(); const quadKeys = ['extensor', 'extensora', 'agach', 'leg press', 'passada', 'afundo', 'bulgaro', 'búlgaro', 'frontal', 'hack']; const postKeys = ['flexor', 'flexora', 'stiff', 'levantamento terra', 'romeno', 'mesa flexora']; if (postKeys.some(k => n.includes(k))) return 'posteriores_de_coxa'; if (quadKeys.some(k => n.includes(k))) return 'quadriceps'; return 'quadriceps'; }
function construirMapa(data) { const mapa = { peitoral: [], dorsais: [], ombros: [], biceps: [], triceps: [], quadriceps: [], posteriores_de_coxa: [], gluteos: [], panturrilhas: [], trapezio: [], eretores_da_espinha: [], cardio_academia: [], abdomem: [], antebracos: [] }; for (const item of data) { const cat = (item.category || '').toLowerCase(); const nome = item.name || ''; if (!nome) continue; if (cat.includes('peitoral')) mapa.peitoral.push(nome); else if (cat.includes('costas') || cat.includes('dorsais')) mapa.dorsais.push(nome); else if (cat.includes('ombros')) mapa.ombros.push(nome); else if (cat.includes('bíceps') || cat.includes('biceps')) mapa.biceps.push(nome); else if (cat.includes('tríceps') || cat.includes('triceps')) mapa.triceps.push(nome); else if (cat.includes('pernas')) mapa[classificarPernas(nome)].push(nome); else if (cat.includes('glúteos') || cat.includes('gluteos')) mapa.gluteos.push(nome); else if (cat.includes('panturr')) mapa.panturrilhas.push(nome); else if (cat.includes('trapézio') || cat.includes('trapezio')) mapa.trapezio.push(nome); else if (cat.includes('eretores')) mapa.eretores_da_espinha.push(nome); else if (cat.includes('cardio')) mapa.cardio_academia.push(nome); else if (cat.includes('abdômen') || cat.includes('abdomen')) mapa.abdomem.push(nome); else if (cat.includes('antebra')) mapa.antebracos.push(nome); } for (const k of Object.keys(mapa)) { mapa[k] = uniqueSorted(mapa[k]); } return mapa; }
async function carregarExerciciosDoSite() { const url = 'https://fitcraft-gifs-html.vercel.app/gif_index.json'; try { const resp = await fetch(url ); const data = await resp.json(); return construirMapa(data); } catch (e) { console.error('Falha ao carregar exercícios do site:', e); return null; } }
const tecnicasDescricoes = { "Drop set": "Realizar o exercício até a falha e reduzir o peso para continuar até a falha novamente.", "Rest-pause": "Ir até a falha, descansar 10–20s e continuar com o mesmo peso.", "Bi-set": "Dois exercícios em sequência sem descanso.", "Tri-set": "Três exercícios em sequência sem descanso.", "Giant set": "Quatro ou mais exercícios em sequência sem descanso.", "Super-set": "Dois exercícios de grupos opostos sem descanso.", "Pré-exaustão": "Exercício isolado antes do composto para o mesmo músculo.", "Pós-exaustão": "Exercício isolado após o composto para o mesmo músculo.", "Isometria": "Manter a contração por tempo definido.", "Parciais": "Repetições com amplitude reduzida na parte mais difícil.", "Forçada": "Ajuda do parceiro nas últimas repetições.", "Negativa": "Ênfase na fase excêntrica, descendo de forma lenta.", "Cluster set": "Dividir a série em mini-blocos com pequenos descansos.", "Piramidal crescente": "Aumenta peso e reduz repetições a cada série.", "Piramidal decrescente": "Reduz peso e aumenta repetições a cada série.", "FST-7": "7 séries de 10–15 repetições com 30–45s de descanso, geralmente no final." };
function formatGrupoForPDF(grupo) { const g = (grupo || '').toLowerCase(); if (g.includes('dorsais') || g.includes('costas')) { return '(costas)'; } else if (g.includes('ombros (deltoides)')) { return '(deltoides)'; } return `(${g.replace(/[^a-z\s]/gi, '')})`; }

// --- FUNÇÕES DE MANIPULAÇÃO DA FICHA ---
function adicionarExercicio() {
    const alunoId = document.getElementById("select-aluno").value;
    const nomeFicha = document.getElementById("nome-ficha").value;
    const dataTroca = document.getElementById("data-troca").value;
    const grupoSel = document.getElementById("grupo-muscular");
    const grupoMuscularKey = grupoSel.value;
    const grupoMuscularLabel = grupoSel.options[grupoSel.selectedIndex]?.text || "";
    const exercicioNome = document.getElementById("exercicio").value;
    const series = document.getElementById("series").value;
    const repeticoes = document.getElementById("repeticoes").value;
    const tecnica = document.getElementById("tecnica").value;

    if (!alunoId || !nomeFicha || !dataTroca || !grupoMuscularKey || !exercicioNome || !series || !repeticoes) {
        alert("Por favor, selecione um aluno, dê um nome à ficha e preencha todos os campos do exercício.");
        return;
    }

    const novoExercicio = { grupoMuscular: grupoMuscularLabel, exercicio: exercicioNome, series: parseInt(series), repeticoes: repeticoes, tecnica: tecnica || null };
    exerciciosAdicionados.push(novoExercicio);
    contadorExercicios++;
    atualizarListaExercicios();
    atualizarContadorExercicios();
    document.getElementById("pdf-section").style.display = "block";
    document.getElementById("grupo-muscular").value = "";
    document.getElementById("exercicio").innerHTML = '<option value="">Primeiro selecione o grupo muscular</option>';
    document.getElementById("exercicio").disabled = true;
    document.getElementById("series").value = "3";
    document.getElementById("repeticoes").value = "12";
    document.getElementById("tecnica").value = "";
}

function atualizarListaExercicios() {
    const listaExerciciosDiv = document.getElementById("lista-exercicios");
    listaExerciciosDiv.innerHTML = "";
    if (exerciciosAdicionados.length === 0) {
        listaExerciciosDiv.innerHTML = `<div class="empty-state"><div class="empty-icon">📋</div><div><strong>Nenhum exercício adicionado ainda</strong>  \nSelecione exercícios para começar sua ficha</div></div>`;
        return;
    }
    exerciciosAdicionados.forEach((ex, index) => {
        const exercicioItem = document.createElement("div");
        exercicioItem.classList.add("exercise-item");
        const grupoFmt = formatGrupoForPDF(ex.grupoMuscular).replace(/[()]/g, '');
        const tecnicaDescricao = ex.tecnica ? (tecnicasDescricoes[ex.tecnica] || '') : '';
        exercicioItem.innerHTML = `<h3>${ex.exercicio} (${grupoFmt})</h3><p class="details">Séries: ${ex.series} | Repetições: ${ex.repeticoes}</p>${ex.tecnica ? `<span class="technique" title="${tecnicaDescricao}">Técnica: <strong>${ex.tecnica}</strong></span>` : ``}<button class="remove-btn" onclick="removerExercicio(${index})">×</button>`;
        listaExerciciosDiv.appendChild(exercicioItem);
    });
}

function removerExercicio(index) {
    exerciciosAdicionados.splice(index, 1);
    contadorExercicios--;
    atualizarListaExercicios();
    atualizarContadorExercicios();
    if (exerciciosAdicionados.length === 0) {
        document.getElementById("pdf-section").style.display = "none";
    }
}

function atualizarContadorExercicios() {
    document.querySelector(".counter").textContent = `${contadorExercicios} exercício(s) adicionado(s)`;
}

// --- NOVAS FUNÇÕES DE INTEGRAÇÃO COM SUPABASE ---

/**
 * Busca clientes ativos no Supabase e popula o menu <select>.
 */
async function popularAlunosSelect() {
    const selectAluno = document.getElementById('select-aluno');
    selectAluno.innerHTML = '<option value="">Carregando...</option>';

    const { data: clients, error } = await _supabase
        .from('clients')
        .select('id, nome')
        .not('credencial', 'is', null) // Pega apenas alunos com credencial (acesso ativo)
        .order('nome', { ascending: true });

    if (error) {
        console.error('Erro ao buscar alunos:', error);
        selectAluno.innerHTML = '<option value="">Erro ao carregar alunos</option>';
        return;
    }

    selectAluno.innerHTML = '<option value="">Selecione um aluno</option>';
    clients.forEach(client => {
        const option = document.createElement('option');
        option.value = client.id;
        option.textContent = client.nome;
        selectAluno.appendChild(option);
    });
}

/**
 * Popula o select de fichas existentes para o aluno selecionado.
 */
async function popularFichasExistentes(alunoId) {
    const selectFichaExistente = document.getElementById('select-ficha-existente');
    selectFichaExistente.innerHTML = '<option value="">Carregando fichas...</option>';
    selectFichaExistente.disabled = true;

    if (!alunoId) {
        selectFichaExistente.innerHTML = '<option value="">Selecione um aluno primeiro</option>';
        return;
    }

    const { data: workoutPlans, error } = await _supabase
        .from('workout_plans')
        .select('id, nome_ficha')
        .eq('aluno_id', alunoId)
        .order('data_troca', { ascending: false });

    if (error) {
        console.error('Erro ao buscar fichas existentes:', error);
        selectFichaExistente.innerHTML = '<option value="">Erro ao carregar fichas</option>';
        return;
    }

    selectFichaExistente.innerHTML = '<option value="">Selecione uma ficha existente</option>';
    if (workoutPlans.length > 0) {
        selectFichaExistente.disabled = false;
        workoutPlans.forEach(plan => {
            const option = document.createElement('option');
            option.value = plan.id;
            option.textContent = plan.nome_ficha;
            selectFichaExistente.appendChild(option);
        });
    } else {
        selectFichaExistente.innerHTML = '<option value="">Nenhuma ficha encontrada</option>';
    }
}

/**
 * Limpa o formulário e prepara para uma nova ficha.
 */
function novaFicha() {
    currentWorkoutPlanId = null;
    document.getElementById('nome-ficha').value = '';
    document.getElementById('data-troca').value = new Date().toISOString().split('T')[0];
    document.getElementById('observacoes-aluno').value = '';
    exerciciosAdicionados = [];
    contadorExercicios = 0;
    atualizarListaExercicios();
    atualizarContadorExercicios();
    document.getElementById("pdf-section").style.display = "none";
    document.getElementById('select-ficha-existente').value = '';
    document.getElementById('btn-carregar-ficha').disabled = true;
    alert('Formulário limpo para uma nova ficha!');
}

/**
 * Carrega uma ficha existente para edição.
 */
async function carregarFicha() {
    const fichaId = document.getElementById('select-ficha-existente').value;
    if (!fichaId) {
        alert('Por favor, selecione uma ficha para carregar.');
        return;
    }

    const loading = document.getElementById("loading");
    loading.classList.add("show");

    const { data: workoutPlan, error } = await _supabase
        .from('workout_plans')
        .select('*')
        .eq('id', fichaId)
        .single();

    loading.classList.remove("show");

    if (error || !workoutPlan) {
        console.error('Erro ao carregar ficha:', error);
        alert('Ocorreu um erro ao carregar a ficha.');
        return;
    }

    currentWorkoutPlanId = workoutPlan.id;
    document.getElementById('nome-ficha').value = workoutPlan.nome_ficha;
    document.getElementById('data-troca').value = workoutPlan.data_troca;
    document.getElementById('observacoes-aluno').value = workoutPlan.observacoes || '';
    exerciciosAdicionados = workoutPlan.exercicios || [];
    contadorExercicios = exerciciosAdicionados.length;
    atualizarListaExercicios();
    atualizarContadorExercicios();
    document.getElementById("pdf-section").style.display = "block";
    alert(`Ficha '${workoutPlan.nome_ficha}' carregada com sucesso!`);
}

/**
 * Salva ou atualiza a ficha de treino completa no Supabase.
 */
async function salvarFichaOnline() {
    const alunoId = document.getElementById('select-aluno').value;
    const nomeFicha = document.getElementById('nome-ficha').value.trim();
    const dataTroca = document.getElementById('data-troca').value;
    const observacoes = document.getElementById('observacoes-aluno').value;

    if (!alunoId || !nomeFicha || !dataTroca) {
        alert('Por favor, selecione um aluno, dê um nome à ficha e preencha a data.');
        return;
    }
    if (exerciciosAdicionados.length === 0) {
        alert('Adicione pelo menos um exercício à ficha antes de salvar.');
        return;
    }

    const loading = document.getElementById("loading");
    loading.classList.add("show");
    document.getElementById('btn-salvar-ficha').disabled = true;

    const fichaData = {
        aluno_id: alunoId,
        nome_ficha: nomeFicha,
        data_troca: dataTroca,
        observacoes: observacoes,
        exercicios: exerciciosAdicionados
    };

    let error = null;
    if (currentWorkoutPlanId) {
        // Atualiza ficha existente
        const { error: updateError } = await _supabase
            .from('workout_plans')
            .update(fichaData)
            .eq('id', currentWorkoutPlanId);
        error = updateError;
    } else {
        // Salva nova ficha
        const { error: insertError, data: newPlan } = await _supabase
            .from('workout_plans')
            .insert(fichaData)
            .select('id'); // Seleciona o ID do novo plano inserido
        error = insertError;
        if (newPlan && newPlan.length > 0) {
            currentWorkoutPlanId = newPlan[0].id; // Define o ID para futuras atualizações
        }
    }

    loading.classList.remove("show");
    document.getElementById('btn-salvar-ficha').disabled = false;

    if (error) {
        console.error('Erro ao salvar/atualizar ficha:', error);
        alert(`Ocorreu um erro ao salvar/atualizar a ficha online. Detalhes: ${error.message}`);
    } else {
        alert('Ficha salva/atualizada com sucesso!');
        // Após salvar/atualizar, repopula as fichas existentes para refletir a mudança
        await popularFichasExistentes(alunoId);
        // Seleciona a ficha recém-salva/atualizada no dropdown
        document.getElementById('select-ficha-existente').value = currentWorkoutPlanId;
        document.getElementById('btn-carregar-ficha').disabled = false;
    }
}

/**
 * Função de gerar PDF adaptada para a nova estrutura.
 */
function gerarPDFMake() {
    const selectAluno = document.getElementById("select-aluno");
    const nomeAluno = selectAluno.options[selectAluno.selectedIndex].text;
    const nomeFicha = document.getElementById("nome-ficha").value;
    const dataTroca = document.getElementById("data-troca").value;
    const observacoesAluno = document.getElementById("observacoes-aluno").value;
    const loading = document.getElementById("loading");

    if (selectAluno.value === "" || exerciciosAdicionados.length === 0 || !nomeFicha) {
        alert("Por favor, selecione um aluno, dê um nome à ficha e adicione pelo menos um exercício.");
        return;
    }

    loading.classList.add("show");

    const docDefinition = {
        content: [
            { text: "FICHA DE TREINO", style: "header", alignment: "center", margin: [0, 0, 0, 20] },
            { text: `Aluno(a): ${nomeAluno}`, style: "subheader", margin: [0, 0, 0, 5] },
            { text: `Nome da Ficha: ${nomeFicha}`, style: "subheader", margin: [0, 0, 0, 5] },
            { text: `Data de Troca: ${new Date(dataTroca).toLocaleDateString("pt-BR")}`, style: "subheader", margin: [0, 0, 0, 15] },
            observacoesAluno ? { text: `Observações: ${observacoesAluno}`, style: "subheader", margin: [0, 0, 0, 15] } : null,
            { text: "EXERCÍCIOS", style: "header", alignment: "center", margin: [0, 20, 0, 10] },
            ...exerciciosAdicionados.map(ex => ({
                stack: [
                    { text: `${ex.exercicio} ${formatGrupoForPDF(ex.grupoMuscular)}`, style: "exerciseTitle" },
                    { text: `Séries: ${ex.series} | Repetições: ${ex.repeticoes}`, style: "exerciseDetail" },
                    ex.tecnica ? { text: `Técnica: ${ex.tecnica}${tecnicasDescricoes[ex.tecnica] ? " — " + tecnicasDescricoes[ex.tecnica] : ""}`, style: "techniqueDescription" } : null
                ].filter(Boolean),
                margin: [0, 5, 0, 5]
            }))
        ].filter(item => item !== null),
        styles: { header: { fontSize: 18, bold: true, color: "#333" }, subheader: { fontSize: 12, color: "#555" }, exerciseTitle: { fontSize: 14, bold: true, color: "#000" }, exerciseDetail: { fontSize: 10, color: "#666" }, techniqueDescription: { fontSize: 10, color: "#0B5ED7", bold: true, italics: true } }
    };

    const nomeArquivo = `${nomeAluno.toLowerCase().replace(/\s+/g, "-")}-${nomeFicha.toLowerCase().replace(/\s+/g, "-")}`.replace(/[^a-z0-9-]/g, "");
    const fileName = `ficha-treino-${nomeArquivo}-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`;
    pdfMake.createPdf(docDefinition).download(fileName);
    loading.classList.remove("show");
}


// --- INICIALIZAÇÃO DA PÁGINA ---
document.addEventListener("DOMContentLoaded", async () => {
    const grupoMuscularSelect = document.getElementById('grupo-muscular');
    const exercicioSelect = document.getElementById('exercicio');
    const selectAluno = document.getElementById('select-aluno');
    const selectFichaExistente = document.getElementById('select-ficha-existente');
    const btnNovaFicha = document.getElementById('btn-nova-ficha');
    const btnCarregarFicha = document.getElementById('btn-carregar-ficha');

    // Carregar exercícios (remoto com fallback local)
    try {
        const mapaRemoto = await carregarExerciciosDoSite();
        if (mapaRemoto) {
            exerciciosPorGrupo = mapaRemoto;
        }
    } catch (error) {
        console.log('Usando fallback local para todos os exercícios');
    }

    function popularExerciciosDoGrupo(grupoKey) {
        exercicioSelect.innerHTML = '<option value="">Selecione um exercício</option>';
        const lista = exerciciosPorGrupo[grupoKey] || [];
        if (lista.length > 0) {
            exercicioSelect.disabled = false;
            lista.forEach(exercicio => {
                const option = document.createElement('option');
                option.value = exercicio;
                option.textContent = exercicio;
                exercicioSelect.appendChild(option);
            });
        } else {
            exercicioSelect.disabled = true;
            exercicioSelect.innerHTML = '<option value="">Nenhum exercício encontrado</option>';
        }
    }

    grupoMuscularSelect.addEventListener('change', function() {
        popularExerciciosDoGrupo(this.value);
    });

    // Event Listeners para os novos botões e selects
    selectAluno.addEventListener('change', async function() {
        const alunoId = this.value;
        await popularFichasExistentes(alunoId);
        // Limpa o formulário ao trocar de aluno
        novaFicha(); 
        // Habilita/desabilita o botão de carregar ficha
        btnCarregarFicha.disabled = !selectFichaExistente.value;
    });

    selectFichaExistente.addEventListener('change', function() {
        btnCarregarFicha.disabled = !this.value;
    });

    btnNovaFicha.addEventListener('click', novaFicha);
    btnCarregarFicha.addEventListener('click', carregarFicha);

    // Adicionar listeners aos botões principais
    document.getElementById('btn-gerar-pdf').addEventListener('click', gerarPDFMake);
    document.getElementById('btn-salvar-ficha').addEventListener('click', salvarFichaOnline);

    // Definir data atual como padrão
    document.getElementById('data-troca').value = new Date().toISOString().split('T')[0];

    // Popular a lista de alunos do Supabase
    await popularAlunosSelect();

    console.log('Página de criação de ficha carregada e pronta.');
});


