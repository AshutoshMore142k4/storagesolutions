import { NextResponse, NextRequest } from "next/server";
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
    region: 'ap-south-1'
});

export async function GET(request: NextRequest) {
    const key = request.nextUrl.searchParams.get('key');
    
    if (!key) {
        return NextResponse.json({
            success: false,
            error: 'File key is required'
        }, { status: 400 });
    }
    
    try {
        const command = new GetObjectCommand({
            Bucket: 's3ui-buket3',
            Key: key,
        });
        
        // Generate a presigned URL that expires in 1 hour
        const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
        
        return NextResponse.json({
            success: true,
            url: signedUrl,
            key: key
        });
    } catch (error) {
        console.error('S3 Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to generate file URL',
            details: error
        }, { status: 500 });
    }
}
