"use server";

import { createClient } from "@/utils/superbase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { crawl } from "../../../lib/firecrawl";

// =========================
// Sign Out
// =========================
export async function signOut() {
  const supabase = await createClient();

  await supabase.auth.signOut();

  revalidatePath("/");
  redirect("/");
}

// =========================
// Add / Update Product
// =========================
export async function addProducts(formData) {
  try {
    const supabase = await createClient();

    // Get logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        error: "User not authenticated",
      };
    }

    // Get product URL
    const url = formData.get("url");

    if (!url) {
      return {
        error: "Product URL is required",
      };
    }

    // Scrape product
    const productData = await crawl(url);

    if (
      !productData?.productName ||
      productData?.currentPrice === undefined ||
      productData?.currentPrice === null
    ) {
      return {
        error: "Failed to extract product data from URL",
      };
    }

    const newPrice = Number(productData.currentPrice);
    const currency = productData.currencyCode || "USD";

    if (Number.isNaN(newPrice)) {
      return {
        error: "Invalid product price",
      };
    }

    // Check if product already exists
    const {
      data: existingProduct,
      error: existingProductError,
    } = await supabase
      .from("products")
      .select("id, current_price")
      .eq("user_id", user.id)
      .eq("url", url)
      .maybeSingle();

    if (existingProductError) {
      throw existingProductError;
    }

    const isUpdate = !!existingProduct;

    // =========================
    // Save Product
    // =========================
    const {
      data: product,
      error: productError,
    } = await supabase
      .from("products")
      .upsert(
        {
          id: existingProduct?.id,
          user_id: user.id,
          url,
          name: productData.productName,
          current_price: newPrice,
          currency,
          image_url: productData.productImageUrl,
        },
        {
          onConflict: "user_id,url",
          ignoreDuplicates: false,
        }
      )
      .select("id, current_price")
      .single();

    if (productError) {
      throw productError;
    }

    // =========================
    // Save Price History
    // =========================

    // Add history when:
    // 1. Product is new
    // 2. Product price changed
    const shouldAddHistoryEntry =
      !existingProduct ||
      Number(existingProduct.current_price) !== newPrice;

    if (shouldAddHistoryEntry) {
      const { error: historyError } = await supabase
        .from("price_history")
        .insert({
          product_id: product.id,
          price: newPrice,
          currency,
        });

      if (historyError) {
        throw historyError;
      }
    }

    // Refresh homepage
    revalidatePath("/");

    return {
      success: true,
      product,
      message: isUpdate
        ? "Product updated successfully"
        : "Product added successfully",
    };
  } catch (error) {
    console.error("Add product error:", error);

    return {
      error: error?.message || "Failed to add product",
    };
  }
}

// =========================
// Delete Product
// =========================
export async function deleteProduct(productId) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return {
        error: "User not authenticated",
      };
    }

    const { error } = await supabase
      .from("products")
      .delete()
      .eq("id", productId)
      .eq("user_id", user.id);

    if (error) {
      throw error;
    }

    revalidatePath("/");

    return {
      success: true,
      message: "Product deleted successfully",
    };
  } catch (error) {
    console.error("Delete product error:", error);

    return {
      error: error?.message || "Failed to delete product",
    };
  }
}

// =========================
// Get User Products
// =========================
export async function getPorducts() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", {
        ascending: false,
      });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Get products error:", error);

    return [];
  }
}

// =========================
// Get Price History
// =========================
export async function getPriceHistory(productId) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return [];
    }

    // Make sure product belongs to logged-in user
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("id")
      .eq("id", productId)
      .eq("user_id", user.id)
      .maybeSingle();

    if (productError) {
      throw productError;
    }

    if (!product) {
      return [];
    }

    // Get price history
    const { data, error } = await supabase
      .from("price_history")
      .select("*")
      .eq("product_id", productId)
      .order("checked_at", {
        ascending: true,
      });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Get price history error:", error);

    return [];
  }
}