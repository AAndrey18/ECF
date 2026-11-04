import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Dog,
  LogOut,
  MapPin,
  PawPrint,
  Phone,
  Plus,
  RefreshCw,
  Save,
  Scissors,
  User,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import MobileMenu from "./mobileMenu";
import LocationMap from "./locationMap";


function ClientDashboard({ user, onLogout }) {
  // =====================================================
  // ESTADOS
  // =====================================================

  const [client, setClient] = useState(null);
  const [pets, setPets] = useState([]);
  const [appointments, setAppointments] = useState([]);

  const [view, setView] = useState("inicio");

  const [showProfileModal, setShowProfileModal] =
    useState(false);

  const [showPetModal, setShowPetModal] =
    useState(false);

  const [selectedPet, setSelectedPet] =
    useState(null);

  const [mobileMenuOpen, setMobileMenuOpen] =
    useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =====================================================
  // CARGAR DATOS
  // =====================================================

  const loadData = async () => {
    if (!user?.id_usuario) {
      setError(
        "No se encontró el usuario autenticado."
      );

      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // =================================================
      // PERFIL DEL CLIENTE
      // =================================================

      const {
        data: clientData,
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


      setClient(clientData);


      // =================================================
      // SI TODAVÍA NO TIENE PERFIL CLIENTE
      // =================================================

      if (!clientData) {
        setPets([]);
        setAppointments([]);
        return;
      }


      // =================================================
      // MASCOTAS
      // =================================================

      const {
        data: petsData,
        error: petsError,
      } = await supabase
        .from("mascotas")
        .select(`
          id_mascota,
          id_cliente,
          nombre,
          especie,
          raza,
          tamano,
          peso_kg,
          padecimientos,
          comportamiento,
          notas,
          fecha_registro
        `)
        .eq(
          "id_cliente",
          clientData.id_cliente
        )
        .order(
          "fecha_registro",
          {
            ascending: false,
          }
        );


      if (petsError) {
        throw petsError;
      }


      setPets(
        petsData || []
      );


      // =================================================
      // CITAS
      // =================================================

      const {
        data: appointmentsData,
        error: appointmentsError,
      } = await supabase
        .from("citas")
        .select(`
          id_cita,
          id_mascota,
          fecha,
          hora,
          direccion_servicio,
          colonia,
          costo_visita,
          estado,
          notas,

          mascotas (
            id_mascota,
            nombre,
            especie,
            raza,
            tamano
          ),

          detalle_cita (
            id_detalle,
            cantidad,
            precio,

            servicios (
              id_servicio,
              nombre,
              descripcion
            )
          )
        `)
        .eq(
          "id_cliente",
          clientData.id_cliente
        )
        .order(
          "fecha",
          {
            ascending: true,
          }
        )
        .order(
          "hora",
          {
            ascending: true,
          }
        );


      if (appointmentsError) {
        throw appointmentsError;
      }


      setAppointments(
        appointmentsData || []
      );

    } catch (loadError) {
      console.error(
        "Error cargando dashboard:",
        loadError
      );

      setError(
        "No fue posible cargar tu información."
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // CARGA INICIAL
  // =====================================================

  useEffect(() => {
    loadData();
  }, [user?.id_usuario]);


  // =====================================================
  // FECHA ACTUAL
  // =====================================================

  const today =
    new Date()
      .toISOString()
      .split("T")[0];


  // =====================================================
  // PRÓXIMAS CITAS
  // =====================================================

  const upcomingAppointments =
    useMemo(() => {
      return appointments.filter(
        (appointment) =>
          appointment.fecha >= today &&
          appointment.estado !==
            "CANCELADA"
      );
    }, [appointments, today]);


  // =====================================================
  // SERVICIOS COMPLETADOS
  // =====================================================

  const completedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.estado ===
        "COMPLETADA"
    ).length;


  // =====================================================
  // CAMBIAR VISTA
  // =====================================================

  const changeView = (newView) => {
    setView(newView);
    setMobileMenuOpen(false);
  };


  // =====================================================
  // ABRIR PERFIL
  // =====================================================

  const openProfile = () => {
    setShowProfileModal(true);
    setMobileMenuOpen(false);
  };


  // =====================================================
  // REGISTRAR MASCOTA
  // =====================================================

  const openPetRegistration = () => {
    setMobileMenuOpen(false);

    if (!client) {
      setShowProfileModal(true);
      return;
    }

    setSelectedPet(null);
    setShowPetModal(true);
  };


  // =====================================================
  // CERRAR SESIÓN
  //
  // App.jsx se encarga de Supabase Auth.
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


          <h2
            className="
              mt-6
              text-2xl
              font-bold
              text-canwash-dark
            "
          >
            Cargando Can Wash...
          </h2>


          <p
            className="
              mt-2
              text-sm
              text-canwash-muted
            "
          >
            Preparando tu información.
          </p>


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

      <aside
        className={`
          fixed
          left-0
          top-0
          z-50

          flex
          h-dvh
          w-72
          flex-col

          bg-gradient-to-b
          from-canwash
          to-[#7899A4]

          px-5
          py-8

          text-white

          shadow-2xl

          transition-transform
          duration-300
          ease-out

          ${
            mobileMenuOpen
              ? "translate-x-0"
              : "-translate-x-full"
          }

          md:w-20
          md:translate-x-0
          md:px-3

          lg:w-64
          lg:px-5
        `}
      >

        {/* LOGO */}

        <div
          className="
            flex
            items-center
            gap-3
            px-2

            md:justify-center

            lg:justify-start
          "
        >

          <PawPrint
            size={34}
            className="shrink-0"
          />


          <div
            className="
              md:hidden
              lg:block
            "
          >

            <strong
              className="
                block
                text-lg
                font-bold
              "
            >
              Can Wash
            </strong>


            <span
              className="
                mt-1
                block
                text-[10px]
                font-medium
                tracking-[0.15em]
                text-white/80
              "
            >
              PANEL DE CLIENTE
            </span>

          </div>

        </div>


        {/* =================================================
            NAVEGACIÓN
        ================================================== */}

        <nav
          className="
            mt-12
            flex
            flex-col
            gap-2
          "
        >

          {/* INICIO */}

          <SidebarButton
            active={
              view === "inicio"
            }

            icon={
              <PawPrint size={20} />
            }

            text="Inicio"

            onClick={() =>
              changeView("inicio")
            }
          />


          {/* MASCOTAS */}

          <SidebarButton
            active={
              view === "mascotas"
            }

            icon={
              <Dog size={20} />
            }

            text="Mis mascotas"

            onClick={() =>
              changeView("mascotas")
            }
          />


          {/* CITAS */}

          <SidebarButton
            active={
              view === "citas"
            }

            icon={
              <CalendarDays
                size={20}
              />
            }

            text="Mis citas"

            onClick={() =>
              changeView("citas")
            }
          />


          {/* UBICACIÓN */}

          <SidebarButton
            active={
              view === "ubicacion"
            }

            icon={
              <MapPin size={20} />
            }

            text="Mi ubicación"

            onClick={() =>
              changeView("ubicacion")
            }
          />


          {/* PERFIL */}

          <SidebarButton
            icon={
              <User size={20} />
            }

            text="Mi perfil"

            onClick={
              openProfile
            }
          />

        </nav>


        {/* =================================================
            LOGOUT
        ================================================== */}

        <button
          type="button"

          onClick={
            handleLogout
          }

          className="
            mt-auto

            flex
            w-full
            items-center
            gap-3

            rounded-xl

            px-4
            py-3

            text-sm
            font-medium
            text-white

            transition

            hover:bg-white/15

            focus:outline-none
            focus-visible:ring-2
            focus-visible:ring-white/60

            md:justify-center
            md:px-2

            lg:justify-start
            lg:px-4
          "
        >

          <LogOut
            size={20}
            className="shrink-0"
          />


          <span
            className="
              md:hidden
              lg:inline
            "
          >
            Cerrar sesión
          </span>

        </button>

      </aside>


      {/* =================================================
          MENÚ MÓVIL
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

          <div
            className="
              hidden
              sm:block
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
              {getViewTitle(view)}
            </h2>

          </div>


          <div
            className="
              ml-auto
              flex
              items-center
              gap-3
              sm:gap-5
            "
          >

            {/* ACTUALIZAR */}

            <button
              type="button"

              onClick={
                loadData
              }

              className="
                grid
                h-11
                w-11
                place-items-center

                rounded-xl

                border
                border-canwash-light

                bg-white
                text-canwash-dark

                transition

                hover:bg-canwash-cream

                focus:outline-none
                focus-visible:ring-4
                focus-visible:ring-canwash/20

                sm:flex
                sm:w-auto
                sm:gap-2
                sm:px-4
                sm:text-sm
                sm:font-semibold
              "
            >

              <RefreshCw
                size={18}
              />


              <span
                className="
                  hidden
                  sm:inline
                "
              >
                Actualizar
              </span>

            </button>


            {/* USUARIO */}

            <div
              className="
                flex
                items-center
                gap-3
              "
            >

              <div
                className="
                  grid
                  h-11
                  w-11
                  shrink-0
                  place-items-center

                  rounded-full

                  bg-canwash-light

                  font-bold
                  text-canwash-dark
                "
              >
                {user?.nombre
                  ?.charAt(0)
                  .toUpperCase() || "C"}
              </div>


              <div
                className="
                  hidden
                  sm:block
                "
              >

                <strong
                  className="
                    block
                    max-w-44
                    truncate
                    text-sm
                    text-canwash-dark
                  "
                >
                  {user?.nombre ||
                    "Cliente"}
                </strong>


                <span
                  className="
                    mt-1
                    block
                    text-xs
                    text-canwash-muted
                  "
                >
                  Cliente
                </span>

              </div>

            </div>

          </div>

        </header>


        {/* =================================================
            ERROR
        ================================================== */}

        {error && (
          <div
            role="alert"

            className="
              mb-5

              flex
              items-center
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
            "
          >

            <AlertCircle
              size={20}
              className="shrink-0"
            />

            {error}

          </div>
        )}


        {/* =================================================
            INICIO
        ================================================== */}

        {view === "inicio" && (
          <>

            {/* BIENVENIDA */}

            <section
              className="
                relative
                overflow-hidden

                rounded-3xl

                bg-gradient-to-br
                from-canwash-light
                to-canwash-cream

                px-6
                py-8

                shadow-lg
                shadow-canwash-dark/5

                sm:px-8
                sm:py-10
              "
            >

              <div
                className="
                  relative
                  z-10
                  max-w-xl
                "
              >

                <span
                  className="
                    text-[11px]
                    font-bold
                    tracking-[0.2em]
                    text-canwash-dark
                  "
                >
                  BIENVENIDO A CAN WASH
                </span>


                <h1
                  className="
                    mt-3

                    text-3xl
                    font-bold
                    tracking-tight
                    text-canwash-dark

                    sm:text-4xl
                  "
                >
                  ¡Hola,{" "}
                  {user?.nombre ||
                    "Cliente"}!
                </h1>


                <p
                  className="
                    mt-3

                    text-sm
                    leading-7
                    text-canwash-text

                    sm:text-base
                  "
                >
                  Registra a tus mascotas,
                  consulta sus citas y
                  configura la ubicación para
                  tus servicios a domicilio.
                </p>


                <button
                  type="button"

                  onClick={
                    openPetRegistration
                  }

                  className="
                    mt-6

                    flex
                    items-center
                    gap-2

                    rounded-xl

                    bg-canwash-dark

                    px-5
                    py-3

                    text-sm
                    font-semibold
                    text-white

                    shadow-lg
                    shadow-canwash-dark/20

                    transition

                    hover:-translate-y-0.5
                    hover:bg-canwash
                  "
                >

                  <Plus size={19} />

                  Registrar mascota

                </button>

              </div>


              <PawPrint
                className="
                  absolute
                  -bottom-16
                  right-8

                  hidden
                  h-60
                  w-60

                  text-canwash/20

                  sm:block
                "
              />

            </section>


            {/* ESTADÍSTICAS */}

            <section
              className="
                mt-5

                grid
                grid-cols-1
                gap-4

                sm:grid-cols-2

                xl:grid-cols-3
              "
            >

              <ClientStat
                icon={
                  <Dog />
                }

                title="Mis mascotas"

                value={
                  pets.length
                }

                text="Mascotas registradas"
              />


              <ClientStat
                icon={
                  <CalendarDays />
                }

                title="Próximas citas"

                value={
                  upcomingAppointments.length
                }

                text="Servicios programados"
              />


              <ClientStat
                icon={
                  <CheckCircle2 />
                }

                title="Servicios realizados"

                value={
                  completedAppointments
                }

                text="Citas completadas"
              />

            </section>


            {/* PERFIL INCOMPLETO */}

            {!client && (
              <section
                className="
                  mt-5

                  flex
                  flex-col
                  gap-4

                  rounded-2xl

                  border
                  border-amber-200

                  bg-amber-50

                  p-5

                  text-amber-800

                  sm:flex-row
                  sm:items-center
                "
              >

                <AlertCircle
                  size={25}
                  className="shrink-0"
                />


                <div className="flex-1">

                  <h3
                    className="
                      font-bold
                      text-canwash-dark
                    "
                  >
                    Completa tu perfil
                  </h3>


                  <p
                    className="
                      mt-1
                      text-xs
                      leading-5
                    "
                  >
                    Antes de registrar a tu
                    mascota necesitamos tu
                    teléfono, colonia y
                    dirección.
                  </p>

                </div>


                <button
                  type="button"

                  onClick={
                    openProfile
                  }

                  className="
                    rounded-xl

                    bg-canwash-dark

                    px-4
                    py-2.5

                    text-sm
                    font-semibold
                    text-white

                    transition

                    hover:bg-canwash
                  "
                >
                  Completar perfil
                </button>

              </section>
            )}


            {/* MASCOTAS */}

            <PetSection
              pets={pets}

              onAdd={
                openPetRegistration
              }

              onSelectPet={
                setSelectedPet
              }
            />


            {/* PRÓXIMAS CITAS */}

            {upcomingAppointments.length >
              0 && (
              <AppointmentsSection
                title="Próximas citas"

                appointments={
                  upcomingAppointments
                }
              />
            )}

          </>
        )}


        {/* =================================================
            MASCOTAS
        ================================================== */}

        {view === "mascotas" && (
          <PetSection
            pets={pets}

            onAdd={
              openPetRegistration
            }

            onSelectPet={
              setSelectedPet
            }
          />
        )}


        {/* =================================================
            CITAS
        ================================================== */}

        {view === "citas" && (
          <AppointmentsSection
            title="Mis citas"

            appointments={
              appointments
            }
          />
        )}


        {/* =================================================
            UBICACIÓN
            SOLO EXISTE EN CLIENT DASHBOARD
        ================================================== */}

        {view === "ubicacion" && (
          <section className="py-2">

            <div className="mb-6">

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


              <h1
                className="
                  mt-1

                  text-3xl
                  font-bold
                  tracking-tight
                  text-canwash-dark
                "
              >
                Mi ubicación
              </h1>


              <p
                className="
                  mt-2
                  max-w-2xl

                  text-sm
                  leading-6
                  text-canwash-muted
                "
              >
                Comparte tu ubicación para
                facilitar la programación y
                llegada de Can Wash durante
                los servicios a domicilio.
              </p>

            </div>


            <LocationMap />

          </section>
        )}

      </main>


      {/* =================================================
          MODAL PERFIL
      ================================================== */}

      {showProfileModal && (
        <ProfileModal
          user={user}

          client={client}

          onClose={() =>
            setShowProfileModal(false)
          }

          onSaved={() => {
            setShowProfileModal(false);
            loadData();
          }}
        />
      )}


      {/* =================================================
          MODAL REGISTRAR MASCOTA
      ================================================== */}

      {showPetModal && client && (
        <PetModal
          client={client}

          onClose={() =>
            setShowPetModal(false)
          }

          onSaved={() => {
            setShowPetModal(false);
            loadData();
          }}
        />
      )}


      {/* =================================================
          DETALLE MASCOTA
      ================================================== */}

      {selectedPet && (
        <PetDetailsModal
          pet={selectedPet}

          onClose={() =>
            setSelectedPet(null)
          }
        />
      )}

    </div>
  );
}


/* =========================================================
   TÍTULO DE VISTA
========================================================= */

function getViewTitle(view) {
  switch (view) {
    case "mascotas":
      return "Mis mascotas";

    case "citas":
      return "Mis citas";

    case "ubicacion":
      return "Mi ubicación";

    default:
      return "Mi cuenta";
  }
}


/* =========================================================
   SIDEBAR BUTTON
========================================================= */

function SidebarButton({
  active = false,
  icon,
  text,
  onClick,
}) {
  return (
    <button
      type="button"

      onClick={
        onClick
      }

      title={
        text
      }

      className={`
        flex
        w-full
        items-center
        gap-3

        rounded-xl

        px-4
        py-3

        text-sm
        font-medium
        text-white

        transition

        focus:outline-none
        focus-visible:ring-2
        focus-visible:ring-white/60

        md:justify-center
        md:px-2

        lg:justify-start
        lg:px-4

        ${
          active
            ? "bg-white/20 font-semibold"
            : "hover:bg-white/15"
        }
      `}
    >

      <span className="shrink-0">
        {icon}
      </span>


      <span
        className="
          md:hidden
          lg:inline
        "
      >
        {text}
      </span>

    </button>
  );
}


/* =========================================================
   ESTADÍSTICA
========================================================= */

function ClientStat({
  icon,
  title,
  value,
  text,
}) {
  return (
    <article
      className="
        flex
        min-w-0
        items-center
        gap-4

        rounded-2xl

        bg-white

        p-5

        shadow-lg
        shadow-canwash-dark/5
      "
    >

      <div
        className="
          grid
          h-12
          w-12
          shrink-0
          place-items-center

          rounded-xl

          bg-canwash-cream
          text-canwash-dark
        "
      >
        {icon}
      </div>


      <div className="min-w-0">

        <span
          className="
            text-xs
            text-canwash-muted
          "
        >
          {title}
        </span>


        <h2
          className="
            my-1
            text-3xl
            font-bold
            text-canwash-dark
          "
        >
          {value}
        </h2>


        <small
          className="
            text-xs
            text-canwash-muted
          "
        >
          {text}
        </small>

      </div>

    </article>
  );
}


/* =========================================================
   MASCOTAS
========================================================= */

function PetSection({
  pets,
  onAdd,
  onSelectPet,
}) {
  return (
    <section
      className="
        mt-5

        rounded-2xl

        bg-white

        p-5

        shadow-lg
        shadow-canwash-dark/5

        sm:p-7
      "
    >

      <div
        className="
          flex
          flex-col
          gap-4

          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >

        <div>

          <h2
            className="
              text-xl
              font-bold
              text-canwash-dark
            "
          >
            Mis mascotas
          </h2>


          <p
            className="
              mt-1
              text-sm
              text-canwash-muted
            "
          >
            Mascotas registradas para
            recibir servicios de Can Wash.
          </p>

        </div>


        <button
          type="button"

          onClick={
            onAdd
          }

          className="
            flex
            items-center
            justify-center
            gap-2

            rounded-xl

            bg-canwash

            px-4
            py-3

            text-sm
            font-semibold
            text-white

            transition

            hover:-translate-y-0.5
            hover:bg-[#7899A4]
          "
        >

          <Plus size={18} />

          Registrar mascota

        </button>

      </div>


      {pets.length === 0 ? (

        <EmptyState
          icon={
            <PawPrint size={45} />
          }

          title="No tienes mascotas registradas"

          text="Registra al perro o gato que recibirá el servicio."
        />

      ) : (

        <div
          className="
            mt-6

            grid
            grid-cols-1
            gap-4

            sm:grid-cols-2

            xl:grid-cols-3
          "
        >

          {pets.map((pet) => (

            <PetCard
              key={
                pet.id_mascota
              }

              pet={pet}

              onClick={() =>
                onSelectPet(pet)
              }
            />

          ))}

        </div>
      )}

    </section>
  );
}


/* =========================================================
   TARJETA MASCOTA
========================================================= */

function PetCard({
  pet,
  onClick,
}) {
  return (
    <button
      type="button"

      onClick={
        onClick
      }

      className="
        group

        w-full

        rounded-2xl

        border
        border-canwash-cream

        bg-canwash-background

        p-5

        text-left

        transition

        hover:-translate-y-1
        hover:border-canwash-light
        hover:shadow-lg
        hover:shadow-canwash-dark/10

        focus:outline-none
        focus-visible:ring-4
        focus-visible:ring-canwash/20
      "
    >

      <div
        className="
          grid
          h-14
          w-14
          place-items-center

          rounded-xl

          bg-canwash-light
          text-canwash-dark

          transition

          group-hover:bg-canwash
          group-hover:text-white
        "
      >

        {pet.especie === "GATO" ? (
          <PawPrint size={29} />
        ) : (
          <Dog size={29} />
        )}

      </div>


      <h3
        className="
          mt-4
          text-lg
          font-bold
          text-canwash-dark
        "
      >
        {pet.nombre}
      </h3>


      <span
        className="
          mt-1
          block
          text-[10px]
          font-semibold
          tracking-[0.15em]
          text-canwash-muted
        "
      >
        {pet.especie}
      </span>


      <div
        className="
          mt-5

          grid
          grid-cols-2
          gap-2
        "
      >

        <PetData
          title="Raza"

          value={
            pet.raza ||
            "Sin especificar"
          }
        />


        <PetData
          title="Tamaño"

          value={
            pet.tamano ||
            "Sin especificar"
          }
        />


        {pet.peso_kg && (
          <PetData
            title="Peso"

            value={
              `${pet.peso_kg} kg`
            }
          />
        )}

      </div>


      {pet.padecimientos && (
        <div
          className="
            mt-4

            flex
            items-start
            gap-2

            rounded-xl

            bg-amber-50

            p-3

            text-xs
            leading-5
            text-amber-800
          "
        >

          <AlertCircle
            size={16}
            className="
              mt-0.5
              shrink-0
            "
          />

          <span>
            {pet.padecimientos}
          </span>

        </div>
      )}

    </button>
  );
}


/* =========================================================
   DATO MASCOTA
========================================================= */

function PetData({
  title,
  value,
}) {
  return (
    <div
      className="
        min-w-0

        rounded-xl

        bg-white

        p-3
      "
    >

      <span
        className="
          block
          text-[10px]
          text-canwash-muted
        "
      >
        {title}
      </span>


      <strong
        className="
          mt-1
          block
          truncate
          text-xs
          text-canwash-dark
        "
      >
        {value}
      </strong>

    </div>
  );
}


/* =========================================================
   CITAS
========================================================= */

function AppointmentsSection({
  appointments,
  title = "Mis citas",
}) {
  return (
    <section
      className="
        mt-5

        rounded-2xl

        bg-white

        p-5

        shadow-lg
        shadow-canwash-dark/5

        sm:p-7
      "
    >

      <div>

        <h2
          className="
            text-xl
            font-bold
            text-canwash-dark
          "
        >
          {title}
        </h2>


        <p
          className="
            mt-1
            text-sm
            text-canwash-muted
          "
        >
          Consulta los servicios
          programados para tus mascotas.
        </p>

      </div>


      {appointments.length === 0 ? (

        <EmptyState
          icon={
            <CalendarDays
              size={45}
            />
          }

          title="No tienes citas"

          text="Cuando tengas un servicio programado aparecerá aquí."
        />

      ) : (

        <div
          className="
            mt-6
            flex
            flex-col
            gap-3
          "
        >

          {appointments.map(
            (appointment) => (

              <AppointmentCard
                key={
                  appointment.id_cita
                }

                appointment={
                  appointment
                }
              />

            )
          )}

        </div>
      )}

    </section>
  );
}


/* =========================================================
   TARJETA CITA
========================================================= */

function AppointmentCard({
  appointment,
}) {
  return (
    <article
      className="
        flex
        flex-col
        gap-4

        rounded-2xl

        border
        border-canwash-cream

        bg-canwash-background

        p-5

        transition

        hover:border-canwash-light
        hover:shadow-md

        sm:flex-row
      "
    >

      <div
        className="
          flex
          items-center
          gap-3

          border-b
          border-canwash-cream

          pb-4

          sm:min-w-40
          sm:border-b-0
          sm:border-r
          sm:pb-0
          sm:pr-5
        "
      >

        <CalendarDays
          size={20}
          className="
            shrink-0
            text-canwash
          "
        />


        <div>

          <strong
            className="
              block
              text-xs
              text-canwash-dark
            "
          >
            {formatDate(
              appointment.fecha
            )}
          </strong>


          <span
            className="
              mt-1
              flex
              items-center
              gap-1
              text-xs
              text-canwash-muted
            "
          >

            <Clock size={13} />

            {formatTime(
              appointment.hora
            )}

          </span>

        </div>

      </div>


      <div
        className="
          min-w-0
          flex-1
        "
      >

        <div
          className="
            flex
            flex-col
            gap-3

            sm:flex-row
            sm:items-start
            sm:justify-between
          "
        >

          <div>

            <h3
              className="
                text-lg
                font-bold
                text-canwash-dark
              "
            >
              {appointment
                .mascotas
                ?.nombre ||
                "Mascota"}
            </h3>


            <span
              className="
                mt-1
                block
                text-xs
                text-canwash-muted
              "
            >
              {appointment
                .mascotas
                ?.raza ||
                appointment
                  .mascotas
                  ?.especie ||
                "Sin información"}
            </span>

          </div>


          <StatusBadge
            status={
              appointment.estado
            }
          />

        </div>


        {appointment
          .detalle_cita
          ?.length > 0 && (
          <div
            className="
              mt-4
              flex
              flex-wrap
              gap-2
            "
          >

            {appointment
              .detalle_cita
              .map((detail) => (

                <span
                  key={
                    detail.id_detalle
                  }

                  className="
                    flex
                    items-center
                    gap-1.5

                    rounded-lg

                    bg-white

                    px-3
                    py-2

                    text-xs
                    font-semibold
                    text-canwash-dark
                  "
                >

                  <Scissors
                    size={14}
                  />

                  {detail
                    .servicios
                    ?.nombre ||
                    "Servicio"}

                </span>

              ))}

          </div>
        )}


        <div
          className="
            mt-4

            flex
            items-start
            gap-2

            text-xs
            leading-5
            text-canwash-muted
          "
        >

          <MapPin
            size={16}
            className="
              mt-0.5
              shrink-0
              text-canwash
            "
          />

          <span>
            {appointment
              .direccion_servicio ||
              appointment.colonia ||
              "Dirección por confirmar"}
          </span>

        </div>

      </div>

    </article>
  );
}


/* =========================================================
   EMPTY STATE
========================================================= */

function EmptyState({
  icon,
  title,
  text,
}) {
  return (
    <div
      className="
        px-5
        py-14
        text-center
      "
    >

      <div
        className="
          mx-auto
          flex
          justify-center
          text-canwash
        "
      >
        {icon}
      </div>


      <h3
        className="
          mt-3
          font-bold
          text-canwash-dark
        "
      >
        {title}
      </h3>


      <p
        className="
          mx-auto
          mt-2
          max-w-md
          text-sm
          leading-6
          text-canwash-muted
        "
      >
        {text}
      </p>

    </div>
  );
}


/* =========================================================
   MODAL PERFIL
========================================================= */

function ProfileModal({
  user,
  client,
  onClose,
  onSaved,
}) {
  const [form, setForm] =
    useState({
      telefono:
        client?.telefono || "",

      colonia:
        client?.colonia || "",

      direccion:
        client?.direccion || "",
    });


  const [saving, setSaving] =
    useState(false);

  const [formError, setFormError] =
    useState("");


  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError("");
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    if (
      !form.telefono.trim() ||
      !form.colonia.trim()
    ) {
      setFormError(
        "Teléfono y colonia son obligatorios."
      );

      return;
    }


    setSaving(true);
    setFormError("");


    try {
      if (client) {
        const {
          error: updateError,
        } = await supabase
          .from("clientes")
          .update({
            telefono:
              form.telefono.trim(),

            colonia:
              form.colonia.trim(),

            direccion:
              form.direccion
                .trim() ||
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
              form.colonia.trim(),

            direccion:
              form.direccion
                .trim() ||
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


      onSaved();

    } catch (saveError) {
      console.error(
        "Error guardando perfil:",
        saveError
      );

      setFormError(
        "No fue posible guardar tu información."
      );

    } finally {
      setSaving(false);
    }
  };


  return (
    <ModalBackground
      onClose={onClose}
    >

      <ModalHeader
        label="MI INFORMACIÓN"
        title="Datos del cliente"
        onClose={onClose}
      />


      <form
        onSubmit={
          handleSubmit
        }

        className="mt-6"
      >

        <FormLabel>
          Nombre
        </FormLabel>


        <input
          value={
            user.nombre || ""
          }

          disabled

          className={
            inputClasses
          }
        />


        <FormLabel>
          Correo
        </FormLabel>


        <input
          value={
            user.email || ""
          }

          disabled

          className={
            inputClasses
          }
        />


        <FormLabel>
          WhatsApp / Teléfono *
        </FormLabel>


        <IconInput
          icon={
            <Phone size={19} />
          }
        >

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

        </IconInput>


        <FormLabel>
          Colonia *
        </FormLabel>


        <IconInput
          icon={
            <MapPin size={19} />
          }
        >

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

        </IconInput>


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

          className={
            textareaClasses
          }
        />


        {formError && (
          <FormError>
            {formError}
          </FormError>
        )}


        <SubmitButton
          loading={
            saving
          }

          text="Guardar información"

          loadingText="Guardando..."
        />

      </form>

    </ModalBackground>
  );
}


/* =========================================================
   MODAL REGISTRAR MASCOTA
========================================================= */

function PetModal({
  client,
  onClose,
  onSaved,
}) {
  const [form, setForm] =
    useState({
      nombre: "",
      especie: "PERRO",
      raza: "",
      tamano: "MEDIANO",
      peso_kg: "",
      padecimientos: "",
      comportamiento: "",
      notas: "",
    });


  const [saving, setSaving] =
    useState(false);

  const [formError, setFormError] =
    useState("");


  const handleChange = (e) => {
    const {
      name,
      value,
    } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setFormError("");
  };


  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!form.nombre.trim()) {
      setFormError(
        "Ingresa el nombre de tu mascota."
      );

      return;
    }


    setSaving(true);
    setFormError("");


    try {
      const {
        error: insertError,
      } = await supabase
        .from("mascotas")
        .insert({
          id_cliente:
            client.id_cliente,

          nombre:
            form.nombre.trim(),

          especie:
            form.especie,

          raza:
            form.raza.trim() ||
            null,

          tamano:
            form.tamano,

          peso_kg:
            form.peso_kg
              ? Number(
                  form.peso_kg
                )
              : null,

          padecimientos:
            form.padecimientos
              .trim() ||
            null,

          comportamiento:
            form.comportamiento
              .trim() ||
            null,

          notas:
            form.notas
              .trim() ||
            null,
        });


      if (insertError) {
        throw insertError;
      }


      onSaved();

    } catch (saveError) {
      console.error(
        "Error registrando mascota:",
        saveError
      );

      setFormError(
        "No fue posible registrar la mascota."
      );

    } finally {
      setSaving(false);
    }
  };


  return (
    <ModalBackground
      onClose={onClose}
    >

      <ModalHeader
        label="CAN WASH"
        title="Registrar mascota"
        onClose={onClose}
      />


      <p
        className="
          mt-5
          text-sm
          leading-6
          text-canwash-muted
        "
      >
        Registra la información que
        necesitamos conocer antes de
        realizar el baño.
      </p>


      <form
        onSubmit={
          handleSubmit
        }

        className="mt-5"
      >

        <div
          className="
            grid
            grid-cols-1
            gap-x-5

            sm:grid-cols-2
          "
        >

          <div>

            <FormLabel>
              Nombre *
            </FormLabel>


            <input
              name="nombre"

              value={
                form.nombre
              }

              onChange={
                handleChange
              }

              placeholder="Ej. Max"

              className={
                inputClasses
              }
            />

          </div>


          <div>

            <FormLabel>
              Especie *
            </FormLabel>


            <select
              name="especie"

              value={
                form.especie
              }

              onChange={
                handleChange
              }

              className={
                inputClasses
              }
            >

              <option value="PERRO">
                Perro
              </option>

              <option value="GATO">
                Gato
              </option>

            </select>

          </div>


          <div>

            <FormLabel>
              Raza
            </FormLabel>


            <input
              name="raza"

              value={
                form.raza
              }

              onChange={
                handleChange
              }

              placeholder="Ej. French Poodle"

              className={
                inputClasses
              }
            />

          </div>


          <div>

            <FormLabel>
              Tamaño *
            </FormLabel>


            <select
              name="tamano"

              value={
                form.tamano
              }

              onChange={
                handleChange
              }

              className={
                inputClasses
              }
            >

              <option value="CHICO">
                Chico
              </option>

              <option value="MEDIANO">
                Mediano
              </option>

              <option value="GRANDE">
                Grande
              </option>

              <option value="GIGANTE">
                Gigante
              </option>

            </select>

          </div>


          <div>

            <FormLabel>
              Peso aproximado
            </FormLabel>


            <input
              name="peso_kg"

              type="number"

              min="0"

              step="0.1"

              value={
                form.peso_kg
              }

              onChange={
                handleChange
              }

              placeholder="Ej. 12.5"

              className={
                inputClasses
              }
            />

          </div>

        </div>


        <FormLabel>
          ¿Tiene algún padecimiento?
        </FormLabel>


        <textarea
          name="padecimientos"

          value={
            form.padecimientos
          }

          onChange={
            handleChange
          }

          placeholder="Epilepsia, problemas cardíacos, alergias, etc."

          className={
            textareaClasses
          }
        />


        <FormLabel>
          ¿Cómo es su comportamiento?
        </FormLabel>


        <textarea
          name="comportamiento"

          value={
            form.comportamiento
          }

          onChange={
            handleChange
          }

          placeholder="Tranquilo, nervioso, agresivo, intenta morder..."

          className={
            textareaClasses
          }
        />


        <FormLabel>
          Observaciones del pelaje
        </FormLabel>


        <textarea
          name="notas"

          value={
            form.notas
          }

          onChange={
            handleChange
          }

          placeholder="Nudos, doble capa, pelaje apelmazado, sensibilidad..."

          className={
            textareaClasses
          }
        />


        {formError && (
          <FormError>
            {formError}
          </FormError>
        )}


        <SubmitButton
          loading={
            saving
          }

          text="Registrar mascota"

          loadingText="Registrando..."
        />

      </form>

    </ModalBackground>
  );
}


/* =========================================================
   DETALLE MASCOTA
========================================================= */

function PetDetailsModal({
  pet,
  onClose,
}) {
  return (
    <ModalBackground
      onClose={onClose}
    >

      <ModalHeader
        label="MASCOTA"
        title={
          pet.nombre
        }
        onClose={
          onClose
        }
      />


      <div
        className="
          mx-auto
          mt-6

          grid
          h-20
          w-20
          place-items-center

          rounded-2xl

          bg-canwash-light
          text-canwash-dark
        "
      >

        {pet.especie === "GATO" ? (
          <PawPrint size={42} />
        ) : (
          <Dog size={42} />
        )}

      </div>


      <div
        className="
          mt-6

          grid
          grid-cols-1
          gap-3

          sm:grid-cols-2
        "
      >

        <Detail
          title="Especie"

          value={
            pet.especie
          }
        />


        <Detail
          title="Raza"

          value={
            pet.raza ||
            "Sin especificar"
          }
        />


        <Detail
          title="Tamaño"

          value={
            pet.tamano ||
            "Sin especificar"
          }
        />


        <Detail
          title="Peso"

          value={
            pet.peso_kg
              ? `${pet.peso_kg} kg`
              : "Sin especificar"
          }
        />

      </div>


      <DetailSection
        title="Padecimientos"

        text={
          pet.padecimientos ||
          "No se registraron padecimientos."
        }
      />


      <DetailSection
        title="Comportamiento"

        text={
          pet.comportamiento ||
          "Sin observaciones."
        }
      />


      <DetailSection
        title="Observaciones"

        text={
          pet.notas ||
          "Sin observaciones."
        }
      />

    </ModalBackground>
  );
}


/* =========================================================
   MODAL BASE
========================================================= */

function ModalBackground({
  children,
  onClose,
}) {
  return (
    <div
      onClick={
        onClose
      }

      className="
        fixed
        inset-0
        z-[100]

        flex
        items-center
        justify-center

        bg-canwash-dark/50

        p-3

        backdrop-blur-sm

        sm:p-6
      "
    >

      <div
        onClick={(e) =>
          e.stopPropagation()
        }

        className="
          max-h-[94dvh]
          w-full
          max-w-2xl

          overflow-y-auto

          rounded-2xl

          bg-white

          p-5

          shadow-2xl
          shadow-canwash-dark/20

          sm:p-7
        "
      >
        {children}
      </div>

    </div>
  );
}


/* =========================================================
   HEADER MODAL
========================================================= */

function ModalHeader({
  label,
  title,
  onClose,
}) {
  return (
    <div
      className="
        flex
        items-start
        justify-between
        gap-5

        border-b
        border-canwash-cream

        pb-5
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
          {label}
        </span>


        <h2
          className="
            mt-1
            text-2xl
            font-bold
            text-canwash-dark
          "
        >
          {title}
        </h2>

      </div>


      <button
        type="button"

        onClick={
          onClose
        }

        className="
          grid
          h-10
          w-10
          shrink-0
          place-items-center

          rounded-xl

          bg-canwash-background
          text-canwash-dark

          transition

          hover:bg-canwash-cream
        "
      >
        <X size={20} />
      </button>

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


/* =========================================================
   INPUT ICONO
========================================================= */

function IconInput({
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
   ERROR FORM
========================================================= */

function FormError({
  children,
}) {
  return (
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
      {children}
    </div>
  );
}


/* =========================================================
   SUBMIT
========================================================= */

function SubmitButton({
  loading,
  text,
  loadingText,
}) {
  return (
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

        disabled:cursor-not-allowed
        disabled:translate-y-0
        disabled:opacity-60
      "
    >

      <Save size={18} />

      {loading
        ? loadingText
        : text}

    </button>
  );
}


/* =========================================================
   DETALLE
========================================================= */

function Detail({
  title,
  value,
}) {
  return (
    <div
      className="
        rounded-xl
        bg-canwash-background
        p-4
      "
    >

      <span
        className="
          block
          text-[10px]
          text-canwash-muted
        "
      >
        {title}
      </span>


      <strong
        className="
          mt-1
          block
          text-sm
          text-canwash-dark
        "
      >
        {value}
      </strong>

    </div>
  );
}


/* =========================================================
   DETAIL SECTION
========================================================= */

function DetailSection({
  title,
  text,
}) {
  return (
    <div className="mt-6">

      <h3
        className="
          border-b
          border-canwash-cream

          pb-2

          text-sm
          font-bold
          text-canwash-dark
        "
      >
        {title}
      </h3>


      <p
        className="
          mt-3
          text-sm
          leading-6
          text-canwash-text
        "
      >
        {text}
      </p>

    </div>
  );
}


/* =========================================================
   STATUS
========================================================= */

function StatusBadge({
  status,
}) {
  const normalized =
    status
      ?.toUpperCase() ||
    "";


  let className =
    "bg-canwash-cream text-canwash-dark";


  if (
    normalized === "CONFIRMADA"
  ) {
    className =
      "bg-emerald-100 text-emerald-700";
  }


  if (
    normalized === "PENDIENTE"
  ) {
    className =
      "bg-amber-100 text-amber-700";
  }


  if (
    normalized === "COMPLETADA"
  ) {
    className =
      "bg-canwash-light text-canwash-dark";
  }


  if (
    normalized === "CANCELADA"
  ) {
    className =
      "bg-red-100 text-red-700";
  }


  return (
    <span
      className={`
        inline-flex
        w-fit

        rounded-full

        px-3
        py-1.5

        text-[10px]
        font-bold
        tracking-wide

        ${className}
      `}
    >
      {status ||
        "SIN ESTADO"}
    </span>
  );
}


/* =========================================================
   CLASES FORMULARIO
========================================================= */

const inputClasses = `
  w-full
  rounded-xl
  border
  border-canwash-light
  bg-white
  px-4
  py-3.5
  text-sm
  text-canwash-text
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-canwash
  focus:ring-4
  focus:ring-canwash/20
  disabled:cursor-not-allowed
  disabled:bg-canwash-background
  disabled:opacity-70
`;


const innerInputClasses = `
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
`;


const textareaClasses = `
  min-h-28
  w-full
  resize-y
  rounded-xl
  border
  border-canwash-light
  bg-white
  px-4
  py-3.5
  text-sm
  leading-6
  text-canwash-text
  outline-none
  transition
  placeholder:text-slate-400
  focus:border-canwash
  focus:ring-4
  focus:ring-canwash/20
`;


/* =========================================================
   FECHA
========================================================= */

function formatDate(date) {
  if (!date) {
    return "";
  }


  return new Intl.DateTimeFormat(
    "es-MX",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    new Date(
      `${date}T00:00:00`
    )
  );
}


/* =========================================================
   HORA
========================================================= */

function formatTime(time) {
  if (!time) {
    return "";
  }


  return time
    .toString()
    .slice(0, 5);
}


export default ClientDashboard;