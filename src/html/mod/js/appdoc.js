document.addEventListener('DOMContentLoaded', function () {
    var btnToggleSpeech = document.getElementById('btnToggleSpeech');
    var btnReload = document.getElementById('btnReload');
    var btnToggleTheme = document.getElementById('btnToggleTheme');
    var speechSynthesis = window.speechSynthesis;
    var speechUtterance;

    btnToggleSpeech.addEventListener('click', function () {
        if (!speechSynthesis) {
            console.error('Speech synthesis is not supported on this browser.');
            return;
        }

        if (speechSynthesis.speaking) {
            if (speechSynthesis.paused) {
                speechSynthesis.resume();
            } else {
                speechSynthesis.pause();
            }
        } else {
            var containerContent = document.querySelector('.row');

            if (!containerContent) {
                console.error('Element with class "row" not found.');
                return;
            }

            var contentToSpeak = containerContent.innerText.trim();

            if (!contentToSpeak) {
                console.warn('The content to speak is empty.');
                return;
            }

            speechUtterance = new SpeechSynthesisUtterance(contentToSpeak);
            speechSynthesis.speak(speechUtterance);
        }
    });

    btnReload.addEventListener('click', function () {
        if (speechSynthesis.speaking || speechSynthesis.paused) {
            speechSynthesis.cancel();
        }
    });

    btnToggleTheme.addEventListener('click', function () {
        document.body.classList.toggle('dark-theme');
        if (document.body.classList.contains('dark-theme')) {
            btnToggleTheme.innerHTML = '<i class="fa-solid fa-sun"></i>';
        } else {
            btnToggleTheme.innerHTML = '<i class="fa-solid fa-moon"></i>';
        }
    });
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

const btnOffLod = document.getElementById('off-pagf');
btnOffLod.addEventListener('click', e => {
    location.href = 'https://ghmdevelops.github.io/sheetFrenzybdd/';
});

console.log("\n%cAtenção Espere! %c\n\n\nEste é um recurso de navegador voltado para desenvolvedores. Se alguém disse para você copiar e colar algo aqui para ativar um recurso ou 'invadir' a maquina de outra pessoa, isso é uma fraude e você dará a ele acesso à sua maquina.\n\nConsulte ataques https://en.wikipedia.org/wiki/Self-XSS para obter mais informações.", "color: red; font-size: 46px;", "font-size: 16px;");
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;