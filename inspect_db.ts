import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qeksjcmnniegxewcrefd.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFla3NqY21ubmllZ3hld2NyZWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAyMjkxNCwiZXhwIjoyMDg1NTk4OTE0fQ.MJXP9ut-M4lDQ38pjwHfHFmDjrYGX-fu7jX_aCmHmxs";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspect() {
    console.log("Inspecting courses table...");
    const { data, error } = await supabase.from("courses").select("*").limit(1);

    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log("Success! Courses found:", data.length);
        if (data.length > 0) {
            console.log("Columns:", Object.keys(data[0]));
            console.log("Sample:", data[0]);
        } else {
            console.log("No rows found. Checking table structure via RPC if available...");
            // Try to insert a dummy row to see what fails
            const { error: insertError } = await supabase.from("courses").insert({ title: "test" });
            console.log("Dummy insert result:", insertError?.message || "No error (Wait, that means it works with just title)");
        }
    }
}

inspect();
