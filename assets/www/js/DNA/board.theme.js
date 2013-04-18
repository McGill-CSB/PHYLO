/* this scripts generates the board features */
(function() {
	var doc = document, win = window;
	var userCache = win.localStorage;
	$.board = {
		//generates the grid
		build : function() {
			var str = "";
			for(var i=0;i<$.phylo.rows;i++) {
				str+="<div class='bgRow'>";
				for(var j=0;j<$.phylo.seqLen;j++) {
					str+="<div class='bgCell' style='left:"+$.sequence.calcPos(j)+"px'></div>";
				}
				str+="</div>";
			}
			$("#gameBoard").html("<div id='bg'>"+str+"</div>");

		},
		//updates and displays the score
		score : function(x) {
			$.phylo.currentScore = x;
			$("#userScore").html("Score: "+ x);
			$.html5.score.setScore(x);
		},
		//updates and displays the best score
		bestScore : function(x) {
			$("#bestScore").html("Best: "+ x);
			if($.stage.current == $.stage.last) {
				if(x > $.sequence.par)
					$.protocal.sendHighScore();
			}
		},
		//displays the par
		par : function(x) {
			$("#parScore").html("Par: "+ x);
		},
		//displays the current stats
		stats : function() {
			var ln = window.lang.body.play.gameselect["game board"];
			if($.stage.stats == undefined)
				$("#statsPanel").html("Stats - "+ln["field 3"]+": "+($.stage.current+1)+"/"+($.stage.last+1));
			else
				$("#statsPanel").html("<i class='icon-puzzle'></i> ID:&nbsp;&nbsp;"+$.phylo.id+"<br>Stats - "+ln["field 3"]+": "+($.stage.current+1)+"/"+($.stage.last+1) + "<span class='gap'></span>"+ln["field 9"]+": "+$.stage.stats.match+"<span class='gap'></span>"+ln["field 10"]+": "+$.stage.stats.mismatch+"<span class='gap'></span>"+ln["field 11"]+": "+$.stage.stats.open+"<span class='gap'></span>"+ln["field 12"]+": "+$.stage.stats.extend +"<span class='gap'><span>"+ln["field 2"]+": "+$.sequence.par);
        },
		//listens to events
		startListener: function() {
			var self = this;
			//disables background music
			if(window.DEV.disableMusic == false) {
				$("#musicPlayerSpot").html("<audio autoplay='autoplay' loop='loop' id='game-audio' preload='auto' autobuffer style='display:none'><source src='music/Valent%20-%20The%20Buckle.mp3' />Your browser does not support audio element</audio>");
			}

			//disable this
			$("#scorePanel").hide();
			//volume control
			$("#volumeOff").hide();
			//cookie for music
			if(userCache.getItem("music-level")) {
				try {
					document.getElementById("game-audio").volume = userCache.getItem("music-level");
					if(userCache.getItem("music-level") == 0) {
						$("#volumeOn").hide();
						$("#volumeOff").show();
					} else {
						$("#volumeOn").show();
						$("#volumeOff").hide();
					}
				} catch (err) {
				}
			}
			$("#volumeOn").unbind().click(function() {
				userCache.setItem("music-level",0,365);
				document.getElementById("game-audio").volume=0;
				$("#volumeOn").hide();
				$("#volumeOff").show();
			});
			$("#volumeOff").unbind().click(function() {
                userCache.setItem("music-level",1,365);
				document.getElementById("game-audio").volume=1;
				$("#volumeOff").hide();
				$("#volumeOn").show()
			});
			//roll back to best score
			$("#cycle").unbind().click(function(){
				$.helper.copy($.sequence.track, $.phylo.bestTrack);
				//$.sequence.track = $.phylo.bestTrack.slice(0);

				var score = $.fitch.score();
				$.board.score(score);
				$.physics.snapRandom();
				if($.phylo.bestScore >= $.sequence.par)
					$.board.approve();
				self.stats();

			});
			//next stage
			$("#star").unbind().click(function(){
				if($.phylo.currentScore >= $.sequence.par)
					$.stage.round();
			});
			//new scoring
			//$.html5.score.init();
		},
		//tinkers the css on the star
		approve : function() {
			var self = this;
			$("#star").addClass("pass");
			$("#star").animate({
				opacity: 1
			},300, function() {
				if($.phylo.currentScore < $.sequence.par) {
					self.unapprove();
					return;
				}
				$("#star").animate({
					opacity: 0.2
				},300,function() {
					if($.phylo.currentScore < $.sequence.par) {
						self.unapprove();
						return;
					}
					$("#star").animate({
						opacity: 1
					},500,function() {
						if($.phylo.currentScore < $.sequence.par) {
							self.unapprove();
							return;
						}
						$("#star").animate({
							opacity: 0.2
						},300,function() {
							if($.phylo.currentScore < $.sequence.par) {
								self.unapprove();
								return;
							}
							$("#star").animate({
								opacity: 1
							},500,function(){
								if($.phylo.currentScore < $.sequence.par) {
									self.unapprove();
									return;
								}
							});
						});
					});
				});
			});
		},
		//tinkers the css on the star
		unapprove : function() {
			$("#star").removeClass("pass");
			$("#star").css({
				opacity : 0.4
			});
		},
		//builds json alignments of the current score
		getJsonAlignments : function() {
			var self = this;
			var track = $.sequence.track;
			var str = "[";
			for(var i=0;i<track.length;i++) {
				str+='{"';
				for(var j=0;j<track[i].length;j++) {
					if(track[i][j] == "x")
						str+="-";
					else if(i!=0 && track[i][j] == 0)
						str+="";
					else
						str+=self.convertColor($("#"+track[i][j]));
				}
				str+='"}';
				if(i<track.length-2)
					str+=',';
			}
			return '{"alignments" : '+str+']}';
		},
		//translates the grid color to its respected nucletide
		convertColor : function(nuc) {
                    //console.log("LOG_D_board.theme: nuc");
        			if(nuc.hasClass("nuc-G"))
        				return "G";
        			if(nuc.hasClass("nuc-C"))
        				return "C";
        			if(nuc.hasClass("nuc-A"))
        				return "A";
        			if(nuc.hasClass("nuc-T"))
        				return "T";
			return null;
		},
	};
})();
