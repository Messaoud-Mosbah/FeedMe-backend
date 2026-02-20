const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const ApiError = require("../utils/apiError");
const User = require("../models/userModel"); 
const { Op } = require("sequelize"); // ضروري جداً لعمليات البحث المعقدة (OR)

// 1. Create User
exports.createUser = (Model) =>
  asyncHandler(async (req, res) => {
    // Sequelize يستخدم نفس الاسم create
    const doc = await Model.create(req.body);
    res.status(201).json({ data: doc });
  });

// 2. Get All Users
exports.getallUsers = (Model) =>
  asyncHandler(async (req, res) => {
    // التغيير: findAll بدلاً من find
    const docs = await Model.findAll();
    res.status(200).json({ data: docs });
  });

// 3. Get Single User
exports.getSingleUser = (Model) =>
  asyncHandler(async (req, res, next) => { 
    // التغيير: findByPk للبحث بالمفتاح الأساسي (Primary Key)
    const doc = await Model.findByPk(req.params.id);
    if (!doc) {
      return next(new ApiError(`No user found for this id ${req.params.id}`, 404));
    }
    res.status(200).json({ data: doc });
  });

// 4. Get specific user by email or userName
exports.getUserByIdentifier = asyncHandler(async (req, res, next) => {
  const { identifier } = req.query;

  // التغيير: استخدام Op.or و كائن where
  const user = await User.findOne({
    where: {
      [Op.or]: [
        { email: identifier },
        { userName: identifier }
      ]
    }
  });

  if (!user) {
    return next(new ApiError(`No user found for: ${identifier}`, 404));
  }

  res.status(200).json({ status: "success", data: user });
});

// 5. Update user information
exports.updateUser = asyncHandler(async (req, res, next) => {
  // التغيير: update ترجع مصفوفة فيها عدد الصفوف المتأثرة
  const [updatedRows] = await User.update(
    {
      userName: req.body.userName,
      email: req.body.email,
      // تأكد أن phone موجود في الـ Model الخاص بـ MySQL
    },
    {
      where: { id: req.params.id }
    }
  );

  if (updatedRows === 0) {
    return next(new ApiError(`No document for this id ${req.params.id}`, 404));
  }

  // لجلب البيانات الجديدة بعد التحديث
  const updatedDoc = await User.findByPk(req.params.id);
  res.status(200).json({ data: updatedDoc });
});

// 6. Change the password
exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  // في Sequelize الباسورد يأتي تلقائياً إلا لو قمت بعمل Scope لإخفائه
  const user = await User.findByPk(req.params.id);

  if (!user) {
    return next(new ApiError(`No user found for this id ${req.params.id}`, 404));
  }

  const isCorrectPassword = await bcrypt.compare(
    req.body.currentPassword, 
    user.password           
  );

  if (!isCorrectPassword) {
    return next(new ApiError("Current password is wrong", 401));
  }

  // التغيير: إسناد القيمة ثم استدعاء save (سيعمل الـ beforeSave hook لتشفيراً)
  user.password = req.body.password;
  user.passwordChangedAt = new Date();

  await user.save();

  res.status(200).json({ 
    status: "success",
    message: "Password changed successfully" 
  });
});

// 7. Delete User
exports.deleteUser = (Model) =>
  asyncHandler(async (req, res, next) => { 
    // التغيير: destroy بدلاً من findByIdAndDelete
    const deletedRow = await Model.destroy({
      where: { id: req.params.id }
    });

    if (!deletedRow) {
      return next(new ApiError(`No user found for this id ${req.params.id}`, 404));
    }

    res.status(200).json({
      status: "success",
      message: "User deleted successfully",
    });   
  });