import express from "express";
import { CategoryController } from "./category-controller";
import categoryValidator from "./category-validator";
import logger from "../config/logger";
import { CategoryService } from "./category-service";
import { asyncWrapper } from "../common/utils/wrapper";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";

const router = express.Router();

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService, logger);

// Public routes
router.get("/", asyncWrapper(categoryController.getAll));
router.get("/:id", asyncWrapper(categoryController.getOne));

// Private routes (Admin only)
router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN]),
    categoryValidator,
    asyncWrapper(categoryController.create),
);

router.put(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN]),
    categoryValidator,
    asyncWrapper(categoryController.update),
);

router.delete(
    "/:id",
    authenticate,
    canAccess([Roles.ADMIN]),
    asyncWrapper(categoryController.delete),
);

export default router;