const bcrypt = require("bcryptjs");
const { sequelize } = require("../config/database");
const { Sequelize, DataTypes } = require('sequelize');

const slugify = require("slugify");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4, 
      primaryKey: true,
    },
    userName: {
      type: Sequelize.STRING(100), 
      unique: true,
      validate: {
        len: [3, 30],
        is: /^[a-zA-Z0-9_-]+$/,
      },
    },
    slug: {
      type: DataTypes.STRING,
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: {
        name: 'unique_user_email',
        message:"this email is already registed"
      },
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    passwordChangedAt: {
      type: DataTypes.DATE,
    },
    role: {
      type: DataTypes.ENUM("USER", "RESTAURANT", "ADMIN"),
      defaultValue: "USER",
    },
    active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    verificationToken: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    // ---------------------------------------
  },
  {
    tableName: "users",
    timestamps: true,
    hooks: {
      beforeSave: async (user) => {
        if (user.changed("password")) {
          user.password = await bcrypt.hash(user.password, 12);
        }
        if (user.changed("userName")) {
          user.slug = slugify(user.userName, { lower: true });
        }
      },
    },
  }
);

module.exports = User;
