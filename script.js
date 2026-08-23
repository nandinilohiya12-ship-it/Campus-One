const STORAGE_KEY = "campus-one-student-recipients-v1";
const NOTES_STORAGE_KEY = "campus-one-notes-marketplace-v1";
const UNLOCKS_STORAGE_KEY = "campus-one-note-unlocks-v1";
const EARNINGS_STORAGE_KEY = "campus-one-uploader-earnings-v1";
const CR_BOARD_STORAGE_KEY = "campus-one-cr-board-v1";
const AI_TOOL_ACCESS_STORAGE_KEY = "campus-one-ai-tool-access-v1";
const ROOMS_STORAGE_KEY = "campus-one-rooms-v1";
const ACCOUNTS_STORAGE_KEY = "campus-one-accounts-v1";
const ACTIVE_ACCOUNT_STORAGE_KEY = "campus-one-active-account-v1";
const CLAUDE_NOTES_ENDPOINT = "/api/claude-notes";
const CLAUDE_QUIZ_ENDPOINT = "/api/claude-quiz";
const CLAUDE_PLANNER_ENDPOINT = "/api/claude-planner";
const CLAUDE_CHAT_ENDPOINT = "/api/claude-chat";
const PRIORITY_COLOR_CLASS = { high: "prio-red", medium: "prio-amber", low: "prio-green" };
const TOPIC_PRIORITY_COLOR_CLASS = { "high weightage": "prio-red", "needs practice": "prio-amber", "revision": "prio-green" };
const RAZORPAY_ORDER_ENDPOINT = "/api/razorpay/create-order";
const RAZORPAY_VERIFY_ENDPOINT = "/api/razorpay/verify-payment";
const RAZORPAY_PLACEHOLDER_KEY = "rzp_test_replace_with_your_key";
const AI_FEATURE_PRICE = 20;
const MIN_NOTE_PRICE = 10;
const HARD_MAX_NOTE_PRICE = 199;
const NOTE_PRICE = AI_FEATURE_PRICE;
const UPLOADER_SHARE = Math.round(AI_FEATURE_PRICE * 0.7);
const PLATFORM_SHARE = AI_FEATURE_PRICE - UPLOADER_SHARE;
let sampleStudents = [];
let STUDENT_TOTAL = 0;
const appConfig = window.CAMPUS_ONE_CONFIG || {};
const RAZORPAY_KEY_ID = appConfig.razorpayKeyId || RAZORPAY_PLACEHOLDER_KEY;
const hasSupabaseConfig = Boolean(appConfig.supabaseUrl && appConfig.supabaseAnonKey && !appConfig.demoMode);
const supabaseClient = hasSupabaseConfig && window.supabase
    ? window.supabase.createClient(appConfig.supabaseUrl, appConfig.supabaseAnonKey)
    : null;

const LOCAL_PROFILES_KEY = "campus-one-custom-profiles-v1";

const categoryMeta = {
    Academic: { icon: "book-open", tone: "blue" },
    Placement: { icon: "briefcase-business", tone: "green" },
    Event: { icon: "party-popper", tone: "amber" },
    Club: { icon: "users", tone: "plum" },
    Admin: { icon: "shield-check", tone: "coral" }
};

const priorityWeight = {
    Urgent: 3,
    Important: 2,
    Normal: 1
};

const templates = [
    {
        label: "Class Shift",
        message: "Class schedule has changed. Check the updated classroom and timing shared by your CR.",
        category: "Academic",
        priority: "Important",
        recipients: ["All"]
    },
    {
        label: "Placement",
        message: "Shortlisted students must report to the placement desk with updated resumes and ID cards.",
        category: "Placement",
        priority: "Urgent",
        recipients: ["All"]
    },
    {
        label: "Event",
        message: "Club registrations are open. Selected volunteers will receive duty slots from the CR team.",
        category: "Event",
        priority: "Normal",
        recipients: ["All"]
    }
];

const collegeDirectory = [
    "Poornima College of Engineering",
    "Poornima Institute of Engineering and Technology",
    "Poornima University",
    "Delhi Technological University",
    "NorthCap University",
    "Amity University",
    "Bennett University",
    "Manipal University Jaipur",
    "LNM Institute of Information Technology",
    "Malaviya National Institute of Technology",
    "JECRC University",
    "Jaipur Engineering College",
    "IIT Delhi",
    "IIT Bombay",
    "IIT Jaipur",
    "VIT University",
    "SRM University",
    "Chandigarh University",
    "Lovely Professional University",
    "BITS Pilani",
    "University of Rajasthan",
    "Rajasthan Technical University",
    "Rajasthan University of Health Sciences",
    "Rajasthan University of Veterinary and Animal Sciences",
    "Rajasthan University of Technology",
    "Maharaja Ganga Singh University",
    "Maharshi Dayanand Saraswati University",
    "Jai Narain Vyas University",
    "Mohanlal Sukhadia University",
    "Vardhman Mahaveer Open University",
    "Haridev Joshi University of Journalism and Mass Communication",
    "Dr Bhimrao Ambedkar Law University",
    "Rajasthan ILD Skills University",
    "Govind Guru Tribal University",
    "Indian Institute of Management Udaipur",
    "Indian Institute of Technology Jodhpur",
    "Indian Institute of Information Technology Kota",
    "All India Institute of Medical Sciences Jodhpur",
    "National Institute of Fashion Technology Jodhpur",
    "National Law University Jodhpur",
    "Banasthali Vidyapith",
    "Mody University",
    "JK Lakshmipat University",
    "Jaipur National University",
    "Apex University Jaipur",
    "Vivekananda Global University",
    "NIMS University",
    "Suresh Gyan Vihar University",
    "Raffles University",
    "Maharishi Arvind University",
    "Maharaj Vinayak Global University",
    "Geetanjali University",
    "Pacific University Udaipur",
    "Sir Padampat Singhania University",
    "Singhania University",
    "Tantia University",
    "Bhagwant University",
    "Career Point University Kota",
    "Jayoti Vidyapeeth Women's University",
    "OPJS University",
    "Sunrise University",
    "Maharana Pratap University of Agriculture and Technology",
    "College of Technology and Engineering Udaipur",
    "Government Engineering College Ajmer",
    "Government Engineering College Bikaner",
    "Government Engineering College Bharatpur",
    "Government Engineering College Jhalawar",
    "Government Women Engineering College Ajmer",
    "Arya College of Engineering and IT",
    "Global Institute of Technology Jaipur",
    "Rajasthan College of Engineering for Women",
    "Swami Keshvanand Institute of Technology",
    "Yagyavalkya Institute of Technology",
    "St Wilfred's Institute of Engineering and Technology",
    "Rajasthan Institute of Engineering and Technology",
    "Modern Institute of Technology and Research Centre",
    "Alwar Institute of Engineering and Technology",
    "Delhi University",
    "University of Delhi",
    "Jawaharlal Nehru University",
    "Jamia Millia Islamia",
    "Indira Gandhi National Open University",
    "Guru Gobind Singh Indraprastha University",
    "Netaji Subhas University of Technology",
    "Indraprastha Institute of Information Technology Delhi",
    "National Law University Delhi",
    "All India Institute of Medical Sciences Delhi",
    "Indian Statistical Institute Delhi",
    "National Institute of Fashion Technology Delhi",
    "School of Planning and Architecture Delhi",
    "Indian Agricultural Research Institute",
    "Ambedkar University Delhi",
    "Indira Gandhi Delhi Technical University for Women",
    "Delhi Pharmaceutical Sciences and Research University",
    "TERI School of Advanced Studies",
    "Jamia Hamdard",
    "Shiv Nadar Institution of Eminence",
    "Ashoka University",
    "O P Jindal Global University",
    "Maharshi Dayanand University",
    "Kurukshetra University",
    "Guru Jambheshwar University of Science and Technology",
    "Chaudhary Devi Lal University",
    "Chaudhary Charan Singh Haryana Agricultural University",
    "Bhagat Phool Singh Mahila Vishwavidyalaya",
    "Deenbandhu Chhotu Ram University of Science and Technology",
    "YMCA University of Science and Technology",
    "JC Bose University of Science and Technology",
    "Central University of Haryana",
    "National Institute of Technology Kurukshetra",
    "Indian Institute of Management Rohtak",
    "National Brain Research Centre",
    "National Institute of Food Technology Entrepreneurship and Management",
    "Pandit Bhagwat Dayal Sharma University of Health Sciences",
    "State University of Performing and Visual Arts",
    "World University of Design",
    "KR Mangalam University",
    "GD Goenka University",
    "SGT University",
    "Manav Rachna International Institute of Research and Studies",
    "The NorthCap University",
    "BML Munjal University",
    "NIILM University",
    "Rishihood University",
    "IIT Madras",
    "IIT Kanpur",
    "IIT Kharagpur",
    "IIT Roorkee",
    "IIT Guwahati",
    "IIT Hyderabad",
    "IISc Bangalore",
    "NIT Trichy",
    "NIT Surathkal",
    "NIT Warangal",
    "IIIT Hyderabad",
    "IIIT Bangalore",
    "Anna University",
    "Savitribai Phule Pune University",
    "Mumbai University",
    "Jadavpur University",
    "Banaras Hindu University",
    "Aligarh Muslim University",
    "Christ University",
    "Symbiosis International University",
    "University of Hyderabad",
    "Harvard University",
    "Stanford University",
    "Massachusetts Institute of Technology",
    "University of Oxford",
    "University of Cambridge",
    "Imperial College London",
    "University College London",
    "National University of Singapore",
    "Nanyang Technological University",
    "University of Toronto",
    "University of British Columbia",
    "University of Melbourne",
    "University of Sydney",
    "ETH Zurich",
    "Technical University of Munich"
];

const seedAnnouncements = [];
const seedNotes = [];
const seedCrPosts = [];

const state = {
    announcements: loadAnnouncements(),
    notes: loadNotes(),
    unlockedNotes: loadUnlockedNotes(),
    aiToolAccess: loadAiToolAccess(),
    earnings: loadEarnings(),
    crPosts: loadCrPosts(),
    role: "student",
    isLoggedIn: false,
    authMode: "login",
    account: loadActiveAccount(),
    accounts: loadAccounts(),
    activeStudent: "",
    activeProfile: null,
    profiles: loadLocalProfiles(),
    rooms: loadRooms(),
    activeRoomCode: "",
    loginStep: loadActiveAccount() ? "room" : "auth",
    inviteRoomMode: false,
    feedFilter: "all",
    categoryFilter: "All",
    search: "",
    sortMode: "newest",
    notesSearch: ""
};

const elements = {
    body: document.body,
    loginGate: document.getElementById("loginGate"),
    authLoginTab: document.getElementById("authLoginTab"),
    authSignupTab: document.getElementById("authSignupTab"),
    authSubmitBtn: document.getElementById("authSubmitBtn"),
    backToAuthBtn: document.getElementById("backToAuthBtn"),
    loginEmail: document.getElementById("loginEmail"),
    loginPassword: document.getElementById("loginPassword"),
    rememberMe: document.getElementById("rememberMe"),
    roomLoginFields: document.getElementById("roomLoginFields"),
    activeAccountChip: document.getElementById("activeAccountChip"),
    loginName: document.getElementById("loginName"),
    loginCollege: document.getElementById("loginCollege"),
    loginBatch: document.getElementById("loginBatch"),
    loginRoomCode: document.getElementById("loginRoomCode"),
    loginCrPin: document.getElementById("loginCrPin"),
    loginStudent: document.getElementById("loginStudent"),
    loginCrBtn: document.getElementById("loginCrBtn"),
    loginStudentBtn: document.getElementById("loginStudentBtn"),
    roleToggle: document.getElementById("roleToggle"),
    roleLabel: document.getElementById("roleLabel"),
    notifyBtn: document.getElementById("notifyBtn"),
    notificationBubble: document.getElementById("notificationBubble"),
    studentSection: document.getElementById("studentSection"),
    greetingTitle: document.getElementById("greetingTitle"),
    greetingSub: document.getElementById("greetingSub"),
    activeStudents: document.getElementById("activeStudents"),
    pulseStudents: document.getElementById("pulseStudents"),
    pulseNotes: document.getElementById("pulseNotes"),
    pulseCrPosts: document.getElementById("pulseCrPosts"),
    readRateHero: document.getElementById("readRateHero"),
    announcementCount: document.getElementById("announcementCount"),
    unreadCount: document.getElementById("unreadCount"),
    urgentCount: document.getElementById("urgentCount"),
    responseCount: document.getElementById("responseCount"),
    urgentList: document.getElementById("urgentList"),
    form: document.getElementById("announcementForm"),
    templateChips: document.getElementById("templateChips"),
    studentManageForm: document.getElementById("studentManageForm"),
    roomCodeLabel: document.getElementById("roomCodeLabel"),
    copyRoomBtn: document.getElementById("copyRoomBtn"),
    freezeCrAccess: document.getElementById("freezeCrAccess"),
    addCoCrBtn: document.getElementById("addCoCrBtn"),
    managedStudentName: document.getElementById("managedStudentName"),
    managedStudentCollege: document.getElementById("managedStudentCollege"),
    managedStudentBatch: document.getElementById("managedStudentBatch"),
    studentsList: document.getElementById("studentsList"),
    notesUploadForm: document.getElementById("notesUploadForm"),
    noteTitle: document.getElementById("noteTitle"),
    noteSubject: document.getElementById("noteSubject"),
    noteCollege: document.getElementById("noteCollege"),
    noteFile: document.getElementById("noteFile"),
    notePrice: document.getElementById("notePrice"),
    notePriceHint: document.getElementById("notePriceHint"),
    noteAiStatus: document.getElementById("noteAiStatus"),
    aiToolPayBtn: document.getElementById("aiToolPayBtn"),
    aiToolForm: document.getElementById("aiToolForm"),
    aiToolTitle: document.getElementById("aiToolTitle"),
    aiToolSubject: document.getElementById("aiToolSubject"),
    aiToolFile: document.getElementById("aiToolFile"),
    aiToolText: document.getElementById("aiToolText"),
    aiToolStatus: document.getElementById("aiToolStatus"),
    aiToolResult: document.getElementById("aiToolResult"),
    aiHistoryBar: document.getElementById("aiHistoryBar"),
    helpChatLauncher: document.getElementById("helpChatLauncher"),
    helpChatPanel: document.getElementById("helpChatPanel"),
    helpChatClose: document.getElementById("helpChatClose"),
    helpChatMessages: document.getElementById("helpChatMessages"),
    helpChatForm: document.getElementById("helpChatForm"),
    helpChatInput: document.getElementById("helpChatInput"),
    notesSearch: document.getElementById("notesSearch"),
    notesList: document.getElementById("notesList"),
    totalEarnings: document.getElementById("totalEarnings"),
    earningsList: document.getElementById("earningsList"),
    crPostForm: document.getElementById("crPostForm"),
    crPostTitle: document.getElementById("crPostTitle"),
    crPostCollege: document.getElementById("crPostCollege"),
    crPostBatch: document.getElementById("crPostBatch"),
    crPostFile: document.getElementById("crPostFile"),
    crPostBody: document.getElementById("crPostBody"),
    crPostPinned: document.getElementById("crPostPinned"),
    crBoardList: document.getElementById("crBoardList"),
    studentCollegeLabel: document.getElementById("studentCollegeLabel"),
    message: document.getElementById("message"),
    mention: document.getElementById("mention"),
    recipientChips: document.getElementById("recipientChips"),
    category: document.getElementById("category"),
    priority: document.getElementById("priority"),
    dueDate: document.getElementById("dueDate"),
    pin: document.getElementById("pinAnnouncement"),
    requireResponse: document.getElementById("requireResponse"),
    attachmentInput: document.getElementById("attachmentInput"),
    attachmentName: document.getElementById("attachmentName"),
    charCount: document.getElementById("charCount"),
    toneHint: document.getElementById("toneHint"),
    previewCard: document.getElementById("previewCard"),
    previewCategory: document.getElementById("previewCategory"),
    previewPriority: document.getElementById("previewPriority"),
    previewAudience: document.getElementById("previewAudience"),
    previewMessage: document.getElementById("previewMessage"),
    feedSearch: document.getElementById("feedSearch"),
    filterCategory: document.getElementById("filterCategory"),
    sortMode: document.getElementById("sortMode"),
    feedFilters: document.getElementById("feedFilters"),
    announcementList: document.getElementById("announcementList"),
    emptyState: document.getElementById("emptyState"),
    plannerList: document.getElementById("plannerList"),
    clearBtn: document.getElementById("clearBtn"),
    quickCompose: document.getElementById("quickCompose"),
    scrollTopBtn: document.getElementById("scrollTopBtn"),
    readRateMetric: document.getElementById("readRateMetric"),
    engagementMetric: document.getElementById("engagementMetric"),
    riskMetric: document.getElementById("riskMetric"),
    readRateBar: document.getElementById("readRateBar"),
    engagementBar: document.getElementById("engagementBar"),
    riskBar: document.getElementById("riskBar"),
    profileNavBtn: document.getElementById("profileNavBtn"),
    profileNavAvatar: document.getElementById("profileNavAvatar"),
    profileSection: document.getElementById("profile"),
    profileCloseBtn: document.getElementById("profileCloseBtn"),
    profileBackdrop: document.getElementById("profileBackdrop"),
    profileAvatar: document.getElementById("profileAvatar"),
    profilePlan: document.getElementById("profilePlan"),
    profileName: document.getElementById("profileName"),
    profileMeta: document.getElementById("profileMeta"),
    profileRoom: document.getElementById("profileRoom"),
    profileRole: document.getElementById("profileRole"),
    profileUploaded: document.getElementById("profileUploaded"),
    profilePurchased: document.getElementById("profilePurchased"),
    profileAiStatus: document.getElementById("profileAiStatus"),
    profileAiDetail: document.getElementById("profileAiDetail"),
    profileProgress: document.getElementById("profileProgress"),
    profileProgressDetail: document.getElementById("profileProgressDetail"),
    profileUploadedList: document.getElementById("profileUploadedList"),
    profilePurchasedList: document.getElementById("profilePurchasedList"),
    profileLoginInfo: document.getElementById("profileLoginInfo"),
    logoutBtn: document.getElementById("logoutBtn"),
    toast: document.getElementById("toast")
};

boot();

async function boot() {
    elements.body.dataset.role = state.role;
    elements.body.classList.add("login-active");
    bindEvents();
    renderAuthGate();
    hydrateRoomFromUrl();
    await restoreSupabaseSession();
    await loadProfilesFromBackend();
    await syncBackendData();
    renderProfileSelectors();
    renderAuthGate();
    renderTemplates();
    renderRecipientChips();
    setupCollegeAutocomplete();
    elements.noteCollege.value = getActiveCollege();
    elements.crPostCollege.value = getActiveCollege();
    elements.crPostBatch.value = getActiveBatch();
    updatePriceHint();
    setMinimumDueDate();
    updatePreview();
    render();
    setupScrollSpy();
    renderAiHistoryBar();
    refreshIcons();
}

async function restoreSupabaseSession() {
    if (!supabaseClient) {
        const local = loadActiveAccount();
        if (local?.email) {
            state.account = local;
            state.loginStep = "room";
        }
        return;
    }

    const { data } = await supabaseClient.auth.getSession();
    const session = data?.session;

    if (session?.user) {
        const fullName = session.user.user_metadata?.full_name || session.user.email;
        state.account = { id: session.user.id, name: fullName, email: session.user.email };
        state.loginStep = "room";
    }

    supabaseClient.auth.onAuthStateChange((_event, newSession) => {
        if (!newSession?.user) {
            return;
        }
        const fullName = newSession.user.user_metadata?.full_name || newSession.user.email;
        state.account = { id: newSession.user.id, name: fullName, email: newSession.user.email };
    });
}

async function loadProfilesFromBackend() {
    if (!supabaseClient) {
        return;
    }

    const { data, error } = await supabaseClient
        .from("profiles")
        .select("id, full_name, role, college, batch, room_code")
        .order("full_name");

    if (!error && Array.isArray(data) && data.length) {
        state.profiles = data;
        state.activeRoomCode = getProfileRoomCode(data[0]);
        elements.loginRoomCode.value = state.activeRoomCode;
        state.activeStudent = data[0].full_name;
        state.activeProfile = data[0];
    }
}

async function syncBackendData() {
    if (!supabaseClient) {
        return;
    }

    await Promise.all([syncNotesFromBackend(), syncCrPostsFromBackend()]);
}

async function syncNotesFromBackend() {
    const { data, error } = await supabaseClient
        .from("notes")
        .select("id, title, subject, college, room_code, price, max_price, rating, file_name, file_path, ai_summary_points, ai_study_plan, ai_key_dates, ai_topics, created_at, uploader:profiles!notes_uploader_id_fkey(full_name)")
        .order("created_at", { ascending: false });

    if (error || !Array.isArray(data)) {
        return;
    }

    state.notes = data.map((note) => normalizeNote({
        id: note.id,
        title: note.title,
        subject: note.subject,
        college: note.college,
        roomCode: note.room_code,
        uploader: note.uploader?.full_name || "Student",
        price: note.price,
        maxPrice: note.max_price,
        rating: note.rating,
        fileName: note.file_name,
        fileDataUrl: "",
        createdAt: new Date(note.created_at).getTime(),
        ai: {
            summary_points: note.ai_summary_points,
            study_plan: note.ai_study_plan,
            key_dates: note.ai_key_dates,
            topics: note.ai_topics
        }
    }));
}

async function syncCrPostsFromBackend() {
    const { data, error } = await supabaseClient
        .from("cr_posts")
        .select("id, title, body, college, batch, room_code, file_name, file_path, pinned, created_at, author:profiles!cr_posts_author_id_fkey(full_name)")
        .order("created_at", { ascending: false });

    if (error || !Array.isArray(data)) {
        return;
    }

    state.crPosts = data.map((post) => normalizeCrPost({
        id: post.id,
        title: post.title,
        body: post.body,
        college: post.college,
        batch: post.batch,
        fileName: post.file_name,
        fileDataUrl: "",
        pinned: post.pinned,
        author: post.author?.full_name || "Class Representative",
        createdAt: new Date(post.created_at).getTime(),
        roomCode: post.room_code
    }));
}

function renderProfileSelectors() {
    syncStudentNamesFromProfiles();
    const activeRoom = getActiveRoomCode();
    const selectableProfiles = state.profiles.filter((profile) => !activeRoom || getProfileRoomCode(profile) === activeRoom);
    const options = selectableProfiles.map((profile) => {
        const option = document.createElement("option");
        option.value = profile.full_name;
        option.textContent = `${profile.full_name} (${profile.role.toUpperCase()})`;
        return option;
    });

    elements.loginStudent.replaceChildren(...options.map((option) => option.cloneNode(true)));
    elements.studentSection.textContent = state.activeStudent || state.account?.name || "Campus One User";

    if (selectableProfiles.length && !state.inviteRoomMode && state.isLoggedIn) {
        const profileStillInRoom = selectableProfiles.some((profile) =>
            normalizePersonName(profile.full_name) === normalizePersonName(state.activeStudent)
        );
        state.activeStudent = profileStillInRoom ? state.activeStudent : selectableProfiles[0].full_name;
        elements.loginStudent.value = state.activeStudent;
        elements.studentSection.textContent = state.activeStudent;
        setActiveProfileByName(state.activeStudent);
    } else {
        const placeholder = document.createElement("option");
        placeholder.value = "";
        placeholder.textContent = state.inviteRoomMode ? "Join this room as a new user" : "Select saved profile";
        elements.loginStudent.prepend(placeholder.cloneNode(true));
        elements.loginStudent.value = "";
        elements.studentSection.textContent = state.account?.name || "";
        if (!state.isLoggedIn) {
            state.activeStudent = "";
            state.activeProfile = null;
        }
    }

    renderMentionOptions();
    renderRecipientChips();
    renderStudentsList();
}

function renderMentionOptions() {
    const selected = getSelectedRecipients();
    const options = ["All", ...sampleStudents].map((name) => {
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name === "All" ? "All Students" : name;
        option.selected = selected.includes(name);
        return option;
    });
    elements.mention.replaceChildren(...options);
}

function syncStudentNamesFromProfiles() {
    const activeRoom = getActiveRoomCode();
    sampleStudents = state.profiles
        .filter((profile) => profile.role === "student" && (!activeRoom || getProfileRoomCode(profile) === activeRoom))
        .map((profile) => profile.full_name);
    STUDENT_TOTAL = sampleStudents.length;
}

function setupCollegeAutocomplete() {
    const fields = [
        elements.loginCollege,
        elements.managedStudentCollege,
        elements.noteCollege,
        elements.crPostCollege
    ].filter(Boolean);

    fields.forEach((field) => {
        const parent = field.parentElement;
        if (!parent || parent.classList.contains("college-autocomplete-field")) {
            return;
        }

        parent.classList.add("college-autocomplete-field");
        field.setAttribute("autocomplete", "off");

        const dropdown = document.createElement("div");
        dropdown.className = "college-autocomplete-list";
        dropdown.setAttribute("role", "listbox");
        parent.appendChild(dropdown);

        field.addEventListener("input", () => renderCollegeSuggestions(field, dropdown));
        field.addEventListener("focus", () => renderCollegeSuggestions(field, dropdown));
    });

    document.addEventListener("click", (event) => {
        if (!event.target.closest(".college-autocomplete-field")) {
            closeCollegeSuggestions();
        }
    });
}

function renderCollegeSuggestions(field, dropdown) {
    const query = field.value.trim().toLowerCase();
    dropdown.replaceChildren();

    if (!query) {
        dropdown.classList.remove("visible");
        return;
    }

    const matches = collegeDirectory
        .filter((college) => college.toLowerCase().includes(query))
        .slice(0, 10);

    if (!matches.length) {
        const empty = document.createElement("div");
        empty.className = "college-autocomplete-empty";
        empty.textContent = "No matching college found";
        dropdown.appendChild(empty);
        dropdown.classList.add("visible");
        return;
    }

    matches.forEach((college) => {
        const option = document.createElement("button");
        option.type = "button";
        option.className = "college-autocomplete-option";
        option.setAttribute("role", "option");
        option.textContent = college;
        option.addEventListener("click", () => {
            field.value = college;
            field.dispatchEvent(new Event("input", { bubbles: true }));
            closeCollegeSuggestions();
        });
        dropdown.appendChild(option);
    });

    dropdown.classList.add("visible");
}

function closeCollegeSuggestions() {
    document.querySelectorAll(".college-autocomplete-list.visible").forEach((dropdown) => {
        dropdown.classList.remove("visible");
    });
}

function bindEvents() {
    if (state.eventsBound) {
        return;
    }

    state.eventsBound = true;
    document.addEventListener("click", handleGlobalActionClick);
    [elements.loginEmail, elements.loginPassword, elements.loginName].forEach((field) => {
        field.addEventListener("keydown", (event) => {
            if (event.key === "Enter" && !state.account) {
                event.preventDefault();
                submitAuth();
            }
        });
    });
    elements.loginRoomCode.addEventListener("input", () => {
        state.activeRoomCode = normalizeRoomCode(elements.loginRoomCode.value);
        renderProfileSelectors();
    });
    elements.loginStudent.addEventListener("change", (event) => {
        setActiveProfileByName(event.target.value);
        elements.studentSection.textContent = state.activeStudent;
        elements.noteCollege.value = getActiveCollege();
        elements.crPostCollege.value = getActiveCollege();
        elements.crPostBatch.value = getActiveBatch();
        render();
    });

    document.querySelectorAll("[data-scroll-target]").forEach((button) => {
        button.addEventListener("click", () => scrollToSection(button.dataset.scrollTarget));
    });

    elements.roleToggle.addEventListener("click", openLoginGate);
    elements.notifyBtn.addEventListener("click", () => {
        state.feedFilter = "unread";
        scrollToSection("feed");
        render();
    });
    if (elements.helpChatLauncher) {
        elements.helpChatLauncher.addEventListener("click", toggleHelpChat);
    }
    if (elements.helpChatClose) {
        elements.helpChatClose.addEventListener("click", () => setHelpChatOpen(false));
    }
    if (elements.helpChatForm) {
        elements.helpChatForm.addEventListener("submit", submitHelpChatMessage);
    }
    renderHelpChatHistory();
    elements.notesUploadForm.addEventListener("submit", uploadMarketplaceNote);
    elements.studentManageForm.addEventListener("submit", addManagedStudent);
    elements.addCoCrBtn.addEventListener("click", () => addManagedMember("cr"));
    elements.copyRoomBtn.addEventListener("click", copyRoomInvite);
    elements.freezeCrAccess.addEventListener("change", toggleCrFreeze);
    elements.aiToolPayBtn.addEventListener("click", startAiToolPayment);
    elements.aiToolForm.addEventListener("submit", summarizePersonalNotes);
    elements.noteFile.addEventListener("change", updatePriceHint);
    elements.notePrice.addEventListener("input", enforceSellerPriceLimit);
    elements.notesSearch.addEventListener("input", (event) => {
        state.notesSearch = event.target.value.trim().toLowerCase();
        renderNotesMarketplace();
    });
    elements.crPostForm.addEventListener("submit", createCrBoardPost);

    elements.form.addEventListener("submit", createAnnouncement);
    [elements.message, elements.mention, elements.category, elements.priority, elements.dueDate, elements.pin].forEach((field) => {
        field.addEventListener("input", updatePreview);
        field.addEventListener("change", updatePreview);
    });
    elements.mention.addEventListener("change", () => {
        normalizeRecipientSelection();
        updatePreview();
    });
    elements.attachmentInput.addEventListener("change", updateAttachmentName);

    elements.feedSearch.addEventListener("input", (event) => {
        state.search = event.target.value.trim().toLowerCase();
        renderFeed();
    });
    elements.filterCategory.addEventListener("change", (event) => {
        state.categoryFilter = event.target.value;
        renderFeed();
    });
    elements.sortMode.addEventListener("change", (event) => {
        state.sortMode = event.target.value;
        renderFeed();
    });
    elements.feedFilters.addEventListener("click", (event) => {
        const filterButton = event.target.closest("[data-filter]");
        if (!filterButton) {
            return;
        }
        state.feedFilter = filterButton.dataset.filter;
        renderFeed();
    });

    elements.clearBtn.addEventListener("click", clearFeed);
    elements.quickCompose.addEventListener("click", () => scrollToSection("compose"));
    elements.profileNavBtn.addEventListener("click", openProfileDrawer);
    elements.profileCloseBtn.addEventListener("click", closeProfileDrawer);
    elements.profileBackdrop.addEventListener("click", closeProfileDrawer);
    elements.logoutBtn.addEventListener("click", logoutUser);
    document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
            closeProfileDrawer();
        }
    });
    elements.scrollTopBtn.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));
    window.addEventListener("scroll", updateScrollTopButton, { passive: true });
}

function handleGlobalActionClick(event) {
    const target = event.target.closest("button");

    if (!target) {
        return;
    }

    if (target.id === "authLoginTab") {
        event.preventDefault();
        setAuthMode("login");
        return;
    }

    if (target.id === "authSignupTab") {
        event.preventDefault();
        setAuthMode("signup");
        return;
    }

    if (target.id === "authSubmitBtn") {
        event.preventDefault();
        submitAuth();
        return;
    }

    if (target.id === "backToAuthBtn") {
        event.preventDefault();
        showAuthSlide();
        return;
    }

    if (target.id === "loginCrBtn") {
        event.preventDefault();
        completeLogin("cr");
        return;
    }

    if (target.id === "loginStudentBtn") {
        event.preventDefault();
        completeLogin("student");
    }
}

function loadAnnouncements() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (!saved) {
            return [];
        }

        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed.map(normalizeAnnouncement) : [];
    } catch {
        return [];
    }
}

function normalizeAnnouncement(item) {
    const recipients = resolveRecipients(item);
    const readBy = normalizeReadBy(item);

    return {
        id: item.id || createId(),
        message: item.message || "",
        recipients,
        category: item.category || "Academic",
        priority: item.priority || "Normal",
        pinned: Boolean(item.pinned),
        requiresResponse: item.requiresResponse !== false,
        createdAt: Number(item.createdAt) || Date.now(),
        dueAt: item.dueAt ? Number(item.dueAt) : null,
        readCount: readBy.length,
        responses: {
            attending: Number(item.responses?.attending) || 0,
            maybe: Number(item.responses?.maybe) || 0,
            declined: Number(item.responses?.declined) || 0
        },
        selectedResponses: item.selectedResponses || {},
        selectedResponse: item.selectedResponse || "",
        readBy,
        attachments: Array.isArray(item.attachments) ? item.attachments : [],
        author: item.author || "Class Representative",
        roomCode: normalizeRoomCode(item.roomCode || item.room_code || "")
    };
}

function resolveRecipients(item) {
    const raw = Array.isArray(item.recipients) ? item.recipients : [item.audience || "All"];
    const mapped = raw.flatMap((value) => {
        if (value === "All" || value === "All Students") {
            return ["All"];
        }

        if (sampleStudents.includes(value)) {
            return [value];
        }

        return [];
    });

    const unique = [...new Set(mapped)];
    return unique.length ? unique : ["All"];
}

function normalizeReadBy(item) {
    if (Array.isArray(item.readBy)) {
        return item.readBy.filter((name) => sampleStudents.includes(name));
    }

    if (item.readByMe) {
        return state.activeStudent ? [state.activeStudent] : [];
    }

    const count = Math.min(Number(item.readCount) || 0, sampleStudents.length);
    return sampleStudents.slice(0, count);
}

function saveAnnouncements() {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state.announcements));
    } catch {
        showToast("Updates are saved for this session.");
    }
}

function loadNotes() {
    return loadJsonList(NOTES_STORAGE_KEY, []).map(normalizeNote);
}

function saveNotes() {
    saveJson(NOTES_STORAGE_KEY, state.notes);
}

function loadUnlockedNotes() {
    return loadJsonObject(UNLOCKS_STORAGE_KEY, {});
}

function saveUnlockedNotes() {
    saveJson(UNLOCKS_STORAGE_KEY, state.unlockedNotes);
}

function loadAiToolAccess() {
    return loadJsonObject(AI_TOOL_ACCESS_STORAGE_KEY, {});
}

function saveAiToolAccess() {
    saveJson(AI_TOOL_ACCESS_STORAGE_KEY, state.aiToolAccess);
}

function loadEarnings() {
    return loadJsonList(EARNINGS_STORAGE_KEY, []);
}

function saveEarnings() {
    saveJson(EARNINGS_STORAGE_KEY, state.earnings);
}

function loadCrPosts() {
    return loadJsonList(CR_BOARD_STORAGE_KEY, []).map(normalizeCrPost);
}

function saveCrPosts() {
    saveJson(CR_BOARD_STORAGE_KEY, state.crPosts);
}

function loadJsonList(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        if (!saved) {
            return fallback;
        }

        const parsed = JSON.parse(saved);
        return Array.isArray(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
}

function loadJsonObject(key, fallback) {
    try {
        const saved = localStorage.getItem(key);
        if (!saved) {
            return fallback;
        }

        const parsed = JSON.parse(saved);
        return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : fallback;
    } catch {
        return fallback;
    }
}

function loadLocalProfiles() {
    return loadJsonList(LOCAL_PROFILES_KEY, []);
}

function saveLocalProfiles() {
    saveJson(LOCAL_PROFILES_KEY, state.profiles);
}

function loadRooms() {
    return loadJsonObject(ROOMS_STORAGE_KEY, {});
}

function saveRooms() {
    saveJson(ROOMS_STORAGE_KEY, state.rooms);
}

function saveJson(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch {
        showToast("Storage is full on this browser.");
    }
}

function normalizeNote(note) {
    const maxPrice = Number(note.maxPrice) || HARD_MAX_NOTE_PRICE;
    const price = clampPrice(Number(note.price) || MIN_NOTE_PRICE, maxPrice);

    return {
        id: note.id || createId(),
        title: note.title || "Untitled Notes",
        subject: note.subject || "General",
        college: note.college || "Your College",
        uploader: note.uploader || state.activeStudent || "Student",
        rating: Number(note.rating) || 4.5,
        price,
        maxPrice,
        roomCode: normalizeRoomCode(note.roomCode || note.room_code || ""),
        fileName: note.fileName || "notes.pdf",
        fileDataUrl: note.fileDataUrl || "",
        createdAt: Number(note.createdAt) || Date.now(),
        ai: normalizeNoteAI(note.ai, note.title || "Untitled Notes", note.subject || "General", note.fileName || "notes.pdf")
    };
}

function normalizeCrPost(post) {
    return {
        id: post.id || createId(),
        title: post.title || "CR update",
        body: post.body || "",
        college: post.college || "Your College",
        batch: post.batch || "",
        fileName: post.fileName || "",
        fileDataUrl: post.fileDataUrl || "",
        pinned: Boolean(post.pinned),
        author: post.author || "Class Representative",
        createdAt: Number(post.createdAt) || Date.now(),
        roomCode: normalizeRoomCode(post.roomCode || post.room_code || "")
    };
}

function normalizeNoteAI(ai, title, subject, fileName) {
    const fallback = createDemoNoteAI({ title, subject, fileName });

    const summary_points = Array.isArray(ai?.summary_points) && ai.summary_points.length
        ? Array.from({ length: 8 }, (_, index) => {
            const item = ai.summary_points[index];
            return {
                point: (item && item.point) ? String(item.point) : fallback.summary_points[index % fallback.summary_points.length].point,
                importance: ["high", "medium", "low"].includes(item?.importance) ? item.importance : fallback.summary_points[index % fallback.summary_points.length].importance
            };
        })
        : fallback.summary_points;

    const study_plan = Array.isArray(ai?.study_plan) && ai.study_plan.length
        ? ai.study_plan.map((item, index) => ({
            day: Number.isFinite(item?.day) ? item.day : index + 1,
            focus: item?.focus ? String(item.focus) : fallback.study_plan[index % fallback.study_plan.length].focus,
            tasks: Array.isArray(item?.tasks) && item.tasks.length ? item.tasks.map(String) : fallback.study_plan[index % fallback.study_plan.length].tasks,
            est_minutes: Number.isFinite(item?.est_minutes) ? item.est_minutes : 45
        }))
        : fallback.study_plan;

    const key_dates = Array.isArray(ai?.key_dates) && ai.key_dates.length
        ? ai.key_dates.map((item) => ({ date: String(item?.date || ""), description: String(item?.description || "") }))
        : fallback.key_dates;

    const topics = Array.isArray(ai?.topics) && ai.topics.length
        ? ai.topics.map((item, index) => ({
            name: item?.name ? String(item.name) : fallback.topics[index % fallback.topics.length].name,
            priority: ["high weightage", "revision", "needs practice"].includes(item?.priority) ? item.priority : fallback.topics[index % fallback.topics.length].priority
        }))
        : fallback.topics;

    return { summary_points, study_plan, key_dates, topics };
}

function render() {
    elements.body.dataset.role = state.role;
    updateRoleCopy();
    renderStats();
    renderStudentsList();
    renderRoomControls();
    renderPriorityBoard();
    renderPlanner();
    renderFeed();
    renderInsights();
    renderAiTool();
    renderNotesMarketplace();
    renderEarnings();
    renderCrBoard();
    renderProfile();
    refreshIcons();
}

function loadAccounts() {
    const saved = loadJsonList(ACCOUNTS_STORAGE_KEY, []);
    return saved.map((account) => ({
        id: account.id || `account-${createId()}`,
        name: account.name || "",
        email: normalizeEmail(account.email),
        password: account.password || "",
        createdAt: account.createdAt || Date.now()
    })).filter((account) => account.email);
}

function loadActiveAccount() {
    try {
        const saved = JSON.parse(localStorage.getItem(ACTIVE_ACCOUNT_STORAGE_KEY) || "null");
        return saved?.email ? saved : null;
    } catch {
        return null;
    }
}

function saveAccounts() {
    saveJson(ACCOUNTS_STORAGE_KEY, state.accounts);
}

function saveActiveAccount() {
    if (state.account && elements.rememberMe?.checked) {
        saveJson(ACTIVE_ACCOUNT_STORAGE_KEY, state.account);
    } else {
        localStorage.removeItem(ACTIVE_ACCOUNT_STORAGE_KEY);
    }
}

function normalizeEmail(email) {
    return String(email || "").trim().toLowerCase();
}

function renderAuthGate() {
    const isSignup = state.authMode === "signup";
    const hasAccount = Boolean(state.account?.email);
    state.loginStep = hasAccount && state.loginStep !== "auth" ? "room" : "auth";
    elements.body.classList.toggle("auth-signup", isSignup);
    elements.body.classList.toggle("auth-login", !isSignup);
    elements.body.classList.toggle("login-room-step", state.loginStep === "room");
    elements.authLoginTab.classList.toggle("active", !isSignup);
    elements.authSignupTab.classList.toggle("active", isSignup);
    const submitLabel = elements.authSubmitBtn.querySelector("span");
    const submitIcon = elements.authSubmitBtn.querySelector("i, svg");
    if (submitLabel) {
        submitLabel.textContent = isSignup ? "Create account" : "Login";
    }
    if (submitIcon) {
        submitIcon.dataset.lucide = isSignup ? "user-plus" : "log-in";
    }

    elements.roomLoginFields.classList.toggle("hidden", false);
    elements.activeAccountChip.textContent = hasAccount
        ? `Logged in as ${state.account.name} (${state.account.email})`
        : "";

    if (hasAccount) {
        elements.loginName.value = state.account.name;
        elements.loginEmail.value = state.account.email;
        elements.rememberMe.checked = Boolean(loadActiveAccount()?.email === state.account.email);
    }

    refreshIcons();
}

function setAuthMode(mode) {
    state.authMode = mode;
    state.loginStep = "auth";
    renderAuthGate();
}

function showAuthSlide() {
    state.account = null;
    state.loginStep = "auth";
    elements.loginPassword.value = "";
    saveActiveAccount();
    renderAuthGate();
}

async function submitAuth() {
    const email = normalizeEmail(elements.loginEmail.value);
    const password = elements.loginPassword.value.trim();
    const name = elements.loginName.value.trim();

    if (!email || !email.includes("@")) {
        showToast("Enter a valid email.");
        return;
    }

    if (!password || password.length < 6) {
        showToast("Password must be at least 6 characters.");
        return;
    }

    if (!supabaseClient) {
        submitAuthLocalFallback(email, password, name);
        return;
    }

    if (state.authMode === "signup") {
        if (!name) {
            showToast("Enter your full name.");
            return;
        }

        showToast("Creating your account...");
        const { data, error } = await supabaseClient.auth.signUp({
            email,
            password,
            options: { data: { full_name: name } }
        });

        if (error) {
            showToast(error.message || "Could not create account.");
            return;
        }

        if (!data.session) {
            showToast("Account created. Check your email to confirm, then log in.");
            state.authMode = "login";
            renderAuthGate();
            return;
        }

        state.account = { id: data.user.id, name, email, createdAt: Date.now() };
        state.loginStep = "room";
        renderAuthGate();
        showToast("Account created. Now choose room access.");
        return;
    }

    showToast("Logging in...");
    const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });

    if (error) {
        showToast(error.message || "No account found with this email and password.");
        return;
    }

    const fullName = data.user.user_metadata?.full_name || elements.loginName.value.trim() || email;
    state.account = { id: data.user.id, name: fullName, email, createdAt: Date.now() };
    state.loginStep = "room";
    renderAuthGate();
    showToast("Logged in. Choose room access.");
}

function submitAuthLocalFallback(email, password, name) {
    if (state.authMode === "signup") {
        if (!name) {
            showToast("Enter your full name.");
            return;
        }

        const existing = state.accounts.find((account) => account.email === email);
        if (existing) {
            showToast("Account already exists. Login instead.");
            state.authMode = "login";
            renderAuthGate();
            return;
        }

        state.account = { id: `account-${createId()}`, name, email, password, createdAt: Date.now() };
        state.accounts.push(state.account);
        saveAccounts();
        saveActiveAccount();
        state.loginStep = "room";
        renderAuthGate();
        showToast("Account created (demo mode). Now choose room access.");
        return;
    }

    const account = state.accounts.find((item) => item.email === email && item.password === password);
    if (!account) {
        showToast("No account found with this email and password.");
        return;
    }

    state.account = account;
    saveActiveAccount();
    state.loginStep = "room";
    renderAuthGate();
    showToast("Logged in (demo mode). Choose room access.");
}

function updateRoleCopy() {
    const isCr = state.role === "cr";
    elements.roleLabel.textContent = isCr ? "CR Panel" : "Student Board";
    elements.greetingTitle.textContent = isCr ? "CR Mission Control" : "Student Board";
    elements.greetingSub.textContent = isCr
        ? "Send verified updates to selected students, track attention, and keep confidential notices private."
        : `${state.activeStudent} sees personal announcements, CR Board posts from ${getActiveCollege()}, and can buy, sell, or use AI notes tools.`;
}

function completeLogin(role) {
    if (!state.account?.email) {
        showToast("Login or sign up first.");
        return;
    }

    elements.loginName.value = state.account.name;
    const room = ensureRoomForLogin(role);

    if (!room) {
        return;
    }

    const profile = role === "student"
        ? getApprovedStudentProfile(room.code)
        : createOrUpdateProfileFromLogin(role, room.code);

    if (!profile) {
        showToast("Enter your name, college, and room code first.");
        return;
    }

    setActiveProfileByName(profile.full_name);

    if (role === "cr" && state.activeProfile?.role !== "cr") {
        showToast("This profile is not marked as CR.");
        return;
    }

    state.role = role;
    state.isLoggedIn = true;
    state.inviteRoomMode = false;
    elements.studentSection.textContent = state.activeStudent;
    elements.body.classList.remove("login-active");
    elements.loginGate.classList.add("hidden");
    elements.loginCrPin.value = "";
    elements.noteCollege.value = getActiveCollege();
    elements.crPostCollege.value = getActiveCollege();
    elements.crPostBatch.value = getActiveBatch();
    render();
    scrollToSection(role === "cr" ? "crBoard" : "today");
    showToast(role === "cr" ? "CR Panel opened." : "Student Board opened.");
}

function clearLoginPersonalFields(keepRoomCode = true) {
    const roomCode = keepRoomCode ? elements.loginRoomCode.value : "";
    elements.loginName.value = state.account?.name || "";
    elements.loginCollege.value = "";
    elements.loginBatch.value = "";
    elements.loginCrPin.value = "";
    elements.loginStudent.value = "";
    elements.loginRoomCode.value = roomCode;
}

function ensureRoomForLogin(role) {
    const roomCode = normalizeRoomCode(elements.loginRoomCode.value);
    const college = elements.loginCollege.value.trim();
    const batch = elements.loginBatch.value.trim();
    const crPin = elements.loginCrPin.value.trim();

    if (!roomCode) {
        showToast("Enter room code first.");
        return null;
    }

    let room = state.rooms[roomCode];

    if (role === "student") {
        if (!room) {
            showToast("Room not found. Ask your CR for the room code.");
            return null;
        }

        const candidateName = getLoginCandidateName();
        if (!candidateName) {
            showToast("Enter your name to join this room.");
            return null;
        }

        const approvedStudent = findApprovedStudentProfile(roomCode, candidateName) ||
            createOrUpdateProfileFromLogin("student", roomCode);

        state.activeRoomCode = roomCode;
        elements.loginName.value = approvedStudent.full_name;
        elements.loginCollege.value = approvedStudent.college || room.college || "";
        elements.loginBatch.value = approvedStudent.batch || room.batch || "";
        return room;
    }

    if (!college && !room) {
        showToast("Enter college to create the CR room.");
        return null;
    }

    if (!crPin || crPin.length < 4) {
        showToast("Set or enter a CR PIN with at least 4 characters.");
        return null;
    }

    if (room && room.crPin !== crPin) {
        showToast("Wrong CR PIN for this room.");
        return null;
    }

    if (room && !isExistingRoomCr(roomCode)) {
        showToast("Only approved CRs for this room can open CR tools.");
        return null;
    }

    if (!room) {
        const creatorName = getLoginCandidateName();
        room = {
            code: roomCode,
            college,
            batch,
            crPin,
            crLocked: false,
            crNames: creatorName ? [creatorName] : [],
            createdAt: Date.now()
        };
        state.rooms[roomCode] = room;
    } else {
        room.college = college || room.college;
        room.batch = batch || room.batch;
        room.crPin = crPin;
        room.crNames = Array.isArray(room.crNames) ? room.crNames : getRoomCrProfiles(roomCode).map((profile) => profile.full_name);
    }

    state.activeRoomCode = roomCode;
    saveRooms();
    return room;
}

function createOrUpdateProfileFromLogin(role, roomCode = getActiveRoomCode()) {
    const typedName = getLoginCandidateName();
    const selectedName = elements.loginStudent.value;
    const fullName = typedName || selectedName;
    const college = elements.loginCollege.value.trim() || getActiveCollege() || "Your College";
    const batch = elements.loginBatch.value.trim() || getActiveBatch() || "";

    if (!fullName) {
        return null;
    }

    const existing = state.profiles.find((profile) =>
        normalizePersonName(profile.full_name) === normalizePersonName(fullName) &&
        getProfileRoomCode(profile) === roomCode
    );
    const profile = {
        id: existing?.id || `local-${createId()}`,
        full_name: fullName,
        role,
        college,
        batch,
        roomCode
    };

    if (existing) {
        Object.assign(existing, profile);
    } else {
        state.profiles.push(profile);
    }

    saveLocalProfiles();
    renderProfileSelectors();
    return profile;
}

function getLoginCandidateName() {
    return (state.account?.name || elements.loginName.value.trim() || elements.loginStudent.value || "").trim();
}

function normalizePersonName(name) {
    return String(name || "").trim().replace(/\s+/g, " ").toLowerCase();
}

function findApprovedStudentProfile(roomCode, name) {
    const normalizedName = normalizePersonName(name);
    return state.profiles.find((profile) =>
        profile.role === "student" &&
        getProfileRoomCode(profile) === roomCode &&
        normalizePersonName(profile.full_name) === normalizedName
    ) || null;
}

function getApprovedStudentProfile(roomCode = getActiveRoomCode()) {
    const candidateName = getLoginCandidateName();
    return candidateName ? findApprovedStudentProfile(roomCode, candidateName) : null;
}

function hydrateRoomFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const roomCode = normalizeRoomCode(params.get("room") || "");

    if (!roomCode) {
        return;
    }

    state.activeRoomCode = roomCode;
    state.inviteRoomMode = true;
    state.activeStudent = "";
    state.activeProfile = null;
    elements.loginRoomCode.value = roomCode;
    clearLoginPersonalFields(true);
}

function normalizeRoomCode(value) {
    return String(value || "")
        .trim()
        .toUpperCase()
        .replace(/\s+/g, "-")
        .replace(/[^A-Z0-9-]/g, "");
}

function getActiveRoomCode() {
    return normalizeRoomCode(state.activeRoomCode || elements?.loginRoomCode?.value || state.activeProfile?.roomCode || "");
}

function getProfileRoomCode(profile) {
    return normalizeRoomCode(profile?.roomCode || profile?.room_code || "");
}

function getActiveRoom() {
    const code = getActiveRoomCode();
    return code ? state.rooms[code] : null;
}

function isExistingRoomCr(roomCode) {
    const candidateName = getLoginCandidateName();
    const room = state.rooms[roomCode];

    if (!candidateName) {
        return false;
    }

    const normalizedCandidate = normalizePersonName(candidateName);
    const storedRoomCr = Array.isArray(room?.crNames) && room.crNames.some((name) =>
        normalizePersonName(name) === normalizedCandidate
    );
    const profileRoomCr = state.profiles.some((profile) =>
        profile.role === "cr" &&
        getProfileRoomCode(profile) === roomCode &&
        normalizePersonName(profile.full_name) === normalizedCandidate
    );

    return storedRoomCr || profileRoomCr;
}

function getRoomCrProfiles(roomCode = getActiveRoomCode()) {
    return state.profiles.filter((profile) => profile.role === "cr" && getProfileRoomCode(profile) === roomCode);
}

function renderRoomControls() {
    const roomCode = getActiveRoomCode();
    const room = getActiveRoom();
    elements.roomCodeLabel.textContent = roomCode || "No room";
    elements.freezeCrAccess.checked = Boolean(room?.crLocked);
    elements.copyRoomBtn.disabled = !roomCode;
}

function toggleCrFreeze() {
    const roomCode = getActiveRoomCode();
    const room = state.rooms[roomCode];

    if (!room) {
        elements.freezeCrAccess.checked = false;
        showToast("Create or open a CR room first.");
        return;
    }

    room.crLocked = elements.freezeCrAccess.checked;
    saveRooms();
    renderRoomControls();
    showToast(room.crLocked ? "CR access frozen for this room." : "CR access reopened for this room.");
}

function copyRoomInvite() {
    const roomCode = getActiveRoomCode();

    if (!roomCode) {
        showToast("Create or open a room first.");
        return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("room", roomCode);
    copyText(url.toString());
    showToast("Room invite link copied.");
}

function addManagedStudent(event) {
    event.preventDefault();
    addManagedMember("student");
}

function addManagedMember(role = "student") {
    const roomCode = getActiveRoomCode();
    const fullName = elements.managedStudentName.value.trim();
    const college = elements.managedStudentCollege.value.trim() || getActiveCollege();
    const batch = elements.managedStudentBatch.value.trim() || getActiveBatch();

    if (!roomCode || !state.rooms[roomCode]) {
        showToast("Open or create a CR room before adding students.");
        return;
    }

    if (!fullName) {
        showToast(role === "cr" ? "Enter the co-CR name first." : "Enter the student name first.");
        return;
    }

    const existing = state.profiles.find((profile) =>
        normalizePersonName(profile.full_name) === normalizePersonName(fullName) &&
        getProfileRoomCode(profile) === roomCode
    );

    if (role === "cr") {
        const crProfiles = getRoomCrProfiles(roomCode);
        const alreadyCr = existing?.role === "cr";
        const room = state.rooms[roomCode];
        room.crNames = Array.isArray(room.crNames) ? room.crNames : crProfiles.map((profile) => profile.full_name);

        if (!alreadyCr && room.crNames.length >= 2) {
            showToast("This room already has the maximum 2 CRs.");
            return;
        }
    }

    const profile = {
        id: existing?.id || `local-${createId()}`,
        full_name: fullName,
        role,
        college: college || "Your College",
        batch,
        roomCode
    };

    if (existing) {
        Object.assign(existing, profile);
    } else {
        state.profiles.push(profile);
    }

    saveLocalProfiles();
    if (role === "cr") {
        const room = state.rooms[roomCode];
        room.crNames = [...new Set([...(room.crNames || []), profile.full_name])].slice(0, 2);
        saveRooms();
    }
    elements.managedStudentName.value = "";
    elements.managedStudentCollege.value = college || "";
    elements.managedStudentBatch.value = batch || "";
    renderProfileSelectors();
    render();
    showToast(role === "cr" ? `${profile.full_name} added as co-CR.` : `${profile.full_name} added to your student list.`);
}

function renderStudentsList() {
    elements.studentsList.replaceChildren();
    const activeRoom = getActiveRoomCode();
    const crs = getRoomCrProfiles(activeRoom);
    const students = state.profiles.filter((profile) => profile.role === "student" && getProfileRoomCode(profile) === activeRoom);

    if (!students.length && !crs.length) {
        const empty = document.createElement("p");
        empty.className = "recipient-note";
        empty.textContent = "No students added yet. Add students here to target private announcements.";
        elements.studentsList.appendChild(empty);
        return;
    }

    crs
        .slice()
        .sort((a, b) => a.full_name.localeCompare(b.full_name))
        .forEach((profile) => {
            elements.studentsList.appendChild(createManagedProfileRow(profile, "CR"));
        });

    students
        .slice()
        .sort((a, b) => a.full_name.localeCompare(b.full_name))
        .forEach((profile) => {
            elements.studentsList.appendChild(createManagedProfileRow(profile, "Student"));
        });
}

function createManagedProfileRow(profile, badgeText) {
    const row = document.createElement("div");
    row.className = "student-row";
    row.classList.toggle("cr-row", badgeText === "CR");

    const info = document.createElement("div");
    const name = document.createElement("strong");
    name.textContent = profile.full_name;
    const meta = document.createElement("span");
    meta.textContent = [profile.college, profile.batch].filter(Boolean).join(" - ") || badgeText;
    info.append(name, meta);

    const badge = document.createElement("small");
    badge.textContent = badgeText;

    row.append(info, badge);
    return row;
}

function setActiveProfileByName(name) {
    if (!name) {
        state.activeStudent = "";
        state.activeProfile = null;
        return;
    }

    state.activeStudent = name;
    const activeRoom = getActiveRoomCode();
    const normalizedName = normalizePersonName(name);
    state.activeProfile = state.profiles.find((profile) =>
        normalizePersonName(profile.full_name) === normalizedName &&
        (!activeRoom || getProfileRoomCode(profile) === activeRoom)
    ) || null;

    if (state.activeProfile) {
        elements.loginName.value = state.activeProfile.full_name;
        elements.loginCollege.value = state.activeProfile.college || "";
        elements.loginBatch.value = state.activeProfile.batch || "";
        state.activeRoomCode = getProfileRoomCode(state.activeProfile) || state.activeRoomCode;
        elements.loginRoomCode.value = state.activeRoomCode;
    }
}

function openLoginGate() {
    closeProfileDrawer();
    state.isLoggedIn = false;
    state.role = "student";
    elements.body.dataset.role = state.role;
    state.inviteRoomMode = false;
    clearLoginPersonalFields(true);
    elements.loginGate.classList.remove("hidden");
    elements.body.classList.add("login-active");
    renderProfileSelectors();
    renderAuthGate();
    refreshIcons();
}

function renderStats() {
    const stats = getStats();
    elements.announcementCount.textContent = getAccessibleAnnouncements().length;
    elements.unreadCount.textContent = stats.unread;
    elements.urgentCount.textContent = stats.urgent;
    elements.responseCount.textContent = stats.responses;
    elements.notificationBubble.textContent = stats.unread;
    elements.activeStudents.textContent = STUDENT_TOTAL;
    elements.pulseStudents.textContent = STUDENT_TOTAL;
    elements.pulseNotes.textContent = state.notes.length;
    elements.pulseCrPosts.textContent = state.crPosts.length;
    elements.readRateHero.textContent = `${stats.readRate}%`;
}

function renderPriorityBoard() {
    const items = getAccessibleAnnouncements()
        .filter((item) => item.pinned || item.priority === "Urgent")
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || priorityWeight[b.priority] - priorityWeight[a.priority] || b.createdAt - a.createdAt)
        .slice(0, 4);

    elements.urgentList.replaceChildren();

    if (items.length === 0) {
        const empty = document.createElement("p");
        empty.className = "muted-copy";
        empty.textContent = "No urgent or pinned updates right now.";
        elements.urgentList.appendChild(empty);
        return;
    }

    items.forEach((item) => {
        const node = document.createElement("article");
        node.className = "priority-item";

        const icon = document.createElement("i");
        icon.dataset.lucide = item.priority === "Urgent" ? "siren" : "pin";

        const content = document.createElement("div");
        const title = document.createElement("h3");
        title.textContent = `${item.category} for ${formatAudience(item)}`;
        const message = document.createElement("p");
        message.textContent = item.message;
        content.append(title, message);

        const rate = document.createElement("strong");
        rate.textContent = `${getReadRate(item)}%`;

        node.append(icon, content, rate);
        elements.urgentList.appendChild(node);
    });
}

function renderPlanner() {
    const items = getAccessibleAnnouncements()
        .filter((item) => item.dueAt)
        .sort((a, b) => a.dueAt - b.dueAt)
        .slice(0, 6);

    elements.plannerList.replaceChildren();

    if (!items.length) {
        const empty = document.createElement("div");
        empty.className = "empty-state visible-empty planner-empty";
        empty.innerHTML = `<i data-lucide="calendar-check"></i><h3>No deadlines yet</h3><p>When a CR adds an announcement deadline, it will appear here automatically.</p>`;
        elements.plannerList.appendChild(empty);
        return;
    }

    items.forEach((item) => {
        const date = new Date(item.dueAt);
        const node = document.createElement("article");
        node.className = "timeline-block";
        node.innerHTML = `
            <div class="timeline-date">
                <span>${date.toLocaleDateString([], { month: "short" })}</span>
                <strong>${date.getDate()}</strong>
            </div>
            <div>
                <h3>${escapeHtml(item.category)} follow-up</h3>
                <p>${escapeHtml(item.message)}</p>
                <small>${date.toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</small>
            </div>
        `;
        elements.plannerList.appendChild(node);
    });
}

function renderFeed() {
    const announcements = getVisibleAnnouncements();
    elements.announcementList.replaceChildren();

    announcements.forEach((announcement) => {
        elements.announcementList.appendChild(createAnnouncementCard(announcement));
    });

    elements.emptyState.style.display = announcements.length ? "none" : "block";

    document.querySelectorAll(".feed-filter").forEach((button) => {
        button.classList.toggle("active", button.dataset.filter === state.feedFilter);
    });

    renderStats();
    renderPriorityBoard();
    renderInsights();
    refreshIcons();
}

function getVisibleAnnouncements() {
    return getAccessibleAnnouncements()
        .filter((announcement) => {
            const audienceLabel = formatAudience(announcement);
            const matchesSearch = !state.search || [
                announcement.message,
                audienceLabel,
                announcement.category,
                announcement.priority,
                announcement.author
            ].join(" ").toLowerCase().includes(state.search);

            const matchesCategory = state.categoryFilter === "All" || announcement.category === state.categoryFilter;
            const matchesAudience = isForActiveStudent(announcement);
            const matchesFilter =
                state.feedFilter === "all" ||
                (state.feedFilter === "mine" && matchesAudience) ||
                (state.feedFilter === "unread" && !isReadByActiveStudent(announcement)) ||
                (state.feedFilter === "pinned" && announcement.pinned) ||
                (state.feedFilter === "urgent" && announcement.priority === "Urgent");

            return matchesSearch && matchesCategory && matchesFilter;
        })
        .sort(sortAnnouncements);
}

function getAccessibleAnnouncements() {
    const activeRoom = getActiveRoomCode();
    const roomAnnouncements = state.announcements.filter((announcement) => !activeRoom || !announcement.roomCode || announcement.roomCode === activeRoom);

    if (state.role === "cr") {
        return roomAnnouncements;
    }

    return roomAnnouncements.filter(isForActiveStudent);
}

function sortAnnouncements(a, b) {
    if (state.sortMode === "priority") {
        return priorityWeight[b.priority] - priorityWeight[a.priority] || Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt;
    }

    if (state.sortMode === "readRate") {
        return getReadRate(b) - getReadRate(a);
    }

    return Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt;
}

function createAnnouncementCard(announcement) {
    const article = document.createElement("article");
    article.className = "announcement-card";
    article.dataset.category = announcement.category;
    article.dataset.priority = announcement.priority;
    article.classList.toggle("pinned", announcement.pinned);

    const header = document.createElement("div");
    header.className = "announcement-header";

    const titleArea = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = `${announcement.category} update`;
    const meta = document.createElement("div");
    meta.className = "announcement-meta";
    addTag(meta, `To ${formatAudience(announcement)}`);
    addTag(meta, announcement.priority, announcement.priority.toLowerCase());
    addTag(meta, announcement.author);
    addTag(meta, formatDate(announcement.createdAt));
    if (isConfidential(announcement)) {
        addTag(meta, "Confidential", "private");
    }
    if (announcement.dueAt) {
        addTag(meta, `Due ${formatDate(announcement.dueAt)}`);
    }
    if (announcement.pinned) {
        addTag(meta, "Pinned", "important");
    }
    if (!isReadByActiveStudent(announcement)) {
        addTag(meta, "Unread", "urgent");
    }
    titleArea.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "announcement-actions";
    actions.append(
        createActionButton(announcement.pinned ? "Unpin" : "Pin", announcement.pinned ? "pin-off" : "pin", () => togglePin(announcement.id), "cr-only"),
        createActionButton(isReadByActiveStudent(announcement) ? "Unread" : "Read", isReadByActiveStudent(announcement) ? "eye-off" : "eye", () => toggleRead(announcement.id)),
        createActionButton("Copy", "copy", () => copyAnnouncement(announcement)),
        createActionButton("Delete", "trash-2", () => deleteAnnouncement(announcement.id), "danger cr-only")
    );

    header.append(titleArea, actions);

    const message = document.createElement("p");
    message.className = "announcement-message";
    message.textContent = announcement.message;

    article.append(header, message);

    if (announcement.attachments.length) {
        const attachment = document.createElement("span");
        attachment.className = "attachment-pill";
        const icon = document.createElement("i");
        icon.dataset.lucide = "paperclip";
        const fileName = document.createElement("span");
        fileName.textContent = announcement.attachments[0];
        attachment.append(icon, fileName);
        article.appendChild(attachment);
    }

    article.appendChild(createReadProgress(announcement));

    if (announcement.requiresResponse) {
        const responses = document.createElement("div");
        responses.className = "response-row";
        responses.append(
            createResponseButton(announcement, "attending", "Attending", "check"),
            createResponseButton(announcement, "maybe", "Maybe", "circle-help"),
            createResponseButton(announcement, "declined", "Not Attending", "x")
        );
        article.appendChild(responses);
    }

    return article;
}

function createReadProgress(announcement) {
    const wrapper = document.createElement("div");
    wrapper.className = "progress-line";

    const label = document.createElement("div");
    label.className = "progress-label";
    const left = document.createElement("span");
    left.textContent = "Read coverage";
    const right = document.createElement("span");
    right.textContent = `${getReadCount(announcement)}/${getTargetTotal(announcement)} recipients`;
    label.append(left, right);

    const meter = document.createElement("div");
    meter.className = "meter";
    const bar = document.createElement("span");
    bar.style.width = `${getReadRate(announcement)}%`;
    meter.appendChild(bar);

    wrapper.append(label, meter);
    return wrapper;
}

function addTag(parent, text, type = "") {
    const tag = document.createElement("span");
    tag.className = type ? `tag ${type}` : "tag";
    tag.textContent = text;
    parent.appendChild(tag);
}

function createActionButton(label, icon, handler, modifier = "") {
    const button = document.createElement("button");
    button.type = "button";
    button.className = modifier ? `card-action ${modifier}` : "card-action";
    button.innerHTML = `<i data-lucide="${icon}"></i><span>${label}</span>`;
    button.addEventListener("click", handler);
    return button;
}

function createResponseButton(announcement, key, label, icon) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "response-button";
    button.classList.toggle("selected", getSelectedResponse(announcement) === key);
    button.innerHTML = `<i data-lucide="${icon}"></i><span>${label} (${announcement.responses[key]})</span>`;
    button.addEventListener("click", () => setResponse(announcement.id, key));
    return button;
}

function renderTemplates() {
    elements.templateChips.replaceChildren();

    templates.forEach((template) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "template-chip";
        button.innerHTML = `<i data-lucide="wand-sparkles"></i><span>${template.label}</span>`;
        button.addEventListener("click", () => applyTemplate(template));
        elements.templateChips.appendChild(button);
    });
}

function applyTemplate(template) {
    elements.message.value = template.message;
    elements.category.value = template.category;
    elements.priority.value = template.priority;
    setSelectedRecipients(template.recipients);
    updatePreview();
    showToast(`${template.label} template applied.`);
}

function createAnnouncement(event) {
    event.preventDefault();
    const message = elements.message.value.trim();

    if (!message) {
        showToast("Type the announcement before sending.");
        elements.message.focus();
        return;
    }

    const recipients = getSelectedRecipients();
    const fileNames = Array.from(elements.attachmentInput.files || []).map((file) => file.name);
    const dueAt = elements.dueDate.value ? new Date(elements.dueDate.value).getTime() : null;

    const announcement = {
        id: createId(),
        message,
        recipients,
        category: elements.category.value,
        priority: elements.priority.value,
        pinned: elements.pin.checked,
        requiresResponse: elements.requireResponse.checked,
        createdAt: Date.now(),
        dueAt,
        readCount: 0,
        responses: { attending: 0, maybe: 0, declined: 0 },
        selectedResponses: {},
        readBy: [],
        attachments: fileNames,
        author: state.role === "cr" ? "Class Representative" : "Student Desk",
        roomCode: getActiveRoomCode()
    };

    state.announcements.unshift(announcement);
    saveAnnouncements();
    resetForm();
    state.feedFilter = "all";
    render();
    showToast("Announcement sent to the feed.");
    scrollToSection("feed");
}

function resetForm() {
    elements.form.reset();
    setSelectedRecipients(["All"]);
    elements.requireResponse.checked = true;
    elements.attachmentName.textContent = "Attach document";
    setMinimumDueDate();
    updatePreview();
}

function updatePreview() {
    const message = elements.message.value.trim();
    const recipients = getSelectedRecipients();
    elements.charCount.textContent = `${elements.message.value.length}/280`;
    elements.previewAudience.textContent = `To ${formatRecipients(recipients)}`;
    elements.previewCategory.textContent = elements.category.value;
    elements.previewPriority.textContent = elements.priority.value;
    elements.previewMessage.textContent = message || "Your announcement preview will appear here as you type.";
    elements.previewCard.dataset.category = elements.category.value;
    elements.previewCard.dataset.priority = elements.priority.value;
    elements.toneHint.textContent = getToneHint(message);
}

function getSelectedRecipients() {
    const values = Array.from(elements.mention.selectedOptions).map((option) => option.value);

    if (!values.length || values.includes("All")) {
        return ["All"];
    }

    const names = values.filter((value) => sampleStudents.includes(value));
    return names.length ? names : ["All"];
}

function setSelectedRecipients(recipients = ["All"]) {
    const normalized = recipients.includes("All") ? ["All"] : recipients.filter((name) => sampleStudents.includes(name));
    const finalRecipients = normalized.length ? normalized : ["All"];

    Array.from(elements.mention.options).forEach((option) => {
        option.selected = finalRecipients.includes(option.value);
    });
    renderRecipientChips();
}

function normalizeRecipientSelection() {
    const selected = Array.from(elements.mention.selectedOptions).map((option) => option.value);

    if (selected.length > 1 && selected.includes("All")) {
        elements.mention.querySelector('option[value="All"]').selected = false;
    }

    if (!Array.from(elements.mention.selectedOptions).length) {
        setSelectedRecipients(["All"]);
    }

    renderRecipientChips();
}

function renderRecipientChips() {
    if (!elements.recipientChips) {
        return;
    }

    const selected = getSelectedRecipients();
    const recipients = ["All", ...sampleStudents];
    elements.recipientChips.replaceChildren();

    recipients.forEach((recipient) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "recipient-chip";
        button.classList.toggle("active", selected.includes(recipient));
        button.textContent = recipient === "All" ? "All Students" : recipient;
        button.addEventListener("click", () => toggleRecipientChip(recipient));
        elements.recipientChips.appendChild(button);
    });
}

function toggleRecipientChip(recipient) {
    if (recipient === "All") {
        setSelectedRecipients(["All"]);
        updatePreview();
        return;
    }

    let selected = getSelectedRecipients();

    if (selected.includes("All")) {
        selected = [];
    }

    if (selected.includes(recipient)) {
        selected = selected.filter((name) => name !== recipient);
    } else {
        selected.push(recipient);
    }

    setSelectedRecipients(selected.length ? selected : ["All"]);
    updatePreview();
}

function getToneHint(message) {
    if (!message) {
        return "Clear, direct, student friendly";
    }

    if (message.length < 40) {
        return "Add time, place, and action if needed";
    }

    if (elements.priority.value === "Urgent") {
        return "Urgent update ready";
    }

    return "Looks ready for students";
}

function updateAttachmentName() {
    const files = Array.from(elements.attachmentInput.files || []);
    if (!files.length) {
        elements.attachmentName.textContent = "Attach document";
        return;
    }

    elements.attachmentName.textContent = files.length === 1 ? files[0].name : `${files.length} files selected`;
}

async function uploadMarketplaceNote(event) {
    event.preventDefault();
    const file = elements.noteFile.files[0];

    if (!file) {
        showToast("Upload a PDF, image, or Word file first.");
        return;
    }

    const maxPrice = getSuggestedMaxPrice(file);
    const sellerPrice = clampPrice(Number(elements.notePrice.value), maxPrice);

    if (sellerPrice !== Number(elements.notePrice.value)) {
        elements.notePrice.value = sellerPrice;
        showToast(`Price adjusted to allowed range: ₹${MIN_NOTE_PRICE} - ₹${maxPrice}.`);
        return;
    }

    elements.noteAiStatus.textContent = "Generating AI summary, study plan, quiz, and deadlines...";

    try {
        const fileDataUrl = await readFileAsDataUrl(file);
        const input = {
            title: elements.noteTitle.value.trim(),
            subject: elements.noteSubject.value.trim(),
            college: elements.noteCollege.value.trim(),
            uploader: state.activeStudent,
            roomCode: getActiveRoomCode(),
            fileName: file.name
        };
        const ai = await generateNoteAI(input);
        const note = normalizeNote({
            id: createId(),
            ...input,
            rating: 4.7,
            price: sellerPrice,
            maxPrice,
            fileDataUrl,
            createdAt: Date.now(),
            ai
        });

        const savedNote = await saveNoteToBackend(note);
        if (savedNote) {
            note.id = savedNote.id;
        }

        state.notes.unshift(note);
        saveNotes();
        elements.notesUploadForm.reset();
        elements.noteCollege.value = getActiveCollege();
        elements.noteAiStatus.textContent = `Upload complete. The note is live in Browse Notes for ₹${sellerPrice}. AI unlock stays ₹${AI_FEATURE_PRICE}.`;
        renderNotesMarketplace();
        renderEarnings();
        showToast("Notes uploaded and AI pack generated.");
    } catch {
        elements.noteAiStatus.textContent = "Upload failed. Try a smaller file.";
        showToast("Could not upload notes.");
    }
}

async function saveNoteToBackend(note) {
    if (!supabaseClient || !state.activeProfile?.id) {
        return null;
    }

    const payload = {
        title: note.title,
        subject: note.subject,
        college: note.college,
        uploader_id: state.activeProfile.id,
        price: note.price,
        max_price: note.maxPrice,
        rating: note.rating,
        file_name: note.fileName,
        room_code: note.roomCode,
        ai_summary_points: note.ai.summary_points,
        ai_study_plan: note.ai.study_plan,
        ai_key_dates: note.ai.key_dates,
        ai_topics: note.ai.topics
    };
    const { data, error } = await supabaseClient.from("notes").insert(payload).select("id").single();
    return error ? null : data;
}

function readFileAsDataUrl(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function updatePriceHint() {
    const file = elements.noteFile.files[0];
    const maxPrice = file ? getSuggestedMaxPrice(file) : HARD_MAX_NOTE_PRICE;
    elements.notePrice.max = maxPrice;
    elements.notePrice.min = MIN_NOTE_PRICE;

    if (!elements.notePrice.value) {
        elements.notePrice.value = Math.min(maxPrice, 49);
    }

    elements.notePriceHint.textContent = file
        ? `Allowed seller price: Rs ${MIN_NOTE_PRICE} - Rs ${maxPrice}. Premium AI unlock remains Rs ${AI_FEATURE_PRICE}.`
        : `Set your note price after uploading a file. Premium AI unlock remains Rs ${AI_FEATURE_PRICE}.`;
    enforceSellerPriceLimit();
}

function enforceSellerPriceLimit() {
    const maxPrice = Number(elements.notePrice.max) || HARD_MAX_NOTE_PRICE;
    const rawPrice = Number(elements.notePrice.value);

    if (!rawPrice) {
        return;
    }

    const clamped = clampPrice(rawPrice, maxPrice);
    if (clamped !== rawPrice) {
        elements.notePrice.value = clamped;
    }
}

function getSuggestedMaxPrice(file) {
    const sizeMb = file.size / (1024 * 1024);
    const extension = file.name.split(".").pop().toLowerCase();
    let max = 29;

    if (sizeMb > 1) {
        max += 20;
    }

    if (sizeMb > 4) {
        max += 35;
    }

    if (sizeMb > 10) {
        max += 45;
    }

    if (["pdf", "doc", "docx"].includes(extension)) {
        max += 20;
    }

    return Math.min(HARD_MAX_NOTE_PRICE, Math.max(MIN_NOTE_PRICE, max));
}

function clampPrice(price, maxPrice) {
    return Math.min(Math.max(Math.round(price || MIN_NOTE_PRICE), MIN_NOTE_PRICE), maxPrice);
}

function hasAiToolAccess() {
    return Boolean(state.aiToolAccess[state.activeStudent]);
}

function renderAiTool() {
    const unlocked = hasAiToolAccess();
    elements.aiToolPayBtn.classList.toggle("hidden", unlocked);
    elements.aiToolForm.classList.toggle("locked", !unlocked);
    elements.aiToolStatus.textContent = unlocked
        ? "AI summarizer unlocked for this student. Upload or paste notes below."
        : "Unlock the AI summarizer for ₹20 to use this tool.";
}

async function startAiToolPayment() {
    if (hasAiToolAccess()) {
        renderAiTool();
        return;
    }

    const order = await createAiToolOrder();

    if (window.Razorpay && order && RAZORPAY_KEY_ID !== RAZORPAY_PLACEHOLDER_KEY) {
        const checkout = new Razorpay({
            key: RAZORPAY_KEY_ID,
            amount: AI_FEATURE_PRICE * 100,
            currency: "INR",
            name: "Campus One",
            description: "AI Notes Summarizer",
            order_id: order.id,
            prefill: { name: state.activeStudent },
            theme: { color: "#335cff" },
            handler: (response) => verifyAiToolPayment(response)
        });
        checkout.open();
        return;
    }

    const approved = window.confirm(`Demo payment mode: unlock AI Notes Summarizer for ₹${AI_FEATURE_PRICE}?`);
    if (approved) {
        completeAiToolPayment(`demo_${createId()}`);
    }
}

async function createAiToolOrder() {
    try {
        const response = await fetch(RAZORPAY_ORDER_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ amount: AI_FEATURE_PRICE * 100, currency: "INR", type: "personal_ai_summarizer" })
        });

        if (!response.ok) {
            throw new Error("Order endpoint unavailable");
        }

        return response.json();
    } catch {
        return null;
    }
}

function completeAiToolPayment(paymentId) {
    state.aiToolAccess[state.activeStudent] = {
        paid: true,
        amount: AI_FEATURE_PRICE,
        paymentId,
        paidAt: Date.now()
    };
    saveAiToolAccess();
    renderAiTool();
    showPremiumUnlockAnimation();
    showToast("AI Notes Summarizer unlocked.");
}

async function verifyAiToolPayment(response) {
    const verified = await verifyRazorpayPayment(response, {
        purchaseType: "personal_ai_summarizer",
        grossAmount: AI_FEATURE_PRICE
    });

    if (!verified) {
        showToast("Payment could not be verified.");
        return;
    }

    completeAiToolPayment(response.razorpay_payment_id || createId());
}

async function summarizePersonalNotes(event) {
    event.preventDefault();

    if (!hasAiToolAccess()) {
        showToast("Unlock AI Notes Summarizer first.");
        return;
    }

    const file = elements.aiToolFile.files[0];
    const pastedNotes = elements.aiToolText.value.trim();

    if (!file && !pastedNotes) {
        showToast("Upload a file or paste notes first.");
        return;
    }

    elements.aiToolStatus.textContent = "Reading your notes...";

    try {
        const extractedContent = pastedNotes || await extractTextFromAiFile(file);
        const input = {
            title: elements.aiToolTitle.value.trim(),
            subject: elements.aiToolSubject.value.trim(),
            college: getActiveCollege(),
            uploader: state.activeStudent,
            fileName: file?.name || "pasted-notes.txt",
            content: extractedContent
        };
        const ai = await generateNoteAI(input, elements.aiToolStatus);
        renderPersonalAiResult(ai, { title: input.title, subject: input.subject, content: extractedContent });
        saveAiHistoryEntry({ title: input.title, subject: input.subject, ai, content: extractedContent });
        renderAiHistoryBar();
        elements.aiToolStatus.textContent = "AI output ready.";
        showToast("AI summary generated.");
    } catch {
        elements.aiToolStatus.textContent = "Could not generate AI output. Try shorter notes.";
        showToast("AI summarizer failed.");
    }
}

const AI_HISTORY_KEY = "campusOneAiHistory";
const AI_HISTORY_LIMIT = 10;

function getAiHistoryStore() {
    try {
        const raw = localStorage.getItem(AI_HISTORY_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function setAiHistoryStore(list) {
    try {
        localStorage.setItem(AI_HISTORY_KEY, JSON.stringify(list.slice(0, AI_HISTORY_LIMIT)));
    } catch {
        /* storage unavailable, ignore */
    }
}

function saveAiHistoryEntry({ title, subject, ai, content }) {
    const entry = {
        id: createId(),
        title: title || "Untitled notes",
        subject: subject || "General",
        createdAt: Date.now(),
        content: String(content || "").slice(0, 12000),
        ai
    };
    const list = getAiHistoryStore();
    list.unshift(entry);
    setAiHistoryStore(list);
}

function deleteAiHistoryEntry(id) {
    setAiHistoryStore(getAiHistoryStore().filter((entry) => entry.id !== id));
    renderAiHistoryBar();
}

function renderAiHistoryBar() {
    if (!elements.aiHistoryBar) {
        return;
    }

    const history = getAiHistoryStore();

    if (!history.length) {
        elements.aiHistoryBar.innerHTML = "";
        elements.aiHistoryBar.classList.remove("has-items");
        return;
    }

    elements.aiHistoryBar.classList.add("has-items");
    elements.aiHistoryBar.innerHTML = `
        <div class="ai-history-label"><i data-lucide="history"></i><span>Previous summaries</span></div>
        <div class="ai-history-scroll">
            ${history.map((entry) => `
                <button type="button" class="ai-history-chip" data-history-id="${entry.id}">
                    <span class="ai-history-chip-title">${escapeHtml(entry.title)}</span>
                    <span class="ai-history-chip-meta">${escapeHtml(entry.subject)} · ${formatHistoryDate(entry.createdAt)}</span>
                    <span class="ai-history-chip-remove" data-history-remove="${entry.id}"><i data-lucide="x"></i></span>
                </button>
            `).join("")}
        </div>
    `;

    elements.aiHistoryBar.querySelectorAll("[data-history-id]").forEach((chip) => {
        chip.addEventListener("click", (event) => {
            if (event.target.closest("[data-history-remove]")) {
                return;
            }
            const entry = getAiHistoryStore().find((item) => item.id === chip.dataset.historyId);
            if (entry) {
                renderPersonalAiResult(entry.ai, { title: entry.title, subject: entry.subject, content: entry.content });
                elements.aiToolResult.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        });
    });

    elements.aiHistoryBar.querySelectorAll("[data-history-remove]").forEach((btn) => {
        btn.addEventListener("click", (event) => {
            event.stopPropagation();
            deleteAiHistoryEntry(btn.dataset.historyRemove);
        });
    });

    refreshIcons();
}

function formatHistoryDate(timestamp) {
    const date = new Date(timestamp);
    const today = new Date();
    const isToday = date.toDateString() === today.toDateString();
    if (isToday) {
        return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    }
    return date.toLocaleDateString([], { day: "numeric", month: "short" });
}

const IMPORTANCE_LABEL = { high: "High priority", medium: "Medium priority", low: "Lower priority" };
const TOPIC_PRIORITY_LABEL = { "high weightage": "High weightage", "needs practice": "Needs practice", "revision": "Quick revision" };

function closeSummaryPointPopup() {
    const existing = document.querySelector(".summary-point-popup");
    if (!existing) {
        return;
    }
    existing.classList.remove("show");
    window.setTimeout(() => existing.remove(), 180);
    document.removeEventListener("keydown", handleSummaryPointPopupKeydown);
}

function handleSummaryPointPopupKeydown(event) {
    if (event.key === "Escape") {
        closeSummaryPointPopup();
    }
}

function openSummaryPointPopup(point, importanceLabel, cardClassName) {
    closeSummaryPointPopup();

    const prioClass = (cardClassName || "").split(" ").find((cls) => cls.startsWith("prio-")) || "prio-amber";

    const popup = document.createElement("div");
    popup.className = "summary-point-popup";
    popup.innerHTML = `
        <div class="summary-point-popup-card ${prioClass}">
            <div class="summary-point-popup-head">
                <span class="summary-point-tag">${escapeHtml(importanceLabel || "Medium priority")}</span>
                <button type="button" class="summary-point-popup-close" aria-label="Close"><i data-lucide="x"></i></button>
            </div>
            <p>${escapeHtml(point || "")}</p>
        </div>
    `;

    popup.addEventListener("click", (event) => {
        if (event.target === popup) {
            closeSummaryPointPopup();
        }
    });
    popup.querySelector(".summary-point-popup-close").addEventListener("click", closeSummaryPointPopup);

    document.body.appendChild(popup);
    refreshIcons();
    window.setTimeout(() => popup.classList.add("show"), 10);
    document.addEventListener("keydown", handleSummaryPointPopupKeydown);
}

function renderPersonalAiResult(ai, options = {}) {
    const summaryPoints = ai.summary_points || [];
    const studyPlan = ai.study_plan || [];
    const keyDates = ai.key_dates || [];
    const topics = ai.topics || [];
    const rawContent = options.content || "";

    elements.aiToolResult.innerHTML = `
        <div class="premium-ai-report">
            <div class="ai-report-hero">
                <p class="eyebrow">Premium AI Study Pack</p>
                <h3>${escapeHtml(options.title || "Your Study Summary")}</h3>
                <p>Converted your notes into an ${summaryPoints.length}-point revision summary, a day-by-day study plan, key dates, and priority topics.</p>
            </div>

            <div class="summary-card-grid">
                ${summaryPoints.map((item) => `
                    <article class="summary-point-card ${PRIORITY_COLOR_CLASS[item.importance] || "prio-amber"}" tabindex="0" role="button" data-point="${escapeHtml(item.point)}" data-importance="${escapeHtml(IMPORTANCE_LABEL[item.importance] || "Medium priority")}">
                        <span class="summary-point-tag">${escapeHtml(IMPORTANCE_LABEL[item.importance] || "Medium priority")}</span>
                        <p>${escapeHtml(item.point)}</p>
                        <span class="summary-point-expand"><i data-lucide="maximize-2"></i>Tap to read full point</span>
                    </article>
                `).join("")}
            </div>

            <div class="study-plan-timeline">
                <h4><i data-lucide="calendar-check"></i> Day-by-Day Study Plan</h4>
                <div class="plan-day-list">
                    ${studyPlan.map((item) => `
                        <div class="plan-day-block">
                            <div class="plan-day-header">
                                <span class="plan-day-badge">Day ${escapeHtml(item.day)}</span>
                                <strong>${escapeHtml(item.focus)}</strong>
                                <span class="plan-minutes-chip"><i data-lucide="clock"></i>${escapeHtml(item.est_minutes)} min</span>
                            </div>
                            <ul class="plan-task-list">
                                ${(item.tasks || []).map((task) => `<li><i data-lucide="check-square"></i><span>${escapeHtml(task)}</span></li>`).join("")}
                            </ul>
                        </div>
                    `).join("")}
                </div>
            </div>

            ${keyDates.length ? `
            <div class="key-dates-strip">
                <h4><i data-lucide="flag"></i> Key Dates</h4>
                <div class="key-dates-scroll">
                    ${keyDates.map((item) => `
                        <div class="key-date-chip">
                            <strong>${escapeHtml(item.date)}</strong>
                            <span>${escapeHtml(item.description)}</span>
                        </div>
                    `).join("")}
                </div>
            </div>
            ` : ""}

            <div class="important-topics-card">
                <h4><i data-lucide="target"></i> Priority Topics</h4>
                <div class="topic-priority-grid">
                    ${topics.map((topic) => `
                        <span class="topic-priority-chip ${TOPIC_PRIORITY_COLOR_CLASS[topic.priority] || "prio-amber"}">
                            ${escapeHtml(topic.name)}
                            <em>${escapeHtml(TOPIC_PRIORITY_LABEL[topic.priority] || "Revision")}</em>
                        </span>
                    `).join("")}
                </div>
            </div>

            <div class="quiz-gate-card" id="quizGateCard">
                <div class="quiz-gate-copy">
                    <i data-lucide="badge-check"></i>
                    <div>
                        <strong>Done reading?</strong>
                        <p>Test yourself with a quick quiz built from these notes before you move on.</p>
                    </div>
                </div>
                <button type="button" class="primary-button quiz-gate-btn" id="quizGateBtn">
                    <i data-lucide="pencil-line"></i>
                    <span>Take the Quiz</span>
                </button>
            </div>
            <div class="quiz-zone" id="quizZone"></div>

            <div class="personalized-planner-card">
                <div class="personalized-planner-copy">
                    <p class="eyebrow">Fits your actual day</p>
                    <h4><i data-lucide="route"></i> Personalized Day Planner</h4>
                    <p>Tell us about your day — classes, free hours, energy levels, other commitments.</p>
                </div>
                <form id="dayPlannerForm" class="day-planner-form">
                    <textarea id="dayPlannerInput" rows="3" placeholder="e.g. Classes till 3pm, one free hour at 11, low energy in the evening..."></textarea>
                    <button type="submit" class="primary-button full-width" id="dayPlannerSubmitBtn">
                        <i data-lucide="sparkles"></i>
                        <span>Build My Personalized Plan</span>
                    </button>
                </form>
                <p class="recipient-note" id="dayPlannerStatus"></p>
                <div id="dayPlannerZone"></div>
            </div>
        </div>
    `;

    const gateBtn = document.getElementById("quizGateBtn");
    if (gateBtn) {
        gateBtn.addEventListener("click", () => startPersonalQuiz({ title: options.title, subject: options.subject, content: rawContent }));
    }

    elements.aiToolResult.querySelectorAll(".summary-point-card").forEach((card) => {
        const open = () => openSummaryPointPopup(card.dataset.point, card.dataset.importance, card.className);
        card.addEventListener("click", open);
        card.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                open();
            }
        });
    });

    const plannerForm = document.getElementById("dayPlannerForm");
    if (plannerForm) {
        plannerForm.addEventListener("submit", (event) => {
            event.preventDefault();
            generatePersonalizedPlan(topics, document.getElementById("dayPlannerInput").value.trim());
        });
    }

    refreshIcons();
}

async function startPersonalQuiz(context) {
    const zone = document.getElementById("quizZone");
    const gateCard = document.getElementById("quizGateCard");
    if (!zone) {
        return;
    }
    if (gateCard) {
        gateCard.style.display = "none";
    }

    zone.innerHTML = `<div class="ai-loading-card"><span class="ai-loading-spinner"></span><p>Building your quiz...</p></div>`;
    refreshIcons();

    let quiz;
    try {
        const response = await fetch(CLAUDE_QUIZ_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title: context.title, subject: context.subject, content: context.content })
        });
        if (!response.ok) {
            throw new Error("Quiz endpoint unavailable");
        }
        const data = await response.json();
        quiz = Array.isArray(data.questions) && data.questions.length ? data.questions : createDemoQuiz(context.content, context.title, context.subject).questions;
    } catch {
        quiz = createDemoQuiz(context.content, context.title, context.subject).questions;
    }

    const answers = new Array(quiz.length).fill(null);

    function renderQuestions() {
        zone.innerHTML = `
            <div class="quiz-taking-card">
                <div class="quiz-taking-header">
                    <h4>Quick Quiz</h4>
                    <span class="quiz-progress" id="quizProgress">0 / ${quiz.length} answered</span>
                </div>
                ${quiz.map((q, qIndex) => `
                    <div class="quiz-question-block" data-q="${qIndex}">
                        <p class="quiz-question-text">Q${qIndex + 1}. ${escapeHtml(q.question)}</p>
                        <div class="quiz-option-list" role="radiogroup">
                            ${q.options.map((option, oIndex) => `
                                <button type="button" class="quiz-option-btn" role="radio" aria-checked="false" data-q="${qIndex}" data-o="${oIndex}">
                                    <span class="quiz-option-letter">${String.fromCharCode(65 + oIndex)}</span>
                                    <span>${escapeHtml(option)}</span>
                                </button>
                            `).join("")}
                        </div>
                    </div>
                `).join("")}
                <button type="button" class="primary-button full-width quiz-submit-btn" id="quizSubmitBtn">
                    <i data-lucide="send"></i>
                    <span>Submit Quiz</span>
                </button>
            </div>
        `;

        zone.querySelectorAll(".quiz-option-btn").forEach((btn) => {
            btn.addEventListener("click", () => {
                const qIndex = Number(btn.dataset.q);
                const oIndex = Number(btn.dataset.o);
                answers[qIndex] = oIndex;

                zone.querySelectorAll(`.quiz-option-btn[data-q="${qIndex}"]`).forEach((sibling) => {
                    sibling.classList.remove("selected");
                    sibling.setAttribute("aria-checked", "false");
                });
                btn.classList.add("selected");
                btn.setAttribute("aria-checked", "true");

                const answeredCount = answers.filter((value) => value !== null).length;
                const progressEl = document.getElementById("quizProgress");
                if (progressEl) {
                    progressEl.textContent = `${answeredCount} / ${quiz.length} answered`;
                }
            });
        });

        document.getElementById("quizSubmitBtn")?.addEventListener("click", () => {
            const unanswered = answers.filter((value) => value === null).length;
            if (unanswered > 0 && !confirm(`${unanswered} question(s) left unanswered. Submit anyway?`)) {
                return;
            }
            renderResults();
        });

        refreshIcons();
    }

    function renderResults() {
        const results = quiz.map((q, index) => {
            const chosenIndex = answers[index];
            const isCorrect = chosenIndex === q.correct_index;
            return { q, chosenIndex, isCorrect };
        });

        const score = results.filter((result) => result.isCorrect).length;
        const total = quiz.length;
        const percent = Math.round((score / total) * 100);
        const performanceLabel = percent >= 80 ? "Excellent" : percent >= 60 ? "Good" : percent >= 40 ? "Needs work" : "Revise again";
        const verdictLine = percent >= 80
            ? "These notes are locked in — move on to the next topic."
            : percent >= 40
                ? "Solid attempt. Revisit the incorrect ones before your next session."
                : "Worth another read-through before you take this again.";

        zone.innerHTML = `
            <div class="quiz-results-card">
                <div class="quiz-score-ring" style="--score:${percent}">
                    <span class="quiz-score-value">${score}/${total}</span>
                    <span class="quiz-score-label">${performanceLabel}</span>
                </div>
                <p class="quiz-verdict-line">${escapeHtml(verdictLine)}</p>
                <div class="quiz-results-list">
                    ${results.map((result, index) => `
                        <div class="quiz-result-row ${result.isCorrect ? "correct" : "incorrect"}">
                            <i data-lucide="${result.isCorrect ? "check-circle-2" : "x-circle"}"></i>
                            <div>
                                <p class="quiz-result-question">Q${index + 1}. ${escapeHtml(result.q.question)}</p>
                                <p class="quiz-result-answer">Your answer: ${escapeHtml(result.chosenIndex === null ? "Not answered" : result.q.options[result.chosenIndex])}</p>
                                ${!result.isCorrect ? `<p class="quiz-result-correct">Correct answer: ${escapeHtml(result.q.options[result.q.correct_index])}</p>` : ""}
                                ${result.q.explanation ? `<p class="quiz-result-explanation">${escapeHtml(result.q.explanation)}</p>` : ""}
                            </div>
                        </div>
                    `).join("")}
                </div>
                <button type="button" class="ghost-button full-width" id="quizRetakeBtn">
                    <i data-lucide="rotate-ccw"></i>
                    <span>Retake Quiz</span>
                </button>
            </div>
        `;

        document.getElementById("quizRetakeBtn")?.addEventListener("click", () => {
            answers.fill(null);
            renderQuestions();
        });

        refreshIcons();
    }

    renderQuestions();
    zone.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

async function generatePersonalizedPlan(topics, dayText) {
    const zone = document.getElementById("dayPlannerZone");
    const statusEl = document.getElementById("dayPlannerStatus");
    if (!zone) {
        return;
    }

    if (!dayText) {
        if (statusEl) {
            statusEl.textContent = "Tell us about your day first — classes, free hours, energy levels.";
        }
        return;
    }

    if (statusEl) {
        statusEl.textContent = "";
    }
    zone.innerHTML = `<div class="ai-loading-card"><span class="ai-loading-spinner"></span><p>Mapping your day...</p></div>`;
    refreshIcons();

    let plan;
    try {
        const response = await fetch(CLAUDE_PLANNER_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ topics, dayText })
        });
        if (!response.ok) {
            throw new Error("Planner endpoint unavailable");
        }
        const data = await response.json();
        plan = Array.isArray(data.personalized_plan) && data.personalized_plan.length ? data : createDemoPlan(topics, dayText);
    } catch {
        plan = createDemoPlan(topics, dayText);
    }

    zone.innerHTML = `
        <div class="personalized-timeline">
            ${plan.personalized_plan.map((item, index) => `
                <div class="personalized-timeline-step">
                    <span class="personalized-timeline-dot">${index + 1}</span>
                    <div>
                        <strong>${escapeHtml(item.time_block)}</strong>
                        <p class="personalized-timeline-activity">${escapeHtml(item.activity)}</p>
                        <p class="personalized-timeline-reason">${escapeHtml(item.reason)}</p>
                    </div>
                </div>
            `).join("")}
            ${plan.note ? `<p class="personalized-timeline-note"><i data-lucide="lightbulb"></i>${escapeHtml(plan.note)}</p>` : ""}
        </div>
    `;
    refreshIcons();
    zone.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function showPremiumUnlockAnimation() {
    const overlay = document.createElement("div");
    overlay.className = "premium-unlock-overlay";
    overlay.innerHTML = `
        <div>
            <i data-lucide="sparkles"></i>
            <strong>Premium Unlocked</strong>
            <span>AI Notes Summarizer is ready</span>
        </div>
    `;
    document.body.appendChild(overlay);
    refreshIcons();
    window.setTimeout(() => overlay.classList.add("show"), 20);
    window.setTimeout(() => {
        overlay.classList.remove("show");
        window.setTimeout(() => overlay.remove(), 260);
    }, 1800);
}

async function generateNoteAI(input, statusElement = elements.noteAiStatus) {
    try {
        const response = await fetch(CLAUDE_NOTES_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input)
        });

        if (!response.ok) {
            throw new Error("Claude endpoint unavailable");
        }

        const data = await response.json();
        statusElement.textContent = "Claude AI output generated and stored.";
        return normalizeNoteAI(data, input.title, input.subject, input.fileName);
    } catch {
        statusElement.textContent = "AI output ready.";
        return createDemoNoteAI(input);
    }
}

async function extractTextFromAiFile(file) {
    if (!file) {
        return "";
    }

    const extension = file.name.split(".").pop().toLowerCase();

    if (["txt", "md", "csv"].includes(extension) || file.type.startsWith("text/")) {
        return file.text();
    }

    if (extension === "pdf" && window.pdfjsLib) {
        return extractPdfText(file);
    }

    return "";
}

async function extractPdfText(file) {
    const buffer = await file.arrayBuffer();
    window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const pdf = await window.pdfjsLib.getDocument({ data: buffer }).promise;
    const pages = [];

    for (let pageNumber = 1; pageNumber <= Math.min(pdf.numPages, 12); pageNumber += 1) {
        const page = await pdf.getPage(pageNumber);
        const content = await page.getTextContent();
        pages.push(content.items.map((item) => item.str).join(" "));
    }

    return pages.join("\n");
}

const DEMO_IMPORTANCE_CYCLE = ["high", "high", "medium", "medium", "medium", "low", "low", "low"];
const DEMO_PRIORITY_CYCLE = ["high weightage", "needs practice", "revision"];

// Client-side fallback used only if the /api/claude-notes call itself fails to reach the network.
function createDemoNoteAI(input = {}) {
    const cleanTitle = input.title || "Uploaded Notes";
    const cleanSubject = input.subject || "General Studies";
    const sourceText = normalizeStudyText(input.content || "");
    const sentences = splitStudySentences(sourceText);
    const keywords = extractStudyKeywords(sourceText, cleanSubject);
    const flowKeywords = keywords.length ? keywords : [cleanSubject, "Definitions", "Examples", "Formulas"];
    const ranked = sentences.length ? sentences.slice().sort((a, b) => scoreSentence(b, keywords) - scoreSentence(a, keywords)) : [];

    const summary_points = Array.from({ length: 8 }, (_, index) => {
        const sentence = ranked[index];
        const point = sentence
            ? (sentence.length > 190 ? `${sentence.slice(0, 187)}...` : sentence)
            : `${cleanTitle} highlights ${flowKeywords[index % flowKeywords.length]} as an important exam topic from ${input.fileName || "the provided notes"}.`;
        return { point, importance: DEMO_IMPORTANCE_CYCLE[index] };
    });

    const study_plan = [1, 2, 3, 4, 5].map((day) => {
        const focusWord = flowKeywords[(day - 1) % flowKeywords.length];
        return {
            day,
            focus: day === 1 ? `First read-through of ${cleanTitle}` : day === 5 ? "Timed revision test" : `Deep-dive: ${focusWord}`,
            tasks: day === 5
                ? ["Attempt a timed self-test", "Fix every wrong answer"]
                : [`Revise ${focusWord} with short handwritten notes`, "Solve 2-3 practice questions"],
            est_minutes: day === 1 ? 30 : day === 5 ? 60 : 45
        };
    });

    const key_dates = [
        { date: "Day 2", description: `Finish first revision pass of ${cleanTitle}.` },
        { date: "Day 4", description: "Complete weak-topic revision." },
        { date: "Day 5", description: "Finish timed practice test." }
    ];

    const topics = flowKeywords.slice(0, 6).map((name, index) => ({ name, priority: DEMO_PRIORITY_CYCLE[index % DEMO_PRIORITY_CYCLE.length] }));

    return { summary_points, study_plan, key_dates, topics };
}

// Client-side fallback used only if the /api/claude-quiz call fails to reach the network.
function createDemoQuiz(content, title, subject) {
    const sourceText = normalizeStudyText(content || "");
    const keywords = extractStudyKeywords(sourceText, subject);
    const topKeywords = keywords.length ? keywords : [subject || "General", "Definitions", "Examples", "Formulas"];
    const questions = Array.from({ length: 8 }, (_, index) => {
        const anchor = topKeywords[index % topKeywords.length];
        const distractors = topKeywords.filter((word) => word !== anchor).slice(0, 3);
        while (distractors.length < 3) {
            distractors.push(`Unrelated concept ${distractors.length + 1}`);
        }
        const correct_index = index % 4;
        const options = [...distractors];
        options.splice(correct_index, 0, anchor);
        return {
            id: `q${index + 1}`,
            question: `Which of these is a high-weightage topic in ${title || "these notes"}?`,
            options,
            correct_index,
            explanation: `${anchor} is a recurring, high-weightage term in ${title || "these notes"}.`
        };
    });
    return { questions };
}

// Client-side fallback used only if the /api/claude-planner call fails to reach the network.
function createDemoPlan(topics, dayText) {
    const ordered = Array.isArray(topics) && topics.length ? topics : [{ name: "Revision", priority: "revision" }];
    const slots = ["First free hour", "Gap between classes", "Evening after classes"];
    const personalized_plan = slots.map((time_block, index) => {
        const topic = ordered[index % ordered.length];
        return {
            time_block,
            activity: `Revise ${topic.name}`,
            reason: topic.priority === "high weightage" ? `${topic.name} is high weightage.` : `${topic.name} needs a focused pass.`
        };
    });
    return {
        personalized_plan,
        note: /busy|packed|exam/i.test(dayText || "") ? "Even 15-20 minutes on the top topic beats skipping it." : "Keep each block short and focused."
    };
}

function normalizeStudyText(text) {
    return String(text || "").replace(/\s+/g, " ").trim();
}

function splitStudySentences(text) {
    return normalizeStudyText(text)
        .split(/(?<=[.!?])\s+|\n+/)
        .map((sentence) => sentence.trim())
        .filter((sentence) => sentence.length > 28)
        .slice(0, 40);
}

function extractStudyKeywords(text, subject = "") {
    const stopWords = new Set("about above after again against also because before being between could every first from have into more most only other should their there these those through under using very which while with without your this that they them then than will were what when where".split(" "));
    const counts = new Map();
    normalizeStudyText(`${subject} ${text}`).toLowerCase().match(/[a-z][a-z0-9-]{3,}/g)?.forEach((word) => {
        if (stopWords.has(word)) {
            return;
        }
        counts.set(word, (counts.get(word) || 0) + 1);
    });
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([word]) => titleCase(word));
}

function scoreSentence(sentence, keywords) {
    const lower = sentence.toLowerCase();
    return keywords.reduce((score, keyword) => score + (lower.includes(keyword.toLowerCase()) ? 3 : 0), 0) + Math.min(sentence.length / 80, 3);
}

function titleCase(value) {
    return String(value || "").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderNotesMarketplace() {
    const activeRoom = getActiveRoomCode();
    const notes = state.notes.filter((note) => {
        const haystack = [note.title, note.subject, note.college, note.uploader].join(" ").toLowerCase();
        const matchesRoom = !activeRoom || !note.roomCode || note.roomCode === activeRoom;
        return matchesRoom && (!state.notesSearch || haystack.includes(state.notesSearch));
    });

    elements.notesList.replaceChildren();

    if (!notes.length) {
        const empty = document.createElement("div");
        empty.className = "empty-state visible-empty";
        empty.innerHTML = `<i data-lucide="notebook-tabs"></i><h3>No notes found</h3><p>Upload the first note pack for this marketplace.</p>`;
        elements.notesList.appendChild(empty);
        refreshIcons();
        return;
    }

    notes.forEach((note) => {
        elements.notesList.appendChild(createNoteCardV2(note));
    });
}

async function startNoteUnlock(noteId) {
    return startNotePurchase(noteId, "ai");
}

async function startNoteUnlockLegacy(noteId) {
    const note = state.notes.find((item) => item.id === noteId);
    if (!note) {
        return;
    }

    if (isNoteUnlocked(noteId)) {
        showToast("This note is already unlocked.");
        renderNotesMarketplace();
        return;
    }

    const order = await createRazorpayOrder(note);

    if (window.Razorpay && order && RAZORPAY_KEY_ID !== RAZORPAY_PLACEHOLDER_KEY) {
        const checkout = new Razorpay({
            key: RAZORPAY_KEY_ID,
            amount: NOTE_PRICE * 100,
            currency: "INR",
            name: "Campus One",
            description: note.title,
            order_id: order.id,
            prefill: { name: state.activeStudent },
            theme: { color: "#335cff" },
            handler: (response) => verifyAndCompleteNotePurchase(note, "ai", response)
        });
        checkout.open();
        return;
    }

    const approved = window.confirm("Demo payment mode: unlock this note for ₹20?");
    if (approved) {
        completeNotePurchase(note, `demo_${createId()}`);
    }
}

async function createRazorpayOrder(note) {
    return createRazorpayOrderV2(note, AI_FEATURE_PRICE, "ai");
}

async function createRazorpayOrderLegacy(note) {
    try {
        const response = await fetch(RAZORPAY_ORDER_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ noteId: note.id, amount: NOTE_PRICE * 100, currency: "INR" })
        });

        if (!response.ok) {
            throw new Error("Order endpoint unavailable");
        }

        return response.json();
    } catch {
        return null;
    }
}

function completeNotePurchase(note, paymentId) {
    return completeNotePurchaseV2(note, "ai", paymentId);
}

function completeNotePurchaseLegacy(note, paymentId) {
    const unlockedForUser = state.unlockedNotes[state.activeStudent] || [];

    if (!unlockedForUser.includes(note.id)) {
        state.unlockedNotes[state.activeStudent] = [...unlockedForUser, note.id];
        state.earnings.push({
            id: createId(),
            noteId: note.id,
            noteTitle: note.title,
            uploader: note.uploader,
            buyer: state.activeStudent,
            gross: NOTE_PRICE,
            uploaderEarned: UPLOADER_SHARE,
            platformEarned: PLATFORM_SHARE,
            paymentId,
            paidAt: Date.now()
        });
        saveUnlockedNotes();
        saveEarnings();
    }

    renderNotesMarketplace();
    renderEarnings();
    showToast("Note unlocked permanently for this user.");
}

function isNoteUnlocked(noteId) {
    return isNoteFileUnlocked(noteId) || isNoteAiUnlocked(noteId);
}

function renderEarnings() {
    const userEarnings = state.earnings.filter((entry) => entry.uploader === state.activeStudent);
    const total = userEarnings.reduce((sum, entry) => sum + entry.uploaderEarned, 0);
    elements.totalEarnings.textContent = `₹${total}`;
    elements.earningsList.replaceChildren();

    if (!userEarnings.length) {
        const empty = document.createElement("p");
        empty.className = "recipient-note";
        empty.textContent = "No paid unlocks yet.";
        elements.earningsList.appendChild(empty);
        return;
    }

    userEarnings.slice().reverse().forEach((entry) => {
        const row = document.createElement("div");
        row.className = "earning-row";
        row.innerHTML = `
            <span>${escapeHtml(entry.noteTitle)} bought by ${escapeHtml(entry.buyer)}</span>
            <strong>₹${entry.uploaderEarned}</strong>
        `;
        elements.earningsList.appendChild(row);
    });
}

function renderProfile() {
    const activeName = state.activeStudent || state.activeProfile?.full_name || "Not logged in";
    const activeRoom = getActiveRoomCode();
    const activeCollege = getActiveCollege();
    const activeBatch = getActiveBatch();
    const unlocks = getCurrentUserUnlocks();
    const uploadedNotes = state.notes.filter((note) => note.uploader === activeName && (!activeRoom || !note.roomCode || note.roomCode === activeRoom));
    const purchasedNotes = state.notes.filter((note) => unlocks.files.includes(note.id));
    const aiUnlockedNotes = state.notes.filter((note) => unlocks.ai.includes(note.id));
    const hasPersonalAi = hasAiToolAccess();
    const isPremium = hasPersonalAi || aiUnlockedNotes.length > 0;
    const accessibleAnnouncements = getAccessibleAnnouncements();
    const readCount = accessibleAnnouncements.filter(isReadByActiveStudent).length;
    const progress = accessibleAnnouncements.length ? Math.round((readCount / accessibleAnnouncements.length) * 100) : 0;

    elements.profileAvatar.textContent = getInitials(activeName);
    elements.profileNavAvatar.textContent = getInitials(activeName);
    elements.profilePlan.textContent = isPremium ? "Premium" : "Normal";
    elements.profileName.textContent = activeName;
    elements.profileMeta.textContent = [activeCollege, activeBatch].filter(Boolean).join(" - ") || "No college details yet";
    elements.profileRoom.textContent = activeRoom || "No room";
    elements.profileRole.textContent = state.role === "cr" ? "Class Representative" : "Student";
    elements.profileUploaded.textContent = uploadedNotes.length;
    elements.profilePurchased.textContent = purchasedNotes.length;
    elements.profileAiStatus.textContent = isPremium ? "Premium" : "Normal";
    elements.profileAiDetail.textContent = hasPersonalAi
        ? `AI summarizer unlocked. ${aiUnlockedNotes.length} AI note pack${aiUnlockedNotes.length === 1 ? "" : "s"} unlocked.`
        : aiUnlockedNotes.length
            ? `${aiUnlockedNotes.length} AI note pack${aiUnlockedNotes.length === 1 ? "" : "s"} unlocked.`
            : "AI summarizer not unlocked";
    elements.profileProgress.textContent = `${progress}%`;
    elements.profileProgressDetail.textContent = accessibleAnnouncements.length
        ? `${readCount}/${accessibleAnnouncements.length} announcements read`
        : "No announcements yet";

    renderProfileList(elements.profileUploadedList, uploadedNotes, "No notes uploaded yet.", (note) => `${note.title} - ₹${note.price}`);
    renderProfileList(elements.profilePurchasedList, purchasedNotes, "No purchased notes yet.", (note) => `${note.title} - ${note.subject}`);
    renderLoginInfo(activeName, activeRoom, activeCollege, activeBatch, isPremium);
}

function openProfileDrawer() {
    renderProfile();
    elements.profileSection.classList.add("open");
    elements.profileBackdrop.classList.add("open");
    elements.profileSection.setAttribute("aria-hidden", "false");
    refreshIcons();
}

function closeProfileDrawer() {
    elements.profileSection.classList.remove("open");
    elements.profileBackdrop.classList.remove("open");
    elements.profileSection.setAttribute("aria-hidden", "true");
}

async function logoutUser() {
    if (supabaseClient) {
        await supabaseClient.auth.signOut();
    }
    state.account = null;
    state.activeStudent = "";
    state.activeProfile = null;
    state.isLoggedIn = false;
    state.role = "student";
    state.loginStep = "auth";
    localStorage.removeItem(ACTIVE_ACCOUNT_STORAGE_KEY);
    elements.loginEmail.value = "";
    elements.loginPassword.value = "";
    elements.loginName.value = "";
    if (elements.rememberMe) {
        elements.rememberMe.checked = false;
    }
    closeProfileDrawer();
    elements.body.classList.add("login-active");
    elements.loginGate.classList.remove("hidden");
    renderAuthGate();
    render();
    showToast("Logged out.");
}

function renderProfileList(container, items, emptyText, formatter) {
    container.replaceChildren();

    if (!items.length) {
        const empty = document.createElement("p");
        empty.className = "recipient-note";
        empty.textContent = emptyText;
        container.appendChild(empty);
        return;
    }

    items.slice(0, 5).forEach((item) => {
        const row = document.createElement("div");
        row.className = "profile-list-row";
        row.innerHTML = `<span>${escapeHtml(formatter(item))}</span><small>${escapeHtml(formatDate(item.createdAt || Date.now()))}</small>`;
        container.appendChild(row);
    });
}

function renderLoginInfo(activeName, activeRoom, activeCollege, activeBatch, isPremium) {
    const info = [
        ["Name", activeName],
        ["Role", state.role === "cr" ? "CR" : "Student"],
        ["Plan", isPremium ? "Premium" : "Normal"],
        ["Room", activeRoom || "Not joined"],
        ["College", activeCollege],
        ["Batch", activeBatch || "Not set"]
    ];

    elements.profileLoginInfo.replaceChildren();
    info.forEach(([label, value]) => {
        const row = document.createElement("div");
        row.className = "profile-list-row";
        row.innerHTML = `<span>${escapeHtml(label)}</span><small>${escapeHtml(value || "Not set")}</small>`;
        elements.profileLoginInfo.appendChild(row);
    });
}

function getInitials(name) {
    const parts = String(name || "Campus One").trim().split(/\s+/).filter(Boolean);
    return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "CO";
}

function downloadNoteFile(note) {
    if (!note.fileDataUrl) {
        showToast("Demo seed note has no uploaded file attached.");
        return;
    }

    const link = document.createElement("a");
    link.href = note.fileDataUrl;
    link.download = note.fileName;
    link.click();
}

function createNoteCardV2(note) {
    const noteUnlocked = isNoteFileUnlocked(note.id);
    const aiUnlocked = isNoteAiUnlocked(note.id);
    const card = document.createElement("article");
    card.className = "note-card";

    const header = document.createElement("div");
    header.className = "note-card-top";
    header.innerHTML = `
        <div>
            <p class="eyebrow">${escapeHtml(note.subject)}</p>
            <h3>${escapeHtml(note.title)}</h3>
            <span>${escapeHtml(note.college)} - Uploaded by ${escapeHtml(note.uploader)}</span>
        </div>
        <strong>₹${note.price}</strong>
    `;

    const rating = document.createElement("div");
    rating.className = "rating-line";
    rating.innerHTML = `<i data-lucide="star"></i><span>${note.rating.toFixed(1)} rating</span>`;

    const teaser = document.createElement("ul");
    teaser.className = "note-teaser";
    (note.ai.summary_points || []).slice(0, 3).forEach((item) => {
        const el = document.createElement("li");
        el.textContent = item.point;
        teaser.appendChild(el);
    });

    const locked = document.createElement("div");
    locked.className = aiUnlocked ? "locked-content unlocked" : "locked-content";
    locked.appendChild(createNoteFullContentV2(note, aiUnlocked));

    const actions = document.createElement("div");
    actions.className = "note-actions";

    if (noteUnlocked) {
        const bought = document.createElement("span");
        bought.className = "unlock-status";
        bought.innerHTML = `<i data-lucide="badge-check"></i> Notes bought`;
        actions.appendChild(bought);
    } else {
        const buy = document.createElement("button");
        buy.type = "button";
        buy.className = "primary-button";
        buy.innerHTML = `<i data-lucide="file-lock-2"></i><span>Buy Notes ₹${note.price}</span>`;
        buy.addEventListener("click", () => startNotePurchase(note.id, "file"));
        actions.appendChild(buy);
    }

    if (aiUnlocked) {
        const ai = document.createElement("span");
        ai.className = "unlock-status";
        ai.innerHTML = `<i data-lucide="sparkles"></i> AI unlocked`;
        actions.appendChild(ai);
    } else {
        const aiBuy = document.createElement("button");
        aiBuy.type = "button";
        aiBuy.className = "ghost-button";
        aiBuy.innerHTML = `<i data-lucide="bot"></i><span>AI Chat/Summary ₹${AI_FEATURE_PRICE}</span>`;
        aiBuy.addEventListener("click", () => startNotePurchase(note.id, "ai"));
        actions.appendChild(aiBuy);
    }

    card.append(header, rating, teaser, locked, actions);
    return card;
}

function createNoteFullContentV2(note, aiUnlocked) {
    const wrapper = document.createElement("div");
    const lockedLabel = aiUnlocked ? "" : `<div class="lock-overlay"><i data-lucide="lock"></i><span>Unlock AI Chat/Summary for ₹${AI_FEATURE_PRICE}</span></div>`;

    wrapper.innerHTML = `
        ${lockedLabel}
        <div class="full-note-content">
            <h4>Full AI Summary</h4>
            <ol>${(note.ai.summary_points || []).map((item) => `<li>${escapeHtml(item.point)}</li>`).join("")}</ol>
            <h4>Day-by-Day Study Plan</h4>
            <ol>${(note.ai.study_plan || []).map((item) => `<li><strong>Day ${escapeHtml(item.day)}:</strong> ${escapeHtml(item.focus)}</li>`).join("")}</ol>
            <h4>Key Dates</h4>
            <ul>${(note.ai.key_dates || []).map((item) => `<li><strong>${escapeHtml(item.date)}:</strong> ${escapeHtml(item.description)}</li>`).join("")}</ul>
            <h4>Priority Topics</h4>
            <ul>${(note.ai.topics || []).map((topic) => `<li>${escapeHtml(topic.name)} — ${escapeHtml(topic.priority)}</li>`).join("")}</ul>
            <h4>AI Chatbot Prompt</h4>
            <p>Ask: "Explain ${escapeHtml(note.title)} in simple terms and quiz me topic by topic."</p>
        </div>
    `;

    if (isNoteFileUnlocked(note.id)) {
        const download = document.createElement("button");
        download.type = "button";
        download.className = "ghost-button";
        download.innerHTML = `<i data-lucide="download"></i><span>Download File</span>`;
        download.addEventListener("click", () => downloadNoteFile(note));
        wrapper.appendChild(download);
    }

    return wrapper;
}

async function startNotePurchase(noteId, type) {
    const note = state.notes.find((item) => item.id === noteId);
    if (!note) {
        return;
    }

    if ((type === "file" && isNoteFileUnlocked(noteId)) || (type === "ai" && isNoteAiUnlocked(noteId))) {
        showToast("Already unlocked for this student.");
        renderNotesMarketplace();
        return;
    }

    const amount = type === "file" ? note.price : AI_FEATURE_PRICE;
    const label = type === "file" ? "notes file" : "AI chatbot/summariser";
    const order = await createRazorpayOrderV2(note, amount, type);

    if (window.Razorpay && order && RAZORPAY_KEY_ID !== RAZORPAY_PLACEHOLDER_KEY) {
        const checkout = new Razorpay({
            key: RAZORPAY_KEY_ID,
            amount: amount * 100,
            currency: "INR",
            name: "Campus One",
            description: `${note.title} - ${label}`,
            order_id: order.id,
            prefill: { name: state.activeStudent },
            theme: { color: "#335cff" },
            handler: (response) => verifyAndCompleteNotePurchase(note, type, response)
        });
        checkout.open();
        return;
    }

    const approved = window.confirm(`Demo payment mode: unlock ${label} for ₹${amount}?`);
    if (approved) {
        completeNotePurchaseV2(note, type, `demo_${createId()}`);
    }
}

async function createRazorpayOrderV2(note, amount, type) {
    try {
        const response = await fetch(RAZORPAY_ORDER_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ noteId: note.id, amount: amount * 100, currency: "INR", type })
        });

        if (!response.ok) {
            throw new Error("Order endpoint unavailable");
        }

        return response.json();
    } catch {
        return null;
    }
}

async function verifyAndCompleteNotePurchase(note, type, response) {
    const verified = await verifyRazorpayPayment(response, {
        noteId: note.id,
        buyerId: state.activeProfile?.id || null,
        purchaseType: type,
        grossAmount: type === "file" ? note.price : AI_FEATURE_PRICE
    });

    if (!verified) {
        showToast("Payment could not be verified.");
        return;
    }

    completeNotePurchaseV2(note, type, response.razorpay_payment_id || createId());
}

async function verifyRazorpayPayment(response, purchase) {
    try {
        const verification = await fetch(RAZORPAY_VERIFY_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                purchase
            })
        });

        if (!verification.ok) {
            return false;
        }

        const data = await verification.json();
        return Boolean(data.verified);
    } catch {
        return false;
    }
}

function completeNotePurchaseV2(note, type, paymentId) {
    const unlocks = getCurrentUserUnlocks();
    const targetList = type === "file" ? unlocks.files : unlocks.ai;

    if (!targetList.includes(note.id)) {
        targetList.push(note.id);
        state.unlockedNotes[state.activeStudent] = unlocks;

        if (type === "file") {
            const uploaderEarned = Math.round(note.price * 0.7);
            state.earnings.push({
                id: createId(),
                noteId: note.id,
                noteTitle: note.title,
                uploader: note.uploader,
                buyer: state.activeStudent,
                gross: note.price,
                uploaderEarned,
                platformEarned: note.price - uploaderEarned,
                paymentId,
                paidAt: Date.now()
            });
            saveEarnings();
        }

        saveUnlockedNotes();
    }

    renderNotesMarketplace();
    renderEarnings();
    showToast(type === "file" ? "Notes bought permanently." : "AI chatbot/summariser unlocked.");
}

function getCurrentUserUnlocks() {
    const raw = state.unlockedNotes[state.activeStudent];

    if (Array.isArray(raw)) {
        return { files: [...raw], ai: [] };
    }

    return {
        files: Array.isArray(raw?.files) ? [...raw.files] : [],
        ai: Array.isArray(raw?.ai) ? [...raw.ai] : []
    };
}

function isNoteFileUnlocked(noteId) {
    return getCurrentUserUnlocks().files.includes(noteId);
}

function isNoteAiUnlocked(noteId) {
    return getCurrentUserUnlocks().ai.includes(noteId);
}

async function createCrBoardPost(event) {
    event.preventDefault();

    if (state.role !== "cr") {
        showToast("Only CR users can post on the CR Board.");
        return;
    }

    const file = elements.crPostFile.files[0];
    const fileDataUrl = file ? await readFileAsDataUrl(file) : "";
    const post = normalizeCrPost({
        id: createId(),
        title: elements.crPostTitle.value.trim(),
        body: elements.crPostBody.value.trim(),
        college: elements.crPostCollege.value.trim(),
        batch: elements.crPostBatch.value.trim(),
        fileName: file ? file.name : "",
        fileDataUrl,
        pinned: elements.crPostPinned.checked,
        author: "Class Representative",
        createdAt: Date.now(),
        roomCode: getActiveRoomCode()
    });

    const savedPost = await saveCrPostToBackend(post);
    if (savedPost) {
        post.id = savedPost.id;
    }

    state.crPosts.unshift(post);
    saveCrPosts();
    elements.crPostForm.reset();
    elements.crPostCollege.value = getActiveCollege();
    elements.crPostBatch.value = getActiveBatch();
    renderCrBoard();
    showToast("CR Board post published.");
}

async function saveCrPostToBackend(post) {
    if (!supabaseClient || !state.activeProfile?.id) {
        return null;
    }

    const payload = {
        title: post.title,
        body: post.body,
        college: post.college,
        batch: post.batch,
        file_name: post.fileName,
        pinned: post.pinned,
        author_id: state.activeProfile.id,
        room_code: post.roomCode
    };
    const { data, error } = await supabaseClient.from("cr_posts").insert(payload).select("id").single();
    return error ? null : data;
}

function renderCrBoard() {
    elements.studentCollegeLabel.textContent = state.role === "cr" ? "CR can view all colleges" : getActiveCollege();
    const activeRoom = getActiveRoomCode();
    const posts = state.crPosts
        .filter((post) => (!activeRoom || !post.roomCode || post.roomCode === activeRoom) && (state.role === "cr" || post.college === getActiveCollege()))
        .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.createdAt - a.createdAt);

    elements.crBoardList.replaceChildren();

    if (!posts.length) {
        const empty = document.createElement("div");
        empty.className = "empty-state visible-empty";
        empty.innerHTML = `<i data-lucide="clipboard-list"></i><h3>No CR posts yet</h3><p>Posts for ${escapeHtml(getActiveCollege())} will appear here.</p>`;
        elements.crBoardList.appendChild(empty);
        refreshIcons();
        return;
    }

    posts.forEach((post) => elements.crBoardList.appendChild(createCrPostCard(post)));
    refreshIcons();
}

function createCrPostCard(post) {
    const card = document.createElement("article");
    card.className = "announcement-card cr-board-card";
    card.classList.toggle("pinned", post.pinned);

    const header = document.createElement("div");
    header.className = "announcement-header";

    const titleArea = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = post.title;
    const meta = document.createElement("div");
    meta.className = "announcement-meta";
    addTag(meta, post.college);
    if (post.batch) {
        addTag(meta, post.batch);
    }
    addTag(meta, post.author);
    addTag(meta, formatDate(post.createdAt));
    if (post.pinned) {
        addTag(meta, "Pinned", "important");
    }
    titleArea.append(title, meta);

    const actions = document.createElement("div");
    actions.className = "announcement-actions";
    if (post.fileDataUrl) {
        actions.appendChild(createActionButton("File", "download", () => downloadCrFile(post)));
    }
    actions.appendChild(createActionButton("Copy", "copy", () => copyText(`${post.title}: ${post.body}`)));
    header.append(titleArea, actions);

    const body = document.createElement("p");
    body.className = "announcement-message";
    body.textContent = post.body;

    card.append(header, body);

    if (post.fileName) {
        const attachment = document.createElement("span");
        attachment.className = "attachment-pill";
        const icon = document.createElement("i");
        icon.dataset.lucide = "paperclip";
        const name = document.createElement("span");
        name.textContent = post.fileName;
        attachment.append(icon, name);
        card.appendChild(attachment);
    }

    return card;
}

function downloadCrFile(post) {
    if (!post.fileDataUrl) {
        showToast("No file attached.");
        return;
    }

    const link = document.createElement("a");
    link.href = post.fileDataUrl;
    link.download = post.fileName;
    link.click();
}

function getActiveCollege() {
    return state.activeProfile?.college || elements?.loginCollege?.value?.trim() || "Your College";
}

function getActiveBatch() {
    return state.activeProfile?.batch || elements?.loginBatch?.value?.trim() || "";
}

function setMinimumDueDate() {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    elements.dueDate.min = now.toISOString().slice(0, 16);
}

function setResponse(id, key) {
    const announcement = findAnnouncement(id);
    const selectedResponse = getSelectedResponse(announcement);

    if (!announcement || selectedResponse === key) {
        return;
    }

    if (selectedResponse) {
        announcement.responses[selectedResponse] = Math.max(0, announcement.responses[selectedResponse] - 1);
    }

    announcement.responses[key] += 1;
    announcement.selectedResponses = announcement.selectedResponses || {};
    announcement.selectedResponses[state.activeStudent] = key;

    if (!isReadByActiveStudent(announcement)) {
        markRead(announcement);
    }

    saveAnnouncements();
    render();
}

function togglePin(id) {
    const announcement = findAnnouncement(id);
    if (!announcement) {
        return;
    }

    announcement.pinned = !announcement.pinned;
    saveAnnouncements();
    render();
    showToast(announcement.pinned ? "Pinned to the top." : "Removed from pinned updates.");
}

function toggleRead(id) {
    const announcement = findAnnouncement(id);
    if (!announcement) {
        return;
    }

    if (isReadByActiveStudent(announcement)) {
        announcement.readBy = (announcement.readBy || []).filter((name) => name !== state.activeStudent);
        announcement.readCount = getReadCount(announcement);
    } else {
        markRead(announcement);
    }

    saveAnnouncements();
    render();
}

function markRead(announcement) {
    announcement.readBy = announcement.readBy || [];

    if (!announcement.readBy.includes(state.activeStudent)) {
        announcement.readBy.push(state.activeStudent);
    }

    announcement.readCount = getReadCount(announcement);
}

async function copyAnnouncement(announcement) {
    const text = `${announcement.category} | ${announcement.priority} | To ${formatAudience(announcement)}: ${announcement.message}`;
    copyText(text);
}

async function copyText(text) {
    try {
        if (navigator.clipboard) {
            await navigator.clipboard.writeText(text);
        } else {
            throw new Error("Clipboard unavailable");
        }
        showToast("Announcement copied.");
    } catch {
        const helper = document.createElement("textarea");
        helper.value = text;
        document.body.appendChild(helper);
        helper.select();
        document.execCommand("copy");
        helper.remove();
        showToast("Announcement copied.");
    }
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function deleteAnnouncement(id) {
    state.announcements = state.announcements.filter((announcement) => announcement.id !== id);
    saveAnnouncements();
    render();
    showToast("Announcement deleted.");
}

function clearFeed() {
    if (!state.announcements.length) {
        showToast("The feed is already clear.");
        return;
    }

    const approved = window.confirm("Clear all announcements from this browser?");
    if (!approved) {
        return;
    }

    state.announcements = [];
    saveAnnouncements();
    render();
    showToast("Announcement feed cleared.");
}

function toggleRole() {
    openLoginGate();
    showToast("Log in again to change access level.");
}

function getStats() {
    const accessible = getAccessibleAnnouncements();
    const unread = accessible.filter((item) => !isReadByActiveStudent(item)).length;
    const urgent = accessible.filter((item) => item.priority === "Urgent").length;
    const responses = accessible.reduce((sum, item) => sum + item.responses.attending + item.responses.maybe + item.responses.declined, 0);
    const readTotal = accessible.reduce((sum, item) => sum + getReadCount(item), 0);
    const possibleReads = accessible.reduce((sum, item) => sum + getTargetTotal(item), 0);
    const readRate = possibleReads ? Math.round((readTotal / possibleReads) * 100) : 0;
    const engagement = possibleReads ? Math.round((responses / possibleReads) * 100) : 0;
    const risk = Math.max(0, 100 - readRate);

    return { unread, urgent, responses, readRate, engagement, risk };
}

function renderInsights() {
    const stats = getStats();
    elements.readRateMetric.textContent = `${stats.readRate}%`;
    elements.engagementMetric.textContent = `${stats.engagement}%`;
    elements.riskMetric.textContent = stats.risk > 45 ? "High" : stats.risk > 25 ? "Watch" : "Low";
    elements.readRateBar.style.width = `${stats.readRate}%`;
    elements.engagementBar.style.width = `${Math.min(100, stats.engagement * 3)}%`;
    elements.riskBar.style.width = `${stats.risk}%`;
}

function getReadRate(announcement) {
    const targetTotal = getTargetTotal(announcement);
    return targetTotal ? Math.min(100, Math.round((getReadCount(announcement) / targetTotal) * 100)) : 0;
}

function getReadCount(announcement) {
    if (Array.isArray(announcement.readBy)) {
        return announcement.readBy.filter((name) => getRecipients(announcement).includes("All") || getRecipients(announcement).includes(name)).length;
    }

    return Math.min(Number(announcement.readCount) || 0, getTargetTotal(announcement));
}

function getTargetTotal(announcement) {
    const recipients = getRecipients(announcement);
    return recipients.includes("All") ? STUDENT_TOTAL : recipients.length;
}

function getRecipients(announcement) {
    return Array.isArray(announcement.recipients) && announcement.recipients.length ? announcement.recipients : ["All"];
}

function formatAudience(announcement) {
    return formatRecipients(getRecipients(announcement));
}

function formatRecipients(recipients) {
    return recipients.includes("All") ? "All Students" : recipients.join(", ");
}

function isConfidential(announcement) {
    return !getRecipients(announcement).includes("All");
}

function isForActiveStudent(announcement) {
    const recipients = getRecipients(announcement);
    return recipients.includes("All") || recipients.includes(state.activeStudent);
}

function isReadByActiveStudent(announcement) {
    return Array.isArray(announcement.readBy) && announcement.readBy.includes(state.activeStudent);
}

function getSelectedResponse(announcement) {
    if (!announcement) {
        return "";
    }

    if (announcement.selectedResponses && announcement.selectedResponses[state.activeStudent]) {
        return announcement.selectedResponses[state.activeStudent];
    }

    return state.role === "cr" ? announcement.selectedResponse || "" : "";
}

function findAnnouncement(id) {
    return state.announcements.find((announcement) => announcement.id === id);
}

function scrollToSection(id) {
    const section = document.getElementById(id);
    if (!section) {
        return;
    }

    section.scrollIntoView({ behavior: "smooth", block: "start" });
}

function updateScrollTopButton() {
    elements.scrollTopBtn.classList.toggle("visible", window.scrollY > 520);
}

function setupScrollSpy() {
    if (!("IntersectionObserver" in window)) {
        return;
    }

    const sections = document.querySelectorAll(".app-section[id]:not(#profile)");
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (!entry.isIntersecting) {
                return;
            }

            document.querySelectorAll(".nav-tab").forEach((button) => {
                button.classList.toggle("active", button.dataset.scrollTarget === entry.target.id);
            });
        });
    }, { rootMargin: "-42% 0px -50% 0px", threshold: 0.01 });

    sections.forEach((section) => observer.observe(section));
}

function formatDate(timestamp) {
    return new Intl.DateTimeFormat(undefined, {
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit"
    }).format(timestamp);
}

function createId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
        return window.crypto.randomUUID();
    }

    return `campus-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

let toastTimer;

function showToast(message) {
    clearTimeout(toastTimer);
    elements.toast.textContent = message;
    elements.toast.classList.add("show");
    toastTimer = window.setTimeout(() => {
        elements.toast.classList.remove("show");
    }, 2400);
}

function refreshIcons() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
}


/* ---------------- AI Help Chatbot (free for everyone) ---------------- */

const HELP_CHAT_HISTORY_KEY = "campus-one-help-chat-v1";
const HELP_CHAT_HISTORY_LIMIT = 20;
let helpChatOpen = false;
let helpChatBusy = false;

function getHelpChatHistory() {
    try {
        const raw = localStorage.getItem(HELP_CHAT_HISTORY_KEY);
        const parsed = raw ? JSON.parse(raw) : [];
        return Array.isArray(parsed) ? parsed : [];
    } catch {
        return [];
    }
}

function setHelpChatHistory(list) {
    try {
        localStorage.setItem(HELP_CHAT_HISTORY_KEY, JSON.stringify(list.slice(-HELP_CHAT_HISTORY_LIMIT)));
    } catch {
        /* storage unavailable, ignore */
    }
}

function toggleHelpChat() {
    setHelpChatOpen(!helpChatOpen);
}

function setHelpChatOpen(open) {
    helpChatOpen = open;
    if (!elements.helpChatPanel) {
        return;
    }
    elements.helpChatPanel.classList.toggle("open", open);
    elements.helpChatLauncher?.classList.toggle("active", open);
    if (open) {
        elements.helpChatInput?.focus();
        elements.helpChatMessages.scrollTop = elements.helpChatMessages.scrollHeight;
    }
}

function renderHelpChatHistory() {
    if (!elements.helpChatMessages) {
        return;
    }
    const history = getHelpChatHistory();
    if (!history.length) {
        elements.helpChatMessages.innerHTML = `
            <div class="help-chat-bubble assistant">
                <p>Hi! I'm the Campus One Help Assistant. Ask me about room codes, the CR Board, notes marketplace, or how any feature works.</p>
            </div>
        `;
        return;
    }
    elements.helpChatMessages.innerHTML = history.map(renderHelpChatBubble).join("");
    refreshIcons();
}

function renderHelpChatBubble(turn) {
    return `<div class="help-chat-bubble ${turn.role === "user" ? "user" : "assistant"}"><p>${escapeHtml(turn.content)}</p></div>`;
}

async function submitHelpChatMessage(event) {
    event.preventDefault();
    if (helpChatBusy) {
        return;
    }
    const message = elements.helpChatInput.value.trim();
    if (!message) {
        return;
    }

    const history = getHelpChatHistory();
    history.push({ role: "user", content: message });
    setHelpChatHistory(history);
    elements.helpChatInput.value = "";
    renderHelpChatHistory();
    showHelpChatTyping(true);
    helpChatBusy = true;

    try {
        const response = await fetch(CLAUDE_CHAT_ENDPOINT, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, history: history.slice(-6) })
        });
        const data = response.ok ? await response.json() : null;
        const reply = data?.reply || "I can help with room codes, the CR Board, notes marketplace, and general navigation.";
        const updated = getHelpChatHistory();
        updated.push({ role: "assistant", content: reply });
        setHelpChatHistory(updated);
    } catch {
        const updated = getHelpChatHistory();
        updated.push({ role: "assistant", content: "I couldn't reach the help service just now. Please try again in a moment." });
        setHelpChatHistory(updated);
    } finally {
        helpChatBusy = false;
        showHelpChatTyping(false);
        renderHelpChatHistory();
        elements.helpChatMessages.scrollTop = elements.helpChatMessages.scrollHeight;
    }
}

function showHelpChatTyping(show) {
    if (!elements.helpChatMessages) {
        return;
    }
    let indicator = document.getElementById("helpChatTyping");
    if (show) {
        if (!indicator) {
            indicator = document.createElement("div");
            indicator.id = "helpChatTyping";
            indicator.className = "help-chat-bubble assistant help-chat-typing";
            indicator.innerHTML = "<span></span><span></span><span></span>";
            elements.helpChatMessages.appendChild(indicator);
        }
        elements.helpChatMessages.scrollTop = elements.helpChatMessages.scrollHeight;
    } else if (indicator) {
        indicator.remove();
    }
}

if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
    window.addEventListener("load", () => {
        navigator.serviceWorker.register("./sw.js").catch(() => {
            // Service worker requires HTTPS or localhost after deployment.
        });
    });
}
