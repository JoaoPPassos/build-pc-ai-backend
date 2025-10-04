import { MongoHelper } from "../infrastructure/database/mongodb/MongoHelper";

export async function connectDatabase() {
  await MongoHelper.connect(process.env.MONGODB_URL ?? "", "build-pc-ai");
}
