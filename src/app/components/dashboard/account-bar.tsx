import { User } from "@supabase/supabase-js";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CopyButton } from "./copy-button";

export async function AccountBar({ user }: { user: User }) {
  const supabase = createClient();

  const account = await supabase
    .from("accounts")
    .select("webhook_secret")
    .single();

  if (account.error) {
    redirect(`/error?message=Account not found`);
  }

  return (
    <section className="flex flex-col gap-2 w-full pb-8 bottom-divider">
      <p>
        Welcome, <strong>{user.email}</strong> (
        <Link href="/logout">Logout</Link>
        ).
      </p>
      <form className="flex flex-row gap-6 w-full items-center">
        <div className="flex flex-row gap-4 items-center">
          <label htmlFor="url">Webhook Secret</label>
          <input
            type="password"
            value={account.data.webhook_secret}
            readOnly
            className="text-slate-900 min-w-[400px] rounded-md p-2 text-sm"
          />
          <CopyButton text="Copy" value={account.data.webhook_secret} />
        </div>
      </form>
    </section>
  );
}
