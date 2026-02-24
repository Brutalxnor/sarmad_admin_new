import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qeksjcmnniegxewcrefd.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFla3NqY21ubmllZ3hld2NyZWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAyMjkxNCwiZXhwIjoyMDg1NTk4OTE0fQ.MJXP9ut-M4lDQ38pjwHfHFmDjrYGX-fu7jX_aCmHmxs";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspect() {
    const userId = 'f8a799cf-d395-4308-9b02-cfe6ed0e1149';
    console.log(`Inspecting hst_orders for user ${userId}...`);
    const { data, error } = await supabase.from("hst_orders").select("*").eq("user_id", userId);

    if (error) {
        console.error("Error:", error.message);
    } else {
        console.log("Success! Orders found:", data.length);
        data.forEach((order, i) => {
            console.log(`Order ${i + 1}:`, order);
        });
    }
}

inspect();
