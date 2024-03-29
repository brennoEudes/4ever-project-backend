import cors from "cors";
import * as dotenv from "dotenv";
import express from "express";
import { connectToDB } from "./config/db.config.js";
import { userRouter } from "./routes/user.routes.js";
import capsuleRouter from "./routes/capsule.routes.js";
// import { uploadImageRouter } from "./routes/uploadImage.routes.js"; Comentado p/ resolver BUG!

dotenv.config();
connectToDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use(`/user`, userRouter);
app.use(`/capsule`, capsuleRouter);
// app.use(`/uploadImage`, uploadImageRouter); Comentado p/ resolver BUG!

app.listen(Number(process.env.PORT), () => {
  console.log(`Server up and running at port ${process.env.PORT}`);
});
