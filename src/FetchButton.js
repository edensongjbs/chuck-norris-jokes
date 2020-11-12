import { fetchJoke } from './actions'
import { connect } from 'react-redux'
import React from 'react'

class FetchButton extends React.Component {
    render() {
        return (
            <button onClick={this.props.fetchJoke}>Click Me!</button>
        )
    }
}

const mapDispatchToProps = dispatch => ({fetchJoke: () => dispatch(fetchJoke())})

export default connect(null, mapDispatchToProps)(FetchButton)