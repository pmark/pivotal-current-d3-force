const parseStories = (stories) => {

  const o = {
    owners: {},
    stories: {},
  };

  const inc = (key, value) => {
    o[key] = o[key] || {};
    let count = (o[key][value] || 0);
    count++;
    o[key][value] = count;
  };

  const StoryTypesToInclude = ['started', 'unstarted', 'finished']; //, 'planned'];

  stories.forEach((story) => {

    const ownerArray = (story.owned_by && story.owned_by.split(',')) || [];
    
    const initialsArray = ownerArray.map(ownerName => {
      // Set the owner .id
      const short = initials(ownerName);
      o.owners[short] = o.owners[short] || {
        id: Object.keys(o.owners).length,
        fullName: ownerName,
      };

      return short;
    });

    if (!StoryTypesToInclude.includes(story.current_state)) { return };

    const labelArray = (story.labels && story.labels.split(',')) || [];
    labelArray.forEach(label => inc('labels', label));

    story.estimate = story.estimate || 0;

    o.stories[story.id] = {
      id: story.id,
      name: story.name,
      storyType: story.story_type,
      owners: initialsArray,
      fullName: story.owned_by,
      labels: story.labels && story.labels.split(','),
      status: story.current_state,
      points: Math.max(story.estimate, 0),
    }
  });
  
  return o;
}

const initials = (name) => (
  name.split(' ').map(word => word[0]).join('').toUpperCase()
);

export default parseStories;
