import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest } from "next/server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { checkAccountsTable } from "@/utils";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/dashboard";

  let errorMsg;
  if (token_hash && type) {
    const supabase = createClient();

    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash,
    });

    // Create account row for the user
    const user = await supabase.auth.getUser();
    if (!error && user.data.user !== null) {
      const result = await checkAccountsTable();
      if (result.error === null) {
        // redirect user to specified redirect URL or root of app
        redirect(next);
      } else {
        errorMsg = result.error;
        console.error(errorMsg, errorMsg);
      }
    } else {
      errorMsg = "Error verifying OTP or user not found";
      console.error(errorMsg, error, user);
    }
  } else {
    errorMsg = "Require auth parameters not present";
  }

  // redirect the user to an error page with some instructions
  redirect(`/error?message=${errorMsg}`);
}
