document.addEventListener('DOMContentLoaded', function () {
    document.addEventListener('dblclick', function (event) {
        var target = event.target;

        if (target.tagName === 'INPUT' && target.type === 'text') {
            Swal.fire({
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

function importExcel() {
    var input = document.getElementById("importExcel");
    var file = input.files[0];

    if (file) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, { type: 'binary' });
            var sheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[sheetName];
            var importedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

            updateTable(importedData);

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
        };
        reader.readAsBinaryString(file);
    } else {
        alert("Por favor, selecione um arquivo Excel para importar.");
    }
}

function updateTable(importedData) {
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
}

document.addEventListener('DOMContentLoaded', function () {
    var recognition = new webkitSpeechRecognition() || new SpeechRecognition();

    recognition.onresult = function (event) {
        var last = event.results.length - 1;
        var spokenText = event.results[last][0].transcript;

        if (document.activeElement.tagName === 'INPUT' && document.activeElement.type === 'text') {
            document.activeElement.value = spokenText;

            setTimeout(function () {
                var nextInput = getNextInput(document.activeElement);
                if (nextInput) {
                    nextInput.focus();
                    recognition.start();
                }
            }, 2000);
        }
    };

    document.addEventListener('click', function (event) {
        var target = event.target;

        if (target.tagName === 'INPUT' && target.type === 'text') {
            recognition.start();
        }
    });
});

function getNextInput(currentInput) {
    var inputs = document.querySelectorAll('input[type="text"]');
    var currentIndex = Array.from(inputs).indexOf(currentInput);

    if (currentIndex < inputs.length - 1) {
        return inputs[currentIndex + 1];
    } else {
        return null;
    }
}

var linhasSublinhadas = [];
function criarTabela() {
    var tabelaExistente = document.getElementById("tabela");
    if (tabelaExistente) {
        tabelaExistente.remove();
    }

    var btnExistente = document.getElementById("sublinharLinhaBtn");
    if (btnExistente) {
        btnExistente.remove();
    }

    var btnSublinhar = document.createElement("button");
    btnSublinhar.id = "sublinharLinhaBtn";
    btnSublinhar.classList.add("btn", "btn-success");

    var iconElement = document.createElement("i");
    iconElement.classList.add("fa", "fa-solid", "fa-paintbrush");
    btnSublinhar.appendChild(iconElement);

    var textNode = document.createTextNode(" Sublinhar Linha");
    btnSublinhar.appendChild(textNode);
    btnSublinhar.addEventListener('click', function () {
        Swal.fire({
            title: 'Informe o índice da linha:',
            input: 'text',
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            confirmButtonText: 'Sublinhar',
            confirmButtonColor: "#1589FF",
            cancelButtonText: 'Cancelar',
            showLoaderOnConfirm: true,
            preConfirm: (linhaIndex) => {
                linhaIndex = parseInt(linhaIndex);
                if (isNaN(linhaIndex) || linhaIndex < 1 || linhaIndex >= tabela.rows.length) {
                    Swal.showValidationMessage('Índice de linha inválido.');
                    return false;
                }

                if (linhasSublinhadas.includes(linhaIndex)) {
                    linhasSublinhadas = linhasSublinhadas.filter(item => item !== linhaIndex);
                } else {
                    linhasSublinhadas.push(linhaIndex);
                }

                atualizarEstiloLinhasSublinhadas();
                return linhaIndex;
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    });

    document.body.appendChild(btnSublinhar);

    var rows = document.getElementById("rows").value;
    var cols = document.getElementById("cols").value - 1; // Reduzir o número de colunas em 1
    var tabela = document.createElement("table");
    tabela.id = "tabela";

    var cabecalho = tabela.createTHead().insertRow(0);
    var titulos = ["Nº Cenário", "Cenário", "Contexto", "Funcionalidade", "Dado", "Quando", "Então", "Aplicação", "História", "Tipo de teste", "Status"];

    for (var j = 0; j < cols; j++) {
        var th = cabecalho.insertCell(j);
        th.textContent = titulos[j];
        th.setAttribute("onclick", "ordenarColuna(" + j + ")");
        th.setAttribute("oncontextmenu", "excluirColuna(event, " + j + "); return false;");
        th.setAttribute("ondblclick", "inserirColuna(" + j + ")");
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

            if (titulos[j] === "Dado") {
                input.value = "";
            }

            cell.appendChild(input);
        }
        row.cells[10].querySelector("input").value = "nok";
    }
    document.body.appendChild(tabela);
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
    var newRow = tabela.insertRow(tabela.rows.length);

    if (newRow) {
        var ctValue = "CT" + (tabela.rows.length - 1).toString().padStart(4, '0');
        var cellCT = newRow.insertCell(0);
        cellCT.textContent = ctValue;

        for (var j = 1; j < tabela.rows[0].cells.length; j++) {
            var cell = newRow.insertCell(j);
            var input = document.createElement("input");
            input.type = "text";
            input.value = "";

            if (j === 4) {
                input.value = "";
            }

            cell.appendChild(input);

            if (j === 10) {
                input.value = "nok";
            }
        }
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

    Swal.fire({
        icon: 'question',
        text: 'Digite o índice da nova coluna (começando de 0):',
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
                text: 'Digite o título da nova coluna:',
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
    var headerRow = tabela.rows[0];
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
        html: "Selecione os itens desejados e clique no botão Baixar.",
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
            html: "Por favor, selecione pelo menos um item.",
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

    const { value: email, isConfirmed } = await Swal.fire({
        text: "Digite o nome do arquivo",
        input: "text",
        inputPlaceholder: "nome do arquivo...",
        confirmButtonText: '<i class="fa-solid fa-file-arrow-down"></i> Baixar',
        confirmButtonColor: "#006400",
        showCancelButton: true,
        cancelButtonText: "Cancelar",
        inputValidator: (value) => {
            if (!value) {
                return 'Por favor, preencha o nome do arquivo!';
            }
        }
    });

    if (isConfirmed && email) {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
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
            title: `Excel baixado com sucesso: ${email}`
        });

        XLSX.utils.book_append_sheet(wb, ws, "Tabela");
        XLSX.writeFile(wb, email + ".xlsx");

        abrirModalEmail();
    } else {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
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
        "nok",
        "desplanejado",
        "progredindo",
        "manual",
        "automatizado",
        "Simulação crédito pessoal 32 2541 Unfificado",
        "Simulação crédito pessoal 32 2542 REORG",
        "Simulação simultanea no C2 e JUC 32 2541",
        "Simulação simultanea no C2 e JUC 32 2542",
        "Contratação CP Unificado 32 2541 sem proteção",
        "Contratação CP Unificado 32 2542 sem proteção",
        "Contratação crédito pessoal 32 2541 com Proteção",
        "Contratação crédito pessoal 32 2542 com Proteção",
        "Contratação crédito pessoal 32 2541 sem Proteção",
        "Contratação crédito pessoal 32 2542 sem Proteção",
        "Cancelamento de Contrato 32 2541 CP Unificado via C2 D + 0",
        "Cancelamento de Contrato 32 2541 CP Unificado via C2 D + 1",
        "Cancelamento de Contrato 32 2541 CP Unificado via C2 D + 7",
        "Validacao Contabil das Operacoes",
        "Validação de valor do seguro 32 2541 Unificado",
        "Validação de valor do seguro 32 2542 REORG",
        "Contratação DIV PIX 32 1920 MOBILE",
        "Contratação CP 32 1048 JUC",
        "Contratação FGTS Via JUC",
        "Contratação Sanção bacen PF - JUC 32 - 2541",
        "Contratação Sanção bacen PF - C2",
        "Contratação Sanção bacen PF - TFC",
        "Contratação Sanção bacen PF - CSG",
        "Contratação - Sanção Bacen PJ - TFC",
        "Contratação - Sanção Bacen PJ - C2",
        "Contratação - Sanção Bacen PJ - Mobile",
        "Contratação - Sanção Bacen IBPJ - Mobile",
        "Represamento de Contrato do Preventivo (32-2541/32-2542) CP em atraso no IOS",
        "Formalização de Operações Represadas do Preventivo (32-2541/32-2542) CP em atraso no IOS",
        "Mensageria pós Formalização do Preventivo (32-2541/32-2542) CP em atraso no IOS",
        "Tratar contingência do processo de formalização massiva do Preventivo (32-2541/32-2542) no IOS",
        "Oferta com UG Fechado do Preventivo (32-2541/32-2542) no IOS",
        "Bloqueio de nova oferta do Preventivo (32-2541/32-2542) no IOS",
        "Criação de produto novo Fluxo Irregular no JUC",
        "dado que tenho uma oferta de preventivo 32_1069 com empacotamento de um contrato de CP com parcela vencida no máximo 30 dias de atraso no IOS",
        "dado que tenho uma contratação represada de preventivo 32_1069 com empacotamento de um contrato de CP com parcela vencida no máximo de 30 dias de atraso no IOS",
        "dado que tenho uma contratação de preventivo 32_1069 com empacotamento de um contrato de CP com parcela vencida no máximo de 30 dias de atraso no IOS",
        "dado que tenho uma contratação represada de preventivo 32_1069 com empacotamento de um contrato de CP com parcela vencida no máximo de 30 dias de atraso no IOS",
        "Dado que tenho uma contratação de preventivo 32_1069 com empacotamento de um contrato de CP com parcela vencida no máximo 30 dias de atraso no IOS",
        "Simulação",
        "Contábil",
        "Pagamento",
        "Negativo",
        "Validação",
        "Cancelamento",
        "Contratação",
        "quando acesso menu MBPF > empréstimos > renegociar dívida (entre 21h e 05h - abertura UG) > contratar",
        "Que o cliente possua Card com oferta do fluxo irregular de preferencia com os produtos CP BG MP",
        "Dado que Cliente possui oferta no Card de oferta com os produtos CP e MP cartões com e sem atrasos e BG",
        "Dado que Cliente possui oferta no Card de oferta com os produtos CP emprestimos com e sem atraso e MP e BG",
        "Dado que Cliente possui oferta no Card de oferta com os produtos CP MP BG",
        "Dado que Cliente possui oferta no Card de oferta com dois ou mais produtos entre CP MP BG",
        "Dado que cliente possuí contrato de CP Unificado Irregular formalizado em até 7 dias",
        "Dado que cliente possuí contrato de CP Unificado Irregular formalizado em até 2 dias",
        "Dado que cliente possuí contrato de CP Unificado Irregular formalizado em até 1 dias",
        "Dado que realizei contratações",
        "Dado que Cliente possui oferta no Card de oferta com dois ou mais produtos entre CP MP BG",
        "Dado que o Gerente Cliente Santander PF deseja realizar a contratação de um preventivo irregular",
        "Dado que cliente possui Card de Div PIX",
        "Dado que cliente possui card de CP Via mobile de preferencia com tres produtos CP MP BG",
        "Dado que cliente possui card de FGTS Via JUC",
        "Dado que cliente contratou oferta do Fluxo Irregular",
        "Dado que cliente renegocie sua divida de Limite de conta",
        "Dado que cliente renegocie sua divida de cartão de crédito",
        "Dado que cliente tenha empacotamento de cartão de crédito, dentro do fluxo regular",
        "Dado que o cliente oferta de consignado via mobile",
        "Dado que cliente tenha empacotamento de cartão de crédito",
        "então a operação deverá ficar represada aguardando a abertura do UG e demais sistemas. Evidenciar 1- Oferta online com o cenário apontado. 2- A tela de contratação após a contratação",
        "então deverei ter a formalização da operação. A formalização deverá ser validada com evidência no Mobile, no TFC/C2 turbo, com a liquidação dos contratos empacotados e os lançamentos da operação em conta corrente.",
        "então Mensageria deverá enviar um SMS e PUSH para o cliente com a confirmação da formalização",
        "então deverei ter a formalização da operação e que não tenha contratos na base de represamento após a formalização.",
        "então deverá realizar uma oferta de preventivo após as 21h e validar saldo D+1",
        "então não deverá apresentar oferta do produto 32_1069 no Android",
        "Seleciono o card",
        "E seleciono o Card de Negociação",
        "E acesso o C2 através do menu meus empréstimos no mesmo dias",
        "E acesso o C2 através do menu meus empréstimos no próximo dia",
        "E as mesmas geraram movimentos contábeis nas contas",
        "Acessar o menu de emprestimos consulta contrato",
        "acesso menu empréstimos crédito pessoal na JUC",
        "E Acesso o Menu Div Pix",
        "E acesso o menu empréstimo",
        "Tenha parcela em atraso",
        "E efetivou a contratação pela segunda vez no mesmo CPF",
        "Ao acessar a consulta do contrato",
        "Menu Empréstimo/Financiamento/Empréstimo/Impressão/Reimpressão/Comprovante de Canais",
        "tentar efetivar a contratação novamente",
        "Os valores do IOF deverão estar iguais em ambos os sistemas C2 e JUC",
        "Os valores premio de seguro devem estar iguais em ambos os sistemas C2 e JUC",
        "Selecionar o contrato",
        "For fazer uma nova tentativa na sequencia da contratação",
        "Apoio da equipe Contabil HA Contabilidade para validar as movimentacoes nas contas contabeis",
        "Quando empacoto + de 1 cartões de credito",
        "Quando empacoto 1 cartão de crédito",
        "Quando empacoto + de 1 Limite de conta",
        "Quando empacoto 1 Limite de conta",
        "Quando deseja realizar a contratação do consignado",
        "Quando tenha saldo futuro",
        "Quando o cliente realiza uma simulação simultânea no C2 e JUC, garantir a consistência dos resultados entre os dois sistemas.",
        "Ao efetuar a contratação de CP Unificado sem proteção, verificar se os dados do contrato são corretamente registrados nas contas do cliente.",
        "Validar a operação de cancelamento de contrato CP Unificado via C2 com diferentes prazos (D + 0, D + 1, D + 7) para garantir a eficácia do processo.",
        "Realizar a validação contábil das operações, assegurando que os registros financeiros estejam alinhados com as transações realizadas.",
        "Quando efetuar a contratação de crédito pessoal com proteção, verificar se os cálculos do seguro estão de acordo com as especificações.",
        "Ao realizar uma contratação de CP 32 1048 JUC, validar se todas as etapas do processo são concluídas com sucesso.",
        "Ao contratar o FGTS via JUC, certificar-se de que as informações da transação são corretamente comunicadas aos órgãos competentes.",
        "Verificar o processo de formalização de operações represadas do Preventivo (32-2541/32-2542) CP em atraso no IOS para garantir a eficiência do fluxo.",
        "Acompanhar a mensageria pós formalização do Preventivo (32-2541/32-2542) CP em atraso no IOS para garantir a comunicação adequada com o cliente.",
        "Tratar contingências no processo de formalização massiva do Preventivo (32-2541/32-2542) no IOS para assegurar a continuidade do fluxo operacional.",
        "Realizar oferta com UG Fechado do Preventivo (32-2541/32-2542) no IOS e validar a resposta do sistema conforme as condições estabelecidas.",
        "Bloquear nova oferta do Preventivo (32-2541/32-2542) no IOS e assegurar que o cliente seja informado adequadamente sobre a decisão.",
        "Ao criar um produto novo no fluxo irregular no JUC, garantir que todos os processos estejam configurados corretamente para evitar problemas operacionais.",
        "Dado que tenho uma oferta de preventivo 32_1069, realizar a contratação com empacotamento de um contrato de CP com parcela vencida no máximo de 30 dias de atraso no IOS.",
        "Realizar uma contratação represada de preventivo 32_1069 com empacotamento de um contrato de CP com parcela vencida no máximo de 30 dias de atraso no IOS.",
        "Efetuar uma contratação de preventivo 32_1069 com empacotamento de um contrato de CP com parcela vencida no máximo de 30 dias de atraso no IOS.",
        "Ao realizar uma contratação represada de preventivo 32_1069 com empacotamento de um contrato de CP com parcela vencida no máximo de 30 dias de atraso no IOS, garantir que o processo seja concluído com sucesso.",
        "Dado que tenho uma contratação de preventivo 32_1069 com empacotamento de um contrato de CP com parcela vencida no máximo 30 dias de atraso no IOS, validar a consistência das informações nos registros contábeis.",
        "Ao realizar uma simulação contábil, garantir que os valores estejam alinhados com as operações realizadas no sistema.",
        "Efetuar um pagamento e validar se o registro contábil correspondente é gerado corretamente no sistema.",
        "Ao receber uma resposta negativa em uma transação, verificar as razões e garantir que o cliente seja informado adequadamente.",
        "Realizar a validação de uma oferta de cancelamento, garantindo que o processo seja concluído conforme as regras estabelecidas.",
        "Ao acessar o menu MBPF > empréstimos > renegociar dívida (entre 21h e 05h - abertura UG) > contratar, assegurar que o sistema responda conforme o esperado.",
        "Verificar se o cliente possui oferta no Card com produtos CP BG MP, preferencialmente no fluxo irregular, e realizar a contratação.",
        "Dado que o cliente possui oferta no Card com os produtos CP e MP cartões com e sem atrasos e BG, validar a consistência das condições da oferta.",
        "Ao acessar o card de oferta com os produtos CP empréstimos com e sem atraso e MP e BG, garantir que as opções sejam apresentadas corretamente ao cliente.",
        "Ao acessar o card de oferta com os produtos CP MP BG, assegurar que o cliente receba as informações relevantes sobre cada produto para tomar uma decisão informada.",
        "Dado que o cliente possui oferta no Card de oferta com dois ou mais produtos entre CP MP BG, garantir que o sistema apresente opções de contratação conforme as preferências do cliente.",
        "Verificar se o cliente possui contrato de CP Unificado Irregular formalizado em até 7 dias e realizar as validações necessárias no sistema.",
        "Ao realizar uma contratação de CP Unificado Irregular formalizado em até 2 dias, assegurar que o processo seja concluído com sucesso.",
        "Dado que o cliente possui contrato de CP Unificado Irregular formalizado em até 1 dia, validar se todas as etapas da contratação foram executadas corretamente.",
        "Ao realizar contratações, verificar se as transações estão sendo registradas corretamente nas contas contábeis e nos sistemas.",
        "Dado que o Gerente Cliente Santander PF deseja realizar a contratação de um preventivo irregular, fornecer suporte e garantir que o processo seja facilitado com sucesso.",
        "Verificar se o cliente possui card de Div PIX e garantir que as transações sejam processadas corretamente no sistema.",
        "Ao acessar o card de CP Via mobile, preferencialmente com três produtos CP MP BG, assegurar que o cliente tenha uma experiência de contratação fluída.",
        "Certificar-se de que o cliente possui card de FGTS Via JUC e validar a correta execução do processo de contratação.",
        "Realizar a contratação de Sanção Bacen PF - JUC 32 - 2541 e validar se todas as informações estão sendo comunicadas conforme as normas.",
        "Ao contratar Sanção Bacen PF - C2, verificar se todas as medidas de segurança estão sendo aplicadas adequadamente.",
        "Efetuar a contratação Sanção Bacen PF - TFC e garantir que as transações estejam em conformidade com as diretrizes estabelecidas.",
        "Contratar Sanção Bacen PF - CSG e assegurar que todos os processos sejam concluídos com sucesso.",
        "Ao realizar a contratação - Sanção Bacen PJ - TFC, garantir que as operações estejam em conformidade com as regulamentações bancárias.",
        "Contratar - Sanção Bacen PJ - C2 e validar se as informações da transação são registradas corretamente nos sistemas.",
        "Realizar a contratação - Sanção Bacen PJ - Mobile e verificar se o cliente recebe as confirmações necessárias após a transação.",
        "Contratar - Sanção Bacen IBPJ - Mobile e validar a execução correta do processo conforme as especificações.",
        "Ao represar contrato do Preventivo (32-2541/32-2542) CP em atraso no IOS, garantir que o sistema aguarde a abertura do UG e demais sistemas antes de prosseguir.",
        "Formalizar operações represadas do Preventivo (32-2541/32-2542) CP em atraso no IOS e assegurar que os registros contábeis estejam alinhados com as transações.",
        "Após a formalização do Preventivo (32-2541/32-2542) CP em atraso no IOS, verificar se a mensageria envia SMS e PUSH para o cliente com a confirmação da formalização.",
        "Ao tratar contingência do processo de formalização massiva do Preventivo (32-2541/32-2542) no IOS, garantir que as etapas sejam concluídas com sucesso e sem represamento.",
        "Realizar oferta de preventivo após as 21h e validar o saldo D+1 para garantir a eficácia do processo.",
        "Ao acessar o Android, garantir que não seja apresentada oferta do produto 32_1069 conforme as condições estabelecidas.",
        "Selecionar o card e verificar se as opções de negociação são apresentadas corretamente.",
        "Ao selecionar o Card de Negociação, assegurar que o sistema forneça as informações necessárias para a tomada de decisão do cliente.",
        "Acessar o C2 através do menu meus empréstimos no mesmo dia e validar se as informações são consistentes com os registros anteriores.",
        "Acessar o C2 através do menu meus empréstimos no próximo dia e garantir que as transações anteriores estejam refletidas corretamente.",
        "Ao realizar operações que geram movimentos contábeis nas contas, certificar-se de que os registros financeiros estão em conformidade com as transações.",
        "Acessar o menu de empréstimos para consultar contrato e verificar a precisão das informações apresentadas.",
        "Ao acessar o menu de empréstimos crédito pessoal na JUC, assegurar que as opções de contratação estejam disponíveis conforme o esperado.",
        "Acessar o Menu Div Pix e validar a correta execução do processo de contratação.",
        "Ao acessar o menu de empréstimo, garantir que as opções de contratação sejam apresentadas corretamente.",
        "Ter parcela em atraso e realizar a contratação para validar o tratamento adequado de clientes com pendências.",
        "Ao efetivar a contratação pela segunda vez no mesmo CPF, garantir que o sistema detecte a duplicidade e tome as medidas apropriadas.",
        "Ao acessar a consulta do contrato, certificar-se de que todas as informações relevantes estejam disponíveis para o cliente.",
        "No Menu Empréstimo/Financiamento/Empréstimo/Impressão/Reimpressão/Comprovante de Canais, tentar efetivar a contratação novamente para verificar a consistência do sistema.",
        "Certificar-se de que os valores do IOF estejam iguais em ambos os sistemas C2 e JUC após uma nova tentativa de contratação.",
        "Verificar se os valores do prêmio de seguro estão alinhados em ambos os sistemas C2 e JUC após uma nova tentativa de contratação.",
        "Selecionar o contrato e realizar uma nova tentativa na sequência da contratação para validar a continuidade do processo.",
        "Solicitar apoio da equipe Contábil HA Contabilidade para validar as movimentações nas contas contábeis após a realização de operações financeiras.",
        "Ao empacotar mais de um cartão de crédito, garantir que o sistema processe corretamente as informações relacionadas.",
        "Ao empacotar um cartão de crédito, verificar se o processo de contratação é concluído com sucesso.",
        "Ao empacotar mais de um Limite de conta, assegurar que todas as transações sejam registradas adequadamente.",
        "Ao empacotar um Limite de conta, validar se os registros contábeis correspondentes são gerados corretamente.",
        "Ao desejar realizar a contratação do consignado, seguir o fluxo padrão e assegurar que todas as verificações sejam realizadas conforme as políticas internas.",
        "Ao ter saldo futuro, realizar uma simulação para validar a consistência do sistema nas projeções de contratação futura.",
        "Ao acessar o menu de renegociação, verifique a disponibilidade de ofertas para empréstimos com parcelas em atraso.",
        "Quando o cliente possui contrato represado de preventivo, realize a formalização seguindo o fluxo padrão.",
        "Ao efetuar uma simulação de crédito pessoal no C2, valide a consistência dos dados com a JUC.",
        "Quando ocorre o cancelamento de contrato via C2, verifique o impacto nas contas contábeis correspondentes.",
        "Realize uma contratação de crédito pessoal com proteção e valide a aplicação correta das medidas de segurança.",
        "Ao acessar o menu de pagamentos, certifique-se de que as transações estejam refletidas corretamente nos registros contábeis.",
        "Quando houver uma contratação de FGTS via JUC, verifique se as informações estão sendo devidamente registradas no sistema.",
        "Efetue uma oferta de consignado via mobile e garanta que o saldo seja validado no dia seguinte.",
        "Ao acessar o menu de contratação de Sanção Bacen PJ no Mobile, assegure que todas as etapas sejam concluídas conforme o esperado.",
        "Contrate Sanção Bacen PF - CSG e confirme se todos os processos são concluídos com sucesso.",
        "Verifique o processo de formalização de operações represadas do Preventivo (32-2541/32-2542) CP em atraso no IOS para garantir a eficiência do fluxo.",
        "Acompanhe a mensageria pós formalização do Preventivo (32-2541/32-2542) CP em atraso no IOS para garantir a comunicação adequada com o cliente.",
        "Trate contingências no processo de formalização massiva do Preventivo (32-2541/32-2542) no IOS para assegurar a continuidade do fluxo operacional.",
        "Realize oferta com UG Fechado do Preventivo (32-2541/32-2542) no IOS e valide a resposta do sistema conforme as condições estabelecidas.",
        "Bloqueie nova oferta do Preventivo (32-2541/32-2542) no IOS e assegure que o cliente seja informado adequadamente sobre a decisão.",
        "Ao criar um produto novo no fluxo irregular no JUC, garanta que todos os processos estejam configurados corretamente para evitar problemas operacionais.",
        "Dado que tenho uma oferta de preventivo 32_1069, realize a contratação com empacotamento de um contrato de CP com parcela vencida no máximo de 30 dias de atraso no IOS.",
        "Realize uma contratação represada de preventivo 32_1069 com empacotamento de um contrato de CP com parcela vencida no máximo de 30 dias de atraso no IOS.",
        "Efetue uma contratação de preventivo 32_1069 com empacotamento de um contrato de CP com parcela vencida no máximo de 30 dias de atraso no IOS.",
        "Ao realizar uma contratação represada de preventivo 32_1069 com empacotamento de um contrato de CP com parcela vencida no máximo de 30 dias de atraso no IOS, assegure que o processo seja concluído com sucesso.",
        "Dado que tenho uma contratação de preventivo 32_1069 com empacotamento de um contrato de CP com parcela vencida no máximo 30 dias de atraso no IOS, valide a consistência das informações nos registros contábeis.",
        "Ao realizar uma simulação contábil, certifique-se de que os valores estejam alinhados com as operações realizadas no sistema.",
        "Efetue um pagamento e valide se o registro contábil correspondente é gerado corretamente no sistema.",
        "Ao receber uma resposta negativa em uma transação, verifique as razões e assegure que o cliente seja informado adequadamente.",
        "Realize a validação de uma oferta de cancelamento, garantindo que o processo seja concluído conforme as regras estabelecidas.",
        "Ao acessar o menu MBPF > empréstimos > renegociar dívida (entre 21h e 05h - abertura UG) > contratar, assegure que o sistema responda conforme o esperado.",
        "Verifique se o cliente possui oferta no Card com produtos CP BG MP, preferencialmente no fluxo irregular, e realize a contratação.",
        "Dado que o cliente possui oferta no Card com os produtos CP e MP cartões com e sem atrasos e BG, valide a consistência das condições da oferta.",
        "Ao acessar o card de oferta com os produtos CP empréstimos com e sem atraso e MP e BG, garanta que as opções sejam apresentadas corretamente ao cliente.",
        "Ao acessar o card de oferta com os produtos CP MP BG, assegure que o cliente receba as informações relevantes sobre cada produto para tomar uma decisão informada.",
        "Verifique se o cliente possui contrato de CP Unificado Irregular formalizado em até 7 dias e realize as validações necessárias no sistema.",
        "Ao realizar uma contratação de CP Unificado Irregular formalizado em até 2 dias, assegure que o processo seja concluído com sucesso.",
        "Dado que o cliente possui contrato de CP Unificado Irregular formalizado em até 1 dia, valide se todas as etapas da contratação foram executadas corretamente.",
        "Ao realizar contratações, verifique se as transações estão sendo registradas corretamente nas contas contábeis e nos sistemas.",
        "Dado que o Gerente Cliente Santander PF deseja realizar a contratação de um preventivo irregular, forneça suporte e assegure que o processo seja facilitado com sucesso.",
        "Verifique se o cliente possui card de Div PIX e garanta que as transações sejam processadas corretamente no sistema.",
        "Ao acessar o card de CP Via mobile, preferencialmente com três produtos CP MP BG, assegure que o cliente tenha uma experiência de contratação fluída.",
        "Certifique-se de que o cliente possui card de FGTS Via JUC e valide a correta execução do processo de contratação.",
        "Realize a contratação de Sanção Bacen PF - CSG e confirme se todas as informações da transação estão registradas corretamente nos sistemas.",
        "Ao contratar Sanção Bacen PJ - TFC, garanta que as operações estejam em conformidade com as regulamentações bancárias.",
        "Contrate - Sanção Bacen PJ - C2 e valide se as informações da transação são registradas corretamente nos sistemas.",
        "Realize a contratação - Sanção Bacen PJ - Mobile e verifique se o cliente recebe as confirmações necessárias após a transação.",
        "Contrate - Sanção Bacen IBPJ - Mobile e valide a execução correta do processo conforme as especificações.",
        "Ao represar contrato do Preventivo (32-2541/32-2542) CP em atraso no IOS, garanta que o sistema aguarde a abertura do UG e demais sistemas antes de prosseguir.",
        "Formalize operações represadas do Preventivo (32-2541/32-2542) CP em atraso no IOS e assegure que os registros contábeis estejam alinhados com as transações.",
        "Após a formalização do Preventivo (32-2541/32-2542) CP em atraso no IOS, verifique se a mensageria envia SMS e PUSH para o cliente com a confirmação da formalização.",
        "Ao tratar contingência do processo de formalização massiva do Preventivo (32-2541/32-2542) no IOS, garanta que as etapas sejam concluídas com sucesso e sem represamento.",
        "Realize oferta de preventivo após as 21h e valide o saldo D+1 para garantir a eficácia do processo.",
        "Ao acessar o Android, certifique-se de que não seja apresentada oferta do produto 32_1069 conforme as condições estabelecidas.",
        "Selecionar o card e verificar se as opções de negociação são apresentadas corretamente.",
        "Ao selecionar o Card de Negociação, assegure que o sistema forneça as informações necessárias para a tomada de decisão do cliente.",
        "Acessar o C2 através do menu meus empréstimos no mesmo dia e validar se as informações são consistentes com os registros anteriores.",
        "Acessar o C2 através do menu meus empréstimos no próximo dia e garantir que as transações anteriores estejam refletidas corretamente.",
        "Ao realizar operações que geram movimentos contábeis nas contas, certifique-se de que os registros financeiros estão em conformidade com as transações.",
        "Acessar o menu de empréstimos para consultar contrato e verificar a precisão das informações apresentadas.",
        "Ao acessar o menu de empréstimos crédito pessoal na JUC, assegure que as opções de contratação estejam disponíveis conforme o esperado.",
        "Acessar o Menu Div Pix e validar a correta execução do processo de contratação.",
        "Ao acessar o menu de empréstimo, garantir que as opções de contratação sejam apresentadas corretamente.",
        "Ter parcela em atraso e realizar a contratação para validar o tratamento adequado de clientes com pendências.",
        "Ao efetivar a contratação pela segunda vez no mesmo CPF, garanta que o sistema detecte a duplicidade e tome as medidas apropriadas.",
        "Ao acessar a consulta do contrato, certifique-se de que todas as informações relevantes estejam disponíveis para o cliente.",
        "No Menu Empréstimo/Financiamento/Empréstimo/Impressão/Reimpressão/Comprovante de Canais, tente efetivar a contratação novamente para verificar a consistência do sistema.",
        "Certifique-se de que os valores do IOF estejam iguais em ambos os sistemas C2 e JUC após uma nova tentativa de contratação.",
        "Verifique se os valores do prêmio de seguro estão alinhados em ambos os sistemas C2 e JUC após uma nova tentativa de contratação.",
        "Selecionar o contrato e realizar uma nova tentativa na sequência da contratação para validar a continuidade do processo.",
        "Solicitar apoio da equipe Contábil HA Contabilidade para validar as movimentações nas contas contábeis após a realização de operações financeiras.",
        "Ao empacotar mais de um cartão de crédito, garantir que o sistema processe corretamente as informações relacionadas.",
        "Ao empacotar um cartão de crédito, verificar se o processo de contratação é concluído com sucesso.",
        "Ao empacotar mais de um Limite de conta, assegurar que todas as transações sejam registradas adequadamente.",
        "Ao empacotar um Limite de conta, validar se os registros contábeis correspondentes são gerados corretamente.",
        "Ao desejar realizar a contratação do consignado, seguir o fluxo padrão e assegurar que todas as verificações sejam realizadas conforme as políticas internas.",
        "Ao ter saldo futuro, realizar uma simulação para validar a consistência do sistema nas projeções de contratação futura."
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
                    html:
                        '<div style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 20px;">' +
                        '<label for="bugNumber" style="margin-bottom: 5px;"><i class="fa-solid fa-bugs"></i> Número do Bug</label>' +
                        '<input type="text" id="bugNumber" class="swal2-input" placeholder="INC00000000">' +
                        '</div>' +

                        '<div style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 10px;">' +
                        '<label for="aplicacaoName" style="margin-bottom: 5px;"><i class="fa-solid fa-globe"></i> Nome da Aplicação</label>' +
                        '<input type="text" id="aplicacaoName" class="swal2-input" placeholder="aplicação...">' +
                        '</div>' +

                        '<div style="display: flex; flex-direction: column; align-items: flex-start; margin-bottom: 10px;">' +
                        '<label for="torreName" style="margin-bottom: 5px;"><i class="fa-solid fa-circle-info"></i> Descrição resumida</label>' +
                        '<input type="text" id="torreName" class="swal2-input" placeholder="descrição resumida...">' +
                        '</div>',
                    showCancelButton: true,
                    confirmButtonText: 'Adicionar',
                    confirmButtonColor: "#1589FF",
                    cancelButtonText: 'Cancelar',
                    showLoaderOnConfirm: true,
                    preConfirm: () => {
                        var bugNumber = document.getElementById('bugNumber').value.trim();
                        var torreName = document.getElementById('torreName').value.trim();
                        var aplicacaoName = document.getElementById('aplicacaoName').value.trim();

                        if (!bugNumber || !torreName || !aplicacaoName) {
                            Swal.showValidationMessage('Por favor, preencha ambos os campos.');
                            return false;
                        }

                        target.value = `bug nº ${bugNumber}, Aplicação: ${aplicacaoName}, Descrição: ${torreName}`;
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

    Swal.fire({
        html: '<b>Escolha a coluna e o intervalo de linhas</b><br>' +
            '<p><label for="colIndex"><i class="fa-solid fa-list-ul"></i> Índice da Coluna</label>' +
            '<input type="text" id="colIndex" class="swal2-input" placeholder="0"></p>' +
            '<p><label for="rowRange"><i class="fa-solid fa-arrow-down-up-across-line"></i> Intervalo de Linhas</label>' +
            '<input type="text" id="rowRange" class="swal2-input" placeholder="1 a ' + (tabela.rows.length - 1) + '"></p>' +
            '<i class="fa-solid fa-signature"></i> Texto a ser inserido<br>' +
            '<input type="text" id="textToInsert" class="swal2-input" placeholder="Texto">',
        showCancelButton: true,
        confirmButtonText: 'Copiar',
        confirmButtonColor: "#1589FF",
        cancelButtonText: 'Cancelar',
        showLoaderOnConfirm: true,
        preConfirm: () => {
            var colIndex = parseInt(document.getElementById('colIndex').value);
            var rowRange = document.getElementById('rowRange').value.trim();
            var textToInsert = document.getElementById('textToInsert').value.trim();

            // Validate inputs
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

function gerarDashboard() {
    var tabela = document.getElementById("tabela");
    var data = [];
    var colunaIndex = 10;

    for (var i = 1; i < tabela.rows.length; i++) {
        var input = tabela.rows[i].cells[colunaIndex].querySelector("input");
        if (input) {
            data.push(input.value.toLowerCase());
        }
    }

    criarDashboard(data);

    var { numeroLinhas, numeroOK, numeroNOK, numeroDesplanejado, numeroProgredindo, numeroBug } = contarNumeros();
    var porcentagemOK = (numeroOK / numeroLinhas) * 100;

    document.getElementById("porcentagemOK").textContent =
        "Número de Linhas na Tabela: " + numeroLinhas +
        "\nnº Ok: " + numeroOK +
        "\nnº Nok: " + numeroNOK +
        "\nnº Desplanejado: " + numeroDesplanejado +
        "\nnº Progredindo: " + numeroProgredindo +
        "\nnº Bug: " + numeroBug +
        "\nPorcentagem: " + porcentagemOK.toFixed(2) + "%";

    var progressBar = document.getElementById("progressBar");
    progressBar.style.width = porcentagemOK + "%";
    progressBar.setAttribute("aria-valuenow", porcentagemOK);

    var showBugScenariosBtn = document.getElementById("showBugScenariosBtn");
    showBugScenariosBtn.addEventListener("click", function () {
        mostrarCenariosBug();
    });

    var modalInstance = new bootstrap.Modal(document.getElementById("myModal"));
    modalInstance.show();
}

function mostrarCenariosBug() {
    var tabela = document.getElementById("tabela");
    var colunaIndex = 10;
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
            cenarioElement.textContent = cenario.nome + ": " + cenario.dados.join(", ");
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
    var colunaIndex = 10;

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
            } else if (valor === "nok") {
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

function criarDashboard(data) {
    var ctx = document.getElementById("graficoModal").getContext("2d");

    if (myChart) {
        myChart.destroy();
    }

    var quantidadeOk = contarOcorrencias(data, "ok");
    var quantidadeNok = contarOcorrencias(data, "nok");
    var quantidadeDesplanejado = contarOcorrencias(data, "desplanejado");
    var quantidadeProgredindo = contarOcorrencias(data, "progredindo");
    var quantidadeBug = contarOcorrencias(data, "bug");

    myChart = new Chart(ctx, {
        type: "bar",
        data: {
            labels: ["Ok", "Nok", "Desplanejado", "Progredindo", "Bug"],
            datasets: [{
                label: "Quantidade",
                data: [
                    quantidadeOk,
                    quantidadeNok,
                    quantidadeDesplanejado,
                    quantidadeProgredindo,
                    quantidadeBug
                ],
                backgroundColor: [
                    "rgba(75, 192, 192, 0.2)",
                    "rgba(255, 99, 132, 0.2)",
                    "rgba(255, 205, 86, 0.2)",
                    "rgba(54, 162, 235, 0.2)",
                    "rgba(146, 110, 244, 0.8)"
                ],
                borderColor: [
                    "rgba(75, 192, 192, 1)",
                    "rgba(255, 99, 132, 1)",
                    "rgba(255, 205, 86, 1)",
                    "rgba(54, 162, 235, 1)",
                    "rgba(146, 110, 244, 0.8)"
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const themeButton = document.getElementById('themeButton');
    const themeSelector = document.getElementById('themeSelector');
    const body = document.body;

    function setDarkThemeWithImage() {
        body.classList.add('dark-theme', 'image-theme');
        body.style.backgroundImage = "url('./src/img/uuui.jpg')";
        themeSelector.value = 'image';
    }

    setDarkThemeWithImage();

    themeButton.addEventListener('click', function () {
        themeSelector.style.display = (themeSelector.style.display === 'none' || themeSelector.style.display === '')
            ? 'block'
            : 'none';

        themeSelector.classList.add('show');
    });

    themeSelector.addEventListener('change', function () {
        const selectedTheme = themeSelector.value;
        body.classList.remove('light-theme', 'dark-theme', 'custom-theme', 'image-theme', 'new-color-theme');

        body.style.backgroundImage = '';

        if (selectedTheme === 'light') {
            body.classList.add('light-theme');
        } else if (selectedTheme === 'dark') {
            body.classList.add('dark-theme');
        } else if (selectedTheme === 'custom') {
            body.classList.add('custom-theme');
        } else if (selectedTheme === 'image') {
            body.style.backgroundImage = "url('./src/img/uuui.jpg')";
            body.classList.add('image-theme');
        } else if (selectedTheme === 'anotherImage') {
            body.style.backgroundImage = "url('./src/img/yu.jpg')";
            body.classList.add('image-theme');
        } else if (selectedTheme === 'newColor') {
            body.classList.add('new-color-theme');
        }

        themeSelector.style.display = 'none';
    });
});

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

document.querySelector('#themeButton').addEventListener('click', function () {
    var icon = this.querySelector('i');

    if (icon.classList.contains('fa-circle-half-stroke')) {
        icon.classList.remove('fa-circle-half-stroke');
        icon.classList.add('fa-xmark');
    } else {
        icon.classList.remove('fa-xmark');
        icon.classList.add('fa-circle-half-stroke');
    }
});

function toggleButtons(clickedBtnId) {
    document.getElementById('featuresBtn').classList.remove('selected');
    document.getElementById('baixarBtn').classList.remove('selected');
    document.getElementById(clickedBtnId).classList.add('selected');

    var featuresBtn = document.getElementById('featuresBtn');
    var baixarBtn = document.getElementById('baixarBtn');
    var voltarBtn = document.getElementById('voltarBtn');

    featuresBtn.classList.toggle('hide', featuresBtn.classList.contains('selected'));
    baixarBtn.classList.toggle('hide', baixarBtn.classList.contains('selected'));
    voltarBtn.classList.toggle('hide', !baixarBtn.classList.contains('selected'));
}

const btnDoc = document.getElementById('doc-book');
btnDoc.addEventListener('click', e => {
    location.href = './src/html/documentacaobddtestgenerator.html';
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

    html2canvas(document.getElementById('myModal')).then(function (canvas) {
        var dataUrl = canvas.toDataURL();
        var link = document.createElement('a');

        link.href = dataUrl;
        link.download = 'screenshot-bdd.png';

        document.body.appendChild(link);
        link.click();

        document.body.removeChild(link);
        showButtons();
    });
}

const btnquesti = document.getElementById('doc-quest');
btnquesti.addEventListener('click', e => {
    location.href = './src/html/mod/gherkinconceitos.html';
})

const btnBlog = document.getElementById('blog');
btnBlog.addEventListener('click', e => {
    location.href = './src/blog/sheetFrenzybddBlog.html';
})

const convertTable = document.getElementById('convertTableButton');
convertTable.addEventListener('click', e => {
    location.href = './src/swiftleft/swiftShiftConverter.html';
})

const btnGherkin = document.getElementById('editor-gherkin');
btnGherkin.addEventListener('click', e => {
    location.href = './src/html/editorGherkin.html';
})

var recordingButton = document.getElementById('recordingButton');
var recordedVideo = document.getElementById('recordedVideo');

var mediaRecorder;
var isRecording = false;
var recordedBlob;

recordingButton.addEventListener('click', function () {
    if (!isRecording) {
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
    } else {
        mediaRecorder.stop();
    }
});

document.getElementById("titulo").addEventListener("click", function () {
    location.reload();
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

recordingButton.addEventListener('click', function () {
    if (!isRecording && recordedBlob) {
        var blobUrl = URL.createObjectURL(recordedBlob);
        var a = document.createElement('a');
        a.href = blobUrl;
        a.download = 'gravacao.webm';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        recordedBlob = null;
        updateButtonText();
    }
});

function selecionarTodosRadios() {
    var radios = document.querySelectorAll('input[type="radio"]');
    radios.forEach(function (radio) {
        radio.checked = true;
    });
}
// Função para exportar a tabela para PDF
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

            // Referência ao objeto jsPDF
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();

            // Obter a tabela
            var tabela = document.getElementById("tabela");

            // Coletar os dados da tabela
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

            // Adicionar os dados ao PDF
            doc.autoTable({
                head: [data[0]],
                body: data.slice(1),
            });

            // Salvar o PDF
            doc.save(`${fileName}.pdf`);
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("exportarPDFBtn").addEventListener("click", exportarParaPDF);
});

console.log("\n%cAtenção Espere! %c\n\n\nEste é um recurso de navegador voltado para desenvolvedores. Se alguém disse para você copiar e colar algo aqui para ativar um recurso ou 'invadir' a maquina de outra pessoa, isso é uma fraude e você dará a ele acesso à sua maquina.\n\nConsulte ataques https://en.wikipedia.org/wiki/Self-XSS para obter mais informações.", "color: red; font-size: 46px;", "font-size: 16px;");
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;