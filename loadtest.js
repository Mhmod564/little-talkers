// k6 load test: therapist dashboard + patient profile (authenticated).
//
// Auth: reads a real Supabase session cookie from a file (minted by
// scratchpad/make-cookie.mjs). Pass it via -e COOKIE_FILE=...; the page
// requests send it so they render the real authenticated page (HTTP 200)
// instead of 307-redirecting to /login.
//
// Run (from project root):
//   k6 run -e COOKIE_FILE=scratch-auth-cookie.txt \
//          -e PATIENT_ID=<uuid> -e BASE_URL=http://localhost:3000 loadtest.js

import http from "k6/http";
import { check, group, sleep } from "k6";
import { Trend } from "k6/metrics";

const COOKIE = open(__ENV.COOKIE_FILE || "scratch-auth-cookie.txt").trim();
const BASE = __ENV.BASE_URL || "http://localhost:3000";
const PID = __ENV.PATIENT_ID;
if (!PID) throw new Error("set -e PATIENT_ID=<uuid>");

// per-page latency trends (the `true` enables time-formatted output)
const dashboard = new Trend("page_dashboard_ms", true);
const patient = new Trend("page_patient_ms", true);

export const options = {
  scenarios: {
    ramp_to_200: {
      executor: "ramping-vus",
      startVUs: 0,
      stages: [
        { duration: "20s", target: 200 }, // ramp up
        { duration: "60s", target: 200 }, // hold at 200 VUs
        { duration: "15s", target: 0 },   // ramp down
      ],
      gracefulStop: "10s",
    },
  },
  thresholds: {
    http_req_failed: ["rate<0.01"],                       // <1% errors
    "http_req_duration{page:dashboard}": ["p(95)<2000"],  // p95 under 2s
    "http_req_duration{page:patient}": ["p(95)<2000"],
    checks: ["rate>0.99"],
  },
};

function paramsFor(page) {
  return {
    headers: { Cookie: COOKIE },
    tags: { page },
    redirects: 0, // don't silently follow an auth redirect — count it as a miss
  };
}

export default function () {
  group("dashboard", () => {
    const res = http.get(`${BASE}/dashboard`, paramsFor("dashboard"));
    dashboard.add(res.timings.duration);
    check(res, {
      "dashboard status 200": (r) => r.status === 200,
      "dashboard not redirected to login": (r) => r.status !== 307,
    });
  });

  group("patient", () => {
    const res = http.get(`${BASE}/patients/${PID}`, paramsFor("patient"));
    patient.add(res.timings.duration);
    check(res, {
      "patient status 200": (r) => r.status === 200,
      "patient not redirected to login": (r) => r.status !== 307,
    });
  });

  sleep(1); // ~1s think-time between iterations
}
