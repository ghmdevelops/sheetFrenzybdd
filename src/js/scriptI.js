document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('dblclick', function (event) {
        var target = event.target;

        if (target.tagName === 'INPUT' && target.type === 'text') {
            Swal.fire({
                title: 'Texto Digitado',
                html: `
                    <textarea id="swal-input1" style="
                        height: 130px; 
                        width: 340px; 
                        border-radius: 10px; 
                        background-color: #f9f9f9; 
                        box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1); 
                        color: #333;
                        padding: 10px;
                        font-family: Arial, sans-serif;
                        font-size: 14px;
                        resize: none;
                    ">${target.value}</textarea>
                `,
                icon: "info",
                confirmButtonColor: "#3085d6",
                confirmButtonText: "OK",
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
                preConfirm: () => {
                    return document.getElementById('swal-input1').value;
                }
            }).then((result) => {
                if (result.isConfirmed) {
                    target.value = result.value;
                }
            });
        }
    });
});

let importedFileName = '';

async function importExcel() {
    var input = document.getElementById("importExcel");
    var file = input.files[0];

    if (file) {
        importedFileName = file.name;
        var reader = new FileReader();
        var fileNameWithoutExtension = importedFileName.replace(/\.[^/.]+$/, "");

        reader.onload = function (e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, { type: 'binary' });
            var sheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[sheetName];
            var importedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            addDataToExistingTable(importedData);
            adicionarEventosDeClique();

            document.getElementById("exampleModalLabel").innerHTML = `
                <img width="40" src="./src/img/logoPage200.png" alt="cm">
                Dashboard<b style="color: #16db6b;"> BDD</b> - ${fileNameWithoutExtension}
            `;

            const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 4000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });

            Toast.fire({
                icon: "success",
                title: "Arquivo '" + file.name + "' importado!"
            });

            document.getElementById("saveButtonContainer").style.display = "block";
        };
        reader.readAsBinaryString(file);
    } else {
        alert("Por favor, selecione um arquivo Excel para importar.");
    }

    const { value: activateSpeechRecognition } = await Swal.fire({
        title: 'Deseja ativar o reconhecimento de voz?',
        html: '<p style="color: #fff;">Você poderá preencher os campos usando sua voz.</p>',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
    });

    if (activateSpeechRecognition) {
        ativarReconhecimentoDeVoz();
    } else {
        document.getElementById('audioButton').style.display = 'block';
    }

    //mostrarInformacoes();
    document.querySelector('.grade-buttons').classList.remove('d-none');
    document.querySelector('#audioButton').classList.remove('d-none');
    document.querySelector('#dashboardButton').classList.add('d-none');
    document.querySelector('#card-btns').classList.add('d-none');
    document.querySelector('.div-btns-lines003').classList.add('d-none');
    document.querySelector('#customButtonEx').classList.add('d-none');

}

function adicionarEventosDeClique() {
    var tabela = document.getElementById("tabela");

    for (var i = 1; i < tabela.rows.length; i++) {
        for (var j = 0; j < tabela.rows[i].cells.length; j++) {
            var cell = tabela.rows[i].cells[j];
            var input = cell.querySelector("input");

            if (input) {
                if (tabela.rows[0].cells[j].textContent.trim() === "Aplicação") {
                    input.addEventListener('click', function () {
                        openSwalForColumnAplicacao(this);
                    });
                } else if (tabela.rows[0].cells[j].textContent.trim() === "Tipo de teste") {
                    input.addEventListener('click', function () {
                        openSwalForColumnTipoTeste(this);
                    });
                } else if (tabela.rows[0].cells[j].textContent.trim() === "Teste de campo") {
                    input.addEventListener('click', function () {
                        openSwalForColumnTesteCampo(this);
                    });
                }
            }
        }
    }
}

function addDataToExistingTable(importedData) {
    var tabela = document.getElementById("tabela");

    if (!tabela) {
        updateTable(importedData);
        return;
    }

    var startRowIndex = tabela.rows.length;

    for (var i = 0; i < importedData.length; i++) {
        var rowData = importedData[i];
        var row = tabela.insertRow(startRowIndex + i);

        for (var j = 0; j < rowData.length; j++) {
            var cell = row.insertCell(j);
            var input = document.createElement("input");
            input.type = "text";
            input.value = rowData[j];
            cell.appendChild(input);
        }
    }
}

function saveTable() {
    var tabela = document.getElementById("tabela");

    var data = [];
    for (var i = 0; i < tabela.rows.length; i++) {
        var rowData = [];
        for (var j = 0; j < tabela.rows[i].cells.length; j++) {
            var input = tabela.rows[i].cells[j].querySelector("input");
            rowData.push(input ? input.value : tabela.rows[i].cells[j].innerHTML);
        }
        data.push(rowData);
    }

    var wb = XLSX.utils.book_new();
    var ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, "Tabela");

    XLSX.writeFile(wb, importedFileName);

    const Toast = Swal.mixin({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 4000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.onmouseenter = Swal.stopTimer;
            toast.onmouseleave = Swal.resumeTimer;
        }
    });

    Toast.fire({
        icon: 'success',
        title: 'Tabela salva com sucesso!'
    });
}

async function updateTable(importedData) {
    var headerRow = importedData[0];
    var existingTable = document.getElementById("tabela");

    if (existingTable) {
        existingTable.remove();
    }

    var newTable = document.createElement("table");
    newTable.id = "tabela";

    var headerRowElement = newTable.createTHead().insertRow(0);
    for (var i = 0; i < headerRow.length; i++) {
        var th = headerRowElement.insertCell(i);
        th.textContent = headerRow[i];
    }

    for (var j = 1; j < importedData.length; j++) {
        var row = newTable.insertRow(j);
        for (var k = 0; k < importedData[j].length; k++) {
            var cell = row.insertCell(k);
            var input = document.createElement("input");
            input.type = "text";
            input.value = importedData[j][k];
            cell.appendChild(input);
        }
    }
    document.body.appendChild(newTable);

    const { value: activateSpeechRecognition } = await Swal.fire({
        title: 'Deseja ativar o reconhecimento de voz?',
        html: '<p style="color: #fff;">Você poderá preencher os campos usando sua voz.</p>',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
    });

    if (activateSpeechRecognition) {
        ativarReconhecimentoDeVoz();
    } else {
        document.getElementById('audioButton').style.display = 'block';
    }
}

function ativarReconhecimentoDeVoz() {
    if (isRecognitionActive) {
        recognition.stop();
        isRecognitionActive = false;
        Swal.fire('Reconhecimento de voz desativado', '', 'info');
        document.getElementById('audioButton').innerHTML = '<i class="fas fa-microphone"></i> Ativar Reconhecimento de Voz';
    } else {
        if (!('webkitSpeechRecognition' in window)) {
            Swal.fire('Erro', 'Reconhecimento de voz não suportado neste navegador.', 'error');
            return;
        }

        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'pt-BR';

        recognition.onstart = function () {
            Swal.fire('Reconhecimento de voz ativado, pode começar a falar.', '', 'success');
            document.getElementById('audioButton').innerHTML = '<i class="fas fa-microphone-slash"></i> Desativar Reconhecimento de Voz';
        };

        recognition.onerror = function (event) {
            Swal.fire('Erro no reconhecimento de voz', event.error, 'error');
        };

        recognition.onresult = function (event) {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    document.activeElement.value += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
        };

        recognition.onend = function () {
            if (isRecognitionActive) {
                recognition.start();
            } else {
                document.getElementById('audioButton').innerHTML = '<i class="fas fa-microphone"></i> Ativar Reconhecimento de Voz';
            }
        };

        recognition.start();
        isRecognitionActive = true;
        document.getElementById('audioButton').innerHTML = '<i class="fas fa-microphone-slash"></i> Desativar Reconhecimento de Voz';
    }
}

function getNextInput(currentInput) {
    var inputs = document.querySelectorAll('input[type="text"]');
    var currentIndex = Array.from(inputs).indexOf(currentInput);

    if (currentIndex < inputs.length - 1) {
        return inputs[currentIndex + 1];
    } else {
        return null;
    }
}

function getNextInput(currentInput) {
    var inputs = document.querySelectorAll('input[type="text"]');
    var currentIndex = Array.from(inputs).indexOf(currentInput);

    if (currentIndex < inputs.length - 1) {
        return inputs[currentIndex + 1];
    } else {
        return null;
    }
}

let recognition;
let isRecognitionActive = false;

var linhasSublinhadas = [];
async function criarTabela() {
    var tabelaExistente = document.getElementById("tabela");
    if (tabelaExistente) {
        tabelaExistente.remove();
    }

    document.getElementById("qtd-lne").style.display = "none";

    var rows = document.getElementById("rows").value;
    var cols = document.getElementById("cols").value; // Reduzir o número de colunas em 1
    var tabela = document.createElement("table");
    tabela.id = "tabela";

    var cabecalho = tabela.createTHead().insertRow(0);
    var titulos = ["Nº Cenário", "Cenário", "Contexto", "Funcionalidade", "Dado", "Quando", "Então", "Aplicação", "História", "Tipo de teste", "Teste de campo", "Status"];

    for (var j = 0; j < cols; j++) {
        var th = cabecalho.insertCell(j);
        th.textContent = titulos[j];
        th.setAttribute("onclick", "ordenarColuna(" + j + ")");
        th.setAttribute("oncontextmenu", "excluirColuna(event, " + j + "); return false;");
        th.setAttribute("ondblclick", "inserirColuna(" + j + ")");

        if (titulos[j] === "Aplicação" || titulos[j] === "Tipo de teste") {
            th.classList.add('clickable-column');
        }
    }

    for (var i = 0; i < rows; i++) {
        var row = tabela.insertRow(i + 1);
        var ctValue = "CT" + (i + 1).toString().padStart(4, '0');
        var cellCT = row.insertCell(0);
        cellCT.textContent = ctValue;

        for (var j = 1; j < cols; j++) {
            var cell = row.insertCell(j);
            var input = document.createElement("input");
            input.type = "text";
            input.value = "";
            input.spellcheck = true;

            if (titulos[j] === "Dado") {
                input.value = "";
            }

            if (titulos[j] === "Aplicação") {
                input.classList.add('clickable-input');
                input.addEventListener('click', function () {
                    openSwalForColumnAplicacao(this);
                });
            } else if (titulos[j] === "Tipo de teste") {
                input.classList.add('clickable-input');
                input.addEventListener('click', function () {
                    openSwalForColumnTipoTeste(this);
                });
            } else if (titulos[j] === "Teste de campo") {
                input.classList.add('clickable-input');
                input.addEventListener('click', function () {
                    openSwalForColumnTesteCampo(this);
                });
            }

            cell.appendChild(input);
        }
        row.cells[11].querySelector("input").value = "Pendente";
    }
    document.body.appendChild(tabela);

    const { value: activateSpeechRecognition } = await Swal.fire({
        title: 'Deseja ativar o reconhecimento de voz?',
        html: '<p style="color: #fff;">Você poderá preencher os campos usando sua voz.</p>',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Sim',
        cancelButtonText: 'Não',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33'
    });

    if (activateSpeechRecognition) {
        ativarReconhecimentoDeVoz();
    } else {
        document.getElementById('audioButton').style.display = 'block';
    }

    mostrarInformacoes();
    document.querySelector('.grade-buttons').classList.remove('d-none');
    document.querySelector('#audioButton').classList.remove('d-none');
}

function atualizarEstiloLinhasSublinhadas() {
    var tabela = document.getElementById("tabela");
    for (var i = 1; i < tabela.rows.length; i++) {
        if (linhasSublinhadas.includes(i)) {
            tabela.rows[i].style.textDecoration = "underline";
        } else {
            tabela.rows[i].style.textDecoration = "none";
        }
    }
}

function openSwalForColumnAplicacao(inputElement) {
    Swal.fire({
        title: 'Escolha um valor para Aplicação',
        html: `
             <style>
            .swal2-container .swal2-popup .swal2-html-container {
                text-align: center;
                color: #fff;
                font-family: Arial, sans-serif;
            }
            .swal2-container .swal2-popup .swal2-html-container div {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
                gap: 15px;
                justify-items: start;
                padding: 10px;
            }
            .swal2-container .swal2-popup .swal2-html-container div label {
                display: flex;
                align-items: center;
                font-size: 16px;
                background: #333;
                padding: 8px 12px;
                border-radius: 5px;
                transition: all 0.3s ease;
                cursor: pointer;
            }
            .swal2-container .swal2-popup .swal2-html-container div label:hover {
                background: #555;
            }
            .swal2-container .swal2-popup .swal2-html-container div input {
                margin-right: 10px;
            }
        </style>
        <div>
            <label><input type="radio" name="aplicacao" value="Web"> Web</label>
            <label><input type="radio" name="aplicacao" value="Serviço"> Serviço</label>
            <label><input type="radio" name="aplicacao" value="Desktop"> Desktop</label>
            <label><input type="radio" name="aplicacao" value="Infra"> Infra</label>
            <label><input type="radio" name="aplicacao" value="Mainframe"> Mainframe</label>
            <label><input type="radio" name="aplicacao" value="Mobile"> Mobile</label>
        </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const selectedOption = document.querySelector('input[name="aplicacao"]:checked');
            if (selectedOption) {
                return selectedOption.value;
            } else {
                Swal.showValidationMessage('Você precisa escolher um valor!');
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            inputElement.value = result.value;
        }
    });
}

function openSwalForColumnTipoTeste(inputElement) {
    Swal.fire({
        title: 'Escolha um valor para Tipo de Teste',
        html: `
           <style>
            .swal2-container .swal2-popup .swal2-html-container {
                text-align: center;
                color: #fff;
                font-family: Arial, sans-serif;
            }
            .swal2-container .swal2-popup .swal2-html-container div {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
                gap: 15px;
                justify-items: start;
                padding: 10px;
            }
            .swal2-container .swal2-popup .swal2-html-container div label {
                display: flex;
                align-items: center;
                font-size: 16px;
                background: #333;
                padding: 10px 15px;
                border-radius: 5px;
                transition: all 0.3s ease;
                cursor: pointer;
                width: 100%;
            }
            .swal2-container .swal2-popup .swal2-html-container div label:hover {
                background: #555;
            }
            .swal2-container .swal2-popup .swal2-html-container div input {
                margin-right: 10px;
            }
        </style>
        <div>
            <label><input type="radio" name="tipoteste" value="Acceptance"> Acceptance</label>
            <label><input type="radio" name="tipoteste" value="End to End"> End to End</label>
            <label><input type="radio" name="tipoteste" value="Regression"> Regression</label>
            <label><input type="radio" name="tipoteste" value="Sanity"> Sanity</label>
            <label><input type="radio" name="tipoteste" value="Security"> Security</label>
            <label><input type="radio" name="tipoteste" value="Performance"> Performance</label>
            <label><input type="radio" name="tipoteste" value="UI"> UI</label>
            <label><input type="radio" name="tipoteste" value="API"> API</label>
        </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const selectedOption = document.querySelector('input[name="tipoteste"]:checked');
            if (selectedOption) {
                return selectedOption.value;
            } else {
                Swal.showValidationMessage('Você precisa escolher um valor!');
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            inputElement.value = result.value;
        }
    });
}

function openSwalForColumnTesteCampo(inputElement) {
    Swal.fire({
        title: 'Escolha um valor para Teste de campo',
        html: `
            <style>
            .swal2-container .swal2-popup .swal2-html-container {
                text-align: center;
                color: #fff;
                font-family: Arial, sans-serif;
            }
            .swal2-container .swal2-popup .swal2-html-container div {
                display: flex;
                justify-content: center;
                gap: 15px;
                padding: 10px;
            }
            .swal2-container .swal2-popup .swal2-html-container div label {
                display: flex;
                align-items: center;
                font-size: 18px;
                background: #333;
                padding: 12px 20px;
                border-radius: 8px;
                transition: all 0.3s ease;
                cursor: pointer;
                width: 150px;
                justify-content: center;
                text-align: center;
            }
            .swal2-container .swal2-popup .swal2-html-container div label:hover {
                background: #555;
                transform: scale(1.05);
            }
            .swal2-container .swal2-popup .swal2-html-container div input {
                 margin-right: 10px;
            }
        </style>
        <div>
            <label><input type="radio" name="tipoteste" value="Positivo"> Positivo</label>
            <label><input type="radio" name="tipoteste" value="Negativo"> Negativo</label>
        </div>
        `,
        showCancelButton: true,
        confirmButtonText: 'OK',
        confirmButtonColor: '#3085d6',
        cancelButtonText: 'Cancelar',
        preConfirm: () => {
            const selectedOption = document.querySelector('input[name="tipoteste"]:checked');
            if (selectedOption) {
                return selectedOption.value;
            } else {
                Swal.showValidationMessage('Você precisa escolher um valor!');
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            inputElement.value = result.value;
        }
    });
}

function mostrarInformacoes() {
    /* Swal.fire({
         title: 'Informações Importantes',
         html: `
            <ul class="const-import">
                 <li><strong>1. Foco no cenário:</strong> Identifique e descreva claramente o cenário específico a ser testado.</li>
                 <li><strong>2. Especificação do cenário:</strong> Use a linguagem Gherkin para definir o comportamento esperado com "Dado", "Quando" e "Então".</li>
                 <li><strong>3. Especificação das unidades:</strong> Quebre o cenário em unidades menores e específicas de teste.</li>
                 <li><strong>4. Fazer o teste passar:</strong> Implemente o código necessário para passar nos testes e refatore conforme necessário.</li>
             </ul>
         `,
         icon: 'info',
         confirmButtonText: 'OK',
         confirmButtonColor: "#3085d6",
     });*/
}

function atualizarEstiloLinhasSublinhadas() {
    for (var i = 1; i < tabela.rows.length; i++) {
        tabela.rows[i].classList.remove("sublinhada");
    }

    for (var i = 0; i < linhasSublinhadas.length; i++) {
        var cor = gerarCorAleatoria();
        tabela.rows[linhasSublinhadas[i]].classList.add("sublinhada");
        tabela.rows[linhasSublinhadas[i]].style.backgroundColor = cor;
    }
}

function gerarCorAleatoria() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16);
}

function adicionarLinha() {
    var tabela = document.getElementById("tabela");
    if (!tabela) {
        Swal.fire({
            icon: 'info',
            title: 'Nenhuma tabela encontrada',
            text: 'Por favor, adicione uma tabela antes de adicionar linhas.',
            confirmButtonColor: "#3085d6",
        });
        return;
    }

    var newRow = tabela.insertRow(tabela.rows.length);

    if (newRow) {
        var ctValue = "CT" + (tabela.rows.length - 1).toString().padStart(4, '0');
        var cellCT = newRow.insertCell(0);
        cellCT.textContent = ctValue;

        var titulos = ["Nº Cenário", "Cenário", "Contexto", "Funcionalidade", "Dado", "Quando", "Então", "Aplicação", "História", "Tipo de teste", "Teste de campo", "Status"];

        for (var j = 1; j < tabela.rows[0].cells.length; j++) {
            var cell = newRow.insertCell(j);

            if (tabela.rows[0].cells[j].textContent.trim().toLowerCase() === "feature") {
                var radioInput = document.createElement("input");
                radioInput.type = "radio";
                radioInput.name = "featureRadio" + tabela.rows.length;
                cell.appendChild(radioInput);
            } else {
                var input = document.createElement("input");
                input.type = "text";
                input.value = "";

                if (titulos[j] === "Dado") {
                    input.value = "";
                }

                if (titulos[j] === "Aplicação") {
                    input.classList.add('clickable-input');
                    input.addEventListener('click', function () {
                        openSwalForColumnAplicacao(this);
                    });
                } else if (titulos[j] === "Tipo de teste") {
                    input.classList.add('clickable-input');
                    input.addEventListener('click', function () {
                        openSwalForColumnTipoTeste(this);
                    });
                } else if (titulos[j] === "Teste de campo") {
                    input.classList.add('clickable-input');
                    input.addEventListener('click', function () {
                        openSwalForColumnTesteCampo(this);
                    });
                }

                cell.appendChild(input);
            }
        }
        newRow.cells[11].querySelector("input").value = "Pendente";
    }
}

function apagarLinha() {
    var tabela = document.getElementById("tabela");

    if (tabela.rows.length > 2) {
        tabela.deleteRow(tabela.rows.length - 1);
    } else {
        Swal.fire({
            icon: 'warning',
            html: "Não é possível excluir a última linha.",
            confirmButtonText: 'OK',
            confirmButtonColor: "#FF8C00",
        });
    }
}

function adicionarColuna() {
    var tabela = document.getElementById("tabela");

    if (!tabela) {
        Swal.fire({
            icon: 'info',
            title: 'Nenhuma tabela encontrada',
            text: 'Não há nenhuma tabela disponível para adicionar colune.',
            confirmButtonColor: "#3085d6",
        });
        return;
    }

    Swal.fire({
        icon: 'question',
        html: '<b style="color: #fff">Digite o índice da nova coluna (começando de 0)</b>',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },

        showCancelButton: true,
        confirmButtonText: 'Adicionar',
        confirmButtonColor: "#1589FF",
        cancelButtonText: 'Cancelar',
        showLoaderOnConfirm: true,
        preConfirm: (novoIndice) => {
            novoIndice = parseInt(novoIndice);
            if (isNaN(novoIndice) || novoIndice < 0 || novoIndice > tabela.rows[0].cells.length) {
                Swal.showValidationMessage('Índice inválido. A nova coluna será adicionada no final.');
                novoIndice = tabela.rows[0].cells.length;
            }
            return novoIndice;
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.value !== undefined) {
            novoIndice = result.value;

            Swal.fire({
                icon: 'question',
                html: '<b style="color: #fff">Digite o título da nova coluna</b>',
                input: 'text',
                inputAttributes: {
                    autocapitalize: 'off'
                },
                showCancelButton: true,
                confirmButtonText: 'Adicionar',
                confirmButtonColor: "#1589FF",
                cancelButtonText: 'Cancelar',
                showLoaderOnConfirm: true,
                preConfirm: (novoTitulo) => {
                    return novoTitulo;
                },
                allowOutsideClick: () => !Swal.isLoading()
            }).then((result) => {
                if (result.value !== undefined) {
                    novoTitulo = result.value;

                    if (isNaN(novoIndice) || novoIndice < 0 || novoIndice > tabela.rows[0].cells.length) {
                        Swal.fire({
                            icon: 'error',
                            title: 'Erro',
                            text: 'Índice inválido. A nova coluna será adicionada no final.'
                        });
                        return;
                    }

                    var th = document.createElement("th");
                    th.textContent = novoTitulo;
                    tabela.rows[0].insertBefore(th, tabela.rows[0].cells[novoIndice]);

                    th.setAttribute("onclick", "ordenarColuna(" + novoIndice + ")");
                    th.setAttribute("oncontextmenu", "excluirColuna(event, " + novoIndice + "); return false;");
                    th.setAttribute("ondblclick", "inserirColuna(" + novoIndice + ")");

                    for (var i = 1; i < tabela.rows.length; i++) {
                        var cell = tabela.rows[i].insertCell(novoIndice);
                        var input = document.createElement("input");
                        input.type = "text";
                        input.value = "";
                        cell.appendChild(input);
                    }
                }
            });
        }
    });
}

function adicionarColunaFeature() {
    var tabela = document.getElementById("tabela");

    // Verifique se a tabela existe
    if (!tabela) {
        Swal.fire({
            icon: 'info',
            title: 'Nenhuma tabela encontrada',
            text: 'Por favor, adicione uma tabela antes de adicionar uma coluna de features.',
            confirmButtonColor: "#3085d6",
        });
        return; // Impede a continuação da função
    }

    // Verifique se a coluna "Feature" já existe
    var headerRow = tabela.rows[0];
    for (var i = 0; i < headerRow.cells.length; i++) {
        if (headerRow.cells[i].textContent.trim().toLowerCase() === "feature") {
            Swal.fire({
                icon: 'info',
                title: 'Coluna já existente',
                text: 'A coluna "Feature" já foi adicionada.',
                confirmButtonColor: "#3085d6",
            });
            return; // Impede a continuação da função
        }
    }

    // Adicionar a nova coluna "Feature"
    var th = document.createElement("th");
    th.textContent = "Feature";
    headerRow.appendChild(th);

    for (var i = 1; i < tabela.rows.length; i++) {
        var cell = tabela.rows[i].insertCell(tabela.rows[i].cells.length);
        var radioInput = document.createElement("input");
        radioInput.type = "radio";
        radioInput.name = "featureRadio" + i;
        cell.appendChild(radioInput);
    }

    Swal.fire({
        icon: 'info',
        html: "<b style='color: #fff;'>Selecione os itens desejados e clique no botão Baixar</b>",
        confirmButtonText: 'OK',
        confirmButtonColor: "#1589FF",
    });
}

function baixarSelecionados() {
    var tabela = document.getElementById("tabela");
    var radiosSelecionados = document.querySelectorAll('input[type="radio"]:checked');

    if (radiosSelecionados.length === 0) {
        Swal.fire({
            icon: 'warning',
            html: "<b style='color: #fff;'>Por favor, selecione pelo menos um item</b>",
            confirmButtonText: 'OK',
            confirmButtonColor: "#FF8C00",
        });
        return;
    }

    radiosSelecionados.forEach(function (radio) {
        gerarArquivoFeature(radio);
    });
}

function gerarNumerosAleatoriosComoString(min, max) {
    let numerosAleatoriosString = '';

    for (let i = 0; i < 6; i++) {
        const numeroAleatorio = Math.floor(Math.random() * (max - min + 1)) + min;
        numerosAleatoriosString += numeroAleatorio.toString();
    }

    return numerosAleatoriosString;
}

function gerarArquivoFeature(radio) {
    var tabela = document.getElementById("tabela");
    var rowIndex = radio.parentElement.parentElement.rowIndex;
    var row = tabela.rows[rowIndex];
    var headerRow = tabela.rows[0];
    var featureContent = "";

    featureContent += "Feature: " + row.cells[1].querySelector("input").value + "\n\n";
    featureContent += "Scenario: CT" + gerarNumerosAleatoriosComoString(0, 9) + "\n";
    var scenarioName = row.cells[1].querySelector("input").value;
    var ctNumber = row.cells[0].textContent;

    for (var j = 4; j < headerRow.cells.length; j++) {
        var cellContent = headerRow.cells[j].textContent.toLowerCase().trim();
        if (cellContent === "aplicação" || cellContent === "história" || cellContent === "tipo de teste" || cellContent === "status" || cellContent === "feature") {
            continue;
        }

        featureContent += cellContent + " " + row.cells[j].querySelector("input").value + "\n";
    }

    var blob = new Blob([featureContent], { type: "text/plain;charset=utf-8" });
    var fileName = ctNumber + "_" + scenarioName + rowIndex + ".feature";
    var link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;

    document.body.appendChild(link);
    link.click();

    document.body.removeChild(link);
}

function ordenarColuna(colIndex) {
    var tabela = document.getElementById("tabela");
    var switching = true;
    var shouldSwitch;
    var dragStartIndex;

    for (var i = 0; i < tabela.rows[0].cells.length; i++) {
        tabela.rows[0].cells[i].draggable = true;
        tabela.rows[0].cells[i].addEventListener("dragstart", function (e) {
            dragStartIndex = Array.from(tabela.rows[0].cells).indexOf(e.target);
        });
        tabela.rows[0].cells[i].addEventListener("dragover", function (e) {
            e.preventDefault();
        });
        tabela.rows[0].cells[i].addEventListener("drop", function (e) {
            var dropIndex = Array.from(tabela.rows[0].cells).indexOf(e.target);

            if (dragStartIndex !== dropIndex) {
                moverColuna(dragStartIndex, dropIndex);
            }
        });
    }

    while (switching) {
        switching = false;
        var rows = tabela.rows;

        for (var i = 1; i < rows.length - 1; i++) {
            shouldSwitch = false;
            var x = rows[i].cells[colIndex].textContent.toLowerCase();
            var y = rows[i + 1].cells[colIndex].textContent.toLowerCase();

            if (x > y) {
                shouldSwitch = true;
                break;
            }
        }
        if (shouldSwitch) {
            rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
            switching = true;
        }
    }
}

function moverColuna(startIndex, dropIndex) {
    var tabela = document.getElementById("tabela");
    var rows = tabela.rows;

    for (var i = 0; i < rows.length; i++) {
        var tempCell = rows[i].cells[startIndex].cloneNode(true);
        var targetCell = rows[i].cells[dropIndex];

        rows[i].deleteCell(startIndex);

        if (startIndex < dropIndex) {
            targetCell.parentNode.insertBefore(tempCell, targetCell.nextSibling);
        } else {
            targetCell.parentNode.insertBefore(tempCell, targetCell);
        }
    }
}

function excluirColuna(event, colIndex) {
    event.preventDefault();
    var tabela = document.getElementById("tabela");
    var rows = tabela.rows;

    for (var i = 0; i < rows.length; i++) {
        rows[i].deleteCell(colIndex);
    }
}

function inserirColuna(colIndex) {
    var tabela = document.getElementById("tabela");

    Swal.fire({
        title: 'Digite o título da nova coluna:',
        input: 'text',
        inputAttributes: {
            autocapitalize: 'off'
        },
        showCancelButton: true,
        confirmButtonText: 'Inserir',
        confirmButtonColor: "#1589FF",
        cancelButtonText: 'Cancelar',
        showLoaderOnConfirm: true,
        preConfirm: (novoTitulo) => {
            return novoTitulo;
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.value !== undefined) {
            novoTitulo = result.value;

            var th = tabela.rows[0].insertCell(colIndex + 1);
            th.textContent = novoTitulo;
            th.setAttribute("onclick", "ordenarColuna(" + (colIndex + 1) + ")");
            th.setAttribute("oncontextmenu", "excluirColuna(event, " + (colIndex + 1) + "); return false;");
            th.setAttribute("ondblclick", "inserirColuna(" + (colIndex + 1) + ")");

            for (var i = 1; i < tabela.rows.length; i++) {
                var cell = tabela.rows[i].insertCell(colIndex + 1);
                var input = document.createElement("input");
                input.type = "text";
                input.value = "";
                cell.appendChild(input);
            }
        }
    });
}

async function baixarExcel() {
    var tabela = document.getElementById("tabela");

    if (!tabela || tabela.rows.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Nenhuma tabela encontrada',
            text: 'Não há nenhuma tabela disponível para exportação.',
            confirmButtonColor: '#0d6efd',
            confirmButtonText: 'OK'
        });
        return;
    }

    var data = [];
    for (var i = 0; i < tabela.rows.length; i++) {
        var rowData = [];
        for (var j = 0; j < tabela.rows[i].cells.length; j++) {
            var input = tabela.rows[i].cells[j].querySelector("input");
            rowData.push(input ? input.value : tabela.rows[i].cells[j].innerHTML);
        }
        data.push(rowData);
    }

    const { value: exportFormat } = await Swal.fire({
        title: 'Escolha um formato de exportação',
        input: 'select',
        inputOptions: {
            'excel': 'Excel',
            'json': 'JSON',
            'xml': 'XML',
            'yaml': 'YAML'
        },
        inputPlaceholder: 'Selecione um formato',
        showCancelButton: true,
        confirmButtonText: 'Exportar',
        confirmButtonColor: '#006400',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) {
                return 'Você precisa escolher um formato!';
            }
        }
    });

    if (exportFormat) {
        if (exportFormat === 'excel') {
            const { value: fileName } = await Swal.fire({
                title: 'Digite o nome do arquivo',
                input: 'text',
                inputPlaceholder: 'nome do arquivo...',
                confirmButtonText: 'Baixar',
                confirmButtonColor: '#006400',
                showCancelButton: true,
                cancelButtonText: 'Cancelar',
                inputValidator: (value) => {
                    if (!value) {
                        return 'Por favor, preencha o nome do arquivo!';
                    }
                }
            });

            if (fileName) {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.onmouseenter = Swal.stopTimer;
                        toast.onmouseleave = Swal.resumeTimer;
                    }
                });
                Toast.fire({
                    icon: 'success',
                    title: `Excel baixado com sucesso: ${fileName}`
                });

                var wb = XLSX.utils.book_new();
                var ws = XLSX.utils.aoa_to_sheet(data);
                XLSX.utils.book_append_sheet(wb, ws, "Tabela");
                XLSX.writeFile(wb, fileName + ".xlsx");
            } else {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'top-end',
                    showConfirmButton: false,
                    timer: 3000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.onmouseenter = Swal.stopTimer;
                        toast.onmouseleave = Swal.resumeTimer;
                    }
                });
                Toast.fire({
                    icon: 'info',
                    title: 'Operação cancelada!'
                });
            }
        } else if (exportFormat === 'json') {
            const jsonContent = JSON.stringify(data, null, 2);
            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8' });
            saveAs(blob, 'data.json');
        } else if (exportFormat === 'xml') {
            const xmlContent = convertToXML(data);
            const blob = new Blob([xmlContent], { type: 'application/xml;charset=utf-8' });
            saveAs(blob, 'data.xml');
        } else if (exportFormat === 'yaml') {
            const yamlContent = jsyaml.dump(data);
            const blob = new Blob([yamlContent], { type: 'application/x-yaml;charset=utf-8' });
            saveAs(blob, 'data.yaml');
        }
    }
}

function convertToXML(data) {
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n';
    data.forEach(row => {
        xml += '  <row>\n';
        row.forEach(cell => {
            xml += `    <cell>${cell}</cell>\n`;
        });
        xml += '  </row>\n';
    });
    xml += '</data>';
    return xml;
}

function openEmailClient(senderEmail, recipientEmail) {
    var subject = encodeURIComponent('BDD');
    var body = encodeURIComponent('Prezado [Nome do Destinatário],\n\nEstou enviando este e-mail para fornecer o arquivo solicitado discutido durante nossa última conversa. O arquivo anexo contém o BDD. Por favor, revise o arquivo e sinta-se à vontade para entrar em contato caso tenha alguma dúvida ou se precisar de informações adicionais. Estou à disposição para discutir qualquer ponto que você considere relevante.\n\nAgradeço antecipadamente pelo seu tempo e colaboração.\n\nAtenciosamente.');
    var mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}&cc=${senderEmail}`;

    window.location.href = mailtoLink;
}

async function abrirModalEmail() {
    const { value: recipientEmail, isConfirmed } = await Swal.fire({
        text: "Digite o endereço de e-mail do destinatário",
        input: "email",
        inputPlaceholder: "destinatario@example.com",
        confirmButtonText: "Próximo",
        confirmButtonColor: "#1589FF",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        inputValidator: (value) => {
            if (!value) {
                return 'Por favor, preencha o endereço de e-mail do destinatário!';
            }
        }
    });

    if (isConfirmed && recipientEmail) {
        const { value: senderEmail } = await Swal.fire({
            text: "E-mail Cc: com cópia",
            input: "email",
            inputPlaceholder: "seuemail@example.com",
            confirmButtonText: "Enviar",
            confirmButtonColor: "#1589FF",
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            inputValidator: (value) => {
                if (!value) {
                    return 'Por favor, preencha seu endereço de e-mail!';
                }
            }
        });

        if (recipientEmail) {
            openEmailClient(recipientEmail, senderEmail);
        }
    }
}

document.addEventListener('DOMContentLoaded', function () {
    var suggestionList = [
        "ok",
        "bug",
        "Pendente",
        "desplanejado",
        "progredindo",
        "manual",
        "automatizado",
    ];

    var activeInput = null;
    var dropdown;

    document.addEventListener('click', function (event) {
        var target = event.target;

        if (target.tagName === 'INPUT' && target.type === 'text') {
            if (target !== activeInput) {
                activeInput = target;
                removeDropdowns();
            }
        } else {
            removeDropdowns();
            activeInput = null;
        }
    });

    document.addEventListener('input', function (event) {
        var target = event.target;

        if (target.tagName === 'INPUT' && target.type === 'text' && target === activeInput) {
            var searchText = target.value.toLowerCase();
            var filteredSuggestions = suggestionList.filter(function (suggestion) {
                return suggestion.toLowerCase().includes(searchText);
            });

            removeDropdowns();

            if (filteredSuggestions.length > 0) {
                dropdown = createDropdown(target, filteredSuggestions);
                document.body.appendChild(dropdown);
                positionDropdown(target, dropdown);

                dropdown.addEventListener('click', function (e) {
                    if (e.target.tagName === 'LI') {
                        target.value = e.target.textContent;
                        removeDropdowns();
                    }
                });
            }

            if (searchText.includes('bug')) {
                Swal.fire({
                    title: 'Adicionar informações de Bug',
                    width: '80%',
                    html: `
                    <div style="max-height: 400px; overflow-y: auto;">
                        <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
            
                            <div style="flex: 1 1 45%; min-width: 200px; max-width: 45%;">
                                <label for="bugNumber" style="margin-bottom: 5px; color: white;"><i class="fa-solid fa-bugs"></i> Número do Bug</label>
                                <input type="text" id="bugNumber" class="swal2-input" placeholder="INC00000000" style="width: 100%;">
                            </div>
            
                            <div style="flex: 1 1 45%; min-width: 200px; max-width: 45%;">
                                <label for="aplicacaoName" style="margin-bottom: 5px; color: white;"><i class="fa-solid fa-globe"></i> Nome da Aplicação</label>
                                <input type="text" id="aplicacaoName" class="swal2-input" placeholder="aplicação..." style="width: 100%;">
                            </div>
            
                            <div style="flex: 1 1 45%; min-width: 200px; max-width: 45%;">
                                <label for="torreName" style="margin-bottom: 5px; color: white;"><i class="fa-solid fa-circle-info"></i> Descrição resumida</label>
                                <input type="text" id="torreName" class="swal2-input" placeholder="descrição resumida..." style="width: 100%;">
                            </div>
            
                            <div style="flex: 1 1 45%; min-width: 200px; max-width: 45%;">
                                <label for="abertoPor" style="margin-bottom: 5px; color: white;"><i class="fa-solid fa-user"></i> Aberto por</label>
                                <input type="text" id="abertoPor" class="swal2-input" placeholder="aberto por..." style="width: 100%;">
                            </div>
            
                            <div style="flex: 1 1 45%; min-width: 200px; max-width: 45%;">
                                <label for="tipo" style="margin-bottom: 5px; color: white;"><i class="fa-solid fa-list"></i> Tipo</label>
                                <input type="text" id="tipo" class="swal2-input" placeholder="tipo..." style="width: 100%;">
                            </div>
            
                            <div style="flex: 1 1 45%; min-width: 200px; max-width: 45%;">
                                <label for="categoria" style="margin-bottom: 5px; color: white;"><i class="fa-solid fa-tags"></i> Categoria</label>
                                <input type="text" id="categoria" class="swal2-input" placeholder="categoria..." style="width: 100%;">
                            </div>
            
                            <div style="flex: 1 1 45%; min-width: 200px; max-width: 45%;">
                                <label for="ambiente" style="margin-bottom: 5px; color: white;"><i class="fa-solid fa-cloud"></i> Ambiente</label>
                                <input type="text" id="ambiente" class="swal2-input" placeholder="ambiente..." style="width: 100%;">
                            </div>
            
                            <div style="flex: 1 1 45%; min-width: 200px; max-width: 45%;">
                                <label for="servico" style="margin-bottom: 5px; color: white;"><i class="fa-solid fa-cogs"></i> Serviço</label>
                                <input type="text" id="servico" class="swal2-input" placeholder="serviço..." style="width: 100%;">
                            </div>
            
                            <div style="flex: 1 1 45%; min-width: 200px; max-width: 45%;">
                                <label for="estado" style="margin-bottom: 5px; color: white;"><i class="fa-solid fa-clipboard-check"></i> Estado</label>
                                <input type="text" id="estado" class="swal2-input" placeholder="estado..." style="width: 100%;">
                            </div>
            
                            <div style="flex: 1 1 45%; min-width: 200px; max-width: 45%;">
                                <label for="impacto" style="margin-bottom: 5px; color: white;"><i class="fa-solid fa-exclamation-triangle"></i> Impacto</label>
                                <input type="text" id="impacto" class="swal2-input" placeholder="impacto..." style="width: 100%;">
                            </div>
            
                            <div style="flex: 1 1 45%; min-width: 200px; max-width: 45%;">
                                <label for="urgencia" style="margin-bottom: 5px; color: white;"><i class="fa-solid fa-bolt"></i> Urgência</label>
                                <input type="text" id="urgencia" class="swal2-input" placeholder="urgência..." style="width: 100%;">
                            </div>
            
                            <div style="flex: 1 1 45%; min-width: 200px; max-width: 45%;">
                                <label for="prioridade" style="margin-bottom: 5px; color: white;"><i class="fa-solid fa-arrow-up"></i> Prioridade</label>
                                <input type="text" id="prioridade" class="swal2-input" placeholder="prioridade..." style="width: 100%;">
                            </div>
            
                            <div style="flex: 1 1 45%; min-width: 200px; max-width: 45%;">
                                <label for="grupoAtribuicao" style="margin-bottom: 5px; color: white;"><i class="fa-solid fa-users"></i> Grupo de Atribuição</label>
                                <input type="text" id="grupoAtribuicao" class="swal2-input" placeholder="grupo de atribuição..." style="width: 100%;">
                            </div>
            
                            <div style="flex: 1 1 45%; min-width: 200px; max-width: 45%;">
                                <label for="criadoEm" style="margin-bottom: 5px; color: white;"><i class="fa-solid fa-calendar"></i> Criado em</label>
                                <input type="date" id="criadoEm" class="swal2-input" style="width: 100%;">
                            </div>
            
                        </div>
                    </div>
                `,
                    customClass: {
                        content: 'custom-swal-content',
                    },
                    didOpen: () => {
                        document.querySelector('.swal2-content').style.color = 'white';
                    },
                    showCancelButton: true,
                    confirmButtonText: 'Adicionar',
                    confirmButtonColor: "#1589FF",
                    cancelButtonText: 'Cancelar',
                    showLoaderOnConfirm: true,
                    preConfirm: () => {
                        var bugNumber = document.getElementById('bugNumber').value.trim();
                        var aplicacaoName = document.getElementById('aplicacaoName').value.trim();
                        var torreName = document.getElementById('torreName').value.trim();
                        var abertoPor = document.getElementById('abertoPor').value.trim();
                        var tipo = document.getElementById('tipo').value.trim();
                        var categoria = document.getElementById('categoria').value.trim();
                        var ambiente = document.getElementById('ambiente').value.trim();
                        var servico = document.getElementById('servico').value.trim();
                        var estado = document.getElementById('estado').value.trim();
                        var impacto = document.getElementById('impacto').value.trim();
                        var urgencia = document.getElementById('urgencia').value.trim();
                        var prioridade = document.getElementById('prioridade').value.trim();
                        var grupoAtribuicao = document.getElementById('grupoAtribuicao').value.trim();
                        var criadoEm = document.getElementById('criadoEm').value.trim();

                        if (!bugNumber || !aplicacaoName || !torreName || !abertoPor || !tipo || !categoria || !ambiente || !servico || !estado || !impacto || !urgencia || !prioridade || !grupoAtribuicao || !criadoEm) {
                            Swal.showValidationMessage('Por favor, preencha todos os campos.');
                            return false;
                        }

                        target.value = `bug nº ${bugNumber}, Aplicação: ${aplicacaoName}, Descrição: ${torreName}, Aberto por: ${abertoPor}, Tipo: ${tipo}, Categoria: ${categoria}, Ambiente: ${ambiente}, Serviço: ${servico}, Estado: ${estado}, Impacto: ${impacto}, Urgência: ${urgencia}, Prioridade: ${prioridade}, Grupo de Atribuição: ${grupoAtribuicao}, Criado em: ${criadoEm}`;
                    },
                    allowOutsideClick: () => !Swal.isLoading()
                });
            }
        }
    });
});

function removeDropdowns() {
    var existingDropdowns = document.querySelectorAll('.autocomplete-dropdown');
    existingDropdowns.forEach(function (dropdown) {
        dropdown.parentNode.removeChild(dropdown);
    });
}

function createDropdown(target, suggestions) {
    var dropdown = document.createElement('ul');
    dropdown.className = 'autocomplete-dropdown';

    suggestions.forEach(function (suggestion) {
        var listItem = document.createElement('li');
        listItem.textContent = suggestion;
        dropdown.appendChild(listItem);
    });

    return dropdown;
}

function positionDropdown(target, dropdown) {
    var rect = target.getBoundingClientRect();

    dropdown.style.position = 'absolute';
    dropdown.style.left = (rect.left - 30) + 'px';
    dropdown.style.width = (target.offsetWidth - 500) + 'px';
    dropdown.style.top = (rect.bottom + window.scrollY) + 'px';

    dropdown.style.overflowY = 'auto';
    dropdown.style.maxHeight = '200px';

    dropdown.style.overflowX = 'auto';
    dropdown.style.maxWidth = '800px';
}

function copiarParaTodos() {
    var tabela = document.getElementById("tabela");

    if (!tabela) {
        Swal.fire({
            icon: 'info',
            title: 'Nenhuma tabela encontrada',
            text: 'Por favor, adicione uma tabela antes de copiar valores.',
            confirmButtonColor: "#3085d6",
        });
    }

    Swal.fire({
        title: 'Escolha a coluna e o intervalo de linhas',
        html: `
        <b>Escolha a coluna e o intervalo de linhas</b><br>
        <div class="mb-3">
            <label for="colIndex" style="color: white;" class="form-label"><i class="fa-solid fa-list-ul"></i> Índice da Coluna</label>
            <input type="text" id="colIndex" class="form-control swal2-input" placeholder="0">
        </div>
        <div class="mb-3">
            <label for="rowRange" style="color: white;" class="form-label"><i class="fa-solid fa-arrow-down-up-across-line"></i> Intervalo de Linhas</label>
            <input type="text" id="rowRange" class="form-control swal2-input" placeholder="1 a ${tabela.rows.length - 1}">
        </div>
        <div class="mb-3">
            <label for="textToInsert" style="color: white;" class="form-label"><i class="fa-solid fa-signature"></i> Texto a ser inserido</label>
            <input type="text" id="textToInsert" class="form-control swal2-input" placeholder="Texto">
        </div>
    `,
        customClass: {
            content: 'custom-swal-content',
            input: 'custom-swal-input'
        },
        didOpen: () => {
            document.querySelector('.swal2-content').style.color = 'white';
            // Adiciona mais estilo personalizado
            document.querySelector('.swal2-input').style.borderRadius = '10px';
        },
        showCancelButton: true,
        confirmButtonText: 'Copiar',
        confirmButtonColor: "#1589FF",
        cancelButtonText: 'Cancelar',
        showLoaderOnConfirm: true,
        preConfirm: () => {
            var colIndex = parseInt(document.getElementById('colIndex').value);
            var rowRange = document.getElementById('rowRange').value.trim();
            var textToInsert = document.getElementById('textToInsert').value.trim();

            if (isNaN(colIndex) || colIndex < 0 || colIndex >= tabela.rows[0].cells.length) {
                Swal.showValidationMessage('Índice da coluna inválido.');
                return false;
            }

            var rowRangeMatch = rowRange.match(/^(\d+)\s*a\s*(\d+)$/);
            if (!rowRangeMatch) {
                Swal.showValidationMessage('Formato inválido para o intervalo de linhas. Use o formato: "1 a ' + (tabela.rows.length - 1) + '".');
                return false;
            }

            var startRow = parseInt(rowRangeMatch[1]);
            var endRow = parseInt(rowRangeMatch[2]);

            if (isNaN(startRow) || isNaN(endRow) || startRow < 1 || endRow >= tabela.rows.length || endRow < startRow) {
                Swal.showValidationMessage('Intervalo de linhas inválido.');
                return false;
            }

            return { colIndex, startRow, endRow, textToInsert };
        },
        allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
        if (result.value) {
            var { colIndex, startRow, endRow, textToInsert } = result.value;

            for (var i = startRow; i <= endRow; i++) {
                tabela.rows[i].cells[colIndex].querySelector("input").value = textToInsert;
            }
        }
    });
}

function filtrarPorCT() {
    var tabela = document.getElementById("tabela");
    var filtroInput = document.getElementById("filtroCT");
    var filtroValor = filtroInput.value.trim().toLowerCase();

    if (filtroValor === "") {
        Swal.fire({
            icon: 'warning',
            text: 'Por favor insira um valor antes de pesquisar.',
            confirmButtonText: 'OK',
            confirmButtonColor: "#FF8C00",
        });
        return;
    }

    for (var i = 1; i < tabela.rows.length; i++) {
        var ctCelula = tabela.rows[i].cells[0];
        var ctNumero = ctCelula.textContent.toLowerCase();

        if (ctNumero.includes(filtroValor)) {
            tabela.rows[i].classList.add("filtrado");
        } else {
            tabela.rows[i].classList.remove("filtrado");
        }
    }

    var primeiraLinhaFiltrada = tabela.querySelector(".filtrado");
    if (primeiraLinhaFiltrada) {
        primeiraLinhaFiltrada.scrollIntoView({ behavior: "smooth" });

        setTimeout(function () {
            primeiraLinhaFiltrada.classList.remove("filtrado");
        }, 3000);
    }
}

function contarOcorrencias(data, palavraChave) {
    var count = 0;
    for (var i = 0; i < data.length; i++) {

        var palavras = data[i].toLowerCase().split(/\s+/);
        if (palavras.includes(palavraChave.toLowerCase())) {
            count++;
        }
    }
    return count;
}

document.getElementById('dashboardButton').addEventListener('click', function () {
    var tabela = document.getElementById('tabela');

    if (!tabela) {
        Swal.fire({
            title: 'Nenhuma tabela encontrada',
            html: '<p style="color: #fff; font-size: 11px;">Para gerar o dashboard, você precisa importar uma tabela. Deseja importar uma agora?</p>',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Importar Tabela',
            cancelButtonText: 'Cancelar',
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33'
        }).then((result) => {
            if (result.isConfirmed) {
                const importInput = document.getElementById('importExcel');
                importInput.click();

                importInput.addEventListener('change', function () {
                    if (importInput.files.length > 0) {
                        setTimeout(function () {
                            document.getElementById('toggleButton').click();
                        }, 2000);
                    } else {
                        Swal.fire({
                            title: 'Nenhum arquivo selecionado',
                            text: 'Você precisa selecionar um arquivo para importar a tabela.',
                            icon: 'error',
                            confirmButtonText: 'OK'
                        });
                    }
                }, { once: true });
            } else if (result.dismiss === Swal.DismissReason.cancel) {
                // Simula o clique no botão de fechar do modal
                document.querySelector('.modal .close').click();
            }
        });
    } else {
        gerarDashboard();
    }
});

function gerarDashboard() {
    var tabela = document.getElementById("tabela");
    var data = [];
    var colunaIndex = 11;

    for (var i = 1; i < tabela.rows.length; i++) {
        var input = tabela.rows[i].cells[colunaIndex].querySelector("input");
        if (input) {
            data.push(input.value.toLowerCase());
        }
    }

    criarDashboard(data);

    var { numeroLinhas, numeroOK, numeroNOK, numeroDesplanejado, numeroProgredindo, numeroBug } = contarNumeros();
    var porcentagemOK = (numeroOK / numeroLinhas) * 100;

    var dataAtual = new Date();
    var dia = String(dataAtual.getDate()).padStart(2, '0');
    var mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    var ano = dataAtual.getFullYear();
    var horas = String(dataAtual.getHours()).padStart(2, '0');
    var minutos = String(dataAtual.getMinutes()).padStart(2, '0');
    var dataFormatada = dia + '/' + mes + '/' + ano + ' ' + horas + ':' + minutos;

    document.getElementById("porcentagemOK").innerHTML =
        "<h5>Resumo do BDD - " + dataFormatada + "</h5>" +
        "<p><span class='label'>Número de Linhas BDD:</span> " + numeroLinhas + "</p>" +
        "<p><span class='label'>Nº Ok:</span> " + numeroOK + "</p>" +
        "<p><span class='label'>Nº Pendente:</span> " + numeroNOK + "</p>" +
        "<p><span class='label'>Nº Desplanejado:</span> " + numeroDesplanejado + "</p>" +
        "<p><span class='label'>Nº Progredindo:</span> " + numeroProgredindo + "</p>" +
        "<p><span class='label'>Nº Bug:</span> " + numeroBug + "</p>" +
        "<p><span class='label'>Porcentagem:</span> " + porcentagemOK.toFixed(2) + "%</p>";

    var progressBar = document.getElementById("progressBar");
    progressBar.style.width = porcentagemOK + "%";
    progressBar.setAttribute("aria-valuenow", porcentagemOK);

    progressBar.innerHTML = "<span>" + porcentagemOK.toFixed(2) + "%</span>";

    var showBugScenariosBtn = document.getElementById("showBugScenariosBtn");
    showBugScenariosBtn.addEventListener("click", function () {
        mostrarCenariosBug();
    });

    var modalInstance = new bootstrap.Modal(document.getElementById("myModal"));
    modalInstance.show();
}

function mostrarCenariosBug() {
    var tabela = document.getElementById("tabela");
    var colunaIndex = 11;
    var modalBody = document.getElementById("modalBody");
    var colunasIgnoradas = ["Contexto", "Funcionalidade", "Dado", "E", "Quando", "Então", "Aplicação", "História", "Tipo de teste"];
    var cenariosBug = [];

    modalBody.innerHTML = "";

    for (var i = 1; i < tabela.rows.length; i++) {
        var input = tabela.rows[i].cells[colunaIndex].querySelector("input");

        if (input && input.value.toLowerCase().includes("bug")) {
            var cenario = {
                nome: tabela.rows[i].cells[0].textContent,
                dados: []
            };

            for (var j = 1; j < tabela.rows[i].cells.length; j++) {
                if (!colunasIgnoradas.includes(tabela.rows[0].cells[j].textContent)) {
                    var cellValue = tabela.rows[i].cells[j].querySelector("input")
                        ? tabela.rows[i].cells[j].querySelector("input").value
                        : tabela.rows[i].cells[j].textContent;

                    cenario.dados.push(cellValue);
                }
            }

            cenariosBug.push(cenario);
        }
    }

    if (cenariosBug.length === 0) {
        Swal.fire({
            icon: 'info',
            title: 'Nenhum cenário com bug encontrado',
            text: 'Não há nenhum cenário na tabela com o status "bug".',
            confirmButtonColor: "#3085d6",
        });
    } else {
        cenariosBug.forEach(function (cenario) {
            var cenarioElement = document.createElement("p");
            cenarioElement.textContent = cenario.nome + " " + cenario.dados.join(" ");
            modalBody.appendChild(cenarioElement);
        });

        var modalInstance = new bootstrap.Modal(document.getElementById("myModal"));
        modalInstance.show();
    }

    return cenariosBug;
}

function contarNumeros() {
    var tabela = document.getElementById("tabela");
    var numeroLinhas = tabela.rows.length - 1;
    var numeroOK = 0;
    var numeroNOK = 0;
    var numeroDesplanejado = 0;
    var numeroProgredindo = 0;
    var numeroBug = 0;
    var colunaIndex = 11;

    for (var i = 1; i < tabela.rows.length; i++) {
        var input = tabela.rows[i].cells[colunaIndex].querySelector("input");
        if (input) {
            var valor = input.value.toLowerCase();

            if (valor.includes("bug")) {
                var bugMatch = valor.match(/bug\s*\d*\s*([^\s]*)/);

                if (bugMatch) {
                    var additionalInfo = bugMatch[1];
                }

                numeroBug++;
            } else if (valor === "ok") {
                numeroOK++;
            } else if (valor === "Pendente") {
                numeroNOK++;
            } else if (valor === "desplanejado") {
                numeroDesplanejado++;
            } else if (valor === "progredindo") {
                numeroProgredindo++;
            }
        }
    }

    return {
        numeroLinhas,
        numeroOK,
        numeroNOK,
        numeroDesplanejado,
        numeroProgredindo,
        numeroBug
    };
}

var myChart;
var myPieChart;

function criarDashboard(data) {
    var ctx = document.getElementById("graficoModal").getContext("2d");
    var pieCtx = document.getElementById("graficoPizza").getContext("2d");

    if (myChart) {
        myChart.destroy();
    }
    if (myPieChart) {
        myPieChart.destroy();
    }

    var quantidadeOk = contarOcorrencias(data, "ok");
    var quantidadeNok = contarOcorrencias(data, "Pendente");
    var quantidadeDesplanejado = contarOcorrencias(data, "desplanejado");
    var quantidadeProgredindo = contarOcorrencias(data, "progredindo");
    var quantidadeBug = contarOcorrencias(data, "bug");

    var totalCenarios = data.length;
    var taxaCobertura = ((quantidadeOk + quantidadeNok + quantidadeBug) / totalCenarios) * 100;
    var taxaFalhas = (quantidadeNok / totalCenarios) * 100;
    var taxaBugs = (quantidadeBug / totalCenarios) * 100;

    var estimativaEntrega = {
        concluido: (quantidadeOk + quantidadeProgredindo) / totalCenarios * 100,
        restante: 100 - ((quantidadeOk + quantidadeProgredindo) / totalCenarios * 100)
    };

    var theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';

    var colors = {
        light: {
            backgroundColor: [
                'rgba(63, 191, 191, 1)',
                'rgba(249, 8, 8)',
                'rgba(255, 205, 86, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(146, 110, 244, 1)'
            ],
            borderColor: [
                'rgba(63, 191, 191, 1)',
                'rgba(249, 8, 8)',
                'rgba(255, 205, 86, 1)',
                'rgba(54, 162, 235, 1)',
                'rgba(146, 110, 244, 1)'
            ],
            tooltipBackgroundColor: 'rgba(0, 0, 0, 0.8)',
            textColor: '#333'
        },
        dark: {
            backgroundColor: [
                'rgba(63, 191, 191, 0.8)',
                'rgba(255, 79, 132, 0.8)',
                'rgba(255, 205, 86, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(146, 110, 244, 0.8)'
            ],
            borderColor: [
                'rgba(63, 191, 191, 0.8)',
                'rgba(255, 79, 132, 0.8)',
                'rgba(255, 205, 86, 0.8)',
                'rgba(54, 162, 235, 0.8)',
                'rgba(146, 110, 244, 0.8)'
            ],
            tooltipBackgroundColor: 'rgba(255, 255, 255, 0.8)',
            textColor: '#ddd'
        }
    };

    // Gráfico de Barras
    myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: [
                "Realizados",
                "Pendente",
                "Desplanejado",
                "Progredindo",
                "Bug"
            ],
            datasets: [
                {
                    label: "Quantidade",
                    data: [
                        quantidadeOk,
                        quantidadeNok,
                        quantidadeDesplanejado,
                        quantidadeProgredindo,
                        quantidadeBug
                    ],
                    backgroundColor: colors[theme].backgroundColor,
                    borderColor: colors[theme].borderColor,
                    borderWidth: 3,
                    hoverBorderWidth: 6,
                    hoverBorderColor: 'rgba(0,0,0,0.9)',
                    borderRadius: 10,
                    barPercentage: 0.6,
                    tension: 0.4,
                    shadowOffsetX: 3,
                    shadowOffsetY: 3,
                    shadowBlur: 6,
                    shadowColor: 'rgba(0, 0, 0, 0.3)'
                },
                {
                    label: "Porcentagem (%)",
                    data: [
                        (quantidadeOk / totalCenarios) * 100,
                        (quantidadeNok / totalCenarios) * 100,
                        (quantidadeDesplanejado / totalCenarios) * 100,
                        (quantidadeProgredindo / totalCenarios) * 100,
                        (quantidadeBug / totalCenarios) * 100
                    ],
                    type: 'line',
                    borderColor: 'rgba(231, 76, 60, 1)',
                    backgroundColor: 'rgba(200, 200, 200, 0.4)',
                    fill: true,
                    yAxisID: 'y1',
                    pointBackgroundColor: 'rgba(231, 76, 60, 1)',
                    pointBorderColor: '#fff',
                    pointHoverRadius: 12,
                    pointRadius: 10,
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(231, 76, 60, 1)',
                    tension: 0.5,
                    borderDash: [8, 4]
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Status dos Cenários',
                    font: {
                        size: 23,
                        weight: 'bold',
                        family: 'Poppins, sans-serif'
                    },
                    color: colors[theme].textColor,
                    padding: {
                        top: 30,
                        bottom: 30
                    }
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 18,
                            family: 'Poppins, sans-serif'
                        },
                        color: colors[theme].textColor,
                        boxWidth: 30,
                        padding: 30
                    }
                },
                tooltip: {
                    backgroundColor: colors[theme].tooltipBackgroundColor,
                    titleFont: {
                        size: 22,
                        family: 'Poppins, sans-serif'
                    },
                    bodyFont: {
                        size: 18,
                        family: 'Poppins, sans-serif'
                    },
                    padding: 25,
                    caretPadding: 25,
                    cornerRadius: 15,
                    boxPadding: 20,
                    multiKeyBackground: '#f3f3f3',
                    callbacks: {
                        label: function (context) {
                            return `${context.dataset.label}: ${context.raw.toFixed(2)}%`;
                        },
                        title: function (context) {
                            return `Status: ${context[0].label}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: colors[theme].textColor,
                        font: {
                            size: 18,
                            family: 'Poppins, sans-serif'
                        }
                    },
                    grid: {
                        color: colors[theme].textColor,
                        lineWidth: 1.5
                    },
                    title: {
                        display: true,
                        text: 'Quantidade',
                        color: colors[theme].textColor,
                        font: {
                            size: 22,
                            family: 'Poppins, sans-serif'
                        }
                    },
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    ticks: {
                        color: colors[theme].textColor,
                        font: {
                            size: 18,
                            family: 'Poppins, sans-serif'
                        },
                        callback: function (value) {
                            return value + '%';
                        }
                    },
                    grid: {
                        drawOnChartArea: false,
                    },
                    title: {
                        display: true,
                        text: 'Porcentagem (%)',
                        color: colors[theme].textColor,
                        font: {
                            size: 22,
                            family: 'Poppins, sans-serif'
                        }
                    },
                },
                x: {
                    ticks: {
                        color: colors[theme].textColor,
                        font: {
                            size: 18,
                            family: 'Poppins, sans-serif'
                        }
                    },
                    grid: {
                        color: colors[theme].textColor,
                        lineWidth: 1.5
                    }
                }
            },
            animation: {
                duration: 4000,
                easing: 'easeInOutExpo'
            }
        }
    });

    // Gráfico de Pizza
    myPieChart = new Chart(pieCtx, {
        type: 'pie',
        data: {
            labels: ['Concluído', 'Restante'],
            datasets: [{
                data: [estimativaEntrega.concluido, estimativaEntrega.restante],
                backgroundColor: ['rgba(78, 205, 196, 1)', 'rgb(249, 8, 8)'],
                hoverBackgroundColor: ['rgba(78, 205, 196, 0.8)', 'rgba(238, 12, 12, 0.8)'],
                borderWidth: 2,
                hoverBorderColor: 'rgba(0,0,0,0.9)',
                borderRadius: 5
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Estimativa de Entrega',
                    font: {
                        size: 23,
                        weight: 'bold',
                        family: 'Poppins, sans-serif'
                    },
                    color: colors[theme].textColor,
                    padding: {
                        top: 20,
                        bottom: 20
                    }
                },
                tooltip: {
                    backgroundColor: colors[theme].tooltipBackgroundColor,
                    titleFont: {
                        size: 20,
                        family: 'Poppins, sans-serif'
                    },
                    bodyFont: {
                        size: 16,
                        family: 'Poppins, sans-serif'
                    },
                    padding: 20,
                    caretPadding: 20,
                    cornerRadius: 15,
                    boxPadding: 20,
                    callbacks: {
                        label: function (context) {
                            return `${context.label}: ${context.raw.toFixed(2)}%`;
                        }
                    }
                },
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 16,
                            family: 'Poppins, sans-serif'
                        },
                        color: colors[theme].textColor,
                        boxWidth: 20,
                        padding: 15
                    }
                }
            },
            animation: {
                duration: 3000,
                easing: 'easeOutBounce'
            }
        }
    });

    atualizarResumoBDD(
        quantidadeOk,
        quantidadeNok,
        quantidadeDesplanejado,
        quantidadeProgredindo,
        quantidadeBug,
        taxaCobertura,
        taxaFalhas,
        taxaBugs
    );
    atualizarCards(quantidadeOk, quantidadeNok, quantidadeDesplanejado, quantidadeProgredindo, quantidadeBug);
}

function atualizarResumoBDD(quantidadeOk, quantidadeNok, quantidadeDesplanejado, quantidadeProgredindo, quantidadeBug, taxaCobertura, taxaFalhas, taxaBugs) {
    var resumoContainer = document.getElementById('resumoBDD');
    resumoContainer.innerHTML = `
        <div style="padding: 30px; border-radius: 20px; background-color: #f4f4f4; border: 1px solid #ddd; margin-top: 25px; box-shadow: 0 6px 25px rgba(0,0,0,0.15);">
            <div style="font-size: 28px; font-weight: bold; color: #333; font-family: 'Poppins', sans-serif;">Resumo do BDD - ${new Date().toLocaleString()}</div>
            <div style="margin-top: 20px;">
                <div style="margin-bottom: 20px; font-size: 20px; font-family: 'Poppins', sans-serif;">
                    <strong>Número de Linhas BDD: </strong>${quantidadeOk + quantidadeNok + quantidadeDesplanejado + quantidadeProgredindo + quantidadeBug}
                </div>
                ${renderResumoItem('Nº Cenários Feitos', quantidadeOk, quantidadeOk + quantidadeNok + quantidadeDesplanejado + quantidadeProgredindo + quantidadeBug, 'rgba(78, 205, 196, 1)')}
                ${renderResumoItem('Nº Cenários Pedentes', quantidadeNok, quantidadeOk + quantidadeNok + quantidadeDesplanejado + quantidadeProgredindo + quantidadeBug, 'rgba(255, 107, 107, 1)')}
                ${renderResumoItem('Nº Cenários Desplanejado', quantidadeDesplanejado, quantidadeOk + quantidadeNok + quantidadeDesplanejado + quantidadeProgredindo + quantidadeBug, 'rgba(255, 234, 167, 1)')}
                ${renderResumoItem('Nº Cenários em Progresso', quantidadeProgredindo, quantidadeOk + quantidadeNok + quantidadeDesplanejado + quantidadeProgredindo + quantidadeBug, 'rgba(116, 185, 255, 1)')}
                ${renderResumoItem('Nº Cenários com Bug', quantidadeBug, quantidadeOk + quantidadeNok + quantidadeDesplanejado + quantidadeProgredindo + quantidadeBug, 'rgba(162, 155, 254, 1)')}
                <div style="font-size: 22px; margin-top: 30px; font-family: 'Poppins', sans-serif;">
                    <strong>Taxa de Cobertura:</strong> ${taxaCobertura.toFixed(2)}%<br>
                </div>
            </div>
        </div>
    `;
}

function renderResumoItem(label, quantidade, total, color) {
    return `
        <div style="display: flex; align-items: center; margin-bottom: 20px;">
            <span style="width: 170px; display: inline-block; font-size: 20px; font-family: 'Poppins', sans-serif;">${label}:</span>
            <div style="width: 280px; height: 25px; background-color: rgba(200, 200, 200, 0.3); position: relative; border-radius: 15px; overflow: hidden; box-shadow: inset 0 6px 8px rgba(0, 0, 0, 0.1);">
                <div style="width: ${(quantidade / total) * 100}%; height: 100%; background-color: ${color}; border-radius: 15px;"></div>
            </div>
            <span style="margin-left: 15px; font-size: 20px; font-family: 'Poppins', sans-serif;">${quantidade}</span>
        </div>
    `;
}

function atualizarCards(quantidadeOk, quantidadeNok, quantidadeDesplanejado, quantidadeProgredindo, quantidadeBug) {
    document.getElementById("cardOk").textContent = quantidadeOk;
    document.getElementById("cardNok").textContent = quantidadeNok;
    document.getElementById("cardDesplanejado").textContent = quantidadeDesplanejado;
    document.getElementById("cardProgredindo").textContent = quantidadeProgredindo;
    document.getElementById("cardBug").textContent = quantidadeBug;
}

var incrementInterval1;
var decrementInterval1;
var incrementInterval2;
var decrementInterval2;

var contadorInput1 = document.getElementById('rows');
var contadorInput2 = document.getElementById('cols');

function startIncrement1() {
    incrementInterval1 = setInterval(function () {
        var currentValue = parseInt(contadorInput1.value);
        contadorInput1.value = currentValue + 1;
    }, 100);
}

function stopIncrement1() {
    clearInterval(incrementInterval1);
}

function startDecrement1() {
    decrementInterval1 = setInterval(function () {
        var currentValue = parseInt(contadorInput1.value);
        if (currentValue > 0) {
            contadorInput1.value = currentValue - 1;
        }
    }, 100);
}

function stopDecrement1() {
    clearInterval(decrementInterval1);
}

function startIncrement2() {
    incrementInterval2 = setInterval(function () {
        var currentValue = parseInt(contadorInput2.value);
        contadorInput2.value = currentValue + 1;
    }, 100);
}

function stopIncrement2() {
    clearInterval(incrementInterval2);
}

function startDecrement2() {
    decrementInterval2 = setInterval(function () {
        var currentValue = parseInt(contadorInput2.value);
        if (currentValue > 0) {
            contadorInput2.value = currentValue - 1;
        }
    }, 100);
}

function stopDecrement2() {
    clearInterval(decrementInterval2);
}

function abrirPopUp() {
    var janelaPopUp = window.open('./src/html/bddexcelequipes.html', 'NomePopUp', 'width=470,height=600,resizable=no');
    janelaPopUp.focus();
}

function alternarVisibilidade() {
    var campoFiltro = document.getElementById('filtroCT');
    var segundoBotao = document.getElementById('segundoBotao');

    campoFiltro.style.display = (campoFiltro.style.display === 'none' || campoFiltro.style.display === '') ? 'block' : 'none';
    segundoBotao.style.display = (segundoBotao.style.display === 'none' || segundoBotao.style.display === '') ? 'block' : 'none';
}

document.querySelector('#btn-sear').addEventListener('click', function () {
    var icon = this.querySelector('i');

    if (icon.classList.contains('fa-magnifying-glass-arrow-right')) {
        icon.classList.remove('fa-magnifying-glass-arrow-right');
        icon.classList.add('fa-xmark');
    } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-magnifying-glass-arrow-right');
    }
});

function toggleButtons(clickedBtnId) {
    var featuresBtn = document.getElementById('featuresBtn');
    var baixarBtn = document.getElementById('baixarBtn');
    var voltarBtn = document.getElementById('voltarBtn');

    featuresBtn.classList.remove('selected');
    baixarBtn.classList.remove('selected');
    document.getElementById(clickedBtnId).classList.add('selected');

    featuresBtn.classList.toggle('hide', featuresBtn.classList.contains('selected'));
    baixarBtn.classList.toggle('hide', baixarBtn.classList.contains('selected'));
    voltarBtn.classList.toggle('hide', !baixarBtn.classList.contains('selected'));
}

const btnDoc = document.getElementById('doc-book');
btnDoc.addEventListener('click', e => {
    location.href = './src/html/sheetFrenzybddDocumentacao.html';
});

function hideButtons() {
    document.querySelectorAll('.modal-footer button').forEach(function (button) {
        button.style.display = 'none';
    });
    document.querySelector('.modal-header button.close').style.display = 'none';
}

function showButtons() {
    document.querySelectorAll('.modal-footer button').forEach(function (button) {
        button.style.display = '';
    });
    document.querySelector('.modal-header button.close').style.display = '';
}

function takeScreenshotAndDownload() {
    hideButtons();

    html2canvas(document.querySelector('.modal-content'), {
        scrollY: -window.scrollY,
        scale: 2,
        useCORS: true
    }).then(function (canvas) {
        var dataUrl = canvas.toDataURL('image/png');

        var link = document.createElement('a');
        link.href = dataUrl;
        link.download = 'dashboard-bdd.png';

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);

        showButtons();
    });
}

function hideButtons() {
    document.querySelectorAll('button').forEach(function (button) {
        button.style.display = 'none';
    });
}

function showButtons() {
    document.querySelectorAll('button').forEach(function (button) {
        button.style.display = '';
    });
}

function copyDashEmail() {
    hideButtons();

    const textToCopy = `
    Observação:
    O projeto está progredindo bem, com a maioria dos cenários funcionando como esperado.
    No entanto, há alguns cenários que precisam de atenção adicional. 
    A equipe deve priorizar a resolução dos cenários e continuar monitorando o progresso. 
    Para mais detalhes, consulte o dashboard visual anexado.
    `;

    html2canvas(document.querySelector(".modal-content"), {
        scrollY: -window.scrollY,
        scale: 2,
        useCORS: true
    }).then(function (canvas) {
        const context = canvas.getContext("2d");
        context.fillStyle = "black";
        context.font = "16px Arial";
        context.fillText(textToCopy, 20, canvas.height - 60);

        showButtons();

        canvas.toBlob(function (blob) {
            const clipboardItem = new ClipboardItem({
                "image/png": blob
            });

            navigator.clipboard.write([clipboardItem]).then(function () {
                Swal.fire({
                    icon: 'success',
                    title: 'Copiado!',
                    text: 'Imagem copiada com o texto adicionado!',
                    showConfirmButton: false,
                    timer: 1500,
                    customClass: {
                        popup: 'swal-custom-popup',
                        title: 'swal-custom-title',
                        content: 'swal-custom-text'
                    }
                });
            }).catch(function (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Erro ao copiar',
                    text: 'Ocorreu um problema ao copiar os dados. Por favor, tente novamente.',
                    customClass: {
                        popup: 'swal-custom-popup',
                        title: 'swal-custom-title',
                        content: 'swal-custom-text'
                    }
                });
                console.error("Erro ao copiar:", error);
            });
        });
    });
}

function hideButtons() {
    document.querySelectorAll('.modal-footer button').forEach(function (button) {
        button.style.display = 'none';
    });
    document.querySelector('.modal-header button.close').style.display = 'none';
}

function showButtons() {
    document.querySelectorAll('.modal-footer button').forEach(function (button) {
        button.style.display = '';
    });
    document.querySelector('.modal-header button.close').style.display = '';
}

document.getElementById("titulo").addEventListener("click", function () {
    location.reload();
});

function toggleIcon() {
    var button = document.getElementById('toggleButton');
    var icon = button.querySelector('i');

    if (icon.classList.contains('fa-magnifying-glass-chart')) {
        icon.classList.remove('fa-magnifying-glass-chart');
        icon.classList.add('fa-sync-alt');
    } else {
        icon.classList.remove('fa-sync-alt');
        icon.classList.add('fa-sync-alt');
    }
}

async function printPDF() {
    const { jsPDF } = window.jspdf;
    const content = document.querySelector(".modal-content");
    const canvas = await html2canvas(content);
    const imgData = canvas.toDataURL('image/png');
    const doc = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = canvas.height * imgWidth / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        doc.addPage();
        doc.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
    }

    var dataAtual = new Date();
    var dia = String(dataAtual.getDate()).padStart(2, '0');
    var mes = String(dataAtual.getMonth() + 1).padStart(2, '0');
    var ano = dataAtual.getFullYear();
    var horas = String(dataAtual.getHours()).padStart(2, '0');
    var minutos = String(dataAtual.getMinutes()).padStart(2, '0');
    var dataFormatada = dia + '/' + mes + '/' + ano + ' ' + horas + ':' + minutos;

    doc.save('dashboard_' + dataFormatada + '.pdf');
}
