To install, clone/download and run:
`npm i` (to install dependencies)
`npm start` (to start developent server)

# Asynchronous Testing Techniques with Jest

When I'm working on a personal **React** project, I'm always tempted to cut to the chase and get right to coding the fun stuff: seeing my app concept come to life.  I'll try and get a quick interface up and running, verify that it's behaving as expected in the browser and call it a day.  Often times (especially with a simple project), this is fine.  There are those other times when things break unexpectedly and I'll be stuck digging back through my code in painstaking detail trying to remind myself how a particular piece of state is being updated or how a particular component is being used, all the while cursing myself for not starting out the project with a more rigorous test-driven approach.

**Test-driven development** (TDD) always feels like a lift in the beginning stages of a project, but it can end up saving so much time down the road.  TDD forces us to do the mental work up front.  In the context of a **React** project, this means more rigorously planning the different components and their responsibilities, how these components will use state and how that state will be updated.  It lets us determine what is essential to the structure and function of our app, while abstracting away the implementation details that we can refactor as we go.  It provides us a failsafe, letting us know immediately if we modified something that's going to break our application. Beyond this, it makes collaboration and communication easier in the long-run.  Being able to successfully test an app requires that we are able to clearly understand, anticipate, codify, and communicate how the app should be working.  

## Challenges of Asynchronous Testing

For testing in **React**, I've primarily been using the **Jest** testing framework (which comes pre-installed in any new project created with `npx create-react-app`).  The [API Docs](https://jestjs.io/docs/en/getting-started) are well-written and the syntax (`describe`, `test`, `expect`) felt quite familiar to me coming from **Rspec** in the Ruby language.  Nevertheless, testing **JavaScript** poses some interesting challenges, especially when it comes to handling asynchronous functions.  While there are endless examples of those in any given **JS/React** project, I'm going to focus this article on how to do asynchronous testing with **Redux-Thunk** action creators, something I've found particularly challenging to wrap my head around.

If you're unfamiliar with **Redux-Thunk**, I'd recommend checking out [this post](https://www.digitalocean.com/community/tutorials/redux-redux-thunk#:~:text=Redux%20Thunk%20is%20a%20middleware,asynchronous%20operations%20have%20been%20completed.).  In short, **Redux-Thunk** allows for dispatching an asynchronous action, by letting you call an action creator that returns a function (instead of a simple action object), into which the store's dispatch function is passed.  The passed dispatch function is then used to dispatch standard **Redux** action objects from within the function (either synchronously or asynchronously).

To help me demonstrate some **Redux-Thunk** testing techniques in **Jest**, I'll call upon everyone's favorite hyperbolic tough guy, Chuck Norris, to lend a hand...

![Friendly Chuck gives a thumbs up](https://dev-to-uploads.s3.amazonaws.com/i/sm00iifupjcl7836qone.jpg)

## The App

I've built an exceedingly simple **React/Redux** app to demo our tests (you can find the GitHub repo [here](https://github.com/edensongjbs/chuck-norris-jokes)).  In short, the app is a front-end for the [ChuckNorris.io API](https://api.chucknorris.io/), where the user will click a button and a random Chuck Norris 
"fact" will be displayed on the screen.  Important to our implementation is the detail that the user can only fetch up to 5 Chuck Norris "facts" before being cut off and being forced to refresh the page.  Though it's overkill in the extreme to be using **Redux** for such a simple app, it seems appropriately in the spirit of Chuck Norris and certainly a good opportunity to demo testing techniques without too many complicating factors. 

![App Demo Gif](https://dev-to-uploads.s3.amazonaws.com/i/bsfbjzv97w1rkxfvpoda.gif)

Here's a step by step for following along at home:

## Installing Dependencies

After creating a new react app (via `npx create-react-app chuck-norris-jokes`), you'll need to install the following dependencies to get things set up:

`npm install --save-dev fetch-mock` ( to mock the API fetch request so that we can test our app in isolation )
`npm intall --save-dev node-fetch` ( since the tests will be using the fetch API without the browser )
`npm install redux react-redux redux-thunk` ( since the app uses **Redux** and **Redux-Thunk**)

## Setting Up the App

### The Components

I've set up the `App` component to render two components: a `FetchButton` component, that the user will click in order to fetch the new Chuck Norris "fact" and the `Joke` component, which will display the fact if it is successfully fetched.  The `Joke` component is purely presentational and receives the joke passed down in props from our `App` component.  However, the `FetchButton` component has access to our **Redux** store and will invoke our **Redux-Thunk** action creator `fetchJoke`, when the button is clicked.  

from `./src/App.js`
```
import { connect } from 'react-redux'
import FetchButton from './FetchButton'
import Joke from './Joke'

class App extends React.Component {
  render() {
    return (
      <div className="App">
        <h1>Get a new Chuck Norris Joke</h1>
        {!this.props.tooMany
          ?  <><FetchButton/><Joke joke={this.props.joke}/></>
          :  <h3>That's Too Many Chuck Norris Jokes.  Please refresh!</h3>
        }
      </div>
    )
  }
}

const mapStateToProps = state => ({tooMany: state.tooMany, joke: state.joke})

export default connect(mapStateToProps)(App)`
```

### The Reducers

I set up our root reducer to manage 3 distinct pieces of state: `joke` (the joke fetched from the API), `jokeCount` (the number of jokes that have been fetched from the API since the program launched, which cannot exceed 5), and `tooMany` (initially set to `false`, but set to `true` once the user attempts to fetch more jokes than allowed).

from `./src/reducers/joke.js`
```
const joke = (state=null, action={}) => {
    switch (action.type) {
        case ('SET_JOKE'):
            return action.payload
        default:
            return state
    }
}

export default joke
```

from `./src/reducers/jokeCount.js`
```
const jokeCount = (state=0, action={}) => {
    switch (action.type) {
        case ('INC_JOKE_COUNT'):
            return state+1
        default:
            return state
    }
}

export default jokeCount
```

from `./src/reducers/tooMany.js`
```
const tooMany = (state=false, action={}) => {
    switch (action.type) {
        case ('TOO_MANY'):
            return true
        default:
            return state
    }
}

export default tooMany
```

from `./src/reducers/index.js`
```
import { combineReducers } from 'redux'
import joke from './joke'
import jokeCount from './jokeCount'
import tooMany from './tooMany'


export default combineReducers({
    joke, jokeCount, tooMany
})
```


### Configuring and Connecting the Store to our App

You can refer to the [Redux-Thunk API docs](https://www.npmjs.com/package/redux-thunk) for additional details on configuring the **Redux-Thunk** middleware, but make sure to export your configured store so that it can be accessed for both testing and development/production purposes.  This is how I approached my `storeFactory` function.

from `./src/configureStore.js`
```
import { createStore, applyMiddleware } from 'redux'
import ReduxThunk from 'redux-thunk'
import rootReducer from './reducers'

const storeFactory = (initialState) => {
    const middleware = [ReduxThunk]
    const createStoreWithMiddleware = applyMiddleware(...middleware)(createStore)
    return createStoreWithMiddleware(rootReducer, initialState)
}

export default storeFactory
```

You'll need to pass your store to your `App` component and also import the `storeFactory` function into your `test.js` file, where you will use it to create a mock store for your tests.

in `./src/index.js` (creating a store for the app)
```
import store from './configureStore'

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store()}><App /></Provider>
  </React.StrictMode>,
  document.getElementById('root')
)
```


## Setting Up the Tests

At the heart of our app's functionality, is a single asynchronous action creator called `fetchJoke`, which returns a function into which the store's dispatch function is passed.  This function will be responsible for dispatching other actions to our reducer.  It's *very important* for us to think through the logic of how these actions will be dispatched, as certain actions may be synchronous and others asynchronous, which will affect how we must structure our tests.

Let's jump now to setting up those tests.  For the purpose of this article, we're mostly concerned with setting up tests for our `fetchJoke` action creator.  This is technically an integration test, since it will be utilizing our reducers as well, but I decided to place it in our `./src/actions` directory and name it accordingly since its primary purpose is to test the action creator, the main logical component of our app.

Here are our test descriptions:

from `./src/actions/index.test.js`
```
describe('fetchJoke action creator', () => {
    
    test('fetches a joke on the first attempt', () => {
     
    })
    test('fetches a joke when the limit has almost been reached', () => {
   
    })
    test('fetches a joke when the limit will be exceeded', () => {

    })
    test('fetches a joke when the limit has already been exceeded', () => {

    })
  })
```

Before we can code out the test blocks, we need to do some preliminary setup in our `./src/actions/index.test.js` file:


### Step 1 - Create a Test Store

Since we have already created a storeFactory function, we can just import that and use it to create a mock store for our tests.

in `.src/actions/index.test.js` (creating a mock store for our tests)

`import createTestStore from '../configureStore'`


### Step 2 - Mocking the API Call

While our actual app relies upon fetching values from the ChuckNorris.io API, we want to test our app in isolation.  So, we'll need to sub in a mock fetch in place of the real fetch in the action creator.  We can do this purely in the test file without making any changes to our actual action creator code (ie) the app never needs to know that it's not getting a real API response).  We can do this with a useful tool call **fetch-mock** (that we've already installed as a dependency).  You can configure it like this:

in `./src/actions/index.test.js`
```
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
...
```

### Step 3 - Writing out the Test Blocks

To test each of our four conditions, we start by creating our test store and initializing it with a state to support the conditions that we're aiming to test.  Here, you can see the appropriate initial state for each of our conditions:
from `./src/actions/index.test.js`
```
test('fetches a joke on the first attempt', () => {
      
      const store = createTestStore()
  
    })
    test('fetches a joke when the limit has almost been reached', () => {

      const store = createTestStore({jokeCount:4, joke:""})

    })
    test('fetches a joke when the limit will be exceeded', () => {
    
      const store = createTestStore({jokeCount:5, joke:""})
  
    })
    test('fetches a joke when the limit has already been exceeded', () => {
    
      const store = createTestStore({tooMany:true, joke:""})
  
    })
```

We can also write out our expectations for each of the four test cases:

from `./src/actions/index.test.js`
```
test('fetches a joke on the first attempt', () => {
      
      const store = createTestStore()
      expect(newState.joke).toBe('Not a real Chuck Norris joke.')
    })
    test('fetches a joke when the limit has almost been reached', () => {

      const store = createTestStore({jokeCount:4, joke:""})
      expect(newState.joke).toBe('Not a real Chuck Norris joke.')
    })
    test('fetches a joke when the limit will be exceeded', () => {
    
      const store = createTestStore({jokeCount:5, joke:""})
      expect(newState.joke).toBe('cutting you off');
    })
    test('fetches a joke when the limit has already been exceeded', () => {
    
      const store = createTestStore({tooMany:true, joke:""})
      expect(newState.joke).toBe('no more jokes')
    })
```

There are two things to note here:  

Firstly, these tests are not yet ready since we haven't actually dispatched our action creator.  Unless the tests are expecting the state to be unchanged (ie) our store's initial state), these tests will fail.  

Secondly, note how specific the expectation statements are for each case.  There are specific strings that will need to be returned in our reducer in order to get these tests to pass.  I wanted to make doubly sure that the logic in our action creator is behaving as expected, so I'm asking for a different joke state depending on whether the limit is being reached on this call or had already been reached on a previous call (ie) whether the `tooMany` piece of state had already been toggled from `false` to `true`).  This is fussy, but I thought it was important for ensuring that we cover all our cases and our action creator is acting predictably for each condition.  

Before our tests are finished, we need to determine what is happening between our store initialization and our expectation.  It's *very important* for us to have a clear sense of how our async action creator will be working, because this will affect where we place our `expect` statement.  In the case of our `fetchJoke` action creator, different conditions will cause our actions to be synchronous or asynchronous.  

Why *is* this exactly?  

We want our action creator to first check the `tooMany` piece of state *before* making a fetch request to the API.  It will first determine if the user has already reached the request limit.  We'll also want to check a case where the `jokeCount` piece of state is at the limit, but the `tooMany` piece of state has not yet been toggled to `true`.  In each of these cases, we want our app to NOT send a fetch request to the API, and instead dispatch a simple action object synchronously.  However, In the event that the `jokeCount` IS under the limit set by our app, we will make the asynchronous fetch request to the server (via the fetch API), and dispatch the simple `'SET_JOKE'` action object only *after* receiving a response from the server.

For our synchronous cases, we can simply setup our dispatch and expectation statements normally:

from `./src/actions/index.test.js`

```
test('fetches a joke when the limit will be exceeded', () => {
    
      const store = createTestStore({jokeCount:5, joke:""})
  
      store.dispatch(fetchJoke())
      const newState = store.getState();
      expect(newState.joke).toBe('cutting you off')
    })
    test('fetches a joke when the limit has already been exceeded', () => {
    
      const store = createTestStore({tooMany:true, joke:""})
  
      store.dispatch(fetchJoke())
      const newState = store.getState();
      expect(newState.joke).toBe('no more jokes')
    })
```

However, for our asynchronous cases, we must set up our test so that our dispatch returns a Promise.  We can place our `expect` statement inside a function that we pass the chained `.then()` function.  The `expect` statement will run once the Promise has resolved.

from `./src/actions/index.test.js`
```
test('fetches a joke on the first attempt', () => {
      
      const store = createTestStore();
  
      return store.dispatch(fetchJoke())
        .then(() => {
          const newState = store.getState();
          expect(newState.joke).toBe('Not a real Chuck Norris joke.')
        })
    })
```

**IMPORTANT**:  In order for this to actually work, we *must* make sure that we actually set up our action creator to return a promise. Otherwise, we'll run into errors. Check out the action creator code below for reference.

If we make a mistake and set up the synchronous test block to run asynchronously, we'll run into the above error, where a Promise is *not* returned from our action creator, and there is no `.then` function to invoke.  If we do the opposite and set up our asynchronous test block to run synchronously, it will simply jump to our `expect` statement before the asynchronous code has a chance to run and the test will (most likely) fail.

### Step 4 - Coding Out the Action Creator

After defining the `fetchJoke` function, you can verify that all tests are currently failing.  It's *important* for us to verify that the tests are failing as expected so that we don't wind up with faulty tests that can lead to us assuming our code is working properly when it isn't!

from `./src/actions/index.js`
```
export const fetchJoke = () => { 
    
}
```

Here's the fully coded `fetchJoke` function for reference:

from `./src/actions/index.js`
```
export const fetchJoke = () => { 
    const max = 5 // Total number of jokes allowed per session
    const url = 'https://api.chucknorris.io/jokes/random'
    return (dispatch, getState) => {
        if (!getState().tooMany) {
            if (getState().jokeCount >= max) {
                // Runs synchronously
                dispatch({type: 'TOO_MANY'})
                dispatch({type: 'SET_JOKE', payload: 'cutting you off'})
            }
            // Runs asynchronously
            // NOTE THAT A PROMISE IS BEING RETURNED HERE!
            else return fetch(url)
            .then( res => res.json())
            .then( res => {
                dispatch({type: 'INC_JOKE_COUNT'})
                dispatch({type: 'SET_JOKE', payload: res.value})
            })
        }
        else {
            // Runs synchronously
            dispatch({type: 'SET_JOKE', payload: "no more jokes"})
        }
    }
}

```


As I mentioned in the prior section, *please* note when a Promise is being returned from inside the function.  Neglecting this inadvertently can lead to a world of pain, hence the ALL CAPS!

### Final Step - Pass those tests

Time to type `npm test` and look at all that glorious green!

![Tests Passing](https://dev-to-uploads.s3.amazonaws.com/i/yb6pra9xvzxndys2sfrn.png)

## Additional Resources:

There's a lot more to testing **React** and **Redux**, and I enthusiastically recommend checking out [Bonnie Schulkin's thorough Udemy course on the topic](https://www.udemy.com/share/101XEwAEAdcllbRXUC/):

To build your own Chuck Norris adjacent application, check out:
[ChuckNorris.io](https://api.chucknorris.io/)

API Docs for:
[React](https://reactjs.org/docs/getting-started.html)
[Redux](https://redux.js.org/api/api-reference)
[Redux-Thunk](https://www.npmjs.com/package/redux-thunk)
[Jest](https://jestjs.io/docs/en/getting-started)
[fetch-mock](http://www.wheresrhys.co.uk/fetch-mock/)


Finally, I realize this is a pretty dense read, so remember...
![If at first you don't succeed...You're not Chuck Norris](https://dev-to-uploads.s3.amazonaws.com/i/jr5p257vk67zztby43a6.jpeg)

