import os
import json
import urllib.request
import urllib.error
from typing import List, Dict, Tuple, Optional
from sqlalchemy.orm import Session

from app.models.producto import Product
from app.models.servicio import Service


class AIService:
    """
    Servicio centralizado de Inteligencia Artificial para el Chatbot de PCortes.
    Gestiona de forma segura las claves API desde variables de entorno y proporciona
    un motor de conocimiento contextual en tiempo real conectado a MySQL.
    """

    @staticmethod
    def _obtener_contexto_tienda(db: Session) -> str:
        """
        Extrae información actualizada del catálogo y servicios desde MySQL
        para inyectarla en el contexto del modelo de IA.
        """
        try:
            productos = db.query(Product).filter(Product.estado == "Activo").all()
            prod_info = []
            for p in productos:
                stock_txt = f"{p.stock} unidades disponibles" if p.stock > 0 else "Agotado"
                precio_fmt = f"${float(p.precio):,.0f} COP"
                prod_info.append(f"- {p.nombre}: {precio_fmt} (Stock: {stock_txt}). {p.descripcion or ''}")

            servicios = db.query(Service).filter(Service.estado == "Activo").all()
            serv_info = []
            for s in servicios:
                precio_fmt = f"${float(s.precio):,.0f} COP"
                serv_info.append(f"- {s.nombre}: {precio_fmt}. {s.descripcion or ''}")

            contexto = f"""
INFORMACIÓN INSTITUCIONAL DE PCORTES:
- Empresa: PCortes - Venta de Computadores, Componentes y Soporte Técnico Especializado.
- Horario de atención: Lunes a Viernes de 8:00 AM a 6:00 PM, Sábados de 9:00 AM a 1:00 PM.
- Canales de contacto: Teléfono +57 300 123 4567, Correo contacto@ejemplo.com, Soporte WhatsApp disponible en el sitio web.
- Ubicación: Colombia (Envíos a nivel nacional).

CATÁLOGO DE PRODUCTOS EN TIEMPO REAL:
{chr(10).join(prod_info) if prod_info else "No hay productos disponibles actualmente."}

CATÁLOGO DE SERVICIOS TÉCNICOS:
{chr(10).join(serv_info) if serv_info else "No hay servicios registrados actualmente."}

PROCESO DE COMPRA EN LÍNEA:
1. Iniciar sesión o registrarse como cliente en la plataforma.
2. Explorar el catálogo en '/productos' o '/servicios'.
3. Hacer clic en 'Comprar' o 'Solicitar Servicio' para abrir el checkout.
4. Seleccionar el método de pago: PSE, Tarjeta de Crédito, Transferencia bancaria o Efectivo contra entrega.
5. Se emite una factura correlativa electrónica oficial (ej: FAC-20260918-0001).
6. La factura puede visualizarse y descargarse en PDF en cualquier momento desde el panel de cliente en la pestaña 'Mis Compras'.

MÓDULO DE PQR (PETICIONES, QUEJAS, RECLAMOS Y SUGERENCIAS):
- Los clientes pueden radicar PQR iniciando sesión e ingresando a su panel en la pestaña 'Mis PQR' o desde el botón 'Radicar o Consultar PQR' en 'Mi Resumen'.
- Tipos de PQR:
  * Petición: Solicitud de información, copias de documentos o consultas técnicas.
  * Queja: Manifestación de inconformidad respecto a la atención recibida.
  * Reclamo: Inconformidad directa sobre un producto defectuoso, garantía o servicio prestado.
  * Sugerencia: Propuesta de mejora para la tienda o catálogo.
- Estados del ciclo de vida de una PQR:
  * 'Pendiente': Recién radicada por el cliente, en espera de asignación.
  * 'En Proceso': Asignada a un técnico o administrador en evaluación.
  * 'Respondida': Cuenta con respuesta oficial; el cliente puede leerla con el botón 'Ver Respuesta'.
  * 'Cerrada': Trámite finalizado y archivado.
"""
            return contexto.strip()
        except Exception as e:
            print(f"[WARN] Error al generar contexto de tienda para IA: {e}")
            return "PCortes: Tienda de computadores y servicio técnico en Colombia."

    @classmethod
    def responder(cls, mensaje: str, historial: List[Dict[str, str]], db: Session, user_nombre: Optional[str] = None) -> Tuple[str, List[str], str]:
        """
        Punto de entrada principal para responder consultas.
        Intenta usar OpenAI API / Gemini API y, si no hay clave o falla, usa el motor de conocimiento contextual.
        """
        # Recargar variables de entorno dinámicamente para aplicar cambios en .env sin reiniciar el servidor
        try:
            from dotenv import load_dotenv
            load_dotenv(override=True)
        except Exception:
            pass

        openai_key = os.getenv("OPENAI_API_KEY", "").strip()
        gemini_key = os.getenv("GEMINI_API_KEY", "").strip()
        provider = os.getenv("AI_PROVIDER", "openai").strip().lower()

        contexto_tienda = cls._obtener_contexto_tienda(db)
        saludo_personalizado = f"El usuario se llama {user_nombre}." if user_nombre else "El usuario es un visitante o cliente de la tienda."

        # 1. Intentar OpenAI API si está configurado
        if openai_key and (provider == "openai" or not gemini_key):
            try:
                resp, sugs = cls._llamar_openai(mensaje, historial, contexto_tienda, saludo_personalizado, openai_key)
                return resp, sugs, "openai"
            except Exception as e:
                err_msg = str(e)
                if hasattr(e, "read"):
                    try:
                        err_body = json.loads(e.read().decode("utf-8"))
                        err_msg = err_body.get("error", {}).get("message", err_msg)
                    except Exception:
                        pass
                print(f"[WARN] OpenAI API no disponible ({err_msg}). Activando motor de respaldo contextual.")

        # 2. Intentar Gemini API si está configurado
        if gemini_key and (provider == "gemini" or not openai_key):
            try:
                resp, sugs = cls._llamar_gemini(mensaje, historial, contexto_tienda, saludo_personalizado, gemini_key)
                return resp, sugs, "gemini"
            except Exception as e:
                err_msg = str(e)
                if hasattr(e, "read"):
                    try:
                        err_body = json.loads(e.read().decode("utf-8"))
                        err_msg = err_body.get("error", {}).get("message", err_msg)
                    except Exception:
                        pass
                print(f"[WARN] Gemini API no disponible ({err_msg}). Activando motor de respaldo contextual.")

        # 3. Motor de Conocimiento Contextual de Respaldo (Fallback garantizado)
        resp, sugs = cls._motor_conocimiento(mensaje, db, user_nombre)
        return resp, sugs, "knowledge_engine"

    @classmethod
    def _llamar_openai(cls, mensaje: str, historial: List[Dict[str, str]], contexto: str, saludo: str, api_key: str) -> Tuple[str, List[str]]:
        model = os.getenv("AI_MODEL", "gpt-4o-mini").strip() or "gpt-4o-mini"
        
        system_prompt = f"""Eres el Asistente Virtual Oficial de PCortes, una tienda líder en computadores, componentes gamer y servicio técnico informático en Colombia.
Tu propósito es atender a clientes y visitantes de manera cálida, profesional, clara y concisa.
{saludo}

Usa siempre los datos oficiales del negocio para responder:
{contexto}

Directrices de respuesta:
- Responde siempre en español, con un tono amable, profesional y servicial.
- Usa formato markdown agradable (negritas, viñetas, emojis relevantes).
- Si preguntan por computadores, menciona modelos exactos, precios y si tienen stock disponible.
- Si preguntan por cómo comprar, explica los pasos sencillos (registro, carrito, checkout con PSE/Tarjeta/Efectivo, factura PDF).
- Si preguntan por PQR, orienta sobre los tipos (Petición, Queja, Reclamo, Sugerencia) y los estados (Pendiente, En Proceso, Respondida, Cerrada).
- Mantén las respuestas directas al grano, sin rodeos innecesarios.
"""
        messages = [{"role": "system", "content": system_prompt}]
        for h in historial[-6:]:  # Últimos 6 turnos para mantener contexto sin desbordar tokens
            messages.append({"role": h.get("role", "user"), "content": h.get("content", "")})
        messages.append({"role": "user", "content": mensaje})

        payload = json.dumps({
            "model": model,
            "messages": messages,
            "temperature": 0.7,
            "max_tokens": 600,
        }).encode("utf-8")

        req = urllib.request.Request(
            "https://api.openai.com/v1/chat/completions",
            data=payload,
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {api_key}",
            },
            method="POST",
        )

        with urllib.request.urlopen(req, timeout=15) as response:
            result = json.loads(response.read().decode("utf-8"))
            texto_respuesta = result["choices"][0]["message"]["content"].strip()

        sugerencias = cls._generar_sugerencias(mensaje)
        return texto_respuesta, sugerencias

    @classmethod
    def _llamar_gemini(cls, mensaje: str, historial: List[Dict[str, str]], contexto: str, saludo: str, api_key: str) -> Tuple[str, List[str]]:
        raw_model = os.getenv("AI_MODEL", "gemini-3.6-flash").strip()
        # Normalizar si viene de OpenAI o versiones antiguas no disponibles
        if not raw_model or "gpt" in raw_model or "1.5" in raw_model or "2.5" in raw_model:
            model_candidates = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.5-flash"]
        else:
            model_candidates = [raw_model, "gemini-3.6-flash", "gemini-flash-latest"]

        system_instruction = f"""Eres el Asistente Virtual Oficial de PCortes (Colombia).
{saludo}
Datos oficiales:
{contexto}
Responde en español, amable, profesional, con emojis y formato markdown claro."""

        contents = []
        for h in historial[-4:]:
            role = "user" if h.get("role") == "user" else "model"
            contents.append({"role": role, "parts": [{"text": h.get("content", "")}]})
        contents.append({"role": "user", "parts": [{"text": f"{system_instruction}\n\nPregunta del cliente: {mensaje}"}]})

        payload = json.dumps({"contents": contents}).encode("utf-8")

        last_error = None
        for model in model_candidates:
            url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={api_key}"
            req = urllib.request.Request(url, data=payload, headers={"Content-Type": "application/json"}, method="POST")
            try:
                with urllib.request.urlopen(req, timeout=15) as response:
                    result = json.loads(response.read().decode("utf-8"))
                    texto_respuesta = result["candidates"][0]["content"]["parts"][0]["text"].strip()
                    sugerencias = cls._generar_sugerencias(mensaje)
                    return texto_respuesta, sugerencias
            except Exception as e:
                last_error = e
                continue

        if last_error:
            raise last_error

    @classmethod
    def _motor_conocimiento(cls, mensaje: str, db: Session, user_nombre: Optional[str] = None) -> Tuple[str, List[str]]:
        """
        Motor de conocimiento contextual y semántico que funciona 100% offline o
        sin API Key, consultando directamente la base de datos MySQL.
        """
        m = mensaje.lower().strip()
        nombre = f", {user_nombre}" if user_nombre else ""

        # 1. Identidad del Asistente / Qué puedes hacer
        if any(k in m for k in ["quien eres", "quién eres", "que eres", "qué eres", "que haces", "qué haces", "que puedes hacer", "qué puedes hacer", "ayuda"]):
            resp = (
                f"🤖 **¡Hola{nombre}! Soy el Asistente Virtual de PCortes.**\n\n"
                f"Estoy diseñado para brindarte atención inmediata y resolver tus dudas sobre:\n"
                f"• 💻 **Equipos y Componentes:** Precios, especificaciones y stock en tiempo real.\n"
                f"• 🛠️ **Servicio Técnico:** Mantenimiento preventivo, formateo, repuestos y ensamble.\n"
                f"• 🛒 **Compras y Facturación:** Métodos de pago (PSE, tarjetas, efectivo) y descarga de facturas en PDF.\n"
                f"• 📋 **Módulo PQR:** Cómo radicar peticiones, quejas, reclamos o sugerencias y ver sus estados.\n"
                f"• 🏢 **Información General:** Horarios de atención y canales de contacto.\n\n"
                f"¡Pregúntame con confianza lo que necesites saber!"
            )
            sugs = ["¿Qué computadores tienen?", "¿Cómo radico una PQR?", "¿Cómo comprar en línea?"]
            return resp, sugs

        # 2. PQR (Peticiones, Quejas, Reclamos y Sugerencias)
        if any(k in m for k in ["pqr", "queja", "reclamo", "peticion", "petición", "sugerencia", "radicar", "inconformidad"]):
            resp = (
                f"📋 **Gestión de PQR en PCortes**\n\n"
                f"¡Hola{nombre}! En PCortes puedes radicar y hacer seguimiento en tiempo real a tus solicitudes:\n\n"
                f"🔹 **Tipos de solicitudes:**\n"
                f"• **Petición:** Consultas técnicas o solicitud de documentos y garantías.\n"
                f"• **Queja:** Inconformidad con la atención o tiempos de servicio.\n"
                f"• **Reclamo:** Defectos en productos adquiridos o fallas de servicio.\n"
                f"• **Sugerencia:** Propuestas de mejora para nuestra tienda.\n\n"
                f"🔹 **Estados del trámite:**\n"
                f"• ⏳ **Pendiente:** Solicitud recibida y en espera de revisión.\n"
                f"• 🛠️ **En Proceso:** Técnico o administrativo analizando tu caso.\n"
                f"• ✅ **Respondida:** Respuesta oficial lista (haz clic en *'Ver Respuesta'*).\n"
                f"• 📁 **Cerrada:** Caso concluido con éxito.\n\n"
                f"💡 **¿Cómo radicar?** Inicia sesión, dirígete a tu panel en la pestaña **'Mis PQR'** y presiona **'+ Nueva PQR'**."
            )
            sugs = ["¿Cómo es el proceso de compra?", "¿Qué computadores tienen?", "¿Tienen servicio técnico?"]
            return resp, sugs

        # 3. Catálogo de Computadores / Productos / Componentes
        if any(k in m for k in ["computador", "producto", "portatil", "portátil", "pc", "laptop", "gamer", "stock", "precio", "catalogo", "catálogo", "procesador", "ram", "grafica", "gráfica", "disco", "ssd", "pantalla", "teclado", "mouse", "monitor", "intel", "amd", "ryzen", "core"]):
            productos = db.query(Product).filter(Product.estado == "Activo").all()
            if productos:
                items = []
                for p in productos[:5]:
                    st = f"✅ Stock: {p.stock}" if p.stock > 0 else "❌ Agotado"
                    items.append(f"• **{p.nombre}** — `${float(p.precio):,.0f} COP` ({st})")
                lista_txt = "\n".join(items)
            else:
                lista_txt = "Actualmente estamos actualizando el inventario de equipos."

            resp = (
                f"💻 **Catálogo de Equipos y Hardware en PCortes**\n\n"
                f"Aquí tienes algunos de nuestros productos disponibles:\n\n"
                f"{lista_txt}\n\n"
                f"🛒 Puedes consultar especificaciones completas, filtrar y comprar en línea desde la sección **/productos**."
            )
            sugs = ["¿Cómo comprar un computador?", "¿Tienen servicio técnico?", "¿Cuáles son los métodos de pago?"]
            return resp, sugs

        # 4. Servicios Técnicos / Mantenimiento / Reparación
        if any(k in m for k in ["servicio", "mantenimiento", "reparacion", "reparación", "formateo", "limpieza", "tecnico", "técnico", "ensamble", "instalacion", "instalación", "diagnostico", "diagnóstico"]):
            servicios = db.query(Service).filter(Service.estado == "Activo").all()
            if servicios:
                items = [f"• **{s.nombre}** — `${float(s.precio):,.0f} COP`\n  _{s.descripcion}_" for s in servicios[:4]]
                lista_txt = "\n\n".join(items)
            else:
                lista_txt = "Servicios de diagnóstico, formateo y mantenimiento preventivo disponibles."

            resp = (
                f"🛠️ **Servicios Técnicos Especializados PCortes**\n\n"
                f"Contamos con personal certificado para el cuidado y optimización de tus equipos:\n\n"
                f"{lista_txt}\n\n"
                f"📅 Puedes solicitar tu servicio desde la sección **/servicios** o agendar asesoría directa por nuestro WhatsApp."
            )
            sugs = ["¿Qué computadores tienen?", "¿Cómo radicar una PQR?", "¿Cuáles son los horarios de atención?"]
            return resp, sugs

        # 5. Proceso de compra, pagos y facturación
        if any(k in m for k in ["comprar", "compra", "pago", "pagar", "factura", "tarjeta", "pse", "efectivo", "transferencia", "pedido", "orden"]):
            resp = (
                f"🛒 **Proceso de Compra y Facturación en PCortes**\n\n"
                f"Comprar en nuestra plataforma es 100% seguro:\n\n"
                f"1️⃣ **Elige tu producto o servicio:** Ingresa a **/productos** o **/servicios**.\n"
                f"2️⃣ **Haz clic en 'Comprar' o 'Solicitar':** Se abrirá el modal de confirmación.\n"
                f"3️⃣ **Selecciona tu método de pago preferido:**\n"
                f"   • 💳 Tarjeta de Crédito / Débito\n"
                f"   • 🏦 Transferencia PSE\n"
                f"   • 💵 Efectivo contra entrega\n"
                f"4️⃣ **Descarga tu factura electrónica en PDF:** Una vez confirmada la compra, se genera automáticamente tu comprobante con código oficial que puedes consultar y descargar en tu panel (**'Mis Compras'**)."
            )
            sugs = ["¿Qué computadores tienen?", "¿Cómo radicar una PQR?", "¿Tienen garantía?"]
            return resp, sugs

        # 6. Envíos y entregas
        if any(k in m for k in ["envio", "envíos", "envian", "envían", "domicilio", "entrega", "despacho", "tiempo de entrega"]):
            resp = (
                f"📦 **Envíos y Entregas PCortes**\n\n"
                f"• Realizamos envíos seguros a nivel nacional en Colombia.\n"
                f"• El tiempo estimado de entrega para equipos es de **1 a 3 días hábiles** en ciudades principales.\n"
                f"• Todos los envíos cuentan con número de guía y seguro de mercancía.\n"
                f"• Si deseas coordinar entrega urgente local, puedes escribirnos a nuestro canal de WhatsApp."
            )
            sugs = ["¿Cuáles son los métodos de pago?", "¿Tienen garantía?", "¿Qué computadores tienen?"]
            return resp, sugs

        # 7. Garantías y devoluciones
        if any(k in m for k in ["garantia", "garantía", "devolucion", "devolución", "cambio", "respaldo"]):
            resp = (
                f"🛡️ **Política de Garantía PCortes**\n\n"
                f"• Todos nuestros equipos cuentan con garantía directa de **6 a 12 meses** por defectos de fábrica.\n"
                f"• Los servicios técnicos tienen garantía de **30 días** sobre el trabajo realizado.\n"
                f"• Si presentas algún inconveniente técnico, puedes radicar un **Reclamo en el módulo de PQR** para recibir soporte prioritario."
            )
            sugs = ["¿Cómo radico una PQR?", "¿Qué computadores tienen?", "Horarios y contacto"]
            return resp, sugs

        # 8. Preguntas Frecuentes, Horarios, Contacto y Ubicación
        if any(k in m for k in ["horario", "contacto", "telefono", "teléfono", "donde", "dónde", "ubicacion", "ubicación", "correo", "direccion", "dirección", "sede"]):
            resp = (
                f"🏢 **Información de Contacto y Atención PCortes**\n\n"
                f"Estamos listos para ayudarte:\n\n"
                f"📍 **Ubicación:** Colombia (Cobertura y despachos nacionales)\n"
                f"📞 **Teléfono:** +57 300 123 4567\n"
                f"✉️ **Correo electrónico:** contacto@ejemplo.com\n"
                f"💬 **WhatsApp:** Botón flotante directo en la esquina inferior del sitio\n\n"
                f"⏰ **Horarios de atención:**\n"
                f"• Lunes a Viernes: 8:00 AM – 6:00 PM\n"
                f"• Sábados: 9:00 AM – 1:00 PM\n"
                f"• Domingos y festivos: Cerrado"
            )
            sugs = ["¿Qué computadores tienen?", "¿Tienen servicio técnico?", "¿Cómo radicar una PQR?"]
            return resp, sugs

        # 9. Saludos cordiales
        if any(k in m for k in ["hola", "buenos dias", "buenos días", "buenas tardes", "buenas noches", "hey", "saludos", "que tal", "qué tal"]):
            resp = (
                f"👋 **¡Hola{nombre}! Bienvenido a PCortes Asistente Virtual.**\n\n"
                f"¿En qué te puedo asesorar hoy?\n\n"
                f"• 💻 Consultar computadores gamer y componentes en stock.\n"
                f"• 🛠️ Conocer servicios técnicos, formateo y mantenimiento.\n"
                f"• 🛒 Guía de compras en línea y facturación electrónica.\n"
                f"• 📩 Radicar o consultar el estado de tu PQR.\n"
                f"• 🏢 Horarios y canales de atención."
            )
            sugs = ["¿Qué computadores tienen?", "¿Cómo es el proceso de compra?", "¿Cómo radico una PQR?"]
            return resp, sugs

        # 10. Despedidas y agradecimientos
        if any(k in m for k in ["gracias", "muchas gracias", "chao", "adios", "adiós", "hasta luego", "listo", "ok", "vale"]):
            resp = f"¡Con el mayor gusto{nombre}! En PCortes estamos siempre para servirte. Si tienes otra duda o requieres asistencia con tus compras o PQR, aquí estaré. ¡Que tengas un gran día! 🚀"
            sugs = ["Ver catálogo de PCs", "¿Cuáles son sus horarios?", "¿Cómo radico una PQR?"]
            return resp, sugs

        # 11. Respuesta general orientadora (No restrictiva)
        resp = (
            f"¡Hola{nombre}! He recibido tu consulta: *\"{mensaje}\"*.\n\n"
            f"Como asistente de la tienda **PCortes**, estoy especializado en brindarte información sobre:\n"
            f"• 💻 **Productos y Equipos:** Precios, stock, portátiles y componentes.\n"
            f"• 🛠️ **Servicio Técnico:** Mantenimientos, reparaciones y asesorías.\n"
            f"• 🛒 **Proceso de Compra:** Formas de pago (PSE, tarjeta, efectivo) y facturas en PDF.\n"
            f"• 📋 **Módulo PQR:** Creación y seguimiento de peticiones, quejas, reclamos y sugerencias.\n\n"
            f"Puedes hacerme cualquier pregunta específica sobre estos servicios, o si prefieres un acceso rápido, puedes tocar uno de los botones a continuación:"
        )
        sugs = ["¿Qué computadores tienen?", "¿Cómo comprar en línea?", "¿Cómo radicar una PQR?", "¿Cuáles son los horarios?"]
        return resp, sugs

    @classmethod
    def _generar_sugerencias(cls, mensaje: str) -> List[str]:
        """Genera sugerencias contextuales rápidas según la temática tratada."""
        m = mensaje.lower()
        if "pqr" in m or "reclamo" in m:
            return ["¿Cuáles son los estados de una PQR?", "¿Dónde radicar mi PQR?", "Hablar con asesor humano"]
        if "computador" in m or "precio" in m or "producto" in m:
            return ["¿Cómo es el proceso de compra?", "¿Qué métodos de pago aceptan?", "¿Tienen garantía?"]
        if "servicio" in m or "mantenimiento" in m:
            return ["¿Cuánto cuesta el formateo?", "¿Tienen computadores en venta?", "Horarios de atención"]
        return ["¿Qué computadores tienen?", "¿Cómo comprar?", "¿Cómo radico una PQR?"]
