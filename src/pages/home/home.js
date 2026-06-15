import React,{ useState} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "./home.css";
import SpecialityList from "../../components/SpecialityList";
import LocationList from "../../components/LocationList";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

const Home = (props) => {

  const navigate = useNavigate();
  const [searchData, setSearchData] = useState({
    location: "Ahmedabad",
    speciality: "Oncology",
  });

  const handleChange = (e) => {
    setSearchData((prev) => {
      return { ...prev, [e.target.name]: e.target.value };
    });
  };
  const handleSearch = () => {
    navigate("/list", {
      state: {
        loc: searchData?.location,
        speciality: searchData?.speciality,
      },
    });
  };
 

  return (
    <div className="container-fluid">
      <div>
      <div className="row">
        <div className="pic" id="top">
          <img src="/Home img/dbg6.jpg" alt="Healthcare banner" />
          <div className="column centered">
            We are here
            <br />
            for your health
          </div>
          <div className="column click">
            <button type="button" className="btn btn-light btn-lg1">
              <Link to="/form">Book an Appoinment</Link>
            </button>
          </div>
        </div>
      </div>
      <div className="row">
        <div className="column find">
          <strong>Find suitable doctors and hospital</strong>
        </div>
      </div>
      <br />
      <div className="row city_disease">
        <div className=" col-4  select">
          <SpecialityList handleChange={handleChange} />
        </div>

        <div className="col-4 select">
          <button
            type="button"
            className="search-btn"
            onClick={handleSearch}
          >
            <img src="/Home img/dbg5.png" alt="Search doctors and hospitals" />
          </button>
        </div>
        <div className=" col-4 select">
          <LocationList handleChange={handleChange} />
        </div>
      </div>
      <br />
      <div className="row" id="service">
        <div className="column box d-flex mb-3">
          <div className="boxes p-2 m-2 flex-fill" id="primary_care">
            <strong>Primary Care</strong>
            <p>
              Primary care is a model of care that supports first-contact,
              accessible, continuous, comprehensive and coordinated
              person-focused care. It aims to optimize population health and
              reduce disparities across the population{" "}
            </p>
          </div>
          <div className="boxes p-2 m-2  flex-fill" id="primary_care">
            <strong>Emergrncy cases</strong>
            <p>
              Emergency care in healthcare refers to the treatment of patients
              with acute illnesses or injuries that require immediate medical
              attention. This type of care is typically provided in an emergency
              room or urgent care setting
            </p>
          </div>
          <div className="boxes p-2 m-2  flex-fill" id="primary_care">
            <strong>Online Appoinment</strong>
            <p>
              The individual or the patient can book an appointment any time
              from anywhere through an Online healthcare service provider.
              Online Appointment Booking systems are also known as Online
              booking application, online scheduler etc
            </p>
          </div>
        </div>

        {/* <Service /> */}
      </div>
      <div className="row gb">
        <div className="col-md-12">
          <div className="special">
            <h1>Meet Our Specialist</h1>
          </div>
        </div>
        <div className="col-md-4 dr">
          <img src="/dr img/dr-ashish-sabhrawal.jpg" alt=""/>
          <strong>
            {" "}
            <h3>Dr.Aashish Sabharwal</h3>
          </strong>
          <p>
            Urologist | Robotic surgeon
            <br />
            MBBS,M.S,General surgery,DNB
            <br />
            New Delhi
          </p>
        </div>
        <div className="col-md-4 dr">
          <img src="/dr img/Dr_S_K_S_Marya.jpg" alt="" />
          <strong>
            {" "}
            <h3>Dr.SKS Marya</h3>
          </strong>
          <p>
            Orthopaedic Surgeon | Chairman - Bone & Joint Institut
            <br />
            M.B.B.S., M.S., DNB, M.Ch, FICS
            <br />
            Gurgaon, India
          </p>
        </div>
        <div className="col-md-4 dr">
          <img src="/dr img/Dr Sanjay Sachdeva.jpeg"alt="" />
          <strong>
            {" "}
            <h3>Dr.Sanjay Sachdeva</h3>
          </strong>
          <p>
            Otolaryngologist | Director-ENT
            <br />
            MBBS,DCH,MS
            <br />
            New Delhi,India
          </p>
        </div>
      </div>
      <div className="row WHY">
        <div className="col-md-4">
          <h1>
            Why<br />we?
          </h1>
        </div>
        <div className="col-md-8">
          <h4>
            Healthkeeper ensures that the patient's experience right from the
            discovery of the right doctor, to booking an appointment at the
            clinic, getting a detailed diagnosis done, booking tests at a
            diagnostic center, getting insurance paperwork done, commuting from
            home to the hospital & back on the day of the surgery,
            admission-discharge processes at the hospital, and follow-up
            consultation after the surgery is hassle-free and care-filled
          </h4>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Home;