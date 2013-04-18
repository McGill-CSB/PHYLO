(function() {
	define([
		'jquery',
		'underscore',
		'backbone',
		'mustache',
		'views/request.views',
		'views/lang.views',
		'models/lang.models',
	], function($, _, Backbone, Mustache, Request, Lang, LangModel) {
		var request = new Request;
		var translate = new Lang;
		var trans = new LangModel;
		var navBar = Backbone.View.extend({
			//saves initial default template
			init : function() {
				this.desktopNavBar = $("#nav").html();
				this.tabletUX = $("#tablet-grid").html();
				this.set,(window.langOpt,"play");
			},
			lang : "null",
			//sets stuff
			set : function(lang,tag) {
				var self = this;
				if(this.lang == lang) 
					return;
				this.lang = lang;
				//request and check if file exists if not load in the file
				request.getJsonLang(lang, function(json) {
					//sets the lang defintion
                  	window.lang = json;
					//loads out the translation
					$("#tablet-grid").html(Mustache.render(self.tabletUX,json));
                    $("#tablet-grid-2").hide();
                    $("#tablet-grid").show();
					//update login tag
					translate.set(json);
					if(window.guest != "guest") {
					    $(".m_login").html(window.guest);
					}
					self.addTriggers(lang,json);
					$("#"+tag +" div").addClass("onSelect");
					//check to see if to show these options
					if(window.showInLogin != undefined && window.showInLogin == true)
						$(".showInLogin").show();
					if(window.showExpertOptions != undefined && window.showExpertOptions == true)
						$(".showExpertOptions").show();


				    //initialize puzzle, once we get the translated lang
				    $.storage.init("1.0");
				});
			},
			//this is to set / reset the event triggers
			addTriggers : function(lang, json) {
				var self = this;
				//classic button to jump
				//menu hyperlink listener
				$("a.isTab").unbind().click(function() {
					if($(this).attr("href") == "javascript:void(0);") {
						var innerSelf = this;
						if($.timer.active == true) {
                            console.log("navBar"+trans.get("quitGame"));
                            bootbox.confirm(Mustache.render(trans.get("quitGame"),json),function(status) {
								if(status == true) {
									window.location.hash = "#!/"+lang+"/"+$(innerSelf).attr("id");		
									$.timer.stop();
									//force change
									if($(innerSelf).attr("id") == "play") {
										request.getTemplate("templates/play.html", self.lang);
									}
								}
							});			
						} else {
							window.location.hash = "#!/"+window.langOpt+"/"+$(this).attr("id");		
						}
					} else {
						window.location.href = $(this).attr("href");
					}
				});
				//tablet
				$("a.tablet-back-btn").unbind().click(function() {
					var innerSelf = this;
					if($.timer.active == true) {
						bootbox.confirm("Are you sure you want to quite?",function(status) {
							if(status == true) {
							//	window.location.hash = "#!"+$(innerSelf).attr("name");		
								$.timer.stop();
								$(this).hide();
								$(innerSelf).hide();
								$("#mid-panel").hide();
								$("#tabletPanel").show("slide",{direction:"left"},500);
							}
						});			
					} else {
						$(this).hide();
						$("#mid-panel").hide();
						$("#tabletPanel").show("slide",{direction:"left"},500);
					}
				});
				$("a.tablet-tab").unbind().click(function() {
						var innerSelf = this;
						if($(innerSelf).attr("name") == "play") {
							request.getTemplate("templates/play.html", self.lang);
						}
						if($(innerSelf).attr("name") == "tablet:settings") {
							request.getTemplate("templates/settings.html", self.lang);
						}

						window.location.hash = "#!/"+window.langOpt + "/"+$(this).attr("name");		

						$("#tabletPanel").hide("slide",{direction : "left"}, 500);
						if($("#mid-panel").hasClass("forceDisplayNone")) {
							$("#mid-panel").removeClass("forceDisplayNone");	
						}
						window.setTimeout(function() {
							$(".tablet-back-btn").fadeIn();
						},400);
				});
				$("a.tablet-login").unbind().click(function() {
					if($(".tablet-login-wrapper").html().trim() == "") {
						hitTest();
						$(".tablet-login-wrapper").html($("#login-box").html());
						$("#login-box").html("");
						$(".tablet-login-wrapper").append(
						"<div class='tablet-login-cancel'>"+
							"<a class='btn btn-danger' href='javascript:void(0);'>Cancel</a>"+
						"</div>");
						$(".tablet-login-bg").fadeIn();
						$(".tablet-login-wrapper").fadeIn();
						$(".tablet-login-bg").css({
							height : $(document).height(),
							width : $(document).width()
						});
						$(".tablet-login-cancel").unbind().unbind().click(function() {
							$(".tablet-login-wrapper").hide();
							$(".tablet-login-bg").hide();
						});	
					} else {
						$(".tablet-login-bg").fadeIn();
						$(".tablet-login-wrapper").fadeIn();
					}	
				});
			},
		});
		return navBar;
	});
})();
