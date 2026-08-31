"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/superbase/client";

export function AuthModal({ isOpen, onClose }) {
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    const { origin } = window.location;

    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Profile</DialogTitle>

          <DialogDescription>
            Make changes to your profile here. Click save when done.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 py-4">
          <Button
            variant="outline"
            className="w-full gap-3"
            size="lg"
            onClick={handleGoogleLogin}
          >
            <img
              src="/google.svg"
              alt="Google"
              className="h-5 w-5"
            />

            Continue with Google
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}