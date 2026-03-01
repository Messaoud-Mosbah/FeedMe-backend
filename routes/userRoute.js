const express = require("express");

const {
  createUser,
  getAllUsers,
  getUser,
  getUserByIdentifier,
  updateUserMain,

  deleteUser,
  changeUserPassword,
} = require("../services/userService");

const {
  createUserValidator,
  updateUserValidator,
  getUserValidator,
  deleteUserValidator,
  getUserByIdentifierValidator,
  changeUserPasswordValidator,

} = require("../utils/validators/userValidator");

const router = express.Router();


router.post("/", ...createUserValidator, createUser);
router.get("/", getAllUsers);
router.get("/get-user", ...getUserByIdentifierValidator, getUserByIdentifier);

router.get("/:id", ...getUserValidator, getUser);
router.put("/:id", ...updateUserValidator, updateUserMain);

router.put(
  "/change-user-password/:id",
  ...changeUserPasswordValidator,
  changeUserPassword,
);
router.delete("/:id", ...deleteUserValidator, deleteUser);




module.exports = router;
