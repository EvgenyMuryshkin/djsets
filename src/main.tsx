import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// why tf to do this, should be some standard component or something
function buyMeACoffeCheck() {
  const bmc = document.getElementsByClassName("bmc-btn-container")[0];
  if (bmc) {
    const bmcContainer = document.getElementById("buy-me-a-coffe-container");
    bmc.remove();
    bmcContainer?.appendChild(bmc)
    return;
  }

  window.setTimeout(buyMeACoffeCheck, 100);
}

window.setTimeout(buyMeACoffeCheck, 100);