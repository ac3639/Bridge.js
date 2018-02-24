import React,{Component} from "react";
import { connect } from "react-redux";
import { getKeywords, reinitialize } from "../actions";

import Results from '../components/Results.js';

function mapStateToProps(state) {
  return {
    data: state.data
  }
}

class HomeContainer extends Component {
  constructor(props){
    super(props);
    this.sendWord = this.sendWord.bind(this);
  }

  sendWord(e){
    // e.target is the dom element that is calling sendWord
    // if value is an empty string, then reinitialize the store state

    // Otherwise send the last word or method in the textbox to the api call (getWords)
    // api call will check that particular word's compatibility

    // TODO if textbox is empty reset state
    // TODO parse all data if user copies and pastes
    if(e.target.value === ''){
      this.props.dispatch(reinitialize());
    }
    else {
      const index = Math.max(e.target.value.lastIndexOf(' '), e.target.value.lastIndexOf('.')) + 1;
      const lastWord = e.target.value.slice(index).trim();
      if(lastWord) this.props.dispatch(getKeywords(lastWord));
    }
  }

  render() {
    return (
      <div className="main">
        <h1>Check Browser Compatibility <img src="https://avatars0.githubusercontent.com/u/7565578?s=200&v=4"/></h1>
        <div className="form-group">
          <label>Place code below...</label>
          <textarea className="form-control" rows="5" id="comment" onChange={this.sendWord}></textarea>
        </div>
        <Results data={this.props.data.data}/>
      </div>
    )
  }
}



export default connect(mapStateToProps)(HomeContainer);
