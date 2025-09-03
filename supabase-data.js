// Módulo de Dados Supabase para FitCraft PWA
// Gerencia todas as operações de dados com o Supabase

class FitCraftData {
    constructor() {
        this.supabase = window.supabase.createClient(
            'https://uzyfbrmxcciqyieoktow.supabase.co',
            'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eWZicm14Y2NpcXlpZW9rdG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ5NzI5NzEsImV4cCI6MjA1MDU0ODk3MX0.TmkE0HxjpbApyQ8nO7AQkw_yO8tkB9V'
        );
    }

    // ========== CLIENTES ==========
    
    async criarCliente(dadosCliente) {
        try {
            const user = await this.supabase.auth.getUser();
            if (!user.data.user) {
                throw new Error('Usuário não autenticado');
            }

            const { data, error } = await this.supabase
                .from('clientes')
                .insert([{
                    nome: dadosCliente.nome,
                    email: dadosCliente.email,
                    telefone: dadosCliente.telefone,
                    data_nascimento: dadosCliente.dataNascimento,
                    observacoes: dadosCliente.observacoes,
                    user_id: user.data.user.id
                }])
                .select();

            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            return { success: false, error: error.message };
        }
    }

    async listarClientes() {
        try {
            const user = await this.supabase.auth.getUser();
            if (!user.data.user) {
                throw new Error('Usuário não autenticado');
            }

            const { data, error } = await this.supabase
                .from('clientes')
                .select('*')
                .eq('user_id', user.data.user.id)
                .order('nome');

            if (error) throw error;
            return { success: true, data: data || [] };
        } catch (error) {
            console.error('Erro ao listar clientes:', error);
            return { success: false, error: error.message };
        }
    }

    async obterCliente(clienteId) {
        try {
            const user = await this.supabase.auth.getUser();
            if (!user.data.user) {
                throw new Error('Usuário não autenticado');
            }

            const { data, error } = await this.supabase
                .from('clientes')
                .select('*')
                .eq('id', clienteId)
                .eq('user_id', user.data.user.id)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Erro ao obter cliente:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== EXERCÍCIOS ==========
    
    async listarExercicios() {
        try {
            const { data, error } = await this.supabase
                .from('exercicios')
                .select('*')
                .order('nome');

            if (error) throw error;
            return { success: true, data: data || [] };
        } catch (error) {
            console.error('Erro ao listar exercícios:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== FICHAS DE TREINO ==========
    
    async criarFichaTreino(dadosFicha) {
        try {
            const user = await this.supabase.auth.getUser();
            if (!user.data.user) {
                throw new Error('Usuário não autenticado');
            }

            // Criar a ficha de treino
            const { data: ficha, error: fichaError } = await this.supabase
                .from('planos_de_treino')
                .insert([{
                    nome: dadosFicha.nome,
                    cliente_id: dadosFicha.clienteId,
                    data_criacao: dadosFicha.dataCriacao || new Date().toISOString().split('T')[0],
                    observacoes: dadosFicha.observacoes,
                    user_id: user.data.user.id
                }])
                .select()
                .single();

            if (fichaError) throw fichaError;

            // Adicionar exercícios à ficha
            if (dadosFicha.exercicios && dadosFicha.exercicios.length > 0) {
                const exerciciosParaInserir = dadosFicha.exercicios.map((exercicio, index) => ({
                    plano_id: ficha.id,
                    exercicio_id: exercicio.exercicioId,
                    series: exercicio.series,
                    repeticoes: exercicio.repeticoes,
                    peso: exercicio.peso,
                    descanso: exercicio.descanso,
                    observacoes: exercicio.observacoes,
                    ordem: index + 1,
                    user_id: user.data.user.id
                }));

                const { error: exerciciosError } = await this.supabase
                    .from('treino_exercicios')
                    .insert(exerciciosParaInserir);

                if (exerciciosError) throw exerciciosError;
            }

            return { success: true, data: ficha };
        } catch (error) {
            console.error('Erro ao criar ficha de treino:', error);
            return { success: false, error: error.message };
        }
    }

    async listarFichasTreino() {
        try {
            const user = await this.supabase.auth.getUser();
            if (!user.data.user) {
                throw new Error('Usuário não autenticado');
            }

            const { data, error } = await this.supabase
                .from('planos_de_treino')
                .select(`
                    *,
                    clientes (nome),
                    treino_exercicios (
                        *,
                        exercicios (nome, categoria)
                    )
                `)
                .eq('user_id', user.data.user.id)
                .order('data_criacao', { ascending: false });

            if (error) throw error;
            return { success: true, data: data || [] };
        } catch (error) {
            console.error('Erro ao listar fichas de treino:', error);
            return { success: false, error: error.message };
        }
    }

    async obterFichaTreino(fichaId) {
        try {
            const user = await this.supabase.auth.getUser();
            if (!user.data.user) {
                throw new Error('Usuário não autenticado');
            }

            const { data, error } = await this.supabase
                .from('planos_de_treino')
                .select(`
                    *,
                    clientes (nome, email, telefone),
                    treino_exercicios (
                        *,
                        exercicios (nome, categoria, descricao)
                    )
                `)
                .eq('id', fichaId)
                .eq('user_id', user.data.user.id)
                .single();

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Erro ao obter ficha de treino:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== ESTATÍSTICAS ==========
    
    async obterEstatisticas() {
        try {
            const user = await this.supabase.auth.getUser();
            if (!user.data.user) {
                throw new Error('Usuário não autenticado');
            }

            // Contar clientes
            const { count: totalClientes } = await this.supabase
                .from('clientes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.data.user.id);

            // Contar fichas de treino
            const { count: totalFichas } = await this.supabase
                .from('planos_de_treino')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.data.user.id);

            // Fichas criadas este mês
            const inicioMes = new Date();
            inicioMes.setDate(1);
            const { count: fichasEsteMes } = await this.supabase
                .from('planos_de_treino')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', user.data.user.id)
                .gte('data_criacao', inicioMes.toISOString().split('T')[0]);

            return {
                success: true,
                data: {
                    totalClientes: totalClientes || 0,
                    totalFichas: totalFichas || 0,
                    fichasEsteMes: fichasEsteMes || 0,
                    crescimento: totalFichas > 0 ? Math.round((fichasEsteMes / totalFichas) * 100) : 0
                }
            };
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return { success: false, error: error.message };
        }
    }

    // ========== MIGRAÇÃO DE DADOS LOCAIS ==========
    
    async migrarDadosLocais() {
        try {
            // Migrar fichas de treino do localStorage
            const fichasLocais = JSON.parse(localStorage.getItem('fichasDeTreino') || '[]');
            
            if (fichasLocais.length > 0) {
                console.log(`Migrando ${fichasLocais.length} fichas do localStorage...`);
                
                for (const ficha of fichasLocais) {
                    // Criar cliente se não existir
                    let clienteId = null;
                    if (ficha.aluno) {
                        const resultadoCliente = await this.criarCliente({
                            nome: ficha.aluno,
                            email: '',
                            telefone: '',
                            observacoes: 'Migrado do localStorage'
                        });
                        
                        if (resultadoCliente.success) {
                            clienteId = resultadoCliente.data.id;
                        }
                    }

                    // Criar ficha de treino
                    const dadosFicha = {
                        nome: ficha.titulo || 'Ficha Migrada',
                        clienteId: clienteId,
                        dataCriacao: ficha.data || new Date().toISOString().split('T')[0],
                        observacoes: 'Migrado do localStorage',
                        exercicios: []
                    };

                    // Converter exercícios
                    if (ficha.exercicios) {
                        for (const exercicio of ficha.exercicios) {
                            // Buscar exercício na base de dados
                            const { data: exerciciosEncontrados } = await this.supabase
                                .from('exercicios')
                                .select('id')
                                .ilike('nome', `%${exercicio.nome}%`)
                                .limit(1);

                            if (exerciciosEncontrados && exerciciosEncontrados.length > 0) {
                                dadosFicha.exercicios.push({
                                    exercicioId: exerciciosEncontrados[0].id,
                                    series: exercicio.series || 3,
                                    repeticoes: exercicio.repeticoes || 12,
                                    peso: exercicio.peso || 0,
                                    descanso: exercicio.descanso || '60s',
                                    observacoes: exercicio.tecnica || ''
                                });
                            }
                        }
                    }

                    await this.criarFichaTreino(dadosFicha);
                }

                // Limpar localStorage após migração
                localStorage.removeItem('fichasDeTreino');
                console.log('Migração concluída com sucesso!');
            }

            return { success: true };
        } catch (error) {
            console.error('Erro na migração:', error);
            return { success: false, error: error.message };
        }
    }
}

// Instância global
const fitCraftData = new FitCraftData();
window.fitCraftData = fitCraftData;

