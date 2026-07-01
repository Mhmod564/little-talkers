import { PageSkeleton } from "@/components/ui/PageSkeleton";

// Shown instantly while any therapist section's data loads (Suspense fallback).
export default function Loading() {
  return <PageSkeleton />;
}
