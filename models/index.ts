import { defineAssociations } from './associations';
import { initTaskModel } from './task.model';
import { initUserModel } from './user.model';

export const initializeModels = (): void => {
  initUserModel();
  initTaskModel();
  defineAssociations();
  console.log('📦 Models initialized successfully.');
};

export { User } from './user.model';
export { Task } from './task.model';
