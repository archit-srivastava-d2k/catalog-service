import express from "express";
import multer from "multer";
import { asyncWrapper } from "../common/utils/wrapper";
import authenticate from "../common/middlewares/authenticate";
import { canAccess } from "../common/middlewares/canAccess";
import { Roles } from "../common/constants";
import { ToppingController } from "./topping-controller";
import { ToppingService } from "./topping-service";
import createToppingValidator from "./create-topping-validator";
import updateToppingValidator from "./update-topping-validator";
import logger from "../config/logger";
import { createMessageProducerBroker } from "../common/factories/brokerFactory";

const router = express.Router();

const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    fileFilter: (_req, file, cb) => {
        const allowed = ["image/jpeg", "image/png", "image/webp"];
        if (allowed.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error("Only JPEG, PNG, and WebP images are allowed"));
        }
    },
});

const broker = createMessageProducerBroker();
const toppingService = new ToppingService();
const toppingController = new ToppingController(toppingService, logger, broker);

// Public route — no auth, returns only published toppings
router.get(
    "/public",
    asyncWrapper(toppingController.getPublic),
);

router.get(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    asyncWrapper(toppingController.getAll),
);

router.get(
    "/:toppingId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    asyncWrapper(toppingController.getSingle),
);

router.post(
    "/",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    upload.single("image"),
    createToppingValidator,
    asyncWrapper(toppingController.create),
);

router.patch(
    "/:toppingId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    upload.single("image"),
    updateToppingValidator,
    asyncWrapper(toppingController.update),
);

router.delete(
    "/:toppingId",
    authenticate,
    canAccess([Roles.ADMIN, Roles.MANAGER]),
    asyncWrapper(toppingController.deleteTopping),
);

export default router;
