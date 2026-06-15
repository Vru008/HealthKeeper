import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./form.css";
import { API_BASE } from "../../config";

const Form = () => {
  const [val, setVal] = useState();

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.post(`${API_BASE}/app`, val).catch(() => {
      // network errors are ignored for this demo form
    });
  };

  const handleChange = (e) => {
    setVal({ ...val, [e.target.name]: e.target.value });
  };
  return (
    <div>
      <div className="bgg">
        <div className="container cnt">
          <div className="row">
            <form onSubmit={handleSubmit}>
              <fieldset>
                <br />
                <div className="column clm">
                  <h2>HealthKeeper</h2>
                </div>
                <br />
                <div className="column clm inputbox">
                  <select
                    name="department"
                    value={val?.department || ""}
                    onChange={(e) => handleChange(e)}
                    id="department"
                    className="_box"
                  >
                    <option value="">Select City</option>
                    <option value="Ahmedabad">Ahmedabad</option>
                    <option value="Gandhinagar">Gandhinagar</option>
                    <option value="Surat"> Surat</option>
                    <option value="Rajkot">Rajkot</option>
                    <option value="Vadodra">Vadodra</option>
                    <option value="Mehsana">Mehsana</option>
                  </select>
                </div>
                <br />
                <div className="column clm inputbox">
                  <select
                    name="doctor"
                    value={val?.doctor || ""}
                    onChange={(e) => handleChange(e)}
                    className="_box">
                    <option value="">Select Department</option>
                    <option value="Cancer">Cancer</option>
            <option value="Heart">Heart</option>
            <option value="Kidney"> Kidney</option>
            <option value="ENT">ENT</option>
            <option value="Orthopedic">Orthopedic</option>
            <option value="IVF">IVF</option>
                  </select>
                </div>
                <br />
                <div className="column clm radio_group">
                  <div className="form-check-inline">
                    <label className="form-check-label" htmlFor="radio1">
                      <input
                        type="radio"
                        className="form-check-input"
                        id="radio1"
                        name="optradio"
                        value="Male"
                        defaultChecked
                        onChange={(e) => handleChange(e)}
                      />
                      Male
                    </label>
                  </div>
                  <div className="form-check-inline">
                    <label className="form-check-label" htmlFor="radio2">
                      <input
                        type="radio"
                        className="form-check-input"
                        id="radio2"
                        name="optradio"
                        value="Female"
                        onChange={(e) => handleChange(e)}
                      />
                      Female
                    </label>
                  </div>
                  <div className="Date">
                    <input
                      type="datetime-local"
                      id="date"
                      name="date"
                      onChange={(e) => handleChange(e)}
                    />
                  </div>
                </div>

                <br />
                <div className="column clm inputbox">
                  <input
                    type="text"
                    id="name"
                    autoComplete="off"
                    className="_box text-input"
                    name="name"
                    placeholder="Enter Your Name"
                    onChange={(e) => handleChange(e)}
                    required
                  />
                </div>
                <br />
                <div className="column clm inputbox">
                  <input
                    type="text"
                    id="phone_no"
                    className="_box text-input"
                    name="phone_no"
                    placeholder="Enter Your Contact No."
                    onChange={(e) => handleChange(e)}
                    required
                  />
                </div>
                <br />
                <div className=" inputbox">
                  <button type="submit" className="_box">
                    MAKE AN APPOINTMENT
                  </button>
                </div>
                <br />
              </fieldset>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Form;