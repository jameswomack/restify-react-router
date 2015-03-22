var React = require('react');

// Demonstrates rendering of JSX
class Cat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {id: 'Miau - ' + this.props.id, everybody: this.props.everybody, disabled: true};
  }

  componentDidMount() {
    this.setState({disabled: false});
  }

  handleClick() {
    this.setState({
      id: this.state.id.concat('foo')
    });
  }

  render() {
    return (<div>
            <button onClick={this.handleClick} disabled={this.state.disabled}>{this.state.id}</button>
            <div>{this.state.everybody}</div>
           </div>);
  }
}

module.exports = Cat;
