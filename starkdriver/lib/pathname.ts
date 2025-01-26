import { headers } from "next/headers";

export const getCurrentPath = async () => {
    const headerList = await headers();
    return headerList.get("x-current-path");
}