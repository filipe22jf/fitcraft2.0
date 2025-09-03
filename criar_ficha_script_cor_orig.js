let exerciciosAdicionados = [];
let contadorExercicios = 0;
let exerciciosPorGrupo = {}; // Tornar global para debug

// Utilitário simples
function uniqueSorted(arr) {
    return Array.from(new Set(arr)).sort((a, b) => a.localeCompare(b, 'pt-BR'));
}

function classificarPernas(nome) {
    const n = nome.toLowerCase();
    const quadKeys = [
        'extensor', 'extensora', 'agach', 'leg press', 'passada', 'afundo', 'bulgaro', 'búlgaro', 'frontal', 'hack'
    ];
    const postKeys = [
        'flexor', 'flexora', 'stiff', 'levantamento terra', 'romeno', 'mesa flexora'
    ];
    if (postKeys.some(k => n.includes(k))) return 'posteriores_de_coxa';
    if (quadKeys.some(k => n.includes(k))) return 'quadriceps';
    return 'quadriceps';
}

function construirMapa(data) {
    const mapa = {
        peitoral: [],
        dorsais: [],
        ombros: [],
        biceps: [],
        triceps: [],
        quadriceps: [],
        posteriores_de_coxa: [],
        gluteos: [],
        panturrilhas: [],
        trapezio: [],
        eretores_da_espinha: [],
        cardio_academia: [],
        abdomem: [],
        antebracos: []
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

    // Ordenar e remover duplicados
    for (const k of Object.keys(mapa)) {
        mapa[k] = uniqueSorted(mapa[k]);
    }
    return mapa;
}

async function carregarExerciciosDoSite() {
    const url = 'https://fitcraft-gifs-html.vercel.app/gif_index.json';
    try {
        const resp = await fetch(url);
        const data = await resp.json();
        return construirMapa(data);
    } catch (e) {
        console.error('Falha ao carregar exercícios do site:', e);
        return null;
    }
}

// Função simplificada para adicionar exercício (sem Supabase)
function adicionarExercicio() {
    const nomeAluno = document.getElementById("nome-aluno").value;
    const dataTroca = document.getElementById("data-troca").value;
    const observacoesAluno = document.getElementById("observacoes-aluno").value;
    const grupoSel = document.getElementById("grupo-muscular");
    const grupoMuscularKey = grupoSel.value;
    const grupoMuscularLabel = grupoSel.options[grupoSel.selectedIndex]?.text || "";
    const exercicioNome = document.getElementById("exercicio").value;
    const series = document.getElementById("series").value;
    const repeticoes = document.getElementById("repeticoes").value;
    const tecnica = document.getElementById("tecnica").value;

    // Validação dos campos obrigatórios
    if (!nomeAluno || !dataTroca || !grupoMuscularKey || !exercicioNome || !series || !repeticoes) {
        alert("Por favor, preencha todos os campos obrigatórios (Nome do Aluno, Data de Troca, Grupo Muscular, Exercício, Séries, Repetições).");
        return;
    }

    // Criar objeto do exercício
    const novoExercicio = {
        grupoMuscular: grupoMuscularLabel,
        exercicio: exercicioNome,
        series: parseInt(series),
        repeticoes: repeticoes,
        tecnica: tecnica || null
    };

    // Adicionar à lista
    exerciciosAdicionados.push(novoExercicio);
    contadorExercicios++;

    // Atualizar interface
    atualizarListaExercicios();
    atualizarContadorExercicios();
    
    // Mostrar seção de PDF
    document.getElementById("pdf-section").style.display = "block";

    // Limpar campos do exercício (manter dados do aluno)
    document.getElementById("grupo-muscular").value = "";
    document.getElementById("exercicio").innerHTML = '<option value="">Primeiro selecione o grupo muscular</option>';
    document.getElementById("exercicio").disabled = true;
    document.getElementById("series").value = "3";
    document.getElementById("repeticoes").value = "12";
    document.getElementById("tecnica").value = "";

    // Feedback visual
    const botao = document.querySelector('.add-exercise-btn');
    const textoOriginal = botao.textContent;
    botao.textContent = '✓ Adicionado!';
    botao.style.backgroundColor = '#28a745';
    
    setTimeout(() => {
        botao.textContent = textoOriginal;
        botao.style.backgroundColor = '';
    }, 1500);

    console.log("Exercício adicionado:", novoExercicio);
}

function atualizarListaExercicios() {
    const listaExerciciosDiv = document.getElementById("lista-exercicios");
    listaExerciciosDiv.innerHTML = "";

    if (exerciciosAdicionados.length === 0) {
        listaExerciciosDiv.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">📋</div>
                <div>
                    <strong>Nenhum exercício adicionado ainda</strong><br>
                    Selecione exercícios para começar sua ficha
                </div>
            </div>
        `;
        return;
    }

    exerciciosAdicionados.forEach((ex, index) => {
        const exercicioItem = document.createElement("div");
        exercicioItem.classList.add("exercise-item");
        const grupoFmt = formatGrupoForPDF(ex.grupoMuscular).replace(/[()]/g, ''); // para UI, sem parênteses
        const tecnicaDescricao = ex.tecnica ? (tecnicasDescricoes[ex.tecnica] || '') : '';
        exercicioItem.innerHTML = `
            <h3>${ex.exercicio} (${grupoFmt})</h3>
            <p class="details">Séries: ${ex.series} | Repetições: ${ex.repeticoes}</p>
            ${ex.tecnica ? `<span class="technique" title="${tecnicaDescricao}">Técnica: <strong>${ex.tecnica}</strong>${tecnicaDescricao ? ` — ${tecnicaDescricao}` : ''}</span>` : ``}
            <button class="remove-btn" onclick="removerExercicio(${index})">×</button>
        `;
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

// Formata o grupo para o PDF, garantindo apenas uma indicação (costas)
function formatGrupoForPDF(grupo) {
    const g = (grupo || '').toLowerCase();
    if (g.includes('dorsais') || g.includes('costas')) {
        return '(costas)';
    } else if (g.includes('ombros (deltoides)')) {
        return '(deltoides)';
    }
    return `(${grupo})`;
}

// Dicionário de técnicas com descrições resumidas
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

function gerarPDFMake() {
    const nomeAluno = document.getElementById("nome-aluno").value;
    const dataTroca = document.getElementById("data-troca").value;
    const observacoesAluno = document.getElementById("observacoes-aluno").value;
    const loading = document.getElementById("loading");

    if (!nomeAluno || exerciciosAdicionados.length === 0) {
        alert("Por favor, preencha o nome do aluno e adicione pelo menos um exercício à ficha.");
        return;
    }

    loading.classList.add("show");

    const docDefinition = {
        content: [
            {
                text: "FICHA DE TREINO",
                style: "header",
                alignment: "center",
                margin: [0, 0, 0, 20]
            },
            {
                text: `Aluno(a): ${nomeAluno}`,
                style: "subheader",
                margin: [0, 0, 0, 5]
            },
            {
                text: `Data de Troca: ${new Date(dataTroca).toLocaleDateString("pt-BR")}`,
                style: "subheader",
                margin: [0, 0, 0, 15]
            },
            observacoesAluno ? {
                text: `Observações: ${observacoesAluno}`,
                style: "subheader",
                margin: [0, 0, 0, 15]
            } : null,
            {
                text: "EXERCÍCIOS",
                style: "header",
                alignment: "center",
                margin: [0, 20, 0, 10]
            },
            ...exerciciosAdicionados.map(ex => ({
                stack: [
                    {
                        text: `${ex.exercicio} ${formatGrupoForPDF(ex.grupoMuscular)}`,
                        style: "exerciseTitle"
                    },
                    {
                        text: `Séries: ${ex.series} | Repetições: ${ex.repeticoes}`,
                        style: "exerciseDetail"
                    },
                    ex.tecnica ? {
                        text: `Técnica: ${ex.tecnica}${tecnicasDescricoes[ex.tecnica] ? " — " + tecnicasDescricoes[ex.tecnica] : ""}`,
                        style: "techniqueDescription"
                    } : null
                ].filter(Boolean),
                margin: [0, 5, 0, 5]
            }))
        ].filter(item => item !== null),
        styles: {
            header: {
                fontSize: 18,
                bold: true,
                color: "#333"
            },
            subheader: {
                fontSize: 12,
                color: "#555"
            },
            exerciseTitle: {
                fontSize: 14,
                bold: true,
                color: "#000"
            },
            exerciseDetail: {
                fontSize: 10,
                color: "#666"
            },
            techniqueDescription: {
                fontSize: 10,
                color: "#0B5ED7", // azul para destaque
                bold: true,
                italics: true
            }
        }
    };

    const nomeArquivo = nomeAluno.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const fileName = `ficha-treino-${nomeArquivo}-${new Date().toLocaleDateString("pt-BR").replace(/\//g, "-")}.pdf`;

    pdfMake.createPdf(docDefinition).download(fileName);

    // Salvar ficha no LocalStorage
    try {
        const dadosFicha = {
            aluno_nome: nomeAluno,
            data_criacao: new Date().toISOString().split("T")[0],
            exercicios: exerciciosAdicionados
        };
        
        if (window.dashboardAPI) {
            window.dashboardAPI.salvarFichaTreino(dadosFicha);
        }
    } catch (error) {
        console.error("Erro ao salvar ficha no LocalStorage:", error);
    }

    loading.classList.remove("show");
}

document.addEventListener("DOMContentLoaded", async () => {
    const grupoMuscularSelect = document.getElementById('grupo-muscular');
    const exercicioSelect = document.getElementById('exercicio');

    // Fallback local com exercícios de abdômen garantidos
    exerciciosPorGrupo = {
        peitoral: ["Supino", "Crucifixo com halteres", "Supino Inclinado", "Flexão de Braço"],
        dorsais: ["Barra Fixa", "Remada Curvada com Barra", "Puxada na Polia", "Remada Sentado"],
        ombros: ["Desenvolvimento com Halteres", "Elevação Lateral", "Elevação Frontal", "Desenvolvimento Militar"],
        biceps: ["Rosca Direta com Barra", "Rosca Martelo", "Rosca Concentrada", "Rosca na Polia"],
        triceps: ["Tríceps Testa com Barra", "Tríceps na Polia com Corda", "Mergulho", "Tríceps Francês"],
        quadriceps: ["Agachamento Livre", "Leg Press 45", "Extensora", "Afundo"],
        posteriores_de_coxa: ["Stiff com Barra", "Mesa Flexora", "Levantamento Terra", "Stiff com Halteres"],
        gluteos: ["Elevação Pélvica", "Cadeira Abdutora", "Agachamento Sumo", "Hip Thrust"],
        panturrilhas: ["Panturrilha em Pé", "Panturrilha Sentado", "Panturrilha no Leg Press"],
        trapezio: ["Encolhimento com Barra", "Remada Alta", "Encolhimento com Halteres"],
        eretores_da_espinha: ["Hiperextensão Lombar", "Bom Dia", "Levantamento Terra"],
        cardio_academia: ["Esteira", "Bicicleta", "Elíptico", "Transport"],
        abdomem: [
            "Abdominal Supra",
            "Prancha Abdominal",
            "Abdominal Crunch",
            "Elevação de Pernas Deitado",
            "Prancha",
            "Abdominal Bicicleta",
            "Rotação Russa",
            "Abdominal Oblíquo",
            "Prancha Lateral",
            "Abdominal Infra",
            "Mountain Climber",
            "Abdominal V-Up",
            "Dead Bug",
            "Russian Twist",
            "Leg Raises"
        ],
        antebracos: ["Rosca de Punho", "Hand Grip", "Rosca Inversa"]
    };

    // Carregar exercícios do site, preservando abdômen local
    try {
        const mapaRemoto = await carregarExerciciosDoSite();
        if (mapaRemoto) {
            // Preservar exercícios de abdômen do fallback local
            const abdomenLocal = exerciciosPorGrupo.abdomem;
            exerciciosPorGrupo = mapaRemoto;
            exerciciosPorGrupo.abdomem = abdomenLocal;
            console.log('Exercícios carregados do site com abdômen local preservado');
        }
    } catch (error) {
        console.log('Usando fallback local para todos os exercícios');
    }

    function popularExerciciosDoGrupo(grupoKey) {
        exercicioSelect.innerHTML = '<option value="">Selecione um exercício</option>';
        
        // Mapear chave para garantir compatibilidade com abdômen
        let chaveCorreta = grupoKey;
        if (grupoKey === 'abdomen') chaveCorreta = 'abdomem';
        
        const lista = exerciciosPorGrupo[chaveCorreta] || [];
        console.log(`Grupo selecionado: ${grupoKey}, Chave usada: ${chaveCorreta}, Exercícios encontrados:`, lista);
        
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

    // Event listener para mudança de grupo muscular
    grupoMuscularSelect.addEventListener('change', function() {
        const grupoSelecionado = this.value;
        if (grupoSelecionado) {
            popularExerciciosDoGrupo(grupoSelecionado);
        } else {
            exercicioSelect.innerHTML = '<option value="">Primeiro selecione o grupo muscular</option>';
            exercicioSelect.disabled = true;
        }
    });

    // Event listener para o botão de gerar PDF
    document.getElementById('btn-gerar-pdf').addEventListener('click', gerarPDFMake);

    // Definir data atual como padrão
    const hoje = new Date().toISOString().split('T')[0];
    document.getElementById('data-troca').value = hoje;

    console.log('Script carregado com sucesso!');
});

