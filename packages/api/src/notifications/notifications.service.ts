// ============================================================================
// Notification Service — SMS / Email / Push stub for Angola
// ============================================================================

import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as sgMail from "@sendgrid/mail";

export enum NotificationChannel {
  SMS = "SMS",
  EMAIL = "EMAIL",
  PUSH = "PUSH",
  WHATSAPP = "WHATSAPP",
}

export enum NotificationTemplate {
  APPOINTMENT_REMINDER = "APPOINTMENT_REMINDER",
  APPOINTMENT_CONFIRMATION = "APPOINTMENT_CONFIRMATION",
  APPOINTMENT_CANCELLATION = "APPOINTMENT_CANCELLATION",
  VACCINE_DUE = "VACCINE_DUE",
  PAYMENT_RECEIVED = "PAYMENT_RECEIVED",
  PAYMENT_OVERDUE = "PAYMENT_OVERDUE",
  WELCOME = "WELCOME",
  PASSWORD_RESET = "PASSWORD_RESET",
}

export interface NotificationPayload {
  channel: NotificationChannel;
  template: NotificationTemplate;
  recipientPhone?: string;
  recipientEmail?: string;
  recipientName: string;
  locale: string;
  data: Record<string, string>;
  tenantId: string;
  scheduledFor?: Date;
}

interface NotificationResult {
  success: boolean;
  messageId?: string;
  provider?: string;
  error?: string;
}

// Portuguese notification templates for Angola
const TEMPLATES: Record<
  NotificationTemplate,
  { subject: string; body: string }
> = {
  [NotificationTemplate.APPOINTMENT_REMINDER]: {
    subject: "Lembrete de Consulta — {{clinicName}}",
    body: "Olá {{recipientName}}, relembramos que {{animalName}} tem consulta agendada para {{date}} às {{time}}. {{clinicName}}",
  },
  [NotificationTemplate.APPOINTMENT_CONFIRMATION]: {
    subject: "Consulta Confirmada — {{clinicName}}",
    body: "Olá {{recipientName}}, a consulta de {{animalName}} foi confirmada para {{date}} às {{time}}. {{clinicName}}",
  },
  [NotificationTemplate.APPOINTMENT_CANCELLATION]: {
    subject: "Consulta Cancelada — {{clinicName}}",
    body: "Olá {{recipientName}}, a consulta de {{animalName}} marcada para {{date}} foi cancelada. Para reagendar, contacte-nos. {{clinicName}}",
  },
  [NotificationTemplate.VACCINE_DUE]: {
    subject: "Vacina Pendente — {{clinicName}}",
    body: "Olá {{recipientName}}, {{animalName}} tem a vacina {{vaccineName}} pendente (vencida em {{dueDate}}). Agende já! {{clinicName}}",
  },
  [NotificationTemplate.PAYMENT_RECEIVED]: {
    subject: "Pagamento Confirmado — {{clinicName}}",
    body: "Olá {{recipientName}}, confirmamos o recebimento de {{amount}} referente a {{description}}. Obrigado! {{clinicName}}",
  },
  [NotificationTemplate.PAYMENT_OVERDUE]: {
    subject: "Pagamento Pendente — {{clinicName}}",
    body: "Olá {{recipientName}}, a fatura {{invoiceRef}} no valor de {{amount}} encontra-se pendente. {{clinicName}}",
  },
  [NotificationTemplate.WELCOME]: {
    subject: "Bem-vindo ao {{clinicName}}!",
    body: "Olá {{recipientName}}, a sua conta na {{clinicName}} foi criada com sucesso. Pode aceder em {{loginUrl}}.",
  },
  [NotificationTemplate.PASSWORD_RESET]: {
    subject: "Redefinir Senha — {{clinicName}}",
    body: "Olá {{recipientName}}, utilize o código {{resetCode}} para redefinir a sua senha. Este código expira em 15 minutos.",
  },
};

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly sendGridApiKey: string | undefined;

  constructor(private configService: ConfigService) {
    this.sendGridApiKey = this.configService.get<string>("SENDGRID_API_KEY");
    if (this.sendGridApiKey) {
      sgMail.setApiKey(this.sendGridApiKey);
      this.logger.log("SendGrid API Key configured");
    } else {
      this.logger.warn(
        "SendGrid API Key not configured, falling back to email stub",
      );
    }
  }

  /**
   * Send a notification via the appropriate channel.
   * Currently stubs all providers — replace with real provider SDKs.
   */
  async send(payload: NotificationPayload): Promise<NotificationResult> {
    const template = TEMPLATES[payload.template];
    if (!template) {
      return { success: false, error: `Unknown template: ${payload.template}` };
    }

    const renderedBody = this.renderTemplate(template.body, {
      recipientName: payload.recipientName,
      ...payload.data,
    });

    const renderedSubject = this.renderTemplate(template.subject, {
      recipientName: payload.recipientName,
      ...payload.data,
    });

    switch (payload.channel) {
      case NotificationChannel.SMS:
        return this.sendSms(
          payload.recipientPhone!,
          renderedBody,
          payload.tenantId,
        );
      case NotificationChannel.EMAIL:
        return this.sendEmail(
          payload.recipientEmail!,
          renderedSubject,
          renderedBody,
          payload.tenantId,
        );
      case NotificationChannel.WHATSAPP:
        return this.sendWhatsApp(
          payload.recipientPhone!,
          renderedBody,
          payload.tenantId,
        );
      case NotificationChannel.PUSH:
        return this.sendPush(
          payload.recipientName,
          renderedSubject,
          renderedBody,
          payload.tenantId,
        );
      default:
        return {
          success: false,
          error: `Unsupported channel: ${payload.channel}`,
        };
    }
  }

  /**
   * Send appointment reminder (convenience method)
   */
  async sendAppointmentReminder(
    recipientName: string,
    recipientPhone: string,
    animalName: string,
    date: string,
    time: string,
    clinicName: string,
    tenantId: string,
  ): Promise<NotificationResult> {
    return this.send({
      channel: NotificationChannel.SMS,
      template: NotificationTemplate.APPOINTMENT_REMINDER,
      recipientPhone,
      recipientName,
      locale: "pt-AO",
      tenantId,
      data: { animalName, date, time, clinicName },
    });
  }

  /**
   * Send vaccine due alert
   */
  async sendVaccineDueAlert(
    recipientName: string,
    recipientPhone: string,
    animalName: string,
    vaccineName: string,
    dueDate: string,
    clinicName: string,
    tenantId: string,
  ): Promise<NotificationResult> {
    return this.send({
      channel: NotificationChannel.SMS,
      template: NotificationTemplate.VACCINE_DUE,
      recipientPhone,
      recipientName,
      locale: "pt-AO",
      tenantId,
      data: { animalName, vaccineName, dueDate, clinicName },
    });
  }

  // ── Provider Stubs ─────────────────────────────────

  private async sendSms(
    phone: string,
    body: string,
    tenantId: string,
  ): Promise<NotificationResult> {
    // TODO: Integrate with Angola SMS provider (e.g., Unitel SMS API, Africell)
    this.logger.log(`[SMS STUB] To: ${phone} | Tenant: ${tenantId}`);
    this.logger.debug(`[SMS STUB] Body: ${body}`);

    // Simulate network latency
    await this.delay(100);

    return {
      success: true,
      messageId: `sms_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      provider: "stub",
    };
  }

  private async sendEmail(
    email: string,
    subject: string,
    body: string,
    tenantId: string,
  ): Promise<NotificationResult> {
    if (this.sendGridApiKey) {
      try {
        const msg = {
          to: email,
          from: this.configService.get<string>(
            "SENDGRID_SENDER_EMAIL",
            "noreply@vetangola.ao",
          ),
          subject: subject,
          html: body,
          customArgs: {
            tenant_id: tenantId,
          },
        };

        const [response] = await sgMail.send(msg);
        this.logger.log(
          `[EMAIL SENT] To: ${email} | Subject: ${subject} | Tenant: ${tenantId}`,
        );

        return {
          success: true,
          messageId: response.headers["x-message-id"] as string,
          provider: "sendgrid",
        };
      } catch (error) {
        this.logger.error(
          `[EMAIL ERROR] Failed to send email to ${email}: ${error.message}`,
          error.stack,
        );
        return {
          success: false,
          error: error.message,
          provider: "sendgrid",
        };
      }
    }

    // Stub fallback
    this.logger.log(
      `[EMAIL STUB] To: ${email} | Subject: ${subject} | Tenant: ${tenantId}`,
    );

    await this.delay(100);

    return {
      success: true,
      messageId: `email_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      provider: "stub",
    };
  }

  private async sendWhatsApp(
    phone: string,
    body: string,
    tenantId: string,
  ): Promise<NotificationResult> {
    // TODO: Integrate with WhatsApp Business API
    this.logger.log(`[WHATSAPP STUB] To: ${phone} | Tenant: ${tenantId}`);

    await this.delay(100);

    return {
      success: true,
      messageId: `wa_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      provider: "stub",
    };
  }

  private async sendPush(
    userId: string,
    title: string,
    body: string,
    tenantId: string,
  ): Promise<NotificationResult> {
    // TODO: Integrate with Firebase Cloud Messaging or similar
    this.logger.log(
      `[PUSH STUB] User: ${userId} | Title: ${title} | Tenant: ${tenantId}`,
    );

    await this.delay(50);

    return {
      success: true,
      messageId: `push_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      provider: "stub",
    };
  }

  // ── Helpers ────────────────────────────────────────

  private renderTemplate(
    template: string,
    data: Record<string, string>,
  ): string {
    return template.replace(
      /\{\{(\w+)\}\}/g,
      (_, key) => data[key] || `{{${key}}}`,
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
