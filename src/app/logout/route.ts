import { createClient } from "@/utils/supabase/server";
import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";

export async function GET(request: NextRequest) {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    const errorMsg = "Error logging out";
    console.error(errorMsg, error);

    return redirect(`/error?message=${errorMsg}`);
  } else {
    return redirect(`/`);
  }
}
