'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, Image as ImageIcon, FileText, Loader2, Check, AlertCircle } from 'lucide-react';

interface FileUploadProps {
    category: 'photos' | 'documents' | 'xrays' | 'lab-results' | 'avatars';
    accept?: string;
    maxSizeMB?: number;
    multiple?: boolean;
    onUpload?: (files: UploadedFile[]) => void;
    label?: string;
}

interface UploadedFile {
    key: string;
    url: string;
    name: string;
    size: number;
    mimeType: string;
    status: 'uploading' | 'success' | 'error';
    progress: number;
    error?: string;
}

const categoryConfig = {
    photos: { icon: ImageIcon, label: 'Fotos do Animal', accept: 'image/*' },
    documents: { icon: FileText, label: 'Documentos', accept: 'image/*,.pdf' },
    xrays: { icon: ImageIcon, label: 'Radiografias', accept: 'image/*,.dcm' },
    'lab-results': { icon: FileText, label: 'Resultados Laboratoriais', accept: 'image/*,.pdf' },
    avatars: { icon: ImageIcon, label: 'Avatar', accept: 'image/*' },
};

export function FileUpload({
    category,
    accept,
    maxSizeMB = 20,
    multiple = true,
    onUpload,
    label,
}: FileUploadProps) {
    const [files, setFiles] = useState<UploadedFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const config = categoryConfig[category];

    const handleFiles = useCallback(
        async (fileList: FileList) => {
            const newFiles: UploadedFile[] = [];

            for (let i = 0; i < fileList.length; i++) {
                const file = fileList[i];

                if (file.size > maxSizeMB * 1024 * 1024) {
                    newFiles.push({
                        key: '',
                        url: '',
                        name: file.name,
                        size: file.size,
                        mimeType: file.type,
                        status: 'error',
                        progress: 0,
                        error: `Ficheiro demasiado grande (máx. ${maxSizeMB}MB)`,
                    });
                    continue;
                }

                newFiles.push({
                    key: `stub-${Date.now()}-${i}`,
                    url: URL.createObjectURL(file),
                    name: file.name,
                    size: file.size,
                    mimeType: file.type,
                    status: 'uploading',
                    progress: 0,
                });
            }

            setFiles((prev) => [...prev, ...newFiles]);

            // Simulate upload progress
            for (let i = 0; i < newFiles.length; i++) {
                if (newFiles[i].status === 'error') continue;

                const f = newFiles[i];
                for (let p = 10; p <= 100; p += 10) {
                    await new Promise((r) => setTimeout(r, 80));
                    setFiles((prev) =>
                        prev.map((pf) =>
                            pf.key === f.key
                                ? { ...pf, progress: p, status: p === 100 ? 'success' : 'uploading' }
                                : pf,
                        ),
                    );
                }
            }

            onUpload?.(newFiles.filter((f) => f.status !== 'error'));
        },
        [maxSizeMB, onUpload],
    );

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            setIsDragOver(false);
            if (e.dataTransfer.files.length) {
                handleFiles(e.dataTransfer.files);
            }
        },
        [handleFiles],
    );

    const removeFile = (key: string) => {
        setFiles((prev) => prev.filter((f) => f.key !== key));
    };

    return (
        <div className="space-y-3">
            {label && (
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">
                    {label || config.label}
                </label>
            )}

            {/* Drop zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                onDragLeave={() => setIsDragOver(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${isDragOver
                    ? 'border-primary-400 bg-primary-50 dark:bg-primary-950/20'
                    : 'border-surface-200 dark:border-surface-700 hover:border-primary-300 hover:bg-surface-50 dark:hover:bg-surface-800/50'
                    }`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept || config.accept}
                    multiple={multiple}
                    className="hidden"
                    title="Selecionar ficheiro"
                    aria-label="Selecionar ficheiro"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)}
                />
                <motion.div animate={{ scale: isDragOver ? 1.05 : 1 }} transition={{ duration: 0.2 }}>
                    <Upload className="w-8 h-8 text-surface-400 mx-auto mb-3" />
                    <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                        Arraste ficheiros ou <span className="text-primary-500">clique para selecionar</span>
                    </p>
                    <p className="text-xs text-surface-400 mt-1">
                        Máximo {maxSizeMB}MB por ficheiro
                    </p>
                </motion.div>
            </div>

            {/* File list */}
            <AnimatePresence>
                {files.map((file) => (
                    <motion.div
                        key={file.key || file.name}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex items-center gap-3 p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700"
                    >
                        {/* Preview */}
                        {file.mimeType.startsWith('image/') && file.url ? (
                            <img
                                src={file.url}
                                alt={file.name}
                                className="w-10 h-10 rounded-lg object-cover"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-surface-200 dark:bg-surface-700 flex items-center justify-center">
                                <FileText className="w-5 h-5 text-surface-400" />
                            </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-surface-700 dark:text-surface-300 truncate">
                                {file.name}
                            </p>
                            <p className="text-xs text-surface-400">
                                {(file.size / 1024).toFixed(0)} KB
                            </p>

                            {/* Progress bar */}
                            {file.status === 'uploading' && (
                                <div className="w-full h-1 bg-surface-200 dark:bg-surface-700 rounded-full mt-1.5">
                                    <motion.div
                                        className="h-full bg-primary-500 rounded-full"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${file.progress}%` }}
                                        transition={{ duration: 0.2 }}
                                    />
                                </div>
                            )}
                        </div>

                        {/* Status */}
                        <div className="flex-shrink-0">
                            {file.status === 'uploading' && <Loader2 className="w-4 h-4 text-primary-500 animate-spin" />}
                            {file.status === 'success' && <Check className="w-4 h-4 text-success" />}
                            {file.status === 'error' && (
                                <div className="flex items-center gap-1">
                                    <AlertCircle className="w-4 h-4 text-danger" />
                                </div>
                            )}
                        </div>

                        {/* Remove */}
                        <button
                            onClick={() => removeFile(file.key)}
                            aria-label={`Remover ${file.name}`}
                            className="w-6 h-6 rounded-md flex items-center justify-center text-surface-400 hover:text-danger hover:bg-danger-light transition-colors flex-shrink-0"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
}
