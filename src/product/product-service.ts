import ProductModel from "./product-model";
import { PipelineStage } from "mongoose";
import { Product, ProductFilter, PaginationQuery } from "./product-types";

export class ProductService {
    async create(product: Product) {
        const newProduct = new ProductModel(product);
        return newProduct.save();
    }

    async update(productId: string, product: Partial<Product>) {
        return ProductModel.findByIdAndUpdate(
            productId,
            { $set: product },
            { new: true },
        );
    }

    async getById(productId: string) {
        return ProductModel.findById(productId);
    }

    async deleteById(productId: string) {
        return ProductModel.findByIdAndDelete(productId);
    }

    async getAll(filter: ProductFilter, { page, limit }: PaginationQuery) {
        const matchStage: Record<string, unknown> = {};

        if (filter.tenantId) matchStage.tenantId = filter.tenantId;
        if (filter.categoryId) matchStage.categoryId = filter.categoryId;
        if (filter.isPublish !== undefined)
            matchStage.isPublish = filter.isPublish;
        if (filter.q)
            matchStage.name = { $regex: filter.q, $options: "i" };

        const skip = (page - 1) * limit;

        const pipeline: PipelineStage[] = [
            { $match: matchStage },
            { $sort: { createdAt: -1 } },
            {
                $lookup: {
                    from: "categories",
                    let: { categoryId: "$categoryId" },
                    pipeline: [
                        {
                            $match: {
                                $expr: { $eq: ["$_id", "$$categoryId"] },
                            },
                        },
                        {
                            $project: {
                                _id: 1,
                                name: 1,
                                priceConfiguration: 1,
                                attributes: 1,
                            },
                        },
                    ],
                    as: "category",
                },
            },
            // Flatten the category array into a single object
            {
                $unwind: {
                    path: "$category",
                    preserveNullAndEmptyArrays: true,
                },
            },
            // Remove raw categoryId foreign key — category object is now embedded
            { $unset: "categoryId" },
        ];

        const [data, totalResult] = await Promise.all([
            ProductModel.aggregate([
                ...pipeline,
                { $skip: skip },
                { $limit: limit },
            ]),
            ProductModel.aggregate([
                ...pipeline,
                { $count: "total" },
            ]),
        ]);

        const total = totalResult[0]?.total ?? 0;

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
