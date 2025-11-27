import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import userRouter from "./routes/userRouter.js";
import salaryRouter from "./routes/salaryRouter.js";
import dashboardRouter from "./routes/dashboardRouter.js";
import morgan from "morgan";
import logger from "./logger/logger.js";

//init app
var app = express();

//third-party middleware
app.use(cors());
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim())
    }
  })
);

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

//routes section
app.use("/api/auth", userRouter);
app.use("/api/salary", salaryRouter);
app.use("/api/dashboard", dashboardRouter);

app.listen(8000, () => {
  console.log("Server is running on port 8000");
});
