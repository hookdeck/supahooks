import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";

import { getWebhookSubscriptions } from "@/utils/hookdeck";

import { AccountBar } from "@/app/components/dashboard/account-bar";
import WebhookTestButton from "@/app/components/dashboard/webhook-test-button";
import WebhookDeleteButton from "@/app/components/dashboard/webhook-delete-button";
import { EventsTable } from "@/app/components/dashboard/events-table";

import Link from "next/link";
import { TestEditor } from "@/app/components/dashboard/test-editor";

export default async function Dashboard({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    redirect("/login");
  }

  if (!params.id) {
    redirect("/dashboard");
  }

  const user = data.user;

  let subscriptions = await getWebhookSubscriptions({
    userId: user.id,
    id: params.id,
  });

  if (subscriptions.length > 1) {
    console.warn("More than one subscription for the same ID");
  }

  const subscription = subscriptions[0];

  return (
    <div className="w-full h-full flex flex-col justify-left items-start flex-grow">
      <AccountBar user={user} />

      <div className="mt-8">
        <span>
          &gt; <Link href="/dashboard">Dashboard</Link>
        </span>
        <span>
          {" "}
          &gt;{" "}
          <span className="font-mono">
            {subscription.connection.destination.url}
          </span>
        </span>
      </div>

      <section className="section">
        <div className="flex flex-row items-center mb-4 gap-4">
          <h2 className="text-xl font-mono">
            {subscription.connection.destination.url}
          </h2>
          <WebhookDeleteButton subscription={subscription} />
        </div>

        <TestEditor
          subscription={subscription}
          json={{
            exampleString: "payload",
            exampleBool: true,
            exampleInt: 99,
          }}
        />
      </section>

      <section className="section">
        <EventsTable subscription={subscription} />
      </section>
    </div>
  );
}
