document.addEventListener('DOMContentLoaded', () => {
    const editorElement = document.getElementById('gherkin-editor');
    const editor = CodeMirror.fromTextArea(editorElement, {
        lineNumbers: true,
        mode: 'gherkin',
        theme: 'default'
    });

    const contextualSuggestions = {
        'Funcionalidade:': ['Como um [tipo de usuário]', 'Eu quero [ação desejada]', 'Para [benefício/resultado esperado]'],
        'Cenário:': ['Dado que [contexto inicial]', 'Quando [ação tomada]', 'Então [resultado esperado]'],
        'Dado': ['que [contexto]'],
        'Quando': ['[ação tomada]'],
        'Então': ['[resultado esperado]'],
        'E': ['[ação ou resultado adicional]'],
        'Mas': ['[ação ou resultado contrário]']
    };

    const keywords = ['Funcionalidade:', 'Cenário:', 'Dado', 'Quando', 'Então', 'E', 'Mas'];
    const autocompleteList = document.getElementById('autocomplete-list');

    editor.on('inputRead', () => {
        const cursorPos = editor.getCursor();
        const token = editor.getTokenAt(cursorPos);
        const lastWord = token.string.trim();
        const currentLine = editor.getLine(cursorPos.line).trim();

        autocompleteList.innerHTML = '';
        if (lastWord) {
            let suggestions = [];

            const wordsInLine = currentLine.split(' ');
            const lastKeyword = wordsInLine[wordsInLine.length - 2];

            if (contextualSuggestions[lastKeyword]) {
                suggestions = contextualSuggestions[lastKeyword];
            } else {
                suggestions = keywords.filter(keyword => keyword.toLowerCase().startsWith(lastWord.toLowerCase()));
            }

            suggestions.forEach(suggestion => {
                const suggestionItem = document.createElement('div');
                suggestionItem.className = 'autocomplete-suggestion';
                suggestionItem.textContent = suggestion;
                suggestionItem.addEventListener('click', () => {
                    const newText = editor.getRange({ line: cursorPos.line, ch: token.start }, cursorPos) + suggestion + editor.getRange(cursorPos, { line: cursorPos.line, ch: token.end });
                    editor.replaceRange(newText, { line: cursorPos.line, ch: token.start }, { line: cursorPos.line, ch: token.end });
                    autocompleteList.innerHTML = '';
                });
                autocompleteList.appendChild(suggestionItem);
            });
        }
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.autocomplete-container')) {
            autocompleteList.innerHTML = '';
        }
    });

    const skeletons = {
        'funcionalidade': `Funcionalidade: [Título da funcionalidade]\n  Como um [tipo de usuário]\n  Eu quero [ação desejada]\n  Para [benefício/resultado esperado]\n`,
        'cenário': `Cenário: [Título do cenário]\n  Dado que [contexto inicial]\n  Quando [ação tomada]\n  Então [resultado esperado]\n`,
        'cenário com background': `Funcionalidade: [Título da funcionalidade]\n\nContexto:\n  Dado [contexto inicial]\n\nCenário: [Título do cenário]\n  Quando [ação tomada]\n  Então [resultado esperado]\n`,
        'esquema de cenário': `Funcionalidade: [Título da funcionalidade]\n\nEsquema do Cenário: [Título do cenário]\n  Dado [contexto inicial]\n  Quando [ação tomada]\n  Então [resultado esperado]\n\nExemplos:\n  | dado1 | dado2 |\n  | valor1 | valor2 |\n`,
        'cenário de regras de negócio': `Funcionalidade: [Título da funcionalidade]\n\nCenário: [Título do cenário]\n  Dado que [regra de negócio aplicada]\n  Quando [ação tomada]\n  Então [resultado de acordo com a regra]\n`,
        'cenário de login': `Cenário: Login\n  Dado que o usuário está na página de login\n  Quando ele insere credenciais válidas\n  Então ele deve ser redirecionado para a página inicial\n`,
        'cenário de erro': `Cenário: Exibir mensagem de erro\n  Dado que o usuário está na página de login\n  Quando ele insere credenciais inválidas\n  Então ele deve ver uma mensagem de erro\n`,
        'cenário de busca': `Cenário: Buscar produtos\n  Dado que o usuário está na página inicial\n  Quando ele busca por "produto"\n  Então ele deve ver uma lista de produtos correspondentes\n`,
        'cenário de adicionar ao carrinho': `Cenário: Adicionar ao carrinho\n  Dado que o usuário está na página de produtos\n  Quando ele adiciona um produto ao carrinho\n  Então o produto deve aparecer no carrinho\n`,
        'cenário de checkout': `Cenário: Checkout\n  Dado que o usuário tem itens no carrinho\n  Quando ele realiza o checkout\n  Então ele deve ver uma confirmação de pedido\n`,
        'cenário de registro': `Cenário: Registro de novo usuário\n  Dado que o usuário está na página de registro\n  Quando ele insere informações válidas\n  Então ele deve ser redirecionado para a página inicial\n`,
        'cenário de logout': `Cenário: Logout\n  Dado que o usuário está logado\n  Quando ele clica no botão de logout\n  Então ele deve ser redirecionado para a página de login\n`
    };

    const styleSelector = document.getElementById('style-selector');
    styleSelector.addEventListener('change', () => {
        const selectedStyle = styleSelector.value;
        const skeleton = skeletons[selectedStyle] || '';
        editor.setValue(skeleton);
    });

    document.getElementById('format-button').addEventListener('click', () => {
        formatOrValidateGherkin('format');
    });
    document.getElementById('validate-button').addEventListener('click', () => {
        formatOrValidateGherkin('validate');
    });

    document.getElementById('export-button').addEventListener('click', () => {
        const gherkinText = editor.getValue();
        const blob = new Blob([gherkinText], { type: 'text/plain' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = 'scenario.feature';
        link.click();
    });

    document.getElementById('import-button').addEventListener('click', () => {
        document.getElementById('import-file').click();
    });

    document.getElementById('import-file').addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                editor.setValue(reader.result);
            };
            reader.readAsText(file);
        }
    });

    function formatOrValidateGherkin(action) {
        const gherkinText = editor.getValue().trim();
        const keywords = ['Funcionalidade:', 'Cenário:', 'Dado', 'Quando', 'Então', 'E', 'Mas'];
        const lines = gherkinText.split('\n');
        let isValid = true;
        let formattedText = '';

        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (action === 'validate' && trimmedLine && !keywords.some(keyword => trimmedLine.startsWith(keyword))) {
                isValid = false;
            }
            formattedText += trimmedLine + '\n';
        });

        const output = document.getElementById('output');
        if (action === 'format') {
            output.textContent = formattedText.trim();
        } else if (action === 'validate') {
            output.textContent = isValid ? 'A sintaxe do Gherkin é válida.' : 'Sintaxe do Gherkin inválida. Por favor, verifique seus cenários.';
        }
    }

    document.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            formatOrValidateGherkin('validate');
        } else if (event.ctrlKey && event.key === 'f') {
            event.preventDefault();
            formatOrValidateGherkin('format');
        }
    });
});

const btnGherkin = document.getElementById('logout-button');
btnGherkin.addEventListener('click', e => {
    location.href = 'https://ghmdevelops.github.io/sheetFrenzybdd/';
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('theme-button').click();
});

console.log("\n%cAtenção Espere! %c\n\n\nEste é um recurso de navegador voltado para desenvolvedores. Se alguém disse para você copiar e colar algo aqui para ativar um recurso ou 'invadir' a maquina de outra pessoa, isso é uma fraude e você dará a ele acesso à sua maquina.\n\nConsulte ataques https://en.wikipedia.org/wiki/Self-XSS para obter mais informações.", "color: red; font-size: 46px;", "font-size: 16px;");
const csrfToken = document.querySelector('meta[name="csrf-token"]').content;