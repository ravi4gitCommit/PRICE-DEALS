"use client";

import React from "react";
import { deleteProduct } from "@/app/auth/callback/actions";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Trash2,
  TrendingDown,
} from "lucide-react";
import PriceChart from "./PriceChart";

const ProductCard = ({ product }) => {
  const [showChart, setShowChart] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) return;

    setDeleting(true);

    const result = await deleteProduct(product.id);

    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success(result.message || "Product deleted successfully");
    }

    setDeleting(false);
  };

  return (
    <Card className="overflow-hidden border-gray-200 bg-white shadow-sm hover:shadow-lg transition-all duration-300">
      
      {/* Product Header */}
      <CardHeader className="pb-4">
        <div className="flex gap-4">
          
          {/* Product Image */}
          <div className="w-20 h-20 shrink-0 rounded-xl border bg-gray-50 flex items-center justify-center overflow-hidden">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-contain p-2"
              />
            ) : (
              <span className="text-xs text-gray-400">
                No Image
              </span>
            )}
          </div>

          {/* Product Details */}
          <div className="flex-1 min-w-0">
            
            <h3 className="font-semibold text-gray-900 line-clamp-2 leading-5">
              {product.name}
            </h3>

            {/* Price + Status */}
            <div className="flex flex-wrap items-center gap-2 mt-3">
              
              <span className="text-2xl sm:text-3xl font-bold text-orange-500">
                {product.currency || "USD"} {product.current_price}
              </span>

              <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-1 text-xs font-medium text-orange-600">
                <TrendingDown className="w-3.5 h-3.5" />
                Tracking
              </span>

            </div>
          </div>
        </div>
      </CardHeader>

      {/* Actions */}
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2">

          {/* Chart Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowChart(!showChart)}
            className="gap-2"
          >
            {showChart ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Hide Chart
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show Chart
              </>
            )}
          </Button>

          {/* View Product */}
          <Button
            variant="outline"
            size="sm"
            asChild
            className="gap-2"
          >
            <Link
              href={product.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <ExternalLink className="w-4 h-4" />
              View Product
            </Link>
          </Button>

          {/* Delete */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="gap-2 text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="w-4 h-4" />
            {deleting ? "Removing..." : "Remove"}
          </Button>

        </div>
      </CardContent>

      {/* Price Chart */}
      {showChart && (
        <CardFooter className="border-t bg-gray-50/50 pt-5">
          <div className="w-full">
            <PriceChart productId={product.id} />
          </div>
        </CardFooter>
      )}

    </Card>
  );
};

export default ProductCard;