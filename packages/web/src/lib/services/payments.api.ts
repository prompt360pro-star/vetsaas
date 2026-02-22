import { api } from '../api-client';

export interface CreateInvoiceInput {
    tutorId: string;
    tutorName: string;
    items: {
        description: string;
        quantity: number;
        unitPrice: number;
    }[];
    dueDate?: string;
    notes?: string;
    taxRate?: number;
}

export interface InvoiceResponse {
    id: string;
    total: number;
    status: string;
    invoiceNumber: string;
}

export interface CreatePaymentInput {
    invoiceId?: string;
    amount: number;
    method: string;
    gateway?: string;
    description?: string;
    tutorName?: string;
    metadata?: Record<string, unknown>;
}

export interface PaymentResponse {
    id: string;
    amount: number;
    status: string;
    referenceCode?: string;
}

export const paymentsApi = {
    createInvoice: (data: CreateInvoiceInput) => api.post<InvoiceResponse>('/invoices', data),
    createPayment: (data: CreatePaymentInput) => api.post<PaymentResponse>('/payments', data),
    markInvoiceAsPaid: (id: string, paymentId: string) => api.patch<void>(`/invoices/${id}/pay`, { paymentId }),
};
