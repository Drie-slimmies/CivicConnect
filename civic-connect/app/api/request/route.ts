import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { serviceRequests } from '@/lib/db/schema';



export async function POST(req: Request){
    try {
        const body = await req.json();
        const { title, description, location, categoryId, requesterId, gpsLat, gpsLng } = body;

        if (!title || !description || !location || !categoryId || !requesterId) {
            return NextResponse.json(
                { error: 'Title, description, location, categoryId and requesterId are required.'},
                { status: 400 }
            );
        }

        const trackingId = `CC-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const [newRequest] = await db
        .insert(serviceRequests)
        .values({
            trackingId,
            title,
            description,
            location,
            categoryId: Number(categoryId),
            requesterId: Number(requesterId),
            gpsLat: gpsLat ? Number(gpsLat) : null,
            gpsLng: gpsLng ? Number(gpsLng) : null,
            status: 'submitted',
        })
        .returning();
        
        return NextResponse.json(
            { success: true, trackingId: newRequest.trackingId, data: newRequest },
            { status: 201 }
        );
    
    }catch (error){
        console.error('Error creating request:', error);
        return NextResponse.json(
            { error: 'Failed to submit service request.'},
            { status: 500 }
        );
    }
}