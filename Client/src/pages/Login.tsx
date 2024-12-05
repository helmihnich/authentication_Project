import { useContext, useState, useEffect, useRef } from "react";
import AuthContext from "../context/Authprovider";
import axios from "../api/axios";

const LOGIN_URL = "/auth";

function Login() {
  const { setAuth } = useContext(AuthContext)!; // Non-null assertion since the context will not be undefined when wrapped properly
  const userRef = useRef<HTMLInputElement | null>(null);
  const errRef = useRef<HTMLInputElement | null>(null);

  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    userRef.current?.focus(); // Focus the username input field on load
  }, []);

  useEffect(() => {
    setErrMsg(""); // Clear error message on user or password change
  }, [user, pwd]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const response = await axios.post(
      LOGIN_URL,
      JSON.stringify({ user, pwd }),
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );

    if (!response?.data) {
      setErrMsg("Login failed");
      errRef.current?.focus();
    }
    if (!response) {
      setErrMsg("Login failed. Please try again.");
      errRef.current?.focus();
    }
    const { accessToken, roles } = response.data;
    setAuth({ user, accessToken, roles }); // Update context with user data and token
    setUser("");
    setPwd("");
    setSuccess(true);
  };

  return (
    <>
      {success ? (
        <section>
          <h1>You are logged in!</h1>
          <br />
          <p>
            <a href="/home">Go to Home</a>
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
          <h1>Sign In</h1>
          <form onSubmit={handleSubmit}>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              ref={userRef}
              autoComplete="off"
              onChange={(e) => setUser(e.target.value)}
              value={user}
              required
            />
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              onChange={(e) => setPwd(e.target.value)}
              value={pwd}
              required
            />
            <button type="submit">Sign In</button>
          </form>
          <p>
            Need an Account?
            <br />
            <span className="line">
              <a href="/register">Sign Up</a>
            </span>
          </p>
        </section>
      )}
    </>
  );
}

export default Login;
