import PostsModel from "./posts.model.js";
import relationCache from "../../utils/helper/follow_blacklist_filter.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
import VIEW_NAME from "../../utils/db/view.constants.js";
const { db, ViewFieldTableVise, tokenData } = commonPath; // Destructure necessary components from commonPath

const PostDAL = {
  // Method to create a new record in the database
  CreateData: async (data) => {
    try {
      const createdData = await PostsModel(db.sequelize).create(data);
      return createdData; // Return the created data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to update an existing record by its ID
  UpdateData: async (post_id, data) => {
    try {
      const updateData = await PostsModel(db.sequelize).update(data, {
        where: { post_id: post_id }, 
      }); // Return the result of the update operation
      return updateData;
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve all records by view
  getAllDataByView: async () => {
    try {
      const getAllData = await db.sequelize.query(
        `${ViewFieldTableVise.POSTS_FIELDS}`,
        { type: db.Sequelize.QueryTypes.SELECT } 
      );
      return getAllData; // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to retrieve a specific record by its ID
  getDataByIdByView: async (post_id) => {
    try {
      const getDataById = await db.sequelize.query(
        ` ${ViewFieldTableVise.POSTS_FIELDS} where post_id  = ${post_id} `,
        { type: db.Sequelize.QueryTypes.SELECT }
      );
      return getDataById[0] ?? [];  // Return the retrieved data
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },
  // Method to mark a record as deleted (soft delete)
  deleteDataById: async (post_id, req, res) => {
    try {
      const [deleteDataById] = await PostsModel(db.sequelize).update(
        {
          is_active: 0,
          deleted_by: tokenData(req, res),
          deleted_at: new Date(),
        },
        {
          where: {
            post_id: post_id,
          },
        }
      );
      return deleteDataById; // Return the result of the update operation
    } catch (error) {
      throw error; // Throw error for handling in the controller
    }
  },getPostDataByUserIdByFilter:async(user_id,offset, limit)=>{
    try{
      let baseQuery = `${ViewFieldTableVise.POSTS_FIELDS} WHERE user_id = :user_id`;
          const replacements = { user_id };
      
          baseQuery += ` ORDER BY post_id DESC`;
      
          // Convert safely and validate
          const limitNum = Number(limit);
          const offsetNum = Number(offset);

          // ✅ Only include LIMIT/OFFSET if both are valid numbers
          if (!isNaN(limitNum) && !isNaN(offsetNum)) {
            baseQuery += ` LIMIT :limit OFFSET :offset`;
            replacements.limit = limitNum;
            replacements.offset = offsetNum;
          }
          
      
          const results = await db.sequelize.query(baseQuery, {
            replacements,
            type: db.Sequelize.QueryTypes.SELECT,
          });
      
          return results ?? [];
    }catch(error){
      throw error
    }
  },


getPostByUserIdForHome: async (user_id, limit = 20, batchIndex = 0) => {
    try {
      // ⏱️ START TIMER
      const startTime = Date.now();
      let limitNum = parseInt(limit);
      if (isNaN(limitNum) || limitNum <= 0) {
          limitNum = 20; // Default fallback
      }
      
      // Track specific durations
      let fetchTime = 0;
      let queryTime = 0;
      let fallbackTime = 0;

      // =========================================================
      // 1️⃣ FAST DATA FETCHING (Parallel)
      // =========================================================
      
      // A. Get User Relations from RAM Cache
      const relationsPromise = relationCache.get(user_id, batchIndex);

      // B. Get Viewed Posts from DB
      const viewedPromise = db.sequelize.query(
        `SELECT post_id FROM user_viewed_posts 
         WHERE user_id = :uid AND is_active = 1 
         ORDER BY modified_at DESC LIMIT 500`,
        { replacements: { uid: user_id }, type: db.Sequelize.QueryTypes.SELECT, raw: true }
      );

      const [relationsData, viewedResults] = await Promise.all([relationsPromise, viewedPromise]);

      // ⏱️ LOG FETCH TIME
      fetchTime = Date.now() - startTime;

      const { following_ids, blacklist_ids } = relationsData;
      const already_viewed = viewedResults.map((r) => r.post_id);

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
            -- 🟢 FEED PART 1: FOLLOWING
            SELECT vp.*, 1 as priority
            FROM massom.${VIEW_NAME.GET_ALL_POSTS} vp
            WHERE vp.user_id IN (:following_ids)
              AND vp.user_id NOT IN (:blacklist_ids)
              AND vp.post_id NOT IN (:already_viewed)
              AND vp.is_active = 1
              AND vp.is_blacklist = 0
            ORDER BY vp.created_at DESC
            LIMIT :limit
          )
          UNION
          (
            -- 🔵 FEED PART 2: DISCOVERY (Smart Random)
            SELECT vp.*, 0 as priority
            FROM massom.${VIEW_NAME.GET_ALL_POSTS} vp
            JOIN (
                SELECT FLOOR(RAND() * (SELECT MAX(post_id) FROM massom.${VIEW_NAME.GET_ALL_POSTS})) AS rand_id
            ) AS r
            JOIN user_master u ON u.user_id = vp.user_id
            WHERE vp.post_id >= r.rand_id
              AND vp.user_id NOT IN (:discovery_exclude_ids)
              AND vp.post_id NOT IN (:already_viewed)
              AND vp.is_active = 1
              AND vp.is_blacklist = 0
              AND u.is_account_public = 1
              AND u.is_blacklisted = 0
            ORDER BY vp.post_id ASC
            LIMIT 20
          )
        ) AS combined_posts
        ORDER BY priority DESC, created_at DESC
        LIMIT :limit;
      `;

      // ⏱️ START QUERY TIMER
      const queryStart = Date.now();
      
      let results = await db.sequelize.query(primaryQuery, {
        replacements,
        type: db.Sequelize.QueryTypes.SELECT,
      });

      // ⏱️ LOG QUERY TIME
      queryTime = Date.now() - queryStart;

      // =========================================================
      // 4️⃣ FALLBACK LOGIC (If Primary Feed is Empty)
      // =========================================================
      
      if (results.length === 0) {
        console.log(`[Feed] User ${user_id} has viewed all new posts. Switching to Fallback.`);
        
        // ⏱️ START FALLBACK TIMER
        const fallbackStart = Date.now();

        const fallbackQuery = `
          SELECT * FROM (
            (
              -- 🟡 FALLBACK 1: HISTORY
              SELECT vp.*, 1 as priority
              FROM massom.${VIEW_NAME.GET_ALL_POSTS} vp
              WHERE vp.user_id IN (:following_ids)
                AND vp.user_id NOT IN (:blacklist_ids)
                AND vp.is_active = 1
                AND vp.is_blacklist = 0
              ORDER BY vp.created_at DESC
              LIMIT :limit
            )
            UNION
            (
              -- 🟣 FALLBACK 2: PURE DISCOVERY
              SELECT vp.*, 0 as priority
              FROM massom.${VIEW_NAME.GET_ALL_POSTS} vp
              JOIN user_master u ON u.user_id = vp.user_id
              WHERE vp.user_id NOT IN (:discovery_exclude_ids)
                AND vp.is_active = 1
                AND vp.is_blacklist = 0
                AND u.is_account_public = 1
                AND u.is_blacklisted = 0
              ORDER BY RAND()
              LIMIT 20
            )
          ) AS fallback_posts
          ORDER BY priority DESC, created_at DESC
          LIMIT :limit;
        `;

        results = await db.sequelize.query(fallbackQuery, {
          replacements,
          type: db.Sequelize.QueryTypes.SELECT,
        });

        // ⏱️ LOG FALLBACK TIME
        fallbackTime = Date.now() - fallbackStart;
      }

      // =========================================================
      // 5️⃣ LOG VIEWED POSTS (Async / Fire & Forget)
      // =========================================================
      if (results.length > 0) {
        (async () => {
           try {
             const values = results.map(vp => 
               `(${user_id}, ${vp.post_id}, 1, NOW(), NOW())`
             ).join(",");

             await db.sequelize.query(`
               INSERT INTO user_viewed_posts (user_id, post_id, is_active, created_at, modified_at)
               VALUES ${values}
               ON DUPLICATE KEY UPDATE modified_at = NOW(), is_active = 1;
             `);
           } catch (logErr) {
             console.error("[Feed] View logging failed:", logErr.message);
           }
        })();
      }

      // =========================================================
      // 6️⃣ FINAL PERFORMANCE LOG
      // =========================================================
      const totalTime = Date.now() - startTime;
      
      // This will print a clear report in your console:
      // [Feed Perf] User: 101 | Total: 45ms | Fetch: 5ms | Query: 38ms | Fallback: 0ms | Results: 20
      console.log(
        `[Feed Perf] User: ${user_id} | ` +
        `Total: ${totalTime}ms | ` +
        `Fetch (Cache+DB): ${fetchTime}ms | ` +
        `Main Query: ${queryTime}ms | ` +
        `Fallback: ${fallbackTime}ms | ` +
        `Results: ${results.length}`
      );

      return results;

    } catch (error) {
      console.error("❌ Error in getPostByUserIdForHome:", error);
      throw error;
    }
},

getVideoPostByUserIdForHomePage: async (user_id, limit = 20, batchIndex = 0) => {
    try {
      // ⏱️ START TIMER
      const startTime = Date.now();
      const limitNum = Number(limit);
      
      let fetchTime = 0, queryTime = 0, fallbackTime = 0;

      // =========================================================
      // 1️⃣ FAST DATA FETCHING (Parallel)
      // =========================================================
      
      // A. Get User Relations from RAM Cache
      const relationsPromise = relationCache.get(user_id, batchIndex);

      // B. Get Viewed VIDEOS from DB (Note: Different table than Posts)
      const viewedPromise = db.sequelize.query(
        `SELECT post_id FROM user_viewed_video 
         WHERE user_id = :uid AND is_active = 1 
         ORDER BY modified_at DESC LIMIT 500`,
        { replacements: { uid: user_id }, type: db.Sequelize.QueryTypes.SELECT, raw: true }
      );

      const [relationsData, viewedResults] = await Promise.all([relationsPromise, viewedPromise]);

      fetchTime = Date.now() - startTime;

      const { following_ids, blacklist_ids } = relationsData;
      const already_viewed = viewedResults.map((r) => r.post_id);

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
      // 3️⃣ PRIMARY QUERY (Optimized for Video)
      // =========================================================
      
      const primaryQuery = `
        SELECT * FROM (
          (
            -- 🟢 FEED PART 1: FOLLOWING (Videos Only)
            SELECT vp.*, 1 as priority
            FROM massom.${VIEW_NAME.GET_ALL_POSTS} vp
            INNER JOIN massom.${VIEW_NAME.GET_ALL_POST_MEDIA} vpm ON vp.post_id = vpm.post_id
            WHERE vp.user_id IN (:following_ids)
              AND vp.user_id NOT IN (:blacklist_ids)
              AND vp.post_id NOT IN (:already_viewed)
              AND vp.is_active = 1
              AND vp.is_blacklist = 0
              AND vpm.media_type = 'video' -- 🎥 Video Filter
            ORDER BY vp.created_at DESC
            LIMIT :limit
          )
          UNION
          (
            -- 🔵 FEED PART 2: DISCOVERY (Smart Random Videos)
            SELECT vp.*, 0 as priority
            FROM massom.${VIEW_NAME.GET_ALL_POSTS} vp
            INNER JOIN massom.${VIEW_NAME.GET_ALL_POST_MEDIA} vpm ON vp.post_id = vpm.post_id
            -- Optimized Random Selection
            JOIN (
                SELECT FLOOR(RAND() * (SELECT MAX(post_id) FROM massom.${VIEW_NAME.GET_ALL_POSTS})) AS rand_id
            ) AS r
            JOIN user_master u ON u.user_id = vp.user_id
            WHERE vp.post_id >= r.rand_id
              AND vp.user_id NOT IN (:discovery_exclude_ids)
              AND vp.post_id NOT IN (:already_viewed)
              AND vp.is_active = 1
              AND vp.is_blacklist = 0
              AND vpm.media_type = 'video' -- 🎥 Video Filter
              AND u.is_account_public = 1
              AND u.is_blacklisted = 0
            ORDER BY vp.post_id ASC
            LIMIT 20
          )
        ) AS combined_videos
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
      // 4️⃣ FALLBACK LOGIC (If Primary Feed is Empty)
      // =========================================================
      
      if (results.length === 0) {
        console.log(`[VideoFeed] User ${user_id} has viewed all new videos. Switching to Fallback.`);
        
        const fallbackStart = Date.now();

        const fallbackQuery = `
          SELECT * FROM (
            (
              -- 🟡 FALLBACK 1: HISTORY (Show followed videos again)
              SELECT vp.*, 1 as priority
              FROM massom.v_Posts vp
              INNER JOIN massom.v_PostMedia vpm ON vp.post_id = vpm.post_id
              WHERE vp.user_id IN (:following_ids)
                AND vp.user_id NOT IN (:blacklist_ids)
                AND vp.is_active = 1
                AND vp.is_blacklist = 0
                AND vpm.media_type = 'video'
              ORDER BY vp.created_at DESC
              LIMIT :limit
            )
            UNION
            (
              -- 🟣 FALLBACK 2: PURE DISCOVERY
              SELECT vp.*, 0 as priority
              FROM massom.v_Posts vp
              INNER JOIN massom.v_PostMedia vpm ON vp.post_id = vpm.post_id
              JOIN user_master u ON u.user_id = vp.user_id
              WHERE vp.user_id NOT IN (:discovery_exclude_ids)
                AND vp.is_active = 1
                AND vp.is_blacklist = 0
                AND vpm.media_type = 'video'
                AND u.is_account_public = 1
                AND u.is_blacklisted = 0
              ORDER BY RAND() -- Safe on fallback because dataset is filtered
              LIMIT 20
            )
          ) AS fallback_videos
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
             const values = results.map(vp => 
               `(${user_id}, ${vp.post_id}, 1, NOW(), NOW())`
             ).join(",");

             // ⚠️ NOTE: Inserting into user_viewed_video table
             await db.sequelize.query(`
               INSERT INTO user_viewed_video (user_id, post_id, is_active, created_at, modified_at)
               VALUES ${values}
               ON DUPLICATE KEY UPDATE modified_at = NOW(), is_active = 1;
             `);
           } catch (logErr) {
             console.error("[VideoFeed] View logging failed:", logErr.message);
           }
        })();
      }

      // =========================================================
      // 6️⃣ FINAL PERFORMANCE LOG
      // =========================================================
      const totalTime = Date.now() - startTime;
      
      console.log(
        `[VideoFeed Perf] User: ${user_id} | ` +
        `Total: ${totalTime}ms | ` +
        `Fetch: ${fetchTime}ms | ` +
        `Query: ${queryTime}ms | ` +
        `Fallback: ${fallbackTime}ms | ` +
        `Results: ${results.length}`
      );

      return results;

    } catch (error) {
      console.error("❌ Error in getVideoPostByUserIdForHomePage:", error);
      throw error;
    }
  },
// NEW: Atomic Increment/Decrement for Posts
CountUpdatePost: async (post_id, fieldName, amount) => {
    try {
        return await PostsModel(db.sequelize).increment(fieldName, {
            by: amount, // Pass negative number (e.g., -1) to decrement
            where: { post_id: post_id },
        });
    } catch (error) {
        throw error;
    }
},

};

export default PostDAL; // Export the CommentsDAL object for use in the controller
