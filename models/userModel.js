const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database'); 
const bcrypt = require('bcryptjs');
const slugify = require('slugify');

const User = sequelize.define('User', {
    userName: {
        type: DataTypes.STRING(18),
        allowNull: false,
        unique: true,
        validate: {
            len: [6, 18],
            is: /^[a-zA-Z0-9_]+$/ 
        }
    },
    slug: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
            isEmail: true 
        }
    },
    password: {
        type: DataTypes.STRING, 
        allowNull: false,
        validate: {
            len: [6, 18]
        }
    },
    passwordChangedAt: {
        type: DataTypes.DATE,
    },
    role: {
        type: DataTypes.ENUM('user', 'resturant', 'admin'),
        defaultValue: 'user', 
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    }
}, { 
    tableName: 'users', 
    timestamps: true, 
    hooks: {
        beforeSave: async (user) => {
            if (user.changed('password')) {
                user.password = await bcrypt.hash(user.password, 12);
            }
            if (user.changed('userName')) {
                user.slug = slugify(user.userName, { lower: true });
            }
        }
    }
});

module.exports = User;