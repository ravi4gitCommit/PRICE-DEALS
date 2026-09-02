import { createClient } from "@/utils/superbase/server";
import { NextResponse } from "next/server";

export async function GET() {
    return NextResponse.json({ message: "Cron job executed successfully" });
}

export async function POST() {
    try {
        const authHeader = requestAnimationFrame.headers.get("Authorization");
        const cronSecret = process.env.CRON_SECRET;

        if(!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const supabase = createClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL,
            process.env.SUPABASE_SERVICE_ROLE_KEY
        );

        const { data: products, error } = await supabase.from("products").select("*");

        if(productsError){
            console.log('Found ${products.length} products to check)';

            const result = {
                total: products.length,
                updated: 0,
                failed: 0,
                priceChanges: 0,
                alertsSent: 0,
            };

            for(const product of products){
                try {
                    const productData = await fetchProductData(product.url);

                    if(!productData.currentPrice){
                        result.failed++;
                        continue;
                    }
                    const newPrice = parseFloat(productData.currentPrice);
                    const oldPrice = parseFloat(product.current_price);

                    await supabase.from("products").update({ current_price: newPrice,
                        currency: productData.currencyCode || product.currency,
                        name: productData.productName || product.name || products.name,
                        image_url: productData.imageUrl || product.image_url || products.image_url,
                        updated_at: new Date().toISOString(),
                     })
                     .eq("id", product.id);

                     if(newPrice !== oldPrice){
                        await supabase.from("price_changes").insert({
                            product_id: product.id,
                            price: newPrice,
                            currency: productData.currencyCode || product.currency,
                        });

                        result.priceChanges++;

                        if(oldPrice < newPrice){

                            const { data: {user},}= await supabase.auth.getUser(product.user_id);

                            if(user?. email){

                                export async function sendPriceDealsAlerts(
                                    userEmail,
                                    product,
                                    oldPrice,
                                    newPrice
                                ) 
                                if(emailResult.success){
                                    result.alertsSent++;
                                }
// send mail
                            }
                        }
                     }
                     result.updated++;
                } catch (error) {
                    console.error(`Failed to update product ${product.id}:`, error);
                    result.failed++;
            }
        }
        return NextResponse.json({success: true, message: "price check completed", result});
    } catch (error) {
        console.error("Error in cron job:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
 }

