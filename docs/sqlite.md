  ## 1. Why SQLite? (Key Use Cases)

  ### A. Execution History & Run Auditing (The #1 Missing Feature)

  Currently, because the workflow state is completely in-memory (index.ts), all history is lost as soon as the app is restarted or a new workflow is loaded.

  • With SQLite, you can store an audit trail of every execution run (e.g.,  Run #12 on 2026-06-14 failed at Task C ).
  • You can query metrics like average run time per task, failure rates, and identify bottleneck services.

  ### B. Session State & Workspace Preferences

  • Recently Opened Workflows: A list of recently loaded YAML file paths, allowing for a quick "Recent Workflows" launch screen.
  • UI State Persistence: React Flow node layouts, custom zoom levels, terminal dimensions, font sizes, and dark/light mode toggles.

  ### C. Concurrent Logging & Offloading

  If you run 10 microservices, they generate megabytes of logs quickly.

  • Keeping all historical terminal logs in memory will eventually slow down the React renderer and bloat Electron's memory.
  • SQLite can act as a local log buffer. You can stream live logs to the UI via IPC, while writing older logs to SQLite for full-text search and retrieval.

  ### D. Safe Concurrent Writes

  Since multiple microservices run concurrently, they might finish or update their state simultaneously. Standard JSON/flat-file databases (like  lowdb ) can
  suffer from file lock corruption under concurrent writes. SQLite has built-in transactional safety ( WAL  mode) that handles concurrent writes reliably.
  ──────
  ## 2. Recommended Database Schema

  Here is how you might structure the tables:

    erDiagram                                                                                                                                                      
        WORKFLOW ||--o{ EXECUTION_RUN : starts                                                                                                                     
        EXECUTION_RUN ||--|{ TASK_EXECUTION : records                                                                                                              
        TASK_EXECUTION ||--o{ EXECUTION_LOG : contains                                                                                                             
                                                                                                                                                                   
        WORKFLOW {                                                                                                                                                 
            string file_path PK                                                                                                                                    
            string name                                                                                                                                            
            datetime last_opened                                                                                                                                   
        }                                                                                                                                                          
        EXECUTION_RUN {                                                                                                                                            
            integer id PK                                                                                                                                          
            string workflow_file_path FK                                                                                                                           
            string trigger_type "manual / hot-reload"                                                                                                              
            string state "completed / failed"                                                                                                                      
            datetime started_at                                                                                                                                    
            datetime finished_at                                                                                                                                   
        }                                                                                                                                                          
        TASK_EXECUTION {                                                                                                                                           
            integer id PK                                                                                                                                          
            integer run_id FK                                                                                                                                      
            string task_id                                                                                                                                         
            string task_name                                                                                                                                       
            string state "completed / failed / stopped"
            datetime started_at
            datetime finished_at
            string failure_reason
        }
  ──────
  ## 3. SQLite vs. YAML: The Integration Strategy

  │ [!IMPORTANT]
  │ Workflow Definitions (Tasks & Dependencies) should remain in YAML.
  │ Developers want to check their orchestration DAGs into Git (e.g.,  orchestra.yaml ) so their team members can clone the repository and run the exact same stack.
  │ Storing the core configuration only in a local SQLite database would break this sharing workflow.

  ### The Hybrid Model

  • YAML File (Git): Defines the source of truth for the DAG (Task names, commands, folders, dependency relations).
  • SQLite Database (Local-first Cache):
      • References the YAML  file_path .
      • Stores user preferences specific to that local path (e.g. customized override environment variables, local path overrides, last window sizes).
      • Stores execution runs, timestamps, and log archives.

  ──────
  ## 4. Technical Trade-offs to Consider

  1. Native Node Modules:
  Using native drivers like  better-sqlite3  provides extreme speed, but requires compiling native C++ binaries. In Electron, this sometimes requires using        
  electron-rebuild  to match the target Electron ABI version.
  2. Zero-dependency Alternatives:
  If you want to avoid native compilation issues altogether:
      • WASM-based SQLite: Using SQL.js or driver-less SQLite WASM builds.
      • K-V Stores: For simple preferences (no execution logs/history), simple JS-only stores like  electron-store  or flat JSON files are easier to compile, but
      lose relational querying capabilities.


  ### Recommendation

  For a robust microservice platform, yes, integrate SQLite. It will allow you to build an "Execution History" tab where developers can look at past errors, check
  startup timing details, and reload historical runs.