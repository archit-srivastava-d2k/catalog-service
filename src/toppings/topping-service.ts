import ToppingModel from "./topping-model";
import { Topping, ToppingFilter, PaginationQuery } from "./topping-types";

export class ToppingService {
    async create(topping: Topping) {
        const newTopping = new ToppingModel(topping);
        return newTopping.save();
    }

    async update(toppingId: string, topping: Partial<Topping>) {
        return ToppingModel.findByIdAndUpdate(
            toppingId,
            { $set: topping },
            { new: true },
        );
    }

    async getById(toppingId: string) {
        return ToppingModel.findById(toppingId);
    }

    async deleteById(toppingId: string) {
        return ToppingModel.findByIdAndDelete(toppingId);
    }

    async getAll(filter: ToppingFilter, { page, limit }: PaginationQuery) {
        const matchStage: Record<string, unknown> = {};

        if (filter.tenantId) matchStage.tenantId = filter.tenantId;
        if (filter.categoryId) matchStage.categoryId = filter.categoryId;
        if (filter.isPublish !== undefined)
            matchStage.isPublish = filter.isPublish;
        if (filter.q)
            matchStage.name = { $regex: filter.q, $options: "i" };

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            ToppingModel.find(matchStage).sort({ createdAt: -1 }).skip(skip).limit(limit),
            ToppingModel.countDocuments(matchStage),
        ]);

        return {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
