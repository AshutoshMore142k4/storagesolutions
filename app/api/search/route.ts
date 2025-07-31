import { NextResponse, NextRequest } from "next/server";
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
    region: 'ap-south-1'
});

export async function GET(request: NextRequest) {
    try {
        const query = request.nextUrl.searchParams.get('query');
        
        if (!query) {
            return NextResponse.json(
                { error: 'Search query is required' },
                { status: 400 }
            );
        }

        const command = new ListObjectsV2Command({
            Bucket: 's3ui-buket3',
            MaxKeys: 1000, // Adjust based on your needs
        });

        const response = await client.send(command);
        
        const searchResults = response.Contents?.filter(item => 
            item.Key?.toLowerCase().includes(query.toLowerCase())
        ).map(item => ({
            key: item.Key!,
            name: item.Key!.split('/').pop() || item.Key!,
            size: item.Size || 0,
            lastModified: item.LastModified?.toISOString() || '',
            type: 'file' as const,
            path: item.Key!.substring(0, item.Key!.lastIndexOf('/') + 1) || ''
        })) || [];

        return NextResponse.json({
            success: true,
            results: searchResults,
            query
        });
    } catch (error) {
        console.error('Error searching files:', error);
        return NextResponse.json(
            { error: 'Search failed' },
            { status: 500 }
        );
    }
}
