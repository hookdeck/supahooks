"use client";

import { WebhookSubscription } from "@/types";
import WebhookTestButton from "./webhook-test-button";
import { useState } from "react";
import { FaRegCircleXmark, FaRegCircleCheck } from "react-icons/fa6";

export function TestEditor({
  subscription,
  json,
}: {
  subscription: WebhookSubscription;
  json: unknown;
}) {
  const testJson = (test: string) => {
    try {
      JSON.parse(test);
      return true;
    } catch (e) {
      return false;
    }
  };

  const [editorJson, setEditorJson] = useState(json);
  const [validJson, setValidJson] = useState(true);

  const handleEditorChange: React.KeyboardEventHandler<HTMLPreElement> = (
    e
  ) => {
    const text = e.currentTarget.innerText;
    const validJson = testJson(text);
    setValidJson(validJson);
    if (validJson) {
      setEditorJson(JSON.parse(text));
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="relative">
        <div className="border border-gray-30 rounded-md">
          <pre
            contentEditable
            suppressContentEditableWarning={true}
            className="w-full p-4"
            onKeyUp={handleEditorChange}
          >
            {JSON.stringify(editorJson, null, 2)}
          </pre>
        </div>
        <WebhookTestButton
          subscription={subscription}
          headers={{}}
          body={editorJson}
          disabled={!validJson}
          className="h-auto w-[80px] absolute right-[10px] bottom-[10px]"
        />
      </div>
      <p>
        {validJson ? (
          <span>
            <FaRegCircleCheck className="text-green-600 inline mr-2" />
            JSON syntax valid
          </span>
        ) : (
          <span>
            <FaRegCircleXmark className="text-red-600 inline mr-2" />
            JSON syntax parsing error
          </span>
        )}
      </p>
    </div>
  );
}
