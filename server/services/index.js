import dbConfig from "../config/db/db.config.js";
import { Sequelize } from "sequelize";

// ALL IMPORTS OF MODEL START FROM HERE
import UserMasterModel from "./user_master/user.master.model.js";
import StateMasterModel from "./state_master/state.master.model.js";
import CityMasterModel from "./city_master/city.master.model.js";
import CountryMasterModel from "./country_master/country.master.model.js";
import NgoFieldModel from "./ngo_field/ngo.field.model.js";
import DesignationMasterModel from "./designation_master/designation.master.model.js";
import TableMasterModel from "./table_master/table.master.model.js";
import NgoMasterModel from "./ngo_master/ngo.master.model.js";
import NgoOfficeBearersModel from "./ngo_office_bearers/ngo.office.bearers.model.js";
import NgoStateDistritMappingModel from "./ngo_state_district_mapping/ngo.state.district.mapping.model.js";
import UserActivityModel from "./user_activity/user.activity.model.js";
import RequestModel from "./requests/requests.model.js";
import RequestNgoModel from "./request_ngo/request.ngo.model.js";
import NgoFieldsMappingModel from "./ngo_field_mapping/ngo.field.mapping.model.js";
import DistrictMasterModel from "./district_master/district.master.model.js";
import StatusMasterModel from "./status_master/status.master.model.js";


// Determine the environment (development or production)
const environment = process.env.NODE_ENV || "development";

// Select the appropriate configuration based on the environment

const config = await dbConfig[environment];
// Initialize a new Sequelize instance with the selected configuration
const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.DIALECT,
  port: config.PORT ?? 3306,
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
db.StateMasterModel = StateMasterModel(sequelize,Sequelize);
db.CityMasterModel = CityMasterModel(sequelize,Sequelize);
db.CountryMasterModel = CountryMasterModel(sequelize,Sequelize);
db.NgoFieldModel = NgoFieldModel(sequelize,Sequelize);
db.DesignationMasterModel = DesignationMasterModel(sequelize,Sequelize);
db.TableMasterModel = TableMasterModel(sequelize,Sequelize);
db.NgoMasterModel = NgoMasterModel(sequelize,Sequelize);
db.NgoOfficeBearersModel = NgoOfficeBearersModel(sequelize,Sequelize);
db.NgoStateDistritMappingModel = NgoStateDistritMappingModel(sequelize,Sequelize);
db.UserActivityModel = UserActivityModel(sequelize,Sequelize);
db.RequestModel = RequestModel(sequelize,Sequelize);
db.RequestNgoModel = RequestNgoModel(sequelize,Sequelize);
db.NgoFieldsMappingModel = NgoFieldsMappingModel(sequelize,Sequelize);
db.DistrictMasterModel = DistrictMasterModel(sequelize,Sequelize);
db.StatusMasterModel = StatusMasterModel(sequelize,Sequelize);


export default db