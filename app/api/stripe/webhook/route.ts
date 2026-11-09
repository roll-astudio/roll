import type Stripe from "stripe";
import { fulfillCheckoutSession, getStripe } from "../../../../lib/stripe";

// Recebe eventos do Stripe. É aqui que a compra fica registada.
export async function POST(request: Request) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const signature = request.headers.get("stripe-signature");
  if (!secret || !signature) return new Response("Missing signature", { status: 400 });

  let event: Stripe.Event;
  try {
    // A assinatura é validada sobre o corpo em bruto
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret);
  } catch (error) {
    return new Response(`Webhook error: ${(error as Error).message}`, { status: 400 });
  }

  try {
    if (
      event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded"
    ) {
      await fulfillCheckoutSession(event.data.object);
    }
  } catch (error) {
    console.error("Stripe webhook", error);
    // 500 faz o Stripe repetir o envio
    return new Response("Fulfillment failed", { status: 500 });
  }

  return new Response("ok", { status: 200 });
}
