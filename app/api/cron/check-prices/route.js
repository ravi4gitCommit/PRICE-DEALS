import { createClient } from "@/utils/superbase/server";
import { NextResponse } from "next/server";

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

        const supabase = await createClient();

        // Get all products
        const { data: products, error: productsError } =
            await supabase
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
                // TODO: Add your Firecrawl product fetching logic here
                console.log(`Checking product: ${product.name}`);

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