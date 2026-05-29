export type QuestionType = "text" | "textarea" | "single" | "multi";

export type Question = {
  id: number;
  type: QuestionType;
  title: string;
  sub?: string;
  placeholder?: string;
  options?: string[];
  horizontal?: boolean;
  required: boolean;
};

export const QUESTIONS: Question[] = [
  { id: 1, type: "text", title: "Qual é o seu nome completo?", placeholder: "Digite seu nome...", required: true },
  { id: 2, type: "text", title: "Quantos anos você tem?", placeholder: "Ex: 24", required: true },
  { id: 3, type: "text", title: "Qual cidade e bairro você mora?", placeholder: "Ex: São Paulo, Pinheiros", required: true },
  { id: 4, type: "text", title: "Qual é o seu WhatsApp para contato?", placeholder: "Ex: (11) 99999-9999", required: true },
  { id: 5, type: "textarea", title: "Com o que você trabalha hoje?", placeholder: "Conta um pouco sobre sua atuação atual...", required: true },
  {
    id: 6,
    type: "textarea",
    title: "Você já trabalhou com desenvolvimento ou programação?",
    sub: "Se sim, quais tecnologias, linguagens ou ferramentas?",
    placeholder: 'Ex: Python, Node.js, no-code com Make... ou "ainda não, mas tenho interesse"',
    required: false,
  },
  {
    id: 7,
    type: "textarea",
    title: "Você já participou da operação de alguma empresa?",
    sub: "Financeiro, vendas, estoque, atendimento, logística, processos, gestão...",
    placeholder: "Conta como foi essa experiência...",
    required: false,
  },
  {
    id: 8,
    type: "textarea",
    title: "Você entende como funciona um ERP ou sistema de gestão?",
    sub: "Explica do seu jeito, sem formalidade.",
    placeholder: 'Ex: "É um sistema que centraliza os dados da empresa, como estoque, financeiro..."',
    required: false,
  },
  {
    id: 9,
    type: "textarea",
    title: "Você já ajudou a melhorar algum processo ou organizar uma operação?",
    sub: "Conta um exemplo simples, pode ser qualquer contexto.",
    placeholder: 'Ex: "Criei uma planilha que reduziu o tempo de fechamento..."',
    required: false,
  },
  {
    id: 10,
    type: "single",
    title: "O que você prefere?",
    options: ["Só executar tarefas", "Entender o negócio como um todo e ajudar a construir soluções"],
    required: true,
  },
  {
    id: 11,
    type: "single",
    title: "Como você avalia seu nível de lógica e raciocínio?",
    options: ["Baixo", "Médio", "Alto"],
    horizontal: true,
    required: true,
  },
  {
    id: 12,
    type: "multi",
    title: "O que mais te interessa hoje?",
    sub: "Selecione quantas quiser.",
    options: ["Programação", "Negócios", "Automação", "Inteligência Artificial", "Processos", "Gestão", "Outro"],
    required: true,
  },
  {
    id: 13,
    type: "textarea",
    title: "Por que você acredita que faria sentido para essa vaga?",
    placeholder: "Seja honesto e direto — é o que a gente quer ouvir.",
    required: true,
  },
  {
    id: 14,
    type: "single",
    title: "Você tem disponibilidade para viagens quando necessário?",
    options: ["Sim", "Não"],
    horizontal: true,
    required: true,
  },
  {
    id: 15,
    type: "textarea",
    title: "Pode enviar seu LinkedIn, GitHub, portfólio ou projetos?",
    sub: "Qualquer coisa que queira mostrar sobre você.",
    placeholder: "Cole os links aqui...",
    required: false,
  },
  { id: 16, type: "text", title: "Qual é a sua pretensão salarial?", placeholder: "Ex: R$ 3.000 a R$ 4.000", required: true },
];

export type AnswerValue = string | number | number[] | null;

export type AnswerRecord = {
  questionId: number;
  question: string;
  answer: string | null;
  rawValue: AnswerValue;
};

export function buildAnswerRecords(rawAnswers: Record<number, AnswerValue>): AnswerRecord[] {
  return QUESTIONS.map((question, idx) => {
    const value = rawAnswers[idx];
    return {
      questionId: question.id,
      question: question.title,
      answer: displayAnswer(question, value),
      rawValue: value ?? null,
    };
  });
}

function displayAnswer(question: Question, value: AnswerValue): string | null {
  if (value === null || value === undefined || value === "") return null;
  if (question.type === "single" && typeof value === "number") {
    return question.options?.[value] ?? null;
  }
  if (question.type === "multi" && Array.isArray(value)) {
    if (value.length === 0) return null;
    return value.map((i) => question.options?.[i]).filter(Boolean).join(", ");
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }
  return null;
}
