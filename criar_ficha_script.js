// criar_ficha_script_updated.js

// --- VARIÁVEIS GLOBAIS ---
let exerciciosAdicionados = [];
let contadorExercicios = 0;
let exerciciosPorGrupo = {};
let currentWorkoutPlanId = null; // ID da ficha de treino atualmente carregada/criada
let currentAlunoId = null; // ID do aluno selecionado
let fichasSelecionada = null; // Ficha selecionada para edição

// --- FUNÇÕES DE LÓGICA DE EXERCÍCIOS (Mantidas do código original) ---
function uniqueSorted(arr) { 
    return Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b, 'pt-BR')); 
}

function classificarPernas(nome) { 
    const n = nome.toLowerCase(); 
    const quadKeys = ['extensor', 'extensora', 'agach', 'leg press', 'passada', 'afundo', 'bulgaro', 'búlgaro', 'frontal', 'hack']; 
    const postKeys = ['flexor', 'flexora', 'stiff', 'levantamento terra', 'romeno', 'mesa flexora']; 
    if (postKeys.some(k => n.includes(k))) return 'posteriores_de_coxa'; 
    if (quadKeys.some(k => n.includes(k))) return 'quadriceps'; 
    return 'quadriceps'; 
}

function construirMapa(data) { 
    const mapa = { 
        peitoral: [], dorsais: [], ombros: [], biceps: [], triceps: [], 
        quadriceps: [], posteriores_de_coxa: [], gluteos: [], panturrilhas: [], 
        trapezio: [], eretores_da_espinha: [], cardio_academia: [], abdomem: [], antebracos: [] 
    }; 
    for (const item of data) { 
        const cat = (item.category || '').toLowerCase(); 
        const nome = item.name || ''; 
        if (!nome) continue; 
        if (cat.includes('peitoral')) mapa.peitoral.push(nome); 
        else if (cat.includes('costas') || cat.includes('dorsais')) mapa.dorsais.push(nome); 
        else if (cat.includes('ombros')) mapa.ombros.push(nome); 
        else if (cat.includes('bíceps') || cat.includes('biceps')) mapa.biceps.push(nome); 
        else if (cat.includes('tríceps') || cat.includes('triceps')) mapa.triceps.push(nome); 
        else if (cat.includes('pernas')) mapa[classificarPernas(nome)].push(nome); 
        else if (cat.includes('glúteos') || cat.includes('gluteos')) mapa.gluteos.push(nome); 
        else if (cat.includes('panturr')) mapa.panturrilhas.push(nome); 
        else if (cat.includes('trapézio') || cat.includes('trapezio')) mapa.trapezio.push(nome); 
        else if (cat.includes('eretores')) mapa.eretores_da_espinha.push(nome); 
        else if (cat.includes('cardio')) mapa.cardio_academia.push(nome); 
        else if (cat.includes('abdômen') || cat.includes('abdomen')) mapa.abdomem.push(nome); 
        else if (cat.includes('antebra')) mapa.antebracos.push(nome); 
    }
    for (const k of Object.keys(mapa)) { 
        mapa[k] = uniqueSorted(mapa[k]); 
    }
    return mapa; 
}

async function carregarExerciciosDoSite() { 
    const url = 'https://fitcraft-gifs-html.vercel.app/gif_index.json'; 
    try { 
        const resp = await fetch(url ); 
        const data = await resp.json(); 
        return construirMapa(data); 
    } catch (e) { 
        console.error('Falha ao carregar exercícios do site:', e); 
        return null; 
    } 
}

const tecnicasDescricoes = { 
    "Drop set": "Realizar o exercício até a falha e reduzir o peso para continuar até a falha novamente.", 
    "Rest-pause": "Ir até a falha, descansar 10–20s e continuar com o mesmo peso.", 
    "Bi-set": "Dois exercícios em sequência sem descanso.", 
    "Tri-set": "Três exercícios em sequência sem descanso.", 
    "Giant set": "Quatro ou mais exercícios em sequência sem descanso.", 
    "Super-set": "Dois exercícios de grupos opostos sem descanso.", 
    "Pré-exaustão": "Exercício isolado antes do composto para o mesmo músculo.", 
    "Pós-exaustão": "Exercício isolado após o composto para o mesmo músculo.", 
    "Isometria": "Manter a contração por tempo definido.", 
    "Parciais": "Repetições com amplitude reduzida na parte mais difícil.", 
    "Forçada": "Ajuda do parceiro nas últimas repetições.", 
    "Negativa": "Ênfase na fase excêntrica, descendo de forma lenta.", 
    "Cluster set": "Dividir a série em mini-blocos com pequenos descansos.", 
    "Piramidal crescente": "Aumenta peso e reduz repetições a cada série.", 
    "Piramidal decrescente": "Reduz peso e aumenta repetições a cada série.", 
    "FST-7": "7 séries de 10–15 repetições com 30–45s de descanso, geralmente no final." 
};

function formatGrupoForPDF(grupo) { 
    const g = (grupo || '').toLowerCase(); 
    if (g.includes('dorsais') || g.includes('costas')) { 
        return '(costas)'; 
    } else if (g.includes('ombros (deltoides)')) { 
        return '(deltoides)'; 
    }
    return `(${g.replace(/[^a-z\s]/gi, '')})`; 
}

// --- FUNÇÕES DE MANIPULAÇÃO DA INTERFACE ---

/**
 * Mostra/esconde seções da interface baseado no estado atual
 */
function atualizarInterface() {
    const fichasExistentesSection = document.getElementById('fichas-existentes-section');
    const dadosFichaSection = document.getElementById('dados-ficha-section');
    const adicionarExercicioSection = document.getElementById('adicionar-exercicio-section');
    const fichaAtualSection = document.getElementById('ficha-atual-section');
    
    if (currentAlunoId) {
        fichasExistentesSection.style.display = 'block';
    } else {
        fichasExistentesSection.style.display = 'none';
        dadosFichaSection.style.display = 'none';
        adicionarExercicioSection.style.display = 'none';
        fichaAtualSection.style.display = 'none';
    }
}

/**
 * Limpa todos os dados da ficha atual
 */
function limparFichaAtual() {
    currentWorkoutPlanId = null;
    fichasSelecionada = null;
    exerciciosAdicionados = [];
    contadorExercicios = 0;
    
    document.getElementById('nome-ficha').value = '';
    document.getElementById('data-troca').value = new Date().toISOString().split('T')[0];
    document.getElementById('observacoes-aluno').value = '';
    
    atualizarListaExercicios();
    atualizarContadorExercicios();
    document.getElementById("pdf-section").style.display = "none";
    
    // Limpar campos de exercício
    document.getElementById("grupo-muscular").value = "";
    document.getElementById("exercicio").innerHTML = '<option value="">Primeiro selecione o grupo muscular</option>';
    document.getElementById("exercicio").disabled = true;
    document.getElementById("series").value = "3";
    document.getElementById("repeticoes").value = "12";
    document.getElementById("tecnica").value = "";
}

/**
 * Inicia o modo de criação de nova ficha
 */
function iniciarNovaFicha() {
    limparFichaAtual();
    
    document.getElementById('dados-ficha-section').style.display = 'block';
    document.getElementById('adicionar-exercicio-section').style.display = 'block';
    document.getElementById('ficha-atual-section').style.display = 'block';
    document.getElementById('modo-edicao').textContent = '(Nova Ficha)';
    document.getElementById('nome-ficha-atual').textContent = '';
    
    // Desmarcar seleção de fichas existentes
    document.querySelectorAll('.ficha-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.getElementById('btn-editar-ficha').disabled = true;
}

/**
 * Inicia o modo de edição de ficha existente
 */
async function iniciarEdicaoFicha(fichaId) {
    const loading = document.getElementById("loading");
    loading.classList.add("show");

    const { data: workoutPlan, error } = await _supabase
        .from('planos_de_treino')
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
    fichasSelecionada = workoutPlan;
    
    document.getElementById('nome-ficha').value = workoutPlan.name;
    document.getElementById('data-troca').value = workoutPlan.data_troca;
    document.getElementById('observacoes-aluno').value = workoutPlan.observacoes || '';
    exerciciosAdicionados = workoutPlan.exercicios || [];
    contadorExercicios = exerciciosAdicionados.length;
    
    document.getElementById('dados-ficha-section').style.display = 'block';
    document.getElementById('adicionar-exercicio-section').style.display = 'block';
    document.getElementById('ficha-atual-section').style.display = 'block';
    document.getElementById('modo-edicao').textContent = '(Editando)';
    document.getElementById('nome-ficha-atual').textContent = `- ${workoutPlan.name}`;
    
    atualizarListaExercicios();
    atualizarContadorExercicios();
    document.getElementById("pdf-section").style.display = "block";
}

/**
 * Cancela a edição/criação atual
 */
function cancelarEdicao() {
    document.getElementById('dados-ficha-section').style.display = 'none';
    document.getElementById('adicionar-exercicio-section').style.display = 'none';
    document.getElementById('ficha-atual-section').style.display = 'none';
    
    // Desmarcar seleção de fichas existentes
    document.querySelectorAll('.ficha-item').forEach(item => {
        item.classList.remove('selected');
    });
    document.getElementById('btn-editar-ficha').disabled = true;
    
    limparFichaAtual();
}

// --- FUNÇÕES DE MANIPULAÇÃO DA FICHA ---
function adicionarExercicio() {
    const nomeFicha = document.getElementById("nome-ficha").value;
    const dataTroca = document.getElementById("data-troca").value;
    const grupoSel = document.getElementById("grupo-muscular");
    const grupoMuscularKey = grupoSel.value;
    const grupoMuscularLabel = grupoSel.options[grupoSel.selectedIndex]?.text || "";
    const exercicioNome = document.getElementById("exercicio").value;
    const series = document.getElementById("series").value;
    const repeticoes = document.getElementById("repeticoes").value;
    const tecnica = document.getElementById("tecnica").value;

    if (!currentAlunoId || !nomeFicha || !dataTroca || !grupoMuscularKey || !exercicioNome || !series || !repeticoes) {
        alert("Por favor, preencha todos os campos obrigatórios do exercício.");
        return;
    }

    const novoExercicio = { 
        grupoMuscular: grupoMuscularLabel, 
        exercicio: exercicioNome, 
        series: parseInt(series), 
        repeticoes: repeticoes, 
        tecnica: tecnica || null 
    };
    
    exerciciosAdicionados.push(novoExercicio);
    contadorExercicios++;
    atualizarListaExercicios();
    atualizarContadorExercicios();
    document.getElementById("pdf-section").style.display = "block";
    
    // Limpar campos de exercício
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
        listaExerciciosDiv.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <div>
                    <strong>Nenhum exercício adicionado ainda</strong>  
                    Selecione exercícios para começar a montar a ficha.
                </div>
            </div>`;
        return;
    }
    
    exerciciosAdicionados.forEach((ex, index) => {
        const exercicioItem = document.createElement("div");
        exercicioItem.classList.add("exercise-item");
        const grupoFmt = formatGrupoForPDF(ex.grupoMuscular).replace(/[()]/g, '');
        const tecnicaDescricao = ex.tecnica ? (tecnicasDescricoes[ex.tecnica] || '') : '';
        
        exercicioItem.innerHTML = `
            <h3>${ex.exercicio} (${grupoFmt})</h3>
            <p class="details">Séries: ${ex.series} | Repetições: ${ex.repeticoes}</p>
            ${ex.tecnica ? `<span class="technique" title="${tecnicaDescricao}">Técnica: <strong>${ex.tecnica}</strong></span>` : ''}
            <button class="remove-btn" onclick="removerExercicio(${index})">×</button>`;
        
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

// --- FUNÇÕES DE INTEGRAÇÃO COM SUPABASE ---

/**
 * Busca clientes ativos no Supabase e popula o menu select.
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
 * Popula a lista de fichas existentes para o aluno selecionado.
 */
async function popularFichasExistentes(alunoId) {
    const listaFichas = document.getElementById('lista-fichas-existentes');
    listaFichas.innerHTML = '<p>Carregando fichas...</p>';

    if (!alunoId) {
        listaFichas.innerHTML = '<p>Selecione um aluno primeiro</p>';
        return;
    }

    const { data: workoutPlans, error } = await _supabase
        .from('planos_de_treino')
        .select('id, name, data_troca, exercicios')
        .eq('user_id', alunoId)
        .order('data_troca', { ascending: false });

    if (error) {
        console.error('Erro ao buscar fichas existentes:', error);
        listaFichas.innerHTML = '<p>Erro ao carregar fichas</p>';
        return;
    }

    if (workoutPlans.length === 0) {
        listaFichas.innerHTML = '<p>Nenhuma ficha encontrada para este aluno</p>';
        return;
    }

    listaFichas.innerHTML = '';
    workoutPlans.forEach(plan => {
        const fichaItem = document.createElement('div');
        fichaItem.className = 'ficha-item';
        fichaItem.dataset.fichaId = plan.id;
        
        const dataFormatada = new Date(plan.data_troca).toLocaleDateString('pt-BR');
        const numExercicios = plan.exercicios ? plan.exercicios.length : 0;
        
        fichaItem.innerHTML = `
            <div class="ficha-info">
                <h4>${plan.name}</h4>
                <p>Data: ${dataFormatada} | ${numExercicios} exercício(s)</p>
            </div>
        `;
        
        fichaItem.addEventListener('click', () => {
            // Desmarcar outras fichas
            document.querySelectorAll('.ficha-item').forEach(item => {
                item.classList.remove('selected');
            });
            
            // Marcar esta ficha
            fichaItem.classList.add('selected');
            fichasSelecionada = plan;
            document.getElementById('btn-editar-ficha').disabled = false;
        });
        
        listaFichas.appendChild(fichaItem);
    });
}

/**
 * Salva ou atualiza a ficha de treino completa no Supabase.
 */
async function salvarFichaOnline() {
    const nomeFicha = document.getElementById('nome-ficha').value.trim();
    const dataTroca = document.getElementById('data-troca').value;
    const observacoes = document.getElementById('observacoes-aluno').value;

    if (!currentAlunoId || !nomeFicha || !dataTroca) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    if (exerciciosAdicionados.length === 0) {
        alert('Por favor, adicione pelo menos um exercício à ficha.');
        return;
    }

    const loading = document.getElementById("loading");
    loading.classList.add("show");

    const { data: { user } } = await _supabase.auth.getUser();
    if (!user) {
        alert('Você precisa estar logado para salvar a ficha.');
        loading.classList.remove("show");
        return;
    }

    const fichaData = {
        user_id: currentAlunoId,
        name: nomeFicha,
        data_troca: dataTroca,
        observacoes: observacoes,
        exercicios: exerciciosAdicionados,
        created_by: user.id // Adiciona o ID do usuário logado
    };

    let result;
    if (currentWorkoutPlanId) {
        // Atualizar ficha existente
        result = await _supabase
            .from('planos_de_treino')
            .update(fichaData)
            .eq('id', currentWorkoutPlanId);
    } else {
        // Inserir nova ficha
        result = await _supabase
            .from('planos_de_treino')
            .insert(fichaData)
            .select(); // Retorna os dados inseridos, incluindo o ID
    }

    loading.classList.remove("show");

    if (result.error) {
        console.error('Erro ao salvar/atualizar a ficha online:', result.error);
        alert('Ocorreu um erro ao salvar/atualizar a ficha online. Detalhes: ' + result.error.message);
    } else {
        alert('Ficha salva/atualizada com sucesso!');
        if (!currentWorkoutPlanId && result.data && result.data.length > 0) {
            currentWorkoutPlanId = result.data[0].id; // Define o ID para a nova ficha
        }
        popularFichasExistentes(currentAlunoId); // Recarrega a lista de fichas
        document.getElementById('modo-edicao').textContent = '(Editando)'; // Muda para modo edição
        document.getElementById('nome-ficha-atual').textContent = `- ${nomeFicha}`;
    }
}

// --- FUNÇÕES DE GERAÇÃO DE PDF (Mantidas do código original) ---
async function gerarPDF() {
    const nomeAluno = document.getElementById('select-aluno').options[document.getElementById('select-aluno').selectedIndex].textContent;
    const nomeFicha = document.getElementById('nome-ficha').value;
    const dataTroca = document.getElementById('data-troca').value;
    const observacoes = document.getElementById('observacoes-aluno').value;

    if (!nomeAluno || !nomeFicha || !dataTroca || exerciciosAdicionados.length === 0) {
        alert('Por favor, preencha todos os campos e adicione exercícios antes de gerar o PDF.');
        return;
    }

    const docDefinition = {
        pageMargins: [40, 40, 40, 40],
        header: function(currentPage, pageCount) {
            return {
                text: `FitCraft Personal - Ficha de Treino`, 
                alignment: 'right', 
                margin: [0, 20, 40, 0], 
                fontSize: 10, 
                color: '#555'
            };
        },
        footer: function(currentPage, pageCount) {
            return {
                text: `Página ${currentPage.toString()} de ${pageCount}`, 
                alignment: 'center', 
                margin: [0, 0, 0, 20], 
                fontSize: 8, 
                color: '#555'
            };
        },
        content: [
            { text: 'FICHA DE TREINO', style: 'header' },
            { text: `Aluno: ${nomeAluno}`, style: 'subheader' },
            { text: `Ficha: ${nomeFicha}`, style: 'subheader' },
            { text: `Data de Troca: ${new Date(dataTroca).toLocaleDateString('pt-BR')}`, style: 'subheader' },
            observacoes ? { text: `Observações: ${observacoes}`, style: 'observacoes' } : null,
            { text: ' ', margin: [0, 10] }, // Espaço
            { text: 'EXERCÍCIOS', style: 'sectionHeader' },
            { text: ' ', margin: [0, 5] }, // Espaço
        ],
        styles: {
            header: { fontSize: 22, bold: true, alignment: 'center', margin: [0, 0, 0, 10], color: '#2f3e5c' },
            subheader: { fontSize: 12, bold: true, margin: [0, 5, 0, 0], color: '#4a5e7a' },
            observacoes: { fontSize: 10, italics: true, margin: [0, 5, 0, 10], color: '#6c757d' },
            sectionHeader: { fontSize: 16, bold: true, margin: [0, 10, 0, 5], color: '#2f3e5c', decoration: 'underline' },
            exerciseName: { fontSize: 12, bold: true, margin: [0, 8, 0, 2], color: '#007bff' },
            exerciseDetails: { fontSize: 10, margin: [0, 0, 0, 2], color: '#333' },
            technique: { fontSize: 9, italics: true, color: '#555', margin: [0, 0, 0, 5] }
        },
        defaultStyle: {
            font: 'Roboto'
        }
    };

    // Adicionar exercícios ao PDF
    exerciciosAdicionados.forEach(ex => {
        const tecnicaDescricao = ex.tecnica ? (tecnicasDescricoes[ex.tecnica] || '') : '';
        docDefinition.content.push(
            { text: `${ex.exercicio} ${formatGrupoForPDF(ex.grupoMuscular)}`, style: 'exerciseName' },
            { text: `Séries: ${ex.series} | Repetições: ${ex.repeticoes}`, style: 'exerciseDetails' },
            ex.tecnica ? { text: `Técnica: ${ex.tecnica} - ${tecnicaDescricao}`, style: 'technique' } : null
        );
    });

    // Carregar fontes para o PDFMake
    pdfMake.fonts = {
        Roboto: {
            normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Regular.ttf',
            bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Medium.ttf',
            italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-Italic.ttf',
            bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/fonts/Roboto/Roboto-MediumItalic.ttf'
        }
    };

    pdfMake.createPdf(docDefinition ).download(`Ficha_${nomeAluno.replace(/\s/g, '_')}_${nomeFicha.replace(/\s/g, '_')}.pdf`);
}

// --- EVENT LISTENERS ---
document.addEventListener('DOMContentLoaded', async () => {
    await popularAlunosSelect();
    await carregarExerciciosDoSite().then(data => {
        if (data) {
            exerciciosPorGrupo = data;
        }
    });
    atualizarInterface();

    document.getElementById('select-aluno').addEventListener('change', (event) => {
        currentAlunoId = event.target.value;
        limparFichaAtual();
        if (currentAlunoId) {
            popularFichasExistentes(currentAlunoId);
            document.getElementById('fichas-existentes-section').style.display = 'block';
        } else {
            document.getElementById('fichas-existentes-section').style.display = 'none';
        }
        atualizarInterface();
    });

    document.getElementById('grupo-muscular').addEventListener('change', (event) => {
        const grupoSelecionado = event.target.value;
        const exercicioSelect = document.getElementById('exercicio');
        exercicioSelect.innerHTML = '<option value="">Selecione o exercício</option>';
        exercicioSelect.disabled = true;

        if (grupoSelecionado && exerciciosPorGrupo[grupoSelecionado]) {
            exerciciosPorGrupo[grupoSelecionado].forEach(ex => {
                const option = document.createElement('option');
                option.value = ex;
                option.textContent = ex;
                exercicioSelect.appendChild(option);
            });
            exercicioSelect.disabled = false;
        }
    });

    document.getElementById('btn-nova-ficha').addEventListener('click', iniciarNovaFicha);
    document.getElementById('btn-editar-ficha').addEventListener('click', () => {
        if (fichasSelecionada) {
            iniciarEdicaoFicha(fichasSelecionada.id);
        } else {
            alert('Por favor, selecione uma ficha para editar.');
        }
    });
    document.getElementById('btn-cancelar-edicao').addEventListener('click', cancelarEdicao);
    document.getElementById('btn-salvar-ficha').addEventListener('click', salvarFichaOnline);
    document.getElementById('btn-gerar-pdf').addEventListener('click', gerarPDF);
});
