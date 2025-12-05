import { useEffect } from "react";

export default function useAutoSave(callback, delay = 2000) {
  useEffect(() => {
    const interval = setInterval(() => {
      callback();
    }, delay);

    return () => clearInterval(interval);
  }, [callback, delay]);
}
