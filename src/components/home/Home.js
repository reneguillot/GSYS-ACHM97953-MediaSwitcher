import React, { useEffect } from 'react';

import { useSelector } from 'react-redux';

// Services and utilities
import { GCloud } from 'services/gcloud';
import { logToConsole } from 'components/utils';

// Genesys Spark UI
import { GuxCardBeta, GuxInlineAlertBeta, GuxTableBeta, GuxToggle } from 'genesys-spark-components-react';
import { registerElements } from 'genesys-spark-components';
import 'genesys-spark-components/dist/genesys-webcomponents/genesys-webcomponents.css';
registerElements();

import './Home.css';

const Home = () => {
    const [queueList, setQueueList] = React.useState([]);
    const [configuredMediaTypes, setConfiguredMediaTypes] = React.useState([]);
    const [relevantMediaTypes, setRelevantMediaTypes] = React.useState([]);
    const [agentId, setAgentId] = React.useState(undefined);
    const [exception, setException] = React.useState(undefined);

    const debugMode = useSelector((state) => state.debugMode.value);

    /**
     * GuxToggle click event handler, immediately updating queue joined status
     * @param {GuxToggleCustomEvent<boolean>} e The event object, also including GuxToggle component reference
     * @param {string} mediaType The associated media type with the GuxToggle component
     * @returns 
     */
    const onToggleClick = (e, mediaType) => {
        updateQueueStatus(mediaType, e.detail);
        return;
    }

    /**
     * Determines whether a given queue is media type compliant. This check is based upon inspecting queue
     * name according to a naming convention consisting of different parts. Parts are divided with underscore:
     * - Part 1: country (code); usually two characters in UPPERcase, but not explicitly enforced
     * - Part 2: media type, should be a single word
     * - Part 3: department / topic / queue name; this last part may include underscore characters as well
     * @param {string} queueName Queue name
     * @param {array} supportedMediaTypes List of supported (configured) media types
     * @returns Undefined whenever queue name is not compliant, otherwise the media type itself
     */
    const isCompliantMediaTypeQueue = (queueName, supportedMediaTypes) => {
        const queueNameParts = queueName.split('_');
        if (queueNameParts.length >= 3) {
            const queueMediaType = queueNameParts[1].toLowerCase()
            return (supportedMediaTypes.hasOwnProperty(queueMediaType)) ? queueMediaType : undefined;
        }
        return undefined;
    }

    /**
     * From two lists (supported media types as configured and the list of agent queues), determine which list of media types
     * is applicable for this agent. This may be a subset of all supported media types
     * @param {array} thisQueueList The list of agent queues
     * @param {array} thisSupportedMediaTypes The list of (configured) supported media types
     * @returns List of relevant media types for the agent and join status (grouped by media type)
     */
    const filterApplicableMediaTypes = (thisQueueList, thisSupportedMediaTypes) => {
        let mediaTypes = [];

        for (let idx = 0; idx < thisQueueList.length; idx++) {
            const thisQueueName = thisQueueList[idx].name
            const thisQueueJoinStatus = thisQueueList[idx].joined

            const compliantMediaType = isCompliantMediaTypeQueue(thisQueueName, thisSupportedMediaTypes);
            if (compliantMediaType) {
                const filteredMediaType = mediaTypes.filter(mediaType => {
                    return mediaType.mediaType == compliantMediaType
                });

                if (filteredMediaType.length == 0) {
                    mediaTypes.push(
                    {   mediaType: compliantMediaType,
                        label: thisSupportedMediaTypes[compliantMediaType],
                        joinStatus: thisQueueJoinStatus
                    });
                }
            }
        }

        return mediaTypes;
    };

    /**
     * Update all queues related to given media type with given new queue joined status
     * @param {string} mediaType The media type to update queue status for
     * @param {boolean} newStatus The new queue joined status
     */
    const updateQueueStatus = async (mediaType, newStatus) => {
        try {
            logToConsole(debugMode, `Home:UpdateQueueStatus:Start - [${mediaType}] queues to new status [${newStatus}]`);

            if (agentId) {
                let newQueueStatusList = [];
                for (let idx = 0; idx < queueList.length; idx++) {
                    const thisQueueName = queueList[idx].name;
                    const thisQueueId = queueList[idx].id;
    
                    const compliantMediaType = isCompliantMediaTypeQueue(thisQueueName, configuredMediaTypes);
                    if (compliantMediaType == mediaType) {
                        newQueueStatusList.push({
                                id: thisQueueId,
                                joined: newStatus
                        });
                    }
                }
    
                await GCloud.patchUserQueues(agentId, newQueueStatusList);
                updateQueueList(newQueueStatusList);
                logToConsole(debugMode, 'Home:UpdateQueueStatus:End', newQueueStatusList);
            }
            else {
                logToConsole(debugMode, 'Home:UpdateQueueStatus:UnknownAgentId');
            }

            setException(undefined);
        }
        catch (err) {
            logToConsole(debugMode, 'Home:UpdateQueueStatus:Exception', err);
            setException(err);
        }
    };

    /**
     * Update the agent assigned list of queues with (one or more) new joined statuses
     * @param {array} newQueueStatusList List of queues with new joined status
     */
    const updateQueueList = (newQueueStatusList) => {
        let updatedList = queueList;
        updatedList = updatedList.map(queue => {
            const foundElement = newQueueStatusList.filter(newQueueStatus =>
                newQueueStatus.id == queue.id
            );
            if (foundElement.length == 1) {
                queue.joined = foundElement[0].joined;
            }
            
            return queue;
        });

        const relevantAgentMedia = filterApplicableMediaTypes(updatedList, configuredMediaTypes);
        setRelevantMediaTypes(relevantAgentMedia);
        setQueueList(updatedList);
    }

    useEffect(() => {
        const loadGCXData = async() => {
            try {
                const usersMeData = await GCloud.getCurrentUser();
                if (usersMeData.id) {
                    logToConsole(debugMode, 'Home:Init:AgentID', usersMeData.id);
                    setAgentId(usersMeData.id);
    
                    const userQueuesData = await GCloud.getUserQueues(usersMeData.id);
                    logToConsole(debugMode, 'Home:Init:UserQueues', userQueuesData);
                    setQueueList(userQueuesData);
    
                    const configuredMediaTypes = await GCloud.getSupportedMediaTypes();
                    logToConsole(debugMode, 'Home:Init:SupportedMediaTypes', configuredMediaTypes);
                    setConfiguredMediaTypes(configuredMediaTypes);
    
                    const relevantAgentMedia = filterApplicableMediaTypes(userQueuesData, configuredMediaTypes);
                    setRelevantMediaTypes(relevantAgentMedia);
                    logToConsole(debugMode, 'Home:Init:RelevantMediaTypes', relevantAgentMedia);
                }
            }
            catch (err) {
                console.log(err);
                setException(err);
            }
        }

        logToConsole(debugMode, 'Home:Init - Initializing Media Switcher');
        loadGCXData();
    }, []);

    return (
        <div>
            { exception && <GuxInlineAlertBeta accent='error'>{ exception.code } - {exception.message }</GuxInlineAlertBeta> }
            <h1>Media Switcher</h1>
            <GuxCardBeta className="toggle-area">
                { relevantMediaTypes.map(mediaType => (
                    <GuxToggle
                            key={ mediaType.mediaType }
                            checked={ mediaType.joinStatus }
                            id={ mediaType.mediaType }
                            checkedLabel={ mediaType.label }
                            uncheckedLabel={ mediaType.label }
                            onCheck={ e => onToggleClick(e, mediaType.mediaType) } />
                )) }
            </GuxCardBeta>
            <GuxTableBeta compact className="queue-status" hidden={ (!debugMode) } >
                <table slot="data">
                    <thead>
                        <tr>
                            <th>Queue</th>
                            <th>Joined</th>
                        </tr>
                    </thead>
                    <tbody>
                        { queueList.map(queue => (
                            <tr key={ queue.id }>
                                <td>{ queue.name }</td>
                                <td>{ (queue.joined ? 'Yes' : 'No') }</td>
                            </tr>
                        )) }
                    </tbody>
                </table>
            </GuxTableBeta>
        </div>
    );
}

export default Home;