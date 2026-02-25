import { body } from "express-validator";

export default [
    body("name")
        .optional()
        .isString()
        .withMessage("Product name should be a string"),
    body("description")
        .optional()
        .isString()
        .withMessage("Description should be a string"),
    body("priceConfiguration")
        .optional()
        .custom((value) => {
            try {
                JSON.parse(value as string);
                return true;
            } catch {
                throw new Error(
                    "priceConfiguration must be valid JSON",
                );
            }
        }),
    body("attributes")
        .optional()
        .custom((value) => {
            try {
                JSON.parse(value as string);
                return true;
            } catch {
                throw new Error("attributes must be valid JSON");
            }
        }),
    body("tenantId")
        .optional()
        .isString()
        .withMessage("Tenant id should be a string"),
    body("categoryId")
        .optional()
        .isString()
        .withMessage("Category id should be a string"),
    body("isPublish")
        .optional()
        .isBoolean()
        .withMessage("isPublish should be a boolean"),
];
