import logo from './logo.svg';
import './App.css';
import { connect }

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <h1>Get a new Chuck Norris Joke</h1>
        {this.props.tooMany
          ?  <><FetchButton/><Joke joke={joke}/></>
          :  <h3>That's Too Many Chuck Norris Jokes.  Please refresh!</h3>
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({tooMany: state.tooMany, joke: state.joke})

export default connect(mapStateToProps)(App)
