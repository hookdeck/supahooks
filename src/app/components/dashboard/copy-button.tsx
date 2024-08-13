"use client";

import { useState } from "react";

export function CopyButton({
  text,
  value,
  className,
}: {
  text: string;
  value: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <>
      <button
        className={`button w-[80px] ${className}`}
        onClick={async (e) => {
          e.preventDefault();
          await navigator.clipboard.writeText(value);
          setCopied(true);

          setTimeout(() => {
            setCopied(false);
          }, 2000);
        }}
      >
        {text}
      </button>
      {copied && <p className="text-green-500">Copied</p>}
    </>
  );
}
