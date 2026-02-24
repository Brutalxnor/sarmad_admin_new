import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qeksjcmnniegxewcrefd.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFla3NqY21ubmllZ3hld2NyZWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAyMjkxNCwiZXhwIjoyMDg1NTk4OTE0fQ.MJXP9ut-M4lDQ38pjwHfHFmDjrYGX-fu7jX_aCmHmxs";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspect() {
    console.log("Inspecting course_sections...");
    const { data: sec } = await supabase.from("course_sections").select("*").limit(1);
    console.log("Sections columns:", sec?.length > 0 ? Object.keys(sec[0]) : "No data");

    console.log("Inspecting course_lessons...");
    const { data: les } = await supabase.from("course_lessons").select("*").limit(1);
    console.log("Lessons columns:", les?.length > 0 ? Object.keys(les[0]) : "No data");
}

inspect();
