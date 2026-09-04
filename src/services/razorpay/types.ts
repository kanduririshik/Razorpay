export interface RazorpayPaymentLinkRequest {
  amount: number;
  currency: string;
  description: string;
  customer: {
    name: string;
    email: string;
    contact: string;
  };
  notify: {
    sms: boolean;
    email: boolean;
    whatsapp: boolean;
  };
  reminder_enable: boolean;
  notes?: Record<string, string>;
}

export interface RazorpayPaymentLinkResponse {
  id: string;
  short_url: string;
  status: "created" | "paid" | "expired";
  amount: number;
  currency: string;
  description: string;
  customer: {
    name: string;
    email: string;
    contact: string;
  };
  created_at: number;
}

export interface RazorpayRetryPaymentRequest {
  paymentId: string;
  customerId: string;
  amount: number;
  method: string;
}

export interface RazorpayRetryPaymentResponse {
  success: boolean;
  retryId: string;
  message: string;
  status: "captured" | "failed" | "pending";
}

export interface IRazorpayService {
  createPaymentLink(request: RazorpayPaymentLinkRequest): Promise<RazorpayPaymentLinkResponse>;
  retryPayment(request: RazorpayRetryPaymentRequest): Promise<RazorpayRetryPaymentResponse>;
  getPaymentDetails(paymentId: string): Promise<Record<string, unknown>>;
  isLiveMode(): boolean;
}
