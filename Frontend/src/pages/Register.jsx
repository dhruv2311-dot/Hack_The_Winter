// import { useState } from "react";
// import { registerUser } from "../services/authApi";

// export default function Register() {
//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//     role: "user",
//     organizationName: "",
//     registrationNumber: ""
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     try {
//       const res = await registerUser(form);
//       alert(res.data.message);
//     } catch (err) {
//       alert(err.response?.data?.message || "Error");
//     }
//   };

//   return (
//     <div>
//       <h2>Register</h2>

//       <form onSubmit={handleSubmit}>
//         <input name="name" placeholder="Name" onChange={handleChange} />
//         <input name="email" placeholder="Email" onChange={handleChange} />
//         <input name="password" type="password" placeholder="Password" onChange={handleChange} />

//         <select name="role" onChange={handleChange}>
//           <option value="user">User</option>
//           <option value="ngo">NGO</option>
//           <option value="bloodbank">Blood Bank</option>
//           <option value="hospital">Hospital</option>
//           <option value="admin">Admin</option>
//         </select>

//         {(form.role !== "user" && form.role !== "admin") && (
//           <>
//             <input
//               name="organizationName"
//               placeholder="Organization Name"
//               onChange={handleChange}
//             />
//             <input
//               name="registrationNumber"
//               placeholder="Registration Number"
//               onChange={handleChange}
//             />
//           </>
//         )}

//         <button type="submit">Register</button>
//       </form>
//     </div>
//   );
// }


import { useState } from "react";
import { registerUser } from "../services/authApi";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "user",
    organizationName: "",
    registrationNumber: ""
  });

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await registerUser(form);
      alert(res.data.message);
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 to-slate-700">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-slate-700 mb-6">
          Register
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600"
          />

          <input
            name="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600"
          />

          <select
            name="role"
            onChange={handleChange}
            className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600"
          >
            <option value="user">User</option>
            <option value="ngo">NGO</option>
            <option value="bloodbank">Blood Bank</option>
            <option value="hospital">Hospital</option>
            <option value="admin">Admin</option>
          </select>

          {(form.role !== "user" && form.role !== "admin") && (
            <>
              <input
                name="organizationName"
                placeholder="Organization Name"
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600"
              />

              <input
                name="registrationNumber"
                placeholder="Registration Number"
                onChange={handleChange}
                className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-slate-600"
              />
            </>
          )}

          <button
            type="submit"
            className="w-full bg-slate-700 text-white py-3 rounded-md font-semibold hover:bg-slate-800 transition"
          >
            Create Account
          </button>
        </form>

        {/* 👇 Bottom text */}
        <p className="text-center text-sm mt-5 text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-slate-700 font-semibold cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}
