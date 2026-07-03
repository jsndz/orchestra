import { useNavigate } from "react-router-dom";
import UploadYaml from "@/components/workflow/UploadYaml";
import { Button } from "@/components/ui/button";
import { PlusCircle, Github, Terminal, Cpu, GitBranch } from "lucide-react";

export default function HomePage() {
  const navigate = useNavigate();

  const openGithub = () => {
    if (window.api?.openExternal) {
      window.api.openExternal("https://github.com/jsndz/orchestra");
    } else {
      window.open("https://github.com/jsndz/orchestra", "_blank");
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8 bg-background text-foreground selection:bg-accent selection:text-background overflow-hidden">
      {/* Background Subtle Gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--card)_0%,_transparent_70%)] opacity-20 pointer-events-none" />
      
      {/* Decorative Grid */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      <div className="w-full max-w-4xl flex flex-col items-center relative z-10">
        {/* Header Section */}
        <div className="w-full max-w-2xl flex flex-col items-center gap-8 mb-16">
          <div className="flex items-center justify-center group relative">
            <div className="absolute inset-0 bg-accent/20 blur-3xl rounded-full scale-0 group-hover:scale-100 transition-transform duration-700" />
            <img
              src="./icon.png"
              alt="logo"
              className="w-32 h-32 object-contain filter grayscale  brightness-200 group-hover:scale-105 transition-transform duration-500 relative z-10"
            />
          </div>

          <div className="text-center space-y-4">
            <h1 className="text-6xl font-black tracking-tighter uppercase leading-none italic">
              ORCHESTRA
            </h1>
            <p className="text-xs text-muted-foreground tracking-[0.4em] uppercase font-medium">
              Next-Gen Workflow Orchestration for Developers
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-6 w-full max-w-md mb-20">
          <div className="flex flex-col sm:flex-row gap-3 w-full">
            <Button
              onClick={() => navigate("/tasks")}
              size="lg"
              className="flex-[1.2] bg-accent text-background font-bold hover:bg-accent/90 rounded-none h-12 text-[10px] tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(225,244,243,0.2)]"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              New Workflow
            </Button>

            <div className="flex-1 h-12 [&_button]:h-full [&_button]:rounded-none [&_button]:text-[10px] [&_button]:tracking-[0.2em] [&_button]:uppercase [&_button]:border-border/20">
              <UploadYaml onSuccess={() => navigate("/tasks")} />
            </div>
          </div>

          <Button
            onClick={openGithub}
            variant="outline"
            className="w-full border-border/10 bg-card/30 hover:bg-white hover:text-black font-mono text-[9px] tracking-[0.3em] uppercase rounded-none h-11 transition-all duration-300"
          >
            <Github className="mr-2 h-3.5 w-3.5" />
            View Source on GitHub
          </Button>
        </div>

        {/* Minimal Features / Open Source Identity */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 w-full border-t border-border/5 pt-16">
          <FeatureItem 
            icon={<Terminal size={18} />}
            title="Visual Execution"
            description="Real-time graph visualization for complex task dependency monitoring."
          />
          <FeatureItem 
            icon={<GitBranch size={18} />}
            title="YAML Native"
            description="Pure YAML configuration. No proprietary DSLs or vendor lock-in."
          />
          <FeatureItem 
            icon={<Cpu size={18} />}
            title="Local First"
            description="Direct environment access with zero-latency local task orchestration."
          />
        </div>
      </div>

      {/* Footer */}
      <footer className="fixed bottom-0 left-0 w-full border-t border-border/5 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_#10b981]" />
            <span className="text-[8px] font-mono text-muted-foreground uppercase tracking-[0.2em]">
              System::Operational
            </span>
          </div>

          <div className="flex items-center gap-8">
             <span className="text-[8px] font-mono text-muted-foreground/60 uppercase tracking-[0.2em]">
              Build_1.0.0_BETA
            </span>
            <span className="text-[8px] font-mono text-muted-foreground/40 uppercase tracking-[0.2em]">
              Licensed under MIT
            </span>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureItem({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-3 group">
      <div className="text-accent/40 group-hover:text-accent transition-colors duration-500 mb-1">
        {icon}
      </div>
      <h3 className="text-[9px] font-bold uppercase tracking-[0.3em] text-accent/80 group-hover:text-accent transition-colors">
        {title}
      </h3>
      <p className="text-[10px] text-muted-foreground/70 leading-relaxed max-w-[200px]">
        {description}
      </p>
    </div>
  );
}
