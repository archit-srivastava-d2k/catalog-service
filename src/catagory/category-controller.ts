
import { NextFunction, Request, Response } from "express";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Category } from "./category-types";

import { Logger } from "winston";
import { CategoryService } from "./category-service";


export class CategoryController {
 constructor(
        private categoryService: CategoryService,
        private logger: Logger,
    ) {
        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getOne = this.getOne.bind(this);
        this.update = this.update.bind(this);
        this.delete = this.delete.bind(this);
    }

    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }
        const { name, priceConfiguration, attributes } = req.body as Category;

        const category = await this.categoryService.create({
            name,
            priceConfiguration,
            attributes,
        });

        this.logger.info(`Created category`, { id: category._id });
        res.json({ id: category._id });
    }

    async getAll(req: Request, res: Response) {
        const categories = await this.categoryService.getAll();
        this.logger.info(`Fetched all categories`);
        res.json(categories);
    }

    async getOne(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const category = await this.categoryService.getById(id);
        
        if (!category) {
            return next(createHttpError(404, "Category not found"));
        }

        this.logger.info(`Fetched category`, { id });
        res.json(category);
    }

    async update(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { id } = req.params;
        const { name, priceConfiguration, attributes } = req.body as Category;

        const category = await this.categoryService.update(id, {
            name,
            priceConfiguration,
            attributes,
        });

        if (!category) {
            return next(createHttpError(404, "Category not found"));
        }

        this.logger.info(`Updated category`, { id });
        res.json({ id: category._id });
    }

    async delete(req: Request, res: Response, next: NextFunction) {
        const { id } = req.params;
        const category = await this.categoryService.delete(id);

        if (!category) {
            return next(createHttpError(404, "Category not found"));
        }

        this.logger.info(`Deleted category`, { id });
        res.json({ id });
    }
}