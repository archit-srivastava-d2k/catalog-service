import mongoose from "mongoose";

const toppingSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        image: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        tenantId: {
            type: String,
            required: true,
        },
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: false,
            default: null,
        },
        isPublish: {
            type: Boolean,
            required: false,
            default: false,
        },
    },
    { timestamps: true },
);

export default mongoose.model("Topping", toppingSchema);
