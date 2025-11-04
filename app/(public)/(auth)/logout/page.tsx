/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { getRefreshTokenFromLocalStorage } from "@/lib/utils";
import { useLogoutMutation } from "@/queries/useAuth";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function LogoutPage() {
    const {mutateAsync} = useLogoutMutation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const refreshTokenFromUrl = searchParams.get('refreshToken');
    const ref = useRef<any>(null)
    useEffect(() => {
        if (ref.current || refreshTokenFromUrl !== getRefreshTokenFromLocalStorage()){
            return;
        }
        ref.current = mutateAsync;
        mutateAsync().then(res => {
            setTimeout(() => {
                ref.current = null;
            })
            router.push('/login');
        });
    }, [mutateAsync, router, refreshTokenFromUrl]);
  return <div>Logging out...</div>;
}