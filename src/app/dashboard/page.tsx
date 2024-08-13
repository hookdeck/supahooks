import WebhookTestButton from "../components/dashboard/webhook-test-button";
import WebhookRegistrationForm from "../components/dashboard/webhook-registrations-from";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { CopyButton } from "../components/dashboard/copy-button";
import { getWebhookSubscriptions } from "@/utils/hookdeck";
import WebhookDeleteButton from "../components/dashboard/webhook-delete-button";

export default async function Dashboard() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const account = await supabase
    .from("accounts")
    .select("webhook_secret")
    .single();
  if (account.error) {
    redirect(`/error?message=Account not found`);
  }

  const user = data.user;

  let subscriptions = await getWebhookSubscriptions({
    userId: user.id,
  });

  // getSubscriptions current does a fuzzy match so make sure the subscriptions are for the current user
  subscriptions = subscriptions.filter((subscription) =>
    subscription.channelName.startsWith(`${user.id}__`)
  );

  return (
    <div className="w-full h-full flex flex-col justify-left items-start flex-grow">
      <section className="flex flex-col gap-2">
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

      <section className="w-full mt-10 border-slate-700 border-2 p-10 rounded-md">
        <h2 className="text-xl mb-4">Register a new webhook</h2>
        <WebhookRegistrationForm userId={user.id} />
      </section>

      <section className="w-full mt-10 border-slate-700 border-2 p-10 rounded-md">
        <h2 className="text-xl mb-4">Your webhooks</h2>
        <div>
          {subscriptions.length === 0 && <p>No webhooks found</p>}
          {subscriptions.length > 0 && (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left">URL</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription.channelName}>
                    <td className="py-2">{subscription.url}</td>
                    <td className="flex flex-row gap-2">
                      <WebhookTestButton subscription={subscription} />
                      <WebhookDeleteButton subscription={subscription} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}
