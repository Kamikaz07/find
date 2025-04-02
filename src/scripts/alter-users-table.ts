import postgres from 'postgres';

const isLocal = process.env.NODE_ENV !== 'production';

const sql = postgres(process.env.POSTGRES_URL!, {
  ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
});

async function alterUsersTable() {
  try {
    // First, check if the column already exists
    const checkColumnQuery = await sql`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'users' 
      AND column_name = 'receive_updates'
    `;

    if (checkColumnQuery.length === 0) {
      // Add the column if it doesn't exist
      await sql`
        ALTER TABLE users 
        ADD COLUMN receive_updates BOOLEAN DEFAULT FALSE
      `;
      console.log('Added receive_updates column to users table');
    } else {
      console.log('receive_updates column already exists');
    }
  } catch (err) {
    console.error('Error altering users table:', err);
  } finally {
    await sql.end();
  }
}

alterUsersTable(); 