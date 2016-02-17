import Relay from 'react-relay';

export default class AppHomeRoute extends Relay.Route {}

AppHomeRoute.queries = {
  viewer: () => Relay.QL`
    query {
      viewer
    }
  `,
};

AppHomeRoute.routeName = 'AppHomeRoute';
