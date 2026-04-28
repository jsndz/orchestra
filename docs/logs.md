Phase 1:
Date: Feb 12, 2026

The Project Initial Idea was to build dependency resolver. It just served html css and js as static files

You have Task and Dependency,
You can get:

- Topoligical Order (meaning which order the task have to be solved) - Uses Topological sort Algo
- shortest Path between Task - BFS

Each Task acted as a node and each dependency as a edge

Phase 2: Convert the project into server
Date: Feb 14, 2026
THe project had lot of files and everything was getting cluttered
So converted to a server which serves static files and
algorithm core will be handled in backend.
Stack: bun.js with Typescript + Express

Added new features:

- Parallel Planning of the Tasks - Uses Topological sort Algo
- Detect Cycle and Report It - DFS with cycle array
- Terminal Task(end nodes) - task with outdegree 0
- Unreachable Tasks - Visited as false

Phase 3: Build frontend
Date: Feb 15, 2026

To make UI better, build frontend
Vibe coded the boiler plate code and then built features on top of that.

Phase 4: tasks -> workflow
Date: Feb 16, 2026

Rather than keeping it as a dependency resolver,
I plan to add commands and folder to the task input.
This can help in building a Workflow dependency manager.
You give task name, folder and command and these will be execute in the backend considering dependency.
The main motivation behind it was handle a big project which has lot of files and commands running.
Example will a microservice which has lot of services and commands you can,

lint build test and run each microservice separately and if one is dependent on other it will execute in order.

Phase 5: Upgrading the backend
Date: Feb 16, 2026

take command from frontend and store in in memory of bun.
Then run the commands parallelly based on the parellel planning of task.
It ensures that after the level 0 run level 1 will run etc. And this ensures if one task fails downstream task will not run.
Used "child_process" to do this.
Also wrote Tests for this.

Phase 6: Serving the output in frontend
Date: Feb 16, 2026

The data needs to be streamed to the frontend.
Normal http won't work. So had to either go with websocket or SSE.
SSE is better since the whole process for frontend was read only.
So built a SSE end point "/execute".
Sent the data in chucks based on types like "terminal_create", "task_started" etc
In this phase i also had to deal with imaginary terminal creation like for the terminals of the
same path only one terminal is enough to show the output in frontend.

Phase 7: Designing UI for graph and terminal
Date: Feb 17, 2026

Gave proper UI for graph and terminal

Phase 8: Designing UI and UX for the Project
Date: Feb 17, 2026

Based on the recommendation of mentor, started improving UI/UX.
Designed user flow, wireframe(for some pages), colors, fonts and style.

I tried to get the folder through the browser input tag. But was restricted for relative path. I needed absoulte path.
Which was only possible if i switch from browser to actual application.
So for now user has to maually input the folder path.

Phase 8: Yaml Parser
Date: Feb 18, 2026

Since the whole workflow lives in-memory implemented a feature that converts the workflow to dag and then tag to yaml
This help in reusability.
integrated the yaml config in the project.

Phase 9: UI Fixes
Date: Feb 19,2026

Designed Home page UI added and modified components this helped me solidify understanding about relative and absolute.
And useScroll and useTransform.
Redesigned the whole "/tasks" page for better User Experience inspired by figma.

Phase 10: Killing the children (process)
Date: Feb 20,2026

endpoints for killing the all running process

Phase 11: Home Page UI And Task Crud
Date: Feb 22,2026

After going through lot of design and ideas for the home page settled for something simple.
Added How it Works and Features page.
Added Delete and update for tasks and dependency.

Phase 12: Limitations
Date: Feb 24,2026

After manually testing some bigger microservices to run in development, there are some limitation of the current Execution model
In the current Execution model dependency is based on the Nodes.
Example: A -> B : meaning B will run after A
But the thing about this is that there can be many states for A.
Like if A is a service, in the current Execution model if A is finished executing then only B will execute
But for a server if lets say A is backend and need to perform integration test of A.
We need to run the server and then perform integration server. In current Execution model it is not possible.
So we need to change the dependency based on nodes to dependency based on state.
State can be running, stopped, Dead etc.
If we add dependency based on state we can do,
run B when A is (running).

The current architecture is client-server architecture.
Even though everything is running natively on the same system,
Backend server is running and browser acting as a client.
This can be rather counter-intuitive for a workflow/developer tool.
And also browser has limited permissions to work with system.

The Terminals are only read. No write operations are allowed for now.
This is not a limitation in the sense that you want to execute a workflow.
But can be problematic if you want to run some cli or use terminal to send data.

Phase 13: Adding States
Date: Feb 25,2026

Added state for each step and also divided the steps into either job or service.
Jobs are one time executions and services are long running process.
To ensure that processes are alive before running the next step,
added two parameters for checking port and log.
If in the stream coming from the process certain text is recieved or if certain port is alive,
then the process is running and we can execute the next step.
The backend logic was completed.

Date: Feb 26,2026

Added states for frontend.
This completes the essentials for running any workflows.
The MVP is ready in this stage.

Phase 14: Redesign

Date: March 3,2026
This Phase would be completely dedicated for redesigning the product interms of UI/UX.

Date: March 4,2026
Redesigned the task page to add list of tasks, edit sidebar, system information in the bottom and filenames in the folder.

Date: March 5,2026
Redesigned the execution page to provide a graph view with logs. Create a in-memory map to store the logs in the backend.


Date: April 16,2026
Lot changed build a new project with electron to build this as a application. Changed sse -> electron ipc

Date: April 28,2026
Update UI with more tech + Noir look