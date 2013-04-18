(function() {
  $(document).ready(function() {
    //hide logout on default
    $("#logout").hide();
    document.addEventListener("deviceready", onDeviceReady_login, false);
  });

  function onDeviceReady_login() {
    var userCache = window.localStorage;

    /*-----------------------------------HybridAuth Functions-------------------------*/
    //update/create localstorage key/value from hybrdiauth
    var hybridAuthSecond = function(provider, reload) {
      var url = "http://phylo.cs.mcgill.ca/phpdb/hybridauth/signin/login.php?provider=" + provider + "&restart=0";
      window.connectStatus = $.protocal.checkConnection();
      if (window.connectStatus === false) {
        console.log("cannot detect connection");
        //show warning
        bootbox.dialog(window.lang.body.misc["field 25"], [{
          "label": "Retry",
          "class": "btn-primary",
          "callback": function() {
            $("#tablet-login-tag").trigger('click');
          }
        }, {
          "label": "Cancel",
          "class": "btn-danger"
        }]);
        failLoginCleanUp();
        return;
      }

      console.log("hybridAuthSecond,reload:" + reload);
      $.ajax({
        type: 'GET',
        url: url,
        success: function(data, textStatus) {
          var userinfo = eval("(" + data + ")");

          console.log("login success" + data);
          if (userinfo.identifier) {
            //if this is a reload, check if cached and new login information matches

            console.log("hybridAuthSecond,identifier:" + userinfo.identifier + "\n cached:" + userCache.getItem("logid"));
            if (!reload && userCache.getItem("logid") != userinfo.identifier) {
              failLoginCleanUp();
              return;
            }

            //user info
            var username = provider + "_" + userinfo.identifier;
            var fullname = userinfo.firstName + "+" + userinfo.lastName;
            var email = userinfo.email;
            var logid = userinfo.identifier

            userCache.setItem("username", username);
            userCache.setItem("fullname", fullname);
            userCache.setItem("provider", provider);
            userCache.setItem("logid", logid);
            userCache.setItem("username", username);

            //connection check --handled by ajax failed function
            //get password from phylo db 
            $.ajax({
              type: 'POST',
              url: "http://phylo.cs.mcgill.ca/phpdb/passwdmanager.php",
              data: "username=" + username + "&id=" + userinfo.identifier,
              success: function(mypasswd) {

                var password = mypasswd;
                //connection check--> handle by ajax failed
                $.protocal.login(username, password, function(re) {
                  if (re != "succ") {
                    if ((username == "" || password == "") || email == "") {
                      $("div.login-warning").show().html(window.lang.body.social["field 3"].replace("***", provider));
                      return;
                    } //end bad form 
                    if (!reload) {
                      console.log("ERROR: not reload and user does not exit on phylo db!!!!");
                    }
                    //TODO should we do registration when not reload?

                    //registration on phylo network 
                    $.protocal.register(username, fullname, password,
                    email, provider, logid,

                    function(re2) {
                      //if registration successful
                      if (re2 == "succ") {
                        console.log(provider + " registration successful. username: " + username);
                        //Update status
                        var message = fullname.replace("+", " ") + " " + window.lang.body.social["field 1"] + " " + window.lang.body.social["field 20"];
                        var caption = window.lang.body.social["field 31"];
                        if ((provider == 'Facebook') || (provider == 'LinkedIn')) {
                          var data = "provider=" + provider + "&id=" + c_logid + "&caption=" + caption + "&description=" + message;
                        } else {
                          var data = "provider=" + provider + "&id=" + c_logid + "&description=" + message;
                        } //if login  using LinkedIn or Facebook
                        //fire bootbox(dialogue) for login
                        bootbox.confirm(window.lang.body.social["field 2"], window.lang.body.social["field 26"], window.lang.body.social["field 25"], function(result) {
                          if (result) {
                            console.log("post on " + provider + " : " + data);
                            //check connection --> handle by ajax failed
                            $.ajax({
                              type: "POST",
                              url: "http://phylo.cs.mcgill.ca/phpdb/hybridauth/signin/feed.php",
                              data: data,
                            }).done(function(re) {
                              //bootbox.alert("Thank you for sharing the word. You can now start to play!");
                            }).fail(function() {
                              bootbox.alert(window.lang.body.social["field 4"]);
                            }); //end ajax to phylo hybridauth
                          } //if bootbox confirm return true
                        }); //bootbox confirm function and callback ends
                      } //if success registration re2
                      else {
                        //registration fail
                        console.log(provider + " registration failed.");
                        $("div.login-warning").show().html(window.lang.body.social["field 5"].replace("***", provider));
                        failLoginCleanUp();
                        return;
                      } //registration re2 failed
                    }); //end registering user from social network into phylo database + callback
                  } //end not successful login
                }); //end protocal.login
              }, //end ajax request to phylo + done success callback
              error: function() {
                console.log("error function at 1st ajax hybridauth");
                $("div.login-warning").show().html(window.lang.body.play.gameselect.login["field 21"]);
                failLoginCleanUp();
                return;
              }
            }); //end ajax request to phylo+ fail callback
            //dispaly logined user on toolbar and set global variable
            window.guest = fullname.replace("+", " ");
            $(".m_login").html(window.guest);

          } else {
            $("div.login-warning").show().html(window.lang.body.social["field 6"].replace("***", provider));
            failLoginCleanUp();
            return;
          } //fail get userinfo
        },
        error: function(xhr, textStatus, errorThrown) {
          console.log("connection to hybridauth script failed");
        } //error
      }); //end ajax
    }; //end hybridAuthSecond
    /*----------------------------------------------------------------------------------*/

    // Classic login onclick event
    var classicLogin = function() {
      var username = $("#username").val().trim();
      var password = $("#password").val().trim();
      if ((username == "" || password == "")) {
        $("div.login-warning").show().html(window.lang.body.play.gameselect.login["field 20"]);
        return;
      }
      $("div.login-warning").hide();
      $.protocal.login(username, password, function(re) {
        if (re == "succ") {
          userCache.setItem("username", username);
          userCache.setItem("fullname", username);
          userCache.setItem("provider", "Classic");
          userCache.setItem("logid", "-1");

          $("#logout").show();
          window.guest = username;
          $("#tablet-login-box").hide();
          $("#tablet-login-box-bg").hide();
          $(".m_login").html(username);
          $(".login-btn").unbind("click");
          // show buttons. NB: hide expert button if necessary
          $.ajax({
            type: "POST",
            url: "http://phylo.cs.mcgill.ca/phpdb/phyloExpertDB.php",
            data: "mode=8&user=" + username,
            success: function(result) {
              $(".showInLogin").show();
              window.showInLogin = true;
              if (result != 'succ') {
                $(".showExpertOptions").hide();
                window.showExpertOptions = false;
              }
            },
            error: function() {
              $(".showInLogin").show();
              window.showInLogin = true;
              console.log("Expert validation failed. Could not connect to the server.");
            }
          });
        } else {
          $("div.login-warning").show().html(window.lang.body.play.gameselect.login["field 16"]);
        }
      });
    };

    //when login successfully, add logout option, hide login
    var loginSuccessUI = function(username) {

      $("#logout").show();
      $("#tablet-login-box").hide();
      $("#tablet-login-box-bg").hide();
      $(".login-btn").unbind("click");
      // show buttons. NB: hide expert button if necessary
      //connection checking--> handle by ajax failed
      $.ajax({
        type: "POST",
        url: "http://phylo.cs.mcgill.ca/phpdb/phyloExpertDB.php",
        data: "mode=8&user=" + username,
      }).done(function(re) {
        $(".showInLogin").show();
        window.showInLogin = true;
        if (re != 'succ') {
          $(".showExpertOptions").hide();
          window.showExpertOptions = false;
        }
      }).fail(function() {
        $(".showInLogin").show();
        window.showInLogin = true;
        console.log("Expert validation failed. Could not connect to the server.");
      });

    };
    //clean cookie and clean up UI to guest mode
    var failLoginCleanUp = function() {
      console.log("delete user info");
      userCache.removeItem("username");
      userCache.removeItem("fullname");
      userCache.removeItem("provider");
      userCache.removeItem("logid");
      $("#logout").hide();
      window.guest = 'guest';
      $("#tablet-login-box").hide();
      $("#tablet-login-box-bg").hide();
      $(".login-btn").click(function() {
        classicLogin();
      });
      $(".m_login").html(window.lang.body.play.gameselect.login["field 2"]);
      $(".showInLogin").hide();
      window.showInLogin = false;
    };

    // Social login onclick event
    var socialLogin = function(provider) {
      start_url = "http://phylo.cs.mcgill.ca/phpdb/hybridauth/signin/login.php?provider=" + provider + "&restart=1";
      win = window.open(
      start_url,
        'hybridauth_social_signin',
        'location=no,clearcache=yes' // if we are using restart=1 for hybridauth, user is first login
      );
      win.addEventListener('loadstop', function(event) {
        processLoginCallback(event.url, start_url, win, provider);
      });
    };

    var processLoginCallback = function(newloc, redirect_url, popup, provider) {
      if (newloc.indexOf(redirect_url) == 0) {
        popup.close();
        //create cookie to jump start the login process after page refresh
        window.sessionStorage.setItem("HybridAuthFirst", "true");
        userCache.setItem("provider", provider);

        $("#tablet-login-box").hide();
        $("#tablet-login-box-bg").hide();
        onDeviceReady_login();

      }
    };

    /*-------------------------------------------------------*/
    //if this is a reload which happens when user login using social media
    if (window.sessionStorage.getItem("HybridAuthFirst") == "true") {
      //login & create userCache cache
      hybridAuthSecond(userCache.getItem("provider"), true);
      window.sessionStorage.removeItem("HybridAuthFirst");
      loginSuccessUI(userCache.getItem("username"));

    } else {

      console.log("restart app");
      var username = userCache.getItem("username");
      var provider = userCache.getItem("provider");
      //console.log("username"+username+userCache.length);

      if (username && username != "") {
        $(".login-btn").unbind("click");
        //Case 1. Classic Login
        if (provider == "Classic") {
          $(".m_login").html(username); //show username on toolbar
          window.guest = username;
        } //end case 1.
        else {
          hybridAuthSecond(userCache.getItem("provider"), false);
        } //end case 2

        loginSuccessUI(username);

      } //end if existing record of user login
    } //if not reload from hybridAuth first check


    /*------------------------------------------------------------------------*/
    //login click event
    $(".login-btn").click(function() {
      classicLogin();
    });
    $(".zocial.facebook").click(function() {
      socialLogin('Facebook');
    });
    $(".zocial.twitter").click(function() {
      socialLogin('Twitter');
    });
    $(".zocial.google").click(function() {
      socialLogin('Google');
    });
    $(".zocial.linkedin").click(function() {
      socialLogin('LinkedIn');
    });


    //logout event
    $(".m_logout").click(failLoginCleanUp);

    //register event
    $(".register-btn").click(function() {
      //cancel button only show after user enter email
      if ($(".cancel-btn").css("display") == "none") {
        $(".login-warning").hide();
        $(".email-holder").show();
        $(".register-btn").removeClass("register-btn-shift");
        $(".login-btn").hide();
        $(".cancel-btn").show();
      } else {
        //register user
        var name = $("#username").val().trim();
        var password = $("#password").val().trim();
        var email = $("#email").val().trim();
        if ((name == "" || password == "") || email == "") {
          $("div.login-warning").show().html(window.lang.body.play.gameselect.login["field 20"]);
          return;
        }

        $.protocal.register(name, name, password, email, 'Classic', 0, function(re) {
          if (re == "succ") {
            $(".login-btn").unbind("click");
            $(".m_login").html(name);
            $("#logout").show();
            window.guest = name;
            $("#tablet-login-box").hide();
            $("#tablet-login-box-bg").hide();
          } else {
            $("div.login-warning").show().html(window.lang.body.play.gameselect.login["field 22"]);
          }
        });
      }
    });

    //cancel registration process
    $(".cancel-btn").click(function() {
      $(".email-holder").hide();
      $(".register-btn").addClass("register-btn-shift");
      $(".login-btn").show();
      $(this).hide();
    });
  }
})();