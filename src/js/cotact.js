const firebaseConfig = {
    apiKey: "AIzaSyCD9SeUe31y3aC0jaTxIlk_IZI3oHmwcNo",
    authDomain: "bdd-3ae9d.firebaseapp.com",
    databaseURL: "https://bdd-3ae9d-default-rtdb.firebaseio.com",
    projectId: "bdd-3ae9d",
    storageBucket: "bdd-3ae9d.appspot.com",
    messagingSenderId: "391150209744",
    appId: "1:391150209744:web:5b06807c9ea71f6be9acd5",
    measurementId: "G-2Y0D6XY4SZ"
};

firebase.initializeApp(firebaseConfig);

var contactFormDB = firebase.database().ref("contactForm");

document.addEventListener("DOMContentLoaded", function () {
    submitForm();
});

async function submitForm() {
    let name = '';

    do {
        const { value, dismiss } = await Swal.fire({
            title: "Insira seu nome e sobrenome",
            input: "text",
            inputLabel: "",
            inputPlaceholder: "Digite seu nome e sobrenome",
            inputAttributes: {
                autocapitalize: 'off'
            },
            showCancelButton: true,
            cancelButtonText: 'Cancelar',
            cancelButtonColor: "#3085d6",
            confirmButtonText: 'Enviar',
            confirmButtonColor: "#3085d6",
            allowOutsideClick: false,
            allowEscapeKey: false,
            allowEnterKey: false,
            preConfirm: async (inputValue) => {
                if (!inputValue) {
                    Swal.showValidationMessage('Nome e sobrenome é obrigatório. Por favor, insira.');
                }
            }
        });

        if (dismiss === Swal.DismissReason.cancel) {
            Swal.fire({
                title: 'Campo Obrigatório',
                text: 'Nome é obrigatório. Por favor, insira seu nome.',
                icon: 'warning'
            });
        } else {
            name = value;
        }

    } while (!name);

    saveMessages(name);

    Swal.fire({
        title: '',
        text: `Nome inserido: ${name}`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });

    document.getElementById("contactForm").reset();
}

const saveMessages = (name) => {
    var newContactForm = contactFormDB.push();

    newContactForm.set({
        name: name,
    });
};