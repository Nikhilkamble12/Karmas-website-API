import ScoreHistoryModel from "./score.history.model.js";
import commonPath from "../../middleware/comman_path/comman.path.js"; // Import common paths and utilities
const { db, ViewFieldTableVise, tokenData } = commonPath // Destructure necessary components from commonPath
import { STATUS_MASTER } from "../../utils/constants/id_constant/id.constants.js";

const ScoreHistoryDAL = {
    // Method to create a new record in the database
    CreateData: async (data) => {
        try {
            const createdData = await ScoreHistoryModel(db.sequelize).create(data)
            return createdData // Return the created data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to update an existing record by its ID
    UpdateData: async (sr_no, data) => {
        try {
            const updateData = await ScoreHistoryModel(db.sequelize).update(data, { where: { sr_no: sr_no } })
            return updateData // Return the result of the update operation
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve all records by view
    getAllDataByView: async () => {
        try {
            const getAllData = await db.sequelize.query(`${ViewFieldTableVise.SIMPLE_SCORE_HISTORY_FIELDS}`, { type: db.Sequelize.QueryTypes.SELECT })
            return getAllData // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to retrieve a specific record by its ID
    getDataByIdByView: async (sr_no) => {
        try {
            const getDataById = await db.sequelize.query(` ${ViewFieldTableVise.SIMPLE_SCORE_HISTORY_FIELDS} where sr_no  = ${sr_no} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataById[0] ?? [] // Return the retrieved data
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    },
    // Method to mark a record as deleted (soft delete)
    deleteDataById: async (sr_no, req, res) => {
        try {
            const [deleteDataById] = await ScoreHistoryModel(db.sequelize).update({ is_active: 0, deleted_by: tokenData(req, res), deleted_at: new Date() }, {
                where: {
                    sr_no: sr_no
                }
            })
            return deleteDataById
        } catch (error) {
            throw error // Throw error for handling in the controller
        }
    }, getSimpleScoreHistoryByUserId: async (user_id) => {
        try {
            const getDataByuserId = await db.sequelize.query(` ${ViewFieldTableVise.SIMPLE_SCORE_HISTORY_FIELDS} where user_id  = ${user_id} `, { type: db.Sequelize.QueryTypes.SELECT })
            return getDataByuserId
        } catch (error) {
            throw error
        }
    }, getScoreDashBoardDataByLimit: async (limit) => {
        try {
            const replacements = { limit: parseInt(limit) };

            // Fetch Top Scorers (highest cumulative total score)
            // Fetch Top Scorers (highest cumulative total score)
            const topScorers = await db.sequelize.query(
                `SELECT user_id, user_name, file_name, file_path, total_score, week1_score, week2_score, difference,` + "`rank`" + ` FROM v_weekly_user_scores ORDER BY` + "`rank`" + ` ASC LIMIT :limit`,
                { replacements, type: db.Sequelize.QueryTypes.SELECT }
            );
            topScorers.sort((a, b) => a.rank - b.rank); // Note: Assuming 'rank' property will exist after fix

            // Fetch Top Gainers (highest positive difference between total score and last week's score)
            const topGainers = await db.sequelize.query(
                `SELECT user_id, user_name, file_name, file_path, total_score, week1_score, week2_score, difference,` + "`rank`" + ` FROM v_weekly_user_scores ORDER BY difference DESC LIMIT :limit`,
                { replacements, type: db.Sequelize.QueryTypes.SELECT }
            );

            // Fetch Top Losers (highest negative difference between total score and last week's score)
            const topLosers = await db.sequelize.query(
                `SELECT user_id, user_name, file_name, file_path, total_score, week1_score, week2_score, difference, ` + "`rank`" + ` FROM v_weekly_user_scores ORDER BY difference ASC LIMIT :limit`,
                { replacements, type: db.Sequelize.QueryTypes.SELECT }
            );

            return { topScorers, topGainers, topLosers };

        } catch (error) {
            throw error
        }
    }, getUserRankByUseriD: async (user_id) => {
        try {

            const getUserScore = await db.sequelize.query(
                `
                SELECT *, 
                ROW_NUMBER() OVER (ORDER BY total_score DESC) AS row_num
                FROM massom.v_weekly_user_scores
                WHERE user_id = :userId
                `,
                {
                    replacements: { userId: user_id },
                    type: db.Sequelize.QueryTypes.SELECT,
                }
            );
            const updatedUsers = getUserScore.map(user => {
                return {
                    ...user,
                    current_user: user.user_id === user_id
                };
            });
            return updatedUsers
        } catch (error) {
            throw error
        }
    }, getAllScoreHistoryByUserIdByLimit: async (user_id, limit, offset) => {
        try {
            const getUserData = await db.sequelize.query(`
                ${ViewFieldTableVise.SIMPLE_SCORE_HISTORY_FIELDS}
                WHERE user_id = :user_id
                ORDER BY date DESC
                LIMIT :limit OFFSET :offset
                `, {
                replacements: { user_id, limit: Number(limit), offset: Number(offset) },
                type: db.Sequelize.QueryTypes.SELECT
            });
            return getUserData
        } catch (error) {
            throw error
        }
    }, 
    // ScoreDashBoardCount: async () => {
    //     try {
    //         const getScoreHistory = await db.sequelize.query(
    //             ` SELECT 
    //         -- Losing scorers
    //         SUM(CASE WHEN difference < 0 THEN 1 ELSE 0 END) AS score_losing_scorers_count,
    //         -- Gaining scorers
    //         SUM(CASE WHEN difference >= 0 THEN 1 ELSE 0 END) AS score_gaining_scorers_count,
    //         -- Zero scorers this month (week1_score = 0)
    //         SUM(CASE WHEN week1_score = 0 THEN 1 ELSE 0 END) AS score_zero_weekly_scorers_count,
    //         SUM(CASE WHEN total_score = 0 THEN 1 ELSE 0 END) AS score_zero_total_scorers_count,
    //         SUM(CASE WHEN total_score > 0  THEN 1 ELSE 0 END) AS score_greater_than_zero_total_scorers_count,
    //         -- Top scorers this month (max week1_score)
    //         (SELECT COUNT(*) 
    //             FROM massom.v_weekly_user_scores v
    //             WHERE v.week1_score = (SELECT MAX(week1_score) FROM massom.v_weekly_user_scores)
    //         ) AS score_top_scorers_this_month,
    //         -- Top active scorers (max total_score)
    //         (SELECT COUNT(*) 
    //             FROM massom.v_weekly_user_scores v
    //             WHERE v.total_score = (SELECT MAX(total_score) FROM massom.v_weekly_user_scores)
    //         ) AS score_top_active_scorers
    //         FROM massom.v_weekly_user_scores;
    //         `, { type: db.Sequelize.QueryTypes.SELECT }
    //         )
    //         return getScoreHistory
    //     } catch (error) {
    //         throw error
    //     }
    // }
    ScoreDashBoardCount: async () => {
    try {
        const getScoreHistory = await db.sequelize.query(
            `
            WITH score_data AS (
                SELECT 
                    week1_score,
                    total_score,
                    difference
                FROM massom.v_weekly_user_scores
            ),
            max_values AS (
                SELECT
                    MAX(week1_score) AS max_week1_score,
                    MAX(total_score) AS max_total_score
                FROM score_data
            )
            SELECT
                count(*) AS total_score_count,
                SUM(CASE WHEN difference < 0 THEN 1 ELSE 0 END) AS score_losing_scorers_count,
                SUM(CASE WHEN difference >= 0 THEN 1 ELSE 0 END) AS score_gaining_scorers_count,
                SUM(CASE WHEN week1_score = 0 THEN 1 ELSE 0 END) AS score_zero_weekly_scorers_count,
                SUM(CASE WHEN total_score = 0 THEN 1 ELSE 0 END) AS score_zero_total_scorers_count,
                SUM(CASE WHEN total_score > 0  THEN 1 ELSE 0 END) AS score_greater_than_zero_total_scorers_count,
                SUM(CASE WHEN week1_score = (SELECT max_week1_score FROM max_values) THEN 1 END) AS score_top_scorers_this_month,
                SUM(CASE WHEN total_score = (SELECT max_total_score FROM max_values) THEN 1 END) AS score_top_active_scorers
            FROM score_data;
            `,
            { type: db.Sequelize.QueryTypes.SELECT }
        );

        return getScoreHistory;
    } catch (error) {
        throw error;
    }
}

    ,getDataBySearchFilter:async(user_name)=>{
        try{
            const getData = await db.sequelize.query(` SELECT * FROM v_weekly_user_scores where user_name like ${user_name} `,{type:db.Sequelize.QueryTypes.SELECT})
            return getData
        }catch(error){
            throw error
        }
    }, checkWetherUserIsPresent : async (user_name, limit, offset) => {
        try {
            let query = `${ViewFieldTableVise.SIMPLE_SCORE_HISTORY_FIELDS} WHERE user_name LIKE :user_name AND is_active = 1`;

            const replacements = { user_name: `%${user_name}%`};

            if (
                typeof limit === 'number' &&
                typeof offset === 'number' &&
                !isNaN(limit) &&
                !isNaN(offset)
            ) {
                query += ` LIMIT :limit OFFSET :offset`;
                replacements.limit = limit;
                replacements.offset = offset;
            }

            const getData = await db.sequelize.query(query, {
                replacements,
                type: db.Sequelize.QueryTypes.SELECT,
            });

            return getData;
            
        } catch (error) {
            
        }
    },getCountofTotalRequestAcceptedByUserId:async(user_id)=>{
        try{
            const getCountData = await db.sequelize.query(
                ` SELECT COUNT(*) AS total_accepted_requests FROM massom.v_simple_score_history WHERE user_id = :user_id AND status_id = ${STATUS_MASTER.REQUEST_APPROVED}`,{
                replacements:{user_id},
                type:db.Sequelize.QueryTypes.SELECT
            })
            return getCountData
        }catch(error){
            throw error
        }
    }
}

export default ScoreHistoryDAL