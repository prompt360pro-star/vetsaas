// ============================================================================
// Payment Types (Angola-focused)
// ============================================================================

export interface PaymentDto {
    id: string;
    tenantId: string;
    invoiceId?: string;
    amount: number;
    currency: 'AOA';           // Kwanza
    method: PaymentMethod;
    gateway: PaymentGateway;
    status: PaymentStatus;
    referenceCode?: string;    // Multicaixa reference
    transactionId?: string;    // Gateway transaction ID
    paidAt?: Date;
    failedAt?: Date;
    failureReason?: string;
    metadata?: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}

export interface CreatePaymentDto {
    invoiceId?: string;
    amount: number;
    method: PaymentMethod;
    gateway: PaymentGateway;
    metadata?: Record<string, unknown>;
}

export type PaymentMethod =
    | 'MULTICAIXA_REFERENCE'   // Reference-based payment
    | 'MULTICAIXA_EXPRESS'     // Express payment
    | 'UNITEL_MONEY'           // Mobile money
    | 'BANK_TRANSFER'          // TPA / bank transfer
    | 'CASH'                   // Cash payment
    | 'POS'                    // Point of sale terminal
    | 'OTHER';

export type PaymentGateway =
    | 'MULTICAIXA_GPO'
    | 'UNITEL_MONEY'
    | 'MANUAL'
    | 'MOCK';

export type PaymentStatus =
    | 'PENDING'
    | 'PROCESSING'
    | 'COMPLETED'
    | 'FAILED'
    | 'REFUNDED'
    | 'CANCELLED'
    | 'EXPIRED';

export interface InvoiceDto {
    id: string;
    tenantId: string;
    tutorId: string;
    tutorName: string;
    invoiceNumber: string;
    items: InvoiceItem[];
    subtotal: number;
    tax: number;
    total: number;
    currency: 'AOA';
    status: InvoiceStatus;
    dueDate?: Date;
    paidAt?: Date;
    notes?: string;
    createdAt: Date;
}

export interface InvoiceItem {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
    category?: string;
}

export type InvoiceStatus =
    | 'DRAFT'
    | 'SENT'
    | 'PAID'
    | 'PARTIALLY_PAID'
    | 'OVERDUE'
    | 'CANCELLED';
