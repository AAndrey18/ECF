import { useEffect, useState } from "react";

import {
  AlertCircle,
  KeyRound,
  Mail,
  MapPin,
  PawPrint,
  Phone,
  RefreshCw,
  Save,
  ShieldCheck,
  User,
} from "lucide-react";

import { supabase } from "../lib/supabase";

import Sidebar from "./sidebar";
import MobileMenu from "./mobileMenu";
import LocationMap from "./locationMap";


function Profile({
  user,
  onBack,
  onLogout,
}) {
  // =====================================================
  // ESTADOS
  // =====================================================

  const [client, setClient] =
    useState(null);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");


  const [form, setForm] =
    useState({
      telefono: "",
      colonia: "",
      direccion: "",
    });


  // =====================================================
  // ROL
  // =====================================================

  const role =
    user?.rol
      ?.trim()
      .toUpperCase() ||
    "";


  const isClient =
    role === "CLIENTE";


  // =====================================================
  // CARGAR PERFIL
  // =====================================================

  const loadProfile = async () => {
    setLoading(true);
    setError("");


    try {
      // ===============================================
      // CLIENTE
      // ===============================================

      if (isClient) {
        const {
          data,
          error: clientError,
        } = await supabase
          .from("clientes")
          .select(`
            id_cliente,
            id_usuario,
            nombre,
            telefono,
            email,
            colonia,
            direccion,
            medio_contacto,
            origen_cliente,
            notas,
            fecha_registro
          `)
          .eq(
            "id_usuario",
            user.id_usuario
          )
          .maybeSingle();


        if (clientError) {
          throw clientError;
        }


        setClient(data);


        setForm({
          telefono:
            data?.telefono || "",

          colonia:
            data?.colonia || "",

          direccion:
            data?.direccion || "",
        });
      }

    } catch (loadError) {
      console.error(
        "Error cargando perfil:",
        loadError
      );


      setError(
        "No fue posible cargar tu perfil."
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // CARGA INICIAL
  // =====================================================

  useEffect(() => {
    loadProfile();
  }, [user?.id_usuario]);


  // =====================================================
  // FORMULARIO
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
  // GUARDAR PERFIL CLIENTE
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!isClient) {
      return;
    }


    if (!form.telefono.trim()) {
      setError(
        "Ingresa tu teléfono."
      );

      return;
    }


    setSaving(true);
    setError("");
    setSuccess("");


    try {
      // ===============================================
      // ACTUALIZAR
      // ===============================================

      if (client) {
        const {
          error: updateError,
        } = await supabase
          .from("clientes")
          .update({
            telefono:
              form.telefono.trim(),

            colonia:
              form.colonia.trim() ||
              null,

            direccion:
              form.direccion.trim() ||
              null,
          })
          .eq(
            "id_cliente",
            client.id_cliente
          );


        if (updateError) {
          throw updateError;
        }

      } else {
        // =============================================
        // CREAR PERFIL CLIENTE
        // =============================================

        const {
          error: insertError,
        } = await supabase
          .from("clientes")
          .insert({
            id_usuario:
              user.id_usuario,

            nombre:
              user.nombre,

            email:
              user.email,

            telefono:
              form.telefono.trim(),

            colonia:
              form.colonia.trim() ||
              null,

            direccion:
              form.direccion.trim() ||
              null,

            medio_contacto:
              "APP",

            origen_cliente:
              "APP",
          });


        if (insertError) {
          throw insertError;
        }
      }


      setSuccess(
        "Información actualizada correctamente."
      );


      await loadProfile();

    } catch (saveError) {
      console.error(
        "Error guardando perfil:",
        saveError
      );


      setError(
        "No fue posible guardar los cambios."
      );

    } finally {
      setSaving(false);
    }
  };


  // =====================================================
  // VOLVER
  // =====================================================

  const handleBack = () => {
    setMobileMenuOpen(false);

    onBack();
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    setMobileMenuOpen(false);

    onLogout();
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <main
        className="
          grid
          min-h-screen
          place-items-center
          bg-canwash-background
        "
      >

        <div className="text-center">

          <PawPrint
            size={45}
            className="
              mx-auto
              text-canwash
            "
          />


          <h2
            className="
              mt-4
              text-xl
              font-bold
              text-canwash-dark
            "
          >
            Cargando perfil...
          </h2>

        </div>

      </main>
    );
  }


  // =====================================================
  // INTERFAZ
  // =====================================================

  return (
    <div
      className="
        min-h-screen
        bg-canwash-background
      "
    >

      {/* =================================================
          SIDEBAR
      ================================================== */}

      <Sidebar
        user={user}

        view="perfil"

        isOpen={
          mobileMenuOpen
        }

        onChangeView={
          handleBack
        }

        onProfile={() => {
          setMobileMenuOpen(false);
        }}

        onLogout={
          handleLogout
        }
      />


      {/* =================================================
          MOBILE MENU
      ================================================== */}

      <MobileMenu
        isOpen={
          mobileMenuOpen
        }

        onToggle={() =>
          setMobileMenuOpen(
            (current) => !current
          )
        }

        onClose={() =>
          setMobileMenuOpen(false)
        }
      />


      {/* =================================================
          CONTENIDO
      ================================================== */}

      <main
        className="
          min-h-screen

          px-4
          pb-24

          sm:px-6

          md:ml-20
          md:px-6
          md:pb-12

          lg:ml-64
          lg:px-9
        "
      >

        {/* =================================================
            TOPBAR
        ================================================== */}

        <header
          className="
            flex
            min-h-20
            items-center
            justify-between
            gap-4
            py-3
          "
        >

          <div>

            <span
              className="
                text-[10px]
                font-bold
                tracking-[0.2em]
                text-canwash-muted
              "
            >
              CAN WASH
            </span>


            <h2
              className="
                mt-1
                text-xl
                font-bold
                text-canwash-dark
              "
            >
              Mi perfil
            </h2>

          </div>


          <button
            type="button"

            onClick={
              loadProfile
            }

            className="
              flex
              items-center
              gap-2

              rounded-xl

              border
              border-canwash-light

              bg-white

              px-4
              py-2.5

              text-sm
              font-semibold
              text-canwash-dark

              transition

              hover:bg-canwash-cream
            "
          >
            <RefreshCw size={17} />

            <span
              className="
                hidden
                sm:inline
              "
            >
              Actualizar
            </span>
          </button>

        </header>


        {/* =================================================
            ENCABEZADO PERFIL
        ================================================== */}

        <section
          className="
            relative
            overflow-hidden

            rounded-3xl

            bg-gradient-to-br
            from-canwash-light
            to-canwash-cream

            p-6

            shadow-lg
            shadow-canwash-dark/5

            sm:p-8
          "
        >

          <div
            className="
              relative
              z-10

              flex
              flex-col
              gap-5

              sm:flex-row
              sm:items-center
            "
          >

            {/* AVATAR */}

            <div
              className="
                grid
                h-20
                w-20
                shrink-0
                place-items-center

                rounded-2xl

                bg-canwash-dark

                text-3xl
                font-bold
                text-white

                shadow-lg
              "
            >
              {user?.nombre
                ?.charAt(0)
                .toUpperCase() ||
                "U"}
            </div>


            <div>

              <span
                className="
                  text-[10px]
                  font-bold
                  tracking-[0.2em]
                  text-canwash-muted
                "
              >
                PERFIL DE USUARIO
              </span>


              <h1
                className="
                  mt-1

                  text-2xl
                  font-bold
                  text-canwash-dark

                  sm:text-3xl
                "
              >
                {user?.nombre ||
                  "Usuario"}
              </h1>


              <p
                className="
                  mt-1
                  text-sm
                  text-canwash-muted
                "
              >
                {user?.email}
              </p>


              <span
                className="
                  mt-3

                  inline-flex
                  items-center
                  gap-2

                  rounded-full

                  bg-white/70

                  px-3
                  py-1.5

                  text-xs
                  font-semibold
                  text-canwash-dark
                "
              >

                <ShieldCheck size={15} />

                {role}

              </span>

            </div>

          </div>


          <PawPrint
            className="
              absolute
              -bottom-16
              right-8

              hidden
              h-52
              w-52

              text-canwash/20

              sm:block
            "
          />

        </section>


        {/* =================================================
            MENSAJES
        ================================================== */}

        {error && (
          <div
            className="
              mt-5

              flex
              items-center
              gap-3

              rounded-xl

              border
              border-red-200

              bg-red-50

              p-4

              text-sm
              text-red-700
            "
          >
            <AlertCircle size={19} />

            {error}
          </div>
        )}


        {success && (
          <div
            className="
              mt-5

              rounded-xl

              border
              border-emerald-200

              bg-emerald-50

              p-4

              text-sm
              font-medium
              text-emerald-700
            "
          >
            {success}
          </div>
        )}


        {/* =================================================
            GRID PRINCIPAL
        ================================================== */}

        <div
          className="
            mt-6

            grid
            grid-cols-1
            gap-6

            xl:grid-cols-3
          "
        >

          {/* ===============================================
              INFORMACIÓN PERSONAL
          ================================================ */}

          <section
            className="
              rounded-2xl

              bg-white

              p-6

              shadow-lg
              shadow-canwash-dark/5

              xl:col-span-2
            "
          >

            <h2
              className="
                text-xl
                font-bold
                text-canwash-dark
              "
            >
              Información personal
            </h2>


            <p
              className="
                mt-1
                text-sm
                text-canwash-muted
              "
            >
              Información asociada a tu
              cuenta de Can Wash.
            </p>


            {/* =============================================
                DATOS GENERALES
            ============================================== */}

            <div
              className="
                mt-6

                grid
                grid-cols-1
                gap-4

                sm:grid-cols-2
              "
            >

              <ProfileInformation
                icon={
                  <User size={19} />
                }

                label="Nombre"

                value={
                  user?.nombre
                }
              />


              <ProfileInformation
                icon={
                  <Mail size={19} />
                }

                label="Correo electrónico"

                value={
                  user?.email
                }
              />


              <ProfileInformation
                icon={
                  <ShieldCheck
                    size={19}
                  />
                }

                label="Tipo de cuenta"

                value={
                  role
                }
              />

            </div>


            {/* =============================================
                CAMPOS CLIENTE
            ============================================== */}

            {isClient && (
              <form
                onSubmit={
                  handleSubmit
                }

                className="mt-7"
              >

                <div
                  className="
                    grid
                    grid-cols-1
                    gap-x-5

                    sm:grid-cols-2
                  "
                >

                  {/* TELÉFONO */}

                  <div>

                    <FormLabel>
                      Teléfono
                    </FormLabel>


                    <div
                      className="
                        flex
                        items-center
                        gap-3

                        rounded-xl

                        border
                        border-canwash-light

                        px-4

                        focus-within:ring-4
                        focus-within:ring-canwash/20
                      "
                    >

                      <Phone
                        size={19}
                        className="text-canwash"
                      />


                      <input
                        name="telefono"

                        value={
                          form.telefono
                        }

                        onChange={
                          handleChange
                        }

                        placeholder="981 123 4567"

                        className={
                          innerInputClasses
                        }
                      />

                    </div>

                  </div>


                  {/* COLONIA */}

                  <div>

                    <FormLabel>
                      Colonia
                    </FormLabel>


                    <div
                      className="
                        flex
                        items-center
                        gap-3

                        rounded-xl

                        border
                        border-canwash-light

                        px-4

                        focus-within:ring-4
                        focus-within:ring-canwash/20
                      "
                    >

                      <MapPin
                        size={19}
                        className="text-canwash"
                      />


                      <input
                        name="colonia"

                        value={
                          form.colonia
                        }

                        onChange={
                          handleChange
                        }

                        placeholder="Ej. Santa Ana"

                        className={
                          innerInputClasses
                        }
                      />

                    </div>

                  </div>

                </div>


                {/* DIRECCIÓN */}

                <FormLabel>
                  Dirección
                </FormLabel>


                <textarea
                  name="direccion"

                  value={
                    form.direccion
                  }

                  onChange={
                    handleChange
                  }

                  placeholder="Calle, número y referencias"

                  className="
                    min-h-28
                    w-full
                    resize-y

                    rounded-xl

                    border
                    border-canwash-light

                    px-4
                    py-3

                    text-sm
                    text-canwash-text

                    outline-none

                    focus:border-canwash
                    focus:ring-4
                    focus:ring-canwash/20
                  "
                />


                <button
                  type="submit"

                  disabled={
                    saving
                  }

                  className="
                    mt-6

                    flex
                    items-center
                    justify-center
                    gap-2

                    rounded-xl

                    bg-canwash

                    px-5
                    py-3

                    text-sm
                    font-semibold
                    text-white

                    transition

                    hover:bg-[#7899A4]

                    disabled:opacity-60
                  "
                >

                  <Save size={18} />

                  {saving
                    ? "Guardando..."
                    : "Guardar cambios"}

                </button>

              </form>
            )}

          </section>


          {/* ===============================================
              SEGURIDAD
          ================================================ */}

          <section
            className="
              rounded-2xl

              bg-white

              p-6

              shadow-lg
              shadow-canwash-dark/5
            "
          >

            <div
              className="
                grid
                h-12
                w-12
                place-items-center

                rounded-xl

                bg-canwash-cream
                text-canwash-dark
              "
            >
              <KeyRound size={23} />
            </div>


            <h2
              className="
                mt-5
                text-lg
                font-bold
                text-canwash-dark
              "
            >
              Seguridad
            </h2>


            <p
              className="
                mt-2

                text-sm
                leading-6
                text-canwash-muted
              "
            >
              Administra las credenciales
              y seguridad de tu cuenta.
            </p>


            <button
              type="button"

              className="
                mt-6
                w-full

                rounded-xl

                bg-canwash-dark

                px-4
                py-3

                text-sm
                font-semibold
                text-white

                transition

                hover:bg-canwash
              "
            >
              Cambiar contraseña
            </button>

          </section>

        </div>


        {/* =================================================
            UBICACIÓN
            SOLO CLIENTE
        ================================================== */}

        {isClient && (
          <section className="mt-6">

            <div
              className="
                mb-4
              "
            >

              <span
                className="
                  text-[10px]
                  font-bold
                  tracking-[0.2em]
                  text-canwash-muted
                "
              >
                SERVICIO A DOMICILIO
              </span>


              <h2
                className="
                  mt-1
                  text-xl
                  font-bold
                  text-canwash-dark
                "
              >
                Ubicación del domicilio
              </h2>


              <p
                className="
                  mt-1
                  text-sm
                  text-canwash-muted
                "
              >
                Utiliza tu ubicación para
                facilitar la llegada de
                Can Wash durante el
                servicio.
              </p>

            </div>


            <LocationMap />

          </section>
        )}

      </main>

    </div>
  );
}


/* =========================================================
   INFORMACIÓN
========================================================= */

function ProfileInformation({
  icon,
  label,
  value,
}) {
  return (
    <div
      className="
        flex
        items-start
        gap-3

        rounded-xl

        bg-canwash-background

        p-4
      "
    >

      <div
        className="
          grid
          h-10
          w-10
          shrink-0
          place-items-center

          rounded-lg

          bg-white
          text-canwash
        "
      >
        {icon}
      </div>


      <div className="min-w-0">

        <span
          className="
            block

            text-[10px]
            font-semibold
            uppercase
            tracking-wide
            text-canwash-muted
          "
        >
          {label}
        </span>


        <strong
          className="
            mt-1
            block
            break-words

            text-sm
            text-canwash-dark
          "
        >
          {value ||
            "Sin registrar"}
        </strong>

      </div>

    </div>
  );
}


/* =========================================================
   LABEL
========================================================= */

function FormLabel({
  children,
}) {
  return (
    <label
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


const innerInputClasses = `
  min-w-0
  flex-1
  border-none
  bg-transparent
  py-3.5
  text-sm
  text-canwash-text
  outline-none
`;


export default Profile;