import { createClient } from '@supabase/supabase-js';

const supabaseUrl = "https://qeksjcmnniegxewcrefd.supabase.co";
const supabaseServiceKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFla3NqY21ubmllZ3hld2NyZWZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDAyMjkxNCwiZXhwIjoyMDg1NTk4OTE0fQ.MJXP9ut-M4lDQ38pjwHfHFmDjrYGX-fu7jX_aCmHmxs";

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function probe() {
    console.log("Probing Questions table...");
    const { data: q, error: qe } = await supabase.from('questions').select('*').limit(1);
    if (qe) console.error("Questions Error:", qe.message);
    else console.log("Questions Columns:", q.length > 0 ? Object.keys(q[0]) : "Empty table");

    console.log("\nProbing Answers table...");
    const { data: a, error: ae } = await supabase.from('answers').select('*').limit(1);
    if (ae) console.error("Answers Error:", ae.message);
    else console.log("Answers Columns:", a.length > 0 ? Object.keys(a[0]) : "Empty table");

    console.log("\nProbing Information Schema for columns...");
    const { data: cols, error: cole } = await supabase.rpc('get_table_columns', { table_name: 'questions' });
    if (cole) {
        // Fallback to manual query via PostgREST if RPC not available
        console.log("RPC get_table_columns failed, trying manual select...");
        const { data: rawCols, error: rawE } = await supabase
            .from('information_schema.columns' as any)
            .select('column_name, data_type')
            .eq('table_name', 'questions')
            .eq('table_schema', 'public');
        if (rawE) console.error("Manual Info Schema Error:", rawE.message);
        else console.log("Questions Schema:", rawCols);

        const { data: rawColsA, error: rawEA } = await supabase
            .from('information_schema.columns' as any)
            .select('column_name, data_type')
            .eq('table_name', 'answers')
            .eq('table_schema', 'public');
        if (rawEA) console.error("Manual Info Schema Error (Answers):", rawEA.message);
        else console.log("Answers Schema:", rawColsA);
    } else {
        console.log("Questions RPC Schema:", cols);
    }
}

probe();
