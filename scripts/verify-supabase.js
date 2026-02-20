require('dotenv').config();
const supabase = require('../config/supabase');

async function checkConnection() {
    console.log('🔄 Connecting to Supabase...');

    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_KEY) {
        console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in .env file');
        return;
    }

    // Try to select from a table to verify connection
    // We use a query that should return 0 or more results but not fail if table exists
    try {
        const { data, error } = await supabase
            .from('job_postings')
            .select('count', { count: 'exact', head: true });

        if (error) {
            console.error('❌ Connection Failed:', error.message);
            if (error.code === 'PGRST116') {
                console.error('   Hint: The table "job_postings" might not exist. Did you run the setup SQL?');
            }
        } else {
            console.log('✅ Connection Successful!');
            console.log('   Supabase is reachable and "job_postings" table exists.');
        }
    } catch (err) {
        console.error('❌ Unexpected Error:', err.message);
    }
}

checkConnection();
