import React, { useState, useEffect } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";

const ConList = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [hospitalData, setHospitalData] = useState([]);
  const [docData, setDocData] = useState([]);
  const [listData, setlistData] = useState([]);
  console.log("console_check_dataaa_00", location);

  const IMG = (imageName) => {
    return require(`../../Assets/hospital_img/${imageName}`);
  };
  const DIMG = (imageName) => {
    return require(`../../Assets/doctor_img/${imageName}`);
  };
  const getHospitalData = () => {
    axios.get("http://localhost:3004/hospitals").then((result) => {
      console.log("location", location.state)
      let hospitalArr
      if(location.state.loc) {
        hospitalArr = result.data.filter(
          (item, index) => 
            item.location === location.state.loc &&
            item.speciality === location.state.speciality
        );
      } else {
        hospitalArr = result.data.filter(
            (item, index) => 
            item.speciality === location.state.speciality
          );
      }
       
      console.log("console_1",result.data, hospitalArr);
      // const departmentArr = result.data.filter(
      //   (item, index) => 
      //   // console.log("console_22",item.speciality, location.state.name)
      //   item.speciality === location.state.name
      // );
      // console.log("console_3",departmentArr);
      console.log("console_4", hospitalArr);
      setHospitalData(hospitalArr);
      // setHospitalData(departmentArr);
    });
  };
  const getDoctorData = () => {
    axios.get("http://localhost:3004/doctors").then((result) => {
      const docArr = result.data.filter(
        (item, index) =>
          item.location === location.state.loc &&
          item.speciality === location.state.speciality
      );
      setDocData(docArr);
    });
  };

  const handleBook = (data) => {
    console.log("console_check_dataaa", data);
    navigate("/form", {
      state: {
        loc: data?.location,
        speciality: data?.speciality,
        name: data?.name,
      },
    });
  };

  useEffect(() => {
    getHospitalData();
    getDoctorData();
  }, [location]);

  console.log("console_data", location);
  return (
    <>
      <section className="border-bottom mt-1">
        <div className="row container-fluid mt-2 mb-1">
          <div className="col-8 banner mx-auto">
            <h2 className="mt-1">
              {hospitalData[0]?.location}'s top specialist & hospitals of&nbsp;
              {hospitalData[0]?.speciality}
            </h2>
            <p className="mt-2">
              Doctors are medical professionals who are trained to diagnose and
              treat illnesses and injuries in patients. They are also
              responsible for providing preventative care and promoting overall
              health and wellness. Doctors have a wide range of specialties,
              including general practitioners, pediatricians, surgeons,
              psychiatrists, and many more. Each specialty requires specific
              training and expertise to properly diagnose and treat patients.
              When you visit a doctor, you can expect to receive a thorough
              examination and a detailed diagnosis of your symptoms. Depending
              on the diagnosis, your doctor may prescribe medication, suggest
              lifestyle changes, or recommend further testing or specialist
              care..
            </p>
          </div>
          <div className="col-3 mx-auto banner">
            <form className="form1">
              <h3 className="mt-1 callbackh3">Assistence, Over Call</h3>
              <div className="form-group mt-1">
                <label for="exampleInputPassword1" className="mt-1">
                  Full Name
                </label>
                <input
                  type="text"
                  className="form-control"
                  id="exampleInputPassword1"
                  placeholder="Full Name"
                />
              </div>
              <div className="form-group mt-1">
                <label for="exampleInputEmail1" className="mt-1">
                  Email address
                </label>
                <input
                  type="email"
                  className="form-control"
                  id="exampleInputEmail1"
                  placeholder="Email"
                />
              </div>
              <div>
                <label for="message" className="mt-1">
                  Mobile No.
                </label>
                <input
                  className="form-control"
                  type="tel"
                  placeholder="Mobile Number"
                />
              </div>
              <button type="submit" className="btn btn-primary mt-2 mb-2 btn1">
                Submit
              </button>
            </form>
          </div>
        </div>
      </section>

      <section className="container-fluid">
        {/* <div className="row row-cols-1 row-cols-md-5 g-4 mt-3"> */}
        <div className="row">
          <h1 className="list_hadding mb-5 mt-5">
          {location.state.loc !=="" ? `Hospital in ${hospitalData[0]?.location}` : `Hospital of ${hospitalData[0]?.speciality}`}
          </h1>
          {console.log("console_5",hospitalData )}
          {hospitalData?.map((item, index) => {
            return (
              <>
                <div className="col-3 mb-3 ">
                  <div className="card-deck ">
                    <div className="card card_list ">
                      <div className="view overlay">
                        <img
                          className="card-img-top  "
                          src={IMG(item.img)}
                          alt="Card image cap"
                          height={"250px"}
                          width={"350px"}
                        />
                        <a href="#!">
                          <div className="mask rgba-white-slight"></div>
                        </a>
                      </div>

                      <div className="card-body">
                        <h5 className="card-title">{item.name}</h5>
                        <a href={item.url}>
                          <i class="fa fa-map-marker" aria-hidden="true"></i>
                          &nbsp; view in map
                        </a>
                      </div>

                      <div className="card-footer">
                        {/* <a
                          className="btn card_read_btn"
                          data-bs-toggle="modal"
                          data-bs-target={`#hospital-${index}`}
                          data-mdb-ripple-color="dark"
                        >
                          Show details
                        </a> */}
                        <button
                          type="submit"
                          className="btn  mt-1 mb-1  card_read_btn"
                          data-bs-toggle="modal"
                          data-bs-target={`#hospital-${index}`}
                        >
                          Quick Book
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                {/* <!-- Zydus modal --> */}
                <div
                  className="modal fade"
                  id={`hospital-${index}`}
                  tabindex="-1"
                >
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h1 className="modal-title fs-5">{item.name}</h1>
                        <button
                          type="button"
                          className="btn-close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        ></button>
                      </div>
                      <div className="modal-body">
                        Lorem ipsum dolor sit amet consectetur adipisicing elit.
                        At cupiditate numquam accusamus impedit soluta
                        praesentium magnam veniam, unde explicabo ipsa sit nisi
                        dolore labore eveniet ex, nobis ullam id illum.
                      </div>
                      <div className="modal-footer">
                        {/* <button type="button" className="btn btn-primary">
                          c Enquire Now
                        </button> */}
                        <div className="list_btn text-center">
                          <button
                            to="/Form"
                            type="button"
                            className="btn modal_btn "
                            data-bs-dismiss="modal"
                            onClick={() => handleBook(item)}
                          >Book an Appoinment
                            {/* <Link to="/Form">Book an Appoinment</Link> */}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          })}
        </div>

        <h1 className="list_hadding mb-5 mt-5">
          Doctors in {hospitalData[0]?.location}{" "}
        </h1>
        <div className="row row-cols-1 row-cols-md-5 g-4 mt-3 ">
          {docData?.map((item, index) => {
            return (
              <>
                <div className="col">
                  <div className="card doc_img_card">
                    <img
                      src={DIMG(item.img)}
                      className="card-img-top "
                      alt="zydus"
                    />
                    <div className="card-body">
                      <h5 className="card-title">{item.name}</h5>
                      <p className="card-text">{item.location}</p>
                    </div>
                    <div className="card-footer">
                      <button
                        type="submit"
                        className="btn card_read_btn "
                        data-bs-toggle="modal"
                        data-bs-target={`#doctor-${index}`}
                      >
                        Show Details
                      </button>
                    </div>
                  </div>
                </div>

                {/* <!-- Zydus modal --> */}
                <div
                  className="modal fade"
                  id={`doctor-${index}`}
                  tabindex="-1"
                >
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h1 className="modal-title fs-5">{item.name}</h1>
                        <button
                          type="button"
                          className="btn-close"
                          data-bs-dismiss="modal"
                          // aria-label="Close"
                        ></button>
                      </div>
                      <div className="modal-body">{item.description}</div>
                      <div className="modal-footer">
                        <button
                          type="button"
                          className="btn btn-primary"
                          data-bs-dismiss="modal"
                        >
                          <Link to={"/listform"}>Book Appointment</Link>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            );
          })}
        </div>
      </section>
    </>
  );
};
export default ConList;