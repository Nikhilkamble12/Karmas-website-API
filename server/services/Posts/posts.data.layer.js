import PostsModel from "./posts.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
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
//   getPostByUserIdForHome: async (user_id, limit = 20, already_viewed = []) => {
//   try {
//     const replacements = { user_id, limit: Number(limit) };
//     let exclusionClause = '';
//     if (already_viewed && typeof already_viewed =="string" && already_viewed.trim().startsWith('[')) {
//       // JSON-style string: "[174860345,174860346]"
//       already_viewed = JSON.parse(already_viewed);
//     } else if (already_viewed && already_viewed =="string"){
//       // Comma-separated string: "174860345,174860346"
//       already_viewed = already_viewed
//         .split(',')
//         .map(id => parseInt(id.trim(), 10))
//         .filter(id => !isNaN(id));
//     }
//     if (already_viewed.length > 0) {
//       exclusionClause = `AND vp.post_id NOT IN (:already_viewed)`;
//       replacements.already_viewed = already_viewed;
//     }

//     const query = `
//     SELECT * FROM (
//       (
//         -- Followed users' posts
//         SELECT vp.*
//         FROM massom.v_Posts vp
//         JOIN user_following uf 
//           ON uf.following_user_id = vp.user_id
//         WHERE uf.user_id = :user_id
//           AND uf.is_following = 1
//           AND uf.is_active = 1
//           AND vp.is_active = 1
//           AND vp.is_blacklist = 0
//           AND vp.user_id NOT IN (
//               SELECT ub.user_id 
//               FROM user_blacklist ub 
//               WHERE ub.blacklisted_user_id = :user_id AND ub.is_active = 1
//           )
//           ${exclusionClause}
//       )
//       UNION
//       (
//         -- Random discovery posts
//         SELECT vp.*
//         FROM massom.v_Posts vp
//         WHERE vp.user_id NOT IN (
//             SELECT following_user_id 
//             FROM user_following 
//             WHERE user_id = :user_id AND is_following = 1 AND is_active = 1
//         )
//           AND vp.user_id NOT IN (
//               SELECT user_id 
//               FROM user_blacklist 
//               WHERE blacklisted_user_id = :user_id AND is_active = 1
//           )
//           AND vp.is_blacklist = 0
//           AND vp.is_active = 1
//           ${exclusionClause}
//         ORDER BY RAND()
//         LIMIT 20
//       )
//     ) AS combined_posts
//     ORDER BY created_at DESC
//     LIMIT :limit;
//     `;

//     const results = await db.sequelize.query(query, {
//       replacements,
//       type: db.Sequelize.QueryTypes.SELECT
//     });

//     return results ?? [];
//   } catch (error) {
//     throw error;
//   }
// }
// getPostByUserIdForHome: async (user_id, limit = 20, already_viewed = []) => {
//   try {
//     const replacements = { user_id, limit: Number(limit) };
//     // --- Handle already_viewed posts array ---
//     if (typeof already_viewed === "string") {
//       already_viewed = already_viewed.replace(/^"|"$/g, ""); // remove wrapping quotes
//       if (already_viewed.trim().startsWith("[")) {
//         already_viewed = JSON.parse(already_viewed);
//       } else {
//         already_viewed = already_viewed
//           .split(",")
//           .map(id => parseInt(id.trim().replace(/"/g, ""), 10))
//           .filter(id => !isNaN(id));
//       }
//     }

//     let exclusionClause = "";
//     if (Array.isArray(already_viewed) && already_viewed.length > 0) {
//       exclusionClause = `AND vp.post_id NOT IN (:already_viewed)`;
//       replacements.already_viewed = already_viewed;
//     }

//     // --- SQL Query ---
//     const query = `
//       SELECT * FROM (
//         (
//           -- 1️⃣ Posts from followed users (not blacklisted)
//           SELECT vp.*
//           FROM massom.v_Posts vp
//           JOIN user_following uf 
//             ON uf.following_user_id = vp.user_id
//           WHERE uf.user_id = :user_id
//             AND uf.is_following = 1
//             AND uf.is_active = 1
//             AND vp.is_active = 1
//             AND vp.is_blacklist = 0
//             AND NOT EXISTS (
//               SELECT 1
//               FROM user_blacklist ub
//               WHERE ub.is_active = 1
//                 AND (
//                   (ub.user_id = vp.user_id AND ub.blacklisted_user_id = :user_id)
//                   OR
//                   (ub.user_id = :user_id AND ub.blacklisted_user_id = vp.user_id)
//                 )
//             )
//             ${exclusionClause}
//         )
//         UNION
//         (
//           -- 2️⃣ Random discovery posts (excluding followed & blacklisted users)
//           SELECT vp.*
//           FROM massom.v_Posts vp
//           WHERE vp.user_id NOT IN (
//               SELECT following_user_id 
//               FROM user_following 
//               WHERE user_id = :user_id
//                 AND is_following = 1
//                 AND is_active = 1
//           )
//             AND vp.is_active = 1
//             AND vp.is_blacklist = 0
//             AND NOT EXISTS (
//               SELECT 1
//               FROM user_blacklist ub
//               WHERE ub.is_active = 1
//                 AND (
//                   (ub.user_id = vp.user_id AND ub.blacklisted_user_id = :user_id)
//                   OR
//                   (ub.user_id = :user_id AND ub.blacklisted_user_id = vp.user_id)
//                 )
//             )
//             ${exclusionClause}
//           ORDER BY RAND()
//           LIMIT 20
//         )
//       ) AS combined_posts
//       ORDER BY created_at DESC
//       LIMIT :limit;
//     `;

//     const results = await db.sequelize.query(query, {
//       replacements,
//       type: db.Sequelize.QueryTypes.SELECT,
//     });

//     return results ?? [];
//   } catch (error) {
//     console.error("Error in getPostByUserIdForHome:", error);
//     throw error;
//   }
// }
getPostByUserIdForHome: async (user_id, limit = 20) => {
  try {
    const replacements = { user_id, limit: Number(limit) };

    // 1️⃣ Get already viewed post IDs from DB
    const viewedQuery = `
      SELECT post_id
      FROM user_viewed_posts
      WHERE user_id = :user_id
        AND is_active = 1
    `;
    const viewedResults = await db.sequelize.query(viewedQuery, {
      replacements: { user_id },
      type: db.Sequelize.QueryTypes.SELECT,
    });
    let results = []
    const already_viewed = viewedResults.map((r) => r.post_id);
    let exclusionClause = "";
    if (already_viewed.length > 0) {
      exclusionClause = `AND vp.post_id NOT IN (:already_viewed)`;
      replacements.already_viewed = already_viewed;
    }

    // 2️⃣ Main Feed Query (optimized)
    const query = `
      SELECT * FROM (
        (
          -- Followed users' posts (excluding blacklisted)
          SELECT vp.*
          FROM massom.v_Posts vp
          JOIN user_following uf 
            ON uf.following_user_id = vp.user_id
          WHERE uf.user_id = :user_id
            AND uf.is_following = 1
            AND uf.is_active = 1
            AND vp.is_active = 1
            AND vp.is_blacklist = 0
            AND NOT EXISTS (
              SELECT 1
              FROM user_blacklist ub
              WHERE ub.is_active = 1
                AND (
                  (ub.user_id = vp.user_id AND ub.blacklisted_user_id = :user_id)
                  OR
                  (ub.user_id = :user_id AND ub.blacklisted_user_id = vp.user_id)
                )
            )
            ${exclusionClause}
        )
        UNION
        (
          -- Random discovery posts (optimized, non-followed, excluding blacklisted)
          SELECT vp.*
          FROM massom.v_Posts vp
          JOIN (
            SELECT FLOOR(RAND() * (SELECT MAX(post_id) FROM massom.v_Posts)) AS rand_id
          ) AS r
          JOIN user_master u ON u.user_id = vp.user_id
          WHERE vp.post_id >= r.rand_id
            AND vp.user_id NOT IN (
              SELECT following_user_id 
              FROM user_following 
              WHERE user_id = :user_id
                AND is_following = 1
                AND is_active = 1
            )
            AND vp.is_active = 1
            AND vp.is_blacklist = 0
            AND u.is_account_public = 1 
            AND u.is_blacklisted = 0        
            AND NOT EXISTS (
              SELECT 1
              FROM user_blacklist ub
              WHERE ub.is_active = 1
                AND (
                  (ub.user_id = vp.user_id AND ub.blacklisted_user_id = :user_id)
                  OR
                  (ub.user_id = :user_id AND ub.blacklisted_user_id = vp.user_id)
                )
            )
            ${exclusionClause}
          ORDER BY vp.post_id
          LIMIT 20
        )
      ) AS combined_posts
      ORDER BY created_at DESC
      LIMIT :limit;
    `;

    results = await db.sequelize.query(query, {
      replacements,
      type: db.Sequelize.QueryTypes.SELECT,
    });

    // 3️⃣ Mark fetched posts as viewed
    if (results.length > 0) {
      const insertValues = results
        .map(
          (vp) =>
            `(${db.sequelize.escape(user_id)}, ${db.sequelize.escape(
              vp.post_id
            )}, 1, NOW(), NOW())`
        )
        .join(",");

      const insertQuery = `
        INSERT INTO user_viewed_posts (user_id, post_id, is_active, created_at, modified_at)
        VALUES ${insertValues}
        ON DUPLICATE KEY UPDATE modified_at = NOW(), is_active = 1;
      `;

      await db.sequelize.query(insertQuery);
    }else if(results.length == 0){
       // --- SQL Query ---
    const query22 = `
      SELECT * FROM (
        (
          -- 1️⃣ Posts from followed users (not blacklisted)
          SELECT vp.*
          FROM massom.v_Posts vp
          JOIN user_following uf 
            ON uf.following_user_id = vp.user_id
          WHERE uf.user_id = :user_id
            AND uf.is_following = 1
            AND uf.is_active = 1
            AND vp.is_active = 1
            AND vp.is_blacklist = 0
            AND NOT EXISTS (
              SELECT 1
              FROM user_blacklist ub
              WHERE ub.is_active = 1
                AND (
                  (ub.user_id = vp.user_id AND ub.blacklisted_user_id = :user_id)
                  OR
                  (ub.user_id = :user_id AND ub.blacklisted_user_id = vp.user_id)
                )
            )
            
        )
        UNION
        (
          -- 2️⃣ Random discovery posts (excluding followed & blacklisted users)
          SELECT vp.*
          FROM massom.v_Posts vp
          WHERE vp.user_id NOT IN (
              SELECT following_user_id 
              FROM user_following 
              WHERE user_id = :user_id
                AND is_following = 1
                AND is_active = 1
          )
            AND vp.is_active = 1
            AND vp.is_blacklist = 0
            AND NOT EXISTS (
              SELECT 1
              FROM user_blacklist ub
              WHERE ub.is_active = 1
                AND (
                  (ub.user_id = vp.user_id AND ub.blacklisted_user_id = :user_id)
                  OR
                  (ub.user_id = :user_id AND ub.blacklisted_user_id = vp.user_id)
                )
            )
            
          ORDER BY RAND()
          LIMIT 20
        )
      ) AS combined_posts
      ORDER BY created_at DESC
      LIMIT :limit;
    `;

      results = await db.sequelize.query(query22, {
      replacements,
      type: db.Sequelize.QueryTypes.SELECT,
    });
    }

    // 4️⃣ Return results
    return results ?? [];
  } catch (error) {
    console.error("❌ Error in getPostsForUserFeed:", error);
    throw error;
  }
},
getVideoPostByUserIdForHomePage: async (user_id, limit = 20) => {
  try {
    const replacements = { user_id, limit: Number(limit) };

    // 1️⃣ Get already viewed video IDs
    const viewedQuery = `
      SELECT post_id
      FROM user_viewed_video
      WHERE user_id = :user_id
        AND is_active = 1
    `;
    const viewedResults = await db.sequelize.query(viewedQuery, {
      replacements: { user_id },
      type: db.Sequelize.QueryTypes.SELECT,
    });

    let results = [];
    const already_viewed = viewedResults.map((r) => r.post_id);
    let exclusionClause = "";
    if (already_viewed.length > 0) {
      exclusionClause = `AND vp.post_id NOT IN (:already_viewed)`;
      replacements.already_viewed = already_viewed;
    }

    // 2️⃣ Main video feed query
    const query = `
      SELECT * FROM (
        (
          -- Followed users' videos
          SELECT DISTINCT vp.*
          FROM massom.v_Posts vp
          JOIN massom.v_PostMedia vpm ON vp.post_id = vpm.post_id
          JOIN user_following uf ON uf.following_user_id = vp.user_id
          WHERE vpm.media_type = 'video'
            AND uf.user_id = :user_id
            AND uf.is_following = 1
            AND uf.is_active = 1
            AND vp.is_active = 1
            AND vp.is_blacklist = 0
            AND NOT EXISTS (
              SELECT 1
              FROM user_blacklist ub
              WHERE ub.is_active = 1
                AND (
                  (ub.user_id = vp.user_id AND ub.blacklisted_user_id = :user_id)
                  OR
                  (ub.user_id = :user_id AND ub.blacklisted_user_id = vp.user_id)
                )
            )
            ${exclusionClause}
        )
        UNION
        (
          -- Random discovery videos
          SELECT DISTINCT vp.*
          FROM massom.v_Posts vp
          JOIN massom.v_PostMedia vpm ON vp.post_id = vpm.post_id
          JOIN (
            SELECT FLOOR(RAND() * (SELECT MAX(post_id) FROM massom.v_Posts)) AS rand_id
          ) AS r
          WHERE vpm.media_type = 'video'
            AND vp.post_id >= r.rand_id
            AND vp.user_id NOT IN (
              SELECT following_user_id 
              FROM user_following 
              WHERE user_id = :user_id
                AND is_following = 1
                AND is_active = 1
            )
            AND vp.is_active = 1
            AND vp.is_blacklist = 0
            AND NOT EXISTS (
              SELECT 1
              FROM user_blacklist ub
              WHERE ub.is_active = 1
                AND (
                  (ub.user_id = vp.user_id AND ub.blacklisted_user_id = :user_id)
                  OR
                  (ub.user_id = :user_id AND ub.blacklisted_user_id = vp.user_id)
                )
            )
            ${exclusionClause}
          ORDER BY RAND()
          LIMIT 20
        )
      ) AS combined_videos
      ORDER BY created_at DESC
      LIMIT :limit;
    `;

    results = await db.sequelize.query(query, {
      replacements,
      type: db.Sequelize.QueryTypes.SELECT,
    });

    // 3️⃣ Mark fetched videos as viewed
    if (results.length > 0) {
      const insertValues = results
        .map(
          (vp) =>
            `(${db.sequelize.escape(user_id)}, ${db.sequelize.escape(
              vp.post_id
            )}, 1, NOW(), NOW())`
        )
        .join(",");

      const insertQuery = `
        INSERT INTO user_viewed_video (user_id, post_id, is_active, created_at, modified_at)
        VALUES ${insertValues}
        ON DUPLICATE KEY UPDATE modified_at = NOW(), is_active = 1;
      `;

      await db.sequelize.query(insertQuery);
    } else if (results.length == 0) {
      // 4️⃣ Fallback query if all videos already viewed
      const query22 = `
        SELECT * FROM (
          (
            -- Followed users' videos
            SELECT DISTINCT vp.*
            FROM massom.v_Posts vp
            JOIN massom.v_PostMedia vpm ON vp.post_id = vpm.post_id
            JOIN user_following uf ON uf.following_user_id = vp.user_id
            WHERE vpm.media_type = 'video'
              AND uf.user_id = :user_id
              AND uf.is_following = 1
              AND uf.is_active = 1
              AND vp.is_active = 1
              AND vp.is_blacklist = 0
              AND NOT EXISTS (
                SELECT 1
                FROM user_blacklist ub
                WHERE ub.is_active = 1
                  AND (
                    (ub.user_id = vp.user_id AND ub.blacklisted_user_id = :user_id)
                    OR
                    (ub.user_id = :user_id AND ub.blacklisted_user_id = vp.user_id)
                  )
              )
          )
          UNION
          (
            -- Random discovery videos
            SELECT DISTINCT vp.*
            FROM massom.v_Posts vp
            JOIN massom.v_PostMedia vpm ON vp.post_id = vpm.post_id
            WHERE vpm.media_type = 'video'
              AND vp.user_id NOT IN (
                SELECT following_user_id 
                FROM user_following 
                WHERE user_id = :user_id
                  AND is_following = 1
                  AND is_active = 1
              )
              AND vp.is_active = 1
              AND vp.is_blacklist = 0
              AND NOT EXISTS (
                SELECT 1
                FROM user_blacklist ub
                WHERE ub.is_active = 1
                  AND (
                    (ub.user_id = vp.user_id AND ub.blacklisted_user_id = :user_id)
                    OR
                    (ub.user_id = :user_id AND ub.blacklisted_user_id = vp.user_id)
                  )
              )
            ORDER BY RAND()
            LIMIT 20
          )
        ) AS fallback_videos
        ORDER BY RAND()
        LIMIT :limit;
      `;

      results = await db.sequelize.query(query22, {
        replacements,
        type: db.Sequelize.QueryTypes.SELECT,
      });
    }

    // 5️⃣ Return results
    return results ?? [];
  } catch (error) {
    console.error("❌ Error in getVideoPostForHome:", error);
    throw error;
  }
},

};

export default PostDAL; // Export the CommentsDAL object for use in the controller
