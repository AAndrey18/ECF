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
  UserRound,
  UserPlus,
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

  const [showPassword, setShowPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [loading, setLoading] =
    useState(false);


  // =====================================================
  // CAMBIAR INPUT
  // =====================================================

  const handleChange = (e) => {
    setForm((currentForm) => ({
      ...currentForm,
      [e.target.name]: e.target.value,
    }));

    setError("");
    setSuccess("");
  };


  // =====================================================
  // SELECCIONAR TIPO DE CUENTA
  // =====================================================

  const selectAccountType = (type) => {
    setAccountType(type);

    setError("");
    setSuccess("");
  };


  // =====================================================
  // REGISTRAR
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");


    // =================================================
    // VALIDACIONES
    // =================================================

    if (!form.nombre.trim()) {
      setError(
        "Ingresa tu nombre completo."
      );

      return;
    }


    if (!form.email.trim()) {
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
          email:
            form.email
              .trim()
              .toLowerCase(),

          password:
            form.password,

          options: {
            data: {
              nombre:
                form.nombre.trim(),

              rol:
                accountType,
            },
          },
        });


      // =================================================
      // ERROR DE SUPABASE
      // =================================================

      if (signUpError) {
        console.error(
          "Error registrando usuario:",
          signUpError
        );


        if (
          signUpError.message
            .toLowerCase()
            .includes("already registered")
        ) {
          setError(
            "Ya existe una cuenta registrada con este correo."
          );

        } else {
          setError(
            signUpError.message
          );
        }

        return;
      }


      // =================================================
      // VERIFICAR USUARIO
      // =================================================

      if (!data?.user) {
        setError(
          "No fue posible crear la cuenta."
        );

        return;
      }


      // =================================================
      // IMPORTANTE
      //
      // El trigger de Supabase que configuramos debe
      // crear automáticamente la fila en public.usuarios
      // usando:
      //
      // data.user.id
      // metadata.nombre
      // metadata.rol
      //
      // Por eso NO insertamos manualmente en usuarios.
      // =================================================


      // =================================================
      // MENSAJE DE ÉXITO
      // =================================================

      if (!data.session) {
        setSuccess(
          "Cuenta creada correctamente. Revisa tu correo electrónico para confirmar tu cuenta."
        );

      } else {
        setSuccess(
          "Cuenta creada correctamente."
        );
      }


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
      // VOLVER AL LOGIN
      // =================================================

      setTimeout(() => {
        if (onRegister) {
          onRegister();
        }
      }, 1800);

    } catch (unexpectedError) {
      console.error(
        "Error inesperado:",
        unexpectedError
      );

      setError(
        "Ocurrió un error inesperado al crear la cuenta."
      );

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

        {/* DECORACIÓN */}

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


        {/* CONTENIDO */}

        <div className="relative z-10">

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
              bg-white/10
              p-6
              text-left
              backdrop-blur-sm
            "
          >

            <h3 className="font-semibold">
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
              Regístrate para acceder a
              las herramientas de Can Wash
              según tu tipo de usuario.
            </p>

          </div>

        </div>

      </section>


      {/* =================================================
          FORMULARIO
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

            onClick={onBack}

            disabled={loading}

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

            Volver al inicio de sesión
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
            Selecciona el tipo de cuenta
            que deseas registrar.
          </p>


          {/* =================================================
              TIPO DE CUENTA
          ================================================== */}

          <div
            className="
              mt-7
              grid
              grid-cols-1
              gap-4
              sm:grid-cols-2
            "
          >

            {/* =============================================
                CLIENTE
            ============================================== */}

            <button
              type="button"

              onClick={() =>
                selectAccountType(
                  "CLIENTE"
                )
              }

              disabled={loading}

              className={`
                group
                flex
                min-h-36
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
                  accountType === "CLIENTE"
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
                    accountType === "CLIENTE"
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
                <UserRound size={24} />
              </div>


              <div>

                <strong
                  className="
                    block
                    text-base
                    text-canwash-dark
                  "
                >
                  Cliente
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
                  Registra tus mascotas y
                  consulta tus servicios.
                </span>

              </div>

            </button>


            {/* =============================================
                EMPLEADO
            ============================================== */}

            <button
              type="button"

              onClick={() =>
                selectAccountType(
                  "EMPLEADO"
                )
              }

              disabled={loading}

              className={`
                group
                flex
                min-h-36
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
                  accountType === "EMPLEADO"
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
                    accountType === "EMPLEADO"
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
                <BriefcaseBusiness
                  size={24}
                />
              </div>


              <div>

                <strong
                  className="
                    block
                    text-base
                    text-canwash-dark
                  "
                >
                  Empleado
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
                  Consulta citas, servicios
                  y actividades asignadas.
                </span>

              </div>

            </button>

          </div>


          {/* =================================================
              FORMULARIO
          ================================================== */}

          <form
            onSubmit={handleSubmit}
            className="mt-8"
          >

            {/* =============================================
                NOMBRE
            ============================================== */}

            <label
              htmlFor="nombre"
              className="
                mb-2
                block
                text-sm
                font-semibold
                text-canwash-dark
              "
            >
              Nombre completo
            </label>


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

              <User
                size={20}
                className="
                  shrink-0
                  text-canwash
                "
              />


              <input
                id="nombre"
                name="nombre"
                type="text"

                placeholder="Tu nombre completo"

                value={
                  form.nombre
                }

                onChange={
                  handleChange
                }

                autoComplete="name"

                disabled={loading}

                className="
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
                "
              />

            </div>


            {/* =============================================
                CORREO
            ============================================== */}

            <label
              htmlFor="email"
              className="
                mb-2
                mt-5
                block
                text-sm
                font-semibold
                text-canwash-dark
              "
            >
              Correo electrónico
            </label>


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

              <Mail
                size={20}
                className="
                  shrink-0
                  text-canwash
                "
              />


              <input
                id="email"
                name="email"
                type="email"

                placeholder="correo@ejemplo.com"

                value={
                  form.email
                }

                onChange={
                  handleChange
                }

                autoComplete="email"

                disabled={loading}

                className="
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
                "
              />

            </div>


            {/* =============================================
                CONTRASEÑA
            ============================================== */}

            <label
              htmlFor="password"
              className="
                mb-2
                mt-5
                block
                text-sm
                font-semibold
                text-canwash-dark
              "
            >
              Contraseña
            </label>


            <PasswordInput
              id="password"
              name="password"

              value={
                form.password
              }

              placeholder="Mínimo 6 caracteres"

              showPassword={
                showPassword
              }

              onToggle={() =>
                setShowPassword(
                  (current) => !current
                )
              }

              onChange={
                handleChange
              }

              disabled={
                loading
              }

              autoComplete="new-password"
            />


            {/* =============================================
                CONFIRMAR CONTRASEÑA
            ============================================== */}

            <label
              htmlFor="confirmPassword"
              className="
                mb-2
                mt-5
                block
                text-sm
                font-semibold
                text-canwash-dark
              "
            >
              Confirmar contraseña
            </label>


            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"

              value={
                form.confirmPassword
              }

              placeholder="Repite tu contraseña"

              showPassword={
                showConfirmPassword
              }

              onToggle={() =>
                setShowConfirmPassword(
                  (current) => !current
                )
              }

              onChange={
                handleChange
              }

              disabled={
                loading
              }

              autoComplete="new-password"
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
                BOTÓN REGISTRO
            ============================================== */}

            <button
              type="submit"

              disabled={loading}

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
                : `Crear cuenta de ${
                    accountType ===
                    "CLIENTE"
                      ? "cliente"
                      : "empleado"
                  }`
              }


              {!loading && (
                <UserPlus size={19} />
              )}

            </button>


            {/* =============================================
                VOLVER AL LOGIN
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

                onClick={onBack}

                disabled={loading}

                className="
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
   COMPONENTE INPUT DE CONTRASEÑA
========================================================= */

function PasswordInput({
  id,
  name,
  value,
  placeholder,
  showPassword,
  onToggle,
  onChange,
  disabled,
  autoComplete,
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

      <Lock
        size={20}
        className="
          shrink-0
          text-canwash
        "
      />


      <input
        id={id}
        name={name}

        type={
          showPassword
            ? "text"
            : "password"
        }

        value={value}

        placeholder={
          placeholder
        }

        onChange={
          onChange
        }

        disabled={
          disabled
        }

        autoComplete={
          autoComplete
        }

        className="
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
        "
      />


      <button
        type="button"

        onClick={onToggle}

        disabled={
          disabled
        }

        aria-label={
          showPassword
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

        {showPassword ? (
          <EyeOff size={19} />
        ) : (
          <Eye size={19} />
        )}

      </button>

    </div>
  );
}


export default Register;