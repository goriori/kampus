import { Model, DataTypes, type Optional } from 'sequelize';
import { Database } from '../configs/database';
import { UserRole, UserStatus } from '../types';

interface UserCreationAttributes extends Optional<
  UserAttributes,
  'id' | 'role' | 'status' | 'createdAt' | 'updatedAt'
> { }

interface UserAttributes {
  id: string;
  fullName: string;
  birthDate: Date;
  email: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export class User
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes {
  public id!: string;
  public fullName!: string;
  public birthDate!: Date;
  public email!: string;
  public password!: string;
  public role!: UserRole;
  public status!: UserStatus;
  public createdAt!: Date;
  public updatedAt!: Date;

  public toSafeUser(): Omit<UserAttributes, 'password'> {
    const { password, ...safeUser } = this.toJSON();
    return safeUser;
  }
}

export const initUserModel = (): void => {
  const sequelize = Database.getInstance().getSequelize();

  User.init(
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      fullName: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [2, 100],
        },
      },
      birthDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        validate: {
          notEmpty: true,
          isDate: true,
        },
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
          notEmpty: true,
        },
      },
      password: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [6, 255],
        },
      },
      role: {
        type: DataTypes.ENUM(...Object.values(UserRole)),
        defaultValue: UserRole.USER,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(...Object.values(UserStatus)),
        defaultValue: UserStatus.ACTIVE,
        allowNull: false,
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
      modelName: 'User',
      tableName: 'users',
      timestamps: true,
      defaultScope: {
        attributes: { exclude: ['password'] },
      },
      scopes: {
        withPassword: {
          attributes: { include: ['password'] },
        },
      },
      hooks: {
        beforeCreate: (user: User) => {
          if (user.get('email')) {
            user.email = user.get('email').toLowerCase();
          }
        },
        beforeUpdate: (user: User) => {
          if (user.changed('email')) {
            user.email = user.get('email').toLowerCase();
          }
        },
      },
    },
  );
};
