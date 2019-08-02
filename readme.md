# Node Proxy server for processing github PR webhooks 
How to run this server:
 - from the repo root directory run ```npm install```
 - after install finishes run ``` node index.js ```
 
NOTE: Sensitive information is saved in a .env file, talk to the repo owner to obtain that information

## How this server utilizes a git webhook
Create a pull request github webhook that notifies only for pul request events
https://developer.github.com/v3/activity/events/types/#pullrequestevent

 - Confirm the payload.action ==  "opened"
 - on jenkins run a job against the event URL -> Payload.pull_request.html_url
 
  Jenkins needs a crumb and token for post calls
  generated token for user can be found in .env file as JENKINS_AUTH
  
  
  If the crumb is not working this is how to generate a new one
  
  example request url: http://JENKINS_AUTH@JENKINS_BASE_URL/crumbIssuer/api/json
  crumb response
{
    "_class": "hudson.security.csrf.DefaultCrumbIssuer",
    "crumb": "hidden",
    "crumbRequestField": "Jenkins-Crumb"
}
****************************************************************************

## POSTMAN CALL to emulate a webhook
URL
    http://JENKINS_AUTH@JENKINS_BASE_URL/job/dev_apis/job/build_pull_request/buildWithParameters?token=temp&url="invalid"

BODY
    refer to sample-git-hook-event
    
HEADERS
    CONTENT-TYPE: application/json
    Jenkins-Crumb: hidden

*********************************************************

## How jenkins post the result back to git hub
The code for this resides in jenkins_commons/var/PullRequestPipeline, but here is a brief overview

GIT API REQUEST EXAMPLE
https://api.github.com/repos/RepublicServicesRepository/j-api-integration-tests/pulls/55/reviews
BODY:
{
  "commit_id": "00d9b2218946253437c2cfa2eba80dabe40aab87",
  "body": "This is an automated request please dimiss.",
  "event": "REQUEST_CHANGES",
  "comments": [ 

  ]
}

HEADER: Authorization -> token USER_GIT_AUTH_TOKEN

