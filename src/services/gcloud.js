import { logToConsole } from 'components/utils';

const platformClient = require('purecloud-platform-client-v2/dist/node/purecloud-platform-client-v2.js');
const client = platformClient.ApiClient.instance;
const usersApi = new platformClient.UsersApi();
const organizationsApi = new platformClient.OrganizationApi();
const architectApi = new platformClient.ArchitectApi();
const routingApi = new platformClient.RoutingApi();

const API_PAGE_SIZE = 100;
const SUPPORTED_MEDIA_DATATABLE_LABEL = 'Label';

export const GCloud = {
    consoleLogging: false,
    supportedMediaTypes_DataTableName: undefined,
    cloudRuntime: undefined,
    
    /**
     * Initialize GCX service with environment and valid token
     * @param {string} environment Environment endpoint (such as mypurecloud.com)
     * @param {string} token Valid GCX API bearer token
     */
    initialize: function(environment, token) {
        logToConsole(this.consoleLogging, 'GCX:initialization');
        client.setEnvironment(environment);
        client.setAccessToken(token);
    },

    /**
     * Retrieves current logged on user
     * @returns The current logged on user
     */
    getCurrentUser: async function() {
        try {
            logToConsole(this.consoleLogging, 'GCX:getCurrentUser:Start');
            const resultData = await usersApi.getUsersMe();
            logToConsole(this.consoleLogging, 'GCX:getCurrentUser:End', resultData);
            return resultData;    
        }
        catch (err) {
            logToConsole(true, 'GCX:getCurrentUser:Exception', err);
            throw (err);
        }
    },

    /**
     * Retrieves the current GCX cloud org to which user belongs
     * @returns GCX cloud organization object
     */
    getOrganization: async function() {
        try {
            logToConsole(this.consoleLogging, 'GCX:getOrganization:Start');
            const resultData = await organizationsApi.getOrganizationsMe();
            logToConsole(this.consoleLogging, 'GCX:getOrganization:End', resultData);
            return resultData;   
        }
        catch (err) {
            logToConsole(true, 'GCX:getOrganization:Exception', err);
            throw (err);
        }
    },

    /**
     * Retrieves full list of assigned queues to a given agent. Query pagination is taken care of automatically
     * @param {string} agentId The Agent ID
     * @returns Full list of agent assigned queues
     */
    getUserQueues: async function(agentId) {
        let rows = [];

        let _getUserQueues = async (pageNum) => {
            // Retrieve data for requested page
            let data = await usersApi.getUserQueues(agentId,
                {   pageSize: API_PAGE_SIZE,
                    pageNumber: pageNum,
                });
            logToConsole(this.consoleLogging, `GCX:getUserQueues:Page${pageNum}`, data);

            data.entities.forEach(row => {
                rows.push(row);
            });

            // Retrieve successive pages, if any
            if (data.pageNumber < data.pageCount) {
                return _getUserQueues(pageNum + 1);
            }
        }

        try {
            logToConsole(this.consoleLogging, 'GCX:getUserQueues:Start');
            await _getUserQueues(1);
            logToConsole(this.consoleLogging, 'GCX:getUserQueues:End', rows);
            return rows;
        }
        catch (err) {
            logToConsole(true, 'GCX:getUserQueues:Exception', err);
            throw(err);
        }
    },

    /**
     * Returns list of supported media types which are configured in a predefined DataTable
     * @returns List of media types (code and UI visible label)
     */
    getSupportedMediaTypes: async function() {
        try {
            // Note: NO row paging built in; just few rows (media types) are expected in datatable
            logToConsole(this.consoleLogging, 'GCX:getSupportedMediaTypes:Start');
            let resultSet = {};

            if (this.supportedMediaTypes_DataTableName) {
                // First, look up datatable based on name
                const datatableSearch = await architectApi.getFlowsDatatables({ 'name': this.supportedMediaTypes_DataTableName });
                if (datatableSearch) {
                    const datatableData = datatableSearch.entities.filter(datatable => datatable.name == this.supportedMediaTypes_DataTableName)
                    if (datatableData.length == 1) {
                        // Continue reading datatable rows when there's exactly one match
                        logToConsole(this.consoleLogging, 'GCX:getSupportedMediaTypes:RowData');
                        const rowDataSearch = await architectApi.getFlowsDatatableRows(datatableData[0].id, { showbrief: 'false' });
                        if ( (rowDataSearch) && (rowDataSearch.entities) && (rowDataSearch.entities.length > 0) ) {
                            // Add media type (key) and caption (custom field Label) to result list
                            rowDataSearch.entities.forEach(row => {
                                resultSet[`${row.key}`] = (row.hasOwnProperty(SUPPORTED_MEDIA_DATATABLE_LABEL) ? row[SUPPORTED_MEDIA_DATATABLE_LABEL] : row.key);
                            });
                        }
                        else {
                            logToConsole(this.consoleLogging, 'GCX:getSupportedMediaTypes:NoRowData', rowDataSearch);
                        }
                    }
                    else {
                        logToConsole(this.consoleLogging, 'GCX:getSupportedMediaTypes:DataTableNotFound', datatableSearch);
                    }
                }
                else {
                    logToConsole(this.consoleLogging, 'GCX:getSupportedMediaTypes:NoDataTable');
                }
            }
            else {
                logToConsole(this.consoleLogging, 'GCX:getSupportedMediaTypes:NoDataTableConfiguration');
            }
    
            logToConsole (this.consoleLogging, 'GCX:getSupportedMediaTypes:End', resultSet);
            return resultSet;
        }
        catch (err) {
            logToConsole (true, 'GCX:getSupportedMediaTypes:End', err);
            throw (err);
        }
    },

    /**
     * Updates queue joined status for an agent
     * @param {string} agentId The Agent ID to update
     * @param {array} newQueueStatusList List of Queue IDs and new joined status
     * @returns Result of API query
     */
    patchUserQueues: async function(agentId, newQueueStatusList) {
        try {
            logToConsole(this.consoleLogging, 'GCX:patchUserQueues:Start');
            const resultData = await routingApi.patchUserQueues(agentId, newQueueStatusList);
            logToConsole(this.consoleLogging, 'GCX:patchUserQueues:End', resultData);
            return resultData;
        }
        catch (err) {
            logToConsole(true, 'GCX:patchUserQueues:Exception', err);
            throw (err);
        }
    }
}
