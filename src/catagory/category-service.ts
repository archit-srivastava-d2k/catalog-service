import type { Category } from "./category-types";
import  CategoryModel  from "./category-model";

export class CategoryService {
    async create(category: Category) {
        const newCategory = new CategoryModel(category);
        return newCategory.save();
    }

    async getAll() {
        return await CategoryModel.find();
    }

    async getById(id: string) {
        return await CategoryModel.findById(id);
    }

    async update(id: string, category: Category) {
        return await CategoryModel.findByIdAndUpdate(
            id,
            { $set: category },
            { new: true },
        );
    }

    async delete(id: string) {
        return await CategoryModel.findByIdAndDelete(id);
    }
}