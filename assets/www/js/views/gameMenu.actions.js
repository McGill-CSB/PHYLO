/* old script will phase out */

(function() {
	//config 
	(function() {
		function g() {}
		g.prototype.desktopSettings = {
			width: function() {
				return 1024;
			},
			height: function() {
				return 450;
			},
			numberOfSequence: 10,
			sequenceLength : 25,
			box : function() {
				var x = this.boxWidth()/this.sequenceLength;
				var y = this.boxHeight()/this.numberOfSequence;
				if(x < y)
					return x;
				else
					return y;
			},
			boxLeft : function() {
				return this.width()/5;
			},
			boxWidth: function() {
				return this.width()/5*4;
			},	
			boxHeight: function() {
				return 400;
			},
			color : [ "rgb(113, 178, 226)", "rgb(153, 50, 204)","rgb(0, 128, 0)", "rgb(255, 165, 0)"],
		};

		g.prototype.determineSettings = function() {
			return this.desktopSettings;
		};

		var proto = g.prototype,
			attr = [
				["sequence",proto.sequence],
				["desktopSettings",proto.desktopSettings]
				];
		common.exportSingleton("config",g,attr);		
	})();
	//initalize for both desktop and tablet
	(function() {
		function a() {}
		a.prototype.background = function(settings) {
			var data = "<div id='background'>";
			for(var i=0; i<settings.numberOfSequence;i++) {
				for(var j=0;j<settings.sequenceLength;j++) {
					data+= "<div class='bgBox' style='top:"+(i*settings.box())+"px;left:"+(j*settings.box()+settings.boxLeft())+"px;'></div>";
				}
			}	
			$("#sandbox").append(data+"</div>");
			$(".bgBox").css({
				width: settings.box(),
				height: settings.box(),
			});
		};

		a.prototype.buildCube = function() {

		};
		
		var proto = a.prototype,
			attr = [
				["background", proto.background]
				];
		common.exportSingleton("generate",a,attr);

		String.prototype.trim = function() {
			return $.trim(this);
		};

		function init() {
			//initalizie sandbox
			var settings = config.determineSettings();
			$("#sandbox").css({
				"width" : settings.width(),
				"height" : settings.height()
			});	
			generate.background(settings);
		}

	})();
	
	(function() {
		function g() {};
		g.prototype.start = function() {
			$("#sandbox").html("");
			var doc = document, win = window;
			var settings = config.determineSettings();
			this.loadBackground(doc,win,settings);
			$("#sandbox").css({
				width : settings.width(),
				height : settings.height()
			});
			//this.loadStroke(doc,win,settings);
			this.loadMenu(doc,win,settings);
			this.listenToReload();
			/* temp fix */
		};
		g.prototype.restart = function() {
			var doc = document, win = window;
			var settings = config.determineSettings();
			this.loadMenu(doc,win,settings);
		};
		g.prototype.loadBackground = function(doc,win,settings) {
			
			var canvas = doc.createElement('canvas');
			var sandbox = doc.getElementById("sandbox");
			canvas.id = 'draw';
			canvas.style.position = "absolute";
			canvas.style.zIndex = 2;
			canvas.style.top = 0;
			canvas.style.left = 0;
			canvas.width = settings.width();
			canvas.height = settings.height();
		
			sandbox.appendChild(canvas);
		};
		//depreciated
		/* but its a cool way to start a game */
		/*
		g.prototype.loadStroke = function(doc,win,settings) {
			var ctx = doc.getElementById('draw').getContext('2d');
			var selection = [];

			var f = this;
			var stroke = function(ctx) {
				ctx.beginPath();
				ctx.fillStyle = "#E80000";
				ctx.fillRect(0,313,1024,25);
				ctx.fillStyle = "rgb(113, 178, 226)";
				var x = 170;
				var y = 300;
				ctx.fillRect(170,300,200,50);
				ctx.font = "20pt Helvetica";
				ctx.fillStyle = "white";
				ctx.fillText("Slide To Play",190,335);
				ctx.closePath();
				var offset = 0;
				this.onOver = function(eX,eY) {
					
				};
				this.offset = 0;
				this.onMouseDown = function(eX,eY) {
					if( x <= eX && eX <= x+200 &&
						y <= eY && eY <= y+50) {
						if(offset == 0 ) 
							offset = eX-x;
						if(eX-offset > 0 && 824 > eX-offset) {
							ctx.beginPath();
							ctx.fillStyle = "#E80000";
							ctx.clearRect(x,300,200,50);
							ctx.fillRect(x,313,200,25);
							ctx.fillStyle = "rgb(113, 178, 226)";
							ctx.fillRect(eX-offset,300,200,50);
							ctx.font = "20pt Helvetica";
							ctx.fillStyle = "white";
							ctx.fillText("Slide To Play",eX-offset+20,335);
							x = eX-offset;
							if( x > 500) {
								//start menu
								$('#draw').unbind("mouseup");
								$('#draw').unbind("mousedown");
								$('#draw').unbind("mousemove");
								f.loadMenu(doc,win,settings);
							}
						}
						ctx.closePath();
					} else {

					}
				};
				this.onUnbind = function() {
					offset = 0;
				}
			};
			f.loadMenu(doc,win,settings);
			
			selection.push(new stroke(ctx));

			$('#draw').mousedown(function(e) {
				$('#draw').mousemove(function(e) {
					var k = getCursorPosition(e);
					for(var i=0;i<selection.length;i++) {
						selection[i].onMouseDown(k[0],k[1]);		
					}
				});
			});
			$('#draw').mouseup(function(e){
				$('#draw').unbind("mousemove");
				for(var i=0;i<selection.length;i++) {
					selection[i].onUnbind();		
				}
			});
		}; */

		g.prototype.loadMenu = function(doc,win,settings) {
			var f = this;
			$("#splashLogo").remove();
			var ctx = doc.getElementById('draw').getContext('2d');
			ctx.beginPath();
			ctx.globalAlpha = 1;
			ctx.clearRect(0,0,settings.width(),settings.height());
			
			var banner = new Image();
			var bannerValues = {
				x : 212,
				y : 30,
				w : 600,
				h : 200

			}
			banner.onload = function() {
				ctx.drawImage(banner,bannerValues.x,bannerValues.y,bannerValues.w,bannerValues.h);
			};
			banner.src = 'img/logo.png';
			ctx.fillStyle = "#F1F1F1";
			ctx.fillRect(212,250,600,120);

			ctx.closePath();
			var selection = [];

			var menuStr = [window.lang.body.play.gameselect.levelselect.random["field 2"],window.lang.body.play.gameselect.levelselect["level id"]["field 2"],window.lang.body.play.gameselect.levelselect.disease["field 1"]];

			var menuIcon = [
					["img/random.png",95,95],
					["img/id.png",95,95],
					["img/disease.png",95,95],
					];	
			var menuIconHover = ["img/random_hover.png","img/id_hover.png","img/disease_hover.png"]	

			//var menuBar = [
			var cell = function(ctx,x,y,i) {
				var menuStrColor = '#444';
				ctx.beginPath();			
				ctx.fillStyle = settings.color[i];
				var icon = new Image();
				icon.onload = function() {
					ctx.drawImage(icon,x,y,menuIcon[i][1],menuIcon[i][2]);
				}
				icon.src = menuIcon[i][0];
				ctx.fillStyle = menuStrColor;
				ctx.font = "19pt Helvetica";
				//ctx.fillText(menuStr[i],x+100,y+25);
				ctx.closePath();
				var iconOnHover = false;
				this.onOver =  function(eX,eY) {
					ctx.beginPath();
					if(x <= eX && eX <= x+menuIcon[i][1] &&
						y <= eY && eY <= y+menuIcon[i][2]) { 
						if( iconOnHover == false && window.isTablet == false) {
							ctx.clearRect(x,y,menuIcon[i][1],menuIcon[i][2])
							ctx.fillStyle = "#F1F1F1";
							ctx.fillRect(x,y,menuIcon[i][1],menuIcon[i][2]);
							var icon = new Image();
							icon.onload = function() {
								ctx.drawImage(icon,x,y,menuIcon[i][1],menuIcon[i][2]);
							}
							icon.src = menuIconHover[i];	
							ctx.fillStyle = "#6D6D6D";
							ctx.font = "19pt Helvetica";
							ctx.textAlign = "center";
							ctx.fillText(menuStr[i],515,420);
							iconOnHover = true;
						}
					} else {
						if(iconOnHover) {
							//ctx.clearRect(x,y,menuIcon[i][1],menuIcon[i][2])
							ctx.fillStyle = "#F1F1F1";
							ctx.fillRect(x,y,menuIcon[i][1],menuIcon[i][2]);
							var icon = new Image();
							icon.onload = function() {
								ctx.drawImage(icon,x,y,menuIcon[i][1],menuIcon[i][2]);
							}
							icon.src = menuIcon[i][0];	
							iconOnHover = false;
							ctx.clearRect(0,390,1024,50);
						}
					}
					ctx.closePath();
				};
				this.onClick = function(eX,eY) {
					var menuStrColor = '#444';
					if(x <= eX && eX <= x+menuIcon[i][1] &&
						y <= eY && eY <= y+menuIcon[i][2]) { 
						switch(i) {
							case 1:
								ctx.beginPath();
                                ctx.clearRect(0, 0,1024,450);
								ctx.closePath();
								selection = [];
								ctx.beginPath();
								ctx.fillStyle = menuStrColor;
								ctx.font = "20pt Helvetica";
								ctx.fillText(lang.body.play.gameselect.levelselect["level id"]["field 3"], 490, 100);
								ctx.closePath();
								selection.push(new levelselect(ctx));
								window.setTimeout(function() {
									selection.push(new back(ctx));
								},50);
								return;
							case 2:
								var diseaseorder =  [
									["digestive","img/disease/digestive.png","150px",""],
									["heart", "img/disease/heart.png","110px","30px"],
									["cancer", "img/disease/cancer.png","100px","55px"],
									["metabolic", "img/disease/metabolic.png","100px",""],
									["blood","img/disease/blood.png","50px","10px"],
									["sensory","img/disease/sensory.png","60px","30px"],
									["brain","img/disease/brain.png","80px",""],
									["muscles","img/disease/muscles.png","60px",""],
									["lung","img/disease/lung.png","60px",""]
									];
								ctx.beginPath();
								ctx.textAlign = "center";
								ctx.clearRect(0, 0,1024,450);
								ctx.fillStyle = menuStrColor;
								ctx.font = "20pt Helvetica";	
								ctx.fillText(lang.body.play.gameselect.levelselect.disease["field 1"],settings.width()/2, 100);
								ctx.textAlign = "left";
								ctx.closePath();
								selection = [];
								window.setTimeout(function() {
								for(var j=0; j<diseaseorder.length; j++) {
									if(diseaseList[diseaseorder[j][0]].length == 0)
										selection.push(new emptyDisease(ctx, diseaseorder[j],j))
									else
										selection.push(new disease(ctx,diseaseorder[j],j));	
								}
								},50);
								selection.push(new back(ctx));
								return;
							case 0:
								ctx.beginPath();
								ctx.textAlign = "center";
								ctx.clearRect(0,0,1024,450);
								ctx.fillStyle = menuStrColor;
								ctx.font = "20pt Helvetica";	
								ctx.fillText(lang.body.play.gameselect.levelselect.random["field 1"], settings.width()/2+60,120);
								ctx.fillText(lang.body.play.gameselect.levelselect.random["field 3"], settings.width()/2+60,240);
								ctx.textAlign = "left";
								ctx.closePath();
								selection = [];
								var k = 0;
								for(var j=3;j<=10;j+=2) {
									selection.push(new random(ctx,j,k));
									k+=1;
								}
								window.setTimeout(function() {
									selection.push(new back(ctx));
								},50);
								return;
						}
					}
				};
			} 


			var levelselect = function(ctx) {	
				var menuStrColor = '#444';
				$("#level_inputbox").show();

                ctx.beginPath();
				ctx.save();
				ctx.fillStyle = "rgb(153,50,204)";
				ctx.fillRect(405,220,170,50);
				ctx.fillStyle = menuStrColor;
				ctx.font = '19pt Helvetica';
				ctx.textAlign = "center";
				ctx.fillText(lang.body.play.gameselect.levelselect["level id"]["field 4"],490,252);
				ctx.textAlign = "left";
				ctx.restore();
				ctx.closePath();
				this.onClick = function(eX, eY) {
					if(405 < eX && eX < 525 &&
						220 < eY && eY < 270 ){
						var id = parseInt($("#level_inputbox").val().trim());
						if(isNaN(id)) {
                            //TODO add in translation
                            bootbox.alert("Numbers Only");
							return;
						}
                        $.storage.checkLevel(id,function(){
                            //success
                            $("#draw").hide();
                            $("#menu").hide();
                            $("#level_inputbox").hide();
                            $("#level_inputbox").val("");
                                $.main.init({
                                type: "level",
                                num: id,
                            });
                            return;
                        },function(){
                            //invalid  TODO, add in translation
                                bootbox.alert("Invalid Level");
                            return;
                        },
                        function(){
                           //failure TODO add in translation
                            bootbox.alert("Cannot retrieve level due to Internet disconnection");
                        });
					}	
				};
				this.onOver = function(eX,eY) {
					ctx.beginPath();
					ctx.save();
					if(405 < eX && eX < 525 &&
						220 < eY && eY < 270 ){

					ctx.fillStyle = "#6D6D6D";
					ctx.fillRect(405,220,170,50);
					ctx.fillStyle = "white";
					ctx.font = '19pt Helvetica';
					ctx.textAlign = "center";
					ctx.fillText(lang.body.play.gameselect.levelselect["level id"]["field 4"],490,252);
					ctx.textAlign = "left";
					} else {
					ctx.fillStyle = "rgb(153,50,204)";
					ctx.fillRect(405,220,170,50);
					ctx.fillStyle = "white";
					ctx.font = '19pt Helvetica';
					ctx.textAlign = "center";
					ctx.fillText(lang.body.play.gameselect.levelselect["level id"]["field 4"],490,252);
					ctx.textAlign = "left";

					}
					ctx.restore();
					ctx.closePath();
				};		
			};

			var emptyDisease = function(ctx, items, i) {
				var img = new Image();
				var img_hover = new Image();
				img.src = items[1];
				img_hover.src = items[1].replace('.png', '_hover.png');
				var hovered = false;
				img.onload = function() {
					ctx.beginPath();
					ctx.globalAlpha = 0.5;
					ctx.drawImage(img, 335+110*(i>=3?(i>=6?i-6:i-3):i), 150+(i>=3?(i>=6?200:100):0), 70, 70);
					ctx.globalAlpha = 1;
					ctx.closePath();
				};
				this.onClick = function(eX, eY) { };
				this.onOver = function(eX, eY) {};
			};

			var disease = function(ctx, items, i) {
				var img = new Image();
				var img_hover = new Image();
				img.src = items[1];
				img_hover.src = items[1].replace('.png', '_hover.png');
				var hovered = false;
				img.onload = function() {
					ctx.beginPath();
					ctx.globalAlpha = 1;
					ctx.drawImage(img, 335+110*(i>=3?(i>=6?i-6:i-3):i), 150+(i>=3?(i>=6?200:100):0), 70, 70);
					ctx.closePath();
				};
				this.onClick = function(eX, eY) {
					if( 335+110*(i>=3?(i>=6?i-6:i-3):i) < eX && eX < 405+110*(i>=3?(i>=6?i-6:i-3):i) &&
						150+(i>=3?(i>=6?200:100):0) < eY && eY < 220+(i>=3?(i>=6?200:100):0)) {
						var id = diseaseList[items[0]][Math.floor(Math.random()*diseaseList[items[0]].length)];
						$("#draw").hide();		
						$("#menu").hide();
						$.main.init({
							type: "disease",
							num: id,		
						});	
						return;
					}
				};
				    
				this.onOver = function(eX, eY) {
				    if( 335+110*(i>=3?(i>=6?i-6:i-3):i) < eX && eX < 405+110*(i>=3?(i>=6?i-6:i-3):i) &&
					150+(i>=3?(i>=6?200:100):0) < eY && eY < 220+(i>=3?(i>=6?200:100):0)) {
					ctx.beginPath();
					ctx.clearRect(335+110*(i>=3?(i>=6?i-6:i-3):i), 150+(i>=3?(i>=6?200:100):0), 70, 70);
					ctx.drawImage(img_hover, 335+110*(i>=3?(i>=6?i-6:i-3):i), 150+(i>=3?(i>=6?200:100):0), 70, 70);
					ctx.closePath();
					hovered = true;
				    } else {
					if(hovered) {
						ctx.beginPath();
						ctx.clearRect(335+110*(i>=3?(i>=6?i-6:i-3):i), 150+(i>=3?(i>=6?200:100):0), 70, 70);
						ctx.drawImage(img, 335+110*(i>=3?(i>=6?i-6:i-3):i), 150+(i>=3?(i>=6?200:100):0), 70, 70);
						ctx.closePath();
						hovered = false;
					}
				    }
				};
			};

			var onHover = false;
			var random = function(ctx, i, k) {
				var color= [ "rgb(113, 178, 226)", "rgb(153, 50, 204)","rgb(0, 128, 0)", "rgb(255, 165, 0)"];
				ctx.beginPath();
				ctx.save();
				ctx.fillStyle = color[(k>3?k-4:k)];
				ctx.fillRect(100+70*i, 150, 100,50);
				ctx.fillStyle = 'white';
				ctx.font = '19pt Helvetica';
				ctx.textAlign = "center";
				ctx.fillText(i+" - "+(i+1),150+70*i,185);
				ctx.restore();
				ctx.closePath();
				this.onOver = function(eX,eY) {
					if(100+70*i < eX && eX < 200+70*i &&
						150 < eY && eY< 200) {
						ctx.beginPath();
						ctx.save();
						ctx.fillStyle = "#6D6D6D";
						ctx.fillRect(100+70*i, 150, 100, 50);
						ctx.fillStyle = 'white';
						ctx.font = '19pt Helvetica';
						ctx.textAlign = "center";
						ctx.fillText(i+" - "+(i+1),150+70*i,185);
						ctx.restore();
						ctx.closePath();

					} else {
						ctx.beginPath();
						ctx.save();
						ctx.fillStyle = color[(k>3?k-4:k)];
						ctx.fillRect(100+70*i, 150, 100,50);
						ctx.fillStyle = 'white';
						ctx.font = '19pt Helvetica';
						ctx.textAlign = "center";
						ctx.fillText(i+" - "+(i+1),150+70*i,185);
						ctx.restore();
						ctx.closePath();
					}
				};
				this.onClick = function(eX, eY) {
					if(100+70*i <eX && eX < 200+70*i  &&
						150 < eY && eY< 200) {
						var ranNumber = Math.floor(Math.random()*2)+1 - 1;	
						$("#draw").hide();		
						$("#menu").hide();
						$.main.init({
							type: "random",
							num: (i+ranNumber),		
						});	
						return;
					}
				};
				 
			};

			var back = function(ctx) {
				ctx.beginPath();
				ctx.save();
				ctx.fillStyle = "#EF4136";
				ctx.fillRect(150,120,50,110);
				ctx.fillStyle = 'white';
				ctx.rotate(1.56);
				ctx.font = '19pt Helvetica';
				ctx.textAlign = "center";
				ctx.fillText(lang.header["field 9"],175,-165);
				ctx.textAlign = "left";
				ctx.restore();
				ctx.closePath();
				this.onOver = function(eX,eY) {
					if(150 < eX && eX < 200 &&
						120 < eY && eY < 230) {
						ctx.beginPath();
						ctx.save();
						ctx.fillStyle = "#6D6D6D";
						ctx.fillRect(150,120,50,110);
						ctx.fillStyle = "white";
						ctx.rotate(1.56);
						ctx.font = '19pt Helvetica';
						ctx.textAlign = "center";
						ctx.fillText(lang.header["field 9"],175,-165);
						ctx.textAlign = "left";
						ctx.restore();
						ctx.closePath();
					} else {
						ctx.beginPath();
						ctx.save();
						ctx.fillStyle = "#EF4136";
						ctx.fillRect(150,120,50,110);
						ctx.fillStyle = 'white';
						ctx.rotate(1.56);
						ctx.font = '19pt Helvetica';
						ctx.textAlign = "center";
						ctx.fillText(lang.header["field 9"],175,-165);
						ctx.textAlign = "left";
						ctx.restore();
						ctx.closePath();
					}
				
				};	
				this.onClick = function(eX,eY) {
					if(150 < eX && eX < 200 &&
						120 < eY && eY < 230) {
						ctx.beginPath();
						ctx.clearRect(0,60,1024,400);
						ctx.closePath();
						selection = [];
						//selection.push(new highscore(ctx));
						for(var i=0;i<3;i++) {
							selection.push(new cell(ctx, 310+(160*i), 260,i));
						}
						var banner = new Image();
						banner.onload = function() {
							ctx.drawImage(banner,bannerValues.x,bannerValues.y,bannerValues.w,bannerValues.h);
						};
						$('#draw').mousemove(function(e) {
							var k = getCursorPosition(e);
							for(var i=0;i<selection.length;i++) {
								selection[i].onOver(k[0],k[1]);		
							}
						});
						banner.src = 'img/logo.png';
						ctx.fillStyle = "#F1F1F1";
						ctx.fillRect(212,250,600,120);
						$("#level_inputbox").val("").hide();
					}
				};
			};

			for(var i=0;i<3;i++) {
				//selection.push(new cell(ctx,150,120+(50*i),i));
				selection.push(new cell(ctx, 310+(160*i), 260,i));
			}

			$('#draw').unbind().mousemove(function(e) {
				var k = getCursorPosition(e);
				for(var i=0;i<selection.length;i++) {
					selection[i].onOver(k[0],k[1]);		
				}
			}).click(function(e) {
				var k = getCursorPosition(e);
				for(var i=0;i<selection.length;i++) {
					selection[i].onClick(k[0],k[1]);		
				}
			});
		};

		g.prototype.listenToReload = function() {
			/*
			window.setInterval(function() {
				if(window.frames["frame"].window.location.hash.search(/reload/) > -1) {
					device.start();	
				}
			},1000); */
		};

		function getCursorPosition(e) {
			var gCanvasElement = document.getElementById("sandbox");
			var menu = document.getElementById("mid-panel");
			var x;
			var y;
			if (e.pageX || e.pageY) {
				x = e.pageX;
				y = e.pageY;
			} else {
				x = e.clientX + document.body.scrollLeft +
				    document.documentElement.scrollLeft;
				y = e.clientY + document.body.scrollTop +
				    document.documentElement.scrollTop;
			}
			// Convert to coordinates relative to the canvas
			x -= gCanvasElement.offsetLeft;
			y -= menu.offsetTop;
			return [x,y]
		}
			
		var proto = g.prototype,
			attr = [
				["start",proto.start],
				["restart",proto.restart]
				];
		common.exportSingleton("interactiveMenu",g,attr);
	})();
})()
