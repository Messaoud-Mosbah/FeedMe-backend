
const asyncHandler = require('express-async-handler');
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const { GENERATE_TOKEN } = require('../utils/createToken');
const bcrypt = require('bcryptjs');
const ApiError = require("../utils/apiError");
const { Op } = require('sequelize'); // استيراد العمليات للمقارنة (OR)

// @desc    Signup
const signup = asyncHandler(async (req, res) => {
    const { userName, email, password, role } = req.body;

    const newUser = await User.create({
        userName,
        email,
        password,
        role // أضفناه ليقبل الـ Role المختار عند التسجيل
    });

    // التعديل: استخدام id بدلاً من _id
    const token = await GENERATE_TOKEN({ email: newUser.email, id: newUser.id, userName: newUser.userName });
    
    // إزالة الباسورد من الرد
    newUser.password = undefined;

    res.status(201).json({ status: 'success', data: { user: newUser, token: token } });
});

// @desc    Login
const login = asyncHandler(async (req, res, next) => {
    const { identity, password } = req.body;

    if (!identity || !password) {
        return next(new ApiError("Email/Username and password are required", 400));
    }

    // التعديل: استخدام Op.or للبحث في Sequelize
    const user = await User.findOne({
        where: {
            [Op.or]: [
                { email: identity },
                { userName: identity }
            ]
        }
    });

    // التعديل: التحقق من الباسورد (Sequelize لا يخفي الباسورد تلقائياً كما في Mongoose)
    if (!user || !(await bcrypt.compare(password, user.password))) {
        return next(new ApiError("Invalid email/username or password", 401));
    }

    const token = GENERATE_TOKEN({
        id: user.id, // التعديل لـ id
        email: user.email,
        userName: user.userName
    });

    user.password = undefined;

    res.status(200).json({
        status: "success",
        message: "You are logged in successfully",
        token,
        data: { user }
    });
});

// AuthController.js
const updateUserRole = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return next(new ApiError("User not found", 404));

    user.role = req.body.role; 
    await user.save();

    res.status(200).json({ status: "success", message: "Role updated" });
  } catch (err) { next(err); }
};
// @desc    Protect Middleware
const protect = asyncHandler(async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
        return next(new ApiError('You are not logged in, please login', 401));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // التعديل: استخدام findByPk للبحث بالمعرف الأساسي (Primary Key)
    const currentUser = await User.findByPk(decoded.id);
    
    if (!currentUser) {
        return next(new ApiError('The user belonging to this token no longer exists', 401));
    }
    
    req.user = currentUser;
    next();
});

module.exports = { signup, login, updateUserRole, protect };