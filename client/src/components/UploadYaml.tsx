import { useRef } from "react";
import { Upload } from "lucide-react";
import { Button } from "./ui/button";
import { uploadYaml } from "../api/tasks";

interface UploadYamlProps {
  onSuccess: (fileName?: string) => void;
}

export default function UploadYaml({ onSuccess }: UploadYamlProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      await uploadYaml(file);
      if (onSuccess) {
        onSuccess(file.name);
      }
    } catch (err) {
      console.error("Upload failed:", err);
    }

    input.value = "";
  };

  return (
    <>
      <input
        ref={fileInputRef}
        type="file"
        accept=".yaml,.yml,application/x-yaml,text/yaml,text/vnd.yaml"
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        variant="secondary"
        size="lg"
        className="w-full flex items-center gap-2"
        onClick={() => fileInputRef.current?.click()}
      >
        <Upload className="h-4 w-4" />
        Upload YAML
      </Button>
    </>
  );
}