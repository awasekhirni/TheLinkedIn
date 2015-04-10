var dateutil = require("../util/dateutil");
var AWS = require("aws-sdk");
var config = require("./../conf/config.js");
var moment = require("moment");

AWS.config.update({
    accessKeyId: config.awsConfig.accessKeyId,
    secretAccessKey: config.awsConfig.secretAccessKey,
    region: config.awsConfig.region
});
var db = new AWS.DynamoDB();
var tableName = "job";    //a table with name job created in dynamodb

/*
 * function to list all tables
db.listTables(function(err, data) {
  console.log(data.TableNames);
});
*/

//function to insert data into dynamodb table
putItem = function(jobid, title, company, location, details, created, modified,cb) {
   var item = {
      "jobid": { "S": jobid}
   };
   if (title) item.title = { "S": title };
   if (company) item.company = { "S": company }; 
   if (location) item.location = { "S": location };
   if (details) item.details = { "S": details }; 
   if (created) item.created = { "S": created };
   if (modified) item.modified = { "S": modified }; 
   //var itemJson = JSON.stringify(item);
   console.log(item);
    db.putItem({
       "TableName": tableName,
       "Item": item
    }, function(err, data) {
      if (err) {
        cb(err,data);
      } else {
        cb(null,data);
      }
    });
 };

//function called on posting a new job 
postJob = function(req,res){
  console.log(JSON.stringify(req.body));
  //read request parameters
    var jobid = moment.utc().format("YYYYMMDDHHmmssS");
    var company = "" + req.body.organisationid;
    var title = req.body.title;
    var location = req.body.location;
    var details = req.body.details;
    var created = "" + req.body.created;
    var modified = "" +  req.body.modified;


    //call function to insert new job in dynamo db
    putItem(jobid, title, company, location, details, created, modified,function(err, data) {
      if (err) {
        console.log(err);
        res.status(500).json({status : 500,message : "Error while adding job details"});
      } else {
        res.status(200).json({status : 200,message : "Successfull", response:data});
      }
    });
  
};

//function to delete data from the dynamodb table
 deleteItem = function(jobid,cb) {
    var item = {
       "jobid": { "S": jobid}
    };
    console.log(item);
     db.deleteItem({
        "TableName": tableName,
        "Key": item
     }, function(err, data) {
       if (err) {
         cb(err,data);
       } else {
         cb(null,data);
       }
     });
  };
  
//function called on posting a new job 
deleteJob = function(req,res){
	//read request parameters
	var jobid = req.body.jobid;

    //call function to delete a job in dynamo db
    deleteItem(jobid,function(err, data) {
      if (err) {
        console.log(err);
        res.status(500).json({status : 500,message : "Error while deleting job"});
      } else {
        res.status(200).json({status : 200,message : "Successfull", response:data});
      }
    });

};

exports.deleteJob=deleteJob
exports.deleteItem=deleteItem;
exports.postJob=postJob;
exports.putItem=putItem;