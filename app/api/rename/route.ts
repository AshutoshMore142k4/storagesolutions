import { NextResponse, NextRequest } from "next/server";
import { S3Client, CopyObjectCommand, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';

const client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
    region: 'ap-south-1'
});

export async function PUT(request: NextRequest) {
    try {
        const { oldKey, newKey, isFolder } = await request.json();
        
        if (!oldKey || !newKey) {
            return NextResponse.json(
                { error: 'Both old and new keys are required' },
                { status: 400 }
            );
        }

        if (isFolder) {
            // Rename folder by copying all objects with new prefix
            const listCommand = new ListObjectsV2Command({
                Bucket: 's3ui-buket3',
                Prefix: oldKey,
            });
            
            const listResult = await client.send(listCommand);
            
            if (listResult.Contents) {
                for (const obj of listResult.Contents) {
                    if (obj.Key) {
                        const newObjKey = obj.Key.replace(oldKey, newKey);
                        
                        // Copy object
                        const copyCommand = new CopyObjectCommand({
                            Bucket: 's3ui-buket3',
                            CopySource: `s3ui-buket3/${obj.Key}`,
                            Key: newObjKey,
                        });
                        await client.send(copyCommand);
                        
                        // Delete old object
                        const deleteCommand = new DeleteObjectCommand({
                            Bucket: 's3ui-buket3',
                            Key: obj.Key,
                        });
                        await client.send(deleteCommand);
                    }
                }
            }
        } else {
            // Rename single file
            const copyCommand = new CopyObjectCommand({
                Bucket: 's3ui-buket3',
                CopySource: `s3ui-buket3/${oldKey}`,
                Key: newKey,
            });
            await client.send(copyCommand);
            
            const deleteCommand = new DeleteObjectCommand({
                Bucket: 's3ui-buket3',
                Key: oldKey,
            });
            await client.send(deleteCommand);
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error renaming object:', error);
        return NextResponse.json(
            { error: 'Failed to rename object' },
            { status: 500 }
        );
    }
}
