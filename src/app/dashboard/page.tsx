import { HookdeckPubSub } from "@hookdeck/pubsub";
import WebHookTestButton from "./webhook-test-button";
import WebhookRegistrationForm from "./webhook-registrations-from";
import { FormButton } from "./form-button";
import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

export default async function Dashboard() {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  const pubsub = new HookdeckPubSub({
    apiKey: process.env.HOOKDECK_API_KEY!,
  });

  const user = data.user;

  let subscriptions = await pubsub.getSubscriptions({
    name: user.id,
  });

  // getSubscriptions current does a fuzzy match so make sure the subscriptions are for the current user
  subscriptions = subscriptions.filter((subscription) =>
    subscription.channelName.startsWith(`${user.id}__`)
  );

  return (
    <div className="w-full h-full flex flex-col justify-left items-start flex-grow">
      <section>
        <p>
          Welcome, <strong>{user.email}</strong>.
        </p>
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
                  <th>URL</th>
                  <th>Auth</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {subscriptions.map((subscription) => (
                  <tr key={subscription.channelName}>
                    <td className="p-2">{subscription.url}</td>
                    <td>
                      {subscription.connection.destination.authMethod?.type}
                    </td>
                    <td className="flex flex-row gap-2">
                      <WebHookTestButton subscription={subscription} />
                      <FormButton
                        states={["Delete", "Deleting..."]}
                        className="cursor-not-allowed bg-red-700"
                      />
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
