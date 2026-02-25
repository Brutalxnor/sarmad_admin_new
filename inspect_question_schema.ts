import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qeksjcmnniegxewcrefd.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFla3NqY21ubmllZ3hld2NyZWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAyMjkxNCwiZXhwIjoyMDg1NTk4OTE0fQ.MJXP9ut-M4lDQ38pjwHfHFmDjrYGX-fu7jX_aCmHmxs";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectQuestions() {
    console.log("Inspecting questions table...");
    const { data: questions, error } = await supabase.from("questions").select("*").limit(1);

    if (error) {
        console.error("Error fetching questions:", error.message);
    } else if (questions && questions.length > 0) {
        console.log("Questions Columns:", Object.keys(questions[0]));
        console.log("Sample Question:", questions[0]);
    } else {
        console.log("No questions found.");
    }

    console.log("\nSearching for other question-related tables...");
    // Try common names
    const tables = ["question_options", "question_answers", "options", "answers"];
    for (const table of tables) {
        const { data, error: tableError } = await supabase.from(table).select("*").limit(1);
        if (!tableError) {
            console.log(`Found table: ${table}`);
            if (data && data.length > 0) {
                console.log(`${table} Columns:`, Object.keys(data[0]));
            }
        }
    }
}

inspectQuestions();
