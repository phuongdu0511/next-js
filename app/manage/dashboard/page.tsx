import accountApiRequests from "@/apiRequests/account";
import { cookies } from "next/headers";

export default async function Page() {
  const cookieStore = await cookies();
  // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain
  const accessToken = cookieStore.get("accessToken")?.value!
  let name = ''
  try {
    const result = await accountApiRequests.sMe(accessToken)
    name = result.payload.data.name
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.digest?.includes('NEXT_REDIRECT')) { 
      throw error
    }
  }
  return <div>Dashboard {name}</div>;
}