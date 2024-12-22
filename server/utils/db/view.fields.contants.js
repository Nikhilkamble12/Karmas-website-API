import VIEW_NAME from "./view.constants.js";

const ViewFieldTableWise = {
    //  ------> C
    CITY_MASTER_FIELDS:` SELECT city_id, city_name, country_id, country_name, state_id, state_name, is_metro_city, is_active FROM ${VIEW_NAME.GET_ALL_CITY_MASTER} ` ,
    COUNTRY_MASTER_FIELDS:` SELECT country_id, country_name, is_active FROM ${VIEW_NAME.GET_ALL_COUNTRY_MASTER} `,
    STATE_MASTER_FIELDS:` SELECT state_id, state_name, county_id, is_active ${VIEW_NAME.STATE_MASTER_FIELDS} `,

    //  ------> U
    USER_MASTER_FIELDS:` SELECT user_id, user_name, password, full_name, email_id FROM ${VIEW_NAME.GET_ALL_USER_MASTER} `


}

export default ViewFieldTableWise