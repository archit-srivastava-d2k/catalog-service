import mongoose from "mongoose";
import Topping from "./src/toppings/topping-model";
import Category from "./src/catagory/category-model";

/**
 * Seed script for toppings with category association.
 *
 * - Looks up "Pizza" and "Beverages" categories dynamically by name.
 * - Inserts new toppings, or updates categoryId on existing ones.
 *
 * Run with:
 *   npx ts-node seed-toppings.ts
 */

const MONGO_URI =
    "mongodb://localhost:27017/catalog?authSource=admin&w=1";

// ── Adjust tenant ID to match your restaurant data ────────────────────────────
const TENANT_ID = "1";
// ─────────────────────────────────────────────────────────────────────────────

// Category name → topping list mapping.
// Keys must exactly match the `name` field in your Category collection.
const TOPPING_MAP: Record<string, Array<{ name: string; price: number; image: string }>> = {
    Pizza: [
        { name: "Mozzarella", price: 40, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/mozzarella.png" },
        { name: "Cheddar Cheese", price: 45, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/cheddar.png" },
        { name: "Paneer", price: 50, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/paneer.png" },
        { name: "Mushrooms", price: 35, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/mushrooms.png" },
        { name: "Bell Peppers", price: 30, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/bell-peppers.png" },
        { name: "Black Olives", price: 35, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/black-olives.png" },
        { name: "Jalapeños", price: 30, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/jalapenos.png" },
        { name: "Corn", price: 25, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/corn.png" },
        { name: "Onions", price: 20, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/onions.png" },
        { name: "Tomatoes", price: 20, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/tomatoes.png" },
        { name: "Chicken Tikka", price: 70, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/chicken-tikka.png" },
        { name: "Pepperoni", price: 75, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/pepperoni.png" },
        { name: "Extra Sauce", price: 15, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/extra-sauce.png" },
        { name: "Garlic", price: 20, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/garlic.png" },
        { name: "Spinach", price: 25, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/spinach.png" },
    ],
    Beverages: [
        { name: "Tapioca Pearls (Boba)", price: 30, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/boba-pearls.png" },
        { name: "Whipped Cream", price: 25, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/whipped-cream.png" },
        { name: "Ice Cubes", price: 10, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/ice-cubes.png" },
        { name: "Lemon Slice", price: 15, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/lemon-slice.png" },
        { name: "Mint Leaves", price: 15, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/mint-leaves.png" },
        { name: "Caramel Drizzle", price: 20, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/caramel-drizzle.png" },
        { name: "Chocolate Syrup", price: 20, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/chocolate-syrup.png" },
        { name: "Vanilla Syrup", price: 20, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/vanilla-syrup.png" },
        { name: "Fruit Jelly", price: 25, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/fruit-jelly.png" },
        { name: "Aloe Vera", price: 30, image: "https://res.cloudinary.com/demo/image/upload/v1/mern-pizza/toppings/aloe-vera.png" },
    ],
};

const seed = async () => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("✅  Connected to MongoDB.");

        let inserted = 0;
        let updated = 0;
        let skipped = 0;

        for (const [categoryName, toppings] of Object.entries(TOPPING_MAP)) {
            // Resolve category _id by name
            const category = await Category.findOne({ name: categoryName });

            if (!category) {
                console.warn(`⚠️  Category "${categoryName}" not found in DB — skipping its toppings.`);
                skipped += toppings.length;
                continue;
            }

            console.log(`\n📂  [${categoryName}] → categoryId: ${category._id}`);

            for (const t of toppings) {
                const existing = await Topping.findOne({
                    name: t.name,
                    tenantId: TENANT_ID,
                });

                if (existing) {
                    // Patch categoryId onto existing topping if missing
                    if (!existing.categoryId || existing.categoryId.toString() !== category._id.toString()) {
                        await Topping.findByIdAndUpdate(existing._id, {
                            $set: { categoryId: category._id },
                        });
                        console.log(`🔁  Updated categoryId for "${t.name}"`);
                        updated++;
                    } else {
                        console.log(`⏭  Skipping "${t.name}" — already up to date.`);
                        skipped++;
                    }
                } else {
                    await Topping.create({
                        name: t.name,
                        price: t.price,
                        image: t.image,
                        tenantId: TENANT_ID,
                        categoryId: category._id,
                        isPublish: true,
                    });
                    console.log(`✔  Inserted "${t.name}"`);
                    inserted++;
                }
            }
        }

        console.log(
            `\n🎉  Done — ${inserted} inserted, ${updated} updated, ${skipped} skipped.`,
        );
        process.exit(0);
    } catch (err) {
        console.error("❌  Error seeding toppings:", err);
        process.exit(1);
    }
};

seed();
