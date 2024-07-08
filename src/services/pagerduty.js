import moment from 'moment';
import { fetchWithRetries } from './fetchWrap';

// https://developer.pagerduty.com/api-reference/reference/events-v2/openapiv3.json/paths/~1enqueue/post
// https://developer.pagerduty.com/docs/events-api-v2/trigger-events/
export const triggerIncident = (incident) => {
    const details = {
        environment: process.env.NODE_ENV || '',
        awsRegion: process.env.REGION || '',
        awsAccountId: process.env.AWS_ACCOUNT_ID || '',
        solutionName: process.env.SOLUTION || '',
        origin: incident.source,
        httpStatusCode: incident.status,
    };

    // optional incident parameters
    if (incident.customerId) details.customerId = incident.customerId;
    if (incident.customerName) details.customerName = incident.customerName;
    if (incident.additionalInfo) details.additionalInfo = incident.additionalInfo;
    if (incident.deploymentName) details.deploymentName = incident.deploymentName;
    if (incident.deploymentId) details.deploymentId = incident.deploymentId;
    if (incident.solutionId) details.solutionId = incident.solutionId;
    if (incident.subscriptionId) details.subscriptionId = incident.subscriptionId;

    const url = `https://events.pagerduty.com/v2/enqueue`;

    return fetchWithRetries(url, {
        method: 'POST',
        body: JSON.stringify({
            payload: {
                summary: incident.summary,
                timestamp: moment.utc().format(),
                severity: incident.severity,
                source: incident.source,
                custom_details: details
            },
            routing_key: incident.routing_key,
            event_action: 'trigger'
        })
    }, '', false);
}

export default {
    triggerIncident
}