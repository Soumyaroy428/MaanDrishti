export async function connectDB(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl) {
    console.warn("DATABASE_URL is not configured; starting without a database.");
    return;
  }

  console.log(`Database configuration loaded for ${new URL(databaseUrl).host}.`);
}
