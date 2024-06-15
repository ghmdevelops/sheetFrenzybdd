function processFile() {
    var input = document.getElementById('fileupload');
    var file = input.files[0];

    var reader = new FileReader();
    reader.onload = function (e) {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: 'array' });

        var sheetName = workbook.SheetNames[0];
        var sheet = workbook.Sheets[sheetName];
        var result = countStatus(sheet);

        displayResultsSweetAlert(result);
    };
    reader.readAsArrayBuffer(file);
}

function countStatus(sheet) {
    var data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    var statusCount = { 'ok': 0, 'nok': 0, 'desplanejado': 0, 'fazendo': 0 };

    for (var i = 1; i < data.length; i++) {
        var status = data[i][12].toLowerCase();
        if (status === 'ok') {
            statusCount.ok++;
        } else if (status === 'nok') {
            statusCount.nok++;
        } else if (status === 'desplanejado') {
            statusCount.desplanejado++;
        } else if (status === 'fazendo') {
            statusCount.fazendo++;
        }
    }
    return statusCount;
}

function displayResultsSweetAlert(result) {
    var total = result.ok + result.nok + result.desplanejado + result.fazendo;
    var percentages = {
        'ok': (result.ok / total * 100).toFixed(2),
        'nok': (result.nok / total * 100).toFixed(2),
        'desplanejado': (result.desplanejado / total * 100).toFixed(2),
        'fazendo': (result.fazendo / total * 100).toFixed(2)
    };

    var resultMessage = `
<div style="display: flex;">
    <div style="flex: 1;">
        <canvas id="myChart" width="400" height="300"></canvas>
    </div>
    <div style="flex: 1; margin-left: 20px;" id="div-charts">
        <p>Quantidade <i class="fa-solid fa-chart-pie"></i></p>
        <table id="chart-dash">
            <tr>
                <td>OK</td>
                <td>${result.ok}</td>
                <td>${percentages.ok}%</td>
            </tr>
            <tr>
                <td>NOK</td>
                <td>${result.nok}</td>
                <td>${percentages.nok}%</td>
            </tr>
            <tr>
                <td>Desplanejado</td>
                <td>${result.desplanejado}</td>
                <td>${percentages.desplanejado}%</td>
            </tr>
            <tr>
                <td>Fazendo</td>
                <td>${result.fazendo}</td>
                <td>${percentages.fazendo}%</td>
            </tr>
        </table>
    </div>
</div>
`;
    Swal.fire({
        title: 'Porcentagem <i class="fa-solid fa-percent"></i>',
        html: resultMessage,
        icon: 'info',
        showConfirmButton: false,
        didRender: () => {
            createChart(result);
        }
    });
}

function createChart(result) {
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'polarArea',
        data: {
            labels: ['OK', 'NOK', 'Desplanejado', 'Fazendo'],
            datasets: [{
                label: 'Contagem de Status',
                data: [result.ok, result.nok, result.desplanejado, result.fazendo],
                backgroundColor: [
                    'rgba(75, 192, 192, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 206, 86, 0.2)',
                    'rgba(255, 130, 0, 0.8)'
                ],
                borderColor: [
                    'rgba(75, 192, 192, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)',
                    'rgba(149, 99, 46, 0.8)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}