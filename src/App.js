import React from 'react'
import './App.css';
import { connect } from 'react-redux'
import FetchButton from './FetchButton'
import Joke from './Joke'

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <h1>Get a new Chuck Norris Joke</h1>
        {!this.props.tooMany
          ?  <><FetchButton/><Joke joke={this.props.joke}/></>
          :  <h3>That's Too Many Chuck Norris Jokes.  Please refresh!</h3>
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({tooMany: state.tooMany, joke: state.joke})

export default connect(mapStateToProps)(App)