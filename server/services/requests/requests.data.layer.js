import RequestModel from "./requests.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
import VIEW_NAME from "../../utils/db/view.constants.js";
import relationCache from "../../utils/helper/follow_blacklist_filter.js";
import { STATUS_MASTER } from "../../utils/constants/id_constant/id.constants.js";
const { db, ViewFieldTableVise, tokenData } = commonPath; // Destructure necessary components from commonPath

const RequestDAL = {
  // Method to create a new record in the database
  CreateData: async (data) => {
    try {
      const createdData = await RequestModel(db.sequelize).create(data);
      return createdData; // Return the created data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to update an existing record by its ID
  UpdateData: async (RequestId, data) => {
    try {
      const updateData = await RequestModel(db.sequelize).update(data, {
        where: { RequestId: RequestId },
      });
      return updateData; // Return the result of the update operation
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve all records by view
  getAllDataByView: async () => {
    try {
      const getAllData = await db.sequelize.query(
        ` ${ViewFieldTableVise.REQUEST_FIELDS} order by RequestId Desc`,
        { type: db.Sequelize.QueryTypes.SELECT }
      );
      return getAllData; // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve a specific record by its ID
  getDataByIdByView: async (RequestId) => {
    try {
      const getDataById = await db.sequelize.query(
        ` ${ViewFieldTableVise.REQUEST_FIELDS} where RequestId  = ${RequestId} `,
        { type: db.Sequelize.QueryTypes.SELECT }
      );
      return getDataById[0] ?? []; // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to mark a record as deleted (soft delete)
  deleteDataById: async (RequestId, req, res) => {
    try {
      const [deleteDataById] = await RequestModel(db.sequelize).update(
        {
          is_active: 0,
          deleted_by: tokenData(req, res),
          deleted_at: new Date(),
        },
        {
          where: {
            RequestId: RequestId,
          },
        }
      );
      return deleteDataById;
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  getUserByUserId: async (user_id, limit, offset) => {
    try {
      // Start with the base query
      let query = `${ViewFieldTableVise.REQUEST_FIELDS} WHERE created_by = ${user_id} order by RequestId desc`;

      // Add LIMIT and OFFSET if they’re provided
      if (limit && offset >= 0) {
        query += ` LIMIT ${offset}, ${limit}`;
      }

      const getAllData = await db.sequelize.query(query, {
        type: db.Sequelize.QueryTypes.SELECT,
      });
      return getAllData;
    } catch (error) {
      throw error;
    }
  },
  // getRequestsForUserFeed: async (user_id, limit = 20, already_viewed) => {
  //   try {
  //     const replacements = { user_id, limit: Number(limit) };

  //     let exclusionClause = "";
  //     if (
  //       already_viewed &&
  //       typeof already_viewed == "string" &&
  //       already_viewed.trim().startsWith("[")
  //     ) {
  //       // JSON-style string: "[174860345,174860346]"
  //       already_viewed = JSON.parse(already_viewed);
  //     } else if (already_viewed && typeof already_viewed == "string") {
  //       // Comma-separated string: "174860345,174860346"
  //       already_viewed = already_viewed
  //         .split(",")
  //         .map((id) => parseInt(id.trim(), 10))
  //         .filter((id) => !isNaN(id));
  //     }
  //     console.log(typeof already_viewed);
  //     if (
  //       already_viewed &&
  //       Array.isArray(already_viewed) &&
  //       already_viewed.length > 0
  //     ) {
  //       exclusionClause = `AND r.RequestId NOT IN (:already_viewed)`;
  //       replacements.already_viewed = already_viewed;
  //     }

  //     const query = `
  //     SELECT * FROM (
  //       (
  //         SELECT r.*
  //         FROM v_Requests r
  //         JOIN user_following uf ON uf.following_user_id = r.request_user_id
  //         WHERE uf.user_id = :user_id
  //           AND uf.is_following = 1
  //           AND uf.is_active = 1
  //           AND r.is_active = 1
  //           AND r.is_blacklist = 0
  //           AND r.request_user_id NOT IN (
  //             SELECT ub.user_id FROM user_blacklist ub WHERE ub.blacklisted_user_id = :user_id AND ub.is_active = 1
  //           )
  //           ${exclusionClause}
  //       )
  //       UNION
  //       (
  //         SELECT r.*
  //         FROM v_Requests r
  //         WHERE r.request_user_id NOT IN (
  //             SELECT following_user_id FROM user_following WHERE user_id = :user_id AND is_following = 1 AND is_active = 1
  //           )
  //           AND r.request_user_id NOT IN (
  //             SELECT user_id FROM user_blacklist WHERE blacklisted_user_id = :user_id AND is_active = 1
  //           )
  //           AND r.is_blacklist = 0
  //           AND r.is_active = 1
  //           ${exclusionClause}
  //         ORDER BY RAND()
  //         LIMIT 5
  //       )
  //     ) AS combined_requests
  //     ORDER BY created_at DESC
  //     LIMIT :limit;
  //   `;

  //     const results = await db.sequelize.query(query, {
  //       replacements,
  //       type: db.Sequelize.QueryTypes.SELECT,
  //     });

  //     return results ?? [];
  //   } catch (error) {
  //     throw error;
  //   }
  // },

  //   getRequestsForUserFeed: async (user_id, limit = 20, already_viewed) => {
  //   try {
  //     const replacements = { user_id, limit: Number(limit) };

  //     // 🧹 Clean up already_viewed input (handles "36,38" or "[36,38]" safely)
  //     if (already_viewed && typeof already_viewed === "string") {
  //       already_viewed = already_viewed.replace(/^"|"$/g, ""); // remove outer quotes if any
  //       if (already_viewed.trim().startsWith("[")) {
  //         already_viewed = JSON.parse(already_viewed);
  //       } else {
  //         already_viewed = already_viewed
  //           .split(",")
  //           .map((id) => parseInt(id.trim(), 10))
  //           .filter((id) => !isNaN(id));
  //       }
  //     }

  //     let exclusionClause = "";
  //     if (Array.isArray(already_viewed) && already_viewed.length > 0) {
  //       exclusionClause = `AND r.RequestId NOT IN (:already_viewed)`;
  //       replacements.already_viewed = already_viewed;
  //     }

  //     // 🧠 Main optimized SQL
  //     const query = `
  //       SELECT r.*
  //       FROM v_Requests r
  //       WHERE r.is_active = 1
  //         AND r.is_blacklist = 0
  //         -- Exclude blacklisted users using EXISTS (faster than NOT IN)
  //         AND NOT EXISTS (
  //           SELECT 1
  //           FROM user_blacklist ub
  //           WHERE ub.is_active = 1
  //             AND (
  //               (ub.user_id = r.request_user_id AND ub.blacklisted_user_id = :user_id)
  //               OR
  //               (ub.user_id = :user_id AND ub.blacklisted_user_id = r.request_user_id)
  //             )
  //         )
  //         ${exclusionClause}
  //         AND (
  //           -- Include followed users' requests
  //           r.request_user_id IN (
  //             SELECT following_user_id
  //             FROM user_following
  //             WHERE user_id = :user_id
  //               AND is_following = 1
  //               AND is_active = 1
  //           )
  //           OR
  //           -- Include random discovery requests
  //           (
  //             r.request_user_id NOT IN (
  //               SELECT following_user_id
  //               FROM user_following
  //               WHERE user_id = :user_id
  //                 AND is_following = 1
  //                 AND is_active = 1
  //             )
  //             AND RAND() < 0.1  -- probabilistic sampling instead of ORDER BY RAND()
  //           )
  //         )
  //       ORDER BY r.created_at DESC
  //       LIMIT :limit;
  //     `;

  //     const results = await db.sequelize.query(query, {
  //       replacements,
  //       type: db.Sequelize.QueryTypes.SELECT,
  //     });

  //     return results ?? [];
  //   } catch (error) {
  //     console.error("Error in getRequestsForUserFeed:", error);
  //     throw error;
  //   }
  // },

  /**
   * Fetch user feed requests excluding already viewed ones.
   * Automatically stores newly fetched requests as viewed.
   */
// getRequestsForUserFeed: async (user_id, limit = 20) => {
//   try {
//     const limitNum = Number(limit);
//     const replacements = { user_id, limit: limitNum };

//     // ---------------------------------------------------------
//     // 1️⃣ Get already viewed request IDs from DB
//     // ---------------------------------------------------------
//     const viewedQuery = `
//       SELECT request_id
//       FROM user_viewed_requests
//       WHERE user_id = :user_id
//         AND is_active = 1
//     `;

//     const viewedResults = await db.sequelize.query(viewedQuery, {
//       replacements: { user_id },
//       type: db.Sequelize.QueryTypes.SELECT,
//     });

//     // Combine any internally viewed IDs with what the DB returned
//     let excludeIds = viewedResults.map((r) => r.request_id);
    
//     // Helper to safely generate NOT IN clause
//     const getExclusionClause = (paramName) => {
//       if (excludeIds.length === 0) return "";
//       return `AND r.RequestId NOT IN (:${paramName})`;
//     };

//     // ---------------------------------------------------------
//     // 2️⃣ Primary Query: FOLLOWED USERS (Priority)
//     // ---------------------------------------------------------
//     if (excludeIds.length > 0) replacements.excludeIds = excludeIds;

//     const queryFollowed = `
//       SELECT r.*
//       FROM v_Requests r
//       WHERE r.is_active = 1
//         AND r.is_blacklist = 0
//         ${getExclusionClause('excludeIds')}

//         -- Exclude blacklisted users
//         AND NOT EXISTS (
//           SELECT 1 FROM user_blacklist ub
//           WHERE ub.is_active = 1
//             AND ((ub.user_id = r.request_user_id AND ub.blacklisted_user_id = :user_id)
//               OR (ub.user_id = :user_id AND ub.blacklisted_user_id = r.request_user_id))
//         )

//         -- ONLY FOLLOWED USERS
//         AND r.request_user_id IN (
//             SELECT following_user_id FROM user_following 
//             WHERE user_id = :user_id AND is_following = 1 AND is_active = 1
//         )
//       ORDER BY r.created_at DESC
//       LIMIT :limit;
//     `;

//     let results = await db.sequelize.query(queryFollowed, {
//       replacements,
//       type: db.Sequelize.QueryTypes.SELECT,
//     });

//     // ---------------------------------------------------------
//     // 3️⃣ Backfill Query: DISCOVERY (Random Strangers)
//     // ---------------------------------------------------------
//     if (results.length < limitNum) {
//       const needed = limitNum - results.length;
//       const currentBatchIds = results.map(r => r.RequestId);
      
//       // Update exclusions to include what we just fetched + history
//       replacements.excludeIdsBackfill = [...excludeIds, ...currentBatchIds];
//       replacements.needed = needed;

//       // Note: We create the clause dynamically based on the updated array
//       const backfillExclusion = replacements.excludeIdsBackfill.length > 0 
//         ? `AND r.RequestId NOT IN (:excludeIdsBackfill)` 
//         : "";

//       const queryBackfill = `
//         SELECT r.*
//         FROM v_Requests r
//         WHERE r.is_active = 1
//           AND r.is_blacklist = 0
//           ${backfillExclusion}

//           -- Exclude blacklisted users
//           AND NOT EXISTS (
//             SELECT 1 FROM user_blacklist ub
//             WHERE ub.is_active = 1
//               AND ((ub.user_id = r.request_user_id AND ub.blacklisted_user_id = :user_id)
//                 OR (ub.user_id = :user_id AND ub.blacklisted_user_id = r.request_user_id))
//           )

//           -- EXCLUDE FOLLOWED
//           AND r.request_user_id NOT IN (
//             SELECT following_user_id FROM user_following 
//             WHERE user_id = :user_id AND is_following = 1 AND is_active = 1
//           )
          
//         ORDER BY RAND()
//         LIMIT :needed;
//       `;

//       const backfillResults = await db.sequelize.query(queryBackfill, {
//         replacements,
//         type: db.Sequelize.QueryTypes.SELECT,
//       });

//       results = [...results, ...backfillResults];
//     }

//     // ---------------------------------------------------------
//     // 4️⃣ RECYCLE Query: Show Old Content (If feed is still empty)
//     // ---------------------------------------------------------
//     // This fixes your 400 error. If the user has seen everything, 
//     // we show them random stuff they've already seen, so the feed doesn't break.
//     if (results.length < limitNum) {
//       const needed = limitNum - results.length;
//       const currentBatchIds = results.map(r => r.RequestId); // Just exclude what is currently in the specific response batch
      
//       replacements.recycleNeeded = needed;
//       replacements.currentBatchIds = currentBatchIds;
      
//       const batchExclusion = currentBatchIds.length > 0 
//          ? `AND r.RequestId NOT IN (:currentBatchIds)` 
//          : "";

//       const queryRecycle = `
//         SELECT r.*
//         FROM v_Requests r
//         WHERE r.is_active = 1
//           AND r.is_blacklist = 0
//           ${batchExclusion} 
          
//           -- Notice: We REMOVED the "Already Viewed" check here.
//           -- We still respect blocks though!
//           AND NOT EXISTS (
//             SELECT 1 FROM user_blacklist ub
//             WHERE ub.is_active = 1
//               AND ((ub.user_id = r.request_user_id AND ub.blacklisted_user_id = :user_id)
//                 OR (ub.user_id = :user_id AND ub.blacklisted_user_id = r.request_user_id))
//           )
          
//         ORDER BY RAND()
//         LIMIT :recycleNeeded;
//       `;

//       const recycleResults = await db.sequelize.query(queryRecycle, {
//         replacements,
//         type: db.Sequelize.QueryTypes.SELECT,
//       });
      
//       results = [...results, ...recycleResults];
//     }

//     // ---------------------------------------------------------
//     // 5️⃣ Mark fetched requests as viewed
//     // ---------------------------------------------------------
//     if (results.length > 0) {
//       const uniqueResults = [...new Map(results.map(item => [item.RequestId, item])).values()];

//       const insertValues = uniqueResults
//         .map(
//           (r) =>
//             `(${db.sequelize.escape(user_id)}, ${db.sequelize.escape(
//               r.RequestId
//             )}, 1, NOW(), NOW())`
//         )
//         .join(",");

//       const insertQuery = `
//         INSERT INTO user_viewed_requests (user_id, request_id, is_active, created_at, modified_at)
//         VALUES ${insertValues}
//         ON DUPLICATE KEY UPDATE modified_at = NOW(), is_active = 1;
//       `;

//       await db.sequelize.query(insertQuery);
      
//       return uniqueResults;
//     }

//     return [];
//   } catch (error) {
//     console.error("❌ Error in getRequestsForUserFeed:", error);
//     throw error;
//   }
// },


getRequestsForUserFeed: async (user_id, limit = 20, batchIndex = 0) => {
    try {
      const startTime = Date.now();
      const limitNum = Number(limit);
      
      let fetchTime = 0, queryTime = 0, fallbackTime = 0;

      // =========================================================
      // 1️⃣ FAST DATA FETCHING (Parallel)
      // =========================================================
      
      // A. Get User Relations from RAM Cache
      const relationsPromise = relationCache.get(user_id, batchIndex);

      // B. Get Viewed Requests from DB
      // We limit to 500 most recent to keep query fast and light
      const viewedPromise = db.sequelize.query(
        `SELECT request_id FROM user_viewed_requests 
         WHERE user_id = :uid AND is_active = 1 
         ORDER BY modified_at DESC LIMIT 500`,
        { replacements: { uid: user_id }, type: db.Sequelize.QueryTypes.SELECT, raw: true }
      );

      const [relationsData, viewedResults] = await Promise.all([relationsPromise, viewedPromise]);

      fetchTime = Date.now() - startTime;

      const { following_ids, blacklist_ids } = relationsData;
      const already_viewed = viewedResults.map((r) => r.request_id);

      // =========================================================
      // 2️⃣ PREPARE SQL VARIABLES
      // =========================================================

      // Exclusion list for "Discovery" (Don't show me people I already follow or blocked)
      const discoveryExcludeIds = [...new Set([...following_ids, ...blacklist_ids, user_id])];

      // Safe Arrays: MySQL 'IN ()' throws error if empty, so we use [-1] as dummy
      const replacements = {
        user_id,
        limit: limitNum,
        following_ids: following_ids.length > 0 ? following_ids : [-1],
        blacklist_ids: blacklist_ids.length > 0 ? blacklist_ids : [-1],
        discovery_exclude_ids: discoveryExcludeIds.length > 0 ? discoveryExcludeIds : [-1],
        already_viewed: already_viewed.length > 0 ? already_viewed : [-1]
      };

      // =========================================================
      // 3️⃣ PRIMARY QUERY (Optimized)
      // =========================================================
      // Strategy:
      // - Part A: Requests from people I follow (Priority 1)
      // - Part B: Random Requests from strangers (Priority 0)
      
      const primaryQuery = `
        SELECT * FROM (
          (
            -- 🟢 PART 1: FOLLOWED USERS
            SELECT r.*, 1 as priority
            FROM ${VIEW_NAME.GET_ALL_REQUEST} r
            WHERE r.request_user_id IN (:following_ids)
              AND r.request_user_id NOT IN (:blacklist_ids)
              AND r.RequestId NOT IN (:already_viewed)
              AND r.is_active = 1
              AND r.is_blacklist = 0
            ORDER BY r.created_at DESC
            LIMIT :limit
          )
          UNION
          (
            -- 🔵 PART 2: DISCOVERY (Smart Random)
            SELECT r.*, 0 as priority
            FROM ${VIEW_NAME.GET_ALL_REQUEST} r
            -- Optimized Random Selection
            JOIN (
                SELECT FLOOR(RAND() * (SELECT MAX(RequestId) FROM v_Requests)) AS rand_id
            ) AS rnd
            WHERE r.RequestId >= rnd.rand_id
              AND r.request_user_id NOT IN (:discovery_exclude_ids)
              AND r.RequestId NOT IN (:already_viewed)
              AND r.is_active = 1
              AND r.is_blacklist = 0
            ORDER BY r.RequestId ASC
            LIMIT 20
          )
        ) AS combined_requests
        ORDER BY priority DESC, created_at DESC
        LIMIT :limit;
      `;

      const queryStart = Date.now();
      
      let results = await db.sequelize.query(primaryQuery, {
        replacements,
        type: db.Sequelize.QueryTypes.SELECT,
      });

      queryTime = Date.now() - queryStart;

      // =========================================================
      // 4️⃣ FALLBACK LOGIC (Recycle Old Content)
      // =========================================================
      
      if (results.length === 0) {
        console.log(`[RequestFeed] User ${user_id} has viewed all new requests. Switching to Fallback.`);
        
        const fallbackStart = Date.now();

        const fallbackQuery = `
          SELECT * FROM (
            (
              -- 🟡 FALLBACK 1: HISTORY (Show followed again)
              SELECT r.*, 1 as priority
              FROM ${VIEW_NAME.GET_ALL_REQUEST} r
              WHERE r.request_user_id IN (:following_ids)
                AND r.request_user_id NOT IN (:blacklist_ids)
                AND r.is_active = 1
                AND r.is_blacklist = 0
              ORDER BY r.created_at DESC
              LIMIT :limit
            )
            UNION
            (
              -- 🟣 FALLBACK 2: PURE DISCOVERY
              SELECT r.*, 0 as priority
              FROM ${VIEW_NAME.GET_ALL_REQUEST} r
              WHERE r.request_user_id NOT IN (:discovery_exclude_ids)
                AND r.is_active = 1
                AND r.is_blacklist = 0
              ORDER BY RAND() -- Safe on fallback because dataset is filtered
              LIMIT 20
            )
          ) AS fallback_requests
          ORDER BY priority DESC, created_at DESC
          LIMIT :limit;
        `;

        results = await db.sequelize.query(fallbackQuery, {
          replacements,
          type: db.Sequelize.QueryTypes.SELECT,
        });

        fallbackTime = Date.now() - fallbackStart;
      }

      // =========================================================
      // 5️⃣ LOG VIEWED REQUESTS (Async / Fire & Forget)
      // =========================================================
      if (results.length > 0) {
        (async () => {
           try {
             const values = results.map(r => 
               `(${user_id}, ${r.RequestId}, 1, NOW(), NOW())`
             ).join(",");

             await db.sequelize.query(`
               INSERT INTO user_viewed_requests (user_id, request_id, is_active, created_at, modified_at)
               VALUES ${values}
               ON DUPLICATE KEY UPDATE modified_at = NOW(), is_active = 1;
             `);
           } catch (logErr) {
             console.error("[RequestFeed] View logging failed:", logErr.message);
           }
        })();
      }

      // =========================================================
      // 6️⃣ FINAL PERFORMANCE LOG
      // =========================================================
      const totalTime = Date.now() - startTime;
      
      console.log(
        `[RequestFeed Perf] User: ${user_id} | ` +
        `Total: ${totalTime}ms | ` +
        `Fetch: ${fetchTime}ms | ` +
        `Query: ${queryTime}ms | ` +
        `Fallback: ${fallbackTime}ms | ` +
        `Results: ${results.length}`
      );

      return results;

    } catch (error) {
      console.error("❌ Error in getRequestsForUserFeed:", error);
      throw error;
    }
  },

  getSumOfTotalRequest: async () => {
    try {
      const getData = await db.sequelize.query(
        `SELECT 
          COUNT(RequestId) AS total_request_global,
          SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_PENDING} THEN 1 ELSE 0 END) AS total_request_pending_status,
          SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_APPROVED} THEN 1 ELSE 0 END) AS total_request_approved_status,
          SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_REJECTED} THEN 1 ELSE 0 END) AS total_request_rejected,
          SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_DRAFT} THEN 1 ELSE 0 END) AS total_request_draft,
          SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_ADMIN_APPROVED} THEN 1 ELSE 0 END) AS total_request_admin
        FROM ${VIEW_NAME.GET_ALL_REQUEST}
        `,
        { type: db.Sequelize.QueryTypes.SELECT }
      );
      return getData[0] ?? {};
    } catch (error) {
      throw error;
    }
  },
  getRecentHundredRequestDesc: async (ngo_id = null) => {
  try {
    let query = `${ViewFieldTableVise.REQUEST_FIELDS} `;
    let replacements = {};

    // If ngo_id exists, add WHERE clause
    if (ngo_id) {
      query += `WHERE AssignedNGO = :ngo_id `;
      replacements.ngo_id = ngo_id;
    }

    // Order + LIMIT always needed
    query += `ORDER BY RequestId DESC LIMIT 100`;

    const getAllData = await db.sequelize.query(query, {
      replacements,
      type: db.Sequelize.QueryTypes.SELECT
    });

    return getAllData;

  } catch (error) {
    throw error;
  }
},

  getRequestByNgoId: async (ngo_id) => {
    try {
      const getData = await db.sequelize.query(
        ` ${ViewFieldTableVise.REQUEST_FIELDS} where AssignedNGO = ${ngo_id} `,
        { type: db.Sequelize.QueryTypes.SELECT }
      );
      return getData;
    } catch (error) {
      throw error;
    }
  },
  getSumOfTotalRequestByUserId: async (request_user_id) => {
    try {
      const getData = await db.sequelize.query(
        `SELECT 
            COUNT(RequestId) AS total_request_global,
            SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_PENDING} THEN 1 ELSE 0 END) AS total_request_pending_status,
            SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_APPROVED} THEN 1 ELSE 0 END) AS total_request_approved_status,
            SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_REJECTED} THEN 1 ELSE 0 END) AS total_request_rejected,
            SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_DRAFT} THEN 1 ELSE 0 END) AS total_request_draft
          FROM ${VIEW_NAME.GET_ALL_REQUEST} WHERE request_user_id = ${request_user_id}
        `,
        { type: db.Sequelize.QueryTypes.SELECT }
      );
      return getData;
    } catch (error) {
      throw error;
    }
  }, 
//   getRequestVideosForUserFeed: async (user_id, limit = 20, already_viewed = []) => {
//   try {
//     const replacements = { user_id, limit: Number(limit) };

//     // 1️⃣ Get already viewed request video IDs from DB
//     const viewedQuery = `
//       SELECT request_id
//       FROM user_viewed_request_videos
//       WHERE user_id = :user_id
//         AND is_active = 1
//     `;

//     const viewedResults = await db.sequelize.query(viewedQuery, {
//       replacements: { user_id },
//       type: db.Sequelize.QueryTypes.SELECT,
//     });

//     const already_viewed = viewedResults.map(r => r.request_id);
//     let exclusionClause = "";
//     let results = [];

//     if (already_viewed.length > 0) {
//       exclusionClause = `AND r.RequestId NOT IN (:already_viewed)`;
//       replacements.already_viewed = already_viewed;
//     }

//     // 2️⃣ Main Feed Query (only video media)
//     const query = `
//       SELECT r.*
//       FROM v_Requests r
//       JOIN v_Request_Media rm ON r.RequestId = rm.RequestId
//       WHERE r.is_active = 1
//         AND r.is_blacklist = 0
//         AND rm.media_type = 'video'
//         -- Exclude blacklisted users
//         AND NOT EXISTS (
//           SELECT 1
//           FROM user_blacklist ub
//           WHERE ub.is_active = 1
//             AND (
//               (ub.user_id = r.request_user_id AND ub.blacklisted_user_id = :user_id)
//               OR
//               (ub.user_id = :user_id AND ub.blacklisted_user_id = r.request_user_id)
//             )
//         )
//         ${exclusionClause}
//         AND (
//           -- Include followed users’ requests
//           r.request_user_id IN (
//             SELECT following_user_id
//             FROM user_following
//             WHERE user_id = :user_id
//               AND is_following = 1
//               AND is_active = 1
//           )
//           OR
//           -- Random discovery requests (non-followed)
//           (
//             r.request_user_id NOT IN (
//               SELECT following_user_id
//               FROM user_following
//               WHERE user_id = :user_id
//                 AND is_following = 1
//                 AND is_active = 1
//             )
//             AND RAND() < 0.1
//           )
//         )
//       ORDER BY r.created_at DESC
//       LIMIT :limit;
//     `;

//     results = await db.sequelize.query(query, {
//       replacements,
//       type: db.Sequelize.QueryTypes.SELECT,
//     });

//     // 3️⃣ Mark fetched request videos as viewed
//     if (results.length > 0) {
//       const insertValues = results
//         .map(
//           r => `(${db.sequelize.escape(user_id)}, ${db.sequelize.escape(r.RequestId)}, 1, NOW(), NOW())`
//         )
//         .join(",");

//       const insertQuery = `
//         INSERT INTO user_viewed_request_videos (user_id, request_id, is_active, created_at, modified_at)
//         VALUES ${insertValues}
//         ON DUPLICATE KEY UPDATE modified_at = NOW(), is_active = 1;
//       `;

//       await db.sequelize.query(insertQuery);
//     } else if (results.length === 0) {
//       // Fallback query if no results
//       const query222 = `
//         SELECT r.*
//         FROM v_Requests r
//         JOIN v_Request_Media rm ON r.RequestId = rm.RequestId
//         WHERE r.is_active = 1
//           AND r.is_blacklist = 0
//           AND rm.media_type = 'video'
//           -- Exclude blacklisted users
//           AND NOT EXISTS (
//             SELECT 1
//             FROM user_blacklist ub
//             WHERE ub.is_active = 1
//               AND (
//                 (ub.user_id = r.request_user_id AND ub.blacklisted_user_id = :user_id)
//                 OR
//                 (ub.user_id = :user_id AND ub.blacklisted_user_id = r.request_user_id)
//               )
//           )
//         ORDER BY RAND()
//         LIMIT :limit;
//       `;

//       results = await db.sequelize.query(query222, {
//         replacements,
//         type: db.Sequelize.QueryTypes.SELECT,
//       });
//     }

//     // 4️⃣ Return results
//     return results ?? [];

//   } catch (error) {
//     console.error("❌ Error in getRequestVideosForUserFeed:", error);
//     throw error;
//   }
// },

getRequestVideosForUserFeed: async (user_id, limit = 20, batchIndex = 0) => {
    try {
      const startTime = Date.now();
      const limitNum = Number(limit);
      
      let fetchTime = 0, queryTime = 0, fallbackTime = 0;

      // =========================================================
      // 1️⃣ FAST DATA FETCHING (Parallel)
      // =========================================================
      
      // A. Get User Relations from RAM Cache
      const relationsPromise = relationCache.get(user_id, batchIndex);

      // B. Get Viewed Request-Videos from DB
      // Note: Using 'user_viewed_request_videos' table
      const viewedPromise = db.sequelize.query(
        `SELECT request_id FROM user_viewed_request_videos 
         WHERE user_id = :uid AND is_active = 1 
         ORDER BY modified_at DESC LIMIT 500`,
        { replacements: { uid: user_id }, type: db.Sequelize.QueryTypes.SELECT, raw: true }
      );

      const [relationsData, viewedResults] = await Promise.all([relationsPromise, viewedPromise]);

      fetchTime = Date.now() - startTime;

      const { following_ids, blacklist_ids } = relationsData;
      const already_viewed = viewedResults.map((r) => r.request_id);

      // =========================================================
      // 2️⃣ PREPARE SQL VARIABLES
      // =========================================================

      const discoveryExcludeIds = [...new Set([...following_ids, ...blacklist_ids, user_id])];

      const replacements = {
        user_id,
        limit: limitNum,
        following_ids: following_ids.length > 0 ? following_ids : [-1],
        blacklist_ids: blacklist_ids.length > 0 ? blacklist_ids : [-1],
        discovery_exclude_ids: discoveryExcludeIds.length > 0 ? discoveryExcludeIds : [-1],
        already_viewed: already_viewed.length > 0 ? already_viewed : [-1]
      };

      // =========================================================
      // 3️⃣ PRIMARY QUERY (Optimized)
      // =========================================================
      
      const primaryQuery = `
        SELECT * FROM (
          (
            -- 🟢 PART 1: FOLLOWING (Videos Only)
            SELECT r.*, 1 as priority
            FROM ${VIEW_NAME.GET_ALL_REQUEST} r
            INNER JOIN ${VIEW_NAME.GET_ALL_REQUEST_MEDIA} rm ON r.RequestId = rm.RequestId
            WHERE r.request_user_id IN (:following_ids)
              AND r.request_user_id NOT IN (:blacklist_ids)
              AND r.RequestId NOT IN (:already_viewed)
              AND r.is_active = 1
              AND r.is_blacklist = 0
              AND rm.media_type = 'video' -- 🎥 Video Filter
            ORDER BY r.created_at DESC
            LIMIT :limit
          )
          UNION
          (
            -- 🔵 PART 2: DISCOVERY (Smart Random)
            SELECT r.*, 0 as priority
            FROM ${VIEW_NAME.GET_ALL_REQUEST} r
            INNER JOIN ${VIEW_NAME.GET_ALL_REQUEST_MEDIA} rm ON r.RequestId = rm.RequestId
            -- Optimized Random Selection
            JOIN (
                SELECT FLOOR(RAND() * (SELECT MAX(RequestId) FROM ${VIEW_NAME.GET_ALL_REQUEST_MEDIA})) AS rand_id
            ) AS rnd
            WHERE r.RequestId >= rnd.rand_id
              AND r.request_user_id NOT IN (:discovery_exclude_ids)
              AND r.RequestId NOT IN (:already_viewed)
              AND r.is_active = 1
              AND r.is_blacklist = 0
              AND rm.media_type = 'video' -- 🎥 Video Filter
            ORDER BY r.RequestId ASC
            LIMIT 20
          )
        ) AS combined_reqs
        ORDER BY priority DESC, created_at DESC
        LIMIT :limit;
      `;

      const queryStart = Date.now();
      
      let results = await db.sequelize.query(primaryQuery, {
        replacements,
        type: db.Sequelize.QueryTypes.SELECT,
      });

      queryTime = Date.now() - queryStart;

      // =========================================================
      // 4️⃣ FALLBACK LOGIC (Recycle Content)
      // =========================================================
      
      if (results.length === 0) {
        console.log(`[ReqVideoFeed] User ${user_id} has viewed all new videos. Switching to Fallback.`);
        
        const fallbackStart = Date.now();

        const fallbackQuery = `
          SELECT * FROM (
            (
              -- 🟡 FALLBACK 1: HISTORY (Show followed again)
              SELECT r.*, 1 as priority
              FROM ${VIEW_NAME.GET_ALL_REQUEST} r
              INNER JOIN ${VIEW_NAME.GET_ALL_REQUEST_MEDIA} rm ON r.RequestId = rm.RequestId
              WHERE r.request_user_id IN (:following_ids)
                AND r.request_user_id NOT IN (:blacklist_ids)
                AND r.is_active = 1
                AND r.is_blacklist = 0
                AND rm.media_type = 'video'
              ORDER BY r.created_at DESC
              LIMIT :limit
            )
            UNION
            (
              -- 🟣 FALLBACK 2: PURE DISCOVERY
              SELECT r.*, 0 as priority
              FROM ${VIEW_NAME.GET_ALL_REQUEST} r
              INNER JOIN ${VIEW_NAME.GET_ALL_REQUEST_MEDIA} rm ON r.RequestId = rm.RequestId
              WHERE r.request_user_id NOT IN (:discovery_exclude_ids)
                AND r.is_active = 1
                AND r.is_blacklist = 0
                AND rm.media_type = 'video'
              ORDER BY RAND() -- Safe on fallback because dataset is filtered
              LIMIT 20
            )
          ) AS fallback_reqs
          ORDER BY priority DESC, created_at DESC
          LIMIT :limit;
        `;

        results = await db.sequelize.query(fallbackQuery, {
          replacements,
          type: db.Sequelize.QueryTypes.SELECT,
        });

        fallbackTime = Date.now() - fallbackStart;
      }

      // =========================================================
      // 5️⃣ LOG VIEWED VIDEOS (Async / Fire & Forget)
      // =========================================================
      if (results.length > 0) {
        (async () => {
           try {
             const values = results.map(r => 
               `(${user_id}, ${r.RequestId}, 1, NOW(), NOW())`
             ).join(",");

             // ⚠️ NOTE: Inserting into user_viewed_request_videos
             await db.sequelize.query(`
               INSERT INTO user_viewed_request_videos (user_id, request_id, is_active, created_at, modified_at)
               VALUES ${values}
               ON DUPLICATE KEY UPDATE modified_at = NOW(), is_active = 1;
             `);
           } catch (logErr) {
             console.error("[ReqVideoFeed] View logging failed:", logErr.message);
           }
        })();
      }

      // =========================================================
      // 6️⃣ FINAL PERFORMANCE LOG
      // =========================================================
      const totalTime = Date.now() - startTime;
      
      console.log(
        `[ReqVideoFeed Perf] User: ${user_id} | ` +
        `Total: ${totalTime}ms | ` +
        `Fetch: ${fetchTime}ms | ` +
        `Query: ${queryTime}ms | ` +
        `Fallback: ${fallbackTime}ms | ` +
        `Results: ${results.length}`
      );

      return results;

    } catch (error) {
      console.error("❌ Error in getRequestVideosForUserFeed:", error);
      throw error;
    }
  },



// getSumOfTotalRequestByNgoId: async (ngo_id) => {
//     try {
//         const getData = await db.sequelize.query(
//             `SELECT 
//             -- 🔹 Global Aggregated Counts (Runs Only Once)
//             g.total_request_global,
//             g.total_request_draft,
//             g.total_admin_approved,

//             -- 🔹 NGO-Specific Counts
//             COUNT(*) AS total_request_assigned_to_ngo,
//             SUM(CASE WHEN n.status_id = ${STATUS_MASTER.REQUEST_PENDING} THEN 1 ELSE 0 END) AS total_request_pending_status,
//             SUM(CASE WHEN n.status_id = ${STATUS_MASTER.REQUEST_APPROVED} THEN 1 ELSE 0 END) AS total_request_approved_status,
//             SUM(CASE WHEN n.status_id = ${STATUS_MASTER.REQUEST_REJECTED} THEN 1 ELSE 0 END) AS total_request_rejected

//             FROM ${VIEW_NAME.GET_ALL_NGO_REQUEST} n

//             -- 🔥 One-Time Global Summary
//             CROSS JOIN (
//                 SELECT 
//                     COUNT(RequestId) AS total_request_global,
//                     SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_DRAFT} THEN 1 ELSE 0 END) AS total_request_draft,
//                     SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_ADMIN_APPROVED} THEN 1 ELSE 0 END) AS total_admin_approved
//                 FROM ${VIEW_NAME.GET_ALL_REQUEST}
//             ) g

//             WHERE n.ngo_id = :ngo_id;
//             `,
//             { 
//                 type: db.Sequelize.QueryTypes.SELECT,
//                 replacements: { ngo_id }
//             }
//         );
//         return getData[0];
//     } catch (error) {
//         throw error;
//     }
// },

getSumOfTotalRequestByNgoId: async (ngo_id) => {
    try {
        const getData = await db.sequelize.query(
            `SELECT 
                g.total_request_global,
                g.total_request_draft,
                g.total_admin_approved,

                COUNT(*) AS total_request_assigned_to_ngo,
                SUM(CASE WHEN n.status_id = ${STATUS_MASTER.REQUEST_PENDING} THEN 1 ELSE 0 END) AS total_request_pending_status,
                SUM(CASE WHEN n.status_id = ${STATUS_MASTER.REQUEST_APPROVED} THEN 1 ELSE 0 END) AS total_request_approved_status,
                SUM(CASE WHEN n.status_id = ${STATUS_MASTER.REQUEST_REJECTED} THEN 1 ELSE 0 END) AS total_request_rejected
            FROM ${VIEW_NAME.GET_ALL_NGO_REQUEST} n
            CROSS JOIN (
                SELECT 
                    COUNT(RequestId) AS total_request_global,
                    SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_DRAFT} THEN 1 ELSE 0 END) AS total_request_draft,
                    SUM(CASE WHEN status_id = ${STATUS_MASTER.REQUEST_ADMIN_APPROVED} THEN 1 ELSE 0 END) AS total_admin_approved
                FROM ${VIEW_NAME.GET_ALL_REQUEST}
            ) g
            WHERE n.ngo_id = :ngo_id
            GROUP BY 
                g.total_request_global,
                g.total_request_draft,
                g.total_admin_approved;
            `,
            { 
                type: db.Sequelize.QueryTypes.SELECT,
                replacements: { ngo_id }
            }
        );

        return getData[0];
    } catch (error) {
        throw error;
    }
},



// NEW: Atomic Increment/Decrement for Requests
UpdateRequestCount: async (RequestId, fieldName, amount) => {
    try {
        return await RequestModel(db.sequelize).increment(fieldName, {
            by: amount,
            where: { RequestId: RequestId }, // Note: Using PascalCase 'RequestId' as per your code
        });
    } catch (error) {
        throw error;
    }
},
};
export default RequestDAL;
