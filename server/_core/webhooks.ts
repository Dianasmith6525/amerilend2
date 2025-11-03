/**
 * Payment webhook handlers
 * Handles webhook notifications from payment providers (Authorize.net, Coinbase Commerce)
 */

import type express from "express";
import { validateAuthorizeNetWebhook } from "./authorizenet";
import { validateCryptoWebhook, checkCryptoPaymentStatus } from "./crypto-payment";
import * as db from "../db";

type Request = express.Request;
type Response = express.Response;

/**
 * Handle Authorize.net webhook notifications
 * Validates signature and processes payment status updates
 */
export async function handleAuthorizeNetWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers["x-anet-signature"] as string;
    const payload = JSON.stringify(req.body);
    const signatureKey = process.env.AUTHORIZENET_SIGNATURE_KEY || "";

    // Validate webhook signature
    if (!signature || !validateAuthorizeNetWebhook(signature, payload, signatureKey)) {
      console.warn("[Webhook] Invalid Authorize.net signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = req.body;
    console.log("[Webhook] Authorize.net event:", event.eventType);

    // Process based on event type
    switch (event.eventType) {
      case "net.authorize.payment.authorization.created":
      case "net.authorize.payment.authcapture.created":
        await handlePaymentSuccess(event);
        break;

      case "net.authorize.payment.capture.created":
        await handlePaymentCapture(event);
        break;

      case "net.authorize.payment.void.created":
      case "net.authorize.payment.refund.created":
        await handlePaymentCancellation(event);
        break;

      default:
        console.log("[Webhook] Unhandled event type:", event.eventType);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing Authorize.net webhook:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

/**
 * Handle Coinbase Commerce webhook notifications
 * Validates signature and processes crypto payment status updates
 */
export async function handleCryptoWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers["x-cc-webhook-signature"] as string;
    const payload = JSON.stringify(req.body);

    // Validate webhook signature
    if (!signature || !validateCryptoWebhook(signature, payload)) {
      console.warn("[Webhook] Invalid crypto payment signature");
      return res.status(401).json({ error: "Invalid signature" });
    }

    const event = req.body.event;
    console.log("[Webhook] Crypto payment event:", event.type);

    // Process based on event type
    switch (event.type) {
      case "charge:confirmed":
      case "charge:completed":
        await handleCryptoPaymentConfirmed(event.data);
        break;

      case "charge:failed":
        await handleCryptoPaymentFailed(event.data);
        break;

      case "charge:delayed":
        console.log("[Webhook] Crypto payment delayed, waiting for confirmations");
        break;

      case "charge:pending":
        console.log("[Webhook] Crypto payment pending");
        break;

      default:
        console.log("[Webhook] Unhandled crypto event type:", event.type);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("[Webhook] Error processing crypto webhook:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
}

/**
 * Handle successful card payment
 */
async function handlePaymentSuccess(event: any) {
  const transactionId = event.payload.id;
  const amount = Math.round(parseFloat(event.payload.authAmount) * 100); // Convert to cents

  // Find payment by transaction ID
  const payment = await db.getPaymentByTransactionId(transactionId);
  
  if (!payment) {
    console.warn("[Webhook] Payment not found for transaction:", transactionId);
    return;
  }

  if (payment.status === "succeeded") {
    console.log("[Webhook] Payment already processed:", transactionId);
    return;
  }

  // Update payment status
  await db.updatePaymentStatus(payment.id, "succeeded", {
    completedAt: new Date(),
  });

  // Update loan application status to fee_paid
  await db.updateLoanApplicationStatus(payment.loanApplicationId, "fee_paid");

  console.log("[Webhook] Payment successful:", transactionId);
}

/**
 * Handle payment capture (for auth-only transactions)
 */
async function handlePaymentCapture(event: any) {
  const transactionId = event.payload.id;
  
  const payment = await db.getPaymentByTransactionId(transactionId);
  
  if (!payment) {
    console.warn("[Webhook] Payment not found for capture:", transactionId);
    return;
  }

  await db.updatePaymentStatus(payment.id, "succeeded", {
    completedAt: new Date(),
  });

  await db.updateLoanApplicationStatus(payment.loanApplicationId, "fee_paid");

  console.log("[Webhook] Payment captured:", transactionId);
}

/**
 * Handle payment cancellation (void or refund)
 */
async function handlePaymentCancellation(event: any) {
  const transactionId = event.payload.id;
  
  const payment = await db.getPaymentByTransactionId(transactionId);
  
  if (!payment) {
    console.warn("[Webhook] Payment not found for cancellation:", transactionId);
    return;
  }

  await db.updatePaymentStatus(payment.id, "cancelled", {
    failureReason: "Payment voided or refunded",
  });

  console.log("[Webhook] Payment cancelled:", transactionId);
}

/**
 * Handle confirmed crypto payment
 */
async function handleCryptoPaymentConfirmed(chargeData: any) {
  const chargeId = chargeData.id;
  
  // Find payment by charge ID
  const payment = await db.getPaymentByCryptoChargeId(chargeId);
  
  if (!payment) {
    console.warn("[Webhook] Payment not found for crypto charge:", chargeId);
    return;
  }

  if (payment.status === "succeeded") {
    console.log("[Webhook] Crypto payment already processed:", chargeId);
    return;
  }

  // Extract transaction hash from blockchain
  const txHash = chargeData.timeline?.find((t: any) => 
    t.status === "COMPLETED" || t.status === "CONFIRMED"
  )?.payment?.transaction_id;

  // Update payment status
  await db.updatePaymentStatus(payment.id, "succeeded", {
    cryptoTxHash: txHash,
    completedAt: new Date(),
  });

  // Update loan application status to fee_paid
  await db.updateLoanApplicationStatus(payment.loanApplicationId, "fee_paid");

  console.log("[Webhook] Crypto payment confirmed:", chargeId, "tx:", txHash);
}

/**
 * Handle failed crypto payment
 */
async function handleCryptoPaymentFailed(chargeData: any) {
  const chargeId = chargeData.id;
  
  const payment = await db.getPaymentByCryptoChargeId(chargeId);
  
  if (!payment) {
    console.warn("[Webhook] Payment not found for failed crypto charge:", chargeId);
    return;
  }

  await db.updatePaymentStatus(payment.id, "failed", {
    failureReason: "Crypto payment failed or expired",
  });

  console.log("[Webhook] Crypto payment failed:", chargeId);
}
