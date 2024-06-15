import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyBQylGym3PS7qzAql7s_UKMkHODFnAdkhc",
    authDomain: "sheetfrenzyblog.firebaseapp.com",
    projectId: "sheetfrenzyblog",
    storageBucket: "sheetfrenzyblog.appspot.com",
    messagingSenderId: "910791258175",
    appId: "1:910791258175:web:9a906f87eabce194c4088a"
};

// Inicializa o Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Função para carregar entradas do Firestore
async function loadEntries() {
    console.log("Carregando entradas...");
    try {
        const querySnapshot = await getDocs(collection(db, "entries"));
        querySnapshot.forEach((doc) => {
            const entry = doc.data();
            console.log("Entrada carregada: ", entry);
            displayEntry(entry.title, entry.subject);
        });
    } catch (error) {
        console.error("Erro ao carregar entradas: ", error);
    }
}

// Função para exibir uma entrada na página
function displayEntry(title, subject) {
    const entryDiv = document.createElement('div');
    entryDiv.className = 'entry';

    const entryTitle = document.createElement('h3');
    entryTitle.textContent = title;
    entryDiv.appendChild(entryTitle);

    const entrySubject = document.createElement('p');
    entrySubject.textContent = subject;
    entryDiv.appendChild(entrySubject);

    document.getElementById('entries').appendChild(entryDiv);
}

// Evento de submissão do formulário
document.getElementById('entryForm').addEventListener('submit', async function (event) {
    event.preventDefault();

    const title = document.getElementById('title').value;
    const subject = document.getElementById('subject').value;

    if (title && subject) {
        try {
            console.log("Adicionando entrada...", { title, subject });
            // Adiciona a entrada ao Firestore
            const docRef = await addDoc(collection(db, "entries"), {
                title: title,
                subject: subject
            });
            console.log("Entrada adicionada com sucesso com ID: ", docRef.id);

            // Exibe a entrada na página
            displayEntry(title, subject);

            // Reseta o formulário
            document.getElementById('entryForm').reset();
        } catch (e) {
            console.error("Erro ao adicionar documento: ", e);
        }
    } else {
        alert('Por favor, preencha ambos os campos.');
    }
});

// Carrega as entradas ao carregar a página
window.onload = loadEntries;
