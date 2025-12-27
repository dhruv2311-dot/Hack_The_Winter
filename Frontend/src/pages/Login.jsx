// import { useState } from "react";
// import { loginUser } from "../services/authApi";

// export default function Login() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await loginUser({ email, password });
//       localStorage.setItem("token", res.data.token);
//       localStorage.setItem("role", res.data.role);

//       alert("Login successful");

//       // 🔀 Role-based redirect
//       if (res.data.role === "admin") window.location.href = "/admin";
//       else if (res.data.role === "ngo") window.location.href = "/ngo";
//       else if (res.data.role === "bloodbank") window.location.href = "/bloodbank";
//       else if (res.data.role === "hospital") window.location.href = "/hospital";
//       else window.location.href = "/user";

//     } catch (err) {
//       alert(err.response?.data?.message || "Login failed");
//     }
//   };

//   return (
//     <div>
//       <h2>Login</h2>

//       <form onSubmit={handleSubmit}>
//         <input placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
//         <input
//           placeholder="Password"
//           type="password"
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <button type="submit">Login</button>
//       </form>
//     </div>
//   );
// }



import { useState } from "react";
import { loginUser } from "../services/authApi";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await loginUser({ email, password });

      // 🔴 ROLE CHECK
      if (res.data.role !== role) {
        alert("Role mismatch! Please select correct role.");
        return;
      }

      // ✅ SAVE AUTH DATA
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("role", res.data.role);

      alert("Login successful");

      // 🔀 ROLE-BASED REDIRECT
      if (res.data.role === "admin") navigate("/admin");
      else if (res.data.role === "ngo") navigate("/ngo");
      else if (res.data.role === "bloodbank") navigate("/bloodbank");
      else if (res.data.role === "hospital") navigate("/hospital");
      else navigate("/user");

    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-700">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-slate-700 mb-6">
          Login
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">

          <input
            placeholder="Email"
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600"
          />

          <input
            placeholder="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600"
          />

          {/* ✅ ROLE SELECT */}
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600"
          >
            <option value="user">User</option>
            <option value="ngo">NGO</option>
            <option value="bloodbank">Blood Bank</option>
            <option value="hospital">Hospital</option>
            <option value="admin">Admin</option>
          </select>

          <button
            type="submit"
            className="w-full bg-slate-700 text-white py-3 rounded-md font-semibold hover:bg-slate-800 transition"
          >
            Login
          </button>
        </form>

        <p className="text-center text-sm mt-5 text-gray-600">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-slate-700 font-semibold cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
}
