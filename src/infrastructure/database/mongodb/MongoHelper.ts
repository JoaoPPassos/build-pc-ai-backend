import { MongoClient,Db  } from "mongodb";

export class MongoHelper{
  private static client: MongoClient;
  private static db: Db;

  static async connect(uri:string, dbName:string){
    this.client = await MongoClient.connect(uri);
    this.db = this.client.db(dbName);
    console.log("Connected to MongoDB");
  }

  static getCollection(name:string){
    console.log("Entrou", this.db);
    return this.db?.collection(name);
  }

  static async disconnect(){
    await this.client.close();
    console.log("Disconnected from MongoDB");
  }
}