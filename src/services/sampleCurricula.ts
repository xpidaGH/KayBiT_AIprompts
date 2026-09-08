import { CurriculumDocument } from '../types';

export const PRESET_CURRICULA: CurriculumDocument[] = [
  {
    id: 'antivirus',
    subject: 'antivirus',
    title: 'Developer Security & Environment Hardening Academy',
    subtitle: 'Windows Capstone Edition',
    brandSub: 'Windows Security & Tooling',
    createdAt: '2026-09-01',
    sourceType: 'preset',
    difficulty: 'Advanced',
    programmingLanguages: ['PowerShell', 'Python', 'Go', 'Rust'],
    tags: ['Security', 'Windows Hardening', 'DevOps', 'Defensive'],
    chapters: [
      {
        id: 1,
        numStr: '01',
        title: 'Core Windows Security Configuration',
        topic: 'Core Windows Security Configuration.',
        objective: 'Retain Windows Defender Antivirus as the primary real-time engine; use Malwarebytes strictly for on-demand scanning with web protection disabled; verify Windows Sandbox/Hyper-V for isolation; and configure VPN split tunneling excluding 127.0.0.1/localhost.',
        prompt: `Write a PowerShell setup script (or documented checklist) that a capstone student runs once per new Windows dev machine to establish this baseline:\n\n- Confirm Windows Defender is active and up to date (Get-MpComputerStatus).\n- Install Malwarebytes only for on-demand use, and disable its real-time web-protection component via its official settings.\n- Verify Windows Sandbox / Hyper-V features are enabled (Get-WindowsOptionalFeature).\n- Produce a written checklist item confirming split-tunneling is configured in the student's VPN client of choice, with 127.0.0.1 and localhost excluded from the tunnel.\n\nDocument each step's rationale in comments so a grader can verify the baseline was actually established, not just described.`,
        translations: {
          fr: { topic: "Configuration de sécurité Windows de base.", objective: "Conserver Windows Defender Antivirus comme moteur principal en temps réel ; utiliser Malwarebytes strictement pour l'analyse à la demande avec protection web désactivée ; vérifier Windows Sandbox/Hyper-V pour l'isolation ; et configurer le split tunneling VPN en excluant 127.0.0.1/localhost." },
          es: { topic: "Configuración de seguridad principal de Windows.", objective: "Conservar Windows Defender Antivirus como motor principal en tiempo real; usar Malwarebytes estrictamente para escaneo bajo demanda con protección web desactivada; verificar Windows Sandbox/Hyper-V para aislamiento; y configurar túnel dividido VPN excluyendo 127.0.0.1/localhost." },
          de: { topic: "Zentrale Windows-Sicherheitskonfiguration.", objective: "Windows Defender Antivirus als primäre Echtzeit-Engine beibehalten; Malwarebytes ausschließlich für On-Demand-Scans mit deaktiviertem Webschutz verwenden; Windows Sandbox/Hyper-V für Isolation prüfen; und VPN-Split-Tunneling unter Ausschluss von 127.0.0.1/localhost konfigurieren." }
        }
      },
      {
        id: 2,
        numStr: '02',
        title: 'Automated Directory Exclusion Matrix',
        topic: 'Automated Directory Exclusion Matrix.',
        objective: 'A PowerShell automation script that dynamically adds Windows Defender exclusion paths for active development ecosystems (e.g. ~/Developer, ~/.nuget, ~/.m2) via Set-MpPreference -ExclusionPath with narrow scoping to prevent IOPS degradation during compilation.',
        prompt: `Write a PowerShell script that:\n\n1. Detects which language toolchains are installed by checking for their standard cache directories under %USERPROFILE% and %LOCALAPPDATA% (Python, Node, Java/Maven/Gradle, .NET, Rust/Cargo, Go, Dart/Flutter, PHP/Composer, Ruby/gem).\n2. Builds a minimal, specific list of only the directories that actually exist.\n3. Applies them via Set-MpPreference -ExclusionPath after printing the list and asking for confirmation.\n\nInclude a --dry-run flag that only prints the proposed exclusions without applying them, and a --revert flag that removes previously-added exclusions using Remove-MpPreference -ExclusionPath. Log every change with a timestamp to a local audit file.`,
        translations: {
          fr: { topic: "Matrice d'exclusion de répertoires automatisée.", objective: "Un script d'automatisation PowerShell qui ajoute dynamiquement des chemins d'exclusion Windows Defender pour les écosystèmes de développement actifs (ex. ~/Developer, ~/.nuget, ~/.m2) via Set-MpPreference -ExclusionPath avec une portée ciblée." },
          es: { topic: "Matriz de exclusión de directorios automatizada.", objective: "Un script de automatización de PowerShell que agrega dinámicamente rutas de exclusión de Windows Defender para ecosistemas de desarrollo activos (p. ej. ~/Developer, ~/.nuget, ~/.m2) mediante Set-MpPreference -ExclusionPath." },
          de: { topic: "Automatisierte Verzeichnisausschluss-Matrix.", objective: "Ein PowerShell-Automatisierungsskript, das dynamisch Windows Defender-Ausschlusspfade für aktive Entwicklungsumgebungen (z. B. ~/Developer, ~/.nuget, ~/.m2) über Set-MpPreference -ExclusionPath hinzufügt." }
        }
      },
      {
        id: 3,
        numStr: '03',
        title: 'Python Toolchain Security & Exclusion Vector',
        topic: 'Python Toolchain Security & Exclusion Vector.',
        objective: 'Exclude %USERPROFILE%\\AppData\\Local\\pypoetry\\ and __pycache__ while defending against PyPI typosquatting and malicious setup.py execution using pip-audit and Poetry pinned lockfiles.',
        prompt: `Write a small CLI helper (Python) that a student runs before installing any new dependency: it accepts a package name, checks it against a configurable allow-list/deny-list, runs pip-audit against the current lock file, and warns if the package name is a close Levenshtein-distance match to a popular package (a typosquatting heuristic) before allowing poetry add / pipenv install to proceed. Also add the standard Defender exclusions for pypoetry, .virtualenvs, and __pycache__.`,
        translations: {
          fr: { topic: "Sécurité de la chaîne d'outils Python et vecteur d'exclusion.", objective: "Exclure %USERPROFILE%\\AppData\\Local\\pypoetry\\ et __pycache__ tout en se défendant contre le typosquattage PyPI et l'exécution malveillante de setup.py à l'aide de pip-audit et de fichiers de verrouillage Poetry." },
          es: { topic: "Seguridad de la cadena de herramientas de Python y vector de exclusión.", objective: "Excluir %USERPROFILE%\\AppData\\Local\\pypoetry\\ y __pycache__ defendiendo al mismo tiempo contra typosquatting en PyPI y ejecución maliciosa de setup.py mediante pip-audit y Poetry." },
          de: { topic: "Python-Toolchain-Sicherheit und Ausschlussvektor.", objective: "%USERPROFILE%\\AppData\\Local\\pypoetry\\ und __pycache__ ausschließen und sich gleichzeitig gegen PyPI-Typosquatting und bösartige setup.py-Ausführung mit pip-audit und Poetry schützen." }
        }
      }
    ]
  },
  {
    id: 'AIprompt',
    subject: 'AIprompt',
    title: 'AI Prompts for Student Discussions',
    subtitle: 'Core Programming & Software Design Curricula',
    brandSub: 'Byte Technologies — Foundation',
    createdAt: '2026-09-01',
    sourceType: 'preset',
    difficulty: 'Intermediate',
    programmingLanguages: ['TypeScript', 'Python', 'JavaScript', 'Bash/Shell'],
    tags: ['FullStack', 'Educational Web', 'PDF Generation', 'Piston Docker'],
    chapters: [
      {
        id: 1,
        numStr: '01',
        title: 'Full-Stack Educational Website',
        topic: 'Full-Stack Educational Website.',
        objective: 'To create a Full-stack Educational Website for teaching 20 programming languages, using 20 internationalization languages with interactive quizzes, live code runner, and structured modules.',
        prompt: `With Next.js Pages router and Tailwind CSS, create a Full-stack Educational Website (KayBiT Byte Technologies) with Next.js consisting of 23 web-pages having navigation bars for 20 programming languages [Python, JS, TS, Java, C#, Kotlin, Dart/Flutter, Bash/Shell, Rust, Go, C++, C, PHP, Ruby, SQL, R, Scala, MATLAB, COBOL/Assembly]. Include Monaco Editor, sandboxed code execution with Piston Docker, rate limiting, and progress tracking.`,
        critique: `The prompt is extremely ambitious and packs an entire semester-scale product into a single instruction. It mixes UI layout decisions, curriculum content design, backend architecture, and security controls without prioritization. It should be partitioned into four explicit phases with clear acceptance criteria.`,
        improvedPrompt: `Build KayBiT Byte Technologies in four explicit phases: Phase 1: Site shell and content navigation; Phase 2: Curriculum content in MDX; Phase 3: Code execution sandbox with isolated Docker containers; Phase 4: Progress, grading, and offline PWA support.`,
        translations: {
          fr: { topic: "Site web éducatif Full-Stack.", objective: "Créer un site web éducatif complet pour l'enseignement de 20 langages de programmation, utilisant 20 langues d'internationalisation avec des quiz interactifs et une exécution de code sécurisée." },
          es: { topic: "Sitio web educativo Full-Stack.", objective: "Crear un sitio web educativo integral para enseñar 20 lenguajes de programación, utilizando 20 idiomas de internacionalización con cuestionarios interactivos y ejecución de código segura." },
          de: { topic: "Full-Stack-Bildungswebsite.", objective: "Erstellung einer Full-Stack-Bildungswebsite zum Unterrichten von 20 Programmiersprachen unter Verwendung von 20 Internationalisierungssprachen mit interaktiven Quizzen und sicherer Code-Ausführung." }
        }
      },
      {
        id: 2,
        numStr: '02',
        title: 'Multi-platform PDF documents creation',
        topic: 'Multi-platform PDF documents creation.',
        objective: 'To create a Multi-platform app suite that transforms student programming notes into structured PDF documents with copiable codes using Python, Flet/NiceGUI, and ReportLab.',
        prompt: `Create a python-centric (Python 3.14.4) Web/Windows/Android Multi-platform app suite that transforms student programming notes in .txt, .md, .mdx files into structured .pdf documents with copiable codes. Use Flet for UI, Pathlib for recursive file discovery, and ReportLab Platypus for structured PDF generation.`,
        critique: `The lightweight heading syntax is described only through examples rather than a formal grammar. Ambiguity occurs on nested lists or indented text. It should specify a typed AST parser and Platypus flowables.`,
        improvedPrompt: `Create a Python 3.14-based, Flet-powered cross-platform tool that converts notes into structured PDFs using a formal AST parser, ReportLab Platypus flowables for selectable text, and a progress bar for batch conversion.`,
        translations: {
          fr: { topic: "Création de documents PDF multiplateforme.", objective: "Créer une suite logicielle multiplateforme transformant les notes de programmation en documents PDF structurés avec code sélectionnable et copiable." },
          es: { topic: "Creación de documentos PDF multiplataforma.", objective: "Crear una suite de aplicaciones multiplataforma que transforme las notas de programación en documentos PDF estructurados con código seleccionable." },
          de: { topic: "Plattformübergreifende PDF-Dokumentenerstellung.", objective: "Erstellung einer plattformübergreifenden App-Suite, die Programmiernotizen von Studierenden in strukturierte PDF-Dokumente mit kopierbarem Code umwandelt." }
        }
      }
    ]
  },
  {
    id: 'Advanced',
    subject: 'Advanced',
    title: 'AI Prompts for Student Discussions',
    subtitle: 'Real-World Application Prompts — Advanced Students',
    brandSub: 'Byte Technologies — Advanced',
    createdAt: '2026-09-01',
    sourceType: 'preset',
    difficulty: 'Intermediate',
    programmingLanguages: ['TypeScript', 'Bash/Shell', 'Node.js', 'PowerShell'],
    tags: ['RealTime', 'Canvas', 'DevOps', 'Alerting', 'WebSockets'],
    chapters: [
      {
        id: 1,
        numStr: '01',
        title: 'Web & Mobile Application — Collaborative Whiteboard',
        topic: 'Web & Mobile Application — Collaborative Whiteboard.',
        objective: 'To build a collaborative whiteboard web application for intermediate students enabling multiple users to draw and chat on the same canvas in real time, using TypeScript & Node.js.',
        prompt: `Build a Collaborative Whiteboard web app, KayBiT_Whiteboard, using TypeScript on both frontend and backend with Node.js (Express) and WebSockets (Socket.IO or the native ws library) for real-time communication. Required features: a shared HTML5 Canvas that broadcasts draw events (stroke points, color, brush size) to all connected clients in the same room with minimal latency; room management; chat panel; and rate limiting.`,
        translations: {
          fr: { topic: "Application web et mobile — Tableau blanc collaboratif.", objective: "Créer une application web de tableau blanc collaboratif permettant à plusieurs utilisateurs de dessiner et discuter en temps réel via TypeScript et WebSockets." },
          es: { topic: "Aplicación web y móvil — Pizarra colaborativa.", objective: "Crear una aplicación web de pizarra colaborativa para estudiantes que permita a múltiples usuarios dibujar y chatear en tiempo real con TypeScript y WebSockets." },
          de: { topic: "Web- & Mobile-Anwendung — Kollaboratives Whiteboard.", objective: "Erstellung einer kollaborativen Whiteboard-Webanwendung, die mehreren Benutzern das Zeichnen und Chatten in Echtzeit über TypeScript und WebSockets ermöglicht." }
        }
      },
      {
        id: 2,
        numStr: '02',
        title: 'Systems, Automation & DevOps — Log Parser & Alerting Tool',
        topic: 'Systems, Automation & DevOps — Log Parser & Alerting Tool.',
        objective: 'To build a system script for intermediate students that monitors server log files for error codes, formats the data, and sends an email or webhook alert, using Bash/Shell or PowerShell.',
        prompt: `Build a Log Parser & Alerting Tool, KayBiT_LogAlert. Choose Bash/Shell (tail -f, awk/sed, curl) or PowerShell (Get-Content -Wait, Invoke-RestMethod). Monitor log files for patterns, format alerts, enforce deduplication cooldowns, and handle log rotation gracefully.`,
        translations: {
          fr: { topic: "Systèmes, automatisation et DevOps — Analyseur de logs et outil d'alerte.", objective: "Créer un script système surveillant les journaux de serveur, détectant les codes d'erreur et envoyant des alertes webhook ou courriel via Bash ou PowerShell." },
          es: { topic: "Sistemas, automatización y DevOps — Analizador de logs y herramienta de alertas.", objective: "Crear un script de sistema que monitoree archivos de log del servidor, detecte errores y envíe alertas por webhook o correo electrónico con Bash o PowerShell." },
          de: { topic: "Systeme, Automatisierung & DevOps — Log-Parser & Benachrichtigungswerkzeug.", objective: "Erstellung eines Systemskripts, das Serverprotokolldateien überwacht, Fehlercodes erkennt und Benachrichtigungen per Webhook oder E-Mail über Bash oder PowerShell versendet." }
        }
      }
    ]
  },
  {
    id: 'cybersecurity',
    subject: 'cybersecurity',
    title: 'SOC & Offensive Security Academy',
    subtitle: 'Capstone Project Curriculum',
    brandSub: 'SOC & Dual-Agent Security Labs',
    createdAt: '2026-09-01',
    sourceType: 'preset',
    difficulty: 'Expert',
    programmingLanguages: ['Go', 'Python', 'JavaScript', 'SQL', 'PHP'],
    tags: ['AppSec', 'CTF Labs', 'Docker', 'OWASP', 'Penetration Testing'],
    chapters: [
      {
        id: 1,
        numStr: '01',
        title: 'The Micro-TryHackMe',
        topic: 'Guided Learning Lab Environment.',
        objective: 'A platform where users read instructions, spin up a lightweight, real-world vulnerable container isolated to their own session, exploit it, and submit a hidden flag string to prove vulnerability discovery.',
        prompt: `Build a guided-lab CTF runner with four parts: Frontend (TypeScript/React with Xterm.js interactive terminal and flag submission), Backend (Go or Python/FastAPI using Docker SDK to spin up per-session vulnerable containers), Automation (Dockerfiles with documented patched CVEs), and Database (SQL schema for user scores and hashed flags).`,
        translations: {
          fr: { topic: "Environnement d'apprentissage guidé en laboratoire.", objective: "Une plateforme où les étudiants consultent des instructions, déploient un conteneur vulnérable isolé, l'exploitent et soumettent un flag de vérification." },
          es: { topic: "Entorno de laboratorio de aprendizaje guiado.", objective: "Una plataforma donde los usuarios leen instrucciones, inician un contenedor vulnerable aislado en su sesión, lo explotan y envían una bandera para validar." },
          de: { topic: "Geführte Lernlaborumgebung.", objective: "Eine Plattform, auf der Lernende Anweisungen lesen, einen isolierten Container mit Schwachstellen starten, diesen analysieren und ein Flag einreichen." }
        }
      },
      {
        id: 2,
        numStr: '02',
        title: 'The PortSwigger Clone',
        topic: 'Web Vulnerability Sandbox.',
        objective: 'A deliberately-vulnerable corporate web application packed with real-world flaws (SQLi, Stored XSS, BOLA) for students to audit with interception proxies like Burp Suite or OWASP ZAP.',
        prompt: `Build a deliberately-vulnerable web app (JavaScript/Node.js or PHP) strictly scoped to localhost with SQL Injection, Stored XSS, and Broken Object Level Authorization (BOLA), along with an exploit automator script in Python that validates each flaw.`,
        translations: {
          fr: { topic: "Bac à sable de vulnérabilités web.", objective: "Une application web délibérément vulnérable (SQLi, XSS stocké, BOLA) permettant aux étudiants de pratiquer l'audit avec des proxys d'interception." },
          es: { topic: "Entorno de pruebas de vulnerabilidades web.", objective: "Una aplicación web deliberadamente vulnerable con fallas reales (SQLi, XSS persistente, BOLA) para practicar auditorías de seguridad." },
          de: { topic: "Web-Schwachstellen-Sandbox.", objective: "Eine bewusst verwundbare Webanwendung mit realistischen Schwachstellen (SQLi, Stored XSS, BOLA) zur Prüfung mit Intercepting-Proxys." }
        }
      }
    ]
  },
  {
    id: 'fraud',
    subject: 'fraud',
    title: 'International Fraud Detection Academy',
    subtitle: 'Polyglot Capstone Architecture',
    brandSub: 'Enterprise Forensic Financial Computing',
    createdAt: '2026-09-01',
    sourceType: 'preset',
    difficulty: 'Expert',
    programmingLanguages: ['Go', 'Rust', 'C#', 'Java', 'Python', 'SQL', 'R'],
    tags: ['FinTech', 'Forensic Accounting', 'ETL Pipelines', 'ISA 240', 'Microservices'],
    chapters: [
      {
        id: 1,
        numStr: '01',
        title: 'Multi-Currency General Ledger Ingestion & Baseline',
        topic: 'Multi-Currency General Ledger Ingestion & Baseline.',
        objective: 'A concurrent ingestion pipeline in Go or Rust processing raw ERP data streams into a standardized schema mapping transactions, account codes, and currency conversions, flagging post-close and non-business-hours adjustments under ISA 240.',
        prompt: `Build a concurrent, high-throughput ledger ingestion service in Go or Rust. Accept raw ERP export streams (SAP IDoc/JSON, Oracle GL extracts, CSV dumps), normalize into a standardized SQL schema, and implement an auditor-rule pass flagging transactions posted after fiscal period close or outside entity business hours.`,
        translations: {
          fr: { topic: "Ingestion du grand livre multidevises et ligne de base.", objective: "Un pipeline d'ingestion concurrent en Go ou Rust normalisant les écritures comptables ERP et signalant les écritures hors heures ouvrables selon l'ISA 240." },
          es: { topic: "Ingesta y línea base del libro mayor multidivisa.", objective: "Una canalización de ingesta concurrente en Go o Rust que normaliza asientos contables ERP y marca transacciones posteriores al cierre según ISA 240." },
          de: { topic: "Multi-Währungs-Hauptbuch-Erfassung und Basislinie.", objective: "Eine parallele Ingestion-Pipeline in Go oder Rust, die ERP-Datenströme standardisiert und Buchungen außerhalb der Geschäftszeiten gemäß ISA 240 markiert." }
        }
      },
      {
        id: 2,
        numStr: '02',
        title: 'The Altman Z-Score & Beneish M-Score Microservice',
        topic: 'The Altman Z-Score & Beneish M-Score Microservice.',
        objective: 'Implement the 8-ratio Beneish M-Score and 5-ratio Altman Z-Score financial distress calculation in C# or Java with R/Python sidecar to categorize corporate entities into risk zones.',
        prompt: `Build an enterprise calculation microservice (C# .NET or Java/Spring) that exposes an API computing the 8-ratio Beneish M-Score and 5-ratio Altman Z-Score, delegating mathematical steps to R/Python, categorizing entities into risk zones, and emitting audit alerts.`,
        translations: {
          fr: { topic: "Microservice Altman Z-Score et Beneish M-Score.", objective: "Calculer les ratios financiers Beneish M-Score et Altman Z-Score en C# ou Java pour catégoriser les entreprises en zones de risque d'audit." },
          es: { topic: "Microservicio de Altman Z-Score y Beneish M-Score.", objective: "Implementar el cálculo de ratios financieros de Beneish M-Score y Altman Z-Score en C# o Java para clasificar entidades corporativas en zonas de riesgo." },
          de: { topic: "Altman Z-Score- und Beneish M-Score-Mikroservice.", objective: "Implementierung der Finanzkennzahlen Beneish M-Score und Altman Z-Score in C# oder Java zur Einstufung von Unternehmensrisiken." }
        }
      }
    ]
  }
];
