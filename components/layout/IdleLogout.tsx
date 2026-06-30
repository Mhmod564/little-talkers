"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import { signOut } from "@/app/actions/auth";

const IDLE_MS = 5 * 60 * 1000; // 5 minutes, matches the prototype

/** Signs the user out after 5 minutes of no interaction. */
export function IdleLogout() {
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    async function logout() {
      await signOut();
      router.replace("/login");
      router.refresh();
    }
    function reset() {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(logout, IDLE_MS);
    }
    const events = ["mousemove", "mousedown", "keydown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    reset();
    return () => {
      if (timer.current) clearTimeout(timer.current);
      events.forEach((e) => window.removeEventListener(e, reset));
    };
  }, [router]);

  return null;
}
