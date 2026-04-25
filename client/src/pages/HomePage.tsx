import { useNavigate } from "react-router-dom";
import UploadYaml from "../components/UploadYaml";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-[32px] bg-background text-foreground">

      {/* Center */}
      <div className="w-full max-w-4xl flex flex-col items-center gap-10 mb-10">

        {/* Logo */}
        <div className=" flex items-center justify-center  overflow-hidden">
          <img
            src="./logo.png"
            alt="logo"
            width={200}
            height={200}
            className=" object-cover"
          />
        </div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-semibold tracking-tight uppercase">
            ORCHESTRA
          </h1>
          <p className="text-xs text-[#BFBFBF] tracking-widest uppercase mt-2">
            System Control Unit v4.2.0-stable
          </p>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
          
          <button
            onClick={() => navigate("/tasks")}
            className="flex-1 h-12 bg-[#E1F4F3] text-[#0D0D0D] text-xs font-bold tracking-widest flex items-center justify-center gap-2 hover:bg-[#C2D8D7] active:scale-[0.98]"
          >
            Create New Workflow
          </button>

          <div className="flex-1">
            <UploadYaml onSuccess={() => navigate("/tasks")} />
          </div>

        </div>
      </div>

      {/* Recent (static for now) */}
      <section className="w-full max-w-4xl">
        <div className="flex justify-between border-b border-[#BFBFBF]/20 pb-2 mb-4">
          <h2 className="text-xs tracking-widest text-[#BFBFBF] uppercase">
            Recent Workflows
          </h2>
          <span className="text-xs text-[#BFBFBF]/50">Total 04 Active</span>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {["Data_Pipeline_Alpha", "Neural_Trainer_V2", "Sanity_Check_Service", "Report_Gen_Internal"].map((name) => (
            <div
              key={name}
              className="bg-[#1F1F1F] border border-[#BFBFBF] p-4 hover:border-[#E1F4F3]"
            >
              <div className="flex justify-between">
                <span className="font-semibold">{name}</span>
                <div className="w-2 h-2 bg-[#E1F4F3]" />
              </div>
              <p className="text-xs text-[#BFBFBF] mt-2">
                Placeholder description
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full p-4 flex justify-between bg-[#0D0D0D]/80">
        <span className="text-[10px] text-[#BFBFBF] uppercase">
          System Ready
        </span>
        <span className="text-[10px] text-[#BFBFBF]/40">
          SECURE ACCESS PROTOCOL
        </span>
      </footer>
    </main>
  );
}