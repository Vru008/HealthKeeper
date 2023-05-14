import React from "react";
import "./contact.css";
const Contact = () => {
  return (
    <>
      <div className="container ct">
        <div className="cnt_card">
          <div className="left">
            <img src="/Contact img/dbg3.jpg" />
          </div>
          <div className="right">
            <h2>Get in touch</h2>
            <div className="contact">
              <div className="form-container">
                <form className="form">
                  <div className="username">
                    <input type="text" placeholder="Enter your Name" />
                  </div>
                  <div className="useremail">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      required
                    />
                  </div>
                  <div className="usermessage">
                    <textarea
                      placeholder="Enter your message"
                      required
                    ></textarea>
                  </div>
                  <div className="usersubmit">
                    <input type="submit" value="Submit" id="submit"/>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row info">
        <div className="col info">
          <h3>Contact Info</h3>
          <p>
            <strong>Contact :</strong> +91 00000 00000
          </p>
          <p>
            <strong>E-mail :</strong> abc@gmail.com{" "}
          </p>
          <p>
            <strong>Web :</strong> https//:www.abc.com{" "}
          </p>
        </div>
      </div>
    </>
  );
};

export default Contact;
