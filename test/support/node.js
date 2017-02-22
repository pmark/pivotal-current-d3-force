
const chai = require("chai");
const chaiAsPromised = require("chai-as-promised");

chai.should();
chai.use(chaiAsPromised);

global.chaiAsPromised = chaiAsPromised;
global.expect = chai.expect;
global.AssertionError = chai.AssertionError;
global.Assertion = chai.Assertion;
global.assert = chai.assert;

global.fulfilledPromise = Promise.resolve;
global.rejectedPromise = Promise.reject;
global.waitAll = Promise.all;
