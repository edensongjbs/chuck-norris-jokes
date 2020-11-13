import rootReducer from '../reducers'
import { createStore, applyMiddleware } from 'redux'
import { middleware } from '../configureStore'
import fetchMock from 'fetch-mock'
import { fetchJoke } from './'

const url = 'https://api.chucknorris.io/jokes/random'

const createTestStore = (initialState) => {
    console.log(middleware)
    const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore)
    return createStoreWithMiddleware(rootReducer, initialState)
}

describe('fetchJoke action creator', () => {
    beforeEach(() => {
      fetchMock.mock(url, {
          status: 200,
          value: 'Not a real Chuck Norris joke.'
      });
    //   console.log(res.ok)
    });
    afterEach(() => {
      fetchMock.restore()
    })
    test('fetches a joke', () => {
    
      const store = createTestStore();
    //   console.log(store)
    //   moxios.wait(() => {
    //     const request = moxios.requests.mostRecent();
    //     request.respondWith({
    //       status: 200,
    //       response: secretWord,
    //     });
    //   });
  
      return store.dispatch(fetchJoke())
        .then(() => {
          const newState = store.getState();
          expect(newState.joke).toBe('Not a real Chuck Norris joke.');
        })
    });
  });