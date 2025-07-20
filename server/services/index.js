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
import BonusMasterModel from "./bonus_master/bonus.master.model.js";
import BonusHistoryModel from "./bonus_history/bonus.history.model.js";
import CouponMasterModel from "./coupon_master/coupon.master.model.js";
import ScoreHistoryModel from "./score_history/score.history.model.js";
import ScoreEligibilityMapping from "./score_eligibility_mapping/score.eligibility.mapping.model.js";
import RoleMasterModel from "./access_control/role_master/role.master.model.js";
import ScoreCategoryModel from "./score_category/score.category.model.js";
import PostsModel from "./Posts/posts.model.js";
import PostMediaModel from "./PostMedia/postmedia.model.js";
import LikesModel from "./Likes/likes.model.js";
import CommentsModel from "./Comments/comments.model.js";
import RequestMediaModel from "./request_media/request.media.model.js";
import UserBlackListModel from "./user_blacklist/user.blacklist.model.js";
import NgoTypesModel from "./ngo_type/ngo.type.model.js";
import UserTokenModel from "./user_tokens/user.tokens.model.js";
// import NotificationModel from "./notifications/notifications.model.js";
import NotificationHistoryModel from "./notification_history/notification.history.model.js";
import NgoMediaModel from "./ngo_media/ngo.media.model.js";
import NgolikesModel from "./ngo_likes/ngo.likes.model.js";
import PagePermissionModel from "./access_control/page_permission/page.permission.model.js";
import GroupRolePagePermissionModel from "./access_control/group_role_page_permission/group.role.page.permission.model.js";
import NgoLevelModel from "./access_control/ngo_level/ngo.level.model.js";

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
  // benchmark: true,
  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle,
  }
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
db.BonusMasterModel = BonusMasterModel(sequelize,Sequelize);
db.BonusHistoryModel = BonusHistoryModel(sequelize,Sequelize);
db.CouponMasterModel = CouponMasterModel(sequelize,Sequelize);
db.ScoreHistoryModel = ScoreHistoryModel(sequelize,Sequelize);
db.ScoreEligibilityMapping = ScoreEligibilityMapping(sequelize,Sequelize);
db.RoleMasterModel = RoleMasterModel(sequelize,Sequelize);
db.ScoreCategoryModel = ScoreCategoryModel(sequelize,Sequelize);
db.PostsModel = PostsModel(sequelize,Sequelize);
db.PostMediaModel = PostMediaModel(sequelize,Sequelize);
db.LikesModel = LikesModel(sequelize,Sequelize);
db.CommentsModel = CommentsModel(sequelize,Sequelize);
db.RequestMediaModel = RequestMediaModel(sequelize,Sequelize);
db.UserBlackListModel = UserBlackListModel(sequelize,Sequelize);
db.NgoTypesModel = NgoTypesModel(sequelize,Sequelize);
db.UserTokenModel = UserTokenModel(sequelize,Sequelize);
db.NotificationHistoryModel = NotificationHistoryModel(sequelize,Sequelize);
db.NgoMediaModel = NgoMediaModel(sequelize,Sequelize);
db.NgolikesModel = NgolikesModel(sequelize,Sequelize);
db.PagePermissionModel = PagePermissionModel(sequelize,Sequelize);
db.GroupRolePagePermissionModel = GroupRolePagePermissionModel(sequelize,Sequelize);
db.NgoLevelModel = NgoLevelModel(sequelize,Sequelize);


export default db