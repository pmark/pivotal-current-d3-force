import { randomizeData } from './core';

export default (state = {}, action) => {
  console.log('action:', action)
  switch(action.type) {
    case 'RANDOMIZE':
      return randomizeData();
  }
  return state;
}
