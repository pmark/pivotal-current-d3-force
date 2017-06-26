import React from 'react';
import ReactDOM from 'react-dom';
import {connect} from 'react-redux';
import * as actionCreators from '../lib/action-creators';
import * as d3 from 'd3';
import { forceSimulation, forceManyBody, forceLink, forceCenter, forceCollide, forceX, forceY } from 'd3-force';
import Constants from '../lib/constants';
import { Route } from 'react-router-dom'

const styles = {
  width   : Constants.ScreenWidth,
  height  : Constants.ScreenHeight,
  padding : Constants.ScreenPadding,
};

// let Constants = {};
const fill = d3.scale.category20();
const simulation = forceSimulation();

let _nodes = null;
let _links = null;
let _d3Graph = null;

// *****************************************************
// ** d3 functions to manipulate attributes
// *****************************************************
d3.selection.prototype.moveToFront = function() { return this.each(function() { this.parentNode.appendChild(this); }); };

const isPerson = (d) => d.type === 'owner';
const isStory = (d) => 'bug chore feature'.includes(d.type);
const isStarted = (d) => d.status === 'started';
const isUnstarted = (d) => d.status === 'unstarted' || d.status === 'planned';
const isFinished = (d) => d.status === 'finished';
const isDelivered = (d) => d.status === 'delivered';
const isAccepted = (d) => d.status === 'accepted';
const isRejected = (d) => d.status === 'rejected';
const isFeature = (d) => d.type === 'feature';
const isBug = (d) => d.type === 'bug';
const isEpic = (d) => d.type === 'epic';
const isChore = (d) => d.type === 'chore';
const isNotFeature = (d) => d.type !== 'feature';

function wrapText(text, width) {
  text.each(function() {
    var text = d3.select(this),
        words = text.text().split(/\s+/).reverse(),
        word,
        line = [],
        lineNumber = 0,
        lineHeight = 1.2, // ems
        y = text.attr('y'),
        dy = parseFloat(text.attr('dy') || 0),
        tspan = text.text(null).append('tspan').attr('x', 0).attr('y', y).attr('dy', dy + 'em');

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(' '));
        line = [word];
        tspan = text.append('tspan').attr('x', 0).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
      }
    }
  });
}

const nodeDrag = d3.behavior.drag()
    .on('dragstart', dragstart)
    .on('drag', dragmove)
    .on('dragend', dragend);

const dragstart = (d, i) => {
  console.info('drag')
    // simulation.force.stop() // stops the force auto positioning before you start dragging
}

const dragmove = (d, i) => {
    d.px += d3.event.dx;
    d.py += d3.event.dy;
    d.x += d3.event.dx;
    d.y += d3.event.dy; 
    // tick.bind(this); // this is the key to make it work together with updating both px,py,x,y on d !
}

const dragend = (d, i) => {
    d.fixed = true; // of course set the node to fixed so the force doesn't include the node in its auto positioning stuff
    // tick.bind(this);
    // simulation.force.resume();
}

let _svgNodes = null;
let _svgLinks = null;
let _linkedByIndex = {};

const linkId = (a, b) => `${a.id}_${b.id}`;

function isConnected(a, b) {
  return _linkedByIndex[linkId(a, b)] || _linkedByIndex[linkId(b, a)] || a.id === b.id;
}

function fade(nodeOpacity, linkOpacity, reset, component) {
  return (d) => {
    if (reset) {
      // component.setState({headerText:null});
    }
    else {
      component.setState({headerText:(
        <div>
          <label>{d.status} {d.type === 'owner' ? d.fullName : d.type}</label>
          <label className='labels'>{d.labels}</label>
          <p>{d.text}</p>
        </div>
      )});
    }

    // d3.select(this).moveToFront().classed('highlight', !reset);

/*
    _svgNodes.selectAll('circle,text')
    .style('opacity', function(o) {
      const thisOpacity = !reset && isConnected(d, o) ? 1 : nodeOpacity;
      this.setAttribute('opacity', thisOpacity);
      // this.moveToFront().classed('highlight', !reset);
      return thisOpacity;
    });

    _svgNodes.selectAll('text')
      .style('opacity', function(o) {
        const thisOpacity = !reset && isConnected(d, o) ? 1 : nodeOpacity;
        this.setAttribute('opacity', thisOpacity);
        return thisOpacity;
      });

    _svgLinks.style('opacity', (o) => reset ? linkOpacity : (o.source === d || o.target === d ? 1 : linkOpacity));
    // _svgNodes.selectAll('.node').classed('highlight', (o) => (o.source === d || o.target === d));
*/
  };
}

const click = (d, component) => {
  if (isStory(d)) {
    const win = window.open(`https://www.pivotaltracker.com/story/show/${d.id.replace(/[^0-9]/g, '')}`, '_blank');
    win.focus();
  }
  else {
    if (isPerson(d)) {

      _nodes.filter(isPerson).forEach(n => {
        if (n.id !== d.id) {
          n.fx = n.fy = null;
        }
      });

      simulation.nodes(_nodes)
      update();

      const center = { x: styles.width/2, y:styles.height/2 }

      // TODO: create links when person is clicked and not before
      
      d3.selectAll('.link').transition().style('opacity', 0); //(o) => (o.source === d || o.target === d ? 1 : 0.0));

      d3.select(`#${d.id}`).transition().duration(250)
        .attr('transform', `translate(${center.x}, ${center.y})`)
        .attr('x', center.x)
        .attr('y', center.y)
        .each('end', d2 => {
          d2.fx = center.x;
          d2.fy = center.y;

          // _svgLinks.style('opacity', l => (isConnected(l, d) ? 1.0 : 0.0));
/*
          _svgNodes.selectAll('circle,text')
            .style('opacity', function(o) {
              const thisOpacity = isConnected(d, o) ? 1 : nodeOpacity;
              this.setAttribute('opacity', thisOpacity);
              // this.moveToFront().classed('highlight', !reset);
              return thisOpacity;
            });

          _svgNodes.selectAll('text')
            .style('opacity', function(o) {
              const thisOpacity = !reset && isConnected(d, o) ? 1 : nodeOpacity;
              this.setAttribute('opacity', thisOpacity);
              return thisOpacity;
            });
*/
          // _svgLinks.style('opacity', 0); //(o) => (o.source === d || o.target === d ? 1 : 0.0));
          // _svgNodes.selectAll('.node').classed('highlight', (o) => (o.source === d || o.target === d));

          d3.selectAll('.link').transition().style('opacity', l => (l.source === d || l.target === d ? 1 : 0.0));
        });

        
    }
    else {
      window.location.hash = `epics/${encodeURIComponent(d.text)}`;      
    }
  }
}

const getPathData = () => {
  /*
  M cx cy
  m -r, 0
  a r,r 0 1,0 (r * 2),0
  a r,r 0 1,0 -(r * 2),0
   */
  const r = Constants.EpicRadius * 0.925;
  const x = 0;
  const y = 0;
  return `M ${x}, ${y} m -${r}, 0
        a ${r},${r} 0 1,0 ${r*2},0
        a ${r},${r} 0 1,0 -${r*2},0`;
}

const enterNode = (selection, component) => {
  _svgNodes = selection;

  const node = selection
    .style('opacity', 0.0)
    .attr('id', d => d.id)
    .attr('class', d => (isPerson(d) ? 'person' : 'story'))
    .classed('node', true)
    .classed('unstarted', isUnstarted)
    .classed('started', isStarted)
    .classed('finished', isFinished)
    .classed('delivered', isDelivered)
    .classed('accepted', isAccepted)
    .classed('rejected', isRejected)
    .classed('story', isStory)
    .classed('bug', isBug)
    .classed('epic-label', isEpic)
    .classed('feature', isFeature)
    .classed('chore', isChore)
    .on('click', d => click(d, component))
    .on('mouseover', fade(0.075, 0.05, false, component))
    .on('mouseout', fade(1.0, 0.25, true, component));

  node.filter(isEpic)
    .append('circle')
    .attr('r', d => d.size);

  node.filter(isEpic)
    .append('text')
      .attr('stroke', d => d3.rgb(fill(d.id)))
      .attr({
        transform: 'rotate(90, 0, 0)',
      })
        .append('textPath')
        .attr({
          startOffset: '50%',
          'xlink:href': '#curvedTextPath',
        })
        .text(d => d.text);

  node.filter(isPerson)
    .append('circle')
    .attr('r', d => d.size);

  node.filter(isFeature)
    .append('text')
    .text('★')  // ☆★
    .style('font-size', d => `${d.size}px`);

  node.filter(isChore)
    .append('text')
    .text('♦') // ⚙ © ♦ ÷
    .style('font-size', d => `${d.size}px`);

  node.filter(isBug)
    .append('text')
    .text('Ø') // Φ Θ ◉ œ Ø
    .style('font-size', d => `${d.size}px`);

  node.filter(isPerson)
    .append('text')
    .attr('x', 0)
    .attr('y', 0)
    .text((d) => d.text)

  return selection;
};

const exitNode = (selection, component) => {
  /*
  selection.transition().duration(1000)
    .selectAll('circle')
    .attr('x', d => -100)
    .attr('y', d => 480)
    .delay(1000)
    .remove();
*/
};

const updateNode = (selection) => {
  let p = null;
  selection
    .attr('cx', (d) => {p=d.size*1.1; d.x = Math.max(p, Math.min(styles.width - p, d.x)) })
    .attr('cy', (d) => {p=d.size*1.1; d.y = Math.max(p, Math.min(styles.height - p, d.y)) })
    .attr('transform', (d) => `translate(${d.x}, ${d.y})`);
};

const enterLink = (selection) => {
  _svgLinks = selection;
  selection.classed('link', true)
    // .attr('stroke-width', (d) => 2);
};

const updateLink = (selection) => {
  selection
    .attr('x1', (d) => d.source.x)
    .attr('y1', (d) => d.source.y)
    .attr('x2', (d) => d.target.x)
    .attr('y2', (d) => d.target.y);
};

const updateGraph = (selection) => {
  selection.selectAll('.node')
    .call(updateNode);
  selection.selectAll('.link')
    .call(updateLink);
};

function update() {
  const d3Nodes = _d3Graph.selectAll('.node').data(_nodes, d => d.id);

  d3Nodes.enter().append('g').call(enterNode, this)
    .transition().duration(750)
    .style('opacity', 1)
    //.call(nodeDrag);

  d3Nodes.exit().transition().duration(1000)
    .style('opacity', 0)
    .attr('transform', (d) => `translate(${Constants.ScreenWidth/2}, ${Constants.ScreenHeight/2}), scale(0)`)
    .remove();

  d3Nodes.call(updateNode);

  const d3Links = _d3Graph.selectAll('.link').data(_links);

  d3Links.enter().insert('line', '.node').call(enterLink);
  d3Links.exit().remove();
  d3Links.call(updateLink);

  _linkedByIndex = {};
  _links.forEach(d => {
    // This is used to show connections
    _linkedByIndex[linkId(d.source, d.target)] = 1;
  });

  const linkForce = forceLink(_links)
    .id(d => d.id)
    .strength(.05) 
    // .strength(d => d.fixed ? 1.0 : .025) // low strength

  const xForce = forceX(xPos);
  const yForce = forceY(yPos);
  const collisionForce = forceCollide(collisionConfig);

  simulation
    .force('y', yForce)
    .force('x', xForce)
    .force('link', linkForce)
    .force('collision', collisionForce)
    // .force('charge', forceManyBody().strength(-250))
    // .force('center', forceCenter(styles.width/2, styles.height/2))
    .velocityDecay(0.8)
    .nodes(_nodes)
    .alpha(1.0)
    .restart()
}


// *****************************************************
// ** Graph and App components
// *****************************************************

class Force extends React.Component {

  constructor(props) {
    super(props);

    console.info('------- new Force --------')
    this.state = {
      headerText: 'Current Sprint',
    };

    this.epicName = null;
  }

  simSetup(props) {
    if (this.ready) {
      // console.info('already ready')
      return;
    }

    console.info('simSetup props', props)
    _d3Graph = d3.select(ReactDOM.findDOMNode(this.refs.graph));

    _d3Graph.append('defs')
      .append('path')
      .attr({
        d: getPathData(),
        id: 'curvedTextPath'
      });

    update = update.bind(this);
    update();

    this.ready = true;
  }

  componentDidMount() {
    console.info('cdm', this.props)
    this.updateFromNav(this.props);
    this.simSetup(this.props);

    simulation.on('tick', tick.bind(this));
      /*
      () => {
      // after force calculation starts, call updateGraph
      // which uses d3 to manipulate the attributes,
      // and React doesn't have to go through lifecycle on each tick
      _d3Graph.call(updateGraph);

    });
    */
  }

  componentWillReceiveProps(nextProps) {
    console.info('cwrp:', nextProps)
    this.updateFromNav(nextProps);
    update();
  }

  shouldComponentUpdate(nextProps) {
    this.simSetup(nextProps);
    // console.info('scu', nextProps);
    return true;
  }

  updateFromNav(props) {
    // const epicName = nextProps.match && nextProps.match.params && nextProps.match.params.epicName;
    const epicName = decodeURIComponent(props.location && props.location.pathname && props.location.pathname.slice('/epics/'.length)) || '';

    console.info('nav epicName:', epicName, 'cur epic:', this.currentEpicName);

    if (this.currentEpicName !== epicName) {
      this.currentEpicName = epicName;

      if (epicName) {
        console.info('Loading epic', epicName);
        this.props.loadEpic(epicName);
      }
      else {
        console.info('Loading all epics', epicName);
        this.props.loadAllEpics();
      }
    }

    _nodes = (props.nodes && props.nodes.slice()) || [];
    _links = (props.links && props.links.slice()) || [];
  }

  render() {
    return (
      <div>
        <div className='header' style={{width:`${styles.width-32}px`}}>
          {this.state.headerText}
        </div>
        <svg width={styles.width} height={styles.height}> 
          <g ref='graph' />
        </svg>      
        
      </div>
    );
  }

};

function tick() {
  // after force calculation starts, call updateGraph
  // which uses d3 to manipulate the attributes,
  // and React doesn't have to go through lifecycle on each tick
  _d3Graph.call(updateGraph);
};

// foci is a dictionary that assigns the x and y value based
// on what group a node belongs to.
const foci = {
  owner: {
    x: styles.width * 0.5,
    y: styles.height * 0.5
  },
  feature: {
    x: styles.width * 0.5,
    y: styles.height * 0.85
  },
  bug: {
    x: styles.width * 0.5,
    y: styles.height * 0.3
  },
  chore: {
    x: styles.width * 0.5,
    y: styles.height * 0.1
  },
  epic: {
    x: styles.width * 0.5,
    y: styles.height * 0.5
  },
  undefined: {
    x: styles.width * 0.5,
    y: styles.height * 0.75
  },
  release: {
    x: styles.width * 2,
    y: styles.height * 2
  },
  null: {
    x: styles.width * 0.5,
    y: styles.height * 0.75
  },
};

const collisionConfig = (d) => {
  let scale = 1.0;
  if (isStory(d)) {
    scale = 1.5;
  }
  else if (isEpic(d)) {
    scale = 1.25;
  }
  else {
    // person
    scale = 2.0;
  }
  return d.size * scale;
};

const xPos = (d => {
  if (d.fixed) {
    return styles.width * 0.5;
  }

  if (isPerson(d)) {
    return styles.width * 0.25;
  }
  else if (isEpic(d)) {
    return d.x;
  }
  else {
    return styles.width * 0.5;
  }


/*
  if (d.rank === 1) {
    return styles.width * 0.1;
  }
  else if (d.rank === 2) {
    return styles.width * 0.5;
  }
  else {
    return styles.width * 0.9;
  }
*/
});

const yPos = (d) => {
  // if (isEpic(d)) {
  //   return d.y;
  // }

  return foci[d.type] ? foci[d.type].y : console.assert(false, d.type)
}

export default connect((state) => state, actionCreators)(Force);

