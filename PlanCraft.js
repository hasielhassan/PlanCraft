function addSequenceTask(name="", duration=5, dependencies=[], extraDependencies=[]) {
    const table = document.getElementById('sequenceTasksTable').getElementsByTagName('tbody')[0];
    addTaskRow(table, "Sequence", name, duration, dependencies, extraDependencies);
    // Call the function to adjust height
    adjustCollapsibleHeight();
}

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

function addShotTask(type="", name="", duration=5, dependencies=[], extraDependencies=[]) {

    if (type === "simple") {
        const table = document.getElementById('simpleShotTasksTable').getElementsByTagName('tbody')[0];
        addTaskRow(table, "SimpleShot", name, duration, dependencies, extraDependencies);
    } else if (type === "complex") {
        const table = document.getElementById('complexShotTasksTable').getElementsByTagName('tbody')[0];
        addTaskRow(table, "ComplexShot", name, duration, dependencies, extraDependencies);
    }
    // Call the function to adjust height
    adjustCollapsibleHeight();
}

function addTaskRow(table, type, name="", duration=5, dependencies=[], extraDependencies=[]) {
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
    console.log("type: " + type);
    console.log("extraDependencies: " + extraDependencies);
    if (["SimpleShot", "ComplexShot", "Sequence"].includes(type)) {
        console.log("Doing extra dependencies");
        console.log("extraDependencies: " + extraDependencies.length);
        if (extraDependencies.length > 0) {
            extraDependencies = extraDependencies.join(",");
        } else {
            extraDependencies = "";
        }

        const assetDependenciesCell = row.insertCell();
        assetDependenciesCell.innerHTML = `
            <input 
                type="text" 
                class="asetTaskDependencies" 
                placeholder="comma,separated" 
                value="${extraDependencies}"
            >
        `;
    }
}

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

function addDefaultShotTasks() {
    addShotTask("simple", "animation", 5, [], ["rig"]);
    addShotTask("simple", "simulation", 5, [], ["groom"]);
    addShotTask("simple", "lighting", 5, ["animation", "simulation"], ["surface"]);
    addShotTask("simple", "comp", 5, ["lighting"]);

    addShotTask("complex", "animation", 10, [], ["rig"]);
    addShotTask("complex", "simulation", 10, [], ["groom"]);
    addShotTask("complex", "fx", 10, ["animation"]);
    addShotTask("complex", "lighting", 10, ["animation", "simulation", "fx"], ["surface"]);
    addShotTask("complex", "comp", 10, ["lighting"]);
}

function addDefaultSequenceTasks() {
    addSequenceTask("story", 5, [], []);
    addSequenceTask("layout", 5, ["story"], ["rig", "model"]);
}

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

function generateStringList(inputDict) {
    let stringList = [];
    for (const string in inputDict) {
      for (let i = 0; i < inputDict[string]; i++) {
        stringList.push(string);
      }
    }
  
    // Shuffle the array
    for (let i = stringList.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [stringList[i], stringList[j]] = [stringList[j], stringList[i]];
    }
  
    return stringList;
  }

function getTablesTasks(className) {
    console.log("Getting tasks from " + className);
    const tables = document.getElementsByClassName(className);
    const allTablesTasks = {};
    for (let i = 0; i < tables.length; i++) {
        const table = tables[i];
        console.log(table);
        const entityType = table.getAttribute('data-entity-type');
        allTablesTasks[entityType] = [];
        for (let j = 1; j < table.rows.length; j++) {
            const row = table.rows[j];
            console.log(row);
            allTablesTasks[entityType].push({
                name: row.cells[0].querySelector('.taskName').value,
                duration: parseInt(row.cells[1].querySelector('.taskDuration').value),
                dependencies: row.cells[2].querySelector('.taskDependencies').value.split(','),
                // Only add extra dependencies for shots and sequences
                ... ( ["simple-shot", "complex-shot", "simple-sequence"].includes(entityType) && {
                    extraDependencies: row.cells[3].querySelector('.asetTaskDependencies').value.split(',')
                })
            });
        };
    };
    console.log(allTablesTasks);
    return allTablesTasks
}
// Add resources to resourceClasses
// Keep a global track of added resources
let resourceClasses = {}; 
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

function generateAssetActivities(numEnvAssets, numCharAssets, numPropAssets, assetTasks) {

    let assetActivities = [];

    const assetTypesCounts = {
        "env": numEnvAssets,
        "char": numCharAssets,
        "prop": numPropAssets
    };

    for (let x = 0; x < Object.keys(assetTypesCounts).length; x++) {

        let assetType = Object.keys(assetTypesCounts)[x];
        let assetTypeTasks = assetTasks[assetType];
        let assetTypeCount = assetTypesCounts[assetType];
        let assetTypeActivities = [];

        for (let i = 0; i < assetTypeCount; i++) {
            let assetTasksWithIds = [];
            for (let j = 0; j < assetTypeTasks.length; j++) {
    
                // Create a mapping of task names to their IDs for dependency resolution
                const assetTaskNameToId = {};
                for (let j = 0; j < assetTypeTasks.length; j++) {
                    assetTaskNameToId[assetTypeTasks[j].name] = `asset_${assetType}_${i}_task_${assetTypeTasks[j].name}`;
                }
    
                let dependencies = assetTypeTasks[j].dependencies.map(dep => {
                    // Resolve dependency using the task name mapping
                    const depName = dep.trim();
                    // Return empty string if dependency not found
                    return assetTaskNameToId[depName] || ""; 
                }).filter(dep => dep !== ""); // Remove invalid dependencies
    
                assetTasksWithIds.push({
                    "id": `asset_${assetType}_${i}_task_${assetTypeTasks[j].name}`,
                    "name": assetTypeTasks[j].name,
                    "task": {
                        "duration": assetTypeTasks[j].duration,
                        "resources": [
                            {
                                "resource": resourceClasses[assetTypeTasks[j].name], 
                                "units": 1
                            }
                        ]
                    },
                    "dependencies": dependencies
                });
            }
            assetTypeActivities.push({
                "id": `asset_${assetType}_${i}`,
                "name": `Asset ${assetType} ${i}`,
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

function generateEpisodeActivities(
    numEpisodes, shotsPerEpisode, complexShotsPerEpisode, shotTypesTasks,
    numEnvAssets, numCharAssets, numPropAssets, assetTasks
) {
    let episodeActivities = [];

    // Generate a radom number of complex shots per episode
    // using the complexShotsPerEpisode input for the whole project
    // the data will be a dictionary per episode number and the 
    // value will be the number of complex shots
    let complexShotsPerEpisodeCounts = {};
    for (let i = 1; i <= numEpisodes; i++) {
        complexShotsPerEpisodeCounts[i] = Math.floor(Math.random() * complexShotsPerEpisode) + 1;
    }

    for (let i = 1; i <= numEpisodes; i++) {
        let shotActivities = [];
        
        // Define a list of simple and complex shots for this episode
        let episodeSimpleShotsCount = shotsPerEpisode - complexShotsPerEpisodeCounts[i];
        let episodeShotsTypes = generateStringList(
            {
                "simple": episodeSimpleShotsCount, 
                "complex": complexShotsPerEpisodeCounts[i]
            },
        );

        for (let j = 1; j <= episodeShotsTypes.length; j++) {
            let shotTasksWithIds = [];
            let shotType = episodeShotsTypes[j - 1];
            let shotTasks;
            console.log(shotType);
            if (shotType == "complex") {
                shotTasks = shotTypesTasks["complex-shot"];
            } else {
                shotTasks = shotTypesTasks["simple-shot"];
            };
            console.log(shotTasks);
            for (let k = 0; k < shotTasks.length; k++) {

                // Create a mapping of task names to their IDs for dependency resolution
                const shotTaskNameToId = {};
                for (let k = 0; k < shotTasks.length; k++) {
                    shotTaskNameToId[shotTasks[k].name] = `episode_${i}_${shotType}_shot_${j}_task_${shotTasks[k].name}`;
                }

                let dependencies = shotTasks[k].dependencies.map(dep => {
                    // Resolve dependency using the task name mapping
                    const depName = dep.trim();
                    // Return empty string if dependency not found
                    return shotTaskNameToId[depName] || ""; 
                }).filter(dep => dep !== ""); // Remove invalid dependencies

                // Add asset dependencies based on user input
                let assetDependencies = [];

                const assetTypesCounts = {
                    "env": numEnvAssets,
                    "char": numCharAssets,
                    "prop": numPropAssets
                };
            
                const assetTypesDependencyCounts = {
                    "env": 1,
                    "char": 3,
                    "prop": 3
                };

                for (let x = 0; x < Object.keys(assetTypesCounts).length; x++) {
            
                    let assetType = Object.keys(assetTypesCounts)[x];
                    let assetTypeTasks = assetTasks[assetType];
                    let assetTypeCount = assetTypesCounts[assetType];
                    
                    assetTypesDependencyCounts
                    let maxAssetCount = assetTypesDependencyCounts[assetType];
                    const numAssetDependencies = Math.min(maxAssetCount, assetTypeCount);
                    for (let l = 0; l < numAssetDependencies; l++) {
                        let randomAssetIndex;
                        do {
                            randomAssetIndex = Math.floor(Math.random() * assetTypeCount) + 1;
                        } while (assetDependencies.includes(`asset_${assetType}_${randomAssetIndex}`));

                        // Get the asset dependencies specified in the UI
                        console.log(shotTasks[k]);
                        let assetDepNames = shotTasks[k].extraDependencies;
                        console.log(assetDepNames);
                        // Find matching asset tasks
                        assetDepNames.forEach(depName => {
                            depName = depName.trim();
                            for (let m = 0; m < assetTypeTasks.length; m++) {
                                // Check if the asset task name is the dependency name
                                if (assetTypeTasks[m].name == depName) {
                                    assetDependencies.push(`asset_${assetType}_${randomAssetIndex}_task_${assetTypeTasks[m].name}`);
                                    break; // Move to the next dependency name once a match is found
                                }
                            }
                        });
                    }
                }

                shotTasksWithIds.push({
                    "id": `episode_${i}_shot_${j}_task_${shotTasks[k].name}`,
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
    };
    return episodeActivities
}

function generateOSF() {

    // reset resource classes
    let resourceClasses = {}; 

    const numEpisodes = parseInt(document.getElementById("numEpisodes").value);
    const shotsPerEpisode = parseInt(document.getElementById("shotsPerEpisode").value);
    const complexShotsPerEpisode = parseInt(document.getElementById("complexShotsPerEpisode").value);
    const numEnvAssets = parseInt(document.getElementById("numEnvAssets").value);
    const numCharAssets = parseInt(document.getElementById("numCharAssets").value);
    const numPropAssets = parseInt(document.getElementById("numPropAssets").value);

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
    for (let i = 0; i < assetTasks.length; i++) {
        assetTasks[i].forEach(task => addResourceClass(task.name));
    }
    for (let i = 0; i < shotTasks.length; i++) {
        shotTasks[i].forEach(task => addResourceClass(task.name));
    }
    for (let i = 0; i < sequenceTasks.length; i++) {
        sequenceTasks[i].forEach(task => addResourceClass(task.name));
    }

    // Generate asset activities
    const assetActivities = generateAssetActivities( 
        numEnvAssets, numCharAssets, numPropAssets, assetTasks
    );
    osf.snapshot.projects[0].activities.push({
        "id": "assets",
        "name": "Assets",
        "summary": assetActivities
    });

    // Generate episodes shot activities
    const episodeActivities = generateEpisodeActivities(
        numEpisodes, shotsPerEpisode, complexShotsPerEpisode, shotTasks,
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
    const osfJSON = JSON.stringify(osf, null, 2);
    const blob = new Blob([osfJSON], { type: "application/json" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "generated_osf.json";
    a.click();
    window.URL.revokeObjectURL(url);
}

function charactersToNumber(charList) {
    let numStr = '';
    for (let i = 0; i < charList.length; i++) {
      numStr += charList[i].charCodeAt(0);
    }
    return parseInt(numStr);
}

function extractTasks(activity, tasks, links, parent) {

    console.log(activity);

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
      console.log("processing dependencies..." + activity.dependencies)
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

    console.log(task);
}

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

window.onload = (event) => {
    console.log("page is fully loaded");

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
              gantt.parse(ganttData); // Assuming you have a gantt object initialized
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

};