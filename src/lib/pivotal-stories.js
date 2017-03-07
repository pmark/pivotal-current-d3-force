import Constants from './constants';
import parseStories from './parse-stories';

const stories = require('json!../../stories.json');
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


//
//
//

class PivotalStories {
  constructor() {
  }

  loadAllEpics() {
    const labelNames = Object.keys(parsedStories.labels); //.concat(Object.keys(parsedStories.labels));
    const width = Constants.ScreenWidth;
    const leftMargin =  Constants.EpicRadius + Math.max(0, (width / 2) - (labelNames.length * Constants.EpicRadius));
    const div = (width / labelNames.length);

    const nodes = labelNames.map((labelName, index) => {
      const labelStoryCount = parsedStories.labels[labelName];
      const labelKey = `label-${index}`;
      return {
        key: labelKey,
        id: labelKey,
        x: (width/2) + ((index % 2) ? 1 : -1) * index * (Constants.EpicRadius+5)/4,
        y: Constants.ScreenHeight / 2,
        size: Constants.EpicRadius,
        text: labelName,
        type: 'epic',
        storyCount: labelStoryCount,
      };
    });

    return nodes;
  }

  loadEpic(epicName) {

    // STORIES
    const storyNodes = Object.keys(parsedStories.stories).filter(storyId => {
      const story = parsedStories.stories[storyId];
      return story.labels && story.labels.includes(epicName);
    })
    .map(storyId => {
      const story = parsedStories.stories[storyId];
      const radius = Constants.StoryRadius;

      // Create story node
      return {
        id: `story-${storyId}`,
        x: Constants.ScreenWidth / 2,
        y: Constants.ScreenHeight * (story.storyType === 'feature' ? 1.0 : 0.0),
        size: Math.max(radius, radius * (story.points+1) * 0.8),
        text: story.name,
        type: story.storyType,
        labels: story.labels || [],
        rank: labelRank(story.labels), 
        status: story.status,
        points: story.points,
        owners: story.owners || [],
      };
    });


    // OWNERS
    const ownerNameMap= {};
    storyNodes.forEach(storyNode => {
      storyNode.owners.forEach(ownerName => {
        if (!ownerNameMap[ownerName]) {
          const owner = parsedStories.owners[ownerName];
          ownerNameMap[ownerName] = {
            id: `owner-${owner.id}`,
            x: 0, //Constants.ScreenWidth / 2,
            y: Constants.ScreenHeight / 2,
            size: Constants.OwnerRadius,
            text: ownerName,
            type: 'owner',
            fullName: owner.fullName,
          };
        }
      });
    });


    // LINKS
    const ownerNodes = Object.values(ownerNameMap);
    const links = [];
    storyNodes.forEach(storyNode => {
      storyNode.owners.forEach(ownerName => {
        const ownerNode = ownerNameMap[ownerName];

        if (ownerNode) {
          links.push({
            id: `${ownerNode.id}_${storyNode.id}`,
            source: ownerNodes.find(d => d.id === ownerNode.id),
            target: storyNodes.find(d => d.id === storyNode.id),
          });          
        }
      })
    });

    const nodes = ownerNodes.concat(storyNodes);
    return { nodes, links };
  }
}

const pivotalStories = new PivotalStories();

export default pivotalStories;
