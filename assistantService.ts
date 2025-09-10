import type { KnowledgeEntry } from '../types';
import { getGenericTextResponse } from './geminiService';

const KNOWLEDGE_BASE_KEY = 'gyt_assistant_knowledge';
let knowledgeBase: KnowledgeEntry[] = [];

const initialKnowledge: KnowledgeEntry[] = [
    // Greeting & Identity
    { keywords: ['oi', 'ola', 'quem', 'voce', 'e'], response: 'Olá! Eu sou seu assistente de IA pessoal do Gerador YouTube. Estou aqui para ajudar você a criar imagens e vídeos incríveis. Como posso ajudar?' },
    { keywords: ['o', 'que', 'faz', 'voce'], response: 'Eu posso te ajudar a usar o aplicativo, dar dicas de como escrever bons prompts, explicar funcionalidades e tirar suas dúvidas sobre o app e também sobre programação. Pergunte o que quiser!' },
    { keywords: ['offline', 'funciona'], response: 'Sim! Eu funciono offline usando o conhecimento que já aprendi. Se você me perguntar algo novo enquanto estiver online, eu aprenderei a resposta e a salvarei para o futuro.' },
    // App Functionality
    { keywords: ['criar', 'imagem', 'gerar'], response: "Para criar uma imagem, vá para a aba 'Criar', escreva sua ideia no campo de texto, escolha uma função (como 'Prompt' ou 'Adesivo'), ajuste a proporção e as variações, e clique em 'Gerar Imagem'." },
    { keywords: ['editar', 'foto', 'manipular'], response: "Para editar, vá para a aba 'Editar', envie uma imagem, descreva a alteração que você quer fazer (ex: 'adicione um chapéu de sol') e clique em 'Gerar Imagem'." },
    { keywords: ['video', 'fazer', 'gerar'], response: "Para gerar vídeos, selecione a aba 'Vídeo', descreva a cena que você imagina e clique em 'Gerar Vídeo'. O app sempre criará duas variações para você escolher." },
    { keywords: ['variacoes', 'que', 'sao'], response: "Variações são diferentes resultados gerados a partir do mesmo prompt. Isso te dá mais opções criativas para escolher a que mais gosta." },
    { keywords: ['proporcao', 'aspect', 'ratio', 'mudar'], response: "A proporção (ou aspect ratio) define o formato da sua imagem. '16:9' é ideal para thumbnails (paisagem), '9:16' para stories (retrato) e '1:1' é um quadrado perfeito." },
    { keywords: ['referencia', 'imagem'], response: "Usar uma imagem de referência no modo 'Criar' permite que a IA se inspire no estilo, cores e composição da sua imagem para criar algo totalmente novo, mas com uma vibe parecida." },
    { keywords: ['adulto', 'desbloquear', 'codigo'], response: "O modo adulto permite gerar conteúdo para maiores de 18 anos. Para desbloquear, você precisa de um código de acesso especial. Ele existe para proteger usuários mais jovens." },
    { keywords: ['unir', 'imagens', 'duas'], response: "A função 'Unir' no modo 'Editar' permite combinar duas imagens. Você precisa enviar duas fotos e descrever como elas devem ser mescladas." },
    // Prompting Tips
    { keywords: ['dicas', 'prompt', 'bom', 'escrever'], response: "Para um bom prompt, seja descritivo! Use adjetivos, especifique o estilo (ex: 'foto realista', 'desenho animado'), o ambiente e a iluminação. Ex: 'Um gato astronauta flutuando no espaço, com nebulosas coloridas ao fundo, estilo arte digital'." },
    // Troubleshooting
    { keywords: ['erro', 'falhou', 'nao', 'gerou'], response: "Se a geração falhar, tente simplificar seu prompt. Às vezes, prompts muito complexos ou ambíguos podem causar erros. Verifique também sua conexão com a internet." },
    { keywords: ['demorando', 'video', 'lento'], response: "A geração de vídeo é um processo complexo e pode levar alguns minutos. Por favor, aguarde enquanto a IA trabalha na sua criação. O app te manterá informado sobre o status." },

    // Programming - General
    { keywords: ['api', 'o', 'que', 'e'], response: 'Uma API (Application Programming Interface) é um conjunto de regras que permite que diferentes aplicativos "conversem" entre si. É como um garçom que pega seu pedido (requisição) e o leva para a cozinha (servidor), trazendo a resposta de volta para você.' },
    { keywords: ['json', 'o', 'que', 'e'], response: 'JSON (JavaScript Object Notation) é um formato de texto leve para troca de dados. É fácil para humanos lerem e para máquinas analisarem. Pense nele como uma forma universal de organizar informações com chaves e valores, como um dicionário.' },

    // Programming - HTML
    { keywords: ['html', 'o', 'que', 'e'], response: 'HTML (HyperText Markup Language) é a linguagem de marcação padrão para criar páginas web. É o "esqueleto" de um site, definindo a estrutura do conteúdo com elementos como títulos, parágrafos e links.' },
    { keywords: ['div', 'p', 'h1', 'tags', 'html'], response: 'Tags HTML são os blocos de construção de uma página. `<h1>` é um título principal, `<p>` é um parágrafo e `<div>` é um contêiner genérico usado para agrupar outros elementos e aplicar estilos.' },

    // Programming - CSS
    { keywords: ['css', 'o', 'que', 'e', 'estilo'], response: 'CSS (Cascading Style Sheets) é a linguagem que usamos para estilizar uma página HTML. É o que dá cor, define fontes, layouts e torna o site visualmente atraente. É a "roupa" do esqueleto HTML.' },
    { keywords: ['flexbox', 'grid', 'css'], response: 'Flexbox e Grid são sistemas de layout em CSS para organizar elementos na página. Flexbox é ideal para layouts em uma dimensão (uma linha ou uma coluna), enquanto o Grid é mais poderoso para layouts em duas dimensões (linhas e colunas).' },

    // Programming - JavaScript
    { keywords: ['javascript', 'js', 'o', 'que', 'e'], response: 'JavaScript (ou JS) é uma linguagem de programação que torna as páginas web interativas. Ela permite criar animações, responder a cliques de botões, buscar dados e muito mais. É o "cérebro" que dá vida à página.' },
    { keywords: ['variavel', 'const', 'let', 'javascript'], response: "Em JavaScript, `let` e `const` são usadas para declarar variáveis (recipientes para armazenar dados). Use `let` para valores que podem mudar e `const` para valores que não mudarão (constantes)." },
    { keywords: ['funcao', 'function', 'javascript'], response: 'Uma função em JavaScript é um bloco de código projetado para executar uma tarefa específica. Ela pode ser chamada (invocada) várias vezes, ajudando a organizar e reutilizar o código.' },

    // Programming - React
    { keywords: ['react', 'o', 'que', 'e'], response: 'React é uma biblioteca JavaScript para construir interfaces de usuário, especialmente "Single Page Applications" (SPAs). Ele permite criar componentes de UI reutilizáveis que gerenciam seu próprio estado.' },
    { keywords: ['componente', 'react'], response: 'Em React, um componente é uma peça de UI independente e reutilizável. Pense em uma página web dividida em blocos: um botão, um formulário, um cabeçalho... cada um pode ser um componente.' },
    { keywords: ['jsx', 'react', 'o', 'que', 'e'], response: 'JSX (JavaScript XML) é uma extensão de sintaxe para JavaScript que se parece muito com HTML. Ele permite que você escreva a estrutura da sua UI diretamente no código JavaScript, tornando os componentes React mais fáceis de ler e escrever.' },
    { keywords: ['estado', 'state', 'usestate', 'react'], response: 'O "estado" (state) em React é um objeto que armazena dados que podem mudar ao longo do tempo em um componente. Quando o estado muda, o React re-renderiza o componente para refletir essa mudança. O hook `useState` é a forma padrão de adicionar estado a um componente.' },
];

const loadKnowledgeBase = (): void => {
    try {
        const storedKnowledge = localStorage.getItem(KNOWLEDGE_BASE_KEY);
        if (storedKnowledge) {
            knowledgeBase = JSON.parse(storedKnowledge);
        } else {
            knowledgeBase = initialKnowledge;
            localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(knowledgeBase));
        }
    } catch (error) {
        console.error("Failed to load knowledge base:", error);
        knowledgeBase = initialKnowledge;
    }
};

const saveKnowledgeBase = (): void => {
    try {
        localStorage.setItem(KNOWLEDGE_BASE_KEY, JSON.stringify(knowledgeBase));
    } catch (error) {
        console.error("Failed to save knowledge base:", error);
    }
};

const findBestResponse = (normalizedPrompt: string): string | null => {
    let bestMatch = { score: 0, response: '' };
    const promptWords = new Set(normalizedPrompt.split(' '));

    for (const entry of knowledgeBase) {
        let currentScore = 0;
        for (const keyword of entry.keywords) {
            if (promptWords.has(keyword)) {
                currentScore++;
            }
        }
        if (currentScore > bestMatch.score) {
            bestMatch = { score: currentScore, response: entry.response };
        }
    }

    // Require a minimum score to consider it a match
    return bestMatch.score > 0 ? bestMatch.response : null;
};

const addNewKnowledge = (prompt: string, response: string): void => {
    const keywords = prompt
        .toLowerCase()
        .replace(/[^\w\s]/gi, '')
        .split(' ')
        .filter(word => word.length > 2); // Simple keyword extraction

    knowledgeBase.push({ keywords: [...new Set(keywords)], response });
    saveKnowledgeBase();
}

export const getAssistantResponse = async (prompt: string, isOnline: boolean): Promise<string> => {
    if (knowledgeBase.length === 0) {
        loadKnowledgeBase();
    }

    const normalizedPrompt = prompt.toLowerCase().replace(/[^\w\s]/gi, '');
    const localResponse = findBestResponse(normalizedPrompt);

    if (localResponse) {
        return localResponse;
    }

    if (isOnline) {
        try {
            const onlineResponse = await getGenericTextResponse(prompt);
            addNewKnowledge(prompt, onlineResponse);
            return onlineResponse;
        } catch (error) {
            return error instanceof Error ? error.message : "Desculpe, não consegui obter uma resposta online.";
        }
    }

    return "Eu ainda não tenho a resposta para isso. Pergunte-me novamente quando você estiver online, e eu aprenderei!";
};

// Initialize on load
loadKnowledgeBase();