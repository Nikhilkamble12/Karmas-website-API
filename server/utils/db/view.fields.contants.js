import VIEW_NAME from "./view.constants.js";

const ViewFieldTableWise = {
    // -------> A
    // -------> B
    BONUS_MASTER_FIELDS:` SELECT bonus_id, create_score, start_date, end_date, score_category_id, score_category_name, status_id, status_name, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_BONUS_MASTER} `,
    BONUS_HISTORY_FIELDS:` SELECT history_id, bonus_id, previous_create_score, new_create_score, change_date, score_category_id, score_category_name, changed_by, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_BONUS_HISTORY} `,

    //  ------> C
    CITY_MASTER_FIELDS :` SELECT city_id, city_name, country_id, country_name, state_id, state_name, is_metro_city, is_active FROM ${VIEW_NAME.GET_ALL_CITY_MASTER} ` ,
    COUNTRY_MASTER_FIELDS :` SELECT country_id, country_name, is_active FROM ${VIEW_NAME.GET_ALL_COUNTRY_MASTER} `,
    COUPON_MASTER_FIELDS : ` SELECT coupon_id, coupon_code, rate, amount, company_name, active_date, expires_date, distributed_status, active_status, created_at FROM ${VIEW_NAME.GET_ALL_COUPON_MASTER} `,
    COMMENTS_FIELDS :` SELECT comment_id, user_id, post_id, comment_text, parent_id, created_at, is_active, created_by, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_COMMENTS} `,

    // -------> D
    DESIGNATION_MASTER_FIELDS:` SELECT designation_id, table_id, table_name, designation_name, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_DESIGNATION_MASTER} `,
    DISTRICT_MASTER_FIELDS:` SELECT district_id, district_name, state_id, state_name, country_id, country_name, district_is_active, district_created_by, district_created_at, district_modified_by, district_modified_at, district_deleted_by, district_deleted_at, state_is_active, country_is_active FROM ${VIEW_NAME.GET_ALL_DISTRICT} `, 

    // -------> L
    LIKES_FIELDS:` SELECT like_id, user_id, post_id, is_liked, created_at, is_active, created_by, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_LIKES} `,

    // -------> N
    NGO_FIELD_FIELDS:` SELECT ngo_field_id, field_name, field_description, is_active, created_by, created_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_NGO_FIELDS} `,
    NGO_MASTER_FIELDS:` SELECT ngo_id, unique_id, darpan_reg_date, ngo_type, ngo_name, ngo_type_name, registration_no, act_name, city_of_registration_id, city_of_registration_name, state_of_registration_id, state_of_registration_name, country_of_registration_id, country_of_registration_name, date_of_registration, address, city_id, city_name, state_id, state_name, country_id, country_name, telephone, mobile_no, website_url, email, ngo_logo, ngo_logo_path, pan_cad_file_name, pan_card_file_url, crs_regis_file_name, crs_regis_file_path, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_NGO_MASTER} `,
    NGO_FUNDS_DETAILS_FIELDS:` SELECT ngo_funds_id, ngo_id, department_name, source, financial_year, amount_sanctioned, purpose, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_NGO_FUNDS_DETAILS} `,
    NGO_BEARERS_FIELDS:` SELECT bearer_id, ngo_id, name, designation_id, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_NGO_OFFICE_BEARRRS} `,
    NGO_STATE_DISTRICT_MAPPING_FILDS:` SELECT ngo_state_district_mapping_id, ngo_id, ngo_name, unique_id, darpan_reg_date, ngo_type, registration_no, email, mobile_no, state_id, state_name, district_id, district_name, city_id, city_name, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_NGO_STATE_DISTING_MAPPING_VIEW} `,
    NGO_FIELD_MAPPING_FIELDS:` SELECT * FROM ${VIEW_NAME.GET_ALL_NGO_FIELD_MAPPING} `,
    NGO_REQUEST_MAPPING_FIELDS:` SELECT Request_Ngo_Id, RequestId, RequestName, ngo_id, ngo_name, status_id, status_name, Reason, AssignedDate, ApprovalDate, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_NGO_REQUEST} `,

    // -------> P
    POSTS_FIELDS:` SELECT post_id, user_id, description, created_at, total_likes, total_comments, is_active, created_by, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_POSTS} `,
    POST_MEDIA_FIELDS:` SELECT media_id, post_id, sequence, media_type, media_url, created_at, is_active, created_by, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_POST_MEDIA} `,

    //  ------> R 
    REQUEST_FIELDS:` SELECT * FROM ${VIEW_NAME.GET_ALL_REQUEST} `,
    REQUEST_NGO_FIELDS:` SELECT * FROM ${VIEW_NAME.GET_ALL_NGO_REQUEST} `,
    ROLE_MASTER_FIELDS:` SELECT role_id, role, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_ROLE_MASTER} `,
    REQUEST_MEDIA_FIELDS:` SELECT request_media_id, request_id, img_name, img_path, sequence_id, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_REQUEST_MEDIA} `,

    // -------> S
    STATE_MASTER_FIELDS :` SELECT state_id, state_name, country_id, country_name, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at  FROM ${VIEW_NAME.GET_ALL_STATE_MASTER} `,
    STATUS_MASTER_FIELDS : ` SELECT * FROM ${VIEW_NAME.GET_ALL_STATUS_MASTER} `,
    SIMPLE_SCORE_HISTORY_FIELDS :` SELECT sr_no, user_id, user_name, request_id, request_name, git_score, score_category_id, score_category_name, description, status_id, status_name, date, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at  FROM ${VIEW_NAME.GET_ALL_SIMPLE_SCORE_HISTORY} `,
    SCORE_ELIGIBILITY_MAPPING_FIELDS :` SELECT mapping_id, company_name, score_required, eligible_amount, created_at, is_active, created_by, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_SCORE_ELIGIBILITY} `,
    SCORE_CATEGORY_FIELDS:` SELECT score_category_id, score_category_name, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_SCORE_CATEGORY} `,

    // -------> T
    TABLE_MASTER_FIELDS: ` SELECT table_id, table_name, is_active FROM ${VIEW_NAME.GET_ALL_TABLE_MASTER}  `,

    //  ------> U
    USER_MASTER_FIELDS :` SELECT user_id, user_name, password, full_name, role_id, role, is_account_public, email_id, gender, enrolling_date, ngo_id, ngo_name, ngo_unique_id, file_name, file_path, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at, first_time_login FROM ${VIEW_NAME.GET_ALL_USER_MASTER} `,
    USER_ACTIVITY_FIELDS :` SELECT * FROM ${VIEW_NAME.GET_ALL_USER_ACTIVITY} `,
    // -------> V
    VENDOR_COMPANY_MASTER_FIELDS :` SELECT company_id, company_name, company_photo_name, company_photo_path, is_active, created_by, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_VENDOR_COMPANY_MASTER} `,


}

export default ViewFieldTableWise