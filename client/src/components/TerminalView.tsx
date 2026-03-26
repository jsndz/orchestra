import Terminal from "./Terminal";
import { useTerminals } from "../hooks/useTerminals";
export const TerminalPage = () => {
  const { state, registerTerminal } = useTerminals();

  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto h-full">
      {Object.values(state).map((t) => (
        <Terminal
          key={t.terminalId}
          terminalId={t.terminalId}
          status={t.status}
          name={t.name!}
          register={registerTerminal}
        />
      ))}
    </div>
  );
};