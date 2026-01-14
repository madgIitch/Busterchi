"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    __bustergochiUpdate?: () => void;
  }
}

export default function ServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    let isMounted = true;

    const register = async () => {
      try {
        const registration = await navigator.serviceWorker.register("/sw.js");
        await registration.update();

        const exposeUpdate = () => {
          const waiting = registration.waiting;
          if (!waiting) {
            return;
          }
          window.__bustergochiUpdate = () => {
            waiting.postMessage({ type: "SKIP_WAITING" });
          };
        };

        if (registration.waiting) {
          exposeUpdate();
        }

        registration.addEventListener("updatefound", () => {
          const installing = registration.installing;
          if (!installing) {
            return;
          }
          installing.addEventListener("statechange", () => {
            if (
              installing.state === "installed" &&
              navigator.serviceWorker.controller
            ) {
              exposeUpdate();
            }
          });
        });

        const handleVisibility = () => {
          if (document.visibilityState === "visible") {
            registration.update();
          }
        };

        document.addEventListener("visibilitychange", handleVisibility);

        return () => {
          document.removeEventListener("visibilitychange", handleVisibility);
        };
      } catch {
        // Ignore SW registration errors.
      }
    };

    let cleanup: (() => void) | undefined;
    register().then((fn) => {
      if (isMounted) {
        cleanup = fn;
      }
    });

    const handleControllerChange = () => {
      if (isMounted) {
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener(
      "controllerchange",
      handleControllerChange,
    );

    return () => {
      isMounted = false;
      cleanup?.();
      navigator.serviceWorker.removeEventListener(
        "controllerchange",
        handleControllerChange,
      );
    };
  }, []);

  return null;
}
