import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const body = await req.text();
  const h = await headers();
  const signature = h.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let event: any;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Webhook Error";
    console.error("Webhook signature verification failed:", msg);
    return NextResponse.json({ error: "Webhook Error" }, { status: 400 });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const userId = session.metadata?.userId;

      if (userId && session.subscription) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const subscription: any = await stripe.subscriptions.retrieve(
          session.subscription
        );

        await prisma.subscription.upsert({
          where: { userId },
          update: {
            isPro: true,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            stripePriceId: subscription.items.data[0]?.price?.id as string,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
          },
          create: {
            userId,
            isPro: true,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
            stripePriceId: subscription.items.data[0]?.price?.id as string,
            stripeCurrentPeriodEnd: new Date(
              subscription.current_period_end * 1000
            ),
          },
        });
      }
    } else if (event.type === "customer.subscription.updated") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscription: any = event.data.object;
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: subscription.customer as string },
        data: {
          isPro: subscription.status === "active",
          stripeCurrentPeriodEnd: new Date(
            subscription.current_period_end * 1000
          ),
        },
      });
    } else if (event.type === "customer.subscription.deleted") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const subscription: any = event.data.object;
      await prisma.subscription.updateMany({
        where: { stripeCustomerId: subscription.customer as string },
        data: { isPro: false },
      });
    }
  } catch (err) {
    console.error("Webhook handler error:", err);
    return NextResponse.json({ error: "Handler error" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}