import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qeksjcmnniegxewcrefd.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFla3NqY21ubmllZ3hld2NyZWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAyMjkxNCwiZXhwIjoyMDg1NTk4OTE0fQ.MJXP9ut-M4lDQ38pjwHfHFmDjrYGX-fu7jX_aCmHmxs";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspect() {
    console.log("Inspecting course_lessons structure...");

    // We can use a trick to get error message from DB by trying to insert an invalid value
    const { error } = await supabase.from("course_lessons").insert({
        section_id: '00000000-0000-0000-0000-000000000000', // Dummy UUID
        title: 'Check Constraints',
        content_type: 'INVALID_TYPE',
        order_index: 0
    });

    if (error) {
        console.log("Error message (should contain allowed values):", error.message);
    } else {
        console.log("Wait, it accepted INVALID_TYPE?");
    }
}

inspect();
