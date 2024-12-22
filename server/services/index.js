import dbConfig from "../config/db/db.config.js";
import { Sequelize } from "sequelize";

// ALL IMPORTS OF MODEL START FROM HERE
import UserMasterModel from "./user_master/user.master.model.js";






// Determine the environment (development or production)
const environment = process.env.NODE_ENV || "development";

// Select the appropriate configuration based on the environment

const config = await dbConfig[environment];
// Initialize a new Sequelize instance with the selected configuration
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.DIALECT,
  port: 3306,
  operatorsAliases: 0,
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  },
});
// sequelize.authenticate()
//   .then(() => {
//     console.log('Connection to the database has been established successfully.');
//   })
//   .catch((err) => {
//     console.error('Unable to connect to the database:', err.message);
//   });


const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;
db.UserMasterModel = UserMasterModel(sequelize,Sequelize);


export default db