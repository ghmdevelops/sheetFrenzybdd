document.getElementById('converterForm').addEventListener('submit', function (e) {
    e.preventDefault();

    let fields = ['name1', 'name2', 'name3', 'name4', 'name5', 'name6', 'name7', 'name8'];
    let emptyFields = fields.filter(field => document.getElementById(field).value.trim() === '');

    if (emptyFields.length > 0) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Por favor, preencha todos os campos.",
            confirmButtonColor: "#15c56d",
            confirmButtonText: "OK",
        });
        return;
    };

    let fileInput = document.getElementById('excelFile');
    if (!fileInput.files.length) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            text: "Por favor, escolha um arquivo Excel.",
            confirmButtonColor: "#15c56d",
            confirmButtonText: "OK",
        });
        return;
    }

    Swal.fire({
        title: 'Nome do arquivo',
        input: 'text',
        inputLabel: 'Por favor, insira o nome do arquivo:',
        inputPlaceholder: 'Swift_Shift_Converter',
        showCancelButton: true,
        confirmButtonColor: "#15c56d",
        confirmButtonText: 'OK',
        cancelButtonText: 'Cancelar',
        inputValidator: (value) => {
            if (!value) {
                return 'Você precisa inserir um nome para o arquivo!';
            }
        }
    }).then((result) => {
        if (result.isConfirmed) {
            let fileName = result.value;
            let file = fileInput.files[0];
            let reader = new FileReader();
            reader.onload = function (e) {
                let data = new Uint8Array(e.target.result);
                let workbook = XLSX.read(data, { type: 'array' });

                let firstSheet = workbook.Sheets[workbook.SheetNames[0]];
                let rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

                // Processar os dados do arquivo Excel
                processExcelData(rows, fileName);
            };
            reader.readAsArrayBuffer(file);
        }
    });
});

function processExcelData(rows, fileName) {
    let progressBar = document.getElementById('progressBar');
    let progressContainer = document.getElementById('progressContainer');
    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';

    let progress = 0;
    let interval = setInterval(() => {
        progress += 5;
        progressBar.style.width = progress + '%';
        if (progress >= 100) {
            clearInterval(interval);

            // Criar o arquivo Excel
            let workbook = XLSX.utils.book_new();

            // Criar a planilha manual tests
            let manualSheetData = [
                ["unique_id", "type", "name", "step_type", "step_description", "test_type", "test_subtype_udf", "test_group_udf", "product_areas", "covered_content", "designer", "description", "estimated_duration", "owner", "phase"]
            ];

            let uniqueId = 1;
            rows.slice(1).forEach((row, index) => {
                let name = row[1]; // Pegando o dado da coluna 1
                let description = row[2]; // Pegando o dado da coluna 2
                manualSheetData.push([
                    uniqueId, "test_manual", name, "", "", "Acceptance", document.getElementById('name2').value,
                    document.getElementById('name3').value, document.getElementById('name4').value, document.getElementById('name5').value,
                    document.getElementById('name6').value, description, "10 minutos", document.getElementById('name6').value, "Ready"
                ]);

                let dado = row[4];
                let quando = row[5];
                let entao = row[6];

                ["Dado que " + dado, "Quando " + quando, "Então " + entao].forEach((desc, i) => {
                    manualSheetData.push([
                        ++uniqueId, "step", "", (desc.startsWith("Então ")) ? "validation" : "simple", desc, "", "", "", "", "", "", "", "", "", ""
                    ]);
                });

                uniqueId++;
            });

            let manualSheet = XLSX.utils.aoa_to_sheet(manualSheetData);
            XLSX.utils.book_append_sheet(workbook, manualSheet, "manual tests");

            // Criar a planilha test suites
            let testDataSheetData = [
                ["unique_id", "type", "name", "test_id", "product_areas", "covered_content", "designer", "description", "test_type", "owner", "jira_project_udf", "jira_sprint_udf", "ts_projectid_udf"]
            ];

            testDataSheetData.push([
                1, "test_suite", document.getElementById('name1').value, "", "ug-transform-reports-fgts-batch", document.getElementById('name5').value,
                document.getElementById('name6').value, document.getElementById('name7').value, "Acceptance", document.getElementById('name6').value,
                "EMPPVD", document.getElementById('name8').value, "teste"
            ]);

            let testId = 1;
            for (let i = 2; i <= rows.length; i++) {
                testDataSheetData.push([
                    i, "test_manual", "", testId, "", "", "", "", "", "", "", "", ""
                ]);
                testId += 4;
            }

            let testDataSheet = XLSX.utils.aoa_to_sheet(testDataSheetData);
            XLSX.utils.book_append_sheet(workbook, testDataSheet, "test suites");

            // Salvar o arquivo Excel
            let wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            saveAs(new Blob([wbout], { type: "application/octet-stream" }), `${fileName}.xlsx`);

            Swal.fire({
                icon: "success",
                text: "O arquivo Excel foi criado com sucesso!",
                confirmButtonColor: "#15c56d",
                confirmButtonText: "OK",
            });
            progressContainer.style.display = 'none';
        }
    }, 100);
}

// Função para salvar o arquivo
function saveAs(blob, fileName) {
    let link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

document.getElementById('logoInit').addEventListener('click', function () {
    window.location.href = 'https://ghmdevelops.github.io/sheetFrenzybdd/';
});

console.log("\n%cAtenção Espere! %c\n\n\nEste é um recurso de navegador voltado para desenvolvedores. Se alguém disse para você copiar e colar algo aqui para ativar um recurso ou 'invadir' a maquina de outra pessoa, isso é uma fraude e você dará a ele acesso à sua maquina.\n\nConsulte ataques https://en.wikipedia.org/wiki/Self-XSS para obter mais informações.", "color: red; font-size: 46px;", "font-size: 16px;");
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;