import { NextResponse, NextRequest } from "next/server";
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
    region: 'ap-south-1'
});

export async function POST(request: NextRequest) {
    try {
        const { folderName, currentPrefix } = await request.json();
        
        if (!folderName) {
            return NextResponse.json(
                { error: 'Folder name is required' },
                { status: 400 }
            );
        }

        // Create folder by uploading an empty object with trailing slash
        const folderKey = currentPrefix ? `${currentPrefix}${folderName}/` : `${folderName}/`;
        
        const command = new PutObjectCommand({
            Bucket: 's3ui-buket3',
            Key: folderKey,
            Body: '',
            ContentType: 'application/x-directory',
        });

        await client.send(command);

        return NextResponse.json({ 
            success: true,
            folderKey 
        });
    } catch (error) {
        console.error('Error creating folder:', error);
        return NextResponse.json(
            { error: 'Failed to create folder' },
            { status: 500 }
        );
    }
}
