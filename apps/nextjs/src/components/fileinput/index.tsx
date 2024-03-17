import { useCallback, useState } from "react";
import { Accept, DropzoneState, useDropzone } from "react-dropzone";

import { CloseIcon } from "../icons/close-icon";
import { FileIcon } from "../icons/file-icon";
import { UploadIcon } from "../icons/upload-icon";

interface InputProps {
  dropzone: DropzoneState;
}

const fileTypes = {
  "application/pdf": [`.pdf`],
  "image/jpeg": [`.jpg`, `.jpeg`],
};

type acceptedFileTypes = keyof typeof fileTypes;

interface HasFileProps {
  file?: File;
  removeFile: () => void;
}

export function FileInput({
  onDropFile,
  acceptedFileTypes,
  onRemoveFile,
}: {
  onDropFile: (file: File) => void;
  onRemoveFile: () => void;
  acceptedFileTypes: acceptedFileTypes[];
}) {
  const [file, setFile] = useState<File | null>(null);

  const removeFile = useCallback(() => {
    setFile(null);
    onRemoveFile();
  }, [file]);

  const onDrop = useCallback((files: File[]) => {
    if (!files.length || !files[0]) return;
    setFile(files[0]);
    onDropFile(files[0]);
  }, []);

  const accept: Accept = acceptedFileTypes.reduce((acc, type) => {
    return {
      ...acc,
      [type]: fileTypes[type],
    };
  }, {});

  const dropzone = useDropzone({
    onDrop,
    accept,
  });

  if (file) return <HasFile file={file} removeFile={removeFile} />;

  return <Input dropzone={dropzone} />;
}

function Input({ dropzone }: InputProps) {
  const { getRootProps, getInputProps, isDragActive } = dropzone;

  return (
    <div
      {...getRootProps()}
      className={`h-full w-1/2 rounded-lg border-4 border-dashed transition-all hover:border-gray-300 hover:bg-gray-300
      ${isDragActive ? "border-blue-500" : "border-gray-300"}`}
    >
      <label htmlFor="dropzone-file" className="h-full w-full cursor-pointer">
        <div className="flex h-full w-full flex-col items-center justify-center pb-6 pt-5">
          <UploadIcon
            className={`mb-3 h-10 w-10 ${isDragActive ? "text-blue-500" : "text-gray-400"}`}
          />
          {isDragActive ? (
            <p className="text-lg font-bold text-blue-400">
              Solte para adicionar
            </p>
          ) : (
            <>
              <p className="mb-2 text-lg text-gray-400">
                <span className="font-bold">Clique para enviar</span> ou arraste
                até aqui
              </p>
              <p className="text-sm text-gray-400">PDF</p>
            </>
          )}
        </div>
      </label>
      <input {...getInputProps()} className="hidden" />
    </div>
  );
}

function HasFile({ file, removeFile }: HasFileProps) {
  return (
    <div className="flex h-full w-1/2 items-center justify-center rounded-lg border-4 border-dashed border-gray-600 bg-gray-700">
      <div className="flex w-36 items-center justify-center gap-3 rounded-md bg-white shadow-md">
        <FileIcon className="my-4 ml-4 h-5 w-5" />
        <span className="my-4 text-sm text-gray-500">{file?.name}</span>
        <button
          type="button"
          onClick={removeFile}
          className="mt-1 place-self-start p-1"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
}
