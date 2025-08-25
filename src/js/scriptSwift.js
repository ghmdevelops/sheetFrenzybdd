window.onbeforeunload = function () {
  return "e possível que as alterações feitas não sejam salvas.";
};

function setInputValue(id, value) {
  var el = document.getElementById(id);
  if (!el) return;
  el.value = value || "";
  var label = el.parentNode.querySelector(".floating-label");
  if (label) (el.value.trim() ? label.classList.add("active") : label.classList.remove("active"));
}

function parseAndFillFromFileName(baseName) {
  var base = baseName.replace(/\.[^.]+$/, "");
  var parts = base.split("-").map(function (s) { return s.trim(); }).filter(Boolean);
  if (parts.length < 4) return false;
  var jira = parts[parts.length - 1];
  var user = parts[parts.length - 2];
  var octane = parts[parts.length - 3];
  var title = parts.slice(0, parts.length - 3).join(" - ");
  setInputValue("name1", title);
  setInputValue("name5", octane);
  setInputValue("name6", user);
  setInputValue("name8", jira);
  setInputValue("name7", title);
  setInputValue("name4", "SHARED"); 
  return { title: title, octane: octane, user: user, jira: jira, descricao: descricao };
}

document.getElementById("excelFile").addEventListener("change", function () {
  var fileLabel = document.getElementById("file-label");
  var file = this.files[0];
  var fileName = file ? file.name : "Escolher arquivo";
  fileLabel.innerHTML = '<img src="https://img.icons8.com/color/38/000000/microsoft-excel-2019--v1.png" alt="Excel Icon"> ' + fileName;
  if (file) {
    var filled = parseAndFillFromFileName(file.name);
    if (filled) {
      Swal.fire({
        icon: "success",
        title: "Campos preenchidos",
        html: '<div style="color:#fff;text-align:left"><b>Título:</b> ' + filled.title + "<br><b>ID Octane:</b> " + filled.octane + "<br><b>Usuário:</b> " + filled.user + "<br><b>Jira/Sprint:</b> " + filled.jira + "<br><b>Descricao: </b>" + filled.title + "</div>",
        timer: 2200,
        showConfirmButton: false,
        background: "#333",
        color: "#eee"
      });
    }
  }
  checkFormFields();
});

document.addEventListener("DOMContentLoaded", function () {
  var inputs = document.querySelectorAll(".floating-input");
  inputs.forEach(function (input) {
    input.addEventListener("focus", function () {
      this.parentNode.querySelector(".floating-label").classList.add("active");
    });
    input.addEventListener("blur", function () {
      if (this.value === "") this.parentNode.querySelector(".floating-label").classList.remove("active");
    });
    if (input.value !== "") input.parentNode.querySelector(".floating-label").classList.add("active");
  });
  var excelFileDiv = document.getElementById("excel-file");
  if (excelFileDiv) excelFileDiv.style.display = "block";
  checkFormFields();
});

function checkFormFields() {
  var fields = ["name1", "name4", "name5", "name6", "name7", "name8"];
  var allFilled = fields.every(function (fieldId) {
    return document.getElementById(fieldId).value.trim() !== "";
  });
  var excelFile = document.getElementById("excelFile");
  var convertButton = document.getElementById("convert-button");
  var excelFileDiv = document.getElementById("excel-file");
}

document.querySelectorAll("#converterForm input, #converterForm textarea").forEach(function (input) {
  input.addEventListener("input", checkFormFields);
});

document.getElementById("excelFile").addEventListener("change", checkFormFields);
document.addEventListener("DOMContentLoaded", checkFormFields);

document.getElementById("converterForm").addEventListener("submit", function (e) {
  e.preventDefault();
  var fields = ["name1", "name5", "name6", "name7", "name8"];
  var emptyFields = fields.filter(function (field) { return document.getElementById(field).value.trim() === ""; });
  if (emptyFields.length > 0) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      html: '<p style="font-family: Arial, sans-serif; font-size: 16px; color: #fff; margin-bottom: 10px;">Por favor, preencha todos os campos.</p>',
      confirmButtonColor: "#0f4178",
      confirmButtonText: "OK"
    });
    return;
  }
  var fileInput = document.getElementById("excelFile");
  if (!fileInput.files.length) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      html: '<p style="font-family: Arial, sans-serif; font-size: 16px; color: #fff; margin-bottom: 10px;">Por favor, escolha um arquivo Excel.</p>',
      confirmButtonColor: "#0f4178",
      confirmButtonText: "OK"
    });
    return;
  }
  var suggestedFileName = fileInput.files[0].name.split(".").slice(0, -1).join(".");
  Swal.fire({
    title: "Nome do arquivo",
    input: "text",
    html: '<b style="color: #fff;">Manter o mesmo nome ou insira outro nome.</b>',
    inputValue: suggestedFileName,
    inputPlaceholder: "Swift_Shift_Converter",
    showCancelButton: true,
    confirmButtonColor: "#0f4178",
    confirmButtonText: "OK",
    cancelButtonText: "Cancelar",
    inputValidator: function (value) {
      if (!value) return "Você precisa inserir um nome para o arquivo!";
    }
  }).then(function (result) {
    if (result.isConfirmed) {
      var fileName = result.value;
      var file = fileInput.files[0];
      var reader = new FileReader();
      reader.onload = function (e) {
        var data = new Uint8Array(e.target.result);
        var workbook = XLSX.read(data, { type: "array" });
        var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        var rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
        var requiredHeaders = ["Nº Cenário", "Cenário", "Contexto", "Funcionalidade", "Dado", "Quando", "Então", "Aplicação", "História", "Tipo de teste", "Teste de campo", "Status"];
        var actualHeaders = rows[0].map(function (header) { return String(header || "").trim(); });
        var missingHeaders = requiredHeaders.filter(function (h) { return actualHeaders.indexOf(h) === -1; });
        var extraHeaders = actualHeaders.filter(function (h) { return requiredHeaders.indexOf(h) === -1; });
        if (missingHeaders.length > 0 || extraHeaders.length > 0) {
          var message = "";
          if (missingHeaders.length > 0) message += "Os seguintes títulos estão faltando no arquivo: " + missingHeaders.join(", ") + ". ";
          if (extraHeaders.length > 0) message += "Os seguintes títulos são extras ou diferentes: " + extraHeaders.join(", ") + ".por favor retirar.";
          Swal.fire({
            icon: "error",
            title: "Oops...",
            html: '<p style="font-family: Arial, sans-serif; font-size: 16px; color: #fff; margin-bottom: 10px;">' + message + "</p>",
            confirmButtonColor: "#0f4178",
            confirmButtonText: "OK"
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
  var progressBar = document.getElementById("progressBar");
  var progressContainer = document.getElementById("progressContainer");
  progressContainer.style.display = "block";
  progressBar.style.width = "0%";
  var progress = 0;
  var interval = setInterval(function () {
    progress += 5;
    progressBar.style.width = progress + "%";
    if (progress >= 100) {
      clearInterval(interval);
      var workbook = XLSX.utils.book_new();
      var manualSheetData = [["unique_id", "type", "name", "step_type", "step_description", "test_type", "test_subtype_udf", "test_group_udf", "product_areas", "covered_content", "designer", "description", "estimated_duration", "owner", "phase"]];
      var uniqueId = 1;
      var namesSet = new Set();
      var duplicateNames = [];
      var duplicateRows = {};
      rows.slice(1).forEach(function (row, index) {
        var name = row[1];
        if (namesSet.has(name)) {
          if (!duplicateRows[name]) duplicateRows[name] = [];
          duplicateRows[name].push(index + 2);
          duplicateNames.push('"' + name + '" na linha ' + (index + 2));
        } else {
          namesSet.add(name);
        }
        var description = row[2];
        var aplicacao = row[7];
        var tipoTeste = row[9];
        var testeCampo = row[10];
        manualSheetData.push([uniqueId, "test_manual", name, "", "", tipoTeste, testeCampo, aplicacao, document.getElementById("name4").value, document.getElementById("name5").value, document.getElementById("name6").value, description, "15", document.getElementById("name6").value, "Ready"]);
        var dado = row[4];
        var quando = row[5];
        var entao = row[6];
        ["Dado que " + dado, "Quando " + quando, "Então " + entao].forEach(function (desc) {
          manualSheetData.push([++uniqueId, "step", "", desc.indexOf("Então ") === 0 ? "validation" : "simple", desc, "", "", "", "", "", "", "", "", "", ""]);
        });
        uniqueId++;
      });
      if (duplicateNames.length > 0) {
        Swal.fire({
          icon: "error",
          title: "Nomes duplicados encontrados!",
          html: '<p style="font-family: Arial, sans-serif; font-size: 16px; color: #fff; margin-bottom: 10px;">Os seguintes nomes estão duplicados: <br>' + duplicateNames.join("<br>") + '.<p style="color: #fff;">Por favor, remova os duplicados antes de prosseguir.</p></p>',
          confirmButtonColor: "#0f4178",
          confirmButtonText: "OK"
        }).then(function () {
          Swal.fire({
            title: "Adicionar números aos nomes duplicados?",
            html: '<b style="color: #fff;">Deseja adicionar números sequenciais no final dos nomes duplicados para corrigir?</b>',
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sim",
            cancelButtonText: "Não"
          }).then(function (result) {
            if (result.isConfirmed) {
              Object.keys(duplicateRows).forEach(function (name) {
                var count = 1;
                duplicateRows[name].forEach(function (rowIndex) {
                  var newName = name + " " + count;
                  rows[rowIndex - 1][1] = newName;
                  count++;
                });
              });
              processExcelData(rows, fileName);
            } else {
              progressContainer.style.display = "none";
            }
          });
        });
        return;
      }
      var manualSheet = XLSX.utils.aoa_to_sheet(manualSheetData);
      XLSX.utils.book_append_sheet(workbook, manualSheet, "manual tests");
      var testDataSheetData = [["unique_id", "type", "name", "test_id", "product_areas", "covered_content", "designer", "description", "test_type", "owner", "jira_project_udf", "jira_sprint_udf", "ts_projectid_udf"]];
      testDataSheetData.push([1, "test_suite", document.getElementById("name1").value, "", document.getElementById("name4").value, document.getElementById("name5").value, document.getElementById("name6").value, document.getElementById("name7").value, "Acceptance", document.getElementById("name6").value, "EMPPVD", document.getElementById("name8").value, "teste"]);
      var testId = 1;
      for (var i = 2; i <= rows.length; i++) {
        testDataSheetData.push([i, "test_manual", "", testId, "", "", "", "", "", "", "", "", ""]);
        testId += 4;
      }
      var testDataSheet = XLSX.utils.aoa_to_sheet(testDataSheetData);
      XLSX.utils.book_append_sheet(workbook, testDataSheet, "test suites");
      var wbout = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
      saveAs(new Blob([wbout], { type: "application/octet-stream" }), fileName + ".xlsx");
      Swal.fire({
        icon: "success",
        html: '<p style="font-family: Arial, sans-serif; font-size: 16px; color: #fff; margin-bottom: 10px;">O arquivo Excel foi criado com sucesso!<br><b style="color: #f5a623;">Não se esqueça de abrir o Excel e escolher um rótulo, como \'Público\', \'Interno\', etc.</b></p>',
        confirmButtonColor: "#0f4178",
        confirmButtonText: "OK",
        timer: 7500,
        showConfirmButton: false,
        position: "center",
        timerProgressBar: true
      }).then(function () {
        Swal.fire({
          title: "Deseja limpar todos os campos?",
          showCancelButton: true,
          confirmButtonText: "Sim, limpar",
          cancelButtonText: "Não",
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6"
        }).then(function (result) {
          if (result.isConfirmed) {
            document.querySelector("form").reset();
            Swal.fire("Campos limpos!", "Todos os campos foram resetados.", "success");
          }
        });
        progressContainer.style.display = "none";
      });
    }
  }, 100);
}

function saveAs(blob, fileName) {
  var link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

document.getElementById("logoInit").addEventListener("click", function () {
  window.location.href = "https://ghmdevelops.github.io/sheetFrenzybdd/";
});
