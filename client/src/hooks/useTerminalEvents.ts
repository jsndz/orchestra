import { useEffect } from "react";
import { terminalService } from "../lib/terminalService";

export function useTerminalEvents() {
  useEffect(() => {
    const unsubscribe = window.api.onExecutionEvent((event) => {
      const { id, data } = event;
      console.log(event);
      
      terminalService.write(id, data);
    });

    return unsubscribe;
  }, []);
}