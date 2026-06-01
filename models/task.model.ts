import { Model, DataTypes, type Optional } from 'sequelize';
import { Database } from '../configs/database';
import { TaskStatus } from '../types';

interface TaskCreationAttributes extends Optional<
  TaskAttributes,
  'id' | 'userId' | 'status' | 'createdAt' | 'updatedAt'
> { }

interface TaskAttributes {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  dueDate: Date | null;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export class Task
  extends Model<TaskAttributes, TaskCreationAttributes>
  implements TaskAttributes {
  public id!: string;
  public title!: string;
  public description!: string | null;
  public status!: TaskStatus;
  public dueDate!: Date | null;
  public userId!: string | null;
  public createdAt!: Date;
  public updatedAt!: Date;

  public toJSON(): TaskAttributes {
    const values = { ...this.get() };
    return values;
  }
}

export const initTaskModel = (): void => {
  const sequelize = Database.getInstance().getSequelize();

  Task.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 200],
        },
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(TaskStatus)),
        defaultValue: TaskStatus.PENDING,
        allowNull: false,
      },
      dueDate: {
        type: DataTypes.DATEONLY,
        allowNull: true,
        validate: {
          isDate: true,
        },
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL', // при удалении пользователя задача остаётся, userId = null
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    },
    {
      sequelize,
      modelName: 'Task',
      tableName: 'tasks',
      timestamps: true,
    },
  );
};
