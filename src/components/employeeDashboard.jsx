import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Banknote,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  Clock,
  CreditCard,
  MapPin,
  PawPrint,
  Phone,
  RefreshCw,
  Scissors,
  User,
  X,
} from "lucide-react";

import { supabase } from "../lib/supabase";

import Sidebar from "../utils/sidebar";
import MobileMenu from "../utils/mobileMenu";
import Card from "../utils/card";
import LoadingScreen from "../utils/loadingScreen";


function EmployeeDashboard({
  user,
  onLogout,
  onProfile,
}) {
  // =====================================================
  // ESTADOS
  // =====================================================

  const [
    appointments,
    setAppointments,
  ] = useState([]);

  const [
    payments,
    setPayments,
  ] = useState([]);

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
      // ===============================================
      // CITAS
      // ===============================================

      let appointmentsQuery =
        supabase
          .from("citas")
          .select(`
            id_cita,
            id_usuario,
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
          `);


      /*
        ADMIN puede consultar todas las citas.
        EMPLEADO solamente las asignadas.
      */

      if (
        user.rol !== "ADMIN"
      ) {
        appointmentsQuery =
          appointmentsQuery.eq(
            "id_usuario",
            user.id_usuario
          );
      }


      const {
        data: appointmentData,
        error: appointmentError,
      } =
        await appointmentsQuery
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


      const appointmentResult =
        appointmentData || [];


      setAppointments(
        appointmentResult
      );


      // ===============================================
      // PAGOS
      // ===============================================

      const appointmentIds =
        appointmentResult.map(
          (appointment) =>
            appointment.id_cita
        );


      if (
        appointmentIds.length === 0
      ) {
        setPayments([]);
        return;
      }


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
  // CARGA INICIAL
  // =====================================================

  useEffect(() => {
    loadData();
  }, [
    user?.id_usuario,
    user?.rol,
  ]);


  // =====================================================
  // ESTADÍSTICAS
  // =====================================================

  const today =
    new Date()
      .toISOString()
      .split("T")[0];


  const todayAppointments =
    useMemo(() => {
      return appointments.filter(
        (appointment) =>
          appointment.fecha === today
      );
    }, [
      appointments,
      today,
    ]);


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


  const confirmedAppointments =
    todayAppointments.filter(
      (appointment) =>
        appointment.estado ===
        "CONFIRMADA"
    ).length;


  const pendingAppointments =
    todayAppointments.filter(
      (appointment) =>
        appointment.estado ===
        "PENDIENTE"
    ).length;


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
            view === "pagos"
              ? "Pagos"
              : view === "empleados"
                ? "Empleados"
                : user.rol === "ADMIN"
                  ? "Citas"
                  : "Mis citas"
          }

          onRefresh={
            loadData
          }
        />


        {error && (
          <ErrorMessage>
            {error}
          </ErrorMessage>
        )}


        {/* =============================================
            CITAS
        ============================================== */}

        {view === "citas" && (
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
                  {user.rol === "ADMIN"
                    ? "ADMINISTRACIÓN"
                    : "TU JORNADA"}
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
                  {user.rol === "ADMIN"
                    ? "Consulta las citas y la actividad general de Can Wash."
                    : "Consulta tus citas, horarios, clientes, mascotas y servicios programados."}
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


            {/* CARDS */}

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
              <Card
                opacity={80}
                icon={
                  <CalendarDays />
                }
                title="Citas de hoy"
                value={
                  todayAppointments.length
                }
                text="Servicios programados"
              />

              <Card
                opacity={80}
                icon={
                  <CheckCircle2 />
                }
                title="Confirmadas"
                value={
                  confirmedAppointments
                }
                text="Citas confirmadas"
              />

              <Card
                opacity={80}
                icon={
                  <AlertCircle />
                }
                title="Pendientes"
                value={
                  pendingAppointments
                }
                text="Por confirmar"
              />

              <Card
                opacity={80}
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


            <AppointmentSection
              title="Citas de hoy"
              subtitle="Servicios programados para hoy."
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


            <AppointmentSection
              title="Próximas citas"
              subtitle="Servicios programados próximamente."
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


        {/* =============================================
            PAGOS
        ============================================== */}

        {view === "pagos" && (
          <PaymentsView
            payments={payments}
            appointments={
              appointments
            }
            totalPayments={
              totalPayments
            }
          />
        )}


        {/* =============================================
            ADMIN - EMPLEADOS
        ============================================== */}

        {view === "empleados" &&
          user?.rol === "ADMIN" && (
          <Card
            opacity={80}
            className="mt-2"
          >
            <h1
              className="
                text-2xl
                font-bold
                text-canwash-dark
              "
            >
              Empleados
            </h1>

            <p
              className="
                mt-2
                text-sm
                text-canwash-muted
              "
            >
              Esta sección queda
              preparada para administrar
              empleados posteriormente.
            </p>
          </Card>
        )}
      </main>


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
              .toUpperCase() || "E"}
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
                "Empleado"}
            </strong>

            <span
              className="
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
        {subtitle}
      </p>


      {appointments.length === 0 ? (
        <EmptyState
          icon={
            <PawPrint size={45} />
          }
          title="No hay citas"
          text="No hay servicios programados en esta sección."
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
      onClick={onClick}
      className="
        flex
        w-full
        flex-col
        gap-4
        rounded-2xl
        border
        border-white/50
        bg-canwash-background/70
        p-5
        text-left
        backdrop-blur-sm
        transition
        hover:bg-canwash-background/90
        hover:shadow-lg
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
          sm:min-w-32
          sm:border-b-0
          sm:border-r
          sm:pb-0
          sm:pr-5
        "
      >
        <Clock
          size={19}
          className="text-canwash"
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
                ?.especie ||
                "Sin especie"}

              {appointment
                .mascotas
                ?.raza &&
                ` · ${appointment.mascotas.raza}`}
            </span>
          </div>

          <StatusBadge
            status={
              appointment.estado
            }
          />
        </div>


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
            ?.map((detail) => (
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


        <div
          className="
            mt-4
            flex
            flex-wrap
            gap-4
            text-xs
            text-canwash-muted
          "
        >
          <Info
            icon={
              <User size={16} />
            }
            text={
              appointment
                .clientes
                ?.nombre ||
              "Cliente"
            }
          />

          <Info
            icon={
              <Phone size={16} />
            }
            text={
              appointment
                .clientes
                ?.telefono ||
              "Sin teléfono"
            }
          />

          <Info
            icon={
              <MapPin size={16} />
            }
            text={
              appointment.colonia ||
              "Sin colonia"
            }
          />

          <Info
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
      <section
        className="
          rounded-3xl
          bg-gradient-to-br
          from-canwash-light/80
          to-canwash-cream/80
          p-8
          backdrop-blur-sm
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
            text-canwash-dark
          "
        >
          Historial de pagos
        </h1>

        <p
          className="
            mt-3
            text-sm
            text-canwash-text
          "
        >
          Consulta los pagos asociados
          a las citas.
        </p>
      </section>


      <section
        className="
          mt-5
          grid
          grid-cols-1
          gap-4
          md:grid-cols-2
        "
      >
        <Card
          opacity={80}
          icon={<Banknote />}
          title="Pagos validados"
          value={
            validatedPayments
          }
          text="Registros validados"
        />

        <Card
          opacity={80}
          icon={<CreditCard />}
          title="Total registrado"
          value={
            formatMoney(
              totalPayments
            )
          }
          text="Pagos validados"
        />
      </section>


      <section
        className="
          mt-5
          rounded-2xl
          bg-white/80
          p-6
          shadow-lg
          shadow-canwash-dark/5
          backdrop-blur-sm
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


        {payments.length === 0 ? (
          <EmptyState
            icon={
              <CreditCard size={45} />
            }
            title="No hay pagos"
            text="Todavía no hay movimientos."
          />
        ) : (
          <div className="mt-5">
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
        first:border-0
        md:grid-cols-[44px_1fr_150px_140px]
        md:items-center
      "
    >
      <div
        className="
          grid
          h-11
          w-11
          place-items-center
          rounded-xl
          bg-canwash-cream/80
          text-canwash-dark
        "
      >
        <Banknote size={20} />
      </div>


      <div>
        <strong
          className="
            text-sm
            text-canwash-dark
          "
        >
          {payment.tipo ||
            "Pago"}
        </strong>

        <span
          className="
            block
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


      <div
        className="
          col-start-2
          md:col-auto
        "
      >
        <strong
          className="
            text-xs
            text-canwash-dark
          "
        >
          {payment.metodo ||
            "Sin especificar"}
        </strong>

        <span
          className="
            block
            text-xs
            text-canwash-muted
          "
        >
          {formatPaymentDate(
            payment.fecha_pago
          )}
        </span>
      </div>


      <div
        className="
          col-start-2
          md:col-auto
          md:text-right
        "
      >
        <strong
          className="
            block
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


  const total =
    serviceTotal +
    Number(
      appointment.costo_visita || 0
    );


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


  return (
    <div
      onClick={onClose}
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
          bg-white/95
          p-6
          shadow-2xl
        "
      >
        <div
          className="
            flex
            justify-between
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
                text-2xl
                font-bold
                text-canwash-dark
              "
            >
              {appointment
                .mascotas
                ?.nombre ||
                "Mascota"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              grid
              h-10
              w-10
              place-items-center
              rounded-xl
              bg-canwash-background
            "
          >
            <X size={20} />
          </button>
        </div>


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
          <ModalInfo
            title="Fecha"
            value={
              formatDate(
                appointment.fecha
              )
            }
          />

          <ModalInfo
            title="Hora"
            value={
              formatTime(
                appointment.hora
              )
            }
          />

          <ModalInfo
            title="Cliente"
            value={
              appointment
                .clientes
                ?.nombre
            }
          />

          <ModalInfo
            title="Teléfono"
            value={
              appointment
                .clientes
                ?.telefono
            }
          />

          <ModalInfo
            title="Colonia"
            value={
              appointment.colonia
            }
          />

          <ModalInfo
            title="Estado"
            value={
              appointment.estado
            }
          />
        </div>


        <section className="mt-7">
          <h3
            className="
              border-b
              border-canwash-cream
              pb-2
              font-bold
              text-canwash-dark
            "
          >
            Servicios
          </h3>

          {appointment
            .detalle_cita
            ?.map((detail) => (
              <div
                key={
                  detail.id_detalle
                }
                className="
                  flex
                  justify-between
                  border-b
                  border-canwash-background
                  py-3
                  text-sm
                "
              >
                <span>
                  {detail
                    .servicios
                    ?.nombre ||
                    "Servicio"}
                </span>

                <strong>
                  {formatMoney(
                    detail.precio
                  )}
                </strong>
              </div>
            ))}
        </section>


        <section className="mt-7">
          <h3
            className="
              border-b
              border-canwash-cream
              pb-2
              font-bold
              text-canwash-dark
            "
          >
            Pago
          </h3>

          <div
            className="
              mt-3
              grid
              grid-cols-1
              gap-3
              sm:grid-cols-3
            "
          >
            <PaymentSummary
              title="Total"
              value={
                formatMoney(total)
              }
            />

            <PaymentSummary
              title="Pagado"
              value={
                formatMoney(paid)
              }
            />

            <PaymentSummary
              title="Pendiente"
              value={
                formatMoney(
                  Math.max(
                    total - paid,
                    0
                  )
                )
              }
            />
          </div>
        </section>
      </div>
    </div>
  );
}


/* =========================================================
   UI AUXILIAR
========================================================= */

function Info({
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
      <span className="text-canwash">
        {icon}
      </span>

      {text}
    </div>
  );
}


function ModalInfo({
  title,
  value,
}) {
  return (
    <div
      className="
        rounded-xl
        bg-canwash-background/80
        p-4
      "
    >
      <span
        className="
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
        {value ||
          "Sin información"}
      </strong>
    </div>
  );
}


function PaymentSummary({
  title,
  value,
}) {
  return (
    <div
      className="
        rounded-xl
        bg-canwash-background/80
        p-4
      "
    >
      <span
        className="
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


function StatusBadge({
  status,
}) {
  const normalized =
    status?.toUpperCase() || "";

  let style =
    "bg-canwash-cream text-canwash-dark";

  if (
    normalized === "CONFIRMADA" ||
    normalized === "VALIDADO" ||
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
    normalized === "CANCELADA" ||
    normalized === "RECHAZADO"
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


/* =========================================================
   FORMATOS
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
    }
  ).format(
    new Date(date)
  );
}


export default EmployeeDashboard;