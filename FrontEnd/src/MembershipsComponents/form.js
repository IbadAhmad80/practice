import React, { useState } from "react";
import Styles from "./form.module.css";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import axios from "axios";
import StripeCheckout from "react-stripe-checkout";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPencilAlt, FaKey } from "react-icons/fa";
import { IoMdContact } from "react-icons/io";
import { MdEmail } from "react-icons/md";
import Features from "../CourseComponents/courseFeatures";

toast.configure();

export default function MemberShipForm({
  type,
  membership,
  payment,
  productsData,
  accountData,
  totalPrice,
}) {
  const [state, setState] = useState({ visible: false });
  const [formData, setData] = useState({ name: "", email: "" });

  const show = () => {
    setState({ visible: true });
  };

  const hide = () => {
    setState({ visible: false });
  };
  const initialValues = {
    membership: membership,
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "921111111111",
  };

  const [stripe, setStripe] = useState(true);

  const productPayment = (name, index) => {
    const data = {
      name: formData.name,
      email: formData.email,
      quantity: productsData.quantity[index],
      price: productsData.price[index],
    };
    axios
      .put("http://localhost:3000/products/productCustomers", {
        name,
        data,
      })
      .then((response) => {
        const { status } = response.data;

        if (status === "success") {
          console.log("product buyers has been updated");
        }
      })
      .catch((error) => {
        if (error.response) {
          toast(`${error.response.data} in product customers`, {
            type: "error",
          });
        }
      });
  };
  const handleStripe = (token, _) => {
    console.log(token);
    if (payment === "product") {
      productsData.products.map((productName, index) =>
        productPayment(productName, index)
      );
      axios
        .post("http://localhost:3000/products/productPayment", {
          token,
          totalPrice,
        })
        .then((response) => {
          const { status } = response.data;

          if (status === "success") {
            toast(`Success! Payment has been made`, {
              type: "info",
            });
            console.log("payment has been made");
          }
        })
        .catch((error) => {
          if (error.response) {
            toast(`${error.response.data} in stripe payment`, {
              type: "error",
            });
          } else
            toast(`failed to make payment due to error`, { type: "error" });
        });
    } else {
      axios
        .post("http://localhost:3000/members/payment", {
          membership,
          token,
        })
        .then((response) => {
          console.log("Response:", response.data);
          const { status } = response.data;

          if (status === "success") {
            toast("Success! Check email for details", { type: "info" });
          }
        })
        .catch((error) => {
          if (error.response) {
            toast(`${error.response.data}`, { type: "error" });
            console.log(`error ${error.response.data}`);
          }
        });
    }
    setStripe(true);
  };
  const SignInSchema = Yup.object().shape({
    fullName: Yup.string()
      .min(3, "Too Short!")
      .max(50, "Too Long!")
      .required("Name is required"),

    phoneNumber: Yup.string()
      .required("Phone number is required")
      .matches(/^\92?([0-9]{11})\)?$/, "Invalid Phone Number"),
    email: Yup.string().email().required("Email is required"),

    password: Yup.string()
      .required("Password is required")
      .min(6, "Password too short - 6 char minimum"),
  });
  return (
    <div>
      <Formik
        initialValues={initialValues}
        validationSchema={SignInSchema}
        onSubmit={(values) => {
          initialValues.email = values.email;
          initialValues.fullName = values.fullName;
          initialValues.password = values.password;
          initialValues.phoneNumber = values.phoneNumber;
          setStripe(true);
          axios
            .post("http://localhost:3000/members", initialValues)
            .then((response) => {
              toast("Account has been created successfully", {
                type: "success",
              });
              setData({
                name: initialValues.fullName,
                email: initialValues.email,
              });
              // console.log("Response from server :", response);

              setStripe(false);
            })
            .catch((error) => {
              console.log(`error in   : ${error}`);
              if (error.response) {
                toast(`${error.response.data}`, { type: "error" });
              }
            });
        }}
      >
        {(formik) => {
          const { errors, touched } = formik;
          return (
            <div className={Styles.container}>
              <Form>
                <div className={Styles.form_row}>
                  <div className={Styles.logo}>
                    <FaPencilAlt />
                  </div>
                  <Field
                    style={{
                      backgroundColor: "white",
                      flex: "2",
                      height: "2vw",
                      marginTop: "0.3vw",
                      outline: "none",
                      border: "none",
                      marginRight: "1vw",
                    }}
                    type="text"
                    name="fullName"
                    id="fullName"
                    placeholder=" Full Name"
                    className={
                      errors.fullName && touched.fullName ? "input-error" : null
                    }
                  />
                  <div>
                    {" "}
                    <br />
                    <br />
                    <ErrorMessage
                      name="fullName"
                      component="span"
                      className="error"
                      style={{
                        color: "maroon",
                        fontSize: "1.2vw",
                        marginLeft: "-23vw",
                      }}
                    />
                  </div>
                </div>
                <div className={Styles.form_row}>
                  <div className={Styles.logo}>
                    <IoMdContact />
                  </div>
                  <Field
                    style={{
                      backgroundColor: "white",
                      flex: "2",
                      height: "2vw",
                      marginTop: "0.3vw",
                      outline: "none",
                      border: "none",
                      marginRight: "1vw",
                    }}
                    type="number"
                    name="phoneNumber"
                    id="phoneNumber"
                    placeholder=" Contact Number"
                    className={
                      errors.phoneNumber && touched.phoneNumber
                        ? "input-error"
                        : null
                    }
                  />
                  <div>
                    {" "}
                    <br />
                    <br />
                    <ErrorMessage
                      name="phoneNumber"
                      component="span"
                      className="error"
                      style={{
                        color: "maroon",
                        fontSize: "1.2vw",
                        marginLeft: "-23vw",
                      }}
                    />
                  </div>
                </div>
                <div className={Styles.form_row}>
                  <div className={Styles.logo}>
                    <MdEmail />
                  </div>
                  <Field
                    style={{
                      backgroundColor: "white",
                      flex: "2",
                      height: "2vw",
                      marginTop: "0.3vw",
                      outline: "none",
                      border: "none",
                      marginRight: "1vw",
                    }}
                    type="email"
                    name="email"
                    id="email"
                    placeholder=" Your Email "
                    className={
                      errors.email && touched.email ? "input-error" : null
                    }
                  />
                  <div>
                    {" "}
                    <br />
                    <br />
                    <ErrorMessage
                      name="email"
                      component="span"
                      className="error"
                      style={{
                        color: "maroon",
                        fontSize: "1.2vw",
                        marginLeft: "-23vw",
                      }}
                    />
                  </div>
                </div>
                <div className={Styles.form_row}>
                  <div className={Styles.logo}>
                    <FaKey />
                  </div>
                  <Field
                    style={{
                      backgroundColor: "white",
                      flex: "2",
                      height: "2.5vw",
                      marginTop: "0.3vw",
                      outline: "none",
                      border: "none",
                      marginRight: "1vw",
                    }}
                    type="password"
                    name="password"
                    id="password"
                    placeholder=" Email Password"
                    className={
                      errors.password && touched.password ? "input-error" : null
                    }
                  />

                  <div>
                    {" "}
                    <br />
                    <br />
                    <ErrorMessage
                      name="password"
                      component="span"
                      className="error"
                      style={{
                        color: "maroon",
                        fontSize: "1.2vw",
                        marginLeft: "-23vw",
                      }}
                    />
                  </div>
                </div>
                <button
                  style={{
                    marginTop: "2vw",
                    padding: "0.8vw",
                    textAlign: "center",
                    marginLeft: "16vw",
                  }}
                  type="submit"
                  className={Styles.button}
                >
                  Continue
                </button>
              </Form>
            </div>
          );
        }}
      </Formik>
      {type === "membership" ? (
        <Features membership={membership} payment={"set"} hide={hide} />
      ) : type === "product" ? (
        <Features payment={payment} hide={hide} />
      ) : (
        console.log("")
      )}

      {type === "membership" || type === "product" ? (
        <div
          style={{
            marginTop: "2vw",
            textAlign: "center",
            marginLeft: "22%",
          }}
        >
          <StripeCheckout
            stripeKey="pk_test_51HndUcEynMwgZp7ZbDkkWsib4j8KiQJSN1m0B5GyvLpbNBmKflvbEBOJvTkAOMrF8HVWttyYeg0h6cO4WgvPbgpv00bxeRO8cs"
            token={handleStripe}
            name={"Payment SetUp"}
            email={initialValues.email}
            amount={
              totalPrice !== undefined
                ? totalPrice * 100
                : membership === "Standard"
                ? 12 * 100
                : membership === "Pro"
                ? 25 * 100
                : 39 * 100
            }
          >
            <button
              className={stripe === true ? Styles.disabledButton : Styles.pay}
              disabled={stripe}
            >
              Pay with Card
            </button>
          </StripeCheckout>
        </div>
      ) : (
        console.log(`type :${type}`)
      )}
    </div>
  );
}
