import React from "react";
import ReactDOM from "react-dom" ;
import HomeContainer from './containers/HomeContainer.js';

// preferable when server does more than serve static files
// Route is the conditionally shown component on matching a path to URL
// essentially fancy case switch for client side
import { BrowserRouter, Switch, Route } from 'react-router-dom';

// provided injects store into container component
import { Provider } from 'react-redux';

// createStore --> creates complete state tree of your app
// applyMiddleware allows for async api calls by letting you dispatch
// async actions in addition to normal actions (basically you get to call dispatch more than once)
import { createStore, applyMiddleware } from 'redux';

// instead of calling dispatch within your components,
// reduxthunk allows to call dispatch within your actions
// dispatch(action) dispatches an action and thus allows for state (store) change
import thunk from 'redux-thunk'; // inverts control by dispatching functions
import reducers from './reducers';

import style from './scss/application.scss';

// routes are currently not used but if they are available if you choose to add routes
ReactDOM.render(
  <Provider store={createStore(reducers, applyMiddleware(thunk))}>
    <BrowserRouter>
      <Switch>
        <Route component={HomeContainer} />
      </Switch>
    </BrowserRouter>
  </Provider>, document.getElementById('root')
)
