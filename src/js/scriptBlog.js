const firebaseConfig = {
    apiKey: "AIzaSyBQylGym3PS7qzAql7s_UKMkHODFnAdkhc",
    authDomain: "sheetfrenzyblog.firebaseapp.com",
    databaseURL: "https://sheetfrenzyblog-default-rtdb.firebaseio.com",
    projectId: "sheetfrenzyblog",
    storageBucket: "sheetfrenzyblog.appspot.com",
    messagingSenderId: "910791258175",
    appId: "1:910791258175:web:9a906f87eabce194c4088a"
};

firebase.initializeApp(firebaseConfig);

document.addEventListener("DOMContentLoaded", function () {
    showRules();
});

// Show rules before creating data
function showRules() {
    Swal.fire({
        title: 'Regras de Publicação',
        html: '<p>1. Mantenha o respeito e a ética em suas publicações.</p>' +
            '<p>2. Não publique conteúdo ofensivo ou ilegal.</p>' +
            '<p>3. Certifique-se de que o assunto é relevante e adequado.</p>',
        icon: 'info',
        confirmButtonText: 'Aceitar',
        confirmButtonColor: "#15c56d",
        customClass: {
            container: 'swal-wide'
        }
    });
}

// Validate and create new data
// Validate and create new data
function validateAndCreateData() {
    const title = document.getElementById("title").value;
    const subject = document.getElementById("subject").value;
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;

    // Email validation
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;

    if (title === "" || subject === "" || name === "" || email === "") {
        Swal.fire({
            title: 'Erro',
            text: 'Por favor, preencha todos os campos antes de enviar.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: "#15c56d",
            customClass: {
                container: 'swal-wide'
            }
        });
    } else if (!emailPattern.test(email)) {
        Swal.fire({
            title: 'Erro',
            text: 'Por favor, insira um endereço de email válido.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: "#15c56d",
            customClass: {
                container: 'swal-wide'
            }
        });
    } else if (title.length < 13) {
        Swal.fire({
            title: 'Erro',
            text: 'O título deve conter no mínimo 13 caracteres.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: "#15c56d",
            customClass: {
                container: 'swal-wide'
            }
        });
    } else if (subject.length < 500) {
        Swal.fire({
            title: 'Erro',
            text: 'O assunto deve conter no mínimo 500 caracteres.',
            icon: 'error',
            confirmButtonText: 'OK',
            confirmButtonColor: "#15c56d",
            customClass: {
                container: 'swal-wide'
            }
        });
    } else {
        createData(title, subject, name, email);
    }
}

// Create a new data
function createData(title, subject, name, email) {
    const newData = {
        title: title,
        subject: subject,
        name: name,
        email: email,
        timestamp: new Date().getTime() // Adding a timestamp for sorting
    };

    firebase.database().ref("users/").push(newData).then(() => {
        // Clear form fields
        document.getElementById("title").value = "";
        document.getElementById("subject").value = "";
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";

        Swal.fire({
            title: 'Sucesso',
            text: 'Novo tópico adicionado com sucesso.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: "#15c56d",
            customClass: {
                container: 'swal-wide'
            }
        });
    });
}

// Create a new data
function createData(title, subject, name, email) {
    const newData = {
        title: title,
        subject: subject,
        name: name,
        email: email,
        timestamp: new Date().getTime() // Adding a timestamp for sorting
    };

    firebase.database().ref("users/").push(newData).then(() => {
        // Clear form fields
        document.getElementById("title").value = "";
        document.getElementById("subject").value = "";
        document.getElementById("name").value = "";
        document.getElementById("email").value = "";

        Swal.fire({
            title: 'Sucesso',
            text: 'Novo tópico adicionado com sucesso.',
            icon: 'success',
            confirmButtonText: 'OK',
            confirmButtonColor: "#15c56d",
            customClass: {
                container: 'swal-wide'
            }
        });
    });
}

// Read data and sort by timestamp
firebase.database().ref("users/").orderByChild("timestamp").on("value", function (snapshot) {
    document.getElementById("showUsers").innerHTML = "";
    let data = [];
    snapshot.forEach(function (childSnapshot) {
        data.push(childSnapshot.val());
    });

    // Reverse the order of data to show latest posts first
    data.reverse();

    data.forEach(function (childData) {
        let addDiv = document.createElement('div');
        addDiv.className = "user-entry";
        addDiv.innerHTML =
            '<h3>' + childData.title + '</h3>' +
            '<p>' + childData.subject + '</p><br>' +
            '<div class="author-email">' +
            '<span><i class="fas fa-user"></i> Autor: ' + childData.name + '</span>' +
            '<span><i class="fas fa-envelope"></i> ' + childData.email + '</span>' +
            '</div>';
        document.getElementById("showUsers").appendChild(addDiv);
    });
});

// Edit subject
function editSubject() {
    const subject = document.getElementById("subject").value;
    Swal.fire({
        title: 'Editar Assunto',
        input: 'textarea',
        inputLabel: 'Assunto',
        inputValue: subject,
        showCancelButton: true,
        confirmButtonText: 'Salvar',
        cancelButtonText: 'Cancelar',
        confirmButtonColor: "#15c56d",
        customClass: {
            container: 'swal-wide'
        },
        preConfirm: (text) => {
            document.getElementById("subject").value = text;
        }
    });
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const themeIcon = document.getElementById('themeIcon');
    if (document.body.classList.contains('dark-theme')) {
        themeIcon.classList.remove('fa-sun');
        themeIcon.classList.add('fa-moon');
    } else {
        themeIcon.classList.remove('fa-moon');
        themeIcon.classList.add('fa-sun');
    }
}

const btnGherkin = document.getElementById('blogsheet');
btnGherkin.addEventListener('click', e => {
    location.href = 'https://ghmdevelops.github.io/sheetFrenzybdd/';
});

console.log("\n%cAtenção Espere! %c\n\n\nEste é um recurso de navegador voltado para desenvolvedores. Se alguém disse para você copiar e colar algo aqui para ativar um recurso ou 'invadir' a maquina de outra pessoa, isso é uma fraude e você dará a ele acesso à sua maquina.\n\nConsulte ataques https://en.wikipedia.org/wiki/Self-XSS para obter mais informações.", "color: red; font-size: 46px;", "font-size: 16px;");
