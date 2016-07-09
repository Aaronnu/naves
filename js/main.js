var sonido_disparo= new Howl({
				urls:['sonidos/disparo_5.wav'],
				buffer: true
			});
var tema = new Howl({
				urls:['sonidos/super_hexagon_trailer.MP3'],
				buffer: true
			});

//objetos importantes de canvas
var canvas = document.getElementById('game');
var ctx = canvas.getContext('2d');

var ImgEnemigos = new Image();
ImgEnemigos.src = 'imagenes/Nave2.png';

var DisparaNave = new Image();
DisparaNave.src = 'imagenes/disparo1.png';

var ImgFireEnemigo = new Image();
ImgFireEnemigo.src = 'imagenes/Disparo_enemigo1.png';

var ImagenNave = new Image();
ImagenNave.src = 'imagenes/Nave4.png';

//var imgNave = document.getElementById('img');
//crear el objeto de la nave
var nave = {
	x:100,
	y:canvas.height - 100,
	width:50,
	height:50,
	contador:0
}
var juego = {
	estado:'iniciando'
};
var textoRepuesta ={
	counter:-1 ,
	subtitulo:'',
	titulo:''
}
var teclado={};
// array para los disparos
var disparos = [];
var disparosEnemigos = [];
// array que almacena enemigos
var enemigos=[];
// definir variables para las imagenes
var fondo;
var x=0;
function loadMedia(){
	fondo = new Image();
	fondo.src= 'imagenes/space.jpg';
	fondo.onload = function () {
		var intervalo = window.setInterval(frameLoop,1000/55);
	} 
}
function actualizarEstadoJuego()
{
	
	
	if(juego.estado == 'jugando' && enemigos.length == 0)
	{
		
		juego.estado='victoria';
		textoRepuesta.titulo = 'Derrotaste los enemigos';
		textoRepuesta.subtitulo = 'Presiona la tecla r para continuar'
		textoRepuesta.contador = 0;
	}

	if(textoRepuesta.contador >=0)
	{
		textoRepuesta.contador++;
	}
	if((juego.estado == 'perdido'|| juego.estado == 'victoria') && teclado[82])
    {
    	juego.estado = 'iniciando';
    	nave.estado = 'vivo';
    	textoRepuesta.contador = -1;

    }		

}
function dibujarTexto()
{

	if(textoRepuesta.contador == -1) return;
	var alpha = textoRepuesta.contador/50.0;
	if(alpha > 1 ) 
	{
		for(var i in enemigos)
		{
			delete enemigos[i];
		}
	}
	ctx.save();
	ctx.globalAlpha = alpha;
	if(juego.estado == 'perdido')
	{
		ctx.fillStyle = 'white';
		ctx.font = 'Bold 40pt Arial';
		ctx.fillText(textoRepuesta.titulo,140,200);
		ctx.font= '14pt Arial';
		ctx.fillText(textoRepuesta.subtitulo, 190,250);
	}
	if(juego.estado == 'victoria')
	{
		
		ctx.fillStyle = 'white';
		ctx.font = 'Bold 40pt Arial';
		ctx.fillText(textoRepuesta.titulo,140,200);
		ctx.font = '14pt Arial';
		ctx.fillText(textoRepuesta.subtitulo, 190,250);
		console.log('texto grafico');
	}
	ctx.restore();

}
function dibujarEnemigos()
{
	for (var i in enemigos)
	{
		var enemigo = enemigos[i];
		if(enemigo.estado == 'vivo') ctx.fillStyle = 'red';
		if(enemigo.estado == 'muerto') ctx.fillStyle = 'balck';
		
		ctx.drawImage(ImgEnemigos,enemigo.x,enemigo.y);
		//ctx.fillRect(enemigo.x,enemigo.y,enemigo.width,enemigo.height);
	}
}
function DibujarFondo()
{
	ctx.drawImage(fondo,0,0);
}

function DibujarNave()
{
	//ctx.save();
	//ctx.fillStyle='white';
	//ctx.fillRect(nave.x,nave.y,nave.width,nave.height);
	//ctx.drawImage(imgNave,nave.x,nave.y);
	ctx.drawImage(ImagenNave,nave.x,nave.y);
	//ctx.restore();
}
function agregarEventosTeclado(){
	function agregarEvento(elemento,nombreEvento,funcion){
		
		//agrega eventos pero segun el navegador que usamos 
		if(elemento.addEventListener){
			//navegadores actualizados
			elemento.addEventListener(nombreEvento,funcion,false);
		}
		else if(elemento.attachEvent){
			//internet explorer
			elemento.attachEvent(nombreEvento,funcion);
		}
	}
	agregarEvento(document,"keydown", function(e){
		//ponemos en true la tecla presionada
		teclado[e.keyCode] = true;
		
	});
	agregarEvento(document,"keyup", function(e){
		//ponemos en true la tecla presionada
		teclado[e.keyCode] = false;
	});
	
	
}
function MoverNave(){
   //movimiento a la izquierda
	
	if (teclado[37]){
		nave.x -=6;
		if (nave.x <0) nave.x=0;
	}
	//movimiento a la derecha
	if (teclado[39]){
		var limite = canvas.width - nave.width;
		nave.x +=6;
		if (nave.x > limite) nave.x = limite;
	}
	// disparos
	if (teclado[32])
	{
		if(!teclado.dispara){
			fire();
			sonido_disparo.play();	
			teclado.dispara = true;
		}
	}
	else teclado.dispara = false;
	if (nave.estado == 'hit')
	{
		nave.contador++;
		if (nave.contador >=20)
		{
			nave.contador=0;
			nave.estado='muerto';
			juego.estado = 'perdido';
			textoRepuesta.titulo='Game Over';
			textoRepuesta.subtitulo = 'Presione la tecla r para continuar';
			textoRepuesta.contador=0;
		}
	}

}
function hit(a,b)
{
	
	var hit = false;
	
	if (b.x + b.width >= a.x && b.x < a.x + a.width)
	{
		if(b.y + b.height >= a.y && b.y < a.y + a.height) hit = true;
	}

	if(b.x <= a.x && b.x + b.width >= a.x + a.width)
	{
		if(b.y <= a.y && b.y + b.height >= a.y + a.height) hit = true;
	}
	
	if(a.x <= b.x && a.x + a.width >= b.x + b.width)
	{
		if(a.y <= b.y && a.y + a.height >= b.y + b.height) hit = true;
	}

	return hit;
}

function VerificarContacto()
{
	for (var i in disparos) 
	{
		var disparo = disparos[i];
		for( var j in enemigos)
		{
			var enemigo = enemigos[j];
			if (hit(disparo,enemigo))
			{
				enemigo.estado = 'hit';
				enemigo.contador = 0;
				
			}
		}
	}
	if (nave.estado == 'hit' || nave.estado=='muerto') return;
	for(var i in disparosEnemigos)
	{
		var disparo = disparosEnemigos[i];
		if(hit(disparo,nave))
		{
			nave.estado = 'hit';
			
		}
	}
}
function dibujarDisparosEnemigos()
{
	for(var i in disparosEnemigos)
	{
		var disparo = disparosEnemigos[i];
		//ctx.save();
		//ctx.fillStyle = 'yellow';
		//ctx.fillRect(disparo.x,disparo.y,disparo.width,disparo.height);
		ctx.drawImage(ImgFireEnemigo,disparo.x,disparo.y);
		//ctx.restore();
		
	}
}
function MoverDisparosEnemigos(){
	for (var i in disparosEnemigos) {
		var disparo = disparosEnemigos[i];
		disparo.y +=3;
	};
	disparosEnemigos = disparosEnemigos.filter(function (disparo){
		return disparo.y < canvas.height;
	});
}


function ActualizaEnemigos(){
	
	function agregarDisparosEnemigos(enemigo)
	{
		return {
			x: enemigo.x,
			y: enemigo.y+25,
			width: 10,
			height: 35,
			contador: 0
		}
	}
	
	if (juego.estado=='iniciando')
	{
		for(var i=0;i<10;i++)
		{
			enemigos.push({
					x: 10 + (i*50),
					y: 10,
					height: 40,
					width: 40,
					estado:'vivo',
					contador:0
			});
		}
		juego.estado ='jugando';
	}
    
    for (var i in enemigos)
    {
    	var enemigo = enemigos[i];
    	if(!enemigo) continue;
    	if (enemigo && enemigo.estado == 'vivo')
    	{
    		enemigo.contador++;
    		enemigo.x += Math.sin(enemigo.contador *  Math.PI / 90)*5;
    		if (aleatorio(0,enemigos.length * 10)==4) disparosEnemigos.push(agregarDisparosEnemigos(enemigo));
			    		
    	}
    	if(enemigo && enemigo.estado == 'hit')
    	{	
    		enemigo.contador++;
    		if(enemigo.contador >=2)
    		{
    			enemigo.estado = 'muerto';
    			enemigo.contador = 0;
    		}
    	}
    }
    
    enemigos = enemigos.filter(function(enemigo){
    	if (enemigo && enemigo.estado != 'muerto') return true;
    	return false;
    });
    
}
////////////////////////
// codigo de disparos///
function MoverDisparos(){
	for (var i in disparos) {
		var disparo = disparos[i];
		disparo.y -=8;
	};
	disparos = disparos.filter(function (){
		return disparo.y > 0;
	});
}

function fire(){
	disparos.push({
		x:nave.x + 20,
		y:nave.y - 10,
		width:10,
		height:30
	});
}

function dibujarDisparos(){
	ctx.save();
	ctx.fillStyle = 'white';
	for (var i in disparos) {
		var disparo = disparos[i];
		ctx.drawImage(DisparaNave,disparo.x,disparo.y);
		//ctx.fillRect(disparo.x,disparo.y,disparo.width,disparo.height);
	};
	ctx.restore();
}

function aleatorio(inferior,superior)
{
	var posibilidades = superior - inferior;
	var a = Math.random() * posibilidades;
	a = Math.floor(a);
	return parseInt(inferior) + a;
}

function frameLoop()
{
	DibujarFondo();
	actualizarEstadoJuego();
	MoverNave();
	MoverDisparos();
	ActualizaEnemigos();
	MoverDisparosEnemigos();
	VerificarContacto();
	dibujarDisparosEnemigos();
	dibujarEnemigos();
	dibujarDisparos();
    DibujarNave();
    dibujarTexto();
}
// ejecucion de funciones
tema.play();
agregarEventosTeclado();
loadMedia();
