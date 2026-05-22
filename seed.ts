import mongoose from "mongoose";
import Category from "./src/catagory/category-model";
import Product from "./src/product/product-model";

const seed = async () => {
    try {
        await mongoose.connect("mongodb://localhost:27017/catalog?authSource=admin&w=1");
        console.log("Connected to MongoDB via Code.");

        const res = await Product.updateMany({ name: "Iced Lemon Tea" }, { tenantId: "10" });
        console.log(`Updated Lemon Tea:`, res);

        process.exit(0);
    } catch (err) {
        console.error("Error seeding data:", err);
        process.exit(1);
    }
};

seed();