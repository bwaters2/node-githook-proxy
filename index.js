require('dotenv').config()
const express = require('express')
var bodyParser = require('body-parser');
var request = require('request');

const jenkins_host=process.env.JENKINS_BASE_URL.toString();
const jenkins_auth=process.env.JENKINS_AUTH.toString();
const jenkins_crumb=process.env.JENKINS_CRUMB.toString();
const jenkinJobBaseUrl = 'http://'+jenkins_auth+'@'+jenkins_host+'/job/dev_apis/job/build_pull_request/buildWithParameters?token=temp&'

//Configure the express server
const app = express()
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json())

//endpoint that acts as a proxy to jenkins - ideally recieves a postbody from a githook
//view sample-git-hook-event to understand what is in req.body
app.post('/jenkins/buildPullRequest', (req, res) =>{
    //parse req for the PRurl and send it 
     sendJenkinsJobRequest( req.body.pull_request.html_url, 
            function(responseFromClient){
                res.send(responseFromClient)
            }
        )        
    }
)

const port = 8085
app.listen(port, () => {
            console.log(`Pull Request Builder listening on ${port}!\n`+
             '\nconfiguration:Jenkins_host '+process.env.JENKINS_BASE_URL.toString()+
             '\nconfiguration: JENKINS_AUTH ' + process.env.JENKINS_AUTH.toString()+
             '\nconfiguration: JENKINS_CRUMB ' + process.env.JENKINS_CRUMB.toString()
            )
})


//HELPER METHODS - !should probably be in their own files and imported in

//This method forwards data to jenkins to run a job
function sendJenkinsJobRequest(PullRequestUrl, sendResponseToOriginalCaller){
        
    console.log("Sending PR to jenkins: " + PullRequestUrl)
    var jenkinsGetCallConfig = {
                uri: jenkinJobBaseUrl + 'url=' + PullRequestUrl ,
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Jenkins-Crumb': jenkins_crumb
                }
    }
            
    //utilize the request library to act as a proxy and return a response 
    request(jenkinsGetCallConfig, function (error, response) {
                var responseBody = response.body == '' ? "job started" : "problem starting job"
                sendResponseToOriginalCaller(responseBody)
                console.log("errors:" + error + "\nresponse: " + responseBody);
                return;
    });
}



//TODO generate a new crumb each time the server is started up, check readme for more info