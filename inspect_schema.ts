import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://qeksjcmnniegxewcrefd.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFla3NqY21ubmllZ3hld2NyZWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAyMjkxNCwiZXhwIjoyMDg1NTk4OTE0fQ.MJXP9ut-M4lDQ38pjwHfHFmDjrYGX-fu7jX_aCmHmxs";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function inspectSchema() {
    console.log("Fetching all columns for hst_orders...");
    const { data, error } = await supabase.rpc('get_table_columns', { table_name: 'hst_orders' });

    if (error) {
        console.warn("RPC get_table_columns failed, trying another way:", error.message);
        // Fallback: fetch a row and look at keys
        const { data: row } = await supabase.from('hst_orders').select('*').limit(1);
        if (row && row.length > 0) {
            console.log("Columns from sample row:", Object.keys(row[0]));
        }
    } else {
        console.log("Schema columns:", data);
    }
}

inspectSchema();
