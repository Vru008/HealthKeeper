import React from 'react'

const Home = () => {
  return (

  <div className="container-fluid">
    <div className="row header">
        <div className="col-md-3">
          <img src ="/image/logo.jpg" alt="about"/>
        </div>
        <div className="col-md-9 navbar text-decoration-none " >
         <strong><a href="#home" className="text-decoration-none">Home</a></strong>
         <strong><a href="#about us" className="text-decoration-none">About us</a></strong>
         <strong><a href="#Hospital" className="text-decoration-none">Hospital</a></strong>
         <strong><a href="#Doctor" className="text-decoration-none">Doctor</a></strong>
         <strong><a href="#Department" className="text-decoration-none">Department</a></strong>
         <strong><a href="#Contactus" className="text-decoration-none">Contact us</a></strong>
        </div>
    </div>    
    <div className="row">
      <div className="column bg">
        <img src="/image/doctorbg.jpg" alt="sorry"/>
          <div className="row">
            <div className="column centered">
              Making HealthCare<br/>Better Together
            </div>
          </div>
           <div className="row">
             <div className="column click"></div>
             <button type="button" className="btn btn-light btn-lg1">call us</button>
             <button type="button" className="btn btn-light btn-lg2">book an Appoinment</button>
            </div>
      </div>
    </div>
    <div className="row">
      <div className="column find">
        <strong>Find suitable doctors and hospital</strong> 
      </div>
    </div>
    <br/>
    <div className="row">
      <div className="col-6 select">
        <select name="state" className="state">
          <option value="Gujrat">Gujarat</option>
          <option value="Mumbai">Mumbai</option>
          <option value="delhi"> Delhi</option>
          <option value="rajasthan">Rajasthan</option>
          <option value="Up">Up</option>
          <option value="Kerala">Kerala</option>
        </select>
      </div>
      <div className="col-6 select">
        <select name="disease" className="disease">
          <option value="Gujrat">Cancer</option>
          <option value="Mumbai">Heart</option>
          <option value="delhi"> Kidney</option>
          <option value="rajasthan">ENT</option>
          <option value="Up">Orthopedic</option>
          <option value="Kerala">IVF</option>
        </select>
      </div>
    </div>
     <br/>
    <div className="row">
      <div className="column box d-flex mb-3">
        <div className="boxes p-2 m-2 flex-fill">Primary Care
        </div>
        <div className="boxes p-2 m-2  flex-fill">Emergrncy cases
        </div>
        <div className="boxes p-2 m-2  flex-fill">Online Appoinment
        </div>
      </div>
    </div>
  <div className="row gb">
      <div className="col-md-12">
       <div className="special"><h1>Our Specialist</h1>
       </div>
      </div>
    <div className="col-md-6 dr">
       <img src="/image/ad6906c1-2863-4e45-92bc-633de4eea42f.jpg"/>
        <h3>Dr.Aashish Sabharwal</h3>
        <strong><p>Urologist,Robotic surgeon<br/>MBBS,M.S,General surgery,DNB<br/>New Delhi</p></strong>
    </div>
    <div className="col-md-6">
       <img src="/image/eb2b4fde-cef3-44f0-ab60-a7ade286efb1.jpg"/>
        <h3>Dr.Sanjay Sachdeva</h3>
        <strong><p>Director-ENT<br/>MBBS,DCH,MS<br/>New Delhi,India</p></strong>
    </div>
  </div> 
      <div className="row">
        <div className="col-md-4">
          <h1>Why<br/>we?</h1>
        </div>
          <div className="col-md-8">
           <h4>Healthkeeper ensures that the patient's experience right from the discovery of the right doctor,
             to booking an appointment at the clinic, getting a detailed diagnosis done, booking tests at a diagnostic center, 
             getting insurance paperwork done, commuting from home to the hospital & back on the day of the surgery, 
             admission-discharge processes at the hospital, and follow-up consultation after the surgery is hassle-free and care-filled
           </h4>
          </div>
      </div>

<footer className="text-center text-lg-start bg-light text-muted">
  <section className="d-flex justify-content-center justify-content-lg-between p-4 border-bottom">
  
    <div className="me-5 d-none d-lg-block">
      <span><strong> connected with us on social networks:</strong></span>
    </div>
    <div>
 <a href="#" className="fa faaa fa-facebook"></a>
<a href="#" className="fa faaa fa-twitter"></a>
<a href="#" className="fa faaa fa-google"></a>
<a href="#" className="fa faaa fa-youtube"></a>
<a href="#" className="fa faaa fa-instagram"></a>
    </div>
  </section>
  <section className="">
    <div className="container text-center text-md-start mt-5">
      <div className="row mt-3">
        <div className="col-md-3 col-lg-4 col-xl-3 mx-auto mb-4">
          <h6 className="text-uppercase fw-bold mb-4">
          <strong><i className="fas fa-gem me-3"></i>Healthkeeper</strong>
            </h6>
            <img src ="/image/logo.jpg" alt="about"/>
        </div>

        <div className="col-md-2 col-lg-2 col-xl-2 mx-auto mb-4">
          <h6 className="text-uppercase fw-bold mb-4">
          <strong>Services</strong>
          </h6>
          <p>
            <a href="#!" className="text-reset">Primary Care</a>
          </p>
          <p>
            <a href="#!" className="text-reset">Emergrncy cases</a>
         </p>
          <p>
            <a href="#!" className="text-reset">Online Appoinment</a>
          </p>
        </div>
        <div className="col-md-3 col-lg-2 col-xl-2 mx-auto mb-4">
          <h6 className="text-uppercase fw-bold mb-4">
          <strong>link</strong>
          </h6>
          <p>
            <a href="#!" className="text-reset">Home</a>
          </p>
          <p>
            <a href="#!" className="text-reset">About us</a>
          </p>
          <p>
            <a href="#!" className="text-reset">Department</a>
          </p>
          <p>
            <a href="#!" className="text-reset">Doctor</a>
          </p>
          <p>
            <a href="#!" className="text-reset">Hospital</a>
          </p>
        </div>
        

        <div className="col-md-4 col-lg-3 col-xl-3 mx-auto mb-md-0 mb-4">
       
          {/* <h6 className="text-uppercase fw-bold mb-4"><strong>Contact</strong></h6> */}
          <p className="faa"><i className="fa fa-home me-3"></i> Ahmedabad, 382418, India</p>
          <p className="faa">
            <i className="fa fa-envelope me-3"></i>
            healthkeeper@gmail.com
          </p>
          <p className="faa"><i className="fa fa-phone me-3"></i> + 01 234 567 88</p>
        </div>
       
      </div>
    
    </div>
  </section>


  
  <div className="text-center p-4">
    © 2021 Copyright:
    <a className="text-reset fw-bold" href="Healthkeeper.com">Healthkeeper.com</a>
  </div>
 
   </footer>

</div>
)
}

export default Home;
