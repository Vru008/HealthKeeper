import React from 'react'
import '../AboutUs/aboutUs.css'
const aboutUs = () => {
  return (

    <div className="container-fluid">
        <div className="row">
            <div className="bg col-7 col-md-12">
                <img src="./photos/bg.webp" alt=""/>
            </div>
            <div className="content col-5 col-md-12">
                <br/><br/>
                <p><strong>Happiness begins <br/>
                    with good health</strong></p>
            </div>
        </div>
        <div className="row">
            <div className="col-4 p-2">
                <p className="head"><strong>Mission :</strong></p>
                <p className="par">To fix the broken patient journey by offering full-stack healthcare services and increasing patient centricity.</p>
            </div>
            <div className="col-4 p-2">
                <p className="head"><strong>Vision :</strong></p>
                <p className="par">To ensure consistent quality and advanced surgical care and take the latest medical technologies to Tier 2 and Tier 3 cities.</p>
            </div>
            <div className="col-4 p-2">
                <p className="head"><strong>Value :</strong></p>
                <p className="par">To collaborate as a team and take extreme ownership of our audacious goals to achieve targets and display tremendous Integrity.</p>
            </div>
        </div>
    </div>

  )
}

export default aboutUs
