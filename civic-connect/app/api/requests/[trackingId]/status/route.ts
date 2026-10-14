import { NextResponse } from "next/server";
import { advanceRequest } from "@/lib/requests/service";
import { getCurrentUser } from "@/lib/auth/guard";
import { SuccessPopup } from "@/components/auth/SuccessPopup";
import next from "next";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ trackingId: string}>}
){
    try {
        const user = await getCurrentUser();
        if (!user || !["staff", "manager", "admin"]. includes(user.role)) {
            return NextResponse.json({error: "Unauthorized"}, { status: 403});
        }

        const { trackingId } = await params;
        const body = await req.json();
        const { status, notes, version } = body;

        const updated = await advanceRequest(trackingId, status, notes, user.id, version);
        return NextResponse.json({ success: true, data: updated })
    } catch (error: any){
        if (error.message === "NOT_FOUND") return NextResponse.json({ error: "Request not found"}, { status: 404});
        if ( error.message === "VERSION_CONFLICT") return NextResponse.json({ error: "Stale version"}, { status: 409});
        return NextResponse.json({ error: error.message || "Failed to update status"}, {status: 400});
    }
}