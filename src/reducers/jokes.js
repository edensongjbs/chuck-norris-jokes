const joke = (state=null, action={}) => {
    switch (action.type) {
        case ('SET_JOKE'):
            return action.payload
        default:
            return state
    }
}

export default joke