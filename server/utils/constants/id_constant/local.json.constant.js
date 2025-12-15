const TABLE_VIEW_FOLDER_MAP = {
    "Comments": {
        view_name: "v_Comments",
        folder_name: "Comments",
        json_file_name: "Comments.json5",
        conditions: { is_active: true }
    },
    "Likes": {
        view_name: "v_Likes",
        folder_name: "Likes",
        json_file_name: "Likes.json5",
        conditions: { is_active: true }
    },
    "PostMedia": {
        view_name: "v_PostMedia",
        folder_name: "PostMedia",
        json_file_name: "PostMedia.json5",
        conditions: { is_active: true }
    },
    "Posts": {
        view_name: "v_Posts",
        folder_name: "Posts",
        json_file_name: "Posts.json5",
        conditions: { is_active: true }
    },
    "blog_media": {
        view_name: "v_blog_media",
        folder_name: "blog_media",
        json_file_name: "blog_media.json5",
        conditions: { is_active: true }
    },
    "blogs": {
        view_name: "v_blogs",
        folder_name: "blogs",
        json_file_name: "blogs.json5",
        conditions: { is_active: true }
    },
    "bonus_history": {
        view_name: "v_bonus_history",
        folder_name: "bonus_history",
        json_file_name: "bonus_history.json5",
        conditions: { is_active: true }
    },
    "bonus_master": {
        view_name: "v_bonus_master",
        folder_name: "bonus_master",
        json_file_name: "bonus_master.json5",
        conditions: { is_active: true }
    },
    "bug_master": {
        view_name: "v_bug_master",
        folder_name: "bug_master",
        json_file_name: "bug_master.json5",
        conditions: { is_active: true }
    },
    "bug_type": {
        view_name: "v_bug_type",
        folder_name: "bug_type",
        json_file_name: "bug_type.json5",
        conditions: { is_active: true }
    },
    "city_master": {
        view_name: "v_city_master",
        folder_name: "city_master",
        json_file_name: "city_master.json5",
        conditions: { is_active: true }
    },
    "company_master": {
        view_name: "v_company_master",
        folder_name: "company_master",
        json_file_name: "company_master.json5",
        conditions: { is_active: true }
    },
    "country_master": {
        view_name: "v_country_master",
        folder_name: "country_master",
        json_file_name: "country_master.json5",
        conditions: { is_active: true }
    },
    "coupon_master": {
        view_name: "v_coupon_master",
        folder_name: "coupon_master",
        json_file_name: "coupon_master.json5",
        conditions: { is_active: true }
    },
    "coupons": {
        view_name: "v_coupons",
        folder_name: "coupons",
        json_file_name: "coupons.json5",
        conditions: { is_active: true }
    },
    "designation_master": {
        view_name: "v_designation_master",
        folder_name: "designation_master",
        json_file_name: "designation_master.json5",
        conditions: { is_active: true }
    },
    "gift_master": {
        view_name: "v_gift_master",
        folder_name: "gift_master",
        json_file_name: "gift_master.json5",
        conditions: { is_active: true }
    },
    "group_role_page_permission": {
        view_name: "V_group_role_page_permission",
        folder_name: "group_role_page_permission",
        json_file_name: "group_role_page_permission.json5",
        conditions: { is_active: true }
    },
    "menu": {
        view_name: "v_menu",
        folder_name: "menu",
        json_file_name: "menu.json5",
        conditions: { is_active: true }
    },
    "module_type": {
        view_name: "v_module_type",
        folder_name: "module_type",
        json_file_name: "module_type.json5",
        conditions: { is_active: true }
    },
    "ngo_designation_master": {
        view_name: "v_ngo_designation_master",
        folder_name: "ngo_designation_master",
        json_file_name: "ngo_designation_master.json5",
        conditions: { is_active: true }
    },
    "ngo_field": {
        view_name: "v_ngo_field",
        folder_name: "ngo_field",
        json_file_name: "ngo_field.json5",
        conditions: { is_active: true }
    },
    "ngo_field_mapping": {
        view_name: "v_ngo_field_mapping",
        folder_name: "ngo_field_mapping",
        json_file_name: "ngo_field_mapping.json5",
        conditions: { is_active: true }
    },
    "ngo_funds_details": {
        view_name: "v_ngo_funds_details",
        folder_name: "ngo_funds_details",
        json_file_name: "ngo_funds_details.json5",
        conditions: { is_active: true }
    },
    "ngo_likes": {
        view_name: "v_ngo_likes",
        folder_name: "ngo_likes",
        json_file_name: "ngo_likes.json5",
        conditions: { is_active: true }
    },
    "ngo_master": {
        view_name: "v_ngo_master",
        folder_name: "ngo_master",
        json_file_name: "ngo_master.json5",
        conditions: { is_active: true }
    },
    "ngo_media_comments": {
        view_name: "v_ngo_media_comments",
        folder_name: "ngo_media_comments",
        json_file_name: "ngo_media_comments.json5",
        conditions: { is_active: true }
    },
    "ngo_media_likes": {
        view_name: "v_ngo_media_likes",
        folder_name: "ngo_media_likes",
        json_file_name: "ngo_media_likes.json5",
        conditions: { is_active: true }
    },
    "ngo_office_bearers": {
        view_name: "v_ngo_office_bearers",
        folder_name: "ngo_office_bearers",
        json_file_name: "ngo_office_bearers.json5",
        conditions: { is_active: true }
    },
    "ngo_state_district_mapping": {
        view_name: "v_ngo_state_district_mapping",
        folder_name: "ngo_state_district_mapping",
        json_file_name: "ngo_state_district_mapping.json5",
        conditions: { is_active: true }
    },
    "ngo_type": {
        view_name: "v_ngo_type",
        folder_name: "ngo_type",
        json_file_name: "ngo_type.json5",
        conditions: { is_active: true }
    },
    "ngo_user_master": {
        view_name: "v_ngo_user_master",
        folder_name: "ngo_user_master",
        json_file_name: "ngo_user_master.json5",
        conditions: { is_active: true }
    },
    "notification_history": {
        view_name: "v_notification_history",
        folder_name: "notification_history",
        json_file_name: "notification_history.json5",
        conditions: { is_active: true }
    },
    "page": {
        view_name: "V_page",
        folder_name: "page",
        json_file_name: "page.json5",
        conditions: { is_active: true }
    },
    "page_permission": {
        view_name: "V_page_permission",
        folder_name: "page_permission",
        json_file_name: "page_permission.json5",
        conditions: { is_active: true }
    },
    "permission": {
        view_name: "V_permission",
        folder_name: "permission",
        json_file_name: "permission.json5",
        conditions: { is_active: true }
    },
    "post_comment_likes": {
        view_name: "v_post_comment_likes",
        folder_name: "post_comment_likes",
        json_file_name: "post_comment_likes.json5",
        conditions: { is_active: true }
    },
    "post_tag": {
        view_name: "v_post_tag",
        folder_name: "post_tag",
        json_file_name: "post_tag.json5",
        conditions: { is_active: true }
    },
    "quotes": {
        view_name: "v_quotes",
        folder_name: "quotes",
        json_file_name: "quotes.json5",
        conditions: { is_active: true }
    },
    "report": {
        view_name: "v_report",
        folder_name: "report",
        json_file_name: "report.json5",
        conditions: { is_active: true }
    },
    "report_page_type": {
        view_name: "v_report_page_type",
        folder_name: "report_page_type",
        json_file_name: "report_page_type.json5",
        conditions: { is_active: true }
    },
    "report_type": {
        view_name: "v_report_type",
        folder_name: "report_type",
        json_file_name: "report_type.json5",
        conditions: { is_active: true }
    },
    "request_comment_likes": {
        view_name: "v_request_comment_likes",
        folder_name: "request_comment_likes",
        json_file_name: "request_comment_likes.json5",
        conditions: { is_active: true }
    },
    "request_comments": {
        view_name: "v_request_comments",
        folder_name: "request_comments",
        json_file_name: "request_comments.json5",
        conditions: { is_active: true }
    },
    "request_likes": {
        view_name: "v_request_likes",
        folder_name: "request_likes",
        json_file_name: "request_likes.json5",
        conditions: { is_active: true }
    },
    "request_media": {
        view_name: "v_Request_media",
        folder_name: "request_media",
        json_file_name: "request_media.json5",
        conditions: { is_active: true }
    },
    "request_ngo": {
        view_name: "v_Request_Ngo",
        folder_name: "request_ngo",
        json_file_name: "request_ngo.json5",
        conditions: { is_active: true }
    },
    "request_tag": {
        view_name: "v_request_tag",
        folder_name: "request_tag",
        json_file_name: "request_tag.json5",
        conditions: { is_active: true }
    },
    "request_type": {
        view_name: "v_request_type",
        folder_name: "request_type",
        json_file_name: "request_type.json5",
        conditions: { is_active: true }
    },
    "requests": {
        view_name: "v_Requests",
        folder_name: "requests",
        json_file_name: "requests.json5",
        conditions: { is_active: true }
    },
    "role_master": {
        view_name: "v_role_master",
        folder_name: "role_master",
        json_file_name: "role_master.json5",
        conditions: { is_active: true }
    },
    "score_category": {
        view_name: "v_score_category",
        folder_name: "score_category",
        json_file_name: "score_category.json5",
        conditions: { is_active: true }
    },
    "score_eligibility_mapping": {
        view_name: "v_score_eligibility",
        folder_name: "score_eligibility_mapping",
        json_file_name: "score_eligibility_mapping.json5",
        conditions: { is_active: true }
    },
    "sos_history": {
        view_name: "v_sos_history",
        folder_name: "sos_history",
        json_file_name: "sos_history.json5",
        conditions: { is_active: true }
    },
    "sos_main": {
        view_name: "v_sos_main",
        folder_name: "sos_main",
        json_file_name: "sos_main.json5",
        conditions: { is_active: true }
    },
    "sos_user_list": {
        view_name: "v_active_sos_contacts",
        folder_name: "sos_user_list",
        json_file_name: "sos_user_list.json5",
        conditions: { is_active: true }
    },
    "state_master": {
        view_name: "v_state_master",
        folder_name: "state_master",
        json_file_name: "state_master.json5",
        conditions: { is_active: true }
    },
    "status_master": {
        view_name: "v_status_master",
        folder_name: "status_master",
        json_file_name: "status_master.json5",
        conditions: { is_active: true }
    },
    "table_master": {
        view_name: "v_table_master",
        folder_name: "table_master",
        json_file_name: "table_master.json5",
        conditions: { is_active: true }
    },
    "ticket": {
        view_name: "v_ticket",
        folder_name: "ticket",
        json_file_name: "ticket.json5",
        conditions: { is_active: true }
    },
    "ticket_media": {
        view_name: "v_ticket_media",
        folder_name: "ticket_media",
        json_file_name: "ticket_media.json5",
        conditions: { is_active: true }
    },
    "ticket_module_type": {
        view_name: "v_ticket_module_type",
        folder_name: "ticket_module_type",
        json_file_name: "ticket_module_type.json5",
        conditions: { is_active: true }
    },
    "user_activity": {
        view_name: "v_user_activity",
        folder_name: "user_activity",
        json_file_name: "user_activity.json5",
        conditions: { is_active: true }
    },
    "user_blacklist": {
        view_name: "v_user_blacklist",
        folder_name: "user_blacklist",
        json_file_name: "user_blacklist.json5",
        conditions: { is_active: true }
    },
    "user_following": {
        view_name: "v_user_following",
        folder_name: "user_following",
        json_file_name: "user_following.json5",
        conditions: { is_active: true }
    },
    "user_master": {
        view_name: "v_user_master",
        folder_name: "user_master",
        json_file_name: "user_master.json5",
        conditions: { is_active: true }
    },
    "user_request_stats": {
        view_name: "v_user_request_stats",
        folder_name: "user_request_stats",
        json_file_name: "user_request_stats.json5",
        conditions: { is_active: true }
    },
    "vendor_company_master": {
        view_name: "v_vendor_company_master",
        folder_name: "vendor_company_master",
        json_file_name: "vendor_company_master.json5",
        conditions: { is_active: true }
    }
};

export default TABLE_VIEW_FOLDER_MAP;
