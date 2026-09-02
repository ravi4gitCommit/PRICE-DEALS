import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
        const { data: products, error: productsError } =
            await supabase
                .from("products")
                .select("*");

                console.log("SUPABASE URL:", process.env.NEXT_PUBLIC_SUPABASE_URL);
console.log("SERVICE KEY EXISTS:", !!process.env.SUPABASE_SERVICE_ROLE_KEY);
console.log("PRODUCTS:", products);
console.log("PRODUCTS ERROR:", productsError);

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
// curl -X POST https://https://pricedeals.vercel.app//api/cron/check-prices -H "Authorization: Bearer 60a189dba5bdb5a5e14facf71f6e9b67d674d4c92dcff615689211502f272b70"