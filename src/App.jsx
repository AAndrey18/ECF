import { useState } from "react";

import Login from "./components/login";
import Register from "./components/register";


function App() {
  const [page, setPage] =
    useState("login");


  if (page === "register") {
    return (
      <Register
        onRegister={() =>
          setPage("login")
        }

        onBack={() =>
          setPage("login")
        }
      />
    );
  }


  return (
    <Login
      onLogin={(user) => {
        console.log(
          "Usuario autenticado:",
          user
        );
      }}

      onRegister={() =>
        setPage("register")
      }
    />
  );
}


export default App;