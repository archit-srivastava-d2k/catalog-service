import express from "express";
import { CategoryController } from "./category-controller";
import categoryValidator from "./category-validator";
import logger from "../config/logger";
import { CategoryService } from "./category-service";
import { asyncWrapper } from "../common/utils/wrapper";

const router = express.Router();

const categoryService = new CategoryService();
const categoryController = new CategoryController(categoryService, logger);

router.post("/", categoryValidator, asyncWrapper(categoryController.create));

export default router;