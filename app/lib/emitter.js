import Particle from './particle';
import {Graphics} from 'pixi.js';
import NumberUtils from '../utils/number-utils';

//tab de mes couleurs
const particlesColor = [
    0xB76262,
    0xd67d13,
    0x2c6f76
]

class Emitter extends Graphics {

    constructor (scene){
        super();

        this.currentTime = 0;

        this.x = window.innerWidth/2;
        this.y = window.innerHeight/2;

        this.id = NumberUtils.generateUUID();       // emitter unique

        this.lineStyle(0.5, 0xFFFFFF, 1);
        this.drawCircle(0, 0, 4 );

        this.scene = scene;
        this.pool = [];
        this.particules = [];

        this.createPool();     

        this.scene.addChild(this);
    }

    // Cree en memoire toutes les particules
    createPool() {
        for ( let i = 0; i < 2000; i++ ) {   //creat pool of 2000 particles

            const options = {
                emitter: this,
                x : window.innerWidth / 2,      
                y : window.innerHeight / 2, 
            }

            // add to pool
            let p = new Particle(options);
            this.pool.push(p);      // ajoute a la suite dans la pool 

        }
    }

    getParticleFromPool() {
        let p = this.pool[0];
        
        // Definir la couleur en fonction de la hauteur
        let idx = 0;
        let normalizedY = this.y / window.innerHeight       // ratio de la hauteur atteinte 

        if ( normalizedY > 0.33 && normalizedY < 0.66 ) idx = 1 // si depasse 1/3 de la hauteur
        if ( normalizedY >= 0.66 ) idx = 2      // si depasse 2/3 de la hauteur

        p.reset( particlesColor[idx] );     // parametres des particules sont restart (sinon return avec un this.life > limit)
        this.pool.shift();  // supprime premier element du tableau dans la pool car jet
        return p; 
    }



    returnParticleToPool( p ) {
        this.pool.push( p );   //remet les particules à la fin du tableau de pool
    }
    

    
    throw(nb){
        for (let i= 0; i<nb ; i++){
            /* Nouveau jet */
            let p = this.getParticleFromPool();
            this.particules.push(p);
            this.scene.addChild(p);     
        }        
    }
    
    

     update(dt, frequenceMoyenneBasse) {

        // temps entre deux actions
        this.currentTime += dt;
         // espacement entre deux jet
        if ( this.currentTime >= 110 ) {       //on re-crée des particules 300ms apres la fin du jet précédent.
            this.currentTime = 0;
            this.throw(8);
        }

        this.y = ( window.innerHeight * 4/ 8 ) - ( (frequenceMoyenneBasse - 117) );   // 256 / 2 -> 127, ici on remarque un tassement des frequence donc on recentre l'espace de variation
        
        this.y = NumberUtils.map( this.y, 70, 550, 0, window.innerHeight - (window.innerHeight/3) );    // interpolation de valeur !!!   Mapp notre intervalle sur un autre intervalle plus adequat
        // puls de l'emitter par rapport aux frequenceMoyenneBasse
        this.scale.x = 1 + (frequenceMoyenneBasse / 75);        
        this.scale.y = 1 + (frequenceMoyenneBasse / 75);


        for(let i=0; i<this.particules.length; i++){    // boucle sur les particules emises
            
            let p= this.particules[i];
            p.update( dt, frequenceMoyenneBasse );

                if (!this.particules[i].isAlive){
                    this.returnParticleToPool(this.particules[i]);  // remet particules morte dans le tableau
                    this.particules.splice(i, 1);   //  return au debut du tab, dans la piscine 
                    this.scene.removeChild(p);      // si tu meurs, tu disparais 
                }

        }
     }

}


export default Emitter;