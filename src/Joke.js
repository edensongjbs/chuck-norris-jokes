const Joke = (props) => {
    return (props.joke ? <h3>{props.joke}</h3> : null)
}

export default Joke