# 🚀 Guía de Deployment en Vercel

## Pasos para subir a Vercel

### 1. 📋 Preparación previa

**Asegúrate de tener:**
- ✅ Cuenta en [MongoDB Atlas](https://www.mongodb.com/atlas)
- ✅ Base de datos MongoDB configurada
- ✅ Cuenta en [Vercel](https://vercel.com)
- ✅ Repositorio en GitHub/GitLab

### 2. 🗄️ Configurar MongoDB Atlas

1. **Crear cluster** (si no tienes uno):
   - Ve a MongoDB Atlas
   - Crea un nuevo cluster (gratis)
   - Configura usuario y contraseña

2. **Obtener string de conexión**:
   \`\`\`
   mongodb+srv://username:password@cluster.mongodb.net/warehouse_management?retryWrites=true&w=majority
   \`\`\`

3. **Configurar acceso**:
   - En "Network Access" → "Add IP Address" → "Allow access from anywhere" (0.0.0.0/0)
   - O específicamente las IPs de Vercel

### 3. 📤 Subir código a GitHub

\`\`\`bash
# Inicializar git (si no está inicializado)
git init

# Agregar archivos
git add .

# Commit inicial
git commit -m "Initial commit: Sistema de Gestión de Depósito"

# Conectar con GitHub
git remote add origin https://github.com/tu-usuario/warehouse-management.git

# Subir código
git push -u origin main
\`\`\`

### 4. 🌐 Configurar en Vercel

1. **Conectar repositorio**:
   - Ve a [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Importa tu repositorio de GitHub

2. **Configurar variables de entorno**:
   - En el dashboard del proyecto → "Settings" → "Environment Variables"
   - Agregar:
     \`\`\`
     MONGODB_URI = mongodb+srv://username:password@cluster.mongodb.net/warehouse_management?retryWrites=true&w=majority
     \`\`\`

3. **Deploy**:
   - Vercel detectará automáticamente que es Next.js
   - Click "Deploy"

### 5. 🔧 Configuraciones adicionales

**Si tienes problemas de conexión a MongoDB:**

1. **Verificar IPs permitidas** en MongoDB Atlas
2. **Usar variables de entorno** correctas
3. **Verificar string de conexión**

**Para mejor rendimiento:**

1. **Configurar regiones** en Vercel (cerca de tu base de datos)
2. **Optimizar consultas** MongoDB
3. **Usar índices** en la base de datos

### 6. 📊 Inicializar datos

Una vez desplegado:

1. **Ir a tu aplicación** en Vercel
2. **Navegar a "Gestión de Stock"**
3. **Importar tu CSV** de productos
4. **Verificar que todo funcione**

### 7. 🔄 Actualizaciones futuras

\`\`\`bash
# Hacer cambios en el código
git add .
git commit -m "Descripción de cambios"
git push

# Vercel desplegará automáticamente
\`\`\`

## 🚨 Solución de problemas comunes

### Error de conexión a MongoDB
\`\`\`
Error: MongoNetworkError
\`\`\`
**Solución**: Verificar IP whitelist en MongoDB Atlas

### Error de variables de entorno
\`\`\`
Error: MONGODB_URI is not defined
\`\`\`
**Solución**: Configurar variables en Vercel Dashboard

### Error de build
\`\`\`
Error: Module not found
\`\`\`
**Solución**: Verificar que todas las dependencias estén en package.json

### Timeout en API Routes
\`\`\`
Error: Function execution timeout
\`\`\`
**Solución**: Optimizar consultas o aumentar timeout en Vercel

## 📞 Soporte

Si tienes problemas:
1. Revisa los logs en Vercel Dashboard
2. Verifica la conexión a MongoDB
3. Comprueba las variables de entorno
4. Revisa la documentación de Vercel

## 🎉 ¡Listo!

Tu aplicación debería estar funcionando en:
\`\`\`
https://tu-proyecto.vercel.app
