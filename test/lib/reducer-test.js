import { expect } from 'chai';
import reducer from '../../src/lib/reducer';

describe('reducer', () => {
  xit('should return an array of 50 elements', () => {
    const initialState = [];
    const action = {
      type: 'RANDOMIZE',
      state: []
    };
    const nextState = reducer(initialState, action);
    expect(nextState.data.length).to.equal(50);
  });

  xit('should return an array of arrays', () => {
    const initialState = [];
    const action = {
      type: 'RANDOMIZE',
      state: []
    };
    const nextState = reducer(initialState, action);
    nextState.data.forEach((element) =>{
      expect(element.length).to.equal(3);
    });
  });

  xit('should randomize data', () => {
    const action = {
      type: 'RANDOMIZE',
      state: []
    };
    const initialState = reducer([], action);
    const nextState = reducer(initialState, action);
    nextState.data.forEach((element, index) =>{
      expect(element).to.not.equal(initialState.data[index]);
    });
  });
});
