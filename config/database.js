
const { Sequelize } = require('sequelize');//convert js to MYSQL

const sequelize = new Sequelize(
  process.env.DB_NAME,      
  process.env.DB_USER,      
  process.env.DB_PASSWORD,  
  {
    host: process.env.DB_HOST, 
    port: process.env.DB_PORT || 3306, 
    dialect: 'mysql',//my sql language
    logging: false, // لمنع امتلاء الكونسول بأوامر SQL
  }
);

const dbConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log(`✅ MySQL Connected: ${process.env.DB_HOST} / ${process.env.DB_NAME}`);
  } catch (error) {
    console.error('❌ Unable to connect to the database:', error.message);
    process.exit(1); 
  }
};

module.exports = { sequelize, dbConnection };