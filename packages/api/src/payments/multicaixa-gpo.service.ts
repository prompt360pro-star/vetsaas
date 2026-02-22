import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MulticaixaGpoService {
  private readonly logger = new Logger(MulticaixaGpoService.name);
  private readonly apiUrl: string;
  private readonly apiKey: string;
  private readonly merchantId: string;

  constructor(private readonly config: ConfigService) {
    this.apiUrl = this.config.get<string>("MULTICAIXA_GPO_API_URL", "");
    this.apiKey = this.config.get<string>("MULTICAIXA_GPO_API_KEY", "");
    this.merchantId = this.config.get<string>(
      "MULTICAIXA_GPO_MERCHANT_ID",
      "00000",
    );
  }

  async generateReference(amount: number): Promise<string> {
    // If credentials are missing, fallback immediately
    if (!this.apiUrl || !this.apiKey) {
      this.logger.warn(
        "Multicaixa GPO API URL or Key not configured. Using fallback reference.",
      );
      return this.generateFallbackReference();
    }

    try {
      this.logger.log(`Generating Multicaixa reference for amount: ${amount}`);

      const response = await fetch(`${this.apiUrl}/references`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
          "X-Merchant-Id": this.merchantId,
        },
        body: JSON.stringify({
          amount,
          merchantId: this.merchantId,
          currency: "AOA",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();

      // Expected response format: { reference: string, entityId: string, fullReference?: string }
      if (data.fullReference) {
        return data.fullReference;
      }

      if (data.reference) {
        // If reference doesn't start with merchantId, prepend it
        if (String(data.reference).startsWith(this.merchantId)) {
          return String(data.reference);
        }
        return `${this.merchantId}${data.reference}`;
      }

      throw new Error("Invalid response format: missing reference");
    } catch (error: any) {
      this.logger.error(
        `Failed to generate Multicaixa reference: ${error.message}`,
      );
      // Fallback on error to ensure payment creation doesn't fail
      return this.generateFallbackReference();
    }
  }

  private generateFallbackReference(): string {
    // Fallback: entity + random 9 digits
    const ref = String(Math.floor(Math.random() * 999999999)).padStart(9, "0");
    return `${this.merchantId}${ref}`;
  }
}
