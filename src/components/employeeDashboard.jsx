import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  Banknote,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  LogOut,
  MapPin,
  PawPrint,
  Phone,
  RefreshCw,
  Scissors,
  User,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";
import MobileMenu from "./mobileMenu";


function EmployeeDashboard({
  user,
  onLogout,
}) {
  // =====================================================
  // ESTADOS
  // =====================================================

  const [appointments, setAppointments] =
    useState([]);

  const [payments, setPayments] =
    useState([]);

  const [
    selectedAppointment,
    setSelectedAppointment,
  ] = useState(null);

  const [view, setView] =
    useState("citas");

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

  const loadData = async () => {
    if (!user?.id_usuario) {
      setError(
        "No se encontró el identificador del empleado."
      );

      setLoading(false);

      return;
    }


    setLoading(true);
    setError("");


    try {
      // =================================================
      // CITAS DEL EMPLEADO
      // =================================================

      const {
        data: appointmentData,
        error: appointmentError,
      } = await supabase
        .from("citas")
        .select(`
          id_cita,
          fecha,
          hora,
          direccion_servicio,
          colonia,
          costo_visita,
          estado,
          notas,

          clientes (
            id_cliente,
            nombre,
            telefono,
            email
          ),

          mascotas (
            id_mascota,
            nombre,
            especie,
            raza,
            tamano,
            padecimientos,
            comportamiento,
            notas
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
          "id_usuario",
          user.id_usuario
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


      if (appointmentError) {
        throw appointmentError;
      }


      const appointmentsResult =
        appointmentData || [];


      setAppointments(
        appointmentsResult
      );


      // =================================================
      // OBTENER IDS DE CITAS
      // =================================================

      const appointmentIds =
        appointmentsResult.map(
          (appointment) =>
            appointment.id_cita
        );


      // =================================================
      // PAGOS DE LAS CITAS
      // =================================================

      if (
        appointmentIds.length > 0
      ) {
        const {
          data: paymentData,
          error: paymentError,
        } = await supabase
          .from("pagos")
          .select(`
            id_pago,
            id_cita,
            monto,
            tipo,
            metodo,
            referencia,
            comprobante_url,
            estado,
            fecha_pago
          `)
          .in(
            "id_cita",
            appointmentIds
          )
          .order(
            "fecha_pago",
            {
              ascending: false,
            }
          );


        if (paymentError) {
          throw paymentError;
        }


        setPayments(
          paymentData || []
        );

      } else {
        setPayments([]);
      }

    } catch (loadError) {
      console.error(
        "Error cargando dashboard:",
        loadError
      );

      setError(
        "No fue posible cargar la información."
      );

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // CARGAR AL ENTRAR
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
  // CITAS DE HOY
  // =====================================================

  const todayAppointments =
    useMemo(() => {
      return appointments.filter(
        (appointment) =>
          appointment.fecha === today
      );
    }, [appointments, today]);


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
  // CONFIRMADAS
  // =====================================================

  const confirmedAppointments =
    todayAppointments.filter(
      (appointment) =>
        appointment.estado ===
        "CONFIRMADA"
    ).length;


  // =====================================================
  // PENDIENTES
  // =====================================================

  const pendingAppointments =
    todayAppointments.filter(
      (appointment) =>
        appointment.estado ===
        "PENDIENTE"
    ).length;


  // =====================================================
  // TOTAL PAGOS VALIDADOS
  // =====================================================

  const totalPayments =
    payments
      .filter(
        (payment) =>
          payment.estado ===
          "VALIDADO"
      )
      .reduce(
        (total, payment) =>
          total +
          Number(
            payment.monto || 0
          ),
        0
      );


  // =====================================================
  // CAMBIAR VISTA
  // =====================================================

  const changeView = (newView) => {
    setView(newView);
    setMobileMenuOpen(false);
  };


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = async () => {
    try {
      setMobileMenuOpen(false);

      const {
        error: logoutError,
      } =
        await supabase.auth
          .signOut();


      if (logoutError) {
        throw logoutError;
      }


      onLogout();

    } catch (logoutError) {
      console.error(
        "Error cerrando sesión:",
        logoutError
      );
    }
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
            Consultando tus citas.
          </p>

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
              {user?.rol === "ADMIN"
                ? "PANEL DE ADMINISTRADOR"
                : "PANEL DE EMPLEADO"}
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


          <SidebarButton
            active={
              view === "pagos"
            }

            icon={
              <CreditCard
                size={20}
              />
            }

            text="Pagos"

            onClick={() =>
              changeView("pagos")
            }
          />

        </nav>


        {/* =================================================
            CERRAR SESIÓN
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
              {user?.rol === "ADMIN"
                ? "Panel de administrador"
                : "Panel de empleado"}
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
                  .toUpperCase() || "E"}

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
                    "Empleado"}
                </strong>


                <span
                  className="
                    mt-1
                    block
                    text-xs
                    text-canwash-muted
                  "
                >
                  {user?.rol ||
                    "EMPLEADO"}
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
            VISTA CITAS
        ================================================== */}

        {view === "citas" && (
          <>

            {/* =============================================
                BIENVENIDA
            ============================================== */}

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
                  TU JORNADA
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
                    "Empleado"}!
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
                  Consulta tus citas,
                  horarios, clientes,
                  mascotas y servicios
                  programados.
                </p>

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


            {/* =============================================
                ESTADÍSTICAS
            ============================================== */}

            <section
              className="
                mt-5

                grid
                grid-cols-1
                gap-4

                sm:grid-cols-2

                xl:grid-cols-4
              "
            >

              <EmployeeStat
                icon={
                  <CalendarDays />
                }

                title="Citas de hoy"

                value={
                  todayAppointments.length
                }

                text="Servicios programados"
              />


              <EmployeeStat
                icon={
                  <CheckCircle2 />
                }

                title="Confirmadas"

                value={
                  confirmedAppointments
                }

                text="Citas confirmadas"
              />


              <EmployeeStat
                icon={
                  <AlertCircle />
                }

                title="Pendientes"

                value={
                  pendingAppointments
                }

                text="Por confirmar"
              />


              <EmployeeStat
                icon={
                  <CalendarClock />
                }

                title="Próximas"

                value={
                  upcomingAppointments.length
                }

                text="Desde hoy"
              />

            </section>


            {/* =============================================
                CITAS DE HOY
            ============================================== */}

            <AppointmentSection
              title="Citas de hoy"

              subtitle="Servicios programados para tu jornada."

              appointments={
                todayAppointments
              }

              payments={
                payments
              }

              onSelect={
                setSelectedAppointment
              }
            />


            {/* =============================================
                PRÓXIMAS CITAS
            ============================================== */}

            <AppointmentSection
              title="Próximas citas"

              subtitle="Servicios que tienes asignados."

              appointments={
                upcomingAppointments
              }

              payments={
                payments
              }

              onSelect={
                setSelectedAppointment
              }
            />

          </>
        )}


        {/* =================================================
            VISTA PAGOS
        ================================================== */}

        {view === "pagos" && (
          <PaymentsView
            payments={
              payments
            }

            appointments={
              appointments
            }

            totalPayments={
              totalPayments
            }
          />
        )}

      </main>


      {/* =================================================
          MODAL CITA
      ================================================== */}

      {selectedAppointment && (
        <AppointmentModal
          appointment={
            selectedAppointment
          }

          payments={
            payments.filter(
              (payment) =>
                payment.id_cita ===
                selectedAppointment.id_cita
            )
          }

          onClose={() =>
            setSelectedAppointment(null)
          }
        />
      )}

    </div>
  );
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

function EmployeeStat({
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
   SECCIÓN CITAS
========================================================= */

function AppointmentSection({
  title,
  subtitle,
  appointments,
  payments,
  onSelect,
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

      {/* HEADER */}

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
          {subtitle}
        </p>

      </div>


      {/* SIN CITAS */}

      {appointments.length === 0 ? (

        <EmptyState
          icon={
            <PawPrint size={45} />
          }

          title="No hay citas"

          text="No tienes servicios programados en esta sección."
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

                payments={
                  payments.filter(
                    (payment) =>
                      payment.id_cita ===
                      appointment.id_cita
                  )
                }

                onClick={() =>
                  onSelect(
                    appointment
                  )
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
  payments,
  onClick,
}) {
  const totalPaid =
    payments
      .filter(
        (payment) =>
          payment.estado ===
          "VALIDADO"
      )
      .reduce(
        (total, payment) =>
          total +
          Number(
            payment.monto || 0
          ),
        0
      );


  return (
    <button
      type="button"

      onClick={
        onClick
      }

      className="
        flex
        w-full
        flex-col
        gap-4

        rounded-2xl

        border
        border-canwash-cream

        bg-canwash-background

        p-5

        text-left

        transition

        hover:-translate-y-0.5
        hover:border-canwash-light
        hover:shadow-lg
        hover:shadow-canwash-dark/5

        focus:outline-none
        focus-visible:ring-4
        focus-visible:ring-canwash/20

        sm:flex-row
      "
    >

      {/* FECHA */}

      <div
        className="
          flex
          items-center
          gap-3

          border-b
          border-canwash-cream

          pb-4

          sm:min-w-32
          sm:border-b-0
          sm:border-r
          sm:pb-0
          sm:pr-5
        "
      >

        <Clock
          size={19}
          className="
            shrink-0
            text-canwash
          "
        />


        <div>

          <strong
            className="
              block
              text-sm
              text-canwash-dark
            "
          >
            {formatTime(
              appointment.hora
            )}
          </strong>


          <span
            className="
              mt-1
              block
              text-[10px]
              text-canwash-muted
            "
          >
            {formatDate(
              appointment.fecha
            )}
          </span>

        </div>

      </div>


      {/* CONTENIDO */}

      <div
        className="
          min-w-0
          flex-1
        "
      >

        {/* HEADING */}

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
              {appointment.mascotas
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

              {appointment.mascotas
                ?.especie ||
                "Sin especie"}


              {appointment.mascotas
                ?.raza &&
                ` · ${appointment.mascotas.raza}`}


              {appointment.mascotas
                ?.tamano &&
                ` · ${appointment.mascotas.tamano}`}

            </span>

          </div>


          <StatusBadge
            status={
              appointment.estado
            }
          />

        </div>


        {/* SERVICIOS */}

        {appointment.detalle_cita
          ?.length > 0 && (
          <div
            className="
              mt-4

              flex
              flex-wrap
              gap-2
            "
          >

            {appointment.detalle_cita
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

                  {detail.servicios
                    ?.nombre ||
                    "Servicio"}

                </span>

              ))}

          </div>
        )}


        {/* INFORMACIÓN */}

        <div
          className="
            mt-4

            flex
            flex-wrap
            gap-x-6
            gap-y-3

            text-xs
            text-canwash-muted
          "
        >

          <InformationItem
            icon={
              <User size={16} />
            }

            text={
              appointment.clientes
                ?.nombre ||
              "Sin cliente"
            }
          />


          <InformationItem
            icon={
              <Phone size={16} />
            }

            text={
              appointment.clientes
                ?.telefono ||
              "Sin teléfono"
            }
          />


          <InformationItem
            icon={
              <MapPin size={16} />
            }

            text={
              appointment.colonia ||
              "Sin colonia"
            }
          />


          <InformationItem
            icon={
              <Banknote size={16} />
            }

            text={
              `Pagado: ${formatMoney(
                totalPaid
              )}`
            }
          />

        </div>

      </div>

    </button>
  );
}


/* =========================================================
   INFORMATION ITEM
========================================================= */

function InformationItem({
  icon,
  text,
}) {
  return (
    <div
      className="
        flex
        items-center
        gap-2
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

      <span>
        {text}
      </span>

    </div>
  );
}


/* =========================================================
   PAGOS
========================================================= */

function PaymentsView({
  payments,
  appointments,
  totalPayments,
}) {
  const validatedPayments =
    payments.filter(
      (payment) =>
        payment.estado ===
        "VALIDADO"
    ).length;


  return (
    <>

      {/* =================================================
          ENCABEZADO
      ================================================== */}

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
            PAGOS
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
            Historial de pagos
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
            Consulta los pagos asociados
            a las citas que tienes
            asignadas.
          </p>

        </div>


        <CreditCard
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


      {/* =================================================
          ESTADÍSTICAS
      ================================================== */}

      <section
        className="
          mt-5

          grid
          grid-cols-1
          gap-4

          md:grid-cols-2
        "
      >

        <EmployeeStat
          icon={
            <Banknote />
          }

          title="Pagos validados"

          value={
            validatedPayments
          }

          text="Registros validados"
        />


        <EmployeeStat
          icon={
            <CreditCard />
          }

          title="Total registrado"

          value={
            formatMoney(
              totalPayments
            )
          }

          text="Pagos validados"
        />

      </section>


      {/* =================================================
          MOVIMIENTOS
      ================================================== */}

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

        <h2
          className="
            text-xl
            font-bold
            text-canwash-dark
          "
        >
          Movimientos
        </h2>


        <p
          className="
            mt-1
            text-sm
            text-canwash-muted
          "
        >
          Pagos correspondientes a
          tus citas.
        </p>


        {payments.length === 0 ? (

          <EmptyState
            icon={
              <CreditCard
                size={45}
              />
            }

            title="No hay pagos"

            text="Todavía no hay movimientos asociados a tus citas."
          />

        ) : (

          <div className="mt-6">

            {payments.map(
              (payment) => {
                const appointment =
                  appointments.find(
                    (item) =>
                      item.id_cita ===
                      payment.id_cita
                  );


                return (
                  <PaymentRow
                    key={
                      payment.id_pago
                    }

                    payment={
                      payment
                    }

                    appointment={
                      appointment
                    }
                  />
                );
              }
            )}

          </div>
        )}

      </section>

    </>
  );
}


/* =========================================================
   FILA PAGO
========================================================= */

function PaymentRow({
  payment,
  appointment,
}) {
  return (
    <article
      className="
        grid
        grid-cols-[44px_1fr]
        gap-3

        border-t
        border-canwash-cream

        py-4

        first:border-t-0

        md:grid-cols-[44px_minmax(0,1fr)_160px_140px]
        md:items-center
        md:gap-4
      "
    >

      {/* ICONO */}

      <div
        className="
          grid
          h-11
          w-11
          place-items-center

          rounded-xl

          bg-canwash-cream
          text-canwash-dark
        "
      >
        <Banknote size={21} />
      </div>


      {/* INFORMACIÓN */}

      <div className="min-w-0">

        <strong
          className="
            block
            text-sm
            text-canwash-dark
          "
        >
          {payment.tipo ||
            "Pago"}
        </strong>


        <span
          className="
            mt-1
            block
            truncate
            text-xs
            text-canwash-muted
          "
        >

          {appointment
            ?.clientes
            ?.nombre ||
            "Cliente"}

          {" · "}

          {appointment
            ?.mascotas
            ?.nombre ||
            "Mascota"}

        </span>

      </div>


      {/* MÉTODO */}

      <div
        className="
          col-start-2

          md:col-auto
        "
      >

        <strong
          className="
            block
            text-xs
            text-canwash-dark
          "
        >
          {payment.metodo ||
            "Sin especificar"}
        </strong>


        <span
          className="
            mt-1
            block
            text-[11px]
            text-canwash-muted
          "
        >
          {formatPaymentDate(
            payment.fecha_pago
          )}
        </span>

      </div>


      {/* MONTO */}

      <div
        className="
          col-start-2

          md:col-auto
          md:text-right
        "
      >

        <strong
          className="
            mb-2
            block
            text-base
            text-canwash-dark
          "
        >
          {formatMoney(
            payment.monto
          )}
        </strong>


        <StatusBadge
          status={
            payment.estado
          }
        />

      </div>

    </article>
  );
}


/* =========================================================
   MODAL CITA
========================================================= */

function AppointmentModal({
  appointment,
  payments,
  onClose,
}) {
  // =====================================================
  // TOTAL SERVICIOS
  // =====================================================

  const serviceTotal =
    appointment.detalle_cita
      ?.reduce(
        (total, detail) =>
          total +
          Number(
            detail.precio || 0
          ) *
          Number(
            detail.cantidad || 1
          ),
        0
      ) || 0;


  // =====================================================
  // VISITA
  // =====================================================

  const visitCost =
    Number(
      appointment.costo_visita || 0
    );


  // =====================================================
  // TOTAL
  // =====================================================

  const total =
    serviceTotal +
    visitCost;


  // =====================================================
  // PAGADO
  // =====================================================

  const paid =
    payments
      .filter(
        (payment) =>
          payment.estado ===
          "VALIDADO"
      )
      .reduce(
        (sum, payment) =>
          sum +
          Number(
            payment.monto || 0
          ),
        0
      );


  // =====================================================
  // PENDIENTE
  // =====================================================

  const pending =
    Math.max(
      total - paid,
      0
    );


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
          max-w-3xl

          overflow-y-auto

          rounded-2xl

          bg-white

          p-5

          shadow-2xl
          shadow-canwash-dark/20

          sm:p-7
        "
      >

        {/* =================================================
            HEADER
        ================================================== */}

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
              DETALLE DE CITA
            </span>


            <h2
              className="
                mt-1
                text-2xl
                font-bold
                text-canwash-dark
              "
            >
              {appointment.mascotas
                ?.nombre ||
                "Mascota"}
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

              focus:outline-none
              focus-visible:ring-4
              focus-visible:ring-canwash/20
            "
          >
            <X size={20} />
          </button>

        </div>


        {/* =================================================
            INFORMACIÓN GENERAL
        ================================================== */}

        <div
          className="
            mt-5

            grid
            grid-cols-1
            gap-3

            sm:grid-cols-2

            lg:grid-cols-3
          "
        >

          <ModalInformation
            title="Fecha"

            value={
              formatDate(
                appointment.fecha
              )
            }
          />


          <ModalInformation
            title="Hora"

            value={
              formatTime(
                appointment.hora
              )
            }
          />


          <ModalInformation
            title="Cliente"

            value={
              appointment.clientes
                ?.nombre
            }
          />


          <ModalInformation
            title="Teléfono"

            value={
              appointment.clientes
                ?.telefono
            }
          />


          <ModalInformation
            title="Colonia"

            value={
              appointment.colonia
            }
          />


          <ModalInformation
            title="Estado"

            value={
              appointment.estado
            }
          />

        </div>


        {/* =================================================
            MASCOTA
        ================================================== */}

        <ModalSection
          title="Mascota"
        >

          <ModalText
            label="Especie"

            value={
              appointment.mascotas
                ?.especie
            }
          />


          <ModalText
            label="Raza"

            value={
              appointment.mascotas
                ?.raza
            }
          />


          <ModalText
            label="Tamaño"

            value={
              appointment.mascotas
                ?.tamano
            }
          />


          {appointment.mascotas
            ?.padecimientos && (
            <ModalText
              label="Padecimientos"

              value={
                appointment.mascotas
                  .padecimientos
              }
            />
          )}


          {appointment.mascotas
            ?.comportamiento && (
            <ModalText
              label="Comportamiento"

              value={
                appointment.mascotas
                  .comportamiento
              }
            />
          )}

        </ModalSection>


        {/* =================================================
            SERVICIOS
        ================================================== */}

        <ModalSection
          title="Servicios"
        >

          {appointment.detalle_cita
            ?.length > 0 ? (

            appointment.detalle_cita
              .map((detail) => (

                <div
                  key={
                    detail.id_detalle
                  }

                  className="
                    flex
                    items-center
                    justify-between
                    gap-4

                    border-b
                    border-canwash-background

                    py-3

                    text-sm
                  "
                >

                  <span
                    className="
                      text-canwash-text
                    "
                  >
                    {detail.servicios
                      ?.nombre ||
                      "Servicio"}
                  </span>


                  <strong
                    className="
                      shrink-0
                      text-canwash-dark
                    "
                  >
                    {formatMoney(
                      detail.precio
                    )}
                  </strong>

                </div>

              ))

          ) : (

            <p
              className="
                text-sm
                text-canwash-muted
              "
            >
              Sin servicios registrados.
            </p>

          )}

        </ModalSection>


        {/* =================================================
            PAGO
        ================================================== */}

        <ModalSection
          title="Pago"
        >

          <div
            className="
              grid
              grid-cols-1
              gap-3

              sm:grid-cols-3
            "
          >

            <PaymentSummary
              title="Total"

              value={
                formatMoney(
                  total
                )
              }
            />


            <PaymentSummary
              title="Pagado"

              value={
                formatMoney(
                  paid
                )
              }
            />


            <PaymentSummary
              title="Pendiente"

              value={
                formatMoney(
                  pending
                )
              }
            />

          </div>

        </ModalSection>


        {/* =================================================
            NOTAS
        ================================================== */}

        {appointment.notas && (
          <ModalSection
            title="Notas"
          >

            <p
              className="
                text-sm
                leading-6
                text-canwash-text
              "
            >
              {appointment.notas}
            </p>

          </ModalSection>
        )}

      </div>

    </div>
  );
}


/* =========================================================
   MODAL INFORMATION
========================================================= */

function ModalInformation({
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
          break-words
          text-sm
          text-canwash-dark
        "
      >
        {value ||
          "Sin información"}
      </strong>

    </div>
  );
}


/* =========================================================
   MODAL SECTION
========================================================= */

function ModalSection({
  title,
  children,
}) {
  return (
    <section
      className="
        mt-7
      "
    >

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


      <div className="mt-3">
        {children}
      </div>

    </section>
  );
}


/* =========================================================
   MODAL TEXT
========================================================= */

function ModalText({
  label,
  value,
}) {
  return (
    <p
      className="
        my-2

        text-sm
        leading-6
        text-canwash-text
      "
    >

      <strong
        className="
          text-canwash-dark
        "
      >
        {label}:
      </strong>{" "}

      {value ||
        "Sin información"}

    </p>
  );
}


/* =========================================================
   RESUMEN PAGO
========================================================= */

function PaymentSummary({
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
          text-xs
          text-canwash-muted
        "
      >
        {title}
      </span>


      <strong
        className="
          mt-2
          block
          text-lg
          text-canwash-dark
        "
      >
        {value}
      </strong>

    </div>
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
   STATUS BADGE
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
    normalized === "CONFIRMADA" ||
    normalized === "VALIDADO"
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
    normalized === "CANCELADA" ||
    normalized === "RECHAZADO"
  ) {
    className =
      "bg-red-100 text-red-700";
  }


  return (
    <span
      className={`
        inline-flex
        w-fit
        items-center

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
   FORMATEAR DINERO
========================================================= */

function formatMoney(value) {
  return new Intl.NumberFormat(
    "es-MX",
    {
      style: "currency",
      currency: "MXN",
    }
  ).format(
    Number(
      value || 0
    )
  );
}


/* =========================================================
   FORMATEAR FECHA
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
   FORMATEAR HORA
========================================================= */

function formatTime(time) {
  if (!time) {
    return "";
  }


  return time
    .toString()
    .slice(0, 5);
}


/* =========================================================
   FECHA PAGO
========================================================= */

function formatPaymentDate(date) {
  if (!date) {
    return "Sin fecha";
  }


  return new Intl.DateTimeFormat(
    "es-MX",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    new Date(date)
  );
}


export default EmployeeDashboard;