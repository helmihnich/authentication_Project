import { useState, useEffect, useRef } from "react";
import useAuth from "../hooks/useAuth";
import axios from "../api/axios";
import { useLocation, useNavigate } from "react-router-dom";

const LOGIN_URL = "/auth";

function Login() {
  const { setAuth } = useAuth()!;
  const userRef = useRef<HTMLInputElement | null>(null);
  const errRef = useRef<HTMLParagraphElement | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/";

  const [user, setUser] = useState("");
  const [pwd, setPwd] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [roles, setRoles] = useState<string[]>([]); // State for roles

  useEffect(() => {
    userRef.current?.focus();
  }, []);

  useEffect(() => {
    setErrMsg(""); // Clear error message on user or password change
  }, [user, pwd]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
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
        return;
      }

      console.log(response.data);

      const { accessToken, roles } = response.data;
      console.log(roles);
      console.log(accessToken);

      setAuth({ user, accessToken, roles }); // Update context with user data and token
      setRoles(roles); // Set roles
      setUser("");
      setPwd("");
      navigate(from, { replace: true });
    } catch (error: unknown) {
      setErrMsg("Login failed. Please try again.");
      console.log(error);
      errRef.current?.focus();
    }
  };

  return (
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

      {/* Display roles if login is successful */}
      {roles.length > 0 && (
        <div>
          <h2>Your Roles:</h2>
          <ul>
            {roles.map((role, index) => (
              <li key={index}>{role}</li>
            ))}
          </ul>
        </div>
      )}

      <p>
        Need an Account?
        <br />
        <span className="line">
          <a href="/register">Sign Up</a>
        </span>
      </p>
    </section>
  );
}

export default Login;
