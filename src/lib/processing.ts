import { PROCESSING_API } from "./config";

export type ProcessingFile = {
  uri: string;
  name: string;
  mimeType?: string;
  type?: "pdf" | "image" | "audio";
};

type ExtractResponse = {
  filename?: string;
  kind?: string;
  text: string;
  message?: string;
};

type TranscribeResponse = {
  text: string;
  language?: string;
  language_probability?: number;
};

type ApiError = {
  detail?: string;
  error?: string;
  message?: string;
};

function getMimeType(file: ProcessingFile): string {
  if (file.mimeType) return file.mimeType;

  const name = file.name.toLowerCase();

  if (name.endsWith(".pdf") || file.type === "pdf") return "application/pdf";
  if (name.endsWith(".png")) return "image/png";
  if (name.endsWith(".webp")) return "image/webp";
  if (name.endsWith(".heic")) return "image/heic";
  if (name.endsWith(".mp3")) return "audio/mpeg";
  if (name.endsWith(".wav")) return "audio/wav";
  if (name.endsWith(".m4a")) return "audio/mp4";

  if (file.type === "audio") return "audio/mp4";
  if (file.type === "image") return "image/jpeg";

  return "application/octet-stream";
}

function safeFilename(name: string): string {
  return name.trim().replace(/[^\w.-]/g, "_") || "upload.bin";
}

function uploadFile<T>(endpoint: string, file: ProcessingFile): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const form = new FormData();
    form.append("file", {
      uri: file.uri,
      name: safeFilename(file.name),
      type: getMimeType(file),
    } as any);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${PROCESSING_API}${endpoint}`);
    xhr.setRequestHeader("Accept", "application/json");
    // don't set Content-Type: the boundary is added automatically
    xhr.timeout = 120_000; // OCR/transcription can be slow

    xhr.onload = () => {
      let data: any;
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        reject(
          new Error(
            `File processing failed: invalid server response (${xhr.status}): ${xhr.responseText.slice(0, 200)}`
          )
        );
        return;
      }

      if (xhr.status < 200 || xhr.status >= 300) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : data.detail
              ? JSON.stringify(data.detail)
              : data.error || data.message || `HTTP ${xhr.status}`;
        reject(new Error(`File processing failed: ${detail}`));
        return;
      }

      resolve(data as T);
    };

    xhr.onerror = () =>
      reject(
        new Error(
          "File processing failed: network error. Check that the Python server is running and reachable."
        )
      );

    xhr.ontimeout = () =>
      reject(new Error("File processing failed: the server took too long."));

    xhr.send(form);
  });
}

export async function extractDocumentText(
  file: ProcessingFile
): Promise<ExtractResponse> {
  if (file.type === "audio") {
    throw new Error("Use transcribeAudio() for audio files.");
  }

  const result = await uploadFile<ExtractResponse>("/api/extract", file);

  if (typeof result.text !== "string") {
    throw new Error("Server did not return extracted text.");
  }
  return result;
}

export async function transcribeAudio(
  file: ProcessingFile
): Promise<TranscribeResponse> {
  const result = await uploadFile<TranscribeResponse>("/api/transcribe", {
    ...file,
    type: "audio",
  });

  if (typeof result.text !== "string") {
    throw new Error("Server did not return a transcription.");
  }
  return result;
}
