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
    const selectedSections = $('input[name="sections"]:checked').map(function () {
        return this.value;
    }).get();

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

    const scenarios = [
        `### Cenário 1: Acesso a Relatórios Detalhados
        Um administrador precisa acessar relatórios detalhados sobre ${keywords} para gerar insights mensais. A interface deve permitir a extração de dados em diferentes formatos (PDF, Excel) e oferecer visualizações gráficas avançadas. Os relatórios devem incluir filtros customizáveis e opções de drill-down para análise detalhada.`,

        `### Cenário 2: Notificações em Tempo Real
        Um desenvolvedor utiliza notificações em tempo real para monitorar atualizações no sistema relacionado a ${keywords}. A solução deve integrar com ferramentas como Slack e Microsoft Teams para enviar alertas instantâneos. Notificações configuráveis permitirão ao desenvolvedor escolher os eventos que deseja monitorar.`,

        `### Cenário 3: Personalização de Dashboard
        Um cliente deseja personalizar seu dashboard para acompanhar métricas específicas de ${keywords}. A interface deve permitir arrastar e soltar widgets, salvando preferências do usuário. O dashboard deve suportar múltiplas visualizações, como gráficos de linha, barras, e mapas de calor.`,

        `### Cenário 4: Integração com Sistemas Externos
        A solução deve integrar-se facilmente com sistemas externos, como ERPs e CRMs. A integração permitirá que dados sobre ${keywords} sejam sincronizados em tempo real, proporcionando uma visão unificada e atualizada.`,

        `### Cenário 5: Análise de Dados e IA
        Utilizando inteligência artificial e aprendizado de máquina, a solução deve ser capaz de analisar grandes volumes de dados relacionados a ${keywords}, identificando padrões e fornecendo previsões precisas para suportar a tomada de decisão estratégica.`,
    ];

    const impacts = [
        `### Eficiência
        Espera-se um aumento de 30% na produtividade devido à automação de tarefas repetitivas e melhoria na acessibilidade das informações. A redução no tempo de acesso aos dados permitirá decisões mais rápidas e informadas.`,

        `### Satisfação do Usuário
        Pesquisas de satisfação devem mostrar um aumento de 40% na satisfação do usuário devido à facilidade de uso e customização da interface. O feedback contínuo dos usuários será coletado para melhorias incrementais.`,

        `### ROI (Retorno sobre Investimento)
        Um retorno sobre investimento (ROI) de 150% é projetado no primeiro ano devido à redução de custos operacionais e aumento de eficiência. A implementação de uma solução robusta e escalável garantirá um rápido retorno do investimento inicial.`,
    ];

    const futurePlans = [
        `A plataforma será continuamente aprimorada com novas funcionalidades baseadas no feedback dos usuários e nas tendências do mercado. Foco especial será dado à adoção de tecnologias emergentes como Inteligência Artificial e Aprendizado de Máquina para fornecer análises preditivas e automação avançada. Planejamos explorar o uso de blockchain para garantir a integridade dos dados e melhorar a transparência.`,
    ];

    const innovations = [
        `### Inteligência Artificial e Machine Learning
        A incorporação de IA e ML na solução permitirá:
        - Análise preditiva de tendências baseadas nos dados históricos de ${keywords}.
        - Recomendações automatizadas para otimização de processos.
        - Detecção de anomalias e alertas proativos para evitar problemas.`,

        `### Blockchain
        O uso de blockchain garantirá:
        - Segurança e integridade dos dados através de registros imutáveis.
        - Transparência nas transações e atividades relacionadas a ${keywords}.
        - Auditoria completa e verificável de todas as interações.`,

        `### Internet das Coisas (IoT)
        A integração com dispositivos IoT proporcionará:
        - Coleta de dados em tempo real de sensores e dispositivos relacionados a ${keywords}.
        - Monitoramento e controle remoto de ativos e recursos.
        - Melhoria na manutenção preditiva e na gestão de recursos.`,

        `### Computação em Nuvem
        A solução será hospedada na nuvem, oferecendo:
        - Escalabilidade dinâmica para lidar com picos de demanda.
        - Redução de custos de infraestrutura com modelos de pagamento conforme o uso.
        - Acesso global e disponibilidade contínua.`,
    ];

    const risks = [
        `### Riscos e Mitigações
        - **Risco 1:** Potencial atraso no desenvolvimento devido a dependências externas.
          **Mitigação:** Estabelecer um plano de contingência e monitorar o progresso regularmente.
        - **Risco 2:** Problemas de segurança durante a implementação.
          **Mitigação:** Realizar auditorias de segurança frequentes e seguir as melhores práticas de segurança.
        - **Risco 3:** Resistência dos usuários à mudança.
          **Mitigação:** Conduzir treinamentos e sessões de familiarização para os usuários finais.`,

        `### Riscos e Mitigações
        - **Risco 1:** Dificuldades na integração com sistemas legados.
          **Mitigação:** Planejar fases de integração com testes rigorosos.
        - **Risco 2:** Sobrecarga de servidores devido ao aumento de tráfego.
          **Mitigação:** Implementar escalabilidade automática e monitoramento contínuo.
        - **Risco 3:** Falhas na comunicação entre equipes.
          **Mitigação:** Estabelecer canais de comunicação claros e frequentes, como reuniões semanais.`,
    ];

    const dependencies = [
        `### Dependências
        - **Dependência 1:** Integração com a API do sistema ERP existente.
        - **Dependência 2:** Colaboração com a equipe de segurança para implementar autenticação multifator.
        - **Dependência 3:** Aprovação do orçamento pela equipe de finanças para aquisição de novas ferramentas.`,

        `### Dependências
        - **Dependência 1:** Aguardando entrega de componentes do fornecedor externo.
        - **Dependência 2:** Coordenação com a equipe de TI para configuração de infraestrutura.
        - **Dependência 3:** Obtenção de licenças de software necessárias para a implementação.`,
    ];

    const nonFunctionalRequirements = [
        `### Requisitos Não Funcionais
        - **Desempenho:** A aplicação deve suportar até 1000 usuários simultâneos sem degradação de desempenho.
        - **Segurança:** Dados sensíveis devem ser criptografados em repouso e em trânsito.
        - **Usabilidade:** A interface deve ser intuitiva e fácil de usar, com acessibilidade garantida para pessoas com deficiências.`,

        `### Requisitos Não Funcionais
        - **Disponibilidade:** O sistema deve estar disponível 99,9% do tempo.
        - **Manutenibilidade:** O código deve ser modular e documentado para facilitar a manutenção.
        - **Escalabilidade:** A arquitetura deve permitir fácil escalabilidade horizontal.`,
    ];

    const userInteractions = [
        `### Interação com o Usuário
        - **Fluxo 1:** O usuário deve poder realizar login utilizando autenticação multifator.
        - **Fluxo 2:** O painel principal deve exibir notificações personalizadas e informações em tempo real.
        - **Fluxo 3:** O usuário deve poder personalizar o dashboard arrastando e soltando widgets.`,

        `### Interação com o Usuário
        - **Fluxo 1:** O sistema deve guiar o usuário através de um assistente de configuração inicial.
        - **Fluxo 2:** O usuário deve poder configurar alertas e notificações via SMS e email.
        - **Fluxo 3:** O histórico de atividades do usuário deve ser acessível e exportável para formatos como CSV e PDF.`,
    ];

    let storyTemplate = `
    # História de Usuário

    ## Visão Geral

    **Como um ${userType}, quero ${goal} relacionado a ${keywords} para ${reason}.**

    ### Descrição do Usuário

    O ${userType} é geralmente uma pessoa que trabalha com ${randomOption(contexts)}. Eles enfrentam dificuldades diárias relacionadas a ${keywords}, o que afeta sua produtividade e eficiência. O ${userType} busca soluções que possam simplificar suas tarefas e melhorar seus resultados.

    ### Contexto do Problema

    A falta de ${goal} tem causado problemas significativos para os ${userType}. Especificamente, a ausência de uma solução adequada leva a ${reason}. Este problema é evidente em situações como ${details}. A necessidade de ${goal} é crítica para resolver esses desafios e melhorar a experiência dos usuários.

    ### Necessidade do Negócio

    - **Alinhamento Estratégico:** A implementação de ${goal} está alinhada com os objetivos estratégicos da organização, visando melhorar a eficiência operacional e a satisfação do cliente.
    - **Compliance e Regulamentação:** Atender aos requisitos de compliance e regulamentação que exigem ${goal}.
    - **Sustentabilidade:** Promover práticas sustentáveis ao adotar tecnologias que otimizam recursos e reduzem desperdícios.

    ### Objetivos Específicos

    - Fornecer uma solução que permita ${goal} de forma intuitiva e eficiente.
    - Reduzir os problemas associados a ${keywords} em pelo menos 30%.
    - Melhorar a satisfação dos usuários com o sistema através de funcionalidades aprimoradas.
    - Garantir que a solução seja escalável e possa atender a futuras demandas.

    ### Benefícios Esperados

    - **Produtividade Melhorada:** Aumento na produtividade dos ${userType} através da automação e simplificação de tarefas.
    - **Redução de Custos:** Diminuição de custos operacionais devido à redução de erros e retrabalho.
    - **Satisfação do Usuário:** Melhoria na satisfação dos usuários finais, resultando em maior adesão ao sistema.
    - **Vantagem Competitiva:** Ganho de vantagem competitiva ao oferecer uma solução inovadora e eficaz.

    ### Critérios de Sucesso

    - A solução deve ser adotada por pelo menos 80% dos ${userType} dentro dos primeiros três meses após o lançamento.
    - A funcionalidade deve ser integrada sem problemas com os sistemas existentes, garantindo uma transição suave.
    - Feedback positivo dos usuários deve aumentar em 40% após a implementação da solução.
    - A solução deve proporcionar uma redução de 30% nos problemas relacionados a ${keywords}.

    ### Impacto no Negócio

    - **Melhoria na Eficiência:** Aumento da eficiência operacional através da implementação de ${goal}.
    - **Custo-Benefício:** Redução significativa nos custos operacionais e aumento no retorno sobre investimento (ROI).
    - **Engajamento do Usuário:** Aumento do engajamento e adesão dos usuários ao sistema, resultando em melhorias contínuas.
    - **Sustentabilidade a Longo Prazo:** Desenvolvimento de uma solução escalável e sustentável que suporte o crescimento futuro da organização.

    ### Análise de Stakeholders

    - **Usuários Finais:** Necessitam de uma solução que melhore a eficiência e a experiência de uso.
    - **Equipe de TI:** Precisa de uma solução que seja fácil de implementar, integrar e manter.
    - **Gerentes de Projeto:** Buscam garantir que a solução seja entregue no prazo, dentro do orçamento e atenda aos requisitos especificados.
    - **Executivos:** Estão interessados nos benefícios estratégicos e financeiros da solução.

    ### Planos de Comunicação

    - **Lançamento:** Plano de comunicação abrangente para informar todos os usuários sobre as novas funcionalidades e benefícios.
    - **Treinamento:** Sessões de treinamento para garantir que todos os usuários estejam aptos a utilizar a nova solução de forma eficaz.
    - **Feedback Contínuo:** Mecanismos para coleta de feedback contínuo, permitindo ajustes e melhorias baseadas nas necessidades dos usuários.

    ### Planos de Adoção

    - **Piloto Inicial:** Lançamento de um projeto piloto para um grupo seleto de usuários antes do lançamento completo.
    - **Fases de Implementação:** Implementação gradual da solução, com fases claramente definidas para garantir uma transição suave.
    - **Suporte Contínuo:** Disponibilização de suporte técnico contínuo para resolver quaisquer problemas que possam surgir após a implementação.

    ### Gestão de Mudanças

    - **Análise de Impacto:** Avaliação detalhada dos impactos da nova solução em processos existentes e estrutura organizacional.
    - **Engajamento dos Stakeholders:** Envolvimento ativo dos principais stakeholders durante todo o processo de implementação para garantir alinhamento e apoio.
    - **Comunicação Transparente:** Manter uma comunicação clara e aberta com todos os envolvidos para minimizar resistências e garantir uma adoção bem-sucedida.

    ### Métricas de Sucesso

    - **Adoção do Usuário:** Taxa de adoção e uso da nova funcionalidade entre os ${userType}.
    - **Redução de Erros:** Diminuição no número de erros e retrabalhos relacionados a ${keywords}.
    - **Satisfação do Cliente:** Níveis de satisfação dos usuários medidos através de pesquisas pós-implementação.
    - **ROI:** Retorno sobre o investimento alcançado com a implementação da nova solução.

    `;

    if (selectedSections.includes('context')) {
        storyTemplate += `
            ### Contexto Atual
            ${randomOption(contexts)}. Atualmente, enfrentamos desafios substanciais relacionados a ${keywords}. Esses desafios incluem ${details}, que resultam em ${reason}. A falta de uma solução adequada leva a diversas consequências negativas, como:
            - **Redução da Produtividade:** Os usuários gastam mais tempo e esforço para realizar tarefas que poderiam ser automatizadas ou simplificadas.
            - **Aumento de Erros:** A ausência de ${goal} aumenta a probabilidade de erros humanos, o que afeta a qualidade do trabalho e a satisfação dos usuários.
            - **Frustração dos Usuários:** A ineficiência no processo atual gera frustração e desmotivação entre os ${userType}, impactando negativamente o moral e a retenção.
            Esses problemas não apenas afetam a produtividade e a eficiência dos usuários, mas também comprometem a qualidade do trabalho e a satisfação geral. Portanto, a implementação de ${goal} é essencial para mitigar esses desafios e melhorar significativamente a experiência do usuário.
        `;
    }

    if (selectedSections.includes('objective')) {
        storyTemplate += `
            ### Objetivo do Projeto
            ${randomOption(objectives)} A solução deve ser intuitiva, acessível e escalável, capaz de suportar o crescimento futuro da nossa organização.
        `;
    }

    if (selectedSections.includes('acceptance')) {
        storyTemplate += `
            ## Requisitos e Critérios de Aceitação
            ${randomOption(acceptanceCriteria)}
        `;
    }

    if (selectedSections.includes('techDetails')) {
        storyTemplate += `
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
        `;
    }

    if (selectedSections.includes('scenarios')) {
        storyTemplate += `
            ## Cenários de Uso
            ${randomOption(scenarios)}
        `;
    }

    if (selectedSections.includes('impact')) {
        storyTemplate += `
            ## Análise de Impacto
            ${randomOption(impacts)}
        `;
    }

    if (selectedSections.includes('futurePlans')) {
        storyTemplate += `
            ## Planos Futuros
            ${randomOption(futurePlans)}
        `;
    }

    if (selectedSections.includes('innovation')) {
        storyTemplate += `
            ## Inovação e Tendências Tecnológicas
            ${randomOption(innovations)}
        `;
    }

    if (selectedSections.includes('risk')) {
        storyTemplate += `
            ## Riscos e Mitigações
            ${randomOption(risks)}
        `;
    }

    if (selectedSections.includes('dependency')) {
        storyTemplate += `
            ## Dependências
            ${randomOption(dependencies)}
        `;
    }

    if (selectedSections.includes('nonFunctional')) {
        storyTemplate += `
            ## Requisitos Não Funcionais
            ${randomOption(nonFunctionalRequirements)}
        `;
    }

    if (selectedSections.includes('userInteraction')) {
        storyTemplate += `
            ## Interação com o Usuário
            ${randomOption(userInteractions)}
        `;
    }

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

function generateAlternativeStories() {
    if (!$('#userStoryForm').valid()) {
        swal("Campos obrigatórios", "Por favor, preencha todos os campos obrigatórios.", "warning");
        return;
    }

    const keywords = $('#keywords').val().trim();
    const userType = $('#userType').val().trim();
    const goal = $('#goal').val().trim();
    const reason = $('#reason').val().trim();
    const details = $('#details').val().trim();

    // Função para gerar uma história alternativa com pequenas variações
    const generateAlternativeStory = () => {
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

        return `
        # História de Usuário

        ## Visão Geral

        **Como um ${userType}, quero ${goal} relacionado a ${keywords} para ${reason}.**

        ### Descrição do Usuário

        O ${userType} é geralmente uma pessoa que trabalha com ${randomOption(contexts)}. Eles enfrentam dificuldades diárias relacionadas a ${keywords}, o que afeta sua produtividade e eficiência. O ${userType} busca soluções que possam simplificar suas tarefas e melhorar seus resultados.

        ### Contexto do Problema

        A falta de ${goal} tem causado problemas significativos para os ${userType}. Especificamente, a ausência de uma solução adequada leva a ${reason}. Este problema é evidente em situações como ${details}. A necessidade de ${goal} é crítica para resolver esses desafios e melhorar a experiência dos usuários.

        ### Necessidade do Negócio

        - **Alinhamento Estratégico:** A implementação de ${goal} está alinhada com os objetivos estratégicos da organização, visando melhorar a eficiência operacional e a satisfação do cliente.
        - **Compliance e Regulamentação:** Atender aos requisitos de compliance e regulamentação que exigem ${goal}.
        - **Sustentabilidade:** Promover práticas sustentáveis ao adotar tecnologias que otimizam recursos e reduzem desperdícios.

        ### Objetivos Específicos

        - Fornecer uma solução que permita ${goal} de forma intuitiva e eficiente.
        - Reduzir os problemas associados a ${keywords} em pelo menos 30%.
        - Melhorar a satisfação dos usuários com o sistema através de funcionalidades aprimoradas.
        - Garantir que a solução seja escalável e possa atender a futuras demandas.

        ### Benefícios Esperados

        - **Produtividade Melhorada:** Aumento na produtividade dos ${userType} através da automação e simplificação de tarefas.
        - **Redução de Custos:** Diminuição de custos operacionais devido à redução de erros e retrabalho.
        - **Satisfação do Usuário:** Melhoria na satisfação dos usuários finais, resultando em maior adesão ao sistema.
        - **Vantagem Competitiva:** Ganho de vantagem competitiva ao oferecer uma solução inovadora e eficaz.

        ### Critérios de Sucesso

        - A solução deve ser adotada por pelo menos 80% dos ${userType} dentro dos primeiros três meses após o lançamento.
        - A funcionalidade deve ser integrada sem problemas com os sistemas existentes, garantindo uma transição suave.
        - Feedback positivo dos usuários deve aumentar em 40% após a implementação da solução.
        - A solução deve proporcionar uma redução de 30% nos problemas relacionados a ${keywords}.
        `;
    };

    const alternativeStories = [
        generateAlternativeStory(),
        generateAlternativeStory(),
        generateAlternativeStory()
    ];

    document.getElementById('userStory').value = alternativeStories.join('\n\n---\n\n');
    document.getElementById('suggestion').innerText = `Histórias alternativas geradas com base nas palavras-chave: "${keywords}"`;

    $('#keywords').val('');
    $('#userType').val('');
    $('#goal').val('');
    $('#reason').val('');
    $('#details').val('');
}

function exportStory(format) {
    const userStory = document.getElementById('userStory').value;

    if (!userStory) {
        swal("História não encontrada", "Por favor, gere uma história de usuário antes de exportar.", "warning");
        return;
    }

    switch (format) {
        case 'pdf':
            exportToPDF(userStory);
            break;
        case 'txt':
            exportToTXT(userStory);
            break;
        case 'markdown':
            exportToMarkdown(userStory);
            break;
        case 'json':
            exportToJSON(userStory);
            break;
        default:
            swal("Formato desconhecido", "Formato de exportação não reconhecido.", "error");
    }
}

function exportToPDF(content) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const lines = doc.splitTextToSize(content, 180); // Largura do texto no PDF
    doc.text(lines, 10, 10);
    doc.save('user_story.pdf');
}

function exportToTXT(content) {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    saveAs(blob, "user_story.txt");
}

function exportToMarkdown(content) {
    const blob = new Blob([content], { type: "text/markdown" });
    saveAs(blob, "user_story.md");
}

function exportToJSON(content) {
    const jsonContent = JSON.stringify({ userStory: content }, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    saveAs(blob, "user_story.json");
}

function generateAcceptanceCriteria() {
    if (!$('#userStoryForm').valid()) {
        swal("Campos obrigatórios", "Por favor, preencha todos os campos obrigatórios.", "warning");
        return;
    }

    const userType = $('#userType').val().trim();
    const goal = $('#goal').val().trim();
    const keywords = $('#keywords').val().trim();

    const acceptanceCriteria = `
        ## Critérios de Aceitação

        - **Funcionalidade:**
            - O sistema deve permitir que o ${userType} ${goal} de maneira eficiente.
            - Todas as funcionalidades devem ser testadas e validadas com base nos requisitos de ${keywords}.
            - A solução deve ser integrada com sistemas existentes sem causar interrupções.
        
        - **Desempenho:**
            - O desempenho do sistema deve atender aos requisitos de carga e escalabilidade, suportando até X usuários simultâneos.
            - O tempo de resposta das operações críticas deve ser inferior a Y segundos.

        - **Usabilidade:**
            - A interface deve ser intuitiva e fácil de usar, com uma curva de aprendizado mínima para o ${userType}.
            - Testes de usabilidade devem ser conduzidos com ${userType} para garantir que as tarefas principais possam ser realizadas sem dificuldades.
        
        - **Segurança:**
            - Os dados devem ser protegidos conforme as melhores práticas de segurança, incluindo criptografia em trânsito e em repouso.
            - A solução deve implementar autenticação multifator (MFA) para acesso ao sistema.
            - Auditorias regulares de segurança devem ser realizadas para identificar e corrigir vulnerabilidades.
        
        - **Confiabilidade:**
            - O sistema deve ter uma disponibilidade mínima de 99.9%, com mecanismos de failover para garantir a continuidade do serviço.
            - Logs de atividades e erros devem ser mantidos para monitoramento e auditoria.
        
        - **Compatibilidade:**
            - A solução deve ser compatível com os principais navegadores e dispositivos utilizados pelo ${userType}.
            - Integrações com outros sistemas devem ser testadas para garantir a interoperabilidade sem falhas.
        
        - **Manutenibilidade:**
            - O código deve ser bem documentado e seguir padrões de codificação para facilitar a manutenção futura.
            - Atualizações e patches devem ser aplicados regularmente para manter o sistema seguro e funcional.
    `;

    document.getElementById('userStory').value += acceptanceCriteria;
}

function generateCompleteDocumentation() {
    if (!$('#userStoryForm').valid()) {
        swal("Campos obrigatórios", "Por favor, preencha todos os campos obrigatórios.", "warning");
        return;
    }

    const userStory = document.getElementById('userStory').value;

    const documentation = `
    # Documentação Completa

    ## História de Usuário
    ${userStory}

    ## Objetivos do Projeto
    - Fornecer uma solução que permita atingir os objetivos de maneira eficaz.
    - Reduzir os problemas associados a [palavras-chave] em pelo menos 30%.
    - Melhorar a satisfação dos usuários com o sistema através de funcionalidades aprimoradas.
    - Garantir que a solução seja escalável e possa atender a futuras demandas.

    ## Contexto do Problema
    - Atualmente, enfrentamos desafios significativos com [palavras-chave].
    - A falta de [objetivo] tem impactado negativamente nosso trabalho diário, resultando em [motivo].
    - Este problema é evidente em situações como [detalhes adicionais], que demonstram a necessidade urgente de uma solução eficaz.

    ## Benefícios Esperados
    - **Produtividade Melhorada:** Aumento na produtividade dos usuários através da automação e simplificação de tarefas.
    - **Redução de Custos:** Diminuição de custos operacionais devido à redução de erros e retrabalho.
    - **Satisfação do Usuário:** Melhoria na satisfação dos usuários finais, resultando em maior adesão ao sistema.
    - **Vantagem Competitiva:** Ganho de vantagem competitiva ao oferecer uma solução inovadora e eficaz.

    ## Requisitos Detalhados
    - **Desempenho:** O sistema deve suportar até 1000 usuários simultâneos sem degradação de desempenho.
    - **Segurança:** Os dados devem ser protegidos conforme as melhores práticas de segurança, incluindo criptografia em trânsito e em repouso.
    - **Usabilidade:** A interface deve ser intuitiva e fácil de usar, com acessibilidade garantida para pessoas com deficiências.
    - **Confiabilidade:** O sistema deve ter uma disponibilidade mínima de 99.9%, com mecanismos de failover para garantir a continuidade do serviço.
    - **Compatibilidade:** A solução deve ser compatível com os principais navegadores e dispositivos utilizados pelos usuários.
    - **Manutenibilidade:** O código deve ser bem documentado e seguir padrões de codificação para facilitar a manutenção futura.

    ## Critérios de Aceitação
    - **Funcionalidade:**
        - O sistema deve permitir que o usuário atinja seus objetivos de maneira eficiente.
        - Todas as funcionalidades devem ser testadas e validadas com base nos requisitos.
        - A solução deve ser integrada com sistemas existentes sem causar interrupções.
    - **Desempenho:**
        - O desempenho do sistema deve atender aos requisitos de carga e escalabilidade.
        - O tempo de resposta das operações críticas deve ser inferior a Y segundos.
    - **Usabilidade:**
        - A interface deve ser intuitiva e fácil de usar.
        - Testes de usabilidade devem ser conduzidos para garantir que as tarefas principais possam ser realizadas sem dificuldades.
    - **Segurança:**
        - A solução deve implementar autenticação multifator (MFA) para acesso ao sistema.
        - Auditorias regulares de segurança devem ser realizadas para identificar e corrigir vulnerabilidades.

    ## Métricas de Sucesso
    - **Adoção do Usuário:** Taxa de adoção e uso da nova funcionalidade.
    - **Redução de Erros:** Diminuição no número de erros e retrabalhos relacionados a [palavras-chave].
    - **Satisfação do Cliente:** Níveis de satisfação dos usuários medidos através de pesquisas pós-implementação.
    - **ROI:** Retorno sobre o investimento alcançado com a implementação da nova solução.
    `;

    document.getElementById('userStory').value = documentation;
}

function suggestImprovements() {
    const userStory = document.getElementById('userStory').value;

    if (!userStory) {
        swal("História não encontrada", "Por favor, gere uma história de usuário antes de sugerir melhorias.", "warning");
        return;
    }

    const improvements = `
    ## Sugestões de Melhoria

    - **Revisão dos Critérios de Aceitação:**
        - Garantir que todos os casos de uso sejam cobertos pelos critérios de aceitação.
        - Incluir critérios específicos para testes funcionais, testes de usabilidade e critérios de segurança.
    
    - **Testes de Desempenho:**
        - Adicionar testes de carga para validar o desempenho do sistema sob condições extremas.
        - Realizar testes de estresse para identificar pontos de falha e garantir a resiliência do sistema.

    - **Otimização de Desempenho:**
        - Implementar caching onde for aplicável para reduzir o tempo de resposta.
        - Otimizar consultas ao banco de dados para melhorar a eficiência.
        - Utilizar técnicas de compressão para reduzir o tamanho dos dados transferidos.

    - **Melhoria na Interface do Usuário:**
        - Implementar uma interface de usuário mais intuitiva para melhorar a experiência do usuário.
        - Realizar testes de usabilidade com usuários reais para identificar áreas de melhoria na interface.
        - Garantir que a interface seja responsiva e acessível em dispositivos móveis.

    - **Acessibilidade:**
        - Garantir que a interface do usuário seja acessível a pessoas com deficiência, seguindo as diretrizes de acessibilidade WCAG.
        - Incluir opções de acessibilidade, como alto contraste, suporte a leitores de tela, e navegação por teclado.

    - **Segurança:**
        - Realizar auditorias de segurança regulares para identificar e corrigir vulnerabilidades.
        - Implementar autenticação multifator (MFA) para aumentar a segurança do sistema.
        - Garantir que os dados sejam criptografados em trânsito e em repouso.

    - **Documentação:**
        - Manter a documentação do sistema atualizada e acessível a todos os membros da equipe.
        - Incluir guias de usuário, manuais técnicos e documentação de API.
        - Utilizar diagramas e fluxogramas para ilustrar a arquitetura do sistema e os fluxos de trabalho.

    - **Feedback Contínuo:**
        - Incluir mecanismos de feedback contínuo para monitorar a satisfação do usuário e identificar áreas de melhoria.
        - Implementar um sistema de feedback dentro da aplicação para coletar opiniões dos usuários.
        - Realizar pesquisas de satisfação periódicas para obter insights sobre a experiência do usuário.

    - **Melhoria Contínua:**
        - Adotar uma abordagem de melhoria contínua, utilizando metodologias ágeis para iterar e melhorar o sistema.
        - Estabelecer um processo de revisão pós-implementação para identificar lições aprendidas e oportunidades de melhoria.
        - Incentivar a colaboração entre as equipes de desenvolvimento, QA e operações para garantir a qualidade do sistema.

    - **Monitoramento e Alertas:**
        - Implementar ferramentas de monitoramento para acompanhar a saúde do sistema em tempo real.
        - Configurar alertas para notificar a equipe sobre quaisquer anomalias ou problemas de desempenho.
        - Utilizar logs e métricas para identificar tendências e prever possíveis problemas.

    `;

    document.getElementById('userStory').value += improvements;
}

function importStory(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        const extension = file.name.split('.').pop().toLowerCase();

        switch (extension) {
            case 'txt':
            case 'json':
                document.getElementById('userStory').value = content;
                break;
            case 'pdf':
                importFromPDF(content);
                break;
            default:
                swal("Formato desconhecido", "Formato de importação não reconhecido.", "error");
        }
    };

    if (file.name.endsWith('.pdf')) {
        reader.readAsArrayBuffer(file);
    } else {
        reader.readAsText(file);
    }
}

function importFromPDF(arrayBuffer) {
    const pdfjsLib = window['pdfjs-dist/build/pdf'];
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
    loadingTask.promise.then(function (pdf) {
        let text = '';
        const maxPages = pdf.numPages;
        const countPromises = [];

        for (let j = 1; j <= maxPages; j++) {
            const page = pdf.getPage(j);

            const txt = page.then(function (pageData) {
                return pageData.getTextContent().then(function (textContent) {
                    let pageText = '';
                    textContent.items.forEach(function (item) {
                        pageText += item.str + ' ';
                    });
                    return pageText;
                });
            });

            countPromises.push(txt);
        }

        Promise.all(countPromises).then(function (texts) {
            text = texts.join('\n');
            document.getElementById('userStory').value = text;
        });
    }, function (reason) {
        console.error(reason);
        swal("Erro ao importar", "Erro ao ler o arquivo PDF.", "error");
    });
}

console.log("\n%cAtenção Espere! %c\n\n\nEste é um recurso de navegador voltado para desenvolvedores. Se alguém disse para você copiar e colar algo aqui para ativar um recurso ou 'invadir' a maquina de outra pessoa, isso é uma fraude e você dará a ele acesso à sua maquina.\n\nConsulte ataques https://en.wikipedia.org/wiki/Self-XSS para obter mais informações.", "color: red; font-size: 46px;", "font-size: 16px;");
