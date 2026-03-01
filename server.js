const dotenv = require("dotenv");
const express = require("express");
const cors = require("cors");
const path = require('path');


// 1. الإعدادات الأولية
dotenv.config({ path: "config.env" });



const { dbConnection, sequelize } = require("./config/database");
const morgan = require("morgan");
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");


// 2. استدعاء الموديلات (ضروري جداً لإنشاء الجداول في MySQL)
const User = require("./models/userModel");
const RestaurantProfile = require("./models/restaurantProfileModel");
const UserProfile = require("./models/userProfileModel");

// 3. استدعاء الراوتس (Routes)
const userRouter = require("./routes/userRoute");
const authRouter = require("./routes/authRoute");

// الاتصال بقاعدة البيانات
dbConnection();

const app = express();


app.use(express.static(path.join(__dirname, 'front_test')));

// 4. الميدل وير (Middlewares)

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// 5. تركيب المسارات (Mount Routes)
app.use("/api/users", userRouter);
app.use("/api/authentication", authRouter);

// معالجة المسارات غير الموجودة
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

// ميدل وير معالجة الأخطاء العالمي
app.use(globalError);

const PORT = process.env.PORT || 8000;

// 6. مزامنة الجداول وتشغيل السيرفر
// استخدام { alter: true } يضيف الأعمدة والجداول الجديدة دون حذف البيانات القديمة
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("✅ All models & relations were synchronized successfully.");
    app.listen(PORT, () => {
      console.log(`🚀 Server started at port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ Unable to sync database:", err);
  });

// التعامل مع الأخطاء خارج نطاق إكسبريس
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  process.exit(1);
});
