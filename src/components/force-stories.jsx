import React                from 'react';
import ReactDOM from 'react-dom';
import {connect}            from 'react-redux';
import * as actionCreators  from '../lib/action-creators';
import * as d3 from 'd3';
import {forceSimulation, forceManyBody, forceLink, forceCenter, forceCollide, forceX, forceY} from 'd3-force';

const styles = {
  width   : 960,
  height  : 480,
  padding : 50,
};

var fill = d3.scale.category20c();
const simulation = forceSimulation();

// *****************************************************
// ** d3 functions to manipulate attributes
// *****************************************************
d3.selection.prototype.moveToFront = function() { return this.each(function() { this.parentNode.appendChild(this); }); };

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
const isChore = (d) => d.type === 'chore';
const isNotFeature = (d) => d.type !== 'feature';

const nodeDrag = d3.behavior.drag()
    .on('dragstart', dragstart)
    .on('drag', dragmove)
    .on('dragend', dragend);

const dragstart = (d, i) => {
  console.log('drag')
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
const _linkedByIndex = {};

function isConnected(a, b) {
  return _linkedByIndex[a.index + "," + b.index] || _linkedByIndex[b.index + "," + a.index] || a.index == b.index;
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

    d3.select(this).moveToFront().classed('highlight', !reset);

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
  };
}

const click = (d) => {
  if (isStory(d)) {
    const win = window.open(`https://www.pivotaltracker.com/story/show/${d.id}`, '_blank');
    win.focus();
  }
}

const enterNode = (selection, component) => {
  _svgNodes = selection;
  const node = selection
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
      .classed('feature', isFeature)
      .classed('chore', isChore)
      .on('click', click)
      .on('mouseover', fade(0.075, 0.05, false, component))
      .on('mouseout', fade(1.0, 0.25, true, component));

  selection.filter(isPerson)
    .append('circle')
    .attr('r', d => d.size)
    // .attr('stroke-dasharray', d => d.type === 'chore' && '2, 5')
    // .style('fill', d => isPerson(d) ? 'white' : storyFillColor(d));

  selection.filter(isFeature)
    .append('text')
    .text('★')  // ☆★
    .style('font-size', d => d.size+'px')
    .attr('x', d => -d.size*0.5)
    .attr('y', d => d.size*0.3)


  selection.filter(isChore)
    .append('text')
    .text('♦') // ⚙ © ♦ ÷
    .style('font-size', d => d.size+'px')
    .attr('x', d => -d.size*0.5)
    .attr('y', d => d.size*0.3)

  selection.filter(isBug)
    .append('text')
    .text('Ø') // Φ Θ ◉ œ Ø
    .style('font-size', d => d.size+'px')
    .attr('x', d => -d.size*0.5)
    .attr('y', d => d.size*0.33)

  // selection.filter(isStory)
  //   .append('text')
  //   .text((d) => `${d.labels}: ${d.text}`)
  //   .call(wrapText, 300)

  selection.filter(isPerson)
    .append('text')
    .attr('x', 0)
    .attr('y', 0)
    .text((d) => d.text)

  return node;
};

var updateNode = (selection) => {
  const padding = 30;
  selection
    .attr('cx', (d) => (d.x = Math.max(padding, Math.min(styles.width - padding, d.x)) ))
    .attr('cy', (d) => (d.y = Math.max(padding, Math.min(styles.height - padding, d.y)) ))
    .attr('transform', (d) => `translate(${d.x}, ${d.y})`);
};

var enterLink = (selection) => {
  _svgLinks = selection;
  selection.classed('link', true)
    .attr('stroke-width', (d) => 2);
};

var updateLink = (selection) => {
  selection
    .attr('x1', (d) => d.source.x)
    .attr('y1', (d) => d.source.y)
    .attr('x2', (d) => d.target.x)
    .attr('y2', (d) => d.target.y);
};

var updateGraph = (selection) => {
  selection.selectAll('.node')
    .call(updateNode);
  selection.selectAll('.link')
    .call(updateLink);
};

// *****************************************************
// ** Graph and App components
// *****************************************************

class Force extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      headerText: 'Current Sprint',
    };
  }

  simSetup(props) {
    if (this.ready) {
      // console.log('already ready')
      return;
    }
    this.d3Graph = d3.select(ReactDOM.findDOMNode(this.refs.graph));
    
    const nodes = props.nodes.slice();
    const links = props.links.slice();

    links.forEach(d => {
      const key = `${d.source},${d.target}`;
      _linkedByIndex[key] = 1;
    });

    var d3Nodes = this.d3Graph.selectAll('.node')
      .data(nodes); //, (node) => node.key);
    d3Nodes.enter().append('g').call(enterNode, this); //.call(nodeDrag);
    d3Nodes.exit().remove();
    d3Nodes.call(updateNode);

    var d3Links = this.d3Graph.selectAll('.link')
      .data(links); //, (link) => link.key);
    d3Links.enter().insert('line', '.node').call(enterLink);
    d3Links.exit().remove();
    d3Links.call(updateLink);

    simulation.velocityDecay(0.8);
    simulation.nodes(nodes);

    const linkForce = forceLink(props.links.slice())
      .id(d => d.index)
      .strength(.0001) // very low strength

    const xForce = forceX((d) => labelX(d));
    const yForce = forceY((d) => foci[d.type] ? foci[d.type].y : console.assert(false, d.type));
    const collisionForce = forceCollide((d) => 
      d.size * (isPerson(d) ? 1.75 : 0.66));

    simulation.force('y', yForce);
    simulation.force('x', xForce);
    simulation.force('link', linkForce);
    simulation.force('collision', collisionForce);
    // simulation.force('charge', forceManyBody().strength(10));
    // simulation.force('center', forceCenter(styles.width/2, styles.height/2));

    this.ready = true;
  }

  componentDidMount() {
    this.simSetup(this.props);

    simulation.on('tick', tick.bind(this));
      /*
      () => {
      // after force calculation starts, call updateGraph
      // which uses d3 to manipulate the attributes,
      // and React doesn't have to go through lifecycle on each tick
      this.d3Graph.call(updateGraph);

    });
    */
  }

  shouldComponentUpdate(nextProps) {
    this.simSetup(nextProps);
    return true;
  }

  render() {
    return <div>
      <div className='header' style={{width:`${styles.width-32}px`}}>
        {this.state.headerText}
      </div>
      <svg width={styles.width} height={styles.height}> 
        <g ref='graph' />
      </svg>      
    </div>
  }

};

function tick() {
  // after force calculation starts, call updateGraph
  // which uses d3 to manipulate the attributes,
  // and React doesn't have to go through lifecycle on each tick
  this.d3Graph.call(updateGraph);
};

// foci is a dictionary that assigns the x and y value based
// on what group a node belongs to.
const foci = {
  owner: {
    x: styles.width * 0.5,
    y: styles.height * 0.7
  },
  feature: {
    x: styles.width * 0.5,
    y: styles.height * 0.4
  },
  bug: {
    x: styles.width * 0.5 - styles.width * 0.5,
    y: styles.height * 0.15
  },
  chore: {
    x: styles.width * 0.5 + styles.width * 0.5,
    y: styles.height * 0.025
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

const labelX = (d => {
  if (isPerson(d)) {
    return styles.width * 0.5;
  }

  if (d.rank === 1) {
    return styles.width * 0.1;
  }
  else if (d.rank === 2) {
    return styles.width * 0.5;
  }
  else {
    return styles.width * 0.9;
  }

});

export default connect((state) => state, actionCreators)(Force);

