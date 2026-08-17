# Rastreador de Hábitos

Una aplicación web diseñada para ayudarte a construir y mantener buenos hábitos diarios. Resuelve el problema de la falta de consistencia al permitirte llevar un registro visual de tu progreso, interactuar con una comunidad de apoyo y recibir inspiración diaria.

🔗 **Demo en vivo:** [https://habitos-rastreador.vercel.app/](https://habitos-rastreador.vercel.app/)

## Capturas de pantalla
*(Añadir aquí las imágenes de tu proyecto)*
- [Dashboard Principal]
- [Vista de la Comunidad]
- [Panel del Coach]

## Stack tecnológico
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Supabase (PostgreSQL + Auth)
- Vercel (deploy)

## Roles de usuario
- **user**: Puede crear, editar y eliminar sus propios hábitos, marcar su progreso diario y participar activamente en la comunidad mediante publicaciones y comentarios.
- **coach**: Tiene acceso a un panel de administración exclusivo para gestionar plantillas globales, monitorear el registro de los estudiantes y moderar (eliminar) publicaciones o comentarios de la comunidad.

## Modelo de datos
La base de datos relacional en Supabase consta de las siguientes tablas principales:
- **`profiles`**: Extiende la tabla nativa `auth.users`. Almacena el `name` y el `role` del usuario.
- **`habits`**: Almacena los hábitos (`name`, `color`). Tiene una llave foránea `user_id` conectada a `profiles`.
- **`habit_logs`**: Guarda el registro diario de cumplimiento. Tiene una llave foránea `habit_id` conectada a `habits`.
- **`blog_posts`**: Almacena las publicaciones de la comunidad. Tiene una llave foránea `author_id` conectada a `profiles`.

*(Todas las tablas cuentan con protección Row Level Security (RLS) configurada).*

## Instalación local
Sigue estos pasos para ejecutar el proyecto en tu entorno local:

```bash
git clone https://github.com/Past-Alex/DeberProgramaci-n.git
cd DeberProgramaci-n
npm install
cp .env.example .env.local
# IMPORTANTE: Abre .env.local y completa con tus credenciales reales de Supabase
npm run dev
```

## Variables de entorno
Para que el proyecto funcione, necesitas crear un archivo `.env.local` con las siguientes variables (obtenidas desde tu panel de Supabase):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Credenciales de prueba
Para facilitar la revisión por parte del docente, puedes utilizar estas cuentas:
- **Rol 1 (Estudiante / User):** `estudiante@ejemplo.com` / `123456`
- **Rol 2 (Coach / Admin):** `coach@ejemplo.com` / `123456`
*(Nota: Asegúrate de crear estos usuarios en tu Supabase local o de producción antes de entregar).*

## Funcionalidades
A continuación, el checklist de los requisitos técnicos cumplidos:
- [x] **Rutas públicas y privadas:** Implementación de rutas públicas (`/`, `/explorar`) y rutas privadas protegidas por middleware (`/dashboard`). Rutas dinámicas (`/habito/[id]`).
- [x] **Base de datos en Supabase:** 4 tablas interconectadas con llaves foráneas y seguridad RLS activada.
- [x] **Autenticación:** Flujo completo de registro, inicio y cierre de sesión con Supabase Auth. El rol se guarda en la DB, no en el código.
- [x] **Operaciones CRUD:** Creación, lectura, actualización y eliminación de Hábitos y Publicaciones mediante **Server Actions**.
- [x] **Interactividad en el cliente:** Componente de búsqueda en tiempo real en la Comunidad usando `useState`, con correcta separación de Client y Server Components.
- [x] **Consumo de API Externa:** Petición asíncrona a la API pública de DummyJSON (mediante `fetch` y `async/await` desde un Server Component) para mostrar frases motivacionales diarias.

## Autor
- **Alex Palma** - [Mi GitHub](https://github.com/Past-Alex)
