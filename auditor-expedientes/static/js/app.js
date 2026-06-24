/* Lógica Interactiva del Cliente - Auditor de Expedientes */

document.addEventListener("DOMContentLoaded", () => {
    // 1. Manejo del Tema Claro / Oscuro
    const themeToggleBtn = document.getElementById("theme-toggle-btn");
    const themeIcon = document.getElementById("theme-icon");
    
    // Leer el tema actual guardado en localStorage o preferencia del sistema
    const currentTheme = localStorage.getItem("theme") || 
                         (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
    
    // Aplicar tema inicial
    document.documentElement.setAttribute("data-theme", currentTheme);
    updateThemeIcon(currentTheme);
    
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener("click", () => {
            const activeTheme = document.documentElement.getAttribute("data-theme");
            const newTheme = activeTheme === "dark" ? "light" : "dark";
            
            // Añadir clase de animación de rotación
            if (themeIcon) {
                themeIcon.classList.add("theme-rotate");
                setTimeout(() => themeIcon.classList.remove("theme-rotate"), 400);
            }
            
            // Guardar y establecer
            document.documentElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            updateThemeIcon(newTheme);
        });
    }
    
    function updateThemeIcon(theme) {
        if (!themeIcon) return;
        if (theme === "dark") {
            themeIcon.className = "bi bi-sun-fill text-warning";
        } else {
            themeIcon.className = "bi bi-moon-stars-fill text-dark";
        }
    }
});
