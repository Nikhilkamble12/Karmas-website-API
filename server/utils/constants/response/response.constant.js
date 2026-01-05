//------ Response messages (Flat Structure - Organized) -----

const RESPONSE_CONSTANTS = {
    // ============================================================
    // GENERIC SYSTEM & HTTP ERRORS
    // ============================================================
    INTERNAL_SERVER_ERROR: "Internal server error",                 // 500: Fallback for unexpected crashes
    API_NOT_FOUND: "API endpoint not found.",                       // 404: Route does not exist
    UNAUTHORIZED: "Unauthorized: Invalid or missing token",         // 401: General auth failure
    NO_TOKEN: "No Token Provided",                                  // 403: Header missing Bearer token
    INVALID_INPUT_DATA: "Invalid input data provided.",             // 400: Input validation general failure
    DATA_MISSING_KINDLY_CHECK: "Data Is Missing Kindly Verify Your Data.", // 400: Null/Undefined checks failed
    TRANSACTION_FAILED: "Database transaction failed.",             // 500: SQL Rollback occurred
    ERROR_WHILE_SAVING_FILE_TO_SERVER: "Error While Saving File To Server.", // 500: File system/Upload error
    TOKEN_EXPIRED: "Token Has Expired. Please Login Again.",            // 401: JWT expired
    INVALID_TOKEN_SIGNATURE: "Invalid Token Signature. Please Login Again.", // 401: Token tampered/wrong secret
    MALFORMED_TOKEN: "Malformed Token. Please Login Again.",            // 400: Invalid JWT format
    INVALID_TOKEN_ALGORITHM: "Invalid Token Algorithm.",                // 400: Algorithm mismatch
    TOKEN_NOT_ACTIVE: "Token Not Yet Valid. Please Check System Time.", // 401: Token nbf (not before) not reached
    INVALID_TOKEN_PAYLOAD: "Invalid Token Payload. Please Login Again.", // 401: Missing required fields in token
    UNAUTHORIZED: "Unauthorized Access. Please Login.",

    // ============================================================
    // AUTHENTICATION (Login, Register, OTP, Tokens)
    // ============================================================
    LOGGED_IN_SUCCESFULLY: "Logged In Successfully",                // 200: Login success
    ERROR_LOG_IN: "An error occurred while Logging In.",            // 400: Login flow error
    INVALID_CREDENTIAL: "Invalid Credential.",                       // 401: Wrong username/password
    WRONG_CREDENTIAL: "Invalid Credential.",                        // 401: Duplicate of above (Legacy)
    JWT_EXPIRED: "JWT token has expired",                           // 401: Token time limit reached
    UNVERIFIED_TOKEN: "Failed to verify JWT token",                 // 401: Token signature invalid
    INVALID_PASSWORD: "Invalid Password!",                          // 400: Specific password mismatch
    PASSWORD_REQUIRED: "Password Is Required.",                     // 400: Validation missing password
    OLD_PASSWORD_IS_INVALID: "Old Password Is Invalid.",            // 400: Change password flow check
    PASSWORD_UPDATED_SUCCESSFULLY: "Password updated Successfully.", // 200: Change password success
    EMAIL_AND_PASSWORD_REQUIRED: "Email And Password Is Required.", // 400: Login payload missing fields
    ENTER_A_VALID_EMAIL: "Enter a Valid Email.",                    // 400: Regex email check failed
    EMAIL_IS_MANDATORY: "Email Id Is Mandatory.",                   // 400: Registration missing email
    EMAIL_ALREADY_IN_USE: "Email Already In Use.",                  // 409: Registration duplicate email
    EMAIL_IS_READY_TO_USE: "Email Ready To Use.",                   // 200: Registration email check passed
    USERNAME_ALREADY_IN_USE: "User Name Already In Use.",           // 409: Registration duplicate username
    USERNAME_IS_READY_TO_USE: "User Name Ready To Use.",            // 200: Registration username check passed
    INVALID_STATUS_ID: "Invalid Status Id.",
    EMAIL_NOT_FOUND: "Email Not Found.",

    // --- OTP Specific ---
    INVALID_OTP_KINDLY_RECHECK: "Invalid Otp Kindly Recheck.",      // 400: OTP mismatch
    OTP_HAS_EXPIRED: "OTP HAS EXPIRED.",                            // 400: OTP time limit reached
    OTP_VERIFIED_SUCCESSFULLY: "OTP Verified Successfully.",        // 200: OTP flow success
    OTP_GENERATED_SUCCESSFULLY: "OTP Generated Successfully. Kindly Check E-mail.", // 200: OTP sent
    KINDLY_REGENRATE_OTP: "OTP has not been generated yet. Kindly Regenerate.", // 400: Flow error
    USER_ALREADY_VERIFIED:"User Already Verifyied.",
    // ============================================================
    // DATABASE CRUD OPERATIONS (General)
    // ============================================================
    SUCCESS_ADDING_RECORD: "Data added successfully.",              // 201: Create Success
    ERROR_ADDING_RECORD: "An error occurred while adding the record.", // 400: Create Failure
    DATA_RETRIEVE_SUCCESS: "Data retrieved successfully.",          // 200: Read Success
    DATA_NOT_FOUND: "Data not found.",                              // 404: Read Failure (Empty list)
    DATA_NOT_FOUND_FOR_ID: "Data Not Found By Id.",                 // 404: Read by ID Failure
    SUCCESS_UPDATING_RECORD: "Data updated successfully.",          // 200: Update Success
    ERROR_UPDATING_RECORD: "An error occurred while updating the record.", // 400: Update Failure
    SUCCESS_DELETING_RECORD: "Data deleted successfully.",          // 200: Delete Success
    ERROR_DELETING_RECORD: "An error occurred while deleting the record.", // 400: Delete Failure
    UNIQUE_CONSTRANTS_FAILED: "A record with this unique constraint already exists.", // 409: SQL Unique Error
    DATA_IS_AMBIGIOUS: "More Than One Record Found.",               // 409: Expected single result, got many
    INVALID_DATA: "INVALID DATA FOUND, RECHECK THE DATA.",          // 400: Corrupt data format
    CANNOT_UPDATE_DATA_AT_THIS_STEP: "Cannot Update Data After Approval. You Can Login And Modify.",

    // ============================================================
    // USER MODULE & PROFILE
    // ============================================================
    USER_NOT_FOUND: "User Data Not Found.",                         // 404: User lookup failed
    THE_SPECIFIC_USER_ID_DOES_EXIST: "The specified user ID does not exist. Please verify and try again.", // 404: ID check
    INVALID_USER_ID: "Invalid user ID provided.",                   // 400: ID format error
    USER_ID_IS_REQUIRED: "User Id Is Required.",                    // 400: Missing ID in payload
    INVALID_USERNAME: "Invalid Username!",                          // 400: Username format error
    USER_NOT_ACTIVE: "User Not Active!",                            // 403: Account disabled/deleted
    USER_ACTIVITY_NOT_FOUND: "User activity data not found.",       // 404: Analytics missing
    ONLY_JPG_AND_PDF_FORMAT_ALLOWED: "Only JPG,PDF Format Allowed.",// 400: Profile image validation

    // --- Blocking & Blacklist ---
    USER_HAS_BLOCKED_YOU: "You Have Been Blocked By Admin.",        // 403: Admin Block
    USER_IS_BLACKLISTED: "Account Has Been Blacklisted.",           // 403: Blacklist Block
    USER_IS_ALREADY_BLOCKED: "User is Already Block.",              // 400: Redundant action
    CANNOT_BLOCK_YOURSELF: "You cannot block yourself.",            // 400: Logic guard
    BLACKLISTED_USER_ID_REQUIRED: "Blacklisted user ID is required.", // 400: Missing param
    VERIFICATION_REMAINING: "You're almost there! Complete your verification to unlock everything.",

    // ============================================================
    // POSTS & COMMENTS
    // ============================================================
    POST_ID_IS_REQUIRED: "Post Id Is Required.",                    // 400: Comment/Like payload check
    SEQUENCE_ID_IS_REQUIRED: "Sequence Id Is Required.",            // 400: Media sequence check
    POST_NOT_FOUND: "Post not found.",
    COMMENT_NOT_FOUND: "Comment Not Found.",

    // ============================================================
    // REQUESTS & NGO
    // ============================================================
    REQUEST_ID_IS_REQUIRED: "Request Id Is Required.",              // 400: Missing Request ID
    REQUEST_IS_INCOMPLETE: "Request not Yet Completed.",            // 400: Status logic check
    CANNOT_UPDATE_STATUS_CHECK_REQUEST: "Cannot update the status. Check Final Status.", // 400: Logic guard
    CANNOT_DELETE_REQUEST_AT_THIS_STAGE: "Cannot delete request at this stage.", // 400: Lifecycle guard
    NGO_ID_REQUIRED: "Ngo Id Is Required.",                         // 400: Assignment check
    NGO_ALREDY_ASSIGNED_TO_REQUEST: "Ngo Already Assigned to Request.", // 409: Duplicate assignment
    AGENT_CONTRACT_NOT_FOUND: "Agent Contract Not Found.",          // 404: Agent logic,
    NGO_MEDIA_ID_IS_REQUIRED: "NGO Media Id is required.",
    NGO_REGISTRATION_NOT_FOUND: "NGO registration not found.",
    NGO_APPROVED_SUCCESSFULLY: "NGO approved successfully.",
    NGO_REGISTRATION_REJECTED: "NGO registration rejected.",
    NGO_REGISTRATION_REOPEND: "NGO registration reopened.",
    NGO_REGISTRATION_ALREADY_COMPLETED: "NGO Registration Already Completed.",

    // ============================================================
    // GIFTS & COUPONS
    // ============================================================
    GIFT_NOT_FOUND: "Gift Not Found.",                              // 404: Gift ID lookup
    USER_NOT_ELIGIBLE_FOR_GIFT: "User Is Not Eligible For Gift.",   // 403: Eligibility rule
    COUPON_ALREADY_REDEEMED: "You have already have this coupon.",  // 409: Duplicate claim
    NO_COUPONS_AVAILABLE: "No coupons are currently available for this gift", // 404: Inventory empty
    COUPON_ALREADY_ASSIGNED: "Coupon is already assigned to a user.", // 409: Duplicate assignment

    // ============================================================
    // SOS / EMERGENCY
    // ============================================================
    SOS_USER_LIMIT_EXCEEDED: "User Limit Has Been Exceeded.",       // 400: Rate limiting/Quota
    SOS_NOT_YET_CREATED: "Sos Not Yet Created.",                    // 404: Status check


    // Likes And Comments
    LIKE_RECORDS_NOT_FOUND: "Like record not found.",

    STATUS_NOT_FOUND:"Status Not Found.",
};

export default RESPONSE_CONSTANTS;