# 🎱 PLATAFORMA DE GESTIÓN - TORNEO SNOOKER BLACKPOOL MADRID

## 📋 RESUMEN EJECUTIVO

Plataforma web para gestionar un torneo de snooker con **48 jugadores**, distribuidos en **16 grupos de 3 personas**, celebrado en **2 sedes** (Vallecas y Alcobendas). 

**Objetivo:** Interface visual, intuitiva y práctica para gestionar resultados, puntuaciones y avance del torneo en tiempo real.

---

## 🎯 REQUISITOS PRINCIPALES

### 1. **FUNCIONALIDAD DE RESULTADOS - PRIORIDAD MÁXIMA ⭐**

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
- Ejemplo: Jugador A (2 frames, 250 pts) vs Jugador B (2 frames, 230 pts) → Gana A

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

**GRUPOS VALLECAS**
| Pos | Grupo | Jugador | Frames Ganados | Puntos Totales | Oponentes | Estado |
|-----|-------|---------|----------------|----------------|-----------|--------|
| 1º  | Gr.1  | Jug. 1  | 2              | 215 pts        | 2 ganados | ✅     |
| 2º  | Gr.1  | Jug. 2  | 2              | 202 pts        | 2 ganados | ✅     |
| 3º  | Gr.1  | Jug. 3  | 0              | 87 pts         | 0 ganados | ✅     |

**GRUPOS ALCOBENDAS**
| Pos | Grupo | Jugador | Frames Ganados | Puntos Totales | Oponentes | Estado |
|-----|-------|---------|----------------|----------------|-----------|--------|
| 1º  | Gr.9  | Jug. 1  | 2              | 248 pts        | 2 ganados | ✅     |
| 2º  | Gr.9  | Jug. 3  | 2              | 195 pts        | 2 ganados | ✅     |
| 3º  | Gr.9  | Jug. 2  | 0              | 110 pts        | 0 ganados | ⏳     |

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
- (etc.)

**Ventaja:** Fácil entrada de datos. Se puede agregar un campo "Nombre" opcional si se desea personalizar más adelante.

---

### 6. **PERSISTENCIA DE DATOS - GUARDADO AUTOMÁTICO ⭐ IMPORTANTE**

### Requisito Crítico:
Si un usuario **guarda datos el viernes**, cierra la web y vuelve el **sábado**, los datos deben estar:
- ✅ Guardados y visibles
- ✅ Actualizados con la información anterior
- ✅ Listos para añadir nuevos resultados

### Opciones de Implementación:

#### **OPCIÓN A: LocalStorage (Recomendado)**
- Los datos se guardan en el **navegador del dispositivo**
- No requiere servidor
- Limitación: Solo funciona en ese navegador/dispositivo
- Ideal para: Una sola máquina gestionando todo

#### **OPCIÓN B: Base de Datos en la Nube**
- Requiere un backend (Firebase, Supabase, etc.)
- Datos accesibles desde cualquier dispositivo/navegador
- Ideal para: Acceso múltiple desde diferentes ubicaciones

#### **Texto a incluir en el copy:**
```markdown
### 💾 Gestión de Datos

**Los resultados se guardan automáticamente** en tu dispositivo.
- Si cierras la web, tus datos se conservan
- Puedes continuar editando cuando vuelvas a abrir

**Nota:** Para compartir datos entre dispositivos o sedes,
contacta con el administrador para activar sincronización en la nube.
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

### Lugares de Integración:

#### **Header de la Web**
```html
[Logo Blackpool] 🎱 TORNEO SNOOKER BLACKPOOL MADRID 🎱

Vallecas & Alcobendas
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
│  ├─ Vallecas (Grupos 1-8)
│  └─ Alcobendas (Grupos 9-16)
├─ 🏆 GRUPOS (Clasificación)
│  ├─ Vallecas
│  └─ Alcobendas
├─ 📈 DESGLOSE BY FRAME
│  ├─ Vallecas
│  └─ Alcobendas
└─ ⚙️ ADMINISTRACIÓN
   ├─ 🔄 Reiniciar Datos
   └─ 📥 Importar/Exportar
```

---

### 12. **RESPONSIVE & USABILIDAD**

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
│  Grupo 1 - Vallecas                                │
│  ┌─────────────────────────────────────────────┐   │
│  │ Frame 1: Jug 1 (pts) vs Jug 2 (pts) [✅/❌] │   │
│  │ Frame 2: Jug 1 (pts) vs Jug 3 (pts) [✅/❌] │   │
│  │ Frame 3: Jug 2 (pts) vs Jug 3 (pts) [✅/❌] │   │
│  │ [Guardar] [Cancelar]                       │   │
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

- [ ] **Entrada de puntos por frame** (no solo frames ganados)
- [ ] **Separación por sede** (Vallecas & Alcobendas)
- [ ] **Tab de Partidos** - Interfaz para ingresar resultados
- [ ] **Tab de Grupos** - Tabla de clasificación actualizada
- [ ] **Tab de Frames** - Desglose individual de resultados
- [ ] **Persistencia de datos** - Guardado automático en dispositivo
- [ ] **Botón Reinicio** - Con confirmación de seguridad
- [ ] **Integración de imágenes** - Logo y foto de mesa
- [ ] **Diseño oscuro** - Tema professional (snooker)
- [ ] **Responsive** - Funcione en desktop y tablet
- [ ] **Nomenclatura simple** - Jugador 1, 2, 3, etc.
- [ ] **Visual e intuitivo** - Fácil de usar sin instrucciones

---

## 🎯 PRÓXIMOS PASOS

1. **Envía las 2 imágenes** de la carpeta IMG
2. **Confirma** si quieres LocalStorage o Base de Datos
3. Crearé la **web funcional** con todos estos requisitos
4. Haremos **pruebas** antes del torneo
5. **¡A jugar!** 🎱

---

**Versión:** 1.0  
**Fecha:** Octubre 2024  
**Estado:** Especificaciones Finales
