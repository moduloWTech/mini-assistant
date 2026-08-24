import axios from "axios";
import { prisma } from "../DB/prisma.config";

export interface ToolCallContext {
  clientId: string;
  endUserId?: string;
  channel?: string;
}

export class ToolExecutor {
  /**
   * Executa uma ferramenta solicitada pela IA.
   */
  async execute(toolName: string, args: any, context: ToolCallContext): Promise<{ success: boolean; data?: any; message: string }> {
    console.log(`[ToolExecutor] Executando ferramenta "${toolName}" com argumentos:`, JSON.stringify(args));

    switch (toolName) {
      case "capture_lead":
        return this.handleCaptureLead(args, context);
      case "schedule_meeting":
        return this.handleScheduleMeeting(args, context);
      case "transfer_to_human":
        return this.handleTransferToHuman(args, context);
      default:
        return { success: false, message: `Ferramenta desconhecida: ${toolName}` };
    }
  }

  private async handleCaptureLead(args: any, context: ToolCallContext) {
    try {
      const { name, phone, email, interest, notes } = args;

      // 1. Salva o Lead no banco de dados
      const lead = await prisma.lead.create({
        data: {
          clientId: context.clientId,
          endUserId: context.endUserId,
          name: name || "Cliente",
          phone: phone || null,
          email: email || null,
          interest: interest || "Geral",
          notes: notes || null,
          sourceChannel: context.channel || "web",
          status: "new",
          metadata: args
        }
      });

      // 2. Se o cliente tiver Webhook configurado (HubSpot, Pipedrive, n8n, Make), dispara o evento
      const client = await prisma.client.findUnique({
        where: { id: context.clientId },
        select: { webhookUrl: true, companyName: true }
      });

      if (client?.webhookUrl) {
        try {
          await axios.post(client.webhookUrl, {
            event: "lead.captured",
            company: client.companyName,
            lead: {
              id: lead.id,
              name: lead.name,
              phone: lead.phone,
              email: lead.email,
              interest: lead.interest,
              notes: lead.notes,
              sourceChannel: lead.sourceChannel,
              createdAt: lead.createdAt
            }
          }, { timeout: 3000 });
          console.log(`[ToolExecutor] Webhook de lead disparado com sucesso para ${client.webhookUrl}`);
        } catch (webhookErr: any) {
          console.warn("[ToolExecutor] Falha ao disparar webhook externo do cliente:", webhookErr.message);
        }
      }

      return {
        success: true,
        data: { leadId: lead.id },
        message: `Lead ${name} registrado com sucesso no sistema.`
      };
    } catch (error: any) {
      console.error("[ToolExecutor] Erro ao registrar lead:", error);
      return { success: false, message: `Erro ao registrar lead: ${error.message}` };
    }
  }

  private async handleScheduleMeeting(args: any, context: ToolCallContext) {
    try {
      const { clientName, clientContact, date, time, service } = args;

      // Cria um registro de lead qualificado com o agendamento
      await prisma.lead.create({
        data: {
          clientId: context.clientId,
          endUserId: context.endUserId,
          name: clientName,
          phone: clientContact,
          interest: `Agendamento: ${service || 'Atendimento'} em ${date} às ${time}`,
          status: "qualified",
          notes: `Agendado para ${date} às ${time}. Serviço: ${service || 'Geral'}`,
          sourceChannel: context.channel || "web",
          metadata: args
        }
      });

      return {
        success: true,
        message: `Agendamento confirmado para ${clientName} na data ${date} às ${time}.`
      };
    } catch (error: any) {
      console.error("[ToolExecutor] Erro ao agendar reunião:", error);
      return { success: false, message: "Não foi possível confirmar o agendamento no momento." };
    }
  }

  private async handleTransferToHuman(args: any, context: ToolCallContext) {
    try {
      if (context.endUserId) {
        // Pausa a IA para esse usuário por 2 horas (atendente humano assume)
        const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);
        await prisma.endUser.update({
          where: { id: context.endUserId },
          data: {
            isAiPaused: true,
            pausedUntil: twoHoursFromNow
          }
        });
      }

      return {
        success: true,
        message: `Atendimento transferido para um operador humano. Motivo: ${args.reason || "Solicitação do usuário"}.`
      };
    } catch (error: any) {
      console.error("[ToolExecutor] Erro ao pausar IA para atendimento humano:", error);
      return { success: false, message: "Erro ao transferir para humano." };
    }
  }
}

export const toolExecutor = new ToolExecutor();
