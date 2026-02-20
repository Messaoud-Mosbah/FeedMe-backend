const express = require("express");

const {
  createUser,
  getAllUsers,
  getUser,
  getUserByIdentifier,
  updateUser,
  deleteUser,
  changeUserPassword
} = require("../services/userService");

const {
  createUserValidator,
  updateUserValidator,
  getUserValidator,
  deleteUserValidator,
  getUserByIdentifierValidator,
  changeUserPasswordValidator // تأكد من استيراد الـ Validator الخاص بالباسورد
} = require("../utils/validators/userValidator");

const router = express.Router();

router.post("/", createUserValidator, createUser);
router.get("/", getAllUsers);
router.get("/user", getUserByIdentifierValidator, getUserByIdentifier);

// ✅ التصحيح: كان هناك تكرار لاسم الدالة (changeUserPassword) مرتين
// يجب وضع الـ Validator أولاً ثم الـ Service
router.put("/changeUserPassword/:id", changeUserPasswordValidator, changeUserPassword);

router.get("/:id", getUserValidator, getUser);
router.put("/:id", updateUserValidator, updateUser);
router.delete("/:id", deleteUserValidator, deleteUser);

module.exports = router;