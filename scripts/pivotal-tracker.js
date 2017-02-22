import fs from 'fs';
require('dotenv').config();

var pivotal = require("pivotal");

var currentIteration = function(done) {
  pivotal.useToken(process.env.PIVOTAL_API_TOKEN);

  pivotal.getCurrentIteration(process.env.PIVOTAL_PROJECT_ID, function(err, result) {
    if (err) {
      console.log('error:', err);
      return done(err);
    }

    done(null, result.iteration.stories.story);
  });
}

const fetchAndSave = () => {
  currentIteration((err, stories) => {
    fs.writeFileSync('./stories.json', JSON.stringify(stories), 'utf8');
    console.log('Wrote', stories.length, 'stories to stories.json');
  })
}

module.exports = {
  currentIteration: currentIteration,
}

fetchAndSave();
