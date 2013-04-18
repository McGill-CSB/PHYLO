(function(){
    var userCache=window.localStorage;
	$.endGame = {
		//displays message of completing the game
		complete : function() {
			var self = this;
			$.multiSelect.deactive();
			$.protocal.sendEndGameScore("completed", function(data) {
				self.events();
				self.score("completed",data.best_score);
				//var msg = "<b>Congratulations!</b> You have solved the puzzle";
				var msg = window.lang.body.play.gameselect["end of game"]["field 3"];
				$("#endGame-text").html(msg);
				$("#endGame-learnMore-content").html(self.learnMore(data));
				$("#endGame").fadeIn();
			});

		},
		//displays message of bailing out
		bail : function() {
			var self = this;
			$.multiSelect.deactive();
			$.protocal.sendEndGameScore("bail", function(data) {
				self.events();
				self.score("bail",data.best_score);
				//var msg = "Too bad! You did not succeed to solve this puzzle!";
				var msg = window.lang.body.play.gameselect["end of game"]["field 4"];
				$("#endGame-text").html(msg);
				//$("#endGame-learnMore-content").html("This disease is related to diseases etc, you are helping...etc");
				$("#endGame-learnMore-content").html(self.learnMore(data));
				$("#endGame").fadeIn();
			});

		},
		learnMore : function(json) {
			var context = "";
			try {
			var endGameContext = lang.body.play.gameselect["end of game"];
			context = endGameContext["field 5"].replace("***","<label class='end-color'>"+$.phylo.id+"</label>") +
						" <label class='end-color'>"+json.disease_link+"</label>.  "+endGameContext["field 6"].replace("***","<label class='end-color'>"+json.play_count+"</label>").replace(".",".<br>").replace("***","<label class='end-color'>"+json.fail_count+"</label>")+
						endGameContext["field 7"].replace("***","<label class='end-color'>"+json.best_score+"</label>")+" "+
						endGameContext["field 8"].replace("***","<label class='end-color'>"+Math.round(json.running_score/json.play_count)+"</label>") +" <br>"+
						endGameContext["field 9"].replace("***","<label class='end-color'>"+json.highscore_user+"</label>");
			} catch (err) {
				context = "This disease is related to disease etc, you are helping...etc";
			} 
			return context;

		},
		//scores the game
		score : function(status, highscore) {
			//remove background music... make it stop!
			$("#musicPlayerSpot").html("");
			//gets current score		
			var setDefault = "<i class='icon-star-empty'></i><i class='icon-star-empty'></i><i class='icon-star-empty'></i>";	
			$("#endGame-score-result").html(setDefault);
            $("#endGame-share").show();
			if(status == "bail")
				return;
			var currentScore = $.phylo.currentScore;
			var par = $.sequence.par;
			if(par < currentScore && currentScore < highscore) {
			 setDefault = "<i class='icon-star-1'></i><i class='icon-star-1'></i><i class='icon-star-empty'></i>";
			} else if( highscore <= currentScore) {
			 setDefault = "<i class='icon-star-1'></i><i class='icon-star-1'></i><i class='icon-star-1'></i>";
			} else { //exactly par score
			 setDefault = "<i class='icon-star-1'></i><i class='icon-star-empty'></i><i class='icon-star-empty'></i>";
			}
			$("#endGame-score-result").html(setDefault);
		},
        // share highscore on social network
        share : function() {
            if(userCache.getItem("username")) {
                var username = userCache.getItem("username");
                var fullname = userCache.getItem("fullname");
                var provider = userCache.getItem("provider");
                var c_logid = userCache.getItem("logid");
 
                if ((provider=="Facebook")||(provider=="Twitter")||(provider=="LinkedIn")) {
  
                    $.protocal.sendEndGameScore("info", function(data) {
                                                
                        var puzzle_disease = data.disease_link;
                        var puzzle_highscore = data.best_score;
                        
                        if (provider=="Facebook") {
                            if (puzzle_disease) {
                                if ($.phylo.currentScore>=puzzle_disease) {
                                    var message = fullname.replace("+"," ") + " " + window.lang.body.social["field 7"].replace("***",puzzle_disease) + "\n" + window.lang.body.social["field 20"];
                                } else {
                                    var message = fullname.replace("+"," ") + " " + window.lang.body.social["field 8"].replace("***",puzzle_disease) + "\n" + window.lang.body.social["field 20"];
                                }
                            } else {
                                if ($.phylo.currentScore>=puzzle_disease) {
                                    var message = fullname.replace("+"," ") + " " + window.lang.body.social["field 9"] + ".\n" + window.lang.body.social["field 20"];
                                } else {
                                    var message = fullname.replace("+"," ") + " " + window.lang.body.social["field 10"] + ".";
                                }
                            }
                            var caption = window.lang.body.social["field 31"];
                            var data = "provider="+provider+"&id="+c_logid+"&caption="+caption+"&description="+message;
                        } else if (provider=="Twitter") {
                            if (puzzle_disease) {
                                if ($.phylo.currentScore>=puzzle_disease) {
                                    var message = fullname.replace("+"," ") + " " + window.lang.body.social["field 11"].replace("***",puzzle_disease) + " " + window.lang.body.social["field 20"] + "#Phylo #DNA #puzzles";
                                } else {
                                    var message = fullname.replace("+"," ") + " " + window.lang.body.social["field 12"].replace("***",puzzle_disease) + " " + window.lang.body.social["field 20"] + "#Phylo #DNA #puzzles";
                                }
                            } else {
                                if ($.phylo.currentScore>=puzzle_disease) {
                                    var message = fullname.replace("+"," ") + " " + window.lang.body.social["field 13"] + ".\"" + window.lang.body.social["field 20"] + "#Phylo #DNA #puzzles";
                                } else {
                                    var message = fullname.replace("+"," ") + " " + window.lang.body.social["field 14"] + ".\"" + window.lang.body.social["field 20"] + "#Phylo #DNA #puzzles";
                                }
                            }
                            var data = "provider="+provider+"&id="+c_logid+"&description="+message;
                        } else if (provider=="LinkedIn") {
                            if (puzzle_disease) {
                                if ($.phylo.currentScore>=puzzle_disease) {
                                    var message = fullname.replace("+"," ") + " " + window.lang.body.social["field 15"].replace("***",puzzle_disease) + "\n" + window.lang.body.social["field 20"];
                                } else {
                                    var message = fullname.replace("+"," ") + " " + window.lang.body.social["field 16"].replace("***",puzzle_disease) + "\n" + window.lang.body.social["field 20"];
                                }
                            } else {
                                if ($.phylo.currentScore>=puzzle_disease) {
                                    var message = fullname.replace("+"," ") + " " + window.lang.body.social["field 17"] + ".\n" + window.lang.body.social["field 20"];
                                } else {
                                    var message = fullname.replace("+"," ") + " " + window.lang.body.social["field 18"] + ".\n" + window.lang.body.social["field 20"];
                                }
                            }
                            //var caption = window.lang.body.social["field 26"];
                            //var data = "provider="+provider+"&id="+c_logid+"&caption="+caption+"&description="+message;
                            var data = "provider="+provider+"&id="+c_logid+"&description="+message;
                        }

                        bootbox.confirm(window.lang.body.social["field 22"] + "<br/>\n" + message,window.lang.body.social["field 27"],window.lang.body.social["field 25"], function(result) {
                            if (result) {
                                $.ajax({
                                    type: "POST",
                                    url : "http://phylo.cs.mcgill.ca/phpdb/hybridauth/signin/feed.php",
                                    data : data,
                                }).done(function(re) {
                                    //bootbox.alert("Your achievement has been posted!");
                                }).fail(function() {
                                    bootbox.alert(window.lang.body.social["field 23"]);
                                });
                            }
                        });
                    });
                } else {
			if(DEBUG)
                    console.log(window.lang.body.social["field 28"].replace("***",provider));
                    return;
                }
            } else {
                bootbox.alert(window.lang.body.social["field 29"]);
                // delete cookie (just to be safe)
                userCache.removeItem("username");
                userCache.removeItem("fullname");
                userCache.removeItem("provider");
                userCache.removeItem("logid");
                $("#logout").hide();
                window.guest = 'guest';
                $("#login-box").hide();
                $(".login-btn").click(function() { eClick(); });
                $("#login-tag").html(window.lang.play.gameselect.login["field 2"]);
                $(".showInLogin").hide();
                return;
            }
        },
		//events for the end game messages
		//new game or replay game
		events : function() {
			$("#endGame-learnMore-content").hide();
	
			$("#endGame-learnMore-tag button").unbind().click(function() {
				$("#endGame-learnMore-content").slideToggle("fast",function() {

				});
			});

			$("#endGame-new button").unbind().click(function() {
				//window.location.reload(true);
				$("#game").hide();
				$("#endGame").fadeOut();
				interactiveMenu.restart();
				$("#draw").show();
				$("#menu").fadeIn();
				//window.location.hash = "#!play";
			});
				
			$("#endGame-replay button").unbind().click(function(){
				$.main.clear();
				$("#endGame").fadeOut();
				$("#tree").html("");
				$("#gameBoard").html("<img src='img/loading.gif'/>");
				$.protocal.replay();
				$("#countDown-text").html("<img src='img/loading.gif'/>");
				$("#countDown").fadeIn();
			});
 
            $("#endGame-share button").unbind().click(function(){
		if(DEBUG)
                console.log("Click share event");
                $.endGame.share('test');
            });
		},
		//a pop up message to check if really want to bail out from the game
		runAway : function() {
			$("#runaway").unbind().click(function() {
                bootbox.confirm(window.lang.body.misc["field 19"],function(result){
                        if(result ==true){
                            $.endGame.bail();
                            $.timer.active = false;
                        }
                    });
			});	
		}
	}
})();
