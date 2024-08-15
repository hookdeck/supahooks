import WebhookRegistrationForm from "../components/dashboard/webhook-registrations-from";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { getWebhookSubscriptions } from "@/utils/hookdeck";
import WebhookDeleteButton from "../components/dashboard/webhook-delete-button";
import { AccountBar } from "../components/dashboard/account-bar";
import Link from "next/link";

export default async function Dashboard() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const user = data.user;

  const allSubscriptions = await getWebhookSubscriptions({
    userId: user.id,
  });

  // getSubscriptions current does a fuzzy match so make sure the subscriptions are for the current user
  const subscriptions = allSubscriptions.filter((subscription) =>
    subscription.connection.name!.startsWith(`conn_${user.id}__`)
  );

  if (allSubscriptions.length !== subscriptions.length) {
    console.warn(
      "Had to filter subscriptions.",
      "All subscriptions:",
      allSubscriptions.length,
      "Filtered subscriptions:",
      subscriptions.length
    );
  }

  return (
    <div className="w-full h-full flex flex-col justify-left items-start flex-grow">
      <AccountBar user={user} />

      <div className="mt-8">
        <span>
          &gt; <Link href="/dashboard">Dashboard</Link>
        </span>
      </div>

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
                  <tr key={subscription.connection.id}>
                    <td className="py-2">
                      {subscription.connection.destination.url}
                    </td>
                    <td className="flex flex-row gap-2">
                      <Link
                        href={`/dashboard/webhooks/${subscription.connection.id}`}
                        className="button no-underline p-2"
                      >
                        View
                      </Link>
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
