import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import userRouter from "./routes/userRouter.js";
import salaryRouter from "./routes/salaryRouter.js";
import db from "./init/mysqlConnection.js";

//init app
var app = express();

//third-party middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//routes section
app.use("/api/auth", userRouter);
app.use("/api/salary", salaryRouter);

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
