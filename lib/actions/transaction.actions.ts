"use server";

import { redirect } from "next/navigation";
import Transaction from "../database/models/transaction.model";
import { connectToDatabase } from "../database/mongoose";
import Stripe from "stripe";
import { updateCredits } from "./user.actions";
import { handleError } from "../utils";

export async function checkoutCredits(transaction: CheckoutTransactionParams) {
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

  const amount = Number(transaction.amount) * 100;

  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "usd",
          unit_amount: amount,
          product_data: {
            name: transaction.plan,
          },
        },
        quantity: 1,
      },
    ],
    metadata: {
      plan: transaction.plan,
      credits: transaction.credits,
      buyerId: transaction.buyerId,
    },
    mode: "payment",
    success_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/profile`,
    cancel_url: `${process.env.NEXT_PUBLIC_SERVER_URL}/`,
  });

  redirect(session.url!);
}

export async function createTransaction(transaction: CreateTransactionParams) {
  try {
    await connectToDatabase();

    const newTransaction = await Transaction.create({
      ...transaction,
      buyer: transaction.buyerId,
    });

    // ✅ FIXED: Only pass number of credits
    await updateCredits(transaction.credits);

    return JSON.parse(JSON.stringify(newTransaction));
  } catch (error) {
    handleError(error);
  }
}
