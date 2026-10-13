"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "../../lib/admin-auth";
import { isValidMonth } from "../../lib/admin";
import { isUuidV4 } from "../../lib/users";

// Marca (ou desmarca) um mês como pago a um produtor
export async function setMonthPaid(producerId: string, month: string, paid: boolean) {
  const supabase = await requireAdmin();
  if (!isUuidV4(producerId) || !isValidMonth(month)) return;

  if (paid) {
    await supabase
      .from("producer_payments")
      .upsert({ id_producer: producerId, month }, { onConflict: "id_producer,month" });
  } else {
    await supabase
      .from("producer_payments")
      .delete()
      .eq("id_producer", producerId)
      .eq("month", month);
  }

  revalidatePath("/gestao");
  revalidatePath(`/admin/${producerId}`);
}
