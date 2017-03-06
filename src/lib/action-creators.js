import t from './action-types';
import pivotalStories from './pivotal-stories';

export const loadEpic = (epicName) => {
  console.log('loading epic', epicName);
  const { nodes, links } = pivotalStories.loadEpic(epicName);

  return {
    type: t.LOAD_EPIC,
    nodes: nodes,
    links: links,
  }
}

export const loadAllEpics = () => {
  return {
    type: t.LOAD_ALL_EPICS,
    nodes: pivotalStories.loadAllEpics(),
  }
}
