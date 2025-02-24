import { useState } from "react";
import "./YouTubeAPIKeyInstructions.scss"

export function YouTubeAPIKeyInstructions() {
    const [show, setShow] = useState(false);

    return (
        <div>
            <div>
                <a className="instructions-link" onClick={() => setShow(!show)}>How to create API Key?</a>
            </div>
            {
                show && (
                    <div>
                        <ul>
                            <li>Open <a href="https://console.cloud.google.com/apis/credentials" target="_new">Google Console =&gt; API Credentials</a></li>
                            <li>Setup project if you don't have one</li>
                            <li>Create Credential &gt; API Key</li>
                            <li>Optional: restrict API Key to this website URL</li>
                            <li>Optional: restrict API Key to YouTube Data API v3</li>
                        </ul>
                    </div>
                )
            }
        </div>
    )
}
