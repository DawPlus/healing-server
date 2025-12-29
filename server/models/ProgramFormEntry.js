module.exports = (sequelize, DataTypes) => {
  const ProgramFormEntry = sequelize.define(
    'ProgramFormEntry',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      program_form_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'program_forms',
          key: 'id'
        },
        onDelete: 'CASCADE',
      },
      program_seq: {
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
      score11: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      score12: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      expectation: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      improvement: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: 'program_form_entries',
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    }
  );

  ProgramFormEntry.associate = (models) => {
    ProgramFormEntry.belongsTo(models.ProgramForm, {
      foreignKey: 'program_form_id',
      as: 'form',
    });
  };

  return ProgramFormEntry;
}; 