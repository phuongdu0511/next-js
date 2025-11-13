import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { Role } from "./constants/type";
import jwt from 'jsonwebtoken'
import { TokenPayload } from "./types/jwt.types";

const decodeToken = (token: string) => {
  return jwt.decode(token) as TokenPayload;
};

const managePaths = ["/manage"];
const guestPaths = ["/guest"];
const onlyOwnerPaths = ["/manage/account"];
const privatePaths = [...managePaths, ...guestPaths];
const unAuthPaths = ["/login"];

// This function can be marked `async` if using `await` inside
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  // pathname: /manage/dashboard
  const accessToken = request.cookies.get("accessToken")?.value;
  const refreshToken = request.cookies.get("refreshToken")?.value;
  // 1. Chưa đăng nhập thì không cho vào privatePaths
  if (privatePaths.some((path) => pathname.startsWith(path)) && !refreshToken) {
    const url = new URL("/login", request.url);
    url.searchParams.set("clearTokens", "true");
    return NextResponse.redirect(url);
  }
  // 2. Trường hợp đã đăng nhập
  if (refreshToken) {
    // 2.1 Nếu cố tình vào trang login sẽ redirect về trang chủ
    if (unAuthPaths.some((path) => pathname.startsWith(path)) && refreshToken) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    // 2.2 Trường hợp đăng nhập rồi, nhưng accessToken hết hạn
    if (
      privatePaths.some((path) => pathname.startsWith(path)) &&
      !accessToken
    ) {
      const url = new URL("/refresh-token", request.url);
      url.searchParams.set("refreshToken", refreshToken);
      url.searchParams.set("redirect", pathname);
      return NextResponse.redirect(url);
    }
    // 2.3 Vào không đúng role, redirect về trang chủ
    const role = decodeToken(refreshToken).role;
    // Guest nhưng cố vào route owner
    const isGuestGoToManagePath =
      role === Role.Guest &&
      managePaths.some((path) => pathname.startsWith(path));
    // Không phải Guest nhưng cố vào route guest
    const isNotGuestGoToGuestPath =
      role !== Role.Guest &&
      guestPaths.some((path) => pathname.startsWith(path));

    // Khôn phải Owner nhưng có tình truy cập vào các route dành cho Owner
    const iNotOwnerGotoOnwerPath =
      role !== Role.Owner &&
      onlyOwnerPaths.some((path) => pathname.startsWith(path));
    if (
      isGuestGoToManagePath ||
      isNotGuestGoToGuestPath ||
      iNotOwnerGotoOnwerPath
    ) {
      return NextResponse.redirect(new URL("/", request.url));
    }
  }
  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: ["/manage/:path*", "/guest/:path*", "/login"],
};
