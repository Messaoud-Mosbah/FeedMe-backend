const path = require('path'); // تم تعريفه هنا مرة واحدة فقط
const dotenv = require('dotenv');
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

// إعداد الإعدادات: سيقرأ من Render أو من الملف المحلي إذا وجد
dotenv.config({ path: path.join(__dirname, 'config.env') });

const { sequelize } = require("./config/database"); 
const ApiError = require("./utils/apiError");
const globalError = require("./middlewares/errorMiddleware");

// استيراد الموديلات
const User = require("./models/userModel");
const RestaurantProfile = require("./models/restaurantProfileModel");
const UserProfile = require("./models/userProfileModel");

// الراوتس
const userRouter = require("./routes/userRoute");
const authRouter = require("./routes/authRoute");

const app = express();

// الملفات الثابتة (Frontend Test)
app.use(express.static(path.join(__dirname, 'front_test')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// وضع التطوير (Morgan)
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode: ${process.env.NODE_ENV}`);
}

// استخدام الراوتس
app.use("/api/users", userRouter);
app.use("/api/authentication", authRouter);

// معالجة الروابط غير الموجودة
app.all("*", (req, res, next) => {
  next(new ApiError(`Can't find this route: ${req.originalUrl}`, 400));
});

app.use(globalError);

const PORT = process.env.PORT || 8000;

// تشغيل السيرفر بعد التأكد من الاتصال بقاعدة البيانات
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server started at port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Unable to connect to the database:", err);
    process.exit(1); 
  }
};

startServer();

// معالجة الأخطاء غير المتوقعة
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection Errors: ${err.name} | ${err.message}`);
  process.exit(1);
});