$(document).ready(function () {
    $('#userStoryForm').validate({
        rules: {
            keywords: {
                required: true
            },
            userType: {
                required: true
            },
            goal: {
                required: true
            },
            reason: {
                required: true
            }
        },
        messages: {
            keywords: {
                required: "Por favor, insira palavras-chave."
            },
            userType: {
                required: "Por favor, insira o tipo de usuário."
            },
            goal: {
                required: "Por favor, insira o objetivo."
            },
            reason: {
                required: "Por favor, insira o motivo."
            }
        },
        errorElement: 'div',
        errorPlacement: function (error, element) {
            error.addClass('invalid-feedback');
            if (element.prop('type') === 'checkbox') {
                error.insertAfter(element.next('label'));
            } else {
                error.insertAfter(element);
            }
        },
        highlight: function (element, errorClass, validClass) {
            $(element).addClass('is-invalid').removeClass('is-valid');
        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).addClass('is-valid').removeClass('is-invalid');
        }
    });
});

function generateStory() {
    if (!$('#userStoryForm').valid()) {
        swal("Campos obrigatórios", "Por favor, preencha todos os campos obrigatórios.", "warning");
        return;
    }

    const keywords = $('#keywords').val().trim();
    const userType = $('#userType').val().trim();
    const goal = $('#goal').val().trim();
    const reason = $('#reason').val().trim();
    const details = $('#details').val().trim();

    const randomOption = (arr) => arr[Math.floor(Math.random() * arr.length)];

    const contexts = [
        `Atualmente, enfrentamos desafios significativos com ${keywords}. A falta de ${goal} tem impactado negativamente nosso trabalho diário, resultando em ${reason}.`,
        `No momento, temos dificuldades consideráveis com ${keywords}. A ausência de ${goal} está afetando nosso desempenho, causando ${reason}.`,
        `Estamos lidando com problemas graves relacionados a ${keywords}. A carência de ${goal} tem causado ${reason}, prejudicando nossas operações diárias.`,
    ];

    const objectives = [
        `O objetivo principal desta história de usuário é implementar uma solução que permita ${goal} de forma eficaz.`,
        `Nossa meta é desenvolver uma solução que facilite ${goal} de maneira eficiente.`,
        `Queremos criar uma solução que torne ${goal} mais acessível e eficiente.`,
    ];

    const securityDetails = [
        `A segurança é uma prioridade máxima. A solução incluirá criptografia de dados sensíveis em trânsito e em repouso, autenticação multifator (MFA) para acesso seguro, e auditoria e logging completos para rastreamento de atividades suspeitas.`,
        `Priorizamos a segurança com criptografia completa dos dados, MFA para maior proteção, e sistemas de auditoria para monitoramento contínuo.`,
        `Garantimos segurança robusta com criptografia avançada, autenticação multifator, e processos de auditoria detalhados.`,
    ];

    const featureDetails = [
        `A interface deve ser intuitiva e responsiva, com uma curva de aprendizado mínima. Deverá suportar múltiplos idiomas e ser acessível em diversos dispositivos.`,
        `A solução deve ser integrada com serviços de terceiros, como ERPs e CRMs, facilitando o fluxo de dados e aumentando a eficiência operacional.`,
        `Deverá ser possível configurar notificações personalizadas, permitindo aos usuários receber alertas sobre eventos importantes relacionados a ${keywords}.`,
    ];

    const acceptanceCriteria = [
        `Critérios de Aceitação:
        - Deve permitir que ${userType} acesse facilmente ${goal}.
        - Notificações em tempo real devem ser configuráveis para ${keywords}.
        - O dashboard deve ser personalizável de acordo com as necessidades de ${userType}.
        - A integração com outras ferramentas deve ser simples e eficiente.
        - Suporte técnico deve estar disponível 24/7.`,

        `Critérios de Aceitação:
        - A solução deve fornecer acesso rápido e seguro a ${goal} para ${userType}.
        - Notificações configuráveis em tempo real para eventos relacionados a ${keywords}.
        - Dashboards personalizáveis que se adaptem às necessidades específicas de ${userType}.
        - Integrações suaves com sistemas existentes para aumentar a produtividade.
        - Suporte técnico contínuo para resolução de problemas.`,
    ];

    const storyTemplate = `
        # História de Usuário

        ## Visão Geral

        **Como um ${userType}, quero ${goal} relacionado a ${keywords} para ${reason}.**

        ### Contexto Atual

        ${randomOption(contexts)} Isso é evidenciado por ${details}, que demonstram a necessidade urgente de uma solução eficaz.

        ### Objetivo do Projeto

        ${randomOption(objectives)} A solução deve ser intuitiva, acessível e escalável, capaz de suportar o crescimento futuro da nossa organização.

        ## Requisitos e Critérios de Aceitação

        ${randomOption(acceptanceCriteria)}

        ## Detalhes Técnicos

        ### Arquitetura do Sistema

        A solução será construída utilizando um stack tecnológico moderno, incluindo:
        - **Frontend:** Aplicação React para fornecer uma interface de usuário dinâmica e responsiva.
        - **Backend:** Serviços RESTful desenvolvidos em Node.js, utilizando Express para gerenciamento de rotas.
        - **Banco de Dados:** MongoDB para um armazenamento de dados flexível e escalável.
        - **Autenticação:** Implementação de OAuth 2.0 para garantir segurança robusta.
        - **CI/CD:** Pipeline de integração contínua utilizando Jenkins e Docker para facilitar deploys automáticos.
        - **Monitoramento:** Ferramentas como New Relic e Grafana para monitorar a performance da aplicação e identificar gargalos.
        - **Integrações:** API Gateway para facilitar a integração com sistemas externos e serviços de terceiros.

        ### Segurança

        ${randomOption(securityDetails)}

        ### Escalabilidade

        A arquitetura será projetada para escalabilidade horizontal, permitindo adicionar mais servidores conforme necessário para lidar com o aumento de carga. Utilizaremos Kubernetes para orquestração de containers, garantindo alta disponibilidade e fácil gerenciamento.

        ## Cenários de Uso

        ### Cenário 1: Acesso a Relatórios Detalhados

        Um administrador precisa acessar relatórios detalhados sobre ${keywords} para gerar insights mensais. A interface deve permitir a extração de dados em diferentes formatos (PDF, Excel) e oferecer visualizações gráficas avançadas. Os relatórios devem incluir filtros customizáveis e opções de drill-down para análise detalhada.

        ### Cenário 2: Notificações em Tempo Real

        Um desenvolvedor utiliza notificações em tempo real para monitorar atualizações no sistema relacionado a ${keywords}. A solução deve integrar com ferramentas como Slack e Microsoft Teams para enviar alertas instantâneos. Notificações configuráveis permitirão ao desenvolvedor escolher os eventos que deseja monitorar.

        ### Cenário 3: Personalização de Dashboard

        Um cliente deseja personalizar seu dashboard para acompanhar métricas específicas de ${keywords}. A interface deve permitir arrastar e soltar widgets, salvando preferências do usuário. O dashboard deve suportar múltiplas visualizações, como gráficos de linha, barras, e mapas de calor.

        ### Cenário 4: Integração com Sistemas Externos

        A solução deve integrar-se facilmente com sistemas externos, como ERPs e CRMs. A integração permitirá que dados sobre ${keywords} sejam sincronizados em tempo real, proporcionando uma visão unificada e atualizada.

        ### Cenário 5: Análise de Dados e IA

        Utilizando inteligência artificial e aprendizado de máquina, a solução deve ser capaz de analisar grandes volumes de dados relacionados a ${keywords}, identificando padrões e fornecendo previsões precisas para suportar a tomada de decisão estratégica.

        ## Análise de Impacto

        ### Eficiência

        Espera-se um aumento de 30% na produtividade devido à automação de tarefas repetitivas e melhoria na acessibilidade das informações. A redução no tempo de acesso aos dados permitirá decisões mais rápidas e informadas.

        ### Satisfação do Usuário

        Pesquisas de satisfação devem mostrar um aumento de 40% na satisfação do usuário devido à facilidade de uso e customização da interface. O feedback contínuo dos usuários será coletado para melhorias incrementais.

        ### ROI (Retorno sobre Investimento)

        Um retorno sobre investimento (ROI) de 150% é projetado no primeiro ano devido à redução de custos operacionais e aumento de eficiência. A implementação de uma solução robusta e escalável garantirá um rápido retorno do investimento inicial.

        ## Planos Futuros

        A plataforma será continuamente aprimorada com novas funcionalidades baseadas no feedback dos usuários e nas tendências do mercado. Foco especial será dado à adoção de tecnologias emergentes como Inteligência Artificial e Aprendizado de Máquina para fornecer análises preditivas e automação avançada. Planejamos explorar o uso de blockchain para garantir a integridade dos dados e melhorar a transparência.

        ## Inovação e Tendências Tecnológicas

        ### Inteligência Artificial e Machine Learning

        A incorporação de IA e ML na solução permitirá:
        - Análise preditiva de tendências baseadas nos dados históricos de ${keywords}.
        - Recomendações automatizadas para otimização de processos.
        - Detecção de anomalias e alertas proativos para evitar problemas.

        ### Blockchain

        O uso de blockchain garantirá:
        - Segurança e integridade dos dados através de registros imutáveis.
        - Transparência nas transações e atividades relacionadas a ${keywords}.
        - Auditoria completa e verificável de todas as interações.

        ### Internet das Coisas (IoT)

        A integração com dispositivos IoT proporcionará:
        - Coleta de dados em tempo real de sensores e dispositivos relacionados a ${keywords}.
        - Monitoramento e controle remoto de ativos e recursos.
        - Melhoria na manutenção preditiva e na gestão de recursos.

        ### Computação em Nuvem

        A solução será hospedada na nuvem, oferecendo:
        - Escalabilidade dinâmica para lidar com picos de demanda.
        - Redução de custos de infraestrutura com modelos de pagamento conforme o uso.
        - Acesso global e disponibilidade contínua.

        ## Conclusão

        A história de usuário detalhada acima é fundamental para nossa estratégia de longo prazo para melhorar ${keywords}. Com a sua implementação, esperamos ver melhorias imediatas na produtividade e satisfação dos usuários. A solução proposta não só atenderá às necessidades atuais, mas também proporcionará uma base sólida para inovações futuras.

        ${details ? `**Notas Adicionais:**
        ${details}` : ''}
    `;

    const story = storyTemplate.trim();
    document.getElementById('userStory').value = story;
    document.getElementById('suggestion').innerText = `História gerada com base nas palavras-chave: "${keywords}"`;

    $('#keywords').val('');
    $('#userType').val('');
    $('#goal').val('');
    $('#reason').val('');
    $('#details').val('');
}

function clearStory() {
    document.getElementById('userStory').value = '';
    document.getElementById('suggestion').innerText = '';
}

function toggleTheme() {
    document.body.classList.toggle('dark-theme');
    const themeIcon = document.getElementById('theme-icon');
    themeIcon.classList.toggle('fa-sun');
    themeIcon.classList.toggle('fa-moon');
}

document.getElementById('logoPage').addEventListener('click', function () {
    location.href = 'https://ghmdevelops.github.io/sheetFrenzybdd/';
});

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById('theme-icon').click();
});

function copyStory() {
    const userStory = document.getElementById('userStory');
    userStory.select();
    userStory.setSelectionRange(0, 99999); // Para dispositivos móveis

    document.execCommand('copy');

    swal("História Copiada", "A história de usuário foi copiada com sucesso!", "success");
}

console.log("\n%cAtenção Espere! %c\n\n\nEste é um recurso de navegador voltado para desenvolvedores. Se alguém disse para você copiar e colar algo aqui para ativar um recurso ou 'invadir' a maquina de outra pessoa, isso é uma fraude e você dará a ele acesso à sua maquina.\n\nConsulte ataques https://en.wikipedia.org/wiki/Self-XSS para obter mais informações.", "color: red; font-size: 46px;", "font-size: 16px;");
