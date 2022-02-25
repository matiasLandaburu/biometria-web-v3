import * as faceApiJs from 'face-api.js';
import axios, { AxiosStatic } from 'axios';
import { CONSTRAINT } from './var.constant';
import { blobToBase64String } from 'blob-util';

type FaceAPIModule = typeof faceApiJs;
declare const MediaRecorder: any;
/**
 * Módulo que se encarga de capturar por video los datos biométricos y enviarlos
 * a los servicios correspondientes para obtener un token de validación.
 */
export class LinkBiometricModule {
  /**
   * Elemento video creado e incluido dentro de `_container`.
   */
  public video: HTMLVideoElement = null as any;
  /**
   * Objeto para grabar video
   */
  private mediaRecorder: typeof MediaRecorder;
  /**
   * Objeto para grabar video
   */
  public mediaStream!: MediaStream;
  /***
  * Label cargando
  */
  public labelLoading: HTMLParagraphElement = null as any;
  /***
   * Label parpadeo
   */
  public labelParpadeo: HTMLParagraphElement = null as any;
    /***
   * Button Start
   */
  public startButton: HTMLButtonElement = null as any;
  /**
   * Div contenedora form dni
   */
  public divCard: HTMLDivElement = null as any;
  /**
   * Módulo que se encarga de capturar por video los datos biométricos y enviarlos
   * a los servicios correspondientes para obtener un token de validación.
   * @param _container elemento que contendrá el video.
   * @param _faceApi (opcional) modulo de face api, por defecto usa el que esté instalado.
   * @param _urlModels ubicacion donde estan los modelos para faceapi
   */
  constructor(
    private _container: HTMLElement,
    private _urlModels: string,
    private _faceApi: FaceAPIModule = faceApiJs,
    private _axios: AxiosStatic = axios) {
    // Las siguientes lineas están para que no falle el lint.
    this._urlModels = this._urlModels;
    this.initHtmlElement();
  }

  /**
   * Armo elementos html
   */
  initHtmlElement() {
    // Creo Break line
    const br = document.createElement('br');
    // Div para formulario dni
    this.divCard = document.createElement('div');
    this.divCard.className = 'card';
    this.divCard.style.cssText = 'text-align:center';
    // Video selfie
    const videoElement = document.createElement('video');
    videoElement.className = 'videoElement';
    videoElement.setAttribute('id', 'video');
    videoElement.hidden = true;
    videoElement.autoplay = true;
    videoElement.controls = true;
    videoElement.muted = true;
    videoElement.width = 480;
    videoElement.height = 640;
    videoElement.style.position = 'absolute';
    videoElement.style.top = '6rem';
    videoElement.style.left = '15rem';
    //videoElement.
    this.video = videoElement;
    this.video.preload = 'metadata';
 
    this._container.appendChild(this.divCard);

    const divLabels = document.createElement('div');
    divLabels.className = 'card';
    divLabels.style.cssText = 'text-align:center';
    // Agrego labels informativos
    const label = document.createElement('p');
    label.className = 'label';
    label.style.textAlign = 'center';
    label.innerText = 'Cargando.. espere unos segundos';
    label.hidden = true;
    this.labelLoading = label;
    divLabels.appendChild(this.labelLoading);

    const labelParpadeo = document.createElement('p');
    labelParpadeo.className = 'label';
    labelParpadeo.style.textAlign = 'center';
    labelParpadeo.innerText = 'Mire a la camara y luego parpadee';
    labelParpadeo.hidden = true;
    this.labelParpadeo = labelParpadeo;
    divLabels.appendChild(this.labelParpadeo);
    divLabels.append(this.video);
    this._container.appendChild(divLabels);
  }

  /**
   * Carga de models para libreria faceapi
   */
  async loadModelsFaceApi() {
    try {
      await Promise.all([
        this._faceApi.nets.tinyFaceDetector.loadFromUri(this._urlModels),
        this._faceApi.nets.faceLandmark68Net.loadFromUri(this._urlModels),
        this._faceApi.nets.faceRecognitionNet.loadFromUri(this._urlModels),
        this._faceApi.nets.faceExpressionNet.loadFromUri(this._urlModels),
      ]);
    } catch (e) {
      throw new Error(`Error al cargar modelos ${e}`);
    }
  }
  /**
   * Comienza video y lo graba
   */
  playvideo = () => {
    console.log('playvideo()');
    let comenzoVideo = false;
    let timeComienzo = 0;
    // Muestra loading hasta que se cargue faceapi
    this.labelLoading.hidden = false;
    return new Promise((resolve, reject) => {
      navigator.mediaDevices.getUserMedia(CONSTRAINT)
        .then((mediaStreamObj) => {
          this.video.srcObject = mediaStreamObj;
          this.video.onloadedmetadata = () => {
            // show in the video element what is being captured by the webcam
            this.video.play();
          };
          // // recorder para capturar video
          this.mediaRecorder = new MediaRecorder(mediaStreamObj);
          let chunks: any[] = [];

          this.video.addEventListener('play', () => {

            const canvas = this._faceApi.createCanvasFromMedia(this.video) as HTMLCanvasElement;
            
            canvas.style.position = 'absolute';
            canvas.style.top = '6rem';
            canvas.style.left = '15rem';
            canvas.style.backgroundColor = 'black';
            canvas.style.opacity = '70%';
            canvas.style.width = '480px';//480
            canvas.style.height = '640px';//640
            canvas.style.background = 'radial-gradient(ellipse at center,  transparent, transparent 30%,#db0909 32%,transparent 30%)';
            this.video.hidden = false;
            canvas.width = this.video.width;
            canvas.height = this.video.height;
            this._container.append(canvas);
            const interval = setInterval(async () => {
            const options = new this._faceApi.TinyFaceDetectorOptions();
            const result =  await this._faceApi.detectSingleFace(this.video, options);
            if(result != null){
              if (result != undefined) {
                 // Oculta loading y muestra label parpadeo
                 this.labelLoading.hidden = true;
                if (result) {
                  //se hace un match de las dimensiones entre el video y el canvas
                  const dims = this._faceApi.matchDimensions(canvas, this.video, true)
                  var m_x = canvas.width / 2
                  var m_y = canvas.height / 2
                  var med_x = result.box.width / 2
                  var med_y = result.box.height / 2
                  var x = result.box.x + med_x
                  var y = result.box.y + med_y
                  // se verifica posicion de la cara con respecto a el video
                  if (comenzoVideo||((x < (m_x + (m_x / 10)) && (x > (m_x - (m_x / 10)))) &&  (y < (m_y + (m_y / 3)) && (y > (m_y - (m_y / 5)))))){	
                    //console.log(result.box.width / this.video.videoWidth);
                    if (comenzoVideo||(result.box.width / this.video.videoWidth < 0.4 && result.score > 0.7)){
                      canvas.style.background = 'radial-gradient(ellipse at center,  transparent, transparent 30%,#2fdb09 32%,transparent 30%)';
                      //Se muestra cartel de parpadeo
                      this.labelParpadeo.hidden = false;
                      
                      if (!comenzoVideo) {
                          this._faceApi.draw.drawDetections(canvas, this._faceApi.resizeResults(result, dims))
                          this.labelParpadeo.hidden = false;
                          this.labelParpadeo.innerText = 'Sonria y mire la camara';
                          timeComienzo = this.video.currentTime;
                          console.log('comienzo a grabar');
                          this.mediaRecorder.start();
                          comenzoVideo = true;
                      } else if (comenzoVideo){
                        //se controla el tiempo de grabacion y se frena en caso de terminar ese tiempo.                          
                         if (this.video.currentTime > (timeComienzo + 4)) {
                            canvas.hidden = true;
                            this.video.pause();
                            this.labelParpadeo.hidden = true;
                            clearInterval(interval);
                         }
                       }
                    }
                }
     
                }
              } 
              }
            }, 150);
          });

          this.video.addEventListener('stop', () => {
            this.mediaRecorder.stop();
          });
          this.video.addEventListener('pause', () => {
            this.labelParpadeo.hidden = true;
            this.mediaRecorder.stop();
          });
          this.mediaRecorder.ondataavailable = (ev: any) => {
            chunks.push(ev.data);
          };
          this.mediaRecorder.onstop = () => {
            console.log("mediaRecorder.onstop...");
            const blob = new Blob(chunks, { type: 'video/mp4;' });
            chunks = [];
            // Deja de mostrar video que grababa
            this.video.hidden = true;
            mediaStreamObj.getTracks()[0].stop();
            resolve(blob);
          };
        })
        .catch((err) => {
           // console.error(err.name, err.message, err);
          reject(err);
        });
    });
  }

  /***
   * Ejecucion secuencial de metodos.
   * Escaneo de dni para obtener sexo, dni y num tramite.
   * Carga de models para face detection.
   * Video selfie.
   * Llamada servicio identidad.
   */
  async ejecucionIdentidad() {
    console.log('ejecucionIdentidad()');
    return new Promise<any>((resolve, reject) => {

        const div = this._container.getElementsByTagName('div').item(0) as HTMLDivElement;
        div.hidden = true;
        this.divCard.hidden = true;
        // Carga modelos faceapi
        this.loadModelsFaceApi().then(async () => {
          // Comienza a grabar video
          await this.playvideo().then(async (data) => {
            const videoBiometria = data as Blob;
            await blobToBase64String(videoBiometria).then(async (base64String) => {
              // success
              console.log("success");
              resolve(base64String);
            }).catch((err) => {
              // error
              this.divCard.hidden = true;
              this.labelLoading.hidden = true;
              this.video.hidden = true;
              reject(`Error al codificar video ${err}`);
            });
          }).catch((err) => {
            this.divCard.hidden = true;
            this.labelLoading.hidden = true;
            this.video.hidden = true;
            reject(`Error al grabar video ${err}`);
          });
        }).catch((err) => {
          this.divCard.hidden = true;
          this.video.hidden = true;
          this.labelLoading.hidden = true;
          reject(`Error al levantar modelos face api${err}`);
        });
    });
  }

  /**
   * Calcula distancia entre dos puntos, para ver los winks
   * @param p1 p1 (x, y): First point
   * @param p2 p2 (x, y): Second point
   * @returns Calculate the distance between 2 points
   */
  distance(p1: any, p2: any) {
    return Math.sqrt(Math.pow((p2.x - p1.x), 2) + Math.pow((p2.y - p1.y), 2));
  }

}