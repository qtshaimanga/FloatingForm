import Dat from 'dat-gui';
import Scene from './scene/scene';
import { Graphics } from 'pixi.js';
import NumberUtils from './utils/number-utils';
import Particle from './lib/particle';
import Emitter from './lib/emitter';


let angle = 0;

var audioCtx = new AudioContext();

var analyser = audioCtx.createAnalyser();

var frequencyData = new Uint8Array(analyser.frequencyBinCount); // tab a 24 entrer avec tt tableau du channel

var audioBuffer;
var audioSource;

var flashTimer;
var canFlash = true;

function loadSound() {
  var request = new XMLHttpRequest();
  request.open('GET', '/sounds/faker.mp3', true);
  request.responseType = 'arraybuffer';

  // Decode asynchronously
  request.onload = function() {

    audioCtx.decodeAudioData(request.response, function(buffer) {

        // success callback
        audioBuffer = buffer;

        // Create sound from buffer
        audioSource = audioCtx.createBufferSource();
        audioSource.buffer = audioBuffer;

        // connect the audio source to analyser
        audioSource.connect( analyser);

        // connecte analyser to context's output
        analyser.connect(audioCtx.destination);

          var flag = 0;
          document.getElementById('play').onclick = function(){
              if( flag == 0 ){
                  audioSource.start();
                  flag = 1;
              }else {
                  location.reload();    // Faire fonction play -  pause / attention au  buffer
                  flag = 0;
              }
          }

    }, function(){
      // error callback
      location.reload();
    });
  }

  request.send();
}


class App {     // class ES6

  constructor() {

    this.DELTA_TIME = 0;
    this.LAST_TIME = Date.now();

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene = new Scene();

    let root = document.body.querySelector('.app')
    root.appendChild( this.scene.renderer.view );

    //Flash
    this.flash = new Graphics();
    this.flash.beginFill( 0xFFFFFF);
    this.flash.drawRect( 0, 0, this.width, this.height);
    this.flash.x = 0;
    this.flash.y = 0;
    this.flash.alpha = 0;

    //Background form
    this.smallSquare = new Graphics();
    this.smallSquare.beginFill( 0x04F8857 );
    this.smallSquare.drawRect( -250, -250, 500, 500 );
    this.smallSquare.x = this.width / 4;
    this.smallSquare.y = ( this.height) * 2/ 3;
    this.smallSquare.alpha = 0.4;

    this.bigSquare = new Graphics();
    this.bigSquare.beginFill( 0xEAE8D3 );
    this.bigSquare.drawRect( -250, -250, 900, 900 );
    this.bigSquare.x = (this.width) + 450;
    this.bigSquare.y = (this.height) / 6;
    this.bigSquare.alpha = 0.2;

    this.bigCircle = new Graphics();
    this.bigCircle.beginFill( 0xED6069);
    this.bigCircle.drawCircle(0, 0, 400 );
    this.bigCircle.x = - 200  ;
    this.bigCircle.y = 200;
    this.bigCircle.alpha = 0.1;
    this.direction = 1;

    this.cube1 = new Graphics();    // 1
    this.cube1.beginFill( 0xFFAFA3 );
    this.cube1.drawRect( 0, 0, this.width, this.height/3);
    this.cube1.x = 0;
    this.cube1.y = 0 ;
    this.cube1.alpha = 1;

    this.cube2 = new Graphics();    // 2
    this.cube2.beginFill( 0xF2CF73);
    this.cube2.drawRect( 0, 0, this.width, this.height/3);
    this.cube2.x = 0;
    this.cube2.y = ( this.height )/ 3;
    this.cube2.alpha = 1;

    this.cube3 = new Graphics();    // 3
    this.cube3.beginFill( 0x66A5AC );
    this.cube3.drawRect( 0, 0, this.width, this.height/3);
    this.cube3.x = 0;
    this.cube3.y = ( this.height) * 2/ 3;
    this.cube3.alpha = 1;

    //add child par superpositions
    this.scene.addChild( this.cube1 );
    this.scene.addChild( this.cube2 );
    this.scene.addChild( this.cube3 );
    this.scene.addChild( this.flash );
    this.scene.addChild( this.bigCircle );
    this.scene.addChild( this.bigSquare );
    this.scene.addChild( this.smallSquare );

    /* vers Emitter */
    this.emitter = new Emitter(this.scene);

    this.addListeners();
    loadSound()
  }




  /**
   * addListeners
   */
  addListeners() {

    window.addEventListener( 'resize', this.onResize.bind(this) );
    TweenMax.ticker.addEventListener( 'tick', this.update.bind(this) )

  }



  /**
   * update
   * - Triggered on every TweenMax tick
   */
  update() {  //cf. requesAanimFrm

    this.DELTA_TIME = Date.now() - this.LAST_TIME;
    this.LAST_TIME = Date.now();

    this.scene.render();

      analyser.getByteFrequencyData(frequencyData);

      /* calcul freq moyenne */
      var frequenceMoyenneBasse = 0;
      var nbfrq = 1024;   // ensemble de index des frequences possibles
      var cumul = 0;

      for(let i=0; i<102; i++){     // mapp frequences sur un echelle de 102 intervalles avec un gap de 10 par 10 pour faire tt les index initiaux
          cumul += frequencyData[i*10];   // frequences par tranches
      }

      var frequenceMoyenneBasse = cumul / 102;    // FrqcMoyenne = culmule des frequence / par mon nombre d'intervalle (mon gap)
      frequenceMoyenneBasse *= 9.2 ;    //amplification de l'amplitude de initiale


      // FLASH
      if( frequenceMoyenneBasse > 455 && canFlash ) {
          canFlash = false;
          this.flash.alpha = 0.1;
          this.bigSquare.alpha= 0.7;
          this.bigSquare.scale.x = 1.01;
          this.bigSquare.scale.y = 1.01;
          this.smallSquare.alpha=0.5;
          this.bigCircle.alpha=0.5;
        // Fonction anon -> perturbe lescope donc bind le this
        // canFlash = setTimeout( function() {
        //   canFlash = true;
        // }.bind(this) )
        if( flashTimer ) clearTimeout( flashTimer )   // verifie si flashTimer existe
        flashTimer = setTimeout( () => {              // interval d'activation pour ne pas rester action sur une grande tranche d'index actifs
          canFlash = true;
        }, 1400 )

      }else if( frequenceMoyenneBasse < 455){   // retour en position initiale
          this.flash.alpha = 0;
          this.bigSquare.alpha= 0.2;
          this.bigSquare.scale.x = 1;
          this.bigSquare.scale.y = 1;
          this.smallSquare.alpha=0.2;
          this.bigCircle.alpha=0.2;
      }


      this.emitter.update(this.DELTA_TIME, frequenceMoyenneBasse);


      // BigSquare
      if( this.bigSquare.x < -300){
          this.bigSquare.x = this.width + 300;
      }
      if( this.smallSquare.x < -450){
          this.smallSquare.x = this.width + 450;
      }
      this.bigSquare.x -= .1;
      this.bigSquare.rotation += 0.001

      // SmallSquare + rebond
      if(this.smallSquare.y > 250 && this.direction==1 ){
          this.smallSquare.y -= .4;
      }else {
        this.direction= -1;
      }
      if(this.direction==-1 && this.smallSquare.y < 600){
          this.smallSquare.y += .4;
      }else{
          this.direction = 1;
      }
      this.smallSquare.x -= .5;
      this.smallSquare.rotation += 0.001

      //Big circle
      if( this.bigCircle.x < -1200 ){
          this.bigCircle.x = this.width + 400;
      }else if (this.bigCircle.y < -400){
          this.bigCircle.y = this.height + 200;
      }
      this.bigCircle.x -= .3;
      this.bigCircle.y -= .3;

  }



  /**
   * onResize
   * - Triggered when window is resized
   * @param  {obj} evt
   */
  onResize( evt ) {

    this.width = window.innerWidth;
    this.height = window.innerHeight;

    this.scene.resize( this.width, this.height );

  }


}

export default App;
