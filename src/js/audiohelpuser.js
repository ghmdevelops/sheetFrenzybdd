document.addEventListener('DOMContentLoaded', function () {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance("Você gostaria de ativar o reconhecimento de voz para preenchimento da tabela? Responda sim ou não.");
        utterance.lang = 'pt-BR';
        utterance.onend = function () {
            const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
            recognition.lang = 'pt-BR';
            recognition.start();

            recognition.onresult = function (event) {
                const transcript = event.results[0][0].transcript.trim().toLowerCase();
                if (transcript === 'sim') {
                    ativarReconhecimentoDeVoz();
                    document.getElementById('card-btns').click();
                }
            };

            recognition.onerror = function (event) {
                console.error('Erro no reconhecimento de voz: ', event.error);
            };
        };
        speechSynthesis.speak(utterance);
    } else {
        console.log('Reconhecimento de fala não suportado neste navegador.');
    }
});
