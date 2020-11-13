export const fetchJoke = () => { 
    const max = 5
    const url = 'https://api.chucknorris.io/jokes/random'
    return (dispatch, getState) => {
        if (!getState().tooMany) {
            if (getState().jokeCount >= max) {
                dispatch({type: 'TOO_MANY'})
                dispatch({type: 'SET_JOKE', payload: 'cutting you off'})
            }
            else return fetch(url)
            .then( res => res.json())
            .then( res => {
                dispatch({type: 'INC_JOKE_COUNT'})
                dispatch({type: 'SET_JOKE', payload: res.value})
            })
        }
        else {
            dispatch({type: 'SET_JOKE', payload: "no more jokes"})
        }
    }
}

