import VIEW_NAME from "./view.constants.js";

const ViewFieldTableWise = {
    // -------> A
    // -------> B
    BONUS_MASTER_FIELDS:` SELECT bonus_id, create_score, start_date, end_date, score_category, status_id, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at ${VIEW_NAME.GET_ALL_BONUS_MASTER} `,
    BONUS_HISTORY_FIELDS:` SELECT history_id, bonus_id, score_category, previous_create_score, new_create_score, change_date, changed_by, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_BONUS_HISTORY} `,

    //  ------> C
    CITY_MASTER_FIELDS :` SELECT city_id, city_name, country_id, country_name, state_id, state_name, is_metro_city, is_active FROM ${VIEW_NAME.GET_ALL_CITY_MASTER} ` ,
    COUNTRY_MASTER_FIELDS :` SELECT country_id, country_name, is_active FROM ${VIEW_NAME.GET_ALL_COUNTRY_MASTER} `,
    COUPON_MASTER_FIELDS : ` SELECT coupon_id, coupon_code, rate, amount, company_name, active_date, expires_date, distributed_status, active_status, created_at FROM ${VIEW_NAME.GET_ALL_COUPON_MASTER} `,

    // -------> D
    DESIGNATION_MASTER_FIELDS:` SELECT designation_id, table_id, table_name, designation_name, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_DESIGNATION_MASTER} `,
    DISTRICT_MASTER_FIELDS:` SELECT district_id, district_name, state_id, state_name, country_id, country_name, district_is_active, district_created_by, district_created_at, district_modified_by, district_modified_at, district_deleted_by, district_deleted_at, state_is_active, country_is_active FROM ${VIEW_NAME.GET_ALL_DISTRICT} `, 

    // -------> N
    NGO_FIELD_FIELDS:` SELECT ngo_field_id, field_name, field_description, is_active, created_by, created_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_NGO_FIELDS} `,
    NGO_MASTER_FIELDS:` SELECT ngo_id, unique_id, darpan_reg_date, ngo_type, ngo_type_name, registration_no, act_name, city_of_registration_id, city_of_registration_name, state_of_registration_id, state_of_registration_name, country_of_registration_id, country_of_registration_name, date_of_registration, address, city_id, city_name, state_id, state_name, country_id, country_name, telephone, mobile_no, website_url, email, ngo_logo, ngo_logo_path, pan_cad_file_name, pan_card_file_url, crs_regis_file_name, crs_regis_file_path, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_NGO_MASTER} `,
    NGO_FUNDS_DETAILS_FIELDS:` SELECT ngo_funds_id, ngo_id, department_name, source, financial_year, amount_sanctioned, purpose, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_NGO_FUNDS_DETAILS} `,
    NGO_BEARERS_FIELDS:` SELECT bearer_id, ngo_id, name, designation_id, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at FROM ${VIEW_NAME.GET_ALL_NGO_OFFICE_BEARRRS} `,
    NGO_STATE_DISTRICT_MAPPING_FILDS:` SELECT * FROM ${VIEW_NAME.GET_ALL_NGO_STATE_DISTING_MAPPING_VIEW} `,
    NGO_FIELD_MAPPING_FIELDS:` SELECT * FROM ${VIEW_NAME.GET_ALL_NGO_FIELD_MAPPING} `,

    //  ------> R 
    REQUEST_FIELDS:` SELECT * FROM ${VIEW_NAME.GET_ALL_REQUEST} `,
    REQUEST_NGO_FIELDS:` SELECT * FROM ${VIEW_NAME.GET_ALL_NGO_REQUEST} `,

    // -------> S
    STATE_MASTER_FIELDS:` SELECT state_id, state_name, country_id, country_name, is_active, created_by, created_at, modified_by, modified_at, deleted_by, deleted_at  FROM ${VIEW_NAME.GET_ALL_STATE_MASTER} `,
    STATUS_MASTER_FIELDS: ` SELECT * FROM ${VIEW_NAME.GET_ALL_STATUS_MASTER} `,

    // -------> T
    TABLE_MASTER_FIELDS: ` SELECT table_id, table_name, is_active FROM ${VIEW_NAME.GET_ALL_TABLE_MASTER}  `,

    //  ------> U
    USER_MASTER_FIELDS :` SELECT user_id, user_name, password, full_name, email_id FROM ${VIEW_NAME.GET_ALL_USER_MASTER} `,
    USER_ACTIVITY_FIELDS :` SELECT * FROM ${VIEW_NAME.GET_ALL_USER_ACTIVITY} `,


}

export default ViewFieldTableWise