# Biometría WEB

Librería para obtener datos biométricos a través de la captura de un video.

A continuación se describe que hace la libreria:

- Tomar de formulario datos del usuario(Número de dni, Sexo, Número de tramite). 
    *   Se realiza una validacion de que tanto el numero de dni como el de tramite contengan solo numeros.
    *   Valida que el largo del dni sea correcto. 
    *   Valida que el sexo sea F o M.
- Carga archivos bin para funcionamiento de dependencia face-api a partir de url ingresada en constructor.
- Solicita tomar control de la cámara.
- Le solicita al usuario que mire a la camara y parpadee. Al registrar esto, comienza a grabar el video.
- El video como minimo tendra 3 segundos, luego de ese transcurso de tiempo, se le solicitará al usuario sonreir para finalizar el video.

Para su implementación seguir los siguientes pasos:

- Instalar dependencias axios, face-api, uuid, blob-util, ts-date `npm i -s axios face-api.js uuid blob-util ts-date`
- Instanciar sdk `new LinkBiometricModule(face-api, axios);`
- Llamar al metodo `ejecucionIdentidad()`
- Para darle estilo los elementos html (desde sus archivos css) tienen las siguientes clases:
    * Card que contiene form para ingresar datos DNI: 'card' (Contiene titulo, label e input dni, label e input sexo, label e input num tramite, boton)
    * Labels (label dni, sexo, numTramite, leyenda loading y parpadeo) : 'label'
    * Inputs (input dni, sexo, numTramite) : 'input'
    * Boton para confirmar datos : 'boton-element'
    * Video : 'videoElement'
- Para cambiar los valores de las leyendas de los labels se podrá hacer cambiando el innerText de los objetos:
    Ejemplo:
    `linkBiometria = new LinkBiometricModule(..., ..., ...);`
    `linkBiometria.labelDni.innerText = 'Nueva leyenda';`

## Cypress workaround

Si la instalación de cypress falla en el postinstall con un error como el siguiente:

```text
The Cypress App could not be downloaded.

Does your workplace require a proxy to be used to access the Internet? If so, you must configure the HTTP_PROXY environment variable before downloading Cypress. Read more: https://on.cypress.io/proxy-configuration

Otherwise, please check network connectivity and try again:

----------

URL: https://download.cypress.io/desktop/7.5.0?platform=win32&arch=x64
Error: unable to get local issuer certificate

----------

Platform: win32 (10.0.19041)
Cypress Version: 7.5.0
```

[Descargar manualmente el zip](https://docs.cypress.io/guides/getting-started/installing-cypress#Download-URLs) de la versión de cypress, en este caso: <https://download.cypress.io/desktop/7.5.0?platform=win32&arch=x64>

Luego descomprimirlo en alguna carpeta, por ejemplo en `C:/Programs/Cypress` y asignar la siguiente variable de entorno:

`CYPRESS_RUN_BINARY=C:/Programs/Cypress/Cypress.exe`  
`CYPRESS_INSTALL_BINARY=0`

Finalmente, volver a ejecutar el install: `npm install`

Para mas información y configuraciones en diversos sistemas operativos, [ver este link](https://docs.cypress.io/guides/getting-started/installing-cypress#Install-binary).

