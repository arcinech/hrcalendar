// get:
//       operationId: getUser
//       summary: Szczegóły użytkownika, również zarchiwizowanego
//       security: [{ bearerAuth: [] }]
//       responses:
//         '200': { description: Użytkownik }
//         '404': { $ref: '#/components/responses/Problem' }
//     patch:
//       operationId: updateUser
//       summary: Zmienia dane lub rolę użytkownika
//       security: [{ bearerAuth: [] }]
//       requestBody:
//         required: true
//         content:
//           application/json:
//             schema: { $ref: '#/components/schemas/UpdateUserRequest' }
//       responses:
//         '200': { description: Użytkownik zmieniony }
//         '409': { $ref: '#/components/responses/Problem' }
//         '422': { $ref: '#/components/responses/Problem' }
//     delete:
//       operationId: archiveUser
//       summary: Archiwizuje konto bez usuwania danych
//       security: [{ bearerAuth: [] }]
//       responses:
//         '204': { description: Użytkownik zarchiwizowany }
//         '409': { $ref: '#/components/responses/Problem' }
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