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
    <button disabled={pending} className={`button ${className}`}>
      {pending ? states[1] : states[0]}
    </button>
  );
}
