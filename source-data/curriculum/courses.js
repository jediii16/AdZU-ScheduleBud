// ─── ADZU Courses and Subject Data ────────────────────────────────────────────
// Structure: courses → year levels → system → subjects
// Each subject: { code, name, units }

export const COURSES = [
  {
    id: "bsn-stem",
    code: "BS N-stem",
    name: "Bachelor of Science in Nursing (STEM)",
    department: "College of Nursing",
  },
  {
    id: "bsn-nonstem",
    code: "BS N-nonstem",
    name: "Bachelor of Science in Nursing (Non-STEM)",
    department: "College of Nursing",
  },
  {
    id: "bscs",
    code: "BS CS",
    name: "Bachelor of Science in Computer Science",
    department: "College of Science, Information Technology and Engineering",
  },
  {
    id: "bsit",
    code: "BS IT",
    name: "Bachelor of Science in Information Technology",
    department: "College of Science, Information Technology and Engineering",
  },
  {
    id: "bsnmca",
    code: "BS NMCA",
    name: "Bachelor of Science in New Media and Computer Animation",
    department: "College of Science, Information Technology and Engineering",
  },
  {
    id: "aeet",
    code: "AEET",
    name: "Associate in Electronics Engineering Technology",
    department: "College of Science, Information Technology and Engineering",
  },
  {
    id: "bsbiomed",
    code: "BS BIOMED",
    name: "Bachelor of Science in Biology - Medical Biology",
    department: "College of Science, Information Technology and Engineering",
  },
  {
    id: "bscpe",
    code: "BS CpE",
    name: "Bachelor of Science in Computer Engineering",
    department: "College of Science, Information Technology and Engineering",
  },
  {
    id: "bsece",
    code: "BS ECE",
    name: "Bachelor of Science in Electronics Engineering",
    department: "College of Science, Information Technology and Engineering",
  },
  {
    id: "bsce-cm",
    code: "BS CE-CM",
    name: "Bachelor of Science in Civil Engineering - Construction Management",
    department: "College of Science, Information Technology and Engineering",
  },
  {
    id: "bsce-st",
    code: "BS CE-ST",
    name: "Bachelor of Science in Civil Engineering - Structural Engineering",
    department: "College of Science, Information Technology and Engineering",
  },
  {
    id: "bsce-gt",
    code: "BS CE-GT",
    name: "Bachelor of Science in Civil Engineering - Geotechnical Engineering",
    department: "College of Science, Information Technology and Engineering",
  },
  {
    id: "bsmath",
    code: "BS MATH",
    name: "Bachelor of Science in Mathematics",
    department: "College of Science, Information Technology and Engineering",
  },
  {
    id: "bsbio",
    code: "BS BIO",
    name: "Bachelor of Science in Biology - Biology Research",
    department: "College of Science, Information Technology and Engineering",
  },
  {
    id: "bsed",
    code: "BSEd",
    name: "Bachelor of Secondary Education - Major in Filipino",
    department: "School of Education",
  },
  {
    id: "beed",
    code: "BEEd",
    name: "Bachelor of Elementary Education",
    department: "School of Education",
  },
  {
    id: "bsped",
    code: "BSPed",
    name: "Bachelor of Physical Education",
    department: "School of Education",
  },
  {
    id: "beced",
    code: "BECEd",
    name: "Bachelor of Early Childhood Education",
    department: "School of Education",
  },
  {
    id: "ba-comm",
    code: "BA COMM",
    name: "Bachelor of Arts in Communication",
    department: "School of Liberal Arts",
  },
  {
    id: "baels",
    code: "BA ELS",
    name: "Bachelor of Arts in English Language Studies",
    department: "School of Liberal Arts",
  },
  {
    id: "baints",
    code: "BA INTS",
    name: "Bachelor of Arts in International Studies",
    department: "School of Liberal Arts",
  },
  {
    id: "baphilo",
    code: "BA PHILO",
    name: "Bachelor of Arts in Philosophy",
    department: "School of Liberal Arts",
  },
  {
    id: "bspsy",
    code: "BS PSY",
    name: "Bachelor of Science in Psychology",
    department: "School of Liberal Arts",
  },
  {
    id: "bsac-abm",
    code: "BSAC-ABM",
    name: "Bachelor of Science in Accountancy (ABM)",
    department: "School of Management and Accountancy",
  },
  {
    id: "bsac-nonabm",
    code: "BSAC-nonabm",
    name: "Bachelor of Science in Accountancy (Non-ABM)",
    department: "School of Management and Accountancy",
  },
  {
    id: "bsma-abm",
    code: "BSMA-ABM",
    name: "Bachelor of Science in Management Accounting (ABM)",
    department: "School of Management and Accountancy",
  },
  {
    id: "bsma-nonabm",
    code: "BSMA-nonabm",
    name: "Bachelor of Science in Management Accounting (Non-ABM)",
    department: "School of Management and Accountancy",
  },
  {
    id: "bsbafm",
    code: "BSBA-FM",
    name: "Bachelor of Science in Business Administration - Financial Management",
    department: "School of Management and Accountancy",
  },
  {
    id: "bsbamm",
    code: "BSBA-MM",
    name: "Bachelor of Science in Business Administration - Marketing Management",
    department: "School of Management and Accountancy",
  },
  {
    id: "bsbaentre",
    code: "BSBA-ENTRE",
    name: "Bachelor of Science in Business Administration - Entrepreneurship",
    department: "School of Management and Accountancy",
  },
  {
    id: "bsoa",
    code: "BSOA",
    name: "Bachelor of Science in Office Administration",
    department: "School of Management and Accountancy",
  },
  {
    id: "bslm",
    code: "BS LM",
    name: "Bachelor of Science in Legal Management",
    department: "School of Management and Accountancy",
  },
];

export const YEAR_LEVELS = [
  { id: "1", label: "1st Year" },
  { id: "2", label: "2nd Year" },
  { id: "3", label: "3rd Year" },
  { id: "4", label: "4th Year" },
];

export const SEMESTER = [
  { id: "1", label: "1st Semester" },
  { id: "2", label: "2nd Semester" },
  { id: "3", label: "Summer" },
];

// ─── Subject data per course + year ────────────────────────────────────────────
// Key format: `${courseId}-${yearId}-${semesterId}`

export const SUBJECTS_BY_COURSE_YEAR_NEW = {
  // ─── BS Nursing - Non-STEM ───────────────────────────────────────────────────────────
  "bsn-nonstem-1-1": [
    // 1st Year, 1st Semester
    { code: "PURCOM", name: "Purposive Communications", units: 3 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian - Ignatian & Islamic Traditions",
      units: 3,
    },
    {
      code: "FFP1",
      name: "Freshmen Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
    { code: "NCM 100j", name: "Theoretical Foundation of Nursing", units: 3 },
    { code: "NURANP", name: "Anatomy and Physiology", units: 5 },
    { code: "NURCHE", name: "Chemistry (for Non-STEM)", units: 5 },
  ],
  "bsn-nonstem-1-2": [
    // 1st Year, 2nd Semester
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "NURLOCR", name: "Logic and Critical Thinking", units: 3 },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    {
      code: "FFP2",
      name: "Freshmen Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
    { code: "NCM 101j", name: "Health Assessment", units: 3 },
    { code: "NCM 102j", name: "Health Education", units: 3 },
    { code: "NCM 103j", name: "Fundamentals of Nursing", units: 3 },
    { code: "NURMIC", name: "Microbiology and Parasitology", units: 4 },
  ],
  "bsn-nonstem-1-3": [
    // 1st Year, Summer
    { code: "NURBIO", name: "Biochemistry", units: 5 },
    { code: "NUR PHY", name: "Physics", units: 3 },
  ],
  "bsn-nonstem-2-1": [
    // 2nd Year, 1st Semester
    { code: "NURDR", name: "Drugs and Solutions", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person, Social & Political Dimensions",
      units: 3,
    },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games 1", units: 2 },
    {
      code: "NCM 104j",
      name: "Community Health Nursing 1- Individual & Family as Clients",
      units: 3,
    },
    { code: "NCM 105j", name: "Nutrition and Diet Therapy", units: 3 },
    { code: "NCM 106j", name: "Pharmacology", units: 3 },
    {
      code: "NCM 107j",
      name: "Care of Mother, Child Adolescent- Well Clients",
      units: 6,
    },
  ],
  "bsn-nonstem-2-2": [
    // 2nd Year, 2nd Semester
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games 2", units: 2 },
    { code: "NCM 108j", name: "Health Care Ethics-Bioethics", units: 3 },
    { code: "NCM 109j", name: "Care of Mother, Child at Risk", units: 6 },
    { code: "NCM 110j", name: "Nursing Informatics", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
  ],
  "bsn-nonstem-2-3": [
    // 2nd Year, Summer
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "ELECT-LM", name: "Philippine Culture and Literature", units: 3 },
  ],
  "bsn-nonstem-3-1": [
    // 3rd Year, 1st Semester
    { code: "SCITECS", name: "Science, Technology and Society", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "NCM 111j", name: "Nursing Research I", units: 3 },
    {
      code: "NCM 112j",
      name: "Care of Clients w/ Probs in Oxygenation, Fluid & Electrolytes, Infections, Inflammatory & Immunologic Response, Cellular Aberrations, Acute & Chronic",
      units: 9,
    },
    {
      code: "NCM 113j",
      name: "Community Health Nursing-Population Groups & Community as Clients",
      units: 3,
    },
    {
      code: "NCM 114j",
      name: "Care of Older (Group A) The Entrepreneurial Mind ",
      units: 2,
    },
  ],
  "bsn-nonstem-3-2": [
    // 3rd Year, 2nd Semester
    {
      code: "ELECT-EM",
      name: "The Entrepreneurial Mind/Care of Older (Group B)",
      units: 3,
    },
    { code: "NCM 115j", name: "Nursing Research II", units: 2 },
    {
      code: "NCM 116j",
      name: "Care of Clients w/ Problems in & Gastrointestinal Metabolism & Endocrine, Perception and Coordination, Acute & Chronic",
      units: 9,
    },
    {
      code: "NCM 117j",
      name: "Care of Clients w/ Maladaptive Patterns of Behavior, Acute & Chronic",
      units: 4,
    },
  ],
  "bsn-nonstem-4-1": [
    // 4th Year, 1st Semester
    {
      code: "NCM 118j",
      name: "Nursing Care of Client w/ Life-Threatening Conditions, Acutely III/ Multi-organ Problems, High Acuity & Emergency Situation, Acute and Chronic ",
      units: 6,
    },
    { code: "NCM 119j", name: "Nursing Leadership and Management", units: 4 },
    {
      code: "NCM 120j",
      name: "Decent Work Employment and Transcultural Nursing",
      units: 3,
    },
    { code: "NURCO 1", name: "Nursing Core Competency 1", units: 3 },
  ],
  "bsn-nonstem-4-2": [
    // 4th Year, 2nd Semester
    { code: "NCM 121j", name: "Disaster Nursing", units: 3 },
    { code: "NURCO 2", name: "Nursing Core Competency 2", units: 3 },
  ],

  // ─── BS Nursing-STEM ───────────────────────────────────────────────────────────
  "bsn-stem-1-1": [
    // 1st Year, 1st Semester
    { code: "PURCOM", name: "Purposive Communications", units: 3 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian - Ignatian & Islamic Traditions",
      units: 3,
    },
    {
      code: "FFP1",
      name: "Freshmen Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
    { code: "NCM 100j", name: "Theoretical Foundation of Nursing", units: 3 },
    { code: "NURANP", name: "Anatomy and Physiology", units: 5 },
    { code: "NURBIO", name: "Biochemistry", units: 5 },
  ],
  "bsn-stem-1-2": [
    // 1st Year, 2nd Semester
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "NURLOCR", name: "Logic and Critical Thinking", units: 3 },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    {
      code: "FFP2",
      name: "Freshmen Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
    { code: "NCM 101j", name: "Health Assessment", units: 3 },
    { code: "NCM 102j", name: "Health Education", units: 3 },
    { code: "NCM 103j", name: "Fundamentals of Nursing", units: 3 },
    { code: "NURMIC", name: "Microbiology and Parasitology", units: 4 },
  ],
  "bsn-stem-2-1": [
    // 2nd Year, 1st Semester
    { code: "NURDR", name: "Drugs and Solutions", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person, Social & Political Dimensions",
      units: 3,
    },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games 1", units: 2 },
    {
      code: "NCM 104j",
      name: "Community Health Nursing 1- Individual & Family as Clients",
      units: 3,
    },
    { code: "NCM 105j", name: "Nutrition and Diet Therapy", units: 3 },
    { code: "NCM 106j", name: "Pharmacology", units: 3 },
    {
      code: "NCM 107j",
      name: "Care of Mother, Child Adolescent- Well Clients",
      units: 6,
    },
  ],
  "bsn-stem-2-2": [
    // 2nd Year, 2nd Semester
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games 2", units: 2 },
    { code: "NCM 108j", name: "Health Care Ethics-Bioethics", units: 3 },
    { code: "NCM 109j", name: "Care of Mother, Child at Risk", units: 6 },
    { code: "NCM 110j", name: "Nursing Informatics", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
  ],
  "bsn-stem-2-3": [
    // 2nd Year, Summer
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "ELECT-LM", name: "Philippine Culture and Literature", units: 3 },
  ],
  "bsn-stem-3-1": [
    // 3rd Year, 1st Semester
    { code: "SCITECS", name: "Science, Technology and Society", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "NCM 111j", name: "Nursing Research I", units: 3 },
    {
      code: "NCM 112j",
      name: "Care of Clients w/ Probs in Oxygenation, Fluid & Electrolytes, Infections, Inflammatory & Immunologic Response, Cellular Aberrations, Acute & Chronic",
      units: 9,
    },
    {
      code: "NCM 113j",
      name: "Community Health Nursing-Population Groups & Community as Clients",
      units: 3,
    },
    {
      code: "NCM 114j",
      name: "Care of Older (Group A) The Entrepreneurial Mind ",
      units: 2,
    },
  ],
  "bsn-stem-3-2": [
    // 3rd Year, 2nd Semester
    {
      code: "ELECT-EM",
      name: "The Entrepreneurial Mind/Care of Older (Group B)",
      units: 3,
    },
    { code: "NCM 115j", name: "Nursing Research II", units: 2 },
    {
      code: "NCM 116j",
      name: "Care of Clients w/ Problems in & Gastrointestinal Metabolism & Endocrine, Perception and Coordination, Acute & Chronic",
      units: 9,
    },
    {
      code: "NCM 117j",
      name: "Care of Clients w/ Maladaptive Patterns of Behavior, Acute & Chronic",
      units: 4,
    },
  ],
  "bsn-stem-4-1": [
    // 4th Year, 1st Semester
    {
      code: "NCM 118j",
      name: "Nursing Care of Client w/ Life-Threatening Conditions, Acutely III/ Multi-organ Problems, High Acuity & Emergency Situation, Acute and Chronic ",
      units: 6,
    },
    { code: "NCM 119j", name: "Nursing Leadership and Management", units: 4 },
    {
      code: "NCM 120j",
      name: "Decent Work Employment and Transcultural Nursing",
      units: 3,
    },
    { code: "NURCO 1", name: "Nursing Core Competency 1", units: 3 },
  ],
  "bsn-stem-4-2": [
    // 4th Year, 2nd Semester
    { code: "NCM 121j", name: "Disaster Nursing", units: 3 },
    { code: "NURCO 2", name: "Nursing Core Competency 2", units: 3 },
  ],

  // ─── BS Computer Science ──────────────────────────────────────────────────────
  "bscs-1-1": [
    { code: "COMPINTRO", name: "Introduction to Computing", units: 3 },
    { code: "COMPROG1", name: "Programming 1 (Fundamentals)", units: 6 },
    { code: "WEBPROG", name: "Web Programming Fundamentals", units: 3 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bscs-1-2": [
    { code: "COMPROG2", name: "Programming 2 (Advance Programming)", units: 6 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality and Ecology in the Christian, Ignatian, and Islamic Traditions",
      units: 3,
    },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bscs-1-3": [
    { code: "DISCMATH", name: "Discrete Mathematics", units: 3 },
    { code: "LOGIC", name: "Logic Theory", units: 3 },
  ],
  "bscs-2-1": [
    { code: "DATASTRUCT", name: "Data Structures", units: 6 },
    { code: "OOP", name: "Object-oriented Programming", units: 3 },
    { code: "SAD", name: "Systems Analysis and Design", units: 3 },
    { code: "ACADWRI", name: "Academic Writing", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
    { code: "RIZAL", name: "Rizal", units: 3 },
    { code: "SCITECS", name: "Science, Technology, and Society", units: 3 },
  ],
  "bscs-2-2": [
    { code: "COGNATE1", name: "Elective Course 1", units: 3 },
    { code: "DATAMAN", name: "Database Management", units: 3 },
    { code: "SERSCRIPT", name: "Server-side Scripting", units: 3 },
    { code: "GE ELECT-DA", name: "Business Analytics", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
    { code: "PHIHUM", name: "Philosophy of the Human Person", units: 3 },
    {
      code: "VOCMIS",
      name: "Vocation and Mission in the Christian, Ignatian, and Islamic Traditions",
      units: 3,
    },
  ],
  "bscs-2-3": [
    { code: "STATISTICS", name: "Statistics", units: 3 },
    { code: "TECHPRE", name: "Technopreneurship", units: 3 },
  ],
  "bscs-3-1": [
    { code: "ALGORITHMS", name: "Algorithms Analysis", units: 3 },
    { code: "AUTOMATA", name: "Automata", units: 3 },
    { code: "COMARCH", name: "Computer Architecture", units: 3 },
    { code: "COGNATE2", name: "Elective 2", units: 3 },
    { code: "HCI", name: "Human-Computer Interaction", units: 3 },
    { code: "SOFTENG", name: "Software Engineering", units: 3 },
    { code: "WEBSYSTECH", name: "Web Systems and Technologies", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
  ],
  "bscs-3-2": [
    { code: "COGNATE3", name: "Elective 3", units: 3 },
    { code: "COGNATE4", name: "Elective 4", units: 3 },
    { code: "AI", name: "Fundamentals of Artificial Intelligence", units: 3 },
    { code: "CSRESEARCH", name: "CS Research (Thesis Approach)", units: 3 },
    { code: "PROGLANG", name: "Concepts of Programming Languages", units: 3 },
    { code: "OPSYS", name: "Operating Systems", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
    { code: "PRACTICUM1", name: "Orientation and Linkage", units: 1 },
  ],
  "bscs-3-3": [
    { code: "PRACTICUM2", name: "Practicum Proper/Immersion", units: 5 },
  ],
  "bscs-4-1": [
    { code: "DATAMIN", name: "Data Mining", units: 3 },
    { code: "INFOSEC", name: "Information Assurance and Security", units: 3 },
    { code: "PROFETHICS", name: "Social and Professional Ethics", units: 3 },
    { code: "THESIS1", name: "CS Thesis 1", units: 3 },
  ],
  "bscs-4-2": [
    { code: "THESIS2", name: "CS Thesis 2", units: 3 },
    { code: "DATACOMM", name: "Data Communications", units: 3 },
  ],

  // ─── BS Information Technology ────────────────────────────────────────────────
  "bsit-1-1": [
    { code: "COMPINTRO", name: "Introduction to Computing", units: 3 },
    { code: "COMPROG1", name: "Programming 1 (Fundamentals)", units: 6 },
    { code: "WEBPROG", name: "Web Programming Fundamentals", units: 3 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsit-1-2": [
    { code: "COMPROG2", name: "Programming 2 (Advance Programming)", units: 6 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality and Ecology in the Christian, Ignatian, and Islamic Traditions",
      units: 3,
    },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsit-1-3": [
    { code: "DISCMATH", name: "Discrete Mathematics", units: 3 },
    { code: "DIGIMUL", name: "Digital Multimedia", units: 3 },
  ],
  "bsit-2-1": [
    { code: "DATASTRUCT", name: "Data Structures", units: 6 },
    { code: "OOP", name: "Object-Oriented Programming", units: 3 },
    { code: "SAD", name: "Systems Analysis and Design", units: 3 },
    { code: "ACADWRI", name: "Academic Writing", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
    { code: "RIZAL", name: "Rizal", units: 3 },
    { code: "SCITECS", name: "Science, Technology, and Society", units: 3 },
  ],
  "bsit-2-2": [
    { code: "COGNATE1", name: "Elective Course 1", units: 3 },
    { code: "DATAMAN", name: "Database Management", units: 3 },
    { code: "SERSCRIPT", name: "Server-side Scripting", units: 3 },
    { code: "GE ELECT-DA", name: "Business Analytics", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
    { code: "PHIHUM", name: "Philosophy of the Human Person", units: 3 },
    {
      code: "VOCMIS",
      name: "Vocation and Mission in the Christian, Ignatian, and Islamic Traditions",
      units: 3,
    },
  ],
  "bsit-2-3": [
    { code: "STATISTICS", name: "Statistics", units: 3 },
    { code: "TECHPRE", name: "Technopreneurship", units: 3 },
  ],
  "bsit-3-1": [
    { code: "COGNATE2", name: "Elective 2", units: 3 },
    { code: "HCI", name: "Human-Computer Interaction", units: 3 },
    { code: "PROJMAN", name: "Project Management", units: 3 },
    { code: "SOFTENG", name: "Software Engineering", units: 3 },
    { code: "WEBADMIN", name: "Web Server Administration", units: 3 },
    { code: "WEBSYSTECH", name: "Web Systems and Technologies", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
  ],
  "bsit-3-2": [
    { code: "COGNATE3", name: "Elective 3", units: 3 },
    { code: "COGNATE4", name: "Elective 4", units: 3 },
    { code: "ITRESEARCH", name: "IT Research (Capstone Approach)", units: 3 },
    { code: "SYSINTEG", name: "Systems Integration Fundamentals", units: 3 },
    { code: "SYSTESTEVAL", name: "Systems Testing and Evaluation", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
    { code: "PRACTICUM1", name: "Orientation and Linkage", units: 1 },
  ],
  "bsit-3-3": [
    { code: "PRACTICUM2", name: "Practicum Proper/Immersion", units: 5 },
  ],
  "bsit-4-1": [
    { code: "CAPSTONE1", name: "Capstone 1", units: 3 },
    { code: "ECOMMERCE", name: "E-commerce", units: 3 },
    { code: "INFOSEC", name: "Information Assurance and Security", units: 3 },
    { code: "PROFETHICS", name: "Social and Professional Ethics", units: 3 },
  ],
  "bsit-4-2": [
    { code: "CAPSTONE2", name: "Capstone 2", units: 3 },
    { code: "DATACOMM", name: "Data Communications", units: 3 },
  ],

  // ─── BS New Media and Computer Animation ──────────────────────────────────────
  "bsnmca-1-1": [
    {
      code: "FILMAPP & PHOTOGRAPHY",
      name: "Film Appreciation and Photography",
      units: 3,
    },
    { code: "GRAPHICDES", name: "Graphic Design", units: 3 },
    { code: "SCREENPLAY1", name: "Screenplay 1", units: 3 },
    { code: "SKETCHING", name: "Introduction to Sketching", units: 3 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsnmca-1-2": [
    { code: "SCREENPLAY2", name: "Screen Play 2", units: 3 },
    {
      code: "SOUNDES & VOICEACT",
      name: "Sound Design and Voice Acting",
      units: 3,
    },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality and Ecology in the Christian, Ignatian, and Islamic Traditions",
      units: 3,
    },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsnmca-1-3": [
    { code: "PRINANIM", name: "Principles of Animation", units: 3 },
    {
      code: "VISCON",
      name: "Visual Conceptualization: Research and Development",
      units: 3,
    },
  ],
  "bsnmca-2-1": [
    { code: "3DMODELLING", name: "3D Modelling Assets", units: 6 },
    { code: "3DTEXREN", name: "3D Texturing and Rendering", units: 6 },
    { code: "ACADWRI", name: "Academic Writing", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
    { code: "RIZAL", name: "Rizal", units: 3 },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
  ],
  "bsnmca-2-2": [
    { code: "COGNATE1", name: "Elective Course 1", units: 3 },
    { code: "3DRIGGING", name: "3D Rigging", units: 6 },
    { code: "MGVE", name: "Motion Graphics and Visual Effects", units: 6 },
    { code: "GE ELECT-DA", name: "Business Analytics", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
    { code: "PHIHUM", name: "Philosophy of the Human Person", units: 3 },
    {
      code: "VOCMIS",
      name: "Vocation and Mission in the Christian, Ignatian, and Islamic Traditions",
      units: 3,
    },
  ],
  "bsnmca-2-3": [
    {
      code: "INFOTECH",
      name: "Word Processing, Spreadsheet, Presentation",
      units: 3,
    },
    { code: "TECHPRE", name: "Technopreneurship", units: 3 },
  ],
  "bsnmca-3-1": [
    { code: "COGNATE2", name: "Elective 2", units: 3 },
    { code: "3DANIMATION", name: "3D Animation", units: 6 },
    { code: "3DDYNAMICS", name: "3D Dynamics", units: 6 },
    { code: "PORTFOLIO1", name: "Portfolio Development 1", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
  ],
  "bsnmca-3-2": [
    { code: "COGNATE3", name: "Elective 3", units: 3 },
    { code: "COGNATE4", name: "Elective 4", units: 3 },
    { code: "DIGMAR", name: "Digital Marketing", units: 3 },
    { code: "FILMPROD", name: "Film Production and Industry", units: 3 },
    {
      code: "PORTFOLIO2",
      name: "Portfolio Development 2 w/Presentation",
      units: 3,
    },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
    { code: "PRACTICUM1", name: "Orientation and Linkage", units: 1 },
  ],
  "bsnmca-3-3": [
    { code: "PRACTICUM2", name: "Practicum Proper/Immersion", units: 5 },
  ],
  "bsnmca-4-1": [
    { code: "THESIS1", name: "Thesis Film Production 1", units: 3 },
    { code: "PROFETHICS", name: "Social and Professional Ethics", units: 3 },
  ],
  "bsnmca-4-2": [
    { code: "THESIS2", name: "Thesis Film Production 2", units: 3 },
  ],

  // ─── Associate in Electronics Engineering Technology ──────────────────────────
  "aeet-1-1": [
    {
      code: "EET111",
      name: "Computer Hardware Fundamentals: Troubleshooting & Maintenance",
      units: 3,
    },
    {
      code: "EET112",
      name: "Office Productivity Tools and Applications",
      units: 3,
    },
    { code: "EET113", name: "Logic Tools in Problem Solving", units: 3 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "aeet-1-2": [
    {
      code: "EET121",
      name: "Software Tools, Troubleshooting and Maintenance",
      units: 3,
    },
    {
      code: "EET122",
      name: "Internet Technologies: Tools and Applications",
      units: 3,
    },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "aeet-1-3": [
    { code: "ENG.131", name: "Computer-Aided Drafting", units: 2 },
    {
      code: "EET131",
      name: "Network Fundamentals: Wired & Wireless Networks",
      units: 3,
    },
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
  ],
  "aeet-2-1": [
    { code: "EET211", name: "Intro. to Computer Programming", units: 6 },
    { code: "EET212", name: "Fundamentals of AC & DC Circuits", units: 6 },
    { code: "COGNATE1", name: "Cognate Course 1", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "ACADWRI", name: "Academic Writing", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "aeet-2-2": [
    { code: "EET221", name: "Practicum", units: 6 },
    { code: "GE ELECT-DA", name: "Data Analytics", units: 3 },
    { code: "COGNATE2", name: "Cognate Course 2", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],

  // ─── BS Biology - Medical Biology ─────────────────────────────────────────────
  "bsbiomed-1-1": [
    { code: "BFZOOLEC", name: "General Zoology Lec", units: 3 },
    { code: "BFZOOLAB", name: "General Zoology Lab", units: 2 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "GE ELECT-GI", name: "Data Analytics (Geo Informatics)", units: 3 },
    { code: "BHPS", name: "History and Philosophy of Science", units: 3 },
    { code: "BRICHEM", name: "Bridging Course in Chemistry", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsbiomed-1-2": [
    { code: "BFBOTLEC", name: "General Botany Lec", units: 3 },
    { code: "BFBOTLAB", name: "General Botany Lab", units: 2 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsbiomed-1-3": [
    {
      code: "SPIECO",
      name: "Spirituality and Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
  ],
  "bsbiomed-2-1": [
    { code: "BFSYSLEC", name: "Systematics Lec", units: 3 },
    { code: "BFSYSLAB", name: "Systematics Lab", units: 2 },
    {
      code: "BTCHORGLec",
      name: "Chemical Biology (Organic Molecules) Lec",
      units: 3,
    },
    {
      code: "BTCHORGLab",
      name: "Chemical Biology (Organic Molecules) Lab",
      units: 1,
    },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    { code: "ACADWRI", name: "Academic Writing", units: 3 },
    { code: "BINS", name: "Instrumentation", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsbiomed-2-2": [
    {
      code: "BTBIMOLEC",
      name: "Chemical Biology (Biomolecules/Biochem) Lec",
      units: 3,
    },
    {
      code: "BTBIMOLAB",
      name: "Chemical Biology (Biomolecules/Biochem) Lab",
      units: 2,
    },
    { code: "BFMICLEC", name: "Microbiology Lec", units: 3 },
    { code: "BFMICLAB", name: "Microbiology Lab", units: 2 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsbiomed-2-3": [
    { code: "BSMITAX", name: "Microbial Taxonomy", units: 3 },
    { code: "BFECOLEC", name: "General Ecology Lec", units: 3 },
    { code: "BFECOLAB", name: "General Ecology Lab", units: 2 },
  ],
  "bsbiomed-3-1": [
    { code: "BFGNXLEC", name: "Genetics Lec", units: 3 },
    { code: "BFGNXLAB", name: "Genetics Lab", units: 2 },
    { code: "BIORES", name: "Research", units: 3 },
    {
      code: "BTCHAN Lec",
      name: "Analytical Methods for Biology Lecture",
      units: 3,
    },
    {
      code: "BTCHAN Lab",
      name: "Analytical Methods for Biology Laboratory",
      units: 2,
    },
    {
      code: "BFDEVLEC",
      name: "Developmental Biology (Plant and Animals) Lec",
      units: 3,
    },
    {
      code: "BFDEVLAB",
      name: "Developmental Biology (Plant and Animals) Lab",
      units: 2,
    },
    { code: "ETHICS", name: "Ethics", units: 3 },
  ],
  "bsbiomed-3-2": [
    { code: "BFCMLEC", name: "Cell & Molecular Biology Lec", units: 3 },
    { code: "BFCMLAB", name: "Cell & Molecular Biology Lab", units: 2 },
    { code: "BTPHYSLec", name: "Biophysics Lec", units: 3 },
    { code: "BTPHYSLab", name: "Biophysics Lab", units: 1 },
    { code: "BSHELC", name: "Introduction to Healthcare", units: 3 },
    { code: "BTSTAT", name: "Biostatistics", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "TCS-Bio1", name: "Thesis 1", units: 3 },
  ],
  "bsbiomed-3-3": [{ code: "BIOPRACT", name: "Practicum", units: 3 }],
  "bsbiomed-4-1": [
    { code: "BSCOMEC", name: "Community Ecology", units: 3 },
    { code: "BSHUGEN", name: "Human Genetics", units: 3 },
    { code: "BSPARA", name: "Parasitology", units: 3 },
    { code: "BFPSIOLec", name: "General Physiology Lec", units: 3 },
    { code: "BFPSIOLab", name: "General Physiology Lab", units: 2 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "TCS-BIO2", name: "Thesis 2", units: 3 },
  ],
  "bsbiomed-4-2": [
    { code: "BFEVOLEC", name: "Evolutionary Biology Lec", units: 3 },
    { code: "BFEVOLAB", name: "Evolutionary Biology Lab", units: 2 },
    { code: "BSHUDEV", name: "Human Development", units: 3 },
    { code: "BSHISTO", name: "Histology", units: 3 },
    { code: "BSIMMU", name: "Immunology", units: 3 },
    { code: "BSHAP", name: "Human Anatomy and Physiology", units: 3 },
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
  ],

  // ─── BS Computer Engineering ──────────────────────────────────────────────────
  "bscpe-1-1": [
    { code: "ENG.111", name: "Pre-Calculus Mathematics", units: 4 },
    { code: "ENG.112", name: "Calculus 1: Differential Calculus", units: 3 },
    { code: "ENG.101", name: "Physics 1: Physics for Engineers", units: 6 },
    { code: "CPE.111", name: "Computer Engineering as a Discipline", units: 1 },
    { code: "ENG.102", name: "Chemistry for Engineers", units: 6 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bscpe-1-2": [
    { code: "ENG.121", name: "Calculus 2: Integral Calculus", units: 3 },
    { code: "CPE.021", name: "Programming Logic and Design", units: 6 },
    { code: "ENG.123", name: "Discrete Mathematics", units: 3 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bscpe-1-3": [
    { code: "ENG.131", name: "Computer-Aided Design", units: 2 },
    { code: "ENG.032", name: "Engineering Data Analysis", units: 3 },
    { code: "ENG.132", name: "Engineering Management", units: 3 },
  ],
  "bscpe-2-1": [
    { code: "CPE.211", name: "Object-Oriented Programming", units: 6 },
    { code: "CPE.212", name: "Fundamentals of Electrical Circuits", units: 6 },
    { code: "ENG.211", name: "Differential Equations", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "ACADWRI", name: "Academic Writing", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "SCIETECS", name: "Science, Technology & Society", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bscpe-2-2": [
    { code: "CPE.221", name: "Data Structure and Algorithm", units: 6 },
    { code: "CPE.222", name: "Fundamentals of Electronic Circuits", units: 6 },
    { code: "GE ELECT-DA", name: "Data Analytics", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    { code: "GE-ELECT LM", name: "Literatures of Mindanao", units: 3 },
    {
      code: "VOCMIS",
      name: "Vocation and Mission in the Christian, Ignatian and Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bscpe-2-3": [
    { code: "ENG.031", name: "Engineering Economics", units: 3 },
    {
      code: "ENG.231",
      name: "Occupational, Health & Safety Engineering",
      units: 3,
    },
    { code: "ENG.232", name: "Numerical Methods", units: 3 },
  ],
  "bscpe-3-1": [
    { code: "CPE.311", name: "Operating Systems", units: 3 },
    { code: "CPE.312", name: "Logic Circuits and Design", units: 6 },
    {
      code: "CPE.313",
      name: "Fundamentals of Mixed Signals & Sensors",
      units: 6,
    },
    { code: "CPE.314", name: "Data & Digital Communications", units: 3 },
    { code: "ENG.311", name: "Technopreneurship", units: 3 },
    { code: "CPE.315", name: "Computer Network & Security", units: 6 },
    { code: "CpECog1", name: "Cognate Course 1 - Cybersecurity", units: 3 },
  ],
  "bscpe-3-2": [
    { code: "CPE.321", name: "Software Design", units: 6 },
    { code: "CPE.322", name: "Microprocessors", units: 6 },
    { code: "ENG.321", name: "Feedback & Control Systems", units: 3 },
    { code: "ENG.322", name: "Methods of Research", units: 3 },
    { code: "CPE.323", name: "Introduction to HDL", units: 3 },
    { code: "CPE.324", name: "Embedded Systems", units: 6 },
    {
      code: "CpECog2",
      name: "Cognate Course 2 - Intro to Mobile Apps Development",
      units: 3,
    },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
  ],
  "bscpe-3-3": [
    {
      code: "CpECog3",
      name: "Cognate Course 3 - Fundamentals of DBMS",
      units: 3,
    },
  ],
  "bscpe-4-1": [
    { code: "CPE.411", name: "CpE Practice and Design 1", units: 3 },
    { code: "CPE.412", name: "Digital Signal Processing", units: 6 },
    {
      code: "CPE.413",
      name: "Computer Organization and Architecture",
      units: 6,
    },
    { code: "CPE.414", name: "Emerging Technologies in CpE", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
  ],
  "bscpe-4-2": [
    { code: "CPE.421", name: "CpE Practice and Design 2", units: 3 },
    { code: "CPE.422", name: "Emerging Technologies in CpE", units: 3 },
    { code: "CPE.423", name: "CpE Laws & Professional Practice", units: 3 },
    {
      code: "ENG.421",
      name: "Field Placement and Report (Immersion and OJT 300 hours)",
      units: 3,
    },
  ],

  // ─── BS Electronics Engineering ───────────────────────────────────────────────
  "bsece-1-1": [
    { code: "ENG.111", name: "Pre-Calculus Mathematics", units: 4 },
    { code: "ENG.112", name: "Calculus 1: Differential Calculus", units: 3 },
    { code: "ENG.101", name: "Physics 1: Physics for Engineers", units: 6 },
    { code: "ENG.102", name: "Chemistry for Engineers", units: 6 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsece-1-2": [
    { code: "ENG.121", name: "Calculus 2: Integral Calculus", units: 3 },
    { code: "ENG.122", name: "Physics 2", units: 6 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsece-1-3": [
    { code: "ENG.131", name: "Computer-Aided Design", units: 2 },
    { code: "ENG.032", name: "Engineering Data Analysis", units: 3 },
    { code: "ENG.132", name: "Engineering Management", units: 3 },
  ],
  "bsece-2-1": [
    { code: "ECE.211", name: "Fundamentals of Computer Programming", units: 6 },
    { code: "ECE.212", name: "Circuits 1", units: 6 },
    { code: "ENG.211", name: "Differential Equations", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "ACADWRI", name: "Academic Writing", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsece-2-2": [
    { code: "ECE.221", name: "Advanced Engineering Math for ECE", units: 6 },
    { code: "ECE.222", name: "Circuits 2", units: 6 },
    {
      code: "ECE.223",
      name: "Electronics 1: Electronic Devices & Circuits",
      units: 6,
    },
    { code: "GE ELECT-DA", name: "Data Analytics", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    {
      code: "VOCMIS",
      name: "Vocation and Mission in the Christian, Ignatian and Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsece-2-3": [
    { code: "ENG.031", name: "Engineering Economics", units: 3 },
    {
      code: "ENG.231",
      name: "Occupational, Health & Safety Engineering",
      units: 3,
    },
    { code: "ENG.233", name: "Materials Science and Engineering", units: 3 },
  ],
  "bsece-3-1": [
    {
      code: "ECE.311",
      name: "Electronics 2: Electronics Circuit Analysis & Design",
      units: 6,
    },
    {
      code: "ECE.312",
      name: "Digital Electronics 1: Logic Circuit and Switching Theory",
      units: 6,
    },
    { code: "ECE.313", name: "Electromagnetics 1 (Vector Analysis)", units: 4 },
    { code: "ECE.314", name: "Signals, Spectra & Signal Processing", units: 6 },
    {
      code: "ECE.315",
      name: "Communications 1: Principles of Communications Systems",
      units: 6,
    },
    { code: "ENG.311", name: "Technopreneurship", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
  ],
  "bsece-3-2": [
    {
      code: "ECE.321",
      name: "Electronics 3: Electronic Systems and Design",
      units: 6,
    },
    {
      code: "ECE.322",
      name: "Digital Electronics 2: Microprocessor & Microcontroller Systems",
      units: 6,
    },
    {
      code: "ECE.323",
      name: "Communications 2: Modulation and Coding Technique",
      units: 6,
    },
    { code: "ENG.321", name: "Feedback & Control Systems", units: 6 },
    { code: "ENG.322", name: "Methods of Research", units: 3 },
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
  ],
  "bsece-3-3": [
    {
      code: "ECECog1",
      name: "Cognate Course 1 - Mobile Application Programming",
      units: 3,
    },
  ],
  "bsece-4-1": [
    { code: "ECE.411", name: "ECE Design & Capstone Project 1", units: 3 },
    {
      code: "ECE.412",
      name: "Communications 3: Transmission Media and Antenna Systems",
      units: 6,
    },
    {
      code: "ECE.413",
      name: "Communications 4: Data Communications",
      units: 6,
    },
    { code: "ECECog2", name: "Cognate Course 2 - Machine Learning", units: 3 },
    { code: "ECE.415", name: "ECE Integration Course 1", units: 3 },
    { code: "ENG.411", name: "Environmental Science & Engineering", units: 3 },
  ],
  "bsece-4-2": [
    { code: "ECE.421", name: "ECE Design & Capstone Project 2", units: 3 },
    {
      code: "ECE.422",
      name: "ECE Laws, Contracts, Ethics and Standards",
      units: 3,
    },
    { code: "ENG.421", name: "Seminars and Colloquium", units: 3 },
    {
      code: "ENG.422",
      name: "Field Placement and Report (Immersion and OJT 300 Hours)",
      units: 3,
    },
    { code: "ECE.425", name: "ECE Integration Course 2", units: 3 },
  ],

  // ─── BS Civil Engineering (Construction Management) ───────────────────────────
  "bsce-cm-1-1": [
    { code: "CE.111", name: "Civil Engineering Orientation", units: 2 },
    { code: "CE.112", name: "Computer Fundamentals and Programming", units: 6 },
    { code: "ENG.111", name: "Pre-Calculus Mathematics", units: 4 },
    { code: "ENG.112", name: "Calculus 1: Differential Calculus", units: 3 },
    { code: "ENG.102", name: "Chemistry for Engineers", units: 6 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "NSTP1", name: "NSTP", units: 3, countForGPA: false },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsce-cm-1-2": [
    { code: "CE.121", name: "Engineering Drawing and Plans", units: 3 },
    { code: "ENG.121", name: "Calculus 2: Integral Calculus", units: 3 },
    { code: "ENG.101", name: "Physics 1: Physics for Engineers", units: 6 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "NSTP2", name: "NSTP", units: 3, countForGPA: false },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsce-cm-1-3": [
    { code: "CE.131", name: "Computer-Aided Design for CE", units: 3 },
    { code: "ENG.132", name: "Engineering Management for CE", units: 2 },
    { code: "ENG.032", name: "Engineering Data Analysis", units: 3 },
  ],
  "bsce-cm-2-1": [
    { code: "CE.211", name: "Statics of Rigid Bodies", units: 3 },
    { code: "CE.212", name: "Fundamentals of Surveying", units: 6 },
    { code: "ENG.211", name: "Differential Equations", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "SCIETECS", name: "Science, Technology & Society", units: 3 },
    { code: "ACADWRI", name: "Academic Writing", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsce-cm-2-2": [
    { code: "CE.221", name: "Dynamics of Rigid Bodies", units: 2 },
    { code: "CE.222", name: "Geology for Civil Engineers", units: 2 },
    { code: "CE.223", name: "Mechanics of Deformable Bodies", units: 4 },
    { code: "CE.224", name: "Construction Materials and Testing", units: 5 },
    { code: "GE-Elect DA", name: "Data Analytics", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsce-cm-2-3": [
    { code: "CE.231", name: "Engineering Economics", units: 2 },
    { code: "CE.232", name: "Numerical Solutions to CE Problems", units: 5 },
    { code: "CE.233", name: "Engineering Utilities 1", units: 3 },
  ],
  "bsce-cm-3-1": [
    { code: "CE.311", name: "Structural Theory", units: 6 },
    { code: "CE.312", name: "Highway and Railroad Engineering", units: 3 },
    { code: "CE.313", name: "Hydrology", units: 2 },
    { code: "CE.314", name: "Engineering Utilities 2", units: 3 },
    {
      code: "CE.315",
      name: "Principles of Transportation Engineering",
      units: 3,
    },
    { code: "CE.316", name: "CE Law, Contracts and Ethics", units: 2 },
    { code: "ENG.311", name: "Technopreneurship", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
  ],
  "bsce-cm-3-2": [
    { code: "CE.321", name: "Building System Design", units: 5 },
    { code: "CE.322", name: "Principles of Steel Design", units: 5 },
    {
      code: "CE.323",
      name: "Principles of Reinforced/Pre-Stressed Concrete",
      units: 6,
    },
    { code: "CE.324", name: "Hydraulics", units: 7 },
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
  ],
  "bsce-cm-3-3": [
    { code: "CE.331C", name: "Construction Cost Engineering", units: 3 },
    { code: "CE.332C", name: "Project Construction and Management", units: 3 },
    {
      code: "CE.333",
      name: "Construction Methods and Project Management",
      units: 3,
    },
  ],
  "bsce-cm-4-1": [
    { code: "CE.411", name: "CE Project 1", units: 4 },
    {
      code: "CE.412",
      name: "Geotechnical Engineering (Soil Mechanics)",
      units: 6,
    },
    {
      code: "CE.413C",
      name: "Advanced Construction Methods and Equipment",
      units: 3,
    },
    { code: "CE.414", name: "Quantity Surveying", units: 4 },
    {
      code: "CE.415C",
      name: "Construction Occupational Safety and Health",
      units: 3,
    },
    { code: "CE.416C", name: "Database Management in Construction", units: 3 },
    { code: "CE.417", name: "CE Integration Course 1", units: 3 },
  ],
  "bsce-cm-4-2": [
    { code: "CE.421", name: "CE Project 2", units: 4 },
    {
      code: "CE.422",
      name: "CE on the Job Training (240 hrs. Minimum)",
      units: 5,
    },
    { code: "CE.427", name: "CE Integration Course 2", units: 3 },
  ],
  "bsce-cm-4-3": [],

  // ─── BS Civil Engineering (Structural) ────────────────────────────────────────
  "bsce-st-1-1": [
    { code: "CE.111", name: "Civil Engineering Orientation", units: 2 },
    { code: "CE.112", name: "Computer Fundamentals and Programming", units: 6 },
    { code: "ENG.111", name: "Pre-Calculus Mathematics", units: 4 },
    { code: "ENG.112", name: "Calculus 1: Differential Calculus", units: 3 },
    { code: "ENG.102", name: "Chemistry for Engineers", units: 6 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsce-st-1-2": [
    { code: "CE.121", name: "Engineering Drawing and Plans", units: 3 },
    { code: "ENG.121", name: "Calculus 2: Integral Calculus", units: 3 },
    { code: "ENG.101", name: "Physics 1: Physics for Engineers", units: 6 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsce-st-1-3": [
    { code: "CE.131", name: "Computer-Aided Design for CE", units: 3 },
    { code: "ENG.132", name: "Engineering Management for CE", units: 2 },
    { code: "ENG.032", name: "Engineering Data Analysis", units: 3 },
  ],
  "bsce-st-2-1": [
    { code: "CE.211", name: "Statics of Rigid Bodies", units: 3 },
    { code: "CE.212", name: "Fundamentals of Surveying", units: 6 },
    { code: "ENG.211", name: "Differential Equations", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "SCIETECS", name: "Science, Technology & Society", units: 3 },
    { code: "ACADWRI", name: "Academic Writing", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsce-st-2-2": [
    { code: "CE.221", name: "Dynamics of Rigid Bodies", units: 2 },
    { code: "CE.222", name: "Geology for Civil Engineers", units: 2 },
    { code: "CE.223", name: "Mechanics of Deformable Bodies", units: 4 },
    { code: "CE.224", name: "Construction Materials and Testing", units: 5 },
    { code: "GE-ELECT DA", name: "Data Analytics", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsce-st-2-3": [
    { code: "CE.231", name: "Engineering Economics", units: 2 },
    { code: "CE.232", name: "Numerical Solutions to CE Problems", units: 5 },
    { code: "CE.233", name: "Engineering Utilities 1", units: 3 },
  ],
  "bsce-st-3-1": [
    { code: "CE.311", name: "Structural Theory", units: 6 },
    { code: "CE.312", name: "Highway and Railroad Engineering", units: 3 },
    { code: "CE.313", name: "Hydrology", units: 2 },
    { code: "CE.314", name: "Engineering Utilities 2", units: 3 },
    {
      code: "CE.315",
      name: "Principles of Transportation Engineering",
      units: 3,
    },
    { code: "CE.316", name: "CE Law, Contracts and Ethics", units: 2 },
    { code: "ENG.311", name: "Technopreneurship", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
  ],
  "bsce-st-3-2": [
    { code: "CE.321", name: "Building System Design", units: 5 },
    { code: "CE.322", name: "Principles of Steel Design", units: 5 },
    {
      code: "CE.323",
      name: "Principles of Reinforced/Pre-Stressed Concrete",
      units: 6,
    },
    { code: "CE.324", name: "Hydraulics", units: 7 },
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
  ],
  "bsce-st-3-3": [
    { code: "CE.331S", name: "Design of Steel Structures", units: 3 },
    { code: "CE.332S", name: "Bridge Engineering", units: 3 },
    {
      code: "CE.333",
      name: "Construction Methods and Project Management",
      units: 3,
    },
  ],
  "bsce-st-4-1": [
    { code: "CE.411", name: "CE Project 1", units: 4 },
    {
      code: "CE.412",
      name: "Geotechnical Engineering (Soil Mechanics)",
      units: 6,
    },
    { code: "CE.413S", name: "Pre-stressed Concrete Design", units: 3 },
    { code: "CE.414", name: "Quantity Surveying", units: 4 },
    { code: "CE.415S", name: "Reinforced Concrete Design", units: 3 },
    { code: "CE.416S", name: "Foundation and Retaining Wall Design", units: 3 },
    { code: "CE.417", name: "CE Integration Course 1", units: 3 },
  ],
  "bsce-st-4-2": [
    { code: "CE.421", name: "CE Project 2", units: 4 },
    {
      code: "CE.422",
      name: "CE on the Job Training (240 hrs. Minimum)",
      units: 5,
    },
    { code: "CE.423", name: "CE Integration Course 2", units: 3 },
  ],
  "bsce-st-4-3": [],

  // ─── BS Civil Engineering (Geo-Technical) ─────────────────────────────────────
  "bsce-gt-1-1": [
    { code: "CE.111", name: "Civil Engineering Orientation", units: 2 },
    { code: "CE.112", name: "Computer Fundamentals and Programming", units: 6 },
    { code: "ENG.111", name: "Pre-Calculus Mathematics", units: 4 },
    { code: "ENG.112", name: "Calculus 1: Differential Calculus", units: 3 },
    { code: "ENG.102", name: "Chemistry for Engineers", units: 6 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program",
      units: 3,
      countForGPA: false,
    },
    { code: "NSTP1", name: "NSTP", units: 3, countForGPA: false },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsce-gt-1-2": [
    { code: "CE.121", name: "Engineering Drawing and Plans", units: 3 },
    { code: "ENG.121", name: "Calculus 2: Integral Calculus", units: 3 },
    { code: "ENG.101", name: "Physics 1: Physics for Engineers", units: 6 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    {
      code: "FFP2",
      name: "Freshman Formation Program",
      units: 3,
      countForGPA: false,
    },
    { code: "NSTP2", name: "NSTP", units: 3, countForGPA: false },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsce-gt-1-3": [
    { code: "CE.131", name: "Computer-Aided Design for CE", units: 3 },
    { code: "ENG.132", name: "Engineering Management for CE", units: 2 },
    { code: "ENG.032", name: "Engineering Data Analysis", units: 3 },
  ],
  "bsce-gt-2-1": [
    { code: "CE.211", name: "Statics of Rigid Bodies", units: 3 },
    { code: "CE.212", name: "Fundamentals of Surveying", units: 6 },
    { code: "ENG.211", name: "Differential Equations", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "SCIETECS", name: "Science, Technology & Society", units: 3 },
    { code: "ACADWRI", name: "Academic Writing", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsce-gt-2-2": [
    { code: "CE.221", name: "Dynamics of Rigid Bodies", units: 2 },
    { code: "CE.222", name: "Geology for Civil Engineers", units: 2 },
    { code: "CE.223", name: "Mechanics of Deformable Bodies", units: 4 },
    { code: "CE.224", name: "Construction Materials and Testing", units: 5 },
    { code: "GE-Elect DA", name: "Data Analytics", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsce-gt-2-3": [
    { code: "CE.231", name: "Engineering Economics", units: 2 },
    { code: "CE.232", name: "Numerical Solutions to CE Problems", units: 5 },
    { code: "CE.233", name: "Engineering Utilities 1", units: 3 },
  ],
  "bsce-gt-3-1": [
    { code: "CE.311", name: "Structural Theory", units: 6 },
    { code: "CE.312", name: "Highway and Railroad Engineering", units: 3 },
    { code: "CE.313", name: "Hydrology", units: 2 },
    { code: "CE.314", name: "Engineering Utilities 2", units: 3 },
    {
      code: "CE.315",
      name: "Principles of Transportation Engineering",
      units: 3,
    },
    { code: "CE.316", name: "CE Law, Contracts and Ethics", units: 2 },
    { code: "ENG.311", name: "Technopreneurship", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
  ],
  "bsce-gt-3-2": [
    { code: "CE.321", name: "Building System Design", units: 5 },
    { code: "CE.322", name: "Principles of Steel Design", units: 5 },
    {
      code: "CE.323",
      name: "Principles of Reinforced/Pre-Stressed Concrete",
      units: 6,
    },
    { code: "CE.324", name: "Hydraulics", units: 7 },
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
  ],
  "bsce-gt-3-3": [
    { code: "CE.331G", name: "Foundation Engineering", units: 3 },
    { code: "CE.332G", name: "Geotechnical Earthquake Engineering", units: 3 },
    {
      code: "CE.333",
      name: "Construction Methods and Project Management",
      units: 3,
    },
  ],
  "bsce-gt-4-1": [
    { code: "CE.411", name: "CE Project 1", units: 4 },
    {
      code: "CE.412",
      name: "Geotechnical Engineering (Soil Mechanics)",
      units: 6,
    },
    {
      code: "CE.413G",
      name: "Geotechnical Engineering (Rock Mechanics)",
      units: 3,
    },
    { code: "CE.414", name: "Quantity Surveying", units: 4 },
    { code: "CE.415G", name: "Deep Foundation Engineering", units: 3 },
    { code: "CE.416G", name: "Ground Improvement", units: 3 },
    { code: "CE.417", name: "CE Integration Course 1", units: 3 },
  ],
  "bsce-gt-4-2": [
    { code: "CE.421", name: "CE Project 2", units: 4 },
    {
      code: "CE.422",
      name: "CE on the Job Training (240 hrs. Minimum)",
      units: 5,
    },
    { code: "CE.423", name: "CE Integration Course 2", units: 3 },
  ],
  "bsce-gt-4-3": [],

  // ─── BS Mathematics ───────────────────────────────────────────────────────────
  "bsmath-1-1": [
    { code: "MAT 101", name: "Fundamental Concepts of Mathematics", units: 3 },
    { code: "MATEL 1", name: "Analytic Geometry", units: 3 },
    { code: "MATEL 2", name: "Algebra and Trigonometry", units: 3 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "MAT 102", name: "Fundamentals of Computing I", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsmath-1-2": [
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian and Islamic Traditions",
      units: 3,
    },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    { code: "MAT 103", name: "Calculus I", units: 5 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsmath-1-3": [
    { code: "MAT 104", name: "Linear Algebra", units: 3 },
    { code: "MAT 105", name: "Probability", units: 3 },
  ],
  "bsmath-2-1": [
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    { code: "MAT 106", name: "Calculus II", units: 5 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "MATEL 3", name: "Operations Research", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "ACADWRI", name: "Academic Writing", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsmath-2-2": [
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian and Islamic Traditions",
      units: 3,
    },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    { code: "MAT 107", name: "Calculus III", units: 3 },
    { code: "GE ELECT-DA", name: "Data Analytics", units: 3 },
    { code: "MAT 108", name: "Number Theory", units: 3 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsmath-2-3": [
    { code: "MATEL 4", name: "Graph Theory", units: 3 },
    { code: "MAT 109", name: "Differential Equations I", units: 3 },
  ],
  "bsmath-3-1": [
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "MAT 110", name: "Advanced Calculus I", units: 3 },
    { code: "MAT 111", name: "Advanced Course in Analysis", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "MAT RES", name: "Research", units: 3 },
    { code: "SSED 11", name: "General Physics I", units: 4 },
  ],
  "bsmath-3-2": [
    { code: "MAT 112", name: "Modern Geometry", units: 3 },
    { code: "MAT 113", name: "Numerical Analysis", units: 3 },
    {
      code: "MATEL 5",
      name: "Mathematical Investigation & Modelling",
      units: 3,
    },
    { code: "SSED 17", name: "General Physics II", units: 4 },
    { code: "MAT 114", name: "Abstract Algebra I", units: 3 },
    { code: "MAT Elect", name: "Data Mining", units: 3 },
    { code: "MATEL 6", name: "Theory of Interest", units: 3 },
  ],
  "bsmath-3-3": [],
  "bsmath-4-1": [
    { code: "MATEL 7", name: "Real Analysis", units: 3 },
    { code: "MAT 115", name: "Statistical Theory", units: 3 },
    { code: "PED ASSESS 1", name: "Assessment of Learning I", units: 3 },
    { code: "THESIS-MAT1", name: "Thesis I", units: 3 },
  ],
  "bsmath-4-2": [
    { code: "MAT 116", name: "Topology", units: 3 },
    { code: "MAT 117", name: "Complex Analysis", units: 3 },
    {
      code: "PED FACI LCT",
      name: "Facilitating Learner-centered Teaching",
      units: 3,
    },
    { code: "THESIS-MAT II", name: "Thesis II", units: 3 },
  ],
  "bsmath-4-3": [],

  // ─── BS Biology - Biology Research ────────────────────────────────────────────
  "bsbio-1-1": [
    { code: "BFZOOLEC", name: "General Zoology Lec", units: 3 },
    { code: "BFZOOLAB", name: "General Zoology Lab", units: 2 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "GE ELECT-GI", name: "Data Analytics (Geo Informatics)", units: 3 },
    { code: "BHPS", name: "History and Philosophy of Science", units: 3 },
    { code: "BRICHEM", name: "Bridging Course in Chemistry", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "NSTP1", name: "NSTP", units: 3, countForGPA: false },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsbio-1-2": [
    { code: "BFBOTLEC", name: "General Botany Lec", units: 3 },
    { code: "BFBOTLAB", name: "General Botany Lab", units: 2 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "NSTP2", name: "NSTP", units: 3, countForGPA: false },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsbio-1-3": [
    {
      code: "SPIECO",
      name: "Spirituality and Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
  ],
  "bsbio-2-1": [
    { code: "BFSYSLEC", name: "Systematics Lec", units: 3 },
    { code: "BFSYSLAB", name: "Systematics Lab", units: 2 },
    {
      code: "BTCHORGLec",
      name: "Chemical Biology (Organic Molecules) Lec",
      units: 3,
    },
    {
      code: "BTCHORGLab",
      name: "Chemical Biology (Organic Molecules) Lab",
      units: 1,
    },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    { code: "ACADWRI", name: "Academic Writing", units: 3 },
    { code: "BINS", name: "Instrumentation", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsbio-2-2": [
    {
      code: "BTBIMOLEC",
      name: "Chemical Biology (Biomolecules/Biochem) Lec",
      units: 3,
    },
    {
      code: "BTBIMOLAB",
      name: "Chemical Biology (Biomolecules/Biochem) Lab",
      units: 2,
    },
    { code: "BFMICLEC", name: "Microbiology Lec", units: 3 },
    { code: "BFMICLAB", name: "Microbiology Lab", units: 2 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsbio-2-3": [
    { code: "BSMITAX", name: "Microbial Taxonomy", units: 3 },
    { code: "BFECOLEC", name: "General Ecology Lec", units: 3 },
    { code: "BFECOLAB", name: "General Ecology Lab", units: 2 },
  ],
  "bsbio-3-1": [
    { code: "BFGNXLEC", name: "Genetics Lec", units: 3 },
    { code: "BFGNXLAB", name: "Genetics Lab", units: 2 },
    { code: "BIORES", name: "Research", units: 3 },
    {
      code: "BTCHAN Lec",
      name: "Analytical Methods for Biology Lecture",
      units: 3,
    },
    {
      code: "BTCHAN Lab",
      name: "Analytical Methods for Biology Laboratory",
      units: 2,
    },
    {
      code: "BFDEVLEC",
      name: "Developmental Biology (Plant and Animals) Lec",
      units: 3,
    },
    {
      code: "BFDEVLAB",
      name: "Developmental Biology (Plant and Animals) Lab",
      units: 2,
    },
    { code: "ETHICS", name: "Ethics", units: 3 },
  ],
  "bsbio-3-2": [
    { code: "BFCMLEC", name: "Cell & Molecular Biology Lec", units: 3 },
    { code: "BFCMLAB", name: "Cell & Molecular Biology Lab", units: 2 },
    { code: "BTPHYSLec", name: "Biophysics Lec", units: 3 },
    { code: "BTPHYSLab", name: "Biophysics Lab", units: 1 },
    { code: "BTSTAT", name: "Biostatistics", units: 3 },
    { code: "BSTICULT", name: "Plant & Animal Tissue Culture", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "TCS-Bio1", name: "Thesis 1", units: 3 },
  ],
  "bsbio-3-3": [{ code: "BIOPRACT", name: "Practicum", units: 3 }],
  "bsbio-4-1": [
    { code: "BSTAXO", name: "Taxonomy of Higher Vascular Plants", units: 3 },
    {
      code: "BSTECH",
      name: "Agricultural, Health and Industrial Biotechnology",
      units: 3,
    },
    { code: "BSPARA", name: "Parasitology", units: 3 },
    { code: "BFPSIOLEC", name: "General Physiology Lec", units: 3 },
    { code: "BFPSIOLAB", name: "General Physiology Lab", units: 2 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "TCS-BIO2", name: "Thesis II", units: 3 },
  ],
  "bsbio-4-2": [
    { code: "BFEVOLEC", name: "Evolutionary Biology Lec", units: 3 },
    { code: "BFEVOLAB", name: "Evolutionary Biology Lab", units: 2 },
    { code: "BSETBOT", name: "Ethnobotany", units: 3 },
    { code: "BSRECOM", name: "Recombination DNA Techniques", units: 3 },
    { code: "BSIMMU", name: "Immunology", units: 3 },
    { code: "BSPAMOR", name: "Plant and Animal Morphology", units: 3 },
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
  ],
  "bsbio-4-3": [],

  // ─── BPEd ─────────────────────────────────────────────────────────────────────
  "bsped-1-1": [
    {
      code: "PED CALPRIN",
      name: "Child and Adolescent Learners & Learning Principles",
      units: 3,
    },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsped-1-2": [
    {
      code: "PED FSIED",
      name: "Foundations of Special & Inclusive Education",
      units: 3,
    },
    {
      code: "PED FACILCT",
      name: "Facilitating Learner-centered Teaching",
      units: 3,
    },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    {
      code: "KOMFIL",
      name: "Kontekstwalisadong Komunikasyon sa Filipino",
      units: 3,
    },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsped-1-3": [
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "LITMIN", name: "Literatures of Mindanao", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
  ],
  "bsped-2-1": [
    {
      code: "PED TECHTCH",
      name: "Technology for Teaching & Learning 1",
      units: 3,
    },
    { code: "PED ASSESS 1", name: "Assessment of Learning 1", units: 3 },
    {
      code: "PE PESFOUN",
      name: "Philosophical & Socio-Anthro Foundations of PE & Sports",
      units: 3,
    },
    {
      code: "PE ANAPHYS",
      name: "Anatomy & Physiology of Human Movement",
      units: 3,
    },
    {
      code: "PE PHYEXPA",
      name: "Physiology of Exercise & Physical Activity",
      units: 3,
    },
    {
      code: "PE PRIMOT",
      name: "Principles of Motor Control & Learning of Exercise, Sports & Dance",
      units: 3,
    },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsped-2-2": [
    {
      code: "PED BENLIT",
      name: "Building & Enhancing Literacy Skills Across the Curriculum",
      units: 3,
    },
    { code: "PED ASSESS 2", name: "Assessment of Learning 2", units: 3 },
    {
      code: "PE APPMOT",
      name: "Applied Motor Control & Learning of Exercise, Sports and Dance",
      units: 3,
    },
    { code: "PE MOVEED", name: "Movement Education", units: 3 },
    { code: "PE PHILTD", name: "Philippine Traditional Dances", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "ACADWRI", name: "Academic Writing", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsped-2-3": [
    {
      code: "PE EMSAFE",
      name: "Emergency Preparedness & Safety Management",
      units: 3,
    },
    {
      code: "PE DRUCOED",
      name: "Drug Education, Consumer Health Educ. & Healthy Eating",
      units: 3,
    },
    { code: "PE ELEC MK12", name: "Elective/Cognate (K-12 Music)", units: 3 },
  ],
  "bsped-3-1": [
    { code: "PED TCHPROF", name: "The Teaching Profession", units: 3 },
    { code: "PED TCHCUR", name: "The Teacher & School Curriculum", units: 3 },
    { code: "PE INDDUS", name: "Individual & Dual Sports", units: 3 },
    { code: "PE PHITRAG", name: "Philippine Traditional Games", units: 3 },
    {
      code: "PE INTDAN",
      name: "International Dance & Other Dance Forms",
      units: 3,
    },
    {
      code: "PE PERCEH",
      name: "Personal, Community & Environmental Health",
      units: 3,
    },
    {
      code: "PE TCHPHE",
      name: "Process of Teaching Physical and Health Education",
      units: 3,
    },
    {
      code: "PE RESPET1",
      name: "Intro to Research in Physical Education",
      units: 3,
    },
  ],
  "bsped-3-2": [
    {
      code: "PED TCHCOM",
      name: "The Teacher & Community, School Culture & Organizational Leadership",
      units: 3,
    },
    { code: "PE AQUA", name: "Swimming and Aquatics", units: 3 },
    { code: "PE COSHP", name: "Coordinated School Health Program", units: 3 },
    { code: "PE CURASPE", name: "Curriculum & Assessment for PE&H", units: 3 },
    { code: "PE TEAMS", name: "Team Sports", units: 3 },
    { code: "PE SPORPSY", name: "Sports & Exercise Psychology", units: 3 },
    {
      code: "PE RESPET2",
      name: "Research in Physical Education Teaching",
      units: 3,
    },
    { code: "PEACE ED", name: "Peace Education", units: 3 },
  ],
  "bsped-3-3": [
    {
      code: "PE TECHTCH",
      name: "Technology Application in Teaching Physical and Health Education",
      units: 3,
    },
    { code: "PE ELECT AK12", name: "Elective/Cognate (K-12 Arts)", units: 3 },
  ],
  "bsped-4-1": [
    {
      code: "PED FS1",
      name: "Field Study 1: Observation of Teaching & Learning in Actual School Environment",
      units: 3,
    },
    {
      code: "PED FS2",
      name: "Field Study 2: Participation & Teaching Assistantship",
      units: 3,
    },
    { code: "PED INTEG1", name: "Education Integrative Course 1", units: 3 },
  ],
  "bsped-4-2": [
    { code: "PED INTERN", name: "Teaching Internship", units: 6 },
    { code: "PED INTEG2", name: "Education Integrative Course 3", units: 3 },
  ],
  "bsped-4-3": [],

  // ─── BEEd ─────────────────────────────────────────────────────────────────────
  "beed-1-1": [
    {
      code: "PED CALPRIN",
      name: "Child and Adolescent Learners & Learning Principles",
      units: 3,
    },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "beed-1-2": [
    {
      code: "PED FSIED",
      name: "Foundations of Special & Inclusive Education",
      units: 3,
    },
    {
      code: "PED FACILCT",
      name: "Facilitating Learner-centered Teaching",
      units: 3,
    },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    {
      code: "KOMFIL",
      name: "Kontekstwalisadong Komunikasyon sa Filipino",
      units: 3,
    },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "beed-1-3": [
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "LITMIN", name: "Literatures of Mindanao", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
  ],
  "beed-2-1": [
    {
      code: "PED TECHTCH 1",
      name: "Technology for Teaching & Learning 1",
      units: 3,
    },
    { code: "PED ASSESS 1", name: "Assessment of Learning 1", units: 3 },
    {
      code: "ED MT",
      name: "Content & Pedagogy in the Mother Tongue",
      units: 3,
    },
    {
      code: "EE EEG",
      name: "Teaching English in the Elementary Grades (Language Arts)",
      units: 3,
    },
    {
      code: "EE EWF",
      name: "Pagtuturo ng Filipino sa Elementarya I - Estruktura at Gamit ng Wikang Filipino",
      units: 3,
    },
    { code: "EE 21st CS", name: "Teaching 21st Century Skills", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "beed-2-2": [
    { code: "PED ASSESS 2", name: "Assessment of Learning 2", units: 3 },
    {
      code: "PED BENLIT",
      name: "Building & Enhancing Literacy Skills Across the Curriculum",
      units: 3,
    },
    {
      code: "EE TECHTCH 2",
      name: "Technology for Teaching & Learning (in the Elementary Grades) 2",
      units: 3,
    },
    {
      code: "EE PANFIL",
      name: "Pagtuturo ng Filipino sa Elementarya II - Panitikan ng Pilipinas",
      units: 3,
    },
    {
      code: "EE TEEGL",
      name: "Teaching English in the Elementary Grades through Literature",
      units: 3,
    },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "ACADWRI", name: "Academic Writing", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "beed-2-3": [
    {
      code: "EE MEG",
      name: "Teaching Music in the Elementary Grades",
      units: 3,
    },
    {
      code: "EE AEG",
      name: "Teaching Arts in the Elementary Grades",
      units: 3,
    },
  ],
  "beed-3-1": [
    { code: "PED TCHPROF", name: "The Teaching Profession", units: 3 },
    { code: "PED TCHCUR", name: "The Teacher & School Curriculum", units: 3 },
    {
      code: "EE SCIEG 1",
      name: "Teaching Science in the Elementary Grades (Biology & Chemistry) 1",
      units: 3,
    },
    {
      code: "EE SSEG 1",
      name: "Teaching Social Studies in the Elementary Grades (Phil. Hist & Govt) 1",
      units: 3,
    },
    { code: "EE MPG", name: "Teaching Math in Primary Grades", units: 3 },
    { code: "EE INRES", name: "Research in Education", units: 3 },
    {
      code: "EE MPE",
      name: "Managing a Positive Learner-Centered Environment",
      units: 3,
    },
    {
      code: "EE EPP",
      name: "Edukasyong Pantahanan at Pangkabuhayan",
      units: 3,
    },
  ],
  "beed-3-2": [
    {
      code: "PED TCHCOM",
      name: "The Teacher & Community, School Culture & Organizational Leadership",
      units: 3,
    },
    {
      code: "EE GMRC",
      name: "Good Manners & Right Conduct (Edukasyon sa Pagpapakatao)",
      units: 3,
    },
    {
      code: "EE ENTRE",
      name: "Edukasyong Pantahanan at Pangkabuhayan with Entrepreneurship",
      units: 3,
    },
    {
      code: "EE MIG",
      name: "Teaching Math in the Intermediate Grades",
      units: 3,
    },
    {
      code: "EE SCIEG 2",
      name: "Teaching Science in the Elementary Grades (Physics, Earth & Space Science) 2",
      units: 3,
    },
    {
      code: "EE SSEG 2",
      name: "Teaching Social Studies in Elementary Grades (Culture & Basic Geography)",
      units: 3,
    },
    {
      code: "EE RESEG",
      name: "Research in Teaching in the Elementary Grades",
      units: 3,
    },
    { code: "PEACE ED", name: "Peace Education", units: 3 },
  ],
  "beed-3-3": [
    {
      code: "EE PEHE",
      name: "Teaching PE & Health in the Elementary Grades",
      units: 3,
    },
    {
      code: "ED MULTI",
      name: "Teaching Multi-grade/Multi-age Classes",
      units: 3,
    },
  ],
  "beed-4-1": [
    {
      code: "PED FS 1",
      name: "Field Study 1: Observation of Teaching & Learning in Actual School Environment",
      units: 3,
    },
    {
      code: "PED FS 2",
      name: "Field Study 2: Participation & Teaching Assistantship",
      units: 3,
    },
    { code: "PED INTEG1", name: "Education Integrative Course 1", units: 3 },
  ],
  "beed-4-2": [
    { code: "PED INTERN", name: "Teaching Internship", units: 6 },
    { code: "PED INTEG1", name: "Education Integrative Course 1", units: 3 },
  ],
  "beed-4-3": [],

  // ─── BSEd Major in Filipino ────────────────────────────────────────────────────
  "bsed-1-1": [
    {
      code: "PED CALPRIN",
      name: "Child and Adolescent Learners & Learning Principles",
      units: 3,
    },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsed-1-2": [
    {
      code: "PED FSIED",
      name: "Foundations of Special & Inclusive Education",
      units: 3,
    },
    {
      code: "PED FACILCT",
      name: "Facilitating Learner Centered Teaching",
      units: 3,
    },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    {
      code: "KOMFIL",
      name: "Kontekstwalisadong Komunikasyon sa Filipino",
      units: 3,
    },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsed-1-3": [
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "LITMIN", name: "Literatures of Mindanao", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
  ],
  "bsed-2-1": [
    {
      code: "PED TECHTCH",
      name: "Technology for Teaching & Learning 1",
      units: 3,
    },
    { code: "PED ASSESS 1", name: "Assessment of Learning 1", units: 3 },
    { code: "SF INTROPW", name: "Introduksyon sa Pag-aaral ng Wika", units: 3 },
    { code: "SF PANLING", name: "Panimulang Linggwistika", units: 3 },
    { code: "SF EWF", name: "Estruktura ng Wikang Filipino", units: 3 },
    { code: "SF SANTAL", name: "Sanaysay at Talumpati", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsed-2-2": [
    { code: "PED ASSESS 2", name: "Assessment of Learning 2", units: 3 },
    {
      code: "PED BENLIT",
      name: "Building & Enhancing Literacy Skills Across the Curriculum",
      units: 3,
    },
    { code: "SF BBW", name: "Barayti at Baryasyon ng Wika", units: 3 },
    {
      code: "SF TEKFIL",
      name: "Technology for Teaching and Learning 2",
      units: 3,
    },
    {
      code: "SF UGNAYAN",
      name: "Ugnayan ng Wika, Kultura at Lipunan",
      units: 3,
    },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "ACADWRI", name: "Academic Writing", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsed-2-3": [
    { code: "SF PANRE", name: "Panitikan ng Rehiyon", units: 3 },
    {
      code: "SF DISKWP",
      name: "Mga Natatanging Diskurso sa Wika at Panitikan",
      units: 3,
    },
    { code: "OBRA", name: "Obra Maestra", units: 3 },
  ],
  "bsed-3-1": [
    { code: "PED TCHCUR", name: "The Teacher & School Curriculum", units: 3 },
    { code: "PED TCHPROF", name: "The Teaching Profession", units: 3 },
    {
      code: "SF MKNOB",
      name: "Maikling Kuwento at Nobelang Filipino",
      units: 3,
    },
    {
      code: "SF MAKRO",
      name: "Pagtuturo at Pagtataya ng Makrong Kasanayang Pangwika",
      units: 3,
    },
    { code: "SF PANFIL", name: "Panulaang Filipino", units: 3 },
    { code: "SF DULFIL", name: "Dulaang Filipino", units: 3 },
    { code: "SF KULPOP", name: "Kulturang Popular", units: 3 },
    {
      code: "SF PWP1",
      name: "Introduksiyon sa Pananaliksik sa Pagtuturo ng Filipino at Panitikan",
      units: 3,
    },
  ],
  "bsed-3-2": [
    {
      code: "PED TCHCOM",
      name: "The Teacher & Community, School Culture & Organizational Leadership",
      units: 3,
    },
    {
      code: "SF FILKUR",
      name: "Ang Filipino sa Kurikulum ng Batayang Edukasyon",
      units: 3,
    },
    { code: "SF PANPAM", name: "Panunuring Pampanitikan", units: 3 },
    { code: "SF INTROSALIN", name: "Introduksyon sa Pagsasalin", units: 3 },
    { code: "SF PWP2", name: "Pananaliksik – Wika at Panitikan", units: 3 },
    { code: "SF Elec1", name: "Malikhaing Pagsulat", units: 3 },
    { code: "SF Elec2", name: "Filipino bilang Ikalawang Wika", units: 3 },
    { code: "PEACE ED", name: "Peace Education", units: 3 },
  ],
  "bsed-3-3": [
    { code: "SF INTROPAM", name: "Introduksyon sa Pamamahayag", units: 3 },
    {
      code: "SF KAGAMITAN",
      name: "Paghahanda at Ebalwasyon ng Kagamitang Panturo",
      units: 3,
    },
  ],
  "bsed-4-1": [
    {
      code: "PED FS1",
      name: "Field Study 1: Observation of Teaching & Learning in Actual School Environment",
      units: 3,
    },
    {
      code: "PED FS2",
      name: "Field Study 2: Participation & Teaching Assistantship",
      units: 3,
    },
    { code: "PED INTEG1", name: "Education Integrative Course 1", units: 3 },
  ],
  "bsed-4-2": [
    { code: "PED INTERN", name: "Teaching Internship", units: 6 },
    { code: "PED INTEG2", name: "Education Integrative Course 2", units: 3 },
  ],
  "bsed-4-3": [],

  // ─── BECEd ────────────────────────────────────────────────────────────────────
  "beced-1-1": [
    {
      code: "PED CALPRIN",
      name: "Child and Adolescent Learners & Learning Principles",
      units: 3,
    },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "beced-1-2": [
    {
      code: "PED FSIED",
      name: "Foundations of Special & Inclusive Education",
      units: 3,
    },
    {
      code: "PED FACILCT",
      name: "Facilitating Learner-centered Teaching",
      units: 3,
    },
    { code: "MATHMOD", name: "Mathematics in the Modern World", units: 3 },
    {
      code: "KOMFIL",
      name: "Kontekstwalisadong Komunikasyon sa Filipino",
      units: 3,
    },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "beced-1-3": [
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "LITMIN", name: "Literatures of Mindanao", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
  ],
  "beced-2-1": [
    {
      code: "PED TECHTCH",
      name: "Technology for Teaching & Learning 1",
      units: 3,
    },
    { code: "PED ASSESS 1", name: "Assessment of Learning 1", units: 3 },
    { code: "ECE CDEV", name: "Child Development", units: 3 },
    {
      code: "ED MT",
      name: "Content & Pedagogy in the Mother Tongue",
      units: 3,
    },
    {
      code: "ECE FND",
      name: "Foundation of Early Childhood Education",
      units: 3,
    },
    { code: "ECE HNS", name: "Health, Nutrition & Safety", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "beced-2-2": [
    { code: "PED ASSESS 2", name: "Assessment of Learning 2", units: 3 },
    {
      code: "PED BENLIT",
      name: "Building & Enhancing Literacy Skills Across the Curriculum",
      units: 3,
    },
    {
      code: "ECE TECH",
      name: "Technology for Teaching & Learning 2 - Utilization of Instructional Technology in Early Childhood Education",
      units: 3,
    },
    {
      code: "ECE PDEV",
      name: "Play & Developmentally Appropriate Practices in Early Childhood Education",
      units: 3,
    },
    {
      code: "ECE ARTS",
      name: "Creative Arts, Music & Movements in Early Childhood Education",
      units: 3,
    },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "ACADWRI", name: "Academic Writing", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "beced-2-3": [
    { code: "ECE CHDLIT", name: "Children's Literature", units: 3 },
    { code: "ECE ITP", name: "Infant and Toddler Programs", units: 3 },
    { code: "ECE LDEV", name: "Literacy Development", units: 3 },
  ],
  "beced-3-1": [
    { code: "PED TCHPROF", name: "The Teaching Profession", units: 3 },
    { code: "PED TCHCUR", name: "The Teacher & School Curriculum", units: 3 },
    { code: "ECE NDEV", name: "Numeracy Development", units: 3 },
    {
      code: "ECE SCIE",
      name: "Science in Early Childhood Education",
      units: 3,
    },
    {
      code: "ECE SOC",
      name: "Social Studies in Early Childhood Education",
      units: 3,
    },
    {
      code: "ECE INCLU",
      name: "Inclusive Education in Early Childhood Settings",
      units: 3,
    },
    {
      code: "ECE INRES",
      name: "Intro to Research in Early Childhood Education",
      units: 3,
    },
  ],
  "beced-3-2": [
    {
      code: "PED TCHCOM",
      name: "The Teacher & Community, School Culture & Organizational Leadership",
      units: 3,
    },
    {
      code: "ECE CBEH",
      name: "Guiding Children's Behavior & Moral Development",
      units: 3,
    },
    {
      code: "ECE ASSESS",
      name: "Assessment of Children's Development & Learning",
      units: 3,
    },
    {
      code: "ECE MAN",
      name: "Management of Early Childhood Education Programs",
      units: 3,
    },
    {
      code: "ECE LDEV",
      name: "Early Childhood Learning Environment",
      units: 3,
    },
    {
      code: "ECE CURRM",
      name: "Early Childhood Education Curriculum Models",
      units: 3,
    },
    {
      code: "ECE RES",
      name: "Research in Early Childhood Education",
      units: 3,
    },
    { code: "PEACE ED", name: "Peace Education", units: 3 },
  ],
  "beced-3-3": [
    {
      code: "ECE FAM",
      name: "Family, School & Community Partnership",
      units: 3,
    },
    {
      code: "ED MULTI",
      name: "Teaching Multi-grade/Multi-age Classes",
      units: 3,
    },
  ],
  "beced-4-1": [
    {
      code: "PED FS 1",
      name: "Field Study 1: Observation of Teaching & Learning in Actual School Environment",
      units: 3,
    },
    {
      code: "PED FS 2",
      name: "Field Study 2: Participation & Teaching Assistantship",
      units: 3,
    },
    { code: "PED INTEG1", name: "Education Integrative Course 1", units: 3 },
  ],
  "beced-4-2": [
    { code: "PED INTERN", name: "Teaching Internship", units: 6 },
    { code: "PED INTEG2", name: "Education Integrative Course 2", units: 3 },
  ],
  "beced-4-3": [],

  // ─── BS Psychology ────────────────────────────────────────────────────────────
  "bspsy-1-1": [
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    { code: "PSYC 01", name: "General Psychology", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Tradition",
      units: 3,
    },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bspsy-1-2": [
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "HISCUL", name: "Historia y Cultura de Zamboanga", units: 3 },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PSYC 02", name: "Developmental Psychology", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bspsy-1-3": [],
  "bspsy-2-1": [
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    {
      code: "PSYC 23",
      name: "Sikolohiyang Filipino and Filipino Values",
      units: 3,
    },
    { code: "PSYC 03", name: "Statistics in Psychology", units: 5 },
    { code: "PSYC 04", name: "Physiological Psychology", units: 3 },
    {
      code: "KOMFIL",
      name: "Kontekswalisadong Komunikasyon sa Filipino",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Tradition",
      units: 3,
    },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bspsy-2-2": [
    { code: "PSYC 05", name: "Theories of Personality", units: 3 },
    {
      code: "PSYC 08n",
      name: "Qualitative/Field Methods in Psychology",
      units: 5,
    },
    { code: "ACADWRI", name: "Academic Writing", units: 3 },
    { code: "PSYC 06", name: "Group Process", units: 3 },
    { code: "PSYC 07", name: "Cognitive Psychology", units: 3 },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bspsy-2-3": [
    {
      code: "LIVIT",
      name: "Living in the IT Era (with Data Analytics)",
      units: 3,
    },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "PSYC SEM1", name: "Gender and Sexuality Studies", units: 3 },
  ],
  "bspsy-3-1": [
    { code: "PSYC 09", name: "Experimental Psychology", units: 5 },
    { code: "PSYC 10", name: "Abnormal Psychology", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "PSYC 11", name: "Introduction to Counseling", units: 3 },
    { code: "LITMIN", name: "Literatures of Mindanao", units: 3 },
    {
      code: "PSYC SCI2",
      name: "Physics: Sounds, Light and Electricity",
      units: 5,
    },
  ],
  "bspsy-3-2": [
    { code: "PSYC 12", name: "Assessment & Psychological Testing", units: 5 },
    { code: "PSYC 14", name: "Social Psychology", units: 3 },
    { code: "PSYC 13", name: "Industrial/Organizational Psych", units: 3 },
    { code: "PSYC 198", name: "Research 1 (Proposal Writing)", units: 3 },
    { code: "PSYC SCI1", name: "Gen. and Inorganic Chemistry", units: 5 },
  ],
  "bspsy-3-3": [{ code: "PSYC 16", name: "Internship", units: 3 }],
  "bspsy-4-1": [
    { code: "PSYC SCI3", name: "College Biology", units: 5 },
    { code: "PSYC 199", name: "Research Writing 2 (Thesis Writing)", units: 3 },
    { code: "PSYC 18", name: "Intro to Human Resource Development", units: 3 },
    { code: "PSYC 24", name: "Psychology of Language", units: 3 },
    { code: "INCOR 1", name: "Integrative Course 1", units: 3 },
  ],
  "bspsy-4-2": [
    { code: "PSYC SCI4", name: "College Zoology", units: 5 },
    { code: "PSYC 20", name: "Positive Psychology w/MHPSS", units: 3 },
    { code: "PSYC 19", name: "Organizational Behavior", units: 3 },
    { code: "PSYC SEM2", name: "Environmental Psychology", units: 3 },
    { code: "INCOR2", name: "Integrative Course 2", units: 3 },
  ],
  "bspsy-4-3": [],

  // ─── BA Philosophy ────────────────────────────────────────────────────────────
  "baphilo-1-1": [
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    {
      code: "FFP1",
      name: "Freshmen Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
    { code: "PED 1", name: "Adult Learners & Learning Principles", units: 3 },
  ],
  "baphilo-1-2": [
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "HISCUL", name: "Historia y Cultura de Zamboanga", units: 3 },
    {
      code: "FFP2",
      name: "Freshmen Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercises", units: 2 },
    { code: "PHI 205", name: "Philosophical Writing Methods", units: 3 },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PHI201", name: "Introduction to Philosophy", units: 3 },
    { code: "PED 3", name: "Facilitating Learner-Centered Teaching", units: 3 },
  ],
  "baphilo-1-3": [],
  "baphilo-2-1": [
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "PHI 203", name: "History of Western Philosophy I", units: 3 },
    { code: "PHI202", name: "Logic", units: 3 },
    {
      code: "PHI 307",
      name: "Seminar on Special Questions on Philosophy",
      units: 3,
    },
    { code: "PED 4", name: "Technology for Teaching and Learning 1", units: 3 },
  ],
  "baphilo-2-2": [
    { code: "PHI 204", name: "Advanced Philosophy of Man", units: 3 },
    { code: "PHI 304", name: "Philosophy of Science & Technology", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    { code: "PHI 303", name: "History of Western Philosophy II", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "PHI 401", name: "Seminar on Plato/Aristotle", units: 3 },
    { code: "PED 7", name: "Assessment of Learning II", units: 3 },
  ],
  "baphilo-2-3": [
    { code: "PHI 403", name: "Seminar on Contemporary Philosophy", units: 3 },
    {
      code: "PHI ELECT1",
      name: "Philo Elective I (Philosophy of Law)",
      units: 3,
    },
    { code: "PHI 310", name: "Philosophy of Language", units: 3 },
  ],
  "baphilo-3-1": [
    { code: "FL 1", name: "Foreign Language 1", units: 3 },
    {
      code: "PHII 406",
      name: "Special Seminar on Filipino Philosophy",
      units: 3,
    },
    { code: "PHI 301", name: "Metaphysics", units: 3 },
    { code: "PHI 305", name: "History of Indian Philosophy", units: 3 },
    { code: "PHI 306", name: "History of Chinese Philosophy", units: 3 },
    {
      code: "KOMFIL",
      name: "Kontekswalisadong Komunikasyon sa Filipino",
      units: 3,
    },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "PED 8", name: "The Teaching Profession", units: 3 },
  ],
  "baphilo-3-2": [
    { code: "FL 2", name: "Foreign Language 2", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "PHI 302", name: "Epistemology", units: 3 },
    { code: "PHI 308", name: "Philosophy of Religion", units: 3 },
    {
      code: "PHI 198",
      name: "Philosophical Synthesis Paper (Proposal)",
      units: 3,
    },
    { code: "LITMIN", name: "Literatures of Mindanao", units: 3 },
    { code: "PED 9", name: "The Teacher and School Curriculum", units: 3 },
  ],
  "baphilo-3-3": [
    {
      code: "PHI ELECT2",
      name: "Philo Elective 2 (Legal Hermeneutics)",
      units: 3,
    },
    {
      code: "PHI ELECT3",
      name: "Philo Elective 3 (Environmental Justice)",
      units: 3,
    },
    {
      code: "PHI 402",
      name: "Existentialism/Phenomenology/Hermeneutics/Post Modernism",
      units: 3,
    },
  ],
  "baphilo-4-1": [
    { code: "PHI 404", name: "Social Political Philosophy", units: 3 },
    { code: "PHI 407", name: "Special Questions in Legal Ethics", units: 3 },
    { code: "PHI 408", name: "Aesthetics/Theories of Art", units: 3 },
    { code: "PHI 409", name: "Comparative Philosophy", units: 3 },
    {
      code: "PHI 199",
      name: "Philosophical Synthesis Paper Writing and Defense (Comprehensive Exam)",
      units: 3,
    },
  ],
  "baphilo-4-2": [
    { code: "PHI-PRACT", name: "Field Study & Teaching Internship", units: 6 },
  ],
  "baphilo-4-3": [],

  // ─── BA International Studies ─────────────────────────────────────────────────
  "baints-1-1": [
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    {
      code: "INTS-INTRO",
      name: "Introduction to International Studies",
      units: 3,
    },
    {
      code: "FFP1",
      name: "Freshmen Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "baints-1-2": [
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "HISCUL", name: "Historia y Cultura de Zamboanga", units: 3 },
    { code: "PUBSPEAK", name: "Public Speaking", units: 3 },
    { code: "ECONINT", name: "Introductory Economics", units: 3 },
    { code: "INTS-PUB", name: "International Public Relations", units: 3 },
    {
      code: "FFP2",
      name: "Freshmen Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "baints-1-3": [],
  "baints-2-1": [
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Tradition",
      units: 3,
    },
    { code: "ECONMIC", name: "Microeconomics Theory & Practice", units: 3 },
    { code: "GOVCOM", name: "Comparative Government & Politics", units: 3 },
    { code: "HIST.1", name: "Survey of World History I", units: 3 },
    { code: "INTS-CUL", name: "Culture and Arts in East Asia", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "baints-2-2": [
    { code: "ACADWRI", name: "Advanced Academic Writing", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    { code: "ECONMAC", name: "Macroeconomics Theory & Practice", units: 3 },
    { code: "HIST.2", name: "Survey of World History II", units: 3 },
    { code: "GOVPHIL", name: "Phil. Constitution and Government", units: 3 },
    { code: "SOCSCI-ELECT1", name: "Intercultural Communication", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "baints-2-3": [
    {
      code: "INTS-SERV",
      name: "Culture, Society and Community (w/ Service Learning Program)",
      units: 6,
    },
  ],
  "baints-3-1": [
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    {
      code: "KOMFIL",
      name: "Kontekstwalisadong Komunikasyon sa Filipino",
      units: 3,
    },
    { code: "PEACE", name: "Peace Issues in Asia", units: 3 },
    { code: "GEOPOL", name: "Geopolitics in Indo-Pacific Region", units: 3 },
    { code: "INTLAW", name: "International Law", units: 3 },
    { code: "INTS-SEM1", name: "International Studies Seminar 1", units: 3 },
    { code: "INTTRADE", name: "International Trade", units: 3 },
    { code: "FL1", name: "Foreign Language 1", units: 3 },
  ],
  "baints-3-2": [
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "LITMIN", name: "Literatures of Mindanao", units: 3 },
    { code: "HIST-US", name: "US History, Government and Society", units: 3 },
    { code: "INTS-DIP", name: "Consular & Diplomatic Practices", units: 3 },
    {
      code: "INTS-RES",
      name: "Theories & Methods in International Studies",
      units: 3,
    },
    {
      code: "INTS-SPECT",
      name: "Special Topics in International Studies (w/ International Exposure)",
      units: 3,
    },
    { code: "SOCSCI-ELECT2", name: "Data Analytics", units: 3 },
    { code: "FL2", name: "Foreign Language 2", units: 3 },
  ],
  "baints-3-3": [{ code: "INTS-INTERN", name: "Internship", units: 3 }],
  "baints-4-1": [
    {
      code: "INTS-RP",
      name: "Writing in the Social Sciences I (Proposal)",
      units: 3,
    },
    { code: "INTS-LEAD", name: "Leadership Theory and Practice", units: 3 },
    { code: "INTS-SEM2", name: "International Studies Seminar 2", units: 3 },
    { code: "FL3", name: "Foreign Language 3", units: 3 },
  ],
  "baints-4-2": [
    {
      code: "INTS-TW",
      name: "Writing in the Social Sciences II (Thesis Writing)",
      units: 3,
    },
    {
      code: "GREATBOOKS",
      name: "World Literary Classics (with emphasis on evolution of political thought)",
      units: 3,
    },
    { code: "FL4", name: "Foreign Language 4", units: 3 },
  ],
  "baints-4-3": [],

  // ─── BA English Language Studies ──────────────────────────────────────────────
  "baels-1-1": [
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian and Islamic Traditions",
      units: 3,
    },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "FFP1",
      name: "Freshmen Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "ELS 01",
      name: "Introduction to the English Language System",
      units: 3,
    },
  ],
  "baels-1-2": [
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "HISCUL", name: "Historia y Cultura de Zamboanga", units: 3 },
    { code: "LITMIN", name: "Literatures of Mindanao", units: 3 },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "FFP2",
      name: "Freshmen Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PUBSPEAK", name: "Public Speaking", units: 3 },
    {
      code: "LANGTEACH",
      name: "Foundations of English Language Teaching and Learning",
      units: 3,
    },
  ],
  "baels-1-3": [],
  "baels-2-1": [
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social and Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation and Mission in the Christian, Ignatian and Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT3", name: "Dance/Sports/Recreation and Games 1", units: 2 },
    {
      code: "ELS 02",
      name: "Theories of Language & Language Acquisition",
      units: 3,
    },
    { code: "ELS 03", name: "History of the English Language", units: 3 },
    { code: "ELS 10", name: "Language, Society & Culture", units: 3 },
    { code: "CREWRI", name: "Creative Writing", units: 3 },
  ],
  "baels-2-2": [
    { code: "SCITECS", name: "Science, Technology and Society", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "ACADWRI", name: "Academic Writing", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Recreation & Games 2", units: 2 },
    { code: "ELS 04", name: "English Phonology and Morphology", units: 3 },
    { code: "ELS 05", name: "English Syntax", units: 3 },
    { code: "ELS 06", name: "Semantics of English", units: 3 },
    { code: "ELS 07", name: "English Discourse", units: 3 },
  ],
  "baels-2-3": [],
  "baels-3-1": [
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    {
      code: "KOMFIL",
      name: "Kontekswalisadong Komunikasyon sa Filipino",
      units: 3,
    },
    { code: "ELS 09", name: "Stylistics", units: 3 },
    { code: "ELS 11", name: "Language of Literary Texts", units: 3 },
    { code: "ELS 15", name: "Language of Non-Literary Texts", units: 3 },
    { code: "FL 1", name: "Foreign Language 1", units: 3 },
    {
      code: "INSMA",
      name: "Instructional Materials Development & Evaluation",
      units: 3,
    },
    { code: "TRANS", name: "Translation Studies", units: 3 },
  ],
  "baels-3-2": [
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "ELS 16", name: "Computer-Mediated Communication", units: 3 },
    { code: "ELS 19", name: "Language and Advertising", units: 3 },
    { code: "ELS 20", name: "Language and Journalism", units: 3 },
    { code: "ELS 198", name: "Language Research 1: Methodology", units: 3 },
    { code: "FL 2", name: "Foreign Language 2", units: 3 },
    {
      code: "GREATBOOKS",
      name: "Great Books: World Literary Classics",
      units: 3,
    },
    { code: "ORGCOM", name: "Organizational Communication", units: 3 },
  ],
  "baels-3-3": [{ code: "INTERN", name: "Internship", units: 3 }],
  "baels-4-1": [
    { code: "FL 3", name: "Foreign Language 3", units: 3 },
    { code: "ELS 199", name: "Language Research 2: Thesis", units: 3 },
    { code: "ELS 23", name: "Language of Law", units: 3 },
    { code: "LANGPRO", name: "Language Policies and Programs", units: 3 },
    { code: "LANGPOL", name: "Language and Politics", units: 3 },
  ],
  "baels-4-2": [
    { code: "FL 4", name: "Foreign Language 4", units: 3 },
    { code: "LANGNET", name: "Language of the Internet", units: 3 },
    {
      code: "LANGTEST",
      name: "English Language Testing & Assessment",
      units: 3,
    },
    { code: "BUSCOM", name: "Business Communication", units: 3 },
  ],
  "baels-4-3": [],

  // ─── BA Communication ─────────────────────────────────────────────────────────
  "ba-comm-1-1": [
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    {
      code: "FFP1",
      name: "Freshmen Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "COMMED", name: "Intro to Communication Media", units: 3 },
  ],
  "ba-comm-1-2": [
    { code: "HISCUL", name: "Historia y Cultura de Zamboanga", units: 3 },
    {
      code: "FFP2",
      name: "Freshmen Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    {
      code: "LIVIT",
      name: "Living in the IT Era (with Data Analytics)",
      units: 3,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PUBSPEAK", name: "Public Speaking", units: 3 },
    { code: "COMLAWS", name: "Communication Media Laws & Ethics", units: 3 },
  ],
  "ba-comm-1-3": [],
  "ba-comm-2-1": [
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "JOURNP-1", name: "Journalism Principles & Theories", units: 3 },
    { code: "CREWRI", name: "Creative Writing", units: 3 },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
    { code: "DIGPUB", name: "Digital Publishing", units: 3 },
    { code: "PHOTOJOURN", name: "Photo Journalism", units: 3 },
  ],
  "ba-comm-2-2": [
    { code: "COMSOC", name: "Communication, Culture, and Society", units: 3 },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    { code: "MULSTOR", name: "Multimedia Storytelling", units: 3 },
    { code: "JOURNP-2", name: "Journalism Practices", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
    { code: "SOCMED", name: "Social Media Principles & Practices", units: 3 },
    { code: "ACADWRI", name: "Advanced Academic Writing", units: 3 },
  ],
  "ba-comm-2-3": [],
  "ba-comm-3-1": [
    { code: "ENTMIND", name: "The Entrepreneurial Mindset", units: 3 },
    { code: "COMTHEO", name: "Communication Theory", units: 3 },
    { code: "BROADP-1", name: "Broadcasting Principles & Theories", units: 3 },
    { code: "INTFILM", name: "Introduction to Film", units: 3 },
    { code: "PEACEJOURN", name: "Peace Journalism", units: 3 },
    { code: "COMASE", name: "Communication in the ASEAN Setting", units: 3 },
    {
      code: "KOMFIL",
      name: "Kontekswalisadong Komunikasyon sa Filipino",
      units: 3,
    },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
  ],
  "ba-comm-3-2": [
    { code: "THEATER", name: "Intro to Theater Arts", units: 3 },
    { code: "COMRES", name: "Communication Research", units: 3 },
    { code: "FILMPROD", name: "Film Production", units: 3 },
    {
      code: "BROADP-2",
      name: "Broadcasting Practices and Performance",
      units: 3,
    },
    { code: "ADVERT", name: "Advertising Principles & Practices", units: 3 },
    {
      code: "PUBINF",
      name: "Public Information Principles and Practices",
      units: 3,
    },
    {
      code: "PUBREL",
      name: "Public Relations Principles and Practices",
      units: 3,
    },
    { code: "ETHICS", name: "Ethics", units: 3 },
  ],
  "ba-comm-3-3": [{ code: "COMM-INTERN", name: "Internship", units: 3 }],
  "ba-comm-4-1": [
    { code: "COMM 198", name: "Thesis/Special Project 1", units: 3 },
    { code: "DEVCOM", name: "Development Communication", units: 3 },
    {
      code: "RISKCOM",
      name: "Risk, Disaster & Humanitarian Communication",
      units: 3,
    },
    { code: "COMPLAN", name: "Communication Planning", units: 3 },
    { code: "FILMAPP", name: "Film Appreciation and Criticism", units: 3 },
    { code: "LITMIN", name: "Literatures of Mindanao", units: 3 },
  ],
  "ba-comm-4-2": [
    { code: "COMM 199", name: "Thesis/Special Project 2", units: 3 },
    {
      code: "ORGCOM",
      name: "Organizational Culture and Communication",
      units: 3,
    },
    { code: "COMMAN", name: "Communication Management", units: 3 },
    { code: "KNOMAN", name: "Knowledge Management", units: 3 },
    {
      code: "DIGDEV",
      name: "Digital Learning Materials Development",
      units: 3,
    },
  ],
  "ba-comm-4-3": [],

  // ─── BS Legal Management ──────────────────────────────────────────────────────
  "bslm-1-1": [
    { code: "BUSMAN 201", name: "Human Behavior in an Organization", units: 3 },
    { code: "ABMBC 200", name: "Fundamentals of Accounting 1&2", units: 3 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "BUSMAN 202", name: "Business Research", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program",
      units: 3,
      countForGPA: false,
    },
    { code: "NSTP1", name: "NSTP 1", units: 3, countForGPA: false },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bslm-1-2": [
    { code: "BUSMAN ELEC 1", name: "Business Management Elective 1", units: 3 },
    { code: "ABMBC 201", name: "Business Math", units: 3 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "BUSMAN 203", name: "Environmental Management", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program",
      units: 3,
      countForGPA: false,
    },
    { code: "NSTP2", name: "NSTP 2", units: 3, countForGPA: false },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bslm-1-3": [
    { code: "BUSMAN 204", name: "Project Management", units: 3 },
    {
      code: "BUSMAN 205",
      name: "Good Governance and Social Responsibility",
      units: 3,
    },
  ],
  "bslm-2-1": [
    { code: "FINACC 0", name: "Financial Accounting", units: 3 },
    { code: "MIS 1", name: "Management Information System", units: 3 },
    { code: "ECON 201", name: "Basic Microeconomics", units: 3 },
    { code: "MAT 106", name: "Fundamental Concept of Mathematics", units: 3 },
    { code: "MRKTGM 201", name: "Marketing Management", units: 3 },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "ACADWRI", name: "Advanced Academic Writing", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bslm-2-2": [
    { code: "BUSMAN 206", name: "Operations Management & TQM", units: 3 },
    { code: "ARGDEB", name: "Argumentation and Debate", units: 3 },
    {
      code: "ECON 202",
      name: "Economic Development & Sustainability",
      units: 3,
    },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bslm-2-3": [],
  "bslm-3-1": [
    { code: "BUSMAN 209", name: "International Business & Trade", units: 3 },
    { code: "TAX 01", name: "Income Taxation", units: 3 },
    { code: "LAW 01", name: "Obligations and Contract", units: 3 },
    { code: "FINMAN 2", name: "Financial Management", units: 3 },
    { code: "GEOPHY", name: "Physical and Urban Landscape", units: 3 },
    { code: "LAW ELECT 1", name: "Law Elective 1", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "GM ELECT-LM", name: "Literatures of Mindanao", units: 3 },
  ],
  "bslm-3-2": [
    { code: "BUSMAN 211", name: "Strategic Management", units: 3 },
    { code: "TAX 02", name: "Business Taxation", units: 3 },
    { code: "LAW 200", name: "Obligations and Contract/Civil Code", units: 3 },
    { code: "LAW 300", name: "Statutory Construction", units: 3 },
    { code: "LAW ELECT 2", name: "Law Elective 2", units: 3 },
    { code: "GEOPOL", name: "Geography and Politics of East Asia", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    {
      code: "GE ELECT-GB",
      name: "Great Books: World Literary Classics",
      units: 3,
    },
  ],
  "bslm-3-3": [{ code: "PRACT 111", name: "Practicum (150 hours)", units: 6 }],
  "bslm-4-1": [
    {
      code: "LAW 400",
      name: "Laws on Partnership and Corporation/SEC",
      units: 3,
    },
    { code: "LAW 500", name: "Negotiable Instruments", units: 3 },
    { code: "TAX 3", name: "Transfer & Business Tax/Tax Planning", units: 3 },
    { code: "ELS ELECT", name: "Intercultural Communication", units: 3 },
    { code: "LAW ELECT 3", name: "Law Elective 3", units: 3 },
  ],
  "bslm-4-2": [
    {
      code: "LAW 600",
      name: "Sales, Agency, Bailments, and Labor Laws",
      units: 3,
    },
    { code: "LAW 700", name: "Introduction to Constitutional Law", units: 3 },
    { code: "LAW 800", name: "Introduction to Criminal Law", units: 3 },
    { code: "ELS 05", name: "English Syntax", units: 3 },
  ],
  "bslm-4-3": [],

  // ─── BS Office Administration ─────────────────────────────────────────────────
  "bsoa-1-1": [
    { code: "BUSMAN 201", name: "Human Behavior in an Organization", units: 3 },
    { code: "ABMBC 200", name: "Fundamentals of Accounting 1&2", units: 3 },
    {
      code: "OACC 200",
      name: "Keyboarding & Intro to Word Processing",
      units: 6,
    },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "BUSMAN 202", name: "Business Research", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsoa-1-2": [
    { code: "BUSFIN", name: "Business Finance", units: 3 },
    { code: "ABMBC 201", name: "Business Math", units: 3 },
    { code: "OACC 201", name: "Fundamentals of Shorthand", units: 6 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "BUSMAN 203", name: "Environmental Management", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsoa-1-3": [
    { code: "BUSMAN 204", name: "Project Management", units: 3 },
    { code: "OACC 202", name: "Advanced Shorthand", units: 3 },
    { code: "PROF ELECT 1", name: "Professional Elective 1", units: 3 },
  ],
  "bsoa-2-1": [
    { code: "OACC 203a", name: "Business Report Writing", units: 3 },
    {
      code: "OACC 204",
      name: "Personal and Professional Development",
      units: 3,
    },
    {
      code: "OACC 205",
      name: "Admin Office Procedures & Management",
      units: 3,
    },
    { code: "ACADWRI", name: "Advanced Academic Writing", units: 3 },
    { code: "MIS 1", name: "Management Information System", units: 3 },
    { code: "ECON 201", name: "Basic Microeconomics", units: 3 },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsoa-2-2": [
    { code: "BUSMAN 206a", name: "Operations Management", units: 3 },
    { code: "OACC 206", name: "Customer Service Relations", units: 3 },
    { code: "PROF ELECT 2", name: "Professional Elective 2", units: 3 },
    { code: "FINACC 0a", name: "Financial Accounting", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsoa-2-3": [
    { code: "BUSMAN 208", name: "Human Resource Management", units: 3 },
    { code: "PROF ELECT 3", name: "Professional Elective 3", units: 3 },
  ],
  "bsoa-3-1": [
    { code: "PROF ELECT 4", name: "Professional Elective 4", units: 3 },
    { code: "OACC 207", name: "Internet Business for Research", units: 3 },
    { code: "OACC 209", name: "Machine Shorthand", units: 3 },
    { code: "TAX 01", name: "Income Taxation", units: 3 },
    { code: "LAW 01", name: "Obligations and Contract", units: 3 },
    { code: "GM ELECT-LM", name: "Literatures of Mindanao", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
  ],
  "bsoa-3-2": [
    { code: "BUSMAN 211", name: "Strategic Management", units: 3 },
    { code: "OACC 210", name: "Entrep. Behavior and Competencies", units: 3 },
    { code: "OACC 211", name: "Events Management", units: 3 },
    { code: "OACC 212", name: "Integrated Software Application", units: 3 },
    { code: "PROF ELECT 5", name: "Professional Elective 5", units: 3 },
    { code: "FINMAN 2", name: "Financial Management", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    {
      code: "GE ELECT-GB",
      name: "Great Books: World Literary Classics",
      units: 3,
    },
  ],
  "bsoa-3-3": [
    { code: "PROF ELECT 6", name: "Professional Elective 6", units: 3 },
    { code: "OACC 213", name: "Office Business Machine", units: 3 },
  ],
  "bsoa-4-1": [
    { code: "OACC 214", name: "Office Business Internship", units: 3 },
  ],
  "bsoa-4-2": [
    {
      code: "OACC 215",
      name: "Legal Office Internship/Medical Office Internship",
      units: 3,
    },
  ],
  "bsoa-4-3": [],

  // ─── BSBA Entrepreneurship ────────────────────────────────────────────────────
  "bsbaentre-1-1": [
    { code: "BUSMAN 201", name: "Human Behavior in an Organization", units: 3 },
    { code: "ABMBC 200", name: "Fundamentals of Accounting 1&2", units: 3 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "BUSMAN 202", name: "Business Research", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsbaentre-1-2": [
    { code: "BUSFIN", name: "Business Finance", units: 3 },
    { code: "ABMBC 201", name: "Business Math", units: 3 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "BUSMAN 203", name: "Environmental Management", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsbaentre-1-3": [
    { code: "BUSMAN 204", name: "Project Management", units: 3 },
    {
      code: "BUSMAN 205",
      name: "Good Governance and Social Responsibility",
      units: 3,
    },
    { code: "BUSMAN ELECT 1", name: "Elective 1", units: 3 },
  ],
  "bsbaentre-2-1": [
    { code: "FINACC 0", name: "Financial Accounting", units: 3 },
    { code: "MIS 1", name: "Management Information System", units: 3 },
    { code: "ECON 201", name: "Basic Microeconomics", units: 3 },
    {
      code: "BUSMAN ELECT 2",
      name: "Business Management Elective 2",
      units: 3,
    },
    { code: "MRKTGM 201", name: "Marketing Management", units: 3 },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsbaentre-2-2": [
    { code: "BUSMAN 206", name: "Operations Management & TQM", units: 3 },
    { code: "BUSMAN 207", name: "Inventory Management & Control", units: 3 },
    { code: "MRKTGM 202", name: "Product Management", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsbaentre-2-3": [
    { code: "BUSMAN 208", name: "Human Resource Management", units: 3 },
    {
      code: "ECON 202",
      name: "Economic Development and Sustainability",
      units: 3,
    },
  ],
  "bsbaentre-3-1": [
    { code: "BUSMAN 209", name: "International Business & Trade", units: 3 },
    { code: "ENTRE 1", name: "Entrepreneurship", units: 3 },
    { code: "ENTRE 2", name: "Social Entrepreneurship", units: 3 },
    { code: "TAX 01", name: "Income Taxation", units: 3 },
    { code: "LAW 01", name: "Obligations and Contract", units: 3 },
    { code: "MANACC 01", name: "Managerial Accounting", units: 3 },
    { code: "GM ELECT-LM", name: "Literatures of Mindanao", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
  ],
  "bsbaentre-3-2": [
    { code: "BUSMAN 211", name: "Strategic Management", units: 3 },
    { code: "ENTRE 3", name: "Feasibility Studies", units: 3 },
    {
      code: "ENTRE 4",
      name: "Entrepreneurial Leadership & Governance",
      units: 3,
    },
    { code: "TAX 02", name: "Business Taxation", units: 3 },
    { code: "LAW 02", name: "Laws on Business Organization", units: 3 },
    { code: "BUSANA 3", name: "Business Analytics", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    {
      code: "GE ELECT-GB",
      name: "Great Books: World Literary Classics",
      units: 3,
    },
  ],
  "bsbaentre-3-3": [
    { code: "ELECT 3", name: "Elective 3", units: 3 },
    { code: "ELECT 4", name: "Elective 4", units: 3 },
    { code: "ENTRE 5", name: "Business, Planning, and Mentoring", units: 3 },
  ],
  "bsbaentre-4-1": [
    { code: "ENTRE 6", name: "Entrepreneurial Internship", units: 3 },
  ],
  "bsbaentre-4-2": [
    { code: "ENTRE 7", name: "Entrepreneurial Internship", units: 3 },
  ],
  "bsbaentre-4-3": [],

  // ─── BSBA Marketing Management ────────────────────────────────────────────────
  "bsbamm-1-1": [
    { code: "BUSMAN 201", name: "Human Behavior in an Organization", units: 3 },
    { code: "ABMBC 200", name: "Fundamentals of Accounting 1&2", units: 3 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "BUSMAN 202", name: "Business Research", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program",
      units: 3,
      countForGPA: false,
    },
    { code: "NSTP1", name: "NSTP 1", units: 3, countForGPA: false },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsbamm-1-2": [
    { code: "BUSFIN", name: "Business Finance", units: 3 },
    { code: "ABMBC 201", name: "Business Math", units: 3 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "BUSMAN 203", name: "Environmental Management", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program",
      units: 3,
      countForGPA: false,
    },
    { code: "NSTP2", name: "NSTP 2", units: 3, countForGPA: false },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsbamm-1-3": [
    { code: "BUSMAN 204", name: "Project Management", units: 3 },
    {
      code: "BUSMAN 205",
      name: "Good Governance and Social Responsibility",
      units: 3,
    },
    { code: "ELECT 1", name: "Elective 1", units: 3 },
  ],
  "bsbamm-2-1": [
    { code: "FINACC 0", name: "Financial Accounting", units: 3 },
    { code: "MIS 1", name: "Management Information System", units: 3 },
    { code: "ECON 201", name: "Basic Microeconomics", units: 3 },
    { code: "MRKTGM 200", name: "Marketing Research", units: 3 },
    { code: "MRKTGM 201", name: "Marketing Management", units: 3 },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsbamm-2-2": [
    { code: "BUSMAN 206", name: "Operations Management & TQM", units: 3 },
    { code: "MRKTGM 202", name: "Product Management", units: 3 },
    { code: "MRKTGM 203", name: "Pricing Strategy", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsbamm-2-3": [
    { code: "BUSMAN 208", name: "Human Resource Management", units: 3 },
    {
      code: "ECON 202",
      name: "Economic Development and Sustainability",
      units: 3,
    },
    { code: "ELECT 2", name: "Elective 2", units: 3 },
  ],
  "bsbamm-3-1": [
    { code: "BUSMAN 209", name: "International Business & Trade", units: 3 },
    { code: "MRKTGM 204", name: "Advertising & Sales Promotion", units: 3 },
    { code: "MRKTGM 205", name: "Distribution Management", units: 3 },
    { code: "MANACC 01", name: "Managerial Accounting", units: 3 },
    { code: "TAX 01", name: "Income Taxation", units: 3 },
    { code: "LAW 01", name: "Obligations and Contract", units: 3 },
    { code: "GM ELECT-LM", name: "Literatures of Mindanao", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
  ],
  "bsbamm-3-2": [
    { code: "BUSMAN 211", name: "Strategic Management", units: 3 },
    { code: "TAX 02", name: "Business Taxation", units: 3 },
    { code: "LAW 02", name: "Laws on Business Organization", units: 3 },
    { code: "MRKTGM 206", name: "Retail Management", units: 3 },
    { code: "MRKTGM 207", name: "Professional Salesmanship", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    {
      code: "GE ELECT-GB",
      name: "Great Books: World Literary Classics",
      units: 3,
    },
  ],
  "bsbamm-3-3": [
    { code: "ELECT 3", name: "Elective 3", units: 3 },
    { code: "ELECT 4", name: "Elective 4", units: 3 },
  ],
  "bsbamm-4-1": [
    { code: "BUSMAN 213", name: "Management Training Program", units: 6 },
  ],
  "bsbamm-4-2": [{ code: "BUSMAN 214", name: "Feasibility Studies", units: 6 }],
  "bsbamm-4-3": [],

  // ─── BSBA Financial Management ────────────────────────────────────────────────
  "bsbafm-1-1": [
    {
      code: "BUSMAN 201",
      name: "Human Behaviour in an Organization",
      units: 3,
    },
    { code: "ABMBC 200", name: "Fundamentals of Accounting 1&2", units: 3 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "BUSMAN 202", name: "Business Research", units: 3 },
    {
      code: "FFP1",
      name: "Freshman Formation Program",
      units: 3,
      countForGPA: false,
    },
    { code: "NSTP1", name: "NSTP 1", units: 3, countForGPA: false },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsbafm-1-2": [
    { code: "BUSFIN", name: "Business Finance", units: 3 },
    { code: "ABMBC 201", name: "Business Math", units: 3 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "BUSMAN 203", name: "Environmental Management", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program",
      units: 3,
      countForGPA: false,
    },
    { code: "NSTP2", name: "NSTP 2", units: 3, countForGPA: false },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsbafm-1-3": [
    { code: "BUSMAN 204", name: "Project Management", units: 3 },
    {
      code: "BUSMAN 205",
      name: "Good Governance and Social Responsibility",
      units: 3,
    },
    { code: "ELECT 1", name: "Elective 1", units: 3 },
  ],
  "bsbafm-2-1": [
    { code: "FINACC 0", name: "Financial Accounting", units: 3 },
    { code: "MIS 1", name: "Management Information System", units: 3 },
    { code: "ECON 201", name: "Basic Microeconomics", units: 3 },
    { code: "FINMAN 200", name: "Intro to Financial Management", units: 3 },
    {
      code: "FINMAN 201",
      name: "Banking and Financial Institutions",
      units: 3,
    },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsbafm-2-2": [
    { code: "BUSMAN 206", name: "Operations Management & TQM", units: 3 },
    { code: "FINMAN 202", name: "Financial Analysis and Reporting", units: 3 },
    {
      code: "FINMAN 203",
      name: "Monetary Policy and Central Banking",
      units: 3,
    },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsbafm-2-3": [
    { code: "BUSMAN 208", name: "Human Resource Management", units: 3 },
    {
      code: "ECON 202",
      name: "Economic Development and Sustainability",
      units: 3,
    },
    { code: "ELECT 2", name: "Elective 2", units: 3 },
  ],
  "bsbafm-3-1": [
    { code: "BUSMAN 209", name: "International Business & Trade", units: 3 },
    { code: "FINMAN 204", name: "Capital Market", units: 3 },
    {
      code: "FINMAN 205",
      name: "Investment and Portfolio Management",
      units: 3,
    },
    { code: "MANACC 01", name: "Managerial Accounting", units: 3 },
    { code: "TAX 01", name: "Income Taxation", units: 3 },
    { code: "LAW 01", name: "Obligations and Contract", units: 3 },
    { code: "GM ELECT-LM", name: "Literatures of Mindanao", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
  ],
  "bsbafm-3-2": [
    { code: "BUSMAN 211", name: "Strategic Management", units: 3 },
    { code: "TAX 02", name: "Business Taxation", units: 3 },
    { code: "LAW 02", name: "Laws on Business Organization", units: 3 },
    { code: "FINMAN 206", name: "Credit and Collection", units: 3 },
    {
      code: "FINMAN 207",
      name: "Special Topics in Financial Management",
      units: 3,
    },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    {
      code: "GE ELECT-GB",
      name: "Great Books: World Literary Classics",
      units: 3,
    },
  ],
  "bsbafm-3-3": [
    { code: "ELECT 3", name: "Elective 3", units: 3 },
    { code: "ELECT 4", name: "Elective 4", units: 3 },
  ],
  "bsbafm-4-1": [
    { code: "BUSMAN 213", name: "Management Training Program 1", units: 6 },
  ],
  "bsbafm-4-2": [{ code: "BUSMAN 214", name: "Feasibility Studies", units: 6 }],
  "bsbafm-4-3": [],

  // ─── BSMA ABM Track ───────────────────────────────────────────────────────────
  // Note: BSMA has two tracks (ABM and Non-ABM); split into bsma-abm and bsma-nonabm in COURSES
  "bsma-abm-1-1": [
    { code: "FINACC1", name: "Financial Accounting & Reporting", units: 3 },
    {
      code: "FINACC2",
      name: "Conceptual Frameworks & Accounting Standards",
      units: 3,
    },
    { code: "FINMAN1", name: "Financial Markets", units: 3 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsma-abm-1-2": [
    { code: "ACCLAW1", name: "Laws on Obligations & Contracts", units: 3 },
    { code: "FINACC3", name: "Intermediate Accounting 1", units: 3 },
    { code: "BUSECO1", name: "Managerial Economics", units: 3 },
    { code: "BUSMAN106", name: "Operations Management & TQM", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsma-abm-1-3": [
    { code: "BUSANA 1", name: "Management Science", units: 3 },
    { code: "BUSMAN101", name: "Human Behavior in Organization", units: 3 },
  ],
  "bsma-abm-2-1": [
    { code: "ACCIST 1", name: "Accounting Information System", units: 3 },
    { code: "ACCLAW 2", name: "Business Laws & Regulations", units: 3 },
    {
      code: "ADVACC 1",
      name: "Accounting for Specialized Transactions",
      units: 3,
    },
    { code: "COSMAN1", name: "Cost Accounting & Control", units: 3 },
    { code: "FINACC 4", name: "Intermediate Accounting 2", units: 3 },
    {
      code: "GERMIC 1",
      name: "Governance, Business Ethics, Risk Management & Internal Control",
      units: 3,
    },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsma-abm-2-2": [
    {
      code: "ACCLAW3",
      name: "Regulatory Framework & Legal Issues in Business",
      units: 3,
    },
    { code: "ACCTAX 1", name: "Income Taxation", units: 3 },
    { code: "COSMAN 2", name: "Strategic Cost Management", units: 3 },
    { code: "FINACC 5", name: "Intermediate Accounting 3", units: 3 },
    { code: "EXTAUD 1", name: "Auditing and Assurance Principles", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social and Political Dimensions",
      units: 3,
    },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsma-abm-2-3": [
    { code: "ACCIST 2", name: "IT Application Tools in Business", units: 3 },
    { code: "BUSECO 2", name: "Economic Development", units: 3 },
  ],
  "bsma-abm-3-1": [
    { code: "ACCTAX 2", name: "Business Tax", units: 3 },
    {
      code: "ADVACC 3",
      name: "Accounting for Government & Non-profit Organizations",
      units: 3,
    },
    { code: "FINACC 6", name: "Issues in Financial Reporting", units: 3 },
    { code: "FINMAN 2", name: "Financial Management", units: 3 },
    { code: "MAELECT 1", name: "Accounting Elective 1", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
  ],
  "bsma-abm-3-2": [
    { code: "ACCTAX 3", name: "Strategic Tax Management", units: 3 },
    {
      code: "ADVACC 2",
      name: "Accounting for Business Combinations",
      units: 3,
    },
    { code: "BUSMAN 104", name: "Project Management", units: 3 },
    { code: "COSMAN 3", name: "Strategic Business Analysis", units: 3 },
    { code: "GERMIC 2", name: "Enterprise Risk Management", units: 3 },
    { code: "MAELECT 2", name: "Management Accounting Elective 2", units: 3 },
    {
      code: "FINMAN 3",
      name: "International Business, Trade & Finance",
      units: 3,
    },
    {
      code: "PERMEA 1",
      name: "Performance Management & Measurement",
      units: 3,
    },
    {
      code: "GE ELECT-GB",
      name: "Great Books: World Literary Classics",
      units: 3,
    },
  ],
  "bsma-abm-3-3": [],
  "bsma-abm-4-1": [
    { code: "BURMET 1", name: "Accounting Research Methods", units: 3 },
    {
      code: "BURMET 2",
      name: "Statistical Analysis with Software Application",
      units: 3,
    },
    { code: "BUSTRA 1", name: "Strategic Management", units: 3 },
    { code: "BUSTRA 2", name: "Sustainability & Strategic Audit", units: 3 },
    { code: "FINMAN4", name: "Valuation Techniques and Methods", units: 3 },
    { code: "MAELECT3", name: "Management Accounting Elective 3", units: 3 },
    { code: "MAELECT4", name: "Management Accounting Elective 4", units: 3 },
  ],
  "bsma-abm-4-2": [
    { code: "ACCAPS 1", name: "Accounting Internship", units: 3 },
    { code: "ACCAPS 2", name: "Accounting Thesis", units: 3 },
  ],
  "bsma-abm-4-3": [],

  // ─── BSMA Non-ABM Track ───────────────────────────────────────────────────────
  "bsma-nonabm-1-1": [
    {
      code: "ABMBRC 2",
      name: "Organization, Management & Marketing",
      units: 3,
    },
    { code: "FINACC1", name: "Financial Accounting & Reporting", units: 6 },
    {
      code: "FINACC2",
      name: "Conceptual Frameworks & Accounting Standards",
      units: 3,
    },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsma-nonabm-1-2": [
    { code: "ABMBRC 4", name: "Business Finance", units: 3 },
    { code: "FINACC3", name: "Intermediate Accounting 1", units: 3 },
    { code: "BUSECO1", name: "Managerial Economics", units: 3 },
    { code: "BUSMAN106", name: "Operations Management & TQM", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsma-nonabm-1-3": [
    { code: "ACCLAW1", name: "Laws on Obligations & Contracts", units: 3 },
    { code: "AELECT1", name: "Accounting Elective 1", units: 3 },
    { code: "FINMAN1", name: "Financial Markets", units: 3 },
  ],
  "bsma-nonabm-2-1": [
    { code: "ACCIST 1", name: "Accounting Information System", units: 3 },
    { code: "ACCLAW 2", name: "Business Laws & Regulations", units: 3 },
    {
      code: "ADVACC 1",
      name: "Accounting for Specialized Transactions",
      units: 3,
    },
    { code: "COSMAN1", name: "Cost Accounting & Control", units: 3 },
    { code: "FINACC 4", name: "Intermediate Accounting 2", units: 3 },
    {
      code: "GERMIC 1",
      name: "Governance, Business Ethics, Risk Management & Internal Control",
      units: 3,
    },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsma-nonabm-2-2": [
    {
      code: "ACCLAW3",
      name: "Regulatory Framework & Legal Issues in Business",
      units: 3,
    },
    { code: "ACCTAX 1", name: "Income Taxation", units: 3 },
    { code: "COSMAN 2", name: "Strategic Cost Management", units: 3 },
    { code: "FINACC 5", name: "Intermediate Accounting 3", units: 3 },
    { code: "EXTAUD 1", name: "Auditing and Assurance Principles", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsma-nonabm-2-3": [
    { code: "ACCIST 2", name: "IT Application Tools in Business", units: 3 },
    { code: "BUSANA 1", name: "Management Science", units: 3 },
    { code: "BUSECO 2", name: "Economic Development", units: 3 },
  ],
  "bsma-nonabm-3-1": [
    { code: "ACCTAX 2", name: "Business Tax", units: 3 },
    {
      code: "ADVACC 3",
      name: "Accounting for Government & Non-profit Organizations",
      units: 3,
    },
    { code: "FINACC 6", name: "Issues in Financial Reporting", units: 3 },
    { code: "FINMAN 2", name: "Financial Management", units: 3 },
    { code: "MAELECT 1", name: "Accounting Elective 1", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
  ],
  "bsma-nonabm-3-2": [
    { code: "ACCTAX 3", name: "Strategic Tax Management", units: 3 },
    {
      code: "ADVACC 2",
      name: "Accounting for Business Combinations",
      units: 3,
    },
    { code: "BUSMAN 104", name: "Project Management", units: 3 },
    { code: "COSMAN 3", name: "Strategic Business Analysis", units: 3 },
    { code: "GERMIC 2", name: "Enterprise Risk Management", units: 3 },
    { code: "MAELECT 2", name: "Management Accounting Elective 2", units: 3 },
    {
      code: "FINMAN 3",
      name: "International Business, Trade & Finance",
      units: 3,
    },
    {
      code: "PERMEA 1",
      name: "Performance Management & Measurement",
      units: 3,
    },
    {
      code: "GE ELECT-GB",
      name: "Great Books: World Literary Classics",
      units: 3,
    },
  ],
  "bsma-nonabm-3-3": [],
  "bsma-nonabm-4-1": [
    { code: "BURMET 1", name: "Accounting Research Methods", units: 3 },
    {
      code: "BURMET 2",
      name: "Statistical Analysis with Software Application",
      units: 3,
    },
    { code: "BUSTRA 1", name: "Strategic Management", units: 3 },
    { code: "BUSTRA 2", name: "Sustainability & Strategic Audit", units: 3 },
    { code: "FINMAN4", name: "Valuation Techniques and Methods", units: 3 },
    { code: "MAELECT3", name: "Management Accounting Elective 3", units: 3 },
    { code: "MAELECT4", name: "Management Accounting Elective 4", units: 3 },
  ],
  "bsma-nonabm-4-2": [
    { code: "ACCAPS 1", name: "Accounting Internship", units: 3 },
    { code: "ACCAPS 2", name: "Accounting Thesis", units: 3 },
  ],
  "bsma-nonabm-4-3": [],

  // ─── BSAc ABM Track ───────────────────────────────────────────────────────────
  // Note: BSAc also has ABM and Non-ABM tracks; split into bsac-abm and bsac-nonabm in COURSES
  "bsac-abm-1-1": [
    { code: "FINACC1", name: "Financial Accounting & Reporting", units: 6 },
    {
      code: "FINACC2",
      name: "Conceptual Frameworks & Accounting Standards",
      units: 3,
    },
    { code: "FINMAN1", name: "Financial Markets", units: 3 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsac-abm-1-2": [
    { code: "ACCLAW1", name: "Laws on Obligations & Contracts", units: 3 },
    { code: "FINACC3", name: "Intermediate Accounting 1", units: 3 },
    { code: "BUSECO1", name: "Managerial Economics", units: 3 },
    { code: "BUSMAN106", name: "Operations Management & TQM", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsac-abm-1-3": [
    { code: "AELECT1", name: "Accounting Elective 1", units: 3 },
    { code: "BUSANA 1", name: "Management Science", units: 3 },
  ],
  "bsac-abm-2-1": [
    { code: "ACCIST 1", name: "Accounting Information System", units: 3 },
    { code: "ACCLAW 2", name: "Business Laws & Regulations", units: 3 },
    {
      code: "ADVACC 1",
      name: "Accounting for Specialized Transactions",
      units: 3,
    },
    { code: "COSMAN1", name: "Cost Accounting & Control", units: 3 },
    { code: "FINACC 4", name: "Intermediate Accounting 2", units: 3 },
    {
      code: "GERMIC 1",
      name: "Governance, Business Ethics, Risk Management & Internal Control",
      units: 3,
    },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsac-abm-2-2": [
    {
      code: "ACCLAW3",
      name: "Regulatory Framework & Legal Issues in Business",
      units: 3,
    },
    { code: "ACCTAX 1", name: "Income Taxation", units: 3 },
    { code: "COSMAN 2", name: "Strategic Cost Management", units: 3 },
    { code: "FINACC 5", name: "Intermediate Accounting 3", units: 3 },
    { code: "EXTAUD 1", name: "Auditing and Assurance Principles", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsac-abm-2-3": [
    { code: "ACCIST 2", name: "IT Application Tools in Business", units: 3 },
    { code: "BUSECO 2", name: "Economic Development", units: 3 },
  ],
  "bsac-abm-3-1": [
    { code: "ACCTAX 2", name: "Business Tax", units: 3 },
    {
      code: "ADVACC 3",
      name: "Accounting for Government & Nonprofit Organizations",
      units: 3,
    },
    { code: "AELECT 2", name: "Accounting Elective 2", units: 3 },
    {
      code: "EXTAUD 2",
      name: "Auditing & Assurance: Concepts & App 1",
      units: 3,
    },
    {
      code: "EXTAUD 3",
      name: "Auditing & Assurance: Concepts & App 2",
      units: 3,
    },
    { code: "FINACC 6", name: "Issues in Financial Reporting", units: 3 },
    { code: "FINMAN 2", name: "Financial Management", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
  ],
  "bsac-abm-3-2": [
    { code: "ACCTAX 3", name: "Strategic Tax Management", units: 3 },
    {
      code: "ADVACC 2",
      name: "Accounting for Business Combinations",
      units: 3,
    },
    { code: "AELECT 3", name: "Accounting Elective 3", units: 3 },
    { code: "AUDCIS 1", name: "Auditing in CIS Environment", units: 3 },
    { code: "COSMAN 3", name: "Strategic Business Analysis", units: 3 },
    {
      code: "EXTAUD 4",
      name: "Auditing & Assurance: Specialized Industries",
      units: 3,
    },
    {
      code: "FINMAN 3",
      name: "International Business, Trade & Finance",
      units: 3,
    },
    { code: "BUSTRA 1", name: "Strategic Management", units: 3 },
    {
      code: "GE ELECT-GB",
      name: "Great Books: World Literary Classics",
      units: 3,
    },
  ],
  "bsac-abm-3-3": [
    { code: "AELECT 4", name: "Accounting Elective 4 - FINMAN4", units: 3 },
    { code: "BURMET 1", name: "Accounting Research Methods", units: 3 },
    {
      code: "BURMET 2",
      name: "Statistical Analysis w/Software Application",
      units: 3,
    },
  ],
  "bsac-abm-4-1": [
    { code: "ACCAPS 1", name: "Accounting Internship", units: 6 },
    { code: "ACCAPS 2", name: "Accounting Thesis", units: 3 },
    {
      code: "INTEGS 1",
      name: "IC 1: Financial Accounting & Reporting 1",
      units: 3,
    },
  ],
  "bsac-abm-4-2": [
    {
      code: "INTEGS 2",
      name: "IC 2: Financial Accounting & Reporting 2",
      units: 3,
    },
    {
      code: "INTEGS 3",
      name: "IC 3: Advanced Financial Accounting & Reporting",
      units: 3,
    },
    { code: "INTEGS 4", name: "IC 4: Management Advisory Services", units: 3 },
    {
      code: "INTEGS 5",
      name: "IC 5: Regulatory Framework for Business Transactions",
      units: 6,
    },
    { code: "INTEGS 6", name: "IC 6: Taxation", units: 3 },
    { code: "INTEGS 7", name: "IC 7: Auditing", units: 3 },
  ],
  "bsac-abm-4-3": [],

  // ─── BSAc Non-ABM Track ───────────────────────────────────────────────────────
  "bsac-nonabm-1-1": [
    {
      code: "ABMBRC 2",
      name: "Organization, Management & Marketing",
      units: 3,
    },
    { code: "FINACC1", name: "Financial Accounting & Reporting", units: 6 },
    {
      code: "FINACC2",
      name: "Conceptual Frameworks & Accounting Standards",
      units: 3,
    },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    {
      code: "FFP1",
      name: "Freshman Formation Program 1",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
  ],
  "bsac-nonabm-1-2": [
    { code: "ABMBRC 4", name: "Business Finance", units: 3 },
    { code: "FINACC3", name: "Intermediate Accounting 1", units: 3 },
    { code: "BUSECO1", name: "Managerial Economics", units: 3 },
    { code: "BUSMAN106", name: "Operations Management & TQM", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "FFP2",
      name: "Freshman Formation Program 2",
      units: 3,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
  ],
  "bsac-nonabm-1-3": [
    { code: "ACCLAW1", name: "Laws on Obligations & Contracts", units: 3 },
    { code: "AELECT1", name: "Accounting Elective 1", units: 3 },
    { code: "FINMAN1", name: "Financial Markets", units: 3 },
  ],
  "bsac-nonabm-2-1": [
    { code: "ACCIST 1", name: "Accounting Information System", units: 3 },
    { code: "ACCLAW 2", name: "Business Laws & Regulations", units: 3 },
    {
      code: "ADVACC 1",
      name: "Accounting for Specialized Transactions",
      units: 3,
    },
    { code: "COSMAN1", name: "Cost Accounting & Control", units: 3 },
    { code: "FINACC 4", name: "Intermediate Accounting 2", units: 3 },
    {
      code: "GERMIC 1",
      name: "Governance, Business Ethics, Risk Management & Internal Control",
      units: 3,
    },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsac-nonabm-2-2": [
    {
      code: "ACCLAW3",
      name: "Regulatory Framework & Legal Issues in Business",
      units: 3,
    },
    { code: "ACCTAX 1", name: "Income Taxation", units: 3 },
    { code: "COSMAN 2", name: "Strategic Cost Management", units: 3 },
    { code: "FINACC 5", name: "Intermediate Accounting 3", units: 3 },
    { code: "EXTAUD 1", name: "Auditing and Assurance Principles", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsac-nonabm-2-3": [
    { code: "ACCIST 2", name: "IT Application Tools in Business", units: 3 },
    { code: "BUSANA 1", name: "Management Science", units: 3 },
    { code: "BUSECO 2", name: "Economic Development", units: 3 },
  ],
  "bsac-nonabm-3-1": [
    { code: "ACCTAX 2", name: "Business Tax", units: 3 },
    {
      code: "ADVACC 3",
      name: "Accounting for Government & Nonprofit Organizations",
      units: 3,
    },
    { code: "AELECT 2", name: "Accounting Elective 2", units: 3 },
    {
      code: "EXTAUD 2",
      name: "Auditing & Assurance: Concepts & App 1",
      units: 3,
    },
    {
      code: "EXTAUD 3",
      name: "Auditing & Assurance: Concepts & App 2",
      units: 3,
    },
    { code: "FINACC 6", name: "Issues in Financial Reporting", units: 3 },
    { code: "FINMAN 2", name: "Financial Management", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
  ],
  "bsac-nonabm-3-2": [
    { code: "ACCTAX 3", name: "Strategic Tax Management", units: 3 },
    {
      code: "ADVACC 2",
      name: "Accounting for Business Combinations",
      units: 3,
    },
    { code: "AELECT 3", name: "Accounting Elective 3", units: 3 },
    { code: "AUDCIS 1", name: "Auditing in CIS Environment", units: 3 },
    { code: "COSMAN 3", name: "Strategic Business Analysis", units: 3 },
    {
      code: "EXTAUD 4",
      name: "Auditing & Assurance: Specialized Industries",
      units: 3,
    },
    {
      code: "FINMAN 3",
      name: "International Business, Trade & Finance",
      units: 3,
    },
    { code: "BUSTRA 1", name: "Strategic Management", units: 3 },
    {
      code: "GE ELECT-GB",
      name: "Great Books: World Literary Classics",
      units: 3,
    },
  ],
  "bsac-nonabm-3-3": [
    { code: "AELECT 4", name: "Accounting Elective 4 - FINMAN4", units: 3 },
    { code: "BURMET 1", name: "Accounting Research Methods", units: 3 },
    {
      code: "BURMET 2",
      name: "Statistical Analysis w/Software Application",
      units: 3,
    },
  ],
  "bsac-nonabm-4-1": [
    { code: "ACCAPS 1", name: "Accounting Internship", units: 6 },
    { code: "ACCAPS 2", name: "Accounting Thesis", units: 3 },
    {
      code: "INTEGS 1",
      name: "IC 1: Financial Accounting & Reporting 1",
      units: 3,
    },
  ],
  "bsac-nonabm-4-2": [
    {
      code: "INTEGS 2",
      name: "IC 2: Financial Accounting & Reporting 2",
      units: 3,
    },
    {
      code: "INTEGS 3",
      name: "IC 3: Advanced Financial Accounting & Reporting",
      units: 3,
    },
    { code: "INTEGS 4", name: "IC 4: Management Advisory Services", units: 3 },
    {
      code: "INTEGS 5",
      name: "IC 5: Regulatory Framework for Business Transactions",
      units: 6,
    },
    { code: "INTEGS 6", name: "IC 6: Taxation", units: 3 },
    { code: "INTEGS 7", name: "IC 7: Auditing", units: 3 },
  ],
};

export const SUBJECTS_BY_COURSE_YEAR_OLD = {
  // ─── BS Nursing ───────────────────────────────────────────────────────────
  "bsn-1-1": [], // 1st Year, 1st Semester
  "bsn-1-2": [], // 1st Year, 2nd Semester
  "bsn-1-3": [], // 1st Year, Summer
  "bsn-2-1": [], // 2nd Year, 1st Semester
  "bsn-2-2": [], // 2nd Year, 2nd Semester
  "bsn-2-3": [], // 2nd Year, Summer
  "bsn-3-1": [], // 3rd Year, 1st Semester
  "bsn-3-2": [], // 3rd Year, 2nd Semester
  "bsn-3-3": [], // 3rd Year, Summer
  "bsn-4-1": [], // 4th Year, 1st Semester
  "bsn-4-2": [], // 4th Year, 2nd Semester
  "bsn-4-3": [], // 4th Year, Summer

  // ─── BS Computer Science ──────────────────────────────────────────────────
  "bscs-1-1": [
    // 1st Year, 1st Semester
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    {
      code: "FFP1",
      name: "Freshmen Formation Program 1",
      units: 1.5,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
    { code: "CIT.001", name: "Problem Solving Fundamentals", units: 3 },
  ],
  "bscs-1-2": [
    // 1st Year, 2nd Semester
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    {
      code: "FFP2",
      name: "Freshmen Formation Program 2",
      units: 1.5,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    { code: "CIT.002", name: "Computer Programming 1", units: 4 },
  ],
  "bscs-2-1": [
    // 2nd Year, 1st Semester
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "CITM.001", name: "Discrete Mathematics", units: 3 },
    { code: "CS.211", name: "Logic Theory", units: 3 },
    { code: "CIT.004", name: "Computer Programming II", units: 4 },
    { code: "CIT.003", name: "Web Programming", units: 3 },
  ],
  "bscs-2-2": [
    // 2nd Year, 2nd Semester
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "CIT.005", name: "Object-Oriented Programming", units: 3 },
    { code: "CIT.006", name: "Data Structure", units: 4 },
    { code: "CIT.007", name: "Server-Side Scripting", units: 3 },
    { code: "CIT.008", name: "Systems Analysis & Design", units: 3 },
  ],
  "bscs-2-3": [
    // 2nd Year, Summer
    { code: "GE ELECT-DA", name: "Data Analytics", units: 3 },
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
  ],
  "bscs-3-1": [
    // 3rd Year, 1st Semester
    { code: "CIT.009", name: "Database Management System", units: 3 },
    { code: "CIT.010", name: "Web Systems & Technologies", units: 3 },
    { code: "CS.311", name: "Automata Theory", units: 3 },
    { code: "CS.312", name: "Programming Languages", units: 3 },
    { code: "CS.313", name: "Algorithm Analysis", units: 3 },
    { code: "CS.314", name: "Computer Architecture", units: 3 },
    { code: "CIT.011", name: "Human-Computer Interaction", units: 3 },
    { code: "COGNATE1", name: "Cognate Course 1", units: 3 },
  ],
  "bscs-3-2": [
    // 3rd Year, 2nd Semester
    { code: "CIT.012", name: "Research", units: 3 },
    { code: "CITM.002", name: "Statistics", units: 3 },
    { code: "CS.321", name: "Artificial Intelligence", units: 3 },
    { code: "CS.322", name: "Software Engineering I", units: 3 },
    { code: "CIT.013", name: "System Testing and Evaluation", units: 3 },
    { code: "CIT.014", name: "Technopreneurship", units: 3 },
    { code: "COGNATE2", name: "Cognate Course 2", units: 3 },
  ],
  "bscs-4-1": [
    // 4th Year, 1st Semester
    { code: "CS.411", name: "Thesis I", units: 3 },
    { code: "CIT.015", name: "Operating System", units: 3 },
    { code: "CS.412", name: "Data Mining", units: 3 },
    { code: "CIT.016", name: "Data Communications", units: 3 },
    { code: "CS.413", name: "Software Engineering II", units: 3 },
    { code: "CIT.017", name: "Information Assurance & Security", units: 3 },
    { code: "COGNATE3", name: "Cognate Course 3", units: 3 },
  ],
  "bscs-4-2": [
    // 4th Year, 2nd Semester
    { code: "CS.421", name: "Thesis II", units: 3 },
    { code: "CIT.018", name: "Social & Professional Issues", units: 3 },
    { code: "COGNATE4", name: "Cognate Course 4", units: 3 },
  ],

  // ─── BS Information Technology ────────────────────────────────────────────
  "bsit-1-1": [
    // 1st Year, 1st Semester
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    {
      code: "FFP1",
      name: "Freshmen Formation Program 1",
      units: 1.5,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
    { code: "CIT.001", name: "Problem Solving Fundamentals", units: 3 },
    { code: "IT.111", name: "Digital Multimedia", units: 3 },
  ],
  "bsit-1-2": [
    // 1st Year, 2nd Semester
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    {
      code: "FFP2",
      name: "Freshmen Formation Program 2",
      units: 1.5,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
    { code: "CIT.002", name: "Computer Programming I", units: 4 },
  ],
  "bsit-2-1": [
    // 2nd Year, 1st Semester
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec&Games I", units: 2 },
    { code: "CITM.001", name: "Discrete Mathematics", units: 3 },
    { code: "CIT.004", name: "Computer Programming II", units: 4 },
    { code: "CIT.003", name: "Web Programming", units: 3 },
  ],
  "bsit-2-2": [
    // 2nd Year, 2nd Semester
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "CIT.007", name: "Server-Side Scripting", units: 3 },
    { code: "CIT.006", name: "Data Structure & Algorithm", units: 4 },
    { code: "CIT.005", name: "Object-Oriented Programming", units: 3 },
    { code: "CIT.008", name: "Systems Analysis & Design", units: 3 },
  ],
  "bsit-2-3": [
    // 2nd Year, Summer
    { code: "GE ELECT-DA", name: "Data Analytics", units: 3 },
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
  ],
  "bsit-3-1": [
    // 3rd Year, 1st Semester
    { code: "CIT.009", name: "Database Management System", units: 3 },
    { code: "CIT.010", name: "Web Systems & Technologies", units: 3 },
    { code: "CIT.011", name: "Human-Computer Interaction", units: 3 },
    { code: "CITM.003", name: "Quantitative Methods", units: 3 },
    { code: "CIT.015", name: "Operating Systems", units: 3 },
    {
      code: "IT.311",
      name: "Integrative Programming and Technologies",
      units: 3,
    },
    { code: "COGNATE1", name: "Cognate Course 01", units: 3 },
  ],
  "bsit-3-2": [
    // 3rd Year, 2nd Semester
    { code: "CIT.012", name: "Research", units: 3 },
    { code: "IT.321", name: "Software Engineering", units: 3 },
    { code: "CIT.013", name: "System Testing & Evaluation", units: 3 },
    { code: "IT.322", name: "Web Server Administration", units: 3 },
    { code: "CIT.014", name: "Technopreneurship", units: 3 },
    { code: "COGNATE2", name: "Cognate Course 02", units: 3 },
    { code: "COGNATE3", name: "Cognate Course 03", units: 3 },
  ],
  "bsit-4-1": [
    // 4th Year, 1st Semester
    { code: "IT.411", name: "Capstone I", units: 3 },
    { code: "IT.412", name: "Information Management", units: 3 },
    { code: "CIT.017", name: "Information Assurance & Security", units: 3 },
    { code: "CIT.016", name: "Data Communication", units: 3 },
    { code: "IT.413", name: "Systems Integration", units: 3 },
    { code: "COGNATE4", name: "Cognate Course 04", units: 3 },
  ],
  "bsit-4-2": [
    // 4th Year, 2nd Semester
    { code: "IT.421", name: "Capstone II", units: 3 },
    { code: "CIT.018", name: "Social & Professional Issues", units: 3 },
    { code: "IT.422", name: "Information Security Audit", units: 3 },
    { code: "IT.423", name: "E-Commerce", units: 3 },
    { code: "IT.424", name: "Wired and Wireless Networks", units: 3 },
  ],

  // ─── BS New Media and Computer Animation ──────────────────────────────────
  "bsnmca-1-1": [
    // 1st Year, 1st Semester
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    {
      code: "FFP-NSTP1",
      name: "Freshmen Formation Program/NSTP1",
      units: 4.5,
      countForGPA: false,
    },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
    { code: "NMCA.111", name: "Photography", units: 3 },
    { code: "NMCA.112", name: "Film Appreciation", units: 3 },
  ],
  "bsnmca-1-2": [
    // 1st Year, 2nd Semester
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    {
      code: "FFP-NSTP2",
      name: "Freshmen Formation Program/NSTP2",
      units: 4.5,
      countForGPA: false,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
    { code: "NMCA.121", name: "Screenplay I", units: 3 },
    { code: "NMCA.122", name: "Visual Conceptualization", units: 3 },
    { code: "NMCA.123", name: "Sound Design & Voice Acting", units: 3 },
  ],
  "bsnmca-2-1": [
    // 2nd Year, 1st Semester
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
    { code: "NMCA.211", name: "Motion Graphics & Visual Effects", units: 5 },
    { code: "NMCA.212", name: "Screen Acting", units: 3 },
    { code: "NMCA.213", name: "Principles of Animation", units: 3 },
    { code: "NMCA.214", name: "Screenplay II", units: 3 },
  ],
  "bsnmca-2-2": [
    // 2nd Year, 2nd Semester
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    { code: "NMCA.221", name: "Film Production and Industry", units: 3 },
    { code: "NMCA.222", name: "3D Modelling", units: 5 },
    { code: "COGNATE1", name: "Cognate Course 01", units: 3 },
  ],
  "bsnmca-2-3": [
    // 2nd Year, Summer
    { code: "GE ELECT-DA", name: "Data Analytics", units: 3 },
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
  ],
  "bsnmca-3-1": [
    // 3rd Year, 1st Semester
    { code: "NMCA.311", name: "Texturing and Rendering", units: 5 },
    { code: "NMCA.312", name: "3D Animation", units: 5 },
    { code: "NMCA.313", name: "3D Rigging", units: 5 },
    { code: "NMCA.314", name: "IT with Word, Spreadsheet, & others", units: 3 },
    { code: "COGNATE2", name: "Cognate Course 02", units: 3 },
  ],
  "bsnmca-3-2": [
    // 3rd Year, 2nd Semester
    { code: "LITMOD", name: "Literature of the Modern World", units: 3 },
    { code: "CIT.014", name: "Technopreneurship", units: 3 },
    { code: "NMCA.321", name: "3D Dynamics", units: 5 },
    { code: "NMCA.322", name: "IT Ethics", units: 3 },
    { code: "COGNATE3", name: "Cognate Course 03", units: 3 },
  ],
  "bsnmca-4-1": [
    // 4th Year, 1st Semester
    { code: "NMCA.411", name: "Senior Animation Film Production I", units: 3 },
    { code: "NMCA.412", name: "Portfolio Development", units: 3 },
    { code: "NMCA.413", name: "Digital Marketing", units: 3 },
    { code: "COGNATE4", name: "Cognate Course 04", units: 3 },
  ],
  "bsnmca-4-2": [
    // 4th Year, 2nd Semester
    { code: "NMCA.421", name: "Senior Animation Film Production II", units: 3 },
    { code: "NMCA.422", name: "Animation Seminars", units: 3 },
    { code: "NMCA.423", name: "Portfolio Development II", units: 3 },
  ],

  // ─── Associate in Electronics Engineering Technology ──────────────────────
  // Note: 2-year program, only years 1–2
  "aeet-1-1": [
    // 1st Year, 1st Semester
    {
      code: "EET 111",
      name: "Computer Hardware Fund: Troubleshooting & Maintenance",
      units: 3,
    },
    {
      code: "EET 112",
      name: "Office Productivity Tools and Applications",
      units: 3,
    },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
    {
      code: "FFP1",
      name: "Freshmen Formation Program 1",
      units: 1.5,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
  ],
  "aeet-1-2": [
    // 1st Year, 2nd Semester
    {
      code: "EET 121",
      name: "Software Tools, Troubleshooting and Maintenance",
      units: 3,
    },
    {
      code: "EET 122",
      name: "Internet Technologies: Tools and Applications",
      units: 3,
    },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Traditions",
      units: 3,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
    {
      code: "FFP2",
      name: "Freshmen Formation Program 2",
      units: 1.5,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
  ],
  "aeet-1-3": [
    // 1st Year, Summer
    { code: "ENG.131", name: "Computer-Aided Drafting", units: 2 },
    {
      code: "EET 131",
      name: "Network Fund.: Wired & Wireless Networks",
      units: 3,
    },
    { code: "EET 132", name: "Logic Tools in Problem Solving", units: 3 },
  ],
  "aeet-2-1": [
    // 2nd Year, 1st Semester
    { code: "EET 211", name: "Intro. to Computer Programming", units: 4 },
    { code: "EET 212", name: "Fundamentals of AC & DC Circuits", units: 4 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "GE ELECT-LM", name: "Mindanao Literatures", units: 3 },
    { code: "COGNATE1", name: "Cognate Course 1", units: 3 },
    { code: "PATHFIT 3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "aeet-2-2": [
    // 2nd Year, 2nd Semester
    { code: "EET 221", name: "Practicum", units: 6 },
    { code: "COGNATE2", name: "Cognate Course 2", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "GE ELECT-DA", name: "Data Analytics", units: 3 },
    { code: "SCITECS", name: "Science, Technology & Society", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
    { code: "FILDIS", name: "Filipino sa Iba't Ibang Disiplina", units: 3 },
  ],

  // ─── BS Biology - Medical Biology ─────────────────────────────────────────
  "bsbiomed-1-1": [], // 1st Year, 1st Semester
  "bsbiomed-1-2": [], // 1st Year, 2nd Semester
  "bsbiomed-1-3": [], // 1st Year, Summer
  "bsbiomed-2-1": [], // 2nd Year, 1st Semester
  "bsbiomed-2-2": [], // 2nd Year, 2nd Semester
  "bsbiomed-2-3": [], // 2nd Year, Summer
  "bsbiomed-3-1": [], // 3rd Year, 1st Semester
  "bsbiomed-3-2": [], // 3rd Year, 2nd Semester
  "bsbiomed-3-3": [], // 3rd Year, Summer
  "bsbiomed-4-1": [], // 4th Year, 1st Semester
  "bsbiomed-4-2": [], // 4th Year, 2nd Semester
  "bsbiomed-4-3": [], // 4th Year, Summer

  // ─── BS Computer Engineering ──────────────────────────────────────────────
  "bscpe-1-1": [], // 1st Year, 1st Semester
  "bscpe-1-2": [], // 1st Year, 2nd Semester
  "bscpe-1-3": [], // 1st Year, Summer
  "bscpe-2-1": [], // 2nd Year, 1st Semester
  "bscpe-2-2": [], // 2nd Year, 2nd Semester
  "bscpe-2-3": [], // 2nd Year, Summer
  "bscpe-3-1": [], // 3rd Year, 1st Semester
  "bscpe-3-2": [], // 3rd Year, 2nd Semester
  "bscpe-3-3": [], // 3rd Year, Summer
  "bscpe-4-1": [], // 4th Year, 1st Semester
  "bscpe-4-2": [], // 4th Year, 2nd Semester
  "bscpe-4-3": [], // 4th Year, Summer

  // ─── BS Electronics Engineering ───────────────────────────────────────────
  "bsece-1-1": [], // 1st Year, 1st Semester
  "bsece-1-2": [], // 1st Year, 2nd Semester
  "bsece-1-3": [], // 1st Year, Summer
  "bsece-2-1": [], // 2nd Year, 1st Semester
  "bsece-2-2": [], // 2nd Year, 2nd Semester
  "bsece-2-3": [], // 2nd Year, Summer
  "bsece-3-1": [], // 3rd Year, 1st Semester
  "bsece-3-2": [], // 3rd Year, 2nd Semester
  "bsece-3-3": [], // 3rd Year, Summer
  "bsece-4-1": [], // 4th Year, 1st Semester
  "bsece-4-2": [], // 4th Year, 2nd Semester
  "bsece-4-3": [], // 4th Year, Summer

  // ─── BS Civil Engineering (Construction Management) ───────────────────────────
  "bsce-cm-1-1": [
    { code: "ENM.101", name: "Calculus 1: Differential Calculus", units: 3 },
    { code: "ENS.103", name: "Chemistry for Engineers", units: 4 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Trad",
      units: 3,
    },
    { code: "CE.101", name: "Civil Engineering Orientation", units: 2 },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
    {
      code: "FFP 1",
      name: "Freshmen Formation Program 1",
      units: 1.5,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
  ],
  "bsce-cm-1-2": [
    { code: "ENM.102", name: "Calculus 2: Integral Calculus", units: 3 },
    { code: "ENS.101", name: "Physics 1: Physics for Engineers", units: 4 },
    { code: "CE.121", name: "Engineering Drawing and Plans", units: 1 },
    { code: "CE.102", name: "Computer Fundamentals and Programming", units: 2 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Trad",
      units: 3,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
    {
      code: "FFP 2",
      name: "Freshmen Formation Program 2",
      units: 1.5,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
  ],
  "bsce-cm-1-3": [
    { code: "CE.103", name: "Computer-Aided Design for CE", units: 1 },
    { code: "ENG.205", name: "Engineering Economics", units: 3 },
    { code: "ENM.104", name: "Engineering Data Analysis", units: 3 },
  ],
  "bsce-cm-2-1": [
    { code: "CE.104", name: "Statics of Rigid Bodies", units: 3 },
    { code: "LITMIN", name: "Literatures of Mindanao", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "CE.105", name: "Fundamentals of Surveying", units: 4 },
    { code: "ENM.103", name: "Differential Equations", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsce-cm-2-2": [
    { code: "CE.106", name: "Dynamics of Rigid Bodies", units: 2 },
    { code: "CE.107", name: "Geology for Civil Engineers", units: 2 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "CE.108", name: "Mechanics of Deformable Bodies", units: 4 },
    { code: "GE-Elect DA", name: "Data Analytics", units: 3 },
    { code: "CE.109", name: "Construction Materials and Testing", units: 3 },
    { code: "SCIETECS", name: "Science, Technology & Society", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsce-cm-2-3": [
    { code: "CE.110", name: "Engineering Management for CE", units: 2 },
    { code: "CE.111", name: "Numerical Solutions to CE Problems", units: 3 },
    { code: "CE.112", name: "Engineering Utilities 1", units: 3 },
  ],
  "bsce-cm-3-1": [
    { code: "CE.113", name: "Structural Theory", units: 4 },
    { code: "CE.114", name: "Highway and Railroad Engineering", units: 3 },
    { code: "CE.115", name: "Hydrology", units: 2 },
    { code: "CE.116", name: "Engineering Utilities 2", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "ENG.201", name: "Technopreneurship", units: 3 },
    {
      code: "CE.117",
      name: "Principles of Transportation Engineering",
      units: 3,
    },
  ],
  "bsce-cm-3-2": [
    { code: "CE.118", name: "Building System Design", units: 3 },
    { code: "CE.119", name: "Principles of Steel Design", units: 3 },
    {
      code: "CE.120",
      name: "Principles of Reinforced/Pre-Stressed Concrete",
      units: 4,
    },
    { code: "CE.121", name: "Hydraulics", units: 5 },
    { code: "CE.122", name: "CE Law, Contracts and Ethics", units: 2 },
  ],
  "bsce-cm-3-3": [
    { code: "CE.141C", name: "Construction Cost Engineering", units: 3 },
    { code: "CE.142C", name: "Project Construction and Management", units: 3 },
    {
      code: "CE.123",
      name: "Construction Methods and Project Management",
      units: 3,
    },
  ],
  "bsce-cm-4-1": [
    { code: "CE.131", name: "CE Project 1", units: 2 },
    {
      code: "CE.124",
      name: "Geotechnical Engineering (Soil Mechanics)",
      units: 4,
    },
    {
      code: "CE.143C",
      name: "Advanced Construction Methods and Equipment",
      units: 3,
    },
    { code: "CE.125", name: "Quantity Surveying", units: 2 },
    {
      code: "CE.144C",
      name: "Construction Occupational Safety and Health",
      units: 3,
    },
    { code: "CE.146C", name: "Database Management in Construction", units: 3 },
    { code: "CE.133", name: "CE Integration Course 1", units: 3 },
  ],
  "bsce-cm-4-2": [
    { code: "CE.132", name: "CE Project 2", units: 2 },
    {
      code: "CE.126",
      name: "CE on the Job Training (240 hrs. Minimum)",
      units: 3,
    },
    { code: "CE.134", name: "CE Integration Course 2", units: 3 },
  ],

  // ─── BS Civil Engineering (Structural) ────────────────────────────────────────
  "bsce-st-1-1": [
    { code: "ENM.101", name: "Calculus 1: Differential Calculus", units: 3 },
    { code: "ENS.103", name: "Chemistry for Engineers", units: 4 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Trad",
      units: 3,
    },
    { code: "CE.101", name: "Civil Engineering Orientation", units: 2 },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
    {
      code: "FFP 1",
      name: "Freshmen Formation Program 1",
      units: 1.5,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
  ],
  "bsce-st-1-2": [
    { code: "ENM.102", name: "Calculus 2: Integral Calculus", units: 3 },
    { code: "ENS.101", name: "Physics 1: Physics for Engineers", units: 4 },
    { code: "CE.121", name: "Engineering Drawing and Plans", units: 1 },
    { code: "CE.102", name: "Computer Fundamentals and Programming", units: 2 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Trad",
      units: 3,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
    {
      code: "FFP 2",
      name: "Freshmen Formation Program 2",
      units: 1.5,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
  ],
  "bsce-st-1-3": [
    { code: "CE.103", name: "Computer-Aided Design for CE", units: 1 },
    { code: "ENG.205", name: "Engineering Economics", units: 3 },
    { code: "ENM.104", name: "Engineering Data Analysis", units: 3 },
  ],
  "bsce-st-2-1": [
    { code: "CE.104", name: "Statics of Rigid Bodies", units: 3 },
    { code: "GE ELECT-LM", name: "Literatures of Mindanao", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "CE.105", name: "Fundamentals of Surveying", units: 4 },
    { code: "ENM.103", name: "Differential Equations", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsce-st-2-2": [
    { code: "CE.106", name: "Dynamics of Rigid Bodies", units: 2 },
    { code: "CE.107", name: "Geology for Civil Engineers", units: 2 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "CE.108", name: "Mechanics of Deformable Bodies", units: 4 },
    { code: "GE-Elect DA", name: "Data Analytics", units: 3 },
    { code: "CE.109", name: "Construction Materials and Testing", units: 3 },
    { code: "SCIETECS", name: "Science, Technology & Society", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsce-st-2-3": [
    { code: "CE.110", name: "Engineering Management for CE", units: 2 },
    { code: "CE.111", name: "Numerical Solutions to CE Problems", units: 3 },
    { code: "CE.112", name: "Engineering Utilities 1", units: 3 },
  ],
  "bsce-st-3-1": [
    { code: "CE.113", name: "Structural Theory", units: 4 },
    { code: "CE.114", name: "Highway and Railroad Engineering", units: 3 },
    { code: "CE.115", name: "Hydrology", units: 2 },
    { code: "CE.116", name: "Engineering Utilities 2", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "ENG.201", name: "Technopreneurship", units: 3 },
    {
      code: "CE.117",
      name: "Principles of Transportation Engineering",
      units: 3,
    },
  ],
  "bsce-st-3-2": [
    { code: "CE.118", name: "Building System Design", units: 3 },
    { code: "CE.119", name: "Principles of Steel Design", units: 3 },
    {
      code: "CE.120",
      name: "Principles of Reinforced/Pre-Stressed Concrete",
      units: 4,
    },
    { code: "CE.121", name: "Hydraulics", units: 5 },
    { code: "CE.122", name: "CE Law, Contracts and Ethics", units: 2 },
  ],
  "bsce-st-3-3": [
    { code: "CE.141S", name: "Design of Steel Structures", units: 3 },
    { code: "CE.1425", name: "Bridge Engineering", units: 3 },
    {
      code: "CE.123",
      name: "Construction Methods and Project Management",
      units: 3,
    },
  ],
  "bsce-st-4-1": [
    { code: "CE.131", name: "CE Project 1", units: 2 },
    {
      code: "CE.124",
      name: "Geotechnical Engineering (Soil Mechanics)",
      units: 4,
    },
    { code: "CE.1435", name: "Pre-Stressed Concrete Design", units: 3 },
    { code: "CE.125", name: "Quantity Surveying", units: 2 },
    { code: "CE.1445", name: "Reinforced Concrete Design", units: 3 },
    { code: "CE.1455", name: "Foundation and Retaining Wall Design", units: 3 },
    { code: "CE.133", name: "CE Integration Course 1", units: 3 },
  ],
  "bsce-st-4-2": [
    { code: "CE.132", name: "CE Project 2", units: 2 },
    {
      code: "CE.126",
      name: "CE on the Job Training (240 hrs. Minimum)",
      units: 3,
    },
    { code: "CE.134", name: "CE Integration Course 2", units: 3 },
  ],

  // ─── BS Civil Engineering (Geo-Technical) ─────────────────────────────────────
  "bsce-gt-1-1": [
    { code: "ENM.101", name: "Calculus 1: Differential Calculus", units: 3 },
    { code: "ENS.103", name: "Chemistry for Engineers", units: 4 },
    { code: "UNDSELF", name: "Understanding the Self", units: 3 },
    { code: "MATMOD", name: "Mathematics in the Modern World", units: 3 },
    {
      code: "SPIECO",
      name: "Spirituality & Ecology in the Christian, Ignatian & Islamic Trad",
      units: 3,
    },
    { code: "CE.101", name: "Civil Engineering Orientation", units: 2 },
    { code: "PATHFIT1", name: "Movement Enhancement", units: 2 },
    {
      code: "FFP 1",
      name: "Freshmen Formation Program 1",
      units: 1.5,
      countForGPA: false,
    },
    {
      code: "NSTP1",
      name: "National Service Training Program 1",
      units: 3,
      countForGPA: false,
    },
  ],
  "bsce-gt-1-2": [
    { code: "ENM.102", name: "Calculus 2: Integral Calculus", units: 3 },
    { code: "ENS.101", name: "Physics 1: Physics for Engineers", units: 4 },
    { code: "CE.121", name: "Engineering Drawing and Plans", units: 1 },
    { code: "CE.102", name: "Computer Fundamentals and Programming", units: 2 },
    {
      code: "PHIHUM",
      name: "Philosophy of the Human Person: Social & Political Dimensions",
      units: 3,
    },
    {
      code: "VOCMIS",
      name: "Vocation & Mission in the Christian, Ignatian & Islamic Trad",
      units: 3,
    },
    { code: "PATHFIT2", name: "Fitness Exercise", units: 2 },
    {
      code: "FFP 2",
      name: "Freshmen Formation Program 2",
      units: 1.5,
      countForGPA: false,
    },
    {
      code: "NSTP2",
      name: "National Service Training Program 2",
      units: 3,
      countForGPA: false,
    },
  ],
  "bsce-gt-1-3": [
    { code: "CE.103", name: "Computer-Aided Design for CE", units: 1 },
    { code: "ENG.205", name: "Engineering Economics", units: 3 },
    { code: "ENM.104", name: "Engineering Data Analysis", units: 3 },
  ],
  "bsce-gt-2-1": [
    { code: "CE.104", name: "Statics of Rigid Bodies", units: 3 },
    { code: "LITMIN", name: "Literatures of Mindanao", units: 3 },
    { code: "ARTAPP", name: "Art Appreciation", units: 3 },
    { code: "CE.105", name: "Fundamentals of Surveying", units: 4 },
    { code: "ENM.103", name: "Differential Equations", units: 3 },
    { code: "ETHICS", name: "Ethics", units: 3 },
    { code: "CONWOR", name: "Contemporary World", units: 3 },
    { code: "PATHFIT3", name: "Dance/Sports/Rec & Games I", units: 2 },
  ],
  "bsce-gt-2-2": [
    { code: "CE.106", name: "Dynamics of Rigid Bodies", units: 2 },
    { code: "CE.107", name: "Geology for Civil Engineers", units: 2 },
    { code: "PHIHIS", name: "Readings in Philippine History", units: 3 },
    { code: "CE.108", name: "Mechanics of Deformable Bodies", units: 4 },
    { code: "GE-Elect DA", name: "Data Analytics", units: 3 },
    { code: "CE.109", name: "Construction Materials and Testing", units: 3 },
    { code: "SCIETECS", name: "Science, Technology & Society", units: 3 },
    { code: "PURCOM", name: "Purposive Communication", units: 3 },
    { code: "PATHFIT4", name: "Dance/Sports/Rec & Games II", units: 2 },
  ],
  "bsce-gt-2-3": [
    { code: "CE.110", name: "Engineering Management for CE", units: 2 },
    { code: "CE.111", name: "Numerical Solutions to CE Problems", units: 3 },
    { code: "CE.112", name: "Engineering Utilities 1", units: 3 },
  ],
  "bsce-gt-3-1": [
    { code: "CE.113", name: "Structural Theory", units: 4 },
    { code: "CE.114", name: "Highway and Railroad Engineering", units: 3 },
    { code: "CE.115", name: "Hydrology", units: 2 },
    { code: "CE.116", name: "Engineering Utilities 2", units: 3 },
    { code: "RIZAL", name: "Life and Works of Rizal", units: 3 },
    { code: "ENG.201", name: "Technopreneurship", units: 3 },
    {
      code: "CE.117",
      name: "Principles of Transportation Engineering",
      units: 3,
    },
  ],
  "bsce-gt-3-2": [
    { code: "CE.118", name: "Building System Design", units: 3 },
    { code: "CE.119", name: "Principles of Steel Design", units: 3 },
    {
      code: "CE.120",
      name: "Principles of Reinforced/Pre-Stressed Concrete",
      units: 4,
    },
    { code: "CE.121", name: "Hydraulics", units: 5 },
    { code: "CE.122", name: "CE Law, Contracts and Ethics", units: 2 },
  ],
  "bsce-gt-3-3": [
    { code: "CE.141G", name: "Foundation Engineering", units: 3 },
    { code: "CE.142G", name: "Geotechnical Earthquake Engineering", units: 3 },
    {
      code: "CE.123",
      name: "Construction Methods and Project Management",
      units: 3,
    },
  ],
  "bsce-gt-4-1": [
    { code: "CE.131", name: "CE Project 1", units: 2 },
    {
      code: "CE.124",
      name: "Geotechnical Engineering (Soil Mechanics)",
      units: 4,
    },
    {
      code: "CE.143G",
      name: "Geotechnical Engineering (Rock Mechanics)",
      units: 3,
    },
    { code: "CE.125", name: "Quantity Surveying", units: 2 },
    { code: "CE.144G", name: "Deep Foundation Engineering", units: 3 },
    { code: "CE.145G", name: "Ground Improvement", units: 3 },
    { code: "CE.133", name: "CE Integration Course 1", units: 3 },
  ],
  "bsce-gt-4-2": [
    { code: "CE.132", name: "CE Project 2", units: 2 },
    {
      code: "CE.126",
      name: "CE on the Job Training (240 hrs. Minimum)",
      units: 3,
    },
    { code: "CE.134", name: "CE Integration Course 2", units: 3 },
  ],

  // ─── BS Mathematics ───────────────────────────────────────────────────────
  "bsmath-1-1": [], // 1st Year, 1st Semester
  "bsmath-1-2": [], // 1st Year, 2nd Semester
  "bsmath-1-3": [], // 1st Year, Summer
  "bsmath-2-1": [], // 2nd Year, 1st Semester
  "bsmath-2-2": [], // 2nd Year, 2nd Semester
  "bsmath-2-3": [], // 2nd Year, Summer
  "bsmath-3-1": [], // 3rd Year, 1st Semester
  "bsmath-3-2": [], // 3rd Year, 2nd Semester
  "bsmath-3-3": [], // 3rd Year, Summer
  "bsmath-4-1": [], // 4th Year, 1st Semester
  "bsmath-4-2": [], // 4th Year, 2nd Semester
  "bsmath-4-3": [], // 4th Year, Summer

  // ─── BS Biology - Biology Research ────────────────────────────────────────
  "bsbio-1-1": [], // 1st Year, 1st Semester
  "bsbio-1-2": [], // 1st Year, 2nd Semester
  "bsbio-1-3": [], // 1st Year, Summer
  "bsbio-2-1": [], // 2nd Year, 1st Semester
  "bsbio-2-2": [], // 2nd Year, 2nd Semester
  "bsbio-2-3": [], // 2nd Year, Summer
  "bsbio-3-1": [], // 3rd Year, 1st Semester
  "bsbio-3-2": [], // 3rd Year, 2nd Semester
  "bsbio-3-3": [], // 3rd Year, Summer
  "bsbio-4-1": [], // 4th Year, 1st Semester
  "bsbio-4-2": [], // 4th Year, 2nd Semester
  "bsbio-4-3": [], // 4th Year, Summer

  // ─── BSEd - Major in Filipino ─────────────────────────────────────────────
  "bsed-1-1": [], // 1st Year, 1st Semester
  "bsed-1-2": [], // 1st Year, 2nd Semester
  "bsed-1-3": [], // 1st Year, Summer
  "bsed-2-1": [], // 2nd Year, 1st Semester
  "bsed-2-2": [], // 2nd Year, 2nd Semester
  "bsed-2-3": [], // 2nd Year, Summer
  "bsed-3-1": [], // 3rd Year, 1st Semester
  "bsed-3-2": [], // 3rd Year, 2nd Semester
  "bsed-3-3": [], // 3rd Year, Summer
  "bsed-4-1": [], // 4th Year, 1st Semester
  "bsed-4-2": [], // 4th Year, 2nd Semester
  "bsed-4-3": [], // 4th Year, Summer

  // ─── Bachelor of Elementary Education ────────────────────────────────────
  "beed-1-1": [], // 1st Year, 1st Semester
  "beed-1-2": [], // 1st Year, 2nd Semester
  "beed-1-3": [], // 1st Year, Summer
  "beed-2-1": [], // 2nd Year, 1st Semester
  "beed-2-2": [], // 2nd Year, 2nd Semester
  "beed-2-3": [], // 2nd Year, Summer
  "beed-3-1": [], // 3rd Year, 1st Semester
  "beed-3-2": [], // 3rd Year, 2nd Semester
  "beed-3-3": [], // 3rd Year, Summer
  "beed-4-1": [], // 4th Year, 1st Semester
  "beed-4-2": [], // 4th Year, 2nd Semester
  "beed-4-3": [], // 4th Year, Summer

  // ─── Bachelor of Physical Education ──────────────────────────────────────
  "bsped-1-1": [], // 1st Year, 1st Semester
  "bsped-1-2": [], // 1st Year, 2nd Semester
  "bsped-1-3": [], // 1st Year, Summer
  "bsped-2-1": [], // 2nd Year, 1st Semester
  "bsped-2-2": [], // 2nd Year, 2nd Semester
  "bsped-2-3": [], // 2nd Year, Summer
  "bsped-3-1": [], // 3rd Year, 1st Semester
  "bsped-3-2": [], // 3rd Year, 2nd Semester
  "bsped-3-3": [], // 3rd Year, Summer
  "bsped-4-1": [], // 4th Year, 1st Semester
  "bsped-4-2": [], // 4th Year, 2nd Semester
  "bsped-4-3": [], // 4th Year, Summer

  // ─── Bachelor of Early Childhood Education ────────────────────────────────
  "beced-1-1": [], // 1st Year, 1st Semester
  "beced-1-2": [], // 1st Year, 2nd Semester
  "beced-1-3": [], // 1st Year, Summer
  "beced-2-1": [], // 2nd Year, 1st Semester
  "beced-2-2": [], // 2nd Year, 2nd Semester
  "beced-2-3": [], // 2nd Year, Summer
  "beced-3-1": [], // 3rd Year, 1st Semester
  "beced-3-2": [], // 3rd Year, 2nd Semester
  "beced-3-3": [], // 3rd Year, Summer
  "beced-4-1": [], // 4th Year, 1st Semester
  "beced-4-2": [], // 4th Year, 2nd Semester
  "beced-4-3": [], // 4th Year, Summer

  // ─── BA Communication ─────────────────────────────────────────────────────
  // Note: course id has a space → 'ba comm'
  "ba comm-1-1": [], // 1st Year, 1st Semester
  "ba comm-1-2": [], // 1st Year, 2nd Semester
  "ba comm-1-3": [], // 1st Year, Summer
  "ba comm-2-1": [], // 2nd Year, 1st Semester
  "ba comm-2-2": [], // 2nd Year, 2nd Semester
  "ba comm-2-3": [], // 2nd Year, Summer
  "ba comm-3-1": [], // 3rd Year, 1st Semester
  "ba comm-3-2": [], // 3rd Year, 2nd Semester
  "ba comm-3-3": [], // 3rd Year, Summer
  "ba comm-4-1": [], // 4th Year, 1st Semester
  "ba comm-4-2": [], // 4th Year, 2nd Semester
  "ba comm-4-3": [], // 4th Year, Summer

  // ─── BA English Language Studies ──────────────────────────────────────────
  "baels-1-1": [], // 1st Year, 1st Semester
  "baels-1-2": [], // 1st Year, 2nd Semester
  "baels-1-3": [], // 1st Year, Summer
  "baels-2-1": [], // 2nd Year, 1st Semester
  "baels-2-2": [], // 2nd Year, 2nd Semester
  "baels-2-3": [], // 2nd Year, Summer
  "baels-3-1": [], // 3rd Year, 1st Semester
  "baels-3-2": [], // 3rd Year, 2nd Semester
  "baels-3-3": [], // 3rd Year, Summer
  "baels-4-1": [], // 4th Year, 1st Semester
  "baels-4-2": [], // 4th Year, 2nd Semester
  "baels-4-3": [], // 4th Year, Summer

  // ─── BA International Studies ─────────────────────────────────────────────
  "baints-1-1": [], // 1st Year, 1st Semester
  "baints-1-2": [], // 1st Year, 2nd Semester
  "baints-1-3": [], // 1st Year, Summer
  "baints-2-1": [], // 2nd Year, 1st Semester
  "baints-2-2": [], // 2nd Year, 2nd Semester
  "baints-2-3": [], // 2nd Year, Summer
  "baints-3-1": [], // 3rd Year, 1st Semester
  "baints-3-2": [], // 3rd Year, 2nd Semester
  "baints-3-3": [], // 3rd Year, Summer
  "baints-4-1": [], // 4th Year, 1st Semester
  "baints-4-2": [], // 4th Year, 2nd Semester
  "baints-4-3": [], // 4th Year, Summer

  // ─── BA Philosophy ────────────────────────────────────────────────────────
  "baphilo-1-1": [], // 1st Year, 1st Semester
  "baphilo-1-2": [], // 1st Year, 2nd Semester
  "baphilo-1-3": [], // 1st Year, Summer
  "baphilo-2-1": [], // 2nd Year, 1st Semester
  "baphilo-2-2": [], // 2nd Year, 2nd Semester
  "baphilo-2-3": [], // 2nd Year, Summer
  "baphilo-3-1": [], // 3rd Year, 1st Semester
  "baphilo-3-2": [], // 3rd Year, 2nd Semester
  "baphilo-3-3": [], // 3rd Year, Summer
  "baphilo-4-1": [], // 4th Year, 1st Semester
  "baphilo-4-2": [], // 4th Year, 2nd Semester
  "baphilo-4-3": [], // 4th Year, Summer

  // ─── BS Psychology ────────────────────────────────────────────────────────
  "bspsy-1-1": [], // 1st Year, 1st Semester
  "bspsy-1-2": [], // 1st Year, 2nd Semester
  "bspsy-1-3": [], // 1st Year, Summer
  "bspsy-2-1": [], // 2nd Year, 1st Semester
  "bspsy-2-2": [], // 2nd Year, 2nd Semester
  "bspsy-2-3": [], // 2nd Year, Summer
  "bspsy-3-1": [], // 3rd Year, 1st Semester
  "bspsy-3-2": [], // 3rd Year, 2nd Semester
  "bspsy-3-3": [], // 3rd Year, Summer
  "bspsy-4-1": [], // 4th Year, 1st Semester
  "bspsy-4-2": [], // 4th Year, 2nd Semester
  "bspsy-4-3": [], // 4th Year, Summer

  // ─── BS Accountancy ───────────────────────────────────────────────────────
  "bsac-1-1": [], // 1st Year, 1st Semester
  "bsac-1-2": [], // 1st Year, 2nd Semester
  "bsac-1-3": [], // 1st Year, Summer
  "bsac-2-1": [], // 2nd Year, 1st Semester
  "bsac-2-2": [], // 2nd Year, 2nd Semester
  "bsac-2-3": [], // 2nd Year, Summer
  "bsac-3-1": [], // 3rd Year, 1st Semester
  "bsac-3-2": [], // 3rd Year, 2nd Semester
  "bsac-3-3": [], // 3rd Year, Summer
  "bsac-4-1": [], // 4th Year, 1st Semester
  "bsac-4-2": [], // 4th Year, 2nd Semester
  "bsac-4-3": [], // 4th Year, Summer

  // ─── BS Management Accounting ─────────────────────────────────────────────
  "bsma-1-1": [], // 1st Year, 1st Semester
  "bsma-1-2": [], // 1st Year, 2nd Semester
  "bsma-1-3": [], // 1st Year, Summer
  "bsma-2-1": [], // 2nd Year, 1st Semester
  "bsma-2-2": [], // 2nd Year, 2nd Semester
  "bsma-2-3": [], // 2nd Year, Summer
  "bsma-3-1": [], // 3rd Year, 1st Semester
  "bsma-3-2": [], // 3rd Year, 2nd Semester
  "bsma-3-3": [], // 3rd Year, Summer
  "bsma-4-1": [], // 4th Year, 1st Semester
  "bsma-4-2": [], // 4th Year, 2nd Semester
  "bsma-4-3": [], // 4th Year, Summer

  // ─── BSBA - Financial Management ──────────────────────────────────────────
  "bsbafm-1-1": [], // 1st Year, 1st Semester
  "bsbafm-1-2": [], // 1st Year, 2nd Semester
  "bsbafm-1-3": [], // 1st Year, Summer
  "bsbafm-2-1": [], // 2nd Year, 1st Semester
  "bsbafm-2-2": [], // 2nd Year, 2nd Semester
  "bsbafm-2-3": [], // 2nd Year, Summer
  "bsbafm-3-1": [], // 3rd Year, 1st Semester
  "bsbafm-3-2": [], // 3rd Year, 2nd Semester
  "bsbafm-3-3": [], // 3rd Year, Summer
  "bsbafm-4-1": [], // 4th Year, 1st Semester
  "bsbafm-4-2": [], // 4th Year, 2nd Semester
  "bsbafm-4-3": [], // 4th Year, Summer

  // ─── BSBA - Marketing Management ──────────────────────────────────────────
  "bsbamm-1-1": [], // 1st Year, 1st Semester
  "bsbamm-1-2": [], // 1st Year, 2nd Semester
  "bsbamm-1-3": [], // 1st Year, Summer
  "bsbamm-2-1": [], // 2nd Year, 1st Semester
  "bsbamm-2-2": [], // 2nd Year, 2nd Semester
  "bsbamm-2-3": [], // 2nd Year, Summer
  "bsbamm-3-1": [], // 3rd Year, 1st Semester
  "bsbamm-3-2": [], // 3rd Year, 2nd Semester
  "bsbamm-3-3": [], // 3rd Year, Summer
  "bsbamm-4-1": [], // 4th Year, 1st Semester
  "bsbamm-4-2": [], // 4th Year, 2nd Semester
  "bsbamm-4-3": [], // 4th Year, Summer

  // ─── BSBA - Entrepreneurship ──────────────────────────────────────────────
  "bsbaentre-1-1": [], // 1st Year, 1st Semester
  "bsbaentre-1-2": [], // 1st Year, 2nd Semester
  "bsbaentre-1-3": [], // 1st Year, Summer
  "bsbaentre-2-1": [], // 2nd Year, 1st Semester
  "bsbaentre-2-2": [], // 2nd Year, 2nd Semester
  "bsbaentre-2-3": [], // 2nd Year, Summer
  "bsbaentre-3-1": [], // 3rd Year, 1st Semester
  "bsbaentre-3-2": [], // 3rd Year, 2nd Semester
  "bsbaentre-3-3": [], // 3rd Year, Summer
  "bsbaentre-4-1": [], // 4th Year, 1st Semester
  "bsbaentre-4-2": [], // 4th Year, 2nd Semester
  "bsbaentre-4-3": [], // 4th Year, Summer

  // ─── BS Office Administration ─────────────────────────────────────────────
  "bsoa-1-1": [], // 1st Year, 1st Semester
  "bsoa-1-2": [], // 1st Year, 2nd Semester
  "bsoa-1-3": [], // 1st Year, Summer
  "bsoa-2-1": [], // 2nd Year, 1st Semester
  "bsoa-2-2": [], // 2nd Year, 2nd Semester
  "bsoa-2-3": [], // 2nd Year, Summer
  "bsoa-3-1": [], // 3rd Year, 1st Semester
  "bsoa-3-2": [], // 3rd Year, 2nd Semester
  "bsoa-3-3": [], // 3rd Year, Summer
  "bsoa-4-1": [], // 4th Year, 1st Semester
  "bsoa-4-2": [], // 4th Year, 2nd Semester
  "bsoa-4-3": [], // 4th Year, Summer

  // ─── BS Legal Management ──────────────────────────────────────────────────
  "bslm-1-1": [], // 1st Year, 1st Semester
  "bslm-1-2": [], // 1st Year, 2nd Semester
  "bslm-1-3": [], // 1st Year, Summer
  "bslm-2-1": [], // 2nd Year, 1st Semester
  "bslm-2-2": [], // 2nd Year, 2nd Semester
  "bslm-2-3": [], // 2nd Year, Summer
  "bslm-3-1": [], // 3rd Year, 1st Semester
  "bslm-3-2": [], // 3rd Year, 2nd Semester
  "bslm-3-3": [], // 3rd Year, Summer
  "bslm-4-1": [], // 4th Year, 1st Semester
  "bslm-4-2": [], // 4th Year, 2nd Semester
  "bslm-4-3": [], // 4th Year, Summer
};

export const HONORS_SYSTEMS = [
  {
    id: "new",
    label: "New System (3.60 First Honors, 3.30 Second Honors)",
    curriculumId: "new",
  },
  {
    id: "old",
    label: "Old System (3.50 First Honors, 3.00 Second Honors)",
    curriculumId: "old",
  },
];

export const SUBJECTS_BY_CURRICULUM = {
  new: SUBJECTS_BY_COURSE_YEAR_NEW,
  old: SUBJECTS_BY_COURSE_YEAR_OLD,
};

function normalizeHonorsSystemId(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

export function getCurriculumIdForHonorsSystem(honorsSystemId) {
  const normalizedHonorsSystemId = normalizeHonorsSystemId(honorsSystemId);

  if (normalizedHonorsSystemId.includes("old")) {
    return "old";
  }

  return "new";
}

export function getSubjectsForCourseYear(
  courseId,
  yearId,
  semesterId,
  honorsSystemId = "new",
) {
  const key = `${courseId}-${yearId}-${semesterId}`;
  const curriculumId = getCurriculumIdForHonorsSystem(honorsSystemId);
  const subjectsByCourseYear =
    SUBJECTS_BY_CURRICULUM[curriculumId] || SUBJECTS_BY_CURRICULUM.new;
  const rawSubjects = subjectsByCourseYear[key] || [];

  return rawSubjects.map((subject, index) => ({
    ...subject,
    id: `${key}-${index}-${subject.code.replace(/\s+/g, "")}`,
    enabled: true,
    isCustom: false,
  }));
}

export function getAllSubjectsForCourse(courseId, honorsSystemId = "new") {
  const curriculumId = getCurriculumIdForHonorsSystem(honorsSystemId);
  const subjectsByCourseYear =
    SUBJECTS_BY_CURRICULUM[curriculumId] || SUBJECTS_BY_CURRICULUM.new;

  const courseEntries = Object.entries(subjectsByCourseYear).filter(([key]) =>
    key.startsWith(`${courseId}-`),
  );

  const allSubjects = courseEntries.flatMap(([, subjects]) => subjects);

  const uniqueSubjectsMap = new Map();

  allSubjects.forEach((subject, index) => {
    const uniqueKey = `${subject.code}-${subject.name}`;
    if (!uniqueSubjectsMap.has(uniqueKey)) {
      uniqueSubjectsMap.set(uniqueKey, {
        ...subject,
        id: `${courseId}-${index}-${subject.code.replace(/\s+/g, "")}`,
        enabled: true,
        isCustom: false,
      });
    }
  });

  return Array.from(uniqueSubjectsMap.values());
}
