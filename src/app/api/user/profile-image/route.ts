import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized - Please log in' },
                { status: 401 }
            );
        }

        // Get the form data
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json(
                { success: false, error: 'No file provided' },
                { status: 400 }
            );
        }

        // Validate file type (images only)
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return NextResponse.json(
                { success: false, error: 'Invalid file type. Only images (JPEG, PNG, GIF, WebP) are allowed.' },
                { status: 400 }
            );
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { success: false, error: 'File size exceeds 5MB limit' },
                { status: 400 }
            );
        }

        // 1. Remove old image(s) for this user
        // We assume images are stored in a folder named after the user ID
        const { data: listData, error: listError } = await supabase.storage
            .from('avatars')
            .list(user.id, {
                limit: 100,
                offset: 0,
                sortBy: { column: 'name', order: 'asc' },
            });

        let deletedFiles: string[] = [];

        if (listError) {
            console.error('Error listing files:', listError);
            // We continue even if list fails, but return warning
        } else if (listData && listData.length > 0) {
            const filesToRemove = listData.map(x => `${user.id}/${x.name}`);
            const { error: removeError } = await supabase.storage
                .from('avatars')
                .remove(filesToRemove);

            if (removeError) {
                console.error('Error removing old files:', removeError);
            } else {
                deletedFiles = filesToRemove;
            }
        }

        // 2. Upload new image
        const timestamp = Date.now();
        const fileExt = file.name.split('.').pop();
        const fileName = `${user.id}/${timestamp}.${fileExt}`;

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const { error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(fileName, buffer, {
                contentType: file.type,
                upsert: true
            });

        if (uploadError) {
            throw uploadError;
        }

        // 3. Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('avatars')
            .getPublicUrl(fileName);

        // 4. Update user metadata with the new avatar URL
        const { error: updateError } = await supabase.auth.updateUser({
            data: { avatar_url: publicUrl }
        });

        if (updateError) {
            console.error('Error updating user metadata:', updateError);
        }

        return NextResponse.json({
            success: true,
            data: {
                url: publicUrl,
                deleted: deletedFiles,
                debug: {
                    listed: listData?.length || 0,
                    folder: user.id
                }
            }
        }, { status: 200 });

    } catch (error: any) {
        console.error('Error uploading profile image:', error);
        return NextResponse.json(
            { success: false, error: error.message || 'Unknown error' },
            { status: 500 }
        );
    }
}
