"use strict";

(() => {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    let importedFileName = "";
    let recognition = null;
    let isRecognitionActive = false;
    let linhasSublinhadas = [];
    let myChart = null;
    let myPieChart = null;
    let suggestionList = [];
    let activeInput = null;

    const TITULOS_PADRAO = ["Nº Cenário", "Cenário", "Contexto", "Funcionalidade", "Dado", "Quando", "Então", "Aplicação", "História", "Tipo de teste", "Teste de campo", "Status"];

    const swalToast = (icon, title, timer = 4000) => {
        const Toast = Swal.mixin({ toast: true, position: "top-end", showConfirmButton: false, timer, timerProgressBar: true, didOpen: t => { t.onmouseenter = Swal.stopTimer; t.onmouseleave = Swal.resumeTimer; } });
        Toast.fire({ icon, title });
    };

    const getTabela = () => $("#tabela");
    const getStatusColIndex = () => {
        const t = getTabela();
        if (!t) return 11;
        const head = t.tHead || t.createTHead();
        const row = head.rows[0];
        for (let i = 0; i < row.cells.length; i++) {
            if (row.cells[i].textContent.trim().toLowerCase() === "status") return i;
        }
        return 11;
    };

    const buildCT = i => `CT${String(i).padStart(4, "0")}`;

    const htmlBugForm = () => `
    <div style="max-height: 400px; overflow-y: auto;">
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-bugs"></i> Número do Bug</label><input type="text" id="bugNumber" class="swal2-input" placeholder="INC00000000" style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-globe"></i> Nome da Aplicação</label><input type="text" id="aplicacaoName" class="swal2-input" placeholder="aplicação..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-circle-info"></i> Descrição resumida</label><input type="text" id="torreName" class="swal2-input" placeholder="descrição resumida..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-user"></i> Aberto por</label><input type="text" id="abertoPor" class="swal2-input" placeholder="aberto por..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-list"></i> Tipo</label><input type="text" id="tipo" class="swal2-input" placeholder="tipo..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-tags"></i> Categoria</label><input type="text" id="categoria" class="swal2-input" placeholder="categoria..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-cloud"></i> Ambiente</label><input type="text" id="ambiente" class="swal2-input" placeholder="ambiente..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-cogs"></i> Serviço</label><input type="text" id="servico" class="swal2-input" placeholder="serviço..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-clipboard-check"></i> Estado</label><input type="text" id="estado" class="swal2-input" placeholder="estado..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-exclamation-triangle"></i> Impacto</label><input type="text" id="impacto" class="swal2-input" placeholder="impacto..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-bolt"></i> Urgência</label><input type="text" id="urgencia" class="swal2-input" placeholder="urgência..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-arrow-up"></i> Prioridade</label><input type="text" id="prioridade" class="swal2-input" placeholder="prioridade..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-users"></i> Grupo de Atribuição</label><input type="text" id="grupoAtribuicao" class="swal2-input" placeholder="grupo de atribuição..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-calendar"></i> Criado em</label><input type="date" id="criadoEm" class="swal2-input" style="width:100%"></div>
      </div>
    </div>
  `;

    const swalRadioGrid = (title, name, values, minWidth = 120) => Swal.fire({
        title,
        html: `
      <style>
        .swal2-container .swal2-popup .swal2-html-container{ text-align:center;color:#fff;font-family:Arial,sans-serif }
        .swal2-container .swal2-popup .swal2-html-container div{ display:grid;grid-template-columns:repeat(auto-fit,minmax(${minWidth}px,1fr));gap:15px;justify-items:start;padding:10px }
        .swal2-container .swal2-popup .swal2-html-container div label{ display:flex;align-items:center;font-size:16px;background:#333;padding:8px 12px;border-radius:5px;transition:all .3s ease;cursor:pointer }
        .swal2-container .swal2-popup .swal2-html-container div label:hover{ background:#555 }
        .swal2-container .swal2-popup .swal2-html-container div input{ margin-right:10px }
      </style>
      <div>${values.map(v => `<label><input type="radio" name="${name}" value="${v}"> ${v}</label>`).join("")}</div>
    `,
        showCancelButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
            const el = document.querySelector(`input[name="${name}"]:checked`);
            if (el) return el.value;
            Swal.showValidationMessage("Você precisa escolher um valor!");
            return false;
        }
    });

    const attachClickableInputsForRow = (row, header) => {
        for (let j = 1; j < row.cells.length; j++) {
            const headerText = header.cells[j]?.textContent.trim();
            const inp = row.cells[j].querySelector("input");
            if (!inp || !headerText) continue;
            if (headerText === "Aplicação") {
                inp.classList.add("clickable-input");
                inp.addEventListener("click", async function () {
                    const ret = await swalRadioGrid("Escolha um valor para Aplicação", "aplicacao", ["Web", "Serviço", "Desktop", "Infra", "Mainframe", "Mobile"]);
                    if (ret.isConfirmed) this.value = ret.value;
                });
            } else if (headerText === "Tipo de teste") {
                inp.classList.add("clickable-input");
                inp.addEventListener("click", async function () {
                    const ret = await swalRadioGrid("Escolha um valor para Tipo de Teste", "tipoteste", ["Acceptance", "End to End", "Regression", "Sanity", "Security", "Performance", "UI", "API"], 150);
                    if (ret.isConfirmed) this.value = ret.value;
                });
            } else if (headerText === "Teste de campo") {
                inp.classList.add("clickable-input");
                inp.addEventListener("click", async function () {
                    const ret = await Swal.fire({
                        title: "Escolha um valor para Teste de campo",
                        html: `
              <style>
                .swal2-container .swal2-popup .swal2-html-container{ text-align:center;color:#fff;font-family:Arial,sans-serif }
                .swal2-container .swal2-popup .swal2-html-container div{ display:flex;justify-content:center;gap:15px;padding:10px }
                .swal2-container .swal2-popup .swal2-html-container div label{ display:flex;align-items:center;font-size:18px;background:#333;padding:12px 20px;border-radius:8px;transition:all .3s ease;cursor:pointer;width:150px;justify-content:center;text-align:center }
                .swal2-container .swal2-popup .swal2-html-container div label:hover{ background:#555;transform:scale(1.05) }
                .swal2-container .swal2-popup .swal2-html-container div input{ margin-right:10px }
              </style>
              <div>
                <label><input type="radio" name="testecampo" value="Positivo"> Positivo</label>
                <label><input type="radio" name="testecampo" value="Negativo"> Negativo</label>
              </div>
            `,
                        showCancelButton: true,
                        confirmButtonText: "OK",
                        confirmButtonColor: "#3085d6",
                        cancelButtonText: "Cancelar",
                        preConfirm: () => {
                            const el = document.querySelector('input[name="testecampo"]:checked');
                            if (el) return el.value;
                            Swal.showValidationMessage("Você precisa escolher um valor!");
                            return false;
                        }
                    });
                    if (ret.isConfirmed) this.value = ret.value;
                });
            }
        }
    };

    const addDataToExistingTable = importedData => {
        const t = getTabela();
        if (!t) {
            updateTable(importedData);
            return;
        }
        const start = t.rows.length;
        for (let i = 0; i < importedData.length; i++) {
            const row = t.insertRow(start + i);
            for (let j = 0; j < importedData[i].length; j++) {
                const cell = row.insertCell(j);
                const input = document.createElement("input");
                input.type = "text";
                input.value = importedData[i][j] ?? "";
                cell.appendChild(input);
            }
        }
        attachClickableInputsForRow(t.rows[start], t.rows[0]);
    };

    const saveTable = () => {
        const t = getTabela();
        if (!t) return;
        const data = [];
        for (let i = 0; i < t.rows.length; i++) {
            const rowData = [];
            for (let j = 0; j < t.rows[i].cells.length; j++) {
                const input = t.rows[i].cells[j].querySelector("input");
                rowData.push(input ? input.value : t.rows[i].cells[j].textContent);
            }
            data.push(rowData);
        }
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Tabela");
        XLSX.writeFile(wb, importedFileName || "tabela.xlsx");
        swalToast("success", "Tabela salva com sucesso!");
    };

    const askVoice = async () => {
        const ret = await Swal.fire({
            title: "Deseja ativar o reconhecimento de voz?",
            html: '<p style="color:#fff">Você poderá preencher os campos usando sua voz.</p>',
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33"
        });
        if (ret.isConfirmed) ativarReconhecimentoDeVoz();
        else $("#audioButton")?.classList.remove("d-none");
    };

    const updateTable = async importedData => {
        const headerRow = importedData[0] || [];
        const existing = getTabela();
        if (existing) existing.remove();
        const newTable = document.createElement("table");
        newTable.id = "tabela";
        const thead = newTable.createTHead();
        const header = thead.insertRow(0);
        for (let i = 0; i < headerRow.length; i++) {
            const th = header.insertCell(i);
            th.textContent = headerRow[i];
            th.setAttribute("onclick", `ordenarColuna(${i})`);
            th.setAttribute("oncontextmenu", `excluirColuna(event, ${i}); return false;`);
            th.setAttribute("ondblclick", `inserirColuna(${i})`);
        }
        for (let j = 1; j < importedData.length; j++) {
            const row = newTable.insertRow(j);
            for (let k = 0; k < importedData[j].length; k++) {
                const cell = row.insertCell(k);
                const input = document.createElement("input");
                input.type = "text";
                input.value = importedData[j][k] ?? "";
                cell.appendChild(input);
            }
            attachClickableInputsForRow(row, header);
        }
        document.body.appendChild(newTable);
        await askVoice();
    };

    const ativarReconhecimentoDeVoz = () => {
        if (isRecognitionActive) {
            recognition.stop();
            isRecognitionActive = false;
            Swal.fire("Reconhecimento de voz desativado", "", "info");
            const btn = $("#audioButton");
            if (btn) btn.innerHTML = '<i class="fas fa-microphone"></i> Ativar Reconhecimento de Voz';
            return;
        }
        if (!("webkitSpeechRecognition" in window)) {
            Swal.fire("Erro", "Reconhecimento de voz não suportado neste navegador.", "error");
            return;
        }
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "pt-BR";
        recognition.onstart = () => {
            Swal.fire("Reconhecimento de voz ativado, pode começar a falar.", "", "success");
            const btn = $("#audioButton");
            if (btn) btn.innerHTML = '<i class="fas fa-microphone-slash"></i> Desativar Reconhecimento de Voz';
        };
        recognition.onerror = e => Swal.fire("Erro no reconhecimento de voz", e.error, "error");
        recognition.onresult = e => {
            let interim = "";
            for (let i = e.resultIndex; i < e.results.length; ++i) {
                if (e.results[i].isFinal) document.activeElement && (document.activeElement.value += e.results[i][0].transcript);
                else interim += e.results[i][0].transcript;
            }
        };
        recognition.onend = () => {
            const btn = $("#audioButton");
            if (isRecognitionActive) recognition.start();
            else if (btn) btn.innerHTML = '<i class="fas fa-microphone"></i> Ativar Reconhecimento de Voz';
        };
        recognition.start();
        isRecognitionActive = true;
        const btn = $("#audioButton");
        if (btn) btn.innerHTML = '<i class="fas fa-microphone-slash"></i> Desativar Reconhecimento de Voz';
    };

    const criarTabela = () => {
        const tabelaExistente = getTabela();
        if (tabelaExistente) tabelaExistente.remove();
        $("#qtd-lne")?.style && ($("#qtd-lne").style.display = "none");
        const rows = parseInt($("#rows")?.value || "0", 10);
        const cols = parseInt($("#cols")?.value || "0", 10);
        const tabela = document.createElement("table");
        tabela.id = "tabela";
        const cabecalho = tabela.createTHead().insertRow(0);
        for (let j = 0; j < cols; j++) {
            const th = cabecalho.insertCell(j);
            th.textContent = TITULOS_PADRAO[j] || `Coluna ${j}`;
            th.setAttribute("onclick", `ordenarColuna(${j})`);
            th.setAttribute("oncontextmenu", `excluirColuna(event, ${j}); return false;`);
            th.setAttribute("ondblclick", `inserirColuna(${j})`);
        }
        for (let i = 0; i < rows; i++) {
            const row = tabela.insertRow(i + 1);
            const cellCT = row.insertCell(0);
            cellCT.textContent = buildCT(i + 1);
            for (let j = 1; j < cols; j++) {
                const cell = row.insertCell(j);
                const input = document.createElement("input");
                input.type = "text";
                input.value = "";
                cell.appendChild(input);
            }
            const header = tabela.rows[0];
            attachClickableInputsForRow(row, header);
            const idxStatus = getStatusColIndex();
            if (row.cells[idxStatus]) row.cells[idxStatus].querySelector("input").value = "Pendente";
        }
        document.body.appendChild(tabela);
        $(".grade-buttons")?.classList.remove("d-none");
        $("#audioButton")?.classList.remove("d-none");
    };

    const atualizarEstiloLinhasSublinhadas = () => {
        const t = getTabela();
        if (!t) return;
        for (let i = 1; i < t.rows.length; i++) t.rows[i].style.textDecoration = linhasSublinhadas.includes(i) ? "underline" : "none";
    };

    const gerarNumerosAleatoriosComoString = (min, max) => Array.from({ length: 6 }, () => Math.floor(Math.random() * (max - min + 1)) + min).join("");

    const gerarArquivoFeature = radio => {
        const t = getTabela();
        const rowIndex = radio.parentElement.parentElement.rowIndex;
        const row = t.rows[rowIndex];
        const header = t.rows[0];
        let featureContent = "";
        const scenarioName = row.cells[1].querySelector("input")?.value || "";
        const ctNumber = row.cells[0].textContent.trim();
        featureContent += `Feature: ${scenarioName}\n\n`;
        featureContent += `Scenario: CT${gerarNumerosAleatoriosComoString(0, 9)}\n`;
        for (let j = 4; j < header.cells.length; j++) {
            const label = header.cells[j].textContent.toLowerCase().trim();
            if (["aplicação", "história", "tipo de teste", "status", "feature"].includes(label)) continue;
            const v = row.cells[j].querySelector("input")?.value || row.cells[j].textContent || "";
            featureContent += `${label} ${v}\n`;
        }
        const blob = new Blob([featureContent], { type: "text/plain;charset=utf-8" });
        const fileName = `${ctNumber}_${scenarioName}${rowIndex}.feature`.replace(/\s+/g, "_");
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const baixarSelecionados = () => {
        const radios = $$('input[type="radio"]:checked');
        if (!radios.length) {
            Swal.fire({ icon: "warning", html: "<b style='color:#fff'>Por favor, selecione pelo menos um item</b>", confirmButtonText: "OK", confirmButtonColor: "#FF8C00" });
            return;
        }
        radios.forEach(gerarArquivoFeature);
    };

    const ordenarColuna = colIndex => {
        const t = getTabela();
        if (!t) return;
        let switching = true;
        for (let i = 0; i < t.rows[0].cells.length; i++) {
            const cell = t.rows[0].cells[i];
            cell.draggable = true;
            cell.addEventListener("dragstart", e => cell.dataset.dragIndex = Array.from(t.rows[0].cells).indexOf(e.target));
            cell.addEventListener("dragover", e => e.preventDefault());
            cell.addEventListener("drop", e => {
                const dropIndex = Array.from(t.rows[0].cells).indexOf(e.target);
                const dragStartIndex = parseInt(cell.dataset.dragIndex || "-1", 10);
                if (dragStartIndex >= 0 && dragStartIndex !== dropIndex) moverColuna(dragStartIndex, dropIndex);
            });
        }
        while (switching) {
            switching = false;
            const rows = t.rows;
            for (let i = 1; i < rows.length - 1; i++) {
                let shouldSwitch = false;
                const x = rows[i].cells[colIndex].textContent.toLowerCase();
                const y = rows[i + 1].cells[colIndex].textContent.toLowerCase();
                if (x > y) {
                    rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                    switching = true;
                    break;
                }
            }
        }
    };

    const moverColuna = (startIndex, dropIndex) => {
        const t = getTabela();
        const rows = t.rows;
        for (let i = 0; i < rows.length; i++) {
            const clone = rows[i].cells[startIndex].cloneNode(true);
            const targetCell = rows[i].cells[dropIndex];
            rows[i].deleteCell(startIndex);
            if (startIndex < dropIndex) targetCell.parentNode.insertBefore(clone, targetCell.nextSibling);
            else targetCell.parentNode.insertBefore(clone, targetCell);
        }
    };

    const excluirColuna = (event, colIndex) => {
        event.preventDefault();
        const t = getTabela();
        if (!t) return;
        for (let i = 0; i < t.rows.length; i++) t.rows[i].deleteCell(colIndex);
    };

    const inserirColuna = colIndex => {
        const t = getTabela();
        if (!t) return;
        Swal.fire({
            title: "Digite o título da nova coluna:",
            input: "text",
            showCancelButton: true,
            confirmButtonText: "Inserir",
            confirmColor: "#1589FF",
            preConfirm: v => v
        }).then(res => {
            if (!res.value && res.value !== "") return;
            const novoTitulo = res.value || `Coluna ${colIndex + 1}`;
            const th = t.rows[0].insertCell(colIndex + 1);
            th.textContent = novoTitulo;
            th.setAttribute("onclick", `ordenarColuna(${colIndex + 1})`);
            th.setAttribute("oncontextmenu", `excluirColuna(event, ${colIndex + 1}); return false;`);
            th.setAttribute("ondblclick", `inserirColuna(${colIndex + 1})`);
            for (let i = 1; i < t.rows.length; i++) {
                const cell = t.rows[i].insertCell(colIndex + 1);
                const input = document.createElement("input");
                input.type = "text";
                input.value = "";
                cell.appendChild(input);
            }
        });
    };

    const adicionarColuna = () => {
        const t = getTabela();
        if (!t) {
            Swal.fire({ icon: "info", title: "Nenhuma tabela encontrada", text: "Não há nenhuma tabela disponível para adicionar colune.", confirmButtonColor: "#3085d6" });
            return;
        }
        Swal.fire({
            icon: "question",
            html: '<b style="color:#fff">Digite o índice da nova coluna (começando de 0)</b>',
            input: "text",
            showCancelButton: true,
            confirmButtonText: "Adicionar",
            confirmButtonColor: "#1589FF",
            cancelButtonText: "Cancelar",
            preConfirm: novoIndice => {
                let idx = parseInt(novoIndice, 10);
                if (isNaN(idx) || idx < 0 || idx > t.rows[0].cells.length) idx = t.rows[0].cells.length;
                return idx;
            }
        }).then(ret1 => {
            if (ret1.value === undefined) return;
            const idx = ret1.value;
            Swal.fire({
                icon: "question",
                html: '<b style="color:#fff">Digite o título da nova coluna</b>',
                input: "text",
                showCancelButton: true,
                confirmButtonText: "Adicionar",
                confirmButtonColor: "#1589FF",
                cancelButtonText: "Cancelar",
                preConfirm: novoTitulo => novoTitulo || `Coluna ${idx}`
            }).then(ret2 => {
                if (ret2.value === undefined) return;
                const novoTitulo = ret2.value;
                const th = document.createElement("th");
                th.textContent = novoTitulo;
                t.rows[0].insertBefore(th, t.rows[0].cells[idx] || null);
                th.setAttribute("onclick", `ordenarColuna(${idx})`);
                th.setAttribute("oncontextmenu", `excluirColuna(event, ${idx}); return false;`);
                th.setAttribute("ondblclick", `inserirColuna(${idx})`);
                for (let i = 1; i < t.rows.length; i++) {
                    const cell = t.rows[i].insertCell(idx);
                    const input = document.createElement("input");
                    input.type = "text";
                    input.value = "";
                    cell.appendChild(input);
                }
            });
        });
    };

    const adicionarColunaFeature = () => {
        const t = getTabela();
        if (!t) {
            Swal.fire({ icon: "info", title: "Nenhuma tabela encontrada", text: "Por favor, adicione uma tabela antes de adicionar uma coluna de features.", confirmButtonColor: "#3085d6" });
            return;
        }
        const headerRow = t.rows[0];
        for (let i = 0; i < headerRow.cells.length; i++) {
            if (headerRow.cells[i].textContent.trim().toLowerCase() === "feature") {
                Swal.fire({ icon: "info", title: "Coluna já existente", text: 'A coluna "Feature" já foi adicionada.', confirmButtonColor: "#3085d6" });
                return;
            }
        }
        const th = document.createElement("th");
        th.textContent = "Feature";
        headerRow.appendChild(th);
        for (let i = 1; i < t.rows.length; i++) {
            const cell = t.rows[i].insertCell(t.rows[i].cells.length);
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = `featureRadio${i}`;
            cell.appendChild(radio);
        }
        Swal.fire({ icon: "info", html: "<b style='color:#fff;'>Selecione os itens desejados e clique no botão Baixar</b>", confirmButtonText: "OK", confirmButtonColor: "#1589FF" });
    };

    const adicionarLinha = () => {
        const t = getTabela();
        if (!t) {
            Swal.fire({ icon: "info", title: "Nenhuma tabela encontrada", text: "Por favor, adicione uma tabela antes de adicionar linhas.", confirmButtonColor: "#3085d6" });
            return;
        }
        const newRow = t.insertRow(t.rows.length);
        if (!newRow) return;
        const header = t.rows[0];
        const cellCT = newRow.insertCell(0);
        cellCT.textContent = buildCT(t.rows.length - 1);
        for (let j = 1; j < header.cells.length; j++) {
            const cell = newRow.insertCell(j);
            const input = document.createElement("input");
            input.type = "text";
            input.value = "";
            cell.appendChild(input);
        }
        attachClickableInputsForRow(newRow, header);
        const idxStatus = getStatusColIndex();
        if (newRow.cells[idxStatus]) newRow.cells[idxStatus].querySelector("input").value = "Pendente";
    };

    const apagarLinha = () => {
        const t = getTabela();
        if (!t) return;
        if (t.rows.length > 2) t.deleteRow(t.rows.length - 1);
        else Swal.fire({ icon: "warning", html: "Não é possível excluir a última linha.", confirmButtonText: "OK", confirmButtonColor: "#FF8C00" });
    };

    const convertToXML = data => {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n';
        data.forEach(row => {
            xml += "  <row>\n";
            row.forEach(cell => {
                const safe = String(cell ?? "").replace(/[<&>]/g, m => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[m]));
                xml += `    <cell>${safe}</cell>\n`;
            });
            xml += "  </row>\n";
        });
        xml += "</data>";
        return xml;
    };

    const toYAML = data => data.map(r => `- [${r.map(c => `"${String(c ?? "").replace(/"/g, '\\"')}"`).join(", ")}]`).join("\n");

    const downloadBlob = (content, name, type) => {
        const blob = new Blob([content], { type });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const openEmailClient = (recipientEmail, senderEmail) => {
        const subject = encodeURIComponent("BDD");
        const body = encodeURIComponent("Prezado [Nome do Destinatário],\n\nEstou enviando este e-mail para fornecer o arquivo solicitado discutido durante nossa última conversa. O arquivo anexo contém o BDD. Por favor, revise o arquivo e sinta-se à vontade para entrar em contato caso tenha alguma dúvida ou se precisar de informações adicionais. Estou à disposição para discutir qualquer ponto que você considere relevante.\n\nAgradeço antecipadamente pelo seu tempo e colaboração.\n\nAtenciosamente.");
        const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}${senderEmail ? `&cc=${senderEmail}` : ""}`;
        window.location.href = mailtoLink;
    };

    const abrirModalEmail = async () => {
        const r1 = await Swal.fire({
            text: "Digite o endereço de e-mail do destinatário",
            input: "email",
            inputPlaceholder: "destinatario@example.com",
            confirmButtonText: "Próximo",
            confirmButtonColor: "#1589FF",
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            inputValidator: v => (!v ? "Por favor, preencha o endereço de e-mail do destinatário!" : undefined)
        });
        if (!r1.isConfirmed || !r1.value) return;
        const r2 = await Swal.fire({
            text: "E-mail Cc: com cópia",
            input: "email",
            inputPlaceholder: "seuemail@example.com",
            confirmButtonText: "Enviar",
            confirmButtonColor: "#1589FF",
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            inputValidator: v => (!v ? "Por favor, preencha seu endereço de e-mail!" : undefined)
        });
        if (r1.value) openEmailClient(r1.value, r2.value || "");
    };

    const removeDropdowns = () => $$(".autocomplete-dropdown").forEach(d => d.parentNode.removeChild(d));

    const createDropdown = (target, suggestions) => {
        const dropdown = document.createElement("ul");
        dropdown.className = "autocomplete-dropdown";
        dropdown.style.listStyle = "none";
        dropdown.style.margin = "0";
        dropdown.style.padding = "6px 0";
        dropdown.style.background = "#222";
        dropdown.style.border = "1px solid #444";
        dropdown.style.borderRadius = "8px";
        dropdown.style.position = "absolute";
        dropdown.style.zIndex = "9999";
        suggestions.forEach(s => {
            const li = document.createElement("li");
            li.textContent = s;
            li.style.padding = "8px 12px";
            li.style.cursor = "pointer";
            li.addEventListener("mouseenter", () => li.style.background = "#333");
            li.addEventListener("mouseleave", () => li.style.background = "transparent");
            dropdown.appendChild(li);
        });
        dropdown.addEventListener("click", e => {
            if (e.target.tagName === "LI") {
                target.value = e.target.textContent;
                removeDropdowns();
            }
        });
        return dropdown;
    };

    const positionDropdown = (target, dropdown) => {
        const rect = target.getBoundingClientRect();
        dropdown.style.left = `${rect.left + window.scrollX}px`;
        dropdown.style.top = `${rect.bottom + window.scrollY + 4}px`;
        dropdown.style.width = `${Math.max(target.offsetWidth, 260)}px`;
        dropdown.style.maxHeight = "240px";
        dropdown.style.overflowY = "auto";
    };

    const copiarParaTodos = async () => {
        const t = getTabela();
        if (!t) {
            Swal.fire({ icon: "info", title: "Nenhuma tabela encontrada", text: "Por favor, adicione uma tabela antes de copiar valores.", confirmButtonColor: "#3085d6" });
            return;
        }
        const ret = await Swal.fire({
            title: "Escolha a coluna e o intervalo de linhas",
            html: `
        <b>Escolha a coluna e o intervalo de linhas</b><br>
        <div class="mb-3"><label style="color:#fff" class="form-label"><i class="fa-solid fa-list-ul"></i> Índice da Coluna</label><input type="text" id="colIndex" class="form-control swal2-input" placeholder="0"></div>
        <div class="mb-3"><label style="color:#fff" class="form-label"><i class="fa-solid fa-arrow-down-up-across-line"></i> Intervalo de Linhas</label><input type="text" id="rowRange" class="form-control swal2-input" placeholder="1 a ${t.rows.length - 1}"></div>
        <div class="mb-3"><label style="color:#fff" class="form-label"><i class="fa-solid fa-signature"></i> Texto a ser inserido</label><input type="text" id="textToInsert" class="form-control swal2-input" placeholder="Texto"></div>
      `,
            showCancelButton: true,
            confirmButtonText: "Copiar",
            confirmButtonColor: "#1589FF",
            cancelButtonText: "Cancelar",
            preConfirm: () => {
                const colIndex = parseInt($("#colIndex").value, 10);
                const rowRange = $("#rowRange").value.trim();
                const textToInsert = $("#textToInsert").value.trim();
                if (isNaN(colIndex) || colIndex < 0 || colIndex >= t.rows[0].cells.length) {
                    Swal.showValidationMessage("Índice da coluna inválido.");
                    return false;
                }
                const m = rowRange.match(/^(\d+)\s*a\s*(\d+)$/);
                if (!m) {
                    Swal.showValidationMessage(`Formato inválido para o intervalo de linhas. Use o formato: "1 a ${t.rows.length - 1}".`);
                    return false;
                }
                const startRow = parseInt(m[1], 10);
                const endRow = parseInt(m[2], 10);
                if (isNaN(startRow) || isNaN(endRow) || startRow < 1 || endRow >= t.rows.length || endRow < startRow) {
                    Swal.showValidationMessage("Intervalo de linhas inválido.");
                    return false;
                }
                return { colIndex, startRow, endRow, textToInsert };
            }
        });
        if (!ret.value) return;
        const { colIndex, startRow, endRow, textToInsert } = ret.value;
        for (let i = startRow; i <= endRow; i++) {
            const input = t.rows[i].cells[colIndex].querySelector("input");
            if (input) input.value = textToInsert;
        }
    };

    const filtrarPorCT = () => {
        const t = getTabela();
        const filtroValor = $("#filtroCT")?.value.trim().toLowerCase() || "";
        if (!filtroValor) {
            Swal.fire({ icon: "warning", text: "Por favor insira um valor antes de pesquisar.", confirmButtonText: "OK", confirmButtonColor: "#FF8C00" });
            return;
        }
        for (let i = 1; i < t.rows.length; i++) {
            const ctNumero = t.rows[i].cells[0].textContent.toLowerCase();
            if (ctNumero.includes(filtroValor)) t.rows[i].classList.add("filtrado");
            else t.rows[i].classList.remove("filtrado");
        }
        const primeira = t.querySelector(".filtrado");
        if (primeira) {
            primeira.scrollIntoView({ behavior: "smooth" });
            setTimeout(() => primeira.classList.remove("filtrado"), 3000);
        }
    };

    const contarOcorrencias = (data, palavra) => data.reduce((acc, v) => acc + (String(v).toLowerCase() === String(palavra).toLowerCase() ? 1 : 0), 0);

    const contarNumeros = () => {
        const t = getTabela();
        const numeroLinhas = t ? t.rows.length - 1 : 0;
        let numeroOK = 0, numeroNOK = 0, numeroDesplanejado = 0, numeroProgredindo = 0, numeroBug = 0;
        const col = getStatusColIndex();
        if (!t) return { numeroLinhas, numeroOK, numeroNOK, numeroDesplanejado, numeroProgredindo, numeroBug };
        for (let i = 1; i < t.rows.length; i++) {
            const valor = (t.rows[i].cells[col].querySelector("input")?.value || "").trim().toLowerCase();
            if (valor.includes("bug")) numeroBug++;
            else if (valor === "ok") numeroOK++;
            else if (valor === "pendente") numeroNOK++;
            else if (valor === "desplanejado") numeroDesplanejado++;
            else if (valor === "progredindo") numeroProgredindo++;
        }
        return { numeroLinhas, numeroOK, numeroNOK, numeroDesplanejado, numeroProgredindo, numeroBug };
    };

    const atualizarResumoBDD = (qOk, qNok, qDes, qProg, qBug, tCob, tFal, tBug) => {
        const total = qOk + qNok + qDes + qProg + qBug;
        const resumoContainer = $("#resumoBDD");
        if (!resumoContainer) return;
        const item = (label, q, color) => `
      <div style="display:flex;align-items:center;margin-bottom:20px">
        <span style="width:170px;display:inline-block;font-size:20px;font-family:'Poppins',sans-serif">${label}:</span>
        <div style="width:280px;height:25px;background-color:rgba(200,200,200,.3);position:relative;border-radius:15px;overflow:hidden;box-shadow:inset 0 6px 8px rgba(0,0,0,.1)">
          <div style="width:${total ? ((q / total) * 100) : 0}%;height:100%;background-color:${color};border-radius:15px"></div>
        </div>
        <span style="margin-left:15px;font-size:20px;font-family:'Poppins',sans-serif">${q}</span>
      </div>
    `;
        resumoContainer.innerHTML = `
      <div style="padding:30px;border-radius:20px;background-color:#f4f4f4;border:1px solid #ddd;margin-top:25px;box-shadow:0 6px 25px rgba(0,0,0,.15)">
        <div style="font-size:28px;font-weight:bold;color:#333;font-family:'Poppins',sans-serif">Resumo do BDD - ${new Date().toLocaleString()}</div>
        <div style="margin-top:20px">
          <div style="margin-bottom:20px;font-size:20px;font-family:'Poppins',sans-serif"><strong>Número de Linhas BDD: </strong>${total}</div>
          ${item("Nº Cenários Feitos", qOk, "rgba(78,205,196,1)")}
          ${item("Nº Cenários Pedentes", qNok, "rgba(255,107,107,1)")}
          ${item("Nº Cenários Desplanejado", qDes, "rgba(255,234,167,1)")}
          ${item("Nº Cenários em Progresso", qProg, "rgba(116,185,255,1)")}
          ${item("Nº Cenários com Bug", qBug, "rgba(162,155,254,1)")}
          <div style="font-size:22px;margin-top:30px;font-family:'Poppins',sans-serif"><strong>Taxa de Cobertura:</strong> ${tCob.toFixed(2)}%</div>
        </div>
      </div>
    `;
    };

    const atualizarCards = (qOk, qNok, qDes, qProg, qBug) => {
        $("#cardOk") && ($("#cardOk").textContent = qOk);
        $("#cardNok") && ($("#cardNok").textContent = qNok);
        $("#cardDesplanejado") && ($("#cardDesplanejado").textContent = qDes);
        $("#cardProgredindo") && ($("#cardProgredindo").textContent = qProg);
        $("#cardBug") && ($("#cardBug").textContent = qBug);
    };

    const criarDashboard = data => {
        const ctx = $("#graficoModal")?.getContext("2d");
        const pieCtx = $("#graficoPizza")?.getContext("2d");
        if (!ctx || !pieCtx) return;
        if (myChart) myChart.destroy();
        if (myPieChart) myPieChart.destroy();
        const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
        const colors = {
            light: { bg: ['rgba(63,191,191,1)', 'rgba(249,8,8,1)', 'rgba(255,205,86,1)', 'rgba(54,162,235,1)', 'rgba(146,110,244,1)'], text: '#333', tip: 'rgba(0,0,0,.8)' },
            dark: { bg: ['rgba(63,191,191,.8)', 'rgba(255,79,132,.8)', 'rgba(255,205,86,.8)', 'rgba(54,162,235,.8)', 'rgba(146,110,244,.8)'], text: '#ddd', tip: 'rgba(255,255,255,.8)' }
        };
        const quantidadeOk = contarOcorrencias(data, "ok");
        const quantidadeNok = contarOcorrencias(data, "pendente");
        const quantidadeDesplanejado = contarOcorrencias(data, "desplanejado");
        const quantidadeProgredindo = contarOcorrencias(data, "progredindo");
        const quantidadeBug = data.filter(v => String(v).toLowerCase().includes("bug")).length;
        const total = data.length || 1;
        const labels = ["Realizados", "Pendente", "Desplanejado", "Progredindo", "Bug"];
        const barData = [quantidadeOk, quantidadeNok, quantidadeDesplanejado, quantidadeProgredindo, quantidadeBug];
        const lineData = barData.map(v => (v / total) * 100);
        myChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels, datasets: [
                    { label: "Quantidade", data: barData, backgroundColor: colors[theme].bg, borderWidth: 1 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, labels: { color: colors[theme].text } },
                    tooltip: { backgroundColor: colors[theme].tip }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { color: colors[theme].text }, grid: { color: theme === "dark" ? "#555" : "#ccc" } },
                    x: { ticks: { color: colors[theme].text }, grid: { color: theme === "dark" ? "#555" : "#ccc" } }
                }
            }
        });
        myPieChart = new Chart(pieCtx, {
            type: "pie",
            data: { labels: ["Concluído", "Restante"], datasets: [{ data: [((quantidadeOk + quantidadeProgredindo) / total) * 100, 100 - ((quantidadeOk + quantidadeProgredindo) / total) * 100] }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { color: colors[theme].text } }, tooltip: { backgroundColor: colors[theme].tip } } }
        });
        const { numeroLinhas, numeroOK, numeroNOK, numeroDesplanejado, numeroProgredindo, numeroBug } = contarNumeros();
        const porcentagemOK = (numeroOK / Math.max(numeroLinhas, 1)) * 100;
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        const HH = String(d.getHours()).padStart(2, "0");
        const MM = String(d.getMinutes()).padStart(2, "0");
        const dataFormatada = `${dd}/${mm}/${yyyy} ${HH}:${MM}`;
        const resumo = $("#porcentagemOK");
        if (resumo) resumo.innerHTML = `<h5>Resumo do BDD - ${dataFormatada}</h5><p><span class='label'>Número de Linhas BDD:</span> ${numeroLinhas}</p><p><span class='label'>Nº Ok:</span> ${numeroOK}</p><p><span class='label'>Nº Pendente:</span> ${numeroNOK}</p><p><span class='label'>Nº Desplanejado:</span> ${numeroDesplanejado}</p><p><span class='label'>Nº Progredindo:</span> ${numeroProgredindo}</p><p><span class='label'>Nº Bug:</span> ${numeroBug}</p><p><span class='label'>Porcentagem:</span> ${porcentagemOK.toFixed(2)}%</p>`;
        const pb = $("#progressBar");
        if (pb) { pb.style.width = `${porcentagemOK}%`; pb.setAttribute("aria-valuenow", String(porcentagemOK)); pb.innerHTML = `<span>${porcentagemOK.toFixed(2)}%</span>`; }
        $("#showBugScenariosBtn")?.addEventListener("click", mostrarCenariosBug, { once: true });
    };

    const gerarDashboard = () => {
        const t = getTabela();
        if (!t) return;
        const col = getStatusColIndex();
        const data = [];
        for (let i = 1; i < t.rows.length; i++) {
            const input = t.rows[i].cells[col].querySelector("input");
            if (input) data.push((input.value || "").toLowerCase());
        }
        criarDashboard(data);
        const { numeroLinhas, numeroOK, numeroNOK, numeroDesplanejado, numeroProgredindo, numeroBug } = contarNumeros();
        const taxaCobertura = ((numeroOK + numeroNOK + numeroBug) / Math.max(numeroLinhas, 1)) * 100;
        const taxaFalhas = (numeroNOK / Math.max(numeroLinhas, 1)) * 100;
        const taxaBugs = (numeroBug / Math.max(numeroLinhas, 1)) * 100;
        atualizarResumoBDD(numeroOK, numeroNOK, numeroDesplanejado, numeroProgredindo, numeroBug, taxaCobertura, taxaFalhas, taxaBugs);
        atualizarCards(numeroOK, numeroNOK, numeroDesplanejado, numeroProgredindo, numeroBug);
        const modalEl = $("#myModal");
        if (modalEl && window.bootstrap?.Modal) new bootstrap.Modal(modalEl).show();
    };

    const mostrarCenariosBug = () => {
        const t = getTabela();
        if (!t) return [];
        const col = getStatusColIndex();
        const modalBody = $("#modalBody");
        const colunasIgnoradas = ["Contexto", "Funcionalidade", "Dado", "E", "Quando", "Então", "Aplicação", "História", "Tipo de teste"];
        const cenarios = [];
        if (modalBody) modalBody.innerHTML = "";
        for (let i = 1; i < t.rows.length; i++) {
            const input = t.rows[i].cells[col].querySelector("input");
            if (input && input.value.toLowerCase().includes("bug")) {
                const cenario = { nome: t.rows[i].cells[0].textContent, dados: [] };
                for (let j = 1; j < t.rows[i].cells.length; j++) {
                    const header = t.rows[0].cells[j]?.textContent;
                    if (!header || colunasIgnoradas.includes(header)) continue;
                    const v = t.rows[i].cells[j].querySelector("input")?.value || t.rows[i].cells[j].textContent || "";
                    cenario.dados.push(v);
                }
                cenarios.push(cenario);
            }
        }
        if (!cenarios.length) {
            Swal.fire({ icon: "info", title: "Nenhum cenário com bug encontrado", text: 'Não há nenhum cenário na tabela com o status "bug".', confirmButtonColor: "#3085d6" });
        } else if (modalBody) {
            cenarios.forEach(c => {
                const p = document.createElement("p");
                p.textContent = `${c.nome} ${c.dados.join(" ")}`;
                modalBody.appendChild(p);
            });
            const modalEl = $("#myModal");
            if (modalEl && window.bootstrap?.Modal) new bootstrap.Modal(modalEl).show();
        }
        return cenarios;
    };

    const hideButtons = () => {
        $$(".modal-footer button").forEach(b => b.style.display = "none");
        $(".modal-header button.close") && ($(".modal-header button.close").style.display = "none");
    };
    const showButtons = () => {
        $$(".modal-footer button").forEach(b => b.style.display = "");
        $(".modal-header button.close") && ($(".modal-header button.close").style.display = "");
    };

    const takeScreenshotAndDownload = () => {
        hideButtons();
        html2canvas($(".modal-content"), { scrollY: -window.scrollY, scale: 2, useCORS: true }).then(canvas => {
            const dataUrl = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = "dashboard-bdd.png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showButtons();
        });
    };

    const copyDashEmail = () => {
        hideButtons();
        const textToCopy = "Observação: O projeto está progredindo bem, com a maioria dos cenários funcionando como esperado. No entanto, há alguns cenários que precisam de atenção adicional. A equipe deve priorizar a resolução dos cenários e continuar monitorando o progresso. Para mais detalhes, consulte o dashboard visual anexado.";
        html2canvas($(".modal-content"), { scrollY: -window.scrollY, scale: 2, useCORS: true }).then(canvas => {
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "black";
            ctx.font = "16px Arial";
            const lines = textToCopy.match(/.{1,90}(\s|$)/g) || [textToCopy];
            let y = canvas.height - 20 - (lines.length * 18);
            lines.forEach(l => { ctx.fillText(l.trim(), 20, y); y += 18; });
            showButtons();
            canvas.toBlob(blob => {
                const item = new ClipboardItem({ "image/png": blob });
                navigator.clipboard.write([item]).then(() => Swal.fire({ icon: "success", title: "Copiado!", text: "Imagem copiada com o texto adicionado!", showConfirmButton: false, timer: 1500 })).catch(() => Swal.fire({ icon: "error", title: "Erro ao copiar", text: "Ocorreu um problema ao copiar os dados. Por favor, tente novamente." }));
            });
        });
    };

    const toggleIcon = () => {
        const button = $("#toggleButton");
        const icon = button?.querySelector("i");
        if (!icon) return;
        if (icon.classList.contains("fa-magnifying-glass-chart")) {
            icon.classList.remove("fa-magnifying-glass-chart");
            icon.classList.add("fa-sync-alt");
        } else {
            icon.classList.remove("fa-sync-alt");
            icon.classList.add("fa-sync-alt");
        }
    };

    const printPDF = async () => {
        const { jsPDF } = window.jspdf;
        const content = $(".modal-content");
        if (!content) return;
        const canvas = await html2canvas(content);
        const imgData = canvas.toDataURL("image/png");
        const doc = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        const d = new Date();
        const dia = String(d.getDate()).padStart(2, "0");
        const mes = String(d.getMonth() + 1).padStart(2, "0");
        const ano = d.getFullYear();
        const horas = String(d.getHours()).padStart(2, "0");
        const minutos = String(d.getMinutes()).padStart(2, "0");
        doc.save(`dashboard_${dia}/${mes}/${ano} ${horas}:${minutos}.pdf`);
    };

    const baixarExcel = async () => {
        const t = getTabela();
        const rProj = await Swal.fire({
            title: "Informações do Projeto",
            html: `
        <input id="swal-input1" class="swal2-input custom-swal-input" placeholder="Titulo do bdd" style="margin-bottom:10px;background-color:#333;color:#eee;border:1px solid #555;">
        <input id="swal-input2" class="swal2-input custom-swal-input" placeholder="ID Octane (909043)" style="margin-bottom:10px;background-color:#333;color:#eee;border:1px solid #555;">
        <input id="swal-input3" class="swal2-input custom-swal-input" placeholder="T ou X do Usuário" style="margin-bottom:10px;background-color:#333;color:#eee;border:1px solid #555;">
        <input id="swal-input4" class="swal2-input custom-swal-input" placeholder="Chave Jira" style="background-color:#333;color:#eee;border:1px solid #555;">
      `,
            focusConfirm: false,
            preConfirm: () => {
                const tituloTeste = $("#swal-input1").value;
                const idOctane = $("#swal-input2").value;
                const usuarioTx = $("#swal-input3").value;
                const chaveJira = $("#swal-input4").value;
                if (!tituloTeste || !idOctane || !usuarioTx) {
                    Swal.showValidationMessage("Por favor, preencha todos os campos obrigatórios (Título, ID Octane, Usuário).");
                    return false;
                }
                return { tituloTeste, idOctane, usuarioTx, chaveJira };
            },
            customClass: { popup: "custom-swal-popup" },
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#0f4178",
            cancelButtonColor: "#d33"
        });
        if (!rProj.isConfirmed) {
            Swal.fire({ icon: "info", title: "Operação Cancelada", text: "Os dados não foram preenchidos e a exportação foi cancelada.", timer: 2000, showConfirmButton: false, background: "#333", color: "#eee" });
            return;
        }
        const { tituloTeste, idOctane, usuarioTx, chaveJira } = rProj.value;
        $("#name1") && ($("#name1").value = tituloTeste);
        $("#name8") && ($("#name8").value = idOctane);
        $("#name6") && ($("#name6").value = usuarioTx);
        if (!t || t.rows.length === 0) {
            Swal.fire({ icon: "info", title: "Nenhuma tabela encontrada", text: "Não há nenhuma tabela disponível para exportação.", confirmButtonColor: "#0d6efd", confirmButtonText: "OK" });
            return;
        }
        const data = [];
        for (let i = 0; i < t.rows.length; i++) {
            const rowData = [];
            for (let j = 0; j < t.rows[i].cells.length; j++) {
                const input = t.rows[i].cells[j].querySelector("input");
                rowData.push(input ? input.value : t.rows[i].cells[j].textContent);
            }
            data.push(rowData);
        }
        const rFmt = await Swal.fire({
            title: "Escolha um formato de exportação",
            input: "select",
            inputOptions: { excel: "Excel", json: "JSON", xml: "XML", yaml: "YAML" },
            inputPlaceholder: "Selecione um formato",
            showCancelButton: true,
            confirmButtonText: "Exportar",
            confirmButtonColor: "#006400",
            cancelButtonText: "Cancelar",
            inputValidator: v => (!v ? "Você precisa escolher um formato!" : undefined)
        });
        if (!rFmt.value) return;
        const suggested = [tituloTeste, idOctane, usuarioTx, chaveJira].filter(Boolean).join("-").replace(/\s+/g, "_");
        const rName = await Swal.fire({
            title: "Digite o nome do arquivo",
            input: "text",
            inputPlaceholder: "nome do arquivo...",
            inputValue: suggested || "arquivo",
            confirmButtonText: "Baixar",
            confirmButtonColor: "#006400",
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            inputValidator: v => (!v ? "Por favor, preencha o nome do arquivo!" : undefined)
        });
        if (!rName.value) {
            swalToast("info", "Operação cancelada!");
            return;
        }
        const fileName = rName.value;
        if (rFmt.value === "excel") {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, "Tabela");
            XLSX.writeFile(wb, `${fileName}.xlsx`);
            swalToast("success", `Excel baixado com sucesso: ${fileName}`);
        } else if (rFmt.value === "json") {
            downloadBlob(JSON.stringify(data), `${fileName}.json`, "application/json");
            swalToast("success", `JSON baixado com sucesso: ${fileName}`);
        } else if (rFmt.value === "xml") {
            downloadBlob(convertToXML(data), `${fileName}.xml`, "application/xml");
            swalToast("success", `XML baixado com sucesso: ${fileName}`);
        } else if (rFmt.value === "yaml") {
            downloadBlob(toYAML(data), `${fileName}.yaml`, "text/yaml");
            swalToast("success", `YAML baixado com sucesso: ${fileName}`);
        }
    };

    const importExcel = async () => {
        const input = $("#importExcel");
        const file = input?.files?.[0];
        if (file) {
            importedFileName = file.name;
            const reader = new FileReader();
            const fileNameWithoutExtension = importedFileName.replace(/\.[^/.]+$/, "");
            reader.onload = e => {
                const data = e.target.result;
                const workbook = XLSX.read(data, { type: "binary" });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const importedData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
                addDataToExistingTable(importedData);
                const lbl = $("#exampleModalLabel");
                if (lbl) lbl.innerHTML = `<img width="40" src="./src/img/logoPage200.png" alt="cm"> Dashboard<b style="color:#16db6b"> BDD</b> - ${fileNameWithoutExtension}`;
                swalToast("success", `Arquivo '${file.name}' importado!`);
                $("#saveButtonContainer") && ($("#saveButtonContainer").style.display = "block");
            };
            reader.readAsBinaryString(file);
        } else {
            alert("Por favor, selecione um arquivo Excel para importar.");
        }
        const ret = await Swal.fire({
            title: "Deseja ativar o reconhecimento de voz?",
            html: '<p style="color:#fff;">Você poderá preencher os campos usando sua voz.</p>',
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33"
        });
        if (ret.isConfirmed) ativarReconhecimentoDeVoz();
        else $("#audioButton") && ($("#audioButton").style.display = "block");
        $(".grade-buttons")?.classList.remove("d-none");
        $("#audioButton")?.classList.remove("d-none");
        $("#dashboardButton")?.classList.add("d-none");
        $("#card-btns")?.classList.add("d-none");
        $(".div-btns-lines003")?.classList.add("d-none");
        $("#customButtonEx")?.classList.add("d-none");
    };

    const alternarVisibilidade = () => {
        const campoFiltro = $("#filtroCT");
        const segundoBotao = $("#segundoBotao");
        if (campoFiltro) campoFiltro.style.display = (campoFiltro.style.display === "none" || campoFiltro.style.display === "") ? "block" : "none";
        if (segundoBotao) segundoBotao.style.display = (segundoBotao.style.display === "none" || segundoBotao.style.display === "") ? "block" : "none";
    };

    const toggleButtons = clickedBtnId => {
        const featuresBtn = $("#featuresBtn");
        const baixarBtn = $("#baixarBtn");
        const voltarBtn = $("#voltarBtn");
        featuresBtn?.classList.remove("selected");
        baixarBtn?.classList.remove("selected");
        const clicked = document.getElementById(clickedBtnId);
        clicked && clicked.classList.add("selected");
        if (featuresBtn) featuresBtn.classList.toggle("hide", featuresBtn.classList.contains("selected"));
        if (baixarBtn) baixarBtn.classList.toggle("hide", baixarBtn.classList.contains("selected"));
        if (voltarBtn && baixarBtn) voltarBtn.classList.toggle("hide", !baixarBtn.classList.contains("selected"));
    };

    const startIncrement = (el, step = 1) => setInterval(() => el.value = String(parseInt(el.value || "0", 10) + step), 100);
    const startDecrement = (el, step = 1) => setInterval(() => el.value = String(Math.max(0, parseInt(el.value || "0", 10) - step)), 100);

    document.addEventListener("DOMContentLoaded", () => {
        document.addEventListener("dblclick", e => {
            const target = e.target;
            if (target.tagName === "INPUT" && target.type === "text") {
                Swal.fire({
                    title: "Texto Digitado",
                    html: `<textarea id="swal-input1" style="height:130px;width:340px;border-radius:10px;background-color:#f9f9f9;box-shadow:0 4px 6px rgba(0,0,0,.1);color:#333;padding:10px;font-family:Arial,sans-serif;font-size:14px;resize:none">${target.value}</textarea>`,
                    icon: "info",
                    confirmButtonColor: "#3085d6",
                    confirmButtonText: "OK",
                    showCancelButton: true,
                    cancelButtonText: "Cancelar",
                    preConfirm: () => document.getElementById("swal-input1").value
                }).then(res => { if (res.isConfirmed) target.value = res.value; });
            }
        });

        fetch("./src/data/sugestoes.json").then(r => r.json()).then(d => suggestionList = d || []).catch(() => { });

        document.addEventListener("click", e => {
            const target = e.target;
            if (target.tagName === "INPUT" && target.type === "text") {
                if (target !== activeInput) { activeInput = target; removeDropdowns(); }
            } else {
                removeDropdowns();
                activeInput = null;
            }
        });

        document.addEventListener("input", async e => {
            const target = e.target;
            if (target.tagName === "INPUT" && target.type === "text" && target === activeInput) {
                const searchText = target.value.toLowerCase();
                const filtered = suggestionList.filter(s => s.toLowerCase().includes(searchText)).slice(0, 50);
                removeDropdowns();
                if (filtered.length) {
                    const dd = createDropdown(target, filtered);
                    document.body.appendChild(dd);
                    positionDropdown(target, dd);
                }
                if (searchText.includes("bug")) {
                    const ret = await Swal.fire({
                        title: "Adicionar informações de Bug",
                        width: "80%",
                        html: htmlBugForm(),
                        customClass: { content: "custom-swal-content" },
                        didOpen: () => { const c = document.querySelector(".swal2-content"); if (c) c.style.color = "white"; },
                        showCancelButton: true,
                        confirmButtonText: "Adicionar",
                        confirmButtonColor: "#1589FF",
                        cancelButtonText: "Cancelar",
                        showLoaderOnConfirm: true,
                        preConfirm: () => {
                            const g = id => document.getElementById(id).value.trim();
                            const bugNumber = g("bugNumber");
                            const aplicacaoName = g("aplicacaoName");
                            const torreName = g("torreName");
                            const abertoPor = g("abertoPor");
                            const tipo = g("tipo");
                            const categoria = g("categoria");
                            const ambiente = g("ambiente");
                            const servico = g("servico");
                            const estado = g("estado");
                            const impacto = g("impacto");
                            const urgencia = g("urgencia");
                            const prioridade = g("prioridade");
                            const grupoAtribuicao = g("grupoAtribuicao");
                            const criadoEm = g("criadoEm");
                            if ([bugNumber, aplicacaoName, torreName, abertoPor, tipo, categoria, ambiente, servico, estado, impacto, urgencia, prioridade, grupoAtribuicao, criadoEm].some(v => !v)) {
                                Swal.showValidationMessage("Por favor, preencha todos os campos.");
                                return false;
                            }
                            return `bug nº ${bugNumber}, Aplicação: ${aplicacaoName}, Descrição: ${torreName}, Aberto por: ${abertoPor}, Tipo: ${tipo}, Categoria: ${categoria}, Ambiente: ${ambiente}, Serviço: ${servico}, Estado: ${estado}, Impacto: ${impacto}, Urgência: ${urgencia}, Prioridade: ${prioridade}, Grupo de Atribuição: ${grupoAtribuicao}, Criado em: ${criadoEm}`;
                        }
                    });
                    if (ret.isConfirmed) target.value = ret.value;
                }
            }
        });

        $("#dashboardButton")?.addEventListener("click", () => {
            const t = getTabela();
            if (!t) {
                Swal.fire({
                    title: "Nenhuma tabela encontrada",
                    html: '<p style="color:#fff;font-size:11px;">Para gerar o dashboard, você precisa importar uma tabela. Deseja importar uma agora?</p>',
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Importar Tabela",
                    cancelButtonText: "Cancelar",
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33"
                }).then(res => {
                    if (res.isConfirmed) {
                        const importInput = $("#importExcel");
                        importInput?.click();
                        importInput?.addEventListener("change", function onChange() {
                            if (importInput.files.length > 0) setTimeout(() => $("#toggleButton")?.click(), 2000);
                            else Swal.fire({ title: "Nenhum arquivo selecionado", text: "Você precisa selecionar um arquivo para importar a tabela.", icon: "error", confirmButtonText: "OK" });
                            importInput.removeEventListener("change", onChange);
                        }, { once: true });
                    } else if (res.dismiss === Swal.DismissReason.cancel) {
                        document.querySelector(".modal .close")?.click();
                    }
                });
            } else {
                gerarDashboard();
            }
        });

        $("#btn-sear")?.addEventListener("click", function () {
            const icon = this.querySelector("i");
            if (!icon) return;
            if (icon.classList.contains("fa-magnifying-glass-arrow-right")) {
                icon.classList.remove("fa-magnifying-glass-arrow-right");
                icon.classList.add("fa-xmark");
            } else {
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-magnifying-glass-arrow-right");
            }
        });

        $("#doc-book")?.addEventListener("click", () => location.href = "./src/html/sheetFrenzybddDocumentacao.html");

        $("#titulo")?.addEventListener("click", () => location.reload());

        window.baixarExcel = baixarExcel;
        window.importExcel = importExcel;
        window.saveTable = saveTable;
        window.criarTabela = criarTabela;
        window.atualizarEstiloLinhasSublinhadas = atualizarEstiloLinhasSublinhadas;
        window.ativarReconhecimentoDeVoz = ativarReconhecimentoDeVoz;
        window.baixarSelecionados = baixarSelecionados;
        window.ordenarColuna = ordenarColuna;
        window.moverColuna = moverColuna;
        window.excluirColuna = excluirColuna;
        window.inserirColuna = inserirColuna;
        window.adicionarColuna = adicionarColuna;
        window.adicionarColunaFeature = adicionarColunaFeature;
        window.adicionarLinha = adicionarLinha;
        window.apagarLinha = apagarLinha;
        window.abrirModalEmail = abrirModalEmail;
        window.removeDropdowns = removeDropdowns;
        window.positionDropdown = positionDropdown;
        window.copiarParaTodos = copiarParaTodos;
        window.filtrarPorCT = filtrarPorCT;
        window.gerarDashboard = gerarDashboard;
        window.mostrarCenariosBug = mostrarCenariosBug;
        window.takeScreenshotAndDownload = takeScreenshotAndDownload;
        window.copyDashEmail = copyDashEmail;
        window.hideButtons = hideButtons;
        window.showButtons = showButtons;
        window.toggleIcon = toggleIcon;
        window.printPDF = printPDF;

        const contadorInput1 = $("#rows");
        const contadorInput2 = $("#cols");
        let inc1, dec1, inc2, dec2;
        window.startIncrement1 = () => inc1 = startIncrement(contadorInput1);
        window.stopIncrement1 = () => clearInterval(inc1);
        window.startDecrement1 = () => dec1 = startDecrement(contadorInput1);
        window.stopDecrement1 = () => clearInterval(dec1);
        window.startIncrement2 = () => inc2 = startIncrement(contadorInput2);
        window.stopIncrement2 = () => clearInterval(inc2);
        window.startDecrement2 = () => dec2 = startDecrement(contadorInput2);
        window.stopDecrement2 = () => clearInterval(dec2);
        window.alternarVisibilidade = alternarVisibilidade;
        window.toggleButtons = toggleButtons;
    });
})();
"use strict";

(() => {
    const $ = (s, r = document) => r.querySelector(s);
    const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));

    let importedFileName = "";
    let recognition = null;
    let isRecognitionActive = false;
    let linhasSublinhadas = [];
    let myChart = null;
    let myPieChart = null;
    let suggestionList = [];
    let activeInput = null;

    const TITULOS_PADRAO = ["Nº Cenário", "Cenário", "Contexto", "Funcionalidade", "Dado", "Quando", "Então", "Aplicação", "História", "Tipo de teste", "Teste de campo", "Status"];

    const swalToast = (icon, title, timer = 4000) => {
        const Toast = Swal.mixin({ toast: true, position: "top-end", showConfirmButton: false, timer, timerProgressBar: true, didOpen: t => { t.onmouseenter = Swal.stopTimer; t.onmouseleave = Swal.resumeTimer; } });
        Toast.fire({ icon, title });
    };

    const getTabela = () => $("#tabela");
    const getStatusColIndex = () => {
        const t = getTabela();
        if (!t) return 11;
        const head = t.tHead || t.createTHead();
        const row = head.rows[0];
        for (let i = 0; i < row.cells.length; i++) {
            if (row.cells[i].textContent.trim().toLowerCase() === "status") return i;
        }
        return 11;
    };

    const buildCT = i => `CT${String(i).padStart(4, "0")}`;

    const htmlBugForm = () => `
    <div style="max-height: 400px; overflow-y: auto;">
      <div style="display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px;">
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-bugs"></i> Número do Bug</label><input type="text" id="bugNumber" class="swal2-input" placeholder="INC00000000" style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-globe"></i> Nome da Aplicação</label><input type="text" id="aplicacaoName" class="swal2-input" placeholder="aplicação..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-circle-info"></i> Descrição resumida</label><input type="text" id="torreName" class="swal2-input" placeholder="descrição resumida..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-user"></i> Aberto por</label><input type="text" id="abertoPor" class="swal2-input" placeholder="aberto por..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-list"></i> Tipo</label><input type="text" id="tipo" class="swal2-input" placeholder="tipo..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-tags"></i> Categoria</label><input type="text" id="categoria" class="swal2-input" placeholder="categoria..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-cloud"></i> Ambiente</label><input type="text" id="ambiente" class="swal2-input" placeholder="ambiente..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-cogs"></i> Serviço</label><input type="text" id="servico" class="swal2-input" placeholder="serviço..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-clipboard-check"></i> Estado</label><input type="text" id="estado" class="swal2-input" placeholder="estado..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-exclamation-triangle"></i> Impacto</label><input type="text" id="impacto" class="swal2-input" placeholder="impacto..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-bolt"></i> Urgência</label><input type="text" id="urgencia" class="swal2-input" placeholder="urgência..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-arrow-up"></i> Prioridade</label><input type="text" id="prioridade" class="swal2-input" placeholder="prioridade..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-users"></i> Grupo de Atribuição</label><input type="text" id="grupoAtribuicao" class="swal2-input" placeholder="grupo de atribuição..." style="width:100%"></div>
        <div style="flex:1 1 45%;min-width:200px;max-width:45%"><label style="margin-bottom:5px;color:#fff"><i class="fa-solid fa-calendar"></i> Criado em</label><input type="date" id="criadoEm" class="swal2-input" style="width:100%"></div>
      </div>
    </div>
  `;

    const swalRadioGrid = (title, name, values, minWidth = 120) => Swal.fire({
        title,
        html: `
      <style>
        .swal2-container .swal2-popup .swal2-html-container{ text-align:center;color:#fff;font-family:Arial,sans-serif }
        .swal2-container .swal2-popup .swal2-html-container div{ display:grid;grid-template-columns:repeat(auto-fit,minmax(${minWidth}px,1fr));gap:15px;justify-items:start;padding:10px }
        .swal2-container .swal2-popup .swal2-html-container div label{ display:flex;align-items:center;font-size:16px;background:#333;padding:8px 12px;border-radius:5px;transition:all .3s ease;cursor:pointer }
        .swal2-container .swal2-popup .swal2-html-container div label:hover{ background:#555 }
        .swal2-container .swal2-popup .swal2-html-container div input{ margin-right:10px }
      </style>
      <div>${values.map(v => `<label><input type="radio" name="${name}" value="${v}"> ${v}</label>`).join("")}</div>
    `,
        showCancelButton: true,
        confirmButtonText: "OK",
        confirmButtonColor: "#3085d6",
        cancelButtonText: "Cancelar",
        preConfirm: () => {
            const el = document.querySelector(`input[name="${name}"]:checked`);
            if (el) return el.value;
            Swal.showValidationMessage("Você precisa escolher um valor!");
            return false;
        }
    });

    const attachClickableInputsForRow = (row, header) => {
        for (let j = 1; j < row.cells.length; j++) {
            const headerText = header.cells[j]?.textContent.trim();
            const inp = row.cells[j].querySelector("input");
            if (!inp || !headerText) continue;
            if (headerText === "Aplicação") {
                inp.classList.add("clickable-input");
                inp.addEventListener("click", async function () {
                    const ret = await swalRadioGrid("Escolha um valor para Aplicação", "aplicacao", ["Web", "Serviço", "Desktop", "Infra", "Mainframe", "Mobile"]);
                    if (ret.isConfirmed) this.value = ret.value;
                });
            } else if (headerText === "Tipo de teste") {
                inp.classList.add("clickable-input");
                inp.addEventListener("click", async function () {
                    const ret = await swalRadioGrid("Escolha um valor para Tipo de Teste", "tipoteste", ["Acceptance", "End to End", "Regression", "Sanity", "Security", "Performance", "UI", "API"], 150);
                    if (ret.isConfirmed) this.value = ret.value;
                });
            } else if (headerText === "Teste de campo") {
                inp.classList.add("clickable-input");
                inp.addEventListener("click", async function () {
                    const ret = await Swal.fire({
                        title: "Escolha um valor para Teste de campo",
                        html: `
              <style>
                .swal2-container .swal2-popup .swal2-html-container{ text-align:center;color:#fff;font-family:Arial,sans-serif }
                .swal2-container .swal2-popup .swal2-html-container div{ display:flex;justify-content:center;gap:15px;padding:10px }
                .swal2-container .swal2-popup .swal2-html-container div label{ display:flex;align-items:center;font-size:18px;background:#333;padding:12px 20px;border-radius:8px;transition:all .3s ease;cursor:pointer;width:150px;justify-content:center;text-align:center }
                .swal2-container .swal2-popup .swal2-html-container div label:hover{ background:#555;transform:scale(1.05) }
                .swal2-container .swal2-popup .swal2-html-container div input{ margin-right:10px }
              </style>
              <div>
                <label><input type="radio" name="testecampo" value="Positivo"> Positivo</label>
                <label><input type="radio" name="testecampo" value="Negativo"> Negativo</label>
              </div>
            `,
                        showCancelButton: true,
                        confirmButtonText: "OK",
                        confirmButtonColor: "#3085d6",
                        cancelButtonText: "Cancelar",
                        preConfirm: () => {
                            const el = document.querySelector('input[name="testecampo"]:checked');
                            if (el) return el.value;
                            Swal.showValidationMessage("Você precisa escolher um valor!");
                            return false;
                        }
                    });
                    if (ret.isConfirmed) this.value = ret.value;
                });
            }
        }
    };

    const addDataToExistingTable = importedData => {
        const t = getTabela();
        if (!t) {
            updateTable(importedData);
            return;
        }
        const start = t.rows.length;
        for (let i = 0; i < importedData.length; i++) {
            const row = t.insertRow(start + i);
            for (let j = 0; j < importedData[i].length; j++) {
                const cell = row.insertCell(j);
                const input = document.createElement("input");
                input.type = "text";
                input.value = importedData[i][j] ?? "";
                cell.appendChild(input);
            }
        }
        attachClickableInputsForRow(t.rows[start], t.rows[0]);
    };

    const saveTable = () => {
        const t = getTabela();
        if (!t) return;
        const data = [];
        for (let i = 0; i < t.rows.length; i++) {
            const rowData = [];
            for (let j = 0; j < t.rows[i].cells.length; j++) {
                const input = t.rows[i].cells[j].querySelector("input");
                rowData.push(input ? input.value : t.rows[i].cells[j].textContent);
            }
            data.push(rowData);
        }
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet(data);
        XLSX.utils.book_append_sheet(wb, ws, "Tabela");
        XLSX.writeFile(wb, importedFileName || "tabela.xlsx");
        swalToast("success", "Tabela salva com sucesso!");
    };

    const askVoice = async () => {
        const ret = await Swal.fire({
            title: "Deseja ativar o reconhecimento de voz?",
            html: '<p style="color:#fff">Você poderá preencher os campos usando sua voz.</p>',
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33"
        });
        if (ret.isConfirmed) ativarReconhecimentoDeVoz();
        else $("#audioButton")?.classList.remove("d-none");
    };

    const updateTable = async importedData => {
        const headerRow = importedData[0] || [];
        const existing = getTabela();
        if (existing) existing.remove();
        const newTable = document.createElement("table");
        newTable.id = "tabela";
        const thead = newTable.createTHead();
        const header = thead.insertRow(0);
        for (let i = 0; i < headerRow.length; i++) {
            const th = header.insertCell(i);
            th.textContent = headerRow[i];
            th.setAttribute("onclick", `ordenarColuna(${i})`);
            th.setAttribute("oncontextmenu", `excluirColuna(event, ${i}); return false;`);
            th.setAttribute("ondblclick", `inserirColuna(${i})`);
        }
        for (let j = 1; j < importedData.length; j++) {
            const row = newTable.insertRow(j);
            for (let k = 0; k < importedData[j].length; k++) {
                const cell = row.insertCell(k);
                const input = document.createElement("input");
                input.type = "text";
                input.value = importedData[j][k] ?? "";
                cell.appendChild(input);
            }
            attachClickableInputsForRow(row, header);
        }
        document.body.appendChild(newTable);
        await askVoice();
    };

    const ativarReconhecimentoDeVoz = () => {
        if (isRecognitionActive) {
            recognition.stop();
            isRecognitionActive = false;
            Swal.fire("Reconhecimento de voz desativado", "", "info");
            const btn = $("#audioButton");
            if (btn) btn.innerHTML = '<i class="fas fa-microphone"></i> Ativar Reconhecimento de Voz';
            return;
        }
        if (!("webkitSpeechRecognition" in window)) {
            Swal.fire("Erro", "Reconhecimento de voz não suportado neste navegador.", "error");
            return;
        }
        recognition = new webkitSpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "pt-BR";
        recognition.onstart = () => {
            Swal.fire("Reconhecimento de voz ativado, pode começar a falar.", "", "success");
            const btn = $("#audioButton");
            if (btn) btn.innerHTML = '<i class="fas fa-microphone-slash"></i> Desativar Reconhecimento de Voz';
        };
        recognition.onerror = e => Swal.fire("Erro no reconhecimento de voz", e.error, "error");
        recognition.onresult = e => {
            let interim = "";
            for (let i = e.resultIndex; i < e.results.length; ++i) {
                if (e.results[i].isFinal) document.activeElement && (document.activeElement.value += e.results[i][0].transcript);
                else interim += e.results[i][0].transcript;
            }
        };
        recognition.onend = () => {
            const btn = $("#audioButton");
            if (isRecognitionActive) recognition.start();
            else if (btn) btn.innerHTML = '<i class="fas fa-microphone"></i> Ativar Reconhecimento de Voz';
        };
        recognition.start();
        isRecognitionActive = true;
        const btn = $("#audioButton");
        if (btn) btn.innerHTML = '<i class="fas fa-microphone-slash"></i> Desativar Reconhecimento de Voz';
    };

    const criarTabela = () => {
        const tabelaExistente = getTabela();
        if (tabelaExistente) tabelaExistente.remove();
        $("#qtd-lne")?.style && ($("#qtd-lne").style.display = "none");
        const rows = parseInt($("#rows")?.value || "0", 10);
        const cols = parseInt($("#cols")?.value || "0", 10);
        const tabela = document.createElement("table");
        tabela.id = "tabela";
        const cabecalho = tabela.createTHead().insertRow(0);
        for (let j = 0; j < cols; j++) {
            const th = cabecalho.insertCell(j);
            th.textContent = TITULOS_PADRAO[j] || `Coluna ${j}`;
            th.setAttribute("onclick", `ordenarColuna(${j})`);
            th.setAttribute("oncontextmenu", `excluirColuna(event, ${j}); return false;`);
            th.setAttribute("ondblclick", `inserirColuna(${j})`);
        }
        for (let i = 0; i < rows; i++) {
            const row = tabela.insertRow(i + 1);
            const cellCT = row.insertCell(0);
            cellCT.textContent = buildCT(i + 1);
            for (let j = 1; j < cols; j++) {
                const cell = row.insertCell(j);
                const input = document.createElement("input");
                input.type = "text";
                input.value = "";
                cell.appendChild(input);
            }
            const header = tabela.rows[0];
            attachClickableInputsForRow(row, header);
            const idxStatus = getStatusColIndex();
            if (row.cells[idxStatus]) row.cells[idxStatus].querySelector("input").value = "Pendente";
        }
        document.body.appendChild(tabela);
        $(".grade-buttons")?.classList.remove("d-none");
        $("#audioButton")?.classList.remove("d-none");
    };

    const atualizarEstiloLinhasSublinhadas = () => {
        const t = getTabela();
        if (!t) return;
        for (let i = 1; i < t.rows.length; i++) t.rows[i].style.textDecoration = linhasSublinhadas.includes(i) ? "underline" : "none";
    };

    const gerarNumerosAleatoriosComoString = (min, max) => Array.from({ length: 6 }, () => Math.floor(Math.random() * (max - min + 1)) + min).join("");

    const gerarArquivoFeature = radio => {
        const t = getTabela();
        const rowIndex = radio.parentElement.parentElement.rowIndex;
        const row = t.rows[rowIndex];
        const header = t.rows[0];
        let featureContent = "";
        const scenarioName = row.cells[1].querySelector("input")?.value || "";
        const ctNumber = row.cells[0].textContent.trim();
        featureContent += `Feature: ${scenarioName}\n\n`;
        featureContent += `Scenario: CT${gerarNumerosAleatoriosComoString(0, 9)}\n`;
        for (let j = 4; j < header.cells.length; j++) {
            const label = header.cells[j].textContent.toLowerCase().trim();
            if (["aplicação", "história", "tipo de teste", "status", "feature"].includes(label)) continue;
            const v = row.cells[j].querySelector("input")?.value || row.cells[j].textContent || "";
            featureContent += `${label} ${v}\n`;
        }
        const blob = new Blob([featureContent], { type: "text/plain;charset=utf-8" });
        const fileName = `${ctNumber}_${scenarioName}${rowIndex}.feature`.replace(/\s+/g, "_");
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const baixarSelecionados = () => {
        const radios = $$('input[type="radio"]:checked');
        if (!radios.length) {
            Swal.fire({ icon: "warning", html: "<b style='color:#fff'>Por favor, selecione pelo menos um item</b>", confirmButtonText: "OK", confirmButtonColor: "#FF8C00" });
            return;
        }
        radios.forEach(gerarArquivoFeature);
    };

    const ordenarColuna = colIndex => {
        const t = getTabela();
        if (!t) return;
        let switching = true;
        for (let i = 0; i < t.rows[0].cells.length; i++) {
            const cell = t.rows[0].cells[i];
            cell.draggable = true;
            cell.addEventListener("dragstart", e => cell.dataset.dragIndex = Array.from(t.rows[0].cells).indexOf(e.target));
            cell.addEventListener("dragover", e => e.preventDefault());
            cell.addEventListener("drop", e => {
                const dropIndex = Array.from(t.rows[0].cells).indexOf(e.target);
                const dragStartIndex = parseInt(cell.dataset.dragIndex || "-1", 10);
                if (dragStartIndex >= 0 && dragStartIndex !== dropIndex) moverColuna(dragStartIndex, dropIndex);
            });
        }
        while (switching) {
            switching = false;
            const rows = t.rows;
            for (let i = 1; i < rows.length - 1; i++) {
                let shouldSwitch = false;
                const x = rows[i].cells[colIndex].textContent.toLowerCase();
                const y = rows[i + 1].cells[colIndex].textContent.toLowerCase();
                if (x > y) {
                    rows[i].parentNode.insertBefore(rows[i + 1], rows[i]);
                    switching = true;
                    break;
                }
            }
        }
    };

    const moverColuna = (startIndex, dropIndex) => {
        const t = getTabela();
        const rows = t.rows;
        for (let i = 0; i < rows.length; i++) {
            const clone = rows[i].cells[startIndex].cloneNode(true);
            const targetCell = rows[i].cells[dropIndex];
            rows[i].deleteCell(startIndex);
            if (startIndex < dropIndex) targetCell.parentNode.insertBefore(clone, targetCell.nextSibling);
            else targetCell.parentNode.insertBefore(clone, targetCell);
        }
    };

    const excluirColuna = (event, colIndex) => {
        event.preventDefault();
        const t = getTabela();
        if (!t) return;
        for (let i = 0; i < t.rows.length; i++) t.rows[i].deleteCell(colIndex);
    };

    const inserirColuna = colIndex => {
        const t = getTabela();
        if (!t) return;
        Swal.fire({
            title: "Digite o título da nova coluna:",
            input: "text",
            showCancelButton: true,
            confirmButtonText: "Inserir",
            confirmColor: "#1589FF",
            preConfirm: v => v
        }).then(res => {
            if (!res.value && res.value !== "") return;
            const novoTitulo = res.value || `Coluna ${colIndex + 1}`;
            const th = t.rows[0].insertCell(colIndex + 1);
            th.textContent = novoTitulo;
            th.setAttribute("onclick", `ordenarColuna(${colIndex + 1})`);
            th.setAttribute("oncontextmenu", `excluirColuna(event, ${colIndex + 1}); return false;`);
            th.setAttribute("ondblclick", `inserirColuna(${colIndex + 1})`);
            for (let i = 1; i < t.rows.length; i++) {
                const cell = t.rows[i].insertCell(colIndex + 1);
                const input = document.createElement("input");
                input.type = "text";
                input.value = "";
                cell.appendChild(input);
            }
        });
    };

    const adicionarColuna = () => {
        const t = getTabela();
        if (!t) {
            Swal.fire({ icon: "info", title: "Nenhuma tabela encontrada", text: "Não há nenhuma tabela disponível para adicionar colune.", confirmButtonColor: "#3085d6" });
            return;
        }
        Swal.fire({
            icon: "question",
            html: '<b style="color:#fff">Digite o índice da nova coluna (começando de 0)</b>',
            input: "text",
            showCancelButton: true,
            confirmButtonText: "Adicionar",
            confirmButtonColor: "#1589FF",
            cancelButtonText: "Cancelar",
            preConfirm: novoIndice => {
                let idx = parseInt(novoIndice, 10);
                if (isNaN(idx) || idx < 0 || idx > t.rows[0].cells.length) idx = t.rows[0].cells.length;
                return idx;
            }
        }).then(ret1 => {
            if (ret1.value === undefined) return;
            const idx = ret1.value;
            Swal.fire({
                icon: "question",
                html: '<b style="color:#fff">Digite o título da nova coluna</b>',
                input: "text",
                showCancelButton: true,
                confirmButtonText: "Adicionar",
                confirmButtonColor: "#1589FF",
                cancelButtonText: "Cancelar",
                preConfirm: novoTitulo => novoTitulo || `Coluna ${idx}`
            }).then(ret2 => {
                if (ret2.value === undefined) return;
                const novoTitulo = ret2.value;
                const th = document.createElement("th");
                th.textContent = novoTitulo;
                t.rows[0].insertBefore(th, t.rows[0].cells[idx] || null);
                th.setAttribute("onclick", `ordenarColuna(${idx})`);
                th.setAttribute("oncontextmenu", `excluirColuna(event, ${idx}); return false;`);
                th.setAttribute("ondblclick", `inserirColuna(${idx})`);
                for (let i = 1; i < t.rows.length; i++) {
                    const cell = t.rows[i].insertCell(idx);
                    const input = document.createElement("input");
                    input.type = "text";
                    input.value = "";
                    cell.appendChild(input);
                }
            });
        });
    };

    const adicionarColunaFeature = () => {
        const t = getTabela();
        if (!t) {
            Swal.fire({ icon: "info", title: "Nenhuma tabela encontrada", text: "Por favor, adicione uma tabela antes de adicionar uma coluna de features.", confirmButtonColor: "#3085d6" });
            return;
        }
        const headerRow = t.rows[0];
        for (let i = 0; i < headerRow.cells.length; i++) {
            if (headerRow.cells[i].textContent.trim().toLowerCase() === "feature") {
                Swal.fire({ icon: "info", title: "Coluna já existente", text: 'A coluna "Feature" já foi adicionada.', confirmButtonColor: "#3085d6" });
                return;
            }
        }
        const th = document.createElement("th");
        th.textContent = "Feature";
        headerRow.appendChild(th);
        for (let i = 1; i < t.rows.length; i++) {
            const cell = t.rows[i].insertCell(t.rows[i].cells.length);
            const radio = document.createElement("input");
            radio.type = "radio";
            radio.name = `featureRadio${i}`;
            cell.appendChild(radio);
        }
        Swal.fire({ icon: "info", html: "<b style='color:#fff;'>Selecione os itens desejados e clique no botão Baixar</b>", confirmButtonText: "OK", confirmButtonColor: "#1589FF" });
    };

    const adicionarLinha = () => {
        const t = getTabela();
        if (!t) {
            Swal.fire({ icon: "info", title: "Nenhuma tabela encontrada", text: "Por favor, adicione uma tabela antes de adicionar linhas.", confirmButtonColor: "#3085d6" });
            return;
        }
        const newRow = t.insertRow(t.rows.length);
        if (!newRow) return;
        const header = t.rows[0];
        const cellCT = newRow.insertCell(0);
        cellCT.textContent = buildCT(t.rows.length - 1);
        for (let j = 1; j < header.cells.length; j++) {
            const cell = newRow.insertCell(j);
            const input = document.createElement("input");
            input.type = "text";
            input.value = "";
            cell.appendChild(input);
        }
        attachClickableInputsForRow(newRow, header);
        const idxStatus = getStatusColIndex();
        if (newRow.cells[idxStatus]) newRow.cells[idxStatus].querySelector("input").value = "Pendente";
    };

    const apagarLinha = () => {
        const t = getTabela();
        if (!t) return;
        if (t.rows.length > 2) t.deleteRow(t.rows.length - 1);
        else Swal.fire({ icon: "warning", html: "Não é possível excluir a última linha.", confirmButtonText: "OK", confirmButtonColor: "#FF8C00" });
    };

    const convertToXML = data => {
        let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<data>\n';
        data.forEach(row => {
            xml += "  <row>\n";
            row.forEach(cell => {
                const safe = String(cell ?? "").replace(/[<&>]/g, m => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[m]));
                xml += `    <cell>${safe}</cell>\n`;
            });
            xml += "  </row>\n";
        });
        xml += "</data>";
        return xml;
    };

    const toYAML = data => data.map(r => `- [${r.map(c => `"${String(c ?? "").replace(/"/g, '\\"')}"`).join(", ")}]`).join("\n");

    const downloadBlob = (content, name, type) => {
        const blob = new Blob([content], { type });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const openEmailClient = (recipientEmail, senderEmail) => {
        const subject = encodeURIComponent("BDD");
        const body = encodeURIComponent("Prezado [Nome do Destinatário],\n\nEstou enviando este e-mail para fornecer o arquivo solicitado discutido durante nossa última conversa. O arquivo anexo contém o BDD. Por favor, revise o arquivo e sinta-se à vontade para entrar em contato caso tenha alguma dúvida ou se precisar de informações adicionais. Estou à disposição para discutir qualquer ponto que você considere relevante.\n\nAgradeço antecipadamente pelo seu tempo e colaboração.\n\nAtenciosamente.");
        const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}${senderEmail ? `&cc=${senderEmail}` : ""}`;
        window.location.href = mailtoLink;
    };

    const abrirModalEmail = async () => {
        const r1 = await Swal.fire({
            text: "Digite o endereço de e-mail do destinatário",
            input: "email",
            inputPlaceholder: "destinatario@example.com",
            confirmButtonText: "Próximo",
            confirmButtonColor: "#1589FF",
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            inputValidator: v => (!v ? "Por favor, preencha o endereço de e-mail do destinatário!" : undefined)
        });
        if (!r1.isConfirmed || !r1.value) return;
        const r2 = await Swal.fire({
            text: "E-mail Cc: com cópia",
            input: "email",
            inputPlaceholder: "seuemail@example.com",
            confirmButtonText: "Enviar",
            confirmButtonColor: "#1589FF",
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            inputValidator: v => (!v ? "Por favor, preencha seu endereço de e-mail!" : undefined)
        });
        if (r1.value) openEmailClient(r1.value, r2.value || "");
    };

    const removeDropdowns = () => $$(".autocomplete-dropdown").forEach(d => d.parentNode.removeChild(d));

    const createDropdown = (target, suggestions) => {
        const dropdown = document.createElement("ul");
        dropdown.className = "autocomplete-dropdown";
        dropdown.style.listStyle = "none";
        dropdown.style.margin = "0";
        dropdown.style.padding = "6px 0";
        dropdown.style.background = "#222";
        dropdown.style.border = "1px solid #444";
        dropdown.style.borderRadius = "8px";
        dropdown.style.position = "absolute";
        dropdown.style.zIndex = "9999";
        suggestions.forEach(s => {
            const li = document.createElement("li");
            li.textContent = s;
            li.style.padding = "8px 12px";
            li.style.cursor = "pointer";
            li.addEventListener("mouseenter", () => li.style.background = "#333");
            li.addEventListener("mouseleave", () => li.style.background = "transparent");
            dropdown.appendChild(li);
        });
        dropdown.addEventListener("click", e => {
            if (e.target.tagName === "LI") {
                target.value = e.target.textContent;
                removeDropdowns();
            }
        });
        return dropdown;
    };

    const positionDropdown = (target, dropdown) => {
        const rect = target.getBoundingClientRect();
        dropdown.style.left = `${rect.left + window.scrollX}px`;
        dropdown.style.top = `${rect.bottom + window.scrollY + 4}px`;
        dropdown.style.width = `${Math.max(target.offsetWidth, 260)}px`;
        dropdown.style.maxHeight = "240px";
        dropdown.style.overflowY = "auto";
    };

    const copiarParaTodos = async () => {
        const t = getTabela();
        if (!t) {
            Swal.fire({ icon: "info", title: "Nenhuma tabela encontrada", text: "Por favor, adicione uma tabela antes de copiar valores.", confirmButtonColor: "#3085d6" });
            return;
        }
        const ret = await Swal.fire({
            title: "Escolha a coluna e o intervalo de linhas",
            html: `
        <b>Escolha a coluna e o intervalo de linhas</b><br>
        <div class="mb-3"><label style="color:#fff" class="form-label"><i class="fa-solid fa-list-ul"></i> Índice da Coluna</label><input type="text" id="colIndex" class="form-control swal2-input" placeholder="0"></div>
        <div class="mb-3"><label style="color:#fff" class="form-label"><i class="fa-solid fa-arrow-down-up-across-line"></i> Intervalo de Linhas</label><input type="text" id="rowRange" class="form-control swal2-input" placeholder="1 a ${t.rows.length - 1}"></div>
        <div class="mb-3"><label style="color:#fff" class="form-label"><i class="fa-solid fa-signature"></i> Texto a ser inserido</label><input type="text" id="textToInsert" class="form-control swal2-input" placeholder="Texto"></div>
      `,
            showCancelButton: true,
            confirmButtonText: "Copiar",
            confirmButtonColor: "#1589FF",
            cancelButtonText: "Cancelar",
            preConfirm: () => {
                const colIndex = parseInt($("#colIndex").value, 10);
                const rowRange = $("#rowRange").value.trim();
                const textToInsert = $("#textToInsert").value.trim();
                if (isNaN(colIndex) || colIndex < 0 || colIndex >= t.rows[0].cells.length) {
                    Swal.showValidationMessage("Índice da coluna inválido.");
                    return false;
                }
                const m = rowRange.match(/^(\d+)\s*a\s*(\d+)$/);
                if (!m) {
                    Swal.showValidationMessage(`Formato inválido para o intervalo de linhas. Use o formato: "1 a ${t.rows.length - 1}".`);
                    return false;
                }
                const startRow = parseInt(m[1], 10);
                const endRow = parseInt(m[2], 10);
                if (isNaN(startRow) || isNaN(endRow) || startRow < 1 || endRow >= t.rows.length || endRow < startRow) {
                    Swal.showValidationMessage("Intervalo de linhas inválido.");
                    return false;
                }
                return { colIndex, startRow, endRow, textToInsert };
            }
        });
        if (!ret.value) return;
        const { colIndex, startRow, endRow, textToInsert } = ret.value;
        for (let i = startRow; i <= endRow; i++) {
            const input = t.rows[i].cells[colIndex].querySelector("input");
            if (input) input.value = textToInsert;
        }
    };

    const filtrarPorCT = () => {
        const t = getTabela();
        const filtroValor = $("#filtroCT")?.value.trim().toLowerCase() || "";
        if (!filtroValor) {
            Swal.fire({ icon: "warning", text: "Por favor insira um valor antes de pesquisar.", confirmButtonText: "OK", confirmButtonColor: "#FF8C00" });
            return;
        }
        for (let i = 1; i < t.rows.length; i++) {
            const ctNumero = t.rows[i].cells[0].textContent.toLowerCase();
            if (ctNumero.includes(filtroValor)) t.rows[i].classList.add("filtrado");
            else t.rows[i].classList.remove("filtrado");
        }
        const primeira = t.querySelector(".filtrado");
        if (primeira) {
            primeira.scrollIntoView({ behavior: "smooth" });
            setTimeout(() => primeira.classList.remove("filtrado"), 3000);
        }
    };

    const contarOcorrencias = (data, palavra) => data.reduce((acc, v) => acc + (String(v).toLowerCase() === String(palavra).toLowerCase() ? 1 : 0), 0);

    const contarNumeros = () => {
        const t = getTabela();
        const numeroLinhas = t ? t.rows.length - 1 : 0;
        let numeroOK = 0, numeroNOK = 0, numeroDesplanejado = 0, numeroProgredindo = 0, numeroBug = 0;
        const col = getStatusColIndex();
        if (!t) return { numeroLinhas, numeroOK, numeroNOK, numeroDesplanejado, numeroProgredindo, numeroBug };
        for (let i = 1; i < t.rows.length; i++) {
            const valor = (t.rows[i].cells[col].querySelector("input")?.value || "").trim().toLowerCase();
            if (valor.includes("bug")) numeroBug++;
            else if (valor === "ok") numeroOK++;
            else if (valor === "pendente") numeroNOK++;
            else if (valor === "desplanejado") numeroDesplanejado++;
            else if (valor === "progredindo") numeroProgredindo++;
        }
        return { numeroLinhas, numeroOK, numeroNOK, numeroDesplanejado, numeroProgredindo, numeroBug };
    };

    const atualizarResumoBDD = (qOk, qNok, qDes, qProg, qBug, tCob, tFal, tBug) => {
        const total = qOk + qNok + qDes + qProg + qBug;
        const resumoContainer = $("#resumoBDD");
        if (!resumoContainer) return;
        const item = (label, q, color) => `
      <div style="display:flex;align-items:center;margin-bottom:20px">
        <span style="width:170px;display:inline-block;font-size:20px;font-family:'Poppins',sans-serif">${label}:</span>
        <div style="width:280px;height:25px;background-color:rgba(200,200,200,.3);position:relative;border-radius:15px;overflow:hidden;box-shadow:inset 0 6px 8px rgba(0,0,0,.1)">
          <div style="width:${total ? ((q / total) * 100) : 0}%;height:100%;background-color:${color};border-radius:15px"></div>
        </div>
        <span style="margin-left:15px;font-size:20px;font-family:'Poppins',sans-serif">${q}</span>
      </div>
    `;
        resumoContainer.innerHTML = `
      <div style="padding:30px;border-radius:20px;background-color:#f4f4f4;border:1px solid #ddd;margin-top:25px;box-shadow:0 6px 25px rgba(0,0,0,.15)">
        <div style="font-size:28px;font-weight:bold;color:#333;font-family:'Poppins',sans-serif">Resumo do BDD - ${new Date().toLocaleString()}</div>
        <div style="margin-top:20px">
          <div style="margin-bottom:20px;font-size:20px;font-family:'Poppins',sans-serif"><strong>Número de Linhas BDD: </strong>${total}</div>
          ${item("Nº Cenários Feitos", qOk, "rgba(78,205,196,1)")}
          ${item("Nº Cenários Pedentes", qNok, "rgba(255,107,107,1)")}
          ${item("Nº Cenários Desplanejado", qDes, "rgba(255,234,167,1)")}
          ${item("Nº Cenários em Progresso", qProg, "rgba(116,185,255,1)")}
          ${item("Nº Cenários com Bug", qBug, "rgba(162,155,254,1)")}
          <div style="font-size:22px;margin-top:30px;font-family:'Poppins',sans-serif"><strong>Taxa de Cobertura:</strong> ${tCob.toFixed(2)}%</div>
        </div>
      </div>
    `;
    };

    const atualizarCards = (qOk, qNok, qDes, qProg, qBug) => {
        $("#cardOk") && ($("#cardOk").textContent = qOk);
        $("#cardNok") && ($("#cardNok").textContent = qNok);
        $("#cardDesplanejado") && ($("#cardDesplanejado").textContent = qDes);
        $("#cardProgredindo") && ($("#cardProgredindo").textContent = qProg);
        $("#cardBug") && ($("#cardBug").textContent = qBug);
    };

    const criarDashboard = data => {
        const ctx = $("#graficoModal")?.getContext("2d");
        const pieCtx = $("#graficoPizza")?.getContext("2d");
        if (!ctx || !pieCtx) return;
        if (myChart) myChart.destroy();
        if (myPieChart) myPieChart.destroy();
        const theme = document.body.classList.contains("dark-mode") ? "dark" : "light";
        const colors = {
            light: { bg: ['rgba(63,191,191,1)', 'rgba(249,8,8,1)', 'rgba(255,205,86,1)', 'rgba(54,162,235,1)', 'rgba(146,110,244,1)'], text: '#333', tip: 'rgba(0,0,0,.8)' },
            dark: { bg: ['rgba(63,191,191,.8)', 'rgba(255,79,132,.8)', 'rgba(255,205,86,.8)', 'rgba(54,162,235,.8)', 'rgba(146,110,244,.8)'], text: '#ddd', tip: 'rgba(255,255,255,.8)' }
        };
        const quantidadeOk = contarOcorrencias(data, "ok");
        const quantidadeNok = contarOcorrencias(data, "pendente");
        const quantidadeDesplanejado = contarOcorrencias(data, "desplanejado");
        const quantidadeProgredindo = contarOcorrencias(data, "progredindo");
        const quantidadeBug = data.filter(v => String(v).toLowerCase().includes("bug")).length;
        const total = data.length || 1;
        const labels = ["Realizados", "Pendente", "Desplanejado", "Progredindo", "Bug"];
        const barData = [quantidadeOk, quantidadeNok, quantidadeDesplanejado, quantidadeProgredindo, quantidadeBug];
        const lineData = barData.map(v => (v / total) * 100);
        myChart = new Chart(ctx, {
            type: "bar",
            data: {
                labels, datasets: [
                    { label: "Quantidade", data: barData, backgroundColor: colors[theme].bg, borderWidth: 1 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: false,
                plugins: {
                    legend: { display: true, labels: { color: colors[theme].text } },
                    tooltip: { backgroundColor: colors[theme].tip }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { color: colors[theme].text }, grid: { color: theme === "dark" ? "#555" : "#ccc" } },
                    x: { ticks: { color: colors[theme].text }, grid: { color: theme === "dark" ? "#555" : "#ccc" } }
                }
            }
        });
        myPieChart = new Chart(pieCtx, {
            type: "pie",
            data: { labels: ["Concluído", "Restante"], datasets: [{ data: [((quantidadeOk + quantidadeProgredindo) / total) * 100, 100 - ((quantidadeOk + quantidadeProgredindo) / total) * 100] }] },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: "bottom", labels: { color: colors[theme].text } }, tooltip: { backgroundColor: colors[theme].tip } } }
        });
        const { numeroLinhas, numeroOK, numeroNOK, numeroDesplanejado, numeroProgredindo, numeroBug } = contarNumeros();
        const porcentagemOK = (numeroOK / Math.max(numeroLinhas, 1)) * 100;
        const d = new Date();
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const yyyy = d.getFullYear();
        const HH = String(d.getHours()).padStart(2, "0");
        const MM = String(d.getMinutes()).padStart(2, "0");
        const dataFormatada = `${dd}/${mm}/${yyyy} ${HH}:${MM}`;
        const resumo = $("#porcentagemOK");
        if (resumo) resumo.innerHTML = `<h5>Resumo do BDD - ${dataFormatada}</h5><p><span class='label'>Número de Linhas BDD:</span> ${numeroLinhas}</p><p><span class='label'>Nº Ok:</span> ${numeroOK}</p><p><span class='label'>Nº Pendente:</span> ${numeroNOK}</p><p><span class='label'>Nº Desplanejado:</span> ${numeroDesplanejado}</p><p><span class='label'>Nº Progredindo:</span> ${numeroProgredindo}</p><p><span class='label'>Nº Bug:</span> ${numeroBug}</p><p><span class='label'>Porcentagem:</span> ${porcentagemOK.toFixed(2)}%</p>`;
        const pb = $("#progressBar");
        if (pb) { pb.style.width = `${porcentagemOK}%`; pb.setAttribute("aria-valuenow", String(porcentagemOK)); pb.innerHTML = `<span>${porcentagemOK.toFixed(2)}%</span>`; }
        $("#showBugScenariosBtn")?.addEventListener("click", mostrarCenariosBug, { once: true });
    };

    const gerarDashboard = () => {
        const t = getTabela();
        if (!t) return;
        const col = getStatusColIndex();
        const data = [];
        for (let i = 1; i < t.rows.length; i++) {
            const input = t.rows[i].cells[col].querySelector("input");
            if (input) data.push((input.value || "").toLowerCase());
        }
        criarDashboard(data);
        const { numeroLinhas, numeroOK, numeroNOK, numeroDesplanejado, numeroProgredindo, numeroBug } = contarNumeros();
        const taxaCobertura = ((numeroOK + numeroNOK + numeroBug) / Math.max(numeroLinhas, 1)) * 100;
        const taxaFalhas = (numeroNOK / Math.max(numeroLinhas, 1)) * 100;
        const taxaBugs = (numeroBug / Math.max(numeroLinhas, 1)) * 100;
        atualizarResumoBDD(numeroOK, numeroNOK, numeroDesplanejado, numeroProgredindo, numeroBug, taxaCobertura, taxaFalhas, taxaBugs);
        atualizarCards(numeroOK, numeroNOK, numeroDesplanejado, numeroProgredindo, numeroBug);
        const modalEl = $("#myModal");
        if (modalEl && window.bootstrap?.Modal) new bootstrap.Modal(modalEl).show();
    };

    const mostrarCenariosBug = () => {
        const t = getTabela();
        if (!t) return [];
        const col = getStatusColIndex();
        const modalBody = $("#modalBody");
        const colunasIgnoradas = ["Contexto", "Funcionalidade", "Dado", "E", "Quando", "Então", "Aplicação", "História", "Tipo de teste"];
        const cenarios = [];
        if (modalBody) modalBody.innerHTML = "";
        for (let i = 1; i < t.rows.length; i++) {
            const input = t.rows[i].cells[col].querySelector("input");
            if (input && input.value.toLowerCase().includes("bug")) {
                const cenario = { nome: t.rows[i].cells[0].textContent, dados: [] };
                for (let j = 1; j < t.rows[i].cells.length; j++) {
                    const header = t.rows[0].cells[j]?.textContent;
                    if (!header || colunasIgnoradas.includes(header)) continue;
                    const v = t.rows[i].cells[j].querySelector("input")?.value || t.rows[i].cells[j].textContent || "";
                    cenario.dados.push(v);
                }
                cenarios.push(cenario);
            }
        }
        if (!cenarios.length) {
            Swal.fire({ icon: "info", title: "Nenhum cenário com bug encontrado", text: 'Não há nenhum cenário na tabela com o status "bug".', confirmButtonColor: "#3085d6" });
        } else if (modalBody) {
            cenarios.forEach(c => {
                const p = document.createElement("p");
                p.textContent = `${c.nome} ${c.dados.join(" ")}`;
                modalBody.appendChild(p);
            });
            const modalEl = $("#myModal");
            if (modalEl && window.bootstrap?.Modal) new bootstrap.Modal(modalEl).show();
        }
        return cenarios;
    };

    const hideButtons = () => {
        $$(".modal-footer button").forEach(b => b.style.display = "none");
        $(".modal-header button.close") && ($(".modal-header button.close").style.display = "none");
    };
    const showButtons = () => {
        $$(".modal-footer button").forEach(b => b.style.display = "");
        $(".modal-header button.close") && ($(".modal-header button.close").style.display = "");
    };

    const takeScreenshotAndDownload = () => {
        hideButtons();
        html2canvas($(".modal-content"), { scrollY: -window.scrollY, scale: 2, useCORS: true }).then(canvas => {
            const dataUrl = canvas.toDataURL("image/png");
            const a = document.createElement("a");
            a.href = dataUrl;
            a.download = "dashboard-bdd.png";
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showButtons();
        });
    };

    const copyDashEmail = () => {
        hideButtons();
        const textToCopy = "Observação: O projeto está progredindo bem, com a maioria dos cenários funcionando como esperado. No entanto, há alguns cenários que precisam de atenção adicional. A equipe deve priorizar a resolução dos cenários e continuar monitorando o progresso. Para mais detalhes, consulte o dashboard visual anexado.";
        html2canvas($(".modal-content"), { scrollY: -window.scrollY, scale: 2, useCORS: true }).then(canvas => {
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "black";
            ctx.font = "16px Arial";
            const lines = textToCopy.match(/.{1,90}(\s|$)/g) || [textToCopy];
            let y = canvas.height - 20 - (lines.length * 18);
            lines.forEach(l => { ctx.fillText(l.trim(), 20, y); y += 18; });
            showButtons();
            canvas.toBlob(blob => {
                const item = new ClipboardItem({ "image/png": blob });
                navigator.clipboard.write([item]).then(() => Swal.fire({ icon: "success", title: "Copiado!", text: "Imagem copiada com o texto adicionado!", showConfirmButton: false, timer: 1500 })).catch(() => Swal.fire({ icon: "error", title: "Erro ao copiar", text: "Ocorreu um problema ao copiar os dados. Por favor, tente novamente." }));
            });
        });
    };

    const toggleIcon = () => {
        const button = $("#toggleButton");
        const icon = button?.querySelector("i");
        if (!icon) return;
        if (icon.classList.contains("fa-magnifying-glass-chart")) {
            icon.classList.remove("fa-magnifying-glass-chart");
            icon.classList.add("fa-sync-alt");
        } else {
            icon.classList.remove("fa-sync-alt");
            icon.classList.add("fa-sync-alt");
        }
    };

    const printPDF = async () => {
        const { jsPDF } = window.jspdf;
        const content = $(".modal-content");
        if (!content) return;
        const canvas = await html2canvas(content);
        const imgData = canvas.toDataURL("image/png");
        const doc = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const pageHeight = 295;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            doc.addPage();
            doc.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
            heightLeft -= pageHeight;
        }
        const d = new Date();
        const dia = String(d.getDate()).padStart(2, "0");
        const mes = String(d.getMonth() + 1).padStart(2, "0");
        const ano = d.getFullYear();
        const horas = String(d.getHours()).padStart(2, "0");
        const minutos = String(d.getMinutes()).padStart(2, "0");
        doc.save(`dashboard_${dia}/${mes}/${ano} ${horas}:${minutos}.pdf`);
    };

    const baixarExcel = async () => {
        const t = getTabela();
        const rProj = await Swal.fire({
            title: "Informações do Projeto",
            html: `
        <input id="swal-input1" class="swal2-input custom-swal-input" placeholder="Titulo do bdd" style="margin-bottom:10px;background-color:#333;color:#eee;border:1px solid #555;">
        <input id="swal-input2" class="swal2-input custom-swal-input" placeholder="ID Octane (909043)" style="margin-bottom:10px;background-color:#333;color:#eee;border:1px solid #555;">
        <input id="swal-input3" class="swal2-input custom-swal-input" placeholder="T ou X do Usuário" style="margin-bottom:10px;background-color:#333;color:#eee;border:1px solid #555;">
        <input id="swal-input4" class="swal2-input custom-swal-input" placeholder="Chave Jira" style="background-color:#333;color:#eee;border:1px solid #555;">
      `,
            focusConfirm: false,
            preConfirm: () => {
                const tituloTeste = $("#swal-input1").value;
                const idOctane = $("#swal-input2").value;
                const usuarioTx = $("#swal-input3").value;
                const chaveJira = $("#swal-input4").value;
                if (!tituloTeste || !idOctane || !usuarioTx) {
                    Swal.showValidationMessage("Por favor, preencha todos os campos obrigatórios (Título, ID Octane, Usuário).");
                    return false;
                }
                return { tituloTeste, idOctane, usuarioTx, chaveJira };
            },
            customClass: { popup: "custom-swal-popup" },
            showCancelButton: true,
            confirmButtonText: "Confirmar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#0f4178",
            cancelButtonColor: "#d33"
        });
        if (!rProj.isConfirmed) {
            Swal.fire({ icon: "info", title: "Operação Cancelada", text: "Os dados não foram preenchidos e a exportação foi cancelada.", timer: 2000, showConfirmButton: false, background: "#333", color: "#eee" });
            return;
        }
        const { tituloTeste, idOctane, usuarioTx, chaveJira } = rProj.value;
        $("#name1") && ($("#name1").value = tituloTeste);
        $("#name8") && ($("#name8").value = idOctane);
        $("#name6") && ($("#name6").value = usuarioTx);
        if (!t || t.rows.length === 0) {
            Swal.fire({ icon: "info", title: "Nenhuma tabela encontrada", text: "Não há nenhuma tabela disponível para exportação.", confirmButtonColor: "#0d6efd", confirmButtonText: "OK" });
            return;
        }
        const data = [];
        for (let i = 0; i < t.rows.length; i++) {
            const rowData = [];
            for (let j = 0; j < t.rows[i].cells.length; j++) {
                const input = t.rows[i].cells[j].querySelector("input");
                rowData.push(input ? input.value : t.rows[i].cells[j].textContent);
            }
            data.push(rowData);
        }
        const rFmt = await Swal.fire({
            title: "Escolha um formato de exportação",
            input: "select",
            inputOptions: { excel: "Excel", json: "JSON", xml: "XML", yaml: "YAML" },
            inputPlaceholder: "Selecione um formato",
            showCancelButton: true,
            confirmButtonText: "Exportar",
            confirmButtonColor: "#006400",
            cancelButtonText: "Cancelar",
            inputValidator: v => (!v ? "Você precisa escolher um formato!" : undefined)
        });
        if (!rFmt.value) return;
        const suggested = [tituloTeste, idOctane, usuarioTx, chaveJira].filter(Boolean).join("-").replace(/\s+/g, "_");
        const rName = await Swal.fire({
            title: "Digite o nome do arquivo",
            input: "text",
            inputPlaceholder: "nome do arquivo...",
            inputValue: suggested || "arquivo",
            confirmButtonText: "Baixar",
            confirmButtonColor: "#006400",
            showCancelButton: true,
            cancelButtonText: "Cancelar",
            inputValidator: v => (!v ? "Por favor, preencha o nome do arquivo!" : undefined)
        });
        if (!rName.value) {
            swalToast("info", "Operação cancelada!");
            return;
        }
        const fileName = rName.value;
        if (rFmt.value === "excel") {
            const wb = XLSX.utils.book_new();
            const ws = XLSX.utils.aoa_to_sheet(data);
            XLSX.utils.book_append_sheet(wb, ws, "Tabela");
            XLSX.writeFile(wb, `${fileName}.xlsx`);
            swalToast("success", `Excel baixado com sucesso: ${fileName}`);
        } else if (rFmt.value === "json") {
            downloadBlob(JSON.stringify(data), `${fileName}.json`, "application/json");
            swalToast("success", `JSON baixado com sucesso: ${fileName}`);
        } else if (rFmt.value === "xml") {
            downloadBlob(convertToXML(data), `${fileName}.xml`, "application/xml");
            swalToast("success", `XML baixado com sucesso: ${fileName}`);
        } else if (rFmt.value === "yaml") {
            downloadBlob(toYAML(data), `${fileName}.yaml`, "text/yaml");
            swalToast("success", `YAML baixado com sucesso: ${fileName}`);
        }
    };

    function normalizarBDD(dados) {
        const PADRAO = TITULOS_PADRAO.slice();
        const OBRIGATORIAS = ["Cenário", "Dado", "Quando", "Então"];

        const norm = (s) => (s || "")
            .toString()
            .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
            .trim().toLowerCase();

        const sinonimos = {
            "nº cenário": ["nº cenario", "numero cenario", "numero do cenario", "ct", "id", "id cenario", "n cenario", "cenario id"],
            "cenário": ["cenario", "nome do cenario", "scenario", "titulo", "titulo do cenario"],
            "contexto": ["context", "ctx", "background", "bg"],
            "funcionalidade": ["feature", "funcao", "funcionalidade/feature"],
            "dado": ["given", "dados", "precondicao", "pre-condicao", "pré-condição", "precondição"],
            "quando": ["when"],
            "então": ["then", "entao"],
            "aplicação": ["aplicacao", "application", "aplication", "app"],
            "história": ["historia", "story", "jira", "epic", "feature id"],
            "tipo de teste": ["tipo teste", "test type", "tipo"],
            "teste de campo": ["campo", "field test", "campo de teste", "positivo/negativo"],
            "status": ["resultado", "result", "estado", "situacao", "situação"]
        };

        const toPadrao = (h) => {
            const n = norm(h);
            for (const alvo of PADRAO) {
                if (norm(alvo) === n) return alvo;
                const sins = sinonimos[alvo.toLowerCase()] || [];
                if (sins.some(s => norm(s) === n)) return alvo;
            }
            return null;
        };

        const primeiraLinha = Array.isArray(dados?.[0]) ? dados[0] : [];
        const mapeamentoTentativo = primeiraLinha.map(toPadrao);
        const temCabecalho = mapeamentoTentativo.filter(Boolean).length >= 2;

        const mapa = {};
        if (temCabecalho) {
            primeiraLinha.forEach((h, i) => {
                const k = toPadrao(h);
                if (k != null && !(k in mapa)) mapa[k] = i;
            });
        }

        const faltantes = OBRIGATORIAS.filter(k => mapa[k] == null);
        const foiNormalizado = !temCabecalho || faltantes.length > 0 || PADRAO.some(k => !(k in mapa));

        const out = [PADRAO];
        const start = temCabecalho ? 1 : 0;

        for (let r = start; r < dados.length; r++) {
            const row = dados[r] || [];

            const get = (nome) => {
                const idx = mapa[nome];
                return (idx != null ? row[idx] : "");
            };

            let numero = get("Nº Cenário");
            if (!numero) numero = `CT${String(out.length).padStart(4, "0")}`;

            let cenario = get("Cenário");
            if (!cenario) cenario = `Cenário ${String(out.length - 0).padStart(2, "0")}`;

            const resumo = `Resumo do cenário: ${cenario}`;

            const contexto = get("Contexto") || resumo;
            const funcionalidade = get("Funcionalidade") || resumo;
            const dado = get("Dado") || resumo;
            const quando = get("Quando") || resumo;
            const entao = get("Então") || resumo;
            const aplicacao = get("Aplicação") || "Web";
            const historia = get("História") || "EMPC";
            const tipoTeste = get("Tipo de teste") || "Acceptance";
            const testeCampo = get("Teste de campo") || "Positivo";
            let status = get("Status") || "OK";

            out.push([numero, cenario, contexto, funcionalidade, dado, quando, entao, aplicacao, historia, tipoTeste, testeCampo, status]);
        }

        return { dados: out, foiNormalizado, faltantes, mapeamento: mapa };
    }

    async function importExcel() {
        const input = document.querySelector("#importExcel");
        const file = input?.files?.[0];
        if (!file) {
            Swal.fire({ icon: "info", title: "Selecione um arquivo Excel", confirmButtonColor: "#3085d6" });
            return;
        }

        importedFileName = file.name;
        const reader = new FileReader();
        const fileNameWithoutExtension = importedFileName.replace(/\.[^/.]+$/, "");

        reader.onload = (e) => {
            const data = e.target.result;
            const wb = XLSX.read(data, { type: "binary" });
            const sheetName = wb.SheetNames[0];
            const ws = wb.Sheets[sheetName];
            const importedData = XLSX.utils.sheet_to_json(ws, { header: 1 });

            const { dados: normalizados, foiNormalizado, faltantes } = normalizarBDD(importedData);
            updateTable(normalizados);

            const lbl = document.querySelector("#exampleModalLabel");
            if (lbl) {
                lbl.innerHTML = `<img width="40" src="./src/img/logoPage200.png" alt="cm"> Dashboard<b style="color:#16db6b"> BDD</b> - ${fileNameWithoutExtension}`;
            }
            swalToast("success", `Arquivo '${file.name}' importado!`);

            if (foiNormalizado) {
                const falt = (faltantes && faltantes.length)
                    ? `<br><br><b>Colunas obrigatórias ausentes:</b> ${faltantes.join(", ")} (foram adicionadas com valores padrão).`
                    : "";
                Swal.fire({
                    icon: "info",
                    title: "BDD ajustado para o padrão",
                    html:
                        `<p style='color:#fff'>
            Organizamos cabeçalho/ordem e preenchemos o que faltava:
            <br>• Aplicação = <b>Web</b>
            <br>• Tipo de teste = <b>Acceptance</b>
            <br>• Teste de campo = <b>Positivo</b>
            <br>• História = <b>EMPC</b>
            <br>• Status = <b>OK</b>
            <br>• Campos <b>Cenário/Contexto/Funcionalidade/Dado/Quando/Então</b> receberam um <b>resumo do cenário</b> quando vazios.
           </p>${falt}`,
                    confirmButtonColor: "#3085d6"
                });
            }
            document.querySelector("#saveButtonContainer")?.style && (document.querySelector("#saveButtonContainer").style.display = "block");
        };

        reader.readAsBinaryString(file);

        const ret = await Swal.fire({
            title: "Deseja ativar o reconhecimento de voz?",
            html: '<p style="color:#fff;">Você poderá preencher os campos usando sua voz.</p>',
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Não",
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33"
        });
        if (ret.isConfirmed) ativarReconhecimentoDeVoz(); else document.querySelector("#audioButton") && (document.querySelector("#audioButton").style.display = "block");

        document.querySelector(".grade-buttons")?.classList.remove("d-none");
        document.querySelector("#audioButton")?.classList.remove("d-none");
        document.querySelector("#dashboardButton")?.classList.add("d-none");
        document.querySelector("#card-btns")?.classList.add("d-none");
        document.querySelector(".div-btns-lines003")?.classList.add("d-none");
        document.querySelector("#customButtonEx")?.classList.add("d-none");
    }

    const alternarVisibilidade = () => {
        const campoFiltro = $("#filtroCT");
        const segundoBotao = $("#segundoBotao");
        if (campoFiltro) campoFiltro.style.display = (campoFiltro.style.display === "none" || campoFiltro.style.display === "") ? "block" : "none";
        if (segundoBotao) segundoBotao.style.display = (segundoBotao.style.display === "none" || segundoBotao.style.display === "") ? "block" : "none";
    };

    function gerarResumoJira() {
        const t = document.getElementById('tabela');
        if (!t) { Swal.fire({ icon: 'info', title: 'Nenhuma tabela encontrada', text: 'Gere ou importe um BDD primeiro.' }); return; }
        const header = t.rows[0]; if (!header) { Swal.fire({ icon: 'info', title: 'Cabeçalho ausente' }); return; }
        const map = {};
        for (let i = 0; i < header.cells.length; i++) { map[header.cells[i].textContent.trim().toLowerCase()] = i; }
        const idx = n => map[n.toLowerCase()];
        const getVal = (tr, name) => {
            const j = idx(name); if (j == null) return "";
            const inp = tr.cells[j]?.querySelector('input');
            return (inp ? inp.value : tr.cells[j]?.textContent || "").trim();
        };
        const selecionadas = Array.from(t.rows).slice(1).map((tr, i) => tr.classList.contains('linha-selecionada') ? i + 1 : null).filter(Boolean);
        const linhas = selecionadas.length ? selecionadas : Array.from({ length: t.rows.length - 1 }, (_, k) => k + 1);
        const grupos = {};
        linhas.forEach(r => {
            const tr = t.rows[r];
            const historia = getVal(tr, 'História') || 'EMPC';
            const funcionalidade = getVal(tr, 'Funcionalidade') || getVal(tr, 'Cenário') || 'Funcionalidade';
            const contexto = getVal(tr, 'Contexto');
            const aplicacao = getVal(tr, 'Aplicação') || 'Web';
            const tipo = getVal(tr, 'Tipo de teste') || 'Acceptance';
            const campo = getVal(tr, 'Teste de campo') || 'Positivo';
            const dado = getVal(tr, 'Dado');
            const quando = getVal(tr, 'Quando');
            const entao = getVal(tr, 'Então');
            const status = (getVal(tr, 'Status') || 'OK').toUpperCase();
            if (!grupos[historia]) grupos[historia] = { funcionalidade, aplicacao, tipo, campo, contexto, criterios: [], statusSet: new Set() };
            grupos[historia].criterios.push(`Dado ${dado}; Quando ${quando}; Então ${entao}${status !== 'OK' ? ` [${status}]` : ''}.`);
            grupos[historia].statusSet.add(status);
            if (!grupos[historia].funcionalidade && funcionalidade) grupos[historia].funcionalidade = funcionalidade;
            if (!grupos[historia].contexto && contexto) grupos[historia].contexto = contexto;
        });
        let texto = "";
        const hs = Object.keys(grupos);
        hs.forEach((h, gi) => {
            const g = grupos[h];
            const st = Array.from(g.statusSet).join(", ");
            texto += `Título: ${h} - ${g.funcionalidade}\n`;
            texto += `Resumo: Como usuário do ${g.aplicacao}, quero ${g.funcionalidade} para atender ao objetivo descrito.\n`;
            if (g.contexto) texto += `Contexto: ${g.contexto}\n`;
            texto += `Aplicação: ${g.aplicacao}\n`;
            texto += `Tipo de teste: ${g.tipo} | Campo: ${g.campo}\n`;
            texto += `Status: ${st}\n`;
            texto += `Critérios de Aceite:\n`;
            g.criterios.forEach(c => texto += `- ${c}\n`);
            texto += `Definição de Pronto:\n- Cenários principais cobertos\n- Critérios de aceite verificados\n- Sem regressões conhecidas\n`;
            if (gi < hs.length - 1) texto += `\n-----\n\n`;
        });
        Swal.fire({
            title: "Resumo para JIRA",
            html: `<textarea id="jiraResumo" style="width:100%;height:340px;white-space:pre; font-family:monospace">${texto}</textarea>`,
            width: "70%",
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: "Copiar",
            denyButtonText: "Baixar .md",
            cancelButtonText: "Fechar",
            confirmButtonColor: "#1589FF",
            denyButtonColor: "#198754"
        }).then(res => {
            const ta = document.getElementById('jiraResumo');
            if (!ta) return;
            if (res.isConfirmed) {
                ta.select(); ta.setSelectionRange(0, ta.value.length);
                document.execCommand('copy');
                Swal.fire({ icon: "success", title: "Resumo copiado" });
            } else if (res.isDenied) {
                const blob = new Blob([ta.value], { type: "text/markdown;charset=utf-8" });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = "resumo_jira.md";
                document.body.appendChild(a); a.click(); document.body.removeChild(a);
            }
        });
    }
    document.addEventListener('click', function (e) {
        if (e.target && e.target.id === 'jiraSummaryBtn') { gerarResumoJira(); }
    });

    const toggleButtons = clickedBtnId => {
        const featuresBtn = $("#featuresBtn");
        const baixarBtn = $("#baixarBtn");
        const voltarBtn = $("#voltarBtn");
        featuresBtn?.classList.remove("selected");
        baixarBtn?.classList.remove("selected");
        const clicked = document.getElementById(clickedBtnId);
        clicked && clicked.classList.add("selected");
        if (featuresBtn) featuresBtn.classList.toggle("hide", featuresBtn.classList.contains("selected"));
        if (baixarBtn) baixarBtn.classList.toggle("hide", baixarBtn.classList.contains("selected"));
        if (voltarBtn && baixarBtn) voltarBtn.classList.toggle("hide", !baixarBtn.classList.contains("selected"));
    };

    const startIncrement = (el, step = 1) => setInterval(() => el.value = String(parseInt(el.value || "0", 10) + step), 100);
    const startDecrement = (el, step = 1) => setInterval(() => el.value = String(Math.max(0, parseInt(el.value || "0", 10) - step)), 100);

    document.addEventListener("DOMContentLoaded", () => {
        document.addEventListener("dblclick", e => {
            const target = e.target;
            if (target.tagName === "INPUT" && target.type === "text") {
                Swal.fire({
                    title: "Texto Digitado",
                    html: `<textarea id="swal-input1" style="height:130px;width:340px;border-radius:10px;background-color:#f9f9f9;box-shadow:0 4px 6px rgba(0,0,0,.1);color:#333;padding:10px;font-family:Arial,sans-serif;font-size:14px;resize:none">${target.value}</textarea>`,
                    icon: "info",
                    confirmButtonColor: "#3085d6",
                    confirmButtonText: "OK",
                    showCancelButton: true,
                    cancelButtonText: "Cancelar",
                    preConfirm: () => document.getElementById("swal-input1").value
                }).then(res => { if (res.isConfirmed) target.value = res.value; });
            }
        });

        fetch("./src/data/sugestoes.json").then(r => r.json()).then(d => suggestionList = d || []).catch(() => { });

        document.addEventListener("click", e => {
            const target = e.target;
            if (target.tagName === "INPUT" && target.type === "text") {
                if (target !== activeInput) { activeInput = target; removeDropdowns(); }
            } else {
                removeDropdowns();
                activeInput = null;
            }
        });

        document.addEventListener("input", async e => {
            const target = e.target;
            if (target.tagName === "INPUT" && target.type === "text" && target === activeInput) {
                const searchText = target.value.toLowerCase();
                const filtered = suggestionList.filter(s => s.toLowerCase().includes(searchText)).slice(0, 50);
                removeDropdowns();
                if (filtered.length) {
                    const dd = createDropdown(target, filtered);
                    document.body.appendChild(dd);
                    positionDropdown(target, dd);
                }
                if (searchText.includes("bug")) {
                    const ret = await Swal.fire({
                        title: "Adicionar informações de Bug",
                        width: "80%",
                        html: htmlBugForm(),
                        customClass: { content: "custom-swal-content" },
                        didOpen: () => { const c = document.querySelector(".swal2-content"); if (c) c.style.color = "white"; },
                        showCancelButton: true,
                        confirmButtonText: "Adicionar",
                        confirmButtonColor: "#1589FF",
                        cancelButtonText: "Cancelar",
                        showLoaderOnConfirm: true,
                        preConfirm: () => {
                            const g = id => document.getElementById(id).value.trim();
                            const bugNumber = g("bugNumber");
                            const aplicacaoName = g("aplicacaoName");
                            const torreName = g("torreName");
                            const abertoPor = g("abertoPor");
                            const tipo = g("tipo");
                            const categoria = g("categoria");
                            const ambiente = g("ambiente");
                            const servico = g("servico");
                            const estado = g("estado");
                            const impacto = g("impacto");
                            const urgencia = g("urgencia");
                            const prioridade = g("prioridade");
                            const grupoAtribuicao = g("grupoAtribuicao");
                            const criadoEm = g("criadoEm");
                            if ([bugNumber, aplicacaoName, torreName, abertoPor, tipo, categoria, ambiente, servico, estado, impacto, urgencia, prioridade, grupoAtribuicao, criadoEm].some(v => !v)) {
                                Swal.showValidationMessage("Por favor, preencha todos os campos.");
                                return false;
                            }
                            return `bug nº ${bugNumber}, Aplicação: ${aplicacaoName}, Descrição: ${torreName}, Aberto por: ${abertoPor}, Tipo: ${tipo}, Categoria: ${categoria}, Ambiente: ${ambiente}, Serviço: ${servico}, Estado: ${estado}, Impacto: ${impacto}, Urgência: ${urgencia}, Prioridade: ${prioridade}, Grupo de Atribuição: ${grupoAtribuicao}, Criado em: ${criadoEm}`;
                        }
                    });
                    if (ret.isConfirmed) target.value = ret.value;
                }
            }
        });

        $("#dashboardButton")?.addEventListener("click", () => {
            const t = getTabela();
            if (!t) {
                Swal.fire({
                    title: "Nenhuma tabela encontrada",
                    html: '<p style="color:#fff;font-size:11px;">Para gerar o dashboard, você precisa importar uma tabela. Deseja importar uma agora?</p>',
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonText: "Importar Tabela",
                    cancelButtonText: "Cancelar",
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33"
                }).then(res => {
                    if (res.isConfirmed) {
                        const importInput = $("#importExcel");
                        importInput?.click();
                        importInput?.addEventListener("change", function onChange() {
                            if (importInput.files.length > 0) setTimeout(() => $("#toggleButton")?.click(), 2000);
                            else Swal.fire({ title: "Nenhum arquivo selecionado", text: "Você precisa selecionar um arquivo para importar a tabela.", icon: "error", confirmButtonText: "OK" });
                            importInput.removeEventListener("change", onChange);
                        }, { once: true });
                    } else if (res.dismiss === Swal.DismissReason.cancel) {
                        document.querySelector(".modal .close")?.click();
                    }
                });
            } else {
                gerarDashboard();
            }
        });

        $("#btn-sear")?.addEventListener("click", function () {
            const icon = this.querySelector("i");
            if (!icon) return;
            if (icon.classList.contains("fa-magnifying-glass-arrow-right")) {
                icon.classList.remove("fa-magnifying-glass-arrow-right");
                icon.classList.add("fa-xmark");
            } else {
                icon.classList.remove("fa-xmark");
                icon.classList.add("fa-magnifying-glass-arrow-right");
            }
        });

        $("#doc-book")?.addEventListener("click", () => location.href = "./src/html/sheetFrenzybddDocumentacao.html");

        $("#titulo")?.addEventListener("click", () => location.reload());

        window.baixarExcel = baixarExcel;
        window.importExcel = importExcel;
        window.saveTable = saveTable;
        window.criarTabela = criarTabela;
        window.atualizarEstiloLinhasSublinhadas = atualizarEstiloLinhasSublinhadas;
        window.ativarReconhecimentoDeVoz = ativarReconhecimentoDeVoz;
        window.baixarSelecionados = baixarSelecionados;
        window.ordenarColuna = ordenarColuna;
        window.moverColuna = moverColuna;
        window.excluirColuna = excluirColuna;
        window.inserirColuna = inserirColuna;
        window.adicionarColuna = adicionarColuna;
        window.adicionarColunaFeature = adicionarColunaFeature;
        window.adicionarLinha = adicionarLinha;
        window.apagarLinha = apagarLinha;
        window.abrirModalEmail = abrirModalEmail;
        window.removeDropdowns = removeDropdowns;
        window.positionDropdown = positionDropdown;
        window.copiarParaTodos = copiarParaTodos;
        window.filtrarPorCT = filtrarPorCT;
        window.gerarDashboard = gerarDashboard;
        window.mostrarCenariosBug = mostrarCenariosBug;
        window.takeScreenshotAndDownload = takeScreenshotAndDownload;
        window.copyDashEmail = copyDashEmail;
        window.hideButtons = hideButtons;
        window.showButtons = showButtons;
        window.toggleIcon = toggleIcon;
        window.printPDF = printPDF;

        const contadorInput1 = $("#rows");
        const contadorInput2 = $("#cols");
        let inc1, dec1, inc2, dec2;
        window.startIncrement1 = () => inc1 = startIncrement(contadorInput1);
        window.stopIncrement1 = () => clearInterval(inc1);
        window.startDecrement1 = () => dec1 = startDecrement(contadorInput1);
        window.stopDecrement1 = () => clearInterval(dec1);
        window.startIncrement2 = () => inc2 = startIncrement(contadorInput2);
        window.stopIncrement2 = () => clearInterval(inc2);
        window.startDecrement2 = () => dec2 = startDecrement(contadorInput2);
        window.stopDecrement2 = () => clearInterval(dec2);
        window.alternarVisibilidade = alternarVisibilidade;
        window.toggleButtons = toggleButtons;
    });
})();
