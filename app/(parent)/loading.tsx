import { PageSkeleton } from "@/components/ui/PageSkeleton";

// Shown instantly while a parent section's data loads (Suspense fallback).
export default function Loading() {
  return <PageSkeleton />;
}
