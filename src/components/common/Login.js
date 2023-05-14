import React from 'react'
import './Login.css';

const Login = () => {
  return (
    <div>
      <div class="background">
  <div class="container">
    <div class="screen">
      <div class="screen-header">
        <div class="screen-header-left">
          <div class="screen-header-button close"></div>
          <div class="screen-header-button maximize"></div>
          <div class="screen-header-button minimize"></div>
        </div>
        <div class="screen-header-right">
          <div class="screen-header-ellipsis"></div>
          <div class="screen-header-ellipsis"></div>
          <div class="screen-header-ellipsis"></div>
        </div>
      </div>
      <div class="screen-body">
        <div class="screen-body-item left">
          <div class="app-title">
            <span>HealthKeeper</span>
          </div>
          <div class="app-contact">CONTACT INFO : 00 000 00 000</div>
        </div>
        <div class="screen-body-item">
          <div class="app-form">
            <div class="app-form-group">
              <input class="app-form-control" placeholder="NAME" value="" />
            </div>
            <div class="app-form-group">
              <input class="app-form-control" placeholder="Password" />
            </div>
            {/* <div class="app-form-group message">
              <input class="app-form-control" placeholder="MESSAGE" />
            </div> */}
            <div class="app-form-group buttons">
              <button class="app-form-button">Cancel</button>
              <button class="app-form-button">Login</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
  </div>
</div>

    </div>
  )
}

export default Login
