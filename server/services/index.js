import dbConfig from "../config/db/db.config.js";
import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
console.log("NODE_ENV raw:", process.env.NODE_ENV);


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
import BlogsModel from "./blogs/blogs.model.js"; 
import BlogMediaModel from "./blog_media/blog.media.model.js";
import RequestTagModel from "./request_tag/request.tag.model.js";
import PostTagModel from "./post_tag/post.tag.model.js";
import UserRequestStatsModel from "./user_request_stats/user.request.stats.model.js";
import QuotesModel from "./quotes/quotes.model.js";
import ReportTypeModel from "./report_type/report.type.model.js";
import ReportPageTypeModel from "./report_page_type/report.page.type.model.js";
import TicketModuleTypeModel from "./ticket_module_type/ticket.module.type.model.js";
import TicketModel from "./ticket/ticket.model.js";
import ModuleTypeModel from "./module_type/module.type.model.js";
import BugTypeModel from "./bug_type/bug.type.model.js";
import TicketMediaModel from "./ticket_media/ticket.media.model.js";
import NgoDesignationMasterModel from "./ngo_designation_master/ngo.designation.master.model.js";
import NgoUserMasterModel from "./ngo_user_master/ngo.user.master.model.js";
import NgoRegistrationModel from "./ngo_registration/ngo.registration.model.js";
import OtpTypeMasterModel from "./otp_type_master/otp.type.master.model.js";
import UserOtpLogModel from "./user_otp_log/user.otp.log.model.js";
import TempEmailVerificationModel from "./temp_email_verification/temp.email.verification.model.js";
import RequestDocumentsTypesModel from "./request_document_types/request.document.types.model.js";
import NgoRequestDocumentCategoryModel from "./ngo_request_document_category/ngo.request.document.category.model.js";
import RequestDocumentModel from "./request_documents/request.documents.model.js";

// Determine the environment (development or production)
const environment = process.env.NODE_ENV || "development";
console.log("environment",environment)

// Select the appropriate configuration based on the environment

const config = await dbConfig[environment];
// Initialize a new Sequelize instance with the selected configuration
// const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
//   host: config.HOST,
//   dialect: config.DIALECT,
//   port: config.PORT ?? 3306,
//   operatorsAliases: 0,
//   // benchmark: true,
//   pool: {
//     max: config.pool.max,
//     min: config.pool.min,
//     acquire: config.pool.acquire,
//     idle: config.pool.idle,
//   }
// });

const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.DIALECT,
  port: config.PORT ?? 3306,
  
  // ✅ CRITICAL FIX 1: Connection & Socket Timeouts
  // These settings tell the database driver to fail fast if a connection is stuck,
  // preventing the app from hanging indefinitely.
  dialectOptions: {
    connectTimeout: 60000, // 60s (Give Cloud SQL Proxy time to establish initial handshake)
    // For MySQL/MariaDB:
  },

  // ✅ CRITICAL FIX 2: Optimized Pool for Cloud SQL
  pool: {
    // Maximum number of connections in pool. 
    // Rule of thumb: Max = (Core_Count * 2) + effective_spindle_count
    // For Cloud SQL, 5-10 is usually sufficient for a single instance app.
    max: config.pool.max || 10, 

    // Minimum number of connections to keep open.
    // 0 is safer for "intermittent" traffic to avoid holding stale connections.
    min: config.pool.min || 0, 

    // Maximum time (ms) to wait for a connection before throwing error.
    // Increased to 30s to handle "cold starts" or network blips.
    acquire: 30000, 

    // Maximum time (ms) that a connection can be idle before being released.
    // MUST be less than Cloud SQL's wait_timeout (usually 10-15 mins).
    // Setting this low (e.g., 10s) forces frequent refresh, preventing "closed by server" errors.
    idle: 10000, 
  },

  // ✅ 3. KeepAlive (Crucial for Cloud Environments)
  // This prevents Google's Load Balancers/routers from silently dropping 
  // connections that look idle but are actually valid.
  keepDefaultTimezone: true, // (Optional: prevents timezone mismatch bugs)
  
  benchmark: true,
  logging: (sql, timing) => {
    console.log(`⏱️  [${timing}ms] ${sql}`);
  },
});



try {
  await sequelize.authenticate();
  console.log('🚀 SUCCESS: Connection to Cloud SQL established via Sequelize.');
} catch (err) {
  console.error('❌ CRITICAL ERROR: Unable to connect to the database!');
  console.error('Check if your Cloud SQL Auth Proxy is running on port 3306.');
  console.error('Error Details:', err.message);
  
  // Throwing the error prevents the rest of the app from starting in a broken state
  throw err; 
}
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
db.BlogsModel = BlogsModel(sequelize,Sequelize);
db.BlogMediaModel = BlogMediaModel(sequelize,Sequelize);
db.RequestTagModel = RequestTagModel(sequelize,Sequelize);
db.PostTagModel = PostTagModel(sequelize,Sequelize);
db.UserRequestStatsModel = UserRequestStatsModel(sequelize,Sequelize);
db.QuotesModel = QuotesModel(sequelize,Sequelize);
db.ReportTypeModel = ReportTypeModel(sequelize,Sequelize);
db.ReportPageTypeModel = ReportPageTypeModel(sequelize,Sequelize);
db.TicketModuleTypeModel = TicketModuleTypeModel(sequelize,Sequelize);
db.TicketModel = TicketModel(sequelize,Sequelize);
db.ModuleTypeModel = ModuleTypeModel(sequelize,Sequelize);
db.BugTypeModel = BugTypeModel(sequelize,Sequelize);
db.TicketMediaModel = TicketMediaModel(sequelize,Sequelize);
db.NgoDesignationMasterModel = NgoDesignationMasterModel(sequelize,Sequelize);
db.NgoUserMasterModel = NgoUserMasterModel(sequelize,Sequelize);
db.NgoRegistrationModel = NgoRegistrationModel(sequelize,Sequelize);
db.OtpTypeMasterModel = OtpTypeMasterModel(sequelize,Sequelize);
db.UserOtpLogModel = UserOtpLogModel(sequelize,Sequelize);
db.TempEmailVerificationModel = TempEmailVerificationModel(sequelize,Sequelize);
db.RequestDocumentsTypesModel = RequestDocumentsTypesModel(sequelize,Sequelize);
db.NgoRequestDocumentCategoryModel = NgoRequestDocumentCategoryModel(sequelize,Sequelize);
db.RequestDocumentModel = RequestDocumentModel(sequelize,Sequelize);


export default db