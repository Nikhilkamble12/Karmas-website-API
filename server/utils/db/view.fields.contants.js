import VIEW_NAME from "./view.constants.js";

const ViewFieldTableWise = {
    // -------> A
    // -------> B
    BONUS_MASTER_FIELDS:` SELECT bonus_id, create_score, start_date, end_date, score_category_id, score_category_name, status_id, status_name, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_BONUS_MASTER} `,
    BONUS_HISTORY_FIELDS:` SELECT history_id, bonus_id, previous_create_score, new_create_score, change_date, score_category_id, score_category_name, changed_by, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_BONUS_HISTORY} `,
    BLACK_LISTED_NGO_FIELDS:` SELECT ngo_id, ngo_name, unique_id, darpan_reg_date, ngo_type, registration_no, act_name, city_of_registration_id, state_of_registration_id, country_of_registration_id, date_of_registration, address, city_id, state_id, country_id, telephone, mobile_no, website_url, email, ngo_logo, ngo_logo_path, pan_cad_file_name, pan_card_file_url, crs_regis_file_name, crs_regis_file_path, is_blacklist FROM ${VIEW_NAME.GET_ALL_BLACKLIST_NGO} `,
    BLACK_LISTED_USER_FIELDS:` SELECT user_id, user_name, password, full_name, role_id, is_account_public, email_id, gender, enrolling_date, ngo_id, first_time_login, file_name, file_path, reset_otp, reset_otp_expiry, google_id, is_blacklisted, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_BLACKLISTER_USER} `,

    //  ------> C
    CITY_MASTER_FIELDS :` SELECT city_id, city_name, country_id, country_name, state_id, state_name, is_metro_city, is_active FROM ${VIEW_NAME.GET_ALL_CITY_MASTER} ` ,
    COUNTRY_MASTER_FIELDS :` SELECT country_id, country_name, is_active FROM ${VIEW_NAME.GET_ALL_COUNTRY_MASTER} `,
    COUPON_MASTER_FIELDS : ` SELECT coupon_id, coupon_code, rate, amount, company_name, active_date, expires_date, distributed_status, active_status, created_at FROM ${VIEW_NAME.GET_ALL_COUPON_MASTER} `,
    COMMENTS_FIELDS :` SELECT comment_id, user_id, post_id, comment_text, parent_id, created_at, is_active, created_by, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_COMMENTS} `,
    COMPANY_MASTER_FIELDS :` SELECT company_id, company_name, company_email, company_logo, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_COMPANY_MASTER} `,
    COUPONS_FIELDS: `SELECT coupon_id, coupon_code, gift_master_id, gift_name, gift_amount, status_id, status_name, redeem_date, redeem_time, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_COUPONS}`,

    // -------> D
    DESIGNATION_MASTER_FIELDS:` SELECT designation_id, table_id, table_name, designation_name, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_DESIGNATION_MASTER} `,
    DISTRICT_MASTER_FIELDS:` SELECT district_id, district_name, state_id, state_name, country_id, country_name, district_is_active, district_created_by, district_created_at, district_modified_by, district_modified_at, district_deleted_by, district_deleted_at, state_is_active, country_is_active FROM ${VIEW_NAME.GET_ALL_DISTRICT} `,
    
    //-------> G
    GIFT_MASTER_FIELDS:` SELECT gift_master_id, company_id, gift_name, gift_logo, gift_score_required, gift_amount, gift_t_c, how_to_redeem, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_GIFT_MASTER} `,

    // -------> L
    LIKES_FIELDS:` SELECT like_id, user_id, post_id, is_liked, created_at, is_active, created_by, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_LIKES} `,

    // -------> N
    NGO_FIELD_FIELDS:` SELECT ngo_field_id, field_name, field_description, is_active, created_by, created_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_NGO_FIELDS} `,
    NGO_MASTER_FIELDS:` SELECT ngo_id, unique_id, darpan_reg_date, ngo_name, ngo_type, ngo_type_name, registration_no, act_name, city_of_registration_id, city_of_registration_name, state_of_registration_id, state_of_registration_name, country_of_registration_id, country_of_registration_name, date_of_registration, address, city_id, city_name, state_id, state_name, country_id, country_name, telephone, mobile_no, website_url, email, ngo_logo, ngo_logo_path, pan_cad_file_name, pan_card_file_url, crs_regis_file_name, crs_regis_file_path, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_NGO_MASTER} `,
    NGO_FUNDS_DETAILS_FIELDS:` SELECT ngo_funds_id, ngo_id, department_name, source, financial_year, amount_sanctioned, purpose, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_NGO_FUNDS_DETAILS} `,
    NGO_BEARERS_FIELDS:` SELECT bearer_id, ngo_id, name, designation_id, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_NGO_OFFICE_BEARRRS} `,
    NGO_STATE_DISTRICT_MAPPING_FILDS:` SELECT ngo_state_district_mapping_id, ngo_id, ngo_name, unique_id, darpan_reg_date, ngo_type, registration_no, email, mobile_no, state_id, state_name, district_id, district_name, city_id, city_name, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_NGO_STATE_DISTING_MAPPING_VIEW} `,
    NGO_FIELD_MAPPING_FIELDS:` SELECT * FROM ${VIEW_NAME.GET_ALL_NGO_FIELD_MAPPING} `,
    NGO_REQUEST_MAPPING_FIELDS:` SELECT Request_Ngo_Id, RequestId, RequestName, ngo_id, ngo_name, status_id, status_name, Reason, AssignedDate, ApprovalDate, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_NGO_REQUEST} `,
    NGO_TYPE_FIELDS:` SELECT ngo_type_id, ngo_type, is_active, created_by, created_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_NGO_TYPE} `,
    NOTIFICATION_HISTORY_FIELDS:` SELECT notification_id, user_id, user_name, user_email, title, description, type, metadata, is_read, is_active, created_at, modified_at FROM ${VIEW_NAME.GET_ALL_NOTIFICATION_HISTORY} `,

    // -------> P
    POSTS_FIELDS:` SELECT post_id, user_id, description, created_at, total_likes, total_comments, is_active, created_by, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_POSTS} `,
    POST_MEDIA_FIELDS:` SELECT media_id, post_id, sequence, media_type, media_url, created_at, is_active, created_by, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_POST_MEDIA} `,
    POST_COMMENT_LIKES:` SELECT like_id, user_id, comment_text, post_cmt_id, is_liked, created_at, is_active FROM ${VIEW_NAME.GET_ALL_POST_COMMENT_LIKE} `,

    //  ------> R 
    REQUEST_FIELDS:` SELECT * FROM ${VIEW_NAME.GET_ALL_REQUEST} `,
    REQUEST_NGO_FIELDS:` SELECT Request_Ngo_Id, RequestId, RequestName, request_user_id, user_name, ngo_id, ngo_name, status_id, status_name, Reason, AssignedDate, ApprovalDate FROM ${VIEW_NAME.GET_ALL_NGO_REQUEST} `,
    ROLE_MASTER_FIELDS:` SELECT role_id, role, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_ROLE_MASTER} `,
    REQUEST_MEDIA_FIELDS:` SELECT request_media_id, RequestId, img_name, media_url, media_type, sequence, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_REQUEST_MEDIA} `,
    REQUEST_TYPE_FIELDS:` SELECT request_type_id, request_type_name, created_by, created_at, modified_by, modified_at FROM ${VIEW_NAME.GET_ALL_REQUEST_TYPE} `,
    REQUEST_COMMENTS:` SELECT comment_id, user_id, RequestName, request_id, comment_text, total_comment, parent_id, created_at, is_active FROM ${VIEW_NAME.GET_ALL_REQUEST_COMMENTS} `,
    REQUEST_LIKES:` SELECT like_id, user_id, RequestName, request_id, is_liked, created_at, is_active FROM ${VIEW_NAME.GET_ALL_REQUEST_LIKE} `,
    REQUEST_COMMENT_LIKES:` SELECT like_id, user_id, comment_text, request_cmt_id, is_liked, created_at, is_active FROM ${VIEW_NAME.GET_ALL_REQUEST_COMMENT_LIKE} `,

    // -------> S
    STATE_MASTER_FIELDS :` SELECT state_id, state_name, country_id, country_name, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at  FROM ${VIEW_NAME.GET_ALL_STATE_MASTER} `,
    STATUS_MASTER_FIELDS : ` SELECT * FROM ${VIEW_NAME.GET_ALL_STATUS_MASTER} `,
    SIMPLE_SCORE_HISTORY_FIELDS :` SELECT sr_no, user_id, user_name, request_id, request_name, git_score, score_category_id, score_category_name, description, status_id, status_name, date, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at  FROM ${VIEW_NAME.GET_ALL_SIMPLE_SCORE_HISTORY} `,
    SCORE_ELIGIBILITY_MAPPING_FIELDS :` SELECT mapping_id, company_name, score_required, eligible_amount, created_at, is_active, created_by, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_SCORE_ELIGIBILITY} `,
    SCORE_CATEGORY_FIELDS:` SELECT score_category_id, score_category_name, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_SCORE_CATEGORY} `,
    SOS_USER_LIST_FIELDS:` SELECT sos_user_id, user_id, user_name, user_email, user_file_name, user_file_path, contact_name, contact_email, contact_file_name, contact_file_path, is_active, is_currently_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_SOS_USER_LIST} `,
    SOS_MAIN_FIELDS:` SELECT sos_id, user_id, user_name, email_id, is_sos_on, start_time, end_time, reason, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_SOS_MAIN} `,
    SOS_HISTORY_FIELDS:` SELECT history_id, sos_id, user_id, user_name, email_id, user_file_name, user_file_path, latitude, longitude, captured_time, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_SOS_HISTORY} `,

    // -------> T
    TABLE_MASTER_FIELDS: ` SELECT table_id, table_name, is_active FROM ${VIEW_NAME.GET_ALL_TABLE_MASTER}  `,

    //  ------> U
    USER_MASTER_FIELDS :` SELECT  user_id, user_name, password, full_name, role_id, role, is_account_public, email_id, gender, enrolling_date, ngo_id, ngo_name, ngo_unique_id, file_name, file_path, reset_otp, reset_otp_expiry, google_id, is_active, first_time_login, is_blacklisted FROM ${VIEW_NAME.GET_ALL_USER_MASTER} `,
    USER_ACTIVITY_FIELDS :` SELECT user_id, user_name, email_id, enrolling_date, user_activity_id, follower_no, following_no, total_reports_no, total_scores_no, total_requests_no, total_rewards_no, total_likes_no, total_comments_no, total_post_comment_likes_no, total_request_like_no, total_request_comment_no, total_request_comment_likes_no, total_shares_no, total_blacklist_user, total_refer_and_earn_no, show_user_chats_history, show_user_posts_history, screen_time, last_active_at FROM ${VIEW_NAME.GET_ALL_USER_ACTIVITY} `,
    USER_FOLLOWING_FIELDS:` SELECT follow_id, user_id, user_name, user_file_name, user_file_path, following_user_id, following_user_name, following_user_file_name, following_user_file_path, followed_at, is_following FROM ${VIEW_NAME.GET_ALL_USER_BLACKLIST} `,
    USER_BLACKLIST_FIELDS:` SELECT blacklist_id, user_id, user_name, blacklisted_user_id, blacklisted_user_name, reason, blacklisted_at, is_active  FROM ${VIEW_NAME.GET_ALL_USER_BLACKLIST} `,
    USER_TOKEN_FIELDS:` SELECT user_token_id, user_id, android_token, web_token, is_android, is_web, is_android_on, is_web_on, updated_at FROM ${VIEW_NAME.GET_ALL_USER_TOKEN} `,
    // -------> V
    VENDOR_COMPANY_MASTER_FIELDS :` SELECT company_id, company_name, company_photo_name, company_photo_path, is_active, created_by, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_VENDOR_COMPANY_MASTER} `,
}

export default ViewFieldTableWise
