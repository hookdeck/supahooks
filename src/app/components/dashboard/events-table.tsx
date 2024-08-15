"use client";

import { triggerTestWebhook } from "@/app/dashboard/actions";
import { Hookdeck } from "@hookdeck/sdk";
import dayjs from "dayjs";
import { Fragment, useCallback, useEffect, useState } from "react";
import { FaArrowRotateRight } from "react-icons/fa6";
import { FaAngleRight, FaAngleDown } from "react-icons/fa";

import { FormButton } from "./form-button";
import { stripWebhookHeaders } from "@/utils";
import { WebhookSubscription } from "@/types";
import WebhookTestButton from "./webhook-test-button";

export function EventsTable({
  subscription,
}: {
  subscription: WebhookSubscription;
}) {
  const [loading, setLoading] = useState(true);
  const [eventList, setEventList] = useState<Hookdeck.Event[]>([]);
  const [attemptsList, setAttemptsList] = useState<Hookdeck.EventAttempt[]>([]);
  const [showEventDetailsId, setShowEventDetailsId] = useState<string | null>(
    null
  );
  const [tabSelected, setTabSelected] = useState<"REQUEST" | "RESPONSE">(
    "REQUEST"
  );

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    const response = await fetch(
      `/api/events?id=${subscription.connection.id}`
    );
    const events = await response.json();
    setEventList(events);
    setLoading(false);
  }, [subscription.connection.id]);

  const fetchAttempts = useCallback(async (id: string) => {
    setLoading(true);
    const response = await fetch(`/api/attempts?id=${id}`);
    const attempts = await response.json();
    setAttemptsList(attempts);
    setLoading(false);
  }, []);

  const showEventDetails = (id: string) => {
    const showEventId = showEventDetailsId === id ? null : id;
    setShowEventDetailsId(showEventId);
    setAttemptsList([]);
    setTabSelected("REQUEST");
    if (showEventId) {
      fetchAttempts(showEventId);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <>
      <div className="flex items-start gap-2">
        <h2 className="text-xl mb-4">Events</h2>
        <button
          onClick={fetchEvents}
          className={`button`}
          disabled={loading}
          title="Refresh"
        >
          <FaArrowRotateRight className={loading ? "animate-spin" : ""} />
        </button>
      </div>
      {eventList.length === 0 && loading && <p>Loading...</p>}
      {!loading && eventList.length === 0 && <p>No events</p>}
      {eventList.length > 0 && (
        <table
          className={`w-full text-left inline-table ${loading && "opacity-50"}`}
        >
          <thead>
            <tr className="h-[30px]">
              <th>Created</th>
              <th>ID</th>
              <th>Delivery Attempts</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {eventList.map((event) => (
              <Fragment key={event.id}>
                <tr
                  className="odd:bg-slate-500 cursor-pointer hover:bg-slate-400 h-[30px]"
                  onClick={() => {
                    showEventDetails(event.id);
                  }}
                >
                  <td className="flex flex-row items-center gap-2">
                    {showEventDetailsId === event.id ? (
                      <FaAngleDown />
                    ) : (
                      <FaAngleRight />
                    )}
                    <span>
                      {dayjs(event.createdAt)
                        .locale("en")
                        .format("DD/MM/YYYY HH:mm:ss")}
                    </span>
                  </td>
                  <td>{event.id}</td>
                  <td>{event.attempts}</td>
                  <td>
                    {event.responseStatus && event.responseStatus >= 200 && (
                      <span className="bg-green-700 rounded-md px-1">
                        {event.responseStatus}
                      </span>
                    )}
                    {event.responseStatus && event.responseStatus >= 300 && (
                      <span className="bg-red-700 rounded-md px-1">
                        {event.responseStatus}
                      </span>
                    )}
                  </td>
                </tr>
                {showEventDetailsId === event.id && (
                  <tr className="border-l-2 border-l-slate-600">
                    <td colSpan={4}>
                      <div className="flex flex-col gap-2 w-full mb-6 pl-2">
                        <h3 className="text-lg mt-4">Event</h3>
                        <div className="flex flex-row gap-2">
                          <button
                            className={`button ${
                              tabSelected !== "REQUEST" ? "opacity-50" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              setTabSelected("REQUEST");
                            }}
                          >
                            Request
                          </button>
                          <button
                            className={`button ${
                              tabSelected !== "RESPONSE" ? "opacity-50" : ""
                            }`}
                            onClick={(e) => {
                              e.preventDefault();
                              setTabSelected("RESPONSE");
                            }}
                          >
                            Delivery Attempt Responses ({event.attempts})
                          </button>
                        </div>
                        <div
                          className={`relative ${
                            tabSelected === "REQUEST" ? "" : "hidden"
                          }`}
                        >
                          <WebhookTestButton
                            className="absolute top-0 right-0 button h-[50px] m-4 z-10"
                            buttonStates={["Resend", "Resending..."]}
                            subscription={subscription}
                            headers={stripWebhookHeaders(
                              (event.data as any)?.headers
                            )}
                            body={(event.data as any).body}
                          />

                          <h4>Webhook HTTP Headers</h4>
                          <div className="bg-slate-600 p-2 rounded-md text-white overflow-auto relative mb-2">
                            <pre className="w-[800px]">
                              {JSON.stringify(
                                stripWebhookHeaders(
                                  (event.data as any)?.headers
                                ),
                                null,
                                2
                              )}
                            </pre>
                          </div>
                          <h4>Webhook Body</h4>
                          <div className="bg-slate-600 p-2 rounded-md text-white overflow-auto relative mb-2">
                            <pre className="w-[800px]">
                              {JSON.stringify(
                                (event.data as any).body,
                                null,
                                2
                              )}
                            </pre>
                          </div>
                        </div>
                        <div
                          className={tabSelected === "RESPONSE" ? "" : "hidden"}
                        >
                          {attemptsList.map((attempt) => (
                            <>
                              <h4 className="text-lg">
                                Delivery Attempt {attempt.attemptNumber}
                              </h4>
                              <div>
                                {/* Hookdeck does not presently store response headers */}
                                {/* <h5>Response HTTP Headers</h5>
                                <div className="bg-slate-600 p-2 rounded-md text-white overflow-auto relative mb-2">
                                  <pre className="w-[800px]">
                                    {JSON.stringify(
                                      (attempt.body as any)?.received_data
                                        ?.headers,
                                      null,
                                      2
                                    )}
                                  </pre>
                                </div> */}
                                <h5 className="text-base">Response Body</h5>
                                <div className="bg-slate-600 p-2 rounded-md text-white overflow-auto relative mb-2">
                                  <pre className="w-[800px]">
                                    {JSON.stringify(attempt.body, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </>
                          ))}
                        </div>
                      </div>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
