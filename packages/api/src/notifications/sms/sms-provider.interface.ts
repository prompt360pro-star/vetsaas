export interface NotificationResult {
    success: boolean;
    messageId?: string;
    provider?: string;
    error?: string;
}

export interface ISmsProvider {
    send(phone: string, body: string, tenantId: string): Promise<NotificationResult>;
}
