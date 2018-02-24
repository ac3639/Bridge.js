import axios from 'axios';

//================================================================
// NOTE the reinitialize and init may be combinable
// redux-thunk may cause glitchyness without it
// these methods just return store back to the initial state ie everything is compatible
export function init(){
  return {
    type: 'INIT'
  }
}

export function reinitialize(){
  return (dispatch) => {
    dispatch(init())
  }
}

//================================================================
// actions must be plain objects, therefore we used custom middleware
// when creating the store to allow for api call first
// basically redux-thunk allows for dispatch to be called a second time within your actions file

// a function is returned with an argument of dispatch
// dispatch is called with the action updateData
// updateData then returns an object that tells our reducer how to change our store
export function updateData(payload){
  return {
    type: 'UPDATE_DATA',
    payload: payload
  }
}

export function getKeywords(word){
  return (dispatch) => {
    axios.get(`http://localhost:3000/db/${word}`).then((res) => {
      dispatch(updateData(res.data));
    })
  }
}
