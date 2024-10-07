
function openTab(tabName) {
    var i, tabContent, tabLinks;
    tabContent = document.getElementsByClassName("tab-content");
    for (i = 0; i < tabContent.length;   i++) {
      tabContent[i].style.display = "none";
    }
    tabLinks = document.getElementsByClassName("tab");
    for (i = 0; i < tabLinks.length; i++) {
      tabLinks[i].className = tabLinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    this.className += " active"; 
  }

function addAssetTask(name="", duration=5, dependencies=[]) {
    const table = document.getElementById('assetTasksTable').getElementsByTagName('tbody')[0];
    addTaskRow(table, "Asset", name, duration, dependencies);
    // Call the function to adjust height
    adjustCollapsibleHeight();
}

function addShotTask(name="", duration=5, dependencies=[], extraDependencies=[]) {
    const table = document.getElementById('shotTasksTable').getElementsByTagName('tbody')[0];
    addTaskRow(table, "Shot", name, duration, dependencies, extraDependencies);
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

    if (type === "Shot") {

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
    addAssetTask("design", 5);
    addAssetTask("model", 5, ["design"]);
    addAssetTask("rig", 5, ["model"]);
    addAssetTask("surface", 5, ["model"]);
}

function addDefaultShotTasks() {
    addShotTask("animation", 5, [], ["rig"]);
    addShotTask("lighting", 5, ["animation"], ["surface"]);
    addShotTask("comp", 5, ["lighting"]);
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
            dependencies: row.cells[2].querySelector('.taskDependencies').value.split(','),
            asetTaskDependencies: row.cells[3].querySelector('.asetTaskDependencies').value.split(',')
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
                assetTaskNameToId[assetTasks[j].name] = `asset_${i}_task_${assetTasks[j].name}`;
            }

            let dependencies = assetTasks[j].dependencies.map(dep => {
                // Resolve dependency using the task name mapping
                const depName = dep.trim();
                // Return empty string if dependency not found
                return assetTaskNameToId[depName] || ""; 
            }).filter(dep => dep !== ""); // Remove invalid dependencies

            assetTasksWithIds.push({
                "id": `asset_${i}_task_${assetTasks[j].name}`,
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
                    shotTaskNameToId[shotTasks[k].name] = `episode_${i}_shot_${j}_task_${shotTasks[k].name}`;
                }

                let dependencies = shotTasks[k].dependencies.map(dep => {
                    // Resolve dependency using the task name mapping
                    const depName = dep.trim();
                    // Return empty string if dependency not found
                    return shotTaskNameToId[depName] || ""; 
                }).filter(dep => dep !== ""); // Remove invalid dependencies

                // Add asset dependencies based on user input
                let assetDependencies = [];
                const numAssetDependencies = Math.min(3, numAssets);
                for (let l = 0; l < numAssetDependencies; l++) {
                    let randomAssetIndex;
                    do {
                        randomAssetIndex = Math.floor(Math.random() * numAssets) + 1;
                    } while (assetDependencies.includes(`asset_${randomAssetIndex}`));

                    // Get the asset dependencies specified in the UI
                    const assetDepNames = shotTasks[k].asetTaskDependencies;

                    // Find matching asset tasks
                    assetDepNames.forEach(depName => {
                        depName = depName.trim();
                        for (let m = 0; m < assetTasks.length; m++) {
                            // Check if the asset task name is the dependency name
                            if (assetTasks[m].name == depName) {
                                assetDependencies.push(`asset_${randomAssetIndex}_task_${assetTasks[m].name}`);
                                break; // Move to the next dependency name once a match is found
                            }
                        }
                    });
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

    openTab('generator');

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

};

