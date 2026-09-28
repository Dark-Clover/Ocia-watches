"use client";

import { useSyncExternalStore } from "react";

/** Signals that the intro (preloader) has finished, so hero choreography can begin. */
let ready = false;
const listeners = new Set<() => void>();

export function markReady() {
  if (ready) return;
  ready = true;
  listeners.forEach((l) => l());
}

export function useSiteReady() {
  return useSyncExternalStore(
    (l) => {
      listeners.add(l);
      return () => listeners.delete(l);
    },
    () => ready,
    () => false,
  );
}
