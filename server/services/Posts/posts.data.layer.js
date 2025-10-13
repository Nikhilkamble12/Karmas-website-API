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
      
          if (limit !== null && offset !== null && limit!=="null" && limit!=="undefined" && offset!=="null" && offset!=="undefined" && offset!=="" && limit!=="") {
            baseQuery += ` LIMIT :limit OFFSET :offset`;
            replacements.limit = Number(limit);   // ✅ Ensure numeric type
            replacements.offset = Number(offset); // ✅ Ensure numeric type
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
getPostByUserIdForHome: async (user_id, limit = 20, already_viewed = []) => {
  try {
    const replacements = { user_id, limit: Number(limit) };
    console.log("already_viewed",already_viewed)
    console.log(typeof already_viewed)
    // --- Handle already_viewed posts array ---
    if (typeof already_viewed === "string") {
      already_viewed = already_viewed.replace(/^"|"$/g, ""); // remove wrapping quotes
      if (already_viewed.trim().startsWith("[")) {
        already_viewed = JSON.parse(already_viewed);
      } else {
        already_viewed = already_viewed
          .split(",")
          .map(id => parseInt(id.trim().replace(/"/g, ""), 10))
          .filter(id => !isNaN(id));
      }
    }

    let exclusionClause = "";
    if (Array.isArray(already_viewed) && already_viewed.length > 0) {
      exclusionClause = `AND vp.post_id NOT IN (:already_viewed)`;
      replacements.already_viewed = already_viewed;
    }

    // --- SQL Query ---
    const query = `
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
            ${exclusionClause}
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
            ${exclusionClause}
          ORDER BY RAND()
          LIMIT 20
        )
      ) AS combined_posts
      ORDER BY created_at DESC
      LIMIT :limit;
    `;

    const results = await db.sequelize.query(query, {
      replacements,
      type: db.Sequelize.QueryTypes.SELECT,
    });

    return results ?? [];
  } catch (error) {
    console.error("Error in getPostByUserIdForHome:", error);
    throw error;
  }
}



};

export default PostDAL; // Export the CommentsDAL object for use in the controller
