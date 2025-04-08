import mongoose, { ConnectOptions } from "mongoose";

export const connectToDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGOD_URL_LIVE;

    if (!mongoUri) {
      throw new Error(
        "MONGOD_URL_LIVE is not defined in environment variables."
      );
    }

    const conn = await mongoose.connect(mongoUri, {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    } as ConnectOptions);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${(error as Error).message}`);
    process.exit(1);
  }
};
