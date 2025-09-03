// Funções auxiliares para LocalStorage
function getLocalStorageData(key) {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : [];
}

function setLocalStorageData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

// Função para carregar os últimos treinos do LocalStorage
function carregarUltimosTreinos() {
    const fichas = getLocalStorageData("fichasTreino");
    const listaElement = document.getElementById("lista-ultimos-treinos");

    if (fichas && fichas.length > 0) {
        listaElement.innerHTML = "";
        // Exibir as últimas 5 fichas
        fichas.slice(-5).reverse().forEach(ficha => {
            const treinoElement = document.createElement("div");
            treinoElement.className = "treino-item";
            
            // Verificar se os dados da ficha existem
            const nomeAluno = ficha.aluno_nome || ficha.nome_aluno || "Nome não informado";
            const dataCreacao = ficha.data_criacao || ficha.data_troca || new Date().toISOString();
            const exercicios = ficha.exercicios || [];
            
            treinoElement.innerHTML = `
                <div class="treino-header">
                    <h4>${nomeAluno}</h4>
                    <span class="treino-data">${formatarData(dataCreacao)}</span>
                </div>
                <div class="treino-info">
                    <span class="exercicios-count">${exercicios.length} exercícios</span>
                </div>
            `;
            listaElement.appendChild(treinoElement);
        });
    } else {
        listaElement.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">🗂️</div>
                <div>Nenhuma ficha gerada ainda</div>
            </div>
        `;
    }
}

// Função para carregar as estatísticas do LocalStorage
function carregarEstatisticas() {
    const alunos = getLocalStorageData("alunos") || [];
    const fichas = getLocalStorageData("fichasTreino") || [];

    const alunosTotais = alunos.length;
    const treinosCriados = fichas.length;

    // Alunos ativos (simulado: alunos que têm fichas criadas)
    const nomesAlunosComFichas = fichas
        .map(f => f.aluno_nome || f.nome_aluno)
        .filter(nome => nome && nome !== "Nome não informado");
    const alunosAtivos = new Set(nomesAlunosComFichas).size;

    // Crescimento percentual (simulado: baseado no número de treinos)
    const crescimentoPercentual = treinosCriados > 0 ? Math.min(12 + Math.floor(treinosCriados / 5), 100) : 0;

    // Dinheiro mensal (simulado: baseado em alunos ativos)
    const dinheiroMensal = alunosAtivos * 100; // Ex: R$100 por aluno ativo

    const statItems = document.querySelectorAll(".stat-item");

    if (statItems.length >= 4) {
        statItems[0].querySelector(".stat-value").textContent = `↑ ${crescimentoPercentual}%`;
        statItems[1].querySelector(".stat-value").textContent = treinosCriados;
        statItems[2].querySelector(".stat-value").textContent = alunosAtivos;
        statItems[2].querySelector(".stat-label").textContent = "Alunos Ativos";
        statItems[3].querySelector(".stat-value").textContent = alunosTotais;
        statItems[3].querySelector(".stat-label").textContent = "Alunos Totais";
    }
}

// Função para carregar dados do gráfico do LocalStorage
function carregarGrafico() {
    const fichas = getLocalStorageData("fichasTreino");
    
    // Agrupar fichas por mês para o gráfico
    const dadosPorMes = {};
    fichas.forEach(ficha => {
        const data = new Date(ficha.data_criacao);
        const mesAno = `${data.getFullYear()}-${data.getMonth() + 1}`;
        dadosPorMes[mesAno] = (dadosPorMes[mesAno] || 0) + 1;
    });

    const labels = [];
    const data = [];
    const hoje = new Date();

    // Gerar labels e dados para os últimos 6 meses
    for (let i = 5; i >= 0; i--) {
        const d = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
        labels.push(d.toLocaleString("pt-BR", { month: "short" }));
        const mesAno = `${d.getFullYear()}-${d.getMonth() + 1}`;
        data.push(dadosPorMes[mesAno] || 0);
    }
    
    criarGraficoSimples(labels, data);
}

// Função para criar um gráfico simples (mantida)
function criarGraficoSimples(labels, data) {
    const chartContainer = document.querySelector(".chart-placeholder");
    
    chartContainer.innerHTML = "";
    chartContainer.style.display = "flex";
    chartContainer.style.alignItems = "flex-end";
    chartContainer.style.justifyContent = "space-around";
    chartContainer.style.padding = "10px";
    chartContainer.style.height = "60px";
    
    const maxValue = Math.max(...data);
    
    data.forEach((value, index) => {
        const bar = document.createElement("div");
        bar.style.width = "8px";
        bar.style.backgroundColor = "#9fe6a0";
        bar.style.borderRadius = "2px";
        bar.style.height = `${(value / (maxValue || 1)) * 40}px`; // Evitar divisão por zero
        bar.style.margin = "0 1px";
        bar.title = `${labels[index]}: ${value}`;
        
        chartContainer.appendChild(bar);
    });
}

// Função para formatar data (corrigida)
function formatarData(dataString) {
    if (!dataString) {
        return "Data não informada";
    }
    
    try {
        const data = new Date(dataString);
        
        // Verificar se a data é válida
        if (isNaN(data.getTime())) {
            return "Data inválida";
        }
        
        return data.toLocaleDateString("pt-BR");
    } catch (error) {
        console.error("Erro ao formatar data:", error);
        return "Data inválida";
    }
}

// Função para salvar ficha de treino no LocalStorage
function salvarFichaTreino(dadosFicha) {
    const fichas = getLocalStorageData("fichasTreino");
    fichas.push(dadosFicha);
    setLocalStorageData("fichasTreino", fichas);

    // Adicionar aluno ao LocalStorage se não existir
    const alunos = getLocalStorageData("alunos");
    if (!alunos.some(aluno => aluno.nome === dadosFicha.aluno_nome)) {
        alunos.push({ nome: dadosFicha.aluno_nome });
        setLocalStorageData("alunos", alunos);
    }

    carregarUltimosTreinos();
    carregarEstatisticas();
    carregarGrafico();
    return true;
}

// Inicializar o dashboard quando a página carregar
document.addEventListener("DOMContentLoaded", function() {
    carregarUltimosTreinos();
    carregarEstatisticas();
    carregarGrafico();
    
    // Não é necessário setInterval para LocalStorage, pois os dados são atualizados na hora
    // setInterval(() => {
    //     carregarUltimosTreinos();
    //     carregarEstatisticas();
    // }, 30000);
});

// Exportar funções para uso em outros scripts
window.dashboardAPI = {
    salvarFichaTreino,
    carregarUltimosTreinos,
    carregarEstatisticas,
    getLocalStorageData, // Para debug ou uso futuro
    setLocalStorageData  // Para debug ou uso futuro
};

