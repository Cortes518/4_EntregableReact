import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

SMTP_HOST = os.getenv("SMTP_HOST", "smtp.gmail.com")
SMTP_PORT = int(os.getenv("SMTP_PORT", 587))
SMTP_USER = os.getenv("SMTP_USER", "")
SMTP_PASSWORD = os.getenv("SMTP_PASSWORD", "")
SMTP_FROM_EMAIL = os.getenv("SMTP_FROM_EMAIL", SMTP_USER)

def send_reset_code_email(to_email: str, user_name: str, code: str) -> bool:
    if not SMTP_USER or not SMTP_PASSWORD:
        print("[WARN] SMTP_USER o SMTP_PASSWORD no configurados en .env.")
        raise ValueError("El servidor de correo no está configurado. Por favor define SMTP_USER y SMTP_PASSWORD en el archivo .env.")

    subject = f"🔐 Código de Recuperación de Contraseña: {code} - PCortes"

    html_content = f"""
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <style>
        body {{
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #0f172a;
          color: #f8fafc;
          margin: 0;
          padding: 20px;
        }}
        .card {{
          max-width: 540px;
          margin: 0 auto;
          background-color: #1e293b;
          border-radius: 16px;
          padding: 30px;
          border: 1px solid #334155;
          box-shadow: 0 10px 25px rgba(0,0,0,0.5);
        }}
        .header {{
          text-align: center;
          border-bottom: 1px solid #334155;
          padding-bottom: 20px;
          margin-bottom: 20px;
        }}
        .title {{
          color: #38bdf8;
          font-size: 24px;
          font-weight: 800;
          margin: 0;
        }}
        .subtitle {{
          color: #94a3b8;
          font-size: 13px;
          margin-top: 5px;
        }}
        .code-box {{
          background: #0f172a;
          border: 2px dashed #38bdf8;
          border-radius: 12px;
          padding: 20px;
          text-align: center;
          margin: 25px 0;
        }}
        .code {{
          font-size: 36px;
          font-family: 'Courier New', Courier, monospace;
          font-weight: 800;
          letter-spacing: 8px;
          color: #38bdf8;
        }}
        .instructions {{
          color: #cbd5e1;
          font-size: 14px;
          line-height: 1.6;
        }}
        .footer {{
          text-align: center;
          margin-top: 30px;
          border-top: 1px solid #334155;
          padding-top: 15px;
          font-size: 12px;
          color: #64748b;
        }}
        .warning {{
          background-color: rgba(239, 68, 68, 0.1);
          border-left: 4px solid #ef4444;
          padding: 10px 14px;
          border-radius: 6px;
          font-size: 12px;
          color: #fca5a5;
          margin-top: 20px;
        }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <h1 class="title">PCortes Plataforma</h1>
          <p class="subtitle">Seguridad y Recuperación de Cuenta</p>
        </div>

        <p class="instructions">Hola <strong>{user_name}</strong>,</p>
        <p class="instructions">
          Recibimos una solicitud para restablecer la contraseña de tu cuenta.
          Utiliza el siguiente código de verificación en la página web:
        </p>

        <div class="code-box">
          <div class="code">{code}</div>
        </div>

        <p class="instructions">
          Este código es personal, de un solo uso y vencerá en <strong>15 minutos</strong>.
        </p>

        <div class="warning">
          ⚠️ Si tú no solicitaste este cambio, puedes ignorar este mensaje de forma segura. Tu contraseña actual permanecerá intacta.
        </div>

        <div class="footer">
          © 2026 PCortes Inc. Todos los derechos reservados.<br>
          Este es un correo automático generado por el sistema de autenticación.
        </div>
      </div>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"PCortes Soporte <{SMTP_FROM_EMAIL}>"
    msg["To"] = to_email

    # Versión texto plano alternativa
    plain_text = f"Hola {user_name},\n\nTu código de verificación para restablecer tu contraseña en PCortes es: {code}\n\nEste código expira en 15 minutos.\nSi no solicitaste este cambio, ignora este mensaje."
    msg.attach(MIMEText(plain_text, "plain"))
    msg.attach(MIMEText(html_content, "html"))

    try:
        with smtplib.SMTP(SMTP_HOST, SMTP_PORT, timeout=15) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(SMTP_USER, SMTP_PASSWORD)
            server.send_message(msg)
        print(f"[OK] Correo de recuperación enviado exitosamente a {to_email}")
        return True
    except smtplib.SMTPAuthenticationError as e:
        print(f"[ERROR] Error de autenticación SMTP: {e}")
        raise ValueError("Error de autenticación con el servidor de correo. Verifica tu correo y la contraseña de aplicación de Google.")
    except Exception as e:
        print(f"[ERROR] Error al enviar correo por SMTP: {e}")
        raise ValueError(f"No se pudo enviar el correo: {str(e)}")
