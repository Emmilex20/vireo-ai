import type { VideoProvider } from "./types";

export const mockVideoProvider: VideoProvider = {
  name: "mock-video",

  async createVideoJob() {
    return {
      providerJobId: `mock_video_${Date.now()}`,
      status: "processing",
    };
  },

  async getVideoJobStatus() {
    return {
      status: "completed",
      outputUrl:
        "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
    };
  },
};
