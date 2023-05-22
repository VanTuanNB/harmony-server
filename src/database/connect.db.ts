import mongoose, { Mongoose } from 'mongoose';

export default class Database {
    public static async connect(): Promise<mongoose.mongo.Db> {
        try {
            mongoose.set('strictQuery', true);
            await mongoose.connect(process.env.DATABASE_URL as string, {});
            console.log('Connected database successfully!!!');
            return mongoose.connection.db;
        } catch (error) {
            console.log('Failed to connect to database!!!');
            return mongoose.connection.db;
        }
    }

    public static async disconnect(): Promise<void> {
        try {
            mongoose.connection.close();
            mongoose.disconnect();
            console.log('Disconnected from the database!');
        } catch (error) {
            console.log('Fail to disconnect from the database!');
        }
    }
}
