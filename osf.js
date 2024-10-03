function addAssetTask() {
    const table = document.getElementById('assetTasksTable').getElementsByTagName('tbody')[0];
    addTaskRow(table, "Asset");
    // Call the function to adjust height
    adjustCollapsibleHeight();
}

function addShotTask() {
    const table = document.getElementById('shotTasksTable').getElementsByTagName('tbody')[0];
    addTaskRow(table, "Shot");
    // Call the function to adjust height
    adjustCollapsibleHeight();
}

function addTaskRow(table, type) {
    const row = table.insertRow(-1);
    const nameCell = row.insertCell();
    const durationCell = row.insertCell();
    const dependenciesCell = row.insertCell();

    nameCell.innerHTML = `<input type="text" class="taskName" placeholder="Task Name" value="Task ${type} ${table.rows.length}">`;
    durationCell.innerHTML = `<input type="number" class="taskDuration" placeholder="Days Duration" value="5">`;
    dependenciesCell.innerHTML = `<input type="text" class="taskDependencies" placeholder="Dependencies (comma-separated)">`;
}

function adjustCollapsibleHeight() {
    var coll = document.getElementsByClassName("collapsible");
    var i;

    for (i = 0; i < coll.length; i++) {
        if (coll[i].classList.contains("active")) { // Only adjust if the block is expanded
            var content = coll[i].nextElementSibling;
            content.style.maxHeight = content.scrollHeight + "px";
        }
    }
}

function generateOSF() {
    const numEpisodes = parseInt(document.getElementById("numEpisodes").value);
    const shotsPerEpisode = parseInt(document.getElementById("shotsPerEpisode").value);
    const numAssets = parseInt(document.getElementById("numAssets").value);

    // Get Asset tasks
    const assetTasks = [];
    const assetTable = document.getElementById('assetTasksTable').getElementsByTagName('tbody')[0];
    for (let i = 0; i < assetTable.rows.length; i++) {
        const row = assetTable.rows[i];
        assetTasks.push({
            name: row.cells[0].querySelector('.taskName').value,
            duration: parseInt(row.cells[1].querySelector('.taskDuration').value),
            dependencies: row.cells[2].querySelector('.taskDependencies').value.split(',')
        });
    }

    // Get Shot tasks
    const shotTasks = [];
    const shotTable = document.getElementById('shotTasksTable').getElementsByTagName('tbody')[0];
    for (let i = 0; i < shotTable.rows.length; i++) {
        const row = shotTable.rows[i];
        shotTasks.push({
            name: row.cells[0].querySelector('.taskName').value,
            duration: parseInt(row.cells[1].querySelector('.taskDuration').value),
            dependencies: row.cells[2].querySelector('.taskDependencies').value.split(',')
        });
    }

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

    // Add resources to resourceClasses
    const resourceClasses = {}; // Keep track of added resources
    function addResourceClass(taskName) {
        if (!resourceClasses[taskName]) {
            const resourceId = `resource_${Object.keys(resourceClasses).length + 1}`;
            osf.snapshot.resourceClasses.push({
                "id": resourceId,
                "name": taskName
            });
            resourceClasses[taskName] = resourceId;
        }
        return resourceClasses[taskName];
    }

    assetTasks.forEach(task => addResourceClass(task.name));
    shotTasks.forEach(task => addResourceClass(task.name));

    // Generate asset activities
    let assetActivities = [];
    for (let i = 1; i <= numAssets; i++) {
        let assetTasksWithIds = [];
        for (let j = 0; j < assetTasks.length; j++) {

            // Create a mapping of task names to their IDs for dependency resolution
            const assetTaskNameToId = {};
            for (let j = 0; j < assetTasks.length; j++) {
                assetTaskNameToId[assetTasks[j].name] = `asset_${i}_task_${j+1}`;
            }

            let dependencies = assetTasks[j].dependencies.map(dep => {
                // Resolve dependency using the task name mapping
                const depName = dep.trim();
                // Return empty string if dependency not found
                return assetTaskNameToId[depName] || ""; 
            }).filter(dep => dep !== ""); // Remove invalid dependencies

            assetTasksWithIds.push({
                "id": `asset_${i}_task_${j+1}`,
                "name": assetTasks[j].name,
                "task": {
                    "duration": assetTasks[j].duration,
                    "resources": [
                        {
                            "resource": resourceClasses[assetTasks[j].name], 
                            "units": 1
                        }
                    ]
                },
                "dependencies": dependencies
            });
        }
        assetActivities.push({
            "id": `asset_${i}`,
            "name": `Asset ${i}`,
            "category": "Asset",
            "summary": assetTasksWithIds
        });
    }
    osf.snapshot.projects[0].activities.push({
        "id": "assets",
        "name": "Assets",
        "summary": assetActivities
    });

    // Generate episodes shot activities
    let episodeActivities = [];
    for (let i = 1; i <= numEpisodes; i++) {
        let shotActivities = [];
        for (let j = 1; j <= shotsPerEpisode; j++) {
            let shotTasksWithIds = [];
            for (let k = 0; k < shotTasks.length; k++) {

                // Create a mapping of task names to their IDs for dependency resolution
                const shotTaskNameToId = {};
                for (let k = 0; k < shotTasks.length; k++) {
                    shotTaskNameToId[shotTasks[k].name] = `episode_${i}_shot_${j}_task_${k+1}`;
                }

                let dependencies = shotTasks[k].dependencies.map(dep => {
                    // Resolve dependency using the task name mapping
                    const depName = dep.trim();
                    // Return empty string if dependency not found
                    return shotTaskNameToId[depName] || ""; 
                }).filter(dep => dep !== ""); // Remove invalid dependencies

                // Add random asset dependencies
                let assetDependencies = [];
                // Limit to 3 or numAssets, whichever is smaller
                const numAssetDependencies = Math.min(3, numAssets); 
                for (let l = 0; l < numAssetDependencies; l++) {
                    let randomAssetIndex;
                    do {
                        // Generate random asset index
                        randomAssetIndex = Math.floor(Math.random() * numAssets) + 1;
                    // Ensure no duplicates
                    } while (assetDependencies.includes(`asset_${randomAssetIndex}`));
                    assetDependencies.push(`asset_${randomAssetIndex}`);
                }

                shotTasksWithIds.push({
                    "id": `episode_${i}_shot_${j}_task_${k+1}`,
                    "name": shotTasks[k].name,
                    "task": {
                        "duration": shotTasks[k].duration,
                        "resources": [
                            {
                                "resource": resourceClasses[shotTasks[k].name], 
                                "units": 1
                            }
                        ]
                    },
                    // Combine shot and asset dependencies
                    "dependencies": dependencies.concat(assetDependencies)
                });
            }
            shotActivities.push({
                "id": `episode_${i}_shot_${j}`,
                "name": `Episode ${i} Shot ${j}`,
                "category": "Shot",
                "summary": shotTasksWithIds
            });
        }
        episodeActivities.push({
            "id": `episode_${i}`,
            "name": `Episode ${i}`,
            "category": "Episode",
            "summary": shotActivities
        });
    }
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
    const osfJSON = JSON.stringify(osf, null, 2);
    const blob = new Blob([osfJSON], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated_osf.json";
    a.click();
    window.URL.revokeObjectURL(url);
}

window.onload = (event) => {
    console.log("page is fully loaded");

    // Add initial task rows
    addAssetTask();
    addShotTask();

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
                content.style.maxHeight = content.scrollHeight + "px";
            } 
        });
    }

};

