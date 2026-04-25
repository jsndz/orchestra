import { useNavigate } from "react-router-dom";
import UploadYaml from "../components/UploadYaml";
import { Button } from "../components/ui/button";
import { PlusCircle } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-background text-foreground">
      
      <div className="w-full max-w-4xl flex flex-col items-center">
        
        {/* Header Section */}
        <div className="w-full max-w-md flex flex-col items-center gap-6 mb-12">
          <div className="flex items-center justify-center">
            <img
              src="./logo.png"
              alt="logo"
              className="w-48 h-48 object-contain" 
            />
          </div>

          <div className="text-center">
            <h1 className="text-4xl font-semibold tracking-tight uppercase">
              ORCHESTRA
            </h1>
            <p className="text-xs text-muted-foreground tracking-widest uppercase mt-2">
              Visualize, orchestrate, and execute workflows.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md mb-16">
          <Button
            onClick={() => navigate("/tasks")}
            size="lg"
            className="flex-1 bg-btn-primary "
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create New Workflow
          </Button>

          <div className="flex-1">
            <UploadYaml onSuccess={() => navigate("/tasks")} />
          </div>
        </div>

        {/* Recent Section */}
        <section className="w-full">
          <div className="flex justify-between border-b border-border pb-2 mb-4">
            <h2 className="text-xs tracking-widest text-muted-foreground uppercase">
              Recent Workflows
            </h2>
            <span className="text-xs text-muted-foreground/50">Total 04 Active</span>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {["Data_Pipeline_Alpha", "Neural_Trainer_V2", "Sanity_Check_Service", "Report_Gen_Internal"].map((name) => (
              <div
                key={name}
                className="bg-card border border-border p-4 hover:border-accent transition-colors cursor-pointer group"
              >
                <div className="flex justify-between items-center">
                  <span className="font-semibold tracking-tight">{name}</span>
                  <div className="w-2 h-2 bg-accent group-hover:animate-pulse" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  System automated workflow deployment.
                </p>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full p-4 flex justify-between bg-background/90 backdrop-blur-sm border-t border-border">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest">
          System Ready
        </span>
        <span className="text-[10px] text-muted-foreground/40 uppercase tracking-widest">
          SECURE ACCESS PROTOCOL
        </span>
      </footer>
    </main>
  );
}