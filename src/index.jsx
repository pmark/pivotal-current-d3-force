import './main.css';
import React         from 'react';
import ReactDOM      from 'react-dom';
import { Provider }  from 'react-redux';
import { makeStore } from './lib/store';
import Force         from './components/force-epics.jsx';
import parseStories  from './lib/parse-stories';

const stories = require('json!../stories.json');

const parsedStories = parseStories(stories);

let sortedLabels = [];
if (parsedStories.labels) {
  const items = Object.keys(parsedStories.labels).map((k) => ({name:k, count:parsedStories.labels[k]}));
  sortedLabels = items.sort((a,b) => b.count - a.count).map(item => item.name);
}

const labelRank = (storyLabels=[]) => {
  const rank = storyLabels.reduce((memo, item) => {
    let tmpRank = sortedLabels.indexOf(item);
    return Math.min(tmpRank, memo);
  }, sortedLabels.length) + 1;

  let normalized = 3;
  if (rank === 1 || rank === 2) {
    normalized = rank;
  }

  return normalized;
}

const nodes = [];
const links = [];

// Add people nodes
Object.keys(parsedStories.owners).forEach((ownerName) => {
  const owner = parsedStories.owners[ownerName];
  const ownerKey = `owner-${owner.id}`;

  nodes.push({
    key: ownerKey,
    id: ownerKey,
    x: 480,
    y: 480,
    size: 25,
    text: ownerName,
    type: 'owner',
    fullName: owner.fullName,
  });
});

/*
// Add stories
Object.keys(parsedStories.stories).forEach((storyId) => {
  const story = parsedStories.stories[storyId];
  const storyKey = `${story.storyType}-${nodes.length}`;
  const nodeIndex = nodes.length;
  const radius = 25;

  // Create story node
  nodes.push({
    key: storyKey,
    id: storyId,
    x: 480,
    y: 0,
    size: Math.max(radius, radius * (story.points+1) * 0.8),
    text: story.name,
    type: story.storyType,
    labels: story.labels,
    rank: labelRank(story.labels), 
    status: story.status,
    points: story.points,
    owners: story.owners,
  });

  // Link owners to story node
  story.owners.forEach(ownerName => {  
    const owner = parsedStories.owners[ownerName];

    links.push({
      source: owner.id,
      target: nodeIndex,
    });
  })
});
*/

// Add epic nodes
Object.keys(parsedStories.labels).forEach((labelName, index) => {
  const labelStoryCount = parsedStories.labels[labelName];
  console.log(labelName, labelStoryCount);

  const labelKey = `label-${index}`;
  console.log('labelKey:', labelKey);

  nodes.push({
    key: labelKey,
    id: labelKey,
    x: 480,
    y: 240,
    size: 25 + (labelStoryCount),
    text: labelName,
    type: 'epic',
    storyCount: labelStoryCount,
  });
});


const store = makeStore();
const app = <Provider store={store}>
  <Force nodes={nodes} links={links} />
</Provider>

const mountingPoint = document.createElement('div');
mountingPoint.className = 'react-app';
document.body.appendChild(mountingPoint);

ReactDOM.render(app, mountingPoint);
