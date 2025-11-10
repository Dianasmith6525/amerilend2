/**
 * Stripe Payment Integration
 * Handles credit card payment processing using Stripe
 */

import Stripe from "stripe";
import { ENV } from "./env";

/**
 * Initialize Stripe with secret key
 */
function getStripeInstance() {
  if (!ENV.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY environment variable is not set");
  }
  return new Stripe(ENV.STRIPE_SECRET_KEY);
}

/**
 * Stripe configuration from environment
 */
export function getStripeConfig() {
  return {
    secretKey: ENV.STRIPE_SECRET_KEY,
    publishableKey: ENV.STRIPE_PUBLISHABLE_KEY,
  };
}

/**
 * Create a payment intent for Stripe
 * @param amount Amount in cents (e.g., 575 for $5.75)
 * @param description Payment description
 * @param customerId Optional customer ID
 */
export async function createStripePaymentIntent(
  amount: number,
  description: string,
  customerId?: string
) {
  const config = getStripeConfig();

  if (!config.secretKey || !config.publishableKey) {
    return {
      success: false,
      error: "Stripe configuration missing",
    };
  }

  try {
    const stripe = getStripeInstance();
    
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
      description,
      ...(customerId && { customer: customerId }),
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return {
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("Stripe error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment processing failed",
    };
  }
}

/**
 * Retrieve payment intent status
 */
export async function getStripePaymentIntent(paymentIntentId: string) {
  const config = getStripeConfig();

  if (!config.secretKey) {
    return {
      success: false,
      error: "Stripe configuration missing",
    };
  }

  try {
    const stripe = getStripeInstance();
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      success: true,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      paymentIntentId: paymentIntent.id,
    };
  } catch (error) {
    console.error("Stripe retrieve error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Confirm payment intent (called after client-side payment confirmation)
 */
export async function confirmStripePayment(paymentIntentId: string) {
  const config = getStripeConfig();

  if (!config.secretKey) {
    return {
      success: false,
      error: "Stripe configuration missing",
    };
  }

  try {
    const stripe = getStripeInstance();
    
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    if (paymentIntent.status === "succeeded") {
      return {
        success: true,
        status: "succeeded",
        amount: paymentIntent.amount,
      };
    }
    
    return {
      success: false,
      error: `Payment status: ${paymentIntent.status}`,
    };
  } catch (error) {
    console.error("Stripe confirmation error:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Payment confirmation failed",
    };
  }
}

/**
 * Get Stripe publishable key for frontend
 */
export function getStripePublishableKey() {
  const config = getStripeConfig();
  return config.publishableKey || "";
}
