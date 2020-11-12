const jokeCount = (state=0, action={}) => {
    switch (action.type) {
        case ('INC_JOKE_COUNT'):
            return state++
        default:
            return state
    }
}

export default jokeCount