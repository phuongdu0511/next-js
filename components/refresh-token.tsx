"use client";
import { checkAndRefreshToken } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAppContext } from "./app-provider";
// Những page sau sẽ không check refresh token
const UNAUTHENTICATED_PATHS = ["/login", "/logout", "/refresh-token"];
export default function RefreshToken() {
  const pathname = usePathname();
  const router = useRouter();
  const { socket, disconnectSocket } = useAppContext();
  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathname)) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let interval: any = null;
    // Phải gọi lần đầu tiên, vì interval sẽ chạy sau thời gian TIMEOUT
    const onRefreshToken = (force?: boolean) =>
      checkAndRefreshToken({
        onError: () => {
          clearInterval(interval);
          disconnectSocket()
          router.push("/login");
        },
        force,
      });
    onRefreshToken();
    const TIMEOUT = 1000;
    interval = setInterval(onRefreshToken, TIMEOUT);
    if (socket?.connected) {
      onConnect();
    }

    function onConnect() {
      console.log("connected");
    }

    function onDisconnect() {
      console.log("disconnect");
    }
    function onRefreshTokenSocket() {
      onRefreshToken(true);
    }

    socket?.on("connect", onConnect);
    socket?.on("disconnect", onDisconnect);
    socket?.on("refresh-token", onRefreshTokenSocket);
    return () => {
      clearInterval(interval);
      socket?.off("connect", onConnect);
      socket?.off("disconnect", onDisconnect);
      socket?.off("refresh-token", onRefreshTokenSocket);
    };
  }, [pathname, router, socket, disconnectSocket]);
  return null;
}
