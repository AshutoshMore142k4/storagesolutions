import { NextResponse, NextRequest } from "next/server";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
    region: 'ap-south-1'
});

export async function GET(request: NextRequest) {
    try {
        const key = request.nextUrl.searchParams.get('key');
        const contentType = request.nextUrl.searchParams.get('contentType');
        
        if (!key) {
            return NextResponse.json(
                { error: 'Key parameter is required' },
                { status: 400 }
            );
        }

        const command = new PutObjectCommand({
            Bucket: 's3ui-buket3',
            Key: key,
            ContentType: contentType || 'application/octet-stream',
        });

        const url = await getSignedUrl(client, command, { expiresIn: 3600 });
        
        return NextResponse.json({
            success: true,
            url
        });
    } catch (error) {
        console.error('Error generating upload URL:', error);
        return NextResponse.json(
            { error: 'Failed to generate upload URL' },
            { status: 500 }
        );
    }
}