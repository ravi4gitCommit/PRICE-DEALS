import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { crawl } from "@/lib/firecrawl";
import { sendPriceDropAlert } from "@/lib/email";

export async function GET() {
    return NextResponse.json({
        message: "Cron job executed successfully",
    });
}

export async function POST(request) {
    try {
        // Authorization check
        const authHeader = request.headers.get("Authorization");
        const cronSecret = process.env.CRON_SECRET;

        if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        // Get all products
        const { data: products, error: productsError } = await supabase
            .from("products")
            .select("*");

        if (productsError) {
            throw productsError;
        }

        const result = {
            total: products.length,
            updated: 0,
            failed: 0,
            priceChanges: 0,
            alertsSent: 0,
        };

        // Check every product
        for (const product of products) {
            try {
                // 1. Re-scrape the product page for the current price
                const productData = await crawl(product.url);

                if (
                    productData?.currentPrice === undefined ||
                    productData?.currentPrice === null
                ) {
                    throw new Error("No price extracted from product page");
                }

                // 2. Normalize price safely (avoids parseFloat("67,900") === 67 bug)
                const normalizedPrice = String(productData.currentPrice)
                    .replace(/[^\d.,-]/g, "")
                    .replace(/,/g, "");
                const newPrice = Number(normalizedPrice);

                if (!Number.isFinite(newPrice)) {
                    throw new Error("Invalid product price after normalization");
                }

                const oldPrice = Number(product.current_price);
                const priceChanged = newPrice !== oldPrice;

                if (priceChanged) {
                    // 3. Update stored price
                    const { error: updateError } = await supabase
                        .from("products")
                        .update({ current_price: newPrice })
                        .eq("id", product.id);

                    if (updateError) {
                        throw updateError;
                    }

                    // 4. Insert price_history row
                    const { error: historyError } = await supabase
                        .from("price_history")
                        .insert({
                            product_id: product.id,
                            price: newPrice,
                            currency:
                                product.currency ||
                                productData.currencyCode ||
                                "INR",
                        });

                    if (historyError) {
                        throw historyError;
                    }

                    result.priceChanges++;

                    // 5. Send alert only when price dropped
                    if (newPrice < oldPrice) {
                        const {
                            data: userData,
                            error: userError,
                        } = await supabase.auth.admin.getUserById(
                            product.user_id
                        );

                        if (!userError && userData?.user?.email) {
                            const emailResult = await sendPriceDropAlert(
                                userData.user.email,
                                { ...product, current_price: newPrice },
                                oldPrice,
                                newPrice
                            );

                            if (!emailResult?.error) {
                                result.alertsSent++;
                            }
                        }
                    }
                }

                result.updated++;
            } catch (error) {
                console.error(
                    `Failed to update product ${product.id}:`,
                    error
                );

                result.failed++;
            }
        }

        return NextResponse.json({
            success: true,
            message: "Price check completed",
            result,
        });
    } catch (error) {
        console.error("Error in cron job:", error);

        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}