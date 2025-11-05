"use client";
import jwt from "jsonwebtoken";
import {
  getAccessTokenFromLocalStorage,
  getRefreshTokenFromLocalStorage,
  setAccessTokenToLocalStorage,
  setRefreshTokenToLocalStorage,
} from "@/lib/utils";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import authApiRequest from "@/apiRequests/auth";
// Những page sau sẽ không check refresh token
const UNAUTHENTICATED_PATHS = ["/login", "/logout", "/refresh-token"];
export default function RefreshToken() {
  const pathname = usePathname();
  useEffect(() => {
    if (UNAUTHENTICATED_PATHS.includes(pathname)) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let interval: any = null;
    const checkAndRefreshToken = async () => {
      const accessToken = getAccessTokenFromLocalStorage();
      const refreshToken = getRefreshTokenFromLocalStorage();
      // Chưa đăng nhập thì cũng không cho chạy
      if (!accessToken || !refreshToken) return;
      const decodedAccessToken = jwt.decode(accessToken) as {
        exp: number;
        iat: number;
      };
      const decodedRefreshToken = jwt.decode(refreshToken) as {
        exp: number;
        iat: number;
      };
      // Thời điểm hết hạn của token là tính theo epoch time (s)
      // Còn khi các bạn dùng cú pháp new Date().getTime() thì nó sẽ trả về epoch time (ms)
      const now = Math.round(new Date().getTime() / 1000);
      // Trường hợp refresh token hết hạn không xử lý nữa
      if (decodedRefreshToken.exp <= now) return;

      if (
        decodedAccessToken.exp - now <
        (decodedAccessToken.exp - decodedAccessToken.iat) / 3
      ) {
        // Gọi API refresh token
        try {
          const res = await authApiRequest.refreshToken();
          setAccessTokenToLocalStorage(res.payload.data.accessToken);
          setRefreshTokenToLocalStorage(res.payload.data.refreshToken);
        } catch (error) {
            clearInterval(interval);
        }
      }
    };
    // Phải gọi lần đầu tiên, vì interval sẽ chạy sau thời gian TIMEOUT
    checkAndRefreshToken();
    const TIMEOUT = 1000
    interval = setInterval(checkAndRefreshToken, TIMEOUT)
    return () => {
        clearInterval(interval)
    }
  }, [pathname]);
  return null;
}
