/**
 First timer
 puzzle set db name : phyloPuzzle
 puzzle set db version : 1.0
 $.storage is init at navbar.view.js navbar init
 add in_XML field for puzzle db, will insert new puzzle in json format

 **/
(function() {
  var userCache = window.localStorage;
  var DEV = window.DEV;
  //web sql functions
  $.storage = {
    filename: "puzzle_test.json",
    dbname: "phyloPuzzle_storage",
    dbDisplay: "phyloDB",
    version: "1.0",
    path: "../www/js/models/puzzles/",
    commandF: "command.json",
    request: "",
    uploadCount:0,

    init: function(version) {
      //console.log("LOG_storage: initializing ...");
      var self = $.storage;
      $.getJSON(self.path + self.commandF)
        .done(function(data) {
        self.commands = data;
      })
        .fail(function() {
        console.log("error reading file:" + self.path + self.commandF)
      });

      if (userCache.getItem("puzzleDB_name") === null) {

        //create progress loading bar
        var progressBarHTML = window.lang.body.misc["field 2"] + "<br><div class ='progress progress-striped active'><div class='bar' style='width: 5%'></div></div>";
        bootbox.dialog(progressBarHTML, []);
        if (DEV.logging) console.log("open new database");
        //request file access
        this.version = version;
        this.db = window.openDatabase(this.dbname, this.version, this.dbDisplay, 4 * 1024 * 1024);
        this.db.transaction(this.populateDB, this.errorDB, this.successPopulateDB);
      } else {


        this.dbname = userCache.getItem("puzzleDB_name");
        this.version = userCache.getItem("puzzleDB_version")
        if (DEV.logging) console.log("LOG_storage:opening exisiting db:" + this.dbname + " and version:" + this.version);
        if (!this.db) {
          this.db = window.openDatabase(this.dbname, this.version,
          this.dbDisplay, 4 * 1024 * 1024);
        }


      }
      if($.protocal.checkConnection()!=false){
        self.uploadSolutions();
      }
    },

    populateDB: function(tx) {
      var self = $.storage;
      tx.executeSql(self.commands.createTable["drop 1"]);
      tx.executeSql(self.commands.createTable["drop 2"]);
      tx.executeSql(self.commands.createTable["create 1"]);
      tx.executeSql(self.commands.createTable["create 2"]);
    },

    errorDB: function(tx, err) {
      console.log("error processing sql or callback error " + err.message);
    },
    successPopulateDB: function() {
      var self = $.storage;
      //loaded inital puzzle and import it into websql
      $.get(self.path + self.filename)
        .done(function(data) {
        var lines = data.split("\n");
        $.each(lines, function(n, elem) {
          var query = self.commands.createTable["insert 1"] + elem;
          self.db.transaction(function(tx) {
            tx.executeSql(query);
            var progress = Math.floor((n / lines.length * (100 - 5)) + 5).toString();
            $('.bar').css({
              width: progress + "%"
            });
            if (n == lines.length - 1) {
              userCache.setItem("puzzleDB_name", self.dbname);
              userCache.setItem("puzzleDB_version", self.version);
              bootbox.hideAll();

            }
          }, function(err) {
            console.log("problem in query" + query + "--" + err.message);
          });

        });
      })
        .fail(function() {
        console.log("LOG_storage: failed to load file: " + self.filename);
      });

    },

    //try to find puzzle in db and if not found what to do
    queryPuzzle: function() {
      //build both the query and the ajax request
      var self = $.storage;
      self.request = "";
      var type = $.protocal.tp;
      var score = $.protocal.score;
      var query = self.commands.query["select 1"];
      if (type == "level") return;
      if (type == "random") {

        self.request += "mode=1&diff=" + score;
        query += "difficulty=?";
        self.db.transaction(function(tx) {
          tx.executeSql(query, [score], self.querySuccess, self.errorDB);
        }, self.errorDB);

        //level is already done by check level
      } else if (type == "disease") {
        self.request += "mode=2&id=" + score;
        query += "level_id=?";
        self.db.transaction(function(tx) {
          tx.executeSql(query, [score], self.querySuccess, self.errorDB);
        }, self.errorDB);
      }
    },

    //when you find puzzle in local db
    querySuccess: function(tx, results) {
      var self = $.storage;
      var len = results.rows.length;
      var index = ($.protocal.tp == "level_id") ? 0 : Math.floor((Math.random() * results.rows.length));
      if (len >= 1) {
        var puzzle = results.rows.item(index);
        if (puzzle.in_XML == "true") {
          puzzle.json = $.xml2json(puzzle.level_xml);
        } else {
          puzzle.json = $.parseJSON(puzzle.level_xml);
        }
        //console.log("querySuccess"+self.request);
        self.processPuzzleJson(puzzle.json);
        return;
      } else {
        if ($.protocal.checkConnection() != false) {
          if (DEV.logging) {
            devTools.prompts.notify({
              title: "LOG_Storage",
              text: "cannot find in local puzzle,requesting:" + $.storage.request
            });
          }
          $.protocal.request(self.request, null, null, null); //self.getLocalPuzzle());
          return;
        } else {
          bootbox.alert("Cannot retrieve puzzle due to Internet disconnection. Randomly select puzzle.");
          if (DEV.logging) console.log("cannot connect to internet, randomly pick from  local");
          //pick from local
          self.getLocalPuzzle();
        }
      }
    },

    //processPuzzleJson from boh request and local
    processPuzzleJson: function(json) {

      if (json.id != undefined) {
        $.phylo.id = json.id;
      } else {
        $.phylo.id = json.attributes.id;
      }
      for (var i = 0; i < json.sequence.length; i++) {
        json.sequence[i] = (json.sequence[i].replace(/-/g, "_")).toUpperCase();
      }
      //Detect backend error
      var numOfSeq = json.sequence.length;
      var numOfNodes = json.tree.replace(/(\(|\)|\;)/, "").split(",").length;

      if (DEV.logging) {
        devTools.prompts.notify({
          title: "LOG_STORAGE Puzzle Id",
          text: $.phylo.id
        });
      }
      if (numOfSeq != numOfNodes) {
        console.log(">> Detected Error -> Puzzle (" + $.phylo.id + ") Sequence given (" + numOfSeq + ") != phylo tree nodes (" + numOfNodes + ")");
        if (DEV.logging) devTools.prompts.notify({
          type: "error",
          title: "warning",
          text: "Puzzle: " + $.phylo.id + "<br> #Seq(" + numOfSeq + ") / #Nodes(" + numOfNodes + ") mismatch"
        });
      }
      if (DEBUG) {
        json.sequence;
        json.tree;
      }
      $.phylo.get = {};
      $.phylo.get.sequence = json.sequence;
      $.phylo.get.treeString = json.tree;
      var tree = $.newick.parse(json.tree);
      $.phylo.get.tree = tree;
      $.main.callBack();
    },

    //pick a random local puzzle when both local and request failed --> should probably notify user
    getLocalPuzzle: function() {
      var self = $.storage;
      var seed = (Math.random() + 1) * 1111111;
      self.db.transaction(function(tx) {
        tx.executeSql(self.commands.query["select 2"], [seed], self.querySuccess, self.errorDB);
      }, self.errorDB);
    },

    //check level exist and start callback
    checkLevel: function(level_id, succCallback, invalidCallback, failCallback) {
      var self = $.storage;
      self.request = "mode=2&id=" + level_id;
      var query = self.commands.query["select 1"] + "level_id=?";
      if (DEV.logging) console.log("checkLevel:" + query + " id:" + level_id);
      self.db.transaction(function(tx) {
        tx.executeSql(query, [level_id], function(tx, results) {
          var len = results.rows.length;
          if (len >= 1) {
            var puzzle = results.rows.item(0);
            if (puzzle.in_XML == "true") {
              puzzle.json = $.xml2json(puzzle.level_xml);
            } else {
              puzzle.json = $.parseJSON(puzzle.level_xml);
            }
            if (succCallback != null) succCallback();
            self.processPuzzleJson(puzzle.json);
          } else {
            if ($.protocal.checkConnection() != false) {
              if (DEV.logging) {
                devTools.prompts.notify({
                  title: "LOG_Storage",
                  text: "cannot find in local puzzle,requesting:" + $.storage.request
                });
              }

              $.protocal.request(self.request, invalidCallback, succCallback, failCallback);
            } else {
              if (failCallback != null) failCallback();
            }
            return;
          } //end execute sql
        }, self.errorDB);
      }, self.errorDB);
    },

    checkScore: function(queryParam, dbd) {
      var self = $.storage;
      var dbdata = "( "+dbd[0]+",'"+dbd[1]+"', '"+dbd[2]+"',"+dbd[3]+","+dbd[4]+")";

        self.db.transaction(function(tx) {
        //search by level
        tx.executeSql(self.commands.query["select 4"], [queryParam[0]], function(tx, results) {
          var len = results.rows.length;
          if (len >= 1) {
            //find same player compare score and change local storage
            console.log("checkScore:compare");
            var i = 0,
              found = false;
            while (i < len) {
              var entry = results.rows.item(i);
              if (entry.player_id == queryParam[1]) {
                if (entry.score < queryParam[2]) {
                    //change
                    console.log("update");
                    var query = self.commands.query["update 1"];
                    self.db.transaction(function(tx) {
                        tx.executeSql(query, [dbd[3],dbd[2],dbd[0],dbd[1]], null, self.errorDB);
                    }, self.errorDB);

                } else {
                  console.log("puzzle played by player in db has higher score");
                }
                found = true;
              }
              i++;
            } //loop through records
            if (!found) {
              //insert
              console.log("insert puzzle for this player")
              self.insertSolution(dbdata);
            }
          } else {
            //insert it into local storage
            self.insertSolution(dbdata);
          }
        },
        self.errorDB);
      }, self.errorDB);

    },

    insertSolution: function(dbdata) {
      var self = $.storage;
      var query = self.commands.createTable["insert 2"] + dbdata;
      console.log("insert solution" + query);
      self.db.transaction(function(tx) {
        tx.executeSql(query, [], null, self.errorDB);
      }, self.errorDB);
    },


    checkInfo: function(queryParam, callback) {
        var self = $.storage;
        var query=self.commands.query["select 1"]+"level_id=?";
        console.log("checkInfo");
        self.db.transaction(function(tx){
            tx.executeSql(query,[queryParam[0]],function(tx,results){
                    var len = results.rows.length;
                    if(len>=1){
                        var puzzle = results.rows.item(0);
                        callback(puzzle);
                    }else{
                        console.log("puzzle information not found-> should update");
                        //TODO: callback without any puzzle info
                        bootbox.alert("Unable to retrieve puzzle information due to Internet disconnection.You puzzle will be saved locally");
                        var dummy = '{"0":"CONGENITAL PTOSIS","disease_link":"CONGENITAL PTOSIS","1":"67","play_count":"67","2":"13","fail_count":"13","3":"42","best_score":"42","4":"1375","running_score":"1375","5":"unki2aut","highscore_user":"unki2aut"}';
                        callback(dummy);
                    }
                },
            self.errorDB);
        },self.errorDB);
    },
    //add new json puzzle to storage
    updatePuzzle: function(json) {
       var self = $.storage;
       self.db.transaction(function(tx){
            tx.executeSql(self.commands.createTable["insert 3"],
            [parseInt(json.attributes.id),JSON.stringify(json),false],function(tx,results){
                    if (DEV.logging)  devTools.prompts.notify({ type:"success", title:"import new puzzle", text: "new puzzle imported:"+json.attributes.id});
                },self.errorDB);
        },self.errorDB);
    },
    updatePuzzleInfo:function(json){
         console.log("updatePuzzleInfo"+JSON.stringify(json));
         var self = $.storage;
         self.db.transaction(function(tx){
             tx.executeSql(self.commands.query["update 3"],
                [json.disease_link,json.play_count,json.fail_count,
                    json.best_score,json.running_score,json.highscore_user,$.phylo.id],function(tx,results){
                    if (DEV.logging)  devTools.prompts.notify({ type:"success", title:"update puzzle stat", text: "update state of puzzle:"+ $.phylo.id});
                },self.errorDB);
         },self.errorDB);

    },

    //upload puzzle that is already solved.
    uploadSolutions:function(){
        var self = $.storage;
        var query =self.commands.query["select 3"];
        self.db.transaction(function(tx){
            tx.executeSql(query,["FALSE"],function(tx,results){
                    var len = results.rows.length;
                    self.uploadCount=len;
                    var i =0;
                    while(i<len){
                        var entry = results.rows.item(i);
                        var data = "mode="+entry.mode+"&id="+entry.level_id+"&user="+entry.player_id+"&align="+entry.sol_align+"&score="+entry.score;
                        console.log("upload:"+data);
                        $.ajax({
                            type: "POST",
                            url : $.protocal.url,
                            data : data
                        }).done(function(re){
                             //delete
                             self.uploadCount--;
                             if(self.uploadCount<=0){
                                 bootbox.alert("Thank you for uploading your saved puzzle to Phylo");
                                 self.uploadCount=0;
                             }
                             var query = self.commands.query["delete 1"];
                             self.db.transaction(function(tx){
                                    tx.executeSql(query,[entry.level_id,entry.player_id],
                                        null,self.errorDB);
                             },self.errorDB);

                        }).fail(function(re){
                            self.uploadCount--;
                            //nothing modify
                        });
                        i++;
                    }//end while
                },
                self.errorDB);
        },self.errorDB);
    },


  };
})();