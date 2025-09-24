import { MongoHelper } from "../infrastructure/database/mongodb/MongoHelper.js";

export async function connectDatabase() {
  await MongoHelper.connect(process.env.MONGODB_URL??"", "build-pc-ai");
}
