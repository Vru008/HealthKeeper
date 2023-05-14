import React, { useState } from "react";
import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import "./form.css";

const Form = () => {
  const [data, setData] = useState();
  const [val, setVal] = useState();

  const handleSubmit = () => {
    console.log("console_post", val);
    try {
      axios.post("http://localhost:3004/app", val).then((result) => {
        console.log(result);
        // setData(result.data);
      });
    } catch (err) {
      console.log("console_err", err);
    }
  };

  const handleChange = (e) => {
    console.log("code snap", e.target.value);
    setVal({ ...val, [e.target.name]: e.target.value });
  };
  return (
    <div>
      <div className="bgg">
        <div className="container cnt">
          {console.log("console_change", val)}
          <div className="row">
            <form action="">
              <fieldset>
                <br />
                <div className="column clm">
                  <h2>HealthKeeper</h2>
                </div>
                <br />
                <div className="column clm inputbox">
                  <select
                    name="department"
                    value={val?.department}
                    onfocus="this.size=4;"
                    onblur="this.size=0;"
                    onchange="this.size=1; this.blur(); {(e)=>handleChange(e)}"
                    id="department"
                    className="_box"
                  >
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
                    value={val?.doctor}
                    onChange={(e) => handleChange(e)}
                    className="_box">
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
                  <div class="form-check-inline">
                    <label class="form-check-label" for="radio1">
                      <input
                        type="radio"
                        class="form-check-input"
                        id="radio1"
                        name="optradio"
                        value="Male"
                        checked
                      />
                      Male
                    </label>
                  </div>
                  <div class="form-check-inline">
                    <label class="form-check-label" for="radio2">
                      <input
                        type="radio"
                        class="form-check-input"
                        id="radio2"
                        name="optradio"
                        value="Female"
                      />
                      Female
                    </label>
                  </div>
                  <div className="Date">
                    <input type="datetime-local" id="date" name="date" />
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
                    required
                  />
                </div>
                <br />
                <div className="column clm inputbox">
                  <input
                    type="text"
                    id="phone_no"
                    className="_box text-input"
                    name="phone no"
                    placeholder="Enter Your Contact No."
                    required
                  />
                </div>
                <br />
                <div className=" inputbox">
                  <button className="_box">MAKE AN APPOINTMENT</button>
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