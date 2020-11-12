const jokeCount = (state=null, action={}) => {
    switch (action.type) {
        case ('SHOW_JOKE'):
            return true
        default:
            return state
    }
}

export default jokeCount