import mongoose from "mongoose";

export const connectDB = async ()=>{
try {
    const{
        MONGO_USER,
        MONGO_PASSWORD,
        MONGO_CLUSTER,
        MONGO_DB
    }= process.env;

    const url = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@${MONGO_CLUSTER}/${MONGO_DB}?retryWrites=true&w=majority`;

    await mongoose.connect(url);

    console.log("MongoDB Connected");
} catch (error) {
    console.error('MongoDB Connection Failed due to', error);
    process.exit(1);
}
}