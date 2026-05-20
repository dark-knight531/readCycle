
import mongoose from "mongoose";
const connectDB = async () => {
    try{
       const connectInstance =  await mongoose.connect(`${process.env.MONGODB_URI}`);
       console.log(`the database is connect at ${connectInstance.connection.host}`)
    }
    catch(error){
        console.error("the error is :" , error);
        process.exit(1);
    }
}

export default connectDB;