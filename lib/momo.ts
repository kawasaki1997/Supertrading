import crypto from "crypto";
import { MOMO_CONFIG } from "./momo-config";

export function generateMoMoSignature(data: Record<string, string>): string {
  const rawSignature = Object.keys(data)
    .sort()
    .map((key) => `${key}=${data[key]}`)
    .join("&");

  return crypto
    .createHmac("sha256", MOMO_CONFIG.SECRET_KEY)
    .update(rawSignature)
    .digest("hex");
}

export interface MoMoPaymentRequest {
  orderId: string;
  amount: number;
  orderInfo: string;
  requestId: string;
}

export async function createMoMoPayment(req: MoMoPaymentRequest) {
  const {
    PARTNER_CODE,
    ACCESS_KEY,
    ENDPOINT,
    REDIRECT_URL,
    IPN_URL,
    REQUEST_TYPE,
  } = MOMO_CONFIG;

  const signatureData = {
    accessKey: ACCESS_KEY,
    amount: req.amount.toString(),
    extraData: "",
    ipnUrl: IPN_URL,
    orderId: req.orderId,
    orderInfo: req.orderInfo,
    partnerCode: PARTNER_CODE,
    redirectUrl: REDIRECT_URL,
    requestId: req.requestId,
    requestType: REQUEST_TYPE,
  };

  const signature = generateMoMoSignature(signatureData);

  const requestBody = {
    ...signatureData,
    signature,
    lang: "vi",
  };

  const response = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`MoMo API error: ${response.status}`);
  }

  return await response.json();
}

export function verifyMoMoSignature(data: Record<string, string>): boolean {
  const { signature, ...rest } = data;
  const expectedSignature = generateMoMoSignature(rest);
  return signature === expectedSignature;
}
