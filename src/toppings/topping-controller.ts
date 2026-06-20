import { NextFunction, Response } from "express";
import { Request } from "express-jwt";
import { validationResult } from "express-validator";
import createHttpError from "http-errors";
import { Logger } from "winston";
import { ToppingService } from "./topping-service";
import { Topping } from "./topping-types";
import { AuthRequest } from "../common/types/index";
import { Roles } from "../common/constants";
import {
    uploadToCloudinary,
    deleteFromCloudinary,
    extractCloudinaryPublicId,
} from "../common/services/cloudinaryStorage";

export class ToppingController {
    constructor(
        private toppingService: ToppingService,
        private logger: Logger,
    ) {
        this.create = this.create.bind(this);
        this.update = this.update.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getSingle = this.getSingle.bind(this);
        this.getPublic = this.getPublic.bind(this);
        this.deleteTopping = this.deleteTopping.bind(this);
    }

    async create(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { name, price, tenantId, categoryId, isPublish } = req.body as Topping;

        if (!req.file) {
            return next(createHttpError(400, "Topping image file is required"));
        }

        let imageUrl: string;
        try {
            const uploadResult = await uploadToCloudinary(
                req.file.buffer,
                req.file.mimetype,
            );
            imageUrl = uploadResult.secure_url;
            this.logger.info(`Image uploaded to Cloudinary`, {
                publicId: uploadResult.public_id,
            });
        } catch (err) {
            return next(
                createHttpError(500, "Failed to upload image to Cloudinary"),
            );
        }

        const topping = await this.toppingService.create({
            name,
            image: imageUrl,
            price: parseFloat(price as unknown as string),
            tenantId,
            categoryId,
            isPublish,
        });

        this.logger.info(`Created topping`, { id: topping._id });
        res.json({ id: topping._id });
    }

    async update(req: Request, res: Response, next: NextFunction) {
        const result = validationResult(req);
        if (!result.isEmpty()) {
            return next(createHttpError(400, result.array()[0].msg as string));
        }

        const { toppingId } = req.params;

        const existingTopping = await this.toppingService.getById(toppingId);
        if (!existingTopping) {
            return next(createHttpError(404, "Topping not found"));
        }

        const authReq = req as unknown as AuthRequest;
        if (authReq.auth.role === Roles.MANAGER) {
            if (existingTopping.tenantId !== authReq.auth.tenant?.id) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed to update this topping",
                    ),
                );
            }
        }

        const { name, price, tenantId, categoryId, isPublish } =
            req.body as Partial<Topping>;

        let imageUrl: string | undefined;

        if (req.file) {
            if (existingTopping.image) {
                const oldPublicId = extractCloudinaryPublicId(
                    existingTopping.image,
                );
                if (oldPublicId) {
                    try {
                        await deleteFromCloudinary(oldPublicId);
                        this.logger.info(`Deleted old image from Cloudinary`, {
                            publicId: oldPublicId,
                        });
                    } catch (err) {
                        this.logger.warn(
                            `Failed to delete old image from Cloudinary`,
                            { publicId: oldPublicId, err },
                        );
                    }
                }
            }

            try {
                const uploadResult = await uploadToCloudinary(
                    req.file.buffer,
                    req.file.mimetype,
                );
                imageUrl = uploadResult.secure_url;
                this.logger.info(`Image updated on Cloudinary`, {
                    publicId: uploadResult.public_id,
                });
            } catch (err) {
                return next(
                    createHttpError(500, "Failed to upload image to Cloudinary"),
                );
            }
        }

        const updatePayload: Partial<Topping> = {
            ...(name !== undefined && { name }),
            ...(price !== undefined && {
                price: parseFloat(price as unknown as string),
            }),
            ...(tenantId !== undefined && { tenantId }),
            ...(categoryId !== undefined && { categoryId }),
            ...(isPublish !== undefined && { isPublish }),
            ...(imageUrl !== undefined && { image: imageUrl }),
        };

        const updated = await this.toppingService.update(
            toppingId,
            updatePayload,
        );

        this.logger.info(`Updated topping`, { id: updated?._id });
        res.json({ id: updated?._id });
    }

    async getSingle(req: Request, res: Response, next: NextFunction) {
        const { toppingId } = req.params;

        const topping = await this.toppingService.getById(toppingId);
        if (!topping) {
            return next(createHttpError(404, "Topping not found"));
        }

        this.logger.info(`Fetched topping`, { id: topping._id });
        res.json(topping);
    }

    // Public endpoint — no auth required, always scoped to isPublish: true
    async getPublic(req: Request, res: Response, next: NextFunction) {
        const { tenantId, categoryId, q } = req.query;

        const filter = {
            isPublish: true,
            ...(tenantId && { tenantId: tenantId as string }),
            ...(categoryId && { categoryId: categoryId as string }),
            ...(q && { q: q as string }),
        };

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.max(
            1,
            Math.min(100, parseInt(req.query.limit as string) || 10),
        );

        const result = await this.toppingService.getAll(filter, { page, limit });

        this.logger.info(`Fetched public topping list`, { filter, page, limit });
        res.json(result);
    }

    async deleteTopping(req: Request, res: Response, next: NextFunction) {
        const { toppingId } = req.params;

        const topping = await this.toppingService.getById(toppingId);
        if (!topping) {
            return next(createHttpError(404, "Topping not found"));
        }

        const authReq = req as unknown as AuthRequest;
        if (authReq.auth.role === Roles.MANAGER) {
            if (topping.tenantId !== authReq.auth.tenant?.id) {
                return next(
                    createHttpError(
                        403,
                        "You are not allowed to delete this topping",
                    ),
                );
            }
        }

        if (topping.image) {
            const publicId = extractCloudinaryPublicId(topping.image);
            if (publicId) {
                try {
                    await deleteFromCloudinary(publicId);
                    this.logger.info(`Deleted topping image from Cloudinary`, {
                        publicId,
                    });
                } catch (err) {
                    this.logger.warn(
                        `Failed to delete topping image from Cloudinary`,
                        { publicId, err },
                    );
                }
            }
        }

        await this.toppingService.deleteById(toppingId);

        this.logger.info(`Deleted topping`, { id: toppingId });
        res.json({ id: toppingId });
    }

    async getAll(req: Request, res: Response, next: NextFunction) {
        const authReq = req as unknown as AuthRequest;

        const { tenantId, categoryId, isPublish, q } = req.query;

        const effectiveTenantId =
            authReq.auth.role === Roles.MANAGER
                ? authReq.auth.tenant?.id
                : (tenantId as string | undefined);

        const filter = {
            ...(effectiveTenantId && { tenantId: effectiveTenantId }),
            ...(categoryId && { categoryId: categoryId as string }),
            ...(isPublish === "true" && { isPublish: true }),
            ...(q && { q: q as string }),
        };

        const page = Math.max(1, parseInt(req.query.page as string) || 1);
        const limit = Math.max(
            1,
            Math.min(100, parseInt(req.query.limit as string) || 10),
        );

        const result = await this.toppingService.getAll(filter, {
            page,
            limit,
        });

        this.logger.info(`Fetched topping list`, { filter, page, limit });
        res.json(result);
    }
}
