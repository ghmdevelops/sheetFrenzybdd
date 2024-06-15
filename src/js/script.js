var firebaseConfig = {
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

const imageContainer = document.getElementById('imageContainer');

let currentFolder = null;

async function displayImage(url, fileName, imageRef) {
    const container = document.createElement('div');

    const iconElement = document.createElement('i');
    iconElement.classList.add('fa-regular', 'fa-file-excel');

    const metadata = await imageRef.getMetadata();

    const textElement = document.createElement('p');
    textElement.textContent = `${fileName} - ${getCurrentDateTime(metadata.timeCreated)}`;

    iconElement.addEventListener('click', function () {
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = fileName;
        downloadLink.style.display = 'none';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    });

    const deleteButton = document.createElement('button');
    //deleteButton.textContent = '';
    deleteButton.classList.add('fa', 'fa-trash-can', 'btn', 'btn-danger', 'delete-button');
    deleteButton.setAttribute('data-url', url);
    deleteButton.addEventListener('click', async function () {
        try {
            await imageRef.delete();
            container.remove();
            const Toast = Swal.mixin({
                toast: true,
                position: "top-end",
                showConfirmButton: false,
                timer: 2000,
                timerProgressBar: true,
                didOpen: (toast) => {
                    toast.onmouseenter = Swal.stopTimer;
                    toast.onmouseleave = Swal.resumeTimer;
                }
            });
            Toast.fire({
                icon: "success",
                title: "Arquivo excluído!"
            });
            setTimeout(() => {
                location.reload();
            }, 2000);
        } catch (error) {
            console.log('Error deleting image: ' + error);
        }
    });

    container.classList.add('container');
    container.style.marginBottom = '20px';

    container.appendChild(iconElement);
    container.appendChild(textElement);
    container.appendChild(deleteButton);
    imageContainer.appendChild(container);
}


function getCurrentDateTime(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString();
}

async function listFolders() {
    const storageRef = firebase.storage().ref();
    try {
        const result = await storageRef.listAll();
        const folders = result.prefixes.map(prefix => prefix.name);
        return folders;
    } catch (error) {
        console.log('Error listing folders: ' + error);
        return [];
    }
}

async function listAndDisplayFiles(folderName) {
    currentFolder = folderName;
    const storageRef = firebase.storage().ref(folderName);
    const imageContainer = document.getElementById('imageContainer');

    imageContainer.innerHTML = '';

    try {
        const result = await storageRef.listAll();
        for (const itemRef of result.items) {
            const url = await itemRef.getDownloadURL();
            const fileName = itemRef.name;
            displayImage(url, fileName, itemRef);
        }
    } catch (error) {
        console.log('Error loading files: ' + error);
    }
}

async function addFileToFolder(folderName, file) {
    const storageRef = firebase.storage().ref(`${folderName}/${file.name}`);
    const task = storageRef.put(file);

    task.on(
        'state_changed',
        function progress(progress) {
            console.log((progress.bytesTransferred / progress.totalBytes) * 100);
        },
        function error(err) {
            console.log('There was an error: ' + err);
        },
        async function completed() {
            const url = await storageRef.getDownloadURL();
            displayImage(url, file.name, storageRef);
        }
    );
}

async function loadAndDisplayFolders() {
    const folders = await listFolders();
    const folderContainer = document.getElementById('folderContainer');

    folders.forEach(folderName => {
        const folderButton = document.createElement('button');
        folderButton.textContent = folderName;
        folderButton.classList.add('btn', 'btn-primary', 'custom-button-ad', 'mt-2');

        folderButton.addEventListener('click', async function () {
            document.querySelectorAll('.custom-button-ad').forEach(button => {
                button.classList.remove('button-selected');
            });

            folderButton.classList.add('button-selected');
            await listAndDisplayFiles(folderName);
        });

        folderContainer.appendChild(folderButton);
    });
}

const newFolderButton = document.getElementById('newFolderButton');
newFolderButton.addEventListener('click', createNewFolder);

function createNewFolder() {
    const folderName = prompt("Digite o nome da nova pasta:");
    const folderNameUpperCase = folderName.toUpperCase();

    if (folderName) {
        isFolderExists(folderNameUpperCase).then((exists) => {
            if (!exists) {
                createFolderInStorage(folderNameUpperCase);
                const Toast = Swal.mixin({
                    toast: true,
                    position: "top-end",
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.onmouseenter = Swal.stopTimer;
                        toast.onmouseleave = Swal.resumeTimer;
                    }
                });
                Toast.fire({
                    icon: "success",
                    title: "Criado com sucesso!"
                });
                setTimeout(() => {
                    location.reload();
                }, 2000);
            } else {
                alert("Essa pasta já existe. Escolha outro nome.");
            }
        }).catch(error => {
            console.log('Erro ao verificar a existência da pasta: ' + error);
        });
    }
}

async function isFolderExists(folderName) {
    const storageRef = firebase.storage().ref();
    try {
        const result = await storageRef.child(folderName + '/').listAll();
        return result.items.length > 0;
    } catch (error) {
        return false;
    }
}

async function createFolderInStorage(folderName) {
    const storageRef = firebase.storage().ref();
    try {
        await storageRef.child(folderName + '/.placeholder').put(new Uint8Array(0));
        loadAndDisplayFolders();
    } catch (error) {
        console.log('Erro ao criar pasta: ' + error);
    }
}

window.addEventListener('load', function () {
    loadAndDisplayFolders();
    loadAndDisplayImages();
});

const btn = document.querySelector('input[type="file"]');
btn.addEventListener('change', e => {
    const file = e.target.files[0];
    if (currentFolder) {
        const storageRef = firebase.storage().ref(currentFolder);
        const final = storageRef.child(file.name);
        const task = final.put(file);

        task.on(
            'state_changed',
            function progress(progress) {
                console.log((progress.bytesTransferred / progress.totalBytes) * 100);
            },
            function error(err) {
                console.log('There was an error: ' + err);
            },
            async function completed() {
                const url = await final.getDownloadURL();
                displayImage(url, file.name, final);
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        );
    } else {
        console.log('Nenhuma pasta selecionada.');
    }
});

async function loadAndDisplayImages() {
    const storageRef = firebase.storage().ref('images');
    try {
        const result = await storageRef.listAll();
        for (const imageRef of result.items) {
            const url = await imageRef.getDownloadURL();
            const fileName = imageRef.name;
            displayImage(url, fileName, imageRef);
        }
    } catch (error) {
        console.log('Error loading images: ' + error);
    }
}

window.addEventListener('load', loadAndDisplayImages);


emailjs.init("GBmnGAFHBTlNx_xyh");

document.getElementById('contato-form').addEventListener('submit', function (event) {
    event.preventDefault();

    const nome = document.getElementById('nome').value;
    const email = document.getElementById('email').value;
    const celular = document.getElementById('celular').value;
    const assunto = document.getElementById('assunto').value;
    const mensagem = document.getElementById('mensagem').value;

    emailjs.send("service_g6su1uu", "template_om9jd5t", {
        nome: nome,
        email: email,
        celular: celular,
        assunto: assunto,
        mensagem: mensagem
    }).then(function (response) {
        const Toast = Swal.mixin({
            toast: true,
            position: "top-end",
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.onmouseenter = Swal.stopTimer;
                toast.onmouseleave = Swal.resumeTimer;
            }
        });
        Toast.fire({
            icon: "success",
            title: "Email enviado com sucesso!"
        });
        setTimeout(() => {
            window.location.reload();
        }, 2100);
    }).catch(function (error) {
        alert('Ocorreu um erro ao enviar o email. Por favor, tente novamente.');
    });
});

$(document).ready(function () {
    $("#celular").inputmask("(99) 99999-9999");
});

$("form").submit(function (event) {
    const celular = $("#celular").val();
    if (!celular.match(/^\(\d{2}\)\s\d{5}-\d{4}$/)) {
        alert("Número de celular inválido. Por favor, insira um número de celular válido.");
        event.preventDefault();
    }
});

$(document).ready(function () {
    $('#date-range-picker').datepicker({
        format: 'dd/mm/yyyy',
        todayHighlight: true,
    });
});

$(document).ready(function () {
    $('#date-range-picker-vencimento').datepicker({
        format: 'dd/mm/yyyy',
        todayHighlight: true,
    });
});

console.log("\n%cAtenção Espere! %c\n\n\nEste é um recurso de navegador voltado para desenvolvedores. Se alguém disse para você copiar e colar algo aqui para ativar um recurso ou 'invadir' a maquina de outra pessoa, isso é uma fraude e você dará a ele acesso à sua maquina.\n\nConsulte ataques https://en.wikipedia.org/wiki/Self-XSS para obter mais informações.", "color: red; font-size: 46px;", "font-size: 16px;");
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;