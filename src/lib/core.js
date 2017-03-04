const numDataPoints = 50;
const randomNum = () => Math.floor(Math.random() * 1000);
const randomDataSet = () => {
  return Array.apply(null, {length: numDataPoints}).map(() => [randomNum(), randomNum(), Math.floor(Math.random() * 10)]);
}

export const randomizeData = () => {
  return {
    data: randomDataSet(),
    nodes: [{
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
    }]
  };
};
