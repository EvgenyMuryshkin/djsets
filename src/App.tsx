import { Suspense } from 'react'
import './App.css'
import { StorageService } from './Storage'
import { DJSets } from './DJSets'
import { GithubForkBanner } from 'react-github-fork-banner';

function App() {
  return (
    <>
      <div>
        <GithubForkBanner customHref="https://github.com/EvgenyMuryshkin/djsets"/>
        <Suspense>
          <DJSets dataSourcePromise={StorageService.Load()}/>
        </Suspense>
        <div id="buy-me-a-coffe-container" className='buy-me-a-coffe-container'></div>
      </div>
    </>
  )
}

export default App
