"use client";

import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useRouter } from "next/navigation";

export default function Modal({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open) router.back;
      }}
    >
      <DialogTitle></DialogTitle>
      <DialogContent>{children}</DialogContent>
    </Dialog>
  );
}
