import t from './action-types';
import pivotalStories from './pivotal-stories';

export const loadEpic = (epicName) => {

  console.log('loading epic', epicName);
  /*
  let nodes = [
  {
    key: 1000,
    id: "3434",
    x: 480,
    y: 0,
    size: 100,
    text: 'test',
    type: 'feature',
    labels: [],
    rank: 1, 
    status: 'finished',
    points: 2,
    owners: ['PMA'],
  },
  {
    key: 1001,
    id: "3435",
    x: 480,
    y: 0,
    size: 100,
    text: 'test',
    type: 'bug',
    labels: [],
    rank: 1, 
    status: 'started',
    points: 2,
    owners: ['ET'],
  },
  ];

  let links = [
    {
      source: { id: nodes[0].id },
      target: { id: nodes[1].id },
    },
  ];
  */

  const { nodes, links } = pivotalStories.loadEpic(epicName);

  return {
    type: t.LOAD_EPIC,
    nodes: nodes,
    links: links,
  }
}
