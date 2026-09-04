import mongoose from "mongoose";

export async function connectDB(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  const databaseName = process.env.DATABASE_NAME || "maandrishti";

  if (!databaseUrl) {
    console.warn("DATABASE_URL is not configured; starting without a database.");
    return;
  }

  try {
    await mongoose.connect(databaseUrl, {
      dbName: databaseName,
    });
    console.log(`📊 Connected to MongoDB: ${new URL(databaseUrl).host}/${databaseName}`);
  } catch (error) {
    console.error("❌ Failed to connect to MongoDB:", error);
    throw error;
  }
}
