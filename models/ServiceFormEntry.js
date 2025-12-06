module.exports = (sequelize, DataTypes) => {
  const ServiceFormEntry = sequelize.define(
    'ServiceFormEntry',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      service_form_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'service_forms',
          key: 'id'
        },
        onDelete: 'CASCADE',
      },
      service_seq: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      sex: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      age: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      residence: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      job: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      score1: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      score2: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      score3: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      score4: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      score5: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      score6: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      score7: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      score8: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      score9: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      score10: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      facility_opinion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      score11: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      score12: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      score13: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      score14: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      score15: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      score16: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      operation_opinion: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      score17: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      score18: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      tableName: 'service_form_entries',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  ServiceFormEntry.associate = (models) => {
    ServiceFormEntry.belongsTo(models.ServiceForm, {
      foreignKey: 'service_form_id',
      as: 'form',
    });
  };

  return ServiceFormEntry;
}; 