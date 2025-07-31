import { NextResponse, NextRequest } from "next/server";
import { S3Client, DeleteObjectCommand, ListObjectsV2Command, DeleteObjectsCommand } from '@aws-sdk/client-s3';

const client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
    region: 'ap-south-1'
});

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const key = searchParams.get('key');
        const isFolder = searchParams.get('isFolder') === 'true';
        
        if (!key) {
            return NextResponse.json(
                { error: 'Key parameter is required' },
                { status: 400 }
            );
        }

        if (isFolder) {
            // Delete all objects in the folder
            const listCommand = new ListObjectsV2Command({
                Bucket: 's3ui-buket3',
                Prefix: key,
            });
            
            const listResult = await client.send(listCommand);
            
            if (listResult.Contents && listResult.Contents.length > 0) {
                const deleteCommand = new DeleteObjectsCommand({
                    Bucket: 's3ui-buket3',
                    Delete: {
                        Objects: listResult.Contents.map(obj => ({ Key: obj.Key! })),
                    },
                });
                
                await client.send(deleteCommand);
            }
        } else {
            // Delete single file
            const deleteCommand = new DeleteObjectCommand({
                Bucket: 's3ui-buket3',
                Key: key,
            });
            
            await client.send(deleteCommand);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting object:', error);
        return NextResponse.json(
            { error: 'Failed to delete object' },
            { status: 500 }
        );
    }
}
