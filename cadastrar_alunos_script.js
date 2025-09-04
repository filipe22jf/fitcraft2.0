/* ========================================
   SUPORTE MOBILE FITCRAFT PWA
   Adicionado automaticamente pelo Manus
   ======================================== */

// 1. INICIALIZAÇÃO MOBILE
function initMobileSupport() {
    console.log("Inicializando suporte mobile...");
    
    // Detectar dispositivo móvel
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isPWA = window.matchMedia("(display-mode: standalone)").matches;
    
    console.log("Mobile:", isMobile, "iOS:", isIOS, "PWA:", isPWA);
    
    if (isMobile) {
        document.body.classList.add("mobile-device");
        if (isIOS) document.body.classList.add("ios-device");
        if (isPWA) document.body.classList.add("pwa-mode");
        
        // Inicializar funcionalidades mobile
        setupTouchFeedback();
        preventDoubleZoom();
        optimizeInputs();
        setupMobileEvents();
    }
}

// 2. FEEDBACK VISUAL PARA TOUCH
function setupTouchFeedback() {
    const touchElements = document.querySelectorAll("button, .clickable, .add-exercise-btn, .btn-voltar");
    
    touchElements.forEach(element => {
        // Touch start
        element.addEventListener("touchstart", function(e) {
            this.style.transform = "scale(0.98)";
            this.style.opacity = "0.8";
            this.style.transition = "all 0.1s ease";
        }, { passive: true });
        
        // Touch end
        element.addEventListener("touchend", function(e) {
            setTimeout(() => {
                this.style.transform = "";
                this.style.opacity = "";
            }, 100);
        }, { passive: true });
        
        // Touch cancel
        element.addEventListener("touchcancel", function(e) {
            this.style.transform = "";
            this.style.opacity = "";
        }, { passive: true });
    });
}

// 3. PREVENIR ZOOM DUPLO TOQUE
function preventDoubleZoom() {
    let lastTouchEnd = 0;
    
    document.addEventListener("touchend", function(event) {
        const now = (new Date()).getTime();
        if (now - lastTouchEnd <= 300) {
            event.preventDefault();
        }
        lastTouchEnd = now;
    }, false);
}

// 4. OTIMIZAR INPUTS PARA MOBILE
function optimizeInputs() {
    const inputs = document.querySelectorAll("input, select, textarea");
    
    inputs.forEach(input => {
        // Melhorar experiência de foco
        input.addEventListener("focus", function() {
            // Scroll suave para o input
            setTimeout(() => {
                this.scrollIntoView({ 
                    behavior: "smooth", 
                    block: "center" 
                });
            }, 300);
        });
        
        // Melhorar experiência de blur
        input.addEventListener("blur", function() {
            // Scroll de volta se necessário
            window.scrollTo({ 
                top: 0, 
                behavior: "smooth" 
            });
        });
        
        // Adicionar atributos mobile-friendly
        if (input.type === "number") {
            input.setAttribute("inputmode", "decimal");
        }
        
        if (input.type === "text" && input.placeholder.includes("nome")) {
            input.setAttribute("autocomplete", "name");
            input.setAttribute("autocapitalize", "words");
        }
    });
}

// 5. EVENTOS ESPECÍFICOS MOBILE
function setupMobileEvents() {
    // Melhorar clique em botões
    const buttons = document.querySelectorAll("button");
    buttons.forEach(button => {
        button.addEventListener("click", function(e) {
            // Adicionar feedback visual extra
            this.style.transform = "scale(0.95)";
            setTimeout(() => {
                this.style.transform = "";
            }, 150);
        });
    });
    
    // Otimizar formulário
    const form = document.querySelector(".form-card");
    if (form) {
        form.addEventListener("submit", function(e) {
            // Adicionar loading state
            const submitBtn = this.querySelector(".add-exercise-btn");
            if (submitBtn) {
                submitBtn.textContent = "Salvando...";
                submitBtn.disabled = true;
            }
        });
    }
}

// 6. DEBUG MOBILE (apenas com ?debug=true)
function debugMobile() {
    if (!window.location.search.includes("debug=true")) return;
    
    console.log("=== DEBUG MOBILE FITCRAFT ===");
    console.log("User Agent:", navigator.userAgent);
    console.log("Viewport:", window.innerWidth + "x" + window.innerHeight);
    console.log("Device Pixel Ratio:", window.devicePixelRatio);
    console.log("Display Mode:", window.matchMedia("(display-mode: standalone)").matches ? "PWA" : "Browser");
    console.log("Touch Support:", "ontouchstart" in window);
    console.log("Service Worker:", "serviceWorker" in navigator);
    
    // Verificar elementos
    const form = document.querySelector(".form-card");
    const inputs = document.querySelectorAll("input");
    const buttons = document.querySelectorAll("button");
    
    console.log("Form encontrado:", !!form);
    console.log("Inputs encontrados:", inputs.length);
    console.log("Botões encontrados:", buttons.length);
    
    // Adicionar logs para eventos
    inputs.forEach((input, index) => {
        input.addEventListener("focus", () => {
            console.log(`Input ${index} (${input.type}) focado`);
        });
        
        input.addEventListener("input", () => {
            console.log(`Input ${index} valor:`, input.value);
        });
    });
    
    buttons.forEach((button, index) => {
        button.addEventListener("click", () => {
            console.log(`Botão ${index} clicado:`, button.textContent);
        });
    });
    
    // Mostrar informações na tela
    const debugInfo = document.createElement("div");
    debugInfo.style.cssText = `
        position: fixed;
        top: 10px;
        right: 10px;
        background: rgba(0,0,0,0.8);
        color: white;
        padding: 10px;
        border-radius: 5px;
        font-size: 12px;
        z-index: 9999;
        max-width: 200px;
    `;
    debugInfo.innerHTML = `
        <strong>DEBUG MODE</strong><br>
        Viewport: ${window.innerWidth}x${window.innerHeight}<br>
        PWA: ${window.matchMedia("(display-mode: standalone)").matches ? "Sim" : "Não"}<br>
        Touch: ${"ontouchstart" in window ? "Sim" : "Não"}
    `;
    document.body.appendChild(debugInfo);
}

// 7. VERIFICAR CONECTIVIDADE
function checkConnectivity() {
    function updateOnlineStatus() {
        const status = navigator.onLine ? "online" : "offline";
        console.log("Status de conectividade:", status);
        
        if (!navigator.onLine) {
            showToast("Você está offline. Algumas funcionalidades podem não funcionar.");
        }
    }
    
    window.addEventListener("online", updateOnlineStatus);
    window.addEventListener("offline", updateOnlineStatus);
    
    // Verificar inicialmente
    updateOnlineStatus();
}

// 8. FUNÇÃO AUXILIAR PARA TOAST
function showToast(message) {
    const toast = document.getElementById("toast");
    if (toast) {
        const messageElement = toast.querySelector(".toast-message");
        if (messageElement) {
            messageElement.textContent = message;
            toast.classList.add("show");
            setTimeout(() => toast.classList.remove("show"), 5000);
        }
    }
}

// 9. INICIALIZAÇÃO PRINCIPAL
function initFitCraftMobile() {
    console.log("Inicializando FitCraft Mobile...");
    
    // Aguardar DOM estar pronto
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", () => {
            initMobileSupport();
            debugMobile();
            checkConnectivity();
        });
    } else {
        initMobileSupport();
        debugMobile();
        checkConnectivity();
    }
}

// 10. EXECUTAR INICIALIZAÇÃO
initFitCraftMobile();

/* ========================================
   INSTRUÇÕES DE IMPLEMENTAÇÃO:
   
   1. Copie este código
   2. Cole no FINAL do arquivo cadastrar_alunos_script.js
   3. Ou crie um arquivo mobile-support.js e inclua no HTML:
      <script src="mobile-support.js"></script>
   
   Para testar:
   - Acesse: sua-url.com/cadastrar_alunos.html?debug=true
   - Abra DevTools no mobile
   - Verifique console para logs
   ======================================== */

