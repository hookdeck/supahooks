"use client";

import { ReactElement } from "react";
import { useFormStatus } from "react-dom";

export function FormButton({
  states,
  className,
}: {
  states: [string | ReactElement, string | ReactElement];
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      className={`bg-slate-700 p-1 rounded-md cursor-pointer h-full w-[80px] ${className}`}
    >
      {pending ? states[1] : states[0]}
    </button>
  );
}
