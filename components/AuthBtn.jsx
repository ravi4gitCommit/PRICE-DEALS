"use client";

import React from "react";
import { Button } from "./ui/button";
import { LogIn, LogOut } from "lucide-react";
import { AuthModal } from "./AuthModal";
import { signOut } from "@/app/auth/callback/actions";

const AuthBtn = ({ user }) => {
  const [showAuthModal, setShowAuthModal] = React.useState(false);

  if (user) {
    return (
      <form action={signOut}>
        <Button
          variant="ghost"
          size="sm"
          type="submit"
        >
          <LogOut className="h-5 w-5" />
          Sign out
        </Button>
      </form>
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowAuthModal(true)}
        variant="default"
        size="sm"
        className="bg-orange-500 hover:bg-orange-600 gap-2"
      >
        <LogIn className="h-5 w-5" />
        Sign In
      </Button>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
      />
    </>
  );
};

export default AuthBtn;