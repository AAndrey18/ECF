import {
  ArrowLeft,
  Edit3,
  KeyRound,
  Mail,
  PawPrint,
  Phone,
  ShieldCheck,
  User,
} from "lucide-react";
import LocationMap from "./locationMap";


function Profile({
  user,
  onBack,
}) {
  return (
    <div className="min-h-screen bg-canwash-background">

      {/* ================================================
          CONTENEDOR
      ================================================= */}

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ================================================
            VOLVER
        ================================================= */}

        <button
          type="button"
          onClick={onBack}
          className="
            mb-6
            flex
            items-center
            gap-2
            rounded-lg
            text-sm
            font-semibold
            text-canwash-dark
            transition
            hover:text-canwash
          "
        >
          <ArrowLeft size={18} />

          Volver
        </button>


        {/* ================================================
            ENCABEZADO
        ================================================= */}

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

          <div className="relative z-10 flex flex-col gap-5 sm:flex-row sm:items-center">

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
                .toUpperCase() || "U"}
            </div>


            {/* INFORMACIÓN */}

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
                {user?.nombre || "Usuario"}
              </h1>


              <p className="mt-1 text-sm text-canwash-muted">
                {user?.email || "Sin correo registrado"}
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

                {user?.rol || "USUARIO"}
              </span>

            </div>

          </div>


          {/* DECORACIÓN */}

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


        {/* ================================================
            CONTENIDO
        ================================================= */}

        <div
          className="
            mt-6
            grid
            grid-cols-1
            gap-6
            lg:grid-cols-3
          "
        >

          {/* ==============================================
              INFORMACIÓN PERSONAL
          =============================================== */}

          <section
            className="
              rounded-2xl
              bg-white
              p-6
              shadow-lg
              shadow-canwash-dark/5
              lg:col-span-2
            "
          >

            <div
              className="
                flex
                items-center
                justify-between
                gap-4
              "
            >

              <div>

                <h2 className="text-xl font-bold text-canwash-dark">
                  Información personal
                </h2>

                <p className="mt-1 text-sm text-canwash-muted">
                  Información asociada a tu cuenta.
                </p>

              </div>


              {/* FUTURO: EDITAR PERFIL */}

              <button
                type="button"
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
                  hover:bg-canwash-background
                "
              >
                <Edit3 size={17} />

                <span className="hidden sm:inline">
                  Editar
                </span>
              </button>

            </div>


            {/* DATOS */}

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
                icon={<User size={19} />}
                label="Nombre"
                value={user?.nombre}
              />


              <ProfileInformation
                icon={<Mail size={19} />}
                label="Correo electrónico"
                value={user?.email}
              />


              <ProfileInformation
                icon={<Phone size={19} />}
                label="Teléfono"
                value="Sin registrar"
              />


              <ProfileInformation
                icon={<ShieldCheck size={19} />}
                label="Tipo de cuenta"
                value={user?.rol}
              />

            </div>

          </section>


          {/* ==============================================
              SEGURIDAD
          =============================================== */}

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


            <h2 className="mt-5 text-lg font-bold text-canwash-dark">
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
              Administra la seguridad y las credenciales
              de tu cuenta.
            </p>


            {/* FUTURO: CAMBIAR CONTRASEÑA */}

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


        {/* ================================================
            SECCIÓN FUTURA
        ================================================= */}

        <section
          className="
            mt-6
            rounded-2xl
            border
            border-dashed
            border-canwash-light
            bg-white/50
            p-6
          "
        >

          <h2 className="font-bold text-canwash-dark">
            Próximamente
          </h2>


          <p
            className="
              mt-2
              text-sm
              leading-6
              text-canwash-muted
            "
          >
            En esta sección podrás agregar posteriormente
            configuraciones, preferencias, información de
            contacto u otras funciones relacionadas con el
            perfil.
          </p>

        </section>
        <div className="mt-6">
  <LocationMap />
</div>

      </main>

    </div>
  );
}


/* =========================================================
   INFORMACIÓN DEL PERFIL
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
          {value || "Sin registrar"}
        </strong>

      </div>

    </div>
  );
}


export default Profile;