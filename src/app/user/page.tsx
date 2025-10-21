"use client";
import { UserProfile } from "@clerk/nextjs";

export default function UserPage() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center p-4">
      <UserProfile routing="hash" />
    </div>
  );
}
