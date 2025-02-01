import { DataTypes } from "sequelize";

const ScoreEligibilityMapping = (sequelize)=>{
    return sequelize.define("score_eligibility_mapping",{
        mapping_id:{
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, company_id:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, score_required:{
            type:DataTypes.INTEGER,
            allowNull:false
        }, eligible_amount:{
            type:DataTypes.DECIMAL(15,2),
            allowNull:false
        }, is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        created_at: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW
        },
        modified_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        modified_at: {
            type: DataTypes.DATE,
            allowNull: true
        },
        deleted_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        deleted_at: {
            type: DataTypes.DATE,
            allowNull: true
        }
    },{
        tableName: "score_eligibility_mapping",
        paranoid: true,
        timestamps: false,
        defaultScope: {
            attributes: {
                exclude: [
                    "created_by",
                    "modified_by",
                    "deleted_by",
                    "deleted_at",
                    "is_active",
                    "created_at",
                    "modified_at",
                ],
            },
        },
    })
}

export default ScoreEligibilityMapping