import { combineReducers } from 'redux'
import joke from './joke'
import jokeCount from './jokeCount'
import tooMany from './tooMany'


export default combineReducers({
    joke, jokeCount, tooMany
})