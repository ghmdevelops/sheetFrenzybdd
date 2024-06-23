document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('viewFeaturesBtn').addEventListener('click', function () {
        var tabela = document.getElementById("tabela");

        if (!tabela || tabela.rows.length === 0) {
            Swal.fire({
                title: 'Erro',
                text: 'Por favor, adicione uma tabela antes de visualizar as features.',
                icon: 'error',
                confirmButtonText: 'OK',
                confirmButtonColor: '#1589FF',
                customClass: {
                    popup: 'animated fadeIn'
                }
            });
            return;
        }

        var features = [];
        var colunasIgnoradas = ["aplicação", "história", "tipo de teste", "funcionalidade"];
        var contextoIndex = null;

        for (var i = 0; i < tabela.rows[0].cells.length; i++) {
            var columnName = tabela.rows[0].cells[i].textContent.toLowerCase().trim();
            if (columnName === "contexto") {
                contextoIndex = i;
                break;
            }
        }

        for (var i = 1; i < tabela.rows.length; i++) {
            var row = tabela.rows[i];
            var featureContent = "Feature: " + row.cells[1].querySelector("input").value + "\n";

            if (contextoIndex !== null) {
                var contextoValue = row.cells[contextoIndex].querySelector("input").value;
                featureContent += "   " + contextoValue + "\n";
            }

            featureContent += "\nScenario: " + row.cells[0].textContent + "\n";
            for (var j = 2; j < row.cells.length - 1; j++) {
                var input = row.cells[j].querySelector("input");
                if (input) {
                    var cellValue = input.value;
                    var columnName = tabela.rows[0].cells[j].textContent.toLowerCase().trim();
                    if (!colunasIgnoradas.includes(columnName) && columnName !== "contexto") {
                        featureContent += columnName + " " + cellValue + "\n";
                    }
                }
            }
            features.push(featureContent);
        }

        var featuresText = features.join('\n\n');

        Swal.fire({
            title: 'Features',
            html: `
        <pre style="text-align: left; max-height: 400px; overflow-y: auto;" id="featuresText">${featuresText}</pre>
        <div>
            <label for="languageSelect">Escolha o idioma:</label>
            <select id="languageSelect" class="form-select">
                <option value="english">English</option>
                <option value="portuguese">Portuguese</option>
            </select>
        </div>
        <button id="downloadFeaturesBtn" class="btn btn-success mt-3">
            <i class="fa-solid fa-download"></i> Download Features
        </button>
    `,
            width: '80%',
            confirmButtonText: 'Fechar',
            confirmButtonColor: '#1589FF',
            customClass: {
                popup: 'animated fadeIn'
            }
        });

        function replaceAllCaseInsensitive(text, search, replacement) {
            var re = new RegExp(search, 'gi');
            return text.replace(re, replacement);
        }

        document.getElementById('languageSelect').addEventListener('change', function () {
            var selectedLanguage = this.value;
            var featureTextElement = document.getElementById('featuresText');
            var updatedFeaturesText = featureTextElement.textContent;

            if (selectedLanguage === 'portuguese') {
                updatedFeaturesText = replaceAllCaseInsensitive(updatedFeaturesText, 'Feature:', 'Funcionalidade:');
                updatedFeaturesText = replaceAllCaseInsensitive(updatedFeaturesText, 'Scenario:', 'Cenário:');
                updatedFeaturesText = replaceAllCaseInsensitive(updatedFeaturesText, 'Given ', 'Dado ');
                updatedFeaturesText = replaceAllCaseInsensitive(updatedFeaturesText, 'When ', 'Quando ');
                updatedFeaturesText = replaceAllCaseInsensitive(updatedFeaturesText, 'Then ', 'Então ');
            } else {
                updatedFeaturesText = replaceAllCaseInsensitive(updatedFeaturesText, 'Funcionalidade:', 'Feature:');
                updatedFeaturesText = replaceAllCaseInsensitive(updatedFeaturesText, 'Cenário:', 'Scenario:');
                updatedFeaturesText = replaceAllCaseInsensitive(updatedFeaturesText, 'Dado ', 'Given ');
                updatedFeaturesText = replaceAllCaseInsensitive(updatedFeaturesText, 'Quando ', 'When ');
                updatedFeaturesText = replaceAllCaseInsensitive(updatedFeaturesText, 'Então ', 'Then ');
            }

            featureTextElement.textContent = updatedFeaturesText;
        });

        document.getElementById('downloadFeaturesBtn').addEventListener('click', function () {
            var blob = new Blob([document.getElementById('featuresText').textContent], { type: 'text/plain;charset=utf-8' });
            var link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            const nomeFile = prompt("Digite o nome da feature.");
            link.download = nomeFile + '.feature';
            link.click();
        });
    });
});

document.getElementById('featuresBtn').addEventListener('click', function () {
    mostrarBotaoSelecionarTodos();
});

function mostrarBotaoSelecionarTodos() {
    var selectAllRadiosButton = document.getElementById('selectAllRadios');
    selectAllRadiosButton.style.display = 'block';
}

document.getElementById('selectAllRadios').addEventListener('click', function () {
    selecionarTodosRadios();
});

function selecionarTodosRadios() {
    var radios = document.querySelectorAll('input[type="radio"]');
    var allChecked = true;

    radios.forEach(function (radio) {
        if (!radio.checked) {
            allChecked = false;
        }
    });

    radios.forEach(function (radio) {
        radio.checked = !allChecked;
    });
}

function exportarParaPDF() {
    Swal.fire({
        title: 'Digite o nome do arquivo',
        input: 'text',
        inputPlaceholder: 'nome do arquivo...',
        showCancelButton: true,
        confirmButtonText: 'Baixar <i class="fa-solid fa-file-arrow-down"></i>',
        confirmButtonColor: "#1589FF",
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) {
                return 'Por favor, preencha o nome do arquivo!';
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            const fileName = result.value;

            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            var tabela = document.getElementById("tabela");

            var data = [];
            for (var i = 0; i < tabela.rows.length; i++) {
                var rowData = [];
                for (var j = 0; j < tabela.rows[i].cells.length; j++) {
                    var cellValue = tabela.rows[i].cells[j].querySelector("input")
                        ? tabela.rows[i].cells[j].querySelector("input").value
                        : tabela.rows[i].cells[j].textContent;
                    rowData.push(cellValue);
                }
                data.push(rowData);
            }

            doc.autoTable({
                head: [data[0]],
                body: data.slice(1),
            });

            doc.save(`${fileName}.pdf`);
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("exportarPDFBtn").addEventListener("click", exportarParaPDF);
});

function contact() {
    document.getElementById('contact').addEventListener('click', function () {
        Swal.fire({
            title: 'Contato',
            html: `
            <div style="text-align: left;">
            <p><i class="fa-solid fa-phone"></i> Telefone: (11) 95166-8436</p>
            <p><i class="fa-solid fa-envelope"></i> Email: tellervtechnology@outlook.com</p>
            </div>`,
            icon: 'info',
            confirmButtonText: 'Fechar',
            confirmButtonColor: "#0d6efd",
            customClass: {
                popup: 'animated fadeIn'
            }
        });
    });
};

document.getElementById('contact').addEventListener("click", function () {
    contact();
});

function updateButtonText() {
    if (isRecording) {
        recordingButton.innerHTML = '<i class="fa-solid fa-pause"></i>';
    } else if (recordedBlob) {
        recordingButton.innerHTML = '<i class="fa-solid fa-download"></i>';
    } else {
        recordingButton.innerHTML = '<i class="fa-solid fa-video"></i>';
    }
}

var recordingButton = document.getElementById('recordingButton');
var recordedVideo = document.getElementById('recordedVideo');

var mediaRecorder;
var isRecording = false;
var recordedBlob;

recordingButton.addEventListener('click', function () {
    if (isRecording) {
        mediaRecorder.stop();
        return;
    }

    if (!isRecording && recordedBlob) {
        Swal.fire({
            title: 'Digite o nome do video.',
            input: 'text',
            inputLabel: 'Nome do video',
            showCancelButton: true,
            confirmButtonText: 'Salvar',
            confirmButtonColor: "#0d6efd",
            showLoaderOnConfirm: true,
            preConfirm: (fileName) => {
                if (!fileName) {
                    Swal.showValidationMessage(
                        'Por favor, insira um nome de arquivo'
                    );
                }
                return fileName;
            }
        }).then((result) => {
            if (result.isConfirmed) {
                var blobUrl = URL.createObjectURL(recordedBlob);
                var a = document.createElement('a');
                a.href = blobUrl;
                a.download = result.value + '.webm';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                recordedBlob = null;
                updateButtonText();
            }
        });
        return;
    }

    navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
        .then(function (stream) {
            mediaRecorder = new MediaStreamRecorder(stream);
            mediaRecorder.mimeType = 'video/webm';

            mediaRecorder.ondataavailable = function (blob) {
                recordedBlob = blob;
                recordedVideo.src = URL.createObjectURL(blob);
                recordedVideo.play();
            };

            mediaRecorder.onstop = function () {
                isRecording = false;
                updateButtonText();
            };

            mediaRecorder.start();
            isRecording = true;
            updateButtonText();
        })
        .catch(function (error) {
            console.error('Error accessing media devices:', error);
        });
});

document.getElementById('editor-gherkin').addEventListener('click', function () {
    location.href = './src/html/sheetFrenzybddEditorGherkin.html';
});

document.getElementById('storyGenerator').addEventListener('click', function () {
    location.href = './src/storyGenerator/sheetFrenzybddgeradordeHistorias.html';
});

document.getElementById('blog').addEventListener('click', function () {
    location.href = './src/blog/sheetFrenzybddBlog.html';
});
