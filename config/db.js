import mongoose from "mongoose";

mongoose.set("strictQuery", false);

const connectDatabase = async() => {
    try {
        const {connection} = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Connected successfully to MongoDB: ${connection.host}`);
    } catch (error) {
        console.log(error);
        process.exit(1);
    }
}

export default connectDatabase;