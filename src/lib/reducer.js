import t from './action-types';
import pivotalStories from './pivotal-stories';

const initialState = {
  nodes: pivotalStories.loadAllEpics(),
  links: [],
};

export default function reducer(state = initialState, action = {}) {
  console.log('reducer state', state, 'action:', action)
  switch (action.type) {
    case t.LOAD_EPIC:
    case t.LOAD_ALL_EPICS:
      return {
        ...state,
        nodes: action.nodes,
        links: action.links,
      };
    default: 
      return state;
  }
}
