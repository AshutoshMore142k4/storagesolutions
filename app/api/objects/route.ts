import { NextResponse, NextRequest } from "next/server";
import{S3Client, ListObjectsV2Command} from '@aws-sdk/client-s3'


const client = new S3Client({
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
    region: 'ap-south-1'
});









export async function GET(request: NextRequest) {
    const prefix = request.nextUrl.searchParams.get('prefix') ?? undefined
    
    try {
        const command = new ListObjectsV2Command({
            Bucket: 's3ui-buket3',
            Delimiter: '/',
            Prefix: prefix, // Now actually using the prefix parameter
        });
        
        const result = await client.send(command);
        console.log('S3 Result:', result);
        
        // Only get root level items (files and folders at the current prefix level)
        const folders = (result.CommonPrefixes || []).map(prefixObj => ({
            name: prefixObj.Prefix?.replace(prefix || '', '').replace('/', '') || '',
            type: 'folder',
            prefix: prefixObj.Prefix
        }));
        
        // Only get files at the current level (exclude folder markers)
        const files = (result.Contents || [])
            .filter(obj => obj.Key !== prefix && !obj.Key?.endsWith('/'))
            .map(obj => ({
                key: obj.Key,
                name: obj.Key?.split('/').pop() || '',
                size: obj.Size,
                lastModified: obj.LastModified,
                type: 'file'
            }));
        
        return NextResponse.json({
            success: true,
            folders: folders,
            files: files,
            prefix: prefix || ''
        });
    } catch (error) {
        console.error('S3 Error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch S3 objects',
            details: error
        }, { status: 500 });
    }
}