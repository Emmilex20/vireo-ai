import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export async function uploadRemoteAssetToCloudinary(params: {
  url: string;
  folder: string;
  resourceType: "image" | "video";
}) {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return {
      url: params.url,
      publicId: null,
      stored: false,
      reason: "Cloudinary is not configured"
    };
  }

  try {
    const result = await cloudinary.uploader.upload(params.url, {
      folder: params.folder,
      resource_type: params.resourceType
    });

    return {
      url: result.secure_url,
      publicId: result.public_id,
      stored: true,
      reason: null
    };
  } catch (error: any) {
    return {
      url: params.url,
      publicId: null,
      stored: false,
      reason: error.message || "Cloudinary upload failed"
    };
  }
}

export async function deleteCloudinaryAsset(params: {
  publicId: string;
  resourceType: "image" | "video";
}) {
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    return {
      deleted: false,
      reason: "Cloudinary is not configured"
    };
  }

  try {
    await cloudinary.uploader.destroy(params.publicId, {
      resource_type: params.resourceType
    });

    return {
      deleted: true,
      reason: null
    };
  } catch (error: any) {
    return {
      deleted: false,
      reason: error.message || "Cloudinary delete failed"
    };
  }
}
