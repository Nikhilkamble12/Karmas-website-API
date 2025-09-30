import { DataTypes } from "sequelize";

const RequestModel = (sequelize) => {
    return sequelize.define(
        "requests", {
        RequestId: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        }, request_user_id: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        UserName: {
            type: DataTypes.STRING(255),
            allowNull: false
        }, RequestName: {
            type: DataTypes.STRING(255),
            allowNull: false
        }, Age: {
            type: DataTypes.INTEGER,
            allowNull: true
        }, Gender: {
            type: DataTypes.STRING(10),
            allowNull: true
        }, SahaykaPhoneNo: {
            type: DataTypes.STRING(20),
            allowNull: true
        }, SahaykaEmailID: {
            type: DataTypes.STRING(255),
            allowNull: true
        }, Category: {
            type: DataTypes.STRING(255),
            allowNull: true
        }, Address: {
            type: DataTypes.TEXT,
            allowNull: true
        }, Pincode: {
            type: DataTypes.STRING(10),
            allowNull: true
        }, Remark: {
            type: DataTypes.TEXT,
            allowNull: true
        }, Story: {
            type: DataTypes.TEXT,
            allowNull: true
        }, Problem: {
            type: DataTypes.TEXT,
            allowNull: true
        }, Solution: {
            type: DataTypes.TEXT,
            allowNull: true
        }, MessageToSahayak: {
            type: DataTypes.TEXT,
            allowNull: true
        }, RejectRemark: {
            type: DataTypes.TEXT,
            allowNull: true
        }, AssignedNGO: {
            type: DataTypes.INTEGER,
            allowNull: true
        }, CityId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }, districtId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }, StateId: {
            type: DataTypes.INTEGER,
            allowNull: true
        }, CountryId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },request_type_id:{
            type:DataTypes.INTEGER,
            allowNull:true
        },is_user_tagged:{
            type:DataTypes.TINYINT(1),
            allowNull:true
        },
         status_id: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        is_active: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        created_by: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        is_blacklist:{
            type:DataTypes.TINYINT(1),
            allowNull:true
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
    }, {
        tableName: "requests",
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
    }
    )
}
export default RequestModel