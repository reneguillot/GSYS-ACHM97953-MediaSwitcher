[TOC]

# Operations Development

Visit the link below to find useful information regarding AWS, deployments, and the code reviewal process.

[Operations Development](https://extranet.genesys.com/pages/viewpage.action?spaceKey=PS&title=Operations+Development+-+AWS+Cloud)

Additionally, please make sure you have updated this file to include the following required information from [Deployments & Procedures, & Practices](https://extranet.genesys.com/display/PS/Deployment+Procedures+and+Practices)

If you have any questions or concerns, please reach out your team lead or PSAWSRequests@genesys.com

## Solution Description

### Solution Overview
The Agent Media Switcher displays a set of switch (toggle) buttons for enabling agent assigned interaction Queues, grouped by media type. The set of toggle buttons is dynamically determined based on a set of preconfigured supported media types, and the actual set of Queues with which the agent is associated with (determined during login).

### Solution Components
* GUI (This application)
* No further custom backends, other than access to GCloud API

### Queue Naming Convention
Whether a Queue is dedicated for interaction of a specific media type is determined by inspecting its name, matching a given naming convention:

* Queue name consists of several different parts. Individual parts are divided with an underscore
* Part 1: country (code); usually it's two characters in UPPERcase, but not explicitly enforced
* Part 2: media type, should be a single word
* Part 3: department / topic / queue name; this last part may include underscore characters as well

### Preconfigured Supported Media Types
The set of supported media types is configured in a designated Data Table in GCloud named **MediaSwitcher_SupportedMediaTypes**. The Data Table name must be configured via the **supportedMediaTypes_DataTableName** custom property in the deployment instance of the *Customer Subscription Manager* tool. Refer to the GCloud Configuration Details section below regarding Data Table structure and (row) content.

### Debug Mode (Console Logging / Queue Status Overview)
The application contains functionality to optionally run in Debug mode. By default, Debug mode is disabled. Debug mode can be activated by adding a querystring parameter to the application URL:
```debug=true```

Whenever Debug mode is activated, additional logging appears in the browser console, as well as a simple overview table below the toggle buttons, listing all agent Queues and the respective join status per Queue.

## Customer Subscription Manager Details
* Solution Name: agent-media-switcher-ui
* Solution Type: Custom Application
* Child Solution: No
* Solution Hosting: AWS Hosted
* Solution Owner: René Guillot
* Solution Repository: https://bitbucket.org/GenesysCSP/94768-ingka-agent-media-switcher-ui
* Description: Custom UI offering agents to join/unjoin their assigned queues in bulk, based on media type (derived from queue name)

## GCloud Configuration Details

### OAuth
Create an OAuth client with the following details:

* App Name: Agent Media Switcher widget
* Description: Custom Agent Media Switcher UI for embedding as GCX widget
* Grant Type: Token Implicit Grant (Browser)
* Authorized redirect URIs (one per line): URL to web app
* Scopes: users-basic-info, organization:readonly, users, architect:readonly

### Client App
To add the application to Genesys Cloud UI, execute the following steps:

* Go to *Admin - Integration*. Search for *Client Application* and click the *Install* button
* Enter name (that will be visible for end users): Media Switcher
* Go to the *Configuration --> Properties* tab and fill the details:
  * Application URL: http://localhost:3000?environment={{pcEnvironment}}
  * Application Type: standalone
  * Application Category: *empty*
  * Iframe Sandbox Options: allow-scripts,allow-same-origin,allow-forms,allow-modals
  * Group Filtering: *no group selected*
* Click the *Save* button
* Set Status to *Active*

### Data Table
The Data Table for configuring supported media types should contain one custom field called **Label**. This custom field must be used to store a visual UI label text for the media type switch (toggle) buttons. The **key** row property is used to hold the (technical) media type name, as also found in the Queue names. The Data Table currently holds the following rows:

| Key   | Label           |
| ----- | --------------- |
| chat  | Chat            |
| email | E-mail          |
| voice | Voice Telephony |

## Developer Instructions (Visual Studio Code)
* Install dependencies (will take time to complete): `npm install`
* Serve Developer instance: `npm start`
* Build release: `npm run-script build`
* Version and build date administration:
  * In project_dir/package.json, update following values:
    * version
    * genesys_custom_software => builddate (date format: yyyy-MMM-dd)
* When building a release, version information (including build date) is automatically fetched from package.json and logged in browser console
* Keep Release Notes Markdown file up-to-date
