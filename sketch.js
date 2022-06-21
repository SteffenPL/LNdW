
// global (constant) parameters 
const s = 20;
const w = 1280;
const h = 768;
const pv = p5.Vector;

function x(z) {
  return map(z, 0, 100, 0, w);
}

function y(z) {
  return map(z, 0, 100, 0, h);
}

let cells = [], walls = [], cnts, grads, 
labels = ["1","2","3","4","5","6","7","8",];
let gui, 
  sl_1, sl_2, sl_3, sl_4, sl_5, sl_6, sl_7, sl_8, 
  btn_run, btn_reset, btn_forces, btn_two;
let game_mode = 1;

// model parameters
const D = 0.2;

// some helpers


/* modes:

Einzeln:
1. Abstoßung
2. Verkleben
3. Platzmangel
4. Stress vermeiden
5. Tumble
6. Chemo

Zweispieler:
1. Abstoßung
2. Verklebel
3. Stress
4. Chemo

*/

class Cell {
  constructor(t){
    const alpha = random(0, 2*PI);
    this.pol = createVector(sin(alpha), cos(alpha));
    this.f = createVector(0.0, 0.0);
    this.r_h = 10;
    this.r_s = 20;
    this.rand = random(0,1);
    this.type = t;
    this.mode = 0;
    if( t == 0 ) {
      this.pos = createVector(random(0, width/2), random(100, height));
      this.col = {r: 80, g: 150, b: 50};
    }
    else{
      this.pos = createVector(random(width/2, width), random(100, height));
      this.col = {r: 150, g: 80, b: 50};
    }
  }
  draw() {
    noStroke();
    fill(this.col.r, this.col.g, this.col.b, 50);
    circle(this.pos.x, this.pos.y, this.r_s*2);
    if( game_mode == 0 ) {
    if( this.mode == 0) {
      fill(this.col.r, this.col.g + 100, this.col.b);  
    } 
    else if ( this.mode == 1 ) {
      fill(this.col.r, this.col.g, this.col.b);
    } 
    else if ( this.mode == 2 ) {
      fill(this.col.r + 100, this.col.g, this.col.b);  
    } 
    else 
    {
      fill(this.col.r, this.col.g, this.col.b + 100);
    }
  }
  else
  {
    fill(this.col.r, this.col.g, this.col.b);
  }
    circle(this.pos.x, this.pos.y, this.r_h*2);

    stroke(255,255,255, 120);
    line(this.pos.x, this.pos.y, this.pos.x + this.r_s * this.pol.x, this.pos.y + this.r_s * this.pol.y);
    if( btn_forces.val ) {
      stroke(255,0,0, 100);
      line(this.pos.x, this.pos.y, this.pos.x + this.r_s * this.f.x, this.pos.y + this.r_s * this.f.y);
    }  
  }
}

class Contacts {
  constructor(N){
    this.cnts = [];
    for( let i = 0; i < N; ++i) {
      this.cnts[i] = [];
      for( let j = 0; j < N; ++j) {
        this.cnts[i][j] = false;
      }
    }
  }

  addContact(i, j) {
    this.cnts[i][j] = true;
    this.cnts[j][i] = true;
  }

  removeContact(i, j) {
    this.cnts[i][j] = false;
    this.cnts[j][i] = false;
  }

  hasContact(i, j) {
    return this.cnts[i][j];
  }

  
  draw(cells) {
    strokeWeight(4);
    stroke(200,100,0, 120);
    for( let i = 0; i < cells.length; ++i) {
      for( let j = 0; j < i; ++j) {
        if ( this.cnts[i][j] ) {
          line(cells[i].pos.x, cells[i].pos.y, cells[j].pos.x, cells[j].pos.y);
        }
      }
    }
  }
}


let N = 120;
let first_step = true;
function init() {
  first_step = true
  switch(game_mode) {
    case 0:
      walls = [
        {pos: createVector(x(50), y(25)), normal: createVector(0.0, 1.0), l: x(90)},
        {pos: createVector(x(50), y(95)), normal: createVector(0.0, -1.0), l: x(90)},
        {pos: createVector(x(5), y(60)), normal: createVector(1.0, 0.0), l: y(70)},
        {pos: createVector(x(95), y(60)), normal: createVector(-1.0, 0.0), l: y(70)}]
      
      grads = {pos: createVector(w - 10, 128 + ((h-128)/2))};

      cells.length = 0;
      for(let i = 0; i < N; i++){
        cells.push( new Cell(0) );
      }

      labels = ["Abstoßung",
        "Verkleben",
        "Platzmangel",
        "Stress vermeiden",
        "Zufall",
        "Geruchspur", "Heterogenität","Schnelligkeit"]
    break;

    case 1:
      walls = [
        {pos: createVector(x(50), y(25)), normal: createVector(0.0, 1.0), l: x(90)},
       {pos: createVector(x(25), y(80)), normal: createVector(0.0, 1.0).rotate(radians(-0)), l: x(40)},
        {pos: createVector(x(75), y(80)), normal: createVector(0.0, 1.0).rotate(radians(0)), l: x(40)},
        {pos: createVector(x(50), y(70)), normal: createVector(0.0, 1.0).rotate(radians(0)), l: x(40)},
       {pos: createVector(x(50), y(95)), normal: createVector(0.0, -1.0), l: x(90)},
        {pos: createVector(x(5), y(60)), normal: createVector(1.0, 0.0), l: y(70)},
        {pos: createVector(x(95), y(60)), normal: createVector(-1.0, 0.0), l: y(70)}]
      
      grads = {pos: createVector(x(50), y(40))};

      cells.length = 0;
      const N1 = round(N/2);
      for(let i = 0; i < N1; i++){
        cells.push( new Cell(0) );
        cells[i].pos.y = random(y(80),y(90));
      }
      for(let i = N1; i < N; i++){
        cells.push( new Cell(1) );
        cells[i].pos.y = random(y(80),y(90));
      }

      labels = ["Abstoßung",
        "Heterogenität",
        "Stress vermeiden",
        "Geruchssinn",
        "Abstoßung",
        "Heterogenität",
        "Stress vermeiden",
        "Geruchssinn",]
      labels = ["Repulsion",
        "Adhesion",
        "Alignment",
        "Chemotaxis",
        "Repulsion",
        "Adhesion",
        "Alignment",
        "Chemotaxis",]
    break;
    default:
          
      walls = [
        {pos: createVector(w / 4, 128.0), normal: createVector(0.0, 1.0).rotate(30), l: w - 32},
        {pos: createVector(3*w/4, 128.0), normal: createVector(0.0, 1.0).rotate(30), l: w - 32},
        {pos: createVector(w / 2,  h - 32), normal: createVector(0.0, -1.0), l: w - 32},
        {pos: createVector(16, 128  + (h-128-32) / 2), normal: createVector(1.0, 0.0), l: h - 128 -32},
        {pos: createVector(w - 16, 128  + (h-128-32) / 2), normal: createVector(-1.0, 0.0), l: h - 128 -32},
        //{pos: createVector(w - 16, 128  + (h-128-32) / 2), normal: createVector(-1, 1).normalize(), l: h - 128 -32}
      ]

      grads = {pos: createVector(w - 10, 128 + ((h-128)/2))};

      cells.length = 0;
      const N2 = N; //round(N/2);
      for(let i = 0; i < N2; i++){
        cells.push( new Cell(0) );
      }
      
      for(let i = N2; i < N; i++){
        cells.push( new Cell(1) );
      }
  }

  cnts = new Contacts(cells.length);
  cnts.addContact(0,1);

}

function setup() {
  let canvas = createCanvas(w, h);
  canvas.parent('sketch-holder');

  frameRate(30);

  gui = createGui();
  btn_run = createToggle("Start", x(5), y(2.5), x(15), y(5));
  btn_reset = createButton("Neu", x(5), y(7.5), x(15), y(5));
  btn_forces = createToggle("Modus", x(5), y(12.5), x(15), y(5));

  sl_1 = createSlider("p1", x(25), y(10), x(8), y(4));
  sl_2 = createSlider("p2", x(25 + 9), y(10), x(8), y(4));
  sl_3 = createSlider("p3", x(25 + 2*9), y(10), x(8), y(4));
  sl_4 = createSlider("p4", x(25 + 3*9), y(10), x(8), y(4));
  sl_5 = createSlider("p5", x(25 + 4*9), y(10), x(8), y(4));
  sl_6 = createSlider("p6", x(25 + 5*9), y(10), x(8), y(4));
  sl_7 = createSlider("p7", x(25 + 6*9), y(10), x(8), y(4));
  sl_8 = createSlider("p8", x(25 + 7*9), y(10), x(8), y(4));
  
  init();
}

 /*// Enable WebMidi.js and trigger the onEnabled() function when ready
 WebMidi
 .enable()
 .then(onEnabled)
 .catch(err => alert(err));


// Function triggered when WebMidi.js is ready
function onEnabled() {
  const controller = WebMidi.getInputByName("X-TOUCH MINI")

 // Display available MIDI input devices
 if (!controller) {
   document.body.innerHTML+= "No device detected.";
   return false;
 }
  

 controller.addListener("controlchange", e => {
      //document.getElementById("midi_display").innerHTML = `Last change: CC ${e.controller.number}, value =  ${e.value} <br>`;

      const cc = e.controller.number;
      if( cc == 11 ) {
        sl_1.val = e.value;
      }
      if( cc == 12 ) {
        sl_2.val = e.value;
      }
      if( cc == 13 ) {
        sl_3.val = e.value;
      }
      if( cc == 14 ) {
        sl_4.val = e.value;
      }
      if( cc == 15 ) {
        sl_5.val = e.value;
      }
      if( cc == 16 ) {
        sl_6.val = e.value;
      }
      if( cc == 17 ) {
        sl_7.val = e.value;
      }
      if( cc == 18 ) {
        sl_8.val = e.value;
      }


      if( cc == 37 && e.value == 1) {
        N -= 10;
        N = max(10, N);
        init();
      }
      if( cc == 38 && e.value == 1) {
        N += 10;
        N = min(160, N);
        init();
      }

      if( cc == 39 && e.value == 1) {
        game_mode = game_mode == 1 ? 0 : 1;
        init();
      }
      if( cc == 40 && e.value == 1) {
        btn_forces.val = !btn_forces.val;
      }
      if( cc == 41 && e.value == 1) {
        btn_run.val = !btn_run.val;
      }
      if( cc == 42 && e.value == 1) {
        init();
      }
  });
}
*/

let t = 0.0;

const modeRun = 0;
const modeTumble = 1;
const modeCIL = 2;
const modeCluster = 3;
const tf = 1000;

function expRand(rate) {
  return random() <= (1.0 - exp(-deltaTime / (rate * tf) ));
}

let p_def = {
  r: 20,
  r_spread: 5, 
  chemo: 0.1,
  run_speed: 1.2, 
  tumble_speed: 0.5, 
  cil_speed: 0.7, 
  cluster_speed: 0.8, 
  run_dur: 15.0, 
  tumble_dur: 6.0, 
  rotation_dur: 2.0, 
  cil_dur: 5.0,
  new_adh_dur: 3.0, 
  break_adh_dur: 12.0, 
  cntc_dur: 1.0,
  diff_coef: 0.02,  
  adh_stiffness: 0.02,
  plitho_align: 50,
  plitho_max: 50,
  plitho_min: 0.1,
  plitho_spread: 3.14/2,
  plitho_dur: 3,
  soft_rep: 0.2,
  wall_rep: 0.2,
  n_substeps: 10,
  mu: 2
};

let p = {...p_def};
let p2 = {...p_def};

function P(i) {
  return (game_mode == 0 || cells[i].type == 0) ? p : p2; 
}

function timeStep() {

  switch( game_mode ) {
  case 1:
      p.soft_rep = (0.1 + 2*sl_1.val) * p_def.soft_rep;
      p.adh_stiffness = pow(2*sl_2.val,2) * p_def.adh_stiffness;
      //p.r_spread = pow(2*sl_2.val, 2) * p_def.r_spread;
      for( let i = 0; i < cells.length; ++i) {
        if( cells[i].type == 0 )
        {
          cells[i].r_s = p.r + p.r_spread * (pow(cells[i].rand,2) - 0.5);
          cells[i].r_h = cells[i].r_s/2;
        }
      }
      p.plitho_align = 2*sl_3.val * p_def.plitho_align;
      //p.plitho_spread = (2 - 2*sl_3.val) * p_def.plitho_spread;
      p.chemo = (sl_4.val) * p_def.chemo;

      p2.soft_rep = (0.1 + 2*sl_5.val) * p_def.soft_rep;
      p2.adh_stiffness = pow(2*sl_6.val,2) * p_def.adh_stiffness;
      //p2.r_spread = pow(2*sl_6.val, 2) * p_def.r_spread;
      for( let i = 0; i < cells.length; ++i) {
        if( cells[i].type == 1 )
        {
          cells[i].r_s = p.r + p2.r_spread * (pow(cells[i].rand,2) - 0.5);
          cells[i].r_h = cells[i].r_s/2;
        }
      }
      p2.plitho_align = 2*sl_7.val * p_def.plitho_align;
      //p.plitho_spread = (2 - 2*sl_3.val) * p_def.plitho_spread;
      p2.chemo = (sl_8.val) * p_def.chemo;
      p.r_spread = p_def.r_spread;
      p.cluster_speed = p_def.cluster_speed;
      p.plitho_spread = p_def.plitho_spread;

    break; 
  default:
    p.soft_rep = 2*sl_1.val * p_def.soft_rep;
    p.adh_stiffness = pow(2*sl_2.val,2) * p_def.adh_stiffness;
    const p3 = abs(1 - 2*sl_3.val);
    walls[0].pos.y = y(25) + p3 * y(35);
    walls[1].pos.y = y(95) - p3 * y(35);
    p.plitho_align = 2*sl_4.val * p_def.plitho_align;
    p.plitho_spread = (2 - 2*sl_4.val) * p_def.plitho_spread;
    p.tumble_dur = (2*sl_5.val) * p.tumble_dur;
    p.chemo = (sl_6.val) * p_def.chemo;
    p.r_spread = pow(2*sl_7.val, 2) * p_def.r_spread;
    for( let i = 0; i < cells.length; ++i) {
      cells[i].r_s = p.r + p.r_spread * (pow(cells[i].rand,2) - 0.5);
      cells[i].r_h = cells[i].r_s/2;
    }
    p.run_speed = (2*sl_8.val) * p_def.run_speed;
    p.cluster_speed = (2*sl_8.val) * p_def.cluster_speed;
  break;
  }

  const dt = deltaTime / p.n_substeps;

  for( let step = 0; step < p.n_substeps; ++step ) {
    // remove contacts 
    for( let i = 0; i < cells.length; ++i) {
      for( let j = 0; j < i; ++j) {
        if( expRand(p.break_adh_dur) ) {
          cnts.removeContact(i, j);
        }
      }
    }

    // add contacts
    for( let i = 0; i < cells.length; ++i) {
      for( let j = 0; j < i; ++j) {
        const Rij = cells[i].r_s + cells[j].r_s;
        if( cells[i].type == cells[j].type && pv.dist(cells[i].pos, cells[j].pos) < Rij && expRand(P(i).new_adh_dur) ) {
          cnts.addContact(i, j);
        }
      }
    }

    // switch between modes
    for( let i = 0; i < cells.length; ++i) {
      let n_contacts = 0;
      let j = 0;
      for( let k = 0; k < cells.length; ++k ) {
        if( cnts.hasContact(i,k) ) {
          n_contacts += 1;
          j = k;
        }
      }


      let mi = cells[i].mode;
      if ( (mi == modeRun || mi == modeTumble) && n_contacts > 0 && expRand(p.cntc_dur) ) {
        if( n_contacts == 1 ) {
          cells[i].mode = modeCIL;
          cells[i].pol.normalize().mult(p.cil_speed);
        }
        else {              
          cells[i].mode = modeCluster;
          cells[i].pol.normalize().mult(p.cluster_speed);
        }
      }
      else if ( mi == modeRun ) {
        if ( expRand(p.run_dur) ) {
          cells[i].mode = modeTumble;
          cells[i].pol.normalize().mult(p.tumble_speed);

        }
      } else if (mi == modeTumble ) {
        if ( expRand(p.tumble_dur) ) {
          cells[i].mode = modeRun;
          cells[i].pol.normalize().mult(p.run_speed);
        }
        else if ( expRand(p.rotation_dur) ) {         
          cells[i].pol.x = sin(random(0,2*PI));        
          cells[i].pol.y = cos(random(0,2*PI));
          cells[i].pol.normalize().mult(p.run_speed);
        }
      }
      else if ( mi == modeCIL ) {
        if ( n_contacts > 1 ) {
          cells[i].mode = modeCluster;
          cells[i].pol.normalize().mult(p.cluster_speed);
        }
        else if ( expRand(p.cil_dur) ) {
          if ( n_contacts >= 1 ) {
            cnts.removeContact(i, j);

            const xixj = pv.sub(cells[j].pos, cells[i].pos);
            cells[j].mode = modeRun;
            cells[j].pol.set( xixj );
            cells[j].pol.normalize().mult(p.run_speed);
            
            cells[i].pol.set( xixj ).mult(-1);
          }
          cells[i].mode = modeRun;
          cells[i].pol.normalize().mult(p.run_speed);
        }
      }
      else if ( mi == modeCluster ) {
        if ( n_contacts == 0 ) {
          cells[i].mode = modeRun;
          cells[i].pol.normalize().mult(p.run_speed);
        }
        else if ( n_contacts == 1 ) {
          cells[i].mode = modeCIL;
          cells[i].pol.normalize().mult(p.cil_speed);
        }
        else 
        {
          const s = cells[i].pol.mag();
          let rate = P(i).plitho_dur;
          if ( s > 0 ) {
            rate += P(i).plitho_align/p.mu * pv.dot(cells[i].pol, cells[i].f)/s;
          }
          rate = min(p.plitho_max, rate);
          rate = max(p.plitho_min, rate);

          if ( expRand(rate) ) {
            cells[i].pol.set( cells[i].f )
              .normalize()
              .mult(P(i).cluster_speed).rotate(random(-1,1)*P(i).plitho_spread);   
          }
        }
      }
    }

    // compute forces 
    const mu_f = 0.1;
    for(let i = 0; i < cells.length; ++i) {
      cells[i].f.set(0.0,0.0);

      if ( p.chemo > 0 ) {
        xica = pv.sub(grads.pos, cells[i].pos);
        const angl = xica.angleBetween(cells[i].pol);
        cells[i].pol.setHeading(cells[i].pol.heading() - dt/100 * P(i).chemo *angl );
      }
    }

    for(let i = 0; i < cells.length; ++i) {
      cells[i].f.add( pv.mult(cells[i].pol,  p.mu) );

      for(let j = 0; j < i; ++j) {
        const xixj = pv.sub( cells[j].pos, cells[i].pos );
        if ( cnts.hasContact(i, j) ) {
          cells[i].f.add( pv.mult(xixj, p.adh_stiffness ) );
          cells[j].f.sub( pv.mult(xixj, p.adh_stiffness ) );
        }

        const d = pv.dist(cells[j].pos, cells[i].pos);
        const Rij = cells[i].r_s + cells[j].r_s;
        if( d < Rij && d > Rij/10) {
          cells[i].f.add( pv.mult(xixj, -P(i).soft_rep * (Rij - d)/d ) );
          cells[j].f.sub( pv.mult(xixj, -P(j).soft_rep * (Rij - d)/d ) );
        }
      }
      
      for(let iw = 0; iw < walls.length; ++iw) {
        const wall = walls[iw];
        const d = pv.dot(pv.sub(cells[i].pos, wall.pos), wall.normal);
        if( d > 0 && abs(d) < cells[i].r_s  && pv.dist(cells[i].pos, wall.pos) < wall.l/2 + cells[i].r_h) {
          cells[i].f.sub( pv.mult(wall.normal, (abs(d)-cells[i].r_s) * P(i).soft_rep) );
        }
        if( d < 0 && abs(d) < cells[i].r_s  && pv.dist(cells[i].pos, wall.pos) < wall.l/2 + cells[i].r_h) {
          cells[i].f.add( pv.mult(wall.normal, (abs(d)-cells[i].r_s) * P(i).soft_rep) );
        }
      }
    }


    for(let i = 0; i < cells.length; ++i) {
      // noise 
      cells[i].pos.x += sqrt(dt) * p.diff_coef * randomGaussian()
      cells[i].pos.y += sqrt(dt) * p.diff_coef * randomGaussian()

      // add force
      cells[i].pos.x += mu_f * dt * cells[i].f.x / p.mu;
      cells[i].pos.y += mu_f * dt * cells[i].f.y / p.mu;

    }

    for(let i = 0; i < cells.length; ++i) {
      for(let j = 0; j < i; ++j ) {
        const Rij = cells[i].r_h + cells[j].r_h;
        const d = pv.dist(cells[i].pos, cells[j].pos) - Rij;
        if ( d < 0.0 && d != -Rij) {
          const xixj = pv.sub(cells[i].pos, cells[j].pos);
          xixj.mult(0.5 * d/(d+Rij));
          cells[i].pos.sub(xixj);
          cells[j].pos.add(xixj);
        }
      }

      // fix constraints
      for(let iw = 0; iw < walls.length; ++iw) {
        const wall = walls[iw];
        let d = pv.dot(pv.sub(cells[i].pos, wall.pos), wall.normal);
        
        if( !first_step && game_mode == 1) {            
          if( d > 0 && abs(d) < cells[i].r_h  && pv.dist(cells[i].pos, wall.pos) < wall.l/2 + cells[i].r_h) {
            cells[i].pos.sub( pv.mult(wall.normal, abs(d) - cells[i].r_h) );
          }
          if( d < 0 && abs(d) < cells[i].r_h  && pv.dist(cells[i].pos, wall.pos) < wall.l/2 + cells[i].r_h) {
            cells[i].pos.add( pv.mult(wall.normal, abs(d) - cells[i].r_h) );
          }
        }
        else 
        {
          d -= cells[i].r_h;
          if( d < 0 ) {
            cells[i].pos.sub( pv.mult(wall.normal, d) );
          }

        }
      }
    }
  }

  first_step = false;
}



function draw() {
  background(00);
  strokeWeight(2);
  noStroke();
  textSize(16);
  textAlign(CENTER);
  fill(200);
  for( let i = 0; i < 8; ++i ) {
    text(labels[i], x(25 + 4. + i*9), y(5 + ((i % 2 == 0) ? 0 : 3)) );
  }

  for( let r = 0; r < 25; ++r) {
    noStroke();
    fill(255,128,0,40.0 * ((game_mode == 1 ) ? 0.1 : p.chemo) );
    circle(grads.pos.x, grads.pos.y, r*30);
  }

  drawGui();

  if( btn_reset.isPressed ) {
    init();
  }

  if( btn_forces.isPressed ) {

    game_mode = game_mode == 1 ? 0 : 1;
    init();
  }

  t = t + deltaTime;

  if( !btn_run.val ) {
    timeStep();
  }

  cnts.draw(cells);
  for(let i = 0; i < cells.length; ++i) {
    cells[i].draw();
  }

  if ( game_mode == 1 ) {
    let player1 = 0.0;
    let player2 = 0.0;
    for( let i = 0; i < cells.length; ++i ) {
      const point = pv.dist(grads.pos, cells[i].pos)
      if( cells[i].pos.x > x(5) && 
        cells[i].pos.x < x(95) && 
        cells[i].pos.y > y(25) && 
        cells[i].pos.y < y(95) && point < x(15) ) {
        if( cells[i].type == 0 ) {
          player1 += 1;
          if( point < x(10) )
            player1 += 2;
        }
        else
        {
          player2 += 1;        
          if( point < x(10) )
          player2 += 2;

        }
      }
    }
    player1 = player1;
    player2 = player2;
    fill(255);
    text(player1, x(20), y(98));
    text(player2, x(80), y(98));
    const rel = player2 / (player1 + player2);
    circle(x(20) + rel * x(60), y(98), y(1));
  }


  for( let i = 0; i < walls.length; i++) {
    const w = walls[i];
    const dx = w.normal.y * w.l / 2;
    const dy = -w.normal.x * w.l / 2;
    stroke(255);
    line(w.pos.x - dx, w.pos.y - dy, w.pos.x + dx, w.pos.y + dy)
  }
}
