import { User } from './user.model';
import { Task } from './task.model';

export const defineAssociations = (): void => {
  // User -> Task (один ко многим)
  User.hasMany(Task, {
    foreignKey: 'userId',
    as: 'tasks',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });

  // Task -> User
  Task.belongsTo(User, {
    foreignKey: 'userId',
    as: 'user',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
  });
};
