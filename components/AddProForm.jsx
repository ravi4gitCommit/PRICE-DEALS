"use client";

import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import Input  from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const AddProForm = ({ user }) => {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!url) return;

    setLoading(true);

    try {
      // Add your product tracking logic here
      console.log("Product URL:", url);
      console.log("User:", user);

      // Temporary delay for testing
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setUrl("");
    } catch (error) {
      console.error("Error adding product:", error);
    } finally {
      setLoading(false);
    }
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
          className="bg-orange-500 hover:bg-orange-600 h-10 sm:h-12 px-"
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
{/*  auth */}
    </>
  );
};

export default AddProForm;