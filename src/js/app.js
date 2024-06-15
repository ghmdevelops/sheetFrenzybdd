$("#btn-exe").on("click", function () {
    ExportToExcel('xlsx'); 7
});

$(document).ready(function () {
    $('#modal').trigger('click');
});

async function ExportToExcel(type, fn, dl) {
    const { value: text } = await Swal.fire({
        title: 'Digite o nome do arquivo',
        input: 'text',
        inputLabel: '',
        inputPlaceholder: 'nome do arquivo',
        inputAttributes: {
            maxlength: 40,
            autocapitalize: 'off',
            autocorrect: 'off'
        },
        confirmButtonColor: '#288b5f',
        confirmButtonText: 'Gerar excel <i class="fa-solid fa-file-arrow-down"></i>',
    });

    if (text) {
        Swal.fire(`Nome digitado: ${text}`);
        let timerInterval;

        Swal.fire({
            icon: 'success',
            title: 'Gerando Excel',
            html: '<b></b> milliseconds.',
            timer: 1200,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading();
                const b = Swal.getHtmlContainer().querySelector('b');
                timerInterval = setInterval(() => {
                    b.textContent = Swal.getTimerLeft();
                }, 100);
            },
            willClose: () => {
                clearInterval(timerInterval);
                var elt = document.getElementById("tbl_exporttable_to_xls");
                var wb = XLSX.utils.table_to_book(elt, { sheet: "bdd test generator" });
                var fileExtension = type || "xlsx";
                var fileName = fn || text + "." + fileExtension;

                if (dl) {
                    var base64data = XLSX.write(wb, { bookType: type, bookSST: true, type: "base64" });
                    setTimeout(() => {
                        openEmailClient();
                    }, 2200);
                } else {
                    XLSX.writeFile(wb, fileName);
                    openEmailClient();
                }
            }
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                console.log('I was closed by the timer');
            }
        });
    }
}

function openEmailClient() {

    var email = 'seuemail@example.com';
    var subject = encodeURIComponent('Prezado [Nome do Destinatário],\n\nEstou enviando este e - mail para fornecer o arquivo solicitado discutido durante nossa última conversa. O arquivo anexo contém o BDD. Por favor, revise o arquivo e sinta - se à vontade para entrar em contato caso tenha alguma dúvida ou se precisar de informações adicionais. Estou à disposição para discutir qualquer ponto que você considere relevante.\n\nAgradeço antecipadamente pelo seu tempo e colaboração.\n\nAtenciosamente.');
    var body = encodeURIComponent('Corpo do Email');

    var mailtoLink = `mailto:${email}?subject=${subject}&body=${body}`;

    window.location.href = mailtoLink;
}

function addColumn(myTable) {
    var table = document.getElementById(myTable);
    var rows = table.getElementsByTagName("tr");

    for (var i = 0; i < rows.length; i++) {
        var newRow = rows[i].insertCell(-1);
        newRow.innerHTML = "<td class='drag-handle' contenteditable='true'></td>";
    }

    makeColumnsDraggable();
}


function deleterow(tblId) {
    var table = document.getElementById(tblId);
    var row = table.getElementsByTagName("tr");
    if (row.length != "1") {
        row[row.length - 1].outerHTML = "";
    }
}

function deleteColumn(tblId) {
    var allRows = document.getElementById(tblId).rows;
    for (var i = 0; i < allRows.length; i++) {
        if (allRows[i].cells.length > 1) {
            allRows[i].deleteCell(-1);
        }
    }
}

function startSpeechRecognition(targetElement) {
    const recognition = new webkitSpeechRecognition();

    recognition.lang = 'pt-BR';
    recognition.interimResults = false;

    recognition.onresult = function (event) {
        const result = event.results[0][0].transcript.trim();
        targetElement.innerText = result;
    };

    recognition.onerror = function (event) {
        console.error('Speech recognition error:', event.error);
    };

    recognition.onend = function () {
        console.log('Speech recognition ended.');
    };

    recognition.start();
}

function myFunction(myTable) {
    var table = document.getElementById(myTable);
    var row = table.getElementsByTagName("tr");
    var lastRow = row[row.length - 1];
    var newRow = lastRow.cloneNode(true);
    var currentCount = parseInt(lastRow.cells[0].innerText.replace(/\D/g, ''), 10) || 0;
    currentCount++;

    newRow.cells[0].innerText = 'CT' + padLeft(currentCount, 4);

    var lastCell = newRow.cells[newRow.cells.length - 1];
    lastCell.innerHTML = "";

    var generateButton = document.createElement("button");
    generateButton.innerHTML = "";
    generateButton.classList.add("btn", "btn-primary", "btn-sm");
    generateButton.id = "btn-gherk"
    generateButton.addEventListener("click", function () {
        generateFeatureForRow(newRow);
        event.preventDefault();
    });
    lastCell.appendChild(generateButton);

    for (var i = 1; i < newRow.cells.length - 1; i++) {
        newRow.cells[i].innerText = "";
    }

    table.appendChild(newRow);

    for (var i = 0; i < newRow.cells.length; i++) {
        newRow.cells[i].addEventListener("click", function () {
            startSpeechRecognition(this);
        });
    }
}

function padLeft(number, length) {
    return (Array(length).join('0') + number).slice(-length);
}

document.getElementById("tblSample").addEventListener("click", function (e) {

    var row = e.target.closest("tr");
    if (!row || !this.contains(row)) {
        return;
    }

    var form = document.querySelector("form[action=hotelaction]");

    form.querySelector("[name=hId]").value = row.cells[0].innerHTML;
    form.querySelector("[name=hName]").value = row.cells[1].innerHTML;
    form.querySelector("[name=hArea]").value = row.cells[2].innerHTML;
    form.querySelector("[name=hNumOfRooms]").value = row.cells[3].innerHTML;
    form.querySelector("[name=hImgUrl]").value = row.cells[4].innerHTML;
    form.querySelector("[name=method2]").value = row.cells[5].innerHTML;
    form.querySelector("[name=method3]").value = row.cells[6].innerHTML;
    form.querySelector("[name=method4]").value = row.cells[7].innerHTML;
    form.querySelector("[name=method5]").value = row.cells[8].innerHTML;

});

function myFunctions() {
    var input, filter, table, tr, td, i;
    input = document.getElementById("myInput");
    filter = input.value.toUpperCase();
    table = document.getElementById("tblSample");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
        td = tr[i].getElementsByTagName("td")[0];
        if (td) {
            if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
                tr[i].style.display = "";
            } else {
                tr[i].style.display = "none";
            }
        }
    }
}

function valorInputs() {
    var campo1 = document.getElementById('feats').value;
    var campo2 = document.getElementById('histo').value;
    var campo3 = document.getElementById('numct').value;
    var campo4 = document.getElementById('scenario').value;
    var campo5 = document.getElementById('givesn').value;
    var campo6 = document.getElementById('ands').value;
    var campo7 = document.getElementById('anss').value;
    var campo8 = document.getElementById('whens').value;
    var campo9 = document.getElementById('thesn').value;
    var campo10 = document.getElementById('tagceun').value;

    var resutl1 = document.getElementById('fea').innerText = campo1;
    var resutl2 = document.getElementById('func').innerText = campo2
    var resutl3 = document.getElementById('dice').innerText = campo3
    var resutl4 = document.getElementById('scne').innerText = campo4
    var resutl5 = document.getElementById('given').innerText = campo5
    var resutl6 = document.getElementById('and').innerText = campo6
    var resutl7 = document.getElementById('andtwo').innerText = campo7
    var resutl8 = document.getElementById('when').innerText = campo8
    var resutl9 = document.getElementById('then').innerText = campo9
    var resutl10 = document.getElementById('tags').innerText = campo10

}

$('#opp03-mklld').on('click', async function () {
    const { value: text } = await Swal.fire({
        input: 'text',
        inputLabel: 'Digite o nome da feature',
        inputPlaceholder: 'feature...',
        confirmButtonColor: '#288b5f',
        confirmButtonText: 'Gerar feature',
    })

    if (text) {
        Swal.fire(`Nome digitado: ${text}`)
        valorInputs();
        let timerInterval
        Swal.fire({
            icon: 'success',
            title: 'Baixando feature',
            html: 'Vou fechar em <b></b> milissegundos.',
            timer: 1500,
            timerProgressBar: true,
            didOpen: () => {
                Swal.showLoading()
                const b = Swal.getHtmlContainer().querySelector('b')
                timerInterval = setInterval(() => {
                    b.textContent = Swal.getTimerLeft()
                }, 100)
            },
            willClose: () => {
                clearInterval(timerInterval)
                var divContent = document.getElementById('conteudo').innerText;

                var blob = new Blob([divContent], { type: 'text/plain' });

                var anchor = document.createElement('a');
                anchor.href = window.URL.createObjectURL(blob);
                anchor.download = text + '.feature';
                anchor.click();
                window.URL.revokeObjectURL(anchor.href);
            }
        }).then((result) => {
            if (result.dismiss === Swal.DismissReason.timer) {
                console.log('Eu estava fechado pelo cronômetro')
            }
        })
    }
});

var ExcelToJSON = function () {
    this.parseExcel = function (file) {
        var reader = new FileReader();

        reader.onload = function (e) {
            var data = e.target.result;
            var workbook = XLSX.read(data, {
                type: 'binary'
            });
            workbook.SheetNames.forEach(function (sheetName) {
                var XL_row_object = XLSX.utils.sheet_to_row_object_array(workbook.Sheets[sheetName]);
                var productList = JSON.parse(JSON.stringify(XL_row_object));

                var rows = $('#tblSample tbody');
                // console.log(productList)
                for (i = 0; i < productList.length; i++) {
                    var columns = Object.values(productList[i])
                    rows.append(`
                        <tr>
                        <td>${columns[0]}</td>
                        <td>${columns[1]}</td>
                        <td>${columns[2]}</td>
                        <td>${columns[3]}</td>
                        <td>${columns[4]}</td>
                        <td>${columns[5]}</td>
                        <td>${columns[6]}</td>
                        <td>${columns[7]}</td>
                        <td>${columns[8]}</td>
                        <td>${columns[9]}</td>
                        <td>${columns[10]}</td>
                        <td>${columns[11]}</td>
                        <td>${columns[12]}</td>
                        </tr>
                `);
                }

            })
        };
        reader.onerror = function (ex) {
            console.log(ex);
        };

        reader.readAsBinaryString(file);
    };
};

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("fileupload").addEventListener("change", handleFileUpload);
});

function handleFileUpload(event) {
    const fileInput = event.target;
    const files = fileInput.files;

    if (files.length > 0) {
        const selectedFile = files[0];
        const reader = new FileReader();

        reader.onload = function (e) {
            const workbook = XLSX.read(e.target.result, { type: "binary" });
            const sheetName = workbook.SheetNames[0];
            const excelHeaders = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1 })[0];

            updateTableHeaders(excelHeaders);

            const tableBody = document.getElementById("tblSample").getElementsByTagName("tbody")[0];
            tableBody.innerHTML = "";

            const excelData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 0 });
            for (const rowData of excelData) {
                const row = tableBody.insertRow();

                for (let i = 0; i < excelHeaders.length; i++) {
                    const cell = row.insertCell();

                    if (i !== excelHeaders.length - 1) {
                        cell.textContent = rowData[excelHeaders[i]];
                        cell.addEventListener("click", function () {
                            startSpeechRecognition(cell);
                        });
                    } else {
                        const generateButton = document.createElement("button");
                        generateButton.innerHTML = "";
                        generateButton.id = "btn-gherk"
                        generateButton.addEventListener("click", function () {
                            generateFeatureForRow(row);
                            event.preventDefault();
                        });
                        cell.appendChild(generateButton);

                    }
                }
            }
        };
        reader.readAsBinaryString(selectedFile);
    }
}


function updateTableHeaders(newHeaders) {
    const tableHead = document.getElementById("tblSample").getElementsByTagName("thead")[0];
    const headerRow = tableHead.getElementsByTagName("tr")[0];

    headerRow.innerHTML = "";

    for (const header of newHeaders) {
        const th = document.createElement("th");
        th.textContent = header;
        headerRow.appendChild(th);
    }
}

function addGenerateFeatureButton() {
    var table = document.getElementById("tblSample");
    var rows = table.getElementsByTagName("tr");

    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var generateButton = document.createElement("button");
        generateButton.textContent = "Gerar Feature";
        generateButton.className = "generate-feature-button";
        generateButton.onclick = function () {
            generateFeatureForRow(row);
        };

        var cell = row.insertCell(-1);
        cell.appendChild(generateButton);
    }
}

function generateFeatureForRow(row) {
    var scenario = row.cells[0].textContent.trim();
    var cenario = row.cells[1].textContent.trim();
    var contexto = row.cells[2].textContent.trim();
    var funcionalidade = row.cells[3].textContent.trim();
    var given = row.cells[4].textContent.trim();
    var e1 = row.cells[5].textContent.trim();
    var e2 = row.cells[6].textContent.trim();
    var when = row.cells[7].textContent.trim();
    var then = row.cells[8].textContent.trim();

    var gherkinScenario = `Feature: ${cenario}
    ${contexto}

   @${scenario}
   Scenario: ${cenario}
   Given ${given}
   And ${e1}
   And ${e2}
   When ${when}
   Then ${then}`;

    var blob = new Blob([gherkinScenario], { type: 'text/plain' });
    var anchor = document.createElement('a');
    anchor.href = window.URL.createObjectURL(blob);
    anchor.download = `${cenario}.feature`;
    anchor.click();
    window.URL.revokeObjectURL(anchor.href);
}

addGenerateFeatureButton();

let currentCount = 0;

function addFormField() {

    if (currentCount < 4) {
        currentCount += 1;
        var id = document.getElementById("id").value;
        $("#divTxt").append(
            "<b id='row" + id + "'><label id='imk' for='txt" + id + "'>And " +
            id +
            "<input type='text' size='20' placeholder='escreva aqui...' name='txt[]' id='txt" +
            id +
            "'>&nbsp;&nbsp<a href='#' onClick='removeFormField(\"#row" +
            id +
            "\"); return false;'>Remove</a><b>"
        );

        document.getElementById("id").value = id;
    } else {
        Swal.fire({
            icon: 'warning',
            title: 'Oops...',
            text: 'Chegou no limite maximo de 4 linhas',
            confirmButtonColor: '#288b5f',
            confirmButtonText: 'OK',
        })
    }
}

function removeFormField(id) {
    $(id).remove();
}

$('#copy-button').on('click', function () {
    valorInputs(),
        resp();
});

$(document).ready(function () {
    $('#copy-button').click(function () {
        var textToCopy = $('#conteudo').text();
        var tempTextarea = $('<textarea>');
        $('body').append(tempTextarea);
        tempTextarea.val(textToCopy).select();
        document.execCommand('copy');
        tempTextarea.remove();
    });
});

async function resp() {
    const Toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        didOpen: (toast) => {
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })
    Toast.fire({
        icon: 'success',
        title: 'Copiado com sucesso!'
    })
}

function convertTableToGherkinAndExport() {
    var table = document.getElementById("tblSample");
    var rows = table.getElementsByTagName("tr");

    var zip = new JSZip();
    var packageFolder = zip.folder("scenarios_package");

    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var cells = row.getElementsByTagName("td");

        if (cells.length === 12) {
            var scenario = cells[0].textContent.trim();
            var cenario = cells[1].textContent.trim();
            var contexto = cells[2].textContent.trim();
            var funcionalidade = cells[3].textContent.trim();
            var given = cells[4].textContent.trim();
            var e1 = cells[5].textContent.trim();
            var e2 = cells[6].textContent.trim();
            var when = cells[7].textContent.trim();
            var then = cells[8].textContent.trim();
            var us1 = cells[9].textContent.trim();
            var us2 = cells[10].textContent.trim();
            var us3 = cells[11].textContent.trim();

            var gherkinScenario = `            Feature: ${cenario}
              ${contexto}

        @${scenario}
        Scenario: ${cenario}
        Given ${given}
        And ${e1}
        And ${e2}
        When ${when}
        Then ${then}`;

            var txtContent = gherkinScenario;
            var filePath = `scenarios_package/${cenario}.feature`;

            packageFolder.file(filePath, txtContent);
        }
    }

    zip.generateAsync({ type: "blob" }).then(function (content) {

        var downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(content);
        downloadLink.download = "scenarios_package.zip";
        downloadLink.style.display = "none";

        document.body.appendChild(downloadLink);

        downloadLink.click();

        document.body.removeChild(downloadLink);
    });
}

var btnGenerator = document.getElementById('btn-gneExpo');
btnGenerator.addEventListener('click', function () {
    let timerInterval
    Swal.fire({
        icon: 'success',
        title: 'Gerando features',
        html: 'desenvolvendo... <b></b> milliseconds.',
        timer: 3200,
        timerProgressBar: true,
        didOpen: () => {
            Swal.showLoading()
            const b = Swal.getHtmlContainer().querySelector('b')
            timerInterval = setInterval(() => {
                b.textContent = Swal.getTimerLeft()
            }, 100)
        },
        willClose: () => {
            clearInterval(timerInterval)
            convertTableToGherkinAndExport();
            convertTableToGherkinAndExportSteps();
        }
    }).then((result) => {
        if (result.dismiss === Swal.DismissReason.timer) {
            console.log('I was closed by the timer')
        }
    })
});

let mybutton = document.getElementById("myBtn");

window.onscroll = function () { scrollFunction() };

function scrollFunction() {
    if (document.body.scrollTop > 20 || document.documentElement.scrollTop > 20) {
        mybutton.style.display = "block";
    } else {
        mybutton.style.display = "none";
    }
}

function substituirEspacosPorUnderscores(frase) {
    return frase.replace(/\s/g, '_');
}

function convertTableToGherkinAndExportSteps() {
    var table = document.getElementById("tblSample");
    var rows = table.getElementsByTagName("tr");

    var zip = new JSZip();
    var packageFolder = zip.folder("scenarios_package_steps");

    for (var i = 1; i < rows.length; i++) {
        var row = rows[i];
        var cells = row.getElementsByTagName("td");

        if (cells.length === 12) {
            var scenario = cells[0].textContent.trim();
            var cenario = cells[1].textContent.trim();
            var contexto = cells[2].textContent.trim();
            var funcionalidade = cells[3].textContent.trim();
            var given = cells[4].textContent.trim();
            var e1 = cells[5].textContent.trim();
            var e2 = cells[6].textContent.trim();
            var when = cells[7].textContent.trim();
            var then = cells[8].textContent.trim();
            var us1 = cells[9].textContent.trim();
            var us2 = cells[10].textContent.trim();
            var us3 = cells[11].textContent.trim();

            let frase1 = substituirEspacosPorUnderscores(given);
            let frase2 = substituirEspacosPorUnderscores(e1);
            let frase3 = substituirEspacosPorUnderscores(e2);
            let frase4 = substituirEspacosPorUnderscores(when);
            let frase5 = substituirEspacosPorUnderscores(then);

            var gherkinScenario = `
        @Given("^${given}$")
        public void ${frase1}() throws Throwable {
          // Escreva aqui o código que transforma a frase acima em ações concretas
          throw new PendingException();
        }

        @And("^${e1}$")
        public void ${frase2}() throws Throwable {
          // Escreva aqui o código que transforma a frase acima em ações concretas
          throw new PendingException();
        }

        @And("^${e2}$")
        public void ${frase3}() throws Throwable {
          // Escreva aqui o código que transforma a frase acima em ações concretas
          throw new PendingException();
        }

        @When("^${when}$")
        public void ${frase4}() throws Throwable {
          // Escreva aqui o código que transforma a frase acima em ações concretas
          throw new PendingException();
        }

        @Then("^${then}$")
        public void ${frase5}() throws Throwable {
          // Escreva aqui o código que transforma a frase acima em ações concretas
          throw new PendingException();
        }`;

            var txtContent = gherkinScenario;
            var filePath = `scenarios_package_steps/${cenario}.java`;

            packageFolder.file(filePath, txtContent);
        }
    }

    zip.generateAsync({ type: "blob" }).then(function (content) {

        var downloadLink = document.createElement("a");
        downloadLink.href = URL.createObjectURL(content);
        downloadLink.download = "scenarios_package_steps.zip";
        downloadLink.style.display = "none";

        document.body.appendChild(downloadLink);

        downloadLink.click();

        document.body.removeChild(downloadLink);
    });
}