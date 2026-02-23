import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import config from "config";

// Configure Cloudinary once when this module is loaded
cloudinary.config({
    cloud_name: config.get<string>("cloudinary.cloudName"),
    api_key: config.get<string>("cloudinary.apiKey"),
    api_secret: config.get<string>("cloudinary.apiSecret"),
});

export const uploadToCloudinary = (
    fileBuffer: Buffer,
    mimeType: string,
    folder = "catalog-service",
): Promise<UploadApiResponse> => {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { resource_type: "auto", folder },
            (error, result) => {
                if (error || !result) {
                    return reject(
                        error ?? new Error("Cloudinary upload failed"),
                    );
                }
                resolve(result);
            },
        );
        stream.end(fileBuffer);
    });
};

export const deleteFromCloudinary = async (
    publicId: string,
): Promise<void> => {
    await cloudinary.uploader.destroy(publicId);
};
