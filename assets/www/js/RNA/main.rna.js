(function() {
	$(document).ready(function() {
		$.rna = {
			getPuzzle : function() {
				var puzzle = [
					"((((...))))",
					"((..))",
					"(((((.........)))))",
					"(((.....)))"
				];
				return puzzle;	
			},
			//unbinds all the previous data
			clear : function() {
				$.stage.current = -1;
			},
			//configuration
			init : function() {
				$.main.type = "RNA";
				var self = this;
				this.clear();
				if($("#tree").css("height") == undefined) {
					height = 178;
				} else {
					height = $("#tree").css("height").replace(/px/,"");
				}
				$.phylo = {
					seqLen : 25,
					x : 34,
					offSet : 0,//$("#gameBoard").css("left").replace(/px/,""),
					height : height,
					rows : 10,
				};
				$.langModule.init(function() {
					$("#game").show();
					//$.protocal.read(setting);
					//$.protocal.request();
					//$.endGame.init("lose");
					self.callBack();
				});
			},
			//call back on protocal complete
			//sets the layout and activates the game
			callBack : function() {
				var self = this;
				
				//sets the gameBoard to be nonMovable on touch devices.
				$.events.touch("#gameBoard",{
					start: function(e) {
					}, move : function(e) {
					}, end : function(e) {
					}
				});
				var mouseMove = "onmousemove" in document.documentElement;

				//$.phylo.tree = $.tree.build($.phylo.get.tree);
				$.board.build();
				//using temporary puzzle
				$.sequence.buildRNA(self.getPuzzle());
				$.sequence.prepareRNATracking(self.getPuzzle());

				$.phylo.origin = [];
				for(var i=0;i<8;i++){
					var t = [];
					for(var j=0;j<25;j++) {
						t.push(0);		
					}
					$.phylo.origin.push(t);
				}

				$.helper.copy($.phylo.origin, $.sequence.track);
			//	var random = $.sequence.randomize($.sequence.track);
			//	$.sequence.prepareTracking(random);
				$.phylo.domCache = $.sequence.createCache();
			//	$.physics.snapRandom();

			//	$.stage.last = $.phylo.tree[$.phylo.tree.length-1].lv;
			//	$.stage.last = 
				//disbales count down for now	
		//		$.splash.countDown(function() {
					//start game
					$.stage.end = false;
				//temporary values
					$.stage.rna.last = 10;
					$.stage.rna.current = 1;
					
					$.stage.rna.round();
					//$.stage.round();	
					if(DEBUG)
						$.helper.dump($.sequence.track);
					if(mouseMove) {
						$.multiSelect.active();
					}
		//		});
				$.board.startListener();
				//temporary sripts to disble certain functions
				$("#countDown").hide();
				$(".boardRow").removeClass("hidden");
			},
		};
	});
})();
