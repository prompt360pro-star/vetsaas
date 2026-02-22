import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ISmsProvider, NotificationResult } from "./sms-provider.interface";

@Injectable()
export class TwilioSmsProvider implements ISmsProvider {
  private readonly logger = new Logger(TwilioSmsProvider.name);
  private readonly accountSid: string;
  private readonly authToken: string;
  private readonly fromNumber: string;

  constructor(private readonly configService: ConfigService) {
    this.accountSid = this.configService.get<string>("TWILIO_ACCOUNT_SID", "");
    this.authToken = this.configService.get<string>("TWILIO_AUTH_TOKEN", "");
    this.fromNumber = this.configService.get<string>("TWILIO_FROM_NUMBER", "");

    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      this.logger.warn(
        "Twilio configuration is missing. SMS sending will fail if Twilio provider is selected.",
      );
    }
  }

  async send(
    phone: string,
    body: string,
    tenantId: string,
  ): Promise<NotificationResult> {
    if (!this.accountSid || !this.authToken || !this.fromNumber) {
      return {
        success: false,
        error: "Twilio configuration is missing",
        provider: "twilio",
      };
    }

    try {
      const url = `https://api.twilio.com/2010-04-01/Accounts/${this.accountSid}/Messages.json`;
      const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString(
        "base64",
      );

      const params = new URLSearchParams();
      params.append("To", phone);
      params.append("From", this.fromNumber);
      params.append("Body", body);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        this.logger.error(
          `Failed to send SMS via Twilio: ${response.status} ${response.statusText} - ${errorText}`,
        );
        return {
          success: false,
          error: `Twilio API error: ${response.statusText}`,
          provider: "twilio",
        };
      }

      const data: any = await response.json();
      this.logger.log(
        `SMS sent via Twilio to ${phone} (Tenant: ${tenantId}, SID: ${data.sid})`,
      );

      return {
        success: true,
        messageId: data.sid,
        provider: "twilio",
      };
    } catch (error: any) {
      this.logger.error(
        `Error sending SMS via Twilio: ${error.message}`,
        error.stack,
      );
      return {
        success: false,
        error: error.message,
        provider: "twilio",
      };
    }
  }
}
