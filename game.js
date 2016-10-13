// Sprite Sheet
sprites     = new Image();
sprites.src = 'frogger_sprites.png';
ctx         = 0; 

// Dynamic Objects on Game board.
mlogs    = new Object();
turtle2s = new Object();
llogs    = new Object();
slogs    = new Object();
turtle3s = new Object();
semis    = new Object();
racecars = new Object();
pinkcars = new Object();
tractors = new Object();
yellcars = new Object();
frog     = new Object();  
fly      = new Object();             

lanes   = [];
slots   = [];
turtles = [turtle2s, turtle3s]
cars    = [semis, racecars, pinkcars, tractors, yellcars];
logs    = [mlogs, llogs, slogs];

// Objects Pertaining to Game Functionality.
board       = new Object(); 
time        = new Object();
score       = 9980;
highscore   = 0;
level       = 1;                      
lives       = 5;
gameover    = 0;
safefrogs   = 0;
lanespassed = 0;
rndmslot    = 0;
rndmnum     = 3;
speed       = 1;


function start_game()
{
	canvas = document.getElementById('game');
  
   // Check if canvas is supported on browser
   if (canvas.getContext) {
       ctx = canvas.getContext('2d');
       
       init_win_slots();
       init_lanes();
       init_parameters();
       set_board();  
       
       // Add listener to allow frog movement
       document.addEventListener("keydown", function(){move_frog(event)});
       
       // Set up timing for game functions
       setInterval( function(){move_cars_logs_turtles(speed)}, 60); 
       setInterval(        update_time, 1000);
       setInterval( generate_rndm_nums, 3000);
       setInterval(  check_frog_pinned, 1);
       setInterval(          game_loop, 60);
   }      
   else { alert('Sorry, canvas is not supported on your browser!'); }
}

// Loops through the game states. Looping order depends on user input.
function game_loop()
{
	// If frog made it across safely
	if(frog.lane == 0 && is_safe_cross()) {	
		crossed_safely();
	}
	
	// If frog is dead
	if(is_collision()   || is_in_water() || is_out_of_bounds() || 
	   is_out_of_time() || !is_safe_cross() ) {
			frog_died();
	} 
	
	// If player has zero frogs left (aka game over)
	if(lives == 0) {
		game_over();
	}
}

// Generates a random number b/w 1-10 and picks random slot b/w 1-5.
function generate_rndm_nums()
{
	rndmslot = Math.floor(Math.random()*101) % 5;
	rndmnum  = Math.floor(Math.random()*11);
}

// Returns true if the 60 seconds have passed and the player has not successfully 
// maneuvered a frog into an empty slot.
function is_out_of_time()
{
	if (time.timer == time.max) {
		return 1;
	}
	return 0;
}

// Updates score and resets frog position.
function crossed_safely()
{
	safefrogs++;
	frog.lane = 12;
	frog.x = 0;
	score += 50;
	if (safefrogs == 5) {
		safefrogs = 0;
		level++;
		score += 1000;
		speed++;
		for(i in slots) {
			slots[i].isfull = 0;
		}
	}
	for (j in lanes) {
		lanes[j].ispassed = 0;
	}
	if (is_ate_fly()) {
		frog.is_ate_fly = 0;
		score += 200;
	}
	check_for_10K();
}

// Resets frog and Removes a life.
function frog_died()
{
		time.timer = 0;
		frog.ispinned = 0;
		objspeed = 0;
		frog.lane = 12;
		frog.isactive = 0;
		time.isactive = 0;
		frog.x = 1;
		lives--;
		setTimeout(function() {
			objspeed = level;
			time.x = 235;
			time.w = 120;
			frog.isactive = 1;
			if (lives != 0) {
 				time.isactive = 1;
 			}
		},500);
}

// Restarts Game
function game_over() 
{
	objspeed = 0;
	frog.isactive = 0;
	gameover = 1;
	setTimeout(function() {
		gameover = 0;
		frog.isactive = 1;
		objspeed = 1;
		score = 0;
		level = 1;
		speed = 1;
		lives = 5;
		time.x = 235;
		time.w = 120;
		time.isactive = 1;
	},3000);
}

// Returns true if frog ate a fly
function is_ate_fly()
{
	if (slots.lastfilled == fly.slot) { 
		return 1;
    }
    return 0;
}

// Adds a life if player score = 10,000 and players has less than 4 lives left
function check_for_10K()
{
	if ((score % 10000) == 0 && lives < 4) {
		lives++;
	}
}

// Updates Game Timer and Updates Parameters for Timer Display
function update_time()
{
	time.timer++;
	time.x += 2;
	time.w -= 2;
}

// Initializes Lane heights.
function init_lanes()
{
	var laneheight = 33.4;
	var y = 78;	

	// Set Lane Coordinates for the 12 Lanes. (Lane 0 is at the top of the browser)
	for (var i = 0; i < 13; i++) {
        var temp = new Object();
        temp.y = y;
        y += laneheight;
        lanes.push(temp);	
	}
}

// Initializes all Game Parameters
function init_parameters()
{	
	board.w = 370; 
	board.h = 513;
	frog.ispinned = 0;
	frog.isactive = 1;
	time.isactive = 1;
	time.max      = 60; 
	time.timer    = 0;
	time.x        = 235;
	time.w        = 120;

	//init_obj(   obj, ln, ofst, itr,  x,           y,    w,  h,  sw, sh,  sx,  sy )
	init_obj(      fly,  0,    0,   1,  0,  lanes[0].y,  18, 18,  18, 18, 139, 235 );
	init_obj(    mlogs,  0,   49,   3, 80,  lanes[1].y, 120, 25, 120, 25,   5, 197 );
	init_obj( turtle2s,  2,   58,   4,  0,  lanes[2].y,  33, 25,  33, 25,  13, 405 );
	init_obj(    llogs,  3,   84,   2,  0,  lanes[3].y, 180, 25, 180, 25,   5, 166 );	
	init_obj(    slogs,  4,   84,   3, 50,  lanes[4].y,  88, 25,  88, 25,   5, 228 );
	init_obj( turtle3s,  2,   58,   4,  0,  lanes[5].y,  33, 25,  33, 25,  13, 405 );
	init_obj(    semis,  7,   84,   2, 80,  lanes[7].y,  50, 27,  50, 22, 106, 301 );	
	init_obj( racecars,  8,   84,   3, 50,  lanes[8].y,  30, 27,  30, 27,  46, 263 );	
	init_obj( pinkcars,  9,   84,   3, 30,  lanes[9].y,  31, 27,  31, 24,  10, 266 );
	init_obj( tractors, 10,   84,   3,  0, lanes[10].y,  27, 27,  29, 27,  10, 301 );
	init_obj( yellcars, 11,   84,   3, 80, lanes[11].y,  30, 27,  30, 27,  80, 263 );
	init_obj(     frog, 12,    0,   1,  1, lanes[12].y,  24, 27,  24, 27,  13, 366 );
}

// Initializes the parameters of obj
function init_obj(obj, lane, offset, iterations, x, y, w, h, sw, sh, sx, sy)
{
	switch (iterations) {
		case 1:
			obj.x = x;
			break;
		case 2: 
			obj.x = [x, (x + w + offset)];
			break;
		case 3: 
			obj.x = [x, (x + w + offset), (x + 2 * (w + offset))];
			break;
		case 4:
			if (obj == turtle2s) {
				obj.x = [(x + (0 * w) + (0 * offset)), 
						 (x + (1 * w) + (0 * offset)),

					 	 (x + (2 * w) + (1 * offset)), 
					 	 (x + (3 * w) + (1 * offset)),

						 (x + (4 * w) + (2 * offset)), 
						 (x + (5 * w) + (2 * offset)), 

						 (x + (6 * w) + (3 * offset)), 
						 (x + (7 * w) + (3 * offset)),

						 (x + (8 * w) + (4 * offset)), 
						 (x + (9 * w) + (4 * offset))];
			}
			if (obj == turtle3s) {
				obj.x = [(x + (0 * w) + (0 * offset)), 
						 (x + (1 * w) + (0 * offset)),
						 (x + (2 * w) + (0 * offset)), 

					 	 (x + (3 * w) + (1 * offset)), 
					 	 (x + (4 * w) + (1 * offset)),
					 	 (x + (5 * w) + (1 * offset)),

						 (x + (6 * w) + (2 * offset)), 
						 (x + (7 * w) + (2 * offset)),
						 (x + (8 * w) + (2 * offset)),

						 (x + (9  * w) + (3 * offset)), 
						 (x + (10 * w) + (3 * offset)),
						 (x + (11 * w) + (3 * offset))];
			}
			break;
	}

	obj.lane = lane; // current lane of obj
	obj.y    = y;    // obj y coord
	obj.w    = w;    // obj width
	obj.h    = h;    // obj height
	obj.sw   = sw;   // sprite sheet width
	obj.sh   = sh;   // sprite sheet height
	obj.sx   = sx;   // sprite sheet x coord
	obj.sy   = sy;   // sprite sheet y coord

	obj.xbxs = x;     // start of collision box in x direction
	obj.xbse = x + w; //   end of collision box in x direction
}

// Draws Stationary Objects onto Gameboard
function set_board()
{
    ctx.fillStyle = "rgb(25, 25, 112)"; // color: Water-Blue
    ctx.fillRect (0, 0, 399, 272);      // Draw Water
    ctx.fillStyle = "rgb(0, 0, 0)";     // color: Black
    ctx.fillRect (0, 272, 399, 293);    // Draw Street
    ctx.drawImage(sprites, 14, 13, 319, 32, 35,  10, 319, 32); // Title
    ctx.drawImage(sprites, 0,  55, 399, 56,  0,  55, 399, 56); // Grass
    ctx.drawImage(sprites, 0, 119, 399, 35,  0, 272, 399, 35); // Upper Sidewalk
    ctx.drawImage(sprites, 0, 119, 399, 35,  0, 474, 399, 35); // Lower Sidewalk
    update_game();
    update_text();
}

// Draws Moving Objects onto Gameboard Based on the current values of their coordinates
function update_game()
{
	switch (lives) {
		case 5:
			ctx.drawImage(sprites, 13, 334, 19, 22, 0, 512, 19, 22);
    	case 4:
        	ctx.drawImage(sprites, 13, 334, 19, 22, 20, 512, 19, 22);  // Life
        case 3:
        	ctx.drawImage(sprites, 13, 334, 19, 22, 40, 512, 19, 22);  // Life
 		case 2:
        	ctx.drawImage(sprites, 13, 334, 19, 22, 60, 512, 19, 22);  // Life
        
    }
    
    for (i in cars) {
    	for (j in cars[i].x) { 
      		ctx.drawImage(sprites, cars[i].sx, cars[i].sy, cars[i].w, cars[i].h, 
      					  cars[i].x[j], cars[i].y, cars[i].w, cars[i].h);  
      	}
    }

    // Draw Logs	  
    for (i in logs) {
    	for (j in logs[i].x) { 
        	ctx.drawImage(sprites, logs[i].sx, logs[i].sy, logs[i].w, logs[i].h, 
        				  logs[i].x[j], logs[i].y, logs[i].w, logs[i].h); 
       	} 
    }
    
    // Draw Turtles	  
    for (i in turtles) {
    	for (j in turtles[i].x) { 
        	ctx.drawImage(sprites, turtles[i].sx, turtles[i].sy, turtles[i].w, 
        			  	  turtles[i].h, turtles[i].x[j], turtles[i].y, turtles[i].w, 
        			  	  turtles[i].h); 
       	} 
    }

    // Draw Frog
	if(!frog.isdead){
		ctx.drawImage(sprites, frog.sx, frog.sy, frog.w, frog.h, frog.x, 
					  lanes[frog.lane].y, frog.w, frog.h); 
	}
	
	// Draw Slot Frogs
	for (i in slots) {
		if(slots[i].isfull) {
			ctx.drawImage(sprites, 79, 368, 24, 20, slots[i].start + 3, 
				  lanes[0].y, 24, 20); 
		}
	}
	
	// Draw Fly
	if(rndmnum % 4 == 0 && slots[rndmslot].isfull == 0) {
		fly.slot = rndmslot;
		ctx.drawImage(sprites, fly.sx, fly.sy, fly.w, fly.h, (slots[rndmslot].start + 8), 
					  lanes[fly.lane].y, fly.w, fly.h); 
	}
	
}

// Renders Level, Score, Time, Timer display & Game Over onto board.
function update_text()
{
    ctx.fillStyle = "rgb(0, 255, 0)";
    ctx.font = 'bold 30px sans-serif';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Level '+ level, 100, 540);           // Update Level
       
    ctx.font = 'bold 17px sans-serif';
    ctx.textBaseline = 'bottom';
    ctx.fillText('Score: '+ score, 0, 560);              // Update Score
    //ctx.fillText('Highscore: '+ highscore, 120, 560);  // Update Highscore
    
    if (time.isactive) {
 		ctx.fillRect(time.x, 545, time.w, 15);
    }
    ctx.fillStyle = "yellow";
    ctx.font = 'bold 17px sans-serif';
    ctx.fillText('Time', 358, 562);  // Time
    
    if (gameover) {
        ctx.fillStyle = "white";
        ctx.fillRect(115, 274, 150, 30);
        ctx.fillStyle = "red";
        ctx.font = 'bold 25px sans-serif';
        ctx.fillText('Game Over', 125, 304);  // Update GameOver
    }
}

// Moves frog up/down/left/right
function move_frog(event)
{
  var x;
	if(frog.isactive){
    	if (event.keyCode == 37 || event.keyCode == 38 || event.keyCode == 39 ||
        	event.keyCode == 40 ) {
        		frog.ispinned = 0;
            	switch (event.keyCode) {
            		case 37: // Move frog left
            			if (frog.x > 2) {
                      x = frog.x - frog.w;
                      if (x > 0) 
            				      frog.x = x;
                      else
                          frog.x = 1;
            			}
            			break;
            		case 38: // Move frog up
        				if (frog.lane > 0) { 
            				frog.lane--;
            				if(!lanes[frog.lane].ispassed) {
            					lanes[frog.lane].ispassed = 1;
            					score += 10;
            					check_for_10K();
            				}
            			}
            			break;
            		case 39: // Move frog right
            			if (frog.x < 362) {
                      x = frog.x + frog.w;
                      if (x < 362) 
            				      frog.x = x;
                      else
                          frog.x = 377;
            			}
            			break;
            		case 40: // Move frog down
            			if (frog.lane < 12) { 
            				frog.lane++;
            			}
            			break;
            	}
    			set_board();
    			update_game();
    			is_pinned();
    	}
    }
}

// If is pinned to an object move frog with object.
function check_frog_pinned()
{
	if(frog.ispinned) {
		frog.x = frog.pinnedobj[frog.pinnediter] + frog.pinnedoffset;
		set_board();
    	update_game();
    }
}


// Moves cars, logs, turtles across game board at different speed which depend
// on the function parameter objspeed
function move_cars_logs_turtles(objspeed)
{
	var buffer = 60;
	
	// Move Cars in Odd Lanes to the Left
	for (i = 1; i < 5; i = i + 2) {
		for(j in cars[i].x) {
			for (k = 0; k < objspeed; k++){
				cars[i].x[j] += 1;
				if (cars[i].x[j] == board.w + buffer) {
					cars[i].x[j] = -30;
				}
			}
		}
	}

	// Move Cars in Even Lanes to the right
	for (i = 0; i < 5; i = i + 2) {
		for(j in cars[i].x) {
			for (k = 0; k < (objspeed * 2); k++){
				cars[i].x[j] -= 1;
				if (cars[i].x[j] == -buffer) {
					cars[i].x[j] = 380;
				}
			}
		}
	}


	// Move Logs to the Right
	for (i = 0; i < 3; i++) {
		for(j in logs[i].x) {
			switch (i) {
				case 0: // Medium Logs
					for (k = 0; k < objspeed * 1; k++) {
						logs[i].x[j] += 1;
						if (logs[i].x[j] == board.w + buffer) {
							logs[i].x[j] = -logs[i].w;		
						}
					}
					break;
				case 1: // Large Logs
					for (k = 0; k < (objspeed * 3); k++) {
						logs[i].x[j] += 1;
						if (logs[i].x[j] == board.w + buffer) {
							logs[i].x[j] = -logs[i].w;
						}
					}
					break;
				case 2: // Small Logs
					for (k = 0; k < (objspeed * 2); k++) {
						logs[i].x[j] += 1;
						if (logs[i].x[j] == board.w + buffer) {
							logs[i].x[j] = -logs[i].w;
						}
					}
					break;
			}		
		}
	}

	// Move Turtles to the Left
	var tribuffer = 550;
	for (i = 0; i < 2; i++) {
		for(j in turtles[i].x) {
			switch (i) {
				case 0: // Groups of 2 Turtles
					for (k = 0; k < objspeed * 1; k++) {
						turtles[i].x[j] -= 1;
						if (turtles[i].x[j] == -buffer) {
							turtles[i].x[j] = (turtles[i].w * 2) + tribuffer;		
						}
					}
					break;
				case 1: // Groups of 3 Turtles
					for (k = 0; k < objspeed * 3; k++) {
						turtles[i].x[j] -= 1;
						if (turtles[i].x[j] == -buffer) {
							turtles[i].x[j] = (turtles[i].w * 3) + tribuffer;		
						}
					}
					break;
			}
		}
	}

	set_board();
	update_game();
}

// Returns true if the frog occupies the same space as an object in lanes 7-11 (aka a car)
function is_collision()
{
	if (frog.lane > 6 && frog.lane < 12) {
		var lane = frog.lane - 7;
		for (car in cars[lane].x) {
			if (frog.x + frog.w >= cars[lane].x[car] &&
				frog.x          <= cars[lane].x[car] + cars[lane].w) {
					return 1;
			}
		}
	}
	return 0;
}

// Returns true if the frog is positioned in an empty slot.
function is_safe_cross()
{
	if (frog.lane == 0) {
		if(frog.x > slots[0].start && (frog.x + frog.w) < slots[0].end && 
		   !slots[0].isfull) {
				slots[0].isfull  = 1;
				slots.lastfilled = 0;
				return 1;
		}
		else if(frog.x > slots[1].start && (frog.x + frog.w) < slots[1].end && 
		   !slots[1].isfull) {
				slots[1].isfull  = 1;
				slots.lastfilled = 1;
				return 1;
		}
		else if(frog.x > slots[2].start && (frog.x + frog.w) < slots[2].end && 
		   !slots[2].isfull) {
				slots[2].isfull  = 1;
				slots.lastfilled = 2;
				return 1;
		}
		else if(frog.x > slots[3].start && (frog.x + frog.w) < slots[3].end && 
		   !slots[3].isfull) {
				slots[3].isfull  = 1;
				slots.lastfilled = 3;
				return 1;
		}
		else if(frog.x > slots[4].start && (frog.x + frog.w) < slots[4].end && 
		   !slots[4].isfull) {
				slots[4].isfull  = 1;
				slots.lastfilled = 4;
				return 1;
		}
		else { return 0; }
	}
	return 1;
}

// Constructor for slots
function Winslot(x) 
{
	this.isfull = 0;
	this.start = x;
	this.end   = x + 35;	
}

// Initializes all slots
function init_win_slots()
{
	slots.push(new Winslot(10));
	slots.push(new Winslot(97));
	slots.push(new Winslot(181));
	slots.push(new Winslot(265));
	slots.push(new Winslot(352));
}

// Returns true if frog occupies the same space as an object in lanes 1-5
function is_pinned()
{
	pinned_to = new Object();
	if (frog.lane == 1 || frog.lane == 3 || frog.lane == 4) {
		var lane = 0;
		switch (frog.lane) {
			case 1:
				lane = 0;
				break;
			case 3: 
				lane = 1;
				break;
			case 4:
				lane = 2;
				break;
		}
		for (log in logs[lane].x) {
			if (frog.x + frog.w >= logs[lane].x[log] &&
				frog.x <= logs[lane].x[log] + logs[lane].w) 
			{
				frog.ispinned     = 1;
				frog.pinnedobj    = logs[lane].x;
				frog.pinnediter   = log;
				frog.pinnedoffset = frog.x - logs[lane].x[log];
				check_frog_pinned();
				return 1;
			}
		}
	}
	if (frog.lane == 2 || frog.lane == 5) {
		var lane = 0;
		var width = 0;
		var itersum = 0;
		var buffer = 0;
		switch (frog.lane) {
			case 2: 
				lane  = 0;
				width = (2 * turtles[lane].w);
				itermult = 2;
				break;
			case 5:
				lane  = 1;
				width = (3 * turtles[lane].w);
				itermult = 3;
				break;
		}
		for (var i = 0; i < turtles[lane].x.length; i++) {
			if (frog.x + frog.w >= turtles[lane].x[i] &&
			    frog.x <= turtles[lane].x[i] + turtles[lane].w) 
			{
				frog.ispinned     = 1;
				frog.pinnedobj    = turtles[lane].x;
				frog.pinnediter   = i;
				frog.pinnedoffset = frog.x - turtles[lane].x[i];
				check_frog_pinned();

				return 1;
			}
		}
	}
	return 0;
}

// Returns true if the frog is positioned in the water.
function is_in_water()
{
	if (frog.lane > 0 && frog.lane < 6) {
		if (!frog.ispinned) {
			return 1;
		}
	}
	return 0;
}

// Returns true if the frog is positioned outside the parameters of the Game Board.
function is_out_of_bounds()
{
	if (frog.x < 0 || frog.x > 380) {
		return 1;
	}
	return 0;
}
