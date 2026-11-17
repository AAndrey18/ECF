import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock,
  Dog,
  MapPin,
  PawPrint,
  Plus,
  RefreshCw,
  Scissors,
} from "lucide-react";

import { supabase } from "../lib/supabase";

import BookingWizard from "./appointments/BookingWizard";
import { Button, Notice } from "./ui";
import AddressesPanel from "./addresses/AddressesPanel";
import PetForm from "./pets/PetForm";
import PetsPanel from "./pets/PetsPanel";

import Sidebar from "../utils/sidebar";
import MobileMenu from "../utils/mobileMenu";
import Card from "../utils/card";
import LoadingScreen from "../utils/loadingScreen";


function ClientDashboard({
  user,
  onLogout,
  onProfile,
}) {
  // =====================================================
  // ESTADOS
  // =====================================================

  const [bookingOpen, setBookingOpen] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");

  const [client, setClient] =
    useState(null);

  const [pets, setPets] =
    useState([]);

  const [
    appointments,
    setAppointments,
  ] = useState([]);

  const [view, setView] =
    useState("inicio");

  const [
    showPetModal,
    setShowPetModal,
  ] = useState(false);

  const [
    selectedPet,
    setSelectedPet,
  ] = useState(null);

  const [
    mobileMenuOpen,
    setMobileMenuOpen,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");


  // =====================================================
  // CARGAR DATOS
  // =====================================================

  const userId = user?.id_usuario;
  const loadData = useCallback(async () => {
    if (!userId) {
      setError(
        "No se encontró el usuario autenticado."
      );

      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      // ===============================================
      // CLIENTE
      // ===============================================

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
          userId
        )
        .maybeSingle();


      if (clientError) {
        throw clientError;
      }


      setClient(clientData);


      if (!clientData) {
        setPets([]);
        setAppointments([]);
        return;
      }


      // ===============================================
      // MASCOTAS
      // ===============================================

      const {
        data: petsData,
        error: petsError,
      } = await supabase
        .from("mascotas")
        .select("*")
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


      // ===============================================
      // CITAS
      // ===============================================

      const {
        data: appointmentsData,
        error: appointmentsError,
      } = await supabase
        .from("citas")
        .select(`
          id_cita,
          id_cliente,
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
        "Error cargando dashboard del cliente:",
        loadError
      );

      setError(
        "No fue posible cargar tu información."
      );

    } finally {
      setLoading(false);
    }
  }, [userId]);


  // =====================================================
  // CARGA INICIAL
  // =====================================================

  useEffect(() => {
    Promise.resolve().then(loadData);
  }, [loadData]);


  // =====================================================
  // DATOS CALCULADOS
  // =====================================================

  const today =
    new Date()
      .toISOString()
      .split("T")[0];


  const upcomingAppointments =
    useMemo(() => {
      return appointments.filter(
        (appointment) =>
          appointment.fecha >= today &&
          appointment.estado !==
            "CANCELADA"
      );
    }, [
      appointments,
      today,
    ]);


  const completedAppointments =
    appointments.filter(
      (appointment) =>
        appointment.estado ===
        "COMPLETADA"
    ).length;


  // =====================================================
  // NAVEGACIÓN
  // =====================================================

  const changeView = (
    newView
  ) => {
    setView(newView);
    setMobileMenuOpen(false);
  };


  const openProfile = () => {
    setMobileMenuOpen(false);

    onProfile?.();
  };


  // =====================================================
  // REGISTRAR MASCOTA
  // =====================================================

  const openPetRegistration =
    () => {
      setMobileMenuOpen(false);

      if (!client) {
        onProfile?.();
        return;
      }

      setShowPetModal(true);
    };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    setMobileMenuOpen(false);

    onLogout?.();
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return <LoadingScreen />;
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
      <Sidebar
        user={user}
        view={view}
        isOpen={mobileMenuOpen}
        onChangeView={changeView}
        onProfile={openProfile}
        onLogout={handleLogout}
      />


      <MobileMenu
        isOpen={mobileMenuOpen}

        onToggle={() =>
          setMobileMenuOpen(
            (current) =>
              !current
          )
        }

        onClose={() =>
          setMobileMenuOpen(false)
        }
      />


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
        <Topbar
          user={user}
          title={
            getViewTitle(view)
          }
          onRefresh={loadData}
        />


        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}


        {/* =============================================
            INICIO
        ============================================== */}

        {view === "inicio" && (
          <>
            <section
              className="
                relative
                overflow-hidden
                rounded-3xl

                bg-gradient-to-br
                from-canwash-light/80
                to-canwash-cream/80

                px-6
                py-8

                shadow-lg
                shadow-canwash-dark/5

                backdrop-blur-sm

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
                  administra la información
                  de tus servicios.
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


            {/* CARDS */}

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
              <Card
                opacity={80}
                icon={<Dog />}
                title="Mis mascotas"
                value={pets.length}
                text="Mascotas registradas"
              />


              <Card
                opacity={80}
                icon={
                  <CalendarDays />
                }
                title="Próximas citas"
                value={
                  upcomingAppointments.length
                }
                text="Servicios programados"
              />


              <Card
                opacity={80}
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
                  bg-amber-50/80
                  p-5
                  backdrop-blur-sm
                  sm:flex-row
                  sm:items-center
                "
              >
                <AlertCircle
                  size={25}
                  className="
                    shrink-0
                    text-amber-700
                  "
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
                      text-amber-800
                    "
                  >
                    Antes de registrar una
                    mascota necesitamos
                    completar tus datos.
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


            <PetsPanel pets={pets} onAdd={openPetRegistration} onEdit={setSelectedPet} />


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


        {/* =============================================
            MASCOTAS
        ============================================== */}

        {view === "mascotas" && (
          <PetsPanel pets={pets} onAdd={openPetRegistration} onEdit={setSelectedPet} />
        )}


        {/* =============================================
            CITAS
        ============================================== */}

        {view === "citas" && (<>
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><Notice tone="success">{bookingMessage}</Notice><Button onClick={() => client ? setBookingOpen(true) : openProfile()}>Agendar visita</Button></div>
          <AppointmentsSection title="Mis citas" appointments={appointments} />
        </>)}

        {view === "ubicacion" && <AddressesPanel client={client} onProfile={openProfile} />}
      </main>
      {bookingOpen && client && <BookingWizard client={client} pets={pets} onClose={()=>setBookingOpen(false)}
        onManagePets={()=>{setBookingOpen(false);setView('mascotas');}} onManageAddresses={()=>{setBookingOpen(false);setView('ubicacion');}}
        onReserved={()=>{setBookingOpen(false);setView('citas');setBookingMessage('Tu visita está reservada. Revisa su estado en Mis citas.');loadData();}} />}


      {/* ===============================================
          MODAL REGISTRAR MASCOTA
      ================================================ */}

      {(showPetModal || selectedPet) && client && (
        <PetForm key={selectedPet?.id_mascota || 'new'} clientId={client.id_cliente} pet={selectedPet}
          onClose={() => { setShowPetModal(false); setSelectedPet(null); }}
          onSaved={() => { setShowPetModal(false); setSelectedPet(null); loadData(); }} />
      )}

    </div>
  );
}


/* =========================================================
   TOPBAR
========================================================= */

function Topbar({
  user,
  title,
  onRefresh,
}) {
  return (
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
      <div className="hidden sm:block">
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
          {title}
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
        <button
          type="button"
          onClick={onRefresh}
          className="
            grid
            h-11
            w-11
            place-items-center
            rounded-xl
            border
            border-canwash-light
            bg-white/80
            text-canwash-dark
            backdrop-blur-sm
            transition
            hover:bg-white
            sm:flex
            sm:w-auto
            sm:gap-2
            sm:px-4
          "
        >
          <RefreshCw size={18} />

          <span className="hidden sm:inline">
            Actualizar
          </span>
        </button>


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
              place-items-center
              rounded-full
              bg-canwash-light/80
              font-bold
              text-canwash-dark
            "
          >
            {user?.nombre
              ?.charAt(0)
              .toUpperCase() || "C"}
          </div>

          <div className="hidden sm:block">
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
                text-xs
                text-canwash-muted
              "
            >
              CLIENTE
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}


/* =========================================================
   MASCOTAS
========================================================= */

function AppointmentsSection({
  appointments,
  title,
}) {
  return (
    <section
      className="
        mt-5
        rounded-2xl
        bg-white/80
        p-5
        shadow-lg
        shadow-canwash-dark/5
        backdrop-blur-sm
        sm:p-7
      "
    >
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


      {appointments.length === 0 ? (
        <EmptyState
          icon={
            <CalendarDays size={45} />
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
        border-white/50
        bg-canwash-background/70
        p-5
        backdrop-blur-sm
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
          className="text-canwash"
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


      <div className="min-w-0 flex-1">
        <div
          className="
            flex
            flex-col
            gap-3
            sm:flex-row
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
                    gap-1
                    rounded-lg
                    bg-white/70
                    px-3
                    py-2
                    text-xs
                    font-semibold
                    text-canwash-dark
                  "
                >
                  <Scissors size={14} />

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
            text-canwash-muted
          "
        >
          <MapPin
            size={16}
            className="text-canwash"
          />

          {appointment
            .direccion_servicio ||
            appointment.colonia ||
            "Dirección por confirmar"}
        </div>
      </div>
    </article>
  );
}


/* =========================================================
   REGISTRAR MASCOTA
========================================================= */

function ErrorMessage({
  children,
}) {
  return (
    <div
      className="
        mb-5
        flex
        items-center
        gap-3
        rounded-xl
        border
        border-red-200
        bg-red-50/80
        p-4
        text-sm
        text-red-700
      "
    >
      <AlertCircle size={19} />
      {children}
    </div>
  );
}


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
          mt-2
          text-sm
          text-canwash-muted
        "
      >
        {text}
      </p>
    </div>
  );
}


function StatusBadge({
  status,
}) {
  const normalized =
    status?.toUpperCase() || "";

  let style =
    "bg-canwash-cream text-canwash-dark";

  if (
    normalized === "CONFIRMADA" ||
    normalized === "COMPLETADA"
  ) {
    style =
      "bg-emerald-100 text-emerald-700";
  }

  if (
    normalized === "PENDIENTE"
  ) {
    style =
      "bg-amber-100 text-amber-700";
  }

  if (
    normalized === "CANCELADA"
  ) {
    style =
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
        ${style}
      `}
    >
      {status ||
        "SIN ESTADO"}
    </span>
  );
}


function getViewTitle(view) {
  switch (view) {
    case "mascotas":
      return "Mis mascotas";

    case "citas":
      return "Mis citas";

    default:
      return "Mi cuenta";
  }
}


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


function formatTime(time) {
  return time
    ? time.toString().slice(0, 5)
    : "";
}


export default ClientDashboard;
