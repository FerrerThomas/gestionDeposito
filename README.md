# Sistema de Gestión de Depósito

Sistema web para gestionar inventario y localizar productos dentro de un depósito.

## 🚀 Características

- **Plano interactivo del depósito** con sectores visuales
- **Búsqueda avanzada** de productos con filtros
- **Gestión de stock** con importación desde CSV
- **Alertas automáticas** para productos con stock bajo
- **Actualización semanal** de inventario
- **Panel de administración** completo

## 🛠️ Tecnologías

- **Frontend**: Next.js 15, React 19, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de datos**: MongoDB
- **UI**: shadcn/ui, Radix UI
- **Iconos**: Lucide React

## 📦 Instalación

1. Clona el repositorio:
\`\`\`bash
git clone <tu-repositorio>
cd warehouse-management
\`\`\`

2. Instala las dependencias:
\`\`\`bash
npm install
\`\`\`

3. Configura las variables de entorno:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Edita `.env.local` con tu conexión a MongoDB:
\`\`\`env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/warehouse_management
\`\`\`

5. Ejecuta el proyecto:
\`\`\`bash
npm run dev
\`\`\`

## 🌐 Deployment en Vercel

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en Vercel Dashboard
3. Deploy automático

## 📊 Uso

1. **Importar productos**: Sube tu CSV con la guía de producción
2. **Actualizar stock**: Importa semanalmente el archivo de stock actual
3. **Monitorear**: Revisa productos con stock bajo en tiempo real
4. **Gestionar**: Edita productos y asignaciones de sectores

## 🔧 Variables de Entorno

- `MONGODB_URI`: Conexión a MongoDB Atlas
- `NEXT_PUBLIC_APP_URL`: URL de la aplicación (opcional)

## 📁 Estructura del Proyecto

\`\`\`
├── app/
│   ├── api/                 # API Routes
│   ├── components/          # Componentes React
│   ├── hooks/              # Custom Hooks
│   └── page.tsx            # Página principal
├── lib/
│   ├── models/             # Modelos de datos
│   ├── services/           # Servicios de base de datos
│   └── mongodb.js          # Conexión MongoDB
├── scripts/                # Scripts de utilidad
└── components/ui/          # Componentes UI (shadcn)
\`\`\`

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

MIT License
