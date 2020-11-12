import { combineReducers } from 'redux'
import joke from './jokes'
import jokeCount from './jokeCount'
import tooMany from './tooMany'


export default combineReducers({
    joke, jokeCount, tooMany
})