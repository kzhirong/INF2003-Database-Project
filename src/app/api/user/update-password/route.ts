import { createClient } from "@/lib/supabase/server";
import { createClient as createJsClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { oldPassword, newPassword } = await request.json();

        if (!oldPassword || !newPassword) {
            return NextResponse.json(
                { error: "Missing password fields" },
                { status: 400 }
            );
        }

        const supabase = await createClient();

        // 1. Get the currently logged in user
        const { data: { user }, error: userError } = await supabase.auth.getUser();

        if (userError || !user || !user.email) {
            return NextResponse.json(
                { error: "Unauthorized" },
                { status: 401 }
            );
        }

        // 2. Verify old password using a separate client to avoid messing with current session
        // We use a fresh client just to check credentials
        const tempClient = createJsClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error: signInError } = await tempClient.auth.signInWithPassword({
            email: user.email,
            password: oldPassword,
        });

        if (signInError) {
            return NextResponse.json(
                { error: "Incorrect old password" },
                { status: 400 }
            );
        }

        // 3. Update to new password using the authenticated server client
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword,
        });

        if (updateError) {
            return NextResponse.json(
                { error: updateError.message },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Password update error:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
