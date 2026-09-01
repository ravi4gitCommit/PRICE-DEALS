import { Firecrawl } from "firecrawl";

const firecrawl = new Firecrawl({
  apiKey: process.env.FIRECRAWL_API_KEY,
});

export async function crawl(url) {
  try {
    const result = await firecrawl.scrape(url, {
      formats: [
        {
          type: "json",

          prompt:
            "Extract the product name as productName, current price as a number as currentPrice, currency code as currencyCode (INR, USD, EUR, etc.), and product image URL as productImageUrl if available.",

          schema: {
            type: "object",
            required: [
              "productName",
              "currentPrice",
              "currencyCode",
              "productImageUrl",
            ],
            properties: {
              productName: {
                type: "string",
              },

              currentPrice: {
                type: "number",
              },

              currencyCode: {
                type: "string",
              },

              productImageUrl: {
                type: "string",
              },
            },
          },
        },
      ],
    });

    const extractedData = result.json;

    if (!extractedData || !extractedData.productName) {
      throw new Error("No product data extracted from URL");
    }

    return extractedData;
  } catch (error) {
    console.error("Firecrawl scrape error:", error);

    throw new Error(`Failed to scrape product: ${error.message}`);
  }
}