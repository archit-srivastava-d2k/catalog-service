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

/**
 * Extracts the Cloudinary public_id from a secure URL.
 * e.g. https://res.cloudinary.com/demo/image/upload/v1234/catalog-service/abc.jpg
 *      => "catalog-service/abc"
 */
export const extractCloudinaryPublicId = (url: string): string => {
    const uploadMarker = "/upload/";
    const idx = url.indexOf(uploadMarker);
    if (idx === -1) return "";
    // strip everything up to and including /upload/
    let path = url.slice(idx + uploadMarker.length);
    // strip optional version segment (v1234567/)
    path = path.replace(/^v\d+\//, "");
    // strip file extension
    path = path.replace(/\.[^/.]+$/, "");
    return path;
};
