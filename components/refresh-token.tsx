"use client";
import {
    checkAndRefreshToken,
} from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
// Những page sau sẽ không check refresh token
const UNAUTHENTICATED_PATHS = ["/login", "/logout", "/refresh-token"];
export default function RefreshToken() {
  const pathname = usePathname();
  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathname)) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let interval: any = null;
    // Phải gọi lần đầu tiên, vì interval sẽ chạy sau thời gian TIMEOUT
    checkAndRefreshToken({
        onError: () => {
            clearInterval(interval)
        }
    });
    const TIMEOUT = 1000
    interval = setInterval(checkAndRefreshToken, TIMEOUT)
    return () => {
        clearInterval(interval)
    }
  }, [pathname]);
  return null;
}
