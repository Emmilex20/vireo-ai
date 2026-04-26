import type { ImageProvider } from "./types";

export const mockImageProvider: ImageProvider = {
  name: "mock-image",

  async createImageJob() {
    return {
      providerJobId: `mock_image_${Date.now()}`,
      status: "processing",
    };
  },

  async getImageJobStatus() {
    return {
      status: "completed",
      outputUrl:
        "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1200&auto=format&fit=crop",
    };
  },
};
