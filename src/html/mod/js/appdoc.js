document.addEventListener('DOMContentLoaded', function () {
    var btnToggleSpeech = document.getElementById('btnToggleSpeech');
    var btnReload = document.getElementById('btnReload');
    var toggleThemeLink = document.getElementById('toggleThemeLink');
    var themeIcon = document.getElementById('themeIcon');
    var speechSynthesis = window.speechSynthesis;
    var speechUtterance;

    btnReload.style.display = 'none';

    function toggleTheme() {
        document.body.classList.toggle('dark-theme');
        document.querySelector('.sidebar').classList.toggle('dark-theme');
        document.querySelectorAll('button').forEach(button => button.classList.toggle('dark-theme'));
        document.querySelectorAll('.sidebar ul li a').forEach(link => link.classList.toggle('dark-theme'));

        if (document.body.classList.contains('dark-theme')) {
            themeIcon.classList.remove('fa-adjust');
            themeIcon.classList.add('fa-sun');
        } else {
            themeIcon.classList.remove('fa-sun');
            themeIcon.classList.add('fa-adjust');
        }
    }

    function startSpeech() {
        if (!speechSynthesis) {
            console.error('Speech synthesis is not supported on this browser.');
            return;
        }

        if (speechSynthesis.speaking) {
            if (speechSynthesis.paused) {
                speechSynthesis.resume();
                btnToggleSpeech.innerHTML = '<i class="fa-solid fa-pause"></i>';
            } else {
                speechSynthesis.pause();
                btnToggleSpeech.innerHTML = '<i class="fa-solid fa-play"></i>';
            }
        } else {
            var titleElement = document.querySelector('.display-5');
            var contentElement = document.querySelector('.card-body');
            if (!titleElement) {
                console.error('Element with class "display-5" not found.');
                return;
            }
            if (!contentElement) {
                console.error('Element with class "card-body" not found.');
                return;
            }

            var titleToSpeak = titleElement.innerText.trim();
            var contentToSpeak = contentElement.innerText.trim();
            var fullTextToSpeak = titleToSpeak + '. ' + contentToSpeak;

            if (!fullTextToSpeak) {
                console.warn('The content to speak is empty.');
                return;
            }

            speechUtterance = new SpeechSynthesisUtterance(fullTextToSpeak);
            speechSynthesis.speak(speechUtterance);
            btnToggleSpeech.innerHTML = '<i class="fa-solid fa-pause"></i>';
            btnReload.style.display = 'block';  // Show the reload button
        }
    }

    function reloadSpeech() {
        if (speechSynthesis.speaking || speechSynthesis.paused) {
            speechSynthesis.cancel();
            btnToggleSpeech.innerHTML = '<i class="fa-solid fa-play"></i>';
            btnReload.style.display = 'none';  // Hide the reload button
        }
    }

    window.addEventListener('beforeunload', function () {
        if (speechSynthesis.speaking || speechSynthesis.paused) {
            speechSynthesis.cancel();
        }
    });

    function handleScroll() {
        if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
            scrollToTopBtn.style.display = 'block';
        } else {
            scrollToTopBtn.style.display = 'none';
        }
    }

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

    function toggleSidebar() {
        sidebar.classList.toggle('active');
    }

    btnToggleSpeech.addEventListener('click', startSpeech);
    btnReload.addEventListener('click', reloadSpeech);
    toggleThemeLink.addEventListener('click', toggleTheme);
    menuToggle.addEventListener('click', toggleSidebar);
    window.addEventListener('scroll', handleScroll);

    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', scrollToTop);
    }

    console.log("\n%cAtenção Espere! %c\n\n\nEste é um recurso de navegador voltado para desenvolvedores. Se alguém disse para você copiar e colar algo aqui para ativar um recurso ou 'invadir' a máquina de outra pessoa, isso é uma fraude e você dará a ele acesso à sua máquina.\n\nConsulte ataques https://en.wikipedia.org/wiki/Self-XSS para obter mais informações.", "color: red; font-size: 46px;", "font-size: 16px;");
});

function toggleSidebar() {
    document.querySelector('.sidebar').classList.toggle('open');
}

const scrollToTopBtn = document.getElementById('scrollToTopBtn');
window.onscroll = function () {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        scrollToTopBtn.style.display = 'block';
    } else {
        scrollToTopBtn.style.display = 'none';
    }
};

scrollToTopBtn.onclick = function () {
    document.body.scrollTop = 0;
    document.documentElement.scrollTop = 0;
};

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('themeIcon').click();
});