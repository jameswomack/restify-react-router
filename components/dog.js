var React = require('react'),
    DOM = React.DOM, div = DOM.div, button = DOM.button;

// This is just a simple example of a component that can be rendered on both
// the server and browser

module.exports = React.createClass({

  // We initialise its state by using the `props` that were passed in when it
  // was first rendered. We also want the button to be disabled until the
  // component has fully mounted on the DOM
  getInitialState: function() {
    return {id: 'Ruff - ' + this.props.id, everybody: this.props.everybody, disabled: true};
  },

  // Once the component has been mounted, we can enable the button
  componentDidMount: function() {
    this.setState({disabled: false});
  },

  // Then we just update the state whenever its clicked by adding a new item to
  // the list - but you could imagine this being updated with the results of
  // AJAX calls, etc
  handleClick: function() {
    this.setState({
      id: this.state.id.concat('foo')
    });
  },

  // For ease of illustration, we just use the React JS methods directly
  // (no JSX compilation needed)
  // Note that we allow the button to be disabled initially, and then enable it
  // when everything has loaded
  render: function() {
    return div(null,
               button({onClick: this.handleClick, disabled: this.state.disabled}, this.state.id),
               div(null, this.state.everybody)
    );
  }
});
