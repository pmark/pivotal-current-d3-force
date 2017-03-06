import { createStore } from 'redux';
import reducer from './reducer';

export const makeStore = () => createStore(
  reducer,
  /* preloadedState, */
  window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__()
);
