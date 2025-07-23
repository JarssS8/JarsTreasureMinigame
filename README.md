# 🏴‍☠️ Jars Treasure Minigame

Un minijuego de búsqueda del tesoro para FiveM desarrollado por JarssS8. Los jugadores deben encontrar una celda oculta en una cuadrícula antes de que se agote el tiempo o los intentos.

## 🎥 Video Demostración

[![Video Demostración](https://img.shields.io/badge/🎬-Ver%20Demo-red?style=for-the-badge)](https://youtu.be/kaVq1YsJrPo)

> Haz clic en el enlace para ver el minijuego en acción con todas sus características y modos de juego.

## 📋 Características

- **Múltiples modos de pista**: Números, iconos o sin pistas
- **Modos visuales**: Con colores o sin colores
- **Cuadrícula personalizable**
- **Sistema de intentos limitados**
- **Temporizador configurable**
- **Integración con QB-Core**
- **Interfaz web responsive**
- **Sistema de debug completo**

## 🚀 Instalación

1. Descarga el recurso y colócalo en tu carpeta de recursos
2. Agrega `ensure jars-minigames` a tu `server.cfg`
3. Reinicia el servidor o ejecuta `refresh` y `start jars-minigames`


## ⚙️ Configuración

### Archivo `shared.lua`

```lua
JTM.Config = {
    Debug = false,          -- Habilita/deshabilita el modo debug
    HintMode = "number",    -- Modo de pistas: "number", "icons", "none"
    VisualMode = "color",   -- Modo visual: "color", "nocolor"
    GridSize = 5,           -- Tamaño de la cuadrícula (3-10)
    Attempts = 8,           -- Número de intentos permitidos
    Time = 10,              -- Tiempo límite en segundos
    -- Configuración de verificación de versión
    CheckVersion = true,    -- Verificar actualizaciones al iniciar
    GitHubRepo = "JarssS8/JarsTreasureMinigame"
}
```

### Parámetros de Configuración

| Parámetro | Tipo | Valores | Descripción |
|-----------|------|---------|-------------|
| `Debug` | boolean | `true/false` | Habilita mensajes de debug y comando de prueba |
| `HintMode` | string | `"number"`, `"icons"`, `"none"` | Tipo de pistas mostradas |
| `VisualMode` | string | `"color"`, `"nocolor"` | Si mostrar colores en las celdas |
| `GridSize` | number | `3-10` | Tamaño de la cuadrícula (NxN) |
| `Attempts` | number | `1-99` | Número máximo de intentos |
| `Time` | number | `5-300` | Tiempo límite en segundos |
| `CheckVersion` | boolean | `true/false` | Verificar actualizaciones automáticamente |
| `GitHubRepo` | string | `"owner/repo"` | Repositorio de GitHub para verificar versiones |

## 🎮 Uso

### Para Desarrolladores

```lua
-- Iniciar el minijuego programáticamente
JTM.StartTreasureMinigame(hintMode, visualMode, gridSize, attempts, time)

-- Ejemplo
JTM.StartTreasureMinigame("number", "color", 5, 8, 15)
```

### Comando de Debug

Cuando `Debug = true` en la configuración:

```
/treasure-minigame [hintMode] [visualMode] [gridSize] [attempts] [time]
```

**Ejemplos:**
```bash
/treasure-minigame                          # Usa valores por defecto
/treasure-minigame number color 5 8 10      # Configuración personalizada
/treasure-minigame icons nocolor 7 12 20    # Con iconos y sin colores
/treasure-minigame none color 3 5 30        # Sin pistas, cuadrícula pequeña
```

## 🔄 Sistema de Actualizaciones

El script incluye un sistema automático de verificación de versiones que:

- **Obtiene la versión actual** automáticamente del `fxmanifest.lua` local
- **Verifica actualizaciones** al iniciar el recurso (solo del lado del servidor)
- **Compara versiones** con el repositorio oficial de GitHub
- **Muestra advertencias** únicamente cuando hay actualizaciones disponibles
- **Proporciona enlaces** de descarga directos

### Configuración de Verificación

```lua
CheckVersion = true,    -- Habilitar/deshabilitar verificación automática
GitHubRepo = "JarssS8/JarsTreasureMinigame"  -- Repositorio oficial
```

> **Nota**: La versión actual se obtiene automáticamente del `fxmanifest.lua`, no necesitas configurarla manualmente.

## 🎯 Mecánicas del Juego

### Modos de Pista

- **`"number"`**: Muestra números que indican la proximidad al tesoro
- **`"icons"`**: Utiliza iconos de Font Awesome para las pistas
- **`"none"`**: Sin pistas, solo búsqueda aleatoria

### Modos Visuales

- **`"color"`**: Las celdas cambian de color según la proximidad
- **`"nocolor"`**: Sin indicadores visuales de color

### Sistema de Proximidad

El juego calcula la distancia desde cada celda clickeada hasta el tesoro:
- **Verde/😀**: Muy cerca (distancia ≤ 1)
- **Amarillo/😊**: Cerca (distancia ≤ 2)
- **Naranja/😐**: Medio (distancia ≤ 3)
- **Rojo/😞**: Lejos (distancia > 3)

### Condiciones de Victoria/Derrota

**Victoria**: Encontrar la celda del tesoro
**Derrota**: 
- Se agota el tiempo
- Se agotan los intentos
- El jugador cierra el minijuego (ESC)

## 🔧 Eventos y Callbacks

### Eventos del Servidor

```lua
-- Se dispara cuando el jugador completa el minijuego
RegisterNetEvent('treasure:gameResult')
AddEventHandler('treasure:gameResult', function(hasWon)
    local src = source
    local playerName = GetPlayerName(src)
    -- Agregar lógica de recompensas aquí
end)
```

### Callbacks NUI

```lua
-- Resultado del juego
RegisterNuiCallback('gameResult', function(data, cb)
    -- data.win contiene true/false
    cb('ok')
end)

-- Cierre de la interfaz
RegisterNuiCallback('closeUI', function(data, cb)
    cb('ok')
end)
```

## 🎨 Personalización

### Modificar Estilos

Edita `web/index.html` para cambiar:
- Colores de la interfaz
- Tamaños de las celdas
- Fuentes y efectos
- Iconos de Font Awesome

### Agregar Nuevos Modos

1. Modificar `web/script.js` para nuevos tipos de pista
2. Actualizar la lógica en `setupGame()` y `handleCellClick()`
3. Agregar nuevos estilos CSS si es necesario

## 🐛 Debug y Resolución de Problemas

### Habilitar Debug

```lua
JTM.Config.Debug = true
```

Esto habilitará:
- Mensajes de debug en consola
- Comando `/treasure-minigame`
- Logs detallados de eventos

### Problemas Comunes

| Problema | Solución |
|----------|----------|
| No aparece la interfaz | Verificar que NUI esté funcionando y recursos cargados |
| Notificaciones no funcionan | Confirmar que QB-Core está instalado |
| Comando no funciona | Habilitar `Debug = true` en configuración |
| Errores de JavaScript | Revisar consola F12 del navegador |

### Logs de Debug

Los mensajes de debug siguen este formato:
```
^3[DEBUG] [CLIENT] Mensaje del cliente^7
^3[DEBUG] [SERVER] Mensaje del servidor^7
```

## 📁 Estructura de Archivos

```
jars-minigames/
├── fxmanifest.lua          # Manifiesto del recurso
├── client.lua              # Lógica del cliente
├── server.lua              # Lógica del servidor
├── shared.lua              # Configuración compartida
├── README.md               # Esta documentación
└── web/
    ├── index.html          # Interfaz del minijuego
    └── script.js           # Lógica del frontend
```

## 🔄 Integración con Otros Scripts

### Ejemplo de Uso en un Script de Robos

```lua
-- En tu script de robos
local function startTreasureHack()
    local success = false
    
    -- Registrar evento temporal para el resultado
    RegisterNetEvent('myrobbery:treasureResult')
    AddEventHandler('myrobbery:treasureResult', function(won)
        success = won
    end)
    
    -- Iniciar minijuego
    JTM.StartTreasureMinigame("number", "color", 4, 6, 20)
    
    -- Esperar resultado (implementar tu propia lógica de espera)
    return success
end
```

### Con Frameworks Diferentes

Si no usas QB-Core, modifica la función `Notify` en `shared.lua`:

```lua
Notify = function(text, type)
    -- Para ESX
    TriggerEvent('esx:showNotification', text)
    
    -- Para otros frameworks
    -- TriggerEvent('tuframework:notify', text, type)
end
```

## 📝 Licencia

Desarrollado por **JarssS8** https://github.com/JarssS8. 
Uso libre sin cambiar el nombre del script

## 🤝 Contribuciones

Si encuentras bugs o quieres sugerir mejoras:
1. Reporta issues detalladamente
2. Incluye pasos para reproducir problemas
3. Proporciona logs de debug cuando sea posible

## 📞 Soporte

Para soporte técnico, asegúrate de incluir:
- Versión de FiveM
- Configuración utilizada
- Logs de error completos
- Pasos para reproducir el problema

---

**Versión**: 1.0.0  
**Autor**: JarssS8  
**Compatibilidad**: FiveM
