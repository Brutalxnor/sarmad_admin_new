import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qeksjcmnniegxewcrefd.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFla3NqY21ubmllZ3hld2NyZWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAyMjkxNCwiZXhwIjoyMDg1NTk4OTE0fQ.MJXP9ut-M4lDQ38pjwHfHFmDjrYGX-fu7jX_aCmHmxs";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspect() {
    console.log("Fetching existing lessons...");
    const { data, error } = await supabase.from("course_lessons").select("content_type").limit(10);

    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log("Sample content types:", data.map(d => d.content_type));
    }
}

inspect();
