import Terminal from "./Terminal";
export const TerminalPage = () => {
  return (
    <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 overflow-auto h-full">
      <Terminal terminalId="1" status="running" name="Terminal 1" />
    </div>
  );
};
