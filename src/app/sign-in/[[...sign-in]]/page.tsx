"use client";
import { SignIn } from "@clerk/nextjs";
import { useSearchParams } from "next/navigation";

export default function Page() {
  const params = useSearchParams();
  const redirectUrl = params.get("redirect_url") || undefined;
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <SignIn routing="hash" redirectUrl={redirectUrl} />
    </div>
  );
}
