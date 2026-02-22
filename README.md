# 🛡️ Examen de Concienciación en Ingeniería Social

Sistema interactivo tipo examen para formar a empleados en detección y prevención de técnicas de ingeniería social.

## 📋 Estructura

- `index.html` - Interfaz principal del examen
- `datos.json` - Contenido actualizable (preguntas, categorías, tips)
- `script.js` - Lógica del examen y gestión de puntuación
- `styles.css` - Estilos responsive y temas visuales

## 🎯 Características

- ✅ 20 preguntas distribuidas en 6 categorías
- ✅ Tips específicos por categoría
- ✅ Sistema de puntuación y badges
- ✅ Progreso guardado localmente
- ✅ Diseño responsive
- ✅ Fácil de actualizar (solo modificar JSON)

## 📁 Categorías

1. **Phishing** 📧 - Correos fraudulentos
2. **Vishing** 📞 - Llamadas engañosas
3. **Smishing** 💬 - SMS fraudulentos
4. **Redes Sociales** 🌐 - Ingeniería social online
5. **Seguridad Física** 👥 - Accesos no autorizados
6. **Conceptos Generales** 📚 - Principios básicos

## 🚀 Uso Rápido

1. Sube `index.html` y `datos.json` a tu servidor web
2. Accede a `index.html` desde tu navegador
3. Para actualizar contenido, modifica solo `datos.json`
4. Los cambios se reflejan automáticamente

## 🔧 Cómo actualizar el contenido

### Añadir una pregunta

```json
{
    "id": 21,
    "categoria": "phishing",
    "pregunta": "Tu pregunta aquí",
    "opciones": ["Opción A", "Opción B (correcta)", "Opción C", "Opción D"],
    "respuesta_correcta": 1,
    "explicacion": "Explicación detallada",
    "tips": ["Tip 1", "Tip 2"],
    "nivel_dificultad": "básico|intermedio|avanzado",
    "puntuacion": 10
}
```

### Añadir una categoría

```json
{
    "id": "nueva-categoria",
    "nombre": "Nombre Categoría",
    "icono": "📌",
    "descripcion": "Descripción",
    "preguntas": [21, 22, 23]
}
```

### Añadir tips

```json
{
    "categoria": "phishing",
    "titulo": "Título del tip",
    "consejos": ["Consejo 1", "Consejo 2"]
}
```

## 📊 Sistema de Puntuación

| Nivel | Puntos |
|-------|--------|
| Básico | 10 |
| Intermedio | 15 |
| Avanzado | 20 |

## 🏆 Badges

- 🌱 **Iniciado** - Comenzar el examen
- 📚 **En progreso** - 50% completado
- 🏆 **Experto** - 75% completado
- 💯 **Perfecto** - Todas correctas

## 📝 Notas

- Los cambios en `datos.json` se reflejan automáticamente
- El progreso de usuarios se guarda en `localStorage`
- Usar consola del navegador para funciones admin:
    ```javascript
    admin.resetearProgreso() // Reinicia todo
    admin.verDatos()         // Muestra el JSON actual
    ```

## 🔒 Seguridad

- No incluyas información sensible en las preguntas
- Actualiza regularmente el contenido
- Realiza copias de seguridad del JSON

## 📄 Licencia

MIT License

Copyright (c) 2026 MarioGarciach

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.