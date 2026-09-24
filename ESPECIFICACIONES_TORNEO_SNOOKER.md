# 🎱 PLATAFORMA DE GESTIÓN - TORNEO SNOOKER BLACKPOOL MADRID

## 📋 RESUMEN EJECUTIVO

Plataforma web para gestionar un torneo de snooker con **32 jugadores**, distribuidos en **8 grupos de 4 personas**, celebrado en **2 sedes** (Vallecas y Alcobendas).

**Objetivo:** Interface visual, intuitiva y práctica para gestionar resultados, puntuaciones y avance del torneo en tiempo real.

**Formato:** Grupos de 4 → 16avos de Final → Semis → Final  
**Acceso:** Web pública en Netlify (accesible desde cualquier dispositivo con internet)

---

## 📊 ESTRUCTURA DEL TORNEO - RESUMEN VISUAL

```
🎱 TORNEO SNOOKER BLACKPOOL - 32 JUGADORES

┌─────────────────────────────────┐
│   FASE 1: GRUPOS (Fin Sábado)   │
├─────────────────────────────────┤
│ VALLECAS (4 Grupos)             │
│ ├─ Grupo 1: Jug 1-2-3-4         │
│ ├─ Grupo 2: Jug 5-6-7-8         │
│ ├─ Grupo 3: Jug 9-10-11-12      │
│ └─ Grupo 4: Jug 13-14-15-16     │
│                                  │
│ ALCOBENDAS (4 Grupos)           │
│ ├─ Grupo 5: Jug 17-18-19-20     │
│ ├─ Grupo 6: Jug 21-22-23-24     │
│ ├─ Grupo 7: Jug 25-26-27-28     │
│ └─ Grupo 8: Jug 29-30-31-32     │
│                                  │
│ Por grupo: 6 partidos (3 mesas)  │
│ Total: 48 partidos en grupos     │
└─────────────────────────────────┘
         ↓ (Ganador 1º y 2º)
┌─────────────────────────────────┐
│  FASE 2: 16avos (Sábado noche)  │
├─────────────────────────────────┤
│ 1º Gr1 vs 2º Gr2 | 1º Gr3 vs 2º Gr4 │
│ 1º Gr5 vs 2º Gr6 | 1º Gr7 vs 2º Gr8 │
│ (16 partidos = 16 ganadores)     │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│  FASE 3: 8avos (Domingo)        │
├─────────────────────────────────┤
│ 8 partidos = 8 ganadores        │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│  FASE 4: Semis (Domingo)        │
├─────────────────────────────────┤
│ 2 partidos = 2 finalistas       │
└─────────────────────────────────┘
         ↓
┌─────────────────────────────────┐
│  FASE 5: FINAL (Domingo)        │
├─────────────────────────────────┤
│ 1 partido = 🏆 CAMPEÓN 🏆       │
└─────────────────────────────────┘
```

---

## 🎯 REQUISITOS PRINCIPALES

### 1. **FUNCIONALIDAD DE RESULTADOS - PRIORIDAD MÁXIMA ⭐**

#### Estructura de Grupos de 4

- **Total:** 32 jugadores
- **Grupos:** 8 grupos de 4 personas (4 en Vallecas, 4 en Alcobendas)
- **Partidos por grupo:** 6 partidos
  - Jugador 1 vs Jugador 2
  - Jugador 1 vs Jugador 3
  - Jugador 1 vs Jugador 4
  - Jugador 2 vs Jugador 3
  - Jugador 2 vs Jugador 4
  - Jugador 3 vs Jugador 4

#### Entrada de Puntuación por Frame

- **Cada partido** = Mejor de 3 frames (gana quien llega a 2)
- **Por cada frame jugado**, se debe poder registrar:
  - ✅ Frames ganados (0, 1 o 2)
  - ✅ **Puntos hechos en ese frame** (puntuación individual)

#### Ejemplo:

```
Partido: Jugador 1 vs Jugador 2 (Grupo 1)

Frame 1: Jugador 1: 87 puntos → Gana frame (1-0)
Frame 2: Jugador 2: 102 puntos → Gana frame (1-1)
Frame 3: Jugador 1: 65 puntos → Gana frame (2-1)

RESULTADO FINAL: Jugador 1 gana 2-1
Puntos Totales: Jugador 1 = 152 pts | Jugador 2 = 102 pts
```

#### Sistema de Desempate en Grupos

Si dos jugadores tienen **mismos frames ganados**, se desempatan por:

- **Total de puntos acumulados en todos los frames jugados**
- Ejemplo: Jugador A (4 frames ganados, 250 pts) vs Jugador B (4 frames ganados, 230 pts) → Gana A

---

### 2. **INTERFAZ DE PARTIDOS - VISUAL & PRÁCTICA**

#### Ventana de Partidos (Separada por Sede)

**Tab 1: PARTIDOS VALLECAS**

- Muestra todos los partidos del grupo de Vallecas
- Tabla con columnas:
  - Grupo
  - Jugador 1 | Jugador 2 | Jugador 3
  - Inputs para **Frames** (0, 1, 2)
  - Inputs para **Puntos en Frame**
  - Estado (Pendiente / Completado)

**Tab 2: PARTIDOS ALCOBENDAS**

- Misma estructura que Vallecas
- Partidos exclusivos de Alcobendas

#### Diseño del Match Card

```
┌─ GRUPO 1 - VALLECAS ──────────────────┐
│                                        │
│ Frame 1:  [Puntos]  Jugador 1  vs  Jugador 2  [Ganador] │
│           [0-100] input         input          Dropdown │
│                                                          │
│ Frame 2:  [Puntos]  Jugador 1  vs  Jugador 3  [Ganador] │
│           [0-100] input         input          Dropdown │
│                                                          │
│ Frame 3:  [Puntos]  Jugador 2  vs  Jugador 3  [Ganador] │
│           [0-100] input         input          Dropdown │
│                                                          │
│ RESULTADO: 2-1  |  Pts: 250-180  |  [Guardar]           │
└──────────────────────────────────────────────────────────┘
```

---

### 3. **INTERFAZ DE GRUPOS - CLASIFICACIÓN EN VIVO**

#### Tab de Grupos - Vista General

Mostrar **dos tablas separadas**: una por sede

**GRUPOS VALLECAS (Grupos 1-4)**
| Pos | Grupo | Jugador | Frames Ganados | Puntos Totales | Partidos Ganados | Estado |
|-----|-------|---------|----------------|----------------|------------------|--------|
| 1º | Gr.1 | Jug. 1 | 6 | 487 pts | 3 ganados | ✅ |
| 2º | Gr.1 | Jug. 2 | 5 | 425 pts | 2 ganados | ✅ |
| 3º | Gr.1 | Jug. 3 | 3 | 312 pts | 1 ganado | ✅ |
| 4º | Gr.1 | Jug. 4 | 2 | 189 pts | 0 ganados | ✅ |

**GRUPOS ALCOBENDAS (Grupos 5-8)**
| Pos | Grupo | Jugador | Frames Ganados | Puntos Totales | Partidos Ganados | Estado |
|-----|-------|---------|----------------|----------------|------------------|--------|
| 1º | Gr.5 | Jug. 1 | 6 | 512 pts | 3 ganados | ✅ |
| 2º | Gr.5 | Jug. 3 | 5 | 468 pts | 2 ganados | ✅ |
| 3º | Gr.5 | Jug. 2 | 3 | 298 pts | 1 ganado | ✅ |
| 4º | Gr.5 | Jug. 4 | 2 | 145 pts | 0 ganados | ⏳ |

#### Información Mostrada

- **Posición en el grupo**
- **Nombre del jugador** (Jugador 1, 2, 3)
- **Frames ganados** (total de frames que ha ganado)
- **Puntos totales** (suma de todos los puntos en todos los frames)
- **Oponentes vencidos** (cuántos jugadores ha ganado)
- **Estado** (Completado ✅ / En progreso ⏳)

---

### 4. **DETALLES POR FRAME - DESGLOSE INDIVIDUAL**

#### Tab: Desglose por Frame

Permite ver **frame a frame** lo que pasó en cada partido.

**Estructura:**

```
Grupo 1 - Frame 1: Jugador 1 vs Jugador 2
├─ Jugador 1: 87 puntos → GANA FRAME ✅
├─ Jugador 2: 45 puntos
└─ Resultado: 1-0

Grupo 1 - Frame 2: Jugador 1 vs Jugador 3
├─ Jugador 1: 62 puntos
├─ Jugador 3: 104 puntos → GANA FRAME ✅
└─ Resultado: 1-1
```

Esto permite **analizar el rendimiento individual en cada frame** y verificar los desempates.

---

### 5. **NOMENCLATURA DE JUGADORES**

**Sistema Simple:**

- Jugador 1
- Jugador 2
- Jugador 3
- Jugador 4

_Por cada grupo de 4_

**Ventaja:** Fácil entrada de datos. Se puede agregar un campo "Nombre" opcional si se desea personalizar más adelante.

**Por grupo:** 4 jugadores × 8 grupos = 32 jugadores totales

---

### 6. **PERSISTENCIA DE DATOS - GUARDADO AUTOMÁTICO ⭐ IMPORTANTE**

### Requisito Crítico:

Si un usuario **guarda datos el viernes**, cierra la web y vuelve el **sábado**, los datos deben estar:

- ✅ Guardados y visibles
- ✅ Actualizados con la información anterior
- ✅ Listos para añadir nuevos resultados

### **SISTEMA ELEGIDO: LocalStorage + Netlify ✅**

#### Cómo Funciona:

```
1. Los datos se guardan en el navegador (LocalStorage)
   - Viernes: Ingresa resultados, se guardan automáticamente
   - Sábado: Abre la web, todos los datos están allí
   - Domingo: Continúa con nuevos resultados

2. Se sube a Netlify (hosting gratuito)
   - Accesible desde cualquier dispositivo con internet
   - URL pública: https://torneo-snooker-blackpool.netlify.app
   - Todos pueden acceder y ver puntuaciones en vivo

3. Sincronización:
   - Un dispositivo (árbitro/organizador) ingresa resultados
   - Los datos se guardan en LocalStorage de ese dispositivo
   - Se puede compartir pantalla o QR para que otros vean en vivo
```

#### Ventajas de Esta Solución:

✅ **Fácil de implementar** - Solo HTML + JavaScript, sin servidor  
✅ **Gratis** - Netlify es hosting gratuito  
✅ **Rápido** - Los datos se guardan al instante  
✅ **Compartible** - Accesible desde cualquier navegador  
✅ **Persistente** - Los datos se conservan entre sesiones

#### Limitaciones y Soluciones:

| Limitación                               | Solución                                                  |
| ---------------------------------------- | --------------------------------------------------------- |
| Datos solo en ese navegador              | Usar un dispositivo central (iPad/Laptop del árbitro)     |
| No sincroniza entre dispositivos         | Proyectar pantalla o compartir QR para visualizar en vivo |
| Si se limpia navegador, se pierden datos | Botón de "Exportar Datos" para descargar backup en JSON   |

#### **Texto a incluir en el copy:**

```markdown
### 💾 Cómo Guardan los Datos

**LocalStorage + Netlify:**

- Los resultados se guardan automáticamente en el navegador
- Los datos persisten aunque cierres la web
- Accesible desde: https://torneo-snooker-blackpool.netlify.app
- Todos pueden ver las puntuaciones en vivo

**¿Cómo funciona?**

1. El árbitro ingresa resultados en el dispositivo principal (iPad/Laptop)
2. Los datos se guardan automáticamente
3. Otros pueden ver en vivo proyectando pantalla o via QR
4. Si necesitas backup, descarga tus datos en JSON

**Ventajas:**
✅ Guardado instantáneo (sin lag)
✅ Accesible desde cualquier navegador
✅ Funciona sin conexión (datos locales)
✅ Fácil backup y recuperación
```

---

### 7. **BOTÓN DE REINICIO - RESET COMPLETO**

#### Función:

- **Botón "🔄 Reiniciar Torneo"** en la sección de administración
- Elimina TODOS los datos de resultados
- **Mantiene la estructura de grupos y jugadores**
- Ideal para: Pruebas iniciales

#### Confirmación de Seguridad:

```
⚠️ ADVERTENCIA
¿Estás seguro de que deseas reiniciar TODOS los resultados?
Esta acción no se puede deshacer.

[Cancelar]  [Sí, Reiniciar]
```

#### Donde incluirlo:

- Panel de administración (esquina superior derecha)
- O pie de página
- Con icono de advertencia visible

---

### 8. **INTEGRACIÓN DE IMÁGENES - CARPETA IMG**

### Imágenes a Usar:

**Carpeta:** `/IMG/`

- **Imagen 1:** Logo o foto del club Blackpool (para header)
- **Imagen 2:** Foto de mesa de snooker (para background o decoración)

**Nota:** Las imágenes deben ir en la misma carpeta que el archivo HTML cuando se suba a Netlify

### Lugares de Integración:

#### **Header de la Web**

```html
[Logo Blackpool] 🎱 TORNEO SNOOKER BLACKPOOL MADRID 🎱 Vallecas & Alcobendas
```

#### **Background o Decoración**

- Imagen de mesa como fondo sutil en los cards
- O como decoración lateral

#### **Recomendación:**

Que sea **visual pero no invasivo**. Los datos deben ser lo principal, las imágenes complementarias.

---

### 9. **DISEÑO VISUAL - GUÍA DE ESTILOS**

#### Colores (Tema Oscuro - Snooker)

```
🎨 Paleta Principal:
- Fondo Primario: #1a1a2e (Gris oscuro)
- Fondo Secundario: #16213e (Azul muy oscuro)
- Acento Dorado: #e8b749 (Dorado/Amarillo)
- Tabla Verde: #0f5c3d (Verde mesa snooker)
- Texto Principal: #e0e0e0 (Gris claro)
- Texto Secundario: #a0a0a0 (Gris medio)
```

#### Componentes Visuales

- **Cards:** Bordes dorados, fondo oscuro
- **Botones:** Dorado con efecto hover
- **Inputs:** Fondo oscuro, borde dorado
- **Tablas:** Verde de mesa en encabezados
- **Icons:** Emojis relevantes (🎱, ✅, ⏳, etc.)

---

### 10. **FLUJO DE USO TÍPICO**

### Día 1 (Viernes)

```
1. Abre la web
2. Va a Tab "Partidos Vallecas"
3. Encuentra Grupo 1
4. Ingresa resultados:
   - Frame 1: Jug. 1 (87 pts) vs Jug. 2 (45 pts) → Gana Jug. 1
   - Frame 2: Jug. 1 (62 pts) vs Jug. 3 (104 pts) → Gana Jug. 3
   - Frame 3: Jug. 2 (98 pts) vs Jug. 3 (110 pts) → Gana Jug. 3
5. Clickea [Guardar Grupo 1]
6. Verifica en Tab "Grupos" la clasificación actualizada
7. Continúa con Grupo 2, 3, etc.
```

### Día 2 (Sábado - Continúa)

```
1. Abre la web
2. Ve que todos los datos del viernes están ahí ✅
3. Continúa ingresando más resultados
4. La tabla de "Grupos" se actualiza automáticamente
```

---

### 11. **ESTRUCTURA DE NAVEGACIÓN PROPUESTA**

```
🎱 TORNEO SNOOKER BLACKPOOL
├─ 📊 PARTIDOS
│  ├─ Vallecas (Grupos 1-4)
│  └─ Alcobendas (Grupos 5-8)
├─ 🏆 GRUPOS (Clasificación)
│  ├─ Vallecas (Gr. 1-4)
│  └─ Alcobendas (Gr. 5-8)
├─ 📈 DESGLOSE BY FRAME
│  ├─ Vallecas (Gr. 1-4)
│  └─ Alcobendas (Gr. 5-8)
└─ ⚙️ ADMINISTRACIÓN
   ├─ 💾 Exportar Datos (JSON)
   ├─ 📥 Importar Datos
   ├─ 🔄 Reiniciar Torneo
   └─ ℹ️ Información
```

---

### 12. **✅ VIABILIDAD DE HORARIOS - 32 JUGADORES EN GRUPOS DE 4**

#### Cálculo de Partidos:

```
32 jugadores = 8 grupos de 4
Partidos por grupo de 4: 6 partidos
  - Jugador 1 vs 2, 1 vs 3, 1 vs 4
  - Jugador 2 vs 3, 2 vs 4, 3 vs 4

Total partidos en grupos: 8 × 6 = 48 partidos
Tiempo total: 48 partidos × 1.5h = 72 horas de juego
```

#### Disponibilidad de Horas:

```
VALLECAS (Grupos 1-4: 24 partidos)
├─ Viernes 12:00-22:00 = 10 horas × 3 mesas = 30 horas útiles
├─ Sábado 09:00-22:00 = 13 horas × 3 mesas = 39 horas útiles
└─ Total: 69 horas disponibles (suficiente para 36 horas necesarias)

ALCOBENDAS (Grupos 5-8: 24 partidos)
├─ Viernes 12:00-22:00 = 10 horas × 3 mesas = 30 horas útiles
├─ Sábado 09:00-22:00 = 13 horas × 3 mesas = 39 horas útiles
└─ Total: 69 horas disponibles (suficiente para 36 horas necesarias)

FASES FINALES (16avos, 8avos, Semis, Final)
├─ Sábado tarde/noche = 12 partidos mínimo (~18 horas)
└─ Domingo = 4-8 partidos (~6-12 horas)
```

#### ✅ CONCLUSIÓN: **VIABLE Y HOLGADO**

```
✅ Hay MÁS que suficiente tiempo para completar todas las fases
✅ Cada sede tiene 3 mesas para optimizar el uso de tiempo
✅ Grupos de 4 funcionan mejor que grupos de 3 (más equilibrado)
✅ Permite descansos y ajustes sin perder tiempo
✅ Se pueden hacer todas las fases sin prisas
```

#### Recomendaciones:

- Mantener una **mesa de reserva** por si hay retrasos
- **Descansos cortos** (15-20 min) entre partidos
- Los árbitros pueden rotar para no saturarse
- Flexibilidad en horarios si es necesario

---

### 13. **RESPONSIVE & USABILIDAD**

#### Requisitos:

- ✅ Funcione bien en **desktop** (principal)
- ✅ Funcione en **tablets** (para mesas durante el torneo)
- ✅ Interfaz **simple e intuitiva** (sin complicaciones)
- ✅ Inputs **grandes y claros** (fáciles de usar durante partidos)
- ✅ Colores con **buen contraste** (legible incluso bajo luces de snooker)

---

## 🖼️ WIREFRAME BÁSICO - PÁGINA PRINCIPAL

```
┌────────────────────────────────────────────────────┐
│ [Logo] 🎱 TORNEO SNOOKER BLACKPOOL 🎱             │
│        Vallecas & Alcobendas                       │
└────────────────────────────────────────────────────┘

┌─ TABS ─────────────────────────────────────────────┐
│ [PARTIDOS] [GRUPOS] [FRAMES] [ADMIN]               │
└────────────────────────────────────────────────────┘

┌─ SUB-TABS (si aplica) ─────────────────────────────┐
│ [Vallecas] [Alcobendas]                            │
└────────────────────────────────────────────────────┘

┌─ CONTENIDO PRINCIPAL ──────────────────────────────┐
│                                                     │
│  Grupo 1 - Vallecas (4 Jugadores - 6 Partidos)    │
│  ┌─────────────────────────────────────────────┐   │
│  │ Partido 1: Jug 1 vs Jug 2                   │   │
│  │   F1: Jug 1 (87) vs Jug 2 (45) → Gana Jug1 │   │
│  │   F2: Jug 1 (62) vs Jug 2 (98) → Gana Jug2 │   │
│  │   F3: Jug 1 (75) vs Jug 2 (60) → Gana Jug1 │   │
│  │   Resultado: 2-1 a Jug 1 ✅                │   │
│  │                                              │   │
│  │ Partido 2: Jug 1 vs Jug 3 [Similar]        │   │
│  │ Partido 3: Jug 1 vs Jug 4 [Similar]        │   │
│  │ Partido 4: Jug 2 vs Jug 3 [Similar]        │   │
│  │ Partido 5: Jug 2 vs Jug 4 [Similar]        │   │
│  │ Partido 6: Jug 3 vs Jug 4 [Similar]        │   │
│  │                                              │   │
│  │ [Guardar Grupo 1] [Cancelar]                │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
│  Grupo 2 - Vallecas                                │
│  ┌─────────────────────────────────────────────┐   │
│  │ [Similar al anterior]                       │   │
│  └─────────────────────────────────────────────┘   │
│                                                     │
└────────────────────────────────────────────────────┘
```

---

## 📝 COPY - TEXTOS A INCLUIR EN LA WEB

### Header

```
🎱 TORNEO SNOOKER BLACKPOOL MADRID
Gestión de Resultados - Fase de Grupos

Vallecas (VF) | Alcobendas (BBM)
```

### Tab: PARTIDOS

```
Ingresa los resultados de los partidos jugados.
Formato: Mejor de 3 Frames (gana quien llegue a 2)

Por cada frame, anota:
• Puntos del Jugador 1
• Puntos del Jugador 2
• Ganador del frame (automático por puntos)
```

### Tab: GRUPOS

```
Clasificación en vivo de todos los grupos.

📊 Leyenda:
• Frames Ganados: Total de frames ganados en el grupo
• Puntos Totales: Suma de todos los puntos en todos los frames
• Estado: ✅ Grupo completado | ⏳ En progreso

En caso de desempate en frames, gana quien tenga más puntos totales.
```

### Tab: FRAMES

```
Desglose detallado de cada frame jugado.
Útil para verificar resultados y análisis individual.
```

### Admin / Reinicio

```
⚠️ ZONA DE ADMINISTRACIÓN

🔄 Reiniciar Torneo
Elimina TODOS los resultados y vuelve a empezar.
ATENCIÓN: Esta acción no se puede deshacer.

[Reiniciar]  [Cancelar]
```

---

## ✅ CHECKLIST FINAL - LO QUE LA WEB DEBE HACER

**Funcionalidad Core:**

- [x] **32 jugadores en 8 grupos de 4** (4 Vallecas, 4 Alcobendas)
- [x] **Entrada de puntos por frame** (no solo frames ganados)
- [x] **Mejor de 3 frames** (gana con 2)
- [x] **6 partidos por grupo** (todas las combinaciones)
- [x] **Desempate por puntos totales** (si hay igualdad en frames)

**Interfaz & Navegación:**

- [ ] **Tab de Partidos** - Separados por sede (Vallecas/Alcobendas)
- [ ] **Tab de Grupos** - Tabla de clasificación en vivo
- [ ] **Tab de Frames** - Desglose individual de cada frame
- [ ] **Tab de Admin** - Reinicio, Exportar, Importar

**Persistencia & Hosting:**

- [ ] **LocalStorage** - Guardado automático en navegador
- [ ] **Netlify** - Hosting gratuito y accesible públicamente
- [ ] **Datos persistentes** - Se conservan al cerrar/abrir
- [ ] **Botón Exportar** - Descargar backup en JSON
- [ ] **Botón Importar** - Recuperar datos desde backup

**Visualización & Diseño:**

- [ ] **Tema oscuro** - Colores snooker (verde, dorado, gris)
- [ ] **Integración de imágenes** - Logo + Foto de mesa
- [ ] **Responsive** - Desktop + Tablet
- [ ] **Inputs grandes y claros** - Fácil lectura y uso
- [ ] **Nomenclatura simple** - Jugador 1, 2, 3, 4

**Extras:**

- [ ] **Botón Reinicio** - Con confirmación de seguridad
- [ ] **Visual e intuitivo** - Sin necesidad de instrucciones
- [ ] **QR o pantalla compartida** - Para que otros vean en vivo

---

## 🎯 PRÓXIMOS PASOS

1. ✅ **Revisar especificaciones** (32 jugadores, 8 grupos de 4)
2. 📸 **Envía las 2 imágenes** de la carpeta IMG
3. 💻 **Crear web funcional** con:
   - LocalStorage para persistencia
   - Netlify para hosting público
   - Todos los requisitos del checklist
4. 🧪 **Hacer pruebas** antes del torneo
5. 🚀 **Deploy a Netlify** - URL pública para acceso de todos
6. 🎱 **¡A jugar!**

---

### 📌 IMPORTANTE - Sobre Netlify + LocalStorage

**¿Cómo funciona?**

- La web se sube a Netlify (gratuito)
- URL pública: `https://torneo-snooker-blackpool.netlify.app`
- Los datos se guardan en LocalStorage del navegador
- Cada dispositivo que acceda tiene sus propios datos

**¿Para compartir datos entre dispositivos?**

- Un dispositivo central (iPad/Laptop) es "el árbitro"
- Ese dispositivo ingresa todos los resultados
- Los demás ven via:
  - 🖥️ Proyección de pantalla (en las sedes)
  - 📱 QR que lleva a la misma URL
  - 📊 Compartir pestañas del navegador

**¿Y si se cierra el navegador?**

- ✅ Los datos siguen en LocalStorage
- ✅ Se recuperan al abrir de nuevo
- 💾 Opción de Exportar/Importar como backup

---

## 🚀 GUÍA RÁPIDA - DESPLIEGUE A NETLIFY

### Paso 1: Preparar Archivos

```
Carpeta del proyecto:
├─ index.html (la web)
├─ IMG/
│  ├─ logo-blackpool.png
│  └─ mesa-snooker.jpg
└─ (eso es todo!)
```

### Paso 2: Subir a Netlify (Opción Fácil)

```
1. Ir a netlify.com
2. Opción "Drag & Drop Deploy"
3. Arrastra la carpeta del proyecto
4. ¡Listo! Recibes URL pública automática
```

### Paso 3: Compartir

```
URL pública: https://tu-app.netlify.app
QR generado automáticamente para compartir
```

### Paso 4: Usar

```
- Un dispositivo (organizador) ingresa resultados
- LocalStorage guarda automáticamente
- Otros dispositivos ven via QR/pantalla compartida
- Todos pueden acceder desde navegador
```

---

## 📞 SOPORTE TÉCNICO

**Si hay problemas con:**

- LocalStorage: Los datos se guardan en el navegador (no servidor)
- Netlify: Es gratuito, estable y rápido
- Imágenes: Deben estar en la carpeta IMG en el mismo lugar que HTML

---

**Versión:** 1.0 ACTUALIZADO  
**Fecha:** Octubre 2026
**Estado:** Especificaciones Finales  
**Formato:** 32 Jugadores | 8 Grupos de 4  
**Hosting:** LocalStorage + Netlify  
**Acceso:** Público vía URL pública
