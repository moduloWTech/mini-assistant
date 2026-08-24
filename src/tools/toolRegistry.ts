export interface ToolDefinition {
  name: string;
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, { type: string; description: string; enum?: string[] }>;
    required: string[];
  };
}

export const AVAILABLE_TOOLS: Record<string, ToolDefinition> = {
  capture_lead: {
    name: "capture_lead",
    description: "Salva os dados de contato de um lead qualificado (nome, whatsapp/telefone, e-mail, interesse ou orçamento) para envio ao time comercial.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string", description: "Nome do lead/cliente" },
        phone: { type: "string", description: "Telefone ou WhatsApp de contato com DDD" },
        email: { type: "string", description: "E-mail de contato" },
        interest: { type: "string", description: "Serviço, produto ou plano pelo qual demonstrou interesse" },
        notes: { type: "string", description: "Observações contextuais relevantes da conversa" }
      },
      required: ["name"]
    }
  },
  schedule_meeting: {
    name: "schedule_meeting",
    description: "Agenda uma reunião ou consulta no calendário para o cliente com data e horário definidos.",
    parameters: {
      type: "object",
      properties: {
        clientName: { type: "string", description: "Nome completo do cliente" },
        clientContact: { type: "string", description: "Telefone ou e-mail de contato" },
        date: { type: "string", description: "Data no formato YYYY-MM-DD" },
        time: { type: "string", description: "Horário no formato HH:mm" },
        service: { type: "string", description: "Tipo de consulta ou serviço a ser agendado" }
      },
      required: ["clientName", "date", "time"]
    }
  },
  transfer_to_human: {
    name: "transfer_to_human",
    description: "Pausa o atendimento da inteligência artificial e transfere a conversa para um atendente humano da equipe.",
    parameters: {
      type: "object",
      properties: {
        reason: { type: "string", description: "Motivo da transferência para o atendente humano" }
      },
      required: ["reason"]
    }
  }
};
