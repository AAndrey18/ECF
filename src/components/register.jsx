import { useState } from "react";

import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  PawPrint,
  User,
  UserPlus,
  UserRound,
} from "lucide-react";

import { supabase } from "../lib/supabase";


function Register({
  onRegister,
  onBack,
}) {
  // =====================================================
  // ESTADOS
  // =====================================================

  const [accountType, setAccountType] =
    useState("CLIENTE");

  const [form, setForm] = useState({
    nombre: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    showConfirmPassword,
    setShowConfirmPassword,
  ] = useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // =====================================================
  // ACTUALIZAR FORMULARIO
  // =====================================================

  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };


  // =====================================================
  // CAMBIAR TIPO DE CUENTA
  // =====================================================

  const selectAccountType = (type) => {
    setAccountType(type);

    setError("");
    setSuccess("");
  };


  // =====================================================
  // REGISTRAR CUENTA
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");


    // =================================================
    // VALIDACIONES
    // =================================================

    const nombre =
      form.nombre.trim();

    const email =
      form.email
        .trim()
        .toLowerCase();


    if (!nombre) {
      setError(
        "Ingresa tu nombre completo."
      );

      return;
    }


    if (nombre.length < 3) {
      setError(
        "El nombre debe contener al menos 3 caracteres."
      );

      return;
    }


    if (!email) {
      setError(
        "Ingresa tu correo electrónico."
      );

      return;
    }


    if (!form.password) {
      setError(
        "Ingresa una contraseña."
      );

      return;
    }


    if (form.password.length < 6) {
      setError(
        "La contraseña debe tener al menos 6 caracteres."
      );

      return;
    }


    if (
      form.password !==
      form.confirmPassword
    ) {
      setError(
        "Las contraseñas no coinciden."
      );

      return;
    }


    if (
      accountType !== "CLIENTE" &&
      accountType !== "EMPLEADO"
    ) {
      setError(
        "Selecciona un tipo de cuenta válido."
      );

      return;
    }


    setLoading(true);


    try {
      // =================================================
      // CREAR USUARIO EN SUPABASE AUTH
      // =================================================

      const {
        data,
        error: signUpError,
      } =
        await supabase.auth.signUp({
          email,
          password:
            form.password,

          options: {
            data: {
              nombre,
              rol:
                accountType,
            },
          },
        });


      // =================================================
      // ERROR DE REGISTRO
      // =================================================

      if (signUpError) {
        console.error(
          "Error registrando usuario:",
          signUpError
        );


        const message =
          signUpError.message
            ?.toLowerCase() || "";


        if (
          message.includes(
            "already registered"
          ) ||
          message.includes(
            "already been registered"
          )
        ) {
          setError(
            "Ya existe una cuenta registrada con este correo."
          );

        } else if (
          message.includes(
            "password"
          )
        ) {
          setError(
            "La contraseña no cumple con los requisitos de seguridad."
          );

        } else if (
          message.includes(
            "email"
          )
        ) {
          setError(
            "El correo electrónico no es válido."
          );

        } else if (
          message.includes(
            "failed to fetch"
          )
        ) {
          setError(
            "No fue posible conectarse con Supabase."
          );

        } else {
          setError(
            signUpError.message ||
            "No fue posible crear la cuenta."
          );
        }

        return;
      }


      // =================================================
      // VERIFICAR USUARIO CREADO
      // =================================================

      if (!data?.user) {
        setError(
          "Supabase no devolvió la información del usuario."
        );

        return;
      }


      /*
        ==================================================
        IMPORTANTE

        NO hacemos:

        supabase
          .from("usuarios")
          .insert(...)

        desde React.

        El trigger de Supabase debe tomar:

        auth.users.id
        raw_user_meta_data.nombre
        raw_user_meta_data.rol

        y crear:

        public.usuarios

        id_usuario
        nombre
        rol
        activo

        ==================================================
      */


      // =================================================
      // LIMPIAR FORMULARIO
      // =================================================

      setForm({
        nombre: "",
        email: "",
        password: "",
        confirmPassword: "",
      });


      // =================================================
      // ¿REQUIERE CONFIRMACIÓN DE CORREO?
      // =================================================

      if (!data.session) {
        setSuccess(
          "Cuenta creada correctamente. Revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión."
        );

      } else {
        /*
          Si Supabase inicia sesión automáticamente
          después del registro, la cerramos.

          Así mantenemos un flujo sencillo:

          Registro
             ↓
          Login
             ↓
          Dashboard
        */

        const {
          error: logoutError,
        } =
          await supabase.auth
            .signOut();


        if (logoutError) {
          console.warn(
            "La cuenta se creó, pero no fue posible cerrar la sesión automática:",
            logoutError
          );
        }


        setSuccess(
          "Cuenta creada correctamente. Ya puedes iniciar sesión."
        );
      }


      // =================================================
      // VOLVER AL LOGIN
      // =================================================

      window.setTimeout(() => {
        if (onRegister) {
          onRegister();
        }
      }, 1800);

    } catch (unexpectedError) {
      console.error(
        "Error inesperado durante el registro:",
        unexpectedError
      );


      if (
        unexpectedError?.message
          ?.toLowerCase()
          .includes(
            "failed to fetch"
          )
      ) {
        setError(
          "No fue posible conectarse con Supabase."
        );

      } else {
        setError(
          "Ocurrió un error inesperado al crear la cuenta."
        );
      }

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <main
      className="
        grid
        min-h-screen
        bg-canwash-background

        lg:grid-cols-2
      "
    >

      {/* =================================================
          LADO IZQUIERDO
      ================================================== */}

      <section
        className="
          relative
          hidden
          min-h-screen
          overflow-hidden

          bg-gradient-to-br
          from-canwash
          to-[#7899A4]

          p-12
          text-white

          lg:flex
          lg:flex-col
          lg:items-center
          lg:justify-center
          lg:text-center
        "
      >

        {/* CÍRCULO SUPERIOR */}

        <div
          className="
            absolute
            -left-44
            -top-44

            h-[450px]
            w-[450px]

            rounded-full
            bg-white/10
          "
        />


        {/* CÍRCULO INFERIOR */}

        <div
          className="
            absolute
            -bottom-36
            -right-32

            h-[350px]
            w-[350px]

            rounded-full
            bg-white/10
          "
        />


        {/* LOGO */}

        <div
          className="
            relative
            z-10
          "
        >

          <PawPrint
            size={75}
            className="mx-auto"
          />


          <h1
            className="
              mt-5

              text-6xl
              font-bold
              tracking-[-0.06em]
            "
          >
            Can Wash
          </h1>


          <p
            className="
              mt-3

              text-xs
              font-semibold
              tracking-[0.3em]
              text-white/90
            "
          >
            ESTÉTICA CANINA Y FELINA
          </p>


          <div
            className="
              mx-auto
              mt-10
              max-w-sm

              rounded-2xl

              border
              border-white/10

              bg-white/10

              p-6

              text-left

              backdrop-blur-sm
            "
          >

            <h3
              className="
                font-semibold
              "
            >
              Crea tu cuenta
            </h3>


            <p
              className="
                mt-2

                text-sm
                leading-6
                text-white/80
              "
            >
              Regístrate para utilizar
              los servicios de Can Wash
              según el tipo de cuenta
              seleccionado.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          LADO DERECHO
      ================================================== */}

      <section
        className="
          flex
          min-h-screen
          items-center
          justify-center

          px-6
          py-10

          sm:px-10
        "
      >

        <div
          className="
            w-full
            max-w-xl
          "
        >

          {/* =================================================
              VOLVER
          ================================================== */}

          <button
            type="button"

            onClick={
              onBack
            }

            disabled={
              loading
            }

            className="
              mb-7

              flex
              items-center
              gap-2

              rounded-lg

              text-sm
              font-semibold
              text-canwash-dark

              transition

              hover:text-canwash

              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-canwash

              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >

            <ArrowLeft size={18} />

            Volver

          </button>


          {/* =================================================
              ICONO
          ================================================== */}

          <div
            className="
              mb-6

              grid
              h-16
              w-16
              place-items-center

              rounded-2xl

              bg-canwash-light
              text-canwash-dark

              shadow-lg
              shadow-canwash/20
            "
          >
            <UserPlus size={34} />
          </div>


          {/* =================================================
              TÍTULO
          ================================================== */}

          <h2
            className="
              text-4xl
              font-bold
              tracking-tight
              text-canwash-dark
            "
          >
            Crear cuenta
          </h2>


          <p
            className="
              mt-3

              text-sm
              leading-7
              text-canwash-muted
            "
          >
            Crea una cuenta para utilizar
            los servicios de Can Wash.
          </p>


          {/* =================================================
              TIPO DE CUENTA
          ================================================== */}

          <div className="mt-8">

            <span
              className="
                mb-3
                block

                text-sm
                font-semibold
                text-canwash-dark
              "
            >
              Tipo de cuenta
            </span>


            <div
              className="
                grid
                grid-cols-1
                gap-4

                sm:grid-cols-2
              "
            >

              {/* CLIENTE */}

              <AccountTypeButton
                selected={
                  accountType ===
                  "CLIENTE"
                }

                icon={
                  <UserRound size={24} />
                }

                title="Cliente"

                description="Registra tus mascotas y consulta sus servicios."

                onClick={() =>
                  selectAccountType(
                    "CLIENTE"
                  )
                }

                disabled={
                  loading
                }
              />


              {/* EMPLEADO */}

              <AccountTypeButton
                selected={
                  accountType ===
                  "EMPLEADO"
                }

                icon={
                  <BriefcaseBusiness
                    size={24}
                  />
                }

                title="Empleado"

                description="Consulta tus citas y actividades asignadas."

                onClick={() =>
                  selectAccountType(
                    "EMPLEADO"
                  )
                }

                disabled={
                  loading
                }
              />

            </div>

          </div>


          {/* =================================================
              FORMULARIO
          ================================================== */}

          <form
            onSubmit={
              handleSubmit
            }

            className="mt-8"
          >

            {/* =============================================
                NOMBRE
            ============================================== */}

            <FormLabel
              htmlFor="nombre"
            >
              Nombre completo
            </FormLabel>


            <InputContainer
              icon={
                <User size={20} />
              }
            >

              <input
                id="nombre"
                name="nombre"
                type="text"

                value={
                  form.nombre
                }

                onChange={
                  handleChange
                }

                placeholder="Ej. Juan Pérez"

                autoComplete="name"

                disabled={
                  loading
                }

                className={
                  inputInsideClasses
                }
              />

            </InputContainer>


            {/* =============================================
                EMAIL
            ============================================== */}

            <FormLabel
              htmlFor="email"
            >
              Correo electrónico
            </FormLabel>


            <InputContainer
              icon={
                <Mail size={20} />
              }
            >

              <input
                id="email"
                name="email"
                type="email"

                value={
                  form.email
                }

                onChange={
                  handleChange
                }

                placeholder="correo@ejemplo.com"

                autoComplete="email"

                disabled={
                  loading
                }

                className={
                  inputInsideClasses
                }
              />

            </InputContainer>


            {/* =============================================
                CONTRASEÑA
            ============================================== */}

            <FormLabel
              htmlFor="password"
            >
              Contraseña
            </FormLabel>


            <PasswordInput
              id="password"
              name="password"

              value={
                form.password
              }

              onChange={
                handleChange
              }

              placeholder="Mínimo 6 caracteres"

              visible={
                showPassword
              }

              onToggle={() =>
                setShowPassword(
                  (current) =>
                    !current
                )
              }

              disabled={
                loading
              }
            />


            {/* =============================================
                CONFIRMAR CONTRASEÑA
            ============================================== */}

            <FormLabel
              htmlFor="confirmPassword"
            >
              Confirmar contraseña
            </FormLabel>


            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"

              value={
                form.confirmPassword
              }

              onChange={
                handleChange
              }

              placeholder="Repite tu contraseña"

              visible={
                showConfirmPassword
              }

              onToggle={() =>
                setShowConfirmPassword(
                  (current) =>
                    !current
                )
              }

              disabled={
                loading
              }
            />


            {/* =============================================
                ERROR
            ============================================== */}

            {error && (
              <div
                role="alert"

                className="
                  mt-5

                  rounded-xl

                  border
                  border-red-200

                  bg-red-50

                  px-4
                  py-3

                  text-sm
                  font-medium
                  leading-5
                  text-red-700
                "
              >
                {error}
              </div>
            )}


            {/* =============================================
                ÉXITO
            ============================================== */}

            {success && (
              <div
                role="status"

                className="
                  mt-5

                  flex
                  items-start
                  gap-3

                  rounded-xl

                  border
                  border-emerald-200

                  bg-emerald-50

                  px-4
                  py-3

                  text-sm
                  font-medium
                  leading-5
                  text-emerald-700
                "
              >

                <CheckCircle2
                  size={19}
                  className="
                    mt-0.5
                    shrink-0
                  "
                />

                <span>
                  {success}
                </span>

              </div>
            )}


            {/* =============================================
                CREAR CUENTA
            ============================================== */}

            <button
              type="submit"

              disabled={
                loading
              }

              className="
                mt-6

                flex
                w-full
                items-center
                justify-center
                gap-2

                rounded-xl

                bg-canwash

                px-5
                py-4

                text-sm
                font-semibold
                text-white

                shadow-lg
                shadow-canwash/20

                transition

                hover:-translate-y-0.5
                hover:bg-[#7899A4]
                hover:shadow-xl

                focus:outline-none
                focus-visible:ring-4
                focus-visible:ring-canwash/30

                disabled:cursor-not-allowed
                disabled:translate-y-0
                disabled:opacity-60
                disabled:shadow-none
              "
            >

              {loading
                ? "Creando cuenta..."
                : "Crear cuenta"
              }


              {!loading && (
                <UserPlus size={19} />
              )}

            </button>


            {/* =============================================
                LOGIN
            ============================================== */}

            <div
              className="
                mt-6

                flex
                flex-wrap
                items-center
                justify-center
                gap-1.5

                text-sm
                text-canwash-muted
              "
            >

              <span>
                ¿Ya tienes una cuenta?
              </span>


              <button
                type="button"

                onClick={
                  onBack
                }

                disabled={
                  loading
                }

                className="
                  rounded

                  font-bold
                  text-canwash-dark

                  transition

                  hover:text-canwash
                  hover:underline

                  focus:outline-none
                  focus-visible:ring-2
                  focus-visible:ring-canwash

                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Iniciar sesión
              </button>

            </div>

          </form>

        </div>

      </section>

    </main>
  );
}


/* =========================================================
   TIPO DE CUENTA
========================================================= */

function AccountTypeButton({
  selected,
  icon,
  title,
  description,
  onClick,
  disabled,
}) {
  return (
    <button
      type="button"

      onClick={
        onClick
      }

      disabled={
        disabled
      }

      className={`
        group

        flex
        min-h-36
        w-full
        flex-col
        items-start
        gap-4

        rounded-2xl

        border-2

        p-5

        text-left

        transition

        focus:outline-none
        focus-visible:ring-4
        focus-visible:ring-canwash/20

        disabled:cursor-not-allowed
        disabled:opacity-60

        ${
          selected
            ? `
              border-canwash
              bg-canwash-light/20
              shadow-md
              shadow-canwash/10
            `
            : `
              border-canwash-cream
              bg-white
              hover:-translate-y-0.5
              hover:border-canwash
              hover:shadow-md
            `
        }
      `}
    >

      <div
        className={`
          grid
          h-12
          w-12
          place-items-center

          rounded-xl

          transition

          ${
            selected
              ? `
                bg-canwash
                text-white
              `
              : `
                bg-canwash-cream
                text-canwash-dark

                group-hover:bg-canwash-light
              `
          }
        `}
      >
        {icon}
      </div>


      <div>

        <strong
          className="
            block
            text-base
            text-canwash-dark
          "
        >
          {title}
        </strong>


        <span
          className="
            mt-1
            block

            text-xs
            leading-5
            text-canwash-muted
          "
        >
          {description}
        </span>

      </div>

    </button>
  );
}


/* =========================================================
   LABEL
========================================================= */

function FormLabel({
  htmlFor,
  children,
}) {
  return (
    <label
      htmlFor={
        htmlFor
      }

      className="
        mb-2
        mt-5
        block

        text-sm
        font-semibold
        text-canwash-dark
      "
    >
      {children}
    </label>
  );
}


/* =========================================================
   INPUT CON ICONO
========================================================= */

function InputContainer({
  icon,
  children,
}) {
  return (
    <div
      className="
        flex
        min-h-12
        items-center
        gap-3

        rounded-xl

        border
        border-canwash-light

        bg-white

        px-4

        transition

        focus-within:border-canwash
        focus-within:ring-4
        focus-within:ring-canwash/20
      "
    >

      <span
        className="
          shrink-0
          text-canwash
        "
      >
        {icon}
      </span>


      {children}

    </div>
  );
}


/* =========================================================
   CONTRASEÑA
========================================================= */

function PasswordInput({
  id,
  name,
  value,
  onChange,
  placeholder,
  visible,
  onToggle,
  disabled,
}) {
  return (
    <InputContainer
      icon={
        <Lock size={20} />
      }
    >

      <input
        id={id}
        name={name}

        type={
          visible
            ? "text"
            : "password"
        }

        value={
          value
        }

        onChange={
          onChange
        }

        placeholder={
          placeholder
        }

        autoComplete="new-password"

        disabled={
          disabled
        }

        className={
          inputInsideClasses
        }
      />


      <button
        type="button"

        onClick={
          onToggle
        }

        disabled={
          disabled
        }

        aria-label={
          visible
            ? "Ocultar contraseña"
            : "Mostrar contraseña"
        }

        className="
          grid
          h-9
          w-9
          shrink-0
          place-items-center

          rounded-lg

          text-canwash

          transition

          hover:bg-canwash-background
          hover:text-canwash-dark

          focus:outline-none
          focus-visible:ring-2
          focus-visible:ring-canwash

          disabled:cursor-not-allowed
          disabled:opacity-50
        "
      >

        {visible ? (
          <EyeOff size={19} />
        ) : (
          <Eye size={19} />
        )}

      </button>

    </InputContainer>
  );
}


/* =========================================================
   CLASES INPUT
========================================================= */

const inputInsideClasses = `
  min-w-0
  flex-1

  border-none

  bg-transparent

  py-3.5

  text-sm
  text-canwash-text

  outline-none

  placeholder:text-slate-400

  focus:ring-0

  disabled:cursor-not-allowed
  disabled:opacity-60
`;


export default Register;