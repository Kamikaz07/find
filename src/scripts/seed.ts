import postgres from 'postgres';
import bcrypt from 'bcrypt';

const isLocal = process.env.NODE_ENV !== 'production';

const sql = postgres(process.env.POSTGRES_URL!, {
  ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
});

async function seed() {
  const email = 'admin@example.com';
  const plainPassword = 'secure123';
  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  try {
    await sql`
      INSERT INTO users (email, password)
      VALUES (${email}, ${hashedPassword})
    `;
    console.log('User seeded:', email);
  } catch (err) {
    console.error('Error seeding user:', err);
  }
}

seed();