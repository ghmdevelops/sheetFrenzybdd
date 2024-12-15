document.getElementById('converterForm').addEventListener('submit', function (e) {
    e.preventDefault();

    let fields = ['name1', 'name5', 'name6', 'name7', 'name8'];
    let emptyFields = fields.filter(field => document.getElementById(field).value.trim() === '');

    if (emptyFields.length > 0) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            html: `
            <p style="
        font-family: Arial, sans-serif; 
        font-size: 16px; 
        color: #fff; 
        margin-bottom: 10px;
    ">
        Por favor, preencha todos os campos.
    </p>
                  `,
            confirmButtonColor: "#0f4178",
            confirmButtonText: "OK",
        });
        return;
    }

    let fileInput = document.getElementById('excelFile');
    if (!fileInput.files.length) {
        Swal.fire({
            icon: "error",
            title: "Oops...",
            html: `
            <p style="
        font-family: Arial, sans-serif; 
        font-size: 16px; 
        color: #fff; 
        margin-bottom: 10px;
    ">
Por favor, escolha um arquivo Excel.
    </p>
                  `,
            confirmButtonColor: "#0f4178",
            confirmButtonText: "OK",
        });
        return;
    }

    Swal.fire({
        title: 'Nome do arquivo',
        input: 'text',
        html: '<b style="color: #fff;">Por favor, insira o nome do arquivo.</b>',
        inputPlaceholder: 'Swift_Shift_Converter',
        showCancelButton: true,
        confirmButtonColor: "#0f4178",
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

                let requiredHeaders = ["Nº Cenário", "Cenário", "Contexto", "Funcionalidade", "Dado", "Quando", "Então", "Aplicação", "História", "Tipo de teste", "Teste de campo", "Status"];
                let actualHeaders = rows[0].map(header => header.trim());
                let missingHeaders = requiredHeaders.filter(header => !actualHeaders.includes(header));
                let extraHeaders = actualHeaders.filter(header => !requiredHeaders.includes(header));

                if (missingHeaders.length > 0 || extraHeaders.length > 0) {
                    let message = '';
                    if (missingHeaders.length > 0) {
                        message += `Os seguintes títulos estão faltando no arquivo: ${missingHeaders.join(', ')}. `;
                    }
                    if (extraHeaders.length > 0) {
                        message += `Os seguintes títulos são extras ou diferentes: ${extraHeaders.join(', ')}.por favor retirar.`;
                    }
                    Swal.fire({
                        icon: "error",
                        title: "Oops...",
                        html: `<p style="
            font-family: Arial, sans-serif; 
            font-size: 16px; 
            color: #fff; 
            margin-bottom: 10px;
        ">${message}</p>`,
                        confirmButtonColor: "#0f4178",
                        confirmButtonText: "OK",
                    });
                    return;
                }

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

            let workbook = XLSX.utils.book_new();

            let manualSheetData = [
                ["unique_id", "type", "name", "step_type", "step_description", "test_type", "test_subtype_udf", "test_group_udf", "product_areas", "covered_content", "designer", "description", "estimated_duration", "owner", "phase"]
            ];

            let uniqueId = 1;
            let namesSet = new Set();
            let duplicateNames = [];
            let duplicateRows = {};

            rows.slice(1).forEach((row, index) => {
                let name = row[1];

                if (namesSet.has(name)) {
                    if (!duplicateRows[name]) {
                        duplicateRows[name] = [];
                    }
                    duplicateRows[name].push(index + 2);
                    duplicateNames.push(`"${name}" na linha ${index + 2}`);
                } else {
                    namesSet.add(name);
                }

                let description = row[2];
                let aplicacao = row[7];
                let tipoTeste = row[9];
                let testeCampo = row[10];

                manualSheetData.push([
                    uniqueId, "test_manual", name, "", "", tipoTeste, testeCampo, aplicacao,
                    document.getElementById('name4').value, document.getElementById('name5').value,
                    document.getElementById('name6').value, description, "15",
                    document.getElementById('name6').value, "Ready"
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

            if (duplicateNames.length > 0) {
                Swal.fire({
                    icon: "error",
                    title: "Nomes duplicados encontrados!",
                    html: `<p style="font-family: Arial, sans-serif; font-size: 16px; color: #fff; margin-bottom: 10px;">
                           Os seguintes nomes estão duplicados: <br>${duplicateNames.join('<br>')}.<p style="color: #fff;">Por favor, remova os duplicados antes de prosseguir.</p></p>`,
                    confirmButtonColor: "#0f4178",
                    confirmButtonText: "OK",
                }).then(() => {
                    Swal.fire({
                        title: 'Adicionar números aos nomes duplicados?',
                        html: '<b style="color: #fff;">Deseja adicionar números sequenciais no final dos nomes duplicados para corrigir?</b>',
                        icon: 'question',
                        showCancelButton: true,
                        confirmButtonText: 'Sim',
                        cancelButtonText: 'Não',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            Object.keys(duplicateRows).forEach(name => {
                                let count = 1;
                                duplicateRows[name].forEach(rowIndex => {
                                    let newName = `${name} ${count}`;
                                    rows[rowIndex - 1][1] = newName;
                                    count++;
                                });
                            });

                            processExcelData(rows, fileName);
                        } else {
                            progressContainer.style.display = 'none';
                        }
                    });
                });
                return;
            }

            let manualSheet = XLSX.utils.aoa_to_sheet(manualSheetData);
            XLSX.utils.book_append_sheet(workbook, manualSheet, "manual tests");

            let testDataSheetData = [
                ["unique_id", "type", "name", "test_id", "product_areas", "covered_content", "designer", "description", "test_type", "owner", "jira_project_udf", "jira_sprint_udf", "ts_projectid_udf"]
            ];

            testDataSheetData.push([
                1, "test_suite", document.getElementById('name1').value, "", document.getElementById('name4').value, document.getElementById('name5').value,
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

            let wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            saveAs(new Blob([wbout], { type: "application/octet-stream" }), `${fileName}.xlsx`);

            Swal.fire({
                icon: "success",
                html: `<p style="font-family: Arial, sans-serif; font-size: 16px; color: #fff; margin-bottom: 10px;">
                O arquivo Excel foi criado com sucesso!<br><b style="color: #f5a623;">Não se esqueça de abrir o Excel e escolher um rótulo, como 'Público', 'Interno', etc.</b></p>`,
                confirmButtonColor: "#0f4178",
                confirmButtonText: "OK",
                timer: 7500,
                showConfirmButton: false,
                position: 'center',
                timerProgressBar: true,
            }).then(() => {
                Swal.fire({
                    title: 'Deseja limpar todos os campos?',
                    showCancelButton: true,
                    confirmButtonText: 'Sim, limpar',
                    cancelButtonText: 'Não',
                    confirmButtonColor: '#d33',
                    cancelButtonColor: '#3085d6',
                }).then((result) => {
                    if (result.isConfirmed) {
                        document.querySelector('form').reset();
                        Swal.fire(
                            'Campos limpos!',
                            'Todos os campos foram resetados.',
                            'success'
                        );
                    }
                });
                progressContainer.style.display = 'none';
            });
        }
    }, 100);
}

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
