import App from '../imports/components/App.jsx';
import AppHomeRoute from '../imports/routes/AppHomeRoute';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import { initTemplateStringTransformerFromUrl } from 'relay-runtime-query';

process.nextTick = Meteor._setImmediate;

initTemplateStringTransformerFromUrl('/graphql', (func) => {
  Relay.QL = func;

  Meteor.startup(() => {
    ReactDOM.render(
      <Relay.RootContainer
        Component={App}
        route={new AppHomeRoute()}
      />,
      document.getElementById('root')
    );
  });
});
