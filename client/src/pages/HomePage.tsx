import { useNavigate } from "react-router-dom";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import UploadYaml from "../components/UploadYaml";

export default function HomePage() {
  const navigate = useNavigate();

  const handleCreate = () => {
    navigate("/tasks");
  };

  const handleImportSuccess = () => {
    navigate("/tasks");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground px-6">
      <div className="flex flex-col items-center gap-10">
        
        <div className="text-center">
          <h1 className="text-5xl font-extrabold tracking-tight">
            Orchestra
          </h1>
          <p className="text-sm text-muted-foreground mt-2">
            Build and run workflows
          </p>
        </div>

        <div className="flex gap-6">
          
          <Card className="w-64">
            <CardHeader>
              <CardTitle>New Workflow</CardTitle>
              <CardDescription>
                Create from scratch
              </CardDescription>
            </CardHeader>

            <CardFooter>
              <Button onClick={handleCreate} className="w-full">
                Create
              </Button>
            </CardFooter>
          </Card>

          <Card className="w-64">
            <CardHeader>
              <CardTitle>Import Workflow</CardTitle>
              <CardDescription>
                Load from YAML
              </CardDescription>
            </CardHeader>

            <CardFooter>
              <UploadYaml onSuccess={handleImportSuccess} />
            </CardFooter>
          </Card>

        </div>
      </div>
    </div>
  );
}