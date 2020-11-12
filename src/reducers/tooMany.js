const tooMany = (state=false, action={}) => {
    switch (action.type) {
        case ('TOO_MANY'):
            return true
        default:
            return state
    }
}

export default tooMany