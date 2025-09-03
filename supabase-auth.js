// Módulo de Autenticação Supabase para FitCraft PWA
// Configuração do Supabase
const SUPABASE_URL = 'https://uzyfbrmxcciqyieoktow.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV6eWZicm14Y2NpcXlpZW9rdG93Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYwMTQ5MTAsImV4cCI6MjA3MTU5MDkxMH0.x8GV2vqz_ZMeLMINRsY8B_-9NvUYv0wIb0nEIjQeFTY';

// Inicializar cliente Supabase
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Estado de autenticação
let currentUser = null;

// Classe para gerenciar autenticação
class FitCraftAuth {
    constructor() {
        this.init();
    }

    async init() {
        // Verificar se há usuário logado
        const { data: { user } } = await supabase.auth.getUser();
        currentUser = user;
        
        // Escutar mudanças de autenticação
        supabase.auth.onAuthStateChange((event, session) => {
            currentUser = session?.user || null;
            this.handleAuthChange(event, session);
        });

        // Verificar se precisa redirecionar
        this.checkAuthRequired();
    }

    // Verificar se a página atual requer autenticação
    checkAuthRequired() {
        const currentPage = window.location.pathname;
        const publicPages = ['/login.html', '/register.html'];
        
        // Se não está logado e não está em página pública, redirecionar para login
        if (!currentUser && !publicPages.some(page => currentPage.includes(page))) {
            this.redirectToLogin();
        }
        
        // Se está logado e está em página de login/registro, redirecionar para dashboard
        if (currentUser && publicPages.some(page => currentPage.includes(page))) {
            this.redirectToDashboard();
        }
    }

    // Lidar com mudanças de autenticação
    handleAuthChange(event, session) {
        console.log('Auth state changed:', event, session);
        
        if (event === 'SIGNED_IN') {
            this.redirectToDashboard();
        } else if (event === 'SIGNED_OUT') {
            this.redirectToLogin();
        }
    }

    // Fazer login
    async login(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Erro no login:', error);
            return { success: false, error: error.message };
        }
    }

    // Fazer registro
    async register(email, password) {
        try {
            const { data, error } = await supabase.auth.signUp({
                email: email,
                password: password
            });

            if (error) {
                throw error;
            }

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Erro no registro:', error);
            return { success: false, error: error.message };
        }
    }

    // Fazer logout
    async logout() {
        try {
            const { error } = await supabase.auth.signOut();
            
            if (error) {
                throw error;
            }

            return { success: true };
        } catch (error) {
            console.error('Erro no logout:', error);
            return { success: false, error: error.message };
        }
    }

    // Obter usuário atual
    getCurrentUser() {
        return currentUser;
    }

    // Verificar se está logado
    isAuthenticated() {
        return currentUser !== null;
    }

    // Redirecionar para login
    redirectToLogin() {
        if (!window.location.pathname.includes('login.html')) {
            window.location.href = 'login.html';
        }
    }

    // Redirecionar para dashboard
    redirectToDashboard() {
        if (!window.location.pathname.includes('index.html') && window.location.pathname !== '/') {
            window.location.href = 'index.html';
        }
    }

    // Mostrar informações do usuário
    displayUserInfo() {
        if (currentUser) {
            const userEmail = currentUser.email;
            const userInfoElements = document.querySelectorAll('.user-email');
            userInfoElements.forEach(element => {
                element.textContent = userEmail;
            });
        }
    }
}

// Instância global da autenticação
const fitCraftAuth = new FitCraftAuth();

// Exportar para uso global
window.fitCraftAuth = fitCraftAuth;

