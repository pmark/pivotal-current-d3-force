import parseStories from '../../src/lib/parse-stories';
const stories = require('../stories.json');

describe('parse-stories', () => {
  let parsed = null;

  before(() => {
    parsed = parseStories(stories);
    // console.log(parsed);
  });

  it('should return an object', () => {
    assert(parsed, 'empty parse');
    assert(parsed.owners, 'missing owners');
    assert(parsed.labels, 'missing labels');
    assert(parsed.stories, 'missing stories');
  });

  it('should have good stories', () => {
    const firstStory = parsed.stories[stories[0].id];
    assert(firstStory, 'missing story');
    assert(firstStory.name, 'missing name');
    assert(firstStory.storyType, 'missing story_type');
    assert(firstStory.labels.length, 'missing labels');
    assert(firstStory.owners.length, 'missing owners');

    expect(firstStory.owners.length).to.equal(2);
    expect(firstStory.owners[0]).to.equal('PMA');
    expect(firstStory.owners[1]).to.equal('PH');
  });

});
