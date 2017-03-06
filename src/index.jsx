import './main.css';
import React         from 'react';
import ReactDOM      from 'react-dom';
import { Provider }  from 'react-redux';
import { makeStore } from './lib/store';
import Force         from './components/force-epics.jsx';
import Constants from './lib/constants';
import {
  HashRouter as Router,
  Route
} from 'react-router-dom'

const store = makeStore();
const app = (
  <Provider store={store}>
    <Router>
      <div>
        <Route exact path='/' component={Force} />
        <Route path='/epics/:epicName' component={Force} />
      </div>
    </Router>
  </Provider>
);

const mountingPoint = document.createElement('div');
mountingPoint.className = 'react-app';
document.body.appendChild(mountingPoint);

ReactDOM.render(app, mountingPoint);
