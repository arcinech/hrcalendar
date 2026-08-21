import { NextRequest, NextResponse } from "next/server";
import { getUserHR } from "~/lib/api/authUserSession";

export async function GET(request: NextRequest) {
    const userAuth = await getUserHR();

    if(!userAuth) return null;

    const searchParams = request.nextUrl.searchParams;

    if (!searchParams.has("id")) {
        return NextResponse.json({
            error: "Missing id parameter"
        }, 
        { status: 400});
    };

    const userRole = searchParams.get("status");
    const userStatus = searchParams.get("role");

    if (!userRole || !userStatus) {
        return NextResponse.json({
            error: "Missing role or status parameter"
        }, 
        { status: 400});
    }

    return NextResponse.json({
        id: searchParams.get("id"),
        role: userRole,
        status: userStatus
    }, 
    { status: 200});
}