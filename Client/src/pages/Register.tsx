import { useRef, useEffect, useState } from "react";
import {
  faCheck,
  faTimes,
  faInfoCircle,
} from "@fortawesome/free-solid-svg-icons";
import axios from "../api/axios";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const USER_REGEX = /^[a-zA-Z][a-zA-Z0-9-_]{3,23}$/;
const PWD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%]).{8,}$/;
const PHONE_REGEX = /^[0-9]{10,15}$/; // Adjust as per your requirements
const REGISTER_URL = "/register";

interface RegisterResponse {
  accessToken: string; // Adjust this based on your API response
}

function Register() {
  const userRef = useRef<HTMLInputElement | null>(null);
  const errRef = useRef<HTMLParagraphElement>(null);

  const [user, setUser] = useState("");
  const [validName, setValidName] = useState(false);
  const [userFocus, setUserFocus] = useState(false);

  const [pwd, setPwd] = useState("");
  const [validPwd, setValidPwd] = useState(false);
  const [pwdFocus, setPwdFocus] = useState(false);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [validPhoneNumber, setValidPhoneNumber] = useState(false);
  const [phoneNumberFocus, setPhoneNumberFocus] = useState(false);

  const [matchPwd, setMatchPwd] = useState("");
  const [validMatch, setValidMatch] = useState(false);
  const [matchFocus, setMatchFocus] = useState(false);

  const [role, setRole] = useState(""); // New state for role
  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);

  const roles = [
    { value: "admin", label: "Admin" },
    { value: "user", label: "User" },
    { value: "editor", label: "Editor" },
  ]; // List of roles

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  useEffect(() => {
    setValidName(USER_REGEX.test(user));
  }, [user]);

  useEffect(() => {
    setValidPwd(PWD_REGEX.test(pwd));
    setValidMatch(pwd === matchPwd);
  }, [pwd, matchPwd]);

  useEffect(() => {
    setValidPhoneNumber(PHONE_REGEX.test(phoneNumber.replace(/\D/g, ""))); // Validate only numeric digits
  }, [phoneNumber]);

  useEffect(() => {
    setErrMsg("");
  }, [user, pwd, matchPwd, phoneNumber, role]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const v1 = USER_REGEX.test(user);
    const v2 = PWD_REGEX.test(pwd);
    const v3 = PHONE_REGEX.test(phoneNumber.replace(/\D/g, ""));

    if (!v1 || !v2 || !v3) {
      setErrMsg("Invalid Entry");
      return;
    }

    const response = await axios.post<RegisterResponse>(
      REGISTER_URL,
      JSON.stringify({ user, pwd, phoneNumber, role }),
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );

    if (response.status === 409) {
      setErrMsg("User already exists");
      errRef.current?.focus();
    } else {
      setErrMsg("Registration failed");
      errRef.current?.focus();
    }
    console.log(response.data); // Typed as RegisterResponse
    console.log(response.data.accessToken); // AccessToken is strongly typed
    console.log(JSON.stringify(response)); // Stringify response for debugging

    setSuccess(true);
    // Clear user inputs or perform additional actions
  };

  return (
    <>
      {success ? (
        <section>
          <h1>Success!</h1>
          <p>
            <a href="/login">Sign In</a>
          </p>
        </section>
      ) : (
        <section>
          <p
            ref={errRef}
            className={errMsg ? "errmsg" : "offscreen"}
            aria-live="assertive"
          >
            {errMsg}
          </p>
          <h1>Register</h1>
          <form onSubmit={handleSubmit}>
            {/* Username Field */}
            <label htmlFor="username">
              Username:
              <span className={validName ? "valid" : "hide"}>
                <FontAwesomeIcon icon={faCheck} />
              </span>
              <span className={validName || !user ? "hide" : "invalid"}>
                <FontAwesomeIcon icon={faTimes} />
              </span>
            </label>
            <input
              type="text"
              id="username"
              ref={userRef}
              autoComplete="off"
              onChange={(e) => setUser(e.target.value)}
              required
              aria-invalid={!validName}
              aria-describedby="uidnote"
              onFocus={() => setUserFocus(true)}
              onBlur={() => setUserFocus(false)}
            />
            <p
              id="uidnote"
              className={
                userFocus && user && !validName ? "instructions" : "offscreen"
              }
            >
              <FontAwesomeIcon icon={faInfoCircle} />4 to 24 characters. Must
              begin with a letter.
            </p>

            {/* Phone Number Field */}
            <label htmlFor="phoneNumber">
              Phone Number:
              <span className={validPhoneNumber ? "valid" : "hide"}>
                <FontAwesomeIcon icon={faCheck} />
              </span>
              <span
                className={
                  validPhoneNumber || !phoneNumber ? "hide" : "invalid"
                }
              >
                <FontAwesomeIcon icon={faTimes} />
              </span>
            </label>
            <PhoneInput
              country={"tn"}
              value={phoneNumber}
              onChange={(value) => setPhoneNumber(value)}
              inputProps={{
                name: "phone",
                required: true,
                onFocus: () => setPhoneNumberFocus(true),
                onBlur: () => setPhoneNumberFocus(false),
              }}
            />
            <p
              id="phonenote"
              className={
                phoneNumberFocus && phoneNumber && !validPhoneNumber
                  ? "instructions"
                  : "offscreen"
              }
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              Enter a valid phone number (10-15 digits).
            </p>

            {/* Role Selection Field */}
            <label htmlFor="role">Role:</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="" disabled>
                Select a role
              </option>
              {roles.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>

            {/* Password Fields */}
            <label htmlFor="password">
              Password:
              <span className={validPwd ? "valid" : "hide"}>
                <FontAwesomeIcon icon={faCheck} />
              </span>
              <span className={validPwd || !pwd ? "hide" : "invalid"}>
                <FontAwesomeIcon icon={faTimes} />
              </span>
            </label>
            <input
              type="password"
              id="password"
              autoComplete="off"
              onChange={(e) => setPwd(e.target.value)}
              required
              aria-invalid={!validPwd}
              aria-describedby="pwdnote"
              onFocus={() => setPwdFocus(true)}
              onBlur={() => setPwdFocus(false)}
            />
            <p
              id="pwdnote"
              className={pwdFocus && !validPwd ? "instructions" : "offscreen"}
            >
              <FontAwesomeIcon icon={faInfoCircle} />8 characters minimum.
            </p>

            <label htmlFor="confirm_pwd">
              Confirm Password:
              <FontAwesomeIcon
                icon={faCheck}
                className={validMatch && matchPwd ? "valid" : "hide"}
              />
              <FontAwesomeIcon
                icon={faTimes}
                className={validMatch || !matchPwd ? "hide" : "invalid"}
              />
            </label>
            <input
              type="password"
              id="confirm_pwd"
              onChange={(e) => setMatchPwd(e.target.value)}
              value={matchPwd}
              required
              aria-invalid={!validMatch}
              aria-describedby="confirmnote"
              onFocus={() => setMatchFocus(true)}
              onBlur={() => setMatchFocus(false)}
            />
            <p
              id="confirmnote"
              className={
                matchFocus && !validMatch ? "instructions" : "offscreen"
              }
            >
              <FontAwesomeIcon icon={faInfoCircle} />
              Must match the first password input field.
            </p>

            <button
              type="submit"
              disabled={
                !validName ||
                !validPwd ||
                !validMatch ||
                !validPhoneNumber ||
                !role
              }
            >
              Register
            </button>
          </form>
        </section>
      )}
    </>
  );
}

export default Register;
