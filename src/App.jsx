import { useEffect, useState } from "react";

import {
  AlertCircle,
  LogOut,
  PawPrint,
} from "lucide-react";

import Login from "./components/login";
import Register from "./components/register";
import ClientDashboard from "./components/clientDashboard";
import EmployeeDashboard from "./components/employeeDashboard";

import { supabase } from "./lib/supabase";


function App() {
  // =====================================================
  // ESTADOS
  // =====================================================

  const [user, setUser] =
    useState(null);

  const [page, setPage] =
    useState("login");

  const [loading, setLoading] =
    useState(true);

  const [authError, setAuthError] =
    useState("");


  // =====================================================
  // OBTENER PERFIL DESDE PUBLIC.USUARIOS
  // =====================================================

  const getUserProfile = async (
    supabaseUser
  ) => {
    if (!supabaseUser?.id) {
      throw new Error(
        "No fue posible identificar al usuario."
      );
    }


    const {
      data: profile,
      error: profileError,
    } = await supabase
      .from("usuarios")
      .select(`
        id_usuario,
        nombre,
        rol,
        activo
      `)
      .eq(
        "id_usuario",
        supabaseUser.id
      )
      .maybeSingle();


    // ===================================================
    // ERROR CONSULTANDO TABLA
    // ===================================================

    if (profileError) {
      console.error(
        "Error consultando public.usuarios:",
        profileError
      );

      throw new Error(
        "No fue posible consultar tu perfil de Can Wash."
      );
    }


    // ===================================================
    // PERFIL NO EXISTE
    // ===================================================

    if (!profile) {
      throw new Error(
        "Tu cuenta existe, pero no tiene un perfil asociado en Can Wash."
      );
    }


    // ===================================================
    // CUENTA DESACTIVADA
    // ===================================================

    if (profile.activo === false) {
      throw new Error(
        "Esta cuenta se encuentra desactivada."
      );
    }


    // ===================================================
    // NORMALIZAR ROL
    // ===================================================

    const role =
      profile.rol
        ?.trim()
        .toUpperCase();


    // ===================================================
    // VALIDAR ROL
    // ===================================================

    const validRoles = [
      "CLIENTE",
      "EMPLEADO",
      "ADMIN",
    ];


    if (
      !validRoles.includes(role)
    ) {
      throw new Error(
        `El rol "${profile.rol}" no está configurado en Can Wash.`
      );
    }


    // ===================================================
    // OBJETO QUE USARÁ REACT
    // ===================================================

    return {
      id_usuario:
        profile.id_usuario,

      nombre:
        profile.nombre,

      email:
        supabaseUser.email,

      rol:
        role,

      activo:
        profile.activo,
    };
  };


  // =====================================================
  // CARGAR USUARIO AUTENTICADO
  // =====================================================

  const loadAuthenticatedUser =
    async (supabaseUser) => {
      try {
        const profile =
          await getUserProfile(
            supabaseUser
          );


        setUser(profile);
        setPage("dashboard");
        setAuthError("");


        return profile;

      } catch (error) {
        console.error(
          "Error cargando perfil:",
          error
        );


        setUser(null);


        throw error;
      }
    };


  // =====================================================
  // RECUPERAR SESIÓN AL CARGAR LA SPA
  // =====================================================

  useEffect(() => {
    let mounted = true;


    const initializeAuth =
      async () => {
        try {
          setLoading(true);
          setAuthError("");


          // ===============================================
          // OBTENER SESIÓN GUARDADA
          // ===============================================

          const {
            data: {
              session,
            },
            error: sessionError,
          } =
            await supabase.auth
              .getSession();


          if (sessionError) {
            throw sessionError;
          }


          // ===============================================
          // NO HAY SESIÓN
          // ===============================================

          if (!session?.user) {
            if (mounted) {
              setUser(null);
              setPage("login");
            }

            return;
          }


          // ===============================================
          // HAY SESIÓN
          // ===============================================

          const profile =
            await getUserProfile(
              session.user
            );


          if (mounted) {
            setUser(profile);
            setPage("dashboard");
          }

        } catch (error) {
          console.error(
            "Error recuperando sesión:",
            error
          );


          /*
            Si Auth tiene sesión pero public.usuarios
            tiene algún problema, cerramos la sesión
            para evitar dejar la aplicación en un
            estado inconsistente.
          */

          await supabase.auth
            .signOut();


          if (mounted) {
            setUser(null);
            setPage("login");

            setAuthError(
              error?.message ||
              "No fue posible recuperar tu sesión."
            );
          }

        } finally {
          if (mounted) {
            setLoading(false);
          }
        }
      };


    initializeAuth();


    // ===================================================
    // ESCUCHAR CAMBIOS DE AUTENTICACIÓN
    // ===================================================

    const {
      data: {
        subscription,
      },
    } =
      supabase.auth
        .onAuthStateChange(
          (event) => {

            /*
              Login llama directamente a handleLogin(),
              por lo que no necesitamos volver a consultar
              aquí el perfil durante SIGNED_IN.

              Este listener se utiliza principalmente para
              detectar el cierre de sesión.
            */

            if (
              event === "SIGNED_OUT" &&
              mounted
            ) {
              setUser(null);
              setPage("login");
            }
          }
        );


    // ===================================================
    // LIMPIEZA
    // ===================================================

    return () => {
      mounted = false;

      subscription.unsubscribe();
    };

  }, []);


  // =====================================================
  // LOGIN
  //
  // login.jsx ya hizo:
  // supabase.auth.signInWithPassword()
  //
  // Aquí recibimos data.user.
  // =====================================================

  const handleLogin = async (
    supabaseUser
  ) => {
    try {
      setLoading(true);
      setAuthError("");


      await loadAuthenticatedUser(
        supabaseUser
      );

    } catch (error) {
      console.error(
        "Error después del login:",
        error
      );


      // Si no hay perfil válido,
      // no dejamos una sesión abierta.

      await supabase.auth
        .signOut();


      setAuthError(
        error?.message ||
        "No fue posible cargar tu cuenta."
      );


      setUser(null);
      setPage("login");

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      setLoading(true);


      const {
        error: logoutError,
      } =
        await supabase.auth
          .signOut();


      if (logoutError) {
        throw logoutError;
      }


      setUser(null);
      setPage("login");
      setAuthError("");

    } catch (error) {
      console.error(
        "Error cerrando sesión:",
        error
      );


      setAuthError(
        "No fue posible cerrar la sesión correctamente."
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // CARGANDO
  // =====================================================

  if (loading) {
    return (
      <main
        className="
          grid
          min-h-screen
          place-items-center
          bg-canwash-background
          px-6
        "
      >

        <div className="text-center">

          <div
            className="
              mx-auto
              grid
              h-20
              w-20
              place-items-center
              rounded-3xl
              bg-canwash-light
              text-canwash-dark
              shadow-lg
              shadow-canwash/20
            "
          >
            <PawPrint size={42} />
          </div>


          <h1
            className="
              mt-6
              text-2xl
              font-bold
              text-canwash-dark
            "
          >
            Can Wash
          </h1>


          <p
            className="
              mt-2
              text-sm
              text-canwash-muted
            "
          >
            Preparando tu cuenta...
          </p>


          {/* ANIMACIÓN */}

          <div
            className="
              mx-auto
              mt-6
              h-8
              w-8
              animate-spin
              rounded-full
              border-4
              border-canwash-light
              border-t-canwash-dark
            "
          />

        </div>

      </main>
    );
  }


  // =====================================================
  // USUARIO NO AUTENTICADO
  // =====================================================

  if (!user) {
    // ===================================================
    // REGISTRO
    // ===================================================

    if (
      page === "register"
    ) {
      return (
        <Register
          onRegister={() => {
            setAuthError("");
            setPage("login");
          }}

          onBack={() => {
            setAuthError("");
            setPage("login");
          }}
        />
      );
    }


    // ===================================================
    // LOGIN
    // ===================================================

    return (
      <div
        className="
          relative
          min-h-screen
        "
      >

        {/* ===============================================
            ERROR GENERAL DE AUTENTICACIÓN
        ================================================ */}

        {authError && (
          <div
            className="
              fixed
              left-1/2
              top-4
              z-[100]
              flex
              w-[calc(100%-2rem)]
              max-w-lg
              -translate-x-1/2
              items-start
              gap-3
              rounded-xl
              border
              border-red-200
              bg-red-50
              px-4
              py-3
              text-sm
              font-medium
              text-red-700
              shadow-xl
            "
          >

            <AlertCircle
              size={19}
              className="
                mt-0.5
                shrink-0
              "
            />


            <span className="flex-1">
              {authError}
            </span>


            <button
              type="button"

              onClick={() =>
                setAuthError("")
              }

              className="
                shrink-0
                text-red-500
                transition
                hover:text-red-700
              "
            >
              ×
            </button>

          </div>
        )}


        <Login
          onLogin={
            handleLogin
          }

          onRegister={() => {
            setAuthError("");
            setPage("register");
          }}
        />

      </div>
    );
  }


  // =====================================================
  // CLIENTE
  // =====================================================

  if (
    user.rol === "CLIENTE"
  ) {
    return (
      <ClientDashboard
        user={user}

        onLogout={
          handleLogout
        }
      />
    );
  }


  // =====================================================
  // EMPLEADO
  // =====================================================

  if (
    user.rol === "EMPLEADO"
  ) {
    return (
      <EmployeeDashboard
        user={user}

        onLogout={
          handleLogout
        }
      />
    );
  }


  // =====================================================
  // ADMIN
  //
  // TEMPORALMENTE utiliza EmployeeDashboard.
  // Más adelante podemos crear AdminDashboard.
  // =====================================================

  if (
    user.rol === "ADMIN"
  ) {
    return (
      <EmployeeDashboard
        user={user}

        onLogout={
          handleLogout
        }
      />
    );
  }


  // =====================================================
  // FALLBACK
  // =====================================================

  return (
    <main
      className="
        grid
        min-h-screen
        place-items-center
        bg-canwash-background
        px-6
      "
    >

      <section
        className="
          w-full
          max-w-md
          rounded-3xl
          bg-white
          p-8
          text-center
          shadow-xl
          shadow-canwash-dark/10
        "
      >

        <div
          className="
            mx-auto
            grid
            h-16
            w-16
            place-items-center
            rounded-2xl
            bg-red-100
            text-red-600
          "
        >
          <AlertCircle size={32} />
        </div>


        <h1
          className="
            mt-5
            text-2xl
            font-bold
            text-canwash-dark
          "
        >
          Rol no reconocido
        </h1>


        <p
          className="
            mt-3
            text-sm
            leading-6
            text-canwash-muted
          "
        >
          El rol{" "}
          <strong
            className="
              text-canwash-dark
            "
          >
            {user.rol}
          </strong>{" "}
          no está configurado en la
          aplicación.
        </p>


        <button
          type="button"

          onClick={
            handleLogout
          }

          className="
            mt-6
            flex
            w-full
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-canwash-dark
            px-5
            py-4
            text-sm
            font-semibold
            text-white
            transition
            hover:bg-canwash
          "
        >
          <LogOut size={18} />

          Cerrar sesión
        </button>

      </section>

    </main>
  );
}


export default App;