import app from "./app";
import dotenv from "dotenv";
import { env } from "./config/env";
import { connectDB } from "./config/db";

dotenv.config();

connectDB().then(()=>{
app.listen(Number(env.PORT), () => {
  console.log(`🚀 EstateFlow running on port ${env.PORT}`);
});
})


