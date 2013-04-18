(function() {
	define([
		'jquery',
		'underscore',
		'backbone',
		'mustache',
		'views/request.views',
		'views/variable.listener',
	], function($, _, Backbone,Mustache,Request,Listener) {
		var listener = new Listener;
		var selectTab = function(tag) {
			$("#nav a div").removeClass("onSelect");
			$("#"+tag +" div").addClass("onSelect");

			//edit language href to selected tab
			$(".language-list a").each(function() {
				var href = $(this).attr("href").replace(/#!.*$/,"");
				$(this).attr("href",href+"#!/"+$(this).attr("name")+"/"+tag);
			});
		};
		var request = new Request;	
		var playView = Backbone.View.extend({
			renderPuzzle : function(lang, id) {
				selectTab("play");
				request.getTemplate("templates/play.html",function(context) {
					request.getJsonLang(lang, function(json) {
						window.lang = json;
						$("#mid-panel").html(Mustache.render(context,json));
						request.complete();
						require(["views/gameMenu.actions","DNA/main.core"], function() {
							if($.main == undefined) {
								var fn = function() {
									if($.main == undefined) { 
										window.setTimeout(function() { fn() },100);
									} else {
                                        //TODO WHY HERE?
                                        if(DEV.logging) {
                                            devTools.prompts.notify({ title : "site.view Puzzle Id", text : id});
                                        }
										$("#draw").hide();
										$("#menu").hide();
										$.main.init({
											type:"disease",
											num : id,
										});		
									}
								}	
								fn();
							} else {
								$("#draw").hide();
								$("#menu").hide();
                                //TODO WHY HERE?

                                if(DEV.logging) {
                                    devTools.prompts.notify({ title : "site.view Puzzle Id", text : id});
                                }
								$.main.init({
									type:"disease",
									num : id,
								});		
							}
						});
					});
				});
				$("#m_contribute").unbind().click(function() {
					window.location.hash = $(this).attr("href");
				});
			},
			render : function(lang) {
				selectTab("play");
				request.getTemplate("templates/play.html",function(context) {
					request.getJsonLang(lang, function(json) {
						window.lang = json;
                        console.log("LOG_site.view: render");
						$("#mid-panel").html(Mustache.render(context,json));
						request.complete();
						if(window.DEV.disableMenu) {
							window.setTimeout(function() {
								$("#draw").hide();
								$("#menu").hide();
								if(window.location.hash.match(/rna/i) != null) {
								//	$.rna.init();
								} else {
									$.main.init({
										type: "random",
										num: 3,		
									});	
								}
							},500);
						}
					});
				});
				$("#m_contribute").unbind().click(function() {
					window.location.hash = $(this).attr("href");
				});
			},
		});

		var historyView = Backbone.View.extend({
			render : function(lang) {
				listener.change("guest","guest",100,1500,function(respond) {		
					if(respond) {
						selectTab("history");
						$("#mid-panel").html("<div id='history-wrapper'></div>");
						request.post(
							"http://phylo.cs.mcgill.ca/phpdb/userrecordget.php?username=" + window.guest + "&lang=" + lang.toUpperCase(),
							function(re) {
								if($("#history-wrapper").length != 0) {
                                    /* Now call the legend */
                                    request.getTemplate("templates/history_legend.html",function(legend) {
                                        request.getJsonLang(lang, function(json) {
                                            $("#history-wrapper").prepend(re + "\n\n" + Mustache.render(legend,json.body.play));
                                            require(['views/DT_bootstrap_history.actions'],function() {
                                                historyTable.init();
                                                $("#ranking td a").unbind().click(function() {
                                                    window.location.hash = $(this).attr("href").replace(/index.html/,"");
                                                });
                                            });
                                        });
                                    });
								}
								request.complete();
							}
						);
					} else {
						window.location.hash = "#!/"+lang;
					}
				});
	

				
			},
		});
		
		var aboutView = Backbone.View.extend({
			render : function(lang) {
				selectTab("about");
				request.getTemplate("templates/about.html",function(context) {
					request.getJsonLang(lang, function(json) {
						$("#mid-panel").html(Mustache.render(context,json.body.play));
						request.complete();
					});
				});
			},
		});

		var rankingView = Backbone.View.extend({
			render : function(lang) {
				selectTab("ranking");
				$("#mid-panel").html("<div id='ranking-wrapper'></div>");
                request.post(
					"http://phylo.cs.mcgill.ca/phpdb/fullrankingsget.php?lang=" + lang.toUpperCase(),
					function(re) {
						if($("#ranking-wrapper").length != 0) {
                            /* Now call the legend */
                            request.getTemplate("templates/ranking_legend.html",function(legend) {
                                request.getJsonLang(lang, function(json) {
                                    $("#ranking-wrapper").prepend(re + "\n\n" + Mustache.render(legend,json.body.play));
                                    require(['views/DT_bootstrap_ranking.actions'],function() {
                                        rankingTable.init();
                                    });
                                });
                            });
						}
						request.complete();
					},
					"js/dummy/ranking.dummy"
                );
			},
		});
		
		var creditsView = Backbone.View.extend({
			render : function(lang) {
				selectTab("credits");
				request.getTemplate("templates/credits.html",function(context) {
					request.getJsonLang(lang, function(json) {
						$("#mid-panel").html(Mustache.render(context,json.body.play));
						request.complete();
					});
				});
			},
		});

		var tutorialView = Backbone.View.extend({
			render : function(data) {
				selectTab("tutorial");
				request.getTemplate("templates/tutorial.mustache",function(temp){
					$("#mid-panel").html(Mustache.render(temp,data));
					request.complete();
				});
                
			},
		});
	
		var rnaView = Backbone.View.extend({
			render: function(lang) {
				selectTab("play");
				request.getTemplate("templates/rna.html",lang);
			},
		});

		var tabletSettingsView = Backbone.View.extend({
			render : function(lang) {
				request.getTemplate("templates/settings.html",lang);
			},
		});

		return {
			Play : playView,
			History : historyView,
			About : aboutView,
			Ranking : rankingView,
			Credits : creditsView, 
			Tutorial : tutorialView,
			RNA : rnaView,
			TabletSettings : tabletSettingsView,
		};
	});	
})();
