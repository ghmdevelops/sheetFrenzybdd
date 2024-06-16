document.querySelectorAll('.btn-show-function').forEach(button => {
    button.addEventListener('click', () => {
        const pre = button.nextElementSibling;
        if (pre.style.display === 'none' || pre.style.display === '') {
            pre.style.display = 'block';
        } else {
            pre.style.display = 'none';
        }
    });
});

document.getElementById('toggle-theme').addEventListener('click', function () {
    document.body.classList.toggle('dark-theme');
    document.body.classList.toggle('light-theme');

    document.querySelectorAll('.card').forEach(card => {
        card.classList.toggle('dark-theme');
        card.classList.toggle('light-theme');
    });

    document.querySelector('.sidebar').classList.toggle('dark-theme');
    document.querySelector('.sidebar').classList.toggle('light-theme');

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle('dark-theme');
        link.classList.toggle('light-theme');
    });

    const themeIcon = this.querySelector('i');
    if (document.body.classList.contains('dark-theme')) {
        themeIcon.classList.remove('fa-adjust');
        themeIcon.classList.add('fa-sun');
        this.innerHTML = '<i class="fas fa-sun"></i> Light Theme';
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-adjust');
        this.innerHTML = '<i class="fas fa-adjust"></i> Dark Theme';
    }
});

// Set initial theme
document.body.classList.add('light-theme');
document.querySelectorAll('.card').forEach(card => {
    card.classList.add('light-theme');
});
document.querySelector('.sidebar').classList.add('light-theme');
document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.add('light-theme');
});

document.addEventListener('DOMContentLoaded', function () {
    var scrollToTopBtn = document.getElementById('scrollToTopBtn');

    window.addEventListener('scroll', function () {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    });

    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', function () {
            scrollToTop();
        });
    }
});

function scrollToTop() {
    var scrollDuration = 3000;
    var scrollStep = -window.scrollY / (scrollDuration / 15);
    var scrollInterval = setInterval(function () {
        if (window.scrollY != 0) {
            window.scrollBy(0, scrollStep);
        } else {
            clearInterval(scrollInterval);
        }
    }, 15);
}

document.getElementById('menuToggle').addEventListener('click', function () {
    var sidebar = document.querySelector('.sidebar');
    var icon = this.querySelector('i');

    sidebar.classList.toggle('open');

    if (sidebar.classList.contains('open')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

console.log("\n%cAtenção Espere! %c\n\n\nEste é um recurso de navegador voltado para desenvolvedores. Se alguém disse para você copiar e colar algo aqui para ativar um recurso ou 'invadir' a maquina de outra pessoa, isso é uma fraude e você dará a ele acesso à sua maquina.\n\nConsulte ataques https://en.wikipedia.org/wiki/Self-XSS para obter mais informações.", "color: red; font-size: 46px;", "font-size: 16px;");
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;