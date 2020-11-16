import createTestStore from '../configureStore'
import fetchMock from 'fetch-mock'
import { fetchJoke } from './'

const url = 'https://api.chucknorris.io/jokes/random'

describe('fetchJoke action creator', () => {
    //Setting up our mock response
    beforeEach(() => {
      fetchMock.mock(url, {
          status: 200,
          value: 'Not a real Chuck Norris joke.'
      });
    })
    // Clearing the mock response.  Returning to default fetch behavior
    afterEach(() => {
      fetchMock.restore()
    })
    test('fetches a joke on the first attempt', () => {
      
      const store = createTestStore();
  
      return store.dispatch(fetchJoke())
        .then(() => {
          const newState = store.getState();
          expect(newState.joke).toBe('Not a real Chuck Norris joke.')
        })
    })
    test('fetches a joke when the limit has almost been reached', () => {
    
      const store = createTestStore({jokeCount:4, joke:""})
  
      return store.dispatch(fetchJoke())
        .then(() => {
          const newState = store.getState();
          expect(newState.joke).toBe('Not a real Chuck Norris joke.')
        })
    })
    test('fetches a joke when the limit will be exceeded', () => {
    
      const store = createTestStore({jokeCount:5, joke:""})
  
      store.dispatch(fetchJoke())
      const newState = store.getState();
      expect(newState.joke).toBe('cutting you off');
    })
    test('fetches a joke when the limit has already been exceeded', () => {
    
      const store = createTestStore({tooMany:true, joke:""})
  
      store.dispatch(fetchJoke())
      const newState = store.getState();
      expect(newState.joke).toBe('no more jokes')
    })
  })