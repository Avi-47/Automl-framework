import { useEffect, useRef, useState } from 'react';
import { CloudUpload, FileUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';

type FileDropzoneProps = {
  title: string;
  description: string;
  onFileSelect: (file: File | null) => void;
  selectedFile?: File | null;
};

export function FileDropzone({ title, description, onFileSelect, selectedFile }: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const handleWindowDrop = (event: DragEvent) => event.preventDefault();
    window.addEventListener('dragover', handleWindowDrop);
    window.addEventListener('drop', handleWindowDrop);

    return () => {
      window.removeEventListener('dragover', handleWindowDrop);
      window.removeEventListener('drop', handleWindowDrop);
    };
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'glass relative min-h-[240px] overflow-hidden rounded-[28px] border border-dashed p-4 transition sm:p-6',
        isDragging && 'border-cyan-400/60 shadow-glow',
      )}
      onDragEnter={() => setIsDragging(true)}
      onDragLeave={() => setIsDragging(false)}
      onDragOver={(event) => {
        event.preventDefault();
        setIsDragging(true);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setIsDragging(false);
        const file = event.dataTransfer.files?.[0] ?? null;
        onFileSelect(file);
      }}
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.14),transparent_35%),radial-gradient(circle_at_80%_20%,rgba(168,85,247,0.16),transparent_32%)]" />
      <div className="relative flex flex-col items-center justify-center gap-4 text-center">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-4 text-cyan-300 shadow-glow">
          <CloudUpload size={28} />
        </div>
        <div>
          <h3 className="text-xl font-semibold text-white">{title}</h3>
          <p className="mt-2 max-w-xl text-sm text-slate-300">{description}</p>
        </div>
        <div className="flex w-full flex-col items-stretch justify-center gap-3 sm:w-auto sm:flex-row sm:items-center">
          <Button variant="default" onClick={() => inputRef.current?.click()} className="w-full sm:w-auto">
            <FileUp size={16} />
            Choose CSV
          </Button>
          <Button variant="outline" onClick={() => onFileSelect(null)} className="w-full sm:w-auto">
            Reset
          </Button>
        </div>
        <p className="text-xs text-slate-400">Drop a CSV file here or use the button above. The preview updates from the backend response after upload.</p>
        {selectedFile ? <p className="rounded-full bg-cyan-400/10 px-4 py-1 text-xs font-medium text-cyan-200">Selected: {selectedFile.name}</p> : null}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept=",.csv,text/csv"
        className="hidden"
        onClick={(event) => {
          const target = event.currentTarget;
          target.value = '';
        }}
        onChange={(event) => {
          onFileSelect(event.target.files?.[0] ?? null);
          event.currentTarget.value = '';
        }}
      />
    </motion.div>
  );
}