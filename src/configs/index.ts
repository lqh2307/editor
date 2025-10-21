export const BASE_URL: string =
  (window as any).BASE_URL || "http://localhost:3000";
export const IMAGE_PROCESS_URL: string =
  (window as any).IMAGE_PROCESS_URL || "http://localhost:8080";
export const IMAGE_STORAGE_URL: string =
  (window as any).IMAGE_STORAGE_URL || "http://localhost:8001";

export * from "./import-schema";
