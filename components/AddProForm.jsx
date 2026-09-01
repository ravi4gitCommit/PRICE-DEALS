"use client";
import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import Input from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { AuthModal } from "./AuthModal";
import { addProducts } from "@/app/auth/callback/actions";
import { toast } from "sonner";

const AddProForm = ({ user }) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.append("url", url);

    const response = await addProducts(formData);

    if (response.error) {
      toast.error(response.error);
    } else {
      toast.success(response.message || "Product added successfully");
      setUrl("");
    }
    
    setLoading(false);
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="flex flex-col md:flex-row gap-2">

          {/* Product URL Input */}
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste product URL (Flipkart, Amazon, Meesho, etc.)"
            className="h-12 text-base flex-1"
            required
            disabled={loading}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="bg-orange-500 hover:bg-orange-600 h-10 sm:h-12 px-6"
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Adding...
              </>
            ) : (
              "Track Price Drop"
            )}
          </Button>

        </div>
      </form>

      {/* Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default AddProForm;