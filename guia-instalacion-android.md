# Guía de Instalación - Compilar UnGlobo para Android

Este documento te guiará paso a paso para compilar el juego UnGlobo y generar un archivo APK instalable en Android.

---

## Requisitos Previos

Antes de comenzar, asegúrate de tener:
- Windows 10/11
- Conexión a internet
- Permisos de administrador en tu PC

---

## Paso 1: Instalar Java JDK 17

### 1.1 Descargar Java
1. Ir a: https://adoptium.net/temurin/releases/?version=17
2. Descargar **"JDK"** (no JRE)
   - **Product/Version**: JDK 17.x.x (LTS)
   - **Operating System**: Windows
   - **Architecture**: x64
   - **Package Type**: Installer (.msi)
3. Ejecutar el archivo `.msi` descargado
4. Aceptar la licencia y completar la instalación

### 1.2 Configurar variable JAVA_HOME
1. Presionar `Windows + R`
2. Escribir: `sysdm.cpl` → Presionar Enter
3. Ir a pestaña **Opciones avanzadas**
4. Clic en **Variables de entorno**
5. En "Variables del sistema", clic en **Nueva**:
   - **Nombre de variable**: `JAVA_HOME`
   - **Valor de variable**: `C:\Program Files\Eclipse Adoptium\jdk-17.0.x-hotspot`
   > ⚠️ **Nota**: Verificar la versión exacta instalada (puede ser 17.0.11, 17.0.12, etc.)

6. Buscar variable `Path` → Seleccionar → **Editar**:
   - Clic en **Nueva** → Escribir: `%JAVA_HOME%\bin`
   - Aceptar todas las ventanas

### 1.3 Verificar instalación
1. Abrir una **nueva terminal** (importante)
2. Escribir:
   ```bash
   java -version
   ```
3. Debe mostrar algo como:
   ```
   openjdk version "17.0.x" 2024-01-01
   ```

---

## Paso 2: Instalar Android Studio

### 2.1 Descargar Android Studio
1. Ir a: https://developer.android.com/studio
2. Descargar **Android Studio** (botón grande)
3. Ejecutar el archivo `.exe`

### 2.2 Configurar Android Studio
1. En el instalador:
   - **Install Type**: Custom
   - **JDK Location**: Seleccionar la carpeta JDK 17 instalada
   - Marcar **Android SDK** ✓
   - Install Location: `C:\Android`

2. Al abrir Android Studio por primera vez:
   - Waiting for "Downloading components..."
   - Complete!

### 2.3 Instalar componentes del SDK
1. En Android Studio: **More Actions** → **SDK Manager**
2. **SDK Platforms** (pestaña):
   - ✅ Android 14 (API 34)
   - ✅ Android 13 (API 33) - opcional
3. **SDK Build-Tools** (pestaña):
   - ✅ 34.0.0
4. Clic en **Apply** → **OK**
5. Aceptar licencias y esperar descarga

### 2.4 Configurar variable ANDROID_HOME
1. En el explorador de archivos, ir a:
   ```
   C:\Users\TU_USUARIO\AppData\Local\Android\Sdk
   ```
2. Copiar esa ruta (será algo así: `C:\Users\ronal\AppData\Local\Android\Sdk`)
3. Crear variable de entorno:
   - **Nombre**: `ANDROID_HOME`
   - **Valor**: `C:\Users\ronal\AppData\Local\Android\Sdk`
   > ⚠️ Reemplazar `TU_USUARIO` con tu nombre de usuario de Windows

---

## Paso 3: Compilar el APK

### 3.1 Preparar el proyecto
1. Abrir terminal en la carpeta del proyecto:
   ```
   C:\Users\ronal\Documents\P001\juegoGlobo
   ```

### 3.2 Sincronizar Capacitor
```bash
npx cap sync android
```

### 3.3 Compilar APK
```bash
npx cap build android
```

### 3.4 Localizar el APK
El APK se genera en:
```
android\app\build\output\apk\debug\app-debug.apk
```

---

## Solución de Problemas

### "java is not recognized"
- Verificar que JAVA_HOME esté bien configurado
- Cerrar y abrir terminal nueva

### "ANDROID_HOME not found"
- Verificar que ANDROID_HOME apunte a la carpeta correcta
- Asegurarse que el SDK está instalado

### Error en compilación
- Verificar que Android Studio esté cerrado
- Ejecutar terminal como Administrador

---

## Instalar APK en el móvil

1. **Por USB**:
   - Conectar celular por USB
   - Habilitar "Depuración USB" en el celular
   - Copiar `app-debug.apk` al celular
   - Abrir el archivo APK en el celular e instalar

2. **Por WiFi** (más fácil):
   - Instalar "ADB WiFi" o similar desde Play Store
   - Conectar PC y celular a misma red WiFi
   - En terminal: `adb pair IP:PUERTO`
   - Luego: `adb install android\app\build\output\apk\debug\app-debug.apk`

---

## ¡Listo!

Una vez completado, tendrás tu juego UnGlobo funcionando en Android como una app nativa.

🎉 ¡Enjoy el juego!
