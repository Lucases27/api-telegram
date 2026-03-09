# Page snapshot

```yaml
- generic [ref=e4]:
  - generic [ref=e5]:
    - img [ref=e7]
    - heading "Bienvenido" [level=1] [ref=e10]
    - paragraph [ref=e11]: Ingresá a tu cuenta para continuar
  - generic [ref=e12]:
    - generic [ref=e13]:
      - img [ref=e14]
      - text: Email o contraseña incorrectos.
    - generic [ref=e16]:
      - generic [ref=e17]: Email
      - generic [ref=e18]:
        - img [ref=e19]
        - textbox "tu@email.com" [ref=e22]: testuser@example.com
    - generic [ref=e23]:
      - generic [ref=e24]: Contraseña
      - generic [ref=e25]:
        - img [ref=e26]
        - textbox "••••••••" [ref=e29]: testpassword123
    - button "Ingresar" [ref=e30]
  - paragraph [ref=e31]:
    - text: ¿No tenés cuenta?
    - link "Registrate aquí" [ref=e32] [cursor=pointer]:
      - /url: /register
```