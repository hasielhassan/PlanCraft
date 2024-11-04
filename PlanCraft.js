/**
 * Adds a row to the sequence tasks table with the given parameters.
 * @param {string} name - The name of the task.
 * @param {number} duration - The duration of the task in days.
 * @param {array} dependencies - An array of task names that must be completed before this task can be completed.
 * @param {array} extraDependencies - An array of task names that are not in the same sequence as the task, but must be completed before this task can be completed.
 */
function addSequenceTask(name="", duration=5, dependencies=[], extraDependencies=[]) {
    const table = document.getElementById('sequenceTasksTable').getElementsByTagName('tbody')[0];
    addTaskRow(table, "Sequence", name, duration, dependencies, extraDependencies);
    // Call the function to adjust height
    adjustCollapsibleHeight();
}

/**
 * Adds a row to the appropriate asset tasks table based on the given type.
 * @param {string} type - The type of asset task ("env", "prop", or "char").
 * @param {string} name - The name of the task.
 * @param {number} duration - The duration of the task in days.
 * @param {array} dependencies - An array of task names that must be completed before this task can be completed.
 */
function addAssetTask(type="", name="", duration=5, dependencies=[]) {

    if (type === "env") {
        const table = document.getElementById('envAssetTasksTable').getElementsByTagName('tbody')[0];
        addTaskRow(table, "Env", name, duration, dependencies);
    } else if (type === "prop") {   
        const table = document.getElementById('propAssetTasksTable').getElementsByTagName('tbody')[0];
        addTaskRow(table, "Prop", name, duration, dependencies);
    } else if (type === "char") {
        const table = document.getElementById('charAssetTasksTable').getElementsByTagName('tbody')[0];
        addTaskRow(table, "Char", name, duration, dependencies);
    }
    // Call the function to adjust height
    adjustCollapsibleHeight();
}

/**
 * Adds a row to the appropriate shot tasks table based on the given type.
 * @param {string} type - The type of shot task ("simple" or "complex").
 * @param {string} name - The name of the task.
 * @param {number} duration - The duration of the task in days.
 * @param {array} dependencies - An array of task names that must be completed before this task can be completed.
 * @param {array} firstExtraDependencies - A first level array of task names that are not in the same sequence as the task, but must be completed before this task can be completed.
 * @param {array} secondExtraDependencies - A second level array of task names that are not in the same sequence as the task, but must be completed before this task can be completed.
 * 
 * The difference between first and second extra dependencies is that first ones are for asset tasks dependencies, and second ones are for sequence tasks dependencies.
 */
function addShotTask(type="", name="", duration=5, dependencies=[], firstExtraDependencies=[], secondExtraDependencies=[]) {

    if (type === "simple") {
        const table = document.getElementById('simpleShotTasksTable').getElementsByTagName('tbody')[0];
        addTaskRow(table, "SimpleShot", name, duration, dependencies, firstExtraDependencies, secondExtraDependencies);
    } else if (type === "complex") {
        const table = document.getElementById('complexShotTasksTable').getElementsByTagName('tbody')[0];
        addTaskRow(table, "ComplexShot", name, duration, dependencies, firstExtraDependencies, secondExtraDependencies);
    }
    // Call the function to adjust height
    adjustCollapsibleHeight();
}

/**
 * Adds a new row to the specified table with input fields for task details.
 * The function handles different types of tasks and their dependencies.
 *
 * @param {HTMLTableElement} table - The table to which the row should be added.
 * @param {string} type - The type of task ("SimpleShot", "ComplexShot", "Sequence", etc.).
 * @param {string} [name=""] - The name of the task. If not provided, a default name is generated.
 * @param {number} [duration=5] - The duration of the task in days.
 * @param {array} [dependencies=[]] - An array of task names that must be completed before this task.
 * @param {array} [firstExtraDependencies=[]] - A first array of additional dependencies, as the table or type requires.
 * @param {array} [secondExtraDependencies=[]] - A second array of additional dependencies, as the table or type requires.
 */
function addTaskRow(table, type, name="", duration=5, dependencies=[], 
    firstExtraDependencies=[], secondExtraDependencies=[]) {
    const row = table.insertRow(-1);
    const nameCell = row.insertCell();
    const durationCell = row.insertCell();
    const shotDependenciesCell = row.insertCell();

    if (!name) {
        name = `Task${type}${table.rows.length}`;
    }

    if (dependencies.length > 0) {
        dependencies = dependencies.join(",");
    } else {
        dependencies = "";
    }

    nameCell.innerHTML = `
        <input 
            type="text" 
            class="taskName" 
            placeholder="Task Name" 
            value="${name}"
        >
    `;
    durationCell.innerHTML = `
        <input 
            type="number" 
            class="taskDuration" 
            placeholder="Days Duration" 
            value="${duration}"
        >
    `;
    shotDependenciesCell.innerHTML = `
        <input 
            type="text" 
            class="taskDependencies" 
            placeholder="comma,separated" 
            value="${dependencies}"
        >
    `;
    //console.log("type: " + type);
    //console.log("firstExtraDependencies: " + firstExtraDependencies);
    if (["SimpleShot", "ComplexShot", "Sequence"].includes(type)) {
        //console.log("Doing first extra dependencies");
        //console.log("firstExtraDependencies: " + firstExtraDependencies.length);
        if (firstExtraDependencies.length > 0) {
            firstExtraDependencies = firstExtraDependencies.join(",");
        } else {
            firstExtraDependencies = "";
        }

        const assetDependenciesCell = row.insertCell();
        assetDependenciesCell.innerHTML = `
            <input 
                type="text" 
                class="asetTaskDependencies" 
                placeholder="comma,separated" 
                value="${firstExtraDependencies}"
            >
        `;
    }

    if (["SimpleShot", "ComplexShot"].includes(type)) {
        //console.log("Doing second extra dependencies");
        //console.log("secondExtraDependencies: " + secondExtraDependencies.length);
        if (secondExtraDependencies.length > 0) {
            secondExtraDependencies = secondExtraDependencies.join(",");
        } else {
            secondExtraDependencies = "";
        }

        const seqDependenciesCell = row.insertCell();
        seqDependenciesCell.innerHTML = `
            <input 
                type="text" 
                class="seqTaskDependencies" 
                placeholder="comma,separated" 
                value="${secondExtraDependencies}"
            >
        `;
    }

}

/**
 * Adds some default asset tasks with appropriate dependencies.
 * Environment ones: design -> model -> rig -> surface.
 * Character ones: design -> model -> rig -> groom -> surface.
 * Prop ones: design -> model -> rig -> surface.
 */
function addDefaultAssetTasks() {
    // Environment ones
    addAssetTask("env", "design", 15);
    addAssetTask("env", "model", 15, ["design"]);
    addAssetTask("env", "rig", 1, ["model"]);
    addAssetTask("env", "surface", 15, ["model"]);

    addAssetTask("char", "design", 10);
    addAssetTask("char", "model", 10, ["design"]);
    addAssetTask("char", "rig", 10, ["model"]);
    addAssetTask("char", "groom", 10, ["model"]);
    addAssetTask("char", "surface", 10, ["model", "groom"]);
    
    addAssetTask("prop", "design", 5);
    addAssetTask("prop", "model", 5, ["design"]);
    addAssetTask("prop", "rig", 5, ["model"]);
    addAssetTask("prop", "surface", 5, ["model"]);
}

/**
 * Adds some default shot tasks with appropriate dependencies.
 * Simple shots: animation -> simulation -> lighting -> comp.
 * Complex shots: animation -> simulation -> fx -> lighting -> comp.
 */
function addDefaultShotTasks() {
    addShotTask("simple", "animation", 5, [], ["rig"], ["layout"]);
    addShotTask("simple", "simulation", 5, ["animation"], ["groom"]);
    addShotTask("simple", "lighting", 5, ["animation", "simulation"], ["surface"]);
    addShotTask("simple", "comp", 5, ["lighting"]);

    addShotTask("complex", "animation", 10, [], ["rig"], ["layout"]);
    addShotTask("complex", "simulation", 10, ["animation"], ["groom"]);
    addShotTask("complex", "fx", 10, ["animation"]);
    addShotTask("complex", "lighting", 10, ["animation", "simulation", "fx"], ["surface"]);
    addShotTask("complex", "comp", 10, ["lighting"]);
}

/**
 * Adds some default sequence tasks with appropriate dependencies.
 * Sequence ones: story -> layout.
 */
function addDefaultSequenceTasks() {
    addSequenceTask("story", 5, [], []);
    addSequenceTask("layout", 5, ["story"], ["rig", "model"]);
}

/**
 * Adjusts the height of all collapsible blocks that are currently expanded.
 * This is needed because the initial height is set to 0, and we want to
 * allow the content to expand to its natural height.
 */
function adjustCollapsibleHeight() {
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
        if (coll[i].classList.contains("active")) { // Only adjust if the block is expanded
            var content = coll[i].nextElementSibling;
            content.style.maxHeight = content.scrollHeight + 20 + "px";
        }
    }
}


/**
 * Shuffles an array in place, modifying the original array. 
 * The Fisher-Yates shuffle algorithm is used.
 * @param {Array} array The array to shuffle.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));   
        [array[i], array[j]] = [array[j], array[i]];
    }

    return array;
}


/**
 * Generates an array of strings where each string is repeated a number of times
 * given by its corresponding value in the input dictionary.
 * The array is then shuffled in place.
 * @param {Object} inputDict A dictionary where the keys are strings and the values
 * are numbers representing the number of times each string should appear in the
 * output array.
 * @returns {Array<string>} An array of strings where each string is repeated a number
 * of times given by its corresponding value in the input dictionary.
 */
function generateStringList(inputDict) {
    let stringList = [];
    for (const string in inputDict) {
        for (let i = 0; i < inputDict[string]; i++) {
            stringList.push(string);
        }
    }
  
    // Shuffle the array
    shuffleArray(stringList);
  
    return stringList;
}


/**
 * Randomly distributes items across multiple groups, ensuring each group receives
 * a random number of items up to a specified maximum. After the initial distribution,
 * any remaining items are assigned to groups in order until all items are distributed.
 *
 * @param {Array} items - The array of items to be distributed among groups.
 * @param {Array} groups - The array of groups to which the items will be assigned.
 * @param {number} [max_items_per_group=5] - The maximum number of items each group can initially receive.
 * @returns {Object} An object where keys are group names and values are arrays of items assigned to each group.
 */
function randomlyDistributeItems(items, groups, max_items_per_group=5) {
    const groupAssignments = {};

    // Shuffle the items first
    shuffleArray(items);
  
    let itemIndex = 0;
  
    // Assign initial items to groups
    for (const group of groups) {
        groupAssignments[group] = [];
        const numItems = Math.floor(Math.random() * max_items_per_group) + 1;
        for (let i = 0; i < numItems && itemIndex < items.length; i++) {
            groupAssignments[group].push(items[itemIndex]);
            itemIndex++;
        }
    }
  
    // Assign remaining items to groups in order
    while (itemIndex < items.length) {
        for (const group of groups) {
            if (itemIndex < items.length) {
                groupAssignments[group].push(items[itemIndex]);
                itemIndex++;
            }
        }
    }
  
    return groupAssignments;
}

/**
 * Extracts tasks from HTML tables with a specified class name and organizes them into an object.
 * Each task includes a name, duration, dependencies, and optionally additional dependencies
 * based on the entity type (simple-shot, complex-shot, simple-sequence).
 *
 * @param {string} className - The class name of the tables from which tasks are extracted.
 * @returns {Object} An object mapping entity types to arrays of task objects, where each task
 * object contains details such as name, duration, dependencies, and any extra dependencies.
 */
function getTablesTasks(className) {
    //console.log("Getting tasks from: " + className);
    const tables = document.getElementsByClassName(className);
    const allTablesTasks = {};
    // Loop through each table
    for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        //console.log(table);
        const entityType = table.getAttribute('data-entity-type');
        //console.log(entityType);
        allTablesTasks[entityType] = [];
        // Loop through each row
        //console.log("table.rows: " + table.rows.length);
        for (let j = 1; j < table.rows.length; j++) {
            const row = table.rows[j];
            //console.log(row);
            // Extract task details
            allTablesTasks[entityType].push({
                name: row.cells[0].querySelector('.taskName').value,
                duration: parseInt(row.cells[1].querySelector('.taskDuration').value),
                dependencies: row.cells[2].querySelector('.taskDependencies').value.split(','),
                // Only add first extra dependencies for shots and sequences
                ... ( ["simple-shot", "complex-shot", "simple-sequence"].includes(entityType) && {
                    firstExtraDependencies: row.cells[3].querySelector('.asetTaskDependencies').value.split(',')
                }),
                // Only add second extra dependencies for shots
                ... ( ["simple-shot", "complex-shot"].includes(entityType) && {
                    secondExtraDependencies: row.cells[4].querySelector('.seqTaskDependencies').value.split(',')
                })
            });
        };
    };
    //console.log("allTablesTasks:")
    //console.log(allTablesTasks);
    return allTablesTasks
}

/**
 * Adds a resource class to the OSF structure if it does not already exist.
 * @param {Object} osf - The OSF structure.
 * @param {string} taskName - The name of the task.
 * @returns {Object} The resource class object created or found.
 */
function addResourceClass(osf, taskName) {

    let resourceClass = getOsfResourceClass(osf, taskName);
    //console.log(resourceClass);
    if (resourceClass) {
        return resourceClass;
    }   

    const resourceId = `resource_${osf.snapshot.resourceClasses.length + 1}`;
    resourceClass = {"id": resourceId,"name": taskName}
    osf.snapshot.resourceClasses.push(resourceClass);
    //console.log("Created resource class: " + resourceClass);

}

/**
 * Finds the resource class with the given task name in the OSF structure.
 * @param {Object} osf - The OSF structure.
 * @param {string} taskName - The name of the task.
 * @returns {string} The id of the resource class object if found, undefined otherwise.
 */
function getOsfResourceClass(osf, taskName) {
    for (let i = 0; i < osf.snapshot.resourceClasses.length; i++) {
        if (osf.snapshot.resourceClasses[i].name === taskName) {
            return osf.snapshot.resourceClasses[i].id;
        }
    }
}

/**
 * Generates asset activities for the OSF structure based on the given asset tasks.
 * @param {Object} osf - The OSF structure.
 * @param {number} numEnvAssets - The number of environment assets.
 * @param {number} numCharAssets - The number of character assets.
 * @param {number} numPropAssets - The number of prop assets.
 * @param {Object} assetTasks - The templated asset tasks, with each key being an asset type
 *                              and the value being an array of asset tasks.
 * @returns {Object} The asset activities object with the generated activities.
 */
function generateAssetActivities(osf, numEnvAssets, numCharAssets, numPropAssets, assetTasks) {

    let assetActivities = [];

    const assetTypesCounts = {
        "env": numEnvAssets,
        "char": numCharAssets,
        "prop": numPropAssets
    };

    //console.log(assetTypesCounts);

    for (let x = 0; x < Object.keys(assetTypesCounts).length; x++) {

        let assetType = Object.keys(assetTypesCounts)[x];
        let assetTypeTasks = assetTasks[assetType];
        let assetTypeCount = assetTypesCounts[assetType];
        let assetTypeActivities = [];

        //console.log(assetType);
        //console.log(assetTypeCount);

        for (let assetNum = 1; assetNum <= assetTypeCount; assetNum++) {
            let assetTasksWithIds = [];
            for (let j = 0; j < assetTypeTasks.length; j++) {
    
                // Create a mapping of task names to their IDs for dependency resolution
                const assetTaskNameToId = {};
                for (let j = 0; j < assetTypeTasks.length; j++) {
                    assetTaskNameToId[assetTypeTasks[j].name] = `asset_${assetType}_${assetNum}_task_${assetTypeTasks[j].name}`;
                }
    
                let dependencies = assetTypeTasks[j].dependencies.map(dep => {
                    // Resolve dependency using the task name mapping
                    const depName = dep.trim();
                    // Return empty string if dependency not found
                    return assetTaskNameToId[depName] || ""; 
                }).filter(dep => dep !== ""); // Remove invalid dependencies
    
                assetTasksWithIds.push({
                    "id": `asset_${assetType}_${assetNum}_task_${assetTypeTasks[j].name}`,
                    "name": assetTypeTasks[j].name,
                    "task": {
                        "duration": assetTypeTasks[j].duration,
                        "resources": [
                            {
                                "resource": getOsfResourceClass(osf, assetTypeTasks[j].name), 
                                "units": 1
                            }
                        ]
                    },
                    "dependencies": dependencies
                });
            }
            assetTypeActivities.push({
                "id": `asset_${assetType}_${assetNum}`,
                "name": `Asset ${assetType} ${assetNum}`,
                "category": "Asset",
                "summary": assetTasksWithIds
            });
        };
        
        assetActivities.push({
            "id": `${assetType}`,
            "name": `${assetType}`,
            "category": "Asset",
            "summary": assetTypeActivities
        });
    };
    return assetActivities
}

/**
 * Calculates a random set of asset indexes for each asset type, given the
 * max number of dependencies for each type and the total number of assets of
 * each type.
 * @param {Object} assetTypesCounts - An object with asset types as keys and
 * the number of assets of that type as value.
 * @param {Object} assetTypesDependencyCounts - An object with asset types as
 * keys and the max number of dependencies for that type as value.
 * @returns {Object} An object with asset types as keys and an array of random
 * asset indexes of that type as value.
 * 
 * @example
 * const assetTypesCounts = {
 *     "env": 30,
 *     "char": 20,
 *     "prop": 10
 * };
 * const assetTypesDependencyCounts = {
 *     "env": 1,
 *     "char": 3,   
 *     "prop": 2
 * };
 * const assetIndexes = calculateRandomAssetIndexes(
 *      assetTypesCounts, assetTypesDependencyCounts
 * );
 * //console.log(assetIndexes);
 * {
 *     "env": [18],
 *     "char": [5, 12, 20],
 *     "prop": [1, 8]
 * }
 */
function calculateRandomAssetIndexes(assetTypesCounts, assetTypesDependencyCounts) {
    let assetIndexes = {};
    for (let assetType in assetTypesCounts) {
        let maxAssetCount = assetTypesDependencyCounts[assetType];
        let assetTypeCount = assetTypesCounts[assetType];
        // Get random number of asset dependencies between 0 and maxAssetCount
        let numAssetDependencies = Math.min(1, maxAssetCount) +1 ;
        let assetIndexesForType = [];
        for (let l = 0; l < numAssetDependencies; l++) {
            let randomAssetIndex;
            do {
                randomAssetIndex = Math.floor(Math.random() * assetTypeCount) + 1;
            } while (
                assetIndexesForType.includes(randomAssetIndex)
            );
            assetIndexesForType.push(randomAssetIndex);
        }
        assetIndexes[assetType] = assetIndexesForType;
    }
    return assetIndexes;
}

/**
 * Resolves the asset dependencies for a given entity task.
 * @param {object} entityTask - The entity task for which to resolve the asset dependencies.
 * @param {object} assetTasks - The asset tasks, with each key being a type of asset 
 *                              and the value being an array of asset tasks.
 * @param {object} assetTypesCounts - The count of each asset type, with each key being a type of asset
 *                                    and the value being the number of assets of that type.
 * @param {object} assetTypesDependencyCounts - The number of dependencies for each asset type, with each key being a type of asset
 *                                              and the value being the number of dependencies for that type.
 * @param {object} assetTypesIndexes - The indexes of the assets to use for each asset type, with each key being a type of asset
 *                                     and the value being an array of indexes.
 * @returns {array} The resolved asset dependencies as an array of strings.
 */
function resolveAssetDependencies(
    entityTask, assetTasks, assetTypesCounts=null, assetTypesDependencyCounts=null, assetTypesIndexes=null
) {
    let assetDependencies = [];

    // Validate that either assetTypesCounts and assetTypesIndexes 
    // is provided or that assetTypesIndexes is provided
    if (!assetTypesCounts && !assetTypesIndexes) {
        throw new Error(
            "Either assetTypesCounts and assetTypesDependencyCounts, or assetTypesIndexes must be provided"
        );
    }

    if (!assetTypesIndexes) {
        // validate that assetTypesCounts and assetTypesDependencyCounts are provided
        if (!assetTypesCounts || !assetTypesDependencyCounts) {
            throw new Error(
                "Both assetTypesCounts and assetTypesDependencyCounts must be provided"
            );
        }
        assetTypesIndexes = calculateRandomAssetIndexes(assetTypesCounts, assetTypesDependencyCounts);
    }

    for (let assetType in assetTypesIndexes) {
        let assetTypeTasks = assetTasks[assetType];
        let assetIndexesForType = assetTypesIndexes[assetType];

        for (let l = 0; l < assetIndexesForType.length; l++) {
            let randomAssetIndex = assetIndexesForType[l];

            // Get the asset dependencies specified in the UI
            //console.log(entityTask);
            let assetDepNames = entityTask.firstExtraDependencies;
            //console.log(assetDepNames);
            // Find matching asset tasks
            assetDepNames.forEach(depName => {
                depName = depName.trim();
                for (let n = 0; n < assetTypeTasks.length; n++) {
                    // Check if the asset task name is the dependency name
                    if (assetTypeTasks[n].name == depName) {
                        assetDependencies.push(
                            `asset_${assetType}_${randomAssetIndex}_task_${assetTypeTasks[n].name}`
                        );
                        break; // Move to the next dependency name once a match is found
                    }
                }
            });
        }
    }

    return assetDependencies;
}

/**
 * Generates the activities for each episode based on the given parameters.
 * @param {Object} osf - The OSF structure.
 * @param {number} numEpisodes - The number of episodes.
 * @param {number} shotsPerEpisode - The number of shots per episode.
 * @param {number} complexShotsPercentagePerEpisode - The percentage number of complex shots per episode.
 * @param {Object} shotTypesTasks - The templated shot tasks, with each key being a shot type
 *                                  and the value being an array of shot tasks.
 * @param {number} sequencesPerEpisode - The number of sequences per episode.
 * @param {Object} sequenceTypesTasks - The templated sequence tasks, with each key being a sequence type
 *                                 and the value being an array of sequence tasks.
 * @param {number} numEnvAssets - The number of environment assets.
 * @param {number} numCharAssets - The number of character assets.
 * @param {number} numPropAssets - The number of prop assets.
 * @param {Object} assetTasks - The templated asset tasks, with each key being an asset type
 *                              and the value being an array of asset tasks.
 * @returns {Object} The episode activities object with the generated activities.
 */
function generateEpisodeActivities(
    osf, numEpisodes, shotsPerEpisode, complexShotsPercentagePerEpisode, shotTypesTasks,
    sequencesPerEpisode, sequenceTypesTasks,
    numEnvAssets, numCharAssets, numPropAssets, assetTasks
) {
    let episodeActivities = [];

    // Define a data structure to store the number of assets of each type
    let assetTypesCounts = {
        "env": numEnvAssets,
        "char": numCharAssets,
        "prop": numPropAssets
    };

    // Generate a radom number of complex shots per episode
    // using the complexShotsPercentagePerEpisode input for the whole project
    // the data will be a dictionary per episode number and the 
    // value will be the number of complex shots
    let complexShotsPerEpisodeCounts = {};
    for (let i = 1; i <= numEpisodes; i++) {
        let randomPercentage = Math.floor(Math.random() * complexShotsPercentagePerEpisode) + 1;
        complexShotsPerEpisodeCounts[i] = Math.round((shotsPerEpisode * randomPercentage)/100) +1;
    }
    //console.log("shotsPerEpisode: " + shotsPerEpisode);
    //console.log("complexShotsPerEpisodeCounts:");
    //console.log(complexShotsPerEpisodeCounts);

    for (let epiNum = 1; epiNum <= numEpisodes; epiNum++) {
        
        let episodeID = `episode_${epiNum}`;
        //console.log("episodeID: " + episodeID);

        // Define a list of simple and complex shots for this episode
        let episodeSimpleShotsCount = shotsPerEpisode - complexShotsPerEpisodeCounts[epiNum];

        //console.log("episodeSimpleShotsCount: " + episodeSimpleShotsCount);
        //console.log("episodeComplexShotsCount: " + complexShotsPerEpisodeCounts[epiNum]);

        let episodeShotsTypes = generateStringList(
            {
                "simple": episodeSimpleShotsCount, 
                "complex": complexShotsPerEpisodeCounts[epiNum]
            },
        );
        //console.log("episodeShotsTypes:");
        //console.log(episodeShotsTypes);

        // Divide the shots among the episode sequences
        //let shotsPerSequence = Math.floor(shotsPerEpisode / sequencesPerEpisode);

        // Make a list of sequences with the same number of shots but with random
        // assignment of simple and complex shots
        let sequences = [];
        for (let j = 1; j <= sequencesPerEpisode; j++) {
            sequences.push("Sequence " + j);
        }
        //console.log("sequences:");
        //console.log(sequences);

        let sequencesAndShots = randomlyDistributeItems(episodeShotsTypes, sequences);

        //console.log("sequencesAndShots:");
        //console.log(sequencesAndShots);
        
        let sequenceActivities = [];

        // we know we only have one single sequence type at the moment
        let sequenceTasks = sequenceTypesTasks["simple-sequence"];

        // iterate over the sequencesAndShots dictionary
        for (let seqNum = 1; seqNum < Object.keys(sequencesAndShots).length +1; seqNum++) {
            let sequence = Object.keys(sequencesAndShots)[seqNum-1];
            let sequenceShotsTypes = sequencesAndShots[sequence];

            let sequenceID = `episode_${epiNum}_sequence_${seqNum}`;
            //console.log("sequenceID: " + sequenceID);

            //console.log("sequence: " + sequence);
            //console.log("sequenceShotsTypes: ")
            //console.log(sequenceShotsTypes);

            sequenceContainerActivities = [];
        
            // Define a data structure to store the number 
            // of assets dependencies of each type for this sequence
            let assetTypesDependencyCounts = {
                "env": 1,
                "char": 5,
                "prop": 5
            };

            // pre-calculate random asset indexes for each asset type for this 
            // sequence so that we can reuse them for both sequence and shots 
            sequenceAssetTypesIndexes = calculateRandomAssetIndexes(
                assetTypesCounts, assetTypesDependencyCounts
            );

            let sequenceTasksWithIds = [];

            // iterate over sequence tasks
            //console.log("sequenceTasks.length: " + sequenceTasks.length);
            for (let tskIndex = 0; tskIndex < sequenceTasks.length; tskIndex++) {
                // Create a mapping of task names to their IDs for dependency resolution
                const sequenceTaskNameToId = {};
                for (let m = 0; m < sequenceTasks.length; m++) {
                    sequenceTaskNameToId[sequenceTasks[m].name] = 
                        `episode_${epiNum}_sequence_${seqNum}_task_${sequenceTasks[m].name}`
                    ;
                }

                let dependencies = sequenceTasks[tskIndex].dependencies.map(dep => {
                    // Resolve dependency using the task name mapping
                    const depName = dep.trim();
                    // Return empty string if dependency not found
                    return sequenceTaskNameToId[depName] || ""; 
                }).filter(dep => dep !== ""); // Remove invalid dependencies


                // resolve a list of asset dependencies for this sequence task
                let sequenceAssetDependencies = resolveAssetDependencies(
                    sequenceTasks[tskIndex], assetTasks, null, null, sequenceAssetTypesIndexes
                );

                sequenceTasksWithIds.push({
                    "id": `episode_${epiNum}_sequence_${seqNum}_task_${sequenceTasks[tskIndex].name}`,
                    "name": sequenceTasks[tskIndex].name,
                    "task": {
                        "duration": sequenceTasks[tskIndex].duration,
                        "resources": [
                            {
                                "resource": getOsfResourceClass(osf, sequenceTasks[tskIndex].name), 
                                "units": 1
                            }
                        ]
                    },
                    // Combine shot and asset dependencies
                    "dependencies": dependencies.concat(sequenceAssetDependencies)
                });

            }

            sequenceContainerActivities.push({
                "id": `episode_${epiNum}_sequence_${seqNum}_tasks_container`,
                "name": `Episode ${epiNum} Sequence ${seqNum} Tasks`,
                "category": "SequenceTasksContainer",
                "summary": sequenceTasksWithIds
            });

            // iterate over sequence shots
            let shotActivities = [];
            for (let shtNum = 1; shtNum <= sequenceShotsTypes.length; shtNum++) {
                let shotTasksWithIds = [];
                let shotType = sequenceShotsTypes[shtNum - 1];
                let shotTasks;

                let shotID = `episode_${epiNum}_sequence_${seqNum}_${shotType}_shot_${shtNum}`;
                //console.log("shotID: " + shotID);

                //console.log(shotType);
                if (shotType == "complex") {
                    shotTasks = shotTypesTasks["complex-shot"];
                } else {
                    shotTasks = shotTypesTasks["simple-shot"];
                };
                //console.log(shotTasks);
                // iterate over shot tasks
                for (let tskIndex = 0; tskIndex < shotTasks.length; tskIndex++) {

                    // Create a mapping of task names to their IDs for dependency resolution
                    const shotTaskNameToId = {};
                    for (let m = 0; m < shotTasks.length; m++) {
                        shotTaskNameToId[shotTasks[m].name] = 
                            `episode_${epiNum}_sequence_${seqNum}_${shotType}_shot_${shtNum}_task_${shotTasks[m].name}`
                        ;
                    }

                    let dependencies = shotTasks[tskIndex].dependencies.map(dep => {
                        // Resolve dependency using the task name mapping
                        const depName = dep.trim();
                        // Return empty string if dependency not found
                        return shotTaskNameToId[depName] || ""; 
                    }).filter(dep => dep !== ""); // Remove invalid dependencies

                    // resolve a list of asset dependencies for this shot task
                    // start from the pre calculated sequence asset types indexes
                    // but now randombly select a subset of indexes for each type
                    let shotAssetTypesIndexes = {
                        "env": shuffleArray(
                            sequenceAssetTypesIndexes["env"]
                        ).slice(0, 1)
                        ,
                        "char": shuffleArray(
                            sequenceAssetTypesIndexes["char"]
                        ).slice(0, Math.floor(Math.random() * 3) + 1)
                        ,
                        "prop": shuffleArray(
                            sequenceAssetTypesIndexes["prop"]
                        ).slice(0, Math.floor(Math.random() * 3) + 1)
                    };

                    // resolve a list of asset dependencies for this shot task
                    let shotAssetDependencies = resolveAssetDependencies(
                        shotTasks[tskIndex], assetTasks, null, null, shotAssetTypesIndexes
                    );

                    // Get the sequence dependencies specified in the UI
                    let sequenceDependencies = [];
                    let seqDepNames = shotTasks[tskIndex].secondExtraDependencies;
                    //console.log(seqDepNames);
                    // Find matching asset tasks
                    seqDepNames.forEach(depName => {
                        depName = depName.trim();
                        for (let n = 0; n < sequenceTasks.length; n++) {
                            // Check if the asset task name is the dependency name
                            if (sequenceTasks[n].name == depName) {
                                sequenceDependencies.push(
                                    `episode_${epiNum}_sequence_${seqNum}_task_${sequenceTasks[n].name}`
                                );
                                break; // Move to the next dependency name once a match is found
                            }
                        }
                    });

                    // Create the shot task
                    shotTasksWithIds.push({
                        "id": `episode_${epiNum}_sequence_${seqNum}_${shotType}_shot_${shtNum}_task_${shotTasks[tskIndex].name}`,
                        "name": shotTasks[tskIndex].name,
                        "task": {
                            "duration": shotTasks[tskIndex].duration,
                            "resources": [
                                {
                                    "resource": getOsfResourceClass(osf, shotTasks[tskIndex].name), 
                                    "units": 1
                                }
                            ]
                        },
                        // Combine shot, sequence and asset dependencies
                        "dependencies": dependencies.concat(sequenceDependencies).concat(shotAssetDependencies)
                    });
                }
                shotActivities.push({
                    "id": shotID,
                    "name": `Episode ${epiNum} Sequence ${seqNum} Shot ${shtNum}`,
                    "category": "Shot",
                    "summary": shotTasksWithIds
                });
                shotActivities
            };

            sequenceContainerActivities.push({
                "id": `episode_${epiNum}_sequence_${seqNum}_shots_container`,
                "name": `Episode ${epiNum} Sequence ${seqNum} Shots`,
                "category": "SequenceShotsContainer",
                "summary": shotActivities
            });

            sequenceActivities.push({
                "id": sequenceID,
                "name": `Episode ${epiNum} ${sequence}`,
                "category": "Sequence",
                "summary": sequenceContainerActivities
            });
        };
        episodeActivities.push({
            "id": episodeID,
            "name": `Episode ${epiNum}`,
            "category": "Episode",
            "summary": sequenceActivities
        });
    };
    return episodeActivities
}

function generateOSF() {

    const numEpisodes = parseInt(document.getElementById("numEpisodes").value);
    const shotsPerEpisode = parseInt(document.getElementById("shotsPerEpisode").value);
    const complexShotsPerEpisode = parseInt(document.getElementById("complexShotsPerEpisode").value);
    const sequencesPerEpisode = parseInt(document.getElementById("sequencesPerEpisode").value);
    const numEnvAssets = parseInt(document.getElementById("numEnvAssets").value);
    const numCharAssets = parseInt(document.getElementById("numCharAssets").value);
    const numPropAssets = parseInt(document.getElementById("numPropAssets").value);

    //console.log("numEpisodes: " + numEpisodes);
    //console.log("shotsPerEpisode: " + shotsPerEpisode);
    //console.log("complexShotsPerEpisode: " + complexShotsPerEpisode);
    //console.log("sequencesPerEpisode: " + sequencesPerEpisode);
    //console.log("numEnvAssets: " + numEnvAssets);
    //console.log("numCharAssets: " + numCharAssets);
    //console.log("numPropAssets: " + numPropAssets);

    // Get Asset tasks
    const assetTasks = getTablesTasks("assets-tasks-table");
    // Get Shot tasks
    const shotTasks = getTablesTasks("shots-tasks-table");
    // Get Sequence tasks
    const sequenceTasks = getTablesTasks("sequence-tasks-table");

    // Create OSF structure
    const osf = { 
        "snapshot": {
            "description": "Generated OSF",
            "dayDuration": 28800, 
            "calendars": [], 
            "calendar": {},  
            "resourceClasses": [], 
            "projects": [
                {
                    "id": "project_1",
                    "name": "Generated Project",
                    "calendar": {},  
                    "activities": [] 
                }
            ]
        }
    };
    
    // Generate the resources from task names for each type of the tables
    // considering that the tasks objects are dictionaries of types
    //console.log("Generating resource classes...");
    //console.log("assetTasks: " + Object.keys(assetTasks).length);
    //console.log("shotTasks: " + Object.keys(shotTasks).length);
    //console.log("sequenceTasks: " + Object.keys(sequenceTasks).length);
    for (let i = 0; i < Object.keys(assetTasks).length; i++) {
        let assetType = Object.keys(assetTasks)[i];
        assetTasks[assetType].forEach(task => addResourceClass(osf, task.name));
    }
    for (let i = 0; i < Object.keys(shotTasks).length; i++) {
        let shotType = Object.keys(shotTasks)[i];
        shotTasks[shotType].forEach(task => addResourceClass(osf, task.name));
    }
    for (let i = 0; i < Object.keys(sequenceTasks).length; i++) {
        let sequenceType = Object.keys(sequenceTasks)[i];
        sequenceTasks[sequenceType].forEach(task => addResourceClass(osf, task.name));
    }

    //console.log("resourceClasses: " + osf.snapshot.resourceClasses);

    // Generate asset activities
    //console.log("Generating asset activities...");
    const assetActivities = generateAssetActivities( 
        osf, numEnvAssets, numCharAssets, numPropAssets, assetTasks
    );
    osf.snapshot.projects[0].activities.push({
        "id": "assets",
        "name": "Assets",
        "summary": assetActivities
    });

    // Generate episodes shot activities
    //console.log("Generating episode episode activities...");
    const episodeActivities = generateEpisodeActivities(
        osf, numEpisodes, shotsPerEpisode, complexShotsPerEpisode, shotTasks,
        sequencesPerEpisode, sequenceTasks,
        numEnvAssets, numCharAssets, numPropAssets, assetTasks
    );
    osf.snapshot.projects[0].activities.push({
        "id": "episode_shots",
        "name": "Episode Shots",
        "summary": episodeActivities
    });

    // Global calendar settings
    const globalCalendar = {
        "id": "global_calendar", 
        "name": "Global Calendar", 
        "workweek": {
            "monday": parseInt(document.getElementById("monday").value),
            "tuesday": parseInt(document.getElementById("tuesday").value),
            "wednesday": parseInt(document.getElementById("wednesday").value),
            "thursday": parseInt(document.getElementById("thursday").value),
            "friday": parseInt(document.getElementById("friday").value),
            "saturday": parseInt(document.getElementById("saturday").value),
            "sunday": parseInt(document.getElementById("sunday").value)
        },
        "exceptions": []
    };

    // Add global calendar to the calendars array
    osf.snapshot.calendars.push(globalCalendar); 

    // Add project calendar with base and overrides
    osf.snapshot.projects[0].calendar = {
        "base": "global_calendar",
        "workweek": globalCalendar.workweek
    };

    // Add global calendar to the main calendar
    osf.snapshot.calendar = globalCalendar; 

    // Generate and download JSON file
    //console.log("Generating and downloading JSON file...");
    const osfJSON = JSON.stringify(osf, null, 2);
    const blob = new Blob([osfJSON], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated_osf.json";
    a.click();
    window.URL.revokeObjectURL(url);
}

/**
 * Converts a list of characters into a number by concatenating the ASCII values of each character.
 * 
 * @param {Array<string>} charList - An array of single-character strings to be converted.
 * @returns {number} The resulting number after concatenating ASCII values of the characters.
 */
function charactersToNumber(charList) {
    let numStr = '';
    for (let i = 0; i < charList.length; i++) {
      numStr += charList[i].charCodeAt(0);
    }
    return parseInt(numStr);
}

/**
 * Recursively extracts tasks from an activity and its dependencies, and adds them to the tasks array.
 * 
 * @param {Object} activity - The activity object to be extracted.
 * @param {Array<Object>} tasks - The array to store the extracted tasks.
 * @param {Array<Object>} links - The array to store the links between tasks.
 * @param {string} parent - The parent ID of the current task.
 */
function extractTasks(activity, tasks, links, parent) {

    //console.log(activity);

    const task = {
      id: activity.id,
      text: activity.name,
      start_date: activity.start,
      end_date: activity.finish,
      parent: parent, // Set the parent ID
      open: true   
    };

    if (activity.dependencies) {
      // iterate over dependencies and create links
      //console.log("processing dependencies..." + activity.dependencies)
      for (let i = 0; i < activity.dependencies.length; i++) {
        const link = {
            id: activity.id + activity.dependencies[i],
            source: activity.dependencies[i],
            target: activity.id,
            type: 0
        }
        links.push(link);
      }
    }
  
    if (activity.task) {
      tasks.push(task);
    } else if (activity.summary) {
      task.type = gantt.config.types.project; // Set type as project for summary tasks
      tasks.push(task);
      activity.summary.forEach(subActivity => {
        extractTasks(subActivity, tasks, links, activity.id); // Pass current activity ID as parent
      });
    }

    //console.log(task);
}

/**
 * Converts an OSF JSON object to a DHTMLX Gantt data object.
 * 
 * The Gantt object is an object with two properties: data and links.
 * The data property contains an array of tasks.
 * The links property contains an array of links between tasks.
 * Each task is an object with the following properties: id, text, start_date, end_date, parent, and open.
 * Each link is an object with the following properties: id, source, target, and type.
 * The id property is a unique string identifier for the task.
 * The text property is the name of the task.
 * The start_date property is the start date of the task in ISO format.
 * The end_date property is the end date of the task in ISO format.
 * The parent property is the ID of the parent task, if it exists.
 * The open property is a boolean indicating whether the task is open or closed.
 * The source property is the ID of the source task for the link.
 * The target property is the ID of the target task for the link.
 * The type property is the type of the link.
 * 
 * @param {Object} osfData - The OSF JSON object to be converted.
 * @returns {Object} The Gantt object.
 */
function convertOSFToGantt(osfData) {
    const tasks = [];
    const links = [];
    const projects = osfData.snapshot.projects;

    projects.forEach(project => {
        project.activities.forEach(activity => {
            extractTasks(activity, tasks, links, null);
        });
    });

    return { data: tasks, links: links};
}

//Tabulator Date Editor
var dateEditor = function(cell, onRendered, success, cancel){
    //cell - the cell component for the editable cell
    //onRendered - function to call when the editor has been rendered
    //success - function to call to pass thesuccessfully updated value to Tabulator
    //cancel - function to call to abort the edit and return to a normal cell

    //create and style input
    var cellValue = luxon.DateTime.fromFormat(cell.getValue(), "dd/MM/yyyy").toFormat("yyyy-MM-dd"),
    input = document.createElement("input");

    input.setAttribute("type", "date");

    input.style.padding = "4px";
    input.style.width = "100%";
    input.style.boxSizing = "border-box";

    input.value = cellValue;

    onRendered(function(){
        input.focus();
        input.style.height = "100%";
    });

    function onChange(){
        if(input.value != cellValue){
            success(luxon.DateTime.fromFormat(input.value, "yyyy-MM-dd").toFormat("dd/MM/yyyy"));
        }else{
            cancel();
        }
    }

    //submit new value on blur or change
    input.addEventListener("blur", onChange);

    //submit new value on enter
    input.addEventListener("keydown", function(e){
        if(e.keyCode == 13){
            onChange();
        }

        if(e.keyCode == 27){
            cancel();
        }
    });

    return input;
};

function gaOptout() {
    document.cookie = 'gaOptout=true; expires=Thu, 31 Dec 2099 23:59:59 UTC; path=/';
    window['ga-disable-G-F0ZTC6GDXG'] = true; // Replace with your actual ID
    hideCookieConsent();
    alert('You have been opted out of Google Analytics tracking.');
}
  
function acceptCookies() {
    document.cookie = 'gaConsent=true; expires=Thu, 31 Dec 2099 23:59:59 UTC; path=/';
    hideCookieConsent();
    // Initialize Google Analytics here (since the user consented)
    gtag('config', 'G-F0ZTC6GDXG'); // Replace with your actual ID
}
  
function hideCookieConsent() {
    document.getElementById('cookieConsent').style.display = 'none';
}

window.onload = (event) => {
    //console.log("page is fully loaded");

    // Add initial task rows
    addDefaultAssetTasks();
    addDefaultShotTasks();
    addDefaultSequenceTasks();

    // Collapsible form script
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
        coll[i].addEventListener("click", function() {
            this.classList.toggle("active");
            var content = this.nextElementSibling;
            if (content.style.maxHeight){
                content.style.maxHeight = null;
            } else {
                content.style.maxHeight = content.scrollHeight + 20 + "px";
            } 
        });
    }

    //openTab('generator');
    gantt.config.date_format = "%Y-%m-%d";
    gantt.config.scale_unit = 'month';
    gantt.config.view_scale = true;
    gantt.init("gantt_here");
    
    gantt.plugins({ 
        drag_timeline: true,
        export_api: true,
        tooltip: true ,
        marker: true,
    }); 

    document.getElementById("showHideLinks").addEventListener(
        "click", function() {
            gantt.config.show_links = !gantt.config.show_links;
            gantt.render();
            this.textContent = gantt.config.show_links ? "Hide links" : "Show links";
        }
    )

    document.getElementById("exportPDF").addEventListener(
        "click", function() {
            gantt.exportToPDF({
                name: "gantt.pdf", raw: true,
            }
        );
    });

    document.getElementById("exportXLS").addEventListener(
        "click", function() {
            gantt.exportToExcel({
                name: "gantt.xlsx",
                visual: "base-colors",
                cellColors: true,
            }
        );
    });

    document.getElementById('importOSF').addEventListener('click', function() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json'; // Accept only JSON files

        input.onchange = function(e) {
          const file = e.target.files[0];
          const reader = new FileReader();
      
          reader.onload = function(e) {
            try {
              const osfData = JSON.parse(e.target.result);
              const ganttData = convertOSFToGantt(osfData);
              gantt.parse(ganttData);
              gantt.sort("start_date", false);
              gantt.render();
            } catch (error) {
              alert("Error parsing OSF file. Please make sure it's a valid OSF JSON file.");
              console.error(error);
            }
          }
          reader.readAsText(file);
        }
        input.click();
    });

    const navLinks = document.querySelectorAll('.topnav a');
    const views = document.querySelectorAll('.view');
    navLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior

            // 1. Remove "active" class from all links
            navLinks.forEach(navLink => {
                navLink.classList.remove('active');
            });

            // 2. Add "active" class to the clicked link
            this.classList.add('active'); 

            // Hide all views
            views.forEach(view => {
                view.style.display = 'none';
            });

            // Show the corresponding view
            // Get the href attribute (e.g., "#about")
            const targetId = this.getAttribute('href');
            const targetView = document.querySelector(targetId); 
            targetView.style.display = 'block'; 
        });
    });

    sheetData = [];

    var table = new Tabulator("#budget-table", {
        spreadsheet:true,
        spreadsheetRows:28,
        spreadsheetColumns:18,
        spreadsheetColumnDefinition:{editor:"input"},
        spreadsheetData:sheetData,
      
        rowHeader:{field:"_id", hozAlign:"center", headerSort:false, frozen:true},
      
        editorEmptyValue:undefined, //ensure empty values are set to undefined so they arent included in spreadsheet output data
    });

    document.getElementById("budget-exportCSV").addEventListener(
        "click", function() {
            table.download("csv", "plancraft-budget.csv", {delimiter:","});
        }
    );

    document.getElementById("budget-exportXLS").addEventListener(
        "click", function() {
            table.download("xlsx", "plancraft-budget.xlsx", {
                sheetName:"PlanCraftBudget",
                compress:false
            });
        }
    );

    document.getElementById("budget-exportPDF").addEventListener(
        "click", function() {
            table.download("pdf", "plancraft-budget.pdf", {
                orientation:"landscape",
                title:"PlanCraft Budget",
            });
        }
    );

    if (document.cookie.indexOf('gaConsent=true') == -1) {
        document.getElementById('cookieConsent').style.display = 'block';
    } else {
        // User has already consented, initialize Google Analytics
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-F0ZTC6GDXG'); // Replace with your actual ID
    }


};