import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qeksjcmnniegxewcrefd.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFla3NqY21ubmllZ3hld2NyZWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAyMjkxNCwiZXhwIjoyMDg1NTk4OTE0fQ.MJXP9ut-M4lDQ38pjwHfHFmDjrYGX-fu7jX_aCmHmxs";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectLessonTable() {
    console.log("Inspecting course_lessons columns...");
    const { data, error } = await supabase.from('course_lessons').select('*').limit(1);

    if (error) {
        console.error("Error fetching lesson:", error.message);
    } else if (data && data.length > 0) {
        console.log("Columns found in course_lessons:", Object.keys(data[0]));
    } else {
        console.log("No lessons found to inspect columns.");
        // Try getting an error to see valid columns? No, better use RPC or just guess.
        // Actually, if it's empty, we might not see all columns if some are null? Select * should show all keys in the object if they are defined in the view.
    }
}

inspectLessonTable();
