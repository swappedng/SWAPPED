"use server";

import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function revalidateTradeIn() {
  const session = await getServerSession(authOptions);
  if (session?.user?.isAdmin !== true) {
    throw new Error("Unauthorized");
  }

  revalidatePath("/tradein");
}
