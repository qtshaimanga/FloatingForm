import { Graphics } from 'pixi.js';
import NumberUtils from '../utils/number-utils';



class Particle extends Graphics {   //ppte graphics dans particules -> extends via super();

  constructor(options) {
      
      super(); //sert a appeler le constructeur de la classe parent -> equivaut à this = new graphics;

      this._emitter = options.emitter;    // Recup option de l'emitteur
      this.options = options;   //

      var alpha= Math.random();
      this.beginFill( 0xFFFFFF, alpha );
      this.drawCircle(0, 0, 1.5);
          
      this.reset();

  }

  reset( color ) {

    this.isAlive = true;

    var radius = 15;   // cste pour definir le diametre minimum d'ou sont crées les particules

    var maxAngle = 80;
    var minAngle = 0;
    var randAngle = Math.abs( ( Math.random() * maxAngle * 2 ) - minAngle ) - 150;    // angle de projection des particules

    this.x = this._emitter.x + Math.sin(NumberUtils.toRadians(randAngle)) * radius;     // definition de l'origine en fonction de la position de l'emitter
    this.y = this._emitter.y + Math.cos(NumberUtils.toRadians(randAngle)) * radius;   
    
    this.originY = this.y;  //variation d'origine en fonction de la position de l'emitter

    this.vx = -0.5 + -1 * ( Math.random() * 6.5 );    // velocity
    this.vy = 0;

    this.life = Math.random()*2400;   
    this.originLife = this.life;    // durée de vie original -> décrémentation de alpha en fonction de l'eloignement
    
    this.tint = color;    // variation couleurs des particules via variation de leur tinte

    this.motionAmplitude = Math.random() * 50;    // ondulation propre des particules
    this.motionAngle = 0;
    this.motionAngleSpeed = Math.random() * 0.1;

  }
    

    
  update( dt, frequenceMoyenneBasse ) {
      
      this.x += this.vx;    // move
      this.y = this.originY + ( Math.sin(this.motionAngle) * this.motionAmplitude );   //variation d'origine en fonction de la position de l'emitter + ondulation 
      this.life -= dt;

      if( this.life < 0 ) this.isAlive = false;
      
       if(this.life > 2050){

          // decoupe des frequences hight -> low = scale des partcules different
          if(frequenceMoyenneBasse >= 100){
            this.scale.x = frequenceMoyenneBasse/30;
            this.scale.y = frequenceMoyenneBasse/30;
          }

          if(frequenceMoyenneBasse > 150){
            this.scale.x = frequenceMoyenneBasse/25;
            this.scale.y = frequenceMoyenneBasse/25;
          }

          if(frequenceMoyenneBasse >= 200){
            this.scale.x = frequenceMoyenneBasse/20;
            this.scale.y = frequenceMoyenneBasse/20;
          }

          if(frequenceMoyenneBasse >= 350){
            this.scale.x = frequenceMoyenneBasse/10;
            this.scale.y = frequenceMoyenneBasse/10;
          }
    }

      this.motionAngle += this.motionAngleSpeed;
      this.alpha = NumberUtils.map( this.life, this.originLife, 0, 1, 0 );    // plus les particules s'eloigne plus alpha diminu  cf. fonction map
         
  }
    

}

export default Particle;