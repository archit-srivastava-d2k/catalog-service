import mongoose from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import config from "config";
import Product from "./src/product/product-model";

// Configure Cloudinary
cloudinary.config({
  cloud_name: config.get("cloudinary.cloudName"),
  api_key: config.get("cloudinary.apiKey"),
  api_secret: config.get("cloudinary.apiSecret"),
});

const imageUrl = "https://plus.unsplash.com/premium_photo-1664392087859-815b337c3324?q=80&w=780&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const uploadAndUpdate = async () => {
    try {
        await mongoose.connect(config.get("database.url"));
        console.log("Connected to MongoDB.");

        console.log("Uploading image to Cloudinary...");
        const uploadResult = await cloudinary.uploader.upload(imageUrl, {
            folder: "mern-space/beverages",
        });

        console.log("Upload successful! Secure URL:", uploadResult.secure_url);

        const res = await Product.updateOne(
            { name: "Iced Lemon Tea" },
            { $set: { image: uploadResult.secure_url } }
        );

        console.log(`Updated Lemon Tea in DB:`, res);
        process.exit(0);
    } catch (err) {
        console.error("Error:", err);
        process.exit(1);
    }
};

uploadAndUpdate();