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

    const themeIcon = this.querySelector('i');
    if (document.body.classList.contains('dark-theme')) {
        themeIcon.classList.remove('fa-adjust');
        themeIcon.classList.add('fa-sun');
        this.innerHTML = '<i class="fas fa-sun"></i> Light Theme';
    } else {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
        this.innerHTML = '<i class="fas fa-moon"></i> Dark Theme';
    }
});

document.body.classList.add('light-theme');
document.querySelectorAll('.card').forEach(card => {
    card.classList.add('light-theme');
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
    var scrollDuration = 3;
    var scrollStep = -window.scrollY / (scrollDuration / 15);
    var scrollInterval = setInterval(function () {
        if (window.scrollY != 0) {
            window.scrollBy(0, scrollStep);
        } else {
            clearInterval(scrollInterval);
        }
    }, 15);
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('toggle-theme').click();
});

console.log("\n%cAtenção Espere! %c\n\n\nEste é um recurso de navegador voltado para desenvolvedores. Se alguém disse para você copiar e colar algo aqui para ativar um recurso ou 'invadir' a maquina de outra pessoa, isso é uma fraude e você dará a ele acesso à sua maquina.\n\nConsulte ataques https://en.wikipedia.org/wiki/Self-XSS para obter mais informações.", "color: red; font-size: 46px;", "font-size: 16px;");
